#!/usr/bin/env python3
"""
reg.ru DNS Setup Script for vnvnc.ru
Configures DNS records to point to Vercel hosting
"""

import json
import requests
import sys
from typing import Dict, Any

# Configuration
DOMAIN = "vnvnc.ru"
API_BASE_URL = "https://api.reg.ru/api/regru2"

# Vercel DNS settings
VERCEL_A_RECORD = "76.76.21.21"
VERCEL_CNAME = "cname.vercel-dns.com"

def make_api_request(endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Make a request to reg.ru API v2"""
    url = f"{API_BASE_URL}/{endpoint}"
    
    request_data = {
        "input_format": "json",
        "input_data": json.dumps(data),
        "output_format": "json"
    }
    
    response = requests.post(url, data=request_data)
    
    if response.status_code != 200:
        print(f"API request failed with status {response.status_code}")
        print(response.text)
        sys.exit(1)
    
    return response.json()

def test_connection(username: str, password: str) -> bool:
    """Test API credentials"""
    print("Testing API connection...")
    
    data = {
        "username": username,
        "password": password,
        "output_content_type": "json"
    }
    
    result = make_api_request("nop", data)
    
    if result.get("result") == "success":
        print("✅ API connection successful!")
        return True
    else:
        print("❌ API connection failed:", result.get("error", "Unknown error"))
        return False

def clear_dns_records(username: str, password: str):
    """Clear existing DNS records"""
    print(f"\nClearing existing DNS records for {DOMAIN}...")
    
    data = {
        "username": username,
        "password": password,
        "domain_name": DOMAIN
    }
    
    result = make_api_request("zone/clear", data)
    
    if result.get("result") == "success":
        print("✅ DNS records cleared successfully!")
    else:
        print("⚠️  Warning: Could not clear DNS records:", result.get("error", ""))

def add_a_record(username: str, password: str):
    """Add A record for root domain"""
    print(f"\nAdding A record for {DOMAIN}...")
    
    data = {
        "username": username,
        "password": password,
        "domains": [{"dname": DOMAIN}],
        "subdomain": "@",
        "ipaddr": VERCEL_A_RECORD
    }
    
    result = make_api_request("zone/add_alias", data)
    
    if result.get("result") == "success":
        print(f"✅ A record added: @ → {VERCEL_A_RECORD}")
    else:
        print("❌ Failed to add A record:", result.get("error", "Unknown error"))

def add_cname_record(username: str, password: str):
    """Add CNAME record for www subdomain"""
    print(f"\nAdding CNAME record for www.{DOMAIN}...")
    
    data = {
        "username": username,
        "password": password,
        "domains": [{"dname": DOMAIN}],
        "subdomain": "www",
        "canonical_name": VERCEL_CNAME
    }
    
    result = make_api_request("zone/add_cname", data)
    
    if result.get("result") == "success":
        print(f"✅ CNAME record added: www → {VERCEL_CNAME}")
    else:
        print("❌ Failed to add CNAME record:", result.get("error", "Unknown error"))

def get_dns_records(username: str, password: str):
    """Get current DNS records"""
    print(f"\nFetching current DNS records for {DOMAIN}...")
    
    data = {
        "username": username,
        "password": password,
        "domains": [{"dname": DOMAIN}]
    }
    
    result = make_api_request("zone/get_resource_records", data)
    
    if result.get("result") == "success":
        print("\n📋 Current DNS Records:")
        records = result.get("answer", {}).get(DOMAIN, {}).get("rrs", [])
        for record in records:
            print(f"  - {record.get('type')}: {record.get('subdomain', '@')} → {record.get('content', record.get('ipaddr', ''))}")
    else:
        print("❌ Failed to fetch DNS records:", result.get("error", "Unknown error"))

def main():
    print("=" * 60)
    print("🚀 VNVNC.RU DNS Configuration for Vercel")
    print("=" * 60)
    
    # Get credentials
    print("\n⚠️  Please enter your reg.ru API credentials:")
    print("Note: You can set a separate API password at:")
    print("https://www.reg.ru/user/account/api_settings")
    print()
    
    username = input("reg.ru username/email: ").strip()
    password = input("reg.ru API password: ").strip()
    
    # Test connection
    if not test_connection(username, password):
        sys.exit(1)
    
    # Ask for confirmation
    print("\n⚠️  WARNING: This will modify DNS records for vnvnc.ru")
    print("This will:")
    print(f"  1. Clear existing DNS records for {DOMAIN}")
    print(f"  2. Add A record: @ → {VERCEL_A_RECORD}")
    print(f"  3. Add CNAME record: www → {VERCEL_CNAME}")
    print()
    
    confirm = input("Do you want to continue? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("Cancelled.")
        sys.exit(0)
    
    # Configure DNS
    clear_dns_records(username, password)
    add_a_record(username, password)
    add_cname_record(username, password)
    
    # Show final records
    get_dns_records(username, password)
    
    print("\n" + "=" * 60)
    print("✅ DNS Configuration Complete!")
    print("=" * 60)
    print("\n📝 Next Steps:")
    print("1. Wait 10-30 minutes for DNS propagation")
    print("2. Go to Vercel Dashboard → vnvnc-modern → Settings → Domains")
    print("3. Add domain: vnvnc.ru")
    print("4. Vercel will automatically provision SSL certificates")
    print("\n🌐 Your site will be available at:")
    print("   https://vnvnc.ru")
    print("   https://www.vnvnc.ru")

if __name__ == "__main__":
    main()