const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const https = require('https');

// Firebase Function to proxy TicketsCloud API requests
exports.ticketsCloudProxy = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract the API endpoint from query parameters
    const endpoint = req.query.endpoint;
    const apiKey = req.query.apiKey;

    if (!endpoint || !apiKey) {
      return res.status(400).json({ 
        error: 'Missing required parameters: endpoint and apiKey' 
      });
    }

    // Construct the TicketsCloud API URL
    const ticketsCloudUrl = `https://ticketscloud.com${endpoint}`;

    // Set up the request options
    const options = {
      hostname: 'ticketscloud.com',
      port: 443,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `key ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'VNVNC-Website/1.0'
      }
    };

    console.log('Proxying request to:', ticketsCloudUrl);

    // Make the request to TicketsCloud API
    const request = https.request(options, (apiResponse) => {
      let data = '';

      // Collect response data
      apiResponse.on('data', (chunk) => {
        data += chunk;
      });

      // Send the response back to the client
      apiResponse.on('end', () => {
        try {
          // Set CORS headers
          res.set('Access-Control-Allow-Origin', '*');
          res.set('Access-Control-Allow-Methods', 'GET');
          res.set('Access-Control-Allow-Headers', 'Content-Type');

          // Parse and return the JSON response
          const jsonData = JSON.parse(data);
          res.status(apiResponse.statusCode).json(jsonData);
        } catch (error) {
          console.error('JSON parse error:', error);
          res.status(500).json({ 
            error: 'Failed to parse API response',
            details: error.message 
          });
        }
      });
    });

    // Handle request errors
    request.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ 
        error: 'Failed to connect to TicketsCloud API',
        details: error.message 
      });
    });

    // End the request
    request.end();
  });
});

// Health check endpoint
exports.healthCheck = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    res.json({ 
      status: 'ok', 
      message: 'VNVNC TicketsCloud Proxy is running',
      timestamp: new Date().toISOString()
    });
  });
});