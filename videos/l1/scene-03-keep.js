/* Lecture 1 · What is NIC?, scene 03-keep: evolve QZT into CAT with "change one letter, keep it if it is not worse". */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const CAT = L1.CAT;
  const { target: TARGET, start: START, rows: ROWS } = CAT;
  const N = TARGET.length;
  const [ROW_T, ROW_C, ROW_Y] = [20, 190, 360];
  const [X0, SIZE, PIPX] = [190, 92, 526];
  const [RX, RW, RH, CX] = [640, 296, 60, 788];
  const ok = (s, i) => +(s[i] === TARGET[i]);

  // one entry per try: copy appears at a, tile flips f0..f1, verdict lit v0.., then slide up (keep) or shake and fade (discard)
  const TRY = [
    { a: 2.4, f: [2.8, 3.3], keep: true, up: [3.8, 4.2], end: 4.4 },
    { a: 4.5, f: [4.9, 5.3], keep: false, bad: [5.5, 5.9], out: [5.6, 6.1], end: 6.2 },
    { a: 6.3, f: [6.7, 7.1], keep: true, up: [7.6, 8.0], end: 8.2 },
  ].map((tm, k) => ({ ...tm, ...ROWS[k], gene: CAT.tries[k][0], letter: CAT.tries[k][1] }));
  // which sticker is lit when: [from, to] pairs
  const LIT = {
    change: [
      [2.6, 3.5],
      [4.7, 5.5],
      [6.5, 7.3],
    ],
    worse: [
      [3.3, 3.7],
      [5.3, 5.6],
      [7.1, 7.5],
    ],
    keep: [
      [3.6, 4.3],
      [7.4, 99],
    ],
    throw: [[5.5, 6.2]],
  };
  const lit = (name, t) => Math.max(0, ...LIT[name].map(([a, b]) => ramp(t, a, a + 0.15) * (1 - ramp(t, b, b + 0.15))));

  V.scene({
    kicker: "EVOLUTION",
    title: ["Trial and error,", "keep what works"],
    dur: 10,
    caps: [
      [0.4, 2.2, "Goal: turn QZT into CAT."],
      [2.4, 4.6, "Change one letter at random. Better? Keep it."],
      [4.8, 6.4, "Worse? Throw it away."],
      [6.6, 9.4, "Progress adds up. That is cumulative selection."],
    ],
    build(stage) {
      const row = (y, genes, tone) => L5.chromosome(stage, { x: X0, y, genes, size: SIZE, gap: 12, tone });
      const tgt = row(ROW_T, TARGET, "green");
      const cur = row(ROW_C, START, "blue");
      const tri = row(ROW_Y, START, "blue");
      const curPips = L1.pips(stage, { n: N, size: 24, gap: 10, x: PIPX, y: ROW_C + 34 });
      const triPips = L1.pips(stage, { n: N, size: 24, gap: 10, x: PIPX, y: ROW_Y + 34 });
      const tag = (text, y, tone) => {
        const e = L1.chip(stage, text, tone, { x: 0, y: y + 46 - 26, width: 150 });
        e.style.height = "52px";
        e.style.lineHeight = "46px";
        return e;
      };
      const tags = [tag("target", ROW_T, "grey"), tag("current", ROW_C, "blue"), tag("try", ROW_Y, "purple")];

      // the rule as a flow of stickers
      const svg = L5.svg(stage);
      const arrows = [
        L5.arrow(CX, 86, CX, 134, "grey", 1, { w: 6, head: 18 }),
        L5.arrow(811, 206, 811, 262, "grey", 1, { w: 6, head: 18 }),
        L5.arrow(662, 206, 684, 392, "grey", 1, { w: 6, head: 18, bow: -22 }),
      ];
      svg.append(...arrows);
      const stk = (name, text, y, tone, x = RX, w = RW) => {
        const e = V.h("div", {
          class: `v-tag solid c-${tone}`,
          text,
          style: {
            left: `${x}px`,
            top: `${y}px`,
            width: `${w}px`,
            height: `${RH}px`,
            padding: "0",
            textAlign: "center",
            fontSize: "30px",
            lineHeight: `${RH - 6}px`,
          },
        });
        stage.append(e);
        return { name, e, tone };
      };
      const S = [
        stk("change", "random change", 20, "purple"),
        stk("worse", "not worse?", 140, "orange"),
        stk("keep", "keep", 270, "green", 686, 250),
        stk("throw", "throw away", 360, "red", 686, 250),
      ];
      const icoTick = L5.tick(0, 0, 34, "green", { on: true, w: 6 });
      const icoCross = L5.cross(0, 0, 34, "red", { on: true, w: 6 });
      const icoK = V.s("g", {}, icoTick);
      const icoX = V.s("g", {}, icoCross);
      svg.append(icoK, icoX);
      // the big tick that celebrates CAT
      const bigTick = L5.tick(0, 0, 46, "green", { ink: true, w: 9 });
      const bigG = V.s("g", {}, bigTick);
      svg.append(bigG);
      const T3 = TRY[2];
      const LAND3 = T3.up[1];

      const curStr = (t) => {
        let s = START;
        for (const r of TRY) if (r.up && t >= r.up[1]) s = r.after;
        return s;
      };
      const landed = (t, k) => TRY[k].up && t >= TRY[k].up[1];

      return (t) => {
        // ---- target ghosts
        tgt.all((i) => {
          const k = ramp(t, 0.3 + 0.08 * i, 0.7 + 0.08 * i, E.pop);
          return { ghost: true, tone: "green", s: Math.max(0.001, k), o: Math.min(1, k * 3) };
        });
        V.place(tags[0], { o: ramp(t, 0.3, 0.6), s: 0.9 + 0.1 * ramp(t, 0.3, 0.7, E.pop) });

        // ---- current row
        const s = curStr(t);
        cur.all((i) => {
          const k = ramp(t, 1.0 + 0.08 * i, 1.4 + 0.08 * i, E.pop);
          let land = 0;
          TRY.forEach((r, j) => {
            if (r.up && r.gene === i) land = Math.max(land, flash(t, r.up[1], r.up[1] + 0.35) * (landed(t, j) || t > r.up[1] ? 1 : 0));
          });
          const g = ramp(t, LAND3 + 0.12 * i, LAND3 + 0.4 + 0.12 * i);
          const done = g > 0.5;
          const pop = 1 + 0.16 * flash(t, LAND3 + 0.12 * i, LAND3 + 0.5 + 0.12 * i) * (t >= LAND3 ? 1 : 0);
          return {
            tone: done ? "green" : "blue",
            solid: done,
            text: s[i],
            s: Math.max(0.001, k) * (1 + 0.14 * land) * pop,
            o: Math.min(1, k * 3),
          };
        });
        V.place(tags[1], { o: ramp(t, 1.0, 1.3), s: 0.9 + 0.1 * ramp(t, 1.0, 1.4, E.pop) });
        const flags = [...s].map((_, i) => {
          let f = ok(s, i);
          TRY.forEach((r) => {
            if (r.up && r.gene === i && t >= r.up[1]) f = ok(r.cur, i) + (ok(r.after, i) - ok(r.cur, i)) * ramp(t, r.up[1], r.up[1] + 0.3);
          });
          return f;
        });
        curPips(flags, ramp(t, 1.3, 1.9));

        // ---- try row: the active try (if any)
        const act = TRY.findIndex((r) => t >= r.a && t < r.end);
        const r = TRY[Math.max(0, act)];
        let ty = 0;
        let tx = 0;
        let to = 0;
        let tone = "blue";
        if (act >= 0) {
          const down = ramp(t, r.a, r.a + 0.4, E.inOut);
          ty = ROW_C - ROW_Y + (ROW_Y - ROW_C) * down;
          to = 1;
          if (r.up) ty += (ROW_C - ROW_Y) * ramp(t, r.up[0], r.up[1], E.inOut) * down;
          if (r.up && t >= r.up[1]) to = 0; // landed: the current row shows the result
          if (r.out) {
            ty += 36 * ramp(t, r.out[0], r.out[1], E.in);
            to = 1 - ramp(t, r.out[0], r.out[1], E.lin);
          }
          if (r.bad) {
            const u = ramp(t, r.bad[0], r.bad[1], E.lin);
            tx = 6 * Math.sin(u * Math.PI * 6);
            if (t >= r.bad[0]) tone = "red";
          }
        }
        const fk = ramp(t, r.f[0], r.f[1], E.inOut);
        const newOk = r.cand[r.gene] === TARGET[r.gene];
        const keptNow = r.keep && t >= r.f[1] + 0.5;
        tri.all((i) => {
          const edge = keptNow && ok(r.cand, i) ? { borderColor: "var(--teal-lip)" } : null;
          const tile = tri.tiles[i];
          tile.style.borderColor = edge ? edge.borderColor : "";
          const o = { tone, y: ty, x: tx, o: to };
          if (i === r.gene) return { ...o, solid: fk > 0 && (t < r.f[1] + 0.2 || !r.keep || !!r.bad) && tone === "blue", tone: tone === "red" ? "red" : "purple" };
          return o;
        });
        const ch = r.gene;
        tri.flip(ch, fk, {
          from: r.cur[ch],
          to: r.letter,
          tone: "purple",
          toTone: tone === "red" ? "red" : keptNow ? "blue" : "purple",
          solid: !(tone === "red") && !keptNow && act >= 0 && t >= r.a + 0.3,
          hop: 22,
          y: ty,
          x: tx,
          o: to,
        });
        if (keptNow) tri.tiles[ch].style.borderColor = "var(--teal-lip)";
        else if (tone === "red") tri.tiles[ch].style.borderColor = "";
        V.place(tags[2], { y: ty - (act >= 0 ? ROW_Y - ROW_Y : 0) + (act >= 0 ? 0 : 0), o: to * ramp(t, r.a + 0.2, r.a + 0.5), x: tx });
        const tflags = [...r.cand].map((_, i) => {
          if (i !== ch) return ok(r.cur, i);
          return ok(r.cur, i) + (ok(r.cand, i) - ok(r.cur, i)) * ramp(t, r.f[1] - 0.1, r.f[1] + 0.25);
        });
        triPips(tflags, 1);
        V.place(triPips.el, { y: ty, x: tx, o: to });
        void newOk;

        // ---- the rule
        const popK = (i) => ramp(t, 1.9 + 0.1 * i, 2.3 + 0.1 * i, E.pop);
        S.forEach((st, i) => {
          const l = lit(st.name, t);
          const p = popK(i);
          V.place(st.e, { s: Math.max(0.001, p) * (1 + 0.08 * l), o: Math.min(1, p * 3) * (0.7 + 0.3 * l) });
          st.e.style.boxShadow = `0 ${4 + 4 * l}px 0 var(--${{ purple: "violet", orange: "amber", green: "teal", red: "rose" }[st.tone]}-lip)`;
        });
        arrows.forEach((a, i) => V.place(a, { o: ramp(t, 2.0 + 0.1 * i, 2.4 + 0.1 * i) * 0.7 }));
        const kk = popK(2);
        const tk = popK(3);
        V.place(icoK, { x: 811 - 62, y: 300, s: Math.max(0.001, kk), o: Math.min(1, kk * 3) * (0.7 + 0.3 * lit("keep", t)) });
        V.place(icoX, { x: 811 - 104, y: 390, s: Math.max(0.001, tk), o: Math.min(1, tk * 3) * (0.7 + 0.3 * lit("throw", t)) });
        L5.drawOn(icoTick, 1);
        L5.drawOn(icoCross, 1);

        // ---- the finished word gets a tick
        const gk = ramp(t, LAND3 + 0.5, LAND3 + 1.1);
        L5.drawOn(bigTick, gk);
        V.place(bigG, { x: X0 + 150, y: ROW_C - 40, s: 0.6 + 0.4 * ramp(t, LAND3 + 0.5, LAND3 + 0.9, E.pop), o: gk > 0 ? 1 : 0 });
      };
    },
  });
})();
