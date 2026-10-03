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
| `js/theme.js` | `NIC.theme.get/set/now/onChange`: System/Light/Dark, stored as `csl.theme`; circular reveal on switch (View Transitions). |
| `js/emoji.js` + `vendor/fluent-emoji.js` | Swaps emoji characters for Fluent Emoji (Flat) SVG icons, in HTML and inside SVG figures. |
| `js/fx.js` | Motion wrappers `NIC.fx`: `enter/step/pop/bounce/bump/springIn/exit/swap/clean/shake/reveal/count/play/onView/celebrate/floatText/toast/watchStats/animate`, tokens `DUR/SPRING*`. |
| `css/motion-hover.css` + `js/motion-details.js` | Hover lifts for every pressable (gated to real pointers), icon nudges, dropdown row cascade, turning carets; every `<details>` opens/closes with height + fade (pointer clicks only, keyboard stays instant). |
| `js/cast.js` + `css/cast.css` | Mascot cast. `NIC.mascot({...})`, `NIC.mascotReact`, `NIC.cast.surprise/idle`, `NIC.feedback`. |
| `js/game.js` | XP, streak, goal, quests, achievements: `NIC.game`. |
| `js/sfx.js` | Web Audio synth `NIC.sfx.play(name)` and the mute toggle. |
| `js/charts.js` | Replaces `NIC.lineChart/barChart` with animated Chart.js versions (same signature). |
| `js/glossary.js` | `NIC.glossify(node)`: underlines known terms (first mention, up to 3) with a hover/tap definition. Used on revision question prompts. Add terms to the list in that file. |
| `js/fig.js` | Lesson figure builders `NIC.fig`: `graph, flow, cycle, bars, compare, cells, plot, frames, surface3d` (three.js, canvas fallback). |
| `js/run.js` + `css/run.css` | Step-through figure runner `NIC.fig.run`, tween helpers `NIC.fig.rn`, `NIC.fig.graphScene` (see §6f). |
| `js/art.js` | In-house illustrations: `NIC.art.banner(course)`, `NIC.art.empty(kind)`, `NIC.art.pattern(kind, colour)`. |
| `assets/lottie.js` | In-house Lottie animations (`window.CSL_LOTTIE`: chest, flame, trophy, levelup, combo), built in code. Played by `NIC.fx.lottie(el, name)` / `NIC.fx.lottieAt(anchor, name)`. |
| `js/workshop.js` + `css/workshop.css` | Workshop engine `NIC.workshop(root, life, {who, intro, missions, build})`: mission list, coach mascot, progress bar, XP. Helpers `NIC.wk`. See §6g. |
| `js/codelab.js` | Code lab engine `NIC.codelab(root, life, {starter, entry, tests, scene, hints, solution})`: Python editor (autocomplete, auto-pairs, resizable split pane), real CPython tests in a Web Worker, example input/output, trace replay. See §6g. |
| `js/algo-workshops-N.js` + `css/aw-*.css`, `css/workshop.css` | Algorithms workshops, one file per phase (`N.W` no-code, `N.C` code lab). |
| `js/ds-workshops.js` | The three Data Science workshops (`ds-ops`, `ds-querylab`, `ds-engine`). |
| `js/l12.js l3.js l4.js lab.js lessons.js` | Nature-Inspired (`nic`) modules and lessons. |
| `js/ds.js` | Data Science (`ds`) modules and lessons. |
| `js/algo-p1.js … algo-p10.js` | Algorithms (`algo`) modules and lessons, one file per phase. |
| `js/quiz.js` | Boss-quiz engine: `NIC.registerBoss`, `NIC.QUIZ_TYPES`, `NIC.bossDef`, `NIC.qfig`. |
| `js/boss-nic.js boss-ds.js boss-algo.js` | Boss quiz content. |
| `js/bank.js` | Revision bank engine `NIC.bank`: `add, all, deck, record, stats, problems`. |
| `js/bank-nic.js bank-ds.js bank-algo.js` + `bank-*-2.js` | Revision questions, 13–15 per module (session). Used only by the Revise tab, never by lessons or bosses. Add new ones to a `-2` file, or start a `-3` file. `bank-v-{nic,ds,algo}-N.js` hold the visual, varied sets (pick/order/cat/slider/bug and figure questions that test understanding): prefer these formats over plain text MCQ. |
| `js/revise.js` + `css/revise.css` | (A revision round is saved in `csl.revSession`, per device: a refresh reopens it, quitting pauses it and the Revise page offers Continue, finishing clears it.) The **Revise** tab (`#revise`): `NIC.revisePage(main, life, {names})`. Sessions run in `NIC.player.revise({home, n, subjects})`. |
| `js/sync.js` | Account progress `NIC.sync` (Supabase project `cslingo`). When logged in the account is the source of truth: it is loaded before the first screen, saves add to it (never replace it), and other devices' changes redraw in place. Stored as one row per item in `public.progress_items` (lesson_done, quiz, rev, xp_day, …) and `public.progress_prefs` (settings), written only through `public.save_progress()` (a rule per kind: finished stays finished, a right quiz answer stays, latest review wins, XP/positions only go up) and wiped only by `public.reset_progress()`; row-level security. The old one-row `public.progress` and `progress_legacy_backup` are kept as backups. Login is username+password; "Create account" in the Log in screen calls the `signup` Edge Function (creates `<name>@cslingo.app`, pre-confirmed, no email). `vendor/supabase.js` loads only when logged in or returning from a link. Reset stamps `nic.resetAt`. |
| `js/player.js` + `css/player.css` | Full-screen lesson player `NIC.player`. |
| `js/app.js` + `css/shell.css` | `SUBJECTS` (the course/lecture catalogue), routing, path home, top bar and popovers, dock, Practice and Profile pages. |
| `css/styles.css` | Theme tokens and base components (buttons, cards, tags, answer tiles, tables, genomes, chips). |
| `css/ux.css` | Lesson typography, guide, takeaways, figures, tooltips, effects. |
| `css/motion.css` | Tactile presses, selection springs, dock indicator, lesson-bar shine, page transitions (see §4 Motion). |
| `css/quiz.css` | Styles for the boss question types. |
| `vendor/` | Vendored libraries (see §3). Never load these from a CDN. |
| `tools/` | In-page tests: `answer.js`, `smoke.js`, `boss-test.js`, `bank-test.js`; `bank-coverage.js` (`bankCoverage()`, `bankExisting(id)`) for planning revision questions; `answer-bias.js` (`answerBias()`) audits MCQs for position/length giveaways. |
| `trailer/` | Motion-graphics trailer page, recorded `.webm`/`.gif`, and `shots/` screenshots. |
| `serve.py` | No-cache dev server: `python serve.py 8651`. |

## 2. How it fits together

**Routing** (`app.js`), by hash:
- `#home`, `#ds-home`, `#algo-home`: that course's path.
- `#practice`, `#revise`, `#profile`: the extra pages (dock tabs).
- `#<moduleId>`: renders the path underneath and opens the **lesson player** on that module.

**The player** (`player.js`) builds screens from data. Nothing in a module is written for the player directly:
1. **Step screens:** one per `NIC.LESSONS[id].steps[k]`. A step's `c` (quick check) becomes its own MCQ screen right after the step. That screen carries the step's figure `v` and any table/figure/svg in its body in a "From step N" card, open when the question mentions a table, graph, figure and so on, closed otherwise. So a check may say "using the table…" as long as the table is in that step. Boss questions show the boss's `matrix`/`aside` card inline, and predicts show the live demo (`contextCard` in player.js; it works in Practice and Revise too). The back button (and ←) exists in lessons only. It returns to the previous teaching screen, skips questions, and questions you already answered are skipped on the way forward. Boss quizzes, Practice and Revise have no back button.
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
| `revRounds` | finished revision rounds `{"<start ms>": {n, right, mods, end}}` (history on the Revise page; union-merged by `sync.js`) |
| `rev` | revision bank answers, `{"<modId>:<hash>": {box, n, right, t}}` (Leitner box 1–5) |

Never rename these keys, because that wipes users' progress. There is no reset button (progress is never deleted from the app).

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
| Pyodide 314 (CPython in WebAssembly, MPL-2.0) | `vendor/pyodide/` (lazy, in a Web Worker) | **All code labs are Python.** Starts loading when a code lab opens (about 12 MB, cached after). Needs http(s): under file:// the lab shows a clear "Python couldn't start" message. |
| Rive canvas runtime 2.43 | `vendor/rive/` (unused) | Ready for `.riv` characters if you get some. Load with `NIC.lazy("vendor/rive/rive.js")`; the wasm needs http(s), not file://. |
| Google Fonts: Nunito | `<link>` in `index.html` | Only external request; falls back to system font offline. |

Don't add a framework or bundler. If you need a new library, vendor a UMD build into `vendor/`, add a `<script>` before the files that use it (or load big ones on demand with `NIC.lazy`), and make the code degrade gracefully if it's missing.

## 4. Design rules (keep the Duolingo feel)

**Look**
- White canvas (or the dark night palette, below) and Nunito, 700–900 weight for UI.
- Green `--teal` (#58cc02) means progress or correct. Blue `--blue` (#1cb0f6) means interactive or selected. Red `--rose` means wrong, orange `--amber` means streak/XP/attention, violet `--violet` means predict/boss/practice. Variable names are legacy (`--teal` is green) because JS reads them. Don't rename them.
- Components are stickers: a 2px border plus a solid "lip" (`box-shadow: 0 4px 0 <darker>`) that squashes on `:active`. Use `.btn`, `.btn.primary`, `.btn.ghost`, `.btn.small`, `.btn.big`, `.card`, `.tag`, `.pill`, `.seg`, `.stat`, `.callout`. Don't invent new button styles.
- No gradients, glass effects or soft drop shadows on UI chrome.
- Lesson prose names colours as **green / blue / purple / red / orange**, never teal, violet, rose or amber.

**Dark mode** (Duolingo night palette: page `#131f24`, raised `#202f36`, lines `#37464f`)
- Tokens are redefined in `css/styles.css` under `@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`. The viewer picks System, Light or Dark in Profile > Settings. `js/theme.js` stores it as `csl.theme`, outside `nic.*`, so it is neither synced nor reset. An inline script in `index.html` applies it before first paint.
- `html[data-theme-now]` is always the resolved theme (`light`/`dark`). Use `:root[data-theme-now="dark"] .x` for the rare dark-only override, as the banner night sky does.
- Never hardcode `#fff` or greys for surfaces, outlines or text. Use `var(--panel)` (cards), `var(--bg)`, `var(--bg-2)`/`var(--panel-2)` (raised or sunken), `var(--line)`, `var(--line-soft)`, `var(--text)`, `var(--ink)`. `#fff` is only for text or icons on a coloured fill (green button, node, badge).
- `--x-ink` is the *text* shade of a colour: darker in light mode, lighter in dark mode. `--x-lip` is the dark sticker edge (box-shadow, border, stroke) and stays dark in both. Use lips for lips.
- SVG strings can use `fill="var(--panel)"`. Canvas and three.js read `NIC.colors()`, which refreshes when the theme flips. `NIC.theme.onChange` redraws pages with canvases, but never under an open lesson.

**Motion**
- Use transform and opacity only. UI motion stays under 300 ms. Use a spring for feedback (`fx.pop`) and a shake for wrong answers (`fx.shake`).
- Reduced motion keeps fades only. Keyboard actions never animate.
- Idle loops belong in CSS so reduced motion can switch them off.
- Hover: anything pressable lifts 2px with its lip growing to match (the press then squashes it down). Put new hover motion in `css/motion-hover.css`, inside `@media (hover: hover) and (pointer: fine)`, and add a reduced-motion override. New disclosures should be plain `<details>`: `js/motion-details.js` animates them automatically.

**Motion tokens and helpers** (tokens in `css/styles.css`; `css/motion.css` + `js/fx.js`)
- Durations: `--dur-press` 40ms (squash on press), `--dur-1` 90, `--dur-2` 160 (exits, fades), `--dur-3` 240 (entrances, springy releases), `--dur-4` 320, `--dur-bar` 420 (lesson bar); JS also has `DUR.xl` 1.2s for celebrations only. JS mirrors them as `NIC.fx.DUR` in seconds. Easings: `--ease-out`, `--ease-spring`, `--ease-in-out` (styles.css), plus `--ease-in` and `--ease-pop`. Springs: `fx.SPRING` (feedback), `fx.SPRING_UI` (indicators, popovers), `fx.SPRING_POP` (badges, icons).
- Presses: `motion.css` gives buttons, answer tiles, chips, path nodes and dock/top-bar buttons an instant squash on `:active` and a spring on release. New tappable stickers should join that selector list rather than define their own transition.
- Helpers: `fx.bounce(el)` correct answer, `fx.shake(el)` wrong, `fx.bump(el, {scale, y})` a counter or icon changed, `fx.springIn(el, {delay, from, rot})` something appears (path nodes, check marks, badges), `fx.exit(el, {x, y, scale, base})` returns a promise to remove on, `fx.onView(els, {run})` below-the-fold reveal, `fx.swap(update, {dir, el})` page change via View Transitions (`dir` 1/-1 slides, 0 crossfades; falls back to a plain update plus fade).
- Clean up: Motion leaves the last frame as inline style, sometimes one frame after `finished`. Wrap animations with `fx.clean(el, anim, props)` (all the helpers above already do), so `:active`, hover and sticky positioning keep working.
- Exits: popovers, the node popover, tooltips and modals close through an exit animation. State resets at once (a new one can open straight away, focus and `inert` come back at once); the leaving element gets `.m-ghost` (no pointer events) and is removed when the exit ends. `m.remove()` on a modal still removes it instantly.
- Routing: `route()` renders synchronously for lessons, the first render, a re-render of the same page and leaving the player. Only dock-tab and page changes go through `fx.swap`, one frame later. Tests that set `location.hash` to a module id are unaffected.

**Sound**
- Sound only follows something the learner did (hover included). `js/sfx.js` handles UI sounds for the whole page: hover notes from a pentatonic scale, taps, sliders, dropdowns, dialogs, toasts, code-editor keys. Every `play()` varies its pitch, has a cooldown and gets quieter when repeated, so add new sounds as entries in `SOUNDS` (plus `COOL`/`VARY`) rather than ad-hoc audio. Observer sounds fire only within 2.5 s of a tap or key press. Never add a timer-driven or idle sound. The sneeze gag was removed for exactly this reason.
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
- **Every question stands on its own.** Boss and bank questions also turn up alone in Practice and Revise, in any order. So never write "same map", "the table", "as before" or "the tour above" unless that exact data is in the question's own text or its `fig`. Restate the numbers instead. The player shows context automatically only in these cases: a quick check gets its step's figure, a boss question gets the boss `matrix`/`aside` card, and a predict gets the live demo.
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
5. **Run the `/revision-bank` skill** (`.agents/skills/revision-bank/SKILL.md` in the vault) for the new lecture, so every new session gets 12–15 revision questions. Do this for a single new module (§6a) too.

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

### 6g. Workshops (no-code hands-on labs)

A workshop replaces a coding practical with a visual, mission-based sandbox. Register it like a lesson with `workshop: true` and `order: 90` (before the boss), `num: "N.W"`, and a title starting `Workshop:`. `render()` calls `NIC.workshop(root, life, cfg)`:

```js
N.workshop(root, life, {
  who: "pebble", intro: "Coach's first line.",
  missions: [{ id: "a", t: "Short title", d: "What to do, naming the buttons in <b>bold</b>.", hint: "Shown under 'Stuck? Hint'." }],
  build(stage, api, life) { /* draw cards into stage; call api.done("a") when the learner achieves it; api.say(html, mood) for the coach */ },
});
```

- The player shows it as a full-width **Workshop** screen. Each mission gives +8 XP, all of them +10 bonus. Continue is never locked ("Skip for now" until done).
- Missions must be won by **doing something in the sandbox** (tap, slide, drag), never by typing. Every number comes from the simulation.
- Keep 4 to 5 missions, each checkable from state. Add a 2-step briefing in `LESSONS[id]` (with figures and quick checks), 2 predicts and a `takeaways` node, like any lesson.
- **Code labs** (`NIC.codelab`): **all code in CSLingo is Python** (real CPython via Pyodide). The learner edits a starter with 1-3 blanks (a `# YOUR CODE: …` comment is highlighted orange; follow it with `pass` where a block would be empty), runs the tests in a Web Worker (2 s limit; one shared worker loads once), sees an Example input/output section, and replays their own `trace({...})` frames on the scene (play/step/scrub). Left column = missions, tests, replay; right = editor; a draggable divider between them (width saved in `csl.split`). The starter must never hang or throw with blanks empty; expected outputs come from a reference implementation (compare with `cmp` for floats); write `noun`, `entry`, `hints`, `solution`. Python values come back as JS: dict→object (string keys), list/tuple→array, set→Set, `float("inf")`→`Infinity`; keep traces to lists, dicts with string keys and numbers. The editor behaves like an IDE: auto-closing pairs, indent after a colon, Tab = 4 spaces, Ctrl+/ comments, autocomplete (2+ letters; Tab accepts). Typing in a code lab is fine; typed answers in quiz questions are still banned.
- Workshops are exempt from `bankTest`'s "every module has bank questions" rule (`m.workshop`); their concepts are covered by the lecture's own bank.
- Motion stays transform/opacity; put new animations in `css/workshop.css` with a reduced-motion override. Add the path icon to `TOPICS` in `tools/emoji-build.py`.

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
| `num` | **Never use.** Legacy only: the engine renders it as tap-to-pick options (½×, 1×, 2×, 10× the answer), never a text box. `bankTest`/`bossTest` fail on it. |
| `slider` | `min, max, step, ans, tol, unit, live` |
| `order` | `items` (in the correct order) |
| `match` | `pairs` |
| `cat` | `buckets`, `items:[[text, bucketIdx]]` |
| `pick` | `fig` with `[data-pick]` elements, `a` |
| `bug` | `code:[...]`, `a` (line index) |

- Every question type can also take an optional `fig` and `hint`.
- Use `NIC.qfig.graph/points/curve` for pick diagrams.
- Aim for 7–10 questions that mix at least 3 types, with new scenarios only (§5).
- **No giveaway answers** (applies to every MCQ: lesson checks, predicts, bosses, bank). The engine shuffles options on screen (`NIC.optOrder`: stable per question; True/False kept, numeric options ascending, "both/neither/all/none of…" kept last), so author order doesn't matter. What you control is length and detail: the right answer must **not** be the longest or most qualified option. Write wrong options that are just as specific and plausible (same length, same style, with their own "because…"), and put explanations in `why`, not in the answer. Check with `tools/answer-bias.js` → `answerBias()`: the right answer should be the longest about as often as chance (~25–30%), and `calcRisk` must be empty. It flags decimal answers that are too precise (like 0.488) or within 15% of another option, unless a `hint` breaks the sum into mental steps. Never make learners pick between close decimals such as 0.36 / 0.488 / 0.6: use far-apart bands ("about 0.2 / 0.5 / 0.8") and a hint ("0.8 × 0.8 = 0.64, × 0.8 ≈ 0.5").
- **No typed answers, ever.** Every answer is picked by tapping, dragging or sorting (mcq, multi, slider, order, match, cat, pick, bug). No text or number boxes in any question screen. `smoke()` fails if a question screen contains one. Demo playgrounds may keep optional input fields, but no quiz, guide step or predict may depend on typing.
- **No calculator, in every quiz** (lesson checks, predicts, bosses and the revision bank, not only bosses). Learners take quizzes without one, so never ask for a typed answer (`num`). Every question must be solvable with mental arithmetic: offer the numbers as `mcq` options (spread far enough apart to tell by estimating), use a `slider` with a generous tolerance for estimates, or ask about the reasoning instead of the digits. Give a `hint` that breaks any arithmetic into easy steps.

### 6e. Revision bank questions

Every module should have at least 10 revision questions across `js/bank-<course>.js` and `js/bank-<course>-2.js`, in the same formats as boss quizzes (§6d) and under the same rules: new scenarios, no calculator, a `why` for every answer, and varied types.

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

The vault folder is the source. The mirror clone lives at `<vault>/.publish/cslingo` (its own git repo, gitignored by the vault), with GitHub Pages serving `main` /root.

```bash
cd "<vault>/Nature inspired/Visualizer"
cp -r index.html serve.py README.md AGENTS.md CLAUDE.md .nojekyll manifest.webmanifest sw.js css js vendor tools trailer assets <vault>/.publish/cslingo/
rm -rf <vault>/.publish/cslingo/vendor/rive          # unused runtime (2.4 MB); only publish it once a .riv is in use
python tools/stamp.py <vault>/.publish/cslingo       # stamps ?v=<build> on every asset URL in the mirror's index.html
cd <vault>/.publish/cslingo && git add -A && git commit -m "…" && git push
```

- **Always stamp.** Without a new `?v=` browsers mix cached old files with new ones for up to 10 minutes (Pages sends `max-age=600`), and the service worker keeps an old cache. The vault copy stays at `?v=dev`.
- The service worker (`sw.js`) only registers on the https site, never on localhost or file://.

- Never copy vault notes, `MEMORY.md`, progress logs or lecture PDFs into the mirror. It is public.
- Pages rebuilds in about a minute after the push.
- After big UI changes, refresh `trailer/shots/*.png`, then re-record `trailer/cslingo-trailer.webm` and `.gif`. Use Playwright `recordVideo` on `trailer/?rec=1` at 1280×720 for about 33 s, then trim and convert with OpenCV/Pillow.
