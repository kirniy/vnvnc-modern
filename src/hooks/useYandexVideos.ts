import { useState, useEffect } from 'react';
import yandexVideoService from '../services/yandexVideo';

interface YandexVideo {
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

interface UseYandexVideosResult {
  videos: YandexVideo[];
  currentVideo: YandexVideo | null;
  nextVideo: YandexVideo | null;
  isLoading: boolean;
  error: string | null;
  fetchRandomVideo: () => Promise<void>;
  preloadedVideoElement: HTMLVideoElement | null;
}

export const useYandexVideos = (): UseYandexVideosResult => {
  const [videos, setVideos] = useState<YandexVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<YandexVideo | null>(null);
  const [nextVideo, setNextVideo] = useState<YandexVideo | null>(null);
  const [isLoading] = useState(false); // Always false since we start with background video
  const [error, setError] = useState<string | null>(null);
  const [preloadedVideoElement, setPreloadedVideoElement] = useState<HTMLVideoElement | null>(null);
  const [hasShuffled, setHasShuffled] = useState(false); // Track if user has shuffled
  const [recentVideoIds, setRecentVideoIds] = useState<string[]>([]); // Track recently played videos
  const [preloadedVideosCache] = useState<Map<string, HTMLVideoElement>>(new Map()); // Cache preloaded video elements
  const [isLoadingVideos, setIsLoadingVideos] = useState(false); // Track if we're already loading
  const [pendingVideoSwitch, setPendingVideoSwitch] = useState(false); // Track if user wants to switch but videos aren't ready

  // Initialize with background video immediately
  useEffect(() => {
    // Set the compressed 1x1 video with sound for the circle
    const backgroundVideo: YandexVideo = {
      id: 'background-hero',
      url: '/herovideo-compressed-1x1.mp4', // Compressed 1x1 version with sound for circle
      title: 'VNVNC',
      name: 'herovideo-compressed-1x1.mp4',
      path: '/herovideo-compressed-1x1.mp4',
      duration: 10
    };
    setCurrentVideo(backgroundVideo);
    
    // Load Yandex videos immediately in background
    loadVideosInBackground();
  }, []);

  // Preload next video whenever current video changes (with delay to not block initial load)
  useEffect(() => {
    if (currentVideo && videos.length > 1) {
      // Delay preloading to ensure first video displays immediately
      const timeoutId = setTimeout(() => {
        preloadNextVideo();
      }, 1000); // Wait 1 second before starting to preload next video
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentVideo, videos]);

  // Watch for videos to be loaded and switch if user clicked early
  useEffect(() => {
    if (pendingVideoSwitch && videos.length > 0 && !isLoadingVideos) {
      console.log('Videos loaded! Switching to random video now...');
      setPendingVideoSwitch(false);
      setHasShuffled(true);
      
      // Pick a random video from the loaded ones
      const availableVideos = videos.filter(v => v.id !== currentVideo?.id);
      if (availableVideos.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(availableVideos.length, 6)); // Pick from first 6 for better chance of preloaded
        const randomVideo = availableVideos[randomIndex];
        
        if (randomVideo) {
          setCurrentVideo(randomVideo);
          setRecentVideoIds(prev => [...prev, randomVideo.id].slice(-15));
          console.log('Auto-switched to:', randomVideo.title);
        }
      }
    }
  }, [videos.length, isLoadingVideos, pendingVideoSwitch, currentVideo?.id]);

  const loadVideosInBackground = async () => {
    // Prevent duplicate loading
    if (isLoadingVideos || videos.length > 0) {
      console.log('Already loading or loaded videos, skipping...');
      return;
    }
    
    setIsLoadingVideos(true);
    
    try {
      // Don't show loading state since we already have a video playing
      setError(null);
      
      console.log('Loading Yandex videos in background...');
      const fetchedVideos = await yandexVideoService.fetchVideos();
      console.log('Fetched videos in background:', fetchedVideos);
      setVideos(fetchedVideos);
      
      // OPTIMIZED: Smarter progressive preloading based on connection speed
      if (fetchedVideos.length > 0) {
        // Check connection speed
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        const effectiveType = connection?.effectiveType || '4g';
        const saveData = connection?.saveData || false;
        
        // Adjust preloading based on connection - INCREASED for instant switching
        let videosToPreload = 12; // Increased default for instant response
        let preloadStrategy = 'auto';
        
        if (saveData) {
          videosToPreload = 3; // Still preload 3 for better UX
          preloadStrategy = 'metadata';
        } else if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          videosToPreload = 3;
          preloadStrategy = 'metadata';
        } else if (effectiveType === '3g') {
          videosToPreload = 6; // Increased from 2 for instant switching
          preloadStrategy = 'auto'; // Changed to auto for faster loading
        } else if (effectiveType === '4g') {
          videosToPreload = 12; // Increased from 4 for instant response
          preloadStrategy = 'auto';
        }
        
        console.log(`Connection: ${effectiveType}, preloading ${videosToPreload} videos with ${preloadStrategy} strategy`);
        
        // PHASE 1: Load first video immediately (always)
        const firstVideo = fetchedVideos[0];
        if (firstVideo) {
          const video = document.createElement('video');
          video.src = firstVideo.url;
          video.preload = 'auto'; // Always preload first one fully
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          
          preloadedVideosCache.set(firstVideo.id, video);
          video.load();
          console.log('Priority preload:', firstVideo.title);
          
          video.addEventListener('canplaythrough', () => {
            console.log('First video ready:', firstVideo.title);
          }, { once: true });
        }
        
        // PHASE 2: Progressive loading based on connection
        if (videosToPreload > 1) {
          // Use requestIdleCallback for non-blocking preloading
          const preloadNextBatch = (startIndex: number, count: number, delay: number) => {
            setTimeout(() => {
              const batch = fetchedVideos.slice(startIndex, startIndex + count);
              batch.forEach((videoData) => {
                if (!preloadedVideosCache.has(videoData.id)) {
                  const idleCallback = () => {
                    const video = document.createElement('video');
                    video.src = videoData.url;
                    video.preload = (startIndex < 2 ? preloadStrategy : 'metadata') as '' | 'metadata' | 'none' | 'auto';
                    video.muted = true;
                    video.loop = true;
                    video.playsInline = true;
                    
                    preloadedVideosCache.set(videoData.id, video);
                    
                    // Only call load() for high priority videos
                    if (startIndex < 3 && preloadStrategy === 'auto') {
                      video.load();
                    }
                    console.log(`Preload (${preloadStrategy}):`, videoData.title);
                  };
                  
                  if ('requestIdleCallback' in window) {
                    window.requestIdleCallback(idleCallback, { timeout: 2000 });
                  } else {
                    setTimeout(idleCallback, 100);
                  }
                }
              });
            }, delay);
          };
          
          // Smart batching based on connection
          if (videosToPreload >= 4) {
            preloadNextBatch(1, 1, 500);   // 2nd video after 0.5s
            preloadNextBatch(2, 2, 2000);  // 3rd-4th after 2s
            if (videosToPreload >= 6) {
              preloadNextBatch(4, 2, 5000);  // 5th-6th after 5s
            }
          } else if (videosToPreload >= 2) {
            preloadNextBatch(1, videosToPreload - 1, 1000); // Rest after 1s
          }
        }
      }
    } catch (err) {
      console.error('Error loading videos in background:', err);
      setError('Failed to load videos');
      
      // Use fallback video data with all existing hero videos
      const fallbackVideos: YandexVideo[] = [
        {
          id: 'fallback1',
          url: '/herovideo-mobile.mp4',
          title: 'VNVNC Atmosphere',
          name: 'herovideo-mobile.mp4',
          path: '/herovideo-mobile.mp4',
          duration: 10
        },
        {
          id: 'fallback2',
          url: '/herovideo-optimized.mp4',
          title: 'VNVNC Vibes',
          name: 'herovideo-optimized.mp4',
          path: '/herovideo-optimized.mp4',
          duration: 10
        },
        {
          id: 'fallback3',
          url: '/herovideo.mp4',
          title: 'VNVNC Energy',
          name: 'herovideo.mp4',
          path: '/herovideo.mp4',
          duration: 10
        }
      ];
      setVideos(fallbackVideos);
      // Don't override current video since we already have the background video playing
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const getRandomVideo = (excludeId?: string) => {
    // Filter out current video and recently played videos
    const recentThreshold = Math.min(10, Math.floor(videos.length * 0.5)); // Don't repeat for at least 10 videos or half the collection
    const recentToExclude = recentVideoIds.slice(-recentThreshold);
    const availableVideos = videos.filter(v => 
      v.id !== excludeId && !recentToExclude.includes(v.id)
    );
    
    // If we've excluded too many, just exclude the last 5
    if (availableVideos.length === 0) {
      const lessRecentToExclude = recentVideoIds.slice(-5);
      const fallbackVideos = videos.filter(v => 
        v.id !== excludeId && !lessRecentToExclude.includes(v.id)
      );
      if (fallbackVideos.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackVideos.length);
        return fallbackVideos[randomIndex];
      }
    }
    
    if (availableVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableVideos.length);
      return availableVideos[randomIndex];
    }
    return videos.length > 0 ? videos[0] : null;
  };

  const preloadNextVideo = () => {
    const next = getRandomVideo(currentVideo?.id);
    if (next && next.url !== nextVideo?.url) {
      setNextVideo(next);
      
      // Check if already in cache
      if (preloadedVideosCache.has(next.id)) {
        console.log('Next video already preloaded from cache:', next.title);
        setPreloadedVideoElement(preloadedVideosCache.get(next.id)!);
        return;
      }
      
      // Use requestIdleCallback to preload when browser is idle (non-blocking)
      const preloadFunction = () => {
        // Create a video element to preload the next video
        const video = document.createElement('video');
        video.src = next.url;
        video.preload = 'auto'; // Changed to auto for immediate loading
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        
        // Add to cache
        preloadedVideosCache.set(next.id, video);
        
        // Start loading immediately
        video.load();
        
        // Store the preloaded element
        setPreloadedVideoElement(video);
        
        console.log('Preloading next video:', next.title);
      };
      
      // Use requestIdleCallback if available, otherwise use setTimeout
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadFunction);
      } else {
        setTimeout(preloadFunction, 50); // Reduced delay
      }
    }
  };

  const fetchRandomVideo = async () => {
    // First shuffle - switch from background video to Yandex videos
    if (!hasShuffled) {
      setHasShuffled(true);
      
      // If videos are loaded, use them
      if (videos.length > 0) {
        const randomVideo = getRandomVideo(currentVideo?.id);
        if (randomVideo) {
          // Check if video is already preloaded
          if (preloadedVideosCache.has(randomVideo.id)) {
            console.log('Using preloaded video from cache:', randomVideo.title);
          }
          setCurrentVideo(randomVideo);
          setRecentVideoIds(prev => [...prev, randomVideo.id].slice(-15)); // Keep last 15
          console.log('First shuffle - switching to Yandex video:', randomVideo.title);
          console.log('Total videos available:', videos.length);
        }
        return;
      } else {
        // Videos still loading, set flag to auto-switch when ready
        console.log('Videos still loading, will switch automatically when ready...');
        setPendingVideoSwitch(true);
        // Start loading if not already
        if (!isLoadingVideos) {
          loadVideosInBackground();
        }
        return;
      }
    }
    
    // Subsequent shuffles - use better random selection
    const randomVideo = getRandomVideo(currentVideo?.id);
    if (randomVideo) {
      setCurrentVideo(randomVideo);
      setRecentVideoIds(prev => [...prev, randomVideo.id].slice(-15)); // Keep last 15
      console.log('Playing video:', randomVideo.title, 'from', videos.length, 'total videos');
      // Preload next video after a short delay
      setTimeout(() => {
        preloadNextVideo();
      }, 100);
    }
  };

  return {
    videos,
    currentVideo,
    nextVideo,
    isLoading,
    error,
    fetchRandomVideo,
    preloadedVideoElement
  };
};

export default useYandexVideos;