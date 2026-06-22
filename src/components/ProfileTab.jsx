import { useState } from 'react';
import PropertyCard from './PropertyCard';

const AVATAR_PRESETS = [
  'https://ui-avatars.com/api/?name=G1&background=0a4f70&color=fff',
  'https://ui-avatars.com/api/?name=G2&background=2a9d8f&color=fff',
  'https://ui-avatars.com/api/?name=G3&background=e76f51&color=fff',
  'https://ui-avatars.com/api/?name=G4&background=8338ec&color=fff'
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function ProfileTab({ 
  currentUser, 
  inquiries = [], 
  onUpdateUser, 
  onCancelInquiry, 
  onLogout, 
  properties = [], 
  onViewPropertyDetails, 
  onSendChatMessage, 
  onNavigate, 
  onUpgradeToHost,
  wishlist = [],
  onToggleWishlist,
  backendActive
}) {
  const [subTab, setSubTab] = useState('info'); // 'info', 'bookings', 'wishlist'
  const [formData, setFormData] = useState({
    fullName: currentUser.fullName,
    phone: currentUser.phone,
    avatar: currentUser.avatar
  });
  const [submitted, setSubmitted] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [selectedInqForChat, setSelectedInqForChat] = useState(null);
  const [chatText, setChatText] = useState('');

  // Password change states
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (url) => {
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) return;

    const updatedUser = {
      ...currentUser,
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      avatar: formData.avatar
    };

    onUpdateUser(updatedUser);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassError('Nova lozinka i potvrda lozinke se ne poklapaju.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPassError('Nova lozinka mora imati najmanje 6 karaktera.');
      return;
    }

    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/users/${currentUser.id}/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword
          })
        });
        const data = await res.json();
        if (res.ok) {
          setPassSuccess('Lozinka je uspešno promenjena!');
          setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          setPassError(data.error || 'Došlo je do greške pri promeni lozinke.');
        }
      } catch (err) {
        setPassError('Veza sa serverom nije mogla biti uspostavljena.');
      }
    } else {
      setPassSuccess('Lozinka je uspešno promenjena (lokalni režim)!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const userInquiries = inquiries.filter(inq => inq.userId === currentUser.id);
  const approvedTrips = userInquiries.filter(inq => inq.status === 'Odobreno');
  const savedProperties = properties.filter(p => wishlist.includes(p.id));

  return (
    <div className="profile-layout animate-tab-entry">
      {/* Left Sidebar Info Card */}
      <aside className="profile-card-sidebar">
        <div className="profile-avatar-container">
          <img src={formData.avatar} alt={currentUser.fullName} className="profile-avatar-large" />
        </div>
        <h3 className="profile-name">{currentUser.fullName}</h3>
        <p className="profile-email">@{currentUser.username}</p>

        <div className="profile-meta-details">
          <div className="profile-meta-item">
            <span>Tip naloga:</span>
            <strong>
              {currentUser.email === 'voxilityy@gmail.com' ? '👑 Vlasnik' : currentUser.isAdmin ? '🛠️ Administrator' : '👥 Klijent (Gost)'}
            </strong>
          </div>
          <div className="profile-meta-item">
            <span>E-mail adresa:</span>
            <span className="profile-meta-text-wrap" title={currentUser.email}>{currentUser.email}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-navigation-tabs">
          <button 
            type="button"
            className={`profile-menu-item ${subTab === 'info' ? 'active' : ''}`}
            onClick={() => setSubTab('info')}
          >
            👤 Profil i Sigurnost
          </button>
          <button 
            type="button"
            className={`profile-menu-item ${subTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setSubTab('bookings')}
          >
            📅 Moja Putovanja ({userInquiries.length})
          </button>
          <button 
            type="button"
            className={`profile-menu-item ${subTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setSubTab('wishlist')}
          >
            ❤️ Sačuvani Smeštaj ({wishlist.length})
          </button>
        </div>

        {/* Action Controls */}
        <div className="profile-sidebar-actions" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {currentUser.isAdmin ? (
            <button 
              className="btn-profile-panel-link" 
              onClick={() => onNavigate('host')}
            >
              ⚙️ Otvori Admin Panel
            </button>
          ) : currentUser.isHost ? (
            <button 
              className="btn-profile-panel-link host" 
              onClick={() => onNavigate('host')}
            >
              🏠 Otvori Vlasnički Panel
            </button>
          ) : (
            <button 
              className="btn-profile-panel-link host-upgrade" 
              onClick={() => {
                if (confirm('Da li želite da postanete domaćin i oglašavate svoje smeštaje? Proći ćete kratak proces verifikacije.')) {
                  if (onUpgradeToHost) onUpgradeToHost();
                }
              }}
            >
              🤝 Postani Domaćin
            </button>
          )}

          <button className="btn-profile-logout" onClick={onLogout}>
            Odjavi se
          </button>
        </div>
      </aside>

      {/* Right Column: Dynamic Content & Stats */}
      <div className="modal-info-col">
        {/* KPI Stats Rezime */}
        <div className="profile-kpi-grid">
          <div className="profile-kpi-card">
            <div className="kpi-icon">📩</div>
            <div className="kpi-info">
              <span className="kpi-value">{userInquiries.length}</span>
              <span className="kpi-label">Ukupno upita</span>
            </div>
          </div>
          <div className="profile-kpi-card">
            <div className="kpi-icon">🛫</div>
            <div className="kpi-info">
              <span className="kpi-value">{approvedTrips.length}</span>
              <span className="kpi-label">Odobrenih putovanja</span>
            </div>
          </div>
          <div className="profile-kpi-card">
            <div className="kpi-icon">❤️</div>
            <div className="kpi-info">
              <span className="kpi-value">{wishlist.length}</span>
              <span className="kpi-label">Sačuvanih smeštaja</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Edit Profile & Password */}
        {subTab === 'info' && (
          <div className="profile-tabs-content-wrapper">
            {/* Edit Info Form */}
            <div className="inquiries-panel-card animate-fade" style={{ padding: '1.8rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
                Uredi Profilne Podatke
              </h3>
              
              {submitted && (
                <div className="success-message animate-scale" style={{ marginBottom: '1rem' }}>
                  Izmene na profilu su uspešno sačuvane!
                </div>
              )}

              <form onSubmit={handleSubmit} className="inquiry-form">
                <div className="form-field">
                  <label style={{ fontWeight: '600', marginBottom: '0.4rem' }}>Izaberite profilni avatar</label>
                  <div className="avatar-selector-grid">
                    {AVATAR_PRESETS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`avatar-selector-btn ${formData.avatar === url ? 'active' : ''}`}
                        onClick={() => handleAvatarSelect(url)}
                      >
                        <img src={url} alt={`Avatar preset ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="host-form-grid form-grid-2-col" style={{ marginTop: '1rem' }}>
                  <div className="form-field">
                    <label htmlFor="prof-fullname">Ime i Prezime *</label>
                    <input 
                      type="text" 
                      id="prof-fullname" 
                      name="fullName"
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="prof-phone">Broj Telefona *</label>
                    <input 
                      type="tel" 
                      id="prof-phone" 
                      name="phone"
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn-card-details" style={{ width: 'fit-content', marginTop: '1rem' }}>
                  Sačuvaj izmene
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="inquiries-panel-card animate-fade" style={{ padding: '1.8rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.2rem', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
                🔑 Sigurnost i promena lozinke
              </h3>

              {passError && (
                <div className="error-message animate-scale" style={{ marginBottom: '1rem', color: 'var(--danger)', fontWeight: 'bold' }}>
                  ⚠️ {passError}
                </div>
              )}
              {passSuccess && (
                <div className="success-message animate-scale" style={{ marginBottom: '1rem' }}>
                  ✓ {passSuccess}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="inquiry-form">
                <div className="form-field">
                  <label htmlFor="curr-pass">Trenutna lozinka *</label>
                  <input 
                    type="password"
                    id="curr-pass"
                    value={passwords.currentPassword}
                    onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Unesite trenutnu lozinku"
                    required
                  />
                </div>

                <div className="host-form-grid form-grid-2-col" style={{ marginTop: '0.8rem' }}>
                  <div className="form-field">
                    <label htmlFor="new-pass">Nova lozinka *</label>
                    <input 
                      type="password"
                      id="new-pass"
                      value={passwords.newPassword}
                      onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Najmanje 6 karaktera"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="confirm-pass">Potvrda nove lozinke *</label>
                    <input 
                      type="password"
                      id="confirm-pass"
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Ponovite novu lozinku"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-card-details" style={{ width: 'fit-content', marginTop: '1.2rem', backgroundColor: '#e76f51', borderColor: '#e76f51' }}>
                  Promeni lozinku
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Sent Inquiries & Trips */}
        {subTab === 'bookings' && (
          <div className="inquiries-panel-card animate-fade" style={{ padding: '1.8rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', margin: 0 }}>
              Istorija Rezervacionih Upita (Moje rezervacije)
            </h3>

            {userInquiries.length > 0 ? (
              <div className="inquiries-table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="inquiries-table">
                  <thead>
                    <tr>
                      <th>Smeštaj</th>
                      <th>Datumi boravka</th>
                      <th>Noćenja</th>
                      <th>Cena</th>
                      <th>Status</th>
                      <th>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userInquiries.map(inq => {
                      const prop = properties.find(p => p.id === inq.propertyId);
                      const propTitle = prop ? prop.title : 'Nepoznat objekat';
                      
                      return (
                        <tr key={inq.id}>
                          <td style={{ fontWeight: '600' }}>
                            <span 
                              onClick={() => prop && onViewPropertyDetails(prop)}
                              style={{ cursor: 'pointer', color: 'var(--accent)', display: 'block' }}
                            >
                              {propTitle}
                            </span>
                            {inq.roomTitle && (
                              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '0.2rem' }}>
                                🛋️ Soba: {inq.roomTitle}
                              </span>
                            )}
                          </td>
                          <td>{inq.dates}</td>
                          <td>{inq.nights} {inq.nights === 1 ? 'noć' : inq.nights < 5 ? 'noćenja' : 'noćenja'}</td>
                          <td style={{ fontWeight: 'bold', color: 'var(--primary-light)' }}>{inq.totalPrice}€</td>
                          <td>
                            <span className={`status-badge ${
                              inq.status === 'Odobreno' ? 'approved' : 
                              inq.status === 'Odbijeno' ? 'rejected' : 'pending'
                            }`}>
                              {inq.status === 'Poslato' ? 'Na čekanju' : inq.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-cell">
                              {inq.status === 'Poslato' && (
                                <>
                                  <button 
                                    className="btn-cancel-inquiry"
                                    style={{ marginTop: 0 }}
                                    onClick={() => {
                                      if (confirm('Da li ste sigurni da želite da otkažete ovaj upit?')) {
                                        onCancelInquiry(inq.id);
                                      }
                                    }}
                                  >
                                    Otkaži
                                  </button>
                                  <button
                                    className="btn-compare-action"
                                    style={{
                                      padding: '0.35rem 0.7rem',
                                      fontSize: '0.75rem',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      backgroundColor: 'var(--accent)',
                                      borderColor: 'var(--accent)',
                                      color: '#ffffff',
                                      marginTop: 0
                                    }}
                                    onClick={() => setSelectedInqForChat(inq)}
                                  >
                                    💬 Ćaskanje
                                  </button>
                                </>
                              )}

                              {inq.status === 'Odobreno' && (
                                <>
                                  <button 
                                    className="btn-compare-action"
                                    style={{ 
                                      padding: '0.35rem 0.7rem', 
                                      fontSize: '0.75rem', 
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      backgroundColor: 'var(--success)',
                                      borderColor: 'var(--success)',
                                      color: '#ffffff',
                                      marginTop: 0
                                    }}
                                    onClick={() => setSelectedInquiry(inq)}
                                  >
                                    📄 Potvrda (PDF)
                                  </button>
                                  <button
                                    className="btn-compare-action"
                                    style={{
                                      padding: '0.35rem 0.7rem',
                                      fontSize: '0.75rem',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      backgroundColor: 'var(--accent)',
                                      borderColor: 'var(--accent)',
                                      color: '#ffffff',
                                      marginTop: 0
                                    }}
                                    onClick={() => setSelectedInqForChat(inq)}
                                  >
                                    💬 Ćaskanje
                                  </button>
                                </>
                              )}

                              {inq.status === 'Odbijeno' && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Zatvoreno</span>
                              )}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <p style={{ fontSize: '0.95rem' }}>Još uvek niste poslali nijedan upit za smeštaj.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Wishlist */}
        {subTab === 'wishlist' && (
          <div className="inquiries-panel-card animate-fade" style={{ padding: '1.8rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              Sačuvane Smeštajne Jedinice (Wishlist)
            </h3>

            {savedProperties.length > 0 ? (
              <div className="profile-wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {savedProperties.map(prop => (
                  <PropertyCard 
                    key={prop.id}
                    property={prop}
                    onViewDetails={() => onViewPropertyDetails(prop)}
                    isWishlisted={true}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>❤️</span>
                <p style={{ fontSize: '0.95rem' }}>Nemate sačuvanih smeštaja na vašoj listi.</p>
                <button 
                  className="btn-card-details" 
                  style={{ width: 'fit-content', marginTop: '1rem', paddingInline: '2rem' }}
                  onClick={() => onNavigate('all-listings')}
                >
                  Pretraži Smeštaje
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedInquiry && (() => {
        const prop = properties.find(p => p.id === selectedInquiry.propertyId);
        const propTitle = prop ? prop.title : 'Nepoznat objekat';
        const propLoc = prop ? prop.location : '';
        const propType = prop ? prop.type : '';
        
        return (
          <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
            <div 
              className="modal-container" 
              id="printable-receipt-modal" 
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '620px', padding: '2.5rem', borderRadius: '12px', borderTop: '6px solid var(--primary)', position: 'relative' }}
            >
              <button className="btn-modal-close" onClick={() => setSelectedInquiry(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', margin: 0, fontWeight: '800' }}>
                    <span style={{ color: 'var(--accent)' }}>Elli</span>nas
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>ZVANIČNA POTVRDA REZERVACIJE</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Broj potvrde:</div>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>GA-{selectedInquiry.id}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px', fontWeight: '700' }}>Podaci o gostu</h4>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>{currentUser.fullName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>E-mail: {currentUser.email}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Telefon: {currentUser.phone || '/'}</div>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.5px', fontWeight: '700' }}>Smeštajna jedinica</h4>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>{propTitle}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tip: {propType}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lokacija: {propLoc}, Grčka</div>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-main)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '700' }}>Detalji rezervacije</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Termin:</span>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedInquiry.dates}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Trajanje:</span>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedInquiry.nights} noćenja</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Broj osoba:</span>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{selectedInquiry.guests} osobe</div>
                  </div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0', color: 'var(--text-muted)', fontWeight: '600' }}>Opis stavke</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0', color: 'var(--text-muted)', fontWeight: '600' }}>Iznos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-main)' }}>Smeštaj ({prop?.price}€ x {selectedInquiry.nights} noćenja)</td>
                    <td style={{ textAlign: 'right', padding: '0.6rem 0', color: 'var(--text-main)' }}>{prop?.price * selectedInquiry.nights}€</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-main)' }}>Boravišna taksa (1.5€ x {selectedInquiry.nights} noćenja)</td>
                    <td style={{ textAlign: 'right', padding: '0.6rem 0', color: 'var(--text-main)' }}>{1.5 * selectedInquiry.nights}€</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem 0', color: 'var(--text-main)' }}>Usluga čišćenja i pripreme objekta</td>
                    <td style={{ textAlign: 'right', padding: '0.6rem 0', color: 'var(--text-main)' }}>25€</td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid var(--primary)', fontWeight: 'bold', fontSize: '1.05rem' }}>
                    <td style={{ padding: '0.8rem 0', color: 'var(--primary)' }}>Ukupno plaćeno</td>
                    <td style={{ textAlign: 'right', padding: '0.8rem 0', color: 'var(--primary-light)' }}>{selectedInquiry.totalPrice}€</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  color: '#16a34a', 
                  border: '2px solid #16a34a',
                  borderRadius: '4px',
                  padding: '0.4rem 0.8rem',
                  fontWeight: '800', 
                  fontSize: '0.82rem',
                  letterSpacing: '0.5px'
                }}>
                  ✓ REZERVACIJA POTVRĐENA
                </div>
                <button
                  className="btn-compare-action btn-print-action"
                  onClick={() => window.print()}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--primary)',
                    borderColor: 'var(--primary)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(10, 79, 112, 0.15)'
                  }}
                >
                  🖨️ Odštampaj / Sačuvaj PDF
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Chat / Messages Modal */}
      {selectedInqForChat && (() => {
        const prop = properties.find(p => p.id === selectedInqForChat.propertyId);
        const propTitle = prop ? prop.title : 'Nepoznat objekat';
        
        const chatHistory = inquiries.find(i => i.id === selectedInqForChat.id)?.chat || [
          { id: 1, sender: 'client', text: selectedInqForChat.message || 'Poslat upit za smeštaj.', timestamp: selectedInqForChat.dates.split(' - ')[0] }
        ];

        const handleSendMessageClick = (e) => {
          e.preventDefault();
          if (!chatText.trim()) return;
          
          const text = chatText.trim();
          onSendChatMessage(selectedInqForChat.id, 'client', text);
          setChatText('');
          
          setTimeout(() => {
            let hostReply = "Hvala na poruci! Vaš upit je prosleđen našem timu podrške. Javićemo vam se sa odgovorom u najkraćem roku.";
            if (selectedInqForChat.status === 'Odobreno') {
              hostReply = "Radujemo se Vašem dolasku! Sve je pripremljeno za Vaš boravak. Ako imate dodatnih pitanja u vezi check-in vremena ili lokacije, slobodno pišite.";
            } else if (selectedInqForChat.status === 'Odbijeno') {
              hostReply = "Nažalost, termini koje ste tražili su zauzeti. Možete pogledati druge slobodne termine u ponudi.";
            }
            onSendChatMessage(selectedInqForChat.id, 'host', hostReply);
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
                  <span className="chat-header-name">Ćaskanje: {propTitle}</span>
                  <span className="chat-header-status">Domaćin: Ellinas Podrška</span>
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
                    className={`chat-bubble-wrapper ${msg.sender === 'client' ? 'right' : 'left'}`}
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
                  placeholder="Napišite poruku domaćinu..." 
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
