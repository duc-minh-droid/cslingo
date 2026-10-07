/* Gamification: XP, day streak, daily goal, daily quests, achievements (which unlock cast accessories).
   All state is in localStorage via NIC.store. Dates are the learner's local calendar date.
     NIC.game.award(n, reason)        add XP (fires "xp", maybe "goal")
     NIC.game.track(metric, n=1)      advance quests / achievements (metrics below)
     NIC.game.lessonDone({acc, review, secs}) → {first today?, streak}
     NIC.game.on(event, fn)           events: xp, goal, quest, ach, streak, freeze ({earned, left} when one is earned; {date, dates, count, left} when
                                      missed days were bridged). A "freeze" emitted before anyone listens (it is applied as this file loads)
                                      is held and delivered to the first listener once the first screen has drawn.
   Metrics: xp, lesson, acc90, combo, demo, boss, practice, predict (a runner guess right)
     NIC.game.achProgress(id)         {have, need, unit} for a locked achievement ("4/7 days"); null for an unknown id */
(function () {
  const { store } = NIC;
  const K = {
    xp: "nic.xp",
    days: "nic.activeDays",
    goal: "nic.goal",
    quests: "nic.quests",
    ach: "nic.ach",
    stats: "nic.stats",
  };
  const pad = (n) => String(n).padStart(2, "0");
  const dstr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => dstr(new Date());
  const addDays = (s, k) => {
    const [y, m, d] = s.split("-").map(Number);
    return dstr(new Date(y, m - 1, d + k));
  };

  const subs = {},
    held = {}; // events nobody was listening for yet (this file loads before the app shell, which subscribes), by event name
  const call = (f, data) => {
    try {
      f(data);
    } catch (e) {
      console.error(e);
    }
  };
  const emit = (ev, data) => {
    if (!(subs[ev] || []).length) {
      if (ev === "freeze") (held[ev] = held[ev] || []).push(data); // the freeze applied at load: toast it once the shell is up
      return;
    }
    subs[ev].forEach((f) => call(f, data));
  };
  const on = (ev, fn) => {
    (subs[ev] = subs[ev] || []).push(fn);
    if (held[ev]) {
      const late = held[ev];
      held[ev] = null;
      setTimeout(() => late.forEach((d) => call(fn, d)), 900); // after the first screen has drawn
    }
    return () => (subs[ev] = subs[ev].filter((f) => f !== fn));
  };

  // ---------- XP + goal ----------
  const xpState = () => store.get(K.xp, { total: 0, days: {} });
  const goal = () => store.get(K.goal, 20);
  const todayXP = () => xpState().days[today()] || 0;
  function award(n, reason = "") {
    if (!n) return;
    const s = xpState(),
      t = today(),
      before = s.days[t] || 0;
    s.total += n;
    s.days[t] = before + n;
    store.set(K.xp, s);
    emit("xp", { n, total: s.total, today: s.days[t], reason });
    if (before < goal() && s.days[t] >= goal()) emit("goal", { today: s.days[t], goal: goal() });
    track("xp", n);
    if (s.days[t] >= 100) unlock("xp100");
  }

  // ---------- streak ----------
  const days = () => store.get(K.days, []);
  // Streak freeze: claiming all three daily quests earns one (hold up to 2). Missed days are covered automatically.
  const frz = () => {
    const f = store.get("nic.freeze", null) || {};
    return { n: f.n || 0, used: Array.isArray(f.used) ? f.used : [] };
  };
  const covered = () => new Set([...days(), ...frz().used]);
  /** Bridge the run of missed days that ends yesterday, but only when there are enough freezes to cover all of it
      (two missed days need two freezes). Looks back at most as far as the freezes held, so a long break is never "saved". */
  function applyFreeze() {
    const f = frz(),
      set = covered(),
      t = today();
    let m = 0;
    while (m <= f.n && !set.has(addDays(t, -(m + 1)))) m++;
    if (m < 1 || m > f.n || !set.has(addDays(t, -(m + 1)))) return;
    const dates = Array.from({ length: m }, (_, i) => addDays(t, i - m)); // oldest first
    f.n -= m;
    f.used = [...f.used, ...dates].slice(-60);
    store.set("nic.freeze", f);
    emit("freeze", { date: dates[m - 1], dates, count: m, left: f.n });
  }
  function streak() {
    const set = covered();
    let d = set.has(today()) ? today() : addDays(today(), -1),
      n = 0;
    while (set.has(d)) {
      n++;
      d = addDays(d, -1);
    }
    return n;
  }
  const week = () => {
    // Mon..Sun of the current week: [{date, label, on, today}]
    const now = new Date(),
      dow = (now.getDay() + 6) % 7,
      set = new Set(days()),
      fz = new Set(frz().used);
    return Array.from({ length: 7 }, (_, i) => {
      const s = addDays(today(), i - dow);
      return {
        date: s,
        label: "MTWTFSS"[i],
        on: set.has(s) || fz.has(s),
        frozen: fz.has(s) && !set.has(s),
        today: s === today(),
      };
    });
  };

  // ---------- stats ----------
  const stats = () => store.get(K.stats, { lessons: 0, demos: 0, answered: 0, right: 0, bestCombo: 0 });
  const bump = (k, n = 1) => {
    const s = stats();
    s[k] = (s[k] || 0) + n;
    store.set(K.stats, s);
    return s;
  };

  // ---------- quests ----------
  /* `ok` (optional): is this quest earnable for this learner right now? Checked when a day's three quests are picked, so nobody
     is handed one they cannot finish. */
  const course = () => store.get("nic.course", "nic");
  const RUNNER_COURSES = ["nic", "algo"]; // the courses whose step-through runners ask "predict the next step" (Data Science has none)
  /** A boss quiz ready to take: its lecture's lessons (workshops aside) are done and at least 5 of its questions are still unanswered. */
  function bossReady() {
    const done = store.get("nic.lessonDone", {}),
      quiz = store.get("nic.quiz", {});
    return NIC.modules.some((m) => {
      if (m.num !== "Boss") return false;
      const B = NIC.bossDef && NIC.bossDef(m.id);
      if (!B || B.qs.filter((_, i) => typeof quiz[`${m.id}-${i}`] !== "object").length < 5) return false;
      const lessons = NIC.modules.filter(
        (x) =>
          x.num !== "Boss" &&
          !x.workshop &&
          !x.video &&
          (x.subject || "nic") === (m.subject || "nic") &&
          x.lecture === m.lecture,
      );
      return lessons.length > 0 && lessons.every((x) => done[x.id]);
    });
  }
  const POOL = [
    { id: "xp20", t: "Earn 20 XP", m: "xp", n: 20 },
    { id: "xp40", t: "Earn 40 XP", m: "xp", n: 40 },
    { id: "lesson1", t: "Complete a lesson", m: "lesson", n: 1 },
    { id: "lesson2", t: "Complete 2 lessons", m: "lesson", n: 2 },
    { id: "acc90", t: "Finish a lesson with 90%+ accuracy", m: "acc90", n: 1 },
    { id: "combo5", t: "Get 5 answers in a row", m: "combo", n: 5, max: true },
    { id: "demo", t: "Tick every step of a demo checklist", m: "demo", n: 1 },
    { id: "boss5", t: "Answer 5 boss questions right", m: "boss", n: 5, ok: bossReady },
    {
      id: "predict3",
      t: "Predict 3 steps in a running figure",
      m: "predict",
      n: 3,
      ok: () => RUNNER_COURSES.includes(course()),
    },
  ];
  function seeded(s) {
    let h = 0;
    for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return () => (h = (h * 1664525 + 1013904223) >>> 0) / 4294967296;
  }
  const questList = (q) => (q && Array.isArray(q.list) ? q.list : null);
  function quests() {
    let q = store.get(K.quests, null);
    if (!q || q.date !== today() || !questList(q)) {
      const r = seeded(today()),
        xp = POOL.filter((p) => p.m === "xp"),
        rest = POOL.filter((p) => p.m !== "xp" && (!p.ok || p.ok()));
      const pick = [xp[Math.floor(r() * xp.length)]];
      while (pick.length < 3 && pick.length - 1 < rest.length) {
        const c = rest[Math.floor(r() * rest.length)];
        if (!pick.includes(c)) pick.push(c);
      }
      q = { date: today(), list: pick.map((p) => ({ id: p.id, prog: 0, done: false, claimed: false })) };
      store.set(K.quests, q);
    }
    return q.list.map((x) => ({ ...POOL.find((p) => p.id === x.id), ...x }));
  }
  const claimable = () => quests().some((q) => q.done && !q.claimed);
  function claim(id) {
    const q = store.get(K.quests, null),
      list = questList(q);
    const it = list && list.find((x) => x.id === id);
    if (!it || !it.done || it.claimed) return 0;
    it.claimed = true;
    store.set(K.quests, q);
    if (list.every((x) => x.claimed)) {
      const f = frz();
      if (f.n < 2) {
        f.n++;
        store.set("nic.freeze", f);
        emit("freeze", { earned: true, left: f.n });
      }
    }
    award(10, "quest");
    emit("quest", { id, claimed: true });
    return 10;
  }
  function track(metric, n = 1) {
    quests(); // roll over the day if needed
    const q = store.get(K.quests, null),
      list = questList(q) || [];
    let changed = false;
    list.forEach((it) => {
      const def = POOL.find((p) => p.id === it.id);
      if (!def || def.m !== metric || it.done) return;
      it.prog = def.max ? Math.max(it.prog, n) : it.prog + n;
      if (it.prog >= def.n) {
        it.prog = def.n;
        it.done = true;
        emit("quest", { id: it.id, done: true, t: def.t });
      }
      changed = true;
    });
    if (changed) store.set(K.quests, q);
    if (metric === "combo") {
      const s = stats();
      if (n > (s.bestCombo || 0)) {
        s.bestCombo = n;
        store.set(K.stats, s);
      }
      if (n >= 10) unlock("combo10");
    }
    if (metric === "demo") {
      const s = bump("demos");
      if (s.demos >= 5) unlock("demo5");
    }
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
    { id: "fixer", t: "Detective", d: "Get a missed question right in Revise", acc: "detective" },
  ];
  const FREE = ["beanie", "bowtie", "monocle", "moustache", "scarf", "hearts"];
  const achState = () => store.get(K.ach, {});
  function unlock(id) {
    const s = achState();
    if (s[id]) return;
    s[id] = today();
    store.set(K.ach, s);
    const a = ACH.find((x) => x.id === id);
    emit("ach", a);
  }
  /** The boss quiz you are closest to acing, as [right answers, questions] (for the Flawless badge). */
  function bestBoss() {
    const quiz = store.get("nic.quiz", {});
    let best = [0, 1];
    NIC.modules.forEach((m) => {
      const B = m.num === "Boss" && NIC.bossDef && NIC.bossDef(m.id);
      if (!B || !B.qs.length) return;
      const c = B.qs.filter((_, i) => quiz[`${m.id}-${i}`] && quiz[`${m.id}-${i}`].ok).length;
      if (c / B.qs.length > best[0] / best[1]) best = [c, B.qs.length];
    });
    return best;
  }
  /** How far along an achievement is: {have, need, unit} (have never passes need), or null for an unknown id. Built from the
      stats already kept, so the Profile can show "4/7 days" under a locked badge. need is 1 for the all-or-nothing ones. */
  function achProgress(id) {
    if (!ACH.some((a) => a.id === id)) return null;
    const st = stats(),
      measure = {
        first: () => [st.lessons, 1, "lesson"],
        streak3: () => [streak(), 3, "days"],
        streak7: () => [streak(), 7, "days"],
        streak30: () => [streak(), 30, "days"],
        xp100: () => [Math.max(0, ...Object.values(xpState().days)), 100, "XP"],
        demo5: () => [st.demos, 5, "demos"],
        lessons10: () => [st.lessons, 10, "lessons"],
        combo10: () => [st.bestCombo, 10, "in a row"],
        perfect: () => [...bestBoss(), "right"],
      },
      [have, need, unit] = (measure[id] || (() => [0, 1, ""]))(); // night, fixer: one go
    return { have: achState()[id] ? need : Math.max(0, Math.min(need, Math.floor(have || 0))), need, unit };
  }
  const unlockedAcc = () => {
    const s = achState();
    return [...FREE, ...ACH.filter((a) => s[a.id]).map((a) => a.acc)];
  };

  // ---------- lesson completion ----------
  /** kind: "lesson" | "boss" | "practice" | "revise". Practice and revision keep the streak alive but aren't lessons. */
  function lessonDone({ acc = 1, review = false, kind = "lesson" } = {}) {
    const t = today(),
      list = days(),
      first = !list.includes(t),
      before = streak();
    if (first) {
      list.push(t);
      store.set(K.days, list.slice(-400));
    }
    if (kind === "practice" || kind === "revise") {
      if (first) emit("streak", { from: before, to: streak() });
      return { firstToday: first, streakFrom: before, streak: streak(), review };
    }
    if (!review) {
      // a replay keeps the streak alive but is not a new lesson: no lesson count, quest progress or Scholar from re-running one
      const s = bump("lessons");
      track("lesson");
      if (acc >= 0.9) track("acc90");
      unlock("first");
      if (s.lessons >= 10) unlock("lessons10");
      if (new Date().getHours() >= 22) unlock("night");
    }
    const now = streak();
    if (now >= 3) unlock("streak3");
    if (now >= 7) unlock("streak7");
    if (now >= 30) unlock("streak30");
    if (first) emit("streak", { from: before, to: now });
    return { firstToday: first, streakFrom: before, streak: now, review };
  }
  function answered(ok) {
    const s = stats();
    s.answered++;
    if (ok) s.right++;
    store.set(K.stats, s);
  }

  NIC.game = {
    today,
    award,
    track,
    on,
    goal,
    setGoal: (g) => {
      store.set(K.goal, g);
      emit("xp", { n: 0, total: xpState().total, today: todayXP() });
    },
    todayXP,
    totalXP: () => xpState().total,
    streak,
    freezes: () => frz().n,
    doneToday: () => days().includes(today()),
    week,
    quests,
    claim,
    claimable,
    stats,
    answered,
    lessonDone,
    unlock,
    ACH,
    achProgress,
    achState,
    unlockedAcc,
    FREE,
  };
  if (NIC.cast) NIC.cast.unlocked = unlockedAcc;
  applyFreeze();
})();
