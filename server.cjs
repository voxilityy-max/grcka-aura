require('dotenv').config();
const express = require('express');
const cors = require('cors');
let sqlite3;
const { createClient } = require('@libsql/client');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'aura_jwt_secret_key_2026';

// In-memory active users tracker (userId -> lastSeenTimestamp)
const activeUsers = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Setup local uploads dir if local fallback is used
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Database connection logic
const useTurso = !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
let db;
let client;

if (useTurso) {
  console.log('Spajam se na Turso Cloud bazu podataka:', process.env.TURSO_DATABASE_URL);
  client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });
} else {
  // Ako smo na Renderu (ili produkciji), Turso je obavezan jer lokalni SQLite nije perzistentan i sqlite3 drajver puca zbog GLIBC verzije.
  if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    console.error('\n========================================================================');
    console.error('Kritična greška: Pokušavate da pokrenete aplikaciju na produkciji/Renderu bez Turso baze.');
    console.error('Lokalna SQLite baza (sqlite3) ne može biti učitana zbog GLIBC nekompatibilnosti.');
    console.error('Molimo vas da dodate sledeće Environment Variables u vašem Render Dashboard-u:');
    console.error('  1. TURSO_DATABASE_URL (npr. libsql://grcka-aura...)');
    console.error('  2. TURSO_AUTH_TOKEN (vaš Turso JWT token)');
    console.error('========================================================================\n');
    process.exit(1);
  }

  try {
    sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'database.sqlite');
    console.log('Spajam se na lokalnu SQLite baju podataka:', dbPath);
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Greška pri povezivanju sa SQLite bazom:', err.message);
      } else {
        checkAndInitializeSchema();
      }
    });
  } catch (err) {
    console.error('\n========================================================================');
    console.error('Kritična greška: Neuspešno učitavanje sqlite3 drajvera.');
    console.error('Detalji greške:', err.message);
    console.error('Ako pokrećete na cloud serveru (Render, Heroku, itd.), MORATE podesiti:');
    console.error('  TURSO_DATABASE_URL i TURSO_AUTH_TOKEN');
    console.error('kako bi aplikacija koristila Turso Cloud bazu podataka umesto lokalne.');
    console.error('========================================================================\n');
    process.exit(1);
  }
}

// Database Helper (Abstraction Layer)
const dbHelper = {
  run: (sql, params = []) => {
    if (useTurso) {
      return client.execute({ sql, args: params }).then(res => ({
        lastID: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : null,
        changes: res.rowsAffected
      }));
    } else {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
  },
  get: (sql, params = []) => {
    if (useTurso) {
      return client.execute({ sql, args: params }).then(res => res.rows[0] || null);
    } else {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
  },
  all: (sql, params = []) => {
    if (useTurso) {
      return client.execute({ sql, args: params }).then(res => res.rows);
    } else {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
  },
  serialize: async (fn) => {
    if (useTurso) {
      await fn();
    } else {
      await new Promise((resolve) => {
        db.serialize(() => {
          fn().then(resolve);
        });
      });
    }
  }
};

async function checkAndInitializeSchema() {
  await dbHelper.serialize(async () => {
    // Enable Foreign Keys if supported
    await dbHelper.run('PRAGMA foreign_keys = ON');
    
    // Check if checkIn column exists in inquiries table
    try {
      const columns = await dbHelper.all("PRAGMA table_info(inquiries)");
      if (columns && columns.length > 0) {
        const hasCheckIn = columns.some(c => c.name === 'checkIn');
        if (!hasCheckIn) {
          console.log('Detektovana stara struktura tabele inquiries. Resetujem bazu...');
          await dbHelper.run('DROP TABLE IF EXISTS chat_messages');
          await dbHelper.run('DROP TABLE IF EXISTS inquiries');
          await dbHelper.run('DROP TABLE IF EXISTS reviews');
          await dbHelper.run('DROP TABLE IF EXISTS properties');
          await dbHelper.run('DROP TABLE IF EXISTS users');
          await dbHelper.run('DROP TABLE IF EXISTS activity_logs');
          await dbHelper.run('DROP TABLE IF EXISTS forum_posts');
        }
      }
    } catch (err) {
      // In remote Turso / some setups PRAGMA info might fail, we just catch and proceed
    }
    
    await initializeSchema();
    // Pokretanje automatske sinhronizacije kalendara u pozadini
    startBackgroundICalSync();
  });
}

// Start connection & initialize schema if Turso is used
if (useTurso) {
  checkAndInitializeSchema();
}

// Database Schema Initialization
async function initializeSchema() {
  // 1. Users Table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    fullName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    isAdmin INTEGER DEFAULT 0,
    isHost INTEGER DEFAULT 0,
    isVerified INTEGER DEFAULT 0,
    verificationDetails TEXT,
    verificationDocs TEXT,
    agreedToTerms INTEGER DEFAULT 0
  )`);

  // Add isHost column to users table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(users)");
    const hasIsHost = columns.some(c => c.name === 'isHost');
    if (!hasIsHost) {
      await dbHelper.run("ALTER TABLE users ADD COLUMN isHost INTEGER DEFAULT 0");
      console.log("Dodata kolona 'isHost' u tabelu users.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone isHost u users:", err.message);
  }

  // Add verification columns if they do not exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(users)");
    const hasIsVerified = columns.some(c => c.name === 'isVerified');
    if (!hasIsVerified) {
      await dbHelper.run("ALTER TABLE users ADD COLUMN isVerified INTEGER DEFAULT 0");
      console.log("Dodata kolona 'isVerified' u tabelu users.");
    }
    const hasVerificationDetails = columns.some(c => c.name === 'verificationDetails');
    if (!hasVerificationDetails) {
      await dbHelper.run("ALTER TABLE users ADD COLUMN verificationDetails TEXT");
      console.log("Dodata kolona 'verificationDetails' u tabelu users.");
    }
    const hasVerificationDocs = columns.some(c => c.name === 'verificationDocs');
    if (!hasVerificationDocs) {
      await dbHelper.run("ALTER TABLE users ADD COLUMN verificationDocs TEXT");
      console.log("Dodata kolona 'verificationDocs' u tabelu users.");
    }
    const hasAgreedToTerms = columns.some(c => c.name === 'agreedToTerms');
    if (!hasAgreedToTerms) {
      await dbHelper.run("ALTER TABLE users ADD COLUMN agreedToTerms INTEGER DEFAULT 0");
      console.log("Dodata kolona 'agreedToTerms' u tabelu users.");
    }
    const hasWishlist = columns.some(c => c.name === 'wishlist');
    if (!hasWishlist) {
      await dbHelper.run("ALTER TABLE users ADD COLUMN wishlist TEXT");
      console.log("Dodata kolona 'wishlist' u tabelu users.");
    }
    const hasAdminPermissions = columns.some(c => c.name === 'adminPermissions');
    if (!hasAdminPermissions) {
      await dbHelper.run("ALTER TABLE users ADD COLUMN adminPermissions TEXT DEFAULT '[]'");
      console.log("Dodata kolona 'adminPermissions' u tabelu users.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje verifikacionih/wishlist kolona u users:", err.message);
  }

  // 2. Properties Table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    price INTEGER NOT NULL,
    rating REAL NOT NULL,
    distanceToBeach INTEGER NOT NULL,
    image TEXT NOT NULL,
    guests INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    description TEXT,
    wifi INTEGER DEFAULT 0,
    pool INTEGER DEFAULT 0,
    beachfront INTEGER DEFAULT 0,
    parking INTEGER DEFAULT 0,
    airConditioning INTEGER DEFAULT 0,
    pets INTEGER DEFAULT 0,
    isApproved INTEGER DEFAULT 1
  )`);

  // 3. Reviews Table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    propertyId INTEGER NOT NULL,
    author TEXT NOT NULL,
    rating REAL NOT NULL,
    comment TEXT NOT NULL,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
  )`);

  // 4. Inquiries Table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    propertyId INTEGER NOT NULL,
    checkIn TEXT NOT NULL,
    checkOut TEXT NOT NULL,
    dates TEXT,
    nights INTEGER NOT NULL,
    guests INTEGER NOT NULL,
    totalPrice INTEGER NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
  )`);

  // 5. Chat Messages Table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inquiryId INTEGER NOT NULL,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (inquiryId) REFERENCES inquiries(id) ON DELETE CASCADE
  )`);

  // 6. Activity Logs Table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    user TEXT NOT NULL,
    action TEXT NOT NULL,
    type TEXT NOT NULL
  )`);

  // 7. Forum Posts Table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    repliesCount INTEGER DEFAULT 0,
    timestamp TEXT NOT NULL
  )`);

  // 8. Rooms Table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    propertyId INTEGER NOT NULL,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    guests INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    image TEXT,
    description TEXT,
    icalUrl TEXT,
    bedStructure TEXT,
    kitchenType TEXT,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
  )`);

  // 9. Admin Notifications Table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS admin_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    isRead INTEGER DEFAULT 0
  )`);


  // Add roomTitle column to inquiries table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(inquiries)");
    const hasRoomTitle = columns.some(c => c.name === 'roomTitle');
    if (!hasRoomTitle) {
      await dbHelper.run("ALTER TABLE inquiries ADD COLUMN roomTitle TEXT");
      console.log("Dodata kolona 'roomTitle' u tabelu inquiries.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone roomTitle:", err.message);
  }

  // Add icalUrl column to properties table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(properties)");
    const hasIcalUrl = columns.some(c => c.name === 'icalUrl');
    if (!hasIcalUrl) {
      await dbHelper.run("ALTER TABLE properties ADD COLUMN icalUrl TEXT");
      console.log("Dodata kolona 'icalUrl' u tabelu properties.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone icalUrl u properties:", err.message);
  }

  // Add icalUrl column to rooms table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(rooms)");
    const hasIcalUrl = columns.some(c => c.name === 'icalUrl');
    if (!hasIcalUrl) {
      await dbHelper.run("ALTER TABLE rooms ADD COLUMN icalUrl TEXT");
      console.log("Dodata kolona 'icalUrl' u tabelu rooms.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone icalUrl u rooms:", err.message);
  }

  // Add bedStructure column to rooms table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(rooms)");
    const hasBedStructure = columns.some(c => c.name === 'bedStructure');
    if (!hasBedStructure) {
      await dbHelper.run("ALTER TABLE rooms ADD COLUMN bedStructure TEXT");
      console.log("Dodata kolona 'bedStructure' u tabelu rooms.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone bedStructure u rooms:", err.message);
  }

  // Add kitchenType column to rooms table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(rooms)");
    const hasKitchenType = columns.some(c => c.name === 'kitchenType');
    if (!hasKitchenType) {
      await dbHelper.run("ALTER TABLE rooms ADD COLUMN kitchenType TEXT");
      console.log("Dodata kolona 'kitchenType' u tabelu rooms.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone kitchenType u rooms:", err.message);
  }

  // Add lastSynced column to properties table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(properties)");
    const hasLastSynced = columns.some(c => c.name === 'lastSynced');
    if (!hasLastSynced) {
      await dbHelper.run("ALTER TABLE properties ADD COLUMN lastSynced INTEGER DEFAULT 0");
      console.log("Dodata kolona 'lastSynced' u tabelu properties.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone lastSynced u properties:", err.message);
  }

  // Add monthlyPrices column to properties table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(properties)");
    const hasMonthlyPrices = columns.some(c => c.name === 'monthlyPrices');
    if (!hasMonthlyPrices) {
      await dbHelper.run("ALTER TABLE properties ADD COLUMN monthlyPrices TEXT");
      console.log("Dodata kolona 'monthlyPrices' u tabelu properties.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone monthlyPrices u properties:", err.message);
  }

  // Add ownerEmail column to properties table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(properties)");
    const hasOwnerEmail = columns.some(c => c.name === 'ownerEmail');
    if (!hasOwnerEmail) {
      await dbHelper.run("ALTER TABLE properties ADD COLUMN ownerEmail TEXT");
      console.log("Dodata kolona 'ownerEmail' u tabelu properties.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone ownerEmail u properties:", err.message);
  }

  // Add ownerPhone column to properties table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(properties)");
    const hasOwnerPhone = columns.some(c => c.name === 'ownerPhone');
    if (!hasOwnerPhone) {
      await dbHelper.run("ALTER TABLE properties ADD COLUMN ownerPhone TEXT");
      console.log("Dodata kolona 'ownerPhone' u tabelu properties.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone ownerPhone u properties:", err.message);
  }

  // Add isApproved column to properties table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(properties)");
    const hasIsApproved = columns.some(c => c.name === 'isApproved');
    if (!hasIsApproved) {
      await dbHelper.run("ALTER TABLE properties ADD COLUMN isApproved INTEGER DEFAULT 1");
      console.log("Dodata kolona 'isApproved' u tabelu properties.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone isApproved u properties:", err.message);
  }

  // Add monthlyPrices column to rooms table if it doesn't exist
  try {
    const columns = await dbHelper.all("PRAGMA table_info(rooms)");
    const hasMonthlyPrices = columns.some(c => c.name === 'monthlyPrices');
    if (!hasMonthlyPrices) {
      await dbHelper.run("ALTER TABLE rooms ADD COLUMN monthlyPrices TEXT");
      console.log("Dodata kolona 'monthlyPrices' u tabelu rooms.");
    }
  } catch (err) {
    console.warn("Nije uspelo automatsko dodavanje kolone monthlyPrices u rooms:", err.message);
  }

  // Create calendar_blocks table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS calendar_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    propertyId INTEGER NOT NULL,
    roomTitle TEXT,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    source TEXT NOT NULL,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
  )`);

  // Create admin_action_requests table
  await dbHelper.run(`CREATE TABLE IF NOT EXISTS admin_action_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requesterId INTEGER,
    requesterName TEXT,
    actionType TEXT,
    targetId TEXT,
    targetTitle TEXT,
    proposedContent TEXT,
    status TEXT DEFAULT 'pending',
    reason TEXT,
    timestamp TEXT
  )`);

  // Seed database if empty
  await seedDatabase();
}

// Database Seeding Logic
async function seedDatabase() {
  try {
    const row = await dbHelper.get('SELECT COUNT(*) as count FROM users');
    if (!row || Number(row.count) > 0) return; // Already seeded

    console.log('Baza je prazna. Pokrećem popunjavanje inicijalnim podacima (seeding)...');

    await dbHelper.serialize(async () => {
      // 1. Seed Users (with hashed passwords)
      const hashedPassword = bcrypt.hashSync('password', 10);
      const hashedOwnerPassword = bcrypt.hashSync('pakovanje1337', 10);

      const defaultAdminPerms = JSON.stringify(["properties", "inquiries", "users", "logs", "forum_edit", "forum_delete"]);
      const seedUsers = [
        [999, 'stefan', 'Stefan Petrović', 'stefan@email.com', hashedPassword, '+381 60 123 4567', 'https://ui-avatars.com/api/?name=Stefan+Petrovic&background=0a4f70&color=fff', 1, 0, 1, defaultAdminPerms],
        [1000, 'vlasnik_ellinas', 'Vlasnik Ellinas', 'voxilityy@gmail.com', hashedOwnerPassword, '+381 60 111 2233', 'https://ui-avatars.com/api/?name=Vlasnik+Ellinas&background=00b4d8&color=fff', 1, 1, 1, defaultAdminPerms]
      ];

      for (const u of seedUsers) {
        await dbHelper.run('INSERT OR REPLACE INTO users (id, username, fullName, email, password, phone, avatar, isAdmin, isHost, isVerified, adminPermissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', u);
      }

      // 2. Seed Properties
      const seedProperties = [
        [1, 'Kamena Vila Horizon Lefkada', 'Vila', 'Lefkada', 125, 4.9, 150, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 6, 3, 'Tradicionalna kamena vila sa privatnim bazenom, modernim enterijerom i panoramskim pogledom na Jonsko more. Smeštena je u mirnom brdovitom predelu, na samo 3 minuta vožnje od poznate plaže Katizma. Vila ima prostranu terasu, spoljni roštilj i potpuno opremljenu kuhinju.', 1, 1, 0, 1, 1, 1],
        [2, 'Apartmani Golden Beach Thassos', 'Apartman', 'Tasos', 55, 4.7, 20, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', 4, 1, 'Moderno opremljeni apartmani na samoj obali mora na čuvenoj Zlatnoj plaži na Tasosu. Zakoračite direktno iz dvorišta na pesak. Svaki apartman poseduje privatni balkon sa pogledom na more, čajnu kuhinju i besplatne ležaljke na plaži ispred objekta.', 1, 0, 1, 1, 1, 0],
        [3, 'Aegean Pearl Premium Resort', 'Hotel', 'Krit', 195, 4.8, 50, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 3, 1, 'Luksuzni hotel sa 5 zvezdica, bogatim doručkom, sopstvenom privatnom plažom i velikim infinity bazenom. Nalazi se na pešačelom udaljenosti od šarmantnog starog grada. Nudimo spa centar, teretanu i vrhunski restoran mediteranske kuhinje.', 1, 1, 1, 1, 1, 1],
        [4, 'Porodični Apartman Maria Kassandra', 'Apartman', 'Kasandra', 45, 4.5, 450, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', 4, 2, 'Komforan i povoljan porodični apartman u mirnom delu Pefkohorija, idealan za porodice sa decom. Poseduje veliku ograđenu terasu u hladovini, kompletno opremljenu kuhinju sa velikim frižiderom i privatno parking mesto.', 1, 0, 0, 1, 1, 0],
        [5, 'Vila Blue Wave Nikiti Sitonija', 'Vila', 'Sitonija', 155, 4.9, 80, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 8, 4, 'Luksuzna i prostrana vila za veće grupe i porodice, na samo par koraka od prelepe peščane plaže u Nikitiju. Vila ima lepo uređeno travnato dvorište, spoljni tuš, garnituru za sedenje i ležaljke. Sve sobe su klimatizovane.', 1, 0, 1, 1, 1, 1],
        [6, 'Hotel Paradise View Athos', 'Hotel', 'Halkidiki', 90, 4.6, 300, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 2, 1, 'Udoban hotel u blizini Svete Gore i grada Uranopolisa sa prelepim panoramskim pogledom na ostrvo Amuljani. Nudi bogat doručak na bazi švedskog stola, bazen u sklopu hotela i bar pored bazena sa osvežavajućim koktelima.', 1, 1, 0, 1, 1, 0]
      ];

      for (const p of seedProperties) {
        await dbHelper.run('INSERT OR REPLACE INTO properties (id, title, type, location, price, rating, distanceToBeach, image, guests, bedrooms, description, wifi, pool, beachfront, parking, airConditioning, pets) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', p);
      }

      // 3. Seed Reviews
      const seedReviews = [
        [1, 'Nikola M.', 5.0, 'Pogled sa terase je nestvaran! Bazen je izuzetno čist, a domaćin nas je sačekao sa domaćim vinom.'],
        [1, 'Jelena K.', 4.8, 'Predivna i prostrana vila. Tiho i mirno okruženje, idealno za odmor sa porodicom.'],
        [2, 'Marko S.', 5.0, 'Lokacija je bez premca! Doručak na balkonu uz šum talasa je nešto neprocenjivo.'],
        [2, 'Milica P.', 4.4, 'Veoma uredno i čisto. Blizu su restorani i supermarketi. Topla preporuka!'],
        [3, 'Petar Z.', 5.0, 'Vrhunska usluga i neverovatno osoblje. Spa centar je odličan.'],
        [3, 'Anja V.', 4.6, 'Hrana u restoranu je fantastična. Sobe su prostrane i luksuzne.'],
        [4, 'Dragan D.', 4.5, 'Odličan odnos cene i kvaliteta. Domaćica Maria je izuzetno prijatna žena.'],
        [5, 'Jovan J.', 5.0, 'Kuća je savršena za dve porodice sa decom. Dvorište je bezbedno i prelepo.'],
        [6, 'Stefan R.', 4.6, 'Jako lepe i čiste sobe, pogled na more sa terase oduzima dah.']
      ];

      for (const r of seedReviews) {
        await dbHelper.run('INSERT INTO reviews (propertyId, author, rating, comment) VALUES (?, ?, ?, ?)', r);
      }

      // 4. Seed Inquiries (with checkIn and checkOut)
      await dbHelper.run("INSERT OR REPLACE INTO inquiries (id, userId, propertyId, checkIn, checkOut, dates, nights, guests, totalPrice, status, message) VALUES (888, 999, 2, '2026-07-15', '2026-07-25', '15. Jul - 25. Jul', 10, 4, 580, 'Odobreno', 'Dobar dan, slali smo upit za apartman, radujemo se dolasku!')");

      // 5. Seed Chat Messages
      await dbHelper.run("INSERT INTO chat_messages (inquiryId, sender, text, timestamp) VALUES (888, 'client', 'Dobar dan, slali smo upit za apartman, radujemo se dolasku!', '15. Jul u 12:00')");

      // 6. Seed Activity Logs
      await dbHelper.run("INSERT INTO activity_logs (timestamp, user, action, type) VALUES ('19.06.2026. u 20:00', 'Sistem', 'Inicijalizovan portal sa fabričkim podacima.', 'create')");

      // 7. Seed Forum Posts
      const seedForum = [
        ['Koji put izabrati za Tasos?', 'Nikola K.', 'Pozdrav svima, planiram put na Tasos u julu. Koja je preporuka za trasu - preko Bugarske ili Severne Makedonije? Gde je bolji kolovoz i manje gužve na granicama?', 1, 'Pre 2 dana u 14:32'],
        ['Cene ležaljki u Nikitiju - Sitonija', 'Jelena S.', 'Može li neko ko je trenutno u Nikitiju da napiše kakve su cene na plažama? Da li se ležaljke dobijaju uz naručeno piće ili se plaćaju posebno, i koliki je minimalni ceh?', 0, 'Pre 4 dana u 09:15']
      ];

      for (const f of seedForum) {
        await dbHelper.run('INSERT INTO forum_posts (title, author, content, repliesCount, timestamp) VALUES (?, ?, ?, ?, ?)', f);
      }

      // 8. Seed Rooms if empty
      const roomsRow = await dbHelper.get('SELECT COUNT(*) as count FROM rooms');
      if (!roomsRow || Number(roomsRow.count) === 0) {
        console.log('Popunjavam tabelu rooms inicijalnim podacima...');
        const seedRooms = [
          [1, 'Standardna Trokrevetna Soba', 95, 3, 1, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', 'Standardna soba sa pogledom na planinu i jednim francuskim krevetom.', '1 francuski ležaj, 1 singl krevet', 'Čajna kuhinja (mini-rešo)'],
          [1, 'Deluxe Apartman sa pogledom na more', 125, 4, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 'Luksuzan dvosobni apartman sa sopstvenim balkonom i velikom kadom.', '1 francuski ležaj, 2 singl kreveta', 'Kompletna kuhinja sa rernom'],
          [1, 'Predsednički Dupleks sa terasom', 180, 6, 3, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', 'Najekskluzivniji smeštaj u vili na dva nivoa sa đakuzijem na terasi.', '2 francuska ležaja, 2 singl kreveta', 'Luksuzna kuhinja sa aparatom za kafu'],

          [2, 'Jednosoban Apartman (Prizemlje)', 45, 3, 1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', 'Jednostavan porodični apartman u prizemlju sa direktnim izlazom u dvorište.', '1 francuski ležaj, 1 singl krevet', 'Čajna kuhinja sa frižiderom'],
          [2, 'Studio sa pogledom na more (Sprat)', 55, 2, 1, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', 'Romantičan studio za parove sa prelepim pogledom na more sa balkona.', '1 francuski ležaj', 'Čajna kuhinja / rešo'],
          
          [3, 'Standard Room (Bez balkona)', 140, 2, 1, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', 'Udobna standardna soba, idealna za kraće boravke.', '1 francuski ležaj', 'Mini frižider i kuvalo za vodu'],
          [3, 'Superior Sea View Room', 195, 3, 1, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', 'Komforna soba na višim spratovima sa frontalnim pogledom na Egejsko more.', '1 francuski ležaj, 1 singl krevet', 'Čajna kuhinja sa rešoom'],
          
          [4, 'Apartman sa jednom spavaćom sobom', 35, 3, 1, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', 'Povoljan apartman za manju porodicu, opremljen čajnom kuhinjom.', '1 francuski ležaj, 1 singl krevet', 'Čajna kuhinja'],
          [4, 'Porodični dvosobni apartman', 45, 5, 2, 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80', 'Veliki prostrani apartman sa dve spavaće sobe i terasom.', '1 francuski ležaj, 3 singl kreveta', 'Kompletna kuhinja'],

          [5, 'Četvorokrevetni apartman', 120, 4, 2, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', 'Komforan apartman sa dve spavaće sobe, idealan za dve porodice.', '1 francuski ležaj, 2 singl kreveta', 'Kompletna kuhinja sa trpezarijom'],
          [5, 'Deluxe Vila na plaži', 155, 8, 4, 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80', 'Cela kuća sa sopstvenim dvorištem na samoj peščanoj plaži.', '2 francuska ležaja, 4 singl kreveta', 'Kompletna kuhinja sa mašinom za sudove'],

          [6, 'Double Standard Room', 80, 2, 1, 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80', 'Dvokrevetna soba sa bračnim krevetom ili dva odvojena ležaja.', '1 francuski ležaj', 'Mini čajna kuhinja'],
          [6, 'Triple Superior Room', 90, 3, 1, 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80', 'Soba sa bračnim krevetom i jednim pomoćnim krevetom sa pogledom na bazen.', '1 francuski ležaj, 1 singl krevet', 'Čajna kuhinja sa frižiderom i rešoom']
        ];
        for (const rm of seedRooms) {
          await dbHelper.run('INSERT INTO rooms (propertyId, title, price, guests, bedrooms, image, description, bedStructure, kitchenType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', rm);
        }
        console.log('Seeding rooms table done.');
      }

      // Ažuriranje kreveta i kuhinja za već postojeće sobe ako su prazne
      try {
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj, 1 singl krevet', kitchenType = 'Čajna kuhinja (mini-rešo)' WHERE title = 'Standardna Trokrevetna Soba' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj, 2 singl kreveta', kitchenType = 'Kompletna kuhinja sa rernom' WHERE title = 'Deluxe Apartman sa pogledom na more' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '2 francuska ležaja, 2 singl kreveta', kitchenType = 'Luksuzna kuhinja sa aparatom za kafu' WHERE title = 'Predsednički Dupleks sa terasom' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj, 1 singl krevet', kitchenType = 'Čajna kuhinja sa frižiderom' WHERE title = 'Jednosoban Apartman (Prizemlje)' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj', kitchenType = 'Čajna kuhinja / rešo' WHERE title = 'Studio sa pogledom na more (Sprat)' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj', kitchenType = 'Mini frižider i kuvalo za vodu' WHERE title = 'Standard Room (Bez balkona)' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj, 1 singl krevet', kitchenType = 'Čajna kuhinja sa rešoom' WHERE title = 'Superior Sea View Room' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj, 1 singl krevet', kitchenType = 'Čajna kuhinja' WHERE title = 'Apartman sa jednom spavaćom sobom' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj, 3 singl kreveta', kitchenType = 'Kompletna kuhinja' WHERE title = 'Porodični dvosobni apartman' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj, 2 singl kreveta', kitchenType = 'Kompletna kuhinja sa trpezarijom' WHERE title = 'Četvorokrevetni apartman' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '2 francuska ležaja, 4 singl kreveta', kitchenType = 'Kompletna kuhinja sa mašinom za sudove' WHERE title = 'Deluxe Vila na plaži' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj', kitchenType = 'Mini čajna kuhinja' WHERE title = 'Double Standard Room' AND (bedStructure IS NULL OR bedStructure = '')");
        await dbHelper.run("UPDATE rooms SET bedStructure = '1 francuski ležaj, 1 singl krevet', kitchenType = 'Čajna kuhinja sa frižiderom i rešoom' WHERE title = 'Triple Superior Room' AND (bedStructure IS NULL OR bedStructure = '')");
        console.log("Ažurirani detalji o krevetima i kuhinjama za postojeće sobe.");
      } catch (err) {
        console.warn("Nije uspelo automatsko ažuriranje soba:", err.message);
      }
    });
  } catch (err) {
    console.error('Greška pri seeding-u baze:', err.message);
  }
}

// JWT Token Middlewares
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Pristup odbijen. Token nedostaje.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Nevažeći token.' });
    req.user = user;
    if (user && user.id) {
      activeUsers.set(Number(user.id), Date.now());
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Pristup odbijen. Potrebna su administratorska prava.' });
    }
    next();
  });
}

function isOwnerUser(user) {
  return user && user.email && user.email.toLowerCase().trim() === 'voxilityy@gmail.com';
}

function requireOwner(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user || !isOwnerUser(req.user)) {
      return res.status(403).json({ error: 'Pristup odbijen. Potrebna su vlasnička prava.' });
    }
    next();
  });
}

function requirePermission(permission) {
  return async (req, res, next) => {
    authenticateToken(req, res, async () => {
      if (!req.user) {
        return res.status(401).json({ error: 'Pristup odbijen. Token nedostaje.' });
      }

      // Vlasnik automatski ima sve dozvole
      if (isOwnerUser(req.user)) {
        return next();
      }

      if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Pristup odbijen. Potrebna su administratorska prava.' });
      }

      try {
        const dbUser = await dbHelper.get('SELECT adminPermissions, isAdmin FROM users WHERE id = ?', [req.user.id]);
        if (!dbUser || !dbUser.isAdmin) {
          return res.status(403).json({ error: 'Pristup odbijen. Korisnik nije administrator.' });
        }

        let perms = [];
        try {
          perms = JSON.parse(dbUser.adminPermissions || '[]');
        } catch (e) {
          perms = [];
        }

        if (perms.includes(permission)) {
          return next();
        } else {
          return res.status(403).json({ error: `Pristup odbijen. Nemate administratorsko pravo: ${permission}` });
        }
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    });
  };
}

async function requireHostOrAdmin(req, res, next) {
  authenticateToken(req, res, async () => {
    if (!req.user) {
      return res.status(403).json({ error: 'Pristup odbijen.' });
    }
    
    // Proveri u bazi da li je korisnik verifikovan domaćin ili admin
    try {
      const dbUser = await dbHelper.get('SELECT isHost, isAdmin, isVerified, adminPermissions FROM users WHERE id = ?', [req.user.id]);
      if (dbUser) {
        if (dbUser.isAdmin) {
          // Ako je admin, proveri da li je vlasnik ili ima 'properties' permisiju
          if (isOwnerUser(req.user)) {
            return next();
          }
          let perms = [];
          try {
            perms = JSON.parse(dbUser.adminPermissions || '[]');
          } catch (e) {
            perms = [];
          }
          if (perms.includes('properties')) {
            return next();
          } else {
            return res.status(403).json({ error: 'Pristup odbijen. Nemate administratorsko pravo za upravljanje smeštajima.' });
          }
        }
        if (dbUser.isHost) {
          if (dbUser.isVerified === 1) {
            return next();
          } else {
            return res.status(403).json({ error: 'Pristup odbijen. Vaš nalog domaćina još uvek nije verifikovan od strane administratora.' });
          }
        }
      }
    } catch (err) {
      // fallback na JWT payload ako baza baci grešku
    }

    if (req.user.isAdmin) {
      // Fallback ako provera u bazi propadne ali je u JWT admin
      if (isOwnerUser(req.user)) return next();
      return res.status(403).json({ error: 'Pristup odbijen. Potrebna je dozvola za upravljanje smeštajima.' });
    }
    
    // Proveri da li poseduje bar jedan smeštaj po e-mailu (samo ako je verifikovan u bazi ili ako ima privilegije)
    if (req.user.email) {
      try {
        const prop = await dbHelper.get('SELECT id FROM properties WHERE ownerEmail = ? LIMIT 1', [req.user.email.toLowerCase().trim()]);
        if (prop) {
          // Ipak mora biti verifikovan ako je isHost
          const dbUser = await dbHelper.get('SELECT isHost, isVerified FROM users WHERE id = ?', [req.user.id]);
          if (dbUser && dbUser.isHost && dbUser.isVerified !== 1) {
            return res.status(403).json({ error: 'Pristup odbijen. Vaš nalog domaćina još uvek nije verifikovan.' });
          }
          return next();
        }
      } catch (err) {
        // ignore
      }
    }
    
    return res.status(403).json({ error: 'Pristup odbijen. Potrebna su verifikovana vlasnička ili administratorska prava.' });
  });
}

async function createAdminNotification(message) {
  const timestamp = new Date().toLocaleString('sr-RS');
  try {
    await dbHelper.run(
      'INSERT INTO admin_notifications (message, timestamp, isRead) VALUES (?, ?, 0)',
      [message, timestamp]
    );
    console.log("Admin notification created:", message);
  } catch (err) {
    console.error('Error creating admin notification:', err.message);
  }
}

// ----------------------------------------------------
// REST API ROUTES (Promise-based & Unified)
// ----------------------------------------------------

// 1. Auth Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await dbHelper.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) return res.status(401).json({ error: 'Korisnik sa ovim e-mailom ne postoji.' });
    
    // Compare bcrypt password
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Pogrešna lozinka.' });
    
    user.isAdmin = !!user.isAdmin;
    user.isHost = !!user.isHost;
    try {
      user.adminPermissions = user.adminPermissions ? JSON.parse(user.adminPermissions) : [];
    } catch (e) {
      user.adminPermissions = [];
    }
    
    // Sign JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin, isHost: user.isHost },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    activeUsers.set(Number(user.id), Date.now());
    
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Auth Register
app.post('/api/auth/register', async (req, res) => {
  const { username, fullName, email, password, phone, avatar, isAdmin, isHost } = req.body;
  const adminFlag = isAdmin ? 1 : 0;
  const hostFlag = isHost ? 1 : 0;
  
  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  try {
    const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName) + '&background=0a4f70&color=fff';
    const result = await dbHelper.run(
      'INSERT INTO users (username, fullName, email, password, phone, avatar, isAdmin, isHost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, fullName, email.toLowerCase().trim(), hashedPassword, phone, avatar || defaultAvatar, adminFlag, hostFlag]
    );
    
    const user = await dbHelper.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    user.isAdmin = !!user.isAdmin;
    user.isHost = !!user.isHost;
    try {
      user.adminPermissions = user.adminPermissions ? JSON.parse(user.adminPermissions) : [];
    } catch (e) {
      user.adminPermissions = [];
    }
    
    // Create admin notification
    await createAdminNotification(`Novi korisnik se registrovao: ${fullName} (${email.toLowerCase().trim()})`);

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin, isHost: user.isHost },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    activeUsers.set(Number(user.id), Date.now());
    
    res.json({ user, token });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Korisničko ime ili e-mail adresa je već u upotrebi.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// 3. Get All Properties (along with reviews and rooms)
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await dbHelper.all('SELECT * FROM properties');
    const reviews = await dbHelper.all('SELECT * FROM reviews');
    const rooms = await dbHelper.all('SELECT * FROM rooms');

    // Group reviews and rooms by propertyId
    const populated = properties.map(p => {
      p.amenities = {
        wifi: !!p.wifi,
        pool: !!p.pool,
        beachfront: !!p.beachfront,
        parking: !!p.parking,
        airConditioning: !!p.airConditioning,
        pets: !!p.pets
      };
      p.reviews = reviews.filter(r => r.propertyId === p.id);
      p.rooms = rooms.filter(r => r.propertyId === p.id);
      return p;
    });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/properties', requireHostOrAdmin, async (req, res) => {
  const { title, type, location, price, rating, distanceToBeach, image, guests, bedrooms, description, icalUrl, amenities, monthlyPrices, ownerEmail, ownerPhone } = req.body;
  
  const resolvedOwnerEmail = req.user.isAdmin ? (ownerEmail || null) : req.user.email;
  const resolvedOwnerPhone = req.user.isAdmin ? (ownerPhone || null) : (ownerPhone || null);
  const isApprovedVal = req.user.isAdmin ? 1 : 0;
  
  try {
    const result = await dbHelper.run(
      `INSERT INTO properties (title, type, location, price, rating, distanceToBeach, image, guests, bedrooms, description, wifi, pool, beachfront, parking, airConditioning, pets, icalUrl, monthlyPrices, ownerEmail, ownerPhone, isApproved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, type, location, price, rating || 5.0, distanceToBeach, image, guests, bedrooms, description,
        amenities.wifi ? 1 : 0, amenities.pool ? 1 : 0, amenities.beachfront ? 1 : 0, amenities.parking ? 1 : 0, amenities.airConditioning ? 1 : 0, amenities.pets ? 1 : 0,
        icalUrl || null,
        monthlyPrices ? (typeof monthlyPrices === 'object' ? JSON.stringify(monthlyPrices) : monthlyPrices) : null,
        resolvedOwnerEmail,
        resolvedOwnerPhone,
        isApprovedVal
      ]
    );
    
    // Obavesti administratore o kreiranju
    if (!req.user.isAdmin) {
      await createAdminNotification(`Domaćin ${req.user.username} (${req.user.email}) je kreirao novi smeštaj: '${title}'.`);
    }

    const prop = await dbHelper.get('SELECT * FROM properties WHERE id = ?', [result.lastID]);
    prop.amenities = amenities;
    prop.reviews = [];
    res.json(prop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete Property
app.delete('/api/properties/:id', requireHostOrAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const property = await dbHelper.get('SELECT ownerEmail, title FROM properties WHERE id = ?', [id]);
    if (!property) {
      return res.status(404).json({ error: 'Smeštaj nije pronađen.' });
    }
    
    if (!req.user.isAdmin) {
      if (!property.ownerEmail || property.ownerEmail.toLowerCase().trim() !== req.user.email.toLowerCase().trim()) {
        return res.status(403).json({ error: 'Pristup odbijen. Možete brisati samo svoje smeštaje.' });
      }
      // Obavesti administratore o brisanju
      await createAdminNotification(`Domaćin ${req.user.username} (${req.user.email}) je obrisao svoj smeštaj: '${property.title}'.`);
    }
    
    const result = await dbHelper.run('DELETE FROM properties WHERE id = ?', [id]);
    res.json({ success: true, changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Add Review to Property
app.post('/api/properties/:id/reviews', async (req, res) => {
  const propertyId = req.params.id;
  const { author, rating, comment } = req.body;
  
  try {
    const result = await dbHelper.run(
      'INSERT INTO reviews (propertyId, author, rating, comment) VALUES (?, ?, ?, ?)',
      [propertyId, author, rating, comment]
    );
    const reviewId = result.lastID;
    
    // Recalculate property average rating
    const rows = await dbHelper.all('SELECT rating FROM reviews WHERE propertyId = ?', [propertyId]);
    const sum = rows.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / rows.length).toFixed(1));
    
    await dbHelper.run('UPDATE properties SET rating = ? WHERE id = ?', [avg, propertyId]);
    res.json({ id: reviewId, propertyId: parseInt(propertyId, 10), author, rating, comment, newAverageRating: avg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Delete Review
app.delete('/api/properties/:propertyId/reviews/:reviewId', requirePermission('properties'), async (req, res) => {
  const { propertyId, reviewId } = req.params;
  try {
    await dbHelper.run('DELETE FROM reviews WHERE id = ?', [reviewId]);
    
    // Recalculate average rating
    const rows = await dbHelper.all('SELECT rating FROM reviews WHERE propertyId = ?', [propertyId]);
    const avg = rows.length > 0 
      ? parseFloat((rows.reduce((acc, r) => acc + r.rating, 0) / rows.length).toFixed(1)) 
      : 5.0;
    
    await dbHelper.run('UPDATE properties SET rating = ? WHERE id = ?', [avg, propertyId]);
    res.json({ success: true, newRating: avg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Get All Inquiries (with chat messages)
app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await dbHelper.all('SELECT * FROM inquiries');
    const messages = await dbHelper.all('SELECT * FROM chat_messages');

    const populated = inquiries.map(inq => {
      inq.chat = messages
        .filter(m => m.inquiryId === inq.id)
        .map(m => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          timestamp: m.timestamp
        }));
      return inq;
    });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Add Inquiry
app.post('/api/inquiries', async (req, res) => {
  const { userId, propertyId, checkIn, checkOut, dates, nights, guests, totalPrice, status, message, roomTitle } = req.body;
  
  try {
    const result = await dbHelper.run(
      `INSERT INTO inquiries (userId, propertyId, checkIn, checkOut, dates, nights, guests, totalPrice, status, message, roomTitle)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, propertyId, checkIn, checkOut, dates, nights, guests, totalPrice, status || 'Poslato', message, roomTitle || null]
    );
    const inquiryId = result.lastID;
    
    if (message) {
      await dbHelper.run(
        'INSERT INTO chat_messages (inquiryId, sender, text, timestamp) VALUES (?, ?, ?, ?)',
        [inquiryId, 'client', message, dates.split(' - ')[0]]
      );
      res.json({ id: inquiryId, userId, propertyId, checkIn, checkOut, dates, nights, guests, totalPrice, status: status || 'Poslato', message, roomTitle, chat: [{ sender: 'client', text: message, timestamp: dates.split(' - ')[0] }] });
    } else {
      res.json({ id: inquiryId, userId, propertyId, checkIn, checkOut, dates, nights, guests, totalPrice, status: status || 'Poslato', message, roomTitle, chat: [] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Update Inquiry Status (Approve/Reject)
app.patch('/api/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const result = await dbHelper.run('UPDATE inquiries SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Delete/Cancel Inquiry
app.delete('/api/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await dbHelper.run('DELETE FROM inquiries WHERE id = ?', [id]);
    res.json({ success: true, changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Send Chat Message
app.post('/api/inquiries/:id/chat', async (req, res) => {
  const inquiryId = req.params.id;
  const { sender, text, timestamp } = req.body;
  
  try {
    const result = await dbHelper.run(
      'INSERT INTO chat_messages (inquiryId, sender, text, timestamp) VALUES (?, ?, ?, ?)',
      [inquiryId, sender, text, timestamp]
    );
    res.json({ id: result.lastID, inquiryId: parseInt(inquiryId, 10), sender, text, timestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Get Activity Logs
app.get('/api/activity-logs', async (req, res) => {
  try {
    const rows = await dbHelper.all('SELECT * FROM activity_logs ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Create Activity Log
app.post('/api/activity-logs', async (req, res) => {
  const { timestamp, user, action, type } = req.body;
  try {
    const result = await dbHelper.run(
      'INSERT INTO activity_logs (timestamp, user, action, type) VALUES (?, ?, ?, ?)',
      [timestamp, user, action, type]
    );
    res.json({ id: result.lastID, timestamp, user, action, type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 15. Get Forum Posts
app.get('/api/forum-posts', async (req, res) => {
  try {
    const rows = await dbHelper.all('SELECT * FROM forum_posts ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 16. Create Forum Post
app.post('/api/forum-posts', async (req, res) => {
  const { title, author, content, timestamp } = req.body;
  try {
    const result = await dbHelper.run(
      'INSERT INTO forum_posts (title, author, content, repliesCount, timestamp) VALUES (?, ?, ?, 0, ?)',
      [title, author, content, timestamp]
    );
    res.json({ id: result.lastID, title, author, content, repliesCount: 0, timestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 17. Delete Forum Post
app.delete('/api/forum-posts/:id', requirePermission('forum_delete'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await dbHelper.run('DELETE FROM forum_posts WHERE id = ?', [id]);
    res.json({ success: true, changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 17b. Update Forum Post (Requires forum_edit permission)
app.put('/api/forum-posts/:id', requirePermission('forum_edit'), async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const result = await dbHelper.run(
      'UPDATE forum_posts SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );
    res.json({ success: true, changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 18. Toggle User Admin Status (Requires Owner)
app.patch('/api/users/:id/role', requireOwner, async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;
  const adminFlag = isAdmin ? 1 : 0;
  
  try {
    const result = await dbHelper.run('UPDATE users SET isAdmin = ? WHERE id = ?', [adminFlag, id]);
    res.json({ success: true, changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 18b. Update User Admin Permissions (Requires Owner)
app.patch('/api/users/:id/permissions', requireOwner, async (req, res) => {
  const { id } = req.params;
  const { adminPermissions } = req.body;
  
  if (!Array.isArray(adminPermissions)) {
    return res.status(400).json({ error: 'Permisije moraju biti niz.' });
  }
  
  const permsStr = JSON.stringify(adminPermissions);
  
  try {
    const result = await dbHelper.run('UPDATE users SET adminPermissions = ? WHERE id = ?', [permsStr, id]);
    res.json({ success: true, changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 19. Get Users List (Requires users permission)
app.get('/api/users', requirePermission('users'), async (req, res) => {
  try {
    const users = await dbHelper.all('SELECT * FROM users');
    const mapped = users.map(u => {
      u.isAdmin = !!u.isAdmin;
      u.isHost = !!u.isHost;
      try {
        u.wishlist = u.wishlist ? JSON.parse(u.wishlist) : [];
      } catch (e) {
        u.wishlist = [];
      }
      try {
        u.adminPermissions = u.adminPermissions ? JSON.parse(u.adminPermissions) : [];
      } catch (e) {
        u.adminPermissions = [];
      }
      // Check online status (online if active in last 90 seconds)
      const lastSeen = activeUsers.get(Number(u.id));
      u.isOnline = lastSeen ? (Date.now() - lastSeen < 90000) : false;
      u.lastActive = lastSeen || null;
      return u;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 19c. Create Action Request (Requester asks for a delete or edit)
app.post('/api/admin/action-requests', authenticateToken, async (req, res) => {
  const { actionType, targetId, targetTitle, proposedContent, reason } = req.body;
  
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Samo administratori mogu slati zahteve.' });
  }

  const requesterId = req.user.id;
  const requesterName = req.user.username;
  const timestamp = new Date().toLocaleString('sr-RS');
  const contentStr = proposedContent ? JSON.stringify(proposedContent) : null;

  try {
    const result = await dbHelper.run(
      `INSERT INTO admin_action_requests (requesterId, requesterName, actionType, targetId, targetTitle, proposedContent, status, reason, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [requesterId, requesterName, actionType, targetId, targetTitle, contentStr, reason, timestamp]
    );

    // Takođe kreiramo obaveštenje za ostale admine
    await createAdminNotification(`Admin ${requesterName} traži odobrenje za ${actionType === 'forum_delete' ? 'brisanje' : 'izmenu'} objave '${targetTitle}'.`);

    res.json({ success: true, id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 19d. Get Action Requests
app.get('/api/admin/action-requests', requireAdmin, async (req, res) => {
  try {
    const rows = await dbHelper.all('SELECT * FROM admin_action_requests ORDER BY id DESC');
    const mapped = rows.map(r => {
      try {
        r.proposedContent = r.proposedContent ? JSON.parse(r.proposedContent) : null;
      } catch (e) {
        r.proposedContent = null;
      }
      return r;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 19e. Handle Action Request (Approve/Reject)
app.post('/api/admin/action-requests/:id/handle', async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body; // 'approved' ili 'rejected'
  
  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ error: 'Nevažeći status.' });
  }

  authenticateToken(req, res, async () => {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Pristup odbijen. Potrebna su administratorska prava.' });
    }

    try {
      const request = await dbHelper.get('SELECT * FROM admin_action_requests WHERE id = ?', [requestId]);
      if (!request) {
        return res.status(404).json({ error: 'Zahtev nije pronađen.' });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Zahtev je već obrađen.' });
      }

      const permissionNeeded = request.actionType;
      
      let isAuthorized = isOwnerUser(req.user);
      if (!isAuthorized) {
        const dbUser = await dbHelper.get('SELECT adminPermissions FROM users WHERE id = ?', [req.user.id]);
        if (dbUser) {
          let perms = [];
          try {
            perms = JSON.parse(dbUser.adminPermissions || '[]');
          } catch (e) {
            perms = [];
          }
          if (perms.includes(permissionNeeded)) {
            isAuthorized = true;
          }
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({ error: `Nemate dozvolu '${permissionNeeded}' da biste obradili ovaj zahtev.` });
      }

      const handlerName = req.user.username;
      
      if (status === 'approved') {
        if (request.actionType === 'forum_delete') {
          await dbHelper.run('DELETE FROM forum_posts WHERE id = ?', [request.targetId]);
          console.log(`Zahtev odobren: obrisan forum post sa ID ${request.targetId}`);
        } else if (request.actionType === 'forum_edit') {
          const content = JSON.parse(request.proposedContent || '{}');
          await dbHelper.run(
            'UPDATE forum_posts SET title = ?, content = ? WHERE id = ?',
            [content.title, content.content, request.targetId]
          );
          console.log(`Zahtev odobren: izmenjen forum post sa ID ${request.targetId}`);
        }
      }

      await dbHelper.run(
        'UPDATE admin_action_requests SET status = ? WHERE id = ?',
        [status, requestId]
      );

      await dbHelper.run(
        'INSERT INTO activity_logs (timestamp, user, action, type) VALUES (?, ?, ?, ?)',
        [
          new Date().toLocaleString('sr-RS'),
          handlerName,
          `${status === 'approved' ? 'Odobren' : 'Odbijen'} zahtev za ${request.actionType === 'forum_delete' ? 'brisanje' : 'izmenu'} objave '${request.targetTitle}' od admina ${request.requesterName}.`,
          'update'
        ]
      );

      res.json({ success: true, message: `Zahtev je uspešno ${status === 'approved' ? 'odobren i izvršen' : 'odbijen'}.` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// 19b. Heartbeat route to register user presence
app.post('/api/users/heartbeat', authenticateToken, (req, res) => {
  if (req.user && req.user.id) {
    activeUsers.set(Number(req.user.id), Date.now());
  }
  res.json({ status: 'ok' });
});

// Helper function to simulate/send emails
async function sendEmailNotification({ to, subject, html }) {
  console.log(`\n--- [EMAIL NOTIFICATION] ---`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${html.replace(/<[^>]*>/g, ' ').trim()}`);
  console.log(`-----------------------------\n`);
}

// 19a. Submit Host Verification Details/Docs
app.post('/api/host/verify-request', authenticateToken, async (req, res) => {
  const { details, docs } = req.body;
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
    const docsStr = typeof docs === 'object' ? JSON.stringify(docs) : docs;
    
    await dbHelper.run(
      'UPDATE users SET isVerified = 0, agreedToTerms = 1, verificationDetails = ?, verificationDocs = ? WHERE id = ?',
      [detailsStr, docsStr, req.user.id]
    );

    // Obavesti administratore o podnošenju dokumenata
    await createAdminNotification(`Domaćin ${req.user.username} (${req.user.email}) je poslao dokumentaciju na verifikaciju.`);

    // Pošalji email administratorima
    const admins = await dbHelper.all('SELECT email FROM users WHERE isAdmin = 1');
    const adminEmails = admins.length > 0 ? admins.map(a => a.email).join(', ') : 'admin@ellinas.com';
    
    await sendEmailNotification({
      to: adminEmails,
      subject: `[Ellinas] Novi zahtev za verifikaciju domaćina: ${req.user.username}`,
      html: `
        <h3>Primljen je novi zahtev za verifikaciju domaćina</h3>
        <p><strong>Korisnik:</strong> ${req.user.fullName} (${req.user.email})</p>
        <p><strong>JMBG/Pasoš:</strong> ${details.jmbg || '/'}</p>
        <p><strong>Adresa:</strong> ${details.address || '/'}</p>
        <p>Dokumenti su uspešno priloženi i dostupni u administratorskom panelu.</p>
      `
    });

    const updatedUser = await dbHelper.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (updatedUser) {
      updatedUser.isAdmin = !!updatedUser.isAdmin;
      updatedUser.isHost = !!updatedUser.isHost;
    }
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 19b. Admin approve or reject Host Verification
app.post('/api/admin/verify-host/:id', requirePermission('users'), async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body; // status: 1 = odobreno, -1 = odbijeno
  try {
    const userToVerify = await dbHelper.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!userToVerify) {
      return res.status(404).json({ error: 'Korisnik nije pronađen.' });
    }

    await dbHelper.run(
      'UPDATE users SET isVerified = ? WHERE id = ?',
      [status, id]
    );

    const message = status === 1
      ? `Profil domaćina ${userToVerify.username} je uspešno odobren/verifikovan.`
      : `Profil domaćina ${userToVerify.username} je odbijen. Razlog: ${reason || 'Nije naveden'}`;

    await createAdminNotification(`Admin je promenio status verifikacije za ${userToVerify.username} u: ${status === 1 ? 'Odobren' : 'Odbijen'}.`);

    // Pošalji email potvrde domaćinu
    const subject = status === 1 
      ? `[Ellinas] Vaš profil domaćina je ODOBREN! 🎉`
      : `[Ellinas] Vaš zahtev za verifikaciju je odbijen`;
      
    const html = status === 1
      ? `
        <h3>Čestitamo! Vaš profil na Ellinas je verifikovan</h3>
        <p>Poštovani ${userToVerify.fullName},</p>
        <p>Sa zadovoljstvom vas obaveštavamo da su administratori odobrili vaš nalog.</p>
        <p>Sada imate pun pristup Vlasničkom Panelu i možete kreirati i objavljivati svoje smeštaje.</p>
      `
      : `
        <h3>Vaš zahtev za verifikaciju na Ellinas zahteva dopunu</h3>
        <p>Poštovani ${userToVerify.fullName},</p>
        <p>Vaša dokumentacija je pregledana, ali nažalost ne ispunjava sve zahteve.</p>
        <p><strong>Razlog odbijanja/dopune:</strong> ${reason || 'Nije naveden'}</p>
        <p>Molimo vas da se prijavite na svoj nalog i ponovo pošaljete ispravna dokumenta.</p>
      `;

    await sendEmailNotification({
      to: userToVerify.email,
      subject,
      html
    });

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Become Host Upgrade Endpoint
app.post('/api/users/become-host', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await dbHelper.run(
      'UPDATE users SET isHost = 1, isVerified = 0 WHERE id = ?',
      [userId]
    );
    const user = await dbHelper.get('SELECT * FROM users WHERE id = ?', [userId]);
    user.isAdmin = !!user.isAdmin;
    user.isHost = !!user.isHost;
    console.log(`Korisnik ${user.email} je prešao u ulogu domaćina (isHost = 1)`);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save user wishlist
app.post('/api/users/wishlist', authenticateToken, async (req, res) => {
  const { wishlist } = req.body;
  try {
    const wishlistJson = JSON.stringify(wishlist || []);
    await dbHelper.run('UPDATE users SET wishlist = ? WHERE id = ?', [wishlistJson, req.user.id]);
    res.json({ success: true, wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 20. Update User Info
app.patch('/api/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { fullName, phone, avatar } = req.body;
  
  if (parseInt(id, 10) !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Nemate ovlašćenje da menjate tuđi profil.' });
  }
  
  try {
    await dbHelper.run(
      'UPDATE users SET fullName = ?, phone = ?, avatar = ? WHERE id = ?',
      [fullName, phone, avatar, id]
    );
    const user = await dbHelper.get('SELECT * FROM users WHERE id = ?', [id]);
    user.isAdmin = !!user.isAdmin;
    user.isHost = !!user.isHost;
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 20b. Change Password Info
app.post('/api/users/:id/change-password', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (parseInt(id, 10) !== req.user.id) {
    return res.status(403).json({ error: 'Nemate ovlašćenje da menjate tuđu lozinku.' });
  }

  try {
    const user = await dbHelper.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'Korisnik nije pronađen.' });

    // Compare old password
    const passwordMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Trenutna lozinka nije ispravna.' });
    }

    // Hash and store new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    await dbHelper.run('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, id]);
    res.json({ success: true, message: 'Lozinka je uspešno promenjena!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 21. Real SQLite SQL Query Terminal Endpoint
app.post('/api/admin/query', authenticateToken, async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Nije unet SQL upit.' });
  }

  const isAdmin = req.user && req.user.isAdmin;
  let isHost = req.user && req.user.isHost;
  
  if (!isAdmin && !isHost && req.user && req.user.email) {
    try {
      const prop = await dbHelper.get('SELECT id FROM properties WHERE ownerEmail = ? LIMIT 1', [req.user.email.toLowerCase().trim()]);
      if (prop) {
        isHost = true;
      }
    } catch (err) {
      // ignore
    }
  }

  if (!isAdmin && !isHost) {
    return res.status(403).json({ error: 'Pristup odbijen. Potrebna su administratorska ili vlasnička prava.' });
  }

  const q = query.trim();
  const trimmed = q.toUpperCase();

  if (!isAdmin) {
    let isAllowed = false;
    let targetPropertyId = null;
    let targetRoomId = null;

    const updatePropMatch = q.match(/^UPDATE\s+properties\s+SET\s+[\s\S]+?\s+WHERE\s+id\s*=\s*(\d+);?$/i);
    if (updatePropMatch) {
      targetPropertyId = parseInt(updatePropMatch[1], 10);
    }
    
    const updatePricesMatch = q.match(/^UPDATE\s+properties\s+SET\s+price\s*=\s*ROUND\(\s*price\s*\*\s*[\d\.]+\s*,\s*0\)\s*WHERE\s+ownerEmail\s*=\s*'([^']+)'\s*;?$/i);
    if (updatePricesMatch) {
      const emailInQuery = updatePricesMatch[1].toLowerCase().trim();
      if (emailInQuery === req.user.email.toLowerCase().trim()) {
        isAllowed = true;
      }
    }
    
    const insertRoomMatch = q.match(/^INSERT\s+INTO\s+rooms\s*\(\s*propertyId[\s\S]+?\s+VALUES\s*\(\s*(\d+)[\s\S]+?\);?$/i);
    if (insertRoomMatch) {
      targetPropertyId = parseInt(insertRoomMatch[1], 10);
    }

    const deleteRoomMatch = q.match(/^DELETE\s+FROM\s+rooms\s+WHERE\s+id\s*=\s*(\d+);?$/i);
    if (deleteRoomMatch) {
      targetRoomId = parseInt(deleteRoomMatch[1], 10);
    }

    if (targetPropertyId) {
      try {
        const prop = await dbHelper.get('SELECT ownerEmail, title FROM properties WHERE id = ?', [targetPropertyId]);
        if (prop && prop.ownerEmail && prop.ownerEmail.toLowerCase().trim() === req.user.email.toLowerCase().trim()) {
          isAllowed = true;
          // Obaveštenje za izmenu objekta
          await createAdminNotification(`Domaćin ${req.user.username} (${req.user.email}) je izmenio podatke/cene za smeštaj: '${prop.title}'.`);
        }
      } catch (err) {
        return res.status(500).json({ error: 'Greška pri provereni vlasništva objekta: ' + err.message });
      }
    } else if (targetRoomId) {
      try {
        const row = await dbHelper.get(
          'SELECT p.ownerEmail, p.title, r.title as roomTitle FROM properties p JOIN rooms r ON r.propertyId = p.id WHERE r.id = ?',
          [targetRoomId]
        );
        if (row && row.ownerEmail && row.ownerEmail.toLowerCase().trim() === req.user.email.toLowerCase().trim()) {
          isAllowed = true;
          // Obaveštenje za brisanje sobe
          if (trimmed.startsWith('DELETE')) {
            await createAdminNotification(`Domaćin ${req.user.username} (${req.user.email}) je uklonio sobu '${row.roomTitle}' iz smeštaja '${row.title}'.`);
          }
        }
      } catch (err) {
        return res.status(500).json({ error: 'Greška pri provereni vlasništva sobe: ' + err.message });
      }
    }

    // Za dodavanje sobe (INSERT):
    if (insertRoomMatch && isAllowed && targetPropertyId) {
      try {
        const prop = await dbHelper.get('SELECT title FROM properties WHERE id = ?', [targetPropertyId]);
        await createAdminNotification(`Domaćin ${req.user.username} (${req.user.email}) je dodao novu sobu u smeštaj '${prop.title}'.`);
      } catch (err) {}
    }

    if (!isAllowed) {
      return res.status(403).json({ error: 'Nedozvoljena akcija. Možete menjati samo svoje objekte i pripadajuće sobe.' });
    }
  }

  try {
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('EXPLAIN')) {
      const rows = await dbHelper.all(query);
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      res.json({ rows, columns, message: `Upit uspešno izvršen. Vraćeno redova: ${rows.length}.` });
    } else {
      const result = await dbHelper.run(query);
      res.json({
        rows: [],
        columns: [],
        message: `Upit uspešno izvršen. Modifikovano redova (changes): ${result.changes}. Poslednji ID (lastID): ${result.lastID || 'Nema'}.`
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 22. Database Reset Endpoint (Repopulates with fresh seeds)
app.post('/api/admin/reset-db', requireOwner, async (req, res) => {
  try {
    await dbHelper.serialize(async () => {
      await dbHelper.run('DROP TABLE IF EXISTS chat_messages');
      await dbHelper.run('DROP TABLE IF EXISTS inquiries');
      await dbHelper.run('DROP TABLE IF EXISTS reviews');
      await dbHelper.run('DROP TABLE IF EXISTS properties');
      await dbHelper.run('DROP TABLE IF EXISTS users');
      await dbHelper.run('DROP TABLE IF EXISTS activity_logs');
      await dbHelper.run('DROP TABLE IF EXISTS forum_posts');
      await dbHelper.run('DROP TABLE IF EXISTS rooms');
      await dbHelper.run('DROP TABLE IF EXISTS admin_notifications');
    });

    console.log('Tabele obrisane na zahtev administratora.');
    await initializeSchema();
    res.json({ success: true, message: 'Baza podataka je uspešno resetovana na fabrička podešavanja.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 22a. Get Admin Notifications
app.get('/api/admin/notifications', requireAdmin, async (req, res) => {
  try {
    const rows = await dbHelper.all('SELECT * FROM admin_notifications ORDER BY id DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 22b. Mark Admin Notifications as Read
app.post('/api/admin/notifications/mark-read', requireAdmin, async (req, res) => {
  try {
    await dbHelper.run('UPDATE admin_notifications SET isRead = 1');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 23. File Upload Endpoint with Cloudinary Support
const storage = process.env.CLOUDINARY_CLOUD_NAME
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    });

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Rule-based fallback recommendation engine for AI Chat
function getFallbackResponse(message, properties) {
  const userText = message.toLowerCase();
  let replyText = "";
  let recommendedIds = [];

  // Match location
  let matchedLoc = null;
  if (userText.includes("tasos")) matchedLoc = "Tasos";
  else if (userText.includes("lefkad")) matchedLoc = "Lefkada";
  else if (userText.includes("sitonij")) matchedLoc = "Sitonija";
  else if (userText.includes("krf")) matchedLoc = "Krf";

  // Match amenities
  const wantsPool = userText.includes("bazen") || userText.includes("pool");
  const wantsBeach = userText.includes("plaž") || userText.includes("beach") || userText.includes("mor") || userText.includes("vode");
  const wantsPets = userText.includes("ljubim") || userText.includes("pas") || userText.includes("dog") || userText.includes("kuce");
  const wantsWifi = userText.includes("wifi") || userText.includes("internet");
  const wantsParking = userText.includes("parking") || userText.includes("kola") || userText.includes("auto");

  // Extract guest capacity requested (e.g. "za 5 osoba")
  const guestMatch = userText.match(/(\d+)\s*(?:osob|gost|ljud|krevet|odrasl|dec|član|clan)/i) || userText.match(/\b([1-9]|1[0-2])\b/);
  const requestedGuests = guestMatch ? parseInt(guestMatch[1], 10) : 0;

  // Filter properties
  let matches = properties;
  if (matchedLoc) {
    matches = matches.filter(p => p.location.toLowerCase().includes(matchedLoc.toLowerCase()));
  }
  if (requestedGuests > 0) {
    matches = matches.filter(p => p.guests >= requestedGuests);
  }
  if (wantsPool) {
    matches = matches.filter(p => p.amenities.pool);
  }
  if (wantsBeach) {
    matches = matches.filter(p => p.distanceToBeach <= 200 || p.amenities.beachfront);
  }
  if (wantsPets) {
    matches = matches.filter(p => p.amenities.pets);
  }
  if (wantsWifi) {
    matches = matches.filter(p => p.amenities.wifi);
  }
  if (wantsParking) {
    matches = matches.filter(p => p.amenities.parking);
  }

  // Check if complaining about price
  const isComplainingPrice = userText.includes("skupo") || userText.includes("jeftinij") || userText.includes("budžet") || userText.includes("budzet") || userText.includes("cene") || userText.includes("popust") || userText.includes("skupa") || userText.includes("niza");

  // Check if asking how to reserve
  const isAskingBooking = userText.includes("rezerv") || userText.includes("kako da") || userText.includes("bukir");

  // Check if asking general query like "šta nudite"
  const isGeneralQuery = 
    userText.includes("nudite") || 
    userText.includes("nudimo") || 
    userText.includes("imate") || 
    userText.includes("ponud") || 
    userText.includes("smeštaj") || 
    userText.includes("smestaj") || 
    userText.includes("sta ima") || 
    userText.includes("šta ima");

  // Check if it's just a friendly greeting
  const isGreeting = 
    userText.includes("zdrav") || 
    userText.includes("dobar dan") || 
    userText.includes("dobro jutro") || 
    userText.includes("dobro veče") || 
    userText.includes("pozdrav") || 
    userText === "hi" || 
    userText === "hello";

  if (isAskingBooking) {
    replyText = `Rezervaciju možete izvršiti jednostavno i direktno. 📅\n\nKliknite na karticu smeštaja koja se pojavila ispod ove poruke ili na dugme "Pogledaj" kako biste otvorili detalje, izabrali sobu i poslali upit.\n\nKoji smeštaj sa liste biste želeli da pogledate detaljnije?`;
    if (matches.length > 0) {
      recommendedIds = [matches[0].id];
    } else {
      recommendedIds = [1]; // Fallback to first property
    }
  } else if (isComplainingPrice) {
    matches.sort((a, b) => a.price - b.price);
    if (matches.length > 0) {
      const cheapest = matches[0];
      replyText = `Razumem da je budžet važan za planiranje odmora. 💰\n\nNajpovoljniji smeštaj koji ispunjava vaše uslove je **${cheapest.title}** u regiji **${cheapest.location}** po ceni od **${cheapest.price}€** po noćenju.\n\nDa li vam ova ponuda odgovara ili želite da pogledamo neku drugu regiju?`;
      recommendedIds = [cheapest.id];
    } else {
      const overallCheapest = [...properties].sort((a, b) => a.price - b.price);
      const cheapest = overallCheapest[0];
      replyText = `Razumem vas. Trenutno nemamo jeftinijih opcija za te specifične kriterijume, ali naša najpovoljnija ponuda uopšte je **${cheapest.title}** za **${cheapest.price}€** po noćenju.\n\nDa li bi vam ova lokacija odgovarala?`;
      recommendedIds = [cheapest.id];
    }
  } else if (matchedLoc) {
    if (matches.length > 0) {
      const selected = matches[0];
      replyText = `Sjajan izbor! **${matchedLoc}** je prelepa destinacija za odmor. 🏖️\n\nPreporučujem vam da pogledate **${selected.title}** po ceni od **${selected.price}€** po noćenju.\n\nDa li vam odgovara ova ponuda ili želite da proverim druge opcije na istoj lokaciji?`;
      recommendedIds = [selected.id];
      if (matches.length > 1) {
        recommendedIds.push(matches[1].id);
      }
    } else {
      const alternative = properties.find(p => p.location.toLowerCase().includes(matchedLoc.toLowerCase())) || properties[0];
      replyText = `Nažalost, trenutno nemamo smeštaj u regiji **${matchedLoc}** koji ispunjava sve te specifične uslove. 😔\n\nKao najbolju alternativu na toj lokaciji nudimo **${alternative.title}** za **${alternative.price}€** po noćenju.\n\nDa li biste želeli da pogledate ovaj smeštaj?`;
      recommendedIds = [alternative.id];
    }
  } else if (isGeneralQuery) {
    replyText = `U našoj ponudi imamo fantastične premium smeštaje na najlepšim lokacijama u Grčkoj! 🏖️\n\nNeke od naših najpopularnijih opcija su prelepi **Apartmani Golden Beach Thassos** na Tasosu i luksuzna **Kamena Vila Horizon Lefkada**.\n\nKoja regija ili vrsta smeštaja vas najviše zanima? Pored toga, za koliko osoba planirate odmor?`;
    recommendedIds = [2, 1];
  } else if (wantsPool) {
    const poolMatches = properties.filter(p => p.amenities.pool);
    if (poolMatches.length > 0) {
      replyText = `Uživanje pored vode je nezamenljivo! 🏊\n\nPreporučujem vam **${poolMatches[0].title}** sa sopstvenim bazenom za **${poolMatches[0].price}€** po noćenju.\n\nDa li vam se dopada ova vila ili više volite apartman tik uz plažu?`;
      recommendedIds = [poolMatches[0].id];
    } else {
      replyText = `Trenutno nemamo slobodnih smeštaja sa bazenom. 🏖️\n\nPredlažem da pogledate prelepi **Apartmani Golden Beach Thassos** koji su tik uz peščanu plažu.\n\nDa li želite da proverim slobodne termine?`;
      recommendedIds = [2];
    }
  } else if (requestedGuests > 0) {
    const guestMatches = properties.filter(p => p.guests >= requestedGuests);
    if (guestMatches.length > 0) {
      replyText = `Pronašao sam odličan smeštaj za **${requestedGuests} osoba**. 🛏️\n\nPreporučujem **${guestMatches[0].title}** po ceni od **${guestMatches[0].price}€** po noćenju, koji ima sasvim dovoljno mesta za sve.\n\nDa li želite da pogledate raspored kreveta i soba?`;
      recommendedIds = [guestMatches[0].id];
    } else {
      replyText = `Nažalost, nemamo smeštaj kapaciteta za **${requestedGuests} osoba** u jednoj jedinici. 😔\n\nPredlažem da iznajmite više manjih apartmana ili soba u **Apartmani Golden Beach Thassos**.\n\nDa li biste želeli da pogledate tu opciju?`;
      recommendedIds = [2];
    }
  } else if (isGreeting) {
    replyText = `Dobar dan! Kako vam mogu pomoći danas? ⛵\n\nPlanirate li letovanje na nekoj od naših prelepih regija poput Tasosa, Lefkade, Sitonije ili Krfa?`;
    recommendedIds = [];
  } else {
    replyText = `Dobar dan! Ja sam vaš Ellinas AI turistički agent. ⛵\n\nTu sam da vam pomognem da brzo i lako pronađete idealan smeštaj na Tasosu, Lefkadi, Sitoniji ili Krfu.\n\nZa koliko osoba tražite smeštaj i koji period letovanja planirate?`;
    recommendedIds = [];
  }

  return {
    text: replyText,
    recommendedPropertyIds: recommendedIds
  };
}

// AI Support Chat Widget Endpoint (Groq API or local fallback)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Fetch properties from database to feed context
    const propertiesList = await dbHelper.all('SELECT * FROM properties');
    const reviewsList = await dbHelper.all('SELECT * FROM reviews');
    const roomsList = await dbHelper.all('SELECT * FROM rooms');
    const properties = propertiesList.map(p => {
      p.amenities = {
        wifi: !!p.wifi,
        pool: !!p.pool,
        beachfront: !!p.beachfront,
        parking: !!p.parking,
        airConditioning: !!p.airConditioning,
        pets: !!p.pets
      };
      p.reviews = reviewsList.filter(r => r.propertyId === p.id);
      p.rooms = roomsList.filter(r => r.propertyId === p.id);
      return p;
    });

    const propertiesTextList = properties.map(p => {
      const amenitiesList = Object.entries(p.amenities)
        .filter(([_, val]) => val)
        .map(([key, _]) => {
          const names = {
            wifi: 'WiFi',
            pool: 'Bazen',
            beachfront: 'Na samoj plaži',
            parking: 'Parking',
            airConditioning: 'Klima',
            pets: 'Dozvoljeni ljubimci'
          };
          return names[key] || key;
        }).join(', ');

      const roomsText = p.rooms.map(r => 
        `  * ${r.title} (${r.price}€/noć, za ${r.guests} osoba, kreveti: ${r.bedStructure || 'Nije navedeno'}, kuhinja: ${r.kitchenType || 'Nije navedeno'})`
      ).join('\n');

      return `SMEŠTAJ #${p.id}: ${p.title} (${p.type})
- Lokacija: ${p.location}
- Cena: ${p.price}€/noć
- Ocena: ${p.rating}, Udaljenost od plaže: ${p.distanceToBeach}m
- Maksimalno gostiju: ${p.guests}, Spavaće sobe: ${p.bedrooms}
- Pogodnosti: ${amenitiesList || 'Nema posebnih pogodnosti'}
- Opis: ${p.description || ''}
- Dostupne sobe:
${roomsText || '  * Nema registrovanih soba'}`;
    }).join('\n\n');

    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      // Call Groq API inside a try-catch for complete safety against rate limits / downtime
      let response;
      try {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `Ti si Ellinas AI Asistent, premium AI turistički agent za platformu "Ellinas" (smeštaj u Grčkoj).
Tvoj cilj je da pomogneš klijentima da pronađu idealan smeštaj na Tasosu, Lefkadi, Sitoniji i Krfu.
Komuniciraj na srpskom jeziku, toplo, profesionalno, gostoljubivo i prirodno. Razgovaraj lepo sa klijentom, nemoj odmah agresivno nuditi i forsirati smeštaje ako tek započinjete razgovor.

Dostupni smeštaji na našoj platformi (PREPORUČI ISKLJUČIVO ove smeštaje i navedi njihova tačna imena):
${propertiesTextList}

Pravila komunikacije (Tvoj Trening):
1. **Lepo i prirodno ćaskanje**: Budi izuzetno ljubazan, gostoljubiv i prirodan. Ako klijent samo pozdravi (npr. "Zdravo", "Dobar dan"), otpozdravi ga toplo i pitaj kako mu možeš pomoći ili gde planira letovanje, bez preranog nuđenja i guranja kartica smeštaja.
2. **Postepeno i pametno nuđenje**: Saznaj želje klijenta kroz razgovor (npr. lokacija, broj osoba, termin, blizina plaže ili bazen). Tek kada klijent navede svoje kriterijume ili izrazi interesovanje za konkretne predloge, ponudi mu 1-2 najprikladnija smeštaja.
3. **Opšti upiti**: Ako klijent pita opšte pitanje (npr. "šta nudite?", "šta imate u ponudi?", "pokaži mi ponudu" ili "koji smeštaj imate?"), prvo mu se lepo i toplo obrati i objasni da nudimo premium smeštaje na najlepšim lokacijama (Tasos, Lefkada, Sitonija, Krf). Predstavi ukratko 2-3 atraktivna smeštaja iz baze (npr. Vila Aura, Apartmani Golden Beach Thassos, itd.) kao primer i prosledi njihove tačne ID-jeve u nizu "recommendedPropertyIds" kako bi mu se prikazale kartice, ali ga pitaj šta najviše voli (npr. bazen, peščanu plažu, miran odmor) kako biste zajedno suzili izbor.
4. **Struktura i dužina**: Odgovoru moraju biti sažeti ali izuzetno topli i ugodni (oko 3-4 rečenice). Koristi novi red (paragraf) za svaku celinu radi preglednosti. Koristi emojije (npr. 🏖️, 🌊, 💰, 🛏️) na prirodan način.
5. **Pregovaranje o ceni**: Ako klijent kaže da je skupo, pokaži empatiju (npr. "Razumem da je budžet važan."), objasni vrednost tog smeštaja, i odmah mu ponudi povoljniju alternativu sa liste sa tačnom cenom.
6. **Uputstvo za rezervaciju**: Kada gost pita kako da rezerviše, OBAVEZNO doslovno napiši: "Možete rezervisati klikom na karticu smeštaja koja se pojavila ispod naše poruke ili klikom na dugme 'Pogledaj' na njoj."
7. **Zadržavanje pažnje**: Na kraju poruke uvek postavi jedno kratko, logično pitanje da nastaviš razgovor i pomogneš gostu (npr. "Koji period letovanja planirate?", "Za koliko osoba tražite smeštaj?").
8. **Format**: Odgovori ISKLJUČIVO u sledećem JSON formatu, bez ikakvog dodatnog teksta van JSON-a:
{
  "text": "Tekst tvog odgovora...",
  "recommendedPropertyIds": [1, 2] // ID-jevi preporučenih smeštaja sa liste iznad (prazan niz ako klijentu još ništa ne preporučuješ)
}
9. **BEZ LINKOVA (STRIKTNO PRAVILO)**: U svom tekstu (polje "text" u JSON-u) nikada, ni pod kojim uslovima, nemoj ispisivati nikakve URL linkove, veb adrese (npr. www.nesto.com, http://...) niti markdown linkove (npr. [naziv](link)). Zabranjeno je slanje bilo kakvih linkova korisniku! Umesto toga, samo napiši ime smeštaja običnim rečima, a njegove ID-jeve prosledi u nizu "recommendedPropertyIds". Sistem će te ID-jeve automatski pretvoriti u prelepe kartice na klijentu.`
              },
              ...history,
              { 
                role: 'user', 
                content: `${message}\n\n[UPUTSTVO ZA ODGOVOR: Odgovori na srpskom jeziku, toplo, prirodno i profesionalno, u najviše 3-4 rečenice. Ćaskaj lepo sa klijentom, nemoj odmah gurnuti smeštaje ako tek počinjete razgovor, već ga saslušaj i pitaj za želje. Odgovori ISKLJUČIVO u JSON formatu: { "text": "...", "recommendedPropertyIds": [...] }. Ako te gost pita kako da rezerviše, OBAVEZNO i doslovno napiši: "Možete rezervisati klikom na karticu smeštaja koja se pojavila ispod naše poruke ili klikom na dugme 'Pogledaj' na njoj." STRIKTNO JE ZABRANJENO slanje bilo kakvih linkova, URL-ova ili markdown linkova u polju "text". Smeštaje preporuči isključivo kroz niz "recommendedPropertyIds" (u tekstu navedi samo njihova imena običnim rečima). Ako klijent pita opšte pitanje poput "šta nudite", predstavi ponudu toplo i ponudi 2-3 smeštaja sa spiska kroz recommendedPropertyIds, pitajući ga šta preferira za savršen odmor.]`
              }
            ],
            response_format: { type: 'json_object' }
          })
        });
      } catch (fetchErr) {
        console.warn('Groq API poziv nije uspeo, koristi se lokalni fallback:', fetchErr.message);
        const fallback = getFallbackResponse(message, properties);
        return res.json(fallback);
      }

      if (!response.ok) {
        console.warn(`Groq API je vratio status ${response.status} (${response.statusText}), koristi se lokalni fallback.`);
        const fallback = getFallbackResponse(message, properties);
        return res.json(fallback);
      }

      const data = await response.ok ? await response.json() : null;
      if (!data) {
        const fallback = getFallbackResponse(message, properties);
        return res.json(fallback);
      }

      try {
        const aiReply = JSON.parse(data.choices[0].message.content.trim());
        
        if (aiReply.text) {
          // Remove markdown links: [Text](URL) -> Text
          aiReply.text = aiReply.text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
          // Remove raw URLs (http://... or https://...)
          aiReply.text = aiReply.text.replace(/https?:\/\/[^\s]+/g, '');
          // Remove domain-like strings just in case
          aiReply.text = aiReply.text.replace(/\bwww\.[a-z0-9-]+\.[a-z]{2,}\S*/gi, '');
        }
        
        // Post-processing override to guarantee strict booking instruction rules are met
        const userText = message.toLowerCase();
        const isAskingBooking = userText.includes("rezerv") || userText.includes("kako da") || userText.includes("bukir");
        if (isAskingBooking) {
          const hasCorrectBookingText = aiReply.text && (aiReply.text.includes("klikom") || aiReply.text.includes("karticu") || aiReply.text.includes("Pogledaj"));
          if (!hasCorrectBookingText) {
            aiReply.text = `Možete rezervisati klikom na karticu smeštaja koja se pojavila ispod naše poruke ili klikom na dugme 'Pogledaj' na njoj. 📅\n\nDa li želite da vam pomognem oko izbora ili imate još pitanja?`;
          }
        }
        
        return res.json(aiReply);
      } catch (parseErr) {
        console.error('Groq JSON Parse Error, falling back to rule-based engine:', parseErr);
        const fallback = getFallbackResponse(message, properties);
        return res.json(fallback);
      }
    } else {
      // Fallback rule-based matching if no API key is provided
      const fallback = getFallbackResponse(message, properties);
      return res.json(fallback);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Booking.com Property Importer Endpoint
app.post('/api/import-booking', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL adresa je obavezna.' });
  }

  console.log(`--- [BOOKING.COM IMPORT] Pokrećem uvoz sa URL-a: ${url} ---`);

  const cleanText = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  };

  let importedData = null;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'sr-RS,sr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (response.ok) {
      const html = await response.text();

      let title = '';
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || 
                         html.match(/<h2[^>]*class="[^"]*pp-header__title[^"]*"[^>]*>([^<]+)<\/h2>/i) ||
                         html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch) {
        title = cleanText(titleMatch[1]).split(' - ')[0].split(' | ')[0];
      }

      let description = '';
      const descMatch = html.match(/<div[^>]*id="property_description_content"[^>]*>([\s\S]+?)<\/div>/i) ||
                        html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
                        html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
      if (descMatch) {
        description = cleanText(descMatch[1]);
      }

      const imgRegex = /https:\/\/cf\.bstatic\.com\/xdata\/images\/hotel\/max1024x768\/[0-9]+\.jpg\?k=[a-f0-9]+/gi;
      let matchedImages = html.match(imgRegex) || [];
      if (matchedImages.length === 0) {
        const simpleImgRegex = /https:\/\/cf\.bstatic\.com\/xdata\/images\/hotel\/[a-zA-Z0-9._\-\/]+/gi;
        matchedImages = html.match(simpleImgRegex) || [];
      }
      const images = [...new Set(matchedImages)].slice(0, 8);

      let location = 'Tasos';
      const addressMatch = html.match(/<span[^>]*class="hp_address_subtitle[^"]*"[^>]*>([^<]+)<\/span>/i);
      if (addressMatch) {
        const addressText = cleanText(addressMatch[1]).toLowerCase();
        if (addressText.includes('lefkad') || url.toLowerCase().includes('lefkada')) location = 'Lefkada';
        else if (addressText.includes('thassos') || addressText.includes('tasos') || url.toLowerCase().includes('thassos') || url.toLowerCase().includes('tasos')) location = 'Tasos';
        else if (addressText.includes('krit') || addressText.includes('crete') || url.toLowerCase().includes('crete')) location = 'Krit';
        else if (addressText.includes('kassandra') || addressText.includes('kasandr')) location = 'Kasandra';
        else if (addressText.includes('sithonia') || addressText.includes('sitonij')) location = 'Sitonija';
        else if (addressText.includes('halkidiki') || addressText.includes('halkidik')) location = 'Halkidiki';
      }

      const lowerHTML = html.toLowerCase();
      const amenities = {
        wifi: lowerHTML.includes('wifi') || lowerHTML.includes('wi-fi') || lowerHTML.includes('internet'),
        pool: lowerHTML.includes('bazen') || lowerHTML.includes('pool') || lowerHTML.includes('swimming'),
        beachfront: lowerHTML.includes('plaža') || lowerHTML.includes('beach') || lowerHTML.includes('front') || lowerHTML.includes('obala'),
        parking: lowerHTML.includes('parking') || lowerHTML.includes('garaža'),
        airConditioning: lowerHTML.includes('klima') || lowerHTML.includes('air cond'),
        pets: lowerHTML.includes('ljubim') || lowerHTML.includes('pet ') || lowerHTML.includes('dozvolj')
      };

      let type = 'Apartman';
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('vila') || lowerTitle.includes('villa')) type = 'Vila';
      else if (lowerTitle.includes('hotel') || lowerTitle.includes('resort')) type = 'Hotel';

      if (title && description && images.length > 0) {
        importedData = {
          title,
          description,
          images,
          location,
          type,
          price: Math.floor(Math.random() * 80) + 60,
          guests: 4,
          bedrooms: 2,
          amenities
        };
      }
    }
  } catch (err) {
    console.warn('Booking.com fetch failed or timed out. Switching to simulation mode.', err.message);
  }

  if (!importedData) {
    console.log('--- [SIMULATION MODE ACTIVE] Generišem premium podatke iz URL-a ---');
    
    let urlSlug = 'Apartman Aura Beach';
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      const parts = pathname.split('/').filter(Boolean);
      const hotelPart = parts.find(p => p.includes('.html')) || parts[parts.length - 1] || 'apartmani-aurabeach';
      urlSlug = hotelPart
        .replace('.html', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch (e) {}

    let type = 'Apartman';
    if (urlSlug.toLowerCase().includes('vila') || urlSlug.toLowerCase().includes('villa')) type = 'Vila';
    else if (urlSlug.toLowerCase().includes('hotel') || urlSlug.toLowerCase().includes('resort')) type = 'Hotel';

    let location = 'Tasos';
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('lefkada')) location = 'Lefkada';
    else if (lowerUrl.includes('tasos') || lowerUrl.includes('thassos')) location = 'Tasos';
    else if (lowerUrl.includes('krit') || lowerUrl.includes('crete')) location = 'Krit';
    else if (lowerUrl.includes('kassandra') || lowerUrl.includes('kasandra')) location = 'Kasandra';
    else if (lowerUrl.includes('sithonia') || lowerUrl.includes('sitonija')) location = 'Sitonija';
    else if (lowerUrl.includes('halkidiki')) location = 'Halkidiki';
    else {
      const locations = ['Tasos', 'Lefkada', 'Sitonija', 'Kasandra', 'Krit'];
      location = locations[Math.floor(Math.random() * locations.length)];
    }

    const mockImages = [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
    ];

    importedData = {
      title: urlSlug,
      description: `Prelep smeštaj "${urlSlug}" u mestu ${location}. Udaljen samo par koraka od obale sa čarobnim pogledom na more. Potpuno klimatizovan, moderno opremljen sa prostranim terasama i dvorištem. Savršeno mesto za porodični odmor i uživanje u toplim letnjim večerima.`,
      images: mockImages,
      location: location,
      type: type,
      price: type === 'Vila' ? 145 : type === 'Hotel' ? 115 : 65,
      guests: type === 'Vila' ? 8 : 4,
      bedrooms: type === 'Vila' ? 4 : 2,
      amenities: {
        wifi: true,
        pool: type === 'Vila' || Math.random() > 0.5,
        beachfront: Math.random() > 0.5,
        parking: true,
        airConditioning: true,
        pets: Math.random() > 0.5
      }
    };
  }

  console.log(`--- [BOOKING.COM IMPORT] Uspešno uvezeno: ${importedData.title} ---`);
  res.json(importedData);
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fajl nije otpremljen.' });
  }

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'ellinas' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      const result = await uploadPromise;
      res.json({ url: result.secure_url });
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      res.status(500).json({ error: 'Greška pri otpremanju na Cloudinary: ' + err.message });
    }
  } else {
    const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  }
});

// 24. Get Synced Calendar Blocks
app.get('/api/properties/:id/calendar-blocks', async (req, res) => {
  const { id } = req.params;
  const { roomTitle } = req.query;
  try {
    let query = 'SELECT * FROM calendar_blocks WHERE propertyId = ?';
    const params = [id];
    if (roomTitle) {
      query += ' AND (roomTitle = ? OR roomTitle IS NULL OR roomTitle = "")';
      params.push(roomTitle);
    }
    const blocks = await dbHelper.all(query, params);
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 25. Synchronize Property and Rooms from External Booking.com iCal Feeds
// 25. Synchronize Property and Rooms from External Booking.com iCal Feeds
// Lightweight ICS Parser
function parseICS(icsText) {
  const events = [];
  const lines = icsText.split(/\r?\n/);
  let currentEvent = null;
  
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (cleanLine.startsWith('END:VEVENT')) {
      if (currentEvent && currentEvent.start && currentEvent.end) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (cleanLine.startsWith('DTSTART')) {
        const parts = cleanLine.split(':');
        const val = parts[parts.length - 1].trim();
        currentEvent.start = val.substring(0, 8); // 'YYYYMMDD'
      } else if (cleanLine.startsWith('DTEND')) {
        const parts = cleanLine.split(':');
        const val = parts[parts.length - 1].trim();
        currentEvent.end = val.substring(0, 8); // 'YYYYMMDD'
      }
    }
  }
  
  const formatted = [];
  for (const ev of events) {
    if (ev.start && ev.end && ev.start.length === 8 && ev.end.length === 8) {
      const startStr = `${ev.start.substring(0, 4)}-${ev.start.substring(4, 6)}-${ev.start.substring(6, 8)}`;
      const endStr = `${ev.end.substring(0, 4)}-${ev.end.substring(4, 6)}-${ev.end.substring(6, 8)}`;
      formatted.push({ start: startStr, end: endStr });
    }
  }
  return formatted;
}

// Reusable function to perform iCal sync for a property
async function performICalSyncForProperty(id, force = false) {
  const property = await dbHelper.get('SELECT * FROM properties WHERE id = ?', [id]);
  if (!property) {
    throw new Error('Property not found.');
  }

  // 15-minute sync throttle (ignore if force=true is passed)
  const fifteenMinutes = 15 * 60 * 1000;
  if (!force && property.lastSynced && (Date.now() - property.lastSynced < fifteenMinutes)) {
    return { skipped: true };
  }

  const rooms = await dbHelper.all('SELECT * FROM rooms WHERE propertyId = ?', [id]);

  // Clear old imported blocks for this property
  await dbHelper.run('DELETE FROM calendar_blocks WHERE propertyId = ? AND source = "booking.com"', [id]);

  let syncedCount = 0;

  // 1. Sync whole property calendar if icalUrl exists
  if (property.icalUrl && property.icalUrl.trim()) {
    try {
      const resIcal = await fetch(property.icalUrl.trim(), { headers: { 'User-Agent': 'Ellinas/1.0' } });
      if (resIcal.ok) {
        const text = await resIcal.text();
        const blocks = parseICS(text);
        for (const block of blocks) {
          await dbHelper.run(
            'INSERT INTO calendar_blocks (propertyId, roomTitle, startDate, endDate, source) VALUES (?, ?, ?, ?, ?)',
            [id, null, block.start, block.end, 'booking.com']
          );
          syncedCount++;
        }
      }
    } catch (err) {
      console.error(`Failed to sync property-level ical for ID ${id}:`, err.message);
    }
  }

  // 2. Sync individual rooms calendars if room.icalUrl exists
  for (const room of rooms) {
    if (room.icalUrl && room.icalUrl.trim()) {
      try {
        const resIcal = await fetch(room.icalUrl.trim(), { headers: { 'User-Agent': 'Ellinas/1.0' } });
        if (resIcal.ok) {
          const text = await resIcal.text();
          const blocks = parseICS(text);
          for (const block of blocks) {
            await dbHelper.run(
              'INSERT INTO calendar_blocks (propertyId, roomTitle, startDate, endDate, source) VALUES (?, ?, ?, ?, ?)',
              [id, room.title, block.start, block.end, 'booking.com']
            );
            syncedCount++;
          }
        }
      } catch (err) {
        console.error(`Failed to sync room-level ical for room ${room.id}:`, err.message);
      }
    }
  }

  // Update lastSynced timestamp
  await dbHelper.run('UPDATE properties SET lastSynced = ? WHERE id = ?', [Date.now(), id]);

  return { success: true, syncedCount };
}

// Automated Background Calendar Synchronization
function startBackgroundICalSync() {
  console.log('[Sync] Inicijalizujem automatsku pozadinsku sinhronizaciju iCal kalendara...');
  
  // Pokreni proveru odmah nakon starta (sa malim zakašnjenjem od 10 sekundi da se baza stabilizuje)
  setTimeout(() => {
    runBackgroundSyncTask();
  }, 10000);

  // Proveravaj na svakih 5 minuta (300000 ms)
  setInterval(() => {
    runBackgroundSyncTask();
  }, 5 * 60 * 1000); 
}

// Glavna funkcija za pozadinsku sinhronizaciju
async function runBackgroundSyncTask() {
  try {
    console.log('[Sync] Pokrecem automatsku sinhronizaciju kalendara za sve objekte u pozadini...');
    // Pronađi sve objekte koji imaju icalUrl ili imaju sobe sa icalUrl
    const properties = await dbHelper.all(`
      SELECT DISTINCT p.id, p.title, p.lastSynced 
      FROM properties p 
      LEFT JOIN rooms r ON p.id = r.propertyId 
      WHERE (p.icalUrl IS NOT NULL AND p.icalUrl != '') 
         OR (r.icalUrl IS NOT NULL AND r.icalUrl != '')
    `);
    
    const fifteenMinutes = 15 * 60 * 1000;
    let syncCount = 0;
    
    for (const prop of properties) {
      if (!prop.lastSynced || (Date.now() - prop.lastSynced >= fifteenMinutes)) {
        try {
          console.log(`[Sync] Pozadinska sinhronizacija za objekat: ${prop.title} (ID: ${prop.id})`);
          await performICalSyncForProperty(prop.id, false);
          syncCount++;
        } catch (syncErr) {
          console.error(`[Sync] Greska pri pozadinskoj sinhronizaciji objekta ${prop.id}:`, syncErr.message);
        }
      }
    }
    if (syncCount > 0) {
      console.log(`[Sync] Zavrsena pozadinska sinhronizacija. Azurirano ${syncCount} objekata.`);
    } else {
      console.log('[Sync] Nema objekata kojima je potrebna sinhronizacija u ovom intervalu.');
    }
  } catch (err) {
    console.error('[Sync] Greska u pozadinskom poslu za sinhronizaciju kalendara:', err.message);
  }
}

app.post('/api/properties/:id/sync-ical', async (req, res) => {
  const { id } = req.params;
  const force = req.query.force === 'true';
  try {
    const result = await performICalSyncForProperty(id, force);
    if (result.skipped) {
      return res.json({ 
        success: true, 
        message: 'Kalendar je nedavno sinhronizovan (pre manje od 15 minuta). Sinhronizacija preskočena radi optimalnog rada.', 
        skipped: true 
      });
    }
    res.json({ success: true, message: `Sinhronizacija završena! Uvezeno ${result.syncedCount} perioda sa Booking.com.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 26. Export Property approved bookings as iCal Feed
app.get('/api/properties/:id/export-ical', async (req, res) => {
  const { id } = req.params;
  try {
    const property = await dbHelper.get('SELECT * FROM properties WHERE id = ?', [id]);
    if (!property) return res.status(404).send('Property not found');
    
    const inquiries = await dbHelper.all(
      'SELECT * FROM inquiries WHERE propertyId = ? AND status = "Odobreno" AND (roomTitle IS NULL OR roomTitle = "")',
      [id]
    );
    
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ellinas//Calendar Export 1.0//SR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    
    for (const inq of inquiries) {
      const startClean = inq.checkIn.replace(/-/g, '');
      const endClean = inq.checkOut.replace(/-/g, '');
      ics.push('BEGIN:VEVENT');
      ics.push(`UID:inquiry-${inq.id}@ellinas.com`);
      ics.push(`DTSTAMP:${new Date().toISOString().substring(0, 19).replace(/[-:]/g, '')}Z`);
      ics.push(`DTSTART;VALUE=DATE:${startClean}`);
      ics.push(`DTEND;VALUE=DATE:${endClean}`);
      ics.push('SUMMARY:Rezervisano Ellinas');
      ics.push('END:VEVENT');
    }
    
    ics.push('END:VCALENDAR');
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="property-${id}-calendar.ics"`);
    res.send(ics.join('\r\n'));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 27. Export Room approved bookings as iCal Feed
app.get('/api/rooms/:roomId/export-ical', async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await dbHelper.get('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (!room) return res.status(404).send('Room not found');
    
    const inquiries = await dbHelper.all(
      'SELECT * FROM inquiries WHERE propertyId = ? AND status = "Odobreno" AND roomTitle = ?',
      [room.propertyId, room.title]
    );
    
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ellinas//Calendar Export 1.0//SR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    
    for (const inq of inquiries) {
      const startClean = inq.checkIn.replace(/-/g, '');
      const endClean = inq.checkOut.replace(/-/g, '');
      ics.push('BEGIN:VEVENT');
      ics.push(`UID:room-inquiry-${inq.id}@ellinas.com`);
      ics.push(`DTSTAMP:${new Date().toISOString().substring(0, 19).replace(/[-:]/g, '')}Z`);
      ics.push(`DTSTART;VALUE=DATE:${startClean}`);
      ics.push(`DTEND;VALUE=DATE:${endClean}`);
      ics.push('SUMMARY:Rezervisano Ellinas');
      ics.push('END:VEVENT');
    }
    
    ics.push('END:VCALENDAR');
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="room-${roomId}-calendar.ics"`);
    res.send(ics.join('\r\n'));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Pravi Aura Backend Server radi na adresi: http://localhost:${PORT}`);
});
