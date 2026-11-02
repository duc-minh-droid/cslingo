/* Lecture 11 video, scene 4: what a boid senses. Lesson 11.2 ('What a boid can sense'): one boid and the lesson figure's 13
   flockmates (L11.MATES, scaled 2.2 around the focus). The orange perception circle grows 30 -> 50 -> 70 -> 80 and brings in
   0, 1, 2, 4 flockmates (each turns orange the moment the circle reaches it); the nearest is 45 away, 27 degrees to its left
   (distance and bearing shown with a dashed line and a blue arc); one flockmate is behind it and still sensed (all round).
   Story (local s): 0.2-1.2 the flockmates pop, 0.6 the focus, 1.4-1.8 the circle at 30, steps at 2.0 / 2.7 / 3.4 (0.4 s each),
   5.8-6.4 the line and tag to the nearest, 6.4-7.2 the bearing arc, 8.0-8.6 the flockmate behind is ringed. The radius
   finishes growing before 'Inside its radius: 4 flockmates' is read. */
VID.scene({
  kicker: "WHAT A BOID SEES",
  title: ["A boid only senses", "its neighbours"],
  dur: 10,
  caps: [
    [0.5, 3.6, "A boid only senses flockmates nearby."],
    [3.9, 5.5, "Inside its radius: 4 flockmates."],
    [5.8, 7.8, "It knows each one's distance and direction."],
    [8, 9.7, "It sees all round, even behind it."],
  ],
  build(stage, V) {
    const L11 = V.l11;
    const L5 = V.l5;
    const { ramp, flash, lerp, ease: E } = V;

    // ---- data (lesson 11.2, asserted in common.js and re-checked here)
    const M = L11.MATES;
    const S = L11.SENSE;
    L11.same([M.length, S.R, S.count], [13, [30, 50, 70, 80], [0, 1, 2, 4]], "scene 4: the lesson figure");
    const countAt = (R) => S.inR(R).filter(Boolean).length;
    L11.same(S.R.map(countAt), [0, 1, 2, 4], "scene 4: flockmates inside each radius");
    L11.same([S.near.xy, S.near.d, S.near.bearing, S.near.side], [[40, -20], 45, 27, "left"], "scene 4: the nearest");
    const BEHIND = 2;
    L11.same([M[BEHIND], S.inR(80)[BEHIND], M[BEHIND][0] < 0], [[-60, 20], true, true], "scene 4: one behind, sensed");
    const dist = M.map((p) => Math.hypot(...p));

    // ---- timeline: the radius steps (each eased over 0.4 s)
    const STEPS = [
      [2.0, 50],
      [2.7, 70],
      [3.4, 80],
    ];
    const Rat = (t) => STEPS.reduce((r, [t0, to], i) => lerp(r, to, E.inOut(ramp(t, t0, t0 + 0.4, E.lin))), S.R[0]);
    L11.same(
      [Rat(1.9), Rat(2.5), Rat(3.2), Rat(4)].map((r) => countAt(r)),
      [0, 1, 2, 4],
      "scene 4: counts as the circle grows",
    );
    // the moment the growing circle reaches flockmate j (or null), sampled at 1 ms
    const reach = dist.map((d) => {
      for (let t = 1.4; t <= 4; t += 0.001) if (Rat(t) > d) return t;
      return null;
    });
    L11.same(reach.filter((x) => x != null).length, 4, "scene 4: four flockmates reached");

    // ---- layout (focus at 468, 270; the lesson's offsets scaled by 2.2: x 138..886, y 50..457)
    const SC = 2.2;
    const FX = 468;
    const FY = 270;
    const P = M.map(([x, y]) => [FX + SC * x, FY + SC * y]);
    const svg = L5.svg(stage);
    const amber = L11.tone("orange").c;
    const circle = svg.appendChild(V.s("circle", { cx: FX, cy: FY, "stroke-width": 4, "stroke-dasharray": "12 9" }));
    Object.assign(circle.style, { stroke: amber, fill: `color-mix(in srgb, ${amber} 10%, transparent)` });
    // the heading line, the line to the nearest flockmate and the bearing arc (under the boids)
    const grey = L11.tone("grey").c;
    const ahead = svg.appendChild(V.s("line", { x1: FX, y1: FY, x2: FX + 150, y2: FY, "stroke-width": 4 }));
    const NP = [FX + SC * S.near.xy[0], FY + SC * S.near.xy[1]];
    const toNear = svg.appendChild(
      V.s("line", { x1: FX, y1: FY, x2: NP[0], y2: NP[1], "stroke-width": 4, "stroke-dasharray": "10 8" }),
    );
    ahead.style.stroke = grey;
    toNear.style.stroke = grey;
    const AR = 76;
    const ang = Math.atan2(S.near.xy[1], S.near.xy[0]);
    const arc = svg.appendChild(
      V.s("path", {
        d: `M${FX + AR} ${FY} A${AR} ${AR} 0 0 0 ${(FX + AR * Math.cos(ang)).toFixed(1)} ${(FY + AR * Math.sin(ang)).toFixed(1)}`,
        fill: "none",
        "stroke-width": 6,
        "stroke-linecap": "round",
        pathLength: 100,
      }),
    );
    arc.style.stroke = L11.tone("blue").c;
    const mates = P.map(() => L11.dart(svg, { size: 40, tone: "grey" }));
    const focus = L11.dart(svg, { size: 54, tone: "purple" });

    const cnt = L11.stat(stage, { x: 12, y: 540, w: 240, h: 80, label: "senses", tone: "orange" });
    const rTag = L11.tag(stage, { x: 268, y: 560, text: "radius 30", tone: "orange" });
    const nearTag = L11.tag(stage, { x: 540, y: 140, text: "45 away · 27 degrees left", tone: "orange" });
    L11.same(
      `${S.near.d} away · ${S.near.bearing} degrees ${S.near.side}`,
      "45 away · 27 degrees left",
      "scene 4: the nearest tag",
    );
    const behindTag = L11.tag(stage, { x: 12, y: 300, text: "behind: still seen", tone: "grey" });

    return (t) => {
      const R = Rat(t);
      const kc = ramp(t, 1.4, 1.8);
      circle.setAttribute("r", (SC * R * (0.6 + 0.4 * E.out(kc))).toFixed(1));
      circle.style.opacity = String(kc);
      mates.forEach((m, j) => {
        const k = L11.seq(t, 0.2, 0.05, 0.4, j);
        const inside = kc > 0 && dist[j] < R;
        const bump = reach[j] == null ? 0 : flash(t, reach[j], reach[j] + 0.3);
        const ring = j === BEHIND ? ramp(t, 8.0, 8.3) : 0;
        const pulse = j === BEHIND ? flash(t, 8.0, 8.6) : 0;
        m.set({
          x: P[j][0],
          y: P[j][1],
          r: 0,
          tone: inside ? "orange" : "grey",
          s: E.pop(k) * (1 + 0.25 * bump + 0.2 * pulse),
          o: Math.min(1, k * 4),
          ring,
        });
      });
      const kf = ramp(t, 0.6, 1.0);
      focus.set({ x: FX, y: FY, r: 0, s: E.pop(kf), o: Math.min(1, kf * 4), ring: kf });

      const n = kc > 0 ? countAt(R) : 0;
      const lastReach = Math.max(...reach.filter((x) => x != null && x <= t), -9);
      cnt.set({ text: String(n), k: ramp(t, 1.4, 1.8), bump: 0.6 * flash(t, lastReach, lastReach + 0.4) });
      rTag.set({ text: `radius ${Math.round(R)}`, k: ramp(t, 1.5, 1.9) });

      // distance and bearing of the nearest flockmate
      const kl = ramp(t, 5.8, 6.4);
      toNear.style.opacity = String(kl);
      toNear.setAttribute("x2", lerp(FX, NP[0], kl).toFixed(1));
      toNear.setAttribute("y2", lerp(FY, NP[1], kl).toFixed(1));
      nearTag.set({ k: ramp(t, 6.0, 6.4) });
      const ka = ramp(t, 6.4, 7.2);
      ahead.style.opacity = String(Math.min(1, ka * 3));
      arc.setAttribute("stroke-dasharray", `${(100 * ka).toFixed(1)} 200`);
      arc.style.opacity = ka > 0 ? "1" : "0";

      // all round: the one behind is still sensed
      behindTag.set({ k: ramp(t, 8.1, 8.5) });
    };
  },
});
