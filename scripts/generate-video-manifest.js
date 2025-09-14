#!/usr/bin/env node

// Generate dist/videocircles/manifest.json with the list of MP4 files (ESM)
// This ensures the runtime can load all available videos from Selectel/CDN

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function listMp4Files(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => name.toLowerCase().endsWith('.mp4'))
    .filter((name) => name.toLowerCase() !== 'video.mp4')
    .sort();
}

function main() {
  const distDir = path.resolve(__dirname, '../dist/videocircles');
  const publicDir = path.resolve(__dirname, '../public/videocircles');
  const destDir = distDir;

  // Prefer scanning the built output (dist), fallback to public
  let sourceDir = distDir;
  if (!fs.existsSync(sourceDir)) {
    sourceDir = publicDir;
  }

  const files = listMp4Files(sourceDir);
  ensureDirExists(destDir);

  const manifestPath = path.join(destDir, 'manifest.json');
  const json = JSON.stringify(files, null, 0);
  fs.writeFileSync(manifestPath, json + '\n');

  console.log(`Generated manifest with ${files.length} files at ${manifestPath}`);
}

try {
  main();
} catch (err) {
  console.error('Failed to generate video manifest:', err);
  process.exit(1);
}


