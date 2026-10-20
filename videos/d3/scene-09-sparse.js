/* Lecture 3 (ds-3) · scene-09-sparse.js: PLACEHOLDER written by the architect. Replace build() with the real scene; the spec is in
   videos/_plan/ds-3.json (scene 9). Keep kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { ramp } = V;
  V.scene({
    kicker: "SPARSE INDEX",
    title: ["Sorted keys need only", "a sparse index"],
    dur: 11.5,
    caps: [
      [0.5, 2.7, "A segment sorted by key."],
      [3.0, 5.4, "The index holds only some keys."],
      [5.7, 7.5, "Jump to the key before it."],
      [7.6, 9.1, "Scan a short block."],
      [9.3, 11.3, "A range: one jump, read on."],
    ],
    build(stage) {
      const card = D3.card(stage, { x: 288, y: 250, w: 360, h: 120, text: "scene 9: placeholder", tone: "grey" });
      return (t) => card.set({ k: ramp(t, 0.2, 0.7) });
    },
  });
})();
