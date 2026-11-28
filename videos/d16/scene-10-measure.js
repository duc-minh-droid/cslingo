/* Lecture 16 (ds-16) · scene 10 (MEASURE AND REPEAT): measure the whole pipeline, then go round again (lesson 16.5 / 16.6).
   Story (local seconds): 0.3 four meter cards pop (stagger 0.3): Latency, Throughput, Energy per result, Cost; 3.6 a loop
   draws at the left: Prototype (blue) -> Measure all (orange) -> Re-partition (purple) -> back; 7.0 a mini timeline at the
   right (Leafly with the network on the GPU, D16.P.gpu) gets a GPU four times faster (D16.P.quarter): the network bar shrinks
   from 15 to 3.75 ms and the bars re-pack, 8.0 the 12 ms copy is now the longest bar: it turns red, tag 'the bottleneck
   moved'; 9.8 the loop and the timeline fade, four green trade-off tags pop (power, performance, cost, development time) and
   four grey tags where it matters most (embedded, consumer electronics, cars, 5G). */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D16 = V.d16;
  const { ramp, flash, lerp, ease: E } = V;
  const P = D16.P;
  const A = D16.bars(P.gpu);
  const B = D16.bars(P.quarter);
  const KEYS = ["prep", "copy1", "net", "copy2", "show"];
  const longest = KEYS.reduce((m, k) => (B[k].b - B[k].a > B[m].b - B[m].a ? k : m), "prep");
  D16.same(
    "measure: after the speed-up the longest bar",
    [longest, B.copy1.b - B.copy1.a, B.net.b - B.net.a],
    ["copy1", 12, 3.75],
  );

  const T = { meters: 0.3, loop: 3.6, mini: 6.6, shrink: [7.0, 7.8], moved: 8.0, out: 9.6, trade: 9.8, where: 10.8 };
  const XS = [120, 352, 584, 816];
  const METERS = [
    ["Latency", "one answer"],
    ["Throughput", "answers per second"],
    ["Energy", "per result"],
    ["Cost", "hardware and development"],
  ];
  const MINI = { x0: 624, x1: 912, rows: [262, 330, 398], h: 44, T: 40 };
  const TONE = { prep: "blue", net: "purple", show: "blue", copy1: "orange", copy2: "orange" };

  V.scene({
    kicker: "MEASURE AND REPEAT",
    title: ["Measure the whole pipeline,", "then go round again"],
    dur: 13,
    caps: [
      [0.4, 3.4, "Measure latency, throughput, energy per result and cost."],
      [3.6, 6.8, "Prototype, measure end to end, revisit the partition."],
      [7.0, 9.6, "Speed one part up and the bottleneck moves."],
      [9.8, 12.6, "Co-design trades power, performance, cost and time."],
    ],
    build(stage) {
      const meters = METERS.map(([title, sub], i) => D16.box(stage, { x: XS[i], y: 80, w: 216, h: 140, title, sub }));
      const mid = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
      stage.append(mid);
      const svg = D4.svg(mid);
      const loop = [
        ["Prototype", "blue", 130, 280],
        ["Measure all", "orange", 380, 385],
        ["Re-partition", "purple", 130, 490],
      ].map(([title, tone, x, y]) => D16.box(mid, { x, y, w: 220, h: 68, title, tone, solid: true, fs: 30 }));
      const lArr = [
        D16.arrow(svg, [210, 318], [292, 352], { tone: "green", w: 7, head: 20 }),
        D16.arrow(svg, [292, 420], [210, 452], { tone: "green", w: 7, head: 20 }),
        D16.arrow(svg, [130, 452], [130, 320], { tone: "green", w: 7, head: 20 }),
      ];
      const names = ["CPU", "GPU", "copy"].map((text, i) =>
        D4.label(mid, { x: 520, y: MINI.rows[i], text, fs: 28, anchor: "l" }),
      );
      const X = (ms) => MINI.x0 + (ms / MINI.T) * (MINI.x1 - MINI.x0);
      const base = V.s("line", {
        x1: MINI.x0,
        x2: MINI.x1,
        y1: 428,
        y2: 428,
        stroke: "var(--line-2)",
        "stroke-width": 4,
      });
      const bars = KEYS.map(() => V.s("rect", { rx: 8, "stroke-width": 3, height: MINI.h }));
      svg.append(base, ...bars);
      const fast = D4.tag(mid, { x: 768, y: 200, text: "GPU 4× faster", tone: "purple" });
      const moved = D4.tag(mid, { x: 722, y: 484, text: "the bottleneck moved", tone: "red", solid: true });
      const head1 = D4.label(stage, { x: 468, y: 250, text: "co-design trades", fs: 30 });
      const trade = ["power", "performance", "cost", "development time"].map((text) =>
        D4.tag(stage, { text, tone: "green", solid: true, fs: 30 }),
      );
      const head2 = D4.label(stage, { x: 468, y: 420, text: "it matters most in", fs: 30 });
      const where = ["embedded", "consumer electronics", "cars", "5G"].map((text) => D4.tag(stage, { text, fs: 30 }));
      const rowX = (list, fs) => {
        const ws = list.map((s) => D4.tagW(s, fs + 4));
        const sp = ws.reduce((a, w) => a + w, 0) + 20 * (ws.length - 1);
        return ws.map((w, i) => 468 - sp / 2 + ws.slice(0, i).reduce((a, v) => a + v + 20, 0) + w / 2);
      };
      const tX = rowX(["power", "performance", "cost", "development time"], 30);
      const wX = rowX(["embedded", "consumer electronics", "cars", "5G"], 30);

      return (t) => {
        meters.forEach((m, i) => m.set({ k: D16.seq(t, T.meters, 0.3, 0.5, i) }));
        const out = 1 - ramp(t, T.out, T.out + 0.4, E.lin);
        V.place(mid, { o: out });
        loop.forEach((b, i) =>
          b.set({
            k: D16.seq(t, T.loop, 0.5, 0.5, i),
            s: 1 + 0.08 * flash(t, T.loop + 2.0 + 0.3 * i, T.loop + 2.3 + 0.3 * i),
          }),
        );
        lArr.forEach((a, i) => a.set({ k: E.inOut(D16.seq(t, T.loop + 0.4, 0.5, 0.4, i)) }));
        const km = ramp(t, T.mini, T.mini + 0.4, E.lin);
        names.forEach((n) => n.set({ k: km }));
        V.show(base, km);
        const ks = ramp(t, T.shrink[0], T.shrink[1], E.inOut);
        const red = t >= T.moved;
        KEYS.forEach((key, i) => {
          const a = lerp(A[key].a, B[key].a, ks);
          const b = lerp(A[key].b, B[key].b, ks);
          const tone = D16.tone(key === longest && red ? "red" : TONE[key]);
          const el = bars[i];
          el.setAttribute("x", X(a).toFixed(1));
          el.setAttribute("width", Math.max(0, X(b) - X(a) - 2).toFixed(1));
          el.setAttribute("y", String(MINI.rows[A[key].row] - MINI.h / 2));
          el.style.fill = tone.c;
          el.style.stroke = tone.lip;
          V.show(el, km);
        });
        fast.set({ k: ramp(t, T.shrink[0], T.shrink[0] + 0.4, E.lin) });
        moved.set({ k: ramp(t, T.moved + 0.2, T.moved + 0.6), s: 1 + 0.1 * flash(t, T.moved + 0.6, T.moved + 1.0) });

        head1.set({ k: ramp(t, T.trade, T.trade + 0.4, E.lin) });
        trade.forEach((g, i) => g.set({ x: tX[i], y: 314, k: D16.seq(t, T.trade + 0.2, 0.2, 0.4, i) }));
        head2.set({ k: ramp(t, T.where, T.where + 0.4, E.lin) });
        where.forEach((g, i) => g.set({ x: wX[i], y: 484, k: D16.seq(t, T.where + 0.2, 0.2, 0.4, i) }));
      };
    },
  });
})();
