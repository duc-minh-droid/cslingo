/* Phase 5 · scene 04-dent (11 s): WHY TURNS MATTER. A blue walker goes round the hull of the example points, A C D E G, and at
   every corner the turn is a LEFT turn: five green arrows pile up in a log under the plot. Then the walk takes a detour through the
   inside point F (E -> F -> G): there the turn is RIGHT. A right turn means F is a dent, not a corner, and it is crossed out.
   Every turn kind is computed from the points with A5.turnKind (the arrows are drawn from what it says, never typed), and A5.DENT
   is checked against the storyboard when the scene is built. The walker rests a little way along an edge, never on a letter.
   Story (local seconds): 0.2-1.0 the points pop in, 1.0-1.4 the walker and the start A, five edges of 0.65 s from 1.4 (a corner
   turns green and its log arrow draws on as the walker arrives), 4.7-5.3 hull tint, 5.5-5.9 the walker hops to E, 5.9-6.9 the
   detour (F red, right arrow), 6.9-8.0 the dent triangle and the 'dent' tag (the walker leaves at 7.1-7.5 so it never hides
   the arrowhead into G), 8.6-9.4 F is crossed out, 9.4-11 hold. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const L5 = V.l5;
  const { ramp, flash, lerp, clamp, ease: E } = V;
  const lin = E.lin;

  const H = A5.HULL;
  const N = H.length;
  /* the turn at corner H[i + 1] on the closed walk H[i] -> H[i + 1] -> H[i + 2] (as seen on screen) */
  const KINDS = H.map((_, i) => A5.turnKind(A5.PTS[H[i]], A5.PTS[H[(i + 1) % N]], A5.PTS[H[(i + 2) % N]]));
  A5.same("scene 4: hull", H, ["A", "C", "D", "E", "G"]);
  A5.same("scene 4: every turn round the hull is left", KINDS, ["left", "left", "left", "left", "left"]);
  A5.same("scene 4: detour path", A5.DENT.path, ["A", "C", "D", "E", "F", "G"]);
  A5.same(
    "scene 4: detour turns",
    A5.DENT.turns.map((q) => `${q.at}:${q.kind}`),
    ["A:left", "C:left", "D:left", "E:left", "F:right", "G:left"],
  );
  const DENT = A5.DENT.skip; // "F"
  const DENT_KIND = A5.DENT.turns.find((q) => q.at === DENT).kind; // "right"

  const EDGE0 = 1.4; // the walk starts
  const EDGE = 0.65; // seconds per edge
  const arrive = (i) => EDGE0 + EDGE * (i + 1); // the walker reaches corner H[(i + 1) % N]
  const LOG = { x: 90, gap: 110, y: 520, size: 60, letterY: 580 };
  const TRIM = 32; // the plot cuts an edge 32 px short of a named point
  const REST = 46; // the walker stands this far from a corner centre, so the letter stays visible
  const HEAD = 28.6; // arrowhead length of a 1.2-wide edge in the plot (3.4 x 8.4 px)
  const FADE = 0.4; // opacity of the pale record of the five left turns
  const smooth = (x) => 0.5 * x + 0.5 * E.inOut(x); // a walk that slows at corners but never stops dead

  V.scene({
    kicker: "WHY TURNS MATTER",
    title: ["A convex shape always", "turns the same way"],
    dur: 11,
    caps: [
      [1, 3.2, "Walk round the hull, corner by corner."],
      [3.4, 5.5, "Every turn is a left turn."],
      [6.3, 8.4, "Go through F and you turn right."],
      [8.6, 10.8, "Right turn: a dent, not a corner."],
    ],
    build(stage) {
      const pl = A5.plot(stage, { polys: 2, segs: 8, tags: 3 });
      const P = pl.pos;
      const len = (a, b) => A5.dist(P[a], P[b]);
      const along = (a, b, d) => {
        const L = len(a, b);
        return [P[a][0] + ((P[b][0] - P[a][0]) * d) / L, P[a][1] + ((P[b][1] - P[a][1]) * d) / L];
      };
      /* how far along an edge a walker at distance d from its start has drawn it: the line runs a little ahead of the walker,
         hidden under the token */
      const drawK = (d, a, b, head = 0) => clamp((d - TRIM + 8) / Math.max(1, len(a, b) - 2 * TRIM - head * 0.7));

      const svg = L5.svg(stage);
      const icons = KINDS.map((kind, i) =>
        svg.appendChild(A5.turnIcon(kind, LOG.x + LOG.gap * i, LOG.y, LOG.size, kind === "left" ? "green" : "red")),
      );
      const letters = H.map((_, i) =>
        V.h("div", {
          class: "v-text",
          text: H[(i + 1) % N],
          style: {
            left: `${LOG.x + LOG.gap * i - 30}px`,
            top: `${LOG.letterY - 18}px`,
            width: "60px",
            textAlign: "center",
            fontSize: "30px",
            fontWeight: "900",
            color: "var(--text-dim)",
          },
        }),
      );
      stage.append(...letters);
      const allLeft = A5.tag(stage, { x: 596, y: LOG.y - 27, text: "all left turns", tone: "green", solid: true });
      // the right turn at the dent: a red arrow in the free space left of F
      const turnArrow = svg.appendChild(A5.turnIcon(DENT_KIND, 306, 178, 72, "red"));
      const cross = L5.cross(P[DENT][0], P[DENT][1], 52, "red");
      svg.append(cross);
      const walker = A5.token(stage, { tone: "blue", size: 30 });

      /* where the walker is: on the hull walk, then (after its hop) on the detour */
      const walkSpan = (i) => {
        const [a, b] = [H[i], H[(i + 1) % N]];
        const from = i === 0 ? REST : 0;
        const to = i === N - 1 ? len(a, b) - REST : len(a, b);
        return { a, b, from, to };
      };
      const detour = [
        { a: "E", b: DENT, from: REST, to: len("E", DENT), t0: 5.9 },
        { a: DENT, b: "G", from: 0, to: len(DENT, "G") - REST, t0: 6.4 },
      ];
      const walkerAt = (t) => {
        let a, b, d;
        if (t < 5.7) {
          const i = clamp(Math.floor((t - EDGE0) / EDGE), 0, N - 1);
          const sp = walkSpan(i);
          [a, b, d] = [
            sp.a,
            sp.b,
            lerp(sp.from, sp.to, smooth(ramp(t, EDGE0 + EDGE * i, EDGE0 + EDGE * (i + 1), lin))),
          ];
        } else {
          const j = t < 6.4 ? 0 : 1;
          const sp = detour[j];
          [a, b, d] = [sp.a, sp.b, lerp(sp.from, sp.to, smooth(ramp(t, sp.t0, sp.t0 + EDGE * 0.77, lin)))];
        }
        const p = along(a, b, d);
        const out = ramp(t, 5.5, 5.7, lin);
        const into = ramp(t, 5.7, 5.9, lin);
        const gone = ramp(t, 7.1, 7.5, lin);
        const grow = ramp(t, 1.0, 1.4, E.pop);
        const [s, o] =
          t < 5.7
            ? [lerp(0.4 + 0.6 * grow, 0.6, out), Math.min(1, grow * 4) * (1 - out)]
            : [lerp(0.6, 1, into) * (1 - 0.4 * gone), into * (1 - gone)];
        return { x: p[0], y: p[1], s, o };
      };

      const edgeD = (i, t) => {
        const sp = walkSpan(i);
        return lerp(sp.from, sp.to, smooth(ramp(t, EDGE0 + EDGE * i, EDGE0 + EDGE * (i + 1), lin)));
      };

      return (t) => {
        // ---- the seven points
        const points = {};
        A5.NAMES.forEach((name, i) => {
          const k = ramp(t, 0.2 + 0.07 * i, 0.6 + 0.07 * i, lin);
          points[name] = { s: E.pop(k), o: Math.min(1, k * 4) };
        });
        const green = (name, tA) => {
          points[name] = {
            ...points[name],
            tone: "green",
            solid: true,
            s: points[name].s * (1 + 0.25 * flash(t, tA, tA + 0.4)),
          };
        };
        if (t >= 1.0) green("A", 1.0);
        H.forEach((name, i) => {
          const tA = arrive(i - 1); // corner H[i] is reached at the end of edge i - 1
          if (i > 0 && t >= tA) green(name, tA);
        });
        if (t >= arrive(N - 1)) green("A", arrive(N - 1));
        // the dent: solid red when the walker reaches it, then a pale grey disc with a cross
        if (t >= detour[1].t0) {
          const blink = ramp(t, 8.6, 8.8, lin);
          const pale = ramp(t, 8.8, 9.2, lin);
          const red = t < 8.8;
          points[DENT] = {
            ...points[DENT],
            tone: red ? "red" : "grey",
            solid: red,
            s: 1 + 0.25 * flash(t, detour[1].t0, detour[1].t0 + 0.4),
            o: red ? 1 - 0.65 * blink : lerp(0.35, 0.5, pale),
          };
        }

        // ---- the hull walk: five green edges drawn behind the walker, then the tint
        const segs = H.map((_, i) => {
          const sp = walkSpan(i);
          const swap = i === 3 ? 1 - ramp(t, 5.8, 6.0, lin) + ramp(t, 8.8, 9.4, lin) * 1 : 1; // E -> G steps aside during the detour
          return {
            a: sp.a,
            b: sp.b,
            tone: "green",
            w: 1.2,
            k: drawK(edgeD(i, t), sp.a, sp.b),
            o: t < EDGE0 ? 0 : clamp(swap),
          };
        });
        const dashO = ramp(t, 5.8, 6.0, lin) * (1 - ramp(t, 8.8, 9.4, lin));
        segs.push({ a: "E", b: "G", tone: "grey", dash: true, o: 0.85 * dashO });
        // ---- the detour: E -> F -> G in blue
        const d0 = lerp(detour[0].from, detour[0].to, smooth(ramp(t, detour[0].t0, detour[0].t0 + EDGE * 0.77, lin)));
        const d1 = lerp(detour[1].from, detour[1].to, smooth(ramp(t, detour[1].t0, detour[1].t0 + EDGE * 0.77, lin)));
        const dFade = 1 - ramp(t, 8.8, 9.4, lin);
        segs.push({
          a: "E",
          b: DENT,
          tone: "blue",
          w: 1.2,
          arrow: true,
          k: t < 5.9 ? 0 : drawK(d0, "E", DENT, HEAD),
          o: dFade,
        });
        segs.push({
          a: DENT,
          b: "G",
          tone: "blue",
          w: 1.2,
          arrow: true,
          k: t < 6.4 ? 0 : drawK(d1, DENT, "G", HEAD),
          o: dFade,
        });

        const polys = [
          { pts: H, tone: "green", fill: 0.4, w: 0.01, o: ramp(t, 4.7, 5.3, lin) },
          { pts: ["E", DENT, "G"], tone: "red", fill: 1, w: 0.01, o: ramp(t, 6.9, 7.5, lin) * dFade },
        ];
        const tags = [
          { at: DENT, dx: 76, dy: -58, text: "dent", tone: "red", solid: true, k: ramp(t, 7.6, 8.0, lin), o: dFade },
        ];
        pl.update({ points, polys, segs, tags });

        // ---- the log of turns and the walker
        const rec = lerp(1, FADE, ramp(t, 5.5, 5.9, lin));
        icons.forEach((g, i) => {
          L5.drawOn(g, ramp(t, arrive(i), arrive(i) + 0.4, lin));
          V.place(g, { o: rec });
        });
        letters.forEach((e, i) => V.place(e, { o: ramp(t, arrive(i) + 0.1, arrive(i) + 0.4, lin) * rec }));
        allLeft.set({ k: ramp(t, 4.75, 5.15, lin), o: rec });
        L5.drawOn(turnArrow, ramp(t, 6.4, 6.8, lin));
        V.place(turnArrow, { o: dFade });
        L5.drawOn(cross, ramp(t, 8.6, 9.2, lin));
        walker.set(walkerAt(t));
      };
    },
  });
})();
