/* Lecture 6 · Genetic programming: the drawing half of the tree toolkit (L.tree, L.plot, L.tick/cross/arrow/scissors).
   The API is documented at the top of common.js; this file must load right after it (see videos/lecture-6.html). */
(function () {
  const V = window.VID;
  const L = V.l6;
  const { s, clamp, ramp, ease } = V;
  const { css, f1, tone, nextId, tileW, pillW } = L.$;
  const { walk, ensureIds, size, opOf, linspace, fmtVal, fn, layer } = L;
  // ================= tree drawing =================
  function tree(parent, opts) {
    const lay = layer(parent);
    const box = { x: opts.x ?? 0, y: opts.y ?? 0, w: opts.w ?? V.STAGE.w, h: opts.h ?? V.STAGE.h };
    const tile = opts.node ?? 56;
    const room = opts.room ?? tile * 0.8; // headroom above the root for its value badge
    const root = ensureIds(opts.root);
    const baseO = opts.hidden ? 0 : 1;
    const nodes = [];
    const byId = {};
    walk(root, (n, p, d) => {
      if (byId[n.id]) throw new Error(`VID.l6.tree: duplicate node id "${n.id}"`);
      const kind = n.kids.length ? "fn" : "term";
      nodes.push(
        (byId[n.id] = {
          id: n.id,
          label: n.label,
          op: opOf(n.label),
          kind,
          depth: d,
          parent: p ? p.id : null,
          kids: n.kids.map((k) => k.id),
          size: size(n),
          lit: n,
          st: null,
        }),
      );
    });
    const need = (id) => {
      if (!byId[id]) throw new Error(`VID.l6.tree: no node "${id}" (known: ${nodes.map((n) => n.id).join(", ")})`);
      return byId[id];
    };
    // tidy layout in design units: children side by side, sub-trees pushed apart row by row, parent centred over its children
    const gapX = tile * 0.5;
    nodes.forEach((n) => (n.w = tileW(n.label, tile)));
    const arrange = (n) => {
      if (!n.kids.length) return { lo: [-n.w / 2], hi: [n.w / 2] };
      const offs = [];
      const loAcc = [];
      const hiAcc = [];
      n.kids.forEach((id, i) => {
        const part = arrange(byId[id]);
        let off = 0;
        if (i) {
          off = -Infinity;
          part.lo.forEach((lo, d) => d < hiAcc.length && (off = Math.max(off, hiAcc[d] + gapX - lo)));
        }
        offs.push(off);
        part.lo.forEach((lo, d) => (loAcc[d] = Math.min(loAcc[d] ?? Infinity, off + lo)));
        part.hi.forEach((hi, d) => (hiAcc[d] = Math.max(hiAcc[d] ?? -Infinity, off + hi)));
      });
      const mid = (offs[0] + offs[offs.length - 1]) / 2;
      n.kids.forEach((id, i) => (byId[id].rx = offs[i] - mid));
      return { lo: [-n.w / 2, ...loAcc.map((v) => v - mid)], hi: [n.w / 2, ...hiAcc.map((v) => v - mid)] };
    };
    arrange(nodes[0]);
    nodes.forEach((n) => (n.ax = n.parent ? byId[n.parent].ax + n.rx : 0));
    const minL = Math.min(...nodes.map((n) => n.ax - n.w / 2));
    const maxR = Math.max(...nodes.map((n) => n.ax + n.w / 2));
    const pitch = tile * (opts.rows ?? 2);
    const lipPx = Math.max(3, Math.round(tile * 0.1));
    const levels = Math.max(...nodes.map((n) => n.depth)) + 1;
    const need1 = room + (levels - 1) * pitch + tile + lipPx;
    const f = Math.min(opts.grow ?? 1, box.w / (maxR - minL), box.h / need1);
    const used = f * need1;
    const top = box.y + (opts.valign === "middle" ? (box.h - used) / 2 : 0);
    nodes.forEach((n) => {
      n.cx = box.x + box.w / 2 + f * (n.ax - (minL + maxR) / 2);
      n.cy = top + f * (room + tile / 2 + n.depth * pitch);
      n.w *= f;
      n.h = tile * f;
      n.tile = L.tile(lay, n.label, { size: tile * f, tone: n.kind === "fn" ? "purple" : "blue" });
      if (n.parent)
        n.edge = lay.edges.appendChild(
          s("path", { fill: "none", pathLength: 1, "stroke-width": Math.max(3.5, tile * f * 0.09) }),
        );
    });

    const api = {
      nodes,
      scale: f,
      tileSize: tile * f,
      layer: lay,
      node: need,
      pos: (id) => ({ x: need(id).cx, y: need(id).cy }),
      sub(id) {
        const out = [];
        const rec = (k) => (out.push(k), need(k).kids.forEach(rec));
        rec(id);
        return out;
      },
      all: () => nodes.map((n) => n.id),
      leaves: () => nodes.filter((n) => !n.kids.length).map((n) => n.id),
      size: (id) => need(id).size,
      row: (d) => top + f * (room + tile / 2 + d * pitch),
      anchor: (id) => [need(id).cx, need(id).cy + need(id).h / 2],
      deltaTo: (other, id) =>
        other.nodes.some((n) => n.id === id)
          ? { dx: other.node(id).cx - need(id).cx, dy: other.node(id).cy - need(id).cy }
          : null,
      set(ids, props) {
        for (const id of [].concat(ids)) {
          const n = need(id);
          n.st = { ...n.st, ...props };
        }
        return api;
      },
      value: (id, text, k = 1, tn = "green") => api.set(id, { val: { text, k, tone: tn } }),
      edgeOpacity: (id, o) => api.set(id, { eo: o }),
      reveal(ids, k) {
        for (const id of [].concat(ids)) {
          api.set(id, {
            ek: ramp(k, 0, 0.5, ease.out),
            o: ramp(k, 0.3, 0.5, ease.lin),
            s: ease.pop(ramp(k, 0.35, 1, ease.lin)),
          });
        }
        return api;
      },
      reset: () => nodes.forEach((n) => (n.st = null)),
      draw() {
        nodes.forEach((n) => {
          const st = n.st || {};
          n.cur = { x: n.cx + (st.dx || 0), y: n.cy + (st.dy || 0), s: st.s ?? 1, o: st.o ?? baseO };
          n.tc = st.tone || n.lit.tone || null;
        });
        nodes.forEach((n) => {
          const st = n.st || {};
          const c = n.cur;
          n.tile.apply({
            x: c.x,
            y: c.y,
            s: c.s,
            r: st.r,
            o: c.o,
            tone: n.tc || undefined,
            look: st.look,
            pulse: st.pulse,
            halo: st.halo,
            label: st.label,
          });
          const up = !!st.lift;
          const tg = up ? lay.nodesTop : lay.nodes;
          if (n.tile.g.parentNode !== tg) tg.append(n.tile.g);
          if (n.parent) edge(n, byId[n.parent], st, up);
          badge(n, st);
          n.st = null;
        });
      },
    };
    function edge(n, p, st, up) {
      const at = st.attach;
      const x1 = at ? at[0] : p.cur.x;
      const y1 = at ? at[1] : p.cur.y + (p.h / 2) * p.cur.s;
      const x2 = n.cur.x;
      const y2 = n.cur.y - (n.h / 2) * n.cur.s;
      const ym = (y1 + y2) / 2;
      const e = n.edge;
      e.setAttribute("d", `M${f1(x1)} ${f1(y1)}C${f1(x1)} ${f1(ym)} ${f1(x2)} ${f1(ym)} ${f1(x2)} ${f1(y2)}`);
      const et = st.etone || (n.tc && n.tc === p.tc && n.tc !== "grey" ? n.tc : null);
      e.setAttribute("class", et ? `c-${tone(et)}` : "");
      css(e, { stroke: et ? "var(--c)" : "var(--line-2)", strokeLinecap: "butt" });
      const grow = st.ek != null;
      const o = (grow ? p.cur.o : Math.min(p.cur.o, n.cur.o)) * (st.eo ?? 1);
      const k = grow ? clamp(st.ek) : 1;
      if (k < 1) e.setAttribute("stroke-dasharray", `${k} 2`);
      else e.removeAttribute("stroke-dasharray");
      V.show(e, k <= 0.001 ? 0 : o);
      const tg = up ? lay.edgesTop : lay.edges;
      if (e.parentNode !== tg) tg.append(e);
    }
    function badge(n, st) {
      if (!st.val && !n.pill) return;
      if (!n.pill) n.pill = L.pill(lay, "", { o: 0 });
      const v = st.val;
      if (!v) return n.pill.apply({ o: 0 });
      const c = n.cur;
      const dir = n.parent ? Math.sign(c.x - byId[n.parent].cur.x) || 1 : 0;
      const w = pillW(v.text, 28);
      n.pill.apply({
        x: c.x + dir * (w / 2 + 5),
        y: c.y - (n.h / 2) * c.s - 26 - 4 * (1 - v.k),
        s: ease.pop(clamp(v.k)),
        o: c.o * Math.min(1, v.k * 4),
        text: v.text,
        tone: v.tone,
      });
    }
    return api;
  }

  // ================= 4. plot and pictograms =================
  function plot(parent, o = {}) {
    const { x = 0, y = 0, w = 420, h = 320, xmin = -1, xmax = 1, ymin = 0, ymax = 3 } = o;
    const pl = o.yticks ? 70 : 22;
    const pb = o.xticks ? 52 : 22;
    const pt = 22;
    const pr = 26;
    const cw = w - pl - pr;
    const ch = h - pt - pb;
    const loc = (vx, vy) => [pl + ((vx - xmin) / (xmax - xmin)) * cw, pt + (1 - (vy - ymin) / (ymax - ymin)) * ch];
    const svg = s("svg", { width: w, height: h, viewBox: `0 0 ${w} ${h}` });
    css(svg, { position: "absolute", left: `${x}px`, top: `${y}px`, overflow: "visible" });
    const clipId = `l6clip${nextId()}`;
    const line = (a, b, st) => s("path", { d: `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`, style: st });
    const stroke = (col, wd) => ({ stroke: col, strokeWidth: `${wd}px`, fill: "none" });
    const label = (text, px, py, anchor) => {
      const t = s("text", { x: f1(px), y: f1(py), "text-anchor": anchor }, text);
      return css(t, { fontSize: "28px", fontWeight: "800", fill: "var(--text-dim)" });
    };
    if (o.frame !== false) {
      const card = (dy, st) => s("rect", { x: 1.5, y: 1.5 + dy, width: w - 3, height: h - 3, rx: 24, style: st });
      svg.append(
        card(6, { fill: "var(--line-2)" }),
        card(0, { fill: "var(--panel)", stroke: "var(--line-2)", strokeWidth: "3px" }),
      );
    }
    const grid = s("g");
    const gx =
      o.xticks || (o.grid ? linspace(Math.ceil(xmin), Math.floor(xmax), Math.floor(xmax) - Math.ceil(xmin) + 1) : []);
    const gy =
      o.yticks || (o.grid ? linspace(Math.ceil(ymin), Math.floor(ymax), Math.floor(ymax) - Math.ceil(ymin) + 1) : []);
    if (o.grid) {
      gx.forEach((v) => grid.append(line(loc(v, ymin), loc(v, ymax), stroke("var(--line)", 2))));
      gy.forEach((v) => grid.append(line(loc(xmin, v), loc(xmax, v), stroke("var(--line)", 2))));
    }
    (o.xticks || []).forEach((v) => grid.append(label(fmtVal(v), loc(v, ymin)[0], loc(v, ymin)[1] + 36, "middle")));
    (o.yticks || []).forEach((v) => grid.append(label(fmtVal(v), pl - 14, loc(xmin, v)[1] + 10, "end")));
    const ax = ymin <= 0 && ymax >= 0 ? 0 : ymin;
    const ay = xmin <= 0 && xmax >= 0 ? 0 : xmin;
    const axes = s(
      "g",
      {},
      line(loc(xmin, ax), loc(xmax, ax), stroke("var(--text-faint)", 3)),
      line(loc(ay, ymin), loc(ay, ymax), stroke("var(--text-faint)", 3)),
    );
    const clip = s("clipPath", { id: clipId }, s("rect", { x: pl - 6, y: pt - 6, width: cw + 12, height: ch + 12 }));
    const gaps = s("g", { "clip-path": `url(#${clipId})` });
    const curves = s("g", { "clip-path": `url(#${clipId})` });
    const dots = s("g");
    svg.append(grid, s("defs", {}, clip), gaps, axes, curves, dots);
    parent.append(svg);
    const span = ymax - ymin;
    const toPath = (fa, fb, k) => {
      const end = xmin + (xmax - xmin) * clamp(k);
      const xs = linspace(xmin, end, Math.max(2, Math.round(110 * clamp(k) + 2)));
      const pts = (f) => xs.map((vx) => [vx, f(vx)]);
      const cmd = (list, first) => {
        let d = "";
        let pen = false;
        list.forEach(([vx, vy]) => {
          if (!Number.isFinite(vy)) return void (pen = false);
          const [px, py] = loc(vx, clamp(vy, ymin - 20 * span, ymax + 20 * span));
          d += `${pen || !first ? "L" : "M"}${f1(px)} ${f1(py)}`;
          pen = true;
        });
        return d;
      };
      return fb ? `${cmd(pts(fa), true)}${cmd(pts(fb).reverse(), false)}Z` : cmd(pts(fa), true);
    };
    const curve = (f0, tn = "green", o0 = 1, op = {}) => {
      const path = s("path", { fill: "none", "stroke-width": op.w || 7, "stroke-linejoin": "round" });
      css(path, { stroke: "var(--c)", strokeLinecap: op.dash ? "butt" : "round" });
      if (op.dash) path.setAttribute("stroke-dasharray", "16 12");
      curves.append(path);
      let cur = f0;
      const c = {
        el: path,
        set({ fn: nf, o: op2 = 1, k = 1, tone: t2 } = {}) {
          if (nf) cur = nf;
          path.setAttribute("class", `c-${tone(t2 || tn)}`);
          path.setAttribute("d", toPath(fn(cur), null, k));
          V.show(path, k <= 0.001 ? 0 : op2);
        },
      };
      c.set({ o: o0 });
      return c;
    };
    const gap = (fa0, fb0, tn = "red", o0 = 1) => {
      const poly = s("path", { "fill-opacity": 0.4 });
      css(poly, { fill: "var(--c)" });
      gaps.append(poly);
      const g = {
        el: poly,
        set({ o: op2 = 1, k = 1, tone: t2 } = {}) {
          poly.setAttribute("class", `c-${tone(t2 || tn)}`);
          poly.setAttribute("d", toPath(fn(fa0), fn(fb0), k));
          V.show(poly, k <= 0.001 ? 0 : op2);
        },
      };
      g.set({ o: o0 });
      return g;
    };
    const points = (data, tn = "blue", o0 = 1) => {
      const els = data.map(([vx, vy]) => {
        const [cx, cy] = loc(vx, vy);
        const dot = s("circle", { cx: f1(cx), cy: f1(cy), r: 10, "stroke-width": 3 });
        css(dot, { fill: "var(--c)", stroke: "var(--c-lip)" });
        dots.append(dot);
        return dot;
      });
      const p = {
        els,
        set({ o: op2 = 1, k = 1, tone: t2 } = {}) {
          els.forEach((e, i) => {
            e.setAttribute("class", `c-${tone(t2 || tn)}`);
            const ki = clamp(k * (els.length + 1) - i);
            V.place(e, { s: ease.pop(ki), o: ki > 0 ? op2 : 0 });
          });
        },
      };
      p.set({ o: o0 });
      return p;
    };
    return {
      svg,
      toPx: (vx, vy) => loc(vx, vy).map((v, i) => v + (i ? y : x)),
      curve,
      gap,
      points,
      area: { x: x + pl, y: y + pt, w: cw, h: ch },
    };
  }

  function pict(draw, sz, tn, on) {
    const svg = s("svg", { width: sz, height: sz, viewBox: "0 0 48 48", class: `c-${tone(tn)}` });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const col = on ? "var(--c-on)" : "var(--c)";
    const path = (d, wd = 7) => {
      const p = s("path", {
        d,
        fill: "none",
        "stroke-width": wd,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      });
      return css(p, { stroke: col });
    };
    svg.append(...draw(path, col));
    return svg;
  }
  const tick = (sz = 48, tn = "green", on) => pict((p) => [p("M9 26L20 37L40 13")], sz, tn, on);
  const cross = (sz = 48, tn = "red", on) => pict((p) => [p("M12 12L36 36M36 12L12 36")], sz, tn, on);
  const arrow = (sz = 48, tn = "grey", on) => pict((p) => [p("M7 24H39M27 11L40 24L27 37")], sz, tn, on);
  function scissors(sz = 56, tn = "orange", on) {
    const arms = [];
    const svg = pict(
      (p, col) => {
        for (const dy of [6, -6]) {
          // a blade through the pivot (24, 24) and a bent handle ending in a ring; the second arm is the mirror image
          const ring = s("circle", { cx: 8, cy: 24 + dy, r: 5, fill: "none", "stroke-width": 4.5 });
          css(ring, { stroke: col });
          arms.push(s("g", {}, p("M24 24H46", 6), p(`M24 24L8 ${24 + dy}`, 5), ring));
        }
        return arms;
      },
      sz,
      tn,
      on,
    );
    svg.snip = (k) => {
      const a = 26 - 23 * clamp(k);
      arms[0].setAttribute("transform", `rotate(${f1(-a)} 24 24)`);
      arms[1].setAttribute("transform", `rotate(${f1(a)} 24 24)`);
    };
    svg.snip(0);
    return svg;
  }

  Object.assign(L, { tree, plot, tick, cross, arrow, scissors });
})();
