/* Lecture 11 · Flocking, scene 10 (agents, lesson 11.4): a boid is a tiny agent. Left: a close window that follows boid 36 of
   L11.RUN.FORM (purple, the agent). Right: the agent loop as four cards, sensors -> percept -> actuators -> the world changes,
   with a return arrow back to the sensors.
   Story (local seconds): 0.2-0.7 window and agent; cards pop 0.5-1.4. SENSE 0.8-2.8: card 1 lights, the orange radius grows
   (1.2-1.8) and the 4 flockmates inside turn orange. PERCEPT 3.1-5.0: card 2 lights, a dashed orange line to the nearest one
   and the tag 'nearest 40 away, on its right' (3.4). ACT 5.3-7.4: card 3 lights, the tag 'turn right 6 degrees' (5.5,
   this one tick); ticks 60 -> 68 play over 5.8-7.2 (the purple trail shows the turn) and the tag then counts the live total,
   'turned right N degrees', up to 33. WORLD 7.7-10.6: card 4 lights, ticks 68 -> 120 play over 7.7-10.2 and the percept
   card follows the live count (L11.percept); the return arrow draws 8.6-9.4 and card 1 lights again at 9.6.
   Every number comes from L11.RUN.FORM.agent and L11.percept (the real run), asserted here. */
(function () {
  const V = window.VID;
  const L11 = V.l11;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const R = L11.RUN.FORM;
  const A = R.agent;
  const P0 = L11.percept(R, A.tick, A.i);
  L11.same(
    [A.tick, A.i, A.n, A.d, A.side, A.turn],
    [60, 36, 4, 40, "on its right", 6],
    "scene 10: the agent's numbers",
  );
  L11.same(P0.n, A.n, "scene 10: the percept count at tick 60");
  L11.same(Math.round(P0.near.d), A.d, "scene 10: the nearest flockmate's distance");
  L11.same(P0.near.side, A.side, "scene 10: the nearest flockmate's side");
  L11.same(Math.round(P0.turn), A.turn, "scene 10: the turn at tick 60");
  L11.same(A.turn > 0, true, "scene 10: + is a turn to the right");
  const turnWord = A.turn > 0 ? "right" : "left";
  const mates = (n) => `${n} flockmate${n === 1 ? "" : "s"}`;

  const T = {
    act: [5.8, 7.2],
    world: [7.7, 10.2],
    ACT_TICKS: 8,
    WORLD_TICKS: 60,
  };
  // which card is lit: sense, percept, act, world, then sense again
  const active = (t) => (t >= 9.6 ? 0 : t >= 7.7 ? 3 : t >= 5.3 ? 2 : t >= 3.1 ? 1 : t >= 0.8 ? 0 : -1);
  const tickAt = (t) => {
    if (t < T.act[0]) return A.tick;
    if (t < T.world[0]) return A.tick + T.ACT_TICKS * ramp(t, ...T.act, E.inOut);
    return A.tick + T.ACT_TICKS + (T.WORLD_TICKS - T.ACT_TICKS) * ramp(t, ...T.world, E.lin);
  };
  // the turn so far (degrees, + = right) from the agent's heading at tick 60: one tick turns it 6 degrees, the eight ticks
  // of the act beat add up to about 33, so once the ticks play the tag reads this live total instead
  const hdgAt = (tick) => {
    const p = L11.at(R, tick)[A.i];
    return (Math.atan2(p.vy, p.vx) * 180) / Math.PI;
  };
  const turnedBy = (tick) => ((((hdgAt(tick) - hdgAt(A.tick)) % 360) + 540) % 360) - 180;
  const TURNED = Math.round(turnedBy(A.tick + T.ACT_TICKS));
  L11.same(TURNED, 33, "scene 10: the turn over the act beat (ticks 60 -> 68)");
  L11.same(TURNED > 0 === A.turn > 0, true, "scene 10: the act beat keeps turning the same way");

  V.scene({
    kicker: "AGENTS",
    title: ["A boid is", "a tiny agent"],
    dur: 11,
    caps: [
      [0.5, 2.8, "An agent senses its world with sensors."],
      [3.1, 5, "What it senses right now is its percept."],
      [5.3, 7.4, "Then it acts with actuators: here, a turn."],
      [7.7, 10.6, "The others move too, so it senses again."],
    ],
    build(stage) {
      const WIN = { x: 0, y: 40, w: 440, h: 440 };
      const fv = L11.field(stage, { ...WIN, zoom: 2.2, size: 30 });
      const over = L5.svg(stage);
      const near = L11.vec(over, { tone: "orange", w: 5, head: 1 });

      const CARD = { x: 496, w: 392, h: 84, ys: [40, 150, 260, 370] };
      const cards = [
        ["sensors: look around", "orange"],
        [`percept: ${mates(A.n)}`, "orange"],
        [`actuators: turn ${turnWord}`, "purple"],
        ["the world changes", "grey"],
      ].map(([text, tone], i) =>
        L11.card(stage, { x: CARD.x, y: CARD.ys[i], w: CARD.w, h: CARD.h, text, tone, plain: true, fs: 30 }),
      );
      const down = [0, 1, 2].map((i) =>
        over.appendChild(L5.arrow(474, CARD.ys[i] + 50, 474, CARD.ys[i + 1] + 34, "grey", 1, { w: 6, head: 16 })),
      );
      const back = over.appendChild(
        L5.arrow(CARD.x + CARD.w + 4, CARD.ys[3] + 42, CARD.x + CARD.w + 4, CARD.ys[0] + 42, "grey", 1, {
          w: 6,
          head: 18,
          bow: -22,
        }),
      );

      const nearTag = L11.tag(stage, { x: 0, y: 500, text: `nearest ${A.d} away, ${A.side}`, tone: "orange" });
      const turnTag = L11.tag(stage, {
        x: 0,
        y: 560,
        text: `turn ${turnWord} ${Math.abs(A.turn)} degrees`,
        tone: "purple",
      });

      return (t) => {
        const tick = tickAt(t);
        const win = ramp(t, 0.2, 0.7);
        const radius = ramp(t, 1.2, 1.8, E.out);
        const hood = t >= 1.8 ? 1 : 0;
        fv.update({
          run: R,
          tick,
          cam: "focus",
          focus: A.i,
          ring: win,
          radius,
          hood,
          dim: 0.6,
          trail: tick > A.tick ? 20 : 0,
          o: win,
        });

        // the dashed line to the nearest flockmate (percept beat, gone when the world moves on)
        // fv.boid() is in the window's own pixels: shift by the window's place on the stage, and stop short of both boids
        const lineK = ramp(t, 3.3, 3.7) * (1 - ramp(t, 5.3, 5.6));
        const [a, b] = [fv.boid(A.i), fv.boid(P0.near.j)];
        const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const [ux, uy] = [(b.x - a.x) / d, (b.y - a.y) / d];
        near.set({
          x1: WIN.x + a.x + ux * 42,
          y1: WIN.y + a.y + uy * 42,
          x2: WIN.x + b.x - ux * 22,
          y2: WIN.y + b.y - uy * 22,
          k: ramp(t, 3.3, 3.7),
          o: lineK,
          dash: true,
        });

        const LIT = [0.8, 3.1, 5.3, 7.7];
        const on = active(t);
        const live = L11.percept(R, tick, A.i).n;
        cards.forEach((c, i) => {
          const text = i === 1 ? `percept: ${mates(t >= T.world[0] ? live : A.n)}` : undefined;
          c.set({
            k: L11.seq(t, 0.5, 0.25, 0.4, i),
            plain: i !== on,
            text,
            s: 1 + 0.05 * (flash(t, LIT[i], LIT[i] + 0.35) + (i === 0 ? flash(t, 9.6, 9.95) : 0)),
          });
        });
        down.forEach((g, i) => L5.drawOn(g, ramp(t, 0.9 + 0.25 * i, 1.3 + 0.25 * i)));
        L5.drawOn(back, ramp(t, 8.6, 9.4, E.inOut));
        V.show(back, t >= 8.6);

        const fade = 1 - ramp(t, 7.7, 8.0);
        nearTag.set({ k: ramp(t, 3.4, 3.8), o: fade });
        const turning = tick > A.tick + 0.05 && t < T.world[0];
        turnTag.set({
          text: turning
            ? `turned ${turnWord} ${Math.round(Math.abs(turnedBy(tick)))} degrees`
            : t < T.world[0]
              ? `turn ${turnWord} ${Math.abs(A.turn)} degrees`
              : `turned ${turnWord} ${Math.abs(TURNED)} degrees`,
          k: ramp(t, 5.5, 5.9),
          o: fade,
        });
      };
    },
  });
})();
