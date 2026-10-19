/* Lecture 2 · scene 3 (MANY-TO-ONE) PLACEHOLDER: one labelled sticker so the page loads and the length is right. The scene author replaces
   this file following videos/_plan/ds-2.json (scene 3). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  V.scene({
    kicker: "MANY-TO-ONE",
    title: ["A company renames,", "who has to change?"],
    dur: 12.5,
    caps: [
      [0.5, 2.8, "One company, many profiles."],
      [3.1, 4.5, "Tables: change one row."],
      [4.7, 7.6, "Documents: rewrite all 400 copies."],
      [8.7, 11.9, "Miss one and that profile is stale."],
    ],
    build(stage) {
      const c = D2.card(stage, { x: 258, y: 240, w: 420, h: 120, text: "scene 3: many-to-one", tone: "grey" });
      return (t) => c.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
