# Email Setup Instructions for VNVNC

To enable email notifications, you need to set up a free email service. Here are the recommended options:

## Option 1: Web3Forms (Recommended - Easiest)

1. Go to https://web3forms.com
2. Enter your email address (Seregamarkin1@gmail.com)
3. Click "Create Access Key"
4. Check your email and confirm
5. Copy the access key
6. Update the Cloudflare Worker with your key

## Option 2: Resend (100 emails/day free)

1. Sign up at https://resend.com
2. Verify your email
3. Get your API key from the dashboard
4. Update the Cloudflare Worker

## Option 3: Use Telegram-to-Email Bot

For now, the system sends email notifications as Telegram messages to the admin.
You can manually forward these or set up a Telegram bot that forwards to email.

## Current Implementation

Currently, when someone submits a booking or contact form:
1. ✅ Telegram messages are sent to the booking manager and admin
2. ✅ An email notification is sent via Telegram with all the details
3. ⚠️ Actual email delivery requires setting up one of the above services

## To Update the Worker with Email Service

Once you have an API key from one of the services above, update the `sendEmail` function in `cloudflare-worker.js` with the appropriate API integration.