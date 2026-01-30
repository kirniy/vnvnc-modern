/**
 * Selectel S3 service for fetching photobooth images from the vnvnc bucket.
 *
 * The arcade machine uploads photos to:
 *   s3://vnvnc/artifact/photobooth/*.png
 *
 * Photos are listed via a Yandex Cloud Function (gateway-photobooth)
 * that signs S3 requests with credentials, since Selectel doesn't
 * support anonymous bucket listing.
 *
 * API endpoint:
 *   https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net/api/photobooth/list
 */

const API_GATEWAY = 'https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net'

export interface PhotoboothPhoto {
  key: string
  url: string
  lastModified: string
  size: number
}

/**
 * List photobooth photos via Yandex Cloud Function proxy.
 */
export async function fetchPhotoboothPhotos(maxKeys = 200): Promise<PhotoboothPhoto[]> {
  try {
    const response = await fetch(
      `${API_GATEWAY}/api/photobooth/list?maxKeys=${maxKeys}`
    )

    if (!response.ok) {
      console.warn(`Photobooth API failed: ${response.status}`)
      return []
    }

    const data = await response.json()
    return data.photos || []
  } catch (error) {
    console.error('Failed to fetch photobooth photos:', error)
    return []
  }
}
