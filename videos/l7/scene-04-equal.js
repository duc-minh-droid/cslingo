/* Lecture 7 · scene-04-equal: the double bridge experiment, version 1. A nest and a food source are joined by two EQUAL bridges.
   Ants leave one per tick, lay pheromone and prefer a stronger trail, so each colony ends up on ONE bridge, but which one is
   chance: two simulated colonies (L7.EQ, seeds 77 and 58) run side by side and settle on opposite bridges.
   Every ant, trail and share comes from L7.bridgeAt (the lesson's model); the asserts below pin the figures the captions rely on.
   Local seconds: 0.2-1.4 the bridges build, 0.6 'pheromone' legend, 3.0-10.6 both colonies run (10 ticks per second),
   4.0 the share tags, 5.8 'thicker = stronger', 10.5-10.9 the ants fade, 10.7 and 11.0 the outcome stickers. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const L5 = V.l5;
  const { ease: E, ramp, place } = V;
  const { seq } = L7;
  const lin = E.lin;

  // ---------- the two colonies ----------
  const COLONIES = [
    { sim: L7.EQ.up, x: 12, name: "colony 1" },
    { sim: L7.EQ.down, x: 498, name: "colony 2" },
  ];
  const BOX = { y: 80, w: 426, h: 340, cy: 170 }; // 12 px side margins on the stage
  const RUN0 = 3.0; // the first ant leaves
  const RATE = 10; // ticks per second
  const LAST = 76; // the last tick we show
  const tickAt = (t) => V.clamp((t - RUN0) * RATE, 0, LAST);
  const tagsAt = 4.0; // ten ants have left

  // ---------- asserted figures (the captions rely on these) ----------
  const at = (c, T) => L7.bridgeAt(c.sim, T);
  const pctUp = (c, T) => Math.round(at(c, T).share);
  L7.same(
    "scene 4 outcomes (colony 1, colony 2)",
    COLONIES.map((c) => L7.outcome(c.sim)),
    ["up", "down"],
  );
  L7.same(
    "scene 4 first 20 ants on the upper bridge (%)",
    COLONIES.map((c) => Math.round(100 * L7.upShare(c.sim.picks.slice(0, 20)))),
    [50, 45],
  );
  L7.same(
    "scene 4 share on the upper bridge at T 10, 60, 76 (colony 1, colony 2)",
    COLONIES.map((c) => [10, 60, 76].map((T) => pctUp(c, T))),
    [
      [50, 100, 100],
      [30, 10, 0],
    ],
  );
  L7.close("scene 4 colony 1 trail (upper) at T 76", at(COLONIES[0], LAST).tauU, 42.7, 0.1);
  L7.close("scene 4 colony 1 trail (lower) at T 76", at(COLONIES[0], LAST).tauL, 8.3, 0.1);
  L7.close("scene 4 colony 2 trail (upper) at T 76", at(COLONIES[1], LAST).tauU, 9.9, 0.1);
  L7.close("scene 4 colony 2 trail (lower) at T 76", at(COLONIES[1], LAST).tauL, 41.1, 0.1);
  L7.close("scene 4 the run ends at tick 76", tickAt(10.6), LAST, 0.001);
  L7.close("scene 4 ten ticks per second from 3.0 s", tickAt(tagsAt), 10, 0.001);
  COLONIES.forEach((c) => {
    const [up, down] = at(c, tickAt(tagsAt)).n;
    if (up + down < 10) throw new Error("scene 4: fewer than ten ants have left when the share tags appear");
  });

  // ---------- geometry (stage px) ----------
  const SHARE_W = 222; // every share tag has the width of '100% of ants', so the pill never changes size
  const SHARE_DX = 55; // the tags sit a little right of each apex, clear of the 'colony' tag
  const STICKER_W = 402; // 'chose the upper bridge' + a tick on the left (text measured at 28 px bold)
  const STICKER_Y = 462;
  const LEGEND_Y = 566;
  const THICK_W = 346; // 'thicker = stronger' + the wedge icon on the left
  const HEIGHT = 58;

  const OUTCOME = { up: "upper", down: "lower" };

  V.scene({
    kicker: "THE DOUBLE BRIDGE",
    title: ["Two equal bridges,", "one winner"],
    dur: 12.5,
    caps: [
      [0.4, 2.8, "Ants can cross by either of two equal bridges."],
      [3.0, 5.6, "At first the ants choose at random."],
      [5.8, 8.6, "Each ant leaves pheromone and prefers a stronger trail."],
      [8.8, 10.6, "Soon most ants use one bridge."],
      [10.8, 12.2, "Which one is down to chance."],
    ],
    build(stage) {
      const bridges = COLONIES.map((c) => L7.bridge(stage, { x: c.x, ...BOX, dot: 9 }));
      const names = COLONIES.map((c) => L7.tag(stage, { x: c.x, y: 12, text: c.name, tone: "grey" }));

      // the share of the last ten ants: one tag above the upper apex, one below the lower apex
      const shares = bridges.map((b) => {
        const [hi, lo] = [b.apex(0), b.apex(1)];
        const mk = (y) => {
          const t = L7.tag(stage, { x: hi.x - SHARE_W / 2 + SHARE_DX, y, text: "0% of ants", tone: "grey", h: HEIGHT });
          t.el.style.width = `${SHARE_W}px`;
          return t;
        };
        return { up: mk(hi.y - 78), down: mk(lo.y + 22) };
      });

      // legend: the pheromone word is defined before the captions use it
      const pher = L7.tag(stage, { x: 100, y: LEGEND_Y, text: "pheromone: the scent trail", tone: "blue", h: HEIGHT });
      const thick = L7.tag(stage, { x: 560, y: LEGEND_Y, text: "thicker = stronger", tone: "grey", h: HEIGHT });
      thick.el.style.width = `${THICK_W}px`;
      thick.el.style.paddingLeft = "78px";

      // outcome stickers, one under each bridge
      const stickers = COLONIES.map((c) => {
        const left = c.x + BOX.w / 2 - STICKER_W / 2;
        const t = L7.tag(stage, {
          x: left,
          y: STICKER_Y,
          text: `chose the ${OUTCOME[L7.outcome(c.sim)]} bridge`,
          tone: "orange",
          solid: true,
          h: HEIGHT,
        });
        t.el.style.width = `${STICKER_W}px`;
        t.el.style.paddingLeft = "64px";
        return { t, left };
      });

      // pictograms above the tags: the line sample, the thick-thin wedge and the two ticks
      const over = L5.svg(stage);
      const sample = over.appendChild(
        V.s("path", {
          d: "M -30 0 L 30 0",
          fill: "none",
          "stroke-width": "12",
          "stroke-linecap": "round",
          style: { stroke: "var(--blue)" },
        }),
      );
      const wedge = over.appendChild(
        V.s("path", {
          d: "M -22 -3 L 22 -12 L 22 12 L -22 3 Z",
          "stroke-width": "3",
          "stroke-linejoin": "round",
          style: { fill: "var(--blue)", stroke: "var(--blue-lip)" },
        }),
      );
      const ticks = stickers.map((s) =>
        over.appendChild(L5.tick(s.left + 40, STICKER_Y + HEIGHT / 2, 34, "orange", { on: true })),
      );

      return (t) => {
        const T = tickAt(t);
        const fade = 1 - ramp(t, 10.5, 10.9, lin);
        const running = t >= RUN0 ? 1 : 0;

        bridges.forEach((b, i) => {
          const s = b.update({
            sim: COLONIES[i].sim,
            T,
            o: ramp(t, 0.1 + 0.2 * i, 0.4 + 0.2 * i, lin),
            ground: ramp(t, 0.3 + 0.2 * i, 0.9 + 0.2 * i, E.inOut),
            ants: running * fade,
          });
          const up = Math.round(s.share);
          const k = ramp(t, tagsAt + 0.15 * i, tagsAt + 0.15 * i + 0.4, lin);
          shares[i].up.set({ text: `${up}% of ants`, k });
          shares[i].down.set({ text: `${100 - up}% of ants`, k });
          names[i].set({ k: seq(t, 0.25, 0.2, 0.35, i) });
        });

        const kp = ramp(t, 0.6, 0.95, lin);
        pher.set({ k: kp });
        place(sample, { x: 53, y: LEGEND_Y + HEIGHT / 2, s: E.pop(kp), o: Math.min(1, kp * 4) });
        const kt = ramp(t, 5.8, 6.15, lin);
        thick.set({ k: kt });
        place(wedge, { x: 560 + 3 + 18 + 22, y: LEGEND_Y + HEIGHT / 2, s: E.pop(kt), o: Math.min(1, kt * 4) });

        stickers.forEach((s, i) => {
          const t0 = 10.7 + 0.3 * i;
          s.t.set({ k: ramp(t, t0, t0 + 0.35, lin) });
          L5.drawOn(ticks[i], ramp(t, t0 + 0.2, t0 + 0.5, lin));
        });
      };
    },
  });
})();
