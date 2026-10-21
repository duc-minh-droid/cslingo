/* Lecture 4 (ds-4) · scene 4 (LEADER AND FOLLOWERS): every write goes to the leader, which stores it as a numbered entry in its
   log and sends each entry on, in order, to the followers; reads can go to any node (lesson 4.2). A client changes a profile
   picture three times (pic 1, pic 2, pic 3): entry #n is stored by the leader and later applied by each follower, always in the
   order 1, 2, 3. The same rig (D4.cluster: client on the left, leader above two followers, log bus on the right) comes back in
   scenes 9 and 10. Every value shown comes from D4.LOG (asserted on load). Colours: blue = the leader and the writes sent to
   it, purple = the replication log (entries #1 #2 #3 and their packets), orange = a follower that is behind, green = a node that
   is up to date and an answer that is right, grey = the client and plain reads.
   Story (local seconds): 0.3-1.2 the rig pops (client, leader with its crown, followers; wires draw on); 1.4, 2.4, 3.4 a write
   packet flies to the leader, whose value changes and whose chip #n fills in; 4.7, 5.6, 6.5 entry #n is sent to both followers
   (follower A is quicker than B), they apply it in order and turn green when they hold the same as the leader; 9.1, 9.3, 9.5 a
   read goes to the leader, A and B and each answers pic 3. Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const { ramp, flash, clamp, ease: E } = V;
  const G = D4.LOG;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const N = G.writes.length;
  D4.same(
    "leader scene: three writes, applied in the same order 1 2 3 by both followers",
    [N, G.order],
    [3, { A: [1, 2, 3], B: [1, 2, 3] }],
  );
  D4.same(
    "leader scene: when every follower has applied the log all three hold the last write",
    [G.value("L", N + G.lag.L), G.value("A", N + G.lag.A), G.value("B", N + G.lag.B), G.end],
    ["pic 3", "pic 3", "pic 3", "pic 3"],
  );
  const entry = (n) => `#${n + 1}`;

  // ---------- the timeline (local seconds) ----------
  const T = {
    rig: 0.3,
    write: 1.4,
    writeStep: 1.0,
    writeDur: 0.6,
    ship: 4.7,
    shipStep: 0.9,
    shipDur: { A: 0.8, B: 1.2 },
    read: 9.1,
    readStep: 0.2,
    readDur: 0.6,
  };
  const storedAt = (n) => T.write + T.writeStep * n + T.writeDur; // entry n+1 is stored by the leader
  const appliedAt = (node, n) => T.ship + T.shipStep * n + T.shipDur[node]; // follower `node` applies entry n+1
  const countAt = (t, at) => Array.from({ length: N }, (_, n) => at(n)).filter((a) => t >= a).length;
  D4.same(
    "leader scene: follower A is quicker than B, and every entry reaches the followers after the leader stored it",
    [appliedAt("A", 2) < appliedAt("B", 2), appliedAt("A", 0) > storedAt(0), appliedAt("B", 2) < 8.0],
    [true, true, true],
  );

  V.scene({
    kicker: "LEADER AND FOLLOWERS",
    title: ["Writes go to the leader,", "the log carries them on"],
    dur: 13,
    caps: [
      [1.2, 4.4, "Every write goes to the leader."],
      [4.8, 8.4, "It sends each change on, in order, as a log."],
      [9.0, 12.6, "Reads can go to any node, writes only to the leader."],
    ],
    build(stage) {
      const rig = D4.cluster(stage, { h: 190, layout: "value", clientName: "Client" });
      const { L, A, B } = rig.nodes;
      const nodes = { L, A, B };
      const wires = rig.wires;

      // the three tags on the wires
      const writesTag = D4.tag(stage, { x: 326, y: 205, text: "writes", tone: "blue", solid: true });
      const readsTag = D4.tag(stage, { x: 132, y: 440, text: "reads" });
      const logTag = D4.tag(stage, { x: 857, y: 590, text: "the log", tone: "purple" });

      // the log chips inside each node: ghost until the entry is there
      const KEYS = ["L", "A", "B"];
      const chips = KEYS.map((k) =>
        D4.chips(stage, {
          x: nodes[k].x + 43,
          y: nodes[k].y + 132,
          n: N,
          w: 66,
          h: 48,
          gap: 8,
          fs: 28,
          texts: Array.from({ length: N }, (_, n) => entry(n)),
          tone: "purple",
        }),
      );

      // packets: writes (blue), log entries (purple), reads (grey outline) and answers (green)
      const writePk = Array.from({ length: N }, (_, n) => D4.packet(stage, { text: G.writes[n], tone: "blue" }));
      const logPk = ["A", "B"].map(() =>
        Array.from({ length: N }, (_, n) => D4.packet(stage, { text: entry(n), tone: "purple" })),
      );
      const readPk = KEYS.map(() => D4.packet(stage, { text: "read", tone: "grey", solid: false }));
      const answerPk = KEYS.map(() => D4.packet(stage, { text: G.end, tone: "green" }));
      const readWire = { L: wires.cl, A: wires.ca, B: wires.cb };

      const place = (pk, p, k) => pk.set({ x: p.x, y: p.y, k });
      const val = (n) => (n ? G.writes[n - 1] : "none");
      D4.same("leader scene: a node's value is the text of the last entry it holds", val(N), G.end);

      return (t) => {
        // ---- the rig pops in ----
        const kc = ramp(t, T.rig, T.rig + 0.4, E.lin);
        const kl = ramp(t, T.rig + 0.2, T.rig + 0.6, E.lin);
        const kf = [0, 1].map((i) => ramp(t, T.rig + 0.4 + 0.2 * i, T.rig + 0.8 + 0.2 * i, E.lin));
        rig.client.set({ k: kc });
        // the leader and the followers: value and tone follow the log
        const nL = countAt(t, storedAt);
        const nA = countAt(t, (n) => appliedAt("A", n));
        const nB = countAt(t, (n) => appliedAt("B", n));
        L.set({
          k: kl,
          value: val(nL),
          tone: "blue",
          crown: ramp(t, T.rig + 0.5, T.rig + 0.9, E.pop),
          bump: nL ? flash(t, storedAt(nL - 1), storedAt(nL - 1) + 0.3) : 0,
        });
        [
          [A, nA, "A", 0],
          [B, nB, "B", 1],
        ].forEach(([node, n, key, i]) =>
          node.set({
            k: kf[i],
            value: val(n),
            tone: n === 0 ? "grey" : n === nL ? "green" : "orange",
            bump: n ? flash(t, appliedAt(key, n - 1), appliedAt(key, n - 1) + 0.3) : 0,
          }),
        );
        wires.cl.set({ k: kl });
        wires.ca.set({ k: kf[0] });
        wires.cb.set({ k: kf[1] });
        wires.logA.set({ k: ramp(t, T.ship - 0.3, T.ship, E.lin), tone: "purple" });
        wires.logB.set({ k: ramp(t, T.ship - 0.3, T.ship, E.lin), tone: "purple" });
        writesTag.set({ k: ramp(t, T.rig + 0.6, T.rig + 1.0, E.lin) });
        logTag.set({ k: ramp(t, T.ship - 0.3, T.ship + 0.1, E.lin) });
        readsTag.set({ k: ramp(t, T.read - 0.3, T.read + 0.1, E.lin) });

        // ---- the log chips ----
        const have = [nL, nA, nB];
        chips.forEach((row, ni) =>
          row.all((n) => {
            const present = n < have[ni];
            const at = ni === 0 ? storedAt(n) : appliedAt(KEYS[ni], n);
            return {
              ghost: !present,
              solid: present,
              tone: "purple",
              o: ni === 0 ? kl : kf[ni - 1],
              s: present ? 1 + 0.15 * flash(t, at, at + 0.3) : 1,
            };
          }),
        );

        // ---- the writes ----
        writePk.forEach((pk, n) => {
          const f = clamp((t - (T.write + T.writeStep * n)) / T.writeDur);
          const live = t >= T.write + T.writeStep * n && t < storedAt(n);
          place(pk, wires.cl.at(E.inOut(f)), live ? 1 : 0);
        });
        // ---- the log shipped to both followers ----
        logPk.forEach((row, wi) =>
          row.forEach((pk, n) => {
            const key = wi === 0 ? "A" : "B";
            const wire = wi === 0 ? wires.logA : wires.logB;
            const from = T.ship + T.shipStep * n;
            const f = clamp((t - from) / T.shipDur[key]);
            const live = t >= from && t < appliedAt(key, n);
            place(pk, wire.at(E.inOut(f)), live ? 1 : 0);
          }),
        );
        // ---- the reads and their answers ----
        KEYS.forEach((key, i) => {
          const s0 = T.read + T.readStep * i;
          const goK = clamp((t - s0) / T.readDur);
          const backK = clamp((t - (s0 + T.readDur)) / T.readDur);
          const going = t >= s0 && t < s0 + T.readDur;
          const coming = t >= s0 + T.readDur && t < s0 + 2 * T.readDur;
          place(readPk[i], readWire[key].at(E.inOut(goK)), going ? 1 : 0);
          place(answerPk[i], readWire[key].at(1 - E.inOut(backK)), coming ? 1 : 0);
        });
      };
    },
  });
})();
