const dotenv = require('dotenv');
const sqlite3 = require('sqlite3');

dotenv.config({ path: 'c:/Users/sasag/Desktop/ZET STEFAN/.env' });

const db = new sqlite3.Database('c:/Users/sasag/Desktop/ZET STEFAN/database.sqlite');

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function testAi() {
  try {
    console.log('--- TESTIRANJE AI ASISTENTA SA VAŠIM KLJUČEM ---');
    console.log('Učitavam podatke iz baze...');
    const propertiesList = await dbAll('SELECT * FROM properties');
    const reviewsList = await dbAll('SELECT * FROM reviews');
    const roomsList = await dbAll('SELECT * FROM rooms');
    
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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.log('Greska: GROQ_API_KEY nije postavljen u .env fajlu!');
      db.close();
      return;
    }

    console.log('Pozivam Groq API sa sistemskim promptom i smeštajima...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `Ti si Ellinas AI Asistent, profesionalni i ljubazni turistički agent i koncjerž za sajt "Ellinas" (premium platforma za smeštaj u Grčkoj).
Tvoj cilj je da pomažeš klijentima da nađu savršen smeštaj, odgovaraš na pitanja i pregovaraš o ponudama.
Razgovaraj prirodno, toplo i profesionalno na srpskom jeziku, kao pravi čovek.

Dostupni smeštaji na našem sajtu (preporuči isključivo ove smeštaje i spomeni ih po imenu kada predlažeš):
${JSON.stringify(properties.map(p => ({ id: p.id, title: p.title, type: p.type, location: p.location, price: p.price, amenities: p.amenities })), null, 2)}

Pravila ponašanja:
1. Preporuči naše smeštaje. Kada predložiš smeštaj, obavezno navedi njegovo tačno ime kako bi ga sistem povezao.
2. Budi spreman na pregovore. Ako gost kaže da je skupo, ponudi jeftiniju alternativu sa spiska ili naglasi šta sve ulazi u cenu (npr. bazen, blizina plaže, privatnost) kako bi opravdao vrednost.
3. Odgovaraj kratko i koncizno (do 3-4 rečenice po poruci) kako bi čet bio lak za čitanje na mobilnim telefonima.
4. Na kraju odgovora, pitaj gosta nešto što će nastaviti razgovor (npr. "Kada planirate dolazak?", "Koliko osoba putuje sa Vama?").
5. Odgovori isključivo u validnom JSON formatu sa sledećim ključevima:
{
  "text": "Tekst tvog odgovora...",
  "recommendedPropertyIds": [1, 2] // ID-jevi preporučenih smeštaja sa liste iznad (ako ih ima)
}`
          },
          { role: 'user', content: 'Zdravo, treba mi neki fin smeštaj na Tasosu koji ima bazen.' }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      console.log(`Greska pri API pozivu: ${response.statusText}`);
      const errText = await response.text();
      console.log(errText);
    } else {
      const data = await response.json();
      console.log('\n--- ODGOVOR OD AI AGENTA: ---');
      console.log(data.choices[0].message.content);
    }
  } catch (err) {
    console.error('Došlo je do greške:', err);
  } finally {
    db.close();
  }
}

testAi();
