/* Algorithms Phase 3 · scene 02-region.
   A linear program in one picture: x = units of product X, y = units of product Y; each rule is a line that cuts the plane in half
   (the NOT allowed half turns red): 1 machine hours, 2 raw material and 3 no negatives (x, y >= 0). The legal plans are the overlap
   of the allowed halves (the green polygon, the feasible region), and the lesson's five test plans are plugged into the rules one
   by one, two seconds each: the numbers go into the rule (2 + 2x2), the sum is compared with the limit, the verdict stays up.
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

  // the numbers go into the rule: "x + 2y" becomes "2 + 2×2", "3x + y" becomes "3×2 + 2" (asserted against A3.check)
  const plug = (p) => [`${p[0]} + 2×${p[1]}`, `3×${p[0]} + ${p[1]}`];
  TESTS.forEach((c) =>
    A3.need(
      c.p[0] + 2 * c.p[1] === c.m && 3 * c.p[0] + c.p[1] === c.r && plug(c.p).length === 2,
      `scene 02: the substitution of plan ${c.p} differs`,
    ),
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
  const T0 = 6.5; // the first plan test starts here, one every STEP seconds (two seconds each: read, compare, verdict)
  const STEP = 2.0;
  const pop = (k) => 0.8 + 0.2 * E.pop(k); // pop-in scale for stickers and labels
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
  });
  const RULES = [
    ["machine hours", RULE1.short],
    ["raw material", RULE2.short],
    ["no negatives", "x, y ≥ 0"],
  ];

  V.scene({
    kicker: "THE PROBLEM",
    title: ["Rules cut the plane,", "what is left is legal"],
    dur: 17,
    caps: [
      [0.4, 2.0, "Choose x of product X and y of product Y."],
      [2.2, 5.2, "Each rule cuts the plane in half."],
      [5.4, 7.2, "The overlap is the feasible region."],
      [7.4, 10.4, "Plug a plan into every rule. Pass all: legal."],
      [10.6, 16.4, "Break even one rule and it is not allowed."],
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
      const h3 = P.half(-1, 0, 0); // rule 3: x >= 0 (the left of the y axis is not allowed) ...
      const h4 = P.half(0, -1, 0); // ... and y >= 0 (below the x axis)
      const poly = P.poly({ tone: "green" });
      const glow = P.poly({ tone: "green", w: 14, fill: false }); // a soft halo round the polygon edge for the final pulse
      const l1 = P.eq(RULE1.a, RULE1.b, RULE1.r);
      const l2 = P.eq(RULE2.a, RULE2.b, RULE2.r);
      const xName = P.text({ tone: "grey", anchor: "end" });
      const yName = P.text({ tone: "grey", anchor: "start" });
      const lineBadge = [
        A3.badge(P.html, { x: P.px(6.8), y: P.py(1.6), size: 48, text: "1", tone: "purple" }),
        A3.badge(P.html, { x: P.px(3.1), y: P.py(5.7), size: 48, text: "2", tone: "purple" }),
      ];
      const legal = A3.tag(P.html, {
        x: P.px(2.1),
        y: P.py(0.75),
        anchor: "m",
        text: "feasible region",
        tone: "green",
      });
      const dots = TESTS.map(() => P.dot({ tone: "blue", r: 14 }));
      const dotLabels = TESTS.map(() => P.text({ tone: "grey" }));

      // ---------- the rules card: the three rules with their names ----------
      const rulesCard = V.h("div", { style: abs(624, 0, 312, 224) });
      rulesCard.append(V.h("div", { class: "v-card plain", style: abs(0, 0, 312, 224) }));
      stage.append(rulesCard);
      const ruleRows = RULES.map(([name, math], i) => {
        const top = 14 + 68 * i;
        const badge = A3.badge(rulesCard, { x: 38, y: top + 30, size: 48, text: String(i + 1), tone: "purple" });
        const nameEl = V.h("div", {
          class: "v-text big",
          text: name,
          style: { left: "72px", top: `${top + 1}px`, fontSize: "30px" },
        });
        const mathEl = V.h("div", {
          class: "v-text dim",
          text: math,
          style: { left: "72px", top: `${top + 31}px`, fontSize: "28px" },
        });
        rulesCard.append(nameEl, mathEl);
        return { badge, els: [nameEl, mathEl] };
      });

      // ---------- the checker: one card, two rows (the numbers go in, the sum is compared), a verdict ----------
      const card = V.h("div", { style: abs(624, 248, 312, 250) });
      card.append(V.h("div", { class: "v-card plain", style: abs(0, 0, 312, 250) }));
      stage.append(card);
      const planTag = A3.tag(card, { x: 156, y: 18, anchor: "c", tone: "blue" });
      const rows = [0, 1].map((i) => {
        const top = 76 + 82 * i;
        return {
          num: A3.badge(card, { x: 38, y: top + 36, size: 48, text: String(i + 1), tone: "purple" }),
          put: V.h("div", { class: "v-text dim", style: { left: "78px", top: `${top}px`, fontSize: "28px" } }),
          sum: V.h("div", {
            class: "v-text big",
            style: { left: "78px", top: `${top + 30}px`, fontSize: "40px", lineHeight: "46px" },
          }),
          icon: A3.badge(card, { x: 270, y: top + 36, size: 48, icon: "tick", tone: "green" }),
        };
      });
      rows.forEach((r) => card.append(r.put, r.sum));
      const verdict = A3.sticker(stage, { x: 624, y: 520, w: 312, h: 64, text: "legal", tone: "green", icon: "tick" });

      return (t) => {
        // 0.0-0.8 the card, grid, axes and numbers fade in; 0.6 the axes say what x and y are
        P.set({ o: ramp(t, 0, 0.8, lin) });
        const kn = ramp(t, 0.6, 1.0, lin);
        xName.set({ text: "x: product X", x: 7.7, y: 0, dy: -16, o: kn });
        yName.set({ text: "y: product Y", x: 0.2, y: 7.15, o: kn });

        // the rules card, then rule 1 (1.8), rule 2 (3.2), rule 3 (4.6): the line draws on, the half that is NOT allowed turns red
        const kcard = ramp(t, 1.0, 1.5, lin);
        V.place(rulesCard, { s: pop(kcard), o: Math.min(1, kcard * 4) });
        const rowAt = [1.9, 3.3, 4.7];
        ruleRows.forEach((r, i) => {
          const k = ramp(t, rowAt[i], rowAt[i] + 0.4, lin);
          r.badge.set({ text: String(i + 1), tone: "purple", s: pop(k), o: Math.min(1, k * 4) });
          r.els.forEach((el) => V.show(el, k));
        });
        h1.set({ o: ramp(t, 1.8, 2.6, lin) });
        l1.set({ k: ramp(t, 1.8, 2.8, E.inOut) });
        const k1 = ramp(t, 2.8, 3.2, lin);
        lineBadge[0].set({ text: "1", tone: "purple", s: pop(k1), o: Math.min(1, k1 * 4) });
        h2.set({ o: ramp(t, 3.2, 4.0, lin) });
        l2.set({ k: ramp(t, 3.2, 4.2, E.inOut) });
        const k2 = ramp(t, 4.2, 4.6, lin);
        lineBadge[1].set({ text: "2", tone: "purple", s: pop(k2), o: Math.min(1, k2 * 4) });
        h3.set({ o: ramp(t, 4.6, 5.3, lin) });
        h4.set({ o: ramp(t, 4.6, 5.3, lin) });

        // 5.6-6.2 the overlap: the feasible polygon; one soft pulse when it appears and one at the very end
        poly.set({ pts: A3.CORNERS, o: ramp(t, 5.6, 6.2, lin) });
        glow.set({ pts: A3.CORNERS, o: 0.5 * Math.max(flash(t, 5.9, 6.5), flash(t, 16.1, 16.7)) });
        const kl = ramp(t, 6.0, 6.5, lin);
        legal.set({ s: pop(kl), o: Math.min(1, kl * 4) });

        // 6.1 the checker card pops in
        const kc = ramp(t, 6.1, 6.6, lin);
        V.place(card, { s: pop(kc), o: Math.min(1, kc * 4) });

        // plan tests, one per STEP seconds: dot, row 1 (numbers in, sum, tick), row 2, verdict; the verdict stays up until the next plan
        const cur = Math.max(0, Math.min(TESTS.length - 1, Math.floor((t - T0) / STEP)));
        const u = t - (T0 + cur * STEP); // seconds into this plan's test
        const out = cur === TESTS.length - 1 ? 1 : 1 - ramp(u, STEP - 0.12, STEP - 0.02, lin); // the old plan leaves just before the next
        const test = TESTS[cur];
        const [px, py] = test.p;
        const kt = cur === 0 ? 1 : ramp(u, 0, 0.3, lin);
        planTag.set({ text: `plan (${px}, ${py})`, s: pop(kt), o: Math.min(1, kt * 4) });
        rows.forEach((row, i) => {
          const ok = i ? test.okR : test.okM;
          const tone = ok ? "green" : "red";
          const from = 0.35 + 0.4 * i;
          const k = ramp(u, from, from + 0.3, lin);
          row.num.set({ text: String(i + 1), tone: "purple", o: 1 });
          row.put.textContent = plug(test.p)[i];
          row.sum.textContent = `${i ? test.r : test.m} ≤ ${i ? RULE2.r : RULE1.r}`;
          row.sum.style.color = L5.tone(tone).ink;
          V.show(row.put, ramp(u, from - 0.15, from + 0.1, lin) * out);
          V.show(row.sum, k * out);
          row.icon.set({ icon: ok ? "tick" : "cross", tone, k, o: out });
        });
        const kv = ramp(u, 1.2, 1.4, lin);
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
          const tone = t >= Tj + 1.2 ? (c.ok ? "green" : "red") : "blue";
          const s = E.pop(kd) * (1 + 0.25 * flash(t, Tj + 1.2, Tj + 1.4));
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
