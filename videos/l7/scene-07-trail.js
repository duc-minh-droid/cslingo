/* Lecture 7 · scene-07-trail: PLACEHOLDER (the scene author replaces build()). The storyboard is videos/_plan/lecture-7.json, scene 7.
   Kicker, headline, duration and captions below are final; the sticker only keeps the page and the total length right. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  V.scene({
    kicker: "PHEROMONE TRAILS",
    title: ["Trails build up", "and fade away"],
    dur: 13,
    caps: [
      [1.4, 3.4, "Each step, ants add pheromone to a trail."],
      [3.6, 6.2, "Each step, a fifth of it evaporates."],
      [6.4, 8.0, "It levels off where gain equals loss."],
      [8.2, 10.0, "A stronger trail has a higher chance of being picked."],
      [10.2, 12.6, "If the ants stop, the trail fades away."],
    ],
    build(stage) {
      const c = L7.card(stage, {
        x: 168,
        y: 250,
        w: 600,
        h: 120,
        text: "scene-07-trail (placeholder)",
        tone: "blue",
        plain: true,
        fs: 32,
      });
      return (t) => c.set({ k: V.ramp(t, 0.1, 0.5) });
    },
  });
})();
