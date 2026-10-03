(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { Circ, Ln, PK, R, T, arrow, seq, svg } = partScope;
  const B = NIC.bank;

  /* ================= ds-hashidx ================= */
  function figTape() {
    const recs = [
        ["a", 14, "0"],
        ["b", 9, "14"],
        ["c", 12, "23"],
        ["d", 8, "35"],
      ],
      s = 8,
      x0 = 30;
    let b = T(8, 18, "Log file, drawn to scale (bytes)", { s: 12, c: "var(--text-dim)" }),
      x = x0;
    recs.forEach(([k, n, off], i) => {
      b +=
        R(x, 34, n * s, 48, { f: "var(--blue-dim)", st: "var(--blue)", rx: 4 }) +
        T(x + (n * s) / 2, 56, `key ${k}`, { a: "middle", s: 12 }) +
        T(x + (n * s) / 2, 73, `${n} B`, { a: "middle", s: 11, c: "var(--text-dim)", w: 700 });
      b += Ln(x, 82, x, 96, "var(--text-dim)", 2) + T(x, 112, off, { a: "middle", m: true, s: 12 });
      x += n * s;
    });
    b +=
      Ln(x, 82, x, 96, "var(--rose)", 2) +
      T(x, 112, "43", { a: "middle", m: true, s: 12, c: "var(--rose-ink)" }) +
      T(x, 130, "end of file", { a: "middle", s: 12, c: "var(--text-dim)" });
    b += T(8, 156, "Hash map in memory", { s: 12, c: "var(--text-dim)" });
    recs.forEach(
      ([k, , off], i) =>
        (b +=
          R(10 + i * 104, 166, 96, 34, { f: "var(--panel)", st: "var(--line-2)" }) +
          T(58 + i * 104, 188, `${k} → ${off}`, { a: "middle", m: true, s: 13 })),
    );
    return svg(440, 212, b);
  }

  function figSegMatrix() {
    const keys = ["a", "b", "c", "d", "e"],
      S = { 1: { a: 1, b: 2, c: 3, d: 4 }, 2: { b: 5, c: 6, e: 7 }, 3: { c: 8, e: 9 } },
      x0 = 64,
      cw = 118;
    let b = T(8, 16, "Compaction merges S1 and S2 only. S3 is newer and is left alone.", {
      s: 12,
      c: "var(--text-dim)",
    });
    ["S1 (oldest)", "S2", "S3 (newer)"].forEach(
      (t, i) => (b += T(x0 + i * cw + cw / 2, 44, t, { a: "middle", s: 12 })),
    );
    keys.forEach((k, j) => {
      b += T(24, 78 + j * 42, k, { a: "middle", m: true });
      [1, 2, 3].forEach((s, i) => {
        const v = S[s][k],
          x = x0 + i * cw + 4,
          y = 56 + j * 42;
        if (v == null) {
          b += R(x, y, cw - 8, 36, { f: "none", st: "var(--line)", d: "4 4", sw: 1.5, rx: 6 });
          return;
        }
        const cell =
          R(x, y, cw - 8, 36, {
            f: s === 3 ? "var(--panel-2)" : "var(--blue-dim)",
            st: s === 3 ? "var(--line-2)" : "var(--blue)",
            rx: 6,
          }) + T(x + (cw - 8) / 2, y + 23, `${k} = ${v}`, { a: "middle", m: true, s: 13 });
        b += s === 3 ? cell : PK(`S${s}${k}`, cell);
      });
    });
    return svg(430, 276, b);
  }

  function figGauge() {
    const cx = 230,
      cy = 176,
      r = 140,
      P = (f, rr = r) => {
        const t = Math.PI * (1 - f);
        return [(cx + rr * Math.cos(t)).toFixed(1), (cy - rr * Math.sin(t)).toFixed(1)];
      };
    const arc = (f0, f1, c) => {
      const a = P(f0),
        z = P(f1);
      return `<path d="M${a} A${r},${r} 0 0 1 ${z}" fill="none" stroke="${c}" stroke-width="26"/>`;
    };
    let b = arc(0, 0.7, "var(--teal)") + arc(0.7, 0.9, "var(--amber)") + arc(0.9, 1, "var(--rose)");
    const n = P(0.4, r - 30);
    b += Ln(cx, cy, n[0], n[1], "var(--ink)", 5) + Circ(cx, cy, 9, { f: "var(--ink)", st: "var(--ink)", sw: 1 });
    const l0 = P(0, r + 30),
      l5 = P(0.5, r + 22),
      l1 = P(1, r + 30);
    b +=
      T(l0[0], cy + 22, "0%", { a: "middle", s: 12 }) +
      T(l5[0], +l5[1] + 2, "50%", { a: "middle", s: 12 }) +
      T(l1[0], cy + 22, "100%", { a: "middle", s: 12 });
    b += T(cx, cy + 50, "Index memory used: 6.4 GB of the 16 GB set aside", { a: "middle", s: 13 });
    b += T(cx, cy + 70, "At 100% the hash map no longer fits in memory", { a: "middle", s: 12, c: "var(--text-dim)" });
    return svg(460, 262, b);
  }

  function figCrash() {
    const L = [
      [70, "Client"],
      [240, "Store (memory)"],
      [410, "Log (disk)"],
    ];
    const m = [
      { id: "c1", from: 0, to: 1, y: 74, label: "set(k, v)" },
      { id: "c2", from: 1, to: 2, y: 114, label: "append  k,v" },
      { id: "c3", from: 2, to: 1, y: 154, label: "saved at byte 90", d: "5 4" },
    ];
    let extra =
      R(40, 180, 400, 30, { f: "var(--rose-dim)", st: "var(--rose)", rx: 6 }) +
      T(240, 200, "power cut here", { a: "middle", c: "var(--rose-ink)" });
    extra +=
      R(150, 224, 180, 34, { f: "none", st: "var(--line-2)", d: "5 4", rx: 6 }) +
      T(240, 246, "map: k → 90  (never ran)", { a: "middle", s: 12, c: "var(--text-dim)", m: true });
    return seq(480, 270, L, m, { extra });
  }

  B.add("ds-hashidx", [
    {
      type: "mcq",
      q: "A new 11-byte record for key <b>a</b> is appended to this log. What does the hash map store for <b>a</b> afterwards?",
      fig: figTape(),
      o: ["0", "35", "43", "54"],
      a: 2,
      hint: "The old records fill 14 + 9 + 12 + 8 bytes. A new record starts where they end.",
      why: "The map holds the byte where the record <i>starts</i>. The file currently ends at 43 (14 + 9 + 12 + 8), so the new record begins there. The old record at 0 stays in the file until compaction, but nothing points to it any more.",
    },
    {
      type: "pick",
      q: "S1 and S2 are merged into one segment, keeping the newest value for each key <i>within those two</i>. Compaction does not look at S3. <b>Tap every record that is kept in the merged segment.</b>",
      fig: figSegMatrix(),
      a: ["S1a", "S1d", "S2b", "S2c", "S2e"],
      why: "Within S1 and S2 only b = 2 and c = 3 are overwritten (by 5 and 6), so they go. Records c = 6 and e = 7 stay even though S3 has newer values, because the merge never reads S3. The newer segment simply wins at read time.",
    },
    {
      type: "slider",
      q: "The keys will triple in number over the next year, and each key still needs the same memory. About what percentage of the 16 GB budget will the hash index need?",
      fig: figGauge(),
      min: 0,
      max: 200,
      step: 10,
      ans: 120,
      tol: 15,
      unit: "%",
      hint: "The gauge reads 40%. Triple it.",
      why: "6.4 GB is 40% of 16 GB, and 40% × 3 = 120%. The map would no longer fit in memory, which is the hash index's limit. Past that point you need a different design, such as sorted segments with a sparse index.",
    },
    {
      type: "mcq",
      q: "The power fails after the log append but before the in-memory map is updated. On restart the store rebuilds its map by replaying the log. What happens to this write?",
      fig: figCrash(),
      o: [
        "It is found, as replaying the log picks the record up",
        "It is lost, because the map never learnt that it existed",
        "It is half-applied, so the store must delete that record",
        "It is lost unless the client sends the same write again",
      ],
      a: 0,
      why: "The log is the source of truth and the map is only a shortcut that is rebuilt from it. A complete record that reached the disk comes back during the replay. Appending first and updating the map second is what makes this safe.",
    },
  ]);

  /* ================= ds-sstable ================= */
  function figStack() {
    const layers = [
      ["Memtable (memory)", ["m: deleted", "p = 4"], "violet", [0]],
      ["SSTable 3 (newest)", ["k = 2", "m = 9"], "blue"],
      ["SSTable 2", ["m = 7", "q = 1"], "blue"],
      ["SSTable 1 (oldest)", ["m = 3", "r = 5"], "blue"],
    ];
    let b = T(8, 16, "get(m) looks in the layers from the top down", { s: 12, c: "var(--text-dim)" });
    layers.forEach(([name, chips, col, dead], j) => {
      const y = 28 + j * 62;
      b += R(40, y, 430, 52, { f: `var(--${col}-dim)`, st: `var(--${col})` }) + T(52, y + 31, name, { s: 13 });
      chips.forEach((c, i) => {
        const x = 270 + i * 100,
          isDead = c.includes("deleted");
        b +=
          R(x, y + 8, 92, 36, {
            f: isDead ? "var(--rose-dim)" : "var(--panel)",
            st: isDead ? "var(--rose)" : "var(--line-2)",
            rx: 6,
          }) + T(x + 46, y + 31, c, { a: "middle", m: true, s: 12, c: isDead ? "var(--rose-ink)" : "var(--text)" });
      });
    });
    b += arrow(20, 40, 20, 262, "var(--text-dim)", 3);
    return svg(480, 284, b);
  }

  function figMergeTrace() {
    const A = ["a = 1", "c = 3", "e = 5", "g = 7"],
      Bn = ["c = 9", "d = 4", "g: deleted", "h = 2"],
      O = [
        ["a", "a = 1"],
        ["c", "c = 9"],
        ["d", "d = 4"],
        ["e", "e = 5"],
        ["g", "g = 7"],
        ["h", "h = 2"],
      ];
    let b = T(8, 18, "A and B are the two oldest segments. Nothing older exists.", { s: 12, c: "var(--text-dim)" });
    b +=
      T(60, 44, "A (older)", { a: "middle", s: 12 }) +
      T(190, 44, "B (newer)", { a: "middle", s: 12 }) +
      T(390, 44, "Merged output", { a: "middle", s: 12 });
    A.forEach(
      (t, i) =>
        (b +=
          R(8, 54 + i * 40, 104, 34, { f: "var(--panel)", st: "var(--line-2)", rx: 6 }) +
          T(60, 76 + i * 40, t, { a: "middle", m: true, s: 12 })),
    );
    Bn.forEach((t, i) => {
      const dead = t.includes("deleted");
      b +=
        R(136, 54 + i * 40, 108, 34, {
          f: dead ? "var(--rose-dim)" : "var(--panel)",
          st: dead ? "var(--rose)" : "var(--line-2)",
          rx: 6,
        }) + T(190, 76 + i * 40, t, { a: "middle", m: true, s: 12, c: dead ? "var(--rose-ink)" : "var(--text)" });
    });
    b += arrow(250, 140, 300, 140, "var(--text-dim)", 3);
    O.forEach(
      ([id, t], i) =>
        (b += PK(
          id,
          R(308, 54 + i * 40, 164, 34, { f: "var(--blue-dim)", st: "var(--blue)", rx: 6 }) +
            T(390, 76 + i * 40, t, { a: "middle", m: true, s: 12 }),
        )),
    );
    return svg(480, 300, b);
  }

  function figRuler() {
    const x0 = 110,
      cw = 14,
      X = (ch) => x0 + (ch.charCodeAt(0) - 97) * cw;
    let b = T(8, 18, "Key ranges covered by each file. The query asks for j to n.", { s: 12, c: "var(--text-dim)" });
    b += R(X("j"), 28, X("n") + cw - X("j"), 238, {
      f: "var(--amber-dim)",
      st: "var(--amber)",
      d: "5 4",
      rx: 4,
      sw: 1.5,
    });
    for (let i = 0; i < 26; i++) {
      const ch = String.fromCharCode(97 + i);
      b += T(x0 + i * cw + cw / 2, 46, ch, { a: "middle", m: true, s: 11, c: "var(--text-dim)", w: 700 });
    }
    const bars = [
      ["mem", "Memtable", "g", "r", "violet"],
      ["s1", "SSTable 1", "a", "m", "blue"],
      ["s2", "SSTable 2", "h", "t", "blue"],
      ["s3", "SSTable 3", "p", "z", "blue"],
      ["s4", "SSTable 4", "c", "e", "blue"],
    ];
    bars.forEach(([id, name, a, z, col], i) => {
      const y = 64 + i * 40,
        w = X(z) + cw - X(a);
      b +=
        T(8, y + 21, name, { s: 12 }) +
        PK(
          id,
          R(X(a), y, w, 30, { f: `var(--${col}-dim)`, st: `var(--${col})`, rx: 6 }) +
            T(X(a) + w / 2, y + 20, `${a}–${z}`, { a: "middle", s: 12, m: true }),
        );
    });
    return svg(480, 278, b);
  }

  function figSteps() {
    const X = (t) => 56 + t * 6.7,
      Y = (n) => 240 - n * 33;
    const ev = [
      [0, 0],
      [5, 1],
      [10, 2],
      [15, 3],
      [20, 4],
      [25, 5],
      [30, 1],
      [35, 2],
      [40, 3],
      [45, 4],
      [50, 1],
      [55, 2],
      [60, 2],
    ];
    let b = Ln(56, 240, 462, 240, "var(--text-dim)", 2) + Ln(56, 240, 56, 24, "var(--text-dim)", 2);
    [0, 2, 4, 6].forEach(
      (n) =>
        (b +=
          Ln(56, Y(n), 462, Y(n), "var(--line)", 1.2) + T(48, Y(n) + 4, n, { a: "end", s: 11, c: "var(--text-dim)" })),
    );
    [0, 20, 40, 60].forEach((t) => (b += T(X(t), 258, t, { a: "middle", s: 11, c: "var(--text-dim)" })));
    b +=
      T(462, 276, "minutes", { a: "end", s: 12, c: "var(--text-dim)" }) +
      T(62, 16, "SSTables on disk", { s: 12, c: "var(--text-dim)" });
    let d = `M${X(0)},${Y(0)}`;
    for (let i = 1; i < ev.length; i++) d += `L${X(ev[i][0])},${Y(ev[i - 1][1])}L${X(ev[i][0])},${Y(ev[i][1])}`;
    b += `<path d="${d}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    [
      ["A", 12, 2],
      ["B", 28, 5],
      ["C", 33, 1],
      ["D", 48, 4],
      ["E", 58, 2],
    ].forEach(
      ([id, t, n]) =>
        (b += PK(
          id,
          Circ(X(t), Y(n) - 16, 13, { f: "var(--panel)", st: "var(--ink)" }) +
            T(X(t), Y(n) - 11.5, id, { a: "middle", s: 12 }),
        )),
    );
    return svg(480, 284, b);
  }

  B.add("ds-sstable", [
    {
      type: "mcq",
      q: "A store holds the layers below. A client deleted <b>m</b> recently. What does <code>get(m)</code> return?",
      fig: figStack(),
      o: [
        "Not found: the top layer to mention m says deleted",
        "9, because it is the newest value that m has on disk",
        "3, because the oldest segment holds the original value",
        "An error, because m appears in several layers at once",
      ],
      a: 0,
      why: "A read stops at the first layer that mentions the key, going from newest to oldest. Here that is the memtable's tombstone, so the answer is not found. The older values (9, 7 and 3) are still on disk until a merge discards them.",
    },
    {
      type: "pick",
      q: "A merge of the two oldest segments produced the output below. One output record is wrong. <b>Tap it.</b>",
      fig: figMergeTrace(),
      a: "g",
      why: "B deleted g, and no older segment exists, so the merge should drop g completely. Keeping g = 7 brings a deleted key back to life. The other five records are right: the newer c = 9 wins and the output stays sorted.",
    },
    {
      type: "pick",
      q: "Each segment is sorted, but each covers its own overlapping range of keys. A range query asks for keys j to n. <b>Tap every file the query must read.</b>",
      fig: figRuler(),
      a: ["mem", "s1", "s2"],
      why: "Any file whose range overlaps j to n may hold such keys, including the memtable. Segments from different flushes overlap, so a range scan has to read from several and merge the results. SSTable 3 (p to z) and SSTable 4 (c to e) cannot hold keys between j and n.",
    },
    {
      type: "pick",
      q: "A read for a key that does not exist must check the memtable and every SSTable on disk. The chart shows the number of SSTables over time as flushes add files and merges remove them. <b>Tap the moment such a read is slowest.</b>",
      fig: figSteps(),
      a: "B",
      why: "Each flush adds a file and each merge collapses them. Just before the first merge, at B, there are five files, so a missing-key read has the most places to look. After a merge, at C, only one is left. Merging keeps reads cheap.",
    },
  ]);

  NIC.bank.add("ds-ops", [
    {
      type: "slider",
      q: "A photo app has 6 servers handling 100 requests per second each, and 360 requests per second arrive. One server dies and the load is shared evenly. About how busy is each survivor?",
      min: 0,
      max: 150,
      step: 10,
      ans: 70,
      tol: 10,
      unit: "%",
      hint: "Five survivors give 500 req/s of capacity. 360 is a bit over 350, which is 70% of 500.",
      why: "Five servers can take 500 req/s and 360 of it is about 72%, so they cope with some headroom left. Before the fault each server was at 60%, so one ordinary fault cost about 12 points of headroom.",
    },
    {
      type: "order",
      q: "Put the steps of a careful release in order, from first to last.",
      items: [
        "Check the other servers can cover the load while one is updated",
        "Switch a single server to the new version",
        "Watch its errors and p99 for a while",
        "Roll the new version out to the remaining servers",
      ],
      why: "Headroom comes first, so nothing falls over while a server is busy. One server then takes the new code, and you only widen the rollout once its errors and p99 look healthy. A bug is the same on every copy, so the watching step is what protects the rest.",
    },
    {
      type: "cat",
      q: "Is each event likely to hit servers independently, or all of them together?",
      buckets: ["Independent (hardware)", "Correlated (software)"],
      items: [
        ["A disk wears out in server 3", 0],
        ["A memory leak ships in a new release", 1],
        ["A bad setting is pushed to every server", 1],
        ["A power cable is pulled out of one rack", 0],
        ["A date-handling bug breaks at midnight on every machine", 1],
        ["A network card fails on one machine", 0],
      ],
      why: "Physical parts wear out at different times, so a spare server absorbs one failure. A bug or setting lives in the code every copy shares, so all copies fail the same way, and extra servers do not help.",
    },
    {
      type: "multi",
      q: "Which of these make it less likely that one ordinary fault turns into an outage? Select all that apply.",
      o: [
        "Keep a spare server's worth of spare capacity",
        "Run every server at about 95% busy to save money",
        "Send a new release to one server first",
        "Raise an alarm when servers pass about 70% busy",
        "Deploy to every server at once, late at night",
      ],
      a: [0, 2, 3],
      why: "Spare capacity absorbs a dead server, a canary limits a bad release to a slice of traffic, and an early alarm gives time to act. Running hot leaves no room for a fault, and an overnight deployment still hits every server with the same bug.",
    },
    {
      type: "mcq",
      q: "A service has a goal of p99 under 300 ms. Of 1,000 requests in a minute, 15 take about 2 seconds and the other 985 take about 80 ms. Is the goal met?",
      o: [
        "No: p99 allows only 10 slow requests in 1,000, and there are 15",
        "Yes: 985 of the 1,000 requests were fast, which is almost all",
        "Yes: the median request is 80 ms, far below the 300 ms limit",
        "No: any request over 300 ms breaks the goal on its own",
      ],
      a: 0,
      hint: "1 in 100 of 1,000 requests is 10.",
      why: "p99 is the time that 99% of requests beat, so only 1% (10 requests here) may be slower. With 15 slow ones the 99th percentile sits at about 2 s. A good median hides this, which is why percentiles are watched instead.",
    },
    {
      type: "mcq",
      q: "A photo app has 5 servers handling 100 requests per second each, and 450 requests per second arrive. A plan updates one server at a time, taking it out of service while it restarts. What goes wrong?",
      o: [
        "The other 4 can handle only 400 req/s, below the 450 coming in",
        "The restarted server will always lose its saved photos",
        "Taking any server out forces the load balancer to shut down",
        "Four servers can handle 450 req/s but run more slowly",
      ],
      a: 0,
      hint: "Four servers at 100 each is 400. Compare that with 450.",
      why: "A rolling update removes capacity just as a fault does. With 450 req/s the app has no headroom to lose even one server, so the update itself causes the overload. Add a server or lower the traffic before you start.",
    },
  ]);

  NIC.bank.add("ds-querylab", [
    {
      type: "order",
      q: 'Build a query for "people at Bolt within two friendship hops of Ana". Put the blocks in order.',
      items: ["Start: Ana", "Go to friends", "Go to friends", "Works at Bolt"],
      why: "Start from Ana, hop twice to reach the people two steps away, then filter by employer. Filtering first would keep only Ana if she did not work at Bolt, and the hops would then have nobody to start from.",
    },
    {
      type: "cat",
      q: "Does each question only filter records, or does it need to follow relationships?",
      buckets: ["Filter only", "Needs hops"],
      items: [
        ["Everyone in Leeds who works at Bolt", 0],
        ["Friends of Ben's friends", 1],
        ["Everyone in York with a Bolt badge", 0],
        ["Who is three steps away from Ana?", 1],
        ["People whose employer is Acme", 0],
        ["Who could introduce me to Dee through a mutual friend?", 1],
      ],
      why: "Filters look at the fields of each record on its own, which every model handles easily. Friends of friends, steps away and introductions all depend on how people connect, so they need hops.",
    },
    {
      type: "mcq",
      q: "Everyone has 10 friends and nobody's friends overlap. Starting from one person, roughly how many people first appear on the third hop?",
      o: ["30", "100", "1,000", "10,000"],
      a: 2,
      hint: "Hop 1 adds 10. Each of them adds 10 more, so hop 2 adds 10 x 10, and hop 3 multiplies by 10 again.",
      why: "Each hop multiplies the frontier by 10: 10, then 100, then 1,000. Deeper hops grow fast, which is why a hop that costs a join or a fetch for every person gets expensive quickly.",
    },
    {
      type: "multi",
      q: "In the query lab you chain blocks one after another. Which statements are true? Select all that apply.",
      o: [
        "Two filters in a row give the same people in either order",
        "A hop adds only people not reached before",
        "A filter placed after a hop can change who you end up with",
        "In the graph, every extra hop adds a join to the query",
        "Adding a filter can never remove anyone from the list",
      ],
      a: [0, 1, 2],
      why: "Filters only narrow, so their order does not matter. A hop widens the list but skips people already reached, and a filter after it can trim the new arrivals. A graph follows edges rather than joining, and every filter can remove people.",
    },
    {
      type: "mcq",
      q: "Ana's friends are Ben and Cy. Ben's friends are Ana and Dee. Cy's friends are Ana, Dee and Eli. Start at Ana and go to friends twice. Who is reached for the first time on the second hop?",
      o: ["Dee and Eli", "Ana, Dee and Eli", "Ben, Cy, Dee and Eli", "Only Dee"],
      a: 0,
      why: "Hop 1 reaches Ben and Cy. Hop 2 looks at their friends: Ana, Dee, Eli. Ana is where you started, so only Dee and Eli are new, and Dee is reached via both Ben and Cy but counted once.",
    },
    {
      type: "match",
      q: "Match each situation to what it tells you about the three data models.",
      pairs: [
        ["Hops of unknown depth", "A graph just keeps following edges"],
        ["Each hop written as one more join", "Tables: the query grows with the depth"],
        ["Each hop fetched by application code", "Documents: extra round trips from the app"],
        ["A filter over one kind of record", "Easy in all three models"],
      ],
      why: "Graphs make traversal a repeatable move. Tables hard-wire one join per hop, and documents leave each hop to your own code. Plain filters need no relationships, so every model copes.",
    },
  ]);
})();
