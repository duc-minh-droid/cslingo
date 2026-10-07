/* Lecture 1 · What is NIC?: pictograms (window.VID.l1, short name L1; needs common.js, common-2.js and l5/common.js first).
   Stage pixels, every update is a PURE function of t (the scene's LOCAL seconds), nothing written inside the pictograms.

   1. SCENE 2 PICTOGRAMS  (each is a 330 x 150 box; the scene positions and fades the box with V.place(box, ...))
        const upd = L1.miniEvo(stage, { x, y, t0 });     upd(t)    box = upd.el
        const upd = L1.miniBrain(stage, { x, y, t0 });   upd(t)
        const upd = L1.miniAnts(stage, { x, y, t0 });    upd(t)
      t0 = time of the first event; before it the start state shows, after the last event the end state.
        miniEvo    six blue bars; generations at t0, t0 + 1, t0 + 2 (0.9 s each): the two shortest turn red and vanish, the two tallest
                   are outlined orange and each leave a copy (height + a small change) in a vacated slot; a dashed green line glides
                   to the mean height. Numbers come from L1.evoBars() (means 57.7 -> 74.5 -> 88.0 -> 96.7).
        miniBrain  nodes I1 I2 I3 -> H1 H2 -> O; a blue packet runs I1 -> H1 -> O at t0, t0 + 0.9, t0 + 1.8 (0.8 s each); O pulses
                   green and the two useful edges thicken (8.0, 10.4, 12.8 px) and turn green.
        miniAnts   nest (grey) and food (green) joined by a short trail (180 px) and a long one (360 px); three waves of 10 ants at
                   t0, t0 + 0.9, t0 + 1.8 walk at 400 px/s; trail width = 3 + 0.5 x scent from L1.antWaves (final 12.5 and 6.5 px).
      Extra fields on the returned function: upd.el (the box), upd.w = 330, upd.h = 150, plus upd.model (the data used).

   2. L1.picto(kind, size = 140, { x, y }) -> <svg> (absolute at x, y in its parent; append it yourself, V.place works on it)
        kind: "planning" | "design" | "simulation" | "identification" | "control" | "classification"; drawn on a 140 x 140 design
        grid and scaled to size; role colours, 6 px strokes, sticker lips, no glyphs, no white. */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const T = L5.tone;
  const f1 = (n) => n.toFixed(1);
  const boxStyle = (x, y, w, h) => ({ position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px`, width: `${w}px`, height: `${h}px`, overflow: "visible" });
  const lerp = V.lerp;
  const sticker = (tn, attrs = {}) => ({ ...attrs, style: { fill: T(tn).c, stroke: T(tn).lip } });

  // ---------- evolution ----------
  function miniEvo(parent, opt = {}) {
    const { x = 0, y = 0, t0 = 0 } = opt;
    const ev = L1.evoBars();
    const svg = V.s("svg", { width: 330, height: 150, style: boxStyle(x, y, 330, 150) });
    const [BASE, W, PITCH, LEFT] = [140, 34, 48, 28];
    svg.append(V.s("line", { x1: 14, x2: 316, y1: 148, y2: 148, "stroke-width": 4, "stroke-linecap": "round", style: { stroke: T("grey").edge } }));
    const mean = V.s("line", { x1: 10, x2: 320, "stroke-width": 4, "stroke-dasharray": "9 7", "stroke-linecap": "round", style: { stroke: T("green").c } });
    svg.append(mean);
    const bars = ev.H0.map((_, j) => {
      const lip = V.s("rect", { x: LEFT + j * PITCH, width: W, rx: 8 });
      const body = V.s("rect", { x: LEFT + j * PITCH, width: W, rx: 8, "stroke-width": 3 });
      const out = V.s("rect", { x: LEFT + j * PITCH - 5, width: W + 10, rx: 12, fill: "none", "stroke-width": 4, style: { stroke: T("orange").c } });
      svg.append(lip, body, out);
      return { lip, body, out };
    });
    const stateAt = (t) => {
      let cur = ev.H0.slice();
      let m = ev.means[0];
      const tone = cur.map(() => "blue");
      const out = cur.map(() => 0);
      for (let g = 0; g < ev.events.length; g++) {
        const u = t - (t0 + g);
        if (u <= 0) break;
        const e = ev.events[g];
        if (u >= 0.8) {
          [cur, m] = [e.after.slice(), ev.means[g + 1]];
          continue;
        }
        e.dead.forEach((j) => {
          cur[j] = u < 0.35 ? e.before[j] * (1 - V.ramp(u, 0, 0.35, E.inOut)) : 0;
          tone[j] = "red";
        });
        e.copies.forEach((c) => {
          if (u >= 0.35) [cur[c.to], tone[c.to]] = [c.h * Math.max(0, E.pop((u - 0.35) / 0.45)), "blue"];
          out[c.from] = V.ramp(u, 0, 0.1, E.lin) * (1 - V.ramp(u, 0.45, 0.8, E.lin));
        });
        m = lerp(ev.means[g], ev.means[g + 1], V.ramp(u, 0.35, 0.8, E.inOut));
        break;
      }
      return { h: cur, tone, out, m };
    };
    const update = (t) => {
      const s = stateAt(t);
      bars.forEach((b, j) => {
        const h = Math.max(0, s.h[j]);
        const tn = T(s.tone[j]);
        b.lip.setAttribute("y", f1(BASE - h + 4));
        b.lip.setAttribute("height", f1(h));
        b.body.setAttribute("y", f1(BASE - h));
        b.body.setAttribute("height", f1(h));
        b.lip.style.fill = tn.lip;
        b.body.style.fill = tn.c;
        b.body.style.stroke = tn.lip;
        V.show(b.lip, h > 1 ? 1 : 0);
        V.show(b.body, h > 1 ? 1 : 0);
        b.out.setAttribute("y", f1(BASE - h - 5));
        b.out.setAttribute("height", f1(h + 10));
        V.show(b.out, h > 1 ? s.out[j] : 0);
      });
      mean.setAttribute("y1", f1(BASE - s.m));
      mean.setAttribute("y2", f1(BASE - s.m));
    };
    parent.append(svg);
    return Object.assign(update, { el: svg, w: 330, h: 150, model: ev });
  }

  // ---------- brain ----------
  function miniBrain(parent, opt = {}) {
    const { x = 0, y = 0, t0 = 0 } = opt;
    const svg = V.s("svg", { width: 330, height: 150, style: boxStyle(x, y, 330, 150) });
    const P = { I1: [26, 30], I2: [26, 75], I3: [26, 120], H1: [165, 50], H2: [165, 100], O: [304, 75] };
    const edges = ["I1H1", "I1H2", "I2H1", "I2H2", "I3H1", "I3H2", "H1O", "H2O"].map((k) => [k, k.slice(0, 2), k.slice(2)]);
    const TARGET_W = [0.5, 0.7, 0.9];
    const lines = edges.map(([k, a, b]) => {
      const at = { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], "stroke-linecap": "round" };
      const grey = V.s("line", { ...at, style: { stroke: T("grey").edge } });
      const green = V.s("line", { ...at, style: { stroke: T("green").c } });
      svg.append(grey, green);
      return { k, grey, green, useful: k === "I1H1" || k === "H1O" };
    });
    const nodes = Object.fromEntries(
      Object.entries(P).map(([k, [cx, cy]]) => {
        const lip = V.s("circle", { cx, cy: cy + 4, r: 18 });
        const body = V.s("circle", { cx, cy, r: 18, "stroke-width": 4 });
        svg.append(lip, body);
        return [k, { lip, body }];
      }),
    );
    const packet = V.s("g", {}, V.s("circle", { r: 9, cy: 3, style: { fill: T("blue").lip } }), V.s("circle", { r: 9, "stroke-width": 3, style: { fill: T("blue").c, stroke: T("blue").lip } }));
    svg.append(packet);
    const wAt = (t) => TARGET_W.reduce((w, tw, p) => w + (tw - (p ? TARGET_W[p - 1] : 0.3)) * V.ramp(t, t0 + 0.9 * p + 0.8, t0 + 0.9 * p + 1.1, E.inOut), 0.3);
    const paint = (n, tn) => {
      n.body.style.fill = tn ? T(tn).c : "var(--panel)";
      n.body.style.stroke = tn ? T(tn).lip : T("grey").edge;
      n.lip.style.fill = tn ? T(tn).lip : T("grey").lip;
    };
    const update = (t) => {
      const w = wAt(t);
      lines.forEach((l) => {
        const sw = l.useful ? 2 + 12 * w : 5.6;
        [l.grey, l.green].forEach((e) => e.setAttribute("stroke-width", f1(sw)));
        V.show(l.green, l.useful ? clamp((w - 0.3) / 0.6) : 0);
      });
      const act = { I1: 0, H1: 0, O: 0 };
      let pos = null;
      for (let p = 0; p < 3; p++) {
        const u = t - (t0 + 0.9 * p);
        if (u < 0 || u > 1.15) continue;
        if (u <= 0.8) {
          const [a, b, k] = u < 0.4 ? ["I1", "H1", u / 0.4] : ["H1", "O", (u - 0.4) / 0.4];
          pos = [lerp(P[a][0], P[b][0], E.inOut(k)), lerp(P[a][1], P[b][1], E.inOut(k))];
        }
        act.I1 = Math.max(act.I1, u < 0.25 ? 1 : 0);
        act.H1 = Math.max(act.H1, u > 0.3 && u < 0.55 ? 1 : 0);
        act.O = Math.max(act.O, u >= 0.8 ? V.flash(u, 0.8, 1.15) : 0);
      }
      Object.entries(nodes).forEach(([k, n]) => paint(n, k === "O" && act.O > 0.05 ? "green" : act[k] > 0.5 ? "blue" : null));
      V.show(packet, pos ? 1 : 0);
      if (pos) packet.style.transform = `translate(${f1(pos[0])}px, ${f1(pos[1])}px)`;
    };
    parent.append(svg);
    return Object.assign(update, { el: svg, w: 330, h: 150, model: { weights: TARGET_W } });
  }

  // ---------- ants ----------
  function miniAnts(parent, opt = {}) {
    const { x = 0, y = 0, t0 = 0 } = opt;
    const svg = V.s("svg", { width: 330, height: 150, style: boxStyle(x, y, 330, 150) });
    const [nest, food] = [[80, 40], [260, 40]];
    const shortPath = [nest, food];
    const longPath = [nest, [80, 130], [260, 130], food];
    const lenOf = (p) => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);
    const [lenS, lenL] = [lenOf(shortPath), lenOf(longPath)];
    const waves = L1.antWaves(3, lenS, lenL, 10);
    const orange = T("orange");
    const trail = (p) => V.s("path", { d: `M ${p.map((q) => q.join(" ")).join(" L ")}`, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", style: { stroke: orange.c } });
    const [tS, tL] = [trail(shortPath), trail(longPath)];
    svg.append(tL, tS);
    const disc = (c, tn) => [V.s("circle", { cx: c[0], cy: c[1] + 5, r: 16, style: { fill: T(tn).lip } }), V.s("circle", { cx: c[0], cy: c[1], r: 16, "stroke-width": 3, style: { fill: T(tn).c, stroke: T(tn).lip } })];
    svg.append(...disc(nest, "grey"), ...disc(food, "green"));
    const ants = [];
    waves.forEach((wv, w) => {
      for (let j = 0; j < 10; j++) {
        const short = Math.floor(((j + 1) * wv.nShort) / 10) > Math.floor((j * wv.nShort) / 10);
        const g = V.s("g", {}, V.s("circle", { r: 7, cy: 2, style: { fill: orange.lip } }), V.s("circle", { r: 7, "stroke-width": 3, style: { fill: orange.c, stroke: orange.lip } }));
        svg.append(g);
        ants.push({ g, short, leave: t0 + 0.9 * w + 0.05 * j });
      }
    });
    const at = (path, s) => {
      let rest = s;
      for (let i = 1; i < path.length; i++) {
        const seg = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
        if (rest <= seg) return [lerp(path[i - 1][0], path[i][0], rest / seg), lerp(path[i - 1][1], path[i][1], rest / seg)];
        rest -= seg;
      }
      return path[path.length - 1];
    };
    const scent = (t, key, k) => waves.reduce((s, wv, w) => lerp(s, wv[key], V.ramp(t, t0 + 0.9 * w, t0 + 0.9 * w + 0.4, E.inOut)), k);
    const update = (t) => {
      tS.setAttribute("stroke-width", f1(3 + 0.5 * scent(t, "sShort", 1)));
      tL.setAttribute("stroke-width", f1(3 + 0.5 * scent(t, "sLong", 1)));
      ants.forEach((a) => {
        const s = 400 * (t - a.leave);
        const len = a.short ? lenS : lenL;
        if (s < 0 || s > len) return V.show(a.g, 0);
        const [px, py] = at(a.short ? shortPath : longPath, s);
        a.g.style.visibility = "";
        a.g.style.opacity = "";
        a.g.style.transform = `translate(${f1(px)}px, ${f1(py)}px)`;
      });
    };
    parent.append(svg);
    return Object.assign(update, { el: svg, w: 330, h: 150, model: { waves, lenS, lenL } });
  }

  // ---------- six application pictograms ----------
  function picto(kind, size = 140, opt = {}) {
    const { x = 0, y = 0 } = opt;
    const svg = V.s("svg", { width: size, height: size, viewBox: "0 0 140 140", style: boxStyle(x, y, size, size) });
    const stroke = (d, tn, w = 6, extra = {}) => V.s("path", { d, fill: "none", "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", ...extra, style: { stroke: T(tn).c } });
    const rect = (rx, ry, w, h, tn, r = 6) => [V.s("rect", { x: rx, y: ry + 4, width: w, height: h, rx: r, style: { fill: T(tn).lip } }), V.s("rect", { x: rx, y: ry, width: w, height: h, rx: r, "stroke-width": 3, style: { fill: T(tn).c, stroke: T(tn).lip } })];
    const ball = (cx, cy, r, tn) => [V.s("circle", { cx, cy: cy + 4, r, style: { fill: T(tn).lip } }), V.s("circle", { cx, cy, r, "stroke-width": 3, style: { fill: T(tn).c, stroke: T(tn).lip } })];
    const badge = (cx, cy, tn, icon) => [...ball(cx, cy, 13, tn), icon(cx, cy, 15, tn, { on: true, w: 3.5 })];
    const parts = [];
    if (kind === "planning") {
      parts.push(...rect(24, 14, 92, 12, "orange", 5));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) parts.push(V.s("rect", { x: 24 + c * 23, y: 34 + r * 23, width: 22, height: 22, rx: 4, fill: "none", "stroke-width": 3, style: { stroke: T("grey").edge } }));
      [[0, 0, "blue"], [1, 1, "purple"], [2, 0, "blue"], [3, 2, "purple"], [1, 2, "blue"]].forEach(([c, r, tn]) => parts.push(...rect(26 + c * 23, 36 + r * 23, 18, 16, tn, 4)));
    } else if (kind === "design") {
      parts.push(...rect(34, 116, 72, 12, "grey", 5));
      parts.push(stroke("M70 116 L70 96 L50 80 L90 62 L54 44 L70 28", "blue"), ...ball(70, 22, 9, "orange"));
    } else if (kind === "simulation") {
      parts.push(...ball(30, 70, 22, "blue"), ...ball(110, 70, 22, "orange"));
      parts.push(L5.arrow(50, 44, 92, 44, "purple", 1, { w: 6, head: 16, bow: -9 }), L5.arrow(90, 100, 48, 100, "purple", 1, { w: 6, head: 16, bow: -9 }));
    } else if (kind === "identification") {
      parts.push(stroke("M16 22 L16 120 L126 120", "grey", 4));
      parts.push(stroke("M24 108 C52 100 66 84 82 62 S112 40 124 28", "blue"));
      [[26, 100], [44, 98], [60, 82], [80, 70], [100, 50], [118, 40]].forEach(([cx, cy]) => parts.push(...ball(cx, cy, 6, "green")));
    } else if (kind === "control") {
      const a = (12 * Math.PI) / 180;
      parts.push(...rect(26, 100, 80, 18, "grey", 8), ...ball(46, 124, 8, "purple"), ...ball(88, 124, 8, "purple"));
      parts.push(stroke(`M66 100 L${f1(66 + 62 * Math.sin(a))} ${f1(100 - 62 * Math.cos(a))}`, "blue"), ...ball(66 + 70 * Math.sin(a), 100 - 70 * Math.cos(a), 9, "orange"));
      parts.push(L5.arrow(118, 96, 118, 40, "purple", 1, { w: 5, head: 16, bow: 14 }));
    } else if (kind === "classification") {
      [[8, "green", L5.tick], [78, "red", L5.cross]].forEach(([ex, tn, icon]) => {
        parts.push(V.s("rect", { x: ex, y: 52, width: 54, height: 40, rx: 8, "stroke-width": 4, style: { fill: "var(--panel)", stroke: "var(--ink)" } }));
        parts.push(stroke(`M${ex + 4} 58 L${ex + 27} 76 L${ex + 50} 58`, "grey", 4));
        parts.push(...badge(ex + 48, 50, tn, icon));
      });
    } else throw new Error(`L1.picto: unknown kind "${kind}"`);
    svg.append(...parts);
    return svg;
  }

  Object.assign(L1, { miniEvo, miniBrain, miniAnts, picto });
})();
