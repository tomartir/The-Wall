const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
//const Filter = require('bad-words');
//const filter = new Filter();
//filter.addWords('cazzo', 'merda', 'vaffanculo', 'puttana', 'troia', 'stronzo', 'bastardo'); // parole italiane

const app = express();
const PORT = process.env.PORT || 3000;

// Serve la cartella frontend (modifica se il percorso non è ../frontend)
app.use(express.static(__dirname));

// Middleware per JSON e CORS
app.use(cors());
app.use(express.json());

// File JSON dove salvare i post
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Carico i post esistenti all’avvio
let posts = [];
try {
  const data = fs.readFileSync(POSTS_FILE, 'utf-8');
  posts = JSON.parse(data);
} catch {
  posts = [];
}

// Cartella uploads: creo solo se non esiste
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configurazione Multer
const storage = multer.diskStorage({
  destination: uploadsDir,  // cartella già esistente
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Rendo la cartella uploads pubblica
app.use('/uploads', express.static(uploadsDir));

// Endpoint per aggiungere un post
app.post('/post', upload.single('image'), (req, res) => {
  console.log('File ricevuto:', req.file); // utile per debug su Render

  // Filtro anti-volgarità sul testo (disabilitato per ora)
  //if (filter.isProfane(req.body.text)) {
  //  return res.status(400).json({ error: 'Il testo contiene linguaggio offensivo.' });
  //}

  const newPost = {
    nickname: req.body.nickname || null,
    text: req.body.text || null,
    image: req.file ? path.posix.join('/uploads', req.file.filename) : null,
    textColor: req.body.textColor || '#222',
    bgColor: typeof req.body.bgColor !== 'undefined' ? req.body.bgColor : "#ffffff",
    fontSize: req.body.fontSize || '1em',
    fontStyle: req.body.fontStyle || 'normal',
    textAlign: req.body.textAlign || 'left',
    fontWeight: req.body.fontWeight || 'normal'
  };

  posts.push(newPost);

  fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), err => {
    if (err) {
      console.error('Errore scrittura file posts:', err);
      return res.status(500).json({ error: 'Errore salvataggio post' });
    }
    res.status(201).json(newPost);
  });
});

// Endpoint per ottenere tutti i post
app.get('/posts', (req, res) => {
  res.json(posts);
});

// Avvio server
app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
