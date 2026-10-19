/* Lecture 2 · scene 9 (CHOOSING) PLACEHOLDER: one labelled sticker so the page loads and the length is right. The scene author replaces
   this file following videos/_plan/ds-2.json (scene 9). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  V.scene({
    kicker: "CHOOSING",
    title: ["Pick the family by", "the question"],
    dur: 13.0,
    caps: [
      [0.5, 1.9, "Four kinds of job, four families."],
      [2.8, 4.3, "A cart by user id: key-value."],
      [5.1, 6.6, "A whole product page: document."],
      [7.4, 8.9, "Friends of friends: graph."],
      [9.7, 11.4, "Varying columns: wide-column."],
      [11.6, 12.8, "Pick by the question."],
    ],
    build(stage) {
      const c = D2.card(stage, { x: 258, y: 240, w: 420, h: 120, text: "scene 9: choosing", tone: "grey" });
      return (t) => c.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();
