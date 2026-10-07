/* Lecture 5 · Encodings: pieces shared by this video's scenes.

   Everything hangs off VID.l5. Positions are stage pixels (936 x 640, origin top-left). Every update/set call is a PURE
   function of its arguments: call it every frame from your scene's update(t), pass everything you want to see (anything you
   leave out falls back to its default), and never keep state of your own between frames.

   TONES (colour roles used everywhere): "green" valid/good, "red" invalid/bad, "blue" the thing we look at or change (first
   parent), "purple" operator or second parent, "orange" missing/attention, "grey" neutral.
     L5.tone("red") -> {c, ink, dim, edge, lip, on} as CSS var() strings, for your own SVG (c = fill/icon, ink = text on a tint,
     dim = tint fill, edge = tint border, lip = sticker edge, on = text on a c fill).

   1. TOUR MAP  (five cities A-E at fixed positions, the same in every scene)
        const map = L5.tourMap(stage, { x, y, w: 400, h: 300 });   // w/h: any size, the layout scales
        map.update({
          order: "ADECB",          // visit order; the last city links back to the first (closed: false = no return arrow)
          draw: 1,                 // 0..1 how much of the route is drawn. Each arrow gets an equal share: arrow i (0-based) is
                                   //   complete at draw = (i + 1) / arrowCount, so draw: 2 / 5 shows exactly two arrows
          tone: "blue",            // route colour; edgeTones: ["blue", "red", ...] colours single arrows (optional)
          lit: "auto",             // "auto" = a city lights up in the route colour once the route has reached it;
                                   //   false = never; ["A", "D"] = exactly these. litTone: colour override
          dup: ["C"],              // cities visited twice: red ring + "twice" tag
          miss: ["D"],             // cities never visited: dashed orange ring + "skipped" tag
          hi: ["D"], hiTone: "blue",   // plain highlight ring (e.g. the city of the gene you are talking about)
          labels: true,            // false hides the "twice" / "skipped" tags (rings stay)
          ringK: 1,                // 0..1 pop-in of rings and tags (animate this to make them appear)
          pulse: 0,                // 0..1 one ring pulse (pass V.flash(t, a, b)); phase: dashed ring spin (any number)
          o: 1,                    // opacity of the whole map
          // cross-fade to a second tour (the swap scene): order2, mix 0..1, plus optional tone2, draw2, edgeTones2,
          // dup2, miss2. Arrows that exist in both tours stay solid, only the others fade.
        });
        map.pt("D") -> {x, y}   centre of a city in stage coordinates (to connect genes to cities);  map.r city radius
        map.el  root element (V.place / V.show it);  map.arrows(order, closed = true) -> number of arrows of a tour
      Arrows are straight; when a tour goes both ways between two cities (D->C and C->D) they run in two lanes. A city entered
      from itself (AEECB: E, E) gets a small loop. Layout is a pentagon A-D-E-C-B (clockwise), so A-D-E-C-B is a clean loop.
      Use w >= 400 (a good size is w: 440, h: 330). The "twice" / "skipped" tags (28 px text, so they do not shrink with w) and
      loops stick out of the box: up to ~60 px above it (the tag over D), ~70 px left and right, ~35 px below. Leave that free,
      for example keep the box at least 70 px below the stage top when tags are shown.

   2. CHROMOSOME  (a row of gene tiles, class .v-gene)
        const row = L5.chromosome(stage, { x, y, genes: "ADECB" | ["3","11","7"], size: 104, gap: 14, tone: "grey",
                                           tones: [per-gene tone, optional], idx: false });
        row.set(i, { x, y, s, sx, r, o, tone, text, solid, ghost })   // x, y = offset from the tile's own slot (like V.place);
                                                                      // omitted fields fall back to the gene's own text/tone
        row.flip(i, k, { from, to, tone, toTone, hop, ...set fields })   // k 0..1: squash to 0 width, switch letter, open again
        row.all((i) => state | undefined)   // set every tile from one function
        row.pos(i) x of slot i inside the row (fractions work);  row.mid(i) -> {x, y} centre of slot i in stage coordinates
        row.el (the row: V.place / V.show it), row.tiles, row.width, row.height, row.size, row.left, row.top
        row.idx(k)   with idx: true, small gene numbers 1..n under the tiles, fade in with k 0..1

   3. BADGE  (validity sticker)
        const badge = L5.badge(stage, { x, y, w: 290, h: 68 });
        badge("valid" | "invalid" | "none", k)     // k 0..1 pop-in; "valid tour" in green with a tick, "not a tour" in red with a cross

   4. PURE HELPERS (strings of city letters; indices are 0-based, "gene 2" of the lesson is index 1)
        L5.CITIES "ABCDE"
        isPerm(s, ref = CITIES)    every city of ref exactly once
        dupsOf(s)                  letters that appear more than once, e.g. dupsOf("ADCDB") = ["D"]
        dupIdx(s)                  positions of every gene whose letter is repeated, dupIdx("ADCDB") = [1, 3]
        missingOf(s, ref)          letters of ref that s lacks, missingOf("ADCDB") = ["E"]
        repair(s, ref)             each repeat (from the left) becomes the next missing city: ADCDB -> ADCEB, AEECB -> AEDCB
        repairSteps(s, ref)        the same as a list [{i, from, to}] so a scene can animate each fix
        cross1(a, b, cut)          one-point crossover, cut = genes kept from the first parent: cross1("ADECB", "AECDB", 2) =
                                   ["ADCDB", "AEECB"]
        swapAt(s, i, j)            swapAt("ADECB", 1, 3) = "ACEDB";   setAt(s, i, ch)  setAt("ADECB", 1, "C") = "ACECB"
        diffAt(a, b)               positions where two equal-length strings differ

   5. PICTOGRAMS  (SVG <g> made of paths; append the result to your own <svg>. They are drawn at absolute coordinates, so
      V.place(g, {x, y, s, r, o}) moves/scales/rotates them from where they are drawn. tone = a tone name.)
        L5.tick(x, y, size, tone = "green", opt)         opt: {w: stroke width, on: use the -on shade, ink: use the -ink shade}
        L5.cross(x, y, size, tone = "red", opt)
        L5.arrow(x1, y1, x2, y2, tone = "grey", o = 1, opt)   opt: {w: 7, head: 22, bow: 0 (curve sideways by this many px)}
        L5.dice(x, y, size, opt)                          opt: {face: 5, tone: "grey"}   (x, y = centre)
        L5.drawOn(g, k)     0..1 draw-on animation for a tick, cross or arrow made by the helpers above
        L5.svg(parent, w = 936, h = 640)   a full-stage <svg> for pictograms, already appended to parent */
(function () {
  const V = window.VID;
  const L5 = (V.l5 = V.l5 || {});
  const { clamp, ease: E } = V;
  const CITIES = "ABCDE";
  const f1 = (n) => n.toFixed(1);
  /* path data from commands, numbers and [x, y] points:  D("M", [1, 2], "L", [3, 4]) */
  const D = (...a) =>
    a.map((q) => (Array.isArray(q) ? `${f1(q[0])} ${f1(q[1])}` : typeof q === "number" ? f1(q) : q)).join(" ");
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const unit = (v) => [v[0] / (Math.hypot(v[0], v[1]) || 1), v[1] / (Math.hypot(v[0], v[1]) || 1)];
  const dflt = (v, d) => (v == null ? d : v);
  const deg = (d) => (d * Math.PI) / 180;
  const svgIn = (parent, w = 936, h = 640) =>
    parent.appendChild(
      V.s("svg", { width: w, height: h, style: { position: "absolute", left: "0", top: "0", overflow: "visible" } }),
    );
  const pill = {
    padding: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 0 var(--c-lip)",
  };

  // ---------- colour roles ----------
  const rolesOf = (n) =>
    Object.fromEntries(["", "ink", "dim", "edge", "lip", "on"].map((r) => [r || "c", `var(--${n}${r && "-" + r})`]));
  const TONES = {
    green: rolesOf("teal"),
    blue: rolesOf("blue"),
    red: rolesOf("rose"),
    orange: rolesOf("amber"),
    purple: rolesOf("violet"),
    grey: {
      c: "var(--node-off-ic)",
      ink: "var(--text-dim)",
      dim: "var(--panel-2)",
      edge: "var(--line-2)",
      lip: "var(--node-off-lip)",
      on: "var(--ink)",
    },
  };
  const tone = (name) => {
    if (!TONES[name]) throw new Error(`VID.l5: unknown tone "${name}"`);
    return TONES[name];
  };

  // ---------- pure helpers ----------
  const missingOf = (s, ref = CITIES) => [...ref].filter((c) => !s.includes(c));
  const dupsOf = (s) => [...new Set(s)].filter((c) => s.split(c).length > 2);
  const dupIdx = (s) => [...s].flatMap((c, i) => (s.split(c).length > 2 ? [i] : []));
  const isPerm = (s, ref = CITIES) => s.length === ref.length && missingOf(s, ref).length === 0;
  const repairSteps = (s, ref = CITIES) => {
    const miss = missingOf(s, ref);
    const seen = new Set();
    const steps = [];
    [...s].forEach((c, i) => {
      if (!seen.has(c)) return seen.add(c);
      if (miss.length) steps.push({ i, from: c, to: miss.shift() });
    });
    return steps;
  };
  const setAt = (s, i, ch) => s.slice(0, i) + ch + s.slice(i + 1);
  const repair = (s, ref = CITIES) => repairSteps(s, ref).reduce((r, st) => setAt(r, st.i, st.to), s);
  const cross1 = (a, b, cut) => [a.slice(0, cut) + b.slice(cut), b.slice(0, cut) + a.slice(cut)];
  const swapAt = (s, i, j) => setAt(setAt(s, i, s[j]), j, s[i]);
  const diffAt = (a, b) => [...a].flatMap((c, i) => (c !== b[i] ? [i] : []));

  // ---------- 1. tour map ----------
  /* city positions in a 400 x 300 reference box (scaled to the real w x h): a calm pentagon, so A-D-E-C-B is a clean loop */
  const CITY_REF = { A: [50, 116], B: [107, 248], C: [293, 248], D: [200, 34], E: [350, 116] };
  const LABEL_DEG = { A: -100, B: 160, C: 5, D: -90, E: -70 }; // where a city's tag sits (degrees, 0 = right, -90 = up)
  const LOOP_DEG = { A: 190, B: 100, C: 80, D: -20, E: 15 }; // where a self-loop (city left and entered at once) bulges
  const TAG = { skipped: [128, 44], twice: [100, 44] };
  const MAXE = 8; // arrows per route

  function tourMap(parent, opt = {}) {
    const { x = 0, y = 0, w = 400, h = 300 } = opt;
    const k = Math.min(w / 400, h / 300);
    const [R, GAP, RING, HEAD, HW, LIP, SW, LANE] = [32, 7, 45, 22, 10, 5, 8, 15].map((v) => v * k);
    const P = {};
    CITIES.split("").forEach((c) => (P[c] = [(CITY_REF[c][0] * w) / 400, (CITY_REF[c][1] * h) / 300]));
    const city = (c) => {
      if (!P[c]) throw new Error(`VID.l5.tourMap: unknown city "${c}"`);
      return P[c];
    };

    /* one arrow as {len, pt(f), dir(f), line(f)}: the point, heading and path data at fraction f of its length. Arrows are
       straight and start/end just outside the city circles; when both directions between two cities are drawn they run in
       two lanes. A self-loop is a circle arc. */
    const cache = {};
    function arrowGeom(a, b, lane) {
      const key = a + b + lane;
      if (cache[key]) return cache[key];
      const [A, B] = [city(a), city(b)];
      if (a === b) {
        const th = deg(LOOP_DEG[a]);
        const [rr, rl] = [R + GAP, 28 * k];
        const dl = rr + 16 * k;
        const C = add(A, [Math.cos(th), Math.sin(th)], dl);
        const al = Math.acos((dl * dl + rl * rl - rr * rr) / (2 * dl * rl));
        const sweep = 2 * Math.PI - 2 * al;
        const ang = (f) => th + Math.PI + al + f * sweep;
        const pt = (f) => add(C, [Math.cos(ang(f)), Math.sin(ang(f))], rl);
        const line = (f) => D("M", pt(0), "A", rl, rl, "0", f * sweep > Math.PI ? "1" : "0", "1", pt(f));
        return (cache[key] = { len: rl * sweep, pt, dir: (f) => [-Math.sin(ang(f)), Math.cos(ang(f))], line });
      }
      const u = unit([B[0] - A[0], B[1] - A[1]]);
      const n = [u[1] * lane, -u[0] * lane]; // lane: to the left of travel
      const p0 = add(add(A, u, R + GAP), n);
      const p3 = add(add(B, u, -(R + GAP)), n);
      const pt = (f) => add(p0, [p3[0] - p0[0], p3[1] - p0[1]], f);
      return (cache[key] = { len: dist(p0, p3), pt, dir: () => u, line: (f) => D("M", p0, "L", pt(f)) });
    }
    const edgesOf = (order, closed) => {
      const n = order.length;
      const pairs = Array.from({ length: n < 2 ? 0 : closed ? n : n - 1 }, (_, i) => [order[i], order[(i + 1) % n]]);
      return pairs.map(([a, b]) => {
        const both = a !== b && pairs.some(([c, d]) => c === b && d === a);
        return { a, b, ...arrowGeom(a, b, both ? LANE : 0) };
      });
    };

    // DOM: two route layers (for the cross-fade), then the cities, rings and tags
    const el = V.h("div", { style: abs(x, y, w, h) });
    const svg = svgIn(el, w, h);
    const circ = (c, dy, r, a) => V.s("circle", { cx: f1(P[c][0]), cy: f1(P[c][1] + dy), r: f1(r), ...a });
    const ringsOf = {};
    CITIES.split("").forEach(
      (c) => (ringsOf[c] = [0, 1, 2].map(() => svg.appendChild(circ(c, LIP / 2, RING, { fill: "none" })))),
    );
    const layers = [0, 1].map(() =>
      Array.from({ length: MAXE }, () => {
        const line = V.s("path", { fill: "none", "stroke-width": f1(SW), "stroke-linecap": "round" });
        const head = V.s("path", { "stroke-width": f1(4 * k), "stroke-linejoin": "round" });
        svg.append(line, head);
        return { line, head };
      }),
    );
    const cityEls = {};
    const tags = {};
    const mkTag = (c, text, colour) => {
      const [tw, th] = TAG[text];
      const a = deg(LABEL_DEG[c]);
      const d = RING + 4 + Math.abs(Math.cos(a)) * (tw / 2) + Math.abs(Math.sin(a)) * (th / 2);
      const pos = abs(P[c][0] + Math.cos(a) * d - tw / 2, P[c][1] + Math.sin(a) * d - th / 2, tw, th);
      return V.h("div", { class: `v-tag solid c-${colour}`, text, style: { ...pos, ...pill } });
    };
    CITIES.split("").forEach((c) => {
      const stroke = { "stroke-width": f1(4 * k) };
      const [lipT, baseT] = [circ(c, LIP, R, {}), circ(c, 0, R, stroke)];
      const txt = V.s("text", {
        x: f1(P[c][0]),
        y: f1(P[c][1]),
        dy: ".36em",
        "text-anchor": "middle",
        style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: `${f1(38 * k)}px`, fill: "var(--ink)" },
        text: c,
      });
      const neutral = { ...stroke, style: { fill: "var(--panel)", stroke: "var(--line-2)" } };
      svg.append(circ(c, LIP, R, { style: { fill: "var(--line-2)" } }), lipT, circ(c, 0, R, neutral), baseT, txt);
      cityEls[c] = { lipT, baseT, rings: ringsOf[c] };
      tags[c] = [mkTag(c, "twice", "red"), mkTag(c, "skipped", "orange")];
      el.append(...tags[c]);
    });
    parent.append(el);

    // draw one arrow up to fraction f of its length with opacity op (a head that grows in, a line that stops under it)
    function paintArrow(slot, g, f, colour, op) {
      const on = g && f > 0.001 && op > 0.001;
      V.show(slot.head, on ? op : 0);
      if (!on) return V.show(slot.line, 0);
      const hs = clamp((f * g.len) / (HEAD * 1.3));
      const [tip, dir] = [g.pt(f), g.dir(f)];
      const [base, nrm] = [add(tip, dir, -HEAD * hs), [-dir[1] * HW * hs, dir[0] * HW * hs]];
      slot.head.setAttribute("d", D("M", tip, "L", add(base, nrm), "L", add(base, nrm, -1), "Z"));
      slot.head.style.fill = slot.head.style.stroke = slot.line.style.stroke = colour;
      const tl = f - (HEAD * 0.75 * hs) / g.len;
      if (tl > 0.003) slot.line.setAttribute("d", g.line(tl));
      V.show(slot.line, tl > 0.003 ? op : 0);
    }

    function update(s = {}) {
      const closed = s.closed !== false;
      const two = s.order2 != null;
      const mix = two ? clamp(s.mix || 0) : 0;
      const L = [
        { order: s.order || "", draw: dflt(s.draw, 1), tone: s.tone || "blue", tones: s.edgeTones || [] },
        two && {
          order: s.order2,
          draw: dflt(s.draw2, dflt(s.draw, 1)),
          tone: s.tone2 || s.tone || "blue",
          tones: s.edgeTones2 || [],
        },
      ].map((l) => {
        if (!l) return l;
        const edges = edgesOf(l.order, closed);
        const col = (i) => l.tones[i] || l.tone;
        return { ...l, edges, n: edges.length, col, key: (i) => `${edges[i].a}${edges[i].b}${col(i)}` };
      });
      const shareOk = two && L[0].draw >= 0.999 && L[1].draw >= 0.999; // an arrow in both tours stays solid
      layers.forEach((slots, li) =>
        slots.forEach((slot, i) => {
          const l = L[li];
          if (!l || i >= l.n) return paintArrow(slot, null, 0, "", 0);
          const shared = shareOk && L[1 - li].edges.some((_, j) => L[1 - li].key(j) === l.key(i));
          const op = !two ? 1 : shared ? 1 - li : li ? mix : 1 - mix;
          paintArrow(slot, l.edges[i], clamp(l.draw * l.n - i), tone(l.col(i)).c, op);
        }),
      );
      // cities light up once the route has reached them; rings and tags
      const litTone = tone(s.litTone || (mix < 0.5 ? L[0] : L[1]).tone);
      const lit = s.lit === undefined ? "auto" : s.lit;
      const reach = (l, c) => {
        const e = l ? l.draw * l.n : 0;
        return Math.max(
          0,
          ...[...(l ? l.order : "")].map((ch, j) => (ch !== c ? 0 : j ? clamp((e - j + 0.2) / 0.2) : clamp(e / 0.2))),
        );
      };
      const ringK = clamp(dflt(s.ringK, 1));
      const flash = Math.sin(Math.PI * clamp(s.pulse || 0));
      CITIES.split("").forEach((c) => {
        const { lipT, baseT, rings } = cityEls[c];
        const amt = Array.isArray(lit)
          ? +lit.includes(c)
          : lit === false
            ? 0
            : (1 - mix) * reach(L[0], c) + mix * reach(L[1], c);
        [baseT.style.fill, baseT.style.stroke, lipT.style.fill] = [litTone.dim, litTone.edge, litTone.edge];
        V.show(baseT, amt);
        V.show(lipT, amt);
        const has = (list) => +(list || []).includes(c);
        const both = (a, b) => (two ? Math.max(has(a) * (1 - mix), has(b) * mix) : has(a));
        const wgt = [both(s.dup, s.dup2), both(s.miss, s.miss2), has(s.hi)];
        const colour = ["var(--rose)", "var(--amber)", tone(s.hiTone || "blue").c];
        const dash = (Math.PI * 2 * RING) / 28;
        rings.forEach((ring, i) => {
          ring.setAttribute("r", f1(RING + (1 - E.out(ringK)) * 18 * k + 7 * k * flash));
          ring.setAttribute("stroke-width", f1(6 * k * (1 + 0.3 * flash)));
          ring.style.stroke = colour[i];
          ring.style.strokeDasharray = i === 1 ? `${f1(dash)} ${f1(dash)}` : "";
          ring.style.strokeDashoffset = f1(-(s.phase || 0) * dash * 2);
          V.show(ring, wgt[i] * clamp(ringK * 3));
        });
        tags[c].forEach((tag, i) => {
          const on = s.labels === false ? 0 : wgt[i];
          V.place(tag, { s: 0.8 + 0.2 * E.pop(ringK), o: on * clamp(ringK * 3) });
        });
      });
      V.show(el, dflt(s.o, 1));
    }
    return {
      el,
      svg,
      r: R,
      w,
      h,
      update,
      pt: (c) => ({ x: x + city(c)[0], y: y + city(c)[1] }),
      arrows: (order, closed = true) => edgesOf(order, closed).length,
    };
  }

  // ---------- 2. chromosome ----------
  function chromosome(parent, opt = {}) {
    const { x = 0, y = 0, size = 104, gap = 14, tone: base = "grey" } = opt;
    const genes = typeof opt.genes === "string" ? [...opt.genes] : (opt.genes || []).map(String);
    const width = genes.length * size + (genes.length - 1) * gap;
    const pos = (i) => i * (size + gap);
    const tone0 = (i) => (opt.tones && opt.tones[i]) || base;
    const el = V.h("div", { style: abs(x, y, width, size) });
    const fontSize = `${Math.round((58 * size) / 104)}px`;
    const tiles = genes.map((g, i) =>
      V.h("div", { class: `v-gene c-${tone0(i)}`, text: g, style: { ...abs(pos(i), 0, size, size), fontSize } }),
    );
    const numStyle = (i) => ({ ...abs(pos(i), size + 14, size, 40), textAlign: "center", fontSize: "30px" });
    const nums = opt.idx
      ? genes.map((_, i) => V.h("div", { class: "v-text dim", text: String(i + 1), style: numStyle(i) }))
      : [];
    el.append(...tiles, ...nums);
    parent.append(el);

    const set = (i, st = {}) => {
      const t = tiles[i];
      const cls = `v-gene c-${st.tone || tone0(i)}${st.solid ? " solid" : ""}${st.ghost ? " ghost" : ""}`;
      if (t.className !== cls) t.className = cls;
      const text = st.text == null ? genes[i] : String(st.text);
      if (t.textContent !== text) t.textContent = text;
      const { x: dx = 0, y: dy = 0, s = 1, sx = 1, r = 0, o = 1 } = st;
      t.style.opacity = o >= 1 ? "" : String(Math.max(0, o));
      t.style.visibility = o <= 0.001 ? "hidden" : "";
      t.style.transform = `translate(${f1(dx)}px, ${f1(dy)}px) rotate(${r}deg) scale(${(s * sx).toFixed(3)}, ${s})`;
    };
    const flip = (i, k, st = {}) => {
      const kk = clamp(k);
      const { from = genes[i], to = genes[i], tone: t1, toTone, hop = 0, ...rest } = st;
      const second = kk >= 0.5;
      const sx = Math.abs(Math.cos(Math.PI * kk)) * dflt(rest.sx, 1);
      set(i, {
        ...rest,
        text: second ? to : from,
        tone: second ? toTone || t1 : t1,
        sx,
        y: (rest.y || 0) - hop * Math.sin(Math.PI * kk),
      });
    };
    return {
      el,
      tiles,
      width,
      height: size,
      size,
      left: x,
      top: y,
      pos,
      mid: (i) => ({ x: x + pos(i) + size / 2, y: y + size / 2 }),
      set,
      flip,
      all: (fn) => genes.forEach((_, i) => set(i, fn(i) || {})),
      idx: (k) => nums.forEach((e) => V.place(e, { y: (1 - clamp(k)) * 8, o: clamp(k) })),
    };
  }

  // ---------- 5. pictograms (SVG paths) ----------
  const inkOf = (name, opt = {}) => (opt.on ? tone(name).on : opt.ink ? tone(name).ink : tone(name).c);
  const strokePath = (d, w, colour) =>
    V.s("path", {
      d,
      fill: "none",
      pathLength: "1",
      "data-draw": "1",
      "stroke-width": f1(w),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      style: { stroke: colour },
    });
  const drawOn = (g, k) => {
    const kk = clamp(k);
    g.querySelectorAll("[data-draw]").forEach((p) => {
      [p.style.strokeDasharray, p.style.strokeDashoffset] = ["1 1", String(1 - kk)];
      p.style.visibility = kk <= 0.002 ? "hidden" : "";
    });
    g.querySelectorAll("[data-head]").forEach((p) => V.show(p, V.ramp(kk, 0.7, 1, E.lin)));
  };
  const tick = (x, y, s, name = "green", opt = {}) =>
    V.s(
      "g",
      {},
      strokePath(
        D("M", [x - 0.38 * s, y + 0.02 * s], "L", [x - 0.1 * s, y + 0.32 * s], "L", [x + 0.4 * s, y - 0.3 * s]),
        opt.w || s * 0.2,
        inkOf(name, opt),
      ),
    );
  const cross = (x, y, s, name = "red", opt = {}) => {
    const a = 0.3 * s;
    const d = D("M", [x - a, y - a], "L", [x + a, y + a], "M", [x + a, y - a], "L", [x - a, y + a]);
    return V.s("g", {}, strokePath(d, opt.w || s * 0.2, inkOf(name, opt)));
  };
  const arrow = (x1, y1, x2, y2, name = "grey", o = 1, opt = {}) => {
    const { w = 7, head = 22, bow = 0 } = opt;
    const u = unit([x2 - x1, y2 - y1]);
    const c = [(x1 + x2) / 2 + u[1] * bow * 2, (y1 + y2) / 2 - u[0] * bow * 2]; // quadratic control point, the curve peaks at `bow`
    const dir = unit([x2 - c[0], y2 - c[1]]);
    const [base, colour] = [add([x2, y2], dir, -head), inkOf(name, opt)];
    const tri = D(
      "M",
      [x2, y2],
      "L",
      add(base, [-dir[1], dir[0]], head * 0.46),
      "L",
      add(base, [-dir[1], dir[0]], -head * 0.46),
      "Z",
    );
    const g = V.s("g", {}, strokePath(D("M", [x1, y1], "Q", c, add([x2, y2], dir, -head * 0.75)), w, colour));
    g.append(
      V.s("path", {
        d: tri,
        "stroke-width": "3",
        "stroke-linejoin": "round",
        "data-head": "1",
        style: { fill: colour, stroke: colour },
      }),
    );
    return V.show(g, o);
  };
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }; // cells of a 3 x 3 grid
  const dice = (x, y, s, opt = {}) => {
    const tn = tone(opt.tone || "grey");
    const [x0, y0] = [x - s / 2, y - s / 2 - s * 0.04];
    const body = (dy, fill) =>
      V.s("rect", {
        x: f1(x0),
        y: f1(y0 + dy),
        width: f1(s),
        height: f1(s),
        rx: f1(s * 0.22),
        "stroke-width": "4",
        style: { fill, stroke: tn.edge },
      });
    const pips = (PIPS[opt.face || 5] || PIPS[5]).map((c) =>
      V.s("circle", {
        cx: f1(x0 + s * (0.25 + 0.25 * (c % 3))),
        cy: f1(y0 + s * (0.25 + 0.25 * Math.floor(c / 3))),
        r: f1(s * 0.075),
        style: { fill: "var(--ink)" },
      }),
    );
    return V.s("g", {}, body(s * 0.08, tn.edge), body(0, "var(--panel)"), ...pips);
  };

  // ---------- 3. validity badge ----------
  function badge(parent, opt = {}) {
    const { x = 0, y = 0, w = 290, h = 68 } = opt;
    const texts = { valid: opt.valid || "valid tour", invalid: opt.invalid || "not a tour" };
    const style = {
      ...abs(x, y, w, h),
      ...pill,
      padding: "0 20px 0 10px",
      gap: "12px",
      fontSize: "34px",
      boxShadow: "0 5px 0 var(--c-lip)",
    };
    const el = V.h("div", { class: "v-tag solid c-green", style });
    const ic = V.s("svg", { width: 48, height: 48, viewBox: "0 0 48 48" });
    const [tickG, crossG] = [
      tick(24, 24, 30, "green", { ink: true, w: 6 }),
      cross(24, 24, 30, "red", { ink: true, w: 6 }),
    ];
    ic.append(V.s("circle", { cx: 24, cy: 24, r: 22, style: { fill: "var(--panel)" } }), tickG, crossG);
    const label = V.h("span", { text: texts.valid });
    el.append(ic, label);
    parent.append(el);
    const update = (state, k = 1) => {
      const on = state === "valid" || state === "invalid";
      if (on) {
        const cls = `v-tag solid c-${state === "valid" ? "green" : "red"}`;
        if (el.className !== cls) el.className = cls;
        if (label.textContent !== texts[state]) label.textContent = texts[state];
        V.show(tickG, +(state === "valid"));
        V.show(crossG, +(state === "invalid"));
        drawOn(state === "valid" ? tickG : crossG, V.ramp(k, 0.3, 1));
      }
      V.place(el, { s: 0.75 + 0.25 * E.pop(k), o: on ? clamp(k * 4) : 0 });
    };
    return Object.assign(update, { el, w, h });
  }

  const helpers = { isPerm, dupsOf, dupIdx, missingOf, repair, repairSteps, cross1, swapAt, setAt, diffAt };
  Object.assign(L5, helpers, {
    CITIES,
    TONES,
    tone,
    tourMap,
    chromosome,
    badge,
    tick,
    cross,
    arrow,
    dice,
    drawOn,
    svg: svgIn,
  });
})();
