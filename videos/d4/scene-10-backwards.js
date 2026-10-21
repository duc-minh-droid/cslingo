/* Lecture 4 (ds-4) · scene 10 (MONOTONIC READS): a page that is refreshed twice can read from two different replicas. If the first
   reads a replica that has a new like and the second reads one that has not received it yet, the user sees the count go
   DOWN: time ran backwards. The fix is to keep each user on one replica (the same replica every time), so their view only ever
   moves forward (lesson 4.5). The same rig as scenes 4 and 9 (D4.cluster). Every number comes from D4.BACK (asserted on load):
   likes start at 6, writes at times 0 and 3, lags L 0, A 1, B 4; bad reads A then B (7 then 6), pinned reads A twice (7 then 8).
   Colours: blue = the leader, the like on its way and the pinned wire, purple = the log entry #8, green = a right answer and a
   rising history, orange = behind (replica B, the old answer 6), red = back in time, grey = plain refreshes.
   Story (local seconds): 0.3 the rig pops (leader 7, A 7, B 6); 1.3 refresh 1 goes to A and answers 7; 2.9 refresh 2 goes to B
   and answers 6, the history chips fall and "back in time" pops; 5.0 the history fades, the wire to A turns thick blue and
   "same replica" pops; 6.2 refresh goes to A: 7; 7.6 a like reaches the leader (8) and its entry reaches A at 9.2; 9.4 the next refresh
   goes to A and answers 8, the history rises. Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const B = D4.BACK;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const [bad1, bad2] = B.bad;
  const [pin1, pin2] = B.pinned;
  D4.same(
    "backwards scene: the state at time 2.5, the bad reads A then B, the pinned reads A then A",
    [B.state, [bad1.node, bad1.seen, bad2.node, bad2.seen], [pin1.node, pin1.seen, pin2.node, pin2.seen]],
    [{ L: 7, A: 7, B: 6 }, ["A", 7, "B", 6], ["A", 7, "A", 8]],
  );
  D4.same(
    "backwards scene: reading A then B goes back in time, staying on A goes forward",
    [B.back, bad2.seen < bad1.seen, B.forward, pin2.seen > pin1.seen],
    [true, true, true, true],
  );
  D4.same(
    "backwards scene: what a replica shows follows its lag (A at time 2, B at time 2.5, A at time 4.5)",
    [D4.countAt(B, "A", 2), D4.countAt(B, "B", 2.5), D4.countAt(B, "A", 4.5)],
    [bad1.seen, bad2.seen, pin2.seen],
  );
  const NEWEST = pin2.seen; // 8

  const T = {
    rig: 0.3,
    r1: 1.3, // refresh 1 leaves the page
    r2: 2.9,
    hop: 0.6,
    fadeA: 5.0,
    fadeB: 5.8,
    r3: 6.2,
    like: 7.6,
    entry: 8.4,
    r4: 9.4,
  };
  const ans1 = T.r1 + 2 * T.hop; // 2.5
  const ans2 = T.r2 + 2 * T.hop; // 4.1
  const ans3 = T.r3 + 2 * T.hop; // 7.4
  const ans4 = T.r4 + 2 * T.hop; // 10.6
  const likeAt = T.like + T.hop * 1.3; // the leader shows 8
  const entryAt = T.entry + 0.8; // A shows 8

  V.scene({
    kicker: "MONOTONIC READS",
    title: ["Time must not", "run backwards"],
    dur: 11.5,
    caps: [
      [1.3, 3.0, `Refresh: replica A says ${bad1.seen}.`],
      [3.1, 5.5, `B says ${bad2.seen}: time ran backwards.`],
      [5.6, 8.4, "Fix: keep each user on one replica."],
      [9.5, 11.4, "Their view only moves forward."],
    ],
    build(stage) {
      const rig = D4.cluster(stage, {
        h: 160,
        layout: "value",
        clientName: "Your page",
        clientIcon: "phone",
        clientValue: "-",
        clientUnit: "likes",
        unit: "likes",
      });
      const W = rig.wires;
      const top = D4.svg(stage);
      const seen = D4.tag(stage, { x: 132, y: 428, text: "seen so far" });
      const hist = D4.chips(stage, { x: 22, y: 470, n: 2, w: 70, h: 60, gap: 70, fs: 34 });
      const arrowDown = top.appendChild(L5.arrow(100, 500, 154, 500, "red", 1, { w: 8, head: 20 }));
      const arrowUp = top.appendChild(L5.arrow(100, 500, 154, 500, "green", 1, { w: 8, head: 20 }));
      const backTag = D4.tag(stage, { x: 132, y: 575, text: "back in time", tone: "red", solid: true });
      const sameTag = D4.tag(stage, { x: 326, y: 262, text: "same replica", tone: "blue", solid: true });

      const friend = top.appendChild(D4.person(132, 70, 70, "grey"));
      const like = D4.packet(stage, { text: "like", tone: "blue" });
      const entry = D4.packet(stage, { text: `#${NEWEST}`, tone: "purple" });
      const refresh = [
        D4.packet(stage, { text: "refresh", tone: "grey", solid: false }),
        D4.packet(stage, { text: "refresh", tone: "grey", solid: false }),
      ];
      const pinRefresh = [
        D4.packet(stage, { text: "refresh", tone: "grey", solid: false }),
        D4.packet(stage, { text: "refresh", tone: "grey", solid: false }),
      ];
      const answers = [
        D4.packet(stage, { text: String(bad1.seen), tone: "green" }),
        D4.packet(stage, { text: String(bad2.seen), tone: "orange" }),
        D4.packet(stage, { text: String(pin1.seen), tone: "green" }),
        D4.packet(stage, { text: String(pin2.seen), tone: "green" }),
      ];

      const ride = (pk, wire, t, t0, back = false) => {
        const f = clamp((t - t0) / T.hop);
        const p = wire.at(back ? 1 - E.inOut(f) : E.inOut(f));
        pk.set({ x: p.x, y: p.y, k: t >= t0 && t < t0 + T.hop ? 1 : 0 });
      };

      return (t) => {
        const k = ramp(t, T.rig, T.rig + 0.7, E.lin);
        const hide = 1 - ramp(t, T.fadeA, T.fadeB, E.lin); // the history, the page value and the tags fade out between the two experiments
        const phase2 = t >= T.fadeB;
        const pinned = ramp(t, T.fadeA, T.fadeB, E.lin);

        // the servers: leader 7 (8 once the like arrives), A 7 (8 later), B 6 and behind
        const nL = t >= likeAt ? NEWEST : B.state.L;
        const nA = t >= entryAt ? NEWEST : B.state.A;
        rig.L.set({
          k,
          value: String(nL),
          tone: "blue",
          crown: ramp(t, T.rig + 0.3, T.rig + 0.7, E.pop),
          bump: flash(t, likeAt, likeAt + 0.3),
        });
        rig.A.set({
          k,
          value: String(nA),
          tone: nA === nL ? "green" : "orange",
          bump: flash(t, entryAt, entryAt + 0.3),
        });
        rig.B.set({ k, value: String(B.state.B), tone: "orange" });

        // what the page shows: the last answer, or a dash between the experiments
        let page = "-";
        let tone = "grey";
        if (t >= ans1 && t < ans2) [page, tone] = [String(bad1.seen), "green"];
        else if (t >= ans2 && t < T.fadeB) [page, tone] = [String(bad2.seen), "orange"];
        else if (t >= ans3 && t < ans4) [page, tone] = [String(pin1.seen), "green"];
        else if (t >= ans4) [page, tone] = [String(pin2.seen), "green"];
        rig.client.set({ k, value: t >= T.fadeA && t < T.fadeB ? page : page, vtone: tone, o: 1 });

        // the wires: only the pinned experiment thickens the wire to A
        W.cl.set({ k });
        W.ca.set({ k, tone: pinned > 0.3 ? "blue" : "grey", w: pinned > 0.3 ? 10 : 6 });
        W.cb.set({ k });
        W.logA.set({ k: ramp(t, T.entry - 0.3, T.entry, E.lin), tone: "purple" });
        W.logB.set({ k: ramp(t, T.entry - 0.3, T.entry, E.lin), tone: "purple" });

        // the refreshes and their answers: A, then B (the user jumps replicas); later A, A (pinned)
        ride(refresh[0], W.ca, t, T.r1);
        ride(answers[0], W.ca, t, T.r1 + T.hop, true);
        ride(refresh[1], W.cb, t, T.r2);
        ride(answers[1], W.cb, t, T.r2 + T.hop, true);
        ride(pinRefresh[0], W.ca, t, T.r3);
        ride(answers[2], W.ca, t, T.r3 + T.hop, true);
        ride(pinRefresh[1], W.ca, t, T.r4);
        ride(answers[3], W.ca, t, T.r4 + T.hop, true);

        // a like arrives from a friend and reaches the leader, then A through the log
        const fk = ramp(t, T.like - 0.3, T.like, E.lin);
        V.place(friend, { s: 0.6 + 0.4 * E.pop(fk), o: fk });
        const lf = clamp((t - T.like) / (likeAt - T.like));
        const lp = D4.at({ x: 132, y: 105 }, { x: 400, y: rig.cy.L }, E.inOut(lf), 0);
        like.set({ x: lp.x, y: lp.y, k: t >= T.like && t < likeAt ? 1 : 0 });
        const ef = clamp((t - T.entry) / (entryAt - T.entry));
        const ep = W.logA.at(E.inOut(ef));
        entry.set({ x: ep.x, y: ep.y, k: t >= T.entry && t < entryAt ? 1 : 0 });

        // the history under the page: 7 then 6 (a fall), later 7 then 8 (a rise)
        const first = !phase2 ? ramp(t, ans1, ans1 + 0.3, E.lin) : ramp(t, ans3, ans3 + 0.3, E.lin);
        const second = !phase2 ? ramp(t, ans2, ans2 + 0.3, E.lin) : ramp(t, ans4, ans4 + 0.3, E.lin);
        const h1 = phase2 ? pin1.seen : bad1.seen;
        const h2 = phase2 ? pin2.seen : bad2.seen;
        const fadeH = phase2 ? 1 : hide;
        seen.set({ k: ramp(t, ans1 - 0.4, ans1, E.lin) * fadeH });
        hist.set(0, { text: String(h1), tone: "green", solid: true, o: first * fadeH, s: 0.6 + 0.4 * E.pop(first) });
        hist.set(1, {
          text: String(h2),
          tone: phase2 ? "green" : "red",
          solid: true,
          o: second * fadeH,
          s: (0.6 + 0.4 * E.pop(second)) * (1 + 0.12 * flash(t, phase2 ? ans4 : ans2, (phase2 ? ans4 : ans2) + 0.3)),
        });
        const dk = ramp(t, ans2 + 0.1, ans2 + 0.5, E.lin) * hide;
        L5.drawOn(arrowDown, dk);
        V.show(arrowDown, dk > 0 ? 1 : 0);
        const uk = ramp(t, ans4 + 0.1, ans4 + 0.5, E.lin);
        L5.drawOn(arrowUp, uk);
        V.show(arrowUp, uk > 0 ? 1 : 0);
        backTag.set({ k: ramp(t, ans2 + 0.2, ans2 + 0.6, E.lin) * hide });
        sameTag.set({ k: ramp(t, T.fadeA, T.fadeB, E.lin) });
      };
    },
  });
})();
