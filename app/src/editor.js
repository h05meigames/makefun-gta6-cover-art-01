// Editor state: layout, grade, caption and one photo slot per panel. Slots keep
// their own crop (zoom, pan offsets, fit/fill) so each panel can be framed alone.
import { renderCover, panelRects } from './panels.js';

export function blankSlot() {
  return { img: null, zoom: 1, dx: 0, dy: 0, mode: 'fill' };
}

export function createState() {
  return {
    layout: 1,
    grade: 'sunset',
    title: 'Sunset Heist',
    subtitle: 'One last job under the neon sky',
    samePhoto: true,
    slots: [blankSlot(), blankSlot(), blankSlot(), blankSlot()],
    activeSlot: 0,
  };
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('could not load image'));
    img.src = url;
  });
}

export function loadImageFile(file) {
  return loadImage(URL.createObjectURL(file));
}

// Put `img` into a slot; with "one photo across all panels" it goes everywhere.
export function setSlotPhoto(state, index, img) {
  if (state.samePhoto) {
    state.slots.forEach((slot) => { slot.img = img; });
  } else {
    state.slots[index].img = img;
  }
}

export function draw(state, canvas) {
  renderCover(canvas, state);
}

// Render the same poster at export size onto a fresh canvas and return it.
export function renderExport(state, sizeLabel) {
  const [w, h] = sizeLabel.split('x').map(Number);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  renderCover(canvas, state);
  return canvas;
}

// Which panel (if any) sits under a point on the displayed canvas. Returns -1
// when the pointer is outside every panel (over the gutter, for example).
export function panelAt(state, canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
  const rects = panelRects(state.layout, canvas.width, canvas.height);
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

// Build the per-panel photo controls (file input + zoom + fit/fill) into `host`.
export function buildSlotControls(host, state, onPhoto, onChange) {
  host.innerHTML = '';
  const count = state.layout;
  for (let i = 0; i < count; i++) {
    const slot = state.slots[i];
    const box = document.createElement('div');
    box.className = 'slot' + (state.activeSlot === i ? ' active' : '');
    box.dataset.slot = String(i);

    const heading = document.createElement('h3');
    heading.textContent = `Panel ${i + 1}`;
    box.appendChild(heading);

    const fileLabel = document.createElement('label');
    fileLabel.textContent = 'Photo ';
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = 'image/*';
    file.addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const img = await loadImageFile(f);
      onPhoto(i, img);
    });
    fileLabel.appendChild(file);
    box.appendChild(fileLabel);

    const zoomRow = document.createElement('div');
    zoomRow.className = 'zoom-row';
    const zoomLabel = document.createElement('span');
    zoomLabel.textContent = 'Zoom';
    const zoom = document.createElement('input');
    zoom.type = 'range';
    zoom.min = '1';
    zoom.max = '3';
    zoom.step = '0.05';
    zoom.value = String(slot.zoom);
    zoom.setAttribute('aria-label', `Zoom panel ${i + 1}`);
    zoom.addEventListener('input', () => {
      slot.zoom = Number(zoom.value);
      onChange();
    });
    const zoomVal = document.createElement('span');
    zoomVal.textContent = `${slot.zoom.toFixed(2)}×`;
    zoom.addEventListener('input', () => { zoomVal.textContent = `${slot.zoom.toFixed(2)}×`; });
    zoomRow.append(zoomLabel, zoom, zoomVal);
    box.appendChild(zoomRow);

    const modeRow = document.createElement('div');
    modeRow.className = 'mode-row';
    for (const mode of ['fill', 'fit']) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = mode === 'fill' ? 'Fill' : 'Fit';
      if (slot.mode === mode) btn.classList.add('active');
      btn.addEventListener('click', () => {
        slot.mode = mode;
        onChange();
        buildSlotControls(host, state, onPhoto, onChange);
      });
      modeRow.appendChild(btn);
    }
    box.appendChild(modeRow);

    box.addEventListener('click', () => {
      state.activeSlot = i;
      host.querySelectorAll('.slot').forEach((el) => el.classList.remove('active'));
      box.classList.add('active');
    });
    host.appendChild(box);
  }
}
