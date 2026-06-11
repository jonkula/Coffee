#!/usr/bin/env node
/**
 * Bulk import CLI — scans a directory and imports all photos to R2 + SQLite.
 *
 * Usage:
 *   node import.js /Volumes/MyDrive/Photos [options]
 *
 * Options:
 *   --dry-run          Preview what would be imported, no changes made
 *   --skip-ai          Import without Claude AI tagging (colors + EXIF only)
 *   --folder-as-tag    Tag each photo with its immediate parent folder name
 *   --batch N          Pause N ms between AI analysis jobs (default: 500)
 *   --delete-source    Delete source file after successful R2 upload
 */

import 'dotenv/config';
import { readdirSync, statSync, readFileSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { extractExif } from './services/exifExtractor.js';
import { analyzeColors } from './services/colorAnalyzer.js';
import { analyzeWithClaude } from './services/claudeVision.js';
import { uploadBuffer, deleteObject } from './services/storageService.js';
import db, { stmts } from './db.js';

const checkDuplicate = db.prepare('SELECT 1 FROM photos WHERE filename = ? AND size_bytes = ?');

const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.heic', '.heif']);
const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png',  '.webp': 'image/webp',
  '.tiff': 'image/tiff', '.tif': 'image/tiff',
  '.heic': 'image/heic', '.heif': 'image/heif',
};

// Parse CLI args
const args = process.argv.slice(2);
const sourceDir = args.find(a => !a.startsWith('--'));
const DRY_RUN      = args.includes('--dry-run');
const SKIP_AI      = args.includes('--skip-ai');
const FOLDER_TAG   = args.includes('--folder-as-tag');
const DELETE_SRC   = args.includes('--delete-source');
const BATCH_DELAY  = parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1] || '500');

if (!sourceDir) {
  console.error('Usage: node import.js <directory> [--dry-run] [--skip-ai] [--folder-as-tag] [--batch=500] [--delete-source]');
  process.exit(1);
}

// Recursively collect image files
function collectImages(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(full));
    } else if (entry.isFile() && SUPPORTED_EXTS.has(extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

function isAlreadyImported(filename, sizeBytes) {
  return !!checkDuplicate.get(filename, sizeBytes);
}

async function importPhoto(filePath, index, total) {
  const filename  = basename(filePath);
  const ext       = extname(filename).toLowerCase();
  const mimetype  = MIME[ext] || 'image/jpeg';
  const stat      = statSync(filePath);
  const sizeBytes = stat.size;
  const folderName = basename(dirname(filePath));

  const prefix = `[${index + 1}/${total}]`;

  // Skip already-imported files
  if (isAlreadyImported(filename, sizeBytes)) {
    console.log(`${prefix} SKIP (already imported) ${filename}`);
    return;
  }

  if (DRY_RUN) {
    console.log(`${prefix} DRY-RUN ${filename} (${(sizeBytes / 1024 / 1024).toFixed(1)} MB)${FOLDER_TAG ? ` [tag: ${folderName}]` : ''}`);
    return;
  }

  console.log(`${prefix} Importing ${filename}...`);

  const id       = uuidv4();
  const origKey  = `originals/${id}${ext}`;
  const thumbKey = `thumbnails/${id}_thumb.jpg`;

  try {
    const buffer = readFileSync(filePath);

    // Generate thumbnail
    const thumbBuffer = await sharp(buffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const meta = await sharp(buffer).metadata();

    // Upload to R2
    process.stdout.write(`  → Uploading to R2... `);
    await Promise.all([
      uploadBuffer(origKey,  buffer,      mimetype),
      uploadBuffer(thumbKey, thumbBuffer, 'image/jpeg'),
    ]);
    process.stdout.write('done\n');

    // Extract EXIF
    const exif = await extractExif(buffer);

    // Color analysis
    process.stdout.write(`  → Analyzing colors... `);
    const { dominant_colors, color_family } = await analyzeColors(thumbBuffer);
    process.stdout.write('done\n');

    // Insert into DB (status pending if AI enabled, done if skip-ai)
    stmts.insertPhoto.run({
      id,
      filename,
      filepath:     origKey,
      thumbnail:    thumbKey,
      size_bytes:   sizeBytes,
      width:        meta.width  || null,
      height:       meta.height || null,
      mimetype,
      date_taken:   exif.date_taken   || null,
      latitude:     exif.latitude     || null,
      longitude:    exif.longitude    || null,
      camera_make:  exif.camera_make  || null,
      camera_model: exif.camera_model || null,
    });

    // Save color data immediately
    stmts.updateAnalysis.run({
      id,
      analysis_status: SKIP_AI ? 'done' : 'pending',
      analysis_error:  null,
      ai_description:  null,
      ai_textures:     null,
      ai_mood:         null,
      dominant_colors,
      color_family,
    });

    // Add folder as tag if requested
    if (FOLDER_TAG && folderName && folderName !== basename(sourceDir)) {
      const tagName = folderName.toLowerCase().replace(/[^a-z0-9 _-]/g, ' ').trim();
      if (tagName) {
        const rows = stmts.upsertTag.all(tagName, 'user');
        if (rows[0]) stmts.linkTag.run(id, rows[0].id, 'user');
      }
    }

    // Claude AI analysis
    if (!SKIP_AI) {
      process.stdout.write(`  → AI tagging (Claude Haiku)... `);
      try {
        const result = await analyzeWithClaude(thumbBuffer);
        const ai_textures = JSON.stringify(result.textures || []);
        const ai_mood     = JSON.stringify(result.mood     || []);

        for (const tag of (result.textures || [])) {
          const rows = stmts.upsertTag.all(tag.toLowerCase(), 'ai_texture');
          if (rows[0]) stmts.linkTag.run(id, rows[0].id, 'ai');
        }
        for (const tag of (result.mood || [])) {
          const rows = stmts.upsertTag.all(tag.toLowerCase(), 'ai_mood');
          if (rows[0]) stmts.linkTag.run(id, rows[0].id, 'ai');
        }

        stmts.updateAnalysis.run({
          id, analysis_status: 'done', analysis_error: null,
          ai_description: result.description || null,
          ai_textures, ai_mood, dominant_colors, color_family,
        });
        process.stdout.write('done\n');

        if (BATCH_DELAY > 0) await new Promise(r => setTimeout(r, BATCH_DELAY));
      } catch (err) {
        process.stdout.write(`failed (${err.message})\n`);
        stmts.updateAnalysis.run({
          id, analysis_status: 'error', analysis_error: err.message,
          ai_description: null, ai_textures: null, ai_mood: null,
          dominant_colors, color_family,
        });
      }
    }

    // Optionally delete source file after successful upload
    if (DELETE_SRC) {
      const { unlinkSync } = await import('fs');
      unlinkSync(filePath);
      console.log(`  → Deleted source file`);
    }

    console.log(`  ✓ Done`);
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
    deleteObject(origKey).catch(() => {});
    deleteObject(thumbKey).catch(() => {});
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`\nPhoto Import Tool`);
console.log(`Source: ${sourceDir}`);
if (DRY_RUN)    console.log('Mode:   DRY RUN (no changes will be made)');
if (SKIP_AI)    console.log('AI:     Skipped');
if (FOLDER_TAG) console.log('Tags:   Using folder names as tags');
if (DELETE_SRC) console.log('Source: Files will be deleted after upload');
console.log('');

let files;
try {
  files = collectImages(sourceDir);
} catch (err) {
  console.error(`Cannot read directory: ${err.message}`);
  process.exit(1);
}

if (files.length === 0) {
  console.log('No supported image files found.');
  process.exit(0);
}

console.log(`Found ${files.length} image(s)\n`);

for (let i = 0; i < files.length; i++) {
  await importPhoto(files[i], i, files.length);
}

console.log(`\nImport complete.`);
