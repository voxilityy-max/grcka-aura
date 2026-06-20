import { useState, useEffect, useRef } from 'react';

export default function InteractiveMap({ properties = [], processedProperties = [], onViewPropertyDetails }) {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // Map coordinates mapping for Greece properties
  const getCoordinates = (locName, propId) => {
    switch (propId) {
      case 1: return [38.7778, 20.6009]; // Lefkada - Kathisma
      case 2: return [40.7288, 24.7578]; // Tasos - Golden Beach
      case 3: return [35.3673, 24.4891]; // Krit - Rethymno
      case 4: return [39.9882, 23.6148]; // Kasandra - Pefkohori
      case 5: return [40.2185, 23.6677]; // Sitonija - Nikiti
      case 6: return [40.3292, 23.9798]; // Halkidiki - Athos
      default: {
        const loc = locName.toLowerCase();
        if (loc.includes('lefkada')) return [38.7778, 20.6009];
        if (loc.includes('tasos') || loc.includes('thassos')) return [40.7288, 24.7578];
        if (loc.includes('krit') || loc.includes('crete')) return [35.3673, 24.4891];
        if (loc.includes('kasandra') || loc.includes('kassandra')) return [39.9882, 23.6148];
        if (loc.includes('sitonij') || loc.includes('sithon')) return [40.2185, 23.6677];
        if (loc.includes('halkidiki') || loc.includes('athos') || loc.includes('atos')) return [40.3292, 23.9798];
        return [37.9838, 23.7275]; // Athens fallback
      }
    }
  };


  // Expose detail click to global window for Leaflet HTML popups
  useEffect(() => {
    window.handleMapDetailsClick = (id) => {
      const prop = properties.find(p => p.id === id);
      if (prop) onViewPropertyDetails(prop);
    };

    return () => {
      delete window.handleMapDetailsClick;
    };
  }, [properties, onViewPropertyDetails]);

  // Load Leaflet assets dynamically
  useEffect(() => {
    let active = true;

    const loadAssets = () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        if (!document.getElementById('leaflet-js')) {
          const script = document.createElement('script');
          script.id = 'leaflet-js';
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => {
            if (active) setLeafletLoaded(true);
          };
          document.head.appendChild(script);
        }
      } else {
        setLeafletLoaded(true);
      }
    };

    loadAssets();

    return () => {
      active = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !window.L || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = window.L;
    
    // Greece Center
    const map = L.map(mapContainerRef.current, {
      center: [38.5, 23.0],
      zoom: 6.5,
      zoomControl: true,
      attributionControl: true
    });

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Resize fix
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [leafletLoaded]);

  // Update Markers based on processedProperties
  useEffect(() => {
    if (!leafletLoaded || !window.L || !mapInstanceRef.current) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    const customMarkerIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Create markers for active properties
    processedProperties.forEach(prop => {
      const coords = getCoordinates(prop.location, prop.id);
      
      const popupContent = `
        <div style="width: 190px; font-family: system-ui, -apple-system, sans-serif;">
          <img src="${prop.image}" alt="${prop.title}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px; margin-bottom: 5px;" />
          <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--primary);">${prop.type}</span>
          <h4 style="font-size: 12px; font-weight: 700; margin: 2px 0 4px 0; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${prop.title}</h4>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📍 ${prop.location}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
            <span style="font-weight: 800; color: var(--primary); font-size: 12px;">${prop.price}€<span style="font-size: 8px; font-weight: normal; color: #64748b;">/noć</span></span>
            <button onclick="window.handleMapDetailsClick(${prop.id})" style="background-color: var(--accent); color: white; border: none; padding: 3px 8px; font-size: 10px; font-weight: 600; border-radius: 4px; cursor: pointer;">Detalji</button>
          </div>
        </div>
      `;

      const marker = L.marker(coords, { icon: customMarkerIcon })
        .addTo(map)
        .bindPopup(popupContent);

      markersRef.current[prop.id] = marker;
    });

    // If properties are loaded, fit map bounds to show them all nicely
    if (processedProperties.length > 0) {
      const bounds = L.latLngBounds(processedProperties.map(p => getCoordinates(p.location, p.id)));
      map.fitBounds(bounds, { padding: [40, 40] });
    }

  }, [leafletLoaded, processedProperties]);

  const handleSidebarItemClick = (prop) => {
    const coords = getCoordinates(prop.location, prop.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.setView(coords, 14);
      const marker = markersRef.current[prop.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  return (
    <div className="map-view-wrapper animate-fade">
      {/* Map Header / Dashboard Controls */}
      <div className="map-dashboard-header">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>
            🗺️ Realna Geografska Karta Smeštaja
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Zunirajte i istražite tačne lokacije plaža, ulica i smeštaja na mapi Grčke.
          </p>
        </div>
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-dot active-pulse"></span>
            <span>Aktivni smeštaji ({processedProperties.length})</span>
          </div>
        </div>
      </div>

      <div className="map-layout-container">
        {/* Main Interactive Map Frame */}
        <div 
          ref={mapContainerRef} 
          className="map-canvas-container" 
          style={{ height: '500px', zIndex: 5 }}
        >
          {!leafletLoaded && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Učitavanje interaktivne mape Grčke...
            </div>
          )}
        </div>

        {/* Sidebar Legend Listing Panel */}
        <aside className="map-properties-sidebar">
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem', margin: '0 0 0.8rem 0' }}>
            Lista na Mapi ({processedProperties.length})
          </h4>
          <div className="map-sidebar-scroll">
            {processedProperties.length > 0 ? (
              processedProperties.map(prop => (
                <div 
                  key={prop.id} 
                  className="map-sidebar-item"
                  onClick={() => handleSidebarItemClick(prop)}
                >
                  <img src={prop.image} alt={prop.title} className="map-sidebar-img" />
                  <div className="map-sidebar-info">
                    <h5 className="map-sidebar-title">{prop.title}</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                      <span className="map-sidebar-price">{prop.price}€ / noć</span>
                      <span className="map-sidebar-rating">⭐ {prop.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Nema smeštaja po ovim filterima.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
