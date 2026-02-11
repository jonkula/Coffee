import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Mountain, Leaf, Flame, Droplets, ChevronRight, Trash2 } from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';
import { BREW_METHODS } from '../data/brewingMethods';

const roastColors = {
  light: '#d4a574',
  'light-medium': '#b8875a',
  medium: '#8b6f47',
  'medium-dark': '#5c4033',
  dark: '#3b2314',
};

export default function CoffeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { coffees, toggleFavorite, isFavorite, deleteCoffee } = useCoffee();
  const coffee = coffees.find((c) => c.id === id);

  if (!coffee) {
    return (
      <div className="page">
        <header className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h1>Not Found</h1>
          <div style={{ width: 24 }} />
        </header>
        <div className="empty-state">
          <p>This coffee profile was not found.</p>
        </div>
      </div>
    );
  }

  const favorited = isFavorite(coffee.id);

  function handleDelete() {
    if (window.confirm('Delete this coffee profile?')) {
      deleteCoffee(coffee.id);
      navigate('/library');
    }
  }

  return (
    <div className="page coffee-profile-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Coffee Profile</h1>
        <button
          className={`fav-btn header-btn ${favorited ? 'favorited' : ''}`}
          onClick={() => toggleFavorite(coffee.id)}
        >
          <Heart size={22} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </header>

      <div className="profile-hero">
        <div
          className="roast-badge large"
          style={{ backgroundColor: roastColors[coffee.roastLevel] || '#8b6f47' }}
        >
          {coffee.roastLevel.replace('-', ' ')} roast
        </div>
        <h2 className="profile-name">{coffee.name}</h2>
        <p className="profile-roaster">{coffee.roaster}</p>
      </div>

      <section className="profile-section">
        <h3 className="profile-section-title">Origin</h3>
        <div className="profile-details">
          <div className="detail-row">
            <MapPin size={18} />
            <span className="detail-label">Country</span>
            <span className="detail-value">{coffee.origin.country}</span>
          </div>
          {coffee.origin.region && (
            <div className="detail-row">
              <MapPin size={18} />
              <span className="detail-label">Region</span>
              <span className="detail-value">{coffee.origin.region}</span>
            </div>
          )}
          {coffee.origin.altitude && (
            <div className="detail-row">
              <Mountain size={18} />
              <span className="detail-label">Altitude</span>
              <span className="detail-value">{coffee.origin.altitude}</span>
            </div>
          )}
        </div>
      </section>

      <section className="profile-section">
        <h3 className="profile-section-title">Details</h3>
        <div className="profile-details">
          {coffee.varietal && (
            <div className="detail-row">
              <Leaf size={18} />
              <span className="detail-label">Varietal</span>
              <span className="detail-value">{coffee.varietal}</span>
            </div>
          )}
          <div className="detail-row">
            <Flame size={18} />
            <span className="detail-label">Processing</span>
            <span className="detail-value">{coffee.processingMethod}</span>
          </div>
          <div className="detail-row">
            <Droplets size={18} />
            <span className="detail-label">Acidity</span>
            <span className="detail-value">{coffee.acidity}</span>
          </div>
          <div className="detail-row">
            <Droplets size={18} />
            <span className="detail-label">Body</span>
            <span className="detail-value">{coffee.body}</span>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <h3 className="profile-section-title">Flavor Notes</h3>
        <div className="flavor-tags large">
          {coffee.flavorNotes.map((note) => (
            <span key={note} className="flavor-tag">
              {note}
            </span>
          ))}
        </div>
      </section>

      <section className="profile-section">
        <h3 className="profile-section-title">Brew This Coffee</h3>
        <p className="section-subtitle">Choose a method for personalized brewing instructions</p>
        <div className="brew-method-list">
          {Object.values(BREW_METHODS).slice(0, 6).map((method) => (
            <button
              key={method.id}
              className="brew-method-row"
              onClick={() => navigate(`/brew/${coffee.id}/${method.id}`)}
            >
              <div className="brew-method-info">
                <span className="brew-method-name">{method.name}</span>
                <span className="brew-method-desc">{method.description}</span>
              </div>
              <ChevronRight size={20} />
            </button>
          ))}
          <button
            className="brew-method-row see-all"
            onClick={() => navigate(`/brew-select?coffeeId=${coffee.id}`)}
          >
            <span>See all brewing methods</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      <button className="btn-danger" onClick={handleDelete}>
        <Trash2 size={18} />
        Delete Profile
      </button>
    </div>
  );
}
