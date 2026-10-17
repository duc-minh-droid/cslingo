/* Phase 10 · scene 06-values (12.5 s): the shares BLEND the values (lesson 10.4, "the dog barked").
   BEAT 1 (0.2-7.5) is one column addition for "barked": each word's value (orange) is scaled by its share (green) and the three scaled
   copies are added up: 0.14 × [2, 1] + 0.58 × [1, 3] + 0.28 × [1, 1] = [1.14, 2.15]. BEAT 2 (7.6-12.5) does every word at once: the 3 × 3
   grid of shares times the stack of values gives one new pair of numbers per word, and the "barked" row is the one just computed.
   Every number comes from A10.QKV (common.js) and is asserted again here, including the shown parts adding up to the shown sums.
   Beat 1 prints the three shares to THREE decimals (0.140, 0.576, 0.284) so that every product can be checked by hand (0.576 × 3 =
   1.728, shown 1.73); beat 2 keeps two decimals.
   Story (local seconds): 0.2-0.8 "for barked" and the three words; 0.9-2.0 the values; 2.4-3.3 the shares and the times signs; 3.4-4.5 each
   value is copied, slides right (the copy only shows once it has cleared the original) and flips into its scaled numbers; 4.9-6.3 plus
   signs, the sum line, the green result; 7.1-7.5 beat 1 fades; 7.6-8.5 the grid of shares; 8.3-8.8 the "barked" row is ringed; 8.9-9.6 times and the value stack; 9.8-11.2 equals, the
   green results row by row, a ring on "barked". Hold to 12.5. */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const { ramp, flash, ease: E } = V;

  const Q = A10.QKV;
  const BK = Q.barked;
  const ASK = Q.F;
  const N = Q.words.length;
  const num = (s) => +String(s).replace("−", "-");
  A10.same("values: the sentence and the asking word", [Q.words.join(" "), Q.words[ASK]], ["the dog barked", "barked"]);
  A10.same("values: the values", Q.V, [
    [2, 1],
    [1, 3],
    [1, 1],
  ]);
  A10.same(
    "values: the shares of barked",
    BK.rows.map((r) => r.wTxt),
    ["0.14", "0.58", "0.28"],
  );
  A10.same("values: the shares of barked are the last row of the grid", Q.AT[ASK], ["0.14", "0.58", "0.28"]);
  A10.close("values: the shares add up to 1", A10.sum(BK.weights), 1, 1e-9);
  BK.rows.forEach((r, j) =>
    Q.V[j].forEach((v, d) =>
      A10.same(`values: share × value ${Q.words[j]}.${d}`, BK.blend.partsTxt[j][d], (BK.weights[j] * v).toFixed(2)),
    ),
  );
  BK.blend.zTxt.forEach((z, d) =>
    A10.same(
      `values: the shown parts add up to the shown sum ${d}`,
      A10.r(A10.sum(BK.blend.partsTxt.map((p) => num(p[d])))),
      num(z),
    ),
  );
  const SHARE3 = BK.weights.map((w) => w.toFixed(3)); // beat 1 shows three decimals so the products can be checked by hand
  A10.same("values: the shares of barked to three decimals", SHARE3, ["0.140", "0.576", "0.284"]);
  A10.close("values: the three-decimal shares add up to 1", A10.sum(SHARE3.map(Number)), 1, 1e-9);
  SHARE3.forEach((sh, r) =>
    Q.V[r].forEach((v, d) =>
      A10.same(
        `values: the shown share × the shown value ${Q.words[r]}.${d}`,
        (+sh * v).toFixed(2),
        BK.blend.partsTxt[r][d],
      ),
    ),
  );
  A10.same("values: new barked", BK.blend.zTxt, ["1.14", "2.15"]);
  A10.same("values: the grid of shares", Q.AT, [
    ["0.14", "0.58", "0.28"],
    ["0.05", "0.77", "0.19"],
    ["0.14", "0.58", "0.28"],
  ]);
  A10.same("values: the new numbers", Q.ZT, [
    ["1.14", "2.15"],
    ["1.05", "2.54"],
    ["1.14", "2.15"],
  ]);
  A10.same(
    "values: shares times values is the stack of new numbers",
    A10.mm(Q.A, Q.V).map((row) => row.map((v) => v.toFixed(2))),
    Q.ZT,
  );
  A10.same("values: barked is the last row of both stacks", Q.ZT[ASK], BK.blend.zTxt);

  // ---------- layout (stage px) ----------
  const CY = (r) => 204 + 100 * r; // beat 1 row centres 204, 304, 404
  const RES = 512; // beat 1 result row centre
  const COL = { share: 156, shareW: 100, times: 284, val: 310, eq: 512, prod: 540, plus: 627 };
  const CHIP = { w: 84, gap: 6 };
  const SHIFT = 96; // beat 1 spans x 12-724, so it is moved right to sit centred on the stage
  const G = { x: 162, y: 200, cw: 118, ch: 64, gap: 6 }; // beat 2 grid
  const T = {
    who: 0.2, // purple tag; the three word tags at 0.35 + 0.15 r
    value: 0.9, // value chip r at 0.9 + 0.2 r
    share: 2.4, // share cell r at 2.4 + 0.15 r, its times sign 0.1 later
    scale: 3.4, // row r copies and slides from 3.4 + 0.15 r for 0.7 s; the copy shows from +0.38 and flips from +0.45
    eq: 4.35, // equals sign r at 4.35 + 0.15 r (after the chip has landed)
    plus: 4.9, // the two plus signs 0.15 apart
    line: [5.2, 5.6],
    out: 5.6, // the green tag; its equals 5.75; the chip 5.85
    fade: [7.1, 7.5],
    grid: 7.6, // rows 0.12 apart from 7.7
    ask: [8.3, 8.8],
    times: 8.9,
    stack: 9.0, // value row r at 9.0 + 0.1 r
    eq2: 9.8,
    res: 10.05, // result row r at 10.05 + 0.2 r
    ring: [10.8, 11.2],
  };

  /* one ring round a whole chip or row (cell rings would overlap in the gaps between neighbours) */
  function frame(parent, x, y, w, h, tone) {
    const el = V.h("div", {
      style: {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
        boxSizing: "border-box",
        border: `5px solid ${A10.tone(tone).c}`,
        borderRadius: "22px",
        visibility: "hidden",
      },
    });
    parent.append(el);
    return (k) => V.place(el, { s: 0.9 + 0.1 * E.pop(k), o: Math.min(1, k * 3) });
  }

  function build(stage) {
    // ---------- beat 1: one column addition, all in a wrapper so that it fades as a group ----------
    const w1 = V.h("div", { style: { position: "absolute", left: `${SHIFT}px`, top: "0px" } });
    stage.append(w1);
    const who = A10.tag(w1, { x: 12, y: 24, text: "for “barked”", tone: "purple", solid: true });
    A10.same("values: the purple tag is 213 px wide", who.w, 213);
    const words = Q.words.map((w, r) => A10.tag(w1, { x: 12, y: CY(r) - 29, text: w }));
    const head = (text, tone, cx) => A10.tag(w1, { x: cx - A10.tagW(text) / 2, y: 96, text, tone });
    const hdr = {
      share: head("share", "green", COL.share + COL.shareW / 2),
      value: head("value", "orange", COL.val + 87),
      scaled: head("scaled", "orange", COL.prod + 87),
    };
    const chip = (x, y, texts, tone, solid) =>
      A10.cells(w1, { x, y, texts, w: CHIP.w, h: 56, gap: CHIP.gap, tone, solid });
    const shares = Q.words.map((_, r) =>
      A10.cells(w1, {
        x: COL.share,
        y: CY(r) - 28,
        texts: [SHARE3[r]],
        w: COL.shareW,
        h: 56,
        tone: "green",
        solid: true,
      }),
    );
    A10.same("values: the share cells clear the times sign", COL.share + COL.shareW + 8 <= COL.times - 17, true);
    const vals = Q.words.map((_, r) => chip(COL.val, CY(r) - 28, Q.V[r].map(String), "orange", false));
    const prods = Q.words.map((_, r) => chip(COL.prod, CY(r) - 28, BK.blend.partsTxt[r], "orange", true));
    const sum = chip(COL.prod, RES - 28, BK.blend.zTxt, "green", true);
    const line = V.h("div", {
      style: {
        position: "absolute",
        left: "530px",
        top: "448px",
        width: "194px",
        height: "6px",
        borderRadius: "3px",
        background: "var(--line-2)",
        transformOrigin: "0% 50%",
        visibility: "hidden",
      },
    });
    w1.append(line);
    const result = A10.tag(w1, { x: 164, y: RES - 29, text: "new “barked”", tone: "green", solid: true });
    A10.same("values: the green tag is 230 px wide", result.w, 230);
    const svg = A10.svg(w1);
    const times = Q.words.map((_, r) => svg.appendChild(A10.op("times", COL.times, CY(r), 34)));
    const eqs = Q.words.map((_, r) => svg.appendChild(A10.op("equals", COL.eq, CY(r), 34)));
    const pluses = [CY(0) + 50, CY(1) + 50].map((y) => svg.appendChild(A10.op("plus", COL.plus, y, 30)));
    const eqRes = svg.appendChild(A10.op("equals", COL.eq, RES, 34));
    A10.same("values: the green row clears the share cells", result.x + result.w <= COL.eq - 40, true);
    A10.same(
      "values: beat 1 stays inside the stage margins",
      [12 + SHIFT >= 12, COL.prod + 2 * CHIP.w + CHIP.gap + SHIFT <= 924],
      [true, true],
    );

    // ---------- beat 2: every word at once ----------
    const g = A10.grid(stage, { x: G.x, y: G.y, rows: N, cols: N, cw: G.cw, ch: G.ch, gap: G.gap, radius: 14 });
    const rowTags = Q.words.map((w, r) => A10.tag(stage, { x: 12, y: g.mid(r, 0).y - 29, text: w }));
    const colTags = Q.words.map((w, c) => A10.tag(stage, { x: g.mid(0, c).x - A10.tagW(w) / 2, y: G.y - 72, text: w }));
    const stackX = 578;
    const stack = Q.words.map((_, r) =>
      A10.cells(stage, {
        x: stackX,
        y: g.mid(r, 0).y - 28,
        texts: Q.V[r].map(String),
        w: 64,
        h: 56,
        gap: 6,
        tone: "orange",
      }),
    );
    const resW = 72;
    const resX = 768;
    const results = Q.words.map((_, r) =>
      A10.cells(stage, {
        x: resX,
        y: g.mid(r, 0).y - 28,
        texts: Q.ZT[r],
        w: resW,
        h: 56,
        gap: 4,
        tone: "green",
        solid: true,
      }),
    );
    const svg2 = A10.svg(stage);
    const times2 = svg2.appendChild(A10.op("times", 556, g.mid(1, 0).y, 38));
    const eq2 = svg2.appendChild(A10.op("equals", 740, g.mid(1, 0).y, 38));
    const labY = G.y + N * G.ch + (N - 1) * G.gap + 24;
    const lab = {
      shares: A10.tag(stage, { x: g.mid(0, 1).x - A10.tagW("shares") / 2, y: labY, text: "shares", tone: "green" }),
      values: A10.tag(stage, { x: stackX + 35 - A10.tagW("values") / 2, y: labY, text: "values", tone: "orange" }),
      out: A10.tag(stage, {
        x: 924 - A10.tagW("new numbers"),
        y: labY,
        text: "new numbers",
        tone: "green",
        solid: true,
      }),
    };
    A10.same("values: the labels do not touch", lab.values.x + lab.values.w + 12 <= lab.out.x, true);
    A10.same("values: nothing leaves the stage", resX + 2 * resW + 4 + 8 <= 924 && lab.out.x + lab.out.w <= 924, true);
    const rowRing = frame(
      stage,
      G.x - 6,
      g.mid(ASK, 0).y - G.ch / 2 - 6,
      N * G.cw + (N - 1) * G.gap + 12,
      G.ch + 12,
      "purple",
    );
    const resRing = frame(stage, resX - 6, g.mid(ASK, 0).y - 34, 2 * resW + 4 + 12, 68, "purple");

    return (t) => {
      // ----- beat 1 -----
      V.place(w1, { o: 1 - ramp(t, ...T.fade, E.lin) });
      who.set({ k: ramp(t, T.who, T.who + 0.35, E.lin) });
      words.forEach((tag, r) => tag.set({ k: A10.seq(t, T.who + 0.15, 0.15, 0.35, r) }));
      hdr.value.set({ k: ramp(t, T.value, T.value + 0.35, E.lin) });
      hdr.share.set({ k: ramp(t, T.share, T.share + 0.35, E.lin) });
      hdr.scaled.set({ k: ramp(t, T.scale + 0.3, T.scale + 0.65, E.lin) });

      Q.words.forEach((_, r) => {
        vals[r].all((i) => A10.pop(A10.seq(t, T.value + 0.2 * r, 0.06, 0.35, i)));
        const s0 = T.share + 0.15 * r;
        const a = T.scale + 0.15 * r;
        const pushed = 1 + 0.12 * flash(t, a + 0.05, a + 0.55); // the share nudges as it scales its row
        const sp = A10.pop(A10.seq(t, s0, 0, 0.35, 0));
        shares[r].set(0, { ...sp, s: sp.s * pushed });
        V.place(times[r], A10.pop(ramp(t, s0 + 0.1, s0 + 0.4, E.lin)));

        // a copy of the value chip sits on the value, slides right and flips into the scaled numbers
        const dx = -230 * (1 - ramp(t, a, a + 0.7, E.inOut));
        const seen = ramp(t, a + 0.38, a + 0.48, E.lin); // the copy shows only once it has cleared the value chip
        Q.V[r].forEach((v, i) => {
          const k = ramp(t, a + 0.45 + 0.06 * i, a + 0.8 + 0.06 * i, E.lin);
          prods[r].flip(i, k, {
            from: String(v),
            to: BK.blend.partsTxt[r][i],
            tone: "orange",
            toTone: "orange",
            solid: k >= 0.5,
            hop: 8,
            x: dx,
            o: seen,
          });
        });
        const e0 = T.eq + 0.15 * r;
        V.place(eqs[r], A10.pop(ramp(t, e0, e0 + 0.3, E.lin)));
      });

      pluses.forEach((p, i) => V.place(p, A10.pop(ramp(t, T.plus + 0.15 * i, T.plus + 0.15 * i + 0.3, E.lin))));
      const lk = ramp(t, ...T.line, E.out);
      line.style.transform = `scaleX(${lk.toFixed(3)})`;
      line.style.visibility = lk <= 0.002 ? "hidden" : "";
      result.set({ k: ramp(t, T.out, T.out + 0.35, E.lin) });
      V.place(eqRes, A10.pop(ramp(t, T.out + 0.15, T.out + 0.45, E.lin)));
      sum.all((i) => A10.pop(A10.seq(t, T.out + 0.25, 0.12, 0.35, i)));

      // ----- beat 2 -----
      colTags.forEach((tag, c) => tag.set({ k: A10.seq(t, T.grid, 0.1, 0.35, c) }));
      const asks = t >= T.ask[0];
      rowTags.forEach((tag, r) => {
        const own = r === ASK && asks;
        tag.set({
          k: A10.seq(t, T.grid + 0.1 + 0.12 * r, 0, 0.35, 0),
          tone: own ? "purple" : "grey",
          solid: own,
          s: own ? 1 + 0.1 * flash(t, ...T.ask) : 1,
        });
      });
      g.all((r, c) => ({
        v: Q.A[r][c],
        text: Q.AT[r][c],
        k: A10.seq(t, T.grid + 0.15 + 0.12 * r, 0.05, 0.35, c),
      }));
      rowRing(ramp(t, ...T.ask, E.lin));
      lab.shares.set({ k: ramp(t, 8.2, 8.55, E.lin) });
      V.place(times2, A10.pop(ramp(t, T.times, T.times + 0.3, E.lin)));
      stack.forEach((c, r) => c.all((i) => A10.pop(A10.seq(t, T.stack + 0.1 * r, 0.06, 0.35, i))));
      lab.values.set({ k: ramp(t, 9.2, 9.55, E.lin) });
      V.place(eq2, A10.pop(ramp(t, T.eq2, T.eq2 + 0.3, E.lin)));
      results.forEach((c, r) => c.all((i) => A10.pop(A10.seq(t, T.res + 0.2 * r, 0.06, 0.35, i))));
      lab.out.set({ k: ramp(t, 10.2, 10.55, E.lin) });
      resRing(ramp(t, ...T.ring, E.lin));
    };
  }

  V.scene({
    kicker: "VALUES",
    title: ["The shares blend", "the values"],
    dur: 12.5,
    caps: [
      [0.9, 2.9, "Each word also carries a value: its content."],
      [3.3, 5, "Scale each value by its share."],
      [5.6, 7.2, "Add them up: new numbers for “barked”."],
      [7.8, 9.5, "Do it for every word at once."],
      [10, 11.9, "One new set of numbers per word."],
    ],
    build,
  });
})();
