/* Lecture 6 · scene 11 (recap): PLACEHOLDER written by the architect (bare scene). The recap author replaces it, following the "recap" entry
   of videos/_plan/ds-6.json: three rows of small animated pictograms, Pebble and the call to action. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const card = D6.card(stage, { x: 240, y: 460, w: 600, h: 140, tone: "purple", text: "Recap (placeholder)" });
      return (t) => card.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
