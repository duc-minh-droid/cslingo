/* Lecture 5 · Partitioning, scene-05-hash (13 s): PLACEHOLDER written by the architect, to be replaced by the scene author (spec: videos/_plan/ds-5.json, scene 5). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  V.scene({
    kicker: "HASH PARTITIONING",
    title: ["Hash the key,", "spread the load"],
    dur: 13,
    caps: [
      [0.4, 2.6, "A hash turns a key into a number."],
      [3.0, 5.4, "Each node owns a range of hash values."],
      [6.0, 9.4, "Keys arrive in order but land all over."],
      [9.8, 12.6, "Eight keys: two on every node."],
    ],
    build(stage) {
      const tag = D5.tag(stage, { x: 330, y: 290, text: "scene 5 placeholder", tone: "blue", solid: true });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.6) });
    },
  });
})();
