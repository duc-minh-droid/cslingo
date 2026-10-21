/* Data Science Lecture 7 workshop (7.W): five acceptors and two competing proposers. Send PREPARE and ACCEPT, crash
   acceptors, and see when a value is chosen. No code, no typing. */
(function () {
  const S = NIC.shared.dsL7;
  const { reg, mc, pr, st, paxosPanel } = S;
  const N = NIC;
  const { el, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /** The five-acceptor sandbox. Each mission is checked from the simulation state after every action. */
  function sandbox(stage, api) {
    const box = el(`<div class="wk-card"><h3>Five acceptors, two proposers</h3><div></div></div>`);
    stage.appendChild(box);
    paxosPanel(box.lastElementChild, {
      n: 5,
      props: [
        { name: "P1", own: "Noodles" },
        { name: "P2", own: "Tacos" },
      ],
      onEvent(sim, r) {
        const q = sim.q;
        if (r.t === "prepare" && r.got.length >= q && api.done("quorum"))
          api.say(
            `${r.got.length} PROMISEs is a quorum of ${q}. Only now may the proposer send <b>ACCEPT</b>.`,
            "happy",
          );
        if (sim.chosen && api.done("chosen"))
          api.say(`A majority holds <b>${sim.chosen.v}</b>, so it is chosen and the learners may learn it.`, "wink");
        if (r.t === "prepare" && r.down.length >= 3 && r.got.length < q && api.done("stuck"))
          api.say(
            `Only ${r.got.length} acceptors can answer and a quorum needs ${q}. Nothing can be proposed or accepted until some restart.`,
            "think",
          );
        if (r.t === "accept" && r.ign.length > 0 && r.hold < q && api.done("duel"))
          api.say(
            "The acceptors had promised the newer number, so the older ACCEPT was ignored. The older proposer must start again with a higher number.",
            "surprised",
          );
        const p = r.t === "accept" && sim.ps[r.p];
        if (p && p.forced && p.val !== p.own && sim.chosen && sim.chosen.v === p.val && api.done("inherit"))
          api.say(
            `${p.name} wanted ${p.own}, but a PROMISE reported ${p.val}, so it had to re-propose ${p.val}. A chosen value is never overwritten.`,
            "love",
          );
      },
    });
  }

  reg({
    id: "ds7-lab",
    order: 90,
    workshop: true,
    num: "7.W",
    title: "Workshop: five acceptors, two proposers",
    blurb: "No code. Send PREPARE and ACCEPT, crash acceptors and make two proposers compete.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "A tiny Paxos cluster: five acceptors and two proposers who want different lunches. Run rounds, break things and watch when a value is chosen.",
        missions: [
          {
            id: "quorum",
            t: "Win a quorum",
            d: "Select <b>P1 (Noodles)</b> and press <b>Send PREPARE</b> until the promises reach a quorum.",
            hint: "With every acceptor up, all five promise. A quorum of 5 is 3.",
          },
          {
            id: "chosen",
            t: "Get a value chosen",
            d: "Once P1 has a quorum, press <b>Send ACCEPT</b> and watch the learners.",
            hint: "Send ACCEPT is only enabled after a quorum of promises.",
          },
          {
            id: "stuck",
            t: "Lose the quorum",
            d: "Press <b>Reset</b>, tap <b>Crash</b> on three acceptors, then press <b>Send PREPARE</b>.",
            hint: "Three crashed leaves two up. Two is not more than half of five.",
          },
          {
            id: "duel",
            t: "Make two proposers collide",
            d: "Press <b>Reset</b>. With P1 press <b>Send PREPARE</b>. Select <b>P2 (Tacos)</b> and press <b>Send PREPARE</b>. Back on P1, press <b>Send ACCEPT</b>.",
            hint: "P2's PREPARE has a higher number, so the acceptors promised it and now ignore P1's older ACCEPT.",
          },
          {
            id: "inherit",
            t: "Inherit a chosen value",
            d: "Press <b>Reset</b> and get Noodles chosen with P1. Then select <b>P2 (Tacos)</b>, press <b>Send PREPARE</b> and <b>Send ACCEPT</b>.",
            hint: "The PROMISEs tell P2 that Noodles was already accepted, so it has to propose Noodles.",
          },
        ],
        build(stage, api) {
          sandbox(stage, api);
        },
      });
      root.appendChild(
        pr(
          "ds7-lab-1",
          "Three of the five acceptors are crashed. P1 presses <b>Send PREPARE</b> from a fresh start. What happens?",
          [
            "Only 2 PROMISEs: no quorum, so ACCEPT stays locked",
            "3 PROMISEs arrive: the crashed ones still reply",
            "All 5 promise because PREPARE reaches every acceptor",
          ],
          "A crashed acceptor sends no PROMISE. Two promises is below the quorum of 3, so the proposer cannot send ACCEPT.",
        ),
      );
      root.appendChild(
        pr(
          "ds7-lab-2",
          "P1 has a quorum of promises for number 1. Then P2 presses <b>Send PREPARE</b> and also gets a quorum, for number 2. What happens when P1 presses <b>Send ACCEPT</b>?",
          [
            "The acceptors ignore it: they have promised 2",
            "All five accept it: P1 asked first",
            "It succeeds only on the acceptors P2 did not reach",
          ],
          "An acceptor that promised number 2 ignores older proposals. P1's ACCEPT carries number 1, so P1 has to start a new round with a higher number.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A proposer needs a <b>quorum</b> of PROMISEs before it can send ACCEPT, and a <b>majority</b> of ACCEPTED before the value is chosen.",
            "With 5 acceptors the cluster keeps working while <b>2 are crashed</b>, and stops when a third fails.",
            "A <b>higher proposal number supersedes</b> an older one: acceptors ignore the older proposer.",
            "Beyond the slides: a proposer must <b>re-propose</b> a value that a PROMISE reports as already accepted.",
          ],
          "Majorities keep Paxos going through crashes, and numbers settle who wins a collision.",
        ),
      );
    },
  });

  L["ds7-lab"] = {
    sum: "Run Paxos rounds on five acceptors with two competing proposers, crash acceptors and watch when a value is chosen.",
    steps: [
      st(
        "What you will practise",
        "A proposer sends <b>PREPARE</b> and needs a quorum of promises. Then it sends <b>ACCEPT</b>, and the value is <b>chosen</b> once a majority has accepted it.",
        F.flow([
          { t: "PREPARE", s: "ask for promises", c: "blue" },
          { t: "ACCEPT", s: "after a quorum", c: "amber" },
          { t: "Chosen", s: "a majority holds it", c: "teal" },
        ]),
        mc(
          "Five acceptors, of which three are up. Can a value still be chosen?",
          ["Yes: 3 of 5 is a majority", "No: all five acceptors must reply", "No: at most one acceptor may be down"],
          "A quorum of 5 is 3, so three live acceptors can still promise and accept.",
        ),
      ),
      st(
        "Two rules to remember",
        "Acceptors ignore proposals with a <b>lower number</b> than the one they promised. And a proposer that learns of an <b>already accepted value</b> from a PROMISE must propose that value.",
        F.compare(
          {
            title: "Higher number wins",
            c: "blue",
            body: "older proposals are ignored by acceptors that promised a newer one",
          },
          { title: "Inherit, don't overwrite", c: "violet", body: "a value reported in a PROMISE must be re-proposed" },
        ),
        mc(
          "A PROMISE reports that value X was already accepted. What must the proposer send in ACCEPT?",
          ["X, not its own value", "Its own value, as it is the proposer", "Both values together"],
          "Re-proposing the reported value means a value that may already be chosen is never replaced.",
        ),
      ),
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();
