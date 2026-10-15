/* Phase 5 · scene 05-wrap (16.7 s): GIFT WRAPPING (the Jarvis march), run for real on the seven example points (A5.WRAP). "A computer
   has no rubber band": way one is to wrap the points one corner at a time. Round 1 is the detailed one: A, the leftmost point, is
   certainly on the hull; a made-up point r straight above it gives the first angle something to be measured from; a purple line
   swings clockwise from the dashed reference and touches the points one after another, each getting its angle; G is touched first
   (43 degrees, the smallest), so A -> G becomes a hull edge. Rounds 2 to 5 repeat it from each new corner: a ring marks the corner
   we stand on, a fan of dashed rays shows the candidates, and a purple line swings clockwise from the edge just drawn (dashed
   purple, the reference) until it touches a point: the first one touched, the smallest swing, is the next corner (orange, then a
   green hull edge). Round 5 ends back at A, so the loop closes: five corners, five sweeps (the counter counts each sweep as it
   starts). A circular arrow in the right-hand strip says "clockwise". Every angle, winner and candidate count comes from A5.WRAP and
   is asserted against the storyboard when the scene is built; degrees are shown in round 1 only.
   Story (local seconds): 0.2-1.0 points, 1.6 A green + 'leftmost', 2.3-3.2 reference ray and r, 3.5-6.35 THE SWEEP (G touched at
   4.5, then B, F, E, D, C), 6.8 'smallest', 7.1-7.6 A -> G, then the rounds from 7.9, 9.8, 11.7 and 13.3, 14.8 the loop closes,
   14.8-15.4 hull tint, 15.4-17 hold. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const L5 = V.l5;
  const { ramp, flash, lerp, clamp, ease: E } = V;
  const lin = E.lin;

  const WRAP = A5.WRAP;
  const ROUNDS = WRAP.rounds;
  const HULL = WRAP.hull;
  const DEG1 = ROUNDS[0].deg;
  const EX1 = ROUNDS[0].exact;
  A5.same("scene 5: hull order", HULL, ["A", "G", "E", "D", "C"]);
  A5.same(
    "scene 5: round starts and winners",
    ROUNDS.map((r) => r.h + r.best),
    ["AG", "GE", "ED", "DC", "CA"],
  );
  A5.same(
    "scene 5: candidates per round",
    ROUNDS.map((r) => r.cands.length),
    [6, 6, 5, 4, 3],
  );
  A5.same("scene 5: round 1 reference", ROUNDS[0].ref, "up");
  A5.same("scene 5: round 1 degrees", DEG1, { B: 59, C: 97, D: 86, E: 73, F: 65, G: 43 });
  A5.close("scene 5: G is at 42.6 degrees", A5.sweepDeg("A", "G"), 42.6, 0.05);
  // the line touches the points in order of angle: the winner is always the first one
  const ORDER = Object.keys(EX1).sort((a, b) => EX1[a] - EX1[b]);
  A5.same("scene 5: the order the sweep touches the points", ORDER, ["G", "B", "F", "E", "D", "C"]);
  A5.same("scene 5: the first point touched is the winner", ORDER[0], ROUNDS[0].best);

  // ---------- the timeline ----------
  const T_A = 1.6; // A joins the hull
  const REF = [2.3, 2.9]; // the reference ray grows
  const SW0 = 3.5; // the sweep starts
  const TOUCH = [4.5, 4.9, 5.2, 5.55, 5.95, 6.35]; // when the line reaches ORDER[i]
  const FADE1 = [7.1, 7.5]; // the round 1 scaffolding (reference, rays, badges, ring) goes
  const R_LEN = [1.9, 1.9, 1.6, 1.6]; // rounds 2..5: the first two are slower, the last two quicker
  const R_SWING = [0.9, 0.9, 0.6, 0.6];
  const S0 = 0.5; // a round's swing starts this long after the round
  let at = 7.9;
  const RD = ROUNDS.slice(1).map((R, k) => {
    const s1 = S0 + R_SWING[k];
    const q = { ...R, start: at, s1, e0: s1 + 0.1, e1: s1 + 0.4, len: R_LEN[k] };
    at += R_LEN[k];
    return q;
  });
  const EDGE = [[7.2, 7.6], ...RD.map((r) => [r.start + r.e0, r.start + r.e1])]; // when hull edge i is drawn on
  const ARRIVE = EDGE.map((e) => e[1]); // hull edge i is complete: its far corner joins the list
  A5.same(
    "scene 5: the corners are reached at",
    ARRIVE.map((x) => Math.round(x * 100) / 100),
    [7.6, 9.7, 11.6, 13.2, 14.8],
  );
  const SWEEP_AT = [SW0, ...RD.map((r) => r.start + S0)]; // each sweep starts: the counter counts it
  const TILE_T = [T_A, ...ARRIVE.slice(0, 4)]; // the hull list grows: A, G, E, D, C
  const TRIM = 32; // the plot cuts a line 32 px short of a named point
  const ARC_R = 100;
  const BOX = [12, 12, 704, 628]; // swinging lines stop at the right-hand strip (x 716..924)
  const smooth = (x) => 0.5 * x + 0.5 * E.inOut(x); // slows at each touch, never stops dead

  V.scene({
    kicker: "METHOD 1: GIFT WRAPPING",
    title: ["Wrap the outside,", "one corner at a time"],
    dur: 16.7,
    caps: [
      [0.3, 1.9, "A computer has no rubber band. Way one: wrap."],
      [2, 3.4, "The leftmost point must be on the hull."],
      [3.6, 4.9, "Swing a line clockwise from r."],
      [5, 6.7, "Every point it touches gets an angle."],
      [6.8, 7.8, "Smallest angle wins: A to G."],
      [8, 10, "Repeat from G. Start the swing along the last edge."],
      [10.1, 14.4, "Each round, the first point touched is the next corner."],
      [14.6, 16.3, "Back at A. One sweep per corner: 5 sweeps."],
    ],
    build(stage) {
      const pl = A5.plot(stage, { segs: 16, arcs: 1, tags: 12, polys: 1 });
      const P = pl.pos;
      const want = {
        A: [62, 374.5],
        B: [232, 272.5],
        C: [283, 400],
        D: [521, 340.5],
        E: [657, 187.5],
        F: [385, 221.5],
        G: [351, 60],
      };
      Object.keys(want).forEach((n) =>
        [0, 1].forEach((k) => A5.close(`scene 5: ${n} position`, P[n][k], want[n][k], 1)),
      );
      const REF_TOP = 200; // the dashed reference ray runs up from A to y 200; the tag r sits on its end
      const R_TAG = [P.A[0], 176];

      /* the sweep on the drawn points: the line must hit each point exactly, in the order of its angle */
      const ANG = ORDER.map((n) => A5.cwFromUp(P.A, P[n]));
      ORDER.forEach((n, i) => A5.close(`scene 5: drawn angle of ${n}`, ANG[i], EX1[n], 0.05));
      const KNOTS = [[SW0, 0], ...ANG.map((a, i) => [TOUCH[i], a])];
      const theta = (t) => {
        if (t <= KNOTS[0][0]) return 0;
        for (let j = 0; j < KNOTS.length - 1; j++) {
          const [t0, a0] = KNOTS[j];
          const [t1, a1] = KNOTS[j + 1];
          if (t <= t1) return lerp(a0, a1, smooth(ramp(t, t0, t1, lin)));
        }
        return KNOTS[KNOTS.length - 1][1];
      };
      /* where each angle badge sits: on the side the line has already passed (anticlockwise of the ray), so the sweep never
         crosses it; G, at the top of the stage, gets its badge on its left */
      const badge = (n) => {
        if (n === "G") return [-92, 0];
        const L = A5.dist(P.A, P[n]);
        return [((P[n][1] - P.A[1]) / L) * 62, (-(P[n][0] - P.A[0]) / L) * 62];
      };

      /* rounds 2 to 5: the swing starts along the edge just drawn (back to the previous corner) and runs clockwise to the winner */
      RD.forEach((r) => {
        r.a0 = A5.angle(P[r.h], P[r.ref]);
        r.span = (((A5.angle(P[r.h], P[r.best]) - r.a0) % 360) + 360) % 360;
        A5.close(`scene 5: swing of the round from ${r.h}`, r.span, r.exact[r.best], 0.05);
        const first = r.cands.reduce((m, n) => (r.exact[n] < r.exact[m] - 1e-9 ? n : m));
        A5.same(`scene 5: the first point touched from ${r.h}`, first, r.best);
      });

      // a dashed ray that grows by moving its end (a plot dash ignores k), cut TRIM px short of both points like a named seg
      const ray = (a, b, k, o, tone = "grey", w = 0.55) => {
        if (k < 0.004 || o < 0.004) return null;
        const L = A5.dist(P[a], P[b]);
        const u = [(P[b][0] - P[a][0]) / L, (P[b][1] - P[a][1]) / L];
        const from = [P[a][0] + u[0] * TRIM, P[a][1] + u[1] * TRIM];
        const to = [P[b][0] - u[0] * TRIM, P[b][1] - u[1] * TRIM];
        const end = [lerp(from[0], to[0], k), lerp(from[1], to[1], k)];
        return { a: from, b: end, tone, dash: true, w, o, trimA: 0, trimB: 0 };
      };

      // the arrowhead at the end of the angle arc: a clockwise arrow, so "clockwise" is drawn
      const svg = L5.svg(stage);
      const head = V.s("path", { "stroke-width": "3", "stroke-linejoin": "round" });
      Object.assign(head.style, { fill: "var(--c)", stroke: "var(--c)" });
      svg.append(head);

      // the right-hand strip: sweeps so far, where we stand, and which way round we go
      const counter = A5.counter(stage, { x: 708, y: 40, w: 208, label: "sweeps", tone: "blue" });
      const from = A5.tag(stage, { x: 716, y: 144, text: "from A", tone: "blue" });
      const loop = A5.circleArrow(svg, 820, 296, 46, "blue", true);
      const loopTag = A5.tag(stage, { x: 716, y: 372, text: "clockwise", tone: "blue" });
      loopTag.el.style.width = "208px";
      loopTag.el.style.justifyContent = "center";
      const hullTag = A5.tag(stage, { x: 12, y: 548, h: 60, text: "hull", tone: "grey" });
      const tiles = A5.tiles(stage, { x: 112, y: 548, items: HULL, w: 80, h: 60, gap: 12, fs: 32, tone: "green" });

      return (t) => {
        const fade = 1 - ramp(t, FADE1[0], FADE1[1], lin); // the round 1 scaffolding goes
        const th = theta(t);
        const touched = (i) => t >= TOUCH[i];

        // ---- the seven points
        const points = {};
        A5.NAMES.forEach((n, i) => {
          const k = ramp(t, 0.2 + 0.1 * i, 0.6 + 0.1 * i, lin);
          points[n] = { s: E.pop(k), o: Math.min(1, k * 4) };
        });
        HULL.forEach((n, j) => {
          const tA = j === 0 ? T_A : ARRIVE[j - 1];
          if (t < tA) return;
          const bump = flash(t, tA, tA + 0.4) + (j === 0 ? flash(t, ARRIVE[4], ARRIVE[4] + 0.4) : 0);
          points[n] = { ...points[n], tone: "green", solid: true, s: points[n].s * (1 + 0.25 * bump) };
        });
        if (touched(0)) {
          points.G = { ...points.G, ring: "orange", ringK: ramp(t, TOUCH[0], TOUCH[0] + 0.3, E.pop) * fade };
        }
        if (t >= ARRIVE[4]) {
          // back at A: a ring on the start says the loop is closed
          const k = ramp(t, ARRIVE[4], ARRIVE[4] + 0.3, E.pop) * (1 - ramp(t, ARRIVE[4] + 1, ARRIVE[4] + 1.5, lin));
          points.A = { ...points.A, ring: "green", ringK: k };
        }
        RD.forEach((r) => {
          const u = t - r.start;
          if (u < 0 || u > r.len) return;
          // the corner we stand on (blue), then the one the swing touches first (orange)
          points[r.h] = { ...points[r.h], ring: "blue", ringK: ramp(u, 0, 0.3, E.pop) * (1 - ramp(u, r.s1, r.s1 + 0.2, lin)) };
          if (u >= r.s1 && r.best !== HULL[0]) {
            points[r.best] = { ...points[r.best], ring: "orange", ringK: ramp(u, r.s1, r.s1 + 0.3, E.pop) * (1 - ramp(u, r.e1, r.e1 + 0.1, lin)) };
          }
        }); // prettier-ignore

        // ---- lines, from the bottom layer to the top one
        const segs = [];
        const add = (s) => s && segs.push(s);
        HULL.forEach((n, i) =>
          add({ a: n, b: HULL[(i + 1) % HULL.length], tone: "green", w: 1.3, k: ramp(t, EDGE[i][0], EDGE[i][1], lin) }),
        );
        // round 1: a dashed ray to every point the sweep has touched (G's is the solid orange one, the first touch)
        ORDER.forEach((n, i) => {
          if (i > 0 && touched(i)) add(ray("A", n, ramp(t, TOUCH[i], TOUCH[i] + 0.2), fade));
        });
        add(touched(0) && { a: "A", b: "G", tone: "orange", w: 0.8, o: fade });
        // rounds 2 to 5: the fan of candidates, the reference edge, the swing
        RD.forEach((r) => {
          const u = t - r.start;
          if (u < 0.1 || u > r.len) return;
          const gone = 1 - ramp(u, r.e0, r.e1, lin);
          r.cands.forEach((n, j) => n !== r.best && add(ray(r.h, n, ramp(u, 0.15 + 0.05 * j, 0.45 + 0.05 * j), gone)));
          add(ray(r.h, r.ref, ramp(u, 0.2, 0.45), ramp(u, 0.2, 0.4, lin) * (1 - ramp(u, r.s1, r.s1 + 0.2, lin)), "purple", 0.8));
          const ang = r.a0 + r.span * smooth(ramp(u, S0, r.s1, lin));
          const lineOn = ramp(u, S0 - 0.1, S0, lin) * gone;
          add(lineOn > 0.004 && { a: r.h, b: A5.rayEnd(P[r.h], ang, BOX), tone: u >= r.s1 ? "orange" : "purple", w: 0.8, o: lineOn });
        }); // prettier-ignore
        // the reference of round 1: dashed, straight up from A
        const refK = ramp(t, REF[0], REF[1]);
        add(
          refK > 0.004 && {
            a: [P.A[0], P.A[1] - TRIM],
            b: [P.A[0], lerp(P.A[1] - TRIM, REF_TOP, refK)],
            tone: "purple",
            dash: true,
            w: 0.8,
            o: fade,
            trimA: 0,
            trimB: 0,
          },
        );
        // the sweeping line of round 1: a ray from A, clipped to the stage
        const sweepOn = ramp(t, SW0 - 0.2, SW0, lin) * (1 - ramp(t, 6.6, 6.9, lin));
        add(sweepOn > 0.004 && { a: "A", b: A5.rayEnd(P.A, -90 + th, BOX), tone: "purple", w: 0.8, o: sweepOn });

        // ---- tags: the reference r, 'leftmost', and the angles
        const tags = [
          { at: R_TAG, text: "r", disc: 46, tone: "purple", solid: true, k: ramp(t, 2.6, 2.9, E.pop), o: fade },
          {
            at: R_TAG,
            dx: -30,
            dy: -58,
            anchor: "l",
            text: "made-up point",
            tone: "purple",
            k: ramp(t, 2.8, 3.2, E.pop),
            o: fade * (1 - ramp(t, 3.7, 4.0, lin)), // it has said its piece once the sweep is under way
          },
          { at: "A", dx: -26, dy: 62, anchor: "l", text: "leftmost", tone: "green", solid: true, k: ramp(t, T_A, T_A + 0.4, E.pop), o: fade }, // prettier-ignore
        ];
        ORDER.forEach((n, i) => {
          const [dx, dy] = badge(n);
          tags.push({
            at: n,
            dx,
            dy,
            text: `${DEG1[n]}°`,
            tone: i === 0 ? "orange" : "purple",
            solid: i === 0,
            k: ramp(t, TOUCH[i], TOUCH[i] + 0.3, E.pop),
            o: fade,
          });
        });
        tags.push({
          at: "G",
          dx: 40,
          dy: 10,
          anchor: "l",
          text: "smallest",
          tone: "orange",
          solid: true,
          k: ramp(t, 6.8, 7.1, E.pop),
          o: fade,
        });

        // the angle arc from the reference to the sweeping line, with its clockwise arrowhead
        const arcO = sweepOn * ramp(th, 0, 4, lin);
        pl.update({
          points,
          segs,
          tags,
          arcs: [{ c: "A", r: ARC_R, from: -90, to: -90 + th, tone: "purple", w: 0.7, o: arcO }],
          polys: [{ pts: A5.HULL, tone: "green", fill: 0.4, w: 0.01, o: ramp(t, ARRIVE[4], ARRIVE[4] + 0.6, lin) }],
        });
        const phi = ((-90 + th) * Math.PI) / 180;
        const [nx, ny] = [Math.cos(phi), Math.sin(phi)]; // outward
        const [tx, ty] = [-Math.sin(phi), Math.cos(phi)]; // clockwise as seen
        const c = [P.A[0] + nx * ARC_R, P.A[1] + ny * ARC_R];
        const pt = (a, b) => `${(c[0] + nx * a + tx * b).toFixed(1)} ${(c[1] + ny * a + ty * b).toFixed(1)}`;
        head.setAttribute("d", `M${pt(0, 15)}L${pt(10, 0)}L${pt(-10, 0)}Z`);
        head.setAttribute("class", "c-purple");
        V.show(head, ramp(th, 6, 12, lin) * sweepOn); // only once the arc is long enough to carry it

        // ---- the right column and the hull list
        const sweeps = SWEEP_AT.filter((a) => t >= a).length;
        const last = sweeps ? SWEEP_AT[sweeps - 1] : 0;
        const closed = t >= ARRIVE[4];
        counter.set({
          text: String(sweeps),
          tone: closed ? "green" : "blue",
          solid: closed,
          bump: flash(t, last, last + 0.4),
          k: ramp(t, SW0 - 0.2, SW0 + 0.2, E.pop),
        });
        const cur = RD.filter((r) => t >= r.start).length; // 0 = round 1 (from A)
        const startOfCur = cur ? RD[cur - 1].start : SW0;
        from.set({
          text: `from ${ROUNDS[cur].h}`,
          k: ramp(t - startOfCur, 0, 0.3, E.pop),
          o: ramp(t, SW0 - 0.1, SW0, lin) * (1 - ramp(t, ARRIVE[4] - 0.4, ARRIVE[4], lin)),
        });
        L5.drawOn(loop, ramp(t, SW0 - 0.2, SW0 + 0.7, lin));
        loopTag.set({ k: ramp(t, SW0, SW0 + 0.4, E.pop) });
        hullTag.set({ k: ramp(t, T_A, T_A + 0.4, E.pop) });
        tiles.all((i) => {
          const k = ramp(t, TILE_T[i], TILE_T[i] + 0.4, lin);
          const bump = i === 0 ? flash(t, ARRIVE[4], ARRIVE[4] + 0.4) : 0;
          return { solid: true, s: clamp(E.pop(k), 0, 1.4) * (1 + 0.15 * bump), o: Math.min(1, k * 4) };
        });
      };
    },
  });
})();
