import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Image, X, Loader, Edit3, ChevronRight } from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';
import { ROAST_LEVELS, ACIDITY_LEVELS, BODY_LEVELS, FLAVOR_NOTE_SUGGESTIONS } from '../data/mockCoffees';

export default function ScanPage() {
  const navigate = useNavigate();
  const { addCoffee } = useCoffee();
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('capture'); // 'capture' | 'processing' | 'result' | 'manual'
  const [imagePreview, setImagePreview] = useState(null);
  const [manualEntry, setManualEntry] = useState({
    name: '',
    roaster: '',
    country: '',
    region: '',
    altitude: '',
    varietal: '',
    processingMethod: '',
    roastLevel: 'medium',
    flavorNotes: [],
    acidity: 'medium',
    body: 'medium',
  });
  const [flavorInput, setFlavorInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
        simulateProcessing();
      };
      reader.readAsDataURL(file);
    }
  }

  function simulateProcessing() {
    setMode('processing');
    setTimeout(() => {
      setManualEntry({
        name: 'Ethiopia Sidamo Natural',
        roaster: 'Extracted Roaster Name',
        country: 'Ethiopia',
        region: 'Sidamo',
        altitude: '1,800–2,200m',
        varietal: 'Heirloom',
        processingMethod: 'Natural',
        roastLevel: 'light-medium',
        flavorNotes: ['Blueberry', 'Wine', 'Dark Chocolate'],
        acidity: 'medium',
        body: 'medium',
      });
      setMode('result');
    }, 2500);
  }

  function handleSave() {
    const newCoffee = {
      id: Date.now().toString(),
      name: manualEntry.name,
      roaster: manualEntry.roaster,
      origin: {
        country: manualEntry.country,
        region: manualEntry.region,
        altitude: manualEntry.altitude,
      },
      varietal: manualEntry.varietal,
      processingMethod: manualEntry.processingMethod,
      roastLevel: manualEntry.roastLevel,
      flavorNotes: manualEntry.flavorNotes,
      acidity: manualEntry.acidity,
      body: manualEntry.body,
      imageUrl: imagePreview,
      scannedAt: new Date().toISOString(),
    };
    addCoffee(newCoffee);
    navigate(`/coffee/${newCoffee.id}`);
  }

  function addFlavorNote(note) {
    if (note && !manualEntry.flavorNotes.includes(note)) {
      setManualEntry({ ...manualEntry, flavorNotes: [...manualEntry.flavorNotes, note] });
    }
    setFlavorInput('');
    setShowSuggestions(false);
  }

  function removeFlavorNote(note) {
    setManualEntry({
      ...manualEntry,
      flavorNotes: manualEntry.flavorNotes.filter((n) => n !== note),
    });
  }

  const filteredSuggestions = FLAVOR_NOTE_SUGGESTIONS.filter(
    (s) =>
      s.toLowerCase().includes(flavorInput.toLowerCase()) &&
      !manualEntry.flavorNotes.includes(s)
  );

  if (mode === 'processing') {
    return (
      <div className="page scan-page">
        <div className="processing-screen">
          <div className="processing-animation">
            <Loader size={48} className="spinner" />
          </div>
          <h2>Analyzing Coffee Bag...</h2>
          <p>Extracting roast level, flavor notes, origin, and more</p>
          {imagePreview && (
            <div className="image-preview-small">
              <img src={imagePreview} alt="Scanned coffee bag" />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'result' || mode === 'manual') {
    return (
      <div className="page scan-page">
        <header className="page-header">
          <button className="back-btn" onClick={() => { setMode('capture'); setImagePreview(null); }}>
            <X size={24} />
          </button>
          <h1>{mode === 'result' ? 'Review Scan Results' : 'Add Coffee Manually'}</h1>
          <div style={{ width: 24 }} />
        </header>

        {mode === 'result' && (
          <div className="scan-notice">
            <Edit3 size={16} />
            <span>Review and edit the extracted information below</span>
          </div>
        )}

        <form className="coffee-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="form-group">
            <label>Coffee Name</label>
            <input
              type="text"
              value={manualEntry.name}
              onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })}
              placeholder="e.g. Ethiopia Yirgacheffe"
              required
            />
          </div>

          <div className="form-group">
            <label>Roaster</label>
            <input
              type="text"
              value={manualEntry.roaster}
              onChange={(e) => setManualEntry({ ...manualEntry, roaster: e.target.value })}
              placeholder="e.g. Counter Culture"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={manualEntry.country}
                onChange={(e) => setManualEntry({ ...manualEntry, country: e.target.value })}
                placeholder="e.g. Ethiopia"
              />
            </div>
            <div className="form-group">
              <label>Region</label>
              <input
                type="text"
                value={manualEntry.region}
                onChange={(e) => setManualEntry({ ...manualEntry, region: e.target.value })}
                placeholder="e.g. Yirgacheffe"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Altitude</label>
              <input
                type="text"
                value={manualEntry.altitude}
                onChange={(e) => setManualEntry({ ...manualEntry, altitude: e.target.value })}
                placeholder="e.g. 1,800m"
              />
            </div>
            <div className="form-group">
              <label>Varietal</label>
              <input
                type="text"
                value={manualEntry.varietal}
                onChange={(e) => setManualEntry({ ...manualEntry, varietal: e.target.value })}
                placeholder="e.g. Heirloom"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Processing Method</label>
            <input
              type="text"
              value={manualEntry.processingMethod}
              onChange={(e) => setManualEntry({ ...manualEntry, processingMethod: e.target.value })}
              placeholder="e.g. Washed, Natural, Honey"
            />
          </div>

          <div className="form-group">
            <label>Roast Level</label>
            <div className="select-chips">
              {ROAST_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`chip ${manualEntry.roastLevel === level ? 'selected' : ''}`}
                  onClick={() => setManualEntry({ ...manualEntry, roastLevel: level })}
                >
                  {level.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Flavor Notes</label>
            <div className="flavor-input-container">
              <div className="flavor-tags-edit">
                {manualEntry.flavorNotes.map((note) => (
                  <span key={note} className="flavor-tag editable">
                    {note}
                    <button type="button" onClick={() => removeFlavorNote(note)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={flavorInput}
                onChange={(e) => {
                  setFlavorInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFlavorNote(flavorInput);
                  }
                }}
                placeholder="Type to add flavor notes..."
              />
              {showSuggestions && flavorInput && filteredSuggestions.length > 0 && (
                <div className="flavor-suggestions">
                  {filteredSuggestions.slice(0, 6).map((s) => (
                    <button key={s} type="button" onClick={() => addFlavorNote(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Acidity</label>
              <div className="select-chips">
                {ACIDITY_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`chip ${manualEntry.acidity === level ? 'selected' : ''}`}
                    onClick={() => setManualEntry({ ...manualEntry, acidity: level })}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Body</label>
              <div className="select-chips">
                {BODY_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`chip ${manualEntry.body === level ? 'selected' : ''}`}
                    onClick={() => setManualEntry({ ...manualEntry, body: level })}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full">
            Save Coffee Profile
            <ChevronRight size={20} />
          </button>
        </form>
      </div>
    );
  }

  // Capture mode
  return (
    <div className="page scan-page">
      <header className="page-header">
        <h1>Scan Coffee Bag</h1>
      </header>

      <div className="capture-area">
        <div className="camera-viewfinder">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="capture-preview" />
          ) : (
            <div className="viewfinder-overlay">
              <div className="viewfinder-frame" />
              <p>Position the coffee bag label within the frame</p>
            </div>
          )}
        </div>

        <div className="capture-actions">
          <button
            className="capture-btn secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={24} />
            <span>Upload Photo</span>
          </button>

          <button
            className="capture-btn primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={32} />
          </button>

          <button
            className="capture-btn secondary"
            onClick={() => setMode('manual')}
          >
            <Edit3 size={24} />
            <span>Manual Entry</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}
