# CSLingo — Agent Guide

> Read this before touching the app. It covers what CSLingo is, how it's built, the design rules, and the exact steps for adding a lecture, a module, a boss quiz or a whole new course.

CSLingo is a Duolingo-style study app for university CS modules: a lesson path, a full-screen lesson player, live demos, boss quizzes, XP/streaks/quests and a cast of animated mascots. Plain HTML/CSS/JS, **no build step**. It must keep working when `index.html` is double-clicked (file://) and when served from GitHub Pages.

- **Source of truth:** `study-vault/Nature inspired/Visualizer/` (private vault).
- **Public mirror:** https://github.com/duc-minh-droid/cslingo, live at https://duc-minh-droid.github.io/cslingo/. It is a copy of this folder (see [Publishing](#publishing)). If you are working in the mirror, port your change back to the vault, or tell the user to.
- **Data:** everything is in the browser's `localStorage`. There is no backend, no accounts and no analytics. Keep it that way.

---

## 1. File map

| Path | What it is |
|---|---|
| `index.html` | Shell: `#topbar`, `#pop`, `#main`, `#dock`, and **every script tag in load order**. |
| `js/core.js` | `NIC.lazy(src…)` (load vendor files on demand), `NIC.tex(root)` (KaTeX; runs automatically on everything added to the page), plus `window.NIC` helpers: DOM (`el/qs/qsa/esc`), `store`, `register`, `header`, `predict`, `guide`, `takeaways`, `slider`, `seg`, `lifecycle`, `setupCanvas`, `colors()`, canvas `lineChart/barChart` (fallbacks), landscapes, TSP data. |
| `js/emoji.js` + `vendor/fluent-emoji.js` | Swaps emoji characters for Fluent Emoji (Flat) SVG icons, in HTML and inside SVG figures. |
| `js/fx.js` | Motion wrappers `NIC.fx`: `enter/step/pop/shake/reveal/count/play/onView/celebrate/floatText/toast/watchStats/animate`. |
| `js/cast.js` + `css/cast.css` | Mascot cast. `NIC.mascot({...})`, `NIC.mascotReact`, `NIC.cast.surprise/idle`, `NIC.feedback`. |
| `js/game.js` | XP, streak, goal, quests, achievements: `NIC.game`. |
| `js/sfx.js` | Web Audio synth `NIC.sfx.play(name)` and the mute toggle. |
| `js/charts.js` | Replaces `NIC.lineChart/barChart` with animated Chart.js versions (same signature). |
| `js/fig.js` | Lesson figure builders `NIC.fig`: `graph, flow, cycle, bars, compare, cells, plot, frames, surface3d` (three.js, canvas fallback). |
| `js/run.js` + `css/run.css` | Step-through figure runner `NIC.fig.run`, tween helpers `NIC.fig.rn`, `NIC.fig.graphScene` (see §6f). |
| `js/art.js` | In-house illustrations: `NIC.art.banner(course)`, `NIC.art.empty(kind)`, `NIC.art.pattern(kind, colour)`. |
| `assets/lottie.js` | In-house Lottie animations (`window.CSL_LOTTIE`: chest, flame, trophy, levelup, combo), built in code. Played by `NIC.fx.lottie(el, name)` / `NIC.fx.lottieAt(anchor, name)`. |
| `js/l12.js l3.js l4.js lab.js lessons.js` | Nature-Inspired (`nic`) modules and lessons. |
| `js/ds.js` | Data Science (`ds`) modules and lessons. |
| `js/algo-p1.js … algo-p10.js` | Algorithms (`algo`) modules and lessons, one file per phase. |
| `js/quiz.js` | Boss-quiz engine: `NIC.registerBoss`, `NIC.QUIZ_TYPES`, `NIC.bossDef`, `NIC.qfig`. |
| `js/boss-nic.js boss-ds.js boss-algo.js` | Boss quiz content. |
| `js/bank.js` | Revision bank engine `NIC.bank`: `add, all, deck, record, stats, problems`. |
| `js/bank-nic.js bank-ds.js bank-algo.js` | Revision questions, about 5 per module (session). |
| `js/revise.js` + `css/revise.css` | The **Revise** tab (`#revise`): `NIC.revisePage(main, life, {names})`. Sessions run in `NIC.player.revise({home, n, subjects})`. |
| `js/sync.js` | Optional account sync `NIC.sync` (Supabase project `cslingo`, table `public.progress`, one row per user, row-level security). Magic-link sign-in; it mirrors every `nic.*` localStorage key. Newest side wins; it never reloads mid-lesson. `vendor/supabase.js` loads only when signed in or returning from a link. |
| `js/player.js` + `css/player.css` | Full-screen lesson player `NIC.player`. |
| `js/app.js` + `css/shell.css` | `SUBJECTS` (the course/lecture catalogue), routing, path home, top bar and popovers, dock, Practice and Profile pages. |
| `css/styles.css` | Theme tokens and base components (buttons, cards, tags, answer tiles, tables, genomes, chips). |
| `css/ux.css` | Lesson typography, guide, takeaways, figures, tooltips, effects. |
| `css/quiz.css` | Styles for the boss question types. |
| `vendor/` | Vendored libraries (see §3). Never load these from a CDN. |
| `tools/` | In-page tests: `answer.js`, `smoke.js`, `boss-test.js`, `bank-test.js`. |
| `trailer/` | Motion-graphics trailer page, recorded `.webm`/`.gif`, and `shots/` screenshots. |
| `serve.py` | No-cache dev server: `python serve.py 8651`. |

## 2. How it fits together

**Routing** (`app.js`), by hash:
- `#home`, `#ds-home`, `#algo-home`: that course's path.
- `#practice`, `#revise`, `#profile`: the extra pages (dock tabs).
- `#<moduleId>`: renders the path underneath and opens the **lesson player** on that module.

**The player** (`player.js`) builds screens from data. Nothing in a module is written for the player directly:
1. **Step screens:** one per `NIC.LESSONS[id].steps[k]`. A step's `c` (quick check) becomes an MCQ that you answer with CHECK.
2. **Try it:** whatever `mod.render(root, life)` appends, minus its `header`, `.predict` and `.takeaways` nodes. `L.guide` becomes the tick-off checklist beside it.
3. **Predict screens:** every `NIC.predict({...})` card that `render()` created. The player reads `node.__opts` and turns it into a question.
4. **Mistakes round:** wrong answers are asked again at the end.
5. **Recap:** the `NIC.takeaways(...)` node.
6. **Complete, then streak:** XP / accuracy / time cards, then the streak screen.

**Boss modules** (`num: "Boss"`) run in the same player, using the questions from `NIC.bossDef(id)`.

**Progress keys** (localStorage, all prefixed `nic.`):

| Key | Holds |
|---|---|
| `lessonDone` | completed modules |
| `lessonPos` | resume screen per module |
| `visited` | modules opened |
| `quiz` | boss answers, `{"<bossId>-<i>": {v, ok}}` |
| `predict` | predict results |
| `xp` | XP totals |
| `activeDays` | days with a completed lesson (streak) |
| `quests` | today's quests |
| `ach` | achievements |
| `stats` | lesson and answer counts |
| `missed` | wrong answers queued for Practice |
| `goal` | daily XP goal |
| `course` | last course |
| `last` | last module per course |
| `lastHome` | last course home |
| `revPrefs` | Revise tab settings `{n, subjects}` |
| `rev` | revision bank answers, `{"<modId>:<hash>": {box, n, right, t}}` (Leitner box 1–5) |

Never rename these keys, because that wipes users' progress. The Reset buttons are in `app.js` `resetAll()`.

## 3. Libraries (all vendored, loaded in `index.html`)

| Library | File | Used for |
|---|---|---|
| Motion (motion.dev UMD) | `vendor/motion.js` | All JS animation, via `NIC.fx` or `Motion.animate/inView`. |
| Chart.js 4 | `vendor/chart.umd.js` | Every line/bar chart, through `NIC.lineChart/barChart`. |
| canvas-confetti | `vendor/confetti.browser.js` | `NIC.fx.celebrate`. |
| Fluent Emoji (Flat), Microsoft, MIT | `vendor/fluent-emoji.js` (generated) | All pictographic icons in content (see §4 Emoji). |
| GSAP 3.15 + DrawSVG + MotionPath (free) | `vendor/gsap/` | Runner frame tweens (`NIC.fig.rn`). Loaded in `index.html`. |
| KaTeX 0.18 | `vendor/katex/` (lazy) | Maths typesetting: write `$…$` or `$$…$$` in any content. |
| three.js r159 (UMD build) | `vendor/three.min.js` (lazy) | `NIC.fig.surface3d`. The deprecation warning line was stripped. |
| lottie-web light 5.13 | `vendor/lottie_light.min.js` (lazy) | Plays `assets/lottie.js`. |
| Rive canvas runtime 2.43 | `vendor/rive/` (unused) | Ready for `.riv` characters if you get some. Load with `NIC.lazy("vendor/rive/rive.js")`; the wasm needs http(s), not file://. |
| Google Fonts: Nunito | `<link>` in `index.html` | Only external request; falls back to system font offline. |

Don't add a framework or bundler. If you need a new library, vendor a UMD build into `vendor/`, add a `<script>` before the files that use it (or load big ones on demand with `NIC.lazy`), and make the code degrade gracefully if it's missing.

## 4. Design rules (keep the Duolingo feel)

**Look**
- White canvas and Nunito, 700–900 weight for UI.
- Green `--teal` (#58cc02) means progress or correct. Blue `--blue` (#1cb0f6) means interactive or selected. Red `--rose` means wrong, orange `--amber` means streak/XP/attention, violet `--violet` means predict/boss/practice. Variable names are legacy (`--teal` is green) because JS reads them. Don't rename them.
- Components are stickers: a 2px border plus a solid "lip" (`box-shadow: 0 4px 0 <darker>`) that squashes on `:active`. Use `.btn`, `.btn.primary`, `.btn.ghost`, `.btn.small`, `.btn.big`, `.card`, `.tag`, `.pill`, `.seg`, `.stat`, `.callout`. Don't invent new button styles.
- No gradients, glass effects or soft drop shadows on UI chrome.
- Lesson prose names colours as **green / blue / purple / red / orange**, never teal, violet, rose or amber.

**Motion**
- Use transform and opacity only. UI motion stays under 300 ms. Use a spring for feedback (`fx.pop`) and a shake for wrong answers (`fx.shake`).
- Reduced motion keeps fades only. Keyboard actions never animate.
- Idle loops belong in CSS so reduced motion can switch them off.

**Sound**
- Sound only follows something the learner did. Never add a timer-driven or idle sound. The sneeze gag was removed for exactly this reason.
- Reuse the names in `SOUNDS` (`js/sfx.js`): `tap, select, step, back, correct, wrong, retry, check, pop, complete, streak, fanfare, whoosh, flame, chest, achieve, sad, squeak, dizzy, tick`. The sneeze sound was deleted; don't bring it back.

**Canvas**
- Canvas cannot resolve `var(--x)`. Always use `NIC.colors().teal` and so on, or hex values.
- Guard against zero size: a demo may render while detached or in the offscreen holder. Skip drawing when `w < 40`.
- Never draw on a Chart.js canvas yourself. Pass `markers: [{x, color, label}]` instead.

**Mascots**
- Use `NIC.mascot({who, size, mood, acc, act})`. Each course has a character: `nic` = Sprout, `ds` = Pebble, `algo` = Byte. Blaze is for streaks, Chip for quests, Berry for mistakes.
- Moods: `idle happy laugh sad cry surprised wink love dizzy sleepy determined smug shocked think`.
- Actions: `dance juggle sleep skate headbang spin wave peek cry`.
- Accessories are listed in `NIC.cast.ACC`.

**Emoji → Fluent Emoji icons**
- Never ship native emoji glyphs; they look different on every OS and clash with the theme. `js/emoji.js` automatically replaces every *mapped* emoji in the page with a flat Fluent SVG. It handles HTML text and SVG `<text>` labels (the icon goes beside the label, or centred if the label was only the emoji).
- In new code you can type a mapped emoji (🧬 🧠 🐜 💥 📬 🎩 ✂ ✈ 🔁 🐞 💀 🚐 🚚 📈 🤖 🎯 🐒 🦎 🚗 📡 📅 💧 🥾 🔥 ⚠) or write `NIC.emo("fire")`.
- **To use a new emoji:** add `"<char>": "<fluent-emoji-flat name>"` to `MAP` in `tools/emoji-build.py`, run `python tools/emoji-build.py`, and commit the regenerated `vendor/fluent-emoji.js`. Names are listed at https://icon-sets.iconify.design/fluent-emoji-flat/. Fluent has no flags, so use a stand-in icon.
- Emoji inside `<canvas>` can't be swapped, so don't use them there. Plain typographic marks (✓ ✗ → ← ★ ▸ ① ② ③) are text, not emoji, and are fine.

**CSS class names**
- Shell and player classes are prefixed (`tb-`, `pl-`, `p-`, `pc-`, `us-`, `pd-`, `ps-`, `q-`, `pt-` path tooltip, `rn-` runner, `ab-` art, `ob-` onboarding) so they can't collide with the short classes that module demos use (`pop`, `chip`, `gene`, `cell`, `stat`…). New shell-level classes must be prefixed too. An unprefixed `.pop` once turned every population demo into full-screen overlays.

**Maths**
- Write maths as KaTeX: `$O(n^2)$` inline, `$$\frac{a}{b}$$` display. Inside JS strings, double every backslash (write `\\frac` in source to get `\frac` at runtime). A single backslash silently turns `\frac` into a form feed plus `rac`.
- Don't use `$` for money in content; it would start a formula.

**Art and animation**
- All art is in-house and in the cast palette: no downloaded illustrations or Lottie files. New scenes go in `js/art.js`, new Lottie animations in `assets/lottie.js` (use its helpers). Always keep a static fallback: `NIC.fx.lottie` resolves to `null` under reduced motion.
- Path nodes show a topic icon. When you add a module, add `"<module id>": "<fluent name>"` to `TOPICS` in `tools/emoji-build.py` and rerun it.

**Copy**
- Short and friendly. One idea per step. UK spelling.

## 5. Content rules

- **Numbers must be right.** Verify every number shown in a figure, reveal, quiz answer or tolerance with a quick `node -e` calculation before writing it.
- **Assessment integrity.** Boss and practice questions are original. Never copy, paraphrase or reskin official exam or past-paper questions, scenarios or values. Build new scenarios from the lecture objectives (see `boss-ds.js`, which uses a made-up music app, "Tunely").
- **Scope.** Respect course scope notes (for example Data Science = concepts, not SQL syntax).
- **Every lesson step should have a figure.** Use `v:` with `NIC.fig.*` or small HTML. Strokes marked `.draw` and items marked `.fi` animate in automatically.
- **Guide items** describe actions in the demo ("Press **Run**…"). Mention predicts as "the questions after the demo", not "below".

## 6. Adding content

### 6a. A new module (lesson) in an existing lecture

Put it in the course's file (for example `js/ds.js`, or a new `js/algo-pN.js`):

```js
(function () {
  const N = NIC, { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS, F = N.fig;

  N.register({
    id: "ds-replication",           // unique, kebab-case, prefixed by course
    subject: "ds",                  // "nic" (default) | "ds" | "algo"
    lecture: 2,                     // must exist in SUBJECTS[subject].lectures (app.js)
    order: 1,                       // position within the lecture (boss uses 99)
    num: "2.1",                     // label shown in popovers/guidebook
    title: "Leaders and followers",
    blurb: "One-line hook shown in the node popover.",
    render(root, life) {
      root.appendChild(header(this, ""));                 // removed by the player, keep it for the fallback
      const card = el(`<div class="card"><div class="card-head"><h2>Try replication</h2></div>
        <div class="controls"><button class="btn primary" id="go">Replicate</button></div>
        <canvas class="viz" id="cv"></canvas></div>`);   // el() returns ONLY the first element — wrap in one root
      root.appendChild(card);
      qs("#go", card).onclick = () => N.lineChart(qs("#cv", card), { series: [{ data: [1, 3, 2], color: N.colors().teal }], height: 200, names: ["lag"] });
      life.interval(() => {/* animation tick */}, 500);    // use life.* so timers stop when the player closes
      life.onResize(() => {/* redraw canvases */});
      root.appendChild(predict({ id: "ds-rep-1", q: "Predict…", opts: ["A", "B", "C"], a: 1, why: "Because…" }));
      root.appendChild(takeaways(["Point one.", "Point two."], "One sentence to say out loud."));
    },
  });

  L["ds-replication"] = {
    sum: "One-sentence summary (shown in the guidebook).",
    steps: [
      { t: "Step title", b: `<p>Body HTML. <span class="analogy">An analogy.</span> <span class="key">The key point.</span></p>`,
        v: F.flow(["Client", "Leader", { t: "Follower", c: "teal" }]) },
      { t: "Another step", b: `<p>…</p>`, c: { q: "Quick check?", o: ["No", "Yes", "Maybe"], a: 1, why: "Explanation shown in the footer sheet." } },
    ],
    guide: ["Press <b>Replicate</b> and watch the lag chart.", "Answer the questions after the demo."],
  };
})();
```

Then add `<script src="js/<file>.js"></script>` to `index.html`. Put it after `js/emoji.js`, `js/charts.js`, `js/fig.js` and `js/quiz.js`, and before `js/player.js` and `js/app.js`.

Rules:
- `predict` ids must be globally unique.
- Keep quick checks to 2–4 options.
- Always explain the answer in `why`.

### 6f. A step-through runner (running figures)

Use a runner only on a step that explains a **process or algorithm**. Concept steps stay static. Add it as a new step (usually titled "Watch it run") after the step that explains the process:

```js
{ t: "Watch it run", b: `<p>Press <b>play</b> or step with the arrows…</p>`, v: (box, life) => myRun(box, life) }
```

```js
function myRun(box, life) {
  const model = [...];                                    // editable input
  F.run(box, life, {
    code: ["line 1", "line 2"],                           // optional pseudocode; frame.line highlights one
    build(stage, api) {                                   // draw once; return handles
      const g = F.graphScene(stage, { nodes, edges: model, editable: true });
      model.forEach((e) => api.edit(g.edge(e[0], e[1]).wbox, { get: () => e[2], set: (v) => (e[2] = v), min: 1, max: 9 }));
      return g;
    },
    *frames(g) {                                          // run the REAL algorithm; one frame per step
      yield { cap: "Start…", line: 0, dist: {...} };
      yield { cap: "Settle <b>C</b>", line: 1, ask: { q: "Which node next? Tap it.", pick: ".rn-node.s-tent", a: ["C"], why: "Smallest distance." } };
    },
    draw(g, f, c) {                                       // show frame f; animate with F.rn.* and the context c
      F.rn.num(c, g.node("C").tag, f.dist.C);
      g.node("C").g.classList.toggle("s-done", !!f.done);  // always force a boolean
    },
  });
}
```

- Frames are computed up front, so back and scrub are exact. Numbers must come from the algorithm, never typed in.
- `ask` pauses before that frame. The learner clicks an element matching `pick` whose `data-k` is in `a`. Right guesses give +1 XP and count for the "predict" quest.
- `api.drag(el, {move(x, y), end()})` and `api.edit(el, {get, set, min, max})` make the model editable; call `api.recompute()` after a drag.
- `smoke()` plays every runner to the end and answers each ask, so a broken runner fails the test.

### 6b. A new lecture (or phase) in an existing course

1. In `js/app.js` → `SUBJECTS[<course>].lectures`, add `N: "Lecture N — Title"`. The text before `—` becomes the banner label.
2. Add its modules (§6a) with `lecture: N`.
3. Add a boss quiz (§6d) with `lecture: N`.
4. A module whose lecture isn't declared makes a red dev banner appear on load. This is intentional.

### 6c. A new course (subject)

1. Add an entry to `SUBJECTS` in `js/app.js`:
   ```js
   os: { name: "Operating Systems", code: "ECM2414", home: "os-home", unit: "Lecture", who: "chip", color: "orange",
         lectures: { 1: "Lecture 1 — Processes & threads" } },
   ```
2. Add `"os"` to `SUBJ_ORDER` in the same file.
3. Pick a mascot for `who`. Reuse a character, or add one to `CHARS` in `js/cast.js`. A character needs `body`, `belly`, `limb`, `foot`, `shape` (the SVG path in the 120×124 rig), `bellyEl`, `top`, `hy` and `hs`. Hats sit on y≈32.
4. Create `js/os.js` (and `js/boss-os.js`) with `subject: "os"`, and add their script tags.
5. Update `README.md`: the course table and the lesson/boss counts. The counts appear in the trailer outro too.

### 6d. A boss quiz

In `js/boss-<course>.js`:

```js
NIC.registerBoss({
  id: "os1-boss", subject: "os", lecture: 1, title: "Lecture 1 boss quiz",
  blurb: "Popover text.", lede: "Intro shown on the boss start screen.",
  // optional: matrix: true (shows the TSP matrix), aside: "<html>" reference card
  qs: [
    { type: "mcq", q: "…", o: ["…", "…"], a: 0, why: "…" },
    { type: "slider", q: "Estimate…", min: 0, max: 100, step: 5, ans: 40, tol: 10, unit: "ms", why: "…" },
  ],
});
```

Question types (defined in the header of `js/quiz.js`):

| Type | Fields |
|---|---|
| `mcq` | `o, a` |
| `multi` | `o, a:[...]` |
| `num` | `ans, tol, unit` (**don't use in boss quizzes**, see below) |
| `slider` | `min, max, step, ans, tol, unit, live` |
| `order` | `items` (in the correct order) |
| `match` | `pairs` |
| `cat` | `buckets`, `items:[[text, bucketIdx]]` |
| `pick` | `fig` with `[data-pick]` elements, `a` |
| `bug` | `code:[...]`, `a` (line index) |

- Every question type can also take an optional `fig` and `hint`.
- Use `NIC.qfig.graph/points/curve` for pick diagrams.
- Aim for 7–10 questions that mix at least 3 types, with new scenarios only (§5).
- **No calculator.** Learners take quizzes without one, so never ask for a typed answer (`num`). Every question must be solvable with mental arithmetic: offer the numbers as `mcq` options (spread far enough apart to tell by estimating), use a `slider` with a generous tolerance for estimates, or ask about the reasoning instead of the digits. Give a `hint` that breaks any arithmetic into easy steps.

### 6e. Revision bank questions

Every module should have about 5 revision questions in `js/bank-<course>.js`, in the same formats as boss quizzes (§6d) and under the same rules: new scenarios, no calculator, a `why` for every answer, and varied types.

```js
NIC.bank.add("ds-replication", [
  { type: "mcq", q: "…", o: ["…", "…"], a: 1, why: "…" },
  { type: "cat", q: "…", buckets: ["…", "…"], items: [["…", 0], ["…", 1]], why: "…" },
]);
```

- Don't repeat the module's lesson checks, predicts or boss questions. The pool already includes those.
- **How the pool is built:** `NIC.bank.all({learnedOnly: true})` returns bank questions and lesson quick checks for modules in `nic.lessonDone`, plus the questions of every boss quiz the learner has attempted. Each item is `{id, mod, subject, lecture, src: "bank" | "check" | "boss", Q}`.
- **The Revise tab** (`js/revise.js`) already does this: pick the courses and a deck size (5, 10 or 20), then Start runs `NIC.player.revise()`. It shows each finished session's due and mastered counts. The API underneath: call `NIC.bank.deck({n, subjects})` to get a shuffled deck. It puts due and previously missed questions first and avoids two in a row from the same module. Render each `Q` with `NIC.QUIZ_TYPES[type]` (as the boss player does), then call `NIC.bank.record(id, ok)`. `NIC.bank.stats()` gives `{available, due, seen, mastered, accuracy, bySubject}` for a header.
- **Scheduling:** a right answer moves a question up one Leitner box, and a wrong one sends it back to box 1. The box sets when it's due again: box 1 = always, then 1, 3, 7 and 14 days.

## 7. Testing (required before you finish)

1. Run `python serve.py 8651` and open http://localhost:8651. Plain `http.server` caches old JS.
2. In the page console (or Playwright `addScriptTag` + `evaluate`), load `tools/answer.js`, `tools/smoke.js` and `tools/boss-test.js`, then run:
   - `await smoke()` → must return `errors: []` for **every** module. It opens each module in the player, walks every screen, answers correctly and presses demo buttons. It also fails if any screen shows `[object Object]`, `undefined` or `NaN` (a value printed instead of rendered). If you see one, fix the data, don't silence the check. Table helpers take rows as `["a", "b"]` or `{ c: ["a", "b"], hl: true }`, never wrapped in an extra array.
   - `await bossTest()` → must return `failures: []`.
   - `await bankTest()` (load `tools/bank-test.js`) → must return `failures: []`. It renders and grades every bank question, checks every module has questions, and exercises `deck/record/stats` on sandboxed progress.
3. `NIC.player.state()` exposes `{open, kind, Q, key, foot, goDisabled}`, which is useful for writing checks.
4. Look at it in a real browser at desktop width (1280) and phone width (390): the path, a step, the correct and wrong sheets, the Try-it screen, and lesson complete.

## 8. Publishing

The vault folder is the source. The mirror clone lives at `~/Desktop/cslingo`, with GitHub Pages serving `main` /root.

```bash
cd "<vault>/Nature inspired/Visualizer"
cp -r index.html serve.py README.md AGENTS.md CLAUDE.md .nojekyll manifest.webmanifest sw.js css js vendor tools trailer assets ~/Desktop/cslingo/
rm -rf ~/Desktop/cslingo/vendor/rive          # unused runtime (2.4 MB); only publish it once a .riv is in use
python tools/stamp.py ~/Desktop/cslingo       # stamps ?v=<build> on every asset URL in the mirror's index.html
cd ~/Desktop/cslingo && git add -A && git commit -m "…" && git push
```

- **Always stamp.** Without a new `?v=` browsers mix cached old files with new ones for up to 10 minutes (Pages sends `max-age=600`), and the service worker keeps an old cache. The vault copy stays at `?v=dev`.
- The service worker (`sw.js`) only registers on the https site, never on localhost or file://.

- Never copy vault notes, `MEMORY.md`, progress logs or lecture PDFs into the mirror. It is public.
- Pages rebuilds in about a minute after the push.
- After big UI changes, refresh `trailer/shots/*.png`, then re-record `trailer/cslingo-trailer.webm` and `.gif`. Use Playwright `recordVideo` on `trailer/?rec=1` at 1280×720 for about 33 s, then trim and convert with OpenCV/Pillow.
