/* js/bank/ds-41.js: Data Science lecture 7 revision questions, part 1: ds7-roles. */
(function () {
  const B = NIC.bank;
  const { mc, pk } = NIC.shared.dsL7;

  B.add("ds7-roles", [
    {
      type: "cat",
      q: "A chat app uses Paxos to agree on each room's topic. Which role is each component playing?",
      buckets: ["Proposer", "Acceptor", "Learner"],
      items: [
        ["A moderator's client asking for the topic to become 'Quiz night'", 0],
        ["A server that votes on which topic is chosen", 1],
        ["A phone that only displays the topic that was chosen", 2],
        ["An admin tool suggesting a new topic", 0],
        ["A replica whose majority decides the topic", 1],
      ],
      why: "Proposers suggest values, acceptors decide by majority and learners are only informed of the outcome.",
    },
    mc(
      "In Paxos, which kind of node is told the chosen value but takes no part in choosing it?",
      ["A learner", "A proposer", "An acceptor", "The coordinator"],
      "Learners need to know the outcome but do not take part in the decision. Proposers suggest values and acceptors choose.",
    ),
    {
      type: "slider",
      q: "A cluster has 9 acceptors. How many of them make a quorum?",
      min: 0,
      max: 9,
      step: 1,
      start: 0,
      ans: 5,
      tol: 0.5,
      hint: "Half of 9 is 4 and a bit, so more than half starts at 5.",
      why: "A quorum is more than half of the acceptors. Four of nine is not a majority, five is.",
    },
    {
      type: "pick",
      q: "Seven acceptors, A to G. Tap the group of acceptors that forms a <b>quorum</b>.",
      fig: pk([
        ["a", "A, B, C", "three acceptors"],
        ["b", "A, B, C, D", "four acceptors"],
        ["c", "E, F", "two acceptors"],
        ["d", "D, E, F", "three acceptors"],
      ]),
      a: "b",
      hint: "More than half of 7 means at least 4.",
      why: "A quorum of 7 is 4. Only A, B, C, D has four acceptors: the groups of two and three are not a majority.",
    },
    {
      type: "multi",
      q: "Select every statement that is <b>true</b> about quorums.",
      o: [
        "A quorum is more than half of the acceptors",
        "A quorum is needed both to propose and to accept values",
        "Any two quorums share at least one acceptor (beyond the slides)",
        "Exactly half of the acceptors counts as a quorum",
        "A proposer must hear from every acceptor before it can go on",
      ],
      a: [0, 1, 2],
      why: "Majorities of the same set always overlap, which is why a majority is enough. Exactly half is not a majority, and Paxos does not wait for every acceptor.",
    },
    mc(
      "A cluster grows from 5 acceptors to 6. How does the number of crashes it can tolerate change?",
      [
        "It stays at 2, because a quorum rises from 3 to 4",
        "It rises from 2 to 3, as there is one more acceptor",
        "It falls from 2 to 1, because there are more nodes to fail",
        "It doubles, since more acceptors can vote",
      ],
      "With 5 acceptors a quorum is 3, so 2 may fail. With 6 a quorum is 4, so 2 may still fail. The sixth acceptor adds cost without more fault tolerance.",
      "Tolerated crashes = acceptors minus quorum size.",
    ),
    {
      type: "order",
      q: "Put the life of one decided value in order, from suggestion to being known.",
      items: [
        "A proposer suggests a value with a unique number",
        "A majority of acceptors agree on that value",
        "The value is considered chosen",
        "The learners are informed of the outcome",
      ],
      why: "Consensus is reached when a majority of acceptors agree. Only then is the value chosen and told to the learners.",
    },
    mc(
      "Two proposers each use proposal number 7 for different values. What is wrong?",
      [
        "Numbers must be unique so they can be ordered",
        "Nothing is wrong: acceptors will choose the larger value",
        "The numbers should be identical across all proposers",
        "Only learners are allowed to pick proposal numbers",
      ],
      "Unique proposal numbers order the proposals so newer ones can supersede older ones. Two equal numbers cannot be ranked.",
    ),
    {
      type: "match",
      q: "Match each Paxos term to its meaning.",
      pairs: [
        ["Proposal number", "A unique, ever-increasing label that orders proposals"],
        ["Quorum", "More than half of the acceptors"],
        ["Consensus", "A majority of acceptors agree on the same value"],
        ["Learner", "A node told which value was chosen"],
      ],
      why: "These are the key ideas of the lecture: numbers order proposals, a quorum is a majority and consensus is reached when a majority agree.",
    },
    {
      type: "bug",
      q: "This code should report a value as chosen only when a majority of the n acceptors hold it. Click the faulty line.",
      code: ["def is_chosen(counts, n):", "    best = max(counts.values())", "    return best >= n / 2"],
      a: 2,
      hint: "With n = 4, is 2 holders more than half?",
      why: "With 4 acceptors two holders is exactly half, which is not a majority. The test must be best > n / 2.",
    },
    mc(
      "Five nodes take part and one of them has crashed. Two-phase commit needs yes from every node. What does Paxos need?",
      [
        "A majority of the acceptors, so it carries on",
        "Every acceptor, so it also stops",
        "At least one acceptor, whichever answers first",
        "A coordinator that never fails",
      ],
      "Paxos needs a majority, which is 3 of 5. One crashed acceptor does not stop it, unlike two-phase commit.",
    ),
    mc(
      "A value was agreed by one majority of acceptors. Why will a later, different majority still notice it? (Beyond the slides.)",
      [
        "The two majorities must share at least one acceptor",
        "Acceptors broadcast every value to the learners first",
        "Later majorities are always the same group",
        "A majority is allowed to overwrite an earlier one",
      ],
      "Any two majorities of the same acceptors overlap, so some acceptor in the later group knows what the earlier group agreed.",
    ),
    {
      type: "slider",
      q: "A cluster of 9 acceptors. Two different majorities are chosen. At least how many acceptors do they share?",
      min: 0,
      max: 5,
      step: 1,
      start: 3,
      ans: 1,
      tol: 0.5,
      hint: "Two groups of 5 need 10 places, but there are only 9 acceptors.",
      why: "5 + 5 = 10 and there are 9 acceptors, so at least 10 - 9 = 1 acceptor is in both.",
    },
    {
      type: "cat",
      q: "A cluster has 7 acceptors. Is each group a quorum?",
      buckets: ["Quorum", "Not a quorum"],
      items: [
        ["4 of 7", 0],
        ["3 of 7", 1],
        ["6 of 7", 0],
        ["2 of 7", 1],
        ["5 of 7", 0],
      ],
      hint: "A quorum of 7 is 4.",
      why: "More than half of 7 is 4 or more. Three or fewer is not a majority.",
    },
  ]);
})();
