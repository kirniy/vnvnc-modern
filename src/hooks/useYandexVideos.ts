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

  // Initialize with background video immediately
  useEffect(() => {
    // Set the background video as initial video (same as hero background)
    const backgroundVideo: YandexVideo = {
      id: 'background-hero',
      url: '/herovideo.mp4', // Same as background video in ModernHero
      title: 'VNVNC',
      name: 'herovideo.mp4',
      path: '/herovideo.mp4',
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
      
      // Smart progressive preloading - start with 2, then load more
      if (fetchedVideos.length > 0) {
        // PHASE 1: Load just 2 videos immediately for instant playback
        const firstBatch = fetchedVideos.slice(0, 2);
        
        firstBatch.forEach((videoData, index) => {
          const video = document.createElement('video');
          video.src = videoData.url;
          video.preload = 'auto';
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          
          // Add to cache
          preloadedVideosCache.set(videoData.id, video);
          
          // Load immediately
          video.load();
          console.log(`Priority preload ${index + 1}:`, videoData.title);
          
          video.addEventListener('canplaythrough', () => {
            console.log(`Video ${index + 1} ready:`, videoData.title);
          }, { once: true });
        });
        
        // PHASE 2: After 1 second, load 2 more videos
        setTimeout(() => {
          const secondBatch = fetchedVideos.slice(2, 4);
          secondBatch.forEach((videoData) => {
            const video = document.createElement('video');
            video.src = videoData.url;
            video.preload = 'auto';
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            
            preloadedVideosCache.set(videoData.id, video);
            video.load();
            console.log('Background preload:', videoData.title);
          });
        }, 1000);
        
        // PHASE 3: After 3 seconds, preload 2 more (total 6)
        setTimeout(() => {
          const thirdBatch = fetchedVideos.slice(4, 6);
          thirdBatch.forEach((videoData) => {
            if (!preloadedVideosCache.has(videoData.id)) {
              const video = document.createElement('video');
              video.src = videoData.url;
              video.preload = 'metadata'; // Less aggressive for later videos
              video.muted = true;
              video.loop = true;
              video.playsInline = true;
              
              preloadedVideosCache.set(videoData.id, video);
              console.log('Lazy preload:', videoData.title);
            }
          });
        }, 3000);
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
        // Videos still loading, just wait - don't reload
        console.log('Videos still loading, please wait...');
        // Don't call loadVideosInBackground again, it's already running
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