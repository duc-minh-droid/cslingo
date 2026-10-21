/* Lecture 6 · scene 02 (faults): a distributed system is many machines (nodes) talking over a network, and four things go wrong
   (lesson 6.1): a node crashes, a message is lost, a reply is slow, the network splits in two. Four panels build up one by one;
   each fault plays once and its result stays on screen. The split (a partition) is the one scene 3 builds on.
   Story (local seconds): 0.2 panel 1, a message hops to the right node, which turns red with a bolt (1.0); 2.6 panel 2, a message
   dies mid-link under a red cross, a question mark over the node that never heard (3.7); 4.9 panel 3, a message crawls, a clock
   turns one full turn (5.6-7.6); 7.4 panel 4, four nodes in two pairs, the middle link is cut (7.7-8.2) and two dashed groups
   appear (8.4). Nothing moves after 9.0. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { ramp, lerp, ease: E } = V;

  // ---------- layout (stage px) ----------
  const PW = 456;
  const PH = 280;
  const PANEL = [
    { x: 0, y: 0 },
    { x: 480, y: 0 },
    { x: 0, y: 320 },
    { x: 480, y: 320 },
  ];
  const T0 = [0.2, 2.6, 4.9, 7.4]; // when each panel pops in
  if (D6.FAULTS.length !== PANEL.length) throw new Error("faults scene: expected one panel per fault");

  const SZ = 96; // server size in panels 1 to 3
  const SZ4 = 72; // server size in panel 4
  const SERVER_DY = 6; // the server bars sit a little below the nominal centre
  const duo = (p) => ({ l: { x: p.x + 90, y: p.y + 170 }, r: { x: p.x + 370, y: p.y + 170 } });
  const A = PANEL.slice(0, 3).map(duo);
  const LINK = A.map((s) => ({ a: { x: s.l.x + 40, y: s.l.y }, b: { x: s.r.x - 40, y: s.r.y } }));
  const FOUR = [540, 624, 792, 876].map((x) => ({ x, y: PANEL[3].y + 170 }));
  const GROUP = [
    { x: 498, y: 450, w: 168, h: 90 },
    { x: 750, y: 450, w: 168, h: 90 },
  ];

  // a message hops from p to q along y = p.y: the token's centre, kept just clear of both servers
  const lane = (i, f) => D6.along({ x: LINK[i].a.x + 16, y: LINK[i].a.y }, { x: LINK[i].b.x - 20, y: LINK[i].b.y }, f);
  const MID = D6.along(LINK[1].a, LINK[1].b, 0.5);

  // ---------- timeline ----------
  const CRASH = { go: [0.5, 1.0], red: [1.0, 1.25], bolt: 1.0 };
  const LOST = { go: [2.9, 3.45], die: [3.45, 3.65], cross: [3.45, 3.75], q: 3.7 };
  const SLOW = { go: [5.2, 7.6], clock: 5.6, turn: [5.6, 7.6] };
  const SPLIT = { cut: [7.7, 8.2], groups: 8.4 };

  function build(stage) {
    // panels, tags
    const cards = PANEL.map((p) => D6.card(stage, { x: p.x, y: p.y, w: PW, h: PH, plain: true }));
    const tags = PANEL.map((p, i) =>
      D6.tag(stage, { x: p.x + 18, y: p.y + 16, text: D6.FAULTS[i].label, tone: "red" }),
    );
    // links first, so the servers sit on top
    const links = LINK.map((l) => D6.link(stage, { a: l.a, b: l.b, w: 7 }));
    const links4 = [
      D6.link(stage, { a: FOUR[0], b: FOUR[1], w: 7 }),
      D6.link(stage, { a: FOUR[1], b: FOUR[2], w: 7, gap: 60 }),
      D6.link(stage, { a: FOUR[2], b: FOUR[3], w: 7 }),
    ];
    // servers (a green layer, and a red twin of the one that crashes, drawn on top of it)
    const sv = L5.svg(stage);
    const green = (x, y, s) => sv.appendChild(D6.server(x, y, s, "green"));
    const nodes = [green(A[0].l.x, A[0].l.y, SZ), green(A[0].r.x, A[0].r.y, SZ)];
    nodes.push(green(A[1].l.x, A[1].l.y, SZ), green(A[1].r.x, A[1].r.y, SZ));
    nodes.push(green(A[2].l.x, A[2].l.y, SZ), green(A[2].r.x, A[2].r.y, SZ));
    const nodes4 = FOUR.map((q) => green(q.x, q.y, SZ4));
    const dead = sv.appendChild(D6.server(A[0].r.x, A[0].r.y, SZ, "red"));
    // dashed groups after the split
    const groups = GROUP.map((g) => D6.bracket(stage, { ...g, tone: "grey", dash: true }));
    // pictograms, above the servers
    const pg = L5.svg(stage);
    const bolt = pg.appendChild(D6.bolt(A[0].r.x, A[0].r.y + SERVER_DY, 80, "red"));
    const cross = pg.appendChild(L5.cross(MID.x, MID.y, 60, "red"));
    const qmark = pg.appendChild(D6.qmark(A[1].r.x, A[1].r.y - 80, 56, "orange"));
    const clock = pg.appendChild(D6.clock(230, PANEL[2].y + 114, 64, "orange"));
    // small words that define the jargon
    const wNode = D6.label(stage, { x: A[0].l.x - 50, y: A[0].l.y + 56, w: 100, text: "node" });
    const wMsg = D6.label(stage, { x: LINK[0].a.x + 40, y: A[0].l.y + 56, w: 120, text: "message" });
    // messages
    const tk = [0, 1, 2].map(() => D6.token(stage, { tone: "blue", size: 34 }));

    return (t) => {
      // panels, tags, servers and links pop in together
      PANEL.forEach((p, i) => {
        const k = ramp(t, T0[i], T0[i] + 0.4, E.lin);
        const kt = ramp(t, T0[i] + 0.1, T0[i] + 0.5, E.lin);
        const pp = D6.pop(k);
        cards[i].set({ k });
        tags[i].set({ k: kt });
        if (i < 3) {
          links[i].update({ k, o: pp.o });
          V.place(nodes[2 * i], pp);
          V.place(nodes[2 * i + 1], pp);
        } else {
          links4.forEach((l, j) => l.update({ k, o: pp.o, cut: j === 1 ? ramp(t, ...SPLIT.cut, E.lin) : 0 }));
          nodes4.forEach((n) => V.place(n, pp));
        }
      });
      const gk = ramp(t, T0[0] + 0.3, T0[0] + 0.7);
      wNode.set({ k: gk });
      wMsg.set({ k: ramp(t, CRASH.go[0] - 0.1, CRASH.go[0] + 0.3) });

      // 1 CRASH: a message reaches the right node, which turns red under a bolt
      const c1 = ramp(t, ...CRASH.go, E.inOut);
      const p1 = lane(0, c1);
      tk[0].set({ x: p1.x, y: p1.y, o: ramp(t, CRASH.go[0] - 0.05, CRASH.go[0] + 0.1, E.lin) });
      V.place(dead, { o: ramp(t, ...CRASH.red, E.lin) });
      V.place(bolt, D6.pop(ramp(t, CRASH.bolt, CRASH.bolt + 0.45, E.lin)));

      // 2 LOST: a message dies halfway, a question mark over the node that never heard
      const p2 = lane(1, 0);
      const p2m = { x: lerp(p2.x, MID.x, ramp(t, ...LOST.go, E.inOut)), y: MID.y };
      const die = ramp(t, ...LOST.die, E.in);
      tk[1].set({
        x: p2m.x,
        y: p2m.y,
        s: 1 - die,
        o: ramp(t, LOST.go[0] - 0.05, LOST.go[0] + 0.1, E.lin) * (die < 1 ? 1 : 0),
      });
      L5.drawOn(cross, ramp(t, ...LOST.cross, E.lin));
      V.place(cross, { o: ramp(t, LOST.cross[0], LOST.cross[0] + 0.1, E.lin) });
      const qk = ramp(t, LOST.q, LOST.q + 0.45, E.lin);
      L5.drawOn(qmark, ramp(t, LOST.q, LOST.q + 0.4, E.lin));
      V.place(qmark, D6.pop(qk));

      // 3 SLOW: a message crawls a short way, a clock turns one full turn
      const p3 = lane(2, 0.4 * ramp(t, ...SLOW.go, E.lin));
      tk[2].set({ x: p3.x, y: p3.y, o: ramp(t, SLOW.go[0] - 0.05, SLOW.go[0] + 0.1, E.lin) });
      D6.clockHand(clock, ramp(t, ...SLOW.turn, E.lin));
      V.place(clock, D6.pop(ramp(t, SLOW.clock, SLOW.clock + 0.4, E.lin)));

      // 4 SPLIT: the middle link is cut, two groups remain
      groups.forEach((g, i) => g.set({ k: ramp(t, SPLIT.groups + i * 0.1, SPLIT.groups + i * 0.1 + 0.4) }));
    };
  }

  V.scene({
    kicker: "THINGS GO WRONG",
    title: ["Distributed systems", "fail in four ways"],
    dur: 10,
    caps: [
      [0.7, 2.2, "A node can crash."],
      [3.5, 5.0, "A message can get lost."],
      [5.9, 7.4, "A reply can arrive late."],
      [8.1, 9.9, "The network can split in two."],
    ],
    build,
  });
})();
