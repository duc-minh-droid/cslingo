/* Course content, loaded on demand: NIC.content.
   The engine (core, fx, fig, player, quiz, ...) loads at startup; each course's lessons, workshops and boss quizzes are separate
   script groups, so a learner only downloads the course they open first. The other courses load quietly afterwards.
   A group is a list of script and stylesheet files. Besides the course's own files it carries what only that course needs
   (the workshop engine and styles for Data Science and Algorithms, the Python code lab and per-phase lab styles for Algorithms).
   A file listed in two groups loads once. Add a new lesson file to the right group below (order matters inside a group: it is
   the order the scripts run; stylesheets keep their place in the cascade, see the course-styles marker in index.html).
     NIC.content.load("ds")   → Promise, resolves when the Data Science scripts and styles have loaded
     NIC.content.all()        → every course (Revise, search and tests need all modules)
     NIC.content.courseOf(hash) → "nic" | "ds" | "algo" | "all" | null for a route */
(function () {
  const N = NIC;
  /* The workshop engine and its styles: Data Science and Algorithms workshops (Nature-Inspired has none). */
  const WORKSHOPS = [
    "css/workshop/engine.css",
    "css/workshop/ds-ops-query.css",
    "css/workshop/ds-storage-codelab.css",
    "css/workshop/dijkstra-codelab.css",
    "css/workshop/codelab-io-split.css",
    "js/workshop.js",
  ];
  /* Algorithms only: the per-phase workshop styles and the Python code lab engine. */
  const ALGO_LABS = [
    "css/aw/aw1-pagerank.css",
    "css/aw/aw3-corner-hunt.css",
    "css/aw/aw4-network.css",
    "css/aw/aw5-hull.css",
    "css/aw/aw6-wire-bits.css",
    "css/aw/aw6-crc-hamming.css",
    "css/aw/aw7-compression.css",
    "css/aw/aw8-blockchain.css",
    "css/aw/aw9-wave-mixer.css",
    "css/aw/aw10-code-attention.css",
    "css/aw/aw11-picker-cases.css",
    "css/aw/aw11-picker-results.css",
    "js/codelab/format.js",
    "js/codelab/highlight.js",
    "js/codelab/python.js",
    "js/codelab/autocomplete.js",
    "js/codelab/editor.js",
    "js/codelab/lab.js",
  ];
  const GROUPS = {
    nic: [
      "js/content/nic/l12-01.js",
      "js/content/nic/l12-02.js",
      "js/content/nic/l12-03.js",
      "js/content/nic/l12-04.js",
      "js/content/nic/l3-01.js",
      "js/content/nic/l3-02.js",
      "js/content/nic/l3-03.js",
      "js/content/nic/l3-04.js",
      "js/content/nic/l3-05.js",
      "js/content/nic/l4-01.js",
      "js/content/nic/l4-02.js",
      "js/content/nic/l4-03.js",
      "js/content/nic/l4-04.js",
      "js/content/nic/l4-05.js",
      "js/content/nic/l4-06.js",
      "js/content/nic/lab-01.js",
      "js/content/nic/lab-02.js",
      "js/content/nic/lessons-01.js",
      "js/content/nic/lessons-02.js",
      "js/content/nic/lessons-03.js",
      "js/content/nic/lessons-04.js",
      "js/content/nic/lessons-05.js",
      "js/content/nic/lessons-06.js",
      "js/content/nic/lessons-07.js",
      "js/content/nic/boss-nic-01.js",
      "js/content/nic/boss-nic-02.js",
    ],
    ds: [
      ...WORKSHOPS,
      "js/content/ds/ds-01.js",
      "js/content/ds/ds-02.js",
      "js/content/ds/ds-03.js",
      "js/content/ds/ds-04.js",
      "js/content/ds/ds-05.js",
      "js/content/ds/ds-06.js",
      "js/content/ds/ds-l23-01.js",
      "js/content/ds/ds-l23-02.js",
      "js/content/ds/ds-l23-03.js",
      "js/content/ds/ds-l23-04.js",
      "js/content/ds/ds-l23-05.js",
      "js/content/ds/ds-workshops-01.js",
      "js/content/ds/ds-workshops-02.js",
      "js/content/ds/ds-workshops-03.js",
      "js/content/ds/boss-ds.js",
      "js/content/ds/boss-ds-23.js",
    ],
    algo: [
      ...WORKSHOPS,
      ...ALGO_LABS,
      "js/content/algo/algo-p1-01.js",
      "js/content/algo/algo-p1-02.js",
      "js/content/algo/algo-p1-03.js",
      "js/content/algo/algo-p1-04.js",
      "js/content/algo/algo-p2-01.js",
      "js/content/algo/algo-p2-02.js",
      "js/content/algo/algo-p2-03.js",
      "js/content/algo/algo-p3-01.js",
      "js/content/algo/algo-p3-02.js",
      "js/content/algo/algo-p3-03.js",
      "js/content/algo/algo-p3-04.js",
      "js/content/algo/algo-p4-01.js",
      "js/content/algo/algo-p4-02.js",
      "js/content/algo/algo-p5-01.js",
      "js/content/algo/algo-p5-02.js",
      "js/content/algo/algo-p6.js",
      "js/content/algo/algo-p7-01.js",
      "js/content/algo/algo-p7-02.js",
      "js/content/algo/algo-p7-03.js",
      "js/content/algo/algo-p7-04.js",
      "js/content/algo/algo-p7-05.js",
      "js/content/algo/algo-p8.js",
      "js/content/algo/algo-p9-01.js",
      "js/content/algo/algo-p9-02.js",
      "js/content/algo/algo-p9-03.js",
      "js/content/algo/algo-p10.js",
      "js/content/algo/algo-workshops-2-01.js",
      "js/content/algo/algo-workshops-2-02.js",
      "js/content/algo/algo-workshops-1.js",
      "js/content/algo/algo-workshops-3-01.js",
      "js/content/algo/algo-workshops-3-02.js",
      "js/content/algo/algo-workshops-3-03.js",
      "js/content/algo/algo-workshops-3-04.js",
      "js/content/algo/algo-workshops-3-05.js",
      "js/content/algo/algo-workshops-4-01.js",
      "js/content/algo/algo-workshops-4-02.js",
      "js/content/algo/algo-workshops-4-03.js",
      "js/content/algo/algo-workshops-5-01.js",
      "js/content/algo/algo-workshops-5-02.js",
      "js/content/algo/algo-workshops-6-01.js",
      "js/content/algo/algo-workshops-6-02.js",
      "js/content/algo/algo-workshops-6-03.js",
      "js/content/algo/algo-workshops-7-01.js",
      "js/content/algo/algo-workshops-7-02.js",
      "js/content/algo/algo-workshops-7-03.js",
      "js/content/algo/algo-workshops-8-01.js",
      "js/content/algo/algo-workshops-8-02.js",
      "js/content/algo/algo-workshops-8-03.js",
      "js/content/algo/algo-workshops-9-01.js",
      "js/content/algo/algo-workshops-9-02.js",
      "js/content/algo/algo-workshops-9-03.js",
      "js/content/algo/algo-workshops-10-01.js",
      "js/content/algo/algo-workshops-10-02.js",
      "js/content/algo/algo-workshops-11-01.js",
      "js/content/algo/algo-workshops-11-02.js",
      "js/content/algo/algo-workshops-11-03.js",
      "js/content/algo/algo-workshops-11-04.js",
      "js/content/algo/boss-algo-01.js",
      "js/content/algo/boss-algo-02.js",
      "js/content/algo/boss-algo-03.js",
    ],
  };

  const state = {},
    subs = [];

  const requested = new Map(); // file → promise, so a file listed in two groups loads once

  /** Insert one file. Scripts use async=false: they download in parallel but run in the order they were inserted.
      Stylesheets go before the course-styles marker in <head>, which keeps the cascade order the page was written in. */
  function loadOne(f) {
    if (requested.has(f)) return requested.get(f);
    const p = new Promise((ok, bad) => {
      const css = f.endsWith(".css");
      const node = document.createElement(css ? "link" : "script");
      if (css) {
        node.rel = "stylesheet";
        node.href = N.asset(f);
      } else {
        node.async = false;
        node.src = N.asset(f);
      }
      node.onload = () => ok();
      node.onerror = () => bad(new Error("failed to load " + f));
      if (css) document.head.insertBefore(node, document.querySelector('meta[name="course-styles"]'));
      else document.head.appendChild(node);
    });
    requested.set(f, p);
    p.catch(() => requested.delete(f)); // a failed file can be tried again by the next load()
    return p;
  }
  const loadFiles = (files) => Promise.all(files.map(loadOne)).then(() => {});

  function load(course) {
    if (!GROUPS[course]) return Promise.resolve();
    if (state[course]) return state[course].p;
    const st = (state[course] = { done: false });
    st.p = loadFiles(GROUPS[course]).then(
      () => {
        st.done = true;
        subs.forEach((fn) => {
          try {
            fn(course);
          } catch (e) {
            console.error(e);
          }
        });
      },
      (e) => {
        delete state[course];
        throw e;
      },
    );
    return st.p;
  }
  const all = () => Promise.all(Object.keys(GROUPS).map(load)).then(() => {});
  const has = (c) => !!(state[c] && state[c].done);
  const allLoaded = () => Object.keys(GROUPS).every(has);
  /** Which course a route needs first ("all" for pages that list every course; null when it doesn't matter). */
  function courseOf(route) {
    const id = String(route || "").split("/")[0];
    if (!id || id === "home") return "nic";
    if (id === "ds-home") return "ds";
    if (id === "algo-home") return "algo";
    if (id === "profile") return courseOf(N.store.get("nic.lastHome", "home")); // stats and achievements need no other course's lessons
    if (/^(practice|revise)$/.test(id)) return "all";
    if (/^l\d/.test(id)) return "nic";
    if (/^ds/.test(id)) return "ds";
    if (/^a\d/.test(id)) return "algo";
    return "all";
  }
  N.content = { load, loadFiles, all, has, allLoaded, courseOf, groups: GROUPS, onLoad: (fn) => subs.push(fn) };
})();
