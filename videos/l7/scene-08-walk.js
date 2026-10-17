/* Lecture 7 · scene-08-walk: PLACEHOLDER (the scene author replaces build()). The storyboard is videos/_plan/lecture-7.json, scene 8.
   Kicker, headline, duration and captions below are final; the sticker only keeps the page and the total length right. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  V.scene({
    kicker: "ANTS ON A MAP",
    title: ["Pick the next town", "by trail and distance"],
    dur: 14,
    caps: [
      [1.0, 2.6, "An ant starts on one town."],
      [2.8, 4.8, "Each town left gets a weight: pheromone ÷ distance."],
      [5.0, 6.8, "The weights become chances, and the dice picks one."],
      [7.0, 9.8, "Visited towns go into its tour memory, so it never repeats one."],
      [10.0, 12.4, "It carries on until every town is visited, then returns home."],
      [12.6, 13.8, "The tour is 4 + 6 + 3 + 5 = 18 long."],
    ],
    build(stage) {
      const c = L7.card(stage, {
        x: 168,
        y: 250,
        w: 600,
        h: 120,
        text: "scene-08-walk (placeholder)",
        tone: "blue",
        plain: true,
        fs: 32,
      });
      return (t) => c.set({ k: V.ramp(t, 0.1, 0.5) });
    },
  });
})();
