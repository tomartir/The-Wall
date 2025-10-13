# 🧱 The Wall - Setup Completo

Questo progetto è un social orizzontale chiamato **The Wall**, dove gli utenti possono postare testo e immagini.  
I post vengono salvati su **MongoDB Atlas** e le immagini su **Cloudinary**, mentre il backend gira su **Render**.  
Il codice è gestito tramite **GitHub**.

---

## 🚀 Architettura
- **Frontend** → HTML/JS che mostra il muro e invia post.  
- **Backend** → Node.js + Express su Render.  
- **Database** → MongoDB Atlas (`thewall.posts`).  
- **Storage immagini** → Cloudinary (cartella `thewall`).  

---

## ⚙️ Passaggi seguiti

### 1. GitHub
- Creato repository con codice (frontend + `server.js`).
- Collegato a Render per il deploy automatico.

### 2. Render
- Nuovo servizio web collegato al repo GitHub.
- Aggiunte variabili di ambiente:
  - `MONGO_URI` → connection string MongoDB Atlas
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### 3. MongoDB Atlas
- Creato database `thewall` e collection `posts`.
- Copiata la connection string con utente/password.

### 4. Cloudinary
- Creato account gratuito.
- Recuperate credenziali (Cloud name, API key, API secret).
- Salvate in Render come variabili d’ambiente.
- Le immagini vengono caricate nella cartella `thewall`.

---

## 🔑 Endpoint API

- `POST /post` → aggiunge un post con testo + immagine (upload su Cloudinary, salvataggio in MongoDB).  
- `GET /posts` → restituisce tutti i post ordinati per data.  

---

## ✅ Vantaggi
- I post restano salvati in cloud (MongoDB).
- Le immagini sono permanenti su Cloudinary.
- Nessun file locale da gestire (`uploads/` e `posts.json` eliminati).
- Deploy e aggiornamenti automatici via GitHub + Render.

---


render -> dashboard-> google
https://the-wall-po4r.onrender.com/ link sito
https://github.com/tomartir/The-Wall
https://dashboard.render.com/

