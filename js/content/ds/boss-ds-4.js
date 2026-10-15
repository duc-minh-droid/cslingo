/* Data Science boss quiz for Lecture 4 (replication). New scenario: a concert-ticket seller, "Gigly". */
(function () {
  const N = NIC;
  const pickFig = () => {
    const rows = [
      ["A", 14],
      ["B", 18],
      ["C", 16],
    ];
    const cells = rows
      .map(
        ([k, v], i) =>
          `<g data-pick="${k}" style="cursor:pointer"><rect x="${10 + i * 112}" y="34" width="104" height="56" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><text x="${62 + i * 112}" y="58" text-anchor="middle" font-size="13" font-weight="800" fill="var(--text)">Follower ${k}</text><text x="${62 + i * 112}" y="78" text-anchor="middle" font-size="13" fill="var(--text)">applied #${v}</text></g>`,
      )
      .join("");
    return `<svg viewBox="0 0 350 130" style="width:100%;max-width:420px"><text x="10" y="22" font-size="12" font-weight="800" fill="var(--text)">The leader crashed after writing #20. Which follower leads?</text>${cells}<text x="10" y="112" font-size="12" fill="var(--text)">Followers apply the log in order, so each is behind by a different amount.</text></svg>`;
  };

  N.registerBoss({
    id: "ds4-boss",
    subject: "ds",
    lecture: 4,
    title: "Lecture 4 boss quiz",
    blurb:
      "Ten questions set at a concert-ticket seller: scaling, leaders and followers, failover and replication lag.",
    lede: "A new scenario: <b>Gigly</b>, a concert-ticket seller whose on-sale days crush a single server. Decide how to replicate it and what can go wrong.",
    qs: [
      {
        type: "cat",
        q: "Is each statement about Gigly a <b>benefit</b> or a <b>limit</b> of replicating its database?",
        buckets: ["Benefit", "Limit"],
        items: [
          ["Fans in Sydney read gig details from a copy in Sydney", 0],
          ["The whole ticket catalogue must fit on one machine", 1],
          ["Every booking has to be applied to all the copies", 1],
          ["Browsing carries on if one database machine fails", 0],
        ],
        why: "Nearby copies cut latency and spare machines keep the site up (benefits). Replicas each hold all the data and every write must reach every copy (limits).",
      },
      {
        type: "mcq",
        q: "Gigly's one server is nearly full, so the team considers buying a much bigger single server. Besides cost, what is the lasting weakness of that plan?",
        o: [
          "It is still one machine, so one failure stops the whole site",
          "Bigger machines cannot store replicated data",
          "Bigger machines cannot serve reads and writes together",
          "It switches the design to a shared-nothing architecture",
        ],
        a: 0,
        why: "Scaling up has limited fault tolerance, and the cost does not grow in step with the capacity. Scaling out adds machines that survive each other's failures.",
      },
      {
        type: "multi",
        q: "Gigly runs one leader and several followers. Which requests may be served by a follower? Select all that apply.",
        o: [
          "Show the seat map for a gig",
          "List a fan's past orders",
          "Buy two tickets",
          "Cancel a booking",
          "Check how many days until a gig",
        ],
        a: [0, 1, 4],
        why: "Read-only queries can go to any replica. Buying and cancelling are writes, which only the leader accepts.",
      },
      {
        type: "order",
        q: "The Gigly leader stops responding. Put the failover in the right order.",
        items: [
          "The followers notice the leader has gone",
          "The follower with the most up-to-date changes is chosen",
          "That follower is promoted to be the new leader",
          "Clients send their writes to the new leader",
        ],
        why: "Detect the failure, choose the freshest follower so little is lost, promote it, then redirect writes.",
      },
      {
        type: "slider",
        q: "A Gigly write takes 5 ms on the leader. Two followers confirm it after 30 ms and 90 ms. With semi-synchronous replication and the 30 ms follower as the synchronous one, about how long does the fan wait for the answer?",
        min: 0,
        max: 150,
        step: 5,
        start: 100,
        ans: 35,
        tol: 10,
        unit: " ms",
        hint: "The leader waits for its own 5 ms, plus the one synchronous follower's 30 ms. It ignores the 90 ms follower.",
        why: "Semi-synchronous replication waits for one follower only: 5 + 30 = 35 ms. Waiting for both would take about 95 ms, and answering at once (asynchronous) about 5 ms.",
      },
      {
        type: "match",
        q: "Match each idea to its description.",
        pairs: [
          ["Replication log", "The ordered changes a leader sends to its followers"],
          ["Snapshot", "A copy of the leader's data at one point in time, used to start a new follower"],
          ["Failover", "Promoting a follower after the leader fails"],
          ["Split brain", "Two nodes both acting as the leader"],
        ],
        why: "The log carries changes, a snapshot starts a new follower, failover replaces the leader, and split brain is the danger of ending up with two.",
      },
      {
        type: "pick",
        q: "The old leader had written change #20 when it crashed. Tap the follower you should promote.",
        fig: pickFig(),
        a: "B",
        hint: "Pick the follower that has applied the most changes.",
        why: "Follower B has applied up to #18, so promoting it loses only #19 and #20, which no follower received. Promoting A would lose six changes.",
      },
      {
        type: "bug",
        q: "This Gigly routing rule should make a fan see their own bookings right after buying. Which line breaks that?",
        code: [
          "def read_orders(fan):",
          "    if fan.booked_in_last_minute():",
          "        return any_follower().orders(fan)",
          "    return any_follower().orders(fan)",
        ],
        a: 2,
        why: "Reads of a fan's own recent writes should go to the leader (or a replica known to have caught up). A lagging follower may not hold the new booking yet.",
      },
      {
        type: "mcq",
        q: "A fan refreshes a gig page and sees 120 seats left, then refreshes again and sees 124. The two refreshes were served by different followers. Which approach stops this?",
        o: [
          "Make each fan always read from the same replica",
          "Send every fan's reads to the busiest follower",
          "Turn off the replication log for the gig page",
          "Make writes asynchronous",
        ],
        a: 0,
        why: "Going backwards in time comes from reading different replicas. Monotonic reads keep each user on one replica, whose view only moves forward.",
      },
      {
        type: "mcq",
        q: "A network fault cuts the old Gigly leader off from the others. The followers promote one of themselves, but the old leader is still running and still taking bookings. What is this danger called?",
        o: ["Split brain", "Replication lag", "Partitioning", "A snapshot"],
        a: 0,
        why: "Two nodes that both believe they are the leader accept different writes, so the data diverges. This is split brain.",
      },
    ],
  });
})();
