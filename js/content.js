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
    nic: ["js/l12.js", "js/l3.js", "js/l4.js", "js/lab.js", "js/lessons.js", "js/boss-nic.js"],
    ds: ["js/ds.js", "js/ds-l23.js", "js/ds-workshops.js", "js/boss-ds.js", "js/boss-ds-23.js"],
    algo: ["js/algo-p1.js", "js/algo-p2.js", "js/algo-p3.js", "js/algo-p4.js", "js/algo-p5.js", "js/algo-p6.js", "js/algo-p7.js", "js/algo-p8.js", "js/algo-p9.js", "js/algo-p10.js",
      "js/algo-workshops-2.js", "js/algo-workshops-1.js", "js/algo-workshops-3.js", "js/algo-workshops-4.js", "js/algo-workshops-5.js", "js/algo-workshops-6.js", "js/algo-workshops-7.js",
      "js/algo-workshops-8.js", "js/algo-workshops-9.js", "js/algo-workshops-10.js", "js/algo-workshops-11.js", "js/boss-algo.js"],
  };
  const state = {}, subs = [];

  /** Inject a course's scripts. async=false downloads them in parallel but runs them in this order. */
  function load(course) {
    if (!GROUPS[course]) return Promise.resolve();
    if (state[course]) return state[course].p;
    const files = GROUPS[course];
    const st = (state[course] = { done: false });
    st.p = new Promise((ok, bad) => {
      let left = files.length;
      files.forEach((f) => {
        const s = document.createElement("script");
        s.async = false; s.src = N.asset(f);
        s.onload = () => { if (--left === 0) ok(); };
        s.onerror = () => { delete state[course]; bad(new Error("failed to load " + f)); };
        document.head.appendChild(s);
      });
    }).then(() => { st.done = true; subs.forEach((fn) => { try { fn(course); } catch (e) { console.error(e); } }); });
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
  N.content = { load, all, has, allLoaded, courseOf, groups: GROUPS, onLoad: (fn) => subs.push(fn) };
})();
