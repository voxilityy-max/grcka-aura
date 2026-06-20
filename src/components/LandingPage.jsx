import React from 'react';
import Hero from './Hero';

export default function LandingPage({
  searchFilters,
  setSearchFilters,
  destinations,
  propertyTypes,
  properties,
  setIsSearchActive,
  onSelectDestination,
  setActiveTab,
  setSelectedProperty
}) {
  // Filter popular accommodations (rating >= 4.8, max 4 properties)
  const popularProperties = properties
    .filter(p => p.rating >= 4.7)
    .slice(0, 4);
  return (
    <div className="landing-page-wrapper">
      <Hero 
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        onSearch={() => {
          setIsSearchActive(true);
          setTimeout(() => {
            const el = document.getElementById('listings-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        destinations={destinations}
        propertyTypes={propertyTypes}
      />

      <div className="landing-sections-container">
        {/* 2. Popular Accommodation Section */}
        <section className="landing-section popular-section">
          <div className="section-header-centered">
            <h2 className="landing-section-title">Popularan smeštaj</h2>
            <p className="landing-section-subtitle">Pažljivo odabrani objekti sa najboljim ocenama naših putnika</p>
          </div>

          <div className="landing-properties-grid">
            {popularProperties.map(property => (
              <div 
                key={property.id} 
                className="landing-property-card animate-scale"
                onClick={() => setSelectedProperty(property)}
              >
                <div className="landing-card-image-wrapper">
                  <img src={property.image} alt={property.name} className="landing-card-img" />
                  <span className="landing-card-badge">★ {property.rating.toFixed(1)}</span>
                  <span className="landing-card-price">{property.price}€ / noć</span>
                </div>
                <div className="landing-card-content">
                  <span className="landing-card-type">{property.type} • {property.location}</span>
                  <h3 className="landing-card-name">{property.name}</h3>
                  <p className="landing-card-distance">🏖️ {property.distanceToBeach}m od plaže</p>
                  <button className="btn-landing-details">Prikaži detalje</button>
                </div>
              </div>
            ))}
          </div>

          <div className="section-footer-centered">
            <button 
              className="btn-landing-primary"
              onClick={() => {
                setIsSearchActive(true);
                setTimeout(() => {
                  const el = document.getElementById('listings-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              Prikaži sve smeštaje &rarr;
            </button>
          </div>
        </section>
        {/* 3. Destinations Grid Section */}
        <section className="landing-section destinations-section">
          <div className="section-header-centered">
            <h2 className="landing-section-title">Destinacije u našoj ponudi</h2>
            <p className="landing-section-subtitle">Izaberite neku od naših najpopularnijih letnjih regija i započnite pretragu</p>
          </div>

          <div className="landing-destinations-grid">
            {[
              { name: 'Tasos', count: '142 objekta', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
              { name: 'Sitonija', count: '98 objekata', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80' },
              { name: 'Kasandra', count: '124 objekta', img: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=400&q=80' },
              { name: 'Lefkada', count: '85 objekata', img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=400&q=80' },
              { name: 'Kefalonija', count: '67 objekata', img: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=400&q=80' },
              { name: 'Epir', count: '41 objekat', img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80' }
            ].map(dest => (
              <div 
                key={dest.name} 
                className="landing-destination-card animate-scale"
                onClick={() => onSelectDestination(dest.name)}
              >
                <img src={dest.img} alt={dest.name} className="landing-dest-img" />
                <div className="landing-dest-overlay"></div>
                <div className="landing-dest-content">
                  <h3 className="landing-dest-name">{dest.name}</h3>
                  <span className="landing-dest-count">{dest.count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Latest from Travel Guide Section */}
        <section className="landing-section blog-section">
          <div className="section-header-centered">
            <h2 className="landing-section-title">Turistički vodič & saveti</h2>
            <p className="landing-section-subtitle">Saznajte sve važne informacije za bezbedan i udoban put u Grčku</p>
          </div>

          <div className="landing-blog-grid">
            {[
              {
                title: 'Lekari i ambulante u Stavrosu, Asprovalti i Solunu',
                desc: 'Kompletan spisak zdravstvenih ustanova, dežurnih lekara koji govore srpski jezik i lokacije ambulanti.',
                img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80',
                tab: 'alerts'
              },
              {
                title: 'Prvi put na Lefkadi: Sve što treba da znate',
                desc: 'Korisni saveti o najlepšim plažama zapadne obale, vožnji po Lefkadi, i najboljim lokacijama za smeštaj.',
                img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80',
                tab: 'guide'
              },
              {
                title: 'Put automobilom do Tasosa preko Bugarske',
                desc: 'Detaljan opis rute sa graničnim prelazima, cenom putarina kroz Bugarsku i redom vožnje trajekata u Keramotiju.',
                img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
                tab: 'blog'
              }
            ].map((post, idx) => (
              <div 
                key={idx} 
                className="landing-blog-card animate-scale"
                onClick={() => {
                  setActiveTab(post.tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="landing-blog-img-wrapper">
                  <img src={post.img} alt={post.title} className="landing-blog-img" />
                </div>
                <div className="landing-blog-content">
                  <h3 className="landing-blog-title">{post.title}</h3>
                  <p className="landing-blog-desc">{post.desc}</p>
                  <span className="landing-blog-more">Pročitaj članak &rarr;</span>
                </div>
              </div>
            ))}
          </div>

          <div className="section-footer-centered">
            <button 
              className="btn-landing-secondary"
              onClick={() => {
                setActiveTab('blog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Posetite naš putni vodič
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
