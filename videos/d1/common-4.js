/* Lecture 1 · Reliable, scalable and maintainable systems: the three bigger figures (VID.d1, short name D1). Needs l5/common.js
   and d1/common.js ... common-3.js loaded first. Positions are the parent's pixels (the stage is 936 x 640). EVERY CALL IS PURE.

   1. DISK FIELD  (scene 5: 10,000 disks as a square of tiny green dots, 100 columns x 100 rows; disk i = column i % 100, row i / 100)
        const f = D1.diskField(parent, {x, y, size: 400});   x, y = top-left of the square; pitch = size / 100
        f.update({o: 1, dead: [{i, k: 1, tone: "orange"}, ...], dim: 0})
            each dead disk gets a big solid marker with a ping ring: k 0..1 pops it (the ring expands during the first 40 %),
            tone "orange" a fault, "red" a failure, "green" a replacement; up to 14 markers; dim 0..1 fades the field to 25 %.
        f.at(i) -> {x, y} the centre of disk i in PARENT coordinates;  f.size, f.pitch, f.el
   2. DOT HISTOGRAM  (scene 7: the 100 response times of D1.PERF as dots that fall into 50 ms bins, two dots wide)
        const h = D1.dotsHist(parent, {x, y, w: 840, h: 260});   the baseline is 44 px above y + h (ticks 0 250 500 750 are below it)
        h.update({n, fall: 8, tone: (ms) => "blue", o: 1, ticks: 1})
            n = how many dots have started to fall (0..100 + fall; they arrive in D1.PERF.order); each dot takes `fall` units of n
            to drop in from above (default 8, so about eight are in the air at once); n = 100 + fall is the finished histogram;
            tone(ms) colours a dot by its response time (e.g. red above the 99th percentile); ticks fades the axis numbers
        h.xOf(ms) -> x of a response time in PARENT coordinates;  h.baseY;  h.topY (the top of the tallest stack);  h.dot (diameter)
        const m = D1.vline(parent, {x, y1, y2, tone, text, w: 6});   a marker line with a tag on top (text >= 28 px, centred on x)
        m.set({k: 0..1 (grows downward), tone, text, o, dy})   dy moves the tag along the line
   3. ARCHITECTURE  (scene 10: five services, four databases, the lines between them and an optional data-access layer; the
      stage-sized figure: services y 30-94, layer y 215-279, databases y 400-472; counters and tags go below y 500)
        const a = D1.arch(parent, {x: 0, y: 0});    a.svcMid(i) / a.dbMid(j) -> {x, y};  a.layerMid()
        a.update({k: 1, direct: 1, layer: 0, hot: 0, hotK: 0, lineK: 1, o: 1})
            k 0..1 pops the boxes in (0 hides them);  direct 0..1 opacity of the 20 direct lines (service i to database j);
            layer 0..1 brings in the purple "data-access layer" bar and its 9 lines (5 + 4);  lineK 0..1 draws the direct
            lines in;  hot 0..1 shows the change "replace Orders DB": the Orders DB box turns orange solid and every line that
            touches it turns orange and thick, and the boxes that must be edited get an orange ring (with the layer in place
            only the layer does);  hotK is the ring pop (0..1) if you want it later than the lines.
        returns {direct: visible direct lines (20 or 0), layered: 9 or 0, edit: boxes that need editing (5 direct, 1 layered)} */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { abs, f1, tn } = D1;

  // ---------- 1. disk field ----------
  function diskField(parent, o = {}) {
    const { x = 0, y = 0, size = 400 } = o;
    const n = 10000;
    const pitch = size / 100;
    const dot = pitch * 0.74;
    const svg = V.s("svg", {
      width: size,
      height: size,
      style: { position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px`, overflow: "visible" },
    });
    let d = "";
    for (let i = 0; i < n; i++)
      d += `M${f1((i % 100) * pitch + (pitch - dot) / 2)} ${f1(Math.floor(i / 100) * pitch + (pitch - dot) / 2)}h${f1(dot)}v${f1(dot)}h${f1(-dot)}z`;
    const base = V.s("path", { d, style: { fill: D1.tone("green").c, fillOpacity: "0.6" } });
    svg.append(base);
    const pool = Array.from({ length: 14 }, () => {
      const ring = V.s("circle", { r: 10, fill: "none", "stroke-width": 5 });
      const lip = V.s("circle", { r: 11 });
      const dotEl = V.s("circle", { r: 11, "stroke-width": 4 });
      const g = V.s("g", {}, ring, lip, dotEl);
      svg.append(g);
      return { g, ring, lip, dotEl };
    });
    parent.append(svg);
    const at = (i) => ({ x: x + ((i % 100) + 0.5) * pitch, y: y + (Math.floor(i / 100) + 0.5) * pitch });
    return {
      el: svg,
      size,
      pitch,
      at,
      update(u = {}) {
        const dead = u.dead || [];
        if (dead.length > pool.length) throw new Error("VID.d1.diskField: at most 14 dead markers");
        V.show(svg, u.o ?? 1);
        base.style.fillOpacity = String(0.6 - 0.35 * clamp(u.dim || 0));
        pool.forEach((p, j) => {
          const dd = dead[j];
          const k = dd ? clamp(dd.k ?? 1) : 0;
          if (k <= 0.001) return V.show(p.g, 0);
          V.show(p.g, 1);
          const c = D1.tone(tn(dd.tone || "orange"));
          const pt = { x: ((dd.i % 100) + 0.5) * pitch, y: (Math.floor(dd.i / 100) + 0.5) * pitch };
          p.lip.setAttribute("cx", f1(pt.x));
          p.lip.setAttribute("cy", f1(pt.y + 3));
          p.dotEl.setAttribute("cx", f1(pt.x));
          p.dotEl.setAttribute("cy", f1(pt.y));
          p.ring.setAttribute("cx", f1(pt.x));
          p.ring.setAttribute("cy", f1(pt.y));
          p.lip.style.fill = c.lip;
          p.dotEl.style.fill = c.c;
          p.dotEl.style.stroke = c.lip;
          p.ring.style.stroke = c.c;
          const ping = clamp(k / 0.4);
          p.ring.setAttribute("r", f1(10 + 26 * E.out(ping)));
          p.ring.style.opacity = String(ping < 1 ? 1 - ping : 0);
          const sc = 0.4 + 0.6 * E.pop(clamp(k / 0.35));
          p.dotEl.setAttribute("r", f1(11 * sc));
          p.lip.setAttribute("r", f1(11 * sc));
        });
      },
    };
  }

  // ---------- 2. dot histogram ----------
  function dotsHist(parent, o = {}) {
    const { x = 0, y = 0, w = 840, h = 260 } = o;
    const P = D1.PERF;
    const bw = w / P.bins.length;
    const dot = 22;
    const baseY = y + h - 44;
    const xOf = (ms) => x + (ms / P.bin) * bw;
    const svg = L5.svg(parent);
    svg.append(
      V.s("path", {
        d: `M ${f1(x)} ${f1(baseY)} L ${f1(x + w)} ${f1(baseY)}`,
        fill: "none",
        "stroke-width": 5,
        "stroke-linecap": "round",
        style: { stroke: "var(--line-2)" },
      }),
    );
    // final slot of every sample: its bin, filled two wide in the order the requests arrive
    const slot = new Array(100);
    const fill = P.bins.map(() => 0);
    P.order.forEach((s) => {
      const b = Math.floor(P.samples[s] / P.bin);
      const i = fill[b]++;
      slot[s] = { b, col: i % 2, row: Math.floor(i / 2) };
    });
    const fx = (s) => x + slot[s].b * bw + bw / 2 + (slot[s].col ? 1 : -1) * (dot / 2 + 0.5);
    const fy = (s) => baseY - 3 - dot / 2 - slot[s].row * (dot + 1);
    const circles = P.samples.map(() => {
      const lip = V.s("circle", { r: dot / 2 });
      const top = V.s("circle", { r: dot / 2 - 1, "stroke-width": 3 });
      const g = V.s("g", {}, lip, top);
      svg.append(g);
      return { g, lip, top };
    });
    const ticks = [0, 250, 500, 750].map((ms) =>
      D1.label(parent, { x: xOf(ms) - 50, y: baseY + 10, w: 100, text: String(ms) }),
    );
    const topRows = Math.max(...slot.map((s) => s.row)) + 1;
    return {
      xOf,
      baseY,
      topY: baseY - 3 - topRows * (dot + 1),
      dot,
      update(u = {}) {
        const n = u.n ?? 0;
        V.show(svg, u.o ?? 1);
        ticks.forEach((t) => t.set({ k: u.ticks ?? 1, o: u.o ?? 1 }));
        P.order.forEach((s, a) => {
          const q = clamp((n - a) / (u.fall ?? 8));
          const c = circles[s];
          if (q <= 0) return V.show(c.g, 0);
          V.show(c.g, 1);
          const col = D1.tone(tn(u.tone ? u.tone(P.samples[s]) : "blue"));
          c.lip.style.fill = col.lip;
          c.top.style.fill = col.c;
          c.top.style.stroke = col.lip;
          const [cx, cy] = [fx(s), fy(s) - (1 - q * q) * 240]; // falls from above, speeding up
          c.lip.setAttribute("cx", f1(cx));
          c.lip.setAttribute("cy", f1(cy + 2));
          c.top.setAttribute("cx", f1(cx));
          c.top.setAttribute("cy", f1(cy));
          c.g.style.opacity = String(clamp(q * 5));
        });
      },
    };
  }
  function vline(parent, o = {}) {
    const { x, y1, y2, w = 6 } = o;
    const svg = L5.svg(parent);
    const ln = svg.appendChild(
      V.s("line", {
        x1: f1(x),
        y1: f1(y1),
        x2: f1(x),
        y2: f1(y1),
        "stroke-width": f1(w),
        "stroke-linecap": "round",
        "stroke-dasharray": `${w * 2} ${w * 1.6}`,
      }),
    );
    const tg = D1.tag(parent, {
      x: x - D1.tagW(o.text || "") / 2,
      y: y1 - 62,
      text: o.text || "",
      tone: o.tone || "grey",
      solid: true,
    });
    return {
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        const tone = D1.tone(tn(st.tone || o.tone || "grey"));
        ln.style.stroke = tone.c;
        ln.setAttribute("y2", f1(y1 + (y2 - y1) * E.out(k)));
        V.show(ln, k > 0.01 ? (st.o ?? 1) : 0);
        tg.set({ text: st.text, tone: st.tone, k, o: st.o ?? 1, y: st.dy || 0 });
      },
    };
  }

  // ---------- 3. architecture ----------
  function arch(parent, o = {}) {
    const { x = 0, y = 0 } = o;
    const M = D1.MAINT;
    const GEO = { svc: { y: 30, h: 64, w: 164 }, layer: { y: 215, h: 64 }, db: { y: 400, h: 72, w: 190 } };
    const sx = (i) => i * ((936 - 5 * GEO.svc.w) / 4 + GEO.svc.w) + GEO.svc.w / 2;
    const dx = (j) => j * ((936 - 4 * GEO.db.w) / 3 + GEO.db.w) + GEO.db.w / 2;
    const root = V.h("div", { style: abs(x, y, 936, 640) });
    const svg = L5.svg(root);
    const sy = GEO.svc.y + GEO.svc.h;
    const ly = [GEO.layer.y, GEO.layer.y + GEO.layer.h];
    const mkLine = (p, q) =>
      svg.appendChild(
        V.s("line", { x1: f1(p[0]), y1: f1(p[1]), x2: f1(q[0]), y2: f1(q[1]), "stroke-linecap": "round" }),
      );
    const direct = M.edges.map(([s, d]) => ({ s, d, el: mkLine([sx(s), sy], [dx(d), GEO.db.y]) }));
    const lay = [
      ...M.services.map((_, s) => ({ s, d: -1, el: mkLine([sx(s), sy], [sx(s), ly[0]]) })),
      ...M.dbs.map((_, d) => ({ s: -1, d, el: mkLine([dx(d), ly[1]], [dx(d), GEO.db.y]) })),
    ];
    const bar = D1.card(root, {
      x: 20,
      y: GEO.layer.y,
      w: 896,
      h: GEO.layer.h,
      text: "data-access layer",
      tone: "purple",
      plain: false,
    });
    const svcs = M.services.map((t, i) =>
      D1.card(root, { x: sx(i) - GEO.svc.w / 2, y: GEO.svc.y, w: GEO.svc.w, h: GEO.svc.h, text: t }),
    );
    const dbs = M.dbs.map((t, j) =>
      D1.card(root, { x: dx(j) - GEO.db.w / 2, y: GEO.db.y, w: GEO.db.w, h: GEO.db.h, text: t.replace(" DB", "") }),
    );
    parent.append(root);
    const hotOf = (e, hot, layered) => e.d === M.hot && hot > 0.01;
    return {
      el: root,
      svcMid: (i) => ({ x: x + sx(i), y: y + GEO.svc.y + GEO.svc.h / 2 }),
      dbMid: (j) => ({ x: x + dx(j), y: y + GEO.db.y + GEO.db.h / 2 }),
      layerMid: () => ({ x: x + 468, y: y + GEO.layer.y + GEO.layer.h / 2 }),
      update(u = {}) {
        const { k = 1, direct: dOp = 1, layer = 0, hot = 0, lineK = 1 } = u;
        const hotK = u.hotK ?? hot;
        V.show(root, u.o ?? 1);
        const grey = D1.tone("grey");
        const orange = D1.tone("orange");
        direct.forEach((e, n) => {
          const on = hotOf(e, hot, false);
          const q = clamp(lineK * 1.6 - (n % 5) * 0.12 - Math.floor(n / 5) * 0.05);
          const [x1, y1, x2, y2] = ["x1", "y1", "x2", "y2"].map((a) => +e.el.getAttribute(a));
          e.el.setAttribute("stroke-width", on ? "9" : "3");
          e.el.style.stroke = on ? orange.c : grey.edge;
          e.el.setAttribute("stroke-dasharray", `${f1(Math.hypot(x2 - x1, y2 - y1) * q)} 2000`);
          V.show(e.el, dOp * (1 - layer) > 0.01 && k > 0 ? dOp * (1 - layer) * (q > 0.01 ? 1 : 0) : 0);
        });
        lay.forEach((e) => {
          const on = hotOf(e, hot, true);
          e.el.setAttribute("stroke-width", on ? "9" : "3");
          e.el.style.stroke = on ? orange.c : D1.tone("purple").c;
          V.show(e.el, layer);
        });
        const hotRing = clamp(hotK);
        svcs.forEach((s, i) => {
          const edit = hot > 0.01 && layer < 0.5 && M.edges.some(([a, d]) => a === i && d === M.hot);
          s.set({ k, tone: edit ? "orange" : "grey", plain: !edit, s: edit ? 1 + 0.06 * E.pop(hotRing) : 1 });
        });
        dbs.forEach((d, j) => {
          const edit = hot > 0.01 && j === M.hot;
          d.set({ k, tone: edit ? "orange" : "grey", plain: !edit, s: edit ? 1 + 0.08 * E.pop(hotRing) : 1 });
        });
        if (hot > 0.01 && layer >= 0.5)
          bar.set({ k: layer, tone: "orange", plain: false, s: 1 + 0.05 * E.pop(hotRing) });
        const lv = layer >= 0.5;
        return { direct: lv ? 0 : M.direct, layered: lv ? M.layered : 0, edit: lv ? M.editLayer : M.editDirect };
      },
    };
  }

  Object.assign(D1, { diskField, dotsHist, vline, arch });
})();
