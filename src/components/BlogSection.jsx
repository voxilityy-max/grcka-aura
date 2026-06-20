import React, { useState } from 'react';

const BLOG_POSTS = [
  {
    id: 'blog-1',
    title: 'Kolima do Grčke 2026: Kompletan vodič kroz rute i cene putarina',
    category: 'Rute',
    date: '15. Jun 2026',
    readTime: '6 min čitanja',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Detaljan izveštaj o putu za Grčku preko Severne Makedonije i Bugarske. Saznajte sve cene putarina, uslove na putevima i radno vreme graničnih prelaza za predstojeću sezonu.',
    content: `Putovanje automobilom u Grčku je omiljeni izbor za hiljade naših turista. Za sezonu 2026. imamo nekoliko bitnih ažuriranja u vezi sa rutama, cenama putarina i propisima.

### Ruta Preko Severne Makedonije (Koridor 10)
Ovo je i dalje najbrža i najpopularnija ruta za turiste koji putuju na Halkidiki, Olimpijsku regiju i Jonsku obalu (Lefkada, Parga, Krf).
- **Putarine u Srbiji**: Od Beograda do Preševa putarina iznosi 1.720 RSD u jednom pravcu.
- **Putarine u Severnoj Makedoniji**: Na trasi ima 5 naplatnih rampi. Ukupna cena iznosi oko 8.5 EUR u jednom smeru. Preporučujemo kupovinu elektronske kartice (M-tag) na samoj granici za brži prolaz.
- **Granični prelaz Evzoni**: Najveći prelaz između Makedonije i Grčke. Otvoren je 24 sata dnevno, ali u julu i avgustu se preporučuje prelazak u ranim jutarnjim ili kasnim večernjim satima zbog manjih gužvi.

### Ruta Preko Bugarske
Ukoliko putujete na istok Grčke (Tasos, Kavala, Asprovalta) ili želite da izbegnete gužve na Evzoniju, ruta preko Bugarske je odlična alternativa.
- **Vinjeta u Bugarskoj**: Kroz Bugarsku je obavezna vinjeta. Vikend vinjeta košta oko 5 EUR, dok sedmična iznosi oko 8 EUR. Kupite je isključivo na zvaničnom portalu (bgtoll.bg) ili odmah nakon prelaska granice Gradina na aparatima.
- **Prelaz Kulata - Promahonas**: Glavni prelaz koji zna biti opterećen tokom vikenda. Alternativni prelaz Ilinden - Exochi je znatno manje gužvovit.

### Saveti za Put
1. **Zeleni Karton**: Više NIJE potreban za vožnju kroz Severnu Makedoniju ukoliko imate novu registracionu nalepnicu, ali je poželjno imati osiguranje.
2. **Gorivo**: Najpovoljnije cene goriva su tradicionalno u Severnoj Makedoniji, pa planirajte dopunu rezervoara pre ulaska u Grčku.`
  },
  {
    id: 'blog-2',
    title: 'EES i ETIAS sistemi: Nova pravila za ulazak u Grčku i EU',
    category: 'Propisi',
    date: '10. Jun 2026',
    readTime: '5 min čitanja',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Sve što treba da znate o digitalnom evidentiranju putnika na granicama i online prijavama ETIAS koje stupaju na snagu ove godine.',
    content: `Sa početkom letnje sezone 2026. Evropska unija u potpunosti primenjuje nove sisteme za kontrolu granica. Za turiste iz zemalja van EU (uključujući Srbiju, BiH, Severnu Makedoniju) ovo donosi određene promene pri ulasku u Grčku.

### Šta je EES (Entry/Exit System)?
EES je automatizovani IT sistem koji registruje putnike iz trećih zemalja svaki put kada pređu spoljnu granicu EU.
- **Uzimanje biometrijskih podataka**: Prilikom prvog prelaska granice pod novim sistemom, granični policajci će uzeti Vaše otiske prstiju i fotografisati Vaše lice.
- **Kraj pečatiranja pasoša**: EES eliminiše ručno udaranje pečata u pasoše. Sistem automatski beleži Vaše ime, vrstu putne isprave, biometrijske podatke i datum i mesto ulaska/izlaska.
- **Prednost**: Ubrzava naknadne prelaske jer se biometrijski podaci čuvaju u bazi podataka naredne 3 godine.

### Šta je ETIAS i kada nam treba?
ETIAS je sistem za izdavanje dozvola za putovanja koji zahteva online prijavu pre polaska na put.
- **Kako se prijavljuje**: Popunjava se jednostavan online formular na zvaničnom ETIAS sajtu. Odobrenje se obično dobija u roku od nekoliko minuta.
- **Cena**: Taksa iznosi 7 EUR i važi 3 godine (ili do isteka pasoša). Za maloletnike i starije od 70 godina prijava je besplatna.
- **Savet**: Prijavite se najmanje 96 sati pre puta kako biste izbegli nepredviđene zastoje.`
  },
  {
    id: 'blog-3',
    title: 'Top 10 najlepših plaža na Sitoniji koje morate posetiti',
    category: 'Plaže',
    date: '02. Jun 2026',
    readTime: '8 min čitanja',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Sitonija je poznata po najzelenijim borovim šumama i kristalno tirkiznim plažama. Izdvajamo 10 dragulja drugog prsta Halkidikija.',
    content: `Sitonija predstavlja pravi raj za ljubitelje netaknute prirode, sitnog peska i tirkizne vode. Istražili smo i odabrali 10 plaža koje nikako ne smete zaobići tokom letovanja.

### 1. Karidi Plaža (Vurvuru)
Egzotični dragulj sa finim belim peskom i stinama neobičnih oblika. Plitka voda se proteže desetinama metara od obale, što je čini savršenom za porodice sa malom decom. Na plaži nema ležaljki i suncobrana, pa ponesite sopstvenu opremu.

### 2. Orange Beach (Portokali)
Čuvena po skulpturama u steni i tirkiznoj vodi koja podseća na Karibe. Tokom sezone je velika gužva, pa preporučujemo dolazak rano ujutru kako biste našli mesto na strmim stinama ili malom peščanom delu.

### 3. Lagomandra Plaža
Dugačka peščana plaža poznata po prirodnom hladu borove šume koja se spušta skoro do same vode. Voda je izuzetno čista, a dubina počinje relativno brzo, što je čini odličnom za plivanje.

### 4. Kalamitsi Plaža
Nalazi se na samom jugu Sitonije. Plaža je prostrana, zaklonjena od vetrova i ima prelep pesak. U blizini su kafići i restorani, a voda je kristalno bistra.`
  },
  {
    id: 'blog-4',
    title: 'Mobilni internet u Grčkoj: eSIM kartice naspram lokalnih SIM kartica',
    category: 'Saveti',
    date: '28. Maj 2026',
    readTime: '4 min čitanja',
    image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Uporedne cene i preporuke za internet tokom odmora. Kako najlakše ostati povezan i izbeći skupe roming tarife.',
    content: `Mobilni internet je postao esencijalan tokom letovanja, bilo za navigaciju, prevod, ili deljenje fotografija sa plaže. Pogledajmo koje su najbolje opcije za internet u Grčkoj.

### Opcija 1: Grčki Lokalni SIM (Cosmote, Vodafone, Nova)
Kupovina lokalne grčke kartice je i dalje najpovoljnija opcija ako Vam treba velika količina podataka.
- **Cosmote prepaid**: Nudi turističke pakete "Summer Giga" sa neograničenim internetom na 15 dana po ceni od oko 15-20 EUR.
- **Gde kupiti**: U zvaničnim prodavnicama mobilnih operatera (Cosmote, Germanos, Vodafone) u većim gradovima (Solun, Nea Mudanja, Poligiros). Za kupovinu Vam je potreban **pasoš**.

### Opcija 2: eSIM Provajderi (Airalo, Holafly, Nomad)
Ukoliko Vaš telefon podržava eSIM (virtuelni SIM), ovo je najkomfornija opcija jer internet možete aktivirati pre nego što pređete granicu.
- **Prednosti**: Nema odlaska u prodavnice, nema menjanja fizičke kartice u telefonu. Kupuje se online preko aplikacije za par minuta.
- **Cena**: Airalo nudi pakete od 10 GB na 30 dana za oko 12-15 EUR. Holafly nudi pakete sa neograničenim internetom od 19 EUR pa naviše.
- **Savet**: Proverite specifikacije telefona da li podržava eSIM tehnologiju pre nego što kupite paket.`
  }
];

export default function BlogSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Sve');
  const [readingPost, setReadingPost] = useState(null);

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Sve' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="blog-layout animate-fade">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>Vodiči i Korisne Informacije o Grčkoj</h2>
        <p style={{ color: 'var(--text-muted)' }}>Sve vesti, saveti o putu, propisi i vodiči kroz najlepše plaže na jednom mestu.</p>
      </div>

      <div className="blog-controls">
        <input 
          type="text" 
          placeholder="Pretraži vodiče..." 
          className="blog-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="blog-categories">
          {['Sve', 'Rute', 'Plaže', 'Propisi', 'Saveti'].map(cat => (
            <button
              key={cat}
              className={`btn-blog-category ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="blog-grid">
          {filteredPosts.map(post => (
            <div key={post.id} className="blog-card" onClick={() => setReadingPost(post)}>
              <img src={post.image} alt={post.title} className="blog-card-img" />
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span className="blog-card-category">{post.category}</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer">
                  <span>Pročitaj vodič</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-listings animate-scale">
          <h3>Nema rezultata pretrage</h3>
          <p>Pokušajte sa nekim drugim ključnim rečima ili promenite kategoriju.</p>
        </div>
      )}

      {/* Blog Reading Modal Overlay */}
      {readingPost && (
        <div className="modal-overlay" onClick={() => setReadingPost(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <button className="btn-modal-close" onClick={() => setReadingPost(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div style={{ position: 'relative', height: '280px' }}>
              <img src={readingPost.image} alt={readingPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '2rem', right: '2rem', color: 'white' }}>
                <span className="modal-tag" style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>{readingPost.category}</span>
                <h2 style={{ color: 'white', marginTop: '0.8rem', fontSize: '1.8rem', lineHeight: '1.2' }}>{readingPost.title}</h2>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', marginTop: '0.5rem', opacity: '0.9' }}>
                  <span>Datum: {readingPost.date}</span>
                  <span>|</span>
                  <span>{readingPost.readTime}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '2.5rem', maxHeight: '55vh', overflowY: 'auto' }} className="modal-description">
              {/* Parse Markdown-like titles & bold text dynamically for beauty */}
              {readingPost.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('### ')) {
                  return <h3 key={index} style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>{paragraph.replace('### ', '')}</h3>;
                }
                if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                  return (
                    <div key={index} style={{ marginLeft: '1rem', marginBottom: '0.8rem' }}>
                      {paragraph.split('\n').map((line, lIdx) => (
                        <p key={lIdx} style={{ marginBottom: '0.3rem' }}>{line}</p>
                      ))}
                    </div>
                  );
                }
                return <p key={index} style={{ marginBottom: '1.2rem', fontSize: '1.02rem', lineHeight: '1.7' }}>{paragraph}</p>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
