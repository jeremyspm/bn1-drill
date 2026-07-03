BN1 DRILL — Health Science 1 revision tool
==========================================

WHAT THIS IS
------------
A self-contained drill app built from your Canvas quiz bank: 514 questions across
the 3 course modules (= your 3 tests), each with a correct answer and a short "why".
No login, no internet, no accounts. It remembers your progress on whatever device
you open it on.

  bn1-drill.html      <- THE APP. One file. Open it and go.
  bn1-questions.json  <- the answer key as data (edit here if you spot a wrong answer)
  src/                <- how it's built (see "Fixing an answer" below)
  README.txt          <- this file


HOW TO OPEN IT
--------------
On a laptop:   double-click  bn1-drill.html  (opens in your browser). Done.

On your phone (pick one):
  1. EASIEST — put it online. Because it's a single static file you can drag
     bn1-drill.html onto any static host (Netlify Drop, GitHub Pages, or your
     existing Vercel) and open the URL on your phone. Progress saves in that
     browser. (Ask me and I can deploy it for you.)
  2. Email / AirDrop / Google-Drive the file to yourself, then open it in a
     browser. (Android + Chrome handles local files fine. iPhone/Safari is fussy
     about opening local HTML — option 1 is smoother on iOS.)

Tip: once open in a phone browser, use "Add to Home Screen" so it opens like an app.


HOW TO USE IT
-------------
- START TODAY'S DRILL (home screen): a mixed queue of everything that's "due".
  This is the main thing — do it every day of the break. Uses spaced repetition:
  get one right and it comes back later (1 -> 3 -> 7 -> 16 days); get it wrong and
  it comes back soon. Little and often beats one big cram.
- Tap a MODULE to drill/learn just that test, or one topic at a time.
- LEARN ALL = walk a topic in order, answer shown each time (for first learning).
- TEST YOURSELF = exam mode: multiple-choice, no feedback until the end, then a
  score + a list of everything you missed.
- The 🔥 number is your day streak. Theme toggle (🌙/☀️) top-right.
- Keyboard (laptop): 1-4 pick an answer, Space = next, G = "got it", M = "missed it".

Two question styles:
- Multiple choice  -> tap an option, instant right/wrong + the reason.
- Recall cards     -> think, tap "Show answer", then rate yourself honestly.
  (Most of Module 3 is recall cards, because Canvas only gave the questions,
  not the options.)


ABOUT THE ANSWERS  (important)
------------------------------
Canvas exported the questions WITHOUT marking the correct answers, so I wrote the
answer key myself from standard anatomy/physiology and your course framing. It's
solid, but it's a study aid, not gospel — always trust your lecturer/textbook over
this if they ever disagree.

32 questions are flagged  "⚠ verify with notes"  in the app. These are the ones
that depend on a picture/diagram from your slides (e.g. "What tissue is this?",
"label the nephron") or are class-specific — I can't see the image, so check those
against your own notes. (Full list: src/flagged.txt.)


FIXING AN ANSWER
----------------
If you find a wrong answer:
  - Quick: tell me which question and I'll correct it.
  - Yourself: open src/ans1.json / ans2.json / ans3.json, find the question code
    (e.g. "BLOOD-12"), fix the letter ("a") or the recall text ("r") / why ("w"),
    then run:   node src/build.mjs
    That re-checks everything and rebuilds bn1-drill.html.
  A full human-readable list of every question + its answer is in src/review.txt.
