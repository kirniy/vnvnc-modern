// Yandex Cloud Function for form submissions (booking, contact, rental)
// Telegram-only notifications (email is disabled)

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
        'Content-Length': Buffer.byteLength(data)
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

// Email sending is disabled. Keep placeholder to avoid breaking imports (unused).
async function sendEmail() { return { disabled: true }; }

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

  // Send messages (Telegram only) with bounded time
  const [tg1, tg2] = await Promise.all([
    withTimeout(sendTelegramMessage(telegramBotToken, BOOKING_MANAGER_ID, telegramMessage), 4000),
    withTimeout(sendTelegramMessage(telegramBotToken, ADMIN_ID, telegramMessage), 4000)
  ]);

  const telegramOk = (tg1 && !tg1.__error && !tg1.__timeout) || (tg2 && !tg2.__error && !tg2.__timeout);
  if (!telegramOk) {
    throw new Error('Failed to send Telegram notifications');
  }

  return { success: true, message: 'Booking submitted successfully', channels: { telegram: true } };
}

// Utility: timeout wrapper that settles with { timeout: true } instead of throwing
function withTimeout(promise, ms) {
  let timeoutId;
  const timeoutPromise = new Promise(resolve => {
    timeoutId = setTimeout(() => resolve({ __timeout: true }), ms);
  });
  return Promise.race([
    promise.then(res => { clearTimeout(timeoutId); return res; })
           .catch(err => { clearTimeout(timeoutId); return { __error: err }; }),
    timeoutPromise
  ]);
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

  // Telegram only
  const [tg1, tg2] = await Promise.all([
    withTimeout(sendTelegramMessage(telegramBotToken, BOOKING_MANAGER_ID, telegramMessage), 4000),
    withTimeout(sendTelegramMessage(telegramBotToken, ADMIN_ID, telegramMessage), 4000)
  ]);

  const telegramOk = (tg1 && !tg1.__error && !tg1.__timeout) || (tg2 && !tg2.__error && !tg2.__timeout);
  if (!telegramOk) {
    const err = new Error('Failed to send Telegram notifications');
    err.details = { tg1, tg2 };
    throw err;
  }

  return { success: true, message: 'Rental form submitted successfully', channels: { telegram: true } };
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

  // Telegram only with bounded time
  const tg = await withTimeout(sendTelegramMessage(telegramBotToken, ADMIN_ID, telegramMessage), 4000);
  if (tg && (tg.__error || tg.__timeout)) {
    throw new Error('Failed to send Telegram notification');
  }

  return { success: true, message: 'Contact form submitted successfully', channels: { telegram: true } };
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

  if (!telegramBotToken) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing TELEGRAM_BOT_TOKEN configuration' })
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
      result = await handleBooking(data, telegramBotToken);
    } else if ((path === '/contact' || path === '/api/contact') && httpMethod === 'POST') {
      result = await handleContact(data, telegramBotToken);
    } else if ((path === '/rental' || path === '/api/rental') && httpMethod === 'POST') {
      result = await handleRental(data, telegramBotToken);
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