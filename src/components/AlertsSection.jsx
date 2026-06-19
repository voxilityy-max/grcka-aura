import React, { useState } from 'react';

const INITIAL_BORDERS = [
  { id: 'evzoni', name: 'Evzoni (MK -> GR)', wait: 35, level: 'low' },
  { id: 'bogorodica', name: 'Bogorodica (MK -> GR)', wait: 50, level: 'mid' },
  { id: 'presevo', name: 'Preševo (SRB -> MK)', wait: 75, level: 'high' },
  { id: 'kulata', name: 'Kulata - Promachonas (BG -> GR)', wait: 45, level: 'mid' },
  { id: 'gradina', name: 'Gradina (SRB -> BG)', wait: 20, level: 'low' }
];

const INITIAL_WARNINGS = [
  {
    id: 'warn-1',
    title: '⚠️ Pojava crvenih meduza na Kasandri',
    type: 'red',
    desc: 'Na plažama oko Pefkohorija i Haniotija primećena je veća koncentracija crvenih meduza. Ubod može izazvati crvenilo i peckanje. Preporučujemo nošenje antihistaminskih krema ili gela od aloje vere. Spasioci prate situaciju.',
    time: 'Pre 10 minuta'
  },
  {
    id: 'warn-2',
    title: '💨 Vetar i talasi na zapadu Lefkade',
    type: 'orange',
    desc: 'Najavljen je jak vetar maestral na zapadnoj obali Lefkade. Na plažama Porto Kaciki, Egremni i Katizma istaknute su crvene zastavice koje označavaju strogu zabranu ulaska u vodu zbog talasa i jakih struja.',
    time: 'Pre 45 minuta'
  },
  {
    id: 'warn-3',
    title: '🚧 Gužva na Ring Road-u oko Soluna',
    type: 'info',
    desc: 'Zbog radova na rekonstrukciji obilaznice oko Soluna (Ring Road), saobraćaj je usporen. Vozačima koji putuju ka Halkidikiju savetujemo korišćenje tranzitnih ruti kroz grad u prepodnevnim satima.',
    time: 'Pre 2 sata'
  }
];

export default function AlertsSection() {
  const [borders, setBorders] = useState(INITIAL_BORDERS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      setBorders(prev => {
        return prev.map(border => {
          // Add or subtract some random minutes
          const change = Math.floor(Math.random() * 21) - 10; // -10 to +10 mins
          let newWait = Math.max(10, border.wait + change);
          
          let newLevel = 'low';
          if (newWait > 60) newLevel = 'high';
          else if (newWait > 30) newLevel = 'mid';
          
          return {
            ...border,
            wait: newWait,
            level: newLevel
          };
        });
      });
      setRefreshing(false);
    }, 1200);
  };

  const getLevelColor = (level) => {
    if (level === 'high') return 'red';
    if (level === 'mid') return 'orange';
    return 'green';
  };

  return (
    <div className="alerts-layout animate-fade">
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>Stanje na Granicama i Upozorenja u Grčkoj</h2>
        <p style={{ color: 'var(--text-muted)' }}>Informacije o čekanjima na prelazima u realnom vremenu i bezbednosni bilteni za turiste.</p>
      </div>

      <div className="alerts-grid-panel">
        {/* Border Queue Monitor */}
        <div className="borders-card">
          <div className="borders-header-box">
            <h3 style={{ margin: 0, fontWeight: '700', color: 'var(--primary)' }}>Čekanje na Graničnim Prelazima</h3>
            <button 
              className="btn-refresh-borders" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin" style={{ marginRight: '0.4rem' }}>
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                  </svg>
                  Osvežavam...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '0.4rem' }}>
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                  </svg>
                  Osveži Uživo
                </>
              )}
            </button>
          </div>

          <div className="borders-list">
            {borders.map(border => {
              const color = getLevelColor(border.level);
              return (
                <div key={border.id} className="border-item-bar animate-scale">
                  <div className="border-name">{border.name}</div>
                  <div className="border-progress-bg">
                    {/* Width of progress bar matches wait time max limit (120 mins) */}
                    <div 
                      className={`border-progress-fill ${color}`}
                      style={{ width: `${Math.min(100, (border.wait / 120) * 100)}%` }}
                    />
                  </div>
                  <div className={`border-wait-time-badge ${color}`}>
                    ⏱️ {border.wait} min
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
            * Podaci su ažurirani na osnovu prijava vozača sa terena i live kamera Auto-moto saveza.
          </div>
        </div>

        {/* Warnings Bulletins */}
        <div className="warnings-sidebar-panel">
          <h3 style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.8rem' }}>Bezbednosni Bilten (Alerts)</h3>
          
          <div className="bulletins-list">
            {INITIAL_WARNINGS.map(warn => (
              <div 
                key={warn.id} 
                className={`bulletin-warning-card ${warn.type === 'red' ? 'red-alert' : ''}`}
                style={{ 
                  borderColor: warn.type === 'red' ? 'var(--danger)' : warn.type === 'orange' ? 'var(--secondary)' : 'var(--accent)',
                  backgroundColor: warn.type === 'red' ? 'rgba(230, 57, 70, 0.04)' : warn.type === 'orange' ? 'rgba(255, 183, 3, 0.04)' : 'rgba(0, 180, 216, 0.04)'
                }}
              >
                <div className="bulletin-title-box">
                  <span style={{ 
                    color: warn.type === 'red' ? 'var(--danger)' : warn.type === 'orange' ? 'var(--secondary)' : 'var(--accent)'
                  }}>
                    {warn.title}
                  </span>
                </div>
                <p className="bulletin-desc">{warn.desc}</p>
                <div className="bulletin-time">{warn.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
