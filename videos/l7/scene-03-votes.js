/* Lecture 7 · scene-03-votes: PLACEHOLDER (the scene author replaces build()). The storyboard is videos/_plan/lecture-7.json, scene 3.
   Kicker, headline, duration and captions below are final; the sticker only keeps the page and the total length right. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  V.scene({
    kicker: "EMERGENCE",
    title: ["Many weak votes", "make a strong one"],
    dur: 11,
    caps: [
      [0.4, 2.8, "One scout is right 60% of the time."],
      [3.0, 6.0, "Eleven scouts vote, and the majority wins."],
      [6.2, 9.0, "Thirty-one scouts are right 87% of the time."],
      [9.2, 10.8, "Many weak votes make one strong choice."],
    ],
    build(stage) {
      const c = L7.card(stage, {
        x: 168,
        y: 250,
        w: 600,
        h: 120,
        text: "scene-03-votes (placeholder)",
        tone: "blue",
        plain: true,
        fs: 32,
      });
      return (t) => c.set({ k: V.ramp(t, 0.1, 0.5) });
    },
  });
})();
