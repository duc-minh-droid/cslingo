/* Lecture 2 video, scene 4: an exponential always wins in the end.
   Phase 1: a cursor n sweeps along a plot of the polynomial n^1.1 (green) and the exponential 1.1^n (red); the curves are
   drawn up to the cursor, a readout follows it and the crossing (between n = 43 and 44) is flashed.
   Phase 2: at n = 60 and 10^9 steps a second, n^2 is a sliver (3.6 us), 2^n leaves the stage (36 years). All numbers come
   from the helpers (Math.pow in code). */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const L5 = V.l5;
  const L6 = V.l6;
  const { h, s, place, ramp, ease: E, flash, clamp } = V;
  const pop = (t, a, d = 0.45) => E.pop(ramp(t, a, a + d, E.lin));
  const fade = (t, a, d = 0.3) => ramp(t, a, a + d, E.lin);
  const settext = (el, v) => el.textContent !== v && (el.textContent = v);

  // ---------- data checks ----------
  const X = L2.crossing();
  const TM = L2.times();
  if (!(L2.expo(43) < L2.poly(43) && L2.expo(44) > L2.poly(44)))
    throw new Error("scene 04: the crossing moved, check the data");
  if (TM.n2.micro.toFixed(1) !== "3.6" || TM.pow2.years.toFixed(1) !== "36.5")
    throw new Error("scene 04: times changed");

  // ---------- timeline (local seconds) ----------
  const SWEEP = [
    [0.9, 2],
    [2.7, 30],
    [4.4, 44],
    [5.3, 50],
    [6.2, 60],
  ];
  const nAt = (t) => {
    if (t <= SWEEP[0][0]) return SWEEP[0][1];
    for (let i = 1; i < SWEEP.length; i++) {
      const [t0, n0] = SWEEP[i - 1];
      const [t1, n1] = SWEEP[i];
      if (t <= t1) return n0 + ((n1 - n0) * (t - t0)) / (t1 - t0);
    }
    return 60;
  };
  const tAt = (n) => {
    for (let i = 1; i < SWEEP.length; i++) {
      const [t0, n0] = SWEEP[i - 1];
      const [t1, n1] = SWEEP[i];
      if (n <= n1) return t0 + ((n - n0) * (t1 - t0)) / (n1 - n0);
    }
    return SWEEP[SWEEP.length - 1][0];
  };
  const T_CROSS = tAt(X.n);
  const OUT1 = [6.5, 6.9];
  const T2 = 7.0;
  const GROW = [7.6, 9.2];
  const BASE = 470;
  const TOP = 74; // where the red arrow tip ends
  const BREAK = 140;

  const fx1 = (n) => n.toFixed(1);

  function build(stage) {
    // ===================== phase 1 =====================
    const p1 = h("div", { style: { position: "absolute", left: "0", top: "0", width: "936px", height: "640px" } });
    stage.append(p1);
    const plot = L6.plot(p1, {
      x: 12,
      y: 0,
      w: 912,
      h: 470,
      xmin: 0,
      xmax: 60,
      ymin: 0,
      ymax: 320,
      xticks: [0, 20, 40, 60],
      yticks: [0, 100, 200, 300],
    });
    const green = plot.curve(L2.poly, "green", 1, { w: 8 });
    const red = plot.curve(L2.expo, "red", 1, { w: 8 });
    const layer = L5.svg(p1);
    const dot = (tn) => {
      const c = s("circle", { r: 10, "stroke-width": 3, class: `c-${tn}` });
      c.style.fill = "var(--c)";
      c.style.stroke = "var(--c-lip)";
      layer.append(c);
      return c;
    };
    const gDot = dot("green");
    const rDot = dot("red");
    const xDot = dot("red"); // the crossing
    const [cx, cy] = plot.toPx(X.n, X.y);
    const ring = s("circle", { cx, cy, r: 34, fill: "none", "stroke-width": 6, class: "c-red" });
    ring.style.stroke = "var(--c)";
    layer.append(ring);
    const at = (c, x, y) => {
      c.setAttribute("cx", x.toFixed(1));
      c.setAttribute("cy", y.toFixed(1));
    };
    at(xDot, cx, cy);
    layer.append(gDot); // the green dot stays visible on top of the red one at the crossing

    // name tags with a short stub of their curve colour
    const [lx, ly] = plot.toPx(0, 300);
    const names = [
      ["exponential", "red", ly + 4],
      ["polynomial", "green", ly + 66],
    ].map(([text, tone, y]) => {
      const tg = L2.tag(p1, { text, tone, x: lx + 70, y, anchor: "l" });
      const stub = h("div", {
        class: `c-${tone}`,
        style: {
          position: "absolute",
          left: `${lx + 12}px`,
          top: `${y - 4}px`,
          width: "50px",
          height: "8px",
          borderRadius: "4px",
          background: "var(--c)",
        },
      });
      p1.append(stub);
      return { tg, stub };
    });

    // 'exponential wins' tag with a leader to the crossing
    const winTag = L2.tag(p1, {
      text: "exponential wins",
      tone: "red",
      solid: true,
      x: cx - 150,
      y: cy - 120,
      anchor: "c",
    });
    const lead = L5.svg(p1);
    const leader = L5.arrow(cx - 110, cy - 96, cx - 12, cy - 12, "red", 1, { w: 6, head: 18 });
    lead.append(leader);

    // readout row
    const numSpan = () => h("span", { text: "" });
    const rN = numSpan();
    const rR = numSpan();
    const rG = numSpan();
    const tagN = L2.tag(p1, { kids: ["n = ", rN], tone: "grey", x: 150, y: 522, anchor: "c" });
    const tagR = L2.tag(p1, { kids: [L2.sup("1.1", "n"), " = ", rR], tone: "red", x: 468, y: 522, anchor: "c" });
    const tagG = L2.tag(p1, { kids: [L2.sup("n", "1.1"), " = ", rG], tone: "green", x: 786, y: 522, anchor: "c" });

    // ===================== phase 2 =====================
    const p2 = h("div", { style: { position: "absolute", left: "0", top: "0", width: "936px", height: "640px" } });
    stage.append(p2);
    const head = L2.tag(p2, { text: "n = 60", x: 12, y: 0 });
    const head2 = L2.tag(p2, { kids: ["10", h("sup", { text: "9", style: supStyle() }), " steps a second"], x: 160, y: 0 });
    const bar = (x0, w, tone) =>
      h("div", {
        class: `c-${tone}`,
        style: {
          position: "absolute",
          left: `${x0}px`,
          width: `${w}px`,
          boxSizing: "border-box",
          border: "3px solid var(--c-lip)",
          borderRadius: "7px",
          background: "var(--c)",
        },
      });
    const gBar = bar(220, 150, "green");
    const rLow = bar(560, 150, "red");
    const rStub = bar(560, 150, "red");
    p2.append(gBar, rLow, rStub);
    const base = h("div", {
      style: {
        position: "absolute",
        left: "150px",
        top: `${BASE}px`,
        width: "640px",
        height: "4px",
        background: "var(--text-faint)",
      },
    });
    p2.append(base);
    const zig = s("svg", { width: 936, height: 640, style: "position:absolute;left:0;top:0;overflow:visible" });
    const zz = (dy) => Array.from({ length: 9 }, (_, i) => [548 + i * 22, BREAK + dy + (i % 2 ? -8 : 8)]);
    const pts = (list) => list.map(([x, y]) => `${x} ${y}`).join("L");
    const band = s("path", { d: `M${pts(zz(-6))}L${pts(zz(16).reverse())}Z` });
    band.style.fill = "var(--bg)";
    const zigTop = s("path", { d: `M${pts(zz(-6))}`, fill: "none", "stroke-width": 4, class: "c-red" });
    const zigBot = s("path", { d: `M${pts(zz(16))}`, fill: "none", "stroke-width": 4, class: "c-red" });
    zigTop.style.stroke = "var(--c-lip)";
    zigBot.style.stroke = "var(--c-lip)";
    zig.append(band, zigTop, zigBot);
    const up = L5.arrow(635, TOP + 40, 635, TOP, "red", 1, { w: 9, head: 28 });
    zig.append(up);
    p2.append(zig);
    const lab = (txt, x) => {
      const e = h(
        "div",
        {
          class: "v-text",
          style: {
            left: `${x - 60}px`,
            top: `${BASE + 14}px`,
            width: "120px",
            textAlign: "center",
            fontSize: "44px",
            fontWeight: "900",
          },
        },
        L2.sup("n", ""),
      );
      e.replaceChildren(...txt);
      p2.append(e);
      return e;
    };
    const labG = lab([L2.sup("n", "2")], 295);
    const labR = lab([L2.sup("2", "n")], 635);
    const tMicro = L2.tag(p2, {
      text: `${fx1(TM.n2.micro)} µs`,
      tone: "green",
      solid: true,
      x: 295,
      y: 414,
      anchor: "c",
    });
    const tYears = L2.tag(p2, {
      text: `${TM.pow2.years.toFixed(1)} years`,
      tone: "red",
      solid: true,
      x: 635,
      y: 12,
      anchor: "tc",
    });
    const tEasy = L2.tag(p2, { text: "easy", tone: "green", solid: true, x: 295, y: 552, anchor: "tc" });
    const tHard = L2.tag(p2, { text: "hard", tone: "red", solid: true, x: 635, y: 552, anchor: "tc" });
    const tScale = L2.tag(p2, { text: "not to scale", tone: "grey", x: 924, y: 586, anchor: "tr" });

    // ===================== update =====================
    return (t) => {
      // ---- phase 1 ----
      const o1 = 1 - ramp(t, OUT1[0], OUT1[1], E.lin);
      V.show(p1, t < T2 ? o1 : 0);
      const pIn = ramp(t, 0.2, 0.9);
      place(plot.svg, { s: 0.96 + 0.04 * pIn, o: pIn });
      names.forEach(({ tg, stub }, i) => {
        tg.set({ s: pop(t, 0.45 + i * 0.12), o: t > 0.4 + i * 0.12 ? 1 : 0 });
        V.show(stub, fade(t, 0.45 + i * 0.12, 0.2));
      });
      const n = nAt(t);
      const k = n / 60;
      const sweeping = t >= SWEEP[0][0];
      const kk = sweeping ? k : 0;
      green.set({ k: kk, o: 1 });
      red.set({ k: kk, o: 1 });
      const front = (c, f) => {
        const [px, py] = plot.toPx(n, f(n));
        at(c, px, py);
        V.place(c, { s: sweeping ? 1 : 0, o: sweeping ? 1 : 0 });
      };
      front(gDot, L2.poly);
      front(rDot, L2.expo);
      // the crossing
      const seen = t >= T_CROSS;
      place(xDot, { s: seen ? pop(t, T_CROSS, 0.4) : 0, o: seen ? 1 : 0 });
      const rk = flash(t, T_CROSS, T_CROSS + 0.8);
      place(ring, { s: 0.4 + 1.1 * ramp(t, T_CROSS, T_CROSS + 0.8, E.out), o: seen ? rk : 0 });
      const wk = pop(t, T_CROSS + 0.25, 0.5);
      winTag.set({ s: wk, o: wk > 0.05 ? 1 : 0 });
      place(leader, { o: fade(t, T_CROSS + 0.45, 0.2) });
      L5.drawOn(leader, ramp(t, T_CROSS + 0.45, T_CROSS + 0.8, E.lin));
      // readout (the real values at floor(n))
      const ni = Math.floor(n + 1e-9);
      const ev = L2.expo(ni);
      const pv = L2.poly(ni);
      const dp = fx1(ev) === fx1(pv) ? 2 : 1;
      settext(rN, String(ni));
      settext(rR, ev.toFixed(dp));
      settext(rG, pv.toFixed(dp));
      [tagN, tagR, tagG].forEach((tg, i) => tg.set({ s: pop(t, 0.7 + i * 0.1), o: t > 0.65 + i * 0.1 ? 1 : 0 }));

      // ---- phase 2 ----
      V.show(p2, t >= T2 ? 1 : 0);
      head.set({ s: pop(t, T2 + 0.05), o: t > T2 ? 1 : 0 });
      head2.set({ s: pop(t, T2 + 0.2), o: t > T2 + 0.15 ? 1 : 0 });
      const grow = ramp(t, GROW[0], GROW[1], E.in);
      const bIn = ramp(t, T2 + 0.3, T2 + 0.8);
      V.show(base, bIn);
      // green sliver: 8 px
      Object.assign(gBar.style, { top: `${BASE - 8}px`, height: "8px" });
      place(gBar, { s: 1, o: bIn });
      const tip = BASE - (BASE - TOP) * grow;
      const lowTop = Math.max(tip, BREAK + 24);
      Object.assign(rLow.style, { top: `${lowTop}px`, height: `${Math.max(0, BASE - lowTop)}px` });
      V.show(rLow, grow > 0.001 ? 1 : 0);
      const stubTop = Math.max(tip + 34, 0);
      const stubH = Math.max(0, BREAK - 12 - stubTop);
      Object.assign(rStub.style, { top: `${stubTop}px`, height: `${stubH}px` });
      V.show(rStub, stubH > 4 ? 1 : 0);
      const zk = clamp((BREAK + 24 - tip) / 20);
      V.show(zig, tip < BREAK + 24 ? 1 : 0);
      V.show(band, zk);
      V.show(zigTop, zk);
      V.show(zigBot, zk);
      const ak = clamp((BREAK - 12 - tip) / 30);
      place(up, { y: tip - TOP, o: ak > 0 ? 1 : 0 });
      L5.drawOn(up, ak);
      // tiny sliver shows from the start; the red bar has a small base too
      if (grow <= 0.001) {
        Object.assign(rLow.style, { top: `${BASE - 8}px`, height: "8px" });
        V.show(rLow, bIn);
      }
      V.show(labG, bIn);
      V.show(labR, bIn);
      tMicro.set({ s: pop(t, T2 + 1.0), o: t > T2 + 0.95 ? 1 : 0 });
      tYears.set({ s: pop(t, GROW[1]), o: t >= GROW[1] ? 1 : 0 });
      tEasy.set({ s: pop(t, 9.6), o: t >= 9.6 ? 1 : 0 });
      tHard.set({ s: pop(t, 9.6), o: t >= 9.6 ? 1 : 0 });
      tScale.set({ s: pop(t, T2 + 0.5), o: t >= T2 + 0.5 ? 1 : 0 });
    };
  }

  function supStyle() {
    return { fontSize: "0.8em", lineHeight: "0", position: "relative", top: "-0.5em", marginLeft: "0.04em" };
  }

  V.scene({
    kicker: "EASY VS HARD",
    title: ["An exponential always", "wins in the end"],
    dur: 11,
    caps: [
      [0.4, 3.0, "A tiny exponential against a polynomial."],
      [3.2, 6.2, "At n = 44 the exponential overtakes."],
      [6.6, 8.2, "Now a real run, with a bigger exponential."],
      [8.4, 10.7, "A polynomial takes microseconds, the exponential 36.5 years."],
    ],
    build,
  });
})();
