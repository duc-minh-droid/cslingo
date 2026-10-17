/* Phase 9 · Fourier Transform & FFT (algo-9), scene 11-recap: three rows, each a small animated pictogram and one bold line.
   Bare scene. Story (local seconds): 0.1 title and Byte, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row,
   5.4 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop, no fade, no reset): row 1 is done at about
   3.5, row 2 at 5.3 and row 3 at 5.4, so for the last three seconds only Byte's bob moves.
   Row 1 (blue): two purple waves (the 5 Hz wave and the 12 Hz wave of scene 2) draw on, a grey plus and equals sign pop, and the blue
          wiggle they add up to draws on: any signal is a sum of sine waves.
   Row 2 (orange): the eight blue arrows of the spinning-arrow test chain tip to tail (A9.chain(1)), the orange total arrow draws on, a
          purple arrow points to one tall orange bar: the test result.
   Row 3 (green): a red bar of 64 products against a short green bar of 12 butterflies and a green tick: the FFT halves the work.
   Every number comes from A9.MIX / A9.chain / A9.W8 / A9.FFT and is asserted when the scene is built. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const L5 = V.l5;
  const { ramp, ease: E } = V;
  const { f1 } = A9;

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
  const CTA_AT = 5.4;
  const NOPAD = { l: 0, r: 0, t: 0, b: 0 };
  const lin = E.lin;
  const popIn = (g, k) => V.place(g, { s: 0.6 + 0.4 * E.pop(k), o: Math.min(1, k * 4) });

  // ---------- row 1: any signal is a sum of sine waves ----------
  function sumRow(pic) {
    const { MIX } = A9;
    const SPAN = 0.4; // seconds of signal shown in each little plot
    A9.close("recap row 1: the 5 Hz wave shows two cycles", MIX.waves[0].f * SPAN, 2, 1e-9);
    A9.close("recap row 1: the 12 Hz wave shows 4.8 cycles", MIX.waves[1].f * SPAN, 4.8, 1e-9);
    A9.same("recap row 1: the two strengths", [MIX.waves[0].a, MIX.waves[1].a], [1, 0.5]);
    const peak = Math.max(...Array.from({ length: 400 }, (_, i) => Math.abs(MIX.at((SPAN * i) / 400))));
    if (!(peak < 1.7 && peak > 1)) throw new Error(`recap row 1: the sum peaks at ${peak}, outside the plot window`);

    const [W, XS] = [90, [0, 125, 250]]; // three plots with 35 px between them for the plus and equals signs
    const mkPlot = (x) =>
      A9.plot(pic, { x, y: 0, w: W, h: 140, frame: false, view: [0, 1, -1.7, 1.7], pad: NOPAD, clip: false });
    const [pA, pB, pS] = XS.map(mkPlot);
    const cA = pA.curve((x) => MIX.wave(0, SPAN * x), { tone: "purple", w: 5 });
    const cB = pB.curve((x) => MIX.wave(1, SPAN * x), { tone: "purple", w: 5 });
    const cS = pS.curve((x) => MIX.at(SPAN * x), { tone: "blue", w: 6 });

    // a grey plus between the first two waves and a grey equals sign before the sum (SVG, not glyphs)
    const sym = A9.svg(pic, PIC.w, PIC.h);
    const stroke = { "stroke-width": 5, "stroke-linecap": "round", fill: "none", style: { stroke: "var(--text-dim)" } };
    const mid = [(XS[0] + W + XS[1]) / 2, (XS[1] + W + XS[2]) / 2]; // the middle of each gap
    const plus = sym.appendChild(
      V.s("path", { d: `M${f1(mid[0] - 8)} 70H${f1(mid[0] + 8)}M${f1(mid[0])} 62V78`, ...stroke }),
    );
    const equals = sym.appendChild(
      V.s("path", { d: `M${f1(mid[1] - 8)} 63H${f1(mid[1] + 8)}M${f1(mid[1] - 8)} 77H${f1(mid[1] + 8)}`, ...stroke }),
    );
    const T = { a: [0, 0.7], b: [0.3, 1.0], sym: [1.0, 1.3], sum: [1.3, 2.3] };

    return (q) => {
      cA.set({ k: ramp(q, ...T.a, lin) });
      cB.set({ k: ramp(q, ...T.b, lin) });
      const ks = ramp(q, ...T.sym, lin);
      popIn(plus, ks);
      popIn(equals, ks);
      cS.set({ k: ramp(q, ...T.sum, lin) });
    };
  }

  // ---------- row 2: the spinning-arrow test, one bar out ----------
  function testRow(pic) {
    const ch = A9.chain(1);
    A9.same("recap row 2: eight arrows in the chain", ch.arrows.length, 8);
    A9.closeAll("recap row 2: the chain ends at (4, 0)", ch.sum, [4, 0], 1e-9);
    A9.close("recap row 2: the total is 4 long", ch.len, 4, 1e-9);

    const Pl = A9.plot(pic, {
      x: 0,
      y: 0,
      w: PIC.w,
      h: PIC.h,
      frame: false,
      equal: true,
      view: [-0.2, 6.2, -1.2, 1.2], // room on the right for the purple arrow and the bar
      pad: NOPAD,
      clip: false,
    });
    const arrows = ch.arrows.map(() => Pl.vec({ tone: "blue", w: 5, head: 14 }));
    const total = Pl.vec({ tone: "orange", w: 7, head: 20 });

    const svg = A9.svg(pic, PIC.w, PIC.h);
    const probe = svg.appendChild(L5.arrow(246, 70, 286, 70, "purple", 1, { w: 5, head: 14 }));
    const BAR = { x: 296, w: 36, base: 130, h: 90, lip: 4 };
    const oc = A9.tone("orange");
    const lipRect = svg.appendChild(V.s("rect", { x: BAR.x, width: BAR.w, rx: 10, style: { fill: oc.lip } }));
    const bar = svg.appendChild(
      V.s("rect", { x: BAR.x, width: BAR.w, rx: 10, "stroke-width": 3, style: { fill: oc.c, stroke: oc.lip } }),
    );
    const T = { arrow0: 0, step: 0.12, grow: 0.26, total: [1.3, 1.9], probe: [2.1, 2.4], bar: [2.4, 3.0] };

    return (q) => {
      arrows.forEach((a, i) => {
        const seg = ch.arrows[i];
        a.set({
          x1: seg.from[0],
          y1: seg.from[1],
          x2: seg.to[0],
          y2: seg.to[1],
          k: E.out(A9.seq(q, T.arrow0, T.step, T.grow, i)),
        });
      });
      total.set({ x1: 0, y1: 0, x2: ch.sum[0], y2: ch.sum[1], k: ramp(q, ...T.total, E.inOut) });
      L5.drawOn(probe, ramp(q, ...T.probe, lin));
      const kb = ramp(q, ...T.bar);
      const hh = BAR.h * kb;
      [bar, lipRect].forEach((r, j) => {
        const lip = j === 0 ? BAR.lip : 0;
        r.setAttribute("y", f1(BAR.base - hh + lip));
        r.setAttribute("height", f1(Math.max(0, hh)));
        r.setAttribute("rx", f1(Math.min(10, hh / 2)));
        V.show(r, +(hh > 1));
      });
    };
  }

  // ---------- row 3: the FFT does 12 butterflies where the direct way needs 64 products ----------
  function workRow(pic) {
    A9.same("recap counts", [A9.W8.products, A9.FFT.butterflies], [64, 12]);
    const PX = 3.4; // px per unit of work
    const [wRed, wGreen] = [A9.W8.products * PX, A9.FFT.butterflies * PX];
    const [X, H] = [8, 40];
    const bar = (tone, y, text) => {
      const label = V.h("span", {
        text,
        style: {
          position: "absolute",
          right: "14px",
          top: "0",
          bottom: "0",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          fontSize: "28px",
        },
      });
      const el = V.h(
        "div",
        {
          class: `v-gene solid c-${tone}`,
          style: { ...box(X, y, 10, H), borderRadius: "12px", boxShadow: "0 4px 0 var(--c-lip)" },
        },
        label,
      );
      pic.append(el);
      return { el, label };
    };
    const red = bar("red", 24, `${A9.W8.products} products`);
    const green = bar("green", 80, "");
    // the green bar is a nub: its number sits beside it, in green text on the white card
    const greenText = V.h("div", {
      text: `${A9.FFT.butterflies} butterflies`,
      style: {
        position: "absolute",
        left: `${f1(X + wGreen + 14)}px`,
        top: "80px",
        height: `${H}px`,
        display: "flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        fontSize: "28px",
        fontWeight: "900",
        color: "var(--teal-ink)",
      },
    });
    pic.append(greenText);
    const svg = A9.svg(pic, PIC.w, PIC.h);
    const tick = svg.appendChild(A9.tick(300, 100, 40, "green", { w: 7 }));
    const T = { red: [0, 0.8], redText: [0.6, 0.9], green: [0.9, 1.4], tick: [1.6, 2.0] };

    return (q) => {
      const kr = ramp(q, ...T.red);
      red.el.style.width = `${f1(Math.max(6, wRed * kr))}px`;
      V.show(red.el, kr > 0.001 ? 1 : 0);
      V.show(red.label, ramp(q, ...T.redText, lin));
      const kg = ramp(q, ...T.green);
      green.el.style.width = `${f1(Math.max(6, wGreen * kg))}px`;
      V.show(green.el, kg > 0.001 ? 1 : 0);
      const kt = ramp(q, T.green[1] - 0.2, T.green[1] + 0.2, lin);
      V.place(greenText, { x: (1 - E.out(kt)) * -10, s: 0.9 + 0.1 * E.pop(kt), o: Math.min(1, kt * 4) });
      A9.stamp(tick, ramp(q, ...T.tick, lin));
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
      const mascot = V.mascot("byte", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["blue", "Any signal is a\nsum of sine waves", sumRow],
        ["orange", "The DFT tests every\nfrequency: bars out", testRow],
        ["green", "The FFT halves the\nwork again and again", workRow],
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

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 9.W",
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
