// Yandex Cloud Function for TicketsCloud API proxy
// Works with API Gateway

const https = require('https');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

module.exports.handler = async function (event, context) {
  // API Gateway passes the HTTP request data directly
  const httpMethod = event.httpMethod || 'GET';
  // When called via API Gateway with {proxy+}, the path parameter contains the captured part
  const pathParameter = event.params && event.params.proxy ? event.params.proxy : null;
  // Reconstruct the full path
  const path = pathParameter ? `/api/${pathParameter}` : (event.path || '/');
  const queryStringParameters = event.queryStringParameters || {};
  const body = event.body;
  const headers = event.headers || {};
  
  console.log('Incoming request - Method:', httpMethod, 'Path:', path, 'PathParam:', pathParameter);

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Map /api/v1/* → /v1/* (EXACTLY like Cloudflare Worker)
    const apiPath = path.replace('/api/', '/');
    
    // Extract API key from query parameters
    const apiKey = queryStringParameters.key;
    
    // Remove key from query string to avoid duplication
    const params = { ...queryStringParameters };
    delete params.key;
    const queryString = new URLSearchParams(params).toString();
    const targetUrl = `https://ticketscloud.com${apiPath}?${queryString}`;
    
    console.log('Proxying to:', targetUrl, 'with key:', apiKey ? 'present' : 'missing');
    console.log('Path parameter:', pathParameter, 'Full path:', path);

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
          console.log('TicketsCloud response status:', res.statusCode);
          console.log('TicketsCloud response data length:', data.length);
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

    console.log('Returning status:', apiResponse.statusCode, 'body length:', apiResponse.body ? apiResponse.body.length : 0);
    
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