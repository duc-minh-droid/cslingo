/* Lecture 5 · Partitioning, scene-02-split (12 s): PLACEHOLDER written by the architect, to be replaced by the scene author (spec: videos/_plan/ds-5.json, scene 2). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  V.scene({
    kicker: "WHY PARTITION",
    title: ["Copies do not fit,", "so split the data"],
    dur: 12,
    caps: [
      [0.4, 2.6, "Twelve orders. Each node has room for eight."],
      [2.8, 5.0, "A full copy on every node does not fit."],
      [5.4, 7.8, "So split them: each order lives in one partition."],
      [8.2, 11.6, "Each partition is also copied to another node."],
    ],
    build(stage) {
      const tag = D5.tag(stage, { x: 330, y: 290, text: "scene 2 placeholder", tone: "blue", solid: true });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.6) });
    },
  });
})();
