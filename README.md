# cslingo

**Computer science, one bite at a time.** Duolingo-style lessons, live demos and boss quizzes for three university CS modules. Free, runs in your browser, no sign-up.

**[▶ Play it](https://duc-minh-droid.github.io/cslingo/)** · **[Watch the trailer](https://duc-minh-droid.github.io/cslingo/trailer/)** · [trailer video (webm)](trailer/cslingo-trailer.webm)

![CSLingo trailer](trailer/cslingo-trailer.gif)

## What's inside

| Course | Mascot | Lessons |
|---|---|---|
| Nature-Inspired Computation (ECM3412) | Sprout | evolution as search, the EA loop, landscapes, selection, operators |
| Data Science at Scale (COM3021) | Pebble | reliability, load and latency, Twitter fan-out, scaling, maintainability, data models and NoSQL, logs, hash indexes and SSTables |
| Algorithms that Changed the World (ECM3428) | Byte | PageRank, Dijkstra/A*, LP and simplex, MSTs, hulls, error codes, compression, crypto, FFT, attention |

**80 lessons (15 of them hands-on workshops) and 18 boss quizzes.**

- **The path.** Every lesson node has its own topic icon. Hover it to see what's inside (summary, steps, time, questions); tap it and press START. A sticky unit banner with a guidebook follows you as you scroll.
- **The lesson player.** One screen at a time: read a step, pick an answer, press **CHECK**, and get a green or red sheet with the explanation. Wrong answers come back at the end.
- **Figures that run.** Algorithm steps play like a video: play, pause, step, scrub and change speed, with the pseudocode line lit up. They pause to ask you to predict the next move, and you can drag points or edit weights to rerun them.
- **Live demos.** Lessons come with a playground (evolving populations, roulette wheels, A* on a grid, fitness landscapes in 3-D…) with a tick-off checklist.
- **Workshops.** Hands-on, mission-based labs. Data Science: run an ops room, snap query blocks together over tables, documents and a graph, and drive a storage engine by hand. Algorithms: a workshop in every phase, no-code first (be Dijkstra, build a spanning tree, poke a blockchain, mix waves, pick the algorithm) and in-browser Python code labs where you fill in the key lines, run tests and watch your own code animate.
- **Boss quizzes.** Nine question types: multiple choice, select-all, numeric, sliders, ordering, matching, sorting into buckets, clicking the diagram and spot-the-bug.
- **Game layer.** XP, a daily streak, a daily goal, three daily quests with chests, and achievements that unlock hats and gadgets for the cast.
- **The cast.** Six characters, 13 expressions, 17 accessories, and a lot of silly animation. Poke them.
- **Sound.** Everything is synthesised with Web Audio, so there are no audio files. Toggle it with `M`.
- **Keyboard.** `1`–`9` picks an answer, `Enter` checks or continues, `Esc` quits, `/` searches.

## Privacy

Everything you do (progress, XP, streak, quests) is stored in your browser's `localStorage`. You can optionally sign in with an email link to sync it across your devices; it's then also kept in a private Supabase row that only your account can read. There are no analytics.

## Run it locally

Open `index.html` directly, or use the no-cache dev server:

```bash
python serve.py 8651
```

Then open http://localhost:8651.

## Tech

Plain HTML/CSS/JS with no build step. Libraries: [Motion](https://motion.dev) and [GSAP](https://gsap.com) for animation, [KaTeX](https://katex.org) for maths, [three.js](https://threejs.org) for 3-D landscapes, [lottie-web](https://github.com/airbnb/lottie-web) for the (home-made) celebration animations, [Chart.js](https://www.chartjs.org) for charts, [canvas-confetti](https://github.com/catdad/canvas-confetti) for confetti, and Microsoft's [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (Flat, MIT) for icons. All are vendored in `vendor/`.

Tests run in the page (Playwright or DevTools). Load `tools/answer.js` and `tools/smoke.js`, then run `await smoke()`. It walks every lesson in the player and must return `errors: []`. `tools/boss-test.js` → `await bossTest()` answers every boss question through the real UI.

## Note

This is an unofficial study companion built from lecture topics. It isn't affiliated with any university, and the quiz questions are original practice questions, not exam material. Duolingo-inspired look; not affiliated with Duolingo.
