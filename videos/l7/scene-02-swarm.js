/* Lecture 7 · scene-02-swarm: PLACEHOLDER (the scene author replaces build()). The storyboard is videos/_plan/lecture-7.json, scene 2.
   Kicker, headline, duration and captions below are final; the sticker only keeps the page and the total length right. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  V.scene({
    kicker: "SWARMS",
    title: ["Simple ants,", "clever colony"],
    dur: 10,
    caps: [
      [0.4, 2.8, "A colony is many identical, simple ants."],
      [3.0, 5.6, "Each one only reacts to its neighbours."],
      [5.8, 7.6, "There is no leader giving orders."],
      [7.8, 9.6, "Yet together they find the shortest route."],
    ],
    build(stage) {
      const c = L7.card(stage, {
        x: 168,
        y: 250,
        w: 600,
        h: 120,
        text: "scene-02-swarm (placeholder)",
        tone: "blue",
        plain: true,
        fs: 32,
      });
      return (t) => c.set({ k: V.ramp(t, 0.1, 0.5) });
    },
  });
})();
