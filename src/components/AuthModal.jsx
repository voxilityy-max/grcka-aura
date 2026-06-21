import { useState, useEffect } from 'react';

export default function AuthModal({ onClose, onLogin, onRegister, registeredUsers = [], initialIsRegister = false, initialIsHost = false }) {
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  const [customGmailName, setCustomGmailName] = useState('');

  // Saved accounts state & helpers for quick login
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('saved_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedSavedAccount, setSelectedSavedAccount] = useState(null);
  const [saveProfileOnDevice, setSaveProfileOnDevice] = useState(true);
  const [showManualLogin, setShowManualLogin] = useState(false);

  const saveAccountToDevice = (user) => {
    try {
      const saved = localStorage.getItem('saved_accounts');
      let accounts = saved ? JSON.parse(saved) : [];
      const exists = accounts.some(acc => acc.email.toLowerCase() === user.email.toLowerCase());
      if (!exists) {
        accounts.push({
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=0a4f70&color=fff`,
          isGoogleUser: !!user.isGoogleUser
        });
        localStorage.setItem('saved_accounts', JSON.stringify(accounts));
        setSavedAccounts(accounts);
      }
    } catch (e) {
      console.error('Failed to save account to device:', e);
    }
  };

  const removeSavedAccount = (email) => {
    try {
      const saved = localStorage.getItem('saved_accounts');
      let accounts = saved ? JSON.parse(saved) : [];
      accounts = accounts.filter(acc => acc.email.toLowerCase() !== email.toLowerCase());
      localStorage.setItem('saved_accounts', JSON.stringify(accounts));
      setSavedAccounts(accounts);
      if (selectedSavedAccount && selectedSavedAccount.email.toLowerCase() === email.toLowerCase()) {
        setSelectedSavedAccount(null);
      }
    } catch (e) {
      console.error('Failed to remove saved account:', e);
    }
  };
  
  // New auth system states
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('remember_me') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    isHost: initialIsHost
  });
  const [error, setError] = useState('');

  // Load saved email if rememberMe is enabled
  useEffect(() => {
    const savedEmail = localStorage.getItem('saved_email');
    if (savedEmail && !isRegister && !isForgotPassword) {
      const timer = setTimeout(() => {
        setFormData(prev => {
          if (prev.email === savedEmail) return prev;
          return { ...prev, email: savedEmail };
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isRegister, isForgotPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectGoogleAccount = (email, fullName, avatarUrl) => {
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      // Proveri da li korisnik sa tim emailom već postoji
      const existingUser = registeredUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      const onRegisterPromise = (userObj) => {
        return Promise.resolve(onRegister(userObj)).then(() => userObj);
      };
      
      const onLoginPromise = (userObj) => {
        return Promise.resolve(onLogin(userObj)).then(() => userObj);
      };

      if (existingUser) {
        onLoginPromise(existingUser)
          .then((user) => {
            setIsLoading(false);
            if (saveProfileOnDevice) saveAccountToDevice(user);
          })
          .catch(err => {
            setError(err.message || 'Greška pri prijavi.');
            setIsLoading(false);
          });
      } else {
        const isOwner = email.toLowerCase().trim() === 'voxilityy@gmail.com';
        const newGoogleUser = {
          id: Date.now(),
          username: isOwner ? 'vlasnik_aura' : email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + Math.floor(10 + Math.random() * 90),
          fullName: isOwner ? 'Vlasnik Aura' : fullName,
          email: email.toLowerCase().trim(),
          password: 'google-oauth-simulated',
          phone: '+381 60 111 2233',
          avatar: isOwner ? 'https://ui-avatars.com/api/?name=Vlasnik+Aura&background=00b4d8&color=fff' : avatarUrl,
          isGoogleUser: true,
          isAdmin: isOwner
        };

        onRegisterPromise(newGoogleUser)
          .then((user) => {
            setIsLoading(false);
            if (saveProfileOnDevice) saveAccountToDevice(user);
          })
          .catch(err => {
            setError(err.message || 'Greška pri registraciji.');
            setIsLoading(false);
          });
      }
    }, 800);
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
    }

    setIsLoading(true);

    setTimeout(() => {
      if (isRegister) {
        const newUser = {
          username: formData.username.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          isHost: !!formData.isHost,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName.trim())}&background=0a4f70&color=fff`
        };

        Promise.resolve(onRegister(newUser))
          .then(() => setIsLoading(false))
          .catch(err => {
            setError(err.message || 'Greška pri registraciji.');
            setIsLoading(false);
          });
      } else {
        // Save or remove credentials based on Remember Me
        if (rememberMe) {
          localStorage.setItem('saved_email', formData.email.trim());
          localStorage.setItem('remember_me', 'true');
        } else {
          localStorage.removeItem('saved_email');
          localStorage.setItem('remember_me', 'false');
        }

        Promise.resolve(onLogin({ email: formData.email.trim(), password: formData.password }))
          .then((loggedInUser) => {
            setIsLoading(false);
            if (saveProfileOnDevice && loggedInUser) {
              saveAccountToDevice(loggedInUser);
            }
          })
          .catch(err => {
            setError(err.message || 'Pogrešan e-mail ili lozinka.');
            setIsLoading(false);
          });
      }
    }, 850); // Simulated network delay
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!forgotPasswordEmail.includes('@')) {
      setError('Molimo unesite ispravnu e-mail adresu.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setForgotPasswordSuccess(true);
    }, 900);
  };

  // Helper to evaluate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { text: '', class: '' };
    if (pass.length < 5) return { text: 'Prekratka lozinka', class: 'weak' };
    
    let score = 1;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;

    if (score === 1) return { text: 'Slaba lozinka', class: 'weak' };
    if (score === 2) return { text: 'Srednja jačina', class: 'medium' };
    return { text: 'Jaka lozinka', class: 'strong' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
              <p className="google-chooser-subtitle">za nastavak na portal Ellinas</p>
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600', padding: '0.6rem', backgroundColor: 'rgba(230, 57, 70, 0.08)', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {isLoading ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div className="auth-spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(0,132,255,0.15)', borderTopColor: 'var(--accent)' }}></div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Povezivanje sa Google servisom...</span>
              </div>
            ) : !googleCustomEmail ? (
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
              Da biste nastavili, Google će podeliti vaše ime, adresu e-pošte, sliku profila i lična podešavanja sa aplikacijom Ellinas. Pre nego što počnete da koristite ovu aplikaciju, pročitajte njena <span style={{ color: '#1a73e8', cursor: 'pointer', textDecoration: 'underline' }}>pravila o privatnosti</span> i <span style={{ color: '#1a73e8', cursor: 'pointer', textDecoration: 'underline' }}>uslove korišćenja</span>.
            </div>

            <button type="button" className="btn-compare-cancel" style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }} onClick={() => { setShowGoogleChooser(false); setGoogleCustomEmail(false); setError(''); }}>
              Otkaži i vrati se
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Forgot Password Screen
  if (isForgotPassword) {
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
            <h2>Resetovanje Lozinke</h2>
            <p>Zaboravili ste lozinku? Unesite vaš e-mail i poslaćemo vam link za kreiranje nove lozinke.</p>
          </div>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600', padding: '0.6rem', backgroundColor: 'rgba(230, 57, 70, 0.08)', borderRadius: '4px', marginBottom: '1.2rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {forgotPasswordSuccess ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
              <h4 style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>E-mail je poslat!</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Poslali smo uputstva za resetovanje lozinke na <strong>{forgotPasswordEmail}</strong>. Molimo proverite i vaš Inbox i Spam folder.
              </p>
              <button 
                type="button" 
                className="btn-submit-inquiry" 
                onClick={() => {
                  setIsForgotPassword(false);
                  setForgotPasswordSuccess(false);
                  setForgotPasswordEmail('');
                }}
              >
                Vrati se na prijavu
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="inquiry-form">
              <div className="form-field">
                <label htmlFor="reset-email">E-mail adresa *</label>
                <input 
                  type="email" 
                  id="reset-email" 
                  value={forgotPasswordEmail} 
                  onChange={e => setForgotPasswordEmail(e.target.value)}
                  placeholder="Unesite vaš registrovani e-mail"
                  required 
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit" 
                className={`btn-submit-inquiry ${isLoading ? 'btn-submit-loading' : ''}`}
                disabled={isLoading}
                style={{ marginTop: '1.2rem' }}
              >
                {isLoading ? (
                  <>
                    <div className="auth-spinner"></div>
                    Slanje linka...
                  </>
                ) : (
                  'Pošalji link za resetovanje'
                )}
              </button>

              <button 
                type="button" 
                className="btn-compare-cancel" 
                style={{ width: '100%', marginTop: '0.8rem', padding: '0.75rem' }} 
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                }}
                disabled={isLoading}
              >
                Nazad na prijavu
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // RENDER SCREEN: Saved Accounts Chooser
  if (!isRegister && !isForgotPassword && savedAccounts.length > 0 && !showManualLogin && !selectedSavedAccount) {
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
            <h2>Izaberite nalog</h2>
            <p>Prijavite se brzo jednim klikom na sačuvani profil na ovom uređaju.</p>
          </div>

          <div className="saved-accounts-list">
            {savedAccounts.map(account => (
              <div 
                key={account.email} 
                className="saved-account-card"
                onClick={() => {
                  setSelectedSavedAccount(account);
                  setFormData(prev => ({
                    ...prev,
                    email: account.email,
                    password: ''
                  }));
                  setError('');
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <img src={account.avatar} alt={account.fullName} className="saved-account-avatar" />
                  <div className="saved-account-info">
                    <span className="saved-account-name">{account.fullName}</span>
                    <span className="saved-account-email">{account.email}</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-remove-account" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSavedAccount(account.email);
                  }}
                  aria-label="Ukloni profil"
                  title="Ukloni ovaj profil sa uređaja"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            className="btn-compare-cancel" 
            style={{ width: '100%', marginTop: '1.2rem', padding: '0.75rem' }} 
            onClick={() => setShowManualLogin(true)}
          >
            Prijavi se sa drugim nalogom
          </button>
          
          <div className="auth-toggle-link" style={{ marginTop: '1.2rem' }}>
            Nemate profil? <span onClick={() => { setIsRegister(true); setError(''); }}>Registrujte se besplatno</span>
          </div>
        </div>
      </div>
    );
  }

  // RENDER SCREEN: Password input for selected saved account
  if (!isRegister && !isForgotPassword && selectedSavedAccount) {
    const handleSelectedAccountSubmit = (e) => {
      e.preventDefault();
      setError('');
      
      if (formData.password.length < 5) {
        setError('Lozinka mora imati najmanje 5 karaktera.');
        return;
      }
      
      setIsLoading(true);
      
      setTimeout(() => {
        Promise.resolve(onLogin({ email: selectedSavedAccount.email, password: formData.password }))
          .then(() => setIsLoading(false))
          .catch(err => {
            setError(err.message || 'Pogrešna lozinka.');
            setIsLoading(false);
          });
      }, 850);
    };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container auth-modal-card animate-scale" onClick={e => e.stopPropagation()}>
          <button className="btn-modal-close" onClick={onClose} aria-label="Zatvori">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="selected-account-header">
            <img src={selectedSavedAccount.avatar} alt={selectedSavedAccount.fullName} className="selected-account-avatar-large" />
            <h3 className="selected-account-name-label">{selectedSavedAccount.fullName}</h3>
            <p className="selected-account-email-label">{selectedSavedAccount.email}</p>
          </div>

          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600', padding: '0.6rem', backgroundColor: 'rgba(230, 57, 70, 0.08)', borderRadius: '4px', marginBottom: '1.2rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSelectedAccountSubmit} className="inquiry-form">
            <div className="form-field">
              <label htmlFor="saved-auth-password">Unesite lozinku *</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="saved-auth-password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange}
                  placeholder="••••••••" 
                  required 
                  disabled={isLoading}
                  autoFocus
                />
                <button 
                  type="button" 
                  className="btn-toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-helper-row" style={{ marginTop: '0.4rem', marginBottom: '0.8rem' }}>
              <span className="forgot-password-link" onClick={() => setIsForgotPassword(true)}>
                Zaboravili ste lozinku?
              </span>
            </div>

            <button 
              type="submit" 
              className={`btn-submit-inquiry ${isLoading ? 'btn-submit-loading' : ''}`}
              disabled={isLoading}
              style={{ marginTop: '1.2rem' }}
            >
              {isLoading ? (
                <>
                  <div className="auth-spinner"></div>
                  Prijavljivanje...
                </>
              ) : (
                'Prijavi se'
              )}
            </button>

            <button 
              type="button" 
              className="btn-compare-cancel" 
              style={{ width: '100%', marginTop: '0.8rem', padding: '0.75rem' }} 
              onClick={() => {
                setSelectedSavedAccount(null);
                setError('');
              }}
              disabled={isLoading}
            >
              Nazad na listu profila
            </button>
          </form>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="auth-password">Lozinka *</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="auth-password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange}
                placeholder="••••••••" 
                required 
                disabled={isLoading}
              />
              <button 
                type="button" 
                className="btn-toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength meter */}
            {isRegister && formData.password && (
              <div className="password-strength-meter">
                <div className="strength-bar-bg">
                  <div className={`strength-bar ${passwordStrength.class}`}></div>
                </div>
                <span className="strength-label">Jačina: {passwordStrength.text}</span>
              </div>
            )}
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
                disabled={isLoading}
              />
            </div>
          )}

          {isRegister && (
            <div className="auth-helper-row" style={{ marginTop: '0.4rem', marginBottom: '0.8rem', justifyContent: 'flex-start' }}>
              <label className="remember-me-checkbox" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  name="isHost"
                  checked={formData.isHost || false} 
                  onChange={(e) => setFormData(prev => ({ ...prev, isHost: e.target.checked }))} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500' }}>
                  Registrujem se kao vlasnik objekta (Domaćin)
                </span>
              </label>
            </div>
          )}

          {/* Remember me & Forgot Password Row */}
          {!isRegister && (
            <div className="auth-helper-row" style={{ flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '1.2rem', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="remember-me-checkbox">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                  />
                  <span>Zapamti me</span>
                </label>
                
                <label className="remember-me-checkbox">
                  <input 
                    type="checkbox" 
                    checked={saveProfileOnDevice} 
                    onChange={(e) => setSaveProfileOnDevice(e.target.checked)} 
                  />
                  <span title="Sačuvaj nalog za brzu prijavu na ovom pretraživaču">Sačuvaj profil</span>
                </label>
              </div>
              <span className="forgot-password-link" style={{ alignSelf: 'flex-end', marginTop: '-0.2rem' }} onClick={() => setIsForgotPassword(true)}>
                Zaboravili ste lozinku?
              </span>
            </div>
          )}

          <button 
            type="submit" 
            className={`btn-submit-inquiry ${isLoading ? 'btn-submit-loading' : ''}`}
            disabled={isLoading}
            style={{ marginTop: isRegister ? '0.8rem' : '1.2rem' }}
          >
            {isLoading ? (
              <>
                <div className="auth-spinner"></div>
                {isRegister ? 'Registracija...' : 'Prijavljivanje...'}
              </>
            ) : (
              isRegister ? 'Registruj se' : 'Prijavi se'
            )}
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