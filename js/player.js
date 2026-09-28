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
    if (hasDemo || L.guide) out.push({ kind: "try", guide: L.guide });
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
      if (S.i > 0 && fx()) setTimeout(() => fx().toast(`<b>Welcome back!</b><span>Picked up where you left off. "Start over" is in the lesson's popover.</span>`, { tone: "blue", ms: 2600 }), 400);
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

  function revise(opts = {}) {
    if (S) close(true);
    S = base("revise", opts);
    S.who = opts.who || "chip"; S.mod = { id: "revise", num: "Revise", title: "Revision" };
    mount("Revise");
    const deck = N.bank ? N.bank.deck({ n: opts.n || 10, subjects: opts.subjects || null }) : [];
    const title = (id) => { const m = N.modules.find((x) => x.id === id); return m ? `${m.num === "Boss" ? "Boss" : m.num} · ${stripTags(m.title)}` : ""; };
    S.screens = deck.length
      ? [{ kind: "reviseIntro", n: deck.length, mods: new Set(deck.map((d) => d.mod)).size }, ...deck.map((d) => ({ kind: "q", Q: d.Q, key: `rev:${d.id}`, revId: d.id, revTag: title(d.mod), practice: true }))]
      : [{ kind: "note", who: "chip", mood: "sleepy", t: "Nothing to revise yet", b: "Finish a lesson first. Its questions join your revision deck." }];
    sound("whoosh");
    show(0);
  }

  // =====================================================================
  //  Shell
  // =====================================================================
  function mount(chip) {
    const root = el(`<div class="player" role="dialog" aria-modal="true" aria-label="${stripTags(S.mod.title)}">
      <header class="pl-top"><button class="pl-x" aria-label="Quit lesson">${IC.x}</button>
        <div class="pl-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span class="pl-fill"></span><span class="pl-combo"></span></div>
        <span class="pl-chip">${chip}</span><button class="pl-ref" hidden title="Reference">${IC.book}</button></header>
      <div class="pl-stage"></div>
      <footer class="pl-foot"><div class="pl-foot-in"><div class="pl-fb" aria-live="polite"></div><div class="pl-actions"><button class="btn big primary pl-go">Continue</button></div></div></footer>
      <div class="pl-modal" hidden></div><div class="pl-drawer" hidden></div></div>`);
    document.body.appendChild(root);
    document.body.classList.add("in-lesson");
    N.shield(true);
    S.root = root; S.stage = qs(".pl-stage", root); S.foot = qs(".pl-foot", root); S.go = qs(".pl-go", root);
    S.go.addEventListener("click", () => { if (!S.go.disabled && S.onGo) S.onGo(); });
    qs(".pl-x", root).addEventListener("click", askQuit);
    const ref = qs(".pl-ref", root);
    ref.addEventListener("click", () => { const d = qs(".pl-drawer", root); d.hidden = !d.hidden; if (!d.hidden && fx()) fx().reveal(d); });
    S.keys = (e) => onKey(e);
    document.addEventListener("keydown", S.keys);
    if (fx() && fx().ok) fx().animate(root, reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translateY(40px)", "translateY(0px)"] }, { duration: 0.32, ease: fx().EASE });
    S.stopIdle = N.cast ? N.cast.idle(root) : () => {};
    if (fx()) S.life.onCleanup(fx().watchStats(root));
  }

  function progress() {
    const content = S.screens.filter((x) => !["complete", "streak", "hype"].includes(x.kind)).length;
    const f = Math.min(1, S.i / Math.max(1, content));
    const fill = qs(".pl-fill", S.root);
    fill.style.transform = `scaleX(${f})`;
    qs(".pl-bar", S.root).setAttribute("aria-valuenow", Math.round(f * 100));
  }

  function combo() {
    const c = qs(".pl-combo", S.root);
    qs(".pl-bar", S.root).classList.toggle("hot", S.combo >= 5);
    if (S.combo >= 3) {
      c.textContent = `${S.combo} IN A ROW`;
      c.classList.add("on");
      if (fx() && fx().ok && !reduce()) fx().animate(c, { transform: ["translate(-50%, 6px) scale(0.6)", "translate(-50%, 0px) scale(1.15)", "translate(-50%, 0px) scale(1)"] }, { duration: 0.45, ease: fx().EASE });
      if (S.combo === 3 || S.combo === 5 || S.combo % 10 === 0) sound("streak");
      if (S.combo === 5 || S.combo % 10 === 0) setTimeout(() => fx() && fx().lottieAt(c, "combo", { size: 96, dy: -6 }), 120);
    } else c.classList.remove("on");
  }

  /** Footer: mode = continue | check | ok | no | hidden */
  function foot(mode, { label, onGo, fb = "", enabled = true, danger = false } = {}) {
    if (S.go) S.go.classList.remove("pl-go-blue");
    S.foot.className = `pl-foot f-${mode}`;
    const fbEl = qs(".pl-fb", S.foot);
    fbEl.innerHTML = fb;
    S.go.textContent = label || (mode === "check" ? "Check" : mode === "no" ? "Got it" : "Continue");
    S.go.disabled = !enabled;
    S.go.className = `btn big pl-go ${mode === "no" || danger ? "rose" : "primary"}`;
    S.onGo = onGo;
    if ((mode === "ok" || mode === "no") && fx() && fx().ok) {
      const inner = qs(".pl-foot-in", S.foot);
      fx().animate(S.foot, reduce() ? { opacity: [0.4, 1] } : { transform: ["translateY(100%)", "translateY(0%)"] }, { duration: 0.32, ease: fx().EASE });
      if (!reduce()) fx().animate(inner, { opacity: [0, 1] }, { duration: 0.2, delay: 0.08 });
      const m = qs(".mascot", fbEl); if (m) setTimeout(() => N.mascotReact(m, m.dataset.mood), 120);
    }
  }

  // =====================================================================
  //  Screens
  // =====================================================================
  function show(dir = 1) {
    const sc = S.screens[S.i];
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
    if (old) {
      if (fx() && fx().ok && !reduce() && dir) {
        fx().animate(old, { opacity: [1, 0], transform: ["translateX(0px)", `translateX(${-40 * dir}px)`] }, { duration: 0.18, ease: "easeIn" }).finished.then(() => old.remove()).catch(() => old.remove());
        old.classList.add("leaving");
      } else old.remove();
    }
    S.stage.appendChild(node);
    S.stage.scrollTop = 0;
    qs(".pl-ref", S.root).hidden = !S.refHTML;
    if (S.refHTML) qs(".pl-drawer", S.root).innerHTML = S.refHTML;
    progress();
    (RENDER[sc.kind] || RENDER.note)(node, sc);
    node.setAttribute("tabindex", "-1"); node.focus({ preventScroll: true }); // Tab starts inside the new screen
    if (fx() && fx().ok && dir) {
      const a = fx().animate(node, reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: [`translateX(${40 * dir}px)`, "translateX(0px)"] }, { duration: 0.3, delay: old ? 0.08 : 0, ease: fx().EASE });
      if (a) a.finished.then(() => (node.style.transform = "")).catch(() => {});
      if (!reduce()) qsa(".pl-in > *", node).forEach((p, k) => fx().animate(p, { opacity: [0, 1], transform: ["translateY(12px)", "translateY(0px)"] }, { duration: 0.32, delay: 0.1 + k * 0.05, ease: fx().EASE }));
    }
    const vis = qs(".lesson-visual", node); if (vis && fx()) fx().play(vis);
  }
  const next = () => { S.i++; show(1); };

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
      askQ(qs(".pl-qwrap", node), sc, {});
    },
    try(node, sc) {
      node.classList.add("wide");
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
      if (fx()) { setTimeout(() => fx().lottieAt(qs(".ph-stage", node), "combo", { size: 180, dy: -40 }), 150); if (fx().ok && !reduce()) qsa(".ph-bub", node).forEach((b, k) => fx().animate(b, { opacity: [0, 1], transform: ["translateY(10px) scale(0.8)", "translateY(0px) scale(1)"] }, { type: "spring", duration: 0.45, bounce: 0.45, delay: 0.2 + k * 0.35 })); }
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
        <div class="pl-ring"><svg viewBox="0 0 140 140"><circle cx="70" cy="70" r="${R}" fill="none" stroke="#e5e5e5" stroke-width="14"/><circle class="ring-fg" cx="70" cy="70" r="${R}" fill="none" stroke="${pct >= 0.8 ? "#58cc02" : "#ff9600"}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L}" transform="rotate(-90 70 70)"/></svg>
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
          <div class="pd-card c-gold"><b>Total XP</b><span>${IC.bolt}<i data-v="${total}">0</i></span></div>
          <div class="pd-card c-green"><b>${label}</b><span>${IC.target}<i data-v="${Math.round(acc * 100)}">0</i>%</span></div>
          <div class="pd-card c-blue"><b>${secs < 180 ? "Speedy" : "Time"}</b><span>${IC.clock}<i class="pd-time">${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</i></span></div>
        </div></div>`;
      sound("fanfare");
      if (fx()) setTimeout(() => fx().celebrate(qs(".pd-title", node), { big: true, silent: true }), 250);
      if (S.bossPerfect && fx()) setTimeout(() => fx().lottieAt(qs(".pd-star", node) || qs(".pd-title", node), "trophy", { size: 220 }), 700);
      qsa(".pd-card", node).forEach((card, k) => setTimeout(() => {
        const i = qs("i[data-v]", card);
        if (!fx() || !fx().ok) { card.style.opacity = 1; if (i) i.textContent = i.dataset.v; return; }
        if (i) fx().count(i, +i.dataset.v, { from: 0, dur: 0.7 });
        let t = 0; const iv = setInterval(() => { sound("tick"); if (++t > 5) clearInterval(iv); }, 90);
        fx().animate(card, { transform: ["scale(0.7)", "scale(1.08)", "scale(1)"], opacity: [0, 1] }, { duration: 0.4, ease: fx().EASE }).finished.then(() => (card.style.opacity = 1)).catch(() => {});
      }, 500 + k * 260));
      qs(".pl-combo", S.root).classList.remove("on");
      if (S.kind === "lesson") {
        const d = store.get("nic.lessonDone", {}); d[S.mod.id] = true; store.set("nic.lessonDone", d);
        const p = store.get("nic.lessonPos", {}); delete p[S.mod.id]; store.set("nic.lessonPos", p);
        window.dispatchEvent(new Event("nic:progress"));
      }
      N.lastFinished = S.mod.id;
      foot("continue", { onGo: () => (res.firstToday ? (S.screens.push({ kind: "streak" }), next()) : close()) });
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
        if (fx()) { fx().count(nEl, r.streak, { from: r.streakFrom, dur: 0.6 }); if (fx().ok && !reduce()) fx().animate(qs(".ps-num", node), { transform: ["scale(1)", "scale(1.5)", "scale(1)"] }, { duration: 0.5, ease: fx().EASE }); } else nEl.textContent = r.streak;
        const t = qs(".ps-day.today", node); if (t && fx() && fx().ok && !reduce()) fx().animate(t, { transform: ["scale(0.5)", "scale(1.25)", "scale(1)"] }, { type: "spring", duration: 0.6, bounce: 0.5 });
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
    if (Q.fig && type !== "pick") { try { typeof Q.fig === "function" ? Q.fig(fig) : (fig.innerHTML = Q.fig); } catch (e) { console.error(e); } }
    const hb = qs("[data-hint]", wrap);
    if (hb) hb.onclick = () => { qs(".q-hint-t", wrap).hidden = false; hb.remove(); };
    let pending, answered = false;
    const grade = (v) => {
      if (answered) return; answered = true;
      const ok = TT.grade(Q, v);
      qsa(".sel", body).forEach((x) => x.classList.remove("sel"));
      const focus = TT.reveal(Q, body, v, ok);
      setTimeout(() => { const t = focus || qs(".right, .wrong", body); if (t && t.scrollIntoView) t.scrollIntoView({ block: "nearest", behavior: reduce() ? "auto" : "smooth" }); }, 360);
      const h = qs(".q-hint", wrap); if (h) h.remove();
      if (fx() && focus) ok ? fx().pop(focus) : fx().shake(focus);
      result(sc, ok, v);
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
    const Q = sc.Q, first = !sc.retry;
    S.answered++;
    if (first) { S.firstTotal++; if (ok) S.firstRight++; }
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
    combo();
    const answer = T()[Q.type || "mcq"].answer(Q);
    const why = Q.why ? `<div class="pl-why">${Q.why}</div>` : "";
    const mood = ok ? pickOne(CHEER) : S.wrongRun >= 3 ? "dizzy" : pickOne(["sad", "surprised", "shocked"]);
    const who = sc.retry ? "berry" : S.who;
    const fb = ok
      ? `<div class="pl-fb-row">${N.mascot({ who, size: 64, mood, poke: false })}<div class="pl-fb-t"><div class="pl-fb-h">${IC.ok}<b>${pickOne(PRAISE)}</b>${first ? `<span class="pl-xp">+${S.kind === "boss" ? 2 : 1} XP</span>` : ""}</div>${why}</div></div>`
      : `<div class="pl-fb-row">${N.mascot({ who, size: 64, mood, poke: false })}<div class="pl-fb-t"><div class="pl-fb-h">${IC.no}<b>Correct answer:</b></div><div class="pl-ans">${answer}</div>${why}</div></div>`;
    sound(ok ? "correct" : "wrong");
    foot(ok ? "ok" : "no", { fb, onGo: next });
    if (ok && fx() && first) fx().floatText(S.go, `+${S.kind === "boss" ? 2 : 1}`, "#ffc800");
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
    if (!has("complete")) { S.screens.push({ kind: "complete" }); return show(1); }
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
    if (fx() && fx().ok) fx().animate(qs(".pl-sheet", m), reduce() ? { opacity: [0, 1] } : { transform: ["translateY(60px) scale(0.96)", "translateY(0px) scale(1)"], opacity: [0, 1] }, { type: "spring", duration: 0.45, bounce: 0.3 });
    qs('[data-m="stay"]', m).onclick = () => { m.hidden = true; sound("pop"); };
    qs('[data-m="quit"]', m).onclick = () => close();
  }

  function onKey(e) {
    if (!S || e.ctrlKey || e.metaKey || e.altKey) return;
    const m = qs(".pl-modal", S.root);
    const typing = /input|textarea|select/i.test(document.activeElement && document.activeElement.tagName);
    if (e.key === "Escape") { e.preventDefault(); if (!m.hidden) m.hidden = true; else askQuit(); return; }
    if (!m.hidden) { if (e.key === "Enter") { e.preventDefault(); m.hidden = true; } return; }
    if (typing) return;
    if (/^[1-9]$/.test(e.key)) {
      const opts = qsa(".pl-screen:not(.leaving) .pl-body .opt, .pl-screen:not(.leaving) .pl-body .qc-line", S.stage).filter((b) => !b.disabled);
      const b = opts[+e.key - 1]; if (b) { e.preventDefault(); b.click(); }
      return;
    }
    if (e.key === "Enter" && !S.go.disabled) { e.preventDefault(); S.go.click(); }
  }

  function close(silent = false) {
    if (!S) return;
    const s = S; S = null;
    document.removeEventListener("keydown", s.keys);
    s.stopIdle && s.stopIdle();
    s.life.dispose();
    if (s.holder) s.holder.remove();
    document.body.classList.remove("in-lesson");
    N.shield(false);
    const root = s.root;
    const gone = () => root.remove();
    if (!silent && N.fx && N.fx.ok && !reduce()) N.fx.animate(root, { opacity: [1, 0], transform: ["translateY(0px)", "translateY(30px)"] }, { duration: 0.22, ease: "easeIn" }).finished.then(gone).catch(gone);
    else gone();
    if (!silent) {
      const h = s.opts.home || "home";
      if (location.hash.slice(1) !== h) location.hash = h; else window.dispatchEvent(new Event("hashchange"));
    }
  }

  /** For tools/smoke.js and tools/boss-test.js. */
  const state = () => {
    if (!S) return { open: false };
    const sc = S.screens[S.i] || {};
    return { open: true, who: S.who, kind: sc.kind, Q: sc.Q || null, key: sc.key, i: S.i, n: S.screens.length, foot: S.foot.className.replace("pl-foot ", ""), goDisabled: S.go.disabled };
  };

  N.player = { open, practice, revise, close, state, isOpen: () => !!S, missed };
})();
