// COMPLETE Yandex Cloud Function for Yandex Disk Gallery
// 100% feature parity with cloudflare-worker-yandex-final.js

const https = require('https');
const { URL } = require('url');

const YANDEX_API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources';
const PUBLIC_LINK = 'https://disk.yandex.ru/d/sab0EP9Sm3G8LA';

// CORS headers - EXACT SAME as Cloudflare Worker
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300'
};

// Helper function to extract date from folder name (YYYY-MM-DD format)
function extractDateFromFolderName(name) {
  const dateMatch = name.match(/^(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : null;
}

// Replace preview size in Yandex preview URL
function replacePreviewSize(previewUrl, size) {
  if (!previewUrl) return previewUrl;
  if (previewUrl.includes('size=')) {
    return previewUrl.replace(/size=[^&]*/, `size=${size}`);
  }
  const separator = previewUrl.includes('?') ? '&' : '?';
  return `${previewUrl}${separator}size=${size}`;
}

// Make sized variants from a direct preview URL
function withSize(directPreviewUrl, size) {
  if (!directPreviewUrl) return directPreviewUrl;
  const has = directPreviewUrl.includes('size=');
  if (has) {
    return directPreviewUrl.replace(/size=[^&]*/i, `size=${size}`);
  }
  const sep = directPreviewUrl.includes('?') ? '&' : '?';
  return `${directPreviewUrl}${sep}size=${size}`;
}

// Wrap Yandex preview URL with our proxy
function proxify(url, functionUrl) {
  if (!url) return url;
  // Use the current function's URL as base
  const base = functionUrl || '';
  return `${base}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

// Make HTTPS request helper
async function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      if (options.binary) {
        // For binary data (images, videos)
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks)
          });
        });
      } else {
        // For JSON/text data
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve(data);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// List only date-named folders at root (with pagination)
async function listDateFolders(publicKey) {
  const url = new URL(YANDEX_API_BASE);
  url.searchParams.append('public_key', publicKey);
  url.searchParams.append('limit', '200');
  let offset = 0;
  const items = [];
  
  while (true) {
    url.searchParams.set('offset', String(offset));
    try {
      const data = await httpsRequest(url.toString());
      const pageItems = data._embedded?.items || [];
      items.push(...pageItems);
      if (pageItems.length < 200) break;
      offset += 200;
      if (offset > 2000) break;
    } catch (e) {
      break;
    }
  }
  
  const folders = items.filter((it) => it.type === 'dir' && /^\d{4}-\d{2}-\d{2}/.test(it.name));
  folders.sort((a, b) => b.name.localeCompare(a.name));
  return folders.map((f) => ({
    date: (f.name.match(/^\d{4}-\d{2}-\d{2}/) || [null])[0],
    name: f.name,
    path: f.path
  }));
}

// Fetch all images recursively from a folder path (with pagination and depth control)
async function fetchAllImagesForFolder(publicKey, startPath, inferredDate, maxDepth = 6, functionUrl) {
  const results = [];
  const queue = [{ path: startPath, depth: 0 }];
  
  while (queue.length) {
    const { path, depth } = queue.shift();
    if (depth > maxDepth) continue;
    let offset = 0;
    const limit = 200;
    
    while (true) {
      const url = new URL(YANDEX_API_BASE);
      url.searchParams.append('public_key', publicKey);
      if (path && path !== '/') url.searchParams.append('path', path);
      url.searchParams.append('limit', String(limit));
      url.searchParams.append('offset', String(offset));
      url.searchParams.append('preview_size', 'XL');
      
      try {
        const data = await httpsRequest(url.toString());
        const items = data._embedded?.items || [];
        
        for (const item of items) {
          if (item.type === 'dir') {
            queue.push({ path: item.path, depth: depth + 1 });
          } else if (item.type === 'file' && item.mime_type && item.mime_type.startsWith('image/')) {
            if (item.preview) {
              const direct = item.preview;
              const thumb = proxify(withSize(direct, 'M'), functionUrl);
              const src = proxify(withSize(direct, 'XL'), functionUrl);
              const fullSrc = proxify(withSize(direct, 'XXXL'), functionUrl);
              
              results.push({
                id: `yd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                src,
                thumbnailSrc: thumb,
                fullSrc,
                originalUrl: direct,
                filename: item.name,
                title: item.name.replace(/\.[^/.]+$/, ''),
                date: inferredDate || extractDateFromFolderName(item.path?.split('/')?.[1] || ''),
                size: item.size,
                width: item.preview_size || 0,
                height: item.preview_size || 0,
                name: item.name,
                path: item.path,
                mimeType: item.mime_type
              });
            }
          }
        }
        
        if (items.length < limit) break;
        offset += limit;
        if (offset > 5000) break;
      } catch (e) {
        break;
      }
    }
  }
  
  return results;
}

// Recursive function to fetch photos from nested folders - EXACT COPY FROM CLOUDFLARE
async function fetchPhotosFromFolder(publicKey, path = '', folderInfo = {}, depth = 0, functionUrl) {
  if (depth > 2) {
    console.warn('Max recursion depth reached');
    return [];
  }

  const photos = [];
  
  try {
    const url = new URL(YANDEX_API_BASE);
    url.searchParams.append('public_key', publicKey);
    
    if (path && path !== '/') {
      url.searchParams.append('path', path);
    }
    
    url.searchParams.append('limit', '200');
    url.searchParams.append('preview_size', 'XL');
    url.searchParams.append('fields', '_embedded.items');
    
    console.log(`Fetching from: ${url.toString()}`);
    
    const data = await httpsRequest(url.toString());
    
    // If this is a single file (not a folder)
    if (data.type === 'file' && data.mime_type && data.mime_type.startsWith('image/')) {
      if (data.preview) {
        const direct = data.preview;
        const thumb = proxify(withSize(direct, 'M'), functionUrl);
        const src = proxify(withSize(direct, 'XL'), functionUrl);
        const fullSrc = proxify(withSize(direct, 'XXXL'), functionUrl);
        
        return [{
          id: `yd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          src,
          thumbnailSrc: thumb,
          fullSrc,
          originalUrl: direct,
          filename: data.name,
          title: folderInfo.eventName || data.name.replace(/\.[^/.]+$/, ''),
          date: folderInfo.date,
          size: data.size,
          width: data.preview_size || 0,
          height: data.preview_size || 0,
          name: data.name,
          path: data.path,
          mimeType: data.mime_type
        }];
      }
    }
    
    // If this is a folder with embedded items
    if (data._embedded && data._embedded.items) {
      console.log(`Found ${data._embedded.items.length} items in ${path || 'root'}`);
      
      for (const item of data._embedded.items) {
        if (item.type === 'dir') {
          const folderDate = extractDateFromFolderName(item.name);
          const updatedFolderInfo = folderDate ? {
            date: folderDate,
            eventName: item.name,
          } : folderInfo;
          
          console.log(`Processing folder: ${item.name}, extracted date: ${folderDate}`);
          
          const nestedPhotos = await fetchPhotosFromFolder(publicKey, item.path, updatedFolderInfo, depth + 1, functionUrl);
          photos.push(...nestedPhotos);
          
        } else if (item.type === 'file' && item.mime_type && item.mime_type.startsWith('image/')) {
          if (item.preview) {
            const direct = item.preview;
            const thumb = proxify(withSize(direct, 'M'), functionUrl);
            const src = proxify(withSize(direct, 'XL'), functionUrl);
            const fullSrc = proxify(withSize(direct, 'XXXL'), functionUrl);
            
            photos.push({
              id: `yd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              src,
              thumbnailSrc: thumb,
              fullSrc,
              originalUrl: direct,
              filename: item.name,
              title: folderInfo.eventName || item.name.replace(/\.[^/.]+$/, ''),
              date: folderInfo.date,
              size: item.size,
              width: item.preview_size || 0,
              height: item.preview_size || 0,
              name: item.name,
              path: item.path,
              mimeType: item.mime_type
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching photos:', error);
  }
  
  return photos;
}

// Get direct download URL for a specific file path
async function getDownloadUrl(publicKey, path) {
  const url = new URL('https://cloud-api.yandex.net/v1/disk/public/resources/download');
  url.searchParams.append('public_key', publicKey);
  if (path && path !== '/') {
    url.searchParams.append('path', path);
  }
  try {
    const data = await httpsRequest(url.toString());
    return data.href || null;
  } catch (e) {
    return null;
  }
}

// Main handler for Yandex Cloud Functions
module.exports.handler = async function (event, context) {
  const { httpMethod, path, queryStringParameters, headers } = event;
  
  // Get the function URL for proxying
  const functionUrl = `https://${headers?.host || ''}`;

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Main endpoint: Fetch photos
    if (path === '/api/yandex-disk/photos' || path.endsWith('/photos')) {
      const limit = parseInt(queryStringParameters?.limit || '12');
      const offset = parseInt(queryStringParameters?.offset || '0');
      const category = queryStringParameters?.category;
      const requestedDate = queryStringParameters?.date;
      
      console.log(`Fetching photos - Limit: ${limit}, Offset: ${offset}`);
      
      // Fast path: if specific date requested
      if (requestedDate) {
        try {
          const dateFolders = await listDateFolders(PUBLIC_LINK);
          const target = dateFolders.find((f) => f.date === requestedDate);
          if (!target) {
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({ photos: [], total: 0, limit, offset, hasMore: false, success: true })
            };
          }
          const allImages = await fetchAllImagesForFolder(PUBLIC_LINK, target.path, requestedDate, 8, functionUrl);
          const total = allImages.length;
          const paginated = allImages.slice(offset, offset + limit);
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ photos: paginated, total, limit, offset, hasMore: offset + limit < total, success: true })
          };
        } catch (e) {
          console.error('Date fetch error', e);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ photos: [], total: 0, limit, offset, hasMore: false, success: false })
          };
        }
      }

      // Default path: fetch from recent folders
      let photos = [];
      
      try {
        const folders = await listDateFolders(PUBLIC_LINK);
        const foldersToFetch = folders.slice(0, 5);
        
        for (const folder of foldersToFetch) {
          const folderPhotos = await fetchPhotosFromFolder(PUBLIC_LINK, folder.path, {
            date: folder.date,
            eventName: folder.name
          }, 0, functionUrl);
          photos.push(...folderPhotos);
          
          if (photos.length > 100) break;
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
        photos = [];
      }
      
      console.log(`Total photos found: ${photos.length}`);
      
      photos.sort((a, b) => {
        if (a.date && b.date) {
          return b.date.localeCompare(a.date);
        }
        return 0;
      });
      
      const total = photos.length;
      const paginatedPhotos = photos.slice(offset, offset + limit);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          photos: paginatedPhotos,
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
          success: true
        })
      };
    }
    
    // Videos endpoint - EXACT COPY FROM CLOUDFLARE
    if (path === '/api/yandex-disk/videos' || path.endsWith('/videos')) {
      const limit = parseInt(queryStringParameters?.limit || '50');
      const publicKey = queryStringParameters?.public_key || PUBLIC_LINK;
      
      console.log(`Fetching videos from public link: ${publicKey}`);
      
      try {
        const apiUrl = new URL(YANDEX_API_BASE);
        apiUrl.searchParams.append('public_key', publicKey);
        apiUrl.searchParams.append('limit', '200');
        apiUrl.searchParams.append('fields', '_embedded.items');
        
        const data = await httpsRequest(apiUrl.toString());
        const videos = [];
        
        if (data._embedded && data._embedded.items) {
          for (const item of data._embedded.items) {
            if (item.type === 'file' && item.mime_type && item.mime_type.startsWith('video/')) {
              try {
                const downloadUrl = new URL(`${YANDEX_API_BASE}/download`);
                downloadUrl.searchParams.append('public_key', publicKey);
                downloadUrl.searchParams.append('path', item.path);
                
                let videoUrl;
                try {
                  const downloadData = await httpsRequest(downloadUrl.toString());
                  videoUrl = downloadData.href || item.file || item.public_url;
                } catch (e) {
                  videoUrl = item.file || item.public_url || item.preview;
                }
                
                const proxyUrl = `${functionUrl}/api/yandex-disk/video-proxy?public_key=${encodeURIComponent(publicKey)}&path=${encodeURIComponent(item.path)}`;
                
                videos.push({
                  id: `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  url: proxyUrl,
                  originalUrl: videoUrl,
                  title: item.name.replace(/\.[^/.]+$/, ''),
                  name: item.name,
                  path: item.path,
                  size: item.size,
                  mimeType: item.mime_type,
                  duration: item.duration || null,
                  preview: item.preview
                });
              } catch (err) {
                console.error('Error getting video download URL:', err);
                const proxyUrl = `${functionUrl}/api/yandex-disk/video-proxy?public_key=${encodeURIComponent(publicKey)}&path=${encodeURIComponent(item.path)}`;
                
                videos.push({
                  id: `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  url: proxyUrl,
                  originalUrl: item.file || item.public_url || item.preview,
                  title: item.name.replace(/\.[^/.]+$/, ''),
                  name: item.name,
                  path: item.path,
                  size: item.size,
                  mimeType: item.mime_type,
                  duration: item.duration || null,
                  preview: item.preview
                });
              }
            }
          }
        }
        
        console.log(`Found ${videos.length} videos in folder`);
        const limitedVideos = videos.slice(0, limit);
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ 
            videos: limitedVideos, 
            total: videos.length,
            limit,
            success: true 
          })
        };
        
      } catch (error) {
        console.error('Error fetching videos:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ 
            videos: [], 
            total: 0, 
            success: false,
            error: error.message 
          })
        };
      }
    }
    
    // Video proxy endpoint - stream video content
    if (path === '/api/yandex-disk/video-proxy' || path.endsWith('/video-proxy')) {
      const publicKey = queryStringParameters?.public_key;
      const videoPath = queryStringParameters?.path;
      
      if (!publicKey || !videoPath) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: 'Missing parameters'
        };
      }
      
      try {
        const downloadUrl = new URL(`${YANDEX_API_BASE}/download`);
        downloadUrl.searchParams.append('public_key', publicKey);
        downloadUrl.searchParams.append('path', videoPath);
        
        const downloadData = await httpsRequest(downloadUrl.toString());
        const videoResponse = await httpsRequest(downloadData.href, { binary: true });
        
        const responseHeaders = {
          ...corsHeaders,
          'Content-Type': videoResponse.headers['content-type'] || 'video/mp4',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600'
        };
        
        if (videoResponse.headers['content-length']) {
          responseHeaders['Content-Length'] = videoResponse.headers['content-length'];
        }
        
        // Handle range requests for video seeking
        const range = headers?.range;
        if (range && videoResponse.headers['content-range']) {
          responseHeaders['Content-Range'] = videoResponse.headers['content-range'];
          return {
            statusCode: 206,
            headers: responseHeaders,
            body: videoResponse.body.toString('base64'),
            isBase64Encoded: true
          };
        }
        
        return {
          statusCode: 200,
          headers: responseHeaders,
          body: videoResponse.body.toString('base64'),
          isBase64Encoded: true
        };
        
      } catch (error) {
        console.error('Error proxying video:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: 'Error proxying video'
        };
      }
    }
    
    // Get all available dates endpoint
    if (path === '/api/yandex-disk/dates' || path.endsWith('/dates')) {
      console.log('Fetching all available dates (folders)');
      const folders = await listDateFolders(PUBLIC_LINK);
      const sortedDates = folders.map((f) => f.date).filter(Boolean);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ dates: sortedDates, total: sortedDates.length, success: true })
      };
    }
    
    // Download URL endpoint - proxy the download
    if (path === '/api/yandex-disk/download' || path.endsWith('/download')) {
      const downloadPath = queryStringParameters?.path;
      const href = await getDownloadUrl(PUBLIC_LINK, downloadPath);
      
      if (!href) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to get download URL' })
        };
      }
      
      try {
        const fileResponse = await httpsRequest(href, { binary: true });
        const filename = downloadPath ? downloadPath.split('/').pop() : 'download';
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': fileResponse.headers['content-type'] || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
          },
          body: fileResponse.body.toString('base64'),
          isBase64Encoded: true
        };
      } catch (error) {
        console.error('Error downloading file:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to download file' })
        };
      }
    }

    // Proxy endpoint for images - CRITICAL ENDPOINT!
    if (path.startsWith('/api/proxy-image') || path.includes('proxy-image')) {
      const imageUrl = queryStringParameters?.url;
      if (!imageUrl) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing image URL' })
        };
      }
      
      try {
        const imageResponse = await httpsRequest(decodeURIComponent(imageUrl), { binary: true });
        
        if (imageResponse.statusCode !== 200) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusCode}`);
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': imageResponse.headers['content-type'] || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          },
          body: imageResponse.body.toString('base64'),
          isBase64Encoded: true
        };
      } catch (error) {
        console.error('Error proxying image:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to proxy image' })
        };
      }
    }
    
    // Health check endpoint
    if (path === '/api/health' || path.endsWith('/health')) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: 'yandex-cloud-functions-complete-1.0.0'
        })
      };
    }
    
    // Fallback for unknown endpoints
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Invalid endpoint',
        availableEndpoints: [
          '/api/yandex-disk/photos',
          '/api/yandex-disk/videos',
          '/api/yandex-disk/dates',
          '/api/yandex-disk/download',
          '/api/yandex-disk/video-proxy',
          '/api/proxy-image',
          '/api/health'
        ]
      })
    };
    
  } catch (error) {
    console.error('Worker error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message,
        success: false
      })
    };
  }
};