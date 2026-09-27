/* Gamification: XP, day streak, daily goal, daily quests, achievements (which unlock cast accessories).
   All state is in localStorage via NIC.store. Dates are the learner's local calendar date.
     NIC.game.award(n, reason)        add XP (fires "xp", maybe "goal")
     NIC.game.track(metric, n=1)      advance quests / achievements (metrics below)
     NIC.game.lessonDone({acc, review, secs}) → {first today?, streak}
     NIC.game.on(event, fn)           events: xp, goal, quest, ach, streak
   Metrics: xp, lesson, acc90, combo, demo, boss, practice, predict (a runner guess right) */
(function () {
  const { store } = NIC;
  const K = { xp: "nic.xp", days: "nic.activeDays", goal: "nic.goal", quests: "nic.quests", ach: "nic.ach", stats: "nic.stats" };
  const pad = (n) => String(n).padStart(2, "0");
  const dstr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => dstr(new Date());
  const addDays = (s, k) => { const [y, m, d] = s.split("-").map(Number); return dstr(new Date(y, m - 1, d + k)); };

  const subs = {};
  const emit = (ev, data) => (subs[ev] || []).forEach((f) => { try { f(data); } catch (e) { console.error(e); } });
  const on = (ev, fn) => { (subs[ev] = subs[ev] || []).push(fn); return () => (subs[ev] = subs[ev].filter((f) => f !== fn)); };

  // ---------- XP + goal ----------
  const xpState = () => store.get(K.xp, { total: 0, days: {} });
  const goal = () => store.get(K.goal, 20);
  const todayXP = () => xpState().days[today()] || 0;
  function award(n, reason = "") {
    if (!n) return;
    const s = xpState(), t = today(), before = s.days[t] || 0;
    s.total += n; s.days[t] = before + n; store.set(K.xp, s);
    emit("xp", { n, total: s.total, today: s.days[t], reason });
    if (before < goal() && s.days[t] >= goal()) emit("goal", { today: s.days[t], goal: goal() });
    track("xp", n);
    if (s.days[t] >= 100) unlock("xp100");
  }

  // ---------- streak ----------
  const days = () => store.get(K.days, []);
  function streak() {
    const set = new Set(days());
    let d = set.has(today()) ? today() : addDays(today(), -1), n = 0;
    while (set.has(d)) { n++; d = addDays(d, -1); }
    return n;
  }
  const week = () => { // Mon..Sun of the current week: [{date, label, on, today}]
    const now = new Date(), dow = (now.getDay() + 6) % 7, set = new Set(days());
    return Array.from({ length: 7 }, (_, i) => { const s = addDays(today(), i - dow); return { date: s, label: "MTWTFSS"[i], on: set.has(s), today: s === today() }; });
  };

  // ---------- stats ----------
  const stats = () => store.get(K.stats, { lessons: 0, demos: 0, answered: 0, right: 0, bestCombo: 0 });
  const bump = (k, n = 1) => { const s = stats(); s[k] = (s[k] || 0) + n; store.set(K.stats, s); return s; };

  // ---------- quests ----------
  const POOL = [
    { id: "xp20", t: "Earn 20 XP", m: "xp", n: 20 },
    { id: "xp40", t: "Earn 40 XP", m: "xp", n: 40 },
    { id: "lesson1", t: "Complete a lesson", m: "lesson", n: 1 },
    { id: "lesson2", t: "Complete 2 lessons", m: "lesson", n: 2 },
    { id: "acc90", t: "Finish a lesson with 90%+ accuracy", m: "acc90", n: 1 },
    { id: "combo5", t: "Get 5 answers in a row", m: "combo", n: 5, max: true },
    { id: "demo", t: "Tick every step of a demo checklist", m: "demo", n: 1 },
    { id: "boss5", t: "Answer 5 boss questions right", m: "boss", n: 5 },
    { id: "practice3", t: "Fix 3 mistakes in Practice", m: "practice", n: 3 },
    { id: "predict3", t: "Predict 3 steps in a running figure", m: "predict", n: 3 },
  ];
  function seeded(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return () => ((h = (h * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function quests() {
    let q = store.get(K.quests, null);
    if (!q || q.date !== today()) {
      const r = seeded(today()), xp = POOL.filter((p) => p.m === "xp"), rest = POOL.filter((p) => p.m !== "xp");
      const pick = [xp[Math.floor(r() * xp.length)]];
      while (pick.length < 3) { const c = rest[Math.floor(r() * rest.length)]; if (!pick.includes(c)) pick.push(c); }
      q = { date: today(), list: pick.map((p) => ({ id: p.id, prog: 0, done: false, claimed: false })) };
      store.set(K.quests, q);
    }
    return q.list.map((x) => ({ ...POOL.find((p) => p.id === x.id), ...x }));
  }
  const claimable = () => quests().some((q) => q.done && !q.claimed);
  function claim(id) {
    const q = store.get(K.quests); const it = q && q.list.find((x) => x.id === id);
    if (!it || !it.done || it.claimed) return 0;
    it.claimed = true; store.set(K.quests, q);
    award(10, "quest");
    emit("quest", { id, claimed: true });
    return 10;
  }
  function track(metric, n = 1) {
    quests(); // roll over the day if needed
    const q = store.get(K.quests); let changed = false;
    q.list.forEach((it) => {
      const def = POOL.find((p) => p.id === it.id);
      if (!def || def.m !== metric || it.done) return;
      it.prog = def.max ? Math.max(it.prog, n) : it.prog + n;
      if (it.prog >= def.n) { it.prog = def.n; it.done = true; emit("quest", { id: it.id, done: true, t: def.t }); }
      changed = true;
    });
    if (changed) store.set(K.quests, q);
    if (metric === "combo") { const s = stats(); if (n > (s.bestCombo || 0)) { s.bestCombo = n; store.set(K.stats, s); } if (n >= 10) unlock("combo10"); }
    if (metric === "demo") { const s = bump("demos"); if (s.demos >= 5) unlock("demo5"); }
  }

  // ---------- achievements (each unlocks an accessory) ----------
  const ACH = [
    { id: "first", t: "First steps", d: "Finish your first lesson", acc: "party" },
    { id: "streak3", t: "Warming up", d: "3-day streak", acc: "shades" },
    { id: "streak7", t: "On fire", d: "7-day streak", acc: "crown" },
    { id: "streak30", t: "Unstoppable", d: "30-day streak", acc: "viking" },
    { id: "perfect", t: "Flawless", d: "Perfect score on a boss quiz", acc: "wizard" },
    { id: "xp100", t: "Big day", d: "Earn 100 XP in one day", acc: "propeller" },
    { id: "demo5", t: "Tinkerer", d: "Complete 5 demo checklists", acc: "chef" },
    { id: "lessons10", t: "Scholar", d: "Finish 10 lessons", acc: "tophat" },
    { id: "combo10", t: "Combo master", d: "10 answers in a row", acc: "headphones" },
    { id: "night", t: "Night owl", d: "Finish a lesson after 10 pm", acc: "nightcap" },
    { id: "fixer", t: "Detective", d: "Fix a mistake in Practice", acc: "detective" },
  ];
  const FREE = ["beanie", "bowtie", "monocle", "moustache", "scarf", "hearts"];
  const achState = () => store.get(K.ach, {});
  function unlock(id) {
    const s = achState(); if (s[id]) return;
    s[id] = today(); store.set(K.ach, s);
    const a = ACH.find((x) => x.id === id);
    emit("ach", a);
  }
  const unlockedAcc = () => { const s = achState(); return [...FREE, ...ACH.filter((a) => s[a.id]).map((a) => a.acc)]; };

  // ---------- lesson completion ----------
  function lessonDone({ acc = 1, review = false } = {}) {
    const t = today(), list = days(), first = !list.includes(t), before = streak();
    if (first) { list.push(t); store.set(K.days, list.slice(-400)); }
    const s = bump("lessons");
    track("lesson");
    if (acc >= 0.9) track("acc90");
    unlock("first");
    if (s.lessons >= 10) unlock("lessons10");
    if (new Date().getHours() >= 22) unlock("night");
    const now = streak();
    if (now >= 3) unlock("streak3"); if (now >= 7) unlock("streak7"); if (now >= 30) unlock("streak30");
    if (first) emit("streak", { from: before, to: now });
    return { firstToday: first, streakFrom: before, streak: now, review };
  }
  function answered(ok) { const s = stats(); s.answered++; if (ok) s.right++; store.set(K.stats, s); }

  NIC.game = { today, award, track, on, goal, setGoal: (g) => { store.set(K.goal, g); emit("xp", { n: 0, total: xpState().total, today: todayXP() }); },
    todayXP, totalXP: () => xpState().total, streak, week, quests, claim, claimable, stats, answered, lessonDone, unlock, ACH, achState, unlockedAcc, FREE };
  if (NIC.cast) NIC.cast.unlocked = unlockedAcc;
})();
