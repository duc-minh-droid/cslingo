/* Algorithms, Phase 3 workshop: 3.W "Corner hunt" (no code). Part 2 of 5: the view.
   cornerView() builds the factory plot, the rule sliders and the readout, and returns the context c that the
   other parts hook into: 3-03 adds the interactions and missions (cornerPlay), 3-04 the rule sliders (cornerRules). */
(function () {
  const partScope = (NIC.shared.algoWorkshops3 = NIC.shared.algoWorkshops3 || {});
  const { SPAN, X, X0, Y, Y0, bestOf, fxOn, legal, lhs, nice, polygon, pt, rules, same, zOf } = partScope;
  const N = NIC,
    { el, qs, qsa } = N;

  function cornerView(stage) {
    const c = { poly: [], best: null, rs: [], lastBest: "" };

    const m = { c2: 2, capOn: false, cap: 4, mode: "plan", P: [1, 1], z: 6, walk: [0, 0], trail: [[0, 0]], moved: 0 };
    const plot = el(`<div class="wk-card"><h3>The factory<span class="wk-sp"></span><span data-seg></span></h3>
      <div class="aw3-lay"><div class="aw3-plotwrap">
        <svg class="aw3-svg aw3-plan" viewBox="0 0 410 392" role="img" aria-label="Feasible region of a two-product factory. Corners are marked.">
          <defs><clipPath id="aw3-clip"><rect x="${X0}" y="4" width="${X(SPAN) - X0 + 2}" height="${Y0 - 4}"/></clipPath>
            <marker id="aw3-arr" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2,2 L10,6 L2,10" fill="none" stroke="var(--rose)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
          <g data-grid></g>
          <polygon class="aw3-poly" data-poly points=""/>
          <g clip-path="url(#aw3-clip)" data-lines></g><g data-labels></g>
          <g clip-path="url(#aw3-clip)"><line class="aw3-obj" data-obj x1="0" y1="0" x2="0" y2="0"/></g>
          <line class="aw3-legal" data-legal x1="0" y1="0" x2="0" y2="0"/>
          <polyline class="aw3-trail" data-trail points=""/>
          <g data-corners></g>
          <g class="aw3-arrow" data-arrow><line x1="0" y1="0" x2="0" y2="0" marker-end="url(#aw3-arr)"/><text x="0" y="0">more profit</text></g>
          <g class="aw3-p" data-p><g class="aw3-pi" data-pi tabindex="0" role="slider" aria-label="Your plan. Drag it, or use the arrow keys."><circle r="20" class="aw3-hit"/><circle r="10"/></g></g>
          <g class="aw3-w" data-w><circle r="10"/></g>
        </svg></div>
        <div class="aw3-side"><div class="aw3-modebar" data-modebar></div><div data-read></div></div></div></div>`);
    const rulesCard = el(
      `<div class="wk-card"><h3>Change the rules</h3><div class="wk-row aw3-rules" data-rules></div><div class="wk-note aw3-note" data-note style="margin-top:10px"></div></div>`,
    );
    stage.append(plot, rulesCard);
    const svg = qs("svg", plot),
      $ = (s) => qs(s, plot),
      note = qs("[data-note]", rulesCard),
      say = (h) => {
        note.innerHTML = h;
      };
    // grid + axes (static)
    $("[data-grid]").innerHTML =
      Array.from(
        { length: SPAN + 1 },
        (_, t) =>
          `<line class="aw3-gl" x1="${X(t)}" y1="${Y(0)}" x2="${X(t)}" y2="${Y(SPAN)}"/><line class="aw3-gl" x1="${X(0)}" y1="${Y(t)}" x2="${X(SPAN)}" y2="${Y(t)}"/><text class="aw3-tk" x="${X(t)}" y="${Y(0) + 16}">${t}</text>${t ? `<text class="aw3-tk aw3-tky" x="${X(0) - 8}" y="${Y(t) + 4}">${t}</text>` : ""}`,
      ).join("") +
      `<text class="aw3-ax" x="${X(SPAN) - 2}" y="${Y(0) + 34}" text-anchor="end">units of X</text><text class="aw3-ax" x="${X(0) + 8}" y="20" text-anchor="start">units of Y</text>`;
    /* ----- controls ----- */
    const seg = N.seg(
      [
        ["plan", "Try plans"],
        ["line", "Slide profit"],
        ["walk", "Walk corners"],
      ],
      "plan",
      (v) => c.setMode(v),
    );
    $("[data-seg]").appendChild(seg);
    const mb = $("[data-modebar]");
    const zSlide = N.slider("Profit z", 0, 36, 0.5, m.z, (v) => "£" + nice(v));
    const zWrap = el(`<div class="aw3-mb" data-for="line"></div>`);
    zWrap.appendChild(zSlide);
    const walkBar = el(
      `<div class="aw3-mb" data-for="walk"><button class="btn small" data-wreset>Back to the origin</button><span class="faint">Tap a neighbouring corner to step to it.</span></div>`,
    );
    const planBar = el(
      `<div class="aw3-mb" data-for="plan"><span class="faint">Drag the dot (or tap the plot). The dashed line holds every plan with the same profit.</span></div>`,
    );
    mb.append(planBar, zWrap, walkBar);
    const cSlide = N.slider("£ per unit of Y (X earns £3)", 0.5, 8, 0.5, m.c2, (v) => "£" + nice(v));
    const capBtn = el(`<button class="btn small" data-cap aria-pressed="false">Add demand cap</button>`);
    const capSlide = N.slider("Cap: at most this many Y", 1, 6, 0.5, m.cap, (v) => "y ≤ " + nice(v));
    capSlide.classList.add("aw3-capsl");
    capSlide.hidden = true;
    qs("[data-rules]", rulesCard).append(cSlide, capBtn, capSlide);
    /* ----- readout (meters are built once per rule set, then updated in place) ----- */
    const read = $("[data-read]");
    function buildRead() {
      read.innerHTML = `<div class="wk-stats aw3-stats"><div class="wk-stat blue" data-s="pos"><small data-lab>Plan</small><b>-</b></div><div class="wk-stat amber" data-s="z"><small>Profit</small><b>-</b></div></div>
        <ul class="aw3-cons">${c.rs.map((r) => `<li data-r="${r.id}" class="aw3-${r.col}"><span class="aw3-nm"><b>${r.t}</b> <code>${r.f} ≤ ${nice(r.lim)}</code></span><span class="aw3-mt"><i></i></span><output>-</output></li>`).join("")}</ul>
        <table class="aw3-corn"><tr><th>Corner</th><th>Profit z</th><th></th></tr>${c.poly.map((p, i) => `<tr data-c="${i}"><td>${pt(p)}</td><td data-z>£${nice(zOf(p, m))}</td><td data-tag></td></tr>`).join("")}</table>`;
    }
    const focus = () =>
      m.mode === "plan"
        ? m.P
        : m.mode === "walk"
          ? m.walk
          : (() => {
              const g = legal(c.poly, m, m.z);
              return g ? [(g.a[0] + g.b[0]) / 2, (g.a[1] + g.b[1]) / 2] : null;
            })();
    function updateRead() {
      const fp = focus(),
        lab = { plan: "Your plan", walk: "You are at", line: "Middle of the line" }[m.mode];
      qs("[data-lab]", read).textContent = lab;
      qs("[data-s=pos] b", read).textContent = fp ? pt(fp) : "none";
      qs("[data-s=z] b", read).textContent = fp
        ? "£" + nice(zOf(fp, m))
        : m.mode === "line"
          ? "£" + nice(m.z) + ", unreachable"
          : "-";
      c.rs.forEach((r) => {
        const li = qs(`[data-r="${r.id}"]`, read);
        if (!li) return;
        const i = qs("i", li),
          o = qs("output", li);
        if (!fp) {
          i.style.transform = "scaleX(0)";
          o.textContent = "no plan";
          li.className = `aw3-${r.col}`;
          return;
        }
        const v = lhs(r, fp),
          over = v > r.lim + 1e-6,
          tight = !over && Math.abs(v - r.lim) < 1e-6;
        i.style.transform = `scaleX(${Math.max(0, Math.min(1, v / r.lim)).toFixed(3)})`;
        o.textContent = over
          ? `${nice(v)} of ${nice(r.lim)}: over!`
          : tight
            ? `${nice(v)} of ${nice(r.lim)}: binding`
            : `${nice(v)} of ${nice(r.lim)}`;
        li.className = `aw3-${r.col}${over ? " over" : tight ? " tight" : ""}`;
      });
      qsa("tr[data-c]", read).forEach((tr) => {
        const i = +tr.dataset.c,
          isBest = c.best.idx.includes(i),
          here = m.mode === "walk" && same(c.poly[i], m.walk);
        tr.classList.toggle("best", isBest);
        tr.classList.toggle("here", here);
        qs("[data-tag]", tr).textContent =
          (isBest ? (c.best.idx.length > 1 ? "tie: best" : "best") : "") + (here ? (isBest ? "" : " you") : "");
      });
    }
    /* ----- drawing ----- */
    function lineEnds(Q) {
      // profit line through Q with direction (c, -3), as svg px
      const D = [m.c2, -3],
        t = 30;
      return [X(Q[0] - t * D[0]), Y(Q[1] - t * D[1]), X(Q[0] + t * D[0]), Y(Q[1] + t * D[1])];
    }
    function buildGeometry(flash) {
      c.rs = rules(m);
      c.poly = polygon(c.rs);
      c.best = bestOf(c.poly, m);
      $("[data-poly]").setAttribute("points", c.poly.map((p) => `${X(p[0])},${Y(p[1])}`).join(" "));
      $("[data-lines]").innerHTML = c.rs
        .map((r) => {
          const y1 = (r.lim - r.a * 0) / r.b,
            y2 = (r.lim - r.a * SPAN) / r.b;
          return `<line class="aw3-cl aw3-${r.col}" data-l="${r.id}" x1="${X(0)}" y1="${Y(y1)}" x2="${X(SPAN)}" y2="${Y(y2)}"/>`;
        })
        .join("");
      const lab = { c1: [0.9, 5.6], c2: [SPAN - 0.05, 0.35], cap: [SPAN - 0.05, m.cap - 0.45] };
      $("[data-labels]").innerHTML = c.rs
        .map((r) => {
          const [lx, ly] = lab[r.id];
          return `<text class="aw3-lb aw3-${r.col}" x="${X(lx)}" y="${Y(ly)}" text-anchor="${r.id === "c1" ? "start" : "end"}">${r.t.toLowerCase()}</text>`;
        })
        .join("");
      $("[data-corners]").innerHTML = c.poly
        .map(
          (p, i) =>
            `<g class="aw3-cn" data-i="${i}" tabindex="0" role="button" aria-label="Corner ${pt(p)}"><circle class="aw3-hit" cx="${X(p[0])}" cy="${Y(p[1])}" r="17"/><circle class="aw3-dot" cx="${X(p[0])}" cy="${Y(p[1])}" r="7"/><text x="${X(p[0]) + (p[0] > 4.4 ? -10 : 10)}" y="${Y(p[1]) - 10}" text-anchor="${p[0] > 4.4 ? "end" : "start"}">${pt(p)}</text></g>`,
        )
        .join("");
      qsa("[data-i]", plot).forEach((g) => {
        g.onclick = () => c.tapCorner(+g.dataset.i);
        g.onkeydown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            c.tapCorner(+g.dataset.i);
          }
        };
      });
      const a = [5.4, 5.3],
        D = [3, m.c2],
        len = Math.hypot(D[0], D[1]),
        e = [a[0] + (D[0] / len) * 1.1, a[1] + (D[1] / len) * 1.1],
        ar = $("[data-arrow]");
      const al = qs("line", ar);
      al.setAttribute("x1", X(a[0]));
      al.setAttribute("y1", Y(a[1]));
      al.setAttribute("x2", X(e[0]));
      al.setAttribute("y2", Y(e[1]));
      const at = qs("text", ar);
      at.setAttribute("x", X(a[0]) - 30);
      at.setAttribute("y", Y(a[1]) + 20);
      // the walker needs a corner that still exists
      if (!c.poly.some((p) => same(p, m.walk))) {
        m.walk = [0, 0];
        m.trail = [[0, 0]];
        m.moved = 0;
      }
      m.trail = m.trail.filter((p) => c.poly.some((q) => same(p, q)));
      buildRead();
      if (flash && fxOn())
        $("[data-poly]").animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 240, easing: "ease-out" });
    }
    function paint() {
      const fp = m.mode === "line" ? [m.z / 3, 0] : m.mode === "plan" ? m.P : m.walk;
      const e = lineEnds(fp),
        ob = $("[data-obj]");
      ob.setAttribute("x1", e[0]);
      ob.setAttribute("y1", e[1]);
      ob.setAttribute("x2", e[2]);
      ob.setAttribute("y2", e[3]);
      const lg = $("[data-legal]"),
        seg_ = m.mode === "line" ? legal(c.poly, m, m.z) : null;
      lg.style.display = seg_ ? "" : "none";
      if (seg_) {
        lg.setAttribute("x1", X(seg_.a[0]));
        lg.setAttribute("y1", Y(seg_.a[1]));
        lg.setAttribute("x2", X(seg_.b[0]));
        lg.setAttribute("y2", Y(seg_.b[1]));
      }
      const P = $("[data-p]"),
        W = $("[data-w]");
      P.style.transform = `translate(${X(m.P[0])}px,${Y(m.P[1])}px)`;
      P.style.display = m.mode === "plan" ? "" : "none";
      W.style.transform = `translate(${X(m.walk[0])}px,${Y(m.walk[1])}px)`;
      W.style.display = m.mode === "walk" ? "" : "none";
      W.classList.toggle(
        "opt",
        c.best.idx.some((i) => same(c.poly[i], m.walk)),
      );
      const tr = $("[data-trail]");
      tr.style.display = m.mode === "walk" ? "" : "none";
      tr.setAttribute("points", m.trail.map((p) => `${X(p[0])},${Y(p[1])}`).join(" "));
      const feas = c.rs.every((r) => lhs(r, m.P) <= r.lim + 1e-6);
      P.classList.toggle("bad", !feas);
      qsa("[data-l]", plot).forEach((l) => {
        const r = c.rs.find((q) => q.id === l.dataset.l);
        l.classList.toggle("viol", m.mode === "plan" && lhs(r, m.P) > r.lim + 1e-6);
      });
      qsa("[data-i]", plot).forEach((g) => {
        const i = +g.dataset.i;
        g.classList.toggle("best", c.best.idx.includes(i) && (m.mode !== "walk" || true));
        g.classList.toggle("here", m.mode === "walk" && same(c.poly[i], m.walk));
      });
      svg.classList.toggle("aw3-plan", m.mode === "plan");
      svg.classList.toggle("aw3-walkm", m.mode === "walk");
      zWrap.hidden = m.mode !== "line";
      walkBar.hidden = m.mode !== "walk";
      planBar.hidden = m.mode !== "plan";
      updateRead();
    }
    Object.assign(c, { $, buildGeometry, cSlide, capBtn, capSlide, m, paint, plot, read, say, svg, zSlide });
    return c;
  }
  Object.assign(partScope, { cornerView });
})();
