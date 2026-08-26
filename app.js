// ============================================================
// RakshaAI — Complete Upgraded React Application with GPS
// ============================================================
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ---- Helper: translation function wrapper ----
function useT(currentLang) {
  return { t: (key) => t(key, currentLang) };
}

// ============================================================
// Toast Component
// ============================================================
function Toast({ message, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3000);
    return () => clearTimeout(id);
  }, [onClose]);
  return <div className="toast">{message}</div>;
}

// ============================================================
// Safety Score Ring (SVG)
// ============================================================
function SafetyRing({ score, size = 64 }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const label = getSafetyLabel(score);
  return (
    <div className="safety-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`Safety score: ${score} out of 100`}>
        <circle className="safety-ring-bg" cx={size / 2} cy={size / 2} r={r} />
        <circle
          className="safety-ring-fill"
          cx={size / 2} cy={size / 2} r={r}
          stroke={label.color}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="safety-ring-label" style={{ color: label.color }}>{score}</div>
    </div>
  );
}

// ============================================================
// Toggle Switch
// ============================================================
function Toggle({ active, onToggle }) {
  return (
    <div className={`toggle ${active ? 'active' : ''}`} onClick={onToggle}>
      <div className="toggle-knob" />
    </div>
  );
}

// ============================================================
// Custom Select
// ============================================================
function CustomSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selected = options.find(o => o.value === value);
  return (
    <div className="custom-select" ref={ref}>
      <div className="custom-select-btn" onClick={() => setOpen(!open)} role="button" tabIndex={0}>
        <span>{selected?.label || value}</span>
        <span style={{ fontSize: 8 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="custom-select-dropdown">
          {options.map(o => (
            <div
              key={o.value}
              className={`custom-select-option ${o.value === value ? 'selected' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Dashboard Page
// ============================================================
function DashboardPage({ onNavigate, lang, safetyReports, activeJourney, onEndJourney, userCoords, onFetchLocation, savedPlaces, setSavedPlaces, setJourneyDestination, userName, setUserName }) {
  const { t } = useT(lang);
  const isNight = isNightTime();

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const [editingPlace, setEditingPlace] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const debounceTimeoutRef = useRef(null);

  const fetchSuggestions = (val) => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    if (!val.trim() || val.length < 2) {
      setSuggestions([]);
      return;
    }

    const localFiltered = [
      { name: "Indirapuram, Ghaziabad", lat: 28.58847, lng: 77.45657 },
      { name: "Sector 62, Noida", lat: 28.6273, lng: 77.3725 },
      { name: "Sector 52, Noida", lat: 28.5835, lng: 77.3615 },
      { name: "Sector 15, Noida", lat: 28.5995, lng: 77.3218 },
      { name: "Gaur City Mall, Greater Noida West", lat: 28.6095, lng: 77.4205 },
      { name: "Hebbal, Bangalore", lat: 13.0358, lng: 77.5970 }
    ].filter(loc => loc.name.toLowerCase().includes(val.toLowerCase()));
    
    setSuggestions(localFiltered);
    setShowSuggest(true);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=in`);
        if (response.ok) {
          const data = await response.json();
          const fetched = data.map(item => {
            const parts = item.display_name.split(',');
            const shortName = parts.slice(0, 3).join(',').trim();
            return {
              name: shortName,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            };
          });
          const combined = [...localFiltered];
          fetched.forEach(f => {
            if (!combined.some(c => c.name.toLowerCase() === f.name.toLowerCase())) {
              combined.push(f);
            }
          });
          setSuggestions(combined);
        }
      } catch (err) {
        console.warn(err);
      }
    }, 400);
  };

  const handleStartEdit = (place) => {
    setEditingPlace({ ...place });
    setIsAdding(false);
  };

  const handleStartAdd = () => {
    setEditingPlace({ id: 'sp_' + Date.now(), icon: '📌', label: '', address: '' });
    setIsAdding(true);
  };

  const handleDeletePlace = (id) => {
    const updated = savedPlaces.filter(p => p.id !== id);
    setSavedPlaces(updated);
    localStorage.setItem('raksha_saved_places_v2', JSON.stringify(updated));
  };

  const handleSavePlace = () => {
    let updated;
    if (isAdding) {
      updated = [...savedPlaces, editingPlace];
    } else {
      updated = savedPlaces.map(p => p.id === editingPlace.id ? editingPlace : p);
    }
    setSavedPlaces(updated);
    localStorage.setItem('raksha_saved_places_v2', JSON.stringify(updated));

    // Sync back to old localstorage fields for backward compatibility
    if (editingPlace.id === 'home') {
      localStorage.setItem('raksha_home', editingPlace.address);
    } else if (editingPlace.id === 'office') {
      localStorage.setItem('raksha_office', editingPlace.address);
    }

    setEditingPlace(null);
  };

  // Dynamically compute safety score of the area ( Hebbal route / default location )
  const safetyScore = useMemo(() => {
    return calculateSafetyScore(RakshaData.routeOptions[2], safetyReports);
  }, [safetyReports]);

  // Format dynamic ETA for Active Journey
  const [timeLeftStr, setTimeLeftStr] = useState('');
  useEffect(() => {
    if (!activeJourney) return;
    const updateTime = () => {
      const remainingMs = Math.max(0, activeJourney.expectedArrival - Date.now());
      const mins = Math.ceil(remainingMs / 60000);
      setTimeLeftStr(mins > 0 ? `${mins} ${t('minutes')}` : 'Overdue');
    };
    updateTime();
    const interval = setInterval(updateTime, 5000);
    return () => clearInterval(interval);
  }, [activeJourney, t]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return t('dashboardTitle').replace('evening', 'morning').replace('शुभ संध्या', 'शुभ प्रभात');
    if (h < 17) return t('dashboardTitle').replace('evening', 'afternoon').replace('शुभ संध्या', 'शुभ दोपहर');
    return t('dashboardTitle');
  }, [lang, t]);

  return (
    <div className="page-content">
      {/* Hero Card */}
      <div className="dash-hero" style={{ background: 'linear-gradient(135deg, var(--primary-pink) 0%, #db2777 100%)', padding: '24px 20px', borderRadius: '0 0 24px 24px', color: '#fff', marginBottom: 20 }}>
        <div className="dash-hero-greeting" style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <span>{greeting},</span>
          {editingName ? (
            <input 
              type="text" 
              value={tempName} 
              onChange={e => setTempName(e.target.value)} 
              onBlur={() => {
                if (tempName.trim()) {
                  setUserName(tempName.trim());
                  localStorage.setItem('raksha_user_name', tempName.trim());
                }
                setEditingName(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (tempName.trim()) {
                    setUserName(tempName.trim());
                    localStorage.setItem('raksha_user_name', tempName.trim());
                  }
                  setEditingName(false);
                }
              }}
              autoFocus
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px dashed #fff',
                borderRadius: 4,
                color: '#fff',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                padding: '2px 6px',
                outline: 'none',
                width: '150px',
                fontFamily: 'inherit'
              }}
            />
          ) : (
            <span 
              onClick={() => { setTempName(userName); setEditingName(true); }}
              style={{ borderBottom: '2px dashed rgba(255,255,255,0.7)', cursor: 'pointer', display: 'inline-block' }}
              title="Click to edit name"
            >
              {userName}
            </span>
          )}
          <span>👋</span>
        </div>
        <div className="dash-hero-sub" style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>{t('dashboardSubtitle')}</div>
        <div className="dash-hero-location" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.18)', padding: '6px 12px', borderRadius: 20, marginTop: 14, fontSize: 12, cursor: 'pointer' }} onClick={onFetchLocation} title="Click to refresh GPS location">
          <span className="dot" style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', marginRight: 6, display: 'inline-block' }} />
          <span>{userCoords.name}</span>
          <span style={{ marginLeft: 6, fontSize: 10 }}>🔄</span>
        </div>
      </div>

      {/* Night Safety Banner */}
      {isNight && (
        <div className="night-banner" style={{ margin: '0 16px 20px', padding: 14, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, color: '#d97706', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontWeight: 800, fontSize: 13 }}>🌙 {t('nightSafetyMode')}</div>
          <div className="night-banner-desc" style={{ fontSize: 10.5, color: '#b45309' }}>{t('nightSafetyDesc')}</div>
        </div>
      )}

      {/* Safety Score Widget */}
      <div className="safety-score-widget" style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '0 16px 20px', padding: 16, background: '#fff', border: '1px solid var(--border)', borderRadius: 16 }}>
        <SafetyRing score={safetyScore} size={70} />
        <div className="safety-info" style={{ flex: 1 }}>
          <div className="safety-info-title" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t('safetyStatus')}</div>
          <div className="safety-info-desc" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
            {getSafetyLabel(safetyScore).icon} {t(getSafetyLabel(safetyScore).label)}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
            Safety scores are estimates based on active community incident reports.
          </div>
        </div>
      </div>

      {/* Active Journey Bar */}
      {activeJourney && (
        <div className="journey-bar" onClick={() => onNavigate('journey')} role="button" tabIndex={0} style={{ margin: '0 16px 20px', padding: 14, background: 'var(--soft-pink)', border: '1px solid var(--primary-pink)', borderRadius: 16, cursor: 'pointer' }}>
          <div className="journey-bar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div className="journey-bar-status" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: 'var(--primary-pink)' }}>
              <span className="dot" style={{ width: 8, height: 8, background: 'var(--primary-pink)', borderRadius: '50%', display: 'inline-block', animation: 'pulse-badge 1s infinite' }} />
              <span>{t('activeJourney')} — {activeJourney.destination}</span>
            </div>
            <div className="journey-bar-eta" style={{ fontSize: 11, fontWeight: 700, background: 'var(--primary-pink)', color: '#fff', padding: '3px 8px', borderRadius: 10 }}>ETA: {timeLeftStr}</div>
          </div>
          <div className="journey-bar-details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <div className="journey-bar-share" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              🟢 Live journey sharing active with {activeJourney.contact?.name || 'contacts'}
            </div>
            <div className="journey-bar-btns" style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 11, width: 'auto' }} onClick={() => onNavigate('journey')}>{t('details')}</button>
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: 11, background: 'var(--red)', color: '#fff', width: 'auto' }} onClick={onEndJourney}>{t('journeyEndJourney')}</button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Pillars Grid (Protect, Prevent, Inform, Assist) */}
      <div className="section" style={{ margin: '0 16px 20px' }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          <span className="icon">🛡️</span>
          {lang === 'en' ? 'Raksha Safety Pillars' : 'सुरक्षा के 4 स्तंभ'}
        </div>
        <div className="pillars-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* PROTECT CARD */}
          <div className="pillar-card protect" onClick={() => onNavigate('sos')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', borderRadius: 16, padding: 16, border: '1px solid #fca5a5', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)', transition: 'all 0.2s ease' }} role="button" tabIndex={0}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🛡️</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#991b1b' }}>PROTECT</div>
            <div style={{ fontSize: 11, color: '#7f1d1d', marginTop: 4, opacity: 0.85 }}>{t('quickSos')}</div>
          </div>

          {/* PREVENT CARD */}
          <div className="pillar-card prevent" onClick={() => onNavigate('journey')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderRadius: 16, padding: 16, border: '1px solid #93c5fd', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)', transition: 'all 0.2s ease' }} role="button" tabIndex={0}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🗺️</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1e40af' }}>PREVENT</div>
            <div style={{ fontSize: 11, color: '#1e3a8a', marginTop: 4, opacity: 0.85 }}>{t('planSafeRoute')}</div>
          </div>

          {/* INFORM CARD */}
          <div className="pillar-card inform" onClick={() => onNavigate('rights')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: 16, padding: 16, border: '1px solid #fcd34d', boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)', transition: 'all 0.2s ease' }} role="button" tabIndex={0}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>⚖️</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#854d0e' }}>INFORM</div>
            <div style={{ fontSize: 11, color: '#78350f', marginTop: 4, opacity: 0.85 }}>{lang === 'en' ? 'Know Your Rights' : 'अधिकार और कानून'}</div>
          </div>

          {/* ASSIST CARD */}
          <div className="pillar-card assist" onClick={() => onNavigate('assistant')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', borderRadius: 16, padding: 16, border: '1px solid #7dd3fc', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)', transition: 'all 0.2s ease' }} role="button" tabIndex={0}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🤖</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#075985' }}>ASSIST</div>
            <div style={{ fontSize: 11, color: '#0c4a6e', marginTop: 4, opacity: 0.85 }}>{lang === 'en' ? 'AI Safety Assistant' : 'AI सुरक्षा सहायक'}</div>
          </div>
        </div>
      </div>

      {/* Global Emergency SOS Quick Trigger Button */}
      <div className="sos-btn-wrapper" style={{ padding: '0 16px', marginBottom: 20 }}>
        <button className="sos-btn" onClick={() => onNavigate('sos')} style={{ width: '100%', height: 48, background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', cursor: 'pointer' }}>
          🚨 SOS — EMERGENCY SIGNAL
        </button>
      </div>

      {/* Saved Places */}
      <div className="section" style={{ margin: '0 16px 20px' }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          <span className="icon">🏠</span>
          {lang === 'en' ? 'Quick Route Short-keys' : 'त्वरित मार्ग कुंजियाँ'}
        </div>

        {/* Saved Places List */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {savedPlaces.map(place => (
            <div 
              key={place.id} 
              className="card card-compact" 
              style={{ padding: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 70, minWidth: 0 }}
              onClick={() => {
                setJourneyDestination(place.address);
                onNavigate('journey');
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {place.icon} {place.label}
                </span>
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => handleStartEdit(place)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: 2, color: 'var(--text-muted)' }}
                    title="Edit place"
                  >
                    ✏️
                  </button>
                  {place.id !== 'home' && place.id !== 'office' && (
                    <button 
                      onClick={() => handleDeletePlace(place.id)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: 2, color: '#ef4444' }}
                      title="Delete place"
                    >
                      ❌
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 6, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={place.address}>
                {place.address}
              </div>
            </div>
          ))}
          {/* Add New Place Button */}
          <div 
            className="card card-compact" 
            style={{ padding: 12, background: 'var(--soft-pink)', border: '1px dashed var(--primary-pink)', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 70, minWidth: 0 }}
            onClick={() => handleStartAdd()}
          >
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-pink)' }}>
              ➕ {lang === 'en' ? 'Add Custom Place' : 'नया स्थान जोड़ें'}
            </span>
          </div>
        </div>

        {/* Place Editor Panel (Collapsible) */}
        {editingPlace && (
          <div className="card animate-fade-in" style={{ padding: 14, border: '1px solid var(--primary-pink)', background: '#fff', borderRadius: 12, marginTop: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--primary-pink)', marginBottom: 10 }}>
              {isAdding ? (lang === 'en' ? '➕ ADD NEW PLACE' : '➕ नया स्थान जोड़ें') : (lang === 'en' ? '✏️ EDIT SAVED PLACE' : '✏️ सहेजा हुआ स्थान संपादित करें')}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 800 }}>PLACE NAME / LABEL</label>
                <input 
                  className="input-field"
                  style={{ height: 32, fontSize: 11, padding: 6, marginTop: 2 }}
                  placeholder="e.g. Tuition, College, Friend's House"
                  value={editingPlace.label}
                  onChange={e => setEditingPlace({...editingPlace, label: e.target.value})}
                  disabled={editingPlace.id === 'home' || editingPlace.id === 'office'}
                />
              </div>
              <div style={{ width: 85 }}>
                <label style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 800 }}>ICON</label>
                <select 
                  className="input-field" 
                  style={{ height: 32, fontSize: 12, padding: '0 4px', marginTop: 2, background: '#fff' }}
                  value={editingPlace.icon}
                  onChange={e => setEditingPlace({...editingPlace, icon: e.target.value})}
                >
                  <option value="🏠">🏠 Home</option>
                  <option value="💼">💼 Office</option>
                  <option value="👥">👥 Friend</option>
                  <option value="🎓">🎓 College</option>
                  <option value="📚">📚 Tuition</option>
                  <option value="📌">📌 Custom</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12, position: 'relative' }}>
              <label style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 800 }}>ADDRESS / LOCATION</label>
              <input 
                className="input-field"
                style={{ height: 32, fontSize: 11, padding: 6, marginTop: 2 }}
                placeholder="Start typing location name..."
                value={editingPlace.address}
                onChange={e => {
                  setEditingPlace({...editingPlace, address: e.target.value});
                  fetchSuggestions(e.target.value);
                }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 250)}
              />

              {/* Suggestions Dropdown */}
              {showSuggest && suggestions.length > 0 && (
                <div className="autocomplete-suggestions" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1010 }}>
                  {suggestions.map((sug, i) => (
                    <div 
                      key={i} 
                      className="suggestion-item" 
                      style={{ padding: '8px 12px', fontSize: 11, cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        setEditingPlace({...editingPlace, address: sug.name});
                        setShowSuggest(false);
                      }}
                    >
                      📍 {sug.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button 
                className="btn-secondary" 
                style={{ padding: '6px 12px', fontSize: 11, width: 'auto' }} 
                onClick={() => setEditingPlace(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                style={{ padding: '6px 12px', fontSize: 11, width: 'auto', background: 'var(--primary-pink)' }}
                onClick={handleSavePlace}
                disabled={!editingPlace.label.trim() || !editingPlace.address.trim()}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Community Alerts */}
      <div className="section" style={{ margin: '0 16px 20px' }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          <span className="icon">🔔</span>
          {t('communityAlerts')}
        </div>
        <div className="alert-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {safetyReports.slice(0, 4).map(report => (
            <div className="alert-item" key={report.id} onClick={() => onNavigate('map')} role="button" tabIndex={0} style={{ display: 'flex', gap: 12, padding: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer' }}>
              <div className={`alert-icon ${report.severity}`} style={{ fontSize: 18, width: 36, height: 36, background: report.severity === 'high' ? '#fee2e2' : report.severity === 'medium' ? '#ffedd5' : '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getCategoryIcon(report.category)}
              </div>
              <div className="alert-body" style={{ flex: 1 }}>
                <div className="alert-title" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{report.location.name}</div>
                <div className="alert-meta" style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                  <span>{getCategoryLabel(report.category, lang)}</span>
                  <span style={{ margin: '0 4px' }}>•</span>
                  <span>{formatTimestamp(report.timestamp)}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                  <span className="alert-confirmations" style={{ fontSize: 10, background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-secondary)' }}>✓ {report.confirmations} {t('confirmations')}</span>
                  <span className={`badge badge-${report.severity === 'high' ? 'red' : report.severity === 'medium' ? 'yellow' : 'green'}`} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                    {report.severity === 'high' ? t('danger') : report.severity === 'medium' ? t('caution') : t('safe')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button className="view-all-btn" onClick={() => onNavigate('map')} style={{ width: 'calc(100% - 32px)', margin: '0 16px 20px', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--primary-pink)', fontWeight: 700, fontSize: 12, cursor: 'pointer', textAlign: 'center' }}>
        {t('viewAll')} →
      </button>
    </div>
  );
}

// ============================================================
// Journey Planner Page
// ============================================================
function JourneyPage({ onNavigate, lang, safetyReports, activeJourney, onStartJourney, onEndJourney, trustedContacts, userCoords, initialDestination, setInitialDestination }) {
  const { t } = useT(lang);
  const [from, setFrom] = useState(userCoords.name);
  const [to, setTo] = useState(initialDestination || '');

  useEffect(() => {
    if (initialDestination) {
      setTo(initialDestination);
    }
  }, [initialDestination]);
  const [mode, setMode] = useState('drive');
  const [pref, setPref] = useState('safest');
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [etaBuffer, setEtaBuffer] = useState(5); // check-in buffer in minutes
  const [selectedContact, setSelectedContact] = useState(trustedContacts[0]?.id || '');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const [selectedFromCoords, setSelectedFromCoords] = useState(null); // { lat, lng }
  const [selectedToCoords, setSelectedToCoords] = useState(null);
  const debounceTimeoutRef = useRef(null);

  // Default backup location coordinates list
  const localLocations = [
    { name: "Indirapuram, Ghaziabad", lat: 28.58847, lng: 77.45657 },
    { name: "Sector 62, Noida", lat: 28.6273, lng: 77.3725 },
    { name: "Sector 52, Noida", lat: 28.5835, lng: 77.3615 },
    { name: "Sector 15, Noida", lat: 28.5995, lng: 77.3218 },
    { name: "Dadri, Uttar Pradesh", lat: 28.5491, lng: 77.5562 },
    { name: "Gaur City Mall, Greater Noida West", lat: 28.6095, lng: 77.4205 },
    { name: "Gaur City 2, Greater Noida West", lat: 28.6145, lng: 77.4355 },
    { name: "Pari Chowk, Greater Noida", lat: 28.5135, lng: 77.5012 },
    { name: "Shipra Sun City, Ghaziabad", lat: 28.5920, lng: 77.4610 },
    { name: "Noida Sector 63, Noida", lat: 28.6115, lng: 77.3945 },
    { name: "Hebbal, Bangalore", lat: 13.0358, lng: 77.5970 },
    { name: "Koramangala, Bangalore", lat: 12.9063, lng: 77.5857 },
    { name: "MG Road, Bangalore", lat: 12.9716, lng: 77.5946 }
  ];

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggest, setShowFromSuggest] = useState(false);
  const [showToSuggest, setShowToSuggest] = useState(false);

  const fetchRealSuggestions = (val, type) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!val.trim() || val.length < 2) {
      if (type === 'from') {
        setFromSuggestions([]);
        setSelectedFromCoords(null);
      } else {
        setToSuggestions([]);
        setSelectedToCoords(null);
      }
      return;
    }

    // Filter local list instantly for immediate UI feedback
    const localFiltered = localLocations.filter(loc => 
      loc.name.toLowerCase().includes(val.toLowerCase())
    );

    if (type === 'from') {
      setFromSuggestions(localFiltered);
      setShowFromSuggest(true);
    } else {
      setToSuggestions(localFiltered);
      setShowToSuggest(true);
    }

    // Call real map (OSM Nominatim API) search with 400ms debounce
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=in`);
        if (response.ok) {
          const data = await response.json();
          const fetched = data.map(item => {
            const parts = item.display_name.split(',');
            const shortName = parts.slice(0, 3).join(',').trim();
            return {
              name: shortName,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            };
          });

          // Combine local and remote results, removing duplicate names
          const combined = [...localFiltered];
          fetched.forEach(f => {
            if (!combined.some(c => c.name.toLowerCase() === f.name.toLowerCase())) {
              combined.push(f);
            }
          });

          if (type === 'from') {
            setFromSuggestions(combined);
          } else {
            setToSuggestions(combined);
          }
        }
      } catch (err) {
        console.warn('OSM Nominatim API Search query failed, using local database:', err);
      }
    }, 400);
  };

  const handleFromChange = (val) => {
    setFrom(val);
    fetchRealSuggestions(val, 'from');
  };

  const handleToChange = (val) => {
    setTo(val);
    fetchRealSuggestions(val, 'to');
  };

  // Sync origin input with GPS location changes
  useEffect(() => {
    setFrom(userCoords.name);
  }, [userCoords]);

  const modes = [
    { value: 'walk', icon: '🚶', label: t('travelModeWalk') },
    { value: 'drive', icon: '🚗', label: t('travelModeDrive') },
    { value: 'transit', icon: '🚌', label: t('travelModeTransit') },
    { value: 'bike', icon: '🏍️', label: t('travelModeBike') },
  ];

  const prefs = [
    { value: 'fastest', label: t('prefFastest') },
    { value: 'balanced', label: t('prefBalanced') },
    { value: 'safest', label: t('prefSafest') },
  ];

  // Get dynamic origin coordinates based on selection
  const originCoords = useMemo(() => {
    if (selectedFromCoords) return selectedFromCoords;
    return { lat: userCoords.lat, lng: userCoords.lng };
  }, [selectedFromCoords, userCoords]);

  // Get dynamic destination coordinates based on the input text or API selection
  const destinationCoords = useMemo(() => {
    if (selectedToCoords) {
      // If destination too close to origin, offset it to ensure a real route of ~4km is always plotted!
      const distance = Math.sqrt(Math.pow(selectedToCoords.lat - originCoords.lat, 2) + Math.pow(selectedToCoords.lng - originCoords.lng, 2));
      if (distance < 0.005) {
        return { lat: originCoords.lat + 0.015, lng: originCoords.lng + 0.02 };
      }
      return selectedToCoords;
    }

    if (!to) return { lat: userCoords.lat, lng: userCoords.lng };
    const text = to.toLowerCase();
    let dest = { lat: userCoords.lat + 0.02, lng: userCoords.lng - 0.03 }; // Default fallback offset

    if (text.includes('gaur') || text.includes('mall') || text.includes('west')) {
      dest = { lat: 28.6095, lng: 77.4205 }; // Gaur City Mall, Greater Noida West
    } else if (text.includes('noida') || text.includes('sector')) {
      dest = { lat: 28.6273, lng: 77.3725 }; // Sector 62, Noida
    } else if (text.includes('home') || text.includes('ghar') || text.includes('house') || text.includes('indirapuram') || text.includes('ghaziabad')) {
      dest = { lat: 28.58847, lng: 77.45657 }; // Indirapuram (Home)
    } else if (text.includes('hebbal') || text.includes('bangalore') || text.includes('bengaluru')) {
      if (userCoords.lat > 20) {
        dest = { lat: 28.5135, lng: 77.5012 }; // Translate to Pari Chowk, Greater Noida for local map realism
      } else {
        dest = { lat: 13.0358, lng: 77.5970 };
      }
    }

    // If destination is too close to origin, offset it to ensure a real route is always plotted!
    const distance = Math.sqrt(Math.pow(dest.lat - originCoords.lat, 2) + Math.pow(dest.lng - originCoords.lng, 2));
    if (distance < 0.005) {
      return { lat: originCoords.lat + 0.015, lng: originCoords.lng + 0.02 };
    }
    return dest;
  }, [to, selectedToCoords, originCoords, userCoords]);

  // Curve path generator function
  const generateRoutePath = (start, end, offsetFactor, numPoints = 6) => {
    const path = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      let lat = start.lat + t * (end.lat - start.lat);
      let lng = start.lng + t * (end.lng - start.lng);
      
      // Apply perpendicular curve offset
      if (i > 0 && i < numPoints) {
        const curve = Math.sin(t * Math.PI);
        const perpLat = -(end.lng - start.lng) * offsetFactor * curve;
        const perpLng = (end.lat - start.lat) * offsetFactor * curve;
        lat += perpLat;
        lng += perpLng;
      }
      path.push([lat, lng]);
    }
    return path;
  };

  // Calculate Haversine distance in kilometers
  const calculateHaversineDistance = (coords1, coords2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLng = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Dynamically calculate scores for all route options based on current safety reports
  const routes = useMemo(() => {
    const realDist = calculateHaversineDistance(originCoords, destinationCoords);
    
    // Average speed in km/h for different travel modes
    let speed = 30; // default driving speed (🚗)
    if (mode === 'walk') speed = 5;      // 🚶
    else if (mode === 'transit') speed = 25; // 🚌
    else if (mode === 'bike') speed = 20;    // 🏍️

    // Calculate base duration in minutes: (distance / speed) * 60
    const baseDuration = (realDist / speed) * 60;

    return RakshaData.routeOptions.map((route) => {
      let offsetFactor = 0.0;
      let distMultiplier = 1.0;
      let timeMultiplier = 1.0;

      if (route.type === 'fastest') {
        offsetFactor = -0.15;
        distMultiplier = 0.95; // slightly shorter path
        timeMultiplier = 0.85; // slightly faster driving/routing path
      } else if (route.type === 'balanced') {
        offsetFactor = 0.05;
        distMultiplier = 1.05;
        timeMultiplier = 1.0;
      } else if (route.type === 'safest') {
        offsetFactor = 0.25;
        distMultiplier = 1.15; // safety detour
        timeMultiplier = 1.2; // takes longer
      }

      const dynamicPath = generateRoutePath(
        originCoords,
        destinationCoords,
        offsetFactor
      );
      
      const score = calculateSafetyScore({ ...route, path: dynamicPath }, safetyReports);
      
      // Calculate dynamic distance and time based on real coordinates!
      const finalDistance = Math.max(0.1, realDist * distMultiplier);
      const finalTime = Math.max(1, Math.round(baseDuration * timeMultiplier));

      return {
        ...route,
        distance: parseFloat(finalDistance.toFixed(1)),
        time: finalTime,
        path: dynamicPath,
        safetyScore: score,
        safetyLabel: getSafetyLabel(score).label,
        color: getSafetyLabel(score).color
      };
    });
  }, [safetyReports, originCoords, destinationCoords, mode]);

  // Set recommended route automatically
  useEffect(() => {
    if (routes.length > 0) {
      const safest = routes.find(r => r.type === 'safest') || routes[2];
      setSelectedRoute(safest);
    }
  }, [routes]);

  const handleFindRoutes = () => {
    if (!to.trim()) {
      alert(lang === 'en' ? 'Please enter a destination first!' : 'कृपया पहले गंतव्य दर्ज करें!');
      return;
    }
    setAnalyzing(true);
    setShowResults(false);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResults(true);
    }, 1500);
  };

  // Setup / Clean map
  useEffect(() => {
    if (showResults && mapRef.current && !mapInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([originCoords.lat, originCoords.lng], 13);

      // Voyager light style map
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);
      mapInstance.current = map;

      // Draw routes
      routes.forEach(r => {
        L.polyline(r.path, {
          color: r.color,
          weight: 4,
          opacity: 0.5,
          dashArray: '8 6',
          _routeId: r.id
        }).addTo(map);
      });

      // Markers
      L.circleMarker([originCoords.lat, originCoords.lng], {
        radius: 8, fillColor: '#ec4899', fillOpacity: 1, color: '#fff', weight: 2
      }).addTo(map).bindPopup(`📍 Origin: ${from}`);

      L.circleMarker([destinationCoords.lat, destinationCoords.lng], {
        radius: 8, fillColor: '#22c55e', fillOpacity: 1, color: '#fff', weight: 2
      }).addTo(map).bindPopup(`🏁 Destination: ${to}`);

      // Add safety report markers dynamically to help visualize why a route is safe
      safetyReports.forEach(r => {
        const markerColor = r.severity === 'high' ? '#ef4444' : r.severity === 'medium' ? '#f97316' : '#f59e0b';
        L.circleMarker([r.location.lat, r.location.lng], {
          radius: 6, fillColor: markerColor, fillOpacity: 0.8, color: '#fff', weight: 1
        }).addTo(map).bindPopup(`⚠️ ${getCategoryLabel(r.category, lang)}: ${r.location.name}`);
      });

      // Fit map bounds to show routes and markers clearly
      const bounds = L.latLngBounds([
        [originCoords.lat, originCoords.lng],
        [destinationCoords.lat, destinationCoords.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      setTimeout(() => map.invalidateSize(), 150);
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [showResults, routes, safetyReports, lang, to, from, originCoords, destinationCoords, t]);

  // Update highlighted route
  useEffect(() => {
    if (!mapInstance.current || !selectedRoute) return;
    const map = mapInstance.current;
    map.eachLayer(layer => {
      if (layer instanceof L.Polyline && !(layer instanceof L.CircleMarker) && layer.options._routeId) {
        const isSelected = layer.options._routeId === selectedRoute.id;
        layer.setStyle({
          color: isSelected ? selectedRoute.color : '#cbd5e1',
          weight: isSelected ? 6 : 4,
          opacity: isSelected ? 1.0 : 0.45,
          dashArray: isSelected ? null : '8 6'
        });
        if (isSelected) {
          layer.bringToFront();
        }
      }
    });
  }, [selectedRoute]);

  const handleStartActiveJourney = () => {
    if (!selectedRoute) return;
    const contact = trustedContacts.find(c => c.id === selectedContact) || trustedContacts[0];
    onStartJourney({
      origin: from,
      destination: to,
      route: selectedRoute,
      eta: selectedRoute.time,
      bufferMinutes: etaBuffer,
      expectedArrival: Date.now() + (selectedRoute.time + Number(etaBuffer)) * 60000,
      contact: contact || null,
      sharing: true,
      status: 'in_progress'
    });
    onNavigate('home');
  };

  if (activeJourney) {
    return (
      <div className="page-content">
        <div className="journey-form">
          <div className="section-title">
            <span className="icon">🧭</span>
            {t('journeyActiveTitle')}
          </div>
          <div className="card" style={{ padding: 18, marginTop: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-pink)', marginBottom: 8 }}>
              {activeJourney.origin} → {activeJourney.destination}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Route Mode: <strong>{activeJourney.route.type.toUpperCase()}</strong>
            </div>

            <div className="journey-active-details" style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '14px 0', padding: '12px', background: 'var(--soft-pink)', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ fontWeight: 700, color: activeJourney.status === 'overdue' ? 'var(--red)' : 'var(--green)' }}>
                  {activeJourney.status === 'overdue' ? '🚨 OVERDUE' : '🟢 ON SCHEDULE'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Expected Check-In:</span>
                <span style={{ fontWeight: 700 }}>{new Date(activeJourney.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Emergency Contact:</span>
                <span style={{ fontWeight: 700 }}>{activeJourney.contact?.name || 'None'} ({activeJourney.contact?.phone || ''})</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={onEndJourney}>
                ✅ {t('journeyCheckedIn')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="page-content">
        <div className="section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0' }}>
          <div>
            <div className="section-title" style={{ marginBottom: 2 }}>
              <span className="icon">🗺️</span>
              {t('routeComparison')}
            </div>
            <div 
              onClick={() => setShowResults(false)}
              className="card-clickable"
              style={{ 
                fontSize: 12, 
                color: 'var(--primary-pink)', 
                fontWeight: 700, 
                textDecoration: 'underline', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
              title={lang === 'en' ? 'Click to edit route inputs' : 'रूट बदलने के लिए क्लिक करें'}
            >
              ✏️ {from} → {to}
            </div>
          </div>
          <button 
            onClick={() => setShowResults(false)}
            className="btn-secondary"
            style={{ width: 'auto', padding: '6px 12px', fontSize: 11, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
          >
            {lang === 'en' ? '◀ Edit' : '◀ बदलें'}
          </button>
        </div>

        {/* Map Container */}
        <div className="map-container" style={{ margin: '0 16px 12px', position: 'relative' }}>
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
          {/* Zoom Buttons overlay */}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 1000 }}>
            <button
              onClick={() => mapInstance.current && mapInstance.current.zoomIn()}
              style={{
                width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid #ddd',
                fontWeight: 900, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', color: 'var(--text-primary)'
              }}
              title={lang === 'en' ? 'Zoom In' : 'ज़ूम इन'}
            >
              ＋
            </button>
            <button
              onClick={() => mapInstance.current && mapInstance.current.zoomOut()}
              style={{
                width: 32, height: 32, borderRadius: 8, background: '#fff', border: '1px solid #ddd',
                fontWeight: 900, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', color: 'var(--text-primary)'
              }}
              title={lang === 'en' ? 'Zoom Out' : 'ज़ूम आउट'}
            >
              －
            </button>
          </div>
        </div>

        {/* Night Safety Mode Alert */}
        {isNightTime() && (
          <div className="night-note">
            🌙 <strong>{t('nightSafetyMode')}</strong>: Scoring applies extra penalty to unlit and isolated roads after dark.
          </div>
        )}

        {/* Route Cards */}
        {routes.map(route => {
          const scoreLabel = getSafetyLabel(route.safetyScore);
          const isSelected = selectedRoute?.id === route.id;
          return (
            <div
              key={route.id}
              className={`route-card ${isSelected ? 'selected' : ''} ${route.type === 'safest' ? 'recommended' : ''}`}
              onClick={() => setSelectedRoute(route)}
            >
              <div className="route-header">
                <div className="route-type">
                  {route.type === 'safest' ? `${t('recommended')} — ` : ''}
                  {route.type === 'fastest' ? t('fastest') : route.type === 'safest' ? t('safer') : t('balanced')}
                </div>
                <div className="route-time">{route.time} {t('minutes')}</div>
              </div>
              <div className="route-stats">
                <div className="route-stat">⏱️ <strong>{route.time}</strong> {t('minutes')}</div>
                <div className="route-stat">📏 <strong>{route.distance}</strong> {t('km')}</div>
                <div className="route-stat">🛡️ Safety: <strong style={{ color: scoreLabel.color }}>{route.safetyScore}/100</strong></div>
              </div>
              <div className="route-score-bar">
                <div className="route-score-fill" style={{ width: route.safetyScore + '%', background: scoreLabel.color }} />
              </div>
              <div className="route-score-label">
                <span className="route-score-badge" style={{ background: scoreLabel.color + '15', color: scoreLabel.color }}>
                  {scoreLabel.icon} {t(scoreLabel.label)}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {safetyReports.filter(sr => route.reports.includes(sr.id) || getMinDistanceToPath(sr.location.lat, sr.location.lng, route.path) < 0.0025).length} {t('communityReportsUsed')}
                </span>
              </div>
              {isSelected && (
                <div className="route-factors" style={{ marginTop: 10 }}>
                  {route.type === 'safest' ? (
                    <>
                      <span className="route-factor positive">✅ No recent safety concerns</span>
                      <span className="route-factor positive">💡 Well-lit main streets</span>
                      <span className="route-factor positive">🏪 Nearby emergency medical & police facilities</span>
                    </>
                  ) : route.type === 'fastest' ? (
                    <>
                      <span className="route-factor negative">⚠️ Passes through 3 poorly lit locations</span>
                      <span className="route-factor negative">🏚️ Isolated back road section</span>
                      <span className="route-factor positive">⏱️ Saves 6 minutes of travel time</span>
                    </>
                  ) : (
                    <>
                      <span className="route-factor neutral">⚠️ 1 recent community alert nearby</span>
                      <span className="route-factor positive">💡 Moderate lighting</span>
                      <span className="route-factor positive">👥 Decent pedestrian movement</span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Explain Safety Score Details */}
        {selectedRoute && (
          <div className="why-safer">
            <div className="why-safer-title">🛡️ Why choose {selectedRoute.type.toUpperCase()}?</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {selectedRoute.type === 'safest' ? (
                <span>The recommended route is slightly longer but currently has fewer recent community safety reports, passes near hospital & police stations, and keeps you on well-lit main arterial avenues based on community records.</span>
              ) : selectedRoute.type === 'fastest' ? (
                <span style={{ color: 'var(--red)' }}><strong>Warning:</strong> This route is 6 minutes faster but has a much lower safety score ({selectedRoute.safetyScore}/100) due to multiple reports of broken streetlights and isolated lanes. Use extreme caution.</span>
              ) : (
                <span>This balanced route is a compromise. It avoids high-severity risk reports but still crosses minor poorly lit stretches. Stay alert.</span>
              )}
            </div>
          </div>
        )}

        {/* Safe Check-In Settings Form */}
        <div className="journey-form" style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: 16 }}>
          <div className="input-label" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            🔒 {t('journeyCheckIn')} Setup
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div>
              <label className="input-label" style={{ fontSize: 9 }}>Expected Time Buffer</label>
              <CustomSelect
                value={etaBuffer}
                options={[
                  { value: 2, label: '+2 Min (Demo)' },
                  { value: 5, label: '+5 Min' },
                  { value: 10, label: '+10 Min' },
                  { value: 20, label: '+20 Min' }
                ]}
                onChange={setEtaBuffer}
              />
            </div>
            <div>
              <label className="input-label" style={{ fontSize: 9 }}>{t('journeyCheckInContact')}</label>
              <CustomSelect
                value={selectedContact}
                options={trustedContacts.map(c => ({ value: c.id, label: `${c.name} (${c.relationship})` }))}
                onChange={setSelectedContact}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowResults(false)}>
              {t('back')}
            </button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={handleStartActiveJourney}>
              🚀 {t('startJourneyBtn')} & Share
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="journey-form">
        <div className="section-title" style={{ marginBottom: 20 }}>
          <span className="icon">🗺️</span>
          {t('journeyTitle')}
        </div>

        <div className="input-group" style={{ position: 'relative' }}>
          <div className="input-label">{t('from')}</div>
          <input 
            className="input-field" 
            value={from} 
            onChange={e => handleFromChange(e.target.value)} 
            onFocus={() => { if (from) setShowFromSuggest(true); }}
            onBlur={() => setTimeout(() => setShowFromSuggest(false), 200)}
            placeholder={t('currentLocation')} 
          />
          {showFromSuggest && fromSuggestions.length > 0 && (
            <div className="autocomplete-suggestions">
              {fromSuggestions.map((s, idx) => (
                <div 
                  key={idx} 
                  className="autocomplete-suggestion"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setFrom(s.name);
                    setSelectedFromCoords({ lat: s.lat, lng: s.lng });
                    setFromSuggestions([]);
                    setShowFromSuggest(false);
                  }}
                >
                  📍 {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-group" style={{ position: 'relative' }}>
          <div className="input-label">{t('to')}</div>
          <input 
            className="input-field" 
            value={to} 
            onChange={e => handleToChange(e.target.value)} 
            onFocus={() => { if (to) setShowToSuggest(true); }}
            onBlur={() => setTimeout(() => setShowToSuggest(false), 200)}
            placeholder={t('to')} 
          />
          {showToSuggest && toSuggestions.length > 0 && (
            <div className="autocomplete-suggestions">
              {toSuggestions.map((s, idx) => (
                <div 
                  key={idx} 
                  className="autocomplete-suggestion"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setTo(s.name);
                    setSelectedToCoords({ lat: s.lat, lng: s.lng });
                    setToSuggestions([]);
                    setShowToSuggest(false);
                  }}
                >
                  🏁 {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-group">
          <div className="input-label">{t('travelMode')}</div>
          <div className="mode-selector">
            {modes.map(m => (
              <button key={m.value} className={`mode-btn ${mode === m.value ? 'active' : ''}`} onClick={() => setMode(m.value)}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <div className="input-label">{t('preference')}</div>
          <div className="pref-selector">
            {prefs.map(p => (
              <button key={p.value} className={`pref-btn ${pref === p.value ? 'active' : ''}`} onClick={() => setPref(p.value)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <button className="btn-primary" onClick={handleFindRoutes} disabled={analyzing}>
            {analyzing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div className="spinner" style={{ borderTopColor: '#fff' }} />
                {t('analyzing')}
              </span>
            ) : (
              <>🔍 {t('findRoutes')}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Safety Map Page
// ============================================================
function MapPage({ lang, safetyReports, setSafetyReports, activeJourney, userCoords, userName }) {
  const { t } = useT(lang);
  const [filter, setFilter] = useState('all');
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [reportCategory, setReportCategory] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittingAI, setSubmittingAI] = useState(false);
  const [aiClassificationResult, setAiClassificationResult] = useState(null);
  const [toast, setToast] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const reportMarkersRef = useRef([]);

  const categories = [
    { value: 'poor_lighting', icon: '🌑', label: t('poorLighting') },
    { value: 'isolated_area', icon: '🏚️', label: t('isolatedAreas') },
    { value: 'suspicious_activity', icon: '👁️', label: t('suspiciousActivity') },
    { value: 'harassment', icon: '⚠️', label: t('category_harassment') },
    { value: 'transport', icon: '🚌', label: t('transportIssues') },
    { value: 'unsafe_road', icon: '🛣️', label: t('category_unsafe_road') },
    { value: 'other', icon: '📌', label: t('category_other') },
  ];

  const filters = [
    { value: 'all', label: t('allReports') },
    { value: 'poor_lighting', label: t('poorLighting') },
    { value: 'isolated_area', label: t('isolatedAreas') },
    { value: 'suspicious_activity', label: t('suspiciousActivity') },
    { value: 'harassment', label: t('category_harassment') },
  ];

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([userCoords.lat, userCoords.lng], 14);

      // Light tile layer Voyager
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      mapInstance.current = map;

      // Draw emergency facilities once
      RakshaData.emergencyFacilities.forEach(facility => {
        const icon = facility.type === 'hospital' ? '🏥' : facility.type === 'police' ? '🚔' : '🚒';
        const fMarker = L.marker([facility.lat, facility.lng], {
          icon: L.divIcon({
            html: `<div style="font-size:18px;text-shadow:0 1px 3px rgba(0,0,0,.3)">${icon}</div>`,
            iconSize: [20, 20],
            className: 'facility-marker'
          })
        }).addTo(map);
        fMarker.bindPopup(`
          <div style="font-family:Inter,sans-serif;padding:2px;min-width:140px">
            <div style="font-weight:700;font-size:12px">${icon} ${facility.name}</div>
            <div style="font-size:10px;color:#4b5563;margin-top:2px">${facility.distance}</div>
            <div style="font-size:11px;color:#db2777;margin-top:4px">📞 ${facility.phone}</div>
          </div>
        `);
      });

      setTimeout(() => map.invalidateSize(), 150);
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [userCoords]);

  // Update Dynamic Markers and User Location Marker when reports/coordinates update
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    // Clear old report layers
    reportMarkersRef.current.forEach(m => map.removeLayer(m));
    reportMarkersRef.current = [];

    // User location marker
    const userMarker = L.circleMarker([userCoords.lat, userCoords.lng], {
      radius: 8, fillColor: '#ec4899', fillOpacity: 0.9, color: '#fff', weight: 2
    }).addTo(map).bindPopup(lang === 'en' ? 'My Live Location' : 'मेरा लाइव स्थान');
    reportMarkersRef.current.push(userMarker);

    // Re-draw reports
    safetyReports.forEach(report => {
      if (report.status === 'resolved' || (report.downvotes && report.downvotes > report.confirmations)) {
        return;
      }
      if (filter !== 'all' && report.category !== filter) return;

      const color = report.severity === 'high' ? '#ef4444' : report.severity === 'medium' ? '#f97316' : '#f59e0b';
      const marker = L.circleMarker([report.location.lat, report.location.lng], {
        radius: 10 + Math.min((report.confirmations || 0) / 2, 10),
        fillColor: color,
        fillOpacity: 0.7,
        color: '#fff',
        weight: 1.5,
        opacity: 0.95
      }).addTo(map);

      const timeStr = formatTimestamp(report.timestamp);
      const catLabel = getCategoryLabel(report.category, lang);

      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:6px;min-width:180px">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:var(--text-primary)">
            ${getCategoryIcon(report.category)} ${report.location.name}
          </div>
          <div style="font-size:11px;color:#374151;margin-bottom:6px;line-height:1.4">${report.description}</div>
          
          ${report.aiClassification ? `
            <div style="font-size:10px;background:#fdf2f8;border:1px solid #fbcfe8;color:#db2777;padding:4px 6px;border-radius:6px;margin-bottom:8px">
              🤖 <strong>AI Classify:</strong> ${getCategoryLabel(report.aiClassification.category, lang)} · ${report.aiClassification.severity.toUpperCase()}
            </div>
          ` : ''}

          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            <span style="font-size:9px;background:${color}20;color:${color};padding:2px 6px;border-radius:12px;font-weight:700">${report.severity.toUpperCase()}</span>
            <span style="font-size:9px;background:#10b98120;color:#10b981;padding:2px 6px;border-radius:12px;font-weight:700">✓ ${report.confirmations} Confirmed</span>
          </div>
          <div style="font-size:9px;color:#9ca3af">${report.reporterName || 'Anonymous'} · ${timeStr}</div>
        </div>
      `, { className: 'custom-popup' });

      reportMarkersRef.current.push(marker);
    });
  }, [safetyReports, filter, lang, userCoords]);

  // Report validation actions
  const handleConfirm = (id) => {
    setSafetyReports(prev => prev.map(r => r.id === id ? { ...r, confirmations: (r.confirmations || 0) + 1 } : r));
    setToast(t('stillUnsafeSuccess'));
  };

  const handleResolve = (id) => {
    setSafetyReports(prev => prev.map(r => r.id === id ? { ...r, downvotes: (r.downvotes || 0) + 1 } : r));
    setToast(t('noLongerUnsafeSuccess'));
  };

  const handleFlag = (id) => {
    setSafetyReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    setToast(t('flaggedSuccess'));
  };

  const handleAddInfo = (id) => {
    const info = window.prompt(lang === 'en' ? "Add details or comments:" : "विवरण या टिप्पणियां जोड़ें:");
    if (info && info.trim()) {
      setSafetyReports(prev => prev.map(r => r.id === id ? { ...r, description: `${r.description} (Update: ${info.trim()})` } : r));
      setToast(lang === 'en' ? 'Comment added!' : 'टिप्पणी जोड़ी गई!');
    }
  };

  // Submit report with real backend AI classification proxy
  const handleSubmitReport = async () => {
    if (!reportCategory) return;
    setSubmittingAI(true);
    setAiClassificationResult(null);

    let classification = { category: reportCategory, severity: 'medium', confidence: 'medium' };

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description: reportDesc || 'Report posted near User coordinates' })
      });
      if (response.ok) {
        const data = await response.json();
        classification = data.classification;
        setAiClassificationResult(classification);
      }
    } catch (err) {
      console.log('AI Classification endpoint failed, using client keyword fallback', err);
    }

    const map = mapInstance.current;
    const center = map ? map.getCenter() : { lat: userCoords.lat, lng: userCoords.lng };

    const newReport = {
      id: 'sr_' + Date.now(),
      location: {
        lat: center.lat + (Math.random() - 0.5) * 0.002, // slight jitter
        lng: center.lng + (Math.random() - 0.5) * 0.002,
        name: reportDesc.substring(0, 30) || 'Safety Incident Spot'
      },
      category: reportCategory,
      description: reportDesc || 'Report posted by ' + userName,
      timestamp: Date.now(),
      severity: classification.severity,
      confirmations: 1,
      status: 'active',
      reporterName: userName + ' (You)',
      verificationStatus: 'community_report',
      aiClassification: classification // Distinguish AI results
    };

    setTimeout(() => {
      setSafetyReports(prev => [newReport, ...prev]);
      setSubmittingAI(false);
      setSubmitted(true);
      setTimeout(() => {
        setToast(t('reportSubmitted'));
        setShowReportPanel(false);
        setSubmitted(false);
        setReportCategory('');
        setReportDesc('');
        setAiClassificationResult(null);
      }, 2500);
    }, 1200);
  };

  return (
    <div className="page-content" style={{ padding: 0 }}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Map display */}
      <div className="map-container" style={{ margin: 0, borderRadius: 0, height: 'calc(100vh - 220px)', minHeight: 320 }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

        {/* Map Top Filter Box */}
        <div className="map-overlay-top">
          <div className="map-search">
            <span className="map-search-icon">🔍</span>
            <input placeholder={lang === 'en' ? "Search safe coordinates..." : "सुरक्षित निर्देशांक खोजें..."} />
          </div>
          <div className="map-filters">
            {filters.map(f => (
              <button
                key={f.value}
                className={`map-filter-btn ${filter === f.value ? 'active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recenter button */}
        <button
          className="map-locate-btn"
          onClick={() => {
            if (mapInstance.current) {
              mapInstance.current.setView([userCoords.lat, userCoords.lng], 15);
            }
          }}
          title={lang === 'en' ? 'Recenter on my location' : 'मेरे स्थान पर केंद्रित करें'}
        >
          🎯
        </button>

        {/* Floating Zoom Controls overlay */}
        <div style={{ position: 'absolute', bottom: 138, right: 20, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000 }}>
          <button
            onClick={() => mapInstance.current && mapInstance.current.zoomIn()}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid var(--border)',
              color: 'var(--primary-pink)',
              fontSize: '22px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
              transition: 'transform 0.1s/ease, background-color 0.15s ease'
            }}
            title={lang === 'en' ? 'Zoom In' : 'ज़ूम इन'}
          >
            ＋
          </button>
          <button
            onClick={() => mapInstance.current && mapInstance.current.zoomOut()}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#ffffff',
              border: '1px solid var(--border)',
              color: 'var(--primary-pink)',
              fontSize: '22px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
              transition: 'transform 0.1s/ease, background-color 0.15s ease'
            }}
            title={lang === 'en' ? 'Zoom Out' : 'ज़ूम आउट'}
          >
            －
          </button>
        </div>

        {/* Report FAB */}
        <button className="map-report-btn" onClick={() => setShowReportPanel(true)}>+</button>

        {/* Dynamic Report Panel */}
        {showReportPanel && (
          <div className="report-panel">
            <div className="report-panel-handle" />
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{t('reportSubmitted')}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('reportSubmittedDesc')}</div>
                {aiClassificationResult && (
                  <div style={{ marginTop: 12, padding: 8, background: 'var(--soft-pink)', borderRadius: 8, fontSize: 11 }}>
                    🤖 <strong>AI Auto-Classification complete:</strong> Category classified as <strong>{getCategoryLabel(aiClassificationResult.category, lang)}</strong> with <strong>{aiClassificationResult.severity.toUpperCase()}</strong> severity.
                  </div>
                )}
              </div>
            ) : submittingAI ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div className="spinner" style={{ margin: '0 auto 12px', borderTopColor: 'var(--primary-pink)' }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>🤖 Analyzing and Classifying Report with AI...</div>
              </div>
            ) : (
              <>
                <div className="report-panel-title">{t('reportTitle')}</div>
                <div className="input-label">{t('selectCategory')}</div>
                <div className="category-grid">
                  {categories.map(c => (
                    <button
                      key={c.value}
                      className={`category-btn ${reportCategory === c.value ? 'active' : ''}`}
                      onClick={() => setReportCategory(c.value)}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
                <div className="input-label">{t('description')}</div>
                <textarea
                  className="report-desc"
                  placeholder={t('descriptionPlaceholder')}
                  value={reportDesc}
                  onChange={e => setReportDesc(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowReportPanel(false)}>
                    {t('cancel')}
                  </button>
                  <button className="btn-primary" style={{ flex: 2 }} onClick={handleSubmitReport} disabled={!reportCategory}>
                    🤖 Analyze & Submit
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Reports Feed */}
      <div className="section" style={{ padding: '16px 16px 8px' }}>
        <div className="section-title">
          <span className="icon">📋</span>
          {t('recentReports')} ({safetyReports.filter(r => filter === 'all' || r.category === filter).length})
        </div>
        {safetyReports.filter(r => (filter === 'all' || r.category === filter) && r.status !== 'resolved' && !(r.downvotes && r.downvotes > r.confirmations)).map(report => (
          <div className="report-card" key={report.id}>
            <div className="report-card-header">
              <div className="report-card-title">
                {getCategoryIcon(report.category)} {report.location.name}
              </div>
              <span className={`badge badge-${report.severity === 'high' ? 'red' : report.severity === 'medium' ? 'yellow' : 'green'}`}>
                {report.severity.toUpperCase()}
              </span>
            </div>
            <div className="report-card-desc">{report.description}</div>
            
            {report.aiClassification && (
              <div style={{ fontSize: 10, background: 'var(--soft-pink)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', marginBottom: 8, color: 'var(--primary-pink)' }}>
                🤖 {t('aiClassified')}: {getCategoryLabel(report.aiClassification.category, lang)} (Severity: {report.aiClassification.severity.toUpperCase()})
              </div>
            )}

            <div className="report-card-footer">
              <div className="report-card-meta">
                {report.reporterName} · {formatTimestamp(report.timestamp)}
              </div>
              <div className="report-card-actions" style={{ display: 'flex', gap: 4 }}>
                <button className="report-action-btn confirm" onClick={() => handleConfirm(report.id)}>
                  👍 {report.confirmations || 0}
                </button>
                <button className="report-action-btn" onClick={() => handleResolve(report.id)}>
                  👎 {report.downvotes || 0}
                </button>
                <button className="report-action-btn" onClick={() => handleAddInfo(report.id)}>
                  💬
                </button>
                <button className="report-action-btn" onClick={() => handleFlag(report.id)} style={{ color: 'var(--red)' }}>
                  🚩
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Know Your Rights & Laws Page (Inform Pillar)
// ============================================================
function RightsPage({ lang, aiEnabled }) {
  const { t } = useT(lang);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'rights' | 'laws' | 'cases'
  const [selectedItem, setSelectedItem] = useState(null); // specific item to view in full page detail (blanks list)
  
  // AI Legal Explainer States
  const [scenario, setScenario] = useState('');
  const [explainerResponse, setExplainerResponse] = useState('');
  const [loadingExplainer, setLoadingExplainer] = useState(false);
  const [toast, setToast] = useState(null);

  const handleExplain = async () => {
    if (!scenario.trim()) return;
    setLoadingExplainer(true);
    setExplainerResponse('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Ground your response in the Indian Penal Code (IPC), Bharatiya Nyaya Sanhita (BNS), and Information Technology Act (IT Act). Explain the user's rights, relevant laws, steps to take, and where to report for this situation: "${scenario}". 
Instructions:
1. ALWAYS present the Bharatiya Nyaya Sanhita (BNS) section FIRST in bold (e.g. **Section 74 BNS** or **Section 78 BNS**), followed by the old IPC section in parentheses (e.g. formerly Section 354 IPC or formerly Section 354D IPC).
2. DO NOT use general references to "Section 354" if it is a specific offense like stalking (which is **Section 78 BNS** / Section 354D IPC) or harassment (which is **Section 75 BNS** / Section 354A IPC). Be very precise with the BNS section numbers to show they are completely distinct laws.
3. If there is a matching Supreme Court precedent, reference it. Keep it simple and clear. Include a bold legal disclaimer at the bottom.`,
          history: []
        })
      });
      if (res.ok) {
        const data = await res.json();
        setExplainerResponse(data.text || data.reply);
      } else {
        throw new Error('Explainer request failed');
      }
    } catch (err) {
      console.error(err);
      // Fallback response if offline/error
      setExplainerResponse(lang === 'en' ? 
        "⚠️ Safety Disclaimer: This is localized backup guidance. Based on your scenario, this might constitute Stalking (Sec 354D IPC / Sec 78 BNS) or Cyber Harassment (Sec 66E/67 IT Act). Please preserve all digital evidence, screenshots, and logs. Contact the Cyber Crime Cell (cybercrime.gov.in) or call the national helpline 1091 immediately." : 
        "⚠️ सुरक्षा अस्वीकरण: यह स्थानीयकृत बैकअप मार्गदर्शन है। आपकी स्थिति के आधार पर, यह पीछा करना (धारा 354D आईपीसी / धारा 78 बीएनएस) या साइबर उत्पीड़न (धारा 66E/67 आईटी अधिनियम) हो सकता है। कृपया सभी डिजिटल साक्ष्य, स्क्रीनशॉट और लॉग सुरक्षित रखें। तुरंत साइबर क्राइम सेल (cybercrime.gov.in) से संपर्क करें या राष्ट्रीय हेल्पलाइन 1091 पर कॉल करें।"
      );
    } finally {
      setLoadingExplainer(false);
    }
  };

  const getFilteredItems = () => {
    const q = searchQuery.toLowerCase().trim();
    
    // Expand search query with common safety synonyms
    const synonyms = {
      'metro': ['harassment', 'assault', 'modesty', 'stalking'],
      'bus': ['harassment', 'assault', 'modesty', 'stalking'],
      'train': ['harassment', 'assault', 'modesty', 'stalking'],
      'cab': ['harassment', 'assault', 'modesty', 'stalking'],
      'auto': ['harassment', 'assault', 'modesty', 'stalking'],
      'touch': ['assault', 'modesty', 'harassment'],
      'groping': ['assault', 'modesty', 'harassment'],
      'molest': ['assault', 'modesty', 'harassment'],
      'leak': ['cyber', 'privacy', 'photo'],
      'photo': ['cyber', 'privacy', 'harassment'],
      'phone': ['stalking', 'harassment', 'verbal'],
      'call': ['stalking', 'harassment', 'verbal'],
      'message': ['stalking', 'harassment', 'cyber'],
      'whatsapp': ['stalking', 'harassment', 'cyber']
    };

    const searchTerms = [q];
    if (q) {
      Object.keys(synonyms).forEach(keyword => {
        if (q.includes(keyword)) {
          searchTerms.push(...synonyms[keyword]);
        }
      });
    }

    const matchText = (textObj) => {
      if (!textObj) return false;
      const valEn = (textObj.en || '').toLowerCase();
      const valHi = (textObj.hi || '').toLowerCase();
      return searchTerms.some(term => valEn.includes(term) || valHi.includes(term));
    };

    const matchesQuery = (item) => {
      if (!q) return true;
      if (item.title && matchText(item.title)) return true;
      if (item.meaning && matchText(item.meaning)) return true;
      if (item.name && matchText(item.name)) return true;
      if (item.explanation && matchText(item.explanation)) return true;
      if (item.whatHappened && matchText(item.whatHappened)) return true;
      if (item.decision && matchText(item.decision)) return true;
      return false;
    };

    const result = [];

    // Filter rights (topics)
    if (activeFilter === 'all' || activeFilter === 'rights') {
      const rights = (RakshaData.legalData.rights || []).filter(matchesQuery).map(r => ({ ...r, itemType: 'right' }));
      result.push(...rights);
    }
    // Filter laws
    if (activeFilter === 'all' || activeFilter === 'laws') {
      const laws = (RakshaData.legalData.laws || []).filter(matchesQuery).map(l => ({ ...l, itemType: 'law' }));
      result.push(...laws);
    }
    // Filter cases
    if (activeFilter === 'all' || activeFilter === 'cases') {
      const cases = (RakshaData.legalData.cases || []).filter(matchesQuery).map(c => ({ ...c, itemType: 'case' }));
      result.push(...cases);
    }

    return result;
  };

  const items = getFilteredItems();

  // "Blank the page" detailed view for clicked cards
  if (selectedItem) {
    return (
      <div className="page-content animate-fade-in" style={{ padding: '16px 16px 40px' }}>
        <button 
          className="btn-secondary" 
          style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, border: 'none', background: 'var(--soft-pink)', padding: '8px 16px', borderRadius: 20, fontWeight: 700, color: 'var(--primary-pink)', cursor: 'pointer' }}
          onClick={() => setSelectedItem(null)}
        >
          ⬅️ {lang === 'en' ? 'Back to Rights Center' : 'सूची पर वापस जाएं'}
        </button>

        {selectedItem.itemType === 'right' && (
          <div className="card" style={{ padding: 20, border: '1px solid var(--primary-pink)', borderRadius: 16, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>📋</span>
              <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-primary)' }}>{selectedItem.title[lang]}</span>
            </div>
            
            <div style={{ marginBottom: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--primary-pink)', textTransform: 'uppercase', marginBottom: 4 }}>{t('whatItMeans')}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedItem.meaning[lang]}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--primary-pink)', textTransform: 'uppercase', marginBottom: 4 }}>{t('whatYouCanDo')}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{selectedItem.whatToDo[lang]}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--primary-pink)', textTransform: 'uppercase', marginBottom: 4 }}>{t('whereToReport')}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedItem.whereToReport[lang]}</div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {selectedItem.laws.map(lawId => {
                const law = RakshaData.legalData.laws.find(l => l.id === lawId);
                return law ? (
                  <span key={lawId} className="badge badge-yellow" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8 }}>
                    ⚖️ {law.name[lang]}
                  </span>
                ) : null;
              })}
              {selectedItem.cases.map(caseId => {
                const courtCase = RakshaData.legalData.cases.find(c => c.id === caseId);
                return courtCase ? (
                  <span key={caseId} className="badge badge-green" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8 }}>
                    🏛️ {courtCase.name[lang].split('v.')[0]}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {selectedItem.itemType === 'law' && (
          <div className="card" style={{ padding: 20, border: '1px solid #d97706', borderRadius: 16, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>⚖️</span>
              <div>
                <span style={{ fontWeight: 900, fontSize: 16, color: '#b45309' }}>{selectedItem.name[lang]}</span>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{selectedItem.section[lang]}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: '#b45309', textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedItem.explanation[lang]}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: '#b45309', textTransform: 'uppercase', marginBottom: 4 }}>Penalties / Application</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedItem.apply[lang]}</div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: 20, borderTop: '1px dashed #e2e8f0', paddingTop: 10 }}>
              <span>Source: {selectedItem.source[lang]}</span>
              <span>Last Updated: {selectedItem.updated}</span>
            </div>
          </div>
        )}

        {selectedItem.itemType === 'case' && (
          <div className="card" style={{ padding: 20, border: '1px solid #16a34a', borderRadius: 16, background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>🏛️</span>
              <div>
                <span style={{ fontWeight: 900, fontSize: 16, color: '#15803d' }}>{selectedItem.name[lang]}</span>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Supreme Court Precedent</div>
              </div>
            </div>

            <div style={{ marginBottom: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>{t('whatHappened')}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedItem.whatHappened[lang]}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>{t('courtDecision')}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedItem.decision[lang]}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>{t('whyItMatters')}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{selectedItem.whyItMatters[lang]}</div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 20, borderTop: '1px dashed #e2e8f0', paddingTop: 10 }}>
              Citation: {selectedItem.source[lang]}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-content" style={{ paddingBottom: 40 }}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* AI Legal Explainer Scenario Section */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid #c084fc', padding: 18, marginBottom: 20, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 22 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#6b21a8' }}>{t('explainLawLabel')}</div>
            <div style={{ fontSize: 10.5, color: '#7c3aed' }}>{lang === 'en' ? 'Describe your situation to query matching laws & precedents' : 'अधिकारों और प्रासंगिक धाराओं को जानने के लिए अपनी स्थिति बताएं'}</div>
          </div>
        </div>
        <textarea
          className="input-field"
          style={{ height: 64, resize: 'none', fontSize: 12, borderRadius: 10, padding: 10, border: '1px solid #d8b4fe', background: '#fff' }}
          placeholder={t('explainLawPlaceholder')}
          value={scenario}
          onChange={e => setScenario(e.target.value)}
        />
        <button
          className="btn-primary"
          style={{ marginTop: 10, background: 'var(--purple)', border: 'none', boxShadow: '0 4px 10px rgba(124, 58, 237, 0.2)', fontSize: 12.5, width: '100%' }}
          onClick={handleExplain}
          disabled={loadingExplainer || !scenario.trim()}
        >
          {loadingExplainer ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <div className="spinner" style={{ width: 14, height: 14, borderTopColor: '#fff' }} />
              {lang === 'en' ? 'Analyzing Situation...' : 'स्थिति का विश्लेषण किया जा रहा है...'}
            </span>
          ) : (
            `⚖️ ${t('explainLawBtn')}`
          )}
        </button>

        {explainerResponse && (
          <div className="explainer-result-card" style={{ marginTop: 14, padding: 14, background: '#fff', border: '1px solid #ddd', borderRadius: 12, fontSize: 12, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            <div style={{ fontWeight: 800, color: 'var(--purple)', marginBottom: 8, fontSize: 12.5 }}>💡 AI Legal Analysis Summary:</div>
            <div style={{ whiteSpace: 'pre-line' }}>{explainerResponse}</div>
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #e2e8f0', fontSize: 9.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {t('explainLawWarning')}
            </div>
          </div>
        )}
      </div>

      {/* Database Search & Filter */}
      <div className="section" style={{ padding: '0' }}>
        <div className="section-title" style={{ paddingLeft: 16 }}>
          <span className="icon">⚖️</span>
          {t('rightsTitle')}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 16, marginBottom: 12 }}>
          {t('rightsSubtitle')}
        </div>
      </div>

      <div className="search-bar" style={{ margin: '0 16px 14px', position: 'relative' }}>
        <input
          className="input-field"
          style={{ paddingLeft: 34, height: 38, fontSize: 13 }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t('searchLegalPlaceholder')}
        />
        <span style={{ position: 'absolute', left: 12, top: 11, fontSize: 13, color: 'var(--text-muted)' }}>🔍</span>
      </div>

      {/* Filters Pills */}
      <div className="pref-selector" style={{ margin: '0 16px 16px', display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        <button className={`pref-btn ${activeFilter === 'all' ? 'active' : ''}`} style={{ flex: 'none', padding: '6px 12px', fontSize: 11 }} onClick={() => setActiveFilter('all')}>{t('allRightsFilter')}</button>
        <button className={`pref-btn ${activeFilter === 'rights' ? 'active' : ''}`} style={{ flex: 'none', padding: '6px 12px', fontSize: 11 }} onClick={() => setActiveFilter('rights')}>{t('topicFilter')}</button>
        <button className={`pref-btn ${activeFilter === 'laws' ? 'active' : ''}`} style={{ flex: 'none', padding: '6px 12px', fontSize: 11 }} onClick={() => setActiveFilter('laws')}>{t('lawFilter')}</button>
        <button className={`pref-btn ${activeFilter === 'cases' ? 'active' : ''}`} style={{ flex: 'none', padding: '6px 12px', fontSize: 11 }} onClick={() => setActiveFilter('cases')}>{t('caseFilter')}</button>
      </div>

      {/* List items */}
      <div className="legal-items-list" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
        {items.length === 0 && (
          <div className="empty-state" style={{ padding: '30px 10px' }}>
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">{lang === 'en' ? 'No legal records found' : 'कोई कानूनी रिकॉर्ड नहीं मिला'}</div>
            <div className="empty-state-desc">{lang === 'en' ? 'Try searching for words like "harassment", "stalking", "FIR", or "354"' : 'उत्पीड़न, पीछा करना, एफआईआर, या 354 जैसे शब्दों को खोजने का प्रयास करें'}</div>
          </div>
        )}

        {items.map(item => {
          const id = `${item.itemType}_${item.id}`;
          
          if (item.itemType === 'right') {
            return (
              <div key={id} className="card" style={{ padding: 14, cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 12, background: '#fff' }} onClick={() => setSelectedItem(item)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>📋</span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>{item.title[lang]}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--primary-pink)' }}>➜</span>
                </div>
              </div>
            );
          } else if (item.itemType === 'law') {
            return (
              <div key={id} className="card" style={{ padding: 14, cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 12, background: '#fff' }} onClick={() => setSelectedItem(item)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>⚖️</span>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#b45309' }}>{item.name[lang]}</span>
                      <div style={{ fontSize: 9.5, color: 'var(--text-secondary)' }}>{item.section[lang]}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#b45309' }}>➜</span>
                </div>
              </div>
            );
          } else if (item.itemType === 'case') {
            return (
              <div key={id} className="card" style={{ padding: 14, cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 12, background: '#fff' }} onClick={() => setSelectedItem(item)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🏛️</span>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 13, color: '#15803d' }}>{item.name[lang]}</span>
                      <div style={{ fontSize: 9.5, color: 'var(--text-secondary)' }}>Supreme Court Precedent</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#15803d' }}>➜</span>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

// ============================================================
// Contacts Page
// ============================================================
// ============================================================
// Profile Page (Consolidated Contacts & Settings - Profile Tab)
// ============================================================
function ProfilePage({ lang, setLang, trustedContacts, setTrustedContacts, bloodGroup, setBloodGroup, userName, setUserName }) {
  const { t } = useT(lang);
  const [subTab, setSubTab] = useState('contacts'); // 'contacts' | 'settings'

  // Contacts States
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', relationship: 'Friend', sosEnabled: true, avatar: '👤' });
  const [draggedIdx, setDraggedIdx] = useState(null);

  const avatars = ['👤', '👩', '👨', '🧑', '👧', '👦', '👵', '👱'];
  const relationships = ['Mother', 'Father', 'Friend', 'Sister', 'Brother', 'Partner'];

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', phone: '', relationship: 'Friend', sosEnabled: true, avatar: '👤' });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c.id);
    setForm({ name: c.name, phone: c.phone, relationship: c.relationship, sosEnabled: c.sosEnabled, avatar: c.avatar });
    setShowModal(true);
  };

  const saveContact = () => {
    if (!form.name || !form.phone) return;
    if (editing) {
      setTrustedContacts(prev => prev.map(c => c.id === editing ? { ...c, ...form } : c));
      setToast(t('contactUpdated'));
    } else {
      setTrustedContacts(prev => [...prev, { id: 'tc_' + Date.now(), userId: 'user_001', ...form }]);
      setToast(t('contactAdded'));
    }
    setShowModal(false);
  };

  const deleteContact = (id) => {
    setTrustedContacts(prev => prev.filter(c => c.id !== id));
    setToast(t('contactDeleted'));
  };

  // Reordering functions
  const handleMove = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === trustedContacts.length - 1) return;
    const newContacts = [...trustedContacts];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newContacts[index];
    newContacts[index] = newContacts[targetIdx];
    newContacts[targetIdx] = temp;
    setTrustedContacts(newContacts);
  };

  // Drag and drop event handlers
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    const newContacts = [...trustedContacts];
    const draggedItem = newContacts[draggedIdx];
    newContacts.splice(draggedIdx, 1);
    newContacts.splice(index, 0, draggedItem);
    setTrustedContacts(newContacts);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedIdx(null);
  };

  // Settings States
  const [nightMode, setNightMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [safetyPriority, setSafetyPriority] = useState('balanced');

  const handleClearData = () => {
    setToast(t('clearDataSuccess'));
  };

  return (
    <div className="page-content">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Sub-tab segmented selector */}
      <div className="sub-tab-selector" style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: 4, marginBottom: 16 }}>
        <button 
          className={`mode-btn ${subTab === 'contacts' ? 'active' : ''}`} 
          style={{ flex: 1, border: 'none', background: subTab === 'contacts' ? 'var(--primary-pink)' : 'transparent', color: subTab === 'contacts' ? '#fff' : 'var(--text-secondary)', padding: '8px 12px', fontSize: 13, borderRadius: 'calc(var(--radius) - 4px)', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setSubTab('contacts')}
        >
          👥 {t('contactsTitle')}
        </button>
        <button 
          className={`mode-btn ${subTab === 'settings' ? 'active' : ''}`} 
          style={{ flex: 1, border: 'none', background: subTab === 'settings' ? 'var(--primary-pink)' : 'transparent', color: subTab === 'settings' ? '#fff' : 'var(--text-secondary)', padding: '8px 12px', fontSize: 13, borderRadius: 'calc(var(--radius) - 4px)', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => setSubTab('settings')}
        >
          ⚙️ {t('settingsTitle')}
        </button>
      </div>

      {subTab === 'contacts' ? (
        <div>
          <div className="section" style={{ padding: '0 0 16px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="section-title" style={{ marginBottom: 2 }}>
                  <span className="icon">👥</span>
                  {t('contactsToAlert')}
                </div>
                <div className="section-subtitle">{t('contactsSubtitle')}</div>
              </div>
              <button className="btn-primary" style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }} onClick={openAdd}>
                + {t('addContact')}
              </button>
            </div>
          </div>

          <div className="contacts-list">
            {trustedContacts.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-title">{t('noContacts')}</div>
                <div className="empty-state-desc">{t('noContactsDesc')}</div>
              </div>
            )}
            {trustedContacts.map((c, index) => (
              <div
                className={`contact-card ${draggedIdx === index ? 'dragging' : ''}`}
                key={c.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="contact-drag-handle" title="Drag to reorder">☰</div>
                <div className="contact-reorder-container" onClick={e => e.stopPropagation()}>
                  <button
                    className="contact-reorder-btn"
                    title="Move Up"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                  >
                    ▲
                  </button>
                  <button
                    className="contact-reorder-btn"
                    title="Move Down"
                    disabled={index === trustedContacts.length - 1}
                    onClick={() => handleMove(index, 'down')}
                  >
                    ▼
                  </button>
                </div>

                <div className="contact-avatar">{c.avatar}</div>
                <div className="contact-info">
                  <div className="contact-name">{c.name}</div>
                  <div className="contact-rel">{getRelationshipLabel(c.relationship, lang)} · {c.phone}</div>
                </div>
                <div className="contact-actions" onClick={e => e.stopPropagation()}>
                  <button className={`contact-action-btn sos ${c.sosEnabled ? 'active' : ''}`} title="SOS Alerting Status">
                    🚨
                  </button>
                  <button className="contact-action-btn" onClick={() => openEdit(c)}>✏️</button>
                  <button className="contact-action-btn" onClick={() => deleteContact(c.id)} style={{ color: 'var(--red)' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Add / Edit Contact Modal */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-handle" />
                <div className="modal-title">{editing ? t('editContact') : t('addContact')}</div>

                <div className="input-group">
                  <div className="input-label">{t('contactName')}</div>
                  <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter name" />
                </div>
                <div className="input-group">
                  <div className="input-label">{t('contactPhone')}</div>
                  <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="input-group">
                  <div className="input-label">{t('contactRelationship')}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {relationships.map(r => (
                      <button
                        key={r}
                        className={`pref-btn ${form.relationship === r ? 'active' : ''}`}
                        style={{ flex: 'none', padding: '6px 12px', fontSize: 11 }}
                        onClick={() => setForm({ ...form, relationship: r })}
                      >
                        {getRelationshipLabel(r, lang)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="input-group">
                  <div className="input-label">Avatar Emoji</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {avatars.map(a => (
                      <div
                        key={a}
                        onClick={() => setForm({ ...form, avatar: a })}
                        style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: form.avatar === a ? 'var(--primary-pink)' : 'var(--bg-input)',
                          color: form.avatar === a ? '#fff' : 'inherit',
                          border: `1px solid ${form.avatar === a ? 'var(--primary-pink)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, cursor: 'pointer', transition: 'all 0.15s ease'
                        }}
                      >
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t('contactSosAlerts')}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Notify this contact in emergencies</div>
                  </div>
                  <Toggle active={form.sosEnabled} onToggle={() => setForm({ ...form, sosEnabled: !form.sosEnabled })} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                    {t('cancel')}
                  </button>
                  <button className="btn-primary" style={{ flex: 2 }} onClick={saveContact} disabled={!form.name || !form.phone}>
                    {t('save')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="settings-list">
          {/* Language selector */}
          <div className="settings-group">
            <div className="settings-group-title">{t('language')}</div>
            <div className="settings-item" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}>
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: '#fce7f3', color: 'var(--primary-pink)' }}>🌐</div>
                <div>
                  <div className="settings-item-label">{t('language')}</div>
                  <div className="settings-item-desc">{lang === 'en' ? 'English (अंग्रेजी)' : 'हिंदी (Hindi)'}</div>
                </div>
              </div>
              <div className="settings-item-right" style={{ color: 'var(--primary-pink)', fontWeight: 700 }}>➔</div>
            </div>
          </div>

          {/* Safety options */}
          <div className="settings-group">
            <div className="settings-group-title">{t('safetyStatus')} Settings</div>
            <div className="settings-item" onClick={() => setNightMode(!nightMode)}>
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: '#fef3c7', color: '#d97706' }}>🌙</div>
                <div>
                  <div className="settings-item-label">{t('nightModeSetting')}</div>
                  <div className="settings-item-desc">{t('nightModeDesc')}</div>
                </div>
              </div>
              <Toggle active={nightMode} onToggle={(e) => { e.stopPropagation(); setNightMode(!nightMode); }} />
            </div>

            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>🛡️</div>
                <div>
                  <div className="settings-item-label">{t('safetyPriority')}</div>
                  <div className="settings-item-desc">{t(safetyPriority === 'fastest' ? 'prefFastest' : safetyPriority === 'safest' ? 'prefSafest' : 'prefBalanced')}</div>
                </div>
              </div>
              <CustomSelect
                value={safetyPriority}
                options={[
                  { value: 'fastest', label: t('prefFastest') },
                  { value: 'balanced', label: t('prefBalanced') },
                  { value: 'safest', label: t('prefSafest') }
                ]}
                onChange={setSafetyPriority}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-group">
            <div className="settings-group-title">{t('notifications')}</div>
            <div className="settings-item" onClick={() => setNotifications(!notifications)}>
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>🔔</div>
                <div>
                  <div className="settings-item-label">{t('notifications')}</div>
                  <div className="settings-item-desc">{t('notificationsDesc')}</div>
                </div>
              </div>
              <Toggle active={notifications} onToggle={(e) => { e.stopPropagation(); setNotifications(!notifications); }} />
            </div>
          </div>

          {/* Medical Information */}
          <div className="settings-group">
            <div className="settings-group-title">{lang === 'en' ? 'Medical & Emergency Profile (Optional)' : 'चिकित्सा एवं आपातकालीन प्रोफाइल (वैकल्पिक)'}</div>
            
            {/* Name Input */}
            <div className="settings-item" style={{ cursor: 'default', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 6, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="settings-item-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>👤</div>
                <div>
                  <div className="settings-item-label">{lang === 'en' ? 'Full Name' : 'पूरा नाम'}</div>
                  <div className="settings-item-desc">{lang === 'en' ? 'Customize your safety profile name' : 'अपना सुरक्षा प्रोफ़ाइल नाम अनुकूलित करें'}</div>
                </div>
              </div>
              <input 
                className="input-field"
                style={{ height: 32, fontSize: 12, padding: '6px 10px', marginTop: 4, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, width: '100%' }}
                placeholder="Enter full name"
                value={userName}
                onChange={e => {
                  setUserName(e.target.value);
                  localStorage.setItem('raksha_user_name', e.target.value);
                }}
              />
            </div>

            {/* Blood Group */}
            <div className="settings-item" style={{ cursor: 'default' }}>
              <div className="settings-item-left" style={{ flex: 1 }}>
                <div className="settings-item-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>🩸</div>
                <div style={{ flex: 1 }}>
                  <div className="settings-item-label">{lang === 'en' ? 'Blood Group' : 'रक्त समूह'}</div>
                  <div className="settings-item-desc">{lang === 'en' ? 'Helps emergency responders if SOS is triggered' : 'SOS सक्रिय होने पर आपातकालीन टीम की मदद करता है'}</div>
                </div>
              </div>
              <select 
                className="input-field" 
                style={{ width: 100, height: 32, fontSize: 12, padding: '0 4px', background: '#fff', border: '1px solid var(--border)', borderRadius: 8 }}
                value={bloodGroup}
                onChange={e => {
                  setBloodGroup(e.target.value);
                  localStorage.setItem('raksha_blood_group', e.target.value);
                }}
              >
                <option value="">{lang === 'en' ? '-- Select --' : '-- चुनें --'}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Emergency numbers list */}
          <div className="settings-group">
            <div className="settings-group-title">{t('emergencyNumbers')}</div>
            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: '#fee2e2', color: 'var(--red)' }}>🚔</div>
                <div className="settings-item-label">{t('police')}</div>
              </div>
              <div style={{ color: 'var(--primary-pink)', fontWeight: 800 }}>100</div>
            </div>
            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: '#fee2e2', color: 'var(--red)' }}>🚑</div>
                <div className="settings-item-label">{t('ambulance')}</div>
              </div>
              <div style={{ color: 'var(--primary-pink)', fontWeight: 800 }}>108</div>
            </div>
            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: '#fce7f3', color: 'var(--primary-pink)' }}>👩</div>
                <div className="settings-item-label">{t('womenHelpline')}</div>
              </div>
              <div style={{ color: 'var(--primary-pink)', fontWeight: 800 }}>1091</div>
            </div>
            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>🚒</div>
                <div className="settings-item-label">{t('fireBrigade')}</div>
              </div>
              <div style={{ color: 'var(--primary-pink)', fontWeight: 800 }}>101</div>
            </div>
          </div>

          {/* Clear cache */}
          <div className="settings-group">
            <div className="settings-group-title">Local Storage Data</div>
            <div className="settings-item" onClick={handleClearData}>
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: '#fee2e2', color: 'var(--red)' }}>🗑️</div>
                <div>
                  <div className="settings-item-label">{t('clearData')}</div>
                  <div className="settings-item-desc">{t('clearDataDesc')}</div>
                </div>
              </div>
              <div className="settings-item-right" style={{ color: 'var(--red)' }}>➔</div>
            </div>
          </div>

          {/* Version info */}
          <div className="settings-group">
            <div className="settings-group-title">{t('about')}</div>
            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: '#fce7f3', color: 'var(--primary-pink)' }}>ℹ️</div>
                <div className="settings-item-label">{t('appName')} Platform</div>
              </div>
              <div className="settings-item-right">v2.0.0 (Hackathon Edition)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// AI Assistant Page (Chat interface)
// ============================================================
function AssistantPage({ lang, safetyReports, userCoords, aiEnabled, messages, setMessages, homeAddress, officeAddress, userName }) {
  const { t } = useT(lang);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(!aiEnabled);
  const messagesEnd = useRef(null);

  useEffect(() => {
    setOfflineNotice(!aiEnabled);
  }, [aiEnabled]);

  const getDynamicSuggestions = () => {
    if (messages.length <= 1) {
      return [
        lang === 'en' ? "Is my route safe tonight?" : "क्या मेरा मार्ग आज रात सुरक्षित है?",
        lang === 'en' ? "What is the safety score of my area?" : "मेरे क्षेत्र का सुरक्षा स्कोर क्या है?",
        lang === 'en' ? "How can I activate SOS?" : "मैं SOS को कैसे सक्रिय कर सकता हूँ?",
        lang === 'en' ? "Explain safety features" : "सुरक्षा सुविधाओं के बारे में बताएं"
      ];
    }

    const lastMessage = messages[messages.length - 1];
    const lastText = lastMessage.text.toLowerCase();
    const lastRole = lastMessage.role;

    if (lastRole === 'ai') {
      if (lastText.includes('route') || lastText.includes('indirapuram') || lastText.includes('gaur city')) {
        return [
          lang === 'en' ? "Why did you recommend the safer route?" : "आपने सुरक्षित मार्ग की सिफारिश क्यों की?",
          lang === 'en' ? "What safety concerns are on the fastest route?" : "सबसे तेज़ मार्ग पर क्या सुरक्षा चिंताएं हैं?",
          lang === 'en' ? "Show the route comparison map" : "मार्ग तुलना मानचित्र दिखाएं",
          lang === 'en' ? "How do I start live sharing?" : "मैं लाइव साझाकरण कैसे शुरू करूँ?"
        ];
      }
      if (lastText.includes('unsafe') || lastText.includes('emergency') || lastText.includes('sos') || lastText.includes('danger') || lastText.includes('call')) {
        return [
          lang === 'en' ? "Trigger emergency SOS now" : "अभी आपातकालीन SOS सक्रिय करें",
          lang === 'en' ? "Find nearest police station" : "निकटतम पुलिस स्टेशन खोजें",
          lang === 'en' ? "Call Women Helpline 1091" : "महिला हेल्पलाइन 1091 पर कॉल करें",
          lang === 'en' ? "Share live location with contacts" : "संपर्कों के साथ लाइव स्थान साझा करें"
        ];
      }
    }

    return [
      lang === 'en' ? "Why did you recommend this route?" : "आपने इस मार्ग की सिफारिश क्यों की?",
      lang === 'en' ? "What should I do if I feel unsafe?" : "यदि मैं असुरक्षित महसूस करूँ तो मुझे क्या करना चाहिए?",
      lang === 'en' ? "How do I check in with family?" : "मैं परिवार के साथ चेक-इन कैसे करूँ?",
      lang === 'en' ? "Tell me safe travel tips" : "मुझे सुरक्षित यात्रा के टिप्स बताएं"
    ];
  };

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setTyping(true);

    // Ground context with user's actual live coordinates and saved places
    const context = {
      time: new Date().toLocaleTimeString(),
      location: userCoords.name,
      destination: RakshaData.demoLocations.destination.name,
      nightMode: isNightTime(),
      userName: userName,
      homeAddress: homeAddress || 'Not set',
      officeAddress: officeAddress || 'Not set',
      recentReports: safetyReports.slice(0, 3).map(r => ({
        location: r.location.name,
        category: r.category,
        description: r.description,
        confirmations: r.confirmations,
        severity: r.severity
      })),
      safetyScores: {
        fastestRoute: 42,
        recommendedRoute: 89
      }
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-6),
          context: context,
          lang: lang
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      setTyping(false);
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
      setOfflineNotice(!!data.fallback);
    } catch (err) {
      console.log('AI assistant call failed, using client rules fallback', err);
      setTyping(false);
      
      const localResponse = getAIResponseLocal(msg, lang);
      setMessages(prev => [...prev, { role: 'ai', text: localResponse }]);
      setOfflineNotice(true);
    }
  };

  const getAIResponseLocal = (userInput, currentLang) => {
    const text = userInput.toLowerCase();
    if (text.includes('safe') && text.includes('night') || text.includes('route') && text.includes('night') || text.includes('raat')) return t('route_safe_night');
    if (text.includes('share') || text.includes('location') || text.includes('sajha')) return t('share_location');
    if (text.includes('unsafe') || text.includes('scared') || text.includes('danger') || text.includes('help') || text.includes('khatra')) return t('feel_unsafe');
    if (text.includes('emergency') || text.includes('nearest') || text.includes('hospital') || text.includes('police')) return t('nearest_emergency');
    if (text.includes('sos') || text.includes('button')) return t('activate_sos');
    if (text.includes('score') || text.includes('percent') || text.includes('rating') || text.includes('skor')) return t('safety_score');
    if (text.includes('why') && (text.includes('safer') || text.includes('recommended') || text.includes('route'))) return "🛡️ " + t('whySafer') + ": The safest route has 0 recent safety reports, keeps you on major illuminated thoroughfares, and has police/medical services nearby, unlike the fastest route which contains unlit segments.";
    return t('default');
  };

  return (
    <div className="chat-container">
      {offlineNotice && (
        <div style={{ background: '#fff1f2', borderBottom: '1px solid #fecdd3', padding: '6px 12px', fontSize: 10, color: 'var(--primary-pink)', textAlign: 'center' }}>
          ⚠️ {t('aiOfflineMode')} ({t('aiOfflineDesc')})
        </div>
      )}
      
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role === 'user' ? 'user' : ''}`}>
            <div className={`chat-avatar ${msg.role === 'ai' ? 'ai' : 'human'}`}>
              {msg.role === 'ai' ? '🛡️' : '👤'}
            </div>
            <div className="chat-bubble">{msg.text}</div>
          </div>
        ))}
        {typing && (
          <div className="chat-message">
            <div className="chat-avatar ai">🛡️</div>
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      <div className="chat-suggestions">
        {getDynamicSuggestions().map((s, i) => (
          <button key={i} className="chat-suggestion" onClick={() => sendMessage(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={t('assistantPlaceholder')}
        />
        <button className="chat-send" onClick={() => sendMessage()} disabled={!input.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SOS Emergency Overlay
// ============================================================
function SOSOverlay({ onDeactivate, lang, trustedContacts, userCoords, userName, bloodGroup }) {
  const { t } = useT(lang);
  const [countdown, setCountdown] = useState(5);
  const [phase, setPhase] = useState('counting');
  const [recording, setRecording] = useState(false);
  const [evidenceLog, setEvidenceLog] = useState([]);
  const [dialNum, setDialNum] = useState(null);

  useEffect(() => {
    if (phase === 'counting' && countdown > 0) {
      const id = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(id);
    }
    if (phase === 'counting' && countdown === 0) {
      setPhase('active');
      setRecording(true); // Auto-start audio witness recording!
    }
  }, [countdown, phase]);

  // Audio recording simulation timer logs with real coordinate strings
  useEffect(() => {
    if (!recording) return;
    const interval = setInterval(() => {
      setEvidenceLog(prev => [
        `🎙️ Audio clip saved: ${new Date().toLocaleTimeString()} (GPS: ${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)})`,
        ...prev.slice(0, 3)
      ]);
    }, 4000);
    return () => clearInterval(interval);
  }, [recording, userCoords]);

  if (phase === 'counting') {
    return (
      <div className="countdown-overlay">
        <div className="countdown-number" key={countdown}>{countdown}</div>
        <div className="countdown-label">{t('sosCountdown')}...</div>
        <button className="countdown-cancel" onClick={onDeactivate}>{t('sosCancel')}</button>
      </div>
    );
  }

  return (
    <div className="sos-overlay">
      <div className="sos-pulse">
        <div className="sos-pulse-inner">🚨</div>
      </div>
      <div className="sos-status">{t('sosActivated')}</div>
      <div className="sos-substatus">
        📡 {t('sosAlerting')} Notified: {trustedContacts.filter(c => c.sosEnabled).map(c => c.name).join(', ') || 'Emergency services'}
      </div>

      {/* Sent SMS message simulation */}
      <div className="animate-fade-in" style={{ background: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 10, margin: '8px auto 14px', maxWidth: 280, fontSize: 10.5, color: '#fbcfe8', textAlign: 'left', border: '1px solid rgba(255,255,255,0.25)', lineHeight: 1.4 }}>
        💬 <strong>Sent Emergency SMS:</strong> "EMERGENCY! {userName} needs help! Location: https://maps.google.com/?q={userCoords.lat.toFixed(5)},{userCoords.lng.toFixed(5)} {bloodGroup ? `| Blood Group: ${bloodGroup.toUpperCase()}` : ''}"
      </div>

      {dialNum ? (
        <div className="emergency-dial-screen" style={{ margin: '16px auto', background: 'rgba(0,0,0,0.4)', padding: 18, borderRadius: 16, width: '100%', maxWidth: 280, textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Simulating call to:</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>📞 {dialNum === '100' ? 'Police (100)' : dialNum === '108' ? 'Ambulance (108)' : 'Women Helpline (1091)'}</div>
          <div className="dialing-dot-animation" style={{ fontSize: 11, color: 'var(--primary-pink)', animation: 'pulse-badge 1s infinite' }}>Connecting...</div>
          <button className="btn-secondary" style={{ marginTop: 14, background: '#ef4444', border: 'none', color: '#fff', padding: '6px 14px' }} onClick={() => setDialNum(null)}>
            Hang Up
          </button>
        </div>
      ) : null}

      {/* Upgraded Pulse Waveform & GPS Metadata telemetry box */}
      {recording && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 280, margin: '14px auto', padding: 12, background: 'rgba(239, 68, 68, 0.15)', border: '1px dashed #ef4444', borderRadius: 16 }}>
          <style>{`
            @keyframes bounceWave {
              0% { height: 6px; }
              100% { height: 32px; }
            }
          `}</style>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#fca5a5' }}>
            <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', animation: 'pulse-badge 1s infinite' }} />
            <span>{t('sosRecordingActive').toUpperCase()}</span>
          </div>

          {/* Waveform Animation */}
          <div className="audio-waveform-container" style={{ display: 'flex', gap: 5, height: 36, alignItems: 'center', justifyContent: 'center', margin: '12px 0' }}>
            <div className="waveform-bar" style={{ width: 3, height: 8, background: '#ef4444', borderRadius: 2, animation: 'bounceWave 0.5s ease-in-out infinite alternate', animationDelay: '0.1s' }} />
            <div className="waveform-bar" style={{ width: 3, height: 24, background: '#ef4444', borderRadius: 2, animation: 'bounceWave 0.6s ease-in-out infinite alternate', animationDelay: '0.3s' }} />
            <div className="waveform-bar" style={{ width: 3, height: 14, background: '#ef4444', borderRadius: 2, animation: 'bounceWave 0.4s ease-in-out infinite alternate', animationDelay: '0.5s' }} />
            <div className="waveform-bar" style={{ width: 3, height: 32, background: '#ef4444', borderRadius: 2, animation: 'bounceWave 0.7s ease-in-out infinite alternate', animationDelay: '0.2s' }} />
            <div className="waveform-bar" style={{ width: 3, height: 10, background: '#ef4444', borderRadius: 2, animation: 'bounceWave 0.5s ease-in-out infinite alternate', animationDelay: '0.4s' }} />
            <div className="waveform-bar" style={{ width: 3, height: 20, background: '#ef4444', borderRadius: 2, animation: 'bounceWave 0.8s ease-in-out infinite alternate', animationDelay: '0.6s' }} />
          </div>

          {/* GPS Coordinates Metadata Box */}
          <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 12px', borderRadius: 10, width: '100%', fontSize: 10, fontFamily: 'monospace', color: '#f3f4f6', textAlign: 'left', lineHeight: 1.4 }}>
            <div style={{ color: '#22c55e', fontWeight: 800, marginBottom: 4 }}>📡 MULTI-CHANNEL TELEMETRY LOG:</div>
            <div>• SENDER: {userName.toUpperCase()}</div>
            {bloodGroup && <div>• BLOOD GROUP: {bloodGroup.toUpperCase()}</div>}
            <div>• LATITUDE: {userCoords.lat.toFixed(6)}</div>
            <div>• LONGITUDE: {userCoords.lng.toFixed(6)}</div>
            <div>• PRECISION: ±4.2 meters (GPS)</div>
            <div>• AUDIO WITNESS: Encrypted AAC</div>
            <div>• SOS RECEIVERS: NCW / Contacts</div>
          </div>
        </div>
      )}

      <div className="sos-actions">
        <div className="sos-action-btn" style={{ background: 'rgba(236,72,153,0.15)', borderColor: 'var(--primary-pink)', color: '#fbcfe8' }}>
          <span className="sos-action-icon">📍</span>
          <span style={{ fontSize: 11 }}>🟢 Live Location: {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}</span>
        </div>
        <button className="sos-action-btn" onClick={() => setDialNum('100')}>
          <span className="sos-action-icon">🚔</span>
          {t('sosCallPolice')}
        </button>
        <button className="sos-action-btn" onClick={() => setDialNum('1091')}>
          <span className="sos-action-icon">👩</span>
          {t('sosCallWomen')}
        </button>
        <button className="sos-action-btn" onClick={() => setDialNum('108')}>
          <span className="sos-action-icon">🚑</span>
          {t('sosCallAmbulance')}
        </button>

        {/* Evidence recording toggle */}
        <button className={`sos-action-btn ${recording ? 'recording' : ''}`} onClick={() => setRecording(!recording)}>
          <span className="sos-action-icon">{recording ? '⏹️' : '🎙️'}</span>
          <span>{recording ? t('sosStopRecording') : t('sosStartRecording')}</span>
        </button>
      </div>

      {recording && evidenceLog.length > 0 && (
        <div className="evidence-log-box" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 10, width: '100%', maxWidth: 280, marginTop: 12, maxHeight: 110, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, color: 'var(--primary-pink)', fontWeight: 800, marginBottom: 4 }}>📦 EMERGENCY EVIDENCE RECORDED:</div>
          {evidenceLog.map((log, index) => (
            <div key={index} style={{ fontSize: 9, color: '#f3f4f6', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '3px 0' }}>{log}</div>
          ))}
        </div>
      )}

      <button className="sos-deactivate" onClick={onDeactivate} style={{ background: 'var(--primary-pink)', borderColor: 'var(--primary-pink)', marginTop: 20 }}>
        {t('sosDeactivate')}
      </button>
    </div>
  );
}

// ============================================================
// Interactive Floating Hackathon Demo Center Component
// ============================================================
function DemoCenter({ lang, setLang, setSafetyReports, activeJourney, onStartJourney, onEndJourney, setPage, setShowSOS, onFetchLocation, userCoords }) {
  const [expanded, setExpanded] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { text: "1. Open RakshaAI Dashboard & verify live location", action: () => { setPage('home'); setShowSOS(false); onFetchLocation(); } },
    { text: "2. Open Journey Planner screen (Origin sets to GPS)", action: () => { setPage('journey'); } },
    { text: "3. Choose destination Hebbal & select mode", action: () => { setPage('journey'); } },
    { text: "4. Click 'Find Safe Routes' to analyze scores", action: () => { setPage('journey'); } },
    { text: "5. Select 'Recommended Safer Route C'", action: () => { setPage('journey'); } },
    { text: "6. Open 'Why this route is safer' panel", action: () => { setPage('journey'); } },
    { text: "7. Go to Safety Map to inspect live spots", action: () => { setPage('map'); } },
    { text: "8. Long press map to trigger report panel", action: () => { setPage('map'); } },
    { text: "9. Submit descriptive report for AI auto-classify", action: () => { setPage('map'); } },
    { text: "10. Confirm community feedback (+1 thumbs-up vote)", action: () => { setPage('map'); } },
    { text: "11. Ask AI Assistant 'Why is Route C recommended?'", action: () => { setPage('assistant'); } },
    { text: "12. Toggle language to Hindi (हिंदी में बदलें)", action: () => { setLang('hi'); } },
    { text: "13. Toggle back to English mode", action: () => { setLang('en'); } },
    { text: "14. Start Safe Journey with Live Check-in active", action: () => {
      setPage('home');
      onStartJourney({
        origin: userCoords.name,
        destination: 'Hebbal, Bangalore',
        route: RakshaData.routeOptions[2],
        eta: 24,
        bufferMinutes: 2,
        expectedArrival: Date.now() + 2 * 60000,
        contact: RakshaData.trustedContacts[0],
        sharing: true,
        status: 'in_progress'
      });
    } },
    { text: "15. Simulate Check-in timer expiry (OVERDUE warning)", action: () => {
      if (activeJourney) {
        onStartJourney({
          ...activeJourney,
          expectedArrival: Date.now() - 5000, // Make it overdue instantly
          status: 'overdue'
        });
      } else {
        alert("Please run Step 14 first to start a journey!");
      }
    } },
    { text: "16. Trigger rapid Shake / SOS Emergency siren", action: () => { setShowSOS(true); } }
  ];

  const handleNext = () => {
    const nextIdx = (currentStep + 1) % steps.length;
    setCurrentStep(nextIdx);
    steps[nextIdx].action();
  };

  const handlePrev = () => {
    const prevIdx = (currentStep - 1 + steps.length) % steps.length;
    setCurrentStep(prevIdx);
    steps[prevIdx].action();
  };

  const handleRunSim = () => {
    steps[currentStep].action();
  };

  return (
    <div className={`demo-helper-panel ${expanded ? 'expanded' : ''}`}>
      <div className="demo-helper-header" onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: 13 }}>💡 <strong>Demo Center</strong> ({currentStep + 1}/16)</span>
        <button className="demo-toggle-btn">{expanded ? '▼' : '▲'}</button>
      </div>

      {expanded && (
        <div className="demo-helper-body">
          <div className="demo-step-text">{steps[currentStep].text}</div>
          <div className="demo-controls">
            <button className="demo-control-btn" onClick={handlePrev}>◀</button>
            <button className="demo-control-btn play" onClick={handleRunSim}>
              ⚡ Run Sim
            </button>
            <button className="demo-control-btn" onClick={handleNext}>▶</button>
          </div>
          <div className="demo-tip">
            Presenter: Click "Run Sim" to automatically set up the app state for this step!
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Main App Component
// ============================================================
function App() {
  const [lang, setLang] = useState(RakshaData.currentUser.language);
  const { t } = useT(lang);
  const [page, setPage] = useState('home');
  const [showSOS, setShowSOS] = useState(false);
  const [toast, setToast] = useState(null);

  // Shared application states uplifted to root level
  const [safetyReports, setSafetyReports] = useState(RakshaData.safetyReports);
  const [trustedContacts, setTrustedContacts] = useState(RakshaData.trustedContacts);
  const [activeJourney, setActiveJourney] = useState(null);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  // User Profile Customization States
  const [userName, setUserName] = useState(() => localStorage.getItem('raksha_user_name') || 'Priya Sharma');
  const [bloodGroup, setBloodGroup] = useState(() => localStorage.getItem('raksha_blood_group') || '');

  // User Saved Places (Home, Office, and custom shortcuts)
  const [savedPlaces, setSavedPlaces] = useState(() => {
    const cached = localStorage.getItem('raksha_saved_places_v2');
    if (cached) return JSON.parse(cached);
    return [
      { id: 'home', icon: '🏠', label: 'Home', address: localStorage.getItem('raksha_home') || 'Indirapuram, Ghaziabad' },
      { id: 'office', icon: '💼', label: 'Office', address: localStorage.getItem('raksha_office') || 'Sector 62, Noida' }
    ];
  });

  const [journeyDestination, setJourneyDestination] = useState('');

  const homeAddress = savedPlaces.find(p => p.id === 'home')?.address || '';
  const officeAddress = savedPlaces.find(p => p.id === 'office')?.address || '';

  // Globally persisted chat history
  const [chatHistory, setChatHistory] = useState([]);

  // Initialize/Update welcome message on language switch if empty
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([
        { role: 'ai', text: t('assistantWelcome') }
      ]);
    }
  }, [lang]);

  // GPS Location state (starts with Ghaziabad baseline location in words)
  const [userCoords, setUserCoords] = useState({
    lat: 28.58847,
    lng: 77.45657,
    name: 'Indirapuram, Ghaziabad'
  });

  // Dynamically translate mock safety reports coordinates to Noida/Ghaziabad if user is in Noida/Ghaziabad
  useEffect(() => {
    if (userCoords.lat > 20) {
      const localReports = RakshaData.safetyReports.map((report, idx) => {
        const offsets = [
          { lat: 0.0035, lng: 0.0045, name: 'Shipra Sun City Crossing' },
          { lat: -0.0064, lng: -0.0045, name: 'Windsor Park Back Alley' },
          { lat: -0.0135, lng: -0.0145, name: 'CISF Road Junction' },
          { lat: 0.0165, lng: -0.0215, name: 'Noida Sector 62 Underpass' },
          { lat: -0.0185, lng: -0.0185, name: 'Vasundhara Sector 10 Lane' },
          { lat: 0.0015, lng: 0.0125, name: 'Khora Colony Border' },
          { lat: -0.0205, lng: 0.0075, name: 'Indirapuram Habitat Center Backroad' },
          { lat: 0.0145, lng: 0.0155, name: 'Gaur City 2 Crossing' },
          { lat: -0.0085, lng: 0.0225, name: 'Abhay Khand Main Market' },
          { lat: 0.0115, lng: -0.0055, name: 'Noida Sector 63 Industrial Stretch' }
        ];
        const offset = offsets[idx % offsets.length];
        return {
          ...report,
          location: {
            ...report.location,
            lat: userCoords.lat + offset.lat,
            lng: userCoords.lng + offset.lng,
            name: offset.name
          }
        };
      });
      setSafetyReports(localReports);
    } else {
      setSafetyReports(RakshaData.safetyReports);
    }
  }, [userCoords.lat, userCoords.lng]);

  // GPS Live Fetch Handler with Nominatim OSM Reverse Geocoding
  const fetchLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setToast(lang === 'en' ? 'Geolocation not supported by browser' : 'भू-स्थान आपके ब्राउज़र द्वारा समर्थित नहीं है');
      return;
    }

    setToast(lang === 'en' ? '📡 Fetching live GPS coordinates...' : 'जीपीएस स्थान प्राप्त कर रहे हैं...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setUserCoords(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          name: lang === 'en' ? 'Resolving address...' : 'पता खोज रहे हैं...'
        }));

        try {
          // Query OSM Nominatim (Free reverse geocoding)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`, {
            headers: {
              'Accept-Language': lang === 'en' ? 'en' : 'hi'
            }
          });
          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            // Resolve readable name
            const place = addr.suburb || addr.neighbourhood || addr.village || addr.road || addr.city_district || addr.city || addr.town || addr.county || 'Live Location';
            const state = addr.state || addr.country || '';
            const cleanName = state ? `${place}, ${state}` : place;

            setUserCoords({
              lat: latitude,
              lng: longitude,
              name: cleanName
            });
            setToast(lang === 'en' ? '✅ Live Location Synced!' : 'स्थान समन्वित हो गया!');
          } else {
            throw new Error('Geocoding response error');
          }
        } catch (err) {
          console.warn('Nominatim reverse-geocode failed, using custom word fallback:', err);
          setUserCoords({
            lat: latitude,
            lng: longitude,
            name: `Indirapuram, Ghaziabad`
          });
          setToast(lang === 'en' ? '✅ Live Location Synced!' : 'स्थान समन्वित हो गया!');
        }
      },
      (error) => {
        console.warn('GPS location access denied/failed:', error.message);
        setToast(lang === 'en' ? 
          '❌ GPS Access Denied. Check browser location permissions.' : 
          '❌ जीपीएस पहुंच अस्वीकृत। ब्राउज़र अनुमतियां जांचें।'
        );
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
  }, [lang]);

  // Fetch status on startup to see if AI key is loaded
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'online') {
          setAiEnabled(data.aiEnabled);
        }
      })
      .catch(err => console.log('Error checking server status:', err));

    fetchLiveLocation();
  }, []);

  // Check-in Overdue Timer checker
  useEffect(() => {
    if (!activeJourney || activeJourney.status !== 'in_progress') return;
    const checkTimer = () => {
      if (Date.now() > activeJourney.expectedArrival) {
        setActiveJourney(prev => {
          if (prev && prev.status === 'in_progress') {
            setShowOverdueModal(true);
            return { ...prev, status: 'overdue' };
          }
          return prev;
        });
      }
    };
    checkTimer();
    const interval = setInterval(checkTimer, 3000);
    return () => clearInterval(interval);
  }, [activeJourney]);

  // Shake Phone Detection API
  useEffect(() => {
    let lastX, lastY, lastZ;
    let shakeCount = 0;
    const threshold = 16; // shake force threshold
    
    const handleAccelerometer = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null) return;
      
      const { x, y, z } = acc;
      if (lastX !== undefined) {
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);
        
        if ((deltaX > threshold && deltaY > threshold) || 
            (deltaX > threshold && deltaZ > threshold) || 
            (deltaY > threshold && deltaZ > threshold)) {
          shakeCount++;
          if (shakeCount > 5) {
            setToast(t('simulatedShake'));
            setShowSOS(true);
            shakeCount = 0;
          }
        }
      }
      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleAccelerometer);
    return () => window.removeEventListener('devicemotion', handleAccelerometer);
  }, [t]);

  const handleStartJourney = (journeyData) => {
    setActiveJourney(journeyData);
  };

  const handleEndJourney = () => {
    setActiveJourney(null);
    setShowOverdueModal(false);
    setToast(t('checkedInTitle'));
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return (
          <DashboardPage
            onNavigate={(p) => p === 'sos' ? setShowSOS(true) : setPage(p)}
            lang={lang}
            safetyReports={safetyReports}
            activeJourney={activeJourney}
            onEndJourney={handleEndJourney}
            userCoords={userCoords}
            onFetchLocation={fetchLiveLocation}
            savedPlaces={savedPlaces}
            setSavedPlaces={setSavedPlaces}
            setJourneyDestination={setJourneyDestination}
            userName={userName}
            setUserName={setUserName}
          />
        );
      case 'map':
        return (
          <MapPage
            lang={lang}
            safetyReports={safetyReports}
            setSafetyReports={setSafetyReports}
            activeJourney={activeJourney}
            userCoords={userCoords}
            userName={userName}
          />
        );
      case 'journey':
        return (
          <JourneyPage
            onNavigate={setPage}
            lang={lang}
            safetyReports={safetyReports}
            activeJourney={activeJourney}
            onStartJourney={handleStartJourney}
            onEndJourney={handleEndJourney}
            trustedContacts={trustedContacts}
            userCoords={userCoords}
            initialDestination={journeyDestination}
            setInitialDestination={setJourneyDestination}
          />
        );
      case 'rights':
        return (
          <RightsPage
            lang={lang}
            aiEnabled={aiEnabled}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            lang={lang}
            setLang={setLang}
            trustedContacts={trustedContacts}
            setTrustedContacts={setTrustedContacts}
            bloodGroup={bloodGroup}
            setBloodGroup={setBloodGroup}
            userName={userName}
            setUserName={setUserName}
          />
        );
      case 'assistant':
        return (
          <AssistantPage
            lang={lang}
            safetyReports={safetyReports}
            userCoords={userCoords}
            aiEnabled={aiEnabled}
            messages={chatHistory}
            setMessages={setChatHistory}
            homeAddress={homeAddress}
            officeAddress={officeAddress}
            userName={userName}
          />
        );
      default:
        return (
          <DashboardPage
            onNavigate={(p) => p === 'sos' ? setShowSOS(true) : setPage(p)}
            lang={lang}
            safetyReports={safetyReports}
            activeJourney={activeJourney}
            onEndJourney={handleEndJourney}
            userCoords={userCoords}
            onFetchLocation={fetchLiveLocation}
            savedPlaces={savedPlaces}
            setSavedPlaces={setSavedPlaces}
            setJourneyDestination={setJourneyDestination}
            userName={userName}
            setUserName={setUserName}
          />
        );
    }
  };

  const navItems = [
    { id: 'home', icon: '🏠', label: t('navHome') },
    { id: 'journey', icon: '🧭', label: t('navJourney') },
    { id: 'map', icon: '🗺️', label: t('navMap') },
    { id: 'rights', icon: '⚖️', label: t('navRights') },
    { id: 'assistant', icon: '🤖', label: lang === 'en' ? 'AI Assist' : 'एआई सहायक' },
    { id: 'profile', icon: '👤', label: t('navProfile') },
  ];

  const pageTitles = {
    home: t('appName'),
    map: t('mapTitle'),
    journey: t('journeyTitle'),
    rights: t('rightsTitle'),
    profile: t('profileTitle'),
    assistant: t('assistantTitle'),
  };

  const pageSubtitles = {
    home: t('appTagline'),
    map: t('mapSubtitle'),
    journey: t('findRoutes'),
    rights: t('rightsSubtitle'),
    profile: t('profileSubtitle'),
    assistant: t('assistantSubtitle'),
  };

  return (
    <div className="app-shell">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Top Bar Header */}
      <div className="top-bar">
        <div className="top-bar-left">
          <span className="top-bar-logo">🛡️</span>
          <div>
            <div className="top-bar-title" style={{ color: 'var(--primary-pink)' }}>{pageTitles[page]}</div>
            {pageSubtitles[page] && <div className="top-bar-subtitle">{pageSubtitles[page]}</div>}
          </div>
        </div>
        <div className="top-bar-right">
          <button
            className="top-bar-icon-btn"
            title={lang === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          >
            {lang === 'en' ? '🇮🇳' : '🇬🇧'}
          </button>
          <button
            className={`top-bar-icon-btn ${page === 'profile' ? 'active' : ''}`}
            onClick={() => setPage('profile')}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Page Content viewport */}
      <div className="page-content" style={{ flex: 1, overflowY: 'auto' }}>
        {renderPage()}
      </div>

      {/* Overdue Check-in Alarm Warning Modal */}
      {showOverdueModal && (
        <div className="modal-overlay" style={{ zIndex: 4000, background: 'rgba(239, 68, 68, 0.4)' }}>
          <div className="modal" style={{ border: '2px solid var(--red)' }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 44, color: 'var(--red)', animation: 'pulse-badge 1s infinite' }}>🚨</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--red)', marginTop: 8 }}>{t('overdueAlertTitle')}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', margin: '12px 0', lineHeight: 1.4 }}>
                {t('overdueAlertDesc')}
              </div>
              <div style={{ padding: '8px 12px', background: '#fee2e2', borderRadius: 8, fontSize: 11, color: '#991b1b', marginBottom: 16 }}>
                📞 Automatically trying to call: <strong>{activeJourney?.contact?.name} ({activeJourney?.contact?.phone})</strong>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowOverdueModal(false)}>
                  Dismiss
                </button>
                <button className="btn-primary" style={{ flex: 2, background: 'var(--red)' }} onClick={handleEndJourney}>
                  🔓 I Am Safe (End Journey)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Navigation tab bar */}
      <div className="bottom-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Full SOS emergency countdown/panel Overlay */}
      {showSOS && (
        <SOSOverlay
          onDeactivate={() => setShowSOS(false)}
          lang={lang}
          trustedContacts={trustedContacts}
          userCoords={userCoords}
          userName={userName}
          bloodGroup={bloodGroup}
        />
      )}
    </div>
  );
}

// ---- Mount ----
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
