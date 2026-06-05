import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/heic', 'image/heif'];

export function DropZone({ onFiles }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => ACCEPTED.includes(f.type));
    if (files.length > 0) onFiles(files);
  }

  function handleChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFiles(files);
    e.target.value = '';
  }

  return (
    <div
      className={`dropzone ${dragging ? 'dropzone--active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <UploadCloud size={40} strokeWidth={1.5} />
      <p className="dropzone__title">Drop photos here or click to select</p>
      <p className="dropzone__sub">JPEG · PNG · WEBP · HEIC · TIFF · Multiple files OK</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        hidden
        onChange={handleChange}
      />
    </div>
  );
}
