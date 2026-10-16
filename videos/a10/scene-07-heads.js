/* Phase 10 · Transformers & Attention (algo-10), scene 07-heads: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 7 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "MULTI-HEAD",
    title: ["Several heads look", "for different links"],
    dur: 13,
    caps: [
      [1.1, 3.1, "Each head has its own query, key and value."],
      [3.3, 4.8, "One head finds what “it” means."],
      [5.1, 6.7, "Another looks at the word before."],
      [6.9, 9, "Others find who acts and what is acted on."],
      [9.1, 10.9, "Each head hands back 16 numbers per word."],
      [11.2, 12.8, "Glued together, they make 64 numbers."],
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
