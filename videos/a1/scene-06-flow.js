/* Algorithms Phase 1 video (algo-1), scene 06 · rank flows along the links.
   The leaky web (A->B,C  B->C  C->A,D  D->nothing) with 25 tokens on every page. Every page pours all it has equally down its
   links: D has no links, so its 25 vanish and the total drops to 75. Fix: a dead end pours to EVERY page, and the total is 100
   again. All amounts come from A1.tokens (the real token trace), asserted below.
   Story (local seconds): 0.3-1.5 web, 25 pills and the total, 2.1-3.5 the pour (D's 25 floats away), 3.6-5.2 pills arrive and
   are added up one by one (75, red), 5.4-5.8 D is marked a dead end, 6.4-6.9 rewind, 7.0-7.6 D's pour links, 7.9-9.4 the pour
   again, 9.4-10.8 arrive and add up to 100 (green tick). */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const { ramp, flash, clamp, ease: E } = V;
  const W = A1.WEBS.leaky;
  const NAMES = W.names;
  const T0 = A1.tokens(W); // no repair
  const T1 = A1.tokens(W, { repair: true });
  const POURS = T1.sends.filter((s) => s.kind === "pour");
  A1.must(A1.near(T0.total, 75) && A1.near(T0.lost, 25) && T0.sends.length === 5, "flow: the leaky token trace");
  A1.must(A1.near(T1.total, 100) && T1.sends.length === 9, "flow: the repaired token trace");
  A1.must(POURS.length === 4 && POURS.every((s) => s.from === "D" && A1.near(s.amt, 6.25)), "flow: D pours 6.25 to each page");
  A1.must(W.dead.join() === "D", "flow: D is the only dead end");

  const BLUE = { in: [2.1, 3.5], halo: [2.0, 3.6] }; // first pour
  const FIX = { blue: [7.9, 9.1], purple: [8.25, 9.4], halo: [7.8, 9.5] }; // second pour
  const TALLY = [4.3, 9.9]; // when the "adding up" of the arrived pills starts (each pill 0.2 s after the last)
  const EXTRA = [["D", "A"], ["D", "B"], ["D", "C"], ["D", "D"]];
  const fmt = A1.fmt;

  /* the text and pop of a node's value pill at time t */
  function val(i, t) {
    const n = NAMES[i];
    const lin = (a, b) => ramp(t, a, b, E.lin);
    if (t < 6.6) {
      if (t < 3.6 + 0.1 * i) return { text: "25", k: lin(0.9 + 0.08 * i, 1.3 + 0.08 * i) * (1 - lin(2.0, 2.25)) };
      return { text: fmt(T0.got[n]), k: lin(3.6 + 0.1 * i, 4.0 + 0.1 * i) * (1 - lin(6.4, 6.6)) };
    }
    if (t < 9.4 + 0.1 * i) return { text: "25", k: lin(6.6 + 0.05 * i, 7.0 + 0.05 * i) * (1 - lin(7.8, 8.05)) };
    return { text: fmt(T1.got[n]), k: lin(9.4 + 0.1 * i, 9.8 + 0.1 * i) };
  }
  /* the running total shown while the arrived pills are added up: "0", then after each pill the sum so far */
  function tally(got, t0, t) {
    let sum = 0;
    let text = "0";
    NAMES.forEach((n, i) => {
      if (t >= t0 + 0.2 * (i + 1)) {
        sum += got[n];
        text = fmt(sum);
      }
    });
    return text;
  }
  const stepTimes = TALLY.flatMap((t0) => NAMES.map((_, i) => t0 + 0.2 * (i + 1)));

  function statState(t) {
    if (t < TALLY[0]) return { text: "100", tone: "blue" };
    if (t < 6.4) return { text: tally(T0.got, TALLY[0], t), tone: t >= TALLY[0] + 0.8 ? "red" : "blue" };
    if (t < TALLY[1]) return { text: "100", tone: "blue" };
    return { text: tally(T1.got, TALLY[1], t), tone: t >= TALLY[1] + 0.8 ? "green" : "blue" };
  }

  /* the packets in flight at time t: [{ from, to, f, tone, text, o, s }] */
  function packets(t) {
    const out = [];
    const send = (s, [a, b], tone) => {
      if (t < a || t > b) return;
      out.push({
        from: s.from,
        to: s.to,
        f: ramp(t, a, b, E.inOut),
        tone,
        text: fmt(s.amt),
        o: ramp(t, a, a + 0.1, E.lin) * (1 - ramp(t, b - 0.16, b, E.lin)),
        s: 1 - 0.3 * ramp(t, b - 0.2, b, E.lin),
      });
    };
    T0.sends.forEach((s) => send(s, BLUE.in, "blue"));
    T1.sends.forEach((s) => send(s, s.kind === "pour" ? FIX.purple : FIX.blue, s.kind === "pour" ? "purple" : "blue"));
    return out;
  }

  VID.scene({
    kicker: "PAGERANK",
    title: ["Rank flows along", "the links"],
    dur: 13,
    caps: [
      [0.4, 1.9, "Give every page 25 tokens."],
      [2.0, 4.6, "Each page pours them equally down its links."],
      [4.8, 6.6, "D has no links, so its 25 tokens vanish."],
      [7.0, 9.4, "Fix: a dead end pours to every page."],
      [9.6, 12.4, "Now nothing is lost: the total is 100 again."],
    ],
    build(stage) {
      const g = A1.web(stage, {
        web: W,
        x: 0,
        y: 10,
        w: 620,
        h: 520,
        r: 34,
        extra: EXTRA,
        labels: { A: "below", B: "right", C: "below", D: "right" },
        tags: { D: "above" },
        loops: { D: "below" },
      });
      const stat = A1.stat(stage, { x: 704, y: 40, w: 220, h: 140, label: "total tokens", text: "100", tone: "blue" });
      const lost = A1.tag(stage, { text: `−${fmt(T0.lost)} lost`, tone: "red", solid: true, fs: 32 });
      const tick = A1.icon("tick", 44, "green");
      stage.append(tick);
      // D's own 25: it has nowhere to go, so it floats away (an SVG pill above the web)
      const gone = A1.svgPill(g.overlay);
      const D = g.pt("D");
      const goneX = D.x + g.r + 10 + gone.w("25") / 2;

      return (t) => {
        // ---- nodes, edges, pills
        const node = {};
        NAMES.forEach((n, i) => {
          const k = ramp(t, 0.3 + 0.1 * i, 0.8 + 0.1 * i, E.lin);
          const v = val(i, t);
          const dead = n === "D";
          const pouring = (t >= BLUE.halo[0] && t < BLUE.halo[1] + 0.1) || (t >= FIX.halo[0] && t < FIX.halo[1] + 0.1);
          const halo = Math.min(ramp(t, BLUE.halo[0], BLUE.halo[0] + 0.2), 1 - ramp(t, BLUE.halo[1] - 0.2, BLUE.halo[1]));
          const halo2 = Math.min(ramp(t, FIX.halo[0], FIX.halo[0] + 0.2), 1 - ramp(t, FIX.halo[1] - 0.2, FIX.halo[1]));
          let tone = pouring && !dead ? "blue" : "grey";
          let ring = "red";
          let rk = ramp(t, 5.4, 5.8);
          let tagText = "dead end";
          let tagTone = "red";
          let tagK = ramp(t, 5.4, 5.8);
          if (dead && t >= 5.4) tone = "red";
          if (dead && t >= 7.0) {
            [tone, ring, rk, tagText, tagTone, tagK] = ["purple", "purple", 1, "pours to all", "purple", ramp(t, 7.0, 7.4)];
          }
          if (dead && t >= FIX.halo[0] && t < FIX.halo[1] + 0.1) tone = "purple";
          const tallyAt = (t < 6.4 ? TALLY[0] : TALLY[1]) + 0.2 * (i + 1);
          node[n] = {
            tone,
            o: clamp(k * 3),
            s: 0.6 + 0.4 * E.pop(k),
            halo: dead ? (t >= 7.0 ? halo2 : 0) : Math.max(halo, halo2),
            pulse: ((t >= TALLY[0] && t < 6.4) || t >= TALLY[1]) && t < 11.2 ? flash(t, tallyAt, tallyAt + 0.35) : 0,
            val: v.text,
            valTone: "blue",
            valK: v.k,
            ring,
            rk: dead ? rk : 0,
            tag: dead ? tagText : "",
            tagTone,
            tagK: dead ? tagK : 0,
          };
        });
        const edge = {};
        W.edges.forEach(([a, b], idx) => {
          edge[a + b] = { k: ramp(t, 0.55 + 0.07 * idx, 1.0 + 0.07 * idx, E.lin), tone: "grey" };
        });
        EXTRA.forEach(([a, b], idx) => {
          edge[a + b] = { k: ramp(t, 7.0 + 0.1 * idx, 7.4 + 0.1 * idx, E.lin), tone: "purple", dash: true, o: 1 };
        });
        g.update({ node, edge, packets: packets(t) });

        // ---- D's 25 floats away
        const fl = ramp(t, 2.0, 2.9, E.out);
        gone.set({
          x: goneX,
          y: D.y - 44 * fl,
          text: "25",
          tone: "red",
          s: 1 - 0.2 * fl,
          o: t >= 2.0 ? 1 - ramp(t, 2.25, 2.9, E.lin) : 0,
        });

        // ---- the total
        const st = statState(t);
        const k0 = ramp(t, 0.9, 1.4, E.lin);
        const shake = t >= 5.1 && t < 5.45 ? Math.sin((t - 5.1) * 2 * Math.PI * 6) * 9 * (1 - ramp(t, 5.1, 5.45, E.lin)) : 0;
        const bump = Math.max(0, ...stepTimes.map((s) => flash(t, s, s + 0.25)));
        stat.set({ text: st.text, tone: st.tone, dx: shake, s: (0.7 + 0.3 * E.pop(k0)) * (1 + 0.05 * bump), o: clamp(k0 * 4) });
        const kl = ramp(t, 5.3, 5.7, E.lin) * (1 - ramp(t, 6.4, 6.7, E.lin));
        lost.set({ x: 814, y: 224, center: true, s: 0.7 + 0.3 * E.pop(kl), o: clamp(kl * 4) });
        const kt = ramp(t, 10.8, 11.3, E.lin);
        V.place(tick, { x: 792, y: 194, s: 0.8 + 0.2 * E.back(kt), o: clamp(kt * 4) });
        A1.drawOn(tick, kt);
      };
    },
  });
})();
