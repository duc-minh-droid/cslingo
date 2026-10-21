/* Lecture 4 (ds-4) · scene 7 (FAILOVER): the leader wrote 20 changes and crashes; the followers lag behind it (A holds 15 of them,
   B 18, C 16). Promote the follower with the most changes (B): everything that follower had is kept, and the changes that no
   follower had (#19 and #20) are lost. Every number comes from D4.FAIL (asserted on load): what each follower holds, what it would
   lose if it were promoted (5, 2 or 4), the best choice and the lost changes. Four rows (the leader and three followers), each a
   strip of twenty cells, one per change. Colours: purple = a change that a node holds, blue = the leader, red = a crash, a node
   that would lose changes and the lost changes, green = the best follower and the safe choice, grey = followers before the
   crash. Story (local seconds): 0.3 the rows pop; 1.2 the leader's strip fills and the followers' fill more slowly; 3.0 the
   counts pop; 3.6 a bolt hits the leader; 4.6, 5.4 and 6.2 the loss of A, B and C pops one at a time while the changes it
   is missing glow red on the leader's strip; 6.4 B gets the green ring; 8.7 B becomes the leader (crown, blue tag); 10.0 cells 19
   and 20 of the old leader turn red and "lost 2" pops. Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const F = D4.FAIL;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const FOLLOWERS = ["A", "B", "C"];
  D4.same(
    "failover scene: the leader wrote 20 and each follower holds what the storyboard says",
    [F.wrote, FOLLOWERS.map((k) => F.at[k]), FOLLOWERS.map((k) => F.lose[k])],
    [20, [15, 18, 16], [5, 2, 4]],
  );
  D4.same(
    "failover scene: promoting a follower loses the changes it is missing, the best follower loses the fewest",
    [FOLLOWERS.map((k) => F.wrote - F.at[k]), F.best, F.lost],
    [[5, 2, 4], "B", [19, 20]],
  );
  D4.same(
    "failover scene: the follower that is promoted loses exactly the changes no follower holds",
    [F.missing("B"), F.missing("A")[0]],
    [[19, 20], 16],
  );
  const MISS = Object.fromEntries(FOLLOWERS.map((k) => [k, F.missing(k)]));
  D4.same(
    "failover scene: A is missing 16 to 20, B 19 to 20 and C 17 to 20",
    [MISS.A, MISS.B, MISS.C],
    [
      [16, 17, 18, 19, 20],
      [19, 20],
      [17, 18, 19, 20],
    ],
  );

  const T = {
    rows: 0.3,
    rowStep: 0.2,
    leader: 1.2,
    cell: 0.05,
    follower: 1.5,
    counts: 3.0,
    bolt: 3.6,
    loss: { A: 4.6, B: 5.4, C: 6.2 },
    glow: 0.8,
    best: 6.4,
    crown: 8.7,
    lostCells: 10.0,
  };
  const ROW_Y = [70, 220, 370, 520];
  const NAMES = ["Leader", "Follower A", "Follower B", "Follower C"];
  const CELLS = { x: 200, n: F.wrote, w: 22, h: 44, gap: 3 };
  const cellAt = (row, n) => {
    if (row === 0) return T.leader + T.cell * n;
    const k = FOLLOWERS[row - 1];
    return T.follower + 0.07 * F.delay[k] + T.cell * n; // a follower with more delay starts later
  };

  V.scene({
    kicker: "FAILOVER",
    title: ["The leader crashes:", "promote the freshest copy"],
    dur: 13,
    caps: [
      [0.8, 3.4, `The leader wrote ${F.wrote} changes; followers lag.`],
      [3.6, 6.4, "The leader crashes. Which follower takes over?"],
      [6.5, 8.6, "Best: the most up-to-date follower."],
      [8.7, 10.0, `${F.best} takes over.`],
      [10.1, 12.8, `The ${F.lost.length} changes no follower had are lost.`],
    ],
    build(stage) {
      const rows = ROW_Y.map((y, r) => {
        const follower = r > 0 ? FOLLOWERS[r - 1] : null;
        return {
          y,
          follower,
          name: D4.tag(stage, {
            x: 12,
            y,
            anchor: "l",
            text: NAMES[r],
            tone: r === 0 ? "blue" : "grey",
            solid: r === 0,
          }),
          strip: D4.chips(stage, {
            x: CELLS.x,
            y: y - 22,
            n: CELLS.n,
            w: CELLS.w,
            h: CELLS.h,
            gap: CELLS.gap,
            fs: 0,
            lip: 3,
            radius: 7,
            tone: "purple",
          }),
          count: D4.tag(stage, { x: 712, y, anchor: "l", text: `#${follower ? F.at[follower] : F.wrote}` }),
          loss: follower
            ? D4.tag(stage, { x: 800, y, anchor: "l", text: `lose ${F.lose[follower]}`, tone: "red" })
            : D4.tag(stage, { x: 800, y, anchor: "l", text: `lost ${F.lost.length}`, tone: "red", solid: true }),
        };
      });
      const top = D4.svg(stage); // above the tags, so the crowns, the bolt and the crosses are never hidden by them
      const crownL = top.appendChild(D4.crown(150, ROW_Y[0] - 28, 44, "blue"));
      const crownB = top.appendChild(D4.crown(170, ROW_Y[2] - 28, 44, "blue"));
      const bolt = top.appendChild(D4.bolt(100, ROW_Y[0], 70, "red"));
      const crosses = F.lost.map((n) =>
        top.appendChild(L5.cross(CELLS.x + (n - 1) * (CELLS.w + CELLS.gap) + CELLS.w / 2, ROW_Y[0], 22, "red")),
      );

      return (t) => {
        rows.forEach((r, i) => {
          const k = ramp(t, T.rows + T.rowStep * i * 0.5, T.rows + T.rowStep * i * 0.5 + 0.5, E.lin);
          const best = r.follower === F.best;
          const crashed = ramp(t, T.bolt, T.bolt + 0.4, E.lin);
          const promoted = ramp(t, T.crown, T.crown + 0.4, E.lin);
          let tone = i === 0 ? "blue" : "grey";
          let solid = i === 0;
          if (i === 0 && crashed > 0.5) [tone, solid] = ["red", true];
          if (best && promoted > 0.5) [tone, solid] = ["blue", true];
          r.name.set({ k, tone, solid });

          // the strip: a cell is purple once that node holds the change
          const held = i === 0 ? F.wrote : F.at[r.follower];
          const lostNow = ramp(t, T.lostCells, T.lostCells + 0.3, E.lin);
          r.strip.all((c) => {
            const present = c < held && t >= cellAt(i, c);
            const st = {
              o: k,
              ghost: !present,
              solid: present,
              tone: "purple",
              s: present ? 1 + 0.18 * flash(t, cellAt(i, c), cellAt(i, c) + 0.25) : 1,
            };
            if (i === 0 && F.lost.includes(c + 1) && lostNow > 0.4) Object.assign(st, { tone: "red", solid: false }); // a red tint, so the red cross on it shows
            // the changes a follower is missing glow red on the leader's strip while its loss is being read
            if (i === 0) {
              const reading = FOLLOWERS.find(
                (key) => MISS[key].includes(c + 1) && t >= T.loss[key] && t < T.loss[key] + T.glow,
              );
              if (reading)
                Object.assign(st, { ring: "red", ringK: ramp(t, T.loss[reading], T.loss[reading] + 0.2, E.lin) });
            }
            // the green ring on the best follower's last change
            if (best && c === held - 1 && t >= T.best)
              Object.assign(st, { ring: "green", ringK: ramp(t, T.best, T.best + 0.3, E.lin) });
            return st;
          });

          // the counts and the losses
          const kc = ramp(t, T.counts, T.counts + 0.4, E.lin);
          r.count.set({ k: kc, tone: best && t >= T.best ? "green" : "grey", solid: best && t >= T.best });
          if (r.follower) {
            const at = T.loss[r.follower];
            r.loss.set({
              k: ramp(t, at, at + 0.35, E.lin),
              tone: best && t >= T.best ? "green" : "red",
              solid: best && t >= T.best,
              s: 1 + 0.1 * flash(t, at, at + 0.3),
            });
          } else {
            r.loss.set({ k: ramp(t, T.lostCells + 0.1, T.lostCells + 0.5, E.lin) });
          }
        });

        // the crowns and the bolt
        const kcL = ramp(t, T.rows + 0.3, T.rows + 0.7, E.lin);
        V.place(crownL, { s: 0.6 + 0.4 * E.pop(kcL), o: kcL * (1 - ramp(t, T.bolt + 0.3, T.bolt + 0.7, E.lin)) });
        const kcB = ramp(t, T.crown, T.crown + 0.4, E.lin);
        V.place(crownB, { s: 0.6 + 0.4 * E.pop(kcB), o: kcB });
        const bk = ramp(t, T.bolt, T.bolt + 0.25, E.lin);
        V.place(bolt, { s: 0.5 + 0.5 * E.pop(bk), o: bk * (1 - ramp(t, T.bolt + 0.6, T.bolt + 0.9, E.lin)) });
        crosses.forEach((c, i) => {
          const k = ramp(t, T.lostCells + 0.2 + 0.1 * i, T.lostCells + 0.5 + 0.1 * i, E.lin);
          L5.drawOn(c, k);
          V.place(c, { s: 0.7 + 0.3 * E.pop(k), o: k });
        });
      };
    },
  });
})();
