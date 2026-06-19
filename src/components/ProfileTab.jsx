import React, { useState } from 'react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function ProfileTab({ currentUser, inquiries = [], onUpdateUser, onCancelInquiry, onLogout, properties = [], onViewPropertyDetails, onSendChatMessage, onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: currentUser.fullName,
    phone: currentUser.phone,
    avatar: currentUser.avatar
  });
  const [submitted, setSubmitted] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [selectedInqForChat, setSelectedInqForChat] = useState(null);
  const [chatText, setChatText] = useState('');

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

  // Find user-specific inquiries
  const userInquiries = inquiries.filter(inq => inq.userId === currentUser.id);

  return (
    <div className="profile-layout animate-fade">
      {/* Left Sidebar Info Card */}
      <aside className="profile-card-sidebar">
        <img src={formData.avatar} alt={currentUser.fullName} className="profile-avatar-large" />
        <h3 className="profile-name">{currentUser.fullName}</h3>
        <p className="profile-email">@{currentUser.username}</p>

        <div className="profile-meta-details">
          <div className="profile-meta-item">
            <span>Ukupno upita: </span>
            <strong>{userInquiries.length}</strong>
          </div>
          <div className="profile-meta-item">
            <span>Tip profila: </span>
            <strong>
              {currentUser.email === 'vlasnik.aura@gmail.com' ? '👑 Vlasnik (Gazda)' : currentUser.isAdmin ? '🛠️ Administrator' : '👥 Klijent (Gost)'}
            </strong>
          </div>
          <div className="profile-meta-item">
            <span>E-mail: </span>
            <span style={{ fontSize: '0.85rem' }}>{currentUser.email}</span>
          </div>
        </div>

        {currentUser.isAdmin && (
          <button 
            className="btn-profile-logout" 
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: '#ffffff', 
              marginBottom: '0.75rem', 
              cursor: 'pointer',
              borderColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onClick={() => onNavigate('host')}
          >
            ⚙️ Otvori Admin Panel
          </button>
        )}

        <button className="btn-profile-logout" onClick={onLogout}>
          Odjavi se
        </button>
      </aside>

      {/* Right Column: Edit Profile & Inquiries List */}
      <div className="modal-info-col">
        {/* Edit Info Form */}
        <div className="inquiries-panel-card" style={{ padding: '1.8rem' }}>
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
              <label>Izaberite profilni avatar</label>
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

            <div className="form-field" style={{ marginTop: '0.8rem' }}>
              <label style={{ marginBottom: '0.4rem', display: 'block', fontWeight: '600' }}>Ili otpremite sopstvenu profilnu sliku</label>
              <div 
                className="file-upload-zone"
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
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
                    labelEl.innerText = "Otpremanje avatara...";
                    
                    try {
                      const res = await fetch(`${API_URL}/api/upload`, {
                        method: 'POST',
                        body: uploadData
                      });
                      const data = await res.json();
                      if (data.url) {
                        handleAvatarSelect(data.url);
                        labelEl.innerText = "Avatar uspešno otpremljen! ✓";
                      } else {
                        alert(data.error || 'Greška pri otpremanju avatara.');
                        labelEl.innerText = oldText;
                      }
                    } catch (err) {
                      alert('Greška pri otpremanju.');
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
                <div className="upload-label-text" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  👤 Kliknite ovde za učitavanje fotografije
                </div>
              </div>
            </div>

            <div className="host-form-grid" style={{ marginBottom: 0 }}>
              <div className="form-field">
                <label htmlFor="prof-name">Ime i Prezime *</label>
                <input 
                  type="text" 
                  id="prof-name" 
                  name="fullName"
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="form-field">
                <label htmlFor="prof-phone">Broj telefona *</label>
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

        {/* Sent Inquiries Table */}
        <div className="inquiries-panel-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', margin: 0 }}>
            Istorija Rezervacionih Upita (Moje rezervacije)
          </h3>

          {userInquiries.length > 0 ? (
            <div className="inquiries-table-wrapper">
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
                    // Find property title
                    const prop = properties.find(p => p.id === inq.propertyId);
                    const propTitle = prop ? prop.title : 'Nepoznat objekat';
                    
                    return (
                      <tr key={inq.id}>
                        <td style={{ fontWeight: '600' }}>
                          <span 
                            onClick={() => prop && onViewPropertyDetails(prop)}
                            style={{ cursor: 'pointer', color: 'var(--accent)' }}
                          >
                            {propTitle}
                          </span>
                        </td>
                        <td>{inq.dates}</td>
                        <td>{inq.nights} {inq.nights === 1 ? 'noć' : inq.nights < 5 ? 'noćenja' : 'noćenja'}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--primary-light)' }}>{inq.totalPrice}€</td>
                        <td>
                          <span className={`status-badge ${
                            inq.status === 'Odobreno' ? 'green' : 
                            inq.status === 'Odbijeno' ? 'red' : 'blue'
                          }`} style={{
                            backgroundColor: 
                              inq.status === 'Odobreno' ? 'rgba(52, 168, 83, 0.08)' :
                              inq.status === 'Odbijeno' ? 'rgba(230, 57, 70, 0.08)' : 'rgba(26, 115, 232, 0.08)',
                            color:
                              inq.status === 'Odobreno' ? '#16a34a' :
                              inq.status === 'Odbijeno' ? '#dc2626' : '#1d4ed8',
                            border:
                              inq.status === 'Odobreno' ? '1px solid #86efac' :
                              inq.status === 'Odbijeno' ? '1px solid #fca5a5' : '1px solid #93c5fd',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            {inq.status === 'Poslato' ? 'Na čekanju' : inq.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
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
      </div>

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
                    <span style={{ color: 'var(--accent)' }}>Grčka</span>Aura
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

      {selectedInqForChat && (() => {
        const prop = properties.find(p => p.id === selectedInqForChat.propertyId);
        const propTitle = prop ? prop.title : 'Nepoznat objekat';
        
        // Resolve chat messages
        const chatHistory = inquiries.find(i => i.id === selectedInqForChat.id)?.chat || [
          { id: 1, sender: 'client', text: selectedInqForChat.message || 'Poslat upit za smeštaj.', timestamp: selectedInqForChat.dates.split(' - ')[0] }
        ];

        const handleSendMessageClick = (e) => {
          e.preventDefault();
          if (!chatText.trim()) return;
          
          const text = chatText.trim();
          onSendChatMessage(selectedInqForChat.id, 'client', text);
          setChatText('');
          
          // Trigger automated host reply after 1.5s
          setTimeout(() => {
            let hostReply = "Hvala na poruci! Pitanje je prosleđeno vlasniku objekta. Javićemo vam se uskoro.";
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
                  <span className="chat-header-status">Domaćin: GrčkaAura Podrška</span>
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
