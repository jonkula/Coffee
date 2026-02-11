import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Droplets } from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';

const roastColors = {
  light: '#d4a574',
  'light-medium': '#b8875a',
  medium: '#8b6f47',
  'medium-dark': '#5c4033',
  dark: '#3b2314',
};

export default function CoffeeCard({ coffee }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useCoffee();
  const favorited = isFavorite(coffee.id);

  return (
    <div className="coffee-card" onClick={() => navigate(`/coffee/${coffee.id}`)}>
      <div className="coffee-card-header">
        <div
          className="roast-indicator"
          style={{ backgroundColor: roastColors[coffee.roastLevel] || '#8b6f47' }}
        >
          {coffee.roastLevel.replace('-', ' ')}
        </div>
        <button
          className={`fav-btn ${favorited ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(coffee.id);
          }}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h3 className="coffee-card-name">{coffee.name}</h3>
      <p className="coffee-card-roaster">{coffee.roaster}</p>

      <div className="coffee-card-meta">
        <span className="meta-item">
          <MapPin size={14} />
          {coffee.origin.country}
        </span>
        <span className="meta-item">
          <Droplets size={14} />
          {coffee.processingMethod}
        </span>
      </div>

      <div className="flavor-tags">
        {coffee.flavorNotes.slice(0, 3).map((note) => (
          <span key={note} className="flavor-tag">
            {note}
          </span>
        ))}
        {coffee.flavorNotes.length > 3 && (
          <span className="flavor-tag more">+{coffee.flavorNotes.length - 3}</span>
        )}
      </div>
    </div>
  );
}
