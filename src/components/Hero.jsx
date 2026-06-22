import { useState, useEffect, useRef } from 'react';

export default function Hero({ searchFilters, setSearchFilters, destinations, onSearch }) {
  const [isDestOpen, setIsDestOpen] = useState(false);
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  
  const destRef = useRef(null);
  const guestRef = useRef(null);
  const calendarRef = useRef(null);

  // Close custom dropdowns if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (destRef.current && !destRef.current.contains(event.target)) {
        setIsDestOpen(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setIsGuestOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const SERBIAN_MONTHS = [
    "Januar", "Februar", "Mart", "April", "Maj", "Jun", 
    "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"
  ];

  const generateMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday is 0

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= numDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getFormattedDateString = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (dateStr) => {
    const checkIn = searchFilters.checkIn;
    const checkOut = searchFilters.checkOut;

    if (!checkIn || (checkIn && checkOut)) {
      setSearchFilters(prev => ({
        ...prev,
        checkIn: dateStr,
        checkOut: ''
      }));
    } else {
      if (dateStr < checkIn) {
        setSearchFilters(prev => ({
          ...prev,
          checkIn: dateStr
        }));
      } else if (dateStr > checkIn) {
        setSearchFilters(prev => ({
          ...prev,
          checkOut: dateStr
        }));
        setIsCalendarOpen(false); // Close calendar on selection complete
      } else {
        setSearchFilters(prev => ({
          ...prev,
          checkIn: '',
          checkOut: ''
        }));
      }
    }
  };

  const getDatesDisplay = () => {
    const checkIn = searchFilters.checkIn;
    const checkOut = searchFilters.checkOut;
    if (!checkIn) return 'Izaberite datume';
    
    const formatDate = (dateStr) => {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return '';
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const monthName = SERBIAN_MONTHS[monthIdx] ? SERBIAN_MONTHS[monthIdx].substring(0, 3) : '';
      return `${day}. ${monthName}`;
    };

    const startStr = formatDate(checkIn);
    if (!checkOut) return `${startStr} - Odaberite odlazak`;
    const endStr = formatDate(checkOut);
    return `${startStr} - ${endStr}`;
  };

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
          <div className="search-field-col dest-field-col" ref={destRef} onClick={() => { setIsDestOpen(!isDestOpen); setIsGuestOpen(false); setIsCalendarOpen(false); }}>
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
          
          <div className="search-field-col date-field-col" ref={calendarRef} onClick={() => { setIsCalendarOpen(!isCalendarOpen); setIsDestOpen(false); setIsGuestOpen(false); }} style={{ cursor: 'pointer', position: 'relative' }}>
            <label>Dolazak / Odlazak</label>
            <div className="custom-select-wrapper">
              <div className="custom-select-trigger">
                <span className="custom-select-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📅 {getDatesDisplay()}
                </span>
                <span className={`custom-select-arrow ${isCalendarOpen ? 'open' : ''}`}></span>
              </div>
              {isCalendarOpen && (
                <div className="custom-dropdown-menu calendar-dropdown glass animate-scale" onClick={(e) => e.stopPropagation()} style={{ width: '310px', padding: '1rem', zIndex: 100, position: 'absolute', top: '100%', left: '0', marginTop: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-hover)' }}>
                  <div className="calendar-container" style={{ width: '100%' }}>
                    <div className="calendar-nav-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <button type="button" className="btn-calendar-nav" onClick={handlePrevMonth} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.2rem 0.5rem', color: 'var(--text-main)', cursor: 'pointer' }}>&larr;</button>
                      <span className="calendar-nav-label" style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Izaberite datume</span>
                      <button type="button" className="btn-calendar-nav" onClick={handleNextMonth} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.2rem 0.5rem', color: 'var(--text-main)', cursor: 'pointer' }}>&rarr;</button>
                    </div>
                    <div className="calendar-months-wrapper">
                      {(() => {
                        const year = currentMonthDate.getFullYear();
                        const month = currentMonthDate.getMonth();
                        const monthDays = generateMonthDays(year, month);
                        const monthName = SERBIAN_MONTHS[month];
                        const todayStr = getFormattedDateString(new Date());

                        return (
                          <div className="calendar-month-box">
                            <div className="calendar-month-title">
                              {monthName} {year}
                            </div>
                            <div className="calendar-weekdays-grid">
                              <span>Po</span>
                              <span>Ut</span>
                              <span>Sr</span>
                              <span>Če</span>
                              <span>Pe</span>
                              <span>Su</span>
                              <span>Ne</span>
                            </div>
                            <div className="calendar-days-grid">
                              {monthDays.map((day, idx) => {
                                if (!day) {
                                  return <div key={`empty-${idx}`} className="calendar-day empty"></div>;
                                }

                                const dateStr = getFormattedDateString(day);
                                const isPast = dateStr < todayStr;

                                let dayClass = "calendar-day";
                                if (isPast) dayClass += " past";

                                const isCheckIn = searchFilters.checkIn === dateStr;
                                const isCheckOut = searchFilters.checkOut === dateStr;
                                const isInRange = searchFilters.checkIn && searchFilters.checkOut && dateStr > searchFilters.checkIn && dateStr < searchFilters.checkOut;

                                if (isCheckIn) dayClass += " selected-checkin";
                                if (isCheckOut) dayClass += " selected-checkout";
                                if (isInRange) dayClass += " selected-range";

                                return (
                                  <div 
                                    key={dateStr} 
                                    className={dayClass}
                                    onClick={() => {
                                      if (isPast) return;
                                      handleDayClick(dateStr);
                                    }}
                                  >
                                    {day.getDate()}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="search-field-divider"></div>
          
          <div className="search-field-col guest-field-col" ref={guestRef} onClick={() => { setIsGuestOpen(!isGuestOpen); setIsDestOpen(false); setIsCalendarOpen(false); }}>
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
