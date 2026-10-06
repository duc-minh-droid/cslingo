/* Lecture 5 · Encodings, scene 07-direct (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER",
    title: ["Scene 07-direct"],
    dur: 5,
    build(stage) {
      const t = V.h("div", { class: "v-text big", text: "07-direct", style: { left: "40px", top: "40px" } });
      stage.append(t);
      return () => {};
    },
  });
})();
