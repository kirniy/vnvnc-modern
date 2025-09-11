# CLAUDE.md - VNVNC Modern Development Guide

## 🚨 ACTIVE DEVELOPMENT - 2025

**Current Focus**: Major UI improvements for production launch
- **Phase 1**: Hero section redesign with video circles feature (IN PROGRESS)
- **Phase 2**: Yandex Cloud video integration
- **Phase 3**: Design system consistency fixes
- **Phase 4**: Content improvements
- **Phase 5**: Mobile optimization

📋 **See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed tasks and progress tracking**

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
- **TicketsCloud API Key**: `c862e40ed178486285938dda33038e30` (in ticketsCloud.ts)
- **CORS Proxy Worker**: `https://vnvnc-cors-proxy.kirlich-ps3.workers.dev`
- **Yandex Gallery Worker**: `https://vnvnc-yandex-gallery.kirlich-ps3.workers.dev`

### Production URLs
- **Main Site**: https://vnvnc.ru (Hosted on Selectel Object Storage)
- **Direct Selectel URL**: https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
- **Workers**: Deployed via Cloudflare Workers

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
**Solution**: Use Cloudflare Worker proxy at `vnvnc-cors-proxy.kirlich-ps3.workers.dev`

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

### Selectel Deployment
```bash
# Build the project
npm run build

# Deploy to Selectel using the deployment script
./deploy-to-selectel.sh
```

### Manual Selectel Deployment (if needed)
```bash
# Build the project
npm run build

# Upload to Selectel S3 bucket
aws s3 sync dist/ s3://vnvnc/ --endpoint-url=https://s3.storage.selcloud.ru --delete
```

### Cloudflare Workers
```bash
# For CORS proxy
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
**Deployment**: Selectel Object Storage + Cloudflare Workers
**Hosting Provider**: Selectel (Russia-based, no blocking issues)
**APIs**: TicketsCloud, Yandex Disk

---

*Last updated: September 2025*
*Ready for production deployment with noted improvements needed*