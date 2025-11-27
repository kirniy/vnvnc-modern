export const config = {
  runtime: 'edge',
};

const OG_URL = 'https://vnvnc.ru/merch';
const OG_TITLE = 'VNVNC merch — limited drop 2025';
const OG_DESCRIPTION =
  'Лимитированные худи, футболки и аксессуары VNVNC. Забирайте в клубе по брони без онлайн-оплаты.';

const DEFAULT_IMAGE = {
  url: 'https://vnvnc.ru/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'VNVNC merch preview',
};

const MERCH_IMAGES = [
  {
    url: 'https://vnvnc.ru/merch/VNVNC-10.jpg',
    width: 3459,
    height: 5189,
    alt: 'VNVNC merch: t-shirt from 2025 drop',
  },
  {
    url: 'https://vnvnc.ru/merch/VNVNC-19.jpg',
    width: 3643,
    height: 5464,
    alt: 'VNVNC merch: blue hoodie close-up',
  },
  {
    url: 'https://vnvnc.ru/merch/VNVNC-88.jpg',
    width: 1000,
    height: 1500,
    alt: 'VNVNC merch: sticker pack and accessories',
  },
];

const escapeHtml = value =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderImageMeta = images =>
  images
    .filter(image => image?.url)
    .map(
      image => `
  <meta property="og:image" content="${escapeHtml(image.url)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(image.url)}" />
  ${image.width ? `<meta property="og:image:width" content="${escapeHtml(image.width)}" />` : ''}
  ${image.height ? `<meta property="og:image:height" content="${escapeHtml(image.height)}" />` : ''}
  ${image.alt ? `<meta property="og:image:alt" content="${escapeHtml(image.alt)}" />` : ''}`.trim(),
    )
    .join('\n');

export default function handler() {
  const images = MERCH_IMAGES.length > 0 ? MERCH_IMAGES : [DEFAULT_IMAGE];
  const primaryImage = images[0] || DEFAULT_IMAGE;

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(OG_TITLE)}</title>
  <meta name="description" content="${escapeHtml(OG_DESCRIPTION)}" />
  <link rel="canonical" href="${escapeHtml(OG_URL)}" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(OG_URL)}" />
  <meta property="og:title" content="${escapeHtml(OG_TITLE)}" />
  <meta property="og:description" content="${escapeHtml(OG_DESCRIPTION)}" />
  ${renderImageMeta(images)}
  <meta property="og:site_name" content="VNVNC Concert Hall" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(OG_TITLE)}" />
  <meta name="twitter:description" content="${escapeHtml(OG_DESCRIPTION)}" />
  <meta name="twitter:image" content="${escapeHtml(primaryImage?.url || '')}" />

  <script>
    if (typeof window !== 'undefined') {
      window.location.replace('${OG_URL}');
    }
  </script>
</head>
<body>
  <p>Перенаправляем...</p>
  <noscript>
    <meta http-equiv="refresh" content="0; url=${escapeHtml(OG_URL)}" />
    <p><a href="${escapeHtml(OG_URL)}">Перейти в раздел мерча</a></p>
  </noscript>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'public, max-age=300',
    },
  });
}
