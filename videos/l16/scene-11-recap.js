/* Lecture 16 · Neural networks, scene 11-recap: three rows, each a small animated pictogram and one bold line (bare
   scene). Story (local seconds): 0.1 title and Sprout, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after
   its row, 4.2-4.8 the call to action "Next: Workshop 16.W". EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no
   loop, no reset): all are done by 6.5 s, so for the last seconds only Sprout's bob moves.
   Row 1 (purple): a neuron. Two blue inputs wire into a purple circle with a greater-or-equal sign; the output wire and dot
          light green.
   Row 2 (green): a hidden layer. A 2-2-1 network draws left to right; the hidden pair and then the output light green.
   Row 3 (orange): bend and evolve. A blue curve with a small dip beside the dashed real flow; then a weight bar grows a
          little with an orange plus and epsilon above it. */
(function () {
  const V = window.VID;
  const L13 = V.l13;
  const L16 = V.l16;
  const L5 = V.l5;
  const { ramp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);

  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 };
  const START = APPEAR.map((a) => a + 0.4);
  const CTA_AT = 4.2;
  const DONE = {};
  const T = (n) => L13.tone(n);
  const op = (el, k) => el.setAttribute("opacity", V.clamp(k).toFixed(3));

  // ---------- row 1: weighted sum and threshold ----------
  function neuronRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const ws = [L16.wire(svg), L16.wire(svg)];
    const wo = L16.wire(svg);
    const ins = [
      [40, 34],
      [40, 106],
    ].map(([x, y]) => L16.node(svg, { x, y, r: 20 }));
    const body = L16.node(svg, { x: 170, y: 70, r: 44 });
    const geq = L16.geq(svg, 170, 74, 40);
    const out = L16.node(svg, { x: 300, y: 70, r: 22 });
    DONE.row1 = 1.6;
    return (q) => {
      ins.forEach((n) => n.set({ tone: "blue", k: ramp(q, 0, 0.3) }));
      ws.forEach((w, i) =>
        w.set({ a: [60, i ? 100 : 40], b: [128, i ? 84 : 56], tone: "blue", w: 6, k: ramp(q, 0.2, 0.6) }),
      );
      body.set({ tone: "purple", solid: false, k: ramp(q, 0.4, 0.7) });
      op(geq, ramp(q, 0.6, 0.9));
      const lit = q >= 1.2;
      wo.set({ a: [214, 70], b: [278, 70], tone: lit ? "green" : "grey", w: 6, k: ramp(q, 0.9, 1.2) });
      out.set({ tone: lit ? "green" : "grey", k: ramp(q, 1.0, 1.3), s: 1 + 0.2 * V.flash(q, 1.2, 1.6) });
    };
  }

  // ---------- row 2: a hidden layer makes XOR ----------
  function hiddenRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const IN = [
      [40, 30],
      [40, 110],
    ];
    const HID = [
      [170, 30],
      [170, 110],
    ];
    const OUT = [300, 70];
    const w1 = [];
    IN.forEach((a) => HID.forEach((b) => w1.push([a, b, L16.wire(svg)])));
    const w2 = HID.map((a) => [a, L16.wire(svg)]);
    const nIn = IN.map(([x, y]) => L16.node(svg, { x, y, r: 20 }));
    const nH = HID.map(([x, y]) => L16.node(svg, { x, y, r: 24 }));
    const nO = L16.node(svg, { x: OUT[0], y: OUT[1], r: 26 });
    DONE.row2 = 1.8;
    return (q) => {
      nIn.forEach((n) => n.set({ tone: "blue", k: ramp(q, 0, 0.3) }));
      w1.forEach(([a, b, w]) => w.set({ a, b, tone: q >= 1.0 ? "green" : "grey", w: 5, k: ramp(q, 0.2, 0.5) }));
      nH.forEach((n) => n.set({ tone: q >= 1.0 ? "green" : "purple", solid: q >= 1.0, k: ramp(q, 0.4, 0.7) }));
      w2.forEach(([a, w]) => w.set({ a, b: OUT, tone: q >= 1.4 ? "green" : "grey", w: 5, k: ramp(q, 0.6, 0.9) }));
      nO.set({ tone: q >= 1.4 ? "green" : "grey", k: ramp(q, 0.8, 1.1), s: 1 + 0.2 * V.flash(q, 1.4, 1.8) });
    };
  }

  // ---------- row 3: degrade gracefully, evolve the weights ----------
  function bendRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const X = L16.XS;
    const sx = (x) => 14 + x * 210,
      sy = (v) => 124 - v * 100;
    const path = (P) => P.map((v, i) => `${f1(sx(X[i]))},${f1(sy(v))}`).join(" ");
    const real = svg.appendChild(
      V.s("polyline", { points: path(L16.T), fill: "none", "stroke-width": 4, "stroke-dasharray": "9 7" }),
    );
    real.style.stroke = "var(--text-dim)";
    const mk = () => svg.appendChild(V.s("polyline", { fill: "none", "stroke-width": 5, "stroke-linejoin": "round" }));
    const full = mk(),
      dip = mk();
    full.setAttribute("points", path(L16.BIGP));
    dip.setAttribute("points", path(L16.KOP));
    [full, dip].forEach((p) => (p.style.stroke = T("blue").c));
    const bar = svg.appendChild(V.s("rect", { x: 280, width: 30, rx: 5 }));
    bar.style.fill = T("purple").c;
    const plus = svg.appendChild(L13.mark("plus", 276, 20, 20, "orange"));
    const eps = L16.eps(svg, 304, 20, 22, "orange");
    DONE.row3 = 1.8;
    return (q) => {
      op(real, ramp(q, 0, 0.3));
      const d = ramp(q, 0.4, 0.8);
      op(full, ramp(q, 0, 0.3) * (1 - d));
      op(dip, d);
      const h = 50 + 34 * ramp(q, 1.3, 1.8, E.inOut);
      bar.setAttribute("y", f1(124 - h));
      bar.setAttribute("height", f1(h));
      op(bar, ramp(q, 0.8, 1.1));
      op(plus, ramp(q, 1.1, 1.4));
      op(eps, ramp(q, 1.1, 1.4));
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
        ["purple", "Neuron: weighted\nsum plus threshold", neuronRow],
        ["green", "A hidden layer\nsolves XOR", hiddenRow],
        ["orange", "Bend, don't break;\nevolve the weights", bendRow],
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
      L16.same(
        ends.every((e) => e <= 6.5),
        true,
        `recap: every pictogram is finished by 6.5 s (${ends.map((e) => e.toFixed(1)).join(", ")})`,
      );

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 16.W",
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
