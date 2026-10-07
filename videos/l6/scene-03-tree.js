/* Lecture 6 · Genetic programming, scene 03-tree: a program is a tree, run from the leaves up to the root.
   The code line types out, its tokens light up as the nine nodes grow, then a TIME dial feeds the tree: values travel
   up the edges (leaves first), the IF picks one branch, and moving the dial to 11 makes it pick the other one. */
(function () {
  const V = window.VID;
  const L = V.l6;
  const { h, s, show, ramp, ease, clamp, lerp } = V;
  const lin = ease.lin;
  const NBSP = String.fromCharCode(160);
  const pillW = (text) => Math.max(44, text.length * 16.8 + 26); // the width of a 28 px value pill

  // ---------- the program, and what it computes (every number comes from the evaluator) ----------
  const SRC = "(+ 1 2 (IF (> TIME 10) 3 4))";
  const ROOT = L.parse("(+#root 1#one 2#two (IF#if (>#gt TIME#time 10#ten) 3#three 4#four))");
  const ORDER = ["root", "one", "two", "if", "gt", "time", "ten", "three", "four"]; // reading order of the code
  const IS_FN = {};
  L.walk(ROOT, (n) => (IS_FN[n.id] = n.kids.length > 0));

  // ---------- timeline (local seconds) ----------
  const TYPE = [0.6, 1.7];
  const GROW = { from: 2.0, gap: 0.11, dur: 0.7 };
  const DIAL_IN = [3.55, 3.95];
  const TAGS_IN = [3.55, 3.95]; // the "root" and "leaf" labels
  const SLIDE = [8.5, 9.1]; // the dial moves from TIME = 5 to TIME = 11
  const CLEAR = [8.5, 8.85]; // the old values fade away
  const POP = 0.4;
  const NEVER = 1e9;

  /** One evaluation, from the moment TIME lands in its leaf (b); r stretches the pace (1 = calm, 0.8 = a little faster). */
  function phase(b, r, TIME) {
    const at = (x) => b + x * r;
    const vals = L.evalAll(ROOT, { TIME });
    const cond = vals.get("gt");
    return {
      TIME,
      vals,
      b,
      pick: cond ? "three" : "four",
      other: cond ? "four" : "three",
      fly: [b - 0.4 * r, b], // the dial's value flies into the TIME leaf
      gt: [at(0.6), at(1.0)], // TIME and 10 fly up into >
      cond: [at(1.4), at(1.8)], // the true / false answer flies up into IF
      choice: [at(1.8), at(2.1)], // IF looks at it and picks a branch
      take: [at(2.3), at(2.7)], // the picked branch flies up into IF
      plus: [at(3.0), at(3.4)], // 1, 2 and IF's value fly up into +
    };
  }
  const P = [phase(4.4, 1, 5), phase(9.45, 0.8, 11)];

  // value badges: each node can show a list of values over time (the second replaces the first)
  const BADGE = {};
  const addBadge = (id, text, tone, from, out) => (BADGE[id] = BADGE[id] || []).push({ text, tone, from, out });
  ["one", "two", "ten", "three", "four"].forEach((id, i) =>
    addBadge(id, L.fmtVal(P[0].vals.get(id)), "green", P[0].b + 0.05 + i * 0.07, NEVER),
  );
  P.forEach((p, i) => {
    const out = i ? NEVER : CLEAR[0];
    const txt = (id) => L.fmtVal(p.vals.get(id));
    const tn = (id) => (p.vals.get(id) === false ? "red" : "green");
    addBadge("time", txt("time"), "green", p.b, out);
    addBadge("gt", txt("gt"), tn("gt"), p.gt[1], out);
    addBadge("if", txt("if"), "green", p.take[1], out);
    addBadge("root", txt("root"), "green", p.plus[1], out);
    addBadge("sum", ["one", "two", "if"].map(txt).join(" + "), "grey", p.plus[1], out); // what the + adds up
  });
  function badgeAt(id, t) {
    let cur = null;
    for (const b of BADGE[id] || []) if (t >= b.from) cur = b;
    if (!cur) return null;
    const k = ramp(t, cur.from, cur.from + POP, lin) * (1 - ramp(t, cur.out, cur.out + (CLEAR[1] - CLEAR[0]), lin));
    return k > 0 ? { ...cur, k } : null;
  }

  // ---------- the TIME dial (stage px) ----------
  const DX0 = 190;
  const DX1 = 890;
  const DY = 592;
  const KNOB = 26;
  const UNIT = 56; // px per TIME unit along the track
  const dialX = (v) => DX0 + v * UNIT;

  V.scene({
    kicker: "PROGRAMS AS TREES",
    title: ["A program", "is a tree"],
    dur: 13,
    caps: [
      [0.4, 3.5, "A program can be drawn as a tree."],
      [4, 8, "It runs from the leaves up to the root."],
      [8.5, 12.5, "Change the input and a different branch is used."],
    ],
    build(stage) {
      // ----- the code line -----
      const chars = [...SRC].map((c) =>
        h("span", {
          text: c === " " ? NBSP : c,
          style: { display: "inline-block", width: "1ch", boxSizing: "border-box", textAlign: "center" },
        }),
      );
      const card = h(
        "div",
        {
          class: "v-card plain",
          style: {
            position: "relative",
            top: "10px",
            padding: "7px 24px 9px",
            fontFamily: "var(--mono)",
            fontSize: "34px",
            fontWeight: "700",
            lineHeight: "1.25",
            whiteSpace: "pre",
          },
        },
        ...chars,
      );
      const strip = h(
        "div",
        {
          style: {
            position: "absolute",
            left: "0",
            top: "0",
            width: "936px",
            display: "flex",
            justifyContent: "center",
          },
        },
        card,
      );
      stage.append(strip);
      const owner = []; // character index -> position of its node in ORDER
      const span = []; // node position -> [first, last] character
      for (const m of SRC.matchAll(/[^\s()]+/g)) {
        span.push([m.index, m.index + m[0].length - 1]);
        for (let c = m.index; c < m.index + m[0].length; c++) owner[c] = span.length - 1;
      }
      const growStart = (i) => GROW.from + i * GROW.gap;

      // ----- the dial (drawn first, so the tree and its tokens sit above it) -----
      const dial = s("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
      Object.assign(dial.style, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
      const x10 = dialX(10);
      const TRACK = 48; // the bar is a little thinner than the knob
      const bar = (extra, dy = 0) =>
        s("rect", { x: DX0, y: DY - TRACK / 2 + dy, width: DX1 - DX0, height: TRACK, rx: TRACK / 2, ...extra });
      const zone = (id, x0, x1, fill) => {
        const part = bar({ "clip-path": `url(#${id})` });
        part.style.fill = fill;
        return [s("clipPath", { id }, s("rect", { x: x0, y: DY - TRACK, width: x1 - x0, height: 2 * TRACK })), part];
      };
      const [clipL, zoneL] = zone("l6s3-zl", DX0 - 4, x10, "var(--rose-dim)");
      const [clipR, zoneR] = zone("l6s3-zr", x10, DX1 + 4, "var(--teal-dim)");
      const trackLip = bar({}, 5);
      trackLip.style.fill = "var(--line-2)";
      const trackEdge = bar({ "stroke-width": 3 });
      Object.assign(trackEdge.style, { fill: "none", stroke: "var(--line-2)" });
      const divider = s("path", { d: `M${x10} ${DY - 30}V${DY + 30}`, "stroke-width": 5, "stroke-linecap": "round" });
      Object.assign(divider.style, { stroke: "var(--ink)", fill: "none" });
      /** A round tick or cross sticker drawn inside the dial (so the knob can slide over it); look(tone, solid) restyles it. */
      const mark = (glyph, cx, cy) => {
        const R = 21;
        const lip = s("circle", { r: R, cy: 3 });
        const face = s("circle", { r: R, "stroke-width": 3 });
        const ink = s("path", {
          d: glyph,
          fill: "none",
          "stroke-width": 6,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        });
        const g = s("g", { transform: `translate(${cx} ${cy})` }, lip, face, ink);
        return {
          g,
          look(tone, solid) {
            g.setAttribute("class", `c-${tone}`);
            lip.style.fill = solid ? "var(--c-lip)" : "var(--c-edge)";
            face.style.fill = solid ? "var(--c)" : "var(--c-dim)";
            face.style.stroke = solid ? "var(--c-lip)" : "var(--c-edge)";
            ink.style.stroke = solid ? "var(--c-on)" : "var(--c-ink)";
          },
        };
      };
      const markFalse = mark("M-8 -8L8 8M8 -8L-8 8", x10 - 84, DY);
      const markTrue = mark("M-10 1L-3 8L10 -8", x10 + 112, DY);
      const tenW = pillW("10");
      const tenLip = s("rect", { x: x10 - tenW / 2, y: DY - 17, width: tenW, height: 40, rx: 20 });
      const tenFace = s("rect", { x: x10 - tenW / 2, y: DY - 20, width: tenW, height: 40, rx: 20, "stroke-width": 3 });
      const tenText = s("text", { "text-anchor": "middle", x: x10, y: DY + 10 }, "10");
      Object.assign(tenLip.style, { fill: "var(--line-2)" });
      Object.assign(tenFace.style, { fill: "var(--panel)", stroke: "var(--line-2)" });
      Object.assign(tenText.style, { fontSize: "28px", fontWeight: "900", fill: "var(--text-dim)" });
      const tagTen = s("g", {}, tenLip, tenFace, tenText);
      const knobLip = s("circle", { r: KNOB, cy: 5 });
      knobLip.style.fill = "var(--blue-lip)";
      const knobFace = s("circle", { r: KNOB, "stroke-width": 3 });
      Object.assign(knobFace.style, { fill: "var(--blue)", stroke: "var(--blue-lip)" });
      const knobText = s("text", { "text-anchor": "middle", y: 11 });
      Object.assign(knobText.style, { fontSize: "32px", fontWeight: "900", fill: "var(--blue-on)" });
      const knob = s("g", {}, knobLip, knobFace, knobText);
      const dialG = s(
        "g",
        {},
        clipL, clipR, trackLip, zoneL, zoneR, trackEdge, divider, markFalse.g, markTrue.g, tagTen, knob,
      ); // prettier-ignore
      dial.append(dialG);
      stage.append(dial);

      // ----- the tree -----
      const tr = L.tree(stage, { root: ROOT, x: 0, y: 94, w: 936, h: 444, node: 56, rows: 2, hidden: true });
      tr.all().forEach((id) => tr.value(id, "0", 0)); // make every badge once, so the flowing dots are created above them
      tr.draw();
      const timeTile = L.tile(stage, "TIME", { size: 56 });
      const tagRoot = L.pill(stage, "root", { tone: "grey", look: "soft", o: 0 });
      const tagSum = L.pill(stage, "0 + 0 + 0", { tone: "grey", look: "soft", o: 0 });
      const tagLeaf = L.pill(stage, "leaf", { tone: "grey", look: "soft", o: 0 });

      // ----- flows: a dot climbs an edge from a kid to its parent and leaves a coloured trail behind it -----
      const lay = L.layer(stage);
      const curve = (x0, y0, x1, y1, x2, y2, x3, y3) => {
        // a cubic Bezier sampled in 64 steps, so a point can be found by the fraction of its length (pure maths, no DOM)
        const pts = [];
        const cum = [0];
        for (let i = 0; i <= 64; i++) {
          const g = i / 64;
          const m = 1 - g;
          pts.push([
            m ** 3 * x0 + 3 * m * m * g * x1 + 3 * m * g * g * x2 + g ** 3 * x3,
            m ** 3 * y0 + 3 * m * m * g * y1 + 3 * m * g * g * y2 + g ** 3 * y3,
          ]);
          if (i) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        }
        return {
          d: `M${x0.toFixed(1)} ${y0.toFixed(1)}C${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} ${x3.toFixed(1)} ${y3.toFixed(1)}`,
          at(u) {
            const want = clamp(u) * cum[64];
            let i = 1;
            while (i < 64 && cum[i] < want) i++;
            const k = (want - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
            return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
          },
        };
      };
      const climb = (kid, up) => {
        const c = tr.node(kid);
        const p = tr.node(up);
        const y1 = p.cy + p.h / 2;
        const y2 = c.cy - c.h / 2;
        return curve(c.cx, y2, c.cx, (y1 + y2) / 2, p.cx, (y1 + y2) / 2, p.cx, y1);
      };
      const flows = [];
      const flow = (win, path, tone, to, stale) => {
        const trail = s("path", {
          d: path.d,
          fill: "none",
          pathLength: 1,
          "stroke-width": 7,
          "stroke-linecap": "round",
          class: `c-${tone}`,
        });
        trail.style.stroke = "var(--c)";
        const lip = s("circle", { r: 14, cy: 3 });
        lip.style.fill = "var(--c-lip)";
        const face = s("circle", { r: 14, "stroke-width": 3 });
        Object.assign(face.style, { fill: "var(--c)", stroke: "var(--c-lip)" });
        const dot = s("g", { class: `c-${tone}` }, lip, face);
        lay.edges.append(trail);
        lay.badges.append(dot);
        flows.push({ win, path, to, stale, trail, dot });
      };
      P.forEach((p, i) => {
        const dialTop = [dialX(p.TIME), DY - KNOB];
        const time = tr.node("time");
        const wire = curve(
          dialTop[0],
          dialTop[1],
          dialTop[0],
          dialTop[1] - 50,
          time.cx,
          time.cy + time.h / 2 + 50,
          time.cx,
          time.cy + time.h / 2,
        );
        flow(p.fly, wire, "green", "time", !i);
        flow(p.gt, climb("time", "gt"), "green", "gt", !i);
        flow(p.gt, climb("ten", "gt"), "green", "gt", !i);
        flow(p.cond, climb("gt", "if"), p.vals.get("gt") ? "green" : "red", "if", !i);
        flow(p.take, climb(p.pick, "if"), "green", "if", !i);
        ["one", "two", "if"].forEach((kid) => flow(p.plus, climb(kid, "root"), "green", "root", !i));
      });

      // ----- one frame of each part -----
      function drawCode(t) {
        const appear = ramp(t, 0.35, 0.65);
        V.place(strip, { y: (1 - appear) * 12, o: appear });
        const typed = Math.round(SRC.length * ramp(t, TYPE[0], TYPE[1], lin));
        const typing = t < GROW.from;
        chars.forEach((c, i) => {
          const st = c.style;
          st.visibility = i < typed ? "" : "hidden";
          st.boxShadow = typing && i === typed - 1 ? "4px 0 0 var(--blue)" : "none";
          const n = owner[i];
          const born = n == null ? -1 : t - growStart(n);
          st.background = "transparent";
          st.color = "var(--ink)";
          st.borderRadius = "0";
          if (born >= 0) {
            const tn = IS_FN[ORDER[n]] ? "violet" : "blue";
            const hot = born < 0.45;
            st.background = hot ? `var(--${tn})` : `var(--${tn}-dim)`;
            st.color = hot ? `var(--${tn}-on)` : `var(--${tn}-ink)`;
            const [a, z] = span[n];
            st.borderRadius = `${i === a ? 8 : 0}px ${i === z ? 8 : 0}px ${i === z ? 8 : 0}px ${i === a ? 8 : 0}px`;
          }
        });
      }

      function drawDial(t) {
        const o = ramp(t, DIAL_IN[0], DIAL_IN[1], lin);
        const dy = (1 - ramp(t, DIAL_IN[0], DIAL_IN[1])) * 6;
        const tv = lerp(P[0].TIME, P[1].TIME, ramp(t, SLIDE[0], SLIDE[1], ease.inOut));
        const right = tv > 10;
        dialG.setAttribute("transform", `translate(0 ${dy.toFixed(1)})`);
        show(dialG, o);
        knob.setAttribute("transform", `translate(${dialX(tv).toFixed(1)} ${DY})`);
        const label = String(Math.round(tv));
        if (knobText.textContent !== label) knobText.textContent = label;
        markFalse.look("red", !right);
        markTrue.look("green", right);
        timeTile.apply({ x: 82, y: DY + dy, o });
      }

      function drawTree(t) {
        ORDER.forEach((id, i) => tr.reveal(id, ramp(t, growStart(i), growStart(i) + GROW.dur, lin)));
        // IF picks one branch: the picked leaf turns orange, the other one greys out (and drops its badge)
        const pick = { three: { on: 0, off: 0 }, four: { on: 0, off: 0 } };
        P.forEach((p, i) => {
          const k = ramp(t, p.choice[0], p.choice[1], lin) * (i ? 1 : 1 - ramp(t, CLEAR[0], CLEAR[1], lin));
          pick[p.pick].on = Math.max(pick[p.pick].on, k);
          pick[p.other].off = Math.max(pick[p.other].off, k);
        });
        for (const [id, { on, off }] of Object.entries(pick)) {
          if (on > 0.02) tr.set(id, { tone: "orange", etone: "orange", halo: on });
          if (off > 0.02) tr.set(id, { tone: "grey", look: "soft", o: 1 - 0.55 * off });
        }
        // a node bumps when a value arrives (the IF also bumps when it picks)
        const bump = {};
        flows.forEach((f) => (bump[f.to] = Math.max(bump[f.to] || 0, V.flash(t, f.win[1] - 0.12, f.win[1] + 0.3))));
        P.forEach((p) => (bump.if = Math.max(bump.if, V.flash(t, p.choice[0], p.choice[1] + 0.2))));
        for (const [id, k] of Object.entries(bump)) if (k > 0) tr.set(id, { pulse: k * 0.8 });
        ORDER.forEach((id) => {
          const b = badgeAt(id, t);
          if (b) tr.value(id, b.text, b.k * (1 - (pick[id] ? pick[id].off : 0)), b.tone);
        });
        tr.draw();
      }

      function drawTags(t) {
        const k = ramp(t, TAGS_IN[0], TAGS_IN[1], lin);
        const grey = { tone: "grey", look: "soft", s: ease.pop(ramp(t, TAGS_IN[0], TAGS_IN[1], lin)), o: k };
        const root = tr.node("root");
        const leaf = tr.node("ten");
        tagRoot.apply({ ...grey, text: "root", x: root.cx - root.w / 2 - 14 - pillW("root") / 2, y: root.cy });
        tagLeaf.apply({ ...grey, text: "leaf", x: leaf.cx + leaf.w / 2 + 14 + pillW("leaf") / 2, y: leaf.cy });
        const sum = badgeAt("sum", t);
        if (!sum) return tagSum.apply({ o: 0 });
        const x = root.cx + root.w / 2 + 14 + pillW(sum.text) / 2;
        tagSum.apply({
          tone: "grey",
          look: "soft",
          text: sum.text,
          x,
          y: root.cy,
          s: ease.pop(sum.k),
          o: Math.min(1, sum.k * 4),
        });
      }

      function drawFlows(t) {
        flows.forEach((f) => {
          const [a, b] = f.win;
          const u = ease.inOut(clamp((t - a) / (b - a)));
          const gone = f.stale ? ramp(t, CLEAR[0], CLEAR[1], lin) : 0; // the first round's trails fade when the dial moves
          f.trail.setAttribute("stroke-dasharray", `${u.toFixed(4)} 2`);
          show(f.trail, t < a ? 0 : 1 - gone);
          const on = t >= a && t < b + 0.08;
          const [x, y] = on ? f.path.at(u) : [0, 0];
          const end = ramp(u, 0.85, 1, lin);
          const size = on ? 1 - 0.5 * end : 0; // a dot that is off is always parked at the same place, so any frame is the same
          f.dot.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${size.toFixed(3)})`);
          show(f.dot, on ? 1 : 0);
        });
      }

      return (t) => {
        drawCode(t);
        drawDial(t);
        drawTree(t);
        drawTags(t);
        drawFlows(t);
      };
    },
  });
})();
