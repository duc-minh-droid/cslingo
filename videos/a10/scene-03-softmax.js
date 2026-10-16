/* Phase 10 · Transformers & Attention (algo-10), scene 03-softmax: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 3 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "SOFTMAX",
    title: ["Softmax turns scores", "into shares"],
    dur: 11.5,
    caps: [
      [0.7, 2.6, "Imagine three words, each with a score."],
      [2.9, 4.8, "Stretch the scores: the biggest grows most."],
      [5, 7.3, "Divide by the total: the shares add to 1."],
      [7.7, 10.4, "Bigger gaps give a sharper share-out."],
    ],
    build(stage) {
      const sticker = V.h("div", {
        class: "v-tag solid c-green",
        text: "scene 3: softmax",
        style: { left: "300px", top: "250px" },
      });
      stage.append(sticker);
      return (lt) => V.place(sticker, { s: 0.8 + 0.2 * V.ramp(lt, 0.2, 0.7, V.ease.pop), o: V.ramp(lt, 0.2, 0.5) });
    },
  });
})();
