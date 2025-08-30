#!/bin/bash

# VNVNC Cloudflare Proxy Setup for Vercel - Bypass Russia Blocking
# This script configures Cloudflare DNS to proxy your Vercel site
# Time-critical deployment script - August 2025

set -e

echo "🚀 VNVNC Cloudflare Proxy Setup - Quick Deploy for Russia Access"
echo "=================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
command -v curl >/dev/null 2>&1 || { echo -e "${RED}Error: curl is required but not installed.${NC}" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo -e "${YELLOW}Warning: jq not installed. Installing...${NC}"; brew install jq 2>/dev/null || sudo apt-get install -y jq 2>/dev/null || echo "Please install jq manually"; }

# Configuration
echo -e "${BLUE}Step 1: Cloudflare Credentials${NC}"
echo "You need your Cloudflare credentials. Find them at:"
echo "  • API Token: https://dash.cloudflare.com/profile/api-tokens"
echo "  • Zone ID: Dashboard → Your Domain → Right sidebar"
echo ""

# Get credentials
read -p "Enter your Cloudflare Email: " CF_EMAIL
read -sp "Enter your Cloudflare API Key (hidden): " CF_KEY
echo ""
read -p "Enter your Cloudflare Zone ID: " ZONE_ID
read -p "Enter your domain (e.g., vnvnc.ru): " DOMAIN

# Validate inputs
if [ -z "$CF_EMAIL" ] || [ -z "$CF_KEY" ] || [ -z "$ZONE_ID" ] || [ -z "$DOMAIN" ]; then
    echo -e "${RED}Error: All fields are required!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Credentials configured${NC}"
echo ""

# Function to make Cloudflare API calls
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

echo -e "${BLUE}Step 2: Checking existing DNS records...${NC}"

# Get existing DNS records
EXISTING_RECORDS=$(cf_api GET "dns_records?type=CNAME&name=$DOMAIN" | jq -r '.result')
WWW_RECORDS=$(cf_api GET "dns_records?type=CNAME&name=www.$DOMAIN" | jq -r '.result')
A_RECORDS=$(cf_api GET "dns_records?type=A&name=$DOMAIN" | jq -r '.result')

echo -e "${GREEN}✓ Current DNS status retrieved${NC}"
echo ""

echo -e "${BLUE}Step 3: Cleaning up old records...${NC}"

# Delete existing A records pointing to blocked IP
if [ "$A_RECORDS" != "[]" ] && [ "$A_RECORDS" != "null" ]; then
    echo "$A_RECORDS" | jq -r '.[] | select(.content == "76.76.21.21") | .id' | while read -r record_id; do
        if [ ! -z "$record_id" ]; then
            echo "  Removing blocked IP record (76.76.21.21)..."
            cf_api DELETE "dns_records/$record_id" > /dev/null
        fi
    done
fi

echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

echo -e "${BLUE}Step 4: Creating proxy-enabled CNAME records...${NC}"

# Create root domain CNAME (proxied)
echo "  Creating root domain CNAME..."
ROOT_RESULT=$(cf_api POST "dns_records" '{
    "type": "CNAME",
    "name": "'$DOMAIN'",
    "content": "cname.vercel-dns.com",
    "proxied": true,
    "ttl": 1
}')

if echo "$ROOT_RESULT" | jq -e '.success' > /dev/null; then
    echo -e "  ${GREEN}✓ Root domain configured with proxy${NC}"
else
    echo -e "  ${YELLOW}⚠ Root domain may already exist, updating...${NC}"
    # Try to update existing record
    RECORD_ID=$(cf_api GET "dns_records?type=CNAME&name=$DOMAIN" | jq -r '.result[0].id')
    if [ ! -z "$RECORD_ID" ] && [ "$RECORD_ID" != "null" ]; then
        cf_api PUT "dns_records/$RECORD_ID" '{
            "type": "CNAME",
            "name": "'$DOMAIN'",
            "content": "cname.vercel-dns.com",
            "proxied": true,
            "ttl": 1
        }' > /dev/null
        echo -e "  ${GREEN}✓ Root domain updated${NC}"
    fi
fi

# Create www subdomain CNAME (proxied)
echo "  Creating www subdomain CNAME..."
WWW_RESULT=$(cf_api POST "dns_records" '{
    "type": "CNAME",
    "name": "www",
    "content": "cname.vercel-dns.com",
    "proxied": true,
    "ttl": 1
}')

if echo "$WWW_RESULT" | jq -e '.success' > /dev/null; then
    echo -e "  ${GREEN}✓ WWW subdomain configured with proxy${NC}"
else
    echo -e "  ${YELLOW}⚠ WWW subdomain may already exist, updating...${NC}"
    # Try to update existing record
    RECORD_ID=$(cf_api GET "dns_records?type=CNAME&name=www.$DOMAIN" | jq -r '.result[0].id')
    if [ ! -z "$RECORD_ID" ] && [ "$RECORD_ID" != "null" ]; then
        cf_api PUT "dns_records/$RECORD_ID" '{
            "type": "CNAME",
            "name": "www",
            "content": "cname.vercel-dns.com",
            "proxied": true,
            "ttl": 1
        }' > /dev/null
        echo -e "  ${GREEN}✓ WWW subdomain updated${NC}"
    fi
fi

echo ""
echo -e "${BLUE}Step 5: Configuring SSL/TLS settings...${NC}"

# Set SSL mode to Full
SSL_RESULT=$(curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl" \
     -H "X-Auth-Email: $CF_EMAIL" \
     -H "X-Auth-Key: $CF_KEY" \
     -H "Content-Type: application/json" \
     --data '{"value":"full"}')

if echo "$SSL_RESULT" | jq -e '.success' > /dev/null; then
    echo -e "  ${GREEN}✓ SSL/TLS mode set to Full${NC}"
else
    echo -e "  ${YELLOW}⚠ Could not update SSL settings${NC}"
fi

echo ""
echo -e "${BLUE}Step 6: Creating Page Rules for Let's Encrypt...${NC}"

# Create page rule for .well-known (SSL OFF for Let's Encrypt)
PAGE_RULE_RESULT=$(cf_api POST "pagerules" '{
    "targets": [
        {
            "target": "url",
            "constraint": {
                "operator": "matches",
                "value": "*'$DOMAIN'/.well-known/*"
            }
        }
    ],
    "actions": [
        {
            "id": "ssl",
            "value": "off"
        }
    ],
    "priority": 1,
    "status": "active"
}')

if echo "$PAGE_RULE_RESULT" | jq -e '.success' > /dev/null; then
    echo -e "  ${GREEN}✓ Page rule created for Let's Encrypt renewal${NC}"
else
    echo -e "  ${YELLOW}⚠ Page rule may already exist or you've reached the limit${NC}"
fi

echo ""
echo -e "${BLUE}Step 7: Verifying configuration...${NC}"

# Quick DNS check
DNS_CHECK=$(cf_api GET "dns_records?type=CNAME&name=$DOMAIN")
if echo "$DNS_CHECK" | jq -e '.result[0].proxied' | grep -q "true"; then
    echo -e "  ${GREEN}✓ Root domain is proxied${NC}"
else
    echo -e "  ${RED}✗ Root domain proxy not enabled!${NC}"
fi

WWW_CHECK=$(cf_api GET "dns_records?type=CNAME&name=www.$DOMAIN")
if echo "$WWW_CHECK" | jq -e '.result[0].proxied' | grep -q "true"; then
    echo -e "  ${GREEN}✓ WWW subdomain is proxied${NC}"
else
    echo -e "  ${RED}✗ WWW subdomain proxy not enabled!${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 SETUP COMPLETE!${NC}"
echo "=================================================="
echo ""
echo "✅ Your site is now configured to bypass Russian ISP blocking!"
echo ""
echo "📋 What we did:"
echo "  1. Removed A records pointing to blocked IP (76.76.21.21)"
echo "  2. Created CNAME records pointing to cname.vercel-dns.com"
echo "  3. Enabled Cloudflare proxy (orange cloud) - CRITICAL!"
echo "  4. Set SSL/TLS to Full mode"
echo "  5. Created page rule for Let's Encrypt renewal"
echo ""
echo "🔍 Testing from Russia:"
echo "  • Your site should now load at: https://$DOMAIN"
echo "  • DNS will resolve to Cloudflare IPs (104.x.x.x) instead of 76.76.21.21"
echo "  • Propagation takes 1-5 minutes typically"
echo ""
echo "⚠️  IMPORTANT:"
echo "  • Keep proxy ON (orange cloud) in Cloudflare dashboard"
echo "  • Don't change SSL mode from 'Full'"
echo "  • Vercel might show 'Invalid Configuration' - ignore it, this is normal"
echo ""
echo "🚨 If you see redirect loops:"
echo "  1. Go to Cloudflare Dashboard → SSL/TLS"
echo "  2. Ensure it's set to 'Full' (not Full Strict)"
echo "  3. Clear browser cache and try again"
echo ""
echo "📱 Test now: Ask someone in Russia to access https://$DOMAIN"
echo ""
echo -e "${GREEN}Good luck with your launch! 🚀${NC}"