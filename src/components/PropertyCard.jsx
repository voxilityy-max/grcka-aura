import React from 'react';

export default function PropertyCard({ property, onViewDetails, isWishlisted, onToggleWishlist, isCompared, onToggleCompare }) {
  const { id, title, type, location, price, rating, distanceToBeach, image, guests, bedrooms } = property;

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onToggleWishlist(id);
  };

  const handleCompareClick = (e) => {
    e.stopPropagation();
    onToggleCompare(id);
  };

  return (
    <article className="property-card animate-fade">
      <div className="card-image-container">
        <img 
          src={image} 
          alt={title} 
          className="card-image"
          loading="lazy"
        />
        <span className="card-tag">{type}</span>
        
        {/* Floating Wishlist Button */}
        <button 
          className={`btn-card-wishlist ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Ukloni iz omiljenih" : "Dodaj u omiljene"}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Floating Compare Checkbox Badge */}
        <div className="card-compare-badge" onClick={handleCompareClick}>
          <input 
            type="checkbox" 
            checked={isCompared} 
            onChange={() => {}} // Controlled by outer div click
            style={{ pointerEvents: 'none' }}
          />
          <span>Uporedi</span>
        </div>
      </div>

      <div className="card-content">
        <div className="card-header-info">
          <span className="card-location">{location}</span>
          <div className="card-rating">
            <svg viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        <h3 className="card-title">{title}</h3>

        <div className="card-details">
          <div className="card-detail-item">
            {/* Waves / Beach icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6c.6.5 1.2 1 2.5 1C5.8 7 7 6 7 6s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1 2.5 1 2.5 1"></path>
              <path d="M2 12c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1 2.5 1 2.5 1"></path>
              <path d="M2 18c.6.5 1.2 1 2.5 1 1.3 0 2.5-1 2.5-1s1.2-1 2.5-1c1.3 0 2.5 1 2.5 1s1.2 1 2.5 1c1.3 0 2.5-1 2.5-1s1.2-1 2.5-1 2.5 1 2.5 1"></path>
            </svg>
            <span>{distanceToBeach}m od plaže</span>
          </div>
          <div className="card-detail-item">
            {/* Users icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{guests} osobe</span>
          </div>
          <div className="card-detail-item">
            {/* Bed icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4v16M2 8h20M2 12h20M22 4v16M18 12v4M4 12v4" />
            </svg>
            <span>{bedrooms} {bedrooms === 1 ? 'soba' : bedrooms < 5 ? 'sobe' : 'soba'}</span>
          </div>
        </div>

        <div className="card-footer">
          <div className="card-price">
            od <span className="card-price-value">{price}€</span> / noć
          </div>
          <button 
            type="button" 
            className="btn-card-details"
            onClick={onViewDetails}
          >
            Detalji
          </button>
        </div>
      </div>
    </article>
  );
}
