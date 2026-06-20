import { useState, useEffect } from 'react';

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

const DEFAULT_SQL_SNIPPETS = [
  { name: '👑 Prikaži sve administratore', sql: "SELECT * FROM users WHERE isAdmin = 1;" },
  { name: '✅ Odobrene rezervacije', sql: "SELECT * FROM inquiries WHERE status = 'Odobreno';" },
  { name: '💰 Najskuplji smeštaji', sql: "SELECT * FROM properties ORDER BY price DESC;" },
  { name: '⏳ Poslednjih 10 logova', sql: "SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10;" },
  { name: '🏝️ Smeštaji na Lefkadi', sql: "SELECT * FROM properties WHERE location = 'Lefkada';" }
];

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
  // Navigation & View States
  const [panelTab, setPanelTab] = useState('dashboard'); // 'dashboard', 'add', 'manage', 'inquiries', 'users', 'logs', 'database'
  const [wizardStep, setWizardStep] = useState(1); // For property adding wizard: 1, 2, 3

  // SQL Terminal & Console States
  const [activeTable, setActiveTable] = useState('users');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users;');
  const [queryResults, setQueryResults] = useState({ rows: [], columns: [], message: '', error: '' });
  const [queryLoading, setQueryLoading] = useState(false);
  const [customSnippets, setCustomSnippets] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_custom_sql_snippets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newSnippetName, setNewSnippetName] = useState('');

  // Editing database states (RowJSON modal)
  const [editingRow, setEditingRow] = useState(null);
  const [editedJson, setEditedJson] = useState('');
  const [dbResetMessage, setDbResetMessage] = useState('');

  // Inline editing in Properties table
  const [editingPropId, setEditingPropId] = useState(null);
  const [editingField, setEditingField] = useState('');
  const [inlineValue, setInlineValue] = useState('');

  // Edit complete property modal
  const [editingProperty, setEditingProperty] = useState(null);

  // Stats / Dashboard details
  const [dbLatency, setDbLatency] = useState(null);
  const [adminNote, setAdminNote] = useState(() => {
    return localStorage.getItem('aura_admin_notepad') || 'Dobrodošli u administratorski panel GrčkaAura. Ovde možete beležiti brze zadatke i informacije...';
  });

  // Seasonal Multiplier state
  const [priceMultiplierPct, setPriceMultiplierPct] = useState('10');

  // Search filter for logs
  const [logSearch, setLogSearch] = useState('');

  // Chat & Comments logic
  const [selectedInqForChat, setSelectedInqForChat] = useState(null);
  const [chatText, setChatText] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_inquiry_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Form states for adding property
  const [formData, setFormData] = useState({
    title: '',
    location: destinations[0] || 'Lefkada',
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

  // Measure Latency Simulator on page load
  useEffect(() => {
    const start = performance.now();
    fetch(`${API_URL}/api/admin/query`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ query: 'SELECT 1;' })
    })
      .then(() => {
        const duration = Math.round(performance.now() - start);
        setDbLatency(duration);
      })
      .catch(() => {
        setDbLatency(45); // Fake placeholder on fail/offline fallback
      });
  }, []);

  // Save notepad
  const handleSaveNotepad = (val) => {
    setAdminNote(val);
    localStorage.setItem('aura_admin_notepad', val);
  };

  // Run SQL console query
  const executeQuery = async (queryToRun = sqlQuery) => {
    setQueryLoading(true);
    setQueryResults({ rows: [], columns: [], message: '', error: '' });
    const start = performance.now();
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
      const duration = Math.round(performance.now() - start);
      setDbLatency(duration);

      if (!response.ok) {
        setQueryResults({ rows: [], columns: [], message: '', error: data.error || 'Greška pri izvršavanju upita.' });
      } else {
        setQueryResults({
          rows: data.rows || [],
          columns: data.columns || [],
          message: data.message || `Upit uspešno izvršen za ${duration}ms.`,
          error: ''
        });
      }
    } catch (err) {
      console.error(err);
      setQueryResults({ rows: [], columns: [], message: '', error: 'Greška u povezivanju sa serverom. Proverite da li je backend pokrenut.' });
    } finally {
      setQueryLoading(false);
    }
  };

  useEffect(() => {
    if (panelTab === 'database') {
      const currentQuery = `SELECT * FROM ${activeTable};`;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      executeQuery(currentQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelTab, activeTable]);

  const handleTableChange = (tableName) => {
    setActiveTable(tableName);
    const q = `SELECT * FROM ${tableName};`;
    setSqlQuery(q);
  };

  const handleSaveSnippet = () => {
    if (!newSnippetName.trim() || !sqlQuery.trim()) return;
    const newItem = { name: `⭐ ${newSnippetName.trim()}`, sql: sqlQuery.trim() };
    const updated = [...customSnippets, newItem];
    setCustomSnippets(updated);
    localStorage.setItem('aura_custom_sql_snippets', JSON.stringify(updated));
    setNewSnippetName('');
  };

  const handleDeleteSnippet = (index, e) => {
    e.stopPropagation();
    const updated = customSnippets.filter((_, i) => i !== index);
    setCustomSnippets(updated);
    localStorage.setItem('aura_custom_sql_snippets', JSON.stringify(updated));
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
        if (panelTab === 'database') handleTableChange(activeTable);
      } else {
        setDbResetMessage('Greška pri resetovanju: ' + data.message);
      }
    } catch (err) {
      console.error(err);
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

  const handleExportCsv = () => {
    if (!queryResults.rows || queryResults.rows.length === 0) {
      alert('Nema podataka za izvoz. Prvo pokrenite upit.');
      return;
    }
    const headers = queryResults.columns;
    const csvRows = [headers.join(',')];
    for (const row of queryResults.rows) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = String(val === null ? '' : val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `aura_export_${activeTable}.csv`);
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
        alert('Zapis je uspešno izmenjen u bazi podataka!');
        setEditingRow(null);
        if (onRefreshDatabase) await onRefreshDatabase();
        executeQuery(`SELECT * FROM ${activeTable};`);
      }
    } catch (err) {
      console.error(err);
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
      console.error(err);
      alert('Greška pri povezivanju sa serverom.');
    }
  };

  // Seasonal Multiplier Trigger
  const handleApplySeasonalMultiplier = async (percentStr) => {
    const val = parseFloat(percentStr);
    if (isNaN(val) || val === 0) {
      alert('Molimo unesite validan procenat (npr. 15 ili -10).');
      return;
    }
    const factor = 1 + (val / 100);
    const query = `UPDATE properties SET price = ROUND(price * ${factor}, 0);`;

    if (!confirm(`Da li ste sigurni da želite da promenite cene svih smeštaja za ${val > 0 ? '+' : ''}${val}% globalno?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        alert(`Sve cene su promenjene za ${val}%!`);
        if (onRefreshDatabase) await onRefreshDatabase();
      } else {
        const data = await response.json();
        alert('Greška pri izmeni cena: ' + (data.error || 'Nepoznata greška'));
      }
    } catch {
      alert('Greška pri konekciji sa serverom.');
    }
  };

  // Inline editing handler
  const triggerInlineSave = async (propertyId, field, val) => {
    let finalValue = parseFloat(val);
    if (isNaN(finalValue) || finalValue < 0) {
      alert('Unesite pozitivan broj.');
      return;
    }
    const query = `UPDATE properties SET ${field} = ${finalValue} WHERE id = ${propertyId};`;
    try {
      const response = await fetch(`${API_URL}/api/admin/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        if (onRefreshDatabase) await onRefreshDatabase();
      } else {
        alert('Greška pri izmeni baze.');
      }
    } catch {
      alert('Konekcija neuspešna.');
    } finally {
      setEditingPropId(null);
      setEditingField('');
    }
  };

  // Direct amenity quick toggle
  const toggleAmenityInline = async (propertyId, amenityKey, currentAmenities) => {
    const updated = { ...currentAmenities, [amenityKey]: !currentAmenities[amenityKey] };
    const jsonStr = JSON.stringify(updated).replace(/'/g, "''");
    const query = `UPDATE properties SET amenities = '${jsonStr}' WHERE id = ${propertyId};`;
    try {
      const response = await fetch(`${API_URL}/api/admin/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        if (onRefreshDatabase) await onRefreshDatabase();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Custom Full Edit Modal Save
  const handleSaveFullPropertyEdit = async (e) => {
    e.preventDefault();
    if (!editingProperty.title.trim()) {
      alert('Naziv je obavezan.');
      return;
    }
    const titleEsc = editingProperty.title.replace(/'/g, "''");
    const descEsc = editingProperty.description.replace(/'/g, "''");
    const amenitiesStr = JSON.stringify(editingProperty.amenities).replace(/'/g, "''");
    
    const query = `UPDATE properties SET 
      title = '${titleEsc}', 
      location = '${editingProperty.location}', 
      type = '${editingProperty.type}', 
      price = ${parseFloat(editingProperty.price) || 0}, 
      distanceToBeach = ${parseInt(editingProperty.distanceToBeach, 10) || 0}, 
      guests = ${parseInt(editingProperty.guests, 10) || 0}, 
      bedrooms = ${parseInt(editingProperty.bedrooms, 10) || 0}, 
      description = '${descEsc}', 
      image = '${editingProperty.image}', 
      amenities = '${amenitiesStr}'
      WHERE id = ${editingProperty.id};`;

    try {
      const response = await fetch(`${API_URL}/api/admin/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        alert('Smeštaj uspešno ažuriran!');
        setEditingProperty(null);
        if (onRefreshDatabase) await onRefreshDatabase();
      } else {
        alert('Greška pri čuvanju izmena.');
      }
    } catch {
      alert('Greška u konekciji.');
    }
  };

  // State for adding new rooms
  const [newRoomData, setNewRoomData] = useState({
    title: '',
    price: 50,
    guests: 2,
    bedrooms: 1,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    description: ''
  });

  const handleAddRoom = async () => {
    if (!newRoomData.title.trim()) {
      alert('Unesite naziv sobe.');
      return;
    }
    const titleEsc = newRoomData.title.replace(/'/g, "''");
    const descEsc = newRoomData.description.replace(/'/g, "''");
    const query = `INSERT INTO rooms (propertyId, title, price, guests, bedrooms, image, description)
      VALUES (${editingProperty.id}, '${titleEsc}', ${parseFloat(newRoomData.price) || 0}, ${parseInt(newRoomData.guests, 10) || 1}, ${parseInt(newRoomData.bedrooms, 10) || 1}, '${newRoomData.image}', '${descEsc}');`;
      
    try {
      const response = await fetch(`${API_URL}/api/admin/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        alert('Soba uspešno dodata!');
        if (onRefreshDatabase) await onRefreshDatabase();
        
        // Update local editingProperty modal state to show new room immediately
        setEditingProperty(prev => ({
          ...prev,
          rooms: [
            ...(prev.rooms || []),
            {
              id: Date.now(), // temporary local id
              propertyId: prev.id,
              title: newRoomData.title,
              price: parseFloat(newRoomData.price) || 0,
              guests: parseInt(newRoomData.guests, 10) || 1,
              bedrooms: parseInt(newRoomData.bedrooms, 10) || 1,
              image: newRoomData.image,
              description: newRoomData.description
            }
          ]
        }));
        
        // Reset room form
        setNewRoomData({
          title: '',
          price: 50,
          guests: 2,
          bedrooms: 1,
          image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
          description: ''
        });
      } else {
        alert('Greška pri dodavanju sobe.');
      }
    } catch (e) {
      console.error(e);
      alert('Greška u konekciji.');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu sobu?')) return;
    const query = `DELETE FROM rooms WHERE id = ${roomId};`;
    try {
      const response = await fetch(`${API_URL}/api/admin/query`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query })
      });
      if (response.ok) {
        alert('Soba uspešno obrisana!');
        if (onRefreshDatabase) await onRefreshDatabase();
        setEditingProperty(prev => ({
          ...prev,
          rooms: (prev.rooms || []).filter(r => r.id !== roomId)
        }));
      } else {
        alert('Greška pri brisanju sobe.');
      }
    } catch (e) {
      console.error(e);
      alert('Greška u konekciji.');
    }
  };

  // Inquiry overlap checker
  const checkDateOverlap = (inq) => {
    if (inq.status !== 'Poslato') return false; 
    const otherApproved = inquiries.filter(i => 
      i.id !== inq.id && 
      i.propertyId === inq.propertyId && 
      i.status === 'Odobreno'
    );
    if (otherApproved.length === 0) return false;
    
    const startCur = new Date(inq.checkIn);
    const endCur = new Date(inq.checkOut);

    for (const app of otherApproved) {
      const startApp = new Date(app.checkIn);
      const endApp = new Date(app.checkOut);
      if (startCur < endApp && endCur > startApp) {
        return true;
      }
    }
    return false;
  };

  // Inquiry Notes management
  const handleSaveInquiryNote = (inquiryId, noteText) => {
    const updated = { ...inquiryNotes, [inquiryId]: noteText };
    setInquiryNotes(updated);
    localStorage.setItem('aura_inquiry_notes', JSON.stringify(updated));
    alert('Interna beleška sačuvana!');
  };

  // Form helpers
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

  // Description Quick pre-fill
  const loadDescriptionTemplate = (templateType) => {
    const templates = {
      villa: "Luksuzna i prostrana kamena vila sa spektakularnim pogledom na more. Poseduje privatni prelivni bazen, uređen vrt sa mediteranskim rastinjem i spoljni roštilj. Enterijer je uređen u elegantnom, modernom stilu. Nalazi se u mirnom okruženju, na samo nekoliko minuta vožnje od najlepših plaža u regiji. Idealna za savršen i opuštajući odmor sa porodicom ili većim društvom.",
      apartment: "Moderan i svetao apartman, idealno pozicioniran na samo par koraka od peščane obale. Sadrži komfornu spavaću sobu, potpuno opremljenu čajnu kuhinju i privatan prostrani balkon sa garniturom za sedenje i pogledom na more. Besplatan parking je obezbeđen u dvorištu objekta. U neposrednoj blizini se nalaze restorani, prodavnice i kafići."
    };
    setFormData(prev => ({ ...prev, description: templates[templateType] || '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

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

    setTimeout(() => {
      setSubmitted(false);
      setWizardStep(1);
      setFormData({
        title: '',
        location: destinations[0] || 'Lefkada',
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

  // Filter logs
  const filteredLogs = activityLogs.filter(log => 
    log.action.toLowerCase().includes(logSearch.toLowerCase()) || 
    log.user.toLowerCase().includes(logSearch.toLowerCase())
  );

  // Quick statistics calculation
  const totalProperties = properties.length;
  const totalInquiries = inquiries.length;
  const activeBookings = inquiries.filter(i => i.status === 'Odobreno').length;
  const totalBookingValue = inquiries.reduce((sum, i) => sum + i.totalPrice, 0);
  const averagePrice = Math.round(properties.reduce((sum, p) => sum + p.price, 0) / (totalProperties || 1));

  // Regional revenue stats
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

  // Inquiries percentage rings
  const totalInqs = inquiries.length || 1;
  const approvedCount = inquiries.filter(i => i.status === 'Odobreno').length;
  const pendingCount = inquiries.filter(i => i.status === 'Poslato').length;
  const rejectedCount = inquiries.filter(i => i.status === 'Odbijeno').length;

  const approvedPct = Math.round((approvedCount / totalInqs) * 100);
  const pendingPct = Math.round((pendingCount / totalInqs) * 100);
  const rejectedPct = Math.round((rejectedCount / totalInqs) * 100);

  // Offer structure counts
  const countByType = propertyTypes.reduce((acc, type) => {
    acc[type] = properties.filter(p => p.type.toLowerCase() === type.toLowerCase()).length;
    return acc;
  }, {});
  const totalProps = properties.length || 1;

  // Monthly Revenue data processing for SVG chart
  const getMonthlyRevenueData = () => {
    const activeMonths = [
      { name: 'Maj', val: 5 },
      { name: 'Jun', val: 6 },
      { name: 'Jul', val: 7 },
      { name: 'Avg', val: 8 },
      { name: 'Sep', val: 9 },
      { name: 'Okt', val: 10 }
    ];
    return activeMonths.map(m => {
      const revenue = inquiries
        .filter(inq => inq.status === 'Odobreno' && inq.checkIn)
        .filter(inq => {
          const parts = inq.checkIn.split('-');
          return parts.length >= 2 && parseInt(parts[1], 10) === m.val;
        })
        .reduce((sum, inq) => sum + inq.totalPrice, 0);

      const count = inquiries
        .filter(inq => inq.checkIn)
        .filter(inq => {
          const parts = inq.checkIn.split('-');
          return parts.length >= 2 && parseInt(parts[1], 10) === m.val;
        }).length;

      return { month: m.name, revenue, count };
    });
  };

  const monthlyData = getMonthlyRevenueData();
  const maxMonthRevenue = Math.max(...monthlyData.map(d => d.revenue), 100);
  const chartPadding = 30;
  const chartWidth = 720;
  const chartHeight = 160;

  // Compute SVG coords for monthly chart
  const points = monthlyData.map((d, index) => {
    const x = chartPadding + (index * (chartWidth - chartPadding * 2)) / (monthlyData.length - 1);
    const y = chartHeight - chartPadding - (d.revenue / maxMonthRevenue) * (chartHeight - chartPadding * 2);
    return { x, y, data: d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - chartPadding} L ${points[0].x} ${chartHeight - chartPadding} Z` 
    : '';

  // Guard Clause for Non-Admin
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="host-panel-container animate-fade" style={{ maxWidth: '800px', margin: '3rem auto' }}>
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
    <div className="admin-cms-layout animate-fade">
      {/* ===================================================================
          1. GLASSMORPHIC SIDEBAR NAVIGATION
          =================================================================== */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-branding">
          <div className="admin-sidebar-title">
            🏝️ <span>Grčka</span>Aura
          </div>
          <div className="admin-sidebar-subtitle">Control Center v2.2</div>
        </div>

        <div className="admin-profile-widget">
          <div className="admin-avatar-wrapper">
            <img 
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName || 'Admin')}&background=00b4d8&color=fff`} 
              alt="Admin avatar" 
              className="admin-avatar-img" 
            />
            <span className="pulse-status" />
          </div>
          <div className="admin-profile-info">
            <span className="admin-profile-name">{currentUser.fullName}</span>
            <span className="admin-profile-role">Vlasnik</span>
          </div>
        </div>

        <ul className="admin-menu-list">
          <li>
            <button 
              className={`admin-menu-item ${panelTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setPanelTab('dashboard')}
            >
              <div className="admin-menu-item-left">📈 Dashboard</div>
            </button>
          </li>
          <li>
            <button 
              className={`admin-menu-item ${panelTab === 'add' ? 'active' : ''}`}
              onClick={() => { setPanelTab('add'); setWizardStep(1); }}
            >
              <div className="admin-menu-item-left">➕ Dodaj Smeštaj</div>
            </button>
          </li>
          <li>
            <button 
              className={`admin-menu-item ${panelTab === 'manage' ? 'active' : ''}`}
              onClick={() => setPanelTab('manage')}
            >
              <div className="admin-menu-item-left">🏡 Objekti</div>
              <span className="admin-menu-badge">{totalProperties}</span>
            </button>
          </li>
          <li>
            <button 
              className={`admin-menu-item ${panelTab === 'inquiries' ? 'active' : ''}`}
              onClick={() => setPanelTab('inquiries')}
            >
              <div className="admin-menu-item-left">📩 Rezervacije</div>
              <span className="admin-menu-badge" style={{ backgroundColor: pendingCount > 0 ? 'var(--accent)' : 'var(--border)' }}>
                {inquiries.length}
              </span>
            </button>
          </li>
          <li>
            <button 
              className={`admin-menu-item ${panelTab === 'users' ? 'active' : ''}`}
              onClick={() => setPanelTab('users')}
            >
              <div className="admin-menu-item-left">👥 Korisnici</div>
              <span className="admin-menu-badge">{users.length}</span>
            </button>
          </li>
          <li>
            <button 
              className={`admin-menu-item ${panelTab === 'logs' ? 'active' : ''}`}
              onClick={() => setPanelTab('logs')}
            >
              <div className="admin-menu-item-left">📋 Aktivnosti</div>
            </button>
          </li>
        </ul>

        <div className="admin-sidebar-status-box">
          <div className="admin-status-indicator success">Sistem Baze Podataka: Aktivan</div>
          <div className="admin-status-indicator success">Skladište Slika: Povezano</div>
        </div>
      </aside>

      {/* ===================================================================
          2. MAIN CONTENT AREA
          =================================================================== */}
      <main className="admin-main-content" style={{ flex: 1, minWidth: 0 }}>
        {/* ==========================================
            TAB: DASHBOARD OVERVIEW
            ========================================== */}
        {panelTab === 'dashboard' && (
          <div className="dashboard-grid-layout">
            {/* Quick Metrics Grid */}
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
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <span className="stat-value">{users.length}</span>
                  <span className="stat-label">Registrovana Korisnika</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎛️</div>
                <div className="stat-info">
                  <span className="stat-value">{averagePrice}€</span>
                  <span className="stat-label">Prosečna Cena Noćenja</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Trend Chart Widget */}
            <div className="revenue-trend-widget animate-fade">
              <div className="chart-header-row">
                <div className="chart-info-title">📊 Prihodi od Odobrenih Rezervacija po Mesecima</div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-color income" />
                    Prihodi (€)
                  </div>
                </div>
              </div>

              <div className="svg-chart-container">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const y = chartPadding + ratio * (chartHeight - chartPadding * 2);
                    const val = Math.round(maxMonthRevenue * (1 - ratio));
                    return (
                      <g key={idx}>
                        <line x1={chartPadding} y1={y} x2={chartWidth - chartPadding} y2={y} className="chart-grid-line" />
                        <text x={chartPadding - 5} y={y + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)" fontWeight="600">
                          {val}€
                        </text>
                      </g>
                    );
                  })}

                  {/* Month X Labels */}
                  {points.map((p, idx) => (
                    <text key={idx} x={p.x} y={chartHeight - 8} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontWeight="bold">
                      {p.data.month}
                    </text>
                  ))}

                  {/* Area fill */}
                  {points.length > 0 && (
                    <path d={areaPath} fill="url(#chart-gradient)" className="chart-line-gradient" />
                  )}

                  {/* Trend line */}
                  {points.length > 0 && (
                    <path d={linePath} className="chart-line income" />
                  )}

                  {/* Data Points circles */}
                  {points.map((p, idx) => (
                    <circle 
                      key={idx} 
                      cx={p.x} 
                      cy={p.y} 
                      r="4.5" 
                      className="chart-point income"
                      title={`${p.data.month}: ${p.data.revenue}€ (${p.data.count} upita)`}
                    />
                  ))}

                  {/* SVG Gradients definition */}
                  <defs>
                    <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--success)" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="var(--success)" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Analytics Grid */}
            <div className="dashboard-analytics-grid" style={{ marginTop: 0 }}>
              {/* Card 1: Revenue by Destination */}
              <div className="analytics-card">
                <div className="analytics-card-title">🌎 Finansijski Promet po Regijama</div>
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

              {/* Card 2: Reservation Success Radial Chart */}
              <div className="analytics-card">
                <div className="analytics-card-title">🎯 Uspešnost Realizacije Rezervacija</div>
                <div className="radial-charts-container">
                  {/* Approved Ring */}
                  <div className="radial-chart-item">
                    <svg width="68" height="68" viewBox="0 0 36 36">
                      <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3.5" />
                      <path className="ring-fill" strokeDasharray={`${approvedPct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--success)" strokeWidth="3.5" strokeLinecap="round" />
                      <text x="18" y="20.5" className="ring-text" textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--text-main)">{approvedPct}%</text>
                    </svg>
                    <span className="radial-chart-label">Odobreno ({approvedCount})</span>
                  </div>

                  {/* Pending Ring */}
                  <div className="radial-chart-item">
                    <svg width="68" height="68" viewBox="0 0 36 36">
                      <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3.5" />
                      <path className="ring-fill" strokeDasharray={`${pendingPct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" />
                      <text x="18" y="20.5" className="ring-text" textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--text-main)">{pendingPct}%</text>
                    </svg>
                    <span className="radial-chart-label">Na čekanju ({pendingCount})</span>
                  </div>

                  {/* Rejected Ring */}
                  <div className="radial-chart-item">
                    <svg width="68" height="68" viewBox="0 0 36 36">
                      <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3.5" />
                      <path className="ring-fill" strokeDasharray={`${rejectedPct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--danger)" strokeWidth="3.5" strokeLinecap="round" />
                      <text x="18" y="20.5" className="ring-text" textAnchor="middle" fontSize="8" fontWeight="bold" fill="var(--text-main)">{rejectedPct}%</text>
                    </svg>
                    <span className="radial-chart-label">Odbijeno ({rejectedCount})</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Property Type Distribution */}
              <div className="analytics-card">
                <div className="analytics-card-title">🏡 Struktura Smeštaja po Tipu</div>
                <div className="type-chart-container">
                  {propertyTypes.map(type => {
                    const count = countByType[type] || 0;
                    const pct = Math.round((count / totalProps) * 100);
                    return (
                      <div key={type} className="type-chart-item">
                        <div className="type-chart-pillar-wrapper" title={`${type}: ${count} objekata (${pct}%)`}>
                          <div className={`type-chart-pillar-fill ${type.toLowerCase()}`} style={{ height: `${pct || 5}%` }} />
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

            {/* Tools, Seasonal Pricing, and Notepad */}
            <div className="dashboard-tools-row">
              {/* Seasonal Adjuster */}
              <div className="tool-widget-card">
                <h3 className="tool-widget-title">⚙️ Sezonska Korekcija Cena (Global)</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Ažurirajte cene svih smeštaja u bazi odjednom. Unesite procenat povećanja (pozitivan broj) ili smanjenja (negativan broj).
                </p>
                <div className="multiplier-control-panel">
                  <div className="multiplier-row">
                    <div className="multiplier-input-wrapper">
                      <input 
                        type="number" 
                        value={priceMultiplierPct} 
                        onChange={e => setPriceMultiplierPct(e.target.value)} 
                        placeholder="10" 
                      />
                      <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>%</span>
                    </div>
                    <div className="multiplier-btn-grid">
                      <button 
                        type="button"
                        onClick={() => handleApplySeasonalMultiplier(priceMultiplierPct)}
                        className="btn-multiplier-action increase"
                      >
                        📈 Povećaj cene
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleApplySeasonalMultiplier(`-${priceMultiplierPct}`)}
                        className="btn-multiplier-action decrease"
                      >
                        📉 Smanji cene
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                    * Napomena: Sve cene će biti zaokružene na najbliži ceo broj.
                  </div>
                </div>
              </div>

              {/* Notepad */}
              <div className="tool-widget-card">
                <h3 className="tool-widget-title">📝 Zabeleške Administratora</h3>
                <textarea 
                  value={adminNote}
                  onChange={e => handleSaveNotepad(e.target.value)}
                  style={{
                    width: '100%',
                    height: '110px',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Ovde zapišite podsetnike..."
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', float: 'right', marginTop: '0.2rem' }}>
                  Autosave aktiviran (lokalno u pretraživaču)
                </span>
              </div>
            </div>

            {/* Quick Activity Preview */}
            <div className="inquiries-panel-card animate-fade" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '0.6rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  ⚡ Poslednje sistemske aktivnosti (Audit Log Preview)
                </h3>
                <button 
                  onClick={() => setPanelTab('logs')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Prikaži sve logove →
                </button>
              </div>

              <div className="premium-timeline">
                {activityLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="timeline-card" style={{ padding: '0.6rem 0' }}>
                    <div className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>{log.user}</span>
                      <span style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#1d4ed8', backgroundColor: 'rgba(26,115,232,0.08)' }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: ADD PROPERTY (MULTI-STEP WIZARD)
            ========================================== */}
        {panelTab === 'add' && (
          <div className="wizard-outer-wrapper">
            {/* Steps indicator */}
            <div className="wizard-steps-indicator">
              <div className={`wizard-step-node ${wizardStep === 1 ? 'active' : ''} ${wizardStep > 1 ? 'completed' : ''}`}>
                <span className="step-number-circle">1</span> Osnovni Podaci
              </div>
              <div className={`wizard-step-node ${wizardStep === 2 ? 'active' : ''} ${wizardStep > 2 ? 'completed' : ''}`}>
                <span className="step-number-circle">2</span> Kapacitet & Pogodnosti
              </div>
              <div className={`wizard-step-node ${wizardStep === 3 ? 'active' : ''} ${wizardStep > 3 ? 'completed' : ''}`}>
                <span className="step-number-circle">3</span> Opis & Slike
              </div>
              <div className="wizard-line-connector" />
            </div>

            {submitted ? (
              <div className="success-message animate-scale" style={{ padding: '3.5rem', fontSize: '1.2rem', textAlign: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.2rem', color: 'var(--success)' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p style={{ fontWeight: '800' }}>Smeštaj je uspešno objavljen!</p>
                <p style={{ fontWeight: 'normal', fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                  Nova nekretnina je ubačena u bazu i odmah je vidljiva posetiocima portala GrčkaAura.
                </p>
              </div>
            ) : (
              <div className="wizard-container animate-fade">
                {/* Form on left */}
                <div className="calc-form-card" style={{ padding: '1.8rem' }}>
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(230, 57, 70, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', fontWeight: '600', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {error}
                      </div>
                    )}

                    {/* STEP 1: Basic Info */}
                    {wizardStep === 1 && (
                      <div className="wizard-step-form-content animate-fade">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.2rem', color: 'var(--primary)' }}>
                          Korak 1: Osnovni detalji smeštaja
                        </h3>
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

                        <div className="host-form-grid">
                          <div className="form-field">
                            <label htmlFor="location">Regija / Lokacija *</label>
                            <input 
                              list="host-destinations-list"
                              id="location" 
                              name="location" 
                              value={formData.location} 
                              onChange={handleChange}
                              placeholder="Izaberite ili upišite novu lokaciju..."
                              required
                            />
                            <datalist id="host-destinations-list">
                              {destinations.map(dest => (
                                <option key={dest} value={dest} />
                              ))}
                            </datalist>
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

                        <div className="host-form-grid">
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
                      </div>
                    )}

                    {/* STEP 2: Capacity & Amenities */}
                    {wizardStep === 2 && (
                      <div className="wizard-step-form-content animate-fade">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.2rem', color: 'var(--primary)' }}>
                          Korak 2: Kapacitet i pogodnosti
                        </h3>
                        <div className="host-form-grid">
                          <div className="form-field">
                            <label>Maksimalan broj gostiju</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                              <button 
                                type="button" 
                                className="btn-search" 
                                style={{ width: '40px', padding: '0.4rem' }}
                                onClick={() => setFormData(p => ({ ...p, guests: Math.max(1, p.guests - 1) }))}
                              >
                                -
                              </button>
                              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>
                                {formData.guests}
                              </span>
                              <button 
                                type="button" 
                                className="btn-search" 
                                style={{ width: '40px', padding: '0.4rem' }}
                                onClick={() => setFormData(p => ({ ...p, guests: p.guests + 1 }))}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="form-field">
                            <label>Spavaćih soba</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                              <button 
                                type="button" 
                                className="btn-search" 
                                style={{ width: '40px', padding: '0.4rem' }}
                                onClick={() => setFormData(p => ({ ...p, bedrooms: Math.max(1, p.bedrooms - 1) }))}
                              >
                                -
                              </button>
                              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>
                                {formData.bedrooms}
                              </span>
                              <button 
                                type="button" 
                                className="btn-search" 
                                style={{ width: '40px', padding: '0.4rem' }}
                                onClick={() => setFormData(p => ({ ...p, bedrooms: p.bedrooms + 1 }))}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="form-field" style={{ marginTop: '1.5rem' }}>
                          <label style={{ fontWeight: '700', marginBottom: '0.6rem', display: 'block' }}>Pogodnosti i oprema smeštaja</label>
                          <div className="checkbox-grid-host">
                            <label className="checkbox-container">
                              <input 
                                type="checkbox" 
                                checked={formData.amenities.wifi} 
                                onChange={() => toggleAmenity('wifi')}
                              />
                              <span className="checkbox-checkmark"></span>
                              ⚡ Besplatan Wi-Fi
                            </label>
                            <label className="checkbox-container">
                              <input 
                                type="checkbox" 
                                checked={formData.amenities.pool} 
                                onChange={() => toggleAmenity('pool')}
                              />
                              <span className="checkbox-checkmark"></span>
                              🏊 Privatni Bazen
                            </label>
                            <label className="checkbox-container">
                              <input 
                                type="checkbox" 
                                checked={formData.amenities.beachfront} 
                                onChange={() => toggleAmenity('beachfront')}
                              />
                              <span className="checkbox-checkmark"></span>
                              🏖️ Pored same plaže
                            </label>
                            <label className="checkbox-container">
                              <input 
                                type="checkbox" 
                                checked={formData.amenities.parking} 
                                onChange={() => toggleAmenity('parking')}
                              />
                              <span className="checkbox-checkmark"></span>
                              🚗 Privatni parking
                            </label>
                            <label className="checkbox-container">
                              <input 
                                type="checkbox" 
                                checked={formData.amenities.airConditioning} 
                                onChange={() => toggleAmenity('airConditioning')}
                              />
                              <span className="checkbox-checkmark"></span>
                              ❄️ Klima uređaj
                            </label>
                            <label className="checkbox-container">
                              <input 
                                type="checkbox" 
                                checked={formData.amenities.pets} 
                                onChange={() => toggleAmenity('pets')}
                              />
                              <span className="checkbox-checkmark"></span>
                              🐾 Dozvoljeni ljubimci
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Description & Images */}
                    {wizardStep === 3 && (
                      <div className="wizard-step-form-content animate-fade">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.2rem', color: 'var(--primary)' }}>
                          Korak 3: Detaljan opis i fotografije
                        </h3>
                        
                        {/* Text templates helper */}
                        <div className="form-field">
                          <label htmlFor="description">Opis Smeštaja (minimum 20 karaktera) *</label>
                          <div className="quick-description-presets">
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Preuzmi šablon:</span>
                            <button type="button" className="btn-desc-preset" onClick={() => loadDescriptionTemplate('villa')}>🏡 Šablon za Vilu</button>
                            <button type="button" className="btn-desc-preset" onClick={() => loadDescriptionTemplate('apartment')}>🏢 Šablon za Apartman</button>
                          </div>
                          <textarea 
                            id="description" 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange}
                            placeholder="Unesite privlačan i detaljan opis lokacije, soba i dodatnih pogodnosti..." 
                            rows="6"
                            style={{ resize: 'vertical', marginTop: '0.4rem' }}
                            required 
                          />
                          <div className={`char-counter-label ${formData.description.length >= 20 ? 'valid' : 'invalid'}`}>
                            <span>* Preporučeno za bolji SEO: 100-300 karaktera.</span>
                            <span>Karaktera: {formData.description.length} / 20 min</span>
                          </div>
                        </div>

                        {/* Presets and Upload */}
                        <div className="form-field" style={{ marginTop: '1.2rem' }}>
                          <label style={{ fontWeight: '700' }}>Izaberite neku od prekonfigurisanih fotografija</label>
                          <div className="preset-images-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.4rem' }}>
                            {PRESET_IMAGES.map(img => (
                              <div 
                                key={img.id} 
                                className={`preset-image-card ${formData.image === img.url ? 'active' : ''}`}
                                onClick={() => handlePresetSelect(img.url)}
                                style={{
                                  position: 'relative',
                                  cursor: 'pointer',
                                  borderRadius: 'var(--radius-sm)',
                                  border: formData.image === img.url ? '2px solid var(--accent)' : '1px solid var(--border)',
                                  overflow: 'hidden'
                                }}
                              >
                                <img src={img.url} alt={img.label} style={{ width: '100%', height: '50px', objectFit: 'cover' }} />
                                <div style={{ fontSize: '0.62rem', padding: '0.2rem', textAlign: 'center', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 'bold' }}>
                                  {img.label.split(' ')[0]}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* File Upload Zone */}
                        <div className="form-field" style={{ marginTop: '1rem' }}>
                          <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '700' }}>Ili otpremite sopstvenu sliku objekta</label>
                          <div className="file-upload-zone">
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
                                  console.error(err);
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
                        </div>
                      </div>
                    )}

                    {/* Wizard controls footer */}
                    <div className="wizard-navigation-buttons">
                      {wizardStep > 1 ? (
                        <button 
                          type="button" 
                          className="btn-wizard-prev" 
                          onClick={() => setWizardStep(s => s - 1)}
                        >
                          Nazad
                        </button>
                      ) : <div />}

                      {wizardStep < 3 ? (
                        <button 
                          type="button" 
                          className="btn-wizard-next"
                          onClick={() => {
                            if (wizardStep === 1) {
                              if (!formData.title.trim()) {
                                alert('Molimo unesite naziv smeštaja.');
                                return;
                              }
                              if (formData.price <= 0) {
                                alert('Molimo unesite ispravnu cenu.');
                                return;
                              }
                            }
                            setWizardStep(s => s + 1);
                          }}
                        >
                          Sledeći korak →
                        </button>
                      ) : (
                        <button type="submit" className="btn-search" style={{ margin: 0, width: 'auto', paddingInline: '1.8rem' }}>
                          🚀 Objavi Smeštaj
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Live Preview Panel on Right */}
                <div className="live-preview-panel animate-scale">
                  <div className="live-preview-title">
                    <span /> Prikaz uživo (Live Preview)
                  </div>
                  
                  {/* Property Card Mock */}
                  <div className="property-card" style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'default' }}>
                    <div className="property-image-wrapper">
                      <img src={formData.image} alt="Live preview card" />
                      <span className="property-type-tag">{formData.type}</span>
                    </div>
                    <div className="property-content">
                      <div className="property-meta-row">
                        <span className="property-location-tag">📍 {formData.location}</span>
                        <span className="property-rating">★ 5.0 (Novo)</span>
                      </div>
                      <h3 className="property-title" style={{ fontSize: '1rem', margin: '0.5rem 0' }}>
                        {formData.title || 'Naziv Vašeg Smeštaja'}
                      </h3>
                      <p className="property-distance" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        🌊 {formData.distanceToBeach}m od plaže
                      </p>
                      <div className="property-capacity" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        👥 Do {formData.guests} osoba • 🛏️ {formData.bedrooms} sobe
                      </div>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                        {formData.amenities.wifi && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '3px' }}>⚡ WiFi</span>}
                        {formData.amenities.pool && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '3px' }}>🏊 Bazen</span>}
                        {formData.amenities.beachfront && <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '3px' }}>🏖️ Plaža</span>}
                      </div>
                      <div className="property-footer" style={{ border: 'none', paddingTop: 0 }}>
                        <div className="property-price">
                          <span className="price-amount">{formData.price}€</span>
                          <span className="price-unit"> / noć</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB: MANAGE PROPERTIES (LISTINGS TABLE)
            ========================================== */}
        {panelTab === 'manage' && (
          <div className="inquiries-panel-card animate-fade" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>
                Upravljanje Smeštajnim Jedinicama
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                💡 Savet: Dvokliknite na cenu ili udaljenost od plaže za direktnu izmenu u tabeli.
              </p>
            </div>

            {properties.length > 0 ? (
              <div className="inquiries-table-wrapper">
                <table className="inquiries-table">
                  <thead>
                    <tr>
                      <th>Fotografija</th>
                      <th>Naziv smeštaja</th>
                      <th>Lokacija</th>
                      <th>Tip</th>
                      <th>Cena / noć</th>
                      <th>Plaža (m)</th>
                      <th>Brze pogodnosti</th>
                      <th>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(p => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.image} alt={p.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        </td>
                        <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{p.title}</td>
                        <td>{p.location}</td>
                        <td>
                          <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                            {p.type}
                          </span>
                        </td>
                        {/* Inline price edit cell */}
                        <td onDoubleClick={() => { setEditingPropId(p.id); setEditingField('price'); setInlineValue(p.price); }}>
                          {editingPropId === p.id && editingField === 'price' ? (
                            <input 
                              type="number"
                              className="inline-edit-input"
                              value={inlineValue}
                              onChange={e => setInlineValue(e.target.value)}
                              onBlur={() => triggerInlineSave(p.id, 'price', inlineValue)}
                              onKeyDown={e => { if (e.key === 'Enter') triggerInlineSave(p.id, 'price', inlineValue); if (e.key === 'Escape') setEditingPropId(null); }}
                              autoFocus
                            />
                          ) : (
                            <span className="clickable-edit-cell" style={{ fontWeight: '800', color: 'var(--success)' }}>
                              {p.price}€
                            </span>
                          )}
                        </td>
                        {/* Inline distance edit cell */}
                        <td onDoubleClick={() => { setEditingPropId(p.id); setEditingField('distanceToBeach'); setInlineValue(p.distanceToBeach); }}>
                          {editingPropId === p.id && editingField === 'distanceToBeach' ? (
                            <input 
                              type="number"
                              className="inline-edit-input"
                              value={inlineValue}
                              onChange={e => setInlineValue(e.target.value)}
                              onBlur={() => triggerInlineSave(p.id, 'distanceToBeach', inlineValue)}
                              onKeyDown={e => { if (e.key === 'Enter') triggerInlineSave(p.id, 'distanceToBeach', inlineValue); if (e.key === 'Escape') setEditingPropId(null); }}
                              autoFocus
                            />
                          ) : (
                            <span className="clickable-edit-cell">
                              {p.distanceToBeach}m
                            </span>
                          )}
                        </td>
                        {/* Quick toggle amenities columns */}
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              type="button"
                              onClick={() => toggleAmenityInline(p.id, 'wifi', p.amenities || {})}
                              style={{ 
                                opacity: p.amenities?.wifi ? 1 : 0.25, 
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' 
                              }}
                              title="Toggle Wi-Fi"
                            >
                              ⚡
                            </button>
                            <button 
                              type="button"
                              onClick={() => toggleAmenityInline(p.id, 'pool', p.amenities || {})}
                              style={{ 
                                opacity: p.amenities?.pool ? 1 : 0.25, 
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' 
                              }}
                              title="Toggle Pool"
                            >
                              🏊
                            </button>
                            <button 
                              type="button"
                              onClick={() => toggleAmenityInline(p.id, 'pets', p.amenities || {})}
                              style={{ 
                                opacity: p.amenities?.pets ? 1 : 0.25, 
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' 
                              }}
                              title="Toggle Pets Allowed"
                            >
                              🐾
                            </button>
                          </div>
                        </td>
                        {/* Edit or Delete Action */}
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              type="button"
                              className="btn-compare-action"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', borderRadius: '4px', cursor: 'pointer' }}
                              onClick={() => setEditingProperty({ ...p })}
                            >
                              Uredi
                            </button>
                            <button 
                              type="button"
                              className="btn-cancel-inquiry"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', borderRadius: '4px', cursor: 'pointer', color: '#fff' }}
                              onClick={() => {
                                if (confirm(`Da li ste sigurni da želite da obrišete smeštaj "${p.title}"?`)) {
                                  onDeleteProperty(p.id);
                                }
                              }}
                            >
                              Obriši
                            </button>
                          </div>
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

        {/* ==========================================
            TAB: INQUIRIES & BOOKINGS (RESERVATIONS)
            ========================================== */}
        {panelTab === 'inquiries' && (
          <div className="inquiries-panel-card animate-fade" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              Lista Rezervacionih Upita i Termina
            </h3>

            {inquiries.length > 0 ? (
              <div className="inquiries-table-wrapper">
                <table className="inquiries-table">
                  <thead>
                    <tr>
                      <th>Gost</th>
                      <th>Smeštaj / Regija</th>
                      <th>Termin boravka</th>
                      <th>Cena</th>
                      <th>Status upita</th>
                      <th>Interna Beleška</th>
                      <th>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map(inq => {
                      const guestUser = users.find(u => u.id === inq.userId);
                      const property = properties.find(p => p.id === inq.propertyId);

                      const guestName = guestUser ? guestUser.fullName : 'Gost';
                      const guestEmail = guestUser ? guestUser.email : 'Nema email-a';
                      const guestAvatar = guestUser ? (guestUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(guestName)}&background=0a4f70&color=fff`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(guestName)}&background=0a4f70&color=fff`;
                      const propTitle = property ? property.title : 'Nepoznato';
                      const propLoc = property ? property.location : '';

                      let statusLabel = inq.status;
                      let classColor = '#1d4ed8';
                      let bgColor = 'rgba(26,115,232,0.08)';
                      let borderColor = '#93c5fd';

                      if (inq.status === 'Odobreno') {
                        statusLabel = 'Odobreno';
                        classColor = '#16a34a';
                        bgColor = 'rgba(52,168,83,0.08)';
                        borderColor = '#86efac';
                      } else if (inq.status === 'Odbijeno') {
                        statusLabel = 'Odbijeno';
                        classColor = '#dc2626';
                        bgColor = 'rgba(230,57,70,0.08)';
                        borderColor = '#fca5a5';
                      } else if (inq.status === 'Poslato') {
                        statusLabel = 'Na čekanju';
                        classColor = '#d97706';
                        bgColor = 'rgba(241,165,63,0.08)';
                        borderColor = '#fde047';
                      }

                      // Check overlap warnings
                      const hasOverlap = checkDateOverlap(inq);

                      return (
                        <tr key={inq.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <img src={guestAvatar} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              <div>
                                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-main)' }}>{guestName}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{guestEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{propTitle}</div>
                            {inq.roomTitle && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '500', marginTop: '0.1rem' }}>
                                🛋️ {inq.roomTitle}
                              </div>
                            )}
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>📍 {propLoc}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '500', fontSize: '0.82rem' }}>{inq.dates}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inq.nights} noći / {inq.guests} gostiju</div>
                            {inq.checkIn && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                [{inq.checkIn} do {inq.checkOut}]
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: '800', color: 'var(--primary-light)' }}>{inq.totalPrice}€</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ 
                                fontSize: '0.7rem', padding: '0.15rem 0.45rem', 
                                color: classColor, backgroundColor: bgColor, 
                                border: `1px solid ${borderColor}`, borderRadius: '4px', 
                                display: 'inline-block', fontWeight: '700', textAlign: 'center' 
                              }}>
                                {statusLabel}
                              </span>
                              {hasOverlap && (
                                <span style={{ 
                                  fontSize: '0.65rem', padding: '0.1rem 0.35rem', 
                                  color: 'var(--danger)', backgroundColor: 'rgba(230,57,70,0.08)',
                                  border: '1px solid #fca5a5', borderRadius: '3px', fontWeight: '800', textAlign: 'center'
                                }}>
                                  ⚠️ Preklapanje
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Private admin comments note */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              <input 
                                type="text"
                                className="forum-search-input"
                                placeholder="Dodaj belešku..."
                                style={{ width: '130px', fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                                defaultValue={inquiryNotes[inq.id] || ''}
                                onBlur={(e) => handleSaveInquiryNote(inq.id, e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveInquiryNote(inq.id, e.target.value); }}
                              />
                              {inquiryNotes[inq.id] && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontStyle: 'italic' }}>📌 Sačuvano</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.3rem', flexDirection: 'column' }}>
                              {inq.status === 'Poslato' && (
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateInquiryStatus(inq.id, 'Odobreno')}
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', backgroundColor: 'var(--success)', border: 'none', color: '#fff', borderRadius: '3px', cursor: 'pointer' }}
                                  >
                                    Odobri
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateInquiryStatus(inq.id, 'Odbijeno')}
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', backgroundColor: 'var(--danger)', border: 'none', color: '#fff', borderRadius: '3px', cursor: 'pointer' }}
                                  >
                                    Odbij
                                  </button>
                                </div>
                              )}
                              <button
                                type="button"
                                className="btn-compare-action"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', width: '100%', boxSizing: 'border-box' }}
                                onClick={() => setSelectedInqForChat(inq)}
                              >
                                💬 Poruke
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Nema pristiglih rezervacionih upita.
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB: USERS LIST & MANAGEMENT
            ========================================== */}
        {panelTab === 'users' && (
          <div className="inquiries-panel-card animate-fade" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              Roster registrovanih korisnika
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
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=0a4f70&color=fff`} alt="Avatar" className="roster-avatar" />
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                        {u.fullName}
                      </div>
                      <div className={`roster-role-badge ${roleClass}`} style={{ marginBottom: '0.5rem' }}>
                        {roleLabel}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>📧 {u.email}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>📞 {u.phone || '/'}</div>
                      <div style={{ marginTop: 'auto', width: '100%' }}>
                        {isOwner ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Glavni osnivač portala</span>
                        ) : loggedInUserIsOwner ? (
                          <button
                            type="button"
                            className="btn-compare-action"
                            style={{ 
                              padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: '100%', borderRadius: '4px', cursor: 'pointer',
                              backgroundColor: u.isAdmin ? 'var(--danger)' : 'var(--success)',
                              borderColor: u.isAdmin ? 'var(--danger)' : 'var(--success)', color: '#fff'
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
                            {u.isAdmin ? 'Oduzmi Admin prava' : 'Dodeli Admin prava'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: '600' }}>Samo glavni vlasnik menja prava</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Nema korisnika u bazi.
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB: AUDIT LOG (SYSTEM EVENTS)
            ========================================== */}
        {panelTab === 'logs' && (
          <div className="inquiries-panel-card animate-fade" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>
                Dnevnik Sistemskih Aktivnosti (Audit Log)
              </h3>
              <input 
                type="text" 
                placeholder="Pretraži logove (korisnik ili akcija)..." 
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                className="forum-search-input"
                style={{ width: '280px', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              />
            </div>

            {filteredLogs.length > 0 ? (
              <div className="premium-timeline" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {filteredLogs.map(log => (
                  <div key={log.id} className="timeline-card">
                    <div className={`timeline-dot ${log.type || 'create'}`} />
                    <div className="timeline-time" style={{ fontFamily: 'monospace' }}>{log.timestamp}</div>
                    <div className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>{log.user}</span>
                      <span style={{ 
                        fontSize: '0.62rem', padding: '0.1rem 0.4rem', borderRadius: '10px', textTransform: 'uppercase', fontWeight: '700',
                        backgroundColor: log.type === 'create' ? 'rgba(52,168,83,0.08)' : log.type === 'delete' ? 'rgba(230,57,70,0.08)' : 'rgba(26,115,232,0.08)',
                        color: log.type === 'create' ? '#16a34a' : log.type === 'delete' ? '#dc2626' : '#1d4ed8'
                      }}>
                        {log.type === 'create' ? 'Kreirano' : log.type === 'delete' ? 'Obrisano' : 'Sistem'}
                      </span>
                    </div>
                    <div className="timeline-desc" style={{ marginTop: '0.3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{log.action}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                Nema pronađenih logova aktivnosti.
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===================================================================
          MODALS & FLOATING DIALOGS
          =================================================================== */}

      {/* 2. Modal: Full Property Editor */}
      {editingProperty && (
        <div className="modal-overlay" onClick={() => setEditingProperty(null)}>
          <div className="modal-container animate-scale" style={{ maxWidth: '800px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="chat-header">
              <div className="chat-header-title">
                <span className="chat-header-name">🛠️ Uredi kompletne podatke smeštaja</span>
                <span className="chat-header-status">ID: {editingProperty.id}</span>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setEditingProperty(null)} style={{ position: 'static' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSaveFullPropertyEdit} style={{ padding: '1.5rem' }}>
              <div className="form-field">
                <label>Naziv Smeštaja</label>
                <input 
                  type="text" 
                  value={editingProperty.title} 
                  onChange={e => setEditingProperty(p => ({ ...p, title: e.target.value }))} 
                  required 
                />
              </div>

              <div className="host-form-grid" style={{ marginBottom: '1rem' }}>
                <div className="form-field">
                  <label>Regija / Lokacija</label>
                  <input 
                    list="edit-destinations-list"
                    value={editingProperty.location} 
                    onChange={e => setEditingProperty(p => ({ ...p, location: e.target.value }))}
                    placeholder="Izaberite ili upišite novu lokaciju..."
                    required
                  />
                  <datalist id="edit-destinations-list">
                    {destinations.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
                <div className="form-field">
                  <label>Tip smeštaja</label>
                  <select value={editingProperty.type} onChange={e => setEditingProperty(p => ({ ...p, type: e.target.value }))}>
                    {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="host-form-grid" style={{ marginBottom: '1rem' }}>
                <div className="form-field">
                  <label>Cena po noćenju (€)</label>
                  <input 
                    type="number" 
                    value={editingProperty.price} 
                    onChange={e => setEditingProperty(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} 
                    min="1" 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Udaljenost od plaže (m)</label>
                  <input 
                    type="number" 
                    value={editingProperty.distanceToBeach} 
                    onChange={e => setEditingProperty(p => ({ ...p, distanceToBeach: parseInt(e.target.value, 10) || 0 }))} 
                    min="0" 
                    required 
                  />
                </div>
              </div>

              <div className="host-form-grid" style={{ marginBottom: '1rem' }}>
                <div className="form-field">
                  <label>Maksimalan broj gostiju</label>
                  <input 
                    type="number" 
                    value={editingProperty.guests} 
                    onChange={e => setEditingProperty(p => ({ ...p, guests: parseInt(e.target.value, 10) || 0 }))} 
                    min="1" 
                  />
                </div>
                <div className="form-field">
                  <label>Broj spavaćih soba</label>
                  <input 
                    type="number" 
                    value={editingProperty.bedrooms} 
                    onChange={e => setEditingProperty(p => ({ ...p, bedrooms: parseInt(e.target.value, 10) || 0 }))} 
                    min="1" 
                  />
                </div>
              </div>

              <div className="form-field" style={{ marginBottom: '1rem' }}>
                <label>Opis smeštaja</label>
                <textarea 
                  rows="4" 
                  value={editingProperty.description} 
                  onChange={e => setEditingProperty(p => ({ ...p, description: e.target.value }))} 
                  required 
                />
              </div>

              <div className="form-field">
                <label>Pravila & Sadržaji</label>
                <div className="checkbox-grid-host" style={{ gridTemplateColumns: 'repeat(3, 1fr)', padding: '0.8rem' }}>
                  {Object.keys(editingProperty.amenities || {}).map(key => (
                    <label key={key} className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={editingProperty.amenities[key]} 
                        onChange={() => setEditingProperty(p => ({
                          ...p,
                          amenities: {
                            ...p.amenities,
                            [key]: !p.amenities[key]
                          }
                        }))}
                      />
                      <span className="checkbox-checkmark"></span>
                      {key === 'wifi' ? '⚡ Wi-Fi' : key === 'pool' ? '🏊 Bazen' : key === 'beachfront' ? '🏖️ Plaža' : key === 'parking' ? '🚗 Parking' : key === 'airConditioning' ? '❄️ Klima' : '🐾 Ljubimci'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Upravljanje Smeštajnim Jedinicama (Sobe) */}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                <h4 style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '1rem' }}>🚪 Smeštajne jedinice (Sobe)</h4>
                
                {/* List of existing rooms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  {editingProperty.rooms && editingProperty.rooms.length > 0 ? (
                    editingProperty.rooms.map(room => (
                      <div 
                        key={room.id} 
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.8rem',
                          backgroundColor: 'var(--bg-main)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--text-main)' }}>{room.title}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            💰 Cena: {room.price}€/noć | 👥 Kapacitet: {room.guests} osobe | 🛏️ Spavaće sobe: {room.bedrooms}
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteRoom(room.id)}
                          style={{
                            backgroundColor: 'rgba(230, 57, 70, 0.1)',
                            color: 'var(--danger)',
                            border: '1px solid var(--danger)',
                            borderRadius: '4px',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Obriši
                        </button>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Nema definisanih soba. Smeštaj se iznajmljuje ceo po osnovnoj ceni.
                    </p>
                  )}
                </div>

                {/* Add new room form */}
                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}>
                  <h5 style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.2rem' }}>Dodaj novu sobu / jedinicu</h5>
                  
                  <div className="host-form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: 0 }}>
                    <div className="form-field">
                      <label style={{ fontSize: '0.78rem' }}>Naziv Sobe</label>
                      <input 
                        type="text" 
                        value={newRoomData.title}
                        onChange={e => setNewRoomData(p => ({ ...p, title: e.target.value }))}
                        placeholder="npr. Standardna trokrevetna soba"
                        style={{ padding: '0.4rem' }}
                      />
                    </div>
                    <div className="form-field">
                      <label style={{ fontSize: '0.78rem' }}>Cena po noćenju (€)</label>
                      <input 
                        type="number" 
                        value={newRoomData.price}
                        onChange={e => setNewRoomData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                        min="1"
                        style={{ padding: '0.4rem' }}
                      />
                    </div>
                  </div>

                  <div className="host-form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: 0 }}>
                    <div className="form-field">
                      <label style={{ fontSize: '0.78rem' }}>Maksimalan broj gostiju</label>
                      <input 
                        type="number" 
                        value={newRoomData.guests}
                        onChange={e => setNewRoomData(p => ({ ...p, guests: parseInt(e.target.value, 10) || 1 }))}
                        min="1"
                        style={{ padding: '0.4rem' }}
                      />
                    </div>
                    <div className="form-field">
                      <label style={{ fontSize: '0.78rem' }}>Broj spavaćih soba</label>
                      <input 
                        type="number" 
                        value={newRoomData.bedrooms}
                        onChange={e => setNewRoomData(p => ({ ...p, bedrooms: parseInt(e.target.value, 10) || 1 }))}
                        min="1"
                        style={{ padding: '0.4rem' }}
                      />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>Slika sobe (URL)</label>
                    <input 
                      type="text" 
                      value={newRoomData.image}
                      onChange={e => setNewRoomData(p => ({ ...p, image: e.target.value }))}
                      placeholder="https://..."
                      style={{ padding: '0.4rem' }}
                    />
                  </div>

                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>Kratak opis sobe</label>
                    <textarea 
                      rows="2" 
                      value={newRoomData.description}
                      onChange={e => setNewRoomData(p => ({ ...p, description: e.target.value }))}
                      placeholder="Udoban smeštaj sa bračnim krevetom..."
                      style={{ padding: '0.4rem' }}
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={handleAddRoom}
                    className="btn-send-message"
                    style={{ width: 'auto', alignSelf: 'flex-end', marginTop: '0.5rem', padding: '0.4rem 1.2rem' }}
                  >
                    Dodaj sobu
                  </button>
                </div>
              </div>

              <div className="chat-input-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 0 0 0', border: 'none' }}>
                <button type="button" onClick={() => setEditingProperty(null)} style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', padding: '0.45rem 1rem', cursor: 'pointer' }}>Otkaži</button>
                <button type="submit" className="btn-send-message" style={{ width: 'auto', padding: '0.45rem 1.2rem', marginTop: 0 }}>Sačuvaj Promene</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Interactive Chat with client */}
      {selectedInqForChat && (() => {
        const prop = properties.find(p => p.id === selectedInqForChat.propertyId);
        const propTitle = prop ? prop.title : 'Nepoznat objekat';
        const guestUser = users.find(u => u.id === selectedInqForChat.userId);
        const guestName = guestUser ? guestUser.fullName : `Gost ID: ${selectedInqForChat.userId}`;
        const chatHistory = inquiries.find(i => i.id === selectedInqForChat.id)?.chat || [
          { id: 1, sender: 'client', text: selectedInqForChat.message || 'Poslat upit za smeštaj.', timestamp: selectedInqForChat.dates.split(' - ')[0] }
        ];

        const handleSendMessageClick = (e) => {
          e.preventDefault();
          if (!chatText.trim()) return;
          const text = chatText.trim();
          onSendChatMessage(selectedInqForChat.id, 'host', text);
          setChatText('');
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
            <div className="modal-container chat-modal-container animate-scale" onClick={e => e.stopPropagation()}>
              <div className="chat-header">
                <div className="chat-header-title">
                  <span className="chat-header-name">Ćaskanje sa gostom: {guestName}</span>
                  <span className="chat-header-status">Objekat: {propTitle}</span>
                </div>
                <button type="button" className="btn-modal-close" onClick={() => setSelectedInqForChat(null)} style={{ position: 'static' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="chat-messages-body">
                {chatHistory.map((msg, idx) => (
                  <div key={msg.id || idx} className={`chat-bubble-wrapper ${msg.sender === 'host' ? 'right' : 'left'}`}>
                    <div className="chat-bubble">{msg.text}</div>
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
                <button type="submit" className="btn-send-message">Pošalji</button>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
