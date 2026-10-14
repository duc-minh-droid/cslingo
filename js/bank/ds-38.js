/* js/bank/ds-38.js: Data Science lecture 6 revision questions, part 1: ds6-fail and ds6-acid. */
(function () {
  const B = NIC.bank;
  const S = NIC.shared.dsL6;
  const { mc, pk } = S;
  B.add("ds6-fail", [
    {
      type: "cat",
      q: "Is each event a <b>network partition</b> or a different kind of fault?",
      buckets: ["Network partition", "Another fault"],
      items: [
        ["Two data centres can no longer exchange any messages", 0],
        ["One server runs out of disk space and stops", 1],
        ["A switch failure isolates racks 1 to 4 from racks 5 to 8", 0],
        ["A single request times out once and then succeeds", 1],
      ],
      hint: "A partition cuts the network into groups that can no longer talk, while the nodes keep running.",
      why: "In a partition both sides are alive but disconnected. A full disk or one slow request is a fault, but the network is not split.",
    },
    mc(
      "An online shop's product pages must always load, even if the stock figure is a few minutes old. When the network is partitioned, which side of the CAP choice has it picked?",
      [
        "Availability: keep answering, accept stale data",
        "Consistency: refuse until the data is current",
        "Partition tolerance: stop the network from splitting",
        "Neither: a shop does not need to choose",
      ],
      "Always responding, even with possibly outdated data, is availability over consistency. The choice only has to be made while a partition lasts.",
    ),
    mc(
      "A bank's balance service must never show a wrong figure. During a partition, which behaviour fits that requirement?",
      [
        "A cut-off replica returns an error",
        "A cut-off replica answers from its own copy",
        "Every replica answers and fixes mistakes later",
        "All replicas shut down permanently",
      ],
      "Never being wrong means consistency. The cut-off replica cannot confirm it is current, so it refuses to answer and loses availability for a while.",
    ),
    {
      type: "pick",
      q: "A write set the stock to 35 on every reachable node. Node B was cut off and still holds 40, and it answers every request anyway. Tap the node that is <b>available but not consistent</b>.",
      fig: pk([
        ["a", "Node A", "answers 35"],
        ["b", "Node B", "answers 40"],
        ["c", "Node C", "returns an error"],
      ]),
      a: "b",
      hint: "Consistent means the latest value or an error. Available means a non-error answer.",
      why: "Node B replies (available) with an out-of-date value (not consistent). Node A is both. Node C is consistent by refusing but not available.",
    },
    {
      type: "order",
      q: "A replica is cut off and the store favours availability. Put these events in order.",
      items: [
        "The link to the replica is cut",
        "A client sends it a read",
        "The replica answers from its own, possibly old, copy",
        "The link returns and the replica catches up",
      ],
      hint: "Cut, request, answer, repair.",
      why: "The partition comes first. The replica then answers on its own, and only when the network heals can it learn what it missed.",
    },
    {
      type: "multi",
      q: "Which statements about the CAP theorem are true? Select all that apply.",
      o: [
        "Consistency means a read returns the most recent write or an error",
        "Availability means every request gets a non-error response",
        "During a partition you must choose between availability and consistency",
        "A system must give up consistency whenever the network is healthy",
        "Partition tolerance means the system never loses any message",
      ],
      a: [0, 1, 2],
      why: "The first three are the definitions and the precise form of the theorem. The trade-off appears only with a partition, and partition tolerance means carrying on when parts of the network are disconnected, not preventing it.",
    },
    mc(
      "A system answers every request during a partition, but some answers are out of date. Which CAP statement is true?",
      [
        "It is available but not consistent",
        "It is consistent but not available",
        "It is both consistent and available",
        "It is neither available nor consistent",
      ],
      "Every request got a reply, so it is available. An out-of-date reply is not the most recent write, so it is not consistent.",
    ),
    {
      type: "match",
      q: "Match each service to the side of the CAP choice it should take during a partition.",
      pairs: [
        ["Bank ledger", "Consistency"],
        ["Like counter on a post", "Availability"],
        ["Seat booking", "Consistency"],
        ["Weather widget", "Availability"],
      ],
      why: "Money and unique seats must never be wrong, so they refuse when unsure. A like counter or a weather widget can be slightly behind without harm.",
    },
    mc(
      'A student says "CAP means a distributed system can only ever have two of C, A and P". What is the best correction?',
      [
        "The choice between C and A only arises during a partition",
        "It is correct: every system has exactly two of them",
        "Only consistency can ever be given up in practice",
        "Partition tolerance is optional on a healthy network",
      ],
      "With a healthy network a system can be consistent and available. The theorem only forces a choice when the network is partitioned.",
    ),
    {
      type: "bug",
      q: "This replica must stay <b>consistent</b> during a partition. Click the faulty line.",
      code: [
        "def read(key):",
        "    if can_reach_peers():",
        "        return confirmed_latest(key)",
        "    return local_copy[key]",
      ],
      a: 3,
      hint: "What should a consistent replica do when it cannot check with the others?",
      why: "Returning the local copy during a partition may serve an out-of-date value. A consistent replica should return an error here.",
    },
    mc(
      "Why can a large distributed system not simply be built so that nothing ever fails?",
      [
        "With many parts some failure is certain, so it must work through it",
        "Failures only happen in badly written software, and good code avoids them",
        "Hardware never fails but networks fail all the time at scale",
        "Fault tolerance is only a concern for very small systems",
      ],
      "Reliable systems are built from unreliable components. Failures cannot be avoided, so algorithms and protocols make the system tolerate them.",
    ),
    mc(
      "A cluster has 100 servers and each one has a 1% chance of failing on a given day. About how many servers fail on an average day?",
      ["About 1", "About 10", "About 50", "None, if they are well maintained"],
      "1% of 100 is 1. Even small failure rates mean something is failing most days in a big system, which is why faults must be expected.",
    ),
  ]);

  B.add("ds6-acid", [
    {
      type: "match",
      q: "A library system lends books. Match each situation to the ACID property it illustrates.",
      pairs: [
        ["Recording the loan and updating the shelf record both happen or neither does", "Atomicity"],
        ["A member can never hold more than five books", "Consistency"],
        ["Two clerks lend the last copy at once and only one succeeds", "Isolation"],
        ["A loan confirmed on screen survives a restart", "Durability"],
      ],
      why: "All-or-nothing is atomicity, obeying the rules is consistency, non-interference is isolation and surviving a crash is durability.",
    },
    {
      type: "cat",
      q: "Does each statement describe an <b>ACID transaction</b> or <b>eventual consistency</b>?",
      buckets: ["ACID transaction", "Eventual consistency"],
      items: [
        ["A crash halfway through undoes the work", 0],
        ["Replicas may disagree for a while but converge", 1],
        ["Concurrent operations do not interfere", 0],
        ["A read can return an outdated value until the update arrives", 1],
        ["Committed changes survive a power cut", 0],
        ["Problems may appear only under faults or heavy load", 1],
      ],
      why: "ACID is about what a single transaction guarantees. Eventual consistency is about replicas agreeing in the end, with gaps in between.",
    },
    mc(
      "Stock stands at 10. Two orders each read 10, each subtract 3 and each write back. The final stock is 7. What went wrong, and what should the stock be?",
      [
        "Isolation failed and the stock should be 4",
        "Atomicity failed and the stock should be 4",
        "Durability failed and the stock should be 7",
        "Nothing failed: 7 is the right answer",
      ],
      "10 - 3 - 3 = 4. Both transactions used the old value 10, so one update was lost: concurrent transactions interfered, which is an isolation failure.",
    ),
    {
      type: "slider",
      q: "Sam has £80 and Tia has £20. Without a transaction, £30 is debited from Sam and the server crashes before the credit to Tia. What is the total in the two accounts afterwards?",
      min: 0,
      max: 150,
      step: 10,
      start: 100,
      ans: 70,
      tol: 10,
      unit: " pounds",
      hint: "Sam: 80 - 30. Tia is unchanged at 20.",
      why: "Sam has 50 and Tia still 20, so 70 in total instead of 100. A transaction would have rolled the debit back.",
    },
    {
      type: "pick",
      q: "A write set the value to 12 and has reached two replicas so far. Tap the replica that is currently <b>outdated</b>.",
      fig: pk([
        ["r1", "R1", "holds 12"],
        ["r2", "R2", "holds 12"],
        ["r3", "R3", "holds 9"],
      ]),
      a: "r3",
      why: "R3 has not received the update yet, so it still returns 9. It will converge to 12 once the update arrives.",
    },
    {
      type: "order",
      q: "Put the life of one update on three replicas in order.",
      items: [
        "A write lands on replica 1",
        "Replica 2 receives the update",
        "Replica 3 receives the update",
        "All replicas return the same value",
      ],
      why: "The write reaches the nodes one after another. Only when the last one has it do reads agree everywhere: convergence.",
    },
    mc(
      "Which of these is <b>not</b> promised by eventual consistency?",
      [
        "A read right after a write always returns the new value",
        "All nodes will end up holding the same data",
        "Reads will eventually return the same value everywhere",
        "Most replicated systems provide this kind of guarantee",
      ],
      "Eventual consistency only promises convergence in the end. In between, a read may return an older value.",
    ),
    {
      type: "multi",
      q: "Select every true statement about eventual consistency.",
      o: [
        "Writes reach different nodes at different times",
        "All nodes converge towards the same state",
        "Until convergence, reads could return outdated values",
        "A simple single-run test will reliably expose its gaps",
        "It guarantees how many seconds convergence takes",
      ],
      a: [0, 1, 2],
      why: "The gaps are transient and appear mainly under faults or heavy concurrency, so a quiet test often misses them. The model says that nodes converge, not when.",
    },
    mc(
      "A database rejects a transaction that would leave a customer's balance below zero, because a rule forbids negative balances. Which property is this?",
      ["Consistency in the ACID sense", "Consistency in the CAP sense", "Durability", "Isolation"],
      "ACID consistency means transactions only change data in predefined, predictable ways, such as keeping to rules. CAP consistency is about replicas returning the latest write.",
    ),
    mc(
      "A transaction commits, the server reboots, and the committed row is missing. Which property failed?",
      ["Durability", "Atomicity", "Isolation", "Availability"],
      "Durability says changes from successfully committed transactions are saved even if the system fails.",
    ),
    {
      type: "bug",
      q: "This sequence should move £30 from Alice to Ben atomically. Click the faulty line.",
      code: ["db.begin()", "db.debit(alice, 30)", "db.commit()", "db.credit(ben, 30)"],
      a: 2,
      hint: "Everything inside the transaction must be done before it commits.",
      why: "The commit happens before the credit, so a crash after it leaves the debit saved and the credit missing. The credit must come before commit.",
    },
    mc(
      "Eventual consistency promises that replicas will agree. What does it <b>not</b> tell you?",
      [
        "How long it will take",
        "Whether they will ever agree",
        "Whether nodes can hold different values at the same time",
        "Which nodes are involved",
      ],
      "The model guarantees convergence but not a time limit. Until then reads could return anything, and the gaps can be hard to detect.",
    ),
  ]);
})();
