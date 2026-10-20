/* Lecture 5 · Partitioning, scene-04-hotspot (12.5 s): PLACEHOLDER written by the architect, to be replaced by the scene author (spec: videos/_plan/ds-5.json, scene 4). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  V.scene({
    kicker: "THE TIMESTAMP TRAP",
    title: ["Keyed by time,", "every write hits one node"],
    dur: 12.5,
    caps: [
      [0.4, 2.6, "Key by time: each node owns some hours."],
      [3.0, 5.8, "It is afternoon, so new writes go to 12 to 17."],
      [6.2, 9.0, "Write after write, all on the same node."],
      [9.4, 12.1, "One hot spot while three nodes sit idle."],
    ],
    build(stage) {
      const tag = D5.tag(stage, { x: 330, y: 290, text: "scene 4 placeholder", tone: "blue", solid: true });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.6) });
    },
  });
})();
