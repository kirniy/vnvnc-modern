# Cloudflare Worker Deployment Instructions

## Steps to Deploy the Worker

1. **Go to Cloudflare Dashboard**
   - Visit https://dash.cloudflare.com
   - Select your account
   - Go to "Workers & Pages"

2. **Update Your Existing Worker**
   Since you already have `vnvnc-cors-proxy.kirlich-ps3.workers.dev`, you need to update it:
   
   - Find your existing worker `vnvnc-cors-proxy`
   - Click on it to open the worker details
   - Click "Quick edit" or "Edit code"

3. **Replace the Worker Code**
   - Delete all existing code
   - Copy and paste the entire contents of `cloudflare-worker.js`
   - Click "Save and Deploy"

4. **Configure Environment Variables (Optional but Recommended)**
   For better security, you can move the sensitive data to environment variables:
   
   - In the worker settings, go to "Settings" → "Variables"
   - Add these environment variables:
     - `TELEGRAM_BOT_TOKEN`: 8225858735:AAHfXBuoCEOqmOgXJKM_JguJixdQDC9kgh4
     - `BOOKING_MANAGER_ID`: 429156227
     - `ADMIN_ID`: 433491
     - `TICKETS_CLOUD_API_KEY`: c862e40ed178486285938dda33038e30
   
   Then update the worker code to use `env.VARIABLE_NAME` instead of hardcoded values.

5. **Test the Endpoints**
   Your worker will now handle:
   - `POST https://vnvnc-cors-proxy.kirlich-ps3.workers.dev/booking` - Booking submissions
   - `POST https://vnvnc-cors-proxy.kirlich-ps3.workers.dev/contact` - Contact form submissions
   - `GET https://vnvnc-cors-proxy.kirlich-ps3.workers.dev/api/*` - TicketsCloud proxy (existing functionality)

## Testing

1. Submit a test booking on https://vnvncwebsite.web.app/reservations
2. Submit a test contact form on https://vnvncwebsite.web.app/contact
3. Check Telegram for notifications

## Troubleshooting

- If you don't receive Telegram messages, check:
  1. The bot token is correct
  2. The chat IDs are correct
  3. The bot has permission to send messages to those users
  4. Check Cloudflare Worker logs for errors

- To view logs:
  1. Go to your worker in Cloudflare dashboard
  2. Click on "Logs" tab
  3. Start "Begin log stream"
  4. Submit a form and watch for errors