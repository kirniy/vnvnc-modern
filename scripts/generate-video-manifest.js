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
  
  // We should always generate manifest in public so it gets copied to dist by Vite,
  // AND if dist exists (during build), update it there too.
  
  // 1. Update public manifest
  const publicFiles = listMp4Files(publicDir);
  if (publicFiles.length > 0) {
    const publicManifestPath = path.join(publicDir, 'manifest.json');
    const json = JSON.stringify(publicFiles, null, 0);
    fs.writeFileSync(publicManifestPath, json + '\n');
    console.log(`Generated public manifest with ${publicFiles.length} files at ${publicManifestPath}`);
  }

  // 2. Update dist manifest if dist exists
  if (fs.existsSync(distDir)) {
    const distFiles = listMp4Files(distDir);
    const distManifestPath = path.join(distDir, 'manifest.json');
    const json = JSON.stringify(distFiles, null, 0);
    fs.writeFileSync(distManifestPath, json + '\n');
    console.log(`Generated dist manifest with ${distFiles.length} files at ${distManifestPath}`);
  }
}

try {
  main();
} catch (err) {
  console.error('Failed to generate video manifest:', err);
  process.exit(1);
}


