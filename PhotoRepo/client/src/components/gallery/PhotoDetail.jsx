import { X, Download, MapPin, Camera, Calendar } from 'lucide-react';
import { TagEditor } from '../tags/TagEditor';

export function PhotoDetail({ photo, onClose, onChange }) {
  if (!photo) return null;

  const dateTaken = photo.date_taken
    ? new Date(photo.date_taken).toLocaleString()
    : null;

  const mapsUrl = photo.latitude && photo.longitude
    ? `https://maps.google.com/?q=${photo.latitude},${photo.longitude}`
    : null;

  return (
    <div className="photo-detail-overlay" onClick={onClose}>
      <div className="photo-detail" onClick={(e) => e.stopPropagation()}>
        <button className="photo-detail__close" onClick={onClose}><X size={20} /></button>

        <div className="photo-detail__image-wrap">
          <img
            src={`/photos/original/${photo.id}${photo.filename.match(/\.[^.]+$/)?.[0] || '.jpg'}`}
            alt={photo.filename}
            className="photo-detail__image"
          />
        </div>

        <div className="photo-detail__info">
          <h2 className="photo-detail__filename">{photo.filename}</h2>

          {photo.ai_description && (
            <p className="photo-detail__description">{photo.ai_description}</p>
          )}

          <div className="photo-detail__meta-row">
            {dateTaken && (
              <span className="photo-detail__meta-item">
                <Calendar size={13} /> {dateTaken}
              </span>
            )}
            {(photo.camera_make || photo.camera_model) && (
              <span className="photo-detail__meta-item">
                <Camera size={13} /> {[photo.camera_make, photo.camera_model].filter(Boolean).join(' ')}
              </span>
            )}
            {mapsUrl && (
              <a className="photo-detail__meta-item" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin size={13} /> {photo.latitude?.toFixed(4)}, {photo.longitude?.toFixed(4)}
              </a>
            )}
          </div>

          {photo.dominant_colors && photo.dominant_colors.length > 0 && (
            <div className="photo-detail__colors">
              <h4>Dominant colors</h4>
              <div className="photo-detail__color-row">
                {photo.dominant_colors.map((c, i) => (
                  <div key={i} className="photo-detail__color-chip">
                    <span className="photo-detail__color-swatch" style={{ background: c.hex }} />
                    <span className="photo-detail__color-hex">{c.hex}</span>
                    <span className="photo-detail__color-pct">{c.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="photo-detail__tags-section">
            <h4>Tags</h4>
            <TagEditor photo={photo} onChange={onChange} />
          </div>

          <a
            href={`/photos/original/${photo.id}${photo.filename.match(/\.[^.]+$/)?.[0] || '.jpg'}`}
            download={photo.filename}
            className="btn-primary photo-detail__download"
          >
            <Download size={14} /> Download original
          </a>
        </div>
      </div>
    </div>
  );
}
