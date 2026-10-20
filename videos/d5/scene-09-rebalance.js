/* Lecture 5 · Partitioning, scene-09-rebalance (13.5 s): PLACEHOLDER written by the architect, to be replaced by the scene author (spec: videos/_plan/ds-5.json, scene 9). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  V.scene({
    kicker: "REBALANCING",
    title: ["A new node joins:", "move as little as you can"],
    dur: 13.5,
    caps: [
      [0.4, 3.2, "Twelve items on three nodes. A fourth joins."],
      [3.6, 6.8, "Hash mod N: N changed, so 9 of 12 keys move."],
      [7.4, 10.4, "Fixed partitions: it steals 3 whole ones."],
      [10.8, 13.1, "Three moves instead of nine."],
    ],
    build(stage) {
      const tag = D5.tag(stage, { x: 330, y: 290, text: "scene 9 placeholder", tone: "blue", solid: true });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.6) });
    },
  });
})();
