import { useState } from 'react';

const AMENITY_CATEGORIES = [
  {
    title: "Osnovni sadržaji",
    icon: "🏠",
    items: [
      { id: 'airConditioning', label: 'Klima uređaj' },
      { id: 'wifi', label: 'Besplatan Wi-Fi' },
      { id: 'tv', label: 'TV' },
      { id: 'fridge', label: 'Frižider' },
      { id: 'hairdryer', label: 'Fen za kosu' },
      { id: 'bathroom', label: 'Kupatilo' },
      { id: 'bathtub', label: 'Kada' },
      { id: 'shower', label: 'Tuš kabina' },
      { id: 'safe', label: 'Sigurnosni sef' },
      { id: 'mosquito_nets', label: 'Mreže za komarce' },
      { id: 'balcony', label: 'Balkon' },
      { id: 'extra_balcony', label: 'Dodatni balkon' },
      { id: 'washing_machine', label: 'Mašina za veš' },
      { id: 'coffee_maker', label: 'Aparat za kafu / kuvalo' },
      { id: 'oven', label: 'Šporet sa rernom' },
      { id: 'iron', label: 'Pegla' }
    ]
  },
  {
    title: "Spoljašnjost i parking",
    icon: "🌳",
    items: [
      { id: 'parking', label: 'Privatni parking' },
      { id: 'guaranteed_parking', label: 'Garantovan parking' },
      { id: 'garden', label: 'Uređeno dvorište' },
      { id: 'shade', label: 'Hlad u dvorištu' },
      { id: 'bbq', label: 'Zajednički roštilj' },
      { id: 'outdoor_shower', label: 'Spoljni tuš' },
      { id: 'playground', label: 'Igralište za decu' },
      { id: 'elevator', label: 'Lift' }
    ]
  },
  {
    title: "Bazen i plaža",
    icon: "🏖️",
    items: [
      { id: 'pool', label: 'Bazen' },
      { id: 'kids_pool', label: 'Dečji bazen' },
      { id: 'pool_loungers', label: 'Ležaljke pored bazena' },
      { id: 'seaview', label: 'Pogled na more' },
      { id: 'beachfront', label: 'Na samoj plaži' },
      { id: 'sandy_beach', label: 'Peščana plaža kod smeštaja' },
      { id: 'free_beach_sets', label: 'Besplatne ležaljke na plaži' },
      { id: 'beach_towels', label: 'Peškiri za plažu' },
      { id: 'jacuzzi', label: 'Spoljni đakuzi' }
    ]
  },
  {
    title: "Usluge i pravila",
    icon: "🛎️",
    items: [
      { id: 'pets', label: 'Dozvoljeni ljubimci' },
      { id: 'pets_negotiable', label: 'Ljubimci uz prethodan dogovor' },
      { id: 'small_pets', label: 'Dozvoljeni mali ljubimci' },
      { id: 'breakfast', label: 'Doručak' },
      { id: 'restaurant', label: 'Restoran u objektu' },
      { id: 'reception', label: 'Recepcija' },
      { id: 'quiet_location', label: 'Mirna lokacija' },
      { id: 'outside_town', label: 'Izvan mesta' },
      { id: 'babycot', label: 'Dečji krevetac na zahtev' },
      { id: 'free_babycot', label: 'Besplatan krevetac' },
      { id: 'wifi_common', label: 'WiFi u zajedničkim prostorijama' },
      { id: 'value_for_money', label: 'Odličan odnos cene i kvaliteta' },
      { id: 'disabled_access', label: 'Pristup za osobe sa invaliditetom' }
    ]
  }
];

export default function Filters({ filters, setFilters, maxPriceLimit = 250, clearFilters }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const activeMaxPrice = filters.maxPrice !== null && filters.maxPrice !== undefined ? filters.maxPrice : maxPriceLimit;

  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  const handleMinPriceChange = (e) => {
    const val = e.target.value;
    const parsed = parseInt(val, 10);
    setFilters(prev => ({
      ...prev,
      minPrice: val === '' || isNaN(parsed) ? null : Math.max(0, parsed)
    }));
  };

  const handleMaxPriceChange = (e) => {
    const val = e.target.value;
    const parsed = parseInt(val, 10);
    setFilters(prev => ({
      ...prev,
      maxPrice: val === '' || isNaN(parsed) ? null : Math.max(0, parsed)
    }));
  };

  const handleMinDistanceChange = (e) => {
    const val = e.target.value;
    const parsed = parseInt(val, 10);
    setFilters(prev => ({
      ...prev,
      minDistance: val === '' || isNaN(parsed) ? null : Math.max(0, parsed)
    }));
  };

  const handleMaxDistanceChange = (e) => {
    const val = e.target.value;
    const parsed = parseInt(val, 10);
    setFilters(prev => ({
      ...prev,
      maxDistance: val === '' || isNaN(parsed) ? 1200 : Math.max(0, parsed)
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [name]: checked
      }
    }));
  };

  const getPriceDisplay = () => {
    const hasMin = filters.minPrice !== null && filters.minPrice !== undefined && filters.minPrice !== '';
    const hasMax = filters.maxPrice !== null && filters.maxPrice !== undefined && filters.maxPrice !== 1000;
    if (hasMin && hasMax) {
      return `${filters.minPrice}€ - ${filters.maxPrice}€`;
    } else if (hasMin) {
      return `Preko ${filters.minPrice}€`;
    } else if (hasMax) {
      return `Do ${filters.maxPrice}€`;
    }
    return 'Bilo koja cena';
  };

  const getDistanceDisplay = () => {
    const hasMin = filters.minDistance !== null && filters.minDistance !== undefined && filters.minDistance !== '';
    const hasMax = filters.maxDistance !== null && filters.maxDistance !== undefined && filters.maxDistance !== 1200;
    if (hasMin && hasMax) {
      return `${filters.minDistance}m - ${filters.maxDistance}m`;
    } else if (hasMin) {
      return `Preko ${filters.minDistance}m`;
    } else if (hasMax) {
      return `Do ${filters.maxDistance}m`;
    }
    return 'Bilo koja';
  };

  return (
    <aside className={`filters-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="filters-header" onClick={() => { if (window.innerWidth <= 992) setIsMobileOpen(!isMobileOpen); }} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3>Filteri</h3>
          <span className={`filters-mobile-chevron ${isMobileOpen ? 'open' : ''}`}></span>
        </div>
        <button 
          className="btn-clear-filters" 
          onClick={(e) => { e.stopPropagation(); clearFilters(); }}
        >
          Poništi sve
        </button>
      </div>
      
      <div className="filters-content-wrapper">
        {/* Price Range Filter */}
        <div className="filter-section">
          <h4 className="filter-section-title">Maks. cena po noćenju</h4>
          <div className="range-inputs">
            <div className="manual-range-row">
              <div className="manual-range-field">
                <span>Od:</span>
                <div className="manual-input-box-wrapper">
                  <input 
                    type="number" 
                    className="manual-filter-input"
                    placeholder="Min"
                    value={filters.minPrice === null || filters.minPrice === undefined ? '' : filters.minPrice}
                    onChange={handleMinPriceChange}
                    min="0"
                  />
                  <span className="manual-input-suffix">€</span>
                </div>
              </div>
              <div className="manual-range-field">
                <span>Do:</span>
                <div className="manual-input-box-wrapper">
                  <input 
                    type="number" 
                    className="manual-filter-input"
                    placeholder="Max"
                    value={filters.maxPrice === null || filters.maxPrice === undefined ? '' : filters.maxPrice}
                    onChange={handleMaxPriceChange}
                    min="20"
                  />
                  <span className="manual-input-suffix">€</span>
                </div>
              </div>
            </div>
            <input 
              type="range" 
              name="maxPrice" 
              min="20" 
              max={maxPriceLimit} 
              value={Math.min(activeMaxPrice, maxPriceLimit)} 
              onChange={handleRangeChange}
            />
            <div className="range-values">
              <span>20€</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                {getPriceDisplay()}
              </span>
              <span>1000+€</span>
            </div>
          </div>
        </div>
        
        {/* Distance to Beach Filter */}
        <div className="filter-section">
          <h4 className="filter-section-title">Udaljenost od plaže</h4>
          <div className="range-inputs">
            <div className="manual-range-row">
              <div className="manual-range-field">
                <span>Od:</span>
                <div className="manual-input-box-wrapper">
                  <input 
                    type="number" 
                    className="manual-filter-input"
                    placeholder="Min"
                    value={filters.minDistance === null || filters.minDistance === undefined ? '' : filters.minDistance}
                    onChange={handleMinDistanceChange}
                    min="0"
                  />
                  <span className="manual-input-suffix">m</span>
                </div>
              </div>
              <div className="manual-range-field">
                <span>Do:</span>
                <div className="manual-input-box-wrapper">
                  <input 
                    type="number" 
                    className="manual-filter-input"
                    placeholder="Max"
                    value={filters.maxDistance === null || filters.maxDistance === undefined || filters.maxDistance === 1200 ? '' : filters.maxDistance}
                    onChange={handleMaxDistanceChange}
                    min="10"
                  />
                  <span className="manual-input-suffix">m</span>
                </div>
              </div>
            </div>
            <input 
              type="range" 
              name="maxDistance" 
              min="10" 
              max="1200" 
              step="10"
              value={Math.min(filters.maxDistance, 1200)} 
              onChange={handleRangeChange}
            />
            <div className="range-values">
              <span>10m</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                {getDistanceDisplay()}
              </span>
              <span>1200m+</span>
            </div>
            <div className="beach-checkbox-wrapper">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="beachfront" 
                  checked={filters.amenities.beachfront} 
                  onChange={handleCheckboxChange}
                />
                Na samoj plaži
              </label>
            </div>
          </div>
        </div>
        
        {/* Amenities Filter */}
        <div className="filter-section">
          <h4 className="filter-section-title">Sadržaj i pogodnosti</h4>
          
          {!showAllAmenities ? (
            <div className="checkbox-group">
              {[
                { id: 'wifi', label: 'WiFi internet' },
                { id: 'airConditioning', label: 'Klima uređaj' },
                { id: 'parking', label: 'Parking' },
                { id: 'pool', label: 'Bazen' },
                { id: 'beachfront', label: 'Na samoj plaži' },
                { id: 'seaview', label: 'Pogled na more' },
                { id: 'pets', label: 'Dozvoljeni ljubimci' },
                { id: 'washing_machine', label: 'Mašina za veš' }
              ].map(item => (
                <label className="checkbox-label" key={item.id}>
                  <input 
                    type="checkbox" 
                    name={item.id} 
                    checked={!!filters.amenities[item.id]} 
                    onChange={handleCheckboxChange}
                  />
                  {item.label}
                </label>
              ))}
              <button 
                type="button" 
                className="listings-view-details-btn"
                style={{
                  marginTop: '0.8rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  background: 'rgba(0, 242, 254, 0.1)',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  color: '#00f2fe',
                  width: '100%',
                  borderRadius: '6px',
                  fontWeight: '600'
                }}
                onClick={() => setShowAllAmenities(true)}
              >
                🔍 Prikaži svih 45 pogodnosti
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {AMENITY_CATEGORIES.map((cat, idx) => (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h5 style={{ margin: '0 0 0.6rem 0', color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{cat.icon}</span> {cat.title}
                  </h5>
                  <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {cat.items.map(item => (
                      <label className="checkbox-label" key={item.id} style={{ fontSize: '0.85rem' }}>
                        <input 
                          type="checkbox" 
                          name={item.id} 
                          checked={!!filters.amenities[item.id]} 
                          onChange={handleCheckboxChange}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                className="listings-view-details-btn"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  width: '100%',
                  borderRadius: '6px'
                }}
                onClick={() => setShowAllAmenities(false)}
              >
                Sakrij spisak pogodnosti
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
