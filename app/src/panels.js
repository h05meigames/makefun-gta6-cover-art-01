// Renders the poster: panel geometry, colour grades, photo placement and the
// big outlined caption. Pure canvas 2D, no assets beyond the photos given in.

// Colour grades: each one tints the photos and paints the sky band behind the
// caption, so the same photo reads as a different poster in each grade.
export const GRADES = {
  sunset: {
    wash: ['rgba(255, 122, 26, 0.28)', 'rgba(255, 45, 120, 0.42)'],
    band: ['rgba(20, 6, 32, 0)', 'rgba(20, 6, 32, 0.88)'],
    accent: '#ffb347', outline: '#1c0a2e', filter: 'saturate(1.25) contrast(1.05)',
  },
  neon: {
    wash: ['rgba(255, 0, 128, 0.30)', 'rgba(0, 229, 255, 0.30)'],
    band: ['rgba(8, 2, 24, 0)', 'rgba(8, 2, 24, 0.9)'],
    accent: '#37e0d8', outline: '#12041f', filter: 'saturate(1.5) contrast(1.12)',
  },
  noir: {
    wash: ['rgba(10, 16, 40, 0.35)', 'rgba(0, 0, 0, 0.45)'],
    band: ['rgba(5, 5, 12, 0)', 'rgba(5, 5, 12, 0.92)'],
    accent: '#e8e4ee', outline: '#05050c', filter: 'saturate(0.55) contrast(1.15) brightness(0.92)',
  },
};

// Panel rectangles for each layout, as fractions of the canvas. A thin gutter
// keeps the poster look; the caption band sits over the bottom of the panels.
export function panelRects(layout, w, h) {
  const g = Math.round(Math.min(w, h) * 0.012); // gutter
  const full = { x: 0, y: 0, w, h };
  if (layout === 2) {
    const half = (w - g) / 2;
    return [
      { x: 0, y: 0, w: half, h },
      { x: half + g, y: 0, w: half, h },
    ];
  }
  if (layout === 3) {
    const third = (w - 2 * g) / 3;
    return [
      { x: 0, y: 0, w: third, h },
      { x: third + g, y: 0, w: third, h },
      { x: 2 * (third + g), y: 0, w: third, h },
    ];
  }
  if (layout === 4) {
    const halfW = (w - g) / 2;
    const halfH = (h - g) / 2;
    return [
      { x: 0, y: 0, w: halfW, h: halfH },
      { x: halfW + g, y: 0, w: halfW, h: halfH },
      { x: 0, y: halfH + g, w: halfW, h: halfH },
      { x: halfW + g, y: halfH + g, w: halfW, h: halfH },
    ];
  }
  return [full];
}

// Draw one photo inside a panel rect, honouring its pan/zoom/fit settings.
// `slot` is { img, zoom, dx, dy, mode } where dx/dy are fractions of the rect.
function drawPhotoInto(ctx, rect, slot) {
  const img = slot && slot.img;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (!img) {
    // Empty panel: a painted gradient placeholder, never a broken image icon.
    const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    grad.addColorStop(0, '#3a1c5e');
    grad.addColorStop(1, '#120a1a');
    ctx.fillStyle = grad;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    return;
  }
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const zoom = slot.zoom || 1;
  let scale;
  if (slot.mode === 'fit') {
    scale = Math.min(rect.w / iw, rect.h / ih) * zoom;
  } else {
    scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  }
  const pw = iw * scale;
  const ph = ih * scale;
  const cx = rect.x + rect.w / 2 + (slot.dx || 0) * rect.w;
  const cy = rect.y + rect.h / 2 + (slot.dy || 0) * rect.h;
  ctx.drawImage(img, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.restore();
}

// Bold title with a thick outline and a drop shadow, sized to fit the width.
function drawCaption(ctx, w, h, title, subtitle, grade) {
  const text = (title || '').trim().toUpperCase();
  if (!text) return;
  const bandTop = h * 0.72;
  const band = ctx.createLinearGradient(0, bandTop, 0, h);
  band.addColorStop(0, grade.band[0]);
  band.addColorStop(1, grade.band[1]);
  ctx.fillStyle = band;
  ctx.fillRect(0, bandTop, w, h - bandTop);

  let size = h * 0.115;
  const setFont = (s) => { ctx.font = `900 ${s}px "Arial Black", Arial, sans-serif`; };
  setFont(size);
  while (ctx.measureText(text).width > w * 0.92 && size > 14) {
    size -= 2;
    setFont(size);
  }
  const baseline = h - h * 0.10;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = size * 0.22;
  ctx.shadowOffsetY = size * 0.06;
  ctx.lineWidth = Math.max(3, size * 0.14);
  ctx.strokeStyle = grade.outline;
  ctx.strokeText(text, w / 2, baseline);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, w / 2, baseline);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Accent rule under the title, then the subtitle in letterspaced caps.
  const ruleW = Math.min(w * 0.42, ctx.measureText(text).width * 0.8);
  ctx.fillStyle = grade.accent;
  ctx.fillRect((w - ruleW) / 2, baseline + h * 0.018, ruleW, Math.max(3, h * 0.006));

  const sub = (subtitle || '').trim();
  if (sub) {
    const subSize = Math.max(12, h * 0.028);
    ctx.font = `600 ${subSize}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillText(sub.toUpperCase(), w / 2, baseline + h * 0.062);
  }
}

// The whole poster. `state` is { layout, grade, title, subtitle, slots[] } and
// each slot carries its own photo + crop. Deterministic: same state, same pixels.
export function renderCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  const rects = panelRects(state.layout, w, h);

  ctx.save();
  ctx.fillStyle = '#120a1a';
  ctx.fillRect(0, 0, w, h);
  rects.forEach((rect, i) => {
    const slot = state.slots[i] || {};
    ctx.save();
    ctx.filter = grade.filter;
    drawPhotoInto(ctx, rect, slot);
    ctx.restore();
    // Grade wash over the photo, kept inside the panel.
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
    wash.addColorStop(0, grade.wash[0]);
    wash.addColorStop(1, grade.wash[1]);
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    // Thin frame around each panel, plus a soft inner shadow so panels read as
    // separate poster tiles rather than one flat image.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(2, w * 0.003);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });
  drawCaption(ctx, w, h, state.title, state.subtitle, grade);
  ctx.restore();
}
