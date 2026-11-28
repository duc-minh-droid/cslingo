/* Lecture 17 video, scene 05-leaky: the leaky neuron (lesson 17.3, L17.LIF = the kernel's lif, threshold 1). A bucket whose
   water is the charge, beside the charge trace (blue staircase) under the red dashed threshold. (1) 0.12 a step, no leak, 8
   steps: 0.96, not yet. (2) 0.25 a step, no leak, 20 steps: fires (orange spike) and resets at steps 4, 8, 12, 16, 20:
   5 spikes. (3) 0.2 a step with leak 0.3: the charge levels off near 0.67 (0.2 / 0.3) and never fires: 0 spikes.
   Layout (stage px): tags 'drop ...' (x 12, y 12) and 'leak 0.3' (x 186, y 12); bucket x 40..240, brim y 170 (= threshold),
   bottom y 430, a tap at x 140 above it; stat 'spikes' x 12..272, y 480; chart axes from (320, 470) to (900, 120): step t at
   x 320 + 28.5 t, charge v at y 470 - 330 v; threshold line y 140, spikes rise to y 44.
   Story (local seconds): 0.4 bucket, chart and tag; trace 1 draws 0.6..3.0, tag '0.96: not yet' at 3.0; 3.6 trace 1 fades,
   trace 2 draws 3.8..7.4 with a spike (and an orange flash of the bucket) at each fire, the stat counts 1..5; 8.0 trace 2
   fades, the bucket gets a hole that drips, the 'leak 0.3' tag, trace 3 draws 8.2..10.6, stat 0; 11.0 a blue dashed level
   line at 0.67 with the tag 'levels off at 0.2 / 0.3, about 0.67'; hold to 14. */
VID.scene({
  kicker: "A LEAKY BUCKET THAT FIRES",
  title: ["Fill up, tip over,", "or leak away"],
  dur: 14,
  caps: [
    [0.4, 3.4, "Charge accumulates from inputs, like drops in a bucket."],
    [3.6, 7.8, "At the threshold it fires a spike, resets, and fills again."],
    [8.0, 10.8, "Below-threshold charge leaks away over time."],
    [11.0, 13.7, "With this leak the charge levels off near 0.67: no spike."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L17 = V.l17;
    const { ramp, clamp } = V;
    const { fill, fire, leak } = L17.LIF;
    L17.same([fill.V[7], fill.n, fire.n, leak.n, leak.V[19].toFixed(2)], [0.96, 0, 5, 0, "0.67"], "scene 5: lif runs");
    const X = (s) => 320 + 28.5 * s;
    const Y = (v) => 470 - 330 * v;
    const f1 = L17.f1;
    const svg = L17.svg(stage);
    const tone = (n) => L13.tone(n);

    // chart
    const axes = svg.appendChild(V.s("path", { d: "M320 120 V470 H906", fill: "none", "stroke-width": 4 }));
    axes.style.stroke = "var(--text-dim)";
    const thr = svg.appendChild(V.s("line", { x1: 320, x2: 906, y1: Y(1), y2: Y(1), "stroke-width": 4 }));
    thr.setAttribute("stroke-dasharray", "14 10");
    thr.style.stroke = tone("red").c;
    const lab1 = L17.text(svg, { x: 306, y: Y(1) + 10, text: "1", anchor: "end", tone: "grey" });
    const lab0 = L17.text(svg, { x: 306, y: Y(0) + 10, text: "0", anchor: "end", tone: "grey" });
    const thrLab = L17.text(svg, { x: 906, y: Y(1) - 14, text: "threshold", anchor: "end", tone: "red" });
    const xLab = L17.text(svg, { x: 906, y: 512, text: "time steps", anchor: "end", tone: "grey" });
    const yLab = L17.text(svg, { x: 306, y: 112, text: "charge", anchor: "end", tone: "blue" });
    const level = svg.appendChild(
      V.s("line", { x1: 320, x2: 906, y1: Y(0.2 / 0.3), y2: Y(0.2 / 0.3), "stroke-width": 4 }),
    );
    level.setAttribute("stroke-dasharray", "10 10");
    level.style.stroke = tone("blue").c;

    // a staircase trace and its spikes
    const stair = (R) => {
      let prev = 0;
      const pts = [[X(0), Y(0)]];
      R.V.forEach((v, i) => {
        pts.push([X(i + 1) - 14, Y(prev)], [X(i + 1) - 14, Y(v)]);
        prev = R.S[i] ? 0 : v;
        if (R.S[i]) pts.push([X(i + 1) - 14, Y(0)]);
      });
      pts.push([X(R.V.length), Y(prev)]);
      return `M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L")}`;
    };
    const runs = [
      { R: fill, a: 0.6, b: 3.0, show: [0.4, 3.6, 3.9] },
      { R: fire, a: 3.8, b: 7.4, show: [3.7, 8.0, 8.3] },
      { R: leak, a: 8.2, b: 10.6, show: [8.1, 99, 99] },
    ].map((r, i) => {
      const clip = svg.appendChild(V.s("clipPath", { id: `l17s5c${i}` }));
      const rect = clip.appendChild(V.s("rect", { x: 300, y: 0, height: 640, width: 0 }));
      const p = svg.appendChild(
        V.s("path", { d: stair(r.R), fill: "none", "stroke-width": 6, "stroke-linejoin": "round" }),
      );
      p.setAttribute("clip-path", `url(#l17s5c${i})`);
      p.style.stroke = tone("blue").c;
      const spikes = L17.on(r.R.S).map((s) => {
        const g = svg.appendChild(V.s("g"));
        const l = g.appendChild(V.s("line", { x1: X(s) - 14, x2: X(s) - 14, y1: Y(1), y2: 52, "stroke-width": 6 }));
        l.setAttribute("stroke-linecap", "round");
        l.style.stroke = tone("orange").c;
        const c = g.appendChild(V.s("circle", { cx: X(s) - 14, cy: 48, r: 10, "stroke-width": 3 }));
        c.style.fill = tone("orange").c;
        c.style.stroke = tone("orange").lip;
        return { g, s };
      });
      const n = r.R.V.length;
      return { ...r, rect, p, spikes, n, upto: (t) => n * clamp((t - r.a) / (r.b - r.a)) };
    });

    // bucket
    const BK = { top: 170, bot: 430, l0: 40, r0: 240, l1: 64, r1: 216 };
    const edge = (y) => {
      const f = (y - BK.top) / (BK.bot - BK.top);
      return [BK.l0 + (BK.l1 - BK.l0) * f, BK.r0 + (BK.r1 - BK.r0) * f];
    };
    const water = svg.appendChild(V.s("polygon", {}));
    water.style.fill = tone("blue").c;
    const bucket = svg.appendChild(
      V.s("path", {
        d: `M${BK.l0} ${BK.top} L${BK.l1} ${BK.bot} H${BK.r1} L${BK.r0} ${BK.top}`,
        fill: "none",
        "stroke-width": 8,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
      }),
    );
    const brim = svg.appendChild(V.s("line", { x1: 30, x2: 250, y1: BK.top, y2: BK.top, "stroke-width": 4 }));
    brim.setAttribute("stroke-dasharray", "10 8");
    brim.style.stroke = tone("red").c;
    const tap = svg.appendChild(V.s("path", { d: "M90 70 H150 V100", fill: "none", "stroke-width": 16 }));
    tap.style.stroke = "var(--line-2)";
    const drop = L17.dot(svg, 9, "blue");
    const hole = svg.appendChild(V.s("circle", { cx: 214, cy: 400, r: 7 }));
    hole.style.fill = "var(--ink)";
    const drips = [0, 1].map(() => L17.dot(svg, 7, "blue"));

    const dropTag = L13.tag(stage, { x: 12, y: 12, text: "drop 0.12", tone: "blue", solid: true });
    const leakTag = L13.tag(stage, { x: 186, y: 12, text: "leak 0.3", tone: "red" });
    const stat = L13.stat(stage, { x: 12, y: 480, w: 260, label: "spikes", tone: "orange" });
    const notYet = L13.tag(stage, { x: X(8) + 10, y: Y(0.96) + 18, text: "0.96: not yet", tone: "blue" });
    const lvTag = L13.tag(stage, { x: 384, y: 186, text: "levels off at 0.2 / 0.3, about 0.67", tone: "blue" });

    return (t) => {
      const k0 = ramp(t, 0.2, 0.6);
      [axes, thr, bucket, brim, tap].forEach((e) => L17.vis(e, k0));
      [lab0, lab1, thrLab, xLab, yLab].forEach((e) => e.set({ o: k0 }));
      bucket.style.stroke = "var(--text-dim)";
      // which run is live, and the charge now
      let charge = 0;
      let fired = 0;
      let flash = 0;
      let live = null;
      runs.forEach((r) => {
        const u = r.upto(t);
        const op = ramp(t, r.show[0], r.show[0] + 0.3) * (1 - ramp(t, r.show[1], r.show[2]));
        r.rect.setAttribute("width", f1(Math.max(0, X(u) - 300 + (u >= r.n ? 40 : 0))));
        L17.vis(r.p, op);
        r.spikes.forEach((s) => {
          const k = ramp(u, s.s - 0.4, s.s);
          L17.vis(s.g, k * op);
          s.g.setAttribute("transform", `translate(0 ${f1((1 - k) * 40)})`);
        });
        if (t >= r.show[0] && t < r.show[1]) {
          live = r;
          const i = Math.min(r.n, Math.floor(u + 0.3));
          charge = i > 0 ? (r.R.S[i - 1] ? 0 : r.R.V[i - 1]) : 0;
          fired = r.R.S.slice(0, i).filter(Boolean).length;
          flash = Math.max(0, ...L17.on(r.R.S).map((s) => V.flash(u, s - 0.7, s + 0.6)));
        }
      });
      // bucket water
      const wy = BK.bot - (BK.bot - BK.top) * charge;
      const [a, b] = edge(wy);
      water.setAttribute(
        "points",
        `${f1(a + 4)},${f1(wy)} ${f1(b - 4)},${f1(wy)} ${BK.r1 - 4},${BK.bot - 4} ${BK.l1 + 4},${BK.bot - 4}`,
      );
      L17.vis(water, k0 * (charge > 0 ? 1 : 0));
      if (flash > 0.2) bucket.style.stroke = tone("orange").c;
      // falling drop while a run is drawing
      const u = live ? live.upto(t) : 0;
      const drawing = live && u > 0 && u < live.n;
      const f = u - Math.floor(u);
      drop.setAttribute("cx", 150);
      drop.setAttribute("cy", f1(110 + (wy - 120) * f));
      L17.vis(drop, drawing ? 1 : 0);
      // the hole and its drips
      const kh = ramp(t, 8.0, 8.4);
      L17.vis(hole, kh);
      drips.forEach((d, i) => {
        const q = ((((t - 8.2) / 0.8 + i * 0.5) % 1) + 1) % 1;
        d.setAttribute("cx", f1(220 + 10 * q));
        d.setAttribute("cy", f1(408 + 60 * q));
        L17.vis(d, t > 8.2 ? kh * (1 - q * 0.5) : 0);
      });
      dropTag.set({
        k: k0,
        text: t < 3.6 ? "drop 0.12" : t < 8.0 ? "drop 0.25" : "drop 0.2",
      });
      leakTag.set({ k: kh });
      stat.set({ k: ramp(t, 0.4, 0.8), text: String(fired), bump: flash });
      notYet.set({ k: ramp(t, 3.0, 3.3) * (1 - ramp(t, 3.6, 3.9)) });
      L17.vis(level, ramp(t, 11.0, 11.5));
      lvTag.set({ k: ramp(t, 11.2, 11.6) });
    };
  },
});
