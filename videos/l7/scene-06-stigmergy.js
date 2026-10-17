/* Lecture 7 · scene-06-stigmergy: PLACEHOLDER (the scene author replaces build()). The storyboard is videos/_plan/lecture-7.json, scene 6.
   Kicker, headline, duration and captions below are final; the sticker only keeps the page and the total length right. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  V.scene({
    kicker: "STIGMERGY",
    title: ["Ants talk through", "the ground"],
    dur: 11,
    caps: [
      [0.8, 3.4, "One ant leaves a scent mark on the ground."],
      [3.9, 6.2, "A later ant senses the mark and follows it."],
      [6.4, 8.0, "That is stigmergy: talking through the environment."],
      [8.4, 10.6, "Scent is a sign. Building itself can also prompt others."],
    ],
    build(stage) {
      const c = L7.card(stage, {
        x: 168,
        y: 250,
        w: 600,
        h: 120,
        text: "scene-06-stigmergy (placeholder)",
        tone: "blue",
        plain: true,
        fs: 32,
      });
      return (t) => c.set({ k: V.ramp(t, 0.1, 0.5) });
    },
  });
})();
