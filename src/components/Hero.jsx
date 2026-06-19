import React from 'react';

export default function Hero({ searchFilters, setSearchFilters, destinations, propertyTypes }) {
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title animate-fade">Pronađite Vaš Savršen Smeštaj u Grčkoj</h1>
        <p className="hero-subtitle animate-fade">Direktan kontakt sa vlasnicima smeštaja, bez posrednika i agencijske provizije.</p>
      </div>
      
      <div className="search-bar-container glass animate-scale">
        <div className="search-form">
          <div className="search-field">
            <label htmlFor="destination">Destinacija</label>
            <div className="search-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <select 
                id="destination" 
                name="destination" 
                value={searchFilters.destination}
                onChange={handleSelectChange}
              >
                <option value="all">Sve regije</option>
                {destinations.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="search-field">
            <label htmlFor="priceCategory">Cenovni Rang</label>
            <div className="search-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <select 
                id="priceCategory" 
                name="priceCategory" 
                value={searchFilters.priceCategory}
                onChange={handleSelectChange}
              >
                <option value="all">Bilo koja cena</option>
                <option value="budget">Povoljan (do 60€ / noć)</option>
                <option value="mid">Standardan (60€ - 120€ / noć)</option>
                <option value="luxury">Luksuzan (preko 120€ / noć)</option>
              </select>
            </div>
          </div>
          
          <div className="search-field">
            <label htmlFor="type">Tip Smeštaja</label>
            <div className="search-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
              </svg>
              <select 
                id="type" 
                name="type" 
                value={searchFilters.type}
                onChange={handleSelectChange}
              >
                <option value="all">Sve vrste objekata</option>
                {propertyTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-field">
            <label htmlFor="checkIn">Dolazak</label>
            <div className="search-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input 
                type="date"
                id="checkIn" 
                name="checkIn" 
                value={searchFilters.checkIn || ''}
                onChange={handleSelectChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="search-field">
            <label htmlFor="checkOut">Odlazak</label>
            <div className="search-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input 
                type="date"
                id="checkOut" 
                name="checkOut" 
                value={searchFilters.checkOut || ''}
                onChange={handleSelectChange}
                min={searchFilters.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          
          <button 
            type="button" 
            className="btn-search"
            onClick={() => {
              const listingsEl = document.getElementById('listings-section');
              if (listingsEl) {
                listingsEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Pretraži
          </button>
        </div>
      </div>
    </div>
  );
}
