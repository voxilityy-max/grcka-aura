import { useState, useEffect } from 'react';
import RoadPlanner from './RoadPlanner';
import BorderStatus from './BorderStatus';

const WEATHER_DATA = {
  Tasos: {
    temp: '30°C',
    seaTemp: '25°C',
    condition: 'Sunčano',
    icon: '☀️',
    wind: '8 km/h',
    uv: '8 (Visok)',
    humidity: '45%',
    description: 'Voda je topla i izuzetno mirna. Idealno za kupanje dece na Zlatnoj plaži (Golden Beach).',
    monthlyTemp: [
      { month: 'Maj', air: '22°C', sea: '18°C' },
      { month: 'Jun', air: '27°C', sea: '22°C' },
      { month: 'Jul', air: '31°C', sea: '25°C' },
      { month: 'Avg', air: '32°C', sea: '26°C' },
      { month: 'Sep', air: '26°C', sea: '23°C' },
      { month: 'Okt', air: '20°C', sea: '19°C' }
    ],
    forecast: [
      { day: 'Danas', temp: '30°C / 21°C', sea: '25°C', icon: '☀️', cond: 'Sunčano' },
      { day: 'Sutra', temp: '31°C / 22°C', sea: '25°C', icon: '☀️', cond: 'Sunčano' },
      { day: 'Prekosutra', temp: '29°C / 20°C', sea: '24°C', icon: '🌤️', cond: 'Malo oblačno' }
    ]
  },
  Lefkada: {
    temp: '31°C',
    seaTemp: '24°C',
    condition: 'Sunčano',
    icon: '☀️',
    wind: '12 km/h',
    uv: '9 (Vrlo visok)',
    humidity: '50%',
    description: 'Jonsko more na zapadnoj obali je osvežavajuće. Mogući su blagi popodnevni talasi na plaži Katizma.',
    monthlyTemp: [
      { month: 'Maj', air: '21°C', sea: '17°C' },
      { month: 'Jun', air: '26°C', sea: '21°C' },
      { month: 'Jul', air: '30°C', sea: '24°C' },
      { month: 'Avg', air: '31°C', sea: '25°C' },
      { month: 'Sep', air: '27°C', sea: '23°C' },
      { month: 'Okt', air: '21°C', sea: '20°C' }
    ],
    forecast: [
      { day: 'Danas', temp: '31°C / 22°C', sea: '24°C', icon: '☀️', cond: 'Sunčano' },
      { day: 'Sutra', temp: '32°C / 23°C', sea: '24°C', icon: '☀️', cond: 'Sunčano' },
      { day: 'Prekosutra', temp: '30°C / 21°C', sea: '23°C', icon: '☀️', cond: 'Sunčano' }
    ]
  },
  Sitonija: {
    temp: '30°C',
    seaTemp: '26°C',
    condition: 'Blag vetar',
    icon: '🌤️',
    wind: '10 km/h',
    uv: '8 (Visok)',
    humidity: '48%',
    description: 'Voda u zalivu je izuzetno topla i plitka. Savršeno za kupanje na plaži Karidi.',
    monthlyTemp: [
      { month: 'Maj', air: '22°C', sea: '19°C' },
      { month: 'Jun', air: '28°C', sea: '23°C' },
      { month: 'Jul', air: '31°C', sea: '26°C' },
      { month: 'Avg', air: '32°C', sea: '26°C' },
      { month: 'Sep', air: '27°C', sea: '24°C' },
      { month: 'Okt', air: '21°C', sea: '21°C' }
    ],
    forecast: [
      { day: 'Danas', temp: '30°C / 22°C', sea: '26°C', icon: '🌤️', cond: 'Blag vetar' },
      { day: 'Sutra', temp: '31°C / 23°C', sea: '26°C', icon: '☀️', cond: 'Sunčano' },
      { day: 'Prekosutra', temp: '31°C / 22°C', sea: '25°C', icon: '☀️', cond: 'Sunčano' }
    ]
  },
  Krf: {
    temp: '29°C',
    seaTemp: '23°C',
    condition: 'Sunčano',
    icon: '☀️',
    wind: '14 km/h',
    uv: '8 (Visok)',
    humidity: '52%',
    description: 'Voda je čista i bistra, ali tradicionalno nešto svežija nego na Egejskom moru.',
    monthlyTemp: [
      { month: 'Maj', air: '20°C', sea: '17°C' },
      { month: 'Jun', air: '25°C', sea: '20°C' },
      { month: 'Jul', air: '29°C', sea: '23°C' },
      { month: 'Avg', air: '30°C', sea: '24°C' },
      { month: 'Sep', air: '26°C', sea: '22°C' },
      { month: 'Okt', air: '20°C', sea: '19°C' }
    ],
    forecast: [
      { day: 'Danas', temp: '29°C / 20°C', sea: '23°C', icon: '☀️', cond: 'Sunčano' },
      { day: 'Sutra', temp: '29°C / 21°C', sea: '23°C', icon: '☀️', cond: 'Sunčano' },
      { day: 'Prekosutra', temp: '28°C / 19°C', sea: '22°C', icon: '🌤️', cond: 'Blago oblačno' }
    ]
  }
};

const GREECE_PRICES = [
  { item: 'Giros pita', price: '4.20€ - 4.80€', category: 'restoran', icon: '🌯', desc: 'Prosečna cena u brzim hranama i tavernama.' },
  { item: 'Giros porcija', price: '9.50€ - 12.00€', category: 'restoran', icon: '🍽️', desc: 'Uglavnom u tavernama sa prilogom (pomfrit, caciki).' },
  { item: 'Domaća (Grčka) kafa', price: '2.50€ - 3.50€', category: 'restoran', icon: '☕', desc: 'Cena u lokalnim kafićima na plaži.' },
  { item: 'Frape kafa', price: '3.00€ - 4.50€', category: 'restoran', icon: '🥤', desc: 'Tradicionalna hladna kafa sa penom.' },
  { item: 'Pivo (0.5l)', price: '4.00€ - 5.50€', category: 'restoran', icon: '🍺', desc: 'Točeno ili flaširano pivo u barovima.' },
  { item: 'Grčka salata', price: '7.50€ - 9.50€', category: 'restoran', icon: '🥗', desc: 'Tanjir za deljenje (paradajz, krastavac, feta, masline).' },
  { item: 'Lignje na žaru', price: '12.00€ - 15.00€', category: 'restoran', icon: '🦑', desc: 'Sveža porcija lignji sa limunom.' },
  { item: 'Hleb (vekna)', price: '1.10€ - 1.40€', category: 'supermarket', icon: '🍞', desc: 'U pekarama i većim marketima.' },
  { item: 'Mleko (1l)', price: '1.40€ - 1.80€', category: 'supermarket', icon: '🥛', desc: 'Sveže ili dugotrajno mleko.' },
  { item: 'Feta sir (1kg)', price: '10.00€ - 14.00€', category: 'supermarket', icon: '🧀', desc: 'Originalni grčki sir od ovčijeg/kozijeg mleka.' },
  { item: 'Jaja (10 komada)', price: '2.50€ - 3.20€', category: 'supermarket', icon: '🥚', desc: 'U zavisnosti od klase i marke.' },
  { item: 'Paket vode (6 x 1.5l)', price: '1.80€ - 2.50€', category: 'supermarket', icon: '🚰', desc: 'Najisplativija opcija za pijaću vodu.' },
  { item: 'Breskve / Kajsije (1kg)', price: '1.80€ - 2.50€', category: 'supermarket', icon: '🍑', desc: 'Na lokalnim pijacama ili u marketu.' },
  { item: 'Lubenica (1kg)', price: '0.60€ - 0.90€', category: 'supermarket', icon: '🍉', desc: 'Sezonska cena tokom jula i avgusta.' },
  { item: 'Set ležaljki (2 ležaljke + suncobran)', price: '12.00€ - 30.00€', category: 'plaza', icon: '⛱️', desc: 'Često uz obaveznu konzumaciju pića u toj vrednosti.' },
  { item: 'Najam čamca (bez dozvole, ceo dan)', price: '80.00€ - 130.00€', category: 'plaza', icon: '🚤', desc: 'Gorivo se plaća posebno na kraju najma.' },
  { item: 'Ulaznica za Akropolj (Atina)', price: '20.00€', category: 'plaza', icon: '🏛️', desc: 'Standardna cena za odrasle.' },
  { item: 'Vožnja bananom (po osobi)', price: '15.00€ - 20.00€', category: 'plaza', icon: '🏄', desc: 'U trajanju od 15-20 minuta.' }
];

const DISCOUNTS_LIST = [
  { shop: 'Taverna "Aegli" (Pefkohori, Kasandra)', discount: '-10%', category: 'Hrana i piće', desc: 'Popust na celokupan iznos računa za ručak ili večeru.' },
  { shop: 'Pekara "Hellas Bakery" (Nikiti, Sitonija)', discount: '-15%', category: 'Pekara', desc: 'Važi za sve vrste peciva, hleba i domaće pite.' },
  { shop: 'Lefkada Water Sports (Nidri, Lefkada)', discount: '-20%', category: 'Zabava', desc: 'Popust na najam pedolina, kajaka i vožnju bananom.' },
  { shop: 'Rent-a-car "Poseidon" (Tasos, Limenas)', discount: '-15%', category: 'Rent-a-car', desc: 'Popust na najam vozila duži od 3 dana (besplatno sedište za decu).' },
  { shop: 'Restoran "Thalassa" (Heraklion, Krit)', discount: '-10%', category: 'Hrana i piće', desc: 'Važi uz poručena dva ili više glavnih jela od sveže ribe.' }
];

export default function TravelGuide({ currentUser, onOpenAuth, initialSubTab, onSubTabChange, initialWeatherLoc }) {
  const [localSubTab, setLocalSubTab] = useState('calculator');
  const subTab = initialSubTab || localSubTab;
  const setSubTab = onSubTabChange || setLocalSubTab;

  // Weather Selected Location State
  const [selectedWeatherLoc, setSelectedWeatherLoc] = useState(initialWeatherLoc || 'Tasos');

  useEffect(() => {
    if (initialWeatherLoc) {
      setSelectedWeatherLoc(initialWeatherLoc);
    }
  }, [initialWeatherLoc]);

  // Search & Filters for Prices
  const [searchPrice, setSearchPrice] = useState('');
  const [selectedPriceCategory, setSelectedPriceCategory] = useState('all');

  // Viber Notification Mock
  const [viberSuccess, setViberSuccess] = useState(false);

  // Discount Card Mock claim animation
  const [cardClaimed, setCardClaimed] = useState(false);

  // Price category filter
  const filteredPrices = GREECE_PRICES.filter(p => {
    const matchesSearch = p.item.toLowerCase().includes(searchPrice.toLowerCase()) || 
                          p.desc.toLowerCase().includes(searchPrice.toLowerCase());
    const matchesCategory = selectedPriceCategory === 'all' || p.category === selectedPriceCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="guide-wrapper">
      {/* Sub tabs header */}
      <div className="forum-filters-bar" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
        <button 
          className={`btn-filter-item ${subTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setSubTab('calculator')}
        >
          🚗 Pametni Planer Puta
        </button>
        <button 
          className={`btn-filter-item ${subTab === 'borders' ? 'active' : ''}`}
          onClick={() => setSubTab('borders')}
        >
          🚧 Kamere & Stanje na Granicama
        </button>
        <button 
          className={`btn-filter-item ${subTab === 'weather' ? 'active' : ''}`}
          onClick={() => setSubTab('weather')}
        >
          ☀️ Vreme & Temp. Mora
        </button>
        <button 
          className={`btn-filter-item ${subTab === 'prices' ? 'active' : ''}`}
          onClick={() => setSubTab('prices')}
        >
          🛍️ Prosečne Cene u Grčkoj
        </button>
        <button 
          className={`btn-filter-item ${subTab === 'card' ? 'active' : ''}`}
          onClick={() => setSubTab('card')}
        >
          💳 Popust Kartica (Club)
        </button>
        <button 
          className={`btn-filter-item ${subTab === 'info' ? 'active' : ''}`}
          onClick={() => setSubTab('info')}
        >
          📞 Korisni Kontakti & Grupe
        </button>
      </div>

      {/* Content Render based on SubTab */}
      {subTab === 'calculator' && (
        <RoadPlanner currentUser={currentUser} onOpenAuth={onOpenAuth} />
      )}

      {subTab === 'borders' && (
        <BorderStatus />
      )}

      {/* Weather & Sea Surface Temp Tab */}
      {subTab === 'weather' && (
        <div className="weather-tab-layout animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Location Selector Tabs */}
          <div className="price-categories-filter" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.keys(WEATHER_DATA).map(loc => (
              <button
                key={loc}
                className={`btn-filter-item ${selectedWeatherLoc === loc ? 'active' : ''}`}
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setSelectedWeatherLoc(loc)}
              >
                <span>{WEATHER_DATA[loc].icon}</span> {loc}
              </button>
            ))}
          </div>

          {/* Current Weather Card */}
          {(() => {
            const w = WEATHER_DATA[selectedWeatherLoc];
            const seaTempNum = parseInt(w.seaTemp, 10);
            let advisoryText = "Voda je osvežavajuća i idealna za plivanje.";
            let advisoryClass = "orange";
            if (seaTempNum >= 25) {
              advisoryText = "Voda je izuzetno topla i savršena za decu i duži boravak u moru. 🏖️";
              advisoryClass = "green";
            } else if (seaTempNum < 23) {
              advisoryText = "Voda je nešto hladnija. Preporučuje se kraći boravak u vodi i postepeno prilagođavanje.";
              advisoryClass = "blue";
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {/* Left: Current Conditions */}
                  <div className="inquiries-panel-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '6rem', opacity: '0.12' }}>{w.icon}</div>
                    <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Trenutno vreme</span>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.5rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {w.temp} <span style={{ fontSize: '1.5rem', fontWeight: '400', color: 'var(--text-muted)' }}>/ {w.condition}</span>
                    </h3>
                    <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{w.description}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.2rem' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>💨 Vetar</span>
                        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>{w.wind}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>☀️ UV Indeks</span>
                        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>{w.uv}</div>
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>💧 Vlažnost vazduha</span>
                        <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>{w.humidity}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Sea Surface Temperature highlight */}
                  <div className="inquiries-panel-card" style={{ 
                    padding: '2rem', 
                    background: 'linear-gradient(135deg, rgba(10, 79, 112, 0.08) 0%, rgba(56, 189, 248, 0.08) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '2rem' }}>🌡️</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>Temperatura Mora</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Satelitska merenja u realnom vremenu</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '0.5rem 0' }}>
                      <span style={{ fontSize: '4.5rem', fontWeight: '900', color: 'var(--primary)', lineHeight: '1' }}>{w.seaTemp}</span>
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '600' }}>Temperatura vode</span>
                    </div>

                    <div style={{ 
                      marginTop: '1rem',
                      padding: '0.8rem 1rem', 
                      borderRadius: '8px', 
                      backgroundColor: advisoryClass === 'green' ? 'rgba(16, 185, 129, 0.1)' : advisoryClass === 'blue' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      borderLeft: `4px solid ${advisoryClass === 'green' ? '#10b981' : advisoryClass === 'blue' ? '#38bdf8' : '#f59e0b'}`,
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      fontWeight: '500'
                    }}>
                      {advisoryText}
                    </div>
                  </div>
                </div>

                {/* 3-Day Forecast & Monthly trend */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {/* Left: 3-Day Forecast */}
                  <div className="inquiries-panel-card" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem' }}>
                      📅 Trodnevna Prognoza
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {w.forecast.map((f, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                          <span style={{ fontWeight: '600', width: '90px', color: 'var(--text-main)' }}>{f.day}</span>
                          <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                          <span style={{ fontSize: '0.85rem', width: '100px', color: 'var(--text-muted)' }}>{f.cond}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{f.temp}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>🌊 More: {f.sea}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Monthly Sea Temp Trends */}
                  <div className="inquiries-panel-card" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem' }}>
                      📈 Prosečne Temperature po Mesecima
                    </h4>
                    <table className="db-table" style={{ margin: 0, width: '100%', fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Mesec</th>
                          <th>Prosek Vazduh</th>
                          <th>Prosek More</th>
                        </tr>
                      </thead>
                      <tbody>
                        {w.monthlyTemp.map((m, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{m.month}</td>
                            <td style={{ fontWeight: '600' }}>{m.air}</td>
                            <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{m.sea}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Prices List Tab */}
      {subTab === 'prices' && (
        <div className="prices-tab-layout animate-fade">
          <div className="forum-search-box" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Pretraži cene (npr. giros, ležaljke, kafa...)" 
              value={searchPrice} 
              onChange={e => setSearchPrice(e.target.value)}
              className="forum-search-input"
              style={{ flex: 1, minWidth: '250px' }}
            />
            
            <div className="price-categories-filter" style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn-filter-item ${selectedPriceCategory === 'all' ? 'active' : ''}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setSelectedPriceCategory('all')}
              >
                Sve Cene
              </button>
              <button 
                className={`btn-filter-item ${selectedPriceCategory === 'restoran' ? 'active' : ''}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setSelectedPriceCategory('restoran')}
              >
                🍕 Restorani & Barovi
              </button>
              <button 
                className={`btn-filter-item ${selectedPriceCategory === 'supermarket' ? 'active' : ''}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setSelectedPriceCategory('supermarket')}
              >
                🛒 Supermarketi
              </button>
              <button 
                className={`btn-filter-item ${selectedPriceCategory === 'plaza' ? 'active' : ''}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setSelectedPriceCategory('plaza')}
              >
                ⛱️ Plaže & Zabava
              </button>
            </div>
          </div>

          <div className="prices-grid">
            {filteredPrices.length > 0 ? (
              filteredPrices.map((p, idx) => (
                <div key={idx} className="price-card animate-scale">
                  <div className="price-card-header">
                    <span className="price-card-icon">{p.icon}</span>
                    <span className="price-card-title">{p.item}</span>
                  </div>
                  <div className="price-card-value">{p.price}</div>
                  <p className="price-card-desc">{p.desc}</p>
                  <span className={`price-badge ${p.category}`}>
                    {p.category === 'restoran' ? 'Restorani' : p.category === 'supermarket' ? 'Supermarket' : 'Plaža i Aktivnosti'}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Nema pronađenih cena za uneti pojam pretrage.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Discount Card Tab */}
      {subTab === 'card' && (
        <div className="card-tab-layout animate-fade">
          <div className="card-intro-box">
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem', textAlign: 'center' }}>
              Digitalna Ellinas Popust Kartica
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 1.5rem', textAlign: 'center' }}>
              Kao član našeg kluba, ostvarite popuste od 10% do 20% u odabranim tavernama, pekarama, rent-a-car agencijama i sportovima na vodi širom Grčke. Pokažite karticu na ekranu vašeg telefona prilikom plaćanja.
            </p>
          </div>

          {/* Hologram Card Display */}
          <div className="hologram-card-container">
            {currentUser ? (
              <div className={`club-card animate-fade ${cardClaimed ? 'claimed-pulse' : ''}`}>
                <div className="club-card-glow"></div>
                <div className="club-card-header">
                  <div className="club-card-brand">
                    <span>Elli</span>nas Club
                  </div>
                  <span className="club-card-status">AKTIVNA KARTICA</span>
                </div>

                <div className="club-card-body">
                  <div className="club-card-user-info">
                    <span className="cc-label">KORISNIK</span>
                    <span className="cc-value">{currentUser.fullName}</span>
                    <span className="cc-subval">{currentUser.email}</span>
                  </div>

                  <div className="club-card-qr-box">
                    <svg viewBox="0 0 100 100" className="club-card-qr">
                      <rect x="10" y="10" width="20" height="20" fill="currentColor" />
                      <rect x="15" y="15" width="10" height="10" fill="white" />
                      <rect x="70" y="10" width="20" height="20" fill="currentColor" />
                      <rect x="75" y="15" width="10" height="10" fill="white" />
                      <rect x="10" y="70" width="20" height="20" fill="currentColor" />
                      <rect x="15" y="75" width="10" height="10" fill="white" />
                      
                      <rect x="35" y="15" width="5" height="15" fill="currentColor" />
                      <rect x="45" y="10" width="15" height="5" fill="currentColor" />
                      <rect x="40" y="25" width="10" height="10" fill="currentColor" />
                      <rect x="55" y="20" width="5" height="15" fill="currentColor" />
                      <rect x="15" y="35" width="10" height="5" fill="currentColor" />
                      <rect x="10" y="45" width="5" height="10" fill="currentColor" />
                      
                      <rect x="35" y="45" width="30" height="30" fill="currentColor" />
                      <rect x="40" y="50" width="10" height="10" fill="white" />
                      <rect x="55" y="55" width="5" height="5" fill="white" />
                      <rect x="35" y="80" width="15" height="10" fill="currentColor" />
                      <rect x="70" y="45" width="20" height="10" fill="currentColor" />
                      <rect x="80" y="70" width="10" height="20" fill="currentColor" />
                      <rect x="55" y="80" width="10" height="5" fill="currentColor" />
                    </svg>
                  </div>
                </div>

                <div className="club-card-footer">
                  <div>
                    <span className="cc-label">BROJ KARTICE</span>
                    <span className="cc-value-code">GA-2026-{currentUser.id.toString().slice(-4)}</span>
                  </div>
                  <div>
                    <span className="cc-label">VAŽI DO</span>
                    <span className="cc-value-code">30.09.2026.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="club-card locked animate-fade" style={{ marginInline: 'auto' }}>
                <div className="lock-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <p style={{ fontWeight: '700', marginTop: '0.8rem', fontSize: '1rem', color: 'white' }}>Kartica je zaključana</p>
                  <p style={{ fontSize: '0.78rem', opacity: 0.9, color: 'white', maxWidth: '280px', marginInline: 'auto', marginTop: '0.2rem' }}>
                    Prijavite se na portal da biste automatski generisali svoju besplatnu digitalnu karticu sa popustima.
                  </p>
                  <button className="btn-search" style={{ marginTop: '1rem', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }} onClick={onOpenAuth}>
                    Prijavi se odmah
                  </button>
                </div>
                
                <div className="club-card-header" style={{ opacity: 0.2 }}>
                  <div className="club-card-brand"><span>Elli</span>nas Club</div>
                </div>
                <div className="club-card-body" style={{ opacity: 0.2 }}>
                  <div className="club-card-user-info">
                    <span className="cc-label">KORISNIK</span>
                    <span className="cc-value">Gost Portala</span>
                  </div>
                </div>
              </div>
            )}

            {currentUser && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button 
                  className="btn-card-details" 
                  onClick={() => {
                    setCardClaimed(true);
                    setTimeout(() => {
                      alert('Vaša digitalna popust kartica je uspešno pripremljena za preuzimanje! QR kod je aktivan.');
                      setCardClaimed(false);
                    }, 800);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  📥 Preuzmi karticu (PDF simulator)
                </button>
              </div>
            )}
          </div>

          {/* List of active discounts */}
          <div className="discounts-section" style={{ marginTop: '3rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
              Spisak partnerskih lokala i popusta (Sezona 2026)
            </h4>
            
            <div className="inquiries-table-wrapper" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <table className="inquiries-table">
                <thead>
                  <tr>
                    <th>Naziv partnera i lokacija</th>
                    <th>Kategorija</th>
                    <th>Popust</th>
                    <th>Detalji popusta</th>
                  </tr>
                </thead>
                <tbody>
                  {DISCOUNTS_LIST.map((d, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{d.shop}</td>
                      <td>
                        <span className={`status-badge orange`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                          {d.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem' }}>{d.discount}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Info Contacts & Viber Groups Tab */}
      {subTab === 'info' && (
        <div className="info-tab-layout animate-fade">
          <div className="info-grid">
            {/* Viber card */}
            <div className="viber-invite-card">
              <div className="viber-icon-box">💜</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
                Ellinas Viber Zajednica
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Pridružite se grupi sa preko 20,000 vozača i putnika. Pratite informacije o vremenu čekanja na granicama (Evzoni, Bogorodica, Preševo), radarskim patrolama, radovima na putu i cenama goriva u Grčkoj uživo!
              </p>
              
              {viberSuccess ? (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.6rem', borderRadius: '4px', textAlign: 'center', color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>
                  ✓ Uspešno ste se pridružili grupi! (Simulacija)
                </div>
              ) : (
                <button 
                  className="btn-submit-inquiry" 
                  style={{ backgroundColor: 'white', color: '#7360f2', border: 'none', fontWeight: '700', width: '100%', padding: '0.8rem' }}
                  onClick={() => {
                    setViberSuccess(true);
                    setTimeout(() => setViberSuccess(false), 5000);
                  }}
                >
                  Pridruži se Viber grupi
                </button>
              )}
            </div>

            {/* Useful numbers list */}
            <div className="inquiries-panel-card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem' }}>
                Važni Telefoni u Grčkoj
              </h4>
              <ul className="info-numbers-list">
                <li>
                  <span>🚨 Policija (Hitni pozivi)</span>
                  <strong>100</strong>
                </li>
                <li>
                  <span>🚑 Hitna pomoć (EKAB)</span>
                  <strong>166</strong>
                </li>
                <li>
                  <span>🚒 Vatrogasna služba</span>
                  <strong>199</strong>
                </li>
                <li>
                  <span>📞 Evropski broj za vanredne situacije</span>
                  <strong>112</strong>
                </li>
                <li>
                  <span>🚗 AMSS Pomoć na putu (Srbija partner)</span>
                  <strong>+381 11 1987</strong>
                </li>
                <li>
                  <span>🏢 Konzulat Republike Srbije u Solunu</span>
                  <strong>+30 2310 244 222</strong>
                </li>
              </ul>
            </div>
          </div>

          {/* Travel Regulations */}
          <div className="inquiries-panel-card" style={{ marginTop: '2rem', padding: '1.8rem' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Saobraćajni propisi i kazne u Grčkoj
            </h4>
            <div className="traffic-rules-grid">
              <div className="traffic-rule-item">
                <h5 style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.3rem' }}>Ograničenje brzine:</h5>
                <p>Naseljeno mesto: <strong>50 km/h</strong> | Van naselja: <strong>90 km/h</strong> | Autoput: <strong>130 km/h</strong></p>
              </div>
              <div className="traffic-rule-item">
                <h5 style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.3rem' }}>Obavezna oprema u vozilu:</h5>
                <p>Protivpožarni aparat (obavezan u Grčkoj), rezervni točak, sigurnosni trougao, komplet prve pomoći i reflektujući prsluk.</p>
              </div>
              <div className="traffic-rule-item">
                <h5 style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.3rem' }}>Karakteristične kazne (u evrima):</h5>
                <p>
                  • Nekorišćenje pojasa: <strong>350€</strong><br />
                  • Prolazak kroz crveno svetlo: <strong>700€</strong><br />
                  • Prekoračenje brzine na autoputu: <strong>od 40€ do 350€</strong><br />
                  • Telefoniranje u toku vožnje: <strong>100€</strong> (uz mogućnost oduzimanja dozvole)
                </p>
              </div>

          {/* Legal Disclaimer Box */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(230, 57, 70, 0.05)', borderLeft: '4px solid var(--danger)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>⚠️ Odricanje odgovornosti (Disclaimer):</strong> Brojevi telefona, saobraćajni propisi i zdravstveni kontakti su navedeni u informativne svrhe. Podaci o dežurnim lekarima, uslugama i kaznama nisu zvanični medicinski ili pravni saveti. Ellinas portal ne preuzima odgovornost za tačnost ovih informacija niti za eventualne neprijatnosti na putovanju. Pre polaska na put preporučujemo da obezbedite putno zdravstveno osiguranje i verifikujete brojeve telefona i propise.
          </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
