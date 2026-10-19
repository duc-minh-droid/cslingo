/* Lecture 3 (ds-3) · scene-06-segments.js: PLACEHOLDER written by the architect. Replace build() with the real scene; the spec is in
   videos/_plan/ds-3.json (scene 6). Keep kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { ramp } = V;
  V.scene({
    kicker: "SEGMENTS",
    title: ["Cut the log into segments,", "then compact them"],
    dur: 13,
    caps: [
      [0.5, 2.8, "A log that only grows fills the disk."],
      [3.0, 6.0, "So close a file at its size limit."],
      [6.4, 9.0, "Many records, only three keys."],
      [9.4, 12.6, "Compaction keeps the latest value per key."],
    ],
    build(stage) {
      const card = D3.card(stage, { x: 288, y: 250, w: 360, h: 120, text: "scene 6: placeholder", tone: "grey" });
      return (t) => card.set({ k: ramp(t, 0.2, 0.7) });
    },
  });
})();
