/* Lecture 5 · Encodings, scene 03-mutation (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER",
    title: ["Scene 03-mutation"],
    dur: 5,
    build(stage) {
      const t = V.h("div", { class: "v-text big", text: "03-mutation", style: { left: "40px", top: "40px" } });
      stage.append(t);
      return () => {};
    },
  });
})();
