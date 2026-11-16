/* Lecture 13 · Multi-objective evolutionary algorithms: the objective-space plot (VID.l13, short name L13). Needs
   l5/common.js, l13/common.js and l13/common-2.js first. EVERY CALL IS PURE: call update() each frame with everything you
   want to see; anything left out is hidden.

   const pl = L13.plot(parent, {x, y, w, h, xr: [x0, x1], yr: [y0, y1], xt: [ticks], yt: [ticks], xl: "cost (£m)",
                                yl: "power (MW)", dots: 12, lines: 5, boxes: 3, links: 6});
     A panel with a lip; data x across, data y up. Axis titles sit bottom-right (xl) and top-left (yl), all text 28 px.
     pl.pt([vx, vy]) -> [px, py] in PARENT px;  pl.ps([vx, vy]) -> [px, py] in pl.svg px;  pl.el, pl.svg (add your own pieces)
     pl.update({
       k: 1,                                   // 0..1 pops the panel in
       axes: 1,                                // 0..1 fades in the ticks and axis titles
       dots: [{at: [vx, vy], tone: "blue", k: 1, o: 1, s: 1, r: 14, lab: "A", ldx: 18, ldy: -16, ring: false, cross: 0}],
             // lab = a label 28 px beside the dot (ldx/ldy offset of its left baseline from the dot centre, ldx < 0 = right
             //       aligned); ring = a dark outline ring; cross 0..1 draws a red cross over the dot
       lines: [{pts: [[vx, vy], ...], tone: "green", k: 1, o: 1, w: 6, dash: false}],   // k draws it on from the first point
       boxes: [{a: [vx, vy], b: [vx, vy], tone: "green", k: 1, o: 1, dash: true}],     // a filled (dim) rectangle a..b
       links: [{a: [vx, vy], b: [vx, vy], tone: "grey", k: 1, o: 1}],                   // thin dashed connectors
     }) */
(function () {
  const V = window.VID;
  const L13 = V.l13;
  const { clamp, ease: E } = V;
  const S = (n, a) => V.s(n, a);
  const f1 = (n) => n.toFixed(1);

  function plot(parent, o = {}) {
    const { x = 12, y = 12, w = 600, h = 600, xr, yr, xt = [], yt = [] } = o;
    const pad = { l: 78, r: 26, t: 68, b: 74 };
    const X = (v) => pad.l + ((v - xr[0]) / (xr[1] - xr[0])) * (w - pad.l - pad.r);
    const Y = (v) => h - pad.b - ((v - yr[0]) / (yr[1] - yr[0])) * (h - pad.t - pad.b);
    const ps = ([a, b]) => [X(a), Y(b)];
    const pt = (q) => {
      const [a, b] = ps(q);
      return [x + a, y + b];
    };
    const el = V.h("div", {
      style: { position: "absolute", left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` },
    });
    const svg = S("svg", {
      width: w,
      height: h + 8,
      style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
    });
    el.append(svg);
    parent.append(el);
    const txt = (tx, ty, text, anchor = "middle") => {
      const t = S("text", { x: f1(tx), y: f1(ty), "text-anchor": anchor });
      t.textContent = text;
      t.style.font = "800 28px Nunito, sans-serif";
      t.style.fill = "var(--text-dim)";
      t.style.stroke = "none";
      return t;
    };
    svg.append(
      S("rect", { x: 0, y: 6, width: w, height: h, rx: 22, style: { fill: "var(--line-2)" } }),
      S("rect", { x: 0, y: 0, width: w, height: h, rx: 22, style: { fill: "var(--panel)" } }),
    );
    const axes = svg.appendChild(S("g", {}));
    xt.forEach((v) => {
      axes.append(S("line", { x1: f1(X(v)), y1: pad.t, x2: f1(X(v)), y2: h - pad.b, "stroke-width": 2 }));
      axes.append(txt(X(v), h - pad.b + 34, String(v)));
    });
    yt.forEach((v) => {
      axes.append(S("line", { x1: pad.l, y1: f1(Y(v)), x2: w - pad.r, y2: f1(Y(v)), "stroke-width": 2 }));
      axes.append(txt(pad.l - 12, Y(v) + 10, String(v), "end"));
    });
    axes.style.stroke = "var(--line)";
    const ax = axes.appendChild(
      S("path", { d: `M${pad.l} ${pad.t - 10} V${h - pad.b} H${w - pad.r + 6}`, fill: "none", "stroke-width": 4 }),
    );
    ax.style.stroke = "var(--text-dim)";
    if (o.xl) axes.append(txt(w - pad.r, h - 16, o.xl, "end"));
    if (o.yl) axes.append(txt(pad.l - 50, pad.t - 30, o.yl, "start"));
    const pool = (n, make) => Array.from({ length: n }, () => svg.appendChild(make()));
    const boxes = pool(o.boxes ?? 3, () => S("rect", { "stroke-width": 3, rx: 6 }));
    const links = pool(o.links ?? 6, () =>
      S("line", { "stroke-width": 3, "stroke-dasharray": "7 6", "stroke-linecap": "round" }),
    );
    const lines = pool(o.lines ?? 5, () =>
      S("polyline", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }),
    );
    const dots = pool(o.dots ?? 12, () => {
      const g = S("g", {});
      g.append(
        S("circle", { r: 14, "stroke-width": 3 }),
        S("circle", { r: 22, fill: "none", "stroke-width": 4 }),
        S("path", { fill: "none", "stroke-width": 6, "stroke-linecap": "round" }),
      );
      const t = g.appendChild(S("text", {}));
      t.style.font = "900 28px Nunito, sans-serif";
      return g;
    });
    const hide = (e) => e.setAttribute("visibility", "hidden");
    const showEl = (e, op) => {
      e.setAttribute("visibility", op > 0.002 ? "visible" : "hidden");
      e.setAttribute("opacity", clamp(op).toFixed(3));
    };

    function update(st = {}) {
      const k = clamp(st.k ?? 1);
      V.place(el, { s: 0.94 + 0.06 * E.out(k), o: k });
      axes.setAttribute("opacity", clamp(st.axes ?? 1).toFixed(3));
      boxes.forEach((r, i) => {
        const b = (st.boxes || [])[i];
        if (!b) return hide(r);
        const [ax0, ay0] = ps(b.a);
        const [bx0, by0] = ps(b.b);
        const kk = E.out(clamp(b.k ?? 1));
        const bx = ax0 + (bx0 - ax0) * kk;
        const by = ay0 + (by0 - ay0) * kk;
        const t = L13.tone(b.tone || "green");
        r.setAttribute("x", f1(Math.min(ax0, bx)));
        r.setAttribute("y", f1(Math.min(ay0, by)));
        r.setAttribute("width", f1(Math.abs(bx - ax0)));
        r.setAttribute("height", f1(Math.abs(by - ay0)));
        r.setAttribute("stroke-dasharray", b.dash === false ? "none" : "10 7");
        r.style.fill = t.dim;
        r.style.stroke = t.c;
        showEl(r, (b.o ?? 1) * Math.min(1, (b.k ?? 1) * 5));
      });
      links.forEach((l, i) => {
        const q = (st.links || [])[i];
        if (!q) return hide(l);
        const [ax0, ay0] = ps(q.a);
        const [bx0, by0] = ps(q.b);
        const kk = clamp(q.k ?? 1);
        l.setAttribute("x1", f1(ax0));
        l.setAttribute("y1", f1(ay0));
        l.setAttribute("x2", f1(ax0 + (bx0 - ax0) * kk));
        l.setAttribute("y2", f1(ay0 + (by0 - ay0) * kk));
        l.style.stroke = L13.tone(q.tone || "grey").c;
        showEl(l, (q.o ?? 1) * (kk > 0 ? 1 : 0));
      });
      lines.forEach((pl, i) => {
        const q = (st.lines || [])[i];
        if (!q || q.pts.length < 2) return hide(pl);
        const P = q.pts.map(ps);
        const seg = P.slice(1).map((p, j) => Math.hypot(p[0] - P[j][0], p[1] - P[j][1]));
        const total = seg.reduce((a, b) => a + b, 0);
        let left = total * clamp(q.k ?? 1);
        const out = [P[0]];
        for (let j = 0; j < seg.length && left > 0; j++) {
          const f = Math.min(1, left / seg[j]);
          out.push([P[j][0] + (P[j + 1][0] - P[j][0]) * f, P[j][1] + (P[j + 1][1] - P[j][1]) * f]);
          left -= seg[j];
        }
        pl.setAttribute("points", out.map((p) => `${f1(p[0])},${f1(p[1])}`).join(" "));
        pl.setAttribute("stroke-width", q.w ?? 6);
        pl.setAttribute("stroke-dasharray", q.dash ? "12 9" : "none");
        pl.style.stroke = L13.tone(q.tone || "green").c;
        showEl(pl, (q.o ?? 1) * ((q.k ?? 1) > 0 ? 1 : 0));
      });
      dots.forEach((g, i) => {
        const d = (st.dots || [])[i];
        if (!d) return hide(g);
        const [px, py] = ps(d.at);
        const t = L13.tone(d.tone || "blue");
        const [c, ring, cross, lab] = g.children;
        const kk = clamp(d.k ?? 1);
        const r = d.r ?? 14;
        c.setAttribute("r", r);
        c.style.fill = t.c;
        c.style.stroke = t.lip;
        ring.setAttribute("r", r + 8);
        ring.style.stroke = "var(--text)";
        ring.setAttribute("visibility", d.ring ? "visible" : "hidden");
        const ck = clamp(d.cross ?? 0);
        const q = r + 4;
        cross.setAttribute(
          "d",
          `M${-q} ${-q} L${f1(-q + 2 * q * Math.min(1, ck * 2))} ${f1(-q + 2 * q * Math.min(1, ck * 2))}` +
            (ck > 0.5 ? ` M${q} ${-q} L${f1(q - 2 * q * (ck * 2 - 1))} ${f1(-q + 2 * q * (ck * 2 - 1))}` : ""),
        );
        cross.style.stroke = L13.tone("red").ink;
        cross.setAttribute("visibility", ck > 0 ? "visible" : "hidden");
        const ldx = d.ldx ?? 18;
        lab.textContent = d.lab || "";
        lab.setAttribute("x", f1(ldx < 0 ? -18 + ldx + 18 : ldx));
        lab.setAttribute("y", f1(d.ldy ?? -16));
        lab.setAttribute("text-anchor", ldx < 0 ? "end" : "start");
        lab.style.fill = t.ink;
        g.setAttribute(
          "transform",
          `translate(${f1(px)} ${f1(py)}) scale(${((d.s ?? 1) * (0.6 + 0.4 * E.pop(kk)) || 0.001).toFixed(3)})`,
        );
        showEl(g, (d.o ?? 1) * Math.min(1, kk * 4));
      });
    }
    return { el, svg, pt, ps, update, X, Y };
  }
  L13.plot = plot;
})();
