/* Lecture 7 · scene-05-short: PLACEHOLDER (the scene author replaces build()). The storyboard is videos/_plan/lecture-7.json, scene 5.
   Kicker, headline, duration and captions below are final; the sticker only keeps the page and the total length right. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  V.scene({
    kicker: "THE DOUBLE BRIDGE",
    title: ["The short bridge", "gets paid first"],
    dur: 14,
    caps: [
      [0.4, 2.4, "Now one road is twice as long as the other."],
      [2.6, 4.6, "Ants walk at the same speed, so the short trip ends first."],
      [4.8, 7.4, "Its pheromone builds up first, so more ants pick it."],
      [7.6, 9.4, "Soon almost every ant takes the short road."],
      [9.8, 11.8, "Out of 200 colonies, 85% pick the short road."],
      [12.0, 13.6, "A few still lock onto the long one."],
    ],
    build(stage) {
      const c = L7.card(stage, {
        x: 168,
        y: 250,
        w: 600,
        h: 120,
        text: "scene-05-short (placeholder)",
        tone: "blue",
        plain: true,
        fs: 32,
      });
      return (t) => c.set({ k: V.ramp(t, 0.1, 0.5) });
    },
  });
})();
