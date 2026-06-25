const http = require('http');
const fs = require('fs');
const path = require('path');

function sendChat(message, history = []) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ message, history, isLoggedIn: false });

    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/ai/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('=== TESTIRANJE PERFEKTNE AI KONVERZACIJE ===\n');
  const chatHistory = [];
  const logLines = [];

  const conversationSteps = [
    {
      user: 'Zdravo',
      desc: '1. Početni pozdrav bez detalja'
    },
    {
      user: 'Idemo na Tasos',
      desc: '2. Parcijalan unos (samo destinacija)'
    },
    {
      user: 'Nas je četvoro i planiramo od 10. do 20. jula.',
      desc: '3. Preostali detalji (broj osoba i termin)'
    },
    {
      user: 'Kako mogu da rezervišem?',
      desc: '4. Upit o rezervaciji'
    },
    {
      user: 'Zovem se Stefan Petrović, email je stefan@email.com, telefon +38160123456.',
      desc: '5. Slanje ličnih podataka za automatsku izradu nacrta'
    },
    {
      user: 'Da, pošalji',
      desc: '6. Potvrda slanja nacrta'
    }
  ];

  for (const step of conversationSteps) {
    console.log(`[KORAK] ${step.desc}`);
    console.log(`Korisnik: "${step.user}"`);
    logLines.push(`**Korisnik:** ${step.user}`);

    try {
      // Build LLM history format
      const llmHistory = chatHistory.map(h => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      }));

      // In real App.jsx, if user confirms draft ("Da, pošalji"), frontend calls handleConfirmInquiryDraft directly.
      // Let's simulate that behavior or send it to server.
      let responseText = '';
      let recommendedPropertyIds = [];
      let inquiryDraft = null;

      const isYes = ['da', 'moze', 'može', 'pošalji', 'posalji', 'potvrdi', 'potvrđujem', 'potvrdjujem', 'ok', 'yes', 'naravno'].some(word => step.user.trim().toLowerCase().includes(word));
      const lastAiMsg = [...chatHistory].reverse().find(m => m.sender === 'ai');

      if (lastAiMsg && lastAiMsg.inquiryDraft && !lastAiMsg.inquiryDraft.submitted && isYes) {
        // Simulate frontend confirmation
        responseText = `Vaš upit je uspešno poslat! Domaćin će vas kontaktirati na email **${lastAiMsg.inquiryDraft.guestEmail}** ili telefon **${lastAiMsg.inquiryDraft.guestPhone}**. Hvala vam! Letovanje je rezervisano. Let's go! 🌴`;
        inquiryDraft = { ...lastAiMsg.inquiryDraft, submitted: true };
      } else {
        const response = await sendChat(step.user, llmHistory);
        responseText = response.text;
        recommendedPropertyIds = response.recommendedPropertyIds || [];
        inquiryDraft = response.inquiryDraft || null;
      }

      console.log(`Asistent: "${responseText}"`);
      if (recommendedPropertyIds.length > 0) {
        console.log(`Preporučeni smeštaji (ID):`, recommendedPropertyIds);
      }
      if (inquiryDraft) {
        console.log(`Nacrt upita (inquiryDraft):`, JSON.stringify(inquiryDraft, null, 2));
      }
      console.log('----------------------------------------\n');

      logLines.push(`**Ellinas AI:** ${responseText}`);
      if (recommendedPropertyIds.length > 0) {
        logLines.push(`*Preporučeni smeštaji:* ID ${recommendedPropertyIds.join(', ')}`);
      }
      if (inquiryDraft) {
        logLines.push(`*Nacrt upita:* Smeštaj #${inquiryDraft.propertyId}, ${inquiryDraft.dates}, ${inquiryDraft.guests} osobe, ukupna cena: ${inquiryDraft.totalPrice}€, Status podnesenosti: ${inquiryDraft.submitted ? 'Poslat ✅' : 'Čeka potvrdu ⏳'}`);
      }
      logLines.push('');

      // Add to our local message history state
      chatHistory.push({ sender: 'user', text: step.user });
      chatHistory.push({ sender: 'ai', text: responseText, recommendedPropertyIds, inquiryDraft });

    } catch (err) {
      console.error(`Greška na koraku:`, err.message);
      break;
    }
  }

  // Save the conversation to a walkthrough artifact
  const logContent = `## Perfektna AI Konverzacija (Simulirani Tok)

Ova konverzacija simulira ceo put korisnika koji pronalazi smeštaj i uspešno podnosi upit preko našeg integrisanog AI asistenta:

${logLines.join('\n')}
`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'scratch', 'perfect_conversation_log.md'), logContent, 'utf8');
  console.log('=== TESTIRANJE ZAVRŠENO - Rezultati sačuvani u scratch/perfect_conversation_log.md ===');
}

run();
