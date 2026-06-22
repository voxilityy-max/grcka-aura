

import { useState } from 'react';
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

  const [destFilter, setDestFilter] = useState('all');

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
        <section className="destinations-section-neon">
          <div className="destinations-neon-radial"></div>
          
          <div className="max-width-1200 relative-z10">
            <div className="text-center-mb16">
              <h2 className="destinations-neon-title">
                Destinacije u našoj ponudi
              </h2>
              <p className="destinations-neon-subtitle">
                Izaberite neku od naših najpopularnijih letnjih regija i započnite pretragu
              </p>
            </div>
            {/* Destinations Grid */}
            <div className="destinations-neon-grid" id="destGrid">
              {[
                { name: 'Tasos', tagline: 'Smaragdno ostrvo', rating: 4.96, count: '28 vila', categories: ['all', 'premium'], img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
                { name: 'Sitonija', tagline: 'Raj za plaže', rating: 4.88, count: '98 objekata', categories: ['all', 'pool'], img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80' },
                { name: 'Kasandra', tagline: 'Letnji ritam', rating: 4.75, count: '124 objekta', categories: ['all'], img: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80' }
              ]
              .map(dest => (
                <div 
                  key={dest.name} 
                  className="dest-neon-item group"
                  onClick={() => onSelectDestination(dest.name)}
                >
                  <div className="dest-neon-img-container">
                    <img 
                      src={dest.img} 
                      alt={dest.name} 
                      className="dest-neon-img" 
                    />
                  </div>
                  <p className="dest-neon-name">{dest.name}</p>
                </div>
              ))}
            </div>
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

