// Yandex Disk API Service
// Handles communication with our Cloudflare Worker for fetching photos from Yandex Disk

import axios from 'axios';

// Use Yandex Cloud Function endpoint
// This replaces the banned Cloudflare Workers in Russia
const API_BASE_URL = 'https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net';
// Old Cloudflare endpoint (banned in Russia)
// const OLD_CLOUDFLARE_URL = 'https://vnvnc-yandex-gallery.kirlich-ps3.workers.dev';

export interface YandexPhoto {
  id: string;
  src: string;
  thumbnailSrc?: string;
  fullSrc?: string;
  downloadUrl?: string;
  title: string;
  date?: string;
  category: string;
  size?: number;
  name: string;
  path: string;
  [key: string]: any; // Allow additional properties from API
}

export interface PhotosResponse {
  photos: YandexPhoto[];
  total: number;
  limit: number;
  offset: number;
}

export interface PhotoFilters {
  category?: string;
  limit?: number;
  offset?: number;
  date?: string; // YYYY-MM-DD
}

class YandexDiskService {
  private cache: Map<string, { data: PhotosResponse; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

  /**
   * Fetch photos from Yandex Disk - try direct API or use local fallback
   */
  async fetchPhotos(filters: PhotoFilters = {}): Promise<PhotosResponse> {
    const cacheKey = JSON.stringify(filters);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Try to fetch from Yandex Cloud API first
    try {
      const params: any = {
        limit: filters.limit || 12,
        offset: filters.offset || 0
      };
      
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }
      
      if (filters.date) {
        params.date = filters.date;
      }

      const response = await axios.get<PhotosResponse>(
        `${API_BASE_URL}/api/yandex-disk/photos`,
        { params }
      );

      if (response.data && response.data.photos) {
        console.log(`Fetched ${response.data.photos.length} photos from Yandex Cloud`);
        
        // Cache the response
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
        
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching from Yandex Cloud, using local fallback:', error);
    }

    // Use local photos as fallback if API fails
    console.log('Using local gallery photos (Yandex API fallback)');
    
    // Local photos from /public/photos folder
    const localPhotos: YandexPhoto[] = [
      {
        id: 'photo1',
        src: '/photos/IMG_5014_resized.jpg',
        thumbnailSrc: '/photos/IMG_5014_resized.jpg',
        fullSrc: '/photos/IMG_5014_resized.jpg',
        title: 'VNVNC Moment 1',
        category: 'events',
        name: 'IMG_5014_resized.jpg',
        path: '/photos/IMG_5014_resized.jpg',
        date: '2024-12-01'
      },
      {
        id: 'photo2',
        src: '/photos/IMG_5036_resized.jpg',
        thumbnailSrc: '/photos/IMG_5036_resized.jpg',
        fullSrc: '/photos/IMG_5036_resized.jpg',
        title: 'VNVNC Moment 2',
        category: 'events',
        name: 'IMG_5036_resized.jpg',
        path: '/photos/IMG_5036_resized.jpg',
        date: '2024-12-01'
      },
      {
        id: 'photo3',
        src: '/photos/IMG_5094_resized.jpg',
        thumbnailSrc: '/photos/IMG_5094_resized.jpg',
        fullSrc: '/photos/IMG_5094_resized.jpg',
        title: 'VNVNC Moment 3',
        category: 'events',
        name: 'IMG_5094_resized.jpg',
        path: '/photos/IMG_5094_resized.jpg',
        date: '2024-12-02'
      },
      {
        id: 'photo4',
        src: '/photos/IMG_5126_resized.jpg',
        thumbnailSrc: '/photos/IMG_5126_resized.jpg',
        fullSrc: '/photos/IMG_5126_resized.jpg',
        title: 'VNVNC Moment 4',
        category: 'events',
        name: 'IMG_5126_resized.jpg',
        path: '/photos/IMG_5126_resized.jpg',
        date: '2024-12-02'
      },
      {
        id: 'photo5',
        src: '/photos/IMG_5730_resized.jpg',
        thumbnailSrc: '/photos/IMG_5730_resized.jpg',
        fullSrc: '/photos/IMG_5730_resized.jpg',
        title: 'VNVNC Moment 5',
        category: 'events',
        name: 'IMG_5730_resized.jpg',
        path: '/photos/IMG_5730_resized.jpg',
        date: '2024-12-03'
      },
      {
        id: 'photo6',
        src: '/photos/IMG_5765_resized.jpg',
        thumbnailSrc: '/photos/IMG_5765_resized.jpg',
        fullSrc: '/photos/IMG_5765_resized.jpg',
        title: 'VNVNC Moment 6',
        category: 'events',
        name: 'IMG_5765_resized.jpg',
        path: '/photos/IMG_5765_resized.jpg',
        date: '2024-12-03'
      },
      {
        id: 'photo7',
        src: '/photos/IMG_5818_resized.jpg',
        thumbnailSrc: '/photos/IMG_5818_resized.jpg',
        fullSrc: '/photos/IMG_5818_resized.jpg',
        title: 'VNVNC Moment 7',
        category: 'events',
        name: 'IMG_5818_resized.jpg',
        path: '/photos/IMG_5818_resized.jpg',
        date: '2024-12-04'
      },
      {
        id: 'photo8',
        src: '/photos/IMG_5903_resized.jpg',
        thumbnailSrc: '/photos/IMG_5903_resized.jpg',
        fullSrc: '/photos/IMG_5903_resized.jpg',
        title: 'VNVNC Moment 8',
        category: 'events',
        name: 'IMG_5903_resized.jpg',
        path: '/photos/IMG_5903_resized.jpg',
        date: '2024-12-04'
      }
    ];
    
    // Apply filters
    let filteredPhotos = localPhotos;
    
    if (filters.category && filters.category !== 'all') {
      filteredPhotos = filteredPhotos.filter(p => p.category === filters.category);
    }
    
    if (filters.date) {
      filteredPhotos = filteredPhotos.filter(p => p.date === filters.date);
    }
    
    // Apply pagination
    const limit = filters.limit || 12;
    const offset = filters.offset || 0;
    const paginatedPhotos = filteredPhotos.slice(offset, offset + limit);
    
    const response: PhotosResponse = {
      photos: paginatedPhotos,
      total: filteredPhotos.length,
      limit,
      offset
    };
    
    // Cache the response
    this.cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    return response;
  }

  /**
   * Get download URL for a specific photo
   */
  async getDownloadUrl(path: string): Promise<string | null> {
    try {
      const response = await axios.get<{ downloadUrl: string }>(
        `${API_BASE_URL}/api/yandex-disk/download`,
        {
          params: { path }
        }
      );

      return response.data.downloadUrl;
    } catch (error) {
      console.error('Error getting download URL:', error);
      return null;
    }
  }

  /**
   * Transform Yandex photos to match the existing gallery format
   */
  transformToGalleryFormat(photos: YandexPhoto[]) {
    return photos.map(photo => ({
      id: photo.id,
      src: photo.src,
      title: photo.title,
      category: photo.category,
      date: photo.date,
      originalPath: photo.path
    }));
  }

  /**
   * Get all available dates from Yandex Disk
   */
  async fetchAllDates(): Promise<string[]> {
    try {
      const response = await axios.get<{ dates: string[]; total: number; success: boolean }>(
        `${API_BASE_URL}/api/yandex-disk/dates`
      );
      
      return response.data.dates || [];
    } catch (error) {
      console.error('Error fetching dates from Yandex Disk:', error);
      return [];
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Batch fetch photos with pagination
   */
  async fetchAllPhotos(category: string = 'all'): Promise<YandexPhoto[]> {
    const allPhotos: YandexPhoto[] = [];
    const limit = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.fetchPhotos({ category, limit, offset });
      allPhotos.push(...response.photos);
      
      offset += limit;
      hasMore = offset < response.total;
      
      // Safety limit to prevent infinite loops
      if (allPhotos.length > 1000) {
        break;
      }
    }

    return allPhotos;
  }
}

// Export singleton instance
export const yandexDiskService = new YandexDiskService();

// Export default for convenience
export default yandexDiskService;