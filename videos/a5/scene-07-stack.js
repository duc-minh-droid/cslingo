/* Phase 5 · scene 07-stack (15 s): GRAHAM SCAN, STEP 2. The sorted points are walked with a STACK. The first two (C, D) are pushed.
   For every new point p the top two stack points a, t and p are tested: a LEFT turn a -> t -> p keeps t, so p is pushed on top; a
   RIGHT turn makes t a dent, so t is POPPED and the test repeats. F goes when G arrives, B when A arrives; what is left, C D E G A,
   is the hull. Everything comes from the real scan (A5.SCAN: every test, pop and stack), checked against the storyboard when the
   scene is built; the only typed numbers are times. 'push' / 'pop' tags define the two verbs as they happen.
   Story (local seconds): 0.2-0.9 points and the sorted row, 1.0-2.0 push C then D, rounds E 2.6, F 3.9, G 5.2 (pop F), B 8.4,
   A 9.7 (pop B), 13.1-13.6 the loop closes, 13.4-14.0 the hull tint and solid green stack, 14-15 hold. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;

  const { pivot: PIVOT, order: ORDER, rounds: ROUNDS, stack: FINAL } = A5.SCAN;
  A5.same("scene 7: pivot and order", [PIVOT, ORDER.join("")], ["C", "DEFGBA"]);
  A5.same(
    "scene 7: stack after each point",
    ROUNDS.map((r) => r.after.join("")),
    ["CDE", "CDEF", "CDEG", "CDEGB", "CDEGA"],
  );
  A5.same(
    "scene 7: the verdicts",
    ROUNDS.map((r) => r.tests.map((x) => `${x.a}${x.t}${x.p}:${x.kind}`).join(" ")),
    ["CDE:left", "DEF:left", "EFG:right DEG:left", "EGB:left", "GBA:right EGA:left"],
  );
  A5.same(
    "scene 7: popped, tests, final stack",
    [A5.SCAN.popped, A5.SCAN.tests, FINAL],
    [["F", "B"], 7, ["C", "D", "E", "G", "A"]],
  );
  A5.same(
    "scene 7: the stack is the hull",
    FINAL,
    A5.HULL.slice(A5.HULL.indexOf(PIVOT)).concat(A5.HULL.slice(0, A5.HULL.indexOf(PIVOT))),
  );

  // ---------- timing (local seconds) ----------
  const START = [2.6, 3.9, 5.2, 8.4, 9.7]; // when each round's point arrives
  const T_CLOSE = [13.1, 13.6]; // the green segment A -> C
  const T_TINT = [13.4, 14.0]; // the hull tint and the solid stack
  /* one round: a simple push (1.3 s) or a pop round (about 3.2 s: test, pop, test, push) */
  const PLAN = ROUNDS.map((r, i) => {
    const t0 = START[i];
    const at = (a, b) => [t0 + a, t0 + b];
    const multi = r.tests.length > 1;
    const wins = multi
      ? [
          { path: at(0.1, 0.6), verdict: at(0.8, 1.1), slide: at(1.1, 1.7), fade: at(1.7, 2.0) },
          { path: at(2.0, 2.5), verdict: at(2.5, 2.8), slide: null, fade: at(2.8, 3.1) },
        ]
      : [{ path: at(0.3, 0.8), verdict: at(0.8, 1.0), slide: null, fade: at(1.0, 1.3) }];
    return { r, t0, push: multi ? at(2.8, 3.2) : at(1.0, 1.3), tests: wins.map((w, j) => ({ ...r.tests[j], ...w })) };
  });
  A5.same(
    "scene 7: pop rounds",
    PLAN.map((q) => q.tests.map((x) => (x.pop ? "pop" : "keep")).join("+")),
    ["keep", "keep", "pop+keep", "keep", "pop+keep"],
  );

  // what is on the stack and when: a tile per push, a green chain segment per link
  const TILES = [
    { name: PIVOT, slot: 0, push: [1.0, 1.4], slide: null },
    { name: ORDER[0], slot: 1, push: [1.4, 1.8], slide: null },
  ];
  const CHAIN = [{ a: PIVOT, b: ORDER[0], born: [1.6, 2.0], dies: null }];
  PLAN.forEach(({ r, push, tests }) => {
    TILES.push({ name: r.p, slot: r.after.length - 1, push, slide: null });
    CHAIN.push({ a: r.after[r.after.length - 2], b: r.p, born: push, dies: null });
    tests
      .filter((x) => x.pop)
      .forEach((x) => {
        TILES.find((q) => q.name === x.t).slide = x.slide; // the popped tile is lifted off the top
        CHAIN.find((q) => q.b === x.t).dies = x.slide; // and its link goes red and fades
      });
  });
  const TOP = FINAL[FINAL.length - 1];
  CHAIN.push({ a: TOP, b: PIVOT, born: T_CLOSE, dies: null }); // the loop closes
  const CARDS = PLAN.flatMap(({ tests }) => tests.map((x) => ({ ...x, show: [x.verdict[0], x.fade[1]] })));
  const LIFT = 52; // a popped tile is lifted off the top of the stack this far while it fades

  // a ring on the middle point of each test (green: kept, red: popped for good)
  const RINGS = CARDS.map((x) => ({
    name: x.t,
    tone: x.pop ? "red" : "green",
    k0: x.verdict[0],
    out: x.pop ? null : x.fade,
  }));

  // the 'push' / 'pop' / '= hull' tag under the stack: consecutive same-kind events share one run
  const RUNS = [];
  TILES.map((x) => ({ t: x.push[0], kind: "push" }))
    .concat(TILES.filter((x) => x.slide).map((x) => ({ t: x.slide[0], kind: "pop" })))
    .concat([{ t: 13.5, kind: "hull" }])
    .sort((a, b) => a.t - b.t)
    .forEach((e) => {
      const last = RUNS[RUNS.length - 1];
      const end = e.kind === "hull" ? Infinity : e.t + 0.9;
      if (last && last.kind === e.kind && e.t < last.end) last.end = end;
      else RUNS.push({ kind: e.kind, start: e.t, end });
    });
  const RUN_LOOK = { push: ["push", "green"], pop: ["pop", "red"], hull: ["= hull", "green"] };

  V.scene({
    kicker: "GRAHAM SCAN: THE STACK",
    title: ["A stack pops", "every dent"],
    dur: 15,
    caps: [
      [0.8, 3, "Keep a stack. Push the first two points."],
      [3.2, 5.4, "Test the turn. Left keeps the point."],
      [6, 8.2, "A right turn is a dent: pop it."],
      [10.5, 12.7, "Pop until the turn is left, then push."],
      [13.3, 14.9, "The stack is the hull."],
    ],
    build(stage) {
      const pl = A5.plot(stage, { segs: 12, polys: 1, tags: 2 });
      const st = A5.stack(stage, { x: 730, y: 30, w: 170, h: 60, gap: 10, slots: 5 });
      const sortedTag = A5.tag(stage, { x: 12, y: 556, text: "sorted", tone: "grey" });
      const row = A5.tiles(stage, { x: 150, y: 548, items: ORDER, w: 84, h: 60, gap: 12, fs: 32, tone: "purple" });
      const action = A5.tag(stage, { x: 730, y: 452, text: "push", tone: "green", solid: true });
      action.el.style.width = "170px";

      // the verdict card: a sticker with a turn arrow and two words
      const wrap = V.h("div", {
        style: { position: "absolute", left: "12px", top: "452px", width: "340px", height: "80px" },
      });
      const card = V.h("div", {
        class: "v-card plain c-green",
        style: { left: "0px", top: "0px", width: "340px", height: "80px" },
      });
      wrap.append(card); // the arrows' svg goes on top of the card, so it is added after it
      const cardSvg = L5.svg(wrap, 340, 80);
      const icons = { left: A5.turnIcon("left", 52, 40, 56, "green"), right: A5.turnIcon("right", 52, 40, 56, "red") };
      cardSvg.append(icons.left, icons.right);
      const words = V.h("div", {
        class: "v-text c-green",
        style: {
          left: "100px",
          top: "0px",
          height: "80px",
          lineHeight: "80px",
          fontSize: "38px",
          fontWeight: "900",
          color: "var(--c-ink)",
        },
      });
      wrap.append(words);
      stage.append(wrap);
      const setCard = (c, t) => {
        if (!c) return V.show(wrap, 0);
        const [kind, word, col] = [c.kind, c.pop ? "pop" : "keep", c.pop ? "red" : "green"];
        card.className = `v-card plain c-${col}`;
        words.className = `v-text c-${col}`;
        words.textContent = `${kind}: ${word}`;
        const k = ramp(t, c.verdict[0], c.verdict[1], lin);
        const out = 1 - ramp(t, c.fade[0], c.fade[1], lin);
        Object.entries(icons).forEach(([name, g]) => {
          L5.drawOn(g, name === kind ? ramp(t, c.verdict[0], c.verdict[0] + 0.3, lin) : 0);
        });
        V.place(wrap, { s: 0.8 + 0.2 * E.pop(k), o: Math.min(1, k * 4) * out });
      };

      const testing = (name, t) =>
        PLAN.some(({ tests }) =>
          tests.some((x) => (x.a === name || x.t === name) && t >= x.path[0] && t < x.verdict[0]),
        );

      return (t) => {
        // ---- the plot: seven points, the stack's links, the test path, the hull tint
        const points = {};
        A5.NAMES.forEach((name, i) => {
          const k = ramp(t, 0.2 + 0.07 * i, 0.6 + 0.07 * i, lin);
          points[name] = { s: E.pop(k), o: Math.min(1, k * 4) };
        });
        const upd = (name, extra, tA) => {
          const p = points[name];
          points[name] = { ...p, ...extra, s: p.s * (1 + 0.25 * flash(t, tA, tA + 0.4)) };
        };
        if (t >= 0.8) upd(PIVOT, { tone: "green", solid: true }, 0.8);
        if (t >= TILES[1].push[0] + 0.1) upd(ORDER[0], { tone: "green", solid: true }, TILES[1].push[0] + 0.1);
        PLAN.forEach(({ r, t0, push, tests }) => {
          if (t >= t0) upd(r.p, { tone: "blue", solid: true }, t0);
          if (t >= push[0]) upd(r.p, { tone: "green", solid: true }, push[0]);
          tests
            .filter((x) => x.pop)
            .forEach((x) => {
              if (t >= x.slide[0]) upd(x.t, { tone: "red", solid: true }, x.slide[0]);
              if (t >= x.fade[0]) {
                points[x.t] = {
                  ...points[x.t],
                  tone: "grey",
                  solid: false,
                  s: 1,
                  o: lerp(1, 0.5, ramp(t, x.fade[0], x.fade[1], lin)),
                };
              }
            });
        });
        RINGS.forEach((g) => {
          const k = ramp(t, g.k0, g.k0 + 0.3, lin) * (g.out ? 1 - ramp(t, g.out[0], g.out[1], lin) : 1);
          if (k > 0.001) points[g.name] = { ...points[g.name], ring: g.tone, ringK: k };
        });

        const segs = CHAIN.map((c) => ({
          a: c.a,
          b: c.b,
          tone: c.dies && t >= c.dies[0] ? "red" : "green",
          w: 1.2,
          k: ramp(t, c.born[0], c.born[1], lin),
          o: c.dies ? 1 - ramp(t, c.dies[0], c.dies[1], lin) : 1,
        }));
        PLAN.forEach(({ tests }) =>
          tests.forEach((x) => {
            if (t < x.path[0] || t >= x.fade[1]) return;
            const tone = t >= x.verdict[0] ? (x.pop ? "red" : "green") : "blue";
            const o = 1 - ramp(t, x.fade[0], x.fade[1], lin);
            const mid = (x.path[0] + x.path[1]) / 2;
            segs.push({ a: x.a, b: x.t, tone, w: 1.3, halo: 0.5, k: ramp(t, x.path[0], mid, lin), o });
            segs.push({ a: x.t, b: x.p, tone, w: 1.3, halo: 0.5, arrow: true, k: ramp(t, mid, x.path[1], lin), o });
          }),
        );
        const tags = PLAN.flatMap(({ tests }) => tests.filter((x) => x.pop)).map((x) => ({
          at: x.t,
          dx: x.t === "F" ? 76 : 32,
          dy: x.t === "F" ? -58 : 58,
          text: "dent",
          tone: "red",
          solid: true,
          k: ramp(t, x.fade[0] + 0.1, x.fade[0] + 0.5, lin),
        }));
        const polys = [{ pts: FINAL, tone: "green", fill: 0.4, w: 0.01, o: ramp(t, T_TINT[0], T_TINT[1], lin) }];
        pl.update({ points, polys, segs, tags });

        // ---- the stack: a tile per push, blue while it is being tested, red as it is popped, solid green at the end
        st.cup(ramp(t, 0.4, 0.8, lin));
        st.all((slot) => {
          const en = TILES.filter((x) => x.slot === slot && t >= x.push[0]).pop();
          if (!en) return { o: 0 };
          const kp = ramp(t, en.push[0], en.push[1], E.out);
          const base = { text: en.name, y: -44 * (1 - kp), o: Math.min(1, kp * 3) };
          if (en.slide && t >= en.slide[0]) {
            const ks = ramp(t, en.slide[0], en.slide[1], E.out);
            return { ...base, tone: "red", solid: true, y: -LIFT * ks, o: 1 - ks };
          }
          const tS = T_TINT[0] + 0.1 * slot;
          if (t >= tS) return { ...base, tone: "green", solid: true, s: 1 + 0.12 * flash(t, tS, tS + 0.4) };
          return { ...base, tone: testing(en.name, t) ? "blue" : "green", solid: false };
        });
        action.set(
          (() => {
            const run = RUNS.filter((q) => t >= q.start && t < q.end).pop();
            if (!run) return { o: 0 };
            const [text, tone] = RUN_LOOK[run.kind];
            const fade = run.end === Infinity ? 1 : 1 - ramp(t, run.end - 0.25, run.end, lin);
            return { text, tone, solid: true, k: ramp(t, run.start, run.start + 0.3, lin), o: fade };
          })(),
        );

        // ---- the sorted row: purple, blue while a point is being tested, then an empty (dashed) slot
        sortedTag.set({ k: ramp(t, 0.3, 0.7, lin) });
        row.all((i) => {
          const k = ramp(t, 0.3 + 0.06 * i, 0.65 + 0.06 * i, lin);
          const look = { s: E.pop(k), o: Math.min(1, k * 4) };
          const plan = PLAN.find((q) => q.r.p === ORDER[i]);
          const [tIn, tOut] = plan ? [plan.t0, plan.push[0]] : [null, TILES[1].push[0]]; // D goes straight onto the stack
          if (t >= tOut)
            return { ...look, tone: "grey", ghost: true, s: look.s * (1 + 0.12 * flash(t, tOut, tOut + 0.3)) };
          if (tIn != null && t >= tIn)
            return { ...look, tone: "blue", solid: true, s: look.s * (1 + 0.12 * flash(t, tIn, tIn + 0.3)) };
          return { ...look, tone: "purple", solid: false };
        });

        setCard(
          CARDS.find((c) => t >= c.show[0] && t < c.show[1]),
          t,
        );
      };
    },
  });
})();
