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
  /* The Python code lab engine, shared by the Algorithms and Nature-Inspired workshops. */
  const CODELAB = [
    "js/codelab/format.js",
    "js/codelab/highlight.js",
    "js/codelab/python.js",
    "js/codelab/autocomplete.js",
    "js/codelab/editor.js",
    "js/codelab/lab.js",
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
    ...CODELAB,
  ];
  /* Nature-Inspired Lectures 5 and 6 workshops: the workshop engine, the code lab engine and their styles. */
  const NIC_LABS = ["css/nw/nw5-encodings.css", "css/nw/nw6-programs.css", ...CODELAB];
  const GROUPS = {
    nic: [
      ...WORKSHOPS,
      ...NIC_LABS,
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
      "js/content/nic/l5-01.js",
      "js/content/nic/l5-02.js",
      "js/content/nic/l5-03.js",
      "js/content/nic/l5-04.js",
      "js/content/nic/l6-01.js",
      "js/content/nic/l6-02.js",
      "js/content/nic/l6-03.js",
      "js/content/nic/l6-04.js",
      "js/content/nic/l5-workshops-01.js",
      "js/content/nic/l5-workshops-02.js",
      "js/content/nic/l5-workshops-03.js",
      "js/content/nic/l6-workshops-01.js",
      "js/content/nic/l6-workshops-02.js",
      "js/content/nic/l6-workshops-03.js",
      "js/content/nic/boss-nic-01.js",
      "js/content/nic/boss-nic-02.js",
      "js/content/nic/boss-nic-56.js",
      "js/content/nic/videos.js",
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
      "js/content/algo/algo-p2-x-01.js",
      "js/content/algo/algo-p2-x-02.js",
      "js/content/algo/algo-p2-x-03.js",
      "js/content/algo/algo-p2-x-04.js",
      "js/content/algo/algo-p3-x-01.js",
      "js/content/algo/algo-p3-x-02.js",
      "js/content/algo/algo-p3-x-03.js",
      "js/content/algo/algo-p3-x-04.js",
      "js/content/algo/algo-p3-x-05.js",
      "js/content/algo/algo-p3-x-06.js",
      "js/content/algo/algo-p3-x-07.js",
      "js/content/algo/algo-p3-x-08.js",
      "js/content/algo/algo-p3-x-09.js",
      "js/content/algo/algo-p4-x-01.js",
      "js/content/algo/algo-p4-x-02.js",
      "js/content/algo/algo-p4-x-03.js",
      "js/content/algo/algo-p4-x-04.js",
      "js/content/algo/algo-p5-x-01.js",
      "js/content/algo/algo-p5-x-02.js",
      "js/content/algo/algo-p5-x-03.js",
      "js/content/algo/algo-p5-x-04.js",
      "js/content/algo/algo-p6-x-01.js",
      "js/content/algo/algo-p6-x-02.js",
      "js/content/algo/algo-p6-x-03.js",
      "js/content/algo/algo-p6-x-04.js",
      "js/content/algo/algo-p7-x-01.js",
      "js/content/algo/algo-p7-x-02.js",
      "js/content/algo/algo-p7-x-03.js",
      "js/content/algo/algo-p7-x-04.js",
      "js/content/algo/algo-p8-x-01.js",
      "js/content/algo/algo-p8-x-02.js",
      "js/content/algo/algo-p8-x-03.js",
      "js/content/algo/algo-p8-x-04.js",
      "js/content/algo/algo-p9-x-01.js",
      "js/content/algo/algo-p9-x-02.js",
      "js/content/algo/algo-p9-x-03.js",
      "js/content/algo/algo-p9-x-04.js",
      "js/content/algo/algo-p9-x-05.js",
      "js/content/algo/algo-p9-x-06.js",
      "js/content/algo/algo-p9-x-07.js",
      "js/content/algo/algo-p9-x-08.js",
      "js/content/algo/algo-p9-x-09.js",
      "js/content/algo/algo-p9-x-10.js",
      "js/content/algo/algo-p9-x-11.js",
      "js/content/algo/algo-p9-x-12.js",
      "js/content/algo/algo-p9-x-13.js",
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
      "js/content/algo/boss-algo-p2-x.js",
      "js/content/algo/boss-algo-p3-x.js",
      "js/content/algo/boss-algo-p4-x.js",
      "js/content/algo/boss-algo-p5-x.js",
      "js/content/algo/boss-algo-p6-x.js",
      "js/content/algo/boss-algo-p7-x.js",
      "js/content/algo/boss-algo-p8-x.js",
      "js/content/algo/boss-algo-p9-x.js",
    ],
  };

  const state = {},
    subs = [];

  const requested = new Map(); // file → promise, so a file listed in two groups loads once

  /** Insert one file once. Scripts use async=false: they download in parallel but run in the order they were inserted.
      Stylesheets go before the course-styles marker in <head>, which keeps the cascade order the page was written in. */
  function insert(f) {
    return new Promise((ok, bad) => {
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
      node.onerror = () => {
        node.remove(); // a failed tag must not stay in <head>: the retry adds a fresh one
        bad(new Error("failed to load " + f));
      };
      if (css) document.head.insertBefore(node, document.querySelector('meta[name="course-styles"]'));
      else document.head.appendChild(node);
    });
  }
  /** A flaky connection drops a request now and then: try each file up to three times, waiting a little longer each time
      (0.7 s, then 1.6 s), before giving up. The page then shows "Couldn't load" with a Try again button. */
  const RETRY_MS = [700, 1600];
  async function insertWithRetry(f) {
    for (let n = 0; ; n++) {
      try {
        return await insert(f);
      } catch (e) {
        if (n >= RETRY_MS.length) throw e;
        await new Promise((r) => setTimeout(r, RETRY_MS[n]));
      }
    }
  }
  function loadOne(f) {
    if (requested.has(f)) return requested.get(f);
    const p = insertWithRetry(f);
    requested.set(f, p);
    p.catch(() => requested.delete(f)); // a failed file can be tried again by the next load()
    return p;
  }
  /** Over http(s) the scripts of a group are fetched in parallel (each with the retry above) and only then run, in manifest order.
      A retried download therefore can't land after the parts that depend on it. Under file:// fetch is blocked, so tags are used. */
  const texts = new Map(), // file → promise of its source
    ran = new Set();
  const fetchText = (f) => {
    if (!texts.has(f)) {
      const p = (async () => {
        for (let n = 0; ; n++) {
          try {
            const r = await fetch(N.asset(f));
            if (!r.ok) throw new Error("failed to load " + f);
            return await r.text();
          } catch (e) {
            if (n >= RETRY_MS.length) throw e;
            await new Promise((ok) => setTimeout(ok, RETRY_MS[n]));
          }
        }
      })();
      texts.set(f, p);
      p.catch(() => texts.delete(f));
    }
    return texts.get(f);
  };
  async function loadScripts(files) {
    const src = await Promise.all(files.map((f) => (ran.has(f) ? null : fetchText(f))));
    files.forEach((f, i) => {
      if (ran.has(f)) return;
      ran.add(f);
      const node = document.createElement("script");
      node.text = src[i] + "\n//# sourceURL=" + f;
      document.head.appendChild(node);
      node.remove();
      texts.delete(f);
    });
  }
  function loadFiles(files) {
    if (!/^https?:$/.test(location.protocol) || typeof fetch !== "function")
      return Promise.all(files.map(loadOne)).then(() => {});
    const js = files.filter((f) => !f.endsWith(".css"));
    return Promise.all([...files.filter((f) => f.endsWith(".css")).map(loadOne), loadScripts(js)]).then(() => {});
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
