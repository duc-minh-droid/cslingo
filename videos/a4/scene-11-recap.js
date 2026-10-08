/* Phase 4 · scene 11-recap: PLACEHOLDER (the scene author replaces it with the three animated rows). */
(function () {
  const V = window.VID;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      stage.append(
        V.h("div", {
          class: "v-card c-green",
          text: "scene 11-recap",
          style: {
            left: "240px",
            top: "480px",
            width: "600px",
            height: "110px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
          },
        }),
      );
      return () => {};
    },
  });
})();
