/* Algorithms phase 2 · tags, tokens, the graph drawer (window.VID.a2, part 2 of 3; needs common.js and VID.l5).
   Stage px (936 x 640, origin top-left). Every update/set call is PURE: call it every frame from update(t) with everything you
   want to see; nothing is remembered. Leave a field out and it falls back to the default. Tones: "blue" "green" "red"
   "orange" "purple" "grey" (VID.l5.tone). Text is 28 px minimum. Write "∞" in any text: it is drawn as a shape.

   ───────────────────────────── A2.tag(parent, {x, y, text, tone = "grey", solid = false, fs = 28, minW = 0}) -> t ─────────────────────────────
     A pill sticker (.v-tag, 3 px edge) CENTRED on (x, y).  t.set({x, y, text, tone, solid, s, o, r, dx, dy, strike})
        x, y     new centre (default the build-time one)      text   any string; "∞" inside it becomes a small infinity sign
        solid    true = filled in the tone, text in the -on shade; false = tinted, text in the -ink shade
        s, o, r  scale, opacity (0 hides), rotation in degrees (V.place)     dx, dy   extra offset in px
        strike   0..1 draws a line through the text, left to right (an old number that is replaced)
     t.el the positioning holder (never move it), t.box the visible pill (V.place-able), t.w nothing: measure with getBoundingClientRect only in tests.

   ───────────────────────────── A2.token(parent, {size = 44, tone = "blue", text = "", fs = 28, round = false}) -> k ─────────────────────────────
     A solid sticker square (a packet, optionally with a letter such as "F" for the destination) or a disc (round: true), centred on (x, y).
     k.set({x, y, s, o, r, tone, text, dx, dy}). Move it along roads with A2.along(points, k) or G.edgePt.

   ───────────────────────────── A2.along(points, k) -> {x, y, ang} ─────────────────────────────
     Point at fraction k (0..1, by length) of the polyline through points [{x, y}, ...]; ang = heading in degrees (0 = right).
     A2.lerpPt(p, q, k) -> {x, y}.   A2.obj(keys, (key, i) => value) -> {key: value}.   A2.easeIO = V.ease.inOut.
     A2.pop(t, a, d = 0.45) -> 0..1 springy pop-in progress (use as scale 0.8 + 0.2 * pop, with o = A2.fade(t, a))
     A2.fade(t, a, d = 0.25) -> 0..1 linear fade-in progress     A2.lin(t, a, b) / A2.io(t, a, b) -> 0..1 linear / ease-in-out ramp
     A2.bump(t, a, d = 0.4) -> 0..1..0 (V.flash)  for pulses and highlights     A2.on(t, a) -> 1 once t >= a, else 0
     A2.curve(t, [[t0, v0], [t1, v1], ...]) -> number   piecewise-linear schedule (times ascending, clamped at both ends): for
        "expansions done so far" in a search run: n = A2.curve(t, [[3, 0], [3.4, 1], [4.4, 1], [4.9, 2]])

   ───────────────────────────── A2.graph(parent, opts) -> G ─────────────────────────────
     const G = A2.graph(stage, {
       nodes: {A: [x, y], ...},          centres (A2.DIJ.pos, A2.TRI.pos, A2.NET.pos or your own)
       edges: [["A","B",4], ...],         [a, b, weight]; weight null = no pill; negative weights print with a real minus sign
       x: 0, y: 0, scale: 1,              offset and scale of the node positions only (node and pill sizes do not scale)
       r: 36, fs: 28,                     node radius, pill font size (nodes show their name at 1.05 x r)
       directed: false,                   true: roads are arrows a -> b, trimmed to the node edges, head grows in as k reaches 1
       at: {"A-C": 0.3},                  where the weight pill sits along an edge, from its first-named end (default 0.5)
       badge: {A: "tl"},                  side of a node's distance badge: "tr" (default) "tl" "br" "bl" "t" "b" "l" "r"
     });
     G.update({
       o: 1,                              opacity of the whole graph
       weights: 1,                        0..1 pop of every weight pill (individual edges: pk)
       nodes: { A: {look: "grey", tone, s: 1, o: 1, ring, ringK: 1, pulse: 0, dx: 0, dy: 0, text} },
           look   "grey" (default) | "soft" tinted | "solid" filled | "ghost" dashed outline; tone for soft / solid / ring
           ring   tone name: a thick ring round the node, ringK 0..1 grows it in      pulse 0..1: one scale bump (A2.bump)
           text   replaces the letter       o 0 hides it      Nodes you leave out are drawn grey.
       edges: { "A-B": {tone: "blue", k: 1, from: "A", base: true, o: 1, w: 8, dash: false, cut: 0, text, pill: "blue", pk: 1, po: 1, ps: 1} },
           key    "A-B" or "B-A", either order       tone   null = grey road
           k      0..1 how much of the road is drawn, starting at the node named in `from` (default the first-named end). With a
                  tone the coloured road is an overlay on a full GREY road (base: false hides the grey one, e.g. for a dashed
                  road that should not exist underneath); with tone null the grey road itself draws on (a road appearing)
           dash   true = dashed road, "dots" = dotted road      w  line width in px (grey 8, routes 12 look good)
           cut    0..1 the road breaks: a gap opens in the middle and a red cross draws on (the weight pill hides)
           text   replaces the pill text (e.g. "2 + 1 = 3")   pill  tone of the pill (default the road's tone, grey if none)
           pk     0..1 pill pop   po  pill opacity   ps  pill scale     Edges you leave out are drawn grey, complete, with their pill.
       badges: { B: {text: "4", tone: "purple", solid: false, k: 1, o: 1, s: 1, strike: 0, dx: 0, dy: 0} } })
           A small tag beside a node (a distance). k 0..1 pops it in (o and s are applied on top). Badges you leave out are hidden.
     G.pt(n) -> {x, y} centre of a node         G.r node radius         G.nodeNames, G.edgeKeys
     G.edge(key) -> {a, b, p: {x, y} (a), q: {x, y} (b), mid, len, ang (degrees a -> b), w}      key in either order
     G.edgePt(key, f, from = a) -> {x, y}  point at fraction f along the road, counted from the node `from` (centre to centre)
     G.pillPt(key) -> {x, y}   G.badgePt(n) -> {x, y} centres of a weight pill / a node badge       G.along(names, k) -> {x, y, ang}
        along the polyline through those nodes (a packet's journey)
     G.under, G.over   <g> layers inside the graph SVG (below the roads / above the nodes) for your own SVG, stage coordinates
     G.html   <div> at the stage origin above the SVG: put your own tags in it (they fade with G.update({o}))
     G.svg, G.el (root: never move) */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;
  const { clamp, ease: E, ramp } = V;
  const f1 = (n) => (+n).toFixed(1);
  const dflt = (v, d) => (v == null ? d : v);
  const unit = (dx, dy) => {
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  };
  const centred = (x, y) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: "0px",
    height: "0px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  });
  const cls = (el, c) => {
    if (el.getAttribute("class") !== c) el.setAttribute("class", c);
  };

  // ---------- small time and geometry helpers ----------
  const lerpPt = (p, q, k) => ({ x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k });
  function along(points, k) {
    const lens = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
    let left = clamp(k) * lens.reduce((a, b) => a + b, 0);
    for (let i = 0; i < lens.length; i++) {
      if (left <= lens[i] || i === lens.length - 1) {
        const f = lens[i] ? clamp(left / lens[i]) : 1;
        const [p, q] = [points[i], points[i + 1]];
        return { ...lerpPt(p, q, f), ang: (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI };
      }
      left -= lens[i];
    }
    return { ...points[0], ang: 0 };
  }
  const obj = (keys, fn) => Object.fromEntries(keys.map((k, i) => [k, fn(k, i)]));

  // ---------- tag ----------
  const infinity = () =>
    V.s(
      "svg",
      { viewBox: "0 0 40 20", width: "1.3em", height: "0.65em", style: { overflow: "visible", margin: "0 0.06em" } },
      V.s("path", {
        d: "M20 10 C15 3 4 3 4 10 C4 17 15 17 20 10 C25 3 36 3 36 10 C36 17 25 17 20 10",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 4.6,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
  function fillText(box, text) {
    if (box.__text === text) return;
    box.__text = text;
    const parts = String(text).split("∞");
    const kids = [];
    parts.forEach((p, i) => {
      if (p) kids.push(document.createTextNode(p));
      if (i < parts.length - 1) kids.push(infinity());
    });
    box.replaceChildren(...kids);
  }
  function tag(parent, opt = {}) {
    const { x = 0, y = 0, text = "", tone = "grey", solid = false, fs = 28, minW = 0 } = opt;
    const holder = V.h("div", { style: centred(x, y) });
    const box = V.h("div", {
      class: `v-tag c-${tone}`,
      style: {
        position: "relative",
        flexShrink: "0",
        fontSize: `${fs}px`,
        lineHeight: "1.2",
        minWidth: `${minW}px`,
        textAlign: "center",
      },
    });
    const line = V.h("i", {
      style: {
        position: "absolute",
        left: "10px",
        width: "calc(100% - 20px)",
        top: "50%",
        height: "4px",
        marginTop: "-2px",
        borderRadius: "2px",
        background: "var(--rose)",
        transformOrigin: "0 50%",
      },
    });
    box.append(line);
    holder.append(box);
    parent.append(holder);
    const textHost = V.h("span", {
      style: { display: "inline-flex", alignItems: "center", justifyContent: "center", whiteSpace: "pre" },
    });
    box.prepend(textHost);
    fillText(textHost, text);
    const set = (st = {}) => {
      const tn = st.tone || tone;
      cls(box, `v-tag c-${tn}${dflt(st.solid, solid) ? " solid" : ""}`);
      fillText(textHost, st.text == null ? text : String(st.text));
      if (st.x != null) holder.style.left = `${f1(st.x)}px`;
      if (st.y != null) holder.style.top = `${f1(st.y)}px`;
      const sk = clamp(st.strike || 0);
      line.style.transform = `scaleX(${sk.toFixed(3)})`;
      line.style.display = sk > 0.001 ? "" : "none";
      V.place(box, { x: st.dx || 0, y: st.dy || 0, s: dflt(st.s, 1), r: st.r || 0, o: dflt(st.o, 1) });
    };
    set({ o: 0 });
    return { el: holder, box, set };
  }

  // ---------- token (a packet or a disc) ----------
  function token(parent, opt = {}) {
    const { size = 44, tone = "blue", text = "", fs = 28, round = false } = opt;
    const holder = V.h("div", { style: centred(0, 0) });
    const box = V.h("div", {
      class: `v-gene solid c-${tone}`,
      text,
      style: {
        position: "relative",
        flexShrink: "0",
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${fs}px`,
        borderRadius: round ? "50%" : `${f1(size * 0.28)}px`,
        boxShadow: "0 4px 0 var(--c-lip)",
      },
    });
    holder.append(box);
    parent.append(holder);
    const set = (st = {}) => {
      cls(box, `v-gene solid c-${st.tone || tone}`);
      if (st.text != null && box.textContent !== String(st.text)) box.textContent = String(st.text);
      holder.style.left = `${f1(dflt(st.x, 0))}px`;
      holder.style.top = `${f1(dflt(st.y, 0))}px`;
      V.place(box, { x: st.dx || 0, y: st.dy || 0, s: dflt(st.s, 1), r: st.r || 0, o: dflt(st.o, 1) });
    };
    set({ o: 0 });
    return { el: holder, box, set };
  }

  // ---------- graph ----------
  const SIDE = { tr: [1.05, -1.3], tl: [-1.05, -1.3], br: [1.05, 1.35], bl: [-1.05, 1.35], t: [0, -1.6], b: [0, 1.75], l: [-2, 0.05], r: [2, 0.05] }; // prettier-ignore
  function graph(parent, opt = {}) {
    const { directed = false, r = 36, fs = 28, scale = 1, at = {}, badge: sides = {} } = opt;
    const [ox, oy] = [opt.x || 0, opt.y || 0];
    const P = {};
    Object.entries(opt.nodes).forEach(([n, [px, py]]) => (P[n] = { x: ox + px * scale, y: oy + py * scale }));
    const names = Object.keys(P);
    const EDGES = opt.edges.map(([a, b, w]) => {
      const [p, q] = [P[a], P[b]];
      const [ux, uy] = unit(q.x - p.x, q.y - p.y);
      return {
        a,
        b,
        w,
        p,
        q,
        ux,
        uy,
        len: Math.hypot(q.x - p.x, q.y - p.y),
        ang: (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI,
        mid: lerpPt(p, q, 0.5),
      };
    });
    const byKey = {};
    EDGES.forEach((e) => ((byKey[`${e.a}-${e.b}`] = e), (byKey[`${e.b}-${e.a}`] = e)));
    const edgeOf = (key) => {
      A2.need(byKey[key], `graph: no edge "${key}" (edges: ${EDGES.map((e) => `${e.a}-${e.b}`).join(", ")})`);
      return byKey[key];
    };

    // layers: svg (under, roads, nodes, over) with an HTML layer on top (pills, badges)
    const el = V.h("div", { style: { position: "absolute", left: "0px", top: "0px", width: "0px", height: "0px" } });
    const svg = V.s("svg", {
      width: 936,
      height: 640,
      style: { position: "absolute", left: "0px", top: "0px", overflow: "visible" },
    });
    const [under, gRoads, gNodes, over] = [0, 1, 2, 3].map(() => svg.appendChild(V.s("g")));
    const html = V.h("div", { style: { position: "absolute", left: "0px", top: "0px", width: "0px", height: "0px" } });
    el.append(svg, html);
    parent.append(el);

    EDGES.forEach((e) => {
      const road = () => gRoads.appendChild(V.s("path", { fill: "none", "stroke-linecap": "round" }));
      const arrow = () =>
        directed ? gRoads.appendChild(V.s("path", { "stroke-linejoin": "round", "stroke-width": 3 })) : null;
      [e.baseLine, e.baseHead, e.line, e.head] = [road(), arrow(), road(), arrow()]; // the grey road, then the coloured overlay
      e.cross = L5.cross(e.mid.x, e.mid.y, 56, "red", { w: 9 });
      over.appendChild(e.cross);
      const f = dflt(at[`${e.a}-${e.b}`], dflt(at[`${e.b}-${e.a}`] != null ? 1 - at[`${e.b}-${e.a}`] : null, 0.5));
      e.pillAt = lerpPt(e.p, e.q, f);
      e.pill = tag(html, { x: e.pillAt.x, y: e.pillAt.y, text: e.w == null ? "" : String(e.w).replace("-", "−"), fs });
    });

    names.forEach((n) => {
      const mk = (props) => V.s("circle", { cx: f1(P[n].x), cy: f1(P[n].y), r: r, ...props });
      const halo = mk({ fill: "none", "stroke-width": 7 });
      const lipC = mk({ cy: f1(P[n].y + 5) });
      const face = mk({ "stroke-width": 4 });
      const label = V.s("text", {
        x: f1(P[n].x),
        y: f1(P[n].y),
        dy: ".36em",
        "text-anchor": "middle",
        style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: `${f1(r * 1.05)}px` },
      });
      const g = gNodes.appendChild(V.s("g", {}, halo, lipC, face, label));
      const [bx, by] = SIDE[sides[n] || "tr"];
      const bpt = { x: P[n].x + bx * r, y: P[n].y + by * r };
      P[n].rec = { g, halo, lipC, face, label, badge: tag(html, { x: bpt.x, y: bpt.y, text: "", fs }), bpt };
    });

    const NODE_LOOK = {
      grey: (t) => ({ fill: "var(--panel)", stroke: "var(--line-2)", lip: "var(--line-2)", ink: "var(--ink)" }),
      soft: (t) => ({ fill: t.dim, stroke: t.edge, lip: t.edge, ink: t.ink }),
      solid: (t) => ({ fill: t.c, stroke: t.lip, lip: t.lip, ink: t.on }),
      ghost: (t) => ({ fill: "none", stroke: t.edge, lip: "none", ink: t.ink }),
    };
    function drawNode(n, s = {}) {
      const { g, halo, lipC, face, label } = P[n].rec;
      const tn = L5.tone(s.tone || "grey");
      const lk = (NODE_LOOK[s.look || "grey"] || NODE_LOOK.grey)(tn);
      face.style.fill = lk.fill;
      face.style.stroke = lk.stroke;
      lipC.style.fill = lk.lip;
      label.style.fill = lk.ink;
      face.setAttribute("stroke-dasharray", s.look === "ghost" ? "9 8" : "");
      const text = s.text == null ? n : String(s.text);
      if (label.textContent !== text) label.textContent = text;
      const rk = clamp(dflt(s.ringK, 1));
      const rt = s.ring ? L5.tone(s.ring) : null;
      halo.style.stroke = rt ? rt.c : "none";
      halo.setAttribute("r", f1(r + 11 + (1 - E.out(rk)) * 16));
      V.show(halo, rt ? clamp(rk * 3) : 0);
      V.place(g, { x: s.dx || 0, y: s.dy || 0, s: dflt(s.s, 1) * (1 + 0.18 * clamp(s.pulse || 0)), o: dflt(s.o, 1) });
    }

    /* geometry of a road from `from` to the far end, drawn up to fraction kk with a gap of 2 * gap px in the middle:
       {d: path data, head: arrow head path data or ""} (directed roads are trimmed to the node edges and end in a head) */
    function geom(e, from, kk, gap) {
      const back = from === e.b;
      const [p, q] = back ? [e.q, e.p] : [e.p, e.q];
      const [ux, uy] = back ? [-e.ux, -e.uy] : [e.ux, e.uy];
      if (directed) {
        const a0 = { x: p.x + ux * (r + 5), y: p.y + uy * (r + 5) };
        const a1 = { x: q.x - ux * (r + 7), y: q.y - uy * (r + 7) };
        const tip = lerpPt(a0, a1, kk);
        const hk = clamp((kk * e.len) / 40);
        const base = { x: tip.x - ux * 26 * hk, y: tip.y - uy * 26 * hk };
        const [nx, ny] = [-uy * 13 * hk, ux * 13 * hk];
        return {
          d:
            kk > 0.004 && Math.hypot(base.x - a0.x, base.y - a0.y) > 1
              ? `M${f1(a0.x)} ${f1(a0.y)}L${f1(base.x)} ${f1(base.y)}`
              : "",
          head:
            kk > 0.004
              ? `M${f1(tip.x)} ${f1(tip.y)}L${f1(base.x + nx)} ${f1(base.y + ny)}L${f1(base.x - nx)} ${f1(base.y - ny)}Z`
              : "",
        };
      }
      const seg = (u0, u1) =>
        u1 > u0 + 0.5 ? `M${f1(p.x + ux * u0)} ${f1(p.y + uy * u0)}L${f1(p.x + ux * u1)} ${f1(p.y + uy * u1)}` : "";
      const [L, end] = [e.len, kk * e.len];
      return { d: gap < 0.5 ? seg(0, end) : seg(0, Math.min(end, L / 2 - gap)) + seg(L / 2 + gap, end), head: "" };
    }
    function paintRoad(line, head, g, colour, w, dash, o) {
      line.setAttribute("d", g.d);
      line.style.stroke = colour;
      line.setAttribute("stroke-width", f1(w));
      line.setAttribute("stroke-dasharray", dash === "dots" ? "0.1 17" : dash ? "14 14" : "");
      V.show(line, g.d ? o : 0);
      if (!head) return;
      head.setAttribute("d", g.head);
      head.style.fill = head.style.stroke = colour;
      V.show(head, g.head ? o : 0);
    }

    function drawEdge(e, s = {}, wk) {
      const { tone = null, k = 1, o = 1, w = 8, dash = false, cut = 0 } = s;
      const [kk, gap] = [clamp(k), 34 * clamp(cut)];
      const from = s.from || e.a;
      // without a tone the road itself draws on (grey); with a tone a grey road stays underneath (unless base: false)
      if (tone) {
        paintRoad(
          e.baseLine,
          e.baseHead,
          s.base === false ? { d: "", head: "" } : geom(e, e.a, 1, gap),
          "var(--line-2)",
          8,
          false,
          o,
        );
        paintRoad(e.line, e.head, geom(e, from, kk, gap), L5.tone(tone).c, w, dash, o);
      } else {
        paintRoad(e.baseLine, e.baseHead, { d: "", head: "" }, "var(--line-2)", 8, false, o);
        paintRoad(e.line, e.head, geom(e, from, kk, gap), "var(--line-2)", w, dash, o);
      }
      // the red cross of a cut road
      L5.drawOn(e.cross, clamp(cut * 1.6));
      V.place(e.cross, { s: 0.7 + 0.3 * E.pop(clamp(cut * 1.6)), o: cut > 0.02 ? 1 : 0 });
      // the weight pill
      const text = s.text != null ? String(s.text) : e.w == null ? "" : String(e.w).replace("-", "−");
      const pk = clamp(dflt(s.pk, 1) * wk);
      const on = text !== "" && cut < 0.2;
      e.pill.set({
        text,
        tone: s.pill || tone || "grey",
        s: dflt(s.ps, 1) * (0.78 + 0.22 * E.pop(pk)),
        o: on ? clamp(pk * 4) * dflt(s.po, 1) * o * (1 - clamp(cut * 5)) : 0,
      });
    }

    function update(st = {}) {
      const wk = dflt(st.weights, 1);
      names.forEach((n) => drawNode(n, (st.nodes || {})[n]));
      EDGES.forEach((e) => drawEdge(e, (st.edges || {})[`${e.a}-${e.b}`] || (st.edges || {})[`${e.b}-${e.a}`], wk));
      names.forEach((n) => {
        const b = (st.badges || {})[n];
        if (!b) return P[n].rec.badge.set({ o: 0 });
        const k = clamp(dflt(b.k, 1));
        P[n].rec.badge.set({
          text: b.text, tone: b.tone || "grey", solid: b.solid, strike: b.strike, dx: b.dx, dy: b.dy,
          s: dflt(b.s, 1) * (0.78 + 0.22 * E.pop(k)), o: clamp(k * 4) * dflt(b.o, 1),
        }); // prettier-ignore
      });
      V.show(el, dflt(st.o, 1));
    }

    const edgeInfo = (key) => {
      const e = edgeOf(key);
      return { a: e.a, b: e.b, p: e.p, q: e.q, mid: e.mid, len: e.len, ang: e.ang, w: e.w };
    };
    return {
      el,
      svg,
      html,
      under,
      over,
      r,
      update,
      edge: edgeInfo,
      nodeNames: names,
      edgeKeys: EDGES.map((e) => `${e.a}-${e.b}`),
      pt: (n) => ({ x: P[n].x, y: P[n].y }),
      pillPt: (key) => ({ ...edgeOf(key).pillAt }),
      badgePt: (n) => ({ ...P[n].rec.bpt }),
      edgePt: (key, f, from) => {
        const e = edgeOf(key);
        return from === e.b ? lerpPt(e.q, e.p, f) : lerpPt(e.p, e.q, f);
      },
      along: (list, k) =>
        along(
          list.map((n) => P[n]),
          k,
        ),
    };
  }

  Object.assign(A2, {
    tag, token, graph, along, lerpPt, obj,
    easeIO: E.inOut,
    pop: (t, a, d = 0.45) => E.pop(ramp(t, a, a + d, E.lin)),
    fade: (t, a, d = 0.25) => ramp(t, a, a + d, E.lin),
    lin: (t, a, b) => ramp(t, a, b, E.lin),
    io: (t, a, b) => ramp(t, a, b, E.inOut),
    bump: (t, a, d = 0.4) => V.flash(t, a, a + d),
    on: (t, a) => (t >= a ? 1 : 0),
    curve: (t, pts) => {
      if (t <= pts[0][0]) return pts[0][1];
      for (let i = 1; i < pts.length; i++) {
        if (t > pts[i][0]) continue;
        const [[a, va], [b, vb]] = [pts[i - 1], pts[i]];
        return b === a ? vb : va + ((vb - va) * (t - a)) / (b - a);
      }
      return pts[pts.length - 1][1];
    },
  }); // prettier-ignore
})();
