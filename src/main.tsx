import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes - data is considered fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - keep in cache even if inactive (was cacheTime in v4)
      retry: 2, // Retry failed requests twice
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnWindowFocus: false, // Don't refetch on tab focus during high traffic
      refetchOnMount: 'always', // Always check for fresh data on component mount
      refetchOnReconnect: true, // Refetch when reconnecting to network
    },
  },
})

// Register service worker for PWA and caching - Fixed registration 2025-09-12
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  // Use a more unique flag to prevent double registration
  if (!window.__VNVNC_SW_REGISTERED__) {
    window.__VNVNC_SW_REGISTERED__ = true;
    
    // Wait for window load before registering
    if (document.readyState === 'complete') {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    } else {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered:', registration.scope);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      }, { once: true });
    }
  }
}

// Add type declaration for the global flag
declare global {
  interface Window {
    __VNVNC_SW_REGISTERED__?: boolean;
  }
}

// Ensure DOM is ready before rendering
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <App />
          </Router>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>,
  )
}
