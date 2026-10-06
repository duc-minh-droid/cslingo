/* Lecture 5 · Encodings, scene 04-swap (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER",
    title: ["Scene 04-swap"],
    dur: 5,
    build(stage) {
      const t = V.h("div", { class: "v-text big", text: "04-swap", style: { left: "40px", top: "40px" } });
      stage.append(t);
      return () => {};
    },
  });
})();
