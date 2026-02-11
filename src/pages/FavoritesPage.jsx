import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';
import CoffeeCard from '../components/CoffeeCard';

export default function FavoritesPage() {
  const { coffees, favorites } = useCoffee();
  const navigate = useNavigate();
  const favoriteCoffees = coffees.filter((c) => favorites.includes(c.id));

  return (
    <div className="page favorites-page">
      <header className="page-header">
        <h1>Favorites</h1>
      </header>

      {favoriteCoffees.length === 0 ? (
        <div className="empty-state">
          <Heart size={48} className="empty-icon" />
          <h2>No Favorites Yet</h2>
          <p>Tap the heart icon on any coffee to save it here.</p>
          <button className="btn-primary" onClick={() => navigate('/library')}>
            Browse Library
          </button>
        </div>
      ) : (
        <div className="coffee-list">
          {favoriteCoffees.map((coffee) => (
            <CoffeeCard key={coffee.id} coffee={coffee} />
          ))}
        </div>
      )}
    </div>
  );
}
