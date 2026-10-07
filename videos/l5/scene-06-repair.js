/* Lecture 5 · Encodings, scene 06-repair: the two broken children of scene 05 are fixed by "repair". The repeated city and the
   missing city are pointed out, then the missing city flies along a purple arrow into the repeat's slot, so each child is a
   valid tour again.
   Story (local seconds): 0-2 children, damage and broken routes appear, 2 and 2.8 the repeat and the missing city are pointed
   out, 3.6 child 1 is repaired (lift, fly, turn green, route and badge become valid), 7.2 child 2 the same. */
(function () {
  const V = window.VID;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---- the algorithm: the children from scene 05 and their repairs (all computed, nothing typed in)
  const PARENTS = ["ADECB", "AECDB"];
  const CUT = 2;
  const KIDS = L5.cross1(PARENTS[0], PARENTS[1], CUT); // ADCDB, AEECB
  const FIXED = KIDS.map((k) => L5.repair(k)); // ADCEB, AEDCB
  const FIX = KIDS.map((k) => L5.repairSteps(k)[0]); // the one swap-in per child: {i, from, to}
  if (!FIXED.every((f) => L5.isPerm(f))) throw new Error("repair scene: a repaired child must be a permutation");
  const BAD = KIDS.map((k) => L5.dupIdx(k)); // genes that repeat a city
  const FIRST = KIDS.map((k, c) => k.indexOf(FIX[c].from)); // the first copy of the repeat stays where it is
  // colour of each gene = the parent it came from (blue parent 1, purple parent 2), as in scene 05
  const TONE0 = KIDS.map((k, c) => [...k].map((_, i) => (i < CUT === (c === 0) ? "blue" : "purple")));
  const N = KIDS[0].length;

  // ---- layout (stage px): top strip, then one block per child: tag, genes, badge + missing city, and a map on the right
  const SZ = 88;
  const GAP = 12;
  const BX = 12;
  const Y0 = [40, 330]; // top of each child's block
  const ROW_Y = Y0.map((y) => y + 54);
  const BAND_Y = ROW_Y.map((y) => y + SZ + 16); // under the genes: badge and the missing city
  const slotX = (i) => BX + i * (SZ + GAP) + SZ / 2; // centre of a gene slot
  const BADGE = { w: 262, h: 64 };
  const GHOST = 64; // the missing city, shown as a dashed tile
  const MISS_X = BX + BADGE.w + 18; // the "missing" tag, then the missing city on its right
  const GHOST_X = MISS_X + 134 + 12;
  const MAP = { x: 562, w: 320, h: 240 };
  const BOW = [30, 36]; // how far each flight bends away from a straight line

  // ---- timeline (seconds)
  const T = {
    find: 2.0, // the repeated city is pointed out
    miss: 2.8, // the missing city is pointed out
    start: [3.6, 7.2], // each child's repair begins
  };
  // one child's repair, in seconds after its start
  const R = { lift: [0, 0.5], leave: [0.4, 0.9], fly: [1.0, 2.0], mix: [2.1, 2.7], sweep: 2.7, badge: [2.9, 3.5] };

  const f1 = (n) => n.toFixed(1);
  const centred = { padding: "0", display: "flex", alignItems: "center", justifyContent: "center" };
  const box = (x, y, w, h) => ({ left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
  const pop = (k, dy = 8) => ({ s: 0.8 + 0.2 * E.pop(k), y: (1 - E.out(k)) * dy, o: clamp(k * 3) });

  /* a quadratic arc from a to b that bends sideways by `bow` px: {at(p) point, d path data} */
  function arc(a, b, bow) {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const u = { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
    const c = { x: (a.x + b.x) / 2 + u.y * bow * 2, y: (a.y + b.y) / 2 - u.x * bow * 2 };
    const at = (p) => ({
      x: (1 - p) * (1 - p) * a.x + 2 * (1 - p) * p * c.x + p * p * b.x,
      y: (1 - p) * (1 - p) * a.y + 2 * (1 - p) * p * c.y + p * p * b.y,
    });
    return { at, d: `M ${f1(a.x)} ${f1(a.y)} Q ${f1(c.x)} ${f1(c.y)} ${f1(b.x)} ${f1(b.y)}` };
  }

  V.scene({
    kicker: "REPAIR",
    title: ["Repair: swap the repeat", "for the missing city"],
    dur: 13,
    caps: [
      [0.4, 3.4, "Repair: find the repeated city and the missing one."],
      [3.7, 10.4, "Put the missing city where the repeat was."],
      [10.8, 12.6, "Both children are valid tours again."],
    ],
    build(stage) {
      // the maps (lowest layer)
      const maps = KIDS.map((_, c) => L5.tourMap(stage, { x: MAP.x, y: Y0[c] + 2, w: MAP.w, h: MAP.h }));

      // one block per child
      const rows = KIDS.map((k, c) =>
        L5.chromosome(stage, { x: BX, y: ROW_Y[c], genes: k, size: SZ, gap: GAP, tones: TONE0[c] }),
      );
      const tags = KIDS.map((_, c) =>
        stage.appendChild(
          V.h("div", {
            class: "v-tag c-grey",
            text: `child ${c + 1}`,
            style: { ...box(BX, Y0[c], 136, 44), ...centred },
          }),
        ),
      );
      const badges = KIDS.map((_, c) =>
        L5.badge(stage, { x: BX, y: BAND_Y[c], w: BADGE.w, h: BADGE.h, valid: "valid tour" }),
      );
      const holes = KIDS.map((_, c) =>
        stage.appendChild(
          V.h("div", {
            class: "v-gene ghost c-purple",
            style: { ...box(BX + FIX[c].i * (SZ + GAP), ROW_Y[c], SZ, SZ), borderColor: "var(--violet)" },
          }),
        ),
      );
      const missTags = KIDS.map((_, c) =>
        stage.appendChild(
          V.h("div", {
            class: "v-tag c-orange",
            text: "missing",
            style: { ...box(MISS_X, BAND_Y[c] + 9, 134, 46), ...centred },
          }),
        ),
      );

      // the lines on top of the genes: the red bracket joining the repeat, the flight path
      const over = L5.svg(stage);
      const ghostC = (c) => ({ x: GHOST_X + GHOST / 2, y: BAND_Y[c] + BADGE.h / 2 });
      const holeC = (c) => ({ x: slotX(FIX[c].i), y: ROW_Y[c] + SZ / 2 });
      const flights = KIDS.map((_, c) => arc(ghostC(c), holeC(c), BOW[c]));
      const brackets = KIDS.map((_, c) => {
        const [xa, xb] = [slotX(FIRST[c]), slotX(FIX[c].i)];
        const [y0, y1] = [ROW_Y[c] - 4, ROW_Y[c] - 19];
        const d = `M ${xa} ${y0} L ${xa} ${y1} L ${xb} ${y1} L ${xb} ${y0}`;
        const path = V.s("path", {
          d,
          fill: "none",
          pathLength: "1",
          "data-draw": "1",
          "stroke-width": 5,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: { stroke: "var(--rose)" },
        });
        return over.appendChild(V.s("g", {}, path));
      });
      const guides = flights.map((fl) =>
        over.appendChild(
          V.s(
            "g",
            {},
            V.s("path", {
              d: fl.d,
              fill: "none",
              pathLength: "1",
              "data-draw": "1",
              "stroke-width": 7,
              "stroke-linecap": "round",
              style: { stroke: "var(--violet)" },
            }),
          ),
        ),
      );
      // the missing city: a dashed tile that turns solid orange and flies into the empty slot
      const ghosts = KIDS.map((_, c) =>
        stage.appendChild(
          V.h("div", {
            class: "v-gene ghost c-orange",
            text: FIX[c].to,
            style: { ...box(GHOST_X, BAND_Y[c], GHOST, GHOST), fontSize: "36px" },
          }),
        ),
      );

      return (t) => {
        KIDS.forEach((kid, c) => {
          const [s0, d, f] = [T.start[c], 0.2 * c, FIX[c]];
          const landT = s0 + R.fly[1];
          const landed = t >= landT;
          const flyP = ramp(t, s0 + R.fly[0], s0 + R.fly[1], E.inOut);
          const sweepT = (j) => s0 + R.sweep + 0.08 * j;

          // ---- the genes: red repeat, lift the second copy out, the missing city lands, everything turns green
          rows[c].all((j) => {
            const ap = ramp(t, 0.1 + d + 0.07 * j, 0.5 + d + 0.07 * j, E.lin);
            const swept = t >= sweepT(j);
            const isBad = BAD[c].includes(j);
            const red = isBad && (j === f.i || t < s0);
            const hit =
              isBad && t < s0 ? flash(t, T.find + (j === f.i ? 0.15 : 0), T.find + (j === f.i ? 0.15 : 0) + 0.6) : 0;
            const st = {
              tone: swept ? "green" : red ? "red" : TONE0[c][j],
              s: E.pop(ap) * (1 + 0.12 * hit) * (1 + 0.1 * flash(t, sweepT(j), sweepT(j) + 0.4)),
              y: (1 - E.out(ap)) * -20,
              o: clamp(ap * 4),
            };
            if (j !== f.i) return st;
            if (landed) {
              const pulse = 1 + 0.12 * flash(t, landT, landT + 0.4);
              return { ...st, text: f.to, tone: swept ? "green" : "orange", solid: !swept, s: st.s * pulse };
            }
            const lift = ramp(t, s0 + R.lift[0], s0 + R.lift[1], E.out);
            const leave = ramp(t, s0 + R.leave[0], s0 + R.leave[1], E.in);
            return {
              ...st,
              y: st.y - 34 * lift - 44 * leave,
              r: -7 * lift - 4 * leave,
              s: st.s * (1 + 0.08 * lift) * (1 - 0.45 * leave),
              o: st.o * (1 - leave),
            };
          });

          // ---- the red bracket joins the two copies; it goes when the repair starts
          const bk = ramp(t, T.find - 0.1, T.find + 0.45, E.inOut);
          L5.drawOn(brackets[c], bk);
          V.show(brackets[c], 1 - ramp(t, s0, s0 + 0.3, E.lin));

          // ---- the empty slot and the purple flight path
          const holeK = ramp(t, s0 + 0.3, s0 + 0.6, E.lin) * (landed ? 0 : 1);
          V.place(holes[c], { s: 0.85 + 0.15 * E.pop(ramp(t, s0 + 0.3, s0 + 0.7, E.lin)), o: holeK });
          L5.drawOn(guides[c], ramp(t, s0 + 0.5, s0 + R.fly[0], E.inOut));
          V.show(guides[c], 1 - ramp(t, landT, landT + 0.4, E.lin));

          // ---- the missing city: pulses, then turns solid orange and flies along the arc
          const p0 = ghostC(c);
          const pt = flights[c].at(flyP);
          const flying = t >= s0 + R.fly[0] - 0.05;
          const gh = ghosts[c];
          const cls = `v-gene c-orange${flying ? " solid" : " ghost"}`;
          if (gh.className !== cls) gh.className = cls;
          gh.style.borderColor = flying ? "" : "var(--amber)";
          const gk = ramp(t, 0.7 + d, 1.1 + d, E.lin);
          V.place(gh, {
            x: pt.x - p0.x,
            y: pt.y - p0.y,
            s:
              E.pop(gk) *
              lerp(1, SZ / GHOST, flyP) *
              (1 + 0.12 * Math.sin(Math.PI * flyP)) *
              (1 + 0.15 * (flying ? 0 : flash(t, T.miss, T.miss + 0.6))),
            r: 0,
            o: landed ? 0 : clamp(gk * 4),
          });
          const mk = ramp(t, 0.8 + d, 1.2 + d, E.lin);
          const mOut = ramp(t, s0 + R.fly[0] - 0.35, s0 + R.fly[0] - 0.05, E.lin);
          V.place(missTags[c], {
            ...pop(mk),
            s: (0.8 + 0.2 * E.pop(mk)) * (1 + 0.1 * flash(t, T.miss, T.miss + 0.6)),
            o: clamp(mk * 3) * (1 - mOut),
          });

          // ---- tag and badge: not a tour, then valid
          V.place(tags[c], pop(ramp(t, 0.1 + d, 0.5 + d, E.lin)));
          const bIn = ramp(t, 0.6 + d, 1.1 + d, E.lin);
          const [bOut0, bOut1] = [s0 + R.badge[0], s0 + R.badge[0] + 0.15];
          if (t < bOut0) badges[c]("invalid", bIn);
          else if (t < bOut1) badges[c]("invalid", 1 - ramp(t, bOut0, bOut1, E.lin));
          else badges[c]("valid", ramp(t, bOut1, s0 + R.badge[1], E.lin));

          // ---- the map: broken route (red, ringed cities), then the repaired one (green)
          const pulse = t < T.miss - 0.05 ? (t - T.find) / 0.8 : (t - T.miss) / 0.8;
          maps[c].update({
            order: kid,
            order2: FIXED[c],
            mix: ramp(t, s0 + R.mix[0], s0 + R.mix[1], E.inOut),
            tone: "red",
            tone2: "red",
            edgeTones2: Array.from({ length: N }, (_, j) => (t >= sweepT(j) ? "green" : "red")), // arrow j = gene j to gene j+1
            litTone: t >= sweepT(1) ? "green" : "red",
            draw: ramp(t, 0.4 + d, 1.5 + d, E.lin),
            draw2: 1,
            dup: L5.dupsOf(kid),
            miss: L5.missingOf(kid),
            dup2: [],
            miss2: [],
            labels: false,
            ringK: ramp(t, 1.4 + d, 1.9 + d, E.lin),
            pulse,
            o: ramp(t, 0.15 + d, 0.5 + d, E.lin),
          });
        });
      };
    },
  });
})();
