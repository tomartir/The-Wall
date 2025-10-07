const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Multer per upload temporanei
const upload = multer({ dest: 'temp_uploads/' });

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connessione a MongoDB
const client = new MongoClient(process.env.MONGO_URI);
let postsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db('thewall');   // nome DB
  postsCollection = db.collection('posts');
  console.log("✅ Connesso a MongoDB Atlas");
}
connectDB().catch(console.error);

// Endpoint per aggiungere un post
app.post('/post', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      // Upload immagine su Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "thewall"
      });
      imageUrl = result.secure_url;

      // Elimina file temporaneo
      fs.unlinkSync(req.file.path);
    }

    const newPost = {
      nickname: req.body.nickname || null,
      text: req.body.text || null,
      image: imageUrl,
      textColor: req.body.textColor || '#222',
      bgColor: req.body.bgColor || 'transparent',
      fontSize: req.body.fontSize || '16px',
      fontStyle: req.body.fontStyle || 'normal',
      textAlign: req.body.textAlign || 'left',
      fontWeight: req.body.fontWeight || 'normal',
      createdAt: new Date()
    };

    await postsCollection.insertOne(newPost);
    res.status(201).json(newPost);

  } catch (err) {
    console.error("❌ Errore nel salvataggio del post:", err);
    res.status(500).json({ error: 'Errore nel salvataggio del post' });
  }
});

// Endpoint per ottenere tutti i post
app.get('/posts', async (req, res) => {
  try {
    const allPosts = await postsCollection.find({}).sort({ createdAt: 1 }).toArray();
    res.json(allPosts);
  } catch (err) {
    console.error("❌ Errore nel caricamento post:", err);
    res.status(500).json({ error: 'Errore nel caricamento dei post' });
  }
});

// Avvio server
app.listen(PORT, () => {
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
});
