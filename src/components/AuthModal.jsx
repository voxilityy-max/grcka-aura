import React, { useState } from 'react';

export default function AuthModal({ onClose, onLogin, onRegister, registeredUsers = [] }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  const [customGmailName, setCustomGmailName] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectGoogleAccount = (email, fullName, avatarUrl) => {
    setError('');
    // Proveri da li korisnik sa tim emailom već postoji
    const existingUser = registeredUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (existingUser) {
      // Prijavi postojećeg korisnika
      onLogin(existingUser);
    } else {
      // Registruj novog korisnika automatski sa podacima iz Google-a
      const isOwner = email.toLowerCase().trim() === 'voxilityy@gmail.com';
      const newGoogleUser = {
        id: Date.now(),
        username: isOwner ? 'vlasnik_aura' : email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + Math.floor(10 + Math.random() * 90),
        fullName: isOwner ? 'Vlasnik Aura' : fullName,
        email: email.toLowerCase().trim(),
        password: 'google-oauth-simulated', // simulirana lozinka
        phone: '+381 60 111 2233', // podrazumevani simulirani broj telefona
        avatar: isOwner ? 'https://ui-avatars.com/api/?name=Vlasnik+Aura&background=00b4d8&color=fff' : avatarUrl,
        isGoogleUser: true,
        isAdmin: isOwner
      };

      onRegister(newGoogleUser);
    }
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!customGmail.includes('@') || !customGmail.toLowerCase().endsWith('gmail.com')) {
      setError('Molimo unesite ispravnu Gmail adresu (mora se završavati sa @gmail.com).');
      return;
    }
    if (!customGmailName.trim()) {
      setError('Molimo unesite vaše ime i prezime.');
      return;
    }

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(customGmailName.trim())}&background=0a4f70&color=fff`;

    handleSelectGoogleAccount(customGmail, customGmailName.trim(), avatarUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.email.includes('@')) {
      setError('Molimo unesite ispravan e-mail.');
      return;
    }
    if (formData.password.length < 5) {
      setError('Lozinka mora imati najmanje 5 karaktera.');
      return;
    }

    if (isRegister) {
      if (!formData.username.trim() || !formData.fullName.trim() || !formData.phone.trim()) {
        setError('Molimo popunite sva polja.');
        return;
      }
      
      const newUser = {
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName.trim())}&background=0a4f70&color=fff`
      };

      Promise.resolve(onRegister(newUser)).catch(err => {
        setError(err.message || 'Greška pri registraciji.');
      });
    } else {
      Promise.resolve(onLogin({ email: formData.email.trim(), password: formData.password })).catch(err => {
        setError(err.message || 'Pogrešan e-mail ili lozinka.');
      });
    }
  };

  if (showGoogleChooser) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container auth-modal-card animate-scale" onClick={e => e.stopPropagation()}>
          <button className="btn-modal-close" onClick={onClose} aria-label="Zatvori">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="google-chooser-panel">
            <div className="google-chooser-title-box">
              <svg className="google-chooser-logo" viewBox="0 0 24 24" width="38" height="38" style={{ marginInline: 'auto', marginBottom: '0.5rem' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <h3 className="google-chooser-title">Izaberite nalog</h3>
              <p className="google-chooser-subtitle">za nastavak na portal GrčkaAura</p>
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600', padding: '0.6rem', backgroundColor: 'rgba(230, 57, 70, 0.08)', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {!googleCustomEmail ? (
              <>
                <div className="google-accounts-list">
                  <div className="google-account-row" style={{ cursor: 'pointer' }} onClick={() => handleSelectGoogleAccount('stefan.petrovic@gmail.com', 'Stefan Petrović', 'https://ui-avatars.com/api/?name=Stefan+Petrovic&background=0a4f70&color=fff')}>
                    <img className="google-acc-avatar" src="https://ui-avatars.com/api/?name=Stefan+Petrovic&background=0a4f70&color=fff" alt="Stefan avatar" />
                    <div className="google-acc-info">
                      <span className="google-acc-name">Stefan Petrović</span>
                      <span className="google-acc-email">stefan.petrovic@gmail.com</span>
                    </div>
                  </div>
                  <div className="google-account-row" style={{ cursor: 'pointer' }} onClick={() => handleSelectGoogleAccount('milica.kovacevic@gmail.com', 'Milica Kovačević', 'https://ui-avatars.com/api/?name=Milica+Kovacevic&background=e76f51&color=fff')}>
                    <img className="google-acc-avatar" src="https://ui-avatars.com/api/?name=Milica+Kovacevic&background=e76f51&color=fff" alt="Milica avatar" />
                    <div className="google-acc-info">
                      <span className="google-acc-name">Milica Kovačević</span>
                      <span className="google-acc-email">milica.kovacevic@gmail.com</span>
                    </div>
                  </div>

                  <div className="google-use-another-btn" style={{ cursor: 'pointer' }} onClick={() => { setGoogleCustomEmail(true); setError(''); }}>
                    <div className="google-use-another-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                      </svg>
                    </div>
                    <span>Koristi drugi nalog</span>
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleCustomGoogleSubmit} className="inquiry-form" style={{ marginBottom: '1.5rem' }}>
                <div className="form-field">
                  <label htmlFor="google-email">Gmail adresa *</label>
                  <input 
                    type="email" 
                    id="google-email" 
                    value={customGmail} 
                    onChange={e => setCustomGmail(e.target.value)}
                    placeholder="npr. jovan.jovanovic@gmail.com" 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="google-name">Ime i prezime *</label>
                  <input 
                    type="text" 
                    id="google-name" 
                    value={customGmailName} 
                    onChange={e => setCustomGmailName(e.target.value)}
                    placeholder="npr. Jovan Jovanović" 
                    required 
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
                  <button type="button" className="btn-compare-cancel" style={{ flex: 1, padding: '0.65rem' }} onClick={() => { setGoogleCustomEmail(false); setError(''); }}>
                    Nazad
                  </button>
                  <button type="submit" className="btn-submit-inquiry" style={{ flex: 1, padding: '0.65rem', margin: 0 }}>
                    Prijavi se
                  </button>
                </div>
              </form>
            )}

            <div className="google-chooser-security-text" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Da biste nastavili, Google će podeliti vaše ime, adresu e-pošte, sliku profila i lična podešavanja sa aplikacijom GrčkaAura. Pre nego što počnete da koristite ovu aplikaciju, pročitajte njena <span style={{ color: '#1a73e8', cursor: 'pointer', textDecoration: 'underline' }}>pravila o privatnosti</span> i <span style={{ color: '#1a73e8', cursor: 'pointer', textDecoration: 'underline' }}>uslove korišćenja</span>.
            </div>

            <button type="button" className="btn-compare-cancel" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }} onClick={() => { setShowGoogleChooser(false); setGoogleCustomEmail(false); setError(''); }}>
              Otkaži i vrati se
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container auth-modal-card animate-scale" onClick={e => e.stopPropagation()}>
        <button className="btn-modal-close" onClick={onClose} aria-label="Zatvori">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="auth-header-box">
          <h2>{isRegister ? 'Kreirajte Profil' : 'Dobrodošli Nazad'}</h2>
          <p>{isRegister ? 'Registrujte se da biste pratili svoje upite i rezervisali smeštaj.' : 'Prijavite se na svoj profil za lakšu komunikaciju sa domaćinima.'}</p>
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600', padding: '0.6rem', backgroundColor: 'rgba(230, 57, 70, 0.08)', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}



        <form onSubmit={handleSubmit} className="inquiry-form">
          {isRegister && (
            <>
              <div className="form-field">
                <label htmlFor="auth-username">Korisničko ime *</label>
                <input 
                  type="text" 
                  id="auth-username" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange}
                  placeholder="npr. stefan99" 
                  required 
                />
              </div>
              <div className="form-field">
                <label htmlFor="auth-fullname">Ime i Prezime *</label>
                <input 
                  type="text" 
                  id="auth-fullname" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange}
                  placeholder="npr. Stefan Petrović" 
                  required 
                />
              </div>
            </>
          )}

          <div className="form-field">
            <label htmlFor="auth-email">E-mail adresa *</label>
            <input 
              type="email" 
              id="auth-email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              placeholder="npr. stefan@email.com" 
              required 
            />
          </div>

          <div className="form-field">
            <label htmlFor="auth-password">Lozinka *</label>
            <input 
              type="password" 
              id="auth-password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange}
              placeholder="••••••••" 
              required 
            />
          </div>

          {isRegister && (
            <div className="form-field">
              <label htmlFor="auth-phone">Broj telefona *</label>
              <input 
                type="tel" 
                id="auth-phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                placeholder="npr. +381 60 123 4567" 
                required 
              />
            </div>
          )}

          <button type="submit" className="btn-submit-inquiry" style={{ marginTop: '0.8rem' }}>
            {isRegister ? 'Registruj se' : 'Prijavi se'}
          </button>
        </form>

        <div className="auth-toggle-link">
          {isRegister ? (
            <>
              Već imate nalog? <span onClick={() => { setIsRegister(false); setError(''); }}>Prijavite se ovde</span>
            </>
          ) : (
            <>
              Nemate profil? <span onClick={() => { setIsRegister(true); setError(''); }}>Registrujte se besplatno</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
