const scrollContainer = document.getElementById('scroll-container');
const wall = document.getElementById('wall');
const postForm = document.getElementById('postForm');
const textField = document.getElementById('textField');
const bgColorPicker = document.getElementById('bgColorPicker');
const transparentBgCheckbox = document.getElementById('transparentBgCheckbox');

function addPostToWall(post) {
  const div = document.createElement('div');
  div.className = 'post';
  div.style.backgroundColor = (!post.bgColor || post.bgColor === 'transparent') ? 'transparent' : post.bgColor;
  div.style.color = post.textColor;
  div.style.fontSize = post.fontSize;
  div.style.fontStyle = post.fontStyle;
  div.style.textAlign = post.textAlign || 'left';
  div.style.fontWeight = post.fontWeight === 'bold' ? 'bold' : 'normal';
  div.innerHTML = `
    ${post.text ? `<p>${post.text}</p>` : ''}
    ${post.text && post.image ? `<div style="height:10px;"></div>` : ''}
    ${post.image ? `<img src="${post.image}" />` : ''}
  `;
  wall.appendChild(div);
}

postForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(postForm);
  const text = formData.get('text').trim();
  const imageFile = formData.get('image');

  // Mantieni il valore di bgColor aggiornato
  let bgColorValue = bgColorPicker.value;
  if (transparentBgCheckbox.checked || (imageFile && imageFile.size > 0)) {
    bgColorValue = "transparent";
  }
  formData.set('bgColor', bgColorValue);

  const fontSizeNum = parseInt(formData.get('fontSize'), 10) || 16;
  formData.set('fontSize', fontSizeNum + 'px');

  const textAlign = formData.get('textAlign') || 'left';
  formData.set('textAlign', textAlign);

  // Gestione fontWeight bold
  const fontWeight = postForm.querySelector('#fontWeightBold').checked ? 'bold' : 'normal';
  formData.set('fontWeight', fontWeight);

  if (!text && (!imageFile || imageFile.size === 0)) {
    alert("Scrivi qualcosa o carica un'immagine.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/post', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Errore nel salvataggio del post');

    await loadPosts();
    postForm.reset();
    bgColorPicker.disabled = false;
    updatePreview();
    scrollContainer.scrollLeft = scrollContainer.scrollWidth;
  } catch (err) {
    alert(err.message);
  }
});

function updatePreview() {
  const formData = new FormData(postForm);
  const imageInput = postForm.querySelector('input[name="image"]');
  const hasImage = imageInput && imageInput.files.length > 0;

  const bgColor = (transparentBgCheckbox.checked || hasImage) ? 'transparent' : formData.get('bgColor');
  const textColor = formData.get('textColor');
  const fontStyle = formData.get('fontStyle');
  const fontSize = parseInt(formData.get('fontSize'), 10) || 16;
  const textAlign = formData.get('textAlign') || 'left';
  const text = formData.get('text');

  // Recupera fontWeight dal checkbox
  const fontWeight = postForm.querySelector('#fontWeightBold').checked ? 'bold' : 'normal';

  const preview = document.getElementById('preview');
  preview.style.backgroundColor = bgColor;
  preview.style.color = textColor;
  preview.style.fontSize = fontSize + 'px';
  preview.style.fontStyle = fontStyle;
  preview.style.textAlign = textAlign;
  preview.style.fontWeight = fontWeight;
  preview.innerText = text;
}

postForm.addEventListener('input', updatePreview);

scrollContainer.addEventListener('scroll', () => {
  scrollContainer.style.backgroundPositionX = `-${scrollContainer.scrollLeft}px`;
});

scrollContainer.addEventListener('wheel', (e) => {
  if (e.deltaY !== 0) {
    e.preventDefault();
    scrollContainer.scrollLeft -= e.deltaY;
  }
}, { passive: false });

let isDragging = false;
let startX;
let scrollStart;

scrollContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.pageX - scrollContainer.offsetLeft;
  scrollStart = scrollContainer.scrollLeft;
  scrollContainer.style.cursor = 'grabbing';
});

scrollContainer.addEventListener('mouseleave', () => {
  isDragging = false;
  scrollContainer.style.cursor = 'default';
});

scrollContainer.addEventListener('mouseup', () => {
  isDragging = false;
  scrollContainer.style.cursor = 'default';
});

scrollContainer.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - scrollContainer.offsetLeft;
  const walk = (x - startX);
  scrollContainer.scrollLeft = scrollStart - walk;
});

document.addEventListener('contextmenu', function (e) {
  if (e.target !== textField) {
    e.preventDefault();
    postForm.style.display = postForm.style.display === 'none' ? 'flex' : 'none';
  }
});

function updateSkyColorByHour() {
  const sky = document.getElementById('sky');
  const hour = new Date().getHours();
  let color = '#aee1f9';
  if (hour >= 6 && hour < 12) color = '#aee1f9';
  else if (hour >= 12 && hour < 18) color = '#72b8f0';
  else if (hour >= 18 && hour < 20) color = '#f4a261';
  else color = '#1b2a49';
  sky.style.background = color;
}

async function loadPosts() {
  try {
    const res = await fetch('http://localhost:3000/posts');
    const data = await res.json();
    wall.innerHTML = '';
    data.forEach(addPostToWall);
    scrollContainer.style.scrollBehavior = 'auto';
    scrollContainer.scrollLeft = scrollContainer.scrollWidth;
    scrollContainer.style.scrollBehavior = 'smooth';
  } catch (e) {
    console.error('Errore caricamento post:', e);
  }
}

loadPosts();
updateSkyColorByHour();
setInterval(updateSkyColorByHour, 600000);
