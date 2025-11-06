#!/bin/bash

# Deploy to Selectel S3
echo "🚀 Deploying to Selectel..."

# Build the project
echo "📦 Building..."
npm run build

# Generate static OG pages for event short links
echo "🖼️ Generating event OG pages..."
node ./scripts/generate-event-og-pages.js

# Generate videocircles manifest for all MP4s
echo "📝 Generating videocircles manifest..."
node ./scripts/generate-video-manifest.js

# Upload JS/CSS files with long cache FIRST (so HTML references won't 404)
echo "☁️ Uploading JS/CSS files (cached) first..."
aws --endpoint-url=https://s3.ru-7.storage.selcloud.ru \
    s3 sync ./dist s3://vnvnc \
    --profile selectel \
    --acl public-read \
    --exclude "*.html" \
    --include "*.js" \
    --include "*.css" \
    --cache-control "public, max-age=31536000, immutable" \
    --metadata-directive REPLACE

# Upload other assets (images, media)
echo "☁️ Uploading other assets..."
aws --endpoint-url=https://s3.ru-7.storage.selcloud.ru \
    s3 sync ./dist s3://vnvnc \
    --profile selectel \
    --acl public-read \
    --exclude "*.html" \
    --exclude "*.js" \
    --exclude "*.css" \
    --cache-control "public, max-age=86400" \
    --metadata-directive REPLACE

# Upload manifest.json with no-cache to ensure clients can see new files list
echo "☁️ Uploading videocircles manifest with no-cache..."
aws --endpoint-url=https://s3.ru-7.storage.selcloud.ru \
    s3 cp ./dist/videocircles/manifest.json s3://vnvnc/videocircles/manifest.json \
    --profile selectel \
    --acl public-read \
    --content-type application/json \
    --cache-control "no-cache, no-store, must-revalidate" \
    --metadata-directive REPLACE || true

# Upload HTML files with no-cache headers LAST
echo "☁️ Uploading HTML files (no-cache) last..."
aws --endpoint-url=https://s3.ru-7.storage.selcloud.ru \
    s3 sync ./dist s3://vnvnc \
    --profile selectel \
    --acl public-read \
    --delete \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --metadata-directive REPLACE

echo "✅ Deployment complete!"
echo "🌐 Live at: https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru"
echo "⚠️  Clear browser cache if you see old content!"
