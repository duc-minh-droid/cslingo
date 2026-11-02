/* Lecture 9 (ds-9) · scene 10 (HOW FAST TO ADAPT): the learning rate sets how fast an online model adapts (lesson 9.3). TOP:
   two online models read the same roadworks stream (80 records, 4 -> 6 min per km from record 40); rate 0.02 catches up in 2
   records, rate 0.004 needs 23. BOTTOM: the fast learner also trusts a bad record (record 20: 2 km logged as 90 min) and its
   weight jumps to 10.59 at once, then takes 5 records to come back. Every trace and number comes from D9.ADAPT and D9.GLITCH.
   Colours: blue = the fast model (rate 0.02), grey = the slow model (rate 0.004), green dashed = the real minutes per km,
   red = the roadworks mark, the bad record and the jump.
   Story (local seconds): 0.2 top plot; 0.5 truth; 0.8-3.6 both traces draw on, 2.2 the roadworks mark at record 40; 4.0 "caught
   up in 2" and "needs 23"; 6.6 bottom plot; 7.0-9.4 the fast trace draws on, 8.2 the bad record at 20, 8.4 the jump to 10.59;
   9.6 "back after 5 records". Hold to 13. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D9 = V.d9;
  const { ramp, flash, ease: E } = V;
  const A = D9.ADAPT;
  const G = D9.GLITCH;
  const fm = D9.fm;
  const [slow, quick] = A.runs;
  D9.same(
    "adapt scene: rates 0.004 and 0.02; catch up in 23 and 2; the change at record 40; the bad record at 20 jumps to 10.59",
    [slow.eta, quick.eta, slow.catch, quick.catch, A.at, G.at + 1, +G.jump.toFixed(2), G.back],
    [0.004, 0.02, 23, 2, 40, 20, 10.59, 5],
  );
  const trace = (ws) => [[0, 4], ...ws.map((w, i) => [i + 1, w])];
  const T = { a: 0.2, truth: 0.5, d0: 0.8, d1: 3.6, tags: 4.0, b: 6.6, e0: 7.0, e1: 9.4, back: 9.6 };
  const mark = T.d0 + ((T.d1 - T.d0) * A.at) / A.n; // the draw reaches record 40
  const bad = T.e0 + ((T.e1 - T.e0) * (G.at + 1)) / G.ws.length; // the draw reaches record 20

  V.scene({
    kicker: "HOW FAST TO ADAPT",
    title: ["The learning rate sets", "how fast it adapts"],
    dur: 13,
    caps: [
      [0.4, 2.1, "Two online models learn from the same stream."],
      [2.3, 4.4, `Roadworks at record ${A.at}: each km now takes ${A.target(A.at)}, not ${A.target(0)}.`],
      [
        4.7,
        6.4,
        `Rate ${fm(quick.eta, 3)} catches up in ${quick.catch} records; ${fm(slow.eta, 3)} needs ${slow.catch}.`,
      ],
      [7, 8.2, "But a fast learner trusts every record."],
      [8.4, 10.6, `One bad record, ${G.bad.min} min for ${G.bad.km} km: w jumps to ${fm(G.jump)}.`],
      [10.8, 12.8, "Bad data hits at once: watch online models closely."],
    ],
    build(stage) {
      const a = D9.plot(stage, {
        x: 12,
        y: 12,
        w: 912,
        h: 330,
        xr: [0, 80],
        yr: [2, 8],
        xticks: [0, 40, 80],
        yticks: [4, 6],
        xlab: "record",
        ylab: "weight w",
      });
      const b = D9.plot(stage, {
        x: 12,
        y: 360,
        w: 912,
        h: 268,
        xr: [0, 40],
        yr: [0, 12],
        xticks: [0, 20, 40],
        yticks: [4, 10],
        xlab: "record",
        ylab: "weight w",
      });
      const truthA = [
        [0, 4],
        [A.at, 4],
        [A.at, 6],
        [80, 6],
      ];
      const truthB = [
        [0, 4],
        [40, 4],
      ];
      const pSlow = trace(slow.ws);
      const pQuick = trace(quick.ws);
      const pBad = trace(G.ws);
      const tag = (text, tone, at, dx = 0, dy = 0, solid = false) =>
        D4.tag(stage, { x: at.x + dx, y: at.y + dy, text, tone, solid, fs: 28 });
      const road = tag("roadworks", "red", a.pt(A.at, 8), -96, 22, true);
      const caught = tag(`caught up in ${quick.catch}`, "blue", a.pt(54, 7.1));
      const needs = tag(`needs ${slow.catch}`, "grey", a.pt(66, 4.5));
      const badTag = tag(`${G.bad.km} km logged as ${G.bad.min} min`, "red", b.pt(G.at + 1, 11.4), 220, 4, true);
      const jumpTag = tag(fm(G.jump), "red", b.pt(G.at + 1, G.jump), -70, 0, true);
      const backTag = tag(`back after ${G.back} records`, "grey", b.pt(31, 7));

      return (t) => {
        const k = ramp(t, T.d0, T.d1, E.lin);
        const mk = ramp(t, mark, mark + 0.4, E.lin);
        const lk = ramp(t, 1.0, 1.4, E.lin);
        a.update({
          k: ramp(t, T.a, T.a + 0.5, E.lin),
          curves: [
            { pts: truthA, tone: "green", w: 5, dash: true, k: ramp(t, T.truth, T.truth + 0.5, E.inOut) },
            { pts: pSlow, tone: "grey", w: 5, k },
            { pts: pQuick, tone: "blue", w: 5, k },
          ],
          marks: [{ x: A.at, tone: "red", k: mk, o: mk ? 1 : 0 }],
          texts: [
            { at: [10, 4.75], text: `rate ${fm(slow.eta, 3)}`, tone: "grey", anchor: "start", o: lk },
            { at: [10, 3.0], text: `rate ${fm(quick.eta, 3)}`, tone: "blue", anchor: "start", o: lk },
          ],
        });
        road.set({ k: mk });
        caught.set({ k: ramp(t, T.tags, T.tags + 0.4, E.lin) });
        needs.set({ k: ramp(t, T.tags + 0.2, T.tags + 0.6, E.lin) });
        const bk = ramp(t, bad, bad + 0.4, E.lin);
        const jk = ramp(t, bad + 0.2, bad + 0.6, E.lin);
        b.update({
          k: ramp(t, T.b, T.b + 0.4, E.lin),
          curves: [
            { pts: truthB, tone: "green", w: 5, dash: true, k: ramp(t, T.b, T.b + 0.4, E.inOut) },
            { pts: pBad, tone: "blue", w: 5, k: ramp(t, T.e0, T.e1, E.lin) },
          ],
          marks: [{ x: G.at + 1, tone: "red", k: bk, o: bk ? 1 : 0 }],
          dots: [{ at: [G.at + 1, 11.4], tone: "red", r: 12, s: E.pop(bk), o: bk ? 1 : 0 }],
        });
        badTag.set({ k: bk });
        jumpTag.set({ k: jk, s: 1 + 0.1 * flash(t, bad + 0.5, bad + 0.9) });
        backTag.set({ k: ramp(t, T.back, T.back + 0.4, E.lin) });
      };
    },
  });
})();
