/* Algorithms phase 2 · grid, rooms list, table, bars, map icon (window.VID.a2, part 3 of 3; needs common.js, common-2.js, VID.l5).
   Stage px (936 x 640). Every update/set call is PURE: pass the whole state you want to see on every frame (anything left out
   falls back to its default). Tones: "blue" "green" "red" "orange" "purple" "grey". Text is 28 px minimum, "∞" is drawn as a shape.

   ───────────────────────────── A2.grid(parent, {x, y, cols = 10, rows = 7, cell = 76, gap = 6, fs = 28}) -> Gd ─────────────────────────────
     A sticker grid (SVG), top-left corner at (x, y). Its size is cols * (cell + gap) - gap by rows * (cell + gap) - gap.
     Gd.update({o: 1, s: 1, cells: (cx, cy, key) => state | undefined})     cells may also be an object {"1,3": state}
        state = {look: "empty" | "soft" | "solid" | "wall", tone, text, s: 1, o: 1, ring, ringK: 1, pulse: 0, dx: 0, dy: 0, under: 0}
        empty (default) quiet grey cell, soft = tinted in the tone, solid = filled, wall = dark blocked cell (no text)
        text   28 px bold (a cell of 76 px fits "11"; with cell < 50 do not use text)      ring   tone: a thick ring, ringK 0..1 grows it
        pulse  0..1 one scale bump (A2.bump)       o 0 hides the cell
        under  0..1 opacity of a plain empty cell drawn beneath this one (so a cell that fades or pops in never leaves a hole)
     Gd.centre(cx, cy) -> {x, y} stage centre of a cell     Gd.w, Gd.h, Gd.x, Gd.y     Gd.el root
   A2.gridPaint(run, n, opt) -> (cx, cy, key) => state       the standard picture of a search on A2.GRID, for Gd.update({cells})
        run   A2.RUNS.astar or A2.RUNS.dijkstra          n   expansions done, FRACTIONAL: the expansion floor(n) + 1 is "in
        progress" while 0 < fraction < 1: its cell is solid orange; at the whole number it turns soft green
        opt   {nums: false (write each cell's f: open cells their current f, expanded cells the f they had), pathK: 0 (0..1 of the
              final path turned solid green from S towards G, one cell after the other), o: 1}
        look  wall: dark; S: solid blue "S"; G: solid orange "G" (the goal, as in scenes 2 and 8); open (seen, not expanded): soft purple; expanded: soft
              green; the cell being expanded: solid orange; path: solid green.
        A whole number n is a STABLE picture (hold it as long as you like). Between whole numbers the next expansion is in
        progress: its cell is solid orange (the ring on S / G) and the cells it opens pop in during the second half of the step.
        A2.gridPaint is pure: call it with a new n every frame (n = A2.lin(t, t0, t1) * run.count for a steady run).
        To pop or fade the whole grid use Gd.update({s, o}); for a column wave wrap it and multiply: (cx, cy, key) =>
        { const st = paint(cx, cy, key); return {...st, o: (st.o ?? 1) * k(cx), s: (st.s ?? 1) * pop(cx)}; }

   ───────────────────────────── A2.list(parent, {x, y, w = 260, head, headTone = "grey", keys, rowH = 46, pitch = 54, fs = 28}) -> Ls ─────────────────────────────
     A titled column of pills (the "waiting room" and the "settled" list). The header pill (text `head`) is w wide at (x, y); row slot i
     has its centre at y + 78 + i * pitch.   Ls.update({k: 1, items: {B: {text: "B = 4", slot: 0, tone: "purple", solid: false, strike: 0, o: 1, s: 1, dx: 0, dy: 0}}})
        k      0..1 pop of the header      items   one entry per key (keys: the names you may use); keys left out are hidden
        slot   row index, FRACTIONAL is fine (slide a pill from one row to another)
     Ls.slotY(i) -> stage y of the centre of slot i     Ls.slotX -> stage x of the centre     Ls.head the header tag

   ───────────────────────────── A2.table(parent, {x, y, cols: [100, 150], head: ["to", "via"], rows: [["B","B"], ...], rowH = 52, fs = 28}) -> Tb ─────────────────────────────
     A sticker table (card, header row in grey, body rows).  Width = sum(cols) + 28, height = rowH * (rows + 1) + 24.
     Tb.update({k: 1, o: 1, rows: [{k: 1, hl: null | "orange" | tone, solid: false}], dx: 0, dy: 0, cells: [[{text, tone}]]})
        k      0..1 pop of the card (the header comes with it)     rows[i].k  0..1 the row slides in (default 1)
        hl     tone name: the row gets a tinted (solid: false) or filled (solid: true) background
        cells  optional per cell overrides, cells[i][j] = {text, tone} (tone colours the text with its -ink shade)
     Tb.rowY(i) -> stage y of the centre of body row i     Tb.colX(j) -> stage x of the centre of column j     Tb.w, Tb.h, Tb.x, Tb.y

   ───────────────────────────── A2.bar(parent, {x, y, h = 44, unit = 60, segs: [{v: 4, tone: "blue", text: "4"}]}) -> Br ─────────────────────────────
     A horizontal bar made of segments side by side (a segment of value v is v * unit px wide, solid tone, 28 px text inside:
     segs[i].align = "left" | "right" moves the text to that end, default centred; use it when a marker line crosses the middle).
     Br.update({k: 1, o: 1, tones: [tone per segment]})   k 0..1 reveals the bar from the left (the segments are clipped as it grows)
     Br.xAt(v) -> stage x of value v along the bar    Br.endX -> x after the last segment    Br.h, Br.total (sum of the values)

   ───────────────────────────── A2.compass(x, y, r = 24, tone = "purple") -> {g, dial, needle} ─────────────────────────────
     A compass pictogram (dial plus a needle that points right at rotation 0) centred on (x, y), for SVG layers (L5.svg).
     V.place(g, {s, o}) pops and fades the whole icon; V.place(needle, {r: degrees}) swings the needle.

   ───────────────────────────── A2.mapIcon(x, y, size, tone = "blue") -> <g> ─────────────────────────────
     A small map-card pictogram (four dots joined by lines on a sticker card) centred on (x, y); V.place(g, {x, y, s, o}) moves it.
     Use inside SVG (G.over, L5.svg) .   A2.dot(x, y, r, tone = "blue") -> <g> a small solid disc with a lip. */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const f1 = (n) => (+n).toFixed(1);
  const dflt = (v, d) => (v == null ? d : v);
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });

  // ---------- grid ----------
  const LOOKS = {
    empty: () => ({ fill: "var(--panel-2)", stroke: "var(--line)", lip: "var(--line)", ink: "var(--ink)" }),
    wall: () => ({ fill: "var(--text-faint)", stroke: "var(--text)", lip: "var(--text)", ink: "var(--bg)" }),
    soft: (t) => ({ fill: t.dim, stroke: t.edge, lip: t.edge, ink: t.ink }),
    solid: (t) => ({ fill: t.c, stroke: t.lip, lip: t.lip, ink: t.on }),
  };
  function grid(parent, opt = {}) {
    const { x = 0, y = 0, cols = 10, rows = 7, cell = 76, gap = 6, fs = 28 } = opt;
    const pitch = cell + gap;
    const [w, h] = [cols * pitch - gap, rows * pitch - gap];
    const lip = Math.max(3, Math.round(cell * 0.07));
    const svg = V.s("svg", {
      width: w,
      height: h + lip,
      style: { position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px`, overflow: "visible" },
    });
    const cells = {};
    for (let cy = 0; cy < rows; cy++)
      for (let cx = 0; cx < cols; cx++) {
        const rect = (dy, extra) =>
          V.s("rect", { x: 0, y: dy, width: cell, height: cell, rx: f1(cell * 0.22), ...extra });
        const halo = V.s("rect", {
          x: -5,
          y: -5,
          width: cell + 10,
          height: cell + 10,
          rx: f1(cell * 0.22 + 5),
          fill: "none",
          "stroke-width": 6,
        });
        const lipR = rect(lip, {});
        const face = rect(0, { "stroke-width": 3 });
        const text = V.s("text", {
          x: f1(cell / 2),
          y: f1(cell / 2),
          dy: ".36em",
          "text-anchor": "middle",
          style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: `${fs}px` },
        });
        const inner = V.s("g", {}, halo, lipR, face, text);
        const under = V.s(
          "g",
          {},
          rect(lip, { style: { fill: "var(--line)" } }),
          rect(0, { "stroke-width": 3, style: { fill: "var(--panel-2)", stroke: "var(--line)" } }),
        );
        const g = V.s("g", { transform: `translate(${f1(cx * pitch)} ${f1(cy * pitch)})` }, under, inner);
        svg.append(g);
        cells[`${cx},${cy}`] = { g, inner, under, halo, lipR, face, text, sig: "" };
      }
    parent.append(svg);
    function paint(c, st) {
      const sig = JSON.stringify(st);
      if (c.sig === sig) return;
      c.sig = sig;
      const tn = L5.tone(st.tone || "grey");
      const lk = (LOOKS[st.look || "empty"] || LOOKS.empty)(tn);
      c.face.style.fill = lk.fill;
      c.face.style.stroke = lk.stroke;
      c.lipR.style.fill = lk.lip;
      c.text.style.fill = lk.ink;
      const txt = st.text == null ? "" : String(st.text);
      if (c.text.textContent !== txt) c.text.textContent = txt;
      const rk = clamp(dflt(st.ringK, 1));
      c.halo.style.stroke = st.ring ? L5.tone(st.ring).c : "none";
      V.show(c.halo, st.ring ? clamp(rk * 3) : 0);
      V.show(c.under, clamp(dflt(st.under, 0)));
      V.place(c.inner, {
        x: st.dx || 0,
        y: st.dy || 0,
        s: dflt(st.s, 1) * (1 + 0.16 * clamp(st.pulse || 0)),
        o: dflt(st.o, 1),
      });
    }
    function update(st = {}) {
      const get = typeof st.cells === "function" ? st.cells : (cx, cy, key) => (st.cells || {})[key];
      Object.entries(cells).forEach(([key, c]) => {
        const [cx, cy] = key.split(",").map(Number);
        paint(c, get(cx, cy, key) || {});
      });
      V.place(svg, { s: dflt(st.s, 1), o: dflt(st.o, 1) });
    }
    return {
      el: svg, update, w, h, x, y,
      centre: (cx, cy) => ({ x: x + cx * pitch + cell / 2, y: y + cy * pitch + cell / 2 }),
    }; // prettier-ignore
  }

  /* the standard picture of a grid search (see the header) */
  const evCache = new WeakMap();
  function events(run) {
    if (evCache.has(run)) return evCache.get(run);
    const openedAt = { [A2.gridKey(...A2.GRID.S)]: -1 };
    const closedAt = {};
    run.steps.forEach((s, i) => {
      closedAt[s.key] = i;
      s.added.forEach(([ax, ay]) => (openedAt[A2.gridKey(ax, ay)] = i));
    });
    const onPath = Object.fromEntries(run.path.map(([px, py], i) => [A2.gridKey(px, py), i]));
    const ev = { openedAt, closedAt, onPath };
    evCache.set(run, ev);
    return ev;
  }
  function gridPaint(run, n, opt = {}) {
    const { nums = false, pathK = 0, o = 1 } = opt;
    const { closedAt, onPath } = events(run);
    const done = Math.min(run.count, Math.floor(n + 1e-9));
    const frac = done < run.count ? clamp(n - done) : 0;
    const cur = frac > 0.001 ? run.steps[done] : null; // the expansion in progress
    const curOpen = cur ? Object.fromEntries(cur.open.map((q) => [q.key, q])) : {};
    const state = run.at(done);
    const SK = A2.gridKey(...A2.GRID.S);
    const GK = A2.gridKey(...A2.GRID.G);
    const lastOnPath = (run.path.length - 1) * clamp(pathK);
    return (cx, cy, key) => {
      if (A2.isWall(cx, cy)) return { look: "wall", o };
      const base = { o };
      const busy = !!cur && cur.key === key;
      if (key === SK || key === GK)
        return {
          ...base,
          look: "solid",
          tone: key === SK ? "blue" : "orange",
          text: key === SK ? "S" : "G",
          ring: busy ? "orange" : null,
          ringK: busy ? clamp(frac * 3) : 1,
          pulse: closedAt[key] === done - 1 ? V.flash(frac, 0, 0.5) : 0,
        };
      const txt = (v) => (nums ? v : undefined);
      if (onPath[key] !== undefined && onPath[key] <= lastOnPath + 1e-9 && pathK > 0)
        return {
          ...base,
          look: "solid",
          tone: "green",
          text: txt(run.fAt[key]),
          pulse: V.flash(lastOnPath - onPath[key], 0, 0.8) * (pathK < 1 ? 1 : 0),
        };
      if (busy)
        return { ...base, look: "solid", tone: "orange", text: txt(run.fAt[key]), s: 1 + 0.08 * V.flash(frac, 0, 1) };
      if (state.closed.includes(key))
        return {
          ...base,
          look: "soft",
          tone: "green",
          text: txt(run.fAt[key]),
          pulse: closedAt[key] === done - 1 ? V.flash(frac, 0, 0.6) : 0,
        };
      if (state.open[key]) return { ...base, look: "soft", tone: "purple", text: txt(state.open[key].f) };
      if (curOpen[key]) {
        const born = clamp((frac - 0.35) / 0.5); // the cells this expansion opens pop in during its second half
        return {
          ...base,
          look: "soft",
          tone: "purple",
          text: txt(curOpen[key].f),
          s: 0.7 + 0.3 * E.pop(born),
          o: o * clamp(born * 5),
          under: o, // the empty cell stays in place while the purple one grows in
        };
      }
      return base;
    };
  }

  // ---------- rooms list ----------
  function list(parent, opt = {}) {
    const { x = 0, y = 0, w = 260, head = "", headTone = "grey", keys = [], rowH = 46, pitch = 54, fs = 28 } = opt;
    const cx = x + w / 2;
    const headTag = A2.tag(parent, { x: cx, y: y + 23, text: head, tone: headTone, minW: w, fs });
    const rowsT = Object.fromEntries(keys.map((k) => [k, A2.tag(parent, { x: cx, y, text: k, minW: w - 40, fs })]));
    const slotY = (i) => y + 78 + i * pitch;
    function update(st = {}) {
      const k = clamp(dflt(st.k, 1));
      headTag.set({ s: 0.8 + 0.2 * E.pop(k), o: clamp(k * 4) });
      keys.forEach((key) => {
        const it = (st.items || {})[key];
        if (!it) return rowsT[key].set({ o: 0 });
        rowsT[key].set({
          text: it.text,
          tone: it.tone || "grey",
          solid: it.solid,
          strike: it.strike,
          y: slotY(dflt(it.slot, 0)),
          dx: it.dx,
          dy: it.dy,
          s: dflt(it.s, 1),
          o: dflt(it.o, 1),
        });
      });
    }
    return { update, slotY, slotX: cx, head: headTag, rowH };
  }

  // ---------- table ----------
  function table(parent, opt = {}) {
    const { x = 0, y = 0, cols = [100, 150], head = [], rows = [], rowH = 52, fs = 28 } = opt;
    const pad = 14;
    const [w, h] = [cols.reduce((a, b) => a + b, 0) + pad * 2, rowH * (rows.length + 1) + pad * 2];
    const colLeft = cols.map((_, j) => pad + cols.slice(0, j).reduce((a, b) => a + b, 0));
    const card = V.h("div", { class: "v-card plain c-grey", style: { ...abs(x, y, w, h) } });
    const mkRow = (cells, top, header) => {
      const bg = V.h("div", {
        style: {
          ...abs(6, top, w - 12, rowH),
          borderRadius: "16px",
          border: "3px solid transparent",
          boxSizing: "border-box",
        },
      });
      const els = cells.map((c, j) =>
        V.h("div", {
          text: String(c),
          style: {
            ...abs(colLeft[j], top, cols[j], rowH),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: `${fs}px`,
            fontWeight: "900",
            color: header ? "var(--text-dim)" : "var(--ink)",
          },
        }),
      );
      card.append(bg, ...els);
      return { bg, els, top };
    };
    mkRow(head, pad, true);
    const body = rows.map((r, i) => mkRow(r, pad + rowH * (i + 1), false));
    const rule = V.h("div", {
      style: { ...abs(pad, pad + rowH - 2, w - pad * 2, 3), background: "var(--line)", borderRadius: "2px" },
    });
    card.append(rule);
    parent.append(card);
    function update(st = {}) {
      const k = clamp(dflt(st.k, 1));
      body.forEach((row, i) => {
        const rs = (st.rows || [])[i] || {};
        const rk = clamp(dflt(rs.k, 1));
        const tn = rs.hl ? L5.tone(rs.hl) : null;
        row.bg.style.background = tn ? (rs.solid ? tn.c : tn.dim) : "transparent";
        row.bg.style.borderColor = tn ? (rs.solid ? tn.lip : tn.edge) : "transparent";
        row.els.forEach((e, j) => {
          const cs = ((st.cells || [])[i] || [])[j] || {};
          if (cs.text != null && e.textContent !== String(cs.text)) e.textContent = String(cs.text);
          e.style.color = cs.tone ? L5.tone(cs.tone).ink : tn && rs.solid ? tn.on : "var(--ink)";
          V.place(e, { y: (1 - rk) * 12, o: clamp(rk * 3) });
        });
        V.place(row.bg, { y: (1 - rk) * 12, o: clamp(rk * 3) });
      });
      V.place(card, { x: st.dx || 0, y: st.dy || 0, s: (0.85 + 0.15 * E.pop(k)) * 1, o: clamp(k * 4) * dflt(st.o, 1) });
    }
    return {
      el: card, update, w, h, x, y,
      rowY: (i) => y + pad + rowH * (i + 1) + rowH / 2,
      colX: (j) => x + colLeft[j] + cols[j] / 2,
    }; // prettier-ignore
  }

  // ---------- bar ----------
  const cls = (el, c) => el.className !== c && (el.className = c);
  function bar(parent, opt = {}) {
    const { x = 0, y = 0, h = 44, unit = 60, segs = [], fs = 28 } = opt;
    const total = segs.reduce((a, s) => a + s.v, 0);
    const clip = V.h("div", { style: { ...abs(x, y, 0, h + 8), overflow: "hidden" } });
    let at = 0;
    const els = segs.map((s) => {
      const e = V.h("div", {
        class: `v-tag solid c-${s.tone || "blue"}`,
        text: s.text == null ? "" : String(s.text),
        style: {
          ...abs(at * unit, 0, s.v * unit, h),
          padding: s.align ? "0 16px" : "0",
          borderRadius: `${f1(h * 0.3)}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: { left: "flex-start", right: "flex-end" }[s.align] || "center",
          fontSize: `${fs}px`,
          boxShadow: "0 5px 0 var(--c-lip)",
        },
      });
      at += s.v;
      clip.append(e);
      return e;
    });
    parent.append(clip);
    function update(st = {}) {
      const k = clamp(dflt(st.k, 1));
      clip.style.width = `${f1(total * unit * k + (k >= 1 ? 8 : 0))}px`;
      els.forEach((e, i) => cls(e, `v-tag solid c-${(st.tones || [])[i] || segs[i].tone || "blue"}`));
      V.show(clip, k > 0.001 ? dflt(st.o, 1) : 0);
    }
    return { el: clip, update, h, total, endX: x + total * unit, xAt: (v) => x + v * unit };
  }

  // ---------- pictograms ----------
  function mapIcon(x, y, size, tone = "blue") {
    const tn = L5.tone(tone);
    const [w, h] = [size, size * 0.78];
    const card = (dy, fill, stroke) =>
      V.s("rect", {
        x: f1(x - w / 2),
        y: f1(y - h / 2 + dy),
        width: f1(w),
        height: f1(h),
        rx: f1(size * 0.18),
        "stroke-width": 3,
        style: { fill, stroke },
      });
    const pts = [
      [-0.26, -0.12],
      [0.02, -0.22],
      [0.26, 0.04],
      [-0.06, 0.2],
    ].map(([a, b]) => [x + a * w, y + b * w]);
    const line = (p, q) =>
      V.s("path", {
        d: `M${f1(p[0])} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}`,
        "stroke-width": f1(size * 0.05),
        "stroke-linecap": "round",
        style: { stroke: tn.edge },
      });
    const dots = pts.map((p) =>
      V.s("circle", { cx: f1(p[0]), cy: f1(p[1]), r: f1(size * 0.075), style: { fill: tn.c } }),
    );
    return V.s(
      "g",
      {},
      card(size * 0.06, tn.edge, tn.edge),
      card(0, "var(--panel)", tn.edge),
      line(pts[0], pts[1]),
      line(pts[1], pts[2]),
      line(pts[2], pts[3]),
      line(pts[3], pts[0]),
      ...dots,
    );
  }
  function dot(x, y, r, tone = "blue") {
    const tn = L5.tone(tone);
    const c = (dy, fill) => V.s("circle", { cx: f1(x), cy: f1(y + dy), r: f1(r), style: { fill } });
    return V.s("g", {}, c(r * 0.25, tn.lip), c(0, tn.c));
  }

  function compass(x, y, r = 24, tone = "purple") {
    const tn = L5.tone(tone);
    const tri = (dir, fill) =>
      V.s("path", {
        d: `M ${f1(x + dir * r * 0.88)} ${f1(y)} L ${f1(x - dir * r * 0.1)} ${f1(y - r * 0.36)} L ${f1(x - dir * r * 0.1)} ${f1(y + r * 0.36)} Z`,
        style: { fill },
      });
    const dial = V.s(
      "g",
      {},
      V.s("circle", { cx: f1(x), cy: f1(y + 4), r: f1(r), style: { fill: tn.edge } }),
      V.s("circle", { cx: f1(x), cy: f1(y), r: f1(r), "stroke-width": 3, style: { fill: tn.dim, stroke: tn.edge } }),
    );
    const needle = V.s("g", {}, tri(-1, "var(--line-2)"), tri(1, tn.c), V.s("circle", { cx: f1(x), cy: f1(y), r: f1(r * 0.15), style: { fill: tn.on } }));
    return { g: V.s("g", {}, dial, needle), dial, needle };
  } // prettier-ignore

  Object.assign(A2, { grid, gridPaint, list, table, bar, mapIcon, dot, compass });
})();
