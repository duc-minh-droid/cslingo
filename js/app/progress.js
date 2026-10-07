(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { SUBJECTS } = app;
  const { store } = NIC;

  // ---- Progress model ----
  const isBoss = (m) => m.num === "Boss";
  /** "new" | "started" | "done". A lesson is started once the learner is past its first screen (lessonPos > 0), so a quick
      look at one does not move "Up next" or the green node. A boss is done only when passed (80%, NIC.bossResult), so a 6/8
      keeps its lecture open; answered-but-not-passed and part-way both read "started". */
  function status(m) {
    if (isBoss(m)) {
      const R = NIC.bossResult && NIC.bossResult(m.id);
      if (R) return R.passed ? "done" : R.attempted ? "started" : "new";
      // the boss's questions haven't loaded yet: any saved answer means it was begun, but it can't be called passed
      const q = store.get("nic.quiz", {});
      return Object.keys(q).some((k) => k.startsWith(m.id + "-") && typeof q[k] === "object") ? "started" : "new";
    }
    if (store.get("nic.lessonDone", {})[m.id]) return "done";
    return (store.get("nic.lessonPos", {})[m.id] || 0) > 0 ? "started" : "new";
  }
  /** "boss" | "workshop" | "codelab" | "lesson". Workshops are numbered 3.W and code labs 3.C: show them as tags, not as numbers. */
  const kindOf = (m) =>
    isBoss(m) ? "boss" : m.video ? "video" : m.workshop ? (/\.C$/.test(m.num) ? "codelab" : "workshop") : "lesson";
  const numLabel = (m) => ({ workshop: "Workshop", codelab: "Code lab", video: "Recap video" })[kindOf(m)] || m.num;
  /** What a screen reader hears for a path node: its number or kind, the title and where the learner stands. */
  const nodeLabel = (m, st) => {
    const k = kindOf(m),
      R = k === "boss" && NIC.bossResult ? NIC.bossResult(m.id) : null;
    const state =
      k === "boss"
        ? st === "done"
          ? "passed"
          : R && R.attempted
            ? R.answered < R.n
              ? `in progress, ${R.answered} of ${R.n} answered`
              : `${R.right} of ${R.n} right, not yet passed`
            : "not started"
        : k === "video"
          ? { done: "watched", started: "in progress", new: "not watched" }[st]
          : { done: "completed", started: "in progress", new: "not started" }[st];
    const head =
      k === "lesson" ? m.num : k === "boss" ? "Boss quiz" : /^(workshop|code lab)/i.test(m.title) ? "" : numLabel(m);
    return `${head} ${m.title}, ${state}`.trim();
  };
  /** Done and total for a list of modules. A recap video (m.video) is a bonus, so it never counts towards finishing a lecture or a course. */
  const progress = (list) => {
    const counted = list.filter((m) => !m.video);
    const d = counted.filter((m) => status(m) === "done").length;
    return { d, n: counted.length, f: counted.length ? d / counted.length : 0 };
  };
  app.course = store.get("nic.course", "nic");
  const setCourse = (s) => {
    app.course = s;
    store.set("nic.course", s);
    if (NIC.cast) NIC.cast.course = SUBJECTS[s].who;
    app.renderTop();
  };
  Object.assign(app, { isBoss, kindOf, nodeLabel, numLabel, progress, setCourse, status });
})();
