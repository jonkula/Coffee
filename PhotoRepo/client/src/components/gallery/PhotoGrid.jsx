import { PhotoCard } from './PhotoCard';

export function PhotoGrid({ photos, onSelect, onDelete }) {
  if (photos.length === 0) {
    return (
      <div className="empty-state">
        <p>No photos yet.</p>
        <p className="empty-state__sub">Upload photos using the button above.</p>
      </div>
    );
  }

  return (
    <div className="photo-grid">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onClick={() => onSelect(photo)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
