/* Lecture 15 · Multi-objective particle swarm optimisation, scene 09-recap: three rows, each a small animated pictogram and
   one bold line (bare scene). Story (local seconds): 0.1 title and Sprout, rows slide in at 0.8 / 1.9 / 3.0, each pictogram
   starts 0.4 s after its row, 5.6-6.2 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop,
   no reset): all are done by 6.5 s, so for the last 2.5 seconds only Sprout's bob moves.
   Row 1 (green): the archive. Three green members on a front; a blue newcomer pops in, the member it dominates turns red
          with a cross and fades, the newcomer turns green.
   Row 2 (orange): pruning. Six green members; the two ends get orange rings, the most crowded one turns red, gets a cross
          and fades.
   Row 3 (blue): leaders. Four green members and a blue particle; an orange arrow grows from the particle to one member,
          which gets an orange ring. */
(function () {
  const V = window.VID;
  const L13 = V.l13;
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
  const CTA_AT = 5.6;
  const DONE = {};
  const T = (n) => L13.tone(n);
  const dotEl = (svg, r = 12) => svg.appendChild(V.s("circle", { r, "stroke-width": 3 }));
  const paint = (el, tone) => {
    el.style.fill = T(tone).c;
    el.style.stroke = T(tone).lip;
  };
  const axes = (svg) => {
    const a = svg.appendChild(V.s("path", { d: "M30 10 V128 H330", fill: "none", "stroke-width": 5 }));
    a.style.stroke = "var(--text-dim)";
  };

  const crossEl = (svg, [x, y]) => {
    const c = svg.appendChild(
      V.s("path", {
        d: `M${x - 16} ${y - 16} L${x + 16} ${y + 16} M${x + 16} ${y - 16} L${x - 16} ${y + 16}`,
        "stroke-width": 6,
        "stroke-linecap": "round",
      }),
    );
    c.style.stroke = T("red").ink;
    return c;
  };
  const ringEl = (svg, [x, y], tone) => {
    const r = svg.appendChild(V.s("circle", { cx: x, cy: y, r: 20, fill: "none", "stroke-width": 5 }));
    r.style.stroke = T(tone).c;
    return r;
  };
  const put = (el, [x, y]) => {
    el.setAttribute("cx", x);
    el.setAttribute("cy", y);
  };
  const fadeOut = (q, a, b) => (1 - 0.8 * ramp(q, a, b)).toFixed(3);

  // ---------- row 1: a newcomer that dominates a member joins, the member leaves ----------
  function archRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    axes(svg);
    const M = [
      [70, 36],
      [160, 84],
      [280, 120],
    ];
    const Y = [126, 110];
    const ms = M.map(() => dotEl(svg));
    ms.forEach((d, i) => put(d, M[i]));
    const y = dotEl(svg);
    put(y, Y);
    const cross = crossEl(svg, M[1]);
    DONE.row1 = 2.0;
    return (q) => {
      ms.forEach((d, i) => {
        paint(d, i === 1 && q >= 1.0 ? "red" : "green");
        d.setAttribute("opacity", i === 1 ? fadeOut(q, 1.4, 1.9) : "1");
      });
      cross.setAttribute("opacity", (ramp(q, 1.0, 1.3) * fadeOut(q, 1.4, 1.9)).toFixed(3));
      paint(y, q >= 1.6 ? "green" : "blue");
      y.setAttribute("opacity", ramp(q, 0.2, 0.5).toFixed(3));
    };
  }

  // ---------- row 2: prune the most crowded, keep the ends ----------
  function pruneRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    axes(svg);
    const M = [
      [56, 28],
      [96, 74],
      [120, 88],
      [146, 98],
      [226, 112],
      [310, 118],
    ];
    const ms = M.map(() => dotEl(svg, 11));
    ms.forEach((d, i) => put(d, M[i]));
    const rings = [ringEl(svg, M[0], "orange"), ringEl(svg, M[5], "orange")];
    const cross = crossEl(svg, M[2]);
    DONE.row2 = 1.9;
    return (q) => {
      rings.forEach((r) => r.setAttribute("opacity", ramp(q, 0.2, 0.6).toFixed(3)));
      ms.forEach((d, i) => {
        paint(d, i === 2 && q >= 0.9 ? "red" : "green");
        d.setAttribute("opacity", i === 2 ? fadeOut(q, 1.3, 1.8) : "1");
      });
      cross.setAttribute("opacity", (ramp(q, 0.9, 1.2) * fadeOut(q, 1.3, 1.8)).toFixed(3));
    };
  }

  // ---------- row 3: each particle picks a leader from the archive ----------
  function leadRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    axes(svg);
    const M = [
      [60, 30],
      [110, 82],
      [200, 108],
      [300, 118],
    ];
    const ms = M.map(() => dotEl(svg));
    ms.forEach((d, i) => {
      put(d, M[i]);
      paint(d, "green");
    });
    const P = [270, 36];
    const p = dotEl(svg);
    put(p, P);
    paint(p, "blue");
    const ring = ringEl(svg, M[1], "orange");
    const arrow = L13.arrow(svg, { tone: "orange", w: 6, head: 18 });
    DONE.row3 = 1.4;
    return (q) => {
      arrow.set({
        a: [P[0] - 18, P[1] + 8],
        b: [M[1][0] + 24, M[1][1] - 12],
        k: ramp(q, 0.2, 1.0, E.out),
        tone: "orange",
      });
      ring.setAttribute("opacity", ramp(q, 1.0, 1.4).toFixed(3));
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
        ["green", "The archive keeps\nthe non-dominated", archRow],
        ["orange", "Too full? Drop the\nmost crowded", pruneRow],
        ["blue", "Each particle picks\na leader from it", leadRow],
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
      L13.same(
        ends.every((e) => e <= 6.5),
        true,
        `recap: every pictogram is finished by 6.5 s (${ends.map((e) => e.toFixed(1)).join(", ")})`,
      );

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 15.W",
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
