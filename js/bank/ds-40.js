/* js/bank/ds-40.js: Data Science lecture 6 revision questions, part 3: ds6-consensus. */
(function () {
  const B = NIC.bank;
  const { mc, pk, seq } = NIC.shared.dsL6;

  B.add("ds6-consensus", [
    {
      type: "pick",
      q: "A coordinator has collected the votes for a transaction across three databases. Tap the database whose reply forces the coordinator to <b>abort</b>.",
      fig: pk([
        ["a", "Inventory DB", "voted yes"],
        ["b", "Billing DB", "voted no"],
        ["c", "Shipping DB", "voted yes"],
      ]),
      a: "b",
      why: "One no is enough: the coordinator must send abort to every node, including the two that voted yes.",
    },
    {
      type: "cat",
      q: "Is each task <b>leader election</b> or <b>atomic commit</b>?",
      buckets: ["Leader election", "Atomic commit"],
      items: [
        ["Choosing which replica takes over after the leader crashes", 0],
        ["Deciding whether a transaction on three nodes commits or aborts", 1],
        ["Making every live node name the same new leader", 0],
        ["Making every node reach the same commit or abort outcome", 1],
      ],
      why: "Both are consensus problems. Election agrees on one leader, and atomic commit agrees on one outcome for a transaction.",
    },
    {
      type: "order",
      q: "A transaction is aborted by two-phase commit because one database votes no. Put the steps in order.",
      items: [
        "The coordinator sends prepare to every database",
        "One database replies no",
        "The coordinator decides to abort",
        "The coordinator sends abort to all the databases",
      ],
      hint: "Prepare, vote, decide, announce.",
      why: "The votes come in during phase 1. With a no, the coordinator decides to abort and tells every node in phase 2.",
    },
    mc(
      "A coordinator sends commit to three nodes independently. The request to node 3 is lost, while nodes 1 and 2 commit. What is the result?",
      [
        "The transaction is committed on two nodes and not on the third",
        "The transaction is safely aborted everywhere",
        "The transaction commits on node 3 as soon as nodes 1 and 2 finish",
        "Nothing is committed anywhere",
      ],
      "Sending commit and hoping is not enough: a lost request means the nodes disagree about the outcome. That is exactly what two-phase commit prevents.",
    ),
    {
      type: "multi",
      q: "Which statements about two-phase commit are true? Select all that apply.",
      o: [
        "A coordinator (transaction manager) runs the process",
        "Phase 1 asks every node to prepare",
        "If any participant replies no, an abort goes to all nodes",
        "Each participant commits on its own as soon as it votes yes",
        "The coordinator commits once a majority of nodes reply yes",
      ],
      a: [0, 1, 2],
      why: "The coordinator asks, collects the replies and then sends one decision to all. Commit needs every participant to say yes, and a participant that has voted yes waits for the decision.",
    },
    {
      type: "match",
      q: "Match each two-phase commit message to its meaning.",
      pairs: [
        ["prepare", "Can you commit this transaction?"],
        ["yes", "I am ready to commit if told to"],
        ["commit", "Everyone voted yes: apply the transaction"],
        ["abort", "Someone voted no: undo the transaction"],
      ],
      why: "Prepare opens phase 1 and the replies are votes. Commit or abort is the single decision of phase 2.",
    },
    mc(
      "In two-phase commit, which component decides whether the transaction commits or aborts?",
      [
        "The coordinator",
        "The first participant to reply",
        "The participant with the most data",
        "Each participant on its own",
      ],
      "The coordinator collects every vote and sends one decision, so all the nodes end up with the same outcome.",
    ),
    mc(
      "A coordinator contacts five databases. Four vote yes and one never replies because it crashed. How many databases end up committing?",
      ["0", "4", "5", "1"],
      "Commit needs a yes from every participant. A missing reply counts as a no, so the coordinator sends abort and none of the five commit.",
    ),
    mc(
      "The leader of a single-leader system crashes. Why must all the remaining nodes agree on <b>one</b> new leader?",
      [
        "Two leaders would accept conflicting writes",
        "Followers cannot store data without a leader",
        "The old leader may come back and delete the data",
        "The network only has room for one leader",
      ],
      "Single-leader replication relies on exactly one node ordering the writes. Agreeing on the new leader is a consensus problem.",
    ),
    mc(
      "A transaction touches two partitions on different nodes. What does <b>atomic commit</b> demand?",
      [
        "Both partitions commit or both abort",
        "The partition with more data decides",
        "Each partition commits when it is ready",
        "Both partitions must be on the same node",
      ],
      "On a single node atomicity is easy. With several nodes they must all agree on one outcome.",
    ),
    {
      type: "bug",
      q: "This coordinator should commit only if <b>every</b> database voted yes. Click the faulty line.",
      code: [
        "votes = [n.prepare() for n in nodes]",
        "if any(votes):",
        "    for n in nodes: n.commit()",
        "else:",
        "    for n in nodes: n.abort()",
      ],
      a: 1,
      hint: "Which function says that every vote was yes?",
      why: "any(votes) commits when at least one database said yes. It should be all(votes), so a single no leads to an abort.",
    },
    {
      ...mc(
        "In the diagram the grey bars mark time when a database holds locks. Why does a database that voted yes keep its locks until the decision arrives?",
        [
          "It can no longer commit or abort on its own",
          "Locks make the commit run faster",
          "Locks stop the coordinator from crashing",
          "It must wait for the other nodes to finish their disks",
        ],
        "After voting yes a participant has promised it can commit, but the decision belongs to the coordinator. Until it hears back it must keep the data locked.",
      ),
      fig: seq(),
    },
  ]);
})();
