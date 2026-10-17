/* Phase 10 · scene 03-softmax (11.5 s): softmax turns any scores into shares that add up to 1 (lesson 10.2). Three words A, B, C have the
   scores 2, 1, 0 (blue bars). Stretching every score with e to its power makes them all positive and widens the gaps (7.39, 2.72,
   1.00); the three numbers funnel into an orange total (11.11); dividing each by the total gives the green shares 0.67, 0.24, 0.09
   (they add up to 1). A second bar shows that bigger gaps (scores 4, 2, 0) give a sharper share-out (top share 0.87). Every number
   comes from A10.SOFT (common.js) and is asserted again here.
   Story (local seconds): 0.2-0.9 discs pop; 0.4-1.3 score bars grow; 0.8 "scores" tag; 2.7-4.0 the bars stretch to e^score and the
   tag names the rule ("e to the score", then "all positive": a score of 0 becomes 1); 4.9-5.6 the orange total pops and three arrows funnel into it; 5.6-6.8 the share bar grows from the left;
   6.4-7.0 its three labels pop, 7.0 "= 1"; 7.7-9.4 the sharper bar and its 0.87 label. Hold to 11.5. */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const L5 = V.l5;
  const { ramp, lerp, ease: E } = V;

  const S = A10.SOFT;
  const SH = S.sharp;
  const N = S.scores.length;
  A10.same("softmax: scores", S.scores, [2, 1, 0]);
  A10.same("softmax: stretched scores", S.expTxt, ["7.39", "2.72", "1.00"]);
  A10.same("softmax: total", S.totalTxt, "11.11");
  A10.same("softmax: shares", S.shareTxt, ["0.67", "0.24", "0.09"]);
  A10.same("softmax: sharper scores", SH.scores, [4, 2, 0]);
  A10.same("softmax: sharper top share", SH.topTxt, "0.87");
  S.scores.forEach((s, i) => {
    A10.close(`softmax: stretched score ${i} is e^score`, S.exps[i], Math.exp(s), 1e-9);
    A10.close(`softmax: share ${i} is stretched / total`, S.shares[i], S.exps[i] / S.total, 1e-9);
  });
  A10.close("softmax: the shares add up to 1", A10.sum(S.shares), 1, 1e-9);
  A10.close("softmax: the sharper shares add up to 1", A10.sum(SH.shares), 1, 1e-9);
  A10.same("softmax: the shown stretched scores add up to the total", +A10.sum(S.expTxt.map(Number)).toFixed(2), 11.11);
  if (!(SH.shares[0] > S.shares[0])) throw new Error("scene 03: a bigger gap must give a bigger top share");

  const TM = {
    disc: 0.2, // disc i at 0.2 + 0.1 i
    grow: 0.4, // score bar i grows from 0.4 + 0.1 i for 0.7 s
    tag: [0.8, 1.2], // the blue "scores" tag
    exp: [2.7, 4.0], // every bar stretches to e^score
    half: 3.35, // its number switches here
    expTag: 2.9, // the tag names the rule: "e to the score"
    posTag: 4.1, // and, once the bars have stretched, "all positive"
    total: [4.9, 5.3], // the orange total
    arrow: 4.9, // funnel arrow i at 4.9 + 0.15 i, 0.45 s each
    by: [5.5, 5.9], // the orange "÷ 11.11" tag: each share is a stretched score divided by the total
    share: [5.6, 6.8], // the share bar grows from the left
    label: 6.4, // share label i at 6.4 + 0.15 i
    one: [6.9, 7.25], // "= 1"
    sharpTag: [7.7, 8.1],
    sharp: [7.9, 9.0],
    top: [9.0, 9.4],
  };
  const LETTERS = ["A", "B", "C"];
  const row = (i) => 92 + 84 * i; // centre y of row i

  function build(stage) {
    const rule = V.h("div", {
      style: {
        position: "absolute",
        left: "90px",
        top: "62px",
        width: "6px",
        height: "228px",
        borderRadius: "3px",
        background: "var(--line-2)",
      },
    });
    stage.append(rule);
    const discs = LETTERS.map((l, i) => A10.disc(stage, { x: 44, y: row(i), size: 56, text: l, tone: "grey" }));
    const bars = A10.bars(stage, { x: 96, y: 70, n: N, dir: "h", unit: 56, bw: 44, gap: 40, tone: "blue" });
    A10.same(
      "softmax: bar rows are the disc rows",
      [0, 1, 2].map((i) => bars.pt(i, 0).y),
      [92, 176, 260],
    );
    const head = A10.tag(stage, { x: 680, y: 40, w: 238, text: "scores", tone: "blue" });
    A10.same(
      "softmax: the three header texts fit the header tag",
      ["scores", "e to the score", "all positive"].map((x) => A10.tagW(x) <= head.w),
      [true, true, true],
    );
    const total = A10.tag(stage, { x: 700, y: 150, text: `total ${S.totalTxt}`, tone: "orange", solid: true });
    A10.same("softmax: the total tag is 192 px wide", total.w, 192);
    const svg = A10.svg(stage);
    const arrows = S.exps.map((e, i) =>
      svg.appendChild(L5.arrow(bars.pt(i, e).x + 92, row(i), 696, 179, "orange", 1, { w: 5, head: 16 })),
    );
    const sb = A10.shareBar(stage, { x: 96, y: 396, w: 700, h: 64 });
    const by = A10.tag(stage, { x: 96, y: 332, text: `÷ ${S.totalTxt}`, tone: "orange" });
    const labels = S.shareTxt.map((s, i) =>
      A10.tag(stage, { x: sb.seg(i, S.shares).mid - 50, y: 332, w: 100, text: s, tone: "green" }),
    );
    const one = A10.tag(stage, { x: 808, y: 399, text: "= 1", tone: "green", solid: true });
    A10.same("softmax: the = 1 tag is 84 px wide", one.w, 84);
    const sb2 = A10.shareBar(stage, { x: 96, y: 548, w: 700, h: 64 });
    const sharpTag = A10.tag(stage, { x: 96, y: 486, text: "scores 4, 2, 0" });
    A10.same("softmax: the sharper tag is 218 px wide", sharpTag.w, 218);
    const top = A10.tag(stage, {
      x: sb2.seg(0, SH.shares).mid - 50,
      y: 486,
      w: 100,
      text: SH.topTxt,
      tone: "green",
      solid: true,
    });
    const greens = ["green", "green", "green"];

    return (t) => {
      // 1. the three words and their scores
      V.place(rule, { o: ramp(t, 0.3, 0.7, E.lin) });
      const kx = ramp(t, ...TM.exp, E.inOut); // 0 -> 1 while the scores are stretched
      discs.forEach((d, i) => d.set({ k: A10.seq(t, TM.disc, 0.1, 0.4, i) }));
      for (let i = 0; i < N; i++) {
        const g = ramp(t, TM.grow + 0.1 * i, TM.grow + 0.1 * i + 0.7, E.out);
        const v = lerp(S.scores[i], S.exps[i], kx);
        const text = kx < 0.5 ? String(S.scores[i]) : S.expTxt[i];
        bars.set(i, { v, grow: kx > 0 ? 1 : g, text: g > 0.6 ? text : "" });
      }
      const headText = t >= TM.posTag ? "all positive" : t >= TM.expTag ? "e to the score" : "scores";
      head.set({
        k: ramp(t, ...TM.tag, E.lin),
        text: headText,
        s: 1 + 0.08 * (V.flash(t, TM.expTag, TM.expTag + 0.35) + V.flash(t, TM.posTag, TM.posTag + 0.35)),
      });

      // 2. the total and the three arrows that funnel into it
      total.set({ k: ramp(t, ...TM.total, E.lin) });
      arrows.forEach((a, i) => L5.drawOn(a, ramp(t, TM.arrow + 0.15 * i, TM.arrow + 0.15 * i + 0.45, E.out)));

      // 3. the shares: the bar grows from the left, its labels pop, "= 1"
      by.set({ k: ramp(t, ...TM.by, E.lin) });
      sb.set({ vals: S.shares, tones: greens, k: ramp(t, ...TM.share, E.out) });
      labels.forEach((l, i) => l.set({ k: A10.seq(t, TM.label, 0.15, 0.3, i) }));
      one.set({ k: ramp(t, ...TM.one, E.lin) });

      // 4. sharper scores, sharper shares
      sharpTag.set({ k: ramp(t, ...TM.sharpTag, E.lin) });
      sb2.set({ vals: SH.shares, tones: greens, k: ramp(t, ...TM.sharp, E.out) });
      top.set({ k: ramp(t, ...TM.top, E.lin) });
    };
  }

  V.scene({
    kicker: "SOFTMAX",
    title: ["Softmax turns scores", "into shares"],
    dur: 11.5,
    caps: [
      [0.7, 2.6, "Imagine three words, each with a score."],
      [2.9, 4.8, "Stretch the scores: the biggest grows most."],
      [5.5, 7.6, "Divide by the total: the shares add to 1."],
      [7.7, 9.7, "Bigger gaps give a sharper share-out."],
      [9.9, 11.4, "Attention will use these shares."],
    ],
    build,
  });
})();
