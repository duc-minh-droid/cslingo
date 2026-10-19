/* Lecture 3 (ds-3) · scene-08-merge.js: PLACEHOLDER written by the architect. Replace build() with the real scene; the spec is in
   videos/_plan/ds-3.json (scene 8). Keep kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { ramp } = V;
  V.scene({
    kicker: "SSTABLES",
    title: ["Sorted segments merge", "like merge sort"],
    dur: 14,
    caps: [
      [0.5, 2.6, "Three sorted segments, oldest left."],
      [2.9, 4.4, "Take the smallest key first."],
      [4.5, 6.0, "Repeats: the newest wins."],
      [6.1, 7.9, "A newer tombstone deletes it."],
      [11.1, 13.5, "One sorted segment, no old values."],
    ],
    build(stage) {
      const card = D3.card(stage, { x: 288, y: 250, w: 360, h: 120, text: "scene 8: placeholder", tone: "grey" });
      return (t) => card.set({ k: ramp(t, 0.2, 0.7) });
    },
  });
})();
