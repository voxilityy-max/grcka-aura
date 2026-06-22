export default function Filters({ filters, setFilters, maxPriceLimit = 250, clearFilters }) {
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
