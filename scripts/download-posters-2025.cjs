#!/usr/bin/env node
/**
 * Download VNVNC Event Posters from TicketsCloud API
 *
 * This script fetches all events from 2025 and downloads their poster images.
 * It uses rate limiting to avoid overloading the API.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const API_KEY = 'c862e40ed178486285938dda33038e30';
const API_GATEWAY = 'https://d5d621jmge79dusl8rkh.kf69zffa.apigw.yandexcloud.net';
const OUTPUT_DIR = '/Users/kirniy/Downloads/POSTERS/2025';
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second between API requests
const DELAY_BETWEEN_DOWNLOADS = 500; // 0.5 seconds between image downloads

// Helper to make HTTP/HTTPS requests
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`  Redirecting to: ${response.headers.location}`);
        return fetchUrl(response.headers.location).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });

    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Helper to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse event date from lifetime field
function parseEventDate(lifetime) {
  // Try DATE-TIME format first: DTSTART;VALUE=DATE-TIME:20250101T200000Z
  const dateTimeMatch = lifetime.match(/DTSTART;VALUE=DATE-TIME:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
  if (dateTimeMatch) {
    const [, year, month, day] = dateTimeMatch;
    return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  }

  // Try DATE format: DTSTART;VALUE=DATE:20250101
  const dateMatch = lifetime.match(/DTSTART;VALUE=DATE:(\d{4})(\d{2})(\d{2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  return null;
}

// Format date for filename
function formatDateForFilename(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Sanitize title for filename
function sanitizeTitle(title) {
  return title
    .replace(/[\/\\:*?"<>|]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_')          // Replace spaces with underscores
    .replace(/_+/g, '_')           // Remove duplicate underscores
    .substring(0, 80)              // Limit length
    .trim();
}

// Get file extension from URL or content type
function getExtension(url, contentType) {
  // Try to get from URL
  const urlExt = path.extname(new URL(url).pathname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(urlExt)) {
    return urlExt;
  }

  // Fallback to content type
  if (contentType) {
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
    if (contentType.includes('png')) return '.png';
    if (contentType.includes('webp')) return '.webp';
    if (contentType.includes('gif')) return '.gif';
  }

  return '.jpg'; // Default
}

// Download image to file
async function downloadImage(url, filepath) {
  try {
    const buffer = await fetchUrl(url);
    fs.writeFileSync(filepath, buffer);
    return true;
  } catch (error) {
    console.error(`  Failed to download: ${error.message}`);
    return false;
  }
}

// Fetch ALL events from API with pagination
async function fetchAllEvents(status) {
  const allEvents = [];
  let page = 1;
  const perPage = 100; // Request more per page
  let hasMore = true;

  console.log(`Fetching all ${status} events (with pagination)...`);

  while (hasMore) {
    const url = `${API_GATEWAY}/tc/v1/resources/events?status=${status}&page=${page}&per_page=${perPage}&key=${API_KEY}`;
    console.log(`  Page ${page}...`);

    try {
      const buffer = await fetchUrl(url);
      const text = buffer.toString('utf8');
      const data = JSON.parse(text);

      // API returns array or object with event data
      const events = Array.isArray(data) ? data : Object.values(data).filter(e => e && typeof e === 'object');

      if (events.length === 0) {
        hasMore = false;
        console.log(`  Page ${page}: No more events`);
      } else {
        allEvents.push(...events);
        console.log(`  Page ${page}: Found ${events.length} events (total: ${allEvents.length})`);

        // If we got less than requested, we've reached the end
        if (events.length < perPage) {
          hasMore = false;
        } else {
          page++;
          // Rate limiting between pages
          await delay(DELAY_BETWEEN_REQUESTS);
        }
      }
    } catch (error) {
      console.error(`  Failed to fetch page ${page}: ${error.message}`);
      hasMore = false;
    }
  }

  console.log(`  Total ${status} events: ${allEvents.length}`);
  return allEvents;
}

// Main function
async function main() {
  console.log('='.repeat(60));
  console.log('VNVNC Poster Downloader - 2025 Events');
  console.log('='.repeat(60));
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Fetch both active and finished events (with pagination)
  const activeEvents = await fetchAllEvents('active');
  await delay(DELAY_BETWEEN_REQUESTS);
  const finishedEvents = await fetchAllEvents('finished');

  // Combine all events
  const allEvents = [...activeEvents, ...finishedEvents];
  console.log(`\nTotal events fetched: ${allEvents.length}`);

  // Filter for 2025 events
  const events2025 = allEvents.filter(event => {
    if (!event.lifetime) return false;
    const date = parseEventDate(event.lifetime);
    if (!date) return false;
    return date.getFullYear() === 2025;
  });

  console.log(`Events in 2025: ${events2025.length}`);
  console.log('');

  // Sort by date
  events2025.sort((a, b) => {
    const dateA = parseEventDate(a.lifetime);
    const dateB = parseEventDate(b.lifetime);
    return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
  });

  // Download posters
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  console.log('Downloading posters...');
  console.log('-'.repeat(60));

  for (const event of events2025) {
    const title = event.title?.text || 'Untitled';
    const date = parseEventDate(event.lifetime);
    const dateStr = date ? formatDateForFilename(date) : 'unknown-date';

    // Get the best quality poster URL
    const posterUrl = event.media?.cover_original?.url ||
                      event.media?.cover?.url ||
                      event.media?.cover_small?.url;

    if (!posterUrl) {
      console.log(`[SKIP] ${dateStr} - ${title} (no poster)`);
      skipped++;
      continue;
    }

    // Create filename
    const sanitizedTitle = sanitizeTitle(title);
    const extension = getExtension(posterUrl);
    const filename = `${dateStr}_${sanitizedTitle}${extension}`;
    const filepath = path.join(OUTPUT_DIR, filename);

    // Check if already downloaded
    if (fs.existsSync(filepath)) {
      console.log(`[EXISTS] ${filename}`);
      skipped++;
      continue;
    }

    console.log(`[DOWNLOAD] ${filename}`);
    console.log(`  URL: ${posterUrl.substring(0, 80)}...`);

    const success = await downloadImage(posterUrl, filepath);
    if (success) {
      const stats = fs.statSync(filepath);
      console.log(`  Size: ${(stats.size / 1024).toFixed(1)} KB`);
      downloaded++;
    } else {
      failed++;
    }

    // Rate limiting
    await delay(DELAY_BETWEEN_DOWNLOADS);
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total 2025 events: ${events2025.length}`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped (no poster/exists): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  // List downloaded files
  console.log('');
  console.log('Downloaded files:');
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => !f.startsWith('.')).sort();
  files.forEach(f => console.log(`  ${f}`));
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
