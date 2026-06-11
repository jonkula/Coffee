import { analyzeColors } from './colorAnalyzer.js';
import { analyzeWithClaude } from './claudeVision.js';
import { downloadBuffer } from './storageService.js';
import { stmts } from '../db.js';

const queue = [];
let processing = false;

export function enqueue(photoId) {
  queue.push(photoId);
  stmts.updateStatus.run('queued', photoId);
  if (!processing) processNext();
}

async function processNext() {
  if (queue.length === 0) { processing = false; return; }
  processing = true;
  const photoId = queue.shift();

  stmts.updateStatus.run('analyzing', photoId);

  try {
    const photo = stmts.getPhoto.get(photoId);
    if (!photo) { processNext(); return; }

    // Download thumbnail from R2 once — reuse buffer for both steps
    const thumbBuffer = await downloadBuffer(photo.thumbnail);

    // Step A: color analysis (local, fast)
    const { dominant_colors, color_family } = await analyzeColors(thumbBuffer);

    // Step B: Claude Haiku vision
    let ai_description = null, ai_textures = null, ai_mood = null;
    try {
      const result = await analyzeWithClaude(thumbBuffer);
      ai_description = result.description || null;
      ai_textures = JSON.stringify(result.textures || []);
      ai_mood = JSON.stringify(result.mood || []);

      // Insert AI tags
      for (const tag of (result.textures || [])) {
        const rows = stmts.upsertTag.all(tag.toLowerCase(), 'ai_texture');
        if (rows[0]) stmts.linkTag.run(photoId, rows[0].id, 'ai');
      }
      for (const tag of (result.mood || [])) {
        const rows = stmts.upsertTag.all(tag.toLowerCase(), 'ai_mood');
        if (rows[0]) stmts.linkTag.run(photoId, rows[0].id, 'ai');
      }
    } catch (claudeErr) {
      console.error(`Claude analysis failed for ${photoId}:`, claudeErr.message);
      // Continue without AI tags — color analysis still saved
    }

    stmts.updateAnalysis.run({
      id: photoId,
      analysis_status: 'done',
      analysis_error: null,
      ai_description,
      ai_textures,
      ai_mood,
      dominant_colors,
      color_family,
    });
  } catch (err) {
    console.error(`Analysis failed for ${photoId}:`, err.message);
    stmts.updateAnalysis.run({
      id: photoId,
      analysis_status: 'error',
      analysis_error: err.message,
      ai_description: null,
      ai_textures: null,
      ai_mood: null,
      dominant_colors: null,
      color_family: null,
    });
  }

  processNext();
}

// On server startup, re-enqueue any photos that were interrupted mid-analysis
export function recoverPending() {
  const pending = stmts.pendingPhotos.all();
  for (const { id } of pending) enqueue(id);
  if (pending.length > 0) {
    console.log(`Re-queued ${pending.length} pending photo(s) for analysis`);
  }
}
