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

// Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = '102934750:AAE9kVClDad9yAyk8f2cYhrcsYqJeDybfLo';
const BOOKING_MANAGER_ID = '429156227';
const ADMIN_ID = '433491';
const HELP_CHAT_USERNAME = '@vnvnc_help';

// Helper function to send Telegram message
async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.ok) {
            resolve(result);
          } else {
            reject(new Error(result.description || 'Failed to send Telegram message'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.write(postData);
    request.end();
  });
}

// Booking submission function
exports.submitBooking = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { name, phone, date, guests, tableType, message } = request.body;

      // Validate required fields
      if (!name || !phone || !date || !guests || !tableType) {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      // Format table type for display
      const tableTypes = {
        'table2': 'Стол на 2 человека (8,000₽)',
        'table3': 'Стол на 3 человека (12,000₽)',
        'table4-5': 'Стол на 4-5 человек (от 16,000₽)',
        'vip': 'VIP ложа (от 40,000₽)'
      };

      // Format the message for Telegram
      const telegramMessage = `
🎉 <b>Новое бронирование!</b>

👤 <b>Имя:</b> ${name}
📱 <b>Телефон:</b> ${phone}
📅 <b>Дата:</b> ${date}
👥 <b>Количество гостей:</b> ${guests}
🎭 <b>Тип стола:</b> ${tableTypes[tableType] || tableType}
${message ? `\n💬 <b>Пожелания:</b> ${message}` : ''}

#booking #vnvnc
      `.trim();

      // Send messages to both booking manager and admin
      await Promise.all([
        sendTelegramMessage(BOOKING_MANAGER_ID, telegramMessage),
        sendTelegramMessage(ADMIN_ID, telegramMessage)
      ]);

      return response.status(200).json({ 
        success: true, 
        message: 'Booking submitted successfully' 
      });
    } catch (error) {
      console.error('Error processing booking:', error);
      return response.status(500).json({ 
        error: 'Failed to process booking', 
        details: error.message 
      });
    }
  });
});

// Contact form submission function
exports.submitContact = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    if (request.method !== 'POST') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { name, phone, message } = request.body;

      // Validate required fields
      if (!name || !phone || !message) {
        return response.status(400).json({ error: 'Missing required fields' });
      }

      // Format the message for Telegram
      const telegramMessage = `
📨 <b>Новое сообщение с сайта!</b>

👤 <b>Имя:</b> ${name}
📱 <b>Телефон:</b> ${phone}
💬 <b>Сообщение:</b> ${message}

#contact #website
      `.trim();

      // For contact form, we need to send to the help chat
      // Since we can't send directly to @vnvnc_help without the chat ID,
      // we'll send to admin who can forward it or set up proper routing
      await sendTelegramMessage(ADMIN_ID, telegramMessage + '\n\n⚠️ Пожалуйста, перешлите в @vnvnc_help');

      return response.status(200).json({ 
        success: true, 
        message: 'Contact form submitted successfully' 
      });
    } catch (error) {
      console.error('Error processing contact form:', error);
      return response.status(500).json({ 
        error: 'Failed to process contact form', 
        details: error.message 
      });
    }
  });
});