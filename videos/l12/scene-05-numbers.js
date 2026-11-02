/* Lecture 12 video, scene 5: the same sum, in one dimension. Lesson 12.3's worked example ('Add them up') on a number line:
   x 4, v 1, own best p 7, swarm best g 2, c₁ = c₂ = 2, z₁ = z₂ = 0.5. The three arrows of scene 4 are laid head to tail, each
   on its own lane: grey 4 -> 5 (keep going), purple 5 -> 8 (+3, pull to p), orange 8 -> 6 (−2, pull to g); new v = 2, new x = 6.
   Every number comes from L12.ONED (computed and asserted in l12/common.js) and is asserted again here.
   Story (local seconds): 0.2-0.8 the number line; 0.6-1.6 the particle, p and g with their tags; 3.1-4.2 the c and z tags (the
   dice shakes); 5.2-6.2 the grey arrow; 6.8-7.8 the purple working, then its arrow; 8.6-9.6 the orange working, then its arrow;
   10.4 'new v'; 10.9-11.9 the dot slides 4 -> 6; 11.6 'new x'; hold to 13. */
VID.scene({
  kicker: "THE NUMBERS",
  title: ["The same sum,", "in one dimension"],
  dur: 13,
  caps: [
    [1, 2.9, "One dimension: x is 4, its best 7, the swarm's 2."],
    [3.1, 5, "c₁, c₂ set how hard; z₁, z₂ are random draws."],
    [5.2, 6.7, "It keeps its velocity of 1."],
    [6.8, 8.4, "The pull to its own best adds 3."],
    [8.6, 10.2, "The pull to the swarm's best adds minus 2."],
    [10.4, 12.7, "New velocity 2, so it moves from 4 to 6."],
  ],
  build(stage, V) {
    const L12 = V.l12;
    const L5 = V.l5;
    const { ramp, flash, clamp, lerp, ease: E } = V;
    const F = L12.fmt;
    const M = "−"; // a real minus sign for the labels

    // ---- the data: lesson 12.3's worked example, asserted again here
    const O = L12.ONED;
    L12.same(
      [O.x, O.v, O.p, O.g, O.c1, O.c2, O.z1, O.z2],
      [4, 1, 7, 2, 2, 2, 0.5, 0.5],
      "scene 5: the lesson's inputs",
    );
    L12.same(O.cog, O.c1 * O.z1 * (O.p - O.x), "scene 5: pull to own best = c₁ z₁ (p − x)");
    L12.same(O.soc, O.c2 * O.z2 * (O.g - O.x), "scene 5: pull to swarm best = c₂ z₂ (g − x)");
    L12.same([O.cog, O.soc, O.nv, O.nx], [3, -2, 2, 6], "scene 5: +3, −2, new v 2, new x 6");
    L12.same(O.x + O.v + O.cog + O.soc, O.nx, "scene 5: the three arrows end on the new position");
    const sgn = (n) => (n < 0 ? `${M}${F(-n)}` : F(n));
    const plus = (n) => (n < 0 ? `${M}${F(-n)}` : `+${F(n)}`);
    const work = (z, b) => `${F(O.c1)} × ${F(z)} × (${F(b)} ${M} ${F(O.x)}) = ${sgn(O.c1 * z * (b - O.x))}`;
    L12.same(work(O.z1, O.p), "2 × 0.5 × (7 − 4) = 3", "scene 5: purple working");
    L12.same(work(O.z2, O.g), "2 × 0.5 × (2 − 4) = −2", "scene 5: orange working");
    const nvText = `new v = ${F(O.v)} + ${F(O.cog)} ${M} ${F(-O.soc)} = ${F(O.nv)}`;
    const nxText = `new x = ${F(O.x)} + ${F(O.nv)} = ${F(O.nx)}`;
    L12.same([nvText, nxText], ["new v = 1 + 3 − 2 = 2", "new x = 4 + 2 = 6"], "scene 5: result tags");

    // ---- timeline (local seconds)
    const T = {
      line: [0.2, 0.8],
      marks: [0.6, 0.9, 1.2], // particle, p, g pop 0.3 s apart
      c: [3.1, 3.7],
      z: [3.6, 4.2],
      grey: [5.2, 6.2],
      pTag: [6.8, 7.2],
      purple: [7.1, 7.8],
      gTag: [8.6, 9.0],
      orange: [8.9, 9.6],
      nv: [10.4, 10.9],
      slide: [10.9, 11.9],
      nx: [11.6, 12.0],
    };

    // ---- the number line and one svg layer for the markers, drop lines and arrows (tags sit on top of it)
    const LY = 470;
    const nl = L12.numLine(stage, { x: 48, y: LY, w: 840, min: 0, max: 10 });
    const svg = L5.svg(stage);
    const S = (tag, attrs, style) => svg.appendChild(V.s(tag, { ...attrs, style }));
    const LANE = { grey: 320, purple: 250, orange: 180 };
    const segs = [
      { tone: "grey", from: O.x, to: O.x + O.v, text: `v = ${F(O.v)}`, t: T.grey },
      { tone: "purple", from: O.x + O.v, to: O.x + O.v + O.cog, text: `c₁z₁(p ${M} x) = ${plus(O.cog)}`, t: T.purple },
      { tone: "orange", from: O.x + O.v + O.cog, to: O.nx, text: `c₂z₂(g ${M} x) = ${plus(O.soc)}`, t: T.orange },
    ];
    L12.same(
      segs.map((q) => [q.from, q.to]),
      [
        [4, 5],
        [5, 8],
        [8, 6],
      ],
      "scene 5: the three lanes 4 -> 5, 5 -> 8, 8 -> 6",
    );
    // faint dashed drop lines from each arrow's start down to the number line
    const drops = segs.map((q) =>
      S(
        "line",
        {
          x1: nl.px(q.from),
          x2: nl.px(q.from),
          y1: LANE[q.tone],
          y2: LY,
          "stroke-width": 4,
          "stroke-dasharray": "6 8",
        },
        { stroke: "var(--line-2)" },
      ),
    );
    const arrows = segs.map((q) => L12.arrow(svg, { tone: q.tone, w: 9, head: 24 }));

    // the markers: g (orange star), p (purple ring), the old spot (dashed blue ring), the particle (blue dot)
    const star = svg.appendChild(L12.star(nl.px(O.g), LY, 46, "orange"));
    const ring = S(
      "circle",
      { cx: nl.px(O.p), cy: LY, r: 22, fill: "none", "stroke-width": 6 },
      { stroke: L12.tone("purple").c },
    );
    const ghost = S(
      "circle",
      { cx: nl.px(O.x), cy: LY, r: 16, fill: "none", "stroke-width": 4, "stroke-dasharray": "6 6" },
      { stroke: L12.tone("blue").c },
    );
    const blue = L12.tone("blue");
    const dot = S("circle", { cx: 0, cy: LY, r: 16, "stroke-width": 3 }, { fill: blue.c, stroke: blue.lip });

    // the arrow labels: on each arrow's own lane, just left of its left end (the free side of the stage), naming the term
    // of the formula it is: v, c₁z₁(p − x), c₂z₂(g − x)
    const labs = segs.map((q) => {
      const w = q.tone === "grey" ? 110 : 330;
      return {
        l: L12.label(stage, {
          x: nl.px(Math.min(q.from, q.to)) - 14 - w,
          y: LANE[q.tone] - 21,
          w,
          text: q.text,
          tone: q.tone,
          fs: 30,
          align: "right",
        }),
      };
    });

    // the marker tags above the line, centred on their points
    const markTag = (text, tone, v) =>
      L12.tag(stage, { x: nl.px(v) - L12.tagW(text, 30) / 2, y: 380, text, tone, fs: 30 });
    const tags = [
      markTag(`x = ${F(O.x)}`, "blue", O.x),
      markTag(`p = ${F(O.p)}`, "purple", O.p),
      markTag(`g = ${F(O.g)}`, "orange", O.g),
    ];

    // the two definitions (top left) and the dice
    const cTag = L12.tag(stage, { x: 12, y: 12, text: `c₁ = c₂ = ${F(O.c1)}: pull strength`, tone: "grey" });
    const zText = `z₁ = z₂ = ${F(O.z1)}: random, 0 to 1`;
    const zTag = L12.tag(stage, { x: 12, y: 84, text: zText, tone: "grey" });
    const dice = svg.appendChild(L5.dice(12 + L12.tagW(zText) + 44, 112, 56, { face: 3, tone: "grey" }));

    // the working (top right) and the results (under the line)
    const pWork = L12.tag(stage, { x: 520, y: 12, text: work(O.z1, O.p), tone: "purple" });
    const gWork = L12.tag(stage, { x: 520, y: 84, text: work(O.z2, O.g), tone: "orange" });
    const nvTag = L12.tag(stage, { x: 60, y: 560, text: nvText, tone: "blue", solid: true });
    const nxTag = L12.tag(stage, { x: 520, y: 560, text: nxText, tone: "blue", solid: true });

    return (t) => {
      nl.set({ k: ramp(t, T.line[0], T.line[1], E.lin) });
      const mk = T.marks.map((a) => ramp(t, a, a + 0.4, E.lin));

      // markers
      const pop = (k) => 0.6 + 0.4 * E.pop(k);
      V.place(dot, { o: Math.min(1, mk[0] * 3), s: pop(mk[0]) });
      dot.setAttribute("cx", L12.f1(nl.px(lerp(O.x, O.nx, ramp(t, T.slide[0], T.slide[1], E.inOut)))));
      V.place(ring, { o: Math.min(1, mk[1] * 3), s: pop(mk[1]) });
      V.place(star, { o: Math.min(1, mk[2] * 3), s: pop(mk[2]) });
      V.place(ghost, { o: 0.8 * ramp(t, T.slide[0], T.slide[0] + 0.3, E.lin) });
      tags.forEach((g, i) => g.set({ k: mk[i] }));

      // definitions: the dice shakes once as the z tag pops
      cTag.set({ k: ramp(t, T.c[0], T.c[1], E.lin) });
      const zk = ramp(t, T.z[0], T.z[1], E.lin);
      zTag.set({ k: zk });
      V.place(dice, { o: Math.min(1, zk * 3), s: pop(zk), r: 18 * Math.sin(Math.PI * 4 * clamp((t - T.z[0]) / 0.6)) });

      // the three arrows, each with its drop line and label; the working tag comes first for purple and orange
      segs.forEach((q, i) => {
        const k = ramp(t, q.t[0], q.t[1], E.inOut);
        arrows[i].set({ a: [nl.px(q.from), LANE[q.tone]], b: [nl.px(q.to), LANE[q.tone]], k });
        V.show(drops[i], 0.8 * ramp(t, q.t[0], q.t[0] + 0.3, E.lin));
        labs[i].l.set({ k: ramp(t, q.t[1] - 0.2, q.t[1] + 0.2, E.lin) });
      });
      pWork.set({ k: ramp(t, T.pTag[0], T.pTag[1], E.lin), s: 1 + 0.06 * flash(t, T.purple[1], T.purple[1] + 0.4) });
      gWork.set({ k: ramp(t, T.gTag[0], T.gTag[1], E.lin), s: 1 + 0.06 * flash(t, T.orange[1], T.orange[1] + 0.4) });

      // results
      nvTag.set({ k: ramp(t, T.nv[0], T.nv[1], E.lin) });
      nxTag.set({ k: ramp(t, T.nx[0], T.nx[1], E.lin) });
    };
  },
});
