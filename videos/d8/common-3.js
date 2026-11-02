/* Lecture 8 · Stream processing: THE STORIES and THE FLOW RIG (VID.d8, short name D8). First the three scripted message stories
   D8.OFFLINE, D8.SHARE and D8.ACKS (documented in common.js, section 7) are simulated with D8.sim and asserted; then the rig:
   producers on the left, the broker in the middle, consumers on the right, and every message of an event log drawn at time t. Needs l5/common.js, d4/common*.js, d8/common.js and
   common-2.js first. Same rules: pure, stage pixels (936 x 640), the video's colour roles.

   const fl = D8.flow(stage, log, {box: {y: 0, h: 640}, prodNames, consNames, brokerName: "Broker", prodIcon: "phone",
                                   consIcon: "server", slots: 4, chipsPer: 4, ackText: "ack"});
     log      a D8.sim log (D8.OFFLINE.direct / .broker, D8.SHARE.lb / .fan, D8.ACKS): the number of producers and consumers and
              the mode come from it (mode "direct" draws no broker: the wires run straight from the producer to the consumers)
     box      the vertical band the rig uses (full width, x 12 .. 924): y top, h height. Two rigs can share the stage, e.g.
              {y: 0, h: 310} and {y: 330, h: 310}.
     GEOMETRY  producers x 12..202 (w 190), broker x 290..550 (w 260, centred in the box), consumers x 656..924 (w 268);
              heights: producers and consumers share the box (at most 150 each, 16 px apart), broker at most 190.
   fl.set(t, {k: 1, wiresK: 1, queueK: 1, chipsK: 1, packets: true, prod: [{...}], broker: {...}, cons: [{...}]})
     draws frame t of the log (every chip carries 28 px text): producers blue (phone icon), the broker purple with its QUEUE as a row of chips (orange "m3" =
     waiting, blue = handed out, no ack yet; an orange ring marks a message that is being REDELIVERED, orange inside while it waits), each consumer with a row of
     chips in ARRIVAL order (blue = working on it, green = done / acked, red = lost or dropped by a crash); a consumer that is down
     turns red with a bolt (pops in over 0.3 s after its crash); a consumer working on something is blue, idle grey.
     Packets ride the wires: blue "m3" (publish and deliver), orange "m3" (redelivery), green "ack", and a packet that reaches a
     consumer that is down turns red and fades (lost).
     k pops every card in (pass a ramp); wiresK draws the wires on; queueK / chipsK fade the chip rows in; packets false hides
     the packets. prod / broker / cons: per-node overrides merged into that D4.node set() state (name, tone, ring, bump, x ...).
   fl.prod[i], fl.broker (null in direct mode), fl.cons[i]  the D4.node cards (fl.cons[i].mid, .edge(side) ...)
   fl.qrow  the broker's D4.chips row;  fl.crow[i]  consumer i's D4.chips row
   fl.wire.pk[p] (producer -> broker), fl.wire.kc[c] (broker -> consumer), fl.wire.pc[p][c] (direct): D4.wire objects
   fl.svg  the wire layer;  fl.at(t) = D8.at(log, t);  fl.downAt(c, t) -> 0..1 how far consumer c's crash has popped in
   fl.arrivals(c, t) -> [{id, kind: "got" | "lost", t}] the messages that reached consumer c by time t, in order */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const { clamp } = V;

  const same = D8.same;

  // ---------- the three stories (scenes 8, 9, 10): scripted once, simulated at load, asserted ----------
  const got = (log) => log.end.cons.map((c) => c.got.map((x) => `m${x}`));
  const done = (log) => log.end.cons.map((c) => c.done.map((x) => `m${x}`));

  // direct messaging against a broker: consumer B is offline while m2 and m3 are sent
  const offScript = [
    [0.8, "pub", 0],
    [2.4, "crash", 1],
    [3.2, "pub", 0],
    [3.8, "pub", 0],
    [6.4, "up", 1],
    [8.2, "pub", 0],
  ];
  D8.OFFLINE = {
    direct: D8.sim({ mode: "direct", consumers: ["A", "B"], script: offScript }),
    broker: D8.sim({ mode: "fan", consumers: ["A", "B"], hold: Infinity, autoAck: true, script: offScript }),
  };
  same(
    "offline: direct gives B m1 and m4 only, the broker gives B all four and ends empty",
    [
      got(D8.OFFLINE.direct),
      D8.OFFLINE.direct.end.cons[1].lost.map((x) => `m${x}`),
      got(D8.OFFLINE.broker),
      D8.OFFLINE.broker.end.queue.length,
    ],
    [
      [
        ["m1", "m2", "m3", "m4"],
        ["m1", "m4"],
      ],
      ["m2", "m3"],
      [
        ["m1", "m2", "m3", "m4"],
        ["m1", "m2", "m3", "m4"],
      ],
      0,
    ],
  );

  // load balancing against fan-out: two producers, two consumers, the same four messages
  const OFF = 5.6;
  const shareScript = (dt) => [
    [0.8 + dt, "pub", 0],
    [1.4 + dt, "pub", 1],
    [2.0 + dt, "pub", 0],
    [2.6 + dt, "pub", 1],
  ];
  const shareOpts = {
    producers: ["Producer 1", "Producer 2"],
    consumers: ["Consumer 1", "Consumer 2"],
    hold: Infinity,
    autoAck: true,
    rr0: 1,
  };
  D8.SHARE = {
    offset: OFF,
    lb: D8.sim({ ...shareOpts, mode: "lb", script: shareScript(0) }),
    fan: D8.sim({ ...shareOpts, mode: "fan", script: shareScript(OFF) }),
  };
  const deliveries = (log) => log.hops.filter((h) => h.kind === "deliver").length;
  same(
    "share: load balancing gives each message to one consumer (4 deliveries), fan-out to both (8)",
    [got(D8.SHARE.lb), deliveries(D8.SHARE.lb), got(D8.SHARE.fan), deliveries(D8.SHARE.fan)],
    [
      [
        ["m2", "m4"],
        ["m1", "m3"],
      ],
      4,
      [
        ["m1", "m2", "m3", "m4"],
        ["m1", "m2", "m3", "m4"],
      ],
      8,
    ],
  );

  // acknowledgements and redelivery: the lesson's story
  D8.ACKS = D8.sim({
    mode: "lb",
    consumers: ["Consumer 1", "Consumer 2"],
    hold: 1,
    rr0: 1,
    script: [
      [0.6, "pub", 0],
      [0.9, "pub", 0],
      [2.6, "ack", 1],
      [2.9, "ack", 0],
      [3.6, "pub", 0],
      [3.9, "pub", 0],
      [5.6, "crash", 1],
      [7.4, "ack", 0],
      [10.0, "ack", 0],
      [10.0, "pub", 0],
      [12.4, "ack", 0],
    ],
  });
  (() => {
    const L = D8.ACKS;
    const redo = L.hops.find((h) => h.kind === "deliver" && h.redo);
    L.times = {
      crash: D8.firstMark(L, "crash", null, 1),
      noticed: D8.firstMark(L, "noack", 3),
      redeliver: redo.t0,
      m3done: D8.firstMark(L, "deleted", 3),
      end: L.end.t,
    };
    same(
      "acks: C1 processes m2, m4, m3, m5 (m3 redelivered after m4), C2 only m1, the queue ends empty",
      [done(L), redo.id, redo.to, L.end.queue.length],
      [[["m2", "m4", "m3", "m5"], ["m1"]], 3, "C0", 0],
    );
    same(
      "acks: the crash at 5.6 is noticed at 6.4, m3 leaves again at 8.0, the story ends by 13.0",
      [L.times.crash, L.times.noticed, L.times.redeliver, L.times.end],
      [5.6, 6.4, 8, 13],
    );
  })();

  // ---------- the rig ----------
  const GEO = { prodX: 12, prodW: 190, kX: 290, kW: 260, consX: 656, consW: 268, gap: 16 };

  D8.flow = (parent, log, o = {}) => {
    const box = { y: 0, h: 640, ...(o.box || {}) };
    const direct = log.o.mode === "direct";
    const prodNames = o.prodNames || log.names.producers;
    const consNames = o.consNames || log.names.consumers;
    const np = prodNames.length;
    const nc = consNames.length;
    const slots = o.slots ?? 4;
    const chipsPer = o.chipsPer ?? 4;
    const ackText = o.ackText ?? "ack";
    const column = (n, maxH) => {
      const h = Math.min(maxH, (box.h - 24 - GEO.gap * (n - 1)) / n);
      const total = n * h + (n - 1) * GEO.gap;
      const y0 = box.y + (box.h - total) / 2;
      return { h, y: (i) => y0 + i * (h + GEO.gap) };
    };
    const pc = column(np, 150);
    const cc = column(nc, 150);
    const kh = Math.min(190, box.h - 24);
    const ky = box.y + (box.h - kh) / 2;
    const svg = D4.svg(parent);

    // wires (under the cards)
    const pOut = (i) => ({ x: GEO.prodX + GEO.prodW, y: pc.y(i) + pc.h / 2 });
    const cIn = (c) => ({ x: GEO.consX, y: cc.y(c) + cc.h / 2 });
    const kIn = (i) => ({ x: GEO.kX, y: ky + kh / 2 + (np > 1 ? (i - (np - 1) / 2) * 50 : 0) });
    const kOut = (c) => ({ x: GEO.kX + GEO.kW, y: ky + kh / 2 + (nc > 1 ? (c - (nc - 1) / 2) * 50 : 0) });
    const mk = (a, b) => D4.wire(svg, { pts: [a, b], tone: "grey", w: 5 });
    const wire = {
      pk: direct ? [] : prodNames.map((_, i) => mk(pOut(i), kIn(i))),
      kc: direct ? [] : consNames.map((_, c) => mk(kOut(c), cIn(c))),
      pc: direct
        ? prodNames.map((_, i) =>
            consNames.map((__, c) => mk({ x: pOut(i).x, y: pOut(i).y + (c - (nc - 1) / 2) * 40 }, cIn(c))),
          )
        : [],
    };
    const wireOf = (h) => {
      const n = (s) => +s.slice(1);
      if (h.from[0] === "P" && h.to === "K") return wire.pk[n(h.from)];
      if (h.from === "K") return wire.kc[n(h.to)];
      if (h.to === "K") return wire.kc[n(h.from)]; // an ack rides the consumer's wire backwards
      return wire.pc[n(h.from)][n(h.to)];
    };

    // cards
    const prod = prodNames.map((name, i) =>
      D4.node(parent, {
        x: GEO.prodX,
        y: pc.y(i),
        w: GEO.prodW,
        h: pc.h,
        name,
        tone: "blue",
        icon: o.prodIcon || "phone",
      }),
    );
    const broker = direct
      ? null
      : D4.node(parent, {
          x: GEO.kX,
          y: ky,
          w: GEO.kW,
          h: kh,
          name: o.brokerName || "Broker",
          tone: "purple",
          icon: "server",
          layout: "slots",
        });
    const cons = consNames.map((name, c) =>
      D4.node(parent, {
        x: GEO.consX,
        y: cc.y(c),
        w: GEO.consW,
        h: cc.h,
        name,
        tone: "grey",
        icon: o.consIcon || "server",
        layout: "slots",
      }),
    );
    const qrow = broker ? D4.chips(parent, { ...broker.slot({ n: slots, w: 56, h: 46, gap: 8 }), fs: 28 }) : null;
    // chips carry 28 px text; on a short card (two rigs on one stage) they shrink to 40 px and sit 2 px lower, clear of the icon
    const small = cc.h < 130;
    const crow = cons.map((n) =>
      D4.chips(parent, { ...n.slot({ n: chipsPer, w: 56, h: small ? 40 : 44, gap: 6, dy: small ? 2 : 0 }), fs: 28 }),
    );
    const packets = log.hops.map((h) => D4.packet(parent, { text: h.kind === "ack" ? ackText : h.text, tone: "blue" }));

    const marksOf = (c) => log.marks.filter((m) => m.c === c);
    const downAt = (c, t) => {
      let k = 0;
      marksOf(c).forEach((m) => {
        if (m.t > t) return;
        if (m.kind === "crash") k = clamp((t - m.t) / 0.3);
        if (m.kind === "up") k = 0;
      });
      return k;
    };
    const arrivals = (c, t) =>
      marksOf(c)
        .filter((m) => (m.kind === "got" || m.kind === "lost") && m.t <= t)
        .map((m) => ({ id: m.id, kind: m.kind, t: m.t }));

    return {
      svg,
      prod,
      broker,
      cons,
      qrow,
      crow,
      wire,
      at: (t) => D8.at(log, t),
      downAt,
      arrivals,
      set(t, st = {}) {
        const { k = 1, wiresK = 1, queueK = 1, chipsK = 1 } = st;
        const { s, fly } = D8.at(log, t);
        [...wire.pk, ...wire.kc, ...wire.pc.flat()].forEach((w) => w.set({ k: wiresK }));
        prod.forEach((n, i) => n.set({ k, ...((st.prod || [])[i] || {}) }));
        if (broker) {
          broker.set({ k, ...(st.broker || {}) });
          qrow.all((i) => {
            const m = s.queue[i];
            if (!m) return { ghost: true, text: "", o: queueK * Math.min(1, k * 4) };
            const tone = m.status === "out" ? "blue" : "orange";
            return { text: m.text, tone, solid: m.status !== "out", ring: m.redo ? "orange" : null, o: queueK };
          });
        }
        cons.forEach((n, c) => {
          const sc = s.cons[c];
          const down = downAt(c, t);
          n.set({ k, tone: sc.work.length ? "blue" : "grey", down, ...((st.cons || [])[c] || {}) });
          const list = arrivals(c, t);
          crow[c].all((i) => {
            const a = list[i];
            if (!a) return { ghost: true, text: "", o: chipsK * Math.min(1, k * 4) };
            const done = sc.done.includes(a.id);
            const work = sc.work.includes(a.id);
            const tone = a.kind === "lost" ? "red" : done ? "green" : work ? "blue" : "red";
            return { text: `m${a.id}`, tone, solid: tone !== "blue", o: chipsK };
          });
        });
        packets.forEach((p) => p.set({ k: 0 }));
        if (st.packets === false) return;
        fly.forEach((h) => {
          const i = log.hops.findIndex(
            (x) => x.t0 === h.t0 && x.from === h.from && x.to === h.to && x.id === h.id && x.kind === h.kind,
          );
          const pos = wireOf(h).at(h.kind === "ack" ? 1 - h.f : h.f);
          const tone = h.kind === "ack" ? "green" : h.lost && h.f > 0.55 ? "red" : h.redo ? "orange" : "blue";
          packets[i].set({ x: pos.x, y: pos.y, tone, k: D8.edge(h.f) });
        });
      },
    };
  };
})();
