const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN = process.env.WA_TOKEN;
const PHONE_ID = process.env.PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Root endpoint
app.get('/', (req, res) => {
  res.send('Bot Jewel Beauty aktif!');
});

// Webhook verification
app.get('/webhook', (req, res) => {
  console.log('=== WEBHOOK VERIFY REQUEST ===');
  console.log('Query:', req.query);
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verification failed');
    res.sendStatus(403);
  }
});

// Webhook receiver
app.post('/webhook', async (req, res) => {
  console.log('=== WEBHOOK POST RECEIVED ===');
  console.log('Time:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Always respond 200 first
  res.sendStatus(200);
  
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    
    if (!message) {
      console.log('ℹ️ No message in payload (probably status update)');
      return;
    }
    
    const from = message.from;
    const text = message.text?.body?.toLowerCase() || '';
    
    console.log(`📩 Message from ${from}: "${text}"`);
    
    let reply = '';
    
    if (text.includes('harga') || text.includes('price')) {
      reply = 'Halo! 💖 Harga treatment Jewel Beauty:\n\n• Lash Lift: Rp 120k\n• Eyelash Extension: Rp 150k\n• Sulam Alis: Rp 500k\n• Facial: Rp 100k\n\nInfo lengkap: IG @jewelbeautybandung';
    } else if (text.includes('lokasi') || text.includes('alamat')) {
      reply = 'Lokasi kami di Bandung. DM IG @jewelbeautybandung untuk alamat detail ya! 📍';
    } else if (text.includes('booking') || text.includes('daftar') || text.includes('reservasi')) {
      reply = 'Untuk booking, kasih tahu:\n1. Nama\n2. Treatment\n3. Tanggal\n\nKami akan konfirmasi! ✨';
    } else if (text.includes('promo') || text.includes('diskon')) {
      reply = 'Cek promo terbaru di IG @jewelbeautybandung! 🎉';
    } else if (text.includes('buka') || text.includes('jam')) {
      reply = 'Kami buka 09.00-20.00 WIB setiap hari ⏰';
    } else if (text.includes('treatment') || text.includes('layanan') || text.includes('service')) {
      reply = 'Layanan kami:\n💖 Eyelash Extension\n💖 Lash Lift\n💖 Sulam Alis\n💖 Brow Lamination\n💖 Facial\n💖 Nail Art\n💖 Halal Gel Polish';
    } else {
      reply = 'Halo! 💖 Selamat datang di Jewel Beauty Bandung.\n\nKetik:\n• "harga" - lihat harga\n• "lokasi" - alamat\n• "booking" - reservasi\n• "promo" - diskon\n• "treatment" - layanan';
    }
    
    console.log(`📤 Sending reply to ${from}`);
    console.log(`Token starts with: ${TOKEN?.substring(0, 10)}...`);
    console.log(`Phone ID: ${PHONE_ID}`);
    
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: reply }
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Reply sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error kirim pesan:', JSON.stringify(error.response?.data || error.message, null, 2));
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Bot Jewel Beauty jalan di port ${PORT}`);
  console.log(`Token loaded: ${TOKEN ? 'YES (' + TOKEN.substring(0, 10) + '...)' : 'NO'}`);
  console.log(`Phone ID: ${PHONE_ID || 'NOT SET'}`);
  console.log(`Verify Token: ${VERIFY_TOKEN || 'NOT SET'}`);
});
