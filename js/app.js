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
      lectures: { 1: "Lecture 1 — Reliable, scalable & maintainable systems" },
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
  const ring = (f, r = 9, w = 3.5, col = "#ffc800") => { const L = 2 * Math.PI * r; return `<svg class="ring" viewBox="0 0 ${2 * r + w * 2} ${2 * r + w * 2}"><circle cx="${r + w}" cy="${r + w}" r="${r}" fill="none" stroke="#e5e5e5" stroke-width="${w}"/><circle class="ring-v" cx="${r + w}" cy="${r + w}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - Math.min(1, f))}" transform="rotate(-90 ${r + w} ${r + w})"/></svg>`; };

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
    if (qs(".rail")) rail();
  }

  const pop = qs("#pop");
  let popKind = null;
  function closePop() { if (!popKind) return; popKind = null; pop.hidden = true; pop.innerHTML = ""; }
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

  function togglePop(kind, anchor) {
    if (popKind === kind) return closePop();
    popKind = kind;
    pop.innerHTML = `<div class="pop-card pop-${kind}">${POPS[kind]()}</div>`;
    pop.hidden = false;
    const r = anchor.getBoundingClientRect(), card = qs(".pop-card", pop);
    const w = Math.min(360, innerWidth - 24);
    card.style.width = w + "px";
    const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    card.style.left = left + "px"; card.style.top = r.bottom + 10 + "px";
    card.style.setProperty("--ax", r.left + r.width / 2 - left + "px");
    if (fx.ok) fx.animate(card, fx.reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translateY(-8px) scale(0.94)", "translateY(0px) scale(1)"] }, { type: "spring", duration: 0.35, bounce: 0.3 });
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
      if (card.dataset.focus !== "no") setTimeout(() => inp.focus(), 30);
    },
    xp(card) { qsa("[data-g]", card).forEach((b) => b.addEventListener("click", () => { game.setGoal(+b.dataset.g); renderTop(); closePop(); })); },
    quests(card) {
      qsa(".q-claim", card).forEach((b) => b.addEventListener("click", () => {
        const row = b.closest(".q-row");
        NIC.sfx.play("chest");
        fx.lottieAt(b, "chest", { size: 170, dy: -30 });
        if (fx.ok && !fx.reduce()) fx.animate(b, { transform: ["rotate(0)", "rotate(-12deg)", "rotate(12deg)", "rotate(-8deg)", "scale(1.3)", "scale(1)"] }, { duration: 0.6 });
        setTimeout(() => {
          const n = game.claim(b.dataset.q);
          fx.floatText(b, `+${n} XP`, "#ff9600"); fx.celebrate(b, { silent: true });
          b.outerHTML = `<span class="q-got">${IC.check}</span>`;
          row.classList.add("claimed");
          renderTop();
        }, 550);
      }));
    },
    me(card) {
      qsa("[data-go]", card).forEach((b) => b.addEventListener("click", () => { closePop(); location.hash = b.dataset.go; }));
      qs('[data-act="sound"]', card).addEventListener("click", () => { NIC.sfx.set(!NIC.sfx.on()); qs('[data-act="sound"] b', card).textContent = NIC.sfx.on() ? "on" : "off"; });
      qs('[data-act="reset"]', card).addEventListener("click", resetAll);
      wireSync(card);
    },
  };

  // ---------- account sync (js/sync.js) ----------
  const IC_CLOUD = `<svg viewBox="0 0 24 24"><path d="M7 18h10.5a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.4 9.1 4.5 4.5 0 0 0 7 18z" fill="currentColor"/></svg>`;
  function syncRow() {
    if (!NIC.sync) return "";
    const em = NIC.sync.email();
    return em ? `<div class="menu-row sy-row">${IC_CLOUD}<span>Synced<small>${esc(em.replace(/@cslingo.app$/, ""))}</small></span><button class="sy-out" data-act="signout">Sign out</button></div>`
      : `<button class="menu-row sy-row" data-act="signin">${IC_CLOUD}<span>Sync across devices<small>Sign in to your account</small></span></button>`;
  }
  function wireSync(root) {
    const i = qs('[data-act="signin"]', root), o = qs('[data-act="signout"]', root);
    if (i) i.addEventListener("click", () => { closePop(); signInModal(); });
    if (o) o.addEventListener("click", async () => { if (!confirm("Sign out of sync on this device? Your progress stays here and in your account.")) return; await NIC.sync.signOut(); closePop(); renderTop(); route(); });
  }
  function signInModal() {
    const m = modal(`<div class="sy">
      <div class="ob-hero">${NIC.mascot({ who: "chip", size: 96, mood: "happy", act: "wave", acc: ["propeller"] })}<div class="bubble ob-bubble">Sign in once on each device and your progress follows you. You stay signed in after that.</div></div>
      <form class="sy-form"><input class="sy-email" name="u" required autocomplete="username" placeholder="Username" aria-label="Username">
        <input class="sy-email" name="p" type="password" required autocomplete="current-password" placeholder="Password" aria-label="Password">
        <button class="btn big primary" type="submit">Sign in</button></form>
      <p class="faint sy-msg"></p></div>`, { cls: "sy-modal" });
    const f = qs(".sy-form", m), msg = qs(".sy-msg", m), btn = qs("button[type=submit]", m);
    setTimeout(() => f.u.focus(), 50);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      btn.disabled = true; btn.textContent = "Signing in…";
      try {
        await NIC.sync.signIn(f.u.value.trim(), f.p.value);
        m.remove(); NIC.sfx.play("check");
      } catch (err) {
        btn.disabled = false; btn.textContent = "Sign in";
        msg.innerHTML = `<b style="color:var(--rose-ink)">Couldn't sign in:</b> ${esc(err.message || String(err))}`;
        if (fx.ok) fx.shake(f);
      }
    });
  }
  if (NIC.sync) NIC.sync.on(() => renderTop());

  function modal(html, { cls = "" } = {}) {
    const m = el(`<div class="modal-back"><div class="modal ${cls}" role="dialog" aria-modal="true"><button class="modal-x" aria-label="Close">✕</button>${html}</div></div>`);
    document.body.appendChild(m);
    NIC.shield(true);
    const close = () => { if (m._open === false) return; m._open = false; m.remove(); document.removeEventListener("keydown", onK); NIC.shield(false); };
    m.close = close;
    new MutationObserver((r, o) => { if (!m.isConnected) { o.disconnect(); document.removeEventListener("keydown", onK); if (m._open !== false) { m._open = false; NIC.shield(false); } } }).observe(document.body, { childList: true }); // callers may just m.remove()
    setTimeout(() => { const f = m.querySelector("input, .modal button:not(.modal-x)"); if (f) f.focus(); }, 30);
    const onK = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onK);
    m.addEventListener("click", (e) => { if (e.target === m || e.target.closest(".modal-x")) close(); });
    if (fx.ok) fx.animate(qs(".modal", m), fx.reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translateY(30px) scale(0.96)", "translateY(0px) scale(1)"] }, { type: "spring", duration: 0.45, bounce: 0.25 });
    return m;
  }

  function resetAll() {
    closePop();
    const m = modal(`<div class="rs">${NIC.mascot({ who: "berry", size: 96, mood: "shocked" })}<h2>Reset everything?</h2>
      <p>Lessons, quizzes, XP, streak, quests, achievements and revision history on this device will be wiped.${NIC.sync && NIC.sync.email() ? " Your synced account will be overwritten too." : ""} This can't be undone.</p>
      <div class="controls"><button class="btn" data-k="no">Keep my progress</button><button class="btn rose" data-k="yes">Reset</button></div></div>`, { cls: "rs-modal" });
    m.addEventListener("click", (e) => {
      const b = e.target.closest("[data-k]"); if (!b) return;
      if (b.dataset.k === "yes") {
        Object.keys(localStorage).filter((k) => k.startsWith("nic.") && !/^nic\.sync/.test(k)).forEach((k) => localStorage.removeItem(k));
        localStorage.setItem("nic.syncDirty", "1"); localStorage.setItem("nic.onboarded", "true");
        updateScore(); renderTop(); route();
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
    const io = new IntersectionObserver(([e]) => { b.hidden = e.isIntersecting; b.classList.toggle("up", e.boundingClientRect.top < 0); }, { threshold: 0.2 });
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
  const CHEST = (open) => `<svg viewBox="0 0 64 56" class="p-chest-svg">${open
    ? '<path d="M8 20h48l-4-12H12z" fill="#e0a800"/><rect x="6" y="22" width="52" height="28" rx="6" fill="#cd7900"/><rect x="6" y="22" width="52" height="8" fill="#a85f00"/><rect x="27" y="22" width="10" height="12" rx="3" fill="#ffc800"/>'
    : '<rect x="6" y="20" width="52" height="30" rx="7" fill="#cd7900"/><path d="M6 27a13 13 0 0 1 13-13h26a13 13 0 0 1 13 13v3H6z" fill="#ff9600"/><rect x="6" y="28" width="52" height="5" fill="#a85f00"/><rect x="16" y="14" width="6" height="36" fill="#a85f00" opacity=".5"/><rect x="42" y="14" width="6" height="36" fill="#a85f00" opacity=".5"/><rect x="26" y="25" width="12" height="13" rx="3.5" fill="#ffc800"/><circle cx="32" cy="31" r="2" fill="#a85f00"/>'}</svg>`;
  function chestRow(it, i) {
    const opened = !!store.get("nic.chests", {})[it.chest], ready = !opened && status(modules.find((x) => x.id === it.after)) === "done";
    return `<div class="p-row p-chest-row ${opened ? "opened" : ready ? "ready" : "locked"}" style="--k:${zig(i).toFixed(3)};top:${i * ROW}px" data-chest="${it.chest}">
      <button class="p-chest" aria-label="${opened ? "Opened chest" : ready ? "Open reward chest" : "Reward chest: finish the lesson before it"}" ${ready ? "" : "disabled"}>${CHEST(opened)}</button></div>`;
  }
  function openChest(row) {
    const id = row.dataset.chest, c = store.get("nic.chests", {});
    if (c[id]) return;
    c[id] = NIC.game.today(); store.set("nic.chests", c);
    const b = qs(".p-chest", row), xp = 5 + Math.floor(Math.random() * 6);
    NIC.sfx.play("chest");
    fx.lottieAt(b, "chest", { size: 190, dy: -40 });
    setTimeout(() => { b.innerHTML = CHEST(true); b.disabled = true; row.className = row.className.replace(/\bready\b/, "opened"); game.award(xp, "chest"); fx.floatText(b, `+${xp} XP`, "#ff9600"); fx.celebrate(b, { silent: true }); }, 650);
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

  function home(s) {
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
                <button class="p-node" aria-label="${m.num} ${esc(m.title)}">${cur || st === "started" ? `<svg class="p-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#e5e5e5" stroke-width="8"/><circle cx="50" cy="50" r="46" fill="none" stroke="var(--u)" stroke-width="8" stroke-linecap="round" stroke-dasharray="289" stroke-dashoffset="${289 * (1 - frac)}" transform="rotate(-90 50 50)"/></svg>` : ""}<span class="p-face">${ic}</span></button>
                ${cur ? `<span class="p-bubble">${status(m) === "started" ? "Continue" : P.d ? "Jump in" : "Start"}</span>` : ""}</div>`;
            }).join("")}
            <div class="p-cast ${side}" style="top:${castRow * ROW - 10}px">${NIC.mascot({ who: cast.who || S.who, size: 110, act: cast.act, acc: cast.acc, mood: cast.mood || "idle" })}</div>
          </div></section>`;
      }).join("")}
      <div class="path-end ${P.d === P.n ? "won" : ""}">${NIC.mascot({ who: S.who, size: 100, mood: P.d === P.n ? "love" : "determined", acc: ["crown"], act: P.d === P.n ? "dance" : "" })}<b>${P.d === P.n ? "Course complete!" : `${P.n - P.d} to go`}</b><span class="faint">${S.name} · ${P.d}/${P.n} done</span>
        ${P.d === P.n ? `<div class="pe-acts"><button class="btn primary" data-to="practice/due">Revise this course</button>${weakBoss(s) ? `<button class="btn" data-to="${weakBoss(s).id}">Retry ${esc(weakBoss(s).title)}</button>` : ""}</div>` : ""}</div>
    </div>`);
    main.appendChild(page);
    if (NIC.art) page.style.setProperty("--pat", NIC.art.pattern({ nic: "leaves", ds: "waves", algo: "circuit" }[s] || "dots"));
    qsa(".p-node", page).forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); nodePop(b.closest(".p-row")); }));
    wireTips(page);
    rail();
    qsa(".p-chest-row.ready", page).forEach((r) => qs(".p-chest", r).addEventListener("click", (e) => { e.stopPropagation(); openChest(r); }));
    jumpButton(page);
    qsa("[data-to]", page).forEach((b) => b.addEventListener("click", () => { location.hash = b.dataset.to; }));
    stickyHeader(page);
    // entrance: nodes pop in unit by unit as they scroll into view
    const units = qsa(".unit", page);
    units.forEach((u, k) => {
      if (u.getBoundingClientRect().top < innerHeight) popUnit(u, 0.05 + k * 0.1);
      else if (fx.ok && window.Motion && Motion.inView) { let stop = null; stop = Motion.inView(u, () => { popUnit(u, 0); stop && stop(); }, { margin: "0px 0px -10% 0px" }); life.onCleanup(() => stop && stop()); }
    });
    life.onCleanup(NIC.cast.idle(page));
    // came back from a finished lesson: glide to the next node and nudge it
    if (NIC.lastFinished) {
      const fin = NIC.lastFinished; NIC.lastFinished = null;
      const target = qs(".p-row.cur", page) || qs(`.p-row[data-id="${fin}"]`, page);
      if (target) setTimeout(() => {
        target.scrollIntoView({ behavior: fx.reduce() ? "auto" : "smooth", block: "center" });
        setTimeout(() => { const n = qs(".p-node", target); if (fx.ok && !fx.reduce()) fx.animate(n, { transform: ["scale(1)", "scale(1.2)", "scale(0.95)", "scale(1)"] }, { duration: 0.6, ease: fx.EASE }); NIC.sfx.play("pop"); }, 500);
      }, 200);
    } else {
      const cur = qs(".p-row.cur", page);
      if (cur && cur.getBoundingClientRect().top > innerHeight * 0.75) cur.scrollIntoView({ block: "center" });
    }
  }

  function popUnit(u, delay) {
    if (!fx.ok || fx.reduce()) return;
    qsa(".p-node, .p-chest", u).forEach((n, i) => fx.animate(n, { opacity: [0, 1], transform: ["scale(0.3)", "scale(1)"] }, { type: "spring", duration: 0.55, bounce: 0.45, delay: delay + i * 0.06 }).finished.then(() => { n.style.transform = ""; n.style.opacity = ""; }).catch(() => {}));
    const c = qs(".p-cast .mascot", u);
    if (c) fx.animate(c, { opacity: [0, 1], transform: ["translateY(30px) scale(0.7)", "translateY(0px) scale(1)"] }, { type: "spring", duration: 0.6, bounce: 0.4, delay: delay + 0.3 });
  }

  /** The sticky banner shows whichever unit you're scrolling through. */
  function stickyHeader(page) {
    const box = qs(".unit-sticky", page), inn = qs(".us-in", box), units = qsa(".unit", page);
    let curU = -1;
    const paint = (u) => {
      if (u === curU) return; const dir = u > curU ? 1 : -1; curU = u;
      const sec = units[u];
      box.className = `unit-sticky u-${UNIT_COLORS[u % 4]}`;
      inn.innerHTML = `<div class="us-t"><small>${sec.dataset.lbl} · ${sec.dataset.p}</small><h2>${sec.dataset.ttl}</h2></div><button class="us-guide">${IC.book}<span>Guidebook</span></button>`;
      qs(".us-guide", inn).addEventListener("click", () => guidebook(sec));
      if (fx.ok && !fx.reduce() && dir) fx.animate(inn, { opacity: [0, 1], transform: [`translateY(${10 * dir}px)`, "translateY(0px)"] }, { duration: 0.25, ease: fx.EASE });
    };
    const spy = () => {
      const y = box.getBoundingClientRect().bottom;
      let u = 0; units.forEach((sec, k) => { if (sec.getBoundingClientRect().top < y + 10) u = k; });
      paint(u);
    };
    let q = false;
    const onScroll = () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; spy(); }); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    life.onCleanup(() => window.removeEventListener("scroll", onScroll));
    paint(0);
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
  function hideTip() { clearTimeout(tipT); if (tipEl) { tipEl.remove(); tipEl = null; } }
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
    if (fx.ok) fx.animate(tipEl, fx.reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: [`translateX(${side === "left" ? 8 : -8}px) scale(0.92)`, "translateX(0px) scale(1)"] }, { type: "spring", duration: 0.35, bounce: 0.3 });
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
  function closeNodePop() { if (nodePopEl) { nodePopEl.remove(); nodePopEl = null; } }
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
    if (fx.ok) fx.animate(nodePopEl, fx.reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translateX(-50%) translateY(-10px) scale(0.85)", "translateX(-50%) translateY(0px) scale(1)"] }, { type: "spring", duration: 0.4, bounce: 0.35 });
    qs(".np-go", nodePopEl).addEventListener("click", (e) => { e.stopPropagation(); closeNodePop(); location.hash = m.id; });
    const rs = qs(".np-restart", nodePopEl);
    if (rs) rs.addEventListener("click", (e) => { e.stopPropagation(); const p = store.get("nic.lessonPos", {}); delete p[m.id]; store.set("nic.lessonPos", p); closeNodePop(); location.hash = m.id; });
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
    const tabs = el(`<div class="page side-page pr-tabs-wrap"><div class="seg pr-tabs" role="tablist">
      <button role="tab" data-t="due" aria-selected="${tab === "due"}" class="${tab === "due" ? "on" : ""}">Due reviews${due ? ` <i class="pr-n">${due}</i>` : ""}</button>
      <button role="tab" data-t="mistakes" aria-selected="${tab === "mistakes"}" class="${tab === "mistakes" ? "on" : ""}">Mistakes${miss.length ? ` <i class="pr-n">${miss.length}</i>` : ""}</button></div></div>`);
    main.appendChild(tabs);
    qsa("[data-t]", tabs).forEach((b) => b.addEventListener("click", () => { location.hash = "practice/" + b.dataset.t; }));
    if (tab === "due") { NIC.revisePage(main, life, { names: Object.fromEntries(SUBJ_ORDER.map((k) => [k, SUBJECTS[k].name])) }); return; }
    const page = el(`<div class="page side-page">
      <div class="sp-hero u-violet">${NIC.mascot({ who: "berry", size: 140, mood: "determined", act: "headbang", acc: ["headphones"] })}<div><h1>Practice</h1><p>Mistakes you made land here. Fix them and they're gone. The rest is a mixed refresh from lessons you've finished.</p></div></div>
      <div class="card sp-card"><div class="sp-stat"><b>${miss.length}</b><span>mistakes waiting</span></div><button class="btn big primary" id="pStart">Start practice</button></div>
      ${!miss.length && NIC.art ? `<div class="card ab-empty-card">${NIC.art.empty("practice")}<b>No mistakes waiting</b><span class="faint">Anything you get wrong in a lesson lands here to fix later.</span></div>` : ""}
      ${miss.length ? `<div class="card"><h3>Waiting to be fixed</h3><ul class="sp-list">${miss.slice(-6).reverse().map((x) => { const Q = x.boss ? (NIC.bossDef(x.boss) || { qs: [] }).qs[x.i] : x.Q; return Q ? `<li>${Q.q}</li>` : ""; }).join("")}</ul></div>` : ""}
    </div>`);
    main.appendChild(page);
    qs("#pStart", page).addEventListener("click", () => NIC.player.practice({ home: "practice/mistakes" }));
    fx.enter(Array.from(page.children), { stagger: 0.06 });
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
        ${NIC.sync ? `<div class="set-row"><b>Sync</b>${NIC.sync.email() ? `<span class="faint">${esc(NIC.sync.email())}</span><button class="btn" data-act="signout">Sign out</button>` : `<button class="btn primary" data-act="signin">Sign in to sync</button>`}</div>` : ""}
        <div class="set-row"><b>Sound effects</b><button class="btn" id="pfSound">${NIC.sfx.on() ? "On" : "Off"}</button></div>
        <div class="set-row"><b>Progress</b><button class="btn rose" id="pfReset">Reset everything</button></div></div>
    </div>`);
    main.appendChild(page);
    qsa("[data-g]", page).forEach((b) => b.addEventListener("click", () => { game.setGoal(+b.dataset.g); qsa("[data-g]", page).forEach((x) => x.classList.toggle("on", x === b)); renderTop(); }));
    qs("#pfSound", page).addEventListener("click", (e) => { NIC.sfx.set(!NIC.sfx.on()); e.target.textContent = NIC.sfx.on() ? "On" : "Off"; });
    qs("#pfReset", page).addEventListener("click", resetAll);
    wireSync(page);
    fx.enter(qsa(".shelf-spot, .pf-stat, .ach", page), { stagger: 0.03 });
    life.onCleanup(NIC.cast.idle(page));
  }

  // =====================================================================
  //  Dock + routing
  // =====================================================================
  const dock = qs("#dock");
  dock.innerHTML = `<button data-to="learn" aria-label="Learn">${IC.home}<span>Learn</span></button><button data-to="practice" aria-label="Practice">${IC.dumbbell}<span>Practice</span><i class="dk-badge" hidden></i></button><button data-to="profile" aria-label="Profile">${IC.face}<span>Profile</span></button>`;
  qsa("button", dock).forEach((b) => b.addEventListener("click", () => { location.hash = b.dataset.to === "learn" ? SUBJECTS[course].home : b.dataset.to; }));
  const setDock = (k) => {
    qsa("button", dock).forEach((b) => b.classList.toggle("on", b.dataset.to === k));
    const n = (NIC.bank ? NIC.bank.stats().due : 0) + NIC.player.missed.all().length, bd = qs(".dk-badge", dock);
    bd.hidden = !n; bd.textContent = n > 99 ? "99+" : n;
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
    qsa("[data-g]", m).forEach((b) => b.addEventListener("click", () => { goal = +b.dataset.g; qsa("[data-g]", m).forEach((x) => x.classList.toggle("on", x === b)); NIC.sfx.play("select"); }));
    qs(".ob-go", m).addEventListener("click", () => { finish(); game.setGoal(goal); setCourse(pick); m.remove(); NIC.sfx.play("complete"); location.hash = SUBJECTS[pick].home; route(); });
    qs(".modal-x", m).addEventListener("click", finish);
    m.addEventListener("click", (e) => { if (e.target === m) finish(); });
  }

  function route() {
    const id = location.hash.slice(1) || store.get("nic.lastHome", "home");
    if (life) life.dispose();
    life = lifecycle();
    closePop(); closeNodePop();
    main.innerHTML = "";
    const mod = modules.find((m) => m.id === id);
    if (!mod && NIC.player.isOpen()) NIC.player.close(true);
    const page = id.split("/")[0];
    if (page === "practice" || page === "profile" || page === "revise") {
      renderTop(); setDock(page === "profile" ? "profile" : "practice");
      document.title = `${page === "profile" ? "Profile" : "Practice"} · CSLingo`;
      page === "profile" ? profilePage() : practicePage(page === "revise" ? "due" : id.split("/")[1]);
      window.scrollTo(0, 0); return;
    }
    setDock("learn");
    if (!mod) {
      const s = SUBJ_ORDER.find((k) => SUBJECTS[k].home === id) || "nic";
      store.set("nic.lastHome", SUBJECTS[s].home); setCourse(s);
      document.title = `${SUBJECTS[s].name} · CSLingo`;
      window.scrollTo(0, 0); home(s); return;
    }
    const s = subjOf(mod);
    store.set("nic.lastHome", SUBJECTS[s].home); setCourse(s);
    const last = store.get("nic.last", {}); last[s] = mod.id; store.set("nic.last", last);
    document.title = `${mod.num} ${mod.title} · CSLingo`;
    home(s);
    NIC.player.open(mod, { home: SUBJECTS[s].home, who: SUBJECTS[s].who });
  }

  // =====================================================================
  //  Game events → top bar + toasts
  // =====================================================================
  game.on("xp", () => renderTop());
  game.on("freeze", (d) => fx.toast(`${NIC.emo("ice")}<b>${d.earned ? "Streak freeze earned!" : "Streak freeze used"}</b><span>${d.earned ? `You have ${d.left}. It covers a day you miss.` : "Yesterday was covered, so your streak is safe."}</span>`, { tone: "blue", ms: 3200 }));
  game.on("goal", (d) => { setTimeout(() => fx.lottieAt(qs(".tb-xp"), "levelup", { size: 160 }), 150); fx.toast(`${NIC.mascot({ who: "chip", size: 40, mood: "love", poke: false })}<b>Daily goal reached!</b><span>${d.today} XP today</span>`, { ms: 2400 }); NIC.sfx.play("achieve"); });
  game.on("quest", (q) => { if (q.done) { fx.toast(`${IC.chest}<b>Quest complete!</b><span>${q.t}. Claim it from the chest.</span>`, { ms: 2600 }); setTimeout(() => NIC.sfx.play("chest"), 200); renderTop(); } });
  game.on("ach", (a) => { setTimeout(() => { fx.toast(`${NIC.mascot({ who: "sprout", size: 44, mood: "laugh", acc: [a.acc], poke: false })}<b>${a.t}!</b><span>Unlocked: ${NIC.cast.ACC[a.acc].name}</span>`, { ms: 2800 }); NIC.sfx.play("achieve"); }, 900); });

  // ---- keys: "/" search, M mute ----
  document.addEventListener("keydown", (e) => {
    if (NIC.player.isOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
    const typing = /input|textarea|select/i.test(document.activeElement.tagName);
    if (e.key === "/" && !typing) { e.preventDefault(); const b = qs('[data-pop="course"]', top); if (popKind !== "course") togglePop("course", b); }
    if (e.key === "Escape") { closePop(); closeNodePop(); }
    if ((e.key === "m" || e.key === "M") && !typing) NIC.sfx.set(!NIC.sfx.on());
  });

  window.addEventListener("nic:progress", () => renderTop());
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { window.dispatchEvent(new Event("nic:resize")); closePop(); }, 150); });
  window.addEventListener("hashchange", route);
  if (NIC.cast) NIC.cast.course = SUBJECTS[course].who;
  updateScore();
  route();
  setTimeout(onboarding, 400);
  // offline + installable: only on the deployed site (dev servers and file:// would cache stale work)
  if ("serviceWorker" in navigator && location.protocol === "https:" && !/^(localhost|127\.|\[::1\])/.test(location.hostname))
    addEventListener("load", () => navigator.serviceWorker.register(`sw.js?v=${NIC.BUILD}`).catch(() => {}));
})();
