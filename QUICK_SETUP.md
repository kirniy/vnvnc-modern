# Quick Setup Guide - Yandex CDN for vnvnc.ru

## 🎯 What We're Doing
Using Yandex Cloud CDN to serve your site from Selectel S3 with proper SSL support for vnvnc.ru

## 📋 Quick Steps

### Step 1: Open Yandex Cloud Console
1. Go to https://console.cloud.yandex.ru/
2. Navigate to **CDN** section (under Network)
3. Click **"Create CDN resource"**

### Step 2: Basic CDN Configuration
Fill in these fields:
```
Name: vnvnc-cdn
Origin server: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
Protocol: HTTPS
```

### Step 3: Add Your Domain
1. Click **"Add custom domain"**
2. Enter: `vnvnc.ru`
3. Also add: `www.vnvnc.ru`

### Step 4: Upload SSL Certificate
Copy and paste from your files:
- **Certificate**: Everything from `vnvnc.ru_cert.pem`
- **Private Key**: Everything from `vnvnc.ru_private_key.pem`

### Step 5: Get Your CDN Endpoint
Yandex will give you an endpoint like:
- `cl-********.edgecdn.ru`
- or `vnvnc-cdn.gcdn.co`

**SAVE THIS ENDPOINT!**

### Step 6: Update DNS in Selectel
Go to your Selectel DNS management and:

1. **Delete these records:**
   - vnvnc.ru ALIAS → access.ru-7.storage.selcloud.ru
   - www.vnvnc.ru CNAME → access.ru-7.storage.selcloud.ru

2. **Add these new records:**
   ```
   vnvnc.ru     → ALIAS → [your-cdn-endpoint]
   www.vnvnc.ru → CNAME → [your-cdn-endpoint]
   ```

### Step 7: Wait and Test
1. Wait 10-15 minutes for DNS to update
2. Test https://vnvnc.ru
3. Test https://www.vnvnc.ru

## ⚠️ Important Notes

- Your Selectel S3 bucket stays as is - no changes needed there
- The CDN will fetch content from Selectel and serve it with proper SSL
- This bypasses Selectel's domain binding limitations

## 🆘 If Something Goes Wrong

**Problem**: Site doesn't load
- Check CDN origin is set to: `e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru`
- Make sure you selected HTTPS protocol

**Problem**: SSL error
- Verify you pasted the FULL certificate (both blocks)
- Check private key was pasted correctly

**Problem**: DNS not resolving
- Wait more time (up to 30 minutes)
- Verify you updated both vnvnc.ru and www.vnvnc.ru records

## 💰 Cost
Approximately 100-200 RUB per month for typical website traffic

## ✅ Success Checklist
- [ ] CDN resource created in Yandex Cloud
- [ ] SSL certificate uploaded
- [ ] Custom domains added (vnvnc.ru and www.vnvnc.ru)
- [ ] DNS records updated in Selectel
- [ ] Both https://vnvnc.ru and https://www.vnvnc.ru work
- [ ] No SSL warnings in browser

---
That's it! Your site should be working within 15-30 minutes.