/* Phase 6 · scene 07-distance (15.2 s): a code can repair a flipped bit only if its valid words are far apart. Drawn on the cube of
   3-bit words: one flip moves a word one step along an edge; the valid words 000 and 111 are three steps apart; a word one flip
   from 000 is still nearest to 000 (repaired), two flips leave it nearest to 111 (the repair is wrong). Every word, distance and
   verdict comes from A6.CODE (common.js). Two cubes share the stage: the base one holds the grey edges and the words, the overlay
   one draws the coloured edges on top of the grey ones (so an edge can grow, or retract, over its grey line).
   Story (local seconds): 0.2-1.1 the edges draw and the eight words pop; 1.4 the blue token pops at 000; 1.75-2.45 it hops one
   edge (a bolt, the orange edge, "1 flip = 1 step"); 3.6-4.0 it goes back; 3.7-4.4 000 and 111 turn solid green and get their
   tags ("valid words", "0 = 000", "1 = 111"); 4.8-6.0 the path 000-010-011-111 draws on with step discs 1, 2, 3 and the tag
   "3 steps apart"; 7.8-8.1 the path fades. ONE FLIP: "sent 000", the token hops to 010 (bolt, 010 red, "received 010"), the
   decoder tags count the steps (1 to 000, 2 to 111), the token hops back to 000 (green edge, green ring). TWO FLIPS: two hops to
   011 (two bolts, 011 red, "received 011"), the decoder tags swap (2 to 000, 1 to 111) and the token hops on to 111 (red edge,
   red ring); the green rule tag "3 apart fixes one flip" lands at 13.0. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  // ---------- data (all from A6.CODE) ----------
  const C = A6.CODE;
  const [W0, W1] = C.words;
  const P = C.path;
  const PE = P.slice(1).map((w, i) => A6.ek(P[i], w)); // the three edges of the path
  const steps = (n) => `${n} step${n === 1 ? "" : "s"}`;
  A6.same("distance: repeating three times keeps one bit in three", [A6.RATE.repeat.sent, A6.RATE.repeat.data], [3, 1]);
  A6.same("distance: valid words and their distance", [C.words, C.d, A6.dist(W0, W1)], [["000", "111"], 3, 3]);
  A6.same("distance: the path is three single flips", [P.length, PE], [4, ["000-010", "010-011", "011-111"]]);
  A6.same("distance: path ends are the valid words", [P[0], P[P.length - 1]], [W0, W1]);
  A6.same("distance: one flip", [C.one.recv, C.one.d0, C.one.d1, C.one.fix, C.one.right], [P[1], 1, 2, W0, true]);
  A6.same("distance: two flips", [C.two.recv, C.two.d0, C.two.d1, C.two.fix, C.two.right], [P[2], 2, 1, W1, false]);

  // ---------- timeline ----------
  const LEGS = [
    // the blue token: [from, to, start, end]
    [W0, P[1], 1.75, 2.45], // intro: one flip is one step
    [P[1], W0, 3.6, 4.0],
    [W0, C.one.recv, 8.5, 8.95], // one flip: the noise hit ...
    [C.one.recv, C.one.fix, 9.65, 10.2], // ... and the repair
    [W0, P[1], 10.95, 11.35], // two flips
    [P[1], C.two.recv, 11.35, 11.7],
    [C.two.recv, C.two.fix, 12.05, 12.55], // the wrong repair
  ];
  const SPANS = [
    [1.4, 1.8, 3.6, 3.85], // the token's lives: [pop start, pop end, fade start, fade end]
    [8.15, 8.5, 10.5, 10.65],
    [10.7, 11.0, 99, 100],
  ];
  const HIT = [1.75, 2.45]; // the bolts: one for the left edge (three hits), one above the second edge
  const BOLTS = { a: [HIT, [8.5, 8.95], [10.95, 11.35]], b: [[11.35, 11.7]] };
  const T = {
    edges: 0.2, // grey edges draw on, one every 0.04 s
    words: 0.4, // the words pop, one every 0.05 s
    valid: 3.7, // 000 and 111 turn solid green
    validTag: 4.15,
    bit0: 4.4,
    bit1: 4.65,
    path: [4.8, 5.2, 5.6, 6.0], // the three path edges draw between these times
    discs: [5.1, 5.5, 5.9],
    apart: 6.05,
    pathOut: [7.8, 8.1],
    stepTag: [2.0, 2.4],
    stepOut: [3.6, 3.9],
    sent: [8.15, 8.5],
    got: 9.0, // the one-flip word turns red and the decoder tags pop
    decoders: [9.0, 9.4],
    greyWord: 9.95,
    ring0: [10.2, 10.5],
    reset: [10.5, 10.7], // the token, the ring and the tags of the one-flip demo leave
    sent2: [10.7, 11.0],
    got2: 11.7,
    swap: 11.75, // the decoder tags pop in again with the new numbers
    ring1: [12.55, 12.85],
    rule: [13.0, 13.35],
    rate: [13.85, 14.2], // the price of repeating: the bridge to Hamming
  };

  const XL = 42; // left edge of the cube and the rule tag
  const XR = 630; // left edge of the right column
  const k = (t, a, b) => ramp(t, a, b, E.inOut);
  const lin = E.lin;
  const popK = (kk) => ({ s: E.pop(kk), o: clamp(kk * 5) });

  function build(stage) {
    const base = A6.cube(stage, { x: XL, y: 56, w: 540, h: 430, pillW: 92, pillH: 54 });
    const over = A6.cube(stage, { x: XL, y: 56, w: 540, h: 430, pillW: 92, pillH: 54 });
    stage.insertBefore(over.el, base.el.nextSibling); // the coloured edges sit above the grey ones, below the words
    A6.same(
      "distance: the path edges are cube edges",
      PE.every((e) => base.edgeKeys.includes(e)),
      true,
    );

    const validTag = A6.tag(stage, { x: XR, y: 40, text: "valid words", tone: "grey" });
    const bit0 = A6.tag(stage, { x: XR, y: 106, text: `0 = ${W0}`, tone: "green" });
    const bit1 = A6.tag(stage, { x: XR, y: 172, text: `1 = ${W1}`, tone: "green" });
    const stepTag = A6.tag(stage, { x: XR, y: 262, text: "1 flip = 1 step", tone: "grey" });
    const apartTag = A6.tag(stage, { x: XR, y: 262, text: `${C.d} steps apart`, tone: "orange" });
    const recvTag = A6.tag(stage, { x: XR, y: 262, text: `sent ${W0}`, tone: "blue" });
    const dec0 = A6.tag(stage, { x: XR, y: 338, text: `to ${W0}: ${steps(C.one.d0)}`, tone: "green", solid: true });
    const dec1 = A6.tag(stage, { x: XR, y: 408, text: `to ${W1}: ${steps(C.one.d1)}`, tone: "grey" });
    const ruleText = `${C.d} apart fixes one flip`;
    const rule = A6.tag(stage, { x: XL, y: 536, text: ruleText, tone: "green", solid: true });
    // repeating a bit three times works, but only one bit in three carries news (Hamming does better: scene 8)
    const RT = A6.RATE.repeat;
    const rate = A6.tag(stage, {
      x: XL + A6.tagW(ruleText) + 36,
      y: 536,
      text: `${RT.sent} copies: ${RT.data} useful bit in ${RT.sent}`,
      tone: "grey",
    });

    const discs = PE.map((e, i) => {
      const m = base.mid(e);
      return A6.disc(stage, { x: m.x, y: m.y, size: 52, text: String(i + 1), tone: "orange" });
    });
    const svg = L5.svg(stage);
    const mA = base.mid(PE[0]);
    const mB = base.mid(PE[1], 0.75);
    const boltA = svg.appendChild(A6.bolt(mA.x + 54, mA.y, 60, "orange"));
    const boltB = svg.appendChild(A6.bolt(mB.x, mB.y + 56, 60, "orange"));
    const tok = A6.token(stage, { tone: "blue", size: 34 });
    stage.insertBefore(tok.el, over.el.nextSibling); // the token passes behind a word, never over its digits
    const rest = (w) => ({ x: base.pt(w).x, y: base.pt(w).y - 50 });

    const tokenAt = (t) => {
      let at = rest(W0);
      for (const [a, b, t0, t1] of LEGS) {
        if (t < t0) break;
        const f = k(t, t0, t1);
        const [p, q] = [rest(a), rest(b)];
        at = { x: lerp(p.x, q.x, f), y: lerp(p.y, q.y, f) };
      }
      return at;
    };
    const tokenLife = (t) => {
      const sp = SPANS.filter((s) => t >= s[0]).pop();
      if (!sp) return { s: 0, o: 0 };
      const pk = popK(ramp(t, sp[0], sp[1], lin));
      return { s: pk.s, o: pk.o * (1 - ramp(t, sp[2], sp[3], lin)) };
    };
    const boltAt = (t, wins) => {
      const w = wins.find(([a, b]) => t >= a && t < b + 0.001);
      if (!w) return { s: 0.3, o: 0 };
      const f = ramp(t, w[0], w[1], lin);
      return { s: 0.5 + 0.6 * E.pop(clamp(f * 2.2)), o: Math.min(1, f * 6) * (1 - ramp(f, 0.65, 1, lin)) };
    };

    // ---------- the cube ----------
    const nodes = (t) => {
      const out = {};
      A6.CUBE_NODES.forEach((w, i) => {
        const pk = A6.seq(t, T.words, 0.05, 0.35, i);
        const st = { s: E.pop(pk), o: clamp(pk * 5), tone: "grey" };
        const bump = (a, b) => 1 + 0.15 * (1 - E.pop(ramp(t, a, b, lin)));
        if (C.words.includes(w) && t >= T.valid) {
          st.tone = "green";
          st.solid = true;
          st.s *= bump(T.valid, T.valid + 0.7);
        }
        if (w === C.one.recv && t >= T.got && t < T.greyWord) {
          st.tone = "red";
          st.s *= bump(T.got, T.got + 0.5);
        }
        if (w === C.two.recv && t >= T.got2) {
          st.tone = "red";
          st.s *= bump(T.got2, T.got2 + 0.5);
        }
        if (w === C.one.fix) {
          st.ring = "green";
          st.ringK = ramp(t, ...T.ring0, lin) * (1 - ramp(t, ...T.reset, lin));
        }
        if (w === C.two.fix && t >= T.ring1[0]) {
          st.ring = "red";
          st.ringK = ramp(t, ...T.ring1, lin);
        }
        out[w] = st;
      });
      return out;
    };
    const edgesGrey = (t) => {
      const out = {};
      A6.CUBE_EDGES.forEach(([a, b], i) => (out[A6.ek(a, b)] = { k: E.out(A6.seq(t, T.edges, 0.04, 0.4, i)) }));
      return out;
    };
    const edgesOver = (t) => {
      const [e1, e2, e3] = PE;
      const run = (leg) => k(t, leg[2], leg[3]); // progress of one token leg
      const ed = (tone, kk, extra) => ({ tone, k: kk, o: 1, ...extra }); // the overlay hides every edge that is not listed
      const out = {};
      if (t < 4.4) out[e1] = ed("orange", t < LEGS[1][2] ? run(LEGS[0]) : 1 - run(LEGS[1]));
      else if (t < 8.2) {
        const o = 1 - ramp(t, ...T.pathOut, lin);
        PE.forEach((e, i) => (out[e] = ed("orange", k(t, T.path[i], T.path[i + 1]), { o, from: P[i] })));
      } else if (t < T.reset[0]) out[e1] = t < LEGS[3][2] ? ed("orange", run(LEGS[2])) : ed("green", 1 - run(LEGS[3]));
      else {
        out[e1] = ed("orange", run(LEGS[4]));
        out[e2] = ed("orange", run(LEGS[5]), { from: P[1] });
        out[e3] = ed("red", run(LEGS[6]), { from: P[2] });
      }
      return out;
    };

    // ---------- the right column ----------
    const recvState = (t) => {
      const second = t >= T.reset[1];
      const swap = second ? T.got2 : T.got;
      const seen = t >= swap;
      const recv = second ? C.two.recv : C.one.recv;
      return {
        text: seen ? `received ${recv}` : `sent ${W0}`,
        tone: seen ? "red" : "blue",
        k: ramp(t, ...(second ? T.sent2 : T.sent), lin),
        o: 1 - (second ? 0 : ramp(t, ...T.reset, lin)),
        s: 1 + 0.12 * flash(t, swap, swap + 0.3),
      };
    };
    const decoders = (t) => {
      const second = t >= T.swap;
      const d = second ? C.two : C.one;
      const kk = second ? ramp(t, T.swap, T.swap + 0.35, lin) : ramp(t, ...T.decoders, lin);
      const o = second ? 1 : 1 - ramp(t, ...T.reset, lin);
      const best = d.d0 < d.d1 ? 0 : 1; // the nearer valid word wears the colour: green when the repair is right, red when it is wrong
      const tone = d.right ? "green" : "red";
      return [d.d0, d.d1].map((n, i) => ({
        text: `to ${C.words[i]}: ${steps(n)}`,
        tone: i === best ? tone : "grey",
        solid: i === best,
        k: kk,
        o,
      }));
    };

    return (t) => {
      base.update({ nodes: nodes(t), edges: edgesGrey(t) });
      over.update({ nodes: {}, edges: edgesOver(t), base: { node: { o: 0 }, edge: { o: 0 } } });

      const { x, y } = tokenAt(t);
      tok.set({ x, y, ...tokenLife(t) });
      const ba = boltAt(t, BOLTS.a);
      const bb = boltAt(t, BOLTS.b);
      V.place(boltA, ba);
      V.place(boltB, bb);

      validTag.set({ k: ramp(t, T.validTag, T.validTag + 0.35, lin) });
      bit0.set({ k: ramp(t, T.bit0, T.bit0 + 0.35, lin) });
      bit1.set({ k: ramp(t, T.bit1, T.bit1 + 0.35, lin) });

      const stepOut = 1 - ramp(t, ...T.stepOut, lin);
      stepTag.set({ k: ramp(t, ...T.stepTag, lin), o: stepOut });
      const pathO = 1 - ramp(t, ...T.pathOut, lin);
      apartTag.set({ k: ramp(t, T.apart, T.apart + 0.35, lin), o: pathO });
      discs.forEach((d, i) => d.set({ k: ramp(t, T.discs[i], T.discs[i] + 0.3, lin), o: pathO }));

      recvTag.set(recvState(t));
      const [d0, d1] = decoders(t);
      dec0.set(d0);
      dec1.set(d1);
      rule.set({ k: ramp(t, ...T.rule, lin) });
      rate.set({ k: ramp(t, ...T.rate, lin) });
    };
  }

  V.scene({
    kicker: "CORRECTING · FIXING A BIT",
    title: ["Valid words must", "stay far apart"],
    dur: 15.2,
    caps: [
      [2.1, 3.7, "One flip is one step."],
      [3.95, 5.65, "Only 000 and 111 are valid words."],
      [6.1, 7.7, "Three steps apart: distance 3."],
      [9.6, 11.2, "Nearest valid word is 000: fixed."],
      [12.1, 13.8, "Two flips lead to the wrong word."],
      [13.9, 15.1, "Repeating works but wastes bits."],
    ],
    build,
  });
})();
