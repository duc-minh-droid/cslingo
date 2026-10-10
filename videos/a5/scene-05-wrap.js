/* Phase 5 · scene 05-wrap (15 s): GIFT WRAPPING (the Jarvis march), run for real on the seven example points (A5.WRAP).
   Round 1 is the detailed one: A, the leftmost point, is certainly on the hull; a made-up point r straight above it gives the first
   angle something to be measured from; a purple line swings clockwise from the dashed reference until it touches G (43 degrees); the
   other candidates get a dashed ray and their own angle, all bigger, so G wins and A -> G becomes a hull edge. Rounds 2 to 5 repeat
   it from each new corner (a ring marks the corner we stand on, a fan of dashed rays shows the candidates, the winner turns orange
   and then a green hull edge) and round 5 ends back at A, so the loop closes. Every angle, winner and candidate count comes from
   A5.WRAP and is asserted against the storyboard when the scene is built; degrees are shown in round 1 only.
   Story (local seconds): 0.2-1.0 points, 0.9 A green + 'leftmost', 1.5-2.2 reference ray and r, 3.0-4.1 THE SWEEP, 4.3-5.7 the other
   candidates, 5.8-6.4 A -> G, then rounds of 1.6 s from 6.6, 8.2, 9.8 and 11.4, 12.6 hull tint, 13.2-15 hold. */
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
  const TH = ROUNDS[0].exact.G; // 42.6: the angle the sweeping line has turned when it touches G
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
  A5.same(
    "scene 5: G has the smallest angle",
    Object.keys(DEG1).reduce((m, n) => (DEG1[n] < DEG1[m] ? n : m)),
    "G",
  );

  // ---------- the timeline ----------
  const T_A = 0.9; // A joins the hull
  const SWEEP = [3.0, 4.1];
  const ROUND_LEN = 1.6;
  const roundStart = (i) => 6.6 + ROUND_LEN * (i - 1); // rounds 2..5 are i = 1..4 (0-based)
  const EDGE = [[5.8, 6.2]]; // when hull edge i is drawn on
  for (let i = 1; i < HULL.length; i++) EDGE.push([roundStart(i) + 1.0, roundStart(i) + 1.4]);
  const ARRIVE = EDGE.map((e) => e[1]); // hull edge i is complete: its far corner joins the list, the counter counts
  A5.same(
    "scene 5: the corners are reached at",
    ARRIVE.map((x) => Math.round(x * 100) / 100),
    [6.2, 8, 9.6, 11.2, 12.8],
  );
  const STARTS = [SWEEP[0], ...ROUNDS.slice(1).map((_, i) => roundStart(i + 1))]; // a new 'from X' for each round
  const TILE_T = [T_A, ...ARRIVE.slice(0, 4)]; // the hull list grows: A, G, E, D, C
  const TRIM = 32; // the plot cuts a line 32 px short of a named point
  const OFF = { B: [-66, -6], C: [0, 52], D: [0, 50], E: [-20, -50], F: [0, -50], G: [86, -8] }; // angle badge offsets
  const ARC_R = 100;

  V.scene({
    kicker: "GIFT WRAPPING",
    title: ["Wrap the outside,", "one corner at a time"],
    dur: 15,
    caps: [
      [1, 3, "The leftmost point must be on the hull."],
      [3.2, 5.6, "Swing a line clockwise until it touches a point."],
      [5.8, 7.6, "Smallest angle wins: A to G."],
      [7.8, 10, "Repeat from each new point."],
      [12.9, 14.7, "Back at A. The loop closes."],
    ],
    build(stage) {
      const pl = A5.plot(stage, { segs: 16, arcs: 2, tags: 10, polys: 1 });
      const P = pl.pos;
      const want = { A: [50, 384], B: [225, 279], C: [277, 410], D: [522, 349], E: [662, 191], F: [382, 226], G: [347, 60] };
      Object.keys(want).forEach((n) => [0, 1].forEach((k) => A5.close(`scene 5: ${n} position`, P[n][k], want[n][k], 1)));
      const REF_TOP = 200; // the dashed reference ray runs up from A to y 200; the tag r sits on its end
      const R_TAG = [P.A[0], 176];

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

      const counter = A5.counter(stage, { x: 716, y: 40, w: 208, label: "sweeps", tone: "blue" });
      const from = A5.tag(stage, { x: 716, y: 144, text: "from A", tone: "blue" });
      const hullTag = A5.tag(stage, { x: 12, y: 548, h: 60, text: "hull", tone: "grey" });
      const tiles = A5.tiles(stage, { x: 112, y: 548, items: HULL, w: 80, h: 60, gap: 12, fs: 32, tone: "green" });

      return (t) => {
        const fade = 1 - ramp(t, 5.8, 6.2, lin); // the round 1 scaffolding (reference, arc, rays, badges) goes
        const theta = TH * ramp(t, SWEEP[0], SWEEP[1], E.inOut);
        const touched = t >= SWEEP[1];

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
        if (touched) {
          points.G = { ...points.G, ring: "orange", ringK: ramp(t, SWEEP[1], SWEEP[1] + 0.3, E.pop) * fade };
        }
        for (let i = 1; i < ROUNDS.length; i++) {
          const u = t - roundStart(i);
          if (u < 0 || u > 1.4) continue;
          const h = ROUNDS[i].h;
          points[h] = { ...points[h], ring: "blue", ringK: ramp(u, 0, 0.3, E.pop) * (1 - ramp(u, 1.0, 1.4, lin)) };
        }

        // ---- lines, from the bottom layer to the top one
        const segs = [];
        const add = (s) => s && segs.push(s);
        ["B", "C", "D", "E", "F"].forEach((n, i) => add(ray("A", n, ramp(t, 4.3 + 0.15 * i, 4.7 + 0.15 * i), fade)));
        for (let i = 1; i < ROUNDS.length; i++) {
          const u = t - roundStart(i);
          if (u < 0.2 || u > 1.4) continue;
          const { h, cands, best } = ROUNDS[i];
          const gone = 1 - ramp(u, 1.0, 1.4, lin);
          cands.forEach((n, j) => add(ray(h, n, ramp(u, 0.2 + 0.06 * j, 0.5 + 0.06 * j), n === best ? 1 : gone)));
          add({ a: h, b: best, tone: "orange", w: 0.9, k: ramp(u, 0.8, 1.0, lin), o: gone });
        }
        const refK = ramp(t, 1.5, 2.1);
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
        const retract = ramp(t, SWEEP[1], SWEEP[1] + 0.3);
        const swing = A5.rayEnd(P.A, -90 + theta);
        add({
          a: "A",
          b: [lerp(swing[0], P.G[0], retract), lerp(swing[1], P.G[1], retract)],
          tone: touched ? "orange" : "purple",
          w: 0.8,
          trimB: TRIM * retract,
          o: ramp(t, 2.8, 3.0, lin) * (1 - ramp(t, 6.2, 6.5, lin)),
        });
        HULL.forEach((n, i) => add({ a: n, b: HULL[(i + 1) % HULL.length], tone: "green", w: 1.3, k: ramp(t, EDGE[i][0], EDGE[i][1], lin) }));

        // ---- tags: the reference r, 'leftmost', and the angles
        const tags = [
          { at: R_TAG, text: "r", disc: 46, tone: "purple", solid: true, k: ramp(t, 1.9, 2.2, E.pop), o: fade },
          { at: "A", dx: -26, dy: 62, anchor: "l", text: "leftmost", tone: "green", solid: true, k: ramp(t, 1.0, 1.4, E.pop), o: fade },
        ];
        ["B", "C", "D", "E", "F"].forEach((n, i) => {
          tags.push({
            at: n,
            dx: OFF[n][0],
            dy: OFF[n][1],
            text: `${DEG1[n]}°`,
            tone: "purple",
            k: ramp(t, 4.45 + 0.15 * i, 4.8 + 0.15 * i, E.pop),
            o: fade,
          });
        });
        tags.push({
          at: "G",
          dx: OFF.G[0],
          dy: OFF.G[1],
          text: `${DEG1.G}°`,
          tone: "orange",
          solid: true,
          fs: 28 + 6 * flash(t, 5.3, 5.7),
          k: ramp(t, SWEEP[1], SWEEP[1] + 0.3, E.pop),
          o: 1 - ramp(t, 6.3, 6.6, lin),
        });

        pl.update({
          points,
          segs,
          tags,
          arcs: [{ c: "A", r: ARC_R, from: -90, to: -90 + theta, tone: touched ? "orange" : "purple", w: 0.7, o: fade }],
          polys: [{ pts: A5.HULL, tone: "green", fill: 0.4, w: 0.01, o: ramp(t, 12.6, 13.2, lin) }],
        });

        // ---- the arrowhead on the arc (clockwise)
        const phi = ((-90 + theta) * Math.PI) / 180;
        const [nx, ny] = [Math.cos(phi), Math.sin(phi)]; // outward
        const [tx, ty] = [-Math.sin(phi), Math.cos(phi)]; // clockwise as seen
        const c = [P.A[0] + nx * ARC_R, P.A[1] + ny * ARC_R];
        const pt = (a, b) => `${(c[0] + nx * a + tx * b).toFixed(1)} ${(c[1] + ny * a + ty * b).toFixed(1)}`;
        head.setAttribute("d", `M${pt(0, 15)}L${pt(10, 0)}L${pt(-10, 0)}Z`);
        head.setAttribute("class", touched ? "c-orange" : "c-purple");
        V.show(head, ramp(t, 3.05, 3.25, lin) * fade);

        // ---- the right column and the hull list
        const done = ARRIVE.filter((a) => t >= a).length;
        const last = done ? ARRIVE[done - 1] : 0;
        counter.set({
          text: String(done),
          tone: done === HULL.length ? "green" : "blue",
          solid: done === HULL.length,
          bump: flash(t, last, last + 0.4),
          k: ramp(t, 3.0, 3.4, E.pop),
        });
        const idx = STARTS.reduce((m, s, i) => (t >= s ? i : m), 0);
        from.set({
          text: `from ${ROUNDS[idx].h}`,
          k: ramp(t - STARTS[idx], 0, 0.3, E.pop),
          o: ramp(t, 3.0, 3.1, lin) * (1 - ramp(t, 12.8, 13.1, lin)),
        });
        hullTag.set({ k: ramp(t, 0.9, 1.3, E.pop) });
        tiles.all((i) => {
          const k = ramp(t, TILE_T[i], TILE_T[i] + 0.4, lin);
          const bump = i === 0 ? flash(t, ARRIVE[4], ARRIVE[4] + 0.4) : 0;
          return { solid: true, s: clamp(E.pop(k), 0, 1.4) * (1 + 0.15 * bump), o: Math.min(1, k * 4) };
        });
      };
    },
  });
})();
