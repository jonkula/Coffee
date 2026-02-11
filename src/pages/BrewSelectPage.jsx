import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { BREW_METHODS, BREW_CATEGORIES } from '../data/brewingMethods';

export default function BrewSelectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const coffeeId = searchParams.get('coffeeId');
  const preselectedMethod = searchParams.get('method');

  // If a method was preselected (from quick brew) and no coffee, go directly to guide
  if (preselectedMethod && !coffeeId) {
    // We'll handle this with a generic coffee profile
  }

  function selectMethod(methodId) {
    if (coffeeId) {
      navigate(`/brew/${coffeeId}/${methodId}`);
    } else {
      navigate(`/brew/generic/${methodId}`);
    }
  }

  return (
    <div className="page brew-select-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Choose Brew Method</h1>
        <div style={{ width: 24 }} />
      </header>

      <div className="brew-categories">
        {BREW_CATEGORIES.map((category) => (
          <section key={category.name} className="brew-category">
            <h2 className="category-title">{category.name}</h2>
            <div className="method-cards">
              {category.methods.map((methodId) => {
                const method = BREW_METHODS[methodId];
                if (!method) return null;
                return (
                  <button
                    key={method.id}
                    className="method-card"
                    onClick={() => selectMethod(method.id)}
                  >
                    <div className="method-card-content">
                      <h3>{method.name}</h3>
                      <p>{method.description}</p>
                      <div className="method-card-params">
                        <span>Grind: {method.defaults.grindSize}</span>
                        <span>Ratio: {method.defaults.ratio}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} />
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
