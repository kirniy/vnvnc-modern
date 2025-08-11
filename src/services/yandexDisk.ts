// Yandex Disk API Service
// Handles communication with our Cloudflare Worker for fetching photos from Yandex Disk

import axios from 'axios';

// Use the Cloudflare Worker URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://vnvnc-yandex-gallery.kirlich-ps3.workers.dev' // Deployed worker URL
  : 'http://localhost:8787'; // For local development with wrangler

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
   * Fetch photos from Yandex Disk via our Cloudflare Worker
   */
  async fetchPhotos(filters: PhotoFilters = {}): Promise<PhotosResponse> {
    const cacheKey = JSON.stringify(filters);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await axios.get<PhotosResponse>(`${API_BASE_URL}/api/yandex-disk/photos`, {
        params: {
          category: filters.category || 'all',
          limit: filters.limit || 12,
          offset: filters.offset || 0,
          date: filters.date
        }
      });

      // Cache the response
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching photos from Yandex Disk:', error);
      
      // Return empty response on error
      return {
        photos: [],
        total: 0,
        limit: filters.limit || 50,
        offset: filters.offset || 0
      };
    }
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