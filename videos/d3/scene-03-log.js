/* Lecture 3 (ds-3) · scene-03-log.js: PLACEHOLDER written by the architect. Replace build() with the real scene; the spec is in
   videos/_plan/ds-3.json (scene 3). Keep kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { ramp } = V;
  V.scene({
    kicker: "THE LOG",
    title: ["The simplest database", "is a file you append to"],
    dur: 13,
    caps: [
      [0.5, 2.9, "A log is a file you only add to."],
      [3.1, 5.3, "Set adds a line at the end."],
      [5.6, 8.1, "Get scans for the last line of a key."],
      [8.5, 10.7, "Delete adds a tombstone line."],
      [10.9, 12.8, "The newest line says: deleted."],
    ],
    build(stage) {
      const card = D3.card(stage, { x: 288, y: 250, w: 360, h: 120, text: "scene 3: placeholder", tone: "grey" });
      return (t) => card.set({ k: ramp(t, 0.2, 0.7) });
    },
  });
})();
