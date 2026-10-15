/* Phase 10 · Transformers & Attention (algo-10), scene 07-heads: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 7 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "MULTI-HEAD",
    title: ["Several heads look", "for different links"],
    dur: 12.5,
    caps: [
      [0.5, 2.3, "Each head has its own query, key and value."],
      [1.7, 3.3, "One head finds what “it” means."],
      [3.5, 5.1, "Another looks at the word before."],
      [5.3, 7.1, "Others find who acts and what is acted on."],
      [7.6, 9.2, "Each head hands back 16 numbers per word."],
      [9.5, 11.5, "Glued together, they make 64 numbers again."],
    ],
    build(stage) {
      const sticker = V.h("div", {
        class: "v-tag solid c-green",
        text: "scene 7: heads",
        style: { left: "300px", top: "250px" },
      });
      stage.append(sticker);
      return (lt) => V.place(sticker, { s: 0.8 + 0.2 * V.ramp(lt, 0.2, 0.7, V.ease.pop), o: V.ramp(lt, 0.2, 0.5) });
    },
  });
})();
