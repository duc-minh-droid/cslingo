/* Algorithms Phase 3 · scene 02-region.
   A linear program in one picture: each rule is a line that cuts the plane in half (the NOT allowed half turns red), the legal plans
   are the overlap of the allowed halves (the green polygon), and the lesson's five test plans are plugged into both rules one by one.
   Every sum and verdict comes from A3.check (asserted below against the lesson), the polygon from A3.CORNERS. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const lin = E.lin;

  // ---------- the data, checked against the lesson (a3-lp) ----------
  const [RULE1, RULE2] = A3.LP.rules; // x + 2y <= 10 and 3x + y <= 15
  const TESTS = A3.PLANS.map((p) => ({ p, ...A3.check(p) }));
  const WANT = [
    [6, 8, true],
    [10, 15, true],
    [11, 18, false],
    [11, 8, false],
    [8, 19, false],
  ];
  A3.need(TESTS.length === WANT.length, "scene 02: expected five test plans");
  TESTS.forEach((c, i) =>
    A3.need(c.m === WANT[i][0] && c.r === WANT[i][1] && c.ok === WANT[i][2], `scene 02: plan ${i} differs`),
  );

  // ---------- timing ----------
  // where each plan's coordinate label sits (px from its dot): clear of the dots and rule lines, never on top of another label
  const LABEL_AT = [
    [64, 8],
    [-64, 26],
    [64, 8],
    [64, 8],
    [64, 8],
  ];
  const T0 = 5.6; // the first plan test starts here, one every STEP seconds
  const STEP = 1.1;
  const pop = (k) => 0.8 + 0.2 * E.pop(k); // pop-in scale for stickers and labels
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
  });

  V.scene({
    kicker: "THE PROBLEM",
    title: ["Rules cut the plane,", "what is left is legal"],
    dur: 12,
    caps: [
      [0.4, 3.2, "Each rule is a line that cuts the plane in half."],
      [3.4, 5.5, "Only the overlap passes both rules."],
      [5.7, 8.0, "Plug a plan into every rule."],
      [8.2, 10.8, "Pass them all and it is legal."],
    ],
    build(stage) {
      // ---------- the plot (scene 3 makes the identical call) ----------
      const P = A3.plot(stage, {
        x: 0,
        y: 0,
        w: 600,
        h: 604,
        view: [-0.6, 7.8, -0.6, 7.4],
        equal: true,
        axes: "origin",
        xticks: [0, 1, 2, 3, 4, 5, 6, 7],
        yticks: [0, 1, 2, 3, 4, 5, 6, 7],
        pad: { l: 60, r: 24, t: 24, b: 60 },
      });
      const h1 = P.half(RULE1.a, RULE1.b, RULE1.r);
      const h2 = P.half(RULE2.a, RULE2.b, RULE2.r);
      const poly = P.poly({ tone: "green" });
      const glow = P.poly({ tone: "green", w: 14, fill: false }); // a soft halo round the polygon edge for the final pulse
      const l1 = P.eq(RULE1.a, RULE1.b, RULE1.r);
      const l2 = P.eq(RULE2.a, RULE2.b, RULE2.r);
      const xName = P.text({ tone: "grey" });
      const yName = P.text({ tone: "grey" });
      const lab1 = P.text({ tone: "purple" });
      const lab2 = P.text({ tone: "purple", anchor: "start" });
      const legal = A3.tag(P.html, { x: P.px(2.1), y: P.py(0.75), anchor: "m", text: "legal region", tone: "green" });
      const dots = TESTS.map(() => P.dot({ tone: "blue", r: 14 }));
      const dotLabels = TESTS.map(() => P.text({ tone: "grey" }));

      // ---------- the checker: one card, two rows, a verdict ----------
      const card = V.h("div", { style: abs(624, 0, 312, 300) });
      card.append(V.h("div", { class: "v-card plain", style: abs(0, 0, 312, 300) }));
      stage.append(card);
      const planTag = A3.tag(card, { x: 156, y: 24, anchor: "c", tone: "blue" });
      const rows = [130, 220].map((y, i) => ({
        num: A3.badge(card, { x: 44, y, size: 48, text: String(i + 1), tone: "purple" }),
        sum: V.h("div", {
          class: "v-text big",
          style: { left: "84px", top: `${y - 26}px`, fontSize: "40px", lineHeight: "52px" },
        }),
        icon: A3.badge(card, { x: 268, y, size: 48, icon: "tick", tone: "green" }),
      }));
      rows.forEach((r) => card.append(r.sum));
      const verdict = A3.sticker(stage, { x: 624, y: 324, w: 312, h: 64, text: "legal", tone: "green", icon: "tick" });

      return (t) => {
        // 0.0-0.8 the card, grid, axes and numbers fade in
        P.set({ o: ramp(t, 0, 0.8, lin) });
        xName.set({ text: "x", x: 7.45, y: 0, dy: -16 });
        yName.set({ text: "y", x: 0, y: 7.3, dx: 28 });

        // 1.2-3.4 rule 1 and 3.4-5.4 rule 2: the line draws on, the half that is NOT allowed turns red, the label pops
        h1.set({ o: ramp(t, 1.2, 2.0, lin) });
        l1.set({ k: ramp(t, 1.2, 2.2, E.inOut) });
        const k1 = ramp(t, 2.4, 2.9, lin);
        lab1.set({ text: `1: ${RULE1.short}`, x: 1.35, y: 4.325, dy: 36, r: 26.6, s: pop(k1), o: Math.min(1, k1 * 4) });
        h2.set({ o: ramp(t, 3.4, 4.2, lin) });
        l2.set({ k: ramp(t, 3.4, 4.4, E.inOut) });
        const k2 = ramp(t, 4.4, 4.9, lin);
        lab2.set({ text: `2: ${RULE2.short}`, x: 3.0, y: 6.65, s: pop(k2), o: Math.min(1, k2 * 4) });

        // 4.8-5.6 the overlap: the legal polygon; 11.2 one soft pulse at the end
        poly.set({ pts: A3.CORNERS, o: ramp(t, 4.8, 5.6, lin) });
        glow.set({ pts: A3.CORNERS, o: 0.5 * flash(t, 11.2, 11.9) });
        const kl = ramp(t, 5.2, 5.7, lin);
        legal.set({ s: pop(kl), o: Math.min(1, kl * 4) });

        // 5.2 the checker card pops in
        const kc = ramp(t, 5.2, 5.7, lin);
        V.place(card, { s: pop(kc), o: Math.min(1, kc * 4) });

        // 5.6-11.1 plan tests, one per STEP seconds: dot, row 1, row 2, verdict
        const cur = Math.max(0, Math.min(TESTS.length - 1, Math.floor((t - T0) / STEP)));
        const u = t - (T0 + cur * STEP); // seconds into this plan's test
        const out = cur === TESTS.length - 1 ? 1 : 1 - ramp(u, 1.0, 1.1, lin); // the old plan leaves just before the next
        const test = TESTS[cur];
        const [px, py] = test.p;
        const kt = cur === 0 ? 1 : ramp(u, 0, 0.3, lin);
        planTag.set({ text: `plan (${px}, ${py})`, s: pop(kt), o: Math.min(1, kt * 4) });
        rows.forEach((row, i) => {
          const ok = i ? test.okR : test.okM;
          const tone = ok ? "green" : "red";
          const from = 0.2 + 0.3 * i;
          const k = ramp(u, from, from + 0.3, lin);
          row.num.set({ text: String(i + 1), tone: "purple", o: 1 });
          row.sum.textContent = `${i ? test.r : test.m} ≤ ${i ? RULE2.r : RULE1.r}`;
          row.sum.style.color = L5.tone(tone).ink;
          V.show(row.sum, k * out);
          row.icon.set({ icon: ok ? "tick" : "cross", tone, k, o: out });
        });
        const kv = ramp(u, 0.8, 1.0, lin);
        verdict.set({
          text: test.ok ? "legal" : "not allowed",
          tone: test.ok ? "green" : "red",
          icon: test.ok ? "tick" : "cross",
          k: kv,
          o: out,
        });

        // the plan dots stay on the plot: blue when they appear, green or red once judged
        TESTS.forEach((c, j) => {
          const Tj = T0 + j * STEP;
          const kd = ramp(t, Tj, Tj + 0.3, lin);
          const tone = t >= Tj + 0.8 ? (c.ok ? "green" : "red") : "blue";
          const s = E.pop(kd) * (1 + 0.25 * flash(t, Tj + 0.8, Tj + 1.0));
          const o = Math.min(1, kd * 4);
          dots[j].set({ x: c.p[0], y: c.p[1], s, o, tone });
          dotLabels[j].set({
            text: `(${c.p[0]}, ${c.p[1]})`,
            x: c.p[0],
            y: c.p[1],
            dx: LABEL_AT[j][0],
            dy: LABEL_AT[j][1],
            o,
            s: pop(kd),
          });
        });
      };
    },
  });
})();
