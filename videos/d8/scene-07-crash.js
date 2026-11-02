/* Lecture 8 (ds-8) · scene 7 (CRASHES): two brokers hold the same waiting messages m3 and m4 in memory; the lower one also writes
   them to disk. Both crash: memory is wiped. After the restart the upper broker has nothing left (m3 and m4 are lost to its
   consumer), the lower one reloads them from disk and delivers them (lesson 8.2, 'When nodes crash'). Every list comes from D8.CRASH.
   Story (local seconds): 0.3 both rows pop, m1 and m2 already delivered; 0.6 m3 m4 wait in memory; 3.2 the lower broker copies them
   to disk; 5.6 both brokers crash and memory is wiped; 8.0 restart: row 1 shows m3 m4 lost, row 2 reloads them from disk (8.0-8.6)
   and delivers them (8.7-9.4): nothing lost. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const C = D8.CRASH;
  D8.same(
    "crash scene: m1 m2 delivered, m3 m4 waiting; memory only loses m3 m4, disk reloads and delivers them",
    [C.delivered, C.waiting, C.memory.lost, C.memory.consumer, C.disk.afterRestart, C.disk.consumer, C.disk.lost],
    [["m1", "m2"], ["m3", "m4"], ["m3", "m4"], ["m1", "m2"], ["m3", "m4"], ["m1", "m2", "m3", "m4"], []],
  );
  const T = {
    pop: 0.3,
    mem: 0.6,
    toDisk: [3.2, 3.4], // starts; each copy flies 0.5 s
    onDisk: 4.3,
    crash: 5.6,
    wipe: [5.8, 6.3],
    up: 8.0,
    reload: [8.0, 8.15], // disk -> memory, 0.45 s each
    send: [8.7, 8.9], // memory -> consumer, 0.5 s each
    lost: 8.3,
    lostTag: 8.8,
    safeTag: 9.6,
  };
  const fly = (t, t0, d) => ramp(t, t0, t0 + d, E.inOut);
  const join = (a) => a.join(" and ");

  V.scene({
    kicker: "CRASHES",
    title: ["Memory forgets,", "disk remembers"],
    dur: 11,
    caps: [
      [0.5, 3, `${join(C.waiting)} wait in the broker's memory.`],
      [3.2, 5.4, "The lower broker also writes them to disk."],
      [5.6, 7.8, "Both brokers crash: memory is wiped."],
      [8, 10.6, "After the restart, only the disk copies are left."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const row = (dy, disk) => {
        const bw = disk ? 560 : 420;
        const wire = D4.wire(svg, {
          pts: [
            [12 + bw, 175 + dy],
            [620, 175 + dy],
          ],
        });
        const broker = D4.node(stage, {
          x: 12,
          y: 80 + dy,
          w: bw,
          h: 190,
          name: "Broker",
          icon: "server",
          tone: "purple",
          layout: "slots",
        });
        const cons = D4.node(stage, { x: 620, y: 80 + dy, w: 304, h: 190, name: "Consumer", layout: "slots" });
        const my = 210 + dy; // the middle of the broker's body
        const memLabel = D4.label(stage, { x: 224, y: 112 + dy, text: "in memory", tone: "grey", fs: 28, anchor: "l" });
        const mem = D4.chips(stage, { x: 170, y: my - 26, n: 2, w: 70, h: 52, texts: C.waiting, tone: "orange" });
        const got = D4.chips(stage, {
          ...cons.slot({ n: 4, w: 60, h: 48, gap: 8 }),
          texts: [...C.delivered, ...C.waiting],
        });
        const out = { dy, broker, cons, wire, memLabel, mem, got, my };
        if (disk) {
          out.disk = D4.chips(stage, { x: 446, y: my - 24, n: 2, w: 52, h: 48, gap: 8, texts: C.waiting });
          out.diskTag = D4.tag(stage, { x: 492, y: 112 + dy, text: "on disk", tone: "green", solid: true });
        }
        return out;
      };
      const r1 = row(0, false);
      const r2 = row(310, true);
      // the pictograms lie above the cards (a layer made after them)
      const pic = D4.svg(stage);
      [r1, r2].forEach((r) => {
        r.ramG = pic.appendChild(D8.ram(110, r.my, 70, "orange"));
        r.ramGrey = pic.appendChild(D8.ram(110, r.my, 70, "grey"));
      });
      r2.diskG = pic.appendChild(D8.disk(400, r2.my, 66, "green"));
      const rowTags = [
        D4.tag(stage, { x: 120, y: 40, text: "memory only", tone: "grey" }),
        D4.tag(stage, { x: 120, y: 350, text: "memory + disk", tone: "grey" }),
      ];
      const lostTag = D4.tag(stage, { x: 772, y: 40, text: "lost", tone: "red", solid: true });
      const safeTag = D4.tag(stage, { x: 772, y: 350, text: "nothing lost", tone: "green", solid: true });

      // flying copies: row 2 memory -> disk, disk -> memory (reload) and memory -> consumer (delivery)
      const toDisk = C.waiting.map((m) => D4.packet(stage, { text: m, tone: "blue" }));
      const reload = C.disk.afterRestart.map((m) => D4.packet(stage, { text: m, tone: "orange" }));
      const deliver = C.disk.afterRestart.map((m) => D4.packet(stage, { text: m, tone: "blue" }));
      const top = D4.svg(stage);
      const crosses = C.memory.lost.map((_, j) => {
        const p = r1.got.top(2 + j);
        return top.appendChild(L5.cross(p.x, p.y - 16, 30, "red", { w: 7 }));
      });
      const nDel = C.delivered.length;

      return (t) => {
        const down = ramp(t, T.crash, T.crash + 0.3, E.lin) * (1 - ramp(t, T.up, T.up + 0.3, E.lin));
        const wipe = ramp(t, T.wipe[0], T.wipe[1], E.lin); // memory chips shrink away
        [r1, r2].forEach((r, ri) => {
          const k = E.out(D4.seq(t, T.pop, 0.15, 0.5, ri));
          rowTags[ri].set({ k });
          r.wire.set({ k });
          r.broker.set({
            k,
            down,
            bump: flash(t, T.up, T.up + 0.4) + flash(t, T.crash, T.crash + 0.3),
          });
          r.cons.set({ k, tone: "grey" });
          r.memLabel.set({ k });
          const mk = ramp(t, T.mem, T.mem + 0.4, E.lin);
          // RAM: orange while it holds messages, grey once wiped (row 2 refills it from disk)
          const refill =
            ri === 1
              ? ramp(t, T.reload[0] + 0.3, T.reload[0] + 0.5, E.lin) *
                (1 - ramp(t, T.send[1] + 0.3, T.send[1] + 0.5, E.lin))
              : 0;
          const orange = Math.max(1 - wipe, refill);
          V.place(r.ramG, { s: 0.7 + 0.3 * E.pop(mk), o: Math.min(1, mk * 3) * orange });
          V.place(r.ramGrey, { o: k * (1 - orange) });

          // the consumer: m1 m2 delivered (green); slots 3 and 4 empty until the restart
          r.got.all((i) => {
            if (i < nDel) return { tone: "green", solid: true, o: k };
            const j = i - nDel;
            if (ri === 0) {
              const lk = ramp(t, T.lost + 0.15 * j, T.lost + 0.15 * j + 0.3, E.lin);
              if (lk > 0) return { tone: "red", ghost: true, s: 0.8 + 0.2 * E.pop(lk), o: lk };
              return { text: "", ghost: true, o: k * 0.9 };
            }
            const arr = T.send[j] + 0.5;
            if (t >= arr) return { tone: "green", solid: true, s: 1 + 0.12 * flash(t, arr, arr + 0.3) };
            return { text: "", ghost: true, o: k * 0.9 };
          });

          // memory chips: pop in at 0.6, wiped by the crash; row 2: back from disk, then sent to the consumer
          r.mem.all((j) => {
            if (t < T.wipe[0] || ri === 0) {
              const w = t >= T.wipe[0] ? wipe : 0;
              return { tone: "orange", solid: true, s: (0.7 + 0.3 * E.pop(mk)) * (1 - w), o: mk * (w >= 1 ? 0 : 1) };
            }
            const back = T.reload[j] + 0.45;
            if (t < back || t >= T.send[j]) return { o: 0 };
            return { tone: "orange", solid: true, s: 1 + 0.1 * flash(t, back, back + 0.3) };
          });
        });

        // row 2: copies to disk, the disk chips stay through the crash
        C.waiting.forEach((m, j) => {
          const f = fly(t, T.toDisk[j], 0.5);
          const p = D4.at(r2.mem.mid(j), r2.disk.mid(j), f, -50);
          toDisk[j].set({ x: p.x, y: p.y, k: D8.edge(f, 5) });
          const arr = T.toDisk[j] + 0.5;
          const dk = ramp(t, arr - 0.05, arr + 0.2, E.lin);
          r2.disk.set(j, { tone: "green", solid: true, s: 0.7 + 0.3 * E.pop(dk), o: dk });
        });
        const k2 = E.out(D4.seq(t, T.pop, 0.15, 0.5, 1));
        V.place(r2.diskG, { s: 0.8 + 0.2 * k2, o: k2 });
        r2.diskTag.set({ k: ramp(t, T.onDisk, T.onDisk + 0.4, E.lin) });

        // restart: reload from disk into memory, then deliver
        C.disk.afterRestart.forEach((m, j) => {
          const f = fly(t, T.reload[j], 0.45);
          const p = D4.at(r2.disk.mid(j), r2.mem.mid(j), f, 50);
          reload[j].set({ x: p.x, y: p.y, k: D8.edge(f, 5) });
          const g = fly(t, T.send[j], 0.5);
          const q = D4.at(r2.mem.mid(j), r2.got.mid(nDel + j), g, -45);
          deliver[j].set({ x: q.x, y: q.y, k: D8.edge(g, 5) });
        });

        // row 1: m3 and m4 never arrive
        crosses.forEach((g, j) => {
          const ck = ramp(t, T.lost + 0.15 * j + 0.2, T.lost + 0.15 * j + 0.5, E.lin);
          V.place(g, { s: 0.6 + 0.4 * E.pop(ck), o: ck });
        });
        lostTag.set({ k: ramp(t, T.lostTag, T.lostTag + 0.4, E.lin) });
        safeTag.set({ k: ramp(t, T.safeTag, T.safeTag + 0.4, E.lin) });
      };
    },
  });
})();
