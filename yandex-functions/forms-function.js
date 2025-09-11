// Yandex Cloud Function for form submissions (booking, contact, rental)
// Handles Telegram and Email notifications

const https = require('https');

// Configuration
const BOOKING_MANAGER_ID = '429156227';
const ADMIN_ID = '433491';
const ADMIN_EMAIL = 'Seregamarkin1@gmail.com';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

// Send Telegram message
async function sendTelegramMessage(telegramBotToken, chatId, text) {
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  
  const data = JSON.stringify({
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  });

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.ok) {
            resolve(result);
          } else {
            reject(new Error(result.description || 'Failed to send Telegram message'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Send email using Brevo
async function sendEmail(brevoApiKey, to, subject, htmlContent) {
  const data = JSON.stringify({
    sender: {
      name: 'VNVNC Website',
      email: 'admin@angar.online'
    },
    to: [{
      email: to,
      name: 'Admin'
    }],
    subject: subject,
    htmlContent: htmlContent
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode === 201) {
            resolve({ success: true, messageId: result.messageId });
          } else {
            reject(new Error(result.message || 'Failed to send email'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Handle booking submission
async function handleBooking(data, telegramBotToken, brevoApiKey) {
  const { name, phone, date, guests, tableType, message } = data;

  // Validate required fields
  if (!name || !phone || !date || !guests || !tableType) {
    throw new Error('Missing required fields');
  }

  // Format table type for display
  const tableTypes = {
    'table2': 'Стол на 2 человека (7,000₽)',
    'table3': 'Стол на 3 человека (10,500₽)',
    'table4-5': 'Стол на 4-5 человек (от 14,000₽)',
    'vip': 'VIP ложа (от 35,000₽)'
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

#бронирование
  `.trim();

  // Create email content
  const emailSubject = `Новое бронирование VNVNC - ${name}`;
  const emailContent = telegramMessage
    .replace(/<b>/g, '<strong>')
    .replace(/<\/b>/g, '</strong>')
    .replace(/\n/g, '<br>');

  // Send messages
  const results = await Promise.allSettled([
    sendTelegramMessage(telegramBotToken, BOOKING_MANAGER_ID, telegramMessage),
    sendTelegramMessage(telegramBotToken, ADMIN_ID, telegramMessage),
    sendEmail(brevoApiKey, ADMIN_EMAIL, emailSubject, emailContent)
  ]);

  // Check if at least one message was sent
  const successfulSends = results.filter(r => r.status === 'fulfilled').length;
  if (successfulSends === 0) {
    throw new Error('Failed to send any notifications');
  }

  return { success: true, message: 'Booking submitted successfully' };
}

// Handle rental form submission
async function handleRental(data, telegramBotToken, brevoApiKey) {
  const { name, phone, email } = data;

  // Validate required fields
  if (!name || !phone || !email) {
    throw new Error('Missing required fields');
  }

  // Format the message for Telegram
  const telegramMessage = `
🏢 <b>Новая заявка на аренду клуба!</b>

👤 <b>Имя:</b> ${name}
📱 <b>Телефон:</b> ${phone}
📧 <b>Email:</b> ${email}

#аренда
  `.trim();

  // Create email content
  const emailSubject = `Новая заявка на аренду VNVNC - ${name}`;
  const emailContent = telegramMessage
    .replace(/<b>/g, '<strong>')
    .replace(/<\/b>/g, '</strong>')
    .replace(/\n/g, '<br>');

  // Send messages with timeout
  await Promise.race([
    Promise.allSettled([
      sendTelegramMessage(telegramBotToken, BOOKING_MANAGER_ID, telegramMessage),
      sendTelegramMessage(telegramBotToken, ADMIN_ID, telegramMessage),
      sendEmail(brevoApiKey, ADMIN_EMAIL, emailSubject, emailContent)
    ]),
    new Promise(resolve => setTimeout(resolve, 3000))
  ]);

  return { success: true, message: 'Rental form submitted successfully' };
}

// Handle contact form submission
async function handleContact(data, telegramBotToken, brevoApiKey) {
  const { name, phone, message } = data;

  // Validate required fields
  if (!name || !phone || !message) {
    throw new Error('Missing required fields');
  }

  // Format the message for Telegram
  const telegramMessage = `
📨 <b>Новое сообщение с сайта!</b>

👤 <b>Имя:</b> ${name}
📱 <b>Телефон:</b> ${phone}
💬 <b>Сообщение:</b> ${message}

#контакт

⚠️ Пожалуйста, перешлите в @vnvnc_help
  `.trim();

  // Create email content
  const emailSubject = `Новое сообщение с сайта VNVNC - ${name}`;
  const emailContent = telegramMessage
    .replace(/<b>/g, '<strong>')
    .replace(/<\/b>/g, '</strong>')
    .replace(/\n/g, '<br>');

  // Send messages with timeout
  await Promise.race([
    Promise.allSettled([
      sendTelegramMessage(telegramBotToken, ADMIN_ID, telegramMessage),
      sendEmail(brevoApiKey, ADMIN_EMAIL, emailSubject, emailContent)
    ]),
    new Promise(resolve => setTimeout(resolve, 3000))
  ]);

  return { success: true, message: 'Contact form submitted successfully' };
}

// Main handler for Yandex Cloud Functions
module.exports.handler = async function (event, context) {
  const { httpMethod, path, body } = event;

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Get secrets from environment or context
  // In Yandex Cloud, these should be set as function environment variables
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || context.token?.access_token;
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!telegramBotToken || !brevoApiKey) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing API keys configuration' })
    };
  }

  try {
    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }

    let result;

    // Route requests
    if ((path === '/booking' || path === '/api/booking') && httpMethod === 'POST') {
      result = await handleBooking(data, telegramBotToken, brevoApiKey);
    } else if ((path === '/contact' || path === '/api/contact') && httpMethod === 'POST') {
      result = await handleContact(data, telegramBotToken, brevoApiKey);
    } else if ((path === '/rental' || path === '/api/rental') && httpMethod === 'POST') {
      result = await handleRental(data, telegramBotToken, brevoApiKey);
    } else {
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        body: 'Not found'
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error processing form:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Failed to process form', 
        details: error.message 
      })
    };
  }
};