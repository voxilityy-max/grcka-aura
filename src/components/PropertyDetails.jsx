

import { useState, useMemo, useEffect, useRef } from 'react';

import { createPortal } from 'react-dom';



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';



// Pre-defined additional images to create rich carousels dynamically if properties don't have them

const EXTRA_CAROUSEL_IMAGES = [

  'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80', // Beach view

  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', // Room interior

  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', // Balcony / pool view

];



export default function PropertyDetails({ 

  property, 

  onClose, 

  onAddReview, 

  currentUser, 

  onOpenAuth, 

  onAddInquiry, 

  onDeleteReview, 

  inquiries = [],

  initialCheckIn = '',

  initialCheckOut = ''

}) {

  const { id, title, type, location, price, rating, distanceToBeach, image, guests: maxGuests, bedrooms, description, amenities, reviews = [] } = property;

  

  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const mapContainerRef = useRef(null);

  const mapInstanceRef = useRef(null);



  // Scroll to top when page opens

  useEffect(() => {

    window.scrollTo(0, 0);

  }, []);



  // Map coordinates mapping

  const getCoordinates = (locName, propId) => {

    switch (propId) {

      case 1: return [38.7778, 20.6009]; // Lefkada - Kathisma

      case 2: return [40.7288, 24.7578]; // Tasos - Golden Beach

      case 3: return [35.3673, 24.4891]; // Krit - Rethymno

      case 4: return [39.9882, 23.6148]; // Kasandra - Pefkohori

      case 5: return [40.2185, 23.6677]; // Sitonija - Nikiti

      case 6: return [40.3292, 23.9798]; // Halkidiki - Athos

      default: {

        const loc = locName.toLowerCase();

        if (loc.includes('lefkada')) return [38.7778, 20.6009];

        if (loc.includes('tasos') || loc.includes('thassos')) return [40.7288, 24.7578];

        if (loc.includes('krit') || loc.includes('crete')) return [35.3673, 24.4891];

        if (loc.includes('kasandra') || loc.includes('kassandra')) return [39.9882, 23.6148];

        if (loc.includes('sitonij') || loc.includes('sithon')) return [40.2185, 23.6677];

        if (loc.includes('halkidiki') || loc.includes('athos') || loc.includes('atos')) return [40.3292, 23.9798];

        return [37.9838, 23.7275]; // Athens fallback

      }

    }

  };



  useEffect(() => {

    let active = true;



    const loadLeafletAssets = () => {

      // 1. Check if CSS stylesheet is already in document

      if (!document.getElementById('leaflet-css')) {

        const link = document.createElement('link');

        link.id = 'leaflet-css';

        link.rel = 'stylesheet';

        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

        document.head.appendChild(link);

      }



      // 2. Check if Leaflet JS is already loaded

      if (!window.L) {

        if (!document.getElementById('leaflet-js')) {

          const script = document.createElement('script');

          script.id = 'leaflet-js';

          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

          script.onload = () => {

            if (active) setLeafletLoaded(true);

          };

          document.head.appendChild(script);

        }

      } else {

        setLeafletLoaded(true);

      }

    };



    loadLeafletAssets();



    return () => {

      active = false;

      // Destroy map instance if exists to prevent container reuse issues

      if (mapInstanceRef.current) {

        mapInstanceRef.current.remove();

        mapInstanceRef.current = null;

      }

    };

  }, []);



  // Initialize and update the map once Leaflet is loaded

  useEffect(() => {

    if (!leafletLoaded || !window.L || !mapContainerRef.current) return;



    // Destroy existing map if it was initialized previously

    if (mapInstanceRef.current) {

      mapInstanceRef.current.remove();

      mapInstanceRef.current = null;

    }



    const L = window.L;

    const coords = getCoordinates(location, id);



    // Create Leaflet map instance

    const map = L.map(mapContainerRef.current, {

      center: coords,

      zoom: 14,

      zoomControl: true,

      attributionControl: true

    });



    mapInstanceRef.current = map;



    // Add Tile Layer (OpenStreetMap tiles)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

      maxZoom: 19,

      attribution: '© OpenStreetMap contributors'

    }).addTo(map);



    // Custom Icon to prevent default marker missing image issue in Webpack/Vite

    const customMarkerIcon = L.icon({

      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',

      iconSize: [25, 41],

      iconAnchor: [12, 41],

      popupAnchor: [1, -34],

      shadowSize: [41, 41]

    });



    // Add Marker

    const marker = L.marker(coords, { icon: customMarkerIcon }).addTo(map);

    

    // Add Popup

    marker.bindPopup(`<strong>${title}</strong><br>📍 ${location}`).openPopup();





    // Force map size update (avoids gray tiles bug in hidden containers)
    setTimeout(() => {
        map.invalidateSize();
    }, 200);





  }, [leafletLoaded, location, id, title]);



  // Carousel State

  const carouselImages = useMemo(() => {

    return [

      image,

      EXTRA_CAROUSEL_IMAGES[(id) % EXTRA_CAROUSEL_IMAGES.length],

      EXTRA_CAROUSEL_IMAGES[(id + 1) % EXTRA_CAROUSEL_IMAGES.length],

      EXTRA_CAROUSEL_IMAGES[(id + 2) % EXTRA_CAROUSEL_IMAGES.length]

    ];

  }, [image, id]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const [lightboxIndex, setLightboxIndex] = useState(null);



  // Keyboard navigation for Lightbox

  useEffect(() => {

    if (lightboxIndex === null) return;



    const handleKeyDown = (e) => {

      if (e.key === 'Escape') {

        setLightboxIndex(null);

      } else if (typeof lightboxIndex === 'number') {

        if (e.key === 'ArrowRight') {

          setLightboxIndex((prev) => (prev + 1) % carouselImages.length);

        } else if (e.key === 'ArrowLeft') {

          setLightboxIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

        }

      }

    };



    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);

  }, [lightboxIndex, carouselImages.length]);



  // Derived Rich Amenities similar to GrckaInfo

  const richAmenities = useMemo(() => {

    const hasSeaView = amenities.beachfront || title.toLowerCase().includes('more') || title.toLowerCase().includes('horizon') || description.toLowerCase().includes('pogled na more') || description.toLowerCase().includes('pogledom na more');

    const hasGarden = type === 'Vila' || type === 'Hotel' || amenities.pool;

    const hasBbq = type === 'Vila' || amenities.pool;

    const hasSafe = type === 'Hotel' || type === 'Vila' || price > 100;

    

    return [

      { id: 'wifi', label: 'Besplatan Wi-Fi', active: !!amenities.wifi, icon: '📶' },

      { id: 'ac', label: 'Klima uređaj', active: !!amenities.airConditioning, icon: '❄️' },

      { id: 'parking', label: 'Besplatan parking', active: !!amenities.parking, icon: '🚗' },

      { id: 'pool', label: 'Bazen', active: !!amenities.pool, icon: '🏊' },

      { id: 'seaview', label: 'Pogled na more', active: hasSeaView, icon: '🌊' },

      { id: 'terrace', label: 'Terasa / Balkon', active: true, icon: '🌅' },

      { id: 'kitchen', label: 'Kuhinja / Posuđe', active: true, icon: '🍳' },

      { id: 'tv', label: 'LCD TV', active: true, icon: '📺' },

      { id: 'garden', label: 'Dvorište / Vrt', active: hasGarden, icon: '🌳' },

      { id: 'bbq', label: 'Roštilj', active: hasBbq, icon: '🍖' },

      { id: 'safe', label: 'Sef u sobi', active: hasSafe, icon: '🔒' },

      { id: 'pets', label: 'Ljubimci dozvoljeni', active: !!amenities.pets, icon: '🐾' }

    ];

  }, [amenities, title, description, type, price]);



  // Booking Form State

  const todayStr = new Date().toISOString().split('T')[0];

  

  const [bookingGuests, setBookingGuests] = useState('2');

  const [checkIn, setCheckIn] = useState(initialCheckIn);

  const [checkOut, setCheckOut] = useState(initialCheckOut);

  const [calendarBlocks, setCalendarBlocks] = useState([]);

  const [showCalendar, setShowCalendar] = useState(false);

  const calendarRef = useRef(null);



  useEffect(() => {

    const handleClickOutside = (event) => {

      if (calendarRef.current && !calendarRef.current.contains(event.target)) {

        setShowCalendar(false);

      }

    };

    if (showCalendar) {

      document.addEventListener('mousedown', handleClickOutside);

    }

    return () => {

      document.removeEventListener('mousedown', handleClickOutside);

    };

  }, [showCalendar]);



  // Derived Rooms List (Virtual room fallback if property.rooms is empty)

  const roomsList = useMemo(() => {

    if (property.rooms && property.rooms.length > 0) {

      return property.rooms;

    }

    return [

      {

        id: `entire-${id}`,

        propertyId: id,

        title: `Ceo objekat (${type})`,

        price: price,

        guests: maxGuests,

        bedrooms: bedrooms,

        image: image,

        description: 'Rezervacija kompletnog objekta (sve sobe i prostorije).'

      }

    ];

  }, [property.rooms, id, type, price, maxGuests, bedrooms, image]);





  // Selected room sub-unit state
  const [selectedRoomId, setSelectedRoomId] = useState(() => {
  return roomsList[0]?.id || null;
  });

  const selectedRoom = useMemo(() => {
  if (!roomsList || roomsList.length === 0) return null;
  return roomsList.find(r => r.id === selectedRoomId) || roomsList[0];
  }, [roomsList, selectedRoomId]);





  useEffect(() => {

    const fetchBlocks = async () => {

      try {

        let url = `${API_URL}/api/properties/${id}/calendar-blocks`;

        if (selectedRoom) {

          url += `?roomTitle=${encodeURIComponent(selectedRoom.title)}`;

        }

        const res = await fetch(url);

        if (res.ok) {

          const data = await res.json();

          setCalendarBlocks(data);

        }

      } catch (err) {

        console.error('Failed to fetch calendar blocks:', err);

      }

    };

    

    fetchBlocks();

    

    // Silent background sync

    const triggerBackgroundSync = async () => {

      try {

        await fetch(`${API_URL}/api/properties/${id}/sync-ical`, { method: 'POST' });

        fetchBlocks(); // Refetch to show newly synced blocks

      } catch {

        // fail silently

      }

    };

    triggerBackgroundSync();

  }, [id, selectedRoom]);









  const activePrice = selectedRoom ? selectedRoom.price : price;

  const activeMaxGuests = selectedRoom ? selectedRoom.guests : maxGuests;

  const activeBedrooms = selectedRoom ? selectedRoom.bedrooms : bedrooms;

  

  const parsedMonthlyPrices = useMemo(() => {

    const mPricesStr = selectedRoom ? selectedRoom.monthlyPrices : property.monthlyPrices;

    if (!mPricesStr) return null;

    if (typeof mPricesStr === 'object') return mPricesStr;

    try {

      return JSON.parse(mPricesStr);

    } catch {

      return null;

    }

  }, [selectedRoom, property.monthlyPrices]);

  

  // Pre-fill user data if logged in

  const [inquiryName, setInquiryName] = useState(currentUser ? currentUser.fullName : '');

  const [inquiryEmail, setInquiryEmail] = useState(currentUser ? currentUser.email : '');

  const [inquiryMessage, setInquiryMessage] = useState(`Dobar dan, zainteresovan sam za smeštaj "${title}". Molim Vas za proveru slobodnih kapaciteta.`);

  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const [inquiryError, setInquiryError] = useState('');



  // Calendar State & Helpers

  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  

  const SERBIAN_MONTHS = [

    "Januar", "Februar", "Mart", "April", "Maj", "Jun", 

    "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"

  ];



  const getFormattedDateString = (date) => {

    if (!date) return "";

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;

  };



  const isDateBooked = (dateStr) => {

    // 1. Check local approved inquiries

    const matchesLocal = inquiries.some(inq => {

      if (inq.propertyId !== id) return false;

      if (inq.status !== 'Odobreno') return false;

      

      // If a specific room is selected, check if this reservation is for this room

      if (selectedRoom && inq.roomTitle && inq.roomTitle !== selectedRoom.title) {

        return false;

      }

      

      const checkInDate = inq.checkIn;

      const checkOutDate = inq.checkOut;

      return dateStr >= checkInDate && dateStr < checkOutDate;

    });

    

    if (matchesLocal) return true;



    // 2. Check synced calendar blocks from Booking.com

    const matchesSync = calendarBlocks.some(block => {

      return dateStr >= block.startDate && dateStr < block.endDate;

    });



    return matchesSync;

  };



  const isRangeBooked = (startStr, endStr) => {

    if (!startStr || !endStr) return false;

    let current = new Date(startStr);

    const end = new Date(endStr);

    while (current < end) {

      const dateStr = getFormattedDateString(current);

      if (isDateBooked(dateStr)) return true;

      current.setDate(current.getDate() + 1);

    }

    return false;

  };



  const handlePrevMonth = () => {

    const today = new Date();

    const currentFirstOfToday = new Date(today.getFullYear(), today.getMonth(), 1);

    const prevFirstOfCalendar = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);

    if (prevFirstOfCalendar >= currentFirstOfToday) {

      setCalendarMonth(prevFirstOfCalendar);

    }

  };



  const handleNextMonth = () => {

    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));

  };



  const generateMonthDays = (year, month) => {

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let firstDay = new Date(year, month, 1).getDay();

    firstDay = firstDay === 0 ? 6 : firstDay - 1; // Mon=0, Sun=6

    

    const days = [];

    for (let i = 0; i < firstDay; i++) {

      days.push(null);

    }

    for (let day = 1; day <= daysInMonth; day++) {

      days.push(new Date(year, month, day));

    }

    return days;

  };



  // Sync state if currentUser changes
  useEffect(() => {
  if (currentUser) {
  const timer = setTimeout(() => {
  setInquiryName(currentUser.fullName || '');
  setInquiryEmail(currentUser.email || '');
  }, 0);
  return () => clearTimeout(timer);
  }
  }, [currentUser]);





  // Review Form State

  const [reviewAuthor, setReviewAuthor] = useState(currentUser ? currentUser.fullName : '');

  const [reviewRating, setReviewRating] = useState(5);

  const [reviewComment, setReviewComment] = useState('');

  const [reviewSubmitted, setReviewSubmitted] = useState(false);





  useEffect(() => {
  if (currentUser) {
  const timer = setTimeout(() => {
  setReviewAuthor(currentUser.fullName || '');
  }, 0);
  return () => clearTimeout(timer);
  }
  }, [currentUser]);





  // Calculate Nights dynamically

  const nights = useMemo(() => {

    const start = new Date(checkIn);

    const end = new Date(checkOut);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {

      return 0;

    }

    const diffTime = Math.abs(end - start);

    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  }, [checkIn, checkOut]);



  // Invoice Breakdown Math

  const invoice = useMemo(() => {

    if (nights <= 0) return null;

    

    let baseTotal = 0;

    const breakdown = [];

    const monthNamesSR = {

      may: 'Maj',

      june: 'Jun',

      july: 'Jul',

      august: 'Avgust',

      september: 'Septembar',

      october: 'Oktobar',

      other: 'Ostali meseci'

    };



    const start = new Date(checkIn);

    const tempBreakdown = {};



    for (let i = 0; i < nights; i++) {

      const currentDate = new Date(start);

      currentDate.setDate(start.getDate() + i);

      const monthIdx = currentDate.getMonth();

      

      let key = 'other';

      if (monthIdx === 4) key = 'may';

      else if (monthIdx === 5) key = 'june';

      else if (monthIdx === 6) key = 'july';

      else if (monthIdx === 7) key = 'august';

      else if (monthIdx === 8) key = 'september';

      else if (monthIdx === 9) key = 'october';



      const priceForNight = (parsedMonthlyPrices && parsedMonthlyPrices[key]) 

        ? parseFloat(parsedMonthlyPrices[key]) 

        : activePrice;



      baseTotal += priceForNight;



      if (!tempBreakdown[key]) {

        tempBreakdown[key] = { name: monthNamesSR[key], count: 0, price: priceForNight };

      }

      tempBreakdown[key].count++;

    }



    Object.keys(tempBreakdown).forEach(k => {

      breakdown.push(tempBreakdown[k]);

    });



    const cleaningFee = 25;

    const touristTax = 1.5 * nights;

    const total = baseTotal + cleaningFee + touristTax;



    return { baseTotal, cleaningFee, touristTax, total, breakdown };

  }, [activePrice, nights, parsedMonthlyPrices, checkIn]);



  // Guest validation check

  const guestCountExceeded = useMemo(() => {

    return parseInt(bookingGuests, 10) > activeMaxGuests;

  }, [bookingGuests, activeMaxGuests]);



  // Carousel handlers

  const handlePrevImage = () => {

    setActiveImgIndex(prev => (prev === 0 ? carouselImages.length - 1 : prev - 1));

  };



  const handleNextImage = () => {

    setActiveImgIndex(prev => (prev === carouselImages.length - 1 ? 0 : prev + 1));

  };



  // Inquiry Submission

  const handleInquirySubmit = (e) => {

    e.preventDefault();

    setInquiryError('');



    if (!currentUser) {

      onOpenAuth();

      return;

    }

    if (guestCountExceeded) {

      setInquiryError(`Greška: Broj gostiju premašuje maksimalni kapacitet objekta (${activeMaxGuests} osobe).`);

      return;

    }

    if (nights <= 0) {

      setInquiryError('Greška: Datum odlaska mora biti posle datuma dolaska.');

      return;

    }

    if (!inquiryName.trim() || !inquiryEmail.trim()) {

      setInquiryError('Molimo popunite sva obavezna polja.');

      return;

    }



    const startD = new Date(checkIn).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });

    const endD = new Date(checkOut).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' });



    const newInquiry = {

      id: Date.now(),

      userId: currentUser.id,

      propertyId: id,

      checkIn: checkIn,

      checkOut: checkOut,

      dates: `${startD} - ${endD}`,

      nights: nights,

      guests: Math.min(parseInt(bookingGuests, 10) || 2, activeMaxGuests),

      totalPrice: invoice.total,

      status: 'Poslato', // Sent status

      message: inquiryMessage,

      roomTitle: selectedRoom ? selectedRoom.title : null

    };



    onAddInquiry(newInquiry);

    setInquirySubmitted(true);

  };



  // Review Submission

  const handleReviewSubmit = (e) => {

    e.preventDefault();

    if (!reviewAuthor.trim() || !reviewComment.trim()) return;



    const newReview = {

      author: reviewAuthor.trim(),

      rating: parseFloat(reviewRating),

      comment: reviewComment.trim()

    };



    onAddReview(id, newReview);

    setReviewSubmitted(true);



    // Reset Form

    setReviewComment('');

    setTimeout(() => {

      setReviewSubmitted(false);

    }, 3000);

  };



  // Map Simulator coordinates & walking calculations

  const walkingTimeMin = Math.round(distanceToBeach / 80) || 1;



  return (

    <div className="property-page-wrapper animate-fade">

      <div className="property-page-container">

        <button className="btn-back-to-search" onClick={onClose} aria-label="Nazad na pretragu">

          &larr; Nazad na pretragu

        </button>

        

        {/* Advanced Gallery Carousel */}

        <div className="modal-gallery">

          {carouselImages.map((imgUrl, idx) => (

            <img 

              key={idx}

              src={imgUrl} 

              alt={`${title} - slika ${idx + 1}`} 

              className={`carousel-slide ${idx === activeImgIndex ? 'active' : ''}`}

              onClick={() => setLightboxIndex(idx)}

              style={{ cursor: 'pointer' }}

            />

          ))}

          

          <button className="btn-carousel prev" onClick={handlePrevImage} aria-label="Prethodna">

            &#10094;

          </button>

          <button className="btn-carousel next" onClick={handleNextImage} aria-label="Sledeća">

            &#10095;

          </button>



          <div className="carousel-dots">

            {carouselImages.map((_, idx) => (

              <span 

                key={idx}

                className={`dot ${idx === activeImgIndex ? 'active' : ''}`}

                onClick={() => setActiveImgIndex(idx)}

              />

            ))}

          </div>

        </div>

        

        <div className="modal-body">

          {/* Left Column (Info, Specs, Amenities, Map, Reviews) */}

          <div className="modal-info-col">

            <div>

              <div className="modal-header-meta">

                <span className="modal-tag">{type}</span>

                <div className="card-rating">

                  <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'var(--secondary)' }}>

                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />

                  </svg>

                  <span style={{ fontSize: '1.05rem', fontWeight: 'bold' }}>{rating.toFixed(1)} / 5.0</span>

                </div>

              </div>

              <h2 className="modal-title">{title}</h2>

              <div className="modal-location">

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>

                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>

                  <circle cx="12" cy="10" r="3"></circle>

                </svg>

                <span>{location}, Grčka</span>

              </div>

            </div>



            <div className="modal-quick-specs">

              <div className="spec-item">

                <span className="spec-icon" style={{ fontSize: '1.2rem', marginRight: '0.4rem' }}>🏖️</span>

                <span>Plaža: <span className="spec-label">{distanceToBeach}m ({walkingTimeMin} min hoda)</span></span>

              </div>

              <div className="spec-item">

                <span className="spec-icon" style={{ fontSize: '1.2rem', marginRight: '0.4rem' }}>👥</span>

                <span>Kapacitet: <span className="spec-label">Maks. {activeMaxGuests} {activeMaxGuests === 1 ? 'osoba' : activeMaxGuests < 5 ? 'osobe' : 'osoba'}</span></span>

              </div>

              <div className="spec-item">

                <span className="spec-icon" style={{ fontSize: '1.2rem', marginRight: '0.4rem' }}>🚪</span>

                <span>Soba: <span className="spec-label">{activeBedrooms} {activeBedrooms === 1 ? 'spavaća soba' : activeBedrooms < 5 ? 'spavaće sobe' : 'spavaćih soba'}</span></span>

              </div>

              <div className="spec-item">

                <span className="spec-icon" style={{ fontSize: '1.2rem', marginRight: '0.4rem' }}>💰</span>

                <span>Cena: <span className="spec-label">od {price}€ / noć</span></span>

              </div>

            </div>



            <div>

              <h3 className="modal-section-title">Opis smeštaja</h3>

              <p className="modal-description">{description}</p>

            </div>



            {/* Tabela sezonskih cena */}

            <div>

              <h3 className="modal-section-title">📊 Sezonski Cenovnik (Cene po noćenju)</h3>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>

                Prikazane su cene po noćenju za mesece u toku sezone. Tokom drugih meseci važi osnovna cena od {price}€/noć.

              </p>

              <div className="pricing-table-container">

                {(() => {

                  const currentMonthIdx = new Date().getMonth(); // 0-indexed (0=Jan, 11=Dec)

                  const monthsMapping = [

                    { name: 'Maj', key: 'may', index: 4 },

                    { name: 'Jun', key: 'june', index: 5 },

                    { name: 'Jul', key: 'july', index: 6 },

                    { name: 'Avgust', key: 'august', index: 7 },

                    { name: 'Septembar', key: 'september', index: 8 },

                    { name: 'Oktobar', key: 'october', index: 9 }

                  ];

                  return monthsMapping.map(m => {

                    const val = parsedMonthlyPrices?.[m.key];

                    const displayVal = (val !== '' && val !== null && val !== undefined) ? val : activePrice;

                    const isCurrent = currentMonthIdx === m.index;

                    

                    return (

                      <div 

                        key={m.key} 

                        className={`pricing-table-card ${isCurrent ? 'current-month' : ''}`}

                      >

                        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: isCurrent ? 'var(--accent)' : 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>

                          {m.name}

                        </span>

                        <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>

                          {displayVal}€

                        </span>

                      </div>

                    );

                  });

                })()}

              </div>

            </div>



            <div>

              <h3 className="modal-section-title">Sadržaj i pogodnosti</h3>

              <div className="rich-amenities-grid">

                {richAmenities.map((amenity) => (

                  <div 

                    key={amenity.id} 

                    className={`rich-amenity-card ${amenity.active ? 'active' : 'inactive'}`}

                  >

                    <span className="rich-amenity-icon">{amenity.icon}</span>

                    <span>{amenity.label}</span>

                  </div>

                ))}

              </div>

            </div>



            {/* Pravila smeštaja & Važne informacije */}

            <div>

              <h3 className="modal-section-title">🕒 Pravila smeštaja & Kućni red</h3>

              <div className="property-rules-card" style={{

                backgroundColor: 'var(--bg-main)',

                border: '1px solid var(--border)',

                borderRadius: 'var(--radius-sm)',

                padding: '1.2rem',

                display: 'grid',

                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',

                gap: '1rem',

                marginTop: '0.8rem',

                fontSize: '0.88rem'

              }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>

                  <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>🕒 Prijavljivanje (Check-in):</span>

                  <strong style={{ color: 'var(--text-main)' }}>od 14:00 do 22:00h</strong>

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>

                  <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>🕒 Odjavljivanje (Check-out):</span>

                  <strong style={{ color: 'var(--text-main)' }}>od 07:00 do 11:00h</strong>

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>

                  <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>🐾 Kućni ljubimci:</span>

                  <strong style={{ color: 'var(--text-main)' }}>{amenities.pets ? "Dozvoljeni (na upit)" : "Nisu dozvoljeni"}</strong>

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>

                  <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>🧹 Čišćenje i higijena:</span>

                  <strong style={{ color: 'var(--text-main)' }}>Svakodnevno čišćenje</strong>

                </div>

              </div>

            </div>



            {roomsList && roomsList.length > 0 && (

              <div>

                <h3 className="modal-section-title">Izaberite smeštajnu jedinicu</h3>

                <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginTop: '1rem' }}>

                  {roomsList.map(room => {

                    const isSelected = selectedRoom && selectedRoom.id === room.id;

                    return (

                      <div 

                        key={room.id}

                        onClick={() => setSelectedRoomId(room.id)}

                        style={{

                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',

                          borderRadius: 'var(--radius-sm)',

                          overflow: 'hidden',

                          cursor: 'pointer',

                          backgroundColor: isSelected ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--card-bg)',

                          boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',

                          transition: 'all 0.2s ease-in-out',

                          position: 'relative'

                        }}

                        className="room-card animate-scale"

                      >

                        {room.image && (

                          <img 

                            src={room.image} 

                            alt={room.title}

                            style={{ width: '100%', height: '140px', objectFit: 'cover', cursor: 'pointer' }}

                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(room.image); }}

                          />

                        )}

                        <div style={{ padding: '0.8rem' }}>

                          <h4 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>{room.title}</h4>

                          {room.description && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.4' }}>{room.description}</p>}

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                              <span>👥 Kapacitet: <strong>{room.guests} osobe</strong></span>

                              <span>🚪 Soba: <strong>{room.bedrooms}</strong></span>

                            </div>

                            {room.bedStructure && (

                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: '0.75rem', marginTop: '0.1rem' }}>

                                <span>🛏️</span>

                                <span style={{ color: 'var(--text-main)' }}>{room.bedStructure}</span>

                              </div>

                            )}

                            {room.kitchenType && (

                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', fontSize: '0.75rem' }}>

                                <span>🍳</span>

                                <span style={{ color: 'var(--text-main)' }}>{room.kitchenType}</span>

                              </div>

                            )}

                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>

                            <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>{room.price}€ <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ noć</span></span>

                            {isSelected && (

                              <span style={{

                                backgroundColor: 'var(--primary)',

                                color: 'white',

                                fontSize: '0.7rem',

                                padding: '0.2rem 0.5rem',

                                borderRadius: '12px',

                                fontWeight: 'bold'

                              }}>

                                Izabrano

                              </span>

                            )}

                          </div>

                        </div>

                      </div>

                    );

                  })}

                </div>

              </div>

            )}



            {/* Real Geografska Mapa (Leaflet) */}

            <div>

              <h3 className="modal-section-title">📍 Geografska Lokacija Smeštaja</h3>

              <div 

                ref={mapContainerRef} 

                style={{ 

                  width: '100%', 

                  height: '320px', 

                  borderRadius: 'var(--radius-sm)', 

                  border: '1px solid var(--border)',

                  boxShadow: 'var(--shadow-sm)',

                  backgroundColor: 'var(--bg-main)',

                  position: 'relative',

                  overflow: 'hidden',

                  zIndex: 5

                }}

              >

                {!leafletLoaded && (

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.9rem' }}>

                    Učitavanje mape...

                  </div>

                )}

              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>

                * Napomena: Koristite tastere +/- na mapi ili točkić miša za detaljno zumiranje ulica, plaža i okolnih puteva.

              </p>

            </div>



            {/* Guest Reviews Section */}

            <div>

              <h3 className="modal-section-title">Utisci gostiju ({reviews.length})</h3>

              

              <div className="reviews-section">

                {reviews.length > 0 ? (

                  reviews.map((rev, index) => (

                    <div key={index} className="review-card animate-fade">

                      <div className="review-header">

                        <span className="review-author">{rev.author}</span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>

                          <div className="review-rating">

                            <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', fill: 'var(--secondary)' }}>

                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />

                            </svg>

                            <span>{rev.rating.toFixed(1)}</span>

                          </div>

                          {currentUser && currentUser.isAdmin && (

                            <button

                              type="button"

                              className="btn-cancel-inquiry"

                              style={{ 

                                padding: '0.2rem 0.4rem', 

                                fontSize: '0.65rem', 

                                borderRadius: '4px',

                                cursor: 'pointer',

                                height: 'auto',

                                marginTop: 0

                              }}

                              onClick={() => {

                                if (confirm(`Da li ste sigurni da želite da obrišete recenziju autora "${rev.author}"?`)) {

                                  onDeleteReview(id, index);

                                }

                              }}

                            >

                              Obriši

                            </button>

                          )}

                        </div>

                      </div>

                      <p className="review-comment">"{rev.comment}"</p>

                    </div>

                  ))

                ) : (

                  <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Još uvek nema recenzija. Budite prvi koji će napisati utiske!</p>

                )}

              </div>



              {/* Add Review Form */}

              <div className="add-review-form">

                <h4 style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>Napišite recenziju</h4>

                {reviewSubmitted ? (

                  <div className="success-message">Hvala Vam! Vaša recenzija je uspešno zabeležena.</div>

                ) : (

                  <form onSubmit={handleReviewSubmit}>

                    <div className="form-field">

                      <label>Vaša ocena</label>

                      <div className="rating-select-stars">

                        {[1, 2, 3, 4, 5].map((star) => (

                          <button

                            key={star}

                            type="button"

                            className={`star-select-btn ${star <= reviewRating ? 'active' : ''}`}

                            onClick={() => setReviewRating(star)}

                          >

                            ★

                          </button>

                        ))}

                      </div>

                    </div>

                    <div className="host-form-grid" style={{ marginBottom: '1rem' }}>

                      <div className="form-field">

                        <label htmlFor="rev-author">Vaše Ime *</label>

                        <input 

                          type="text" 

                          id="rev-author" 

                          value={reviewAuthor} 

                          onChange={(e) => setReviewAuthor(e.target.value)} 

                          placeholder="npr. Marko" 

                          required

                        />

                      </div>

                      <div className="form-field" style={{ gridColumn: 'span 2' }}>

                        <label htmlFor="rev-comment">Vaš utisak *</label>

                        <textarea 

                          id="rev-comment" 

                          value={reviewComment} 

                          onChange={(e) => setReviewComment(e.target.value)} 

                          placeholder="Kako Vam se svideo smeštaj? Opišite sobe, lokaciju, gostoprimstvo..." 

                          rows="3"

                          required

                        />

                      </div>

                    </div>

                    <button type="submit" className="btn-card-details" style={{ width: 'fit-content' }}>

                      Pošalji recenziju

                    </button>

                  </form>

                )}

              </div>

            </div>

          </div>

          

          {/* Right Column: Sticky Booking Trip Planner Invoice panel */}

          <div className="modal-form-col">

            <div className="sticky-form-wrapper">

              <div className="form-price-display">

                <span className="form-price-val">{price}€</span>

                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ noć</span>

              </div>



              {/* Host Trust & Response Badge */}

              <div className="host-trust-card">

                <div className="host-trust-header">

                  <div className="host-trust-avatar-wrapper">

                    <span className="host-trust-icon">👤</span>

                  </div>

                  <div className="host-trust-info">

                    <span className="host-trust-label">Domaćin AURA</span>

                    <span className="host-trust-badge-status">

                      {rating >= 4.8 ? '🏆 Top Domaćin' : '⭐ Pouzdan Domaćin'}

                    </span>

                  </div>

                </div>

                <div className="host-trust-body">

                  <div className="host-trust-metric">

                    <span className="host-metric-icon">⚡</span>

                    <span className="host-metric-text">Odgovara za &lt;30 min</span>

                  </div>

                  <div className="host-trust-metric">

                    <span className="host-metric-icon">🔒</span>

                    <span className="host-metric-text">Sigurna rezervacija bez provizije</span>

                  </div>

                </div>

              </div>

              

              {!currentUser ? (

                // Guest Prompt to Login

                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-scale">

                  <h4 style={{ fontWeight: '700', color: 'var(--primary)' }}>Rezervišite Smeštaj</h4>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>

                    Da biste poslali upit našem timu i pratili status svojih rezervacija, molimo Vas da se prijavite na svoj profil.

                  </p>

                  <button 

                    type="button" 

                    className="btn-submit-inquiry" 

                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary-light))' }}

                    onClick={onOpenAuth}

                  >

                    Prijavi se za rezervaciju

                  </button>

                </div>

              ) : inquirySubmitted ? (

                <div className="success-message animate-scale">

                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '0.5rem', color: 'var(--success)' }}>

                    <polyline points="20 6 9 17 4 12"></polyline>

                  </svg>

                  <p>Upit je uspešno poslat!</p>

                  <p style={{ fontWeight: 'normal', fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-main)' }}>

                    Upit je zabeležen na Vašem profilu. Naš tim će Vas kontaktirati na email <strong>{inquiryEmail}</strong>.

                  </p>

                </div>

              ) : (

                <form className="inquiry-form" onSubmit={handleInquirySubmit}>

                  <h4 style={{ fontWeight: '700', marginBottom: '0.8rem', color: 'var(--primary)' }}>Planer Putovanja</h4>

                  

                  {inquiryError && (

                    <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '600', padding: '0.5rem', backgroundColor: 'rgba(230, 57, 70, 0.1)', borderRadius: '4px' }}>

                      {inquiryError}

                    </div>

                  )}



                  {guestCountExceeded && (

                    <div style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: '500', padding: '0.5rem', backgroundColor: 'rgba(230, 57, 70, 0.08)', borderRadius: '4px' }}>

                      ⚠️ Upozorenje: Prekoračen je maksimalni kapacitet smeštaja za {maxGuests} osobe!

                    </div>

                  )}



                  <div ref={calendarRef} style={{ position: 'relative' }}>

                    <div className="host-form-grid" style={{ marginBottom: '0.8rem' }}>

                      <div 

                        className="form-field" 

                        onClick={() => setShowCalendar(!showCalendar)} 

                        style={{ cursor: 'pointer' }}

                      >

                        <label style={{ cursor: 'pointer' }}>Dolazak (Check-In)</label>

                        <div className="date-display-box" style={{ cursor: 'pointer' }}>

                          {checkIn ? new Date(checkIn).toLocaleDateString('sr-RS') : "Izaberite datum"}

                        </div>

                      </div>

                      <div 

                        className="form-field" 

                        onClick={() => setShowCalendar(!showCalendar)} 

                        style={{ cursor: 'pointer' }}

                      >

                        <label style={{ cursor: 'pointer' }}>Odlazak (Check-Out)</label>

                        <div className="date-display-box" style={{ cursor: 'pointer' }}>

                          {checkOut ? new Date(checkOut).toLocaleDateString('sr-RS') : "Izaberite datum"}

                        </div>

                      </div>

                    </div>



                    {showCalendar && (

                      <div className="calendar-container animate-scale">

                        <div className="calendar-nav-header">

                          <button type="button" className="btn-calendar-nav" onClick={handlePrevMonth} title="Prethodni mesec">&larr;</button>

                          <span className="calendar-nav-label">Izaberite datume boravka</span>

                          <button type="button" className="btn-calendar-nav" onClick={handleNextMonth} title="Sledeći mesec">&rarr;</button>

                        </div>

                        <div className="calendar-months-wrapper">

                          {(() => {

                            const renderCalendarMonth = (dateObj) => {

                              const year = dateObj.getFullYear();

                              const month = dateObj.getMonth();

                              const monthDays = generateMonthDays(year, month);

                              const monthName = SERBIAN_MONTHS[month];

                              

                              return (

                                <div className="calendar-month-box">

                                  <div className="calendar-month-title">

                                    {monthName} {year}

                                  </div>

                                  <div className="calendar-weekdays-grid">

                                    <span>Po</span>

                                    <span>Ut</span>

                                    <span>Sr</span>

                                    <span>Če</span>

                                    <span>Pe</span>

                                    <span>Su</span>

                                    <span>Ne</span>

                                  </div>

                                  <div className="calendar-days-grid">

                                    {monthDays.map((day, idx) => {

                                      if (!day) {

                                        return <div key={`empty-${idx}`} className="calendar-day empty"></div>;

                                      }

                                      

                                      const dateStr = getFormattedDateString(day);

                                      const isBooked = isDateBooked(dateStr);

                                      const isPast = dateStr < todayStr;

                                      

                                      let dayClass = "calendar-day";

                                      if (isBooked) dayClass += " booked";

                                      else if (isPast) dayClass += " past";

                                      

                                      const isCheckIn = checkIn === dateStr;

                                      const isCheckOut = checkOut === dateStr;

                                      const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

                                      

                                      if (isCheckIn) dayClass += " selected-checkin";

                                      if (isCheckOut) dayClass += " selected-checkout";

                                      if (isInRange) dayClass += " selected-range";

                                      

                                      const handleDayClick = () => {

                                        if (isBooked || isPast) return;

                                        

                                        if (!checkIn || (checkIn && checkOut)) {

                                          setCheckIn(dateStr);

                                          setCheckOut('');

                                        } else {

                                          if (dateStr < checkIn) {

                                            setCheckIn(dateStr);

                                          } else if (dateStr > checkIn) {

                                            if (isRangeBooked(checkIn, dateStr)) {

                                              setCheckIn(dateStr);

                                            } else {

                                              setCheckOut(dateStr);

                                              setShowCalendar(false); // Close calendar on selection complete

                                            }

                                          } else {

                                            setCheckIn('');

                                          }

                                        }

                                      };

                                      

                                      return (

                                        <div 

                                          key={dateStr} 

                                          className={dayClass}

                                          onClick={handleDayClick}

                                          title={isBooked ? "Zauzeto" : isPast ? "Prošlost" : dateStr}

                                        >

                                          {day.getDate()}

                                        </div>

                                      );

                                    })}

                                  </div>

                                </div>

                              );

                            };



                            return renderCalendarMonth(calendarMonth);

                          })()}

                        </div>

                        {(checkIn || checkOut) && (

                          <button 

                            type="button" 

                            className="btn-clear-dates"

                            onClick={() => { setCheckIn(''); setCheckOut(''); }}

                          >

                            ✕ Poništi selekciju datuma

                          </button>

                        )}

                      </div>

                    )}

                  </div>



                  <div className="form-field">

                    <label htmlFor="booking-guests">Broj gostiju</label>

                    <select 

                      id="booking-guests" 

                      value={Math.min(parseInt(bookingGuests, 10) || 2, activeMaxGuests)} 

                      onChange={(e) => setBookingGuests(e.target.value)}

                    >

                      {Array.from({ length: activeMaxGuests }, (_, i) => i + 1).map(n => (

                        <option key={n} value={n}>{n} {n === 1 ? 'gost' : n < 5 ? 'gosta' : 'gostiju'}</option>

                      ))}

                    </select>

                  </div>



                  {/* Dynamically calculated invoice breakdown */}

                  {invoice && (

                    <div className="booking-invoice-breakdown animate-scale">

                      {invoice.breakdown && invoice.breakdown.map((item, idx) => (

                        <div className="invoice-row" key={idx}>

                          <span>🗓️ {item.name}: {item.count} x {item.price}€</span>

                          <span>{item.count * item.price}€</span>

                        </div>

                      ))}

                      <div className="invoice-row">

                        <span>Čišćenje objekta</span>

                        <span>{invoice.cleaningFee}€</span>

                      </div>

                      <div className="invoice-row">

                        <span>Boravišna taksa</span>

                        <span>{invoice.touristTax}€</span>

                      </div>

                      <div className="invoice-row total">

                        <span>Ukupno za plaćanje</span>

                        <span>{invoice.total}€</span>

                      </div>

                    </div>

                  )}



                  <div className="form-field">

                    <label htmlFor="inq-name">Ime i Prezime *</label>

                    <input 

                      type="text" 

                      id="inq-name" 

                      value={inquiryName} 

                      onChange={(e) => setInquiryName(e.target.value)} 

                      placeholder="npr. Stefan Petrović" 

                      required 

                    />

                  </div>

                  

                  <div className="form-field">

                    <label htmlFor="inq-email">E-mail adresa *</label>

                    <input 

                      type="email" 

                      id="inq-email" 

                      value={inquiryEmail} 

                      onChange={(e) => setInquiryEmail(e.target.value)} 

                      placeholder="npr. stefan@email.com" 

                      required 

                    />

                  </div>

                  

                  <div className="form-field">

                    <label htmlFor="inq-msg">Dodatna poruka</label>

                    <textarea 

                      id="inq-msg" 

                      value={inquiryMessage} 

                      onChange={(e) => setInquiryMessage(e.target.value)} 

                      rows="1" 

                    />

                  </div>

                  

                  <button type="submit" className="btn-submit-inquiry" disabled={guestCountExceeded || nights <= 0}>

                    Pošalji Upit

                  </button>

                </form>

              )}

            </div>

          </div>

        </div>

      </div>

      

      {/* Mobile Floating Bar */}

      <div className="mobile-floating-booking-bar">

        <div className="price-info">

          <span className="price">{price}€</span>

          <span className="night">/ noć</span>

        </div>

        <button 

          className="btn-check-availability"

          onClick={() => {

            const formElement = document.querySelector('.sticky-form-wrapper');

            if (formElement) {

              formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

            }

          }}

        >

          Proveri dostupnost

        </button>

      </div>



      {/* Lightbox for Full Image View */}

      {lightboxIndex !== null && createPortal(

        <div 

          className="lightbox-overlay"

          onClick={() => setLightboxIndex(null)}

        >

          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>

            <button className="lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Zatvori">

              &times;

            </button>

            

            {typeof lightboxIndex === 'number' && (

              <button 

                className="btn-lightbox-nav prev" 

                onClick={() => setLightboxIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}

                aria-label="Prethodna slika"

              >

                &#10094;

              </button>

            )}



            <div className="lightbox-img-wrapper" onClick={() => setLightboxIndex(null)}>

              <img 

                src={typeof lightboxIndex === 'number' ? carouselImages[lightboxIndex] : lightboxIndex} 

                alt="Smeštaj Uvećano" 

                className="lightbox-img" 

                onClick={(e) => e.stopPropagation()}

              />

            </div>



            {typeof lightboxIndex === 'number' && (

              <button 

                className="btn-lightbox-nav next" 

                onClick={() => setLightboxIndex((prev) => (prev + 1) % carouselImages.length)}

                aria-label="Sledeća slika"

              >

                &#10095;

              </button>

            )}

          </div>

        </div>,

        document.body

      )}

    </div>

  );

}

