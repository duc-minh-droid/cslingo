(function () {
  const partScope = (NIC.shared.dsWorkshops = NIC.shared.dsWorkshops || {});
  const { fxOn, reg, snd } = partScope;
  const N = NIC,
    { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /* =====================================================================
     3.W  ENGINE ROOM: memtable, SSTables, compaction, crashes
     ===================================================================== */
  function engineRoom(stage, api, life) {
    const CAPM = 4,
      KEYS = ["apple", "date", "fig", "kiwi", "mango", "plum"];
    let mem, segs, wal, walOn, crashed, ctr, mode, slow, compactedAfterSlow;
    const seed = () => {
      mem = new Map();
      segs = [
        [
          ["apple", 1],
          ["fig", 2],
          ["kiwi", 3],
          ["mango", 4],
        ],
        [
          ["apple", 5],
          ["date", 6],
          ["kiwi", 7],
          ["plum", 8],
        ],
      ];
      wal = [];
      walOn = true;
      crashed = false;
      ctr = 8;
      slow = false;
      compactedAfterSlow = false;
    };
    seed();
    mode = "put";
    const card =
      el(`<div class="wk-card"><h3>Pick a key, then act on it<span class="wk-sp"></span><span class="faint" data-v style="text-transform:none;letter-spacing:0"></span></h3>
      <div class="wk-row" data-mode style="margin-bottom:12px"></div><div class="wk-keys" data-keys></div></div>`);
    const eng = el(`<div class="wk-card"><h3>The engine</h3><div class="wk-layers">
      <div class="wk-layer mem" data-mem><small>Memtable<br><span style="text-transform:none;letter-spacing:0">in memory, sorted, holds ${CAPM}</span></small><div class="wk-cells"></div></div>
      <div class="wk-layer" data-wal><small>Log file<br><span style="text-transform:none;letter-spacing:0">on disk, append-only</span></small><div class="wk-cells"></div></div>
      <div class="wk-disk" data-disk></div></div>
      <div class="wk-row" style="margin-top:12px" data-ctl></div></div>`);
    const out = el(
      `<div class="wk-out" data-out>Choose <b>Put</b>, <b>Delete</b> or <b>Get</b>, then tap a key.</div>`,
    );
    stage.append(card, eng, out);
    const setOut = (h) => {
      out.innerHTML = h;
      N.wk.flash(out);
    };
    const bCompact = el(`<button class="btn">Compact disk segments</button>`),
      bCrash = el(`<button class="btn rose">Crash the machine</button>`),
      bRestart = el(`<button class="btn primary">Restart</button>`),
      bRs = el(`<button class="btn ghost small">Reset</button>`);
    const walSeg = N.seg(
      [
        ["on", "Log on"],
        ["off", "Log off"],
      ],
      "on",
      (v) => {
        walOn = v === "on";
      },
    );
    qs("[data-ctl]", eng).append(bCompact, bCrash, bRestart, walSeg, bRs);
    const modeSeg = N.seg(
      [
        ["put", "Put"],
        ["del", "Delete"],
        ["get", "Get"],
      ],
      mode,
      (v) => {
        mode = v;
        drawKeys();
      },
    );
    qs("[data-mode]", card).appendChild(modeSeg);

    const cells = (rows, cls = "", hitKey) =>
      rows.length
        ? rows
            .map(
              ([k, v]) =>
                `<span class="wk-cell ${v === null ? "tomb" : ""} ${k === hitKey ? "hit" : ""} ${cls}">${k}: ${v === null ? "deleted" : "v" + v}</span>`,
            )
            .join("")
        : `<span class="wk-empty">(empty)</span>`;
    const memRows = () => [...mem.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, o]) => [k, o.v]);
    const layerEls = () => [qs("[data-mem]", eng), ...qsa("[data-disk] .wk-layer", eng)];
    function drawKeys() {
      const box = qs("[data-keys]", card);
      box.innerHTML = KEYS.map(
        (k) => `<button class="wk-key" data-mode="${mode}" data-k="${k}" ${crashed ? "disabled" : ""}>${k}</button>`,
      ).join("");
      qsa("[data-k]", box).forEach((b) => (b.onclick = () => act(b.dataset.k)));
    }
    function draw(newKey) {
      qs(".wk-cells", qs("[data-mem]", eng)).innerHTML = cells(memRows(), "new", newKey);
      qs(".wk-cells", qs("[data-wal]", eng)).innerHTML = wal.length
        ? wal.map(([k, v]) => `<span class="wk-cell">${k}: ${v === null ? "deleted" : "v" + v}</span>`).join("")
        : `<span class="wk-empty">${walOn ? "(nothing unsaved)" : "(log is off)"}</span>`;
      qs("[data-disk]", eng).innerHTML = segs
        .slice()
        .reverse()
        .map((s, i) => {
          const n = segs.length - i;
          return `<div class="wk-layer"><small>Segment ${n}<br><span style="text-transform:none;letter-spacing:0">${i === 0 ? "newest" : n === 1 ? "oldest" : "sorted, read-only"}</span></small><div class="wk-cells">${cells(s)}</div></div>`;
        })
        .join("");
      qs("[data-v]", card).textContent = `${segs.length} segment${segs.length === 1 ? "" : "s"} on disk`;
      qs("[data-mem]", eng).classList.toggle("crashed", crashed);
      bRestart.disabled = !crashed;
      bCrash.disabled = crashed;
      bCompact.disabled = crashed || segs.length < 2;
      drawKeys();
    }
    const flush = () => {
      const rows = memRows();
      segs.push(rows);
      mem = new Map();
      wal = [];
      snd("pop");
      draw();
      const last = qs("[data-disk] .wk-layer", eng);
      fxOn() && N.fx.springIn(last, { from: 0.85, bounce: 0.4, dur: 0.4 });
      api.say(
        `The memtable filled up, so it was written out as <b>Segment ${segs.length}</b>: already sorted, and never edited again.`,
        "happy",
      );
      api.done("flush");
    };
    function put(k, del) {
      if (crashed) return;
      const v = del ? null : ++ctr;
      mem.set(k, { v });
      if (walOn) wal.push([k, v]);
      snd(del ? "squeak" : "tap");
      draw(k);
      if (mem.size >= CAPM) life.timeout(flush, 350);
      else
        api.say(
          del
            ? `Deleting doesn't erase anything. It writes a <b>tombstone</b> for <b>${k}</b>; older copies stay until compaction.`
            : `Written to memory (and the log, if it is on). ${CAPM - mem.size} more until a flush.`,
          del ? "think" : "idle",
        );
    }
    const copies = (k) => (mem.has(k) ? 1 : 0) + segs.filter((s) => s.some(([x]) => x === k)).length;
    async function get(k) {
      if (crashed) return;
      const order = [
        { t: "memory", rows: memRows() },
        ...segs
          .slice()
          .reverse()
          .map((s, i) => ({ t: `Segment ${segs.length - i}`, rows: s })),
      ];
      const hitI = order.findIndex((l) => l.rows.some(([x]) => x === k)),
        checks = hitI < 0 ? order.length : hitI + 1,
        le = layerEls();
      le.forEach((e) => e.classList.remove("look", "found", "miss"));
      const my = ++getTok;
      for (let i = 0; i < checks; i++) {
        await new Promise((r) => life.timeout(r, fxOn() ? 260 : 0));
        if (my !== getTok) return;
        le[i].classList.add("look");
        snd("tick");
        await new Promise((r) => life.timeout(r, fxOn() ? 200 : 0));
        if (my !== getTok) return;
        le[i].classList.remove("look");
        le[i].classList.add(i === hitI ? "found" : "miss");
      }
      const row = hitI >= 0 ? order[hitI].rows.find(([x]) => x === k) : null;
      setOut(
        !row
          ? `<b>${k}</b> isn't anywhere: <span class="no">not found</span> after <b>${checks}</b> places checked.`
          : row[1] === null
            ? `<b>${k}</b>: the newest entry is a <b>tombstone</b>, so it's <span class="no">deleted</span>. Found in ${order[hitI].t} after <b>${checks}</b> check${checks > 1 ? "s" : ""}.`
            : `<b>${k}</b> = <span class="ok">v${row[1]}</span> from ${order[hitI].t}. Places checked: <b>${checks}</b>.`,
      );
      snd(row ? "correct" : "wrong");
      if (row && row[1] !== null && copies(k) >= 2) {
        api.say(
          `<b>${k}</b> exists in ${copies(k)} places. The search goes newest to oldest and stops at the first hit, so the <b>newest value wins</b>.`,
          "happy",
        );
        api.done("newest");
      }
      if (row && row[1] === null) {
        api.say("A tombstone hides every older copy. Compaction will finally remove the key for good.", "think");
        api.done("delete");
      }
      if (checks >= 3) {
        slow = true;
        api.say(
          `${checks} places to check for one key. The more segments pile up, the slower reads get. Try <b>Compact</b>.`,
          "sad",
        );
      } else if (slow && compactedAfterSlow && checks <= 2) {
        api.say(
          `Only <b>${checks}</b> places now. Compaction merged the segments and kept the newest value per key.`,
          "love",
        );
        api.done("compact");
      }
    }
    let getTok = 0;
    function act(k) {
      if (mode === "put") put(k, false);
      else if (mode === "del") put(k, true);
      else get(k);
    }

    bCompact.onclick = () => {
      const before = segs.length,
        latest = new Map();
      segs.forEach((s) => s.forEach(([k, v]) => latest.set(k, v)));
      const merged = [...latest.entries()].filter(([, v]) => v !== null).sort((a, b) => (a[0] < b[0] ? -1 : 1));
      segs = [merged];
      if (slow) compactedAfterSlow = true;
      snd("whoosh");
      draw();
      fxOn() && N.fx.springIn(qs("[data-disk] .wk-layer", eng), { from: 0.8, bounce: 0.4, dur: 0.45 });
      setOut(
        `Merged <b>${before}</b> segments into <b>1</b> sorted segment. Newest values kept, tombstoned keys dropped: <b>${merged.length}</b> keys remain.`,
      );
      api.say(
        slow
          ? "Merged! Now read the same key again and count the places."
          : "Compacted. Fewer segments mean fewer places to check on each read.",
        "happy",
      );
    };
    bCrash.onclick = () => {
      const unsaved = mem.size;
      crashed = true;
      mem = new Map();
      snd("sad");
      draw();
      fxOn() && N.fx.shake(qs("[data-mem]", eng));
      setOut(
        `💥 Power cut. Memory is wiped: <b>${unsaved}</b> unsaved write${unsaved === 1 ? "" : "s"} gone from the memtable. The log file on disk has <b>${wal.length}</b> record${wal.length === 1 ? "" : "s"}.`,
      );
      api.say(
        unsaved
          ? "Everything in RAM has vanished. Will the log save us?"
          : "Nothing unsaved was in memory, so nothing to lose this time. Write a key first.",
        unsaved ? "shocked" : "idle",
      );
      bCrash._had = unsaved;
    };
    bRestart.onclick = () => {
      crashed = false;
      mem = new Map();
      wal.forEach(([k, v]) => mem.set(k, { v }));
      snd("tick");
      draw();
      const n = mem.size,
        lost = (bCrash._had || 0) - n;
      setOut(
        n
          ? `Restarted and <b>replayed the log</b>: ${n} write${n === 1 ? "" : "s"} recovered.${lost > 0 ? ` ${lost} were lost because the log was off when they were written.` : ""}`
          : `Restarted with an empty memtable.${lost > 0 ? ` ${lost} unsaved write${lost === 1 ? "" : "s"} lost forever: the log was off.` : ""}`,
      );
      if (n) {
        api.say(
          "The write-ahead log put everything back. That's why databases log before they acknowledge a write.",
          "love",
        );
        api.done("crash");
      } else if (lost > 0) api.say("Those writes are gone. Switch the log <b>on</b> and try again.", "cry");
    };
    bRs.onclick = () => {
      getTok++;
      seed();
      walSeg.querySelectorAll("button").forEach((b, i) => b.classList.toggle("on", i === 0));
      draw();
      setOut("Engine reset to two old segments.");
      api.say("Fresh engine: two old segments and an empty memtable.", "idle");
    };
    draw();
  }

  reg(3, {
    id: "ds-engine",
    num: "3.W",
    title: "Workshop: run a storage engine",
    blurb: "No code. Write, delete and read keys, then flush, compact and survive a crash.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "This engine keeps recent writes in a <b>memtable</b> and old data in sorted <b>segments</b>. Put, delete, get, then break it.",
        missions: [
          {
            id: "flush",
            t: "Trigger a flush",
            d: "In <b>Put</b> mode, write four different keys to fill the memtable.",
            hint: "Tap four keys one after another. Overwriting the same key doesn't grow the memtable.",
          },
          {
            id: "newest",
            t: "Newest value wins",
            d: "Switch to <b>Get</b> and read a key that has more than one copy.",
            hint: "<b>apple</b> is in both old segments. Read it and see which version comes back.",
          },
          {
            id: "delete",
            t: "Delete, then read",
            d: "Use <b>Delete</b> on a key, then <b>Get</b> it.",
            hint: "Delete doesn't remove data, it adds a tombstone. Get the same key and see what the search finds first.",
          },
          {
            id: "compact",
            t: "Make reads cheaper",
            d: "Read a key that takes <b>3 or more</b> checks, press <b>Compact</b>, then read it again.",
            hint: "<b>fig</b> only lives in the oldest segment, so it needs several checks. Compact, then get it again.",
          },
          {
            id: "crash",
            t: "Survive a power cut",
            d: "Write a key with the <b>log on</b>, <b>Crash</b> the machine, then <b>Restart</b>.",
            hint: "Put a key (don't fill the memtable), crash, restart. Try it once with the log off to see the difference.",
          },
        ],
        build: (stage, api) => engineRoom(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "ds-eng-1",
          q: "A write is acknowledged, then the machine loses power before the memtable is flushed. With a write-ahead log, what happens to the write?",
          opts: [
            "It is replayed from the log on restart",
            "It is gone, because memory was lost",
            "It was already in a sorted segment",
          ],
          a: 0,
          why: "The log is appended to disk before the write is acknowledged. After a crash the engine rebuilds the memtable by replaying it.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-eng-2",
          q: "Reads have slowed as the number of disk segments grew from 2 to 12. What brings read cost back down?",
          opts: [
            "Compaction: merge segments and keep the newest value per key",
            "Writing more keys to the memtable",
            "Turning the log off",
          ],
          a: 0,
          why: "A read may have to check every segment from newest to oldest. Merging them leaves fewer places to look, and throws away overwritten values and tombstones.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Writes go to the <b>memtable</b> (memory) and the <b>log</b>; a full memtable is flushed as a new <b>sorted segment</b>.",
            "A read checks memory, then segments <b>newest to oldest</b>, and stops at the first hit. Newest wins.",
            "<b>Delete</b> writes a tombstone; <b>compaction</b> merges segments, drops old values and finally removes deleted keys.",
            "The <b>log</b> is what lets memory be lost without losing data.",
          ],
          "Fast writes come from appending in memory; compaction pays the bill later by keeping reads short.",
        ),
      );
    },
  });
  L["ds-engine"] = {
    sum: "Write, delete and read keys in a log-structured engine; flush, compact and crash it.",
    steps: [
      {
        t: "What you will practise",
        b: `<p>You'll drive a small <b>log-structured</b> storage engine by hand. Writes land in a sorted <b>memtable</b>; when it fills, it is flushed to an immutable <b>segment</b> on disk.</p><p>A read looks in memory first, then each segment from <b>newest to oldest</b>.</p>`,
        v: F.flow(["Put", { t: "Memtable", c: "amber" }, { t: "Segment on disk", c: "blue" }]),
        c: {
          q: "Where does a read look first?",
          o: [
            "In the memtable, then the newest segment",
            "In the oldest segment, then the newest",
            "In every segment at the same time",
          ],
          a: 0,
          why: "The newest data is most likely to be current, so the search goes newest to oldest and stops at the first match.",
        },
      },
      {
        t: "Why a log file too?",
        b: `<p>Memory is fast but <b>vanishes</b> on a crash. So every write is also appended to a <b>write-ahead log</b> on disk. After a restart, the engine replays the log to rebuild the memtable.</p>`,
        v: F.compare(
          { title: "Log on", c: "teal", body: "crash, restart, replay: nothing lost" },
          { title: "Log off", c: "rose", body: "crash: every unsaved write is gone" },
        ),
        c: {
          q: "Once a memtable has been flushed to a segment, what happens to its log records?",
          o: [
            "They are no longer needed and can be discarded",
            "They must be kept forever",
            "They are copied into every later segment",
          ],
          a: 0,
          why: "The data is now safely in a segment on disk, so replaying those records would add nothing.",
        },
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
