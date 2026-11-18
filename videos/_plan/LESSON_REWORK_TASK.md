# Task: make a dense CSLingo lecture easy, light and fun

You are reworking the lessons of one or more lectures in the CSLingo repo (`/home/user/cslingo`), a Duolingo-style study app.
Read `AGENTS.md` first (sections 4 to 7: design rules, content rules, adding content, testing). The owner's feedback, in their words:

> the new lectures are very dense and hard to understand. treat me like i barely know a thing, rn it's so much information, and the
> mini quizzes after arent helping (most have numbers, and when i dont even understand the concept how am i doing the math), like new
> lectures have only 3 lecture nodes, with 7 steps each, so much in a node, i'd prefer more nodes and less per node, but not too many.
> not every node need a mini workshop at the end rn, just make it more engaging and fun. rn it feels like a chore to go through this.

## What to change (per lecture)

1. **More, smaller nodes.** Split the lecture's 2 or 3 big nodes into **5 or 6 nodes** (not counting the lecture's workshop, boss quiz and
   recap video, which stay as they are). Each node has **3 or 4 steps** (never more than 4) and teaches one small idea.
2. **Assume the learner knows nothing.** Every step opens with a picture-able everyday story or analogy *before* the term ("Picture a
   shop that suddenly…"), then names the idea, then says why it matters, in short sentences. One idea per step, about 40 to 90 words
   of body text. Cut detail the learner doesn't need on a first pass; keep the lecture's key terms and facts (they are what the exam
   asks about), and keep formal maths only inside the existing collapsible "Show the maths" drawers (`mm(...)`), never in the main text.
   Don't remove facts the boss quiz or the revision bank relies on: if a fact goes, make sure it is still taught somewhere in the lecture.
3. **Fewer, kinder quick checks.** A quick check (`c` / `mc(...)`) on only **1 or 2 steps per node**, never on every step. They test
   the *idea* (which kind is this? what happens next? which one fits?), not arithmetic: **no calculation questions** and as few numbers in
   the options as possible. A check may only ask about something the step just explained in plain words. Keep 2 to 4 options, a `why`
   for every check, and the no-giveaway rule (the right answer is not the longest or most qualified option).
4. **Try-it demos only where they shine.** Keep the interactive demo (`render()` card + guide) on **about half** of the nodes: the ones
   where playing with it makes the idea click. The other nodes have **no demo**: their `render()` appends only `header(...)` and
   `takeaways(...)`, and their `LESSONS[id]` entry has **no `guide`** (then the player shows no "Try it" screen). A demo node keeps **at
   most one** predict, a qualitative one about what the learner just saw. Reuse the existing demo/figure functions; don't write new
   demos unless a split leaves a node with nothing to show (then a small static figure is enough).
5. **Make it engaging.** Friendly, warm, a bit playful (the app's voice: short, encouraging, UK spelling, no hype or exclamation spam).
   Carry the lecture's running example (Basketly, the drone fleet, etc.) through the nodes like a story with a problem to solve. Give
   nodes and steps inviting titles ("When the world changes overnight"), not textbook headings. Every step still has a figure (`v:`):
   reuse the figures that exist, and move them with the step they illustrate. Takeaways: 3 short bullets per node.

## Mechanics (must hold, or the tests fail)

- **Ids.** Keep each existing module id on the first node made from it (so learners' progress stays), and give new nodes new ids with
  the same course prefix (`ds10-...`, `l13-...`). Renumber `order` and `num` (10.1, 10.2, ...) so the path reads in teaching order;
  workshop (`order: 90`, `num: "N.W"`), boss (`order: 99`) and video (`order: 100`) stay. Predict ids stay globally unique.
- **Files.** No source file over 500 lines of code (ESLint `max-lines`). Split files where needed (`ds-l10-01.js`, `ds-l10-02.js`, ...)
  and list every new file in the right place in the course group in `js/content.js` (order = run order; shared helpers first). Shared
  helpers that several files use go through `NIC.shared` as AGENTS.md "Keeping files short" explains.
- **Path icons.** For each new module id add `"<id>": "<fluent-emoji-flat name>"` to `TOPICS` in `tools/emoji-build.py` (pick an icon
  name that already appears in that file, so no new download is needed). **Do not run `tools/emoji-build.py`** (the lead runs it once).
- **Revision bank.** Every module must have revision questions (`bankTest` fails otherwise). Re-home the existing `NIC.bank.add("<id>",
  [...])` questions of the old nodes (in `js/bank/<course>-NN.js`) to the new node that teaches each one, so every node of the lecture
  ends up with at least 6. Don't rewrite them otherwise.
- **Glossary.** `js/glossary.js` has a `DEMO` map (term name to lesson id whose demo shows it). If a demo moved to another id or was
  dropped, update or remove those lines.
- **Concurrency.** Other agents are reworking other lectures in the same working tree at the same time. Touch only your lectures'
  files, your lectures' lines in `js/content.js`, `tools/emoji-build.py`, `js/glossary.js` and the bank files (edit with small exact
  edits, never rewrite those shared files wholesale). Never run git (no commit, checkout, stash, reset, `add -A`), never run Prettier
  or ESLint `--fix` on the whole repo, and never run `npm test` / `npm run check` (the lead does).

## Check your work

- `npx prettier --write <your files>` and `npx eslint <your files>`; `node tools/check-structure.js` must say `structure ok`.
- Focused smoke on your modules:
  `node /tmp/claude-0/-home-user-cslingo/962177ed-7999-51dd-b65e-c3a2043e7aab/scratchpad/smoke-mods.mjs <id> <id> ...`
  (copy it to `tools/_smoke-<yourname>.mjs` first if the import path complains, and delete your copy when done). It must show
  `"missing": []`, no `smokeErrors`, no `bankFailures`, every id in `bankPerModule` with at least 6, `calcRisk: 0`, no `pageErrors`.
- Read two or three of your nodes back as a beginner would: if a step uses a word it hasn't explained yet, fix it.

## Report

When done, reply briefly: per lecture the new node list (`num` title, steps, checks, demo yes/no), the ids you added, and anything you
couldn't keep (and where that fact lives now).
