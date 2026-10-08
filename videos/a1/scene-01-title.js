/* Algorithms Phase 1 video (algo-1): title card.
   "Foundations & PageRank" is wider than the card's 92 px headline allows, so the headline is set to 80 px after the card is built. */
(function () {
  const card = VID.titleCard({
    kicker: "Algorithms · Phase 1",
    title: "Foundations & PageRank",
    sub: "How Google ranked the web",
    who: "byte",
    dur: 4,
  });
  const build = card.build;
  card.build = (stage, V) => {
    const update = build(stage, V);
    stage.querySelectorAll(".v-title-line").forEach((e) => (e.style.fontSize = "80px"));
    return update;
  };
})();
