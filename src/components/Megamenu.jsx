import { useState } from 'react';

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
  setIsSearchActive,
  onOpenAuth,
  setGuideSubTab
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isGridMenuOpen) return null;

  const destinations = [
    { name: 'Tasos',       emoji: '🏝️', count: '142 obj.', image: 'https://images.unsplash.com/photo-1530841377377-3ff06c0ca713?auto=format&fit=crop&w=400&q=80' },
    { name: 'Sitonija',    emoji: '🌊', count: '98 obj.',  image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=400&q=80' },
    { name: 'Kasandra',    emoji: '⛱️', count: '124 obj.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Lefkada',     emoji: '🌿', count: '85 obj.',  image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=400&q=80' },
    { name: 'Krit',        emoji: '🏛️', count: '112 obj.', image: 'https://images.unsplash.com/photo-1608958416715-db14457e51ba?auto=format&fit=crop&w=400&q=80' },
    { name: 'Halkidiki',   emoji: '🌲', count: '156 obj.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80' },
    { name: 'Kefalonija',  emoji: '🏔️', count: '67 obj.',  image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=400&q=80' },
    { name: 'Krf',         emoji: '🌺', count: '59 obj.',  image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80' },
    { name: 'Kavala',      emoji: '🚢', count: '33 obj.',  image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=400&q=80' },
    { name: 'Atos',        emoji: '⛪', count: '22 obj.',  image: 'https://images.unsplash.com/photo-1527844444187-359ac186c5bb?auto=format&fit=crop&w=400&q=80' },
    { name: 'Epir',        emoji: '🌅', count: '41 obj.',  image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80' },
  ];

  const categories = [
    { id: 'first_line', label: 'Na plaži',          icon: '🏖️', desc: 'Smeštaj na samoj obali mora' },
    { id: 'pool',       label: 'Sa bazenom',         icon: '🏊', desc: 'Smeštaji sa sopstvenim ili zajedničkim bazenom' },
    { id: 'pets',       label: 'Ljubimci OK',        icon: '🐾', desc: 'Kućni ljubimci su dobrodošli' },
    { id: 'premium',    label: 'Premium',            icon: '💎', desc: 'Ekskluzivne i luksuzne vile' },
    { id: 'Apartman',   label: 'Apartmani',          icon: '🏢', desc: 'Standardni apartmanski smeštaj' },
    { id: 'Hotel',      label: 'Hoteli',             icon: '🏨', desc: 'Hotelski smeštaj sa uslugom' },
  ];

  // Filter destinations based on search query
  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Background Overlay */}
      <div className="mega-overlay" onClick={() => setIsGridMenuOpen(false)} />

      {/* Grid Menu Panel */}
      <div className="mega-panel" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          className="mega-close" 
          onClick={() => setIsGridMenuOpen(false)} 
          aria-label="Zatvori meni"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* LEFT COLUMN: Destinations */}
        <div className="mega-left">
          <h3 className="mega-heading">
            <span style={{ marginRight: '0.6rem' }}>🗺️</span>Destinacije
          </h3>
          
          <div className="mega-dest-grid">
            {filteredDestinations.map(dest => {
              const isSelected = searchFilters.destination.toLowerCase() === dest.name.toLowerCase();
              return (
                <div
                  key={dest.name}
                  className={`mega-dest-card ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    handleSelectDestination(dest.name);
                    setIsGridMenuOpen(false);
                  }}
                >
                  {isSelected && <div className="mega-dest-active-ring" />}
                  <img src={dest.image} alt={dest.name} className="mega-dest-photo" />
                  <div className="mega-dest-gradient" />
                  <div className="mega-dest-info">
                    <span className="mega-dest-label">{dest.name}</span>
                    <span className="mega-dest-badge">{dest.count}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="mega-show-all"
            onClick={() => {
              setSearchFilters(prev => ({ ...prev, destination: 'all' }));
              if (setActiveTab) setActiveTab('listings');
              setIsGridMenuOpen(false);
              if (setIsSearchActive) setIsSearchActive(true);
            }}
          >
            Svi smeštaji →
          </button>
        </div>

        {/* RIGHT COLUMN: Search + Categories + Links */}
        <div className="mega-right">
          
          {/* Dynamic Search Box */}
          <div className="mega-search-box">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="mega-search-input" 
              placeholder="Pretraži destinacije..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <span className="mega-section-label">✨ Kategorije</span>
          <div className="mega-cat-list">
            {categories.map(cat => {
              const isActive = cat.id === 'first_line' || cat.id === 'pool' || cat.id === 'pets' || cat.id === 'premium'
                ? activePills.includes(cat.id)
                : searchFilters.type === cat.id;

              return (
                <button
                  key={cat.id}
                  className={`mega-cat-row ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    handleSelectCategory(cat.id);
                    setIsGridMenuOpen(false);
                  }}
                >
                  <span className="mega-cat-icon">{cat.icon}</span>
                  <div className="mega-cat-text">
                    <span className="mega-cat-name">{cat.label}</span>
                    <span className="mega-cat-desc">{cat.desc}</span>
                  </div>
                  <svg className="mega-cat-arrow" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              );
            })}
          </div>

          <div className="mega-divider" />

          {/* Quick Links */}
          <span className="mega-section-label">⚡ Brze veze</span>
          <div className="mega-links">
            <button className="mega-link-row" onClick={() => { setActiveTab('guide'); setIsGridMenuOpen(false); }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
              <span>Putni vodič</span>
            </button>
            <button className="mega-link-row" onClick={() => { setActiveTab('forum'); setIsGridMenuOpen(false); }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Iskustva putnika</span>
            </button>
            <button className="mega-link-row" onClick={() => { setActiveTab('alerts'); setIsGridMenuOpen(false); }}>
              <span className="mega-live-dot" />
              <span className="mega-live-label" style={{ marginLeft: '0.4rem' }}>Stanje na granici</span>
            </button>
            <button className="mega-link-row" onClick={() => { setActiveTab('guide'); if (setGuideSubTab) setGuideSubTab('calculator'); setIsGridMenuOpen(false); }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
              <span>Planer puta do Grčke</span>
            </button>
            <button className="mega-link-row" onClick={() => {
              setIsGridMenuOpen(false);
              if (currentUser) { 
                setActiveTab('host'); 
              } else { 
                if (onOpenAuth) {
                  onOpenAuth({ initialIsRegister: true, initialIsHost: true });
                } else {
                  setIsAuthModalOpen(true);
                }
              }
            }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              <span>Dodajte smeštaj</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
