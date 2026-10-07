/* Lecture 3 · scene 10, populations.
   One landscape panel. A lone grey hiker climbs from i = 4 to the small hill at i = 7 and is stuck. Then a team of six blue members
   appears on three hills and a real steady-state EA runs (L3.ea: tournament of two, mutate, replace the worst). Step 1 and 2 are slow,
   steps 3-10 quick. The hills counter falls 3 -> 2 -> 1 as the team gathers on the tallest hill. Finally the two chips
   Selection and Recombination pop in, each with a tiny pictogram. Every position comes from the real algorithm. */
(function () {
  const V = window.VID;
  const L3 = V.l3;
  const L5 = V.l5;
  const { ramp, ease: E, clamp } = V;
  const pop = (t, a, d = 0.35) => E.pop(ramp(t, a, a + d, E.lin));
  const fade = (t, a, d = 0.2) => ramp(t, a, a + d, E.lin);

  // ---------- the data, checked against the lecture ----------
  const F = L3.fvals("multi");
  const START = [4, 10, 15, 21, 25, 33];
  const LOG = L3.ea(F, { pop: START, seed: 44, steps: 10, r: 3 });
  const must = (a, b, what) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`scene 10: ${what}: ${JSON.stringify(a)}`);
  };
  must(
    LOG.map((e) => [e.parentAt, e.child, e.replaced]),
    [
      [33, 30, true],
      [15, 17, true],
      [30, 29, true],
      [33, 34, false],
      [15, 17, true],
      [29, 30, true],
      [17, 14, false],
      [30, 29, true],
      [29, 28, true],
      [29, 31, true],
    ],
    "EA steps",
  );
  must(
    LOG.map((e) => e.hills),
    [3, 3, 2, 2, 2, 2, 2, 2, 2, 1],
    "hills",
  );
  must(
    LOG[9].pop.slice().sort((a, b) => a - b),
    [28, 29, 29, 30, 30, 31],
    "final team",
  );
  const HIKE = L3.hcSteps(F, 4, [1, 1, 1, 1]).path; // 4 5 6 7 then stuck
  must(HIKE, [4, 5, 6, 7], "hiker path");

  // ---------- timeline ----------
  const SLOW = 2; // steps 1 and 2 are slow
  const T0 = [4.4, 5.8];
  const DU = [1.2, 0.8];
  const stepT = (k) => (k < SLOW ? T0[k] : 6.6 + 0.34 * (k - SLOW));
  const stepD = (k) => (k < SLOW ? DU[k] : 0.34);
  const MEMBER_AT = (j) => 2.4 + 0.1 * j; // members pop in one by one
  const CHIP1 = 9.4;
  const CHIP2 = 9.8;
  const SWAP = [10.5, 11.1];
  const STACK = 16; // px between duplicates standing on the same index

  function build(stage) {
    const P = L3.land(stage, { x: 0, y: 70, w: 936, h: 400, kind: "multi", frame: true });
    const star = P.marker("star", { size: 30 });
    const hiker = P.marker("token", { size: 30, tone: "grey" });
    const stuck = P.marker("badge", { icon: "cross" });
    const members = START.map(() => P.marker("token", { size: 24 }));
    const ghosts = LOG.map(() => P.marker("ghost", { size: 30 }));
    const bads = LOG.map(() => P.marker("badge", { icon: "cross", size: 34 }));
    const pill = L3.tag(stage, { x: 924, y: 10, text: "hills: 3", tone: "blue", anchor: "r" });

    // bottom strip: two chips with tiny pictograms (no text on the pictograms)
    const chipS = L3.chip(stage, { x: 170, y: 520, text: "Selection", tone: "orange" });
    const chipR = L3.chip(stage, { x: 560, y: 520, text: "Recombination", tone: "purple" });
    const CY = 548;
    const svg = V.s("svg", {
      width: 936,
      height: 640,
      style: { position: "absolute", left: "0px", top: "0px", overflow: "visible" },
    });
    stage.append(svg);
    const tn = (n) => L5.tone(n);
    const dot = (x, c) =>
      V.s("circle", { cx: x, cy: CY, r: 11, "stroke-width": "3", style: { fill: tn(c).c, stroke: tn(c).lip } });
    const selIcon = V.s("g", {});
    const ring = V.s("circle", {
      cx: 138,
      cy: CY,
      r: 17,
      fill: "none",
      "stroke-width": "4",
      style: { stroke: tn("orange").c },
    });
    selIcon.append(dot(104, "blue"), dot(138, "blue"), ring);
    const tiles = [];
    const recIcon = V.s("g", {});
    for (let row = 0; row < 2; row++)
      for (let c = 0; c < 5; c++) {
        const col = row ? "purple" : "blue";
        const r = V.s("rect", {
          x: 454 + c * 18.5,
          y: CY - 21 + row * 24,
          width: 17,
          height: 17,
          rx: 4,
          "stroke-width": "2.5",
          style: { fill: tn(col).c, stroke: tn(col).lip },
        });
        tiles.push({ r, row, c });
        recIcon.append(r);
      }
    svg.append(selIcon, recIcon);
    const iconPop = (g, cx, k) =>
      g.setAttribute(
        "transform",
        `translate(${cx} ${CY}) scale(${(0.6 + 0.4 * k).toFixed(3)}) translate(${-cx} ${-CY})`,
      );

    return (t) => {
      // panel
      const pk = ramp(t, 0.3, 1.0, E.lin);
      P.update({ curve: pk, fill: ramp(t, 0.5, 1.1, E.lin), o: fade(t, 0.3, 0.3) });
      star.set({ i: 29, dy: -46, s: pop(t, 1.0, 0.4), o: fade(t, 1.0, 0.1) });

      // the lone grey hiker: three hops uphill, then a red cross
      const hs = L3.stepAt(t, 1.3, 0.35, 3);
      const from = HIKE[hs.i];
      const hp = L3.hop(from, HIKE[hs.i + 1], hs.n ? hs.k : 0, 24);
      hiker.set({ i: hp.i, dy: hp.dy, s: pop(t, 1.2, 0.3), o: fade(t, 1.2, 0.1), ring: null });
      stuck.set({ icon: "cross", i: 7, k: ramp(t, 2.35, 2.75, E.lin), o: 1 });

      // the team: state of every slot at time t
      const pos = START.slice();
      const sc = START.map((_, j) => pop(t, MEMBER_AT(j), 0.35));
      const rings = START.map(() => null);
      const ringK = START.map(() => 1);
      LOG.forEach((e, k) => {
        const u = clamp((t - stepT(k)) / stepD(k));
        const slow = k < SLOW;
        if (t < stepT(k)) return;
        const wk = e.replaced ? e.worstSlot : -1;
        if (slow && u < 0.22) {
          [e.a, e.b].forEach((s) => ((rings[s] = "purple"), (ringK[s] = ramp(u, 0, 0.1, E.lin))));
        }
        if (u >= (slow ? 0.12 : 0) && u < 0.65) {
          rings[e.parentSlot] = "orange";
          ringK[e.parentSlot] = ramp(u, slow ? 0.12 : 0, slow ? 0.25 : 0.12, E.lin);
        }
        if (wk >= 0) {
          if (u >= 0.3 && u < 0.65) {
            rings[wk] = "red";
            ringK[wk] = ramp(u, 0.3, 0.42, E.lin);
          }
          if (u < 0.65) sc[wk] = Math.min(sc[wk], 1 - ramp(u, 0.4, 0.65, E.in));
          else {
            pos[wk] = e.child;
            sc[wk] = 0.3 + 0.7 * E.pop(ramp(u, 0.65, 0.95, E.lin));
          }
        }
      });
      // duplicates stand on top of each other
      const seen = {};
      members.forEach((m, j) => {
        const r = (seen[pos[j]] = (seen[pos[j]] || 0) + 1) - 1;
        m.set({ i: pos[j], dy: -r * STACK, s: sc[j], o: sc[j] > 0.01 ? 1 : 0, ring: rings[j], ringK: ringK[j] });
      });
      // ghost children and discarded crosses
      ghosts.forEach((g, k) => {
        const e = LOG[k];
        const u = clamp((t - stepT(k)) / stepD(k));
        if (t < stepT(k) + 0.15 * stepD(k) || (e.replaced && u >= 0.65)) return g.set({ o: 0 });
        const hp2 = L3.hop(e.parentAt, e.child, ramp(u, 0.2, 0.62, E.lin), 46);
        const o = e.replaced ? fade(u, 0.15, 0.08) : 1 - ramp(u, 0.7, 0.98, E.lin);
        g.set({ i: hp2.i, dy: hp2.dy, o, ring: null });
      });
      bads.forEach((b, k) => {
        const e = LOG[k];
        const u = clamp((t - stepT(k)) / stepD(k));
        if (e.replaced || u < 0.6) return b.set({ o: 0 });
        b.set({ icon: "cross", i: e.child, dy: 8, k: ramp(u, 0.6, 0.85, E.lin), o: 1 - ramp(u, 0.9, 1.0, E.lin) });
      });

      // hills pill
      const done = LOG.filter((_, k) => t >= stepT(k) + 0.65 * stepD(k)).length;
      const n = done ? LOG[done - 1].hills : 3;
      const last = done ? stepT(done - 1) + 0.65 * stepD(done - 1) : -9;
      const bump =
        1 +
        0.12 *
          V.flash(t, last, last + 0.3) *
          +(done > 0 && LOG[done - 1].hills !== (done > 1 ? LOG[done - 2].hills : 3));
      pill.set({
        text: `hills: ${n}`,
        tone: n === 1 ? "green" : "blue",
        s: bump * (0.8 + 0.2 * pop(t, 3.1, 0.4)),
        o: fade(t, 3.1, 0.1),
      });

      // bottom strip
      const kS = pop(t, CHIP1, 0.4);
      const kR = pop(t, CHIP2, 0.4);
      chipS.set({ state: "active", tone: "orange", pop: kS, pulse: ramp(t, CHIP1, CHIP1 + 0.3, E.lin) < 1 ? 0 : 0 });
      chipR.set({ state: "active", tone: "purple", pop: kR });
      V.show(selIcon, fade(t, CHIP1, 0.1));
      iconPop(selIcon, 120, kS);
      const rk = ramp(t, CHIP1 + 0.4, CHIP1 + 0.8);
      ring.setAttribute("r", (17 + (1 - rk) * 12).toFixed(1));
      V.show(ring, rk * 3);
      V.show(recIcon, fade(t, CHIP2, 0.1));
      iconPop(recIcon, 500, kR);
      const sw = ramp(t, SWAP[0], SWAP[1], E.inOut);
      tiles.forEach((q) => {
        const tail = q.c >= 3;
        const dy = tail ? (q.row ? -24 : 24) * sw : 0;
        q.r.setAttribute(
          "transform",
          `translate(0 ${(dy - (tail ? 8 * Math.sin(Math.PI * sw) * (q.row ? -1 : 1) : 0)).toFixed(1)})`,
        );
      });
    };
  }

  V.scene({
    kicker: "POPULATIONS",
    title: ["Send a whole team", "up the hills"],
    dur: 12,
    caps: [
      [0.4, 2.4, "One hiker is stuck on one hill."],
      [2.6, 4.3, "A team starts on many hills."],
      [4.5, 6.4, "A low score can still climb the tallest hill."],
      [6.6, 9.2, "The team gathers on the best hill."],
      [9.4, 11.5, "A team makes selection and recombination possible."],
    ],
    build,
  });
})();
