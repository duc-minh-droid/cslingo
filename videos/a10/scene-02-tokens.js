/* Phase 10 · Transformers & Attention (algo-10), scene 02-tokens: PLACEHOLDER with the right kicker, title, length and captions.
   Replace build() with the real scene; the brief is scene 2 of videos/_plan/algo-10.json, the helpers are videos/a10/common*.js. */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "WORDS TO NUMBERS",
    title: ["Words become numbers,", "plus their position"],
    dur: 13,
    caps: [
      [0.5, 2.3, "Text is cut into tokens."],
      [2.5, 4.3, "Each token becomes a list of numbers."],
      [4.6, 6.4, "The two banks get exactly the same numbers."],
      [6.5, 8.2, "Nothing says which one came first."],
      [8.5, 10.3, "Add a position pattern to every token."],
      [11, 12.7, "Now the two banks are different."],
    ],
    build(stage) {
      const sticker = V.h("div", {
        class: "v-tag solid c-green",
        text: "scene 2: tokens",
        style: { left: "300px", top: "250px" },
      });
      stage.append(sticker);
      return (lt) => V.place(sticker, { s: 0.8 + 0.2 * V.ramp(lt, 0.2, 0.7, V.ease.pop), o: V.ramp(lt, 0.2, 0.5) });
    },
  });
})();
