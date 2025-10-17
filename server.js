const express = require('express');
const path = require('path'); 
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve la cartella frontend (modifica il percorso se necessario)
app.use(express.static(path.join(__dirname)));

app.use(cors());
app.use(express.json());

// ---------------------- FIREBASE ----------------------
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// ---------------------- UPLOAD IMMAGINI ----------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------------- ENDPOINTS ----------------------

// Aggiungi un nuovo post
app.post('/post', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;

    // Se c'è un'immagine, caricala su Firebase Storage
    if (req.file) {
      const fileName = `${Date.now()}-${uuidv4()}-${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
        public: true
      });

      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    const newPost = {
      nickname: req.body.nickname || null,
      text: req.body.text || null,
      image: imageUrl,
      textColor: req.body.textColor || '#222',
      bgColor: typeof req.body.bgColor !== 'undefined' ? req.body.bgColor : "#ffffff",
      fontSize: req.body.fontSize || '1em',
      fontStyle: req.body.fontStyle || 'normal',
      textAlign: req.body.textAlign || 'left',
      fontWeight: req.body.fontWeight || 'normal',
      timestamp: Date.now()
    };

    // Salva il post su Firestore
    const docRef = await db.collection('posts').add(newPost);
    res.status(201).json({ id: docRef.id, ...newPost });

  } catch (err) {
    console.error('Errore salvataggio post:', err);
    res.status(500).json({ error: 'Errore salvataggio post' });
  }
});

// Recupera tutti i post
app.get('/posts', async (req, res) => {
  try {
    const snapshot = await db.collection('posts').orderBy('timestamp', 'asc').get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(posts);
  } catch (err) {
    console.error('Errore lettura post:', err);
    res.status(500).json({ error: 'Errore lettura post' });
  }
});

// ---------------------- AVVIO SERVER ----------------------
app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));





