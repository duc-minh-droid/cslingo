/* Algorithms Phase 1 (video algo-1): drawing helpers for tags, number stickers, tile rows, cell grids, the matrix, a small line
   chart and icons. Loaded after common.js and common-2.js (see videos/algo-1.html). Same rules as common-2.js: stage pixels
   (936 x 640), every set / update call is PURE (pass everything you want to see each frame), tones "green" "blue" "red"
   "orange" "purple" "grey".

   1. TAG  (an HTML pill, class .v-tag, 28 px bold text; optional icon on its left)
        const t = A1.tag(stage, { text: "best", tone: "orange", solid: true, fs: 28, w, h, icon: A1.icon("tick", 30, "green", { flow: true }) })
        t.set({ x, y, center: false (true: x, y is the centre), text, tone, solid, ghost, w, h, dx, dy, s: 1, r: 0, o: 1 })
        Width is estimated from the text (A1.textW) unless you pass w; height is fs + 24. t.el is the element.
   2. STAT  (a number sticker with a small label above: 'total' over '75', 'round' over '3')
        const st = A1.stat(stage, { x, y, w: 200, h: 128, label: "total", text: "100", tone: "blue", fs: 56 })
        st.set({ text, label, tone, x, y, dx, dy, s, o })           (the number is 56 px bold, the label 28 px)
   3. ROW  (a row of number tiles: the loop's list; tiles are .v-gene from VID.l5.chromosome)
        const r = A1.row(stage, { x: 62, y: 150, values: [3, 8, 1, 9, 4, 9, 2], size: 104, gap: 14, tone: "grey" })
        r.set(i, { tone, solid, ghost, text, x, y, s, sx, r, o })   (like l5 chromosome.set: x, y are offsets)
        r.all((i) => state)  r.mid(i) -> { x, y } tile centre in stage px   r.pos(i) x of slot i inside the row   r.el, r.size, r.gap
        r.tiles[i] is the DOM tile (a .v-gene): the font is sized for ONE character, so for longer text such as 'none' set
        r.tiles[i].style.fontSize = '28px' yourself (set() leaves it alone).
        r.ring({ i: 2.4, k: 1, tone: "blue", o: 1, pad: 10 })       a rounded ring round tile i (i may be fractional: it slides)
   4. GRID  (a rows x cols grid of small square cells: the work() calls of a loop; row i, column j)
        const g = A1.grid(stage, { x, y, rows: 8, cols: 8, pitch: 18, cell: 14 })
        g.update((r, c) => undefined | { k: 0..1, tone: "blue", ghost: true }, { o: 1 })
            undefined = idle cell (soft grey); k pops a solid cell in the tone; ghost: dashed outline only (e.g. "will be added")
        g.cellAt(r, c) -> { x, y } centre in stage px, g.width, g.height
   5. MATRIX  (the link matrix: rows are the TARGET page, columns the SOURCE page, as in the lesson)
        const m = A1.matrix(stage, { x, y, names: ["P", "Q", "R", "S", "T"], cellW: 96, cellH: 62, headW: 60, headH: 60 })
        m.update({ cell: (to, from) => undefined | { text: "0.5", tone: "blue", look: "solid" | "soft" | "empty", k: 1, o: 1 },
                   colHead: { P: "blue" }, rowHead: { R: "orange" } (header tile tones), labels: 1 (the "from" / "to" words, 0..1),
                   col: { R: { tone: "blue", k: 1 } } (a rounded outline round a whole column, pops in with k),
                   sums: { P: { text: "1", tone: "green", mark: "tick" | "cross" | null, k: 1 } } (a pill under the column),
                   o: 1 })
            cell default = "empty" (a faint dashed outline, no text). Text is 28 px, so up to 5 characters ("0.455") fit a 96 px cell.
        m.cellAt(to, from) -> { x, y } centre in stage px, m.colX(name), m.rowY(name), m.sumY, m.width, m.height (without the sums row)
   6. SPARK  (a framed line chart of a series, e.g. the biggest change per round)
        const sp = A1.spark(stage, { x, y, w: 360, h: 200, ymax: 0.3, n: 20 })
        sp.update({ data: [0.29, 0.13, ...], upto: 5.5 (draw points 0..upto, fractions draw part of a segment), tone: "purple", o: 1 })
        sp.toPx(i, v) -> { x, y }
   7. DOT and SURFER  (the blue surfer token, and where it is at fractional hop number u)
        const d = A1.dot(stage, { size: 30, tone: "blue" });   d.set({ x, y, s: 1, o: 1, tone, ring: 0..1 })   x, y = centre (a ring pops round it)
        A1.surfPos(web, path, u, move = 0.7) -> { x, y, hop, f, a, b, kind }
            where the surfer is (it rests on a node's top-right shoulder so the letter stays visible) at fractional hop number u (u = 0 at the start page; hop h -> h + 1 happens during u in [h, h + 1):
            it rests for the first 1 - move of that interval, then travels a -> b along the web's edge a->b (the edge must be
            declared, e.g. extra: [["A", "X"]] for the teleport A->X; otherwise a straight line). a, b are the pages, kind the
            kind of the hop being made ("link" | "teleport"), f 0..1 the progress of the move.
   8. ICONS  (SVG pictograms, 48 x 48 design grid)
        A1.icon(name, size = 48, tone = "grey", { on: false (use the -on shade), flow: false (true: in the normal flow, for tags), w: 6 })
        names: "tick" "cross" "arrow" (points right; rotate with V.place r) "qmark" "flag" "loop" (a circular arrow) "plus" "dice"
        The svg is absolutely positioned at 0, 0: append it to the stage and move it with V.place(el, { x, y, s, r, o }) (x, y = top-left).
        A1.drawOn(el, k) 0..1 draws a tick, cross, arrow, qmark, flag or loop on (stroke draw). */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const T = V.l5.tone;
  const S = V.s;
  const { clamp, ease: E } = V;
  const { textW } = A1;
  const f1 = (n) => n.toFixed(1);
  const css = (e, o) => (Object.assign(e.style, o), e);
  const px = (n) => `${f1(n)}px`;
  const abs = (x, y, w, h) => ({ position: "absolute", left: px(x), top: px(y), width: px(w), height: px(h) });

  // ================= 7. icons =================
  const STROKES = {
    tick: ["M9 26L20 37L40 13"],
    cross: ["M12 12L36 36M36 12L12 36"],
    arrow: ["M7 24H39M27 11L40 24L27 37"],
    qmark: ["M15 17C15 6 33 6 33 17C33 25 24 25 24 33", "M24 42V42.5"],
    flag: ["M14 6V43", "M14 8H38L30 16L38 24H14"],
    loop: ["M38 24A14 14 0 1 1 24 10", "M17 3L25 10L17 17"],
    plus: ["M24 8V40M8 24H40"],
  };
  function icon(name, size = 48, tn = "grey", opt = {}) {
    const svg = S("svg", { width: size, height: size, viewBox: "0 0 48 48", class: `c-${tn}` });
    css(
      svg,
      opt.flow
        ? { flexShrink: "0", overflow: "visible" }
        : { position: "absolute", left: "0px", top: "0px", overflow: "visible" },
    );
    const col = opt.on ? "var(--c-on)" : "var(--c)";
    const wd = opt.w ?? 6;
    if (name === "dice") {
      const body = S("rect", { x: 6, y: 6, width: 36, height: 36, rx: 9, "stroke-width": 4 });
      css(body, { fill: "var(--panel)", stroke: col });
      svg.append(body);
      [[16, 16], [32, 16], [24, 24], [16, 32], [32, 32]].forEach(([cx, cy]) => svg.append(css(S("circle", { cx, cy, r: 3.6 }), { fill: "var(--ink)" }))); // prettier-ignore
      return svg;
    }
    A1.must(STROKES[name], `icon: unknown name "${name}" (use ${Object.keys(STROKES).join(", ")}, dice)`);
    STROKES[name].forEach((d) => {
      const p = S("path", {
        d,
        fill: "none",
        pathLength: "1",
        "data-draw": "1",
        "stroke-width": wd,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      });
      svg.append(css(p, { stroke: col }));
    });
    return svg;
  }
  function drawOn(el, k) {
    const kk = clamp(k);
    el.querySelectorAll("[data-draw]").forEach((p) => {
      [p.style.strokeDasharray, p.style.strokeDashoffset] = ["1 1", String(1 - kk)];
      p.style.visibility = kk <= 0.002 ? "hidden" : "";
    });
  }

  // ================= dot and surfer =================
  function dot(parent, o = {}) {
    const size = o.size ?? 30;
    const svg = S("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const ring = S("circle", { fill: "none", "stroke-width": 5 });
    const lip = S("circle");
    const face = S("circle", { "stroke-width": 3 });
    svg.append(ring, lip, face);
    parent.append(svg);
    return {
      svg,
      set({ x = 0, y = 0, s = 1, o: op = 1, tone = o.tone || "blue", ring: rk = 0 } = {}) {
        const c = T(tone);
        const rr = (size / 2) * s;
        for (const e of [lip, face]) e.setAttribute("r", f1(rr));
        for (const e of [lip, face, ring]) e.setAttribute("cx", f1(x));
        face.setAttribute("cy", f1(y));
        lip.setAttribute("cy", f1(y + 3));
        ring.setAttribute("cy", f1(y));
        ring.setAttribute("r", f1(rr + 8 + 10 * (1 - clamp(rk))));
        css(face, { fill: c.c, stroke: c.lip });
        css(lip, { fill: c.lip });
        css(ring, { stroke: c.c, opacity: String(clamp(rk)), visibility: rk > 0.001 ? "" : "hidden" });
        V.show(svg, op);
      },
    };
  }
  function surfPos(web, path, u, move = 0.7) {
    const h = clamp(Math.floor(u + 1e-9), 0, path.length - 1);
    const next = path[h + 1];
    const a = path[h].at;
    const b = next ? next.at : a;
    const f = next ? clamp((u - h - (1 - move)) / move) : 0;
    const out = { hop: h, f, a, b, kind: next ? next.kind : "start" };
    const sh = web.r * 0.78; // at rest the surfer rides on the node's top-right shoulder, so the letter stays readable
    const A0 = web.pt(a);
    const B0 = web.pt(b);
    const [ax, ay, bx, by] = [A0.x + sh, A0.y - sh, B0.x + sh, B0.y - sh];
    if (a === b || f <= 0) return { ...out, x: ax, y: ay };
    const e = E.inOut(f);
    let p = web.hasEdge(a, b) ? web.edgePt(a, b, e) : { x: A0.x + (B0.x - A0.x) * e, y: A0.y + (B0.y - A0.y) * e };
    const w0 = clamp(1 - f / 0.18);
    const w1 = clamp((f - 0.82) / 0.18);
    p = { x: ax * w0 + p.x * (1 - w0), y: ay * w0 + p.y * (1 - w0) };
    p = { x: p.x * (1 - w1) + bx * w1, y: p.y * (1 - w1) + by * w1 };
    return { ...out, x: p.x, y: p.y };
  }

  // ================= 1. tag, 2. stat =================
  function tag(parent, o = {}) {
    const fs = o.fs ?? 28;
    const el = V.h("div", { class: "v-tag" });
    css(el, {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "0",
      fontSize: px(fs),
    });
    const label = V.h("span");
    if (o.icon) el.append(o.icon);
    el.append(label);
    parent.append(el);
    const iconW = o.icon ? +o.icon.getAttribute("width") + 10 : 0;
    return {
      el,
      set(st = {}) {
        const m = { ...o, ...st };
        const text = m.text ?? "";
        const [w, h] = [m.w ?? Math.ceil(textW(text, fs) + 44 + iconW), m.h ?? fs + 24];
        const cls = `v-tag${m.solid ? " solid" : ""}${m.ghost ? " ghost" : ""} c-${m.tone || "grey"}`;
        if (el.className !== cls) el.className = cls;
        if (label.textContent !== text) label.textContent = text;
        css(el, abs((m.x ?? 0) - (m.center ? w / 2 : 0), (m.y ?? 0) - (m.center ? h / 2 : 0), w, h));
        el.style.lineHeight = px(h - 6);
        if (m.ghost) css(el, { background: "transparent", borderStyle: "dashed" });
        else css(el, { background: "", borderStyle: "" });
        V.place(el, { x: m.dx || 0, y: m.dy || 0, s: m.s ?? 1, r: m.r || 0, o: m.o ?? 1 });
      },
    };
  }
  function stat(parent, o = {}) {
    const { w = 200, h = 128, fs = 56 } = o;
    const el = V.h("div", { class: "v-card c-blue" });
    const lab = V.h("div", {
      class: "v-text",
      style: {
        ...abs(0, 6, w - 6, 36),
        textAlign: "center",
        fontSize: "28px",
        color: "var(--c-ink)",
        fontWeight: "800",
      },
    });
    const num = V.h("div", {
      class: "v-text big",
      style: {
        ...abs(0, 38, w - 6, h - 46),
        textAlign: "center",
        fontSize: px(fs),
        color: "var(--c-ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: "1",
      },
    });
    el.append(lab, num);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        const m = { ...o, ...st };
        const cls = `v-card c-${m.tone || "blue"}`;
        if (el.className !== cls) el.className = cls;
        css(el, abs(m.x ?? 0, m.y ?? 0, w, h));
        if (lab.textContent !== (m.label ?? "")) lab.textContent = m.label ?? "";
        if (num.textContent !== String(m.text ?? "")) num.textContent = String(m.text ?? "");
        V.place(el, { x: m.dx || 0, y: m.dy || 0, s: m.s ?? 1, o: m.o ?? 1 });
      },
    };
  }

  // ================= 3. row =================
  function row(parent, o = {}) {
    const { x = 0, y = 0, values, size = 104, gap = 14, tone = "grey" } = o;
    const chrom = V.l5.chromosome(parent, { x, y, genes: values.map(String), size, gap, tone });
    const ringEl = V.h("div", {
      class: "c-blue",
      style: { position: "absolute", boxSizing: "border-box", border: "6px solid var(--c)", visibility: "hidden" },
    });
    parent.append(ringEl);
    return {
      ...chrom,
      gap,
      ring({ i = 0, k = 1, tone: tn = "blue", o: op = 1, pad = 10 } = {}) {
        const cls = `c-${tn}`;
        if (ringEl.className !== cls) ringEl.className = cls;
        css(ringEl, {
          ...abs(x + chrom.pos(i) - pad, y - pad, size + 2 * pad, size + 2 * pad),
          borderRadius: px(size * 0.29 + pad),
        });
        V.place(ringEl, { s: 0.8 + 0.2 * E.back(clamp(k)), o: Math.min(1, clamp(k) * 3) * op });
      },
    };
  }

  // ================= 4. grid =================
  function grid(parent, o = {}) {
    const { x = 0, y = 0, rows = 8, cols = 8, pitch = 18, cell = 14 } = o;
    const svg = S("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const cells = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const e = S("rect", {
          x: f1(x + c * pitch),
          y: f1(y + r * pitch),
          width: cell,
          height: cell,
          rx: Math.max(2, cell * 0.22),
          "stroke-width": 2,
        });
        svg.append(e);
        cells.push(e);
      }
    parent.append(svg);
    return {
      svg,
      width: (cols - 1) * pitch + cell,
      height: (rows - 1) * pitch + cell,
      cellAt: (r, c) => ({ x: x + c * pitch + cell / 2, y: y + r * pitch + cell / 2 }),
      update(fn, st = {}) {
        V.show(svg, st.o ?? 1);
        cells.forEach((e, idx) => {
          const [r, c] = [Math.floor(idx / cols), idx % cols];
          const s = fn(r, c);
          const k = s && !s.ghost ? clamp(s.k ?? 1) : 0;
          const lit = k > 0;
          const sz = cell * (lit ? 0.55 + 0.45 * E.pop(k) : 1);
          const [cx, cy] = [x + c * pitch + cell / 2, y + r * pitch + cell / 2];
          for (const [a, v] of [["x", cx - sz / 2], ["y", cy - sz / 2], ["width", sz], ["height", sz]]) e.setAttribute(a, f1(v)); // prettier-ignore
          if (lit) css(e, { fill: T(s.tone || "blue").c, stroke: T(s.tone || "blue").lip, strokeDasharray: "" });
          else if (s && s.ghost) css(e, { fill: "none", stroke: T(s.tone || "grey").c, strokeDasharray: "4 3" });
          else css(e, { fill: "var(--panel-2)", stroke: "var(--line-2)", strokeDasharray: "" });
        });
      },
    };
  }

  // ================= 5. matrix =================
  function matrix(parent, o = {}) {
    const { x = 0, y = 0, names, cellW = 96, cellH = 62, headW = 60, headH = 60 } = o;
    const n = names.length;
    const cx = (j) => x + headW + j * cellW + cellW / 2;
    const cy = (i) => y + headH + i * cellH + cellH / 2;
    const sumY = y + headH + n * cellH + 34;
    const svg = S("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const txt = (anchor, fs, fill) =>
      css(S("text", { "text-anchor": anchor }), { fontSize: px(fs), fontWeight: "900", fill });
    const headTile = (px0, py0, w, h, name) => {
      const lip = S("rect", { x: px0, y: py0 + 4, width: w, height: h, rx: 14 });
      const face = S("rect", { x: px0, y: py0, width: w, height: h, rx: 14, "stroke-width": 3 });
      const t = txt("middle", 32, "var(--ink)");
      t.setAttribute("x", f1(px0 + w / 2));
      t.setAttribute("y", f1(py0 + h / 2 + 11));
      t.textContent = name;
      const g = S("g", {}, lip, face, t);
      svg.append(g);
      return { lip, face, t };
    };
    const colHeads = names.map((k, j) => headTile(cx(j) - cellW / 2 + 5, y + 4, cellW - 10, headH - 14, k));
    const rowHeads = names.map((k, i) => headTile(x + 4, cy(i) - cellH / 2 + 5, headW - 12, cellH - 10, k));
    const fromT = txt("middle", 28, "var(--text-dim)");
    const toT = txt("middle", 28, "var(--text-dim)");
    fromT.setAttribute("x", f1(x + headW + (n * cellW) / 2));
    toT.setAttribute("x", f1(x + headW / 2));
    for (const e of [fromT, toT]) e.setAttribute("y", f1(y - 14));
    fromT.textContent = "from";
    toT.textContent = "to";
    svg.append(fromT, toT);
    const cells = names.map((_, i) =>
      names.map((__, j) => {
        const [w, h] = [cellW - 8, cellH - 8];
        const [x0, y0] = [cx(j) - w / 2, cy(i) - h / 2];
        const lip = S("rect", { x: x0, y: y0 + 4, width: w, height: h, rx: 14 });
        const face = S("rect", { x: x0, y: y0, width: w, height: h, rx: 14, "stroke-width": 3 });
        const t = txt("middle", 28, "var(--ink)");
        t.setAttribute("x", f1(cx(j)));
        t.setAttribute("y", f1(cy(i) + 10));
        const g = S("g", {}, lip, face, t);
        svg.append(g);
        return { g, lip, face, t };
      }),
    );
    const cols = names.map((_, j) => {
      const r = S("rect", {
        x: cx(j) - cellW / 2 + 1,
        y: y + headH - 3,
        width: cellW - 2,
        height: n * cellH + 8,
        rx: 18,
        fill: "none",
        "stroke-width": 6,
      });
      svg.append(r);
      return r;
    });
    const sums = names.map((_, j) => {
      const pill = A1.svgPill(svg);
      const mk = (name, tn) => {
        const g = S("g", { class: `c-${tn}`, transform: `translate(${f1(cx(j) + 14)} ${f1(sumY - 14)}) scale(0.583)` });
        [...icon(name, 48, tn, { flow: true }).childNodes].forEach((ch) => g.append(ch));
        svg.append(g);
        return g;
      };
      return { pill, tick: mk("tick", "green"), cross: mk("cross", "red") };
    });
    parent.append(svg);

    function update(st = {}) {
      V.show(svg, st.o ?? 1);
      const lb = clamp(st.labels ?? 1);
      for (const e of [fromT, toT]) V.show(e, lb);
      const tones = (list, map) => list.forEach((h, i) => {
        const tn = (map || {})[names[i]];
        const l = tn ? { fill: T(tn).dim, stroke: T(tn).edge, ink: T(tn).ink } : { fill: "var(--panel)", stroke: "var(--line-2)", ink: "var(--ink)" };
        css(h.face, { fill: l.fill, stroke: l.stroke });
        css(h.lip, { fill: tn ? T(tn).edge : "var(--line-2)" });
        css(h.t, { fill: l.ink });
      }); // prettier-ignore
      tones(colHeads, st.colHead);
      tones(rowHeads, st.rowHead);
      names.forEach((to, i) =>
        names.forEach((from, j) => {
          const c = cells[i][j];
          const s = st.cell ? st.cell(to, from) : undefined;
          const lk = s ? s.look || "solid" : "empty";
          const tn = s?.tone || "blue";
          const k = s ? clamp(s.k ?? 1) : 0;
          const isEmpty = !s || lk === "empty";
          const col = T(tn);
          css(
            c.face,
            isEmpty
              ? { fill: "none", stroke: "var(--line-2)", strokeDasharray: "7 6" }
              : {
                  fill: lk === "solid" ? col.c : col.dim,
                  stroke: lk === "solid" ? col.lip : col.edge,
                  strokeDasharray: "",
                },
          );
          css(c.lip, { fill: col.lip, visibility: !isEmpty && lk === "solid" ? "" : "hidden" });
          if (!isEmpty && lk === "soft") css(c.lip, { fill: col.edge, visibility: "" });
          css(c.t, { fill: lk === "solid" ? col.on : col.ink });
          const text = isEmpty ? "" : (s.text ?? "");
          if (c.t.textContent !== text) c.t.textContent = text;
          c.g.style.transformOrigin = `${f1(cx(j))}px ${f1(cy(i))}px`;
          c.g.style.transform = `scale(${(isEmpty ? 1 : 0.6 + 0.4 * E.pop(k)).toFixed(3)})`;
          V.show(c.g, isEmpty ? (s ? (s.o ?? 1) : 1) : Math.min(1, k * 4) * (s.o ?? 1));
        }),
      );
      cols.forEach((r, j) => {
        const s = (st.col || {})[names[j]];
        const k = s ? clamp(s.k ?? 1) : 0;
        css(r, { stroke: T(s?.tone || "blue").c });
        r.style.transformOrigin = `${f1(cx(j))}px ${f1(y + headH + (n * cellH) / 2)}px`;
        r.style.transform = `scale(${(0.9 + 0.1 * E.pop(k)).toFixed(3)})`;
        V.show(r, k);
      });
      sums.forEach((u, j) => {
        const s = (st.sums || {})[names[j]];
        const k = s ? clamp(s.k ?? 1) : 0;
        u.pill.set({
          x: cx(j) - (s?.mark ? 14 : 0),
          y: sumY,
          text: s?.text ?? "",
          tone: s?.tone || "green",
          look: "soft",
          s: 0.7 + 0.3 * E.pop(k),
          o: Math.min(1, k * 4),
        });
        V.show(u.tick, s?.mark === "tick" ? k : 0);
        V.show(u.cross, s?.mark === "cross" ? k : 0);
      });
    }
    return {
      svg, update, sumY,
      width: headW + n * cellW,
      height: headH + n * cellH,
      cellAt: (to, from) => ({ x: cx(names.indexOf(from)), y: cy(names.indexOf(to)) }),
      colX: (k) => cx(names.indexOf(k)),
      rowY: (k) => cy(names.indexOf(k)),
    }; // prettier-ignore
  }

  // ================= 6. spark =================
  function spark(parent, o = {}) {
    const { x = 0, y = 0, w = 360, h = 200, ymax = 0.3, n = 20 } = o;
    const [pl, pr, pt, pb] = [26, 26, 26, 26];
    const [cw, ch] = [w - pl - pr, h - pt - pb];
    const toPx = (i, v) => ({ x: x + pl + (i / n) * cw, y: y + pt + (1 - clamp(v / ymax)) * ch });
    const svg = S("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const card = (dy, st) => S("rect", { x: x + 1.5, y: y + 1.5 + dy, width: w - 3, height: h - 3, rx: 24, style: st });
    const base = S("path", {
      d: `M${f1(x + pl)} ${f1(y + pt + ch)}H${f1(x + pl + cw)}`,
      fill: "none",
      "stroke-width": 3,
    });
    css(base, { stroke: "var(--line-2)" });
    const line = S("path", { fill: "none", "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" });
    const dots = S("g");
    svg.append(
      card(6, { fill: "var(--line-2)" }),
      card(0, { fill: "var(--panel)", stroke: "var(--line-2)", strokeWidth: "3px" }),
      base,
      line,
      dots,
    );
    parent.append(svg);
    const dotEls = Array.from({ length: n + 1 }, () => dots.appendChild(S("circle", { r: 7, "stroke-width": 3 })));
    return {
      svg,
      toPx,
      update({ data = [], upto = data.length - 1, tone = "purple", o: op = 1 } = {}) {
        V.show(svg, op);
        const c = T(tone);
        const m = Math.min(upto, data.length - 1);
        let d = "";
        for (let i = 0; i <= Math.floor(m + 1e-9); i++)
          d += `${i ? "L" : "M"}${f1(toPx(i, data[i]).x)} ${f1(toPx(i, data[i]).y)}`;
        const i0 = Math.floor(m + 1e-9);
        if (m > i0 && i0 + 1 < data.length) {
          const [a, b] = [toPx(i0, data[i0]), toPx(i0 + 1, data[i0 + 1])];
          d += `L${f1(a.x + (b.x - a.x) * (m - i0))} ${f1(a.y + (b.y - a.y) * (m - i0))}`;
        }
        line.setAttribute("d", d || "M0 0");
        css(line, { stroke: c.c, visibility: d ? "" : "hidden" });
        dotEls.forEach((e, i) => {
          const on = i < data.length && i <= upto + 1e-9;
          if (on) {
            const p = toPx(i, data[i]);
            e.setAttribute("cx", f1(p.x));
            e.setAttribute("cy", f1(p.y));
            css(e, { fill: c.c, stroke: c.lip });
          }
          V.show(e, on ? 1 : 0);
        });
      },
    };
  }

  Object.assign(A1, { icon, drawOn, tag, stat, row, grid, matrix, spark, dot, surfPos });
})();
