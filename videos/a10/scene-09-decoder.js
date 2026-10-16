/* Phase 10 · Transformers & Attention (algo-10), scene 09-decoder: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 9 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "THE DECODER",
    title: ["The decoder writes", "one word at a time"],
    dur: 14,
    caps: [
      [0.5, 2, "Writing starts from a start token."],
      [2.1, 3.7, "Every possible next word gets a share."],
      [3.9, 5.5, "The likeliest word is written down."],
      [6.7, 8.7, "Masked attention: no peeking at later words."],
      [9.8, 11.6, "Append the word, then go round again."],
      [12.2, 13.8, "The end token stops the loop."],
    ],
    build(stage) {
      const sticker = V.h("div", {
        class: "v-tag solid c-green",
        text: "scene 9: decoder",
        style: { left: "300px", top: "250px" },
      });
      stage.append(sticker);
      return (lt) => V.place(sticker, { s: 0.8 + 0.2 * V.ramp(lt, 0.2, 0.7, V.ease.pop), o: V.ramp(lt, 0.2, 0.5) });
    },
  });
})();
