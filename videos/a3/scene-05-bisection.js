/* Algorithms Phase 3 · scene 05-bisection: a slope that flips traps the minimum.
   f(x) = e^x - 2x on [0, 1]: the slope is falling at a = 0 and rising at b = 1, so a minimum is trapped between them. Test the middle m:
   falling -> a moves up to m, rising -> b moves down to m. Four halvings (A3.bisect(4): m 0.5, 0.75, 0.625, 0.6875) leave the bracket
   [0.6875, 0.75], which still holds ln 2 = 0.6931.
   Every frame is a pure function of t: the three "ends" (a, b and the middle m) are drawn from the round (k) and the time inside it (u).
   The invariant (slope falling at a, rising at b) is asserted for every bracket when the scene is built. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const { ramp, lerp, clamp, flash, ease: E } = V;
  const { f, df, min: XMIN } = A3.EXP;
  const lin = E.lin;
  const { rows } = A3.bisect(4);

  // ---------- the real algorithm, checked ----------
  const bracket = [[0, 1], ...rows.map((r) => [r.wa, r.wb])]; // bracket[k] = the ends after k halvings
  bracket.forEach(([a, b], k) => {
    A3.need(df(a) < 0 && df(b) > 0, `scene 05: bracket ${k} no longer traps a minimum`);
    A3.need(a < XMIN && XMIN < b, `scene 05: bracket ${k} lost ln 2`);
  });
  rows.forEach((r, k) => {
    const [a, b] = bracket[k];
    A3.need(r.m === (a + b) / 2 && r.slope === df(r.m), `scene 05: round ${r.k} is not the midpoint`);
    A3.need(
      r.falling === r.slope < 0 && r.keep === (r.falling ? "a" : "b"),
      `scene 05: round ${r.k} moved the wrong end`,
    );
    A3.need(r.width === (b - a) / 2, `scene 05: round ${r.k} did not halve the bracket`);
    A3.need(r.cut[0] === (r.falling ? a : r.m) && r.cut[1] === (r.falling ? r.m : b), `scene 05: round ${r.k} cut`);
  });
  A3.need(rows.map((r) => r.width).join() === "0.5,0.25,0.125,0.0625", "scene 05: widths");

  // ---------- timing (local seconds) ----------
  const T0 = 3.4; // the four halvings start here, one every ROUND seconds
  const ROUND = 1.7;
  const CUT = 0.8; // the thrown-away half tints red and the old end fades
  const HAND = 1.1; // m takes over the role of the end that was cut
  const TAG_W = 150; // a "falling" / "rising" tag is about this wide
  const TAG_GAP = 240; // the two end tags keep this far apart (centre to centre) once the bracket is narrow
  const WHAT = ["falling", "rising"]; // the end a falls, the end b rises

  V.scene({
    kicker: "BRACKETING",
    title: ["A slope that flips", "traps the minimum"],
    dur: 12,
    caps: [
      [0.4, 3.4, "Falling left, rising right: a minimum is trapped."],
      [3.6, 6.4, "Test the middle: is the slope still falling?"],
      [6.6, 9.8, "Keep the half where the slope flips."],
      [10.0, 11.6, "Each step halves the bracket."],
    ],
    build(stage) {
      const P = A3.plot(stage, {
        x: 0,
        y: 0,
        w: 936,
        h: 560,
        view: [-0.2, 1.4, 0.45, 1.34],
        axes: "bottom",
        xticks: [0, 0.5, 1],
        grid: true,
        labels: false,
        pad: { l: 24, r: 24, t: 24, b: 80 },
      });
      const curve = P.curve(f, { x0: -0.2, x1: 1.4 });
      const band = P.band({ tone: "red" });
      const span = P.span({ tone: "purple" });
      const stat = A3.stat(P.html, { x: 358, y: 24, w: 220, label: "bracket width" });
      // one set of handles per end (a, b) and one for the middle m
      const part = (tone) => ({
        guide: P.vline({}),
        dot: P.dot({ tone, r: 14 }),
        tan: P.tangent({ tone: "purple", len: 140 }),
        tag: A3.tag(P.html, { x: 0, y: 0, anchor: "c", tone: "purple" }),
        letter: P.text({ tone }),
      });
      const ends = [part("blue"), part("blue")];
      const mid = part("orange");
      const star = A3.star(P.over, { size: 52 });
      const y0 = P.cur.y0;

      // draw one end: everything the viewer sees of a point x (dot, guide, tangent, tag, letter), faded by o
      const showPart = (h, d) => {
        const { x, o, k, s, text, letter, tagPos, tagO, len, tone, lo } = d;
        h.guide.set({ x, y0, y1: f(x), k, o });
        h.dot.set({ x, y: f(x), s: s * E.pop(k), o: Math.min(o, k * 4), tone });
        h.tan.set({ x, y: f(x), m: df(x), k: d.kT, o, len });
        h.tag.set({ text, dx: tagPos[0], dy: tagPos[1], s: 0.8 + 0.2 * E.pop(d.kT), o: Math.min(tagO, d.kT * 4) });
        h.letter.set({ text: letter, x, y: y0, dy: -16, o: lo * k, tone });
      };

      return (t) => {
        // which halving are we in (0 = the set-up), and how far into it
        const rd = t < T0 ? 0 : Math.min(4, Math.floor((t - T0) / ROUND) + 1);
        const u = rd ? t - (T0 + ROUND * (rd - 1)) : 0;
        const row = rd ? rows[rd - 1] : null;
        const pre = bracket[rd ? rd - 1 : 0];
        const post = bracket[rd];
        const glide = rd ? ramp(u, 1.05, 1.45, E.inOut) : 0;
        const xd = [lerp(pre[0], post[0], glide), lerp(pre[1], post[1], glide)]; // the bracket as drawn (the span glides)
        const sepPx = P.px(xd[1]) - P.px(xd[0]);
        const len = clamp(sepPx, 56, 140); // tangents get shorter as the bracket closes
        const shift = Math.max(0, (TAG_GAP - sepPx) / 2); // end tags step outwards when the ends crowd

        // ---------- the card and the curve ----------
        P.set({ o: ramp(t, 0, 0.5, lin) });
        curve.set({ k: ramp(t, 0.1, 1.1, lin), fillO: ramp(t, 0.8, 1.2, lin) });

        // ---------- the thrown-away half ----------
        band.set({
          x0: row ? row.cut[0] : 0,
          x1: row ? row.cut[1] : 0,
          o: row ? ramp(u, CUT, HAND) * (1 - ramp(u, 1.45, 1.7)) : 0,
        });

        // ---------- the two ends ----------
        ends.forEach((h, i) => {
          const role = i ? "b" : "a";
          const moving = !!row && row.keep === role; // this end is the one that gets cut away
          const after = moving && u >= HAND; // m has taken over
          const cutF = moving && !after ? ramp(u, CUT, HAND, lin) : 0;
          const x = after ? row.m : pre[i];
          const k = rd ? 1 : ramp(t, 1.2 + 0.4 * i, 1.6 + 0.4 * i, lin); // dot, guide, letter appear
          const kT = rd ? 1 : ramp(t, 2.0 + 0.6 * i, 2.4 + 0.6 * i, lin); // tangent and tag appear
          const cxEnd = clamp(
            i ? P.px(xd[1]) + shift : P.px(xd[0]) - shift,
            P.area.x + TAG_W / 2,
            P.area.x + P.area.w - TAG_W / 2,
          );
          const topEnd = P.py(f(xd[i])) - 84;
          // the tag of an end that m has just replaced starts where m's tag was and slides to its place
          const gT = after ? ramp(u, HAND, HAND + 0.4, E.inOut) : 1;
          const tagPos = after
            ? [lerp(P.px(row.m), cxEnd, gT), lerp(P.py(f(row.m)) - 140, topEnd, gT)]
            : [cxEnd, topEnd];
          showPart(h, {
            x,
            o: 1 - cutF,
            k,
            kT,
            s: (1 - 0.4 * cutF) * (after ? 1 + 0.3 * (1 - ramp(u, HAND, HAND + 0.3)) : 1),
            text: WHAT[i],
            letter: role,
            tagPos,
            tagO: 1 - cutF,
            len,
            tone: "blue",
            lo: after ? ramp(u, 1.45, 1.7, lin) : 1 - cutF,
          });
        });

        // ---------- the middle: probe, test, hand over ----------
        const kM = row && u < HAND ? ramp(u, 0, 0.35, lin) : 0;
        const kMT = row && u < HAND ? ramp(u, 0.3, 0.8) : 0;
        const mx = row ? row.m : 0.5;
        showPart(mid, {
          x: mx,
          o: row && u < HAND ? 1 : 0,
          k: kM,
          kT: kMT,
          s: 1,
          text: row && row.falling ? WHAT[0] : WHAT[1],
          letter: "m",
          tagPos: [P.px(mx), P.py(f(mx)) - 140],
          tagO: row && u < HAND ? 1 : 0,
          len,
          tone: "orange",
          lo: row ? 1 - ramp(u, HAND, 1.4) : 0,
        });

        // ---------- the bracket bar and its width ----------
        const drawK = ramp(t, 2.8, 3.3, E.out);
        span.set({ x0: xd[0], x1: rd ? xd[1] : lerp(xd[0], xd[1], drawK), o: ramp(t, 2.8, 3.0, lin) });
        const kS = ramp(t, 2.8, 3.2, lin);
        stat.set({
          text: A3.fmt(xd[1] - xd[0], 4),
          s: 0.8 + 0.2 * E.pop(kS),
          o: Math.min(1, kS * 4),
          bump: row ? flash(u, 1.25, 1.6) : 0,
        });

        // ---------- the minimum, found at last ----------
        const kStar = ramp(t, 10.2, 10.7, lin);
        star.set({ x: P.px(XMIN), y: P.py(f(XMIN)) - 58, s: E.pop(kStar), o: Math.min(1, kStar * 4) });
      };
    },
  });
})();
