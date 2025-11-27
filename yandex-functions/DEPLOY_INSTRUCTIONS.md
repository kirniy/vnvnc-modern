# Yandex Cloud Function Deployment Instructions

## Prerequisites
- Yandex Cloud CLI (`yc`) installed and configured
- Access to the Yandex Cloud account

## API Gateway Details
- **Gateway Name**: `vnvnc-api-gateway`
- **Gateway ID**: `d5d621jmge79dusl8rkh`
- **Base URL**: `https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net`

## Function IDs
| Function | ID | Purpose |
|----------|-----|---------|
| TicketsCloud Proxy | `d4ehafn3ofbigbqr3nsn` | Proxies requests to TicketsCloud API |
| Yandex Disk | `d4epi3grr6a3nb6maug3` | Gallery photos from Yandex Disk |
| Forms Handler | `d4e2qumbfs0s4q88bodd` | Booking, contact, rental, merch orders |

---

## TicketsCloud Function Deployment

### 1. Create ZIP archive
```bash
cd yandex-functions
zip tickets-cloud.zip tickets-cloud-function.js
```

### 2. Deploy the function version
```bash
yc serverless function version create \
  --function-id d4ehafn3ofbigbqr3nsn \
  --runtime nodejs18 \
  --entrypoint tickets-cloud-function.handler \
  --memory 128m \
  --execution-timeout 10s \
  --source-path tickets-cloud.zip
```

### 3. Verify the deployment
```bash
# Test via /tc/ route
curl "https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/tc/v1/resources/events?key=c862e40ed178486285938dda33038e30"

# Test via /api/ route (legacy)
curl "https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/api/v1/resources/events?key=c862e40ed178486285938dda33038e30"
```

### Important: Path Normalization
The function normalizes incoming paths from both `/api/` and `/tc/` prefixes:
```javascript
const normalizedPath = rawPath.replace(/^\/?(api|tc)\//, '/');
```
This ensures `/tc/v1/resources/events` → `/v1/resources/events` for TicketsCloud API.

---

## Yandex Disk Function Deployment

### 1. Create ZIP archive
```bash
cd yandex-functions
zip -r yandex-disk.zip gateway-disk.cjs package.json
```

### 2. Deploy the function version
```bash
yc serverless function version create \
  --function-id d4epi3grr6a3nb6maug3 \
  --runtime nodejs18 \
  --entrypoint gateway-disk.handler \
  --memory 256m \
  --execution-timeout 30s \
  --source-path yandex-disk.zip
```

### 3. Verify the deployment
```bash
# Test photos endpoint
curl https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/api/yandex-disk/photos?limit=1

# Test dates endpoint
curl https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/api/yandex-disk/dates
```

---

## Forms Function Deployment

### 1. Create ZIP archive
```bash
cd yandex-functions
zip forms.zip index.js
```

### 2. Deploy the function version
```bash
yc serverless function version create \
  --function-id d4e2qumbfs0s4q88bodd \
  --runtime nodejs18 \
  --entrypoint index.handler \
  --memory 128m \
  --execution-timeout 10s \
  --source-path forms.zip
```

### 3. Verify the deployment
```bash
# Test booking endpoint (should return 400 for GET)
curl https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/booking
```

---

## API Gateway Spec Deployment

When route changes are needed:

```bash
yc serverless api-gateway update \
  --id d5d621jmge79dusl8rkh \
  --spec yandex-functions/api-gateway-working.yaml
```

### Route Order (CRITICAL!)
More specific routes MUST come BEFORE catch-all routes:
1. `/api/yandex-disk/{path+}` - Specific route for Yandex Disk
2. `/booking`, `/rental`, `/contact`, `/merch-order` - Specific form routes
3. `/tc/{path+}` - TicketsCloud via /tc/ prefix
4. `/api/{path+}` - TicketsCloud via /api/ prefix (MUST be LAST)

---

## Troubleshooting

### Events API returning 404
1. Check API Gateway spec has both `/api/{path+}` and `/tc/{path+}` routes
2. Verify route order (yandex-disk before generic api)
3. Check function path normalization handles both prefixes
4. Test direct function invocation:
```bash
yc serverless function invoke d4ehafn3ofbigbqr3nsn --data '{"httpMethod":"GET","path":"/v1/resources/events","queryStringParameters":{"key":"c862e40ed178486285938dda33038e30"}}'
```

### Function not receiving correct path
Check `event.params.path` or `event.params.proxy` contains the path parameter from API Gateway.

---

## Notes
- Yandex Disk fetches from public folder: https://disk.yandex.ru/d/sab0EP9Sm3G8LA
- CORS headers are included for browser access
- Images are proxied through the function to avoid CORS issues
- Service account ID: `aje9aok7e67g6igumr3e`