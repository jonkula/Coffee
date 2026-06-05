import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TagChip } from './TagChip';
import { addTag, removeTag } from '../../api/photoApi';

export function TagEditor({ photo, onChange }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    setLoading(true);
    try {
      const tag = await addTag(photo.id, name);
      onChange({ ...photo, tags: [...(photo.tags || []), tag] });
      setInput('');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(tag) {
    await removeTag(photo.id, tag.id);
    onChange({ ...photo, tags: photo.tags.filter((t) => t.id !== tag.id) });
  }

  return (
    <div className="tag-editor">
      <div className="tag-editor__chips">
        {(photo.tags || []).map((tag) => (
          <TagChip key={tag.id} tag={tag} onRemove={() => handleRemove(tag)} />
        ))}
      </div>
      <form className="tag-editor__form" onSubmit={handleAdd}>
        <input
          className="tag-editor__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add tag…"
          disabled={loading}
        />
        <button className="tag-editor__btn" type="submit" disabled={!input.trim() || loading}>
          <Plus size={14} />
        </button>
      </form>
    </div>
  );
}
