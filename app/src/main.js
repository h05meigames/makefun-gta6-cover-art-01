// Wires the studio page: layout + grade buttons, caption fields, per-panel photo
// slots, drag-to-pan on the preview, and PNG export at the chosen size.
// A `?shot=` query hands control to ./shots.js for a fixed screenshot scene.
import { createState, draw, buildSlotControls, setSlotPhoto, renderExport, panelAt, loadImage } from './editor.js';
import { runShot } from './shots.js';

const state = createState();
const canvas = document.getElementById('stage');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const status = document.getElementById('status');
const slotsHost = document.getElementById('photoSlots');
const samePhotoBox = document.getElementById('samePhoto');

function redraw() {
  draw(state, canvas);
}

function refreshSlots() {
  buildSlotControls(slotsHost, state, (i, img) => {
    setSlotPhoto(state, i, img);
    redraw();
    refreshSlots();
  }, redraw);
}

function markActive(rowId, value) {
  document.querySelectorAll(`#${rowId} button`).forEach((btn) => {
    btn.classList.toggle('active', btn.dataset[rowId === 'layoutRow' ? 'layout' : 'grade'] === value);
  });
}

document.getElementById('layoutRow').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-layout]');
  if (!btn) return;
  state.layout = Number(btn.dataset.layout);
  state.activeSlot = 0;
  markActive('layoutRow', btn.dataset.layout);
  refreshSlots();
  redraw();
});

document.getElementById('gradeRow').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-grade]');
  if (!btn) return;
  state.grade = btn.dataset.grade;
  markActive('gradeRow', btn.dataset.grade);
  redraw();
});

titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });

samePhotoBox.addEventListener('change', () => {
  state.samePhoto = samePhotoBox.checked;
  if (state.samePhoto) {
    const first = state.slots.find((s) => s.img);
    if (first) state.slots.forEach((slot) => { slot.img = first.img; });
  }
  redraw();
});

// Drag on the preview pans the photo in the panel under the pointer. Pan is
// clamped so the photo can never be dragged clean out of its panel.
let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(state, canvas, e.clientX, e.clientY);
  if (i < 0) return;
  state.activeSlot = i;
  drag = { slot: i, x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  refreshSlots();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const rect = canvas.getBoundingClientRect();
  const slot = state.slots[drag.slot];
  slot.dx = Math.max(-1, Math.min(1, slot.dx + (e.clientX - drag.x) / rect.width));
  slot.dy = Math.max(-1, Math.min(1, slot.dy + (e.clientY - drag.y) / rect.height));
  drag.x = e.clientX;
  drag.y = e.clientY;
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

document.getElementById('exportBtn').addEventListener('click', () => {
  const size = document.getElementById('exportSize').value;
  const out = renderExport(state, size);
  out.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Export failed — try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-city-cover-${size}.png`;
    a.click();
    status.textContent = `Saved vice-city-cover-${size}.png`;
  }, 'image/png');
});

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  runShot(shot, params, {
    state,
    load: loadImage,
    apply: ({ layout, grade, caption, subtitle }) => {
      state.layout = layout;
      state.grade = grade;
      state.title = caption;
      state.subtitle = subtitle;
      titleInput.value = caption;
      subtitleInput.value = subtitle;
      markActive('layoutRow', String(layout));
      markActive('gradeRow', grade);
      refreshSlots();
    },
    redraw,
  });
} else {
  refreshSlots();
  redraw();
}
