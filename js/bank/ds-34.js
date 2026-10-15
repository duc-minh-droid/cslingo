(function () {
  const B = NIC.bank;

  const readsFig = () => {
    const rs = [
      ["r1", "Refresh 1", "replica A", 8],
      ["r2", "Refresh 2", "replica B", 6],
      ["r3", "Refresh 3", "replica A", 8],
      ["r4", "Refresh 4", "replica A", 9],
    ];
    const rows = rs
      .map(
        ([k, a, b, v], i) =>
          `<g data-pick="${k}" style="cursor:pointer"><rect x="10" y="${28 + i * 30}" width="330" height="26" rx="8" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><text x="18" y="${46 + i * 30}" font-size="12" font-weight="800" fill="var(--text)">${a}: ${b} shows ${v} likes</text></g>`,
      )
      .join("");
    return `<svg viewBox="0 0 350 156" style="width:100%;max-width:420px"><text x="10" y="18" font-size="12" font-weight="800" fill="var(--text)">One fan reloads a post several times</text>${rows}</svg>`;
  };

  B.add("ds4-lag", [
    {
      type: "mcq",
      q: "A fan likes a post, and for a second the like counter shows the old number when she refreshes. What is the most likely cause?",
      o: [
        "A follower that was behind served the read",
        "The leader refused the like on that request",
        "The replication log was lost on the way",
        "The database stored the like in the wrong order",
      ],
      a: 0,
      why: "Followers apply the leader's changes a moment later, so a read from a lagging follower returns out-of-date data.",
    },
    {
      type: "cat",
      q: "Which guarantee protects against each problem?",
      buckets: ["Read-your-writes", "Monotonic reads"],
      items: [
        ["You save a new bio and reload, but the old bio appears", 0],
        ["Two reloads show 30 replies, then 27", 1],
        ["You upload a photo and it is missing from your own gallery", 0],
        ["A game leaderboard shows your rank, then an older rank", 1],
      ],
      why: "Read-your-writes concerns a user's own submitted updates. Monotonic reads concerns not seeing newer data and then older data.",
    },
    {
      type: "pick",
      q: "A fan reloads a post several times, and the reads are served by different replicas. Tap the refresh where the page <b>moved backwards in time</b>.",
      fig: readsFig(),
      a: "r2",
      hint: "Look for a count that is lower than the previous one.",
      why: "Refresh 1 showed 8 likes, then replica B showed 6: older data after newer data. Later reads from replica A show 8 and 9 again, so the backwards step is refresh 2.",
    },
    {
      type: "order",
      q: "Put these events in the order that makes a user's own new post 'vanish'.",
      items: [
        "The user submits a post and the leader stores it",
        "The user reloads the page",
        "The read is sent to a follower",
        "The follower has not received the post yet, so it is missing",
      ],
      why: "The write reached the leader, but the read went to a follower that was still behind.",
    },
    {
      type: "mcq",
      q: "A user always reads from the same follower, which is two seconds behind the leader. She posts a comment and reloads at once. What can she see?",
      o: [
        "Her comment may be missing, but the page never moves backwards",
        "Her comment is always there, and the page never moves backwards",
        "Her comment is there, but the page may move backwards",
        "Neither guarantee holds, so anything can happen",
      ],
      a: 0,
      why: "A fixed replica gives monotonic reads, but it does not promise she sees her own write: that replica is still behind the leader.",
    },
    {
      type: "multi",
      q: "Which approaches can give a user read-your-writes consistency? Select all that apply.",
      o: [
        "Read data the user recently edited from the leader",
        "Read from a replica known to have caught up past the user's write",
        "Send every read to a random replica",
        "Delay every user's reads by a day",
        "Let followers apply changes in any order",
      ],
      a: [0, 1],
      why: "Reading the user's recent changes from the leader or from an up-to-date replica ensures they see their writes. Random replicas, delays and reordering do not.",
    },
    {
      type: "bug",
      q: "This routing code tries to give each user monotonic reads but fails. Click the faulty line.",
      code: [
        "def pick_replica(user):",
        "    return random_replica()",
        "def read(user, key):",
        "    return pick_replica(user).get(key)",
      ],
      a: 1,
      why: "A random replica per read lets a user hop between replicas and see time go backwards. The choice should depend on the user (for example, a hash of the user id) so it is always the same.",
    },
    {
      type: "cat",
      q: "Does each routing rule give a user <b>monotonic reads</b>?",
      buckets: ["Yes", "No"],
      items: [
        ["Each user is pinned to one replica", 0],
        ["The replica is chosen by hashing the user's id", 0],
        ["Each request goes to a random replica", 1],
        ["Requests alternate between two replicas", 1],
      ],
      why: "Monotonic reads need each user to keep reading from the same replica. Random or alternating choices can hop onto one that is behind.",
    },
    {
      type: "mcq",
      q: "A page shows 15 views, and the next refresh shows 13. Which guarantee was missing?",
      o: ["Monotonic reads", "Read-your-writes", "Synchronous replication of every write", "Partitioning"],
      a: 0,
      why: "The user saw newer data then older data, because two reads came from replicas at different points. That is what monotonic reads prevents.",
    },
    {
      type: "slider",
      q: "The leader has 120 comments. A follower is 4 changes behind. How many comments does a read from that follower show?",
      min: 100,
      max: 130,
      step: 1,
      start: 120,
      ans: 116,
      tol: 1,
      unit: " comments",
      hint: "The follower has applied everything except the latest 4 changes.",
      why: "120 − 4 = 116. That gap is the replication lag, and the follower will reach 120 once it applies the rest of the log.",
    },
    {
      type: "mcq",
      q: "A shop uses semi-synchronous replication with one synchronous follower and three asynchronous ones. Can a read served by an asynchronous follower return old data?",
      o: [
        "Yes: it may not have applied the newest change",
        "No: semi-synchronous replication updates every follower first",
        "No: only leaders can hold old data",
        "Only if the leader has crashed",
      ],
      a: 0,
      why: "Only the synchronous follower is guaranteed to have confirmed. The asynchronous followers can still be behind, and so serve stale reads.",
    },
    {
      type: "mcq",
      q: "Which node can always return the very latest committed write, without any replication lag?",
      o: ["The leader", "Any follower", "The follower furthest from the leader", "A follower that has just restarted"],
      a: 0,
      why: "The leader holds every change as it is written. Followers can be behind, which is why a user's own recent reads can be sent there.",
    },
    {
      type: "mcq",
      q: "A messaging app shows a user their own message as 'sent', but a refresh from another replica makes it disappear for a few seconds. Which fix addresses this directly?",
      o: [
        "Serve a user's own recent writes from the leader or an up-to-date replica",
        "Pin each user to a replica chosen at random for every request",
        "Make followers ignore the replication log",
        "Add more followers with no other change",
      ],
      a: 0,
      why: "That is the read-your-writes problem, solved by reading the user's own changes from a node that has them. More followers alone does nothing for it.",
    },
  ]);
})();
