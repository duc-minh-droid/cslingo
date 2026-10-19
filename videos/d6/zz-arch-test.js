/* THROW-AWAY architect test: static final frames of the planned layouts. Deleted after the architect step. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { ease: E } = V;

  const mk = (kicker, title, build) =>
    V.scene({ kicker, title, dur: 4, caps: [[0.4, 3.5, "A caption for the layout test."]], build });

  // 2. faults
  mk("THINGS GO WRONG", ["Distributed systems", "fail in four ways"], (stage) => {
    const P = [
      [0, 0, "node crashes"],
      [480, 0, "message lost"],
      [0, 320, "reply slow"],
      [480, 320, "network split"],
    ];
    P.forEach(([x, y, t]) => {
      D6.card(stage, { x, y, w: 456, h: 280, plain: true, tone: "grey", text: "" }).set({});
      D6.tag(stage, { x: x + 18, y: y + 16, text: t, tone: "grey" }).set({});
    });
    const svg = L5.svg(stage);
    // crash
    const sv = (x, y, tone) => svg.appendChild(D6.server(x, y, 96, tone));
    const lk = (x1, x2, y, tone, cut) => {
      const l = D6.link(stage, { a: { x: x1, y }, b: { x: x2, y }, w: 7, gap: 60 });
      l.update({ tone, cut });
    };
    lk(130, 330, 170, "grey", 0);
    sv(90, 170, "green");
    sv(370, 170, "red");
    svg.appendChild(D6.bolt(370, 170, 80, "red"));
    lk(610, 810, 170, "grey", 0);
    sv(570, 170, "green");
    sv(850, 170, "grey");
    svg.appendChild(L5.cross(710, 170, 60, "red", { w: 9 }));
    svg.appendChild(D6.qmark(850, 90, 56, "orange"));
    lk(130, 330, 490, "grey", 0);
    sv(90, 490, "green");
    sv(370, 490, "grey");
    const ck = svg.appendChild(D6.clock(230, 440, 64, "orange"));
    D6.clockHand(ck, 0.6);
    lk(540, 640, 490, "grey", 0);
    lk(740, 840, 490, "grey", 0);
    D6.link(stage, { a: { x: 640, y: 490 }, b: { x: 740, y: 490 }, w: 7, gap: 60 }).update({ cut: 1 });
    [530, 640, 740, 850].forEach((x) => sv(x, 490, "green"));
    return () => {};
  });

  // 3. CAP
  mk("THE CAP THEOREM", ["A cut network", "forces a choice"], (stage) => {
    const lk = D6.link(stage, { a: { x: 350, y: 105 }, b: { x: 586, y: 105 }, w: 8, gap: 84 });
    lk.update({ cut: 1 });
    const A = D6.box(stage, { x: 150, y: 20, w: 200, h: 170, name: "Node A" });
    const B = D6.box(stage, { x: 586, y: 20, w: 200, h: 170, name: "Node B" });
    A.set({ value: 35, tone: "green", sub: "latest" });
    B.set({ value: 40, tone: "orange", sub: "old" });
    D6.tag(stage, { x: 388, y: 130, text: "partition", tone: "red", solid: true }).set({});
    D6.packet(stage, { tone: "blue", text: "sell 5" }).set({ x: 74, y: 105 });
    D6.packet(stage, { tone: "blue", text: "read" }).set({ x: 862, y: 105 });
    [
      [0, "stay consistent", "error", "red", "C", "consistent", true, "A", "available", false],
      [492, "stay available", "40", "orange", "C", "consistent", false, "A", "available", true],
    ].forEach(([x, title, reply, tone, c, cw, cok, a, aw, aok]) => {
      D6.card(stage, { x, y: 310, w: 444, h: 290, plain: true, tone: "grey", text: "" }).set({});
      D6.tag(stage, { x: x + 20, y: 326, text: title, tone: "purple" }).set({});
      D6.disc(stage, { x: x + 80, y: 440, size: 64, text: "B", tone: "grey" }).set({});
      const svg = L5.svg(stage);
      svg.appendChild(L5.arrow(x + 124, 440, x + 214, 440, "grey", 1, { w: 6, head: 18 }));
      D6.packet(stage, { tone, text: reply, fs: 40 }).set({ x: x + 320, y: 440 });
      [
        [c, cw, cok, 16],
        [a, aw, aok, 226],
      ].forEach(([l, w, ok, dx]) => {
        D6.chip(stage, {
          x: x + dx,
          y: 506,
          w: 200,
          h: 64,
          text: w,
          tone: ok ? "green" : "red",
          fs: 28,
          radius: 20,
        }).set({ solid: false });
        svg.appendChild(
          ok ? L5.tick(x + dx + 176, 538, 30, "green", { w: 6 }) : L5.cross(x + dx + 176, 538, 30, "red", { w: 6 }),
        );
      });
    });
    return () => {};
  });

  // 4. atomic
  mk("ACID · ATOMIC", ["A transaction is", "all or nothing"], (stage) => {
    [
      [0, "no transaction", "grey", D6.BANK.plain, false],
      [480, "one transaction", "purple", D6.BANK.atomic, true],
    ].forEach(([x, title, tone, r, tx]) => {
      D6.card(stage, { x, y: 0, w: 456, h: 560, plain: true, tone: "grey", text: "" }).set({});
      D6.tag(stage, { x: x + 20, y: 16, text: title, tone }).set({});
      D6.box(stage, { x: x + 20, y: 90, w: 150, h: 140, name: "Asha" }).set({
        value: `£${r.asha}`,
        vfs: 48,
        tone: r.asha === 100 ? "orange" : "green",
      });
      D6.box(stage, { x: x + 286, y: 90, w: 150, h: 140, name: "Ben" }).set({
        value: `£${r.ben}`,
        vfs: 48,
        tone: "grey",
      });
      const svg = L5.svg(stage);
      svg.appendChild(L5.arrow(x + 180, 165, x + 276, 165, "grey", 1, { w: 6, head: 18 }));
      svg.appendChild(D6.bolt(x + 228, 96, 70, "red"));
      if (tx) D6.bracket(stage, { x: x + 8, y: 248, w: 440, h: 80, tone: "purple" }).set({});
      D6.chip(stage, {
        x: x + 20,
        y: 258,
        w: 150,
        h: 60,
        text: tx ? "undone" : "1 debit",
        tone: tx ? "orange" : "green",
        fs: 28,
        radius: 20,
      }).set({});
      D6.chip(stage, {
        x: x + 286,
        y: 258,
        w: 150,
        h: 60,
        text: "2 credit",
        tone: tx ? "grey" : "red",
        fs: 28,
        radius: 20,
      }).set({});
      D6.stat(stage, { x: x + 28, y: 352, w: 400, h: 80, label: "total", tone: tx ? "green" : "red" }).set({
        text: `£${r.total}`,
      });
      const b = L5.badge(stage, { x: x + 28, y: 460, w: 400, h: 68, valid: "all or nothing", invalid: "£30 vanished" });
      b(tx ? "valid" : "invalid", 1);
    });
    return () => {};
  });

  // 5. isolation (+ ACID)
  mk("ACID · ISOLATION", ["Isolation keeps", "payments apart"], (stage) => {
    D6.stat(stage, { x: 0, y: 0, w: 330, h: 80, label: "balance", tone: "red" }).set({ text: "£70" });
    D6.tag(stage, { x: 360, y: 11, text: "at the same moment", tone: "grey" }).set({});
    const tl = D6.timeline(stage, {
      x: 0,
      y: 110,
      w: 936,
      T: D6.ISO.T,
      lanes: ["Shopper X", "Shopper Y"],
      laneH: 92,
      labelW: 190,
      axis: false,
    });
    tl.set({});
    D6.ISO.mixed.ops.forEach((o) => {
      tl.bar({
        lane: o.who === "X" ? 0 : 1,
        s: o.s,
        e: o.e,
        text: `${o.kind} ${o.val}`,
        tone: o.kind === "read" ? "blue" : "purple",
      }).set({});
    });
    L5.badge(stage, { x: 0, y: 330, w: 460, h: 68, valid: "both counted", invalid: "one payment lost" })("invalid", 1);
    D6.ACID.forEach((a, i) => {
      const [x, y] = [(i % 2) * 480, 430 + Math.floor(i / 2) * 100];
      D6.card(stage, { x, y, w: 456, h: 84, plain: true, tone: "purple", text: "" }).set({});
      D6.disc(stage, { x: x + 52, y: y + 42, size: 60, text: a.k, tone: "purple" }).set({});
      D6.label(stage, { x: x + 100, y: y + 6, w: 340, text: a.word, tone: "purple", align: "left", bold: true }).set(
        {},
      );
      D6.label(stage, { x: x + 100, y: y + 42, w: 340, text: a.line, align: "left" }).set({});
    });
    return () => {};
  });

  // 6. eventual
  mk("EVENTUAL CONSISTENCY", ["Replicas disagree,", "then converge"], (stage) => {
    const xs = [12, 358, 704];
    const bx = xs.map((x, i) => D6.box(stage, { x, y: 40, w: 220, h: 170, name: `R${i + 1}`, icon: "server" }));
    const v = D6.EV.vals(3);
    bx.forEach((b, i) =>
      b.set({ value: v[i], tone: v[i] === 35 ? "green" : "orange", sub: v[i] === 35 ? "latest" : "old" }),
    );
    D6.packet(stage, { tone: "blue", text: "35" }).set({ x: 293, y: 125 });
    D6.stat(stage, { x: 12, y: 300, w: 250, h: 80, label: "tick", tone: "blue" }).set({ text: "3" });
    D6.tag(stage, { x: 340, y: 240, text: "replicas updated", tone: "green" }).set({});
    D6.stepPlot(stage, { x: 340, y: 310, w: 320, h: 190, counts: D6.EV.counts, xLabel: "" }).set({ tick: 3.0 });
    D6.packet(stage, { tone: "blue", text: "read" }).set({ x: 814, y: 310 });
    D6.packet(stage, { tone: "orange", text: "40" }).set({ x: 814, y: 380 });
    D6.tag(stage, { x: 720, y: 430, text: "stale read", tone: "orange", solid: true }).set({});
    return () => {};
  });

  // 7. linearizable
  mk("LINEARIZABILITY", ["Linearizable: act", "like one copy"], (stage) => {
    D6.tag(stage, { x: 0, y: 0, text: "x = one copy", tone: "blue" }).set({});
    const tl = D6.timeline(stage, { x: 0, y: 110, w: 936, T: D6.LIN.T, lanes: D6.LIN.lanes, laneH: 92, labelW: 170 });
    tl.set({});
    const c = D6.LIN.good.check;
    tl.zone({ s: 0, e: c.flip, tone: "grey", text: "x = 0" }).set({});
    tl.zone({ s: c.flip, e: D6.LIN.T, tone: "green", text: "x = 1" }).set({});
    tl.bar({ lane: 2, s: D6.LIN.w.s, e: D6.LIN.w.e, text: "write 1", tone: "purple" }).set({ solid: true });
    D6.LIN.good.reads.forEach((r) =>
      tl.bar({ lane: r.c, s: r.s, e: r.e, text: `read ${r.v}`, tone: r.v ? "green" : "blue" }).set({}),
    );
    tl.flip().set({ t: c.flip });
    L5.badge(stage, { x: 0, y: 470, w: 400, h: 68, valid: "linearizable", invalid: "not linearizable" })("valid", 1);
    return () => {};
  });
  mk("LINEARIZABILITY", ["Linearizable: act", "like one copy"], (stage) => {
    const tl = D6.timeline(stage, { x: 0, y: 110, w: 936, T: D6.LIN.T, lanes: D6.LIN.lanes, laneH: 92, labelW: 170 });
    tl.set({});
    tl.bar({ lane: 2, s: D6.LIN.w.s, e: D6.LIN.w.e, text: "write 1", tone: "purple" }).set({ solid: true });
    D6.LIN.bad.reads.forEach((r) =>
      tl
        .bar({ lane: r.c, s: r.s, e: r.e, text: `read ${r.v}`, tone: r.v ? "green" : "red" })
        .set({ ring: r.v ? null : "red" }),
    );
    tl.range({ s: D6.LIN.w.s, e: D6.LIN.bad.check.hi, row: 1, tone: "green", text: "flip before 7" }).set({});
    tl.range({ s: D6.LIN.bad.check.lo, e: D6.LIN.w.e, row: 2, tone: "red", text: "after 8" }).set({});
    L5.badge(stage, { x: 0, y: 520, w: 440, h: 68, valid: "linearizable", invalid: "not linearizable" })("invalid", 1);
    return () => {};
  });

  // 8. price
  mk("THE PRICE OF AGREEMENT", ["One copy of the truth", "costs waiting"], (stage) => {
    const svg = L5.svg(stage);
    svg.appendChild(D6.person(74, 100, 84, "blue"));
    svg.appendChild(D6.person(862, 100, 84, "blue"));
    D6.label(stage, { x: 14, y: 150, w: 120, text: "Mia" }).set({});
    D6.label(stage, { x: 802, y: 150, w: 120, text: "Omar" }).set({});
    D6.link(stage, { a: { x: 350, y: 105 }, b: { x: 586, y: 105 }, w: 8 }).update({});
    const L = D6.box(stage, { x: 140, y: 20, w: 210, h: 170, name: "London" });
    const R = D6.box(stage, { x: 586, y: 20, w: 210, h: 170, name: "Leeds" });
    L.set({ value: "Mia", vfs: 48, tone: "green", sub: "seat 14C" });
    R.set({ value: "Mia", vfs: 48, tone: "green", sub: "seat 14C" });
    D6.packet(stage, { tone: "purple", text: "taken?" }).set({ x: 440, y: 105 });
    D6.tag(stage, { x: 360, y: 215, text: "Omar refused", tone: "red", solid: true }).set({});
    D6.meter(stage, {
      x: 12,
      y: 330,
      w: 900,
      label: "answer from the local copy",
      max: 62,
      unit: "ms",
      tone: "green",
    }).set({ v: 2 });
    D6.meter(stage, {
      x: 12,
      y: 450,
      w: 900,
      label: "ask the other site first (30 ms each way)",
      max: 62,
      unit: "ms",
      tone: "orange",
    }).set({ v: 62 });
    return () => {};
  });

  // 9. commit fails
  mk("CONSENSUS", ["Many nodes must", "agree on one answer"], (stage) => {
    D6.card(stage, { x: 12, y: 0, w: 280, h: 80, plain: true, tone: "grey", text: "leader election" }).set({});
    D6.card(stage, { x: 310, y: 0, w: 280, h: 80, plain: true, tone: "purple", text: "atomic commit" }).set({});
    [0, 1, 2].forEach((i) =>
      D6.link(stage, { a: { x: 468, y: 250 }, b: { x: 122 + i * 346, y: 380 }, w: 6 }).update({}),
    );
    D6.box(stage, { x: 358, y: 120, w: 220, h: 130, name: "Coordinator", tone: "purple" }).set({
      value: "commit",
      vfs: 40,
      tone: "purple",
    });
    ["committed", "conflict", "no message"].forEach((s, i) =>
      D6.box(stage, { x: 12 + i * 346, y: 380, w: 220, h: 160, name: D6.DB[i], icon: "db" }).set({
        value: s,
        vfs: 34,
        tone: i ? "red" : "green",
      }),
    );
    D6.tag(stage, { x: 300, y: 566, text: "1 of 3 committed", tone: "red", solid: true }).set({});
    return () => {};
  });

  // 10. two-phase commit
  mk("TWO-PHASE COMMIT", ["Ask first,", "then decide once"], (stage) => {
    [0, 1, 2].forEach((i) =>
      D6.link(stage, { a: { x: 468, y: 150 }, b: { x: 122 + i * 346, y: 330 }, w: 6 }).update({}),
    );
    D6.box(stage, { x: 358, y: 10, w: 220, h: 140, name: "Coordinator" }).set({
      value: "abort",
      vfs: 44,
      tone: "orange",
    });
    ["yes", "yes", "no"].forEach((s, i) =>
      D6.box(stage, { x: 12 + i * 346, y: 330, w: 220, h: 170, name: D6.DB[i], icon: "db" }).set({
        value: i === 2 ? "no" : "yes",
        vfs: 52,
        tone: i === 2 ? "red" : "green",
        mark: i === 2 ? "cross" : "lock",
        sub: "aborted",
      }),
    );
    D6.packet(stage, { tone: "purple", text: "prepare" }).set({ x: 300, y: 240 });
    D6.tag(stage, { x: 12, y: 560, text: "all yes: commit", tone: "green" }).set({});
    D6.tag(stage, { x: 300, y: 560, text: "any no: abort", tone: "orange", solid: true }).set({});
    D6.tag(stage, { x: 600, y: 560, text: "all agree", tone: "green", solid: true }).set({});
    return () => {};
  });

  // recap placeholder check of the stat/pop helpers
  V.scene({
    bare: true,
    dur: 2,
    build() {
      return () => {};
    },
  });
  void E;
})();
