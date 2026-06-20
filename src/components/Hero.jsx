import { useState, useEffect, useRef } from 'react';

export default function Hero({ searchFilters, setSearchFilters, destinations, propertyTypes, onSearch }) {
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  
  const destRef = useRef(null);
  const typeRef = useRef(null);

  // Close custom dropdowns if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (destRef.current && !destRef.current.contains(event.target)) {
        setIsDestOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setIsTypeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectDest = (val) => {
    setSearchFilters(prev => ({
      ...prev,
      destination: val
    }));
    setIsDestOpen(false);
  };

  const handleSelectType = (val) => {
    setSearchFilters(prev => ({
      ...prev,
      type: val
    }));
    setIsTypeOpen(false);
  };

  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title animate-fade">Pronađite Vaš Savršen Smeštaj u Grčkoj</h1>
        <p className="hero-subtitle animate-fade">Ulepšaj svoje letovanje uz najniže cene</p>
      </div>
      
      <div className="search-bar-gradient-wrapper animate-scale">
        <div className="search-bar-inner">
          <div className="search-field-col dest-field-col" ref={destRef} onClick={() => setIsDestOpen(!isDestOpen)}>
            <label>Destinacija</label>
            <div className="custom-select-wrapper">
              <div className="custom-select-trigger">
                <span className="custom-select-value">
                  {searchFilters.destination === 'all' ? 'Izaberite destinaciju' : searchFilters.destination}
                </span>
                <span className={`custom-select-arrow ${isDestOpen ? 'open' : ''}`}></span>
              </div>
              
              {isDestOpen && (
                <ul className="custom-dropdown-menu">
                  <li 
                    className={searchFilters.destination === 'all' ? 'active' : ''}
                    onClick={(e) => { e.stopPropagation(); handleSelectDest('all'); }}
                  >
                    Izaberite destinaciju
                  </li>
                  {destinations.map(dest => (
                    <li 
                      key={dest} 
                      className={searchFilters.destination === dest ? 'active' : ''}
                      onClick={(e) => { e.stopPropagation(); handleSelectDest(dest); }}
                    >
                      {dest}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="search-field-divider"></div>
          
          <div className="search-field-col date-field-col">
            <label>Dolazak / Odlazak</label>
            <div className="dates-wrapper-nikana">
              <input 
                type="date"
                id="checkIn" 
                name="checkIn" 
                value={searchFilters.checkIn || ''}
                onChange={handleSelectChange}
                onClick={(e) => { try { e.target.showPicker(); } catch { /* ignore */ } }}
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
                onClick={(e) => { try { e.target.showPicker(); } catch { /* ignore */ } }}
                min={searchFilters.checkIn || new Date().toISOString().split('T')[0]}
                className="date-input-nikana"
              />
            </div>
          </div>
          
          <div className="search-field-divider"></div>
          
          <div className="search-field-col type-field-col" ref={typeRef} onClick={() => setIsTypeOpen(!isTypeOpen)}>
            <label>Tip smeštaja</label>
            <div className="custom-select-wrapper">
              <div className="custom-select-trigger">
                <span className="custom-select-value">
                  {searchFilters.type === 'all' ? 'Sve vrste smeštaja' : searchFilters.type}
                </span>
                <span className={`custom-select-arrow ${isTypeOpen ? 'open' : ''}`}></span>
              </div>
              
              {isTypeOpen && (
                <ul className="custom-dropdown-menu">
                  <li 
                    className={searchFilters.type === 'all' ? 'active' : ''}
                    onClick={(e) => { e.stopPropagation(); handleSelectType('all'); }}
                  >
                    Sve vrste smeštaja
                  </li>
                  {propertyTypes.map(t => (
                    <li 
                      key={t} 
                      className={searchFilters.type === t ? 'active' : ''}
                      onClick={(e) => { e.stopPropagation(); handleSelectType(t); }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button 
            type="button" 
            className="btn-search-icon-nikana"
            onClick={() => {
              if (onSearch) {
                onSearch();
              } else {
                const listingsEl = document.getElementById('listings-section');
                if (listingsEl) {
                  listingsEl.scrollIntoView({ behavior: 'smooth' });
                }
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

