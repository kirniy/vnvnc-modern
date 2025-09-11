// Yandex Cloud Function for Yandex Disk Gallery
// Direct port from cloudflare-worker-yandex-final.js

const https = require('https');
const { URL } = require('url');

const YANDEX_API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources';
const PUBLIC_LINK = 'https://disk.yandex.ru/d/sab0EP9Sm3G8LA';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=300'
};

// Helper function to extract date from folder name
function extractDateFromFolderName(name) {
  const dateMatch = name.match(/^(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : null;
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

// Since we're in Yandex Cloud, we might not need to proxy Yandex URLs
// But keeping the function for compatibility
function proxify(url) {
  if (!url) return url;
  // In Yandex Cloud Functions, we might be able to access Yandex services directly
  // For now, return the URL as-is, or implement your own proxy logic
  return url;
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
    });

    req.on('error', reject);
    req.end();
  });
}

// List date folders at root
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

// Fetch all images recursively from a folder
async function fetchAllImagesForFolder(publicKey, startPath, inferredDate, maxDepth = 6) {
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
          } else if (item.type === 'file' && item.mime_type?.startsWith('image/')) {
            if (item.preview) {
              const direct = item.preview;
              const thumb = proxify(withSize(direct, 'M'));
              const src = proxify(withSize(direct, 'XL'));
              const fullSrc = proxify(withSize(direct, 'XXXL'));
              
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
        console.error('Error fetching folder:', e);
        break;
      }
    }
  }
  
  return results;
}

// Main handler for Yandex Cloud Functions
module.exports.handler = async function (event, context) {
  const { httpMethod, path, queryStringParameters } = event;

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Main photos endpoint
    if (path === '/api/yandex-disk/photos' || path === '/photos') {
      const limit = parseInt(queryStringParameters?.limit || '12');
      const offset = parseInt(queryStringParameters?.offset || '0');
      const requestedDate = queryStringParameters?.date;
      
      // If specific date requested
      if (requestedDate) {
        const dateFolders = await listDateFolders(PUBLIC_LINK);
        const target = dateFolders.find((f) => f.date === requestedDate);
        
        if (!target) {
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ 
              photos: [], 
              total: 0, 
              limit, 
              offset, 
              hasMore: false, 
              success: true 
            })
          };
        }
        
        const allImages = await fetchAllImagesForFolder(PUBLIC_LINK, target.path, requestedDate, 8);
        const total = allImages.length;
        const paginated = allImages.slice(offset, offset + limit);
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ 
            photos: paginated, 
            total, 
            limit, 
            offset, 
            hasMore: offset + limit < total, 
            success: true 
          })
        };
      }
      
      // Default: fetch from recent folders
      const folders = await listDateFolders(PUBLIC_LINK);
      const foldersToFetch = folders.slice(0, 5);
      let photos = [];
      
      for (const folder of foldersToFetch) {
        const folderPhotos = await fetchAllImagesForFolder(
          PUBLIC_LINK, 
          folder.path, 
          folder.date,
          2
        );
        photos.push(...folderPhotos);
        if (photos.length > 100) break;
      }
      
      // Sort by date
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
    
    // Dates endpoint
    if (path === '/api/yandex-disk/dates' || path === '/dates') {
      const folders = await listDateFolders(PUBLIC_LINK);
      const sortedDates = folders.map((f) => f.date).filter(Boolean);
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          dates: sortedDates, 
          total: sortedDates.length, 
          success: true 
        })
      };
    }
    
    // Health check
    if (path === '/api/health' || path === '/health') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: 'yandex-cloud-functions-1.0.0'
        })
      };
    }
    
    // 404 for unknown endpoints
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Invalid endpoint',
        availableEndpoints: [
          '/api/yandex-disk/photos',
          '/api/yandex-disk/dates',
          '/api/health'
        ]
      })
    };
    
  } catch (error) {
    console.error('Function error:', error);
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