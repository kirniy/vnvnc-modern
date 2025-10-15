// Cloudflare Worker for Yandex Disk Public Gallery - FINAL VERSION
// Uses preview URLs which are CORS-compatible and don't expire

const YANDEX_API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources';
const PUBLIC_LINK = 'https://disk.yandex.ru/d/sab0EP9Sm3G8LA'; // Your public folder link

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

// Wrap Yandex preview URL with our proxy to avoid 403/hotlink limits
function proxify(url) {
  if (!url) return url;
  const base = 'https://vnvnc-yandex-gallery.kirlich-ps3.workers.dev';
  return `${base}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

// Make sized variants from a direct preview URL (keeps other params intact)
function withSize(directPreviewUrl, size) {
  if (!directPreviewUrl) return directPreviewUrl;
  const has = directPreviewUrl.includes('size=');
  if (has) {
    return directPreviewUrl.replace(/size=[^&]*/i, `size=${size}`);
  }
  const sep = directPreviewUrl.includes('?') ? '&' : '?';
  return `${directPreviewUrl}${sep}size=${size}`;
}

// List only date-named folders (YYYY-MM-DD...) at root (with pagination)
async function listDateFolders(publicKey) {
  const url = new URL(YANDEX_API_BASE);
  url.searchParams.append('public_key', publicKey);
  url.searchParams.append('limit', '200');
  let offset = 0;
  const items = [];
  while (true) {
    url.searchParams.set('offset', String(offset));
    const response = await fetch(url.toString());
    if (!response.ok) break;
    const data = await response.json();
    const pageItems = data._embedded?.items || [];
    items.push(...pageItems);
    if (pageItems.length < 200) break;
    offset += 200;
    if (offset > 2000) break; // safety
  }
  const folders = items.filter((it) => it.type === 'dir' && /^\d{4}-\d{2}-\d{2}/.test(it.name));
  // Sort newest first by name (YYYY-MM-DD... lexical works)
  folders.sort((a, b) => b.name.localeCompare(a.name));
  return folders.map((f) => ({
    date: (f.name.match(/^\d{4}-\d{2}-\d{2}/) || [null])[0],
    name: f.name,
    path: f.path
  }));
}

// Fetch all images recursively from a folder path (with pagination and depth control)
async function fetchAllImagesForFolder(publicKey, startPath, inferredDate, maxDepth = 6) {
  const results = [];
  const queue = [{ path: startPath, depth: 0 }];
  while (queue.length) {
    const { path, depth } = queue.shift();
    if (depth > maxDepth) continue;
    let offset = 0;
    const limit = 200;
    // Paginate within current folder
    while (true) {
      const url = new URL(YANDEX_API_BASE);
      url.searchParams.append('public_key', publicKey);
      if (path && path !== '/') url.searchParams.append('path', path);
      url.searchParams.append('limit', String(limit));
      url.searchParams.append('offset', String(offset));
      // Ask Yandex API to give us preview links of the right size up front
      url.searchParams.append('preview_size', 'XL');
      const resp = await fetch(url.toString());
      if (!resp.ok) break;
      const data = await resp.json();
      const items = data._embedded?.items || [];
      for (const item of items) {
        if (item.type === 'dir') {
          queue.push({ path: item.path, depth: depth + 1 });
        } else if (item.type === 'file' && item.mime_type && item.mime_type.startsWith('image/')) {
          if (item.preview) {
            // Use proxy to avoid 403 from Yandex when hotlinking many previews
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
      if (offset > 5000) break; // safety for very large albums
    }
  }
  return results;
}

// Recursive function to fetch photos from nested folders
async function fetchPhotosFromFolder(publicKey, path = '', folderInfo = {}, depth = 0) {
  // Prevent infinite recursion and limit depth to avoid timeout
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
    
    url.searchParams.append('limit', '200'); // Increased to get all folders including 2025
    // Request XL previews directly to avoid tampering with signed URLs
    url.searchParams.append('preview_size', 'XL');
    // Include all fields to get proper preview URLs
    url.searchParams.append('fields', '_embedded.items');
    
    console.log(`Fetching from: ${url.toString()}`);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Failed to fetch from Yandex Disk: ${response.status}`);
      return photos;
    }
    
    const data = await response.json();
    
    // If this is a single file (not a folder)
      if (data.type === 'file' && data.mime_type && data.mime_type.startsWith('image/')) {
      if (data.preview) {
        // Proxy preview URL to bypass hotlink 403
        const direct = data.preview;
        const thumb = proxify(withSize(direct, 'M'));
        const src = proxify(withSize(direct, 'XL'));
        const fullSrc = proxify(withSize(direct, 'XXXL'));
        
        return [{
          id: `yd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          src,
          thumbnailSrc: thumb,
          fullSrc,
          originalUrl: direct, // Keep original for reference
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
      
      // Process items sequentially to avoid rate limiting
      for (const item of data._embedded.items) {
        if (item.type === 'dir') {
          // Check if this is a date folder
          const folderDate = extractDateFromFolderName(item.name);
          const updatedFolderInfo = folderDate ? {
            date: folderDate,
            eventName: item.name,
          } : folderInfo;
          
          console.log(`Processing folder: ${item.name}, extracted date: ${folderDate}`);
          
          // Recursively fetch photos from this folder
          const nestedPhotos = await fetchPhotosFromFolder(publicKey, item.path, updatedFolderInfo, depth + 1);
          photos.push(...nestedPhotos);
          
          // Skip delay for now to improve performance
          // await new Promise(resolve => setTimeout(resolve, 100));
          
        } else if (item.type === 'file' && item.mime_type && item.mime_type.startsWith('image/')) {
          // Use preview URL if available
          if (item.preview) {
            // Proxy preview URL to bypass hotlink 403
            const direct = item.preview;
            const thumb = proxify(withSize(direct, 'M'));
            const src = proxify(withSize(direct, 'XL'));
            const fullSrc = proxify(withSize(direct, 'XXXL'));
            
            photos.push({
              id: `yd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              src,
              thumbnailSrc: thumb,
              fullSrc,
              originalUrl: direct, // Keep original for reference
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
  const resp = await fetch(url.toString());
  if (!resp.ok) return null;
  const data = await resp.json();
  return data.href || null;
}

// Main request handler
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // CORS headers for cross-origin requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
  };
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Main endpoint: Fetch photos (optionally by specific date)
    if (url.pathname === '/api/yandex-disk/photos') {
      const limit = parseInt(url.searchParams.get('limit') || '12'); // Reduced to 12 for faster initial load
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const category = url.searchParams.get('category');
      const requestedDate = url.searchParams.get('date');
      
      console.log(`Fetching photos - Limit: ${limit}, Offset: ${offset}`);
      
      // Fast path: if a specific date is requested, fetch recursively all subfolders/files for that date
      if (requestedDate) {
        try {
          const dateFolders = await listDateFolders(PUBLIC_LINK);
          const target = dateFolders.find((f) => f.date === requestedDate);
          if (!target) {
            return new Response(JSON.stringify({ photos: [], total: 0, limit, offset, hasMore: false, success: true }), { headers: corsHeaders });
          }
          const allImages = await fetchAllImagesForFolder(PUBLIC_LINK, target.path, requestedDate, 8);
          // Sort by name or keep order
          const total = allImages.length;
          const paginated = allImages.slice(offset, offset + limit);
          return new Response(JSON.stringify({ photos: paginated, total, limit, offset, hasMore: offset + limit < total, success: true }), { headers: corsHeaders });
        } catch (e) {
          console.error('Date fetch error', e);
          return new Response(JSON.stringify({ photos: [], total: 0, limit, offset, hasMore: false, success: false }), { headers: corsHeaders, status: 500 });
        }
      }

      // Default path: fetch from a few most recent date folders to populate "all"
      let photos = [];
      
      try {
        // Use listDateFolders to get ALL folders including 2025 with pagination
        const folders = await listDateFolders(PUBLIC_LINK);
        
        // Only fetch photos from the most recent folders to avoid timeout
        const foldersToFetch = folders.slice(0, 5); // Only fetch from 5 most recent events
        
        for (const folder of foldersToFetch) {
          const folderPhotos = await fetchPhotosFromFolder(PUBLIC_LINK, folder.path, {
            date: folder.date,
            eventName: folder.name
          }, 0);
          photos.push(...folderPhotos);
          
          // Limit total photos to avoid timeout
          if (photos.length > 100) break;
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
        photos = [];
      }
      
      console.log(`Total photos found: ${photos.length}`);
      
      // Sort by date (newest first)
      photos.sort((a, b) => {
        if (a.date && b.date) {
          return b.date.localeCompare(a.date);
        }
        return 0;
      });
      
      // Calculate total before pagination
      const total = photos.length;
      
      // Apply pagination
      const paginatedPhotos = photos.slice(offset, offset + limit);
      
      return new Response(JSON.stringify({
        photos: paginatedPhotos,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        success: true
      }), {
        headers: corsHeaders
      });
    }
    
    // Videos endpoint - fetch videos from the public folder
    if (url.pathname === '/api/yandex-disk/videos') {
      const limit = parseInt(url.searchParams.get('limit') || '50'); // Increased default limit
      const publicKey = url.searchParams.get('public_key') || PUBLIC_LINK;
      
      console.log(`Fetching videos from public link: ${publicKey}`);
      
      try {
        // Fetch the folder contents
        const apiUrl = new URL(YANDEX_API_BASE);
        apiUrl.searchParams.append('public_key', publicKey);
        apiUrl.searchParams.append('limit', '200'); // Fetch more items
        apiUrl.searchParams.append('fields', '_embedded.items');
        
        const response = await fetch(apiUrl.toString());
        
        if (!response.ok) {
          console.error(`Failed to fetch from Yandex Disk: ${response.status}`);
          return new Response(JSON.stringify({ videos: [], total: 0, success: false }), { 
            headers: corsHeaders,
            status: response.status 
          });
        }
        
        const data = await response.json();
        const videos = [];
        
        // Process items looking for video files
        if (data._embedded && data._embedded.items) {
          for (const item of data._embedded.items) {
            // Check if it's a video file
            if (item.type === 'file' && item.mime_type && item.mime_type.startsWith('video/')) {
              // For videos, we need to get a download URL
              try {
                // Get download URL for the video
                const downloadUrl = new URL(`${YANDEX_API_BASE}/download`);
                downloadUrl.searchParams.append('public_key', publicKey);
                downloadUrl.searchParams.append('path', item.path);
                
                const downloadResponse = await fetch(downloadUrl.toString());
                
                if (downloadResponse.ok) {
                  const downloadData = await downloadResponse.json();
                  // The response should contain a 'href' field with the direct download URL
                  const videoUrl = downloadData.href || item.file || item.public_url;
                  
                  // Use proxy URL instead of direct download URL
                  const proxyUrl = `https://vnvnc-yandex-gallery.kirlich-ps3.workers.dev/api/yandex-disk/video-proxy?public_key=${encodeURIComponent(publicKey)}&path=${encodeURIComponent(item.path)}`;
                  
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
                } else {
                  // Fallback if we can't get download URL - still use proxy
                  const proxyUrl = `https://vnvnc-yandex-gallery.kirlich-ps3.workers.dev/api/yandex-disk/video-proxy?public_key=${encodeURIComponent(publicKey)}&path=${encodeURIComponent(item.path)}`;
                  
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
              } catch (err) {
                console.error('Error getting video download URL:', err);
                // Fallback on error - still use proxy
                const proxyUrl = `https://vnvnc-yandex-gallery.kirlich-ps3.workers.dev/api/yandex-disk/video-proxy?public_key=${encodeURIComponent(publicKey)}&path=${encodeURIComponent(item.path)}`;
                
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
        
        // Return only requested number of videos
        const limitedVideos = videos.slice(0, limit);
        
        return new Response(JSON.stringify({ 
          videos: limitedVideos, 
          total: videos.length,
          limit,
          success: true 
        }), { 
          headers: corsHeaders 
        });
        
      } catch (error) {
        console.error('Error fetching videos:', error);
        return new Response(JSON.stringify({ 
          videos: [], 
          total: 0, 
          success: false,
          error: error.message 
        }), { 
          headers: corsHeaders,
          status: 500 
        });
      }
    }
    
    // Video proxy endpoint - stream video content through the worker
    if (url.pathname === '/api/yandex-disk/video-proxy') {
      const publicKey = url.searchParams.get('public_key');
      const path = url.searchParams.get('path');
      
      if (!publicKey || !path) {
        return new Response('Missing parameters', { status: 400, headers: corsHeaders });
      }
      
      try {
        // Get fresh download URL
        const downloadUrl = new URL(`${YANDEX_API_BASE}/download`);
        downloadUrl.searchParams.append('public_key', publicKey);
        downloadUrl.searchParams.append('path', path);
        
        const downloadResponse = await fetch(downloadUrl.toString());
        if (!downloadResponse.ok) {
          return new Response('Failed to get download URL', { status: downloadResponse.status, headers: corsHeaders });
        }
        
        const downloadData = await downloadResponse.json();
        
        // Stream the video content through the worker
        const videoResponse = await fetch(downloadData.href);
        
        // Create response headers for video streaming
        const responseHeaders = new Headers(corsHeaders);
        responseHeaders.set('Content-Type', videoResponse.headers.get('Content-Type') || 'video/mp4');
        responseHeaders.set('Accept-Ranges', 'bytes');
        responseHeaders.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        
        const contentLength = videoResponse.headers.get('Content-Length');
        if (contentLength) {
          responseHeaders.set('Content-Length', contentLength);
        }
        
        // Handle range requests for video seeking
        const range = request.headers.get('Range');
        if (range && videoResponse.headers.get('Content-Range')) {
          responseHeaders.set('Content-Range', videoResponse.headers.get('Content-Range'));
          return new Response(videoResponse.body, {
            status: 206,
            headers: responseHeaders
          });
        }
        
        return new Response(videoResponse.body, {
          headers: responseHeaders
        });
        
      } catch (error) {
        console.error('Error proxying video:', error);
        return new Response('Error proxying video', { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }
    
    // Get all available dates endpoint (fast: list root folders only)
    if (url.pathname === '/api/yandex-disk/dates') {
      console.log('Fetching all available dates (folders)');
      const folders = await listDateFolders(PUBLIC_LINK);
      const sortedDates = folders.map((f) => f.date).filter(Boolean);
      return new Response(JSON.stringify({ dates: sortedDates, total: sortedDates.length, success: true }), { headers: corsHeaders });
    }
    
    // Download URL endpoint - proxy the download
    if (url.pathname === '/api/yandex-disk/download') {
      const path = url.searchParams.get('path');
      const href = await getDownloadUrl(PUBLIC_LINK, path);
      
      if (!href) {
        return new Response(JSON.stringify({ error: 'Failed to get download URL' }), {
          status: 404,
          headers: corsHeaders
        });
      }
      
      try {
        // Fetch the file from Yandex
        const fileResponse = await fetch(href);
        
        if (!fileResponse.ok) {
          throw new Error(`Failed to fetch file: ${fileResponse.status}`);
        }
        
        // Extract filename from path
        const filename = path ? path.split('/').pop() || 'download' : 'download';
        const safeName = filename.replace(/["\r\n]/g, '_');
        const contentType = fileResponse.headers.get('Content-Type') || 'application/octet-stream';
        const contentLength = fileResponse.headers.get('Content-Length');
        
        const headers = new Headers({
          'Content-Type': contentType,
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Expose-Headers': 'Content-Disposition, Content-Type, Content-Length',
          'Content-Disposition': `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
          'Cross-Origin-Resource-Policy': 'cross-origin'
        });
        
        if (contentLength) {
          headers.set('Content-Length', contentLength);
        }
        
        return new Response(fileResponse.body, {
          headers
        });
      } catch (error) {
        console.error('Error downloading file:', error);
        return new Response(JSON.stringify({ error: 'Failed to download file' }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // Proxy endpoint for images
    if (url.pathname.startsWith('/api/proxy-image')) {
      const imageUrl = url.searchParams.get('url');
      if (!imageUrl) {
        return new Response(JSON.stringify({ error: 'Missing image URL' }), {
          status: 400,
          headers: corsHeaders
        });
      }
      
      try {
        // Fetch the image from Yandex
        const imageResponse = await fetch(decodeURIComponent(imageUrl));
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        
        // Get the image data
        const imageData = await imageResponse.arrayBuffer();
        
        // Return the image with proper headers
        return new Response(imageData, {
          headers: {
            'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            'Access-Control-Allow-Origin': '*',
          }
        });
      } catch (error) {
        console.error('Error proxying image:', error);
        return new Response(JSON.stringify({ error: 'Failed to proxy image' }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }
    
    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: 'final-3.0.0-optimized'
      }), {
        headers: corsHeaders
      });
    }
    
    // Fallback for unknown endpoints
    return new Response(JSON.stringify({ 
      error: 'Invalid endpoint',
      availableEndpoints: [
        '/api/yandex-disk/photos',
        '/api/yandex-disk/videos',
        '/api/yandex-disk/dates',
        '/api/health'
      ]
    }), {
      status: 404,
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      details: error.message,
      success: false
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Export for Cloudflare Workers
export default {
  async fetch(request) {
    return handleRequest(request);
  }
};
