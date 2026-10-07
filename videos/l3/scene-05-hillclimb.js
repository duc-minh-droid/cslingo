/* Lecture 3 · scene 05, hillclimbing on the TSP: the lecture's trace of four mutants, each kept only if no worse. */
(function () {
  const V = window.VID;
  const L3 = V.l3;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // ---------- the real algorithm, run once at build time ----------
  const START = "ABDEC";
  const SWAPS = [2, 4, 0, 3]; // swapAdj positions (0-based; 4 = the wrap-around swap of the last and first city)
  const STARTS = [1.4, 3.8, 6.2, 8.6];
  const STEP = 2.4;
  const steps = [];
  let cur = START;
  SWAPS.forEach((i, j) => {
    const m = L3.swapAdj(cur, i);
    const [a, b] = [i, (i + 1) % 5];
    const [lc, lm] = [L3.len(cur), L3.len(m)];
    const ok = lm <= lc; // hillclimbing: keep a mutant that is no worse
    steps.push({ j, cur, m, a, b, lc, lm, ok, wrap: i === 4, kind: !ok ? "worse" : lm < lc ? "better" : "same" });
    if (ok) cur = m;
  });
  const EXPECT = [
    ["ABDEC", "ABEDC", 32, 33, false],
    ["ABDEC", "CBDEA", 32, 38, false],
    ["ABDEC", "BADEC", 32, 28, true],
    ["BADEC", "BADCE", 28, 28, true],
  ];
  EXPECT.forEach((e, j) => {
    const s = steps[j];
    if (s.cur !== e[0] || s.m !== e[1] || s.lc !== e[2] || s.lm !== e[3] || s.ok !== e[4])
      throw new Error(`scene 5: step ${j + 1} differs from the lecture trace: ${JSON.stringify(s)}`);
  });
  const VERDICT = {
    worse: ["worse: throw it away", "red", "cross"],
    better: ["better: keep it", "green", "tick"],
    same: ["same: keep it", "green", "tick"],
  };

  // ---------- layout ----------
  const [SIZE, GAP, LEFT, Y1, Y2] = [84, 10, 190, 30, 250];
  const PITCH = SIZE + GAP;
  const PILL_X = 700;
  const RISE = Y2 - Y1;
  const LOGX = [0, 214, 428, 642];

  V.scene({
    kicker: "HILLCLIMBING",
    title: ["Keep a small change", "if it is no worse"],
    dur: 13,
    caps: [
      [0.4, 2.2, "Start with one tour. Change it a little."],
      [2.4, 6.2, "Worse? Throw the change away."],
      [6.4, 10.8, "No worse? Keep it and carry on."],
      [11.1, 12.5, "Repeat until time runs out."],
    ],
    build(stage) {
      const rowC = L5.chromosome(stage, { x: LEFT, y: Y1, genes: START, size: SIZE, gap: GAP, tone: "blue" });
      const rowM = L5.chromosome(stage, { x: LEFT, y: Y2, genes: START, size: SIZE, gap: GAP, tone: "blue" });
      const tagC = L3.tag(stage, { x: 0, y: Y1 + 18, text: "current", tone: "blue" });
      const tagM = L3.tag(stage, { x: 0, y: Y2 + 18, text: "mutant", tone: "purple" });
      const pillC = L3.tag(stage, { x: PILL_X, y: Y1 + 8, text: "32", tone: "blue", solid: true, fs: 44 });
      const pillM = L3.tag(stage, { x: PILL_X, y: Y2 + 8, text: "", tone: "blue", solid: true, fs: 44 });
      const verdict = L3.sticker(stage, {
        x: LEFT + (5 * SIZE + 4 * GAP) / 2 - 215,
        y: 370,
        w: 430,
        text: "",
        tone: "red",
      });
      const logs = steps.map((s, j) =>
        L3.sticker(stage, {
          x: LOGX[j],
          y: 500,
          w: 190,
          h: 64,
          fs: 36,
          text: String(s.lm),
          tone: s.ok ? "green" : "red",
        }),
      );
      const svg = L5.svg(stage);
      const arrows = steps.map((s) => {
        const [x1, x2] = [LEFT + s.a * PITCH + SIZE / 2, LEFT + s.b * PITCH + SIZE / 2];
        const g = L5.arrow(x1, Y2 - 10, x2, Y2 - 10, "purple", 1, {
          w: 8,
          head: 24,
          bow: (s.wrap ? 70 : 34) * (x2 > x1 ? 1 : -1),
        });
        svg.append(g);
        return g;
      });
      const IC = { cross: "cross", tick: "tick" };

      return (t) => {
        // which step is running, and how far in
        let j = -1;
        STARTS.forEach((s0, i) => {
          if (t >= s0) j = i;
        });
        const st = steps[Math.max(j, 0)];
        const u = j < 0 ? -1 : t - STARTS[j];
        const alive = j >= 0 && (j < 3 ? u < STEP : u < 2.3); // is a mutant on stage
        // the current tour: it changes when an accepted mutant has arrived
        const curNow = steps.reduce((c, s, i) => (s.ok && t >= STARTS[i] + 2.3 ? s.m : c), START);
        const lenNow = L3.len(curNow);

        // ----- current row and its pill -----
        rowC.all((i) => {
          const k = ramp(t, 0.2 + 0.12 * i, 0.6 + 0.12 * i, E.back);
          return { text: curNow[i], s: 0.7 + 0.3 * k, o: Math.min(1, k * 3) };
        });
        tagC.set({ s: 0.8 + 0.2 * ramp(t, 0.2, 0.6, E.back), o: ramp(t, 0.2, 0.5) });
        const arrive = steps.reduce((m, s, i) => (s.ok && t >= STARTS[i] + 2.3 ? Math.max(m, STARTS[i] + 2.3) : m), -9);
        const fl = flash(t, arrive, arrive + 0.6);
        const kc = ramp(t, 1.0, 1.4, E.back);
        pillC.set({
          text: lenNow,
          tone: t - arrive < 0.6 ? "green" : "blue",
          s: (0.8 + 0.2 * kc) * (1 + 0.14 * fl),
          o: Math.min(1, kc * 3),
        });

        // ----- mutant row -----
        const copy = ramp(u, 0, 0.5, E.out);
        const sw = ramp(u, 0.5, 1.1, E.inOut);
        const sd = u >= 1.1;
        let [gx, gy, go] = [0, -RISE * (1 - copy), alive ? ramp(u, 0, 0.12, E.lin) : 0];
        if (u >= 1.9) {
          if (st.ok) gy = -RISE * ramp(u, 1.9, 2.3, E.inOut);
          else {
            gx = 14 * Math.sin((u - 1.9) * 55) * (u < 2.3 ? 1 : 0);
            go = 1 - ramp(u, 2.0, 2.3, E.lin);
          }
        }
        const far = st.wrap ? 96 : 30;
        const verdictK = ramp(u, 1.5, 1.9, E.out);
        const tint = u >= 1.5 ? (st.ok ? "green" : "red") : null;
        rowM.all((i) => {
          const hot = u >= 0.5 && (i === st.a || i === st.b);
          const o = { text: sd ? st.m[i] : st.cur[i], tone: tint || (hot ? "orange" : "blue") };
          if (!sd && (i === st.a || i === st.b)) {
            const [from, to, up] = i === st.a ? [st.a, st.b, -1] : [st.b, st.a, 1];
            o.x = (to - from) * PITCH * sw;
            o.y = up * far * Math.sin(Math.PI * sw);
          }
          return o;
        });
        V.place(rowM.el, { x: gx, y: gy, o: go });
        tagM.set({
          s: 0.8 + 0.2 * ramp(u, 0.2, 0.55, E.back),
          o: (alive ? ramp(u, 0.2, 0.5) : 0) * (st.ok || u < 1.9 ? 1 : go),
        });

        // purple swap arrow
        arrows.forEach((g, i) => {
          const on = i === j && alive;
          V.show(g, on ? 1 - ramp(u, 1.1, 1.4, E.lin) : 0);
          if (on) L5.drawOn(g, ramp(u, 0.5, 0.85, E.inOut));
        });

        // mutant length pill: counts up from the current length, red if longer, green if no worse
        const km = ramp(u, 1.1, 1.5, E.back);
        pillM.set({
          text: L3.count(st.lc, st.lm, ramp(u, 1.1, 1.5, E.lin)),
          tone: st.lm > st.lc ? "red" : "green",
          dx: gx,
          dy: gy,
          s: 0.8 + 0.2 * km,
          o: alive ? Math.min(1, km * 3) * go : 0,
        });

        // verdict sticker
        const [vt, vtone, vicon] = VERDICT[st.kind];
        verdict.set({
          text: vt,
          tone: vtone,
          icon: IC[vicon],
          k: alive ? verdictK : 0,
          o: 1 - ramp(u, 2.2, 2.4, E.lin),
        });

        // log
        logs.forEach((lg, i) => {
          const s = steps[i];
          lg.set({ icon: s.ok ? "tick" : "cross", k: ramp(t, STARTS[i] + 2.1, STARTS[i] + 2.4, E.out) });
        });
      };
    },
  });
})();
