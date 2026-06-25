import { useState, useEffect, useRef } from 'react';

const BLOG_POSTS = [
  {
    id: 'blog-1',
    title: 'Kolima do Grčke 2026: Kompletan vodič kroz rute i cene putarina',
    category: 'Rute',
    date: '15. Jun 2026',
    readTime: '6 min čitanja',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Detaljan izveštaj o putu za Grčku preko Severne Makedonije i Bugarske. Saznajte sve cene putarina, uslove na putevima i radno vreme graničnih prelaza za predstojeću sezonu.',
    likes: 142,
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
2. **Gorivo**: Najpovoljnije cene goriva su tradicionalno u Severnoj Makedoniji, pa planirajte dopunu rezroverara pre ulaska u Grčku.`
  },
  {
    id: 'blog-2',
    title: 'EES i ETIAS sistemi: Nova pravila za ulazak u Grčku i EU',
    category: 'Propisi',
    date: '10. Jun 2026',
    readTime: '5 min čitanja',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Sve što treba da znate o digitalnom evidentiranju putnika na granicama i online prijavama ETIAS koje stupaju na snagu ove godine.',
    likes: 85,
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
    likes: 196,
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
    likes: 74,
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
  },
  {
    id: 'blog-5',
    title: 'Cene trajekata u Grčkoj 2026: Vodič za ostrva (Tasos, Krf, Lefkada, Krit)',
    category: 'Rute',
    date: '22. Jun 2026',
    readTime: '7 min čitanja',
    image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Kompletan cenovnik brodskih karata za putnike i automobile u sezoni 2026. Saznajte cene za prelaz do Tasosa, Krfa i ostalih ostrva.',
    likes: 112,
    content: `Trajektni prevoz je nezaobilazan deo putovanja na grčka ostrva. Za sezonu 2026. brodari su korigovali cene karata. Donosimo Vam detaljan pregled ruta, cena i saveta za najpopularnije destinacije.

### Trajekti za Tasos (Keramoti - Limenas & Kavala - Prinos)
Ruta iz Keramotija je najpopularnija jer trajekt plovi kraće (oko 35-40 minuta) i polasci su znatno češći (na svakih 30-45 minuta tokom sezone).
- **Cena karte za odrasle**: 3.50 EUR u jednom pravcu.
- **Cena za decu (5-10 godina)**: 2.00 EUR.
- **Automobili do 4.25m**: 20.00 EUR u jednom pravcu.
- **Automobili preko 4.25m**: 24.00 EUR.
Ruta iz Kavale do Prinosa traje oko 1 sat i 15 minuta. Cena karte za odrasle je 6.50 EUR, dok je za automobile oko 28.00 - 32.00 EUR. Preporučuje se samo putnicima koji žele direktno na zapadnu stranu ostrva.

### Trajekti za Krf (Igumenica - Krf / Lefkimi)
Putovanje do grada Krfa (Kerkyra) traje oko 1 sat i 30 minuta. Do luke Lefkimi na jugu ostrva vožnja traje oko 1 sat.
- **Igumenica - Krf grad**: Karta za odrasle košta 10.00 EUR. Automobil u jednom pravcu iznosi 45.00 EUR.
- **Igumenica - Lefkimi**: Karta za odrasle iznosi 7.50 EUR, a za automobile oko 30.00 EUR. Ovo je odlična alternativa ako letujete u Kavosu, Moraitici ili Mesongiju.

### Kako rezervisati karte?
1. **Tasos**: Karte se kupuju isključivo na samom pristaništu (u biletarnici) pre ukrcavanja. Rezervacija unapred NIJE moguća i nije potrebna jer ima dovoljno polazaka.
2. **Krf i Krit**: Preporučuje se kupovina karata unapred putem platformi kao što su Ferryhopper ili direktno na sajtovima operatera (Minoan Lines, ANEK, Blue Star Ferries), posebno ako putujete vikendom u julu i avgustu.`
  },
  {
    id: 'blog-6',
    title: 'Grčka gastronomija: Najbolja tradicionalna jela i kako izbeći turističke zamke',
    category: 'Saveti',
    date: '18. Jun 2026',
    readTime: '9 min čitanja',
    image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Vodič kroz grčke ukuse: od girosa do sveže ribe. Otkrijte tajne lokalnih taverni i prepoznajte gde jedu lokalci.',
    likes: 245,
    content: `Grčka kuhinja je jedna od najzdravijih i najukusnijih na svetu, zasnovana na maslinovom ulju, svežem povrću, začinskom bilju i ribi. Međutim, u turističkim mestima je lako naići na preskupe restorane sa prosečnom hranom. Saznajte kako da doživite autentičnu Grčku na tanjiru.

### Top 5 jela koja morate probati
1. **Kleftiko (Jagnjetina u papiru)**: Sporo pečena jagnjetina sa krompirom, belim lukom i začinskim biljem. Meso se bukvalno raspada i topi u ustima.
2. **Mousaka**: Slojevi plavog patlidžana, krompira, dinstanog mlevenog mesa i bogatog bešamel sosa. Najbolja je kada malo odstoji nakon pečenja.
3. **Souvlaki i Gyros**: Grčki "brzi obroci". Suvlaki su komadići svinjskog ili pilećeg mesa na ražnjiću, dok je giros tanko sečeno meso sa roštilja, posluženo u pita hlebu sa tzatzikijem, paradajzom i lukom.
4. **Saganaki sa sirom**: Pohovani grčki sir (najčešće kefalotiri ili gravijera) koji se prži dok ne dobije zlatnu koricu, a unutra ostane mekan. Služi se pokapan limunovim sokom.
5. **Sveža riba i morski plodovi**: Lignje (kalamari), hobotnica na žaru (ohtapodi) i sveža orada (tsipoura). Najbolje ih je jesti u ribljim tavernama (Psarotaverna) koje se nalaze direktno na obali.

### Kako prepoznati autentičnu tavernu?
- **Pazite na "promotere"**: Ako vas promoter aktivno vuče unutra i nudi popuste na ulici, to je skoro uvek turistička zamka sa pregrejanom hranom. Autentične taverne imaju posla i bez toga.
- **Pogledajte ko sedi unutra**: Ako čujete grčki jezik i vidite lokalne porodice kako večeraju, na pravom ste mestu. Grci obično večeraju kasno, posle 21:00 ili 22:00 časa.
- **Papirni stolnjaci**: Tradicionalne taverne koriste jednostavne papirne stolnjake koje pričvršćuju štipaljkama za sto kako ih vetar ne bi odneo.
- **Domaće vino (Chima)**: Umesto skupih flaširanih vina, naručite domaće točeno vino u metalnim bokalima od pola litra ili litar. Veoma je povoljno i odličnog kvaliteta.`
  },
  {
    id: 'blog-7',
    title: 'Hitni kontakti i zdravstveno osiguranje u Grčkoj: Vodič za bezbedan odmor',
    category: 'Propisi',
    date: '14. Jun 2026',
    readTime: '5 min čitanja',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Sve važne informacije o dežurnim službama, zdravstvenim centrima i korišćenju putnog osiguranja u slučaju bolesti.',
    likes: 93,
    content: `Sigurnost na odmoru je na prvom mestu. Iako niko ne želi da razmišlja o zdravstvenim problemima tokom leta, važno je biti pripremljen. Saznajte kako funkcioniše zdravstveni sistem u Grčkoj i koji su najvažniji brojevi.

### Najvažniji hitni kontakti (Besplatni pozivi)
- **Jedinstveni evropski broj za hitne slučajeve**: 112 (radi na svim mrežama, čak i bez SIM kartice)
- **Policija**: 100
- **Hitna pomoć (EKAB)**: 166
- **Vatrogasci**: 199
- **Turistička policija**: 171 (pomoć turistima na nekoliko jezika, uključujući engleski)

### Kako aktivirati putno zdravstveno osiguranje?
Ukoliko se razbolite ili povredite tokom letovanja, pratite sledeće korake pre nego što odete kod lekara:
1. **Pozovite dežurni centar osiguranja**: Na poleđini Vaše polise nalazi se broj telefona (često sa Viber/WhatsApp opcijom). Pozovite ih i opišite problem. Oni će vas uputiti u najbližu državnu kliniku ili kod privatnog lekara sa kojim imaju ugovor.
2. **Direktno plaćanje ili refundacija**: Ako odete kod lekara kojeg je odobrilo osiguranje, nećete plaćati ništa na licu mesta. Ako odete samoinicijativno, moraćete sami da platite pregled, pa obavezno sačuvajte sve račune i medicinske izveštaje kako biste refundirali novac po povratku kući.
3. **Državni zdravstveni centri (Kentro Ygias)**: U manjim mestima i na ostrvima postoje državne ambulante gde su osnovni pregledi i hitna pomoć najčešće besplatni za sve hitne slučajeve.`
  },
  {
    id: 'blog-8',
    title: 'Lista za pakovanje za Grčku: Šta obavezno poneti, a šta možete kupiti tamo',
    category: 'Saveti',
    date: '08. Jun 2026',
    readTime: '6 min čitanja',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80',
    excerpt: 'Detaljan podsetnik za pakovanje: od putne apoteke do opreme za plažu. Saznajte kako da se spakujete pametno.',
    likes: 153,
    content: `Pakovanje za more često izaziva stres i dovodi do pretrpanih kofera punih stvari koje nikada nećete obući ili iskoristiti. Ključ je u pametnoj organizaciji. Saznajte šta je neophodno spakovati, a šta možete bez problema nabaviti na licu mesta.

### Dokumenta i finansije (Obavezno u ručnom prtljagu)
- **Pasoši** (proverite da li važe najmanje 3 meseca nakon planiranog datuma povratka).
- **Vozačka dozvola** i saobraćajna dozvola.
- **Polisa putnog zdravstvenog osiguranja** (štampana verzija).
- **Novac**: Ponesite dovoljno gotovine u evrima. U manjim mestima i tavernama na plaži kartice često nisu prihvaćene, iako je po zakonu obavezno posedovanje POS terminala.

### Putna apoteka (Najbolje poneti sa sobom)
Grčke apoteke su odlično opremljene, ali je lakše imati prvu pomoć pri ruci, posebno ako putujete sa decom:
- **Lekovi za snižavanje temperature i bolove** (Paracetamol, Ibuprofen).
- **Probiotik** (počnite da ga pijete 3 dana pre puta).
- **Lekovi protiv alergija** (antihistaminici).
- **Sredstva protiv komaraca** (repelenti u spreju i tablete za aparat u sobi).
- **Flasteri i antiseptik** (za sitne ogrebotine).

### Šta kupiti u Grčkoj (Da uštedite prostor u koferu)?
- **Sredstva za sunčanje i kozmetika**: Veliki lanci supermarketa (Lidl, Masoutis) nude kvalitetne kreme za sunčanje po znatno nižim cenama nego apoteke u turističkim zonama.
- **Oprema za plažu**: Suncobrani, asure, prostirke i papuče za šljunak se prodaju na svakom ćošku po cenama od 5 do 15 EUR. Često je jeftinije kupiti ih tamo nego nositi i plaćati dodatni prtljag u avionu.`
  }
];

export default function BlogSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Sve');
  const [readingPost, setReadingPost] = useState(null);

  const [savedPosts, setSavedPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('saved_guides') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [likedPosts, setLikedPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('liked_guides') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const modalContentRef = useRef(null);

  const handleModalScroll = () => {
    const el = modalContentRef.current;
    if (!el) return;
    const totalHeight = el.scrollHeight - el.clientHeight;
    if (totalHeight <= 0) {
      setScrollProgress(100);
      return;
    }
    const progress = (el.scrollTop / totalHeight) * 100;
    setScrollProgress(progress);
  };

  useEffect(() => {
    const el = modalContentRef.current;
    if (el) {
      el.addEventListener('scroll', handleModalScroll);
      handleModalScroll();
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', handleModalScroll);
      }
    };
  }, [readingPost]);

  const toggleBookmark = (postId, e) => {
    e.stopPropagation();
    let updated;
    if (savedPosts.includes(postId)) {
      updated = savedPosts.filter(id => id !== postId);
    } else {
      updated = [...savedPosts, postId];
    }
    setSavedPosts(updated);
    localStorage.setItem('saved_guides', JSON.stringify(updated));
  };

  const toggleLike = (postId, e) => {
    e.stopPropagation();
    let updated;
    if (likedPosts.includes(postId)) {
      updated = likedPosts.filter(id => id !== postId);
    } else {
      updated = [...likedPosts, postId];
    }
    setLikedPosts(updated);
    localStorage.setItem('liked_guides', JSON.stringify(updated));
  };

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Sve' || 
                            (selectedCategory === '🔖 Sačuvano' ? savedPosts.includes(post.id) : post.category === selectedCategory);
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
          {['Sve', 'Rute', 'Plaže', 'Propisi', 'Saveti', '🔖 Sačuvano'].map(cat => (
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
            <div key={post.id} className="blog-card" onClick={() => setReadingPost(post)} style={{ position: 'relative' }}>
              <div style={{ position: 'relative', overflow: 'hidden', height: '180px' }}>
                <img src={post.image} alt={post.title} className="blog-card-img" style={{ transition: 'transform 0.3s ease' }} />
                <button 
                  className={`blog-card-bookmark-btn ${savedPosts.includes(post.id) ? 'saved' : ''}`}
                  onClick={(e) => toggleBookmark(post.id, e)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: savedPosts.includes(post.id) ? 'var(--primary)' : 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10
                  }}
                  title={savedPosts.includes(post.id) ? "Ukloni iz sačuvanih" : "Sačuvaj vodič"}
                >
                  🔖
                </button>
              </div>
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span className="blog-card-category">{post.category}</span>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <div className="blog-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span>Pročitaj vodič</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                  <button 
                    className={`blog-card-like-btn ${likedPosts.includes(post.id) ? 'liked' : ''}`}
                    onClick={(e) => toggleLike(post.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: likedPosts.includes(post.id) ? '#ff4757' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: likedPosts.includes(post.id) ? 'rgba(255, 71, 87, 0.1)' : 'transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{likedPosts.includes(post.id) ? '❤️' : '🤍'}</span>
                    <span>{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                  </button>
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
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', position: 'relative' }}>
            {/* Reading Progress Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              zIndex: 100,
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${scrollProgress}%`,
                height: '100%',
                background: 'linear-gradient(to right, #00f2fe, var(--primary))',
                transition: 'width 0.1s ease-out'
              }}></div>
            </div>

            <button className="btn-modal-close" onClick={() => setReadingPost(null)} style={{ zIndex: 110 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div style={{ position: 'relative', height: '280px' }}>
              <img src={readingPost.image} alt={readingPost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '2rem', right: '2rem', color: 'white', zIndex: 10, width: 'calc(100% - 4rem)' }}>
                <span className="modal-tag" style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>{readingPost.category}</span>
                <h2 style={{ color: 'white', marginTop: '0.8rem', fontSize: '1.8rem', lineHeight: '1.2' }}>{readingPost.title}</h2>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', marginTop: '0.5rem', opacity: '0.9', alignItems: 'center', width: '100%' }}>
                  <span>Datum: {readingPost.date}</span>
                  <span>|</span>
                  <span>{readingPost.readTime}</span>
                  
                  <span style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
                    <button 
                      onClick={(e) => toggleLike(readingPost.id, e)}
                      style={{
                        background: likedPosts.includes(readingPost.id) ? 'rgba(255, 71, 87, 0.25)' : 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{likedPosts.includes(readingPost.id) ? '❤️' : '🤍'}</span>
                      <span>{readingPost.likes + (likedPosts.includes(readingPost.id) ? 1 : 0)}</span>
                    </button>
                    <button 
                      onClick={(e) => toggleBookmark(readingPost.id, e)}
                      style={{
                        background: savedPosts.includes(readingPost.id) ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>🔖</span>
                      <span>{savedPosts.includes(readingPost.id) ? 'Sačuvano' : 'Sačuvaj'}</span>
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div ref={modalContentRef} style={{ padding: '2.5rem', maxHeight: '55vh', overflowY: 'auto' }} className="modal-description">
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
            
              {/* Legal Disclaimer Box */}
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(230, 57, 70, 0.05)', borderLeft: '4px solid var(--danger)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>⚠️ Odricanje odgovornosti (Disclaimer):</strong> Svi saveti, rute i informacije navedene u ovom vodiču služe isključivo u informativne svrhe. Podaci o cenama, dokumentaciji i prelazima su podložni promenama. Ellinas portal ne preuzima pravnu odgovornost za situacije nastale na osnovu korišćenja ovih informacija. Pre putovanja uvek zvanično potvrdite informacije kod nadležnih institucija i dežurnih službi.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
