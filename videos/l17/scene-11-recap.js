/* Lecture 17 · Spiking neural networks, scene 11-recap: three rows, each a small animated pictogram and one bold line (bare
   scene). Story (local seconds): 0.1 title and Sprout, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after
   its row, 4.2-4.8 the call to action 'Next: Workshop 17.W'. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no
   loop, no reset): all are done by 6.5 s, so afterwards only Sprout's bob moves.
   Row 1 (orange): coding. Three short spike-train rows; their orange ticks pop in left to right (rate, timing, team).
   Row 2 (blue): the leaky neuron. A blue sawtooth charge trace draws under a red dashed threshold; an orange spike rises
          at each peak.
   Row 3 (green): learning. A blue pre neuron, a green arrow to an orange post neuron with a green '+1', and a small purple
          bell curve beside them. */
(function () {
  const V = window.VID;
  const L13 = V.l13;
  const L17 = V.l17;
  const L5 = V.l5;
  const { ramp, ease: E } = V;
  const { f1 } = L13;

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
  const tickEl = (svg, x, y, h, tone) => {
    const r = svg.appendChild(V.s("rect", { x: x - 5, y, width: 10, height: h, rx: 3, "stroke-width": 2 }));
    r.style.fill = T(tone).c;
    r.style.stroke = T(tone).lip;
    return r;
  };

  // ---------- row 1: three spike-train rows ----------
  function codeRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const TR = [
      [2, 5, 8, 11, 14, 17],
      [4, 13],
      [6, 7, 9, 10],
    ];
    const ticks = [];
    TR.forEach((steps, r) => {
      const y = 14 + 42 * r;
      const base = svg.appendChild(V.s("line", { x1: 20, x2: 320, y1: y + 32, y2: y + 32, "stroke-width": 3 }));
      base.style.stroke = "var(--line-2)";
      steps.forEach((s) => ticks.push({ el: tickEl(svg, 20 + 16 * s, y, 30, "orange"), s }));
    });
    DONE.row1 = 1.6;
    return (q) => ticks.forEach((k) => L17.vis(k.el, ramp(q, 0.1 + 0.07 * k.s, 0.25 + 0.07 * k.s)));
  }

  // ---------- row 2: sawtooth charge under the threshold ----------
  function leakRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const thr = svg.appendChild(V.s("line", { x1: 20, x2: 320, y1: 40, y2: 40, "stroke-width": 4 }));
    thr.setAttribute("stroke-dasharray", "10 8");
    thr.style.stroke = T("red").c;
    const ax = svg.appendChild(V.s("path", { d: "M20 20 V130 H320", fill: "none", "stroke-width": 4 }));
    ax.style.stroke = "var(--text-dim)";
    const pts = [];
    const peaks = [];
    for (let c = 0; c < 3; c++) {
      const x0 = 20 + 96 * c;
      pts.push(`${x0} 128`, `${x0 + 90} 42`, `${x0 + 90} 128`);
      peaks.push(x0 + 90);
    }
    const p = L17.path(svg);
    const spikes = peaks.map((x) => {
      const l = svg.appendChild(
        V.s("line", { x1: x, x2: x, y1: 40, y2: 6, "stroke-width": 6, "stroke-linecap": "round" }),
      );
      l.style.stroke = T("orange").c;
      return l;
    });
    DONE.row2 = 1.8;
    return (q) => {
      const k = ramp(q, 0.1, 1.5, E.lin);
      p.set({ d: `M${pts.join(" L")}`, tone: "blue", w: 5, k });
      spikes.forEach((l, i) => L17.vis(l, ramp(k, (i + 0.95) / 3 - 0.02, (i + 1) / 3)));
    };
  }

  // ---------- row 3: pre -> post (+1) and a bell ----------
  function learnRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const pre = L17.node(svg, { x: 34, y: 70, r: 24 });
    const post = L17.node(svg, { x: 172, y: 70, r: 24 });
    const arr = L13.arrow(svg, { tone: "green", w: 8, head: 20 });
    const plus = L17.text(svg, { x: 92, y: 40, text: "+1", tone: "green", fs: 32, weight: 900 });
    const d = `M${Array.from({ length: 41 }, (_, i) => {
      const a = -4 + i * 0.2;
      return `${f1(270 + 14 * a)} ${f1(120 - 360 * L17.slope(a, 1))}`;
    }).join(" L")}`;
    const bell = L17.path(svg);
    DONE.row3 = 1.6;
    return (q) => {
      pre.set({ tone: "blue", k: ramp(q, 0, 0.3) });
      post.set({ tone: "orange", k: ramp(q, 0.1, 0.4) });
      arr.set({ a: [62, 70], b: [144, 70], k: ramp(q, 0.4, 0.9, E.out) });
      plus.set({ o: ramp(q, 0.8, 1.1) });
      bell.set({ d, tone: "purple", w: 6, k: ramp(q, 0.8, 1.6) });
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
        ["orange", "Spikes code by rate,\ntiming or team", codeRow],
        ["blue", "Leaky neurons fill,\nfire and reset", leakRow],
        ["green", "STDP, surrogates or\nevolution to learn", learnRow],
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
      L17.same(
        ends.every((e) => e <= 6.5),
        true,
        `recap: every pictogram is finished by 6.5 s (${ends.map((e) => e.toFixed(1)).join(", ")})`,
      );

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 17.W",
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
          r.update(Math.max(0, t - START[i]));
        });
        const c = ramp(t, CTA_AT, CTA_AT + 0.6, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, CTA_AT, CTA_AT + 0.3) });
      };
    },
  });
})();
