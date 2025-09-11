#!/bin/bash

# Deployment script for Yandex Cloud Functions
# Prerequisites: yc CLI installed and configured

echo "🚀 Deploying VNVNC functions to Yandex Cloud..."

# Set your Yandex Cloud folder ID
FOLDER_ID="your-folder-id-here"
SERVICE_ACCOUNT="your-service-account-id"

# Create functions if they don't exist
echo "📦 Creating/updating TicketsCloud function..."
yc serverless function create \
  --name vnvnc-tickets-cloud \
  --folder-id $FOLDER_ID \
  --runtime nodejs18 \
  --entrypoint tickets-cloud-function.handler \
  --memory 128m \
  --execution-timeout 10s \
  --service-account-id $SERVICE_ACCOUNT

echo "📦 Creating/updating Yandex Disk function..."
yc serverless function create \
  --name vnvnc-yandex-disk \
  --folder-id $FOLDER_ID \
  --runtime nodejs18 \
  --entrypoint yandex-disk-function.handler \
  --memory 256m \
  --execution-timeout 30s \
  --service-account-id $SERVICE_ACCOUNT

echo "📦 Creating/updating Forms function..."
yc serverless function create \
  --name vnvnc-forms \
  --folder-id $FOLDER_ID \
  --runtime nodejs18 \
  --entrypoint forms-function.handler \
  --memory 128m \
  --execution-timeout 10s \
  --service-account-id $SERVICE_ACCOUNT \
  --environment TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN \
  --environment BREVO_API_KEY=$BREVO_API_KEY

# Deploy function code
echo "📤 Deploying TicketsCloud function code..."
zip tickets-cloud.zip tickets-cloud-function.js
yc serverless function version create \
  --function-name vnvnc-tickets-cloud \
  --runtime nodejs18 \
  --entrypoint tickets-cloud-function.handler \
  --memory 128m \
  --execution-timeout 10s \
  --source-path tickets-cloud.zip

echo "📤 Deploying Yandex Disk function code..."
zip yandex-disk.zip gateway-disk.cjs package.json
yc serverless function version create \
  --function-name vnvnc-yandex-disk \
  --runtime nodejs18 \
  --entrypoint gateway-disk.handler \
  --memory 256m \
  --execution-timeout 30s \
  --source-path yandex-disk.zip

echo "📤 Deploying Forms function code..."
zip forms.zip forms-function.js
yc serverless function version create \
  --function-name vnvnc-forms \
  --runtime nodejs18 \
  --entrypoint forms-function.handler \
  --memory 128m \
  --execution-timeout 10s \
  --source-path forms.zip

# Make functions public
echo "🔓 Making functions public..."
yc serverless function allow-unauthenticated-invoke vnvnc-tickets-cloud
yc serverless function allow-unauthenticated-invoke vnvnc-yandex-disk
yc serverless function allow-unauthenticated-invoke vnvnc-forms

# Get function URLs
echo "✅ Deployment complete! Your function URLs:"
echo ""
echo "TicketsCloud API:"
yc serverless function get vnvnc-tickets-cloud | grep http_invoke_url
echo ""
echo "Yandex Disk API:"
yc serverless function get vnvnc-yandex-disk | grep http_invoke_url
echo ""
echo "Forms API:"
yc serverless function get vnvnc-forms | grep http_invoke_url

# Clean up zip files
rm -f tickets-cloud.zip yandex-disk.zip forms.zip

echo ""
echo "📝 Update your frontend services with these new URLs!"