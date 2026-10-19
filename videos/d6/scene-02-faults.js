/* Lecture 6 · scene 02 (faults): PLACEHOLDER written by the architect. The scene author replaces it, following the "spec" of
   videos/_plan/ds-6.json (scene 2). Kicker, title, duration and captions are final. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  V.scene({
    kicker: "THINGS GO WRONG",
    title: ["Distributed systems", "fail in four ways"],
    dur: 10,
    caps: [
      [0.7, 2.2, "A node can crash."],
      [3.5, 5.0, "A message can get lost."],
      [5.9, 7.4, "A reply can arrive late."],
      [8.1, 9.7, "The network can split in two."],
    ],
    build(stage) {
      const card = D6.card(stage, { x: 268, y: 250, w: 400, h: 140, tone: "purple", text: "Things Go Wrong" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
