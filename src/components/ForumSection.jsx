import React, { useState } from 'react';

export const INITIAL_FORUM_POSTS = [
  {
    id: 'post-1',
    author: 'Marija S.',
    destination: 'Nikiti',
    year: '2025',
    rating: 5,
    title: 'Savršen porodični odmor u Nikitiju na Sitoniji',
    date: '12. Sep 2025',
    content: 'Nikiti je fantastična baza za istraživanje čitave Sitonije. Gradska plaža je dugačka sa sitnim peskom i čistom vodom, mada zna biti gužve. Najveća prednost Nikitija su tri velika supermarketa (Lidl, Masoutis, Galaxias) što znatno olakšava snabdevanje. Svake večeri smo šetali prelepim popločanim šetalištem prepunim taverni i kafića. Svakako preporučujem posetu starom delu Nikitija koji ima poseban istorijski šarm.'
  },
  {
    id: 'post-2',
    author: 'Dejan B.',
    destination: 'Nidri (Lefkada)',
    year: '2025',
    rating: 4,
    title: 'Prelepa Lefkada i krstarenja oko ostrva',
    date: '28. Avg 2025',
    content: 'Bili smo smešteni u Nidriju. Mesto je živahno i odlično za večernje šetnje, ali gradska plaža nije ništa posebno. Zato smo iznajmili auto i obišli zapadnu obalu (Porto Kaciki, Egremni, Katizma) koja ima nestvarnu boju mora. Takođe, iz luke u Nidriju smo išli na krstarenje brodom do Kefalonije i Itake za samo 25 eura po osobi, što je izuzetan doživljaj koji preporučujem svima.'
  },
  {
    id: 'post-3',
    author: 'Ivana K.',
    destination: 'Golden Beach (Tasos)',
    year: '2024',
    rating: 5,
    title: 'Zlatni pesak i beskrajan plićak - raj za decu',
    date: '05. Jul 2024',
    content: 'Golden Beach na Tasosu je savršenstvo za roditelje sa malom decom. Pesak je toliko sitan da se deca mogu igrati satima, a plićak se proteže skoro 50 metara u dubinu. Voda je topla i kristalno čista. Mesto je mirno, nema bučnih diskoteka, idealno za pravi odmor. Cene u tavernama su sasvim pristojne, a sveže krofne na plaži su 2 eura.'
  }
];

const GREEK_TOWNS = ['Nikiti', 'Pefkohori', 'Nidri (Lefkada)', 'Golden Beach (Tasos)', 'Hanioti', 'Sarti', 'Parga', 'Neos Marmaras'];

export default function ForumSection({ forumPosts = INITIAL_FORUM_POSTS, onAddForumPost, currentUser, onDeleteForumPost }) {
  const [selectedDest, setSelectedDest] = useState('Sve');
  const [formData, setFormData] = useState({
    author: '',
    destination: GREEK_TOWNS[0],
    year: '2026',
    rating: '5',
    title: '',
    content: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.title.trim() || !formData.content.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author: formData.author.trim(),
      destination: formData.destination,
      year: formData.year,
      rating: parseInt(formData.rating, 10),
      title: formData.title.trim(),
      content: formData.content.trim(),
      date: new Date().toLocaleDateString('sr-RS', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    onAddForumPost(newPost);
    setSubmitted(true);

    // Reset Form
    setFormData({
      author: '',
      destination: GREEK_TOWNS[0],
      year: '2026',
      rating: '5',
      title: '',
      content: ''
    });

    setTimeout(() => setSubmitted(false), 3000);
  };

  const filteredPosts = forumPosts.filter(post => {
    return selectedDest === 'Sve' || post.destination.includes(selectedDest) || selectedDest.includes(post.destination);
  });

  return (
    <div className="blog-layout animate-fade">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>Utisci i Iskustva sa Letovanja</h2>
        <p style={{ color: 'var(--text-muted)' }}>Pročitajte iskustva drugih turista iz prve ruke ili podelite svoje utiske sa nama.</p>
      </div>

      <div className="forum-layout">
        {/* Left Side: Post Listings */}
        <div className="forum-posts-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Ukupno priča: {filteredPosts.length}</span>
            <div className="blog-categories">
              {['Sve', 'Nikiti', 'Lefkada', 'Tasos', 'Pefkohori', 'Parga'].map(dest => (
                <button
                  key={dest}
                  className={`btn-blog-category ${selectedDest === dest ? 'active' : ''}`}
                  onClick={() => setSelectedDest(dest)}
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <div key={post.id} className="forum-post animate-scale">
                <div className="forum-post-header">
                  <div className="forum-post-author-box">
                    <span className="forum-post-author">{post.author}</span>
                    <span className="forum-post-meta">Letovao/la u: <strong>{post.destination}</strong> ({post.year} god.)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div className="forum-post-rating">
                      <span>★ {post.rating} / 5</span>
                    </div>
                    {currentUser && currentUser.isAdmin && (
                      <button
                        type="button"
                        className="btn-cancel-inquiry"
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          fontSize: '0.7rem', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginTop: 0,
                          backgroundColor: 'var(--danger)',
                          color: '#ffffff'
                        }}
                        onClick={() => {
                          if (confirm(`Da li ste sigurni da želite da obrišete priču "${post.title}"?`)) {
                            onDeleteForumPost(post.id);
                          }
                        }}
                      >
                        Obriši priču
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="forum-post-title">{post.title}</h3>
                <p className="forum-post-text">{post.content}</p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.5rem', fontWeight: '500' }}>
                  Objavljeno: {post.date}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-listings">
              <h3>Nema objavljenih priča</h3>
              <p>Budite prvi koji će napisati utiske za ovu regiju!</p>
            </div>
          )}
        </div>

        {/* Right Side: Write Experience Form */}
        <div>
          <div className="sticky-form-wrapper">
            <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>Podelite Vašu Priču</h3>
            
            {submitted ? (
              <div className="success-message animate-scale">
                <p>Hvala Vam na podeljenom iskustvu!</p>
                <p style={{ fontWeight: 'normal', fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-main)' }}>
                  Vaša priča je odmah objavljena u bazi utisaka.
                </p>
              </div>
            ) : (
              <form className="inquiry-form" onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="forum-author">Vaše Ime *</label>
                  <input 
                    type="text" 
                    id="forum-author" 
                    name="author"
                    value={formData.author} 
                    onChange={handleInputChange} 
                    placeholder="npr. Stefan" 
                    required 
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="forum-dest">Gde ste letovali? *</label>
                  <select 
                    id="forum-dest" 
                    name="destination"
                    value={formData.destination} 
                    onChange={handleInputChange}
                  >
                    {GREEK_TOWNS.map(town => (
                      <option key={town} value={town}>{town}</option>
                    ))}
                  </select>
                </div>

                <div className="host-form-grid" style={{ marginBottom: 0 }}>
                  <div className="form-field">
                    <label htmlFor="forum-year">Godina *</label>
                    <select id="forum-year" name="year" value={formData.year} onChange={handleInputChange}>
                      {['2026', '2025', '2024', '2023', '2022'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="forum-rating">Ocena mesta *</label>
                    <select id="forum-rating" name="rating" value={formData.rating} onChange={handleInputChange}>
                      {['5', '4', '3', '2', '1'].map(r => (
                        <option key={r} value={r}>{r} ★</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="forum-title">Naslov utiska *</label>
                  <input 
                    type="text" 
                    id="forum-title" 
                    name="title"
                    value={formData.title} 
                    onChange={handleInputChange} 
                    placeholder="npr. Prelepo mesto, ali skupa hrana" 
                    required 
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="forum-content">Vaše detaljno iskustvo *</label>
                  <textarea 
                    id="forum-content" 
                    name="content"
                    value={formData.content} 
                    onChange={handleInputChange} 
                    placeholder="Opišite plaže, cene, kvalitet smeštaja, restorane i opšte utiske..." 
                    rows="6" 
                    required 
                  />
                </div>

                <button type="submit" className="btn-submit-inquiry" style={{ marginTop: '0.5rem' }}>
                  Objavi Priču
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
