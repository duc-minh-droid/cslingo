/* Lecture 7 · scene-04-equal: PLACEHOLDER (the scene author replaces build()). The storyboard is videos/_plan/lecture-7.json, scene 4.
   Kicker, headline, duration and captions below are final; the sticker only keeps the page and the total length right. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
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
      const c = L7.card(stage, {
        x: 168,
        y: 250,
        w: 600,
        h: 120,
        text: "scene-04-equal (placeholder)",
        tone: "blue",
        plain: true,
        fs: 32,
      });
      return (t) => c.set({ k: V.ramp(t, 0.1, 0.5) });
    },
  });
})();
