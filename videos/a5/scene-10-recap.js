/* Phase 5 · Convex Hulls (algo-5), scene 10-recap: three rows, each a small animated pictogram and one bold line. Bare scene.
   Story (local seconds): 0.1 title and Byte, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.35 s after its row, 5.4 the
   call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no fade, no reset): row 1 is done at about 5.2,
   row 2 at 6.1 and row 3 at 7.0, so for the last two seconds only Byte's bob moves.
   Row 1 (green): a path p -> a -> b bends LEFT: the path turns green and a green left arrow draws on; b slides over to the other
          side, the bend becomes a RIGHT turn (the sign of the real turn test decides the colour: red and a red right arrow); b slides
          back and the finished frame is the green left turn.
   Row 2 (purple): the seven points as dots. A (the leftmost) turns green, a purple line swings clockwise round it until it touches
          G (A5.WRAP round 1, from straight up), A-G turns green; the same quick swing from G, E, D and C draws G-E, E-D, D-C and C-A;
          the green tint fills the hull.
   Row 3 (blue): the same dots and a tiny stack cup. A purple line sweeps anticlockwise round the lowest point C and touches D, E,
          F, G, B, A in sorted order (A5.SORT); each touched point is pushed on the stack (a green slab); G arrives after F, the turn
          E-F-G is a right turn (red), F is popped (red slab out, F dims) and G pushed; B is pushed and popped when A arrives; the
          stack C D E G A is the hull: the closing edge, the tint and a green tick.
   Every turn, angle and stack state comes from A5.turnKind / A5.WRAP / A5.SCAN and is asserted when the scene is built. No numbers
   on screen; the dots carry no letters (the row labels are the words). */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const L5 = V.l5;
  const { ramp, flash, lerp, clamp, ease: E } = V;
  const lin = E.lin;

  const f1 = (n) => n.toFixed(1);
  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const START = APPEAR.map((a) => a + 0.35);
  const mod360 = (d) => ((d % 360) + 360) % 360;

  // set a colour role on an SVG element only when it changes
  const roleOf = (el, tone) => {
    const c = `c-${tone}`;
    if (el.getAttribute("class") !== c) el.setAttribute("class", c);
  };
  // a round sticker disc (lip underneath, face on top) at a movable centre
  function disc(parent, r, lip = 3) {
    const under = V.s("circle", { r });
    under.style.fill = "var(--c-lip)";
    const face = V.s("circle", { r, "stroke-width": 3 });
    Object.assign(face.style, { fill: "var(--c)", stroke: "var(--c-lip)" });
    const g = parent.appendChild(V.s("g", {}, under, face));
    return ({ x, y, tone, k = 1, s = 1 }) => {
      roleOf(g, tone);
      [under, face].forEach((c, i) => {
        c.setAttribute("cx", f1(x));
        c.setAttribute("cy", f1(y + (i ? 0 : lip)));
      });
      V.place(g, { s: (0.5 + 0.5 * E.pop(clamp(k))) * s, o: Math.min(1, k * 4) });
    };
  }
  // a thick round-capped stroke from (x1, y1) to (x2, y2), set every frame
  function stroke(parent, w) {
    const line = parent.appendChild(V.s("line", { "stroke-width": w, "stroke-linecap": "round" }));
    line.style.stroke = "var(--c)";
    return ({ a, b, tone, o = 1 }) => {
      roleOf(line, tone);
      Object.entries({ x1: a[0], y1: a[1], x2: b[0], y2: b[1] }).forEach(([k, v]) => line.setAttribute(k, f1(v)));
      V.show(line, o);
    };
  }
  // a round green sticker with a tick (drawn on, then popped)
  function tickBadge(parent, x, y, r) {
    const green = L5.tone("green");
    const svg = L5.svg(parent, PIC.w, PIC.h);
    const lip = V.s("circle", { cx: x, cy: y + 4, r, style: { fill: green.edge } });
    const face = V.s("circle", { cx: x, cy: y, r, "stroke-width": 3, style: { fill: green.dim, stroke: green.edge } });
    const tick = L5.tick(x, y, r * 1.8, "green", { ink: true, w: 6 });
    const g = svg.appendChild(V.s("g", {}, lip, face, tick));
    return (k) => {
      L5.drawOn(tick, ramp(k, 0.2, 1, lin));
      V.place(g, { s: 0.7 + 0.3 * E.pop(clamp(k)), o: Math.min(1, k * 4) });
    };
  }

  // ---------- row 1: one cross product tells left from right ----------
  function turnRow(pic) {
    const [p, a, bLeft, bRight] = [[70, 110], [160, 80], [130, 20], [250, 100]]; // prettier-ignore
    A5.same("recap row 1: the first bend", A5.turnKind(p, a, bLeft), "left");
    A5.same("recap row 1: the second bend", A5.turnKind(p, a, bRight), "right");
    A5.same("recap row 1: straight between", A5.turnKind(p, a, [250, 50]), "straight"); // on the line p -> a
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const seg1 = stroke(svg, 7);
    const seg2 = stroke(svg, 7);
    const [dP, dA, dB] = [disc(svg, 12), disc(svg, 12), disc(svg, 12)];
    const iconL = svg.appendChild(A5.turnIcon("left", 300, 70, 60, "green"));
    const iconR = svg.appendChild(A5.turnIcon("right", 300, 70, 60, "red"));
    const T = { judge: 1.0, out: [2.1, 2.7], back: [3.5, 4.1], rDraw: [2.45, 2.95], lAgain: [3.8, 4.3] };

    return (q) => {
      const k = ramp(q, T.out[0], T.out[1], E.inOut) - ramp(q, T.back[0], T.back[1], E.inOut); // 0 = left bend, 1 = right
      const b = [lerp(bLeft[0], bRight[0], k), lerp(bLeft[1], bRight[1], k)];
      const val = A5.turnValue(p, a, b);
      const tone = q < T.judge ? "blue" : val >= 0 ? "green" : "red";
      const bump = 1 + 0.18 * flash(q, T.judge, T.judge + 0.35);
      const e1 = ramp(q, 0.15, 0.5, lin);
      const e2 = ramp(q, 0.55, 1.0, lin);
      seg1({ a: p, b: [lerp(p[0], a[0], e1), lerp(p[1], a[1], e1)], tone, o: e1 < 0.003 ? 0 : 1 });
      seg2({ a, b: [lerp(a[0], b[0], e2), lerp(a[1], b[1], e2)], tone, o: e2 < 0.003 ? 0 : 1 });
      dP({ x: p[0], y: p[1], tone, k: ramp(q, 0, 0.4, lin), s: bump });
      dA({ x: a[0], y: a[1], tone, k: ramp(q, 0.15, 0.55, lin), s: bump });
      dB({ x: b[0], y: b[1], tone, k: ramp(q, 0.55, 1.0, lin), s: bump });
      const leftDraw = q < T.back[0] ? ramp(q, T.judge, T.judge + 0.5, lin) : ramp(q, T.lAgain[0], T.lAgain[1], lin);
      L5.drawOn(iconL, leftDraw);
      V.place(iconL, { o: clamp(val / 800) });
      L5.drawOn(iconR, ramp(q, T.rDraw[0], T.rDraw[1], lin));
      V.place(iconR, { o: clamp(-val / 800) });
    };
  }

  // ---------- row 2: wrapping swings a line round every corner ----------
  function wrapRow(pic) {
    const W = A5.WRAP;
    A5.same("recap row 2: hull order", W.hull, ["A", "G", "E", "D", "C"]);
    A5.same(
      "recap row 2: winners",
      W.rounds.map((r) => r.best),
      ["G", "E", "D", "C", "A"],
    );
    A5.close("recap row 2: round 1 swing", A5.sweepDeg("A", "G"), 42.6, 0.05);
    const pl = A5.plot(pic, {
      pos: A5.pos({ x: 50, y: 8, s: 0.62 }),
      r: 7,
      letters: false,
      segs: 8,
      polys: 1,
      arcs: 0,
      tags: 0,
    });
    const BOX = [0, 0, 300, 140];
    const names = A5.NAMES;
    // each round: the line swings clockwise from `from` to the winner's direction (round 1 from straight up, the real sweep;
    // later rounds just the last 45 degrees, which hold no other point, so the winner is the first one touched)
    const rounds = W.rounds.map((r, i) => {
      const [h, w] = [pl.xy(r.h), pl.xy(r.best)];
      const to = A5.angle(h, w);
      const from = i === 0 ? -90 : to - 45;
      names
        .filter((n) => n !== r.h && n !== r.best)
        .forEach((n) => {
          const d = mod360(A5.angle(h, pl.xy(n)) - from);
          if (d > 0 && d < mod360(to - from))
            throw new Error(`recap row 2: ${n} lies inside the swing of round ${i + 1}`);
        });
      const s = i === 0 ? 0.3 : 1.15 + 0.55 * (i - 1);
      const swing = i === 0 ? [s, 0.9] : [s, s + 0.3];
      const edge = i === 0 ? [0.9, 1.15] : [s + 0.3, s + 0.5];
      return { h: r.h, w: r.best, hp: h, wp: w, from, to, swing, edge };
    });
    const reached = { A: 0.15 };
    rounds.forEach((r) => (reached[r.w] = r.edge[1]));
    const last = rounds[rounds.length - 1].edge[1]; // C -> A closes the loop
    const TINT = [last, last + 0.5];

    return (q) => {
      const points = {};
      names.forEach((n, i) => {
        const k = ramp(q, 0.04 * i, 0.04 * i + 0.3, lin);
        const on = q >= (reached[n] ?? 1e9);
        const bump = on ? flash(q, reached[n], reached[n] + 0.35) + (n === "A" ? flash(q, last, last + 0.35) : 0) : 0;
        points[n] = {
          s: E.pop(k) * (1 + 0.3 * bump),
          o: Math.min(1, k * 4),
          ...(on ? { tone: "green", solid: true } : {}),
        };
      });
      const segs = [];
      rounds.forEach((r) => {
        const ang = lerp(r.from, r.to, ramp(q, r.swing[0], r.swing[1], E.inOut));
        const o = ramp(q, r.swing[0] - 0.05, r.swing[0] + 0.1, lin) * (1 - ramp(q, r.edge[0], r.edge[1] + 0.1, lin));
        if (o > 0.003) segs.push({ a: r.h, b: A5.rayEnd(r.hp, ang, BOX), tone: "purple", w: 0.55, trimB: 0, o });
      });
      rounds.forEach((r) =>
        segs.push({ a: r.hp, b: r.wp, tone: "green", w: 0.62, k: ramp(q, r.edge[0], r.edge[1], lin) }),
      );
      pl.update({
        points,
        segs,
        polys: [{ pts: W.hull, tone: "green", fill: 0.5, w: 0.62, o: ramp(q, TINT[0], TINT[1], lin) }],
      });
    };
  }

  // ---------- row 3: the scan sorts, pushes and pops dents ----------
  function scanRow(pic) {
    const S = A5.scan(A5.PTS);
    A5.same("recap row 3: pivot", S.pivot, "C");
    A5.same("recap row 3: sorted order", S.order, ["D", "E", "F", "G", "B", "A"]);
    A5.same("recap row 3: popped", S.popped, ["F", "B"]);
    A5.same("recap row 3: the hull", S.stack, ["C", "D", "E", "G", "A"]);
    const pl = A5.plot(pic, {
      pos: A5.pos({ x: 8, y: 8, s: 0.62 }),
      r: 7,
      letters: false,
      segs: 12,
      polys: 1,
      arcs: 0,
      tags: 0,
    });
    const XY = pl.xy;

    // ---- plan: simulate the scan and give every push, pop and edge a time (in "u" seconds)
    const slabs = {}; // name -> {j (slot), push, red, pop}
    const edges = []; // {a, b, draw: [t0, t1], red (time it turns red, or null), fade: [t0, t1] | null}
    const arrive = { [S.pivot]: 0.15 };
    const stack = [];
    const push = (name, t, d0 = t) => {
      slabs[name] = { j: stack.length, push: t, red: null, pop: null };
      if (stack.length)
        edges.push({ a: stack[stack.length - 1], b: name, draw: [d0, d0 + 0.22], red: null, fade: null });
      stack.push(name);
    };
    push(S.pivot, 0.15);
    push(S.order[0], 0.4);
    arrive[S.order[0]] = 0.4;
    let t = 0.4;
    S.rounds.forEach((r) => {
      const arr = t + 0.3;
      arrive[r.p] = arr;
      if (!r.popped.length) {
        push(r.p, arr);
        t = arr;
      } else {
        A5.same("recap row 3: one pop at a time", [r.popped.length, r.popped[0]], [1, stack[stack.length - 1]]);
        const gone = r.popped[0];
        const into = edges.find((e) => e.b === gone);
        const tentative = { a: gone, b: r.p, draw: [arr, arr + 0.22], red: 0, fade: [arr + 0.4, arr + 0.7] };
        edges.push(tentative);
        Object.assign(slabs[gone], { red: arr + 0.1, pop: arr + 0.3 });
        Object.assign(into, { red: arr + 0.1, fade: [arr + 0.4, arr + 0.7] });
        stack.pop();
        push(r.p, arr + 0.65, arr + 0.5);
        t = arr + 0.65;
      }
      A5.same(`recap row 3: stack after ${r.p}`, stack, r.after);
    });
    A5.same("recap row 3: the stack is the hull", stack, S.stack);
    const CLOSE = [t + 0.15, t + 0.4];
    const TINT = [t + 0.25, t + 0.65];
    const TICK = [t + 0.45, t + 0.85];
    edges.push({ a: stack[stack.length - 1], b: stack[0], draw: CLOSE, red: null, fade: null });
    const SPEED = 1.1; // the plan is written in u seconds; the picture runs 10% faster so everything is done by about 7 s
    if (TICK[1] / SPEED > 3.8) throw new Error("recap row 3: the pictogram must be done 3.8 s after it starts");

    // ---- the sweep line: it points at each sorted point as that point arrives (anticlockwise from east)
    const aim = S.order.map((n) => -A5.SORT.ccw[n]);
    const sweep = (u) => {
      let prev = 0;
      for (let i = 0; i < S.order.length; i++) {
        const at = arrive[S.order[i]];
        if (u < at) return lerp(prev, aim[i], ramp(u, at - 0.22, at, E.inOut));
        prev = aim[i];
      }
      return prev;
    };
    const C = XY(S.pivot);
    const BOX = [0, 0, 255, 140];

    // ---- the stack cup, drawn on the right
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const cup = V.s("path", {
      d: "M270 4L270 134L334 134L334 4",
      fill: "none",
      "stroke-width": 6,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    cup.style.stroke = "var(--line-2)";
    svg.append(cup);
    const slabY = (j) => 108 - 24 * j;
    const slabEls = Object.fromEntries(
      Object.entries(slabs).map(([name, s]) => {
        const lip = V.s("rect", { x: 280, y: slabY(s.j) + 3, width: 44, height: 20, rx: 5 });
        lip.style.fill = "var(--c-lip)";
        const face = V.s("rect", { x: 280, y: slabY(s.j), width: 44, height: 20, rx: 5, "stroke-width": 3 });
        Object.assign(face.style, { fill: "var(--c)", stroke: "var(--c-lip)" });
        return [name, svg.appendChild(V.s("g", {}, lip, face))];
      }),
    );
    const badge = tickBadge(pic, 250, 28, 18);

    return (q) => {
      const u = q * SPEED;

      // dots: grey until the sweep reaches them, blue while the scan looks at them, green on the stack, red when popped
      const points = {};
      A5.NAMES.forEach((n, i) => {
        const [k, sl, arr] = [ramp(q, 0.04 * i, 0.04 * i + 0.3, lin), slabs[n], arrive[n]];
        let st = {};
        if (u >= arr) st = { tone: "blue" };
        if (u >= sl.push) st = { tone: "green", solid: true, s: 1 + 0.3 * flash(u, sl.push, sl.push + 0.3) };
        if (sl.pop !== null && u >= sl.red) st = { tone: "red", solid: true };
        if (sl.pop !== null && u >= sl.pop + 0.35) st = { s: 0.9 };
        points[n] = { ...st, s: E.pop(k) * (st.s ?? 1), o: Math.min(1, k * 4) };
      });

      // the sweep line (purple) goes under the edges
      const segs = [];
      const sw = ramp(u, 0.05, 0.2, lin) * (1 - ramp(u, CLOSE[0], CLOSE[0] + 0.3, lin));
      if (sw > 0.003)
        segs.push({ a: S.pivot, b: A5.rayEnd(C, sweep(u), BOX), tone: "purple", w: 0.5, trimB: 0, o: sw });
      edges.forEach((e) => {
        const red = e.red !== null && u >= e.red;
        const gone = e.fade ? ramp(u, e.fade[0], e.fade[1], lin) : 0;
        segs.push({
          a: XY(e.a),
          b: XY(e.b),
          tone: red ? "red" : "green",
          w: 0.62,
          k: ramp(u, e.draw[0], e.draw[1], lin),
          o: 1 - gone,
        });
      });
      pl.update({
        points,
        segs,
        polys: [{ pts: S.stack, tone: "green", fill: 0.5, w: 0.62, o: ramp(u, TINT[0], TINT[1], lin) }],
      });

      // the stack: a slab drops in on a push, turns red and slides out on a pop
      V.show(cup, ramp(q, 0, 0.3, lin));
      Object.entries(slabs).forEach(([name, s]) => {
        const g = slabEls[name];
        const pk = ramp(u, s.push, s.push + 0.25, lin);
        const out = s.pop === null ? 0 : ramp(u, s.pop, s.pop + 0.35, E.inOut);
        roleOf(g, s.red !== null && u >= s.red ? "red" : "green");
        V.place(g, { y: -34 * (1 - E.out(pk)) - 40 * out, o: Math.min(1, pk * 4) * (1 - ramp(out, 0.4, 1, lin)) });
      });
      badge(ramp(u, TICK[0], TICK[1], lin));
    };
  }

  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const head = V.h("div", {
        class: "v-title-line",
        text: "Remember",
        style: { position: "absolute", left: "72px", top: "108px", fontSize: "76px" },
      });
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP" });
      const mascot = V.mascot("byte", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["green", "One cross product\ntells left from right", turnRow],
        ["purple", "Wrapping: swing a line\ncost n × h", wrapRow],
        ["blue", "Scan: sort, pop dents\ncost n log n", scanRow],
      ].map(([tone, text, make], i) => {
        text.split("\n").forEach((line) => {
          if (line.length > 22) throw new Error(`recap: "${line}" is longer than 22 characters`);
        });
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "440px",
            top: "0",
            height: "174px",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            fontSize: "36px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 5.C",
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          fontSize: "34px",
          padding: "8px 34px 10px",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 864, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
      });
      ctaBar.append(cta);
      stage.append(ctaBar);

      return (t) => {
        V.place(kicker, { y: (1 - ramp(t, 0.05, 0.45)) * 10, o: ramp(t, 0.05, 0.45) });
        V.place(head, { y: (1 - ramp(t, 0.1, 0.6)) * 20, o: ramp(t, 0.1, 0.6) });
        const m = ramp(t, 0.2, 0.9, E.pop);
        V.place(mascot, {
          y: (1 - m) * 30 + 6 * Math.sin((2 * Math.PI * t) / 2.6),
          r: 3 * Math.sin((2 * Math.PI * t) / 3.2 + 1),
          s: 0.7 + 0.3 * m,
          o: ramp(t, 0.2, 0.5),
        });
        rows.forEach((r, i) => {
          const k = ramp(t, APPEAR[i], APPEAR[i] + 0.5);
          V.place(r.card, { y: (1 - k) * 36, o: k });
          const kl = ramp(t, APPEAR[i] + 0.15, APPEAR[i] + 0.65);
          V.place(r.label, { x: (1 - kl) * 24, o: kl });
          r.update(t - START[i]);
        });
        const c = ramp(t, 5.4, 6.0, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 5.4, 5.7) });
      };
    },
  });
})();
