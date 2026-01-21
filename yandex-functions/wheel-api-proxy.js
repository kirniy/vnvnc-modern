// Yandex Cloud Function for Wheel API proxy
// Proxies requests to VPS at 46.203.233.138:8080

const http = require('http');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Telegram-Init-Data',
  'Access-Control-Max-Age': '86400'
};

// VPS configuration
const VPS_HOST = '46.203.233.138';
const VPS_PORT = 8080;

// Main handler for Yandex Cloud Functions
module.exports.handler = async function (event, context) {
  const { httpMethod, queryStringParameters, body, headers } = event;

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Get the path from params (set by API Gateway)
    const rawPath = (event.params && event.params.path) || '';
    const apiPath = `/api/wheel/${rawPath}`;

    // Build query string
    const queryString = queryStringParameters
      ? '?' + new URLSearchParams(queryStringParameters).toString()
      : '';

    const targetPath = apiPath + queryString;

    console.log(`Proxying ${httpMethod} to: http://${VPS_HOST}:${VPS_PORT}${targetPath}`);

    // Forward request to VPS
    const apiResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: VPS_HOST,
        port: VPS_PORT,
        path: targetPath,
        method: httpMethod,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // Forward Telegram init data if present
          ...(headers['x-telegram-init-data'] && { 'X-Telegram-Init-Data': headers['x-telegram-init-data'] })
        },
        timeout: 15000
      };

      const req = http.request(options, (res) => {
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

      req.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
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
    console.error('Wheel API proxy error:', error);
    return {
      statusCode: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Backend connection error',
        details: error.message
      })
    };
  }
};
