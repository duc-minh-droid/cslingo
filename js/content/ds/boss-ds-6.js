/* Data Science boss quiz for Lecture 6 (consistency and consensus). New scenario: cashless festival wristbands (Glimmer). */
(function () {
  const { tl, R, W } = NIC.shared.dsL6;

  const lanes = ["Gate West", "Gate East", "Top-up desk"];
  const fig = tl(
    [R(0, 0, 2, 0, "read ⇒ 0", "a"), W(2, 4, 10, "w"), R(0, 5, 7, 1, "read ⇒ 1", "b"), R(1, 8, 11, 0, "read ⇒ 0", "c")],
    {
      lanes,
      pick: true,
    },
  );

  NIC.registerBoss({
    id: "ds6-boss",
    subject: "ds",
    lecture: 6,
    title: "Lecture 6 boss quiz",
    blurb:
      "Ten questions set at a festival with cashless wristbands: CAP, ACID, eventual consistency, linearizability and two-phase commit.",
    lede: "A new scenario: <b>Glimmer Festival</b> runs on cashless wristbands. Each wristband balance is replicated across the West, East and North gates, and top-ups can come from anywhere. Keep the money right when things go wrong.",
    qs: [
      {
        type: "cat",
        q: "Glimmer's engineers describe what happens when a storm cuts the link between two gates. Which statements describe <b>consistency</b> and which <b>availability</b>?",
        buckets: ["Consistency", "Availability"],
        items: [
          ["A cut-off gate refuses to show a balance it cannot confirm", 0],
          ["Every tap on a wristband reader gets a non-error reply", 1],
          ["A read returns the most recent top-up, or an error", 0],
          ["A cut-off gate keeps serving taps from its own copy", 1],
          ["A reader may show a balance that is a few minutes old", 1],
        ],
        why: "Consistency means the latest write or an error. Availability means always answering, even if the answer may be behind. During a partition you cannot have both.",
      },
      {
        type: "mcq",
        q: "A customer tops up £20 at the West gate and sees the new balance. A second later the East gate reader shows the old balance. No server has crashed and no link is cut. What is the most likely explanation?",
        o: [
          "The update has not yet reached the East replica: eventual consistency",
          "The wristband lost the top-up because of a hardware fault",
          "East has become the leader and discarded West's write",
          "The balance is correct at both gates: readers can disagree harmlessly",
        ],
        a: 0,
        why: "Writes reach different replicas at different times. The replicas will converge, but until then a read can return an outdated value. Such transient inconsistencies are hard to spot because they only show under load or faults.",
      },
      {
        type: "mcq",
        q: "To avoid anyone spending a balance twice, Glimmer decides that a gate cut off from the others must refuse payments until the link returns. By the CAP theorem, which property has it chosen to keep during the partition?",
        o: [
          "Consistency, giving up availability",
          "Availability, giving up consistency",
          "Neither: partitions break both",
          "Both: refusing is always safe",
        ],
        a: 0,
        why: "Refusing requests means no reader ever sees an out-of-date balance (consistent) but the cut-off gate cannot serve customers (not available). CAP forces this choice only while the network is partitioned.",
      },
      {
        type: "multi",
        q: "A top-up debits a customer's card and credits their wristband. Select every statement that is <b>true</b> of the ACID properties.",
        o: [
          "If the server crashes between the debit and the credit, neither is applied (atomicity)",
          "Two top-ups at the same moment do not see each other's half-finished changes (isolation)",
          "Once a top-up is confirmed, a power cut cannot undo it (durability)",
          "ACID consistency means every replica returns the latest write at once",
          "Atomicity lets the debit stand while the credit is retried later",
        ],
        a: [0, 1, 2],
        why: "Atomicity is all or nothing, isolation stops interference and durability survives failures. The C in ACID is about data keeping its rules; reading the latest write across replicas is the C of CAP.",
      },
      {
        type: "match",
        q: "Match each Glimmer incident to the ACID property that failed.",
        pairs: [
          ["£20 left the customer's card but never reached the wristband", "Atomicity"],
          ["Two gates spent the same £20 at once and the balance ended up wrong", "Isolation"],
          ["A confirmed top-up vanished after the server lost power", "Durability"],
          ["A wristband balance dropped below zero despite a rule forbidding it", "Consistency"],
        ],
        why: "A half-done transfer is an atomicity failure, interfering transactions break isolation, losing committed data breaks durability, and breaking a data rule breaks (ACID) consistency.",
      },
      {
        type: "slider",
        q: "Glimmer's East and West gates are 40 ms apart one way. A linearizable top-up must hear back from the other gate before it replies. About how long does the customer wait, ignoring local work?",
        min: 0,
        max: 200,
        step: 10,
        start: 40,
        ans: 80,
        tol: 15,
        unit: " ms",
        hint: "There and back: double the one-way delay.",
        why: "The request goes across and the confirmation comes back: 2 x 40 = 80 ms. An eventually consistent top-up could answer from the local copy in a couple of milliseconds.",
      },
      {
        type: "pick",
        q: "A top-up desk writes a new balance (the register starts at 0 and the desk writes 1). The system is meant to be linearizable. Tap the read that breaks it.",
        fig,
        a: "c",
        hint: "Once any gate has read 1, every read that starts later must read 1 too.",
        why: "East's read starts at 8, after West's read had already returned 1 at time 7, so it must return 1. Returning 0 makes the balance go backwards.",
      },
      {
        type: "mcq",
        q: "Which Glimmer task most needs linearizability?",
        o: [
          "Giving each numbered VIP pass to exactly one person",
          "Showing roughly how many people are at the main stage",
          "Refreshing the 'what is on next' schedule screen",
          "Counting photos posted with the festival hashtag",
        ],
        a: 0,
        why: "Handing out a unique item needs one agreed answer to 'is this pass taken?', like a seat booking. Crowd counts, schedules and photo counts can safely be a little behind.",
      },
      {
        type: "order",
        q: "A merch order must update the stock database and the payments database together. Put the two-phase commit steps in order.",
        items: [
          "The coordinator sends prepare to both databases",
          "Each database votes yes and keeps its locks",
          "The coordinator sees two yes votes and decides to commit",
          "The coordinator sends commit to both databases",
        ],
        hint: "Votes first, then the decision, then the order to everyone.",
        why: "Phase 1 collects the votes. Only when every vote is yes does the coordinator decide, and phase 2 sends that decision to all the nodes.",
      },
      {
        type: "bug",
        q: "Glimmer's coordinator code is meant to commit only when every database votes yes, otherwise abort. Click the faulty line.",
        code: [
          "def finish(nodes):",
          "    votes = [n.prepare() for n in nodes]",
          '    decision = "commit"',
          "    for n in nodes:",
          "        n.send(decision)",
        ],
        a: 2,
        hint: "Where are the votes used?",
        why: 'The decision is always "commit", so a no vote is ignored and some nodes commit while others cannot. It should be "commit" only if all(votes), otherwise "abort".',
      },
    ],
  });
})();
