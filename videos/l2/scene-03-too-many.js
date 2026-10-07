/* Lecture 2 · Why EAs, scene 03-too-many: every extra item doubles the solutions; a real design problem is astronomically big. */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const { ramp, flash, ease: E } = V;
  const D = L2.designs();
  const YEARS_TEXT = `≈ ${Math.round(D.years / 1e8) * 100} million years`;

  // ---------- phase A: the doubling grid ----------
  const CELL = 40;
  const PITCH = 46;
  const GX = 60;
  const STEPS = [1.6, 2.8, 4.0]; // the copy slides in below, right, below
  const SLIDE = 0.4;
  const SHRINK = [5.0, 5.7];
  const TOP_FULL = 220 - (8 * PITCH - 6) / 2; // top of the finished 8 x 8 grid
  const CELLS = Array.from({ length: 64 }, (_, i) => {
    // every cell: row, col, which step brings it in (0 = the first 8) and its order for the first pop
    const r = Math.floor(i / 8);
    const c = i % 8;
    const step = r >= 4 ? 3 : c >= 4 ? 2 : r >= 2 ? 1 : 0;
    return { r, c, step };
  });
  CELLS.filter((q) => q.step === 0).forEach((q, k) => (q.order = k));

  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const pw = (n) => L2.pow2(n);

  V.scene({
    kicker: "THE CATCH",
    title: ["Every extra item", "doubles the work"],
    dur: 12,
    caps: [
      [0.3, 2.4, "3 items make 8 possible solutions."],
      [2.6, 5.4, "Each extra item doubles the count."],
      [6.3, 8.5, "A real water network: 21 pipes, 16 sizes each."],
      [8.7, 11.5, "Trying every design takes 600 million years."],
    ],
    build(stage) {
      // ----- phase A -----
      const A = V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "936px", height: "640px" } });
      stage.append(A);
      const grid = V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "0", height: "0" } });
      grid.style.transformOrigin = "0 0";
      A.append(grid);
      const cellEls = CELLS.map(() => {
        const over = V.h("div", {
          class: "v-card c-orange",
          style: { left: "-3px", top: "-3px", width: `${CELL}px`, height: `${CELL}px`, borderRadius: "11px", boxShadow: "0 3px 0 var(--c-edge)" },
        });
        const cell = V.h(
          "div",
          {
            class: "v-card c-blue",
            style: { left: "0", top: "0", width: `${CELL}px`, height: `${CELL}px`, borderRadius: "11px", boxShadow: "0 3px 0 var(--c-edge)" },
          },
          over,
        );
        grid.append(cell);
        return { cell, over };
      });
      const times = L2.tag(A, { tone: "purple", solid: true, anchor: "c", size: 32, kids: ["× 2"] });
      const items = L2.tag(A, { text: "3 items", tone: "blue", x: 500, y: 90 });
      const num = V.h("div", {
        class: "v-text c-blue",
        style: { fontWeight: "900", lineHeight: "1", color: "var(--c-ink)", transformOrigin: "0 50%" },
      });
      A.append(num);
      const billion = L2.tag(A, { text: "≈ 1 billion", tone: "red", anchor: "l", x: 690, y: 118 });

      // ----- phase B -----
      const B = V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "936px", height: "640px" } });
      stage.append(B);
      const nyt = L2.tag(B, { text: "New York Tunnels", tone: "blue", x: 12, y: 0 });
      const svg = V.s("svg", { width: "936", height: "640", viewBox: "0 0 936 640", style: { position: "absolute", left: "0", top: "0" } });
      B.append(svg);
      const pipes = Array.from({ length: 21 }, (_, i) => {
        const c = V.s("circle", {
          cx: String(48 + 40 * i),
          cy: "150",
          r: "10",
          fill: "var(--blue-dim)",
          stroke: "var(--blue-edge)",
          "stroke-width": "3",
        });
        svg.append(c);
        return c;
      });
      const nPipes = L2.tag(B, { text: "21 pipes", tone: "grey", x: 48 - 20, y: 214 });
      const nSizes = L2.tag(B, { text: "16 sizes each", tone: "grey", x: 868, y: 214, anchor: "tr" });
      const rule = L2.tag(B, { text: "16 × 16 × … × 16 (21 times)", tone: "grey", x: 468, y: 280, anchor: "tc" });
      const big = L2.tag(B, {
        kids: [L2.sci(D.mant.toFixed(1), D.exp), " designs"],
        tone: "red",
        solid: true,
        size: 52,
        x: 468,
        y: 375,
        anchor: "c",
        pad: "6px 28px 8px",
      });
      const clock = L2.clock(B, { x: 110, y: 540, r: 64 });
      const rate = L2.tag(B, { kids: [L2.sup("10", 9), " designs a second"], tone: "grey", x: 210, y: 470 });
      const years = V.h("div", {
        class: "v-text c-red",
        text: YEARS_TEXT,
        style: { left: "210px", top: "530px", fontSize: "52px", fontWeight: "900", lineHeight: "1.2", color: "var(--c-ink)", transformOrigin: "0 50%" },
      });
      B.append(years);

      return (t) => {
        // ===== phase A =====
        V.show(A, 1 - ramp(t, 5.9, 6.3, E.inOut));
        const done = STEPS.map((s) => ramp(t, s, s + SLIDE)); // how far each copy has slid in
        const rows = 2 + 2 * done[0] + 4 * done[2];
        const cols = 4 + 4 * done[1];
        const gridH = rows * PITCH - 6;
        const top = 220 - gridH / 2;
        // slow settle of the final layout when the grid shrinks
        const k = ramp(t, SHRINK[0], SHRINK[1], E.inOut);
        const s = 1 - 0.75 * k;
        grid.style.transform = k > 0 ? `translate(${(1 - k) * 0 + k * 45}px, ${k * (40 - 0.25 * TOP_FULL) + (k > 0 ? 0 : 0)}px) scale(${s})` : "";
        // positions use the real top while growing and the finished 8 x 8 top while shrinking
        const useTop = t < SHRINK[0] ? top : TOP_FULL;
        CELLS.forEach((q, i) => {
          const { cell, over } = cellEls[i];
          let x = GX + q.c * PITCH;
          let y = useTop + q.r * PITCH;
          let sc = 1;
          let o = 1;
          if (q.step === 0) {
            const p = ramp(t, 0.3 + 0.05 * q.order, 0.3 + 0.05 * q.order + 0.4, E.pop);
            sc = p;
            o = clamp01(p * 4);
          } else {
            const p = done[q.step - 1];
            const slide = (1 - p) * 110;
            if (q.step === 2) x += slide;
            else y += slide;
            o = clamp01(p * 3);
          }
          V.place(cell, { x, y, s: sc, o });
          const orange = q.step === 0 ? 0 : 1 - ramp(t, STEPS[q.step - 1] + SLIDE, STEPS[q.step - 1] + SLIDE + 0.2, E.lin);
          V.show(over, orange);
        });

        // the count and its tag, right column
        const stepNow = t < STEPS[0] + 0.5 ? 0 : t < STEPS[1] + 0.5 ? 1 : t < STEPS[2] + 0.5 ? 2 : 3;
        const born = stepNow === 0 ? 0.3 : STEPS[stepNow - 1] + 0.5;
        const pop = ramp(t, born, born + 0.4, E.pop);
        const shift = ramp(t, SHRINK[0], SHRINK[1], E.inOut);
        const counting = t >= 5.1;
        const value = counting ? Math.round(64 + (L2.BILLION - 64) * ramp(t, 5.1, 5.9, E.out)) : DOUBLE(stepNow);
        num.textContent = L2.fmt(value);
        num.setAttribute("class", `v-text ${counting ? "c-red" : "c-blue"}`);
        const fs = 120 - 56 * shift;
        num.style.fontSize = `${fs.toFixed(1)}px`;
        num.style.left = `${(500 - 310 * shift).toFixed(1)}px`;
        num.style.top = `${(150 - 62 * shift).toFixed(1)}px`;
        const numPop = counting ? 1 : 0.65 + 0.35 * pop;
        V.place(num, { s: numPop, o: ramp(t, born, born + 0.15, E.lin) });
        items.text(t >= SHRINK[0] ? "30 items" : `${3 + stepNow} items`);
        items.set({
          x: -310 * shift,
          y: -54 * shift,
          s: ramp(t, 0.3, 0.7, E.pop) * (t >= SHRINK[0] ? 1 : 0.85 + 0.15 * (stepNow === 0 ? 1 : ramp(t, born, born + 0.4, E.pop))),
          o: ramp(t, 0.3, 0.45),
        });
        billion.set({ s: ramp(t, 5.7, 6.0, E.pop), o: ramp(t, 5.7, 5.8) });

        // the "× 2" tag bobs at the seam of the copy that just arrived
        const sx = STEPS.findLastIndex((st) => t >= st);
        if (sx >= 0 && t < SHRINK[0] - 0.1) {
          const st = STEPS[sx];
          const gw = cols * PITCH - 6;
          const seam = sx === 1 ? { x: GX + 4 * PITCH - 3, y: top + (rows * PITCH - 6) / 2 } : { x: GX + gw / 2, y: top + (sx === 0 ? 2 : 4) * PITCH - 3 };
          times.set({
            x: seam.x,
            y: seam.y + 5 * Math.sin((t - st) * 9),
            s: ramp(t, st + 0.3, st + 0.7, E.pop) * (1 - ramp(t, st + 1.05, st + 1.2, E.lin)),
            o: ramp(t, st + 0.3, st + 0.4, E.lin) * (1 - ramp(t, st + 1.05, st + 1.2, E.lin)),
          });
        } else times.set({ o: 0 });

        // ===== phase B =====
        V.show(B, t >= 6.3 ? 1 : 0);
        nyt.set({ s: ramp(t, 6.3, 6.7, E.pop), o: ramp(t, 6.3, 6.45) });
        const tt = Math.min(Math.max(t, 6.8), 9.0);
        pipes.forEach((c, i) => {
          const idx = Math.floor(L2.hash(i, Math.floor(tt * 8)) * 16);
          const p = ramp(t, 6.45 + 0.02 * i, 6.8 + 0.02 * i, E.pop);
          c.setAttribute("r", String(4 + idx));
          V.place(c, { s: p * (1 + 0.12 * flash(t, 9.0 + 0.02 * i, 9.3 + 0.02 * i)), o: clamp01(p * 3) });
        });
        nPipes.set({ s: ramp(t, 6.8, 7.2, E.pop), o: ramp(t, 6.8, 6.95) });
        nSizes.set({ s: ramp(t, 6.95, 7.35, E.pop), o: ramp(t, 6.95, 7.1) });
        rule.set({ s: ramp(t, 7.8, 8.2, E.pop), o: ramp(t, 7.8, 7.95) });
        big.set({ s: ramp(t, 8.6, 9.1, E.pop), o: ramp(t, 8.6, 8.75) });
        clock.update({ angle: 720 * Math.max(0, t - 9.2), o: ramp(t, 9.2, 9.4), s: 0.7 + 0.3 * ramp(t, 9.2, 9.6, E.pop), tone: "red" });
        rate.set({ s: ramp(t, 9.5, 9.9, E.pop), o: ramp(t, 9.5, 9.65) });
        V.place(years, { s: 0.7 + 0.3 * ramp(t, 10.1, 10.6, E.pop), o: ramp(t, 10.1, 10.25) });
      };
    },
  });

  function DOUBLE(step) {
    return pw(3 + step);
  }
})();
