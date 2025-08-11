// Cloudflare Worker for Yandex Disk Public Gallery - V3 with proxy support
// Works with public folders WITHOUT OAuth authentication

const YANDEX_API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources';
const PUBLIC_LINK = 'https://disk.yandex.ru/d/sab0EP9Sm3G8LA'; // Your public folder link

// Helper function to extract date from folder name (YYYY-MM-DD format)
function extractDateFromFolderName(name) {
  const dateMatch = name.match(/^(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : null;
}

// Helper function to categorize photos based on folder name
function categorizePhoto(folderName) {
  const lowerName = folderName.toLowerCase();
  
  if (lowerName.includes('concert') || lowerName.includes('выступ') || lowerName.includes('performance')) {
    return 'performance';
  }
  if (lowerName.includes('party') || lowerName.includes('вечер')) {
    return 'party';
  }
  if (lowerName.includes('interior') || lowerName.includes('интерьер')) {
    return 'interior';
  }
  if (lowerName.includes('atmosphere') || lowerName.includes('атмосфера')) {
    return 'atmosphere';
  }
  
  return 'party'; // default category
}

// Get download URL for image
async function getProxiedImageUrl(publicKey, path) {
  const url = new URL('https://cloud-api.yandex.net/v1/disk/public/resources/download');
  url.searchParams.append('public_key', publicKey);
  
  if (path && path !== '/') {
    url.searchParams.append('path', path);
  }
  
  try {
    const response = await fetch(url.toString());
    if (response.ok) {
      const data = await response.json();
      return data.href; // This is the direct download URL
    }
  } catch (error) {
    console.error('Error getting download URL:', error);
  }
  
  return null;
}

// Recursive function to fetch photos from nested folders
async function fetchPhotosFromFolder(publicKey, path = '', folderInfo = {}, depth = 0) {
  // Prevent infinite recursion
  if (depth > 10) {
    console.warn('Max recursion depth reached');
    return [];
  }

  const photos = [];
  
  try {
    const url = new URL(YANDEX_API_BASE);
    url.searchParams.append('public_key', publicKey);
    
    if (path && path !== '/') {
      url.searchParams.append('path', path);
    }
    
    url.searchParams.append('limit', '100');
    // Don't request preview_size since we'll proxy the images
    
    console.log(`Fetching from: ${url.toString()}`);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Failed to fetch from Yandex Disk: ${response.status} - ${await response.text()}`);
      return photos;
    }
    
    const data = await response.json();
    
    // If this is a single file (not a folder)
    if (data.type === 'file' && data.mime_type && data.mime_type.startsWith('image/')) {
      // Generate proxy URL instead of using preview
      const proxyUrl = `/api/yandex-disk/image?path=${encodeURIComponent(data.path)}`;
      
      return [{
        id: `yd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        src: proxyUrl, // Use proxy URL
        thumbnailSrc: proxyUrl, // Same URL, we'll handle sizing client-side
        title: folderInfo.eventName || data.name.replace(/\.[^/.]+$/, ''),
        date: folderInfo.date,
        category: folderInfo.category || 'party',
        size: data.size,
        name: data.name,
        path: data.path,
        mimeType: data.mime_type
      }];
    }
    
    // If this is a folder with embedded items
    if (data._embedded && data._embedded.items) {
      console.log(`Found ${data._embedded.items.length} items in ${path || 'root'}`);
      
      // Process items in parallel for better performance
      const promises = data._embedded.items.map(async (item) => {
        if (item.type === 'dir') {
          // Check if this is a date folder
          const folderDate = extractDateFromFolderName(item.name);
          const updatedFolderInfo = folderDate ? {
            date: folderDate,
            eventName: item.name,
            category: categorizePhoto(item.name)
          } : folderInfo;
          
          // Recursively fetch photos from this folder
          return fetchPhotosFromFolder(publicKey, item.path, updatedFolderInfo, depth + 1);
        } else if (item.type === 'file' && item.mime_type && item.mime_type.startsWith('image/')) {
          // Generate proxy URL instead of using preview
          const proxyUrl = `/api/yandex-disk/image?path=${encodeURIComponent(item.path)}`;
          
          // This is an image file
          return {
            id: `yd-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            src: proxyUrl, // Use proxy URL
            thumbnailSrc: proxyUrl, // Same URL
            title: folderInfo.eventName || item.name.replace(/\.[^/.]+$/, ''),
            date: folderInfo.date,
            category: folderInfo.category || 'party',
            size: item.size,
            name: item.name,
            path: item.path,
            mimeType: item.mime_type
          };
        }
        return null;
      });
      
      const results = await Promise.all(promises);
      
      // Flatten results and filter out nulls
      results.forEach(result => {
        if (Array.isArray(result)) {
          photos.push(...result);
        } else if (result) {
          photos.push(result);
        }
      });
    }
  } catch (error) {
    console.error('Error fetching photos:', error);
  }
  
  return photos;
}

// Cache for image URLs (5 minutes)
const imageUrlCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Proxy handler for individual images
async function handleImageProxy(request, path) {
  const cacheKey = `img-${path}`;
  const cached = imageUrlCache.get(cacheKey);
  
  // Check if we have a cached URL that's still valid
  if (cached && cached.expires > Date.now()) {
    console.log('Using cached image URL for:', path);
    const imageResponse = await fetch(cached.url);
    
    if (imageResponse.ok) {
      return new Response(imageResponse.body, {
        headers: {
          'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
  
  // Get fresh download URL
  const downloadUrl = await getProxiedImageUrl(PUBLIC_LINK, path);
  
  if (!downloadUrl) {
    return new Response('Image not found', { status: 404 });
  }
  
  // Cache the URL
  imageUrlCache.set(cacheKey, {
    url: downloadUrl,
    expires: Date.now() + CACHE_TTL
  });
  
  // Fetch and proxy the image
  const imageResponse = await fetch(downloadUrl);
  
  if (!imageResponse.ok) {
    return new Response('Failed to fetch image', { status: imageResponse.status });
  }
  
  return new Response(imageResponse.body, {
    headers: {
      'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Main request handler
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // CORS headers for cross-origin requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
  };
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // NEW: Image proxy endpoint
    if (url.pathname === '/api/yandex-disk/image') {
      const path = url.searchParams.get('path');
      if (!path) {
        return new Response('Missing path parameter', { status: 400 });
      }
      return handleImageProxy(request, path);
    }
    
    // Endpoint: Get download URL for a specific photo
    if (url.pathname === '/api/yandex-disk/download') {
      const path = url.searchParams.get('path');
      const downloadUrl = await getProxiedImageUrl(PUBLIC_LINK, path);
      
      return new Response(JSON.stringify({ 
        downloadUrl,
        success: !!downloadUrl 
      }), {
        headers: corsHeaders
      });
    }
    
    // Main endpoint: Fetch all photos
    if (url.pathname === '/api/yandex-disk/photos') {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const category = url.searchParams.get('category');
      
      console.log(`Fetching photos - Category: ${category}, Limit: ${limit}, Offset: ${offset}`);
      
      // Fetch all photos recursively from the public folder
      let photos = await fetchPhotosFromFolder(PUBLIC_LINK, '/', {}, 0);
      
      console.log(`Total photos found: ${photos.length}`);
      
      // Filter by category if specified
      if (category && category !== 'all') {
        photos = photos.filter(photo => photo.category === category);
        console.log(`Photos after category filter: ${photos.length}`);
      }
      
      // Sort by date (newest first)
      photos.sort((a, b) => {
        if (a.date && b.date) {
          return b.date.localeCompare(a.date);
        }
        return 0;
      });
      
      // Calculate total before pagination
      const total = photos.length;
      
      // Apply pagination
      const paginatedPhotos = photos.slice(offset, offset + limit);
      
      // Update photo URLs to use full worker URL
      const workerUrl = `${url.protocol}//${url.hostname}`;
      paginatedPhotos.forEach(photo => {
        if (photo.src && photo.src.startsWith('/api/')) {
          photo.src = `${workerUrl}${photo.src}`;
        }
        if (photo.thumbnailSrc && photo.thumbnailSrc.startsWith('/api/')) {
          photo.thumbnailSrc = `${workerUrl}${photo.thumbnailSrc}`;
        }
      });
      
      return new Response(JSON.stringify({
        photos: paginatedPhotos,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        success: true
      }), {
        headers: corsHeaders
      });
    }
    
    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }), {
        headers: corsHeaders
      });
    }
    
    // Fallback for unknown endpoints
    return new Response(JSON.stringify({ 
      error: 'Invalid endpoint',
      availableEndpoints: [
        '/api/yandex-disk/photos',
        '/api/yandex-disk/download',
        '/api/yandex-disk/image',
        '/api/health'
      ]
    }), {
      status: 404,
      headers: corsHeaders
    });
    
  } catch (error) {
    console.error('Worker error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      details: error.message,
      success: false
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Export for Cloudflare Workers
export default {
  async fetch(request) {
    return handleRequest(request);
  }
};