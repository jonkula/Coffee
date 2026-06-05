import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'photo_repo.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS photos (
    id              TEXT PRIMARY KEY,
    filename        TEXT NOT NULL,
    filepath        TEXT NOT NULL,
    thumbnail       TEXT NOT NULL,
    size_bytes      INTEGER NOT NULL,
    width           INTEGER,
    height          INTEGER,
    mimetype        TEXT NOT NULL,
    date_taken      TEXT,
    latitude        REAL,
    longitude       REAL,
    location_name   TEXT,
    camera_make     TEXT,
    camera_model    TEXT,
    analysis_status TEXT NOT NULL DEFAULT 'pending',
    analysis_error  TEXT,
    ai_description  TEXT,
    ai_textures     TEXT,
    ai_mood         TEXT,
    dominant_colors TEXT,
    color_family    TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_photos_date_taken   ON photos(date_taken);
  CREATE INDEX IF NOT EXISTS idx_photos_color_family ON photos(color_family);
  CREATE INDEX IF NOT EXISTS idx_photos_status       ON photos(analysis_status);
  CREATE INDEX IF NOT EXISTS idx_photos_lat_lon      ON photos(latitude, longitude);

  CREATE TABLE IF NOT EXISTS tags (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL UNIQUE,
    source    TEXT NOT NULL DEFAULT 'user',
    use_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS photo_tags (
    photo_id TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    tag_id   INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    source   TEXT NOT NULL DEFAULT 'user',
    PRIMARY KEY (photo_id, tag_id)
  );

  CREATE INDEX IF NOT EXISTS idx_photo_tags_photo ON photo_tags(photo_id);
  CREATE INDEX IF NOT EXISTS idx_photo_tags_tag   ON photo_tags(tag_id);
`);

export const stmts = {
  insertPhoto: db.prepare(`
    INSERT INTO photos (id, filename, filepath, thumbnail, size_bytes, width, height, mimetype,
      date_taken, latitude, longitude, camera_make, camera_model)
    VALUES (@id, @filename, @filepath, @thumbnail, @size_bytes, @width, @height, @mimetype,
      @date_taken, @latitude, @longitude, @camera_make, @camera_model)
  `),

  getPhoto: db.prepare(`
    SELECT p.*, GROUP_CONCAT(t.name, '||') as tag_names, GROUP_CONCAT(t.id, '||') as tag_ids,
           GROUP_CONCAT(pt.source, '||') as tag_sources
    FROM photos p
    LEFT JOIN photo_tags pt ON p.id = pt.photo_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = ?
    GROUP BY p.id
  `),

  listPhotos: db.prepare(`
    SELECT p.*, GROUP_CONCAT(t.name, '||') as tag_names
    FROM photos p
    LEFT JOIN photo_tags pt ON p.id = pt.photo_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    GROUP BY p.id
    ORDER BY COALESCE(p.date_taken, p.created_at) DESC
    LIMIT ? OFFSET ?
  `),

  deletePhoto: db.prepare(`DELETE FROM photos WHERE id = ?`),

  updateAnalysis: db.prepare(`
    UPDATE photos SET
      analysis_status = @analysis_status,
      analysis_error  = @analysis_error,
      ai_description  = @ai_description,
      ai_textures     = @ai_textures,
      ai_mood         = @ai_mood,
      dominant_colors = @dominant_colors,
      color_family    = @color_family,
      updated_at      = datetime('now')
    WHERE id = @id
  `),

  updateStatus: db.prepare(`
    UPDATE photos SET analysis_status = ?, updated_at = datetime('now') WHERE id = ?
  `),

  upsertTag: db.prepare(`
    INSERT INTO tags (name, source, use_count) VALUES (?, ?, 1)
    ON CONFLICT(name) DO UPDATE SET use_count = use_count + 1
    RETURNING id
  `),

  linkTag: db.prepare(`
    INSERT OR IGNORE INTO photo_tags (photo_id, tag_id, source) VALUES (?, ?, ?)
  `),

  unlinkTag: db.prepare(`DELETE FROM photo_tags WHERE photo_id = ? AND tag_id = ?`),

  getTagByName: db.prepare(`SELECT id FROM tags WHERE name = ?`),

  decrementTag: db.prepare(`UPDATE tags SET use_count = MAX(0, use_count - 1) WHERE id = ?`),

  getPhotoStatus: db.prepare(`SELECT analysis_status, analysis_error FROM photos WHERE id = ?`),

  pendingPhotos: db.prepare(`SELECT id FROM photos WHERE analysis_status = 'pending'`),

  topTags: db.prepare(`SELECT name, use_count FROM tags ORDER BY use_count DESC LIMIT 50`),
};

export default db;
