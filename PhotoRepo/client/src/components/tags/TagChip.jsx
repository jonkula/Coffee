import { X } from 'lucide-react';

export function TagChip({ tag, onRemove, clickable, onClick, active }) {
  return (
    <span
      className={`tag-chip ${active ? 'tag-chip--active' : ''} ${clickable ? 'tag-chip--clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      {tag.name || tag}
      {onRemove && (
        <button className="tag-chip__remove" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <X size={10} />
        </button>
      )}
    </span>
  );
}
