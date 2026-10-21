/* Lecture 4 (ds-4) · scene 5 (SYNC OR ASYNC): the leader stores a write in 5 ms and the followers confirm 30 ms and 90 ms after
   that, so they hold it at 35 ms (A) and 95 ms (B). The leader may tell the client "done" at once (asynchronous: waits for none),
   after one follower (semi-synchronous: waits for one) or after all of them (synchronous: waits for all). Slower is safer: if the
   leader crashes right after answering, the write is lost when no follower holds it yet (lesson 4.3). One time axis, three rows,
   a blue playhead sweeps 0 to 95 ms. Every number comes from D4.SYNC (asserted on load). Colours: orange = the wait (the bar
   that grows), grey = a node that does not hold the write yet, green = a node that holds it and an answer that is safe, red = the
   crash and a lost write, purple = the followers' confirmations (the dashed lines), blue = the playhead.
   Story (local seconds): 0.3 the three rows pop, 1.0 the follower marks and dashed lines pop, 1.4 the leader dot of each row turns
   green (stored in 5 ms); 3.0-7.2 the playhead sweeps from 0 to 95 ms, each bar grows until its row's answer and the dots show who
   holds the write at that answer; 7.4 a tick next to each answer; 8.8 a bolt hits the leader of every row and its dot turns red;
   9.5, 9.9 and 10.3 the verdicts pop (lost, kept, kept) and the surviving green dots get green rings. Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const Y = D4.SYNC;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  D4.same("sync scene: when each node holds the write", Y.arrive, { L: 5, A: 35, B: 95 });
  D4.same(
    "sync scene: the answer time, copies at the answer, copies left after a leader crash and whether the write is lost",
    Y.modes.map((m) => [m.ack, m.copies, m.left, m.lost]),
    [
      [5, 1, 0, true],
      [35, 2, 1, false],
      [95, 3, 2, false],
    ],
  );
  Y.modes.forEach((m) => {
    const h = Y.holds(m.ack);
    D4.same(
      `sync scene: ${m.key} answers when exactly its ${m.copies} copies exist`,
      [[h.L, h.A, h.B].filter(Boolean).length, m.copies - 1 === m.left],
      [m.copies, true],
    );
  });
  const NAMES = ["Asynchronous", "Semi-sync", "Synchronous"];
  const WAITS = Y.modes.map((m) => `waits for ${m.waits}`);

  // ---------- layout (stage px) ----------
  const X = (ms) => 264 + 4.4 * ms;
  const ROW_Y = [150, 330, 510];
  const DOT_X = { L: 766, A: 828, B: 890 };
  const T = {
    rows: 0.3,
    rowStep: 0.2,
    head: 1.0,
    leader: 1.4,
    sweep: 3.0,
    sweepEnd: 7.2,
    tick: 7.4,
    bolt: 8.8,
    verdict: [9.5, 9.9, 10.3],
  };
  const msAt = (t) => 95 * clamp((t - T.sweep) / (T.sweepEnd - T.sweep));
  const passedAt = (ms) => T.sweep + (T.sweepEnd - T.sweep) * (ms / 95); // when the playhead reaches ms

  V.scene({
    kicker: "SYNC OR ASYNC",
    title: ["Wait for the followers,", "or answer at once?"],
    dur: 12.5,
    caps: [
      [0.7, 2.9, "The leader stores the write in 5 ms."],
      [3.0, 5.6, `Followers confirm at ${Y.arrive.A} and ${Y.arrive.B} ms.`],
      [5.9, 8.6, "Answer at once, or wait for the followers."],
      [8.9, 12.4, "If the leader then crashes, only waiting keeps the write."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      // the follower marks: purple discs on top, dashed purple lines down the whole axis
      const marks = [
        { key: "A", ms: Y.arrive.A },
        { key: "B", ms: Y.arrive.B },
      ].map((m) => ({
        ...m,
        line: D4.wire(svg, {
          pts: [
            [X(m.ms), 66],
            [X(m.ms), 556],
          ],
          tone: "purple",
          w: 4,
          dash: "10 10",
        }),
        disc: D4.disc(stage, { x: X(m.ms), y: 40, size: 44, text: m.key, tone: "purple" }),
      }));
      const copiesTag = D4.tag(stage, { x: 828, y: 40, text: "copies" });
      const playLine = svg.appendChild(
        V.s("line", {
          x1: X(0),
          y1: 66,
          x2: X(0),
          y2: 556,
          "stroke-width": 6,
          "stroke-linecap": "round",
          style: { stroke: D4.tone("blue").c },
        }),
      );
      const counter = D4.tag(stage, { x: X(0), y: 598, text: "0 ms", tone: "blue", solid: true });

      const rows = Y.modes.map((m, i) => {
        const y = ROW_Y[i];
        return {
          m,
          y,
          name: D4.tag(stage, { x: 12, y: y - 28, anchor: "l", text: NAMES[i] }),
          waits: D4.tag(stage, { x: 12, y: y + 34, anchor: "l", text: WAITS[i] }),
          bar: D4.bar(stage, { x: 264, y: y - 17, w: 440, h: 34, tone: "orange" }),
          ack: D4.tag(stage, { x: X(m.ack), y: y - 44, text: `${m.ack} ms`, tone: "green", solid: true }),
          dots: ["L", "A", "B"].map((k) => D4.disc(stage, { x: DOT_X[k], y, size: 52, text: k, tone: "grey" })),
          verdict: D4.tag(stage, {
            x: 828,
            y: y + 56,
            text: m.lost ? "lost" : "kept",
            tone: m.lost ? "red" : "green",
            solid: true,
          }),
          tick: L5.tick(X(m.ack) + 58, y - 44, 30, "green", { ink: true, w: 6 }),
          bolt: D4.bolt(DOT_X.L, y, 60, "red"),
        };
      });
      const top = D4.svg(stage);
      rows.forEach((r) => top.append(r.tick, r.bolt));
      // green rings round the dots that keep the write after the leader crashes (rows 2 and 3)
      const green = D4.tone("green");
      rows.forEach((r) => {
        const h = Y.holds(r.m.ack);
        r.rings = ["A", "B"].map((key) =>
          h[key]
            ? top.appendChild(
                V.s("circle", {
                  cx: DOT_X[key],
                  cy: r.y,
                  r: 34,
                  fill: "none",
                  "stroke-width": 5,
                  style: { stroke: green.edge },
                }),
              )
            : null,
        );
      });

      return (t) => {
        // rows pop in
        rows.forEach((r, i) => {
          const k = ramp(t, T.rows + T.rowStep * i, T.rows + T.rowStep * i + 0.4, E.lin);
          r.name.set({ k });
          r.waits.set({ k });
        });
        const kh = ramp(t, T.head, T.head + 0.4, E.lin);
        marks.forEach((m, i) => {
          m.disc.set({ k: ramp(t, T.head + 0.1 * i, T.head + 0.1 * i + 0.4, E.lin) });
          m.line.set({ k: kh, o: kh });
        });
        copiesTag.set({ k: kh });

        // the playhead and its counter
        const ms = msAt(t);
        const sweeping = ramp(t, T.sweep - 0.2, T.sweep, E.lin);
        playLine.setAttribute("x1", X(ms).toFixed(1));
        playLine.setAttribute("x2", X(ms).toFixed(1));
        V.show(playLine, sweeping);
        counter.set({ text: `${Math.round(ms)} ms`, x: X(ms) - X(0), k: sweeping });

        rows.forEach((r, i) => {
          const m = r.m;
          const upto = Math.min(ms, m.ack);
          const grow = ramp(t, T.sweep - 0.3, T.sweep, E.lin);
          r.bar.set({
            k: grow ? upto / 100 : 0,
            tone: "orange",
            o: ramp(t, T.rows + T.rowStep * i, T.rows + T.rowStep * i + 0.4, E.lin),
          });
          const at = passedAt(m.ack);
          r.ack.set({ k: ramp(t, at, at + 0.35, E.lin), s: 1 + 0.1 * flash(t, at, at + 0.3) });
          // who holds the write: the dots stop at the row's own answer
          const holds = Y.holds(upto);
          const dead = t >= T.bolt + 0.3;
          r.dots.forEach((d, di) => {
            const key = ["L", "A", "B"][di];
            const green = key === "L" ? t >= T.leader : holds[key];
            const since = key === "L" ? T.leader : passedAt(Y.arrive[key]);
            const lost = key === "L" && dead;
            d.set({
              k: ramp(t, T.rows + T.rowStep * i + 0.1, T.rows + T.rowStep * i + 0.5, E.lin),
              tone: lost ? "red" : green ? "green" : "grey",
              s: 1 + 0.16 * flash(t, since, since + 0.3),
            });
          });
          const ringK = ramp(t, T.verdict[i], T.verdict[i] + 0.3, E.lin);
          r.rings.forEach((ring) => ring && V.place(ring, { s: 0.7 + 0.3 * E.pop(ringK), o: ringK }));
          r.verdict.set({ k: ramp(t, T.verdict[i], T.verdict[i] + 0.35, E.lin) });
          const tk = ramp(t, T.tick + 0.1 * i, T.tick + 0.1 * i + 0.4, E.lin);
          L5.drawOn(r.tick, ramp(tk, 0.2, 1, E.lin));
          V.place(r.tick, { s: 0.7 + 0.3 * E.pop(tk), o: tk });
          const bk = ramp(t, T.bolt, T.bolt + 0.25, E.lin);
          V.place(r.bolt, { s: 0.5 + 0.5 * E.pop(bk), o: bk * (1 - ramp(t, T.bolt + 0.6, T.bolt + 0.9, E.lin)) });
        });
      };
    },
  });
})();
