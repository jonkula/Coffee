import { Trash2 } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

export function PhotoCard({ photo, onClick, onDelete }) {
  const date = photo.date_taken
    ? new Date(photo.date_taken).toLocaleDateString()
    : new Date(photo.created_at).toLocaleDateString();

  return (
    <div className="photo-card" onClick={onClick}>
      <div className="photo-card__img-wrap">
        <img
          src={photo.thumbnail_url || `/thumbnails/${photo.id}_thumb.jpg`}
          alt={photo.filename}
          loading="lazy"
          className="photo-card__img"
        />
        {photo.analysis_status !== 'done' && (
          <div className="photo-card__badge">
            <StatusBadge status={photo.analysis_status} />
          </div>
        )}
        <button
          className="photo-card__delete"
          onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="photo-card__meta">
        <span className="photo-card__date">{date}</span>
        {photo.dominant_colors && photo.dominant_colors.length > 0 && (
          <div className="photo-card__colors">
            {photo.dominant_colors.slice(0, 4).map((c, i) => (
              <span key={i} className="photo-card__color-dot" style={{ background: c.hex }} title={c.family} />
            ))}
          </div>
        )}
      </div>
      {photo.tags && photo.tags.length > 0 && (
        <div className="photo-card__tags">
          {photo.tags.slice(0, 3).map((t) => (
            <span key={t.name || t} className="photo-card__tag">{t.name || t}</span>
          ))}
          {photo.tags.length > 3 && <span className="photo-card__tag photo-card__tag--more">+{photo.tags.length - 3}</span>}
        </div>
      )}
    </div>
  );
}
