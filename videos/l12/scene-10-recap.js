/* Lecture 12 · Particle swarm optimisation, scene 10-recap: three rows, each a small animated pictogram and one bold line
   (bare scene). Story (local seconds): 0.1 title and Sprout, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s
   after its row, 5.6-6.2 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no fade, no
   reset): row 1 is done at about 4.2, row 2 at 5.7, row 3 at 6.2, so for the last 2.5 seconds only Sprout's bob moves.
   Row 1 (blue): a particle is a guess plus a velocity. A green scent patch; a blue dot with a grey velocity arrow; the dot
          slides along the arrow (a dashed blue ring stays where it started) and a green 'odour' tag pops beside it.
   Row 2 (purple): scene 4 in small. A blue dot, a purple ring (own best p), an orange star (swarm best g); three arrows laid
          head to tail: grey (keep going), purple (pull to p), orange (pull to g), then the blue dashed sum (the move).
   Row 3 (green): binary PSO. A chance bar whose blue segment grows to v = 0.8, the grey rand() marker drops at 0.55 (the
          lesson's draw, L12.BIT), and the bit chip flips from grey 0 to green 1. */
(function () {
  const V = window.VID;
  const L12 = V.l12;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const { f1, fmt } = L12;

  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const START = APPEAR.map((a) => a + 0.4);
  const CTA_AT = 5.6;
  const smooth = (x) => x * x * (3 - 2 * x);
  const DONE = {}; // local finish time of each pictogram (asserted below: all done by 6.5 s)

  // ---------- row 1: a particle is a guess (a position) plus a velocity ----------
  function particleRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const patch = svg.appendChild(
      V.s("rect", { x: 10, y: 10, width: 200, height: 120, rx: 22, style: { fill: "var(--teal-dim)" } }),
    );
    // a brighter patch of scent where the dot ends up
    const hot = svg.appendChild(V.s("circle", { cx: 160, cy: 50, r: 34, style: { fill: "var(--teal)" } }));
    hot.setAttribute("fill-opacity", "0.35");
    const [A, B] = [
      [50, 100],
      [160, 50],
    ];
    const blue = L12.tone("blue");
    const ring = svg.appendChild(
      V.s("circle", {
        cx: A[0],
        cy: A[1],
        r: 13,
        fill: "none",
        "stroke-width": 4,
        "stroke-dasharray": "6 5",
        style: { stroke: blue.c },
      }),
    );
    const vel = L12.arrow(svg, { tone: "grey", w: 7, head: 18 });
    const dot = svg.appendChild(
      V.s("circle", { cx: 0, cy: 0, r: 13, "stroke-width": 3, style: { fill: blue.c, stroke: blue.lip } }),
    );
    const odour = L12.tag(pic, { x: 196, y: 8, text: "odour", tone: "green", solid: true });
    // the arrow's tip stops just short of B, so its head shows in front of the dot once the dot has arrived
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const TIP = [B[0] - ((B[0] - A[0]) * 16) / len, B[1] - ((B[1] - A[1]) * 16) / len];
    const T = { pop: [0.1, 0.6], arrow: [0.8, 1.4], slide: [1.6, 2.4], tag: [2.6, 3.0] };
    DONE.row1 = T.tag[1];

    return (q) => {
      const k = ramp(q, ...T.pop);
      V.place(patch, { o: k });
      V.place(hot, { o: k });
      const sl = smooth(ramp(q, ...T.slide, E.lin));
      const p = [lerp(A[0], B[0], sl), lerp(A[1], B[1], sl)];
      // the arrow is the velocity: it keeps pointing from the dot's start to where the step lands, and fades as the dot arrives
      vel.set({ a: A, b: TIP, k: ramp(q, ...T.arrow), o: 1 - 0.4 * sl });
      dot.setAttribute("cx", f1(p[0]));
      dot.setAttribute("cy", f1(p[1]));
      V.place(dot, { o: Math.min(1, k * 3) });
      V.place(ring, { o: ramp(q, T.slide[0] + 0.1, T.slide[0] + 0.4) });
      odour.set({ k: ramp(q, ...T.tag), s: 1 + 0.08 * flash(q, T.tag[1], T.tag[1] + 0.4) });
    };
  }

  // ---------- row 2: keep going + pull to own best + pull to swarm best ----------
  function arrowsRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const blue = L12.tone("blue");
    const P = { x: [40, 100], p: [180, 124], g: [300, 30] };
    const legs = [
      { a: [40, 100], b: [110, 60], tone: "grey" },
      { a: [110, 60], b: [160, 110], tone: "purple" },
      { a: [160, 110], b: [240, 64], tone: "orange" },
    ];
    // each pull points at its target: purple towards the ring p, orange towards the star g
    const heading = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
    [
      [legs[1], P.p],
      [legs[2], P.g],
    ].forEach(([l, to]) =>
      L12.same(Math.abs(heading(l.a, l.b) - heading(l.a, to)) < 0.12, true, "recap row 2: the pull points at its best"),
    );
    // head to tail: each leg starts where the last one ended, and the sum runs from the dot to the last tip
    legs.forEach((l, i) => i && L12.same(l.a, legs[i - 1].b, "recap row 2: the arrows are laid head to tail"));
    const sum = { a: legs[0].a, b: legs[2].b };
    L12.same(sum.a, P.x, "recap row 2: the move starts at the particle");
    const ring = svg.appendChild(
      V.s("circle", {
        cx: P.p[0],
        cy: P.p[1],
        r: 14,
        fill: "none",
        "stroke-width": 6,
        style: { stroke: L12.tone("purple").c },
      }),
    );
    const star = svg.appendChild(L12.star(P.g[0], P.g[1], 30, "orange"));
    const arrows = legs.map((l) => ({ l, a: L12.arrow(svg, { tone: l.tone, w: 7, head: 18 }) }));
    const sumA = L12.arrow(svg, { tone: "blue", w: 6, head: 18 });
    const dot = svg.appendChild(
      V.s("circle", { cx: P.x[0], cy: P.x[1], r: 13, "stroke-width": 3, style: { fill: blue.c, stroke: blue.lip } }),
    );
    const T = { pop: 0.1, arrows: 0.8, each: 0.6, sum: [2.8, 3.4] };
    DONE.row2 = T.sum[1];

    return (q) => {
      [dot, ring, star].forEach((e, i) => {
        const k = L12.seq(q, T.pop, 0.1, 0.3, i);
        V.place(e, { s: 0.6 + 0.4 * E.pop(k), o: Math.min(1, k * 3) });
      });
      arrows.forEach(({ l, a }, i) => {
        const t0 = T.arrows + i * T.each;
        a.set({ a: l.a, b: l.b, tone: l.tone, k: smooth(ramp(q, t0, t0 + T.each - 0.1, E.lin)) });
      });
      sumA.set({ a: sum.a, b: sum.b, dash: true, k: smooth(ramp(q, ...T.sum, E.lin)) });
    };
  }

  // ---------- row 3: for bits, v is the chance of a 1 ----------
  function bitRow(pic) {
    const B = L12.BIT;
    L12.close([B.nv, B.u], [0.8, 0.55], 1e-9, "recap row 3: v = 0.8 and the draw 0.55");
    L12.same([B.u < B.nv, B.x, B.nx], [true, 0, 1], "recap row 3: 0.55 < 0.8, so the bit goes from 0 to 1");
    const BAR = { x: 10, y: 50, w: 320, h: 40 };
    const bar = L12.prob(pic, BAR);
    const vText = `v = ${fmt(B.nv)}`;
    const vTag = L12.tag(pic, { x: bar.xOf(B.nv) - 40, y: 0, text: vText, tone: "blue" });
    const chip = L12.chip(pic, { x: 10, y: 100, w: 60, h: 40, text: "0", tone: "grey", fs: 32, radius: 14 });
    const lab = L12.label(pic, { x: 84, y: 102, text: "bit", align: "left" });
    const T = { bar: [0.1, 0.6], grow: [0.8, 1.6], drop: [1.8, 2.3], flip: [2.4, 2.8] };
    DONE.row3 = T.flip[1];

    return (q) => {
      const g = ramp(q, ...T.grow);
      bar.set({
        k: ramp(q, ...T.bar),
        ends: false,
        segs: [{ from: 0, to: B.nv * g, tone: "blue" }],
        marker: B.u,
        markerK: ramp(q, ...T.drop),
        markerTone: "grey",
      });
      vTag.set({ k: ramp(q, T.grow[1] - 0.2, T.grow[1] + 0.2) });
      const fl = ramp(q, ...T.flip, E.lin);
      const one = fl >= 0.5;
      chip.set({
        k: ramp(q, ...T.bar),
        text: String(one ? B.nx : B.x),
        tone: one ? "green" : "grey",
        solid: one,
        sx: Math.abs(Math.cos(Math.PI * fl)),
      });
      lab.set({ k: ramp(q, ...T.bar) });
    };
  }

  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const head = V.h("div", {
        class: "v-title-line",
        text: "Remember",
        style: { position: "absolute", left: "72px", top: "108px", fontSize: "76px" },
      });
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP" });
      const mascot = V.mascot("sprout", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["blue", "A particle is a guess\nplus a velocity", particleRow],
        ["purple", "Keep going, own best,\nswarm best", arrowsRow],
        ["green", "For bits, v is the\nchance of a 1", bitRow],
      ].map(([tone, text, make], i) => {
        text.split("\n").forEach((line) => {
          if (line.length > 22) throw new Error(`recap: "${line}" is longer than 22 characters`);
        });
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "440px",
            top: "0",
            height: "174px",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            fontSize: "36px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });
      const ends = [DONE.row1, DONE.row2, DONE.row3].map((d, i) => START[i] + d);
      L12.same(
        ends.every((e) => e <= 6.5),
        true,
        `recap: every pictogram is finished by 6.5 s (${ends.map((e) => e.toFixed(1)).join(", ")})`,
      );

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 12.W",
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          fontSize: "34px",
          padding: "8px 34px 10px",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 864, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
      });
      ctaBar.append(cta);
      stage.append(ctaBar);

      return (t) => {
        V.place(kicker, { y: (1 - ramp(t, 0.05, 0.45)) * 10, o: ramp(t, 0.05, 0.45) });
        V.place(head, { y: (1 - ramp(t, 0.1, 0.6)) * 20, o: ramp(t, 0.1, 0.6) });
        const m = ramp(t, 0.2, 0.9, E.pop);
        V.place(mascot, {
          y: (1 - m) * 30 + 6 * Math.sin((2 * Math.PI * t) / 2.6),
          r: 3 * Math.sin((2 * Math.PI * t) / 3.2 + 1),
          s: 0.7 + 0.3 * m,
          o: ramp(t, 0.2, 0.5),
        });
        rows.forEach((r, i) => {
          const k = ramp(t, APPEAR[i], APPEAR[i] + 0.5);
          V.place(r.card, { y: (1 - k) * 36, o: k });
          const kl = ramp(t, APPEAR[i] + 0.15, APPEAR[i] + 0.65);
          V.place(r.label, { x: (1 - kl) * 24, o: kl });
          r.update(t - START[i]);
        });
        const c = ramp(t, CTA_AT, CTA_AT + 0.6, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, CTA_AT, CTA_AT + 0.3) });
      };
    },
  });
})();
