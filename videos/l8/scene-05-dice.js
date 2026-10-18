/* Lecture 8 video, scene 5: roll the dice. The chances of scene 4 (Ash 20%, Birch 40%, Cedar 40%) become a choice with a
   roulette draw: the ant draws a random number u between 0 and 1 and takes the slice it lands in. Likely roads win more
   often, but a small slice can still win. Every number comes from L8.HUB (the lesson's rule and its two seeded draws, run and
   asserted in l8/common.js) and is asserted again here, including which slice each draw lands in.
   Story (local seconds): 0.2-1.4 the share strip, the little map (an ant on a hub, three villages, trails as thickness) and
   the cut numbers 0, 0.2, 0.6, 1; 1.0-1.4 the dice and its 'u = random number' tag; DRAW 1: 1.4-2.4 the dice rolls and lands,
   2.4-2.9 the pointer drops on the strip at u = 0.31, 2.8 the 'u = 0.31' tag, 3.4-3.7 the Birch slice turns orange and its road
   is drawn, 3.9-4.7 the ant walks to Birch; 4.8-5.2 everything fades back; DRAW 2: 5.3-5.9 a quicker roll, 5.9-6.3 the pointer
   drops at u = 0.08, 6.5-6.8 the small Ash slice turns orange, 7.0-7.8 the ant walks to Ash; 7.8-9.0 hold. */
VID.scene({
  kicker: "THE CHOICE",
  title: ["Then roll the dice,", "weighted by those shares"],
  dur: 9,
  caps: [
    [1.2, 3.1, "The ant draws a random number."],
    [3.4, 5.2, "The slice it lands in wins."],
    [6.4, 8.6, "Unlikely roads can still win."],
  ],
  build(stage, V) {
    const L8 = V.l8;
    const L5 = V.l5;
    const { ramp, flash, clamp, lerp, ease: E } = V;

    // ---- the data: lesson 8.2's worked example and its two seeded draws (asserted in l8/common.js), asserted again here
    const rows = L8.HUB.rows.slice(0, 3); // Ash, Birch, Cedar (Dale is tabu and has no slice)
    const chance = rows.map((r) => r.p);
    L8.same(chance.map(L8.pct), [20, 40, 40], "scene 5: slice sizes in %");
    const cum = chance.map((_, i) => chance.slice(0, i + 1).reduce((a, b) => a + b, 0));
    L8.same(cum, [0.2, 0.6, 1], "scene 5: the cuts of the strip");
    const DRAWS = L8.HUB.draws.map((d) => ({ u: d.u, to: d.to, win: L8.pick(chance, d.u) }));
    L8.same(
      DRAWS.map((d) => d.u.toFixed(2)),
      ["0.31", "0.08"],
      "scene 5: the two random numbers",
    );
    L8.same(
      DRAWS.map((d) => rows[d.win].name),
      ["Birch", "Ash"],
      "scene 5: the slice each draw lands in",
    );
    L8.same(
      DRAWS.map((d) => d.to),
      ["Birch", "Ash"],
      "scene 5: the lesson's draws pick Birch, then Ash",
    );
    DRAWS.forEach((d, i) =>
      L8.same(
        d.u >= (cum[d.win - 1] || 0) && d.u < cum[d.win],
        true,
        `scene 5: draw ${i + 1} lies inside its own slice`,
      ),
    );

    // ---- timeline (local seconds)
    const T = {
      strip: 0.2,
      map: 0.6, // hub, ant and the three villages pop
      ticks: 0.8, // the cut numbers fade in
      dice: 1.0, // the dice and its tag pop
      draws: [
        {
          roll: [1.4, 2.4],
          rate: 9, // faces per second while it rolls
          face: 4,
          drop: [2.4, 2.9], // the pointer drops onto the strip
          tag: 2.8,
          win: [3.4, 3.7], // the slice turns orange
          road: [3.4, 3.8], // the chosen road is drawn
          walk: [3.9, 4.7], // the ant walks it
        },
        {
          roll: [5.3, 5.9],
          rate: 14,
          face: 2,
          drop: [5.9, 6.3],
          tag: 6.2,
          win: [6.5, 6.8],
          road: [6.5, 6.9],
          walk: [7.0, 7.8],
        },
      ],
      reset: [4.8, 5.2], // draw 1 fades back
      antOut: [4.9, 5.1], // the ant fades out, then pops on the hub again
      antIn: [5.1, 5.3],
    };

    // ---- the share strip (the roulette wheel laid flat) and the cut numbers under it
    const STRIP = { x: 24, y: 210, w: 888, h: 100 };
    const strip = L8.strip(stage, { ...STRIP, fs: 34 });
    const parts = rows.map((r) => ({ text: `${r.name} ${L8.pct(r.p)}%`, v: r.p, tone: "grey" }));
    const geo = strip.update({ parts, k: 1, ticks: 0 }); // only to read where the slices sit
    // the winning slice is a solid orange copy laid over the grey one, so it can fade in and back out
    const hits = rows.map((r, i) =>
      stage.appendChild(
        V.h("div", {
          class: "v-gene c-orange solid",
          text: parts[i].text,
          style: {
            left: `${L8.f1(geo.lefts[i])}px`,
            top: `${STRIP.y}px`,
            width: `${L8.f1(geo.widths[i])}px`,
            height: `${STRIP.h}px`,
            fontSize: "34px",
            borderRadius: "22px",
            visibility: "hidden",
          },
        }),
      ),
    );

    // ---- the random number: a dice with its tag, and the 'u = 0.31' tag that rides on the pointer
    const diceTag = L8.tag(stage, { x: 490, y: 59, text: "u = random number", tone: "orange" });
    const utag = L8.tag(stage, { x: 0, y: 108, text: "u = 0.31", tone: "orange", solid: true });
    const diceSvg = L5.svg(stage);
    const dice = [1, 2, 3, 4, 5, 6].map((f) => diceSvg.appendChild(L5.dice(860, 90, 90, { face: f, tone: "orange" })));

    // ---- the little map: an ant on a hub, one road to each village, trails as thickness (blue)
    const HUB_P = { x: 150, y: 505 };
    const PILL = 150;
    const VY = { Ash: 410, Birch: 495, Cedar: 580 };
    const net = L8.net(stage, {
      nodes: {
        H: { ...HUB_P, label: "" },
        ...Object.fromEntries(rows.map((r) => [r.name, { x: 700, y: VY[r.name], w: PILL, label: r.name }])),
      },
      edges: rows.map((r) => ["H", r.name]),
      r: 30,
      fs: 30,
      maxPaths: 1,
    });
    const trailOf = Object.fromEntries(rows.map((r) => [L8.ek("H", r.name), r.tau]));
    L8.same(Object.values(trailOf), [1, 4, 5], "scene 5: the trails on the three roads");

    // where each road runs: the unit vector from the hub, and how far along it the village pill starts
    const geom = rows.map((r) => {
      const v = net.pt(r.name);
      const [dx, dy] = [v.x - HUB_P.x, v.y - HUB_P.y];
      const len = Math.hypot(dx, dy);
      const u = [dx / len, dy / len];
      return { u, edge: (v.x - PILL / 2 - HUB_P.x) / u[0], rot: (Math.atan2(dy, dx) * 180) / Math.PI };
    });
    const at = (g, s) => ({ x: HUB_P.x + g.u[0] * s, y: HUB_P.y + g.u[1] * s });

    // the chosen road (orange, with an arrow head), drawn by hand because the villages are wide pills
    const roadSvg = L5.svg(stage);
    const orange = L8.tone("orange");
    const roads = rows.map(() => {
      const ln = V.s("path", {
        fill: "none",
        "stroke-linecap": "round",
        "stroke-width": "10",
        style: { stroke: orange.c },
      });
      const head = V.s("path", {
        "stroke-linejoin": "round",
        "stroke-width": "4",
        style: { fill: orange.c, stroke: orange.c },
      });
      roadSvg.append(ln, head);
      return { ln, head };
    });
    const paintRoad = (rd, g, k) => {
      const W = 10;
      const HEAD = W * 2.8;
      const [s0, s1] = [36, g.edge - 6];
      const tip = s0 + (s1 - s0) * k;
      const hs = clamp((tip - s0) / (HEAD * 1.3));
      const [a, base, tipP] = [at(g, s0), at(g, tip - HEAD * hs), at(g, tip)];
      const n = [-g.u[1] * HEAD * 0.46 * hs, g.u[0] * HEAD * 0.46 * hs];
      V.show(rd.ln, k > 0.001 ? 1 : 0);
      V.show(rd.head, k > 0.001 && hs > 0.02 ? 1 : 0);
      rd.ln.setAttribute("d", `M ${L8.f1(a.x)} ${L8.f1(a.y)} L ${L8.f1(base.x)} ${L8.f1(base.y)}`);
      rd.head.setAttribute(
        "d",
        `M ${L8.f1(tipP.x)} ${L8.f1(tipP.y)} L ${L8.f1(base.x + n[0])} ${L8.f1(base.y + n[1])} L ${L8.f1(base.x - n[0])} ${L8.f1(base.y - n[1])} Z`,
      );
    };

    // the ant: it stands on the hub, then walks the chosen road and stops just short of the village
    const ant = roadSvg.appendChild(L8.ant(0, 0, 70));
    const rest = net.rest("H");
    const walkTo = (i, f) => {
      const g = geom[i];
      const p = at(g, lerp(70, g.edge - 52, f));
      return { x: p.x, y: p.y, r: g.rot };
    };

    return (t) => {
      // ---- strip, cuts and pointer
      const stripK = ramp(t, T.strip, T.strip + 0.6, E.lin);
      const mi = t < 5.6 ? 0 : 1; // which draw owns the pointer
      const Dm = T.draws[mi];
      const fade1 = 1 - ramp(t, T.reset[0], T.reset[1], E.lin); // draw 1 fades back, draw 2 stays
      const keep = mi === 0 ? fade1 : 1;
      const mk = ramp(t, Dm.drop[0], Dm.drop[1], E.lin) * keep;
      const g = strip.update({
        parts,
        k: stripK,
        ticks: ramp(t, T.ticks, T.ticks + 0.6, E.lin),
        marker: DRAWS[mi].u,
        markerK: mk,
      });
      const label = `u = ${DRAWS[mi].u.toFixed(2)}`;
      const tw = L8.tagW(label);
      utag.set({
        text: label,
        x: clamp(g.markerX - tw / 2, 12, 936 - 12 - tw),
        k: ramp(t, Dm.tag, Dm.tag + 0.4, E.lin),
        o: keep,
      });

      // ---- the dice: pops in, rolls (shaking and hopping), lands on its face with a little squash
      const di = t >= T.draws[1].roll[0] ? 1 : 0;
      const Dd = T.draws[di];
      const rolling = t >= Dd.roll[0] && t < Dd.roll[1];
      const face = rolling ? 1 + (Math.floor((t - Dd.roll[0]) * Dd.rate) % 6) : t >= Dd.roll[1] ? Dd.face : 1;
      const calm = rolling ? 1 - ramp(t, Dd.roll[1] - 0.25, Dd.roll[1], E.lin) : 0; // the shake dies away before it lands
      const dk = ramp(t, T.dice, T.dice + 0.4, E.lin);
      dice.forEach((d, i) =>
        V.place(d, {
          r: 14 * Math.sin(24 * t) * calm,
          y: -14 * Math.abs(Math.sin(12 * (t - Dd.roll[0]))) * calm,
          s: (0.6 + 0.4 * E.pop(dk)) * (1 + 0.12 * flash(t, Dd.roll[1], Dd.roll[1] + 0.3)),
          o: i + 1 === face ? clamp(dk * 3) : 0,
        }),
      );
      diceTag.set({ k: dk });

      // ---- the winners: slice, road and village light up together, draw 1 then fades back
      const nodes = { H: { k: ramp(t, T.map, T.map + 0.4, E.lin) } };
      rows.forEach((r, i) => {
        const d = DRAWS.findIndex((x) => x.win === i);
        const D = d >= 0 ? T.draws[d] : null;
        const live = D ? (d === 0 ? fade1 : 1) : 0;
        const wk = D ? ramp(t, D.win[0], D.win[1], E.lin) * live : 0;
        V.place(hits[i], { o: wk }); // same size as the grey slice, so only the colour changes
        paintRoad(roads[i], geom[i], D ? ramp(t, D.road[0], D.road[1], E.out) * live : 0);
        const on = D && t >= D.win[0] && !(d === 0 && t >= 5.0);
        nodes[r.name] = {
          k: ramp(t, T.map + 0.1 * (i + 1), T.map + 0.1 * (i + 1) + 0.4, E.lin),
          tone: on ? "orange" : "grey",
          solid: !!on && t >= D.walk[1],
          s: 1 + 0.1 * (D ? flash(t, D.win[0], D.win[0] + 0.4) : 0),
        };
      });
      net.update({
        roads: ramp(t, T.map, T.map + 0.4, E.lin),
        tau: (a, b) => trailOf[L8.ek(a, b)],
        tauW: [3, 4],
        tauK: ramp(t, T.map + 0.3, T.map + 0.7, E.lin),
        nodes,
      });

      // ---- the ant: stands on the hub, walks the chosen road, fades out, pops on the hub again for draw 2
      const w = t < T.antIn[0] ? 0 : 1;
      const Dw = T.draws[w];
      const blend = ramp(t, Dw.walk[0] - 0.2, Dw.walk[0], E.lin);
      const f = ramp(t, Dw.walk[0], Dw.walk[1], E.inOut);
      const to = walkTo(DRAWS[w].win, f);
      const pop = ramp(t, T.antIn[0], T.antIn[1], E.lin);
      const appear = w === 0 ? ramp(t, T.map, T.map + 0.6, E.lin) : pop;
      const vanish = w === 0 ? 1 - ramp(t, T.antOut[0], T.antOut[1], E.lin) : 1;
      V.place(ant, {
        x: lerp(rest.x, to.x, blend),
        y: lerp(rest.y, to.y, blend),
        r: lerp(0, to.r, blend),
        s: 0.5 + 0.5 * E.pop(appear),
        o: clamp(appear * 3) * vanish,
      });
    };
  },
});
