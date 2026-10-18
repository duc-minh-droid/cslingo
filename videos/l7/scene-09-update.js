/* Lecture 7 · scene-09-update: after a whole tour the trails update in TWO steps. EVAPORATE: every road keeps half of its
   pheromone (x 0.5). DEPOSIT: every road of the tour gains Q / tour length = 72 / 18 = 4. Roads the ant skipped only lose. The same
   four-town map as scene 8, starting from its end state (the orange tour A-C-B-D-A, the ant home on A). Every number comes from
   L7.UPDATE (asserted below and again at the first and last frame). Local seconds: 0.15-1.0 the map (the roads start after the towns
   have popped), the tour tiles and the pills with the START values (0.6, with the blue tag 'pheromone on each road'), 1.4-2.0 the
   Evaporate card, 2.6-3.8 every pill counts down to half while purple bubbles rise off the roads and the trails thin out, 4.6-5.2 the
   Deposit card, 5.8-7.6 the ant walks its tour again and each tour road in turn gains 4 (a '+4' floats up, the pill counts up, the
   trail thickens), 7.6-8.2 the 'skipped roads only lose' tag and purple halos under A-B and C-D, 8.2-11 hold. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const L5 = V.l5;
  const E = V.ease;
  const { ramp, clamp, flash } = V;
  const lin = E.lin;
  const f1 = (n) => n.toFixed(1);

  // ---------- facts (asserted: a wrong number throws) ----------
  const U = L7.UPDATE;
  const KEYS = L7.MAP.roads;
  const TOUR = L7.WALK.tour; // A C B D
  const HOPS = TOUR.map((a, i) => [a, TOUR[(i + 1) % TOUR.length]]); // A>C, C>B, B>D, D>A
  const TOUR_KEYS = HOPS.map(([a, b]) => L7.ek(a, b));
  const SKIPPED = KEYS.filter((k) => !U.tourRoads.includes(k));
  const VALUES = (name) => KEYS.map((k) => U.roads[k][name]);
  L7.same("scene 9 rules (rho, Q, length, deposit)", [U.rho, U.Q, U.len, U.dep], [0.5, 72, 18, 4]);
  L7.same("scene 9 deposit is Q / length", U.Q / U.len, U.dep);
  L7.same(
    "scene 9 tour length is the sum of the hops",
    L7.WALK.hops.reduce((a, b) => a + b, 0),
    U.len,
  );
  L7.same("scene 9 start values", VALUES("start"), [24, 40, 10, 30, 20, 10]);
  L7.same(
    "scene 9 start values are the map's",
    VALUES("start"),
    KEYS.map((k) => L7.MAP.tau0[k]),
  );
  L7.same("scene 9 values after evaporation", VALUES("evap"), [12, 20, 5, 15, 10, 5]);
  L7.same("scene 9 values after the deposit", VALUES("after"), [12, 24, 9, 19, 14, 5]);
  L7.same("scene 9 the tour's roads in the order walked", TOUR_KEYS, ["A-C", "B-C", "B-D", "A-D"]);
  L7.same("scene 9 the tour's roads are the update's", [...TOUR_KEYS].sort(), [...U.tourRoads].sort());
  L7.same("scene 9 skipped roads", SKIPPED, ["A-B", "C-D"]);
  KEYS.forEach((k) => {
    const r = U.roads[k];
    L7.same(`scene 9 ${k} halves`, r.evap, r.start * U.rho);
    L7.same(`scene 9 ${k} gains 4 only on the tour`, r.add, U.tourRoads.includes(k) ? 4 : 0);
  });

  // ---------- timing ----------
  const EV = [2.6, 3.8]; // the pills count down
  const EV_TINT = [2.5, 4.0]; // the pills stay purple a little longer than they count
  const DEP0 = 5.8; // the first road gains
  const DEP_STEP = 0.45; // one road after the next
  const DEP_DUR = 0.4; // a pill counts up in this long
  const PLUS_DUR = 0.9; // a '+4' pops beside its pill, stays at full strength and fades at the very end
  const dep0 = (i) => DEP0 + DEP_STEP * i;
  const HOME_TURN = dep0(HOPS.length - 1) + DEP_DUR + 0.1; // once home, the ant turns to face right again
  const NOTE = [7.6, 8.2]; // the skipped roads: tag, halos, purple pills

  // the tau of every road at time t (the pills and the trail widths read the same numbers)
  const tauAt = (t) => {
    const e = ramp(t, EV[0], EV[1], E.inOut);
    return Object.fromEntries(
      KEYS.map((k) => {
        const r = U.roads[k];
        const i = TOUR_KEYS.indexOf(k);
        const g = i < 0 ? 0 : ramp(t, dep0(i), dep0(i) + DEP_DUR, E.inOut);
        return [k, r.start + (r.evap - r.start) * e + r.add * g];
      }),
    );
  };
  L7.same(
    "scene 9 numbers at the first frame",
    KEYS.map((k) => Math.round(tauAt(0)[k])),
    VALUES("start"),
  );
  L7.same(
    "scene 9 numbers after evaporating",
    KEYS.map((k) => Math.round(tauAt(5)[k])),
    VALUES("evap"),
  );
  L7.same(
    "scene 9 numbers at the last frame",
    KEYS.map((k) => Math.round(tauAt(11)[k])),
    VALUES("after"),
  );

  // ---------- layout (stage px) ----------
  const MAP_BOX = { x: 12, y: 44, w: 480, h: 300 }; // the same place as scenes 8 and 10
  const MEM_Y = 372; // the tour memory, where scene 8 left it
  const TILES = { x: 16, y: 440, size: 80, gap: 12 };
  const LEN_CARD = { x: TILES.x, y: 536, w: 5 * TILES.size + 4 * TILES.gap, h: 80 };
  const RX = 520;
  const RW = 392; // the right panel ends 12 px inside the stage, so a pulsing card stays inside it
  const SIDE = { "A-C": [61, 24], "B-C": [-66, -4], "B-D": [62, 9], "A-D": [73, -4] }; // where a '+4' pops, from its pill's centre
  const LIFT = 34; // the ant stands this far above its town (keeps its feelers inside the stage margin)
  const BUBBLES = { 0.5: [0.2, 0.8], 0.55: [0.2, 0.84], 0.36: [0.17, 0.7] }; // where vapour rises, by where the road's pill sits
  const PILL_AT = { "A-B": 0.5, "A-C": 0.55, "A-D": 0.36, "B-C": 0.36, "B-D": 0.55, "C-D": 0.5 };
  const BUB = { n: 2, life: 0.9, rise: 36 };

  V.scene({
    kicker: "UPDATING TRAILS",
    title: ["Evaporate first,", "then deposit"],
    dur: 11,
    caps: [
      [0.5, 2.5, "Tour done. Now the trails update."],
      [2.6, 4.9, "In this example, each road keeps half."],
      [5.2, 7.4, "Then each tour road gains Q ÷ length."],
      [7.7, 9.9, "Skipped roads only lose pheromone."],
    ],
    build(stage) {
      const purple = L7.tone("purple");
      const blue = L7.tone("blue");
      const orange = L7.tone("orange");

      // purple halos under the two skipped roads sit under the map's own roads, so they can fade in
      const halo = V.s("svg", {
        width: 936,
        height: 640,
        style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
      });
      const M = L7.map(stage, MAP_BOX);
      M.el.before(halo);
      const bandOf = (keys, colour) =>
        Object.fromEntries(
          keys.map((k) => {
            const { A, B } = M.road(k);
            return [
              k,
              halo.appendChild(
                V.s("path", {
                  d: `M ${f1(A.x)} ${f1(A.y)} L ${f1(B.x)} ${f1(B.y)}`,
                  fill: "none",
                  "stroke-linecap": "round",
                  style: { stroke: colour },
                }),
              ),
            ];
          }),
        );
      const halos = bandOf(SKIPPED, purple.edge); // purple bands under the two skipped roads
      const tourBands = bandOf(U.tourRoads, orange.edge); // orange bands under the tour the ant walked (the blue trail stays visible)

      // vapour: purple rings that rise off every road while it evaporates (between the roads and the pills)
      const vapour = V.s("svg", {
        width: 936,
        height: 640,
        style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
      });
      M.el.after(vapour);
      const bubbles = KEYS.flatMap((k, ki) => {
        const { A, B } = M.road(k);
        return BUBBLES[PILL_AT[k]].slice(0, BUB.n).map((f, j) => ({
          x: A.x + (B.x - A.x) * f,
          y: A.y + (B.y - A.y) * f - 12,
          t0: EV[0] + 0.04 * ki + 0.14 * j,
          el: vapour.appendChild(
            V.s("circle", { r: 8, fill: "none", "stroke-width": "5", style: { stroke: purple.c } }),
          ),
        }));
      });
      L7.same(
        "scene 9 vapour ends before the count does",
        Math.max(...bubbles.map((b) => b.t0 + BUB.life)) <= EV[1] + 0.35,
        true,
      );

      // the ant's turning: the heading of each hop, unwrapped so it always turns the short way
      const headings = HOPS.reduce((acc, [a, b]) => {
        const prev = acc.length ? acc[acc.length - 1] : 0;
        let r = M.edgePt(a, b, 0).r;
        while (r - prev > 180) r -= 360;
        while (r - prev < -180) r += 360;
        return [...acc, r];
      }, []);

      // the tour as tiles under the map, and its length
      const memTag = L7.tag(stage, { x: 16, y: MEM_Y, text: "tour memory", tone: "grey" });
      const row = L5.chromosome(stage, {
        x: TILES.x,
        y: TILES.y,
        genes: "ACBDA",
        size: TILES.size,
        gap: TILES.gap,
        tone: "orange",
      });
      const lenCard = L7.card(stage, {
        x: LEN_CARD.x,
        y: LEN_CARD.y,
        w: LEN_CARD.w,
        h: LEN_CARD.h,
        tone: "orange",
        plain: true,
      });
      L7.text(lenCard.el, { x: 24, y: 20, text: "tour length", fs: 32, tone: "orange" });
      L7.text(lenCard.el, {
        x: LEN_CARD.w - 24 - 120 - 6,
        y: 7,
        w: 120,
        text: String(U.len),
        fs: 56,
        tone: "orange",
        align: "right",
      });

      // right panel: what the pills count, then Evaporate, Deposit, and the note about skipped roads
      const pherTag = L7.tag(stage, { x: RX, y: 12, text: "pheromone on each road", tone: "blue" });
      const card1 = L7.card(stage, { x: RX, y: 84, w: RW, h: 150, tone: "purple", plain: true });
      L7.text(card1.el, { x: 24, y: 14, text: "Evaporate", fs: 40, tone: "purple" });
      L7.text(card1.el, { x: 24, y: 88, text: "every road keeps half", fs: 28, tone: "dim", bold: false });
      L7.text(card1.el, {
        x: RW - 24 - 160 - 6,
        y: 2,
        w: 160,
        text: `× ${U.rho}`,
        fs: 56,
        tone: "purple",
        align: "right",
      });
      const card2 = L7.card(stage, { x: RX, y: 252, w: RW, h: 226, tone: "blue", plain: true });
      L7.text(card2.el, { x: 24, y: 14, text: "Deposit", fs: 40, tone: "blue" });
      L7.text(card2.el, { x: 24, y: 66, text: "tour roads gain Q ÷ length", fs: 28, tone: "dim", bold: false });
      L7.text(card2.el, { x: 24, y: 100, text: `Q = ${U.Q}, fixed per ant`, fs: 28, tone: "dim", bold: false });
      const eq = V.h("div", {
        class: "v-text",
        style: { left: "24px", top: "140px", fontSize: "56px", fontWeight: "900" },
        html: `<span style="color:${blue.ink}">${U.Q}</span> ÷ <span style="color:${orange.ink}">${U.len}</span> = <span style="color:${blue.ink}">${U.dep}</span>`,
      });
      card2.el.append(eq);
      const note = L7.tag(stage, { x: RX, y: 498, text: "skipped roads only lose", tone: "purple" });

      // the '+4' that pops beside each tour road's pill as it gains
      const plus = TOUR_KEYS.map((k) => {
        const c = M.pillAt(k);
        const [dx, dy] = SIDE[k];
        return L7.text(stage, {
          x: c.x + dx - 45,
          y: c.y + dy - 22,
          w: 90,
          text: `+${U.dep}`,
          fs: 38,
          tone: "blue",
          align: "center",
        });
      });

      // the ant starts at home on A; later it walks its tour again, one hop per road that gains
      const antPose = (t) => {
        const done = HOPS.map((_h, i) => ramp(t, dep0(i), dep0(i) + DEP_DUR, E.inOut));
        let i = -1;
        done.forEach((f, j) => {
          if (f > 0) i = j;
        });
        if (i < 0) return { ...M.antAt("A", "A", 0, 0, LIFT), r: 0 };
        const [a, b] = HOPS[i];
        const q = M.antAt(a, b, done[i], 24, LIFT);
        const prev = i ? headings[i - 1] : 0;
        const turn = i === HOPS.length - 1 ? (360 - headings[i]) * ramp(t, HOME_TURN, HOME_TURN + 0.5, E.inOut) : 0;
        return { x: q.x, y: q.y, r: prev + (headings[i] - prev) * ramp(done[i], 0, 0.3, E.out) + turn };
      };

      return (t) => {
        const tau = tauAt(t);
        const evapTint = t >= EV_TINT[0] && t < EV_TINT[1];

        // ---- the map: build, tour roads orange, pills with the live numbers ----
        const pop = (i) => L7.seq(t, 0.15, 0.06, 0.35, i);
        const pills = Object.fromEntries(
          KEYS.map((k, i) => {
            const gi = TOUR_KEYS.indexOf(k);
            const gaining = gi >= 0 && t >= dep0(gi) - 0.05 && t < dep0(gi) + DEP_DUR + 0.25;
            const lost = SKIPPED.includes(k) && t >= NOTE[0] + 0.1; // only ever lost pheromone: purple, the colour of evaporation
            const tone = evapTint || lost ? "purple" : "blue";
            const bump = gaining
              ? flash(t, dep0(gi), dep0(gi) + 0.5)
              : lost
                ? flash(t, NOTE[0] + 0.1, NOTE[1] + 0.2)
                : 0;
            return [
              k,
              {
                text: String(Math.round(tau[k])),
                tone,
                solid: evapTint || gaining,
                k: L7.seq(t, 0.6, 0.05, 0.35, i),
                s: 1 + 0.1 * bump,
              },
            ];
          }),
        );
        M.update({
          grow: ramp(t, 0.35, 1.0, E.out),
          tau,
          pills,
          towns: Object.fromEntries(
            [..."ABCD"].map((n, i) => [
              n,
              { tone: "orange", solid: n === "A", s: 0.7 + 0.3 * E.pop(pop(i)), o: Math.min(1, pop(i) * 4) },
            ]),
          ),
          ant: { ...antPose(t), o: ramp(t, 0.7, 1.0, lin) },
        });

        // ---- halos under the skipped roads fade in with their tag ----
        const tk = ramp(t, 0.35, 0.8, lin);
        U.tourRoads.forEach((k) => {
          tourBands[k].setAttribute("stroke-width", f1(L7.trailW(tau[k], 0.5) + 26));
          V.show(tourBands[k], tk);
        });
        const hk = ramp(t, NOTE[0], NOTE[1], lin);
        SKIPPED.forEach((k) => {
          halos[k].setAttribute("stroke-width", f1(L7.trailW(tau[k], 0.5) + 26));
          V.show(halos[k], hk);
        });
        note.set({ k: ramp(t, NOTE[0], NOTE[0] + 0.35, lin) });

        // ---- vapour while the pills count down ----
        bubbles.forEach((b) => {
          const p = (t - b.t0) / BUB.life;
          if (p <= 0 || p >= 1) return V.show(b.el, 0);
          b.el.setAttribute("cx", f1(b.x));
          b.el.setAttribute("cy", f1(b.y - BUB.rise * E.out(p)));
          b.el.setAttribute("r", f1(7 + 6 * p));
          V.show(b.el, Math.sin(Math.PI * p));
        });

        // ---- the tour tiles and its length ----
        row.all((i) => {
          const k = L7.seq(t, 0.5, 0.07, 0.35, i);
          return { s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) };
        });
        memTag.set({ k: ramp(t, 0.5, 0.85, lin) });
        lenCard.set({ k: ramp(t, 0.9, 1.3, lin) });
        pherTag.set({ k: ramp(t, 0.6, 0.95, lin) });

        // ---- the two cards ----
        card1.set({ k: ramp(t, 1.4, 2.0, lin), s: 1 + 0.03 * flash(t, EV[0], EV[1]) });
        card2.set({ k: ramp(t, 4.6, 5.2, lin) });

        // ---- a '+4' pops beside each pill as its road gains, drifts up a little and fades ----
        plus.forEach((p, i) => {
          const q = (t - dep0(i)) / PLUS_DUR;
          const o = ramp(q, 0, 0.12, lin) * (1 - ramp(q, 0.82, 1, lin));
          p.set({
            k: 1,
            o: q <= 0 || q >= 1 ? 0 : o,
            y: -12 * E.out(clamp(q)),
            s: 0.8 + 0.2 * E.pop(ramp(q, 0, 0.3, lin)),
          });
        });
      };
    },
  });
})();
