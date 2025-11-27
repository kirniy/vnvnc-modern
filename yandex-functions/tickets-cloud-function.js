// Yandex Cloud Function for TicketsCloud API proxy
// Deploy to Yandex Cloud Functions

const https = require('https');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

// Main handler for Yandex Cloud Functions
module.exports.handler = async function (event, context) {
  const { httpMethod, path, queryStringParameters, body, headers } = event;

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Map /api/v1/* or /tc/v1/* → /v1/* (strip gateway route prefix)
    const rawPath = (event.params && (event.params.proxy || event.params.path)) || path || '';
    const normalizedPath = rawPath.replace(/^\/?(api|tc)\//, '/');
    const apiPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    
    // Extract API key from query parameters
    const apiKey = queryStringParameters?.key;
    
    // Remove key from query string to avoid duplication
    const params = { ...queryStringParameters };
    delete params.key;
    const queryString = new URLSearchParams(params).toString();
    const targetUrl = `https://ticketscloud.com${apiPath}?${queryString}`;
    
    console.log('Proxying to:', targetUrl, 'with key:', apiKey ? 'present' : 'missing');

    // Make request to TicketsCloud API
    const apiResponse = await new Promise((resolve, reject) => {
      const url = new URL(targetUrl);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: httpMethod,
        headers: {
          'Authorization': `key ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', reject);
      
      if (body) {
        req.write(body);
      }
      
      req.end();
    });

    return {
      statusCode: apiResponse.statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: apiResponse.body
    };

  } catch (error) {
    console.error('TicketsCloud proxy error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Proxy error', 
        details: error.message 
      })
    };
  }
};