/* Lecture 3 · map, distance matrix, chips, tags, stickers, pictograms (window.VID.l3, part 3 of 3; needs common.js, common-2.js, VID.l5).
   Stage px (936 x 640). Every update/set call is PURE: pass the whole state you want to see on every frame.
   Tones: "blue" "green" "red" "orange" "purple" "grey".

   ───────────────────────────── L3.map(parent, { x, y, scale = 1 }) -> m ─────────────────────────────
     The five-city TSP map at the lecture's layout (L3.POS, scaled by `scale`; at scale 1 the tiles span about 56..504 x 36..304
     from (x, y)). Five 68 px city tiles (36 px letters, grey sticker), directed edges (L5-style arrows) and distance pills.
     m.update({
       order: "ABDEC",   tour to show; the last edge returns to the first city (closed: false = no way home)
       draw: 1,          0..1 how much of the route is drawn; each of the n edges gets an equal share (edge i complete at (i+1)/n)
       tone: "blue",     edge colour (edgeTones: ["blue", "red", ...] colours single edges)
       weights: 0,       0..1 distance pills (28 px bold numbers from L3.D). A pill pops in as its own edge completes; 0 hides all
       pillAt: {AC: 0.72, BD: 0.3},   fraction along the edge for a pair (measured from the FIRST letter of the key; the key
                                       works in either order); default 0.5. Use it so pills never overlap (ABDEC: AC .72, BD .3)
       pillK: [k, ...],  optional: per-edge pill pop 0..1 overriding the automatic pop (index = edge number in the tour)
       lit: "auto",      "auto" = a city lights up in the route tone once the route reaches it | false | ["A", "D"] (exact list)
       litTone,          override the lit colour
       order2, draw2, tone2, mix: cross-fade to a second tour. Old edges fade with (1 - mix), edges of the new tour are drawn by
                         draw2 (default = mix, so mix alone draws them on while the old ones fade). An edge present in both
                         tours (same direction) stays solid and takes the new tone once the new tour has reached it
       o: 1 })           opacity of everything
     m.pt(c) -> {x, y} stage centre of city c;  m.r city radius (34);  m.edges(order, closed) -> [{a, b, p0, p1}] edge geometry
     m.pillPt(order, i) -> {x, y} where pill i would sit with the default pillAt;  m.el root;  m.svg the SVG (add your own shapes)

   ───────────────────────────── L3.matrix(parent, { x, y, cell = 54 }) -> mx ───────────────────────
     The 5 x 5 distance table: sticker grid, header row and column of letters (28 px), numbers from L3.D (28 px bold), a short
     grey dash bar on the diagonal. Size: 6 * cell + 6 px square.
     mx.update({ lit: [["A","B"], ["B","D","green", 0..1], ...], tone: "blue", k: 1, o: 1 })
        lit   cells to highlight; BOTH triangles light up for a pair. [a, b, tone?, k?]: own tone and pop 0..1 per cell
        k     0..1 pop-in of the whole table (slides in from the right by 40 px and fades)
     mx.cell(a, b) -> {x, y} stage centre of the cell (row a, column b);  mx.size

   ───────────────────────────── L3.chip(parent, { x, y, w = 262, h = 56, text, tone }) -> c ─────────────────────────────
     A station chip: v-tag sticker pill, 28 px 900 text.  c.set({ state: "grey" | "active" | "done", pop: 1, o: 1, dx: 0, dy: 0,
     pulse: 0, tone })   grey = neutral, active = solid tone, done = soft tone. pop 0..1 pops in (scale 0.8 -> 1 + fade),
     pulse 0..1 one bump (V.flash). c.el, c.w, c.h, c.x, c.y.

   ───────────────────────────── L3.tag(parent, { x, y, text, tone = "grey", solid = false, fs = 28, anchor = "l", minW }) -> el ─────────────────────────────
     A .v-tag pill (the element). x, y is its top-left ("l"), top-centre ("c") or top-right ("r", grows leftwards) corner
     depending on anchor; set anchor "m" to centre it on (x, y) both ways. el.set({ text, html, tone, solid, s, o, dx, dy, r })
     changes it (pure: unspecified = defaults; `html` allows <sup>). Use V.place for plain pop-ins: el.set({ s: 0.8 + 0.2 * E.pop(k), o: k * 4 }).
     el.holder is the positioning wrapper (never move it).

   ───────────────────────────── L3.sticker(parent, { x, y, w = 330, h = 64, text, tone, icon, fs = 28 }) -> s ─────────────────────────────
     A rounded sticker with an icon on the left and a short text (a verdict like "worse: throw it away", "local optimum").
     s.set({ text, tone: "red", icon: "cross" | "tick" | "down" | "up" | null, solid: false, k: 1, o: 1, dx: 0, dy: 0 })
     k 0..1 pops it in and draws the icon on. The icon takes the sticker's ink colour. s.el, s.w, s.h.

   ───────────────────────────── pictograms at absolute coordinates (V.place-able) ─────────────────────────────
     L3.star(x, y, size, tone = "orange") -> <g>        five-point star centred on (x, y), size = outer diameter
     L3.diamond(x, y, size, tone = "orange") -> <g>     best-so-far diamond
     L3.iconSet(g, tone)  recolour a pictogram made by L5.tick / cross / arrow to the "-ink" shade of a tone name */
(function () {
  const V = window.VID;
  const L3 = (V.l3 = V.l3 || {});
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const f1 = (n) => (+n).toFixed(1);
  const abs = (x, y, w, h) => ({ position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px`, width: `${f1(w)}px`, height: `${f1(h)}px` });
  const dflt = (v, d) => (v == null ? d : v);
  const cls = (el, c) => {
    if (el.className !== c) el.className = c;
  };

  // ---------- tag ----------
  function tag(parent, opt = {}) {
    const { x = 0, y = 0, tone = "grey", solid = false, fs = 28, anchor = "l", minW } = opt;
    const justify = { l: "flex-start", c: "center", r: "flex-end", m: "center" }[anchor] || "flex-start";
    const holder = V.h("div", { style: { ...abs(x, y, 0, 0), display: "flex", justifyContent: justify, alignItems: anchor === "m" ? "center" : "flex-start", pointerEvents: "none" } });
    const el = V.h("div", { class: `v-tag c-${tone}${solid ? " solid" : ""}`, text: opt.text || "", style: { position: "relative", flex: "none", fontSize: `${fs}px`, lineHeight: "1.2", textAlign: "center", minWidth: minW ? `${minW}px` : "" } });
    if (opt.html) el.innerHTML = opt.html;
    holder.append(el);
    parent.append(holder);
    el.holder = holder;
    el.set = (st = {}) => {
      cls(el, `v-tag c-${st.tone || tone}${(dflt(st.solid, solid) ? " solid" : "")}`);
      if (st.html != null) {
        if (el.innerHTML !== st.html) el.innerHTML = st.html;
      } else {
        const text = st.text != null ? String(st.text) : opt.text || "";
        if (el.textContent !== text || el.children.length) el.textContent = text;
      }
      V.place(el, { x: st.dx || 0, y: st.dy || 0, s: dflt(st.s, 1), r: st.r || 0, o: dflt(st.o, 1) });
    };
    return el;
  }

  // ---------- chip ----------
  function chip(parent, opt = {}) {
    const { x = 0, y = 0, w = 262, h = 56, text = "", tone = "blue" } = opt;
    const el = V.h("div", { class: "v-tag c-grey", text, style: { ...abs(x, y, w, h), display: "flex", alignItems: "center", justifyContent: "center", padding: "0", fontSize: "28px", lineHeight: "1" } });
    parent.append(el);
    const set = (st = {}) => {
      const { state = "grey", pop = 1, o = 1, dx = 0, dy = 0, pulse = 0, tone: tn = tone } = st;
      cls(el, state === "grey" ? "v-tag c-grey" : `v-tag c-${tn}${state === "active" ? " solid" : ""}`);
      el.style.boxShadow = state === "active" ? "0 4px 0 var(--c-lip)" : "";
      const k = clamp(pop);
      V.place(el, { x: dx, y: dy, s: (0.8 + 0.2 * E.pop(k)) * (1 + 0.08 * Math.sin(Math.PI * clamp(pulse))), o: Math.min(o, clamp(k * 4)) });
    };
    return { el, set, w, h, x, y };
  }

  // ---------- sticker ----------
  function sticker(parent, opt = {}) {
    const { x = 0, y = 0, w = 330, h = 64, tone = "red", fs = 28 } = opt;
    const el = V.h("div", { class: `v-card c-${tone}`, style: { ...abs(x, y, w, h), display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "0 18px 0 10px", fontSize: `${fs}px`, fontWeight: "900", whiteSpace: "nowrap", boxShadow: "0 5px 0 var(--c-edge)" } });
    const svg = V.s("svg", { width: 44, height: 44, viewBox: "0 0 44 44", style: { flex: "none", overflow: "visible" } });
    const icons = { tick: L5.tick(22, 22, 30, "green", { w: 6 }), cross: L5.cross(22, 22, 30, "red", { w: 6 }), down: L5.arrow(22, 8, 22, 36, "orange", 1, { w: 6, head: 16 }), up: L5.arrow(22, 36, 22, 8, "green", 1, { w: 6, head: 16 }) };
    Object.values(icons).forEach((g) => g.querySelectorAll("[data-draw]").forEach((p) => (p.style.stroke = "var(--c-ink)")));
    Object.values(icons).forEach((g) => g.querySelectorAll("[data-head]").forEach((p) => ((p.style.fill = "var(--c-ink)"), (p.style.stroke = "var(--c-ink)"))));
    svg.append(...Object.values(icons));
    const label = V.h("span", { text: opt.text || "" });
    el.append(svg, label);
    parent.append(el);
    const set = (st = {}) => {
      const { text = opt.text || "", tone: tn = tone, icon = opt.icon || null, solid = false, k = 1, o = 1, dx = 0, dy = 0 } = st;
      cls(el, `v-card c-${tn}`);
      el.style.background = solid ? "var(--c)" : "";
      el.style.color = solid ? "var(--c-on)" : "";
      if (label.textContent !== text) label.textContent = text;
      svg.style.display = icon ? "" : "none";
      Object.entries(icons).forEach(([name, g]) => {
        V.show(g, +(name === icon));
        L5.drawOn(g, V.ramp(k, 0.3, 1, E.lin));
      });
      const kk = clamp(k);
      V.place(el, { x: dx, y: dy, s: 0.8 + 0.2 * E.pop(kk), o: Math.min(o, clamp(kk * 4)) });
    };
    return { el, set, w, h };
  }

  // ---------- pictograms ----------
  const star = (x, y, size, tone = "orange") => {
    const tn = L5.tone(tone);
    const r = size / 2;
    const pts = Array.from({ length: 10 }, (_, j) => {
      const a = -Math.PI / 2 + (j * Math.PI) / 5;
      const rr = j % 2 ? r * 0.46 : r;
      return `${f1(x + rr * Math.cos(a))},${f1(y + rr * Math.sin(a))}`;
    }).join(" ");
    return V.s("g", {}, V.s("polygon", { points: pts, "stroke-width": "3.5", "stroke-linejoin": "round", style: { fill: tn.c, stroke: tn.lip } }));
  };
  const diamond = (x, y, size, tone = "orange") => {
    const tn = L5.tone(tone);
    const r = size / 2;
    const pts = [[x, y - r], [x + r, y], [x, y + r], [x - r, y]].map((p) => `${f1(p[0])},${f1(p[1])}`).join(" ");
    return V.s("g", {}, V.s("polygon", { points: pts, "stroke-width": "3", "stroke-linejoin": "round", style: { fill: tn.c, stroke: tn.lip } }));
  };
  const iconSet = (g, tone) => {
    const tn = L5.tone(tone);
    g.querySelectorAll("[data-draw]").forEach((p) => (p.style.stroke = tn.ink));
    g.querySelectorAll("[data-head]").forEach((p) => ((p.style.fill = tn.ink), (p.style.stroke = tn.ink)));
    return g;
  };

  // ---------- distance matrix ----------
  function matrix(parent, opt = {}) {
    const { x = 0, y = 0, cell = 54 } = opt;
    const C = L3.CITIES;
    const size = cell * 6 + 6;
    const root = V.h("div", { style: { ...abs(x, y, size, size) } });
    const box = V.h("div", { style: { ...abs(0, 0, cell * 6, cell * 6), border: "3px solid var(--line-2)", borderRadius: "20px", boxShadow: "0 6px 0 var(--line-2)", overflow: "hidden", background: "var(--panel)" } });
    root.append(box);
    const cells = {};
    const mk = (r, c) => {
      const head = r === 0 || c === 0;
      const el = V.h("div", { style: { ...abs(c * cell, r * cell, cell, cell), boxSizing: "border-box", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", lineHeight: "1", fontWeight: head ? "900" : "800", color: "var(--ink)", background: head ? "var(--panel-2)" : "var(--panel)" } });
      if (r === 0 && c === 0) return el;
      const [a, b] = [C[r - 1], C[c - 1]];
      if (head) el.textContent = r === 0 ? b : a;
      else if (a === b) el.append(V.h("div", { style: { width: `${cell * 0.3}px`, height: "6px", borderRadius: "3px", background: "var(--line-2)" } }));
      else el.textContent = String(L3.D[a][b]);
      if (!head) cells[a + b] = el;
      return el;
    };
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) box.append(mk(r, c));
    parent.append(root);
    const update = (st = {}) => {
      const { lit = [], tone = "blue", k = 1, o = 1 } = st;
      const want = {};
      lit.forEach(([a, b, tn, kk]) => ["ab", "ba"].forEach((d, j) => (want[j ? b + a : a + b] = { tone: tn || tone, k: dflt(kk, 1) })));
      Object.entries(cells).forEach(([key, el]) => {
        const w = want[key];
        const t = w ? L5.tone(w.tone) : null;
        el.style.background = t ? `color-mix(in srgb, ${t.dim} ${Math.round(w.k * 100)}%, var(--panel))` : "var(--panel)";
        el.style.borderColor = t && w.k > 0.5 ? t.edge : "var(--line)";
        el.style.color = t && w.k > 0.5 ? t.ink : "var(--ink)";
        el.style.fontWeight = t && w.k > 0.5 ? "900" : "800";
      });
      const kk = clamp(k);
      V.place(root, { x: (1 - E.out(kk)) * 40, o: Math.min(o, clamp(kk * 3)) });
    };
    const centre = (a, b) => ({ x: x + 3 + (C.indexOf(b) + 1.5) * cell, y: y + 3 + (C.indexOf(a) + 1.5) * cell });
    return { el: root, update, cell: centre, size };
  }

  // ---------- map ----------
  const R = 34;
  const GAP = 8;
  const HEAD = 22;
  const MAXE = 6;

  function map(parent, opt = {}) {
    const { x = 0, y = 0, scale = 1 } = opt;
    const C = L3.CITIES;
    const P = {};
    C.split("").forEach((c) => (P[c] = [x + L3.POS[c][0] * scale, y + L3.POS[c][1] * scale]));
    const root = V.h("div", { style: { ...abs(0, 0, 936, 640), pointerEvents: "none" } });
    const svg = V.s("svg", { width: 936, height: 640, style: { position: "absolute", left: "0", top: "0", overflow: "visible" } });
    root.append(svg);
    const layers = [0, 1].map(() =>
      Array.from({ length: MAXE }, () => {
        const line = V.s("path", { fill: "none", "stroke-width": "8", "stroke-linecap": "round" });
        const head = V.s("path", { "stroke-width": "4", "stroke-linejoin": "round" });
        svg.append(line, head);
        return { line, head };
      }),
    );
    const circ = (c, dy, a) => V.s("circle", { cx: f1(P[c][0]), cy: f1(P[c][1] + dy), r: R, ...a });
    const cityEls = {};
    C.split("").forEach((c) => {
      const lipT = circ(c, 5, {});
      const neutral = circ(c, 0, { "stroke-width": "4", style: { fill: "var(--panel)", stroke: "var(--line-2)" } });
      const lit = circ(c, 0, { "stroke-width": "4" });
      const lipN = circ(c, 5, { style: { fill: "var(--line-2)" } });
      const txt = V.s("text", { x: f1(P[c][0]), y: f1(P[c][1]), dy: ".36em", "text-anchor": "middle", style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: "36px", fill: "var(--ink)" }, text: c });
      svg.append(lipN, lipT, neutral, lit, txt);
      cityEls[c] = { lipT, lit };
    });
    // pills sit above the cities
    const pills = [0, 1].map(() =>
      Array.from({ length: MAXE }, () => {
        const holder = V.h("div", { style: { ...abs(0, 0, 0, 0), display: "flex", justifyContent: "center", alignItems: "center" } });
        const el = V.h("div", { class: "v-tag c-blue", style: { position: "relative", flex: "none", fontSize: "28px", lineHeight: "1.1", padding: "4px 12px 5px", fontWeight: "900" } });
        holder.append(el);
        root.append(holder);
        return { holder, el };
      }),
    );
    parent.append(root);

    const unitV = (a, b) => {
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
    };
    const edgesOf = (order, closed) => {
      const n = order.length;
      const cnt = n < 2 ? 0 : closed ? n : n - 1;
      return Array.from({ length: Math.min(cnt, MAXE) }, (_, i) => {
        const [a, b] = [order[i], order[(i + 1) % n]];
        const u = unitV(P[a], P[b]);
        const p0 = [P[a][0] + u[0] * (R + GAP), P[a][1] + u[1] * (R + GAP)];
        const p1 = [P[b][0] - u[0] * (R + GAP + 2), P[b][1] - u[1] * (R + GAP + 2)];
        return { a, b, u, p0, p1, len: Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) };
      });
    };
    const pillPoint = (e, pillAt) => {
      const fromA = pillAt[e.a + e.b] != null ? pillAt[e.a + e.b] : pillAt[e.b + e.a] != null ? 1 - pillAt[e.b + e.a] : 0.5;
      return [P[e.a][0] + (P[e.b][0] - P[e.a][0]) * fromA, P[e.a][1] + (P[e.b][1] - P[e.a][1]) * fromA];
    };
    const paint = (slot, e, f, colour, op) => {
      const on = e && f > 0.001 && op > 0.001;
      V.show(slot.head, on ? op : 0);
      if (!on) return V.show(slot.line, 0);
      const hs = clamp((f * e.len) / (HEAD * 1.3));
      const tip = [e.p0[0] + (e.p1[0] - e.p0[0]) * f, e.p0[1] + (e.p1[1] - e.p0[1]) * f];
      const base = [tip[0] - e.u[0] * HEAD * hs, tip[1] - e.u[1] * HEAD * hs];
      const nrm = [-e.u[1] * 10 * hs, e.u[0] * 10 * hs];
      slot.head.setAttribute("d", `M ${f1(tip[0])} ${f1(tip[1])} L ${f1(base[0] + nrm[0])} ${f1(base[1] + nrm[1])} L ${f1(base[0] - nrm[0])} ${f1(base[1] - nrm[1])} Z`);
      slot.head.style.fill = slot.head.style.stroke = slot.line.style.stroke = colour;
      const tl = f - (HEAD * 0.75 * hs) / e.len;
      if (tl > 0.003) slot.line.setAttribute("d", `M ${f1(e.p0[0])} ${f1(e.p0[1])} L ${f1(e.p0[0] + (e.p1[0] - e.p0[0]) * tl)} ${f1(e.p0[1] + (e.p1[1] - e.p0[1]) * tl)}`);
      V.show(slot.line, tl > 0.003 ? op : 0);
    };

    function update(s = {}) {
      const closed = s.closed !== false;
      const two = s.order2 != null;
      const mix = two ? clamp(s.mix || 0) : 0;
      const lay = [
        { order: s.order || "", draw: dflt(s.draw, 1), tone: s.tone || "blue", tones: s.edgeTones || [] },
        two && { order: s.order2, draw: dflt(s.draw2, mix), tone: s.tone2 || s.tone || "blue", tones: [] },
      ].map((l) => l && { ...l, edges: edgesOf(l.order, closed) });
      const pillAt = s.pillAt || {};
      const wk = clamp(dflt(s.weights, 0));
      const sameEdge = (e, other) => (other ? other.edges.findIndex((q) => q.a === e.a && q.b === e.b) : -1);
      layers.forEach((slots, li) =>
        slots.forEach((slot, i) => {
          const l = lay[li];
          const pill = pills[li][i];
          const e = l && l.edges[i];
          if (!e) {
            paint(slot, null, 0, "", 0);
            return V.show(pill.holder, 0);
          }
          const other = lay[1 - li];
          const j = sameEdge(e, other);
          const shared = j >= 0;
          const reachedNew = shared && li === 0 && clamp(other.draw * other.edges.length - j) > 0.5;
          const f = clamp(l.draw * l.edges.length - i);
          let op = li === 1 ? 1 : 1 - mix;
          let tn = l.tones[i] || l.tone;
          if (shared && li === 0) [op, tn] = [1, reachedNew ? other.tone : l.tone];
          const hide = shared && li === 1; // drawn by layer 0 already
          paint(slot, hide ? null : e, hide ? 0 : f, L5.tone(tn).c, op);
          const auto = E.pop(clamp((f - 0.82) / 0.18));
          const pk = hide ? 0 : clamp(dflt(s.pillK && s.pillK[i], auto)) * wk;
          const pp = pillPoint(e, pillAt);
          pill.holder.style.left = `${f1(pp[0])}px`;
          pill.holder.style.top = `${f1(pp[1])}px`;
          cls(pill.el, `v-tag c-${tn}`);
          const txt = String(L3.D[e.a][e.b]);
          if (pill.el.textContent !== txt) pill.el.textContent = txt;
          V.place(pill.el, { s: 0.7 + 0.3 * pk, o: Math.min(op, clamp(pk * 4)) });
          V.show(pill.holder, pk <= 0.001 || op <= 0.001 ? 0 : 1);
        }),
      );
      const litTone = L5.tone(s.litTone || (mix < 0.5 ? lay[0] : lay[1]).tone);
      const lit = s.lit === undefined ? "auto" : s.lit;
      const reach = (l, c) => {
        const e = l ? l.draw * l.edges.length : 0;
        return Math.max(0, ...[...(l ? l.order : "")].map((ch, j) => (ch !== c ? 0 : j ? clamp((e - j + 0.2) / 0.2) : clamp(e / 0.2))));
      };
      C.split("").forEach((c) => {
        const { lipT, lit: litEl } = cityEls[c];
        const amt = Array.isArray(lit) ? +lit.includes(c) : lit === false ? 0 : (1 - mix) * reach(lay[0], c) + mix * reach(lay[1], c);
        litEl.style.fill = litTone.dim;
        litEl.style.stroke = litTone.edge;
        lipT.style.fill = litTone.edge;
        V.show(litEl, amt);
        V.show(lipT, amt);
      });
      V.show(root, dflt(s.o, 1));
    }
    const pillPt = (order, i, pillAt = {}) => {
      const e = edgesOf(order, true)[i];
      const p = pillPoint(e, pillAt);
      return { x: p[0], y: p[1] };
    };
    return { el: root, svg, r: R, update, pt: (c) => ({ x: P[c][0], y: P[c][1] }), edges: edgesOf, pillPt };
  }

  Object.assign(L3, { tag, chip, sticker, star, diamond, iconSet, matrix, map });
})();
