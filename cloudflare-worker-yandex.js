// Cloudflare Worker for Yandex Disk Gallery Integration
// This worker fetches photos from a public Yandex Disk folder and returns them in a structured format

const YANDEX_API_BASE = 'https://cloud-api.yandex.net/v1/disk/public/resources';
const PUBLIC_KEY = 'https://disk.yandex.ru/d/sab0EP9Sm3G8LA'; // Full public link

// Helper function to extract date from folder name
function extractDateFromFolderName(name) {
  const dateMatch = name.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1];
  }
  return null;
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

// Recursive function to fetch photos from nested folders
async function fetchPhotosFromFolder(publicKey, path = '', folderInfo = {}) {
  const photos = [];
  
  try {
    const url = new URL(YANDEX_API_BASE);
    url.searchParams.append('public_key', publicKey);
    if (path) {
      url.searchParams.append('path', path);
    }
    url.searchParams.append('limit', '100');
    url.searchParams.append('preview_size', 'L'); // 500px preview
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Failed to fetch from Yandex Disk: ${response.status}`);
      return photos;
    }
    
    const data = await response.json();
    
    // If this is a file, add it to photos
    if (data.type === 'file' && data.mime_type && data.mime_type.startsWith('image/')) {
      return [{
        src: data.preview || '',
        downloadUrl: '', // Will be generated separately if needed
        title: folderInfo.eventName || data.name,
        date: folderInfo.date,
        category: folderInfo.category,
        size: data.size,
        name: data.name,
        path: data.path
      }];
    }
    
    // If this is a folder, process its contents
    if (data._embedded && data._embedded.items) {
      for (const item of data._embedded.items) {
        if (item.type === 'dir') {
          // Check if this is a date folder
          const folderDate = extractDateFromFolderName(item.name);
          const updatedFolderInfo = folderDate ? {
            date: folderDate,
            eventName: item.name,
            category: categorizePhoto(item.name)
          } : folderInfo;
          
          // Recursively fetch photos from this folder
          const nestedPhotos = await fetchPhotosFromFolder(
            publicKey,
            item.path,
            updatedFolderInfo
          );
          photos.push(...nestedPhotos);
        } else if (item.type === 'file' && item.mime_type && item.mime_type.startsWith('image/')) {
          // This is an image file
          photos.push({
            src: item.preview || '',
            downloadUrl: '', // Will be generated separately if needed
            title: folderInfo.eventName || item.name,
            date: folderInfo.date,
            category: folderInfo.category || 'party',
            size: item.size,
            name: item.name,
            path: item.path
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching photos:', error);
  }
  
  return photos;
}

// Function to get download URL for a specific photo
async function getDownloadUrl(publicKey, path) {
  const url = new URL('https://cloud-api.yandex.net/v1/disk/public/resources/download');
  url.searchParams.append('public_key', publicKey);
  if (path) {
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

// Main handler
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Check if we're requesting a specific download URL
    if (url.pathname === '/api/yandex-disk/download') {
      const path = url.searchParams.get('path');
      const downloadUrl = await getDownloadUrl(PUBLIC_KEY, path);
      
      return new Response(JSON.stringify({ downloadUrl }), {
        headers: corsHeaders
      });
    }
    
    // Default: fetch all photos
    if (url.pathname === '/api/yandex-disk/photos') {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const category = url.searchParams.get('category');
      
      // Fetch all photos recursively
      let photos = await fetchPhotosFromFolder(PUBLIC_KEY);
      
      // Filter by category if specified
      if (category && category !== 'all') {
        photos = photos.filter(photo => photo.category === category);
      }
      
      // Sort by date (newest first)
      photos.sort((a, b) => {
        if (a.date && b.date) {
          return b.date.localeCompare(a.date);
        }
        return 0;
      });
      
      // Apply pagination
      const paginatedPhotos = photos.slice(offset, offset + limit);
      
      // Add unique IDs to photos
      const photosWithIds = paginatedPhotos.map((photo, index) => ({
        ...photo,
        id: `yd-${offset + index}-${Date.now()}`
      }));
      
      return new Response(JSON.stringify({
        photos: photosWithIds,
        total: photos.length,
        limit,
        offset
      }), {
        headers: corsHeaders
      });
    }
    
    // Fallback response
    return new Response(JSON.stringify({ 
      error: 'Invalid endpoint',
      availableEndpoints: [
        '/api/yandex-disk/photos',
        '/api/yandex-disk/download'
      ]
    }), {
      status: 404,
      headers: corsHeaders
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch photos',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export default {
  async fetch(request) {
    return handleRequest(request);
  }
};