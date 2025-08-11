// Cloudflare Worker for Yandex Disk Public Gallery
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

// Get optimized preview URL based on size
function getOptimizedPreviewUrl(originalUrl, size = 'XL') {
  // Yandex Disk preview sizes:
  // S = 150px, M = 300px, L = 500px, XL = 800px, XXL = 1024px, XXXL = 1280px
  
  // If URL already has size parameter, replace it
  if (originalUrl && originalUrl.includes('size=')) {
    return originalUrl.replace(/size=[^&]*/, `size=${size}`);
  }
  
  // Add size parameter if not present
  if (originalUrl && originalUrl.includes('?')) {
    return `${originalUrl}&size=${size}`;
  }
  
  return originalUrl;
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
    url.searchParams.append('preview_size', 'XL'); // Request XL size (800px width)
    url.searchParams.append('preview_crop', 'false'); // Don't crop images
    
    console.log(`Fetching from: ${url.toString()}`);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Failed to fetch from Yandex Disk: ${response.status} - ${await response.text()}`);
      return photos;
    }
    
    const data = await response.json();
    
    // If this is a single file (not a folder)
    if (data.type === 'file' && data.mime_type && data.mime_type.startsWith('image/')) {
      return [{
        id: `yd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        src: getOptimizedPreviewUrl(data.preview, 'XL'),
        thumbnailSrc: getOptimizedPreviewUrl(data.preview, 'M'),
        downloadUrl: data.file || '',
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
          // This is an image file
          return {
            id: `yd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            src: getOptimizedPreviewUrl(item.preview, 'XL'),
            thumbnailSrc: getOptimizedPreviewUrl(item.preview, 'M'),
            downloadUrl: item.file || '',
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

// Get download URL for a specific photo
async function getDownloadUrl(publicKey, path) {
  const url = new URL('https://cloud-api.yandex.net/v1/disk/public/resources/download');
  url.searchParams.append('public_key', publicKey);
  
  if (path && path !== '/') {
    url.searchParams.append('path', path);
  }
  
  try {
    const response = await fetch(url.toString());
    if (response.ok) {
      const data = await response.json();
      return data.href;
    }
  } catch (error) {
    console.error('Error getting download URL:', error);
  }
  
  return null;
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
    // Endpoint: Get download URL for a specific photo
    if (url.pathname === '/api/yandex-disk/download') {
      const path = url.searchParams.get('path');
      const downloadUrl = await getDownloadUrl(PUBLIC_LINK, path);
      
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
      const size = url.searchParams.get('size') || 'XL'; // Default to XL for gallery
      
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
        timestamp: new Date().toISOString()
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