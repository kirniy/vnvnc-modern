// Yandex Cloud Function for Yandex Disk Gallery
// Works with API Gateway - handles path parameters correctly

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

// Helper function to extract date from folder name (YYYY-MM-DD format)
function extractDateFromFolderName(name) {
  const dateMatch = name.match(/^(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : null;
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

// Wrap Yandex preview URL with our proxy
function proxify(url, baseUrl) {
  if (!url) return url;
  // Route through /api/yandex-disk/proxy
  return `${baseUrl}/proxy?url=${encodeURIComponent(url)}`;
}

// Make HTTPS request
async function makeHttpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks)
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// List only date-named folders at root with pagination
async function listDateFolders(publicKey) {
  let offset = 0;
  const items = [];
  
  while (true) {
    const apiUrl = `${YANDEX_API_BASE}?public_key=${encodeURIComponent(publicKey)}&limit=200&offset=${offset}`;
    const response = await makeHttpsRequest(apiUrl);
    
    if (response.status !== 200) break;
    
    const data = JSON.parse(response.body.toString());
    const pageItems = data._embedded?.items || [];
    items.push(...pageItems);
    
    if (pageItems.length < 200) break;
    offset += 200;
    if (offset > 2000) break; // safety limit
  }
  
  const folders = items.filter((it) => it.type === 'dir' && /^\d{4}-\d{2}-\d{2}/.test(it.name));
  // Sort newest first by name
  folders.sort((a, b) => b.name.localeCompare(a.name));
  
  return folders.map((f) => ({
    date: extractDateFromFolderName(f.name),
    name: f.name,
    path: f.path
  }));
}

// Fetch all images recursively from a folder path with pagination and depth control
async function fetchAllImagesForFolder(publicKey, startPath, inferredDate, maxDepth = 6, baseUrl = '') {
  const results = [];
  const queue = [{ path: startPath, depth: 0 }];
  
  while (queue.length) {
    const { path, depth } = queue.shift();
    if (depth > maxDepth) continue;
    
    let offset = 0;
    const limit = 200;
    
    // Paginate within current folder
    while (true) {
      let apiUrl = `${YANDEX_API_BASE}?public_key=${encodeURIComponent(publicKey)}`;
      if (path && path !== '/') {
        apiUrl += `&path=${encodeURIComponent(path)}`;
      }
      apiUrl += `&limit=${limit}&offset=${offset}&preview_size=XL`;
      
      const response = await makeHttpsRequest(apiUrl);
      if (response.status !== 200) break;
      
      const data = JSON.parse(response.body.toString());
      const items = data._embedded?.items || [];
      
      for (const item of items) {
        if (item.type === 'dir') {
          queue.push({ path: item.path, depth: depth + 1 });
        } else if (item.type === 'file' && item.mime_type && item.mime_type.startsWith('image/')) {
          if (item.preview) {
            const direct = item.preview;
            const thumb = proxify(withSize(direct, 'M'), baseUrl);
            const src = proxify(withSize(direct, 'XL'), baseUrl);
            const fullSrc = proxify(withSize(direct, 'XXXL'), baseUrl);
            
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
              name: item.name,
              path: item.path,
              mimeType: item.mime_type
            });
          }
        }
      }
      
      if (items.length < limit) break;
      offset += limit;
      if (offset > 5000) break; // safety limit
    }
  }
  
  return results;
}

module.exports.handler = async function (event, context) {
  // Get the HTTP method and path
  const httpMethod = event.httpMethod || 'GET';
  
  // When called via API Gateway, the path is passed as params.proxy
  const pathParameter = (event.params && event.params.proxy) || 
                       (event.params && event.params.path) || 
                       (event.pathParams && event.pathParams.proxy) || 
                       null;
  // The path after /api/yandex-disk/
  const subPath = pathParameter || '';
  const queryStringParameters = event.queryStringParameters || {};
  
  // Get the base URL for proxying
  const baseUrl = 'https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/api/yandex-disk';

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Route based on path
    if (subPath === 'photos' || subPath === '/photos') {
      // Handle photos endpoint
      const category = queryStringParameters.category || 'all';
      const limit = parseInt(queryStringParameters.limit) || 12;
      const offset = parseInt(queryStringParameters.offset) || 0;
      const date = queryStringParameters.date;

      let apiUrl = `${YANDEX_API_BASE}?public_key=${encodeURIComponent(PUBLIC_LINK)}&path=/`;
      apiUrl += `&limit=${Math.min(limit * 3, 100)}`; // Get more to filter
      apiUrl += `&offset=${offset}`;
      apiUrl += '&fields=_embedded.items.name,_embedded.items.type,_embedded.items.path,_embedded.items.preview,_embedded.items.file,_embedded.items.size,_embedded.items.created,_embedded.items.modified,_embedded.total';
      apiUrl += '&preview_size=XXL&preview_crop=false';

      const response = await makeHttpsRequest(apiUrl);
      const data = JSON.parse(response.body.toString());

      if (!data._embedded || !data._embedded.items) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ photos: [], total: 0, limit, offset })
        };
      }

      // Filter and process folders
      let folders = data._embedded.items.filter(item => item.type === 'dir');
      
      // Filter by date if specified
      if (date) {
        folders = folders.filter(folder => extractDateFromFolderName(folder.name) === date);
      }

      // Process each folder to get photos
      const allPhotos = [];
      for (const folder of folders.slice(0, Math.min(folders.length, 5))) {
        const folderDate = extractDateFromFolderName(folder.name);
        const folderUrl = `${YANDEX_API_BASE}?public_key=${encodeURIComponent(PUBLIC_LINK)}&path=${encodeURIComponent(folder.path)}`;
        const folderResponse = await makeHttpsRequest(folderUrl + '&limit=50&preview_size=XXL&preview_crop=false');
        const folderData = JSON.parse(folderResponse.body.toString());

        if (folderData._embedded && folderData._embedded.items) {
          const photos = folderData._embedded.items
            .filter(item => item.type === 'file' && item.preview)
            .map(item => ({
              id: item.path,
              name: item.name,
              path: item.path,
              src: proxify(replacePreviewSize(item.preview, 'XL'), baseUrl),
              thumbnailSrc: proxify(replacePreviewSize(item.preview, 'M'), baseUrl),
              fullSrc: proxify(replacePreviewSize(item.preview, 'XXXL'), baseUrl),
              downloadUrl: item.file,
              title: item.name.replace(/\.[^/.]+$/, ''),
              date: folderDate,
              category: category === 'all' ? 'all' : category,
              size: item.size
            }));
          allPhotos.push(...photos);
        }
      }

      // Apply pagination
      const paginatedPhotos = allPhotos.slice(offset, offset + limit);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          photos: paginatedPhotos,
          total: allPhotos.length,
          limit,
          offset
        })
      };

    } else if (subPath === 'dates' || subPath === '/dates') {
      // Handle dates endpoint
      const apiUrl = `${YANDEX_API_BASE}?public_key=${encodeURIComponent(PUBLIC_LINK)}&path=/&limit=100`;
      const response = await makeHttpsRequest(apiUrl);
      const data = JSON.parse(response.body.toString());

      if (!data._embedded || !data._embedded.items) {
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ dates: [], total: 0, success: true })
        };
      }

      const dates = data._embedded.items
        .filter(item => item.type === 'dir')
        .map(folder => extractDateFromFolderName(folder.name))
        .filter(date => date !== null)
        .sort((a, b) => b.localeCompare(a));

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          dates,
          total: dates.length,
          success: true
        })
      };

    } else if (subPath === 'proxy' || subPath === '/proxy') {
      // Handle proxy endpoint for images
      const url = queryStringParameters.url;
      if (!url) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing url parameter' })
        };
      }

      // Decode fully-encoded URL coming from client
      const decodedUrl = decodeURIComponent(url);

      const response = await makeHttpsRequest(decodedUrl);
      
      // Response body is already a Buffer, convert to base64 for Yandex Cloud Function
      const base64Body = response.body.toString('base64');
      
      return {
        statusCode: response.status,
        headers: {
          ...corsHeaders,
          'Content-Type': response.headers['content-type'] || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000'
        },
        body: base64Body,
        isBase64Encoded: true
      };

    } else if (subPath === 'download' || subPath === '/download') {
      // Handle download endpoint
      const path = queryStringParameters.path;
      if (!path) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing path parameter' })
        };
      }

      // Get one-time download href from Yandex
      const apiUrl = `${YANDEX_API_BASE}/download?public_key=${encodeURIComponent(PUBLIC_LINK)}&path=${encodeURIComponent(path)}`;
      const hrefResp = await makeHttpsRequest(apiUrl);
      if (hrefResp.status < 200 || hrefResp.status >= 300) {
        return {
          statusCode: hrefResp.status,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Failed to get download URL' })
        };
      }
      const data = JSON.parse(hrefResp.body.toString());
      const fileUrl = data.href;

      if (!fileUrl) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'No download URL returned' })
        };
      }

      // Fetch the file and return it directly (binary)
      const fileResp = await makeHttpsRequest(fileUrl);
      const base64Body = fileResp.body.toString('base64');
      const filename = path.split('/').pop() || 'download';
      
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': fileResp.headers['content-type'] || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        },
        body: base64Body,
        isBase64Encoded: true
      };

    } else {
      // Unknown endpoint
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Not found' })
      };
    }

  } catch (error) {
    console.error('Yandex Disk proxy error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};