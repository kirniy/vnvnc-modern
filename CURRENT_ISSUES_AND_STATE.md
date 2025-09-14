# VNVNC.RU Current Issues and Project State

## ✅ CURRENT STATUS

The website is currently WORKING via Yandex Cloud CDN in front of Selectel Object Storage. The previous incident (404 at CDN and SSL mismatch) has been resolved.

### Main Issues:
1. **Selectel S3 doesn't support root domains** - Can only bind subdomains like www.vnvnc.ru
2. **Cloudflare is blocked in Russia** - Can't use the typical CDN solution
3. **Yandex CDN returns 404** - Even though S3 bucket is accessible directly
4. **SSL certificate mismatch** - Multiple certificates exist but not properly applied

## 📊 CURRENT INFRASTRUCTURE STATE

### What's Working ✅
- Website access: https://vnvnc.ru and https://www.vnvnc.ru return 200 OK
- S3 bucket is publicly accessible: https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
- Yandex CDN fetches origin and serves content correctly
- SSL certificate (Let's Encrypt R12) is active for both domains

### What's Broken ❌
- None at the moment

## 🔧 CURRENT CONFIGURATION

### Yandex Cloud CDN (final working config)
```yaml
CDN Resource ID: bc8rilebboch3mrd3uds
Provider CNAME: bf1cb789559b3dc5.a.yccdn.cloud.yandex.net
Canonical CNAME: vnvnc-cdn.gcdn.co
Secondary Hostnames: [vnvnc.ru, www.vnvnc.ru]
Origin: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
Origin Protocol: HTTPS
Host Header: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
Certificate (Certificate Manager): fpq6ebsc38egmpblgvq6
Redirect HTTP→HTTPS: enabled
```

### DNS Configuration (in Selectel)
```
vnvnc.ru → ALIAS → bf1cb789559b3dc5.a.yccdn.cloud.yandex.net
www.vnvnc.ru → CNAME → bf1cb789559b3dc5.a.yccdn.cloud.yandex.net
```

### SSL Certificates
1. Old certificate (superseded)
2. Active certificate in Yandex Certificate Manager: fpq6ebsc38egmpblgvq6 (Let's Encrypt R12, SAN: vnvnc.ru, www.vnvnc.ru)

## 🛠️ COMMANDS TO ACCESS SERVICES

### Yandex Cloud CLI Commands
```bash
# Check CDN status
yc cdn resource get bc8rilebboch3mrd3uds

# Update CDN origin protocol
yc cdn resource update bc8rilebboch3mrd3uds --origin-protocol http

# Set host header
yc cdn resource update bc8rilebboch3mrd3uds --host-header e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru

# Clear CDN cache
yc cdn cache purge --resource-id bc8rilebboch3mrd3uds --path "/*"

# Check origin group
yc cdn origin-group get 3400233002361363975

# List all CDN resources
yc cdn resource list

# Check certificate
yc certificate-manager certificate get fpqo246eeh9vagoei57p
```

### Testing & Operations Commands
```bash
# Test S3 bucket directly
curl -I https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
wget https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru

# Test CDN with Host header (HTTP)
wget --spider -S --header="Host: vnvnc.ru" http://bf1cb789559b3dc5.a.yccdn.cloud.yandex.net/

# Check DNS
dig vnvnc.ru
dig www.vnvnc.ru
nslookup vnvnc.ru

# Purge CDN cache after deploy
yc cdn cache purge --resource-id bc8rilebboch3mrd3uds --path "/*"
```

### Selectel Access
1. **S3 Bucket URL**: https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
2. **Control Panel**: https://my.selectel.ru/
3. **DNS Management**: In Selectel control panel under DNS zones

### Deploy to Selectel S3
```bash
# Build the project
npm run build

# Deploy using AWS CLI with Selectel endpoint
aws s3 sync dist/ s3://vnvnc/ --endpoint-url=https://s3.ru-7.storage.selcloud.ru --delete

# Or use the deployment script
./deploy-to-selectel.sh
```

## 🟢 WHAT WAS CHANGED (RESOLUTION)

1. Added secondary hostnames to CDN resource: `vnvnc.ru`, `www.vnvnc.ru`
2. Switched origin protocol to HTTPS and fixed Host Header to the bucket hostname
3. Imported Let's Encrypt certificate (full chain) to Certificate Manager and attached it to CDN resource
4. Enabled HTTP→HTTPS redirect on CDN
5. Purged CDN cache and verified end-to-end

## 🤔 POSSIBLE ROOT CAUSES

1. **S3 Bucket Configuration Issue**
   - Bucket might not be configured for static website hosting properly
   - Index document might not be set
   - Public access might be restricted

2. **CDN Can't Access S3**
   - Authentication issue between Yandex CDN and Selectel S3
   - CORS configuration blocking CDN requests
   - Network/firewall issue

3. **Wrong Origin Format**
   - Selectel S3 might need different endpoint format for CDN access
   - Might need website endpoint instead of API endpoint

4. **Certificate Issue in Selectel**
   - Certificate uploaded to Selectel but not bound to bucket
   - Bucket still using old certificate

## 🚀 POTENTIAL SOLUTIONS TO TRY

### Option 1: Fix Selectel S3 Configuration
1. Check if bucket has static website hosting enabled
2. Verify index.html is set as index document
3. Check bucket policy allows public read
4. Install new certificate to the bucket (if possible)

### Option 2: Use Different S3 Endpoint
1. Find the static website endpoint (not API endpoint)
2. Usually format like: bucketname.website.selcdn.ru
3. Update Yandex CDN origin to use website endpoint

### Option 3: Switch to Yandex Object Storage
1. Create bucket in Yandex Object Storage
2. Copy all files from Selectel
3. Configure static website hosting
4. Update CDN to use Yandex origin

### Option 4: Use a Simple Proxy Server
1. Create small VPS on Yandex Cloud
2. Install nginx
3. Configure proxy_pass to Selectel S3
4. Point CDN to nginx server

### Option 5: Direct S3 Access (Temporary)
1. Configure Selectel S3 bucket for direct access
2. Point DNS directly to S3 (if possible)
3. Skip CDN entirely (but lose HTTPS on root domain)

## 📝 INFORMATION NEEDED FROM SELECTEL SUPPORT

1. **What is the correct static website endpoint for the bucket?**
2. **How to bind the new SSL certificate to the bucket?**
3. **Is there a special configuration needed for CDN access?**
4. **Can the bucket serve root domain directly?**
5. **Are there any access restrictions on the bucket?**

## 🔄 NEXT STEPS

1. **Check Selectel S3 bucket settings**
   - Verify static website hosting is enabled
   - Check index document configuration
   - Verify public access settings

2. **Contact Selectel Support**
   - Ask about static website endpoint
   - Ask about certificate binding
   - Ask about CDN compatibility

3. **Test Alternative Configurations**
   - Try different origin URLs
   - Test with bucket website endpoint
   - Try without any host headers

4. **Consider Migration**
   - If Selectel can't support this, migrate to Yandex Object Storage
   - Or use a different hosting solution entirely

## 📌 QUICK REFERENCE

- **S3 Bucket**: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
- **CDN Provider CNAME**: bf1cb789559b3dc5.a.yccdn.cloud.yandex.net
- **CDN Resource ID**: bc8rilebboch3mrd3uds
- **Certificate ID (CM)**: fpq6ebsc38egmpblgvq6
- **Origin Group ID**: 3400233002361363975

## ⚠️ CRITICAL NOTE

The fundamental issue appears to be that Yandex CDN cannot properly fetch content from Selectel S3, even though the S3 bucket is publicly accessible. This suggests either:
1. A configuration mismatch between what Yandex CDN expects and what Selectel S3 provides
2. An authentication/authorization issue
3. A network/routing problem

The website worked before when accessed directly from Selectel S3, so the content and basic setup are correct. The problem is specifically with the CDN-to-S3 connection.

---

**Last Updated**: September 14, 2025
**Status**: OPERATIONAL