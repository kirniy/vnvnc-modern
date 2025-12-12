# CLAUDE.md - VNVNC Modern Development Guide

## 🚨 ACTIVE DEVELOPMENT - 2025

**Current Focus**: Major UI improvements for production launch
- **Phase 1**: Hero section redesign with video circles feature (IN PROGRESS)
- **Phase 2**: Yandex Cloud video integration
- **Phase 3**: Design system consistency fixes
- **Phase 4**: Content improvements
- **Phase 5**: Mobile optimization

📋 **See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed tasks and progress tracking**

## 🌐 OTHER PROJECT: angar.online

### Project Overview
- **What**: Nightclub/event venue website (ANGAR - electronic music club in SPb)
- **Platform**: Hosted on Gamma.app (website builder)
- **Challenge**: Make it accessible in Russia (Cloudflare/AWS blocked)
- **Solution**: Using BunnyCDN as reverse proxy

### Current Setup (September 2025)
- **Domain**: angar.online (registered at Namecheap)
- **Content Management**: Gamma.app (edit and publish through their interface)
- **CDN/Proxy**: BunnyCDN ($1-3/month)
- **DNS**: Cloudflare DNS (paused mode - DNS only, no proxy)

### BunnyCDN Configuration
- **Pull Zone Name**: angar
- **CDN URL**: angar.b-cdn.net
- **Origin URL**: https://3.137.108.170 (AWS IP where Gamma hosts)
- **Host Header**: angar.online (manually set)
- **Forward Host Header**: OFF
- **Cache**: 4hr browser, 12hr edge (auto-updates)
- **SSL**: BunnyCDN Free SSL (Let's Encrypt)
- **Account**: Need to maintain $10+ balance

### DNS Records (in Cloudflare) - DNS-only mode
```
CNAME angar.online    angar.b-cdn.net    DNS only (gray cloud)
CNAME www            angar.b-cdn.net    DNS only (gray cloud)
```
**Important**: Use CNAME for root domain (Cloudflare supports CNAME flattening). Never use A records - BunnyCDN doesn't provide static IPs.

### How It Works
1. User visits angar.online → DNS resolves to BunnyCDN network
2. BunnyCDN fetches from origin (3.137.108.170) with Host: angar.online header
3. BunnyCDN serves content to users (works in Russia!)
4. Gamma publishes updates as usual (no changes needed)

### SSL Certificate Setup
- **DO NOT** use Cloudflare Origin Certificate (only works when proxied)
- **USE** BunnyCDN's Free SSL certificate (Let's Encrypt)
- In BunnyCDN → Hostnames → Enable Free SSL for custom domain
- Force SSL enabled for HTTPS redirect

### Maintenance
- **Update content**: Edit in Gamma.app as normal
- **Force update**: BunnyCDN dashboard → Purge → Purge All
- **Check balance**: Keep $10+ in BunnyCDN account
- **SSL renewal**: Automatic via BunnyCDN (Let's Encrypt)

### Access Points
- **Gamma editor**: gamma.app (login required)
- **BunnyCDN dashboard**: dash.bunny.net
- **DNS management**: Cloudflare dashboard (paused mode)
- **Test URL**: https://angar.b-cdn.net (always works)

## Project Context

You're working on VNVNC Modern, a React-based nightclub website with a distinctive neon aesthetic. The site is for a concert hall in Saint Petersburg, Russia, featuring events, photo galleries, and reservations.

## Quick Start Commands

```bash
npm run dev          # Start dev server on http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
```

## Critical Information

### API Keys & Services
- **TicketsCloud API Key**: `c862e40ed178486285938dda33038e30` (in `src/services/ticketsCloud.ts`)
- **API Gateway (RU, Yandex Cloud)**: `https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net`
  - `/api/v1/resources/events` proxy for TicketsCloud (CORS-safe)
  - `/api/yandex-disk/*` endpoints for gallery

### Production URLs
- **Main Site**: https://vnvnc.ru (via Yandex Cloud CDN)
- **WWW Site**: https://www.vnvnc.ru (also via CDN)
- **CDN Provider CNAME**: `bf1cb789559b3dc5.a.yccdn.cloud.yandex.net`
- **CDN Resource ID**: `bc8rilebboch3mrd3uds`
- **CDN Internal CNAME**: `vnvnc-cdn.gcdn.co` (internal identifier, do NOT use for DNS)
- **Origin (Selectel S3)**: `https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru`

### SSL Certificates (as of December 2025)

#### ⚠️ ACTION REQUIRED BY LATE JANUARY 2026

The certificate currently being served expires **Feb 10, 2026** and does NOT auto-renew. You must either:
1. **Switch to managed cert** (recommended - enables auto-renewal), OR
2. **Re-import Selectel cert** when it renews

See "Switching to Managed Certificate" section below for instructions.

#### Yandex Cloud Certificate Manager (for CDN)
| Certificate ID | Name | Type | Issuer | Domains | Expires | Status |
|----------------|------|------|--------|---------|---------|--------|
| `fpqlba7na3fmq91td97k` | vnvnc-fullchain | IMPORTED | R13 | vnvnc.ru, www.vnvnc.ru | **Feb 10, 2026** | ✅ ACTIVE (served at edge) |
| `fpq6d47g0r1b4eltjah1` | vnvnc-managed-dns | MANAGED | R12 | vnvnc.ru, www.vnvnc.ru | Mar 12, 2026 | Issued (configured but NOT served) |

**Currently presented to users**: `fpqlba7na3fmq91td97k` (imported R13, incomplete_chain=true).
**Configured/backup**: `fpq6d47g0r1b4eltjah1` (managed R12 via DNS challenge, ready to switch if needed).

#### Switching to Managed Certificate (Recommended)

To enable auto-renewal and avoid manual cert imports, switch the CDN to actually serve the managed certificate:

```bash
# 1. Update CDN to use managed cert (include ALL options to prevent reset!)
yc cdn resource update bc8rilebboch3mrd3uds \
  --secondary-hostnames vnvnc.ru --secondary-hostnames www.vnvnc.ru \
  --host-header "e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru" \
  --origin-protocol https \
  --redirect-http-to-https \
  --cert-manager-ssl-cert-id fpq6d47g0r1b4eltjah1

# 2. Purge cache
yc cdn cache purge --resource-id bc8rilebboch3mrd3uds --path "/*"

# 3. Wait 5-15 minutes for edge propagation, then verify:
openssl s_client -connect vnvnc.ru:443 -servername vnvnc.ru </dev/null 2>/dev/null | \
  openssl x509 -noout -issuer -dates
# Should show R12 issuer and Mar 2026 expiry

# 4. Test site
curl -I https://vnvnc.ru/
# Should return 200 OK
```

**Why this matters**: The managed cert auto-renews via DNS challenge. The imported cert requires manual re-import every ~90 days.

#### Selectel S3 Bucket Certificate
- **Issuer**: Let's Encrypt R13
- **Domains**: vnvnc.ru, www.vnvnc.ru
- **Expires**: Feb 10, 2026
- **Location**: Selectel Control Panel → Object Storage → Container Settings → SSL

## Development Patterns

### Component Creation Pattern
When creating new components, follow this structure:

```tsx
import { motion } from 'framer-motion'
import { colors } from '../utils/colors'

interface ComponentProps {
  // Props with proper TypeScript types
}

const ComponentName = ({ prop1, prop2 }: ComponentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Use colors object for consistency */}
      <div style={{ color: colors.neon.red }}>
        {/* Content */}
      </div>
    </motion.div>
  )
}

export default ComponentName
```

### Styling Conventions

#### Use Design Tokens
```tsx
// ✅ Good - Use color constants
style={{ backgroundColor: colors.neon.red }}

// ❌ Bad - Hardcoded colors
style={{ backgroundColor: '#ff0040' }}
```

#### Border Radius System
```tsx
// Use consistent radius classes
className="radius"        // Default 12px
className="radius-lg"     // Larger radius
className="radius-xl"     // Extra large

// Don't use Tailwind rounded-*
```

#### Typography
```tsx
// Headings - lowercase with stretch
<h1 className="font-display font-extrabold lowercase text-stretch-heading">

// Body text - with subtle stretch
<p className="text-stretch-body">
```

### API Integration Pattern

#### Service Structure
```typescript
class ServiceName {
  private cache: Map<string, CachedData> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes
  
  async fetchData(params: Params): Promise<Data> {
    // Check cache first
    const cached = this.checkCache(cacheKey)
    if (cached) return cached
    
    try {
      // Make API call
      const response = await fetch(url)
      // Cache response
      this.setCache(cacheKey, response)
      return response
    } catch (error) {
      // Return fallback/mock data
      return this.getFallbackData()
    }
  }
}
```

### Performance Optimization Checklist

#### Images
- [ ] Use lazy loading: `loading="lazy"`
- [ ] Provide srcSet for responsive images
- [ ] Use smaller thumbnails for lists
- [ ] Optimize with proper formats (WebP when possible)

#### Components
- [ ] Lazy load route components
- [ ] Use React.memo for expensive components
- [ ] Implement virtual scrolling for long lists
- [ ] Debounce search/filter inputs

#### Animations
- [ ] Use GPU-accelerated properties (transform, opacity)
- [ ] Add will-change hints sparingly
- [ ] Reduce animation complexity on mobile
- [ ] Respect prefers-reduced-motion

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/NewPage.tsx`
2. Add lazy import in `App.tsx`:
   ```tsx
   const NewPage = lazy(() => import('./pages/NewPage'))
   ```
3. Add route in `App.tsx`:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```
4. Add navigation item in `Navigation.tsx`:
   ```tsx
   { name: 'новая страница', path: '/new-page' }
   ```

### Working with Events

Events come from TicketsCloud API with specific date handling:
- Moscow timezone (Europe/Moscow)
- 6 AM cutoff for "today's" events
- Events before cutoff are archived
- Date formatting uses Russian locale

### Working with Gallery

Photos are loaded from Yandex Disk with fallback:
1. Try Yandex Disk via worker
2. If fails, use local photos in `/public/photos/`
3. Photos organized by date (YYYY-MM-DD format)
4. Infinite scroll for large albums

### Updating Styles

1. **Colors**: Edit `tailwind.config.js` and `src/utils/colors.ts`
2. **Fonts**: Update font-family in `tailwind.config.js`
3. **Animations**: Add keyframes to `tailwind.config.js`
4. **Global styles**: Edit `src/index.css`

## Current Issues & Solutions

### Issue: CORS with TicketsCloud API
**Solution**: Use Yandex Cloud API Gateway as CORS proxy
- **Gateway URL**: `https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net`
- **Routes**: `/tc/v1/*` (preferred) or `/api/v1/*` (legacy)
- **Function ID**: `d4ehafn3ofbigbqr3nsn`

### Issue: Events API 404 (November 2025 Fix)
**Root Cause**: The TicketsCloud proxy function wasn't normalizing paths from `/tc/` prefix - only handled `/api/`
**Solution**: Updated path normalization regex in `tickets-cloud-function.js`:
```javascript
// Before: only stripped /api/
const normalizedPath = path.replace('/api/', '/');

// After: strips both /api/ and /tc/ prefixes
const normalizedPath = rawPath.replace(/^\/?(api|tc)\//, '/');
```
**Also required**: API Gateway spec must have both routes in correct order:
1. `/api/yandex-disk/{path+}` (specific - FIRST)
2. `/tc/{path+}` (TicketsCloud alias)
3. `/api/{path+}` (TicketsCloud legacy - LAST)

**Deployment**: See `yandex-functions/DEPLOY_INSTRUCTIONS.md` for commands

### Issue: Selectel S3 doesn't support root domains
**Solution**: Yandex Cloud CDN fronts Selectel S3 and terminates SSL for `vnvnc.ru` and `www.vnvnc.ru` (Certificate Manager, LE R12). Host Header fixed to bucket hostname.

### Issue: Cloudflare is blocked in Russia
**Solution**: Yandex Cloud CDN provides similar functionality with Russian infrastructure

### Issue: Large video files on mobile
**Solution**: Separate mobile video (`herovideo-mobile.mp4`) with reduced quality

### Issue: Yandex Disk authentication
**Solution**: Worker handles OAuth, provides public endpoints

### Issue: Date display for events
**Solution**: Custom date handling with Moscow timezone, Russian formatting

## Testing Checklist

Before deploying:
- [ ] Test on mobile devices (iOS Safari, Chrome)
- [ ] Check all API integrations
- [ ] Verify image loading and gallery
- [ ] Test navigation and routing
- [ ] Check animation performance
- [ ] Validate forms and CTAs
- [ ] Test age gate functionality
- [ ] Verify social media links

## Deployment Process

### Deployment Architecture

#### Current Setup (Yandex CDN + Selectel S3)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VNVNC.RU INFRASTRUCTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [User Browser]                                                            │
│         │                                                                   │
│         ▼                                                                   │
│   [DNS: Selectel DNS]                                                       │
│   vnvnc.ru      ALIAS → bf1cb789559b3dc5.a.yccdn.cloud.yandex.net          │
│   www.vnvnc.ru  CNAME → bf1cb789559b3dc5.a.yccdn.cloud.yandex.net          │
│         │                                                                   │
│         ▼                                                                   │
│   [Yandex Cloud CDN]  ◄─── SSL: Let's Encrypt R13 (Feb 2026)               │
│   Resource: bc8rilebboch3mrd3uds                                           │
│   Settings:                                                                 │
│   - Secondary hostnames: vnvnc.ru, www.vnvnc.ru                            │
│   - Host header: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru        │
│   - Origin protocol: HTTPS                                                  │
│   - HTTP→HTTPS redirect: ON                                                 │
│         │                                                                   │
│         ▼                                                                   │
│   [Selectel S3 Bucket]  ◄─── SSL: Let's Encrypt R13 (Feb 2026)             │
│   Bucket: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru               │
│   Region: ru-7                                                              │
│   Contains: Built React app (dist/)                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Details

#### 1. DNS (Selectel DNS Management)
**Location**: https://my.selectel.ru/vpc/domains

| Record | Type | Value | TTL |
|--------|------|-------|-----|
| `vnvnc.ru` | ALIAS | `bf1cb789559b3dc5.a.yccdn.cloud.yandex.net` | 3600 |
| `www.vnvnc.ru` | CNAME | `bf1cb789559b3dc5.a.yccdn.cloud.yandex.net` | 3600 |
| `_acme-challenge.vnvnc.ru` | CNAME | `fpq6d47g0r1b4eltjah1.cm.yandexcloud.net` | 3600 |
| `_acme-challenge.www.vnvnc.ru` | CNAME | `fpq6d47g0r1b4eltjah1.cm.yandexcloud.net` | 3600 |

**⚠️ Important**:
- NEVER point DNS to `vnvnc-cdn.gcdn.co` - this is an internal CDN identifier
- ALWAYS use the provider CNAME: `bf1cb789559b3dc5.a.yccdn.cloud.yandex.net`
- The `_acme-challenge` records are for Yandex managed certificate renewal

#### 2. Yandex Cloud CDN
**Location**: https://console.yandex.cloud → Cloud CDN → Resources

**Resource Configuration**:
```yaml
Resource ID: bc8rilebboch3mrd3uds
CNAME (internal): vnvnc-cdn.gcdn.co  # DO NOT USE FOR DNS
Provider CNAME: bf1cb789559b3dc5.a.yccdn.cloud.yandex.net  # USE THIS FOR DNS

Secondary Hostnames:
  - vnvnc.ru
  - www.vnvnc.ru

Origin:
  Group: vnvnc-s3-origin (ID: 3400233002361363975)
  Source: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
  Protocol: HTTPS

Options:
  Host Header: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru  # CRITICAL!
  HTTP→HTTPS Redirect: Enabled
  Edge Cache: 86400 seconds (24 hours)
  Slice: Enabled

SSL Certificate:
  Type: Certificate Manager
  Configured: fpq6d47g0r1b4eltjah1 (managed R12, READY)
  Edge currently serves: fpqlba7na3fmq91td97k (imported R13, expires Feb 10 2026, incomplete_chain=true)
```

**⚠️ CRITICAL CDN Settings**:
1. **Host Header** MUST be set to Selectel bucket hostname, NOT "Primary domain"
2. **Origin Protocol** MUST be HTTPS (Selectel redirects HTTP→HTTPS)
3. **Secondary Hostnames** MUST include both vnvnc.ru AND www.vnvnc.ru
4. Changes take up to 15 minutes to propagate to edge nodes!

#### 3. Selectel S3 Object Storage
**Location**: https://my.selectel.ru/storage/containers

**Bucket Configuration**:
```yaml
Container Name: vnvnc
Bucket URL: e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
Region: ru-7
Endpoint: https://s3.ru-7.storage.selcloud.ru
Access: Public read

SSL Certificate:
  Type: Custom (Let's Encrypt)
  Domains: vnvnc.ru, www.vnvnc.ru
  Expires: Feb 10, 2026
  Auto-renewal: YES (via Selectel)
```

**⚠️ Important**: Selectel S3 ALWAYS uses HTTPS. HTTP requests get 301 redirected to HTTPS.

#### 4. Yandex Certificate Manager
**Location**: https://console.yandex.cloud → Certificate Manager

**Available Certificates**:
| ID | Name | Type | Expires | Use Case |
|----|------|------|---------|----------|
| `fpqlba7na3fmq91td97k` | vnvnc-fullchain | IMPORTED | Feb 10, 2026 | **CDN (served at edge)** |
| `fpq6d47g0r1b4eltjah1` | vnvnc-managed-dns | MANAGED | Mar 12, 2026 | Configured backup (DNS-challenge) |

**Managed vs Imported**:
- **MANAGED**: Yandex auto-renews via DNS challenge (requires ACME CNAME records)
- **IMPORTED**: Manual import from Selectel, must re-import when Selectel renews

---

## 🔧 Operations & Maintenance

### Deploying Code Changes

```bash
# 1. Build the project
npm run build

# 2. Deploy to Selectel (use deployment script)
./deploy-to-selectel.sh

# OR manual deployment:
aws s3 sync dist/ s3://vnvnc/ \
  --endpoint-url=https://s3.ru-7.storage.selcloud.ru \
  --delete

# 3. Purge CDN cache (REQUIRED for HTML/JS changes!)
yc cdn cache purge --resource-id bc8rilebboch3mrd3uds --path "/*"
```

**Note**: Cache purge has a rate limit of ~1 per minute. If you get an error, wait and retry.

### Checking CDN Status

```bash
# View current CDN configuration
yc cdn resource get bc8rilebboch3mrd3uds

# Check SSL certificate being served
openssl s_client -connect vnvnc.ru:443 -servername vnvnc.ru </dev/null 2>/dev/null | \
  openssl x509 -noout -subject -issuer -dates

# Test HTTP response
curl -I https://vnvnc.ru/

# Test with cache bypass
curl -I "https://vnvnc.ru/?nocache=$(date +%s)"
```

### Purging CDN Cache

```bash
# Purge entire cache
yc cdn cache purge --resource-id bc8rilebboch3mrd3uds --path "/*"

# Purge specific path
yc cdn cache purge --resource-id bc8rilebboch3mrd3uds --path "/index.html"
```

---

## 🔐 SSL Certificate Management

### Certificate Expiration Timeline
- **Current CDN Certificate (served)**: Feb 10, 2026 (IMPORTED, R13, incomplete_chain=true)
- **Managed Certificate (configured)**: Mar 12, 2026 (R12, auto-renews via DNS challenge)
- **Selectel S3 Certificate**: Feb 10, 2026 (auto-renews via Selectel)

### When Certificates Expire - Renewal Process

#### Option A: Import Selectel Certificate (Backup Procedure)

If the managed certificate fails, import the Selectel certificate. Selectel auto-renews their Let's Encrypt certificate. After renewal:

```bash
# 1. Download new certificate from Selectel
#    Go to: Selectel → Object Storage → Container → SSL → Download

# 2. Import to Yandex Certificate Manager
yc certificate-manager certificate create \
  --name vnvnc-selectel-YYYY-MM \
  --domains vnvnc.ru --domains www.vnvnc.ru \
  --chain /path/to/fullchain.pem \
  --key /path/to/privkey.pem

# 3. Note the new certificate ID from output

# 4. Update CDN to use new certificate
yc cdn resource update bc8rilebboch3mrd3uds \
  --cert-manager-ssl-cert-id <NEW_CERT_ID>

# 5. IMPORTANT: Re-apply other settings (they may reset!)
yc cdn resource update bc8rilebboch3mrd3uds \
  --secondary-hostnames vnvnc.ru --secondary-hostnames www.vnvnc.ru \
  --host-header "e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru" \
  --origin-protocol https \
  --redirect-http-to-https

# 6. Purge cache
yc cdn cache purge --resource-id bc8rilebboch3mrd3uds --path "/*"

# 7. Verify
curl -I https://vnvnc.ru/
```

#### Option B: Yandex Managed Certificate (Configured - Auto-Renewal)

The managed certificate `fpq6d47g0r1b4eltjah1` is ISSUED/READY and auto-renews via DNS challenge, but the edge is currently serving the imported `fpqlba7na3fmq91td97k`. Switch to the managed one if you want a fully chained cert without the incomplete_chain flag.

**Prerequisites** (already configured):
- `_acme-challenge.vnvnc.ru` CNAME → `fpq6d47g0r1b4eltjah1.cm.yandexcloud.net`
- `_acme-challenge.www.vnvnc.ru` CNAME → `fpq6d47g0r1b4eltjah1.cm.yandexcloud.net`

**Current state**: Managed cert is configured as backup; edge serves imported cert. No action needed unless you want to swap to managed.

### Checking Certificate Status

```bash
# List all certificates
yc certificate-manager certificate list

# Check specific certificate
yc certificate-manager certificate get <CERT_ID>

# Check what CDN is using
yc cdn resource get bc8rilebboch3mrd3uds | grep -A5 ssl_certificate
```

---

## 🚨 Incident Response: December 12, 2025

### What Happened
1. SSL certificate `fpq6ebsc38egmpblgvq6` (Let's Encrypt R12) expired on Dec 12, 2025
2. Site became inaccessible with SSL errors
3. During troubleshooting, CDN started redirecting to `vnvnc-cdn.gcdn.co` (internal CNAME)

### Root Cause
When updating CDN settings via CLI, certain options (especially `--cert-manager-ssl-cert-id`) can **silently reset** other critical options:
- `host_options` (Host Header)
- `redirect_options` (HTTP→HTTPS redirect)

Without the correct Host Header, CDN redirected all requests to its internal CNAME.

### Resolution
1. Created new managed certificate via DNS challenge
2. Imported Selectel certificate (currently served at edge)
3. Re-applied ALL CDN settings in one command
4. Purged cache

### Prevention Checklist
- [ ] Set calendar reminder 2 weeks before certificate expiration
- [ ] When updating ANY CDN setting, always include ALL critical options:
  ```bash
  yc cdn resource update bc8rilebboch3mrd3uds \
    --secondary-hostnames vnvnc.ru --secondary-hostnames www.vnvnc.ru \
    --host-header "e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru" \
    --origin-protocol https \
    --redirect-http-to-https \
    --cert-manager-ssl-cert-id fpq6d47g0r1b4eltjah1
  ```
- [ ] After ANY CDN change, verify with:
  ```bash
  curl -I https://vnvnc.ru/
  # Should return 200 OK, NOT 301 redirect
  ```
- [ ] Keep the managed certificate DNS records in place for auto-renewal backup

---

## 📋 Quick Reference Commands

### CDN Operations
```bash
# Full CDN config update (safe - includes all options)
yc cdn resource update bc8rilebboch3mrd3uds \
  --secondary-hostnames vnvnc.ru --secondary-hostnames www.vnvnc.ru \
  --host-header "e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru" \
  --origin-protocol https \
  --redirect-http-to-https \
  --cert-manager-ssl-cert-id fpq6d47g0r1b4eltjah1  # attaches managed R12; edge currently serves imported R13

# Purge cache
yc cdn cache purge --resource-id bc8rilebboch3mrd3uds --path "/*"

# Check CDN config
yc cdn resource get bc8rilebboch3mrd3uds

# Check SSL
curl -I https://vnvnc.ru/
openssl s_client -connect vnvnc.ru:443 -servername vnvnc.ru </dev/null 2>/dev/null | openssl x509 -noout -dates
```

### Certificate Operations
```bash
# List certificates
yc certificate-manager certificate list

# Import new certificate
yc certificate-manager certificate create \
  --name vnvnc-YYYY-MM \
  --domains vnvnc.ru --domains www.vnvnc.ru \
  --chain /path/to/fullchain.pem \
  --key /path/to/privkey.pem

# Check certificate details
yc certificate-manager certificate get <CERT_ID>
```

### Deployment
```bash
# Build and deploy
npm run build && ./deploy-to-selectel.sh

# Or manual
npm run build
aws s3 sync dist/ s3://vnvnc/ --endpoint-url=https://s3.ru-7.storage.selcloud.ru --delete
yc cdn cache purge --resource-id bc8rilebboch3mrd3uds --path "/*"
```

---

## 💰 Services & Billing

| Service | Provider | What It Does | Cost Estimate |
|---------|----------|--------------|---------------|
| CDN | Yandex Cloud | SSL termination, caching, edge delivery | ~$5-10/month |
| Certificate Manager | Yandex Cloud | SSL certificate storage | Free |
| API Gateway | Yandex Cloud | CORS proxy for TicketsCloud | ~$1-2/month |
| Object Storage | Selectel | Static file hosting (origin) | ~$2-5/month |
| DNS | Selectel | Domain DNS management | Free with storage |
| Domain | REG.RU | vnvnc.ru registration | ~$10/year |

**Keep positive balances on both Yandex Cloud and Selectel accounts!**

### Cloudflare Workers (Legacy/Optional)
```bash
# For CORS proxy (if needed)
cd cloudflare-worker-yandex-final.js
wrangler deploy

# For Yandex gallery
cd [worker directory]
wrangler deploy
```

## Code Quality Standards

### TypeScript
- Use proper types, avoid `any`
- Define interfaces for all props
- Type API responses properly

### React
- Use functional components with hooks
- Implement proper error boundaries
- Add loading states for async operations
- Handle edge cases (empty states, errors)

### Performance
- Lazy load heavy components
- Optimize re-renders with memo/callback
- Batch state updates
- Use proper keys in lists

## Current Implementation Tasks

### 🔴 IMMEDIATE PRIORITY - Phase 1: Hero Section
1. **Fix Navigation Logo Alignment** (1.1)
   - Align logo vertically with menu items
   - Increase size to 40px
   - Add glow effect on scroll

2. **Restructure Hero Content** (1.2)
   - Remove duplicate VNVNC from center
   - Enhance tagline typography
   - Reposition CTA buttons

3. **Build Video Circles Feature** (1.3-1.5)
   - Create VideoCircle components
   - Implement Telegram-style UI
   - Add randomizer button
   - Progress ring animation

### 🟡 HIGH PRIORITY - Phases 2-3
- Yandex Cloud video integration
- Design system consistency (12px radius)
- Button standardization across site

### 🟢 MEDIUM PRIORITY - Phases 4-5
- Improve Rules page text
- Mobile optimization
- Cross-browser testing

## Implementation Guidelines

### Video Circles Specifications
```tsx
// Component structure
VideoCircle/
├── VideoCircle.tsx          // Main container
├── VideoCirclePlayer.tsx    // Video element wrapper
├── VideoCircleProgress.tsx  // SVG progress ring
└── VideoCircleButton.tsx    // Randomizer control

// Sizes
Desktop: 200px diameter
Mobile: 160px diameter
Border: 3px gradient (#ff0040 → #ff0080)
```

### Design System Rules
```css
/* ALWAYS use these radius values */
.radius { border-radius: 12px; }     /* Default for ALL buttons */
.radius-lg { border-radius: 16px; }  /* Cards, panels */
.radius-xl { border-radius: 20px; }  /* Large containers */

/* NEVER use rounded-full for buttons! */
```

### Improved Rules Text
```
Важно помнить:
VNVNC — это про взаимное уважение и крутую атмосферу. Мы строим это место вместе с тобой, 
и каждый вечер здесь — это история, которую мы создаём. Администрация заботится о безопасности 
и комфорте всех гостей, поэтому оставляет за собой право принимать решения о допуске в клуб. 
Если что-то пошло не так — не переживай, бывает. Главное — мы все здесь для того, чтобы 
классно провести время, танцевать под отличную музыку и чувствовать себя свободно. 
Соблюдение правил — это твой вклад в атмосферу VNVNC. Спасибо, что ты с нами! 🖤
```

## Future Improvements (After Launch)

### High Priority
1. **Analytics**: Implement tracking for user behavior
2. **SEO**: Add meta tags, Open Graph, structured data
3. **PWA Features**: Service worker, offline support

### Medium Priority
1. **Admin Panel**: Content management system
2. **Multi-language**: RU/EN support
3. **Advanced Analytics**: Heatmaps, conversion tracking

## Design System Rules

### Neon Aesthetic
- Primary red: `#ff0040` (no pink tint!)
- Glass effects with backdrop-blur
- Subtle glow effects on hover
- Dark backgrounds with gradient overlays

### Typography Hierarchy
```
H1: text-5xl font-display font-extrabold lowercase
H2: text-4xl font-display font-extrabold lowercase  
H3: text-2xl font-display font-bold lowercase
Body: text-base font-body text-white/80
Small: text-sm text-white/60
```

### Spacing System
- Mobile: Compact spacing (p-3, gap-3)
- Desktop: Generous spacing (p-6, gap-6)
- Sections: py-16 for main sections
- Cards: p-4 to p-6 responsive

### Interactive Elements
- Buttons: Bold borders, hover state transitions
- Cards: Hover lift effect with glow
- Links: Underline or color change on hover
- Forms: Glass background with clear focus states

## Debug Tips

### Check API Responses
```javascript
// In browser console
localStorage.setItem('debug', 'true')
// This enables detailed logging in services
```

### Performance Profiling
1. Open Chrome DevTools
2. Go to Performance tab
3. Record while interacting
4. Look for long tasks, layout shifts

### Mobile Testing
1. Use Chrome DevTools device mode
2. Test on real devices via ngrok
3. Check Safari iOS specifically (different behavior)

## Contact for Issues

**Project**: VNVNC Modern
**Tech Stack**: React + TypeScript + Vite + Tailwind
**Deployment**: Selectel Object Storage + Yandex Cloud CDN + YC API Gateway
**Hosting Architecture**:
- **CDN**: Yandex Cloud CDN (handles SSL and root domain)
- **Storage**: Selectel Object Storage S3 (origin)
- **DNS**: Selectel DNS Management
- **SSL Certificate**: Yandex Certificate Manager (serving imported LE R13, expires Feb 2026; managed LE R12 is configured/ready)
**APIs**: TicketsCloud, Yandex Disk

---

*Last updated: December 2025*
*Infrastructure documentation updated after December 12, 2025 certificate incident*
