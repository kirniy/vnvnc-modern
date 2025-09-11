# Yandex Cloud Function Deployment Instructions

## Prerequisites
- Yandex Cloud CLI (`yc`) installed and configured
- Access to the Yandex Cloud account

## Deployment Steps

### 1. Create ZIP archive for the function
```bash
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
Open the test page in browser:
```
test-live-apis.html
```

Or test with curl:
```bash
# Test photos endpoint
curl https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/api/yandex-disk/photos?limit=1

# Test dates endpoint  
curl https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/api/yandex-disk/dates
```

## Function Details
- **Function ID**: d4epi3grr6a3nb6maug3
- **API Gateway URL**: https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net
- **Endpoints**:
  - `/api/yandex-disk/photos` - Get photos from Yandex Disk
  - `/api/yandex-disk/dates` - Get available dates
  - `/api/yandex-disk/proxy` - Proxy for images
  - `/api/yandex-disk/download` - Get download URL

## Notes
- The function fetches from public Yandex Disk folder: https://disk.yandex.ru/d/sab0EP9Sm3G8LA
- CORS headers are included for browser access
- Images are proxied through the function to avoid CORS issues