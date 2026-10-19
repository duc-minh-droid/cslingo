/* Lecture 1 (ds-1), scene 10: maintainable = easy to run, understand and change. Story (local seconds): 0.3-1.2 three stickers
   (easy to run / understand / change, with their official words under them), 2.2 the third bumps, 2.9-3.2 they leave; 3.2-3.8 five
   services and four databases pop in, 3.8-4.8 the 20 lines draw (the "connections" counter counts the lines as they land);
   5.4 a "replace it" tag under Orders DB, 5.6 it turns orange with its five lines and the five services that touch it,
   5.9-6.7 a wrench badge lands on each service and "to edit" counts to 5; 7.4 back to calm; 7.8-8.8 the data-access layer fades in,
   the direct lines fade out, "connections" counts 20 -> 9; 9.9 the tag returns, 10.0 Orders DB and the layer turn orange,
   10.3 one wrench badge on the layer, "to edit" 5 -> 1 (green). Numbers all come from D1.MAINT (asserted in common.js). */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const M = D1.MAINT;

  const T = {
    cards: 0.3,
    cardsOut: [2.9, 3.2],
    boxes: [3.2, 3.8],
    lines: [3.8, 4.8],
    tag1: 5.4,
    hot1: 5.6,
    badge1: 5.9,
    calm: 7.4,
    layer: [7.8, 8.8],
    tag2: 9.9,
    hot2: 10.0,
    badge2: 10.3,
    green: 10.9,
  };

  // the arch helper draws its direct lines with a staggered ramp: count the ones that have fully landed (same rule as common-4.js)
  const LINE_K = 1.05; // a little over 1 so the last line is complete when the ramp ends
  const landed = (lineK) =>
    M.edges.filter((_, n) => clamp(lineK * 1.6 - (n % 5) * 0.12 - Math.floor(n / 5) * 0.05) >= 0.999).length;
  if (landed(LINE_K) !== M.direct)
    throw new Error("maintain scene: every direct line must be drawn when the ramp ends");
  if (landed(0.2) !== 0) throw new Error("maintain scene: no line is drawn at the start");

  const KINDS = [
    { text: "easy to run", word: "operability", tone: "green", icon: "gear" },
    { text: "easy to understand", word: "simplicity", tone: "purple", icon: "doc" },
    { text: "easy to change", word: "evolvability", tone: "orange", icon: "wrench" },
  ];

  // a small round sticker with an orange wrench: "this box has to be edited"
  function badge(svg) {
    const lip = V.s("circle", { r: 22, cy: 4, "stroke-width": 0, style: { fill: D1.tone("orange").lip } });
    const disc = V.s("circle", {
      r: 22,
      "stroke-width": 4,
      style: { fill: "var(--panel)", stroke: D1.tone("orange").lip },
    });
    const g = V.s("g", {}, lip, disc, D1.icon.wrench(0, 0, 28, "orange"));
    svg.append(g);
    return g;
  }

  V.scene({
    kicker: "MAINTAINABILITY",
    title: ["Maintainable systems", "are easy to change"],
    dur: 12.2,
    caps: [
      [0.5, 2.9, "Three kinds of easy: run, understand, change."],
      [3.4, 5.4, "Every service talks to every database."],
      [5.6, 7.6, "Swap one database: edit all five."],
      [7.8, 9.8, "One layer in between: 9 connections."],
      [10.0, 11.9, "Now only the layer changes."],
    ],
    build(stage) {
      // ---- intro: three kinds of easy ----
      const iconLayer = L5.svg(stage);
      const CW = 284;
      const GAP = 24;
      const X0 = (936 - 3 * CW - 2 * GAP) / 2;
      const kinds = KINDS.map((k, i) => {
        const x = X0 + i * (CW + GAP);
        const icon = D1.icon[k.icon](x + CW / 2, 215, 84, k.tone);
        iconLayer.append(icon);
        return {
          x,
          icon,
          card: D1.card(stage, { x, y: 290, w: CW, h: 110, text: k.text, tone: k.tone, plain: false, fs: 32 }),
          word: D1.label(stage, { x, y: 420, w: CW, text: k.word, tone: k.tone, fs: 32, bold: true }),
        };
      });

      // ---- the architecture and its counters ----
      const a = D1.arch(stage, { x: 0, y: 0 });
      const bar = a.el.children[1];
      if (bar.textContent !== "data-access layer")
        throw new Error("maintain scene: layer bar not found in the arch figure");
      const conn = D1.stat(stage, { x: 20, y: 542, w: 420, h: 80, label: "connections", tone: "grey" });
      const edit = D1.stat(stage, { x: 480, y: 542, w: 420, h: 80, label: "to edit", tone: "orange" });
      const replace = D1.tag(stage, {
        x: a.dbMid(M.hot).x - D1.tagW("replace it") / 2,
        y: 484,
        h: 48,
        text: "replace it",
        tone: "orange",
        solid: true,
      });
      const badgeLayer = L5.svg(stage);
      const svcBadges = M.services.map((_, i) => ({ g: badge(badgeLayer), at: { x: a.svcMid(i).x + 46, y: 94 } }));
      const layerBadge = { g: badge(badgeLayer), at: { x: 882, y: 215 } };

      return (t) => {
        // intro
        const out = ramp(t, T.cardsOut[0], T.cardsOut[1], E.lin);
        kinds.forEach((k, i) => {
          const kk = ramp(t, T.cards + i * 0.2, T.cards + i * 0.2 + 0.5, E.lin);
          const o = (1 - out) * Math.min(1, kk * 4);
          const bump = i === 2 ? 0.07 * flash(t, 2.2, 2.8) : 0;
          k.card.set({ k: kk, o: 1 - out, y: -14 * out, s: 1 + bump });
          k.word.set({
            k: ramp(t, T.cards + i * 0.2 + 0.25, T.cards + i * 0.2 + 0.65, E.lin),
            o: 1 - out,
            y: -14 * out,
          });
          V.place(k.icon, { y: -14 * out, s: (0.7 + 0.3 * E.pop(kk)) * (1 + bump), o });
        });

        // the figure
        const k = ramp(t, T.boxes[0], T.boxes[1], E.lin);
        const lineK = ramp(t, T.lines[0], T.lines[1], E.lin) * LINE_K;
        const layer = ramp(t, T.layer[0], T.layer[1], E.inOut);
        const phase1 = t >= T.hot1 && t < T.calm;
        const phase2 = t >= T.hot2;
        const hot = phase1 || phase2 ? 1 : 0;
        const hotK = phase2 ? ramp(t, T.hot2, T.hot2 + 0.8, E.lin) : ramp(t, T.hot1, T.hot1 + 0.8, E.lin);
        const r = a.update({ k, direct: 1, layer, hot, hotK, lineK });
        // the layer bar is only styled by the helper while it is highlighted: style it here every frame
        const barHot = hot && layer >= 0.5;
        bar.className = `v-card c-${barHot ? "orange" : "purple"}`;
        V.place(bar, {
          s: (0.9 + 0.1 * E.pop(layer)) * (barHot ? 1 + 0.05 * E.pop(hotK) : 1),
          o: Math.min(1, layer * 4),
        });

        // wrench badges: one per service that must be edited (five), or one on the layer
        const b1 = svcBadges.map((_, i) => D1.seq(t, T.badge1, 0.16, 0.35, i));
        svcBadges.forEach((b, i) => {
          const p = phase1 ? b1[i] : 0;
          V.place(b.g, { x: b.at.x, y: b.at.y, s: 0.6 + 0.4 * E.pop(p), o: Math.min(1, p * 4) });
        });
        const p2 = phase2 ? ramp(t, T.badge2, T.badge2 + 0.4, E.lin) : 0;
        V.place(layerBadge.g, {
          x: layerBadge.at.x,
          y: layerBadge.at.y,
          s: 0.6 + 0.4 * E.pop(p2),
          o: Math.min(1, p2 * 4),
        });

        // the replace tag under Orders DB
        const tagOn = (t >= T.tag1 && t < T.calm) || t >= T.tag2;
        const tagK = tagOn
          ? t >= T.tag2
            ? ramp(t, T.tag2, T.tag2 + 0.4, E.lin)
            : ramp(t, T.tag1, T.tag1 + 0.4, E.lin)
          : 0;
        const tagOut = t >= T.calm && t < T.tag2 ? 1 - ramp(t, T.calm, T.calm + 0.3, E.lin) : 1;
        replace.set({ k: t >= T.calm && t < T.tag2 ? 1 : tagK, o: tagOut });

        // counters
        const nConn = layer > 0 ? Math.round(lerp(M.direct, M.layered, layer)) : landed(lineK);
        conn.set({
          text: nConn,
          tone: layer >= 0.5 ? "purple" : "grey",
          k: ramp(t, T.lines[0], T.lines[0] + 0.4, E.lin),
          bump: flash(t, T.layer[1] - 0.1, T.layer[1] + 0.4),
        });
        const shown1 = b1.filter((p) => p >= 0.5).length;
        const nEdit = phase2 ? (p2 >= 0.5 ? r.edit : M.editDirect) : phase1 ? shown1 : t >= T.calm ? M.editDirect : 0;
        if (shown1 === M.services.length && r.edit !== M.editDirect && !phase2 && layer < 0.5)
          throw new Error("maintain scene: five services must be edited without the layer");
        edit.set({
          text: nEdit,
          tone: phase1 ? "orange" : phase2 ? (t >= T.green ? "green" : "orange") : "grey",
          k: ramp(t, T.hot1, T.hot1 + 0.4, E.lin),
          bump: phase2 ? flash(t, T.badge2, T.badge2 + 0.5) : 0,
        });
      };
    },
  });
})();
