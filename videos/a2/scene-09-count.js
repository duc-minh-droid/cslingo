/* Algorithms phase 2 (algo-2), scene 09: when a road breaks, gossip can loop (count to infinity), and poisoned reverse stops it.
   Line A - B - C, every road costs 1, destination C. A reaches C through B (2), B reaches it directly (1). The B-C road breaks:
   B still remembers A's old "C: 2", installs "C: 3 via A", tells A (A: 4), A tells B (B: 5) ... until RIP's 16 = unreachable.
   With poisoned reverse A has always told B "C: infinity" (its route goes through B), so after the cut B has no way in and both
   agree at once. The switch between the two stories is announced: the red state drains, a purple "same story again" tag with a
   rewind sign shows, then the green beliefs return and A's "C: infinity" leaves. The tag then says what poisoned reverse can do
   (it stops loops between TWO routers). Every number comes from A2.CTI / A2.ctiAt / A2.CTI_POISON / A2.poisonAt and the road costs. */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;
  const { pop, fade, lin, io, bump, curve } = A2;
  const INF = A2.INF;
  const CAP = A2.CTI.cap;
  const MSGS = A2.CTI.msgs;

  // ---------- the figure: a line of three routers, every road costs 1 ----------
  const POS = { A: [140, 230], B: [468, 230], C: [796, 230] };
  const ROADS = [["A", "B", 1], ["B", "C", 1]]; // prettier-ignore
  const DIRECT = ROADS[1][2]; // what B pays to reach C directly
  const NAMES = ["A", "B", "C"];
  const BUBBLE_Y = 160;
  const [RULER_X, RULER_Y, UNIT] = [52, 470, 52]; // 16 units of 52 px fill the stage width
  const TAG_Y = 330;
  const PRE = { A: A2.ctiAt(0).A, B: { d: DIRECT, via: null } }; // beliefs before the cut

  // ---------- data checks (the numbers of the storyboard) ----------
  A2.need(CAP === 16 && MSGS.length === 15, "scene 9: RIP infinity is 16 and the loop takes 15 messages");
  A2.need(PRE.A.d === ROADS[0][2] + DIRECT && PRE.A.via === "B", "scene 9: A reaches C through B at cost 2");
  A2.need(MSGS[0].stale && MSGS[0].from === "A" && MSGS[0].says === PRE.A.d, "scene 9: message 1 is A's old 'C: 2'");
  A2.need(A2.ctiAt(1).B.d === 3 && A2.ctiAt(1).B.via === "A", "scene 9: B installs C: 3 via A");
  A2.need(A2.ctiAt(2).A.d === 4 && A2.ctiAt(6).A.d === 8 && A2.ctiAt(13).B.d === 15, "scene 9: the count creeps up");
  A2.need(A2.ctiAt(14).A.d === INF && A2.ctiAt(15).B.d === INF, "scene 9: both give up at 16");
  A2.need(
    A2.poisonAt(0).A.d === 2 && A2.poisonAt(0).A.via === "B" && A2.poisonAt(0).B.d === INF,
    "scene 9: poison, after the cut",
  );
  A2.need(A2.poisonAt(1).A.d === INF && A2.poisonAt(1).B.d === INF, "scene 9: poison, agreed at once");
  A2.need(A2.CTI_POISON.msgs.length === 1 && A2.CTI_POISON.msgs[0].says === INF, "scene 9: one message, C: infinity");

  // ---------- timeline (local seconds) ----------
  const T = {
    node0: 0.2, // node i pops at node0 + 0.15 i
    tagA: 1.0,
    tagB: 1.2,
    ruler: 1.4,
    normal: 1.8, // B tells A "C: 1" in normal times
    cut1: 2.8,
    msg0: 3.65, // the slow messages: one every 0.8 s, 0.55 s on the way
    fast0: 6.8, // the fast forward: 11 messages that speed up from 0.30 s to 0.10 s a hop
    rip: 8.6,
    packet0: 4.6, // the looping packet: one hop per 0.5 s
    dropped: 9.0,
    mend: 9.5, // the reset starts: the road mends, the red cost drains, the looping packet goes
    rewind: 9.7, // the tag "same story again" with a rewind sign
    tagsBack: 10.3, // the green beliefs return (after the red has gone)
    poison: 11.0, // A tells B "C: infinity"; the tag now names the cure
    cut2: 11.9,
    bGives: 12.4, // B has no way in
    back: 12.7, // B tells A
    agree: 13.4,
  };
  const SLOW = 4; // messages 1..4 are slow
  const LAND = {}; // message k lands at LAND[k]
  const BUB = [{ t0: T.normal, dur: 0.6, from: "B", to: "A", text: `C: ${A2.fmt(DIRECT)}`, tone: "blue", long: true }];
  let at = T.msg0;
  MSGS.forEach((m) => {
    const i = m.k - SLOW - 1; // fast message index
    const dur = m.k <= SLOW ? 0.55 : 0.3 - 0.02 * i;
    if (m.k > SLOW && i === 0) at = T.fast0;
    else if (m.k <= SLOW && m.k > 1) at += 0.8 - 0.55; // gap between slow messages
    BUB.push({
      t0: at,
      dur,
      from: m.from,
      to: m.to,
      text: `C: ${A2.fmt(m.says)}`,
      tone: "blue",
      long: m.k <= SLOW,
      k: m.k,
    });
    LAND[m.k] = at + dur;
    at += dur;
  });
  A2.need(Math.abs(LAND[MSGS.length] - T.dropped) < 1e-6, "scene 9: the loop ends at 9.0 s");
  BUB.push(
    { t0: T.poison, dur: 0.7, from: "A", to: "B", text: `C: ${A2.fmt(INF)}`, tone: "purple", long: true },
    {
      t0: T.back,
      dur: 0.6,
      from: "B",
      to: "A",
      text: `C: ${A2.fmt(A2.CTI_POISON.msgs[0].says)}`,
      tone: "red",
      long: true,
    },
  );
  BUB.forEach((b, i) => {
    b.joined = BUB[i - 1] && Math.abs(BUB[i - 1].t0 + BUB[i - 1].dur - b.t0) < 1e-6; // starts right after the previous one
    b.joinsNext = BUB[i + 1] && Math.abs(b.t0 + b.dur - BUB[i + 1].t0) < 1e-6;
  });
  const lastLand = (t, to) => MSGS.filter((m) => m.to === to && LAND[m.k] <= t).pop();

  // the ruler value (the cost the latest message made), as a schedule
  const val = (d) => (d === INF ? CAP : d);
  const RULER = [[T.ruler, 0], [T.ruler + 0.4, PRE.A.d]]; // prettier-ignore
  MSGS.forEach((m) => {
    const prev = m.k === 1 ? PRE.A.d : val(MSGS[m.k - 2].dist);
    const last = RULER[RULER.length - 1][0];
    const start = BUB.find((b) => b.k === m.k).t0;
    if (start > last + 1e-6) RULER.push([start, prev]);
    RULER.push([LAND[m.k], val(m.dist)]);
  });
  RULER.push([T.mend, CAP], [T.mend + 0.6, 0], [T.tagsBack + 0.1, 0], [T.tagsBack + 0.5, PRE.A.d], [T.back + 0.6, PRE.A.d], [T.back + 1.0, CAP]); // prettier-ignore

  const str = (s) => `C: ${A2.fmt(s.d)}${s.via ? ` via ${s.via}` : ""}`;

  // what each router believes about C at time t
  function beliefs(t) {
    const green = { tone: "green", strike: 0, pulse: 0 };
    if (t < T.mend) {
      const n = MSGS.filter((m) => LAND[m.k] <= t).length;
      const st = A2.ctiAt(n);
      const pulse = (to) => (lastLand(t, to) ? bump(t, LAND[lastLand(t, to).k], 0.3) : 0);
      return {
        A: n >= 2 ? { text: str(st.A), tone: "red", strike: 0, pulse: pulse("A") } : { text: str(PRE.A), ...green, pulse: bump(t, T.normal + 0.6, 0.4) },
        B: n >= 1 ? { text: str(st.B), tone: "red", strike: 0, pulse: pulse("B") } : { text: str(PRE.B), ...green, strike: lin(t, 3.2, 3.6) },
      }; // prettier-ignore
    }
    const after = A2.poisonAt(1);
    const cut = A2.poisonAt(0);
    return {
      A: t >= T.back + 0.6 ? { text: str(after.A), tone: "red", strike: 0, pulse: bump(t, T.back + 0.6, 0.35) } : { text: str(PRE.A), ...green, pulse: Math.max(bump(t, T.tagsBack, 0.35), bump(t, T.poison, 0.45)) },
      B: t >= T.bGives ? { text: str(cut.B), tone: "red", strike: 0, pulse: bump(t, T.bGives, 0.35) } : { text: str(PRE.B), ...green, strike: lin(t, T.cut2 + 0.2, T.cut2 + 0.4), pulse: bump(t, T.tagsBack, 0.35) },
    }; // prettier-ignore
  }

  V.scene({
    kicker: "BAD NEWS",
    title: ["When a road breaks,", "the gossip can loop"],
    dur: 15,
    caps: [
      [0.4, 3.0, "A reaches C through B. B reaches C directly."],
      [3.0, 6.6, "The B to C road breaks. B hears A's old news."],
      [6.8, 9.6, "The cost creeps up, one step at a time."],
      [9.7, 10.9, "Same story again, with one change."],
      [11.0, 14.4, "Poisoned reverse: A says C is unreachable, because its route goes through B."],
    ],
    build(stage) {
      const G = A2.graph(stage, { nodes: POS, edges: ROADS });
      const belief = {
        A: A2.tag(stage, { x: POS.A[0], y: TAG_Y, text: str(PRE.A), tone: "green" }),
        B: A2.tag(stage, { x: POS.B[0], y: TAG_Y, text: str(PRE.B), tone: "green" }),
      };
      const msg = A2.tag(stage, { x: POS.A[0], y: BUBBLE_Y, text: "", tone: "blue", solid: true });
      const packetX = [POS.A[0] + G.r + 30, POS.B[0] - G.r - 30];
      const packet = A2.token(stage, { size: 44, tone: "blue", text: "C", fs: 28 });
      // the ruler: an empty track with a mark for every unit, then the bar that fills it
      const track = L5.svg(stage);
      track.append(
        V.s("rect", { x: RULER_X, y: RULER_Y, width: CAP * UNIT, height: 44, rx: 13, "stroke-width": 3, style: { fill: "var(--panel-2)", stroke: "var(--line)" } }),
        ...Array.from({ length: CAP - 1 }, (_, i) =>
          V.s("path", { d: `M${RULER_X + (i + 1) * UNIT} ${RULER_Y + 28}v12`, "stroke-width": 3, "stroke-linecap": "round", style: { stroke: "var(--line)" } }),
        ),
      ); // prettier-ignore
      const bar = A2.bar(stage, { x: RULER_X, y: RULER_Y, unit: UNIT, segs: [{ v: CAP, tone: "red", text: "" }] });
      const costLabel = A2.tag(stage, { x: 175, y: 440, text: "latest cost of C", tone: "grey" });
      const rip = A2.tag(stage, { x: 700, y: 552, text: `count of ${CAP} = unreachable`, tone: "red" });
      const poison = A2.tag(stage, { x: POS.B[0], y: 48, text: "poisoned reverse: two-router loops", tone: "purple" });
      const note = A2.tag(stage, { x: POS.B[0], y: 106, text: `A says C: ${A2.fmt(INF)}`, tone: "purple" }); // what B remembers
      // the rewind cue: a sign (two triangles pointing back) and a tag
      const rewind = A2.tag(stage, { x: 496, y: 48, text: "same story again", tone: "purple" });
      const sign = V.s("g", {});
      const vio = L5.tone("purple");
      [0, 1].forEach((i) => {
        const x = 318 + 18 * i;
        const tri = V.s("path", {
          d: `M${x + 12} 36L${x - 8} 48L${x + 12} 60Z`,
          "stroke-width": 3,
          "stroke-linejoin": "round",
        });
        tri.style.fill = vio.c;
        tri.style.stroke = vio.lip;
        sign.append(tri);
      });
      const agreed = A2.tag(stage, { x: 500, y: 596, text: "agreed at once", tone: "green", solid: true });
      const svg = L5.svg(stage);
      const tick = L5.tick(332, 596, 52, "green");
      svg.append(tick, sign);

      return (t) => {
        // ---- the routers and the roads ----
        const bubble = BUB.find((b) => t >= b.t0 && t < b.t0 + b.dur);
        const speaking = BUB.find((b) => b.long && t >= b.t0 && t < b.t0 + b.dur + 0.15);
        const nodes = {};
        NAMES.forEach((n, i) => {
          const a = T.node0 + 0.15 * i;
          let st = n === "C" ? { look: "solid", tone: "orange" } : { look: "grey" };
          if (speaking && speaking.from === n) st = { look: "soft", tone: speaking.tone };
          nodes[n] = { ...st, s: 0.8 + 0.2 * pop(t, a), o: fade(t, a) };
        });
        const cut = io(t, T.cut1, T.cut1 + 0.6) - io(t, T.mend, T.mend + 0.5) + io(t, T.cut2, T.cut2 + 0.6);
        const edges = {
          "A-B": { tone: null, k: lin(t, 0.65, 1.05), pk: lin(t, 1.0, 1.4) },
          "B-C":
            cut > 0.001 ? { tone: "red", k: 1, cut, pk: 1 } : { tone: null, k: lin(t, 0.8, 1.2), pk: lin(t, 1.1, 1.5) },
        };
        G.update({ nodes, edges });

        // ---- what A and B believe about C ----
        V.place(track, { o: fade(t, T.ruler, 0.3) });
        const bl = beliefs(t);
        // the beliefs go out while the red state drains, and come back (green) once it has gone
        const bo = 1 - lin(t, T.mend - 0.2, T.mend + 0.1) + lin(t, T.tagsBack, T.tagsBack + 0.25);
        NAMES.slice(0, 2).forEach((n, i) => {
          const a = i ? T.tagB : T.tagA;
          const b = bl[n];
          belief[n].set({
            text: b.text,
            tone: b.tone,
            strike: b.strike,
            s: (0.8 + 0.2 * pop(t, a)) * (1 + 0.15 * b.pulse),
            o: fade(t, a, 0.2) * bo,
          });
        });

        // ---- the message on its way (above the roads) ----
        if (bubble) {
          const k = (t - bubble.t0) / bubble.dur;
          const x0 = POS[bubble.from][0];
          const x1 = POS[bubble.to][0];
          const o = Math.min(
            bubble.joined ? 1 : lin(k * bubble.dur, 0, 0.1),
            bubble.joinsNext ? 1 : lin((1 - k) * bubble.dur, 0, 0.1),
          );
          msg.set({
            x: x0 + (x1 - x0) * V.ease.inOut(k),
            text: bubble.text,
            tone: bubble.tone,
            solid: true,
            s: 0.85 + 0.15 * (bubble.joined ? 1 : pop(t, bubble.t0, 0.25)),
            o,
          });
        } else msg.set({ o: 0 });

        // ---- the packet that loops while the cost counts up ----
        const hop = A2.stepAt(t, T.packet0, 0.5, 9);
        const x0 = packetX[hop.i % 2];
        const x1 = packetX[(hop.i + 1) % 2];
        packet.set({
          x: x0 + (x1 - x0) * V.ease.inOut(hop.k),
          y: POS.A[1] + 48, // below the road, clear of its cost pill
          tone: t >= T.dropped ? "red" : "blue",
          s: 0.7 + 0.3 * pop(t, T.packet0, 0.3),
          o: Math.min(fade(t, T.packet0, 0.15), 1 - lin(t, T.mend, T.mend + 0.4)),
        });

        // ---- the ruler of the cost of C ----
        const v = curve(t, RULER);
        const red = (t >= T.msg0 && t < T.mend + 0.6) || t >= T.back + 0.6;
        bar.update({ k: v / CAP, tones: [red ? "red" : "green"] });
        costLabel.set({ s: 0.8 + 0.2 * pop(t, T.ruler), o: fade(t, T.ruler, 0.2) });
        rip.set({ s: 0.8 + 0.2 * pop(t, T.rip), o: Math.min(fade(t, T.rip, 0.2), 1 - lin(t, T.mend, T.mend + 0.4)) });

        // ---- the cure ----
        const rw = fade(t, T.rewind, 0.2) * (1 - lin(t, T.poison - 0.2, T.poison + 0.05));
        rewind.set({ s: 0.8 + 0.2 * pop(t, T.rewind), o: rw });
        V.place(sign, {
          s: 0.8 + 0.2 * pop(t, T.rewind),
          o: rw,
          x: -8 * Math.sin(lin(t, T.rewind, T.poison) * Math.PI * 3),
        });
        poison.set({ s: 0.8 + 0.2 * pop(t, T.poison + 0.05), o: fade(t, T.poison + 0.05, 0.2) });
        note.set({ s: 0.8 + 0.2 * pop(t, T.poison + 0.7), o: fade(t, T.poison + 0.7, 0.2) });
        agreed.set({ s: 0.8 + 0.2 * pop(t, T.agree), o: fade(t, T.agree, 0.2) });
        L5.drawOn(tick, lin(t, T.agree + 0.15, T.agree + 0.55));
        V.place(tick, { s: 0.7 + 0.3 * pop(t, T.agree + 0.15), o: lin(t, T.agree + 0.15, T.agree + 0.55) > 0 ? 1 : 0 });
      };
    },
  });
})();
