(function () {
  const { modules, qs, qsa, el, esc, store, updateScore, lifecycle } = NIC;
  const fx = NIC.fx, game = NIC.game;
  const main = qs("#main");
  let life = null;

  const SUBJECTS = {
    nic: {
      name: "Nature-Inspired", code: "ECM3412", home: "home", unit: "Lecture", who: "sprout", color: "green",
      lectures: {
        1: "Lecture 1 — What is NIC? Evolution as problem solving",
        2: "Lecture 2 — Why EAs: optimisation & hardness",
        3: "Lecture 3 — Local vs population search & landscapes",
        4: "Lecture 4 — Selection, operators & encodings",
      },
    },
    ds: {
      name: "Data Science", code: "COM3021", home: "ds-home", unit: "Lecture", who: "pebble", color: "blue",
      lectures: {
        1: "Lecture 1 — Reliable, scalable & maintainable systems",
        2: "Lecture 2 — Data models & NoSQL",
        3: "Lecture 3 — Storage & retrieval",
      },
    },
    algo: {
      name: "Algorithms", code: "ECM3428", home: "algo-home", unit: "Phase", who: "byte", color: "violet",
      lectures: {
        1: "Phase 1 — Foundations & PageRank",
        2: "Phase 2 — Graph Search & Internet Routing",
        3: "Phase 3 — Optimisation",
        4: "Phase 4 — Minimum Spanning Trees",
        5: "Phase 5 — Convex Hulls",
        6: "Phase 6 — Error Detection & Correction",
        7: "Phase 7 — Information Theory & Compression",
        8: "Phase 8 — Cryptography & Blockchain",
        9: "Phase 9 — Fourier Transform & FFT",
        10: "Phase 10 — Transformers & Attention",
        11: "Phase 11 — Synthesis",
      },
    },
  };
  const subjOf = (m) => m.subject || "nic";
  const SUBJ_ORDER = ["nic", "ds", "algo"];
  NIC.unitName = (m) => SUBJECTS[subjOf(m)].unit;
  modules.sort((a, b) => SUBJ_ORDER.indexOf(subjOf(a)) - SUBJ_ORDER.indexOf(subjOf(b)) || a.lecture - b.lecture || a.order - b.order);
  const inSubj = (s) => modules.filter((m) => subjOf(m) === s);
  const inLec = (s, lec) => inSubj(s).filter((m) => m.lecture === +lec);

  // ---- Guard rail: a module whose lecture isn't declared would silently vanish from the path ----
  const orphans = modules.filter((m) => !SUBJECTS[subjOf(m)] || !SUBJECTS[subjOf(m)].lectures[m.lecture]);
  const dupes = modules.map((m) => m.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (orphans.length || dupes.length) {
    const msg = [orphans.length && `Modules with an undeclared lecture: ${orphans.map((m) => m.id).join(", ")}`, dupes.length && `Duplicate ids: ${dupes.join(", ")}`].filter(Boolean).join(" · ");
    console.error("[visualizer]", msg);
    document.body.prepend(el(`<div class="dev-banner">⚠ ${msg}</div>`));
  }

  // ---- Progress model ----
  const isBoss = (m) => m.num === "Boss";
  function status(m) {
    if (isBoss(m)) {
      const q = store.get("nic.quiz", {}); const keys = Object.keys(q).filter((k) => k.startsWith(m.id + "-") && typeof q[k] === "object");
      return keys.length === 0 ? "new" : keys.length >= (m.qCount || 1) ? "done" : "started";
    }
    if (store.get("nic.lessonDone", {})[m.id]) return "done";
    return store.get("nic.visited", {})[m.id] ? "started" : "new";
  }
  const progress = (list) => { const d = list.filter((m) => status(m) === "done").length; return { d, n: list.length, f: list.length ? d / list.length : 0 }; };
  let course = store.get("nic.course", "nic");
  const setCourse = (s) => { course = s; store.set("nic.course", s); if (NIC.cast) NIC.cast.course = SUBJECTS[s].who; renderTop(); };

  // =====================================================================
  //  Icons
  // =====================================================================
  const IC = {
    sun: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    moon: `<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor"/></svg>`,
    themeSys: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 4v13" stroke="currentColor" stroke-width="2.2"/><path d="M12 4h6a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6z" fill="currentColor"/><path d="M8 21h8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    clock: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    star: `<svg viewBox="0 0 24 24"><path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    check: `<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    trophy: `<svg viewBox="0 0 24 24"><path d="M7 3h10v5a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 13v4M8 21h8l-1-4H9z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    play: `<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
    flame: `<svg viewBox="0 0 24 24"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-7 1-9.5z" fill="currentColor"/><path d="M12 12c.6 2 2.5 3 2.5 5a2.5 2.5 0 0 1-5 0c0-1.2.8-2 1.3-2.6.2 1 .7 1.4 1.2 1.4-.4-1.4-.3-2.6 0-3.8z" fill="#ffc800"/></svg>`,
    chest: `<svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="11" rx="2.5" fill="#cd7900"/><path d="M3 11a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v1H3z" fill="#ff9600"/><rect x="10" y="10" width="4" height="5" rx="1" fill="#ffc800"/></svg>`,
    home: `<svg viewBox="0 0 24 24"><path d="M3.5 11L12 3.5l8.5 7.5V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" fill="currentColor"/></svg>`,
    dumbbell: `<svg viewBox="0 0 24 24"><rect x="2" y="8" width="4" height="8" rx="1.5" fill="currentColor"/><rect x="18" y="8" width="4" height="8" rx="1.5" fill="currentColor"/><rect x="5" y="6" width="3" height="12" rx="1.5" fill="currentColor"/><rect x="16" y="6" width="3" height="12" rx="1.5" fill="currentColor"/><rect x="8" y="10.5" width="8" height="3" rx="1.5" fill="currentColor"/></svg>`,
    face: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="8.5" cy="10.5" r="1.6" fill="#fff"/><circle cx="15.5" cy="10.5" r="1.6" fill="#fff"/><path d="M8 14.5q4 3.5 8 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    chev: `<svg viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    book: `<svg viewBox="0 0 24 24"><path d="M4 5c3-1 5.5-.6 8 1.4V20c-2.5-2-5-2.4-8-1.4zM20 5c-3-1-5.5-.6-8 1.4V20c2.5-2 5-2.4 8-1.4z" fill="currentColor"/></svg>`,
    search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="m20 20-4-4" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`,
    lock: `<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>`,
    sound: `<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    reset: `<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  const ring = (f, r = 9, w = 3.5, col = "#ffc800") => { const L = 2 * Math.PI * r; return `<svg class="ring" viewBox="0 0 ${2 * r + w * 2} ${2 * r + w * 2}"><circle cx="${r + w}" cy="${r + w}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${w}"/><circle class="ring-v" cx="${r + w}" cy="${r + w}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - Math.min(1, f))}" transform="rotate(-90 ${r + w} ${r + w})"/></svg>`; };

  // =====================================================================
  //  Top bar + popovers + modal
  // =====================================================================
  const top = qs("#topbar");
  function renderTop() {
    const S = SUBJECTS[course], st = game.streak(), doneToday = game.week().find((d) => d.today).on;
    const tx = game.todayXP(), g = game.goal();
    top.innerHTML = `<div class="tb-in">
      <a class="tb-logo" href="#${S.home}" aria-label="CSLingo home"><b>cs</b>lingo</a>
      <button class="tb-btn tb-course" data-pop="course" aria-label="Switch course">${NIC.mascot({ who: S.who, size: 30, poke: false })}<span>${S.code}</span>${IC.chev}</button>
      <div class="tb-right">
        <button class="tb-btn tb-streak ${doneToday ? "lit" : ""}" data-pop="streak" aria-label="Streak">${IC.flame}<b>${st}</b></button>
        <button class="tb-btn tb-xp" data-pop="xp" aria-label="Daily goal">${ring(tx / g)}<b>${tx}</b></button>
        <button class="tb-btn tb-quest ${game.claimable() ? "ready" : ""}" data-pop="quests" aria-label="Daily quests">${IC.chest}<i class="tb-dot"></i></button>
        <button class="tb-btn tb-me" data-pop="me" aria-label="Menu">${NIC.mascot({ who: "sprout", size: 30, poke: false, acc: ["beanie"] })}</button>
      </div></div>`;
    qsa("[data-pop]", top).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); togglePop(b.dataset.pop, b); }));
    if (doneToday) ignite();
    topBump(tx, st, tx / g);
    if (qs(".rail")) rail();
  }
  /** The first time each day the flame is lit on screen, it ignites (css/motion-app.css). The day is kept outside nic.* so it never syncs. */
  let igniteT = 0;
  function ignite() {
    if (document.body.classList.contains("in-lesson")) return; // wait until the top bar is visible again
    const d = game.today();
    let seen = null; try { seen = localStorage.getItem("csl.ignite"); } catch {}
    if (seen === d || igniteT) return;
    try { localStorage.setItem("csl.ignite", d); } catch {}
    // a beat later, so the renders that follow a lesson closing don't restart it
    igniteT = setTimeout(() => {
      igniteT = 0;
      const b = qs(".tb-streak.lit", top); if (!b) return;
      b.classList.add("ignite");
      setTimeout(() => { const n = qs(".tb-streak", top); if (n) n.classList.remove("ignite"); }, 1400);
    }, 300);
  }
  /** XP or streak went up (lesson, chest, quest): count up and bump once the bar is visible again, so you see it after a lesson. */
  let topShown = null;
  function topBump(tx, st, f) {
    if (document.body.classList.contains("in-lesson")) return;
    const was = topShown; topShown = { tx, st, f };
    if (!was) return;
    const up = (sel, from, to, wait = 0) => {
      const b = qs(sel, top), n = b && qs("b", b); if (!n) return; n.textContent = from;
      const go = () => { if (!n.isConnected) return; fx.count(n, to, { from, dur: fx.DUR.bar }); fx.bump(b, { scale: 1.18, y: -2 }); };
      wait ? setTimeout(go, wait) : go();
    };
    // XP earned in a lesson flies to the counter first (flyXP); the count starts when it lands
    if (tx > was.tx) up(".tb-xp", was.tx, tx, flying() ? FLY_MS : 0);
    if (st > was.st) up(".tb-streak", was.st, st);
    const rv = qs(".tb-xp .ring-v", top);
    if (rv && was.f !== f) { const L = 2 * Math.PI * 9; rv.style.strokeDashoffset = L * (1 - Math.min(1, was.f)); void rv.getBoundingClientRect(); rv.style.strokeDashoffset = L * (1 - Math.min(1, f)); }
  }
  /** After a complete screen the player leaves NIC.player.lastXP = {n, rect}: a "+n XP" chip flies from there to the counter. */
  const FLY_MS = 520;
  const flying = () => { const x = NIC.player && NIC.player.lastXP; return !!(x && x.n && x.rect && fx.ok && !fx.reduce()); };
  function flyXP() {
    const x = NIC.player && NIC.player.lastXP; if (!x) return;
    const go = flying(); NIC.player.lastXP = null;
    const t = qs(".tb-xp", top); if (!go || !t) return;
    const a = t.getBoundingClientRect(), r = x.rect;
    const chip = el(`<span class="tb-fly" aria-hidden="true">+${x.n} XP</span>`);
    document.body.appendChild(chip);
    const w = chip.offsetWidth, h = chip.offsetHeight;
    const x0 = r.left + r.width / 2 - w / 2, y0 = r.top + r.height / 2 - h / 2, x1 = a.left + a.width / 2 - w / 2, y1 = a.top + a.height / 2 - h / 2;
    const done = () => chip.remove();
    fx.animate(chip, { opacity: [0, 1, 1, 0.4], transform: [`translate(${x0}px, ${y0 + 10}px) scale(0.8)`, `translate(${x0}px, ${y0}px) scale(1.1)`, `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) + (y0 - y1) * 0.25}px) scale(1)`, `translate(${x1}px, ${y1}px) scale(0.5)`] },
      { duration: FLY_MS / 1000, ease: fx.EASE_IO, times: [0, 0.18, 0.55, 1] }).finished.then(done, done);
  }

  const pop = qs("#pop");
  let popKind = null;
  function closePop() {
    if (!popKind) return;
    const kind = popKind; popKind = null;
    // exit: the card leaves as a ghost on <body> (it's position: fixed, so it stays put) while #pop is free for the next one
    const card = qs(".pop-card", pop);
    // focus was inside the card (keyboard): hand it back to the top-bar button that opened it
    if (card && card.contains(document.activeElement)) { const t = qs(`[data-pop="${kind}"]`, top); if (t) t.focus({ preventScroll: true }); }
    if (card && fx.ok && fx.exit) { card.classList.add("m-ghost"); card.style.zIndex = 45; document.body.appendChild(card); fx.exit(card, { y: -6, scale: 0.95 }).then(() => card.remove()); }
    pop.hidden = true; pop.innerHTML = "";
  }
  /** Wide screens: streak, daily goal and quests sit in a rail beside the path (Duolingo web layout). */
  const RAIL_MQ = matchMedia("(min-width: 1240px)");
  function rail() {
    let r = qs(".rail");
    if (!RAIL_MQ.matches || !qs(".path-page", main)) { if (r) r.remove(); return; }
    if (!r) { r = el(`<aside class="rail" aria-label="Your progress"></aside>`); main.appendChild(r); }
    r.innerHTML = ["streak", "xp", "quests"].map((k) => `<section class="rail-card pop-card pop-${k}" data-k="${k}">${POPS[k]()}</section>`).join("");
    qsa(".rail-card", r).forEach((c) => (POP_MOUNT[c.dataset.k] || (() => {}))(c));
  }
  RAIL_MQ.addEventListener && RAIL_MQ.addEventListener("change", rail);

  function togglePop(kind, anchor, { instant = false } = {}) {
    if (popKind === kind) return closePop();
    if (popKind) closePop(); // switching (streak, then goal): the old card ghost-exits while the new one springs in
    popKind = kind;
    pop.innerHTML = `<div class="pop-card pop-${kind}">${POPS[kind]()}</div>`;
    pop.hidden = false;
    const r = anchor.getBoundingClientRect(), card = qs(".pop-card", pop);
    const w = Math.min(360, innerWidth - 24);
    card.style.width = w + "px";
    const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    card.style.left = left + "px"; card.style.top = r.bottom + 10 + "px";
    card.style.setProperty("--ax", r.left + r.width / 2 - left + "px");
    if (fx.ok && !instant) fx.clean(card, fx.animate(card, fx.reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translateY(-8px) scale(0.94)", "translateY(0px) scale(1)"] }, { ...fx.SPRING_UI }));
    (POP_MOUNT[kind] || (() => {}))(card);
  }
  document.addEventListener("pointerdown", (e) => { if (popKind && !e.target.closest(".pop-card, [data-pop]")) closePop(); if (!e.target.closest(".p-node, .node-pop")) closeNodePop(); });

  /** Time until the daily quests roll over at local midnight, Duolingo style ("8 HOURS"). */
  const questsLeft = () => { const n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), h = Math.floor((m - n) / 36e5); return h >= 1 ? `${h} HOUR${h === 1 ? "" : "S"} LEFT` : `${Math.ceil((m - n) / 6e4)} MIN LEFT`; };
  const POPS = {
    course: () => `<h3>Your courses</h3>${SUBJ_ORDER.map((k) => { const S = SUBJECTS[k], p = progress(inSubj(k)); return `<button class="pc-row ${k === course ? "on" : ""}" data-s="${k}">${NIC.mascot({ who: S.who, size: 44, poke: false, mood: k === course ? "happy" : "idle" })}<span class="pc-t"><b>${S.name}</b><small>${S.code} · ${p.d}/${p.n} done</small><span class="pc-bar"><span style="transform:scaleX(${p.f})"></span></span></span></button>`; }).join("")}
      <label class="pc-search">${IC.search}<input type="search" placeholder="Find a lesson" autocomplete="off" aria-label="Find a lesson"><kbd>/</kbd></label><div class="pc-res"></div>`,
    streak: () => { const st = game.streak(), wk = game.week(); return `<div class="pop-hero">${NIC.mascot({ who: "blaze", size: 90, mood: st ? "happy" : "sleepy", act: st ? "dance" : "sleep", acc: st >= 7 ? ["crown"] : st >= 3 ? ["shades"] : [] })}<div><b class="big-n">${st}</b><span>day streak</span></div></div>
      <div class="ps-week small">${wk.map((d) => `<div class="ps-day ${d.on ? "on" : ""} ${d.frozen ? "frozen" : ""} ${d.today ? "today" : ""}"><span>${d.label}</span><i>${d.frozen ? NIC.emo("ice") : d.on ? IC.check : ""}</i></div>`).join("")}</div>
      ${!game.doneToday() && st && new Date().getHours() >= 18 ? `<div class="sk-risk">${NIC.emo("fire")}<b>Streak at risk!</b> Finish one lesson or practice before midnight.</div>` : ""}
      <p class="faint">${game.doneToday() ? "Today's done. See you tomorrow!" : "Finish a lesson or practice today to keep the flame alive."}</p>
      <div class="sk-freeze">${NIC.emo("ice")}<span><b>${game.freezes()}</b> streak freeze${game.freezes() === 1 ? "" : "s"}</span><small>Covers a missed day automatically. Finish all 3 daily quests to earn one (max 2).</small></div>`; },
    xp: () => { const tx = game.todayXP(), g = game.goal(); return `<div class="pop-hero">${ring(tx / g, 34, 10)}<div><b class="big-n">${tx}<small> / ${g} XP</small></b><span>today · ${game.totalXP()} XP total</span></div></div>
      <h4>Daily goal</h4><div class="seg goal-seg">${[[10, "Casual"], [20, "Regular"], [30, "Serious"], [50, "Intense"]].map(([v, t]) => `<button data-g="${v}" class="${v === g ? "on" : ""}">${t}<small>${v}</small></button>`).join("")}</div>`; },
    quests: () => `<div class="pop-hero">${NIC.mascot({ who: "chip", size: 80, mood: "happy", act: game.claimable() ? "dance" : "", acc: ["propeller"] })}<div><b>Daily quests</b><span class="q-left">${IC.clock}${questsLeft()}</span></div></div>
      ${game.quests().map((q) => `<div class="q-row ${q.done ? "done" : ""}"><div class="q-t"><b>${q.t}</b><span class="q-bar"><span style="transform:scaleX(${q.prog / q.n})"></span><i>${q.prog}/${q.n}</i></span></div>
        ${q.claimed ? `<span class="q-got">${IC.check}</span>` : q.done ? `<button class="q-claim" data-q="${q.id}">${IC.chest}<span>Claim</span></button>` : `<span class="q-chest">${IC.chest}</span>`}</div>`).join("")}`,
    me: () => `${syncRow()}<button class="menu-row" data-go="profile">${IC.face}<span>Profile & achievements</span></button><button class="menu-row" data-go="practice">${IC.dumbbell}<span>Practice mistakes</span></button>
      <button class="menu-row" data-act="sound">${IC.sound}<span>Sound: <b>${NIC.sfx.on() ? "on" : "off"}</b></span><kbd>M</kbd></button><button class="menu-row danger" data-act="reset">${IC.reset}<span>Reset all progress</span></button>`,
  };
  const POP_MOUNT = {
    course(card) {
      qsa(".pc-row", card).forEach((b) => b.addEventListener("click", () => { closePop(); location.hash = SUBJECTS[b.dataset.s].home; }));
      const inp = qs("input", card), res = qs(".pc-res", card);
      const run = () => {
        const f = inp.value.trim().toLowerCase();
        if (!f) { res.innerHTML = ""; return; }
        const hits = modules.filter((m) => (m.title + " " + m.num + " " + (m.blurb || "")).toLowerCase().includes(f)).slice(0, 8);
        res.innerHTML = hits.length ? hits.map((m) => `<button class="pc-hit" data-id="${m.id}"><span class="pc-num">${m.num}</span><span>${m.title}<small>${SUBJECTS[subjOf(m)].name}</small></span></button>`).join("") : `<p class="faint">No lessons match "${esc(f)}".</p>`;
        qsa(".pc-hit", res).forEach((b) => b.addEventListener("click", () => { closePop(); location.hash = b.dataset.id; }));
      };
      inp.addEventListener("input", run);
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { const h = qs(".pc-hit", res); if (h) h.click(); } });
      // touch: the keyboard would cover the course list, so only focus the search with a real pointer
      if (card.dataset.focus !== "no" && !matchMedia("(pointer: coarse)").matches) setTimeout(() => inp.focus(), 30);
    },
    xp(card) {
      const seg = qs(".goal-seg", card); segPill(seg, false);
      qsa("[data-g]", card).forEach((b) => b.addEventListener("click", () => {
        game.setGoal(+b.dataset.g); pickSeg(seg, b); renderTop();
        setTimeout(() => { if (popKind === "xp" && card.isConnected) closePop(); }, 200); // let the choice be seen
      }));
    },
    quests(card) {
      qsa(".q-claim", card).forEach((b) => b.addEventListener("click", () => {
        if (b.disabled) return; b.disabled = true;
        const row = b.closest(".q-row");
        NIC.sfx.play("chest");
        // the claim chest opens in place, like the path chest
        const old = qs("svg", b); old.outerHTML = CHEST(false);
        b.style.animation = "none";
        chestAnim(qs(".p-chest-svg", b), {
          onPop() { const n = game.claim(b.dataset.q); b.dataset.n = n; fx.floatText(b, `+${n} XP`, "#ff9600"); fx.celebrate(b, { silent: true }); },
          onEnd() {
            const got = el(`<span class="q-got">${IC.check}</span>`);
            b.replaceWith(got);
            fx.springIn(got, { from: 0.2, rot: -30, bounce: fx.SPRING_POP.bounce, dur: fx.SPRING_POP.duration });
            row.classList.add("claimed");
            renderTop();
          },
        });
      }));
    },
    me(card) {
      qsa("[data-go]", card).forEach((b) => b.addEventListener("click", () => { closePop(); location.hash = b.dataset.go; }));
      qs('[data-act="sound"]', card).addEventListener("click", () => { NIC.sfx.set(!NIC.sfx.on()); qs('[data-act="sound"] b', card).textContent = NIC.sfx.on() ? "on" : "off"; });
      qs('[data-act="reset"]', card).addEventListener("click", () => resetAll(() => qs('[data-pop="me"]', top)));
      wireSync(card);
    },
  };

  // ---------- account sync (js/sync.js) ----------
  const IC_CLOUD = `<svg viewBox="0 0 24 24"><path d="M7 18h10.5a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.4 9.1 4.5 4.5 0 0 0 7 18z" fill="currentColor"/></svg>`;
  function syncRow() {
    if (!NIC.sync) return "";
    const em = NIC.sync.email();
    return em ? `<div class="menu-row sy-row ${NIC.sync.busy && NIC.sync.busy() ? "busy" : ""}">${IC_CLOUD}<i class="sy-dot" title="Saving to your account"></i><span>Logged in<small>${esc(em.replace(/@cslingo.app$/, ""))}</small></span><button class="sy-out" data-act="signout">Sign out</button></div>`
      : `<button class="menu-row sy-row" data-act="signin">${IC_CLOUD}<span>Log in<small>Your progress follows your account</small></span></button>`;
  }
  function wireSync(root) {
    const i = qs('[data-act="signin"]', root), o = qs('[data-act="signout"]', root);
    const ret = root.classList.contains("pop-card") ? () => qs('[data-pop="me"]', top) : null; // opened from the menu: focus goes back to its button
    if (i) i.addEventListener("click", () => { closePop(); signInModal(ret); });
    // signing out changes the user, and NIC.sync.on below re-renders (one route, not two)
    if (o) o.addEventListener("click", async () => { if (!confirm("Log out on this device? Your progress stays in your account.")) return; closePop(); await NIC.sync.signOut(); });
  }
  /** Duolingo-style "Log in" screen: full-screen on phones, a centred column on desktop. Username maps to <name>@cslingo.app. */
  function signInModal(ret) {
    const eye = (on) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/>${on ? "" : '<path d="M4 20L20 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'}</svg>`;
    const m = modal(`<div class="si">
      <h1 class="si-h">Log in</h1>
      <form class="si-form" novalidate>
        <div class="si-group">
          <label class="si-field"><span class="sr-only">Username</span><input name="u" required autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Username"></label>
          <label class="si-field si-pw"><span class="sr-only">Password</span><input name="p" type="password" required autocomplete="current-password" placeholder="Password">
            <button type="button" class="si-eye" aria-label="Show password" aria-pressed="false">${eye(false)}</button></label>
        </div>
        <p class="si-msg" role="alert" hidden></p>
        <button class="btn big si-go" type="submit">Log in</button>
      </form>
      <div class="si-or"><span>How it works</span></div>
      <p class="si-foot">${NIC.mascot({ who: "chip", size: 44, mood: "happy", poke: false })}<span>Log in on any device and your progress is right there. Every lesson you finish is added to your account, never replaced.</span></p>
    </div>`, { cls: "si-modal", ret });
    m.classList.add("si-back");
    const f = qs(".si-form", m), msg = qs(".si-msg", m), btn = qs(".si-go", m), eyeB = qs(".si-eye", m), grp = qs(".si-group", m);
    const label = "Log in";
    eyeB.addEventListener("click", () => {
      const show = f.p.type === "password"; f.p.type = show ? "text" : "password";
      eyeB.innerHTML = eye(show); eyeB.setAttribute("aria-pressed", show); eyeB.setAttribute("aria-label", show ? "Hide password" : "Show password");
      f.p.focus({ preventScroll: true });
    });
    const clearErr = () => { grp.classList.remove("bad"); if (!msg.hidden) msg.hidden = true; };
    f.u.addEventListener("input", clearErr); f.p.addEventListener("input", clearErr);
    const fail = (text) => {
      msg.textContent = text; msg.hidden = false; grp.classList.add("bad");
      fx.reveal(msg); if (fx.ok) fx.shake(grp); NIC.sfx.play("wrong");
    };
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const u = f.u.value.trim(), pw = f.p.value;
      if (!u || !pw) { fail(!u ? "Enter your username." : "Enter your password."); (u ? f.p : f.u).focus(); return; }
      btn.disabled = true; btn.innerHTML = `Logging in<span class="sy-dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></span>`; btn.setAttribute("aria-busy", "true");
      try {
        await NIC.sync.signIn(u, pw);
        m.close(); NIC.sfx.play("check");
      } catch (err) {
        btn.disabled = false; btn.textContent = label; btn.removeAttribute("aria-busy");
        const t = String((err && err.message) || err);
        fail(/invalid|credential|password/i.test(t) ? "Wrong username or password." : `Couldn't log in: ${t}`);
      }
    });
  }
  // signed in or out: the top bar and (on Profile) the sync row change
  if (NIC.sync) NIC.sync.on(() => { renderTop(); if (lastRoute && lastRoute.tab === "profile" && !NIC.player.isOpen()) route(); });
  // a pending dot on the sync row while progress is being pushed (js/sync.js fires nic:sync)
  const syncBusy = () => qsa(".sy-row", document).forEach((r) => r.classList.toggle("busy", !!(NIC.sync && NIC.sync.busy && NIC.sync.busy())));
  window.addEventListener("nic:sync", syncBusy);

  /** Shared modal. ret: element (or function returning one) to focus on close when focus has nowhere else to go. */
  function modal(html, { cls = "", ret = null } = {}) {
    const m = el(`<div class="modal-back"><div class="modal ${cls}" role="dialog" aria-modal="true"><button class="modal-x" aria-label="Close">✕</button>${html}</div></div>`);
    document.body.appendChild(m);
    NIC.shield(true);
    // close hands focus and the page back at once (so another modal can open straight away), then animates out and removes
    const back = () => { // shield(false) refocuses the element that opened it; if that's gone (a closed popover), use ret
      const a = document.activeElement, t = typeof ret === "function" ? ret() : ret;
      if (t && t.isConnected && (!a || a === document.body || m.contains(a))) t.focus({ preventScroll: true });
    };
    const close = () => {
      if (m._open === false) return; m._open = false;
      document.removeEventListener("keydown", onK); NIC.shield(false); back();
      if (!fx.ok || !fx.exit || !m.isConnected) return m.remove();
      m.classList.add("m-ghost");
      Promise.all([fx.exit(qs(".modal", m), { y: 14, scale: 0.96 }), fx.exit(m, { scale: 1, dur: fx.DUR.s })]).then(() => m.remove());
    };
    m.close = close;
    new MutationObserver((r, o) => { if (!m.isConnected) { o.disconnect(); document.removeEventListener("keydown", onK); if (m._open !== false) { m._open = false; NIC.shield(false); } } }).observe(document.body, { childList: true }); // callers may just m.remove()
    setTimeout(() => { const f = m.querySelector("input, .modal button:not(.modal-x)"); if (f) f.focus(); }, 30);
    const onK = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onK);
    m.addEventListener("click", (e) => { if (e.target === m || e.target.closest(".modal-x")) close(); });
    if (fx.ok) {
      fx.clean(m, fx.animate(m, { opacity: [0, 1] }, { duration: fx.DUR.s }), ["opacity"]);
      const box = qs(".modal", m);
      fx.clean(box, fx.animate(box, fx.reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translateY(30px) scale(0.94)", "translateY(0px) scale(1)"] }, { ...fx.SPRING }));
    }
    return m;
  }
  NIC.modal = modal;

  function resetAll(ret) {
    closePop();
    const m = modal(`<div class="rs">${NIC.mascot({ who: "berry", size: 96, mood: "shocked" })}<h2>Reset everything?</h2>
      <p>Lessons, quizzes, XP, streak, quests, achievements and revision history on this device will be wiped.${NIC.sync && NIC.sync.email() ? " Your account's progress will be reset too." : ""} This can't be undone.</p>
      <div class="controls"><button class="btn" data-k="no">Keep my progress</button><button class="btn rose" data-k="yes">Reset</button></div></div>`, { cls: "rs-modal", ret: typeof ret === "function" ? ret : null });
    m.addEventListener("click", (e) => {
      const b = e.target.closest("[data-k]"); if (!b) return;
      if (b.dataset.k === "yes") {
        Object.keys(localStorage).filter((k) => k.startsWith("nic.") && !/^nic\.sync/.test(k)).forEach((k) => localStorage.removeItem(k));
        localStorage.setItem("nic.resetAt", String(Date.now())); localStorage.setItem("nic.syncForce", "1"); localStorage.setItem("nic.syncDirty", "1"); localStorage.setItem("nic.onboarded", "true");
        updateScore(); renderTop(); route();
        if (NIC.sync && NIC.sync.now) NIC.sync.now();
      }
      m.close();
    });
  }

  // =====================================================================
  //  Home: the path
  // =====================================================================
  const UNIT_COLORS = ["green", "blue", "violet", "orange"];
  const ROW = 104;
  const zig = (i) => Math.sin((i * Math.PI) / 4); // 0, .7, 1, .7, 0, -.7, -1, -.7 …
  const PATH_CAST = [
    { who: null, act: "juggle", acc: ["propeller"] },
    { who: "chip", act: "sleep", acc: ["nightcap"], mood: "sleepy" },
    { who: "blaze", act: "skate", acc: ["shades"], mood: "smug" },
    { who: "berry", act: "headbang", acc: ["headphones"], mood: "laugh" },
    { who: "pebble", act: "spin", acc: ["party"], mood: "happy" },
    { who: "byte", act: "wave", acc: ["tophat", "monocle"], mood: "wink" },
    { who: "sprout", act: "dance", acc: ["chef", "moustache"], mood: "laugh" },
    { who: "chip", act: "juggle", acc: ["wizard"], mood: "determined" },
  ];

  /** A round button that appears when the current lesson is scrolled off screen and takes you back to it. */
  function jumpButton(page) {
    const cur = qs(".p-row.cur", page); if (!cur || !window.IntersectionObserver) return;
    const b = el(`<button class="p-jump" aria-label="Jump to your current lesson" hidden><svg viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`);
    page.appendChild(b);
    b.addEventListener("click", () => { cur.scrollIntoView({ behavior: fx.reduce() ? "auto" : "smooth", block: "center" }); NIC.sfx.play("whoosh"); });
    let shown = false;
    const io = new IntersectionObserver(([e]) => {
      b.classList.toggle("up", e.boundingClientRect.top < 0); // the arrow flips with a transition (css/motion-app.css)
      const want = !e.isIntersecting;
      if (want === shown) return; shown = want;
      if (want) { b.hidden = false; fx.springIn(b, { from: 0.5, bounce: 0.4, dur: fx.SPRING_UI.duration }); }
      else if (!fx.ok || b.hidden) b.hidden = true;
      else { b.classList.add("m-ghost"); fx.exit(b, { scale: 0.6 }).then(() => { b.classList.remove("m-ghost"); b.style.opacity = ""; b.style.transform = ""; if (!shown) b.hidden = true; }); }
    }, { threshold: 0.2 });
    io.observe(qs(".p-node", cur)); life.onCleanup(() => io.disconnect());
  }

  /** A unit's path: its lessons, with a reward chest after every third lesson (like Duolingo's path chests). */
  function pathItems(list, lec) {
    const out = []; let n = 0;
    list.forEach((m, k) => {
      out.push({ m });
      if (!isBoss(m) && ++n % 3 === 0 && k < list.length - 1) out.push({ chest: `${subjOf(m)}-${lec}-${n}`, after: m.id });
    });
    return out;
  }
  /** Layered chest, so it can open where it sits: rays, open lid (behind), body, dark opening, closed lid, lock, coins. */
  const CHEST = (open) => `<svg viewBox="0 0 64 56" class="p-chest-svg${open ? " is-open" : ""}" overflow="visible">
    <g class="ch-rays">${Array.from({ length: 8 }, (_, k) => `<path d="M32 22 L25 -34 L39 -34Z" transform="rotate(${k * 45} 32 22)" fill="#ffc800"/>`).join("")}</g>
    <g class="ch-lid-o"><path d="M9 23 L14 2 H50 L55 23Z" fill="#e0a800"/><path d="M15 21 L19 5 H45 L49 21Z" fill="#a85f00"/></g>
    <rect x="6" y="20" width="52" height="30" rx="7" fill="#cd7900"/><rect x="6" y="28" width="52" height="5" fill="#a85f00"/>
    <rect x="16" y="20" width="6" height="30" fill="#a85f00" opacity=".5"/><rect x="42" y="20" width="6" height="30" fill="#a85f00" opacity=".5"/>
    <g class="ch-in"><rect x="8" y="19" width="48" height="9" rx="4.5" fill="#6b3d00"/><ellipse class="ch-glow" cx="32" cy="22" rx="20" ry="4.5" fill="#ffc800"/></g>
    <g class="ch-lid-c"><path d="M6 27a13 13 0 0 1 13-13h26a13 13 0 0 1 13 13v3H6z" fill="#ff9600"/><rect x="6" y="28" width="52" height="2" fill="#a85f00"/><rect x="16" y="14" width="6" height="16" fill="#a85f00" opacity=".5"/><rect x="42" y="14" width="6" height="16" fill="#a85f00" opacity=".5"/></g>
    <rect x="26" y="27" width="12" height="13" rx="3.5" fill="#ffc800"/><circle cx="32" cy="33" r="2" fill="#a85f00"/>
    <g class="ch-coins">${Array.from({ length: 6 }, () => `<circle class="ch-coin" cx="32" cy="22" r="3.6" fill="#ffc800" stroke="#cd7900" stroke-width="1.2"/>`).join("")}</g></svg>`;
  function chestRow(it, i) {
    const opened = !!store.get("nic.chests", {})[it.chest], ready = !opened && status(modules.find((x) => x.id === it.after)) === "done";
    return `<div class="p-row p-chest-row ${opened ? "opened" : ready ? "ready" : "locked"}" style="--k:${zig(i).toFixed(3)};top:${i * ROW}px" data-chest="${it.chest}">
      <button class="p-chest" aria-label="${opened ? "Opened chest" : ready ? "Open reward chest" : "Reward chest: finish the lesson before it"}" ${ready ? "" : "disabled"}>${CHEST(opened)}</button></div>`;
  }
  /** The chest opens in place: squash and shake, the lid flips back on its hinge, light pours out, coins arc up and fall. */
  function chestAnim(svg, { onPop, onEnd }) {
    const end = () => { svg.classList.add("is-open"); svg.getAnimations({ subtree: true }).forEach((a) => a.cancel()); onEnd(); };
    if (!fx.ok || fx.reduce() || !svg.animate) { svg.classList.add("is-open"); onPop(); setTimeout(end, 300); return; }
    const q1 = (c) => qs("." + c, svg), hinge = "32px 22px", all = [];
    const go = (el, kf, o) => { const a = el.animate(kf, { fill: "both", ...o }); all.push(a); return a; };
    go(svg, [{ transform: "scale(1,1)" }, { transform: "scale(1.1,.86)" }, { transform: "scale(.96,1.07) rotate(-5deg)" }, { transform: "scale(1.04,.97) rotate(5deg)" }, { transform: "scale(1,1) rotate(0deg)" }], { duration: 420, easing: "ease-in-out", transformOrigin: "50% 100%" });
    go(q1("ch-lid-c"), [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { delay: 420, duration: 90, easing: "ease-in", transformOrigin: hinge });
    go(q1("ch-lid-o"), [{ opacity: 1, transform: "scaleY(0)" }, { opacity: 1, transform: "scaleY(1.12)" }, { opacity: 1, transform: "scaleY(1)" }], { delay: 510, duration: 300, easing: "cubic-bezier(.3,1.4,.5,1)", transformOrigin: hinge });
    go(q1("ch-in"), [{ opacity: 0 }, { opacity: 1 }], { delay: 520, duration: 120 });
    go(q1("ch-glow"), [{ opacity: 0 }, { opacity: 0.95 }, { opacity: 0.35 }], { delay: 520, duration: 700 });
    go(q1("ch-rays"), [{ opacity: 0, transform: "scale(.4) rotate(0deg)" }, { opacity: 0.5, transform: "scale(1) rotate(10deg)", offset: 0.3 }, { opacity: 0, transform: "scale(1.2) rotate(28deg)" }], { delay: 520, duration: 900, easing: "ease-out", transformOrigin: hinge });
    go(svg, [{ transform: "scale(1,1)" }, { transform: "scale(1.09,.93)" }, { transform: "scale(1,1)" }], { delay: 520, duration: 260, easing: "ease-out", transformOrigin: "50% 100%" }).finished.catch(() => {});
    qsa(".ch-coin", svg).forEach((c, i) => {
      const dx = (i - 2.5) * 14, peak = -40 - (i % 3) * 9;
      go(c, [
        { opacity: 0, transform: "translate(0px,0px) scale(.5)", easing: "cubic-bezier(.2,.7,.4,1)" },
        { opacity: 1, transform: `translate(${dx * 0.6}px,${peak}px) scale(1.05)`, offset: 0.48, easing: "cubic-bezier(.5,0,.9,.6)" },
        { opacity: 1, transform: `translate(${dx}px,${6 + (i % 2) * 6}px) scale(.9)`, offset: 0.9 },
        { opacity: 0, transform: `translate(${dx * 1.05}px,${10 + (i % 2) * 6}px) scale(.8)` },
      ], { delay: 540 + i * 50, duration: 820 });
    });
    setTimeout(onPop, 600);
    setTimeout(end, 1700);
  }
  function openChest(row) {
    const id = row.dataset.chest, c = store.get("nic.chests", {});
    if (c[id]) return;
    c[id] = NIC.game.today(); store.set("nic.chests", c);
    const b = qs(".p-chest", row), svg = qs(".p-chest-svg", b), xp = 5 + Math.floor(Math.random() * 6);
    NIC.sfx.play("chest");
    b.disabled = true;
    row.classList.remove("ready"); row.classList.add("paying");
    chestAnim(svg, {
      onPop() { game.award(xp, "chest"); fx.floatText(b, `+${xp} XP`, "#ff9600"); fx.celebrate(b, { silent: true }); },
      onEnd() { row.classList.remove("paying"); row.classList.add("opened"); },
    });
  }

  /** The boss in this course with the lowest score under 80%, if any. */
  function weakBoss(s) {
    const q = store.get("nic.quiz", {});
    return inSubj(s).filter(isBoss).map((m) => { const B = NIC.bossDef(m.id); if (!B) return null; const n = B.qs.length, c = B.qs.filter((_, i) => q[`${m.id}-${i}`] && q[`${m.id}-${i}`].ok).length; return { m, f: c / n }; })
      .filter((x) => x && x.f < 0.8).sort((a, b) => a.f - b.f).map((x) => x.m)[0] || null;
  }

  /** "What should I do now?" One primary action (continue > due reviews > next lesson) plus the others as chips. */
  function todayCard(s, all, next) {
    const pos = store.get("nic.lessonPos", {});
    const started = all.find((m) => status(m) !== "done" && pos[m.id] > 0);
    const due = NIC.bank ? NIC.bank.stats({ subjects: [s] }).due : 0;
    const miss = NIC.player.missed.all().length;
    const acts = [];
    if (started) { const L = NIC.LESSONS[started.id]; acts.push({ k: "cont", to: started.id, t: `Continue ${esc(started.title)}`, sub: L ? `You stopped partway through` : "", icon: IC.play }); }
    if (due >= 5) acts.push({ k: "due", to: "practice/due", t: `Review ${due} due question${due === 1 ? "" : "s"}`, sub: "Short spaced reviews keep it stuck", icon: IC.reset });
    if (next && (!started || next !== started)) acts.push({ k: "next", to: next.id, t: `${status(next) === "new" && !Object.keys(store.get("nic.lessonDone", {})).length ? "Start" : "Next"}: ${esc(next.title)}`, sub: `${next.num === "Boss" ? "Boss quiz" : "Lesson " + next.num}`, icon: IC.star });
    if (due > 0 && due < 5) acts.push({ k: "due", to: "practice/due", t: `Review ${due} due`, icon: IC.reset });
    if (miss) acts.push({ k: "miss", to: "practice/mistakes", t: `Fix ${miss} mistake${miss === 1 ? "" : "s"}`, icon: IC.dumbbell });
    if (!acts.length) return "";
    const [top, ...rest] = acts;
    return `<div class="td-card"><button class="td-main" data-to="${top.to}"><span class="td-ic">${top.icon}</span><span class="td-t"><small>Up next</small><b>${top.t}</b>${top.sub ? `<em>${top.sub}</em>` : ""}</span><span class="td-go">${IC.play}</span></button>
      ${rest.length ? `<div class="td-more">${rest.slice(0, 3).map((a) => `<button class="td-chip" data-to="${a.to}">${a.icon}<span>${a.t}</span></button>`).join("")}</div>` : ""}</div>`;
  }

  /** Where the path is scrolled to: the first row on screen and its offset (content above can change height, e.g. the Up next card). */
  const pathKey = (r) => r.dataset.id || r.dataset.chest;
  function pathAnchor() {
    const r = qsa(".p-row", main).find((x) => x.getBoundingClientRect().top >= 80);
    return { y: window.scrollY, key: r ? pathKey(r) : null, top: r ? r.getBoundingClientRect().top : 0 };
  }
  /** Put that row back at the same place; again next frame, after late layout (emoji icons, fonts) above it settles. */
  function restorePath(page, a) {
    const go = () => {
      if (!page.isConnected) return;
      const r = a.key && qsa(".p-row", page).find((x) => pathKey(x) === a.key);
      window.scrollTo(0, r ? window.scrollY + r.getBoundingClientRect().top - a.top : a.y);
    };
    go(); requestAnimationFrame(go);
  }
  /** quiet: the same path is being rebuilt (lesson closed, theme flip), so nothing re-enters. at: a pathAnchor() to restore. */
  function home(s, { quiet = false, at = null } = {}) {
    const S = SUBJECTS[s], all = inSubj(s), P = progress(all);
    const lastId = store.get("nic.last", {})[s], last = modules.find((m) => m.id === lastId);
    const next = all.find((m) => status(m) !== "done");
    const resume = last && status(last) !== "done" ? last : next;
    const lecs = Object.entries(S.lectures).filter(([lec]) => inLec(s, lec).length);
    const page = el(`<div class="page path-page">
      ${NIC.art ? NIC.art.banner(s, { title: S.name, sub: `${S.code} · ${P.d}/${P.n} lessons done` }) : ""}
      ${todayCard(s, all, next)}
      <div class="unit-sticky"><div class="us-in"></div></div>
      ${lecs.map(([lec, title], u) => {
        const list = inLec(s, lec), p = progress(list), col = UNIT_COLORS[u % 4];
        const [lbl, ttl] = title.includes(" — ") ? title.split(" — ") : [`${S.unit} ${lec}`, title];
        const cast = PATH_CAST[u % PATH_CAST.length], side = u % 2 ? "right" : "left";
        const castRow = Math.min(list.length - 1, 2);
        return `<section class="unit u-${col}" data-u="${u}" data-lbl="${esc(lbl)}" data-ttl="${esc(ttl)}" data-p="${p.d}/${p.n}" data-lec="${lec}">
          ${u ? `<div class="unit-divider"><span>${lbl} · ${ttl}</span></div>` : ""}
          <div class="path" style="height:${pathItems(list, lec).length * ROW + 20}px">
            ${pathItems(list, lec).map((it, i) => {
              if (it.chest) return chestRow(it, i);
              const m = it.m;
              const st = status(m), boss = isBoss(m), cur = resume === m;
              const topic = !boss && window.FLUENT_EMOJI && FLUENT_EMOJI.topics && FLUENT_EMOJI.topics[m.id];
              const ic = topic ? NIC.emo(topic, "p-topic") + (st === "done" ? `<span class="p-badge">${IC.check}</span>` : "") : st === "done" ? (boss ? IC.trophy : IC.check) : boss ? IC.trophy : cur ? IC.play : IC.star;
              const L = NIC.LESSONS[m.id], pos = (store.get("nic.lessonPos", {})[m.id] || 0), frac = st === "started" && L ? Math.min(0.95, pos / (L.steps.length + L.steps.filter((x) => x.c).length + 2)) : 0;
              return `<div class="p-row st-${st} ${boss ? "boss" : ""} ${cur ? "cur" : ""}" style="--k:${zig(i).toFixed(3)};top:${i * ROW}px" data-id="${m.id}">
                <button class="p-node" aria-label="${m.num} ${esc(m.title)}">${cur || st === "started" ? `<svg class="p-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="var(--line)" stroke-width="8"/><circle cx="50" cy="50" r="46" fill="none" stroke="var(--u)" stroke-width="8" stroke-linecap="round" stroke-dasharray="289" stroke-dashoffset="${289 * (1 - frac)}" transform="rotate(-90 50 50)"/></svg>` : ""}<span class="p-face">${ic}</span></button>
                ${cur ? `<span class="p-bubble">${status(m) === "started" ? "Continue" : P.d ? "Jump in" : "Start"}</span>` : ""}</div>`;
            }).join("")}
            <div class="p-cast ${side}" style="top:${castRow * ROW - 10}px">${NIC.mascot({ who: cast.who || S.who, size: 110, act: cast.act, acc: cast.acc, mood: cast.mood || "idle" })}</div>
          </div></section>`;
      }).join("")}
      <div class="path-end ${P.d === P.n ? "won" : ""}">${NIC.mascot({ who: S.who, size: 100, mood: P.d === P.n ? "love" : "determined", acc: ["crown"], act: P.d === P.n ? "dance" : "" })}<b>${P.d === P.n ? "Course complete!" : `${P.n - P.d} to go`}</b><span class="faint">${S.name} · ${P.d}/${P.n} done</span>
        ${P.d === P.n ? `<div class="pe-acts"><button class="btn primary" data-to="practice/due">Revise this course</button>${weakBoss(s) ? `<button class="btn" data-to="${weakBoss(s).id}">Retry ${esc(weakBoss(s).title)}</button>` : ""}</div>` : ""}</div>
    </div>`);
    main.appendChild(page);
    if (at) restorePath(page, at);
    if (NIC.art) page.style.setProperty("--pat", NIC.art.pattern({ nic: "leaves", ds: "waves", algo: "circuit" }[s] || "dots"));
    qsa(".p-node", page).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); nodePop(b.closest(".p-row")); }));
    wireTips(page);
    rail();
    qsa(".p-chest-row.ready", page).forEach((r) => qs(".p-chest", r).addEventListener("click", (e) => { e.stopPropagation(); openChest(r); }));
    jumpButton(page);
    qsa("[data-to]", page).forEach((b) => b.addEventListener("click", () => { location.hash = b.dataset.to; }));
    stickyHeader(page, quiet);
    // entrance: nodes on the first screen spring in one after another; the rest spring in as they scroll into view
    if (!quiet) {
      const pops = qsa(".p-node, .p-chest, .p-cast .mascot", page);
      let k0 = 0;
      pops.forEach((n) => { if (n.getBoundingClientRect().top < innerHeight * 0.92) popNode(n, 0.05 + k0++ * 0.05); });
      life.onCleanup(fx.onView(pops, { run: (n) => popNode(n, 0) }));
    }
    life.onCleanup(NIC.cast.idle(page));
    // came back from a finished lesson: glide to the next node and nudge it
    if (NIC.lastFinished) {
      const fin = NIC.lastFinished; NIC.lastFinished = null;
      const target = qs(".p-row.cur", page) || qs(`.p-row[data-id="${fin}"]`, page);
      if (target) setTimeout(() => {
        target.scrollIntoView({ behavior: fx.reduce() ? "auto" : "smooth", block: "center" });
        setTimeout(() => {
          fx.bump(qs(".p-node", target), { scale: 1.2 }); NIC.sfx.play("pop");
          const mark = qs(`.p-row[data-id="${fin}"] .p-badge, .p-row.st-done[data-id="${fin}"] .p-face > svg`, page); // the check mark you just earned
          if (mark && mark.isConnected) fx.springIn(mark, { from: 0, rot: -40, bounce: 0.6, delay: 0.12 });
        }, 500);
      }, 200);
    } else if (!at) { // first visit: bring the current lesson on screen
      const cur = qs(".p-row.cur", page);
      if (cur && cur.getBoundingClientRect().top > innerHeight * 0.75) cur.scrollIntoView({ block: "center" });
    }
  }

  /** One path item springs in; a finished node's check mark pops a beat later. Mascots rise instead. */
  function popNode(n, delay) {
    if (n.classList.contains("mascot")) {
      if (!fx.ok) return;
      const a = fx.animate(n, fx.reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translateY(30px) scale(0.7)", "translateY(0px) scale(1)"] }, { ...fx.SPRING_POP, bounce: 0.4, delay: delay + 0.2 });
      fx.clean(n, a);
      return;
    }
    fx.springIn(n, { delay, from: 0.3, bounce: 0.45 });
    const mark = n.closest(".st-done") && (qs(".p-badge", n) || qs(".p-face > svg", n));
    if (mark && !fx.reduce()) fx.springIn(mark, { delay: delay + 0.2, from: 0, rot: -30, bounce: 0.6, dur: fx.SPRING_POP.duration });
  }

  /** The sticky banner shows whichever unit you're scrolling through. */
  function stickyHeader(page, quiet) {
    const box = qs(".unit-sticky", page), inn = qs(".us-in", box), units = qsa(".unit", page);
    let curU = -1;
    const paint = (u, still = false) => {
      if (u === curU) return; const dir = u > curU ? 1 : -1; curU = u;
      const sec = units[u];
      box.className = `unit-sticky u-${UNIT_COLORS[u % 4]}`;
      inn.innerHTML = `<div class="us-t"><small>${sec.dataset.lbl} · ${sec.dataset.p}</small><h2>${sec.dataset.ttl}</h2></div><button class="us-guide">${IC.book}<span>Guidebook</span></button>`;
      qs(".us-guide", inn).addEventListener("click", () => guidebook(sec));
      // the banner is sticky: never leave an inline transform on it
      if (!still && fx.ok && !fx.reduce()) fx.clean(inn, fx.animate(inn, { opacity: [0, 1], transform: [`translateY(${10 * dir}px)`, "translateY(0px)"] }, { duration: fx.DUR.m, ease: fx.EASE }));
    };
    const unitAt = () => {
      const y = box.getBoundingClientRect().bottom;
      let u = 0; units.forEach((sec, k) => { if (sec.getBoundingClientRect().top < y + 10) u = k; });
      return u;
    };
    const spy = () => paint(unitAt());
    let q = false;
    const onScroll = () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; spy(); }); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    life.onCleanup(() => window.removeEventListener("scroll", onScroll));
    paint(unitAt(), quiet); // a restored scroll may start in a later unit
  }

  function guidebook(sec) {
    const s = course, list = inLec(s, sec.dataset.lec);
    modal(`<div class="gb-head u-${UNIT_COLORS[+sec.dataset.u % 4]}">${NIC.mascot({ who: SUBJECTS[s].who, size: 84, mood: "smug", acc: ["detective"] })}<div><small>${sec.dataset.lbl} guidebook</small><h2>${sec.dataset.ttl}</h2></div></div>
      ${list.map((m) => { const L = NIC.LESSONS[m.id]; return `<div class="gb-mod"><h3><span class="gb-num">${m.num}</span>${m.title}</h3>${L && L.sum ? `<p>${L.sum}</p>` : `<p>${m.blurb || ""}</p>`}${L ? `<ul>${L.steps.map((st) => `<li>${st.t}</li>`).join("")}</ul>` : ""}</div>`; }).join("")}`, { cls: "guidebook" });
  }

  /** What a lesson holds, for the path tooltip and the node popover. */
  function lessonInfo(m) {
    const list = inSubj(subjOf(m)).filter((x) => x.lecture === m.lecture), idx = list.indexOf(m) + 1;
    if (isBoss(m)) {
      const B = NIC.bossDef(m.id) || { qs: [] }, n = B.qs.length;
      return { boss: true, idx, of: list.length, qs: n, mins: Math.max(2, Math.round(n * 0.6)), topics: list.filter((x) => !isBoss(x)).map((x) => x.title) };
    }
    const L = NIC.LESSONS[m.id] || { steps: [] }, steps = L.steps || [];
    const qs = steps.filter((s) => s.c).length, demo = !!(L.guide && L.guide.length), runner = steps.some((s) => typeof s.v === "function" && /run\(/i.test(String(s.v)));
    return { idx, of: list.length, sum: L.sum || m.blurb || "", steps: steps.map((s) => s.t), qs, demo, runner, mins: Math.max(2, Math.round(steps.length * 0.6 + qs * 0.3 + (demo ? 2 : 0))) };
  }
  const infoChips = (I) => `<div class="pt-chips"><span>${IC.clock || ""}~${I.mins} min</span>${I.qs ? `<span>${I.qs} question${I.qs > 1 ? "s" : ""}</span>` : ""}${I.demo ? "<span>live demo</span>" : ""}${I.runner ? '<span class="pt-run">runs step by step</span>' : ""}</div>`;
  const infoList = (I) => {
    const items = I.boss ? I.topics : I.steps, max = 5;
    return items.length ? `<ol class="pt-list">${items.slice(0, max).map((t) => `<li>${t}</li>`).join("")}</ol>${items.length > max ? `<div class="pt-more">+${items.length - max} more</div>` : ""}` : "";
  };

  let tipEl = null, tipT = 0;
  function hideTip() {
    clearTimeout(tipT); if (!tipEl) return;
    const g = tipEl; tipEl = null;
    if (!fx.ok || !fx.exit || !g.isConnected) return g.remove();
    g.classList.add("m-ghost"); fx.exit(g, { scale: 0.96, dur: fx.DUR.xs }).then(() => g.remove());
  }
  function showTip(row) {
    if (nodePopEl || (tipEl && tipEl.parentElement === row)) return;
    hideTip();
    const m = modules.find((x) => x.id === row.dataset.id), I = lessonInfo(m);
    const side = parseFloat(row.style.getPropertyValue("--k")) > 0.2 ? "left" : "right";
    tipEl = el(`<div class="pt-tip pt-${side}" role="tooltip">
      <small>${I.boss ? `Boss quiz · ${I.topics.length} lessons` : `Lesson ${I.idx} of ${I.of} · ${m.num}`}</small>
      <b>${m.title}</b>${I.boss ? `<p>${m.blurb || ""}</p><div class="pt-h">Covers</div>` : `<p>${I.sum}</p><div class="pt-h">Inside</div>`}
      ${infoList(I)}${infoChips(I)}</div>`);
    row.appendChild(tipEl);
    { // keep it above the dock: slide it up and move the arrow down to stay on the node
      const r = tipEl.getBoundingClientRect(), dockTop = (qs("#dock") && qs("#dock").getBoundingClientRect().top) || innerHeight, over = r.bottom - (dockTop - 10);
      if (over > 0) { const up = Math.min(over, r.height - 70); tipEl.style.top = `${-6 - up}px`; tipEl.style.setProperty("--ay", `${36 + up}px`); }
    }
    if (fx.ok) fx.clean(tipEl, fx.animate(tipEl, fx.reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: [`translateX(${side === "left" ? 8 : -8}px) scale(0.92)`, "translateX(0px) scale(1)"] }, { ...fx.SPRING_UI }));
  }
  function wireTips(page) {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    qsa(".p-node", page).forEach((b) => {
      const row = b.closest(".p-row");
      b.addEventListener("mouseenter", () => { clearTimeout(tipT); tipT = setTimeout(() => showTip(row), 280); });
      b.addEventListener("mouseleave", hideTip);
      b.addEventListener("focus", () => showTip(row));
      b.addEventListener("blur", hideTip);
    });
    life.onCleanup(hideTip);
  }

  let nodePopEl = null;
  function closeNodePop() {
    if (!nodePopEl) return;
    const g = nodePopEl; nodePopEl = null;
    if (!fx.ok || !fx.exit || !g.isConnected) return g.remove();
    g.classList.add("m-ghost"); fx.exit(g, { base: "translateX(-50%)", y: -8, scale: 0.9, dur: fx.DUR.s }).then(() => g.remove());
  }
  function nodePop(row) {
    const had = nodePopEl && nodePopEl.parentElement === row;
    closeNodePop(); hideTip();
    if (had) return;
    const m = modules.find((x) => x.id === row.dataset.id), st = status(m), I = lessonInfo(m), boss = isBoss(m);
    const btn = boss ? (st === "done" ? "Retake quiz" : st === "started" ? "Continue quiz" : "Start quiz +20 XP") : st === "done" ? "Review +5 XP" : st === "started" ? "Continue" : "Start +10 XP";
    nodePopEl = el(`<div class="node-pop"><b>${m.title}</b><small>${boss ? "Boss quiz" : `Lesson ${I.idx} of ${I.of} · ${m.num}`}</small><p>${m.blurb || ""}</p>
      <details class="np-more"><summary>${boss ? "What it covers" : "What's inside"}</summary>${infoList(I)}</details>${infoChips(I)}<button class="btn big np-go">${btn}</button>${!boss && st === "started" && (store.get("nic.lessonPos", {})[m.id] || 0) > 0 ? `<button class="np-restart">Start over</button>` : ""}</div>`);
    row.appendChild(nodePopEl);
    { // stay inside the screen on phones; the arrow keeps pointing at the node
      const r = nodePopEl.getBoundingClientRect(), dx = r.right > innerWidth - 12 ? r.right - (innerWidth - 12) : r.left < 12 ? r.left - 12 : 0;
      if (dx) { nodePopEl.style.marginLeft = `${-dx}px`; nodePopEl.style.setProperty("--ax", `${dx}px`); }
    }
    NIC.sfx.play("pop");
    // grows out of its node: transform-origin sits on the arrow tip (css/motion.css)
    // cleaned afterwards: the CSS translateX(-50%) takes over again
    if (fx.ok) fx.clean(nodePopEl, fx.animate(nodePopEl, fx.reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translateX(-50%) translateY(-12px) scale(0.6)", "translateX(-50%) translateY(0px) scale(1)"] }, { ...fx.SPRING }));
    // START: the node squashes and the player grows out of it (js/player.js reads originRect)
    const launch = () => {
      const node = qs(".p-node", row);
      closeNodePop();
      if (node) {
        if (fx.ok && !fx.reduce()) fx.clean(node, fx.animate(node, { transform: ["scale(1)", "scale(0.86)", "scale(1)"] }, { duration: fx.DUR.m, ease: fx.EASE, times: [0, 0.4, 1] }), ["transform"]);
        NIC.player.originRect = node.getBoundingClientRect();
      }
      location.hash = m.id;
    };
    qs(".np-go", nodePopEl).addEventListener("click", (e) => { e.stopPropagation(); launch(); });
    const rs = qs(".np-restart", nodePopEl);
    if (rs) rs.addEventListener("click", (e) => { e.stopPropagation(); const p = store.get("nic.lessonPos", {}); delete p[m.id]; store.set("nic.lessonPos", p); launch(); });
    setTimeout(() => { if (nodePopEl) qs(".np-go", nodePopEl).focus({ preventScroll: true }); }, 30);
    const r = nodePopEl.getBoundingClientRect();
    if (r.bottom > innerHeight - 90) window.scrollBy({ top: r.bottom - innerHeight + 110, behavior: fx.reduce() ? "auto" : "smooth" });
  }

  // =====================================================================
  //  Practice + Profile pages
  // =====================================================================
  function practicePage(tab) {
    const miss = NIC.player.missed.all(), due = NIC.bank ? NIC.bank.stats().due : 0;
    tab = tab || (miss.length && !due ? "mistakes" : "due");
    // the tabs are built once; switching Due <-> Mistakes (or coming back from a session) only swaps the panel below them
    let tabs = qs(".pr-tabs-wrap", main);
    const was = tabs ? tabs.dataset.tab : null;
    if (!tabs) {
      tabs = el(`<div class="page side-page pr-tabs-wrap"><div class="seg pr-tabs" role="tablist">
        <button role="tab" data-t="due" aria-selected="false"></button><button role="tab" data-t="mistakes" aria-selected="false"></button></div></div>`);
      main.appendChild(tabs);
      qsa("[data-t]", tabs).forEach((b) => b.addEventListener("click", () => { location.hash = "practice/" + b.dataset.t; }));
    } else while (tabs.nextSibling) tabs.nextSibling.remove();
    tabs.dataset.tab = tab;
    const seg = qs(".pr-tabs", tabs);
    qs('[data-t="due"]', seg).innerHTML = `Due reviews${due ? ` <i class="pr-n">${due}</i>` : ""}`;
    qs('[data-t="mistakes"]', seg).innerHTML = `Mistakes${miss.length ? ` <i class="pr-n">${miss.length}</i>` : ""}`;
    if (!was) segPill(seg, false);
    pickSeg(seg, qs(`[data-t="${tab}"]`, seg));
    const inPlace = !!was, before = main.children.length;
    // one animation per change: the panel slides in from the side of the tab you picked (nothing when it's the same tab again)
    const slide = () => { if (inPlace && was !== tab) fx.enter(Array.from(main.children).slice(before), { x: tab === "due" ? -14 : 14, y: 0, stagger: 0, dur: fx.DUR.m }); };
    if (tab === "due") { NIC.revisePage(main, life, { names: Object.fromEntries(SUBJ_ORDER.map((k) => [k, SUBJECTS[k].name])), calm: calm || inPlace }); slide(); return; }
    const page = el(`<div class="page side-page">
      <div class="sp-hero u-violet">${NIC.mascot({ who: "berry", size: 140, mood: "determined", act: "headbang", acc: ["headphones"] })}<div><h1>Practice</h1><p>Mistakes you made land here. Fix them and they're gone. The rest is a mixed refresh from lessons you've finished.</p></div></div>
      <div class="card sp-card"><div class="sp-stat"><b>${miss.length}</b><span>mistakes waiting</span></div><button class="btn big primary" id="pStart">Start practice</button></div>
      ${!miss.length && NIC.art ? `<div class="card ab-empty-card">${NIC.art.empty("practice")}<b>No mistakes waiting</b><span class="faint">Anything you get wrong in a lesson lands here to fix later.</span></div>` : ""}
      ${miss.length ? `<div class="card"><h3>Waiting to be fixed</h3><ul class="sp-list">${miss.slice(-6).reverse().map((x) => { const Q = x.boss ? (NIC.bossDef(x.boss) || { qs: [] }).qs[x.i] : x.Q; return Q ? `<li>${Q.q}</li>` : ""; }).join("")}</ul></div>` : ""}
    </div>`);
    main.appendChild(page);
    qs("#pStart", page).addEventListener("click", () => NIC.player.practice({ home: "practice/mistakes" }));
    if (inPlace) slide(); else if (!calm) fx.enter(Array.from(page.children), { stagger: 0.05 });
  }

  function profilePage() {
    const st = game.stats(), ach = game.achState(), un = game.unlockedAcc();
    const who = ["sprout", "pebble", "byte", "blaze", "chip", "berry"];
    // every character wears something different from the unlocked wardrobe (one item per slot)
    const acc = (k) => { const out = [], slots = new Set(); for (let j = 0; j < un.length && out.length < 2; j++) { const a = un[(k * 2 + j) % un.length], sl = NIC.cast.ACC[a] && NIC.cast.ACC[a].slot; if (sl && !slots.has(sl)) { slots.add(sl); out.push(a); } } return out; };
    const page = el(`<div class="page side-page">
      <div class="shelf">${who.map((w, k) => `<div class="shelf-spot">${NIC.mascot({ who: w, size: 92, acc: acc(k), mood: ["happy", "wink", "smug", "laugh", "love", "determined"][k], act: ["", "", "wave", "", "", "dance"][k] })}<span>${NIC.cast.CHARS[w].name}</span></div>`).join("")}</div>
      <p class="faint shelf-hint">Tap a character to poke it. Unlock more hats and gadgets with achievements.</p>
      <div class="stat-grid">
        <div class="pf-stat">${IC.flame.replace('fill="currentColor"', 'fill="#ff9600"')}<b>${game.streak()}</b><span>Day streak</span></div>
        <div class="pf-stat"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="#ffc800" stroke="#ff9600" stroke-width="1.6" stroke-linejoin="round"/></svg><b>${game.totalXP()}</b><span>Total XP</span></div>
        <div class="pf-stat">${IC.check.replace('stroke="currentColor"', 'stroke="#58cc02"')}<b>${Object.keys(store.get("nic.lessonDone", {})).length}</b><span>Lessons done</span></div>
        <div class="pf-stat"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#1cb0f6" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#1cb0f6"/></svg><b>${st.answered ? Math.round((100 * st.right) / st.answered) : 0}%</b><span>Accuracy</span></div>
      </div>
      <h2>Achievements</h2>${!game.ACH.some((a) => ach[a.id]) && NIC.art ? `<div class="card ab-empty-card">${NIC.art.empty("achievements")}<b>No achievements yet</b><span class="faint">Finish your first lesson to unlock your first hat.</span></div>` : ""}
      <div class="ach-grid">${game.ACH.map((a) => `<div class="ach ${ach[a.id] ? "got" : ""}">${NIC.mascot({ who: "sprout", size: 64, acc: [a.acc], mood: ach[a.id] ? "happy" : "sleepy", poke: !!ach[a.id] })}${ach[a.id] ? "" : `<span class="ach-lock">${IC.lock}</span>`}<b>${a.t}</b><span>${a.d}</span><small>${ach[a.id] ? `Unlocked ${NIC.cast.ACC[a.acc].name}` : `Unlocks ${NIC.cast.ACC[a.acc].name}`}</small></div>`).join("")}</div>
      <h2>Settings</h2>
      <div class="card settings"><div class="set-row"><b>Daily goal</b><div class="seg goal-seg">${[[10, "Casual"], [20, "Regular"], [30, "Serious"], [50, "Intense"]].map(([v, t]) => `<button data-g="${v}" class="${v === game.goal() ? "on" : ""}">${t}<small>${v} XP</small></button>`).join("")}</div></div>
        ${NIC.sync ? `<div class="set-row"><b>Account</b>${NIC.sync.email() ? `<span class="faint">${esc(NIC.sync.email())}</span><button class="btn" data-act="signout">Sign out</button>` : `<button class="btn primary" data-act="signin">Log in</button>`}</div>` : ""}
        ${NIC.theme ? `<div class="set-row"><b>Theme</b><div class="seg theme-seg" role="radiogroup" aria-label="Theme">${[["system", "System", IC.themeSys], ["light", "Light", IC.sun], ["dark", "Dark", IC.moon]].map(([v, t, ic]) => `<button role="radio" data-theme-pick="${v}" aria-checked="${NIC.theme.get() === v}" class="${NIC.theme.get() === v ? "on" : ""}">${ic}${t}</button>`).join("")}</div></div>` : ""}
        <div class="set-row"><b id="pfSoundL">Sound effects</b><button class="pf-sw ${NIC.sfx.on() ? "on" : ""}" id="pfSound" role="switch" aria-checked="${NIC.sfx.on()}" aria-labelledby="pfSoundL"><i></i></button></div>
        <div class="set-row"><b>Progress</b><button class="btn rose" id="pfReset">Reset everything</button></div></div>
    </div>`);
    main.appendChild(page);
    const goalSeg = qs(".goal-seg", page), themeSeg = qs(".theme-seg", page);
    segPill(goalSeg, false); segPill(themeSeg, false);
    qsa("[data-g]", page).forEach((b) => b.addEventListener("click", () => { game.setGoal(+b.dataset.g); pickSeg(goalSeg, b); renderTop(); }));
    const snd = qs("#pfSound", page);
    snd.addEventListener("click", () => { NIC.sfx.set(!NIC.sfx.on()); const on = NIC.sfx.on(); snd.classList.toggle("on", on); snd.setAttribute("aria-checked", on); });
    qs("#pfReset", page).addEventListener("click", resetAll);
    qsa("[data-theme-pick]", page).forEach((b) => b.addEventListener("click", () => {
      pickSeg(themeSeg, b);
      NIC.sfx.play("select"); NIC.theme.set(b.dataset.themePick, { from: b });
    }));
    wireSync(page);
    if (!calm) fx.enter(qsa(".shelf-spot, .pf-stat, .ach", page), { stagger: 0.03 });
    life.onCleanup(NIC.cast.idle(page));
  }

  // =====================================================================
  //  Dock + routing
  // =====================================================================
  const dock = qs("#dock");
  dock.innerHTML = `<button data-to="learn" aria-label="Learn">${IC.home}<span>Learn</span></button><button data-to="practice" aria-label="Practice">${IC.dumbbell}<span>Practice</span><i class="dk-badge" hidden></i></button><button data-to="profile" aria-label="Profile">${IC.face}<span>Profile</span></button>`;
  qsa("button", dock).forEach((b) => b.addEventListener("click", () => { location.hash = b.dataset.to === "learn" ? SUBJECTS[course].home : b.dataset.to; }));
  /* The blue "on" pill is one indicator that slides between tabs (FLIP: jump to the new box, animate from the old one). */
  let dockK = null, dockN = null;
  function dockInd(animate) {
    let ind = qs(".dk-ind", dock);
    if (!ind) {
      ind = el(`<i class="dk-ind" aria-hidden="true"></i>`); dock.prepend(ind); dock.classList.add("m-ind");
      if (window.ResizeObserver) new ResizeObserver(() => dockInd(false)).observe(dock); // fonts, phone layout
    }
    const b = qs("button.on", dock); if (!b) return;
    flipInd(ind, b, animate);
  }
  /** Move a sliding indicator onto button b: jump to the new box, then animate from the old one (transform-origin is the centre). */
  function flipInd(ind, b, animate) {
    const box = { x: b.offsetLeft, y: b.offsetTop, w: b.offsetWidth, h: b.offsetHeight }, was = ind._box;
    ind._box = box;
    Object.assign(ind.style, { left: box.x + "px", top: box.y + "px", width: box.w + "px", height: box.h + "px" });
    if (animate && was && was.w && box.w && box.h && (was.x !== box.x || was.y !== box.y || was.w !== box.w) && fx.ok && !fx.reduce()) {
      const dx = was.x + was.w / 2 - (box.x + box.w / 2), dy = was.y + was.h / 2 - (box.y + box.h / 2);
      const a = fx.animate(ind, { transform: [`translate(${dx}px, ${dy}px) scale(${was.w / box.w}, ${was.h / box.h})`, "translate(0px, 0px) scale(1, 1)"] }, { ...fx.SPRING_UI });
      fx.clean(ind, a, ["transform"]);
    }
  }
  /** Any single-choice .seg gets one pill that slides to the button marked .on (goal, theme, practice tabs). Call again after the choice changes. */
  function segPill(seg, animate = true) {
    if (!seg) return;
    let ind = seg.querySelector(":scope > .seg-ind");
    if (!ind) {
      ind = el(`<i class="seg-ind" aria-hidden="true"></i>`); seg.prepend(ind); seg.classList.add("m-pill");
      if (window.ResizeObserver) { const ro = new ResizeObserver(() => (seg.isConnected ? segPill(seg, false) : ro.disconnect())); ro.observe(seg); }
    }
    const b = seg.querySelector(":scope > button.on");
    ind.classList.toggle("off", !b);
    if (b) flipInd(ind, b, animate);
  }
  /** Mark b as the chosen button of seg (class + ARIA) and slide the pill to it. */
  function pickSeg(seg, b) {
    qsa(":scope > button", seg).forEach((x) => {
      x.classList.toggle("on", x === b);
      if (x.hasAttribute("aria-checked")) x.setAttribute("aria-checked", x === b);
      if (x.hasAttribute("aria-selected")) x.setAttribute("aria-selected", x === b);
    });
    segPill(seg);
  }
  NIC.segPill = segPill;
  const setDock = (k) => {
    qsa("button", dock).forEach((b) => b.classList.toggle("on", b.dataset.to === k));
    const moved = dockK !== null && dockK !== k; dockK = k;
    dockInd(moved);
    if (moved) fx.bump(qs(`button[data-to="${k}"] svg`, dock), { scale: 1.25, y: -4 });
    const n = (NIC.bank ? NIC.bank.stats().due : 0) + NIC.player.missed.all().length, bd = qs(".dk-badge", dock);
    if (n) { bd.hidden = false; bd.classList.remove("m-ghost"); bd.textContent = n > 99 ? "99+" : n; }
    else if (!bd.hidden) {
      // count reached 0: the badge shrinks away instead of vanishing
      if (dockN && fx.ok) { bd.classList.add("m-ghost"); fx.exit(bd, { scale: 0.3 }).then(() => { if (bd.classList.contains("m-ghost")) { bd.hidden = true; bd.classList.remove("m-ghost"); } bd.style.opacity = ""; bd.style.transform = ""; }); }
      else bd.hidden = true;
    }
    if (n && dockN !== null && n !== dockN) dockN ? fx.bump(bd, { scale: 1.35 }) : fx.springIn(bd, { from: 0.2, bounce: fx.SPRING_POP.bounce, dur: fx.SPRING_POP.duration });
    dockN = n;
  };

  /** First visit: pick a course and a daily goal, with Sprout waving. Shown once. */
  function onboarding() {
    if (navigator.webdriver || store.get("nic.onboarded", false) || Object.keys(store.get("nic.lessonDone", {})).length) return; // automated test browsers skip it
    let pick = course, goal = game.goal();
    const m = modal(`<div class="ob">
      <div class="ob-hero">${NIC.mascot({ who: "sprout", size: 120, act: "wave", mood: "happy", acc: ["party"] })}<div class="bubble ob-bubble">Hi! I'm Sprout. Let's learn some computer science, one bite at a time.</div></div>
      <h2>Pick a course</h2>
      <div class="ob-courses">${SUBJ_ORDER.map((k) => `<button class="ob-c ${k === pick ? "on" : ""}" data-c="${k}">${NIC.mascot({ who: SUBJECTS[k].who, size: 56, mood: "happy", poke: false })}<b>${SUBJECTS[k].name}</b><small>${SUBJECTS[k].code}</small></button>`).join("")}</div>
      <h2>Daily goal</h2>
      <div class="seg goal-seg ob-goal">${[[10, "Casual"], [20, "Regular"], [30, "Serious"], [50, "Intense"]].map(([v, t]) => `<button data-g="${v}" class="${v === goal ? "on" : ""}">${t}<small>${v} XP</small></button>`).join("")}</div>
      <button class="btn big primary ob-go">Let's go</button></div>`, { cls: "ob-modal" });
    const finish = () => { store.set("nic.onboarded", true); };
    qsa(".ob-c", m).forEach((b) => b.addEventListener("click", () => { pick = b.dataset.c; qsa(".ob-c", m).forEach((x) => x.classList.toggle("on", x === b)); NIC.sfx.play("select"); }));
    const obSeg = qs(".ob-goal", m); segPill(obSeg, false);
    qsa("[data-g]", m).forEach((b) => b.addEventListener("click", () => { goal = +b.dataset.g; pickSeg(obSeg, b); NIC.sfx.play("select"); }));
    qs(".ob-go", m).addEventListener("click", () => {
      finish(); game.setGoal(goal); setCourse(pick); m.close(); NIC.sfx.play("complete");
      const h = SUBJECTS[pick].home;
      if (location.hash.slice(1) !== h) location.hash = h; else route(); // the hashchange routes; only route by hand when the hash is already there
    });
    qs(".modal-x", m).addEventListener("click", finish);
    m.addEventListener("click", (e) => { if (e.target === m) finish(); });
  }

  /* Page changes animate through fx.swap (View Transitions): dock tabs slide left/right in tab order, other page changes crossfade.
     Opening a lesson, the first render, re-rendering the same page and leaving the player all render at once (tests rely on it). */
  const TABS = ["learn", "practice", "profile"];
  const tabOf = (id) => { const p = id.split("/")[0]; return p === "profile" ? "profile" : p === "practice" || p === "revise" ? "practice" : "learn"; };
  let routeTok = 0, lastRoute = null;
  function route() {
    const id = location.hash.slice(1) || store.get("nic.lastHome", "home");
    const mod = modules.some((m) => m.id === id), prev = lastRoute, tok = ++routeTok;
    lastRoute = { id, mod, tab: tabOf(id) };
    const go = (sw) => { if (tok === routeTok) render(!!sw); }; // a newer route wins over a transition still waiting to run
    const inTabs = prev && prev.tab === "practice" && lastRoute.tab === "practice" && !prev.mod && !mod; // Due <-> Mistakes: the panel changes in place
    if (mod || !prev || prev.mod || prev.id === id || inTabs || NIC.player.isOpen() || !fx.swap) return go();
    fx.swap(() => go(true), { dir: Math.sign(TABS.indexOf(lastRoute.tab) - TABS.indexOf(prev.tab)), el: main });
  }
  /* homeIn: the course whose path is in #main right now (null for other pages). scrollMem: path scroll per course home. */
  let homeIn = null, calm = false;
  const scrollMem = {};
  function render(swapped = false) {
    const id = location.hash.slice(1) || store.get("nic.lastHome", "home");
    const mod = modules.find((m) => m.id === id);
    const page = id.split("/")[0];
    calm = swapped; // the page transition already moved the page: skip in-page staggers
    const lesson = (m) => {
      const s = subjOf(m);
      store.set("nic.lastHome", SUBJECTS[s].home); setCourse(s);
      const last = store.get("nic.last", {}); last[s] = m.id; store.set("nic.last", last);
      document.title = `${m.num} ${m.title} · CSLingo`;
      NIC.player.lastXP = null;
      NIC.player.open(m, { home: SUBJECTS[s].home, who: SUBJECTS[s].who });
    };
    // a lesson opened from its own course's path: keep the path as it is under the player
    if (mod && homeIn === subjOf(mod) && life && qs(".path-page", main)) { closePop(); closeNodePop(); hideTip(); lesson(mod); return; }
    // Due / Mistakes tabs: only the panel below the tabs changes
    if ((page === "practice" || page === "revise") && !mod && qs(".pr-tabs", main) && life) {
      closePop(); if (NIC.player.isOpen()) NIC.player.close(true);
      renderTop(); setDock("practice"); practicePage(page === "revise" ? "due" : id.split("/")[1]); flyXP(); return;
    }
    const wasHome = homeIn, wasAt = homeIn ? pathAnchor() : null;
    if (homeIn) scrollMem[SUBJECTS[homeIn].home] = wasAt;
    homeIn = null;
    if (life) life.dispose();
    life = lifecycle();
    closePop(); closeNodePop();
    main.innerHTML = "";
    if (!mod && NIC.player.isOpen()) NIC.player.close(true);
    if (page === "practice" || page === "profile" || page === "revise") {
      renderTop(); setDock(page === "profile" ? "profile" : "practice");
      document.title = `${page === "profile" ? "Profile" : "Practice"} · CSLingo`;
      page === "profile" ? profilePage() : practicePage(page === "revise" ? "due" : id.split("/")[1]);
      window.scrollTo(0, 0); flyXP(); return;
    }
    setDock("learn");
    if (!mod) {
      const s = SUBJ_ORDER.find((k) => SUBJECTS[k].home === id) || "nic";
      store.set("nic.lastHome", SUBJECTS[s].home); setCourse(s);
      document.title = `${SUBJECTS[s].name} · CSLingo`;
      // the same path again (lesson closed, theme flip, reset): keep the scroll and skip the entrance; coming back from another page: restore its scroll
      const again = wasHome === s, at = again ? wasAt : scrollMem[SUBJECTS[s].home];
      window.scrollTo(0, 0); home(s, { quiet: again, at }); homeIn = s; flyXP(); return;
    }
    const s = subjOf(mod);
    window.scrollTo(0, 0);
    home(s); homeIn = s;
    lesson(mod);
  }

  // =====================================================================
  //  Game events → top bar + toasts
  // =====================================================================
  game.on("xp", () => renderTop());
  game.on("freeze", (d) => fx.toast(`${NIC.emo("ice")}<b>${d.earned ? "Streak freeze earned!" : "Streak freeze used"}</b><span>${d.earned ? `You have ${d.left}. It covers a day you miss.` : "Yesterday was covered, so your streak is safe."}</span>`, { tone: "blue", ms: 3200 }));
  // canvases and charts bake colours in when drawn: redraw the page when the theme flips (never under an open lesson)
  if (NIC.theme) NIC.theme.onChange(() => { if (!NIC.player.isOpen() && qs("canvas", main)) route(); });
  // level-up burst: on the complete screen's gold XP card while a lesson is open (the top bar is hidden then)
  game.on("goal", (d) => { setTimeout(() => fx.lottieAt((NIC.player.isOpen() && qs(".player .pd-card.c-gold")) || qs(".tb-xp", top), "levelup", { size: 160 }), 150); fx.toast(`${NIC.mascot({ who: "chip", size: 40, mood: "love", poke: false })}<b>Daily goal reached!</b><span>${d.today} XP today</span>`, { ms: 2400 }); NIC.sfx.play("achieve"); });
  game.on("quest", (q) => { if (q.done) { fx.toast(`${IC.chest}<b>Quest complete!</b><span>${q.t}. Claim it from the chest.</span>`, { ms: 2600 }); setTimeout(() => NIC.sfx.play("chest"), 200); renderTop(); } });
  game.on("ach", (a) => { setTimeout(() => { fx.toast(`${NIC.mascot({ who: "sprout", size: 44, mood: "laugh", acc: [a.acc], poke: false })}<b>${a.t}!</b><span>Unlocked: ${NIC.cast.ACC[a.acc].name}</span>`, { ms: 2800 }); NIC.sfx.play("achieve"); }, 900); });

  // ---- keys: "/" search, M mute ----
  document.addEventListener("keydown", (e) => {
    if (NIC.player.isOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
    const typing = /input|textarea|select/i.test(document.activeElement.tagName);
    if (e.key === "/" && !typing) { e.preventDefault(); const b = qs('[data-pop="course"]', top); if (popKind !== "course") togglePop("course", b, { instant: true }); } // keyboard: no animation
    if (e.key === "Escape") { closePop(); closeNodePop(); }
    if ((e.key === "m" || e.key === "M") && !typing) NIC.sfx.set(!NIC.sfx.on());
  });

  window.addEventListener("nic:progress", () => renderTop());
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { window.dispatchEvent(new Event("nic:resize")); closePop(); }, 150); });
  window.addEventListener("hashchange", route);
  if (NIC.cast) NIC.cast.course = SUBJECTS[course].who;
  updateScore();
  if ("scrollRestoration" in history) history.scrollRestoration = "manual"; // the path restores its own scroll (scrollMem)
  NIC.refresh = () => { updateScore(); renderTop(); route(); };
  const boot = () => { route(); setTimeout(onboarding, 400); };
  // logged in before: load the account's progress first so the page opens already up to date (js/sync.js waits at most 2.5 s)
  if (NIC.syncReady) NIC.syncReady.then(boot); else boot();
  // offline + installable: only on the deployed site (dev servers and file:// would cache stale work)
  if ("serviceWorker" in navigator && location.protocol === "https:" && !/^(localhost|127\.|\[::1\])/.test(location.hostname))
    addEventListener("load", () => navigator.serviceWorker.register(`sw.js?v=${NIC.BUILD}`).catch(() => {}));
})();
