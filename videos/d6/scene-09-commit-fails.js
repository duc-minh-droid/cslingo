/* Lecture 6 · scene 09 (commit-fails): PLACEHOLDER written by the architect. The scene author replaces it, following the "spec" of
   videos/_plan/ds-6.json (scene 9). Kicker, title, duration and captions are final. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  V.scene({
    kicker: "CONSENSUS",
    title: ["Many nodes must", "agree on one answer"],
    dur: 10,
    caps: [
      [0.5, 2.4, "Several databases must agree."],
      [2.8, 4.6, "It just sends commit to all."],
      [5.0, 6.9, "One conflicts, one never hears."],
      [7.4, 9.4, "Now the databases disagree."],
    ],
    build(stage) {
      const card = D6.card(stage, { x: 268, y: 250, w: 400, h: 140, tone: "purple", text: "Consensus" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
