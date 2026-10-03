/* Full-screen lesson player (Duolingo-style).
   One screen at a time, fixed footer: pick → CHECK → green/red sheet → CONTINUE.
   Sessions:
     NIC.player.open(mod, {home})      lesson: steps (+ quick checks) → Try it (demo + checklist) → predicts → mistakes → recap → complete → streak
                                       boss:   intro → questions → results → complete
     NIC.player.practice({home})       mixed review of missed questions + quick checks from finished lessons
     NIC.player.revise({home, n, subjects})  shuffled revision deck from NIC.bank (finished sessions); answers update the Leitner boxes
   Content is never re-authored: steps come from NIC.LESSONS, predicts/takeaways/demo are lifted out of mod.render(). */
(function () {
  const N = NIC, { el, qs, qsa, store } = N;
  const fx = () => N.fx, game = () => N.game;
  const sound = (n) => N.sfx && N.sfx.play(n);
  const T = () => N.QUIZ_TYPES;
  const PRAISE = ["Nice!", "Awesome!", "Spot on!", "Great job!", "Excellent!", "You got it!", "Brilliant!", "Nailed it!"];
  const CHEER = ["happy", "laugh", "love", "wink"];
  const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
  const stripTags = (h) => String(h).replace(/<[^>]+>/g, "");
  const reduce = () => fx() && fx().reduce();

  const IC = {
    back: `<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    retry: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M8 12a4 4 0 1 0 1.2-2.85M8 7.5v2.4h2.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    x: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
    ok: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="#58cc02" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    no: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M8 8l8 8M16 8l-8 8" stroke="#ff4b4b" stroke-width="3.2" stroke-linecap="round"/></svg>`,
    bolt: `<svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="#ffc800" stroke="#ff9600" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    target: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#58cc02" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#58cc02"/></svg>`,
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#1cb0f6" stroke-width="3"/><path d="M12 7v5l3 2" stroke="#1cb0f6" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`,
    book: `<svg viewBox="0 0 24 24"><path d="M4 5c3-1 5.5-.6 8 1.4V20c-2.5-2-5-2.4-8-1.4zM20 5c-3-1-5.5-.6-8 1.4V20c2.5-2 5-2.4 8-1.4z" fill="currentColor"/></svg>`,
  };

  // ---------- missed-question store (feeds Practice) ----------
  const missed = {
    all: () => store.get("nic.missed", []),
    add(k, ref) { const a = missed.all().filter((x) => x.k !== k); a.push({ k, ...ref }); store.set("nic.missed", a.slice(-60)); },
    drop(k) { store.set("nic.missed", missed.all().filter((x) => x.k !== k)); },
  };

  let S = null; // the one active session

  // =====================================================================
  //  Session building
  // =====================================================================
  function base(kind, opts) {
    return { kind, opts, i: 0, screens: [], life: N.lifecycle(), combo: 0, wrongRun: 0, xp: 0, start: Date.now(),
      answered: 0, firstRight: 0, firstTotal: 0, retries: {}, done: false, demoXP: false };
  }

  function lessonScreens(mod) {
    const L = N.LESSONS[mod.id] || { steps: [] };
    // each quick check gets its own screen straight after its step (like Duolingo), so the options are never below the fold
    const out = L.steps.flatMap((s, k) => [{ kind: "step", k, s, Q: null, key: `read:${mod.id}:${k}` }]
      .concat(s.c ? [{ kind: "q", check: true, k, Q: { type: "mcq", q: s.c.q, o: s.c.o, a: s.c.a, why: s.c.why || "" }, key: `step:${mod.id}:${k}` }] : []));
    // lift the demo, predicts and takeaways out of the module's own page
    const holder = el(`<div class="pl-holder" aria-hidden="true"></div>`);
    document.body.appendChild(holder);
    const page = el(`<div class="page pl-demo"></div>`);
    holder.appendChild(page);
    try { mod.render(page, S.life); } catch (e) { console.error("[player] render failed", mod.id, e); page.innerHTML = `<div class="callout rose">This demo failed to load: ${e.message}</div>`; }
    const head = qs("header", page); if (head) head.remove();
    const preds = qsa(".predict", page).filter((n) => n.__opts);
    preds.forEach((n) => n.remove());
    const tk = qs(".takeaways", page); if (tk) tk.remove();
    S.demo = page; S.holder = holder;
    const hasDemo = page.children.length > 0;
    if (hasDemo || L.guide) out.push({ kind: "try", guide: mod.workshop ? null : L.guide, workshop: !!mod.workshop });
    preds.forEach((n) => { const o = n.__opts; out.push({ kind: "q", Q: { type: "mcq", q: o.q, o: o.opts, a: o.a, why: o.why || "" }, key: `pred:${o.id}`, pred: o.id }); });
    S.recap = tk;
    return out;
  }

  function open(mod, opts = {}) {
    if (S) close(true);
    const boss = mod.num === "Boss" && N.bossDef && N.bossDef(mod.id);
    S = base(boss ? "boss" : "lesson", opts);
    S.mod = mod; S.who = (N.cast && N.cast.who(opts.who)) || "sprout";
    S.review = !boss && !!store.get("nic.lessonDone", {})[mod.id];
    mount(boss ? "Boss" : mod.num);
    if (boss) bossSession(mod, boss);
    else {
      S.screens = lessonScreens(mod);
      const pos = store.get("nic.lessonPos", {})[mod.id] || 0;
      S.i = pos > 0 && pos < S.screens.length ? pos : 0;
      if (S.i > 0 && fx()) setTimeout(() => fx().toast(`<b>Welcome back!</b><span>Picked up where you left off. "Start over" is in the lesson's popover.</span>`, { tone: "blue", ms: 2600, live: true }), 400);
    }
    if (!S.screens.length) S.screens.push({ kind: "note", t: "Nothing here yet", b: "This module has no lesson steps." });
    const v = store.get("nic.visited", {}); v[mod.id] = true; store.set("nic.visited", v);
    sound("whoosh");
    show(0);
  }

  function bossSession(mod, B) {
    const key = (i) => `${B.id}-${i}`, st = store.get("nic.quiz", {});
    let todo = B.qs.map((_, i) => i).filter((i) => !(key(i) in st && typeof st[key(i)] === "object"));
    S.boss = B;
    if (!todo.length) { S.screens = [{ kind: "bossResult" }]; return; }
    if (todo.length === B.qs.length) S.screens.push({ kind: "bossIntro" });
    todo.forEach((i) => S.screens.push({ kind: "q", Q: B.qs[i], key: `boss:${B.id}:${i}`, bossIdx: i, idKey: key(i) }));
    S.screens.push({ kind: "bossResult" });
    if (B.matrix || B.aside) S.refHTML = `${B.matrix ? `<h3>Distance matrix</h3><div style="max-width:360px">${N.matrixHTML()}</div>` : ""}${B.aside || ""}`;
  }

  function practice(opts = {}) {
    if (N.content && !N.content.allLoaded()) { N.content.all().then(() => practice(opts)); return; } // it draws on every finished course
    if (S) close(true);
    S = base("practice", opts);
    S.who = "berry"; S.mod = { id: "practice", num: "Practice", title: "Practice" };
    mount("Practice");
    const items = [];
    missed.all().slice().reverse().forEach((m) => {
      if (items.length >= 6) return;
      if (m.boss) { const B = N.bossDef && N.bossDef(m.boss); const Q = B && B.qs[m.i]; if (Q) items.push({ kind: "q", Q, key: m.k, practice: true, idKey: `${m.boss}-${m.i}` }); }
      else if (m.Q) items.push({ kind: "q", Q: m.Q, key: m.k, practice: true });
    });
    const done = store.get("nic.lessonDone", {});
    const pool = [];
    N.modules.filter((m) => done[m.id] && N.LESSONS[m.id]).forEach((m) => N.LESSONS[m.id].steps.forEach((s, k) => { if (s.c) pool.push({ kind: "q", Q: { type: "mcq", q: s.c.q, o: s.c.o, a: s.c.a, why: s.c.why || "" }, key: `step:${m.id}:${k}`, practice: true }); }));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    while (items.length < 8 && pool.length) { const p = pool.pop(); if (!items.some((x) => x.key === p.key)) items.push(p); }
    S.screens = items.length ? [{ kind: "practiceIntro", n: items.length, fixes: Math.min(6, missed.all().length) }, ...items]
      : [{ kind: "note", who: "berry", mood: "sleepy", t: "Nothing to practise yet", b: "Finish a lesson first. Anything you get wrong lands here so you can fix it later." }];
    sound("whoosh");
    show(0);
  }

  // A revision round survives a refresh or a quit: the deck (question ids), how many are answered and the score live in localStorage
  // (csl.revSession, per device). Finishing clears it; quitting only pauses it, so the Revise page offers "Continue".
  const REV_KEY = "csl.revSession";
  const revSaved = () => { try { const r = JSON.parse(localStorage.getItem(REV_KEY)); return r && Array.isArray(r.ids) && r.ids.length ? r : null; } catch { return null; } };
  const revWrite = (r) => { try { r ? localStorage.setItem(REV_KEY, JSON.stringify(r)) : localStorage.removeItem(REV_KEY); } catch { /* storage blocked: the round just can't be resumed */ } };
  const revSave = () => { if (S && S.kind === "revise" && S.revIds) revWrite({ ids: S.revIds, t: S.start, done: S.firstTotal, right: S.firstRight, wrong: S.revWrong || [], xp: S.xp, paused: false, opts: { n: S.opts.n, subjects: S.opts.subjects || null, home: S.opts.home } }); };

  /** A finished round goes into the history on the Revise page (nic.revRounds, synced: one entry per round, keyed by its start time). */
  function revLog() {
    if (!S || !S.revIds || !S.revIds.length || !S.firstTotal) return;
    const h = store.get("nic.revRounds", {});
    h[S.start] = { n: S.revIds.length, right: S.firstRight, ids: S.revIds, wrong: S.revWrong || [], mods: new Set(S.screens.filter((x) => x.revId).map((x) => x.mod)).size, end: Date.now() };
    store.set("nic.revRounds", h);
  }

  function revise(opts = {}) {
    if (N.bank && !N.bank.loaded()) { N.bank.load().then(() => revise(opts), (e) => console.error(e)); return; } // question lists load on demand
    if (S) close(true);
    S = base("revise", opts);
    S.who = opts.who || "chip"; S.mod = { id: "revise", num: "Revise", title: "Revision" };
    mount("Revise");
    let deck = [], saved = null;
    if (opts.resume && (saved = revSaved()) && N.bank) {
      const byId = new Map(N.bank.all({ learnedOnly: false }).map((x) => [x.id, x]));
      deck = saved.ids.map((id) => byId.get(id)).filter(Boolean);
      if (deck.length !== saved.ids.length) { saved = null; deck = []; } // the bank changed under it: start fresh below
    }
    if (!deck.length && opts.ids && N.bank) { // redo a past round: the same questions again
      const byId = new Map(N.bank.all({ learnedOnly: false }).map((x) => [x.id, x]));
      deck = opts.ids.map((id) => byId.get(id)).filter(Boolean);
    }
    if (!deck.length) deck = N.bank ? N.bank.deck({ n: opts.n || 10, subjects: opts.subjects || null }) : [];
    S.revIds = deck.map((d) => d.id);
    const title = (id) => { const m = N.modules.find((x) => x.id === id); return m ? `${m.num === "Boss" ? "Boss" : m.num} · ${stripTags(m.title)}` : ""; };
    S.screens = deck.length
      ? [{ kind: "reviseIntro", n: deck.length, mods: new Set(deck.map((d) => d.mod)).size }, ...deck.map((d) => ({ kind: "q", Q: d.Q, key: `rev:${d.id}`, revId: d.id, revTag: title(d.mod), mod: d.mod, practice: true }))]
      : [{ kind: "note", who: "chip", mood: "sleepy", t: "Nothing to revise yet", b: "Finish a lesson first. Its questions join your revision deck." }];
    if (saved) {
      S.firstTotal = Math.min(saved.done || 0, deck.length); S.firstRight = Math.min(saved.right || 0, S.firstTotal); S.xp = saved.xp || 0; if (saved.t) S.start = saved.t; S.revWrong = saved.wrong || [];
      S.i = S.firstTotal ? 1 + S.firstTotal : 0; // already answered ones are skipped, the intro only shows for a fresh round
      if (S.i >= S.screens.length) { revWrite(null); S.i = 0; S.firstTotal = S.firstRight = S.xp = 0; }
      else if (S.firstTotal && fx()) setTimeout(() => fx().toast(`<b>Welcome back!</b><span>Question ${S.firstTotal + 1} of ${deck.length}. Your round was saved.</span>`, { tone: "blue", ms: 2600, live: true }), 400);
    }
    revSave();
    sound("whoosh");
    show(0);
  }

  // =====================================================================
  //  Shell
  // =====================================================================
  const webdriver = () => !!navigator.webdriver; // tools/*.js click straight through: no Continue guard, no sheet exit

  function mount(chip) {
    // the path sets NIC.player.originRect (the tapped node) just before the hash change; opts.from works too
    const from = S.opts.from || N.player.originRect || null;
    N.player.originRect = null;
    const root = el(`<div class="player" role="dialog" aria-modal="true" aria-label="${stripTags(S.mod.title)}">
      <header class="pl-top"><button class="pl-x" aria-label="Quit lesson">${IC.x}</button><button class="pl-x pl-back" aria-label="Previous screen" title="Back" hidden>${IC.back}</button>
        <div class="pl-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span class="pl-fill"></span><span class="pl-combo"></span></div>
        <span class="pl-retry" hidden title="Mistakes to fix">${IC.retry}<b>0</b></span>
        <span class="pl-chip">${chip}</span><button class="pl-ref" hidden title="Reference">${IC.book}</button></header>
      <div class="pl-stage"></div>
      <footer class="pl-foot"><div class="pl-foot-in"><div class="pl-fb" aria-live="polite"></div><div class="pl-actions"><button class="btn big primary pl-go">Continue</button></div></div></footer>
      <div class="pl-modal" hidden></div><div class="pl-drawer" hidden></div></div>`);
    document.body.appendChild(root);
    document.body.classList.add("in-lesson");
    N.shield(true);
    S.root = root; S.stage = qs(".pl-stage", root); S.foot = qs(".pl-foot", root); S.go = qs(".pl-go", root);
    S.go.addEventListener("click", onGoClick);
    qs(".pl-x", root).addEventListener("click", askQuit);
    qs(".pl-back", root).addEventListener("click", goBack);
    const ref = qs(".pl-ref", root), drawer = qs(".pl-drawer", root);
    const closeDrawer = () => {
      if (drawer.hidden || drawer.classList.contains("m-ghost")) return;
      drawer.classList.add("m-ghost"); // no pointer events while it leaves
      (fx() && fx().exit ? fx().exit(drawer, { y: -6, scale: 0.98, dur: fx().DUR.s }) : Promise.resolve()).then(() => {
        const clear = () => { drawer.style.opacity = ""; drawer.style.transform = ""; };
        drawer.hidden = true; drawer.classList.remove("m-ghost"); clear(); requestAnimationFrame(() => setTimeout(clear, 0)); // Motion can write its last frame late
      });
    };
    ref.addEventListener("click", () => {
      if (!drawer.hidden && !drawer.classList.contains("m-ghost")) return closeDrawer();
      drawer.classList.remove("m-ghost"); drawer.style.opacity = ""; drawer.style.transform = "";
      drawer.hidden = false; if (fx()) fx().reveal(drawer);
    });
    // a tap anywhere outside the drawer (and its button) closes it
    root.addEventListener("pointerdown", (e) => { if (!drawer.hidden && !drawer.contains(e.target) && !ref.contains(e.target)) closeDrawer(); });
    S.keys = (e) => onKey(e);
    document.addEventListener("keydown", S.keys);
    if (fx() && fx().ok) {
      const F = fx();
      if (reduce()) F.clean(root, F.animate(root, { opacity: [0, 1] }, { duration: F.DUR.m, ease: F.EASE }), ["opacity"]);
      else if (from && from.width) {
        // grow out of the tapped path node
        root.style.transformOrigin = `${from.left + from.width / 2}px ${from.top + from.height / 2}px`;
        F.clean(root, F.animate(root, { opacity: [0, 1], transform: ["scale(0.9)", "scale(1)"] }, F.SPRING_UI), ["transform", "opacity", "transformOrigin"]);
      } else F.clean(root, F.animate(root, { opacity: [0, 1], transform: ["translateY(40px)", "translateY(0px)"] }, { duration: F.DUR.l, ease: F.EASE }));
    }
    if (fx() && fx().preloadLottie) fx().preloadLottie();
    S.stopIdle = N.cast ? N.cast.idle(root) : () => {};
    if (fx()) S.life.onCleanup(fx().watchStats(root));
  }

  // screens that count towards the bar: the main run (plus the recap), not the mistakes round or the payoff
  const MAIN = (x) => !x.retry && !["mistakes", "complete", "streak", "hype"].includes(x.kind);

  function progress() {
    // the denominator is fixed when the session starts (S.total), so queued retries never pull the bar back
    if (!S.total) S.total = Math.max(1, S.screens.filter(MAIN).length + (S.kind === "lesson" && S.recap ? 1 : 0)); // + the recap finish() adds
    const total = S.total;
    const sc = S.screens[S.i] || {};
    const done = ["complete", "streak"].includes(sc.kind) ? total : S.screens.slice(0, S.i).filter(MAIN).length;
    const f = Math.max(S.barF || 0, Math.min(1, done / total));
    const fill = qs(".pl-fill", S.root), bar = qs(".pl-bar", S.root);
    fill.style.transform = `scaleX(${f})`;
    bar.setAttribute("aria-valuenow", Math.round(f * 100));
    // the mistakes round is its own state: the bar holds and turns orange (css/motion-player.css)
    bar.classList.toggle("retry", !!sc.retry || sc.kind === "mistakes");
    // moving forward sweeps a shine across the fill (css/motion.css .m-shine)
    if (f > (S.barF || 0)) { bar.classList.remove("m-shine"); void bar.offsetWidth; bar.classList.add("m-shine"); }
    S.barF = f;
    retryChip(false);
  }

  /** Mistakes still to fix (queued retries not yet passed). Bumps when a wrong answer adds one. */
  function retryChip(bump) {
    const chip = qs(".pl-retry", S.root); if (!chip) return;
    const n = S.screens.filter((x, j) => x.retry && j > S.i).length + (S.screens[S.i] && S.screens[S.i].retry && !S.graded ? 1 : 0);
    qs("b", chip).textContent = n;
    const was = chip.hidden;
    chip.hidden = !n;
    if (!n || !fx()) return;
    if (was) fx().springIn(chip, { from: 0.4, bounce: 0.5, dur: 0.4 });
    else if (bump) fx().bump(chip, { scale: 1.3, y: -3 });
  }

  function combo(prev = 0) {
    const c = qs(".pl-combo", S.root), F = fx(), anim = F && F.ok && !reduce();
    qs(".pl-bar", S.root).classList.toggle("hot", S.combo >= 5);
    clearTimeout(S.comboT);
    const clear = () => { c.style.transform = ""; c.style.opacity = ""; };
    if (S.combo >= 3) {
      c.textContent = `${S.combo} IN A ROW`;
      c.classList.remove("mini"); c.classList.add("on"); clear();
      if (anim) F.clean(c, F.animate(c, { transform: ["translate(-50%, 6px) scale(0.6)", "translate(-50%, 0px) scale(1)"] }, F.SPRING_POP), ["transform"]);
      if (S.combo === 3 || S.combo === 5 || S.combo % 10 === 0) sound("streak");
      if (S.combo === 5 || S.combo % 10 === 0) setTimeout(() => fx() && fx().lottieAt(c, "combo", { size: 96, dy: -6 }), 120);
    } else if (S.combo >= 1) {
      // 1–2 in a row: a small "+1" pops over the bar and fades
      c.textContent = "+1";
      c.classList.add("on", "mini"); clear();
      if (anim) F.clean(c, F.animate(c, { transform: ["translate(-50%, 6px) scale(0.5)", "translate(-50%, 0px) scale(1)"] }, F.SPRING_POP), ["transform"]);
      S.comboT = setTimeout(() => c.classList.remove("on"), 900);
    } else if (prev >= 3 && c.classList.contains("on") && anim && F.exit) {
      // the combo broke: the chip drops and fades
      F.exit(c, { y: 10, scale: 0.9, base: "translate(-50%, 0px)", dur: F.DUR.m }).then(() => {
        if (S && S.combo === 0) { c.classList.remove("on", "mini"); clear(); requestAnimationFrame(() => setTimeout(clear, 0)); }
      });
    } else c.classList.remove("on", "mini");
  }

  /** CONTINUE / CHECK. A green or red sheet slides away first; presses right after it lands are ignored. */
  function onGoClick() {
    if (!S || S.go.disabled || !S.onGo || S.leavingSheet) return;
    const t = performance.now();
    if (t < (S.lockUntil || 0) && !webdriver()) return;
    const go = S.onGo, s = S, inner = qs(".pl-foot-in", S.foot);
    const sheet = /\bf-(ok|no)\b/.test(S.foot.className);
    if (sheet || /\bf-continue\b/.test(S.foot.className)) sound("step"); // Check is followed by correct/wrong instead
    if (!sheet || S.kbd || webdriver() || !fx() || !fx().ok || !fx().exit) return go();
    S.leavingSheet = true;
    const F = fx();
    F.exit(inner, { y: reduce() ? 0 : Math.min(inner.offsetHeight, 160), scale: 1, dur: F.DUR.s }).then(() => {
      if (S !== s) return;
      S.leavingSheet = false;
      const clear = () => { inner.style.transform = ""; inner.style.opacity = ""; };
      go(); clear(); requestAnimationFrame(() => setTimeout(clear, 0));
    });
  }

  /** Footer: mode = continue | check | ok | no | hidden */
  function foot(mode, { label, onGo, fb = "", enabled = true, danger = false } = {}) {
    if (S.go) S.go.classList.remove("pl-go-blue");
    const sheet = mode === "ok" || mode === "no";
    // the green/red sheet overlays the stage instead of growing the footer, so the stage keeps its height
    const footH = sheet ? S.foot.offsetHeight : 0;
    S.foot.className = `pl-foot f-${mode}${sheet ? " f-sheet" : ""}`;
    if (sheet) S.foot.style.setProperty("--pl-foot-h", `${footH}px`); else S.foot.style.removeProperty("--pl-foot-h");
    const fbEl = qs(".pl-fb", S.foot);
    fbEl.innerHTML = fb;
    S.go.textContent = label || (mode === "check" ? "Check" : mode === "no" ? "Got it" : "Continue");
    S.go.disabled = !enabled;
    S.go.className = `btn big pl-go ${mode === "no" || danger ? "rose" : "primary"}`;
    S.onGo = onGo;
    const inner = qs(".pl-foot-in", S.foot);
    // pad the stage by the overlap, so what the sheet covers can still be scrolled into view
    S.stage.style.setProperty("--pl-sheet-pad", sheet ? `${Math.max(0, inner.offsetHeight - footH)}px` : "0px");
    S.sheetMs = 0;
    if (sheet) { const sk = qs(".pl-skip", S.foot); if (sk) sk.remove(); } // answered: nothing left to skip
    if (sheet) S.lockUntil = performance.now() + 250;
    if (sheet && fx() && fx().ok && !S.kbd) {
      const F = fx();
      S.sheetMs = F.DUR.m * 1000;
      S.lockUntil = performance.now() + S.sheetMs + 250;
      F.clean(inner, F.animate(inner, reduce() ? { opacity: [0, 1] } : { transform: ["translateY(100%)", "translateY(0%)"] }, { duration: F.DUR.m, ease: F.EASE }));
      // the verdict icon pops, the title slides in beside it, the +XP chip lands last
      if (!reduce() && fx().springIn) {
        fx().springIn(qs(".pl-fb-h svg", fbEl), { from: 0.2, rot: mode === "ok" ? -45 : 45, bounce: 0.55, dur: 0.5, delay: 0.1 });
        fx().enter(qs(".pl-fb-h b", fbEl), { x: -12, y: 0, delay: 0.14, dur: 0.24 });
        fx().springIn(qs(".pl-xp", fbEl), { from: 0.4, bounce: 0.6, dur: 0.45, delay: 0.26 });
      }
      const m = qs(".mascot", fbEl); if (m) setTimeout(() => N.mascotReact(m, m.dataset.mood), 120);
    }
  }

  /** Workshop screen: the module's no-code lab fills the page; missions award XP, Continue is always available. */
  function workshopScreen(node, sc) {
    node.innerHTML = `<div class="pl-in pl-try pl-wk"><div class="pl-try-head"><div><div class="pl-tag violet">Workshop</div><h1>${S.mod.title.replace(/^Workshop:\s*(.)/, (_, c) => c.toUpperCase())}</h1></div></div><div class="pl-try-demo"></div></div>`;
    qs(".pl-try-demo", node).appendChild(S.demo);
    if (S.holder) { S.holder.remove(); S.holder = null; }
    setTimeout(() => window.dispatchEvent(new Event("nic:resize")), 60);
    const wk = qs(".wk", node);
    if (wk && wk.classList.contains("wk-code")) node.classList.add("xwide");
    const say = () => foot("continue", { label: "Skip for now", onGo: next, fb: `<span class="faint">Finish the missions for XP, or skip and come back.</span>` });
    say();
    if (!wk) return;
    wk.addEventListener("nic:wk-mission", (e) => { if (!S) return; S.xp += 8; });
    wk.addEventListener("nic:wk-done", () => {
      if (!S || S.demoXP) return; S.demoXP = true; S.xp += 10; game().track("demo");
      foot("continue", { onGo: next, fb: `<div class="pl-fb-row">${N.mascot({ who: "chip", size: 52, mood: "love" })}<b>Workshop complete! Bonus +10 XP</b></div>` });
    });
  }

  // =====================================================================
  //  Screens
  // =====================================================================
  function show(dir = 1) {
    const sc = S.screens[S.i];
    const oldSkip = S.foot && qs(".pl-skip", S.foot); if (oldSkip) oldSkip.remove();
    if (!sc) return finish();
    if (sc.kind === "bossResult" && S.answered) {
      const B = S.boss, st = store.get("nic.quiz", {}), n = B.qs.length, c = B.qs.filter((_, i) => st[`${B.id}-${i}`] && st[`${B.id}-${i}`].ok).length;
      S.bossPct = c / n; S.bossScore = `${c}/${n}`;
      if (c === n) { game().unlock("perfect"); S.bossPerfect = true; S.i++; return finish(); } // nothing to review: go straight to the payoff
    }
    if (S.kind === "lesson" && !["complete", "streak"].includes(sc.kind)) { const p = store.get("nic.lessonPos", {}); p[S.mod.id] = S.i; store.set("nic.lessonPos", p); }
    qsa(".pl-screen.leaving", S.stage).forEach((x) => x.remove());
    const old = qs(".pl-screen", S.stage);
    const node = el(`<div class="pl-screen" data-kind="${sc.kind}"></div>`);
    const F = fx(), anim = !!(F && F.ok && dir);
    if (old) {
      if (anim && !reduce() && F.exit) {
        // pin the leaving screen where it is on screen before the stage scrolls back to the top
        const y = S.stage.scrollTop;
        old.classList.add("leaving");
        old.style.top = `${-y}px`;
        F.exit(old, { x: -24 * dir, scale: 1, dur: F.DUR.s }).then(() => old.remove());
      } else old.remove();
    }
    S.stage.appendChild(node);
    S.stage.scrollTop = 0;
    S.graded = false;
    const bk = qs(".pl-back", S.root); if (bk) bk.hidden = prevIdx() < 0;
    qs(".pl-ref", S.root).hidden = !S.refHTML;
    if (S.refHTML) qs(".pl-drawer", S.root).innerHTML = S.refHTML;
    progress();
    (RENDER[sc.kind] || RENDER.note)(node, sc);
    node.setAttribute("tabindex", "-1"); node.focus({ preventScroll: true }); // Tab starts inside the new screen
    const vis = qs(".lesson-visual", node);
    // two layers at most: the screen slides in, then either its figure draws itself or its blocks rise
    const draws = !!(vis && qs(".draw, .fi", vis));
    if (anim) {
      F.clean(node, F.animate(node, reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: [`translateX(${24 * dir}px)`, "translateX(0px)"] }, { duration: F.DUR.m, delay: old && !reduce() ? F.DUR.xs : 0, ease: F.EASE }));
      if (!reduce() && !draws) qsa(".pl-in > *", node).forEach((p, k) => F.clean(p, F.animate(p, { opacity: [0, 1], transform: ["translateY(10px)", "translateY(0px)"] }, { duration: F.DUR.m, delay: F.DUR.xs + k * 0.04, ease: F.EASE })));
    }
    if (vis && F && !S.kbd) F.play(vis); // keyboard moves don't animate
  }
  const next = () => {
    S.i++;
    while (S.screens[S.i] && S.screens[S.i].kind === "q" && !S.screens[S.i].retry && S.gradedKeys && S.gradedKeys.has(S.screens[S.i].key)) S.i++;
    show(S.kbd ? 0 : 1);
  };

  /** Every question screen brings the material it depends on, because it no longer sits under it:
      - a lesson quick check (also in Practice and Revise): its step's figure `v` and any table/figure in the step text
      - a boss question (also in Practice and Revise): the boss's reference card (distance matrix, aside)
      - a predict: the live demo from the Try-it screen
      The card is open when the question points at it ("using the table…", a tour like ABDCE, the demo), otherwise
      it is a tap-to-open card, so the options stay on screen. */
  const REFERS = /\b(table|graph|chart|figure|diagram|plot|matrix|picture|curve|grid|map|above|below|shown|drawn|from the|demo|highlighted|dashed|round trip|tour|length of|distance)\b|[A-Z]\s*(→|->)\s*[A-Z]|\b[A-H]{4,}\b/i;
  function stepOf(sc) {
    if (sc.check && S.mod) return { mod: S.mod.id, k: sc.k };
    const m = /^step:(.+):(\d+)$/.exec(sc.key || "");
    if (m) return { mod: m[1], k: +m[2] };
    if (sc.Q && sc.Q.step != null && sc.mod) return { mod: sc.mod, k: sc.Q.step };
    return null;
  }
  function bossOf(sc) {
    const id = S.kind === "boss" && S.boss ? S.boss.id : sc.idKey ? String(sc.idKey).replace(/-\d+$/, "") : sc.mod;
    const B = id && N.bossDef && N.bossDef(id);
    return B && (B.matrix || B.aside) ? B : null;
  }
  function contextCard(node, sc) {
    const q = stripTags((sc.Q && sc.Q.q) || "");
    let title = "", fill = null, open = false, demo = false; // reference dropdowns always start closed
    const st = stepOf(sc), B = st ? null : bossOf(sc);
    if (st) {
      const s = ((N.LESSONS[st.mod] || {}).steps || [])[st.k];
      if (!s) return;
      const tmp = el(`<div>${s.b || ""}</div>`);
      const fromBody = qsa("table, .fig, svg, pre", tmp).filter((x) => !x.parentElement.closest("table, .fig, svg, pre"));
      if (!s.v && !fromBody.length) return;
      title = `From ${st.mod === (S.mod && S.mod.id) ? `step ${st.k + 1}` : "the lesson"}: ${stripTags(s.t)}`;
      fill = (vis) => {
        fromBody.forEach((x) => vis.appendChild(x));
        if (typeof s.v === "function") { const d = el(`<div></div>`); vis.appendChild(d); try { s.v(d, S.life); } catch (e) { console.error(e); } }
        else if (s.v) vis.insertAdjacentHTML("beforeend", s.v);
      };
    } else if (B) {
      title = B.matrix ? "Distance matrix" : "Reference";
      fill = (vis) => { vis.innerHTML = `${B.matrix ? `<div style="max-width:360px">${N.matrixHTML()}</div>` : ""}${B.aside || ""}`; };
    } else if (sc.pred && S.demo) {
      title = "The demo"; demo = true;
      fill = (vis) => vis.appendChild(S.demo); // the live demo moves here (the Try-it screen takes it back if you return)
    } else return;
    const box = el(`<details class="pl-look${demo ? " pl-look-demo" : ""}"${open ? " open" : ""}><summary>${IC.book}<span>${title}</span><i class="pl-look-car" aria-hidden="true"></i></summary><div class="pl-look-in lesson-visual"></div></details>`);
    const vis = qs(".pl-look-in", box);
    fill(vis);
    qs(".pl-quiz", node).insertBefore(box, qs(".pl-qwrap", node));
    const resize = () => setTimeout(() => window.dispatchEvent(new Event("nic:resize")), 30);
    if (open) resize();
    box.addEventListener("toggle", () => { sound(box.open ? "pop" : "tap"); if (box.open) { if (fx()) fx().reveal(vis); resize(); } });
  }

  /** Back: the nearest earlier teaching screen (steps, notes, try-its, intros). Questions, retries and end screens are
      skipped, so going back reviews the material without re-answering; Continue then walks forward again. */
  const NO_BACK = ["q", "complete", "streak", "hype", "mistakes", "bossResult"];
  function prevIdx() {
    // lessons only: boss quizzes, Practice and Revise are tests, so there is no going back to change an answer
    if (!S || S.kind !== "lesson" || NO_BACK.slice(1).includes((S.screens[S.i] || {}).kind)) return -1;
    for (let j = S.i - 1; j >= 0; j--) { const x = S.screens[j]; if (x && !x.retry && !NO_BACK.includes(x.kind)) return j; }
    return -1;
  }
  function goBack() {
    if (!S || S.leavingSheet) return;
    const j = prevIdx(); if (j < 0) return;
    sound("back");
    S.i = j; show(S.kbd ? 0 : -1);
  }
  const goldRect = () => { const c = S && qs(".pd-card.c-gold", S.stage); return c ? c.getBoundingClientRect() : null; };

  const presenter = (html, mood = "idle", who = S.who) => `<div class="pl-ask">${N.mascot({ who, size: 88, mood, cls: "pl-presenter" })}<div class="bubble pl-prompt">${html}</div></div>`;

  const RENDER = {
    step(node, sc) {
      const s = sc.s, L = N.LESSONS[S.mod.id];
      node.innerHTML = `<div class="pl-in pl-read">
        <div class="lesson-step-n">Step ${sc.k + 1} of ${L.steps.length}</div>
        <h1 class="lesson-title">${s.t}</h1>
        <div class="lesson-body">${s.b}</div>
        <div class="lesson-visual"></div>
        ${sc.Q ? `<div class="pl-qwrap"></div>` : ""}</div>`;
      const vis = qs(".lesson-visual", node);
      if (typeof s.v === "function") { try { s.v(vis, S.life); } catch (e) { console.error(e); } } else if (s.v) vis.innerHTML = s.v;
      if (sc.Q) { askQ(qs(".pl-qwrap", node), sc, { compact: true }); }
      else foot("continue", { onGo: next });
    },
    q(node, sc) {
      node.innerHTML = `<div class="pl-in pl-quiz">${sc.retry ? `<div class="pl-tag orange pl-prev">${IC.retry}Previous mistake</div>` : sc.revTag ? `<div class="pl-tag blue">${sc.revTag}</div>` : sc.practice ? `<div class="pl-tag violet">Practice</div>` : sc.pred ? `<div class="pl-tag violet">Predict first</div>` : sc.check ? `<div class="pl-tag green">Quick check</div>` : S.kind === "boss" ? `<div class="pl-tag orange">Question ${sc.bossIdx + 1} of ${S.boss.qs.length}</div>` : ""}<div class="pl-qwrap"></div></div>`;
      contextCard(node, sc);
      askQ(qs(".pl-qwrap", node), sc, {});
      if (sc.retry) addSkip();
      if (sc.revId && studyTarget(sc.mod)) {
        const b = el(`<div class="pl-study"><button class="btn small ghost" data-study>${IC.book}<span>Don't know this? Study it, then come back</span></button></div>`);
        qs(".pl-in", node).appendChild(b);
        qs("[data-study]", b).onclick = () => studyThenReturn(sc);
      }
    },
    try(node, sc) {
      node.classList.add("wide");
      if (sc.workshop) return workshopScreen(node, sc);
      node.innerHTML = `<div class="pl-in pl-try"><div class="pl-try-head">${N.mascot({ who: S.who, size: 64, act: "wave" })}<div><div class="pl-tag orange">Try it yourself</div><h1>See it working</h1></div></div>
        <div class="pl-try-grid"><div class="pl-try-demo"></div>${sc.guide ? `<aside class="pl-try-side"></aside>` : ""}</div></div>`;
      qs(".pl-try-demo", node).appendChild(S.demo);
      if (S.holder) { S.holder.remove(); S.holder = null; }
      setTimeout(() => window.dispatchEvent(new Event("nic:resize")), 60);
      if (sc.guide) {
        const g = N.guide(sc.guide);
        g.removeAttribute("id");
        qs(".pl-try-side", node).appendChild(g);
        // phones: the checklist is a sticky chip above the demo; tap it to open
        const head = qs(".card-head", g);
        head.setAttribute("role", "button"); head.setAttribute("tabindex", "0");
        head.addEventListener("click", () => g.classList.toggle("open"));
        // pressing a demo button ticks the step that names it in bold ("Press <b>Run</b>…")
        const items = qsa(".guide-item", g).map((b) => ({ b, keys: qsa("b", b).map((x) => x.textContent.trim().toLowerCase()).filter(Boolean) }));
        qs(".pl-try-demo", node).addEventListener("click", (e) => {
          const btn = e.target.closest("button, input[type=checkbox], input[type=range], select"); if (!btn) return;
          const label = (btn.textContent || btn.getAttribute("aria-label") || (btn.closest("label") && btn.closest("label").textContent) || "").trim().toLowerCase();
          if (!label) return;
          const hit = items.find((it) => !it.b.classList.contains("done") && it.keys.some((k) => k.length > 1 && (label === k || label.includes(k) || k.includes(label))));
          if (hit) S.life.timeout(() => { if (S && hit.b.isConnected) hit.b.click(); }, 250);
        }, true);
        g.addEventListener("nic:guide-done", () => {
          if (!S || S.demoXP) return; S.demoXP = true; S.xp += 5;
          game().track("demo");
          if (fx()) fx().floatText(qs(".guide-count", g) || g, "+5 XP", "#ff9600");
          foot("continue", { onGo: next, fb: `<div class="pl-fb-row">${N.mascot({ who: "chip", size: 52, mood: "love" })}<b>Demo complete! +5 XP</b></div>` });
        });
      }
      foot("continue", { onGo: next, fb: sc.guide ? `<span class="faint">Tick the list as you go, then continue.</span>` : "" });
    },
    recap(node) {
      node.innerHTML = `<div class="pl-in pl-read">${presenter("Here's what to remember.", "happy")}<div class="pl-recap"></div></div>`;
      qs(".pl-recap", node).appendChild(S.recap);
      foot("continue", { onGo: next });
    },
    mistakes(node) {
      node.innerHTML = `<div class="pl-in pl-center">${N.mascot({ who: "berry", size: 150, mood: "determined", acc: ["detective", "monocle"] })}<h1>Let's fix your mistakes</h1><p class="lede">A second go makes it stick.</p></div>`;
      sound("pop");
      foot("continue", { onGo: next });
    },
    bossIntro(node) {
      const B = S.boss, kinds = [...new Set(B.qs.map((Q) => T()[Q.type || "mcq"].label))];
      node.innerHTML = `<div class="pl-in pl-center">${N.mascot({ who: S.who, size: 150, mood: "determined", acc: ["crown"], act: "dance" })}
        <div class="pl-tag orange">Boss quiz</div><h1>${S.mod.title}</h1><p class="lede">${B.lede || ""}</p>
        <div class="pl-kinds">${B.qs.length} questions · ${kinds.join(" · ")}</div>${S.refHTML ? `<div class="card pl-ref-card">${S.refHTML}</div>` : ""}</div>`;
      foot("continue", { label: "Start", onGo: next });
    },
    hype(node, sc) {
      const pal = ["sprout", "pebble", "byte", "blaze", "chip", "berry"].filter((w) => w !== S.who);
      const buddy = pal[(sc.n / 5) % pal.length | 0];
      const lines = [["That's " + sc.n + " in a row!", "I am SO proud of you!"], [sc.n + " in a row?!", "You're on fire today!"], ["Unstoppable!", sc.n + " right, no misses!"]][(sc.n / 5 - 1) % 3];
      node.innerHTML = `<div class="pl-in pl-center pl-hype">
        <div class="ph-stage">
          <div class="ph-who ph-a"><div class="bubble ph-bub">${lines[0]}</div>${N.mascot({ who: S.who, size: 150, mood: "laugh", act: "dance", acc: ["party"] })}</div>
          <div class="ph-who ph-b"><div class="bubble ph-bub">${lines[1]}</div>${N.mascot({ who: buddy, size: 130, mood: "love", act: "spin", acc: ["crown"] })}</div>
        </div></div>`;
      sound("streak");
      if (fx()) { const F = fx(); setTimeout(() => F.lottieAt(qs(".ph-stage", node), "combo", { size: 180, dy: -40 }), 150); if (F.ok && !reduce()) qsa(".ph-bub", node).forEach((b, k) => F.clean(b, F.animate(b, { opacity: [0, 1], transform: ["translateY(10px) scale(0.8)", "translateY(0px) scale(1)"] }, { ...F.SPRING_POP, delay: 0.2 + k * 0.35 }))); }
      foot("continue", { onGo: next });
    },
    reviseIntro(node, sc) {
      node.innerHTML = `<div class="pl-in pl-center">${N.mascot({ who: "chip", size: 150, mood: "determined", acc: ["propeller"], act: "dance" })}
        <div class="pl-tag blue">Revision</div><h1>${sc.n} mixed questions</h1><p class="lede">Shuffled from ${sc.mods} session${sc.mods === 1 ? "" : "s"} you've finished. Questions you miss come back sooner.</p></div>`;
      foot("continue", { label: "Start", onGo: next });
    },
    practiceIntro(node, sc) {
      node.innerHTML = `<div class="pl-in pl-center">${N.mascot({ who: "berry", size: 150, mood: "determined", acc: ["headphones"], act: "headbang" })}
        <div class="pl-tag violet">Practice</div><h1>${sc.n} quick questions</h1><p class="lede">${sc.fixes ? `${sc.fixes} of them are things you got wrong before.` : "A mixed refresh from the lessons you've finished."}</p></div>`;
      foot("continue", { label: "Start", onGo: next });
    },
    note(node, sc) {
      node.innerHTML = `<div class="pl-in pl-center">${N.mascot({ who: sc.who || S.who, size: 140, mood: sc.mood || "think" })}<h1>${sc.t || ""}</h1><p class="lede">${sc.b || ""}</p></div>`;
      foot("continue", { onGo: () => close() });
    },
    bossResult(node) {
      const B = S.boss, key = (i) => `${B.id}-${i}`, st = store.get("nic.quiz", {}), n = B.qs.length;
      const c = B.qs.filter((_, i) => st[key(i)] && st[key(i)].ok).length, pct = c / n;
      const miss = B.qs.map((Q, i) => [Q, i]).filter(([, i]) => st[key(i)] && !st[key(i)].ok);
      const msg = pct === 1 ? "Perfect. This one is locked in." : pct >= 0.8 ? "Pass! Skim the misses, then move on." : "Not yet. Review the misses and have another go.";
      const R = 54, L = 2 * Math.PI * R;
      node.innerHTML = `<div class="pl-in pl-center">
        <div class="pl-ring"><svg viewBox="0 0 140 140"><circle cx="70" cy="70" r="${R}" fill="none" stroke="var(--line)" stroke-width="14"/><circle class="ring-fg" cx="70" cy="70" r="${R}" fill="none" stroke="${pct >= 0.8 ? "#58cc02" : "#ff9600"}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L}" transform="rotate(-90 70 70)"/></svg>
          <div class="ring-n"><b id="brN">0</b><span>/ ${n}</span></div>${N.mascot({ who: S.who, size: 70, mood: "idle", acc: pct === 1 ? ["crown"] : [], cls: "ring-m" })}</div>
        <h1>${pct >= 0.8 ? "Boss beaten!" : "Boss still standing"}</h1><p class="lede">${msg}</p>
        ${miss.length ? `<div class="pl-miss">${miss.map(([Q, i]) => `<div class="pl-miss-row"><span class="pl-tag rose">Q${i + 1}</span><div><div>${Q.q}</div><div class="faint">Answer: <b>${T()[Q.type || "mcq"].answer(Q)}</b></div></div></div>`).join("")}</div>` : ""}
        <div class="controls pl-center-row">${miss.length ? `<button class="btn" data-retry="miss">Retry the ${miss.length} missed</button>` : ""}<button class="btn ghost" data-retry="all">Retry everything</button></div></div>`;
      const fg = qs(".ring-fg", node);
      if (fx() && fx().ok && !reduce()) fx().animate(fg, { strokeDashoffset: [L, L * (1 - pct)] }, { duration: 1, delay: 0.2, ease: fx().EASE }); else fg.setAttribute("stroke-dashoffset", L * (1 - pct));
      if (fx()) fx().count(qs("#brN", node), c, { from: 0, dur: 0.9 });
      setTimeout(() => N.mascotReact(qs(".ring-m", node), pct === 1 ? "love" : pct >= 0.8 ? "happy" : "sad"), 900);
      if (pct === 1 && fx()) setTimeout(() => fx().celebrate(qs(".pl-ring", node), { big: true }), 900);
      if (pct >= 0.8 && fx()) setTimeout(() => fx().lottieAt(qs(".pl-ring", node), "trophy", { size: 220 }), 1000);
      if (pct === 1) game().unlock("perfect");
      S.bossPct = pct;
      qsa("[data-retry]", node).forEach((b) => b.addEventListener("click", () => {
        const s2 = store.get("nic.quiz", {});
        (b.dataset.retry === "all" ? B.qs.map((_, i) => i) : miss.map(([, i]) => i)).forEach((i) => delete s2[key(i)]);
        store.set("nic.quiz", s2);
        const mod = S.mod, o = S.opts; close(true); open(mod, o);
      }));
      foot("continue", { onGo: () => { S.i++; finish(); } });
    },
    complete(node) {
      const acc = S.firstTotal ? S.firstRight / S.firstTotal : 1;
      const secs = Math.round((Date.now() - S.start) / 1000);
      const lessonXP = S.kind === "practice" || S.kind === "revise" ? 5 : S.kind === "boss" ? (S.bossPct >= 0.8 ? 20 : 5) : S.review ? 5 : 10;
      const total = S.xp + lessonXP;
      game().award(total, S.kind);
      const res = game().lessonDone({ acc, review: S.review, kind: S.kind });
      S.streakRes = res;
      const others = ["sprout", "pebble", "byte", "blaze", "chip", "berry"].filter((w) => w !== S.who);
      const hats = N.cast ? N.cast.HATS.slice().sort(() => Math.random() - 0.5) : [];
      const acts = ["dance", "juggle", "spin", "dance", "headbang"];
      const label = acc === 1 ? "Amazing" : acc >= 0.9 ? "Great" : acc >= 0.7 ? "Good" : "Keep going";
      node.innerHTML = `<div class="pl-in pl-center pl-done">
        <div class="pd-cast">${others.slice(0, 2).map((w, k) => N.mascot({ who: w, size: 78, mood: "happy", act: acts[k], acc: [hats[k]] })).join("")}
          ${N.mascot({ who: S.who, size: 150, mood: "laugh", act: "dance", acc: ["party"], cls: "pd-star" })}
          ${others.slice(2, 4).map((w, k) => N.mascot({ who: w, size: 78, mood: k ? "love" : "happy", act: acts[k + 2], acc: [hats[k + 2]] })).join("")}</div>
        <h1 class="pd-title">${S.kind === "practice" ? "Practice complete!" : S.kind === "revise" ? "Revision complete!" : S.kind === "boss" ? (S.bossPct >= 0.8 ? "Boss beaten!" : "Quiz complete!") : acc === 1 ? pickOne(["Learning legend!", "Flawless!", "Perfect lesson!"]) : acc >= 0.8 ? pickOne(["Lesson complete!", "Nicely done!", "Brain gains!"]) : "Lesson complete!"}</h1>
        ${S.kind === "boss" && S.bossScore ? `<div class="pd-boss">${S.bossPerfect ? "Perfect score" : "Score"}: <b>${S.bossScore}</b></div>` : ""}
        <div class="pd-cards">
          <div class="pd-card c-gold" data-xp="${total}"><b>Total XP</b><span>${IC.bolt}<i data-v="${total}">0</i></span></div>
          <div class="pd-card c-green"><b>${label}</b><span>${IC.target}<i data-v="${Math.round(acc * 100)}">0</i>%</span></div>
          <div class="pd-card c-blue"><b>${secs < 180 ? "Speedy" : "Time"}</b><span>${IC.clock}<i class="pd-time">${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</i></span></div>
        </div></div>`;
      sound("fanfare");
      if (fx()) setTimeout(() => fx().celebrate(qs(".pd-title", node), { big: true, silent: true }), 250);
      if (S.bossPerfect && fx()) setTimeout(() => fx().lottieAt(qs(".pd-star", node) || qs(".pd-title", node), "trophy", { size: 220 }), 700);
      S.xpTotal = total;
      qsa(".pd-card", node).forEach((card, k) => setTimeout(() => {
        const i = qs("i[data-v]", card), F = fx();
        if (!F || !F.ok) { card.style.opacity = 1; if (i) i.textContent = i.dataset.v; return; }
        if (i) F.count(i, +i.dataset.v, { from: 0, dur: 0.7 }); // count() sets the final value at once under reduced motion
        const shown = () => (card.style.opacity = 1); // .pd-card starts at opacity 0 in CSS, so opacity stays inline
        if (reduce()) { F.animate(card, { opacity: [0, 1] }, { duration: F.DUR.m }).finished.then(shown).catch(shown); return; } // fade only, no ticks
        let t = 0; const iv = setInterval(() => { sound("tick"); if (++t > 5) clearInterval(iv); }, 90);
        F.clean(card, F.animate(card, { transform: ["scale(0.7)", "scale(1)"], opacity: [0, 1] }, F.SPRING_POP), ["transform"]).finished.then(shown).catch(shown);
      }, reduce() ? 300 + k * 120 : 500 + k * 260));
      qs(".pl-combo", S.root).classList.remove("on", "mini");
      if (S.kind === "lesson") {
        const d = store.get("nic.lessonDone", {}); d[S.mod.id] = true; store.set("nic.lessonDone", d);
        const p = store.get("nic.lessonPos", {}); delete p[S.mod.id]; store.set("nic.lessonPos", p);
        window.dispatchEvent(new Event("nic:progress"));
      }
      N.lastFinished = S.mod.id;
      S.completed = true;
      foot("continue", { onGo: () => { S.goldRect = goldRect(); res.firstToday ? (S.screens.push({ kind: "streak" }), next()) : close(); } });
      S.go.classList.add("pl-go-blue"); // Duolingo's lesson-complete button is blue
    },
    streak(node) {
      const r = S.streakRes, wk = game().week();
      node.innerHTML = `<div class="pl-in pl-center pl-streak">
        <div class="ps-flame">${N.mascot({ who: "blaze", size: 170, mood: "laugh", act: "dance", acc: r.streak >= 7 ? ["crown"] : ["shades"] })}</div>
        <div class="ps-num"><b id="psN">${r.streakFrom}</b></div><h1>day streak!</h1>
        <div class="ps-week">${wk.map((d) => `<div class="ps-day ${d.on ? "on" : ""} ${d.today ? "today" : ""}"><span>${d.label}</span><i>${d.on ? IC.ok : ""}</i></div>`).join("")}</div>
        <p class="lede">${r.streak === 1 ? "Day one. Come back tomorrow to keep it going." : "Practise every day to keep your streak alive."}</p></div>`;
      sound("flame");
      if (fx()) fx().lottie(qs(".ps-flame", node), "flame", { cls: "ps-lottie" });
      setTimeout(() => {
        const nEl = qs("#psN", node);
        const F = fx();
        if (F) { F.count(nEl, r.streak, { from: r.streakFrom, dur: 0.6 }); F.bump(qs(".ps-num", node), { scale: 1.5 }); } else nEl.textContent = r.streak;
        const t = qs(".ps-day.today", node); if (t && F && F.ok && !reduce()) F.clean(t, F.animate(t, { transform: ["scale(0.5)", "scale(1)"] }, F.SPRING_POP), ["transform"]);
        sound("streak");
      }, 450);
      foot("continue", { onGo: () => close() });
    },
  };

  // =====================================================================
  //  Asking a question (reuses the boss engine's question types)
  // =====================================================================
  const SELECT = { mcq: (b, v) => qsa(".opt", b).forEach((o) => { o.classList.toggle("sel", +o.dataset.k === v); o.setAttribute("aria-checked", +o.dataset.k === v); }), bug: (b, v) => qsa(".qc-line", b).forEach((o) => o.classList.toggle("sel", +o.dataset.k === v)) };

  function askQ(wrap, sc, { compact = false } = {}) {
    const Q = sc.Q, type = Q.type || "mcq", TT = T()[type];
    const deferred = !!SELECT[type] || (type === "pick" && !Array.isArray(Q.a));
    wrap.classList.add("predict"); // reuse the answer-tile styles
    wrap.innerHTML = `${compact ? `<div class="pl-check-q"><span class="pl-tag orange">Quick check</span><div class="pl-q-text">${Q.q}</div></div>` : presenter(Q.q)}
      <div class="q-fig"></div><div class="q-body pl-body qt-${type}"></div>${Q.hint ? `<div class="q-hint"><button class="btn ghost small" data-hint>Need a nudge?</button><div class="q-hint-t" hidden>${Q.hint}</div></div>` : ""}`;
    const fig = qs(".q-fig", wrap), body = qs(".q-body", wrap);
    if (sc.revId && N.glossify) N.glossify(qs(".pl-prompt, .pl-q-text", wrap)); // revision questions: underline key terms with a short definition on hover or tap
    if (Q.fig && type !== "pick") { try { typeof Q.fig === "function" ? Q.fig(fig) : (fig.innerHTML = Q.fig); } catch (e) { console.error(e); } }
    const hb = qs("[data-hint]", wrap);
    if (hb) hb.onclick = () => { const t = qs(".q-hint-t", wrap); t.hidden = false; hb.remove(); if (fx()) fx().reveal(t); };
    let pending, answered = false;
    const grade = (v) => {
      if (answered) return; answered = true;
      const ok = TT.grade(Q, v);
      qsa(".sel", body).forEach((x) => x.classList.remove("sel"));
      const focus = TT.reveal(Q, body, v, ok);
      const h = qs(".q-hint", wrap); if (h) h.remove();
      if (fx() && focus) ok ? (fx().bounce || fx().pop)(focus) : fx().shake(focus);
      result(sc, ok, v);
      // once the sheet has landed, bring the graded answer into view above it (the stage is padded by the overlap)
      const s = S, kbd = S.kbd;
      S.life.timeout(() => {
        if (S !== s || !wrap.isConnected) return;
        const t = focus || qs(".right, .wrong", body);
        if (t && t.scrollIntoView) t.scrollIntoView({ block: "nearest", behavior: reduce() || kbd ? "auto" : "smooth" });
      }, (S.sheetMs || 0) + 20);
    };
    TT.render(Q, body, (v) => {
      if (answered) return;
      if (!deferred) return grade(v);
      pending = v;
      if (SELECT[type]) SELECT[type](body, v); else qsa("[data-pick]", body).forEach((e) => e.classList.toggle("sel", e.dataset.pick === v));
      sound("select");
      foot("check", { onGo: () => grade(pending), enabled: true });
    }, sc.idKey || sc.key);
    if (deferred) foot("check", { enabled: false });
    else {
      const chk = qs("[data-check]", body);
      if (!chk) { foot("check", { enabled: false }); return; }
      const sync = () => { if (!answered) S.go.disabled = chk.disabled; };
      foot("check", { onGo: () => chk.click(), enabled: !chk.disabled });
      const mo = new MutationObserver(sync); mo.observe(chk, { attributes: true, attributeFilter: ["disabled"] });
      S.life.onCleanup(() => mo.disconnect());
    }
  }

  function result(sc, ok, v) {
    const Q = sc.Q, first = !sc.retry, prevCombo = S.combo;
    S.answered++; S.graded = true; (S.gradedKeys = S.gradedKeys || new Set()).add(sc.key);
    if (first) { S.firstTotal++; if (ok) S.firstRight++; else if (sc.revId) (S.revWrong = S.revWrong || []).push(sc.revId); }
    game().answered(ok);
    // persistence
    if (sc.bossIdx !== undefined) { const st = store.get("nic.quiz", {}); st[sc.idKey] = { v, ok }; store.set("nic.quiz", st); if (ok) game().track("boss"); window.dispatchEvent(new Event("nic:progress")); }
    // one review log for everything: lesson checks, boss questions and Practice fixes all move the question's Leitner box
    const bid = sc.revId || (N.bank && (sc.key.match(/^(?:step|boss):([^:]+):/) || [])[1] && N.bank.idFor(sc.key.split(":")[1], Q));
    if (bid && first && N.bank) N.bank.record(bid, ok);
    if (sc.pred) { const p = store.get("nic.predict", {}); if (!(sc.pred in p)) { p[sc.pred] = ok; store.set("nic.predict", p); N.updateScore && N.updateScore(); } }
    if (ok) {
      if (sc.practice && missed.all().some((m) => m.k === sc.key)) { game().track("practice"); game().unlock("fixer"); }
      if (sc.practice || sc.retry) missed.drop(sc.key);
      if (first) S.xp += S.kind === "boss" ? 2 : 1;
      S.combo++; S.wrongRun = 0;
      game().track("combo", S.combo);
      if (S.combo >= 5 && S.combo % 5 === 0 && S.kind !== "boss") S.screens.splice(S.i + 1, 0, { kind: "hype", n: S.combo });
    } else {
      S.combo = 0; S.wrongRun++;
      const ref = sc.bossIdx !== undefined ? { boss: S.boss.id, i: sc.bossIdx } : { Q };
      missed.add(sc.key, ref);
      if (S.kind !== "boss") {
        S.retries[sc.key] = (S.retries[sc.key] || 0) + 1;
        if (S.retries[sc.key] <= 2) queueMistake(sc);
      }
    }
    combo(prevCombo);
    retryChip(!ok);
    revSave();
    const answer = T()[Q.type || "mcq"].answer(Q);
    const why = Q.why ? `<div class="pl-why">${Q.why}</div>` : "";
    const mood = ok ? pickOne(CHEER) : S.wrongRun >= 3 ? "dizzy" : pickOne(["sad", "surprised", "shocked"]);
    // the presenter who asked the question reacts too (compact quick checks have none)
    const pres = qs(".pl-screen:not(.leaving) .pl-presenter", S.stage);
    if (pres && N.mascotReact) N.mascotReact(pres, mood);
    const who = sc.retry ? "berry" : S.who;
    const fb = ok
      ? `<div class="pl-fb-row">${N.mascot({ who, size: 64, mood, poke: false })}<div class="pl-fb-t"><div class="pl-fb-h">${IC.ok}<b>${pickOne(PRAISE)}</b>${first ? `<span class="pl-xp">+${S.kind === "boss" ? 2 : 1} XP</span>` : ""}</div>${why}</div></div>`
      : `<div class="pl-fb-row">${N.mascot({ who, size: 64, mood, poke: false })}<div class="pl-fb-t"><div class="pl-fb-h">${IC.no}<b>Correct answer:</b></div><div class="pl-ans">${answer}</div>${why}</div></div>`;
    sound(ok ? "correct" : "wrong");
    foot(ok ? "ok" : "no", { fb, onGo: next });
    if (ok && fx() && first) fx().floatText(S.go, `+${S.kind === "boss" ? 2 : 1}`, "#ffc800");
  }

  /** The lesson that teaches a revision question: its own module, or for a boss question the first lesson of that lecture. */
  function studyTarget(modId) {
    const m = N.modules.find((x) => x.id === modId); if (!m) return null;
    if (m.num !== "Boss") return m;
    return N.modules.filter((x) => x.num !== "Boss" && !x.workshop && (x.subject || "nic") === (m.subject || "nic") && x.lecture === m.lecture).sort((a, b) => (a.order || 0) - (b.order || 0))[0] || null;
  }
  /** Revision question -> its lesson -> back to the same question. The round is saved first; closing the lesson (finished or quit) reopens it. */
  function studyThenReturn(sc) {
    const m = studyTarget(sc.mod); if (!m) return;
    revSave();
    const WHO = { nic: "sprout", ds: "pebble", algo: "byte" };
    const home = location.hash.slice(1) || "practice";
    close(true);
    open(m, { home, who: WHO[m.subject || "nic"], returnToRevise: true });
  }

  /** A previous-mistake screen can be skipped: it just moves on (the question stays in Practice's mistakes list). */
  function addSkip() {
    const acts = qs(".pl-actions", S.foot); if (!acts || qs(".pl-skip", acts)) return;
    const b = el(`<button class="btn big ghost pl-skip">Skip</button>`);
    b.onclick = () => { if (S.graded && S.screens[S.i] && S.screens[S.i].kind === "q" && !S.screens[S.i].retry) return; sound("tap"); next(); };
    acts.insertBefore(b, S.go);
  }

  function queueMistake(sc) {
    // mistakes wait at the end of the main run, behind a "Let's fix your mistakes" interstitial
    if (!S.screens.some((x) => x.kind === "mistakes")) S.screens.push({ kind: "mistakes" });
    S.screens.push({ ...sc, retry: true, practice: false });
  }

  function finish() {
    // recap once after the main + mistakes run, then complete
    const has = (k) => S.screens.some((x) => x.kind === k);
    if (S.kind === "lesson" && S.recap && !has("recap")) { S.screens.push({ kind: "recap" }); return show(1); }
    if (!has("complete")) { if (S.kind === "revise") { revLog(); revWrite(null); } S.screens.push({ kind: "complete" }); return show(1); }
    close();
  }

  // =====================================================================
  //  Quit, keys, close
  // =====================================================================
  function askQuit() {
    if (!S) return;
    const done = S.screens[S.i] && ["complete", "streak"].includes(S.screens[S.i].kind);
    if (done) return close();
    const m = qs(".pl-modal", S.root);
    m.innerHTML = `<div class="pl-sheet">${N.mascot({ who: "berry", size: 120, mood: "cry", act: "cry" })}<h2>Wait, don't go!</h2><p class="lede">You're doing great. ${S.kind === "lesson" ? "Your place is saved, but the XP for this lesson isn't banked yet." : "Leave now and this round won't count."}</p>
      <button class="btn big primary" data-m="stay">Keep learning</button><button class="btn big ghost pl-quit-btn" data-m="quit">End session</button></div>`;
    m.hidden = false;
    sound("sad");
    if (fx() && fx().ok) fx().clean(qs(".pl-sheet", m), fx().animate(qs(".pl-sheet", m), reduce() ? { opacity: [0, 1] } : { transform: ["translateY(60px) scale(0.96)", "translateY(0px) scale(1)"], opacity: [0, 1] }, reduce() ? { duration: fx().DUR.m } : fx().SPRING));
    if (fx() && fx().ok) fx().clean(m, fx().animate(m, { opacity: [0, 1] }, { duration: fx().DUR.s }), ["opacity"]);
    qs('[data-m="stay"]', m).onclick = () => {
      sound("pop");
      if (!fx() || !fx().exit || !fx().ok) { m.hidden = true; return; }
      m.style.pointerEvents = "none"; // the sheet drops away, then the layer hides
      Promise.all([fx().exit(qs(".pl-sheet", m), { y: 40, scale: 0.97, dur: 0.18 }), fx().exit(m, { scale: 1, dur: 0.18 })]).then(() => { m.hidden = true; m.style.pointerEvents = ""; requestAnimationFrame(() => setTimeout(() => (m.style.opacity = ""), 0)); });
    };
    qs('[data-m="quit"]', m).onclick = () => close();
  }

  function onKey(e) {
    if (!S || e.ctrlKey || e.metaKey || e.altKey) return;
    const m = qs(".pl-modal", S.root);
    const typing = /input|textarea|select/i.test(document.activeElement && document.activeElement.tagName);
    if (e.key === "Escape") { e.preventDefault(); if (!m.hidden) m.hidden = true; else askQuit(); return; }
    if (!m.hidden) { if (e.key === "Enter") { e.preventDefault(); m.hidden = true; } return; }
    if (typing) return;
    // keyboard moves take the no-animation path: no slide between screens, no sheet slide (S.kbd is read synchronously)
    const kbd = (fn) => { const s = S; s.kbd = true; try { fn(); } finally { s.kbd = false; } };
    if (/^[1-9]$/.test(e.key)) {
      const opts = qsa(".pl-screen:not(.leaving) .pl-body .opt, .pl-screen:not(.leaving) .pl-body .qc-line", S.stage).filter((b) => !b.disabled);
      const b = opts[+e.key - 1]; if (b) { e.preventDefault(); kbd(() => b.click()); }
      return;
    }
    if (e.key === "Enter" && !S.go.disabled) { e.preventDefault(); kbd(() => S.go.click()); }
    if (e.key === "ArrowLeft" && !qs(".pl-back", S.root).hidden && !(e.target.closest && e.target.closest(".rn, .pl-body"))) { e.preventDefault(); kbd(goBack); }
  }

  function close(silent = false) {
    if (!S) return;
    const s = S; S = null;
    if (!silent && s.kind === "revise") { const r = revSaved(); if (r) revWrite({ ...r, paused: true }); } // quit: keep the round, but a refresh shouldn't reopen it
    document.removeEventListener("keydown", s.keys);
    s.stopIdle && s.stopIdle();
    s.life.dispose();
    if (s.holder) s.holder.remove();
    document.body.classList.remove("in-lesson");
    N.shield(false);
    const root = s.root;
    const gone = () => root.remove();
    if (!silent && s.completed) {
      // the app flies the XP from the gold card to the top-bar counter (NIC.player.lastXP)
      const card = qs(".pd-card.c-gold[data-xp]", root);
      const r = card ? card.getBoundingClientRect() : s.goldRect;
      N.player.lastXP = { n: s.xpTotal || 0, rect: r && r.width ? r : null };
    }
    if (!silent && N.fx && N.fx.ok && N.fx.exit) { root.classList.add("m-ghost"); N.fx.exit(root, { y: 30, scale: 1, dur: N.fx.DUR.m }).then(gone); }
    else gone();
    if (!silent) {
      const h = s.opts.home || "home";
      if (location.hash.slice(1) !== h) location.hash = h; else window.dispatchEvent(new Event("hashchange"));
    }
    if (s.opts.returnToRevise) { const r = revSaved(); if (r) setTimeout(() => { if (!S) revise({ resume: true, ...(r.opts || {}), home: (r.opts && r.opts.home) || "practice" }); }, 80); }
  }

  /** For tools/smoke.js and tools/boss-test.js. */
  const state = () => {
    if (!S) return { open: false };
    const sc = S.screens[S.i] || {};
    return { open: true, who: S.who, kind: sc.kind, Q: sc.Q || null, key: sc.key, i: S.i, n: S.screens.length, foot: S.foot.className.replace("pl-foot ", ""), goDisabled: S.go.disabled };
  };

  /* originRect: set by the path right before opening, so the player grows out of the tapped node (read once, then cleared).
     lastXP: {n, rect} of the gold XP card, set as the player closes after a complete screen (the app flies it to the counter). */
  N.player = { open, practice, revise, revSaved, close, state, isOpen: () => !!S, missed, originRect: null, lastXP: null };
})();
