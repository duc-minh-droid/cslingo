/* Lecture 12 · Particle swarm optimisation: the figures (VID.l12, short name L12). Needs l5/common.js, l12/common.js and
   l12/common-2.js first. EVERY CALL IS PURE: call update()/set() each frame with everything you want to see; anything left out
   is hidden or falls back to its default; nothing is remembered between frames.

   1. THE SCENT MAP  (lesson 12.1's 10 x 10 odour field, the same in every scene; map units, y UP, origin bottom-left)
        const map = L12.field(parent, {x, y, size: 600, cells: 25, view: [0, 0, 10, 10], dots: 14, rings: 14, ghosts: 40,
                                       vecs: 6, tails: 14});
          x, y = top-left of the square in parent px; size = its side in px; cells = heat cells per side; view = the window of
          the map to show [x0, y0, x1, y1] (square, map units: [4, 2, 10, 8] zooms on the food side); the other options size the
          element pools (how many of each thing one frame can show).
        map.pt([mx, my]) -> [px, py] in PARENT px (to place tags, chips or your own svg next to a map point);  map.s = px per map
          unit;  map.el (the root div: V.place / V.show it);  map.svg (its svg: put your own L12.arrow / L12.star here and use
          map.ps([mx, my]) -> [px, py] in the map svg's own px)
        map.update({
          k: 1,            // 0..1 pops the whole map in (scale 0.94 -> 1 and fade)
          heat: 1,         // 0..1 strength of the green scent cells (0 = a plain panel: "nobody sees the map")
          grid: 0,         // 0..1 faint grid lines at every whole map unit (for reading coordinates)
          dots: [{x: [mx, my], tone: "blue", r: 13, o: 1, s: 1, focus: false}],  particles (focus = thick dark outline)
          tails: [{pts: [[mx, my], ...], tone: "blue", o: 0.5, w: 5}],      faint paths (L12.trail gives the points)
          rings: [{x: [mx, my], tone: "purple", r: 20, k: 1, o: 1, dash: false}],  hollow rings (a personal best p)
          star: {x: [mx, my], k: 1, o: 1, size: 44, tone: "orange"} | null,  the swarm best g
          ghosts: [{x: [mx, my], tone: "blue", r: 8, o: 0.6, k: 1}],          small hollow dots (other possible landings)
          vecs: [{a: [mx, my], b: [mx, my], tone: "grey", k: 1, w: 7, head: 20, dash: false, o: 1}],  vector arrows in map units
        })
        Everything inside the map is clipped to the square; vecs and the star are not (they may poke out a little).

   2. NUMBER LINE  (the 1-D worked example of lesson 12.3)
        const nl = L12.numLine(parent, {x, y, w, min: 0, max: 10, fs: 28});  the axis runs from x to x + w at height y (parent px),
          a tick and a number at every whole value. nl.px(v) -> parent x of value v;  nl.y;  nl.set({k: 1, o: 1}) pops it in.

   3. CHANCE BAR  (lesson 12.5: a velocity read as the chance of a 1, 0 on the left, 1 on the right)
        const bar = L12.prob(parent, {x, y, w: 600, h: 56});
        bar.set({k: 1, segs: [{from: 0, to: 0.5, tone: "blue", solid: true}], marker: 0.55 | null, markerK: 1,
                 markerTone: "grey", ends: true (the 0 and 1 labels under the ends), o: 1})
          segs: filled stretches of the bar (values 0..1); marker: a pointer dropped on the bar at that value (markerK 0..1
          drops it from 60 px above). Returns {xOf(v)} (parent x of value v) and bar.xOf is there too. */
(function () {
  const V = window.VID;
  const L12 = V.l12;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { f1, tn } = L12;
  const T = (n) => L12.tone(tn(n));
  const S = (tag, attrs) => V.s(tag, attrs);
  const hide = (e) => (e.style.visibility = "hidden");
  const unhide = (e, o = 1) => {
    e.style.visibility = o <= 0.001 ? "hidden" : "";
    e.style.opacity = o >= 1 ? "" : String(Math.max(0, o));
  };
  let uid = 0;

  // ---------- 1. the scent map ----------
  function field(parent, o = {}) {
    const { x = 0, y = 0, size = 600, cells = 25 } = o;
    const view = o.view || [0, 0, L12.BOX, L12.BOX];
    const s = size / (view[2] - view[0]);
    const ps = ([mx, my]) => [(mx - view[0]) * s, (view[3] - my) * s];
    const pt = (m) => {
      const [a, b] = ps(m);
      return [x + a, y + b];
    };
    const el = V.h("div", { style: { position: "absolute", left: `${x}px`, top: `${y}px`, width: `${size}px` } });
    el.style.height = `${size}px`;
    const svg = V.s("svg", {
      width: size,
      height: size + 8,
      style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
    });
    el.append(svg);
    parent.append(el);
    const id = `l12clip${++uid}`;
    const R = 22;
    svg.append(
      S("defs", {}),
      S("rect", { x: 0, y: 6, width: size, height: size, rx: R, style: { fill: "var(--line-2)" } }),
      S("rect", { x: 0, y: 0, width: size, height: size, rx: R, style: { fill: "var(--panel)" } }),
    );
    const clip = S("clipPath", { id });
    clip.append(S("rect", { x: 0, y: 0, width: size, height: size, rx: R }));
    svg.firstChild.append(clip);
    const inner = svg.appendChild(S("g", { "clip-path": `url(#${id})` }));
    // heat cells over the visible window (static: the map never changes)
    const heat = inner.appendChild(S("g", {}));
    const cw = size / cells;
    const span = (view[2] - view[0]) / cells;
    for (let i = 0; i < cells; i++)
      for (let j = 0; j < cells; j++) {
        const mx = view[0] + (i + 0.5) * span;
        const my = view[1] + (j + 0.5) * span;
        const f = L12.fit(mx, my);
        heat.append(
          S("rect", {
            x: f1(i * cw),
            y: f1((cells - 1 - j) * cw),
            width: f1(cw + 0.6),
            height: f1(cw + 0.6),
            "fill-opacity": (0.03 + 0.82 * Math.pow(f, 0.8)).toFixed(3),
            style: { fill: "var(--teal)" },
          }),
        );
      }
    // faint unit grid (shown with update({grid: k}))
    const grid = inner.appendChild(S("g", {}));
    for (let v = Math.ceil(view[0]); v <= view[2]; v++) {
      const [gx] = ps([v, 0]);
      grid.append(S("line", { x1: f1(gx), y1: 0, x2: f1(gx), y2: size, "stroke-width": 2 }));
    }
    for (let v = Math.ceil(view[1]); v <= view[3]; v++) {
      const [, gy] = ps([0, v]);
      grid.append(S("line", { x1: 0, y1: f1(gy), x2: size, y2: f1(gy), "stroke-width": 2 }));
    }
    grid.style.stroke = "var(--line-2)";
    const pool = (n, make, into = inner) => Array.from({ length: n }, () => into.appendChild(make()));
    const tails = pool(o.tails ?? 14, () =>
      S("polyline", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }),
    );
    const ghosts = pool(o.ghosts ?? 40, () => S("circle", { "stroke-width": 4 }));
    const rings = pool(o.rings ?? 14, () => S("circle", { fill: "none", "stroke-width": 6 }));
    const dots = pool(o.dots ?? 14, () => S("circle", {}));
    svg.append(
      S("rect", { x: 1.5, y: 1.5, width: size - 3, height: size - 3, rx: R - 1, fill: "none", "stroke-width": 3 }),
    );
    svg.lastChild.style.stroke = "var(--line-2)";
    const vecLayer = svg.appendChild(S("g", {}));
    const vecs = Array.from({ length: o.vecs ?? 6 }, () => L12.arrow(vecLayer));
    const starG = svg.appendChild(S("g", {}));
    let starKey = "";
    const cl = (v) => clamp(v, 0, 1);

    function update(st = {}) {
      const k = cl(st.k ?? 1);
      V.place(el, { s: 0.94 + 0.06 * E.out(k), o: Math.min(1, k * 3) });
      heat.style.opacity = String(cl(st.heat ?? 1));
      unhide(grid, cl(st.grid ?? 0));
      const list = (a) => a || [];
      tails.forEach((e, i) => {
        const q = list(st.tails)[i];
        if (!q || !q.pts || q.pts.length < 2) return hide(e);
        e.setAttribute("points", q.pts.map((m) => ps(m).map(f1).join(",")).join(" "));
        e.setAttribute("stroke-width", f1(q.w || 5));
        e.style.stroke = T(q.tone || "blue").c;
        unhide(e, q.o ?? 0.5);
      });
      ghosts.forEach((e, i) => {
        const q = list(st.ghosts)[i];
        const kk = cl(q ? (q.k ?? 1) : 0);
        if (!q || kk <= 0) return hide(e);
        const [a, b] = ps(q.x);
        e.setAttribute("cx", f1(a));
        e.setAttribute("cy", f1(b));
        e.setAttribute("r", f1((q.r || 8) * (0.6 + 0.4 * E.pop(kk))));
        e.style.fill = T(q.tone || "blue").dim;
        e.style.stroke = T(q.tone || "blue").c;
        unhide(e, (q.o ?? 0.8) * Math.min(1, kk * 3));
      });
      rings.forEach((e, i) => {
        const q = list(st.rings)[i];
        const kk = cl(q ? (q.k ?? 1) : 0);
        if (!q || kk <= 0) return hide(e);
        const [a, b] = ps(q.x);
        e.setAttribute("cx", f1(a));
        e.setAttribute("cy", f1(b));
        e.setAttribute("r", f1((q.r || 20) * (0.7 + 0.3 * E.pop(kk))));
        e.setAttribute("stroke-dasharray", q.dash ? "8 7" : "none");
        e.style.stroke = T(q.tone || "purple").c;
        unhide(e, (q.o ?? 1) * Math.min(1, kk * 3));
      });
      dots.forEach((e, i) => {
        const q = list(st.dots)[i];
        if (!q) return hide(e);
        const [a, b] = ps(q.x);
        const tt = T(q.tone || "blue");
        e.setAttribute("cx", f1(a));
        e.setAttribute("cy", f1(b));
        e.setAttribute("r", f1((q.r || 13) * (q.s ?? 1)));
        e.setAttribute("stroke-width", q.focus ? "6" : "3");
        e.style.fill = tt.c;
        e.style.stroke = q.focus ? "var(--ink)" : tt.lip;
        unhide(e, q.o ?? 1);
      });
      vecs.forEach((a, i) => {
        const q = list(st.vecs)[i];
        if (!q) return a.set({ k: 0 });
        a.set({ ...q, a: ps(q.a), b: ps(q.b) });
      });
      const sq = st.star;
      const sk = cl(sq ? (sq.k ?? 1) : 0);
      if (!sq || sk <= 0) hide(starG);
      else {
        const key = `${sq.size || 44}|${sq.tone || "orange"}`;
        if (key !== starKey) {
          starG.replaceChildren(L12.star(0, 0, sq.size || 44, sq.tone || "orange"));
          starKey = key;
        }
        const [a, b] = ps(sq.x);
        starG.setAttribute("transform", `translate(${f1(a)} ${f1(b)}) scale(${(0.6 + 0.4 * E.pop(sk)).toFixed(3)})`);
        unhide(starG, (sq.o ?? 1) * Math.min(1, sk * 3));
      }
    }
    update({ k: 1 });
    return { el, svg, pt, ps, s, size, view, update };
  }

  // ---------- 2. number line ----------
  function numLine(parent, o = {}) {
    const { x = 0, y = 0, w = 800, min = 0, max = 10, fs = 28 } = o;
    const px = (v) => x + ((v - min) / (max - min)) * w;
    const svg = L5.svg(parent);
    const g = svg.appendChild(S("g", {}));
    const ax = g.appendChild(
      S("line", { x1: x, y1: y, x2: x + w, y2: y, "stroke-width": 5, "stroke-linecap": "round" }),
    );
    ax.style.stroke = "var(--line-2)";
    for (let v = min; v <= max; v++) {
      const t = g.appendChild(S("line", { x1: px(v), y1: y - 9, x2: px(v), y2: y + 9, "stroke-width": 4 }));
      t.style.stroke = "var(--line-2)";
      const n = g.appendChild(
        S("text", { x: px(v), y: y + 14 + fs, "text-anchor": "middle", "font-size": fs, "font-weight": 800 }),
      );
      n.textContent = String(v);
      n.style.fill = "var(--text-dim)";
    }
    return {
      px,
      y,
      svg,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        V.place(g, { y: (1 - E.out(k)) * 12, o: Math.min(1, k * 3) * (st.o ?? 1) });
      },
    };
  }

  // ---------- 3. chance bar ----------
  function prob(parent, o = {}) {
    const { x = 0, y = 0, w = 600, h = 56 } = o;
    const xOf = (v) => x + clamp(v) * w;
    const svg = L5.svg(parent);
    const g = svg.appendChild(S("g", {}));
    const lip = g.appendChild(S("rect", { x, y: y + 6, width: w, height: h, rx: h / 2 }));
    lip.style.fill = "var(--line-2)";
    const bg = g.appendChild(S("rect", { x, y, width: w, height: h, rx: h / 2, "stroke-width": 3 }));
    bg.style.fill = "var(--panel-2)";
    bg.style.stroke = "var(--line-2)";
    const id = `l12bar${++uid}`;
    const clip = S("clipPath", { id });
    clip.append(S("rect", { x, y, width: w, height: h, rx: h / 2 }));
    g.append(S("defs", {}));
    g.lastChild.append(clip);
    const segG = g.appendChild(S("g", { "clip-path": `url(#${id})` }));
    const segs = Array.from({ length: 4 }, () => segG.appendChild(S("rect", { y, height: h })));
    const ends = [0, 1].map((v) => {
      const t = g.appendChild(
        S("text", { x: xOf(v), y: y + h + 40, "text-anchor": "middle", "font-size": 30, "font-weight": 800 }),
      );
      t.textContent = String(v);
      t.style.fill = "var(--text-dim)";
      return t;
    });
    const mk = g.appendChild(S("polygon", { "stroke-width": 3, "stroke-linejoin": "round" }));
    const mline = g.appendChild(S("line", { "stroke-width": 6, "stroke-linecap": "round" }));
    const api = {
      xOf,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        V.place(g, { s: 0.9 + 0.1 * E.pop(k), o: Math.min(1, k * 3) * (st.o ?? 1) });
        segs.forEach((r, i) => {
          const q = (st.segs || [])[i];
          if (!q || q.to - q.from <= 0.0005) return hide(r);
          r.setAttribute("x", f1(xOf(q.from)));
          r.setAttribute("width", f1(Math.max(0, xOf(q.to) - xOf(q.from))));
          r.style.fill = q.solid === false ? T(q.tone || "blue").dim : T(q.tone || "blue").c;
          unhide(r);
        });
        ends.forEach((e) => unhide(e, st.ends === false ? 0 : 1));
        const mk0 = st.marker;
        const mkK = clamp(st.markerK ?? 1);
        if (mk0 == null || mkK <= 0) {
          hide(mk);
          hide(mline);
        } else {
          const mx = xOf(mk0);
          const dy = -(1 - E.out(mkK)) * 60;
          const tt = T(st.markerTone || "grey");
          mk.setAttribute(
            "points",
            `${f1(mx)},${f1(y - 6 + dy)} ${f1(mx - 16)},${f1(y - 30 + dy)} ${f1(mx + 16)},${f1(y - 30 + dy)}`,
          );
          mk.style.fill = tt.c;
          mk.style.stroke = tt.lip;
          mline.setAttribute("x1", f1(mx));
          mline.setAttribute("x2", f1(mx));
          mline.setAttribute("y1", f1(y - 4 + dy));
          mline.setAttribute("y2", f1(y + h + 4 + dy));
          mline.style.stroke = tt.lip;
          unhide(mk, Math.min(1, mkK * 3));
          unhide(mline, Math.min(1, mkK * 3));
        }
        return { xOf };
      },
    };
    return api;
  }

  Object.assign(L12, { field, numLine, prob });
})();
