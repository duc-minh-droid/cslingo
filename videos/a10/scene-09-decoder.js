/* Phase 10 · scene 09-decoder (14 s): THE DECODER (lesson 10.7). It writes a sentence one word at a time: here the German for "I have
   eaten an apple" with the lesson's toy scores (A10.DEC). It starts from a start token, gives every possible next word a share
   (softmax over the vocabulary, four candidates shown and three dots for "and more"), writes the likeliest word, appends it to what
   it has written and goes round again, until it writes the end token. While it writes, MASKED attention stops a word from looking
   at words that do not exist yet: "habe" may look at the start token, "Ich" and itself, never at the empty slots to its right, so in
   the who-looks-at-whom grid (rows = the word looking, columns = the word looked at) everything above the diagonal is red.
   Every number comes from A10.DEC (common.js) and is asserted again here. Shares are printed only where the rounded numbers add up
   to 1.00 (the winner's share in every step, all four in step 3 = "einen").
   Story (local seconds): 0.2-1.2 the start token and six dashed empty slots; 1.0 "next word?"; 1.8-2.5 four candidates grow as bars;
   3.55 the likeliest turns green; 4.1 "Ich" is written (a green flash, then grey); 5.0-5.9 the same for "habe"; 6.1-9.1 the mask beat
   (the candidates fade, "habe" turns purple and looks back with green arcs, red arcs to the four empty slots stop at a cross, the
   7 x 7 mask grid with "habe"'s row ringed in purple, a red "masked" tag); 9.2-11.5 three quick rounds: einen, Apfel, gegessen;
   11.7-12.3 the end token is written (green, solid) and the "next word?" tag fades. Hold to 14. */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const DEC = A10.DEC;
  const SLOTS = [DEC.sos, ...DEC.out]; // <sos> Ich habe einen Apfel gegessen <eos>
  const N = SLOTS.length;
  const ASK = 2; // the slot that is asking in the mask beat: "habe"
  const MASK = DEC.mask.cells(N);

  A10.same("decoder: the seven slots", SLOTS.join(" "), "<sos> Ich habe einen Apfel gegessen <eos>");
  A10.same("decoder: six words are written after the start token", [DEC.steps.length, N], [6, 7]);
  A10.same(
    "decoder: the top share of every step",
    DEC.steps.map((st) => st.topTxt),
    ["0.74", "0.52", "0.64", "0.74", "0.71", "0.97"],
  );
  A10.same(
    "decoder: step 3 labels all four candidates (they add up to 1.00)",
    [DEC.steps[2].words.join(" "), DEC.steps[2].probsTxt.join(" "), A10.r(A10.sum(DEC.steps[2].probsTxt.map(Number)))],
    ["einen eine den meinen", "0.64 0.24 0.09 0.03", 1],
  );
  DEC.steps.forEach((st, i) => {
    A10.same(
      `decoder: step ${i + 1} writes the likeliest candidate, listed first`,
      [st.best, st.top],
      [0, SLOTS[i + 1]],
    );
    A10.close(`decoder: step ${i + 1} shares add up to 1`, A10.sum(st.probs), 1, 1e-9);
  });
  A10.same("decoder: the mask of the seven slots", [DEC.mask.blocked, DEC.mask.allowed], [21, 28]);
  A10.same(
    "decoder: the row of habe (looks at <sos>, Ich, itself; not at the four slots to its right)",
    MASK[ASK].map(Number),
    [1, 1, 1, 0, 0, 0, 0],
  );

  // layout (stage px)
  const SENT_Y = 120;
  const CAND = { x: 12, y: 271, dy: 64, w: 192 };
  const BAR = { x: 220, y: 278, unit: 400, bw: 44, gap: 20 };
  const GRID = { x: 336, y: 262, cell: 36, gap: 2 };
  const MORE_Y = 548; // the three dots under the candidates: "and more"

  // one entry per word written: the round starts (candidates pop, bars grow until `full`), the likeliest turns green, the slot is filled
  const ROUND = [
    { t0: 1.8, full: 2.5, green: 3.55, write: 4.1 },
    { t0: 5.0, full: 5.5, green: 5.6, write: 5.9 },
    { t0: 9.2, full: 9.7, green: 9.7, write: 9.9 },
    { t0: 10.1, full: 10.5, green: 10.5, write: 10.7 },
    { t0: 10.9, full: 11.3, green: 11.3, write: 11.5 },
    { t0: 11.7, full: 12.1, green: 12.1, write: 12.3 },
  ];
  const TM = {
    slots: [0.2, 0.12, 0.3], // slot i pops at 0.2 + 0.12 i for 0.3 s (the start token, then the empty slots)
    next: [1.0, 1.35], // the orange "next word?" tag; it pops back at ROUND[2].t0
    nextOut: [12.9, 13.3], // the loop has stopped: nobody asks any more
    flash: 0.5, // a written word is green for this long, then grey (the end token stays green)
    fade: [6.1, 6.4], // the mask beat starts: candidates, bars and the question fade
    ask: [6.35, 8.95], // "habe" is purple: it is the word looking
    back: [6.4, 0.15, 0.5], // green arc n to an earlier slot from 6.4 + 0.15 n for 0.5 s
    block: [6.9, 0.1, 0.4], // red arc n to an empty slot from 6.9 + 0.1 n for 0.4 s, stopped at 60 % by a cross
    cross: [7.25, 0.1, 0.2], // cross n pops at 7.25 + 0.1 n
    grid: [7.1, 0.08, 0.3], // row r pops at 7.1 + 0.08 r
    ring: [7.8, 8.1], // the purple ring round the row of "habe"
    masked: [7.5, 7.8], // the red tag that names the red cells
    out: [8.8, 9.1], // the mask beat fades out
  };
  const STOP = 0.6; // the red arcs are drawn only this far

  // where a red arc ends: this far along its LENGTH (not its parameter), so the cross sits exactly on the end of the drawn stroke
  const pointAlong = (x1, x2, y, lift, frac) => {
    const [cx, cy] = [(x1 + x2) / 2, y - 2 * lift];
    const pt = (u) => [
      (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * cx + u * u * x2,
      (1 - u) * (1 - u) * y + 2 * (1 - u) * u * cy + u * u * y,
    ];
    const M = 400;
    const acc = [0];
    let prev = pt(0);
    for (let i = 1; i <= M; i++) {
      const p = pt(i / M);
      acc.push(acc[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
      prev = p;
    }
    const goal = frac * acc[M];
    let i = 1;
    while (acc[i] < goal) i++;
    const u = (i - 1 + (goal - acc[i - 1]) / (acc[i] - acc[i - 1])) / M;
    const p = pt(u);
    return { x: p[0], y: p[1] };
  };

  function build(stage) {
    // the sentence: <sos> and six slots (a slot that is not written yet is a dashed ghost of the word to come)
    const s = A10.sentence(stage, { x: 20, y: SENT_Y, words: SLOTS, gap: 10 });
    A10.same(
      "decoder: slot widths",
      s.tags.map((g) => g.w),
      [121, 82, 108, 115, 118, 169, 122],
    );
    A10.same(
      "decoder: slot centres",
      SLOTS.map((_, i) => s.top(i).x),
      [80.5, 192, 297, 418.5, 545, 698.5, 854],
    );
    A10.same("decoder: the sentence fits the stage", [s.left(0).x >= 12, s.right(N - 1).x <= 924], [true, true]);
    const svg = A10.svg(stage);

    // the question and the candidates (four are drawn; three dots say there are more)
    const next = A10.tag(stage, { x: 220, y: 206, text: "next word?", tone: "orange" });
    A10.same("decoder: the next-word tag is 195 px wide", next.w, 195);
    const cand = [0, 1, 2, 3].map((i) => A10.tag(stage, { x: CAND.x, y: CAND.y + CAND.dy * i, w: CAND.w, text: "" }));
    DEC.steps.forEach((st) =>
      st.words.forEach((w) => {
        if (A10.tagW(w) > CAND.w) throw new Error(`scene 09: candidate "${w}" does not fit its ${CAND.w} px tag`);
      }),
    );
    const bars = A10.bars(stage, { ...BAR, n: 4, dir: "h", tone: "blue" });
    const more = svg.appendChild(
      V.s(
        "g",
        {},
        ...[0, 1, 2].map((j) =>
          V.s("circle", {
            cx: CAND.x + CAND.w / 2,
            cy: MORE_Y + 18 * j,
            r: 5,
            style: { fill: "var(--text-dim)" },
          }),
        ),
      ),
    );
    A10.same(
      "decoder: the bars of the longest share end inside the stage",
      BAR.x + BAR.unit * Math.max(...DEC.steps.map((st) => st.probs[st.best])) + 12 + A10.textW("0.97") <= 924,
      true,
    );

    // the mask beat: green arcs back, red arcs forward (stopped by a cross), the mask grid, one tag. The arcs leave the top of "habe"
    // side by side (the longest on the outside, so none cross) instead of all from one point
    const askX = s.top(ASK).x;
    const [backTo, ahead] = [
      [0, 1],
      [3, 4, 5, 6],
    ];
    A10.same(
      "decoder: habe looks back at 2 slots and is blocked from 4",
      [backTo.length, ahead.length, MASK[ASK].filter((x) => !x).length],
      [2, 4, 4],
    );
    const from = { 0: askX - 4, 1: askX - 30, 3: askX + 42, 4: askX + 29, 5: askX + 16, 6: askX + 3 };
    A10.same(
      "decoder: the arcs leave the top of habe",
      Object.values(from).every((x) => x > s.left(ASK).x + 8 && x < s.right(ASK).x - 8),
      true,
    );
    const lift = (j) => A10.arcLift(s.top(j).x - from[j], 24, 0.12, 90);
    const arc = (j, o) => A10.arc(svg, { x1: from[j], y1: SENT_Y, x2: s.top(j).x, y2: SENT_Y, lift: lift(j), ...o });
    const arcBack = backTo.map((j) => arc(j, { tone: "green", w: 7 }));
    const arcAhead = ahead.map((j) => arc(j, { tone: "red", w: 5, dot: false }));
    const apex = SENT_Y - Math.max(...[...backTo, ...ahead].map(lift));
    A10.same("decoder: the highest arc peaks inside the stage", apex >= 12, true);
    const crosses = ahead.map((j) => {
      const at = pointAlong(from[j], s.top(j).x, SENT_Y, lift(j), STOP);
      return svg.appendChild(L5.cross(at.x, at.y, 40, "red", { w: 6 }));
    });

    const mg = A10.grid(stage, { x: GRID.x, y: GRID.y, rows: N, cols: N, cell: GRID.cell, gap: GRID.gap, radius: 6 });
    A10.same("decoder: the grid fits the stage", [mg.width, mg.height, GRID.x + mg.width <= 924], [264, 264, true]);
    const rowY = mg.mid(ASK, 0).y;
    const ring = V.h("div", {
      style: {
        position: "absolute",
        boxSizing: "border-box",
        left: `${GRID.x - 7}px`,
        top: `${rowY - GRID.cell / 2 - 5}px`,
        width: `${mg.width + 14}px`,
        height: `${GRID.cell + 10}px`,
        border: "4px solid var(--violet)",
        borderRadius: "14px",
      },
    });
    stage.append(ring);
    const masked = A10.tag(stage, {
      x: Math.round(GRID.x + mg.width / 2 - 73.5),
      y: 548,
      text: "masked",
      tone: "red",
      solid: true,
    });
    A10.same("decoder: the masked tag is 147 px wide", masked.w, 147);

    return (t) => {
      const round = ROUND.reduce((a, r, i) => (t >= r.t0 ? i : a), -1); // the round that is on screen (-1: none yet)
      const r = ROUND[Math.max(round, 0)];
      const step = DEC.steps[Math.max(round, 0)];
      const main = t < ROUND[2].t0 ? 1 - ramp(t, ...TM.fade, E.lin) : 1; // candidates and bars: out for the mask beat
      const gone = ramp(t, ...TM.out, E.lin); // the mask beat fades out

      // 1. the sentence: the start token, then each word is written where its dashed slot was
      s.all((i) => {
        const k = A10.seq(t, TM.slots[0], TM.slots[1], TM.slots[2], i);
        if (i === 0) return { k, text: SLOTS[0] };
        const w = ROUND[i - 1].write;
        if (t < w) return { k, ghost: true, text: "" };
        let [tone, solid] = ["grey", false];
        if (i === N - 1 || t < w + TM.flash) [tone, solid] = ["green", true];
        const asking = i === ASK && t >= TM.ask[0] && t < TM.ask[1];
        if (asking) [tone, solid] = ["purple", true];
        const bump = 0.12 * flash(t, w, w + 0.3) + (i === ASK ? 0.08 * flash(t, TM.ask[0], TM.ask[0] + 0.35) : 0);
        return { k, text: SLOTS[i], tone, solid, s: 1 + bump };
      });

      // 2. the question, four candidates and their shares
      const back = ROUND[2].t0; // after the mask beat the question pops back with the third round
      const kNext = t < back ? ramp(t, ...TM.next, E.lin) : ramp(t, back, back + 0.3, E.lin);
      next.set({ k: kNext, o: main * (1 - ramp(t, ...TM.nextOut, E.lin)) });
      const rk = (i) => (round < 0 ? 0 : A10.seq(t, r.t0, 0.06, 0.25, i));
      cand.forEach((c, i) => {
        const win = round >= 0 && i === step.best && t >= r.green;
        c.set({
          text: step.words[i],
          k: rk(i),
          o: main,
          tone: win ? "green" : "grey",
          s: win ? 1 + 0.08 * flash(t, r.green, r.green + 0.3) : 1,
        });
      });
      V.place(more, { s: 0.5 + 0.5 * E.pop(rk(3)), o: Math.min(1, rk(3) * 4) * main });
      const all = round === 2; // step 3 is the lesson's own example: all four shares are printed
      step.probs.forEach((p, i) => {
        const win = round >= 0 && i === step.best && t >= r.green;
        const grown = t >= r.full;
        bars.set(i, {
          v: p,
          grow: round < 0 ? 0 : ramp(t, r.t0 + 0.05 * i, r.full, E.out),
          tone: win ? "green" : "blue",
          solid: win,
          text: (all && grown) || win ? step.probsTxt[i] : "",
          o: main,
        });
      });

      // 3. masked attention: "habe" looks back (green), is stopped from looking ahead (red), and the mask grid says it for every word
      arcBack.forEach((a, n) =>
        a.set({
          k: ramp(t, TM.back[0] + TM.back[1] * n, TM.back[0] + TM.back[1] * n + TM.back[2], E.out),
          o: 1 - gone,
        }),
      );
      arcAhead.forEach((a, n) => {
        const t0 = TM.block[0] + TM.block[1] * n;
        a.set({ k: STOP * ramp(t, t0, t0 + TM.block[2], E.out), o: 1 - gone });
        const kc = ramp(t, TM.cross[0] + TM.cross[1] * n, TM.cross[0] + TM.cross[1] * n + TM.cross[2], E.lin);
        V.place(crosses[n], { s: 0.5 + 0.5 * E.pop(kc), o: Math.min(1, kc * 4) * (1 - gone) });
      });
      mg.all((row, col) => {
        const k = ramp(t, TM.grid[0] + TM.grid[1] * row, TM.grid[0] + TM.grid[1] * row + TM.grid[2], E.lin);
        return MASK[row][col] ? { v: 0.45, k, o: 1 - gone } : { blocked: 1, k, o: 1 - gone };
      });
      const kr = ramp(t, ...TM.ring, E.lin);
      V.place(ring, { s: 0.9 + 0.1 * E.pop(kr), o: Math.min(1, kr * 4) * (1 - gone) });
      masked.set({ k: ramp(t, ...TM.masked, E.lin), o: 1 - gone });
    };
  }

  V.scene({
    kicker: "THE DECODER",
    title: ["The decoder writes", "one word at a time"],
    dur: 14,
    caps: [
      [0.5, 2, "Writing starts from a start token."],
      [2.1, 3.7, "Every possible next word gets a share."],
      [3.9, 5.5, "The likeliest word is written down."],
      [6.9, 8.9, "Masked attention: no peeking at later words."],
      [9.8, 11.6, "Append the word, then go round again."],
      [12.2, 13.8, "The end token stops the loop."],
    ],
    build,
  });
})();
