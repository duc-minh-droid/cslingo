/* Phase 10 · Transformers & Attention (algo-10), scene 06-values: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 6 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "VALUES",
    title: ["The shares blend", "the values"],
    dur: 12.5,
    caps: [
      [0.9, 2.9, "Each word also carries a value: its content."],
      [3.3, 5, "Scale each value by its share."],
      [5.6, 7.2, "Add them up: new numbers for “barked”."],
      [7.8, 9.5, "Do it for every word at once."],
      [10, 11.9, "One new set of numbers per word."],
    ],
    build(stage) {
      const sticker = V.h("div", {
        class: "v-tag solid c-green",
        text: "scene 6: values",
        style: { left: "300px", top: "250px" },
      });
      stage.append(sticker);
      return (lt) => V.place(sticker, { s: 0.8 + 0.2 * V.ramp(lt, 0.2, 0.7, V.ease.pop), o: V.ramp(lt, 0.2, 0.5) });
    },
  });
})();
