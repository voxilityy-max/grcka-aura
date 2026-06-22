export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  wishlistCount, 
  isDarkMode, 
  setIsDarkMode, 
  currentUser, 
  onOpenAuth,
  setIsGridMenuOpen,
  isHost
}) {
  return (
    <div className="navbar-wrapper-outer">
      <nav className="navbar glass">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="ellinas-logo-container" style={{ cursor: 'pointer' }} onClick={() => { setActiveTab('listings'); setIsGridMenuOpen(false); }}>
            <svg className="ellinas-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="38" height="38">
              <defs>
                <linearGradient id="logo-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="100%" stopColor="#00b4d8" />
                </linearGradient>
                <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffb703" />
                  <stop offset="100%" stopColor="#fb8500" />
                </linearGradient>
              </defs>
              {/* Outer thin orbit ring with dashes */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 180, 216, 0.15)" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logo-cyan)" strokeWidth="2.5" strokeDasharray="14 8" className="logo-ring-dashed" />
              
              {/* Main Sail - curved wind-swept shape */}
              <path className="logo-main-sail" d="M47 22 C32 38 32 62 47 70 C42 55 42 35 47 22 Z" fill="url(#logo-cyan)" />
              
              {/* Jib Sail */}
              <path className="logo-jib-sail" d="M53 32 C58 42 66 52 53 64 C51 52 51 40 53 32 Z" fill="url(#logo-gold)" />
              
              {/* Aegean Wave lines underneath */}
              <g className="logo-waves">
                <path d="M25 76 C35 70 45 82 55 76 C65 70 75 82 85 76" fill="none" stroke="url(#logo-cyan)" strokeWidth="3" strokeLinecap="round" />
                <path d="M30 83 C40 78 50 88 60 83 C70 78 80 88 90 83" fill="none" stroke="url(#logo-cyan)" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
              </g>
            </svg>
            <span className="brand-logo-text"><span>Elli</span>nas</span>
          </div>
        </div>
        
        <ul className="nav-menu">
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
          <li>
            <a 
              className={`nav-link ${activeTab === 'planner' ? 'active' : ''}`}
              onClick={() => { setActiveTab('planner'); setIsGridMenuOpen(false); }}
            >
              Planer Puta
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
      </nav>
    </div>
  );
}
