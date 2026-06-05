import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/search?q=&colors=red,blue&tags=warm&date_from=&date_to=&lat=&lon=&radius_km=&page=&limit=
router.get('/', (req, res) => {
  const {
    q = '',
    colors = '',
    tags = '',
    date_from = '',
    date_to = '',
    lat,
    lon,
    radius_km = 50,
    page = 1,
    limit: rawLimit = 50,
  } = req.query;

  const limit = Math.min(parseInt(rawLimit) || 50, 200);
  const offset = (Math.max(parseInt(page) || 1, 1) - 1) * limit;

  const conditions = [];
  const params = [];

  if (colors) {
    const colorList = colors.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
    if (colorList.length > 0) {
      conditions.push(`p.color_family IN (${colorList.map(() => '?').join(',')})`);
      params.push(...colorList);
    }
  }

  if (date_from) { conditions.push(`p.date_taken >= ?`); params.push(date_from); }
  if (date_to)   { conditions.push(`p.date_taken <= ?`); params.push(date_to + 'T23:59:59'); }

  // Bounding box pre-filter for location (Haversine done client-side for simplicity)
  if (lat && lon) {
    const latF = parseFloat(lat);
    const lonF = parseFloat(lon);
    const radKm = parseFloat(radius_km) || 50;
    const latDelta = radKm / 111;
    const lonDelta = radKm / (111 * Math.cos((latF * Math.PI) / 180));
    conditions.push(`p.latitude BETWEEN ? AND ? AND p.longitude BETWEEN ? AND ?`);
    params.push(latF - latDelta, latF + latDelta, lonF - lonDelta, lonF + lonDelta);
  }

  if (q) {
    const like = `%${q}%`;
    conditions.push(`(p.ai_description LIKE ? OR p.filename LIKE ? OR p.location_name LIKE ?)`);
    params.push(like, like, like);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Tag filter via HAVING on grouped tags
  let havingClause = '';
  const havingParams = [];
  if (tags) {
    const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    if (tagList.length > 0) {
      // Each tag must be present — AND semantics
      const tagConditions = tagList.map(() => `('||' || COALESCE(GROUP_CONCAT(t.name, '||'), '') || '||') LIKE ?`);
      havingClause = `HAVING ${tagConditions.join(' AND ')}`;
      havingParams.push(...tagList.map(t => `%||${t}||%`));
    }
  }

  const sql = `
    SELECT p.id, p.filename, p.thumbnail, p.size_bytes, p.width, p.height,
           p.date_taken, p.latitude, p.longitude, p.location_name,
           p.camera_make, p.camera_model,
           p.analysis_status, p.ai_description,
           p.dominant_colors, p.color_family,
           p.created_at,
           GROUP_CONCAT(t.name, '||') as tag_names
    FROM photos p
    LEFT JOIN photo_tags pt ON p.id = pt.photo_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    ${whereClause}
    GROUP BY p.id
    ${havingClause}
    ORDER BY COALESCE(p.date_taken, p.created_at) DESC
    LIMIT ? OFFSET ?
  `;

  try {
    const rows = db.prepare(sql).all(...params, ...havingParams, limit, offset);

    const photos = rows.map(row => {
      const photo = { ...row };
      if (photo.dominant_colors) photo.dominant_colors = JSON.parse(photo.dominant_colors);
      photo.tags = photo.tag_names ? photo.tag_names.split('||').map(n => ({ name: n })) : [];
      delete photo.tag_names;
      return photo;
    });

    res.json({ photos, page: parseInt(page), limit, total: photos.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search/tags — top tags for filter UI
router.get('/tags', (req, res) => {
  const rows = db.prepare(`SELECT name, use_count FROM tags ORDER BY use_count DESC LIMIT 50`).all();
  res.json(rows);
});

export default router;
