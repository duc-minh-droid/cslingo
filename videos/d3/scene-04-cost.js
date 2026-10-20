/* Lecture 3 (ds-3) · scene-04-cost.js: PLACEHOLDER written by the architect. Replace build() with the real scene; the spec is in
   videos/_plan/ds-3.json (scene 4). Keep kicker, title, dur and caps. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { ramp } = V;
  V.scene({
    kicker: "THE COST",
    title: ["Appending is cheap,", "finding means scanning"],
    dur: 11,
    caps: [
      [0.5, 2.9, "A write is one append: one step."],
      [3.4, 6.0, "A read scans every line."],
      [7.0, 9.2, "Twice the data, twice the scan."],
      [9.3, 10.8, "We need an index."],
    ],
    build(stage) {
      const card = D3.card(stage, { x: 288, y: 250, w: 360, h: 120, text: "scene 4: placeholder", tone: "grey" });
      return (t) => card.set({ k: ramp(t, 0.2, 0.7) });
    },
  });
})();
