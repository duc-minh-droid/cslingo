/* Lecture 2 video, scene-03-too-many.js (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER", title: ["scene-03-too-many.js"],
    dur: 12,
    build(stage) {
      stage.append(V.h("div", { class: "v-text big", text: "scene-03-too-many.js", style: { left: "40px", top: "40px" } }));
      return () => {};
    },
  });
})();
