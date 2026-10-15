/* Phase 10 · Transformers & Attention (algo-10), scene 10-patches: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 10 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "BEYOND TEXT",
    title: ["Anything can be cut", "into tokens"],
    dur: 12,
    caps: [
      [0.9, 2.5, "A picture can be cut into patches."],
      [2.8, 4.6, "Each patch is a token: 196 in all."],
      [5, 6.8, "Every token scores every token: 196 × 196."],
      [7.4, 9.4, "Half-size patches: four times the tokens."],
      [9.6, 11.6, "But sixteen times the scores."],
    ],
    build(stage) {
      const sticker = V.h("div", {
        class: "v-tag solid c-green",
        text: "scene 10: patches",
        style: { left: "300px", top: "250px" },
      });
      stage.append(sticker);
      return (lt) => V.place(sticker, { s: 0.8 + 0.2 * V.ramp(lt, 0.2, 0.7, V.ease.pop), o: V.ramp(lt, 0.2, 0.5) });
    },
  });
})();
