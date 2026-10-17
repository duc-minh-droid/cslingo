/* Lecture 7 · scene-10-colony: PLACEHOLDER (the scene author replaces build()). The storyboard is videos/_plan/lecture-7.json, scene 10.
   Kicker, headline, duration and captions below are final; the sticker only keeps the page and the total length right. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  V.scene({
    kicker: "MANY ANTS",
    title: ["Send many ants:", "the short tour wins"],
    dur: 12,
    caps: [
      [1.8, 3.6, "Ants go round one after another."],
      [3.8, 6.4, "A shorter tour adds more to each road."],
      [6.6, 9.4, "So the trail leans towards the shortest tour."],
      [9.8, 11.6, "Even though the first ants found only long tours."],
    ],
    build(stage) {
      const c = L7.card(stage, {
        x: 168,
        y: 250,
        w: 600,
        h: 120,
        text: "scene-10-colony (placeholder)",
        tone: "blue",
        plain: true,
        fs: 32,
      });
      return (t) => c.set({ k: V.ramp(t, 0.1, 0.5) });
    },
  });
})();
