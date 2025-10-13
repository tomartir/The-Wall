const scrollContainer = document.getElementById('scroll-container');
const wall = document.getElementById('wall');
const postForm = document.getElementById('postForm');
const textField = document.getElementById('textField');
const bgColorPicker = document.getElementById('bgColorPicker');
const transparentBgCheckbox = document.getElementById('transparentBgCheckbox');
const fontSizeInput = document.getElementById('fontSize');

// Blocca digitazione e incolla
fontSizeInput.addEventListener('keydown', e => e.preventDefault());
fontSizeInput.addEventListener('paste', e => e.preventDefault());

// Modifica solo con scroll
fontSizeInput.addEventListener('wheel', (e) => {
    e.preventDefault();
    let step = e.deltaY < 0 ? 1 : -1;
    let newValue = parseInt(fontSizeInput.value) + step;
    const min = parseInt(fontSizeInput.min);
    const max = parseInt(fontSizeInput.max);
    if(newValue < min) newValue = min;
    if(newValue > max) newValue = max;
    fontSizeInput.value = newValue;

    // Aggiorna anteprima
    updatePreview();
});

// Aggiunge un post visivamente al muro
function addPostToWall(post) {
  const div = document.createElement('div');
  div.className = 'post';
  div.style.backgroundColor = (!post.bgColor || post.bgColor === 'transparent') ? 'transparent' : post.bgColor;
  div.style.color = post.textColor || '#222';
  div.style.fontSize = post.fontSize || '16px';
  div.style.fontStyle = post.fontStyle || 'normal';
  div.style.textAlign = post.textAlign || 'left';
  div.style.fontWeight = post.fontWeight === 'bold' ? 'bold' : 'normal';

  div.innerHTML = `
    ${post.text ? `<p>${post.text}</p>` : ''}
    ${post.text && post.image ? `<div style="height:10px;"></div>` : ''}
    ${post.image ? `<img src="${post.image}" />` : ''}
  `;

  wall.appendChild(div);
}

// Carica i post dal server
async function loadPosts() {
  try {
    const res = await fetch('/posts');
    if (!res.ok) throw new Error('Errore caricamento post');
    const data = await res.json();

    wall.innerHTML = '';
    data.forEach(addPostToWall);

    // Scorri automaticamente all'ultimo post
    scrollContainer.style.scrollBehavior = 'auto';
    scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    scrollContainer.style.scrollBehavior = 'smooth';

  } catch (err) {
    console.error(err);
  }
}

// Aggiorna l'anteprima del post nel form
function updatePreview() {
  const formData = new FormData(postForm);
  const imageInput = postForm.querySelector('input[name="image"]');
  const hasImage = imageInput && imageInput.files.length > 0;

  const bgColor = (transparentBgCheckbox.checked || hasImage) ? 'transparent' : formData.get('bgColor');
  const textColor = formData.get('textColor') || '#222';
  const fontStyle = formData.get('fontStyle') || 'normal';
  const fontSize = formData.get('fontSize') || '16';
  const textAlign = formData.get('textAlign') || 'left';
  const text = formData.get('text') || '';

  const fontWeight = postForm.querySelector('#fontWeightBold').checked ? 'bold' : 'normal';

  const preview = document.getElementById('preview');
  preview.style.backgroundColor = bgColor;
  preview.style.color = textColor;
  preview.style.fontSize = fontSize + 'px';
  preview.style.fontStyle = fontStyle;
  preview.style.textAlign = textAlign;
  preview.style.fontWeight = fontWeight;
  preview.textContent = text;
}

// Evento invio form
postForm.addEventListener('submit', async e => {
  e.preventDefault();

  const formData = new FormData(postForm);

  // Controlli base
  const text = formData.get('text').trim();
  const imageFile = formData.get('image');

  let bgColorValue = bgColorPicker.value;
  if (transparentBgCheckbox.checked || (imageFile && imageFile.size > 0)) {
    bgColorValue = 'transparent';
  }
  formData.set('bgColor', bgColorValue);

  const fontSizeNum = parseInt(formData.get('fontSize'), 10) || 16;
  formData.set('fontSize', fontSizeNum + 'px');

  formData.set('fontWeight', postForm.querySelector('#fontWeightBold').checked ? 'bold' : 'normal');

  if (!text && (!imageFile || imageFile.size === 0)) {
    alert("Scrivi qualcosa o carica un'immagine.");
    return;
  }

  try {
    const res = await fetch('/post', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Errore nel salvataggio del post');

    await loadPosts();
    postForm.reset();
    updatePreview();
    scrollContainer.scrollLeft = scrollContainer.scrollWidth;

  } catch (err) {
    alert(err.message);
  }
});

// Aggiorna anteprima ad ogni input
postForm.addEventListener('input', updatePreview);

// Scroll orizzontale con mouse wheel
scrollContainer.addEventListener('wheel', e => {
  if (e.deltaY !== 0) {
    e.preventDefault();
    scrollContainer.scrollLeft -= e.deltaY;
  }
}, { passive: false });

// Drag & scroll
let isDragging = false;
let startX;
let scrollStart;

scrollContainer.addEventListener('mousedown', e => {
  isDragging = true;
  startX = e.pageX - scrollContainer.offsetLeft;
  scrollStart = scrollContainer.scrollLeft;
  scrollContainer.style.cursor = 'grabbing';
});

scrollContainer.addEventListener('mouseup', () => {
  isDragging = false;
  scrollContainer.style.cursor = 'default';
});

scrollContainer.addEventListener('mouseleave', () => {
  isDragging = false;
  scrollContainer.style.cursor = 'default';
});

scrollContainer.addEventListener('mousemove', e => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - scrollContainer.offsetLeft;
  const walk = x - startX;
  scrollContainer.scrollLeft = scrollStart - walk;
});

// Toggle form col click destro, eccetto quando si è dentro il textarea
document.addEventListener('contextmenu', e => {
  if (e.target !== textField) {
    e.preventDefault();
    postForm.style.display = postForm.style.display === 'none' ? 'flex' : 'none';
  }
});

// Colore cielo secondo ora del giorno
function updateSkyColorByHour() {
  const sky = document.getElementById('sky');
  const hour = new Date().getHours();
  let color = '#aee1f9'; // mattina

  if (hour >= 6 && hour < 12) color = '#aee1f9';
  else if (hour >= 12 && hour < 18) color = '#72b8f0';
  else if (hour >= 18 && hour < 20) color = '#f4a261';
  else color = '#1b2a49';

  sky.style.background = color;
}

updateSkyColorByHour();
setInterval(updateSkyColorByHour, 600000);

loadPosts();
updatePreview();
