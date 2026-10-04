/* Revision question bank: NIC.bank.
   Content lives in js/bank/<course>-NN.js (loaded on demand by NIC.bank.load()), one list per module (session):
     NIC.bank.add("l3-hc", [ {type, q, ..., why}, ... ])   // same question types as boss quizzes (js/quiz/)
   A revision tab asks for a shuffled deck drawn from the sessions the learner has finished:
     const deck = NIC.bank.deck({ n: 10 });                // [{id, mod, subject, lecture, src, Q}]
     NIC.bank.record(item.id, ok);                        // after each answer (updates the Leitner box; only a due question moves up)
     NIC.bank.afterRound(ids) / roundBonus(n) / nextDue()  // what a finished round set up, for the complete screen and the Revise page
   Pool sources: bank questions + lesson quick checks of finished modules, and boss questions of
   boss quizzes the learner has attempted. Progress lives in localStorage key `nic.rev`.
   Scheduling is by local calendar days (a box-2 question answered at 11 pm is due again from midnight), see dueAt(). */
(function () {
  const N = NIC;
  const BANK = {}; // modId -> [Q]
  let ids = null; // cache for validIds()
  const DAY = 864e5;
  const GAP = [0, 0, 1, 3, 7, 14]; // Leitner box -> days before it's due again (box 1 = always due)

  const hash = (s) => {
    let h = 5381;
    for (const c of String(s)) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
    return h.toString(36);
  };
  const plain = (s) => String(s).replace(/<[^>]+>/g, "");
  const modById = (id) => N.modules.find((m) => m.id === id);
  const subjOf = (m) => (m && m.subject) || "nic";

  /** The revision id of a question (also used by lessons and Practice, so every answer feeds one Leitner log). */
  const idFor = (modId, Q) =>
    `${modId}:${hash(plain(Q.q) + JSON.stringify(Q.o || Q.items || Q.pairs || Q.buckets || ""))}`;
  function add(modId, qs) {
    (BANK[modId] = BANK[modId] || []).push(...qs);
    ids = null; // the set of real question ids (see validIds) is stale
  }

  /** Every question the bank knows about, tagged with its module. `learnedOnly` filters to finished work. */
  function all({ learnedOnly = false, subjects = null } = {}) {
    const done = N.store.get("nic.lessonDone", {}),
      quiz = N.store.get("nic.quiz", {});
    const out = [];
    const push = (m, src, Q) => {
      if (!subjects || subjects.includes(subjOf(m)))
        out.push({ id: idFor(m.id, Q), mod: m.id, subject: subjOf(m), lecture: m.lecture, src, Q });
    };
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
      if (L)
        L.steps.forEach((s, k) => {
          if (s.c) push(m, "check", { type: "mcq", ...s.c, why: s.c.why || "", step: k });
        }); // step: the player shows that step's figure with it
    });
    return out;
  }

  const log = () => N.store.get("nic.rev", {});

  /* The question lists are big (about 1.4 MB), so they are not loaded at startup: the Revise page and revision rounds call
     NIC.bank.load() first. Everything that needs only the review log (the due badge, recording an answer) works without them. */
  // one numbered file per slice of questions: js/bank/<course>-01.js ... (tools/check-structure.js checks these counts)
  const PARTS = { nic: 41, ds: 31, algo: 57 };
  const FILES = Object.entries(PARTS).flatMap(([c, n]) =>
    Array.from({ length: n }, (_, i) => `js/bank/${c}-${String(i + 1).padStart(2, "0")}.js`),
  );
  let loadP = null,
    loaded = false;
  function load() {
    return (
      loadP ||
      (loadP = Promise.all([N.content.all(), N.content.loadFiles(FILES)])
        .then(() => {
          loaded = true;
          ids = null;
          window.dispatchEvent(new Event("nic:bank")); // dueSeen() is exact from now on: the dock badge can redraw
        })
        .catch((e) => {
          loadP = null;
          throw e;
        }))
    );
  }
  /** When a logged question is due again: midnight (local) that many calendar days after it was answered. setDate keeps this right across clock changes. */
  function dueAt(r) {
    const d = new Date(r.t);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + (GAP[Math.min(r.box || 1, 5)] || 0));
    return d.getTime();
  }
  function due(r, now) {
    return !r || !r.t || now >= dueAt(r); // never answered, or no usable date: due
  }
  /** Whole local calendar days from a to b (b later = positive). */
  const dayNum = (t) => {
    const d = new Date(t);
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY;
  };
  const daysBetween = (a, b) => Math.round(dayNum(b) - dayNum(a));

  /** A shuffled revision deck. Due and previously-missed questions first, never two in a row from one module when avoidable. */
  function deck({ n = 10, subjects = null, learnedOnly = true, now = Date.now() } = {}) {
    const R = log(),
      pool = all({ learnedOnly, subjects });
    const rich = (it) => ((it.Q.type || "mcq") !== "mcq" || it.Q.fig ? 1 : 0); // sorting, picking, sliders and figure questions come up more often than plain multiple choice
    const score = (it) => {
      const r = R[it.id];
      return (due(r, now) ? 0 : 10) + (r ? r.box : 0.5) + Math.random() * 1.5 - rich(it) * 1.2;
    };
    const ranked = pool
      .map((it) => [score(it), it])
      .sort((a, b) => a[0] - b[0])
      .slice(0, n)
      .map((x) => x[1]);
    for (let i = ranked.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ranked[i], ranked[j]] = [ranked[j], ranked[i]];
    }
    for (let i = 1; i < ranked.length; i++)
      if (ranked[i].mod === ranked[i - 1].mod) {
        const k = ranked.findIndex((x, j) => j > i && x.mod !== ranked[i - 1].mod);
        if (k > 0) [ranked[i], ranked[k]] = [ranked[k], ranked[i]];
      }
    for (let i = 1; i < ranked.length; i++)
      if ((ranked[i].Q.type || "mcq") === (ranked[i - 1].Q.type || "mcq")) {
        const k = ranked.findIndex(
          (x, j) => j > i && (x.Q.type || "mcq") !== (ranked[i - 1].Q.type || "mcq") && x.mod !== ranked[i - 1].mod,
        );
        if (k > 0) [ranked[i], ranked[k]] = [ranked[k], ranked[i]];
      } // and mix the question types
    return ranked;
  }

  /* Every question id that exists, once the lists are loaded (all content is in by then). A review-log entry whose question was
     edited or removed has no id here, so it stops counting as due. Before the load, dueSeen() can only check the module. */
  const validIds = () => ids || (ids = new Set(all().map((x) => x.id)));

  /** Reviews due among questions already answered, from the review log. Needs no question content, but once the bank has loaded
      it counts only entries that still match a real question, so the badge can clear after a question is edited. */
  function dueSeen({ subjects = null, now = Date.now() } = {}) {
    const R = log(),
      done = N.store.get("nic.lessonDone", {}),
      real = loaded ? validIds() : null;
    return Object.keys(R).filter((id) => {
      const mod = id.split(":")[0],
        m = modById(mod);
      return (
        m &&
        (!real || real.has(id)) &&
        (m.num === "Boss" || done[mod]) &&
        (!subjects || subjects.includes(subjOf(m))) &&
        due(R[id], now)
      );
    }).length;
  }

  /** Record an answer. Wrong always sends the question back to box 1. Right moves it up a box only when it was due: an early
      replay ("Do these again", a lesson re-run) counts in the totals but leaves the schedule alone. Returns the log entry plus
      `fixed`: a question that was missed before and is now right. */
  function record(id, ok, now = Date.now()) {
    const R = log(),
      prev = R[id],
      r = prev || { box: 1, n: 0, right: 0 },
      wasDue = due(prev, now),
      fixed = !!(ok && prev && prev.right < prev.n && wasDue);
    r.n++;
    if (ok) r.right++;
    if (!ok) {
      r.box = 1;
      r.t = now;
    } else if (wasDue) {
      r.box = Math.min(5, (r.box || 1) + 1);
      r.t = now;
    }
    R[id] = r;
    N.store.set("nic.rev", R);
    if (fixed) detective();
    return { ...r, fixed };
  }
  /** Detective: getting a question you missed before right again inside a revision round. */
  function detective() {
    const S = N.shared && N.shared.enginePlayer && N.shared.enginePlayer.S;
    if (S && S.kind === "revise" && N.game) N.game.unlock("fixer");
  }

  /** The soonest a not-yet-due answered question comes round again (ms timestamp, or null), among the finished work. */
  function nextDue({ subjects = null, now = Date.now() } = {}) {
    const R = log();
    let best = null;
    all({ learnedOnly: true, subjects }).forEach((it) => {
      const r = R[it.id];
      if (r && r.t && !due(r, now)) {
        const t = dueAt(r);
        if (best === null || t < best) best = t;
      }
    });
    return best;
  }
  /** "today" / "tomorrow" / "in 3 days": when a due date falls, in whole calendar days from now. */
  const whenLabel = (t, now = Date.now()) => {
    const d = daysBetween(now, t);
    return d <= 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`;
  };

  /** What a finished round set up, for the revision complete screen: `soon` questions are due again straight away (the ones
      missed), `next` is the earliest date the others come back (ms, or null) and `nextLabel` says it ("tomorrow"). Read this
      after the round's answers were recorded. */
  function afterRound(idList, { now = Date.now() } = {}) {
    const R = log();
    let soon = 0,
      next = null;
    (idList || []).forEach((id) => {
      const r = R[id];
      if (!r) return;
      if (due(r, now)) soon++;
      else if (next === null || dueAt(r) < next) next = dueAt(r);
    });
    return { soon, next, nextLabel: next === null ? "" : whenLabel(next, now) };
  }

  /** The completion bonus XP for a revision round of n questions: 5 for a round of 5, a little more for a longer one (7 for 10, 10 for 20). */
  const roundBonus = (n) => Math.max(5, Math.round(5 * Math.sqrt((n || 0) / 5)));

  /** Counts for a revision home screen. */
  function stats({ subjects = null, now = Date.now() } = {}) {
    const R = log(),
      pool = all({ learnedOnly: true, subjects });
    const seen = pool.filter((it) => R[it.id]);
    return {
      available: pool.length,
      due: pool.filter((it) => due(R[it.id], now)).length,
      dueSeen: seen.filter((it) => due(R[it.id], now)).length, // questions already answered whose review is due (new questions are not 'due')
      seen: seen.length,
      mastered: seen.filter((it) => R[it.id].box >= 4).length,
      accuracy: seen.length
        ? seen.reduce((s, it) => s + R[it.id].right, 0) / seen.reduce((s, it) => s + R[it.id].n, 0)
        : 0,
      bySubject: pool.reduce((o, it) => ((o[it.subject] = (o[it.subject] || 0) + 1), o), {}),
    };
  }

  /** Content problems (unknown module ids, broken answers). Used by tools/bank-test.js. */
  function problems() {
    const out = [],
      T = N.QUIZ_TYPES || {};
    Object.entries(BANK).forEach(([mod, qs]) => {
      if (!modById(mod)) out.push(`bank: unknown module "${mod}"`);
      qs.forEach((Q, i) => {
        const t = Q.type || "mcq",
          at = `${mod}[${i}]`;
        if (!T[t]) out.push(`${at}: unknown type ${t}`);
        if (t === "num") out.push(`${at}: typed answers aren't allowed (no calculator)`);
        if (!Q.q || !Q.why) out.push(`${at}: needs q and why`);
        if (t === "mcq" && !(Q.a >= 0 && Q.a < (Q.o || []).length)) out.push(`${at}: answer index out of range`);
        if (t === "multi" && !(Q.a || []).every((k) => k >= 0 && k < Q.o.length))
          out.push(`${at}: answer index out of range`);
        if (t === "cat" && !Q.items.every((x) => x[1] >= 0 && x[1] < Q.buckets.length))
          out.push(`${at}: bucket out of range`);
        if (t === "bug" && !(Q.a >= 0 && Q.a < Q.code.length)) out.push(`${at}: line out of range`);
        if (t === "slider" && !(Q.ans >= Q.min && Q.ans <= Q.max)) out.push(`${at}: slider answer outside range`);
      });
    });
    return out;
  }

  N.bank = {
    add,
    all,
    deck,
    record,
    stats,
    dueSeen,
    nextDue,
    whenLabel,
    afterRound,
    roundBonus,
    problems,
    idFor,
    load,
    loaded: () => loaded,
    raw: BANK,
  };
})();
