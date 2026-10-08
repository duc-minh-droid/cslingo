/* Algorithms phase 2 (algo-2), scene 04: why settled means final, and when it breaks.
   Beat A (undirected triangle A, B, C): after A is settled, B waits at 4 and C at 2. Any other way into C must leave through B, which
   is already 4 away (past C's 2) and then pays B-C (1): 5. So the smallest waiting node is final.
   Beat B (directed triangle with a negative road): Dijkstra settles B (4), then C (5), then finds C->B = 5 - 3 = 2, but B is locked.
   Every number comes from A2.SAFE and A2.NEG (asserted below); only the times are typed here. */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;
  const { pop, fade, lin, io, bump, curve } = A2;

  // ---------- data (all from the helpers, asserted here) ----------
  const SAFE = A2.SAFE;
  const RIVAL = SAFE.rival;
  const NR = A2.NEG.run.rounds;
  const LATE = NR[2].late[0];
  const wOf = (edges, a, b) => edges.find((e) => e[0] === a && e[1] === b)[2];
  A2.need(
    SAFE.settle === "C" &&
      SAFE.d === 2 &&
      RIVAL.via === "B" &&
      RIVAL.first === 4 &&
      RIVAL.then === 1 &&
      RIVAL.total === 5,
    "scene 4: C waits at 2; the way through B is 4 + 1 = 5",
  );
  A2.need(
    wOf(SAFE.edges, "A", "B") === RIVAL.first &&
      wOf(SAFE.edges, "A", "C") === SAFE.d &&
      wOf(SAFE.edges, "C", "B") === RIVAL.then,
    "scene 4: the triangle roads are A-B 4, A-C 2, C-B 1",
  );
  A2.need(
    NR.map((r) => r.node).join("") === "ABC" && NR[1].d === 4 && NR[2].d === 5,
    "scene 4: Dijkstra settles A, B (4), C (5)",
  );
  A2.need(
    NR[0].after.dist.B === NR[1].d && NR[0].after.dist.C === NR[2].d,
    "scene 4: after A, B waits at 4 and C at 5 in the negative triangle",
  );
  A2.need(
    NR[2].late.length === 1 &&
      LATE.to === "B" &&
      LATE.cand === 2 &&
      LATE.old === 4 &&
      LATE.w === wOf(A2.NEG.edges, "C", "B"),
    "scene 4: the road C->B would undercut the settled B: 5 - 3 = 2 < 4",
  );
  A2.need(A2.NEG.trueB === LATE.cand && LATE.w < 0, "scene 4: B is really 2");

  const D = { A: 0, B: RIVAL.first, C: SAFE.d }; // beat A: distances after A is settled
  const E = { A: 0, B: NR[1].d, C: NR[2].d }; // beat B: B and C as first reached and settled
  const SUM_A = `${RIVAL.first} + ${RIVAL.then} = ${RIVAL.total}`;
  const SUM_B = `${NR[2].d} ${LATE.w < 0 ? "−" : "+"} ${Math.abs(LATE.w)} = ${LATE.cand}`;

  // ---------- timeline (local seconds) ----------
  const T = {
    pops: { A: 0.5, B: 0.65, C: 0.8 }, // badges pop in
    ring: 1.0, // C is the pick
    go: 2.0, // the way to C is measured: bars reveal, A-B and A-C draw
    leg2: 2.6, // road C-B draws from B
    sum: 3.1, // '4 + 1 = 5'
    pulse2: 4.0, // the line pulses again
    pull: 4.4, // the detour pulls back
    settle: 4.6, // C settled
    out: 5.0, // the panel fades away
    swap: 5.9, // the negative triangle fades in over the first
    bPick: 7.0,
    bSettle: 7.6,
    cPick: 8.0,
    cSettle: 8.6,
    check: 8.7, // road C->B is checked
    strike: 9.2, // B's 4 is struck and B shakes
    wrong: 9.5, // the tick turns into a cross, the road goes red
    verdict: 10.0,
  };
  const PASS = T.go + 0.5 * (SAFE.d / RIVAL.first); // the first segment of the detour bar passes the marker line

  const P = { x: 535, y: 73 }; // beside B's badge: the tick, then the cross
  const f2 = (v) => v.toFixed(2);

  V.scene({
    kicker: "WHY IT WORKS",
    title: ["Why settled means final,", "and when it breaks"],
    dur: 11,
    caps: [
      [0.4, 4.6, "Any other way to C goes via B, and B is already further."],
      [4.8, 6.8, "So the smallest waiting node is final."],
      [7.0, 10.6, "A negative road can undercut a node that was settled."],
    ],
    build(stage) {
      const sides = { A: "tl", B: "tr", C: "tr" };
      const Ga = A2.graph(stage, { nodes: A2.TRI.pos, edges: SAFE.edges, badge: sides });
      const Gb = A2.graph(stage, { nodes: A2.TRI.pos, edges: A2.NEG.edges, directed: true, badge: sides });

      // the comparison panel: the direct way to C against the detour through B
      const bar1 = A2.bar(stage, {
        x: 560,
        y: 210,
        unit: 70,
        segs: [{ v: SAFE.d, tone: "green", text: String(SAFE.d) }],
      });
      const bar2 = A2.bar(stage, {
        x: 560,
        y: 330,
        unit: 70,
        segs: [
          { v: RIVAL.first, tone: "blue", text: String(RIVAL.first), align: "left" },
          { v: RIVAL.then, tone: "blue", text: String(RIVAL.then) },
        ],
      });
      const share = RIVAL.first / (RIVAL.first + RIVAL.then); // the first segment's share of the whole bar

      const svg = L5.svg(stage);
      const markX = bar1.xAt(SAFE.d);
      const mark = V.s("line", {
        x1: markX,
        y1: 196,
        x2: markX,
        y2: 396,
        "stroke-linecap": "round",
        "stroke-dasharray": "10 9",
      });
      mark.style.stroke = L5.tone("orange").c;
      const tickC = L5.tick(494, 560, 48, "green", { w: 9 });
      const tickB = L5.tick(P.x, P.y, 40, "green", { w: 8 });
      const crossB = L5.cross(P.x, P.y, 40, "red", { w: 8 });
      svg.append(mark, tickC, tickB, crossB);

      const tDirect = A2.tag(stage, { x: 610, y: 172, text: "direct", tone: "green" });
      const tDetour = A2.tag(stage, { x: 655, y: 292, text: `detour via ${RIVAL.via}`, tone: "blue" });
      const tSum = A2.tag(stage, { x: 735, y: 420, text: SUM_A, tone: "blue" });
      const tTrue = A2.tag(stage, { x: 612, y: P.y, text: String(A2.NEG.trueB), tone: "red", solid: true });
      const tVerdict = A2.tag(stage, {
        x: 468,
        y: 602,
        text: `B is really ${A2.NEG.trueB}, not ${LATE.old}`,
        tone: "red",
        solid: true,
      });

      /* a road overlay: a coloured stretch of a road, or the plain grey road when nothing is drawn on it */
      const over = (tone, k, extra = {}) => (k > 0.001 ? { tone, k, w: 12, ...extra } : { tone: null, k: 1 });

      // ---------- beat A: the undirected triangle ----------
      function nodesA(t) {
        const calm = (tone) => ({ look: "soft", tone });
        return {
          A: calm("green"),
          B: calm("purple"),
          C:
            t >= T.settle
              ? { ...calm("green"), pulse: bump(t, T.settle, 0.4) }
              : t >= T.ring
                ? {
                    look: "solid",
                    tone: "orange",
                    ring: "orange",
                    ringK: lin(t, T.ring, T.ring + 0.5),
                    pulse: Math.max(bump(t, T.ring, 0.35), bump(t, T.leg2 + 0.4, 0.4)),
                  }
                : calm("purple"),
        };
      }
      function badgesA(t) {
        const tone = (n) =>
          n === "A" || (n === "C" && t >= T.settle) ? "green" : n === "C" && t >= T.ring ? "orange" : "purple";
        const o = 1 - lin(t, T.swap, T.swap + 0.3);
        return A2.obj(["A", "B", "C"], (n) => ({
          text: D[n],
          tone: tone(n),
          k: lin(t, T.pops[n], T.pops[n] + 0.45),
          o,
        }));
      }
      function edgesA(t) {
        const out = 1 - lin(t, T.swap, T.swap + 0.3);
        const back2 = 1 - lin(t, T.pull, T.pull + 0.2); // the detour pulls back, last road first
        const back1 = 1 - lin(t, T.pull + 0.15, T.pull + 0.35);
        const dash = { dash: "dots", w: 12 };
        return {
          "A-B": { ...over("blue", lin(t, T.go, T.go + 0.5) * back1, { from: "A", ...dash }), o: out },
          "C-B": { ...over("blue", lin(t, T.leg2, T.leg2 + 0.4) * back2, { from: "B", ...dash }), o: out },
          "A-C": { ...over("green", lin(t, T.go, T.go + 0.5), { from: "A" }), o: out },
        };
      }

      // ---------- beat B: the directed triangle with a negative road ----------
      function nodesB(t) {
        const sh = 6 * Math.sin(lin(t, T.strike, T.strike + 0.3) * Math.PI * 4);
        const look = (pick, settle, dx) =>
          t >= settle
            ? { look: "soft", tone: "green", pulse: bump(t, settle, 0.4), dx }
            : t >= pick
              ? {
                  look: "solid",
                  tone: "orange",
                  ring: "orange",
                  ringK: lin(t, pick, pick + 0.3),
                  pulse: bump(t, pick, 0.35),
                }
              : { look: "soft", tone: "purple" };
        return {
          A: { look: "soft", tone: "green" },
          B: look(T.bPick, T.bSettle, sh),
          C: look(T.cPick, T.cSettle, 0),
        };
      }
      function badgesB(t) {
        const sh = 6 * Math.sin(lin(t, T.strike, T.strike + 0.3) * Math.PI * 4);
        const tone = (pick, settle) => (t >= settle ? "green" : t >= pick ? "orange" : "purple");
        const wrong = t >= T.strike;
        return {
          A: { text: E.A, tone: "green" },
          B: {
            text: E.B,
            tone: wrong ? "red" : tone(T.bPick, T.bSettle),
            strike: lin(t, T.strike, T.strike + 0.3),
            dx: sh,
          },
          C: { text: E.C, tone: tone(T.cPick, T.cSettle) },
        };
      }
      function edgesB(t) {
        const bad = t >= T.wrong;
        const checked = t >= T.check;
        return {
          "A-B": over("green", lin(t, T.bSettle, T.bSettle + 0.3), { from: "A" }),
          "A-C": over("green", lin(t, T.cSettle, T.cSettle + 0.3), { from: "A" }),
          "C-B": checked
            ? {
                tone: bad ? "red" : "blue",
                k: io(t, T.check, T.check + 0.4),
                w: 12,
                from: "C",
                text: SUM_B,
                ps: 1 + 0.2 * bump(t, T.check, 0.35),
              }
            : { pill: "red" },
        };
      }

      return (t) => {
        // ---- beat A ----
        Ga.update({
          o: t < T.swap + 0.7 ? fade(t, 0, 0.5) : 0, // the nodes stay put until the second triangle covers them
          nodes: nodesA(t),
          edges: edgesA(t),
          badges: badgesA(t),
        });

        // the panel: direct way, detour through B, the marker line
        const po = 1 - lin(t, T.out, T.out + 0.6);
        bar1.update({ k: lin(t, T.go, T.go + 0.5), o: po });
        bar2.update({ k: curve(t, [[T.go, 0], [T.go + 0.5, share], [T.leg2, share], [T.leg2 + 0.4, 1]]), o: po }); // prettier-ignore
        const flash = Math.max(bump(t, PASS - 0.1, 0.45), bump(t, T.pulse2, 0.45));
        mark.setAttribute("stroke-width", f2(4 + 4 * flash));
        V.show(mark, lin(t, T.go - 0.2, T.go + 0.1) * po);
        tDirect.set({ s: 0.8 + 0.2 * pop(t, T.go), o: fade(t, T.go, 0.2) * po });
        tDetour.set({ s: 0.8 + 0.2 * pop(t, T.go + 0.1), o: fade(t, T.go + 0.1, 0.2) * po });
        tSum.set({ s: (0.8 + 0.2 * pop(t, T.sum)) * (1 + 0.08 * bump(t, T.pulse2, 0.4)), o: fade(t, T.sum, 0.2) * po });

        // C settled
        const tk = lin(t, T.settle + 0.1, T.settle + 0.5);
        L5.drawOn(tickC, tk);
        V.place(tickC, { s: 0.7 + 0.3 * pop(t, T.settle + 0.1), o: tk > 0 ? 1 - lin(t, T.swap, T.swap + 0.3) : 0 });

        // ---- beat B ----
        Gb.update({ o: lin(t, T.swap + 0.3, T.swap + 0.75), nodes: nodesB(t), edges: edgesB(t), badges: badgesB(t) });
        const tb = lin(t, T.bSettle + 0.1, T.bSettle + 0.5);
        L5.drawOn(tickB, tb);
        V.place(tickB, { s: 0.7 + 0.3 * pop(t, T.bSettle + 0.1), o: tb > 0 ? 1 - lin(t, T.wrong, T.wrong + 0.2) : 0 });
        const cb = lin(t, T.wrong, T.wrong + 0.4);
        L5.drawOn(crossB, cb);
        V.place(crossB, { s: 0.7 + 0.3 * pop(t, T.wrong), o: cb > 0 ? 1 : 0 });
        tTrue.set({ s: 0.8 + 0.2 * pop(t, T.wrong + 0.1), o: fade(t, T.wrong + 0.1, 0.2) });
        tVerdict.set({ s: 0.8 + 0.2 * pop(t, T.verdict), o: fade(t, T.verdict, 0.2) });
      };
    },
  });
})();
