/* Lecture 8 · The Ant System: the map (VID.l8, short name L8), part 4. Needs l5/common.js and l8/common.js .. common-3.js.
   Everything is PURE: call net.update({...}) every frame from update(t) with everything you want to see.

   L8.ek(a, b) = the road key "A-B" (the two ids sorted and joined with "-"), the same key as L8.FIVE.key.

   const net = L8.net(parent, {
     nodes: {P: [x, y], Q: [x, y], Start: {x, y, w: 120, label: "Start"}},   stage pixels (see L8.fit to place a map in a box);
                                  an object with w draws a wide pill instead of a round town; label = the text (default the id)
     edges: [["P", "Q"], ...],    the roads (any pairs; L8.FIVE.edges has the ten roads of the five villages)
     r: 30, fs: 38,               town radius and letter size (letters stay 28 px or more; fs 0 hides every letter)
     roadW: 4,                    width of the grey base roads
     labels: false,               true makes one small tag per road for update({labels})  (up to ~15 roads)
     maxPaths: 14,                how many path overlays update() may draw at once
     w: 936, h: 640               size of the svg layer (use the size of `parent`)
   });
   net.update({
     roads: 1,                    0..1 opacity of the grey base roads (0 = no roads, only what you draw);  roadTone: "grey"
     tau: (a, b) => number | {"P-Q": 3, ...} | null,    pheromone on every road: a blue line over the grey road
     tauW: [2, 4],                width = tauW[0] + tauW[1] * tau (trail 1 = 6 px, trail 4 = 18 px)
     tauNorm: {min, max, w0: 2, w1: 14, o0: 0.18, o1: 0.7},   instead of tauW: width and opacity follow (tau - min) / (max - min),
                                  the way the lessons' map draws a colony (use it for the ten villages)
     tauK: 1, tauTone: "blue",    0..1 scales the trail lines in and out
     paths: [{a, b, k: 1, tone: "orange", w: 8, head: false, dash: false, o: 1}, ...],   a coloured line along the road a -> b drawn
                                  up to fraction k of its length (from the edge of town a towards town b, arrow head optional)
     labels: {"P-Q": {text: "14", tone: "orange", solid: true, k: 1}},    small tags at the middle of a road (needs labels: true at creation)
     nodes: {P: {tone: "grey", solid: false, ring: "green", ringK: 1, ringDash: false, text, k: 1, o: 1, s: 1, dy: 0}},
                                  per-town look; towns you leave out are drawn plain grey and fully visible. tone tints the town
                                  (grey = panel face), solid fills it with the tone, ring draws a coloured ring around it (ringK 0..1
                                  pops it in), k 0..1 pops the town in, text replaces the letter.
     nodeK: 1,                    default k for towns without their own k
     o: 1                         opacity of the whole map
   });
   net.pt(id) -> {x, y} centre of a town in parent pixels;  net.along(a, b, f, inset = r + 6) -> {x, y, r} point and heading at
   fraction f of the road a -> b (inset = distance kept from both town centres: where the coloured path lines start and end);
   net.walk(a, b, f) -> {x, y, r} the same with inset r + 34: put the ANT ICON there while it walks the road a -> b (f 0..1);
   net.rest(id) -> {x, y, r: 0} where an ant stands on town id (r + 22 above its centre, so the letter stays readable);
   net.r;  net.ids. To place an ant: V.place(antG, {x: p.x, y: p.y, r: p.r}) with antG = svg.appendChild(L8.ant(0, 0, 64)). */
(function () {
  const V = window.VID;
  const L8 = V.l8;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { abs, f1, D } = L8;

  L8.ek = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

  function net(parent, opt = {}) {
    const { r = 30, roadW = 4, maxPaths = 14, w = 936, h = 640 } = opt;
    const fs = opt.fs ?? Math.round(r * 1.15);
    const ids = Object.keys(opt.nodes);
    const edges = opt.edges || [];
    const P = {};
    ids.forEach((id) => {
      const s = opt.nodes[id];
      P[id] = Array.isArray(s) ? { x: s[0], y: s[1], w: 0, label: id } : { w: 0, label: id, ...s };
    });
    const svg = L5.svg(parent, w, h);
    const line = (a, b, extra = {}) =>
      V.s("line", {
        x1: f1(P[a].x),
        y1: f1(P[a].y),
        x2: f1(P[b].x),
        y2: f1(P[b].y),
        "stroke-linecap": "round",
        ...extra,
      });
    const roads = edges.map(([a, b]) => svg.appendChild(line(a, b, { "stroke-width": f1(roadW) })));
    const trails = edges.map(([a, b]) => svg.appendChild(line(a, b)));
    const slots = Array.from({ length: maxPaths }, () => {
      const ln = V.s("path", { fill: "none", "stroke-linecap": "round" });
      const head = V.s("path", { "stroke-linejoin": "round" });
      svg.append(ln, head);
      return { ln, head };
    });
    const shape = (id, dy, extra) =>
      P[id].w
        ? V.s("rect", {
            x: f1(P[id].x - P[id].w / 2),
            y: f1(P[id].y - r + dy),
            width: f1(P[id].w),
            height: f1(2 * r),
            rx: f1(r),
            ...extra,
          })
        : V.s("circle", { cx: f1(P[id].x), cy: f1(P[id].y + dy), r: f1(r), ...extra });
    const towns = {};
    ids.forEach((id) => {
      const ring = V.s("circle", {
        cx: f1(P[id].x),
        cy: f1(P[id].y),
        r: f1(r + 12),
        fill: "none",
        "stroke-width": "6",
      });
      const lip = shape(id, 5, {});
      const base = shape(id, 0, { "stroke-width": "4" });
      const text = V.s("text", {
        x: f1(P[id].x),
        y: f1(P[id].y),
        dy: ".36em",
        "text-anchor": "middle",
        style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: `${fs}px`, fill: "var(--ink)" },
        text: fs ? P[id].label : "",
      });
      const g = V.s("g", {}, ring, lip, base, text);
      svg.append(g);
      towns[id] = { g, ring, lip, base, text };
    });
    // optional small tags at the middle of each road
    const tags = {};
    if (opt.labels) {
      edges.forEach(([a, b]) => {
        const wrap = V.h("div", {
          style: {
            ...abs((P[a].x + P[b].x) / 2 - 80, (P[a].y + P[b].y) / 2 - 24, 160, 48),
            ...L8.flex,
            visibility: "hidden",
          },
        });
        const t = V.h("div", {
          class: "v-tag",
          style: { position: "relative", ...L8.flex, height: "44px", padding: "0 14px" },
        });
        wrap.append(t);
        parent.append(wrap);
        tags[L8.ek(a, b)] = { wrap, t };
      });
    }

    const pt = (id) => ({ x: P[id].x, y: P[id].y });
    const along = (a, b, f, inset = r + 6) => L8.along(pt(a), pt(b), f, inset);
    const walk = (a, b, f) => L8.along(pt(a), pt(b), f, r + 34); // an ant on its way: starts and ends beside the towns
    const rest = (id) => ({ x: P[id].x, y: P[id].y - (r + 22), r: 0 }); // an ant standing on a town (the letter stays readable)

    function paintPath(slot, p) {
      const on = p && (p.k ?? 1) > 0.001 && (p.o ?? 1) > 0.001;
      V.show(slot.head, on ? (p.o ?? 1) : 0);
      if (!on) return V.show(slot.ln, 0);
      const k = clamp(p.k ?? 1);
      const wd = p.w ?? 8;
      const tone = L8.tone(p.tone || "orange");
      const A = along(p.a, p.b, 0);
      const B = along(p.a, p.b, 1);
      const len = Math.hypot(B.x - A.x, B.y - A.y) || 1;
      const [ux, uy] = [(B.x - A.x) / len, (B.y - A.y) / len];
      const tip = { x: A.x + (B.x - A.x) * k, y: A.y + (B.y - A.y) * k };
      const HEAD = wd * 2.8;
      const hs = p.head ? clamp((k * len) / (HEAD * 1.3)) : 0;
      const base = { x: tip.x - ux * HEAD * hs, y: tip.y - uy * HEAD * hs };
      slot.ln.setAttribute("d", D("M", [A.x, A.y], "L", [base.x, base.y]));
      slot.ln.setAttribute("stroke-width", f1(wd));
      slot.ln.style.stroke = tone.c;
      slot.ln.style.strokeDasharray = p.dash ? `${f1(wd * 0.1)} ${f1(wd * 2.2)}` : "";
      V.show(slot.ln, p.o ?? 1);
      if (p.head && hs > 0.02) {
        const n = [-uy * HEAD * 0.46 * hs, ux * HEAD * 0.46 * hs];
        slot.head.setAttribute(
          "d",
          D("M", [tip.x, tip.y], "L", [base.x + n[0], base.y + n[1]], "L", [base.x - n[0], base.y - n[1]], "Z"),
        );
        slot.head.setAttribute("stroke-width", f1(Math.max(3, wd * 0.4)));
        slot.head.style.fill = slot.head.style.stroke = tone.c;
      } else V.show(slot.head, 0);
    }

    function update(s = {}) {
      const roadK = clamp(s.roads ?? 1);
      const roadC = L8.tone(s.roadTone || "grey").c;
      roads.forEach((ln) => {
        ln.style.stroke = roadC;
        V.show(ln, roadK * 0.75);
      });
      const tauOf = typeof s.tau === "function" ? s.tau : s.tau ? (a, b) => s.tau[L8.ek(a, b)] : null;
      const tauK = clamp(s.tauK ?? 1);
      const tauC = L8.tone(s.tauTone || "blue").c;
      trails.forEach((ln, i) => {
        const v = tauOf ? tauOf(edges[i][0], edges[i][1]) : null;
        if (v == null || tauK <= 0.001) return V.show(ln, 0);
        let width;
        let op;
        if (s.tauNorm) {
          const q = s.tauNorm;
          const f = clamp((v - q.min) / (q.max - q.min || 1));
          width = (q.w0 ?? 2) + (q.w1 ?? 14) * f;
          op = (q.o0 ?? 0.18) + (q.o1 ?? 0.7) * f;
        } else {
          const [w0, w1] = s.tauW || [2, 4];
          width = w0 + w1 * v;
          op = 0.8;
        }
        ln.setAttribute("stroke-width", f1(width * tauK));
        ln.style.stroke = tauC;
        V.show(ln, op * tauK);
      });
      slots.forEach((slot, i) => paintPath(slot, (s.paths || [])[i]));
      ids.forEach((id) => {
        const st = (s.nodes || {})[id] || {};
        const T = towns[id];
        const tone = L8.tone(st.tone || "grey");
        const grey = !st.tone || st.tone === "grey";
        const k = clamp(st.k ?? s.nodeK ?? 1);
        T.base.style.fill = st.solid ? tone.c : grey ? "var(--panel)" : tone.dim;
        T.base.style.stroke = st.solid ? tone.lip : grey ? "var(--line-2)" : tone.edge;
        T.lip.style.fill = st.solid ? tone.lip : grey ? "var(--line-2)" : tone.edge;
        T.text.style.fill = st.solid ? tone.on : "var(--ink)";
        if (st.text != null && T.text.textContent !== String(st.text)) T.text.textContent = String(st.text);
        else if (st.text == null && fs && T.text.textContent !== P[id].label) T.text.textContent = P[id].label;
        const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
        if (st.ring && rk > 0.002) {
          T.ring.style.stroke = L8.tone(st.ring).c;
          T.ring.style.strokeDasharray = st.ringDash ? "14 12" : "";
          T.ring.setAttribute("r", f1(r + 12 + (1 - E.out(rk)) * 16));
          V.show(T.ring, Math.min(1, rk * 3));
        } else V.show(T.ring, 0);
        V.place(T.g, { y: st.dy || 0, s: (st.s ?? 1) * (0.7 + 0.3 * E.pop(k)), o: Math.min(1, k * 4) * (st.o ?? 1) });
      });
      Object.entries(tags).forEach(([key, { wrap, t }]) => {
        const l = (s.labels || {})[key];
        if (!l) return V.show(wrap, 0);
        t.className = `v-tag c-${l.tone || "grey"}${l.solid ? " solid" : ""}`;
        if (l.text != null && t.textContent !== String(l.text)) t.textContent = String(l.text);
        const k = clamp(l.k ?? 1);
        V.place(wrap, { s: 0.8 + 0.2 * E.pop(k), o: Math.min(1, k * 4) });
      });
      V.show(svg, s.o ?? 1);
    }
    return { svg, update, pt, along, walk, rest, r, ids, P };
  }

  L8.net = net;
})();
