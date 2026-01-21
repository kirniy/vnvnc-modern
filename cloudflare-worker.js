// Cloudflare Worker for VNVNC - Handles CORS proxy, Telegram notifications, and Email notifications
// Deploy this to Cloudflare Workers

// Configuration
// ВНИМАНИЕ: Все секреты должны задаваться как переменные окружения в Cloudflare Workers
// Никаких ключей в репозитории!
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

// Handle CORS preflight
function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders,
  });
}

// Send Telegram message
async function sendTelegramMessage(telegramBotToken, chatId, text) {
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      }),
    });

    const data = await response.json();
    
    if (!data.ok) {
      console.error('Telegram API error:', data);
      throw new Error(data.description || 'Failed to send Telegram message');
    }
    
    return data;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

// Send email using Brevo (9000 emails/month free)
async function sendEmail(brevoApiKey, to, subject, htmlContent) {
  
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify({
        sender: {
          name: 'VNVNC Website',
          email: 'admin@angar.online' // Default sender email for this Brevo account
        },
        to: [{
          email: to,
          name: 'Admin'
        }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Brevo API error:', data);
      throw new Error(data.message || 'Failed to send email');
    }
    
    console.log('Email sent successfully to:', to, 'Message ID:', data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Handle booking submission
async function handleBooking(request, env) {
  try {
    const data = await request.json();
    const { name, phone, date, guests, tableType, message } = data;

    // Validate required fields
    if (!name || !phone || !date || !guests || !tableType) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

#бронирование
    `.trim();

    // Create email content
    const emailSubject = `Новое бронирование VNVNC - ${name}`;
    const emailContent = telegramMessage
      .replace(/<b>/g, '<strong>')
      .replace(/<\/b>/g, '</strong>')
      .replace(/\n/g, '<br>');

    // Send messages to both Telegram and Email
    try {
      const results = await Promise.allSettled([
        sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, BOOKING_MANAGER_ID, telegramMessage),
        sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, ADMIN_ID, telegramMessage),
        sendEmail(env.BREVO_API_KEY, ADMIN_EMAIL, emailSubject, emailContent)
      ]);
      
      // Check if at least one message was sent successfully
      const successfulSends = results.filter(r => r.status === 'fulfilled').length;
      if (successfulSends === 0) {
        throw new Error('Failed to send any notifications');
      }
      
      // Log any failures for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const recipient = index === 0 ? 'booking manager' : index === 1 ? 'admin' : 'email';
          console.error(`Failed to send to ${recipient}:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error sending notifications:', error);
      // Don't throw here - we want to return success if at least one message was sent
    }

    return new Response(JSON.stringify({ success: true, message: 'Booking submitted successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing booking:', error);
    return new Response(JSON.stringify({ error: 'Failed to process booking', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Handle rental form submission
async function handleRental(request, env) {
  try {
    const data = await request.json();
    const { name, phone, email } = data;

    // Validate required fields
    if (!name || !phone || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    // Send to both Telegram and Email with a short timeout
    // This ensures notifications are sent but doesn't block the response too long
    await Promise.race([
      Promise.allSettled([
        sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, BOOKING_MANAGER_ID, telegramMessage),
        sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, ADMIN_ID, telegramMessage),
        sendEmail(env.BREVO_API_KEY, ADMIN_EMAIL, emailSubject, emailContent)
      ]),
      new Promise(resolve => setTimeout(resolve, 3000)) // 3 second timeout
    ]);

    return new Response(JSON.stringify({ success: true, message: 'Rental form submitted successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing rental form:', error);
    return new Response(JSON.stringify({ error: 'Failed to process rental form', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Handle contact form submission
async function handleContact(request, env) {
  try {
    const data = await request.json();
    const { name, phone, message } = data;

    // Validate required fields
    if (!name || !phone || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

    // Send to admin via Telegram and Email with a short timeout
    // This ensures notifications are sent but doesn't block the response too long
    await Promise.race([
      Promise.allSettled([
        sendTelegramMessage(env.TELEGRAM_BOT_TOKEN, ADMIN_ID, telegramMessage),
        sendEmail(env.BREVO_API_KEY, ADMIN_EMAIL, emailSubject, emailContent)
      ]),
      new Promise(resolve => setTimeout(resolve, 3000)) // 3 second timeout
    ]);

    return new Response(JSON.stringify({ success: true, message: 'Contact form submitted successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(JSON.stringify({ error: 'Failed to process contact form', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Handle TicketsCloud API proxy
async function handleTicketsCloudProxy(request, pathname, searchParams) {
  // Map /api/v1/* → /v1/*
  const apiPath = pathname.replace('/api/', '/');
  
  // Extract API key from query parameters
  const apiKey = searchParams.get('key');
  
  // Remove key from query string to avoid duplication
  searchParams.delete('key');
  const targetUrl = `https://ticketscloud.com${apiPath}?${searchParams.toString()}`;

  console.log('Proxying to:', targetUrl, 'with key:', apiKey ? 'present' : 'missing');

  try {
    const ticketsCloudResponse = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Authorization': `key ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: request.body
    });

    const body = await ticketsCloudResponse.text();

    return new Response(body, {
      status: ticketsCloudResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('TicketsCloud proxy error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    
    // Route requests
    if (pathname === '/booking' && request.method === 'POST') {
      return handleBooking(request, env);
    } else if (pathname === '/contact' && request.method === 'POST') {
      return handleContact(request, env);
    } else if (pathname === '/rental' && request.method === 'POST') {
      return handleRental(request, env);
    } else if (pathname.startsWith('/api/')) {
      return handleTicketsCloudProxy(request, pathname, url.searchParams);
    } else {
      return new Response('Not found', { 
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain'
        }
      });
    }
  },
};