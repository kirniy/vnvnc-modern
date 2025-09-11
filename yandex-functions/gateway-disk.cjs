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

// Replace preview size in Yandex preview URL
function replacePreviewSize(previewUrl, size) {
  if (!previewUrl) return previewUrl;
  if (previewUrl.includes('size=')) {
    return previewUrl.replace(/size=[^&]*/, `size=${size}`);
  }
  const separator = previewUrl.includes('?') ? '&' : '?';
  return `${previewUrl}${separator}size=${size}`;
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

      const response = await makeHttpsRequest(url);
      
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

      const apiUrl = `${YANDEX_API_BASE}/download?public_key=${encodeURIComponent(PUBLIC_LINK)}&path=${encodeURIComponent(path)}`;
      const response = await makeHttpsRequest(apiUrl);
      const data = JSON.parse(response.body.toString());

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ downloadUrl: data.href })
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