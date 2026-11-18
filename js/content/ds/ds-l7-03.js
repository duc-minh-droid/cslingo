/* Data Science (COM3021), Lecture 7, part 3: ds7-log (7.5, a replicated log and why a reported value is re-proposed). */
(function () {
  const S = NIC.shared.dsL7;
  const { reg, mc, st, logFig, forcedFig } = S;
  const N = NIC;
  const { takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /* ============ 7.5 Keeping a running tab: the log, one round per entry ============ */
  reg({
    id: "ds7-log",
    order: 5,
    num: "7.5",
    title: "Keeping a running tab",
    blurb: "Paxos fills a whole log one entry at a time, and never overwrites a value that may be chosen.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "A replicated log runs <b>one Paxos round per position</b>, each with a higher PREPARE number.",
            "Beyond the slides: a PROMISE also reports any value that acceptor has already accepted.",
            "The proposer must then <b>re-propose</b> that value, so a chosen value is never overwritten.",
          ],
          "One round per line, and never rewrite what may already be decided.",
        ),
      );
    },
  });

  L["ds7-log"] = {
    sum: "A replicated log is filled one Paxos round per position. A PROMISE reports any value already accepted, and the proposer must re-propose it.",
    steps: [
      st(
        "One round per line",
        "Picture a shared bank statement where every line must be agreed. One Paxos round decides one value, so a <b>replicated log</b> runs <b>one round per position</b>. In the lecture, three replicas start from a balance of £100. A round with PREPARE 1 settles <b>+£50</b>, then a round with PREPARE 2 settles <b>−£20</b> at the next position. Every replica ends on the same £130.",
        logFig,
        mc(
          "Replicas hold a log whose last entry is 'add milk'. A client wants 'add eggs'. What does Paxos run?",
          [
            "A new round for the next position",
            "The same round again for the same position",
            "No round: replicas append it and sync later",
          ],
          "Each log position is settled by its own round, and the new round uses a higher number than the earlier ones.",
        ),
      ),
      st(
        "A promise can carry news",
        "<b>Not on the slides</b>, but it keeps Paxos safe. Imagine asking the chat “can I suggest pizza?” and a friend replies “sure, but I already said yes to noodles”. A <b>PROMISE</b> also reports any value that acceptor <b>has already accepted</b>, with its number. The proposer must then <b>re-propose that value</b> (the one with the highest number) instead of its own.",
        forcedFig,
        mc(
          "A PROMISE reports a value that the acceptor has already accepted. What does the proposer put in its ACCEPT?",
          ["The reported value", "Its own value, as planned", "Both values side by side"],
          "It must re-propose the reported value (the one with the highest number), and its own wish is dropped.",
        ),
      ),
      st(
        "Why never overwrite?",
        "Why be so polite? A value that some acceptors accepted may already be held by a majority, which means it may already be <b>chosen</b>, and learners may be acting on it. Swapping it for a new value would leave nodes disagreeing about the past. Re-proposing keeps the golden rule: <b>once a value is chosen, it never changes</b>.",
        F.compare(
          { title: "Overwrite", c: "rose", body: "a chosen value could be replaced: nodes disagree" },
          { title: "Re-propose", c: "teal", body: "the reported value is carried forward: <b>chosen stays chosen</b>" },
        ),
      ),
    ],
  };
})();
