/* Lecture 7 · scene-06-stigmergy: stigmergy is communication through marks left in the environment (Grasse 1959).
   Beat A, a two-ant story: one ant walks nest to food and leaves twenty blue scent dots on the ground; a LATER ant starts off the trail,
   senses the dots (an orange ring) and turns onto them. The purple banner then names it: stigmergy, and the ground band turns purple
   (the environment).  Beat B, the two kinds side by side: SIGN-BASED (ants: a mark that is not the work) and SEMATONIC (the work itself
   prompts others: a pile gets one more block and two more builders walk in).  Concept pictures, not simulations.
   Local seconds: 0.2-0.7 ground, nest, food, 0.6-0.9 ant 1 pops, 0.8-2.8 it walks and drops the dots, 2.9 'later', 3.3-3.6 ant 2 pops,
   3.4-5.2 it walks, 3.5-4.1 sense ring, 5.4 banner, 7.0-7.4 beat A fades, 7.5-8.4 the two cards pop, 8.1-9.2 the left picture plays,
   8.3-9.5 the right one, 9.1 'ants use this'; the finished two-card picture holds for about 3 s. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const L5 = V.l5;
  const E = V.ease;
  const { ramp, flash, place } = V;
  const lin = E.lin;
  const f1 = (n) => n.toFixed(1);
  const TAU = 2 * Math.PI;
  const DEG = 180 / Math.PI;
  const tone = L7.tone;

  // ---------- beat A: the walk (stage px, from the storyboard) ----------
  const NEST = [62, 330]; // the stickers keep 12 px from the stage edge
  const FOOD = [874, 330];
  const X0 = 102; // the walk runs from the nest rim to the food rim
  const SPAN = 720;
  const pathAt = (s) => [X0 + SPAN * s, 330 - 50 * Math.sin(TAU * s)];
  const headingAt = (s) => Math.atan2(-50 * TAU * Math.cos(TAU * s), SPAN) * DEG;
  const N_DOTS = 20;
  const DOTS = Array.from({ length: N_DOTS }, (_, j) => {
    const s = (j + 0.5) / N_DOTS;
    return { s, x: pathAt(s)[0], y: pathAt(s)[1] };
  });
  const DOT_R = 9;
  const TAIL = 20; // a dot pops once the ant's centre is this many px past it, so the trail appears behind the ant

  // the later ant starts 70 px below the trail and turns onto it between s = 0.04 and 0.24
  const OFF = 70;
  const TURN = [0.04, 0.24];
  const offAt = (s) => OFF * (1 - ramp(s, TURN[0], TURN[1], E.inOut));
  const posLater = (s) => {
    const [x, y] = pathAt(s);
    return [x, y + offAt(s)];
  };
  const headingLater = (s) => {
    const e = 0.004;
    const a = posLater(Math.max(0, s - e));
    const b = posLater(Math.min(1, s + e));
    return Math.atan2(b[1] - a[1], b[0] - a[0]) * DEG;
  };
  const LATER_END = 0.9; // the later ant stops well short of the food, so the 'Food' label stays readable
  const ANT = 70;
  const SENSE_AHEAD = 26; // the sense ring sits this far ahead of the ant's centre (on its head and feelers)

  // ---------- timing (local seconds) ----------
  const T1 = { pop: 0.6, go: 0.8, end: 2.8, fade: [2.8, 3.2] }; // ant 1
  const T2 = { pop: 3.3, go: 3.4, end: 5.2 }; // ant 2
  const SENSE = [3.5, 4.1];
  const BANNER = [5.4, 6.0];
  const HILITE = [5.5, 5.9]; // the ground band turns purple
  const GONE = [7.0, 7.4]; // beat A fades out, then the two cards pop
  const CARD = { left: [7.5, 8.1], right: [7.8, 8.4] };
  const LEFT = { walk: [8.1, 9.2], tag: 9.1 };
  const RIGHT = { drop: [8.3, 8.7], in: [8.8, 9.5], pop: 8.6 };
  const dotPop = (j) => T1.go + (T1.end - T1.go) * Math.min(1, DOTS[j].s + TAIL / SPAN);
  const dotSensed = (j) => T2.go + ((T2.end - T2.go) * Math.max(0.02, (DOTS[j].x - 55 - X0) / SPAN)) / LATER_END;

  // ---------- beat B geometry (inside a card: its padding box is 432 wide) ----------
  const CARD_Y = 146;
  const CARD_H = 420;
  const CARD_X = [18, 480]; // two cards 438 wide with 18 px margins and a 24 px gap
  const CARD_W = 438;
  const LEFT_DOTS = [90, 175, 260, 345]; // blue scent dots, left picture
  const LEFT_WALK = [44, 390]; // the little ant's walk, x
  const LEFT_Y = 110;
  const SQ = 36; // a block is a rounded square
  const PITCH = 40;
  const FLOOR = 213; // bottoms of the stacks
  const STACKS = [
    { x: 100, n: 1 },
    { x: 220, n: 3 },
    { x: 340, n: 2 },
  ];
  const levelY = (i) => FLOOR - SQ / 2 - PITCH * i; // centre of level i (0 based)
  const NEW_Y = levelY(STACKS[1].n); // where the dropped block lands
  const SQ_ANT_Y = 32; // the dropping ant stands above the middle stack (13 px below the card's top edge)
  const WALKERS = [
    { from: 40, to: 148, r: 0, delay: 0 },
    { from: 390, to: 292, r: 180, delay: 0.1 },
  ];
  const WALK_Y = 202;

  // ---------- facts (asserted: a wrong number throws) ----------
  L7.close("scene 6 path slope (2 pi x 50)", 50 * TAU, 314, 0.2);
  L7.close("scene 6 heading at the nest", headingAt(0), -23.6, 0.05);
  [0.1, 0.37, 0.6, 0.93].forEach((s) => {
    const a = pathAt(s - 0.001);
    const b = pathAt(s + 0.001);
    L7.close(`scene 6 heading at s ${s}`, Math.atan2(b[1] - a[1], b[0] - a[0]) * DEG, headingAt(s), 0.2);
  });
  L7.same("scene 6 scent dots", DOTS.length, 20);
  L7.close("scene 6 dot spacing", DOTS[1].s - DOTS[0].s, 0.05, 1e-9);
  L7.same(
    "scene 6 the first and last dot are clear of the nest and the food",
    [DOTS[0].x - DOT_R - 3 > NEST[0] + 40, DOTS[N_DOTS - 1].x + DOT_R + 3 < FOOD[0] - 40],
    [true, true],
  );
  L7.same(
    "scene 6 every dot has popped before ant 1 has faded",
    DOTS.every((_, j) => dotPop(j) + 0.25 <= T1.fade[1]),
    true,
  );
  L7.same(
    "scene 6 the later ant starts below the trail and ends on it",
    [Math.round(offAt(0)), Math.round(offAt(1))],
    [70, 0],
  );
  L7.same(
    "scene 6 stacks before and after the new block",
    [STACKS.map((s) => s.n), STACKS.map((s, i) => s.n + (i === 1 ? 1 : 0))],
    [
      [1, 3, 2],
      [1, 4, 2],
    ],
  );
  L7.same("scene 6 the dropping ant clears the top of the new block", SQ_ANT_Y + 0.36 * 48 + 4 <= NEW_Y - SQ / 2, true);
  L7.same(
    "scene 6 the walkers stop clear of the stacks",
    [WALKERS[0].to + 24 + 4 < STACKS[1].x - SQ / 2, WALKERS[0].to - 24 - 4 > STACKS[0].x + SQ / 2],
    [true, true],
  );
  L7.same(
    "scene 6 right walker stops clear of the right stack",
    WALKERS[1].to + 24 + 4 < STACKS[2].x - SQ / 2 && WALKERS[1].to - 24 - 4 > STACKS[1].x + SQ / 2,
    true,
  );
  L7.same("scene 6 the banner opens once the later ant has arrived", BANNER[0] >= T2.end, true);
  L7.same("scene 6 beat A has gone before the cards pop", GONE[1] <= CARD.left[0], true);

  // widths of the tags (28 px, weight 900) as the browser draws them, rounded up (a tag is 6 px of border plus 36 px of padding wider)
  const TAG_W = { "scent mark": 192, later: 108, banner: 640 };
  const BANNER_TEXT = "stigmergy: talking through the environment";

  // a rounded block, drawn at (cx, cy) with a sticker lip; tone "grey" or "orange"
  function block(cx, cy, name) {
    const t = tone(name);
    const [face, edge, lip] = name === "grey" ? ["var(--line)", t.edge, t.edge] : [t.c, t.lip, t.lip];
    const rect = (y, st) =>
      V.s("rect", { x: f1(cx - SQ / 2), y: f1(y), width: SQ, height: SQ, rx: 9, "stroke-width": "3", style: st });
    return V.s(
      "g",
      {},
      rect(cy - SQ / 2 + 4, { fill: lip, stroke: lip }),
      rect(cy - SQ / 2, { fill: face, stroke: edge }),
    );
  }
  const dot = (x, y) =>
    V.s("circle", {
      cx: f1(x),
      cy: f1(y),
      r: DOT_R,
      "stroke-width": "3",
      style: { fill: "var(--blue)", stroke: "var(--blue-lip)" },
    });
  // a centred tag: an explicit width so the middle of the tag sits on cx
  function centred(parent, text, w, cx, y, opt) {
    const t = L7.tag(parent, { x: cx - w / 2, y, text, h: 58, ...opt });
    t.el.style.width = `${w}px`;
    return t;
  }

  V.scene({
    kicker: "STIGMERGY",
    title: ["Ants talk through", "the ground"],
    dur: 12.3,
    caps: [
      [0.8, 3.3, "An ant leaves a scent mark on the ground."],
      [3.4, 5.5, "A later ant senses it and follows."],
      [5.6, 7.2, "That is stigmergy."],
      [8.0, 9.8, "Scent is a sign, not the work."],
      [9.9, 11.9, "The work itself can prompt others."],
    ],
    build(stage) {
      // ----- beat A: one wrapper so the whole picture fades together -----
      const A = V.h("div", {
        style: { position: "absolute", left: "0px", top: "0px", width: "936px", height: "640px" },
      });
      stage.append(A);
      const svg = L5.svg(A);
      const bandAttrs = {
        x: 13.5,
        y: 215,
        width: 909,
        height: 230,
        rx: 30,
        fill: "var(--panel-2)",
        "stroke-width": "3",
      };
      const band = svg.appendChild(V.s("rect", { ...bandAttrs, style: { stroke: "var(--line)" } }));
      const bandHi = svg.appendChild(V.s("rect", { ...bandAttrs, fill: "none", style: { stroke: "var(--violet)" } }));
      const dots = DOTS.map((d) => svg.appendChild(dot(d.x, d.y)));
      const ant1 = svg.appendChild(L7.ant(0, 0, ANT));
      const ant2 = svg.appendChild(L7.ant(0, 0, ANT));
      const ring = svg.appendChild(
        V.s("circle", { cx: 0, cy: 0, r: 34, fill: "none", "stroke-width": "6", style: { stroke: "var(--amber)" } }),
      );
      // the nest and the food sit above the ants: the ants come out of the nest and go into the food
      svg.appendChild(L7.spot(NEST[0], NEST[1], "Nest"));
      svg.appendChild(L7.spot(FOOD[0], FOOD[1], "Food"));
      const ground = L7.tag(A, { x: 28, y: 456, text: "the ground", tone: "grey" });
      const scent = centred(A, "scent mark", TAG_W["scent mark"], 468, 150, { tone: "blue" });
      const later = centred(A, "later", TAG_W.later, 468, 150, { tone: "grey" });

      // ----- banner -----
      const banner = centred(stage, BANNER_TEXT, TAG_W.banner, 468, 12, { tone: "purple", solid: true });

      // ----- beat B: two cards, each with its picture and words inside -----
      const mkCard = (x, name) => L7.card(stage, { x, y: CARD_Y, w: CARD_W, h: CARD_H, tone: name, plain: true });
      const left = mkCard(CARD_X[0], "blue");
      const right = mkCard(CARD_X[1], "purple");
      const title = (c, text, name) => L7.text(c.el, { x: 24, y: 232, text, fs: 36, tone: name });
      const sub = (c, text) => L7.text(c.el, { x: 24, y: 286, text, fs: 28, tone: "dim" });
      const lTitle = title(left, "Sign-based", "blue");
      const lSub = sub(left, "a mark, not the work");
      const rTitle = title(right, "Sematonic", "purple");
      const rSub = sub(right, "the work prompts others");
      const uses = L7.tag(left.el, { x: 24, y: 336, text: "ants use this", tone: "green", solid: true });

      // left picture: a little ant walks a line and drops four scent dots
      const lsvg = L5.svg(left.el, 432, 215);
      lsvg.appendChild(
        V.s("path", {
          d: `M 28 ${LEFT_Y} L 404 ${LEFT_Y}`,
          fill: "none",
          "stroke-width": "8",
          "stroke-linecap": "round",
          style: { stroke: "var(--line-2)" },
        }),
      );
      const lDots = LEFT_DOTS.map((x) => lsvg.appendChild(dot(x, LEFT_Y)));
      const lAnt = lsvg.appendChild(L7.ant(0, 0, 56));

      // right picture: stacks of blocks; an ant drops one more block, then two more ants walk in
      const rsvg = L5.svg(right.el, 432, 225);
      rsvg.appendChild(
        V.s("path", {
          d: `M 28 ${FLOOR + 6} L 404 ${FLOOR + 6}`,
          fill: "none",
          "stroke-width": "8",
          "stroke-linecap": "round",
          style: { stroke: "var(--line-2)" },
        }),
      );
      STACKS.forEach((st) => {
        for (let i = 0; i < st.n; i++) rsvg.appendChild(block(st.x, levelY(i), "grey"));
      });
      const newBlock = rsvg.appendChild(block(STACKS[1].x, NEW_Y, "orange"));
      const dropAnt = rsvg.appendChild(L7.ant(0, 0, 48));
      const walkers = WALKERS.map(() => rsvg.appendChild(L7.ant(0, 0, 48)));

      return (t) => {
        // ===== beat A =====
        place(A, { o: 1 - ramp(t, GONE[0], GONE[1], lin) });
        const kBand = ramp(t, 0.2, 0.7, lin);
        place(band, { s: 0.96 + 0.04 * E.pop(kBand), o: kBand });
        place(bandHi, { o: ramp(t, HILITE[0], HILITE[1], lin) * kBand });
        ground.set({
          k: ramp(t, 0.3, 0.6, lin),
          tone: t >= HILITE[0] ? "purple" : "grey",
          s: 1 + 0.12 * flash(t, HILITE[0], HILITE[0] + 0.4),
        });

        // ant 1: out of the nest, along the trail, into the food; the dots appear behind it
        const s1 = ramp(t, T1.go, T1.end, lin);
        const [x1, y1] = pathAt(s1);
        const walking1 = t >= T1.go && t < T1.end ? 1 : 0;
        const k1 = ramp(t, T1.pop, T1.pop + 0.3, lin);
        place(ant1, {
          x: x1,
          y: y1,
          r: headingAt(s1) + 5 * Math.sin(TAU * 4.2 * t) * walking1,
          s: E.pop(k1),
          o: Math.min(1, k1 * 4) * (1 - ramp(t, T1.fade[0], T1.fade[1], lin)),
        });
        DOTS.forEach((d, j) => {
          const k = ramp(t, dotPop(j), dotPop(j) + 0.25, lin);
          const bump = flash(t, dotSensed(j), dotSensed(j) + 0.3);
          place(dots[j], { s: E.pop(k) * (1 + 0.35 * bump), o: Math.min(1, k * 4) });
        });
        // the scent tag names the dots while ant 1 walks, 'later' takes its place
        scent.set({ k: ramp(t, 1.2, 1.5, lin), o: 1 - ramp(t, 2.6, 2.9, lin) });
        later.set({ k: ramp(t, 2.9, 3.2, lin), o: 1 - ramp(t, 5.2, 5.5, lin) });

        // ant 2: pops below the trail, senses the dots, turns onto them and follows them
        const s2 = LATER_END * ramp(t, T2.go, T2.end, lin);
        const [x2, y2] = posLater(s2);
        const r2 = headingLater(s2);
        const walking2 = t >= T2.go && t < T2.end ? 1 : 0;
        const k2 = ramp(t, T2.pop, T2.pop + 0.3, lin);
        place(ant2, {
          x: x2,
          y: y2,
          r: r2 + 5 * Math.sin(TAU * 4.2 * t) * walking2,
          s: E.pop(k2),
          o: Math.min(1, k2 * 4),
        });
        const sense = flash(t, SENSE[0], SENSE[1]);
        place(ring, {
          x: x2 + SENSE_AHEAD * Math.cos(r2 / DEG),
          y: y2 + SENSE_AHEAD * Math.sin(r2 / DEG),
          s: 0.7 + 0.6 * ramp(t, SENSE[0], SENSE[1], lin),
          o: sense,
        });

        // ===== banner =====
        banner.set({ k: ramp(t, BANNER[0], BANNER[1], lin) });

        // ===== beat B =====
        left.set({ k: ramp(t, CARD.left[0], CARD.left[1], lin) });
        right.set({ k: ramp(t, CARD.right[0], CARD.right[1], lin) });
        [lTitle, lSub, rTitle, rSub].forEach((x) => x.set({}));
        uses.set({ k: ramp(t, LEFT.tag, LEFT.tag + 0.4, lin) });

        // left: the ant walks, a dot pops once it has passed
        const lk = ramp(t, LEFT.walk[0], LEFT.walk[1], lin);
        const lx = LEFT_WALK[0] + (LEFT_WALK[1] - LEFT_WALK[0]) * lk;
        const lWalking = lk > 0 && lk < 1 ? 1 : 0;
        place(lAnt, { x: lx, y: LEFT_Y, r: 5 * Math.sin(TAU * 4.2 * t) * lWalking });
        LEFT_DOTS.forEach((x, i) => {
          const tPass =
            LEFT.walk[0] + (LEFT.walk[1] - LEFT.walk[0]) * ((x + 30 - LEFT_WALK[0]) / (LEFT_WALK[1] - LEFT_WALK[0]));
          const k = ramp(t, tPass, tPass + 0.25, lin);
          place(lDots[i], { s: E.pop(k), o: Math.min(1, k * 4) });
        });

        // right: one more block lands on the middle stack, then two ants walk in to the pile
        place(dropAnt, { x: STACKS[1].x, y: SQ_ANT_Y });
        const fall = ramp(t, RIGHT.drop[0], RIGHT.drop[1], E.in);
        place(newBlock, {
          y: (SQ_ANT_Y - NEW_Y) * (1 - fall),
          s: 1 + 0.1 * flash(t, RIGHT.drop[1], RIGHT.drop[1] + 0.25),
        });
        WALKERS.forEach((w, i) => {
          const wk = ramp(t, RIGHT.in[0] + w.delay, RIGHT.in[1], lin);
          const kPop = ramp(t, RIGHT.pop, RIGHT.pop + 0.3, lin);
          const walking = wk > 0 && wk < 1 ? 1 : 0;
          place(walkers[i], {
            x: w.from + (w.to - w.from) * wk,
            y: WALK_Y,
            r: w.r + 5 * Math.sin(TAU * 4.2 * t) * walking,
            s: E.pop(kPop),
            o: Math.min(1, kPop * 4),
          });
        });
      };
    },
  });
})();
