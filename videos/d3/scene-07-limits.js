/* Lecture 3 (ds-3) · scene-07-limits.js: PLACEHOLDER written by the architect. Replace build() with the real scene; the spec is in
   videos/_plan/ds-3.json (scene 7). Keep kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { ramp } = V;
  V.scene({
    kicker: "HASH INDEX · LIMITS",
    title: ["Keys must fit in memory,", "and ranges are slow"],
    dur: 10.5,
    caps: [
      [1.0, 4.4, "The whole map must fit in memory."],
      [5.6, 8.2, "A range needs one lookup per key."],
      [8.5, 10.3, "Sorted keys sit side by side."],
    ],
    build(stage) {
      const card = D3.card(stage, { x: 288, y: 250, w: 360, h: 120, text: "scene 7: placeholder", tone: "grey" });
      return (t) => card.set({ k: ramp(t, 0.2, 0.7) });
    },
  });
})();
