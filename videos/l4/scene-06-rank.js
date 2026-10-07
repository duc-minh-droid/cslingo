/* Lecture 4 video, scene-06-rank.js: rank selection. The superfit population from the roulette scene, its chances replaced by
   rank chances, then a pressure knob b (weight = rank^b). Every number comes from L4.rouletteProbs / L4.rankProbs. */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const { h, ramp, ease } = V;
  const lin = ease.lin;
  const pop = (t, a, d = 0.45) => ease.pop(ramp(t, a, a + d, lin));
  const fade = (t, a, d = 0.25) => ramp(t, a, a + d, lin);

  const F = L4.FIT_SUPER;
  const ROULETTE = L4.rouletteProbs(F);
  const RANKS = L4.ranksOf(F);
  const at = (b) => L4.rankProbs(F, b);
  if (L4.pct(ROULETTE[0]) !== "99%" || RANKS.join() !== "5,4,3,2,1" || at(1).sum !== 15)
    throw new Error("scene 06: lecture numbers changed");
  if (at(2).w.join() !== "25,16,9,4,1" || at(2).sum !== 55 || at(0).w.join() !== "1,1,1,1,1")
    throw new Error("scene 06: knob numbers changed");

  const ROW_Y = (i) => 84 + 84 * i;
  const BAR_X = 322;
  const LEN = 400;
  const CHIP_X = 12;
  const RANK_X = 182;
  const T = {
    chips: 0.5,
    bars: [1.6, 2.6],
    rank: 3.4,
    morph: [4.8, 6.2],
    knob: 7.0,
    b2: [7.6, 8.6],
    flip2: [8.6, 9.0],
    b0: [9.2, 10.0],
    flip0: [10.0, 10.3],
  };

  function bValue(t) {
    if (t < T.b2[0]) return 1;
    if (t < T.b0[0]) return 1 + ramp(t, T.b2[0], T.b2[1], ease.inOut);
    return 2 - 2 * ramp(t, T.b0[0], T.b0[1], ease.inOut);
  }

  V.scene({
    kicker: "RANK SELECTION",
    title: ["Rank selection ignores", "the raw numbers"],
    dur: 11,
    caps: [
      [0.8, 3.2, "Roulette: the superfit takes 99%."],
      [3.4, 6.8, "Rank: only the order counts, not the gaps."],
      [7.2, 10.5, "The exponent b turns the pressure up or down."],
    ],
    build(stage) {
      const head = (text, x) =>
        h("div", {
          text,
          style: {
            position: "absolute",
            left: `${x}px`,
            top: "20px",
            fontSize: "28px",
            fontWeight: "900",
            lineHeight: "1",
            color: "var(--text-dim)",
            whiteSpace: "nowrap",
          },
        });
      const hFit = head("fitness", 12);
      const hRank = head("rank", 182);
      const hChance = head("chance", 322);
      hRank.style.transformOrigin = "0 50%";
      stage.append(hFit, hRank, hChance);

      const fit = F.map((v, i) =>
        L4.tiles(stage, { x: CHIP_X, y: ROW_Y(i), vals: [v], w: 130, h: 64, font: 36, tone: i === 0 ? "red" : "grey" }),
      );
      const rank = F.map((_, i) =>
        L4.tiles(stage, { x: RANK_X, y: ROW_Y(i), vals: [RANKS[i]], w: 100, h: 64, font: 36, tone: "purple" }),
      );
      const bars = F.map((_, i) =>
        L4.bar(stage, { x: BAR_X, y: ROW_Y(i) + 14, len: LEN, thick: 36, textGap: 18, fs: 34 }),
      );
      const total = L4.tag(stage, { x: 740, y: 12, text: "total 15", tone: "grey" });
      const kn = L4.knob(stage, { x: 250, y: 560, w: 400, stops: [0, 1, 2], pillX: 100, tone: "purple" });

      return (t) => {
        const b = bValue(t);
        const rk = at(b);
        const ma = ramp(t, T.morph[0], T.morph[1], ease.inOut);
        const grow = ramp(t, T.bars[0], T.bars[1], ease.out);
        const flip2 = ramp(t, T.flip2[0], T.flip2[1], lin);
        const flip0 = ramp(t, T.flip0[0], T.flip0[1], lin);
        const whole = Math.round(b);
        const w2 = at(2).w;
        const w0 = at(0).w;

        hFit.style.opacity = String(fade(t, T.chips));
        hChance.style.opacity = String(fade(t, T.chips));
        const hr = fade(t, T.rank);
        hRank.style.opacity = String(hr);
        hRank.style.transform = `scaleX(${Math.abs(Math.cos(Math.PI * flip2)).toFixed(3)})`;
        hRank.textContent = flip2 >= 0.5 ? "weight" : "rank";

        F.forEach((_, i) => {
          const p = pop(t, T.chips + i * 0.1);
          fit[i].set(0, { s: p, o: fade(t, T.chips + i * 0.1, 0.15) });

          const rp = pop(t, T.rank + i * 0.2, 0.4);
          const base = { s: rp, o: fade(t, T.rank + i * 0.2, 0.15) };
          if (t < T.flip0[0]) rank[i].flip(0, flip2, { ...base, from: RANKS[i], to: w2[i], tone: "purple" });
          else rank[i].flip(0, flip0, { ...base, from: w2[i], to: w0[i], tone: "purple" });

          const k = L4.mix(ROULETTE[i], rk.p[i], ma) * grow;
          const tone = ma > 0 ? "green" : i === 0 ? "red" : "grey";
          const pv = L4.mix(ROULETTE[i], rk.p[i], ma);
          bars[i].set({
            k,
            tone,
            o: fade(t, 0.9, 0.5),
            text: grow > 0.02 ? L4.pct(pv * (grow >= 1 ? 1 : grow)) : "",
            ghost: i === 0 && ma > 0 ? ROULETTE[0] : undefined,
          });
        });

        total.set({
          text: `total ${at(whole).sum}`,
          o: fade(t, T.rank + 0.6, 0.3),
          s: 0.6 + 0.4 * pop(t, T.rank + 0.6, 0.4),
        });
        kn.set({ v: b, text: `b = ${whole}`, o: fade(t, T.knob, 0.4) });
      };
    },
  });
})();
