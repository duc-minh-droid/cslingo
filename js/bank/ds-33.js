(function () {
  const B = NIC.bank;

  const confirmFig = () => {
    const ms = [
      ["leader", "Leader stored", 5, "var(--blue)"],
      ["f1", "Follower 1 confirms", 25, "var(--teal)"],
      ["f3", "Follower 3 confirms", 45, "var(--teal)"],
      ["f2", "Follower 2 confirms", 65, "var(--teal)"],
    ];
    const rows = ms
      .map(
        ([k, d, t, c], i) =>
          `<g data-pick="${k}" style="cursor:pointer"><rect x="10" y="${28 + i * 30}" width="330" height="26" rx="8" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><rect x="10" y="${28 + i * 30}" width="${t * 4.5}" height="26" rx="8" fill="${c}" opacity="0.35"/><text x="18" y="${46 + i * 30}" font-size="12" font-weight="800" fill="var(--text)">${d}: ${t} ms</text></g>`,
      )
      .join("");
    return `<svg viewBox="0 0 350 160" style="width:100%;max-width:420px"><text x="10" y="18" font-size="12" font-weight="800" fill="var(--text)">One write, three followers (time since the write arrived)</text>${rows}</svg>`;
  };
  const posFig = () => {
    const rows = [
      ["A", 31],
      ["B", 29],
      ["C", 33],
    ];
    const cells = rows
      .map(
        ([k, v], i) =>
          `<g data-pick="${k}" style="cursor:pointer"><rect x="${10 + i * 112}" y="34" width="104" height="56" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><text x="${62 + i * 112}" y="58" text-anchor="middle" font-size="13" font-weight="800" fill="var(--text)">Follower ${k}</text><text x="${62 + i * 112}" y="78" text-anchor="middle" font-size="13" fill="var(--text)">at #${v}</text></g>`,
      )
      .join("");
    return `<svg viewBox="0 0 350 118" style="width:100%;max-width:420px"><text x="10" y="22" font-size="12" font-weight="800" fill="var(--text)">The leader failed after writing #35. Which follower is promoted?</text>${cells}<text x="10" y="108" font-size="12" fill="var(--text)">Each follower shows the last change it applied.</text></svg>`;
  };

  B.add("ds4-sync", [
    {
      type: "mcq",
      q: "A bank app tells customers 'payment sent' only after at least one follower has stored the payment. Which kind of replication is that?",
      o: [
        "Synchronous, with at least one synchronous follower",
        "Asynchronous, with the answer sent before any copy",
        "Partitioned",
        "Read-only",
      ],
      a: 0,
      why: "Reporting success only after a follower has confirmed is synchronous replication. Often at least one follower is synchronous, not all of them.",
    },
    {
      type: "slider",
      q: "A leader stores a write in 10 ms. Followers confirm after 40 ms and 100 ms. With semi-synchronous replication (the 40 ms follower is the synchronous one), about how long does the client wait?",
      min: 0,
      max: 150,
      step: 5,
      start: 100,
      ans: 50,
      tol: 15,
      unit: " ms",
      hint: "Add the leader's 10 ms to the one synchronous follower's 40 ms.",
      why: "The leader waits for its own work plus one follower: 10 + 40 = 50 ms. It does not wait for the 100 ms follower.",
    },
    {
      type: "slider",
      q: "Same write: the leader takes 10 ms and two followers confirm after 40 ms and 100 ms. If the leader waits for <b>both</b> followers, about how long does the client wait?",
      min: 0,
      max: 150,
      step: 5,
      start: 50,
      ans: 110,
      tol: 15,
      unit: " ms",
      hint: "It must wait for the slowest follower: 10 + 100.",
      why: "Waiting for every follower makes the client wait for the slowest one: 10 + 100 = 110 ms.",
    },
    {
      type: "cat",
      q: "Which replication style does each situation describe?",
      buckets: ["Asynchronous", "Synchronous"],
      items: [
        ["The client gets its answer before any follower has confirmed", 0],
        ["A confirmed write already exists on a second machine", 1],
        ["A slow follower cannot delay the answer", 0],
        ["The leader can be held up by an unavailable follower", 1],
      ],
      why: "Asynchronous answers first and copies later. Synchronous waits for confirmation, which makes writes safer but exposes them to slow or unavailable followers.",
    },
    {
      type: "mcq",
      q: "In a semi-synchronous cluster the synchronous follower, in another country, starts responding very slowly. What does the cluster do?",
      o: [
        "Makes an asynchronous follower the synchronous one",
        "Stops accepting any new write until it recovers",
        "Switches all the followers to synchronous mode",
        "Deletes all of the slow follower's stored data",
      ],
      a: 0,
      why: "When the synchronous follower is slow or unavailable, an asynchronous follower is promoted to the synchronous role, so writes keep flowing.",
    },
    {
      type: "pick",
      q: "Every follower is synchronous. Tap the moment the client is told the write is done.",
      fig: confirmFig(),
      a: "f2",
      hint: "The leader needs a confirmation from all three followers.",
      why: "With every follower synchronous the answer waits for the slowest confirmation: follower 2 at 65 ms.",
    },
    {
      type: "order",
      q: "Order these modes from the least safe to the safest for a newly written value.",
      items: [
        "Asynchronous: no follower is waited for",
        "Semi-synchronous: one follower is waited for",
        "Synchronous with every follower waited for",
      ],
      why: "The more followers confirm before the client is told, the more copies exist at that moment.",
    },
    {
      type: "mcq",
      q: "Every follower is synchronous and one of them loses its network connection. What happens to the next write?",
      o: [
        "It cannot finish: not every follower confirms",
        "It finishes just as quickly, ignoring the dead one",
        "It completes, then is rolled back a day later",
        "It is sent to the disconnected follower first",
      ],
      a: 0,
      why: "A write is only done when all synchronous followers confirm, so one unavailable follower holds up every write. This is why 'synchronous' normally means one follower, not all.",
    },
    {
      type: "multi",
      q: "What are the advantages of asynchronous replication? Select all that apply.",
      o: [
        "The client gets an answer quickly",
        "A slow follower does not slow writes down",
        "Writes continue even if a follower is unavailable",
        "A write is always on at least two machines when reported",
        "Followers are never behind the leader",
      ],
      a: [0, 1, 2],
      why: "Not waiting gives speed and tolerance of slow or dead followers. The price is that followers can lag and a crash can lose recent writes.",
    },
    {
      type: "bug",
      q: "This sketch of a semi-synchronous write has one faulty step. Click it.",
      code: [
        "1. leader stores the write",
        "2. leader sends the write to all followers",
        "3. leader waits for every asynchronous follower to confirm",
        "4. leader tells the client the write is done",
      ],
      a: 2,
      why: "Semi-synchronous waits for just one synchronous follower. Waiting for every asynchronous one would make it slow and fragile.",
    },
    {
      type: "mcq",
      q: "A game saves a player's high score. The studio can accept losing the last few seconds of scores in a rare crash, but wants the fastest possible save. Which mode fits?",
      o: ["Asynchronous", "Synchronous with every follower", "Neither: replication is unnecessary", "Partitioned"],
      a: 0,
      why: "When fast answers matter more than never losing the last moments, asynchronous replication fits. Banking-style data would justify waiting for a follower.",
    },
    {
      type: "mcq",
      q: "A leader answers 'done' and crashes one millisecond later. In which mode is the write guaranteed to survive on some other machine?",
      o: [
        "Semi-synchronous, because a follower had confirmed it first",
        "Asynchronous, because the leader tells followers soon after",
        "Any mode, since crashes never lose data",
        "Only when there is a single follower",
      ],
      a: 0,
      why: "Before answering, a semi-synchronous leader waits for one follower to hold the write. In asynchronous mode the answer can precede every copy.",
    },
  ]);

  B.add("ds4-failover", [
    {
      type: "order",
      q: "A follower crashes and restarts. Order what it does to get back in step.",
      items: [
        "It restarts and reads its own log",
        "It finds the last transaction it processed",
        "It connects to the leader",
        "It requests the changes made since that transaction",
        "It applies them and is up to date again",
      ],
      why: "A follower knows from its logs where it stopped, so it asks the leader only for what came after.",
    },
    {
      type: "mcq",
      q: "Why is locking the leader against writes while the new follower copies the data a poor solution?",
      o: [
        "The service cannot take writes for the whole copy",
        "Locked data cannot be copied to any other machine",
        "A lock deletes the replication log",
        "The new follower would end up with no data",
      ],
      a: 0,
      why: "Locking would pause writes for as long as the copy takes. A snapshot plus catch-up avoids the pause.",
    },
    {
      type: "slider",
      q: "A snapshot ends at change #1,000. By the time it is copied the leader is at #1,060 and still gets 10 new changes a second. The new follower can apply 20 changes a second. About how many seconds until it has caught up?",
      min: 0,
      max: 20,
      step: 1,
      start: 3,
      ans: 6,
      tol: 2,
      unit: " s",
      hint: "It gains 20 - 10 = 10 changes a second on the leader. The gap is 60.",
      why: "The follower closes the gap at 10 changes a second: 60 ÷ 10 = 6 seconds, and then it has caught up.",
    },
    {
      type: "pick",
      q: "The leader failed after writing #35. Tap the follower you should promote.",
      fig: posFig(),
      a: "C",
      why: "Follower C has applied the most changes (#33), so promoting it loses the fewest: #34 and #35.",
    },
    {
      type: "mcq",
      q: "Why must a snapshot be tied to an exact position in the leader's log?",
      o: [
        "So the new follower knows where to start asking for later changes",
        "So the leader can delete everything before that position",
        "So followers can choose which writes to ignore",
        "So the snapshot can be read by clients directly",
      ],
      a: 0,
      why: "The follower requests everything since the snapshot, so it needs to know exactly which change the snapshot ended at.",
    },
    {
      type: "cat",
      q: "Does each item belong to recovering a <b>failed follower</b> or a <b>failed leader</b>?",
      buckets: ["Follower failure", "Leader failure (failover)"],
      items: [
        ["Its own log tells it the last transaction it processed", 0],
        ["Another node must be promoted to take writes", 1],
        ["It asks the leader for the changes since it stopped", 0],
        ["Two nodes may both believe they are in charge", 1],
      ],
      why: "A follower simply catches up from the leader. A leader failure needs a promotion and risks split brain.",
    },
    {
      type: "mcq",
      q: "The old leader was only cut off by a network fault. After a follower is promoted, the old leader still accepts bookings. What is the danger?",
      o: [
        "Split brain: two leaders accept different writes",
        "The replication log shrinks until it is useless",
        "Followers can no longer serve reads to clients",
        "The snapshot grows too large to be copied",
      ],
      a: 0,
      why: "Two nodes both acting as leader take different writes, so their data diverges and some of it has to be lost or reconciled.",
    },
    {
      type: "multi",
      q: "Which problems can arise when a leader is replaced? Select all that apply.",
      o: [
        "The new leader may be missing the newest writes",
        "The old leader may come back believing it is still the leader",
        "Followers may have applied different amounts of the log",
        "Reads stop working on every follower for good",
        "Followers learn to apply changes in a different order",
      ],
      a: [0, 1, 2],
      why: "Lost writes, a returning old leader and followers at different points are all real failover hazards. Reads keep working, and order is preserved.",
    },
    {
      type: "bug",
      q: "This failover routine promotes the wrong follower. Click the faulty line.",
      code: [
        "def failover(followers):",
        "    best = min(followers, key=applied_changes)",
        "    promote(best)",
        "    redirect_writes_to(best)",
      ],
      a: 1,
      why: "It should choose the follower with the most applied changes (max), so the fewest writes are lost. min picks the one furthest behind.",
    },
    {
      type: "mcq",
      q: "A new follower has copied the snapshot. What does it ask the leader for next?",
      o: [
        "All the changes made since the snapshot was taken",
        "A fresh snapshot, over and over",
        "Only the changes the clients have read",
        "Nothing: the snapshot is already complete",
      ],
      a: 0,
      why: "The leader kept taking writes during the copy, so the follower requests the backlog since the snapshot and applies it until it has caught up.",
    },
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Backlog", "Changes made since the snapshot that the follower still has to apply"],
        ["Caught up", "The follower has processed the backlog"],
        ["Promotion", "A follower is chosen as the new leader"],
        ["Last processed transaction", "What a restarted follower reads from its own logs"],
      ],
      why: "These are the pieces of adding or recovering a follower, and of failover.",
    },
    {
      type: "mcq",
      q: "Three followers have applied up to #52, #57 and #55. The leader had written up to #60 when it died. If the one at #57 is promoted, how many of the leader's changes are lost?",
      o: ["3", "5", "8", "0"],
      a: 0,
      hint: "Everything after #57 is gone: #58, #59 and #60.",
      why: "The new leader only has changes up to #57, so #58 to #60 (three changes) never reached any follower.",
    },
  ]);
})();
