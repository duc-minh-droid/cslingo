/* Glossary page (#glossary, #glossary/<entry id>): one entry per term or concept, A to Z. An entry is a short description and the
   lesson's own animation, nothing else. Nothing is redrawn here: the animation is mounted through the same calls the player uses
   (module.render(page, life) for a lesson's live demo, step.v(host, life) for a step's figure).
   Entries:  term     a glossary.js term (one-sentence definition). Its animation is the live demo of the lesson in DEMO, else the
                      figure of the lesson step that names it best.
             concept  a lesson no term covers (its blurb + its live demo)
   Only one entry is open at a time; closing it disposes its lifecycle (timers, loops, listeners). */
(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { IC, SUBJECTS, SUBJ_ORDER, kindOf, main, subjOf } = app;
  const N = NIC,
    { el, esc, qs, qsa } = N;
  const COLOUR = { nic: "teal", ds: "blue", algo: "violet" };

  /** Terms whose animation is a lesson's live demo (the algorithm running), term name -> lesson id. */
  const DEMO = {
    "A*": "a2-astar",
    Dijkstra: "a2-dijkstra",
    Admissible: "a2-admissible",
    "Link state": "a2-linkstate",
    "Distance vector": "a2-bellman",
    "Poisoned reverse": "a2-routing",
    PageRank: "a1-pagerank",
    "Markov chain": "a1-surfer",
    "Damping factor": "a1-surfer",
    "Big O": "a1-bigo",
    Prim: "a4-prim",
    Kruskal: "a4-kruskal",
    "Minimum spanning tree": "a4-mst",
    "Cut property": "a4-cut",
    "Cycle property": "a4-cut",
    "Graham scan": "a5-graham",
    "Convex hull": "a5-convex",
    Orientation: "a5-orient",
    Huffman: "a7-huffman",
    "Prefix code": "a7-source-coding",
    LZW: "a7-lzw",
    Entropy: "a7-entropy",
    DFT: "a9-dft",
    FFT: "a9-fft",
    Nyquist: "a9-leak",
    "Frequency bin": "a9-dft",
    Simplex: "a3-simplex",
    Slack: "a3-slack",
    Tableau: "a3-slack",
    "Feasible region": "a3-lp",
    "Linear programming": "a3-lp",
    "Golden section": "a3-bracket",
    Unimodal: "a3-bracket",
    "Nelder Mead": "a3-nm",
    Parity: "a6-parity",
    CRC: "a6-crc",
    "Hamming code": "a6-hamming",
    Syndrome: "a6-hamming",
    Attention: "a10-attn",
    Softmax: "a10-softmax",
    "Causal mask": "a10-decoder",
    "Hash function": "a8-hash",
    Avalanche: "a8-hash",
    Collision: "a8-hash",
    "Hill climb": "l3-hc",
    "Local optimum": "l3-hc",
    "Tabu search": "l3-local",
    "Monte Carlo": "l3-local",
    "Fitness landscape": "l3-landscape",
    Neighbourhood: "l3-neighbourhood",
    "Travelling salesman": "l3-tsp",
    "Roulette wheel": "l4-roulette",
    "Rank selection": "l4-rank",
    Tournament: "l4-tournament",
    Mutation: "l4-mutation",
    Crossover: "l4-crossover",
    "One-point crossover": "l4-crossover",
    "Uniform crossover": "l4-crossover",
    "Selection pressure": "l4-pressure",
    "Steady state": "l4-types",
    Elitism: "l4-replacement",
    "Genetic algorithm": "l4-lab",
    "Ant colony": "l8-loop",
    Swarm: "l7-swarm",
    Replication: "ds4-leader",
    Partitioning: "ds5-why",
    "Hash index": "ds-hashidx",
    SSTable: "ds-sstable",
    Memtable: "ds-sstable",
    Compaction: "ds-hashidx",
    Failover: "ds4-failover",
    Quorum: "ds6-consensus",
    "CAP theorem": "ds6-fail",
    Latency: "ds-load",
    "Tail latency": "ds-load",
    Percentile: "ds-load",
  };

  const dec = document.createElement("textarea");
  /** Markup to plain text (entities decoded), for names, search and matching. */
  const plain = (h) => {
    dec.innerHTML = String(h || "").replace(/<[^>]*>/g, " ");
    return dec.value.replace(/\s+/g, " ").trim();
  };
  const slug = (t) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // ---- the index: built once per page load, after every course has loaded ----
  let INDEX = null;
  function build() {
    if (INDEX) return INDEX;
    const docs = N.modules
      .filter((m) => kindOf(m) === "lesson")
      .map((m) => {
        const L = N.LESSONS[m.id] || { steps: [] };
        return {
          m,
          L,
          title: plain(m.title),
          steps: L.steps.map((s, k) => ({ k, t: plain(s.t), b: plain(s.b), v: !!s.v })),
        };
      });
    const byMod = new Map(docs.map((d) => [d.m.id, d]));
    /** The step whose title (or text) names the term and has a figure: the earliest lesson wins ties. */
    const stepFor = (re) => {
      let best = null;
      for (const d of docs) {
        const inTitle = re.exec(d.title);
        for (const st of d.steps) {
          let score = re.test(st.t) ? 4 : re.test(st.b) ? 1 : 0;
          if (!score || !st.v) continue; // only a step with a figure is an animation
          score += inTitle ? (inTitle.index === 0 ? 7 : 3) : 0;
          if (!best || score > best.score) best = { score, d, k: st.k };
        }
      }
      return best;
    };
    const used = new Set();
    const uid = (base) => {
      let id = base,
        n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      return id;
    };
    const covered = new Set(); // lessons a term already shows
    const terms = N.glossary.terms.map((t) => {
      const d = byMod.get(DEMO[t.name]);
      let anim = null;
      if (d) {
        anim = { demo: d };
        covered.add(d.m.id);
      } else {
        const s = stepFor(t.re);
        if (s) anim = { step: s.k, d: s.d };
      }
      return {
        id: uid(`t-${slug(t.name)}`),
        name: t.name,
        def: t.tip,
        anim,
        course: anim ? subjOf((anim.demo || anim.d).m) : null,
        re: new RegExp(`(?<![A-Za-z0-9])${reEsc(t.name)}(?![A-Za-z0-9])`, "i"),
      };
    });
    // a lesson no term covers is a concept of its own; one whose title names a term is that term's lesson, not a second entry
    const concepts = docs
      .filter((d) => !covered.has(d.m.id) && !terms.some((t) => t.re.test(d.title)))
      .map((d) => ({
        id: `m-${d.m.id}`,
        name: d.title,
        def: plain(d.m.blurb || d.L.sum || (d.steps[0] && d.steps[0].b) || ""),
        anim: { demo: d },
        course: subjOf(d.m),
      }));
    const all = terms.concat(concepts);
    all.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
    all.forEach((e) => (e.key = `${e.name} ${e.def}`.toLowerCase()));
    INDEX = { all, byId: new Map(all.map((e) => [e.id, e])) };
    return INDEX;
  }

  // ---- mounting a lesson's own animation ----
  /** A step's figure, exactly as the player draws it (HTML, or a function that fills the host and may register cleanups). */
  function mountFigure(host, s, life) {
    if (typeof s.v === "function") {
      try {
        s.v(host, life);
      } catch (e) {
        console.error(e);
      }
    } else if (s.v) host.innerHTML = s.v;
    if (N.fx && N.fx.play) N.fx.play(host);
  }
  /** A lesson's live demo: the module renders into a page, minus the parts the player lifts out (header, predicts, takeaways). */
  function mountDemo(host, m, life) {
    const page = el(`<div class="page pl-demo gl-demo-page"></div>`);
    host.appendChild(page);
    try {
      m.render.call(m, page, life);
    } catch (e) {
      console.error("[glossary] demo failed", m.id, e);
      page.innerHTML = `<div class="callout rose">This demo failed to load: ${esc(e.message)}</div>`;
    }
    qsa("header, .predict, .takeaways", page).forEach((n) => n.remove());
    if (N.fx && N.fx.play) N.fx.play(page);
  }

  const chip = (e) =>
    e.course ? `<i class="gl-course gl-${COLOUR[e.course]}">${esc(SUBJECTS[e.course].name)}</i>` : "";

  // ---- the page ----
  function glossaryPage(openId) {
    const { all, byId } = build();
    const page = el(`<div class="page side-page gl-page">
      <h1>Glossary</h1>
      <p class="gl-sub">Every term and concept in the app, with the animation that shows how it works.</p>
      <div class="gl-tools">
        <label class="sr-only" for="gl-q">Search the glossary</label>
        <input id="gl-q" class="gl-q" type="search" placeholder="Search terms and concepts" autocomplete="off" spellcheck="false">
        <div class="seg gl-seg" role="group" aria-label="Course">${[["all", "All"]]
          .concat(SUBJ_ORDER.map((k) => [k, SUBJECTS[k].name]))
          .map(
            ([k, t], i) =>
              `<button data-c="${k}" aria-pressed="${i === 0}" class="${i === 0 ? "on" : ""}">${esc(t)}</button>`,
          )
          .join("")}</div>
      </div>
      <p class="gl-count" role="status" aria-live="polite"></p>
      <div class="gl-list"></div></div>`);
    main.appendChild(page);
    const list = qs(".gl-list", page),
      count = qs(".gl-count", page),
      input = qs(".gl-q", page);
    let course = "all",
      cur = null,
      timer = 0;

    function closeCur() {
      if (!cur) return;
      cur.life.dispose();
      cur.item.classList.remove("open");
      qs(".gl-head", cur.item).setAttribute("aria-expanded", "false");
      const p = qs(".gl-panel", cur.item);
      p.hidden = true;
      p.innerHTML = "";
      cur = null;
    }
    function openItem(item, scroll) {
      const e = byId.get(item.dataset.id);
      if (!e) return;
      closeCur();
      const life = N.lifecycle(),
        panel = qs(".gl-panel", item);
      cur = { item, life };
      item.classList.add("open");
      qs(".gl-head", item).setAttribute("aria-expanded", "true");
      panel.hidden = false;
      panel.innerHTML = `<p class="gl-def">${esc(e.def)}</p>${e.anim ? `<div class="gl-anim-host lesson-visual"></div>` : ""}`;
      if (e.anim) {
        const host = qs(".gl-anim-host", panel);
        if (e.anim.demo) mountDemo(host, e.anim.demo.m, life);
        else mountFigure(host, N.LESSONS[e.anim.d.m.id].steps[e.anim.step], life);
      }
      history.replaceState(null, "", `#glossary/${e.id}`);
      if (scroll) item.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    function paint() {
      const words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      closeCur();
      const rows = all.filter(
        (e) => (course === "all" || e.course === course) && words.every((w) => e.key.includes(w)),
      );
      let html = "",
        letter = "";
      for (const e of rows) {
        const l = /^[a-z]/i.test(e.name) ? e.name[0].toUpperCase() : "#";
        if (l !== letter) {
          html += `${letter ? "</div>" : ""}<div class="gl-group"><h2 class="gl-letter" id="gl-l-${l}">${l}</h2>`;
          letter = l;
        }
        html += `<section class="gl-item" data-id="${e.id}" id="gl-${e.id}">
          <button class="gl-head" aria-expanded="false" aria-controls="glp-${e.id}">
            <span class="gl-main"><span class="gl-name">${esc(e.name)}</span><span class="gl-short">${esc(e.def.length > 140 ? e.def.slice(0, 137) + "…" : e.def)}</span></span>
            <span class="gl-tags">${chip(e)}${e.anim ? `<i class="gl-anim" title="Has an animation">▶</i>` : ""}</span>
            <span class="gl-car" aria-hidden="true"></span></button>
          <div class="gl-panel" id="glp-${e.id}" hidden></div></section>`;
      }
      list.innerHTML = rows.length
        ? `${html}</div>`
        : `<div class="card gl-none">Nothing matches “${esc(input.value.trim())}”. Try a shorter word.</div>`;
      count.textContent = `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`;
    }

    list.addEventListener("click", (ev) => {
      const h = ev.target.closest(".gl-head");
      if (!h) return;
      const item = h.parentElement;
      if (item.classList.contains("open")) {
        closeCur();
        history.replaceState(null, "", "#glossary");
      } else openItem(item, false);
    });
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(paint, 90);
    });
    qs(".gl-seg", page).addEventListener("click", (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      course = b.dataset.c;
      qsa(".gl-seg button", page).forEach((x) => {
        x.classList.toggle("on", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      paint();
    });
    paint();
    app.life.onCleanup(() => {
      clearTimeout(timer);
      closeCur();
    });
    if (openId && byId.has(openId)) {
      const item = qs(`#gl-${CSS.escape(openId)}`, list);
      if (item) setTimeout(() => openItem(item, true), 60);
    }
  }
  Object.assign(app, { glossaryPage, glossaryIcon: IC.book });
})();
