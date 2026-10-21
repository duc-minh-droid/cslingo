/* Data Science boss quiz for Lecture 7 (the Paxos consensus protocol). New scenario: a hostel booking system (Lantern Lodge). */
(function () {
  const { pk } = NIC.shared.dsL7;

  const fig = pk([
    ["a", "Server A", "promised 3"],
    ["b", "Server B", "promised 12"],
    ["c", "Server C", "promised 7"],
    ["d", "Server D", "promised 9"],
  ]);

  NIC.registerBoss({
    id: "ds7-boss",
    subject: "ds",
    lecture: 7,
    title: "Lecture 7 boss quiz",
    blurb:
      "Ten questions set at a hostel booking system: Paxos roles, proposal numbers, quorums, the two phases, collisions and learners.",
    lede: "A new scenario: <b>Lantern Lodge</b> keeps its room bookings on five servers that run Paxos. Front-desk tablets suggest bookings, the servers decide, and lobby screens show the result. Keep every booking agreed, whatever crashes.",
    qs: [
      {
        type: "cat",
        q: "Which Paxos role is each Lantern Lodge component playing?",
        buckets: ["Proposer", "Acceptor", "Learner"],
        items: [
          ["A front-desk tablet that suggests which guest gets the last room", 0],
          ["A server that replies PROMISE 12 to a PREPARE", 1],
          ["The lobby screen that shows the confirmed booking but never votes", 2],
          ["A server that stores ACCEPTED(12, Room 4) for a guest", 1],
          ["A tablet that sends ACCEPT(12, Room 4) once enough promises are in", 0],
          ["The guest app that is told which room was chosen", 2],
        ],
        why: "Proposers suggest values and start rounds, acceptors promise and accept by majority, and learners are only told the outcome.",
      },
      {
        type: "slider",
        q: "Lantern Lodge runs 5 acceptor servers. At most how many can be crashed while a quorum is still possible?",
        min: 0,
        max: 5,
        step: 1,
        start: 0,
        ans: 2,
        tol: 0.5,
        hint: "A quorum of 5 is 3, so 3 must stay up.",
        why: "More than half of 5 is 3. Five minus three leaves two servers that may fail. A third failure leaves only two, which is no majority.",
      },
      {
        type: "order",
        q: "A desk wants the Garden Suite chosen. Put the steps of the Paxos round in order.",
        items: [
          "The desk sends PREPARE(9) to the servers",
          "A majority of servers reply PROMISE(9)",
          "The desk sends ACCEPT(9, Garden Suite)",
          "A majority of servers reply ACCEPTED(9, Garden Suite)",
        ],
        hint: "Phase 1 gathers promises, phase 2 gets the value accepted.",
        why: "The desk first asks for promises. Only with a quorum of promises does it send the value, and the value is chosen once a majority has accepted it.",
      },
      {
        type: "multi",
        q: "Select every statement that is <b>true</b> about proposal numbers.",
        o: [
          "A proposer's next PREPARE number must exceed every number it used before",
          "Numbers are unique, so proposals can be put in order",
          "A newer proposal can supersede an older one",
          "Two desks may use the same number if they suggest the same room",
          "An acceptor that promised 9 will still answer a later PREPARE(4)",
        ],
        a: [0, 1, 2],
        why: "Unique, increasing numbers order the proposals, so newer ones supersede older ones. After promising 9 an acceptor ignores proposals numbered 9 or lower, and numbers are never shared between proposers.",
      },
      {
        type: "pick",
        q: "PREPARE(10) is sent to four servers. Tap the server that will <b>ignore</b> it.",
        fig,
        a: "b",
        hint: "An acceptor ignores a PREPARE that is not above what it promised.",
        why: "Server B has promised 12 and 10 is lower, so it ignores the message. A, C and D promised less than 10 and each replies PROMISE(10).",
      },
      {
        type: "mcq",
        q: "Five servers. ACCEPTED(4, Loft) has arrived from two of them. When may the lobby screen show 'Loft' as the confirmed room?",
        o: [
          "After a third ACCEPTED, which makes a majority",
          "Immediately: two servers agreeing is enough evidence",
          "After all five servers have reported ACCEPTED",
          "Once the desk that proposed Loft says so",
        ],
        a: 0,
        why: "Learners learn a value only after ACCEPTED from a majority of the acceptors, which is 3 of 5. Waiting for all five would stall as soon as one server crashed.",
      },
      {
        type: "bug",
        q: "A Lantern Lodge desk should send ACCEPT only when it holds promises from a majority of the servers. Click the faulty line.",
        code: [
          "def has_quorum(promises, servers):",
          "    needed = len(servers) // 2",
          "    return len(promises) >= needed",
        ],
        a: 1,
        hint: "For 5 servers, what does len(servers) // 2 give? Is that more than half?",
        why: "With 5 servers 5 // 2 is 2, so two promises would pass, which is not a majority. It should be len(servers) // 2 + 1, giving 3.",
      },
      {
        type: "mcq",
        q: "A desk wants Loft. Its PREPARE(8) gets promises from servers A, B and C. B reports it already accepted Garden Suite at number 6, while A and C report nothing. What does the desk send?",
        o: [
          "ACCEPT(8, Garden Suite)",
          "ACCEPT(8, Loft)",
          "ACCEPT(6, Garden Suite)",
          "Nothing: it must wait for D and E",
        ],
        a: 0,
        why: "A PROMISE that reports an accepted value forces the proposer to re-propose it, under its own new number 8. That way a value that may already be chosen is not overwritten.",
      },
      {
        type: "mcq",
        q: "Desk 1 holds promises for number 11. Desk 2's PREPARE(12) then gets promises from every server. Desk 1 now sends ACCEPT(11, Loft). What happens?",
        o: [
          "The servers ignore it, so desk 1 must retry",
          "The servers accept it, because desk 1 asked before desk 2 did",
          "The servers accept it only if desk 2 agrees to give way",
          "Half of the servers accept it and the other half ignore it",
        ],
        a: 0,
        why: "Having promised 12, the servers ignore anything numbered lower. The newer proposal supersedes the older one, and desk 1 can start again with a number above 12.",
      },
      {
        type: "match",
        q: "Match each Paxos message to what it means.",
        pairs: [
          ["PREPARE(n)", "A proposer asks the acceptors to promise number n"],
          ["PROMISE(n)", "An acceptor will ignore proposals numbered n or lower"],
          ["ACCEPT(n, v)", "A proposer asks for value v to be accepted"],
          ["ACCEPTED(n, v)", "An acceptor confirms it accepted value v"],
        ],
        why: "PREPARE and PROMISE make up phase 1. ACCEPT and ACCEPTED make up phase 2, and the learners wait for ACCEPTED from a majority.",
      },
    ],
  });
})();
