import { useState } from 'react';
import { INITIAL_FORUM_POSTS } from './forumPostsData';

const GREEK_TOWNS = ['Nikiti', 'Pefkohori', 'Nidri (Lefkada)', 'Golden Beach (Tasos)', 'Hanioti', 'Sarti', 'Parga', 'Neos Marmaras'];



export default function ForumSection({ 
  forumPosts = INITIAL_FORUM_POSTS, 
  onAddForumPost, 
  currentUser, 
  onDeleteForumPost, 
  onEditForumPost, 
  onSendActionRequest, 
  actionRequests = [] 
}) {

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

  const [activeModal, setActiveModal] = useState(null); // null, 'delete_request', 'edit', 'edit_request'
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalReason, setModalReason] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');



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

  const isOwner = currentUser && currentUser.email === 'voxilityy@gmail.com';
  
  const hasPermission = (perm) => {
    if (!currentUser) return false;
    if (isOwner) return true;
    if (!currentUser.isAdmin) return false;
    return currentUser.adminPermissions && currentUser.adminPermissions.includes(perm);
  };

  const handleOpenDelete = (post) => {
    if (hasPermission('forum_delete')) {
      if (confirm(`Da li ste sigurni da želite da obrišete priču "${post.title}"?`)) {
        onDeleteForumPost(post.id);
      }
    } else {
      setSelectedPost(post);
      setModalReason('');
      setActiveModal('delete_request');
    }
  };

  const handleOpenEdit = (post) => {
    setSelectedPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setModalReason('');
    
    if (hasPermission('forum_edit')) {
      setActiveModal('edit');
    } else {
      setActiveModal('edit_request');
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!selectedPost) return;

    if (activeModal === 'edit') {
      if (onEditForumPost) {
        onEditForumPost(selectedPost.id, editTitle, editContent);
      }
    } else if (activeModal === 'edit_request') {
      if (onSendActionRequest) {
        onSendActionRequest({
          actionType: 'forum_edit',
          targetId: selectedPost.id,
          targetTitle: selectedPost.title,
          proposedContent: { title: editTitle, content: editContent },
          reason: modalReason
        });
      }
    } else if (activeModal === 'delete_request') {
      if (onSendActionRequest) {
        onSendActionRequest({
          actionType: 'forum_delete',
          targetId: selectedPost.id,
          targetTitle: selectedPost.title,
          reason: modalReason
        });
      }
    }

    setActiveModal(null);
    setSelectedPost(null);
    setModalReason('');
    setEditTitle('');
    setEditContent('');
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

                    {currentUser && currentUser.isAdmin && (() => {
                      const pendingReq = actionRequests.find(r => r.targetId === post.id && r.status === 'pending');
                      if (pendingReq) {
                        return (
                          <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', backgroundColor: 'rgba(217, 119, 6, 0.12)', color: '#d97706', borderRadius: '4px', fontWeight: 'bold' }}>
                            ⏳ Čeka odobrenje ({pendingReq.actionType === 'forum_delete' ? 'brisanje' : 'izmena'})
                          </span>
                        );
                      }

                      return (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn-compare-action"
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              fontSize: '0.7rem', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginTop: 0,
                              backgroundColor: hasPermission('forum_edit') ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                              borderColor: hasPermission('forum_edit') ? 'var(--accent)' : 'var(--border)',
                              color: '#ffffff'
                            }}
                            onClick={() => handleOpenEdit(post)}
                          >
                            {hasPermission('forum_edit') ? '✏️ Izmeni' : '✏️ Izmeni (Zatraži)'}
                          </button>

                          <button
                            type="button"
                            className="btn-cancel-inquiry"
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              fontSize: '0.7rem', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginTop: 0,
                              backgroundColor: hasPermission('forum_delete') ? 'var(--danger)' : 'rgba(255,255,255,0.06)',
                              borderColor: hasPermission('forum_delete') ? 'var(--danger)' : 'var(--border)',
                              color: '#ffffff'
                            }}
                            onClick={() => handleOpenDelete(post)}
                          >
                            {hasPermission('forum_delete') ? '🗑️ Obriši' : '🗑️ Obriši (Zatraži)'}
                          </button>
                        </div>
                      );
                    })()}

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

      {/* Modals for Action Requests & Direct Editing */}
      {activeModal && selectedPost && (
        <div className="modal-overlay" onClick={() => { setActiveModal(null); setSelectedPost(null); }}>
          <div className="modal-container animate-scale" style={{ maxWidth: '600px', width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="chat-header">
              <div className="chat-header-title">
                <span className="chat-header-name">
                  {activeModal === 'edit' && '✏️ Direktna izmena objave'}
                  {activeModal === 'edit_request' && '⚖️ Zatraži izmenu objave'}
                  {activeModal === 'delete_request' && '🗑️ Zatraži brisanje objave'}
                </span>
                <span className="chat-header-status">
                  Post ID: {selectedPost.id}
                </span>
              </div>
              <button 
                type="button" 
                className="btn-modal-close" 
                onClick={() => { setActiveModal(null); setSelectedPost(null); }}
                style={{ position: 'static' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleModalSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {(activeModal === 'edit' || activeModal === 'edit_request') && (
                <>
                  <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Naslov objave</label>
                    <input 
                      type="text" 
                      value={editTitle} 
                      onChange={e => setEditTitle(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Sadržaj objave</label>
                    <textarea 
                      value={editContent} 
                      onChange={e => setEditContent(e.target.value)} 
                      rows="6" 
                      required 
                    />
                  </div>
                </>
              )}

              {(activeModal === 'edit_request' || activeModal === 'delete_request') && (
                <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Razlog i obrazloženje zahteva *</label>
                  <textarea 
                    value={modalReason} 
                    onChange={e => setModalReason(e.target.value)} 
                    placeholder="Unesite razlog zašto tražite ovu akciju..." 
                    rows="3" 
                    required 
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setActiveModal(null); setSelectedPost(null); }}
                  className="btn-cancel-inquiry"
                  style={{ margin: 0, padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px' }}
                >
                  Otkaži
                </button>
                <button 
                  type="submit" 
                  className="btn-submit-inquiry"
                  style={{ margin: 0, padding: '0.5rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px' }}
                >
                  {activeModal === 'edit' && 'Sačuvaj izmene'}
                  {activeModal === 'edit_request' && 'Pošalji zahtev'}
                  {activeModal === 'delete_request' && 'Pošalji zahtev'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>

  );

}

