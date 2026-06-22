import { useState, useEffect } from 'react';

const INITIAL_BORDERS_DATA = [
  {
    id: 'presevo',
    name: 'Preševo / Tabanovci',
    flagFrom: '🇷🇸',
    flagTo: '🇲🇰',
    fromName: 'Srbija',
    toName: 'S. Makedonija',
    toGreeceTime: 35, // in minutes
    toSerbiaTime: 15,
    toGreeceStatus: 'umereno', // 'prohodno', 'umereno', 'guzva'
    toSerbiaStatus: 'prohodno',
    camNameGreece: 'CAM 01 - Preševo (Izlaz)',
    camNameSerbia: 'CAM 02 - Preševo (Ulaz)',
    reports: [
      { user: 'Marko N.', time: 'pre 12 min', direction: 'grcka', text: 'Zadržavanje oko 35 minuta na našoj granici, Makedonci puštaju brzo.' },
      { user: 'Jelena K.', time: 'pre 45 min', direction: 'srbija', text: 'Smer ka Srbiji skroz prazan, prošli za manje od 15 minuta.' }
    ]
  },
  {
    id: 'evzoni',
    name: 'Bogorodica / Evzoni',
    flagFrom: '🇲🇰',
    flagTo: '🇬🇷',
    fromName: 'S. Makedonija',
    toName: 'Grčka',
    toGreeceTime: 70,
    toSerbiaTime: 25,
    toGreeceStatus: 'guzva',
    toSerbiaStatus: 'umereno',
    camNameGreece: 'CAM 03 - Bogorodica (Izlaz)',
    camNameSerbia: 'CAM 04 - Evzoni (Ulaz)',
    reports: [
      { user: 'Zoran P.', time: 'pre 5 min', direction: 'grcka', text: 'Gužva je velika, kolona je oko 1.5km. Rade 4 trake ali ide sporo.' },
      { user: 'Ivana M.', time: 'pre 30 min', direction: 'grcka', text: 'Čekamo već sat vremena, pomeramo se na svakih 5-10 minuta.' }
    ]
  },
  {
    id: 'gradina',
    name: 'Gradina / Kalotina',
    flagFrom: '🇷🇸',
    flagTo: '🇧🇬',
    fromName: 'Srbija',
    toName: 'Bugarska',
    toGreeceTime: 45,
    toSerbiaTime: 20,
    toGreeceStatus: 'umereno',
    toSerbiaStatus: 'prohodno',
    camNameGreece: 'CAM 05 - Gradina (Izlaz)',
    camNameSerbia: 'CAM 06 - Gradina (Ulaz)',
    reports: [
      { user: 'Dragan S.', time: 'pre 20 min', direction: 'grcka', text: 'Umeren saobraćaj, prošli obe granice za oko 45 minuta ukupno.' }
    ]
  },
  {
    id: 'kulata',
    name: 'Kulata / Promahonas',
    flagFrom: '🇧🇬',
    flagTo: '🇬🇷',
    fromName: 'Bugarska',
    toName: 'Grčka',
    toGreeceTime: 50,
    toSerbiaTime: 15,
    toGreeceStatus: 'umereno',
    toSerbiaStatus: 'prohodno',
    camNameGreece: 'CAM 07 - Kulata (Izlaz)',
    camNameSerbia: 'CAM 08 - Promahonas (Ulaz)',
    reports: [
      { user: 'Milan V.', time: 'pre 15 min', direction: 'grcka', text: 'Bugari i Grci rade zajednički pregled, čeka se oko 50 minuta.' }
    ]
  }
];

export default function BorderStatus() {
  const [borders, setBorders] = useState(INITIAL_BORDERS_DATA);
  const [timestamp, setTimestamp] = useState(new Date());
  const [activeCamDirection, setActiveCamDirection] = useState({}); // { borderId: 'greece' | 'serbia' }
  const [refreshing, setRefreshing] = useState({}); // { borderId: boolean }
  const [carPositions, setCarPositions] = useState({}); // { borderId: Array of positions }

  // Modal / Form state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedBorder, setSelectedBorder] = useState(null);
  const [formData, setFormData] = useState({
    user: '',
    direction: 'grcka',
    waitTime: '30',
    text: ''
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize camera car layouts
  useEffect(() => {
    const initialCars = {};
    borders.forEach(b => {
      initialCars[b.id] = generateMockCars(b.toGreeceStatus);
      setActiveCamDirection(prev => ({ ...prev, [b.id]: 'grcka' }));
    });
    setCarPositions(initialCars);
  }, []);

  const generateMockCars = (status) => {
    let count = 6;
    if (status === 'prohodno') count = 2;
    if (status === 'umereno') count = 7;
    if (status === 'guzva') count = 15;

    const cars = [];
    for (let i = 0; i < count; i++) {
      cars.push({
        id: i,
        // Lane 0, 1 or 2
        lane: Math.floor(Math.random() * 3),
        // Position along the road (percentage)
        pos: 10 + i * (80 / count) + (Math.random() * 8 - 4),
        // Color type
        color: ['#ff4d4d', '#4dadff', '#ffffff', '#ffd14d', '#b1f3b1', '#dedede'][Math.floor(Math.random() * 6)],
        width: 14 + Math.random() * 6,
        type: Math.random() > 0.2 ? 'car' : 'truck'
      });
    }
    return cars;
  };

  const handleRefreshCam = (borderId) => {
    setRefreshing(prev => ({ ...prev, [borderId]: true }));
    setTimeout(() => {
      const border = borders.find(b => b.id === borderId);
      const status = activeCamDirection[borderId] === 'grcka' ? border.toGreeceStatus : border.toSerbiaStatus;
      setCarPositions(prev => ({
        ...prev,
        [borderId]: generateMockCars(status)
      }));
      setRefreshing(prev => ({ ...prev, [borderId]: false }));
    }, 1200);
  };

  const handleDirectionToggle = (borderId, direction) => {
    setActiveCamDirection(prev => ({ ...prev, [borderId]: direction }));
    const border = borders.find(b => b.id === borderId);
    const status = direction === 'grcka' ? border.toGreeceStatus : border.toSerbiaStatus;
    setCarPositions(prev => ({
      ...prev,
      [borderId]: generateMockCars(status)
    }));
  };

  const openReportModal = (border) => {
    setSelectedBorder(border);
    setFormData({
      user: '',
      direction: 'grcka',
      waitTime: '30',
      text: ''
    });
    setReportModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.user.trim()) {
      alert('Molimo unesite vaše ime.');
      return;
    }

    const waitMinutes = Number(formData.waitTime);
    let status = 'prohodno';
    if (waitMinutes > 30 && waitMinutes <= 60) status = 'umereno';
    if (waitMinutes > 60) status = 'guzva';

    // Update state locally
    setBorders(prev => prev.map(b => {
      if (b.id === selectedBorder.id) {
        const newReport = {
          user: formData.user,
          time: 'pre par sekundi',
          direction: formData.direction,
          text: formData.text || `Prijavljeno vreme čekanja: ${waitMinutes} min.`
        };
        return {
          ...b,
          toGreeceTime: formData.direction === 'grcka' ? waitMinutes : b.toGreeceTime,
          toSerbiaTime: formData.direction === 'srbija' ? waitMinutes : b.toSerbiaTime,
          toGreeceStatus: formData.direction === 'grcka' ? status : b.toGreeceStatus,
          toSerbiaStatus: formData.direction === 'srbija' ? status : b.toSerbiaStatus,
          reports: [newReport, ...b.reports]
        };
      }
      return b;
    }));

    // Trigger local cars refresh
    setTimeout(() => {
      const activeDir = activeCamDirection[selectedBorder.id];
      if (activeDir === formData.direction) {
        setCarPositions(prev => ({
          ...prev,
          [selectedBorder.id]: generateMockCars(status)
        }));
      }
    }, 100);

    setReportModalOpen(false);
    alert('Hvala vam! Vaš izveštaj o vremenu čekanja je uspešno poslat i ažuriran.');
  };

  const getStatusClass = (status) => {
    if (status === 'prohodno') return 'status-green';
    if (status === 'umereno') return 'status-yellow';
    return 'status-red';
  };

  const getStatusLabel = (status) => {
    if (status === 'prohodno') return 'Bez zadržavanja';
    if (status === 'umereno') return 'Umereno zadržavanje';
    return 'Veća gužva';
  };

  const formatTime = (time) => {
    if (time === 0) return 'Nema čekanja';
    if (time >= 60) {
      const hours = Math.floor(time / 60);
      const mins = time % 60;
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    }
    return `${time} min`;
  };

  return (
    <div className="borders-dashboard animate-fade">
      <div className="borders-intro-box">
        <h3 className="borders-main-title">Stanje na graničnim prelazima uživo</h3>
        <p className="borders-subtitle">
          Pratite simulated-live CCTV kamere i ažurna vremena čekanja na ključnim prelazima ka Grčkoj. Podaci se formiraju na osnovu poslednjih izveštaja naših putnika.
        </p>
      </div>

      <div className="borders-grid">
        {borders.map(border => {
          const activeDirection = activeCamDirection[border.id] || 'grcka';
          const isCamRefreshing = refreshing[border.id];
          const cars = carPositions[border.id] || [];
          const currentCamName = activeDirection === 'grcka' ? border.camNameGreece : border.camNameSerbia;
          const waitTime = activeDirection === 'grcka' ? border.toGreeceTime : border.toSerbiaTime;
          const status = activeDirection === 'grcka' ? border.toGreeceStatus : border.toSerbiaStatus;

          return (
            <div key={border.id} className="border-card glass animate-scale">
              {/* Card Header */}
              <div className="border-card-header">
                <span className="border-card-flags">
                  {border.flagFrom} ➔ {border.flagTo}
                </span>
                <h4 className="border-card-title">{border.name}</h4>
              </div>

              {/* Waiting times side-by-side indicator */}
              <div className="border-directions-times">
                <div 
                  className={`dir-time-box ${activeDirection === 'grcka' ? 'active' : ''}`}
                  onClick={() => handleDirectionToggle(border.id, 'grcka')}
                >
                  <span className="dir-label">Ka Grčkoj {border.flagTo}</span>
                  <span className={`dir-status-dot ${border.toGreeceStatus}`}></span>
                  <span className="dir-time-value">{formatTime(border.toGreeceTime)}</span>
                </div>
                <div 
                  className={`dir-time-box ${activeDirection === 'srbija' ? 'active' : ''}`}
                  onClick={() => handleDirectionToggle(border.id, 'srbija')}
                >
                  <span className="dir-label">Ka Srbiji {border.flagFrom}</span>
                  <span className={`dir-status-dot ${border.toSerbiaStatus}`}></span>
                  <span className="dir-time-value">{formatTime(border.toSerbiaTime)}</span>
                </div>
              </div>

              {/* CCTV Live Simulator Screen */}
              <div className="cctv-viewport">
                <div className="cctv-overlay-live">
                  <span className="cctv-live-dot"></span>
                  <span>LIVE</span>
                </div>
                <div className="cctv-overlay-info">
                  <div className="cctv-cam-name">{currentCamName}</div>
                  <div className="cctv-timestamp">
                    {timestamp.toLocaleDateString('sr-RS')} {timestamp.toLocaleTimeString('sr-RS')}
                  </div>
                </div>

                {isCamRefreshing && (
                  <div className="cctv-loading-overlay">
                    <div className="cctv-spinner"></div>
                    <span>Povezivanje sa kamerom...</span>
                  </div>
                )}

                {/* Scanlines Effect */}
                <div className="cctv-scanlines"></div>

                {/* Simulated Asphalt Road & Cars */}
                <div className="cctv-road-simulation">
                  <div className="road-stripes"></div>
                  <div className="road-lanes">
                    <div className="road-lane-line"></div>
                    <div className="road-lane-line"></div>
                  </div>

                  {/* Render simulated cars waiting */}
                  {cars.map(car => (
                    <div
                      key={car.id}
                      className={`sim-car ${car.type}`}
                      style={{
                        left: `${car.pos}%`,
                        top: `${20 + car.lane * 25}%`,
                        backgroundColor: car.color,
                        width: `${car.width}px`
                      }}
                    >
                      <div className="sim-car-windshield"></div>
                      <div className="sim-car-headlights"></div>
                    </div>
                  ))}
                  
                  {/* Border Booth icon representation */}
                  <div className="sim-border-gate">
                    <div className="gate-booth"></div>
                    <div className="gate-barrier"></div>
                  </div>
                </div>
              </div>

              {/* Camera Actions */}
              <div className="cctv-actions">
                <button 
                  className="btn-refresh-cam"
                  onClick={() => handleRefreshCam(border.id)}
                  disabled={isCamRefreshing}
                >
                  {isCamRefreshing ? 'Osvežavanje...' : '🔄 Osveži snimak'}
                </button>

                <button 
                  className="btn-report-wait"
                  onClick={() => openReportModal(border)}
                >
                  📢 Prijavi čekanje
                </button>
              </div>

              {/* Passenger Reports Section */}
              <div className="border-passenger-reports">
                <h5 className="reports-section-title">Nedavni izveštaji putnika:</h5>
                <div className="reports-list-scroll">
                  {border.reports.filter(r => r.direction === activeDirection).length > 0 ? (
                    border.reports
                      .filter(r => r.direction === activeDirection)
                      .map((report, idx) => (
                        <div key={idx} className="passenger-report-bubble">
                          <div className="report-bubble-header">
                            <span className="bubble-user">👤 {report.user}</span>
                            <span className="bubble-time">{report.time}</span>
                          </div>
                          <p className="bubble-text">{report.text}</p>
                        </div>
                      ))
                  ) : (
                    <div className="no-reports-placeholder">
                      Nema nedavnih izveštaja za ovaj smer. Budite prvi koji će prijaviti stanje!
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Modal */}
      {reportModalOpen && selectedBorder && (
        <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
          <div className="modal-container glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button className="btn-modal-close" onClick={() => setReportModalOpen(false)}>×</button>
            <div style={{ padding: '1.8rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                Prijava stanja: {selectedBorder.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                Pomozite vozačima koji putuju u istom smeru deljenjem informacija iz prve ruke.
              </p>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Vaše ime:</label>
                  <input 
                    type="text" 
                    placeholder="Npr. Nikola" 
                    value={formData.user}
                    onChange={e => setFormData(prev => ({ ...prev, user: e.target.value }))}
                    className="forum-search-input"
                    style={{ width: '100%', padding: '0.6rem', marginTop: '0.2rem' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Smer putovanja:</label>
                  <select
                    value={formData.direction}
                    onChange={e => setFormData(prev => ({ ...prev, direction: e.target.value }))}
                    className="forum-search-input"
                    style={{ width: '100%', padding: '0.6rem', marginTop: '0.2rem', cursor: 'pointer' }}
                  >
                    <option value="grcka">Ka Grčkoj (Izlaz)</option>
                    <option value="srbija">Ka Srbiji (Ulaz)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Procenjeno vreme čekanja:</label>
                  <select
                    value={formData.waitTime}
                    onChange={e => setFormData(prev => ({ ...prev, waitTime: e.target.value }))}
                    className="forum-search-input"
                    style={{ width: '100%', padding: '0.6rem', marginTop: '0.2rem', cursor: 'pointer' }}
                  >
                    <option value="0">Bez čekanja (0-5 min)</option>
                    <option value="15">Oko 15 minuta</option>
                    <option value="30">Oko 30 minuta</option>
                    <option value="45">Oko 45 minuta</option>
                    <option value="60">Oko 1 sat</option>
                    <option value="90">Oko 1.5 sat</option>
                    <option value="120">Preko 2 sata (Velika gužva)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Kratak komentar (opciono):</label>
                  <textarea 
                    placeholder="Kakvo je stanje, koliko traka radi, ima li radova na putu..."
                    value={formData.text}
                    onChange={e => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    className="forum-search-input"
                    style={{ width: '100%', padding: '0.6rem', marginTop: '0.2rem', minHeight: '80px', resize: 'vertical' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-submit-inquiry"
                  style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
                >
                  Pošalji izveštaj
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
