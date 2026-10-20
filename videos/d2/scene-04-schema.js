/* Lecture 2 · scene 4 (SCHEMA) PLACEHOLDER: one labelled sticker so the page loads and the length is right. The scene author replaces
   this file following videos/_plan/ds-2.json (scene 4). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  V.scene({
    kicker: "SCHEMA",
    title: ["Changing the shape", "of your data"],
    dur: 13.5,
    caps: [
      [0.5, 2.4, "Old and new shapes sit side by side."],
      [2.6, 4.8, "The app splits old names as it reads."],
      [5.2, 7.6, "A table must change every row first."],
      [8.0, 11.6, "On a big table that takes a long time."],
      [11.8, 13.3, "Only then is it ready."],
    ],
    build(stage) {
      const c = D2.card(stage, { x: 258, y: 240, w: 420, h: 120, text: "scene 4: schema", tone: "grey" });
      return (t) => c.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
