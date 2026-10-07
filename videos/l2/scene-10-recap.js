/* Lecture 2 video, scene 10 (recap): three sticker rows, each a small animated pictogram echoing the video, plus Sprout and a
   call-to-action tag. Story (local seconds): 0.8 / 2.0 / 3.2 the rows slide in.
   Row 1 (blue): the bits 1 1 0 pop in (1.2-1.9), an arrow draws to the tag "f = 5" (2.0-2.4), a star pops (2.5-3.0).
   Row 2 (red): a green x squared curve and a red 2 to the x curve draw left to right (2.4-3.6); the red one leaves the plot.
   Row 3 (green): the loop 1 Select -> 2 Vary -> 3 Update pops in (3.6-4.2); from 4.4 a ring steps through the tiles, forever.
   5.6 the "Beat the Lecture 2 boss quiz" tag pops in. Nothing is typed: f comes from L2.fitnessOf. */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const L5 = V.l5;
  const L6 = V.l6;
  const { ramp, flash, clamp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 190, tops: [250, 470, 690] };
  const APPEAR = [0.8, 2.0, 3.2];
  const PIC = { x: 24, y: 20, w: 360, h: 150 };

  // ---------- row 1: bits, then their fitness ----------
  function bitsToFitness(pic) {
    const sol = L2.fitnessOf(L2.BEST); // "110": f = 5
    const T = { bits: 1.2, arrow: [2.0, 2.4], star: 2.5 };
    const row = L5.chromosome(pic, { x: 0, y: 47, genes: [...sol.bits], size: 56, gap: 8, tone: "blue" });
    row.tiles.forEach((tile) => Object.assign(tile.style, { fontSize: "32px", borderRadius: "16px" }));
    const under = L5.svg(pic, PIC.w, PIC.h);
    const arrow = under.appendChild(L5.arrow(198, 75, 236, 75, "grey", 1, { w: 6, head: 16 }));
    const tag = L2.tag(pic, {
      text: `f = ${sol.f}`,
      tone: "green",
      solid: true,
      x: 296,
      y: 75,
      size: 28,
      anchor: "c",
      pad: "5px 14px 7px",
    });
    const over = L5.svg(pic, PIC.w, PIC.h);
    const star = over.appendChild(L2.star(340, 36, 40, "orange"));
    return (t) => {
      row.all((i) => {
        const p = ramp(t, T.bits + 0.25 * i, T.bits + 0.25 * i + 0.45, E.lin);
        const on = sol.take[i] === 1;
        return {
          y: -(1 - E.out(p)) * 16,
          s: E.pop(p),
          o: clamp(p * 4),
          solid: on,
          ghost: !on,
          tone: on ? "blue" : "grey",
        };
      });
      L5.drawOn(arrow, ramp(t, T.arrow[0], T.arrow[1], E.lin));
      const k = ramp(t, T.arrow[1] - 0.1, T.arrow[1] + 0.35, E.lin);
      tag.set({ s: 0.8 + 0.2 * E.pop(k), o: clamp(k * 4) });
      const sk = ramp(t, T.star, T.star + 0.5, E.lin);
      V.place(over.lastChild, { s: E.pop(sk), r: 40 * (1 - E.out(sk)), o: clamp(sk * 4) });
      void star;
    };
  }

  // ---------- row 2: x squared stays low, 2 to the x shoots out ----------
  function curves(pic) {
    const pl = L6.plot(pic, { x: 0, y: 0, w: 330, h: 150, xmin: 0, xmax: 10, ymin: 0, ymax: 300, frame: false });
    const cPoly = pl.curve((x) => x * x, "green", 1, { w: 8 });
    const cExp = pl.curve((x) => 2 ** x, "red", 1, { w: 8 });
    return (t) => {
      cPoly.set({ k: ramp(t, 2.4, 3.6, E.inOut) });
      cExp.set({ k: ramp(t, 2.7, 3.9, E.inOut) });
    };
  }

  // ---------- row 3: select, vary, update, repeat ----------
  function loopTiles(pic) {
    const SIZE = 56;
    const SPOT = [
      [20, 70],
      [137, 10],
      [254, 70],
    ];
    const TONES = ["orange", "purple", "green"];
    const ctr = (i) => [SPOT[i][0] + SIZE / 2, SPOT[i][1] + SIZE / 2];
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const link = (a, b, extra = {}) => {
      const [[ax, ay], [bx, by]] = [ctr(a), ctr(b)];
      const d = Math.hypot(bx - ax, by - ay);
      const [ux, uy] = [(bx - ax) / d, (by - ay) / d];
      const m = 38;
      return svg.appendChild(
        L5.arrow(ax + ux * m, ay + uy * m, bx - ux * m, by - uy * m, "grey", 1, { w: 6, head: 15, ...extra }),
      );
    };
    const arrows = [link(0, 1), link(1, 2)];
    const back = svg.appendChild(L5.arrow(268, 140, 70, 140, "grey", 1, { w: 6, head: 15, bow: 16 }));
    const ring = V.s("rect", {
      x: -SIZE / 2 - 8,
      y: -SIZE / 2 - 8,
      width: SIZE + 16,
      height: SIZE + 16,
      rx: 22,
      fill: "none",
      "stroke-width": 5,
    });
    const ringG = svg.appendChild(V.s("g", {}, ring));
    const tiles = TONES.map((tone, i) =>
      pic.appendChild(
        V.h("div", {
          class: `v-gene solid c-${tone}`,
          text: String(i + 1),
          style: { ...box(SPOT[i][0], SPOT[i][1], SIZE, SIZE), fontSize: "32px", borderRadius: "16px" },
        }),
      ),
    );
    return (t) => {
      const born = (i) => ramp(t, 3.6 + 0.1 * i, 3.6 + 0.1 * i + 0.4, E.lin);
      const cyc = t < 4.4 ? -1 : (t - 4.4) % 1.8;
      const lit = cyc < 0 ? -1 : Math.floor(cyc / 0.6);
      tiles.forEach((tile, i) => {
        const p = born(i);
        const bump = lit === i ? 0.14 * flash(cyc - i * 0.6, 0, 0.5) : 0;
        V.place(tile, { y: -(1 - E.out(p)) * 14, s: E.pop(p) * (1 + bump), o: clamp(p * 4) });
      });
      L5.drawOn(arrows[0], ramp(t, 3.9, 4.2, E.lin));
      L5.drawOn(arrows[1], ramp(t, 4.0, 4.3, E.lin));
      L5.drawOn(back, ramp(t, 4.1, 4.4, E.lin));
      const k = lit < 0 ? 0 : 1;
      const at = ctr(Math.max(lit, 0));
      ring.style.stroke = L5.tone(TONES[Math.max(lit, 0)]).lip;
      V.place(ringG, { x: at[0], y: at[1], s: 0.85 + 0.15 * E.pop(ramp(cyc, 0, 0.25, E.lin)), o: k });
    };
  }

  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const head = V.h("div", {
        class: "v-title-line",
        text: "Remember",
        style: { position: "absolute", left: "72px", top: "96px", fontSize: "76px" },
      });
      const mascot = V.mascot("sprout", { size: 150, mood: "love" });
      mascot.style.left = "858px";
      mascot.style.top = "70px";
      stage.append(head, mascot);

      const rows = [
        ["blue", "Fitness scores every solution", bitsToFitness],
        ["red", "Hard: exact methods blow up", curves],
        ["green", "EAs loop for good answers to hard problems", loopTiles],
      ].map(([tone, text, make]) => {
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, 0, CARD.w, CARD.h) });
        const i = stage.querySelectorAll(".v-card").length;
        card.style.top = `${CARD.tops[i]}px`;
        const pic = V.h("div", { style: box(PIC.x, PIC.y, PIC.w, PIC.h) });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "420px",
            top: "0",
            width: "480px",
            height: `${CARD.h - 6}px`,
            display: "flex",
            alignItems: "center",
            whiteSpace: "normal",
            lineHeight: "1.15",
            fontSize: "44px",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, update: make(pic) };
      });

      const cta = L2.tag(stage, {
        text: "Beat the Lecture 2 boss quiz",
        tone: "blue",
        solid: true,
        x: 540,
        y: 925,
        size: 34,
        anchor: "tc",
        pad: "10px 28px 12px",
      });

      return (t) => {
        V.place(head, { y: (1 - ramp(t, 0.1, 0.6)) * 20, o: ramp(t, 0.1, 0.6) });
        const m = ramp(t, 0.2, 0.9, E.pop);
        V.place(mascot, { s: 0.7 + 0.3 * m, o: ramp(t, 0.2, 0.5) });
        rows.forEach((r, i) => {
          const k = ramp(t, APPEAR[i], APPEAR[i] + 0.5);
          V.place(r.card, { y: (1 - k) * 36, o: k });
          r.update(t);
        });
        const c = ramp(t, 5.6, 6.1, E.pop);
        cta.set({ s: 0.85 + 0.15 * c, o: ramp(t, 5.6, 5.9) });
      };
    },
  });
})();
