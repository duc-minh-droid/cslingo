/* Lecture 6 · Genetic programming, scene 09-five-choices.
   Part 1: five numbered sticker cards pop in down the stage, each with a drawn pictogram (terminals, functions, fitness bars,
   population dots with M = 4, a finish flag with "error < 0.1"). They then shrink into a side strip.
   Part 2: "the sets must be rich enough". Palette on top (terminals X, 1 and functions + and -), plot below with the target
   parabola. Only straight lines a*X + b can be built, none fits (red cross). A purple x tile joins the function set and the
   curve bends onto x² + x + 1 (green tick). Every curve and the formula come from the real algorithm (L.fn, L.formula). */
(function () {
  const V = window.VID;
  const L = V.l6;
  const { h, s, place, ramp, ease, lerp, flash } = V;
  const pop = (t, a, d = 0.5) => ease.pop(ramp(t, a, a + d, ease.lin));
  const fade = (t, a, d = 0.25) => ramp(t, a, a + d, ease.lin);
  const pillW = (text) => Math.max(44, text.length * 16.8 + 26);

  // ---------- data, checked against the real algorithm ----------
  const T = L.TARGET;
  const LINES = [
    [1, 1],
    [0, 2],
    [2, 1],
    [-1, 2],
  ]; // a * X + b
  const lineFn =
    ([a, b]) =>
    (x) =>
      a * x + b;
  const FORMULA = L.formula(L.TARGET_TREE);
  if (FORMULA !== "x² + x + 1") throw new Error("scene 09: target formula changed");
  LINES.forEach((ln) => {
    if (L.area(lineFn(ln), T, -1, 1) < 0.5) throw new Error("scene 09: a straight line fits the parabola too well");
  });

  // ---------- timeline (local seconds) ----------
  const CARD_AT = (i) => 0.4 + i * 0.75;
  const ICON_OUT = 6.4; // pictograms fade, cards shrink to a strip
  const SHRINK = [6.5, 7.2];
  const PLOT_AT = 7.4;
  const TARGET_AT = [7.6, 8.1];
  const LINE_AT = (i) => 8.1 + i * 0.3;
  const CROSS_AT = 9.4;
  const ADD_AT = 10.4; // the x tile joins the function set
  const MORPH = [10.7, 11.3];
  const TICK_AT = 11.3;

  // ---------- layout (stage px, 936 x 640) ----------
  const ROW = (i) => 64 + i * 124; // centre y of a card in part 1
  const TONES = ["blue", "purple", "orange", "grey", "green"];
  const NAMES = ["Terminals", "Functions", "Fitness", "Parameters", "Termination"];
  const ICON_X = 610;
  const PLOT = { x: 276, y: 96, w: 648, h: 530 };
  const YMAX = 3.9;

  function makeCard(i) {
    const badge = h("div", {
      text: String(i + 1),
      style: {
        width: "44px",
        height: "44px",
        flex: "none",
        boxSizing: "border-box",
        borderRadius: "50%",
        border: "3px solid var(--c-lip)",
        background: "var(--c)",
        color: "var(--c-on)",
        font: "900 26px/38px var(--sans)",
        textAlign: "center",
      },
    });
    const label = h("div", {
      text: NAMES[i],
      style: { fontWeight: "900", color: "var(--c-ink)", whiteSpace: "nowrap" },
    });
    return h(
      "div",
      {
        class: `v-card c-${TONES[i]}`,
        style: { display: "flex", alignItems: "center", gap: "16px", paddingLeft: "14px", overflow: "visible" },
      },
      badge,
      label,
    );
  }

  const ink = (tone) => ({ fill: `var(--${tone})`, stroke: `var(--${tone}-lip)`, "stroke-width": 3 });

  V.scene({
    kicker: "BEFORE YOU RUN",
    title: ["Five choices", "before you run"],
    dur: 13,
    caps: [
      [0.4, 6.9, "Five things to choose before a run."],
      [7.5, 10.3, "Only + and −? Straight lines only."],
      [10.4, 13, "Add × and the curve fits."],
    ],
    build(stage) {
      // 1. cards (HTML, lowest), 2. plot, 3. the shared tile layer and the overlay above them
      const cards = NAMES.map((_, i) => stage.appendChild(makeCard(i)));
      const pl = L.plot(stage, { ...PLOT, xmin: -1, xmax: 1, ymin: 0, ymax: YMAX });
      L.layer(stage);
      const ov = s("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
      Object.assign(ov.style, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
      stage.append(ov);

      // ---- part 1 pictograms ----
      const icon = (i, ...kids) => ov.appendChild(s("g", {}, ...kids));
      const tiles1 = [
        [L.tile(stage, "X", { size: 64 }), ICON_X - 45, ROW(0), 0],
        [L.tile(stage, "1", { size: 64 }), ICON_X + 45, ROW(0), 0],
        ...["+", "-", "*", "/"].map((op, k) => [L.tile(stage, op, { size: 64 }), ICON_X + (k - 1.5) * 78, ROW(1), 1]),
      ];
      const heights = [52, 30, 60, 22, 42, 34];
      const bars = icon(
        2,
        s("path", {
          d: `M${ICON_X - 118} ${ROW(2) + 36}H${ICON_X + 118}`,
          fill: "none",
          stroke: "var(--line-2)",
          "stroke-width": 5,
          "stroke-linecap": "round",
        }),
        ...heights.map((ht, k) =>
          s("rect", { x: ICON_X - 101 + k * 36, y: ROW(2) + 36 - ht, width: 22, height: ht, rx: 6, ...ink("rose") }),
        ),
      );
      const dots = icon(
        3,
        ...[0, 1, 2, 3].map((k) => s("circle", { cx: 440 + k * 56, cy: ROW(3), r: 21, ...ink("blue") })),
      );
      const pillM = L.pill(stage, "M = 4", { tone: "grey", look: "soft" });
      const flag = icon(
        4,
        s("path", {
          d: `M470 ${ROW(4) - 40}V${ROW(4) + 40}`,
          fill: "none",
          stroke: "var(--text-dim)",
          "stroke-width": 7,
          "stroke-linecap": "round",
        }),
        s("path", {
          d: `M473 ${ROW(4) - 40}L545 ${ROW(4) - 20}L473 ${ROW(4)}Z`,
          "stroke-linejoin": "round",
          ...ink("teal"),
        }),
      );
      const pillE = L.pill(stage, "error < 0.1", { tone: "green", look: "soft" });

      // ---- part 2 palette ----
      const PY = 44;
      const pal = [
        { o: L.pill(stage, "T", { tone: "blue", look: "soft" }), x: 296, label: "T", tone: "blue" },
        { o: L.tile(stage, "X", { size: 56 }), x: 364 },
        { o: L.tile(stage, "1", { size: 56 }), x: 430 },
        { o: L.pill(stage, "F", { tone: "purple", look: "soft" }), x: 528, label: "F", tone: "purple" },
        { o: L.tile(stage, "+", { size: 56 }), x: 596 },
        { o: L.tile(stage, "-", { size: 56 }), x: 662 },
      ];
      const times = L.tile(stage, "*", { size: 56 });
      const divider = ov.appendChild(
        s("path", {
          d: `M478 18V70`,
          fill: "none",
          stroke: "var(--line-2)",
          "stroke-width": 4,
          "stroke-linecap": "round",
        }),
      );

      // ---- plot content ----
      const target = pl.curve(T, "green", 1, { w: 7, dash: true });
      const lines = LINES.map((ln) => pl.curve(lineFn(ln), "blue", 1, { w: 5 }));
      const cand = pl.curve((x) => x + 1, "blue", 1, { w: 9 });
      const topC = pl.toPx(-0.2, 3.55);
      const legY = pl.toPx(0, 0.4)[1];
      const legend = ov.appendChild(
        s(
          "g",
          {},
          s("path", {
            d: `M${pl.toPx(0.1, 0)[0]} ${legY}h46`,
            fill: "none",
            stroke: "var(--teal)",
            "stroke-width": 7,
            "stroke-dasharray": "16 12",
          }),
          s(
            "text",
            { x: pl.toPx(0.1, 0)[0] + 62, y: legY + 10, style: "font-size:28px;font-weight:800;fill:var(--teal-ink)" },
            "target",
          ),
        ),
      );
      const crossI = L.cross(48, "red");
      const tickI = L.tick(48, "green");
      stage.append(crossI, tickI);
      const pillBad = L.pill(stage, "only straight lines", { tone: "red" });
      const pillOk = L.pill(stage, FORMULA, { tone: "green" });
      const pillLine = L.pill(stage, "a · x + b", { tone: "red", look: "soft" });
      const pillCurve = L.pill(stage, "× makes a curve", { tone: "green", look: "soft" });
      const wBad = pillW("only straight lines");
      const wOk = pillW(FORMULA);

      return (t) => {
        // ---------- cards ----------
        const p = ramp(t, SHRINK[0], SHRINK[1], ease.inOut);
        const iconO = 1 - fade(t, ICON_OUT, 0.3);
        cards.forEach((c, i) => {
          const k = pop(t, CARD_AT(i));
          const boost = i === 1 ? 0.06 * flash(t, ADD_AT, ADD_AT + 0.5) : 0;
          Object.assign(c.style, {
            left: `${lerp(38, 12, p)}px`,
            top: `${lerp(ROW(i) - 52, 100 + i * 104, p)}px`,
            width: `${lerp(860, 250, p)}px`,
            height: `${lerp(104, 84, p)}px`,
          });
          c.lastChild.style.fontSize = `${lerp(36, 28, p)}px`;
          place(c, { s: k * (1 + boost), o: Math.min(1, k * 4) });
        });
        const iconK = (i) => pop(t, CARD_AT(i) + 0.12);
        tiles1.forEach(([tile, x, y, row]) => {
          const k = iconK(row);
          tile.apply({ x, y, s: k, o: Math.min(1, k * 4) * iconO });
        });
        const gK = (g, i) => {
          const k = iconK(i);
          place(g, { s: k, o: Math.min(1, k * 4) * iconO });
          return k;
        };
        gK(bars, 2);
        gK(dots, 3);
        gK(flag, 4);
        const kM = iconK(3);
        pillM.apply({
          text: "M = 4",
          x: 790,
          y: ROW(3),
          s: kM,
          o: Math.min(1, kM * 4) * iconO,
          tone: "grey",
          look: "soft",
        });
        const kE = iconK(4);
        pillE.apply({
          text: "error < 0.1",
          x: 740,
          y: ROW(4),
          s: kE,
          o: Math.min(1, kE * 4) * iconO,
          tone: "green",
          look: "soft",
        });

        // ---------- part 2: palette ----------
        const palK = (j) => pop(t, PLOT_AT - 0.1 + j * 0.1);
        pal.forEach((it, j) => {
          const k = palK(j);
          const st = { x: it.x, y: PY, s: k, o: Math.min(1, k * 4) };
          if (it.label) it.o.apply({ ...st, text: it.label, tone: it.tone, look: "soft" });
          else it.o.apply(st);
        });
        const kx = palK(6);
        const added = t >= ADD_AT;
        const kAdd = pop(t, ADD_AT, 0.45);
        times.apply({
          x: 728,
          y: PY,
          s: added ? kAdd : kx,
          o: added ? 1 : Math.min(1, kx * 4),
          tone: added ? "purple" : "grey",
          look: added ? "solid" : "ghost",
          pulse: added ? flash(t, ADD_AT, ADD_AT + 0.4) : 0,
          halo: added ? flash(t, ADD_AT, ADD_AT + 0.7) : 0,
        });
        place(divider, { o: palK(3) < 0.01 ? 0 : Math.min(1, palK(2)) });

        // ---------- part 2: plot ----------
        const pk = fade(t, PLOT_AT, 0.35);
        place(pl.svg, { y: (1 - ease.out(pk)) * 14, o: pk });
        target.set({ k: ramp(t, TARGET_AT[0], TARGET_AT[1], ease.inOut), o: 1 });
        place(legend, { o: fade(t, TARGET_AT[1] - 0.2) });
        const linesO = 1 - 0.75 * fade(t, ADD_AT, 0.3);
        lines.forEach((c, i) => c.set({ k: ramp(t, LINE_AT(i), LINE_AT(i) + 0.35), o: linesO }));

        const badO = fade(t, CROSS_AT, 0.25) * (1 - fade(t, ADD_AT, 0.3));
        const kBad = pop(t, CROSS_AT, 0.45);
        const gxBad = topC[0] + 30;
        crossI.style.left = `${gxBad - wBad / 2 - 60}px`;
        crossI.style.top = `${topC[1] - 24}px`;
        place(crossI, { s: kBad, o: badO });
        pillBad.apply({ text: "only straight lines", x: gxBad, y: topC[1], s: kBad, o: badO, tone: "red" });

        const kk = ease.back(ramp(t, MORPH[0], MORPH[1], ease.lin));
        const done = t >= MORPH[1];
        cand.set({
          fn: (x) => lerp(x + 1, T(x), kk),
          k: t >= MORPH[0] - 0.05 ? 1 : 0,
          o: fade(t, MORPH[0] - 0.05, 0.1),
          tone: done ? "green" : "blue",
        });
        pillLine.apply({ text: "a · x + b", x: gxBad, y: topC[1] + 56, s: kBad, o: badO, tone: "red", look: "soft" });
        const kOk = pop(t, TICK_AT, 0.45);
        const gxOk = topC[0] + 30 + (wBad - wOk) / 2;
        tickI.style.left = `${gxOk - wOk / 2 - 60}px`;
        tickI.style.top = `${topC[1] - 24}px`;
        place(tickI, { s: kOk, o: Math.min(1, kOk * 4) });
        pillOk.apply({ text: FORMULA, x: gxOk, y: topC[1], s: kOk, o: Math.min(1, kOk * 4), tone: "green" });
        pillCurve.apply({
          text: "× makes a curve",
          x: gxOk,
          y: topC[1] + 56,
          s: kOk,
          o: Math.min(1, kOk * 4),
          tone: "green",
          look: "soft",
        });
      };
    },
  });
})();
