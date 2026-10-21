/* Lecture 5 (ds-5) · scene 4 (THE TIMESTAMP TRAP): if the key is the time of the write, each node owns some hours (00-05, 06-11,
   12-17, 18-23), and at 14:xx every new write belongs to the one node that owns "now": one hot spot while the others sit idle
   (lesson 5.2). Six writes between 14:02 and 14:50 all land on node 3. Every hour range, timestamp and load comes from D5
   (D5.HOURS, D5.WRITES, D5.WRITE_NODE, D5.loadAt, D5.nodeOfTime), asserted on load. Colours: blue = the writes (the data), purple =
   the hour ranges (the routing rule), orange = the clock (a write in motion), green = a node with no load (an empty meter), red =
   overload (the hot spot and its full meter), grey = the idle nodes. Story (local seconds): 0.2 the nodes, hour tags and meters
   pop and the clock reads 14:00; 3.2, 4.05, ... a write leaves the clock every 0.85 s and flies to node 3 (the 12-17 node), whose
   meter fills; node 3 turns red after the fourth write; 8.5 "hot spot" pops under it and "idle" under the other three. Hold. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const W = D5.WRITES;
  const HOT = D5.WRITE_NODE;
  D5.same(
    "hotspot scene: four hour ranges, six writes at 14:xx",
    [D5.HOURS, W.length, W[0], W[W.length - 1]],
    [["00–05", "06–11", "12–17", "18–23"], 6, "14:02", "14:50"],
  );
  D5.same(
    "hotspot scene: every write lands on the same node, the one that owns 14 o'clock",
    [W.map(D5.nodeOfTime), HOT, D5.loadAt(W.length)],
    [[2, 2, 2, 2, 2, 2], 2, [0, 0, 6, 0]],
  );
  D5.same(
    "hotspot scene: the load grows by one write at a time on that node only",
    W.map((_, k) => D5.loadAt(k + 1)[HOT]),
    [1, 2, 3, 4, 5, 6],
  );

  const T = {
    nodes: 0.2,
    nodeStep: 0.1,
    clock: 1.4,
    first: 3.2,
    step: 0.85,
    fly: 0.6,
    meterDur: 0.3,
    hot: 8.5,
    idle: 8.8,
    pulse: 9.6,
  };
  const leaveAt = (i) => T.first + T.step * i;
  const landAt = (i) => leaveAt(i) + T.fly;
  const done = (t) => W.filter((_, i) => t >= landAt(i)).length; // writes that have landed

  V.scene({
    kicker: "THE TIMESTAMP TRAP",
    title: ["Keyed by time,", "every write hits one node"],
    dur: 12.5,
    caps: [
      [0.6, 2.9, "Key by time: each node owns hours."],
      [3.0, 5.8, "It is afternoon: writes go to 12 to 17."],
      [6.2, 9.0, "Write after write, all on the same node."],
      [9.4, 12.1, "One hot spot while three nodes sit idle."],
    ],
    build(stage) {
      const cl = D5.cluster(stage, { x: 12, y: 200, n: 4, w: 210, gap: 24, cols: 2, rows: 3, cw: 88, ch: 44, cg: 6 });
      const clock = D5.tag(stage, {
        x: 408,
        y: 40,
        w: 120,
        text: "14:00",
        tone: "orange",
        solid: true,
        icon: "client",
      });
      const writes = W.map((text) => D5.chip(stage, { text, w: 88, h: 44, tone: "blue" }));
      const meters = [0, 1, 2, 3].map((n) => D5.meter(stage, { x: cl.box(n).x + 15, y: 440, w: 180, tone: "green" }));
      const counts = [0, 1, 2, 3].map((n) =>
        D5.text(stage, { x: cl.box(n).x, y: 478, w: 210, align: "center", text: "0", tone: "grey" }),
      );
      const hot = D5.tag(stage, { x: cl.mid(HOT).x - 70, y: 472, w: 140, text: "hot spot", tone: "red", solid: true });
      const idle = [0, 1, 2, 3].map((n) =>
        D5.tag(stage, { x: cl.mid(n).x - 55, y: 472, w: 110, text: "idle", tone: "grey" }),
      );

      return (t) => {
        const wrote = done(t);
        const load = D5.loadAt(wrote);
        // the clock reads the timestamp of the write being sent (14:00 before the first one)
        const sending = W.findIndex((_, i) => t >= leaveAt(i) && t < landAt(i) + 0.2);
        const last = W.filter((_, i) => t >= leaveAt(i)).length - 1;
        const stamp = last >= 0 ? W[last] : "14:00";
        clock.set({
          text: stamp,
          k: ramp(t, T.clock, T.clock + 0.5, E.lin),
          s: 1 + 0.08 * (sending >= 0 ? flash(t, leaveAt(sending), leaveAt(sending) + 0.3) : 0),
        });

        for (let n = 0; n < 4; n++) {
          const k = ramp(t, T.nodes + T.nodeStep * n, T.nodes + T.nodeStep * n + 0.5, E.lin);
          const overloaded = n === HOT && wrote >= 4;
          cl.set(n, { k, tag: D5.HOURS[n], tagK: k, tagTone: "purple", tone: overloaded ? "red" : "grey" });
          // the meter fills over 0.3 s after each landing
          const prev = n === HOT && wrote > 0 ? D5.loadAt(wrote - 1)[n] : load[n];
          const grow = wrote > 0 ? ramp(t, landAt(wrote - 1), landAt(wrote - 1) + T.meterDur, E.lin) : 1;
          const level = n === HOT ? (prev + (load[n] - prev) * grow) / W.length : 0;
          meters[n].set({ k: level, tone: overloaded ? "red" : "green", o: k });
          const hide = ramp(t, T.hot, T.hot + 0.3, E.lin);
          counts[n].set({ text: String(load[n]), k: k * (1 - hide), tone: n === HOT && wrote >= 4 ? "red" : "grey" });
        }
        // the writes: each leaves the clock and drops into the second row of node 3
        writes.forEach((c, i) => {
          const f = E.inOut(ramp(t, leaveAt(i), landAt(i), E.lin));
          const pos = D5.fly({ x: 468, y: 80 }, cl.slot(HOT, i), f, { arc: -40 });
          const shown = t >= leaveAt(i) - 0.05 ? 1 : 0;
          c.set({
            x: pos.x,
            y: pos.y,
            o: shown,
            s: shown ? 1 + 0.1 * flash(t, landAt(i), landAt(i) + 0.3) : 0,
            tone: "blue",
            solid: f >= 1,
          });
        });
        hot.set({ k: ramp(t, T.hot, T.hot + 0.5, E.lin), s: 1 + 0.08 * flash(t, T.pulse, T.pulse + 0.8) });
        idle.forEach((tag, n) =>
          tag.set({ k: n === HOT ? 0 : ramp(t, T.idle + 0.1 * n, T.idle + 0.1 * n + 0.5, E.lin) }),
        );
      };
    },
  });
})();
