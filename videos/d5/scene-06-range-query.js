/* Lecture 5 · Partitioning, scene-06-range-query (11.5 s): PLACEHOLDER written by the architect, to be replaced by the scene author (spec: videos/_plan/ds-5.json, scene 6). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  V.scene({
    kicker: "THE PRICE OF HASHING",
    title: ["Hashing scatters", "range queries"],
    dur: 11.5,
    caps: [
      [0.4, 3.0, "The same 16 users, laid out two ways."],
      [3.4, 5.6, "Now ask for ids 101 to 104."],
      [6.0, 8.4, "Key ranges: all four are on one node."],
      [8.8, 11.1, "Hash: they are on four different nodes."],
    ],
    build(stage) {
      const tag = D5.tag(stage, { x: 330, y: 290, text: "scene 6 placeholder", tone: "blue", solid: true });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.6) });
    },
  });
})();
