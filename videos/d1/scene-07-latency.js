/* Lecture 1 (ds-1), scene 07: judge speed by the spread, not the average (lesson 1.4).
   The 100 response times of D1.PERF fall in one by one as blue dots into 50 ms bins (a left-heavy hill with a long right tail) while a
   counter ticks up to 100. Then three markers: the average (blue), p95 (orange) and p99 (red). Each percentile is defined on screen by
   two counts beside its line (95 faster / 5 slower, 99 faster / 1 slower) that are checked against the real samples when the scene is
   built. The dots above p95 turn orange, the one above p99 red. Last, a ring and "837 ms" mark the slowest request and the average tag
   pulses: the average never shows it. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const { ramp, flash, clamp, ease: E } = V;
  const lin = E.lin;
  const P = D1.PERF;

  // ---------- the figures, all from the real samples ----------
  const fast95 = P.samples.filter((v) => v <= P.p95).length;
  const fast99 = P.samples.filter((v) => v <= P.p99).length;
  D1.same("p95 splits 95 faster from 5 slower", [fast95, 100 - fast95], [95, 5]);
  D1.same("p99 splits 99 faster from 1 slower", [fast99, 100 - fast99], [99, 1]);
  D1.same("the average is 250 ms and the slowest 837 ms", [P.mean, P.max], [250, 837]);
  const tail95 = P.samples.filter((v) => v > P.p95); // ascending: the last one is above p99 too
  const slowBin = Math.floor(P.max / P.bin);
  D1.same("the slowest request sits alone in its bin", P.bins[slowBin], 1);

  // ---------- timing (local seconds) ----------
  const T = {
    axis: [0.3, 0.9],
    fall: [0.7, 3.2], // the 100 dots drop in
    ends: 3.0, // the "quick" and "slow" end tags
    avg: 4.7,
    p95: 5.9,
    orange: 6.05, // the dots above p95 turn orange one by one
    pair95: 6.4,
    p99: 8.0,
    red: 8.3,
    pair99: 8.5,
    worst: 10.3, // the ring and "837 ms" for the slowest
  };

  const HIST = { x: 30, y: 194, w: 800, h: 300 };
  const Y1 = 190; // top of the marker lines

  V.scene({
    kicker: "SCALABILITY",
    title: ["Judge speed by the spread,", "not the average"],
    dur: 12.5,
    caps: [
      [0.5, 2.5, "100 requests, each timed."],
      [3.2, 4.8, "Most are quick; a few are slow."],
      [4.9, 6.6, "The average is 250 ms."],
      [6.7, 8.5, "p95: 95 in 100 are faster."],
      [8.8, 10.2, "p99: 99 in 100 are faster."],
      [10.3, 12.2, "The average hides the slowest."],
    ],
    build(stage) {
      const hist = D1.dotsHist(stage, HIST);
      const base = hist.baseY;
      const bw = hist.xOf(P.bin) - hist.xOf(0);

      // the counter (a blue dot says what a dot is) and the axis
      const dotKey = D1.token(stage, { tone: "blue", size: 30 });
      const counter = D1.stat(stage, { x: 664, y: 24, w: 260, h: 80, label: "requests", tone: "blue" });
      const axisW = D1.tagW("response time, ms");
      const axisTag = D1.tag(stage, {
        x: hist.xOf(0) + HIST.w / 2 - axisW / 2,
        y: base + 56,
        text: "response time, ms",
      });
      const quick = D1.tag(stage, { x: HIST.x, y: base + 56, text: "quick", tone: "green" });
      const slowW = D1.tagW("slow");
      const slow = D1.tag(stage, { x: HIST.x + HIST.w - slowW, y: base + 56, text: "slow", tone: "red" });

      // markers and the two counts that define each percentile
      const mAvg = D1.vline(stage, {
        x: hist.xOf(P.mean),
        y1: Y1,
        y2: base,
        tone: "blue",
        text: `average ${P.mean} ms`,
      });
      const m95 = D1.vline(stage, { x: hist.xOf(P.p95), y1: Y1, y2: base, tone: "orange", text: `p95 ${P.p95} ms` });
      const m99 = D1.vline(stage, { x: hist.xOf(P.p99), y1: Y1, y2: base, tone: "red", text: `p99 ${P.p99} ms` });
      const gap = 14;
      const pair = (ms, y, fast, slower, slowTone) => {
        const [a, b] = [`${fast} faster`, `${slower} slower`];
        return {
          fast: D1.tag(stage, { x: hist.xOf(ms) - gap - D1.tagW(a), y, text: a, tone: "green" }),
          slow: D1.tag(stage, { x: hist.xOf(ms) + gap, y, text: b, tone: slowTone }),
        };
      };
      const c95 = pair(P.p95, 206, fast95, 100 - fast95, "orange");
      const c99 = pair(P.p99, 276, fast99, 100 - fast99, "red");

      // a ring and a label for the slowest request (alone in its bin, so its dot is the first, left slot)
      const svg = V.l5.svg(stage);
      const dotX = hist.xOf(slowBin * P.bin) + bw / 2 - (hist.dot / 2 + 0.5);
      const dotY = base - 3 - hist.dot / 2;
      const ring = V.s("circle", { cx: dotX.toFixed(1), cy: dotY.toFixed(1), r: 30, fill: "none", "stroke-width": 6 });
      ring.style.stroke = D1.tone("red").c;
      svg.append(ring);
      const worstW = D1.tagW(`${P.max} ms`);
      const worst = D1.tag(stage, {
        x: Math.min(dotX - worstW / 2, 924 - worstW),
        y: dotY - 30 - 12 - 58,
        text: `${P.max} ms`,
        tone: "red",
        solid: true,
      });

      return (t) => {
        const n = (P.order.length + 8) * ramp(t, T.fall[0], T.fall[1], lin);
        const ax = ramp(t, T.axis[0], T.axis[1], lin);
        hist.update({
          n,
          fall: 8,
          ticks: ax,
          tone: (ms) =>
            ms > P.p99 && t >= T.red
              ? "red"
              : ms > P.p95 && t >= T.orange + 0.1 * tail95.indexOf(ms)
                ? "orange"
                : "blue",
        });
        const seen = Math.min(100, Math.floor(n));
        dotKey.set({ x: 636, y: 64, s: 0.8 + 0.2 * E.pop(ramp(t, 0.4, 0.8)), o: ramp(t, 0.4, 0.7, lin) });
        counter.set({ text: String(seen), k: ramp(t, 0.4, 0.9, lin), bump: flash(t, T.fall[1], T.fall[1] + 0.4) });
        axisTag.set({ k: ramp(t, 0.5, 0.9, lin) });
        quick.set({ k: ramp(t, T.ends, T.ends + 0.4, lin) });
        slow.set({ k: ramp(t, T.ends + 0.15, T.ends + 0.55, lin) });

        const pulse = flash(t, T.worst, T.worst + 0.9);
        mAvg.set({ k: ramp(t, T.avg, T.avg + 0.7, lin) });
        m95.set({ k: ramp(t, T.p95, T.p95 + 0.6, lin) });
        m99.set({ k: ramp(t, T.p99, T.p99 + 0.6, lin) });
        c95.fast.set({ k: ramp(t, T.pair95, T.pair95 + 0.35, lin) });
        c95.slow.set({ k: ramp(t, T.pair95 + 0.12, T.pair95 + 0.47, lin) });
        c99.fast.set({ k: ramp(t, T.pair99, T.pair99 + 0.35, lin) });
        c99.slow.set({ k: ramp(t, T.pair99 + 0.12, T.pair99 + 0.47, lin) });

        const wk = ramp(t, T.worst, T.worst + 0.5, lin);
        const ping = clamp((t - T.worst) / 0.8);
        ring.setAttribute("r", (24 + 16 * E.out(ping) + 4 * pulse).toFixed(1));
        V.show(ring, wk > 0.01 ? 1 : 0);
        worst.set({ k: ramp(t, T.worst + 0.2, T.worst + 0.6, lin) });
      };
    },
  });
})();
