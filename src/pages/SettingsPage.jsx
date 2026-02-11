import { useCoffee } from '../context/CoffeeContext';
import { BREW_METHODS } from '../data/brewingMethods';

export default function SettingsPage() {
  const { settings, updateSettings } = useCoffee();

  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <section className="settings-section">
        <h2 className="settings-section-title">Brewing Preferences</h2>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Default Brew Method</span>
            <span className="setting-desc">Used for quick brew shortcuts</span>
          </div>
          <select
            value={settings.defaultBrewMethod}
            onChange={(e) => updateSettings({ defaultBrewMethod: e.target.value })}
          >
            {Object.values(BREW_METHODS).map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Temperature Unit</span>
            <span className="setting-desc">Display temperatures in your preferred unit</span>
          </div>
          <select
            value={settings.temperatureUnit}
            onChange={(e) => updateSettings({ temperatureUnit: e.target.value })}
          >
            <option value="fahrenheit">Fahrenheit (°F)</option>
            <option value="celsius">Celsius (°C)</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Strength Preference</span>
            <span className="setting-desc">Adjusts default coffee-to-water ratios</span>
          </div>
          <select
            value={settings.strengthPreference}
            onChange={(e) => updateSettings({ strengthPreference: e.target.value })}
          >
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="strong">Strong</option>
          </select>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-title">Notifications & Timer</h2>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Timer Notifications</span>
            <span className="setting-desc">Get notified when a brew step completes</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Sound</span>
            <span className="setting-desc">Play sound when timer completes</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <span className="setting-label">Vibration</span>
            <span className="setting-desc">Vibrate on timer completion</span>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.vibrationEnabled}
              onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section-title">About</h2>
        <div className="about-info">
          <p><strong>Coffee Scanner</strong> v1.0.0</p>
          <p>Scan coffee bags and get personalized brewing guides for any method.</p>
        </div>
      </section>
    </div>
  );
}
