/* Lecture 10 (ds-10) · scene 11-recap: three rows, each a small pictogram that plays once and holds, and one bold line (bare).
   Story (local seconds): 0.1 title 'Remember' and Pebble, rows slide in at 0.8 / 1.8 / 2.8, each pictogram runs on its row's
   own clock (q = t − row time) and is finished by q 2.9, 6.4 the call to action 'Next: Workshop 10.W'. Rows are done at about
   3.5, 4.7 and 5.3; after that only Pebble's bob moves.
   Row 1 (purple): three tiny drift shapes over grey baselines, drawn one after the other: a step (abrupt, q 1.0-1.5), a ramp
          (gradual, q 1.6-2.1), a square wave (recurring, q 2.2-2.7); red error ticks fill in under each high part.
   Row 2 (blue): 24 records (short grey right answers, tall red errors, the last 8 mostly red) appear under a growing blue
          window bracket (q 0.8-2.0); at q 2.4 the 6 oldest records turn red and drop away while the bracket's left end jumps
          right (q 2.4-2.9). Holds the cut window.
   Row 3 (orange): a small plot: the orange dashed warning line and the red dashed change line above a flat blue p + s line
          (q 0.2-0.8); the blue line rises at its right end (q 1.0-2.4), an orange dot pops where it crosses the warning line
          (q ≈ 1.9) and a red dot where it reaches the change line (q 2.4). */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D10 = V.d10;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const T = D4.tone;
  const f1 = (n) => n.toFixed(1);

  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.8, 2.8];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const CTA_AT = 6.4;

  const poly = (svg, pts, tone, w, dash) =>
    svg.appendChild(
      V.s("polyline", {
        points: pts.map((p) => p.map(f1).join(",")).join(" "),
        fill: "none",
        stroke: T(tone).c,
        "stroke-width": w,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-dasharray": dash || "none",
      }),
    );
  // draw a polyline on from its first point (pathLength 1)
  const drawOn = (el, k) => {
    el.setAttribute("pathLength", "1");
    el.style.strokeDasharray = "1 1";
    el.style.strokeDashoffset = f1(1 - k);
    el.style.visibility = k > 0.002 ? "" : "hidden";
  };
  const dotEl = (svg, x, y, tone, r = 10) =>
    svg.appendChild(
      V.s("circle", { cx: f1(x), cy: f1(y), r, fill: T(tone).c, stroke: T(tone).lip, "stroke-width": 3 }),
    );

  // ---------- row 1: abrupt, gradual, recurring ----------
  function kindsRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const LO = 92;
    const HI = 30;
    const BASE = 124;
    const W = 96;
    // shapes as functions of u 0..1 -> 0 (old rule) .. 1 (new rule)
    const shapes = [
      (u) => (u < 0.4 ? 0 : 1),
      (u) => Math.min(1, Math.max(0, (u - 0.2) / 0.6)),
      (u) => (Math.floor(u * 4) % 2 ? 1 : 0),
    ];
    const AT = [1.0, 1.6, 2.2];
    const rows = shapes.map((fn, i) => {
      const x0 = 14 + i * (W + 14);
      poly(
        svg,
        [
          [x0, BASE],
          [x0 + W, BASE],
        ],
        "grey",
        4,
      );
      const pts = [];
      for (let j = 0; j <= 96; j++) {
        const u = j / 96;
        const y = lerp(LO, HI, fn(u));
        // vertical jumps: repeat the x at the step so the line is square
        if (j > 0 && fn(u) !== fn((j - 1) / 96) && i !== 1) pts.push([x0 + W * u, lerp(LO, HI, fn((j - 1) / 96))]);
        pts.push([x0 + W * u, y]);
      }
      const line = poly(svg, pts, "purple", 5);
      // red error ticks under the high part (density follows the shape: the new rule makes the old model wrong)
      const ticks = [];
      for (let j = 0; j < 12; j++) {
        const u = (j + 0.5) / 12;
        if (fn(u) < 0.5) continue;
        ticks.push({
          u,
          el: svg.appendChild(
            V.s("rect", { x: f1(x0 + W * u - 1.5), y: BASE - 16, width: 3, height: 14, rx: 1, fill: T("red").c }),
          ),
        });
      }
      return { line, ticks, at: AT[i] };
    });
    return (q) =>
      rows.forEach((r) => {
        const k = ramp(q, r.at, r.at + 0.5, E.lin);
        drawOn(r.line, k);
        r.ticks.forEach((tk) => V.show(tk.el, k >= tk.u ? 1 : 0));
      });
  }

  // ---------- row 2: ADWIN grows, then cuts ----------
  function adwinRow(pic) {
    const xs = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1];
    const CUT = 6;
    D10.same(
      "recap row 2: 24 records, the last 8 mostly wrong",
      [xs.length, xs.slice(16).filter(Boolean).length],
      [24, 6],
    );
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const strip = D10.strip(svg, { x0: 20, x1: 320, r0: 0, r1: xs.length, y: 66, h: 50 });
    const span = D10.span(svg);
    return (q) => {
      const n = Math.floor(lerp(0, xs.length, ramp(q, 0.8, 2.0, E.lin)));
      const turn = q >= 2.4;
      const k = ramp(q, 2.4, 2.9, E.inOut);
      strip.set({
        xs,
        to: n,
        groups: turn ? [{ a: 0, b: CUT, err: "red", ok: "red", dy: 22 * k, o: 1 - k }] : [],
      });
      span.set({ x1: lerp(strip.x(0), strip.x(CUT), k), x2: strip.x(n), y: 46, h: 14, tone: "blue", w: 6 });
    };
  }

  // ---------- row 3: DDM's warning and change lines ----------
  function ddmRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const A = { x0: 20, x1: 322, y0: 8, y1: 128 };
    poly(
      svg,
      [
        [A.x0, A.y0],
        [A.x0, A.y1],
        [A.x1, A.y1],
      ],
      "grey",
      4,
    );
    const Y = { blue: 100, warn: 66, change: 40 };
    const warn = poly(
      svg,
      [
        [A.x0 + 6, Y.warn],
        [A.x1, Y.warn],
      ],
      "orange",
      5,
      "10 8",
    );
    const change = poly(
      svg,
      [
        [A.x0 + 6, Y.change],
        [A.x1, Y.change],
      ],
      "red",
      5,
      "10 8",
    );
    const RISE = { x: 220, x1: 312 };
    const flat = poly(
      svg,
      [
        [A.x0 + 6, Y.blue],
        [RISE.x, Y.blue],
      ],
      "blue",
      6,
    );
    const rise = poly(
      svg,
      [
        [RISE.x, Y.blue],
        [RISE.x1, Y.change],
      ],
      "blue",
      6,
    );
    const fW = (Y.blue - Y.warn) / (Y.blue - Y.change); // the fraction of the rise where it meets the warning line
    const atX = (f) => lerp(RISE.x, RISE.x1, f);
    const dW = dotEl(svg, atX(fW), Y.warn, "orange");
    const dC = dotEl(svg, RISE.x1, Y.change, "red");
    const R0 = 1.0;
    const R1 = 2.4;
    const tW = lerp(R0, R1, fW);
    return (q) => {
      const kl = ramp(q, 0.2, 0.6, E.lin);
      V.show(warn, kl);
      V.show(change, kl);
      drawOn(flat, ramp(q, 0.2, 0.8, E.lin));
      drawOn(rise, ramp(q, R0, R1, E.lin));
      const kw = ramp(q, tW, tW + 0.3, E.lin);
      V.place(dW, { s: (0.5 + 0.5 * E.pop(kw)) * (1 + 0.25 * flash(q, tW + 0.3, tW + 0.7)), o: kw });
      const kc = ramp(q, R1, R1 + 0.3, E.lin);
      V.place(dC, { s: (0.5 + 0.5 * E.pop(kc)) * (1 + 0.25 * flash(q, R1 + 0.3, R1 + 0.7)), o: kc });
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
      const mascot = V.mascot("pebble", { size: 150, mood: "love" });
      mascot.style.left = "850px";
      mascot.style.top = "48px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["purple", "Drift: abrupt, gradual\nor recurring", kindsRow],
        ["blue", "ADWIN: grow the window,\ncut when parts disagree", adwinRow],
        ["orange", "DDM: warning at 2 spreads,\nchange at 3", ddmRow],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "420px",
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

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 10.W",
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          fontSize: "34px",
          padding: "8px 34px 10px",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 904, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
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
          r.update(t - APPEAR[i]);
        });
        const c = ramp(t, CTA_AT, CTA_AT + 0.6, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, CTA_AT, CTA_AT + 0.3) });
      };
    },
  });
})();
