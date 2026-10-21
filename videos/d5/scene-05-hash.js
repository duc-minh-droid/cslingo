/* Lecture 5 (ds-5) · scene 5 (HASH PARTITIONING): a hash function turns a key into a number, and each node owns a range of hash values
   (0-3, 4-7, 8-11, 12-15), so keys that arrive in order (101, 102, 103 ...) land all over the nodes and the load is even
   (lesson 5.3). Eight keys: each goes into the hash box, comes out as a number (a toy hash from the lesson), finds its cell above the
   node that owns that number and drops into the node. Every hash, node and count comes from D5 (D5.ARRIVALS, D5.hashOf, D5.hNode,
   D5.HASH_RANGES), asserted on load. Colours: blue = the keys (the data), purple = the hash box and the hash ranges (the routing
   rule), orange = the hashed number in motion and the cell it lands on, green = an even node ("2" and the green ring). Story (local
   seconds): 0.2 the nodes, the sixteen cells, the box and the queue of keys pop; the first key goes slowly (1.4-4.2), the next two
   faster, the rest 0.72 s each (6.4-10.0); 10.0 every node rings green with a "2". Hold to the end. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const { ramp, flash, lerp, ease: E } = V;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const ARR = D5.ARRIVALS;
  D5.same(
    "hash scene: eight keys 101 to 108 hash to 11 2 14 6 9 0 13 4 and land on nodes 3 1 4 2 3 1 4 2 (1-based)",
    [ARR.map((a) => a.id), ARR.map((a) => a.hash), ARR.map((a) => a.node + 1)],
    [
      [101, 102, 103, 104, 105, 106, 107, 108],
      [11, 2, 14, 6, 9, 0, 13, 4],
      [3, 1, 4, 2, 3, 1, 4, 2],
    ],
  );
  D5.same(
    "hash scene: every node ends up with two keys, and each key sits in the node whose hash range holds its number",
    [
      [0, 1, 2, 3].map((n) =>
        D5.count(
          ARR.map((a) => a.node),
          n,
        ),
      ),
      ARR.every((a) => Math.floor(a.hash / 4) === a.node),
    ],
    [[2, 2, 2, 2], true],
  );
  D5.same("hash scene: four hash ranges", D5.HASH_RANGES, ["0–3", "4–7", "8–11", "12–15"]);
  // the slot a key takes in its node: the order of arrival on that node
  const SLOT = ARR.map((a, i) => ARR.slice(0, i).filter((b) => b.node === a.node).length);

  // when each key starts and how long it takes (the first slowly, the next two faster, the rest 0.72 s each)
  const START = [1.4, 4.2, 5.4, 6.4, 7.12, 7.84, 8.56, 9.28];
  const DUR = [2.8, 1.2, 1.0, 0.72, 0.72, 0.72, 0.72, 0.72];
  D5.same("hash scene: the last key ends at 10.0", [START[7] + DUR[7]], [10.0]);
  const T = { pop: 0.2, ring: 10.0 };
  // fractions of a key's time: into the box, the number pops out, it flies to its cell, the key drops into the node
  const F = { box: [0, 0.22], pulse: [0.2, 0.32], disc: [0.3, 0.46], fly: [0.46, 0.66], drop: [0.66, 0.96] };

  V.scene({
    kicker: "HASH PARTITIONING",
    title: ["Hash the key,", "spread the load"],
    dur: 13,
    caps: [
      [0.8, 3.0, "A hash turns a key into a number."],
      [3.0, 5.4, "Each node owns a range of hash values."],
      [6.0, 9.4, "Keys arrive in order but land all over."],
      [9.8, 12.6, "Eight keys: two on every node."],
    ],
    build(stage) {
      const cl = D5.cluster(stage, { x: 12, y: 290, n: 4, w: 210, gap: 24, cols: 2, rows: 1, cw: 64, ch: 44, cg: 8 });
      const nc = D5.cells(stage, {
        n: 16,
        per: 4,
        centres: [117, 351, 585, 819],
        y: 190,
        w: 46,
        h: 46,
        gap: 4,
        tone: "purple",
      });
      const hb = D5.hashBox(stage, { x: 700, y: 8, w: 190, h: 100 });
      const queue = ARR.map((a) => D5.chip(stage, { text: String(a.id), w: 64, h: 44, tone: "blue" }));
      const landing = ARR.map((a) => D5.chip(stage, { text: String(a.id), w: 64, h: 44, tone: "blue", solid: true }));
      const discs = ARR.map((a) => D5.disc(stage, { x: 0, y: 0, size: 56, text: String(a.hash), tone: "orange" }));
      const twos = [0, 1, 2, 3].map((n) =>
        D5.disc(stage, {
          x: cl.box(n).x + cl.box(n).w - 8,
          y: cl.box(n).y + 6,
          size: 48,
          text: String(
            D5.count(
              ARR.map((a) => a.node),
              n,
            ),
          ),
          tone: "green",
        }),
      );
      const queueAt = (i) => ({ x: 50 + 72 * i, y: 40 });
      const under = { x: hb.mid.x, y: hb.mid.y + 76 }; // where the number appears, under the box

      return (t) => {
        const kn = (n) => ramp(t, T.pop + 0.1 * n, T.pop + 0.1 * n + 0.5, E.lin);
        const done = ramp(t, T.ring, T.ring + 0.5, E.lin);
        for (let n = 0; n < 4; n++) {
          cl.set(n, {
            k: kn(n),
            tag: D5.HASH_RANGES[n],
            tagK: kn(n),
            tagTone: "purple",
            ring: "green",
            ringK: ramp(t, T.ring + 0.1 * n, T.ring + 0.1 * n + 0.5, E.lin),
            tone: done > 0.5 ? "green" : "grey",
          });
        }
        hb.set({
          k: kn(1),
          pulse: Math.max(
            ...ARR.map((_, i) => flash(t, START[i] + DUR[i] * F.pulse[0], START[i] + DUR[i] * F.pulse[1] + 0.2)),
          ),
        });

        // the cells: the one a key lands on lights up in orange while the key is on it
        for (let c = 0; c < 16; c++) {
          let lit = 0;
          ARR.forEach((a, i) => {
            if (a.hash !== c) return;
            const s = START[i];
            const d = DUR[i];
            lit = Math.max(
              lit,
              ramp(t, s + d * F.fly[1] - 0.05, s + d * F.fly[1] + 0.1, E.lin) *
                (1 - ramp(t, s + d * F.drop[1] - 0.1, s + d * F.drop[1] + 0.05, E.lin)),
            );
          });
          nc.set(c, {
            o: kn(c % 4),
            tone: lit > 0.3 ? "orange" : "purple",
            solid: lit > 0.3,
            ring: lit > 0.3 ? "orange" : undefined,
            ringK: lit,
          });
        }

        ARR.forEach((a, i) => {
          const s = START[i];
          const d = DUR[i];
          const at = (f) => s + d * f;
          const w = (pair, ease = E.inOut) => ease(ramp(t, at(pair[0]), at(pair[1]), E.lin));
          // the queued key: waits, flies into the box and is swallowed
          const qk = w(F.box);
          const qp = D5.fly(queueAt(i), hb.mid, qk, { arc: -30 });
          const qIn = D5.appear(ramp(t, T.pop + 0.05 * i, T.pop + 0.05 * i + 0.4, E.lin));
          queue[i].set({
            x: qp.x,
            y: qp.y,
            s: qIn.s * lerp(1, 0.4, qk),
            o: qIn.o * (1 - ramp(t, at(F.box[1]) - 0.05, at(F.box[1]), E.lin)),
            tone: "blue",
          });
          // the number comes out under the box and flies to its cell
          const target = nc.mid(a.hash);
          const dk = D5.appear(ramp(t, at(F.disc[0]), at(F.disc[1]), E.lin));
          const fk = w(F.fly);
          const dp = D5.fly(under, target, fk, { arc: 20 });
          const gone = ramp(t, at(F.drop[0]), at(F.drop[0]) + 0.1, E.lin);
          discs[i].set({ x: dp.x, y: dp.y, s: dk.s * lerp(1, 0.7, fk), k: dk.o > 0 ? 1 : 0, o: dk.o * (1 - gone) });
          // the key drops from its cell into its node
          const drop = w(F.drop);
          const lp = D5.fly(target, cl.slot(a.node, SLOT[i]), drop, { arc: 0 });
          landing[i].set({
            x: lp.x,
            y: lp.y,
            s: 0.01 + (t >= at(F.drop[0]) ? 1 : 0),
            o: t >= at(F.drop[0]) ? 1 : 0,
            tone: "blue",
            solid: true,
          });
        });
        twos.forEach((d, n) => d.set({ k: ramp(t, T.ring + 0.1 * n, T.ring + 0.1 * n + 0.5, E.lin) }));
      };
    },
  });
})();
