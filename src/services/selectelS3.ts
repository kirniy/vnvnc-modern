/**
 * Selectel S3 service for fetching photobooth images from the vnvnc bucket.
 *
 * The arcade machine uploads photos to:
 *   s3://vnvnc/artifact/photobooth/*.png
 *
 * Public URL base:
 *   https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru
 *
 * S3 XML listing endpoint:
 *   https://s3.ru-7.storage.selcloud.ru/vnvnc?list-type=2&prefix=artifact/photobooth/
 */

const S3_ENDPOINT = 'https://s3.ru-7.storage.selcloud.ru'
const BUCKET = 'vnvnc'
const PUBLIC_BASE = 'https://e6aaa51f-863a-439e-9b6e-69991ff0ad6e.selstorage.ru'
const PREFIX = 'artifact/photobooth/'

export interface PhotoboothPhoto {
  key: string
  url: string
  lastModified: string
  size: number
}

/**
 * List photobooth photos from Selectel S3.
 * Uses S3 XML ListObjectsV2 API (public bucket, no auth needed).
 */
export async function fetchPhotoboothPhotos(maxKeys = 200): Promise<PhotoboothPhoto[]> {
  try {
    const listUrl = `${S3_ENDPOINT}/${BUCKET}?list-type=2&prefix=${PREFIX}&max-keys=${maxKeys}`
    const response = await fetch(listUrl)

    if (!response.ok) {
      console.warn(`S3 listing failed: ${response.status}`)
      return []
    }

    const xml = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')

    const contents = doc.querySelectorAll('Contents')
    const photos: PhotoboothPhoto[] = []

    contents.forEach((item) => {
      const key = item.querySelector('Key')?.textContent || ''
      const lastModified = item.querySelector('LastModified')?.textContent || ''
      const size = parseInt(item.querySelector('Size')?.textContent || '0', 10)

      // Skip the prefix directory entry itself and tiny files
      if (!key || key === PREFIX || size < 1000) return

      // Only include image files
      if (!key.endsWith('.png') && !key.endsWith('.jpg') && !key.endsWith('.jpeg')) return

      photos.push({
        key,
        url: `${PUBLIC_BASE}/${key}`,
        lastModified,
        size,
      })
    })

    // Sort newest first
    photos.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())

    return photos
  } catch (error) {
    console.error('Failed to fetch photobooth photos:', error)
    return []
  }
}
