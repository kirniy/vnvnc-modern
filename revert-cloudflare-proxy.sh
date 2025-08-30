#!/bin/bash

# VNVNC Cloudflare Proxy REVERT Script
# This reverts back to direct Vercel setup (removes proxy)

set -e

echo "🔄 VNVNC Cloudflare Proxy REVERT"
echo "=================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get credentials
read -p "Enter your Cloudflare Email: " CF_EMAIL
read -sp "Enter your Cloudflare API Key (hidden): " CF_KEY
echo ""
read -p "Enter your Cloudflare Zone ID: " ZONE_ID
read -p "Enter your domain (e.g., vnvnc.ru): " DOMAIN

# Function to make API calls
cf_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -z "$data" ]; then
        curl -s -X "$method" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/$endpoint" \
             -H "X-Auth-Email: $CF_EMAIL" \
             -H "X-Auth-Key: $CF_KEY" \
             -H "Content-Type: application/json"
    else
        curl -s -X "$method" "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/$endpoint" \
             -H "X-Auth-Email: $CF_EMAIL" \
             -H "X-Auth-Key: $CF_KEY" \
             -H "Content-Type: application/json" \
             --data "$data"
    fi
}

echo -e "${BLUE}Reverting to standard Vercel setup...${NC}"

# Delete CNAME records
echo "  Removing CNAME records..."
ROOT_ID=$(cf_api GET "dns_records?type=CNAME&name=$DOMAIN" | jq -r '.result[0].id')
if [ ! -z "$ROOT_ID" ] && [ "$ROOT_ID" != "null" ]; then
    cf_api DELETE "dns_records/$ROOT_ID" > /dev/null
    echo -e "  ${GREEN}✓ Root CNAME removed${NC}"
fi

WWW_ID=$(cf_api GET "dns_records?type=CNAME&name=www.$DOMAIN" | jq -r '.result[0].id')
if [ ! -z "$WWW_ID" ] && [ "$WWW_ID" != "null" ]; then
    cf_api DELETE "dns_records/$WWW_ID" > /dev/null
    echo -e "  ${GREEN}✓ WWW CNAME removed${NC}"
fi

# Add back A record pointing to Vercel
echo "  Adding A record for Vercel..."
cf_api POST "dns_records" '{
    "type": "A",
    "name": "'$DOMAIN'",
    "content": "76.76.21.21",
    "proxied": false,
    "ttl": 300
}' > /dev/null
echo -e "  ${GREEN}✓ A record added (76.76.21.21)${NC}"

# Add www CNAME pointing to root
echo "  Adding www CNAME..."
cf_api POST "dns_records" '{
    "type": "CNAME",
    "name": "www",
    "content": "'$DOMAIN'",
    "proxied": false,
    "ttl": 300
}' > /dev/null
echo -e "  ${GREEN}✓ WWW CNAME added${NC}"

echo ""
echo "=================================================="
echo -e "${GREEN}✅ REVERT COMPLETE!${NC}"
echo "=================================================="
echo ""
echo "Your DNS is now back to standard Vercel configuration:"
echo "  • A record: $DOMAIN → 76.76.21.21 (no proxy)"
echo "  • CNAME: www.$DOMAIN → $DOMAIN (no proxy)"
echo ""
echo "⚠️  Note: This will restore the Russia blocking issue"
echo ""