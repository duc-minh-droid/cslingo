/* js/bank/algo-61.js: Phase 2 revision questions (a2-dijkstra, a2-astar, a2-routing). */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, TF } = partScope;
  const B = NIC.bank;
  B.add("a2-dijkstra", [
    M(
      "Dijkstra finishes with a distance for every node. What extra record rebuilds the actual route?",
      [
        "The parent of each node",
        "The weights sorted in order",
        "The count of settled nodes",
        "The largest edge on each route",
      ],
      0,
      "Walk the parent pointers back from the target.",
    ),
    M(
      "You only want the distance to one target T. When can Dijkstra stop?",
      [
        "As soon as T is settled",
        "As soon as T is first seen",
        "After exactly N steps",
        "Never before all nodes are settled",
      ],
      0,
      "A tentative value can still drop; a settled one is final.",
    ),
    TF(
      "A node that is unreachable from the source keeps its distance at infinity.",
      true,
      "Nothing ever relaxes an edge into it.",
    ),
    M(
      "The plain scan version of Dijkstra on 10 nodes needs how many comparisons for its minimum searches (1 + 2 + … + 9)?",
      ["45", "10", "90", "100"],
      0,
      "9 × 10 ÷ 2 = 45.",
    ),
    M(
      "Two unsettled nodes both have the smallest tentative distance. What happens?",
      [
        "Either first; same final distances",
        "The algorithm reports a failure",
        "Both are settled and their distances doubled",
        "The node with the larger name is dropped",
      ],
      0,
      "Ties do not affect the final distances.",
    ),
  ]);
  B.add("a2-astar", [
    M(
      "A* moves a node from which set to which when it expands it?",
      ["From open to closed", "From closed to open", "From unseen to open", "From closed to unseen"],
      0,
      "Expanded nodes are closed; their neighbours enter the open set.",
    ),
    M(
      "A* is a good fit for which task?",
      [
        "Finding a cheap route with a distance estimate",
        "Sorting a long list of names alphabetically",
        "Counting the letters in a large file",
        "Compressing a photograph into a smaller file",
      ],
      0,
      "It is a goal-directed search for a cheapest route.",
    ),
    TF(
      "A* with an admissible heuristic can never expand more nodes than Dijkstra, apart from ties.",
      true,
      "The heuristic can only add information, so nodes that Dijkstra expands for no reason are ruled out.",
    ),
    M(
      "Which statement about the demo's heuristic weight slider is right?",
      [
        "Weight 0 behaves like Dijkstra",
        "Weight 0 behaves like greedy search",
        "Weight 2.5 guarantees the shortest route",
        "Weight has no effect on the cells expanded",
      ],
      0,
      "With no heuristic, f is just g.",
    ),
    M(
      "On an open grid the goal is 16 cells away. Why does A* with Manhattan distance look like a beam and Dijkstra like a disc?",
      [
        "Cells leading away from the goal are ruled out",
        "A* quietly skips every second cell it meets",
        "Dijkstra takes larger steps than A* does",
        "A* ignores the walls when it plans",
      ],
      0,
      "Cells behind the start have large g + h and are never chosen.",
    ),
  ]);
  B.add("a2-routing", [
    M(
      "A link gets cheaper. How does distance-vector routing react?",
      [
        "Quickly, hop by hop",
        "Slowly, counting up to infinity first",
        "It ignores the change entirely",
        "It restarts every router in the network",
      ],
      0,
      "Good news travels fast.",
    ),
    M(
      "A link fails and two routers keep raising each other's cost by a little each round. This is called…",
      ["Count to infinity", "Flooding", "Poisoned reverse", "Split routing"],
      0,
      "Each believes the other still has a route.",
    ),
    M(
      "Z reaches X via Y. With poisoned reverse, what does Z tell Y about X?",
      [
        "That X is infinitely far via Z",
        "That X is exactly one hop away",
        "Nothing: it stays silent for ever",
        "Its complete routing table in full",
      ],
      0,
      "The false claim stops Y from routing back through Z.",
    ),
    TF(
      "Poisoned reverse prevents every possible routing loop.",
      false,
      "It blocks two-router loops only. Longer loops need other measures.",
    ),
    M(
      "RIP treats 16 hops as infinity. What does that do for count-to-infinity?",
      [
        "It caps the count at a small number",
        "It makes every loop impossible to form",
        "It doubles the rate of updates sent",
        "It switches off distance vectors entirely",
      ],
      0,
      "The count is cut off once costs reach 16.",
    ),
    M(
      "The work done by distributed Bellman–Ford is about…",
      ["|N| rounds over up to |E| links", "One round in total", "log |E| work", "|E| squared work per round"],
      0,
      "That is O(|N||E|).",
    ),
  ]);
})();
