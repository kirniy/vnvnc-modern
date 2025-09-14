# VNVNC Modern

Modern nightclub website for VNVNC Concert Hall in Saint Petersburg, Russia.

## 🌐 Production

**Live Site**: https://vnvnc.ru  
**Hosting**: Selectel Object Storage (origin) via Yandex Cloud CDN  
**Direct Origin**: https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Selectel
./deploy-to-selectel.sh
```

## 📦 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with custom neon design system
- **Animations**: Framer Motion
- **Hosting**: Selectel Object Storage
- **Workers**: Cloudflare Workers for API proxying
- **APIs**: TicketsCloud, Yandex Disk

## 🏗️ Architecture

```
vnvnc-modern/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Route pages
│   ├── services/       # API integrations
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utilities and helpers
├── public/             # Static assets
└── dist/              # Production build
```

## 🔑 Environment

The project uses these external services:
- **TicketsCloud API**: Event management
- **Yandex Disk**: Photo gallery storage (via YC API Gateway)
- **Yandex Cloud**: CDN + Certificate Manager + API Gateway

## 📝 Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide and patterns
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Comprehensive technical docs
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Current development tasks

## 🚢 Deployment

### Automatic Deployment

```bash
npm run build
./deploy-to-selectel.sh
```

### Manual Deployment

```bash
# Build the project
npm run build

# Upload to Selectel S3
aws s3 sync dist/ s3://vnvnc/ \
  --endpoint-url=https://s3.ru-7.storage.selcloud.ru \
  --delete
```

## 🌍 DNS & CDN Configuration

Domain/CDN is managed through:
- **Registrar**: REG.RU
- **DNS**: Selectel nameservers → `vnvnc.ru` ALIAS and `www.vnvnc.ru` CNAME to `bf1cb789559b3dc5.a.yccdn.cloud.yandex.net`
- **CDN**: YC CDN resource `bc8rilebboch3mrd3uds` with secondary hostnames `vnvnc.ru`, `www.vnvnc.ru`
- **Origin**: `e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru`, protocol HTTPS, Host Header fixed to bucket hostname
- **SSL**: YC Certificate Manager certificate `fpq6ebsc38egmpblgvq6` (LE R12, SAN: vnvnc.ru, www.vnvnc.ru)

After deploy, purge CDN cache (especially HTML):
```bash
yc cdn cache purge --resource-id bc8rilebboch3mrd3uds --path "/*"
```

## 📊 Performance

- Lighthouse Score: 90+
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Optimized for Russian internet speeds

## 🛠️ Development

```bash
# Start dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

Proprietary - VNVNC © 2024

---

*Built with ❤️ for the Saint Petersburg nightlife scene*