/* Lecture 7 · scene-09-update: PLACEHOLDER (the scene author replaces build()). The storyboard is videos/_plan/lecture-7.json, scene 9.
   Kicker, headline, duration and captions below are final; the sticker only keeps the page and the total length right. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  V.scene({
    kicker: "UPDATING TRAILS",
    title: ["Evaporate first,", "then deposit"],
    dur: 11,
    caps: [
      [0.4, 2.4, "The ant has finished its tour. Now the trails update."],
      [2.6, 4.6, "First, every road keeps only half of its pheromone."],
      [4.8, 7.4, "Then each road on the tour gains Q ÷ length: 72 ÷ 18 = 4."],
      [7.6, 9.8, "Roads the ant skipped only lose pheromone."],
    ],
    build(stage) {
      const c = L7.card(stage, {
        x: 168,
        y: 250,
        w: 600,
        h: 120,
        text: "scene-09-update (placeholder)",
        tone: "blue",
        plain: true,
        fs: 32,
      });
      return (t) => c.set({ k: V.ramp(t, 0.1, 0.5) });
    },
  });
})();
