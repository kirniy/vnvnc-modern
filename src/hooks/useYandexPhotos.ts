// React Query hook for fetching Yandex Disk photos
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import yandexDiskService from '../services/yandexDisk';
import type { PhotoFilters } from '../services/yandexDisk';

// Regular query for fetching photos with filters
export function useYandexPhotos(filters: PhotoFilters = {}) {
  return useQuery({
    queryKey: ['yandexPhotos', filters],
    queryFn: () => yandexDiskService.fetchPhotos(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Infinite query for pagination
export function useInfiniteYandexPhotos(category: string = 'all', limit: number = 20, date?: string) {
  return useInfiniteQuery({
    queryKey: ['yandexPhotosInfinite', category, limit, date],
    queryFn: ({ pageParam = 0 }) => 
      yandexDiskService.fetchPhotos({
        category,
        limit,
        offset: pageParam,
        date
      }),
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.total ? nextOffset : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for getting a single photo's download URL
export function usePhotoDownloadUrl(path: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['photoDownloadUrl', path],
    queryFn: () => yandexDiskService.getDownloadUrl(path),
    enabled: enabled && !!path,
    staleTime: 30 * 60 * 1000, // 30 minutes - download URLs are typically valid longer
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Hook for fetching all photos (useful for initial load)
export function useAllYandexPhotos(category: string = 'all') {
  return useQuery({
    queryKey: ['allYandexPhotos', category],
    queryFn: () => yandexDiskService.fetchAllPhotos(category),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 1,
  });
}

// Hook for fetching all available dates
export function useYandexDates() {
  return useQuery({
    queryKey: ['yandexDates'],
    queryFn: () => yandexDiskService.fetchAllDates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 2,
  });
}

// Transform photos to gallery format
export function useTransformedPhotos(filters: PhotoFilters = {}) {
  const { data, ...queryResult } = useYandexPhotos(filters);
  
  const transformedPhotos = data ? 
    yandexDiskService.transformToGalleryFormat(data.photos) : 
    [];
  
  return {
    ...queryResult,
    data: transformedPhotos,
    total: data?.total || 0
  };
}

// Helper to merge local fallback photos with Yandex photos
export function useMergedPhotos(
  localPhotos: Array<{ id: number; src: string; title: string; category: string }>,
  filters: PhotoFilters = {}
) {
  const { data: yandexData, isLoading, isError } = useYandexPhotos(filters);
  
  // If Yandex photos are loading or errored, use local photos
  if (isLoading || isError || !yandexData?.photos.length) {
    return {
      photos: localPhotos,
      isUsingFallback: true,
      isLoading,
      isError
    };
  }
  
  // Transform Yandex photos to match local format
  const transformedYandexPhotos = yandexData.photos.map((photo, index) => ({
    id: photo.id || index,
    src: photo.src,
    title: photo.title,
    category: photo.category
  }));
  
  return {
    photos: transformedYandexPhotos,
    isUsingFallback: false,
    isLoading,
    isError
  };
}