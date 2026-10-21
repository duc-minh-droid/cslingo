/* js/bank/ds-42.js: Data Science lecture 7 revision questions, part 2: ds7-rounds. */
(function () {
  const B = NIC.bank;
  const { mc, pk } = NIC.shared.dsL7;

  B.add("ds7-rounds", [
    {
      type: "order",
      q: "A class vote runs Paxos. Put the events of one successful round in order.",
      items: [
        "A proposer sends PREPARE(6)",
        "A majority of acceptors reply PROMISE(6)",
        "The proposer sends ACCEPT(6, Park)",
        "A majority of acceptors reply ACCEPTED(6, Park)",
        "The learners learn Park",
      ],
      why: "Phase 1 gathers promises, phase 2 gets the value accepted, and the learners learn only after a majority has accepted it.",
    },
    {
      type: "cat",
      q: "Does each event belong to <b>phase 1</b> or <b>phase 2</b> of a Paxos round?",
      buckets: ["Phase 1", "Phase 2"],
      items: [
        ["PREPARE(4) is sent", 0],
        ["PROMISE(4) is returned", 0],
        ["ACCEPT(4, Park) is sent", 1],
        ["ACCEPTED(4, Park) is returned", 1],
        ["An acceptor pledges to ignore number 4 and lower", 0],
        ["Acceptors store the value Park", 1],
      ],
      why: "Phase 1 is PREPARE and PROMISE, about numbers. Phase 2 is ACCEPT and ACCEPTED, about the value.",
    },
    {
      type: "pick",
      q: "ACCEPT(6, Park) is sent to three acceptors. Tap the acceptor that will <b>ignore</b> it.",
      fig: pk([
        ["a", "Acceptor A", "promised 4"],
        ["b", "Acceptor B", "promised 6"],
        ["c", "Acceptor C", "promised 8"],
      ]),
      a: "c",
      hint: "An acceptor ignores proposals numbered below its promise.",
      why: "C promised 8, a newer proposal, so it ignores number 6. B promised exactly 6 for this proposer and A promised less, so both accept.",
    },
    mc(
      "Seven acceptors, and a proposer holds PROMISE from four of them while the other three stay silent. What can it do?",
      [
        "Send ACCEPT: 4 of 7 is a quorum",
        "Wait: it needs all seven promises",
        "Wait: it needs five promises",
        "Start again with a lower number",
      ],
      "A quorum of 7 is 4, so four promises are enough to move on to phase 2.",
    ),
    {
      type: "multi",
      q: "Select every statement that is <b>true</b> about phase 2.",
      o: [
        "ACCEPT carries a proposal number and a value",
        "It is sent after a quorum of promises",
        "Learners learn after ACCEPTED from a majority",
        "Learners learn after the first ACCEPTED arrives",
        "ACCEPT is sent before any PREPARE",
      ],
      a: [0, 1, 2],
      why: "The value only travels in ACCEPT, after a quorum has promised. The learners wait for a majority of ACCEPTED.",
    },
    mc(
      "An acceptor sends PROMISE(9). What exactly has it promised?",
      [
        "To ignore proposals numbered 9 or lower",
        "To accept the next value it is sent",
        "To tell the learners the value at once",
        "To reply to every message numbered 9 or higher",
      ],
      "A PROMISE(n) means ignoring any proposal with an ID less than or equal to n. That is how newer proposals supersede older ones.",
    ),
    {
      type: "bug",
      q: "An acceptor should reply PROMISE only if the PREPARE number is above everything it has promised. Click the faulty line.",
      code: [
        "def on_prepare(n):",
        "    global promised",
        "    if n >= promised:",
        "        promised = n",
        '        reply("PROMISE", n)',
      ],
      a: 2,
      hint: "What should happen when n equals the number already promised?",
      why: "Proposals with an ID less than or equal to the promised number must be ignored, so the test is n > promised. With >= an equal number gets a second promise.",
    },
    {
      type: "slider",
      q: "A replicated log has had positions 0 to 5 decided, one Paxos round each. Which position does the next round decide?",
      min: 0,
      max: 10,
      step: 1,
      start: 3,
      ans: 6,
      tol: 0.5,
      hint: "Positions 0 to 5 are six entries.",
      why: "Each round settles one entry. After positions 0 to 5 the next free position is 6.",
    },
    mc(
      "Proposer P1 got promises for number 3, then P2's PREPARE(4) won promises, so P1's ACCEPT was ignored. What can P1 do now?",
      [
        "Send PREPARE with a number above 4 and try again",
        "Resend ACCEPT(3, v) until it eventually gets through",
        "Wait until P2 gives up the number it is using",
        "Change the number that P2's proposal carries",
      ],
      "The acceptors will ignore anything numbered 4 or lower. P1 starts a new round with a higher number.",
    ),
    mc(
      "A PROMISE reports that Park was already accepted at number 3, but the proposer wanted Zoo. Why must it propose Park? (Beyond the slides.)",
      [
        "Park may already be chosen, so replacing it is unsafe",
        "Acceptors only ever accept the first value they were sent",
        "The proposer is not allowed to suggest values of its own at all",
        "Zoo can never be chosen by any later round of Paxos",
      ],
      "A value accepted by some acceptors may already have reached a majority. Re-proposing it keeps a chosen value from being overwritten.",
    ),
    {
      type: "match",
      q: "Match each role to the messages it handles in a round.",
      pairs: [
        ["Proposer", "Sends PREPARE and ACCEPT"],
        ["Acceptor", "Sends PROMISE and ACCEPTED"],
        ["Learner", "Learns the value after a majority of ACCEPTED"],
      ],
      why: "Proposers start both phases, acceptors answer them and learners only find out the result.",
    },
    {
      type: "cat",
      q: "A cluster has 5 acceptors. Can a round still succeed in each situation?",
      buckets: ["Round can succeed", "Round cannot succeed"],
      items: [
        ["Two acceptors crashed, three up", 0],
        ["Three acceptors crashed, two up", 1],
        ["One acceptor crashed, four up", 0],
        ["Four acceptors crashed, one up", 1],
      ],
      hint: "A quorum of 5 is 3.",
      why: "Three live acceptors are a majority. With only two or one up, no quorum of promises or acceptances is possible.",
    },
    mc(
      "Why does a proposer run the PREPARE and PROMISE phase before it sends a value?",
      [
        "To win promises that older proposals will be ignored",
        "To let the learners vote first on which value is sent",
        "To make sure every acceptor already holds the same log",
        "To avoid ever having to use a proposal number at all",
      ],
      "Phase 1 secures promises from a majority that older proposals will be ignored. (Beyond the slides: the promises also reveal any value already accepted.)",
    ),
  ]);
})();
