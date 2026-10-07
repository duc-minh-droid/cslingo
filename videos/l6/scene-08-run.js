/* Lecture 6 · Genetic programming, scene 08-run.
   A worked run on the hidden target x² + x + 1. Left: a plot with the 11 data points and the dotted target curve; the best
   program's curve and the red gap to the target sit on it. Right, in three beats:
     1. generation 0: four program cards (error bar + number), shuffled in, then sorted so the smallest error is on top (crown);
     2. the next generation: the four formulas, an arrow, then four rows filled one by one (a green copy of the best, a mutant,
        two crossover children), each with its real formula and error (made with L.replaceSubtree / L.swapSubtrees);
     3. a few generations later: a fast-forward icon, the best curve wanders through generic curves (old ones stay as faint
        trails) until it lies on the target, and a big green card shows x² + x + 1 with "error under 0.1" and a tick.
   Every error shown comes from the real trees and the real area (L.GEN0, L.area). The intermediate curves are generic. */
(function () {
  const V = window.VID;
  const L = V.l6;
  const { h, s, place, ramp, ease, lerp, clamp } = V;
  const pop = (t, a, d = 0.45) => ease.pop(ramp(t, a, a + d, ease.lin));
  const fade = (t, a, d = 0.2) => ramp(t, a, a + d, ease.lin);
  const text = (el, v) => el.textContent !== v && (el.textContent = v);
  const abs = (x, y, w, ht, more = "") =>
    `position:absolute;left:${x}px;top:${y}px;${w == null ? "" : `width:${w}px;`}${ht == null ? "" : `height:${ht}px;`}${more}`;

  // ---------- the data, checked against the lecture ----------
  const T = L.TARGET;
  const GEN0 = L.GEN0;
  const WANT = ["x + 1|0.67", "x² + 1|1.00", "2|1.70", "x|2.67"];
  if (GEN0.length !== 4 || GEN0.some((g, i) => `${g.formula}|${g.error.toFixed(2)}` !== WANT[i]))
    throw new Error("scene 08: generation 0 changed, check the lecture data");
  const F1 = L.fn(GEN0[0].tree); // the best program, x + 1
  const MAXERR = 3; // a full error bar

  // generic intermediate curves, as small wiggles around the target (no numbers shown for them)
  const KF = [
    F1,
    (x) => T(x) + 0.55 * x - 0.25,
    (x) => T(x) - 0.35 * Math.cos(3 * x) + 0.2,
    (x) => T(x) + 0.14 * Math.sin(5 * x),
    T,
  ];

  // ---------- layout (stage px, 936 x 640) ----------
  const COLX = 480; // the right column
  const COLW = 444;
  const PX = 12;
  const PY = 70;
  const PW = 440;
  const PH = 500;
  const CY0 = 84; // first card row
  const PITCH = 112;
  const CH = 100;
  const SLOT0 = [2, 0, 3, 1]; // where each program is dealt (shuffled), before the sort
  const SLOT1 = [0, 1, 2, 3]; // sorted: smallest error on top

  // ---------- timeline (local seconds) ----------
  const DOTS = 0.45;
  const CURVE = [0.9, 1.5];
  const DEAL = 1.0; // cards dealt, 0.28 apart
  const COUNT = [1.4, 2.4]; // errors count up
  const SORT = [2.6, 3.2];
  const CROWN = 3.3;
  const LINE = [3.1, 3.7];
  const GAP = [3.6, 4.1];
  const OUT1 = [4.3, 4.7]; // the cards leave
  const PILLS = 4.8;
  const ARROW = 5.1;
  const ROWS = 5.5; // four rows, 1 s apart
  const OUT2 = [10.2, 10.6];
  const FF = 10.7;
  const KF_AT = [10.9, 11.8, 12.7, 13.6];
  const KF_D = 0.75;
  const BIG = 14.4;
  const TICK = 15.0;

  // ---------- the next generation, made with the real tree operations ----------
  const mutant = L.replaceSubtree(L.parse("X#m"), "m", L.parse("(* X X)")); // x -> x²
  const [kidA, kidB] = L.swapSubtrees(L.parse("(+ X 1#sa)"), "sa", L.parse("(+ (*#sb X X) 1)"), "sb");
  const NEXT = [
    ["copy", "green", GEN0[0].tree],
    ["mutant", "blue", mutant],
    ["child", "purple", kidA],
    ["child", "purple", kidB],
  ].map(([label, tn, tree]) => ({ label, tn, formula: L.formula(tree), error: L.area(tree, T, -1, 1) }));

  // ---------- small pieces ----------
  const svgBox = (w, ht) =>
    s("svg", {
      width: w,
      height: ht,
      viewBox: `0 0 ${w} ${ht}`,
      style: "position:absolute;left:0;top:0;overflow:visible",
    });
  function makeCrown() {
    const svg = svgBox(56, 62);
    const on = "fill:var(--teal-on);stroke:var(--teal-on);stroke-linejoin:round;stroke-linecap:round";
    svg.append(
      s("circle", { cx: 28, cy: 33, r: 25, style: "fill:var(--teal-lip)" }),
      s("circle", { cx: 28, cy: 28, r: 25, "stroke-width": 4, style: "fill:var(--teal);stroke:var(--teal-lip)" }),
      s("path", { d: "M15 37L13 20L22 27L28 15L34 27L43 20L41 37Z", "stroke-width": 3.5, style: on }),
      s("path", { d: "M16 42H40", "stroke-width": 4.5, style: on }),
    );
    return h("div", { style: abs(-24, -26, 56, 62) }, svg);
  }
  /** a fast-forward icon: two purple triangles */
  function makeForward() {
    const svg = svgBox(88, 56);
    const st = "fill:var(--violet);stroke:var(--violet-lip);stroke-linejoin:round";
    svg.append(
      s("path", { d: "M6 6L40 28L6 50Z", "stroke-width": 5, style: st }),
      s("path", { d: "M46 6L80 28L46 50Z", "stroke-width": 5, style: st }),
    );
    return h("div", { style: abs(0, 0, 88, 56) }, svg);
  }

  /** one generation-0 card: formula tag, error bar, error number */
  function makeCard(P) {
    const root = h("div", { style: abs(COLX, 0, COLW, CH) });
    const base = h("div", { class: "v-card plain", style: abs(0, 0, COLW, CH) });
    const win = h("div", { class: "v-card c-green", style: abs(0, 0, COLW, CH) });
    const tag = h("div", {
      class: "v-tag solid c-blue",
      text: P.formula,
      style: { left: "16px", top: `${(CH - 50) / 2}px`, fontSize: "32px" },
    });
    const BX = 150;
    const BW = COLW - BX - 16 - 100;
    const track = h("div", { style: abs(BX, (CH - 18) / 2, BW, 18, "border-radius:9px;background:var(--line)") });
    const fill = "position:absolute;left:0;top:0;height:100%;width:0;border-radius:9px;";
    const fillR = track.appendChild(h("div", { style: `${fill}background:var(--rose)` }));
    const fillG = track.appendChild(h("div", { style: `${fill}background:var(--teal)` }));
    const num = h("div", {
      class: "v-text big",
      text: "0.00",
      style: abs(COLW - 16 - 100, 24, 100, null, "text-align:right;font-size:42px;line-height:1.1"),
    });
    const crown = makeCrown();
    root.append(base, win, tag, track, num, crown);
    return { root, win, num, fillR, fillG, crown, BW };
  }

  V.scene({
    kicker: "A WORKED RUN",
    title: ["Evolve a formula:", "find x² + x + 1"],
    dur: 17,
    caps: [
      [0.4, 4.2, "Four random programs. Lower error is better."],
      [4.8, 10.2, "Next generation: a copy, a mutant, two children."],
      [10.7, 17, "A few generations later: x² + x + 1."],
    ],
    build(stage) {
      const wrap = stage.appendChild(h("div", { style: abs(0, 0, 936, 640) }));

      // ---- left: tags and the plot ----
      const tagTarget = h("div", {
        class: "v-tag solid c-green",
        text: "target",
        style: { left: `${PX}px`, top: "6px" },
      });
      const tagBest = h("div", {
        class: "v-tag solid c-blue",
        text: "best: x + 1",
        style: { left: `${PX + 140}px`, top: "6px" },
      });
      wrap.append(tagTarget, tagBest);
      const pl = L.plot(wrap, {
        x: PX, y: PY, w: PW, h: PH, xmin: -1, xmax: 1, ymin: 0, ymax: 3.4, grid: true, xticks: [-1, 0, 1],
      }); // prettier-ignore
      let cur = F1;
      const gap = pl.gap((x) => cur(x), T, "red");
      const trails = KF.slice(0, 4).map((f) => pl.curve(f, "grey", 1, { w: 5 }));
      const target = pl.curve(T, "green", 1, { w: 5, dash: true });
      const best = pl.curve(F1, "blue", 1, { w: 8 });
      const pts = pl.points(L.POINTS, "green");

      // ---- right: counter ----
      const counter = h("div", {
        class: "v-tag c-grey",
        text: "generation 0",
        style: { left: `${COLX}px`, top: "6px", fontSize: "32px" },
      });
      wrap.append(counter);

      // ---- beat 1: generation 0 cards ----
      const g1 = wrap.appendChild(h("div", { style: abs(0, 0, 936, 640) }));
      const cards = GEN0.map(makeCard);
      cards.forEach((c) => g1.append(c.root));

      // ---- beat 2: select, mutate, cross over ----
      const g2 = wrap.appendChild(h("div", { style: abs(0, 0, 936, 640) }));
      const pillRow = h("div", {
        style: abs(COLX, 92, COLW, 52, "display:flex;justify-content:center;align-items:center;gap:12px"),
      });
      const pills = GEN0.map((P, i) =>
        h("div", {
          class: `v-tag solid ${i === 0 ? "c-green" : "c-blue"}`,
          text: P.formula,
          style: { position: "static", fontSize: "30px" },
        }),
      );
      pillRow.append(...pills);
      const arrow = h("div", { style: abs(COLX + COLW / 2 - 22, 148, 44, 44) }, L.arrow(44, "purple"));
      const rows = NEXT.map((N, i) => {
        const box = h("div", { class: `v-card c-${N.tn}`, style: abs(COLX, 206 + i * 86, COLW, 76) });
        const tag = h("div", {
          class: `v-tag solid c-${N.tn}`,
          text: N.label,
          style: { left: "14px", top: "13px", fontSize: "30px" },
        });
        const fm = h("div", {
          class: "v-text big",
          text: N.formula,
          style: abs(190, 16, null, null, "font-size:36px"),
        });
        const num = h("div", {
          class: "v-text big",
          text: "0.00",
          style: abs(COLW - 16 - 96, 16, 96, null, "text-align:right;font-size:36px;line-height:1.2"),
        });
        box.append(tag, fm, num);
        return { box, num };
      });
      g2.append(pillRow, arrow, ...rows.map((r) => r.box));

      // ---- beat 3: a few generations later ----
      const g3 = wrap.appendChild(h("div", { style: abs(0, 0, 936, 640) }));
      const ff = h("div", { style: abs(COLX + COLW / 2 - 44, 92, 88, 56) }, makeForward());
      const ffLab = h("div", {
        class: "v-text",
        text: "a few generations later...",
        style: abs(COLX, 164, COLW, null, "text-align:center;font-size:32px;color:var(--violet-ink)"),
      });
      const bigCard = h("div", { class: "v-card c-green", style: abs(COLX, 250, COLW, 250) });
      const bigFormula = h("div", {
        class: "v-text big",
        text: "x² + x + 1",
        style: abs(0, 40, COLW - 6, null, "text-align:center;font-size:72px;line-height:1.1;color:var(--teal-ink)"),
      });
      const errRow = h("div", { style: abs(0, 156, COLW - 6, 64) });
      const tickBox = h("div", { style: abs(52, 4, 56, 56) }, L.tick(56, "green"));
      const errLab = h("div", {
        class: "v-text",
        text: "error under 0.1",
        style: abs(124, 8, null, null, "font-size:38px;color:var(--teal-ink)"),
      });
      errRow.append(tickBox, errLab);
      bigCard.append(bigFormula, errRow);
      g3.append(ff, ffLab, bigCard);

      return (t) => {
        // ---- left ----
        const kPlot = ramp(t, 0.3, 0.8);
        place(pl.svg, { y: (1 - kPlot) * 24, o: kPlot });
        place(tagTarget, { s: 0.8 + 0.2 * pop(t, DOTS + 0.1, 0.5), o: fade(t, DOTS + 0.1) });
        pts.set({ k: ramp(t, DOTS, DOTS + 0.55, ease.lin) });
        target.set({ k: ramp(t, CURVE[0], CURVE[1], ease.inOut) });

        // the best program's curve: x + 1, then it wanders through generic curves to the target
        const seg = KF_AT.map((a) => ramp(t, a, a + KF_D, ease.inOut));
        const idx = seg.filter((k) => k >= 1).length; // finished moves
        const m = idx >= 4 ? 0 : seg[idx];
        const a = Math.min(idx, 3);
        const fa = KF[a];
        const fb = KF[a + 1];
        cur = idx >= 4 ? T : (x) => lerp(fa(x), fb(x), m);
        const done = ramp(t, KF_AT[3] + KF_D - 0.1, KF_AT[3] + KF_D + 0.2, ease.lin);
        best.set({ fn: cur, k: ramp(t, LINE[0], LINE[1], ease.inOut), tone: done >= 0.5 ? "green" : "blue" });
        gap.set({ k: ramp(t, GAP[0], GAP[1], ease.inOut), o: 1 - done });
        trails.forEach((tr, i) => tr.set({ k: 1, o: 0.4 * ramp(t, KF_AT[i] + 0.1, KF_AT[i] + 0.4, ease.lin) }));
        const label = t < FF + 0.3 ? "best: x + 1" : done >= 0.5 ? "best: x² + x + 1" : "best so far";
        text(tagBest, label);
        place(tagBest, {
          s: 0.85 + 0.15 * pop(t, LINE[0] - 0.1, 0.5) + 0.06 * V.flash(t, KF_AT[3] + KF_D, KF_AT[3] + KF_D + 0.5),
          o: fade(t, LINE[0] - 0.1),
        });

        // counter: generation 0 ... then "..."
        text(counter, t < OUT1[1] ? "generation 0" : "generation 1");
        place(counter, {
          s: 0.85 + 0.15 * pop(t, DEAL - 0.2, 0.5) + 0.08 * V.flash(t, OUT1[1], OUT1[1] + 0.4),
          o: fade(t, DEAL - 0.2) * (1 - ramp(t, OUT2[0], OUT2[1], ease.lin)),
        });

        // ---- beat 1 ----
        place(g1, { y: -10 * ramp(t, OUT1[0], OUT1[1], ease.in), o: 1 - ramp(t, OUT1[0], OUT1[1], ease.lin) });
        cards.forEach((c, i) => {
          const at = DEAL + [1, 3, 0, 2][i] * 0.28; // dealt in the shuffled order, top to bottom
          const slot = lerp(SLOT0[i], SLOT1[i], ramp(t, SORT[0], SORT[1], ease.inOut));
          const k = ramp(t, at, at + 0.35);
          place(c.root, {
            y: CY0 + slot * PITCH + (1 - k) * 22,
            s: 0.85 + 0.15 * pop(t, at, 0.5),
            o: fade(t, at, 0.2),
          });
          const e = GEN0[i].error * ramp(t, COUNT[0] + i * 0.1, COUNT[1], ease.out);
          text(c.num, e.toFixed(2));
          const wd = `${clamp(e / MAXERR) * c.BW}px`;
          c.fillR.style.width = wd;
          c.fillG.style.width = wd;
          const won = i === 0 && t >= CROWN;
          place(c.fillG, { o: won ? 1 : 0 });
          c.num.style.color = won ? "var(--teal-ink)" : "var(--rose-ink)";
          place(c.win, { o: i === 0 ? fade(t, CROWN, 0.15) : 0 });
          place(c.crown, {
            y: -4 * Math.sin(2 * Math.PI * 0.6 * (t - CROWN)) * (i === 0 ? 1 : 0),
            s: i === 0 ? pop(t, CROWN + 0.1, 0.5) : 0,
            o: i === 0 ? fade(t, CROWN + 0.1, 0.1) : 0,
          });
        });

        // ---- beat 2 ----
        place(g2, { o: 1 - ramp(t, OUT2[0], OUT2[1], ease.lin) });
        place(pillRow, { y: (1 - ramp(t, PILLS, PILLS + 0.4)) * 14, o: fade(t, PILLS, 0.3) });
        place(arrow, {
          y: (1 - ramp(t, ARROW, ARROW + 0.4)) * 14 + 4 * Math.sin(5 * (t - ARROW)) * fade(t, ARROW + 0.4, 0.1),
          o: fade(t, ARROW, 0.2),
        });
        // the arrow svg points right: turn it to point down
        arrow.firstChild.style.transform = "rotate(90deg)";
        rows.forEach((r, i) => {
          const at = ROWS + i;
          place(r.box, { y: (1 - ramp(t, at, at + 0.35)) * 16, s: 0.88 + 0.12 * pop(t, at, 0.5), o: fade(t, at, 0.2) });
          text(r.num, (NEXT[i].error * ramp(t, at + 0.3, at + 0.9, ease.out)).toFixed(2));
          r.num.style.color = i === 0 ? "var(--teal-ink)" : "var(--rose-ink)";
        });

        // ---- beat 3 ----
        place(g3, { o: 1 });
        place(ff, {
          x: 8 * Math.sin(4 * (t - FF)) * fade(t, FF, 0.2),
          s: 0.8 + 0.2 * pop(t, FF, 0.5),
          o: fade(t, FF, 0.15),
        });
        place(ffLab, { y: (1 - ramp(t, FF + 0.2, FF + 0.6)) * 12, o: fade(t, FF + 0.2, 0.25) });
        place(bigCard, { s: 0.85 + 0.15 * pop(t, BIG, 0.55), o: fade(t, BIG, 0.2) });
        place(tickBox, { s: pop(t, TICK, 0.5), o: fade(t, TICK, 0.1) });
        place(errLab, { y: (1 - ramp(t, TICK, TICK + 0.4)) * 8, o: fade(t, TICK, 0.2) });
      };
    },
  });
})();
