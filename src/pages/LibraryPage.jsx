import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';
import CoffeeCard from '../components/CoffeeCard';
import { ROAST_LEVELS } from '../data/mockCoffees';

export default function LibraryPage() {
  const { coffees } = useCoffee();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [roastFilter, setRoastFilter] = useState(null);
  const [sortBy, setSortBy] = useState('recent');

  let filtered = coffees.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.roaster.toLowerCase().includes(q) ||
      c.origin.country.toLowerCase().includes(q) ||
      c.flavorNotes.some((n) => n.toLowerCase().includes(q));

    const matchesRoast = !roastFilter || c.roastLevel === roastFilter;

    return matchesSearch && matchesRoast;
  });

  if (sortBy === 'recent') {
    filtered.sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt));
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'roaster') {
    filtered.sort((a, b) => a.roaster.localeCompare(b.roaster));
  }

  const hasActiveFilters = roastFilter !== null;

  return (
    <div className="page library-page">
      <header className="page-header">
        <h1>My Library</h1>
      </header>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search coffees, roasters, origins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-btn" onClick={() => setSearchQuery('')}>
            <X size={16} />
          </button>
        )}
        <button
          className={`filter-btn ${hasActiveFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Roast Level</label>
            <div className="select-chips">
              <button
                className={`chip ${roastFilter === null ? 'selected' : ''}`}
                onClick={() => setRoastFilter(null)}
              >
                All
              </button>
              {ROAST_LEVELS.map((level) => (
                <button
                  key={level}
                  className={`chip ${roastFilter === level ? 'selected' : ''}`}
                  onClick={() => setRoastFilter(level === roastFilter ? null : level)}
                >
                  {level.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <div className="select-chips">
              {[
                { value: 'recent', label: 'Most Recent' },
                { value: 'name', label: 'Name' },
                { value: 'roaster', label: 'Roaster' },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`chip ${sortBy === option.value ? 'selected' : ''}`}
                  onClick={() => setSortBy(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="library-stats">
        <span>{filtered.length} coffee{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          {searchQuery || hasActiveFilters ? (
            <>
              <p>No coffees match your search.</p>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setRoastFilter(null);
                }}
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <p>No coffees in your library yet.</p>
              <button className="btn-primary" onClick={() => navigate('/scan')}>
                Scan Your First Coffee
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="coffee-list">
          {filtered.map((coffee) => (
            <CoffeeCard key={coffee.id} coffee={coffee} />
          ))}
        </div>
      )}
    </div>
  );
}
