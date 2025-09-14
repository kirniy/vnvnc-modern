# DNS Update Instructions for Selectel

## 🚨 IMPORTANT: Update Your DNS Records Now

Your Yandex Cloud CDN is ready! Now you need to update DNS records in Selectel.

## CDN Endpoint
```
bf1cb789559b3dc5.a.yccdn.cloud.yandex.net
```

## Steps to Update DNS in Selectel

### 1. Go to Selectel DNS Management
- Login to Selectel Control Panel
- Navigate to DNS zones
- Select `vnvnc.ru` zone

### 2. Delete These OLD Records
Look for and DELETE these records:
- `vnvnc.ru` → ALIAS → `access.ru-7.storage.selcloud.ru`
- `www.vnvnc.ru` → CNAME → `access.ru-7.storage.selcloud.ru`

### 3. Add These NEW Records

#### For vnvnc.ru (root domain):
```
Type: ALIAS (or ANAME if available)
Name: @ (or leave empty)
Value: bf1cb789559b3dc5.a.yccdn.cloud.yandex.net
TTL: 300
```

#### For www.vnvnc.ru:
```
Type: CNAME
Name: www
Value: bf1cb789559b3dc5.a.yccdn.cloud.yandex.net
TTL: 300
```

### 4. Save Changes
Click save/apply to update the DNS zone.

## Verification Steps

After updating DNS (wait 5-15 minutes):

1. Check DNS propagation:
```bash
nslookup vnvnc.ru
nslookup www.vnvnc.ru
```

2. Test the websites:
- https://vnvnc.ru
- https://www.vnvnc.ru

Both should load without SSL errors!

## What's Happening?

```
User → vnvnc.ru → DNS → Yandex CDN → Selectel S3
```

The Yandex CDN is now:
1. Receiving requests for vnvnc.ru
2. Fetching content from your Selectel S3 bucket
3. Serving it with proper SSL certificate
4. Caching for better performance

## Troubleshooting

**Site not loading?**
- Wait up to 30 minutes for DNS propagation
- Clear browser cache
- Try incognito mode

**SSL Error?**
- Certificate is valid until Dec 12, 2025
- Should work automatically once DNS updates

**Content not updating?**
- CDN caches content for 24 hours by default
- Can be purged from Yandex Cloud Console if needed

## Success Checklist
- [ ] Old DNS records deleted
- [ ] New ALIAS record for vnvnc.ru added
- [ ] New CNAME record for www.vnvnc.ru added
- [ ] Waited 15 minutes for propagation
- [ ] https://vnvnc.ru loads without errors
- [ ] https://www.vnvnc.ru loads without errors

---
Created: September 14, 2025
CDN Resource ID: bc8r6mazvdt6r7jlkth2
Certificate ID: fpqq2forhge3pfdabf2s