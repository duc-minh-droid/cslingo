/* Lecture 4 (ds-4) · scene 6 (NEW FOLLOWER): a new follower joins by taking a snapshot of the leader (entries #1 to #5), then asking
   for every change since the snapshot (lesson 4.4). The leader keeps taking writes the whole time (#6, #7 while the snapshot
   is being copied, #8 later), so nothing pauses: the new follower applies #6, #7 and #8 and has caught up. Every tick and entry
   comes from D4.JOIN (asserted on load); video seconds = 3.0 + 1.2 * tick, so #6 lands at 4.2 s, #7 at 5.4 s, the snapshot at 6.0 s
   and #8 at 7.8 s; the new follower applies #6, #7, #8 at 7.2, 8.4 and 9.6 s. Colours: blue = the leader, purple = log entries and
   their packets, orange = the snapshot and the question "since #5?" (attention), green = a copy that is applied and the follower
   once it has caught up, grey = the new follower before it has anything. Story (local seconds): 0.3 the cards pop and the leader's
   chips #1-#5 appear; 3.0 the orange bracket and the snapshot block (camera) pop; 3.6-6.0 the block slides down to the new
   follower while #6 and #7 appear on the leader; 6.0 its chips #1-#5 turn green; 6.2 the ask arrow "since #5?"; 7.2, 8.4 and 9.6
   a purple packet carries #6, #7 and #8 over and its chip turns green; 9.8 the card turns green and a tick pops. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const J = D4.JOIN;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  D4.same(
    "join scene: the snapshot holds #1 to #5, then #6 #7 #8 are the backlog",
    [J.snap, J.backlog],
    [5, [6, 7, 8]],
  );
  D4.same(
    "join scene: #6 and #7 are stored while the snapshot is copied, #8 after it landed",
    [J.during, J.writes[8] > J.copyDone, J.writes[6] < J.copyDone && J.writes[7] < J.copyDone],
    [[6, 7], true, true],
  );
  D4.same(
    "join scene: the new follower applies the backlog one entry a tick and is caught up at 5.5",
    [J.applyAt, J.caughtAt],
    [{ 6: 3.5, 7: 4.5, 8: 5.5 }, 5.5],
  );
  D4.same(
    "join scene: leader and follower hold the same entries at the end",
    [J.leaderAt(J.caughtAt), J.f3At(J.caughtAt)],
    [8, 8],
  );
  const sec = (tick) => 3.0 + 1.2 * tick;
  const N = 8;

  const T = {
    pop: 0.3,
    chip: 0.1,
    bracket: 3.0,
    slideA: 3.6,
    slideB: sec(J.copyDone), // 6.0
    askA: 6.2,
    askB: 7.0,
    packet: 0.6,
    caught: sec(J.caughtAt) + 0.2, // 9.8
  };
  const storedAt = (n) => (n <= J.snap ? T.pop + 0.4 + T.chip * (n - 1) : sec(J.writes[n]));
  const appliedAt = (n) => (n <= J.snap ? T.slideB + 0.08 * (n - 1) : sec(J.applyAt[n]));

  V.scene({
    kicker: "NEW FOLLOWER",
    title: ["A new follower joins", "with a snapshot"],
    dur: 12,
    caps: [
      [0.8, 2.8, "A new follower needs a copy."],
      [3.0, 4.8, "Take a snapshot of the leader."],
      [4.9, 7.1, "Writes keep coming while it copies."],
      [7.2, 9.4, "It asks for every change since."],
      [9.6, 11.7, "Caught up: no pause in writes."],
    ],
    build(stage) {
      const SLOT = { n: N, w: 76, h: 64, gap: 10 };
      const leader = D4.node(stage, { x: 60, y: 20, w: 816, h: 170, name: "Leader", tone: "blue", layout: "slots" });
      const f3 = D4.node(stage, { x: 60, y: 440, w: 816, h: 170, name: "New follower", tone: "grey", layout: "slots" });
      const texts = Array.from({ length: N }, (_, n) => `#${n + 1}`);
      const lChips = D4.chips(stage, { ...leader.slot(SLOT), texts, fs: 30, tone: "purple" });
      const fChips = D4.chips(stage, { ...f3.slot(SLOT), texts, fs: 30, tone: "green" });

      const svg = D4.svg(stage);
      // the bracket that marks "everything up to #5" on the leader
      const orange = D4.tone("orange");
      const left = lChips.mid(0).x - SLOT.w / 2;
      const right = lChips.mid(J.snap - 1).x + SLOT.w / 2;
      const by = lChips.mid(0).y + SLOT.h / 2 + 10;
      const bracket = svg.appendChild(
        V.s("path", {
          d: `M ${left} ${by - 8} V ${by} H ${right} V ${by - 8}`,
          fill: "none",
          pathLength: "1",
          "data-draw": "1",
          "stroke-width": 6,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: { stroke: orange.c },
        }),
      );
      // the snapshot block: a camera and a tag, sliding from the leader to the new follower
      const block = D4.tag(stage, { x: 468, y: 222, text: `snapshot: up to #${J.snap}`, tone: "orange", solid: true });
      const camera = svg.appendChild(D4.camera(318, 222, 56, "orange"));
      // the question the new follower asks the leader
      const ask = svg.appendChild(L5.arrow(330, 436, 330, 200, "orange", 1, { w: 8, head: 26 }));
      const askTag = D4.tag(stage, { x: 350, y: 318, anchor: "l", text: `since #${J.snap}?`, tone: "orange" });
      const tick = svg.appendChild(L5.tick(836, 476, 56, "green", { ink: true, w: 8 }));
      const packets = J.backlog.map((n) => D4.packet(stage, { text: `#${n}`, tone: "purple" }));

      return (t) => {
        const k = ramp(t, T.pop, T.pop + 0.5, E.lin);
        const landed = t >= T.slideB;
        const caught = ramp(t, T.caught, T.caught + 0.4, E.lin);
        leader.set({
          k,
          tone: "blue",
          crown: ramp(t, T.pop + 0.3, T.pop + 0.7, E.pop),
          bump: Math.max(...[6, 7, 8].map((n) => flash(t, storedAt(n), storedAt(n) + 0.3))) * 0.8,
        });
        f3.set({ k, ghost: !landed, tone: caught > 0.5 ? "green" : "grey" });

        // the leader's chips: stored entries are purple, the rest dashed slots
        lChips.all((i) => {
          const at = storedAt(i + 1);
          const present = t >= at;
          return {
            ghost: !present,
            solid: present,
            tone: "purple",
            o: k,
            s: present ? 1 + 0.14 * flash(t, at, at + 0.3) : 1,
          };
        });
        // the new follower's chips: dashed until applied, then green
        fChips.all((i) => {
          const at = appliedAt(i + 1);
          const present = t >= at;
          return {
            ghost: !present,
            solid: false,
            tone: present ? "green" : "grey",
            o: k,
            s: present ? 1 + 0.14 * flash(t, at, at + 0.3) : 1,
          };
        });

        // the bracket and the snapshot block sliding down
        const kb = ramp(t, T.bracket, T.bracket + 0.4, E.lin);
        L5.drawOn(bracket, kb);
        V.show(bracket, kb > 0 ? 1 - ramp(t, T.slideB, T.slideB + 0.3, E.lin) : 0);
        const kBlock = ramp(t, T.bracket + 0.1, T.bracket + 0.5, E.lin);
        const slide = E.inOut(ramp(t, T.slideA, T.slideB, E.lin));
        const dy = (410 - 222) * slide;
        const fade = 1 - ramp(t, T.slideB, T.slideB + 0.3, E.lin);
        block.set({ k: kBlock, y: dy, o: fade });
        V.place(camera, { y: dy, s: 0.6 + 0.4 * E.pop(kBlock), o: kBlock * fade });

        // the question and the answer: entries flow over one by one
        const ka = ramp(t, T.askA, T.askB, E.lin);
        const askFade = 1 - ramp(t, T.caught, T.caught + 0.4, E.lin);
        L5.drawOn(ask, ka);
        V.show(ask, ka > 0 ? askFade : 0);
        askTag.set({ k: ramp(t, T.askA + 0.3, T.askA + 0.7, E.lin), o: askFade });
        packets.forEach((pk, i) => {
          const n = J.backlog[i];
          const arrive = appliedAt(n);
          const f = clamp((t - (arrive - T.packet)) / T.packet);
          const p = D4.at(lChips.mid(n - 1), fChips.mid(n - 1), E.inOut(f), 0);
          pk.set({ x: p.x, y: p.y, k: t >= arrive - T.packet && t < arrive ? 1 : 0 });
        });
        V.place(tick, { s: 0.6 + 0.4 * E.pop(caught), o: caught });
        L5.drawOn(tick, ramp(caught, 0.2, 1, E.lin));
      };
    },
  });
})();
