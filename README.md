# VNVNC Modern

Modern nightclub website for VNVNC Concert Hall in Saint Petersburg, Russia.

## 🌐 Production

**Live Site**: https://vnvnc.ru  
**Hosting**: Selectel Object Storage (Russia-based, no blocking issues)  
**Direct URL**: https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru

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
- **Yandex Disk**: Photo gallery storage
- **Cloudflare Workers**: CORS proxy and API gateway

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
  --endpoint-url=https://s3.storage.selcloud.ru \
  --delete
```

## 🌍 DNS Configuration

Domain is managed through:
- **Registrar**: REG.RU
- **DNS**: Selectel nameservers
- **SSL**: Automatic via Selectel

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