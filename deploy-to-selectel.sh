#!/bin/bash

# Deploy to Selectel S3
echo "🚀 Deploying to Selectel..."

# Build the project
echo "📦 Building..."
npm run build

# Upload to Selectel
echo "☁️ Uploading to Selectel..."
aws --endpoint-url=https://s3.ru-7.storage.selcloud.ru \
    s3 sync ./dist s3://vnvnc \
    --profile selectel \
    --acl public-read \
    --delete

echo "✅ Deployment complete!"
echo "🌐 Live at: https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru"