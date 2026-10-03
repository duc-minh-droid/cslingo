(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});

  const { modules, qs, el } = NIC;

  const main = qs("#main");
  app.life = null;

  const SUBJECTS = {
    nic: {
      name: "Nature-Inspired",
      code: "ECM3412",
      home: "home",
      unit: "Lecture",
      who: "sprout",
      color: "green",
      lectures: {
        1: "Lecture 1 — What is NIC? Evolution as problem solving",
        2: "Lecture 2 — Why EAs: optimisation & hardness",
        3: "Lecture 3 — Local vs population search & landscapes",
        4: "Lecture 4 — Selection, operators & encodings",
      },
    },
    ds: {
      name: "Data Science",
      code: "COM3021",
      home: "ds-home",
      unit: "Lecture",
      who: "pebble",
      color: "blue",
      lectures: {
        1: "Lecture 1 — Reliable, scalable & maintainable systems",
        2: "Lecture 2 — Data models & NoSQL",
        3: "Lecture 3 — Storage & retrieval",
      },
    },
    algo: {
      name: "Algorithms",
      code: "ECM3428",
      home: "algo-home",
      unit: "Phase",
      who: "byte",
      color: "violet",
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
  modules.sort(
    (a, b) =>
      SUBJ_ORDER.indexOf(subjOf(a)) - SUBJ_ORDER.indexOf(subjOf(b)) || a.lecture - b.lecture || a.order - b.order,
  );
  const inSubj = (s) => modules.filter((m) => subjOf(m) === s);
  const inLec = (s, lec) => inSubj(s).filter((m) => m.lecture === +lec);

  /* Modules arrive course by course (js/content.js), so sort and check them after every load. Guard rail: a module whose lecture
     isn't declared would silently vanish from the path. */
  function indexModules() {
    modules.sort(
      (a, b) =>
        SUBJ_ORDER.indexOf(subjOf(a)) - SUBJ_ORDER.indexOf(subjOf(b)) || a.lecture - b.lecture || a.order - b.order,
    );
    const orphans = modules.filter((m) => !SUBJECTS[subjOf(m)] || !SUBJECTS[subjOf(m)].lectures[m.lecture]);
    const dupes = modules.map((m) => m.id).filter((id, i, a) => a.indexOf(id) !== i);
    const old = qs(".dev-banner");
    if (old) old.remove();
    if (orphans.length || dupes.length) {
      const msg = [
        orphans.length && `Modules with an undeclared lecture: ${orphans.map((m) => m.id).join(", ")}`,
        dupes.length && `Duplicate ids: ${dupes.join(", ")}`,
      ]
        .filter(Boolean)
        .join(" · ");
      console.error("[visualizer]", msg);
      document.body.prepend(el(`<div class="dev-banner">⚠ ${msg}</div>`));
    }
  }
  NIC.content.onLoad(indexModules);
  Object.assign(app, { SUBJECTS, SUBJ_ORDER, inLec, inSubj, main, subjOf });
})();
