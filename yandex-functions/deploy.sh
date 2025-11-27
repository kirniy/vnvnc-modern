#!/bin/bash

# Deployment script for Yandex Cloud Functions
# Prerequisites: yc CLI installed and configured
# Last updated: November 2025 - Fixed TicketsCloud path normalization

set -e  # Exit on error

echo "🚀 Deploying VNVNC functions to Yandex Cloud..."

# Configuration - ACTUAL VALUES
API_GATEWAY_ID="d5d621jmge79dusl8rkh"
TICKETSCLOUD_FUNCTION_ID="d4ehafn3ofbigbqr3nsn"
YANDEX_DISK_FUNCTION_ID="d4epi3grr6a3nb6maug3"
FORMS_FUNCTION_ID="d4e2qumbfs0s4q88bodd"
SERVICE_ACCOUNT_ID="aje9aok7e67g6igumr3e"
API_BASE_URL="https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net"
TC_API_KEY="c862e40ed178486285938dda33038e30"

# Change to script directory
cd "$(dirname "$0")"

# Parse command line arguments
DEPLOY_ALL=false
DEPLOY_TC=false
DEPLOY_DISK=false
DEPLOY_FORMS=false
DEPLOY_GATEWAY=false

if [ $# -eq 0 ]; then
    DEPLOY_ALL=true
fi

for arg in "$@"; do
    case $arg in
        --all) DEPLOY_ALL=true ;;
        --tc|--tickets) DEPLOY_TC=true ;;
        --disk|--yandex-disk) DEPLOY_DISK=true ;;
        --forms) DEPLOY_FORMS=true ;;
        --gateway) DEPLOY_GATEWAY=true ;;
        --help)
            echo "Usage: ./deploy.sh [--all|--tc|--disk|--forms|--gateway]"
            echo "  --all      Deploy all functions and gateway"
            echo "  --tc       Deploy TicketsCloud proxy function"
            echo "  --disk     Deploy Yandex Disk function"
            echo "  --forms    Deploy Forms handler function"
            echo "  --gateway  Deploy API Gateway spec only"
            exit 0
            ;;
    esac
done

# Deploy TicketsCloud function
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_TC" = true ]; then
    echo ""
    echo "📤 Deploying TicketsCloud function..."
    rm -f tickets-cloud.zip
    zip tickets-cloud.zip tickets-cloud-function.js
    yc serverless function version create \
      --function-id $TICKETSCLOUD_FUNCTION_ID \
      --runtime nodejs18 \
      --entrypoint tickets-cloud-function.handler \
      --memory 128m \
      --execution-timeout 10s \
      --source-path tickets-cloud.zip
    echo "✅ TicketsCloud function deployed"
fi

# Deploy Yandex Disk function
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_DISK" = true ]; then
    echo ""
    echo "📤 Deploying Yandex Disk function..."
    rm -f yandex-disk.zip
    zip -r yandex-disk.zip gateway-disk.cjs package.json
    yc serverless function version create \
      --function-id $YANDEX_DISK_FUNCTION_ID \
      --runtime nodejs18 \
      --entrypoint gateway-disk.handler \
      --memory 256m \
      --execution-timeout 30s \
      --source-path yandex-disk.zip
    echo "✅ Yandex Disk function deployed"
fi

# Deploy Forms function
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_FORMS" = true ]; then
    echo ""
    echo "📤 Deploying Forms function..."
    rm -f forms.zip
    zip forms.zip index.js
    yc serverless function version create \
      --function-id $FORMS_FUNCTION_ID \
      --runtime nodejs18 \
      --entrypoint index.handler \
      --memory 128m \
      --execution-timeout 10s \
      --source-path forms.zip
    echo "✅ Forms function deployed"
fi

# Deploy API Gateway spec
if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_GATEWAY" = true ]; then
    echo ""
    echo "📤 Deploying API Gateway spec..."
    yc serverless api-gateway update \
      --id $API_GATEWAY_ID \
      --spec api-gateway-working.yaml
    echo "✅ API Gateway spec deployed"
fi

# Clean up zip files
rm -f tickets-cloud.zip yandex-disk.zip forms.zip

# Verification
echo ""
echo "🔍 Verifying deployments..."

if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_TC" = true ] || [ "$DEPLOY_GATEWAY" = true ]; then
    echo ""
    echo "Testing TicketsCloud API (/tc/ route)..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/tc/v1/resources/events?key=$TC_API_KEY")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ TicketsCloud /tc/ route: OK (HTTP $HTTP_CODE)"
    else
        echo "❌ TicketsCloud /tc/ route: FAILED (HTTP $HTTP_CODE)"
    fi

    echo "Testing TicketsCloud API (/api/ route)..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/api/v1/resources/events?key=$TC_API_KEY")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ TicketsCloud /api/ route: OK (HTTP $HTTP_CODE)"
    else
        echo "❌ TicketsCloud /api/ route: FAILED (HTTP $HTTP_CODE)"
    fi
fi

if [ "$DEPLOY_ALL" = true ] || [ "$DEPLOY_DISK" = true ]; then
    echo ""
    echo "Testing Yandex Disk API..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/api/yandex-disk/photos?limit=1")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Yandex Disk API: OK (HTTP $HTTP_CODE)"
    else
        echo "❌ Yandex Disk API: FAILED (HTTP $HTTP_CODE)"
    fi
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "API Gateway URL: $API_BASE_URL"
echo "Routes:"
echo "  - /tc/v1/resources/events     → TicketsCloud API"
echo "  - /api/v1/resources/events    → TicketsCloud API (legacy)"
echo "  - /api/yandex-disk/*          → Yandex Disk gallery"
echo "  - /booking, /contact, /rental → Forms handler"
echo "  - /merch-order                → Merch order handler"