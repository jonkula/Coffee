import { useFilterStore } from '../../store/filterStore';
import { ColorSwatch } from './ColorSwatch';
import { TagFilter } from './TagFilter';
import { X } from 'lucide-react';

export function FilterPanel({ tags, onClose }) {
  const { activeColors, activeTags, dateRange, setDateRange, clearAll } = useFilterStore();
  const hasActive = activeColors.length > 0 || activeTags.length > 0 || dateRange.from || dateRange.to;

  return (
    <aside className="filter-panel">
      <div className="filter-panel__header">
        <h2>Filters</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {hasActive && (
            <button className="btn-ghost" onClick={clearAll}>Clear all</button>
          )}
          {onClose && (
            <button className="btn-ghost icon-btn" onClick={onClose}><X size={18} /></button>
          )}
        </div>
      </div>

      <section className="filter-section">
        <h3>Color</h3>
        <ColorSwatch />
      </section>

      <section className="filter-section">
        <h3>Date range</h3>
        <div className="date-range">
          <input
            type="date"
            className="date-input"
            value={dateRange.from}
            onChange={(e) => setDateRange(e.target.value, dateRange.to)}
            placeholder="From"
          />
          <span>–</span>
          <input
            type="date"
            className="date-input"
            value={dateRange.to}
            onChange={(e) => setDateRange(dateRange.from, e.target.value)}
            placeholder="To"
          />
        </div>
      </section>

      {tags && tags.length > 0 && (
        <section className="filter-section">
          <h3>Tags</h3>
          <TagFilter tags={tags} />
        </section>
      )}
    </aside>
  );
}
