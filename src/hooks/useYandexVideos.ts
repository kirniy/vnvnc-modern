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
    
    // Load Yandex videos in background after a short delay
    setTimeout(() => {
      loadVideosInBackground();
    }, 500);
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
    try {
      // Don't show loading state since we already have a video playing
      setError(null);
      
      console.log('Loading Yandex videos in background...');
      const fetchedVideos = await yandexVideoService.fetchVideos();
      console.log('Fetched videos in background:', fetchedVideos);
      setVideos(fetchedVideos);
      
      // Preload the first Yandex video so it's ready when user clicks shuffle
      if (fetchedVideos.length > 0) {
        const firstYandexVideo = fetchedVideos[0];
        const video = document.createElement('video');
        video.src = firstYandexVideo.url;
        video.preload = 'auto';
        video.muted = true;
        video.load();
        console.log('Preloading first Yandex video:', firstYandexVideo.title);
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
      
      // Use requestIdleCallback to preload when browser is idle (non-blocking)
      const preloadFunction = () => {
        // Create a video element to preload the next video
        const video = document.createElement('video');
        video.src = next.url;
        video.preload = 'metadata'; // Start with metadata only
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        
        // Gradually upgrade preload level
        video.addEventListener('loadedmetadata', () => {
          video.preload = 'auto'; // Now load the full video
        });
        
        // Store the preloaded element
        setPreloadedVideoElement(video);
        
        console.log('Preloading next video in background:', next.title);
      };
      
      // Use requestIdleCallback if available, otherwise use setTimeout
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadFunction);
      } else {
        setTimeout(preloadFunction, 100);
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
          setCurrentVideo(randomVideo);
          setRecentVideoIds(prev => [...prev, randomVideo.id].slice(-15)); // Keep last 15
          console.log('First shuffle - switching to Yandex video:', randomVideo.title);
          console.log('Total videos available:', videos.length);
        }
        return;
      } else {
        // Videos still loading, wait for them
        console.log('Videos still loading, waiting...');
        // Try to load videos if not already loading
        await loadVideosInBackground();
        if (videos.length > 0) {
          const randomVideo = getRandomVideo(currentVideo?.id);
          if (randomVideo) {
            setCurrentVideo(randomVideo);
            setRecentVideoIds(prev => [...prev, randomVideo.id].slice(-15));
          }
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