import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight, Coffee } from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';
import CoffeeCard from '../components/CoffeeCard';

export default function HomePage() {
  const navigate = useNavigate();
  const { coffees } = useCoffee();
  const recentCoffees = coffees.slice(0, 3);

  return (
    <div className="page home-page">
      <header className="home-header">
        <div className="home-brand">
          <Coffee size={32} />
          <div>
            <h1>Coffee Scanner</h1>
            <p className="subtitle">Scan. Brew. Enjoy.</p>
          </div>
        </div>
      </header>

      <section className="scan-cta" onClick={() => navigate('/scan')}>
        <div className="scan-cta-content">
          <div className="scan-cta-icon">
            <Camera size={40} />
          </div>
          <div className="scan-cta-text">
            <h2>Scan a Coffee Bag</h2>
            <p>Take a photo or upload an image to get personalized brewing guides</p>
          </div>
        </div>
        <ArrowRight size={24} className="scan-cta-arrow" />
      </section>

      <section className="quick-brew">
        <h2 className="section-title">Quick Brew</h2>
        <p className="section-subtitle">Start brewing with a popular method</p>
        <div className="quick-brew-grid">
          {[
            { id: 'chemex', label: 'Chemex', emoji: '⏳' },
            { id: 'v60', label: 'V60', emoji: '☕' },
            { id: 'frenchPress', label: 'French Press', emoji: '🫖' },
            { id: 'aeropress', label: 'AeroPress', emoji: '💨' },
          ].map((method) => (
            <button
              key={method.id}
              className="quick-brew-btn"
              onClick={() => navigate(`/brew-select?method=${method.id}`)}
            >
              <span className="quick-brew-emoji">{method.emoji}</span>
              <span className="quick-brew-label">{method.label}</span>
            </button>
          ))}
        </div>
      </section>

      {recentCoffees.length > 0 && (
        <section className="recent-scans">
          <div className="section-header">
            <h2 className="section-title">Recent Scans</h2>
            <button className="link-btn" onClick={() => navigate('/library')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="coffee-list">
            {recentCoffees.map((coffee) => (
              <CoffeeCard key={coffee.id} coffee={coffee} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
