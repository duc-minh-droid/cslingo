(function () {
  const partScope = (NIC.shared.algoWorkshops3 = NIC.shared.algoWorkshops3 || {});
  const { X, Y, bestOf, fxOn, legal, lhs, nice, polygon, pt, rules, same, snd, zOf } = partScope;
  const N = NIC,
    { el, qs, qsa } = N;
  const SPAN = 7,
    X0 = 40,
    Y0 = 355,
    U = 50;

  function cornerHunt(stage, api, life) {
    const m = { c2: 2, capOn: false, cap: 4, mode: "plan", P: [1, 1], z: 6, walk: [0, 0], trail: [[0, 0]], moved: 0 };
    const flags = { feas: false, infeas: false };
    let poly = [],
      best = null,
      rs = [];

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
      (v) => setMode(v),
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
        <ul class="aw3-cons">${rs.map((r) => `<li data-r="${r.id}" class="aw3-${r.col}"><span class="aw3-nm"><b>${r.t}</b> <code>${r.f} ≤ ${nice(r.lim)}</code></span><span class="aw3-mt"><i></i></span><output>-</output></li>`).join("")}</ul>
        <table class="aw3-corn"><tr><th>Corner</th><th>Profit z</th><th></th></tr>${poly.map((p, i) => `<tr data-c="${i}"><td>${pt(p)}</td><td data-z>£${nice(zOf(p, m))}</td><td data-tag></td></tr>`).join("")}</table>`;
    }
    const focus = () =>
      m.mode === "plan"
        ? m.P
        : m.mode === "walk"
          ? m.walk
          : (() => {
              const g = legal(poly, m, m.z);
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
      rs.forEach((r) => {
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
          isBest = best.idx.includes(i),
          here = m.mode === "walk" && same(poly[i], m.walk);
        tr.classList.toggle("best", isBest);
        tr.classList.toggle("here", here);
        qs("[data-tag]", tr).textContent =
          (isBest ? (best.idx.length > 1 ? "tie: best" : "best") : "") + (here ? (isBest ? "" : " you") : "");
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
      rs = rules(m);
      poly = polygon(rs);
      best = bestOf(poly, m);
      $("[data-poly]").setAttribute("points", poly.map((p) => `${X(p[0])},${Y(p[1])}`).join(" "));
      $("[data-lines]").innerHTML = rs
        .map((r) => {
          const y1 = (r.lim - r.a * 0) / r.b,
            y2 = (r.lim - r.a * SPAN) / r.b;
          return `<line class="aw3-cl aw3-${r.col}" data-l="${r.id}" x1="${X(0)}" y1="${Y(y1)}" x2="${X(SPAN)}" y2="${Y(y2)}"/>`;
        })
        .join("");
      const lab = { c1: [0.9, 5.6], c2: [SPAN - 0.05, 0.35], cap: [SPAN - 0.05, m.cap - 0.45] };
      $("[data-labels]").innerHTML = rs
        .map((r) => {
          const [lx, ly] = lab[r.id];
          return `<text class="aw3-lb aw3-${r.col}" x="${X(lx)}" y="${Y(ly)}" text-anchor="${r.id === "c1" ? "start" : "end"}">${r.t.toLowerCase()}</text>`;
        })
        .join("");
      $("[data-corners]").innerHTML = poly
        .map(
          (p, i) =>
            `<g class="aw3-cn" data-i="${i}" tabindex="0" role="button" aria-label="Corner ${pt(p)}"><circle class="aw3-hit" cx="${X(p[0])}" cy="${Y(p[1])}" r="17"/><circle class="aw3-dot" cx="${X(p[0])}" cy="${Y(p[1])}" r="7"/><text x="${X(p[0]) + (p[0] > 4.4 ? -10 : 10)}" y="${Y(p[1]) - 10}" text-anchor="${p[0] > 4.4 ? "end" : "start"}">${pt(p)}</text></g>`,
        )
        .join("");
      qsa("[data-i]", plot).forEach((g) => {
        g.onclick = () => tapCorner(+g.dataset.i);
        g.onkeydown = (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            tapCorner(+g.dataset.i);
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
      if (!poly.some((p) => same(p, m.walk))) {
        m.walk = [0, 0];
        m.trail = [[0, 0]];
        m.moved = 0;
      }
      m.trail = m.trail.filter((p) => poly.some((q) => same(p, q)));
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
        seg_ = m.mode === "line" ? legal(poly, m, m.z) : null;
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
        best.idx.some((i) => same(poly[i], m.walk)),
      );
      const tr = $("[data-trail]");
      tr.style.display = m.mode === "walk" ? "" : "none";
      tr.setAttribute("points", m.trail.map((p) => `${X(p[0])},${Y(p[1])}`).join(" "));
      const feas = rs.every((r) => lhs(r, m.P) <= r.lim + 1e-6);
      P.classList.toggle("bad", !feas);
      qsa("[data-l]", plot).forEach((l) => {
        const r = rs.find((q) => q.id === l.dataset.l);
        l.classList.toggle("viol", m.mode === "plan" && lhs(r, m.P) > r.lim + 1e-6);
      });
      qsa("[data-i]", plot).forEach((g) => {
        const i = +g.dataset.i;
        g.classList.toggle("best", best.idx.includes(i) && (m.mode !== "walk" || true));
        g.classList.toggle("here", m.mode === "walk" && same(poly[i], m.walk));
      });
      svg.classList.toggle("aw3-plan", m.mode === "plan");
      svg.classList.toggle("aw3-walkm", m.mode === "walk");
      zWrap.hidden = m.mode !== "line";
      walkBar.hidden = m.mode !== "walk";
      planBar.hidden = m.mode !== "plan";
      updateRead();
    }

    /* ----- missions ----- */
    const noCapBest = () => {
      const p = polygon(rules({ ...m, capOn: false }));
      return { p, b: bestOf(p, m) };
    };
    function check() {
      if (flags.feas && flags.infeas) api.done("plan");
      if (m.mode === "line") {
        const gap = best.z - m.z;
        if (gap >= -1e-7 && gap < 0.26) api.done("slide");
      }
      if (m.moved && best.idx.some((i) => same(poly[i], m.walk))) api.done("walk");
      const nb = noCapBest();
      if (!m.capOn && best.idx.length === 1 && !same(poly[best.idx[0]], [4, 3]) && nb.b.idx.length === 1)
        api.done("jump");
      if (m.capOn && best.idx.length >= 1) {
        const bp = poly[best.idx[0]],
          base = nb.p[nb.b.idx[0]];
        if (Math.abs(bp[1] - m.cap) < 1e-6 && !same(bp, base) && !same(bp, [4, 3])) api.done("cap");
      }
    }

    /* ----- interactions ----- */
    function setMode(v) {
      m.mode = v;
      paint();
      api.say(
        {
          plan: "Drag the dot around. Green is legal; outside it, a rule is broken and its line turns red.",
          line: "Slide the profit up. Every plan on the line earns the same. Where does it stop being possible?",
          walk: "You start at the origin. Step to a neighbouring corner only if it <b>earns more</b>.",
        }[v],
        "idle",
      );
      check();
    }
    // plan mode: drag
    let drag = false;
    const toData = (e) => {
      const p = svg.createSVGPoint();
      p.x = e.clientX;
      p.y = e.clientY;
      const q = p.matrixTransform(svg.getScreenCTM().inverse());
      return [Math.max(0, Math.min(SPAN - 0.05, (q.x - X0) / U)), Math.max(0, Math.min(SPAN - 0.05, (Y0 - q.y) / U))];
    };
    const snapP = (p) => [Math.round(p[0] * 20) / 20, Math.round(p[1] * 20) / 20];
    svg.addEventListener("pointerdown", (e) => {
      if (m.mode !== "plan") return;
      drag = true;
      try {
        svg.setPointerCapture(e.pointerId);
      } catch (x) {
        /* ignore */
      }
      m.P = snapP(toData(e));
      paint();
      e.preventDefault();
    });
    svg.addEventListener("pointermove", (e) => {
      if (!drag) return;
      m.P = snapP(toData(e));
      paint();
    });
    const release = () => {
      if (!drag) return;
      drag = false;
      judgePlan();
    };
    svg.addEventListener("pointerup", release);
    svg.addEventListener("pointercancel", release);
    $("[data-pi]").addEventListener("keydown", (e) => {
      const d = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, 0.25], ArrowDown: [0, -0.25] }[e.key];
      if (!d) return;
      e.preventDefault();
      m.P = [Math.max(0, Math.min(SPAN - 0.05, m.P[0] + d[0])), Math.max(0, Math.min(SPAN - 0.05, m.P[1] + d[1]))];
      paint();
      clearTimeout(judgePlan.t);
      judgePlan.t = setTimeout(judgePlan, 400);
    });
    function judgePlan() {
      const bad = rs.filter((r) => lhs(r, m.P) > r.lim + 1e-6),
        z = zOf(m.P, m);
      if (bad.length) {
        flags.infeas = true;
        snd("wrong");
        if (fxOn()) N.fx.shake($("[data-pi]"));
        const r = bad[0];
        api.say(
          `Illegal plan: <b>${r.t.toLowerCase()}</b> needs ${r.f} = ${nice(lhs(r, m.P))}, but only ${nice(r.lim)} is available${bad.length > 1 ? `. It breaks ${bad.length} rules in all` : ""}. Outside the green area means at least one rule is broken.`,
          "sad",
        );
        say(
          `<b>Not allowed.</b> A plan is legal only if <b>every</b> rule holds at once. ${bad.map((q) => `<b>${q.t}</b>: ${q.f} = ${nice(lhs(q, m.P))} &gt; ${nice(q.lim)}`).join(" · ")}.`,
        );
      } else {
        flags.feas = true;
        snd("select");
        api.say(
          `Legal plan ${pt(m.P)} earning <b>£${nice(z)}</b>. The best corner earns £${nice(best.z)}: can you beat your own plan and stay in the green?`,
          z >= best.z - 1e-7 ? "love" : "happy",
        );
        say(
          `<b>Legal.</b> Every rule has room left or is exactly at its limit. Try to push the dot to a plan that earns more without leaving the green.`,
        );
      }
      check();
    }
    // slide the profit line
    zSlide.onInput((v) => {
      m.z = v;
      paint();
      const g = legal(poly, m, v);
      if (!g) {
        say(
          `<b>No legal plan earns £${nice(v)}.</b> The line has left the green area. The best you can do is <b>£${nice(best.z)}</b>, at the last corner it touched.`,
        );
      } else if (g.len > 0.02) {
        say(
          `Every plan on this line earns <b>£${nice(v)}</b>: from ${pt(g.a)} to ${pt(g.b)}. Slide it further out: there is still room.`,
        );
      } else {
        say(
          `The line touches <b>one corner only</b>, ${pt(g.a)}. Nudge it any further and it leaves the region: <b>£${nice(v)}</b> is the most you can earn.`,
        );
      }
      check();
    });
    zSlide.querySelector("input").addEventListener("change", () => {
      const gap = best.z - m.z;
      if (gap < -1e-7) {
        api.say(
          `Too far: nothing legal earns £${nice(m.z)}. Slide back until the line just touches the green area.`,
          "think",
        );
        snd("wrong");
      } else if (gap < 0.26) {
        api.say(
          `Right on the edge: the line touches just the corner ${pt(poly[best.idx[0]])}${best.idx.length > 1 ? " and its neighbour (a tie)" : ""}. <b>The best plan is always a corner.</b>`,
          "love",
        );
        snd("correct");
      } else if (legal(poly, m, m.z) && m.z > best.z * 0.6)
        api.say("Close. There is still green left beyond this line, so you can earn more.", "idle");
    });
    // walk the corners
    function tapCorner(i) {
      if (m.mode !== "walk") {
        return;
      }
      const n = poly.length,
        cur = poly.findIndex((p) => same(p, m.walk)),
        tgt = poly[i];
      if (i === cur) return;
      const zc = zOf(m.walk, m),
        zt = zOf(tgt, m),
        nb = [(cur + 1) % n, (cur + n - 1) % n];
      const g = qs(`[data-i="${i}"]`, plot);
      if (!nb.includes(i)) {
        snd("wrong");
        if (g && fxOn()) N.fx.shake(g);
        api.say(
          `${pt(tgt)} is not next door. Simplex only walks along an <b>edge</b> to a neighbouring corner.`,
          "think",
        );
        say(
          `From ${pt(m.walk)} you can reach ${pt(poly[nb[0]])} and ${pt(poly[nb[1]])} in one step. Tap one of those.`,
        );
        return;
      }
      if (zt <= zc + 1e-9) {
        snd("wrong");
        if (g && fxOn()) N.fx.shake(g);
        api.say(
          `Downhill: profit would ${zt < zc - 1e-9 ? `fall from £${nice(zc)} to £${nice(zt)}` : `stay at £${nice(zc)}`}. Simplex only steps to a corner that <b>earns more</b>.`,
          "sad",
        );
        say(
          `${pt(tgt)} earns £${nice(zt)}, not more than £${nice(zc)}. Look at the corner table and pick a neighbour with a bigger profit.`,
        );
        return;
      }
      m.walk = tgt.slice();
      m.trail.push(tgt.slice());
      m.moved++;
      snd("step");
      paint();
      const i2 = poly.findIndex((p) => same(p, m.walk)),
        nb2 = [(i2 + 1) % n, (i2 + n - 1) % n],
        ups = nb2.filter((k) => zOf(poly[k], m) > zt + 1e-9),
        ties = nb2.filter((k) => Math.abs(zOf(poly[k], m) - zt) < 1e-7);
      if (!ups.length) {
        api.say(
          `Uphill: £${nice(zc)} to <b>£${nice(zt)}</b>. Both neighbours earn less${ties.length ? " or the same" : ""}, so there is nowhere better to go: <b>this corner is optimal.</b>`,
          "love",
        );
        say(
          `<b>Stop.</b> No neighbouring corner beats £${nice(zt)}. That is simplex's stopping rule: no edge improves the profit.`,
        );
      } else {
        api.say(
          `Uphill: £${nice(zc)} to <b>£${nice(zt)}</b>. ${ups.length} neighbour${ups.length > 1 ? "s" : ""} still ${ups.length > 1 ? "earn" : "earns"} more, so keep walking.`,
          "happy",
        );
        say(
          `At ${pt(tgt)} with £${nice(zt)}. Neighbours: ${nb2.map((k) => `${pt(poly[k])} earns £${nice(zOf(poly[k], m))}`).join(" and ")}.`,
        );
      }
      check();
    }
    qs("[data-wreset]", plot).onclick = () => {
      m.walk = [0, 0];
      m.trail = [[0, 0]];
      m.moved = 0;
      snd("back");
      paint();
      say("Back at the origin: nothing made, nothing earned.");
    };
    // rules
    let lastBest = "";
    const onRules = (flash) => {
      buildGeometry(flash);
      paint();
      check();
      const key = best.idx.map((i) => pt(poly[i])).join("|");
      if (lastBest && key !== lastBest && flash !== "init") {
        if (fxOn()) N.fx.pop && N.fx.pop(qs(".aw3-stats", read));
      }
      lastBest = key;
    };
    cSlide.onInput((v) => {
      m.c2 = v;
      onRules(false);
      const tie = best.idx.length > 1;
      if (tie)
        say(
          `<b>A tie!</b> With Y at £${nice(v)}, ${best.idx.map((i) => pt(poly[i])).join(" and ")} both earn £${nice(best.z)}. The profit line lies along the whole edge between them, so every point on it is optimal.`,
        );
      else
        say(
          `With Y at £${nice(v)} the best corner is <b>${pt(poly[best.idx[0]])}</b> earning £${nice(best.z)}. The optimum stays on a corner however you tilt the line.`,
        );
    });
    cSlide.querySelector("input").addEventListener("change", () => {
      if (best.idx.length > 1) {
        api.say(
          `A tie between two corners: the profit line now runs <b>parallel</b> to that edge. Nudge the price either way and the optimum snaps to one end.`,
          "wink",
        );
        return;
      }
      if (!same(poly[best.idx[0]], [4, 3]) && !m.capOn)
        api.say(
          `The optimum <b>jumped</b> to ${pt(poly[best.idx[0]])}. It never slides along: it moves corner to corner as the profit line tilts.`,
          "surprised",
        );
    });
    capBtn.onclick = () => {
      m.capOn = !m.capOn;
      capBtn.setAttribute("aria-pressed", m.capOn);
      capBtn.classList.toggle("on", m.capOn);
      capBtn.textContent = m.capOn ? "Remove demand cap" : "Add demand cap";
      capSlide.hidden = !m.capOn;
      snd("tap");
      onRules(true);
      if (m.capOn) {
        const nb = noCapBest(),
          bp = poly[best.idx[0]];
        say(
          same(bp, nb.p[nb.b.idx[0]])
            ? `The cap y ≤ ${nice(m.cap)} cuts nothing off the optimum ${pt(bp)}: it has <b>slack</b>. Drag the cap down to squeeze the region.`
            : `The cap changes the answer: the best corner is now ${pt(bp)}.`,
        );
        api.say(
          "A new rule. At the current optimum, is it <b>binding</b> (holding you back) or does it have slack? Drag the cap down to find out.",
          "think",
        );
      } else say("Cap removed: back to two rules.");
    };
    capSlide.onInput((v) => {
      m.cap = v;
      onRules(false);
      const bp = poly[best.idx[0]],
        binding = Math.abs(bp[1] - m.cap) < 1e-6;
      const nb = noCapBest(),
        moved = !same(bp, nb.p[nb.b.idx[0]]);
      if (binding && moved) {
        say(
          `<b>Binding.</b> The cap now stops you at ${pt(bp)}, earning £${nice(best.z)} instead of £${nice(nb.b.z)}. A binding rule costs you profit; loosening it would earn more.`,
        );
      } else if (!moved)
        say(`The optimum is still ${pt(bp)}. The cap has <b>slack</b> here: loosening or removing it changes nothing.`);
      else say(`Optimum ${pt(bp)}, £${nice(best.z)}.`);
    });
    capSlide.querySelector("input").addEventListener("change", () => {
      const bp = poly[best.idx[0]],
        nb = noCapBest();
      if (Math.abs(bp[1] - m.cap) < 1e-6 && !same(bp, nb.p[nb.b.idx[0]]))
        api.say(
          `The cap is <b>binding</b>: it now forms part of the best corner ${pt(bp)}. The old optimum was squeezed out.`,
          "happy",
        );
      else api.say("The cap is still slack: the best corner hasn't moved. Drag it lower.", "idle");
    });

    buildGeometry(false);
    paint();
    lastBest = best.idx.map((i) => pt(poly[i])).join("|");
  }
  Object.assign(partScope, { cornerHunt });
})();
