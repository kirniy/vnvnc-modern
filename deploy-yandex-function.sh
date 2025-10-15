#!/bin/bash

# Deploy script for Yandex Cloud Function - Gallery Disk API

echo "🚀 Deploying Yandex Cloud Function for Gallery..."

# Navigate to the yandex-functions directory
cd yandex-functions

# Create deployment package
echo "📦 Creating deployment package..."
rm -f yandex-disk.zip
zip -r yandex-disk.zip gateway-disk.cjs gateway-disk.js package.json

echo "✅ Package created: yandex-disk.zip"
echo ""
echo "📝 To deploy to Yandex Cloud, run:"
echo ""
echo "yc serverless function version create \\"
echo "  --function-id d4epi3grr6a3nb6maug3 \\"
echo "  --runtime nodejs18 \\"
echo "  --entrypoint gateway-disk.handler \\"
echo "  --memory 256m \\"
echo "  --execution-timeout 30s \\"
echo "  --source-path ./yandex-functions/yandex-disk.zip"
echo ""
echo "🔗 After deployment, the gallery will be available at:"
echo "   https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/api/yandex-disk/photos"
echo ""
echo "🧪 Test the API using: open test-yandex-api.html"
