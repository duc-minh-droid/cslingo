/* Lecture 5 · Encodings, scene 08-indirect (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER",
    title: ["Scene 08-indirect"],
    dur: 5,
    build(stage) {
      const t = V.h("div", { class: "v-text big", text: "08-indirect", style: { left: "40px", top: "40px" } });
      stage.append(t);
      return () => {};
    },
  });
})();
