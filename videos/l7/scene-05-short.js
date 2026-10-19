/* Lecture 7 · scene-05-short: double bridge experiment 2. One road is twice as long. Ants walk at the same speed, so a trip on the
   SHORT road ends sooner and its pheromone is laid sooner; later ants see more pheromone there and choose it more often, which lays
   still more (positive feedback). Most colonies settle on the short road; early luck leaves a few on the long one.
   A real simulation (L7.SH, seed 71, branches 5 and 10), then the tally of 200 colonies (L7.SHT). Every number is asserted below.
   Local seconds: 0.2-0.9 the bridge builds, 1.0 ants start leaving (ant 0 goes LONG, ant 1 SHORT), 3.1 the short ant lands (first
   thin trail on the short road), 4.5 the long ant lands and the share stat pops, 4.8-5.9 the feedback loop draws, 5.4 a pulse runs
   round it (5.5 its name, 'positive feedback'), 5.2-9.7 fast forward to tick 60, 9.7-10.1 ants and loop fade, 10.1-11.0 the tally of
   200 colonies, 12.9 the red card pulses. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const L5 = V.l5;
  const E = V.ease;
  const { ramp, flash, clamp } = V;
  const lin = E.lin;
  const f1 = (n) => n.toFixed(1);

  // ---------- facts (asserted: a wrong number throws) ----------
  const SH = L7.SH;
  const { SHORT, LONG } = L7.BR;
  L7.same("scene 5 branch lengths", [SHORT, LONG], [5, 10]);
  L7.same("scene 5 first two ants (0 goes long, 1 goes short)", SH.picks.slice(0, 2), [1, 0]);
  L7.same("scene 5 first landings (short, long)", [L7.firstLand(SH, 0), L7.firstLand(SH, 1)], [6, 10]);
  L7.same(
    "scene 5 share of the last 10 ants on the short road",
    [10, 12, 16, 20, 30, 40, 60].map((T) => Math.round(L7.bridgeAt(SH, T).share)),
    [70, 80, 70, 80, 90, 100, 100],
  );
  const COLONIES = L7.sum(Object.values(L7.SHT));
  const TALLY = { short: L7.SHT.up, long: L7.SHT.down, split: L7.SHT.split }; // the upper road is the short one
  const PCT = Object.fromEntries(Object.entries(TALLY).map(([k, n]) => [k, Math.round((100 * n) / COLONIES)]));
  L7.same("scene 5 colonies", COLONIES, 200);
  L7.same("scene 5 tally in percent", [PCT.short, PCT.long, PCT.split], [85, 10, 5]);

  // ---------- timing (local seconds) ----------
  const T_GO = 1.0; // the first ant leaves
  const T_SLOW = 5.2; // end of the slow start: tick 12
  const T_END = 9.7; // end of the fast forward: tick 60
  const SLOW = 0.35; // seconds per tick while the viewer follows the first ants
  const FAST = 48 / (T_END - T_SLOW); // ticks per second in the fast forward
  L7.same("scene 5 slow start ends at tick", Math.round((T_SLOW - T_GO) / SLOW), 12);
  L7.same("scene 5 fast forward ends at tick", Math.round(12 + (T_END - T_SLOW) * FAST), 60);
  const tickAt = (t) => (t < T_SLOW ? Math.max(0, (t - T_GO) / SLOW) : Math.min(60, 12 + (t - T_SLOW) * FAST));
  L7.close("scene 5 the short ant lands at 3.1 s", T_GO + SLOW * L7.firstLand(SH, 0), 3.1, 0.001);
  L7.close("scene 5 the long ant lands at 4.5 s", T_GO + SLOW * L7.firstLand(SH, 1), 4.5, 0.001);

  // ---------- layout (stage px, from the storyboard) ----------
  const BOX = { x: 12, y: 40, w: 540, h: 460, cy: 100 }; // 12 px side margins on the stage
  const PANEL = { x: 574, w: 342 }; // the right panel ends 8 px inside the margin, so a popping card stays inside it
  const CHIPS = [
    { text: "more pheromone", tone: "blue", y: 176 },
    { text: "more ants choose it", tone: "orange", y: 260 },
    { text: "more pheromone laid", tone: "blue", y: 344 },
  ];
  const CHIP = { x: PANEL.x, w: 316, h: 56 };
  const CHIP_CX = CHIP.x + CHIP.w / 2;
  const TIP = [CHIP.x + CHIP.w + 3, CHIPS[0].y + CHIP.h / 2]; // the return arrow points into the right edge of chip 1
  const HEAD = 16;
  const BOW = 904; // the return arrow bows out to about here (x) on its way up the right side
  const TALLY_Y = [210, 300, 390];
  // widths of the tag texts (28 px, weight 900) as the browser draws them, plus the tag's own padding
  const TAG_W = { [`${SHORT} steps`]: 134, [`${LONG} steps`]: 156 };
  const T_TALLY = 10.1; // the tally of 200 colonies pops

  // ---------- the loop: where the pulse is at lap time u (seconds into one 2.4 s lap) ----------
  const LAP = 2.4;
  const P0 = [CHIP.x + CHIP.w + 2, CHIPS[2].y + CHIP.h / 2]; // chip 3's right edge: the arrow leaves from here
  const P3 = [TIP[0] + HEAD, TIP[1]]; // where the line ends and the head begins
  const C1 = [BOW + 6, P0[1]];
  const C2 = [BOW + 6, P3[1]];
  const cubic = (k) => {
    const u = 1 - k;
    const w = [u * u * u, 3 * u * u * k, 3 * u * k * k, k * k * k];
    return [0, 1].map((a) => w[0] * P0[a] + w[1] * C1[a] + w[2] * C2[a] + w[3] * P3[a]);
  };
  const mid = (i) => [CHIP_CX, CHIPS[i].y + CHIP.h / 2];
  // [duration, from-point function]: chip 1 to 2, 2 to 3, 3 to the right edge, up the right side, back into chip 1
  const LEGS = [
    [0.55, (k) => [CHIP_CX, mid(0)[1] + (mid(1)[1] - mid(0)[1]) * k]],
    [0.55, (k) => [CHIP_CX, mid(1)[1] + (mid(2)[1] - mid(1)[1]) * k]],
    [0.2, (k) => [CHIP_CX + (P0[0] - CHIP_CX) * k, P0[1]]],
    [0.9, cubic],
    [0.2, (k) => [P3[0] + (CHIP_CX - P3[0]) * k, P3[1]]],
  ];
  L7.close(
    "scene 5 one lap of the pulse",
    LEGS.reduce((s, l) => s + l[0], 0),
    LAP,
    1e-9,
  );
  const ARRIVE = [0, LEGS[0][0], LEGS[0][0] + LEGS[1][0]]; // lap time at which the pulse reaches chip 1, 2, 3
  const lapOf = (x) => x - LAP * Math.floor(x / LAP);
  function pulseAt(u) {
    let rest = lapOf(u);
    for (const [d, f] of LEGS) {
      if (rest <= d) return f(rest / d);
      rest -= d;
    }
    return LEGS[LEGS.length - 1][1](1);
  }
  // 0 inside a chip, growing to 1 a little way outside it: the pulse grows out of one chip and shrinks into the next
  function outside([x, y]) {
    const d = CHIPS.map((c) =>
      Math.hypot(Math.max(CHIP.x - x, 0, x - (CHIP.x + CHIP.w)), Math.max(c.y - y, 0, y - (c.y + CHIP.h + 6))),
    );
    return E.out(clamp(Math.min(...d) / 14));
  }

  // the return arrow: leaves chip 3 to the right, rises, and turns left into chip 1 (same draw-on markers as L5.arrow)
  function returnArrow() {
    const grey = L7.tone("grey").c;
    const pt = (p) => `${f1(p[0])} ${f1(p[1])}`;
    const half = HEAD * 0.46;
    const head = `M ${pt(TIP)} L ${pt([TIP[0] + HEAD, TIP[1] - half])} L ${pt([TIP[0] + HEAD, TIP[1] + half])} Z`;
    return V.s(
      "g",
      {},
      V.s("path", {
        d: `M ${pt(P0)} C ${pt(C1)} ${pt(C2)} ${pt(P3)}`,
        fill: "none",
        pathLength: "1",
        "data-draw": "1",
        "stroke-width": "6",
        "stroke-linecap": "round",
        style: { stroke: grey },
      }),
      V.s("path", {
        d: head,
        "data-head": "1",
        "stroke-width": "3",
        "stroke-linejoin": "round",
        style: { fill: grey, stroke: grey },
      }),
    );
  }

  V.scene({
    kicker: "THE DOUBLE BRIDGE",
    title: ["The short bridge", "gets pheromone first"],
    dur: 15.1,
    caps: [
      [0.4, 2.4, "One road is twice as long."],
      [2.9, 5.2, "Same speed: the short trip ends first."],
      [5.3, 7.5, "More pheromone, so more ants pick it."],
      [7.6, 9.7, "Soon most ants take the short road."],
      [10.4, 12.8, `${PCT.short}% of ${COLONIES} colonies pick the short road.`],
      [12.9, 14.7, "A few lock onto the long road."],
    ],
    build(stage) {
      // the bridge: a straight short road above, a deep bowl for the long road
      const B = L7.bridge(stage, { ...BOX, lenU: SHORT, lenL: LONG });
      const centred = (text, cx, y) => {
        const t = L7.tag(stage, { x: cx - TAG_W[text] / 2, y, text, tone: "grey" });
        t.el.style.width = `${TAG_W[text]}px`;
        return t;
      };
      const tagShort = centred(`${SHORT} steps`, 282, 64);
      const tagLong = centred(`${LONG} steps`, 282, 478);

      // right panel, part 1: the step counter, the feedback loop, the share of the last ten ants
      const step = L7.stat(stage, { x: PANEL.x, y: 12, w: PANEL.w, h: 80, label: "step", tone: "grey" });
      const snowball = L7.tag(stage, { x: PANEL.x, y: 104, text: "positive feedback", tone: "grey" });
      const chips = CHIPS.map((c) =>
        L7.card(stage, { x: CHIP.x, y: c.y, w: CHIP.w, h: CHIP.h, text: c.text, tone: c.tone, plain: false }),
      );
      const arrows = L5.svg(stage);
      const down = [0, 1].map((i) =>
        arrows.appendChild(
          L5.arrow(CHIP_CX, CHIPS[i].y + CHIP.h + 2, CHIP_CX, CHIPS[i + 1].y - 1, "grey", 1, { w: 6, head: 18 }),
        ),
      );
      const back = arrows.appendChild(returnArrow());
      const pulse = L7.token(stage, { tone: "blue", size: 22 });
      const lastTag = L7.tag(stage, { x: PANEL.x, y: 428, text: "last 10 ants", tone: "grey" });
      const share = L7.stat(stage, { x: PANEL.x, y: 494, w: PANEL.w, h: 80, label: "short road", tone: "green" });

      // right panel, part 2: the tally of 200 colonies
      const colonies = L7.tag(stage, { x: PANEL.x, y: 140, text: `${COLONIES} colonies`, tone: "grey" });
      const rows = [
        { label: "short road", tone: "green", pct: PCT.short },
        { label: "long road", tone: "red", pct: PCT.long },
        { label: "undecided", tone: "grey", pct: PCT.split },
      ].map((r, i) => ({
        ...r,
        stat: L7.stat(stage, { x: PANEL.x, y: TALLY_Y[i], w: PANEL.w, h: 76, label: r.label, tone: r.tone }),
      }));

      return (t) => {
        // ---- the bridge ----
        const T = tickAt(t);
        const state = B.update({
          sim: SH,
          T,
          ground: ramp(t, 0.2, 0.7, E.inOut),
          ants: ramp(t, T_GO, T_GO + 0.1, lin) * (1 - ramp(t, T_END, T_END + 0.4, lin)),
        });
        // once the tally shows, the two roads take the colours of its cards: the short road green, the long road red
        const tallied = t >= T_TALLY;
        tagShort.set({ k: ramp(t, 0.4, 0.75, lin), tone: tallied ? "green" : "grey" });
        tagLong.set({ k: ramp(t, 0.55, 0.9, lin), tone: tallied ? "red" : "grey" });

        // ---- the loop and the share (fade out with the ants, the tally takes their place) ----
        const gone = 1 - ramp(t, T_END, T_END + 0.4, lin);
        step.set({ text: String(Math.floor(T)), k: ramp(t, T_GO, T_GO + 0.35, lin), o: gone });
        snowball.set({ k: ramp(t, 5.5, 5.85, lin), o: gone });
        const loop = [4.8, 5.1, 5.4].map((t0, i) => ({ k: ramp(t, t0, t0 + 0.3, lin), t0, i }));
        chips.forEach((c, i) => {
          // a chip turns solid for 0.45 s each time the pulse reaches it
          const since = t >= 5.4 ? lapOf(t - 5.4 - ARRIVE[i]) : Infinity;
          const tn = L7.tone(CHIPS[i].tone);
          const lit = since < 0.45;
          Object.assign(c.el.style, {
            background: lit ? tn.c : "",
            borderColor: lit ? tn.lip : "",
            boxShadow: lit ? `0 6px 0 ${tn.lip}` : "",
            color: lit ? tn.on : "",
          });
          c.set({ k: loop[i].k, o: gone, s: 1 + 0.04 * flash(since, 0, 0.45) });
        });
        down.forEach((a, i) => {
          L5.drawOn(a, ramp(t, 4.95 + 0.3 * i, 5.15 + 0.3 * i, E.inOut));
          a.style.opacity = f1(gone);
        });
        L5.drawOn(back, ramp(t, 5.55, 5.95, E.inOut));
        back.style.opacity = f1(gone);
        const [px, py] = pulseAt(t - 5.4);
        pulse.set({ x: px, y: py, s: outside([px, py]), o: t < 5.4 ? 0 : gone });
        lastTag.set({ k: ramp(t, 4.5, 4.85, lin), o: gone });
        share.set({ text: `${Math.round(state.share)}%`, k: ramp(t, 4.5, 4.85, lin), o: gone });

        // ---- the tally ----
        colonies.set({ k: ramp(t, T_TALLY, T_TALLY + 0.35, lin) });
        rows.forEach((r, i) => {
          const t0 = T_TALLY + 0.1 + 0.25 * i;
          // the red card's pulse grows it to the left only, so it stays inside the stage
          const bump = i === 1 ? 0.5 * flash(t, 12.9, 13.3) : 0;
          r.stat.set({ text: `${r.pct}%`, k: ramp(t, t0, t0 + 0.35, lin), bump, x: -PANEL.w * 0.05 * bump });
        });
      };
    },
  });
})();
