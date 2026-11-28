/* Lecture 14 (ds-14) · scene 11-recap: three rows, each a small pictogram that plays once and holds, and one bold line (bare).
   Story (local seconds): 0.1 title and Pebble; rows slide in at 0.8 / 1.9 / 3.0, each pictogram runs on its row's own clock
   (q = t − row time) and is finished by q 2.4; 4.2 the call to action "Next: Workshop 14.W". Rows are done at about 3.2, 4.3
   and 5.4; after that only Pebble's bob moves.
   Row 1 (purple): a cube, a row, a grid and a pile of grids pop in left to right (q 0.6 / 1.0 / 1.4 / 1.8): order 0 to 3.
   Row 2 (blue): a faint 4 x 4 grid with three blue cells (q 0.6); q 1.1-1.5 a grey arrow draws; q 1.5-2.1 three blue chips pop
          into a short list (only the non-zeros are kept).
   Row 3 (green): three short arrays (blue V, orange COL_INDEX, purple ROW_INDEX) and a small grid; q 1.0 a green frame on one
          row of the grid (CSR), q 1.8 a green frame on one column (CSC); both stay. */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const L5 = V.l5;
  const { ramp, ease: E } = V;
  const T = D14.tone;
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
  const CTA_AT = 4.2;
  const rect = (svg, x, y, w, h, tone, solid = true) => {
    const c = T(tone);
    return svg.appendChild(
      V.s("rect", {
        x: f1(x),
        y: f1(y),
        width: f1(w),
        height: f1(h),
        rx: 4,
        fill: solid ? c.c : tone === "grey" ? "var(--panel)" : c.dim,
        stroke: solid ? c.lip : c.edge,
        "stroke-width": 2.5,
      }),
    );
  };
  const popIn = (el, k) => V.place(el, { s: 0.6 + 0.4 * E.pop(k), o: Math.min(1, k * 3) });
  const cells = (svg, x, y, m, n, cs, gap, toneOf) => {
    const g = V.s("g", {});
    svg.appendChild(g);
    for (let r = 0; r < m; r++)
      for (let c = 0; c < n; c++) {
        const tone = toneOf(r, c);
        rect(g, x + c * (cs + gap), y + r * (cs + gap), cs, cs, tone, tone !== "grey");
      }
    return g;
  };

  // ---------- row 1: order grows ----------
  function orderRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const blue = () => "blue";
    const parts = [
      cells(svg, 14, 62, 1, 1, 24, 3, blue),
      cells(svg, 56, 62, 1, 4, 20, 3, blue),
      cells(svg, 156, 38, 3, 4, 20, 3, blue),
    ];
    const pile = V.s("g", {});
    svg.appendChild(pile);
    [
      [24, "green"],
      [12, "purple"],
    ].forEach(([d, tone]) => rect(pile, 258 + d, 44 - d, 66, 50, tone, false));
    cells(pile, 258, 44, 3, 4, 14, 3, blue);
    parts.push(pile);
    return (q) => parts.forEach((p, i) => popIn(p, ramp(q, 0.6 + 0.4 * i, 1.0 + 0.4 * i, E.lin)));
  }

  // ---------- row 2: keep only the non-zeros ----------
  function sparseRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const NZ = ["0,1", "2,3", "3,0"];
    const grid = cells(svg, 16, 18, 4, 4, 22, 4, (r, c) => (NZ.includes(`${r},${c}`) ? "blue" : "grey"));
    const arrow = svg.appendChild(L5.arrow(132, 70, 196, 70, "grey", 1, { w: 6, head: 16 }));
    const list = NZ.map((_, i) => rect(svg, 212 + 40 * i, 55, 32, 30, "blue"));
    return (q) => {
      popIn(grid, ramp(q, 0.4, 0.8, E.lin));
      L5.drawOn(arrow, ramp(q, 1.1, 1.5));
      list.forEach((el, i) => popIn(el, ramp(q, 1.5 + 0.2 * i, 1.8 + 0.2 * i, E.lin)));
    };
  }

  // ---------- row 3: CSR reads rows, CSC reads columns ----------
  function formatRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const arrays = [
      ["blue", 4, 22],
      ["orange", 4, 58],
      ["purple", 5, 94],
    ].map(([tone, n, y]) => {
      const g = V.s("g", {});
      svg.appendChild(g);
      for (let i = 0; i < n; i++) rect(g, 14 + 30 * i, y, 24, 24, tone, tone !== "orange");
      return g;
    });
    const GX = 210;
    const GY = 14;
    const NZ = ["0,0", "1,1", "2,2", "3,1"];
    const grid = cells(svg, GX, GY, 4, 4, 24, 4, (r, c) => (NZ.includes(`${r},${c}`) ? "blue" : "grey"));
    const G = T("green");
    const frame = (x, y, w, h) =>
      svg.appendChild(V.s("rect", { x, y, width: w, height: h, rx: 7, fill: "none", stroke: G.c, "stroke-width": 5 }));
    const rowF = frame(GX - 5, GY + 28 - 5, 4 * 28 + 6, 34);
    const colF = frame(GX + 2 * 28 - 5, GY - 5, 34, 4 * 28 + 6);
    return (q) => {
      arrays.forEach((g, i) => popIn(g, ramp(q, 0.4 + 0.15 * i, 0.8 + 0.15 * i, E.lin)));
      popIn(grid, ramp(q, 0.5, 0.9, E.lin));
      popIn(rowF, ramp(q, 1.0, 1.3, E.lin));
      popIn(colF, ramp(q, 1.8, 2.1, E.lin));
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
        ["purple", "Order = how many indices\nfind one value", orderRow],
        ["blue", "Sparse: mostly zeros,\nso store only the non-zeros", sparseRow],
        ["green", "CSR for rows,\nCSC for columns", formatRow],
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
            fontSize: "34px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 14.W",
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
