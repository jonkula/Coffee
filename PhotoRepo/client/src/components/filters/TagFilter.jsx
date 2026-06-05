import { useFilterStore } from '../../store/filterStore';
import { TagChip } from '../tags/TagChip';

export function TagFilter({ tags }) {
  const { activeTags, toggleTag } = useFilterStore();

  if (!tags || tags.length === 0) return null;

  return (
    <div className="tag-filter">
      {tags.map((t) => (
        <TagChip
          key={t.name}
          tag={t}
          clickable
          active={activeTags.includes(t.name)}
          onClick={() => toggleTag(t.name)}
        />
      ))}
    </div>
  );
}
