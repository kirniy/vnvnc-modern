// Yandex Disk Video Service
// Extends the existing Yandex Disk service for video content

import axios from 'axios';

// Use the same Cloudflare Worker URL as photos
const API_BASE_URL = 'https://vnvnc-yandex-gallery.kirlich-ps3.workers.dev';

export interface YandexVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  duration?: number;
  size?: number;
  name: string;
  path: string;
  format?: string;
}

export interface VideosResponse {
  videos: YandexVideo[];
  total: number;
  limit: number;
  offset: number;
}

class YandexVideoService {
  private cache: Map<string, { data: VideosResponse | YandexVideo[]; timestamp: number }> = new Map();
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes cache - videos don't change often
  
  /**
   * Fetch videos from Yandex Disk via our Cloudflare Worker
   * Since the worker might not have video endpoint yet, we'll use the photo endpoint
   * and filter for video files, or use direct public link access
   */
  async fetchVideos(limit: number = 100): Promise<YandexVideo[]> {
    const cacheKey = `videos_${limit}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as YandexVideo[];
    }

    try {
      // Use the new videos endpoint from our updated worker
      console.log('Fetching videos from Yandex Disk...');
      
      // The public link you provided: https://disk.yandex.ru/d/ZRgG4VNkWwpm4Q
      const publicKey = 'https://disk.yandex.ru/d/ZRgG4VNkWwpm4Q';
      
      const response = await axios.get(`${API_BASE_URL}/api/yandex-disk/videos`, {
        params: {
          public_key: publicKey,
          limit
        }
      });

      if (response.data && response.data.videos) {
        const videos = response.data.videos.map((item: any) => ({
          id: item.id,
          url: item.url || item.preview,
          title: item.title || 'VNVNC Moment',
          name: item.name,
          path: item.path,
          duration: item.duration || 30,
          preview: item.preview
        }));
        
        // Cache the response
        this.cache.set(cacheKey, {
          data: videos,
          timestamp: Date.now()
        });

        console.log(`Fetched ${videos.length} videos from Yandex Disk`);
        return videos;
      }
      
      throw new Error('No videos found in response');
    } catch (error) {
      console.log('Cannot fetch videos from Yandex, using fallback videos');
      
      // Fallback to local hero videos until Yandex integration is complete
      const fallbackVideos: YandexVideo[] = [
        {
          id: 'local1',
          url: '/herovideo-mobile.mp4',
          title: 'VNVNC Atmosphere',
          name: 'herovideo-mobile.mp4',
          path: '/herovideo-mobile.mp4',
          duration: 10
        },
        {
          id: 'local2',
          url: '/herovideo-optimized.mp4',
          title: 'VNVNC Vibes',
          name: 'herovideo-optimized.mp4',
          path: '/herovideo-optimized.mp4',
          duration: 10
        },
        {
          id: 'local3',
          url: '/herovideo.mp4',
          title: 'VNVNC Energy',
          name: 'herovideo.mp4',
          path: '/herovideo.mp4',
          duration: 10
        }
      ];
      
      // Cache the fallback
      this.cache.set('videos_10', {
        data: fallbackVideos,
        timestamp: Date.now()
      });
      
      return fallbackVideos;
    }
  }

  /**
   * Get a random video from the collection
   */
  async fetchRandomVideo(excludeId?: string): Promise<YandexVideo | null> {
    try {
      const videos = await this.fetchVideos();
      
      // Filter out the excluded video if provided
      const availableVideos = excludeId 
        ? videos.filter(v => v.id !== excludeId)
        : videos;
      
      if (availableVideos.length === 0) return null;
      
      // Return random video
      const randomIndex = Math.floor(Math.random() * availableVideos.length);
      return availableVideos[randomIndex];
    } catch (error) {
      console.error('Error fetching random video:', error);
      return null;
    }
  }

  /**
   * Get video streaming URL
   * This would typically get a direct streaming URL from Yandex
   */
  async getStreamUrl(path: string): Promise<string | null> {
    try {
      const response = await axios.get<{ streamUrl: string }>(
        `${API_BASE_URL}/api/yandex-disk/stream`,
        {
          params: { path }
        }
      );

      return response.data.streamUrl;
    } catch (error) {
      console.error('Error getting stream URL:', error);
      // Return the original path as fallback
      return path;
    }
  }

  /**
   * Transform video URL for direct access
   * Yandex Disk public links need transformation for direct video access
   */
  transformVideoUrl(shareUrl: string): string {
    // Transform Yandex Disk share URL to direct download URL
    // Example: https://disk.yandex.ru/i/xxxxx -> https://downloader.disk.yandex.ru/disk/xxxxx
    if (shareUrl.includes('disk.yandex.ru/i/')) {
      const id = shareUrl.split('/i/')[1];
      return `https://downloader.disk.yandex.ru/disk/${id}`;
    }
    return shareUrl;
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const yandexVideoService = new YandexVideoService();

export default yandexVideoService;