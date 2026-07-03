# BN1 Drill — Health Science 1

A self-contained, offline, phone-first revision app for **BN1 Health Science 1**
(Bachelor of Nursing, year 1). Built from the course's Canvas quiz bank:
**514 questions across 3 modules** (= the 3 tests), each with a correct answer and a
short *why*.

### ▶ Use it now: **https://jeremyspm.github.io/bn1-drill/**

On your phone, open that link and use your browser's **"Add to Home Screen"** so it
launches like an app. Everything runs locally — no login, no internet needed after
first load. Your progress is saved in the browser on each device.

---

## How it works

- **Start today's drill** — a spaced-repetition queue (Leitner boxes: right answers
  come back in 1 → 3 → 7 → 16 days; wrong ones come back soon). Do this daily.
- **Learn all** — walk a topic in order with the answer shown (for first learning).
- **Test yourself** — exam mode: multiple-choice, no feedback until the end, then a
  score and a list of everything you missed.
- 🔥 day streak, light/dark theme, and keyboard shortcuts on a laptop
  (`1`–`4` pick, `Space` next, `G`/`M` = got it / missed it).

Two question styles: **multiple-choice** (tap → instant right/wrong + reason) and
**recall cards** (think → reveal → rate yourself). Most of Module 3 is recall cards
because Canvas only exported the questions, not the options.

## About the answers

Canvas exported the questions **without** the correct answers marked, so the answer
key here was authored from standard anatomy/physiology and the course framing. It's a
study aid, not gospel — trust your lecturer/textbook if they ever disagree.

**32 questions are flagged "⚠ verify with notes"** in the app: they depend on a slide
image (e.g. *"What tissue is this?"*, *"label the nephron"*) or are class-specific.
Check those against your own notes. Full list: [`src/flagged.txt`](src/flagged.txt).

## Fixing / editing an answer

The answer key lives in [`src/ans1.json`](src/ans1.json), `ans2.json`, `ans3.json`,
keyed by question code (e.g. `BLOOD-12`):

- multiple-choice: `{"a":"b","w":"why…"}` (`a` = correct letter)
- recall card: `{"r":"model answer","w":"optional why"}` — add `"c":1` to flag "verify"

Then rebuild:

```bash
node src/build.mjs
```

That re-parses the quiz bank, **validates every mapping**, and regenerates
`index.html` / `bn1-drill.html`. A plain-text dump of every question + its answer is
written to [`src/review.txt`](src/review.txt).

## Repo layout

| Path | What |
|------|------|
| `index.html` / `bn1-drill.html` | the app (one self-contained file, data inlined) |
| `bn1-questions.json` | the merged question bank as data |
| `src/ans1–3.json` | the hand-authored answer key (edit here) |
| `src/build.mjs` | parse + merge + validate + build |
| `src/source-quizzes.txt` | the raw Canvas quiz export |
| `src/review.txt`, `src/flagged.txt` | full answer dump + the 32 flagged |
| `src/serve.mjs` | tiny local static server for testing (`node src/serve.mjs`) |
