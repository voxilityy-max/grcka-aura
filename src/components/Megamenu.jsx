import React from 'react';

export default function Megamenu({
  isGridMenuOpen,
  setIsGridMenuOpen,
  searchFilters,
  setSearchFilters,
  activePills,
  currentUser,
  setIsAuthModalOpen,
  handleSelectDestination,
  handleSelectCategory,
  setActiveTab,
  setIsSearchActive
}) {
  if (!isGridMenuOpen) return null;

  return (
    <div
      className="megamenu-floating-wrapper"
      onMouseEnter={() => setIsGridMenuOpen(true)}
      onMouseLeave={() => setIsGridMenuOpen(false)}
    >
      <div className="megamenu-floating-panel" onClick={(e) => e.stopPropagation()}>

        {/* Inner grid: Left + Right columns */}
        <div className="megamenu-floating-grid">

          {/* LEFT: Destinations */}
          <div className="megamenu-col megamenu-col-destinations">
            <div className="megamenu-col-header">
              <span className="megamenu-col-icon">🗺️</span>
              <h3 className="megamenu-col-title">Destinacije</h3>
            </div>
            <div className="megamenu-dest-list">
              {[
                { name: 'Tasos',       emoji: '🏝️', count: '142 obj.' },
                { name: 'Sitonija',    emoji: '🌊', count: '98 obj.'  },
                { name: 'Kasandra',    emoji: '⛱️', count: '124 obj.' },
                { name: 'Lefkada',     emoji: '🌿', count: '85 obj.'  },
                { name: 'Kefalonija',  emoji: '🏔️', count: '67 obj.'  },
                { name: 'Epir',        emoji: '🌅', count: '41 obj.'  },
                { name: 'Krf',         emoji: '🌺', count: '59 obj.'  },
                { name: 'Kavala',      emoji: '🚢', count: '33 obj.'  },
                { name: 'Atos',        emoji: '⛪', count: '22 obj.'  },
              ].map(dest => {
                const isSelected = searchFilters.destination.toLowerCase() === dest.name.toLowerCase();
                return (
                  <button
                    key={dest.name}
                    className={`megamenu-dest-row ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectDestination(dest.name)}
                  >
                    <span className="megamenu-dest-emoji">{dest.emoji}</span>
                    <span className="megamenu-dest-name">{dest.name}</span>
                    <span className="megamenu-dest-count">{dest.count}</span>
                    <svg className="megamenu-dest-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                );
              })}
            </div>
            <button
              className="megamenu-all-btn"
              onClick={() => {
                setSearchFilters(prev => ({ ...prev, destination: 'all' }));
                setIsGridMenuOpen(false);
                if (setIsSearchActive) setIsSearchActive(true);
              }}
            >
              Svi smeštaji →
            </button>
          </div>

          {/* DIVIDER */}
          <div className="megamenu-col-divider" />

          {/* RIGHT: Categories + Links */}
          <div className="megamenu-col megamenu-col-right">

            {/* Categories */}
            <div className="megamenu-col-header">
              <span className="megamenu-col-icon">✨</span>
              <h3 className="megamenu-col-title">Kategorije</h3>
            </div>
            <div className="megamenu-cat-grid">
              {[
                { id: 'first_line', label: 'Na plaži',          icon: '🏖️', type: 'pill' },
                { id: 'pool',       label: 'Sa bazenom',         icon: '🏊', type: 'pill' },
                { id: 'pets',       label: 'Ljubimci OK',        icon: '🐾', type: 'pill' },
                { id: 'premium',    label: 'Premium',            icon: '💎', type: 'pill' },
                { id: 'Apartman',   label: 'Apartmani',          icon: '🏢', type: 'type' },
                { id: 'Hotel',      label: 'Hoteli',             icon: '🏨', type: 'type' },
              ].map(cat => {
                let isActive = cat.type === 'pill' ? activePills.includes(cat.id) : searchFilters.type === cat.id;
                return (
                  <button
                    key={cat.id}
                    className={`megamenu-cat-chip ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectCategory(cat.id)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Divider line */}
            <div className="megamenu-inner-divider" />

            {/* Quick links */}
            <div className="megamenu-col-header" style={{ marginTop: '0.25rem' }}>
              <span className="megamenu-col-icon">⚡</span>
              <h3 className="megamenu-col-title">Brze veze</h3>
            </div>
            <div className="megamenu-quick-links">
              <button className="megamenu-quick-link" onClick={() => { setActiveTab('guide'); setIsGridMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
                Putni vodič
              </button>
              <button className="megamenu-quick-link" onClick={() => { setActiveTab('forum'); setIsGridMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Iskustva putnika
              </button>
              <button className="megamenu-quick-link" onClick={() => { setActiveTab('alerts'); setIsGridMenuOpen(false); }}>
                <span className="megamenu-live-dot" />
                Stanje na granici
              </button>
              <button className="megamenu-quick-link" onClick={() => {
                setIsGridMenuOpen(false);
                if (currentUser) { setActiveTab('profile'); } else { setIsAuthModalOpen(true); }
              }}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                Dodajte smeštaj
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
