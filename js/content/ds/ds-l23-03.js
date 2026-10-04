(function () {
  const partScope = (NIC.shared.dsL23 = NIC.shared.dsL23 || {});
  const { pick, reg3 } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig;

  /* ============ 3.2 Hash index, segments, compaction ============ */
  reg3({
    id: "ds-hashidx",
    order: 2,
    num: "3.2",
    title: "Hash index, segments and compaction",
    blurb: "Keep a map of key to byte offset in memory. Split the log into segments and compact them.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let limit = 6,
        segs = [[]],
        cnt = { mew: 0, purr: 0, yawn: 0 },
        idx = {},
        alive = true,
        lastGet = "Press <b>Get</b> for any key.",
        scanned = 0;
      const KEYS = ["mew", "purr", "yawn"];
      const rebuild = () => {
        idx = {};
        segs.forEach((sg, si) => sg.forEach((r, pi) => (idx[r.k] = { s: si, p: pi })));
      };
      const write = (k) => {
        if (segs[segs.length - 1].length >= limit) segs.push([]);
        const sg = segs[segs.length - 1];
        sg.push({ k, v: ++cnt[k] });
        if (alive) idx[k] = { s: segs.length - 1, p: sg.length - 1 };
      };
      for (let i = 0; i < 9; i++) write(["mew", "mew", "purr", "yawn", "mew", "purr", "mew", "yawn", "mew"][i]);
      const card =
        el(`<div class="card"><div class="card-head"><h2>Play counts, indexed</h2><span class="tag">3 videos, many plays</span></div>
        <div class="controls" id="h1"></div>
        <div class="controls" id="hkeys"></div>
        <div class="controls"><button class="btn primary" id="hp">Play a video (append)</button><button class="btn" id="hc">Compact old segments</button><button class="btn" id="hx">Crash and restart</button><button class="btn" id="hr">Rebuild index</button></div>
        <div id="hm" style="margin:8px 0"></div><div id="hs"></div>
        <div class="stat-row"><div class="stat"><small>Records on disk</small><b id="hn"></b></div><div class="stat blue"><small>Distinct keys</small><b id="hd"></b></div><div class="stat amber"><small>Disk reads by last Get</small><b id="hg"></b></div></div>
        <p id="ht" class="dim" style="min-height:48px"></p></div>`);
      root.appendChild(card);
      const sl = N.slider("Segment size (records)", 3, 8, 1, limit);
      sl.onInput((v) => (limit = v));
      qs("#h1", card).appendChild(sl);
      const draw = () => {
        qs("#hm", card).innerHTML =
          `<b>In-memory hash map</b> <span class="faint">(key → segment, position)</span><div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">${
            alive
              ? KEYS.filter((k) => idx[k])
                  .map((k) => `<span class="pill blue mono">${k} → seg ${idx[k].s + 1} @ ${idx[k].p}</span>`)
                  .join("")
              : '<span class="pill rose">memory lost: the map is empty</span>'
          }</div>`;
        qs("#hs", card).innerHTML = segs
          .map(
            (sg, si) =>
              `<div style="margin:6px 0"><span class="faint" style="font-size:12px">Segment ${si + 1}${si === segs.length - 1 ? " (active: still being written)" : " (closed)"}</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:3px">${sg.map((r) => `<span class="mono" style="border:2px solid var(--line-2);border-radius:8px;padding:2px 8px;font-size:12.5px;background:var(--panel-2)">${r.k}: ${r.v}</span>`).join("") || '<span class="faint">(empty)</span>'}</div></div>`,
          )
          .join("");
        const total = segs.reduce((a, s) => a + s.length, 0);
        qs("#hn", card).textContent = total;
        qs("#hd", card).textContent = new Set(segs.flat().map((r) => r.k)).size;
        qs("#hg", card).textContent = scanned || "-";
        qs("#ht", card).innerHTML = lastGet;
      };
      KEYS.forEach((k) => {
        const b = el(`<button class="btn small">Get ${k}</button>`);
        qs("#hkeys", card).appendChild(b);
        b.onclick = () => {
          if (!alive) {
            scanned = 0;
            lastGet = `<span style="color:var(--rose-ink)">The hash map died with the process, so the database cannot jump to <b>${k}</b>.</span> It must <b>rebuild</b> the map by reading every segment.`;
          } else if (!idx[k]) {
            scanned = 1;
            lastGet = `Not in the map: <b>${k}</b> does not exist.`;
          } else {
            scanned = 1;
            const r = segs[idx[k].s][idx[k].p];
            lastGet = `Map says <b>${k}</b> is in segment ${idx[k].s + 1} at position ${idx[k].p}: <b>one disk read</b> returns <b>${r.v}</b>. No scanning.`;
          }
          draw();
        };
      });
      qs("#hp", card).onclick = () => {
        write(pick(["mew", "mew", "purr", "yawn"]));
        lastGet =
          "Appended one record, and the map now points at it. Old values for that key stay on disk until compaction.";
        draw();
      };
      qs("#hc", card).onclick = () => {
        if (segs.length < 2) {
          lastGet = "Only one segment so far: keep playing until a second one opens.";
          draw();
          return;
        }
        const closed = segs.slice(0, -1),
          before = closed.reduce((a, s) => a + s.length, 0),
          latest = {};
        closed.flat().forEach((r) => {
          delete latest[r.k];
          latest[r.k] = r;
        });
        segs = [Object.values(latest), segs[segs.length - 1]];
        if (alive) rebuild();
        lastGet = `Compaction kept only the <b>latest value per key</b>: ${before} old records became <b>${segs[0].length}</b>. Disk space is reclaimed.`;
        draw();
      };
      qs("#hx", card).onclick = () => {
        alive = false;
        idx = {};
        scanned = 0;
        lastGet = "The process restarted and the in-memory map is gone. The data on disk is fine.";
        draw();
      };
      qs("#hr", card).onclick = () => {
        if (alive) {
          lastGet = "The map is already there.";
          draw();
          return;
        }
        alive = true;
        rebuild();
        scanned = segs.reduce((a, s) => a + s.length, 0);
        lastGet = `Rebuilt the map by scanning <b>${scanned}</b> records, oldest to newest (the last write of each key wins). On a huge log this is slow.`;
        draw();
      };
      draw();

      root.appendChild(
        predict({
          id: "ds-hashidx-1",
          q: "A play-counter log holds 1,000,000 records spread over 50 videos. Roughly how many entries does the in-memory hash map need?",
          opts: ["50, one per video", "1,000,000, one per record", "About 1,000, one per block of records"],
          a: 0,
          why: "The map holds one entry per distinct <b>key</b>: it points each key at the offset of its latest record. Many writes to the same key just update that one entry. That's why a few keys with lots of writes fit in memory easily, while billions of distinct keys do not.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-hashidx-2",
          q: "The machine restarts and the in-memory hash map is gone, but the log files on disk are fine. How does the database get its index back?",
          opts: [
            "Re-read the log from its oldest record to its newest",
            "Ask each client to resend every write it ever made to the store",
            "It can't: without the map, the data on disk cannot be read at all",
          ],
          a: 0,
          why: "The map is only a shortcut to data that is safely on disk. Rebuilding means scanning the segments from oldest to newest and re-adding every key, so the last write of each key wins. On a huge log that is slow, which is why real systems also save snapshots of the map.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-hashidx-3",
          q: "A hash index must fit in memory. Your database has 10 billion distinct keys but memory holds about one billion map entries. What is the problem?",
          opts: [
            "The map does not fit, so this design breaks down",
            "None: the operating system compacts it",
            "Only writes get slower, reads stay quick",
          ],
          a: 0,
          why: "The scheme is simple and fast only while all keys fit in RAM. Beyond that, lookups would fall back to slow disk reads or need a different structure.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Hash index</b>: an in-memory map of every key to its <b>byte offset</b> in the log. Reads are one jump, writes append and update the map. Simple, but <b>all keys must fit in memory</b>.",
            "The log is cut into <b>segments</b> (close a file at a size limit, write to a new one), then <b>compaction</b> keeps the latest value per key to save disk.",
            "<b>Pros</b>: sequential writes are much faster than random disk access, and crash recovery is easier because old values are never overwritten.",
            "<b>Cons</b>: the map must fit in RAM, <b>range queries</b> are inefficient, and a crash loses the map (rebuild it from the log).",
          ],
          "A hash map of offsets turns a slow scan into one jump, until the keys stop fitting in memory or you need a range.",
        ),
      );
    },
  });

  /* ============ 3.3 SSTables & memtables ============ */
  const SEGS = [
    // oldest to newest; null = tombstone
    [
      ["apple", 1],
      ["fig", 2],
      ["mango", 3],
      ["plum", 4],
    ],
    [
      ["apple", 5],
      ["kiwi", 6],
      ["mango", 7],
    ],
    [
      ["fig", 8],
      ["kiwi", null],
      ["plum", 9],
    ],
  ];
  function mergeRun(box, life) {
    const cell = (s, j, f) => {
      const [k, v] = SEGS[s][j],
        consumed = j < f.p[s],
        head = j === f.p[s];
      const taken = f.taken[0] === s && f.taken[1] === j,
        skipped = f.skipped.some((x) => x[0] === s && x[1] === j);
      const bd = taken ? "var(--teal)" : skipped ? "var(--rose)" : head ? "var(--blue)" : "var(--line-2)";
      return `<div class="${head ? "sm-head" : ""}" data-k="${k}" style="border:2px solid ${bd};border-radius:9px;padding:4px 8px;margin:4px 0;font-size:13px;opacity:${consumed && !taken && !skipped ? 0.35 : 1};background:${taken ? "color-mix(in srgb, var(--teal) 16%, var(--panel-2))" : head ? "color-mix(in srgb, var(--blue) 12%, var(--panel-2))" : "var(--panel-2)"};${head ? "cursor:pointer" : ""}${skipped ? ";text-decoration:line-through" : ""}"><b class="mono">${k}</b>: ${v === null ? '<span style="color:var(--rose-ink)">✗ tombstone</span>' : v}</div>`;
    };
    F.run(box, life, {
      code: [
        "pointers at the start of each segment",
        "key = smallest key under any pointer",
        "if several segments hold it, keep the newest one",
        "if the newest is a tombstone, write nothing",
        "advance every pointer that held that key",
      ],
      build(stage) {
        const r = el(`<div class="sm"></div>`);
        stage.appendChild(r);
        return r;
      },
      *frames() {
        const p = SEGS.map(() => 0),
          out = [];
        const snap = (x) => ({ p: p.slice(), out: out.slice(), taken: [-1, -1], skipped: [], ...x });
        yield snap({
          cap: "Three <b>sorted</b> segments (segment 3 is the newest). A pointer sits on the smallest unread key of each. Merging works like the merge step of merge sort.",
          line: 0,
        });
        while (p.some((x, i) => x < SEGS[i].length)) {
          const heads = SEGS.map((s, i) => (p[i] < s.length ? s[p[i]][0] : null));
          const key = heads.filter(Boolean).sort()[0];
          const who = heads.map((h, i) => (h === key ? i : -1)).filter((i) => i >= 0),
            win = Math.max(...who);
          const v = SEGS[win][p[win]][1];
          who.forEach((i) => p[i]++);
          const fr = { taken: [win, p[win] - 1], skipped: who.filter((i) => i !== win).map((i) => [i, p[i] - 1]) };
          if (v !== null) out.push([key, v]);
          const older =
            who.length > 1
              ? ` It is in segments ${who.map((i) => i + 1).join(" and ")}: keep the <b>newest</b> (segment ${win + 1}) and drop the older copy.`
              : "";
          const cap =
            v === null
              ? `<b>${key}</b>: the newest entry is a <b>tombstone</b>, so the key is deleted. Write nothing.${older}`
              : `Smallest key: <b>${key}</b>.${older || " It appears once, so write it."}`;
          const f = snap({ ...fr, cap, line: v === null ? 3 : who.length > 1 ? 2 : 1 });
          if (out.length === 0 && v !== null && who.length > 1)
            f.ask = {
              q: "Every pointer sits on its smallest unread key. Tap the segment head that goes into the output first.",
              pick: ".sm-head",
              a: [key],
              why: `Sorted order: <b>${key}</b> is smallest. Two segments hold it, and the newer one wins.`,
            };
          yield f;
        }
        yield snap({
          cap: "Done: <b>one</b> sorted segment. Overwritten values and the deleted key are gone, and no random disk access was needed.",
          line: 4,
        });
      },
      draw(sc, f) {
        sc.innerHTML = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">${SEGS.map((s, i) => `<div><div class="faint" style="font-size:12px;font-weight:800">Segment ${i + 1}${i === 2 ? " (newest)" : i === 0 ? " (oldest)" : ""}</div>${s.map((_, j) => cell(i, j, f)).join("")}</div>`).join("")}
          <div><div class="faint" style="font-size:12px;font-weight:800">Merged output</div>${f.out.map(([k, v]) => `<div style="border:2px solid var(--teal);border-radius:9px;padding:4px 8px;margin:4px 0;font-size:13px;background:var(--panel-2)"><b class="mono">${k}</b>: ${v}</div>`).join("") || '<div class="faint">(empty)</div>'}</div></div>`;
      },
    });
  }
  Object.assign(partScope, { mergeRun });
})();
