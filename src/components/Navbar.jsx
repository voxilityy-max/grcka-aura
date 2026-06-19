import React from 'react';

export default function Navbar({ activeTab, setActiveTab, wishlistCount, isDarkMode, setIsDarkMode, currentUser, onOpenAuth }) {
  return (
    <nav className="navbar glass">
      <div className="nav-brand" onClick={() => setActiveTab('listings')} style={{ cursor: 'pointer' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Grčka</span>Aura
      </div>
      
      <ul className="nav-menu">
        <li>
          <a 
            className={`nav-link ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            Smeštaj
          </a>
        </li>
        <li>
          <a 
            className={`nav-link ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            Putni Vodič
          </a>
        </li>
        <li>
          <a 
            className={`nav-link ${activeTab === 'blog' ? 'active' : ''}`}
            onClick={() => setActiveTab('blog')}
          >
            Vodiči & Saveti
          </a>
        </li>
        <li>
          <a 
            className={`nav-link ${activeTab === 'forum' ? 'active' : ''}`}
            onClick={() => setActiveTab('forum')}
          >
            Iskustva Putnika
          </a>
        </li>
        <li>
          <a 
            className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Stanje na Granici
          </a>
        </li>
        {currentUser && currentUser.isAdmin && (
          <li>
            <a 
              className={`nav-link ${activeTab === 'host' ? 'active' : ''}`}
              onClick={() => setActiveTab('host')}
            >
              Admin Panel
            </a>
          </li>
        )}
        {currentUser && (
          <li>
            <a 
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Moj Profil
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
          onClick={() => setActiveTab('wishlist')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>Sačuvano</span>
          {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
        </button>

        {currentUser ? (
          <div className="nav-user-profile" onClick={() => setActiveTab('profile')}>
            <img src={currentUser.avatar} alt={currentUser.fullName} className="nav-avatar-img" />
            <span className="nav-username">{currentUser.fullName.split(' ')[0]}</span>
          </div>
        ) : (
          <button className="btn-nav-login" onClick={onOpenAuth}>
            Prijavi se
          </button>
        )}
      </div>
    </nav>
  );
}
