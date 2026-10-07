/* Lecture 3 video, scene-04-too-many.js (placeholder) */
(function () {
  const V = window.VID;
  V.scene({
    kicker: "PLACEHOLDER", title: ["scene-04-too-many.js"],
    dur: 9,
    build(stage) {
      stage.append(V.h("div", { class: "v-text big", text: "scene-04-too-many.js", style: { left: "40px", top: "40px" } }));
      return () => {};
    },
  });
})();
