const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN      = process.env.WA_TOKEN;
const PHONE_ID   = process.env.PHONE_ID;
const VERIFY_TKN = process.env.VERIFY_TOKEN;

const RULES = [
  { kw: ['harga','price'],   reply: 'Harga lash lift mulai Rp 120.000, eyelash extension mulai Rp 150.000 💅 Info lengkap DM IG @jewelbeautybandung ya!' },
  { kw: ['lokasi','alamat'], reply: 'Jewel Beauty ada di Bandung 📍 DM IG @jewelbeautybandung untuk alamat lengkap ya kak!' },
  { kw: ['booking','daftar','reservasi'], reply: 'Untuk booking, ketik: Nama + Treatment + Tanggal pilihan. Kami konfirmasi segera 🗓' },
  { kw: ['promo','diskon'],  reply: 'Cek promo terbaru di Instagram @jewelbeautybandung ✨' },
  { kw: ['buka','jam'],      reply: 'Jewel Beauty buka setiap hari pukul 09.00-20.00 WIB 🕘' },
  { kw: ['treatment','layanan','service'], reply: 'Layanan kami: Eyelash Extension, Lash Lift, Sulam Alis, Facial, Nail Art, Halal Gel Polish, Brow Lamination 💖' },
];

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TKN) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg || msg.type !== 'text') return res.sendStatus(200);

  const from = msg.from;
  const text = msg.text.body.toLowerCase();
  const reply = getReply(text);

  await sendWA(from, reply);
  res.sendStatus(200);
});

function getReply(text) {
  for (const rule of RULES) {
    if (rule.kw.some(k => text.includes(k))) return rule.reply;
  }
  return 'Halo kak! Terima kasih sudah hubungi Jewel Beauty 💖\n\nKetik salah satu:\n*harga* - info harga\n*lokasi* - alamat kami\n*booking* - reservasi\n*promo* - promo terbaru\n*jam buka* - jam operasional\n*layanan* - daftar treatment';
}

async function sendWA(to, message) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
      { messaging_product: 'whatsapp', to, type: 'text', text: { body: message } },
      { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error kirim pesan:', err.response?.data || err.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot Jewel Beauty jalan di port ${PORT}`));
