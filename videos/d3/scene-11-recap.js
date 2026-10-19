/* Lecture 3 (ds-3) · scene-11-recap.js: PLACEHOLDER written by the architect. Replace with the real recap (spec: videos/_plan/ds-3.json,
   "recap"): three rows of small animated pictograms, Pebble and the call-to-action sticker. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const card = D3.card(stage, { x: 340, y: 480, w: 400, h: 120, text: "recap: placeholder", tone: "grey" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
