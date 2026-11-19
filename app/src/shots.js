// Fixed scenes for screenshots and sharing: `?shot=cover` shows the poster alone
// (full viewport, no editor chrome) and `?shot=editor` shows the editor with a
// sample photo loaded. Extra params: layout (1-4), grade (sunset/neon/noir),
// photo (boulevard|pier), caption, subtitle. window.__shotReady is set once
// the poster has been painted, so a screenshot script can wait for it.
import { setSlotPhoto } from './editor.js';

export async function runShot(shot, query, hooks) {
  const layout = Math.min(4, Math.max(1, Number(query.get('layout') || '1') || 1));
  const grade = query.get('grade') || 'sunset';
  const photoName = query.get('photo') || 'pier';
  const caption = query.get('caption') || 'Sunset Heist';
  const subtitle = query.get('subtitle') || 'One last job under the neon sky';

  if (shot === 'cover') document.body.classList.add('shot-cover');

  const img = await hooks.load(`samples/${photoName}.jpg`);
  hooks.apply({ layout, grade, caption, subtitle });
  // In cover shots the same photo fills every panel, like the editor's
  // "one photo across all panels" mode; in editor shots it loads into panel 1
  // and the shared-photo mode spreads it to the rest. Layout and grade come
  // from the query so one URL fully describes the shot.
  setSlotPhoto(hooks.state, 0, img);
  hooks.redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
