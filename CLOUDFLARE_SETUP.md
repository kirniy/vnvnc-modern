# Cloudflare Worker Setup for VNVNC TicketsCloud API

## Step 1: Create Cloudflare Worker

1. Go to [cloudflare.com](https://cloudflare.com) and sign up/log in
2. Navigate to **Workers & Pages** → **Create** → **Create Worker**
3. Choose **Start from scratch**
4. Give it a name like `vnvnc-ticketscloud-proxy`
5. Click **Deploy**

## Step 2: Add the Worker Code

1. In the Worker dashboard, click **Edit code**
2. Replace all the default code with the contents of `cloudflare-worker.js`
3. Click **Save and Deploy**

## Step 3: Set Environment Variable

1. Go to **Settings** tab in your Worker dashboard
2. Click **Variables**
3. Under **Environment variables**, click **Add variable**
4. Name: `TC_KEY`
5. Value: `c862e40ed178486285938dda33038e30` (your TicketsCloud API key)
6. Check **Encrypt** for security
7. Click **Deploy**

## Step 4: Test the Worker

Your worker will be available at: `https://your-worker-name.your-subdomain.workers.dev`

Test it:
```bash
curl "https://your-worker-name.your-subdomain.workers.dev/api/events"
```

## Step 5: Get Your Worker URL

Copy your worker URL from the dashboard. It should look like:
`https://vnvnc-ticketscloud-proxy.your-subdomain.workers.dev`

## Step 6: Update Frontend

Update the frontend code to use your worker URL instead of the failing CORS proxies.

## Why This Works

- Cloudflare Worker runs server-side, so no CORS restrictions
- Worker adds proper CORS headers to allow browser requests
- API key is stored securely as environment variable
- Free tier: 100,000 requests per day
- Fast global CDN