import { useState, useMemo, useEffect, useRef } from 'react';

// Searchable Select Component for premium autocomplete feel
function SearchableSelect({ label, id, value, options, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  // Find currently selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const query = search.toLowerCase();
    return options.filter(opt => opt.label.toLowerCase().includes(query));
  }, [options, search]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className="searchable-select-wrapper" ref={wrapperRef}>
      <label htmlFor={id}>{label}</label>
      <div className="searchable-select-container">
        <input
          type="text"
          id={id}
          className="planner-select searchable-input"
          value={isOpen ? search : (selectedOption ? selectedOption.label : '')}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          onFocus={() => {
            setIsOpen(true);
            setSearch('');
          }}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        <span className="select-arrow">▼</span>
      </div>

      {isOpen && (
        <div className="searchable-select-dropdown">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                className={`searchable-option ${opt.value === value ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="no-options-found">Nema rezultata</div>
          )}
        </div>
      )}
    </div>
  );
}

// Complete database of starting cities in Serbia, Romania, and North Macedonia
const startingCities = [
  // Srbija
  { id: 'Beograd', name: 'Beograd', country: 'Srbija', ref: 'Beograd', offset: 0 },
  { id: 'Novi Sad', name: 'Novi Sad', country: 'Srbija', ref: 'Novi Sad', offset: 0 },
  { id: 'Niš', name: 'Niš', country: 'Srbija', ref: 'Niš', offset: 0 },
  { id: 'Kragujevac', name: 'Kragujevac', country: 'Srbija', ref: 'Kragujevac', offset: 0 },
  { id: 'Subotica', name: 'Subotica', country: 'Srbija', ref: 'Subotica', offset: 0 },
  { id: 'Zrenjanin', name: 'Zrenjanin', country: 'Srbija', ref: 'Novi Sad', offset: 50 },
  { id: 'Pančevo', name: 'Pančevo', country: 'Srbija', ref: 'Beograd', offset: 20 },
  { id: 'Čačak', name: 'Čačak', country: 'Srbija', ref: 'Kragujevac', offset: 15 },
  { id: 'Kraljevo', name: 'Kraljevo', country: 'Srbija', ref: 'Kragujevac', offset: 25 },
  { id: 'Kruševac', name: 'Kruševac', country: 'Srbija', ref: 'Niš', offset: 50 },
  { id: 'Leskovac', name: 'Leskovac', country: 'Srbija', ref: 'Niš', offset: 45 },
  { id: 'Vranje', name: 'Vranje', country: 'Srbija', ref: 'Niš', offset: 110 },
  { id: 'Novi Pazar', name: 'Novi Pazar', country: 'Srbija', ref: 'Kragujevac', offset: 130 },
  { id: 'Užice', name: 'Užice', country: 'Srbija', ref: 'Kragujevac', offset: 95 },
  { id: 'Sombor', name: 'Sombor', country: 'Srbija', ref: 'Subotica', offset: 60 },
  { id: 'Požarevac', name: 'Požarevac', country: 'Srbija', ref: 'Beograd', offset: 80 },
  { id: 'Pirot', name: 'Pirot', country: 'Srbija', ref: 'Niš', offset: 70 },
  { id: 'Zaječar', name: 'Zaječar', country: 'Srbija', ref: 'Niš', offset: 110 },
  { id: 'Kikinda', name: 'Kikinda', country: 'Srbija', ref: 'Novi Sad', offset: 110 },
  { id: 'Jagodina', name: 'Jagodina', country: 'Srbija', ref: 'Kragujevac', offset: 40 },
  { id: 'Šabac', name: 'Šabac', country: 'Srbija', ref: 'Beograd', offset: 80 },
  { id: 'Loznica', name: 'Loznica', country: 'Srbija', ref: 'Beograd', offset: 130 },
  { id: 'Valjevo', name: 'Valjevo', country: 'Srbija', ref: 'Beograd', offset: 90 },
  { id: 'Smederevo', name: 'Smederevo', country: 'Srbija', ref: 'Beograd', offset: 20 },
  { id: 'Vršac', name: 'Vršac', country: 'Srbija', ref: 'Beograd', offset: 85 },
  { id: 'Bor', name: 'Bor', country: 'Srbija', ref: 'Niš', offset: 120 },
  { id: 'Ruma', name: 'Ruma', country: 'Srbija', ref: 'Beograd', offset: 60 },
  { id: 'Bačka Palanka', name: 'Bačka Palanka', country: 'Srbija', ref: 'Novi Sad', offset: 40 },
  { id: 'Prokuplje', name: 'Prokuplje', country: 'Srbija', ref: 'Niš', offset: 30 },
  { id: 'Inđija', name: 'Inđija', country: 'Srbija', ref: 'Beograd', offset: 45 },
  { id: 'Aranđelovac', name: 'Aranđelovac', country: 'Srbija', ref: 'Kragujevac', offset: 40 },
  { id: 'Gornji Milanovac', name: 'Gornji Milanovac', country: 'Srbija', ref: 'Kragujevac', offset: 40 },
  { id: 'Vrbas', name: 'Vrbas', country: 'Srbija', ref: 'Novi Sad', offset: 45 },
  { id: 'Bečej', name: 'Bečej', country: 'Srbija', ref: 'Novi Sad', offset: 50 },
  { id: 'Obrenovac', name: 'Obrenovac', country: 'Srbija', ref: 'Beograd', offset: 30 },
  { id: 'Mladenovac', name: 'Mladenovac', country: 'Srbija', ref: 'Beograd', offset: 55 },
  { id: 'Lazarevac', name: 'Lazarevac', country: 'Srbija', ref: 'Beograd', offset: 65 },
  { id: 'Smederevska Palanka', name: 'Smederevska Palanka', country: 'Srbija', ref: 'Beograd', offset: 80 },
  { id: 'Temerin', name: 'Temerin', country: 'Srbija', ref: 'Novi Sad', offset: 20 },
  { id: 'Ćuprija', name: 'Ćuprija', country: 'Srbija', ref: 'Kragujevac', offset: 50 },
  { id: 'Paraćin', name: 'Paraćin', country: 'Srbija', ref: 'Kragujevac', offset: 60 },
  { id: 'Knjaževac', name: 'Knjaževac', country: 'Srbija', ref: 'Niš', offset: 60 },

  // Rumunija
  { id: 'Bukurešt', name: 'Bukurešt', country: 'Rumunija', ref: 'Bukurešt', offset: 0 },
  { id: 'Temišvar', name: 'Temišvar', country: 'Rumunija', ref: 'Temišvar', offset: 0 },
  { id: 'Kluž', name: 'Kluž', country: 'Rumunija', ref: 'Kluž', offset: 0 },
  { id: 'Krajova', name: 'Krajova', country: 'Rumunija', ref: 'Krajova', offset: 0 },
  { id: 'Konstanca', name: 'Konstanca', country: 'Rumunija', ref: 'Bukurešt', offset: 220 },
  { id: 'Brašov', name: 'Brašov', country: 'Rumunija', ref: 'Bukurešt', offset: 180 },
  { id: 'Ploješti', name: 'Ploješti', country: 'Rumunija', ref: 'Bukurešt', offset: 60 },
  { id: 'Pitešti', name: 'Pitešti', country: 'Rumunija', ref: 'Bukurešt', offset: 120 },
  { id: 'Arad', name: 'Arad', country: 'Rumunija', ref: 'Temišvar', offset: 50 },
  { id: 'Oradea', name: 'Oradea', country: 'Rumunija', ref: 'Kluž', offset: 150 },
  { id: 'Iași', name: 'Jaši (Iași)', country: 'Rumunija', ref: 'Bukurešt', offset: 390 },
  { id: 'Galați', name: 'Galac (Galați)', country: 'Rumunija', ref: 'Bukurešt', offset: 250 },
  { id: 'Brăila', name: 'Braila (Brăila)', country: 'Rumunija', ref: 'Bukurešt', offset: 230 },
  { id: 'Bacău', name: 'Bakau (Bacău)', country: 'Rumunija', ref: 'Bukurešt', offset: 290 },
  { id: 'Sibiu', name: 'Sibinj (Sibiu)', country: 'Rumunija', ref: 'Krajova', offset: 150 },
  { id: 'Târgu Mureș', name: 'Targu Mureš', country: 'Rumunija', ref: 'Kluž', offset: 100 },
  { id: 'Baia Mare', name: 'Baja Mare', country: 'Rumunija', ref: 'Kluž', offset: 230 },
  { id: 'Satu Mare', name: 'Satu Mare', country: 'Rumunija', ref: 'Kluž', offset: 280 },
  { id: 'Râmnicu Vâlcea', name: 'Ramniku Valča (Râmnicu Vâlcea)', country: 'Rumunija', ref: 'Krajova', offset: 110 },
  { id: 'Drobeta-Turnu Severin', name: 'Drobeta-Turnu Severin', country: 'Rumunija', ref: 'Krajova', offset: -110 },
  { id: 'Reșița', name: 'Rešica (Reșița)', country: 'Rumunija', ref: 'Temišvar', offset: 100 },
  { id: 'Târgoviște', name: 'Trgovište (Târgoviște)', country: 'Rumunija', ref: 'Bukurešt', offset: 80 },
  { id: 'Suceava', name: 'Sučava (Suceava)', country: 'Rumunija', ref: 'Bukurešt', offset: 430 },
  { id: 'Piatra Neamț', name: 'Pjatra Njamc (Piatra Neamț)', country: 'Rumunija', ref: 'Bukurešt', offset: 350 },
  { id: 'Focșani', name: 'Fokšani (Focșani)', country: 'Rumunija', ref: 'Bukurešt', offset: 180 },

  // Severna Makedonija
  { id: 'Skoplje', name: 'Skoplje', country: 'Severna Makedonija', ref: 'Skoplje', offset: 0 },
  { id: 'Bitola', name: 'Bitolj (Bitola)', country: 'Severna Makedonija', ref: 'Skoplje', offset: 170 },
  { id: 'Ohrid', name: 'Ohrid', country: 'Severna Makedonija', ref: 'Skoplje', offset: 170 },
  { id: 'Prilep', name: 'Prilep', country: 'Severna Makedonija', ref: 'Skoplje', offset: 130 },
  { id: 'Kumanovo', name: 'Kumanovo', country: 'Severna Makedonija', ref: 'Skoplje', offset: -40 },
  { id: 'Veles', name: 'Veles', country: 'Severna Makedonija', ref: 'Skoplje', offset: 50 },
  { id: 'Tetovo', name: 'Tetovo', country: 'Severna Makedonija', ref: 'Skoplje', offset: 40 },
  { id: 'Štip', name: 'Štip', country: 'Severna Makedonija', ref: 'Skoplje', offset: 90 }
];

const destinations = [
  { id: 'Sitonija',    name: '🇬🇷 Sitonija (Halkidiki)', ref: 'Sitonija', offset: 0 },
  { id: 'Kasandra',    name: '🇬🇷 Kasandra (Halkidiki)', ref: 'Kasandra', offset: 0 },
  { id: 'Tasos',       name: '🇬🇷 Tasos (Keramoti)', ref: 'Tasos', offset: 0 },
  { id: 'Lefkada',     name: '🇬🇷 Lefkada', ref: 'Lefkada', offset: 0 },
  { id: 'Krf',         name: '🇬🇷 Krf (Igumenica)', ref: 'Krf', offset: 0 },
  { id: 'Epir',        name: '🇬🇷 Epir (Parga/Sivota)', ref: 'Epir', offset: 0 },
  { id: 'Kavala',      name: '🇬🇷 Kavala', ref: 'Kavala', offset: 0 },
  { id: 'Atos',        name: '🇬🇷 Atos (Uranopolis)', ref: 'Atos', offset: 0 },
  { id: 'Solun',       name: '🇬🇷 Solun (Thessaloniki)', ref: 'Sitonija', offset: -100 },
  { id: 'Paralia',     name: '🇬🇷 Olimpijska regija (Paralia/Leptokarija/Nei Pori)', ref: 'Sitonija', offset: -40 },
  { id: 'Asprovalta',  name: '🇬🇷 Asprovalta / Vrasna / Stavros', ref: 'Kavala', offset: -80 },
  { id: 'Nea Moudania',name: '🇬🇷 Nea Mudanja', ref: 'Kasandra', offset: -30 },
  { id: 'Athens',      name: '🇬🇷 Atina (Athens)', ref: 'Sitonija', offset: 400 },
  { id: 'Peloponez',   name: '🇬🇷 Peloponez (Patra/Kalamata)', ref: 'Sitonija', offset: 550 },
  { id: 'Preveza',     name: '🇬🇷 Jonska obala (Preveza/Vrahos/Parga)', ref: 'Lefkada', offset: -30 },
  { id: 'Evia',        name: '🇬🇷 Ostrvo Evia (Pefki)', ref: 'Sitonija', offset: 180 }
];

export default function RoadPlanner({ currentUser, onOpenAuth }) {
  const [startCountry, setStartCountry] = useState('Srbija');
  const [startPoint, setStartPoint] = useState('Beograd');
  const [destination, setDestination] = useState('Sitonija');
  const [routeType, setRouteType] = useState('MKD'); // 'MKD' (preko Makedonije) or 'BGR' (preko Bugarske)
  const [fuelType, setFuelType] = useState('dizel'); // 'benzin', 'dizel', 'lpg'
  const [consumption, setConsumption] = useState(6.5); // l/100km

  const isRomanianStart = startCountry === 'Rumunija';

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

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setStartCountry(country);
    const firstCityOfCountry = startingCities.find(c => c.country === country);
    if (firstCityOfCountry) {
      setStartPoint(firstCityOfCountry.id);
    }
  };

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

  // Get the selected start city object and destination object
  const startCityObj = useMemo(() => {
    return startingCities.find(c => c.id === startPoint) || startingCities[0];
  }, [startPoint]);

  const destObj = useMemo(() => {
    return destinations.find(d => d.id === destination) || destinations[0];
  }, [destination]);

  // Determine available route options for the selected start and destination
  const availableRoutes = useMemo(() => {
    const startData = routeDatabase[startCityObj.ref];
    if (!startData) return ['MKD'];
    const destData = startData[destObj.ref];
    if (!destData) return ['MKD'];
    return Object.keys(destData);
  }, [startCityObj, destObj]);

  // Adjust routeType if the selected one is not available
  useMemo(() => {
    if (!availableRoutes.includes(routeType)) {
      setRouteType(availableRoutes[0] || 'MKD');
    }
  }, [availableRoutes, routeType]);

  const activeRouteInfo = useMemo(() => {
    const defaultVal = { dist: 750, time: '8h 00m' };
    const startData = routeDatabase[startCityObj.ref];
    if (!startData) return defaultVal;
    const destData = startData[destObj.ref];
    if (!destData) return defaultVal;
    const route = destData[routeType] || Object.values(destData)[0] || defaultVal;
    
    // Apply offsets
    const baseDist = route.dist;
    const cityOffset = startCityObj.offset || 0;
    const destOffset = destObj.offset || 0;
    const finalDist = baseDist + cityOffset + destOffset;
    
    // Estimate final time based on final distance
    const baseHours = parseFloat(route.time.split('h')[0]);
    const baseMinutes = parseFloat(route.time.split('h')[1].replace('m', '')) || 0;
    const totalBaseMinutes = (baseHours * 60) + baseMinutes;
    
    const offsetMin = Math.round((cityOffset + destOffset) * 0.75);
    const totalMinutes = Math.max(60, totalBaseMinutes + offsetMin);
    
    const finalHours = Math.floor(totalMinutes / 60);
    const finalMins = totalMinutes % 60;
    const finalTimeStr = `${finalHours}h ${finalMins.toString().padStart(2, '0')}m`;

    return {
      dist: finalDist,
      time: finalTimeStr
    };
  }, [startCityObj, destObj, routeType]);

  // Calculate toll costs and list toll booths
  const calculationData = useMemo(() => {
    let tolls = [];
    let totalTolls = 0;

    // 1. Romania or Serbia Tolls
    if (isRomanianStart) {
      // Romanian Vignette (Rovinieta)
      tolls.push({ name: '🇷🇴 Rovinieta (Rumunska vinjeta - 7 dana)', cost: 3.00, currency: 'EUR' });
      totalTolls += 3.00;

      // Danube Bridge Toll
      const refCity = startCityObj.ref;
      if (refCity === 'Bukurešt' || refCity === 'Kluž') {
        tolls.push({ name: '🇷🇴➔🇧🇬 Mostarina Dunav (Giurgiu ➔ Ruse)', cost: 3.00, currency: 'EUR' });
        totalTolls += 3.00;
      } else if (refCity === 'Temišvar' || refCity === 'Krajova') {
        tolls.push({ name: '🇷🇴➔🇧🇬 Mostarina Dunav (Calafat ➔ Vidin)', cost: 6.00, currency: 'EUR' });
        totalTolls += 6.00;
      }
    } else if (startPoint !== 'Skoplje' && startCityObj.country !== 'Severna Makedonija') {
      let srbToll = 0;
      let label = '';
      const refCity = startCityObj.ref;
      switch (refCity) {
        case 'Subotica':
          srbToll = 21.00;
          label = '🇷🇸 Naplatna rampa Subotica ➔ Preševo';
          break;
        case 'Novi Sad':
          srbToll = 17.00;
          label = '🇷🇸 Naplatna rampa Novi Sad ➔ Preševo';
          break;
        case 'Kragujevac':
          srbToll = 10.50;
          label = '🇷🇸 Naplatna rampa Kragujevac ➔ Preševo';
          break;
        case 'Niš':
          srbToll = 6.00;
          label = '🇷🇸 Naplatna rampa Niš ➔ Preševo';
          break;
        case 'Beograd':
        default:
          srbToll = 15.00;
          label = '🇷🇸 Naplatna rampa Beograd (Vrčin) ➔ Preševo';
          break;
      }

      // Specific city overrides for tolls to make it hyper-realistic
      if (startPoint === 'Vranje') {
        srbToll = 1.50;
        label = '🇷🇸 Naplatna rampa Vranje ➔ Preševo';
      } else if (startPoint === 'Leskovac') {
        srbToll = 3.50;
        label = '🇷🇸 Naplatna rampa Leskovac ➔ Preševo';
      } else if (startPoint === 'Pirot' && routeType === 'BGR') {
        srbToll = 1.00;
        label = '🇷🇸 Naplatna rampa Pirot ➔ Dimitrovgrad';
      }

      if (routeType === 'BGR' && startPoint !== 'Pirot') {
        // Going to Bulgaria instead of Macedonia
        switch (refCity) {
          case 'Subotica': srbToll = 17.50; label = '🇷🇸 Subotica ➔ Dimitrovgrad'; break;
          case 'Novi Sad': srbToll = 13.50; label = '🇷🇸 Novi Sad ➔ Dimitrovgrad'; break;
          case 'Beograd': srbToll = 11.50; label = '🇷🇸 Beograd ➔ Dimitrovgrad'; break;
          case 'Kragujevac': srbToll = 7.00; label = '🇷🇸 Kragujevac ➔ Dimitrovgrad'; break;
          case 'Niš': srbToll = 2.50; label = '🇷🇸 Niš ➔ Dimitrovgrad'; break;
        }
      }
      tolls.push({ name: label, cost: srbToll, currency: 'EUR' });
      totalTolls += srbToll;
    }

    // 2. TRANST COUNTRY TOLL (MKD or Bulgaria Vignette)
    if (routeType === 'MKD') {
      if (startPoint === 'Skoplje') {
        // Skoplje to Greece (passes Sopot/Otovica, Gradsko, Gevgelija)
        tolls.push({ name: '🇲🇰 Naplatne rampe u S. Makedoniji (3 rampe)', cost: 5.00, currency: 'EUR' });
        totalTolls += 5.00;
      } else if (startCityObj.country === 'Severna Makedonija') {
        // Other MKD cities
        if (startPoint !== 'Bitola' && startPoint !== 'Ohrid') {
          tolls.push({ name: '🇲🇰 Naplatne rampe u S. Makedoniji (Tranzit)', cost: 3.50, currency: 'EUR' });
          totalTolls += 3.50;
        }
      } else {
        // Full Macedonia transit (passes all 5 ramps: Romanovce, Sopot, Otovica, Gradsko, Gevgelija)
        tolls.push({ name: '🇲🇰 Naplatne rampe u S. Makedoniji (Romanovce, Sopot, Otovica, Gradsko, Gevgelija)', cost: 8.00, currency: 'EUR' });
        totalTolls += 8.00;
      }
    } else if (routeType === 'BGR') {
      // Bulgaria Vignette (Vinjeta) - 7 days minimum
      tolls.push({ name: '🇧🇬 Bugarska vinjeta (Vignette - 7 dana)', cost: 7.00, currency: 'EUR' });
      totalTolls += 7.00;
    }

    // 3. GREECE TOLLS
    if (routeType === 'MKD') {
      // Entering via Evzoni
      tolls.push({ name: '🇬🇷 Naplatna rampa Evzoni (Grčka)', cost: 2.40, currency: 'EUR' });
      totalTolls += 2.40;

      if (destObj.ref === 'Tasos' || destObj.ref === 'Kavala') {
        tolls.push({ name: '🇬🇷 Naplatna rampa Analipsi (Grčka)', cost: 2.40, currency: 'EUR' });
        tolls.push({ name: '🇬🇷 Naplatna rampa Asprovalta (Grčka)', cost: 1.10, currency: 'EUR' });
        tolls.push({ name: '🇬🇷 Naplatna rampa Moustheni (Grčka)', cost: 2.10, currency: 'EUR' });
        totalTolls += 5.60;
      } else if (destObj.ref === 'Lefkada' || destObj.ref === 'Krf' || destObj.ref === 'Epir') {
        tolls.push({ name: '🇬🇷 Naplatna rampa Malgara (Grčka)', cost: 1.20, currency: 'EUR' });
        tolls.push({ name: '🇬🇷 Naplatna rampa Polymylos (Grčka)', cost: 2.00, currency: 'EUR' });
        tolls.push({ name: '🇬🇷 Naplatna rampa Siatista (Grčka)', cost: 1.50, currency: 'EUR' });
        tolls.push({ name: '🇬🇷 Naplatna rampa Tyria (Grčka)', cost: 2.10, currency: 'EUR' });
        tolls.push({ name: '🇬🇷 Naplatna rampa Pamvotis (Grčka)', cost: 1.20, currency: 'EUR' });
        totalTolls += 8.00;

        if (destination === 'Lefkada') {
          tolls.push({ name: '🇬🇷 Podvodni tunel Aktio (Lefkada)', cost: 3.00, currency: 'EUR' });
          totalTolls += 3.00;
        }
      }

      // Additional tolls for Athens / Peloponnese route
      if (destination === 'Athens') {
        tolls.push({ name: '🇬🇷 Naplatne rampe Solun ➔ Atina (višestruke rampe)', cost: 33.50, currency: 'EUR' });
        totalTolls += 33.50;
      } else if (destination === 'Peloponez') {
        tolls.push({ name: '🇬🇷 Naplatne rampe Solun ➔ Atina ➔ Peloponez', cost: 38.50, currency: 'EUR' });
        totalTolls += 38.50;
      }
    } else {
      // Entering via Kulata (Promahonas)
      tolls.push({ name: '🇬🇷 Naplatna rampa Promahonas (Grčka)', cost: 2.00, currency: 'EUR' });
      totalTolls += 2.00;

      if (destObj.ref === 'Tasos' || destObj.ref === 'Kavala') {
        tolls.push({ name: '🇬🇷 Naplatna rampa Asprovalta (Grčka)', cost: 1.10, currency: 'EUR' });
        tolls.push({ name: '🇬🇷 Naplatna rampa Moustheni (Grčka)', cost: 2.10, currency: 'EUR' });
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
  }, [startPoint, destination, routeType, activeRouteInfo, consumption, fuelPrices, isRomanianStart, startCityObj, destObj]);

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
              <label htmlFor="start-country">Država polaska</label>
              <select 
                id="start-country" 
                value={startCountry} 
                onChange={handleCountryChange}
                className="planner-select"
              >
                <option value="Srbija">🇷🇸 Srbija</option>
                <option value="Rumunija">🇷🇴 Rumunija</option>
                <option value="Severna Makedonija">🇲🇰 S. Makedonija</option>
              </select>
            </div>

            <SearchableSelect
              id="start-point"
              label="Polazište (Grad)"
              value={startPoint}
              options={startingCities
                .filter(city => city.country === startCountry)
                .map(city => {
                  let flag = '';
                  if (city.country === 'Srbija') flag = '🇷🇸 ';
                  else if (city.country === 'Rumunija') flag = '🇷🇴 ';
                  else if (city.country === 'Severna Makedonija') flag = '🇲🇰 ';
                  return {
                    value: city.id,
                    label: `${flag}${city.name}`
                  };
                })
              }
              onChange={setStartPoint}
              placeholder="Pretraži polazište..."
            />
          </div>

          <SearchableSelect
            id="destination"
            label="Odredište (u Grčkoj)"
            value={destination}
            options={destinations.map(dest => ({
              value: dest.id,
              label: dest.name
            }))}
            onChange={setDestination}
            placeholder="Pretraži odredište..."
          />

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

            {/* Legal Disclaimer Box */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(230, 57, 70, 0.05)', borderLeft: '4px solid var(--danger)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>⚠️ Odricanje odgovornosti (Disclaimer):</strong> Proračuni troškova putarina, potrošnje goriva, dužine puta i propisa o dokumentaciji na granicama su isključivo informativnog karaktera. Stanje na putevima, cene goriva i zakonski propisi su promenljivi. Pre polaska na put, uvek zvanične informacije proverite kod zvaničnih tela (AMSS, Granična policija, Ministarstvo spoljnih poslova).
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
