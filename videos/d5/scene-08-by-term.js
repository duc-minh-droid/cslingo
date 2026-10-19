/* Lecture 5 · Partitioning, scene-08-by-term (12 s): PLACEHOLDER written by the architect, to be replaced by the scene author (spec: videos/_plan/ds-5.json, scene 8). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  V.scene({
    kicker: "SECONDARY INDEXES",
    title: ["Split the index by term:", "one read, wider writes"],
    dur: 12,
    caps: [
      [0.4, 3.2, "Or split the index itself, by term."],
      [3.6, 6.6, "A search reads just one index partition."],
      [7.0, 10.0, "Save a blue mini: two index partitions change."],
      [10.2, 11.7, "Cheap reads, dearer writes."],
    ],
    build(stage) {
      const tag = D5.tag(stage, { x: 330, y: 290, text: "scene 8 placeholder", tone: "blue", solid: true });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.6) });
    },
  });
})();
