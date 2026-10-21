/* Lecture 4 (ds-4) · scene 9 (READ YOUR WRITES): you post a comment (3 become 4) and it goes to the leader; the follower that
   lags has not received it yet, so reloading from that follower shows 3 and your own comment seems to have vanished. The fix is
   read-your-writes: read your own recent posts from the leader (lesson 4.5). The same rig as scene 4 (D4.cluster). Every count
   comes from D4.LAG (asserted on load). Colours: blue = the leader and the writes sent to it, purple = the log entry that crawls to
   the lagging follower (the lag), orange = behind (a lagging follower, the old answer 3), green = up to date and a right answer,
   red = the missing post, grey = plain reads.
   Story (local seconds): 0.3 the rig pops (all nodes show 3); 1.6 the post flies to the leader which shows 4, the followers turn
   orange; 2.6 the entry goes out, A has it at 3.5 and B (slow) at 10.2; 4.0 a reload goes to B and answers 3, the page shows 3
   and the red cross and "post missing!" pop; 8.0 the "read-your-writes" tag pops and the wire to the leader turns thick blue;
   9.0 a reload goes to the leader and answers 4, the page shows 4 with a green tick; B catches up at 10.2. Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const G = D4.LAG;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const NEW = G.base + G.writes.length; // 4
  D4.same(
    "own-writes scene: after one post a reload at time 2 shows 4 on the leader and on A, 3 on the lagging B",
    [G.base, NEW, G.show, G.stale, G.own],
    [3, 4, { L: 4, A: 4, B: 3 }, "B", "L"],
  );
  D4.same(
    "own-writes scene: the count a node shows at the reload time follows its lag",
    ["L", "A", "B"].map((n) => D4.countAt(G, n, G.at)),
    [4, 4, 3],
  );

  const T = {
    rig: 0.3,
    post: 1.6,
    postDur: 0.8,
    entry: 2.6,
    entryA: 0.9,
    entryB: 10.2,
    reloadB: 4.0,
    hop: 0.8,
    missing: 5.7,
    rule: 8.0,
    ruleDur: 0.7,
    fade: 8.4,
    reloadL: 9.0,
    tick: 10.5,
  };
  const leaderAt = T.post + T.postDur; // 2.4: the leader shows 4
  const aAt = T.entry + T.entryA; // 3.5: A shows 4

  V.scene({
    kicker: "READ YOUR WRITES",
    title: ["Your own post", "must not vanish"],
    dur: 12.5,
    caps: [
      [1.3, 3.6, "You post a comment to the leader."],
      [3.9, 6.6, `Reload: a follower that lags still shows ${G.base}.`],
      [6.7, 8.7, "Your comment seems to be gone."],
      [8.8, 12.2, "Fix: read your own recent posts from the leader."],
    ],
    build(stage) {
      const rig = D4.cluster(stage, {
        h: 160,
        layout: "value",
        clientName: "Your page",
        clientIcon: "phone",
        clientValue: String(G.base),
        clientUnit: "comments",
        unit: "comments",
      });
      const W = rig.wires;
      const top = D4.svg(stage);
      const cross = top.appendChild(L5.cross(132, 500, 56, "red"));
      const tick = top.appendChild(L5.tick(132, 500, 64, "green", { ink: true, w: 9 }));
      const missing = D4.tag(stage, { x: 132, y: 440, text: "post missing!", tone: "red", solid: true });
      const rule = D4.tag(stage, { x: 132, y: 565, text: "read-your-writes", tone: "blue", solid: true });

      const post = D4.packet(stage, { text: "post", tone: "blue" });
      const entryA = D4.packet(stage, { text: `#${NEW}`, tone: "purple" });
      const entryB = D4.packet(stage, { text: `#${NEW}`, tone: "purple" });
      const reloadB = D4.packet(stage, { text: "reload", tone: "grey", solid: false });
      const answerB = D4.packet(stage, { text: String(G.show.B), tone: "orange" });
      const reloadL = D4.packet(stage, { text: "reload", tone: "grey", solid: false });
      const answerL = D4.packet(stage, { text: String(G.show.L), tone: "green" });

      const ride = (pk, wire, t, t0, dur, back = false) => {
        const f = clamp((t - t0) / dur);
        const p = wire.at(back ? 1 - E.inOut(f) : E.inOut(f));
        pk.set({ x: p.x, y: p.y, k: t >= t0 && t < t0 + dur ? 1 : 0 });
      };

      return (t) => {
        const k = ramp(t, T.rig, T.rig + 0.6, E.lin);
        const ruleK = ramp(t, T.rule, T.rule + T.ruleDur, E.lin);
        const stale = t >= T.reloadB + 2 * T.hop && t < T.rule + 0.4; // the page shows 3 from the answer until the fix starts to bite
        const pageNew = t >= T.reloadL + 2 * T.hop;

        // the three servers: the count, and a tone that says whether the node is up to date
        const nL = t >= leaderAt ? NEW : G.base;
        const nA = t >= aAt ? NEW : G.base;
        const nB = t >= T.entryB ? NEW : G.base;
        rig.L.set({
          k,
          value: String(nL),
          tone: "blue",
          crown: ramp(t, T.rig + 0.3, T.rig + 0.7, E.pop),
          bump: flash(t, leaderAt, leaderAt + 0.3),
        });
        rig.A.set({ k, value: String(nA), tone: nA === nL ? "green" : "orange", bump: flash(t, aAt, aAt + 0.3) });
        rig.B.set({
          k,
          value: String(nB),
          tone: nB === nL ? "green" : "orange",
          bump: flash(t, T.entryB, T.entryB + 0.3),
        });
        // the page: it shows what the last answer said
        rig.client.set({
          k,
          value: String(pageNew ? G.show.L : t >= T.reloadB + 2 * T.hop ? G.show.B : G.base),
          vtone: stale && !pageNew ? "orange" : pageNew ? "green" : "grey",
        });
        W.cl.set({ k, tone: ruleK > 0.3 ? "blue" : "grey", w: ruleK > 0.3 ? 10 : 6 });
        W.ca.set({ k });
        W.cb.set({ k });
        W.logA.set({ k: ramp(t, T.entry - 0.3, T.entry, E.lin), tone: "purple" });
        W.logB.set({ k: ramp(t, T.entry - 0.3, T.entry, E.lin), tone: "purple" });

        // the post, then the entry (fast to A, crawling to B: that is the lag)
        ride(post, W.cl, t, T.post, T.postDur);
        ride(entryA, W.logA, t, T.entry, T.entryA);
        ride(entryB, W.logB, t, T.entry, T.entryB - T.entry);

        // the reload that hits the lagging follower, then the one that goes to the leader
        ride(reloadB, W.cb, t, T.reloadB, T.hop);
        ride(answerB, W.cb, t, T.reloadB + T.hop, T.hop, true);
        ride(reloadL, W.cl, t, T.reloadL, T.hop);
        ride(answerL, W.cl, t, T.reloadL + T.hop, T.hop, true);

        // the verdict
        const gone = 1 - ramp(t, T.fade, T.fade + 0.4, E.lin);
        const mk = ramp(t, T.missing, T.missing + 0.4, E.lin) * gone;
        missing.set({ k: mk });
        L5.drawOn(cross, ramp(t, T.missing, T.missing + 0.4, E.lin));
        V.place(cross, { s: 0.6 + 0.4 * E.pop(mk), o: mk });
        rule.set({ k: ruleK });
        const tk = ramp(t, T.tick, T.tick + 0.4, E.lin);
        L5.drawOn(tick, ramp(tk, 0.2, 1, E.lin));
        V.place(tick, { s: 0.6 + 0.4 * E.pop(tk), o: tk });
      };
    },
  });
})();
