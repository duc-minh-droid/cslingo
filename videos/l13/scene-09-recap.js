/* Lecture 13 · Multi-objective evolutionary algorithms, scene 09-recap: three rows, each a small animated pictogram and
   one bold line (bare scene). Story (local seconds): 0.1 title and Sprout, rows slide in at 0.8 / 1.9 / 3.0, each pictogram
   starts 0.4 s after its row, 5.6-6.2 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop,
   no reset): all are done by 6.5 s, so for the last 2.5 seconds only Sprout's bob moves.
   Row 1 (blue): dominance. Small axes (power up, cost across); a blue dot; its box (worse on both goals) grows to the lower
          right and the purple dot inside turns red with a cross.
   Row 2 (green): non-dominated sorting. Three fronts draw on one after another: green (rank 0), blue (rank 1), purple (rank 2).
   Row 3 (purple): NSGA-II. Three blue parents and three purple children slide together into one row, then the best three
          turn green and the other three turn red and fade. */
(function () {
  const V = window.VID;
  const L13 = V.l13;
  const L5 = V.l5;
  const { ramp, ease: E, lerp } = V;
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

  // ---------- row 1: one point dominates another ----------
  function domRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    axes(svg);
    const region = svg.appendChild(V.s("rect", { rx: 6, "stroke-width": 3, "stroke-dasharray": "8 6" }));
    region.style.fill = T("blue").dim;
    region.style.stroke = T("blue").c;
    const A = [110, 40];
    const B = [220, 80];
    const b = dotEl(svg);
    const a = dotEl(svg);
    const cross = svg.appendChild(
      V.s("path", {
        d: `M${B[0] - 18} ${B[1] - 18} L${B[0] + 18} ${B[1] + 18} M${B[0] + 18} ${B[1] - 18} L${B[0] - 18} ${B[1] + 18}`,
        "stroke-width": 6,
        "stroke-linecap": "round",
      }),
    );
    cross.style.stroke = T("red").ink;
    DONE.row1 = 1.8;
    return (q) => {
      const k = ramp(q, 0.2, 1.0, E.out);
      region.setAttribute("x", A[0]);
      region.setAttribute("y", A[1]);
      region.setAttribute("width", f1(Math.max(0, (320 - A[0]) * k)));
      region.setAttribute("height", f1(Math.max(0, (126 - A[1]) * k)));
      region.setAttribute("opacity", k > 0 ? "1" : "0");
      [a, b].forEach((el, i) => {
        const [x, y] = i ? B : A;
        el.setAttribute("cx", x);
        el.setAttribute("cy", y);
      });
      paint(a, "blue");
      const red = ramp(q, 1.2, 1.5);
      paint(b, red > 0.5 ? "red" : "purple");
      cross.setAttribute("opacity", red.toFixed(3));
    };
  }

  // ---------- row 2: peel the fronts ----------
  function peelRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    axes(svg);
    const FR = [
      [
        "green",
        [
          [50, 20],
          [80, 70],
          [140, 100],
          [230, 116],
        ],
      ],
      [
        "blue",
        [
          [100, 22],
          [150, 62],
          [260, 90],
        ],
      ],
      [
        "purple",
        [
          [180, 24],
          [230, 50],
          [310, 64],
        ],
      ],
    ];
    const parts = FR.map(([tone, P]) => {
      const line = svg.appendChild(V.s("polyline", { fill: "none", "stroke-width": 5, "stroke-linecap": "round" }));
      line.style.stroke = T(tone).c;
      const dots = P.map(() => dotEl(svg, 10));
      dots.forEach((d, i) => {
        d.setAttribute("cx", P[i][0]);
        d.setAttribute("cy", P[i][1]);
        paint(d, "grey");
      });
      return { tone, P, line, dots };
    });
    DONE.row2 = 2.3;
    return (q) => {
      parts.forEach(({ tone, P, line, dots }, r) => {
        const k = ramp(q, 0.2 + 0.7 * r, 0.8 + 0.7 * r);
        const n = Math.max(1, Math.ceil(k * (P.length - 1)));
        const f = k * (P.length - 1) - (n - 1);
        const pts = P.slice(0, n);
        const last = [lerp(P[n - 1][0], P[n][0], f), lerp(P[n - 1][1], P[n][1], f)];
        line.setAttribute("points", [...pts, last].map((p) => p.map(f1).join(",")).join(" "));
        line.setAttribute("opacity", k > 0 ? "1" : "0");
        dots.forEach((d) => paint(d, k > 0 ? tone : "grey"));
      });
    };
  }

  // ---------- row 3: merge, sort, keep the best N ----------
  function nsgaRow(pic) {
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const FROM = [40, 90, 140, 210, 260, 310].map((x) => [x, 40]);
    const RANK = [1, 4, 2, 0, 5, 3]; // place of each dot in the merged, sorted row
    const TO = RANK.map((p) => [45 + p * 50, 90]);
    const dots = FROM.map(() => dotEl(svg, 16));
    const ticks = [0, 1, 2].map((j) => svg.appendChild(L5.tick(45 + j * 50, 124, 26, "green")));
    DONE.row3 = 2.0;
    return (q) => {
      const m = ramp(q, 0.2, 1.0, E.inOut);
      const c = ramp(q, 1.2, 1.5);
      dots.forEach((d, i) => {
        d.setAttribute("cx", f1(lerp(FROM[i][0], TO[i][0], m)));
        d.setAttribute("cy", f1(lerp(FROM[i][1], TO[i][1], m)));
        const best = RANK[i] < 3;
        paint(d, c > 0.5 ? (best ? "green" : "red") : i < 3 ? "blue" : "purple");
        d.setAttribute("opacity", best ? "1" : (1 - 0.6 * ramp(q, 1.5, 2.0)).toFixed(3));
      });
      ticks.forEach((tk) => V.place(tk, { o: ramp(q, 1.4, 1.8) }));
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
        ["blue", "One point can\ndominate another", domRow],
        ["green", "Sort into fronts:\npeel the onion", peelRow],
        ["purple", "Merge, sort, keep\nthe best N", nsgaRow],
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
        text: "Next: Workshop 13.W",
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
