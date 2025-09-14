# Yandex Cloud CDN Setup for vnvnc.ru

## ✅ PRODUCTION SETUP - ACTIVE AS OF SEPTEMBER 14, 2025

### Current Infrastructure
- **CDN Resource ID**: `bc8r6mazvdt6r7jlkth2`
- **CDN Endpoint**: `bf1cb789559b3dc5.a.yccdn.cloud.yandex.net`
- **Origin Group ID**: `969387041098089598`
- **SSL Certificate ID**: `fpqq2forhge3pfdabf2s` (expires Dec 12, 2025)
- **Origin Server**: `e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru` (Selectel S3)

## Why This Setup?
Selectel S3 doesn't support root domains (vnvnc.ru) properly - only subdomains. Cloudflare is blocked in Russia. Yandex Cloud CDN solves both problems by acting as a proxy that supports root domains and provides SSL.

## Prerequisites
- Yandex Cloud account with billing enabled
- Access to Yandex Cloud Console
- SSL certificate files (already have)
- DNS management access (Selectel)

## Step 1: Create CDN Resource in Yandex Cloud

### 1.1 Login to Yandex Cloud Console
Go to: https://console.cloud.yandex.ru/

### 1.2 Navigate to CDN
- In the left menu, find "CDN" under "Network" section
- Click "Create CDN resource"

### 1.3 Configure CDN Resource
```
Name: vnvnc-cdn
Description: CDN for vnvnc.ru website

Origin Settings:
- Origin type: Custom
- Origin server: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
- Protocol: HTTPS
- Port: 443
- Host header: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru

Cache Settings:
- Cache enabled: Yes
- Default TTL: 3600 seconds
- Query string: Include in cache key
```

## Step 2: Add Custom Domains

### 2.1 Add Primary Domain
```
Domain: vnvnc.ru
Secondary domains: www.vnvnc.ru
```

### 2.2 SSL Certificate Configuration
You'll need to upload your Let's Encrypt certificate:

**Certificate chain** (from vnvnc.ru_cert.pem):
```
-----BEGIN CERTIFICATE-----
[First certificate block - lines 1-29]
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
[Second certificate block - lines 30-58]
-----END CERTIFICATE-----
```

**Private key** (from vnvnc.ru_private_key.pem):
```
-----BEGIN PRIVATE KEY-----
[Your private key - all lines]
-----END PRIVATE KEY-----
```

## Step 3: Configure CDN Settings

### 3.1 Caching Rules
Add these caching rules:
```
Path pattern: /*
Cache behavior: Cache all
TTL: 3600

Path pattern: /*.html
Cache behavior: Cache all
TTL: 300

Path pattern: /*.css, /*.js
Cache behavior: Cache all
TTL: 86400

Path pattern: /api/*
Cache behavior: Don't cache
```

### 3.2 CORS Headers
Add CORS headers for your domain:
```
Access-Control-Allow-Origin: https://vnvnc.ru
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Max-Age: 86400
```

## Step 4: Get CDN Endpoint

### ACTUAL PRODUCTION ENDPOINT:
```
bf1cb789559b3dc5.a.yccdn.cloud.yandex.net
```

This is the endpoint currently in use. Yandex generates this automatically when you create the CDN resource.

## Step 5: Update DNS Records

### 5.1 In Selectel DNS Management

**CURRENT PRODUCTION DNS CONFIGURATION:**

**For vnvnc.ru (root domain):**
```
Type: ALIAS
Name: @ (or leave empty)
Value: bf1cb789559b3dc5.a.yccdn.cloud.yandex.net
TTL: 300
```

**For www.vnvnc.ru:**
```
Type: CNAME
Name: www
Value: bf1cb789559b3dc5.a.yccdn.cloud.yandex.net
TTL: 300
```

### 5.2 Remove Old Records
Delete the existing records pointing to Selectel S3:
- Remove ALIAS record pointing to access.ru-7.storage.selcloud.ru
- Remove CNAME record pointing to access.ru-7.storage.selcloud.ru

## Step 6: Configure Origin Headers (Optional)

If you encounter CORS issues, add these origin request headers in CDN settings:
```
Host: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
Origin: https://vnvnc.ru
```

## Step 7: Testing

### 7.1 Wait for DNS Propagation
DNS changes can take 5-30 minutes to propagate.

### 7.2 Test URLs
Test both URLs in your browser:
- https://vnvnc.ru
- https://www.vnvnc.ru

### 7.3 Verify SSL Certificate
Check that the SSL certificate is valid and shows as issued for vnvnc.ru

### 7.4 Test Resources Loading
- Check that CSS/JS files load correctly
- Verify images and videos load
- Test any API calls if applicable

## Troubleshooting

### Issue: 404 errors
**Solution**: Check that the origin path is correct and the bucket is publicly accessible.

### Issue: SSL certificate errors
**Solution**: Ensure you uploaded both the certificate chain and private key correctly.

### Issue: CORS errors
**Solution**: Add proper CORS headers in CDN configuration.

### Issue: Slow loading
**Solution**: Check cache settings and increase TTL for static assets.

## Alternative: Yandex Cloud Functions Proxy

If CDN doesn't work as expected, we can create a serverless proxy:

```javascript
// Yandex Cloud Function code
exports.handler = async (event) => {
    const path = event.path || '/';
    const originUrl = `https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru${path}`;

    const response = await fetch(originUrl);
    const body = await response.text();

    return {
        statusCode: response.status,
        headers: {
            'Content-Type': response.headers.get('content-type'),
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*'
        },
        body: body
    };
};
```

## Cost Estimation

Yandex Cloud CDN pricing (approximate):
- Traffic: ~1-2 RUB per GB
- Requests: ~0.60 RUB per million requests
- SSL certificate: Free (using your own)

For a typical website with 100GB monthly traffic:
- Monthly cost: ~100-200 RUB

## Support Contacts

Yandex Cloud Support:
- Console: https://console.cloud.yandex.ru/support
- Documentation: https://cloud.yandex.ru/docs/cdn/
- Community: https://cloud.yandex.ru/blog/

## Next Steps

1. Create CDN resource in Yandex Cloud Console
2. Upload SSL certificate
3. Update DNS records
4. Test the setup
5. Monitor CDN analytics for performance

---

## CLI Commands Used for This Setup

```bash
# 1. Create origin group
yc cdn origin-group create \
  --name "vnvnc-origin" \
  --origin source=e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru,enabled=true

# 2. Create CDN resource
yc cdn resource create \
  --cname vnvnc.gcdn.co \
  --origin-group-id 969387041098089598 \
  --origin-protocol https \
  --active

# 3. Upload SSL certificate
yc certificate-manager certificate create \
  --name vnvnc-ssl \
  --chain vnvnc.ru_cert.pem \
  --key vnvnc.ru_private_key.pem

# 4. Attach certificate to CDN
yc cdn resource update bc8r6mazvdt6r7jlkth2 \
  --cert-manager-ssl-cert-id fpqq2forhge3pfdabf2s

# 5. Set host header
yc cdn resource update bc8r6mazvdt6r7jlkth2 \
  --host-header e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
```

Created: September 14, 2025
Last Updated: September 14, 2025
Status: **PRODUCTION ACTIVE**