/* Course content, loaded on demand: NIC.content.
   The engine (core, fx, fig, player, quiz, ...) loads at startup; each course's lessons, workshops and boss quizzes are separate
   script groups, so a learner only downloads the course they open first. The other courses load quietly afterwards.
   Add a new lesson file to the right group below (order matters inside a group: it is the order the scripts run).
     NIC.content.load("ds")   → Promise, resolves when the Data Science scripts have run
     NIC.content.all()        → every course (Revise, search and tests need all modules)
     NIC.content.courseOf(hash) → "nic" | "ds" | "algo" | "all" | null for a route */
(function () {
  const N = NIC;
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

  /** Inject scripts: async=false downloads them in parallel but runs them in the order given. */
  function loadFiles(files) {
    return new Promise((ok, bad) => {
      let left = files.length;
      if (!left) return ok();
      files.forEach((f) => {
        const s = document.createElement("script");
        s.async = false;
        s.src = N.asset(f);
        s.onload = () => {
          if (--left === 0) ok();
        };
        s.onerror = () => bad(new Error("failed to load " + f));
        document.head.appendChild(s);
      });
    });
  }

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
