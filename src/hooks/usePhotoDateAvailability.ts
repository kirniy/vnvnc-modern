import { useYandexDates } from './useYandexPhotos'

/**
 * Hook to check if photos are available for specific dates
 * Returns a set of dates that have photos available
 */
export const usePhotoDateAvailability = () => {
  const { data: allDates = [], isLoading, isError } = useYandexDates()

  // Convert array to Set for O(1) lookup
  const availableDates = new Set(allDates)

  return {
    availableDates,
    isLoading,
    isError,
    hasPhotosForDate: (date: string) => availableDates.has(date)
  }
}

/**
 * Hook to check if photos exist for a specific date
 * Useful for individual event cards
 */
export const useHasPhotosForDate = (date: string | undefined) => {
  const { availableDates, isLoading } = usePhotoDateAvailability()

  if (!date) return { hasPhotos: false, isLoading: false }

  return {
    hasPhotos: availableDates.has(date),
    isLoading
  }
}