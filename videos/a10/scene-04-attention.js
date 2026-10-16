/* Phase 10 · Transformers & Attention (algo-10), scene 04-attention: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 4 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "ATTENTION",
    title: ["Every word looks at", "every other word"],
    dur: 12,
    caps: [
      [1, 2.6, "Which noun does “it” stand for?"],
      [2.8, 4.6, "It looks at every word in the sentence."],
      [5, 6.8, "But some words matter more than others."],
      [7.2, 9, "Its new meaning leans on “robot”."],
      [9.6, 11.6, "Every word does this, all at the same time."],
    ],
    build(stage) {
      const sticker = V.h("div", {
        class: "v-tag solid c-green",
        text: "scene 4: attention",
        style: { left: "300px", top: "250px" },
      });
      stage.append(sticker);
      return (lt) => V.place(sticker, { s: 0.8 + 0.2 * V.ramp(lt, 0.2, 0.7, V.ease.pop), o: V.ramp(lt, 0.2, 0.5) });
    },
  });
})();
