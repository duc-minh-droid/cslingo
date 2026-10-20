/* Lecture 2 · scene 5 (LOCALITY) PLACEHOLDER: one labelled sticker so the page loads and the length is right. The scene author replaces
   this file following videos/_plan/ds-2.json (scene 5). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  V.scene({
    kicker: "LOCALITY",
    title: ["One document,", "one read"],
    dur: 12.5,
    caps: [
      [0.5, 2.2, "The page wants the whole profile."],
      [2.6, 5.4, "One read from the document, six from tables."],
      [6.2, 8.0, "Now it wants only the name."],
      [8.4, 11.8, "Locality loads all 20 KB for a tiny sliver."],
    ],
    build(stage) {
      const c = D2.card(stage, { x: 258, y: 240, w: 420, h: 120, text: "scene 5: locality", tone: "grey" });
      return (t) => c.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
