import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { extractExif } from '../services/exifExtractor.js';
import { uploadBuffer, deleteObject, publicUrl } from '../services/storageService.js';
import { enqueue } from '../services/analysisQueue.js';
import { stmts } from '../db.js';

// Memory storage — files are uploaded to R2, not saved to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/heic', 'image/heif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

function parsePhoto(row) {
  if (!row) return null;
  const photo = { ...row };
  if (photo.dominant_colors) photo.dominant_colors = JSON.parse(photo.dominant_colors);
  if (photo.ai_textures)     photo.ai_textures     = JSON.parse(photo.ai_textures);
  if (photo.ai_mood)         photo.ai_mood         = JSON.parse(photo.ai_mood);

  // Compute public R2 URLs from stored keys
  photo.photo_url     = publicUrl(photo.filepath);
  photo.thumbnail_url = publicUrl(photo.thumbnail);

  photo.tags = [];
  if (photo.tag_names) {
    const names   = photo.tag_names.split('||');
    const ids     = photo.tag_ids     ? photo.tag_ids.split('||')     : [];
    const sources = photo.tag_sources ? photo.tag_sources.split('||') : [];
    photo.tags = names.map((name, i) => ({ id: parseInt(ids[i]), name, source: sources[i] }));
  }
  delete photo.tag_names;
  delete photo.tag_ids;
  delete photo.tag_sources;
  return photo;
}

const router = Router();

// POST /api/photos/upload
router.post('/upload', upload.single('photo'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No valid image file provided' });

  const id        = uuidv4();
  const ext       = extname(file.originalname).toLowerCase() || '.jpg';
  const origKey   = `originals/${id}${ext}`;
  const thumbKey  = `thumbnails/${id}_thumb.jpg`;

  try {
    const thumbBuffer = await sharp(file.buffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const meta = await sharp(file.buffer).metadata();

    await Promise.all([
      uploadBuffer(origKey,  file.buffer,  file.mimetype),
      uploadBuffer(thumbKey, thumbBuffer, 'image/jpeg'),
    ]);

    const exif = await extractExif(file.buffer);

    stmts.insertPhoto.run({
      id,
      filename:     file.originalname,
      filepath:     origKey,
      thumbnail:    thumbKey,
      size_bytes:   file.size,
      width:        meta.width  || null,
      height:       meta.height || null,
      mimetype:     file.mimetype,
      date_taken:   exif.date_taken   || null,
      latitude:     exif.latitude     || null,
      longitude:    exif.longitude    || null,
      camera_make:  exif.camera_make  || null,
      camera_model: exif.camera_model || null,
    });

    enqueue(id);

    res.status(201).json({ id, filename: file.originalname, thumbnail_url: publicUrl(thumbKey), status: 'queued' });
  } catch (err) {
    deleteObject(origKey).catch(() => {});
    deleteObject(thumbKey).catch(() => {});
    res.status(500).json({ error: err.message });
  }
});

// GET /api/photos
router.get('/', (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 50,  200);
  const offset = parseInt(req.query.offset) || 0;
  res.json(stmts.listPhotos.all(limit, offset).map(parsePhoto));
});

// GET /api/photos/:id
router.get('/:id', (req, res) => {
  const row = stmts.getPhoto.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(parsePhoto(row));
});

// GET /api/photos/:id/status
router.get('/:id/status', (req, res) => {
  const row = stmts.getPhotoStatus.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// DELETE /api/photos/:id
router.delete('/:id', (req, res) => {
  const row = stmts.getPhoto.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  stmts.deletePhoto.run(req.params.id);
  deleteObject(row.filepath).catch(() => {});
  deleteObject(row.thumbnail).catch(() => {});
  res.json({ deleted: true });
});

// POST /api/photos/:id/tags
router.post('/:id/tags', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Tag name required' });
  const tagName = name.trim().toLowerCase();
  const rows    = stmts.upsertTag.all(tagName, 'user');
  const tagId   = rows[0]?.id;
  if (!tagId) return res.status(500).json({ error: 'Failed to create tag' });
  stmts.linkTag.run(req.params.id, tagId, 'user');
  res.json({ id: tagId, name: tagName });
});

// DELETE /api/photos/:id/tags/:tagId
router.delete('/:id/tags/:tagId', (req, res) => {
  stmts.unlinkTag.run(req.params.id, parseInt(req.params.tagId));
  stmts.decrementTag.run(parseInt(req.params.tagId));
  res.json({ deleted: true });
});

export default router;
