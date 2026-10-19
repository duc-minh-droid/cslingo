/* Lecture 1 (ds-1), scene 07: judge speed by the spread, not the average (lesson 1.4).
   The 100 response times of D1.PERF fall in one by one as blue dots into 50 ms bins (a left-heavy hill with a long right tail)
   while a counter ticks up to 100 and a legend says what a dot is. Then three markers: the average (blue), p95 (orange) and p99
   (red). Each percentile is defined on screen by two counts beside its line (95 faster / 5 slower, 99 faster / 1 slower) that are
   checked against the real samples when the page loads. The dots above p95 turn orange one by one (each with a ping), the one
   above p99 red. Last, a ring and "837 ms" mark the slowest request while the average tag bumps: the average never shows it.
   Local helpers: anchored() puts a tag by its centre or an edge (D1.tagW is an estimate and runs a few px short for digits) and
   marker() is a dashed percentile line with its tag, centred exactly and able to bump. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const lin = E.lin;
  const P = D1.PERF;

  // ---------- the figures, all from the real samples ----------
  const sum = P.samples.reduce((a, b) => a + b, 0);
  const fast95 = P.samples.filter((v) => v <= P.p95).length;
  const fast99 = P.samples.filter((v) => v <= P.p99).length;
  D1.same("scene 7: p95 splits 95 faster from 5 slower", [fast95, 100 - fast95], [95, 5]);
  D1.same("scene 7: p99 splits 99 faster from 1 slower", [fast99, 100 - fast99], [99, 1]);
  D1.same(
    "scene 7: the average is 250 ms and the slowest 837 ms",
    [Math.round(sum / 100), P.mean, P.max],
    [250, 250, 837],
  );
  const tail = P.samples.map((_, s) => s).filter((s) => P.samples[s] > P.p95); // sample indexes, slowest last
  const slowest = tail[tail.length - 1];
  D1.same(
    "scene 7: five requests are above p95, only the slowest is above p99",
    [tail.length, tail.filter((s) => P.samples[s] > P.p99).length, P.samples[slowest]],
    [5, 1, 837],
  );
  // where each dot lands (the same rule as D1.dotsHist: a bin fills two wide, in arrival order)
  const slot = new Array(100);
  const filled = P.bins.map(() => 0);
  P.order.forEach((s) => {
    const b = Math.floor(P.samples[s] / P.bin);
    const i = filled[b]++;
    slot[s] = { b, col: i % 2, row: Math.floor(i / 2) };
  });
  D1.same(
    "scene 7: the slow dots sit on the baseline and the slowest is alone in its bin",
    [tail.every((s) => slot[s].row === 0), P.bins[slot[slowest].b]],
    [true, 1],
  );

  // ---------- timing (local seconds) ----------
  const FALL = 8; // dots in the air at once (the histogram's `fall`)
  const STEP = 0.15;
  const T = {
    pop: [0.15, 0.5], // legend, counter, axis
    fall: [0.5, 2.9], // the 100 dots drop in
    ends: 2.7, // the "quick" and "slow" end tags
    pulseQ: 3.2, // ... bump while the caption names them
    pulseS: 3.9,
    avg: 4.5,
    p95: 6.2,
    pair95: 6.35,
    orange: 6.45, // the slowest five turn orange one by one, STEP s apart
    p99: 8.3,
    pair99: 8.45,
    red: 8.7,
    worst: 10.0, // the ring and "837 ms" for the slowest
  };
  const orangeAt = (ms) => T.orange + STEP * tail.map((s) => P.samples[s]).indexOf(ms);

  // ---------- layout (stage px) ----------
  const HIST = { x: 24, y: 240, w: 816, h: 300 }; // baseline at y 496, tick numbers under it
  const GAP = 10; // between a percentile line and the two counts beside it
  const TAG_Y = 122; // the marker tags
  const LINE_Y = TAG_Y + 62; // where the marker lines start
  const ROW95 = 200; // the two counts of p95
  const ROW99 = 270; // and of p99

  // a tag anchored by its centre, left edge or right edge
  const anchored = (stage, { x, y, align = "center", ...tag }) => {
    const st = { position: "absolute", top: `${y}px`, display: "flex", justifyContent: "center" };
    if (align === "right") st.right = `${936 - x}px`;
    else {
      st.left = `${x}px`;
      if (align === "center") st.width = "0px";
    }
    const box = V.h("div", { style: st });
    stage.append(box);
    const t = D1.tag(box, tag);
    t.el.style.position = "static";
    return t;
  };

  // a dashed line that grows downwards, with its solid tag centred on top
  const marker = (stage, { x, y1, y2, tone, text }) => {
    const svg = L5.svg(stage);
    const line = svg.appendChild(
      V.s("line", {
        x1: x,
        y1,
        x2: x,
        y2: y1,
        "stroke-width": 6,
        "stroke-linecap": "round",
        "stroke-dasharray": "12 9.6",
      }),
    );
    line.style.stroke = D1.tone(tone).c;
    const tag = anchored(stage, { x, y: y1 - 62, text, tone, solid: true });
    return {
      set({ k, s = 1 }) {
        line.setAttribute("y2", (y1 + (y2 - y1) * E.out(clamp(k))).toFixed(1));
        V.show(line, k > 0.01 ? 1 : 0);
        tag.set({ k, s });
      },
    };
  };

  V.scene({
    kicker: "SCALABILITY",
    title: ["Judge speed by the spread,", "not the average"],
    dur: 12.5,
    caps: [
      [0.7, 2.5, "100 requests, each timed."],
      [3.0, 4.85, "Most are quick; a few are slow."],
      [4.9, 6.6, "The average is 250 ms."],
      [6.7, 8.5, "p95: 95 in 100 are faster."],
      [8.7, 10.3, "p99: 99 in 100 are faster."],
      [10.3, 12.2, "The average hides the slowest."],
    ],
    build(stage) {
      const hist = D1.dotsHist(stage, HIST);
      const base = hist.baseY;
      const bw = HIST.w / P.bins.length;
      const dotAt = (s) => ({
        x: hist.xOf(slot[s].b * P.bin) + bw / 2 + (slot[s].col ? 1 : -1) * (hist.dot / 2 + 0.5),
        y: base - 3 - hist.dot / 2 - slot[s].row * (hist.dot + 1),
      });

      // the legend (what a dot is), the counter and the axis
      const dotKey = D1.token(stage, { tone: "blue", size: 30 });
      const keyTag = D1.tag(stage, { x: 62, y: 14, text: "one request" });
      const counter = D1.stat(stage, { x: 592, y: 14, w: 320, h: 80, label: "requests", tone: "blue" });
      const axisY = base + 56;
      const axisTag = anchored(stage, { x: HIST.x + HIST.w / 2, y: axisY, text: "response time, ms" });
      const quick = D1.tag(stage, { x: HIST.x, y: axisY, text: "quick", tone: "green" });
      const slow = anchored(stage, { x: HIST.x + HIST.w, y: axisY, align: "right", text: "slow", tone: "red" });

      // the markers, and the two counts that define each percentile
      const mAvg = marker(stage, {
        x: hist.xOf(P.mean),
        y1: LINE_Y,
        y2: base,
        tone: "blue",
        text: `average ${P.mean}`,
      });
      const m95 = marker(stage, { x: hist.xOf(P.p95), y1: LINE_Y, y2: base, tone: "orange", text: `p95 ${P.p95}` });
      const m99 = marker(stage, { x: hist.xOf(P.p99), y1: LINE_Y, y2: base, tone: "red", text: `p99 ${P.p99}` });
      const pair = (ms, y, fast, slower, slowTone) => ({
        fast: anchored(stage, { x: hist.xOf(ms) - GAP, y, align: "right", text: `${fast} faster`, tone: "green" }),
        slow: anchored(stage, { x: hist.xOf(ms) + GAP, y, text: `${slower} slower`, tone: slowTone, align: "left" }),
      });
      const c95 = pair(P.p95, ROW95, fast95, 100 - fast95, "orange");
      const c99 = pair(P.p99, ROW99, fast99, 100 - fast99, "red");

      // pings as dots turn orange or red, then a ring and a label that lock on to the slowest request
      const fx = L5.svg(stage);
      const ringOf = (cx, cy, w) => fx.appendChild(V.s("circle", { cx, cy, fill: "none", "stroke-width": w }));
      const pings = [
        ...tail.map((s) => ({ s, at: orangeAt(P.samples[s]), tone: "orange" })),
        { s: slowest, at: T.red, tone: "red" },
      ].map((p) => ({ ...p, el: ringOf(dotAt(p.s).x.toFixed(1), dotAt(p.s).y.toFixed(1), 5) }));
      const lock = dotAt(slowest);
      const ring = ringOf(lock.x.toFixed(1), lock.y.toFixed(1), 6);
      ring.style.stroke = D1.tone("red").c;
      const worstW = D1.tagW(`${P.max} ms`) + 22; // measured: 140
      const worstX = Math.max(lock.x - worstW / 2, hist.xOf(P.p99) + GAP + 6);
      D1.same("scene 7: the 837 ms tag fits inside the stage", worstX + worstW <= 924, true);
      const worst = anchored(stage, {
        x: worstX,
        y: lock.y - 30 - 10 - 58,
        align: "left",
        text: `${P.max} ms`,
        tone: "red",
        solid: true,
      });

      return (t) => {
        const pop = ramp(t, T.pop[0], T.pop[1], lin);
        const n = (P.order.length + FALL) * ramp(t, T.fall[0], T.fall[1], lin);
        hist.update({
          n,
          fall: FALL,
          o: pop,
          ticks: pop,
          tone: (ms) => (ms > P.p99 && t >= T.red ? "red" : ms > P.p95 && t >= orangeAt(ms) ? "orange" : "blue"),
        });
        dotKey.set({ x: 34, y: 43, s: 0.8 + 0.2 * E.pop(pop), o: pop });
        keyTag.set({ k: pop });
        counter.set({ text: String(Math.min(100, Math.floor(n))), k: pop, bump: 0.5 * flash(t, 2.7, 3.1) });
        axisTag.set({ k: pop });
        quick.set({ k: ramp(t, T.ends, T.ends + 0.4, lin), s: 1 + 0.12 * flash(t, T.pulseQ, T.pulseQ + 0.5) });
        slow.set({ k: ramp(t, T.ends + 0.15, T.ends + 0.55, lin), s: 1 + 0.12 * flash(t, T.pulseS, T.pulseS + 0.5) });

        const bump = flash(t, T.worst, T.worst + 0.9);
        mAvg.set({ k: ramp(t, T.avg, T.avg + 0.7, lin), s: 1 + 0.14 * bump });
        m95.set({ k: ramp(t, T.p95, T.p95 + 0.6, lin) });
        m99.set({ k: ramp(t, T.p99, T.p99 + 0.6, lin) });
        c95.fast.set({ k: ramp(t, T.pair95, T.pair95 + 0.35, lin) });
        c95.slow.set({ k: ramp(t, T.pair95 + 0.12, T.pair95 + 0.47, lin) });
        c99.fast.set({ k: ramp(t, T.pair99, T.pair99 + 0.35, lin) });
        c99.slow.set({ k: ramp(t, T.pair99 + 0.12, T.pair99 + 0.47, lin) });

        pings.forEach((p) => {
          const k = clamp((t - p.at) / 0.5);
          p.el.style.stroke = D1.tone(p.tone).c;
          p.el.setAttribute("r", (12 + 16 * E.out(k)).toFixed(1));
          V.show(p.el, k > 0 && k < 1 ? 1 - k : 0);
        });
        const lk = clamp((t - T.worst) / 0.5);
        ring.setAttribute("r", (29 + 26 * (1 - E.out(lk)) + 3 * bump).toFixed(1));
        V.show(ring, Math.min(1, lk * 3));
        worst.set({ k: ramp(t, T.worst + 0.2, T.worst + 0.6, lin) });
      };
    },
  });
})();
