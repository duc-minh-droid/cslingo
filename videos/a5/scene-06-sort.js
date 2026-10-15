/* Phase 5 · scene 06-sort (11 s): METHOD 2, GRAHAM SCAN, STEP 1. "Way two: sort the points first." The lowest point, C, is certainly
   on the hull (nothing is lower: a level line through it, with nothing below), so it is the anchor. A purple line starts level (the
   0 degrees line, pointing east) and sweeps ANTICLOCKWISE round C (a circular arrow says so); an arc shows how far it has turned.
   Each point it touches gets its own angle on a badge (14, 30, 60, 79, 112, 173 degrees: the sort key), a dashed ray from C and its
   tile in the 'sorted' row, so the row is the points in order of angle. Joined in that order the points make a closed path round
   every point, but with dents (F and B): those are what the next scene's stack removes. Every angle comes from the real sort
   (A5.SORT, A5.ccwFromEast on the drawn positions) and the dents from A5.turnKind on the sorted path; both are asserted against the
   storyboard when the scene is built.
   Story (local seconds): 0.2-0.8 the points pop in, 0.8-1.6 C turns green + 'lowest' + the level line ('nothing lower', '0 degrees'),
   2.6-6.1 the sweep (a touch every 0.6 s from 3.1), 6.4-6.8 the line fades, 6.9-8.0 the sorted path draws round, 8.0-8.5 F and B get
   red rings and 'dent' tags, 8.5-11 hold. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;

  const { pivot: PIVOT, order: ORDER, ccw: CCW } = A5.SORT;
  A5.same("scene 6: pivot", PIVOT, "C");
  A5.same("scene 6: sorted order", ORDER, ["D", "E", "F", "G", "B", "A"]);
  A5.same("scene 6: angles", CCW, { D: 14, E: 29.6, F: 60.3, G: 78.7, B: 111.8, A: 173.4 });
  A5.same("scene 6: sorted path", A5.sortedPath, ["C", "D", "E", "F", "G", "B", "A"]);
  /* the vertices of the sorted path where the walk turns right (as seen): the dents */
  const PATH = A5.sortedPath;
  const DENTS = PATH.filter(
    (name, i) => A5.turnKind(A5.PTS[PATH[(i + 6) % 7]], A5.PTS[name], A5.PTS[PATH[(i + 1) % 7]]) === "right",
  );
  A5.same("scene 6: the dents of the sorted path", DENTS, ["F", "B"]);
  /* the notch each dent cuts out of the hull: the triangle (the point before, the dent, the point after) */
  const NOTCH = DENTS.map((name) => {
    const i = PATH.indexOf(name);
    return [PATH[i - 1], name, PATH[(i + 1) % 7]];
  });

  const T0 = 2.6; // the sweep starts level
  const TOUCH = (i) => 3.1 + 0.6 * i; // the line reaches ORDER[i]
  const smooth = (x) => 0.5 * x + 0.5 * E.inOut(x); // slows at each touch, never stops dead
  const OFF = { D: [76, 8], E: [0, -58] }; // angle badge offsets that differ from the default (just behind the ray's tip)
  const R_ARC = 84;
  const BOX = [12, 12, 704, 628]; // the sweeping line stops at the right-hand strip (x 716..924)
  const T_DENT = 8.0; // the first dent ring
  const T_PATH = [6.9, 8.0]; // the sorted path draws

  V.scene({
    kicker: "METHOD 2: GRAHAM SCAN",
    title: ["Sort the points", "round the lowest one"],
    dur: 11,
    caps: [
      [0.3, 1.7, "Way two: sort the points first."],
      [1.8, 3, "The lowest point must be on the hull."],
      [3.1, 6.3, "Sort the rest by angle, sweeping anticlockwise."],
      [6.5, 8, "Walk the points in this order."],
      [8.2, 10.6, "The path still has dents."],
    ],
    build(stage) {
      const pl = A5.plot(stage, { segs: 10, arcs: 1, tags: 12, polys: 3 });
      const P = pl.pos;
      /* the real sort keys, measured on the drawn points: the line must hit each point exactly */
      const ANG = ORDER.map((name) => A5.ccwFromEast(P[PIVOT], P[name]));
      ORDER.forEach((name, i) => A5.close(`scene 6: angle of ${name}`, ANG[i], CCW[name], 0.06));
      const KNOTS = [[T0, 0], ...ANG.map((a, i) => [TOUCH(i), a])];
      /* the angle of the sweeping line at local time t (degrees anticlockwise from east) */
      const theta = (t) => {
        if (t <= KNOTS[0][0]) return 0;
        for (let j = 0; j < KNOTS.length - 1; j++) {
          const [t0, a0] = KNOTS[j];
          const [t1, a1] = KNOTS[j + 1];
          if (t <= t1) return lerp(a0, a1, smooth(ramp(t, t0, t1, lin)));
        }
        return KNOTS[KNOTS.length - 1][1];
      };
      /* where each angle badge sits: on the side the line has already passed (clockwise of the ray), so the sweep never crosses it */
      const badge = (name) => {
        if (OFF[name]) return OFF[name];
        const L = A5.dist(P[PIVOT], P[name]);
        return [(-(P[name][1] - P[PIVOT][1]) / L) * 62, ((P[name][0] - P[PIVOT][0]) / L) * 62];
      };
      const levelY = P[PIVOT][1]; // the level line through the lowest point: nothing is below it
      A5.same(
        "scene 6: nothing is lower than the pivot",
        A5.NAMES.every((n) => P[n][1] <= levelY),
        true,
      );

      const svg = L5.svg(stage);
      const head = V.s("path", {
        class: "c-purple",
        style: { fill: "var(--c)", stroke: "var(--c)", strokeWidth: "3", strokeLinejoin: "round" },
      });
      svg.append(head);
      const lowest = A5.tag(stage, {
        x: P[PIVOT][0] - 62,
        y: P[PIVOT][1] + 44,
        text: "lowest",
        tone: "green",
        solid: true,
      });
      // the right-hand strip: which way round we sweep
      const loop = A5.circleArrow(svg, 820, 120, 46, "purple");
      const loopTag = A5.tag(stage, { x: 716, y: 196, text: "anticlockwise", tone: "purple" });
      loopTag.el.style.width = "208px";
      loopTag.el.style.justifyContent = "center";
      const sortedTag = A5.tag(stage, { x: 12, y: 556, text: "sorted", tone: "grey" });
      const tiles = A5.tiles(stage, { x: 150, y: 548, items: ORDER, w: 84, h: 60, gap: 12, fs: 32, tone: "purple" });

      return (t) => {
        // ---- the seven points
        const points = {};
        A5.NAMES.forEach((name, i) => {
          const k = ramp(t, 0.2 + 0.07 * i, 0.6 + 0.07 * i, lin);
          points[name] = { s: E.pop(k), o: Math.min(1, k * 4) };
        });
        const set = (name, extra, tA) => {
          const p = points[name];
          points[name] = { ...p, ...extra, s: p.s * (1 + 0.25 * flash(t, tA, tA + 0.4)) };
        };
        if (t >= 0.8) set(PIVOT, { tone: "green", solid: true }, 0.8);
        ORDER.forEach((name, i) => {
          if (t >= TOUCH(i)) set(name, { tone: "purple", solid: false }, TOUCH(i));
        });
        // the dents: red rings, one after the other
        DENTS.forEach((name, j) => {
          const tD = T_DENT + 0.25 * j;
          if (t >= tD) points[name] = { ...points[name], ring: "red", ringK: ramp(t, tD, tD + 0.35, lin) };
        });

        // ---- the level line, the sweeping line, its arc and the dashed rays it leaves behind
        const th = theta(t);
        const lineIn = ramp(t, T0 - 0.3, T0, lin); // the sweeping line appears on the level line
        const lineOut = 1 - ramp(t, 6.4, 6.8, lin); // and fades once it has rested on the last point
        const touched = ORDER.map((_, i) => t >= TOUCH(i));
        const fadeRays = lerp(0.7, 0.25, ramp(t, T_PATH[0], T_PATH[1], lin));
        const segs = [
          // the level line through C: nothing below it, and the 0 degrees the angles are measured from
          { a: [150, levelY], b: [700, levelY], tone: "grey", dash: true, w: 0.6, o: ramp(t, 1.0, 1.4, lin), trimA: 0, trimB: 0 },
          { a: PIVOT, b: A5.rayEnd(P[PIVOT], -th, BOX), tone: "purple", w: 0.8, k: lineIn, o: lineOut },
          ...ORDER.map((name, i) => ({
            a: PIVOT,
            b: name,
            tone: "purple",
            dash: true,
            w: 0.55,
            o: touched[i] ? fadeRays : 0,
          })),
        ]; // prettier-ignore
        const arcO = lineOut * ramp(t, T0 - 0.2, T0 + 0.2, lin);
        const arcs = [{ c: PIVOT, r: R_ARC, from: 0, to: -th, tone: "purple", w: 0.6, o: arcO }];
        // a small arrowhead on the end of the arc shows the direction: anticlockwise
        const c = P[PIVOT];
        const tip = A5.polar(c, -th, R_ARC);
        const dir = [-Math.sin((th * Math.PI) / 180), -Math.cos((th * Math.PI) / 180)];
        const nrm = [-dir[1], dir[0]];
        const pts = [
          [tip[0] + dir[0] * 16, tip[1] + dir[1] * 16],
          [tip[0] + nrm[0] * 10, tip[1] + nrm[1] * 10],
          [tip[0] - nrm[0] * 10, tip[1] - nrm[1] * 10],
        ];
        head.setAttribute("d", `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L")}Z`);
        V.show(head, arcO * V.clamp((th - 10) / 14));

        // ---- angle badges, the sorted path and the dent triangles
        const tags = ORDER.map((name, i) => {
          const [dx, dy] = badge(name);
          return {
            at: name,
            dx,
            dy,
            text: `${Math.round(CCW[name])}°`,
            tone: "purple",
            solid: true,
            k: ramp(t, TOUCH(i), TOUCH(i) + 0.3, lin),
          };
        });
        tags.push(
          { at: [738, levelY], text: "0°", tone: "purple", solid: true, k: ramp(t, 1.3, 1.7, lin) },
          { at: [P[PIVOT][0] + 280, levelY], dy: 46, text: "nothing lower", tone: "grey", k: ramp(t, 1.3, 1.7, lin) },
        ); // prettier-ignore
        DENTS.forEach((name, j) => {
          const tD = T_DENT + 0.25 * j;
          tags.push({
            at: name,
            dx: name === "F" ? 0 : -52,
            dy: name === "F" ? -62 : 56,
            text: "dent",
            tone: "red",
            solid: true,
            k: ramp(t, tD + 0.2, tD + 0.6, lin),
          });
        });
        const polys = [
          { pts: PATH, tone: "purple", fill: 0.15 * ramp(t, T_PATH[1] - 0.5, T_PATH[1], lin), w: 0.9, k: ramp(t, T_PATH[0], T_PATH[1], lin) },
          ...NOTCH.map((tri, j) => ({
            pts: tri,
            tone: "red",
            fill: 0.7,
            w: 0.01,
            o: ramp(t, T_DENT + 0.25 * j, T_DENT + 0.5 + 0.25 * j, lin),
          })),
        ]; // prettier-ignore
        pl.update({ points, polys, segs, arcs, tags });

        // ---- the direction of the sweep, the label and the sorted row
        L5.drawOn(loop, ramp(t, T0 - 0.3, T0 + 0.6, lin));
        loopTag.set({ k: ramp(t, T0, T0 + 0.4, E.pop) });
        lowest.set({ k: ramp(t, 1.0, 1.4, lin) });
        sortedTag.set({ k: ramp(t, T0 + 0.2, T0 + 0.6, lin) });
        tiles.all((i) => {
          const k = ramp(t, TOUCH(i), TOUCH(i) + 0.35, lin);
          const dent = DENTS.includes(ORDER[i]);
          const tD = T_DENT + 0.25 * DENTS.indexOf(ORDER[i]);
          return { tone: dent && t >= tD ? "red" : "purple", s: E.pop(k), o: Math.min(1, k * 4) };
        });
      };
    },
  });
})();
