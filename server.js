const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
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

// ---------------------- DATABASE SQLITE ----------------------
const dbPath = path.join(__dirname, 'posts.db');
const db = new sqlite3.Database(dbPath);

// Crea la tabella se non esiste
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT,
      text TEXT,
      image TEXT,
      textColor TEXT,
      bgColor TEXT,
      fontSize TEXT,
      fontStyle TEXT,
      textAlign TEXT,
      fontWeight TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// ---------------------- UPLOAD IMMAGINI ----------------------
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: uploadsDir,  // cartella già esistente
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Rendo la cartella uploads pubblica
app.use('/uploads', express.static(uploadsDir));

// ---------------------- ENDPOINTS ----------------------

// Aggiungi un nuovo post
app.post('/post', upload.single('image'), (req, res) => {
  console.log('File ricevuto:', req.file);

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

  const sql = `
    INSERT INTO posts 
    (nickname, text, image, textColor, bgColor, fontSize, fontStyle, textAlign, fontWeight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    newPost.nickname,
    newPost.text,
    newPost.image,
    newPost.textColor,
    newPost.bgColor,
    newPost.fontSize,
    newPost.fontStyle,
    newPost.textAlign,
    newPost.fontWeight
  ], function (err) {
    if (err) {
      console.error('Errore salvataggio nel DB:', err);
      return res.status(500).json({ error: 'Errore salvataggio post' });
    }

    newPost.id = this.lastID;
    res.status(201).json(newPost);
  });
});

// Recupera tutti i post
app.get('/posts', (req, res) => {
  db.all('SELECT * FROM posts ORDER BY id ASC', [], (err, rows) => {
    if (err) {
      console.error('Errore lettura dal DB:', err);
      return res.status(500).json({ error: 'Errore recupero post' });
    }
    res.json(rows);
  });
});

// ---------------------- AVVIO SERVER ----------------------
app.listen(PORT, () => console.log(`Server avviato su http://localhost:${PORT}`));
