
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Megamenu from './components/Megamenu';
import LandingPage from './components/LandingPage';
import Hero from './components/Hero';
import Filters from './components/Filters';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import HostPanel from './components/HostPanel';
import BlogSection from './components/BlogSection';
import ForumSection, { INITIAL_FORUM_POSTS } from './components/ForumSection';
import AlertsSection from './components/AlertsSection';
import AuthModal from './components/AuthModal';
import ProfileTab from './components/ProfileTab';
import TravelGuide from './components/TravelGuide';
import InteractiveMap from './components/InteractiveMap';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Initial Mock Data
const INITIAL_PROPERTIES = [
  {
    id: 1,
    title: 'Kamena Vila Horizon Lefkada',
    type: 'Vila',
    location: 'Lefkada',
    price: 125,
    rating: 4.9,
    distanceToBeach: 150,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    guests: 6,
    bedrooms: 3,
    description: 'Tradicionalna kamena vila sa privatnim bazenom, modernim enterijerom i panoramskim pogledom na Jonsko more. Smeštena je u mirnom brdovitom predelu, na samo 3 minuta vožnje od poznate plaže Katizma. Vila ima prostranu terasu, spoljni roštilj i potpuno opremljenu kuhinju.',
    amenities: {
      wifi: true,
      pool: true,
      beachfront: false,
      parking: true,
      airConditioning: true,
      pets: true
    },
    reviews: [
      { author: 'Nikola M.', rating: 5.0, comment: 'Pogled sa terase je nestvaran! Bazen je izuzetno čist, a domaćin nas je sačekao sa domaćim vinom.' },
      { author: 'Jelena K.', rating: 4.8, comment: 'Predivna i prostrana vila. Tiho i mirno okruženje, idealno za odmor sa porodicom.' }
    ],
    rooms: [
      { id: 101, propertyId: 1, title: 'Standardna Trokrevetna Soba', price: 95, guests: 3, bedrooms: 1, image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', description: 'Standardna soba sa pogledom na planinu i jednim francuskim krevetom.' },
      { id: 102, propertyId: 1, title: 'Deluxe Apartman sa pogledom na more', price: 125, guests: 4, bedrooms: 2, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', description: 'Luksuzan dvosobni apartman sa sopstvenim balkonom i velikom kadom.' },
      { id: 103, propertyId: 1, title: 'Predsednički Dupleks sa terasom', price: 180, guests: 6, bedrooms: 3, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', description: 'Najekskluzivniji smeštaj u vili na dva nivoa sa đakuzijem na terasi.' }
    ]
  },
  {
    id: 2,
    title: 'Apartmani Golden Beach Thassos',
    type: 'Apartman',
    location: 'Tasos',
    price: 55,
    rating: 4.7,
    distanceToBeach: 20,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    guests: 4,
    bedrooms: 1,
    description: 'Moderno opremljeni apartmani na samoj obali mora na čuvenoj Zlatnoj plaži na Tasosu. Zakoračite direktno iz dvorišta na pesak. Svaki apartman poseduje privatni balkon sa pogledom na more, čajnu kuhinju i besplatne ležaljke na plaži ispred objekta.',
    amenities: {
      wifi: true,
      pool: false,
      beachfront: true,
      parking: true,
      airConditioning: true,
      pets: false
    },
    reviews: [
      { author: 'Marko S.', rating: 5.0, comment: 'Lokacija je bez premca! Doručak na balkonu uz šum talasa je nešto neprocenjivo.' },
      { author: 'Milica P.', rating: 4.4, comment: 'Veoma uredno i čisto. Blizu su restorani i supermarketi. Topla preporuka!' }
    ],
    rooms: [
      { id: 201, propertyId: 2, title: 'Jednosoban Apartman (Prizemlje)', price: 45, guests: 3, bedrooms: 1, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', description: 'Jednostavan porodični apartman u prizemlju sa direktnim izlazom u dvorište.' },
      { id: 202, propertyId: 2, title: 'Studio sa pogledom na more (Sprat)', price: 55, guests: 2, bedrooms: 1, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', description: 'Romantičan studio za parove sa prelepim pogledom na more sa balkona.' }
    ]
  },
  {
    id: 3,
    title: 'Aegean Pearl Premium Resort',
    type: 'Hotel',
    location: 'Krit',
    price: 195,
    rating: 4.8,
    distanceToBeach: 50,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    guests: 3,
    bedrooms: 1,
    description: 'Luksuzni hotel sa 5 zvezdica, bogatim doručkom, sopstvenom privatnom plažom i velikim infinity bazenom. Nalazi se na pešačelom udaljenosti od šarmantnog starog grada. Nudimo spa centar, teretanu i vrhunski restoran mediteranske kuhinje.',
    amenities: {
      wifi: true,
      pool: true,
      beachfront: true,
      parking: true,
      airConditioning: true,
      pets: true
    },
    reviews: [
      { author: 'Petar Z.', rating: 5.0, comment: 'Vrhunska usluga i neverovatno osoblje. Spa centar je odličan.' },
      { author: 'Anja V.', rating: 4.6, comment: 'Hrana u restoranu je fantastična. Sobe su prostrane i luksuzne.' }
    ],
    rooms: [
      { id: 301, propertyId: 3, title: 'Standard Room (Bez balkona)', price: 140, guests: 2, bedrooms: 1, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', description: 'Udobna standardna soba, idealna za kraće boravke.' },
      { id: 302, propertyId: 3, title: 'Superior Sea View Room', price: 195, guests: 3, bedrooms: 1, image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', description: 'Komforna soba na višim spratovima sa frontalnim pogledom na Egejsko more.' }
    ]
  },
  {
    id: 4,
    title: 'Porodični Apartman Maria Kassandra',
    type: 'Apartman',
    location: 'Kasandra',
    price: 45,
    rating: 4.5,
    distanceToBeach: 450,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    guests: 4,
    bedrooms: 2,
    description: 'Komforan i povoljan porodični apartman u mirnom delu Pefkohorija, idealan za porodice sa decom. Poseduje veliku ograđenu terasu u hladovini, kompletno opremljenu kuhinju sa velikim frižiderom i privatno parking mesto.',
    amenities: {
      wifi: true,
      pool: false,
      beachfront: false,
      parking: true,
      airConditioning: true,
      pets: false
    },
    reviews: [
      { author: 'Dragan D.', rating: 4.5, comment: 'Odličan odnos cene i kvaliteta. Domaćica Maria je izuzetno prijatna žena.' }
    ],
    rooms: [
      { id: 401, propertyId: 4, title: 'Apartman sa jednom spavaćom sobom', price: 35, guests: 3, bedrooms: 1, image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', description: 'Povoljan apartman za manju porodicu, opremljen čajnom kuhinjom.' },
      { id: 402, propertyId: 4, title: 'Porodični dvosobni apartman', price: 45, guests: 5, bedrooms: 2, image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80', description: 'Veliki prostrani apartman sa dve spavaće sobe i terasom.' }
    ]
  },
  {
    id: 5,
    title: 'Vila Blue Wave Nikiti Sitonija',
    type: 'Vila',
    location: 'Sitonija',
    price: 155,
    rating: 4.9,
    distanceToBeach: 80,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    guests: 8,
    bedrooms: 4,
    description: 'Luksuzna i prostrana vila za veće grupe i porodice, na samo par koraka od prelepe peščane plaže u Nikitiju. Vila ima lepo uređeno travnato dvorište, spoljni tuš, garnituru za sedenje i ležaljke. Sve sobe su klimatizovane.',
    amenities: {
      wifi: true,
      pool: false,
      beachfront: true,
      parking: true,
      airConditioning: true,
      pets: true
    },
    reviews: [
      { author: 'Jovan J.', rating: 5.0, comment: 'Kuća je savršena za dve porodice sa decom. Dvorište je bezbedno i prelepo.' }
    ],
    rooms: [
      { id: 501, propertyId: 5, title: 'Četvorokrevetni apartman', price: 120, guests: 4, bedrooms: 2, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', description: 'Komforan apartman sa dve spavaće sobe, idealan za dve porodice.' },
      { id: 502, propertyId: 5, title: 'Deluxe Vila na plaži', price: 155, guests: 8, bedrooms: 4, image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80', description: 'Cela kuća sa sopstvenim dvorištem na samoj peščanoj plaži.' }
    ]
  },
  {
    id: 6,
    title: 'Hotel Paradise View Athos',
    type: 'Hotel',
    location: 'Halkidiki',
    price: 90,
    rating: 4.6,
    distanceToBeach: 300,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    guests: 2,
    bedrooms: 1,
    description: 'Udoban hotel u blizini Svete Gore i grada Uranopolisa sa prelepim panoramskim pogledom na ostrvo Amuljani. Nudi bogat doručak na bazi švedskog stola, bazen u sklopu hotela i bar pored bazena sa osvežavajućim koktelima.',
    amenities: {
      wifi: true,
      pool: true,
      beachfront: false,
      parking: true,
      airConditioning: true,
      pets: false
    },
    reviews: [
      { author: 'Stefan R.', rating: 4.6, comment: 'Jako lepe i čiste sobe, pogled na more sa terase oduzima dah.' }
    ],
    rooms: [
      { id: 601, propertyId: 6, title: 'Double Standard Room', price: 80, guests: 2, bedrooms: 1, image: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80', description: 'Dvokrevetna soba sa bračnim krevetom ili dva odvojena ležaja.' },
      { id: 602, propertyId: 6, title: 'Triple Superior Room', price: 90, guests: 3, bedrooms: 1, image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80', description: 'Soba sa bračnim krevetom i jednim pomoćnim krevetom sa pogledom na bazen.' }
    ]
  }
];

const DEFAULT_DESTINATIONS = ['Lefkada', 'Tasos', 'Krit', 'Kasandra', 'Sitonija', 'Halkidiki'];
const PROPERTY_TYPES = ['Apartman', 'Vila', 'Hotel'];

// Default Registered Test User
const DEFAULT_USERS = [
  {
    id: 999,
    username: 'stefan',
    fullName: 'Stefan Petrović',
    email: 'stefan@email.com',
    password: 'password',
    phone: '+381 60 123 4567',
    avatar: 'https://ui-avatars.com/api/?name=Stefan+Petrovic&background=0a4f70&color=fff',
    isAdmin: true
  },
  {
    id: 1000,
    username: 'vlasnik_aura',
    fullName: 'Vlasnik Aura',
    email: 'voxilityy@gmail.com',
    password: 'google-oauth-simulated',
    phone: '+381 60 111 2233',
    avatar: 'https://ui-avatars.com/api/?name=Vlasnik+Aura&background=00b4d8&color=fff',
    isAdmin: true,
    isGoogleUser: true
  }
];

// Default Mock Inquiries for Stefan
const DEFAULT_INQUIRIES = [
  {
    id: 888,
    userId: 999,
    propertyId: 2,
    dates: '15. Jul - 25. Jul',
    nights: 10,
    guests: 4,
    totalPrice: 580,
    status: 'Odobreno',
    message: 'Dobar dan, slali smo upit za apartman, radujemo se dolasku!'
  }
];

export default function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // App Navigation Tab
  const [activeTab, setActiveTab] = useState(() => {
    if (window.location.pathname === '/aura-vlasnik') {
      const savedUser = localStorage.getItem('currentUser');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      if (parsedUser && parsedUser.isAdmin) {
        return 'host';
      }
    }
    return 'listings';
  });

  const handleTabChange = (tabName) => {
    setSelectedProperty(null);
    setActiveTab(tabName);
    if (tabName === 'listings') {
      setIsSearchActive(false);
      setSearchFilters({
        destination: 'all',
        priceCategory: 'all',
        type: 'all',
        checkIn: '',
        checkOut: ''
      });
      setActivePills([]);
    }
  };

  // 9-dot grid launcher menu state
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);

  const handleSelectDestination = (destName) => {
    setSearchFilters(prev => ({ 
      ...prev, 
      destination: destName 
    }));
    setActiveTab('listings');
    setSelectedProperty(null);
    setIsGridMenuOpen(false);
    setIsSearchActive(true);
    setTimeout(() => {
      const listingsEl = document.getElementById('listings-section');
      if (listingsEl) {
        listingsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSelectCategory = (catId) => {
    if (['first_line', 'pool', 'pets', 'premium', 'budget'].includes(catId)) {
      setActivePills(prev => {
        if (prev.includes(catId)) {
          return prev.filter(id => id !== catId);
        } else {
          return [...prev, catId];
        }
      });
    } else if (catId === 'Apartman' || catId === 'Hotel') {
      setSearchFilters(prev => ({ 
        ...prev, 
        type: prev.type === catId ? 'all' : catId 
      }));
    } else if (catId === 'Hrvatska') {
      alert('Hrvatska letovanja dolaze uskoro na GrčkaAura! Trenutno smo specijalizovani za Grčku.');
    }
    setActiveTab('listings');
    setSelectedProperty(null);
    setIsGridMenuOpen(false);
    setIsSearchActive(true);
    setTimeout(() => {
      const listingsEl = document.getElementById('listings-section');
      if (listingsEl) {
        listingsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Close grid menu on outside click or ESC key
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Proveri da li klik potiče od samog grid launcher dugmeta ili unutar megamenija
      if (e.target.closest('.grid-launcher-btn') || e.target.closest('.mega-panel')) return;
      setIsGridMenuOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsGridMenuOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // View Mode: 'list' (default) or 'map'
  const [viewMode, setViewMode] = useState('list');

  // State for showing fake 404 error page (stealth routing)
  const [isFake404Active, setIsFake404Active] = useState(() => {
    if (window.location.pathname === '/aura-vlasnik' || window.location.pathname === '/panel') {
      const savedUser = localStorage.getItem('currentUser');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      if (!parsedUser || !parsedUser.isAdmin) {
        return true;
      }
    }
    return false;
  });

  // Listings State
  const [properties, setProperties] = useState(() => {
    const saved = localStorage.getItem('properties');
    return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
  });

  // Set max price limit to 1000 for the filter slider
  const maxPriceLimit = 1000;

  // Wishlist State (list of IDs)
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Registered Users State
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(u => (u.email === 'stefan@email.com' || u.email === 'stefan.petrovic@gmail.com' || u.email === 'voxilityy@gmail.com') ? { ...u, isAdmin: true } : u);
    }
    return DEFAULT_USERS;
  });

  // Current Logged-in User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email === 'stefan@email.com' || parsed.email === 'stefan.petrovic@gmail.com' || parsed.email === 'voxilityy@gmail.com') {
        return { ...parsed, isAdmin: true };
      }
      return parsed;
    }
    return null;
  });

  // Booking Inquiries State
  const [inquiries, setInquiries] = useState(() => {
    const saved = localStorage.getItem('inquiries');
    return saved ? JSON.parse(saved) : DEFAULT_INQUIRIES;
  });

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Activity logs state (Audit Log)
  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('activityLogs');
    return saved ? JSON.parse(saved) : [];
  });

  // Forum Posts State
  const [forumPosts, setForumPosts] = useState(() => {
    const saved = localStorage.getItem('forumPosts');
    return saved ? JSON.parse(saved) : INITIAL_FORUM_POSTS;
  });

  // Comparison State (list of IDs, maximum 3)
  const [comparedIds, setComparedIds] = useState([]);
  const [isCompareMatrixOpen, setIsCompareMatrixOpen] = useState(false);

  // Derived unique destinations dynamically from properties currently in the system, plus default ones
  const derivedDestinations = Array.from(new Set([
    ...DEFAULT_DESTINATIONS,
    ...properties.map(p => p.location)
  ].filter(Boolean)));

  // Search state active
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Search Filters (from Hero)
  const [searchFilters, setSearchFilters] = useState({
    destination: 'all',
    priceCategory: 'all',
    type: 'all',
    checkIn: '',
    checkOut: ''
  });

  // Advanced Sidebar Filters
  const [filters, setFilters] = useState({
    maxPrice: null, // null means "not set" (defaults to maxPriceLimit)
    maxDistance: 1200,
    amenities: {
      wifi: false,
      pool: false,
      beachfront: false,
      parking: false,
      airConditioning: false,
      pets: false
    }
  });

  // Sorting
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended', 'priceLow', 'priceHigh', 'beachNearest'

  // Quick Filter Pills State
  const [activePills, setActivePills] = useState([]);

  const toggleQuickFilter = (pillId) => {
    setActivePills(prev => {
      if (prev.includes(pillId)) {
        return prev.filter(id => id !== pillId);
      } else {
        return [...prev, pillId];
      }
    });
  };

  // Selected Property for Details Modal
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [backendActive, setBackendActive] = useState(false);

  const handleRefreshDatabase = async () => {
    try {
      const resProps = await fetch(`${API_URL}/api/properties`);
      const dataProps = await resProps.json();
      setProperties(dataProps);

      const resUsers = await fetch(`${API_URL}/api/users`);
      const dataUsers = await resUsers.json();
      setUsers(dataUsers);

      const resInqs = await fetch(`${API_URL}/api/inquiries`);
      const dataInqs = await resInqs.json();
      setInquiries(dataInqs);

      const resLogs = await fetch(`${API_URL}/api/activity-logs`);
      const dataLogs = await resLogs.json();
      setActivityLogs(dataLogs);

      const resPosts = await fetch(`${API_URL}/api/forum-posts`);
      const dataPosts = await resPosts.json();
      setForumPosts(dataPosts);
      
      setBackendActive(true);
      console.log('Ažurirani podaci sa backend servera!');
    } catch (err) {
      console.error('Greška pri osvežavanju baze:', err);
    }
  };

  useEffect(() => {
    // Fetch initial data from backend
    const fetchData = async () => {
      try {
        const resProps = await fetch(`${API_URL}/api/properties`);
        if (!resProps.ok) throw new Error();
        const dataProps = await resProps.json();
        setProperties(dataProps);

        const resUsers = await fetch(`${API_URL}/api/users`);
        const dataUsers = await resUsers.json();
        setUsers(dataUsers);

        const resInqs = await fetch(`${API_URL}/api/inquiries`);
        const dataInqs = await resInqs.json();
        setInquiries(dataInqs);

        const resLogs = await fetch(`${API_URL}/api/activity-logs`);
        const dataLogs = await resLogs.json();
        setActivityLogs(dataLogs);

        const resPosts = await fetch(`${API_URL}/api/forum-posts`);
        const dataPosts = await resPosts.json();
        setForumPosts(dataPosts);

        setBackendActive(true);
        console.log('Uspostavljena veza sa pravim backend serverom!');
      } catch (err) {
        console.warn('Backend server nije aktivan. Aplikacija radi u lokalnom offline režimu (localStorage).');
        setBackendActive(false);
      }
    };
    fetchData();
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Sync URL for Admin Panel
  useEffect(() => {
    if (activeTab === 'host') {
      if (currentUser && currentUser.isAdmin) {
        setIsFake404Active(false);
        if (window.location.pathname !== '/aura-vlasnik') {
          window.history.pushState({}, '', '/aura-vlasnik');
        }
      } else {
        // If not admin, show fake 404
        setIsFake404Active(true);
        window.history.pushState({}, '', '/aura-vlasnik');
      }
    } else {
      if (window.location.pathname === '/aura-vlasnik' || window.location.pathname === '/panel') {
        if (currentUser && currentUser.isAdmin) {
          // If admin, reset to / when navigating away from host tab
          window.history.pushState({}, '', '/');
        } else {
          setIsFake404Active(true);
        }
      }
    }
  }, [activeTab, currentUser]);

  // Listen to popstate event (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      setSelectedProperty(null);
      if (window.location.pathname === '/aura-vlasnik' || window.location.pathname === '/panel') {
        const savedUser = localStorage.getItem('currentUser');
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        if (parsedUser && parsedUser.isAdmin) {
          setIsFake404Active(false);
          setActiveTab('host');
        } else {
          setIsFake404Active(true);
        }
      } else {
        setIsFake404Active(false);
        setActiveTab(prev => prev === 'host' ? 'listings' : prev);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  // Sync Properties to localStorage
  useEffect(() => {
    localStorage.setItem('properties', JSON.stringify(properties));
    if (selectedProperty) {
      const updated = properties.find(p => p.id === selectedProperty.id);
      if (updated) setSelectedProperty(updated);
    }
  }, [properties]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync Users to localStorage
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Sync Current User to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Sync Inquiries to localStorage
  useEffect(() => {
    localStorage.setItem('inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  // Sync Forum Posts to localStorage
  useEffect(() => {
    if (forumPosts) {
      localStorage.setItem('forumPosts', JSON.stringify(forumPosts));
    }
  }, [forumPosts]);

  // Sync Activity Logs to localStorage
  useEffect(() => {
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Activity Logger Helper
  const logActivity = async (user, action, type) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('sr-RS') + ' u ' + now.toLocaleTimeString('sr-RS', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const userDisplay = user 
      ? `${user.fullName} (${user.email})` 
      : 'Neprijavljeni Gost';

    const newLog = {
      timestamp: formattedDate,
      user: userDisplay,
      action: action,
      type: type // 'create', 'delete', 'auth', 'inquiry', 'update'
    };

    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/activity-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLog)
        });
        const saved = await res.json();
        setActivityLogs(prev => [saved, ...prev]);
      } catch (err) {
        console.error('Greška pri beleženju aktivnosti:', err);
      }
    } else {
      const localLog = { ...newLog, id: Date.now() };
      setActivityLogs(prev => [localLog, ...prev]);
    }
  };
  // Auth Operations
  const handleRegister = async (newUser) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Greška pri registraciji.');
        }
        const data = await res.json();
        const registered = data.user;
        localStorage.setItem('authToken', data.token);
        setUsers(prev => [...prev, registered]);
        setCurrentUser(registered);
        setIsAuthModalOpen(false);
        handleTabChange('profile');
        logActivity(registered, `Registrovan novi nalog na portalu.`, 'auth');
      } catch (err) {
        throw err;
      }
    } else {
      const isAdminEmail = newUser.email === 'stefan@email.com' || newUser.email === 'stefan.petrovic@gmail.com' || newUser.email === 'voxilityy@gmail.com';
      const updatedUser = isAdminEmail ? { ...newUser, isAdmin: true } : newUser;
      setUsers(prev => [...prev, updatedUser]);
      setCurrentUser(updatedUser);
      setIsAuthModalOpen(false);
      handleTabChange('profile');
      logActivity(updatedUser, `Registrovan novi nalog na portalu.`, 'auth');
    }
  };

  const handleLogin = async (loginData) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginData.email, password: loginData.password })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Pogrešan e-mail ili lozinka.');
        }
        const data = await res.json();
        const loggedInUser = data.user;
        localStorage.setItem('authToken', data.token);
        setCurrentUser(loggedInUser);
        setIsAuthModalOpen(false);
        if (loggedInUser.isAdmin) {
          setIsFake404Active(false);
          handleTabChange('host');
          logActivity(loggedInUser, `Administrator se prijavio na sistem (JWT).`, 'auth');
        } else {
          handleTabChange('profile');
          logActivity(loggedInUser, `Korisnik se prijavio na sistem (JWT).`, 'auth');
        }
      } catch (err) {
        throw err;
      }
    } else {
      const user = users.find(
        u => u.email.toLowerCase() === loginData.email.toLowerCase().trim() && u.password === loginData.password
      );
      if (!user) {
        throw new Error('Pogrešan e-mail ili lozinka.');
      }
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      if (user.isAdmin) {
        setIsFake404Active(false);
        handleTabChange('host');
        logActivity(user, `Administrator se prijavio na sistem.`, 'auth');
      } else {
        handleTabChange('profile');
        logActivity(user, `Korisnik se prijavio na sistem.`, 'auth');
      }
    }
  };

  const handleLogout = () => {
    const userSnapshot = currentUser;
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    setIsFake404Active(false);
    handleTabChange('listings');
    if (userSnapshot) {
      logActivity(userSnapshot, `Korisnik se odjavio sa sistema.`, 'auth');
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/users/${updatedUser.id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(updatedUser)
        });
        const saved = await res.json();
        setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
        setCurrentUser(saved);
        logActivity(saved, `Korisnik je izmenio podatke na svom profilu.`, 'update');
      } catch (err) {
        console.error('Greška pri ažuriranju korisnika:', err);
      }
    } else {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      logActivity(updatedUser, `Korisnik je izmenio podatke na svom profilu.`, 'update');
    }
  };

  // Inquiry Operations
  const handleAddInquiry = async (newInquiry) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/inquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInquiry)
        });
        const saved = await res.json();
        setInquiries(prev => [saved, ...prev]);
        const prop = properties.find(p => p.id === saved.propertyId);
        const propTitle = prop ? prop.title : 'nepoznat smeštaj';
        logActivity(currentUser, `Poslat novi rezervacioni upit za smeštaj "${propTitle}" (${saved.dates}, ukupna cena: ${saved.totalPrice}€).`, 'inquiry');
      } catch (err) {
        console.error(err);
      }
    } else {
      setInquiries(prev => [newInquiry, ...prev]);
      const prop = properties.find(p => p.id === newInquiry.propertyId);
      const propTitle = prop ? prop.title : 'nepoznat smeštaj';
      logActivity(currentUser, `Poslat novi rezervacioni upit za smeštaj "${propTitle}" (${newInquiry.dates}, ukupna cena: ${newInquiry.totalPrice}€).`, 'inquiry');
    }
  };

  const handleCancelInquiry = async (inquiryId) => {
    const inq = inquiries.find(i => i.id === inquiryId);
    const prop = properties.find(p => p.id === inq?.propertyId);
    const propTitle = prop ? prop.title : 'nepoznat smeštaj';
    
    if (backendActive) {
      try {
        await fetch(`${API_URL}/api/inquiries/${inquiryId}`, { method: 'DELETE' });
        setInquiries(prev => prev.filter(inq => inq.id !== inquiryId));
        logActivity(currentUser, `Otkazan upit za smeštaj "${propTitle}" (${inq.dates}).`, 'delete');
      } catch (err) {
        console.error(err);
      }
    } else {
      setInquiries(prev => prev.filter(inq => inq.id !== inquiryId));
      if (inq) {
        logActivity(currentUser, `Otkazan upit za smeštaj "${propTitle}" (${inq.dates}).`, 'delete');
      }
    }
  };

  // Handle Add New Property (from HostPanel)
  const handleAddProperty = async (newProperty) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/properties`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(newProperty)
        });
        const saved = await res.json();
        setProperties(prev => [saved, ...prev]);
        handleTabChange('listings');
        logActivity(currentUser, `Dodat novi smeštaj u ponudu: ${saved.title}.`, 'create');
      } catch (err) {
        console.error(err);
      }
    } else {
      setProperties(prev => [newProperty, ...prev]);
      handleTabChange('listings');
      logActivity(currentUser, `Dodat novi smeštaj u ponudu: ${newProperty.title} (${newProperty.location}).`, 'create');
    }
  };

  // Handle Delete Property
  const handleDeleteProperty = async (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    if (backendActive) {
      try {
        await fetch(`${API_URL}/api/properties/${propertyId}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        logActivity(currentUser, `Obrisan smeštaj iz baze: ${property.title}.`, 'delete');
      } catch (err) {
        console.error(err);
      }
    } else {
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      logActivity(currentUser, `Obrisan smeštaj iz baze: ${property.title} (${property.location}).`, 'delete');
    }
  };

  // Handle Toggle Admin Status (Grant/Revoke Admin Rights)
  const handleToggleAdminStatus = async (userId) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    if (targetUser.email === 'voxilityy@gmail.com') {
      alert('Nije moguće izmeniti ulogu glavnog vlasnika (Gazde).');
      return;
    }

    if (backendActive) {
      try {
        const newRole = !targetUser.isAdmin;
        await fetch(`${API_URL}/api/users/${userId}/role`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ isAdmin: newRole })
        });
        setUsers(prev => prev.map(u => {
          if (u.id === userId) {
            const updated = { ...u, isAdmin: newRole };
            logActivity(currentUser, `${updated.isAdmin ? 'Dodela' : 'Oduzimanje'} administratorskih prava korisniku ${updated.fullName}.`, 'update');
            if (currentUser && currentUser.id === userId) {
              setCurrentUser(updated);
            }
            return updated;
          }
          return u;
        }));
      } catch (err) {
        console.error(err);
      }
    } else {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updated = { ...u, isAdmin: !u.isAdmin };
          logActivity(currentUser, `${updated.isAdmin ? 'Dodela' : 'Oduzimanje'} administratorskih prava korisniku ${updated.fullName} (${updated.email}).`, 'update');
          if (currentUser && currentUser.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      }));
    }
  };

  // Handle Update Inquiry Status (Approve/Reject)
  const handleUpdateInquiryStatus = async (inquiryId, status) => {
    if (backendActive) {
      try {
        await fetch(`${API_URL}/api/inquiries/${inquiryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        setInquiries(prev => prev.map(inq => {
          if (inq.id === inquiryId) {
            const updated = { ...inq, status: status };
            const prop = properties.find(p => p.id === inq.propertyId);
            const propTitle = prop ? prop.title : 'nepoznat smeštaj';
            logActivity(currentUser, `${status === 'Odobreno' ? 'Odobren' : 'Odbijen'} upit za smeštaj "${propTitle}".`, 'update');
            return updated;
          }
          return inq;
        }));
      } catch (err) {
        console.error(err);
      }
    } else {
      setInquiries(prev => prev.map(inq => {
        if (inq.id === inquiryId) {
          const updated = { ...inq, status: status };
          const prop = properties.find(p => p.id === inq.propertyId);
          const propTitle = prop ? prop.title : 'nepoznat smeštaj';
          const targetUser = users.find(u => u.id === inq.userId);
          const userDisplay = targetUser ? `${targetUser.fullName} (${targetUser.email})` : `Korisnik ID: ${inq.userId}`;
          logActivity(currentUser, `${status === 'Odobreno' ? 'Odobren' : 'Odbijen'} upit za smeštaj "${propTitle}" za korisnika ${userDisplay}.`, 'update');
          return updated;
        }
        return inq;
      }));
    }
  };

  // Handle Send Chat Message (Simulated Chat)
  const handleSendChatMessage = async (inquiryId, sender, text) => {
    const now = new Date();
    const formattedTime = now.toLocaleDateString('sr-RS') + ' u ' + now.toLocaleTimeString('sr-RS', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/inquiries/${inquiryId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender, text, timestamp: formattedTime })
        });
        const savedMsg = await res.json();
        setInquiries(prev => prev.map(inq => {
          if (inq.id === inquiryId) {
            const currentChat = inq.chat || [];
            const updated = { ...inq, chat: [...currentChat, savedMsg] };
            logActivity(currentUser, `Poslata poruka u ćaskanju.`, 'update');
            return updated;
          }
          return inq;
        }));
      } catch (err) {
        console.error(err);
      }
    } else {
      setInquiries(prev => prev.map(inq => {
        if (inq.id === inquiryId) {
          const newMsg = {
            id: Date.now() + Math.random(),
            sender: sender,
            text: text,
            timestamp: formattedTime
          };
          const currentChat = inq.chat || (inq.message ? [{ id: 1, sender: 'client', text: inq.message, timestamp: inq.dates.split(' - ')[0] }] : []);
          const updated = { ...inq, chat: [...currentChat, newMsg] };
          const prop = properties.find(p => p.id === inq.propertyId);
          const propTitle = prop ? prop.title : 'nepoznat smeštaj';
          logActivity(currentUser, `Poslata poruka u ćaskanju povodom upita za smeštaj "${propTitle}".`, 'update');
          return updated;
        }
        return inq;
      }));
    }
  };
  const handleAddForumPost = async (newPost) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/forum-posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost)
        });
        const saved = await res.json();
        setForumPosts(prev => [saved, ...prev]);
        logActivity(currentUser, `Dodat novi post na forumu: "${saved.title}".`, 'create');
      } catch (err) {
        console.error(err);
      }
    } else {
      setForumPosts(prev => {
        const current = prev || [];
        return [newPost, ...current];
      });
    }
  };

  // Handle Delete Review (Moderation)
  const handleDeleteReview = async (propertyId, reviewIndex) => {
    const prop = properties.find(p => p.id === propertyId);
    const reviewObj = prop?.reviews?.[reviewIndex];

    if (backendActive && reviewObj) {
      try {
        const res = await fetch(`${API_URL}/api/properties/${propertyId}/reviews/${reviewObj.id}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const resData = await res.json();
        setProperties(prevProperties => {
          return prevProperties.map(property => {
            if (property.id === propertyId) {
              const updatedReviews = (property.reviews || []).filter(r => r.id !== reviewObj.id);
              logActivity(currentUser, `Obrisana recenzija autora "${reviewObj.author}".`, 'delete');
              return {
                ...property,
                reviews: updatedReviews,
                rating: resData.newRating
              };
            }
            return property;
          });
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      setProperties(prevProperties => {
        return prevProperties.map(property => {
          if (property.id === propertyId) {
            const updatedReviews = (property.reviews || []).filter((_, idx) => idx !== reviewIndex);
            const sumRatings = updatedReviews.reduce((sum, rev) => sum + rev.rating, 0);
            const newAvgRating = updatedReviews.length > 0 ? parseFloat((sumRatings / updatedReviews.length).toFixed(1)) : 5.0;
            const deletedReview = (property.reviews || [])[reviewIndex];
            const authorDisplay = deletedReview ? deletedReview.author : 'Nepoznat autor';
            logActivity(currentUser, `Obrisana recenzija autora "${authorDisplay}" za smeštaj "${property.title}".`, 'delete');
            return { ...property, reviews: updatedReviews, rating: newAvgRating };
          }
          return property;
        });
      });
    }
  };

  // Handle Delete Forum Post (Moderation)
  const handleDeleteForumPost = async (postId) => {
    const postToDelete = forumPosts.find(p => p.id === postId);
    if (!postToDelete) return;

    if (backendActive) {
      try {
        await fetch(`${API_URL}/api/forum-posts/${postId}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        setForumPosts(prev => prev.filter(p => p.id !== postId));
        logActivity(currentUser, `Obrisan post na forumu: "${postToDelete.title}".`, 'delete');
      } catch (err) {
        console.error(err);
      }
    } else {
      setForumPosts(prev => prev.filter(p => p.id !== postId));
      logActivity(currentUser, `Obrisan post na forumu: "${postToDelete.title}" (autor: ${postToDelete.author}).`, 'delete');
    }
  };

  // Add a review and update average rating
  const handleAddReview = async (propertyId, newReview) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/properties/${propertyId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReview)
        });
        const savedRev = await res.json();
        setProperties(prevProperties => {
          return prevProperties.map(property => {
            if (property.id === propertyId) {
              const updatedReviews = [...(property.reviews || []), savedRev];
              logActivity(currentUser, `Dodata nova recenzija za smeštaj.`, 'create');
              return {
                ...property,
                reviews: updatedReviews,
                rating: savedRev.newAverageRating
              };
            }
            return property;
          });
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      setProperties(prevProperties => {
        return prevProperties.map(property => {
          if (property.id === propertyId) {
            const updatedReviews = [...(property.reviews || []), newReview];
            const sumRatings = updatedReviews.reduce((sum, rev) => sum + rev.rating, 0);
            const newAvgRating = parseFloat((sumRatings / updatedReviews.length).toFixed(1));
            return { ...property, reviews: updatedReviews, rating: newAvgRating };
          }
          return property;
        });
      });
    }
  };

  // Toggle Wishlist
  const handleToggleWishlist = (id) => {
    setWishlist(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Toggle comparison state (max 3 items)
  const handleToggleCompare = (id) => {
    setComparedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        if (prev.length >= 3) {
          alert('Možete uporediti maksimalno 3 smeštaja istovremeno.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Clear Sidebar Filters
  const handleClearFilters = () => {
    setFilters({
      maxPrice: null,
      maxDistance: 1200,
      amenities: {
        wifi: false,
        pool: false,
        beachfront: false,
        parking: false,
        airConditioning: false,
        pets: false
      }
    });
    setSearchFilters({
      destination: 'all',
      priceCategory: 'all',
      type: 'all',
      checkIn: '',
      checkOut: ''
    });
    setSortBy('recommended');
    setActivePills([]);
  };

  // Filter and Sort Logic
  const getFilteredAndSortedProperties = () => {
    let items = [...properties];

    // Filter by Wishlist Tab
    if (activeTab === 'wishlist') {
      items = items.filter(p => wishlist.includes(p.id));
    }

    // Filter by Hero Search: Destination
    if (searchFilters.destination !== 'all') {
      items = items.filter(p => p.location.toLowerCase() === searchFilters.destination.toLowerCase());
    }

    // Filter by Hero Search: Property Type
    if (searchFilters.type !== 'all') {
      items = items.filter(p => p.type.toLowerCase() === searchFilters.type.toLowerCase());
    }

    // Filter by Hero Search: Price Category
    if (searchFilters.priceCategory !== 'all') {
      if (searchFilters.priceCategory === 'budget') {
        items = items.filter(p => p.price <= 60);
      } else if (searchFilters.priceCategory === 'mid') {
        items = items.filter(p => p.price > 60 && p.price <= 120);
      } else if (searchFilters.priceCategory === 'luxury') {
        items = items.filter(p => p.price > 120);
      }
    }

    // Filter by Availability (Check-In & Check-Out) is disabled to match Grčka Info behavior 
    // where guests can always send inquiries and properties are not hidden by existing bookings.

    // Filter by Sidebar: Max Price
    const activeMaxPrice = filters.maxPrice !== null && filters.maxPrice !== undefined ? filters.maxPrice : maxPriceLimit;
    if (activeMaxPrice < 1000) {
      items = items.filter(p => p.price <= activeMaxPrice);
    }

    // Filter by Sidebar: Max Distance
    if (filters.maxDistance < 1200) {
      items = items.filter(p => p.distanceToBeach <= filters.maxDistance);
    }

    // Filter by Sidebar: Amenities
    Object.keys(filters.amenities).forEach(key => {
      if (filters.amenities[key]) {
        items = items.filter(p => p.amenities[key] === true);
      }
    });

    // Filter by Quick Pills
    if (activePills.length > 0) {
      const pillTests = {
        first_line: p => p.distanceToBeach <= 50,
        pool: p => p.amenities.pool === true,
        parking: p => p.amenities.parking === true,
        pets: p => p.amenities.pets === true,
        sea_view: p => p.description.toLowerCase().includes('pogled na more') || p.title.toLowerCase().includes('pogled na more'),
        ac: p => p.amenities.airConditioning === true,
        premium: p => p.rating >= 4.8,
        budget: p => p.price <= 60
      };
      
      activePills.forEach(pillId => {
        const testFn = pillTests[pillId];
        if (testFn) {
          items = items.filter(testFn);
        }
      });
    }

    // Sorting
    if (sortBy === 'recommended') {
      items.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'priceLow') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      items.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'beachNearest') {
      items.sort((a, b) => a.distanceToBeach - b.distanceToBeach);
    }

    return items;
  };

  const processedProperties = getFilteredAndSortedProperties();
  const comparedProperties = properties.filter(p => comparedIds.includes(p.id));

  // Determine page layouts dynamically based on Tab Selection
  const renderTabContent = () => {
    switch (activeTab) {
      case 'guide':
        return (
          <div className="main-layout full-width">
            <TravelGuide 
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          </div>
        );
      case 'blog':
        return (
          <div className="main-layout full-width">
            <BlogSection />
          </div>
        );
      case 'forum':
        return (
          <div className="main-layout full-width">
            <ForumSection 
              forumPosts={forumPosts} 
              onAddForumPost={handleAddForumPost} 
              currentUser={currentUser}
              onDeleteForumPost={handleDeleteForumPost}
            />
          </div>
        );
      case 'alerts':
        return (
          <div className="main-layout full-width">
            <AlertsSection />
          </div>
        );
      case 'host':
        return (
          <div className="admin-fullwidth-wrapper animate-fade">
            <HostPanel 
              onAddProperty={handleAddProperty}
              destinations={derivedDestinations}
              propertyTypes={PROPERTY_TYPES}
              currentUser={currentUser}
              properties={properties}
              inquiries={inquiries}
              activityLogs={activityLogs}
              onDeleteProperty={handleDeleteProperty}
              users={users}
              onToggleAdminStatus={handleToggleAdminStatus}
              onUpdateInquiryStatus={handleUpdateInquiryStatus}
              onSendChatMessage={handleSendChatMessage}
              onRefreshDatabase={handleRefreshDatabase}
            />
          </div>
        );
      case 'profile':
        return currentUser ? (
          <div className="main-layout full-width">
            <ProfileTab 
              currentUser={currentUser}
              inquiries={inquiries}
              onUpdateUser={handleUpdateUser}
              onCancelInquiry={handleCancelInquiry}
              onLogout={handleLogout}
              properties={properties}
              onViewPropertyDetails={setSelectedProperty}
              onSendChatMessage={handleSendChatMessage}
              onNavigate={handleTabChange}
            />
          </div>
        ) : (
          <div className="main-layout full-width animate-scale">
            <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
              <h3>Niste Prijavljeni</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Da biste pristupili kontrolnom panelu i pratili upite, molimo Vas da se prijavite.</p>
              <button className="btn-search" onClick={() => setIsAuthModalOpen(true)} style={{ marginTop: '1.5rem', marginInline: 'auto' }}>
                Prijavi se
              </button>
            </div>
          </div>
        );
      default:
        // Listings / Wishlist tab layouts
        if (activeTab === 'listings' && !isSearchActive) {
          return (
            <LandingPage 
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
              destinations={derivedDestinations}
              propertyTypes={PROPERTY_TYPES}
              properties={properties}
              setIsSearchActive={setIsSearchActive}
              onSelectDestination={handleSelectDestination}
              setActiveTab={handleTabChange}
              setSelectedProperty={setSelectedProperty}
            />
          );
        }

        return (
          <div className="listings-tab-wrapper">
            {/* Visual Destination Grid */}
            {activeTab === 'listings' && (
              <div className="destination-grid-section animate-fade">
                <h2 className="section-title-nikana">Gde želite da putujete?</h2>
                <div className="destination-cards-container">
                  {[
                    { name: 'Tasos', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Sitonija', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Kasandra', img: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Lefkada', img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Krit', img: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=300&q=80' },
                    { name: 'Halkidiki', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80' }
                  ].map(dest => {
                    const isSelected = searchFilters.destination.toLowerCase() === dest.name.toLowerCase();
                    return (
                      <div 
                        key={dest.name} 
                        className={`destination-card-item ${isSelected ? 'active' : ''}`}
                        onClick={() => setSearchFilters(prev => ({ 
                          ...prev, 
                          destination: isSelected ? 'all' : dest.name 
                        }))}
                      >
                        <img src={dest.img} alt={dest.name} className="destination-card-img" />
                        <div className="destination-card-overlay"></div>
                        <div className="destination-card-name">{dest.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick filter capsules */}
            {activeTab === 'listings' && (
              <div className="quick-filters-section animate-fade">
                <div className="quick-filters-scroll">
                  {[
                    { id: 'first_line', label: '🏖️ Prva linija' },
                    { id: 'pool', label: '🏊 Sa bazenom' },
                    { id: 'parking', label: '🚗 Privatni parking' },
                    { id: 'pets', label: '🐾 Ljubimci' },
                    { id: 'sea_view', label: '🌅 Pogled na more' },
                    { id: 'ac', label: '❄️ Klima uključena' },
                    { id: 'premium', label: '💎 Premium (4.8+)' },
                    { id: 'budget', label: '💰 Povoljno (do 60€)' }
                  ].map(pill => {
                    const isActive = activePills.includes(pill.id);
                    return (
                      <button
                        key={pill.id}
                        className={`quick-filter-pill ${isActive ? 'active' : ''}`}
                        onClick={() => toggleQuickFilter(pill.id)}
                      >
                        {pill.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="main-layout">
              {/* Left Sidebar Filters */}
              <Filters 
                filters={filters} 
                setFilters={setFilters} 
                maxPriceLimit={maxPriceLimit}
                clearFilters={handleClearFilters}
              />

              {/* Right Listings Column */}
              <section className="listings-container">
                <div className="listings-header">
                  <div className="listings-count">
                    {activeTab === 'wishlist' ? 'Sačuvani Smeštaj' : 'Svi Smeštaji'}: {processedProperties.length}
                  </div>

                {/* View Mode Toggle Switch */}
                {activeTab === 'listings' && (
                  <div className="view-mode-toggle-container">
                    <button 
                      className={`btn-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      📋 Lista
                    </button>
                    <button 
                      className={`btn-view-toggle ${viewMode === 'map' ? 'active' : ''}`}
                      onClick={() => setViewMode('map')}
                    >
                      🗺️ Mapa
                    </button>
                  </div>
                )}

                <div className="listings-sorting">
                  <label htmlFor="sorting">Sortiraj po:</label>
                  <select 
                    id="sorting" 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recommended">Preporučeno (Rating)</option>
                    <option value="priceLow">Najnižoj ceni (Price low-high)</option>
                    <option value="priceHigh">Najvišoj ceni (Price high-low)</option>
                    <option value="beachNearest">Udaljenosti od plaže (Nearest beach)</option>
                  </select>
                </div>
              </div>

              {viewMode === 'map' && activeTab === 'listings' ? (
                <InteractiveMap 
                  properties={properties}
                  processedProperties={processedProperties}
                  onViewPropertyDetails={setSelectedProperty}
                />
              ) : processedProperties.length > 0 ? (
                <div className="listings-grid">
                  {processedProperties.map(prop => (
                    <PropertyCard 
                      key={prop.id}
                      property={prop}
                      onViewDetails={() => setSelectedProperty(prop)}
                      isWishlisted={wishlist.includes(prop.id)}
                      onToggleWishlist={handleToggleWishlist}
                      isCompared={comparedIds.includes(prop.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-listings animate-scale">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <h3>Nema rezultata</h3>
                  <p>Molimo vas da promenite parametre pretrage ili poništite filtere.</p>
                  <button className="btn-search" onClick={handleClearFilters}>
                    Poništi filtere
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      );
    }
  };

  if (isFake404Active) {
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: 'center', padding: '15% 1rem', backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '500', margin: '0', display: 'inline-block', borderRight: '1px solid rgba(0, 0, 0, .3)', padding: '0 20px 0 0', marginRight: '20px', verticalAlign: 'middle', lineHeight: '49px' }}>404</h1>
          <div style={{ display: 'inline-block', textAlign: 'left', verticalAlign: 'middle', lineHeight: '49px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'normal', margin: '0', padding: '0' }}>This page could not be found.</h2>
          </div>
        </div>
      </div>
    );
  }

  const shouldHaveBg = isDarkMode || (activeTab === 'listings' && !isSearchActive);

  return (
    <div className={`app-wrapper ${shouldHaveBg ? 'with-landing-bg' : ''}`}>
      <header className="app-header">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          wishlistCount={wishlist.length}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          isGridMenuOpen={isGridMenuOpen}
          setIsGridMenuOpen={setIsGridMenuOpen}
          onSelectDestination={handleSelectDestination}
          onSelectCategory={handleSelectCategory}
        />
        <Megamenu 
          isGridMenuOpen={isGridMenuOpen}
          setIsGridMenuOpen={setIsGridMenuOpen}
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
          activePills={activePills}
          currentUser={currentUser}
          setIsAuthModalOpen={setIsAuthModalOpen}
          handleSelectDestination={handleSelectDestination}
          handleSelectCategory={handleSelectCategory}
          setActiveTab={handleTabChange}
          setIsSearchActive={setIsSearchActive}
        />
      </header>

      {/* Main Content Sections */}
      <main id="listings-section">
        {selectedProperty ? (
          <PropertyDetails 
            key={selectedProperty.id}
            property={selectedProperty} 
            onClose={() => setSelectedProperty(null)}
            onAddReview={handleAddReview}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onAddInquiry={handleAddInquiry}
            onDeleteReview={handleDeleteReview}
            inquiries={inquiries}
            initialCheckIn={searchFilters.checkIn}
            initialCheckOut={searchFilters.checkOut}
          />
        ) : (
          renderTabContent()
        )}
      </main>

      {/* Floating Comparison Drawer */}
      {comparedIds.length > 0 && (
        <div className="compare-drawer animate-fade">
          <div className="compare-drawer-info">
            <span className="compare-drawer-title">Poređenje smeštaja ({comparedIds.length}/3)</span>
            <div className="compare-thumbnails">
              {comparedProperties.map(p => (
                <div key={p.id} className="compare-thumb-item">
                  <img src={p.image} alt={p.title} className="compare-thumb-img" />
                  <button 
                    className="btn-remove-thumb"
                    onClick={() => handleToggleCompare(p.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="compare-drawer-actions">
            <button 
              className="btn-compare-action"
              onClick={() => setIsCompareMatrixOpen(true)}
              disabled={comparedIds.length < 2}
              style={{ opacity: comparedIds.length < 2 ? 0.6 : 1, cursor: comparedIds.length < 2 ? 'not-allowed' : 'pointer' }}
            >
              {comparedIds.length < 2 ? 'Izaberite min. 2' : 'Uporedi Smeštaje'}
            </button>
            <button className="btn-compare-cancel" onClick={() => setComparedIds([])}>
              Poništi
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Matrix Modal */}
      {isCompareMatrixOpen && (
        <div className="modal-overlay" onClick={() => setIsCompareMatrixOpen(false)}>
          <div className="modal-container compare-modal-container" onClick={e => e.stopPropagation()}>
            <button className="btn-modal-close" onClick={() => setIsCompareMatrixOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Uporedni Prikaz Smeštaja</h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="compare-matrix-table">
                  <thead>
                    <tr>
                      <th className="row-label">Karakteristike</th>
                      {comparedProperties.map(p => (
                        <th key={p.id}>
                          <img src={p.image} alt={p.title} className="compare-matrix-image" />
                          <div className="compare-matrix-title">{p.title}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="row-label">Cena po noćenju</td>
                      {comparedProperties.map(p => (
                        <td key={p.id} style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.15rem' }}>
                          {p.price}€
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-label">Destinacija</td>
                      {comparedProperties.map(p => <td key={p.id} style={{ fontWeight: '600' }}>{p.location}</td>)}
                    </tr>
                    <tr>
                      <td className="row-label">Tip smeštaja</td>
                      {comparedProperties.map(p => <td key={p.id}>{p.type}</td>)}
                    </tr>
                    <tr>
                      <td className="row-label">Udaljenost od plaže</td>
                      {comparedProperties.map(p => <td key={p.id} style={{ fontWeight: '600' }}>{p.distanceToBeach}m</td>)}
                    </tr>
                    <tr>
                      <td className="row-label">Kapacitet (Gosti)</td>
                      {comparedProperties.map(p => <td key={p.id}>{p.guests} osobe</td>)}
                    </tr>
                    <tr>
                      <td className="row-label">Spavaće sobe</td>
                      {comparedProperties.map(p => <td key={p.id}>{p.bedrooms} sobe</td>)}
                    </tr>
                    <tr>
                      <td className="row-label">Prosečna ocena</td>
                      {comparedProperties.map(p => (
                        <td key={p.id} style={{ fontWeight: 'bold' }}>
                          ⭐ {p.rating.toFixed(1)} / 5.0
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-label">Besplatan Wi-Fi</td>
                      {comparedProperties.map(p => (
                        <td key={p.id}>
                          {p.amenities.wifi ? <span className="checkmark-sim">✔ Da</span> : <span className="crossmark-sim">✖ Ne</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-label">Bazen (Pool)</td>
                      {comparedProperties.map(p => (
                        <td key={p.id}>
                          {p.amenities.pool ? <span className="checkmark-sim">✔ Da</span> : <span className="crossmark-sim">✖ Ne</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-label">Na samoj plaži</td>
                      {comparedProperties.map(p => (
                        <td key={p.id}>
                          {p.amenities.beachfront ? <span className="checkmark-sim">✔ Da</span> : <span className="crossmark-sim">✖ Ne</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-label">Besplatan parking</td>
                      {comparedProperties.map(p => (
                        <td key={p.id}>
                          {p.amenities.parking ? <span className="checkmark-sim">✔ Da</span> : <span className="crossmark-sim">✖ Ne</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-label">Klimatizovano (AC)</td>
                      {comparedProperties.map(p => (
                        <td key={p.id}>
                          {p.amenities.airConditioning ? <span className="checkmark-sim">✔ Da</span> : <span className="crossmark-sim">✖ Ne</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-label">Dozvoljeni ljubimci</td>
                      {comparedProperties.map(p => (
                        <td key={p.id}>
                          {p.amenities.pets ? <span className="checkmark-sim">✔ Da</span> : <span className="crossmark-sim">✖ Ne</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="row-label">Akcije</td>
                      {comparedProperties.map(p => (
                        <td key={p.id}>
                          <button 
                            className="btn-card-details" 
                            onClick={() => {
                              setSelectedProperty(p);
                              setIsCompareMatrixOpen(false);
                            }}
                          >
                            Pogledaj Detalje
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <span>Grčka</span>Aura
            </div>
            <p className="footer-desc">
              Najlepši smeštaji u Grčkoj na dlanu. Rezervišite bez posrednika, direktno od vlasnika sa najboljim uslovima.
            </p>
          </div>
          <div className="footer-col">
            <h4>Brzi Linkovi</h4>
            <ul className="footer-links">
              <li><a onClick={() => { handleTabChange('listings'); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{cursor: 'pointer'}}>Svi Smeštaji</a></li>
              <li><a onClick={() => { handleTabChange('guide'); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{cursor: 'pointer'}}>Putni Vodič</a></li>
              <li><a onClick={() => { handleTabChange('wishlist'); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{cursor: 'pointer'}}>Sačuvani Smeštaj</a></li>
              <li><a onClick={() => { handleTabChange('blog'); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{cursor: 'pointer'}}>Vodiči i Saveti</a></li>
              <li><a onClick={() => { handleTabChange('forum'); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{cursor: 'pointer'}}>Iskustva Putnika</a></li>
              <li><a onClick={() => { handleTabChange('alerts'); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{cursor: 'pointer'}}>Stanje na Granici</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Kontakt</h4>
            <ul className="footer-links">
              <li>E-mail: info@grckaaura.com</li>
              <li>Telefon: +381 60 123 4567</li>
              <li>Radno vreme: 09:00 - 17:00</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} GrčkaAura Portal. Sva prava zadržana. Inspirisano GrčkaInfo turističkim portalom.</p>
        </div>
      </footer>

      {/* Property Details is now rendered inside the main tag as a dedicated page */}

      {/* Authentications Modal overlay */}
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          registeredUsers={users}
        />
      )}

    </div>
  );
}
