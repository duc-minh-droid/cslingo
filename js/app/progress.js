(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { SUBJECTS } = app;
  const { store } = NIC;

  // ---- Progress model ----
  const isBoss = (m) => m.num === "Boss";
  function status(m) {
    if (isBoss(m)) {
      const q = store.get("nic.quiz", {});
      const keys = Object.keys(q).filter((k) => k.startsWith(m.id + "-") && typeof q[k] === "object");
      return keys.length === 0 ? "new" : keys.length >= (m.qCount || 1) ? "done" : "started";
    }
    if (store.get("nic.lessonDone", {})[m.id]) return "done";
    return store.get("nic.visited", {})[m.id] ? "started" : "new";
  }
  const progress = (list) => {
    const d = list.filter((m) => status(m) === "done").length;
    return { d, n: list.length, f: list.length ? d / list.length : 0 };
  };
  app.course = store.get("nic.course", "nic");
  const setCourse = (s) => {
    app.course = s;
    store.set("nic.course", s);
    if (NIC.cast) NIC.cast.course = SUBJECTS[s].who;
    app.renderTop();
  };
  Object.assign(app, { isBoss, progress, setCourse, status });
})();
