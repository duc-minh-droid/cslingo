/* Lecture 5 · Partitioning, scene-03-ranges (12 s): PLACEHOLDER written by the architect, to be replaced by the scene author (spec: videos/_plan/ds-5.json, scene 3). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  V.scene({
    kicker: "KEY RANGES",
    title: ["Each partition owns", "a range of keys"],
    dur: 12,
    caps: [
      [0.4, 2.4, "Give each node a range of sorted keys."],
      [2.8, 5.8, "Okafor sits between N and S, so it goes to node 3."],
      [6.6, 9.0, "Ask for Khan to Mills: one node has them all."],
      [9.2, 11.6, "Neighbouring keys sit together."],
    ],
    build(stage) {
      const tag = D5.tag(stage, { x: 330, y: 290, text: "scene 3 placeholder", tone: "blue", solid: true });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.6) });
    },
  });
})();
