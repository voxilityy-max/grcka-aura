import React, { useState, useEffect } from 'react';

const PRESET_IMAGES = [
  { id: 'villa-1', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', label: 'Moderna Vila sa bazenom' },
  { id: 'apartment-1', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', label: 'Apartman pored plaže' },
  { id: 'hotel-1', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', label: 'Luksuzan Apart-Hotel' },
  { id: 'traditional-1', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', label: 'Kamena kuća Lefkada' }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const DB_SCHEMAS = {
  users: ['id (INTEGER PRIMARY KEY)', 'email (TEXT UNIQUE)', 'fullName (TEXT)', 'password (TEXT)', 'phone (TEXT)', 'isAdmin (INTEGER)', 'avatar (TEXT)'],
  properties: ['id (INTEGER PRIMARY KEY)', 'title (TEXT)', 'location (TEXT)', 'type (TEXT)', 'price (REAL)', 'distanceToBeach (INTEGER)', 'guests (INTEGER)', 'bedrooms (INTEGER)', 'description (TEXT)', 'image (TEXT)', 'amenities (TEXT)'],
  reviews: ['id (INTEGER PRIMARY KEY)', 'propertyId (INTEGER REFERENCES properties)', 'userName (TEXT)', 'rating (REAL)', 'comment (TEXT)', 'date (TEXT)'],
  inquiries: ['id (INTEGER PRIMARY KEY)', 'propertyId (INTEGER REFERENCES properties)', 'userId (INTEGER REFERENCES users)', 'guests (INTEGER)', 'checkIn (TEXT)', 'checkOut (TEXT)', 'totalPrice (REAL)', 'status (TEXT)', 'message (TEXT)'],
  chat_messages: ['id (INTEGER PRIMARY KEY)', 'inquiryId (INTEGER REFERENCES inquiries)', 'sender (TEXT)', 'text (TEXT)', 'timestamp (TEXT)'],
  activity_logs: ['id (INTEGER PRIMARY KEY)', 'user (TEXT)', 'action (TEXT)', 'timestamp (TEXT)'],
  forum_posts: ['id (INTEGER PRIMARY KEY)', 'userEmail (TEXT)', 'userName (TEXT)', 'avatar (TEXT)', 'content (TEXT)', 'timestamp (TEXT)']
};

export default function HostPanel({ 
  onAddProperty, 
  destinations, 
  propertyTypes, 
  currentUser,
  properties = [],
  inquiries = [],
  activityLogs = [],
  onDeleteProperty,
  users = [],
  onToggleAdminStatus,
  onUpdateInquiryStatus,
  onSendChatMessage,
  onRefreshDatabase
}) {
  const [panelTab, setPanelTab] = useState('add'); // 'add', 'manage', 'logs', 'users', 'inquiries', 'database'

  const [activeTable, setActiveTable] = useState('users');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users;');
  const [queryResults, setQueryResults] = useState({ rows: [], columns: [], message: '', error: '' });
  const [queryLoading, setQueryLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editedJson, setEditedJson] = useState('');
  const [dbResetMessage, setDbResetMessage] = useState('');

  const executeQuery = async (queryToRun = sqlQuery) => {
    setQueryLoading(true);
    setQueryResults({ rows: [], columns: [], message: '', error: '' });
    try {
      const response = await fetch(`${API_URL}/api/admin/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query: queryToRun })
      });
      const data = await response.json();
      if (!response.ok) {
        setQueryResults({ rows: [], columns: [], message: '', error: data.error || 'Greška pri izvršavanju upita.' });
      } else {
        setQueryResults({
          rows: data.rows || [],
          columns: data.columns || [],
          message: data.message || 'Upit je uspešno izvršen.',
          error: ''
        });
      }
    } catch (err) {
      setQueryResults({ rows: [], columns: [], message: '', error: 'Greška u povezivanju sa serverom. Proverite da li je backend pokrenut.' });
    } finally {
      setQueryLoading(false);
    }
  };

  const handleTableChange = (tableName) => {
    setActiveTable(tableName);
    const newQuery = `SELECT * FROM ${tableName};`;
    setSqlQuery(newQuery);
    executeQuery(newQuery);
  };

  const handleResetDb = async () => {
    if (!confirm('Da li ste sigurni da želite da obrišete sve izmene i resetujete bazu podataka na fabrička podešavanja?')) {
      return;
    }
    setDbResetMessage('Resetovanje baze u toku...');
    try {
      const response = await fetch(`${API_URL}/api/admin/reset-db`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDbResetMessage('Baza je uspešno resetovana!');
        if (onRefreshDatabase) await onRefreshDatabase();
        handleTableChange(activeTable);
      } else {
        setDbResetMessage('Greška pri resetovanju: ' + data.message);
      }
    } catch (err) {
      setDbResetMessage('Greška pri resetovanju: Server nije dostupan.');
    }
    setTimeout(() => setDbResetMessage(''), 4000);
  };

  const handleExportDb = () => {
    if (!queryResults.rows || queryResults.rows.length === 0) {
      alert('Nema podataka za izvoz. Prvo pokrenite upit.');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(queryResults.rows, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aura_export_${activeTable}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const openEditRow = (row) => {
    setEditingRow(row);
    setEditedJson(JSON.stringify(row, null, 2));
  };

  const saveEditedRow = async () => {
    try {
      const parsed = JSON.parse(editedJson);
      if (!parsed.id) {
        alert('Zapis mora imati primarni ključ "id" za modifikaciju.');
        return;
      }
      
      const sets = [];
      for (const [key, value] of Object.entries(parsed)) {
        if (key === 'id') continue;
        
        if (value === null) {
          sets.push(`${key} = NULL`);
        } else if (typeof value === 'boolean') {
          sets.push(`${key} = ${value ? 1 : 0}`);
        } else if (typeof value === 'number') {
          sets.push(`${key} = ${value}`);
        } else {
          const escaped = String(value).replace(/'/g, "''");
          sets.push(`${key} = '${escaped}'`);
        }
      }
      
      const query = `UPDATE ${activeTable} SET ${sets.join(', ')} WHERE id = ${parsed.id};`;
      
      const response = await fetch(`${API_URL}/api/admin/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      if (!response.ok) {
        alert('Greška pri izmeni: ' + (data.error || 'Nepoznata greška'));
      } else {
        alert('Zapis je uspešno izmenjen u SQLite bazi!');
        setEditingRow(null);
        if (onRefreshDatabase) await onRefreshDatabase();
        executeQuery(`SELECT * FROM ${activeTable};`);
      }
    } catch (err) {
      alert('Neispravan JSON format. Proverite zagrade i zareze.');
    }
  };

  const deleteRow = async (id) => {
    if (!confirm(`Da li ste sigurni da želite da obrišete red sa ID-jem ${id} iz tabele ${activeTable}?`)) {
      return;
    }
    const query = `DELETE FROM ${activeTable} WHERE id = ${id};`;
    try {
      const response = await fetch(`${API_URL}/api/admin/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      if (!response.ok) {
        alert('Greška pri brisanju: ' + (data.error || 'Nepoznata greška'));
      } else {
        alert('Zapis je uspešno obrisan!');
        if (onRefreshDatabase) await onRefreshDatabase();
        executeQuery(`SELECT * FROM ${activeTable};`);
      }
    } catch (err) {
      alert('Greška pri povezivanju sa serverom.');
    }
  };

  useEffect(() => {
    if (panelTab === 'database') {
      const currentQuery = `SELECT * FROM ${activeTable};`;
      setSqlQuery(currentQuery);
      executeQuery(currentQuery);
    }
  }, [panelTab, activeTable]);
  
  const [formData, setFormData] = useState({
    title: '',
    location: destinations[0] || 'Kasandra',
    type: propertyTypes[0] || 'Apartman',
    price: 65,
    distanceToBeach: 150,
    guests: 4,
    bedrooms: 2,
    description: '',
    image: PRESET_IMAGES[0].url,
    amenities: {
      wifi: true,
      pool: false,
      beachfront: false,
      parking: true,
      airConditioning: true,
      pets: false
    }
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [selectedInqForChat, setSelectedInqForChat] = useState(null);
  const [chatText, setChatText] = useState('');

  // Calculate Quick Stats
  const totalProperties = properties.length;
  const totalInquiries = inquiries.length;
  const activeBookings = inquiries.filter(i => i.status === 'Odobreno').length;
  const totalBookingValue = inquiries.reduce((sum, i) => sum + i.totalPrice, 0);

  // Calculate analytics for charts
  const revenueByDest = destinations.reduce((acc, dest) => {
    const destRevenue = inquiries
      .filter(inq => inq.status === 'Odobreno')
      .reduce((sum, inq) => {
        const prop = properties.find(p => p.id === inq.propertyId);
        if (prop && prop.location.toLowerCase() === dest.toLowerCase()) {
          return sum + inq.totalPrice;
        }
        return sum;
      }, 0);
    acc[dest] = destRevenue;
    return acc;
  }, {});

  const maxRevenue = Math.max(...Object.values(revenueByDest), 1);

  const totalInqs = inquiries.length || 1;
  const approvedCount = inquiries.filter(i => i.status === 'Odobreno').length;
  const pendingCount = inquiries.filter(i => i.status === 'Poslato').length;
  const rejectedCount = inquiries.filter(i => i.status === 'Odbijeno').length;

  const approvedPct = Math.round((approvedCount / totalInqs) * 100);
  const pendingPct = Math.round((pendingCount / totalInqs) * 100);
  const rejectedPct = Math.round((rejectedCount / totalInqs) * 100);

  const countByType = propertyTypes.reduce((acc, type) => {
    acc[type] = properties.filter(p => p.type.toLowerCase() === type.toLowerCase()).length;
    return acc;
  }, {});
  const totalProps = properties.length || 1;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'distanceToBeach' ? parseFloat(value) || '' : value
    }));
  };

  const toggleAmenity = (key) => {
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key]
      }
    }));
  };

  const handlePresetSelect = (url) => {
    setFormData(prev => ({ ...prev, image: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.title.trim()) {
      setError('Naziv smeštaja je obavezan.');
      return;
    }
    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Cena mora biti pozitivan broj.');
      return;
    }
    const distNum = parseInt(formData.distanceToBeach, 10);
    if (isNaN(distNum) || distNum < 0) {
      setError('Udaljenost od plaže ne može biti negativna.');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      setError('Opis smeštaja mora imati barem 20 karaktera.');
      return;
    }

    const newProperty = {
      ...formData,
      id: Date.now(),
      price: priceNum,
      distanceToBeach: distNum,
      rating: 5.0,
      reviews: []
    };

    onAddProperty(newProperty);
    setSubmitted(true);

    // Reset Form
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        title: '',
        location: destinations[0] || 'Kasandra',
        type: propertyTypes[0] || 'Apartman',
        price: 65,
        distanceToBeach: 150,
        guests: 4,
        bedrooms: 2,
        description: '',
        image: PRESET_IMAGES[0].url,
        amenities: {
          wifi: true,
          pool: false,
          beachfront: false,
          parking: true,
          airConditioning: true,
          pets: false
        }
      });
    }, 2500);
  };

  // Filter logs based on search
  const filteredLogs = activityLogs.filter(log => 
    log.action.toLowerCase().includes(logSearch.toLowerCase()) || 
    log.user.toLowerCase().includes(logSearch.toLowerCase())
  );

  // Guard Clause for Non-Admin
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="host-panel-container animate-fade">
        <div className="host-header" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--danger)', marginBottom: '1.5rem' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>Pristup Odbijen</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Nemate ovlašćenje za pristup ovoj stranici. Samo vlasnici (administratori) sajta mogu objavljivati i menjati smeštaje.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="host-panel-container animate-fade">
      {/* 1. Quick Stats Header */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏝️</div>
          <div className="stat-info">
            <span className="stat-value">{totalProperties}</span>
            <span className="stat-label">Smeštaja u Ponudi</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📩</div>
          <div className="stat-info">
            <span className="stat-value">{totalInquiries}</span>
            <span className="stat-label">Ukupno Upita</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{activeBookings}</span>
            <span className="stat-label">Odobrena Upita</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💶</div>
          <div className="stat-info">
            <span className="stat-value">{totalBookingValue}€</span>
            <span className="stat-label">Promet Rezervacija</span>
          </div>
        </div>
      </div>

      {/* Analytics and Visual Charts Section */}
      <div className="dashboard-analytics-grid">
        {/* Card 1: Revenue by Destination */}
        <div className="analytics-card">
          <div className="analytics-card-title">
            📊 Finansijski Promet po Regijama
          </div>
          <div className="dest-chart-container">
            {destinations.map(dest => {
              const val = revenueByDest[dest] || 0;
              const pct = Math.round((val / maxRevenue) * 100);
              return (
                <div key={dest} className="dest-chart-row">
                  <div className="dest-chart-label-row">
                    <span className="dest-chart-name">{dest}</span>
                    <span className="dest-chart-value">{val}€</span>
                  </div>
                  <div className="dest-chart-bar-bg">
                    <div 
                      className="dest-chart-bar-fill" 
                      style={{ width: `${pct}%` }} 
                      title={`${dest}: ${val}€`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Inquiries status (Radial Progress Rings) */}
        <div className="analytics-card">
          <div className="analytics-card-title">
            🎯 Procenat Uspešnosti Rezervacija
          </div>
          <div className="radial-charts-container">
            {/* Approved Ring */}
            <div className="radial-chart-item">
              <svg width="68" height="68" viewBox="0 0 36 36">
                <path
                  className="ring-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3.5"
                />
                <path
                  className="ring-fill"
                  strokeDasharray={`${approvedPct}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <text x="18" y="20.5" className="ring-text" textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--text-main)">
                  {approvedPct}%
                </text>
              </svg>
              <span className="radial-chart-label">Odobreno ({approvedCount})</span>
            </div>

            {/* Pending Ring */}
            <div className="radial-chart-item">
              <svg width="68" height="68" viewBox="0 0 36 36">
                <path
                  className="ring-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3.5"
                />
                <path
                  className="ring-fill"
                  strokeDasharray={`${pendingPct}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <text x="18" y="20.5" className="ring-text" textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--text-main)">
                  {pendingPct}%
                </text>
              </svg>
              <span className="radial-chart-label">Na čekanju ({pendingCount})</span>
            </div>

            {/* Rejected Ring */}
            <div className="radial-chart-item">
              <svg width="68" height="68" viewBox="0 0 36 36">
                <path
                  className="ring-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3.5"
                />
                <path
                  className="ring-fill"
                  strokeDasharray={`${rejectedPct}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--danger)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <text x="18" y="20.5" className="ring-text" textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--text-main)">
                  {rejectedPct}%
                </text>
              </svg>
              <span className="radial-chart-label">Odbijeno ({rejectedCount})</span>
            </div>
          </div>
        </div>

        {/* Card 3: Property Type Distribution */}
        <div className="analytics-card">
          <div className="analytics-card-title">
            🏡 Struktura Ponude po Tipu Smeštaja
          </div>
          <div className="type-chart-container">
            {propertyTypes.map(type => {
              const count = countByType[type] || 0;
              const pct = Math.round((count / totalProps) * 100);
              return (
                <div key={type} className="type-chart-item">
                  <div className="type-chart-pillar-wrapper" title={`${type}: ${count} objekata (${pct}%)`}>
                    <div 
                      className={`type-chart-pillar-fill ${type.toLowerCase()}`}
                      style={{ height: `${pct || 5}%` }}
                    />
                  </div>
                  <span className="type-chart-count">{count}</span>
                  <span className="type-chart-label">
                    {type === 'Apartman' ? '🏢 Apartmani' : type === 'Vila' ? '🏡 Vile' : '🏨 Hoteli'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="host-header" style={{ marginBottom: '1.5rem', marginTop: '2.5rem' }}>
        <h2>Administratorski Panel - Portal CMS</h2>
        <p>Upravljajte smeštajnim jedinicama, pratite rad portala i pratite sve aktivnosti korisnika na jednom mestu.</p>
      </div>

      {/* 2. Inner Tabs Selection */}
      <div className="dashboard-nav-container">
        <div className="dashboard-nav">
          <button 
            className={`dashboard-nav-item ${panelTab === 'add' ? 'active' : ''}`}
            onClick={() => setPanelTab('add')}
          >
            ➕ Dodaj Smeštaj
          </button>
          <button 
            className={`dashboard-nav-item ${panelTab === 'manage' ? 'active' : ''}`}
            onClick={() => setPanelTab('manage')}
          >
            📂 Objekti ({totalProperties})
          </button>
          <button 
            className={`dashboard-nav-item ${panelTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setPanelTab('inquiries')}
          >
            📩 Rezervacije ({inquiries.length})
          </button>
          <button 
            className={`dashboard-nav-item ${panelTab === 'logs' ? 'active' : ''}`}
            onClick={() => setPanelTab('logs')}
          >
            📋 Aktivnosti ({activityLogs.length})
          </button>
          <button 
            className={`dashboard-nav-item ${panelTab === 'users' ? 'active' : ''}`}
            onClick={() => setPanelTab('users')}
          >
            👥 Korisnici ({users.length})
          </button>
          <button 
            className={`dashboard-nav-item ${panelTab === 'database' ? 'active' : ''}`}
            onClick={() => setPanelTab('database')}
          >
            🗄️ SQL Terminal
          </button>
        </div>
      </div>

      {/* 3. Tab contents */}

      {/* Tab: ADD PROPERTY */}
      {panelTab === 'add' && (
        submitted ? (
          <div className="success-message animate-scale" style={{ padding: '2.5rem', fontSize: '1.1rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: 'var(--success)' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 8 12 12 14 14"></polyline>
              <path d="M12 2a10 10 0 1 0 10 10" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p>Smeštaj je uspešno objavljen!</p>
            <p style={{ fontWeight: 'normal', fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
              Nova nekretnina je dodata u aktivnu ponudu portala GrčkaAura.
            </p>
          </div>
        ) : (
          <div className="calc-layout animate-fade">
            {/* Left side: Form */}
            <div className="calc-form-card" style={{ padding: '1.8rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.4rem' }}>
                Podaci o Objektu
              </h3>

              <form onSubmit={handleSubmit} className="inquiry-form">
                {error && (
                  <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(230, 57, 70, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', fontWeight: '600', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {error}
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="title">Naziv Smeštaja *</label>
                  <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange}
                    placeholder="npr. Vila Horizon Sea View" 
                    required 
                  />
                </div>

                <div className="host-form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-field">
                    <label htmlFor="location">Regija / Lokacija *</label>
                    <select id="location" name="location" value={formData.location} onChange={handleChange}>
                      {destinations.map(dest => (
                        <option key={dest} value={dest}>{dest}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="type">Tip smeštaja *</label>
                    <select id="type" name="type" value={formData.type} onChange={handleChange}>
                      {propertyTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="host-form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-field">
                    <label htmlFor="price">Cena po noćenju (€) *</label>
                    <input 
                      type="number" 
                      id="price" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleChange}
                      min="1"
                      required 
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="distanceToBeach">Udaljenost od plaže (m) *</label>
                    <input 
                      type="number" 
                      id="distanceToBeach" 
                      name="distanceToBeach" 
                      value={formData.distanceToBeach} 
                      onChange={handleChange}
                      min="0"
                      required 
                    />
                  </div>
                </div>

                {/* Counter controls for guests and bedrooms */}
                <div className="host-form-grid" style={{ marginBottom: '1rem' }}>
                  <div className="form-field">
                    <label>Maksimalan broj gostiju</label>
                    <div className="counter-control" style={{ marginTop: '0.4rem' }}>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}>-</button>
                      <span>{formData.guests}</span>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, guests: Math.min(15, prev.guests + 1) }))}>+</button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Broj spavaćih soba</label>
                    <div className="counter-control" style={{ marginTop: '0.4rem' }}>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, bedrooms: Math.max(1, prev.bedrooms - 1) }))}>-</button>
                      <span>{formData.bedrooms}</span>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, bedrooms: Math.min(8, prev.bedrooms + 1) }))}>+</button>
                    </div>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="description">Detaljan Opis Smeštaja * (min. 20 karaktera)</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="3" 
                    placeholder="Opišite detaljno Vaš smeštaj..."
                    required 
                  />
                </div>

                <div className="form-field">
                  <label style={{ marginBottom: '0.5rem', display: 'block' }}>Izaberite sliku objekta</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                    {PRESET_IMAGES.map(img => (
                      <div 
                        key={img.id} 
                        onClick={() => handlePresetSelect(img.url)}
                        style={{ 
                          cursor: 'pointer', 
                          borderRadius: '6px', 
                          overflow: 'hidden', 
                          border: formData.image === img.url ? '3px solid var(--accent)' : '1px solid var(--border)',
                          transform: formData.image === img.url ? 'scale(1.02)' : 'none',
                          transition: 'var(--transition)'
                        }}
                      >
                        <img src={img.url} alt={img.label} style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                        <div style={{ fontSize: '0.7rem', padding: '0.2rem', textAlign: 'center', fontWeight: '600' }}>
                          {img.label.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-field" style={{ marginTop: '1rem' }}>
                  <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '700' }}>Ili otpremite sopstvenu sliku objekta</label>
                  <div 
                    className="file-upload-zone"
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.2rem',
                      textAlign: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        
                        const uploadData = new FormData();
                        uploadData.append('file', file);
                        
                        e.target.disabled = true;
                        const labelEl = e.target.nextSibling;
                        const oldText = labelEl.innerText;
                        labelEl.innerText = "Otpremanje slike...";
                        
                        try {
                          const res = await fetch(`${API_URL}/api/upload`, {
                            method: 'POST',
                            body: uploadData
                          });
                          const data = await res.json();
                          if (data.url) {
                            handlePresetSelect(data.url);
                            labelEl.innerText = "Slika uspešno otpremljena! ✓";
                          } else {
                            alert(data.error || 'Greška pri otpremanju slike.');
                            labelEl.innerText = oldText;
                          }
                        } catch (err) {
                          alert('Greška pri otpremanju slike.');
                          labelEl.innerText = oldText;
                        } finally {
                          e.target.disabled = false;
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <div className="upload-label-text" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      📸 Kliknite ili prevucite sliku ovde za upload
                    </div>
                  </div>
                  {formData.image && !PRESET_IMAGES.some(img => img.url === formData.image) && (
                    <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <img src={formData.image} alt="Korisnička slika" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>✓ Izabrana Vaša otpremljena slika</span>
                    </div>
                  )}
                </div>

                {/* Amenities as clickable pills */}
                <div className="form-field">
                  <label>Pogodnosti smeštaja (klub pogodnosti)</label>
                  <div className="amenity-pills">
                    <button type="button" className={`amenity-pill ${formData.amenities.wifi ? 'active' : ''}`} onClick={() => toggleAmenity('wifi')}>
                      📶 Wi-Fi
                    </button>
                    <button type="button" className={`amenity-pill ${formData.amenities.pool ? 'active' : ''}`} onClick={() => toggleAmenity('pool')}>
                      🏊 Bazen
                    </button>
                    <button type="button" className={`amenity-pill ${formData.amenities.beachfront ? 'active' : ''}`} onClick={() => toggleAmenity('beachfront')}>
                      🏖️ Na plaži
                    </button>
                    <button type="button" className={`amenity-pill ${formData.amenities.parking ? 'active' : ''}`} onClick={() => toggleAmenity('parking')}>
                      🅿️ Parking
                    </button>
                    <button type="button" className={`amenity-pill ${formData.amenities.airConditioning ? 'active' : ''}`} onClick={() => toggleAmenity('airConditioning')}>
                      ❄️ Klima
                    </button>
                    <button type="button" className={`amenity-pill ${formData.amenities.pets ? 'active' : ''}`} onClick={() => toggleAmenity('pets')}>
                      🐾 Ljubimci
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-create-listing" style={{ marginTop: '1.5rem', width: '100%', padding: '0.85rem' }}>
                  Objavite Smeštaj na Portalu
                </button>
              </form>
            </div>

            {/* Right side: Live Preview Card */}
            <div className="live-preview-container">
              <span className="live-preview-title">Pregled Uživo (Live Preview)</span>
              
              <div className="property-card" style={{ width: '100%', maxWidth: '340px', margin: 0, boxShadow: 'var(--shadow-md)' }}>
                <div className="property-image-box">
                  <img src={formData.image} alt={formData.title || 'Smeštaj'} className="property-image" />
                  <span className="property-badge">{formData.type}</span>
                  <div className="property-rating-badge">⭐ 5.0</div>
                </div>

                <div className="property-details-box">
                  <div className="property-location-box">
                    <span>📍 {formData.location}</span>
                    <span>🌊 {formData.distanceToBeach || 0}m</span>
                  </div>

                  <h3 className="property-card-title">{formData.title || 'Naziv objekta...'}</h3>

                  <div className="property-specs">
                    <span>👥 {formData.guests} osobe</span>
                    <span>🛏️ {formData.bedrooms} sobe</span>
                  </div>

                  <div className="property-card-amenities" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', fontSize: '1rem', color: 'var(--text-muted)' }}>
                    {formData.amenities.wifi && <span title="Besplatan Wi-Fi">📶</span>}
                    {formData.amenities.pool && <span title="Bazen">🏊</span>}
                    {formData.amenities.beachfront && <span title="Na samoj plaži">🏖️</span>}
                    {formData.amenities.parking && <span title="Besplatan parking">🅿️</span>}
                    {formData.amenities.airConditioning && <span title="Klimatizovano">❄️</span>}
                    {formData.amenities.pets && <span title="Dozvoljeni ljubimci">🐾</span>}
                  </div>

                  <div className="property-card-footer" style={{ marginTop: '1.2rem', paddingTop: '0.8rem' }}>
                    <div className="property-price-box">
                      <span className="price-num">{formData.price || 0}€</span>
                      <span className="price-label">/ noćenje</span>
                    </div>
                    <button className="btn-card-details" type="button" style={{ pointerEvents: 'none' }}>
                      Pregled
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Tab: MANAGE PROPERTIES (LIST) */}
      {panelTab === 'manage' && (
        <div className="inquiries-panel-card animate-fade" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Aktivne Ponude na Sajtu
          </h3>

          {properties.length > 0 ? (
            <div className="inquiries-table-wrapper">
              <table className="inquiries-table">
                <thead>
                  <tr>
                    <th>Fotografija</th>
                    <th>Naziv smeštaja</th>
                    <th>Destinacija</th>
                    <th>Tip</th>
                    <th>Cena</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(p => (
                    <tr key={p.id}>
                      <td>
                        <img src={p.image} alt={p.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.title}</td>
                      <td>{p.location}</td>
                      <td>{p.type}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary-light)' }}>{p.price}€</td>
                      <td>
                        <button 
                          className="btn-cancel-inquiry"
                          onClick={() => {
                            if (confirm(`Da li ste sigurni da želite da obrišete objekat "${p.title}" iz ponude?`)) {
                              onDeleteProperty(p.id);
                            }
                          }}
                        >
                          Obriši
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              Nema objavljenih smeštaja u bazi podataka.
            </div>
          )}
        </div>
      )}

      {/* Tab: AUDIT LOG (ACTIVITY HISTORY) */}
      {panelTab === 'logs' && (
        <div className="inquiries-panel-card animate-fade" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>
              Dnevnik Aktivnosti (Audit Log)
            </h3>
            <input 
              type="text" 
              placeholder="Pretraži zapise (korisnik ili akcija)..." 
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              className="forum-search-input"
              style={{ width: '280px', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
            />
          </div>

          {filteredLogs.length > 0 ? (
            <div className="premium-timeline" style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {filteredLogs.map(log => (
                <div key={log.id} className="timeline-card">
                  <div className={`timeline-dot ${log.type}`} />
                  <div className="timeline-time">{log.timestamp}</div>
                  <div className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>{log.user}</span>
                    <span style={{ 
                      fontSize: '0.62rem', 
                      padding: '0.1rem 0.4rem', 
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      fontWeight: '700',
                      backgroundColor: 
                        log.type === 'create' ? 'rgba(52, 168, 83, 0.08)' :
                        log.type === 'delete' ? 'rgba(230, 57, 70, 0.08)' :
                        log.type === 'auth' ? 'rgba(26, 115, 232, 0.08)' :
                        log.type === 'update' ? 'rgba(241, 165, 63, 0.08)' : 'rgba(241, 165, 63, 0.08)',
                      color:
                        log.type === 'create' ? '#16a34a' :
                        log.type === 'delete' ? '#dc2626' :
                        log.type === 'auth' ? '#1d4ed8' :
                        log.type === 'update' ? '#d97706' : '#d97706'
                    }}>
                      {log.type === 'create' ? 'Kreirano' : 
                       log.type === 'delete' ? 'Obrisano' : 
                       log.type === 'auth' ? 'Pristup' : 
                       log.type === 'update' ? 'Izmena' : 'Upit'}
                    </span>
                  </div>
                  <div className="timeline-desc" style={{ marginTop: '0.3rem', color: 'var(--text-muted)' }}>{log.action}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              Nema zabeleženih aktivnosti koje se podudaraju sa pretragom.
            </div>
          )}
        </div>
      )}

      {/* Tab: USERS MANAGEMENT */}
      {panelTab === 'users' && (
        <div className="inquiries-panel-card animate-fade" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            Upravljanje Korisnicima i Ulogama
          </h3>

          {users.length > 0 ? (
            <div className="user-roster-grid">
              {users.map(u => {
                const isOwner = u.email === 'voxilityy@gmail.com';
                const loggedInUserIsOwner = currentUser.email === 'voxilityy@gmail.com';
                
                let roleClass = 'user';
                let roleLabel = '👥 Klijent (Gost)';
                if (isOwner) {
                  roleClass = 'owner';
                  roleLabel = '👑 Vlasnik';
                } else if (u.isAdmin) {
                  roleClass = 'admin';
                  roleLabel = '🛠️ Admin';
                }

                return (
                  <div key={u.id} className="user-roster-card">
                    <img 
                      src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                      alt={u.fullName} 
                      className="roster-avatar" 
                    />
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      {u.fullName}
                    </div>
                    <div className={`roster-role-badge ${roleClass}`}>
                      {roleLabel}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      📧 {u.email}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>
                      📞 {u.phone || '/'}
                    </div>
                    <div style={{ marginTop: 'auto', width: '100%' }}>
                      {isOwner ? (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Glavni Vlasnik</span>
                      ) : loggedInUserIsOwner ? (
                        <button
                          className="btn-compare-action"
                          style={{ 
                            padding: '0.5rem 1rem', 
                            fontSize: '0.8rem', 
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            width: '100%',
                            backgroundColor: u.isAdmin ? 'var(--danger)' : 'var(--success)',
                            borderColor: u.isAdmin ? 'var(--danger)' : 'var(--success)',
                            color: '#ffffff'
                          }}
                          onClick={() => {
                            const confirmMsg = u.isAdmin 
                              ? `Da li ste sigurni da želite da oduzmete administratorska prava korisniku ${u.fullName}?` 
                              : `Da li ste sigurni da želite da dodelite administratorska prava korisniku ${u.fullName}?`;
                            if (confirm(confirmMsg)) {
                              onToggleAdminStatus(u.id);
                            }
                          }}
                        >
                          {u.isAdmin ? 'Oduzmi Admin Prava' : 'Dodeli Admin Prava'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: '600' }}>
                          Samo Gazda može menjati uloge
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              Nema registrovanih korisnika.
            </div>
          )}
        </div>
      )}

      {/* Tab: INQUIRIES / RESERVATIONS MANAGEMENT */}
      {panelTab === 'inquiries' && (
        <div className="inquiries-panel-card animate-fade" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Upravljanje Rezervacijama i Upitima
          </h3>

          {inquiries.length > 0 ? (
            <div className="inquiries-table-wrapper">
              <table className="inquiries-table">
                <thead>
                  <tr>
                    <th>Gost</th>
                    <th>Smeštaj</th>
                    <th>Termin / Noćenja</th>
                    <th>Ukupna Cena</th>
                    <th>Poruka gosta</th>
                    <th>Status</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map(inq => {
                    const guestUser = users.find(u => u.id === inq.userId);
                    const property = properties.find(p => p.id === inq.propertyId);

                    const guestName = guestUser ? guestUser.fullName : 'Nepoznat gost';
                    const guestEmail = guestUser ? guestUser.email : 'Nema e-maila';
                    const guestAvatar = guestUser ? guestUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                    const propTitle = property ? property.title : 'Nepoznat smeštaj';
                    const propLocation = property ? property.location : '';

                    let statusLabel = inq.status;
                    let statusClassColor = '#d97706'; // default orange
                    let statusBgColor = 'rgba(241, 165, 63, 0.08)';
                    let statusBorderColor = '#fde047';

                    if (inq.status === 'Odobreno') {
                      statusLabel = 'Odobreno';
                      statusClassColor = '#16a34a'; // green
                      statusBgColor = 'rgba(52, 168, 83, 0.08)';
                      statusBorderColor = '#86efac';
                    } else if (inq.status === 'Odbijeno') {
                      statusLabel = 'Odbijeno';
                      statusClassColor = '#dc2626'; // red
                      statusBgColor = 'rgba(230, 57, 70, 0.08)';
                      statusBorderColor = '#fca5a5';
                    } else if (inq.status === 'Poslato') {
                      statusLabel = 'Na čekanju';
                      statusClassColor = '#1d4ed8'; // blue
                      statusBgColor = 'rgba(26, 115, 232, 0.08)';
                      statusBorderColor = '#93c5fd';
                    }

                    const statusBadgeStyle = {
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.5rem',
                      backgroundColor: statusBgColor,
                      color: statusClassColor,
                      border: `1px solid ${statusBorderColor}`,
                      borderRadius: '4px',
                      display: 'inline-block',
                      fontWeight: '600'
                    };

                    return (
                      <tr key={inq.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <img 
                              src={guestAvatar} 
                              alt={guestName} 
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                            />
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>{guestName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{guestEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{propTitle}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {propLocation}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{inq.dates}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inq.nights} noći / {inq.guests} gostiju</div>
                        </td>
                        <td style={{ fontWeight: '800', color: 'var(--primary-light)', fontSize: '1rem' }}>
                          {inq.totalPrice}€
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {inq.message || '/'}
                        </td>
                        <td>
                          <span style={statusBadgeStyle}>{statusLabel}</span>
                        </td>
                        <td>
                          {inq.status === 'Poslato' ? (
                            <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                  className="btn-compare-action"
                                  style={{ 
                                    padding: '0.35rem 0.65rem', 
                                    fontSize: '0.75rem', 
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    backgroundColor: 'var(--success)',
                                    borderColor: 'var(--success)',
                                    color: '#ffffff'
                                  }}
                                  onClick={() => {
                                    if (confirm(`Da li želite da ODOBRITE rezervaciju za smeštaj "${propTitle}" za gosta ${guestName}?`)) {
                                      onUpdateInquiryStatus(inq.id, 'Odobreno');
                                    }
                                  }}
                                >
                                  Odobri
                                </button>
                                <button
                                  className="btn-cancel-inquiry"
                                  style={{ 
                                    padding: '0.35rem 0.65rem', 
                                    fontSize: '0.75rem', 
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    color: '#ffffff'
                                  }}
                                  onClick={() => {
                                    if (confirm(`Da li želite da ODBIJETE rezervaciju za smeštaj "${propTitle}" za gosta ${guestName}?`)) {
                                      onUpdateInquiryStatus(inq.id, 'Odbijeno');
                                    }
                                  }}
                                >
                                  Odbij
                                </button>
                              </div>
                              <button
                                className="btn-compare-action"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.75rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  backgroundColor: 'var(--accent)',
                                  borderColor: 'var(--accent)',
                                  color: '#ffffff',
                                  marginTop: 0,
                                  width: '100%'
                                }}
                                onClick={() => setSelectedInqForChat(inq)}
                              >
                                💬 Ćaskanje
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Akcija završena</span>
                              <button
                                className="btn-compare-action"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.75rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  backgroundColor: 'var(--accent)',
                                  borderColor: 'var(--accent)',
                                  color: '#ffffff',
                                  marginTop: '0.2rem',
                                  width: '100%'
                                }}
                                onClick={() => setSelectedInqForChat(inq)}
                              >
                                💬 Ćaskanje
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              Nema pristiglih rezervacionih upita u bazi.
            </div>
          )}
        </div>
      )}

      {/* Tab: DATABASE MANAGER (SQL CONSOLE) */}
      {panelTab === 'database' && (
        <div className="database-panel-card animate-fade" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>
                🗄️ Relaciona Baza Podataka (SQLite Console)
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Direktan pristup SQLite tabelama sa kaskadnim stranim ključevima.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn-compare-action"
                onClick={handleExportDb}
                style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff', fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                title="Preuzmite trenutno filtrirane podatke u JSON formatu"
              >
                📥 Izvoz Podataka
              </button>
              <button 
                className="btn-cancel-inquiry"
                onClick={handleResetDb}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                🔄 Resetuj Bazu
              </button>
            </div>
          </div>

          {dbResetMessage && (
            <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(26, 115, 232, 0.08)', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>
              {dbResetMessage}
            </div>
          )}

          <div className="sql-terminal-layout">
            {/* Left Sidebar: Schema navigator */}
            <div className="sql-sidebar">
              <div className="sql-sidebar-title">📂 SQLite Shema</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {Object.entries(DB_SCHEMAS).map(([tableName, columns]) => (
                  <div key={tableName} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <div 
                      className={`sql-table-item ${activeTable === tableName ? 'active' : ''}`}
                      onClick={() => handleTableChange(tableName)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span>📁 {tableName}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({columns.length})</span>
                    </div>
                    {activeTable === tableName && (
                      <div style={{ paddingLeft: '0.8rem', marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {columns.map(col => (
                          <div key={col} style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={col}>
                            🔑 {col}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Main Panel: SQL Console & Output */}
            <div className="sql-main-panel">
              {/* Quick Query buttons */}
              <div className="sql-quick-queries">
                <button className="btn-quick-query" onClick={() => { setSqlQuery('SELECT * FROM users WHERE isAdmin = 1;'); executeQuery('SELECT * FROM users WHERE isAdmin = 1;'); }}>👑 Svi admini</button>
                <button className="btn-quick-query" onClick={() => { setSqlQuery('SELECT * FROM inquiries WHERE status = \'Odobreno\';'); executeQuery('SELECT * FROM inquiries WHERE status = \'Odobreno\';'); }}>✅ Odobrene rezervacije</button>
                <button className="btn-quick-query" onClick={() => { setSqlQuery('SELECT * FROM properties ORDER BY price DESC;'); executeQuery('SELECT * FROM properties ORDER BY price DESC;'); }}>💰 Najskuplji smeštaji</button>
                <button className="btn-quick-query" onClick={() => { setSqlQuery('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10;'); executeQuery('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10;'); }}>⏳ Poslednjih 10 logova</button>
              </div>

              {/* SQLite Console Editor */}
              <div className="sql-console">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #2d2d38', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#6ee7b7', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 'bold' }}>{'sqlite> shell'}</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontFamily: 'monospace' }}>PRAGMA foreign_keys = ON;</span>
                </div>
                <textarea
                  value={sqlQuery}
                  onChange={e => setSqlQuery(e.target.value)}
                  className="sql-textarea"
                  placeholder="Napišite SQL upit ovde... (npr. SELECT * FROM users;)"
                />
              </div>

              {/* Console Action buttons */}
              <div className="sql-actions">
                <button
                  onClick={() => setSqlQuery(`SELECT * FROM ${activeTable};`)}
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Poništi
                </button>
                <button
                  className="btn-search"
                  onClick={() => executeQuery()}
                  disabled={queryLoading}
                  style={{
                    margin: 0,
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    borderRadius: 'var(--radius-sm)',
                    cursor: queryLoading ? 'not-allowed' : 'pointer',
                    opacity: queryLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  ⚡ {queryLoading ? 'Izvršavanje...' : 'Izvrši SQL Upit'}
                </button>
              </div>

              {/* SQLite Execution Results Grid */}
              <div className="query-output-panel" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-card-dark, rgba(0,0,0,0.02))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                    🖥️ Izlazni prozor rezultata ({queryResults.rows.length} redova)
                  </span>
                  {queryResults.message && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: '600' }}>
                      {queryResults.message}
                    </span>
                  )}
                </div>

                {queryResults.error && (
                  <div style={{ padding: '1rem', color: 'var(--danger)', backgroundColor: 'rgba(230, 57, 70, 0.05)', borderBottom: '1px solid rgba(230, 57, 70, 0.2)', fontSize: '0.88rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    ❌ SQLite Error: {queryResults.error}
                  </div>
                )}

                {!queryResults.error && queryResults.rows.length === 0 && !queryLoading && (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Nema vraćenih zapisa. Unesite SELECT upit ili proverite selektovanu tabelu.
                  </div>
                )}

                {queryLoading && (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--primary)', fontSize: '0.88rem', fontWeight: '600' }}>
                    Učitavanje rezultata sa SQLite baze podataka...
                  </div>
                )}

                {!queryLoading && !queryResults.error && queryResults.rows.length > 0 && (
                  <div className="inquiries-table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <table className="inquiries-table sqlite-data-table" style={{ border: 'none', margin: 0 }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-card-dark, rgba(0,0,0,0.03))' }}>
                          <th style={{ width: '85px', textAlign: 'center' }}>Akcija</th>
                          {queryResults.columns.map(col => (
                            <th key={col} style={{ fontSize: '0.82rem', padding: '0.65rem 0.8rem', textTransform: 'none', letterSpacing: 0 }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResults.rows.map((row, index) => (
                          <tr key={row.id || index} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap', padding: '0.4rem' }}>
                              <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                <button
                                  onClick={() => openEditRow(row)}
                                  title="Izmeni JSON"
                                  style={{
                                    padding: '0.25rem 0.45rem',
                                    fontSize: '0.72rem',
                                    borderRadius: '3px',
                                    backgroundColor: 'var(--primary)',
                                    color: '#ffffff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                  }}
                                >
                                  📝 JSON
                                </button>
                                <button
                                  onClick={() => deleteRow(row.id)}
                                  title="Obriši red"
                                  disabled={!row.id}
                                  style={{
                                    padding: '0.25rem 0.45rem',
                                    fontSize: '0.72rem',
                                    borderRadius: '3px',
                                    backgroundColor: 'var(--danger)',
                                    color: '#ffffff',
                                    border: 'none',
                                    cursor: row.id ? 'pointer' : 'not-allowed',
                                    opacity: row.id ? 1 : 0.5
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                            {queryResults.columns.map(col => {
                              const val = row[col];
                              let cellText = val === null ? 'NULL' : String(val);
                              const isNull = val === null;
                              return (
                                <td 
                                  key={col} 
                                  style={{ 
                                    fontSize: '0.82rem', 
                                    fontFamily: 'monospace',
                                    color: isNull ? 'var(--text-muted)' : 'var(--text-main)',
                                    fontStyle: isNull ? 'italic' : 'normal',
                                    maxWidth: '280px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={cellText}
                                >
                                  {cellText}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row JSON Editor Modal */}
      {editingRow && (
        <div className="modal-overlay" onClick={() => setEditingRow(null)}>
          <div 
            className="modal-container JSON-modal-container animate-scale" 
            style={{ maxWidth: '600px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="chat-header">
              <div className="chat-header-title">
                <span className="chat-header-name">🗃️ Uredi zapis (JSON format)</span>
                <span className="chat-header-status">Tabela: {activeTable} (ID: {editingRow.id || 'Nema'})</span>
              </div>
              <button className="btn-modal-close" onClick={() => setEditingRow(null)} style={{ position: 'static' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                ⚠️ Pažnja: Direktna modifikacija JSON-a može prouzrokovati probleme sa integritetom ako prekršite pravila tabela u bazi podataka.
              </p>
              <textarea
                value={editedJson}
                onChange={e => setEditedJson(e.target.value)}
                style={{
                  width: '100%',
                  height: '280px',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.88rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border)',
                  backgroundColor: '#1e1e1e',
                  color: '#ce9178',
                  lineHeight: '1.4',
                  resize: 'vertical'
                }}
              />
            </div>

            <div className="chat-input-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.5rem' }}>
              <button 
                onClick={() => setEditingRow(null)} 
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.45rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Otkaži
              </button>
              <button 
                className="btn-send-message" 
                onClick={saveEditedRow}
                style={{ width: 'auto', padding: '0.45rem 1.2rem', marginTop: 0 }}
              >
                Sačuvaj Izmene
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedInqForChat && (() => {
        const prop = properties.find(p => p.id === selectedInqForChat.propertyId);
        const propTitle = prop ? prop.title : 'Nepoznat objekat';
        const guestUser = users.find(u => u.id === selectedInqForChat.userId);
        const guestName = guestUser ? guestUser.fullName : `Gost ID: ${selectedInqForChat.userId}`;
        
        // Resolve chat messages
        const chatHistory = inquiries.find(i => i.id === selectedInqForChat.id)?.chat || [
          { id: 1, sender: 'client', text: selectedInqForChat.message || 'Poslat upit za smeštaj.', timestamp: selectedInqForChat.dates.split(' - ')[0] }
        ];

        const handleSendMessageClick = (e) => {
          e.preventDefault();
          if (!chatText.trim()) return;
          
          const text = chatText.trim();
          onSendChatMessage(selectedInqForChat.id, 'host', text);
          setChatText('');
          
          // Trigger automated guest reply after 1.5s
          setTimeout(() => {
            const guestReplies = [
              "Hvala Vam puno na brzom odgovoru! Da li nam možete reći u koliko sati možemo ući u apartman (check-in)?",
              "U redu, hvala vam puno na informacijama! Vidimo se uskoro.",
              "Sjajno! Da li u smeštaju imamo obezbeđen parking za automobil?",
              "Dogovoreno. Hvala još jednom."
            ];
            const randomReply = guestReplies[Math.floor(Math.random() * guestReplies.length)];
            onSendChatMessage(selectedInqForChat.id, 'client', randomReply);
          }, 1500);
        };

        return (
          <div className="modal-overlay" onClick={() => setSelectedInqForChat(null)}>
            <div 
              className="modal-container chat-modal-container animate-scale" 
              onClick={e => e.stopPropagation()}
            >
              <div className="chat-header">
                <div className="chat-header-title">
                  <span className="chat-header-name">Ćaskanje sa gostom: {guestName}</span>
                  <span className="chat-header-status">Objekat: {propTitle}</span>
                </div>
                <button className="btn-modal-close" onClick={() => setSelectedInqForChat(null)} style={{ position: 'static' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="chat-messages-body">
                {chatHistory.map((msg, idx) => (
                  <div 
                    key={msg.id || idx} 
                    className={`chat-bubble-wrapper ${msg.sender === 'host' ? 'right' : 'left'}`}
                  >
                    <div className="chat-bubble">
                      {msg.text}
                    </div>
                    <span className="chat-time">{msg.timestamp}</span>
                  </div>
                ))}
              </div>

              <form className="chat-input-footer" onSubmit={handleSendMessageClick}>
                <input 
                  type="text" 
                  className="chat-text-input"
                  placeholder="Napišite odgovor gostu..." 
                  value={chatText}
                  onChange={e => setChatText(e.target.value)}
                  required
                />
                <button type="submit" className="btn-send-message">
                  Pošalji
                </button>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
