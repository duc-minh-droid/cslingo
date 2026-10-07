/* Lecture 2 · Why EAs: drawing helpers, part 2 (window.VID.l2, short name L2). Load after common-2.js.
   Same rules as part 1 (see common-2.js): helpers append once, update/set is called every frame and is pure, stage px, tone names.

   1. GRAPH  (scenes 5 and 6: the five towns A-E and their ten cables, from L2.G)
        const g = L2.graph(stage, {x: 0, y: 24})                 (x, y = offset added to L2.G.pos, which is graph-local)
        g.update({k: 1, o: 1,
          nodes: {A: {tone, ring: 0..1, ringTone, pulse: 0..1, deg: n, limit: 0 | 2, flash: 0..1, slotTone, slotsO: 1}},
          edges: {AC: {tone, w, dash, k: 0..1, from: "A", o: 1, blocked: 0..1, dim: 0..1, pill: tone, pillO: 1, pulse: 0..1}}})
          k 0..1 builds the graph in (towns first, then cables draw on, then the weight pills pop); keep k = 1 afterwards.
          Anything you leave out falls back to its default, so pass every changing node and edge every frame (an edge you do not
          mention is the thin grey default). Edge keys are alphabetical: AB AC AD AE BC BD BE CD CE DE.
          NODE  default = grey sticker with the letter (68 px circle, 36 px bold). tone = saturated sticker in that colour.
            ring = a halo ring in ringTone (default blue). pulse = a scale bump (pass V.flash(t, a, b)). flash = a red burst ring
            (also a V.flash bump). With limit: 2, two slot dots sit under the town (12 px, 22 px apart, 46 px below the centre)
            and min(deg, limit) are filled (deg may be fractional while it fades in: dot i fills as clamp(deg - i)); deg > limit
            gives a third red overflow dot, a red ring and a small red cross at the top-right. slotsO fades the dots; slotTone
            colours filled dots (default ink).
          EDGE  default = a 4 px grey line under the towns with the weight in a pill (28 px bold, panel fill, 3 px grey border).
            tone = thick (w, default 12) solid line in that colour; dash: true = dashed. k = how much is drawn, from town `from`
            (default the first letter, e.g. "A" for AC); pass from: "E" for BE to grow from E. o = line opacity. dim 0..1 = fade
            the line (and nothing else). pill = colour of the pill border and weight (default the edge's tone). pillO = pill
            opacity. pulse 0..1 = thicken the line and bump the pill. blocked 0..1 = dashed red line, the weight fades, a red cross
            pops over the pill.
        g.pt("A") -> {x, y} centre in stage px   g.pill("BD") -> {x, y} centre of the weight pill (fly the weight to the cost
        card from here)   g.r = 34   g.towns "ABCDE"   g.edgePt("AC", f) -> point at fraction f from the first letter

   2. TOUR PANEL  (scene 7)
        const p = L2.tourPanel(stage, {x, y, w: 440, h: 316, cities: race.cities, tag: "Nearest neighbour", tone: "orange"})
        p.update({tour: [0, 5, ...] (city indices), draw: 1, dots: 1, tone, o: 1, len: 4.314, lenTone, flash: 0..1})
          Plain sticker card, the tag top-left (28 px, in the tone), the length tag top-right (two decimals; hidden while len is
          undefined; lenTone defaults to the tone), 25 dots (r 8) at px = x + 20 + cx x 400, py = y + 56 + cy x 240, and the closed
          route (5 px, tone) drawn city by city (the closing leg last): draw 0..1 = how much. dots 0..1 pops the dots in (staggered).
          flash 0..1 = pulse the card border (pass V.flash). tour undefined hides the route.
        p.pt(i) -> {x, y} stage px of city i   p.w, p.h
        The top row is tight: with w 440 the tags 'Nearest neighbour' + '4.31' fit, 'Evolutionary algorithm' + '3.56' may not
        (see p.fits); set tagSize: 28 (never smaller) and pick a shorter tag such as 'Evolutionary alg.' only if p.fits is false.

   3. COST CARD  (scenes 5 and 6)
        const c = L2.costCard(stage, {x, y, w: 224, h: 170, label: "cost"})
        c.update({value: 18, tone: "grey", bump: 0, s: 1, o: 1})
          a plain sticker card, grey label on top, the value in 96 px bold; tone colours the card tint, border and number
          (grey = plain card, green, red, orange ...); bump 0..1 pops the number (pass V.flash). value is shown as given
          (number or string: round it yourself while counting).
        c.numberPt() -> {x, y} centre of the number in stage px (where the flying weight lands) */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const L5 = V.l5;
  const { clamp, ramp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const T = (name) => L5.tone(name);
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  /* opacity and a scale about (cx, cy) for an SVG element drawn at absolute stage coordinates */
  const put = (e, cx, cy, s = 1, o = 1) => {
    V.show(e, o);
    e.style.transformOrigin = `${f1(cx)}px ${f1(cy)}px`;
    e.style.transform = s === 1 ? "" : `scale(${s})`;
  };
  const text = (str, cx, cy, size, fill) =>
    V.s(
      "text",
      {
        x: f1(cx),
        y: f1(cy),
        "text-anchor": "middle",
        "dominant-baseline": "central",
        style: { fontSize: `${size}px`, fontWeight: "900", fill },
      },
      str,
    );

  // ---------- 1. graph ----------
  function graph(parent, opt = {}) {
    const { x: ox = 0, y: oy = 24 } = opt;
    const { G, TOWNS } = L2;
    const R = 34;
    const P = (t) => ({ x: ox + G.pos[t][0], y: oy + G.pos[t][1] });
    const svg = L5.svg(parent);
    const lay = ["edges", "pills", "slots", "towns", "over"].map(() => V.s("g", {}));
    svg.append(...lay);
    const [gE, gP, gS, gT, gO] = lay;
    const grey = T("grey");

    const edges = G.edges.map(([a, b, wt], j) => {
      const key = a + b;
      const f = G.labelAt[key] ?? 0.5;
      const [pa, pb] = [P(a), P(b)];
      const c = { x: pa.x + (pb.x - pa.x) * f, y: pa.y + (pb.y - pa.y) * f };
      const [pw, ph] = [34 + 19 * String(wt).length, 46];
      const line = V.s("line", { "stroke-linecap": "round" });
      const rect = V.s("rect", {
        x: f1(c.x - pw / 2),
        y: f1(c.y - ph / 2),
        width: pw,
        height: ph,
        rx: ph / 2,
        "stroke-width": "3",
        style: { fill: "var(--panel)" },
      });
      const label = text(String(wt), c.x, c.y + 1, 32, "var(--ink)");
      const sgn = c.x > 600 ? -1 : 1; // keep the cross off the cost card on the right
      const crossG = L5.cross(c.x + sgn * (pw / 2 + 18), c.y, 34, "red", { w: 7 }); // beside the pill, so the weight stays readable
      const pill = V.s("g", {}, rect, label, crossG);
      gE.append(line);
      gP.append(pill);
      return { key, a, b, c, line, pill, label, rect, crossG, j, cx: c.x + sgn * (pw / 2 + 18) };
    });
    const edgeBy = Object.fromEntries(edges.map((e) => [e.key, e]));

    const towns = [...TOWNS].map((t, i) => {
      const { x, y } = P(t);
      const lip = V.s("circle", { cx: f1(x), cy: f1(y + 5), r: R, "stroke-width": "4" });
      const body = V.s("circle", { cx: f1(x), cy: f1(y), r: R, "stroke-width": "4" });
      const letter = text(t, x, y + 2, 36, "var(--ink)");
      const town = V.s("g", {}, lip, body, letter);
      const ring = V.s("circle", { cx: f1(x), cy: f1(y), r: R + 14, fill: "none", "stroke-width": "5" });
      const burst = V.s("circle", { cx: f1(x), cy: f1(y), r: R + 12, fill: "none", "stroke-width": "6" });
      const over = V.s("circle", { cx: f1(x), cy: f1(y), r: R + 14, fill: "none", "stroke-width": "5" });
      const xmark = L5.cross(x + 31, y - 31, 30, "red", { w: 6 });
      const dots = [0, 1, 2].map(() =>
        V.s("g", {}, V.s("circle", { r: 10, "stroke-width": "3" }), V.s("circle", { r: 10 })),
      );
      gS.append(...dots);
      gT.append(town);
      gO.append(ring, burst, over, xmark);
      return { t, i, x, y, lip, body, letter, town, ring, burst, over, xmark, dots };
    });
    const townBy = Object.fromEntries(towns.map((q) => [q.t, q]));

    function drawEdge(e, s, built, pillIn) {
      const { tone, w: w0, dash = false, k = 1, from, o = 1, blocked = 0, dim = 0, pill, pillO = 1, pulse = 0 } = s;
      const tn = tone ? T(tone) : grey;
      const bl = clamp(blocked);
      const [a, b] = from === e.b ? [e.b, e.a] : [e.a, e.b];
      const [pa, pb] = [P(a), P(b)];
      const kk = clamp(k) * built;
      const w = (w0 ?? (tone ? 12 : 4)) * (1 + 0.35 * clamp(pulse));
      const dashed = dash || bl > 0.01;
      const red = T("red");
      const col = bl > 0.01 ? red.c : tone ? tn.c : grey.edge;
      Object.assign(e.line.style, {
        stroke: col,
        strokeWidth: f1(w),
        strokeDasharray: dashed ? `${f1(Math.max(14, w * 1.2))} ${f1(Math.max(12, w * 1.1))}` : "none",
        strokeLinecap: dashed ? "butt" : "round",
      });
      e.line.setAttribute("x1", f1(pa.x));
      e.line.setAttribute("y1", f1(pa.y));
      e.line.setAttribute("x2", f1(pa.x + (pb.x - pa.x) * kk));
      e.line.setAttribute("y2", f1(pa.y + (pb.y - pa.y) * kk));
      V.show(e.line, kk <= 0.002 ? 0 : o * (1 - 0.65 * clamp(dim)));
      const pt = pill || tone || "grey";
      const pc = T(bl > 0.01 ? "red" : pt);
      e.rect.style.stroke = bl > 0.01 ? red.c : pt === "grey" ? grey.edge : pc.c;
      e.label.style.fill = pt === "grey" && bl < 0.01 ? "var(--ink)" : pc.ink;
      e.label.style.opacity = String(1 - 0.5 * bl);
      put(e.pill, e.c.x, e.c.y, (0.6 + 0.4 * E.pop(pillIn)) * (1 + 0.14 * clamp(pulse)), clamp(pillIn * 4) * pillO);
      put(e.crossG, e.cx, e.c.y, 0.6 + 0.4 * E.pop(bl), bl > 0.01 ? 1 : 0);
      L5.drawOn(e.crossG, ramp(bl, 0, 0.8, E.lin));
    }

    function drawTown(q, s, popK) {
      const { tone, ring = 0, ringTone = "blue", pulse = 0, deg = 0, limit = 0, flash = 0, slotTone, slotsO = 1 } = s;
      const tn = tone ? T(tone) : grey;
      Object.assign(q.lip.style, { fill: tone ? tn.lip : tn.edge, stroke: tone ? tn.lip : tn.edge });
      Object.assign(q.body.style, { fill: tone ? tn.c : tn.dim, stroke: tone ? tn.lip : tn.edge });
      q.letter.style.fill = tone ? tn.on : "var(--ink)";
      put(q.town, q.x, q.y, (0.5 + 0.5 * E.pop(popK)) * (1 + 0.14 * clamp(pulse)), clamp(popK * 4));
      q.ring.style.stroke = T(ringTone).c;
      put(q.ring, q.x, q.y, 0.88 + 0.12 * clamp(ring), clamp(ring) * clamp(popK));
      q.burst.style.stroke = T("red").c;
      put(q.burst, q.x, q.y, 1 + 0.5 * clamp(flash), clamp(flash));
      const over = clamp(deg - limit) * (limit > 0 ? 1 : 0);
      q.over.style.stroke = T("red").c;
      put(q.over, q.x, q.y, 1, over);
      put(q.xmark, q.x + 31, q.y - 31, 0.6 + 0.4 * over, over);
      q.dots.forEach((d, n) => {
        const [empty, fill] = d.childNodes;
        const dx = (n - (limit - 1) / 2) * 32;
        d.setAttribute("transform", `translate(${f1(q.x + dx)} ${f1(q.y + 52)})`);
        const isOver = n >= limit;
        empty.style.fill = "var(--panel-2)";
        empty.style.stroke = isOver ? T("red").c : grey.edge;
        fill.style.fill = isOver ? T("red").c : slotTone ? T(slotTone).c : "var(--ink)";
        V.show(empty, limit > 0 && !isOver ? slotsO * popK : 0);
        V.show(fill, limit > 0 ? slotsO * clamp(deg - n) * (isOver ? 1 : popK) : 0);
      });
    }

    function update(st = {}) {
      const { k = 1, o = 1, nodes = {}, edges: es = {} } = st;
      Object.keys(es).forEach((key) => {
        if (!edgeBy[key]) throw new Error(`VID.l2.graph: no cable "${key}"`);
      });
      Object.keys(nodes).forEach((t) => {
        if (!townBy[t]) throw new Error(`VID.l2.graph: no town "${t}"`);
      });
      towns.forEach((q) => drawTown(q, nodes[q.t] || {}, ramp(k, q.i * 0.05, q.i * 0.05 + 0.3, E.lin)));
      edges.forEach((e) =>
        drawEdge(
          e,
          es[e.key] || {},
          ramp(k, 0.25 + e.j * 0.03, 0.55 + e.j * 0.03, E.out),
          ramp(k, 0.6 + e.j * 0.03, 0.72 + e.j * 0.03, E.lin),
        ),
      );
      V.show(svg, o);
    }
    update({ k: 0 });
    return {
      update,
      pt: (t) => {
        if (!townBy[t]) throw new Error(`VID.l2.graph: no town "${t}"`);
        return P(t);
      },
      pill: (key) => ({ ...edgeBy[key].c }),
      edgePt: (key, f) => {
        const e = edgeBy[key];
        const [pa, pb] = [P(e.a), P(e.b)];
        return { x: pa.x + (pb.x - pa.x) * f, y: pa.y + (pb.y - pa.y) * f };
      },
      r: R,
      towns: TOWNS,
    };
  }

  // ---------- 2. tour panel ----------
  function tourPanel(parent, opt = {}) {
    const { x = 0, y = 0, w = 440, h = 316, cities, tag: tagText = "", tone: tone0 = "grey", tagSize = 28 } = opt;
    if (!cities) throw new Error("VID.l2.tourPanel: cities required");
    const n = cities.length;
    const loc = cities.map(([cx, cy]) => [20 + cx * 400, 82 + cy * 218]);
    const wrap = V.h("div", { style: abs(x, y, w, h) });
    const card = V.h("div", {
      class: "v-card plain",
      style: { left: "0", top: "0", width: `${w}px`, height: `${h}px` },
    });
    const tagEl = V.h("div", {
      class: `v-tag c-${tone0}`,
      text: tagText,
      style: { left: "10px", top: "8px", padding: "6px 10px 7px", fontSize: `${tagSize}px` },
    });
    const lenEl = V.h("div", {
      class: `v-tag c-${tone0}`,
      style: { right: "10px", top: "8px", padding: "6px 6px 7px", fontSize: `${tagSize}px` },
    });
    const svg = V.s("svg", {
      width: w,
      height: h,
      style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
    });
    const route = V.s("path", {
      fill: "none",
      pathLength: "1",
      "stroke-width": "5",
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
    });
    const dots = loc.map(([px, py]) => V.s("circle", { cx: f1(px), cy: f1(py), r: 8, style: { fill: "var(--ink)" } }));
    svg.append(route, ...dots);
    wrap.append(card, svg, tagEl, lenEl);
    parent.append(wrap);
    const dist = (a, b) => Math.hypot(loc[a][0] - loc[b][0], loc[a][1] - loc[b][1]);
    function update(st = {}) {
      const { tour, draw = 1, dots: dk = 1, tone = tone0, o = 1, len, lenTone = tone, flash = 0 } = st;
      const tn = T(tone);
      V.show(wrap, o);
      if (tagEl.className !== `v-tag c-${tone}`) tagEl.className = `v-tag c-${tone}`;
      if (lenEl.className !== `v-tag c-${lenTone}`) lenEl.className = `v-tag c-${lenTone}`;
      const lt = len == null ? "" : typeof len === "string" ? len : len.toFixed(2);
      if (lenEl.textContent !== lt) lenEl.textContent = lt;
      V.show(lenEl, lt ? 1 : 0);
      card.style.boxShadow = `0 6px 0 var(--line-2)${flash > 0.01 ? `, 0 0 0 ${f1(8 * clamp(flash))}px ${tn.c}` : ""}`;
      dots.forEach((d, i) =>
        put(
          d,
          loc[i][0],
          loc[i][1],
          0.4 + 0.6 * E.pop(ramp(dk, (i / n) * 0.6, (i / n) * 0.6 + 0.4, E.lin)),
          clamp(ramp(dk, (i / n) * 0.6, (i / n) * 0.6 + 0.15, E.lin)),
        ),
      );
      if (!tour || draw <= 0.002) return V.show(route, 0);
      const seg = tour.map((c, i) => dist(c, tour[(i + 1) % n]));
      const total = seg.reduce((a, b) => a + b, 0);
      const pos = clamp(draw) * n;
      const si = Math.min(n - 1, Math.floor(pos));
      const done = seg.slice(0, si).reduce((a, b) => a + b, 0) + seg[si] * (pos - si);
      route.setAttribute(
        "d",
        `M ${tour.map((c) => loc[c].map(f1).join(" ")).join(" L ")} L ${loc[tour[0]].map(f1).join(" ")}`,
      );
      Object.assign(route.style, {
        stroke: tn.c,
        strokeDasharray: `${(done / total).toFixed(5)} 2`,
        strokeDashoffset: "0",
      });
      V.show(route, 1);
    }
    // the tags are measured in the browser; fits = both tags side by side leave a 6 px gap
    const fits = () => tagEl.offsetWidth + lenEl.offsetWidth + 10 * 2 + 6 <= w;
    update({ dots: 0 });
    return {
      update,
      pt: (i) => ({ x: x + loc[i][0], y: y + loc[i][1] }),
      w,
      h,
      get fits() {
        return fits();
      },
    };
  }

  // ---------- 3. cost card ----------
  function costCard(parent, opt = {}) {
    const { x = 0, y = 0, w = 224, h = 170, label = "cost" } = opt;
    const lab = V.h("div", {
      text: label,
      style: {
        position: "absolute",
        left: "16px",
        top: "6px",
        fontSize: "28px",
        fontWeight: "800",
        lineHeight: "34px",
        color: "var(--text-dim)",
      },
    });
    const top = 40 + (h - 40 - 96) / 2;
    const num = V.h("div", {
      style: {
        position: "absolute",
        left: "0",
        width: `${w - 6}px`,
        top: `${f1(top - 3)}px`,
        textAlign: "center",
        fontSize: "96px",
        fontWeight: "900",
        lineHeight: "96px",
      },
    });
    const card = V.h("div", { class: "v-card plain", style: abs(x, y, w, h) }, lab, num);
    parent.append(card);
    return {
      update(st = {}) {
        const { value = 0, tone = "grey", bump = 0, s = 1, o = 1 } = st;
        const tn = T(tone);
        Object.assign(card.style, {
          background: tone === "grey" ? "var(--panel)" : tn.dim,
          borderColor: tone === "grey" ? T("grey").edge : tn.c,
          boxShadow: `0 6px 0 ${tone === "grey" ? T("grey").edge : tn.lip}`,
        });
        num.style.color = tone === "grey" ? "var(--ink)" : tn.ink;
        const txt = String(value);
        if (num.textContent !== txt) num.textContent = txt;
        num.style.transform = `scale(${f1(1 + 0.18 * clamp(bump))})`;
        V.place(card, { s, o });
      },
      numberPt: () => ({ x: x + w / 2, y: y + top + 48 }),
    };
  }

  Object.assign(L2, { graph, tourPanel, costCard });
})();
