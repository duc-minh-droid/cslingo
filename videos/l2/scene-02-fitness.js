/* Lecture 2 video, scene 02: a solution is a bit string, a fitness function scores it, exhaustive search tries all 8. */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const L5 = V.l5;
  const { ramp, ease: E, clamp } = V;
  const tone = (n) => L5.tone(n);
  const SUBS = L2.subsets();
  const SHELF = L2.shelf();
  const LINE_X = 60 + L2.TARGET * L2.PX_KG;
  const STACK_Y = 150;
  const T0 = 2.8;
  const STEP = 0.85;
  const FINAL_AT = 9.8;
  const CARD = { w: 98, gap: 12, x: 34, y: 352, h: 268, k: 1.5 };
  const BEST = SUBS.findIndex((s) => s.bits === L2.BEST);
  // trial list: 8 in binary order, then the best one re-formed
  const TRIALS = [
    ...SUBS.map((s, k) => ({ bits: s.bits, at: T0 + STEP * k, k })),
    { bits: L2.BEST, at: FINAL_AT, k: 8 },
  ];

  const posOf = (bits, i) => {
    const b = L2.stack(bits).blocks.find((q) => q.i === i);
    return b ? { x: b.x, y: STACK_Y, away: 1 } : { x: SHELF[i].x, y: 0, away: 0 };
  };

  V.scene({
    kicker: "FITNESS",
    title: ["Every solution gets", "a fitness score"],
    dur: 12,
    caps: [
      [0.3, 2.4, "Three items. Aim for 100 kg in total."],
      [2.6, 4.8, "Bits: 1 takes an item, 0 leaves it."],
      [5.0, 7.8, "Fitness f(s): how far from 100 kg. Smaller is better."],
      [8.0, 9.7, "Exhaustive search: try every subset."],
      [9.9, 11.5, "Try all 8: 110 is the best."],
    ],
    build(stage) {
      const abs = (x, y, w, h) => ({
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
      });
      // target line (behind everything)
      const line = V.h("div", {
        style: { ...abs(LINE_X - 2, 136, 0, 0), borderLeft: `5px dashed ${tone("green").c}`, boxSizing: "border-box" },
      });
      stage.append(line);
      // placeholders and blocks
      const holders = SHELF.map((b) =>
        V.h("div", {
          class: "v-card c-blue",
          style: {
            ...abs(b.x, 0, b.width, 64),
            background: "transparent",
            borderStyle: "dashed",
            boxShadow: "none",
            borderRadius: "16px",
          },
        }),
      );
      const blocks = SHELF.map((b) =>
        V.h("div", {
          class: "v-card c-blue",
          text: `${b.kg} kg`,
          style: {
            ...abs(b.x, 0, b.width, 64),
            borderRadius: "16px",
            boxShadow: "0 4px 0 var(--c-edge)",
            fontSize: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }),
      );
      stage.append(...holders, ...blocks);
      // gap bar and its tag
      const gapBar = V.h("div", {
        style: { ...abs(60, 226, 0, 12), borderRadius: "6px", background: tone("red").c },
      });
      stage.append(gapBar);
      const gapTag = L2.tag(stage, { text: "f = 0", tone: "red", x: 0, y: 244, anchor: "tc" });
      const tgtTag = L2.tag(stage, { text: "100 kg", tone: "green", solid: true, x: LINE_X, y: 112, anchor: "c" });
      const formula = L2.tag(stage, { text: "f(s) = |weight − 100|", tone: "purple", x: 468, y: 318, anchor: "c" });
      // bit tiles, one per item, centred under its shelf block
      const rows = SHELF.map((b) => {
        const row = L5.chromosome(stage, { x: b.x + b.width / 2 - 26, y: 72, genes: "0", size: 52, tone: "grey" });
        row.tiles[0].style.borderRadius = "14px";
        row.tiles[0].style.boxShadow = "0 4px 0 var(--c-edge)";
        return row;
      });
      // the 8 cards
      const cards = SUBS.map((s, i) => {
        const bitsEl = V.h("div", {
          class: "v-mono",
          text: s.bits,
          style: { ...abs(0, 8, CARD.w - 6, 40), textAlign: "center", fontSize: "32px", lineHeight: "40px" },
        });
        const bar = V.h("div", {
          style: {
            position: "absolute",
            left: "24px",
            width: "44px",
            bottom: "12px",
            boxSizing: "border-box",
            borderRadius: "10px 10px 4px 4px",
          },
        });
        const val = V.h("div", {
          text: String(s.f),
          style: {
            position: "absolute",
            left: "0",
            width: `${CARD.w - 6}px`,
            textAlign: "center",
            fontSize: "30px",
            lineHeight: "36px",
            fontWeight: "900",
          },
        });
        const card = V.h(
          "div",
          {
            class: "v-card",
            style: { ...abs(CARD.x + i * (CARD.w + CARD.gap), CARD.y, CARD.w, CARD.h), borderRadius: "22px" },
          },
          bitsEl,
          bar,
          val,
        );
        stage.append(card);
        return { card, bitsEl, bar, val };
      });
      const svg = L5.svg(stage);
      const star = L2.star(CARD.x + BEST * (CARD.w + CARD.gap) + CARD.w / 2, 336, 46, "orange");
      svg.append(star);

      const tile = (i, from, to, k, o, s) => {
        const second = k >= 0.5;
        const bit = second ? to : from;
        rows[i].set(0, {
          text: bit,
          tone: bit === "1" ? "blue" : "grey",
          solid: bit === "1",
          ghost: bit !== "1",
          sx: Math.abs(Math.cos(Math.PI * k)),
          s,
          o,
        });
      };

      return (t) => {
        // 0.2-1.4 shelf, target line, tag
        const shelfP = SHELF.map((_, i) => ramp(t, 0.2 + 0.2 * i, 0.8 + 0.2 * i, E.lin));
        const lineK = ramp(t, 0.8, 1.4, E.inOut);
        line.style.height = `${146 * lineK}px`;
        line.style.visibility = lineK <= 0 ? "hidden" : "";
        const tp = ramp(t, 1.0, 1.4, E.lin);
        tgtTag.set({ s: E.pop(tp), o: clamp(tp * 4) });
        const fp = ramp(t, 1.6, 2.4, E.lin);
        formula.set({ s: E.pop(fp), o: clamp(fp * 4) });

        // which trial are we in
        let ti = -1;
        TRIALS.forEach((tr, i) => {
          if (t >= tr.at) ti = i;
        });
        const cur = ti < 0 ? { bits: "000", at: 0 } : TRIALS[ti];
        const prevBits = ti <= 0 ? "000" : TRIALS[ti - 1].bits;
        const u = t - cur.at;
        const mv = ti < 0 ? 1 : ramp(u, 0.1, 0.45, E.inOut);
        const fl = ti < 0 ? 1 : ramp(u, 0, 0.2, E.lin);

        SHELF.forEach((b, i) => {
          const a = posOf(prevBits, i);
          const c = posOf(cur.bits, i);
          const x = a.x + (c.x - a.x) * mv;
          const y = a.y + (c.y - a.y) * mv;
          const away = a.away + (c.away - a.away) * mv;
          const s = E.pop(shelfP[i]);
          V.place(blocks[i], { x: x - b.x, y, s, o: clamp(shelfP[i] * 4) });
          V.place(holders[i], { o: clamp(shelfP[i] * 4) * clamp(away * 1.2) * 0.9 });
          const tp2 = ramp(t, 1.3 + 0.1 * i, 1.8 + 0.1 * i, E.lin);
          tile(i, prevBits[i], cur.bits[i], fl, clamp(tp2 * 4), E.pop(tp2));
        });

        // gap bar and its tag
        if (ti < 0) {
          V.show(gapBar, 0);
          gapTag.set({ o: 0 });
        } else {
          const showPrev = ti > 0 && u < 0.3;
          const bits = showPrev ? prevBits : cur.bits;
          const st = L2.stack(bits);
          const g = st.gap;
          const final = ti === 8;
          const tn = showPrev ? "red" : final ? "green" : "red";
          const gk = showPrev ? 1 : ramp(u, 0.4, 0.65, E.out);
          const o = showPrev ? 1 - ramp(u, 0, 0.2, E.lin) : 1;
          const w = g.width * gk;
          gapBar.style.left = `${g.over ? g.x + g.width - w : g.x}px`;
          gapBar.style.width = `${w}px`;
          gapBar.style.background = tone(tn).c;
          V.show(gapBar, gk > 0 ? o : 0);
          const pp = showPrev ? 1 : ramp(u, 0.4, 0.65, E.lin);
          gapTag.el.className = `v-tag c-${tn}`;
          gapTag.text(`f = ${st.f}`);
          gapTag.set({ x: g.x + g.width / 2, s: showPrev ? 1 : E.pop(pp), o: showPrev ? o : clamp(pp * 4) });
        }

        // the 8 cards
        const dimK = ramp(t, FINAL_AT, FINAL_AT + 0.8, E.inOut);
        const greenK = ramp(t, FINAL_AT, FINAL_AT + 0.3, E.lin);
        SUBS.forEach((s, i) => {
          const c = cards[i];
          const ap = ramp(t, 1.6 + 0.06 * i, 2.0 + 0.06 * i, E.lin);
          const bp = ramp(t, TRIALS[i].at + 0.6, TRIALS[i].at + 0.85, E.lin);
          const tried = bp > 0;
          const isBest = i === BEST && greenK > 0;
          const inTrial = ti === i && u < STEP && !tried;
          const tn = isBest ? "green" : "red";
          const st = c.card.style;
          if (isBest) {
            st.borderStyle = "solid";
            st.borderColor = tone("green").edge;
            st.background = tone("green").dim;
            st.boxShadow = `0 6px 0 ${tone("green").edge}`;
          } else if (tried) {
            st.borderStyle = "solid";
            st.borderColor = "var(--line-2)";
            st.background = "var(--panel)";
            st.boxShadow = "0 6px 0 var(--line-2)";
          } else {
            st.borderStyle = "dashed";
            st.borderColor = inTrial ? tone("blue").c : "var(--line-2)";
            st.background = "transparent";
            st.boxShadow = "none";
          }
          c.bitsEl.style.color = isBest ? tone("green").ink : tried ? "var(--ink)" : "var(--text-dim)";
          const h = s.f * CARD.k * E.pop(bp);
          c.bar.style.height = `${Math.max(0, h)}px`;
          c.bar.style.background = tone(tn).c;
          c.bar.style.border = `3px solid ${tone(tn).lip}`;
          c.bar.style.visibility = bp <= 0 ? "hidden" : "";
          c.val.style.bottom = `${12 + h + 4}px`;
          c.val.style.color = tone(tn).ink;
          c.val.style.visibility = bp <= 0 ? "hidden" : "";
          c.val.style.opacity = String(clamp(bp * 3));
          const o = (i === BEST ? 1 : 1 - 0.5 * dimK) * clamp(ap * 4);
          const pulse = i === BEST ? 0.06 * V.flash(t, FINAL_AT, FINAL_AT + 0.6) : 0;
          V.place(c.card, { s: E.pop(ap) + pulse, o });
        });
        const sp = ramp(t, 10.0, 10.5, E.lin);
        V.place(star, { s: E.pop(sp), o: clamp(sp * 4) });
      };
    },
  });
})();
