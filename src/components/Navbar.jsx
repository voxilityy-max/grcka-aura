export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  wishlistCount, 
  isDarkMode, 
  setIsDarkMode, 
  currentUser, 
  onOpenAuth,
  isGridMenuOpen,
  setIsGridMenuOpen,
  isHost
}) {
  return (
    <div className="navbar-wrapper-outer">
      <nav className="navbar glass">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => { setActiveTab('listings'); setIsGridMenuOpen(false); }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
              <line x1="4" y1="20" x2="20" y2="20" />
              <line x1="6" y1="20" x2="6" y2="6" />
              <line x1="12" y1="20" x2="12" y2="6" />
              <line x1="18" y1="20" x2="18" y2="6" />
              <path d="M5 6h14M3 6l9-4 9 4M4 20h16" />
            </svg>
            <span className="brand-logo-text"><span>Elli</span>nas</span>
          </div>
        </div>
        
        <ul className="nav-menu">
          <li>
            <a 
              className={`nav-link ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('listings'); setIsGridMenuOpen(false); }}
            >
              Smeštaj
            </a>
          </li>
          <li>
            <a 
              className={`nav-link ${activeTab === 'guide' ? 'active' : ''}`}
              onClick={() => { setActiveTab('guide'); setIsGridMenuOpen(false); }}
            >
              Putni Vodič
            </a>
          </li>
          <li>
            <a 
              className={`nav-link ${activeTab === 'blog' ? 'active' : ''}`}
              onClick={() => { setActiveTab('blog'); setIsGridMenuOpen(false); }}
            >
              Vodiči & Saveti
            </a>
          </li>
          <li>
            <a 
              className={`nav-link ${activeTab === 'forum' ? 'active' : ''}`}
              onClick={() => { setActiveTab('forum'); setIsGridMenuOpen(false); }}
            >
              Iskustva Putnika
            </a>
          </li>
          <li>
            <a 
              className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => { setActiveTab('alerts'); setIsGridMenuOpen(false); }}
            >
              Stanje na Granici
            </a>
          </li>
          {currentUser && (currentUser.isAdmin || isHost) && (
            <li>
              <a 
                className={`nav-link ${activeTab === 'host' ? 'active' : ''}`}
                onClick={() => { setActiveTab('host'); setIsGridMenuOpen(false); }}
              >
                {currentUser.isAdmin ? 'Admin Panel' : 'Vlasnički Panel'}
              </a>
            </li>
          )}
        </ul>
        
        <div className="nav-actions">
          <button 
            className={`btn-grid-launcher ${isGridMenuOpen ? 'active' : ''}`}
            onClick={(e) => { 
              e.stopPropagation(); 
              setIsGridMenuOpen(!isGridMenuOpen); 
            }}
            aria-label="Brzi meni regija"
          >
            <svg viewBox="0 0 24 24" className="grid-launcher-icon" fill="currentColor">
              <circle cx="6" cy="6" r="2" />
              <circle cx="12" cy="6" r="2" />
              <circle cx="18" cy="6" r="2" />
              <circle cx="6" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="18" cy="12" r="2" />
              <circle cx="6" cy="18" r="2" />
              <circle cx="12" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
          </button>

          <button 
            className="btn-theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Promeni temu"
          >
            {isDarkMode ? (
              // Sun icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              // Moon icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          
          <button 
            className="btn-wishlist"
            onClick={() => { setActiveTab('wishlist'); setIsGridMenuOpen(false); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Sačuvano</span>
            {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
          </button>
        </div>
      </nav>

      {currentUser ? (
        <div className="nav-user-profile glass" onClick={() => { setActiveTab('profile'); setIsGridMenuOpen(false); }}>
          <img src={currentUser.avatar} alt={currentUser.fullName} className="nav-avatar-img" />
          <span className="nav-username">{currentUser.fullName.split(' ')[0]}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-nav-login glass" 
            style={{ backgroundColor: 'rgba(0, 180, 216, 0.15)', borderColor: 'rgba(0, 180, 216, 0.4)', color: 'var(--accent)' }}
            onClick={() => { onOpenAuth({ initialIsRegister: true, initialIsHost: true }); setIsGridMenuOpen(false); }}
          >
            🤝 Izdaj smeštaj
          </button>
          <button className="btn-nav-login glass" onClick={() => { onOpenAuth(); setIsGridMenuOpen(false); }}>
            Prijavi se
          </button>
        </div>
      )}
    </div>
  );
}
