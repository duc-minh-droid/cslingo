/* Algorithms Phase 1 video (algo-1), scene 07 · a link trap.
   The trap web X->A  A->B  B->A with 25 tokens on every page and no teleporting. Rank is only handed round and round between A
   and B: it is conserved but sloshes (A 50 / B 25, then A 25 / B 50, then back), and X, which nobody links to, is left with 0.
   All amounts come from A1.trapRounds(3) (the real token trace); the packets are derived from it and asserted below.
   Story (local seconds): 0.3-1.3 web, '25' pills and the round counter, round r starts at 1.4 + 1.6 (r - 1): 0.8 s of packets
   travelling (the old pills fade), 0.4 s of arrival (new pills pop, the counter counts), 6.0-7.2 the dashed red trap outline
   round A and B, the 'trapped' tag, X starved, 7.4-10 hold. */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const W = A1.WEBS.trap;
  const NAMES = W.names; // X, A, B
  const R = A1.trapRounds(3);
  const fmt = A1.fmt;

  // ---- the data the picture shows, checked against the lecture
  const want = [
    [25, 25, 25],
    [0, 50, 25],
    [0, 25, 50],
    [0, 50, 25],
  ];
  R.forEach((row, r) => NAMES.forEach((n, i) => A1.must(A1.near(row[n], want[r][i]), `trap: round ${r} page ${n}`)));
  /* round r (1..3): every page that has something sends ALL of it down its one link */
  const SENDS = [null, 1, 2, 3].map((r) =>
    r ? NAMES.filter((n) => R[r - 1][n] > 0).map((n) => ({ from: n, to: W.out[n][0], amt: R[r - 1][n] })) : [],
  );
  [1, 2, 3].forEach((r) =>
    NAMES.forEach((n) => {
      const got = SENDS[r].filter((s) => s.to === n).reduce((a, s) => a + s.amt, 0);
      A1.must(A1.near(got, R[r][n]), `trap: the packets of round ${r} must add up to ${n}'s new value`);
    }),
  );
  A1.must(SENDS[1].length === 3 && SENDS[2].length === 2 && SENDS[3].length === 2, "trap: X sends only in round 1");

  const tr = (r) => 1.4 + 1.6 * (r - 1); // start of round r
  const FLY = 0.8; // packets travel
  const ARR = 1.2; // round ends (arrival done)
  const TRAP = { line: [6.0, 7.0], tag: [6.8, 7.2], starve: [6.4, 6.9], cross: [6.7, 7.1] };
  const roundsStarted = (t) => [1, 2, 3].filter((r) => t >= tr(r)).length;
  const roundsDone = (t) => [1, 2, 3].filter((r) => t >= tr(r) + FLY).length;

  /* the text, tone and pop of a page's value pill at time t */
  function val(i, t) {
    const n = NAMES[i];
    const lin = (a, b) => ramp(t, a, b, E.lin);
    const rs = roundsStarted(t);
    const tone = (v) => (v === 0 ? "red" : "blue");
    if (rs === 0) return { text: fmt(R[0][n]), tone: "blue", k: lin(0.9 + 0.08 * i, 1.3 + 0.08 * i) };
    const [a, b] = [R[rs - 1][n], R[rs][n]];
    if (a === 0 && b === 0) return { text: "0", tone: "red", k: 1 }; // X: nothing to send, nothing arrives
    if (t < tr(rs) + FLY) return { text: fmt(a), tone: tone(a), k: 1 - lin(tr(rs), tr(rs) + 0.25) };
    return { text: fmt(b), tone: tone(b), k: lin(tr(rs) + FLY, tr(rs) + ARR) };
  }

  /* the outline of the trap: a rounded rectangle path, a dashed line revealed from its start by k (0..1) */
  function outline(g) {
    const [a, b] = [g.pt("A"), g.pt("B")];
    const x0 = a.x - 80;
    const x1 = a.x + g.r + 100;
    const y0 = a.y - g.r - 28;
    const y1 = b.y + g.r + 28;
    const rad = 40;
    const len = 2 * (x1 - x0 - 2 * rad) + 2 * (y1 - y0 - 2 * rad) + 2 * Math.PI * rad;
    const d = [
      `M${x0 + rad} ${y0}H${x1 - rad}A${rad} ${rad} 0 0 1 ${x1} ${y0 + rad}V${y1 - rad}`,
      `A${rad} ${rad} 0 0 1 ${x1 - rad} ${y1}H${x0 + rad}A${rad} ${rad} 0 0 1 ${x0} ${y1 - rad}`,
      `V${y0 + rad}A${rad} ${rad} 0 0 1 ${x0 + rad} ${y0}`,
    ].join("");
    const n = Math.round(len / 21); // 12 px dash + 9 px gap, stretched so the pattern closes the loop
    const [dash, gap] = [(12 * len) / (n * 21), (9 * len) / (n * 21)];
    const path = V.s("path", { d, fill: "none", "stroke-width": 6, "stroke-linejoin": "round" });
    path.style.stroke = L5.tone("red").c;
    g.overlay.append(path);
    return {
      box: { x0, x1, y0, y1 },
      set(k) {
        const shown = clamp(k) * len;
        const list = [];
        let pos = 0;
        while (pos < shown - 0.01 && list.length < 2 * n) {
          const dd = Math.min(dash, shown - pos);
          list.push(dd.toFixed(2));
          pos += dd;
          list.push(pos >= shown - 0.01 ? (len * 3).toFixed(0) : gap.toFixed(2)); // the last gap runs off the end
          pos += gap;
        }
        path.style.strokeDasharray = list.join(" ") || "0 9999";
        V.show(path, k > 0.002 ? 1 : 0);
      },
    };
  }

  VID.scene({
    kicker: "LINK TRAP",
    title: ["Closed loops", "trap the rank"],
    dur: 10,
    caps: [
      [0.4, 2.6, "A and B link only to each other."],
      [2.8, 6.0, "Rank sloshes between them, round after round."],
      [6.2, 9.4, "A trap: X gets nothing, so the ranking says little."],
    ],
    build(stage) {
      const g = A1.web(stage, {
        web: W,
        x: 40,
        y: 20,
        w: 560,
        h: 500,
        r: 38,
        labels: { X: "below", A: "right", B: "right" },
        tags: { X: "above" },
      });
      const trapLine = outline(g);
      const pills = [0, 1, 2].map(() => A1.svgPill(g.overlay));
      const stat = A1.stat(stage, { x: 700, y: 60, w: 200, h: 128, label: "round", text: "0", tone: "blue" });
      const trapped = A1.tag(stage, {
        text: "trapped",
        tone: "red",
        solid: true,
        icon: A1.icon("loop", 30, "red", { on: true, flow: true }),
      });
      const cross = A1.icon("cross", 40, "red");
      stage.append(cross);
      const X = g.pt("X");
      const crossAt = { x: X.x + 38 + 4, y: X.y + 38 + 6.7 + 11.2 + 21 - 20 };

      /* the packets in flight at time t, as pills on their lanes (the two lanes between A and B are pushed apart so the
         pills never overlap) */
      function packets(t) {
        const r = [1, 2, 3].find((q) => t >= tr(q) && t <= tr(q) + FLY + 0.001);
        pills.forEach((p, i) => {
          const s = r && SENDS[r][i];
          if (!s) return p.set({ o: 0 });
          const a = g.pt(s.from);
          const b = g.pt(s.to);
          const len = Math.hypot(b.x - a.x, b.y - a.y);
          const lane = g.hasEdge(s.to, s.from) ? 14 : 0;
          const f = 0.08 + 0.84 * ramp(t, tr(r), tr(r) + FLY, E.inOut);
          const pt = g.edgePt(s.from, s.to, f);
          p.set({
            x: pt.x + ((b.y - a.y) / len) * lane,
            y: pt.y - ((b.x - a.x) / len) * lane,
            text: fmt(s.amt),
            tone: "blue",
            look: "solid",
            s: 0.92 * (1 - 0.3 * ramp(t, tr(r) + FLY - 0.2, tr(r) + FLY, E.lin)),
            o: ramp(t, tr(r), tr(r) + 0.12, E.lin) * (1 - ramp(t, tr(r) + FLY - 0.16, tr(r) + FLY, E.lin)),
          });
        });
      }

      return (t) => {
        const done = roundsDone(t);
        const starved = ramp(t, TRAP.starve[0], TRAP.starve[1], E.lin);
        // ---- nodes: the pages that are sending glow blue
        const node = {};
        NAMES.forEach((n, i) => {
          const k = ramp(t, 0.3 + 0.1 * i, 0.8 + 0.1 * i, E.lin);
          const v = val(i, t);
          let glow = 0;
          let hit = 0;
          [1, 2, 3].forEach((r) => {
            if (SENDS[r].some((s) => s.from === n)) {
              glow = Math.max(glow, Math.min(ramp(t, tr(r), tr(r) + 0.2), 1 - ramp(t, tr(r) + FLY - 0.2, tr(r) + FLY)));
            }
            if (R[r][n] > 0) hit = Math.max(hit, flash(t, tr(r) + FLY, tr(r) + ARR - 0.05));
          });
          node[n] = {
            tone: n === "X" && t >= TRAP.line[0] ? "red" : glow > 0.05 ? "blue" : "grey",
            o: clamp(k * 3),
            s: 0.6 + 0.4 * E.pop(k),
            halo: glow,
            pulse: hit,
            val: v.text,
            valTone: v.tone,
            valK: v.k,
            tag: n === "X" ? "starved" : "",
            tagTone: "red",
            tagK: n === "X" ? starved : 0,
          };
        });
        // ---- links (X's link carries its only 25 in round 1, then it is empty)
        const edge = {};
        W.edges.forEach(([a, b], idx) => {
          const dim = a === "X" ? 1 - 0.55 * ramp(t, tr(1) + FLY, tr(1) + ARR, E.lin) : 1;
          edge[a + b] = { k: ramp(t, 0.55 + 0.1 * idx, 1.0 + 0.1 * idx, E.lin), tone: "grey", o: dim };
        });
        g.update({ node, edge });
        packets(t);

        // ---- the round counter
        const k0 = ramp(t, 0.9, 1.3, E.lin);
        const bump = Math.max(0, ...[1, 2, 3].map((r) => flash(t, tr(r) + FLY, tr(r) + ARR - 0.05)));
        stat.set({ text: String(done), s: (0.7 + 0.3 * E.pop(k0)) * (1 + 0.08 * bump), o: clamp(k0 * 4) });

        // ---- the trap
        trapLine.set(ramp(t, TRAP.line[0], TRAP.line[1], E.inOut));
        const kt = ramp(t, TRAP.tag[0], TRAP.tag[1], E.lin);
        trapped.set({ x: 548, y: 270, center: false, s: 0.7 + 0.3 * E.pop(kt), o: clamp(kt * 4) });
        const kc = ramp(t, TRAP.cross[0], TRAP.cross[1], E.lin);
        V.place(cross, { x: crossAt.x, y: crossAt.y, s: 0.8 + 0.2 * E.back(kc), o: clamp(kc * 4) });
        A1.drawOn(cross, kc);
      };
    },
  });
})();
