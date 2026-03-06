import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CoffeeProvider } from './context/CoffeeContext';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import CoffeeProfilePage from './pages/CoffeeProfilePage';
import BrewSelectPage from './pages/BrewSelectPage';
import BrewGuidePage from './pages/BrewGuidePage';
import LibraryPage from './pages/LibraryPage';
import FavoritesPage from './pages/FavoritesPage';
import SettingsPage from './pages/SettingsPage';
import PidginTranslatorPage from './pages/PidginTranslatorPage';
import './App.css';

export default function App() {
  return (
    <CoffeeProvider>
      <BrowserRouter>
        <div className="app-shell">
          <main className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/coffee/:id" element={<CoffeeProfilePage />} />
              <Route path="/brew-select" element={<BrewSelectPage />} />
              <Route path="/brew/:coffeeId/:methodId" element={<BrewGuidePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/translate" element={<PidginTranslatorPage />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </CoffeeProvider>
  );
}
