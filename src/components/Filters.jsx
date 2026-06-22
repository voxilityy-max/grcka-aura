export default function Filters({ filters, setFilters, maxPriceLimit = 250, clearFilters }) {
  const activeMaxPrice = filters.maxPrice !== null && filters.maxPrice !== undefined ? filters.maxPrice : maxPriceLimit;

  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: parseInt(value, 10)
    }));
  };

  const handleManualPriceChange = (e) => {
    const val = e.target.value;
    const parsed = parseInt(val, 10);
    setFilters(prev => ({
      ...prev,
      maxPrice: val === '' || isNaN(parsed) ? null : Math.max(0, parsed)
    }));
  };

  const handleManualDistanceChange = (e) => {
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

  return (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <h3>Filteri</h3>
        <button className="btn-clear-filters" onClick={clearFilters}>
          Poništi sve
        </button>
      </div>
      
      {/* Price Range Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">Maks. cena po noćenju</h4>
        <div className="range-inputs">
          <div className="manual-input-row">
            <span>Ručni unos:</span>
            <div className="manual-input-box-wrapper">
              <input 
                type="number" 
                className="manual-filter-input"
                placeholder="Bilo koja cena"
                value={filters.maxPrice === null || filters.maxPrice === undefined ? '' : filters.maxPrice}
                onChange={handleManualPriceChange}
                min="20"
              />
              <span className="manual-input-suffix">€</span>
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
              {filters.maxPrice === null || filters.maxPrice === undefined ? 'Bilo koja cena' : `Do ${filters.maxPrice}€`}
            </span>
            <span>1000+€</span>
          </div>
        </div>
      </div>
      
      {/* Distance to Beach Filter */}
      <div className="filter-section">
        <h4 className="filter-section-title">Udaljenost od plaže</h4>
        <div className="range-inputs">
          <div className="manual-input-row">
            <span>Ručni unos:</span>
            <div className="manual-input-box-wrapper">
              <input 
                type="number" 
                className="manual-filter-input"
                placeholder="Bilo koja"
                value={filters.maxDistance === null || filters.maxDistance === undefined || filters.maxDistance === 1200 ? '' : filters.maxDistance}
                onChange={handleManualDistanceChange}
                min="10"
              />
              <span className="manual-input-suffix">m</span>
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
              {filters.maxDistance >= 1200 ? 'Bilo koja' : `Do ${filters.maxDistance}m`}
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
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="wifi" 
              checked={filters.amenities.wifi} 
              onChange={handleCheckboxChange}
            />
            Besplatan Wi-Fi
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="pool" 
              checked={filters.amenities.pool} 
              onChange={handleCheckboxChange}
            />
            Bazen
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="parking" 
              checked={filters.amenities.parking} 
              onChange={handleCheckboxChange}
            />
            Besplatan parking
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="airConditioning" 
              checked={filters.amenities.airConditioning} 
              onChange={handleCheckboxChange}
            />
            Klima uređaj
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="pets" 
              checked={filters.amenities.pets} 
              onChange={handleCheckboxChange}
            />
            Dozvoljeni ljubimci
          </label>
        </div>
      </div>
    </aside>
  );
}
