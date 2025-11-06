export const config = {
  runtime: 'edge',
};

const DEFAULT_IMAGE = 'https://vnvnc.ru/og-image.jpg';
const DEFAULT_TITLE = 'VNVNC Concert Hall';
const DEFAULT_DESCRIPTION = 'Конюшенная 2В • Культовый клуб в центре Санкт-Петербурга • Здесь всегда атмосферно';

const API_BASE = process.env.TICKETSCLOUD_API_BASE?.replace(/\/$/, '') || 'https://ticketscloud.com';
const API_KEY = process.env.TICKETSCLOUD_API_KEY || 'c862e40ed178486285938dda33038e30';
const CACHE_TTL_MS = 60_000;

let cachedEvents = null;

const pad = value => value.toString().padStart(2, '0');

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const stripHtml = value =>
  value
    ? value
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/p>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : '';

const parseSlug = slug => {
  if (!slug) return null;
  const parts = slug.split('-');
  if (parts.length < 3) return null;

  const [dayStr, monthStr, yearStr, suffix] = parts;
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);

  if (
    Number.isNaN(day) ||
    Number.isNaN(month) ||
    Number.isNaN(year) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  const parsed = {
    day,
    month,
    year: year + 2000,
  };

  if (suffix) {
    if (/^\d{4}$/.test(suffix)) {
      parsed.timeDigits = suffix;
    } else {
      parsed.idFragment = suffix;
    }
  }

  return parsed;
};

const toMoscowDate = date => {
  if (!date) return null;
  return new Date(
    date.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }),
  );
};

const parseApiEvent = apiEvent => {
  let eventDate;
  let hasSpecificTime = false;

  const lifetime = apiEvent.lifetime || '';
  const dateTimeMatch = lifetime.match(/DTSTART;VALUE=DATE-TIME:(\d{8}T\d{6})Z/);
  const dateOnlyMatch = lifetime.match(/DTSTART;VALUE=DATE:(\d{8})/);

  if (dateTimeMatch) {
    const [_, match] = dateTimeMatch;
    const year = parseInt(match.slice(0, 4), 10);
    const month = parseInt(match.slice(4, 6), 10) - 1;
    const day = parseInt(match.slice(6, 8), 10);
    const hour = parseInt(match.slice(9, 11), 10);
    const minute = parseInt(match.slice(11, 13), 10);
    eventDate = new Date(Date.UTC(year, month, day, hour, minute));
    hasSpecificTime = true;
  } else if (dateOnlyMatch) {
    const [_, match] = dateOnlyMatch;
    const year = parseInt(match.slice(0, 4), 10);
    const month = parseInt(match.slice(4, 6), 10) - 1;
    const day = parseInt(match.slice(6, 8), 10);
    eventDate = new Date(year, month, day);
  }

  return {
    id: apiEvent.id,
    title: apiEvent?.title?.text || DEFAULT_TITLE,
    description: stripHtml(apiEvent?.title?.desc || ''),
    eventDate,
    hasSpecificTime,
    poster:
      apiEvent?.media?.cover_original?.url ||
      apiEvent?.media?.cover?.url ||
      apiEvent?.media?.cover_small?.url ||
      null,
    fallbackImage: apiEvent?.media?.cover_small?.url || null,
  };
};

const fetchEvents = async () => {
  if (cachedEvents && Date.now() - cachedEvents.timestamp < CACHE_TTL_MS) {
    return cachedEvents.data;
  }

  const response = await fetch(`${API_BASE}/v1/resources/events`, {
    headers: {
      Authorization: `key ${API_KEY}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`TicketsCloud returned ${response.status}`);
  }

  const json = await response.json();
  const events = Array.isArray(json)
    ? json
    : Object.values(json || {}).filter(item => item && typeof item === 'object');

  const parsed = events
    .map(parseApiEvent)
    .filter(event => event.eventDate instanceof Date && !Number.isNaN(event.eventDate.getTime()))
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  cachedEvents = {
    data: parsed,
    timestamp: Date.now(),
  };

  return parsed;
};

const findMatch = (events, slug) => {
  if (!slug) return null;

  const { day, month, year, timeDigits, idFragment } = slug;

  const candidates = events.filter(event => {
    const moscowDate = toMoscowDate(event.eventDate);
    return (
      moscowDate &&
      moscowDate.getDate() === day &&
      moscowDate.getMonth() + 1 === month &&
      moscowDate.getFullYear() === year
    );
  });

  if (candidates.length === 0) {
    return null;
  }

  if (timeDigits) {
    const match = candidates.find(event => {
      const moscowDate = toMoscowDate(event.eventDate);
      if (!moscowDate) return false;
      const hours = pad(moscowDate.getHours());
      const minutes = pad(moscowDate.getMinutes());
      return `${hours}${minutes}` === timeDigits;
    });
    if (match) return match;
  }

  if (idFragment) {
    const match = candidates.find(event => event.id?.startsWith(idFragment));
    if (match) return match;
  }

  return candidates[0];
};

const formatDescription = (event, slug) => {
  if (!event) return DEFAULT_DESCRIPTION;

  const description = event.description || DEFAULT_DESCRIPTION;
  const trimmed = description.slice(0, 180);

  if (event.eventDate) {
    const moscowDate = toMoscowDate(event.eventDate);
    const datePart = moscowDate
      ? `${pad(moscowDate.getDate())}.${pad(moscowDate.getMonth() + 1)}.${moscowDate.getFullYear()}`
      : null;
    const timePart =
      moscowDate && event.hasSpecificTime
        ? `${pad(moscowDate.getHours())}:${pad(moscowDate.getMinutes())}`
        : null;
    const when = [datePart, timePart].filter(Boolean).join(' • ');
    if (when) {
      return `${when} • ${trimmed}`.slice(0, 200);
    }
  }

  return trimmed;
};

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const slugRaw = searchParams.get('date');
  const redirectTarget = slugRaw ? `/e/${slugRaw}` : '/events';

  let ogTitle = DEFAULT_TITLE;
  let ogDescription = DEFAULT_DESCRIPTION;
  let ogImage = DEFAULT_IMAGE;

  try {
    const parsedSlug = parseSlug(slugRaw);

    if (parsedSlug) {
      const events = await fetchEvents();
      const match = findMatch(events, parsedSlug);

      if (match) {
        ogTitle = match.title || DEFAULT_TITLE;
        ogImage = match.poster || match.fallbackImage || DEFAULT_IMAGE;
        ogDescription = formatDescription(match, parsedSlug);
      }
    }
  } catch (error) {
    console.error('OG generator error:', error);
  }

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(ogTitle)} | VNVNC</title>
  <meta name="description" content="${escapeHtml(ogDescription)}" />

  <meta property="og:type" content="event" />
  <meta property="og:url" content="https://vnvnc.ru${escapeHtml(redirectTarget)}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDescription)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(ogTitle)}" />
  <meta property="og:site_name" content="VNVNC Concert Hall" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />

  <script>
    if (typeof window !== 'undefined') {
      window.location.replace('${redirectTarget}');
    }
  </script>
</head>
<body>
  <p>Перенаправляем...</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'public, max-age=300',
    },
  });
}
