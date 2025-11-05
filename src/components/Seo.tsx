import { Helmet } from 'react-helmet-async'

type JsonLdInput = Record<string, unknown> | Array<Record<string, unknown>>

interface SeoProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: string
  keywords?: string[]
  noindex?: boolean
  locale?: string
  jsonLd?: JsonLdInput
  additionalMeta?: Array<{ name?: string; property?: string; content: string }>
}

const DEFAULT_IMAGE = 'https://vnvnc.ru/og-image.jpg'
const DEFAULT_LOCALE = 'ru_RU'

/**
 * Centralised SEO helper that wires up meta tags, OpenGraph data, and optional JSON-LD.
 * Keeps individual pages focused on content while ensuring consistent metadata output.
 */
export const Seo = ({
  title,
  description,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  keywords,
  noindex = false,
  locale = DEFAULT_LOCALE,
  jsonLd,
  additionalMeta = [],
}: SeoProps) => {
  const keywordsContent = keywords?.filter(Boolean).join(', ')

  const renderJsonLd = () => {
    if (!jsonLd) return null

    const payload = Array.isArray(jsonLd) ? jsonLd : [jsonLd]

    return payload.map((node, index) => (
      <script
        // eslint-disable-next-line react/no-array-index-key
        key={`jsonld-${index}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
      />
    ))
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywordsContent && <meta name="keywords" content={keywordsContent} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="VNVNC Concert Hall" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {canonical && (
        <>
          <link rel="canonical" href={canonical} />
          <meta property="og:url" content={canonical} />
          <meta name="twitter:url" content={canonical} />
        </>
      )}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {additionalMeta.map(meta => (
        <meta key={`${meta.name || meta.property}-${meta.content}`} {...meta} />
      ))}
      {renderJsonLd()}
    </Helmet>
  )
}

export default Seo
