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
        <p className="hero-subtitle animate-fade">Ulepšaj svoje letovanje uz najniže cene</p>
      </div>
      
      <div className="search-bar-gradient-wrapper animate-scale">
        <div className="search-bar-inner">
          <div className="search-field-col">
            <label htmlFor="destination">Destinacija</label>
            <div className="select-wrapper-nikana">
              <select 
                id="destination" 
                name="destination" 
                value={searchFilters.destination}
                onChange={handleSelectChange}
              >
                <option value="all">Unesite mesto, regiju ili smeštaj</option>
                {destinations.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="search-field-divider"></div>
          
          <div className="search-field-col">
            <label>Dolazak / Odlazak</label>
            <div className="dates-wrapper-nikana">
              <input 
                type="date"
                id="checkIn" 
                name="checkIn" 
                value={searchFilters.checkIn || ''}
                onChange={handleSelectChange}
                min={new Date().toISOString().split('T')[0]}
                className="date-input-nikana"
              />
              <span className="date-separator">&rarr;</span>
              <input 
                type="date"
                id="checkOut" 
                name="checkOut" 
                value={searchFilters.checkOut || ''}
                onChange={handleSelectChange}
                min={searchFilters.checkIn || new Date().toISOString().split('T')[0]}
                className="date-input-nikana"
              />
            </div>
          </div>
          
          <div className="search-field-divider"></div>
          
          <div className="search-field-col">
            <label htmlFor="type">Tip smeštaja</label>
            <div className="select-wrapper-nikana">
              <select 
                id="type" 
                name="type" 
                value={searchFilters.type}
                onChange={handleSelectChange}
              >
                <option value="all">Sve vrste smeštaja</option>
                {propertyTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="button" 
            className="btn-search-icon-nikana"
            onClick={() => {
              const listingsEl = document.getElementById('listings-section');
              if (listingsEl) {
                listingsEl.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            aria-label="Pretraži"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
