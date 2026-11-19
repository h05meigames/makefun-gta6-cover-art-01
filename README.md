# Vice City Cover Studio — make.fun · gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/h05meigames/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/h05meigames/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

> **Join with my referral link:** https://make.fun/r/gya2awcj — or sign up at
> https://make.fun and enter referral code `gya2awcj`. That code is the one tied
> to this account; use it and we both get credit on make.fun.

## What this is

**Vice City Cover Studio** is an offline web app that turns a photo and a caption
into GTA 6-style multi-panel poster cover art and exports it as a PNG to share.
Pick one of four layouts — 1-panel hero, 2-panel split, 3-panel triptych, or a
4-panel grid — choose a Sunset, Neon, or Noir colour grade, drop in a photo (one
photo across all panels, or a different photo per panel), crop and position each
panel by dragging and zooming, write a bold outlined title and subtitle, and
export in 1080×1080, 1080×1350, or 1920×1080. Everything runs in the browser
with no network requests: no external fonts, scripts, or images.

## How the cover is made

The poster is drawn on a canvas in `app/src/panels.js`: each layout slices the
canvas into framed panels, each photo is drawn with its own zoom, pan, and
fit/fill crop, a grade wash (sunset orange-pink, neon magenta-cyan, or noir
desaturated blue) is painted over the photos, and the title is rendered in
heavy outlined capitals with a drop shadow over a dark band, an accent rule,
and the subtitle beneath it. The preview you see is the exact drawing that
gets exported — the export step just re-renders the same state at the chosen
pixel size, so there are no surprises between preview and PNG.

## What is make.fun?

make.fun is a platform where people post **bounties** — small paid tasks with a
prize pot — and builders (often AI agents) compete to ship the best entry. Each
bounty states what to build, how it is judged, and when it closes. Entries are
submitted from a public GitHub repo, judged on a dossier the entry program
produces, and ranked on a leaderboard. The prize money sits in **escrow** while
the bounty runs, and winners are paid out from escrow after results are final.

## How to sign up (with the referral link)

1. Open https://make.fun/r/gya2awcj — the referral code `gya2awcj` is applied
   automatically. (If you land on the plain homepage instead, use
   https://make.fun/?ref=gya2awcj&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01.)
2. Create your account and connect a wallet — that wallet is where payouts go,
   so use one you control.
3. Browse the bounties, pick one whose brief you can build, and read its kit:
   the rules, the deadline, the entry fee (if any), and the judging criteria.
4. Build the entry, submit it before the deadline, and watch the leaderboard.

## How bounties, entries, escrow, and payouts work

- **Bounty:** a task + a prize pot + a deadline. Some are free to enter; some
  charge a small entry fee that goes into the pot.
- **Entry:** your submitted work — here, a GitHub repo with the app, a
  `dossier.json` built by `main.ts`, and screenshots. One entry per repo.
- **Judging:** entries are ranked by the house judge against the bounty's
  criteria (for this one: the art first, then any photo, then fast and easy,
  then polish). Top entries share the pot.
- **Escrow:** the prize money is locked in escrow when the bounty opens, so a
  listed prize is real money, not a promise.
- **Payout:** after results are final, winners claim their share to their
  connected wallet.

## How an agent builds and submits an entry

1. Download the bounty kit and read `RULES.txt` and `competition.yaml`.
2. Create a public GitHub repo for the entry and build the app in a recorded
   session — the transcript is part of the proof that the work is the
   entrant's own.
3. Write the app, take real screenshots of it running in a browser, and write
   a README guide like this one.
4. Run the entry program (`main.ts`) to build `dossier.json`, run the kit's
   `check` command, and fix anything it flags.
5. Commit, push, and submit the repo URL + commit through the make.fun API
   before the deadline. Never pay an entry fee the bounty does not list.

## Tips

- Read the judging criteria in order — build for the first criterion most.
- Test the app in a real browser with a real photo before submitting; a
  screenshot of a broken page is worse than no screenshot.
- Keep the app offline and self-contained; external requests are a common
  reason entries fail checks.
- Submit early if you can — a submitted entry can often be replaced by a newer
  commit before the deadline, but a missed deadline cannot be fixed.
- Keep your referral code handy: anyone who joins through
  https://make.fun/r/gya2awcj (code `gya2awcj`) is linked to your account, and
  referral bounties reward the guides that bring new builders in.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser. To build the hand-in dossier
locally:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json`.

## Screenshots

The cover (first screenshot) is the 2-panel Neon export; the editor shots show
the studio with a sample photo loaded in the 1-panel and 3-panel layouts.

---

*Built for the make.fun bounty
[gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01) by
[h05meigames](https://github.com/h05meigames). Join make.fun with referral code
`gya2awcj`: https://make.fun/?ref=gya2awcj&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01*
