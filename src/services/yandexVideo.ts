// Yandex Disk Video Service
// Extends the existing Yandex Disk service for video content

import axios from 'axios';

// Use the same Cloudflare Worker URL as photos
const API_BASE_URL = 'https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net';

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

    // COMMENTED OUT - Yandex API temporarily disabled, will restore when API is fixed
    /*
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
    }
    */

    // Temporarily using local videos until Yandex API is fixed
    console.log('Loading local video circle videos...');
    
    // Use local videos from /videocircles folder
    const videoFiles = [
      '2025-08-25 20.49.40.mp4', '2025-08-25 20.50.12.mp4', '2025-08-25 20.50.20.mp4',
      '2025-08-25 20.50.28.mp4', '2025-08-25 20.53.07.mp4', '2025-08-25 20.53.11.mp4',
      '2025-08-25 20.53.15.mp4', '2025-08-25 20.53.20.mp4', '2025-08-25 20.53.25.mp4',
      '2025-08-25 20.53.29.mp4', '2025-08-25 20.53.32.mp4', '2025-08-25 20.53.35.mp4',
      '2025-08-25 20.53.38.mp4', '2025-08-25 20.53.41.mp4', '2025-08-25 20.53.45.mp4',
      '2025-08-25 20.53.48.mp4', '2025-08-25 20.53.53.mp4', '2025-08-25 20.54.06.mp4',
      '2025-08-25 20.54.13.mp4', '2025-08-25 20.54.17.mp4', '2025-08-25 20.54.41.mp4',
      '2025-08-25 20.54.44.mp4', '2025-08-25 20.54.47.mp4', '2025-08-25 20.54.53.mp4',
      '2025-08-25 20.54.57.mp4', '2025-08-25 20.55.00.mp4', '2025-08-25 20.55.04.mp4',
      '2025-08-25 20.55.07.mp4', '2025-08-25 20.55.18.mp4', '2025-08-25 20.55.21.mp4',
      '2025-08-25 20.55.25.mp4', '2025-08-25 20.55.30.mp4', '2025-08-25 20.55.34.mp4',
      '2025-08-25 20.55.39.mp4', '2025-08-25 20.55.42.mp4', '2025-08-25 20.55.50.mp4',
      '2025-08-25 20.56.07.mp4', '2025-08-25 20.56.11.mp4', '2025-08-25 20.56.14.mp4',
      '2025-08-25 20.56.17.mp4', '2025-08-25 20.56.21.mp4', '2025-08-25 20.56.23.mp4',
      '2025-08-25 20.56.35.mp4', '2025-08-25 20.56.38.mp4', '2025-08-25 20.56.43.mp4',
      '2025-08-25 20.56.47.mp4', '2025-08-25 20.56.50.mp4', '2025-08-25 20.56.57.mp4',
      '2025-08-25 20.56.59.mp4', '2025-08-25 20.57.07.mp4', '2025-08-25 20.57.10.mp4',
      '2025-08-25 20.57.13.mp4', '2025-08-25 20.57.16.mp4', '2025-08-25 20.57.20.mp4',
      '2025-08-25 20.57.24.mp4', '2025-08-25 20.57.28.mp4', '2025-08-25 20.57.31.mp4'
    ];
    
    // Shuffle the array to get random order
    const shuffled = [...videoFiles].sort(() => Math.random() - 0.5);
    
    // Return videos with proper format
    const videos: YandexVideo[] = shuffled.slice(0, Math.min(limit, videoFiles.length)).map((filename, index) => ({
      id: `video-${index}`,
      url: `/videocircles/${filename}`,
      title: `VNVNC Moment ${index + 1}`,
      name: filename,
      path: `/videocircles/${filename}`,
      duration: 30,
      thumbnailUrl: '/placeholder-video.jpg'
    }));
    
    // Cache the response
    this.cache.set(cacheKey, {
      data: videos,
      timestamp: Date.now()
    });
    
    console.log(`Loaded ${videos.length} local videos`);
    return videos;
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