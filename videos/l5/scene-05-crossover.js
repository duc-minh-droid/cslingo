/* Lecture 5 · Encodings, scene 05-crossover: one-point crossover cuts two parent tours after gene 2, swaps the tails and
   makes two children that each repeat a city and miss another. */
(function () {
  const V = window.VID;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  const PARENTS = ["ADECB", "AECDB"];
  const CUT = 2; // genes the heads keep
  const KIDS = L5.cross1(PARENTS[0], PARENTS[1], CUT); // ADCDB, AEECB
  const TONE = ["blue", "purple"]; // parent 1, parent 2
  const BAD = KIDS.map((k) => L5.dupIdx(k)); // genes that repeat a city
  const MISSING = KIDS.map((k) => L5.missingOf(k)[0]);

  // layout (stage px). The working rows live in one block that slides down when the small parents arrive.
  const SZ = 88;
  const GAP = 12;
  const X0 = 248;
  const LEFT = 44; // left edge of the tag column
  const ROW_Y = [196, 452];
  const DY = ROW_Y[1] - ROW_Y[0];
  const CUT_X = X0 + CUT * (SZ + GAP) - GAP / 2;
  const TAG_W = 176;
  const BAND = ROW_Y.map((y) => y + SZ + 11); // under each row: not-a-tour badge, missing city
  const SY0 = 134; // scissors pivot at the start and end of the cut
  const SY1 = 524;
  const TIP = 36; // pivot to the point where the blades meet (the end of the dashed line)
  const LINE_TOP = 160;
  const SWING = 130; // how far each tail block slides sideways while it passes the other one
  const LIFTED = 0.7; // a travelling tail block shrinks to this scale, so the two blocks never overlap
  const LIFT = 40; // the block starts this much higher, to sit in the middle before the parents arrive
  // timeline (seconds)
  const T = { cutA: 1.75, cutB: 3.1, legend: 3.7, swapA: 5.0, swapB: 6.4, joinA: 6.7, joinB: 7.3, flip: 7.3, dmg: 8.7 };
  const DMG_STEP = 2;

  const f1 = (n) => n.toFixed(1);
  const centred = { padding: "0", display: "flex", alignItems: "center", justifyContent: "center" };
  const smooth = (x) => clamp(x) * clamp(x) * (3 - 2 * clamp(x));
  const pop = (k, dy = 8) => ({ s: 0.8 + 0.2 * E.pop(k), y: (1 - E.out(k)) * dy, o: clamp(k * 3) });

  /* a pair of scissors pointing down, pivot at (0, 0); set(open) = degrees each half leans from vertical */
  function scissors() {
    const half = (side) => {
      const blade = V.s("path", {
        d: "M -8 -34 L 8 -34 L 10 0 L 4 70 L -4 70 L -10 0 Z",
        "stroke-width": 3,
        "stroke-linejoin": "round",
        style: { fill: "var(--line-2)", stroke: "var(--text-dim)" },
      });
      const ring = V.s("ellipse", {
        cx: 0,
        cy: -52,
        rx: 13,
        ry: 18,
        fill: "none",
        "stroke-width": 8,
        style: { stroke: "var(--amber)" },
      });
      const g = V.s("g", {}, blade, ring);
      return { g, set: (open) => g.setAttribute("transform", `rotate(${f1(side * open)})`) };
    };
    const [a, b] = [half(1), half(-1)];
    const pivot = V.s("circle", { r: 7, style: { fill: "var(--ink)" } });
    const root = V.s("g", {}, a.g, b.g, pivot);
    return { root, set: (open) => (a.set(open), b.set(open)) };
  }

  V.scene({
    kicker: "CROSSOVER",
    title: ["Crossover can break", "a tour too"],
    dur: 14,
    caps: [
      [0.4, 3.5, "Two parents. Cut both after gene 2."],
      [3.5, 8.4, "Swap the tails to make two children."],
      [8.4, 13.3, "Each child repeats one city and misses another."],
    ],
    build(stage) {
      const work = stage.appendChild(
        V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "936px", height: "640px" } }),
      );
      // the dashed cut line sits under the tiles, so it only shows in the gap
      const back = L5.svg(work);
      const cutLine = V.s("line", {
        x1: CUT_X,
        x2: CUT_X,
        y1: LINE_TOP,
        y2: LINE_TOP,
        "stroke-width": 5,
        style: { stroke: "var(--amber)", strokeDasharray: "12 10" },
      });
      back.append(cutLine);

      const tag = (parent, text, colour, x, y, w, extra = {}) =>
        parent.appendChild(
          V.h("div", {
            class: `v-tag c-${colour}`,
            text,
            style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: "46px", ...centred, ...extra },
          }),
        );
      const tagY = (r) => ROW_Y[r] + (SZ - 46) / 2;

      // small parents at the top: the reference for where every gene came from
      const legend = PARENTS.map((p, r) =>
        L5.chromosome(stage, { x: X0, y: 24 + 70 * r, genes: p, size: 56, gap: 8, tone: TONE[r] }),
      );
      const legendTag = tag(stage, "parents", "grey", LEFT, 64, TAG_W);

      // gene numbers above the first row, so "after gene 2" can be seen
      const nums = [...PARENTS[0]].map((_, i) =>
        work.appendChild(
          V.h("div", {
            class: "v-text dim",
            text: String(i + 1),
            style: {
              left: `${X0 + i * (SZ + GAP)}px`,
              top: `${ROW_Y[0] - 46}px`,
              width: `${SZ}px`,
              textAlign: "center",
            },
          }),
        ),
      );

      // the working rows: parents first, children after the swap
      const rows = PARENTS.map((p, r) =>
        L5.chromosome(work, { x: X0, y: ROW_Y[r], genes: p, size: SZ, gap: GAP, tone: TONE[r] }),
      );
      const parentTags = [
        tag(work, "parent 1", "blue", LEFT, tagY(0), TAG_W),
        tag(work, "parent 2", "purple", LEFT, tagY(1), TAG_W),
      ];
      const kidTags = [
        tag(work, "child 1", "grey", LEFT, tagY(0), TAG_W),
        tag(work, "child 2", "grey", LEFT, tagY(1), TAG_W),
      ];

      // "swap" label between the rows
      const swapTag = tag(work, "swap", "purple", LEFT, (ROW_Y[0] + SZ + ROW_Y[1]) / 2 - 28, 150, {
        height: "56px",
        gap: "8px",
      });
      swapTag.classList.add("solid");
      const ic = V.s("svg", { width: 40, height: 40, viewBox: "0 0 40 40" });
      ic.append(
        L5.arrow(12, 6, 12, 34, "purple", 1, { w: 5, head: 13, on: true }),
        L5.arrow(28, 34, 28, 6, "purple", 1, { w: 5, head: 13, on: true }),
      );
      swapTag.prepend(ic);

      // damage report under each child: not a tour, and the city that went missing
      const badges = KIDS.map((_, c) => L5.badge(work, { x: X0, y: BAND[c], w: 280, h: 68 }));
      const ghosts = KIDS.map((_, c) =>
        work.appendChild(
          V.h("div", {
            class: "v-gene ghost c-orange",
            text: MISSING[c],
            style: {
              left: `${X0 + 324}px`,
              top: `${BAND[c]}px`,
              width: "68px",
              height: "68px",
              fontSize: "38px",
              borderColor: "var(--amber)",
            },
          }),
        ),
      );
      const missTags = KIDS.map((_, c) => tag(work, "missing", "orange", X0 + 408, BAND[c] + 11, 134));

      const sc = scissors();
      L5.svg(work).append(sc.root);

      return (t) => {
        V.place(work, { y: -LIFT * (1 - ramp(t, T.legend - 0.2, T.legend + 0.6, E.inOut)) });

        // ---- the cut: scissors run down the line, each row splits as the blades pass through it
        const sp = ramp(t, T.cutA, T.cutB, E.lin);
        const sy = lerp(SY0, SY1, sp);
        const lineEnd = sy + TIP;
        const open = ROW_Y.map((y) => ramp(lineEnd, y + 10, y + SZ + 40, E.out));
        const join = ramp(t, T.joinA, T.joinB, E.inOut);
        const gap = (r) => open[r] * (1 - join);
        const snip = sp > 0 && sp < 1 ? 15 + 9 * Math.sin(2 * Math.PI * 3 * t) : 20;
        const scIn = ramp(t, T.cutA - 0.35, T.cutA);
        const scOut = ramp(t, T.cutB, T.cutB + 0.4);
        sc.set(snip);
        sc.root.setAttribute(
          "transform",
          `translate(${f1(CUT_X)} ${f1(sy)}) scale(${f1(0.55 + 0.35 * E.pop(scIn) - 0.25 * scOut)})`,
        );
        V.show(sc.root, clamp(scIn * 3) * (1 - scOut));
        cutLine.setAttribute("y2", f1(Math.max(LINE_TOP, lineEnd)));
        V.show(cutLine, ramp(t, T.cutA - 0.3, T.cutA, E.lin) * (1 - join));

        // ---- the rows: appear, split, tails swing across, join, then show the damage
        const settle = flash(t, T.joinB - 0.2, T.joinB + 0.5);
        rows.forEach((row, r) =>
          row.all((i) => {
            const tail = i >= CUT;
            const appear = ramp(t, 0.3 + 0.25 * r + 0.06 * i, 0.65 + 0.25 * r + 0.06 * i, E.lin);
            const p = tail ? ramp(t, T.swapA, T.swapB, E.inOut) : 0; // each tail moves as one block
            const arc = Math.sin(Math.PI * p);
            // sideways swing: only between the rows (so a block never sweeps over the heads), smooth in and out
            const swing = smooth((p - 0.25) / 0.15) * smooth((0.75 - p) / 0.15);
            const lift = 1 - (1 - LIFTED) * arc;
            const down = r === 0;
            const kid = tail ? 1 - r : r; // the child this gene ends up in
            const tD = T.dmg + kid * DMG_STEP;
            const bad = BAD[kid].includes(i);
            const rank = BAD[kid].indexOf(i);
            const hit = bad ? flash(t, tD + 0.2 * rank, tD + 0.2 * rank + 0.6) : 0;
            return {
              x:
                (tail ? 10 : -10) * gap(r) +
                (tail ? (down ? SWING : -SWING) * swing + (CUT + 1 - i) * (SZ + GAP) * (1 - lift) : 0),
              y: (1 - E.out(appear)) * -24 + (down ? DY : -DY) * p,
              r: (down ? 3 : -3) * arc,
              s: E.pop(appear) * lift * (1 + 0.04 * settle) * (1 + 0.1 * hit),
              o: clamp(appear * 4),
              tone: bad && t >= tD + 0.35 + 0.2 * rank ? "red" : TONE[r],
            };
          }),
        );

        // ---- gene numbers follow the first row until the small parents arrive
        const numK = ramp(t, 0.9, 1.3) * (1 - ramp(t, T.cutB + 0.2, T.cutB + 0.6));
        nums.forEach((n, i) => V.place(n, { x: (i >= CUT ? 10 : -10) * open[0], y: (1 - numK) * 8, o: numK }));

        // ---- tags: parent -> child, and "swap" while the tails move
        const flipK = ramp(t, T.flip, T.flip + 0.5, E.lin);
        parentTags.forEach((tg, r) => {
          const k = ramp(t, 0.4 + 0.25 * r, 0.8 + 0.25 * r, E.lin);
          V.place(tg, { ...pop(k), o: clamp(k * 3) * (1 - flipK) });
        });
        kidTags.forEach((tg) => V.place(tg, { ...pop(flipK), o: flipK }));
        const swapK = ramp(t, T.swapA - 0.3, T.swapA + 0.1) * (1 - ramp(t, T.joinA - 0.1, T.joinA + 0.3));
        V.place(swapTag, { ...pop(swapK), o: swapK });

        // ---- the small parents
        legend.forEach((row, r) =>
          row.all((i) => {
            const k = ramp(t, T.legend + 0.25 * r + 0.05 * i, T.legend + 0.45 + 0.25 * r + 0.05 * i, E.lin);
            return { s: E.pop(k), y: (1 - E.out(k)) * -14, o: clamp(k * 4) };
          }),
        );
        V.place(legendTag, pop(ramp(t, T.legend, T.legend + 0.4, E.lin)));

        // ---- damage report: missing city, not-a-tour badge (the red genes are set in the rows above)
        KIDS.forEach((_, c) => {
          const tD = T.dmg + c * DMG_STEP;
          const gk = ramp(t, tD + 0.6, tD + 1.1, E.lin);
          V.place(ghosts[c], { s: E.pop(gk), o: clamp(gk * 4) });
          V.place(missTags[c], pop(ramp(t, tD + 0.75, tD + 1.15, E.lin)));
          const bk = ramp(t, tD + 1.3, tD + 1.9, E.lin);
          badges[c](bk > 0 ? "invalid" : "none", bk);
        });
      };
    },
  });
})();
