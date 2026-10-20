/* Lecture 3 (ds-3) · scene-10-memtable.js: PLACEHOLDER written by the architect. Replace build() with the real scene; the spec is in
   videos/_plan/ds-3.json (scene 10). Keep kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { ramp } = V;
  V.scene({
    kicker: "MEMTABLE",
    title: ["Writes land in memory,", "then reach disk sorted"],
    dur: 14.5,
    caps: [
      [0.5, 2.8, "Writes land in memory first."],
      [3.0, 5.6, "A tree keeps the keys in order."],
      [6.0, 8.2, "When full, write it out in order."],
      [8.4, 10.2, "New writes get a new memtable."],
      [10.5, 12.4, "Reads check memory, then newest."],
      [12.5, 14.3, "First hit wins: fig 11, not 8."],
    ],
    build(stage) {
      const card = D3.card(stage, { x: 288, y: 250, w: 360, h: 120, text: "scene 10: placeholder", tone: "grey" });
      return (t) => card.set({ k: ramp(t, 0.2, 0.7) });
    },
  });
})();
