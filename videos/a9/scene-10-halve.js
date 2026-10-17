/* Phase 9 · Fourier Transform & FFT (algo-9), scene 10: "Keep halving, do far less work" (16.8 s).
   IDEA (the whole FFT): each half is itself a DFT, so split again and again until single samples remain (a DFT of one sample is the sample itself:
   nothing to do), then climb back up with butterflies, level by level: 3 levels x 4 butterflies = 12 butterflies instead of 64 products, and the
   answer is the SAME 8 bars as the direct DFT. For 1,048,576 samples the direct DFT takes about 18 minutes (at a billion products a second, the
   assumption of lesson 9.2's table), the FFT about 0.02 seconds: about 50,000 times less work.
   Part 1 (0 - 10.6 s) is the network of scene 9 (A9.fftRig: the same layout), part 2 (10.6 - 16.8 s) the payoff as two bars. Every number comes from
   A9.FFT / A9.COST (common.js), is asserted below and is the one the captions and tags print.
   Colours (video-wide): blue = the even half / samples, purple = the odd half and the butterfly's dot, orange = a butterfly being computed and the
   answers, green = done / saved work, red = the direct way.
   Timeline (local seconds): 0.1 the picture of scene 9 pops in (tiles in even-odd order, two '4-point DFT' boxes, the last level of grey butterflies,
   the answer tiles); 0.5-1.8 the second split (x2 / x4 and x3 / x5 swap rows, in the rig's two lanes so they never overlap); 0.8-1.3 the 4-point
   boxes give way to four '2-point DFT' boxes; 2.1-2.5 those go; 2.2-3.0 every sample gets a green ring and the tag '1 sample = its own DFT';
   3.4-3.8 ring and tag fade; 3.35-4.2 the grey butterflies of the two lower levels draw on; 3.7 'direct: 64 products', 3.9 the counter; 4.1 / 5.55 /
   7.0 the climb: level 0, 1, 2 (a pale band marks the column that is being computed and the tag 'level 1', 'level 2', 'level 3' names it;
   butterfly i of a level starts 0.2 s after butterfly i - 1: orange while it is computed, green when done; the counter counts them to 12; each
   answer tile goes solid as its last butterfly finishes); 8.2-8.5 the direct DFT's two long bars appear as red dashed outlines, 8.5-9.3 the
   8 bars grow into them (the two long ones write their 4), 8.7 'same as direct'; 10.1-10.6 the network fades; 10.6 '1,048,576 samples',
   10.8 'direct DFT' and 'at a billion products a second', 11.0-11.9 the red bar grows ('18 minutes'), 12.8 'FFT: the fast way', 13.0 a sliver,
   13.1 '0.02 seconds', 13.5 'not to scale', 14.3 'about 50,000 times less work' (large), then hold to the end.
   Captions follow the picture (asserted below): 11.3 'Direct: 18 minutes ...', 13.1 'The FFT: 0.02 seconds.', 14.4 'About 50,000 times less work.'
   update(t) is pure. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { ramp, flash, lerp, clamp, ease: E } = V;
  const FF = A9.FFT;
  const COST = A9.COST;
  const lin = E.lin;

  // ---------- when things happen (local seconds) ----------
  const TL = {
    intro: [0.1, 0.5], // the boxes pop; the tiles, the last level and the answer tiles pop a little later
    swap: [0.5, 1.8], // the second split
    four: [0.8, 1.3], // the two 4-point boxes fade out ...
    two: [1.3, 1.9], // ... as the four 2-point boxes pop in
    twoOut: [2.1, 2.5],
    rings: 2.2, // a green ring on every sample, 0.07 s apart
    oneTag: [2.3, 2.8],
    oneOut: [3.4, 3.8], // the rings and the tag fade
    net: 3.35, // the grey lines of the two lower levels draw on
    direct: [3.7, 4.2],
    count: [3.9, 4.4],
    climb: [4.1, 5.55, 7.0], // when butterfly 0 of level 0, 1, 2 is computed
    step: 0.2, // butterfly i starts 0.2 s after butterfly i - 1
    lit: 0.7, // orange for 0.7 s, then green for good
    ghost: [8.2, 8.5], // the direct DFT's long bars show as red dashed outlines ...
    bars: [8.5, 9.3], // ... and the FFT's bars grow into them
    nums: [9.2, 9.5], // the two long bars write their 4
    ghostOut: [9.6, 9.9],
    same: [8.7, 9.2],
    fade: [10.1, 10.6], // everything of part 1 fades
    pay: [10.6, 11.0],
    dTag: [10.8, 11.2],
    speed: [10.9, 11.3], // 'at a billion products a second': the assumption behind the two times
    red: [11.0, 11.9],
    fTag: [12.8, 13.2],
    nub: [13.0, 13.5],
    secTag: [13.1, 13.6],
    scale: [13.5, 13.8],
    ratio: [14.3, 14.9],
  };
  const LEVEL = { len: 1.3, out: 0.3, lead: 0.15 }; // a level's band stays 1.3 s (its last butterfly is done 1.3 s after the first starts), then fades 0.3 s
  // every number printed is the helper's own (asserted in check())
  const MINUTES = Math.round(COST.directMin);
  const SECONDS = COST.fftSec.toFixed(2);
  const TIMES = A9.commas(Math.round(COST.ratio / 1e4) * 1e4);
  const CAPS = [
    [0.6, 2.4, "Each half is a DFT too: split again."],
    [2.5, 4.0, "Down to single samples."],
    [4.2, 6.8, "Butterflies combine pairs, level by level."],
    [7.0, 8.6, `Three levels of four: ${FF.butterflies} butterflies.`],
    [8.7, 10.3, "The same answer as the direct DFT."],
    [11.3, 12.9, `Direct: ${MINUTES} minutes for a million samples.`],
    [13.1, 14.2, `The FFT: ${SECONDS} seconds.`],
    [14.4, 15.9, `About ${TIMES} times less work.`],
  ];
  const t0Of = (L, i) => TL.climb[L] + TL.step * i; // when butterfly i of level L starts
  const doneOf = (L, i) => t0Of(L, i) + TL.lit; // ... and when it is done
  const drawAt = (L, i) => TL.net + 0.15 * L + 0.07 * i; // when its grey lines start to draw
  const ALL = FF.levels.flatMap((lv, L) => lv.map((_, i) => ({ L, i })));
  const ROWS = FF.rows(FF.order); // the final row of every sample (the ring of sample i pops in the order of these rows)
  // ---------- layout (stage px) ----------
  const NAMES = { four: "4-point DFT", two: "2-point\nDFT" };
  const BOT = { y: 574, h: 52 }; // the bottom row of tags (52 px high: the row ends at y 626)
  const BAR = { x: 88, w: 760, h: 96 }; // part 2: the long red bar (px), centred on the stage; the tags above it start at its left edge
  const NUB = 12; // ... and the sliver that stands for the FFT (the true ratio is 52,429 to 1: 0.01 px)
  const PAY_Y = { pay: 16, direct: 98, red: 176, fft: 306, nub: 384, hero: 512 }; // part 2, top to bottom (the hero ends at 596, its lip at 602)
  const HERO = { x: 68, w: 800, h: 84, fs: 48 }; // 'about 50,000 times less work', the line the scene exists for
  // the box that covers rows r0..r1 between lines c0 and c1 (26 px above and below the rows, so two 4-row boxes leave a 16 px gap)
  const rectOf = (R, r0, r1, c0, c1) => ({
    x: R.cols[c0] + 12,
    y: R.rowY(r0) - 26,
    w: R.cols[c1] - R.cols[c0] - 24,
    h: R.rowY(r1) - R.rowY(r0) + 52,
  });

  function check() {
    A9.same("scene 10 rows of the full split", ROWS, [0, 4, 2, 6, 1, 5, 3, 7]);
    A9.same(
      "scene 10 butterflies",
      FF.levels.map((l) => l.length),
      [4, 4, 4],
    );
    A9.same("scene 10 answer", FF.bars, A9.W8.bars);
    A9.same(
      "scene 10 level pairs",
      FF.levels.map((l) => l.map((b) => [b.a, b.b])),
      [
        [
          [0, 1],
          [2, 3],
          [4, 5],
          [6, 7],
        ],
        [
          [0, 2],
          [1, 3],
          [4, 6],
          [5, 7],
        ],
        [
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7],
        ],
      ],
    );
    A9.same(
      "scene 10 payoff",
      [Math.round(COST.directMin), COST.fftSec.toFixed(2), Math.round(COST.ratio / 1e4) * 1e4, A9.commas(COST.n)],
      [18, "0.02", 50000, "1,048,576"],
    );
    A9.same("scene 10 the counter reaches 12", [ALL.length, FF.butterflies, FF.products], [12, 12, 64]);
    // the words in the captions and tags are the numbers: three levels of four, a million samples at a billion products a second
    A9.same("scene 10 'three levels of four'", [FF.levels.length, FF.levels[0].length], [3, 4]);
    A9.same("scene 10 'a million samples'", Math.round(COST.n / 1e6), 1);
    A9.same(
      "scene 10 'a billion products a second' is the speed behind the minutes",
      [COST.perSec, COST.direct / COST.perSec / 60],
      [1e9, COST.directMin],
    );
    A9.same("scene 10 the printed numbers", [MINUTES, SECONDS, TIMES], [18, "0.02", "50,000"]);
    A9.same(
      "scene 10 the captions print them",
      [CAPS[3][2], CAPS[5][2], CAPS[6][2], CAPS[7][2]],
      [
        "Three levels of four: 12 butterflies.",
        "Direct: 18 minutes for a million samples.",
        "The FFT: 0.02 seconds.",
        "About 50,000 times less work.",
      ],
    );
    // a level's band is on while its four butterflies are computed (the last one is done LEVEL.len after the first starts)
    [0, 2].forEach((L) => A9.close(`scene 10 level ${L} lasts LEVEL.len`, doneOf(L, 3) - t0Of(L, 0), LEVEL.len, 1e-9));
    A9.same(
      "scene 10 the level tag is gone before 'same as direct'",
      t0Of(2, 0) + LEVEL.len + LEVEL.out <= TL.same[0],
      true,
    );
    // the climb: level by level, the last butterfly is done before the answers' caption starts, and the bars follow
    const last = Math.max(...ALL.map(({ L, i }) => doneOf(L, i)));
    A9.same(
      "scene 10 the climb runs level by level and ends before the bars",
      [
        doneOf(0, 3) <= TL.climb[1],
        doneOf(1, 3) <= TL.climb[2],
        last <= CAPS[3][1],
        last <= TL.bars[0] + 0.05,
        TL.bars[1] <= TL.fade[0],
      ],
      [true, true, true, true, true],
    );
    A9.same(
      "scene 10 the lower levels are drawn before they are used",
      ALL.filter(({ L }) => L < 2).every(({ L, i }) => drawAt(L, i) + 0.45 <= t0Of(L, i) + 0.1),
      true,
    );
    // captions: each starts after the picture it names has started, none overlaps the next, and each is slow enough to read
    const starts = [
      TL.swap[0],
      TL.oneTag[0],
      t0Of(0, 0),
      t0Of(2, 0), // the third level starts
      TL.bars[0],
      TL.red[0] + 0.15, // '18 minutes' shows once the bar is wider than 300 px
      TL.secTag[0],
      TL.ratio[0],
    ];
    A9.same(
      "scene 10 every caption starts after its picture does",
      CAPS.map((c, i) => c[0] >= starts[i] && c[0] - starts[i] < 0.6),
      CAPS.map(() => true),
    );
    A9.same(
      "scene 10 captions do not overlap and read at 4.5 words a second or less",
      CAPS.every((c, i) => (i === 0 || c[0] >= CAPS[i - 1][1]) && c[2].split(" ").length / (c[1] - c[0]) <= 4.5),
      true,
    );
  }

  // the second split moves with the rig's own lanes (R.tilesAt): tiles that swap rows must never overlap on the way
  function checkTiles(R) {
    const [rf, rt] = [FF.rows(FF.evenOdd), FF.rows(FF.order)];
    const at = (i, u) => ({
      x: E.inOut(clamp(8 * Math.min(u, 1 - u))) * (rt[i] < rf[i] ? -R.LANE.up : rt[i] > rf[i] ? R.LANE.down : 0),
      y: lerp(rf[i], rt[i], u) * R.pitch,
    });
    for (let s = 0; s <= 400; s++)
      for (let i = 0; i < 8; i++)
        for (let j = i + 1; j < 8; j++) {
          const [a, b] = [at(i, s / 400), at(j, s / 400)];
          if (Math.abs(a.x - b.x) < R.tw && Math.abs(a.y - b.y) < R.th)
            throw new Error(`VID.a9: scene 10 tiles x${i} and x${j} overlap while the second split moves them`);
        }
  }

  V.scene({
    kicker: "THE FFT",
    title: ["Keep halving,", "do far less work"],
    dur: 16.8,
    caps: CAPS,
    build(stage) {
      check();
      // ---- boxes first, so the tiles and lines draw over them (a pale band behind the level that is being computed) ----
      const bands = [0, 1, 2].map(() => A9.box(stage, { tone: "orange" }));
      const box4 = ["blue", "purple"].map((tone) => A9.box(stage, { tone, fs: 30 }));
      const box2 = ["blue", "blue", "purple", "purple"].map((tone) => A9.box(stage, { tone, fs: 30 }));
      box2.forEach((b) => (b.el.style.whiteSpace = "pre-line"));
      // ---- the network (the same rig as scene 9) ----
      const R = A9.fftRig(stage);
      checkTiles(R);
      const r4 = [rectOf(R, 0, 3, 0, 2), rectOf(R, 4, 7, 0, 2)];
      const rLevel = [0, 1, 2].map((L) => rectOf(R, 0, 7, L, L + 1)); // the three columns of butterflies
      const r2 = [rectOf(R, 0, 1, 0, 1), rectOf(R, 2, 3, 0, 1), rectOf(R, 4, 5, 0, 1), rectOf(R, 6, 7, 0, 1)];
      // ---- the bottom row ----
      const oneTag = A9.tag(stage, {
        x: 36,
        y: BOT.y,
        h: BOT.h,
        text: "1 sample = its own DFT",
        tone: "green",
        solid: true,
      });
      const directText = `direct: ${FF.products} products`;
      const direct = A9.tag(stage, { x: 36, y: BOT.y, h: BOT.h, text: directText, tone: "red", solid: true });
      const same = A9.tag(stage, { x: 358, y: BOT.y, h: BOT.h, text: "same as direct", tone: "green" });
      const count = A9.stat(stage, { x: 620, y: 564, w: 290, h: 54, label: "butterflies", tone: "green" }); // the lip ends at 624
      const levelTag = A9.tag(stage, { x: 384, y: BOT.y, h: BOT.h, text: "level 1", tone: "orange", solid: true }); // names the level that is being computed
      // ---- part 2: the payoff (a column centred on the stage: tags start at the bar's left edge) ----
      const pay = A9.tag(stage, {
        x: BAR.x,
        y: PAY_Y.pay,
        text: `${A9.commas(COST.n)} samples`,
        tone: "blue",
        solid: true,
      });
      const dTag = A9.tag(stage, { x: BAR.x, y: PAY_Y.direct, text: "direct DFT", tone: "red" });
      const speed = A9.tag(stage, {
        x: BAR.x + A9.tagW("direct DFT") + 28,
        y: PAY_Y.direct,
        text: "at a billion products a second", // the speed behind the minutes (asserted: COST.perSec = 1e9)
        tone: "grey",
      });
      const redBar = A9.box(stage, { tone: "red", fs: 34 });
      const fTag = A9.tag(stage, { x: BAR.x, y: PAY_Y.fft, text: "FFT: the fast way", tone: "green" });
      const nub = A9.box(stage, { tone: "green" });
      // the two bars are solid (the box helper only draws the pale tint): fill, lip and text in the tone's own shades
      [redBar, nub].forEach((b) =>
        Object.assign(b.el.style, {
          background: "var(--c)",
          borderColor: "var(--c-lip)",
          boxShadow: "0 6px 0 var(--c-lip)",
          color: "var(--c-on)",
        }),
      );
      const secY = PAY_Y.nub + (BAR.h - 58) / 2; // centred on the sliver
      const secX = BAR.x + NUB + 18;
      const secTag = A9.tag(stage, { x: secX, y: secY, text: `${SECONDS} seconds`, tone: "green", solid: true });
      const scale = A9.tag(stage, {
        x: secX + A9.tagW(`${SECONDS} seconds`) + 28,
        y: secY,
        text: "not to scale",
        tone: "grey",
      });
      const ratio = A9.tag(stage, {
        x: HERO.x,
        y: PAY_Y.hero,
        h: HERO.h,
        fs: HERO.fs,
        text: `about ${TIMES} times less work`,
        tone: "green",
        solid: true,
      });
      ratio.el.style.width = `${HERO.w}px`; // a fixed width, so the big line is centred whatever the font makes of it

      return (t) => {
        const net = 1 - ramp(t, TL.fade[0], TL.fade[1], lin); // part 1 fades out as part 2 starts
        const swap = ramp(t, TL.swap[0], TL.swap[1], E.inOut);

        // ---- the level that is being computed: a pale band behind its column, named at the bottom ----
        const bandOf = (L) => {
          const a = TL.climb[L];
          return (
            ramp(t, a - LEVEL.lead, a + LEVEL.lead, lin) * (1 - ramp(t, a + LEVEL.len, a + LEVEL.len + LEVEL.out, lin))
          );
        };
        bands.forEach((b, L) => b.set({ ...rLevel[L], k: bandOf(L), o: net }));
        const lvl = t >= TL.climb[2] - LEVEL.lead ? 2 : t >= TL.climb[1] - LEVEL.lead ? 1 : 0; // the tag pops again for each new level
        const born = TL.climb[lvl] - LEVEL.lead;
        levelTag.set({
          text: `level ${lvl + 1}`,
          k: ramp(t, born, born + 0.35, lin),
          o: net * (1 - ramp(t, TL.climb[2] + LEVEL.len, TL.climb[2] + LEVEL.len + LEVEL.out, lin)),
        });

        // ---- the boxes: 4-point, then 2-point ----
        const fourO = 1 - ramp(t, TL.four[0], TL.four[1], lin);
        box4.forEach((b, j) =>
          b.set({ ...r4[j], text: NAMES.four, k: ramp(t, TL.intro[0], TL.intro[1], lin), o: fourO * net }),
        );
        const twoO = 1 - ramp(t, TL.twoOut[0], TL.twoOut[1], lin);
        box2.forEach((b, j) =>
          b.set({ ...r2[j], text: NAMES.two, k: ramp(t, TL.two[0], TL.two[1], lin), o: twoO * net }),
        );

        // ---- the eight samples: the second split, then a green ring on each ----
        const ringO = 1 - ramp(t, TL.oneOut[0], TL.oneOut[1], lin);
        R.tilesAt(FF.evenOdd, FF.order, swap, (i) => {
          const pop = A9.seq(t, 0.05, 0.05, 0.4, i);
          return {
            tone: i % 2 ? "purple" : "blue",
            s: E.pop(pop),
            o: Math.min(1, 4 * pop) * net,
            ring: "green",
            ringK: A9.seq(t, TL.rings, 0.07, 0.4, ROWS[i]) * ringO,
          };
        });
        oneTag.set({ k: ramp(t, TL.oneTag[0], TL.oneTag[1], lin), o: ringO * net });

        // ---- the butterflies: 12 in all ----
        R.set({ o: net });
        let done = 0;
        let bump = 0;
        ALL.forEach(({ L, i }) => {
          const [a, td] = [t0Of(L, i), doneOf(L, i)];
          if (t >= td) done++;
          bump = Math.max(bump, flash(t, td - 0.05, td + 0.3));
          const k =
            L === 2
              ? ramp(t, 0.2 + 0.06 * i, 0.7 + 0.06 * i, E.inOut)
              : ramp(t, drawAt(L, i), drawAt(L, i) + 0.45, E.inOut);
          R.bf(L, i).set({
            o: net,
            k,
            lit: ramp(t, a, a + 0.2, lin),
            tone: t < td ? "orange" : "green",
            s: 1 + 0.45 * flash(t, a, a + 0.6),
          });
        });

        // ---- the answers: each goes solid when its last butterfly is done, then the 8 bars grow ----
        R.outs.all((k) => {
          const td = doneOf(2, k % 4);
          return {
            solid: t >= td,
            s: E.pop(A9.seq(t, 0.15, 0.04, 0.4, k)) * (1 + 0.2 * flash(t, td, td + 0.4)),
            o: Math.min(1, 4 * A9.seq(t, 0.15, 0.04, 0.4, k)) * net,
          };
        });
        // the FFT's bars grow into red dashed outlines of the direct DFT's bars (scene 5's picture): the same two long ones, the same 4
        const ghost = ramp(t, TL.ghost[0], TL.ghost[1], lin) * (1 - ramp(t, TL.ghostOut[0], TL.ghostOut[1], lin));
        FF.bars.forEach((v, k) =>
          R.bar(k).set({
            k: A9.seq(t, TL.bars[0], 0.05, TL.bars[1] - TL.bars[0] - 0.35, k),
            v,
            o: net,
            ghost,
            num: ramp(t, TL.nums[0], TL.nums[1], lin),
          }),
        );

        // ---- the bottom row ----
        direct.set({ k: ramp(t, TL.direct[0], TL.direct[1], lin), o: net });
        same.set({ k: ramp(t, TL.same[0], TL.same[1], lin), o: net });
        count.set({
          text: String(done),
          bump: 0.4 * bump, // a small pulse: the counter sits just under the answer tiles
          solid: done === FF.butterflies,
          k: ramp(t, TL.count[0], TL.count[1], lin),
          o: net,
        });

        // ---- part 2: 18 minutes against 0.02 seconds, and what that is worth ----
        pay.set({ k: ramp(t, TL.pay[0], TL.pay[1], lin) });
        dTag.set({ k: ramp(t, TL.dTag[0], TL.dTag[1], lin) });
        speed.set({ k: ramp(t, TL.speed[0], TL.speed[1], lin) });
        const w = BAR.w * E.out(ramp(t, TL.red[0], TL.red[1], lin));
        redBar.set({
          x: BAR.x,
          y: PAY_Y.red,
          w,
          h: BAR.h,
          text: w > 300 ? `${MINUTES} minutes` : "",
          k: ramp(t, TL.red[0] - 0.1, TL.red[0] + 0.2, lin),
        });
        fTag.set({ k: ramp(t, TL.fTag[0], TL.fTag[1], lin) });
        nub.set({ x: BAR.x, y: PAY_Y.nub, w: NUB, h: BAR.h, k: ramp(t, TL.nub[0], TL.nub[1], lin) });
        secTag.set({ k: ramp(t, TL.secTag[0], TL.secTag[1], lin) });
        scale.set({ k: ramp(t, TL.scale[0], TL.scale[1], lin) });
        ratio.set({ k: ramp(t, TL.ratio[0], TL.ratio[1], lin) });
      };
    },
  });
})();
