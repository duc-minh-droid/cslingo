/* Lecture 6 · Genetic programming, scene 02-behaviour.
   Left panel: normal programming. YOU write the program (code appears line by line), then it turns the input 2 into the output 7.
   Right panel: genetic programming. YOU only give examples (X -> output); the program box is a "?" that evolution fills in:
   it flickers through little random trees and lands on x² + x + 1, and every example turns green.
   The same slot under the box is held by the person on the left and by evolution on the right: that is the swap of who does the work.
   Every number comes from the real target tree (L.TARGET_TREE) and is checked below. */
(function () {
  const V = window.VID;
  const L = V.l6;
  const { h, s, place, show, ramp, ease, lerp, flash } = V;
  const pop = (t, a, d = 0.5) => ease.pop(ramp(t, a, a + d, ease.lin));
  const fade = (t, a, d = 0.18) => ramp(t, a, a + d, ease.lin);

  // ---------- the data: the examples you give, checked against the real target tree ----------
  const GIVEN = [
    [-1, 1],
    [0, 1],
    [1, 3],
    [2, 7],
  ];
  GIVEN.forEach(([x, y]) => {
    const got = L.evalTree(L.TARGET_TREE, { X: x });
    if (got !== y) throw new Error(`scene 02: the target gives ${got} at X = ${x}, not ${y}`);
  });
  const FORMULA = L.formula(L.TARGET_TREE); // "x² + x + 1"
  const DEMO_IN = 2; // the one input the normal-programming side runs
  const DEMO_OUT = L.evalTree(L.TARGET_TREE, { X: DEMO_IN }); // 7

  // ---------- layout (panel coordinates, panels are 438 x 608 and sit 14 px below the stage top) ----------
  const PW = 438;
  const PH = 608;
  const INX = 16;
  const CW = 56; // the "in" chips
  const CWO = 60; // the "out" chips (a little wider: a tick sits on the corner)
  const CH = 52;
  const OUTX = PW - 16 - CWO;
  const BOXX = 100;
  const BOXW = 234;
  const BOXY = 112;
  const PITCH = 62;
  const BOXH = 3 * PITCH + CH; // the four example rows line up with the box
  const CX = BOXX + BOXW / 2; // the centre line under the box, where the worker stands
  const GLYPH_Y = BOXY + 141; // centre of the box's picture area
  const FLEX = "display:flex;align-items:center;justify-content:center;";

  // ---------- small building blocks ----------
  const abs = (x, y, w, ht, more = "") =>
    `position:absolute;left:${x}px;top:${y}px;width:${w}px;${ht == null ? "" : `height:${ht}px;`}${more}`;
  const sv = (tag, attrs, style, ...kids) => s(tag, { ...attrs, style }, ...kids);
  function panel(stage, x, tone, title) {
    const full = abs(0, 0, PW, PH);
    const tag = h("div", { class: `v-tag solid c-${tone}`, text: title });
    tag.style.cssText = "position:relative;font-size:32px;line-height:1.15";
    const head = h("div", { style: abs(0, 12, PW, null, "display:flex;justify-content:center") }, tag);
    const svg = s("svg", { width: PW, height: PH, viewBox: `0 0 ${PW} ${PH}`, style: `${full}overflow:visible` });
    const root = h("div", { style: abs(x, 14, PW, PH) }, h("div", { class: `v-card c-${tone}`, style: full }), head);
    const cards = root.appendChild(h("div", { style: full }));
    root.append(svg); // the arrows and pictures sit above the cards ...
    const top = root.appendChild(h("div", { style: full })); // ... and the tick badges above those
    stage.append(root);
    return { root, cards, svg, top };
  }
  const chip = (parent, x, y, text = "", w = CW) =>
    parent.appendChild(
      h("div", {
        class: "v-card plain",
        text,
        style: abs(x, y, w, CH, `${FLEX}border-radius:18px;font-size:36px;font-weight:900`),
      }),
    );
  /** write an attribute or a style property only when its value changed (an untouched node is never repainted) */
  const put = (el, name, v) => String(v) !== el.getAttribute(name) && el.setAttribute(name, v);
  const set = (style, name, v) => style[name] !== v && (style[name] = v);
  const css = (el, props) => Object.entries(props).forEach(([k, v]) => set(el.style, k, v));
  /** "plain" panel-coloured chip, "green" matched, "ghost" an empty dashed slot */
  function chipLook(el, look) {
    const ghost = look === "ghost";
    put(el, "class", look === "green" ? "v-card c-green" : "v-card plain");
    css(el, {
      background: ghost ? "transparent" : "",
      borderStyle: ghost ? "dashed" : "",
      borderColor: ghost ? "var(--blue)" : "",
      boxShadow: ghost ? "none" : "",
    });
  }
  const LABEL = "text-align:center;font-size:28px;font-weight:900;letter-spacing:0.08em";
  const colLabel = (parent, text, x, w = CW) =>
    parent.appendChild(h("div", { class: "v-text dim", text, style: abs(x - 20, 74, w + 40, null, LABEL) }));
  const boxLabel = (box) =>
    box.appendChild(
      h("div", {
        class: "v-text dim",
        text: "program",
        style: "left:0;top:8px;width:100%;text-align:center;font-size:28px",
      }),
    );
  function tag(parent, text, tone, x, y, w, small) {
    const t = h("div", { class: `v-tag solid c-${tone}`, text });
    t.style.cssText = `position:relative;${small ? "padding:4px 14px 5px;" : ""}font-size:30px;line-height:1.15`;
    return parent.appendChild(
      h("div", { style: abs(x - w / 2, y, w, null, "display:flex;justify-content:center") }, t),
    );
  }
  function tickBadge(parent, size, x, y) {
    const edge = "border:3px solid var(--teal-lip);box-shadow:0 3px 0 var(--teal-lip)";
    const look = `box-sizing:border-box;border-radius:50%;background:var(--teal);${edge}`;
    const b = h("div", { style: abs(x, y, size, size, look) });
    b.append(L.tick(size - 6, "green", true));
    return parent.appendChild(b);
  }
  const GREY = "var(--text-faint)";
  /** a pathLength-1 arrow, so setLine can draw it on */
  const lineArrow = (svg, d, w = 6) =>
    svg.appendChild(
      sv(
        "path",
        { d, pathLength: 1, "stroke-width": w },
        `fill:none;stroke:${GREY};stroke-linecap:round;stroke-linejoin:round`,
      ),
    );
  const arrowR = (svg, x0, x1, y) =>
    lineArrow(svg, `M${x0} ${y}H${x1}M${x1 - 9} ${y - 9}L${x1} ${y}L${x1 - 9} ${y + 9}`);
  const arrowUp = (svg, x, y0, y1) =>
    lineArrow(svg, `M${x} ${y0}V${y1}M${x - 13} ${y1 + 16}L${x} ${y1}L${x + 13} ${y1 + 16}`, 8);
  /** k 0..1 draws the arrow on, colour is a CSS colour */
  function setLine(path, k, color = GREY) {
    if (k >= 1) path.removeAttribute("stroke-dasharray");
    else put(path, "stroke-dasharray", `${k.toFixed(3)} 2`);
    show(path, k <= 0.001 ? 0 : 1);
    set(path.style, "stroke", color);
  }
  /** little beads that climb an arrow while something is being made (their place comes from t alone) */
  const makeBeads = (svg, n, tone) =>
    Array.from({ length: n }, () =>
      svg.appendChild(sv("circle", { r: 6.5, "stroke-width": 3 }, `fill:var(--panel);stroke:var(--${tone}-lip)`)),
    );
  function flowBeads(beads, t, from, to, x, y0, y1, period = 0.5) {
    beads.forEach((b, i) => {
      const u = ((((t - from) / period + i / beads.length) % 1) + 1) % 1;
      put(b, "cx", x);
      put(b, "cy", lerp(y0, y1, u).toFixed(1));
      show(b, t >= from && t < to ? Math.min(1, 4 * Math.sin(Math.PI * u)) : 0);
    });
  }
  /** a group placed at x, y (and scaled) by an attribute, with an inner group that V.place can animate */
  function stand(svg, x, y, sc, ...kids) {
    const outer = svg.appendChild(s("g", { transform: `translate(${x} ${y}) scale(${sc})` }));
    return outer.appendChild(s("g", {}, ...kids));
  }

  // ---------- the person at a keyboard ("you") ----------
  function makePerson() {
    const stroke = (d, w, col) =>
      sv("path", { d, "stroke-width": w }, `fill:none;stroke:${col};stroke-linecap:round;stroke-linejoin:round`);
    const dot = (cx, cy, r, fill, edge = "none") =>
      sv("circle", { cx, cy, r, "stroke-width": 3.5 }, `fill:${fill};stroke:${edge}`);
    const torso = "M-52 -14C-52 -62 -30 -88 0 -88C30 -88 52 -62 52 -14Z";
    const body = sv(
      "path",
      { d: torso, "stroke-width": 4 },
      "fill:var(--blue);stroke:var(--blue-lip);stroke-linejoin:round",
    );
    const hair = sv("path", { d: "M-28 -118A28 28 0 0 1 28 -118Q0 -112 -28 -118Z" }, "fill:var(--blue-lip)");
    const head = s("g", {}, dot(0, -118, 28, "var(--blue-dim)", "var(--blue-lip)"), hair);
    head.append(dot(-10, -103, 3.6, "var(--ink)"), dot(10, -103, 3.6, "var(--ink)"));
    head.append(stroke("M-8 -94Q0 -88 8 -94", 3.5, "var(--ink)"));
    const rect = (y, st) => sv("rect", { x: -74, y, width: 148, height: 38, rx: 10, "stroke-width": 3 }, st);
    const kb = s("g", {}, rect(-24, "fill:var(--line-2)"), rect(-30, "fill:var(--panel);stroke:var(--line-2)"));
    const keys = Array.from({ length: 14 }, (_, i) =>
      kb.appendChild(
        sv("rect", { x: -62 + (i % 7) * 18.5, y: -23 + Math.floor(i / 7) * 14, width: 15, height: 9, rx: 3 }, ""),
      ),
    );
    const arms = [0, 1].map(() => [stroke("", 22, "var(--blue-lip)"), stroke("", 14, "var(--blue)")]);
    const hands = [0, 1].map(() => dot(0, 0, 10, "var(--blue-dim)", "var(--blue-lip)"));
    const g = s("g", {}, body, head, kb, ...arms.flat(), ...hands);
    return {
      g,
      /** act 0..1: how hard the hands are typing */
      update(t, act) {
        const lit = act > 0.5 ? (Math.floor(t * 9) * 5) % keys.length : -1;
        keys.forEach((k, i) => set(k.style, "fill", i === lit ? "var(--blue)" : "var(--line)"));
        [-1, 1].forEach((side, i) => {
          const down = act * 8 * Math.max(0, Math.sin(2 * Math.PI * 3.4 * t + (i ? Math.PI : 0)));
          const hy = -42 + down;
          arms[i].forEach((a) => put(a, "d", `M${side * 42} -62L${side * 26} ${hy.toFixed(2)}`));
          put(hands[i], "cx", side * 26);
          put(hands[i], "cy", hy.toFixed(2));
        });
      },
    };
  }

  // ---------- evolution: a round sticker with two chasing arrows ----------
  function makeEvo() {
    const R = 22;
    const arc = (a0, a1) => {
      const c = (a, r = R) => [r * Math.cos((a * Math.PI) / 180), r * Math.sin((a * Math.PI) / 180)];
      const [x0, y0] = c(a0);
      const [x1, y1] = c(a1);
      const [nx, ny] = c(a1, 1); // radial direction at the tip; the arrow travels clockwise, along (-ny, nx)
      const pt = (dx, dy) => `${(x1 + dx).toFixed(1)} ${(y1 + dy).toFixed(1)}`;
      const head = `${pt(-ny * 12, nx * 12)} ${pt(nx * 10, ny * 10)} ${pt(-nx * 10, -ny * 10)}`;
      const d = `M${x0.toFixed(1)} ${y0.toFixed(1)}A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
      return [
        sv("path", { d, "stroke-width": 7 }, "fill:none;stroke:var(--violet-on);stroke-linecap:round"),
        sv(
          "polygon",
          { points: head, "stroke-width": 3 },
          "fill:var(--violet-on);stroke:var(--violet-on);stroke-linejoin:round",
        ),
      ];
    };
    const spin = s("g", {}, ...arc(185, 320), ...arc(5, 140));
    const g = s(
      "g",
      {},
      sv("circle", { cy: 5, r: 42 }, "fill:var(--violet-lip)"),
      sv("circle", { r: 42, "stroke-width": 4 }, "fill:var(--violet);stroke:var(--violet-lip)"),
      spin,
    );
    return { g, spinTo: (deg) => put(spin, "transform", `rotate(${deg.toFixed(1)})`) };
  }

  // ---------- little random trees for the flicker (no text: functions are purple, terminals blue) ----------
  const SHAPES = [
    [[], []],
    [
      [[], []],
      [[], []],
    ],
    [[], [[], []]],
    [[[], []], []],
    [[], [[], [[], []]]],
    [[[], [[], []]], []],
  ];
  function makeGlyph(shape) {
    let leaf = 0;
    const nodes = [];
    const edges = [];
    const lay = (kids, d) => {
      const me = { d };
      nodes.push(me);
      const sub = kids.map((k) => lay(k, d + 1));
      me.x = sub.length ? (sub[0].x + sub[sub.length - 1].x) / 2 : leaf++;
      me.fn = sub.length > 0;
      sub.forEach((k) => edges.push([me, k]));
      return me;
    };
    lay(shape, 0);
    const mx = (leaf - 1) / 2;
    const my = Math.max(...nodes.map((n) => n.d)) / 2;
    const at = (n) => [(n.x - mx) * 42, (n.d - my) * 38];
    const g = s("g");
    edges.forEach(([a, b]) => {
      const [x0, y0] = at(a);
      const [x1, y1] = at(b);
      g.append(sv("path", { d: `M${x0} ${y0}L${x1} ${y1}`, "stroke-width": 5 }, `stroke:${GREY};stroke-linecap:round`));
    });
    nodes.forEach((n) => {
      const [x, y] = at(n);
      const c = n.fn ? "violet" : "blue";
      const tile = (dy, fill) =>
        sv(
          "rect",
          { x: x - 17, y: y - 14 + dy, width: 34, height: 28, rx: 9, "stroke-width": 3 },
          `fill:var(--${fill});stroke:var(--${c}-lip)`,
        );
      g.append(tile(4, `${c}-lip`), tile(0, c));
    });
    return g;
  }

  // ---------- LEFT: normal programming ----------
  // each line: [indent, [[width, colour], ...]]; coloured bars read as syntax-highlighted code
  const CODE = [
    [0, [[58, "violet"], [92, "blue"]]],
    [22, [[44, "violet"], [70, "blue"], [30, "amber"]]],
    [22, [[30, "line-2"], [60, "blue"], [56, "line-2"]]],
    [44, [[50, "violet"], [80, "blue"]]],
    [22, [[44, "violet"], [96, "blue"]]],
    [0, [[92, "blue"], [40, "amber"]]],
  ]; // prettier-ignore

  function buildLeft(stage) {
    const P = panel(stage, 12, "blue", "Normal programming");
    const rowY = BOXY + (BOXH - CH) / 2;
    const midY = rowY + CH / 2;
    const labels = [colLabel(P.cards, "IN", INX), colLabel(P.cards, "OUT", OUTX, CWO)];
    const cin = chip(P.cards, INX, rowY, L.fmtVal(DEMO_IN));
    const cout = chip(P.cards, OUTX, rowY, "", CWO);
    const a1 = arrowR(P.svg, INX + CW + 4, BOXX - 4, midY);
    const a2 = arrowR(P.svg, BOXX + BOXW + 4, OUTX - 4, midY);

    const lip = "border-radius:28px;border-color:var(--blue);box-shadow:0 6px 0 var(--blue-lip)";
    const box = h("div", { class: "v-card plain", style: abs(BOXX, BOXY, BOXW, BOXH, lip) });
    boxLabel(box);
    const bars = [];
    let total = 0;
    CODE.forEach(([indent, segs], li) => {
      let x = 20 + indent;
      segs.forEach(([w, color]) => {
        const bar = `height:14px;border-radius:7px;background:var(--${color})`;
        const el = box.appendChild(h("div", { style: `${abs(x, 58 + li * 28, 0, null)}${bar}` }));
        bars.push({ el, from: total, w, x, y: 58 + li * 28 });
        total += w;
        x += w + 8;
      });
    });
    const cursorLook = "position:absolute;width:4px;height:22px;border-radius:2px;background:var(--blue-ink)";
    const cursor = box.appendChild(h("div", { style: cursorLook }));
    P.cards.append(box);

    const person = makePerson();
    const personIn = stand(P.svg, CX, 576, 1, person.g);
    const up = arrowUp(P.svg, CX, 424, 362);
    const beads = makeBeads(P.svg, 2, "blue");
    const you = tag(P.top, "You", "blue", CX + 110, 476, 120);

    return (t) => {
      const kp = ramp(t, 0.1, 0.55);
      const dim = lerp(1, 0.72, ramp(t, 3.5, 4.1, ease.inOut));
      place(P.root, { y: Math.round((1 - kp) * 18), o: fade(t, 0.1, 0.3) * dim });
      labels.forEach((l) => place(l, { s: pop(t, 0.5), o: fade(t, 0.5) }));
      place(cin, { s: pop(t, 0.5) * (1 + 0.1 * flash(t, 2.4, 2.7)), o: fade(t, 0.5) });
      place(box, { s: pop(t, 0.65) * (1 + 0.04 * flash(t, 2.6, 2.95)), o: fade(t, 0.65) });
      // the person writes the program: hands and keys move, the bars grow one 5 px step at a time
      const act = ramp(t, 1.25, 1.35, ease.lin) * (1 - ramp(t, 2.35, 2.45, ease.lin));
      place(personIn, { s: pop(t, 0.9, 0.45), o: fade(t, 0.9) });
      person.update(t, act);
      place(you, { s: pop(t, 1.1, 0.4), o: fade(t, 1.1) });
      setLine(up, ramp(t, 1.05, 1.4), "var(--blue)");
      flowBeads(beads, t, 1.4, 2.4, CX, 424, 388, 0.5);
      const typed = Math.round((total * ramp(t, 1.3, 2.35, ease.lin)) / 5) * 5;
      let last = { ...bars[0], w: 0 };
      bars.forEach((b) => {
        const w = Math.max(0, Math.min(b.w, typed - b.from));
        set(b.el.style, "width", `${w}px`);
        if (w > 0) last = { ...b, w };
      });
      show(cursor, t > 1.05 && t < 2.6 && (act > 0.5 || Math.floor(t * 4) % 2 === 0) ? 1 : 0);
      css(cursor, { left: `${last.x + last.w + 5}px`, top: `${last.y - 4}px` });
      // the finished program runs: 2 goes in, 7 comes out
      setLine(a1, fade(t, 0.9, 0.25), t > 2.5 && t < 3.4 ? "var(--blue)" : GREY);
      setLine(a2, fade(t, 1.0, 0.25), t > 2.85 && t < 3.6 ? "var(--blue)" : GREY);
      const out = t >= 2.95;
      chipLook(cout, out ? "green" : "ghost");
      const txt = out ? L.fmtVal(DEMO_OUT) : "";
      if (cout.textContent !== txt) cout.textContent = txt;
      place(cout, { s: pop(t, 0.85) * (out ? 0.9 + 0.1 * pop(t, 2.95, 0.5) : 1), o: fade(t, 0.85) });
    };
  }

  // ---------- RIGHT: genetic programming ----------
  const SEQ = [0, -1, 3, 2, -1, 4, 1, 5]; // which little tree each flicker slot shows (-1 = the question mark)
  const SLOT = [0.09, 0.09, 0.1, 0.11, 0.12, 0.13, 0.15, 0.2]; // the flicker slows down as it settles
  const EVO = 5.35; // evolution takes over from "you" once the examples are in
  const FLICKER = 5.95;
  const BOUNDS = SLOT.reduce((a, d) => (a.push(a[a.length - 1] + d), a), [FLICKER]);
  const FOUND = BOUNDS[BOUNDS.length - 1]; // about 6.9 s
  const hitAt = (i) => FOUND + 0.45 + 0.12 * i; // when example i turns green (the last one by about 7.8 s)

  function buildRight(stage) {
    const P = panel(stage, 486, "purple", "Genetic programming");
    const labels = [colLabel(P.cards, "IN", INX), colLabel(P.cards, "OUT", OUTX, CWO)];
    const rows = GIVEN.map(([x, y], i) => {
      const yy = BOXY + i * PITCH;
      return {
        at: 3.9 + 0.28 * i,
        cin: chip(P.cards, INX, yy, L.fmtVal(x)),
        cout: chip(P.cards, OUTX, yy, L.fmtVal(y), CWO),
        a1: arrowR(P.svg, INX + CW + 4, BOXX - 4, yy + CH / 2),
        a2: arrowR(P.svg, BOXX + BOXW + 4, OUTX - 4, yy + CH / 2),
        ok: tickBadge(P.top, 28, OUTX + CWO - 17, yy - 12),
      };
    });

    const box = h("div", { class: "v-card c-orange", style: abs(BOXX, BOXY, BOXW, BOXH, "border-radius:28px") });
    boxLabel(box);
    const fill = abs(0, 44, 0, 188, `${FLEX}width:100%;font-weight:900;line-height:1;`);
    const q = box.appendChild(h("div", { text: "?", style: `${fill}font-size:150px;color:var(--amber-ink)` }));
    const formula = box.appendChild(
      h("div", { text: FORMULA, style: `${fill}height:92px;font-size:42px;color:var(--teal-ink)` }),
    );
    P.cards.append(box);
    const glyphs = SHAPES.map((sh) => stand(P.svg, CX, GLYPH_Y, 1, makeGlyph(sh)));
    const boxOk = tickBadge(P.top, 52, CX - 26, BOXY + 143);

    // you give the examples (small, under the "in" column) ...
    const person = makePerson();
    const pIn = stand(P.svg, 66, 528, 0.66, person.g);
    const pUp = arrowUp(P.svg, 66, 424, 362);
    const giveBeads = makeBeads(P.svg, 2, "blue");
    const you = tag(P.top, "You", "blue", 66, 540, 100, true);
    // ... and evolution takes the slot under the box that the person held on the left
    const evo = makeEvo();
    const eIn = stand(P.svg, CX, 478, 1, evo.g);
    const eUp = arrowUp(P.svg, CX, 428, 362);
    const workBeads = makeBeads(P.svg, 2, "violet");
    const evoTag = tag(P.top, "Evolution", "purple", CX, 538, 220);

    return (t) => {
      const kp = ramp(t, 3.3, 3.8);
      place(P.root, { y: Math.round((1 - kp) * 18), o: fade(t, 3.3, 0.3) });
      labels.forEach((l) => place(l, { s: pop(t, 3.75), o: fade(t, 3.75) }));
      // you give the behaviour: the examples arrive one by one
      place(pIn, { s: pop(t, 3.5, 0.45), o: fade(t, 3.5) });
      person.update(t, 0);
      place(you, { s: pop(t, 3.65, 0.4), o: fade(t, 3.65) });
      setLine(pUp, ramp(t, 3.7, 4.0), "var(--blue)");
      flowBeads(giveBeads, t, 3.95, 5.15, 66, 424, 388, 0.5);
      rows.forEach((r, i) => {
        const hit = t >= hitAt(i);
        place(r.cin, { s: pop(t, r.at), o: fade(t, r.at) });
        place(r.cout, { s: pop(t, r.at) * (1 + 0.12 * flash(t, hitAt(i), hitAt(i) + 0.35)), o: fade(t, r.at) });
        chipLook(r.cout, hit ? "green" : "plain");
        setLine(r.a1, ramp(t, r.at + 0.1, r.at + 0.35));
        setLine(r.a2, ramp(t, r.at + 0.2, r.at + 0.45));
        place(r.ok, { s: pop(t, hitAt(i), 0.4), o: fade(t, hitAt(i), 0.1) });
      });
      // the program box: unknown, then flickering through random programs, then found
      const mode = t < FLICKER ? "ghost" : t < FOUND ? "try" : "done";
      put(box, "class", mode === "done" ? "v-card c-green" : "v-card c-orange");
      css(box, { borderStyle: mode === "ghost" ? "dashed" : "", boxShadow: mode === "ghost" ? "none" : "" });
      place(box, { s: pop(t, 3.6) * (1 + 0.06 * flash(t, FOUND, FOUND + 0.35)), o: fade(t, 3.6) });
      const slot = BOUNDS.findIndex((b, i) => t >= b && t < BOUNDS[i + 1]);
      glyphs.forEach((g, i) => {
        const on = slot >= 0 && SEQ[slot] === i;
        place(g, { s: on ? lerp(0.8, 1, ramp(t, BOUNDS[slot], BOUNDS[slot] + 0.06, ease.lin)) : 1, o: on ? 1 : 0 });
      });
      const qOn = t < FOUND && (slot < 0 || SEQ[slot] === -1);
      place(q, { s: 1 + 0.05 * Math.sin(2 * Math.PI * (t - 3.6) * 0.8), o: qOn ? 1 : 0 });
      place(formula, { s: lerp(0.7, 1, pop(t, FOUND, 0.5)), o: fade(t, FOUND, 0.15) });
      place(boxOk, { s: pop(t, FOUND + 0.2, 0.45), o: fade(t, FOUND + 0.2, 0.1) });
      // evolution does the work
      place(eIn, { s: pop(t, EVO, 0.45) * (1 + 0.12 * flash(t, FOUND, FOUND + 0.4)), o: fade(t, EVO) });
      evo.spinTo(720 * ramp(t, FLICKER - 0.1, FOUND, ease.inOut));
      place(evoTag, { s: pop(t, EVO + 0.15, 0.4), o: fade(t, EVO + 0.15) });
      setLine(eUp, ramp(t, EVO + 0.25, EVO + 0.55), "var(--violet)");
      flowBeads(workBeads, t, FLICKER, FOUND, CX, 428, 388, 0.5);
    };
  }

  V.scene({
    kicker: "THE IDEA",
    title: ["Tell it what to do,", "not how"],
    dur: 9,
    caps: [
      [0.4, 3, "Normally you write the program."],
      [3.5, 6, "In GP you give examples of what it should do..."],
      [6.3, 8.7, "...and evolution finds a program that matches."],
    ],
    build(stage) {
      const left = buildLeft(stage);
      const right = buildRight(stage);
      return (t) => {
        left(t);
        right(t);
      };
    },
  });
})();
