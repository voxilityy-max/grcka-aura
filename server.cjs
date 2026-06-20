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
    isAdmin INTEGER DEFAULT 0
  )`);

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
    pets INTEGER DEFAULT 0
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
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
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

      const seedUsers = [
        [999, 'stefan', 'Stefan Petrović', 'stefan@email.com', hashedPassword, '+381 60 123 4567', 'https://ui-avatars.com/api/?name=Stefan+Petrovic&background=0a4f70&color=fff', 1],
        [1000, 'vlasnik_aura', 'Vlasnik Aura', 'voxilityy@gmail.com', hashedOwnerPassword, '+381 60 111 2233', 'https://ui-avatars.com/api/?name=Vlasnik+Aura&background=00b4d8&color=fff', 1]
      ];

      for (const u of seedUsers) {
        await dbHelper.run('INSERT OR REPLACE INTO users (id, username, fullName, email, password, phone, avatar, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', u);
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

      console.log('Popunjavanje baze inicijalnim podacima je uspešno završeno.');
      
      // 8. Seed Rooms if empty
      const roomsRow = await dbHelper.get('SELECT COUNT(*) as count FROM rooms');
      if (!roomsRow || Number(roomsRow.count) === 0) {
        console.log('Popunjavam tabelu rooms inicijalnim podacima...');
        const seedRooms = [
          [1, 'Standardna Trokrevetna Soba', 95, 3, 1, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', 'Standardna soba sa pogledom na planinu i jednim francuskim krevetom.'],
          [1, 'Deluxe Apartman sa pogledom na more', 125, 4, 2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 'Luksuzan dvosobni apartman sa sopstvenim balkonom i velikom kadom.'],
          [1, 'Predsednički Dupleks sa terasom', 180, 6, 3, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', 'Najekskluzivniji smeštaj u vili na dva nivoa sa đakuzijem na terasi.'],

          [2, 'Jednosoban Apartman (Prizemlje)', 45, 3, 1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', 'Jednostavan porodični apartman u prizemlju sa direktnim izlazom u dvorište.'],
          [2, 'Studio sa pogledom na more (Sprat)', 55, 2, 1, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', 'Romantičan studio za parove sa prelepim pogledom na more sa balkona.'],
          
          [3, 'Standard Room (Bez balkona)', 140, 2, 1, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', 'Udobna standardna soba, idealna za kraće boravke.'],
          [3, 'Superior Sea View Room', 195, 3, 1, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', 'Komforna soba na višim spratovima sa frontalnim pogledom na Egejsko more.'],
          
          [4, 'Apartman sa jednom spavaćom sobom', 35, 3, 1, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', 'Povoljan apartman za manju porodicu, opremljen čajnom kuhinjom.'],
          [4, 'Porodični dvosobni apartman', 45, 5, 2, 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80', 'Veliki prostrani apartman sa dve spavaće sobe i terasom.'],

          [5, 'Četvorokrevetni apartman', 120, 4, 2, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', 'Komforan apartman sa dve spavaće sobe, idealan za dve porodice.'],
          [5, 'Deluxe Vila na plaži', 155, 8, 4, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', 'Cela kuća sa sopstvenim dvorištem na samoj peščanoj plaži.'],

          [6, 'Double Standard Room', 80, 2, 1, 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80', 'Dvokrevetna soba sa bračnim krevetom ili dva odvojena ležaja.'],
          [6, 'Triple Superior Room', 90, 3, 1, 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80', 'Soba sa bračnim krevetom i jednim pomoćnim krevetom sa pogledom na bazen.']
        ];
        for (const rm of seedRooms) {
          await dbHelper.run('INSERT INTO rooms (propertyId, title, price, guests, bedrooms, image, description) VALUES (?, ?, ?, ?, ?, ?, ?)', rm);
        }
        console.log('Seeding rooms table done.');
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
    
    // Sign JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Auth Register
app.post('/api/auth/register', async (req, res) => {
  const { username, fullName, email, password, phone, avatar, isAdmin } = req.body;
  const adminFlag = isAdmin ? 1 : 0;
  
  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  try {
    const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName) + '&background=0a4f70&color=fff';
    const result = await dbHelper.run(
      'INSERT INTO users (username, fullName, email, password, phone, avatar, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, fullName, email.toLowerCase().trim(), hashedPassword, phone, avatar || defaultAvatar, adminFlag]
    );
    
    const user = await dbHelper.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    user.isAdmin = !!user.isAdmin;
    
    // Sign JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
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

app.post('/api/properties', requireAdmin, async (req, res) => {
  const { title, type, location, price, rating, distanceToBeach, image, guests, bedrooms, description, icalUrl, amenities } = req.body;
  
  try {
    const result = await dbHelper.run(
      `INSERT INTO properties (title, type, location, price, rating, distanceToBeach, image, guests, bedrooms, description, wifi, pool, beachfront, parking, airConditioning, pets, icalUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, type, location, price, rating || 5.0, distanceToBeach, image, guests, bedrooms, description,
        amenities.wifi ? 1 : 0, amenities.pool ? 1 : 0, amenities.beachfront ? 1 : 0, amenities.parking ? 1 : 0, amenities.airConditioning ? 1 : 0, amenities.pets ? 1 : 0,
        icalUrl || null
      ]
    );
    
    const prop = await dbHelper.get('SELECT * FROM properties WHERE id = ?', [result.lastID]);
    prop.amenities = amenities;
    prop.reviews = [];
    res.json(prop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete Property
app.delete('/api/properties/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
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
app.delete('/api/properties/:propertyId/reviews/:reviewId', requireAdmin, async (req, res) => {
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
app.delete('/api/forum-posts/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await dbHelper.run('DELETE FROM forum_posts WHERE id = ?', [id]);
    res.json({ success: true, changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 18. Toggle User Admin Status
app.patch('/api/users/:id/role', requireAdmin, async (req, res) => {
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

// 19. Get Users List
app.get('/api/users', async (req, res) => {
  try {
    const users = await dbHelper.all('SELECT * FROM users');
    const mapped = users.map(u => {
      u.isAdmin = !!u.isAdmin;
      return u;
    });
    res.json(mapped);
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
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 21. Real SQLite SQL Query Terminal Endpoint
app.post('/api/admin/query', requireAdmin, async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Nije unet SQL upit.' });
  }

  const trimmed = query.trim().toUpperCase();
  
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
app.post('/api/admin/reset-db', requireAdmin, async (req, res) => {
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
    });

    console.log('Tabele obrisane na zahtev administratora.');
    await initializeSchema();
    res.json({ success: true, message: 'Baza podataka je uspešno resetovana na fabrička podešavanja.' });
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

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Fajl nije otpremljen.' });
  }

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'grcka_aura' },
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
app.post('/api/properties/:id/sync-ical', async (req, res) => {
  const { id } = req.params;
  
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

  try {
    const property = await dbHelper.get('SELECT * FROM properties WHERE id = ?', [id]);
    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    const rooms = await dbHelper.all('SELECT * FROM rooms WHERE propertyId = ?', [id]);

    // Clear old imported blocks for this property
    await dbHelper.run('DELETE FROM calendar_blocks WHERE propertyId = ? AND source = "booking.com"', [id]);

    let syncedCount = 0;

    // 1. Sync whole property calendar if icalUrl exists
    if (property.icalUrl && property.icalUrl.trim()) {
      try {
        const resIcal = await fetch(property.icalUrl.trim(), { headers: { 'User-Agent': 'GrckaAura/1.0' } });
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
          const resIcal = await fetch(room.icalUrl.trim(), { headers: { 'User-Agent': 'GrckaAura/1.0' } });
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

    res.json({ success: true, message: `Sinhronizacija završena! Uvezeno ${syncedCount} perioda sa Booking.com.` });
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
      'PRODID:-//GrckaAura//Calendar Export 1.0//SR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    
    for (const inq of inquiries) {
      const startClean = inq.checkIn.replace(/-/g, '');
      const endClean = inq.checkOut.replace(/-/g, '');
      ics.push('BEGIN:VEVENT');
      ics.push(`UID:inquiry-${inq.id}@grcka-aura.com`);
      ics.push(`DTSTAMP:${new Date().toISOString().substring(0, 19).replace(/[-:]/g, '')}Z`);
      ics.push(`DTSTART;VALUE=DATE:${startClean}`);
      ics.push(`DTEND;VALUE=DATE:${endClean}`);
      ics.push('SUMMARY:Rezervisano GrckaAura');
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
      'PRODID:-//GrckaAura//Calendar Export 1.0//SR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];
    
    for (const inq of inquiries) {
      const startClean = inq.checkIn.replace(/-/g, '');
      const endClean = inq.checkOut.replace(/-/g, '');
      ics.push('BEGIN:VEVENT');
      ics.push(`UID:room-inquiry-${inq.id}@grcka-aura.com`);
      ics.push(`DTSTAMP:${new Date().toISOString().substring(0, 19).replace(/[-:]/g, '')}Z`);
      ics.push(`DTSTART;VALUE=DATE:${startClean}`);
      ics.push(`DTEND;VALUE=DATE:${endClean}`);
      ics.push('SUMMARY:Rezervisano GrckaAura');
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
