/* Phase 9 · Fourier Transform & FFT (algo-9), scene 03: "Add sine waves, get any shape" (11.5 s).
   Fourier's idea: a shape with sharp corners is a sum of smooth sine waves. Target: a dotted square wave (two periods). Top panel: the blue
   sum of the first j odd sine waves (1, 3, 5, ... times as fast, 1, 1/3, 1/5, ... as strong); bottom panel: one orange bar per wave at its
   speed, as tall as its strength, with the strengths written on the first three; a purple counter says how many waves are in; the thin purple
   wave being added (waves 2 and 3) is drawn over the sum and its bar gets a purple ring. Waves 4..12 follow quickly and the corners sharpen
   (the small ripple beside every jump stays: that is real). The tag at the end says only the odd waves are needed.
   Colours (video-wide): blue = the signal in time (the sum), orange = the frequency side (bars), purple = the rule / the wave being added,
   grey = the target.
   Timeline (local seconds): 0.2 top panel, 0.3 bottom panel, 0.5-1.5 the dotted target draws on, 1.2-1.6 the (flat) sum shows,
   1.6-2.4 wave 1 fades in (bar 1, label 1, the counter pops reading 1), 3.2-4.0 wave 2 (thin purple wave 3.0-4.4, bar 3 with a ring 3.4-4.8,
   label 1/3), 5.0-5.8 wave 3 (thin purple wave 4.8-6.2, bar 5, ring 5.2-6.4, label 1/5), 6.6-9.2 waves 4..12 (0.25 s apart, the counter
   counts up to 12), 9.4-9.9 the "odd waves only" tag, 9.9-11.5 hold.
   Captions follow the picture (the storyboard's came about 0.9 s after it): each one starts as the thing it names appears (see CAPS,
   asserted below). The bar axis is written "1x, 3x, 5x ..." so "3 times faster" is on screen.
   Every number comes from A9.SQ (common.js) and is asserted below. update(t) is pure. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { ramp, lerp, flash, clamp, ease: E } = V;
  const SQ = A9.SQ;
  const PI = Math.PI;
  const lin = E.lin;

  // ---------- the model: when each wave comes in, and how strong it is at time t ----------
  const WAVES = 12;
  const js = Array.from({ length: WAVES }, (_, i) => i + 1);
  const START = (j) => (j <= 3 ? [1.6, 3.2, 5.0][j - 1] : 6.6 + 0.25 * (j - 4));
  const LEN = (j) => (j <= 3 ? 0.8 : 0.6);
  const weight = (t, j) => ramp(t, START(j), START(j) + LEN(j), E.inOut); // 0 .. 1: how much of wave j is in
  const middle = (j) => START(j) + LEN(j) / 2; // the moment the weight passes one half
  const count = (t) => js.filter((j) => weight(t, j) > 0.5).length;
  const fraction = (j) => (j === 1 ? "1" : `1/${SQ.freq(j)}`);
  const TARGET = [
    [0, 1],
    [PI, 1],
    [PI, -1],
    [2 * PI, -1],
    [2 * PI, 1],
    [3 * PI, 1],
    [3 * PI, -1],
    [4 * PI, -1],
  ];
  const LIMIT = { pop: [0.2, 0.3], target: [0.5, 1.5], flat: [1.2, 1.6], counter: [1.7, 2.1], tag: [9.4, 9.9] };
  // each caption starts as the picture it names appears (target, wave 1, wave 2, wave 3, waves 4..12, the tag)
  const CAPS = [
    [0.6, 1.9, "Target: a square wave."],
    [2.0, 3.3, "Start with one sine wave."],
    [3.4, 5.0, "Add a weaker wave, 3 times faster."],
    [5.2, 6.7, "Then 5 times faster, weaker still."],
    [6.9, 9.3, "Keep adding: the corners sharpen."],
    [9.5, 11.3, "Only odd waves are needed."],
  ];

  function check() {
    A9.same("scene 3 frequencies", [1, 2, 3, 4, 5].map(SQ.freq), [1, 3, 5, 7, 9]);
    A9.same("scene 3 strengths written on the first bars", [1, 2, 3].map(fraction), ["1", "1/3", "1/5"]);
    js.forEach((j) => A9.close(`scene 3 bar ${j} is the strength of wave ${j}`, SQ.rel(j) * SQ.top, SQ.amp(j), 1e-12));
    A9.close("scene 3 the last wave is complete at 9.2 s", START(WAVES) + LEN(WAVES), 9.2, 1e-9);
    A9.same(
      "scene 3 the waves arrive in order",
      js.map(START),
      js.map(START).sort((a, b) => a - b),
    );
    A9.same(
      "scene 3 nothing is in at the start, all twelve at the end",
      [count(1.0), count(2.1), count(11.5)],
      [0, 1, 12],
    );
    A9.same("scene 3 the counter reads 2 then 3 then 12", [count(4.2), count(6.0), count(9.3)], [2, 3, 12]);
    A9.close(
      "scene 3 one wave alone peaks at 4/pi",
      SQ.sum(PI / 2, (j) => (j === 1 ? 1 : 0)),
      1.2732,
      1e-4,
    );
    A9.close(
      "scene 3 twelve waves reach the plateau (0.9735)",
      SQ.sum(PI / 2, () => 1, 12),
      0.9735,
      1e-4,
    );
    const peak = Math.max(...Array.from({ length: 2001 }, (_, i) => SQ.sum((PI * i) / 2000, () => 1, 12)));
    A9.close("scene 3 the ripple beside a jump stays under 1.2", peak, 1.1796, 1e-3);
    A9.same("scene 3 the tag arrives after the last wave", 9.4 > START(WAVES) + LEN(WAVES), true);
    // captions never run ahead of the picture and are short enough to read
    const starts = [LIMIT.target[0], START(1), START(2), START(3), START(4), LIMIT.tag[0]];
    A9.same(
      "scene 3 every caption starts after its picture does",
      CAPS.map((c, i) => c[0] >= starts[i] && c[0] - starts[i] < 0.5),
      CAPS.map(() => true),
    );
    A9.same(
      "scene 3 captions do not overlap and read at 4.5 words a second or less",
      CAPS.every((c, i) => (i === 0 || c[0] >= CAPS[i - 1][1]) && c[2].split(" ").length / (c[1] - c[0]) <= 4.5),
      true,
    );
  }

  // the first fraction k of a polyline's length (px-weighted), so the dotted target draws on smoothly
  function partial(S, pts, k) {
    const seg = pts.slice(1).map((p, i) => Math.hypot((p[0] - pts[i][0]) * S.cur.sx, (p[1] - pts[i][1]) * S.cur.sy));
    let left = clamp(k) * seg.reduce((a, b) => a + b, 0);
    const out = [pts[0]];
    for (let i = 0; i < seg.length && left > 0; i++) {
      const f = Math.min(1, left / seg[i]);
      out.push([lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]);
      left -= seg[i];
    }
    return out;
  }

  V.scene({
    kicker: "FOURIER'S IDEA",
    title: ["Add sine waves,", "get any shape"],
    dur: 11.5,
    caps: CAPS,
    build(stage) {
      check();
      // top: the sum of sine waves against the dotted target (two periods of the square wave)
      const S = A9.plot(stage, {
        x: 0,
        y: 0,
        w: 936,
        h: 330,
        view: [0, 4 * PI, -1.55, 1.55],
        axes: "mid",
        pad: { l: 24, r: 24, t: 20, b: 20 },
      });
      const target = S.path({ tone: "grey", w: 6, dash: "2 14", color: "var(--text-dim)" });
      const sum = S.curve(() => 0, { tone: "blue", w: 8, n: 700 });
      const newest = [2, 3].map((j) =>
        S.curve((x) => SQ.amp(j) * Math.sin(SQ.freq(j) * x), { tone: "purple", w: 5, n: 500 }),
      );
      // bottom: one bar per wave, at its speed, as tall as its strength
      const B = A9.plot(stage, {
        x: 0,
        y: 360,
        w: 936,
        h: 260,
        view: [0, 24, 0, 1.25],
        axes: "bottom",
        pad: { l: 24, r: 24, t: 20, b: 56 },
        xticks: js.map((j) => ({ v: SQ.freq(j), text: `${SQ.freq(j)}\u00d7` })), // 1x, 3x, ... times as fast
      });
      const bars = B.bars({ max: WAVES, bw: 40 });
      const labels = [1, 2, 3].map((j) => B.text({ tone: "orange" }));
      const counter = A9.stat(stage, { x: 640, y: 378, w: 270, h: 80, label: "waves", tone: "purple" });
      const odd = A9.tag(stage, { x: 640, y: 480, text: "odd waves only", tone: "orange", solid: true });

      return (t) => {
        const w = (j) => weight(t, j);
        // the panels pop
        [S, B].forEach((P, i) => {
          const k = ramp(t, LIMIT.pop[i], LIMIT.pop[i] + 0.4, lin);
          P.set({ o: Math.min(1, k * 3), s: 0.94 + 0.06 * E.pop(k) });
        });

        // the dotted target draws on, then waits
        target.set({ pts: partial(S, TARGET, ramp(t, LIMIT.target[0], LIMIT.target[1], E.inOut)) });

        // the blue sum: it morphs smoothly as the weights change
        sum.set({ fn: (x) => SQ.sum(x, w), o: ramp(t, LIMIT.flat[0], LIMIT.flat[1], lin) });

        // the thin purple wave that is being added (waves 2 and 3 only)
        newest.forEach((c, i) => {
          const j = i + 2;
          const [a, e] = [START(j), START(j) + LEN(j)];
          c.set({
            k: ramp(t, a - 0.1, a + 0.6, lin),
            o: ramp(t, a - 0.1, a + 0.25, lin) * (1 - ramp(t, e, e + 0.4, lin)),
          });
        });

        // one bar per wave; the first three carry their strength; wave 2 and 3's bars wear a purple ring while they are new
        bars.set(
          js.map((j) => {
            const a = START(j);
            const ringK =
              j === 2 || j === 3 ? ramp(t, a + 0.2, a + 0.6, lin) * (1 - ramp(t, a + 1.0, a + 1.4, lin)) : 0;
            return {
              x: SQ.freq(j),
              v: SQ.rel(j),
              k: E.out(w(j)),
              o: w(j) > 0 ? 1 : 0,
              ring: ringK > 0 ? "purple" : null,
              ringK,
            };
          }),
        );
        labels.forEach((l, i) => {
          const j = i + 1;
          l.set({ text: fraction(j), x: SQ.freq(j), y: SQ.rel(j) + 0.12, o: w(j) });
        });

        // the counter: how many waves are in
        const bump = Math.max(0, ...js.map((j) => flash(t, middle(j) - 0.05, middle(j) + 0.25)));
        counter.set({ text: String(Math.max(1, count(t))), k: ramp(t, LIMIT.counter[0], LIMIT.counter[1], lin), bump });

        // the closing tag
        odd.set({ k: ramp(t, LIMIT.tag[0], LIMIT.tag[1], lin) });
      };
    },
  });
})();
