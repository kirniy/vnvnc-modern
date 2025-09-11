#!/bin/bash

# Quick deployment script for Yandex Disk function
# Run this to deploy the fixed function to Yandex Cloud

echo "🚀 Quick deploy for Yandex Disk gallery function"
echo ""

# Create the zip file
echo "📦 Creating deployment package..."
zip -r yandex-disk.zip gateway-disk.cjs package.json

# Deploy to existing function
echo "📤 Deploying to Yandex Cloud Function..."
echo ""
echo "Run this command to deploy:"
echo ""
echo "yc serverless function version create \\"
echo "  --function-id d4epi3grr6a3nb6maug3 \\"
echo "  --runtime nodejs18 \\"
echo "  --entrypoint gateway-disk.handler \\"
echo "  --memory 256m \\"
echo "  --execution-timeout 30s \\"
echo "  --source-path yandex-disk.zip"
echo ""
echo "After deployment, the gallery should work at:"
echo "https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/api/yandex-disk/photos"