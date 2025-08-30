export const config = {
  runtime: 'edge',
};

const eventDates = {
  '29-08-25': '8 ЛЕТ VNVNC | DAY_1 | 29 АВГУСТА',
  '30-08-25': '8 ЛЕТ VNVNC | DAY_2 | 30 АВГУСТА',
  '05-09-25': 'Концерт 5 сентября',
  // Add more event mappings as needed
};

export default function handler(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  
  const eventTitle = eventDates[date] || 'VNVNC Concert Hall';
  // Better description without duplicating the title
  const description = date 
    ? 'Конюшенная 2В, Санкт-Петербург • Билеты на сайте • 18+'
    : 'VNVNC Concert Hall, Конюшенная 2В - культовый клуб в центре Санкт-Петербурга';

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${eventTitle} | VNVNC</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="event">
    <meta property="og:url" content="https://vnvnc.ru/e/${date}">
    <meta property="og:title" content="${eventTitle}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://vnvnc.ru/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="VNVNC Concert Hall">
    <meta property="og:site_name" content="VNVNC Concert Hall">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${eventTitle}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="https://vnvnc.ru/og-image.jpg">
    
    <script>
      // Redirect to the actual React app after meta tags are loaded
      window.location.replace('/index.html#/e/${date}');
    </script>
</head>
<body>
    <p>Загрузка...</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  });
}