/* Algorithms Phase 8 video (algo-8): title card.
   "Cryptography & Blockchain" is wider than the card's 92 px headline allows, so the headline is set to 72 px after the card is built. */
(function () {
  const card = VID.titleCard({
    kicker: "Algorithms · Phase 8",
    title: "Cryptography & Blockchain",
    sub: "How secrets and trust work online",
    who: "byte",
    dur: 4,
  });
  const build = card.build;
  card.build = (stage, V) => {
    const update = build(stage, V);
    stage.querySelectorAll(".v-title-line").forEach((e) => {
      e.style.fontSize = "68px";
      e.style.whiteSpace = "nowrap";
    });
    return update;
  };
})();
