// Vice City Cover Studio — the hand-in program for gta6-cover-art-01.
//
// The entry itself is the static web app in app/ (plain HTML, CSS and ES
// modules, no libraries and no network requests: it runs fully offline in a
// desktop browser). This file is only the packaging step: it copies app/ and
// screenshots/ from beside this file into the output directory and writes
// output/dossier.json, the summary the house judge reads, using the vendored
// make.fun library in vendor/makefun-app.ts.
//
// Run it locally with `node serve.ts` first to try the app at
// http://localhost:8080, then hand it in with:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// (outside the grader's container MAKEFUN_OUTPUT_DIR stands in for /output).

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The repo root, next to this file, and the output directory to fill. The
// output directory defaults to /output inside the grader's container.
const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the whole app, then the screenshots, into the output directory.
mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The judge's caps: text_max_bytes shapes the dossier bytes; the rest refuse
// an entry the scorer would refuse — more than 4 screenshots or one over
// 256 KiB, more than 993 files or 48 MiB under app/, or an app path over
// 1000 bytes long.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
