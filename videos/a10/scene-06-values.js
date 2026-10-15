/* Phase 10 · Transformers & Attention (algo-10), scene 06-values: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 6 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "VALUES",
    title: ["The shares blend", "the values"],
    dur: 12.5,
    caps: [
      [0.6, 2.4, "Each word also carries a value: its content."],
      [2.8, 4.8, "Scale each value by its share."],
      [5.2, 7, "Add them up: a new vector for “barked”."],
      [7.8, 9.6, "Do it for every word at once."],
      [10, 12, "One new vector for each word."],
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
