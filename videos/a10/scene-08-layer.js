/* Phase 10 · Transformers & Attention (algo-10), scene 08-layer: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 8 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "ONE LAYER",
    title: ["Each layer mixes words,", "then thinks about each"],
    dur: 12.5,
    caps: [
      [0.5, 2, "A layer has two main parts."],
      [2.2, 3.9, "Attention lets the words share information."],
      [4.2, 6, "A skip path adds the input back."],
      [6.2, 7.9, "Norm keeps the numbers steady."],
      [8.2, 9.9, "The network then treats each word alone."],
      [10.2, 12.1, "Same shape in and out, so layers stack."],
    ],
    build(stage) {
      const sticker = V.h("div", {
        class: "v-tag solid c-green",
        text: "scene 8: layer",
        style: { left: "300px", top: "250px" },
      });
      stage.append(sticker);
      return (lt) => V.place(sticker, { s: 0.8 + 0.2 * V.ramp(lt, 0.2, 0.7, V.ease.pop), o: V.ramp(lt, 0.2, 0.5) });
    },
  });
})();
