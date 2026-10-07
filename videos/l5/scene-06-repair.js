/* Lecture 5 · Encodings, scene 06-repair: the two broken children of scene 05 are fixed by "repair". The repeated city is
   found, the second copy is lifted out and the missing city flies into its slot along an arc, so each child is a valid tour.
   Story (local seconds): 0-1.5 children, damage and broken routes appear, a copy / swap / repair strip (copy and swap already
   ticked), 1.9 repair lights up purple, 2.5 and 3.3 the repeat and the missing city are pointed out, 4.2 child 1 is repaired
   (lift, fly, turn green, route and badge become valid), 6.6 child 2 the same, 9.6 repair is ticked, 10 a dot walks each
   repaired tour while the matching gene bumps. */
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
  const Y0 = [100, 362]; // top of each child's block
  const ROW_Y = Y0.map((y) => y + 54);
  const BAND_Y = ROW_Y.map((y) => y + SZ + 16); // under the genes: badge and the missing city
  const slotX = (i) => BX + i * (SZ + GAP) + SZ / 2; // centre of a gene slot
  const BADGE = { w: 262, h: 64 };
  const GHOST = 64; // the missing city, shown as a dashed tile
  const MISS_X = BX + BADGE.w + 18; // the "missing" tag, then the missing city on its right
  const GHOST_X = MISS_X + 134 + 12;
  const MAP = { x: 562, w: 320, h: 240 };
  const PILL = { w: 190, h: 54, gap: 64, y: 20 };
  const pillX = (i) => (936 - (3 * PILL.w + 2 * PILL.gap)) / 2 + i * (PILL.w + PILL.gap);
  const BOW = [30, 36]; // how far each flight bends away from a straight line

  // ---- timeline (seconds)
  const T = {
    pill: [0.6, 0.9, 1.2], // copy, swap, repair appear
    light: 1.9, // repair turns purple
    find: 2.5, // the repeated city is pointed out
    miss: 3.3, // the missing city is pointed out
    start: [4.3, 6.6], // each child's repair begins
    done: 9.8, // repair gets its tick
    dot: 10.3, // a ring walks the repaired tours
    hop: 0.4,
  };
  // one child's repair, in seconds after its start
  const R = { lift: [0, 0.4], leave: [0.35, 0.7], fly: [0.6, 1.4], mix: [1.5, 2.1], sweep: 2.1, badge: [2.35, 3.0] };

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

  /* one step of the strip: a pill with a round icon (plus while waiting or active, tick when done) */
  function makePill(parent, i, text) {
    const style = { ...box(pillX(i), PILL.y, PILL.w, PILL.h), ...centred, gap: "10px", fontSize: "32px" };
    const el = parent.appendChild(V.h("div", { class: "v-tag c-grey", style }));
    const ic = V.s("svg", { width: 38, height: 38, viewBox: "0 0 38 38" });
    const disc = V.s("circle", { cx: 19, cy: 19, r: 17 });
    const tickG = L5.tick(19, 19, 24, "green", { on: true, w: 5 });
    const plus = V.s("path", {
      d: "M 19 10 L 19 28 M 10 19 L 28 19",
      fill: "none",
      "stroke-width": 5,
      "stroke-linecap": "round",
    });
    ic.append(disc, tickG, plus);
    el.append(ic, V.h("span", { text }));
    return (state, k, tickK = 1, extra = 0) => {
      const cls = { idle: "v-tag c-grey", active: "v-tag solid c-purple", done: "v-tag c-green" }[state];
      if (el.className !== cls) el.className = cls;
      el.style.boxShadow = `0 4px 0 var(--c-${state === "active" ? "lip" : "edge"})`;
      disc.style.fill = state === "done" ? "var(--c)" : "var(--panel)";
      plus.style.stroke = state === "active" ? "var(--violet-ink)" : "var(--text-dim)";
      V.show(plus, +(state !== "done"));
      V.show(tickG, +(state === "done"));
      L5.drawOn(tickG, tickK);
      V.place(el, { ...pop(k), s: (0.8 + 0.2 * E.pop(k)) * (1 + 0.12 * extra) });
    };
  }

  V.scene({
    kicker: "REPAIR",
    title: ["Fix it with", "copy, swap, repair"],
    dur: 13,
    caps: [
      [0.4, 4, "Repair: find the repeated city and the missing one."],
      [4.5, 9, "Put the missing city where the repeat was."],
      [9.5, 12.5, "Both children are valid tours again."],
    ],
    build(stage) {
      // maps first (lowest layer), then the strip
      const maps = KIDS.map((_, c) => L5.tourMap(stage, { x: MAP.x, y: Y0[c] + 2, w: MAP.w, h: MAP.h }));
      const strip = L5.svg(stage);
      const pills = ["copy", "swap", "repair"].map((text, i) => makePill(stage, i, text));
      const stripArrows = [0, 1].map((i) => {
        const y = PILL.y + PILL.h / 2;
        const a = L5.arrow(pillX(i) + PILL.w + 10, y, pillX(i + 1) - 10, y, "grey", 1, { w: 5, head: 16, ink: true });
        return strip.appendChild(a);
      });
      const ping = stage.appendChild(
        V.h("div", {
          style: {
            position: "absolute",
            ...box(pillX(2), PILL.y, PILL.w, PILL.h),
            boxSizing: "border-box",
            border: "4px solid var(--violet)",
            borderRadius: "999px",
          },
        }),
      );

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

      // the lines on top of the genes: the red bracket joining the repeat, the dotted flight path, the walking dot
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
          V.s("path", {
            d: fl.d,
            fill: "none",
            "stroke-width": 7,
            "stroke-linecap": "round",
            style: { stroke: "var(--violet)", strokeDasharray: "2 16" },
          }),
        ),
      );
      // a purple ring walks the repaired tour city by city (hollow, so the letter inside stays readable)
      const dots = KIDS.map(() => {
        const ring = V.s("circle", { cx: 0, cy: 0, r: 19, fill: "none", "stroke-width": 5 });
        ring.style.stroke = "var(--violet)";
        return over.appendChild(V.s("g", {}, ring));
      });

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
        // ---- the strip: copy and swap are done, repair lights up, then is ticked too
        pills.forEach((setPill, i) => {
          const k = ramp(t, T.pill[i], T.pill[i] + 0.4, E.lin);
          if (i < 2) return setPill("done", k, ramp(t, T.pill[i] + 0.2, T.pill[i] + 0.6, E.lin));
          const state = t >= T.done ? "done" : t >= T.light ? "active" : "idle";
          const extra = flash(t, T.light, T.light + 0.5) + flash(t, T.done, T.done + 0.5);
          setPill(state, k, ramp(t, T.done + 0.1, T.done + 0.5, E.lin), extra);
        });
        stripArrows.forEach((a, i) => L5.drawOn(a, ramp(t, T.pill[i + 1] - 0.25, T.pill[i + 1] + 0.1, E.lin)));
        const pk = ramp(t, T.light, T.light + 0.7, E.out);
        V.place(ping, { s: 1 + 0.35 * pk, o: t >= T.light ? (1 - pk) * 0.9 : 0 });

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
            const arrive = j === 0 ? T.dot - 0.35 : T.dot + (j - 0.25) * T.hop;
            const st = {
              tone: swept ? "green" : red ? "red" : TONE0[c][j],
              s: E.pop(ap) * (1 + 0.12 * hit) * (1 + 0.1 * flash(t, sweepT(j), sweepT(j) + 0.4)),
              y: (1 - E.out(ap)) * -20 - 14 * flash(t, arrive - 0.12, arrive + 0.3),
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

          // ---- the empty slot and the dotted flight path
          const holeK = ramp(t, s0 + 0.3, s0 + 0.6, E.lin) * (landed ? 0 : 1);
          V.place(holes[c], { s: 0.85 + 0.15 * E.pop(ramp(t, s0 + 0.3, s0 + 0.7, E.lin)), o: holeK });
          V.show(
            guides[c],
            ramp(t, s0 + 0.35, s0 + 0.6, E.lin) * (1 - ramp(t, s0 + 0.95, s0 + R.fly[1] - 0.05, E.lin)),
          );

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

          // ---- the dot walks the repaired tour, one city per gene
          const h = clamp((t - T.dot) / T.hop, 0, N);
          const seg = Math.min(Math.floor(h), N - 1);
          const [a, b] = [maps[c].pt(FIXED[c][seg]), maps[c].pt(FIXED[c][(seg + 1) % N])];
          const fr = ramp(h - seg, 0, 0.75, E.inOut);
          const dk =
            ramp(t, T.dot - 0.6, T.dot - 0.3, E.lin) * (1 - ramp(t, T.dot + N * T.hop, T.dot + N * T.hop + 0.3, E.lin));
          V.place(dots[c], { x: lerp(a.x, b.x, fr), y: lerp(a.y, b.y, fr), s: 0.6 + 0.4 * E.pop(dk), o: dk });
        });
      };
    },
  });
})();
