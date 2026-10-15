/* js/bank/ds-39.js: Data Science lecture 6 revision questions, part 2: ds6-linear and ds6-cap. */
(function () {
  const B = NIC.bank;
  const S = NIC.shared.dsL6;
  const { mc, tl, R, W, pk } = S;

  B.add("ds6-linear", [
    {
      type: "pick",
      q: "Register x starts at 0 and client C writes 1. The system should be linearizable. Tap the read that breaks it.",
      fig: tl(
        [
          W(2, 3, 9, "w"),
          R(0, 0, 2, 0, "read ⇒ 0", "a"),
          R(1, 4, 6, 1, "read ⇒ 1", "b"),
          R(0, 7, 10, 0, "read ⇒ 0", "c"),
        ],
        { pick: true },
      ),
      a: "c",
      hint: "Client B's read had already returned 1 by time 6.",
      why: "The last read starts at 7, after B's read finished with 1, so it must return 1 as well. Returning 0 makes the value go backwards.",
    },
    {
      ...mc(
        "Register x starts at 0 and client C writes 1. Is this history linearizable?",
        [
          "Yes: one flip moment inside the write explains every read",
          "No: a read after the write completed returned 0",
          "No: two reads overlap the write",
          "Yes, because every read returned 0 or 1",
        ],
        "Both reads that return 1 finish before the later ones start, and the 0 comes early. A flip moment between time 3 and 7 explains everything.",
      ),
      fig: tl([R(0, 1, 3, 0), W(2, 2, 8), R(1, 4, 7, 1), R(0, 9, 11, 1), R(1, 9.5, 12, 1)]),
    },
    {
      ...mc(
        "Register x starts at 0 and client C writes 1. Why is this history not linearizable?",
        [
          "A read returned 1 before the write had even started",
          "The write is much longer than any of the reads",
          "Two clients read the register at the same time",
          "The final read overlaps the write for a moment",
        ],
        "The first read finishes at time 3, well before the write starts at 6, yet it returned 1. The new value appeared before anyone wrote it.",
      ),
      fig: tl([R(0, 1, 3, 1), W(2, 6, 12), R(1, 7, 9, 1), R(0, 10, 13, 1)]),
    },
    {
      type: "cat",
      q: "In a linearizable system, which value must or may each read return? The register starts at 0 and one write sets it to 1.",
      buckets: ["Must return 0", "Must return 1", "May return either"],
      items: [
        ["A read that finishes before the write begins", 0],
        ["A read that starts after the write has completed", 1],
        ["A read that overlaps the write, with no read yet having returned 1", 2],
        ["A read that starts after another read has already returned 1", 1],
      ],
      why: "Before the write the old value, after it the new one, and an overlapping read can go either way until someone has seen 1. After that every later read must return 1.",
    },
    {
      type: "slider",
      q: "A write runs from time 2 to time 9. One read returned 1 and finished at time 5. From which start time onwards must every read return 1 too?",
      min: 0,
      max: 10,
      step: 1,
      start: 2,
      ans: 5,
      tol: 1,
      unit: "",
      hint: "Once someone has read 1, later reads must follow. When did that read finish?",
      why: "Reads starting after time 5 come after a client has seen the new value, so they must return 1. The write finishing at 9 is not the deadline here.",
    },
    {
      type: "multi",
      q: "Which statements about a register in a linearizable system are true? Select all that apply.",
      o: [
        "write(x, v) returns a response that is ok or an error",
        "A read that overlaps the write may return the old or the new value",
        "If one client reads the new value, all later reads must return it",
        "A read starting after the write completed may still return the old value",
        "Each client may keep its own copy of the register",
      ],
      a: [0, 1, 2],
      why: "Overlapping reads are free until the new value has been seen. After a write completes, though, nobody may read the old value, and the system must look like one copy.",
    },
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["read(x) ⇒ v", "The database returned value v for register x"],
        ["write(x, v) ⇒ ok", "The database confirmed it set register x to v"],
        ["Overlapping read", "A read whose bar overlaps the write's bar"],
        ["Flip moment", "The instant the value changes from old to new"],
      ],
      why: "A register has two operations, each with a response. A flip moment is the single instant inside the write bar that orders every read.",
    },
    mc(
      "Which description best fits a <b>linearizable</b> system?",
      [
        "It acts like a single copy with atomic operations",
        "Every replica holds identical data at every instant",
        "It never loses a message, even during partitions",
        "Reads are always faster than writes in practice",
      ],
      "The user's view is of one copy of the data. The system need not literally have one copy, but it must look that way from outside.",
    ),
    mc(
      "A manager completes a write that sets the shop sign to 1 (open). A moment later a customer reads the sign from a replica that has not been updated and sees 0. Which guarantee is broken?",
      [
        "As soon as a client completes a write, all clients must see it",
        "Reads must never overlap writes",
        "A register must start at 0",
        "Writes must return an error if a replica is behind",
      ],
      "In a linearizable system a completed write is visible to everyone who reads afterwards. A stale replica breaks the one-copy illusion.",
    ),
    {
      type: "bug",
      q: "This checker decides whether a history with one write is linearizable. Click the faulty line.",
      code: [
        "def linearizable(write, reads):",
        "    lo, hi = write.start, write.end",
        "    for r in reads:",
        "        if r.value == 0:",
        "            lo = max(lo, r.start)",
        "        else:",
        "            hi = max(hi, r.end)",
        "    return lo <= hi",
      ],
      a: 6,
      hint: "A read returning 1 must end after the flip, so the flip can be at most that late.",
      why: "The flip moment must be before every 1-read ends, so the upper limit is the smallest of those end times: hi = min(hi, r.end). Taking the max loosens it wrongly.",
    },
    {
      ...mc(
        "In the picture client C writes 1 and a read by client A starts after the write has completed. What may a linearizable system return for that read?",
        ["Only 1", "Only 0", "0 or 1", "An error is the only legal answer"],
        "The write is finished, so everyone reading afterwards must see the new value.",
      ),
      fig: tl([W(2, 2, 6), R(0, 8, 10, "?", "read ⇒ ?")]),
    },
    {
      type: "pick",
      q: "Client C writes 1 between times 4 and 10. Tap the read that <b>may return either 0 or 1</b>.",
      fig: tl(
        [
          W(2, 4, 10, "w"),
          R(0, 0, 2, "0", "read ⇒ ?", "a"),
          R(1, 5, 8, "0 or 1", "read ⇒ ?", "b"),
          R(0, 11, 13, "1", "read ⇒ ?", "c"),
        ],
        { pick: true },
      ),
      a: "b",
      why: "Only the middle read overlaps the write. The first ends before the write starts and the last begins after it finishes.",
    },
  ]);

  B.add("ds6-cap", [
    {
      type: "cat",
      q: "Does each task need linearizability, or can it relax?",
      buckets: ["Needs it", "Can relax"],
      items: [
        ["Make sure only one node believes it is the leader", 0],
        ["Reject a second sign-up with an already used username", 0],
        ["Show how many people liked a post", 1],
        ["Refresh the trending topics list", 1],
        ["Sell each concert seat once", 0],
      ],
      hint: "Ask whether a slightly old answer could cause real harm.",
      why: "Leaders, unique names and seats are uniqueness guarantees that need one agreed answer. Like counts and trending lists can lag without harm.",
    },
    mc(
      "Two nodes both believe they hold a lock that should have one owner. What requirement was violated?",
      [
        "Uniqueness, which needs a linearizable decision",
        "Durability of the transaction log on disk",
        "Partition tolerance of the underlying network",
        "Eventual consistency of the replicated data",
      ],
      "Granting a lock to exactly one owner is a uniqueness guarantee. Independent replicas that cannot agree can each hand it out.",
    ),
    mc(
      "A store requires linearizability. During a partition, what happens to the replicas that cannot reach the others?",
      [
        "They stop serving requests until they reconnect",
        "They keep serving and simply fix conflicts later",
        "They elect themselves as the only copy",
        "They return the last value they saw",
      ],
      "Serving from a possibly outdated copy would break linearizability, so those replicas give up availability while disconnected.",
    ),
    {
      type: "slider",
      q: "Two sites are 25 ms apart one way. A linearizable write has to hear back from the other site before it replies. About how long does it take, ignoring local work?",
      min: 0,
      max: 120,
      step: 10,
      start: 20,
      ans: 50,
      tol: 10,
      unit: " ms",
      hint: "There and back is twice the one-way delay.",
      why: "The request travels 25 ms and the confirmation travels 25 ms back: 50 ms. A local answer would take a few milliseconds.",
    },
    {
      type: "order",
      q: "Order these reads from <b>fastest</b> to <b>slowest</b>.",
      items: [
        "Answer from the local replica without checking (2 ms)",
        "Check with a replica in the same city first (12 ms)",
        "Check with a replica on another continent first (180 ms)",
      ],
      hint: "Local, then near, then far.",
      why: "Linearizable reads must wait for the other replica, so their time grows with the distance and the delay. A local, possibly stale answer is the fastest.",
    },
    mc(
      "Which change makes linearizable reads and writes <b>slower</b>?",
      [
        "More variable delays in the network",
        "Fewer clients using the system",
        "Storing the data on faster disks",
        "Using shorter key names",
      ],
      "Response time is at least proportional to the uncertainty of delays in the network. A network with highly variable delays means high response times.",
    ),
    {
      type: "pick",
      q: "A flight booking system must be linearizable. Mia's booking of seat 14C was confirmed at 10:00:01. Tap the request that must be <b>refused</b>.",
      fig: pk([
        ["r1", "Mia: book 14C", "confirmed 10:00:01"],
        ["r2", "Omar: book 14C", "sent 10:00:03"],
        ["r3", "Zoe: book 15A", "sent 10:00:04"],
      ]),
      a: "r2",
      why: "Omar asks for the seat after Mia's booking completed, so he must see it taken. Zoe's seat is different.",
    },
    {
      type: "multi",
      q: "Select every statement that is true about linearizability.",
      o: [
        "Single-leader replication needs it to make sure there is only one leader",
        "It is needed to guarantee uniqueness, such as no two bookings of one seat",
        "Applications that do not need it can tolerate network problems better",
        "Most distributed databases guarantee it because it is free",
        "It makes reads and writes faster",
      ],
      a: [0, 1, 2],
      why: "It is crucial for leaders and uniqueness but costs availability and response time, so many databases do not guarantee it and favour performance.",
    },
    {
      type: "match",
      q: "Match each requirement to the reason it needs a single, agreed answer.",
      pairs: [
        ["Choose one leader", "Two leaders would accept conflicting writes"],
        ["Unique username", "No two accounts may share a name"],
        ["Seat booking", "A seat must not be sold twice"],
        ["Like counter", "It can lag without harm, so it needs none"],
      ],
      why: "Leaders, usernames and seats are uniqueness problems. A like counter is the kind of application that can safely relax.",
    },
    mc(
      "The response time of linearizable reads and writes is at least proportional to what?",
      [
        "The uncertainty of delays in the network",
        "The total size of the data being stored",
        "The number of columns in each table row",
        "The age of the oldest replica in the cluster",
      ],
      "If delays are unpredictable, a linearizable operation must allow for the worst case, so a highly variable network makes it inevitably slow.",
    ),
    mc(
      "A link between two data centres has delays anywhere between 5 ms and 200 ms. A feed needs predictable, fast responses. Which choice fits best?",
      [
        "Skip linearizability and answer locally",
        "Make every read linearizable to be safe",
        "Route every read over the slowest link",
        "Wait for the network delay to become stable",
      ],
      "Linearizable operations inherit the network's uncertainty. A feed that tolerates slightly old data can answer locally in a moment.",
    ),
    {
      type: "bug",
      q: "A booking function must be linearizable across two sites. Click the faulty line.",
      code: [
        "def book(seat, who):",
        "    if seat in local_taken:",
        '        return "taken"',
        "    local_taken[seat] = who",
        "    send_later(other_site, seat, who)",
        '    return "booked"',
      ],
      a: 4,
      hint: "What has to happen before the function can reply 'booked'?",
      why: "Replicating later means the other site may sell the same seat in the meantime. The site must get the other site's confirmation before replying.",
    },
  ]);
})();
