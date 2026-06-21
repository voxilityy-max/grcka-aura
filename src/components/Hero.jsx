import { useState, useEffect, useRef } from 'react';

export default function Hero({ searchFilters, setSearchFilters, destinations, onSearch }) {
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  
  const destRef = useRef(null);
  const guestRef = useRef(null);

  // Close custom dropdowns if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (destRef.current && !destRef.current.contains(event.target)) {
        setIsDestOpen(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setIsGuestOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectDest = (val) => {
    setSearchFilters(prev => ({
      ...prev,
      destination: val
    }));
    setIsDestOpen(false);
  };

  const handleAdultsChange = (val, e) => {
    e.stopPropagation();
    const current = searchFilters.adults || 2;
    const newVal = Math.max(1, Math.min(10, current + val));
    setSearchFilters(prev => ({
      ...prev,
      adults: newVal
    }));
  };

  const handleChildrenChange = (val, e) => {
    e.stopPropagation();
    const current = searchFilters.children || 0;
    const newVal = Math.max(0, Math.min(6, current + val));
    
    // Adjust childAges array dynamically
    let newAges = [...(searchFilters.childAges || [])];
    if (newVal > current) {
      for (let i = current; i < newVal; i++) {
        newAges.push(8); // Default child age is 8
      }
    } else if (newVal < current) {
      newAges = newAges.slice(0, newVal);
    }

    setSearchFilters(prev => ({
      ...prev,
      children: newVal,
      childAges: newAges
    }));
  };

  const handleChildAgeChange = (index, age, e) => {
    e.stopPropagation();
    const newAges = [...(searchFilters.childAges || [])];
    newAges[index] = parseInt(age, 10);
    setSearchFilters(prev => ({
      ...prev,
      childAges: newAges
    }));
  };

  const getGuestsText = () => {
    const adults = searchFilters.adults || 2;
    const children = searchFilters.children || 0;
    
    let text = `${adults} odraslih`;
    if (children > 0) {
      if (children === 1) {
        text += `, 1 dete`;
      } else {
        text += `, ${children} dece`;
      }
    }
    return text;
  };

  const getDestEmoji = (destName) => {
    const mapping = {
      'Tasos': '🏝️',
      'Sitonija': '🌊',
      'Kasandra': '⛱️',
      'Lefkada': '🌿',
      'Kefalonija': '🏔️',
      'Epir': '🌅',
      'Krf': '🌺',
      'Kavala': '🚢',
      'Atos': '⛪',
      'Krit': '🏝️',
      'Halkidiki': '🌊'
    };
    return mapping[destName] || '📍';
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
                  {searchFilters.destination === 'all' ? 'Izaberite destinaciju' : `${getDestEmoji(searchFilters.destination)} ${searchFilters.destination}`}
                </span>
                <span className={`custom-select-arrow ${isDestOpen ? 'open' : ''}`}></span>
              </div>
              
              {isDestOpen && (
                <ul className="custom-dropdown-menu">
                  <li 
                    className={searchFilters.destination === 'all' ? 'active' : ''}
                    onClick={(e) => { e.stopPropagation(); handleSelectDest('all'); }}
                  >
                    📍 Sve destinacije
                  </li>
                  {destinations.map(dest => (
                    <li 
                      key={dest} 
                      className={searchFilters.destination === dest ? 'active' : ''}
                      onClick={(e) => { e.stopPropagation(); handleSelectDest(dest); }}
                    >
                      {getDestEmoji(dest)} {dest}
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
                onChange={(e) => {
                  const { name, value } = e.target;
                  setSearchFilters(prev => ({ ...prev, [name]: value }));
                }}
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
                onChange={(e) => {
                  const { name, value } = e.target;
                  setSearchFilters(prev => ({ ...prev, [name]: value }));
                }}
                onClick={(e) => { try { e.target.showPicker(); } catch { /* ignore */ } }}
                min={searchFilters.checkIn || new Date().toISOString().split('T')[0]}
                className="date-input-nikana"
              />
            </div>
          </div>
          
          <div className="search-field-divider"></div>
          
          <div className="search-field-col guest-field-col" ref={guestRef} onClick={() => setIsGuestOpen(!isGuestOpen)}>
            <label>Gosti</label>
            <div className="custom-select-wrapper">
              <div className="custom-select-trigger">
                <span className="custom-select-value">
                  👤 {getGuestsText()}
                </span>
                <span className={`custom-select-arrow ${isGuestOpen ? 'open' : ''}`}></span>
              </div>
              
              {isGuestOpen && (
                <div className="custom-dropdown-menu guest-select-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="guest-row">
                    <div className="guest-info">
                      <span className="guest-type-title">Odrasli</span>
                      <span className="guest-type-subtitle">Starosti 13 ili više</span>
                    </div>
                    <div className="guest-controls">
                      <button 
                        type="button"
                        className="guest-counter-btn"
                        onClick={(e) => handleAdultsChange(-1, e)}
                        disabled={(searchFilters.adults || 2) <= 1}
                      >
                        -
                      </button>
                      <span className="guest-count-val">{searchFilters.adults || 2}</span>
                      <button 
                        type="button"
                        className="guest-counter-btn"
                        onClick={(e) => handleAdultsChange(1, e)}
                        disabled={(searchFilters.adults || 2) >= 10}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="guest-divider"></div>

                  <div className="guest-row">
                    <div className="guest-info">
                      <span className="guest-type-title">Deca</span>
                      <span className="guest-type-subtitle">Starosti od 0 do 12</span>
                    </div>
                    <div className="guest-controls">
                      <button 
                        type="button"
                        className="guest-counter-btn"
                        onClick={(e) => handleChildrenChange(-1, e)}
                        disabled={(searchFilters.children || 0) <= 0}
                      >
                        -
                      </button>
                      <span className="guest-count-val">{searchFilters.children || 0}</span>
                      <button 
                        type="button"
                        className="guest-counter-btn"
                        onClick={(e) => handleChildrenChange(1, e)}
                        disabled={(searchFilters.children || 0) >= 6}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {(searchFilters.children || 0) > 0 && (
                    <div className="child-ages-section animate-slide-down">
                      <span className="child-ages-title">Uzrast dece</span>
                      <div className="child-ages-grid">
                        {Array.from({ length: searchFilters.children }).map((_, idx) => {
                          const age = (searchFilters.childAges && searchFilters.childAges[idx]) !== undefined 
                            ? searchFilters.childAges[idx] 
                            : 8;
                          return (
                            <div key={idx} className="child-age-selector-row">
                              <label>Dete {idx + 1}</label>
                              <select
                                value={age}
                                onChange={(e) => handleChildAgeChange(idx, e.target.value, e)}
                                onClick={(e) => e.stopPropagation()}
                                className="child-age-select"
                              >
                                {Array.from({ length: 18 }).map((_, a) => (
                                  <option key={a} value={a}>{a} god.</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button 
                    type="button" 
                    className="btn-guest-apply"
                    onClick={(e) => { e.stopPropagation(); setIsGuestOpen(false); }}
                  >
                    Primeni
                  </button>
                </div>
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
