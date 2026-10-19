/* Lecture 1 (ds-1), scene 10: maintainable = easy to run, understand and change. Story (local seconds): 0.15-1.0 three stickers
   (easy to run / understand / change, with their official words under them), 2.75 the third bumps, 3.2-3.5 they leave; 3.45-3.8
   five services and four databases pop in, 3.6-4.15 the 20 lines draw (the "connections" counter counts the lines as they land);
   5.45 a "replace it" tag under Orders DB, 5.5 it turns orange with its five lines and the five services that touch it,
   5.65-6.4 a wrench badge lands on each of those services and "to edit" counts to 5; 7.85-8.45 the data-access layer fades in
   and the direct lines fade out ("connections" 20 -> 9; the hot state ends when the layer passes half way); 9.75 the tag
   returns, 9.8 Orders DB and the layer turn orange, 10.0 one wrench badge on the layer, "to edit" 5 -> 1 (green).
   Numbers all come from D1.MAINT (asserted in common.js). Captions run at 17.6 to 18.0 characters per second.
   Local workarounds (common-4.js is not edited): the figure sits in a wrapper scaled to 96 % so the cards that span the whole
   stage keep a 12 px margin; the database cards get their " DB" back; the layer bar is styled here because the helper only
   styles it while it is highlighted. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const M = D1.MAINT;

  const T = {
    cards: 0.15,
    bump: [2.75, 3.2],
    cardsOut: [3.2, 3.5],
    boxes: [3.45, 3.8],
    lines: [3.6, 4.15],
    tag1: 5.45,
    hot1: 5.5,
    badge1: 5.65,
    layer: [7.85, 8.45],
    fade1: [7.9, 8.2],
    tag2: 9.75,
    hot2: 9.8,
    badge2: 10.0,
    edit: [10.1, 10.4],
    green: 10.5,
  };
  const SC = 0.96; // the architecture figure is 936 px wide: this keeps its edge cards (and their orange pop) 12 px inside the stage

  // the arch helper draws its direct lines with a staggered ramp: count the ones that have fully landed (same rule as common-4.js)
  const LINE_K = 1.05; // a little over 1 so the last line is complete when the ramp ends
  const landed = (lineK) =>
    M.edges.filter((_, n) => clamp(lineK * 1.6 - (n % 5) * 0.12 - Math.floor(n / 5) * 0.05) >= 0.999).length;
  if (landed(LINE_K) !== M.direct)
    throw new Error("maintain scene: every direct line must be drawn when the ramp ends");
  if (landed(0.2) !== 0) throw new Error("maintain scene: no line is drawn at the start");

  // the services that touch the database being replaced: each gets a wrench badge
  const toEdit = [...new Set(M.edges.filter(([, d]) => d === M.hot).map(([s]) => s))];
  if (toEdit.length !== M.editDirect) throw new Error("maintain scene: five services must touch the replaced database");

  const KINDS = [
    { text: "easy to\nrun", word: "operability", tone: "green", icon: "gear" },
    { text: "easy to\nunderstand", word: "simplicity", tone: "purple", icon: "doc" },
    { text: "easy to\nchange", word: "evolvability", tone: "orange", icon: "wrench" },
  ];

  // a small round sticker with an orange wrench: "this box has to be edited"
  function badge(svg) {
    const t = D1.tone("orange");
    const lip = V.s("circle", { r: 17, cy: 3, "stroke-width": 0, style: { fill: t.lip } });
    const disc = V.s("circle", { r: 17, "stroke-width": 3, style: { fill: "var(--panel)", stroke: t.lip } });
    const g = V.s("g", {}, lip, disc, D1.icon.wrench(0, 0, 22, "orange"));
    svg.append(g);
    return g;
  }

  V.scene({
    kicker: "MAINTAINABILITY",
    title: ["Maintainable systems", "are easy to change"],
    dur: 12.2,
    caps: [
      [0.75, 3.3, "Three kinds of easy: run, understand, change."],
      [3.95, 6.1, "Every service talks to every database."],
      [6.3, 8.15, "Swap one database: edit all five."],
      [8.35, 10.35, "One layer in between: 9 connections."],
      [10.5, 12, "Now only the layer changes."],
    ],
    build(stage) {
      // ---- intro: three kinds of easy ----
      const iconLayer = L5.svg(stage);
      const CW = 276;
      const GAP = 24;
      const X0 = (936 - 3 * CW - 2 * GAP) / 2;
      const kinds = KINDS.map((k, i) => {
        const x = X0 + i * (CW + GAP);
        const icon = D1.icon[k.icon](x + CW / 2, 215, 84, k.tone);
        iconLayer.append(icon);
        const card = D1.card(stage, { x, y: 290, w: CW, h: 118, text: k.text, tone: k.tone, plain: false, fs: 36 });
        card.el.style.whiteSpace = "pre-line";
        card.el.style.lineHeight = "1.15";
        return {
          x,
          icon,
          card,
          word: D1.label(stage, { x, y: 430, w: CW, text: k.word, tone: k.tone, fs: 34, bold: true }),
        };
      });

      // ---- the architecture and its counters ----
      const fig = V.h("div", {
        style: { position: "absolute", left: "0px", top: "0px", width: "936px", height: "640px" },
      });
      stage.append(fig);
      V.place(fig, { s: SC });
      const a = D1.arch(fig, { x: 0, y: 0 });
      const parts = [...a.el.children];
      const bar = parts[1];
      if (bar.textContent !== "data-access layer")
        throw new Error("maintain scene: layer bar not found in the arch figure");
      // the helper drops " DB" from the database cards; put it back so the bottom row reads as databases
      parts.slice(-M.dbs.length).forEach((c, j) => {
        if (c.textContent !== M.dbs[j].replace(" DB", "")) throw new Error("maintain scene: database card not found");
        c.textContent = M.dbs[j];
      });
      const conn = D1.stat(stage, { x: 20, y: 542, w: 428, h: 80, label: "connections", tone: "grey" });
      const edit = D1.stat(stage, { x: 488, y: 542, w: 428, h: 80, label: "to edit", tone: "orange" });
      const hotMid = a.dbMid(M.hot);
      const tagW = D1.tagW("replace it");
      const replace = D1.tag(stage, {
        x: 468 + (hotMid.x - 468) * SC - tagW / 2,
        y: 484,
        h: 48,
        text: "replace it",
        tone: "orange",
        solid: true,
      });
      const badgeLayer = L5.svg(fig);
      // wrench badges sit on the top right corner of each service card that must be edited, and of the layer bar
      const svcBadges = toEdit.map((s) => ({ g: badge(badgeLayer), at: { x: a.svcMid(s).x + 82 - 14, y: 28 } }));
      const layerBadge = { g: badge(badgeLayer), at: { x: 898, y: 213 } };

      return (t) => {
        // intro
        const out = ramp(t, T.cardsOut[0], T.cardsOut[1], E.lin);
        kinds.forEach((k, i) => {
          const t0 = T.cards + i * 0.15;
          const kk = ramp(t, t0, t0 + 0.35, E.lin);
          const o = (1 - out) * Math.min(1, kk * 4);
          const bump = i === 2 ? 0.07 * flash(t, T.bump[0], T.bump[1]) : 0;
          k.card.set({ k: kk, o: 1 - out, y: -14 * out, s: 1 + bump });
          k.word.set({ k: ramp(t, t0 + 0.2, t0 + 0.55, E.lin), o: 1 - out, y: -14 * out });
          const spin = i === 0 ? 40 * Math.max(0, t - t0) : i === 2 ? 10 * Math.sin((t - t0) * 6) : 0;
          V.place(k.icon, { y: -14 * out, r: spin, s: (0.7 + 0.3 * E.pop(kk)) * (1 + bump), o });
        });

        // the figure
        const k = ramp(t, T.boxes[0], T.boxes[1], E.lin);
        const lineK = ramp(t, T.lines[0], T.lines[1], E.lin) * LINE_K;
        const layer = ramp(t, T.layer[0], T.layer[1], E.inOut);
        const phase1 = t >= T.hot1 && layer < 0.5; // "replace Orders DB" with only direct lines
        const phase2 = t >= T.hot2; // the same change with the layer in place
        const hot = phase1 || phase2 ? 1 : 0;
        const hotK = phase2 ? ramp(t, T.hot2, T.hot2 + 0.6, E.lin) : ramp(t, T.hot1, T.hot1 + 0.6, E.lin);
        const r = a.update({ k, direct: 1, layer, hot, hotK, lineK });
        if (phase1 && r.edit !== M.editDirect)
          throw new Error("maintain scene: five services must be edited without the layer");
        if (phase2 && r.edit !== M.editLayer)
          throw new Error("maintain scene: only the layer must be edited with the layer");
        // the layer bar is only styled by the helper while it is highlighted: style it here every frame
        bar.className = `v-card c-${phase2 ? "orange" : "purple"}`;
        V.place(bar, {
          s: (0.9 + 0.1 * E.pop(layer)) * (phase2 ? 1 + 0.03 * E.pop(hotK) : 1),
          o: Math.min(1, layer * 4),
        });

        // wrench badges: one per service that must be edited (five), or one on the layer
        const gone = 1 - ramp(t, T.fade1[0], T.fade1[1], E.lin);
        const b1 = svcBadges.map((_, i) => D1.seq(t, T.badge1, 0.12, 0.28, i));
        svcBadges.forEach((b, i) => {
          const p = b1[i];
          V.place(b.g, { x: b.at.x, y: b.at.y, s: 0.6 + 0.4 * E.pop(p), o: Math.min(1, p * 4) * gone });
        });
        const p2 = ramp(t, T.badge2, T.badge2 + 0.35, E.lin);
        V.place(layerBadge.g, {
          x: layerBadge.at.x,
          y: layerBadge.at.y,
          s: 0.6 + 0.4 * E.pop(p2),
          o: Math.min(1, p2 * 4),
        });

        // the replace tag under Orders DB: first for the direct design, then again for the layer
        const tagK = t >= T.tag2 ? ramp(t, T.tag2, T.tag2 + 0.35, E.lin) : ramp(t, T.tag1, T.tag1 + 0.35, E.lin);
        replace.set({ k: tagK, o: t >= T.tag2 ? 1 : gone });

        // counters
        const nConn = layer > 0 ? Math.round(lerp(M.direct, M.layered, layer)) : landed(lineK);
        conn.set({
          text: nConn,
          tone: layer >= 0.5 ? "purple" : "grey",
          k: ramp(t, T.lines[0], T.lines[0] + 0.4, E.lin),
          bump: 0.25 * flash(t, T.layer[1] - 0.15, T.layer[1] + 0.35),
        });
        const shown1 = b1.filter((p) => p >= 0.5).length;
        // while no change is proposed (the calm layered state) the old count stays, grey
        const calm = !phase1 && !phase2 && layer >= 0.5;
        const nEdit = phase2
          ? Math.round(lerp(M.editDirect, M.editLayer, ramp(t, T.edit[0], T.edit[1], E.lin)))
          : calm
            ? M.editDirect
            : shown1;
        edit.set({
          text: nEdit,
          tone: phase2 ? (t >= T.green ? "green" : "orange") : calm ? "grey" : "orange",
          k: ramp(t, T.hot1, T.hot1 + 0.4, E.lin),
          bump: phase2 ? 0.25 * flash(t, T.edit[1] - 0.1, T.edit[1] + 0.4) : 0,
        });
      };
    },
  });
})();
