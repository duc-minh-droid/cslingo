/* Lecture 3 · scene 02-loop: every EA is the same six-station loop. One worked lap on real OneMax bitstrings. */
(function () {
  const V = window.VID;
  const L3 = V.l3;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- the real lap (OneMax: fitness = number of 1s) ----------
  const POP = ["10110", "00100", "01011", "10001"];
  const F = POP.map(L3.ones);
  const SEL = [0, 2]; // winners of the tournaments rows 1-2 and rows 3-4
  const [P1, P2] = SEL.map((i) => POP[i]);
  const CUT = 2;
  const CHILD = L3.cut(P1, P2, CUT);
  const MUT = L3.flip(CHILD, 1);
  const WEAK = F.indexOf(Math.min(...F));
  const NEWPOP = POP.map((p, i) => (i === WEAK ? MUT : p));
  const assert = (ok, msg) => {
    if (!ok) throw new Error(`scene-02-loop: ${msg}`);
  };
  assert(F.join() === "3,1,3,2", "fitness 3,1,3,2");
  assert(F[0] > F[1] && F[2] > F[3], "tournament winners are rows 1 and 3");
  assert(P1 === "10110" && P2 === "01011" && L5.cross1(P1, P2, CUT)[0] === CHILD, "parents");
  assert(CHILD === "10011" && L3.ones(CHILD) === 3, "child 10011 f 3");
  assert(MUT === "11011" && L3.ones(MUT) === 4, "mutant 11011 f 4");
  assert(WEAK === 1 && L3.ones(MUT) >= F[WEAK], "row 2 is replaced");
  assert(NEWPOP.map(L3.ones).join() === "3,4,3,2", "new fitness 3,4,3,2");

  // ---------- layout (stage px) ----------
  const TX = 280; // left of the gene tiles
  const SZ = 54;
  const GAP = 8;
  const PILL_X = 602;
  const POP_Y = [84, 150, 216, 282];
  const WORK_Y = [372, 438, 504];
  const FRAME_W = 5 * SZ + 4 * GAP + 24;
  const CUT_X = TX + CUT * (SZ + GAP) - GAP / 2;
  const LABEL_X = 146;

  // ---------- timeline ----------
  const STN = [
    { n: "Population", tone: "blue", x: 0, y: 0, a: 1.9 },
    { n: "Fitness", tone: "green", x: 337, y: 0, a: 2.8 },
    { n: "Selection", tone: "orange", x: 674, y: 0, a: 4.3 },
    { n: "Recombination", tone: "purple", x: 674, y: 584, a: 6.1 },
    { n: "Mutation", tone: "purple", x: 337, y: 584, a: 8.0 },
    { n: "Replacement", tone: "green", x: 0, y: 584, a: 9.3 },
  ];
  const T_END = 11.1;
  const chipAt = (i) => 0.2 + 0.25 * i;
  const T = {
    fit: 2.8,
    tourA: 4.35,
    tourB: 5.3,
    cut: 6.15,
    kid: 6.7,
    mut: 8.25,
    count: 8.8,
    weak: 9.35,
    out: 9.85,
    up: 10.0,
  };
  // arrows into chip i (0 = the closing one into Population)
  const ARR = [
    [131, 576, 131, 64],
    [270, 28, 329, 28],
    [607, 28, 666, 28],
    [805, 64, 805, 576],
    [666, 612, 607, 612],
    [329, 612, 270, 612],
  ];
  const f1 = (n) => n.toFixed(1);

  V.scene({
    kicker: "THE RECIPE",
    title: ["Every EA runs", "the same loop"],
    dur: 13,
    caps: [
      [0.4, 2.6, "Every EA repeats the same loop."],
      [2.8, 6, "Score everyone, then pick the fitter parents."],
      [6.2, 9.2, "Mix two parents, then change one gene."],
      [9.4, 12.5, "The child replaces the weakest. Then repeat."],
    ],
    build(stage) {
      // ---- the racetrack
      const track = L5.svg(stage);
      const arrows = ARR.map((a, i) => {
        const grey = L5.arrow(...a, "grey", 1, { w: 6, head: 18 });
        const col = L5.arrow(...a, STN[i].tone, 1, { w: 6, head: 18 });
        if (i === 0) col.querySelectorAll("[data-draw],[data-head]").forEach((p) => (p.style.stroke = "var(--teal)"));
        track.append(grey, col);
        return { grey, col };
      });
      arrows[0].col.querySelectorAll("[data-head]").forEach((p) => (p.style.fill = "var(--teal)"));
      const chips = STN.map((s) => L3.chip(stage, { x: s.x, y: s.y, text: s.n, tone: s.tone }));

      // ---- rows of tiles + f pill + frame
      const group = (parent) =>
        parent.appendChild(
          V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "0", height: "0" } }),
        );
      function makeRow(parent, genes, y, tone, pillTone = "green") {
        const g = group(parent);
        const frame = g.appendChild(
          V.h("div", {
            style: {
              position: "absolute",
              left: `${TX - 12}px`,
              top: `${y - 4}px`,
              width: `${FRAME_W}px`,
              height: "66px",
              boxSizing: "border-box",
              border: "4px solid var(--violet)",
              borderRadius: "18px",
            },
          }),
        );
        const ch = L5.chromosome(g, { x: TX, y, genes, size: SZ, gap: GAP, tone });
        const pill = L3.tag(g, { x: PILL_X, y: y + 1, text: `f = ${L3.ones(genes)}`, tone: pillTone });
        return { g, frame, ch, pill, y };
      }
      const rows = POP.map((p, i) => makeRow(stage, p, POP_Y[i], "blue"));
      const work = group(stage);
      const labels = ["parent 1", "parent 2", "child"].map((txt, i) =>
        work.appendChild(
          V.h("div", {
            class: "v-text dim",
            text: txt,
            style: { left: `${LABEL_X}px`, top: `${WORK_Y[i] + 10}px`, fontSize: "28px" },
          }),
        ),
      );
      const par = [makeRow(work, P1, WORK_Y[0], "blue"), makeRow(work, P2, WORK_Y[1], "purple")];
      const cutSvg = L5.svg(work);
      const cutLine = V.s("line", {
        x1: CUT_X,
        x2: CUT_X,
        y1: WORK_Y[0] - 12,
        y2: WORK_Y[0] - 12,
        "stroke-width": 5,
        style: { stroke: "var(--violet)", strokeDasharray: "12 9" },
      });
      cutSvg.append(cutLine);
      const kid = makeRow(stage, CHILD, WORK_Y[2], "blue");
      const best = L3.tag(stage, { x: PILL_X, y: POP_Y[WEAK] + 1, text: "best f = 4", tone: "orange", solid: true });
      const tickSvg = L5.svg(stage);
      const tick = L5.tick(PILL_X + 138, POP_Y[WEAK] + 28, 40, "green", { w: 7 });
      tickSvg.append(tick);

      const pop = (k) => ({ s: 0.8 + 0.2 * E.pop(k), o: clamp(k * 4) });
      const setFrame = (r, tone, k, fill) => {
        V.show(r.frame, k);
        r.frame.style.borderColor = `var(--${tone})`;
        r.frame.style.background = fill ? `var(--${fill})` : "";
      };

      return (t) => {
        // ---- chips and arrows
        STN.forEach((s, i) => {
          const end = i === STN.length - 1 ? T_END : STN[i + 1].a;
          const state = t < s.a ? "grey" : t < end ? "active" : "done";
          chips[i].set({ state, pop: ramp(t, chipAt(i), chipAt(i) + 0.3, E.lin), pulse: flash(t, s.a, s.a + 0.4) });
          const drawn =
            i === 0 ? ramp(t, chipAt(5) + 0.3, chipAt(5) + 0.65, E.lin) : ramp(t, chipAt(i), chipAt(i) + 0.3, E.lin);
          L5.drawOn(arrows[i].grey, drawn);
          const reach = i === 0 ? ramp(t, 10.9, 11.2, E.lin) : ramp(t, s.a - 0.3, s.a, E.lin);
          L5.drawOn(arrows[i].col, reach);
          V.place(arrows[i].col, { s: 1 + (i === 0 ? 0.1 * flash(t, 11.2, 11.9) : 0) });
        });

        // ---- population rows: slide in, then score, then selection frames
        rows.forEach((r, i) => {
          const k = ramp(t, 2.0 + 0.1 * i, 2.45 + 0.1 * i, E.out);
          const ones = [...POP[i]].flatMap((c, j) => (c === "1" ? [j] : []));
          const t0 = T.fit + 0.25 * i;
          const lit = ones.map((_, j) => t >= t0 + 0.12 * j);
          const settle = t >= t0 + 0.12 * ones.length + 0.5;
          const nLit = lit.filter(Boolean).length;
          const pk = ramp(t, t0, t0 + 0.2, E.lin);
          r.ch.all((j) => {
            const on = lit[ones.indexOf(j)] && !settle;
            return {
              tone: on ? "green" : "blue",
              solid: on,
              s: on ? 1 + 0.1 * flash(t, t0 + 0.12 * ones.indexOf(j), t0 + 0.12 * ones.indexOf(j) + 0.3) : 1,
            };
          });
          const isLoser = i === 1 || i === 3;
          const tour = i < 2 ? T.tourA : T.tourB;
          const dim = isLoser ? ramp(t, tour + 0.35, tour + 0.65, E.lin) * (1 - ramp(t, 6.1, 6.4, E.lin)) : 0;
          const pass =
            (i >= 2 ? ramp(t, 4.7, 4.9, E.lin) * (1 - ramp(t, 5.15, 5.35, E.lin)) : 0) +
            (i !== WEAK ? ramp(t, 9.95, 10.1, E.lin) * (1 - ramp(t, 10.8, 10.95, E.lin)) : 0);
          const winner = i === 0 || i === 2;
          const winK = winner ? ramp(t, tour + 0.35, tour + 0.5, E.lin) * (1 - ramp(t, 6.2, 6.5, E.lin)) : 0;
          const frameK = ramp(t, tour, tour + 0.2, E.lin) * (1 - ramp(t, 6.2, 6.5, E.lin));
          const isWeak = i === WEAK;
          const slide = isWeak ? ramp(t, T.out, T.out + 0.5, E.inOut) : 0;
          if (isWeak && t >= T.weak) setFrame(r, "rose", ramp(t, T.weak, T.weak + 0.2, E.lin), "rose-dim");
          else if (winner && winK > 0) setFrame(r, "amber", frameK, "amber-dim");
          else setFrame(r, "violet", frameK, null);
          const nVal = L3.count(0, F[i], t >= t0 ? clamp((nLit - 0.001) / Math.max(1, ones.length)) : 0);
          r.pill.set({ text: `f = ${t >= t0 ? Math.max(nLit, 0) : nVal}`, ...pop(pk) });
          V.place(r.g, {
            x: -(1 - k) * 40 + slide * 170,
            o: Math.min(clamp(k * 3), 1 - slide) * (1 - 0.65 * dim) * (1 - 0.55 * pass),
          });
        });

        // ---- selection: copies fly down to the work block
        par.forEach((r, i) => {
          const a = i === 0 ? 4.8 : 5.65;
          const k = ramp(t, a, a + 0.45, E.inOut);
          setFrame(r, "violet", 0, null);
          const fromY = POP_Y[SEL[i]] - WORK_Y[i];
          r.ch.all(() => ({}));
          r.pill.set(pop(1));
          V.place(r.g, { y: fromY * (1 - k), o: clamp(ramp(t, a, a + 0.1, E.lin)) });
          V.place(labels[i], { y: 8 * (1 - ramp(t, a + 0.35, a + 0.65)), o: ramp(t, a + 0.35, a + 0.65, E.lin) });
        });

        // ---- recombination: cut, then the child is filled from both parents
        cutLine.setAttribute("y2", f1(lerp(WORK_Y[0] - 12, WORK_Y[2] + SZ + 8, ramp(t, T.cut, T.cut + 0.5, E.inOut))));
        V.show(cutLine, ramp(t, T.cut, T.cut + 0.1, E.lin));
        const flipK = ramp(t, T.mut, T.mut + 0.5, E.inOut);
        kid.ch.all((i) => {
          const a = T.kid + 0.15 * i + (i >= CUT ? 0.15 : 0);
          const k = ramp(t, a, a + 0.35, E.out);
          return { y: (1 - k) * -22, s: E.pop(k), o: clamp(k * 4), tone: i < CUT ? "blue" : "purple" };
        });
        kid.ch.flip(1, flipK, {
          from: "0",
          to: "1",
          tone: "blue",
          toTone: t >= T_END ? "blue" : "orange",
          hop: 16,
          s: E.pop(ramp(t, T.kid + 0.15, T.kid + 0.5, E.out)),
          o: clamp(ramp(t, T.kid + 0.15, T.kid + 0.5, E.lin) * 4),
        });
        const pk = ramp(t, 7.85, 8.15, E.lin);
        const f = t < T.count ? 3 : t < T.count + 0.25 ? 3 : 4;
        kid.pill.set({
          text: `f = ${f}`,
          tone: t >= T_END ? "orange" : "green",
          ...pop(pk),
          s: pop(pk).s * (1 + 0.15 * flash(t, T.count, T.count + 0.4)),
        });
        V.place(labels[2], { y: 8 * (1 - ramp(t, 6.65, 6.95)), o: ramp(t, 6.65, 6.95, E.lin) });
        V.place(work, { o: 1 - ramp(t, T.out, T.out + 0.5, E.lin) });
        setFrame(kid, "amber", ramp(t, T_END, T_END + 0.3, E.lin), null);
        const up = ramp(t, T.up, T.up + 0.8, E.inOut);
        V.place(kid.g, { y: (POP_Y[WEAK] - WORK_Y[2]) * up });

        // ---- the end: tick on landing, orange best tag replaces the pill
        const tk = ramp(t, 10.8, 11.1, E.lin);
        V.place(tick, { s: E.pop(tk) });
        L5.drawOn(tick, tk);
        V.show(tick, tk * (1 - ramp(t, 11.7, 12, E.lin)));
        const bk = ramp(t, T_END + 0.2, T_END + 0.6, E.lin);
        best.set({ ...pop(bk), s: pop(bk).s });
        kid.pill.holder.style.visibility = t >= T_END + 0.2 ? "hidden" : "";
        best.holder.style.visibility = t >= T_END + 0.2 ? "" : "hidden";
      };
    },
  });
})();
