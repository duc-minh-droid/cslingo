/* Lecture 4 video, scene-03-replacement.js (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER", title: ["scene-03-replacement.js"],
    dur: 10,
    build(stage) {
      stage.append(V.h("div", { class: "v-text big", text: "scene-03-replacement.js", style: { left: "40px", top: "40px" } }));
      return () => {};
    },
  });
})();
