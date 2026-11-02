/* Lecture 11 video, scene 3: not too close, not too far. Lesson 11.1 ('Pull in, push out'): two animals and the gap between
   them in body lengths. Below 2.5 lengths repulsion wins (red arrows push them apart), above 3.5 attraction wins (green arrows
   pull them together), in between the two urges cancel and the pair holds steady. 'Let go' moves the gap a quarter of the way
   to 3 each step (L11.BAL.settle, asserted in common.js); the arrows come from L11.BAL.mode(d), never hard-coded.
   Story (local s): 0.2-0.8 ruler and bands, 0.5-1.0 the birds at 1 length, 1.0-1.6 red arrows and a shake, 1.8-3.55 let go
   from 1 (steady from about 2.6 s), 3.55-4.05 the grey bird slides out to 6, 4.05-4.5 green arrows, 4.7-7.1 let go from 6
   (steady from about 5.8 s), 7.3-10 hold at 3.0 with the 'just right' band pulsing once. */
VID.scene({
  kicker: "PULL IN, PUSH OUT",
  title: ["Not too close,", "not too far"],
  dur: 10,
  caps: [
    [0.5, 3.2, "Too close: the two birds push apart."],
    [3.6, 6.2, "Too far: they pull together."],
    [6.5, 9.6, "In between, the two urges cancel out."],
  ],
  build(stage, V) {
    const L11 = V.l11;
    const L5 = V.l5;
    const { ramp, flash, clamp, lerp, ease: E } = V;

    // ---- data (lesson 11.1, asserted in common.js and re-checked here)
    const BAL = L11.BAL;
    L11.same([1, 3, 6].map(BAL.mode), ["push", "steady", "pull"], "scene 3: modes at 1, 3 and 6 lengths");
    const A = BAL.settle(1);
    const B = BAL.settle(6);
    L11.same([A.length, A[0], B.length, B[0]], [14, 1, 16, 6], "scene 3: 'Let go' from 1 and from 6");
    L11.same(Math.abs(A[A.length - 1] - 3) < 0.05, true, "scene 3: from 1 the gap settles near 3");
    L11.same(B[B.length - 1].toFixed(2), "3.04", "scene 3: from 6 the gap settles at 3.04");
    L11.same(B[B.length - 1].toFixed(1), "3.0", "scene 3: the settled gap as shown");

    // ---- timeline
    const STEP = 0.16;
    const TA = 1.8; // let go from 1
    const SLIDE = [3.55, 4.05]; // the grey bird slides out to 6
    const TB = 4.7; // let go from 6
    const follow = (seq, t0, t) => {
      const u = clamp((t - t0) / STEP, 0, seq.length - 1);
      const i = Math.min(Math.floor(u), seq.length - 2);
      return lerp(seq[i], seq[i + 1], u - i);
    };
    // the moment a sequence crosses a gap value (linear between steps), so tags pop exactly when the mode changes
    const crossAt = (seq, t0, gap) => {
      const i = seq.findIndex((d, j) => j > 0 && (seq[j - 1] - gap) * (d - gap) <= 0);
      return t0 + STEP * (i - 1 + (gap - seq[i - 1]) / (seq[i] - seq[i - 1]));
    };
    const TS1 = crossAt(A, TA, BAL.push);
    const TS2 = crossAt(B, TB, BAL.pull);
    L11.same([TS1 > 2.4 && TS1 < 2.7, TS2 > 5.6 && TS2 < 6.0], [true, true], "scene 3: steady before its caption");
    const dAt = (t) => {
      if (t < TA) return A[0];
      if (t < SLIDE[0]) return follow(A, TA, t);
      if (t < TB) return lerp(follow(A, TA, SLIDE[0]), B[0], E.inOut(ramp(t, SLIDE[0], SLIDE[1], E.lin)));
      return follow(B, TB, t);
    };

    // ---- layout: ruler of body lengths (1 length = 96 px, 0 at x 84), bands, labels, numbers
    const U = 96;
    const X0 = 84;
    const DY = 70; // the whole figure sits a little lower, centred in the stage
    const BY = 260 + DY; // birds' centre line
    const X = (d) => X0 + U * d;
    const svg = L5.svg(stage);
    const ruler = svg.appendChild(V.s("g", {}));
    const band = (a, b, fill, op) =>
      ruler.appendChild(
        V.s("rect", { x: X(a), y: 330 + DY, width: U * (b - a), height: 22, style: { fill, opacity: String(op) } }),
      );
    band(0, 2.5, L11.tone("red").c, 0.35);
    const mid = band(2.5, 3.5, "var(--panel-2)", 1);
    band(3.5, 8, L11.tone("green").c, 0.35);
    const midRing = ruler.appendChild(
      V.s("rect", { x: X(2.5), y: 330 + DY, width: U, height: 22, rx: 4, fill: "none", "stroke-width": 4 }),
    );
    midRing.style.stroke = L11.tone("grey").c;
    mid.setAttribute("stroke", "var(--line-2)");
    mid.setAttribute("stroke-width", "2");
    for (let i = 0; i <= 8; i++) {
      const tk = ruler.appendChild(V.s("line", { x1: X(i), x2: X(i), y1: 322 + DY, y2: 360 + DY, "stroke-width": 3 }));
      tk.style.stroke = "var(--line-2)";
    }
    const bandLabs = [
      L11.label(stage, { x: X(0), y: 366 + DY, w: U * 2.5, text: "too close", tone: "red" }),
      L11.label(stage, { x: X(3) - 90, y: 366 + DY, w: 180, text: "just right", tone: "grey" }),
      L11.label(stage, { x: X(3.5), y: 366 + DY, w: U * 4.5, text: "too far", tone: "green" }),
    ];
    const nums = Array.from({ length: 9 }, (_, i) =>
      L11.label(stage, { x: X(i) - 30, y: 410 + DY, w: 60, text: String(i), tone: "grey" }),
    );
    const unit = L11.label(stage, {
      x: X(0) - 60,
      y: 456 + DY,
      w: U * 8 + 120,
      text: "gap in body lengths",
      tone: "grey",
    });

    // dashed drop lines from each bird's centre to the ruler: the gap is measured centre to centre
    const drops = [0, 1].map(() => {
      const ln = svg.appendChild(
        V.s("line", { y1: BY + 34, y2: 328 + DY, "stroke-width": 3, "stroke-dasharray": "6 6" }),
      );
      ln.style.stroke = "var(--line-2)";
      return ln;
    });
    // the urges (drawn under the birds), the two birds, the tags
    const arrows = [0, 1].map(() => L11.vec(svg, { tone: "red", w: 9, head: 24 }));
    const left = L11.dart(svg, { size: 84, tone: "purple" });
    const right = L11.dart(svg, { size: 84, tone: "grey" });
    const gapTag = L11.tag(stage, { x: 0, y: 110 + DY, text: "1.0 lengths", tone: "grey" });
    const rep = L11.tag(stage, { x: 24, y: 24 + DY, text: "repulsion", tone: "red" });
    const att = L11.tag(stage, { x: 24, y: 24 + DY, text: "attraction", tone: "green" });
    const steady = L11.tag(stage, { x: 0, y: 24 + DY, text: "steady", tone: "grey", solid: true });

    const AY = BY - 66; // the urge arrows run just above the birds
    const ALEN = 90;
    return (t) => {
      const d = dAt(t);
      const mode = BAL.mode(d);
      const shake = 3 * Math.sin(t * 40) * flash(t, 1.0, 1.6);
      const xl = X0 - shake;
      const xr = X(d) + shake;
      const kb = ramp(t, 0.5, 1.0);
      left.set({ x: xl, y: BY, r: 0, s: E.pop(kb), o: Math.min(1, kb * 4) });
      right.set({ x: xr, y: BY, r: 180, s: E.pop(kb), o: Math.min(1, kb * 4) });

      [xl, xr].forEach((x, i) => {
        drops[i].setAttribute("x1", x.toFixed(1));
        drops[i].setAttribute("x2", x.toFixed(1));
        drops[i].style.opacity = String(kb);
      });
      // ruler, bands and labels
      const kr = ramp(t, 0.2, 0.8);
      ruler.style.opacity = String(kr);
      midRing.style.opacity = String(flash(t, 7.4, 8.2));
      bandLabs.forEach((l) => l.set({ k: kr }));
      nums.forEach((l) => l.set({ k: kr }));
      unit.set({ k: kr });

      // urge arrows: red outwards while pushing, green inwards while pulling, shorter near the steady band
      const push = mode === "push";
      const pull = mode === "pull" && t >= SLIDE[1];
      const kArrow = push ? ramp(t, 1.0, 1.6) : pull ? ramp(t, 4.05, 4.5) : 0;
      const strength = push ? clamp((BAL.push - d) / 1.5) : clamp((d - BAL.pull) / 2.5);
      const len = ALEN * (0.35 + 0.65 * strength);
      const tone = push ? "red" : "green";
      const ends = push
        ? [
            [xl + 36, xl + 36 - len],
            [xr - 36, xr - 36 + len],
          ]
        : [
            [xl, xl + len],
            [xr, xr - len],
          ];
      arrows.forEach((a, i) => a.set({ x1: ends[i][0], y1: AY, x2: ends[i][1], y2: AY, k: kArrow, tone }));

      // tags: the gap above it, the urge in the corner, 'steady' over the gap
      gapTag.set({
        text: `${d.toFixed(1)} lengths`,
        k: ramp(t, 0.7, 1.1),
        x: (xl + xr) / 2 - gapTag.el.offsetWidth / 2,
      });
      rep.set({ k: push ? ramp(t, 1.0, 1.4) : 0 });
      att.set({ k: pull ? ramp(t, 4.05, 4.45) : 0 });
      const ks =
        mode !== "steady"
          ? 0
          : t < SLIDE[0] + 0.5
            ? ramp(t, TS1, TS1 + 0.4) * (1 - ramp(t, SLIDE[0], SLIDE[0] + 0.2))
            : ramp(t, TS2, TS2 + 0.4);
      steady.set({ k: ks, x: (xl + xr) / 2 - steady.el.offsetWidth / 2 });
    };
  },
});
