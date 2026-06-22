import { useState, useMemo } from 'react';

export default function RoadPlanner({ currentUser, onOpenAuth }) {
  const [startPoint, setStartPoint] = useState('Beograd');
  const [destination, setDestination] = useState('Sitonija');
  const [routeType, setRouteType] = useState('MKD'); // 'MKD' (preko Makedonije) or 'BGR' (preko Bugarske)
  const [fuelType, setFuelType] = useState('dizel'); // 'benzin', 'dizel', 'lpg'
  const [consumption, setConsumption] = useState(6.5); // l/100km

  const isRomanianStart = ['Temišvar', 'Bukurešt', 'Kluž', 'Krajova'].includes(startPoint);

  // Default average fuel prices (in EUR) per country and fuel type
  const defaultFuelPrices = {
    benzin: { SRB: 1.68, MKD: 1.30, BGR: 1.35, GRC: 1.92, ROU: 1.42 },
    dizel:  { SRB: 1.76, MKD: 1.22, BGR: 1.30, GRC: 1.66, ROU: 1.48 },
    lpg:    { SRB: 0.85, MKD: 0.68, BGR: 0.70, GRC: 0.95, ROU: 0.75 },
  };

  // State for user-adjustable fuel prices
  const [fuelPrices, setFuelPrices] = useState({
    SRB: defaultFuelPrices[fuelType].SRB,
    MKD: defaultFuelPrices[fuelType].MKD,
    BGR: defaultFuelPrices[fuelType].BGR,
    GRC: defaultFuelPrices[fuelType].GRC,
    ROU: defaultFuelPrices[fuelType].ROU,
  });

  // Automatically sync sliders when fuel type changes
  const handleFuelTypeChange = (type) => {
    setFuelType(type);
    setFuelPrices({
      SRB: defaultFuelPrices[type].SRB,
      MKD: defaultFuelPrices[type].MKD,
      BGR: defaultFuelPrices[type].BGR,
      GRC: defaultFuelPrices[type].GRC,
      ROU: defaultFuelPrices[type].ROU,
    });
  };

  const startingPoints = ['Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Skoplje', 'Temišvar', 'Bukurešt', 'Kluž', 'Krajova'];

  const destinations = [
    { id: 'Sitonija',    name: 'Sitonija (Halkidiki)' },
    { id: 'Kasandra',    name: 'Kasandra (Halkidiki)' },
    { id: 'Tasos',       name: 'Tasos (Keramoti)' },
    { id: 'Lefkada',     name: 'Lefkada' },
    { id: 'Krf',         name: 'Krf (Igumenica)' },
    { id: 'Epir',        name: 'Epir (Parga/Sivota)' },
    { id: 'Kavala',      name: 'Kavala' },
    { id: 'Atos',        name: 'Atos (Uranopolis)' }
  ];

  // Route database mapping [start][destination][routeType]
  const routeDatabase = {
    Beograd: {
      Sitonija:  { MKD: { dist: 740, time: '7h 45m' } },
      Kasandra:  { MKD: { dist: 730, time: '7h 35m' } },
      Tasos:     { MKD: { dist: 800, time: '8h 25m' }, BGR: { dist: 760, time: '8h 15m' } },
      Lefkada:   { MKD: { dist: 950, time: '10h 15m' } },
      Krf:       { MKD: { dist: 900, time: '9h 30m' } },
      Epir:      { MKD: { dist: 920, time: '9h 45m' } },
      Kavala:    { MKD: { dist: 770, time: '8h 05m' }, BGR: { dist: 730, time: '7h 55m' } },
      Atos:      { MKD: { dist: 780, time: '8h 15m' } },
    },
    'Novi Sad': {
      Sitonija:  { MKD: { dist: 820, time: '8h 35m' } },
      Kasandra:  { MKD: { dist: 810, time: '8h 25m' } },
      Tasos:     { MKD: { dist: 880, time: '9h 15m' }, BGR: { dist: 840, time: '9h 05m' } },
      Lefkada:   { MKD: { dist: 1030, time: '11h 05m' } },
      Krf:       { MKD: { dist: 980, time: '10h 20m' } },
      Epir:      { MKD: { dist: 1000, time: '10h 35m' } },
      Kavala:    { MKD: { dist: 850, time: '8h 55m' }, BGR: { dist: 810, time: '8h 45m' } },
      Atos:      { MKD: { dist: 860, time: '9h 05m' } },
    },
    Niš: {
      Sitonija:  { MKD: { dist: 540, time: '5h 45m' } },
      Kasandra:  { MKD: { dist: 530, time: '5h 35m' } },
      Tasos:     { MKD: { dist: 600, time: '6h 25m' }, BGR: { dist: 560, time: '6h 15m' } },
      Lefkada:   { MKD: { dist: 750, time: '8h 15m' } },
      Krf:       { MKD: { dist: 700, time: '7h 30m' } },
      Epir:      { MKD: { dist: 720, time: '7h 45m' } },
      Kavala:    { MKD: { dist: 570, time: '6h 05m' }, BGR: { dist: 530, time: '5h 55m' } },
      Atos:      { MKD: { dist: 580, time: '6h 15m' } },
    },
    Kragujevac: {
      Sitonija:  { MKD: { dist: 640, time: '6h 55m' } },
      Kasandra:  { MKD: { dist: 630, time: '6h 45m' } },
      Tasos:     { MKD: { dist: 700, time: '7h 35m' }, BGR: { dist: 660, time: '7h 25m' } },
      Lefkada:   { MKD: { dist: 850, time: '9h 25m' } },
      Krf:       { MKD: { dist: 800, time: '8h 40m' } },
      Epir:      { MKD: { dist: 820, time: '8h 55m' } },
      Kavala:    { MKD: { dist: 670, time: '7h 15m' }, BGR: { dist: 630, time: '7h 05m' } },
      Atos:      { MKD: { dist: 680, time: '7h 25m' } },
    },
    Subotica: {
      Sitonija:  { MKD: { dist: 920, time: '9h 35m' } },
      Kasandra:  { MKD: { dist: 910, time: '9h 25m' } },
      Tasos:     { MKD: { dist: 980, time: '10h 15m' }, BGR: { dist: 940, time: '10h 05m' } },
      Lefkada:   { MKD: { dist: 1130, time: '12h 05m' } },
      Krf:       { MKD: { dist: 1080, time: '11h 20m' } },
      Epir:      { MKD: { dist: 1100, time: '11h 35m' } },
      Kavala:    { MKD: { dist: 950, time: '9h 55m' }, BGR: { dist: 910, time: '9h 45m' } },
      Atos:      { MKD: { dist: 960, time: '10h 05m' } },
    },
    Skoplje: {
      Sitonija:  { MKD: { dist: 320, time: '3h 30m' } },
      Kasandra:  { MKD: { dist: 310, time: '3h 20m' } },
      Tasos:     { MKD: { dist: 380, time: '4h 10m' }, BGR: { dist: 420, time: '4h 50m' } },
      Lefkada:   { MKD: { dist: 530, time: '6h 00m' } },
      Krf:       { MKD: { dist: 480, time: '5h 15m' } },
      Epir:      { MKD: { dist: 500, time: '5h 30m' } },
      Kavala:    { MKD: { dist: 350, time: '3h 50m' }, BGR: { dist: 390, time: '4h 30m' } },
      Atos:      { MKD: { dist: 360, time: '4h 00m' } },
    },
    Bukurešt: {
      Sitonija:  { BGR: { dist: 760, time: '9h 30m' } },
      Kasandra:  { BGR: { dist: 750, time: '9h 20m' } },
      Tasos:     { BGR: { dist: 620, time: '8h 00m' } },
      Lefkada:   { BGR: { dist: 980, time: '12h 00m' } },
      Krf:       { BGR: { dist: 950, time: '11h 30m' } },
      Epir:      { BGR: { dist: 930, time: '11h 15m' } },
      Kavala:    { BGR: { dist: 590, time: '7h 35m' } },
      Atos:      { BGR: { dist: 800, time: '10h 00m' } },
    },
    Temišvar: {
      Sitonija:  { BGR: { dist: 780, time: '9h 45m' } },
      Kasandra:  { BGR: { dist: 770, time: '9h 35m' } },
      Tasos:     { BGR: { dist: 800, time: '10h 15m' } },
      Lefkada:   { BGR: { dist: 990, time: '12h 15m' } },
      Krf:       { BGR: { dist: 970, time: '11h 45m' } },
      Epir:      { BGR: { dist: 950, time: '11h 30m' } },
      Kavala:    { BGR: { dist: 740, time: '9h 30m' } },
      Atos:      { BGR: { dist: 820, time: '10h 30m' } },
    },
    Kluž: {
      Sitonija:  { BGR: { dist: 1040, time: '13h 00m' } },
      Kasandra:  { BGR: { dist: 1030, time: '12h 50m' } },
      Tasos:     { BGR: { dist: 980, time: '12h 15m' } },
      Lefkada:   { BGR: { dist: 1260, time: '15h 30m' } },
      Krf:       { BGR: { dist: 1230, time: '15h 00m' } },
      Epir:      { BGR: { dist: 1210, time: '14h 45m' } },
      Kavala:    { BGR: { dist: 920, time: '11h 30m' } },
      Atos:      { BGR: { dist: 1080, time: '13h 45m' } },
    },
    Krajova: {
      Sitonija:  { BGR: { dist: 580, time: '7h 45m' } },
      Kasandra:  { BGR: { dist: 570, time: '7h 35m' } },
      Tasos:     { BGR: { dist: 620, time: '8h 30m' } },
      Lefkada:   { BGR: { dist: 800, time: '10h 15m' } },
      Krf:       { BGR: { dist: 770, time: '9h 45m' } },
      Epir:      { BGR: { dist: 750, time: '9h 30m' } },
      Kavala:    { BGR: { dist: 560, time: '7h 50m' } },
      Atos:      { BGR: { dist: 620, time: '8h 30m' } },
    }
  };

  // Determine available route options for the selected start and destination
  const availableRoutes = useMemo(() => {
    const startData = routeDatabase[startPoint];
    if (!startData) return ['MKD'];
    const destData = startData[destination];
    if (!destData) return ['MKD'];
    return Object.keys(destData);
  }, [startPoint, destination]);

  // Adjust routeType if the selected one is not available
  useMemo(() => {
    if (!availableRoutes.includes(routeType)) {
      setRouteType(availableRoutes[0] || 'MKD');
    }
  }, [availableRoutes, routeType]);

  const activeRouteInfo = useMemo(() => {
    const defaultVal = { dist: 750, time: '8h 00m' };
    const startData = routeDatabase[startPoint];
    if (!startData) return defaultVal;
    const destData = startData[destination];
    if (!destData) return defaultVal;
    return destData[routeType] || Object.values(destData)[0] || defaultVal;
  }, [startPoint, destination, routeType]);

  // Calculate toll costs and list toll booths
  const calculationData = useMemo(() => {
    let tolls = [];
    let totalTolls = 0;

    // 1. Romania or Serbia Tolls
    if (isRomanianStart) {
      // Romanian Vignette (Rovinieta)
      tolls.push({ name: 'Rovinieta (Rumunska vinjeta - 7 dana)', cost: 3.00, currency: 'EUR' });
      totalTolls += 3.00;

      // Danube Bridge Toll
      if (startPoint === 'Bukurešt' || startPoint === 'Kluž') {
        tolls.push({ name: 'Mostarina Dunav (Giurgiu ➔ Ruse)', cost: 3.00, currency: 'EUR' });
        totalTolls += 3.00;
      } else if (startPoint === 'Temišvar' || startPoint === 'Krajova') {
        tolls.push({ name: 'Mostarina Dunav (Calafat ➔ Vidin)', cost: 6.00, currency: 'EUR' });
        totalTolls += 6.00;
      }
    } else if (startPoint !== 'Skoplje') {
      let srbToll = 0;
      let label = '';
      switch (startPoint) {
        case 'Subotica':
          srbToll = 21.00;
          label = 'Naplatna rampa Subotica ➔ Preševo';
          break;
        case 'Novi Sad':
          srbToll = 17.00;
          label = 'Naplatna rampa Novi Sad ➔ Preševo';
          break;
        case 'Kragujevac':
          srbToll = 10.50;
          label = 'Naplatna rampa Kragujevac ➔ Preševo';
          break;
        case 'Niš':
          srbToll = 6.00;
          label = 'Naplatna rampa Niš ➔ Preševo';
          break;
        case 'Beograd':
        default:
          srbToll = 15.00;
          label = 'Naplatna rampa Beograd (Vrčin) ➔ Preševo';
          break;
      }
      if (routeType === 'BGR') {
        // Going to Bulgaria instead of Macedonia
        switch (startPoint) {
          case 'Subotica': srbToll = 17.50; label = 'Subotica ➔ Dimitrovgrad'; break;
          case 'Novi Sad': srbToll = 13.50; label = 'Novi Sad ➔ Dimitrovgrad'; break;
          case 'Beograd': srbToll = 11.50; label = 'Beograd ➔ Dimitrovgrad'; break;
          case 'Kragujevac': srbToll = 7.00; label = 'Kragujevac ➔ Dimitrovgrad'; break;
          case 'Niš': srbToll = 2.50; label = 'Niš ➔ Dimitrovgrad'; break;
        }
      }
      tolls.push({ name: label, cost: srbToll, currency: 'EUR' });
      totalTolls += srbToll;
    }

    // 2. TRANST COUNTRY TOLL (MKD or Bulgaria Vignette)
    if (routeType === 'MKD') {
      if (startPoint === 'Skoplje') {
        // Skoplje to Greece (passes Sopot/Otovica, Gradsko, Gevgelija)
        tolls.push({ name: 'Naplatne rampe u S. Makedoniji (3 rampe)', cost: 5.00, currency: 'EUR' });
        totalTolls += 5.00;
      } else {
        // Full Macedonia transit (passes all 5 ramps: Romanovce, Sopot, Otovica, Gradsko, Gevgelija)
        tolls.push({ name: 'Naplatne rampe u S. Makedoniji (Romanovce, Sopot, Otovica, Gradsko, Gevgelija)', cost: 8.00, currency: 'EUR' });
        totalTolls += 8.00;
      }
    } else if (routeType === 'BGR') {
      // Bulgaria Vignette (Vinjeta) - 7 days minimum
      tolls.push({ name: 'Bugarska vinjeta (Vignette - 7 dana)', cost: 7.00, currency: 'EUR' });
      totalTolls += 7.00;
    }

    // 3. GREECE TOLLS
    if (routeType === 'MKD') {
      // Entering via Evzoni
      tolls.push({ name: 'Naplatna rampa Evzoni (Grčka)', cost: 2.40, currency: 'EUR' });
      totalTolls += 2.40;

      if (destination === 'Tasos' || destination === 'Kavala') {
        tolls.push({ name: 'Naplatna rampa Analipsi (Grčka)', cost: 2.40, currency: 'EUR' });
        tolls.push({ name: 'Naplatna rampa Asprovalta (Grčka)', cost: 1.10, currency: 'EUR' });
        tolls.push({ name: 'Naplatna rampa Moustheni (Grčka)', cost: 2.10, currency: 'EUR' });
        totalTolls += 5.60;
      } else if (destination === 'Lefkada' || destination === 'Krf' || destination === 'Epir') {
        tolls.push({ name: 'Naplatna rampa Malgara (Grčka)', cost: 1.20, currency: 'EUR' });
        tolls.push({ name: 'Naplatna rampa Polymylos (Grčka)', cost: 2.00, currency: 'EUR' });
        tolls.push({ name: 'Naplatna rampa Siatista (Grčka)', cost: 1.50, currency: 'EUR' });
        tolls.push({ name: 'Naplatna rampa Tyria (Grčka)', cost: 2.10, currency: 'EUR' });
        tolls.push({ name: 'Naplatna rampa Pamvotis (Grčka)', cost: 1.20, currency: 'EUR' });
        totalTolls += 8.00;

        if (destination === 'Lefkada') {
          tolls.push({ name: 'Podvodni tunel Aktio (Lefkada)', cost: 3.00, currency: 'EUR' });
          totalTolls += 3.00;
        }
      }
    } else {
      // Entering via Kulata (Promahonas)
      tolls.push({ name: 'Naplatna rampa Promahonas (Grčka)', cost: 2.00, currency: 'EUR' });
      totalTolls += 2.00;

      if (destination === 'Tasos' || destination === 'Kavala') {
        tolls.push({ name: 'Naplatna rampa Asprovalta (Grčka)', cost: 1.10, currency: 'EUR' });
        tolls.push({ name: 'Naplatna rampa Moustheni (Grčka)', cost: 2.10, currency: 'EUR' });
        totalTolls += 3.20;
      }
    }

    // 4. FUEL CALCULATION
    const dist = activeRouteInfo.dist;
    
    // Average fuel price per km based on country splits:
    // Romania/Serbia: 35%, Macedonia/Bulgaria: 40%, Greece: 25% of the trip distance
    let avgFuelPrice = 0;
    if (isRomanianStart) {
      avgFuelPrice = (fuelPrices.ROU * 0.35) + (fuelPrices.BGR * 0.40) + (fuelPrices.GRC * 0.25);
    } else if (routeType === 'MKD') {
      avgFuelPrice = (fuelPrices.SRB * 0.35) + (fuelPrices.MKD * 0.40) + (fuelPrices.GRC * 0.25);
    } else {
      avgFuelPrice = (fuelPrices.SRB * 0.35) + (fuelPrices.BGR * 0.40) + (fuelPrices.GRC * 0.25);
    }

    const totalFuelUsed = (dist / 100) * consumption;
    const totalFuelCost = totalFuelUsed * avgFuelPrice;

    return {
      tollsList: tolls,
      totalTollsCost: Number(totalTolls.toFixed(2)),
      totalFuelUsed: Number(totalFuelUsed.toFixed(1)),
      totalFuelCost: Number(totalFuelCost.toFixed(2)),
      totalTripCost: Number((totalTolls + totalFuelCost).toFixed(2)),
      averageFuelPrice: Number(avgFuelPrice.toFixed(2)),
    };
  }, [startPoint, destination, routeType, activeRouteInfo, consumption, fuelPrices, isRomanianStart]);

  // Fuel advice based on prices
  const fuelAdvice = useMemo(() => {
    if (isRomanianStart) {
      const savingsPerLitre = Math.max(0, fuelPrices.GRC - fuelPrices.BGR);
      if (savingsPerLitre > 0.2) {
        const potentialSavings = Number((savingsPerLitre * 45).toFixed(2));
        return {
          title: '💡 Savet za kupovinu goriva',
          text: `Gorivo u Bugarskoj je znatno jeftinije nego u Grčkoj. Savetujemo da napunite rezervoar pre ulaska u Grčku na poslednjim pumpama u Bugarskoj (npr. Kulata/Sandanski). Uštedećete oko ${potentialSavings} € po rezervoaru!`,
          type: 'success'
        };
      }
      return null;
    }
    if (routeType === 'MKD') {
      const savingsPerLitre = Math.max(0, fuelPrices.SRB - fuelPrices.MKD);
      const savingsGr = Math.max(0, fuelPrices.GRC - fuelPrices.MKD);
      if (savingsPerLitre > 0.2 || savingsGr > 0.2) {
        const potentialSavings = Number((savingsPerLitre * 45).toFixed(2));
        return {
          title: '💡 Preporuka za točenje goriva',
          text: `Gorivo u Severnoj Makedoniji je znatno jeftinije. Savetujemo da uđete u Makedoniju sa minimalnom količinom goriva, napunite pun rezervoar na prvoj pumpi u Tabanovcima i dopunite pre same granice sa Grčkom u Đevđeliji. Uštedećete i do ${potentialSavings} € po rezervoaru!`,
          type: 'success'
        };
      }
    } else if (routeType === 'BGR') {
      const savingsPerLitre = Math.max(0, fuelPrices.SRB - fuelPrices.BGR);
      const savingsGr = Math.max(0, fuelPrices.GRC - fuelPrices.BGR);
      if (savingsPerLitre > 0.2 || savingsGr > 0.2) {
        const potentialSavings = Number((savingsPerLitre * 45).toFixed(2));
        return {
          title: '💡 Savet za kupovinu goriva',
          text: `Bugarska ima znatno povoljnije cene goriva nego Srbija i Grčka. Isplanirajte točenje goriva na tranzitu kroz Bugarsku kako biste smanjili ukupne troškove puta. Ušteda po rezervoaru iznosi oko ${potentialSavings} € u poređenju sa cenama u Srbiji.`,
          type: 'success'
        };
      }
    }
    return null;
  }, [routeType, fuelPrices, isRomanianStart, startPoint]);

  return (
    <div className="planner-container animate-fade">
      
      {/* HEADER SECTION */}
      <div className="planner-header">
        <h1>🚗 Pametni Planer Puta do Grčke</h1>
        <p className="planner-subtitle">
          Izračunajte tačne troškove goriva, putarina i saznajte važne tranzitne informacije za Vaše letovanje bez skrivenih troškova.
        </p>
      </div>

      <div className="planner-grid">
        
        {/* LEFT COLUMN: Controls & Adjustments */}
        <div className="planner-card controls-card glass">
          <h3 className="section-title">⚙️ Podešavanja rute i vozila</h3>

          <div className="form-group-grid">
            <div className="form-group">
              <label htmlFor="start-point">Polazište</label>
              <select 
                id="start-point" 
                value={startPoint} 
                onChange={(e) => setStartPoint(e.target.value)}
                className="planner-select"
              >
                {startingPoints.map(point => (
                  <option key={point} value={point}>{point}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="destination">Odredište</label>
              <select 
                id="destination" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                className="planner-select"
              >
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.id}>{dest.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Route Options (Transit choice) */}
          {availableRoutes.length > 1 && (
            <div className="form-group">
              <label>Izbor tranzitne rute</label>
              <div className="route-type-toggle">
                <button 
                  type="button" 
                  className={`route-btn ${routeType === 'MKD' ? 'active' : ''}`}
                  onClick={() => setRouteType('MKD')}
                >
                  🇲🇰 Preko S. Makedonije (Evzoni)
                </button>
                <button 
                  type="button" 
                  className={`route-btn ${routeType === 'BGR' ? 'active' : ''}`}
                  onClick={() => setRouteType('BGR')}
                >
                  🇧🇬 Preko Bugarske (Kulata)
                </button>
              </div>
            </div>
          )}

          {/* Fuel selection */}
          <div className="form-group">
            <label>Tip goriva</label>
            <div className="fuel-type-toggle">
              <button 
                type="button" 
                className={`fuel-btn ${fuelType === 'benzin' ? 'active' : ''}`}
                onClick={() => handleFuelTypeChange('benzin')}
              >
                ⛽ Benzin
              </button>
              <button 
                type="button" 
                className={`fuel-btn ${fuelType === 'dizel' ? 'active' : ''}`}
                onClick={() => handleFuelTypeChange('dizel')}
              >
                ⛽ Dizel
              </button>
              <button 
                type="button" 
                className={`fuel-btn ${fuelType === 'lpg' ? 'active' : ''}`}
                onClick={() => handleFuelTypeChange('lpg')}
              >
                🚗 Auto-gas (TNG)
              </button>
            </div>
          </div>

          {/* Car Consumption slider */}
          <div className="form-group slider-group">
            <div className="slider-header">
              <span>Prosečna potrošnja</span>
              <span className="slider-value">{consumption} l/100km</span>
            </div>
            <input 
              type="range" 
              min="4.0" 
              max="12.0" 
              step="0.1" 
              value={consumption} 
              onChange={(e) => setConsumption(parseFloat(e.target.value))}
              className="planner-slider"
            />
          </div>

          <div className="divider" />

          {/* Local Fuel Prices adjustments */}
          <h4 className="sub-section-title">⛽ Cene goriva po litru (Podesivo)</h4>
          <div className="fuel-sliders-grid">
            {isRomanianStart ? (
              <div className="form-group slider-group mini">
                <div className="slider-header">
                  <span>🇷🇴 Rumunija</span>
                  <span className="slider-value">{fuelPrices.ROU.toFixed(2)} €</span>
                </div>
                <input 
                  type="range" 
                  min="0.50" 
                  max="2.50" 
                  step="0.01" 
                  value={fuelPrices.ROU} 
                  onChange={(e) => setFuelPrices(prev => ({ ...prev, ROU: parseFloat(e.target.value) }))}
                  className="planner-slider mini-slider"
                />
              </div>
            ) : (
              <div className="form-group slider-group mini">
                <div className="slider-header">
                  <span>🇷🇸 Srbija</span>
                  <span className="slider-value">{fuelPrices.SRB.toFixed(2)} €</span>
                </div>
                <input 
                  type="range" 
                  min="0.50" 
                  max="2.50" 
                  step="0.01" 
                  value={fuelPrices.SRB} 
                  onChange={(e) => setFuelPrices(prev => ({ ...prev, SRB: parseFloat(e.target.value) }))}
                  className="planner-slider mini-slider"
                />
              </div>
            )}

            {routeType === 'MKD' ? (
              <div className="form-group slider-group mini">
                <div className="slider-header">
                  <span>🇲🇰 S. Makedonija</span>
                  <span className="slider-value">{fuelPrices.MKD.toFixed(2)} €</span>
                </div>
                <input 
                  type="range" 
                  min="0.50" 
                  max="2.50" 
                  step="0.01" 
                  value={fuelPrices.MKD} 
                  onChange={(e) => setFuelPrices(prev => ({ ...prev, MKD: parseFloat(e.target.value) }))}
                  className="planner-slider mini-slider"
                />
              </div>
            ) : (
              <div className="form-group slider-group mini">
                <div className="slider-header">
                  <span>🇧🇬 Bugarska</span>
                  <span className="slider-value">{fuelPrices.BGR.toFixed(2)} €</span>
                </div>
                <input 
                  type="range" 
                  min="0.50" 
                  max="2.50" 
                  step="0.01" 
                  value={fuelPrices.BGR} 
                  onChange={(e) => setFuelPrices(prev => ({ ...prev, BGR: parseFloat(e.target.value) }))}
                  className="planner-slider mini-slider"
                />
              </div>
            )}

            <div className="form-group slider-group mini">
              <div className="slider-header">
                <span>🇬🇷 Grčka</span>
                <span className="slider-value">{fuelPrices.GRC.toFixed(2)} €</span>
              </div>
              <input 
                type="range" 
                min="0.50" 
                max="2.50" 
                step="0.01" 
                value={fuelPrices.GRC} 
                onChange={(e) => setFuelPrices(prev => ({ ...prev, GRC: parseFloat(e.target.value) }))}
                className="planner-slider mini-slider"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results & Details */}
        <div className="planner-results-column">
          
          {/* Main cost summary */}
          <div className="planner-card summary-card glass highlight-card">
            <h3 className="summary-card-title">💰 Procena troškova letovanja</h3>
            
            <div className="summary-stats-grid">
              <div className="stat-box">
                <span className="stat-label">Ukupna dužina</span>
                <span className="stat-val">{activeRouteInfo.dist} km</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Vreme vožnje</span>
                <span className="stat-val">{activeRouteInfo.time}</span>
              </div>
              <div className="stat-box highlight">
                <span className="stat-label">UKUPAN TROŠAK</span>
                <span className="stat-val">{calculationData.totalTripCost.toFixed(2)} €</span>
              </div>
            </div>

            <div className="cost-breakdown-row">
              <div className="cost-item">
                <span className="cost-bullet srb"></span>
                <span>Gorivo ({calculationData.totalFuelUsed} litara):</span>
                <span className="cost-val">{calculationData.totalFuelCost.toFixed(2)} €</span>
              </div>
              <div className="cost-item">
                <span className="cost-bullet grc"></span>
                <span>Putarine i vinjete:</span>
                <span className="cost-val">{calculationData.totalTollsCost.toFixed(2)} €</span>
              </div>
            </div>

            {fuelAdvice && (
              <div className={`fuel-advice-box ${fuelAdvice.type}`}>
                <div className="advice-title">{fuelAdvice.title}</div>
                <div className="advice-text">{fuelAdvice.text}</div>
              </div>
            )}
          </div>

          {/* Tolls list */}
          <div className="planner-card tolls-card glass">
            <h3 className="section-title">🛣️ Detaljan spisak naplatnih rampi</h3>
            <div className="tolls-list">
              {calculationData.tollsList.map((toll, index) => (
                <div className="toll-row" key={index}>
                  <div className="toll-info">
                    <span className="toll-index">{index + 1}</span>
                    <span className="toll-name">{toll.name}</span>
                  </div>
                  <span className="toll-price">{toll.cost.toFixed(2)} €</span>
                </div>
              ))}
              {calculationData.tollsList.length === 0 && (
                <p className="no-tolls-msg">Nema naplatnih rampi na ovoj ruti.</p>
              )}
            </div>
            <div className="tolls-footer">
              <span>Ukupno za putarine:</span>
              <span className="tolls-total-val">{calculationData.totalTollsCost.toFixed(2)} €</span>
            </div>
          </div>

          {/* Country travel rules checklist */}
          <div className="planner-card rules-card glass">
            <h3 className="section-title">📋 Obavezna dokumentacija i pravila</h3>
            <div className="rules-grid">
              
              {isRomanianStart && (
                <div className="country-rule-box">
                  <h4>🇷🇴 Rumunija</h4>
                  <ul>
                    <li><strong>Rovinieta:</strong> Obavezna elektronska vinjeta za puteve u Rumuniji.</li>
                    <li><strong>Vatrogasni aparat:</strong> Obavezan u vozilu.</li>
                    <li><strong>Reflektujući prsluk:</strong> Obavezan.</li>
                    <li><strong>Brzina:</strong> Auto-put max 130 km/h.</li>
                  </ul>
                </div>
              )}

              {routeType === 'MKD' && (
                <div className="country-rule-box">
                  <h4>🇲🇰 Severna Makedonija</h4>
                  <ul>
                    <li><strong>Zeleni karton:</strong> Obavezan (zeleni papir osiguranja).</li>
                    <li><strong>Vatrogasni aparat:</strong> Obavezan (tip S2).</li>
                    <li><strong>Brzina:</strong> Auto-put max 120 km/h.</li>
                    <li><strong>Svetla:</strong> Obavezna i preko dana.</li>
                  </ul>
                </div>
              )}

              {routeType === 'BGR' && (
                <div className="country-rule-box">
                  <h4>🇧🇬 Bugarska</h4>
                  <ul>
                    <li><strong>Vinjeta:</strong> Obavezna (kupuje se elektronski na ulazu).</li>
                    <li><strong>Vatrogasni aparat:</strong> Obavezan.</li>
                    <li><strong>Svetla:</strong> Obavezna i tokom dana.</li>
                    <li><strong>Brzina:</strong> Auto-put max 140 km/h.</li>
                  </ul>
                </div>
              )}

              <div className="country-rule-box">
                <h4>🇬🇷 Grčka</h4>
                <ul>
                  <li><strong>Vatrogasni aparat:</strong> Obavezan.</li>
                  <li><strong>Reflektujući prsluk:</strong> Obavezan u kabini vozila.</li>
                  <li><strong>Međunarodna vozačka:</strong> Nije obavezna za državljane Srbije/Rumunije sa novim dozvolama.</li>
                  <li><strong>Brzina:</strong> Auto-put max 130 km/h.</li>
                </ul>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
