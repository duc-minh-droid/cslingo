/* Revision question bank: NIC.bank.
   Content lives in bank-nic.js / bank-ds.js / bank-algo.js (loaded on demand by NIC.bank.load()), one list per module (session):
     NIC.bank.add("l3-hc", [ {type, q, ..., why}, ... ])   // same question types as boss quizzes (js/quiz.js)
   A revision tab asks for a shuffled deck drawn from the sessions the learner has finished:
     const deck = NIC.bank.deck({ n: 10 });                // [{id, mod, subject, lecture, src, Q}]
     NIC.bank.record(item.id, ok);                        // after each answer (updates the Leitner box)
   Pool sources: bank questions + lesson quick checks of finished modules, and boss questions of
   boss quizzes the learner has attempted. Progress lives in localStorage key `nic.rev`. */
(function () {
  const N = NIC;
  const BANK = {};                       // modId -> [Q]
  const DAY = 864e5;
  const GAP = [0, 0, 1, 3, 7, 14];       // Leitner box -> days before it's due again (box 1 = always due)

  const hash = (s) => { let h = 5381; for (const c of String(s)) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0; return h.toString(36); };
  const plain = (s) => String(s).replace(/<[^>]+>/g, "");
  const modById = (id) => N.modules.find((m) => m.id === id);
  const subjOf = (m) => (m && m.subject) || "nic";

  /** The revision id of a question (also used by lessons and Practice, so every answer feeds one Leitner log). */
  const idFor = (modId, Q) => `${modId}:${hash(plain(Q.q) + JSON.stringify(Q.o || Q.items || Q.pairs || Q.buckets || ""))}`;
  function add(modId, qs) { (BANK[modId] = BANK[modId] || []).push(...qs); }

  /** Every question the bank knows about, tagged with its module. `learnedOnly` filters to finished work. */
  function all({ learnedOnly = false, subjects = null } = {}) {
    const done = N.store.get("nic.lessonDone", {}), quiz = N.store.get("nic.quiz", {});
    const out = [];
    const push = (m, src, Q) => { if (!subjects || subjects.includes(subjOf(m))) out.push({ id: idFor(m.id, Q), mod: m.id, subject: subjOf(m), lecture: m.lecture, src, Q }); };
    N.modules.forEach((m) => {
      if (m.num === "Boss") {
        const B = N.bossDef && N.bossDef(m.id);
        const tried = Object.keys(quiz).some((k) => k.startsWith(m.id + "-") && typeof quiz[k] === "object");
        if (B && (!learnedOnly || tried)) B.qs.forEach((Q) => push(m, "boss", Q));
        return;
      }
      if (learnedOnly && !done[m.id]) return;
      (BANK[m.id] || []).forEach((Q) => push(m, "bank", Q));
      const L = N.LESSONS[m.id];
      if (L) L.steps.forEach((s, k) => { if (s.c) push(m, "check", { type: "mcq", q: s.c.q, o: s.c.o, a: s.c.a, why: s.c.why, step: k }); }); // step: the player shows that step's figure with it
    });
    return out;
  }

  const log = () => N.store.get("nic.rev", {});

  /* The question lists are big (about 1.4 MB), so they are not loaded at startup: the Revise page and revision rounds call
     NIC.bank.load() first. Everything that needs only the review log (the due badge, recording an answer) works without them. */
  const FILES = ["js/bank-nic.js", "js/bank-ds.js", "js/bank-algo.js"];
  let loadP = null, loaded = false;
  function load() {
    return loadP || (loadP = Promise.all([N.content ? N.content.all() : null, ...FILES.map((f) => N.lazy(f))]).then(() => { loaded = true; }).catch((e) => { loadP = null; throw e; }));
  }
  function due(r, now) { return !r || now - r.t >= GAP[Math.min(r.box, 5)] * DAY; }

  /** A shuffled revision deck. Due and previously-missed questions first, never two in a row from one module when avoidable. */
  function deck({ n = 10, subjects = null, learnedOnly = true, now = Date.now() } = {}) {
    const R = log(), pool = all({ learnedOnly, subjects });
    const rich = (it) => ((it.Q.type || "mcq") !== "mcq" || it.Q.fig ? 1 : 0); // sorting, picking, sliders and figure questions come up more often than plain multiple choice
    const score = (it) => { const r = R[it.id]; return (due(r, now) ? 0 : 10) + (r ? r.box : 0.5) + Math.random() * 1.5 - rich(it) * 1.2; };
    const ranked = pool.map((it) => [score(it), it]).sort((a, b) => a[0] - b[0]).slice(0, n).map((x) => x[1]);
    for (let i = ranked.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ranked[i], ranked[j]] = [ranked[j], ranked[i]]; }
    for (let i = 1; i < ranked.length; i++) if (ranked[i].mod === ranked[i - 1].mod) { const k = ranked.findIndex((x, j) => j > i && x.mod !== ranked[i - 1].mod); if (k > 0) [ranked[i], ranked[k]] = [ranked[k], ranked[i]]; }
    for (let i = 1; i < ranked.length; i++) if ((ranked[i].Q.type || "mcq") === (ranked[i - 1].Q.type || "mcq")) { const k = ranked.findIndex((x, j) => j > i && (x.Q.type || "mcq") !== (ranked[i - 1].Q.type || "mcq") && x.mod !== ranked[i - 1].mod); if (k > 0) [ranked[i], ranked[k]] = [ranked[k], ranked[i]]; } // and mix the question types
    return ranked;
  }

  /** Reviews due among questions already answered, straight from the review log (no question content needed). */
  function dueSeen({ subjects = null, now = Date.now() } = {}) {
    const R = log(), done = N.store.get("nic.lessonDone", {});
    return Object.keys(R).filter((id) => {
      const mod = id.split(":")[0], m = modById(mod);
      return m && (m.num === "Boss" || done[mod]) && (!subjects || subjects.includes(subjOf(m))) && due(R[id], now);
    }).length;
  }

  /** Record an answer: right moves the question up a box (seen less often), wrong sends it back to box 1. */
  function record(id, ok, now = Date.now()) {
    const R = log(), r = R[id] || { box: 1, n: 0, right: 0 };
    r.n++; if (ok) r.right++;
    r.box = ok ? Math.min(5, r.box + 1) : 1; r.t = now;
    R[id] = r; N.store.set("nic.rev", R);
    return r;
  }

  /** Counts for a revision home screen. */
  function stats({ subjects = null, now = Date.now() } = {}) {
    const R = log(), pool = all({ learnedOnly: true, subjects });
    const seen = pool.filter((it) => R[it.id]);
    return {
      available: pool.length,
      due: pool.filter((it) => due(R[it.id], now)).length,
      dueSeen: seen.filter((it) => due(R[it.id], now)).length, // questions already answered whose review is due (new questions are not 'due')
      seen: seen.length,
      mastered: seen.filter((it) => R[it.id].box >= 4).length,
      accuracy: seen.length ? seen.reduce((s, it) => s + R[it.id].right, 0) / seen.reduce((s, it) => s + R[it.id].n, 0) : 0,
      bySubject: pool.reduce((o, it) => ((o[it.subject] = (o[it.subject] || 0) + 1), o), {}),
    };
  }

  /** Content problems (unknown module ids, broken answers). Used by tools/bank-test.js. */
  function problems() {
    const out = [], T = N.QUIZ_TYPES || {};
    Object.entries(BANK).forEach(([mod, qs]) => {
      if (!modById(mod)) out.push(`bank: unknown module "${mod}"`);
      qs.forEach((Q, i) => {
        const t = Q.type || "mcq", at = `${mod}[${i}]`;
        if (!T[t]) out.push(`${at}: unknown type ${t}`);
        if (t === "num") out.push(`${at}: typed answers aren't allowed (no calculator)`);
        if (!Q.q || !Q.why) out.push(`${at}: needs q and why`);
        if (t === "mcq" && !(Q.a >= 0 && Q.a < (Q.o || []).length)) out.push(`${at}: answer index out of range`);
        if (t === "multi" && !(Q.a || []).every((k) => k >= 0 && k < Q.o.length)) out.push(`${at}: answer index out of range`);
        if (t === "cat" && !Q.items.every((x) => x[1] >= 0 && x[1] < Q.buckets.length)) out.push(`${at}: bucket out of range`);
        if (t === "bug" && !(Q.a >= 0 && Q.a < Q.code.length)) out.push(`${at}: line out of range`);
        if (t === "slider" && !(Q.ans >= Q.min && Q.ans <= Q.max)) out.push(`${at}: slider answer outside range`);
      });
    });
    return out;
  }

  N.bank = { add, all, deck, record, stats, dueSeen, problems, idFor, load, loaded: () => loaded, raw: BANK };
})();
