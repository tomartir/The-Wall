// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { v2: cloudinary } = require('cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB Atlas
const client = new MongoClient(process.env.MONGO_URI);
let postsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db('thewall');
  postsCollection = db.collection('posts');
  console.log('Connesso a MongoDB Atlas');
}
connectDB().catch(console.error);

// Multer in memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /post
app.post('/post', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'thewall' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const post = {
      text: req.body.text || null,
      image: imageUrl,
      textColor: req.body.textColor || '#222',
      bgColor: req.body.bgColor || 'transparent',
      fontSize: req.body.fontSize || '1em',
      fontStyle: req.body.fontStyle || 'normal',
      textAlign: req.body.textAlign || 'left',
      fontWeight: req.body.fontWeight || 'normal',
      createdAt: new Date()
    };

    await postsCollection.insertOne(post);
    res.status(201).json(post);
  } catch (err) {
    console.error('Errore POST:', err);
    res.status(500).json({ error: 'Errore salvataggio post' });
  }
});

// GET /posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await postsCollection.find({}).sort({ createdAt: 1 }).toArray();
    res.json(posts);
  } catch (err) {
    console.error('Errore GET /posts:', err);
    res.status(500).json({ error: 'Errore caricamento post' });
  }
});

app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
