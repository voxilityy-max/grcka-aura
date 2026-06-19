import React, { useState } from 'react';

const TRIP_DATA = {
  distances: {
    beograd: { mkd: 560, bul: 600 },
    novisad: { mkd: 640, bul: 680 },
    nis: { mkd: 320, bul: 360 },
    subotica: { mkd: 750, bul: 790 }
  },
  tollsSerbia: {
    beograd: { mkd: 1720, bul: 1510 },
    novisad: { mkd: 2010, bul: 1800 },
    nis: { mkd: 700, bul: 490 },
    subotica: { mkd: 2450, bul: 2240 }
  },
  greekDistances: {
    mkd: {
      kasandra: 110,
      sitonija: 130,
      tasos: 250,
      lefkada: 370,
      krit: 650,
      halkidiki: 160
    },
    bul: {
      kasandra: 150,
      sitonija: 170,
      tasos: 150,
      lefkada: 450,
      krit: 720,
      halkidiki: 170
    }
  },
  greekTolls: {
    mkd: {
      kasandra: 2.40,
      sitonija: 2.40,
      tasos: 8.00,
      lefkada: 12.80,
      krit: 35.00,
      halkidiki: 2.40
    },
    bul: {
      kasandra: 3.00,
      sitonija: 3.00,
      tasos: 4.40,
      lefkada: 16.00,
      krit: 39.00,
      halkidiki: 3.00
    }
  },
  ferry: {
    tasos: { car: 25.00, person: 5.00 },
    krit: { car: 85.00, person: 48.00 }
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

export default function TravelGuide({ currentUser, onOpenAuth }) {
  const [subTab, setSubTab] = useState('calculator'); // 'calculator', 'prices', 'card', 'info'
  
  // Calculator States
  const [calcInputs, setCalcInputs] = useState({
    startPoint: 'beograd',
    route: 'mkd',
    destination: 'kasandra',
    fuelType: 'petrol',
    consumption: 7,
    passengers: 2,
    roundTrip: true
  });

  // Search & Filters for Prices
  const [searchPrice, setSearchPrice] = useState('');
  const [selectedPriceCategory, setSelectedPriceCategory] = useState('all');

  // Viber Notification Mock
  const [viberSuccess, setViberSuccess] = useState(false);

  // Discount Card Mock claim animation
  const [cardClaimed, setCardClaimed] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCalcInputs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  // Perform calculations
  const calculateResult = () => {
    const { startPoint, route, destination, fuelType, consumption, passengers, roundTrip } = calcInputs;
    
    // Distances
    const distToBorder = TRIP_DATA.distances[startPoint][route];
    const distFromBorder = TRIP_DATA.greekDistances[route][destination];
    const totalDistanceOneWay = distToBorder + distFromBorder;
    const totalDistance = roundTrip ? totalDistanceOneWay * 2 : totalDistanceOneWay;

    // Fuel prices
    const fuelPrice = fuelType === 'petrol' ? 1.95 : 1.65;
    const fuelCostOneWay = (totalDistanceOneWay * (consumption / 100)) * fuelPrice;
    const fuelCost = roundTrip ? fuelCostOneWay * 2 : fuelCostOneWay;

    // Tolls Serbia (convert RSD to EUR roughly: RSD / 117.5)
    const tollSrbRsd = TRIP_DATA.tollsSerbia[startPoint][route];
    const tollSrbOneWay = parseFloat((tollSrbRsd / 117.5).toFixed(2));
    const tollSrb = roundTrip ? tollSrbOneWay * 2 : tollSrbOneWay;

    // Macedonia Tolls / Bulgaria Vignette
    let transitionToll = 0;
    if (route === 'mkd') {
      transitionToll = 6.50; // roughly 380 Denars one way
      if (roundTrip) transitionToll *= 2;
    } else {
      // Bulgaria vignette: flat cost (8 EUR for 1 week, 15 EUR for 1 month/round-trip)
      transitionToll = roundTrip ? 15.00 : 8.00;
    }

    // Greece Tolls
    const tollGrOneWay = TRIP_DATA.greekTolls[route][destination];
    const tollGr = roundTrip ? tollGrOneWay * 2 : tollGrOneWay;

    // Ferry (Tasos & Krit only)
    let ferryCost = 0;
    if (destination === 'tasos') {
      const oneWayFerry = TRIP_DATA.ferry.tasos.car + (TRIP_DATA.ferry.tasos.person * passengers);
      ferryCost = roundTrip ? oneWayFerry * 2 : oneWayFerry;
    } else if (destination === 'krit') {
      const oneWayFerry = TRIP_DATA.ferry.krit.car + (TRIP_DATA.ferry.krit.person * passengers);
      ferryCost = roundTrip ? oneWayFerry * 2 : oneWayFerry;
    }

    const totalTolls = tollSrb + transitionToll + tollGr + ferryCost;
    const totalTripCost = fuelCost + totalTolls;

    return {
      distance: totalDistance,
      fuelCost: parseFloat(fuelCost.toFixed(2)),
      tollSrb: parseFloat(tollSrb.toFixed(2)),
      transitionToll: parseFloat(transitionToll.toFixed(2)),
      tollGr: parseFloat(tollGr.toFixed(2)),
      ferryCost: parseFloat(ferryCost.toFixed(2)),
      totalTolls: parseFloat(totalTolls.toFixed(2)),
      total: parseFloat(totalTripCost.toFixed(2))
    };
  };

  const calcResults = calculateResult();

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
          🚗 Kalkulator Troškova Puta
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
        <div className="calc-layout animate-fade">
          {/* Inputs Section */}
          <div className="calc-form-card">
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
              Parametri Putovanja
            </h3>
            
            <div className="inquiry-form">
              <div className="form-field">
                <label htmlFor="calc-start">Polazište iz Srbije</label>
                <select id="calc-start" name="startPoint" value={calcInputs.startPoint} onChange={handleInputChange}>
                  <option value="beograd">Beograd</option>
                  <option value="novisad">Novi Sad</option>
                  <option value="nis">Niš</option>
                  <option value="subotica">Subotica</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="calc-route">Izbor Rute</label>
                <select id="calc-route" name="route" value={calcInputs.route} onChange={handleInputChange}>
                  <option value="mkd">Preko Severne Makedonije (Evzoni)</option>
                  <option value="bul">Preko Bugarske (Promahonas)</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="calc-destination">Destinacija u Grčkoj</label>
                <select id="calc-destination" name="destination" value={calcInputs.destination} onChange={handleInputChange}>
                  <option value="kasandra">Kasandra (Pefkohori)</option>
                  <option value="sitonija">Sitonija (Nikiti)</option>
                  <option value="halkidiki">Halkidiki (Atos/Uranopolis)</option>
                  <option value="tasos">Tasos (Limenas)</option>
                  <option value="lefkada">Lefkada (Nidri)</option>
                  <option value="krit">Krit (Iraklion)</option>
                </select>
              </div>

              <div className="host-form-grid" style={{ marginBottom: '1rem' }}>
                <div className="form-field">
                  <label htmlFor="calc-fuel">Tip goriva</label>
                  <select id="calc-fuel" name="fuelType" value={calcInputs.fuelType} onChange={handleInputChange}>
                    <option value="petrol">Bezolovni 95 (1.95 €/l)</option>
                    <option value="diesel">Eurodizel (1.65 €/l)</option>
                  </select>
                </div>
                
                <div className="form-field">
                  <label htmlFor="calc-cons">Potrošnja (L/100km)</label>
                  <input 
                    type="number" 
                    id="calc-cons" 
                    name="consumption" 
                    min="3" 
                    max="20" 
                    step="0.5" 
                    value={calcInputs.consumption} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>

              <div className="host-form-grid" style={{ marginBottom: '1rem' }}>
                <div className="form-field">
                  <label htmlFor="calc-pass">Broj putnika (za trajekt)</label>
                  <input 
                    type="number" 
                    id="calc-pass" 
                    name="passengers" 
                    min="1" 
                    max="9" 
                    value={calcInputs.passengers} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="form-field" style={{ display: 'flex', alignItems: 'center', marginTop: '1.8rem', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="calc-round" 
                    name="roundTrip" 
                    checked={calcInputs.roundTrip} 
                    onChange={handleInputChange} 
                    style={{ width: 'auto', transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                  <label htmlFor="calc-round" style={{ cursor: 'pointer', margin: 0, fontWeight: '600' }}>Povratno putovanje</label>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary Section */}
          <div className="calc-result-card">
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
              Obračun Troškova {calcInputs.roundTrip ? '(Povratni Put)' : '(Jedan Pravac)'}
            </h3>

            <div className="calc-summary-grid">
              <div className="calc-sum-box">
                <span className="calc-sum-label">Ukupna Kilometraža</span>
                <span className="calc-sum-val">{calcResults.distance} km</span>
              </div>
              <div className="calc-sum-box highlight">
                <span className="calc-sum-label">Ukupno za Put</span>
                <span className="calc-sum-val">{calcResults.total} €</span>
              </div>
            </div>

            {/* Visual Progress Breakdown */}
            <div className="calc-breakdown-details" style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>Struktura troškova:</h4>
              
              <div className="calc-breakdown-item">
                <div className="calc-item-header">
                  <span>⛽ Gorivo ({calcInputs.fuelType === 'petrol' ? 'Bezolovni 95' : 'Dizel'})</span>
                  <strong>{calcResults.fuelCost} €</strong>
                </div>
                <div className="calc-progress-bg">
                  <div className="calc-progress-fill fuel" style={{ width: `${Math.min(100, (calcResults.fuelCost / calcResults.total) * 100)}%` }}></div>
                </div>
              </div>

              <div className="calc-breakdown-item">
                <div className="calc-item-header">
                  <span>🇷🇸 Putarina Srbija</span>
                  <strong>{calcResults.tollSrb} €</strong>
                </div>
                <div className="calc-progress-bg">
                  <div className="calc-progress-fill srb" style={{ width: `${Math.min(100, (calcResults.tollSrb / calcResults.total) * 100)}%` }}></div>
                </div>
              </div>

              <div className="calc-breakdown-item">
                <div className="calc-item-header">
                  <span>{calcInputs.route === 'mkd' ? '🇲🇰 Putarina Makedonija' : '🇧🇬 Vinjeta Bugarska'}</span>
                  <strong>{calcResults.transitionToll} €</strong>
                </div>
                <div className="calc-progress-bg">
                  <div className="calc-progress-fill trans" style={{ width: `${Math.min(100, (calcResults.transitionToll / calcResults.total) * 100)}%` }}></div>
                </div>
              </div>

              <div className="calc-breakdown-item">
                <div className="calc-item-header">
                  <span>🇬🇷 Putarina Grčka</span>
                  <strong>{calcResults.tollGr} €</strong>
                </div>
                <div className="calc-progress-bg">
                  <div className="calc-progress-fill gr" style={{ width: `${Math.min(100, (calcResults.tollGr / calcResults.total) * 100)}%` }}></div>
                </div>
              </div>

              {calcResults.ferryCost > 0 && (
                <div className="calc-breakdown-item">
                  <div className="calc-item-header">
                    <span>🚢 Trajekt (Auto + {calcInputs.passengers} putnika)</span>
                    <strong>{calcResults.ferryCost} €</strong>
                  </div>
                  <div className="calc-progress-bg">
                    <div className="calc-progress-fill ferry" style={{ width: `${Math.min(100, (calcResults.ferryCost / calcResults.total) * 100)}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Visual Route Timeline */}
            <div className="calc-route-timeline" style={{ marginTop: '2rem', padding: '1.2rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.8rem', color: 'var(--text-main)', textAlign: 'center' }}>Šema Trase Putovanja</h4>
              
              <div className="route-steps">
                <div className="route-step">
                  <div className="route-step-circle">📍</div>
                  <span className="route-step-text" style={{ textTransform: 'capitalize' }}>{calcInputs.startPoint}</span>
                </div>
                
                <div className="route-line-connector">
                  <span>{calcResults.tollSrb}€</span>
                </div>

                <div className="route-step">
                  <div className="route-step-circle">🚧</div>
                  <span className="route-step-text">Granica SRB</span>
                </div>

                <div className="route-line-connector">
                  <span>{calcResults.transitionToll}€</span>
                </div>

                <div className="route-step">
                  <div className="route-step-circle">🚧</div>
                  <span className="route-step-text">{calcInputs.route === 'mkd' ? 'Evzoni (MKD)' : 'Promahonas (BG)'}</span>
                </div>

                <div className="route-line-connector">
                  <span>{calcResults.tollGr}€</span>
                </div>

                {calcResults.ferryCost > 0 && (
                  <>
                    <div className="route-step">
                      <div className="route-step-circle">🚢</div>
                      <span className="route-step-text">Luka / Trajekt</span>
                    </div>
                    <div className="route-line-connector">
                      <span>{calcResults.ferryCost}€</span>
                    </div>
                  </>
                )}

                <div className="route-step active">
                  <div className="route-step-circle">🏝️</div>
                  <span className="route-step-text" style={{ fontWeight: '700', color: 'var(--accent)' }}>
                    {calcInputs.destination === 'kasandra' ? 'Kasandra' : 
                     calcInputs.destination === 'sitonija' ? 'Sitonija' : 
                     calcInputs.destination === 'tasos' ? 'Tasos' : 
                     calcInputs.destination === 'lefkada' ? 'Lefkada' : 
                     calcInputs.destination === 'krit' ? 'Krit' : 'Halkidiki'}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
              Digitalna GrčkaAura Popust Kartica
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
                    <span>Grčka</span>Aura Club
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
                  <div className="club-card-brand"><span>Grčka</span>Aura Club</div>
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
                GrčkaAura Viber Zajednica
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
