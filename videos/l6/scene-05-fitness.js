/* Lecture 6 · Genetic programming, scene 05-fitness.
   One big plot: the target x² + x + 1 as 11 green dots and a dotted curve. A candidate program (blue line) is run on many
   inputs: an orange "x" marker sweeps across, and at each of the 11 inputs a red bar shows how far the answer is from the target.
   The bars then fill in as a red area, and the error in the card on the right counts up with it (0.67 for x + 1).
   The line morphs into the second candidate, x² + 1, and its card fills up to 1.00. The smaller error wins a green crown.
   Every number is computed from the real trees and the real area (L.GEN0, L.area); nothing is typed in. */
(function () {
  const V = window.VID;
  const L = V.l6;
  const { h, s, place, ramp, ease, lerp, clamp, flash } = V;
  const pop = (t, a, d = 0.45) => ease.pop(ramp(t, a, a + d, ease.lin));
  const fade = (t, a, d = 0.2) => ramp(t, a, a + d, ease.lin);
  /** write an attribute or a style property only when its value changed */
  const put = (el, name, v) => String(v) !== el.getAttribute(name) && el.setAttribute(name, v);
  const text = (el, v) => el.textContent !== v && (el.textContent = v);

  // ---------- the data: two candidates from the lecture's generation 0, checked against the real algorithm ----------
  const [P1, P2] = L.GEN0;
  const T = L.TARGET;
  const F1 = L.fn(P1.tree);
  const F2 = L.fn(P2.tree);
  const XS = L.POINTS.map(([x]) => x); // the 11 inputs, -1 to +1
  if (
    XS.length !== 11 ||
    P1.formula !== "x + 1" ||
    P2.formula !== "x² + 1" ||
    P1.error.toFixed(2) !== "0.67" ||
    P2.error.toFixed(2) !== "1.00"
  )
    throw new Error("scene 05: the candidates or their errors changed, check the lecture data");
  const area = (f, x) => L.area(f, T, -1, x, 240); // error collected from the left edge up to x
  const MAXERR = 2; // a full error meter

  // ---------- layout (stage px, 936 x 640) ----------
  const M = 12; // margin kept free inside the stage
  const PW = 508; // the big plot
  const PH = 538;
  const PY = 80;
  const YMAX = 3.6; // head room for the marker
  const START_X = (936 - PW) / 2 - M; // the plot starts centred and slides left when the cards arrive
  const CW = 384; // the two cards, on the right
  const CX = 936 - M - CW;
  const CH = (PH - 24) / 2;
  const CARD_Y = [PY, PY + CH + 24];
  const abs = (x, y, w, ht, more = "") =>
    `position:absolute;left:${x}px;top:${y}px;width:${w}px;${ht == null ? "" : `height:${ht}px;`}${more}`;

  // ---------- timeline (local seconds) ----------
  const SWEEP = [2.3, 4.1]; // the marker runs across
  const SLIDE = [4.4, 5.0];
  const CARD1 = 5.0;
  const AREA1 = [5.1, 6.2]; // the red area fills in, the error counts up
  const THUMB1 = 6.25;
  const MORPH = [6.45, 7.1];
  const CARD2 = 6.65;
  const AREA2 = [7.35, 8.1];
  const THUMB2 = 8.15;
  const WIN = 8.55;
  const arrive = (i) => lerp(SWEEP[0], SWEEP[1], i / (XS.length - 1));

  // ---------- small pieces ----------
  const circle = (g, cls, r, w = 3) =>
    g.appendChild(s("circle", { r, "stroke-width": w, class: cls, style: "fill:var(--c);stroke:var(--c-lip)" }));
  /** the green crown sticker that marks the fitter program */
  function makeCrown() {
    const svg = s("svg", {
      width: 68,
      height: 74,
      viewBox: "0 0 68 74",
      style: "position:absolute;left:0;top:0;overflow:visible",
    });
    const on = "fill:var(--teal-on);stroke:var(--teal-on);stroke-linejoin:round;stroke-linecap:round";
    svg.append(
      s("circle", { cx: 34, cy: 40, r: 30, style: "fill:var(--teal-lip)" }),
      s("circle", { cx: 34, cy: 34, r: 30, "stroke-width": 4, style: "fill:var(--teal);stroke:var(--teal-lip)" }),
      s("path", { d: "M18 44L16 24L26 32L34 18L42 32L52 24L50 44Z", "stroke-width": 4, style: on }),
      s("path", { d: "M19 50H49", "stroke-width": 5, style: on }),
    );
    return h("div", { style: abs(CW - 96, -58, 68, 74) }, svg);
  }

  // ---------- a result card: program tag, error number, error meter, tiny plot ----------
  function makeCard(y, P, F, crowned) {
    const TW = CW - 32;
    const root = h("div", { style: abs(CX, y, CW, CH) });
    const base = h("div", { class: "v-card plain", style: abs(0, 0, CW, CH) });
    const win = h("div", { class: "v-card c-green", style: abs(0, 0, CW, CH) });
    const tag = h("div", { class: "v-tag solid c-blue", text: P.formula, style: { left: "16px", top: "14px" } });
    const err = h("div", {
      class: "v-text dim",
      text: "error",
      style: abs(CW - 16 - 112 - 92, 20, 92, null, "text-align:right"),
    });
    const num = h("div", {
      class: "v-text big",
      text: "0.00",
      style: abs(CW - 16 - 112, 12, 112, null, "text-align:right;font-size:48px;line-height:1.1"),
    });
    const track = h("div", { style: abs(16, 76, TW, 16, "border-radius:8px;background:var(--line)") });
    const fillStyle = "position:absolute;left:0;top:0;height:100%;width:0;border-radius:8px;";
    const fillR = track.appendChild(h("div", { style: `${fillStyle}background:var(--rose)` }));
    const fillG = track.appendChild(h("div", { style: `${fillStyle}background:var(--teal)` }));
    // the tiny plot: the result of the run, kept as a snapshot
    const slot = "box-sizing:border-box;border-radius:18px;border:3px";
    const ghost = h("div", { style: abs(16, 102, TW, 140, `${slot} dashed var(--line-2)`) });
    const box = h("div", { style: abs(16, 102, TW, 140, `${slot} solid var(--line-2);background:var(--panel)`) });
    const th = L.plot(box, { x: 0, y: 0, w: TW - 6, h: 134, xmin: -1, xmax: 1, ymin: 0, ymax: 3.3, frame: false });
    th.gap(F, T, "red");
    th.curve(T, "green", 1, { w: 4, dash: true });
    th.curve(F, "blue", 1, { w: 6 });
    XS.forEach((x) => {
      const [cx, cy] = th.toPx(x, T(x));
      const dot = circle(th.svg, "c-green", 5, 2.5);
      dot.setAttribute("cx", cx.toFixed(1));
      dot.setAttribute("cy", cy.toFixed(1));
    });
    const crown = crowned ? makeCrown() : null;
    root.append(base, win, tag, err, num, track, ghost, box);
    if (crown) root.append(crown);
    return {
      root,
      /** at: when the card appears, v: the error to show, thumb: when the snapshot pops in, w: 0..1 winner, dim: 0..1 loser */
      apply(t, { at, v, hot, thumb, w, dim }) {
        const k = ramp(t, at, at + 0.35);
        place(root, {
          y: (1 - k) * 22,
          s: 0.85 + 0.15 * pop(t, at, 0.5) + 0.03 * flash(t, WIN, WIN + 0.5) * (crowned ? 1 : 0),
          o: fade(t, at, 0.2) * (1 - 0.35 * dim),
        });
        text(num, v.toFixed(2));
        const red = `color-mix(in srgb, var(--rose-ink) ${Math.round(hot * 100)}%, var(--text-dim))`;
        num.style.color = `color-mix(in srgb, var(--teal-ink) ${Math.round(w * 100)}%, ${red})`;
        const wd = `${clamp(v / MAXERR) * TW}px`;
        fillR.style.width = wd;
        fillG.style.width = wd;
        place(fillG, { o: w });
        place(win, { o: w });
        place(box, { s: 0.85 + 0.15 * pop(t, thumb, 0.4), o: fade(t, thumb, 0.15) });
        place(ghost, { o: 1 - fade(t, thumb, 0.15) });
        if (crown)
          place(crown, {
            y: -4 * Math.sin(2 * Math.PI * 0.6 * (t - WIN)) * w,
            s: pop(t, WIN + 0.1, 0.5),
            o: fade(t, WIN + 0.1, 0.1),
          });
      },
    };
  }

  V.scene({
    kicker: "FITNESS",
    title: ["Fitness: run the program", "and add up the errors"],
    dur: 11,
    caps: [
      [0.4, 4, "Run the program on many inputs."],
      [4.5, 7.5, "Error = how far its answers are from the target."],
      [8, 10.5, "Smaller error is fitter."],
    ],
    build(stage) {
      const wrap = stage.appendChild(h("div", { style: abs(0, 0, 936, 640) }));

      // legend: what the green dots and the blue line are
      const tagTarget = h("div", {
        class: "v-tag solid c-green",
        text: "target",
        style: { left: `${M}px`, top: `${M}px` },
      });
      const progTags = [P1, P2].map((P) =>
        h("div", {
          class: "v-tag solid c-blue",
          text: `program: ${P.formula}`,
          style: { left: `${M + 140}px`, top: `${M}px` },
        }),
      );
      wrap.append(tagTarget, ...progTags);

      // the plot and its curves; the grid is light and the data sit on top of it
      const pl = L.plot(wrap, {
        x: M, y: PY, w: PW, h: PH, xmin: -1, xmax: 1, ymin: 0, ymax: YMAX,
        grid: true, xticks: [-1, 0, 1], yticks: [1, 2, 3],
      }); // prettier-ignore
      const gap1 = pl.gap(F1, T, "red");
      const gap2 = pl.gap(F2, T, "red");
      const target = pl.curve(T, "green", 1, { w: 5, dash: true });
      const line = pl.curve(F1, "blue", 1, { w: 8 });

      // the overlay in plot coordinates: marker, error bars, dots
      const ov = wrap.appendChild(
        s("svg", {
          width: 936,
          height: 640,
          viewBox: "0 0 936 640",
          style: "position:absolute;left:0;top:0;overflow:visible",
        }),
      );
      const px = XS.map((x) => pl.toPx(x, 0)[0]);
      const yTarget = XS.map((x) => pl.toPx(x, T(x))[1]);
      const yAxis = pl.toPx(0, 0)[1];
      const yTop = pl.area.y + 4;
      const HANDLE_Y = yTop + 20;
      const mLine = ov.appendChild(
        s("path", {
          "stroke-width": 4,
          "stroke-dasharray": "10 9",
          style: "fill:none;stroke:var(--amber);stroke-linecap:round",
        }),
      );
      const bars = XS.map(() =>
        ov.appendChild(s("path", { "stroke-width": 7, style: "fill:none;stroke:var(--rose);stroke-linecap:round" })),
      );
      const tDots = XS.map((x, i) => {
        const d = circle(ov, "c-green", 10);
        d.setAttribute("cx", px[i].toFixed(1));
        d.setAttribute("cy", yTarget[i].toFixed(1));
        return d;
      });
      const cDots = XS.map((x, i) => {
        const d = circle(ov, "c-blue", 9);
        d.setAttribute("cx", px[i].toFixed(1));
        return d;
      });
      // the marker handle: a round orange "x" riding on the dashed line
      const handleG = s("g");
      handleG.append(
        s("circle", { cx: 0, cy: HANDLE_Y + 4, r: 19, style: "fill:var(--amber-lip)" }),
        s("circle", {
          cx: 0,
          cy: HANDLE_Y,
          r: 19,
          "stroke-width": 3,
          style: "fill:var(--amber);stroke:var(--amber-lip)",
        }),
      );
      const hx = s("text", {
        x: 0,
        y: HANDLE_Y + 9,
        "text-anchor": "middle",
        style: "fill:var(--amber-on);font-size:28px;font-weight:900",
      });
      hx.textContent = "x";
      handleG.append(hx);
      ov.append(handleG);

      const c1 = makeCard(CARD_Y[0], P1, F1, true);
      const c2 = makeCard(CARD_Y[1], P2, F2, false);
      stage.append(c1.root, c2.root);

      return (t) => {
        // the plot starts centred, slides left for the cards, and dims when the winner is picked
        const dim = ramp(t, WIN, WIN + 0.35, ease.inOut);
        place(wrap, { x: lerp(START_X, 0, ramp(t, SLIDE[0], SLIDE[1], ease.inOut)), o: lerp(1, 0.5, dim) });
        const kPlot = ramp(t, 0.3, 0.8);
        place(pl.svg, { y: (1 - kPlot) * 24, o: kPlot });

        // legend
        place(tagTarget, { s: 0.8 + 0.2 * pop(t, 0.85, 0.5), o: fade(t, 0.85) });
        const pulse = Math.max(...XS.map((x, i) => flash(t, arrive(i) - 0.05, arrive(i) + 0.12)));
        const swap = ramp(t, MORPH[0], MORPH[0] + 0.12, ease.lin);
        place(progTags[0], { s: (0.8 + 0.2 * pop(t, 1.55, 0.5)) * (1 + 0.07 * pulse), o: fade(t, 1.55) * (1 - swap) });
        place(progTags[1], { s: 0.8 + 0.2 * pop(t, MORPH[0] + 0.12, 0.5), o: fade(t, MORPH[0] + 0.12, 0.12) });

        // target: 11 dots pop in, then the dotted curve is drawn through them
        target.set({ k: ramp(t, 1.0, 1.7, ease.inOut), o: 1 });
        tDots.forEach((d, i) => place(d, { s: pop(t, 0.65 + i * 0.05, 0.4), o: fade(t, 0.65 + i * 0.05, 0.08) }));

        // the program: the blue line, morphing from candidate 1 to candidate 2
        const m = ramp(t, MORPH[0], MORPH[1], ease.inOut);
        const g = (x) => lerp(F1(x), F2(x), m);
        line.set({ fn: g, k: ramp(t, 1.65, 2.3, ease.inOut) });

        // the marker sweeps across the 11 inputs; at each one the answer dot lands and the red error bar grows
        const run = ramp(t, SWEEP[0], SWEEP[1], ease.lin);
        const mx = lerp(px[0], px[px.length - 1], run);
        const mo = fade(t, SWEEP[0] - 0.2, 0.2) * (1 - ramp(t, SWEEP[1] + 0.05, SWEEP[1] + 0.35, ease.lin));
        put(mLine, "d", `M${mx.toFixed(1)} ${HANDLE_Y + 18}V${yAxis.toFixed(1)}`);
        place(mLine, { o: mo });
        place(handleG, { x: mx, s: 0.8 + 0.2 * pop(t, SWEEP[0] - 0.2, 0.4), o: mo });
        XS.forEach((x, i) => {
          const yc = pl.toPx(x, g(x))[1];
          const grow = ramp(t, arrive(i) + 0.04, arrive(i) + 0.3, ease.out);
          put(cDots[i], "cy", yc.toFixed(1));
          place(cDots[i], { s: pop(t, arrive(i) - 0.04, 0.35), o: fade(t, arrive(i) - 0.04, 0.06) });
          put(bars[i], "stroke-width", (7 + 4 * flash(t, 4.5, 5.1)).toFixed(1));
          put(bars[i], "d", `M${px[i].toFixed(1)} ${yc.toFixed(1)}V${lerp(yc, yTarget[i], grow).toFixed(1)}`);
          place(bars[i], { o: grow > 0.02 && Math.abs(yc - yTarget[i]) > 3 ? 1 : 0 });
        });

        // the red area between the curves fills in left to right; the error is the area collected so far
        const k1 = ramp(t, AREA1[0], AREA1[1], ease.inOut);
        const k2 = ramp(t, AREA2[0], AREA2[1], ease.inOut);
        gap1.set({ k: k1, o: 1 - ramp(t, MORPH[0] - 0.05, MORPH[0] + 0.25, ease.lin) });
        gap2.set({ k: k2, o: 1 });
        const e1 = k1 >= 1 ? P1.error : area(F1, -1 + 2 * k1);
        const e2 = k2 >= 1 ? P2.error : area(F2, -1 + 2 * k2);
        c1.apply(t, { at: CARD1, v: e1, hot: fade(t, AREA1[0], 0.2), thumb: THUMB1, w: dim, dim: 0 });
        c2.apply(t, { at: CARD2, v: e2, hot: fade(t, AREA2[0], 0.2), thumb: THUMB2, w: 0, dim });
      };
    },
  });
})();
