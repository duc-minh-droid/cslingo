/* Lecture 5 · Partitioning, scene-10-dynamic (10.5 s): PLACEHOLDER written by the architect, to be replaced by the scene author (spec: videos/_plan/ds-5.json, scene 10). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  V.scene({
    kicker: "DYNAMIC PARTITIONS",
    title: ["Big partitions split,", "small ones merge"],
    dur: 10.5,
    caps: [
      [0.4, 2.8, "Each partition has a size limit: 10 GB."],
      [3.0, 5.4, "Data grows: P2 reaches 12 GB, over the limit."],
      [5.8, 8.0, "It splits in two, and one half can move node."],
      [8.2, 10.2, "Data shrinks: small neighbours merge."],
    ],
    build(stage) {
      const tag = D5.tag(stage, { x: 330, y: 290, text: "scene 10 placeholder", tone: "blue", solid: true });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.6) });
    },
  });
})();
