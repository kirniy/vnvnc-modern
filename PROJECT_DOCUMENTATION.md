# VNVNC Modern - Comprehensive Project Documentation

## Project Overview

VNVNC Modern is a high-performance React-based single-page application (SPA) for VNVNC Concert Hall, a nightclub and event venue in Saint Petersburg, Russia. The website features a modern, visually striking design with neon aesthetics, optimized performance, and seamless integration with external services.

**Live Site**: https://vnvnc.ru (Hosted on Selectel Object Storage - Russia-based hosting)
**Location**: Конюшенная площадь 2В, Санкт-Петербург

> **📋 Active Development**: See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for current development progress and tasks.

## Technical Stack

### Core Technologies
- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.4
- **Styling**: Tailwind CSS 4.1.11 with custom design system
- **Router**: React Router DOM 7.6.3
- **State Management**: TanStack Query (React Query) 5.83.0
- **Animations**: Framer Motion 12.23.3

### Key Dependencies
- **3D Graphics**: Three.js + React Three Fiber for advanced visual effects
- **Image Gallery**: Yet Another React Lightbox for photo viewing
- **HTTP Client**: Axios for API communication
- **Icons**: Lucide React + React Icons
- **UI Utilities**: clsx, tailwind-merge for conditional styling
- **Sanitization**: DOMPurify for safe HTML rendering

### Development Tools
- **TypeScript**: ~5.8.3 for type safety
- **ESLint**: Code quality and standards
- **Firebase Tools**: 14.10.1 for deployment
- **PostCSS/Autoprefixer**: CSS processing

## Architecture Overview

### Project Structure
```
vnvnc-modern/
├── src/
│   ├── App.tsx                 # Main app component with routing
│   ├── main.tsx                # Application entry point
│   ├── components/             # Reusable UI components
│   │   ├── ui/                # Base UI components (buttons, cards, etc.)
│   │   ├── logo/              # Brand components (WarpedVNVNC)
│   │   └── [feature components]
│   ├── pages/                  # Route page components
│   ├── services/               # API integrations
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Helper functions
│   └── styles/                 # Global styles and tokens
├── public/                     # Static assets
│   ├── photos/                # Gallery images
│   └── [videos/favicons]
├── functions/                  # Firebase functions
└── [config files]
```

## Core Features

### 1. Event Management System
- **TicketsCloud API Integration**: Real-time event fetching and display
- **Event States**: Current events (upcoming) and archive (past events)
- **Smart Date Handling**: Moscow timezone with 6 AM cutoff for "today's" events
- **Event Details**: Full event pages with descriptions, pricing, and purchase links
- **Short URL System**: `/e/:slug` redirects for marketing campaigns

### 2. Photo Gallery
- **Yandex Disk Integration**: Dynamic photo loading from cloud storage
- **Fallback System**: Local photos when cloud service unavailable
- **Date-based Albums**: Photos organized by event dates
- **Infinite Scrolling**: Progressive loading for performance
- **Lightbox Viewer**: Full-screen photo viewing with download capability
- **Responsive Grid**: Mobile-first 2/3/4 column layout

### 3. Performance Optimizations
- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: Multiple sizes with srcSet for responsive loading
- **Video Optimization**: Separate mobile/desktop video files
- **Caching Strategy**: 5-minute cache for API responses
- **Animation Performance**: GPU-accelerated transforms, will-change hints

### 4. Design System

#### Colors (from tailwind.config.js)
- **Neon Colors**: 
  - Red: `#ff0040` (primary brand color)
  - Pink: `#ff0080`
  - Purple: `#8000ff`
  - Blue: `#00d4ff`
  - Green: `#00ff88`
- **Glass Effects**: Semi-transparent overlays with backdrop blur
- **Dark Scale**: Black to dark gray gradients

#### Typography
- **Display Font**: Unbounded (Cyrillic support) - used for headings
- **Body Font**: Inter - for readable content
- **Monospace**: JetBrains Mono - for technical content
- **Text Utilities**: 
  - `text-stretch-heading`: Enhanced heading display
  - `text-stretch-body`: Slightly stretched body text

#### Animations
- Custom keyframes for neon effects, gradient shifts, floating elements
- Framer Motion for component transitions
- GPU-optimized transforms

## API Integrations

### 1. TicketsCloud Service
**Location**: `src/services/ticketsCloud.ts`
- **Endpoints**: 
  - `GET /v1/resources/events` - List all events
  - `GET /v1/resources/events/{id}` - Event details
- **CORS Proxy**: Cloudflare Worker at `vnvnc-cors-proxy.kirlich-ps3.workers.dev`
- **Authentication**: API key-based
- **Data Transformation**: Raw API → formatted Event objects with proper dates

### 2. Yandex Disk Service
**Location**: `src/services/yandexDisk.ts`
- **Worker URL**: `vnvnc-yandex-gallery.kirlich-ps3.workers.dev`
- **Features**:
  - Photo fetching with pagination
  - Date-based filtering
  - Download URL generation
  - 5-minute cache for responses
- **Fallback**: Local photos in `/public/photos/`

## Component Architecture

### Key Components

#### Navigation (`Navigation.tsx`)
- **Features**: 
  - Fixed header with scroll-based transparency
  - Mobile hamburger menu with animated overlay
  - Active route highlighting
  - Logo visibility control on mobile

#### ModernHero (`ModernHero.tsx`)
- **Purpose**: Homepage hero section
- **Features**: 
  - Background video with opacity control
  - Animated VNVNC logo
  - CTA buttons for events/reservations
  - Floating particle effects

#### EventCardNew (`EventCardNew.tsx`)
- **Purpose**: Event display cards
- **Features**:
  - 3:4 aspect ratio images
  - Age rating badges
  - Archive state handling
  - Purchase/photo report CTAs
  - Hover effects with neon glow

#### Gallery Components
- **GalleryPage**: Main gallery with date selector
- **RollingGallery**: Animated photo carousel
- **Lightbox Integration**: Full-screen viewing

### UI Components Library
- **Button**: Customizable button with variants
- **GlassCard**: Glassmorphism effect cards
- **NewsTicker**: Scrolling announcement banner
- **Skeleton**: Loading placeholders
- **NeonText**: Glowing text effects
- **MinimalCursor**: Custom cursor effects

## Routing Structure

```
/                    → HomePage (hero + upcoming events)
/events             → EventsPage (current/archive tabs)
/events/:id         → EventDetailPage
/e/:slug            → ShortUrlRedirect
/gallery            → GalleryPage
/reservations       → ReservationsPage
/rules              → RulesPage
/contact            → ContactPage
```

## State Management

### React Query Configuration
- **Stale Time**: 5 minutes for cached data
- **Retry**: 3 attempts on failure
- **Query Keys**:
  - `['events']` - All events
  - `['event', id]` - Single event
  - `['yandex-photos', category, date]` - Gallery photos
  - `['yandex-dates']` - Available photo dates

## Performance Features

### Optimization Strategies
1. **Code Splitting**: Lazy loading for all route components
2. **Image Loading**:
   - Lazy loading with `loading="lazy"`
   - Responsive images with srcSet
   - Thumbnail → full size progression
3. **Animation Optimization**:
   - GPU acceleration with `transform: translateZ(0)`
   - `will-change` hints for animated elements
   - Reduced motion delays for lists
4. **Bundle Size**:
   - Tree shaking with Vite
   - Dynamic imports for heavy components

## Deployment

### Firebase Hosting
- **Config**: `firebase.json`
- **Build Command**: `npm run build`
- **Output**: `dist/` directory
- **Functions**: Node.js backend in `functions/`

### Cloudflare Workers
1. **CORS Proxy Worker**: Handles TicketsCloud API requests
2. **Yandex Gallery Worker**: Manages photo API with caching
3. **Configuration**: `wrangler.toml` files

## Security Considerations

- **Content Sanitization**: DOMPurify for user-generated HTML
- **API Key Protection**: Keys in environment variables and workers
- **CORS Handling**: Proxy workers for secure API access
- **Age Gate**: Client-side age verification (localStorage)

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari 14+, Chrome Mobile
- **Features**: CSS Grid, Flexbox, backdrop-filter, CSS custom properties

## Development Commands

```bash
npm run dev         # Start development server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## Known Issues & Limitations

1. **CORS**: TicketsCloud API requires proxy for browser requests
2. **Video Performance**: Large video files may impact mobile loading
3. **Yandex Integration**: Requires worker for authentication
4. **Age Gate**: Client-side only, not legally binding

## Current Development Focus

### 🎯 Active Implementation (December 2024)
**Video Circles Feature** - Telegram-style video previews in hero section
- Interactive circular video player with progress ring
- Randomizer button for discovering club moments
- Yandex Cloud integration for video storage
- Mobile-optimized with touch gestures

**Design System Standardization**
- Unified radius system (12px default)
- Consistent button styling across all pages
- Improved mobile responsiveness
- Enhanced visual hierarchy

For detailed progress, see [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

## Future Enhancements

### Planned Features
- [ ] Multi-language support (RU/EN)
- [ ] Enhanced ticket booking integration
- [ ] Admin panel for content management
- [ ] Analytics integration
- [ ] PWA capabilities
- [ ] Social media integration

### Performance Improvements
- [ ] Image CDN integration
- [ ] Service Worker for offline support
- [ ] WebP/AVIF image formats
- [ ] Critical CSS extraction

## Monitoring & Analytics

### Current Implementation
- Console logging for debugging
- Error boundaries for crash recovery
- Performance monitoring via browser DevTools

### Recommended Additions
- Google Analytics 4
- Sentry for error tracking
- Performance monitoring (Web Vitals)
- User behavior analytics

## Testing Strategy

### Current Coverage
- Manual testing across devices
- Browser compatibility checks
- API response validation

### Recommended Testing
- Unit tests with Vitest
- Component testing with React Testing Library
- E2E tests with Playwright
- Visual regression testing

## Maintenance Notes

### Regular Tasks
1. Update event data via TicketsCloud
2. Upload new photos to Yandex Disk
3. Monitor API usage and limits
4. Check browser compatibility
5. Update dependencies monthly

### Critical Dependencies
- TicketsCloud API availability
- Cloudflare Worker uptime
- Yandex Disk storage limits
- Firebase hosting quotas

## Contact & Support

**Venue**: VNVNC Concert Hall
**Address**: Конюшенная площадь 2В, Санкт-Петербург
**Social**: @vnvnc_spb (Instagram, Telegram)

---

*Documentation last updated: December 2024*
*Version: 0.0.0 (as per package.json)*