
import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import Megamenu from './components/Megamenu';
import LandingPage from './components/LandingPage';
import Filters from './components/Filters';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import HostPanel from './components/HostPanel';
import BlogSection from './components/BlogSection';
import ForumSection from './components/ForumSection';
import { INITIAL_FORUM_POSTS } from './components/forumPostsData';
import AlertsSection from './components/AlertsSection';
import AuthModal from './components/AuthModal';
import ProfileTab from './components/ProfileTab';
import TravelGuide from './components/TravelGuide';
import InteractiveMap from './components/InteractiveMap';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const getUniqueId = () => Date.now();

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
    isAdmin: true,
    isHost: true
  },
  {
    id: 1000,
    username: 'vlasnik_ellinas',
    fullName: 'Vlasnik Ellinas',
    email: 'voxilityy@gmail.com',
    password: 'pakovanje1337',
    phone: '+381 60 111 2233',
    avatar: 'https://ui-avatars.com/api/?name=Vlasnik+Ellinas&background=00b4d8&color=fff',
    isAdmin: true,
    isHost: true,
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

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // App Navigation Tab
  const [activeTab, setActiveTab] = useState(() => {
    if (window.location.pathname === '/aura-vlasnik') {
      const savedUser = localStorage.getItem('currentUser');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const savedPropertiesRaw = localStorage.getItem('properties');
      const savedProperties = savedPropertiesRaw ? JSON.parse(savedPropertiesRaw) : [];
      const isHost = parsedUser && (parsedUser.isHost || savedProperties.some(p => p.ownerEmail === parsedUser.email));
      if (parsedUser && (parsedUser.isAdmin || isHost)) {
        return 'host';
      }
    }
    return 'listings';
  });

  const [guideSubTab, setGuideSubTab] = useState('calculator');

  const handleTabChange = (tabName) => {
    scrollPositionRef.current = 0;
    setSelectedProperty(null);
    setActiveTab(tabName);
    if (tabName === 'listings') {
      setIsSearchActive(false);
      setSearchFilters({
        destination: 'all',
        priceCategory: 'all',
        type: 'all',
        checkIn: getTodayDateString(),
        checkOut: getTomorrowDateString(),
        adults: 2,
        children: 0,
        childAges: []
      });
      setActivePills([]);
    } else if (tabName === 'all-listings') {
      setIsSearchActive(true);
      setSearchFilters({
        destination: 'all',
        priceCategory: 'all',
        type: 'all',
        checkIn: getTodayDateString(),
        checkOut: getTomorrowDateString(),
        adults: 2,
        children: 0,
        childAges: []
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
    setActiveTab('all-listings');
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
      alert('Hrvatska letovanja dolaze uskoro na Ellinas! Trenutno smo specijalizovani za Grčku.');
    }
    setActiveTab('all-listings');
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
      if (e.target.closest('.floating-brand-launcher') || e.target.closest('.mega-panel')) return;
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
      const savedPropertiesRaw = localStorage.getItem('properties');
      const savedProperties = savedPropertiesRaw ? JSON.parse(savedPropertiesRaw) : [];
      const isHost = parsedUser && (parsedUser.isHost || savedProperties.some(p => p.ownerEmail === parsedUser.email));
      if (!parsedUser || (!parsedUser.isAdmin && !isHost)) {
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
      return parsed.map(u => {
        if (u.email === 'voxilityy@gmail.com') {
          return { ...u, password: 'pakovanje1337', isAdmin: true, isHost: true };
        }
        if (u.email === 'stefan@email.com' || u.email === 'stefan.petrovic@gmail.com') {
          return { ...u, isAdmin: true, isHost: true };
        }
        return u;
      });
    }
    return DEFAULT_USERS;
  });

  // Action Requests (for admin approvals)
  const [actionRequests, setActionRequests] = useState(() => {
    const saved = localStorage.getItem('aura_action_requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!backendActive) {
      localStorage.setItem('aura_action_requests', JSON.stringify(actionRequests));
    }
  }, [actionRequests, backendActive]);

  // Current Logged-in User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email === 'stefan@email.com' || parsed.email === 'stefan.petrovic@gmail.com' || parsed.email === 'voxilityy@gmail.com') {
        return { ...parsed, isAdmin: true, isHost: true };
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
  const [authModalOptions, setAuthModalOptions] = useState({ initialIsRegister: false, initialIsHost: false });

  const handleOpenAuthModal = (opts = {}) => {
    setAuthModalOptions({
      initialIsRegister: opts.initialIsRegister || false,
      initialIsHost: opts.initialIsHost || false
    });
    setIsAuthModalOpen(true);
  };

  // Activity logs state (Audit Log)
  const [activityLogs, setActivityLogs] = useState(() => {
    const saved = localStorage.getItem('activityLogs');
    return saved ? JSON.parse(saved) : [];
  });

  // Admin notifications state
  const [adminNotifications, setAdminNotifications] = useState(() => {
    const saved = localStorage.getItem('adminNotifications');
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
    checkIn: getTodayDateString(),
    checkOut: getTomorrowDateString(),
    adults: 2,
    children: 0,
    childAges: []
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

  // Floating support chat widget states
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [chatWidgetOptionSelected, setChatWidgetOptionSelected] = useState(null);
  const [showChatWidgetSuccess, setShowChatWidgetSuccess] = useState(false);
  const chatWidgetRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Reset scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Track and restore scroll position when viewing / closing property details
  useEffect(() => {
    if (selectedProperty) {
      scrollPositionRef.current = window.scrollY;
    } else if (scrollPositionRef.current > 0) {
      const savedPos = scrollPositionRef.current;
      setTimeout(() => {
        window.scrollTo(0, savedPos);
      }, 50);
      scrollPositionRef.current = 0;
    }
  }, [selectedProperty]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWidgetRef.current && !chatWidgetRef.current.contains(event.target)) {
        setIsChatWidgetOpen(false);
      }
    };
    if (isChatWidgetOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatWidgetOpen]);

  // AI chat states
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInputText, setChatInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showPromoBalloon, setShowPromoBalloon] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(true);

  useEffect(() => {
    const isClosed = sessionStorage.getItem('chat_promo_closed') === 'true';
    if (!isClosed) {
      const timer = setTimeout(() => {
        setShowPromoBalloon(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClosePromoBalloon = (e) => {
    e.stopPropagation();
    setShowPromoBalloon(false);
    sessionStorage.setItem('chat_promo_closed', 'true');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser) {
        setChatMessages([
          {
            id: 1,
            sender: 'ai',
            text: `Zdravo, ${currentUser.name || 'goste'}! Ja sam vaš Ellinas AI Asistent. ⛵ Kako vam mogu pomoći danas? Slobodno me pitajte za preporuku smeštaja (npr. "vila na Lefkadi sa bazenom" ili "povoljan apartman na Tasosu").`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            recommendedPropertyIds: []
          }
        ]);
      } else {
        setChatMessages([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [currentUser]);

  const handleSendAiMessage = async () => {
    if (!chatInputText.trim() || isAiTyping) return;

    const userMsgText = chatInputText;
    setChatInputText('');

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userMsgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recommendedPropertyIds: []
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsAiTyping(true);

    // Auto scroll down user message
    setTimeout(() => {
      const chatList = document.getElementById('chat-messages-scroll');
      if (chatList) chatList.scrollTop = chatList.scrollHeight;
    }, 50);

    try {
      // Build messages history for LLM
      const history = chatMessages.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsgText,
          history: history
        })
      });

      if (!res.ok) {
        throw new Error('Mrežna greška pri komunikaciji sa AI.');
      }

      const data = await res.json();

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.text || "Izvinite, trenutno ne mogu da procesiram vaš upit.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedPropertyIds: data.recommendedPropertyIds || []
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Greška u AI četu:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "Izvinite, došlo je do tehničke greške prilikom povezivanja sa serverom. Molimo pokušajte ponovo.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedPropertyIds: []
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiTyping(false);
      // Scroll to bottom
      setTimeout(() => {
        const chatList = document.getElementById('chat-messages-scroll');
        if (chatList) {
          chatList.scrollTop = chatList.scrollHeight;
        }
      }, 100);
    }
  };

  const handleSelectChatWidgetOption = (optionId) => {
    setChatWidgetOptionSelected(optionId);
    setShowChatWidgetSuccess(true);
    
    // Auto-close chat widget after a brief delay so the user sees the applied filters
    setTimeout(() => {
      setIsChatWidgetOpen(false);
      setShowChatWidgetSuccess(false);
    }, 2200);
    
    // Execute actual filters based on selected quick support option
    if (optionId === 1) {
      handleSelectDestination('Tasos');
    } else if (optionId === 2) {
      handleSelectDestination('Sitonija');
    } else if (optionId === 3) {
      setSearchFilters(prev => ({
        ...prev,
        destination: 'all',
        checkIn: '2026-07-01',
        checkOut: '2026-07-08'
      }));
      setActiveTab('all-listings');
      setIsSearchActive(true);
      setSelectedProperty(null);
      setTimeout(() => {
        const listingsEl = document.getElementById('listings-section');
        if (listingsEl) {
          listingsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else if (optionId === 4) {
      setSearchFilters(prev => ({
        ...prev,
        priceCategory: 'budget'
      }));
      setSortBy('priceLow');
      setActiveTab('all-listings');
      setIsSearchActive(true);
      setSelectedProperty(null);
      setTimeout(() => {
        const listingsEl = document.getElementById('listings-section');
        if (listingsEl) {
          listingsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

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
      
      if (currentUser && currentUser.isAdmin) {
        try {
          const resNotifs = await fetch(`${API_URL}/api/admin/notifications`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          if (resNotifs.ok) {
            const dataNotifs = await resNotifs.json();
            setAdminNotifications(dataNotifs);
          }
        } catch (notifErr) {
          console.warn("Failed to refresh admin notifications:", notifErr);
        }

        try {
          const resReqs = await fetch(`${API_URL}/api/admin/action-requests`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          if (resReqs.ok) {
            const dataReqs = await resReqs.json();
            setActionRequests(dataReqs);
          }
        } catch (reqErr) {
          console.warn("Failed to refresh action requests:", reqErr);
        }
      }
      
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

        // Sync local user profile and wishlist with fresh database data on mount
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          const freshUser = dataUsers.find(u => u.id === parsed.id);
          if (freshUser) {
            freshUser.isAdmin = !!freshUser.isAdmin;
            freshUser.isHost = !!freshUser.isHost;
            setCurrentUser(freshUser);
            localStorage.setItem('currentUser', JSON.stringify(freshUser));

            // Sync wishlist state (merge local and database wishlists)
            const dbWishlist = freshUser.wishlist ? (Array.isArray(freshUser.wishlist) ? freshUser.wishlist : JSON.parse(freshUser.wishlist)) : [];
            const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            const mergedWishlist = Array.from(new Set([...localWishlist, ...dbWishlist]));
            setWishlist(mergedWishlist);
            localStorage.setItem('wishlist', JSON.stringify(mergedWishlist));
            
            // Sync merged wishlist back to backend
            const token = localStorage.getItem('authToken');
            if (token) {
              fetch(`${API_URL}/api/users/wishlist`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ wishlist: mergedWishlist })
              }).catch(err => console.error('Failed to sync merged wishlist on mount:', err));
            }
          }
        }

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
      } catch {
        console.warn('Backend server nije aktivan. Aplikacija radi u lokalnom offline režimu (localStorage).');
        setBackendActive(false);
      }
    };
    fetchData();
  }, []);

  // Heartbeat & Online Status Polling
  useEffect(() => {
    if (!currentUser || !backendActive) return;

    const sendHeartbeatAndPoll = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        // 1. Send Heartbeat
        await fetch(`${API_URL}/api/users/heartbeat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // 2. If Admin, poll updated user list & notifications to see online users in real-time
        if (currentUser.isAdmin) {
          const resUsers = await fetch(`${API_URL}/api/users`);
          if (resUsers.ok) {
            const dataUsers = await resUsers.json();
            setUsers(dataUsers);
          }

          const resNotifs = await fetch(`${API_URL}/api/admin/notifications`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (resNotifs.ok) {
            const dataNotifs = await resNotifs.json();
            setAdminNotifications(dataNotifs);
          }
        }
      } catch (err) {
        console.warn('Heartbeat/polling failed:', err.message);
      }
    };

    // Run immediately
    sendHeartbeatAndPoll();

    // Run every 20 seconds
    const interval = setInterval(sendHeartbeatAndPoll, 20000);
    return () => clearInterval(interval);
  }, [currentUser, backendActive]);

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
    const isHost = currentUser && (currentUser.isHost || properties.some(p => p.ownerEmail === currentUser.email));
    const timer = setTimeout(() => {
      if (activeTab === 'host') {
        if (currentUser && (currentUser.isAdmin || isHost)) {
          setIsFake404Active(false);
          if (window.location.pathname !== '/aura-vlasnik') {
            window.history.pushState({}, '', '/aura-vlasnik');
          }
        } else {
          // If not admin/host, show fake 404
          setIsFake404Active(true);
          window.history.pushState({}, '', '/aura-vlasnik');
        }
      } else {
        if (window.location.pathname === '/aura-vlasnik' || window.location.pathname === '/panel') {
          if (currentUser && (currentUser.isAdmin || isHost)) {
            // If admin/host, reset to / when navigating away from host tab
            window.history.pushState({}, '', '/');
          } else {
            setIsFake404Active(true);
          }
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab, currentUser, properties]);

  // Listen to popstate event (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      setSelectedProperty(null);
      if (window.location.pathname === '/aura-vlasnik' || window.location.pathname === '/panel') {
        const savedUser = localStorage.getItem('currentUser');
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        const savedPropertiesRaw = localStorage.getItem('properties');
        const savedProperties = savedPropertiesRaw ? JSON.parse(savedPropertiesRaw) : [];
        const isHost = parsedUser && (parsedUser.isHost || savedProperties.some(p => p.ownerEmail === parsedUser.email));
        if (parsedUser && (parsedUser.isAdmin || isHost)) {
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
  }, [properties, selectedProperty]);

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

  // Sync Admin Notifications to localStorage
  useEffect(() => {
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
  }, [adminNotifications]);

  const fetchAdminNotifications = useCallback(async () => {
    if (!backendActive) return;
    if (!currentUser || !currentUser.isAdmin) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminNotifications(data);
      }
    } catch (err) {
      console.error('Greška pri učitavanju obaveštenja:', err);
    }
  }, [backendActive, currentUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdminNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAdminNotifications]);

  const handleMarkNotificationsRead = async () => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/admin/notifications/mark-read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (res.ok) {
          fetchAdminNotifications();
        }
      } catch (err) {
        console.error('Greška pri označavanju obaveštenja kao pročitanih:', err);
      }
    } else {
      setAdminNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })));
    }
  };

  const createMockAdminNotification = useCallback((message) => {
    const newNotif = {
      id: getUniqueId(),
      message,
      timestamp: new Date().toLocaleString('sr-RS'),
      isRead: 0
    };
    setAdminNotifications(prev => [newNotif, ...prev]);
  }, []);

  // Activity Logger Helper
  const logActivity = useCallback(async (user, action, type) => {
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
      const localLog = { ...newLog, id: getUniqueId() };
      setActivityLogs(prev => [localLog, ...prev]);
    }
  }, [backendActive]);
  // Auth Operations
  const handleRegister = async (newUser) => {
    if (backendActive) {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Greška pri registraciji.');
      }
      const registered = data.user;
      localStorage.setItem('authToken', data.token);
      setUsers(prev => [...prev, registered]);
      
      // Sync local wishlist with new user profile in backend
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (localWishlist.length > 0) {
        fetch(`${API_URL}/api/users/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          },
          body: JSON.stringify({ wishlist: localWishlist })
        }).catch(err => console.error('Failed to sync wishlist on registration:', err));
      }
      
      setCurrentUser(registered);
      setIsAuthModalOpen(false);
      
      const isHost = registered.isAdmin || registered.isHost || properties.some(p => p.ownerEmail === registered.email);
      if (isHost) {
        handleTabChange('host');
      } else {
        handleTabChange('profile');
      }
      logActivity(registered, `Registrovan novi nalog na portalu.`, 'auth');
    } else {
      const isAdminEmail = newUser.email === 'stefan@email.com' || newUser.email === 'stefan.petrovic@gmail.com' || newUser.email === 'voxilityy@gmail.com';
      const updatedUser = isAdminEmail ? { ...newUser, isAdmin: true, isHost: true } : newUser;
      setUsers(prev => [...prev, updatedUser]);
      setCurrentUser(updatedUser);
      setIsAuthModalOpen(false);
      
      const isHost = updatedUser.isAdmin || updatedUser.isHost || properties.some(p => p.ownerEmail === updatedUser.email);
      if (isHost) {
        handleTabChange('host');
      } else {
        handleTabChange('profile');
      }
      logActivity(updatedUser, `Registrovan novi nalog na portalu.`, 'auth');
    }
  };

  const handleLogin = async (loginData) => {
    if (backendActive) {
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

      // Sync and merge wishlist on login
      const dbWishlist = loggedInUser.wishlist ? (Array.isArray(loggedInUser.wishlist) ? loggedInUser.wishlist : JSON.parse(loggedInUser.wishlist)) : [];
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const mergedWishlist = Array.from(new Set([...localWishlist, ...dbWishlist]));
      setWishlist(mergedWishlist);
      localStorage.setItem('wishlist', JSON.stringify(mergedWishlist));
      
      // Save merged wishlist to database
      fetch(`${API_URL}/api/users/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify({ wishlist: mergedWishlist })
      }).catch(err => console.error('Failed to sync merged wishlist on login:', err));

      setCurrentUser(loggedInUser);
      setIsAuthModalOpen(false);
      
      const isHost = loggedInUser.isAdmin || loggedInUser.isHost || properties.some(p => p.ownerEmail === loggedInUser.email);
      if (isHost) {
        setIsFake404Active(false);
        handleTabChange('host');
        logActivity(loggedInUser, loggedInUser.isAdmin ? `Administrator se prijavio na sistem (JWT).` : `Domaćin se prijavio na sistem (JWT).`, 'auth');
      } else {
        handleTabChange('profile');
        logActivity(loggedInUser, `Korisnik se prijavio na sistem (JWT).`, 'auth');
      }
      return loggedInUser;
    } else {
      const user = users.find(
        u => u.email.toLowerCase() === loginData.email.toLowerCase().trim() && u.password === loginData.password
      );
      if (!user) {
        throw new Error('Pogrešan e-mail ili lozinka.');
      }
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      
      const isHost = user.isAdmin || user.isHost || properties.some(p => p.ownerEmail === user.email);
      if (isHost) {
        setIsFake404Active(false);
        handleTabChange('host');
        logActivity(user, user.isAdmin ? `Administrator se prijavio na sistem.` : `Domaćin se prijavio na sistem.`, 'auth');
      } else {
        handleTabChange('profile');
        logActivity(user, `Korisnik se prijavio na sistem.`, 'auth');
      }
      return user;
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

  const handleUpgradeToHost = async () => {
    if (!currentUser) return;
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/users/become-host`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (res.ok) {
          const saved = await res.json();
          setUsers(prev => prev.map(u => u.id === saved.id ? saved : u));
          setCurrentUser(saved);
          logActivity(saved, `Korisnik je postao domaćin (poslat na onboarding).`, 'role');
          handleTabChange('host');
        }
      } catch (err) {
        console.error('Greška pri prelasku u ulogu domaćina:', err);
      }
    } else {
      const updated = {
        ...currentUser,
        isHost: true,
        isVerified: 0,
        agreedToTerms: 0,
        verificationDetails: '',
        verificationDocs: ''
      };
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setCurrentUser(updated);
      logActivity(updated, `Korisnik je postao domaćin (poslat na onboarding - lokalna simulacija).`, 'role');
      handleTabChange('host');
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
  const handleAddProperty = useCallback(async (newProperty) => {
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
      const isApproved = currentUser && currentUser.isAdmin ? 1 : 0;
      const propertyWithApproval = { ...newProperty, isApproved, id: newProperty.id || getUniqueId() };
      setProperties(prev => [propertyWithApproval, ...prev]);
      handleTabChange('listings');
      logActivity(currentUser, `Dodat novi smeštaj u ponudu: ${newProperty.title} (${newProperty.location}).`, 'create');
      
      if (currentUser && !currentUser.isAdmin) {
        createMockAdminNotification(`Domaćin ${currentUser.fullName || currentUser.email} (${currentUser.email}) je kreirao novi smeštaj: '${newProperty.title}' (čeka odobrenje).`);
      }
    }
  }, [backendActive, currentUser, logActivity, createMockAdminNotification]);

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
      
      if (currentUser && !currentUser.isAdmin) {
        createMockAdminNotification(`Domaćin ${currentUser.fullName || currentUser.email} (${currentUser.email}) je obrisao svoj smeštaj: '${property.title}'.`);
      }
    }
  };

  // Handle Approve Property
  const handleApproveProperty = async (propertyId) => {
    if (backendActive) {
      const query = `UPDATE properties SET isApproved = 1 WHERE id = ${propertyId};`;
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
          alert('Smeštaj je uspešno odobren i sada je javno vidljiv!');
          setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, isApproved: 1 } : p));
          if (currentUser && currentUser.isAdmin) {
            fetchAdminNotifications();
          }
        } else {
          alert('Greška pri odobravanju.');
        }
      } catch (err) {
        console.error(err);
        alert('Konekcija neuspešna.');
      }
    } else {
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, isApproved: 1 } : p));
      alert('Smeštaj je uspešno odobren (lokalno)!');
    }
  };

  // Handle Update Property (mock database query fallback or local sync)
  const handleUpdateProperty = (updatedProperty) => {
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
    if (currentUser && !currentUser.isAdmin) {
      createMockAdminNotification(`Domaćin ${currentUser.fullName || currentUser.email} (${currentUser.email}) je izmenio podatke za smeštaj: '${updatedProperty.title}'.`);
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

  // Handle Update Admin Permissions
  const handleUpdateAdminPermissions = async (userId, permissions) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/users/${userId}/permissions`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ adminPermissions: permissions })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Nije uspelo ažuriranje permisija.');
        }
        setUsers(prev => prev.map(u => {
          if (u.id === userId) {
            const updated = { ...u, adminPermissions: permissions };
            logActivity(currentUser, `Ažurirane permisije za admina ${u.fullName}: [${permissions.join(', ')}]`, 'update');
            if (currentUser && currentUser.id === userId) {
              const updatedMe = { ...currentUser, adminPermissions: permissions };
              setCurrentUser(updatedMe);
              localStorage.setItem('currentUser', JSON.stringify(updatedMe));
            }
            return updated;
          }
          return u;
        }));
      } catch (err) {
        alert(err.message);
      }
    } else {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updated = { ...u, adminPermissions: permissions };
          logActivity(currentUser, `Ažurirane permisije za admina ${u.fullName} (lokalno): [${permissions.join(', ')}]`, 'update');
          if (currentUser && currentUser.id === userId) {
            const updatedMe = { ...currentUser, adminPermissions: permissions };
            setCurrentUser(updatedMe);
            localStorage.setItem('currentUser', JSON.stringify(updatedMe));
          }
          return updated;
        }
        return u;
      }));
    }
  };

  // Handle Create Action Request
  const handleCreateActionRequest = async (requestData) => {
    const { actionType, targetId, targetTitle, proposedContent, reason } = requestData;
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/admin/action-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ actionType, targetId, targetTitle, proposedContent, reason })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Nije uspelo slanje zahteva.');
        }
        
        // Refresh requests
        const resReqs = await fetch(`${API_URL}/api/admin/action-requests`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (resReqs.ok) {
          const dataReqs = await resReqs.json();
          setActionRequests(dataReqs);
        }
        alert('Zahtev za odobrenje je uspešno poslat ostalim adminima.');
      } catch (err) {
        alert(err.message);
      }
    } else {
      const newReq = {
        id: `req-${Date.now()}`,
        requesterId: currentUser?.id || 999,
        requesterName: currentUser?.username || 'stefan',
        actionType,
        targetId,
        targetTitle,
        proposedContent,
        status: 'pending',
        reason,
        timestamp: new Date().toLocaleString('sr-RS')
      };
      setActionRequests(prev => [newReq, ...prev]);
      alert('Zahtev za odobrenje je uspešno poslat ostalim adminima (lokalno).');
    }
  };

  // Handle Process Action Request
  const handleProcessActionRequest = async (requestId, status) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/admin/action-requests/${requestId}/handle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ status })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Nije uspela obrada zahteva.');
        }
        
        await handleRefreshDatabase();
        const resReqs = await fetch(`${API_URL}/api/admin/action-requests`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (resReqs.ok) {
          const dataReqs = await resReqs.json();
          setActionRequests(dataReqs);
        }
      } catch (err) {
        alert(err.message);
      }
    } else {
      const req = actionRequests.find(r => r.id === requestId);
      if (!req) return;
      
      if (status === 'approved') {
        if (req.actionType === 'forum_delete') {
          setForumPosts(prev => prev.filter(p => p.id !== req.targetId));
        } else if (req.actionType === 'forum_edit') {
          setForumPosts(prev => prev.map(p => p.id === req.targetId ? { ...p, title: req.proposedContent.title, content: req.proposedContent.content } : p));
        }
      }
      
      setActionRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
      logActivity(currentUser, `${status === 'approved' ? 'Odobren' : 'Odbijen'} zahtev za ${req.actionType === 'forum_delete' ? 'brisanje' : 'izmenu'} objave '${req.targetTitle}' od admina ${req.requesterName} (lokalno).`, 'update');
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

  // Handle Host Verification Submit
  const handleSendVerification = async (details, docs) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/host/verify-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ details, docs })
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          // Refresh users list
          handleRefreshDatabase();
          alert('Dokumentacija uspešno poslata na pregled!');
        } else {
          const errData = await res.json();
          alert('Greška: ' + (errData.error || 'Neuspešno slanje dokumenata.'));
        }
      } catch (err) {
        console.error('Greška pri slanju dokumenata:', err);
        alert('Konekcija neuspešna.');
      }
    } else {
      // Mock mode fallback
      const updatedUser = {
        ...currentUser,
        isVerified: 0,
        agreedToTerms: 1,
        verificationDetails: JSON.stringify(details),
        verificationDocs: JSON.stringify(docs)
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      createMockAdminNotification(`Domaćin ${updatedUser.fullName} (${updatedUser.email}) je poslao dokumentaciju na verifikaciju (Mock).`);
      alert('Dokumentacija uspešno poslata na pregled (Lokalno)!');
    }
  };

  // Handle Admin Host Verification Approve/Reject
  const handleAdminVerifyHost = async (userId, status, reason) => {
    if (backendActive) {
      try {
        const res = await fetch(`${API_URL}/api/admin/verify-host/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ status, reason })
        });
        if (res.ok) {
          const data = await res.json();
          alert(data.message);
          handleRefreshDatabase();
          // Ako je admin promenio status sopstvenog naloga ili ako osvežavamo
          if (currentUser && currentUser.id === userId) {
            const updatedUser = { ...currentUser, isVerified: status };
            setCurrentUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
        } else {
          const errData = await res.json();
          alert('Greška: ' + (errData.error || 'Neuspešna promena statusa.'));
        }
      } catch (err) {
        console.error(err);
        alert('Konekcija neuspešna.');
      }
    } else {
      // Mock mode fallback
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const updated = { ...u, isVerified: status };
          createMockAdminNotification(`Admin je promenio status verifikacije za ${u.username} u: ${status === 1 ? 'Odobren' : 'Odbijen'} (Lokalno).`);
          return updated;
        }
        return u;
      }));
      alert(`Status verifikacije promenjen (Lokalno).`);
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

  // Sync wishlist to database helper
  const syncWishlistToBackend = async (newWishlist) => {
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!loggedInUser) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/users/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ wishlist: newWishlist })
      });
    } catch (err) {
      console.error('Nije uspelo sinhronizovanje liste želja:', err);
    }
  };

  // Toggle Wishlist
  const handleToggleWishlist = (id) => {
    setWishlist(prev => {
      const updated = prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id];
      syncWishlistToBackend(updated);
      return updated;
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
      checkIn: getTodayDateString(),
      checkOut: getTomorrowDateString(),
      adults: 2,
      children: 0,
      childAges: []
    });
    setSortBy('recommended');
    setActivePills([]);
  };

  // Filter and Sort Logic
  const getFilteredAndSortedProperties = () => {
    let items = [...properties];

    // Filter by Approval: only show approved properties in public views
    items = items.filter(p => p.isApproved === undefined || p.isApproved === 1 || p.isApproved === true || p.isApproved === '1');

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

    // Filter by Hero Search: Guests (Capacity)
    const totalGuests = Number(searchFilters.adults || 2) + Number(searchFilters.children || 0);
    if (totalGuests > 0) {
      items = items.filter(p => p.guests >= totalGuests);
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
              onOpenAuth={handleOpenAuthModal}
              initialSubTab={guideSubTab}
              onSubTabChange={setGuideSubTab}
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
              onSendActionRequest={handleCreateActionRequest}
              actionRequests={actionRequests}
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
              actionRequests={actionRequests}
              onUpdateAdminPermissions={handleUpdateAdminPermissions}
              onProcessActionRequest={handleProcessActionRequest}
              onUpdateInquiryStatus={handleUpdateInquiryStatus}
              onSendChatMessage={handleSendChatMessage}
              onRefreshDatabase={handleRefreshDatabase}
              isHost={currentUser && (currentUser.isHost || properties.some(p => p.ownerEmail === currentUser.email))}
              backendActive={backendActive}
              adminNotifications={adminNotifications}
              onMarkNotificationsRead={handleMarkNotificationsRead}
              onApproveProperty={handleApproveProperty}
              onUpdateProperty={handleUpdateProperty}
              onAddMockNotification={createMockAdminNotification}
              onSendVerification={handleSendVerification}
              onAdminVerifyHost={handleAdminVerifyHost}
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
              onUpgradeToHost={handleUpgradeToHost}
            />
          </div>
        ) : (
          <div className="main-layout full-width animate-scale">
            <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
              <h3>Niste Prijavljeni</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Da biste pristupili kontrolnom panelu i pratili upite, molimo Vas da se prijavite.</p>
              <button className="btn-search" onClick={() => handleOpenAuthModal()} style={{ marginTop: '1.5rem', marginInline: 'auto' }}>
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
              setIsSearchActive={(val) => {
                if (val) {
                  setActiveTab('all-listings');
                }
                setIsSearchActive(val);
              }}
              onSelectDestination={handleSelectDestination}
              setActiveTab={handleTabChange}
              setSelectedProperty={setSelectedProperty}
            />
          );
        }

        return (
          <div className="listings-tab-wrapper">
            {/* Visual Destination Grid */}
            {(activeTab === 'listings' || activeTab === 'all-listings') && (
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
            {(activeTab === 'listings' || activeTab === 'all-listings') && (
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
                {(activeTab === 'listings' || activeTab === 'all-listings') && (
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

              {viewMode === 'map' && (activeTab === 'listings' || activeTab === 'all-listings') ? (
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
                      showCompare={activeTab === 'all-listings'}
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
          onOpenAuth={handleOpenAuthModal}
          isGridMenuOpen={isGridMenuOpen}
          setIsGridMenuOpen={setIsGridMenuOpen}
          onSelectDestination={handleSelectDestination}
          onSelectCategory={handleSelectCategory}
          isHost={currentUser && (currentUser.isHost || properties.some(p => p.ownerEmail === currentUser.email))}
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
          setGuideSubTab={setGuideSubTab}
          setIsSearchActive={setIsSearchActive}
          onOpenAuth={handleOpenAuthModal}
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
            onOpenAuth={handleOpenAuthModal}
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
      {comparedIds.length > 0 && activeTab === 'all-listings' && (
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
              <span>Elli</span>nas
            </div>
            <p className="footer-desc">
              Najlepši smeštaji u Grčkoj na dlanu. Rezervišite sigurno uz našu podršku i najbolje uslove.
            </p>
          </div>
          <div className="footer-col">
            <h4>Brzi Linkovi</h4>
            <ul className="footer-links">
              <li><a onClick={() => { handleTabChange('listings'); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{cursor: 'pointer'}}>Početna</a></li>
              <li><a onClick={() => { handleTabChange('all-listings'); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{cursor: 'pointer'}}>Svi Smeštaji</a></li>
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
              <li>E-mail: info@ellinas.com</li>
              <li>Telefon: +381 60 123 4567</li>
              <li>Radno vreme: 09:00 - 17:00</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Ellinas Portal. Sva prava zadržana. Inspirisano GrčkaInfo turističkim portalom.</p>
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
          initialIsRegister={authModalOptions.initialIsRegister}
          initialIsHost={authModalOptions.initialIsHost}
        />
      )}

      {/* Floating Brand Explorer Launcher */}
      <button 
        className={`floating-brand-launcher ${isGridMenuOpen ? 'active' : ''}`}
        onClick={(e) => { e.stopPropagation(); setIsGridMenuOpen(!isGridMenuOpen); }}
        aria-label="Istraži regije"
      >
        <svg className="explorer-map-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 180, 216, 0.15)" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logo-cyan)" strokeWidth="2.5" strokeDasharray="14 8" className="logo-ring-dashed" />
          <g transform="translate(28, 28) scale(1.8)" stroke="url(#logo-cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
            <line x1="9" y1="3" x2="9" y2="18"></line>
            <line x1="15" y1="6" x2="15" y2="21"></line>
          </g>
        </svg>
        <span className="floating-tooltip">Istraži Regije</span>
      </button>

      {/* Floating Chat/Booking Support Widget */}
      <div className="chat-widget-container" ref={chatWidgetRef}>
        {/* Subtle Flying Seagulls (Moderate size) */}
        <div className="seagulls-container">
          <div className="seagull seagull-1">
            <svg viewBox="0 0 100 60"><path d="M 50 35 C 45 35, 20 10, 0 20 C 15 25, 35 32, 45 42 C 47 44, 47 48, 48 50 C 48 53, 49 55, 50 55 C 51 55, 52 53, 52 50 C 53 48, 53 44, 55 42 C 65 32, 85 25, 100 20 C 80 10, 55 35, 50 35 Z" fill="rgba(255, 255, 255, 0.8)" /></svg>
          </div>
          <div className="seagull seagull-2">
            <svg viewBox="0 0 100 60"><path d="M 50 35 C 45 35, 20 10, 0 20 C 15 25, 35 32, 45 42 C 47 44, 47 48, 48 50 C 48 53, 49 55, 50 55 C 51 55, 52 53, 52 50 C 53 48, 53 44, 55 42 C 65 32, 85 25, 100 20 C 80 10, 55 35, 50 35 Z" fill="rgba(255, 255, 255, 0.8)" /></svg>
          </div>
          <div className="seagull seagull-3">
            <svg viewBox="0 0 100 60"><path d="M 50 35 C 45 35, 20 10, 0 20 C 15 25, 35 32, 45 42 C 47 44, 47 48, 48 50 C 48 53, 49 55, 50 55 C 51 55, 52 53, 52 50 C 53 48, 53 44, 55 42 C 65 32, 85 25, 100 20 C 80 10, 55 35, 50 35 Z" fill="rgba(255, 255, 255, 0.8)" /></svg>
          </div>
        </div>

        {/* Promo Speech Balloon */}
        {showPromoBalloon && (
          <div className="chat-promo-balloon">
            <button className="chat-promo-close" onClick={handleClosePromoBalloon}>✕</button>
            <p>{currentUser ? "Pitajte našeg AI asistenta za preporuku i pregovore! 🌴" : "Prijavite se i isprobajte našeg AI asistenta za brzu preporuku smeštaja! 🌴"}</p>
          </div>
        )}

        <button 
          className={`chat-widget-trigger ${isChatWidgetOpen ? 'active' : ''}`}
          onClick={() => {
            setIsChatWidgetOpen(!isChatWidgetOpen);
            setShowChatWidgetSuccess(false);
            setChatWidgetOptionSelected(null);
            setHasUnreadMessage(false);
            setShowPromoBalloon(false);
          }}
          aria-label="Podrška i brza rezervacija"
        >
          {/* Notification Badge */}
          {hasUnreadMessage && <span className="chat-pulse-badge"></span>}
          {currentUser ? (
            /* Premium Animating Palm Tree in Brand Logo Colors for Logged-in Users */
            <svg className="palm-tree-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="36" height="36">
              <defs>
                <linearGradient id="widget-logo-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="100%" stopColor="#00b4d8" />
                </linearGradient>
                <linearGradient id="widget-logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffb703" />
                  <stop offset="100%" stopColor="#fb8500" />
                </linearGradient>
              </defs>
              <path d="M48 82 C53 60 50 40 45 30 C47 40 49 60 48 82 Z" fill="url(#widget-logo-gold)" />
              <path d="M45 30 C30 35 15 45 12 55 C22 48 35 38 45 30 Z" fill="url(#widget-logo-cyan)" opacity="0.9" />
              <path d="M45 30 C30 20 18 15 22 5 C30 15 38 22 45 30 Z" fill="url(#widget-logo-cyan)" />
              <path d="M45 30 C50 12 55 5 62 5 C58 18 52 25 45 30 Z" fill="url(#widget-logo-cyan)" />
              <path d="M45 30 C65 22 75 22 80 15 C72 26 60 30 45 30 Z" fill="url(#widget-logo-cyan)" opacity="0.95" />
              <path d="M45 30 C65 35 78 45 78 55 C65 48 55 38 45 30 Z" fill="url(#widget-logo-cyan)" opacity="0.85" />
              <path d="M45 30 C35 42 22 58 25 65 C32 55 38 42 45 30 Z" fill="url(#widget-logo-cyan)" opacity="0.8" />
            </svg>
          ) : (
            /* Branded Sails for Guests */
            <svg className="ellinas-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="20 15 60 60" width="36" height="36">
              <defs>
                <linearGradient id="widget-logo-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="100%" stopColor="#00b4d8" />
                </linearGradient>
                <linearGradient id="widget-logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffb703" />
                  <stop offset="100%" stopColor="#fb8500" />
                </linearGradient>
              </defs>
              <path className="logo-main-sail" d="M47 22 C32 38 32 62 47 70 C42 55 42 35 47 22 Z" fill="url(#widget-logo-cyan)" />
              <path className="logo-jib-sail" d="M53 32 C58 42 66 52 53 64 C51 52 51 40 53 32 Z" fill="url(#widget-logo-gold)" />
            </svg>
          )}
          <span className="floating-tooltip">{currentUser ? "Pitaj AI Asistenta! 🌴" : "Podrška i rezervacija"}</span>
        </button>

        {isChatWidgetOpen && (
          <div className="chat-widget-window glass">
            <div className="chat-widget-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg className="ellinas-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="1.5" />
                  <path className="logo-main-sail" d="M47 22 C32 38 32 62 47 70 C42 55 42 35 47 22 Z" fill="var(--primary)" />
                  <path className="logo-jib-sail" d="M53 32 C58 42 66 52 53 64 C51 52 51 40 53 32 Z" fill="var(--secondary)" />
                </svg>
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Ellinas Podrška</strong><br />
                  <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span> Online
                  </span>
                </div>
              </div>
              <button className="chat-widget-close" onClick={() => setIsChatWidgetOpen(false)}>✕</button>
            </div>

            {showChatWidgetSuccess ? (
              <div className="chat-success-screen">
                <div className="success-checkmark-circle">✓</div>
                <h3>{chatWidgetOptionSelected ? "Filter je primenjen!" : "Zahtev je poslat!"}</h3>
                <p>
                  {chatWidgetOptionSelected 
                    ? "Pronašli smo odgovarajuće smeštaje. Rezultati su prikazani na stranici." 
                    : "Hvala vam. Vaš zahtev je uspešno zabeležen. Naš tim podrške će vas kontaktirati u najkraćem roku."}
                </p>
              </div>
            ) : currentUser ? (
              /* Active AI Chat Mode for logged-in users */
              <div className="chat-ai-container">
                <div className="chat-messages-list" id="chat-messages-scroll">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`chat-message-item ${msg.sender}`}>
                      <div className="chat-message-bubble">
                        {msg.text}
                        {msg.recommendedPropertyIds && msg.recommendedPropertyIds.length > 0 && (
                          <div className="chat-properties-recommendations">
                            {msg.recommendedPropertyIds.map(pid => {
                              const prop = properties.find(p => p.id === pid);
                              if (!prop) return null;
                              return (
                                <div 
                                  key={pid} 
                                  className="chat-property-recommendation-card"
                                  onClick={() => {
                                    setSelectedProperty(prop);
                                    setIsChatWidgetOpen(false);
                                  }}
                                >
                                  <img src={prop.image} alt={prop.title} className="chat-property-rec-img" />
                                  <div className="chat-property-rec-info">
                                    <h5 className="chat-property-rec-title">{prop.title}</h5>
                                    <span className="chat-property-rec-location">📍 {prop.location} • {prop.type}</span>
                                    <div className="chat-property-rec-price-row">
                                      <span className="chat-property-rec-price">{prop.price}€ / noć</span>
                                      <button className="chat-property-rec-view-btn">Pogledaj →</button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <span className="chat-message-time">{msg.time}</span>
                    </div>
                  ))}
                  {isAiTyping && (
                    <div className="chat-ai-typing-container">
                      <div className="chat-ai-typing-dot"></div>
                      <div className="chat-ai-typing-dot"></div>
                      <div className="chat-ai-typing-dot"></div>
                    </div>
                  )}
                </div>
                <div className="chat-ai-input-wrapper">
                  <input 
                    type="text" 
                    className="chat-ai-input" 
                    placeholder="Pitajte našeg AI agenta..." 
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendAiMessage(); }}
                  />
                  <button className="chat-ai-send-btn" onClick={handleSendAiMessage}>
                    🏖️
                  </button>
                </div>
              </div>
            ) : (
              /* Standard mode with Lock Panel for Guests */
              <>
                <div className="chat-widget-body">
                  <div className="chat-ai-locked-card">
                    <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f2fe" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 242, 254, 0.4))' }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Ellinas Live Chat
                    </h4>
                    <p>Prijavite se da otključate Podršku Inteligencije i četujete uživo sa našim timom!</p>
                    <button 
                      className="chat-ai-unlock-btn"
                      onClick={() => {
                        setIsChatWidgetOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                    >
                      Prijavite se i četujte
                    </button>
                  </div>

                  <div className="chat-options-grid">
                    <button 
                      onClick={() => handleSelectChatWidgetOption(1)} 
                      className={`chat-option-btn ${chatWidgetOptionSelected === 1 ? 'selected' : ''}`}
                    >
                      <span className="chat-option-icon">🏖️</span>
                      <span className="chat-option-text">Tasos</span>
                    </button>
                    <button 
                      onClick={() => handleSelectChatWidgetOption(2)} 
                      className={`chat-option-btn ${chatWidgetOptionSelected === 2 ? 'selected' : ''}`}
                    >
                      <span className="chat-option-icon">🏨</span>
                      <span className="chat-option-text">Sitonija</span>
                    </button>
                    <button 
                      onClick={() => handleSelectChatWidgetOption(3)} 
                      className={`chat-option-btn ${chatWidgetOptionSelected === 3 ? 'selected' : ''}`}
                    >
                      <span className="chat-option-icon">📅</span>
                      <span className="chat-option-text">Jul 2026</span>
                    </button>
                    <button 
                      onClick={() => handleSelectChatWidgetOption(4)} 
                      className={`chat-option-btn ${chatWidgetOptionSelected === 4 ? 'selected' : ''}`}
                    >
                      <span className="chat-option-icon">💰</span>
                      <span className="chat-option-text">Najbolje cene</span>
                    </button>
                  </div>
                </div>

                <div className="chat-widget-footer" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Nastavi preko:</span>
                  <div className="chat-social-grid">
                    <a 
                      href="https://wa.me/381601234567?text=Dobar%20dan%2C%20zanima%20me%20sme%C5%A1taj%20u%20Gr%C4%8Dkoj"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chat-social-btn whatsapp"
                      title="WhatsApp"
                      onClick={() => setIsChatWidgetOpen(false)}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'block' }}>
                        <path d="M12.031 2C6.49 2 2 6.49 2 12.03c0 1.896.536 3.739 1.547 5.344L2 23l5.759-1.509a9.92 9.92 0 0 0 5.272 1.285c5.54 0 10.03-4.49 10.03-10.03C23.061 6.49 18.572 2 12.031 2zm6.39 13.9c-.268.679-1.312 1.27-1.848 1.338-.477.06-.921.129-2.991-.707-2.653-1.071-4.364-3.806-4.498-3.985-.133-.179-1.067-1.418-1.067-2.708 0-1.29.679-1.929.919-2.194.24-.265.518-.32.689-.32.17 0 .348.005.498.01.164.007.382-.062.583.447.209.522.736 1.79.805 1.929.07.139.115.279.02.458-.09.18-.135.28-.264.428-.13.155-.274.349-.394.453-.13.129-.264.269-.11.528.15.258.672 1.099 1.438 1.785.965.866 1.791 1.125 2.04 1.254.249.129.393.109.542-.06.15-.179.647-.746.816-1.01.17-.264.348-.21.587-.12.24.09 1.498.7 1.756.83.259.129.418.189.488.299.07.11.07.63-.204 1.3z"/>
                      </svg>
                    </a>
                    <a 
                      href="viber://chat?number=%2B381601234567"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chat-social-btn viber"
                      title="Viber"
                      onClick={() => setIsChatWidgetOpen(false)}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'block' }}>
                        <path d="M11.398.002C9.473.028 5.331.344 3.014 2.467 1.294 4.177.693 6.698.623 9.82c-.06 3.11-.13 8.95 5.5 10.541v2.42s-.038.97.602 1.17c.79.25 1.24-.499 1.99-1.299l1.4-1.58c3.85.32 6.8-.419 7.14-.529.78-.25 5.181-.811 5.901-6.652.74-6.031-.36-9.831-2.34-11.551l-.01-.002c-.6-.55-3-2.3-8.37-2.32 0 0-.396-.025-1.038-.016zm.067 1.697c.545-.003.88.02.88.02 4.54.01 6.711 1.38 7.221 1.84 1.67 1.429 2.528 4.856 1.9 9.892-.6 4.88-4.17 5.19-4.83 5.4-.28.09-2.88.73-6.152.52 0 0-2.439 2.941-3.199 3.701-.12.13-.26.17-.35.15-.13-.03-.17-.19-.16-.41l.02-4.019c-4.771-1.32-4.491-6.302-4.441-8.902.06-2.6.55-4.732 2-6.172 1.957-1.77 5.475-2.01 7.11-2.02zm.36 2.6a.299.299 0 0 0-.3.299.3.3 0 0 0 .3.3 5.631 5.631 0 0 1 4.03 1.59c1.09 1.06 1.621 2.48 1.641 4.34a.3.3 0 0 0 .3.3v-.009a.3.3 0 0 0 .3-.3 6.451 6.451 0 0 0-1.81-4.76c-1.19-1.16-2.692-1.76-4.462-1.76zm-3.954.69a.955.955 0 0 0-.615.12h-.012c-.41.24-.788.54-1.148.94-.27.32-.421.639-.461.949a1.24 1.24 0 0 0 .05.541l.02.01a13.722 13.722 0 0 0 1.2 2.6 15.383 15.383 0 0 0 2.32 3.171l.03.04.04.03.03.03.03.03a15.603 15.603 0 0 0 3.18 2.33c1.32.72 2.122 1.06 2.602 1.2v.01c.14.04.268.06.398.06a1.84 1.84 0 0 0 1.102-.472c.39-.35.7-.738.93-1.148v-.01c.23-.43.15-.841-.18-1.121a13.632 13.632 0 0 0-2.15-1.54c-.51-.28-1.03-.11-1.24.17l-.45.569c-.23.28-.65.24-.65.24l-.012.01c-3.12-.8-3.95-3.959-3.95-3.959s-.04-.43.25-.65l.56-.45c.27-.22.46-.74.17-1.25a13.522 13.522 0 0 0-1.54-2.15.843.843 0 0 0-.504-.3zm4.473.89a.3.3 0 0 0 .002.6 3.78 3.78 0 0 1 2.65 1.15 3.5 3.5 0 0 1 .9 2.57.3.3 0 0 0 .3.299l.01.012a.3.3 0 0 0 .3-.301c.03-1.19-.34-2.19-1.07-2.99-.73-.8-1.75-1.25-3.05-1.34a.3.3 0 0 0-.042 0zm.49 1.619a.305.305 0 0 0-.018.611c.99.05 1.47.55 1.53 1.58a.3.3 0 0 0 .3.29h.01a.3.3 0 0 0 .29-.32c-.07-1.34-.8-2.091-2.1-2.161a.305.305 0 0 0-.012 0z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://instagram.com/ellinas.gr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chat-social-btn instagram"
                      title="Instagram"
                      onClick={() => setIsChatWidgetOpen(false)}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'block' }}>
                        <path d="M12 0C8.74 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 1 0 12.324 6.162 6.162 0 0 1 0-12.324zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6.406-11.845a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://facebook.com/ellinas.gr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chat-social-btn facebook"
                      title="Facebook"
                      onClick={() => setIsChatWidgetOpen(false)}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style={{ display: 'block' }}>
                        <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1h-4c-2.8 0-5 2.2-5 5v2z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
