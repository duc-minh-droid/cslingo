/* Glossary page (#glossary, #glossary/<entry id>): every term and every lesson concept in the app, A to Z.
   Nothing is redrawn here: an entry mounts the lesson's own figure or live demo through the same calls the player uses
   (step.v(host, life) / module.render(page, life)), so the animation is exactly the one from the lesson.
   Entries:  term     a glossary.js term (one-sentence definition) + the lesson step that teaches it best
             concept  a lesson (its Try-it demo) + every step of it, each with its figure
   Only one entry is open at a time; closing it disposes its lifecycle (timers, loops, listeners). */
(function () {
  const app = (NIC.shared.engineApp = NIC.shared.engineApp || {});
  const { IC, SUBJECTS, SUBJ_ORDER, kindOf, main, numLabel, subjOf } = app;
  const N = NIC,
    { el, esc, qs, qsa } = N;
  const COLOUR = { nic: "teal", ds: "blue", algo: "violet" };

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
    /** The step that teaches a term best: a step title naming it beats a body mention, a figure and a lesson that is about the term
        (its title starts with it, or contains it) add to the score; the earliest lesson wins ties. */
    const bestIn = (d, re) => {
      let best = null;
      d.steps.forEach((st) => {
        let score = re.test(st.t) ? 4 : re.test(st.b) ? 1 : 0;
        if (!score) return;
        if (st.v) score += 2;
        if (!best || score > best.score) best = { score, d, k: st.k };
      });
      return best;
    };
    const source = (re) => {
      let best = null;
      for (const d of docs) {
        const hit = bestIn(d, re);
        if (!hit) continue;
        const m = re.exec(d.title);
        hit.score += m ? (m.index === 0 ? 7 : 3) : 0;
        if (!best || hit.score > best.score) best = hit;
      }
      return best;
    };
    /** Terms whose best lesson the scoring cannot know: the lesson that is about them. */
    const ABOUT = {
      Dijkstra: "a2-dijkstra",
      "Fitness landscape": "l3-landscape",
      "Minimum spanning tree": "a4-intro",
      "Cut property": "a4-cut",
      "Hash function": "a8-hash",
      Entropy: "a7-entropy",
      "Ant colony": "l8-loop",
      "Travelling salesman": "l3-tsp",
      "Hill climb": "l3-hc",
      "Local optimum": "l3-hc",
      Latency: "ds-load",
      "Tail latency": "ds-load",
      Percentile: "ds-load",
      Replication: "ds4-leader",
      Partitioning: "ds5-why",
      PageRank: "a1-pagerank",
      Simplex: "a3-simplex",
      "Big O": "a1-bigo",
      "Hash index": "ds-hashidx",
    };
    const sourceOf = (t) => {
      const d = ABOUT[t.name] && docs.find((x) => x.m.id === ABOUT[t.name]);
      return (d && (bestIn(d, t.re) || { d, k: 0 })) || source(t.re);
    };
    const used = new Set();
    const uid = (base) => {
      let id = base,
        n = 2;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      return id;
    };
    const terms = N.glossary.terms.map((t) => {
      const src = sourceOf(t);
      return {
        id: uid(`t-${slug(t.name)}`),
        kind: "term",
        name: t.name,
        def: t.tip,
        src,
        course: src ? subjOf(src.d.m) : null,
        anim: !!(src && src.d.steps[src.k].v),
      };
    });
    const concepts = docs.map((d) => ({
      id: `m-${d.m.id}`,
      kind: "concept",
      name: d.title,
      def: plain(d.m.blurb || d.L.sum || (d.steps[0] && d.steps[0].b) || ""),
      d,
      course: subjOf(d.m),
      anim: true,
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
  /** A lesson's live Try-it demo: the module renders into a page, minus the parts the player lifts out (header, predicts, takeaways). */
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
  const where = (m) => `${esc(SUBJECTS[subjOf(m)].name)} · ${esc(numLabel(m))}`;

  function panelHTML(e) {
    if (e.kind === "term") {
      const src = e.src,
        s = src && N.LESSONS[src.d.m.id].steps[src.k];
      return `<p class="gl-def">${esc(e.def)}</p>${
        s
          ? `<div class="gl-from">From <b>${where(src.d.m)} ${esc(src.d.title)}</b>, step ${src.k + 1}: ${esc(src.d.steps[src.k].t)}</div>
             <div class="lesson-body gl-body">${s.b || ""}</div><div class="lesson-visual gl-vis"></div>
             <div class="gl-actions"><a class="btn small primary" href="#${src.d.m.id}">Open the lesson</a></div>`
          : `<p class="faint">No lesson animation for this one yet.</p>`
      }`;
    }
    const m = e.d.m;
    return `<p class="gl-def">${esc(e.def)}</p>
      <div class="gl-from"><b>${where(m)}</b> · live demo from the lesson</div>
      <div class="gl-demo"></div>
      ${
        e.d.steps.length
          ? `<h3 class="gl-h3">Steps in this lesson</h3><div class="gl-steps">${e.d.steps
              .map(
                (st) =>
                  `<div class="gl-step"><button class="gl-step-h" aria-expanded="false" data-k="${st.k}"><span class="gl-step-n">${st.k + 1}</span><span>${esc(st.t)}</span>${st.v ? `<i class="gl-anim" title="Has an animation">▶</i>` : ""}</button><div class="gl-step-p" hidden></div></div>`,
              )
              .join("")}</div>`
          : ""
      }
      <div class="gl-actions"><a class="btn small primary" href="#${m.id}">Open the lesson</a></div>`;
  }

  // ---- the page ----
  function glossaryPage(openId) {
    const { all, byId } = build();
    const page = el(`<div class="page side-page gl-page">
      <h1>Glossary</h1>
      <p class="gl-sub">Every term and concept in the app. Open one to watch the same animation the lesson uses.</p>
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
      panel.innerHTML = panelHTML(e);
      if (e.kind === "term") {
        const s = e.src && N.LESSONS[e.src.d.m.id].steps[e.src.k];
        if (s) mountFigure(qs(".gl-vis", panel), s, life);
      } else mountDemo(qs(".gl-demo", panel), e.d.m, life);
      if (N.fx && N.fx.reveal && !document.documentElement.classList.contains("reduce")) N.fx.reveal(panel);
      history.replaceState(null, "", `#glossary/${e.id}`);
      if (scroll) item.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    function paint() {
      const q = input.value.trim().toLowerCase(),
        words = q.split(/\s+/).filter(Boolean);
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
            <span class="gl-tags">${chip(e)}<i class="gl-kind">${e.kind === "term" ? "Term" : "Lesson"}</i>${e.anim ? `<i class="gl-anim" title="Has an animation">▶</i>` : ""}</span>
            <span class="gl-car" aria-hidden="true"></span></button>
          <div class="gl-panel" id="glp-${e.id}" hidden></div></section>`;
      }
      list.innerHTML = rows.length
        ? `${html}</div>`
        : `<div class="card gl-none">Nothing matches “${esc(input.value.trim())}”. Try a shorter word.</div>`;
      count.textContent = `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`;
    }

    list.addEventListener("click", (ev) => {
      const sh = ev.target.closest(".gl-step-h");
      if (sh) return toggleStep(sh);
      const h = ev.target.closest(".gl-head");
      if (!h) return;
      const item = h.parentElement;
      if (item.classList.contains("open")) {
        closeCur();
        history.replaceState(null, "", "#glossary");
      } else openItem(item, false);
    });
    function toggleStep(btn) {
      const item = btn.closest(".gl-item"),
        e = byId.get(item.dataset.id),
        p = btn.nextElementSibling,
        open = btn.getAttribute("aria-expanded") === "true";
      if (open) {
        btn.setAttribute("aria-expanded", "false");
        p.hidden = true;
        if (p.__life) p.__life.dispose();
        p.__life = null;
        p.innerHTML = "";
        return;
      }
      const s = N.LESSONS[e.d.m.id].steps[+btn.dataset.k],
        life = N.lifecycle();
      cur.life.onCleanup(() => life.dispose());
      p.__life = life;
      btn.setAttribute("aria-expanded", "true");
      p.hidden = false;
      p.innerHTML = `<div class="lesson-body gl-body">${s.b || ""}</div><div class="lesson-visual gl-vis"></div>`;
      mountFigure(qs(".gl-vis", p), s, life);
    }
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
