/* Lecture 16 video, scene 06-xor: lesson 16.2's XOR problem on Nell's canal lock (two gates, a warning lamp that glows
   when exactly one gate is open; L16.TRUTH.XOR). The on cases sit in opposite corners of the square, and no straight line
   (one neuron) splits them: three tries, each leaves a corner on the wrong side.
   Layout (stage px): left x 12..612: the lock (water y 300..420, gates at x 220 and 400 that lift when open, lamp (310, 150)
   on a post, gate labels and state tags at y 456); later L13.plot (x 12, y 12, 600 x 616, both axes -0.4..1.4, ticks 0 and 1,
   "gate 1" across, "gate 2" up). Right panel x 636..924: tag "XOR" (y 12), table (heads y 84, rows from y 132, 70 apart),
   purple card "one neuron: one straight line" (y 420, h 88), red card "no single straight line works" (y 528, h 88).
   Story (local seconds): 0.3 the lock; cases (shut shut), (open shut), (shut open), (open open) at 0.4 / 1.05 / 1.7 / 2.35,
   each fills its table row; 3.2 lock fades, the plot and its four corners (01 and 10 green, 00 and 11 grey), XOR tag;
   6.0 / 6.87 / 7.74 a dashed purple line tries x + y = 0.5, x + y = 1.5 and x = 0.5, a red cross 0.4 s later on the corner
   on the wrong side; 8.8 all three lines faint, all crosses, red card; hold to 12. */
VID.scene({
  kicker: "THE GATE ONE NEURON CAN'T MAKE",
  title: ["Exactly one gate open:", "XOR"],
  dur: 12,
  caps: [
    [0.4, 3.0, "Nell's lock lamp should glow when exactly one gate is open."],
    [3.2, 5.8, "That rule is XOR. Its 'on' cases sit in opposite corners."],
    [6.0, 8.6, "One neuron draws one straight line."],
    [8.8, 11.7, "No straight line separates XOR. One neuron can't do it."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L16 = V.l16;
    const { ramp, ease: E } = V;
    const T = (n) => L13.tone(n);
    const XOR = L16.TRUTH.XOR;
    L16.same(XOR, [0, 1, 1, 0], "scene 6: XOR");
    const CASES = [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ];
    const CT = [0.4, 1.05, 1.7, 2.35];
    const rowOf = (c) => L16.IN4.findIndex((x) => x[0] === c[0] && x[1] === c[1]);

    // ---------- the lock ----------
    const svg = V.l5.svg(stage, 936, 640);
    const lock = svg.appendChild(V.s("g", {}));
    const water = lock.appendChild(V.s("rect", { x: 40, y: 300, width: 540, height: 120, rx: 12, "stroke-width": 3 }));
    water.style.fill = T("blue").dim;
    water.style.stroke = T("blue").c;
    const post = lock.appendChild(V.s("path", { d: "M310 196 V292", "stroke-width": 8, "stroke-linecap": "round" }));
    post.style.stroke = "var(--text-dim)";
    const lamp = lock.appendChild(V.s("circle", { cx: 310, cy: 150, r: 46, "stroke-width": 5 }));
    const lampLab = L16.text(lock, { x: 396, y: 128, text: "lamp", anchor: "start" });
    const GX = [220, 400];
    const gates = GX.map((x) => {
      const g = lock.appendChild(V.s("rect", { x: x - 14, y: 282, width: 28, height: 156, rx: 6, "stroke-width": 4 }));
      g.style.fill = T("grey").c;
      g.style.stroke = T("grey").lip;
      return g;
    });
    const gLab = GX.map((x, i) => L16.text(lock, { x, y: 490, text: `gate ${i + 1}`, weight: 900 }));
    const gState = GX.map((x) => L16.text(lock, { x, y: 530, text: "" }));

    // ---------- the square ----------
    const pl = L13.plot(stage, {
      x: 12,
      y: 12,
      w: 600,
      h: 616,
      xr: [-0.4, 1.4],
      yr: [-0.4, 1.4],
      xt: [0, 1],
      yt: [0, 1],
      xl: "gate 1",
      yl: "gate 2",
      dots: 4,
      lines: 3,
      boxes: 0,
      links: 0,
    });
    stage.appendChild(svg);
    const LINES = [
      [
        [-0.4, 0.9],
        [0.9, -0.4],
      ],
      [
        [0.1, 1.4],
        [1.4, 0.1],
      ],
      [
        [0.5, -0.4],
        [0.5, 1.4],
      ],
    ];
    const side = (L, p) => {
      const [[x1, y1], [x2, y2]] = L;
      return Math.sign((x2 - x1) * (p[1] - y1) - (y2 - y1) * (p[0] - x1));
    };
    // the corner on the wrong side: the first corner (in order 11, 00, 01, 10) whose side holds both colours
    const WRONG = LINES.map((L) => {
      const pick = [3, 0, 1, 2].find((r) => {
        const p = L16.IN4[r];
        return L16.IN4.some((q, j) => j !== r && side(L, q) === side(L, p) && XOR[j] !== XOR[r]);
      });
      return pick;
    });
    L16.same(WRONG, [3, 0, 3], "scene 6: the corner each line gets wrong");
    const LT = [6.0, 6.87, 7.74];

    const xTag = L13.tag(stage, { x: 636, y: 12, text: "XOR", tone: "orange", solid: true, fs: 32 });
    const grid = L16.grid(stage, {
      x: 638,
      y: 84,
      cols: [
        { w: 80, head: "gate 1", tone: "blue" },
        { w: 80, head: "gate 2", tone: "blue" },
        { w: 80, head: "lamp", tone: "orange" },
      ],
      rows: 4,
      rowH: 70,
      gap: 22,
    });
    const one = L16.card(stage, {
      x: 636,
      y: 420,
      w: 288,
      h: 88,
      text: "one neuron:\none straight line",
      tone: "purple",
    });
    const none = L16.card(stage, {
      x: 636,
      y: 528,
      w: 288,
      h: 88,
      text: "no single straight\nline works",
      tone: "red",
    });

    return (t) => {
      const lk = ramp(t, 0.3, 0.6) * (1 - ramp(t, 3.2, 3.6));
      lock.setAttribute("opacity", lk.toFixed(3));
      const ci = t < CT[0] ? -1 : CT.filter((c) => t >= c).length - 1;
      const c = ci >= 0 ? CASES[ci] : [0, 0];
      const on = ci >= 0 && c[0] !== c[1];
      lamp.style.fill = on ? T("orange").c : T("grey").dim;
      lamp.style.stroke = on ? T("orange").lip : T("grey").c;
      lampLab.set({ tone: on ? "orange" : "grey" });
      gates.forEach((g, i) => {
        const open = ci >= 0 && c[i] === 1;
        const k = ci >= 0 && c[i] === 1 ? ramp(t, CT[ci], CT[ci] + 0.3, E.out) : 0;
        g.setAttribute("transform", `translate(0 ${(-110 * k).toFixed(1)})`);
        gState[i].set({ text: ci < 0 ? "" : open ? "open" : "shut", tone: open ? "blue" : "grey" });
      });
      gLab.forEach((l) => l.set({ tone: "blue" }));

      const kp = ramp(t, 3.4, 3.8);
      const lines = LINES.map((L, i) => {
        const cur = t >= LT[i] && (i === 2 || t < LT[i + 1]);
        const all = t >= 8.8;
        return {
          pts: L,
          tone: "purple",
          dash: true,
          w: 7,
          k: ramp(t, LT[i], LT[i] + 0.3),
          o: all ? 0.5 : cur ? 1 : 0,
        };
      });
      const dots = L16.IN4.map((p, r) => {
        const cross = LINES.reduce((m, L, i) => {
          const cur = t >= LT[i] && (i === 2 || t < LT[i + 1]);
          return WRONG[i] === r && (cur || t >= 8.8) ? Math.max(m, ramp(t, LT[i] + 0.4, LT[i] + 0.7)) : m;
        }, 0);
        return { at: p, tone: XOR[r] ? "green" : "grey", r: 24, k: ramp(t, 3.6 + 0.1 * r, 4.0 + 0.1 * r), cross };
      });
      pl.update({ k: kp, dots, lines });
      xTag.set({ k: ramp(t, 3.2, 3.6) });
      grid.heads.forEach((h) => h.set({ k: ramp(t, 0.3, 0.6), bold: true }));
      grid.cells.forEach((row, r) => {
        const ti = CASES.findIndex((q) => rowOf(q) === r);
        const k = ramp(t, CT[ti], CT[ti] + 0.3);
        const x = L16.IN4[r];
        row[0].set({ k, text: x[0], tone: x[0] ? "blue" : "grey", solid: !!x[0] });
        row[1].set({ k, text: x[1], tone: x[1] ? "blue" : "grey", solid: !!x[1] });
        row[2].set({ k, text: XOR[r], tone: XOR[r] ? "orange" : "grey", solid: !!XOR[r] });
      });
      one.set({ k: ramp(t, 6.0, 6.4) });
      none.set({ k: ramp(t, 8.8, 9.2) });
    };
  },
});
