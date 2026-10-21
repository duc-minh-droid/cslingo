/* Lecture 4 (ds-4) · scene 8 (SPLIT BRAIN): node A is the leader. It is cut off from B and C (the network breaks, A is still
   running), so B and C think it died and promote B. A does not know, so it still thinks it leads: there are two leaders. A client
   writes seat 12 = Ann to A and another writes seat 12 = Bo to B; C follows its leader B. When the network heals the two
   histories disagree (lesson 4.4). Every name and value comes from D4.SPLIT (asserted on load). Colours: blue = a leader and the
   writes sent to it, grey = a node that follows, orange = no reply (a node that cannot be reached), purple = the entry B sends to
   C, red = a cut wire, the conflict (the two values and the not-equal sign) and "two leaders", green = a healed wire.
   Story (local seconds): 0.3 the nodes, wires and clients pop (A has the crown); 1.8 the wires A-B and A-C are cut and "cut off"
   pops under A; 3.0 "no reply" tags pop at B and C; 4.0 B is promoted (crown, blue) while A keeps its crown; 6.6 Ann goes to A;
   7.0 Bo goes to B, then B sends it on to C; 8.2 the wires heal, the not-equal sign pops between A and B and both values turn
   red; 9.0 "two leaders" pops. Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const { ramp, flash, clamp, ease: E } = V;
  const S = D4.SPLIT;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  D4.same(
    "split scene: A led, B was promoted, both took a write for seat 12 and C followed B",
    [S.leader0, S.promoted, S.seat, S.writes, S.leaders, S.conflict, S.after],
    ["A", "B", 12, { A: "Ann", B: "Bo" }, ["A", "B"], true, { A: "Ann", B: "Bo", C: "Bo" }],
  );
  D4.same(
    "split scene: the two leaders ended with different values for the same seat, the follower has the promoted leader's",
    [S.after.A !== S.after.B, S.after.C === S.after[S.promoted]],
    [true, true],
  );

  const T = {
    pop: 0.3,
    cut: 1.8,
    cutDur: 0.5,
    noReply: 3.0,
    promote: 4.0,
    ann: 6.6,
    bo: 7.0,
    entry: 7.8,
    heal: 8.2,
    two: 9.0,
  };
  const FLY = 0.6;

  V.scene({
    kicker: "SPLIT BRAIN",
    title: ["A cut-off leader", "that still thinks it leads"],
    dur: 11.5,
    caps: [
      [0.5, 2.0, `${S.leader0} is the leader.`],
      [2.2, 4.35, `${S.leader0} is cut off; B and C think it died.`],
      [4.4, 6.4, `${S.promoted} is promoted, yet ${S.leader0} still leads.`],
      [6.5, 8.7, `Both take a write for seat ${S.seat}.`],
      [8.9, 11.2, "Split brain: two histories disagree."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const wAB = D4.wire(svg, {
        pts: [
          [292, 300],
          [644, 135],
        ],
        tone: "grey",
        w: 6,
      });
      const wAC = D4.wire(svg, {
        pts: [
          [292, 350],
          [644, 515],
        ],
        tone: "grey",
        w: 6,
      });
      const wBC = D4.wire(svg, {
        pts: [
          [784, 210],
          [784, 440],
        ],
        tone: "grey",
        w: 6,
      });
      const mk = (name, x, y) => D4.node(stage, { x, y, w: 280, h: 150, name, unit: `seat ${S.seat}`, value: "" });
      const nodes = { A: mk("Node A", 12, 250), B: mk("Node B", 644, 60), C: mk("Node C", 644, 440) };

      const top = D4.svg(stage);
      const annP = top.appendChild(D4.person(152, 110, 70, "grey"));
      const boP = top.appendChild(D4.person(440, 70, 70, "grey"));
      const annTag = D4.tag(stage, { x: 152, y: 62, text: S.writes.A });
      const boTag = D4.tag(stage, { x: 440, y: 22, text: S.writes.B });
      const annPk = D4.packet(stage, { text: S.writes.A, tone: "blue" });
      const boPk = D4.packet(stage, { text: S.writes.B, tone: "blue" });
      const entryPk = D4.packet(stage, { text: S.writes.B, tone: "purple" });
      const noReply = [
        D4.tag(stage, { x: 700, y: 250, text: "no reply", tone: "orange" }),
        D4.tag(stage, { x: 700, y: 395, text: "no reply", tone: "orange" }),
      ];
      const cutOff = D4.tag(stage, { x: 152, y: 430, text: "cut off", tone: "orange" });
      const bolts = [wAB, wAC].map((w) => top.appendChild(D4.bolt(w.mid.x, w.mid.y, 64, "red")));
      const neq = top.appendChild(D4.neq(468, 217, 90, "red"));
      const two = D4.tag(stage, { x: 468, y: 325, text: "two leaders", tone: "red", solid: true });

      const flyTo = (pk, from, to, t, t0, dur) => {
        const f = clamp((t - t0) / dur);
        const p = D4.at(from, to, E.inOut(f), 0);
        pk.set({ x: p.x, y: p.y, k: t >= t0 && t < t0 + dur ? 1 : 0 });
      };

      return (t) => {
        const k = ramp(t, T.pop, T.pop + 0.6, E.lin);
        const cut = ramp(t, T.cut, T.cut + T.cutDur, E.lin);
        const healed = ramp(t, T.heal, T.heal + 0.5, E.lin);
        const cutK = cut * (1 - healed);
        const healFlash = flash(t, T.heal, T.heal + 0.6);
        const promoted = ramp(t, T.promote, T.promote + 0.5, E.lin);
        const annAt = T.ann + FLY;
        const boAt = T.bo + FLY;
        const cAt = T.entry + FLY;
        const conflict = ramp(t, T.heal + 0.3, T.heal + 0.8, E.lin);

        [wAB, wAC, wBC].forEach((w, i) =>
          w.set({ k, o: k, cut: i < 2 ? cutK : 0, tone: i < 2 && healFlash > 0.3 ? "green" : "grey" }),
        );
        bolts.forEach((b) => {
          const bk = ramp(t, T.cut + 0.2, T.cut + 0.5, E.lin);
          V.place(b, { s: 0.5 + 0.5 * E.pop(bk), o: bk * (1 - healed) });
        });

        nodes.A.set({
          k,
          tone: "blue",
          crown: ramp(t, T.pop + 0.4, T.pop + 0.8, E.pop),
          value: t >= annAt ? S.writes.A : "",
          vtone: conflict > 0.5 ? "red" : "grey",
          bump: flash(t, annAt, annAt + 0.3),
        });
        nodes.B.set({
          k,
          tone: promoted > 0.5 ? "blue" : "grey",
          crown: promoted,
          value: t >= boAt ? S.writes.B : "",
          vtone: conflict > 0.5 ? "red" : "grey",
          bump: flash(t, boAt, boAt + 0.3),
        });
        nodes.C.set({ k, tone: "grey", value: t >= cAt ? S.after.C : "", bump: flash(t, cAt, cAt + 0.3) });

        // the clients and their writes
        V.place(annP, { s: 0.6 + 0.4 * E.pop(k), o: k });
        V.place(boP, { s: 0.6 + 0.4 * E.pop(k), o: k });
        annTag.set({ k });
        boTag.set({ k });
        flyTo(annPk, { x: 152, y: 150 }, { x: 152, y: 250 }, t, T.ann, FLY);
        flyTo(boPk, { x: 480, y: 70 }, { x: 644, y: 120 }, t, T.bo, FLY);
        flyTo(entryPk, { x: 784, y: 210 }, { x: 784, y: 440 }, t, T.entry, FLY);

        // the tags
        cutOff.set({ k: ramp(t, T.cut + 0.3, T.cut + 0.7, E.lin) });
        const nr = ramp(t, T.noReply, T.noReply + 0.4, E.lin) * (1 - ramp(t, T.promote, T.promote + 0.5, E.lin));
        noReply.forEach((tag) => tag.set({ k: nr }));
        V.place(neq, { s: 0.5 + 0.5 * E.pop(conflict), o: conflict });
        two.set({ k: ramp(t, T.two, T.two + 0.4, E.lin) });
      };
    },
  });
})();
