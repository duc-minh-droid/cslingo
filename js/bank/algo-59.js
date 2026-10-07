/* js/bank/algo-60.js: Phase 2 revision questions (a2-linkstate, a2-bellman, a2-hierarchy). */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, TF } = partScope;
  const B = NIC.bank;
  B.add("a2-linkstate", [
    M(
      "What does a router put in its link-state packet?",
      [
        "The costs of its own attached links",
        "A copy of its forwarding table",
        "Estimates of the distance to every router",
        "The shortest-path tree",
      ],
      0,
      "Each LSP describes only the sender's own links; the full map is assembled from all of them.",
    ),
    TF(
      "Two routers with the same link-state map, running Dijkstra, find consistent least-cost paths.",
      true,
      "Same input and a deterministic algorithm means the results agree.",
    ),
    M(
      "In the table form of Dijkstra, what does N' hold?",
      [
        "Routers whose least-cost path is already known",
        "All routers adjacent to the source",
        "Routers that still have an infinite distance",
        "The links on the best path",
      ],
      0,
      "A router joins N' when its d(v) is final.",
    ),
    M(
      "A router runs plain Dijkstra on 8 routers. Roughly how many comparisons does the scan for minima use altogether?",
      ["28", "8", "16", "64"],
      0,
      "8 × 7 ÷ 2 = 28.",
      { hint: "1 + 2 + … + 7: pair up 1+7, 2+6, 3+5 and add 4." },
    ),
    M(
      "Which change makes Dijkstra faster on large sparse graphs?",
      [
        "Keep tentative distances in a min-heap",
        "Visit routers in alphabetical order",
        "Flood every update twice",
        "Store the map in a sorted file",
      ],
      0,
      "A heap finds the smallest tentative distance cheaply.",
    ),
    M(
      "From S the shortest-path tree reaches T by S → P → Q → T. Which link goes in S's forwarding table for T?",
      ["(S, P)", "(Q, T)", "(P, Q)", "(S, T)"],
      0,
      "A forwarding table holds the first link out of S.",
    ),
    TF(
      "In link-state routing, a change in a link is broadcast so that every router updates its map.",
      true,
      "Flooding keeps all the maps identical.",
    ),
    {
      type: "order",
      q: "Put the steps of link-state routing in order.",
      items: [
        "Each router measures its own links",
        "Link-state packets are flooded to everyone",
        "Every router assembles the same map",
        "Each router runs Dijkstra from itself",
      ],
      why: "Share first, then compute locally.",
    },
    M(
      "Which is a drawback of link-state routing in a fast-changing network?",
      [
        "Frequent flooding uses a lot of bandwidth",
        "Routers cannot compute shortest paths",
        "Routers never agree on the map",
        "Costs must be negative",
      ],
      0,
      "Every change causes a flood and a recomputation.",
    ),
    M(
      "A–B costs 4, A–C costs 2 and C–B costs 1. After C joins N' (A is the source), what is d(B)?",
      ["3", "4", "2", "1"],
      0,
      "d(B) = min(4, 2 + 1) = 3, via C.",
    ),
    {
      type: "cat",
      q: "Does each feature belong to link-state or distance-vector routing?",
      buckets: ["Link-state", "Distance-vector"],
      items: [
        ["Floods link information to every router", 0],
        ["Exchanges vectors only with neighbours", 1],
        ["Each router runs Dijkstra", 0],
        ["Based on the Bellman–Ford equation", 1],
      ],
      why: "These are the two main families covered in this lecture.",
    },
    M(
      "Dijkstra has settled A and found d(B) = 5 via A. B's neighbour D has link cost 2. What d(D) does B give?",
      ["7", "5", "3", "2"],
      0,
      "5 + 2 = 7 candidate for D.",
    ),
  ]);
  B.add("a2-bellman", [
    M(
      "Which equation sits at the heart of distance-vector routing?",
      [
        "d_x(y) = min over neighbours v of c(x,v) + d_v(y)",
        "d_x(y) = max over neighbours v of c(x,v) + d_v(y)",
        "d_x(y) = c(x,y) alone",
        "d_x(y) = sum of all link costs",
      ],
      0,
      "The Bellman–Ford equation takes the cheapest neighbour.",
    ),
    TF(
      "A distance-vector router needs a complete map of the network.",
      false,
      "It only knows its own links and the vectors its neighbours send.",
    ),
    M(
      "A has neighbour B (cost 2) and C (cost 3). B reports 4 to destination C, and C reports 0 to itself. What is A's distance to C?",
      ["3", "6", "5", "2"],
      0,
      "min(2 + 4, 3 + 0) = 3, going directly.",
    ),
    M(
      "What does 'iterative' mean for distance-vector routing?",
      [
        "It continues until no more information is exchanged",
        "It runs once and stops",
        "It needs a fixed number of rounds known in advance",
        "It uses a loop only on the first router",
      ],
      0,
      "There is no stop signal: the exchange simply dies out when nothing changes.",
    ),
    M(
      "When does a router send its vector to its neighbours after start-up?",
      [
        "Only if its vector has changed",
        "Every second, whatever happens",
        "Never again",
        "Only when asked by a neighbour",
      ],
      0,
      "Silence means nothing is new.",
    ),
    M(
      "The running time of distance-vector (distributed Bellman–Ford) is…",
      ["O(|N| · |E|)", "O(|N|)", "O(log |N|)", "O(|E|)"],
      0,
      "About |N| rounds, each touching up to |E| links.",
    ),
    M(
      "Information spreads one hop per round. A destination is four links away. About how many rounds until the source router can learn it?",
      ["4", "1", "8", "16"],
      0,
      "One extra hop per round: four links need about four rounds.",
    ),
    {
      type: "match",
      q: "Match each item a router stores to its meaning.",
      pairs: [
        ["c(x, v)", "Cost of the link to neighbour v"],
        ["D_x", "x's own vector of distances"],
        ["D_v", "A copy of neighbour v's latest vector"],
      ],
      why: "The Bellman–Ford equation combines all three.",
    },
    {
      type: "order",
      q: "Put the distance-vector loop in order.",
      items: [
        "Initialise: set distances to neighbours, ∞ elsewhere",
        "Wait for a change or an incoming vector",
        "Recompute every entry with the Bellman–Ford equation",
        "Notify neighbours if any entry changed",
      ],
      why: "After notifying, the router goes back to waiting.",
    },
    TF("Distance vectors were used in the early ARPANET.", true, "It is one of the earliest routing methods."),
    M(
      "A router has just started. What is its distance to a destination that is not a neighbour?",
      ["∞", "0", "1", "The number of routers"],
      0,
      "Nothing is known yet, so it is infinity until a neighbour's vector improves it.",
    ),
    M(
      "A neighbour reports ∞ to a destination. Will the router choose that neighbour as next hop for it?",
      [
        "No, unless every neighbour reports ∞",
        "Yes, since ∞ is the largest value",
        "Yes, if the link to it is cheapest",
        "Only on the first round",
      ],
      0,
      "link cost + ∞ is never the minimum while a finite alternative exists.",
    ),
    M(
      "A has neighbours B (link 5, B says 7 to Z) and C (link 3, C says 8 to Z). What is A's distance to Z and the next hop?",
      ["11, via C", "12, via B", "7, via B", "8, via C"],
      0,
      "Via B: 5 + 7 = 12. Via C: 3 + 8 = 11. The smaller is 11, via C.",
    ),
  ]);
  B.add("a2-hierarchy", [
    M(
      "What is an autonomous system (AS)?",
      [
        "A group of routers under one administrator",
        "A single very large router with many ports",
        "A complete copy of the whole Internet map",
        "A special kind of routing packet",
      ],
      0,
      "Aggregating routers into ASes is how routing scales.",
    ),
    M(
      "What does a gateway router do that an internal router does not?",
      [
        "Also runs the inter-AS protocol",
        "Stores every destination on the Internet",
        "Chooses link costs inside the AS",
        "Handles only packets for its own address",
      ],
      0,
      "Gateways sit on the AS boundary and talk to neighbouring ASes.",
    ),
    TF(
      "Inside an AS the routing protocol is mainly about policy, not performance.",
      false,
      "Inside an AS there is one administrator, so the focus is performance. Policy dominates between ASes.",
    ),
    {
      type: "cat",
      q: "Which protocol is each statement about?",
      buckets: ["RIP", "OSPF", "BGP"],
      items: [
        ["Distance vector, with a hop limit of 15", 0],
        ["Link state: each router runs Dijkstra on the AS map", 1],
        ["Exchanges messages over TCP between ASes", 2],
        ["Advertises reachability and applies AS policy", 2],
      ],
      why: "RIP and OSPF run inside an AS; BGP joins ASes.",
    },
    M(
      "In RIP, what does a distance of 16 hops mean?",
      ["Unreachable", "A very slow link", "16 alternative paths", "A path in another AS"],
      0,
      "16 is RIP's infinity.",
    ),
    M(
      "How often do RIP routers exchange their vectors?",
      ["About every 30 seconds", "Once a day", "Every millisecond", "Only when a link fails"],
      0,
      "Neighbours swap advertisements roughly every 30 seconds.",
    ),
    M(
      "What does the 'Open' in OSPF refer to?",
      [
        "The specification is publicly available",
        "Links are always open to traffic",
        "It works only on open networks",
        "It never closes connections",
      ],
      0,
      "OSPF's design is published.",
    ),
    M(
      "BGP messages are carried over which transport protocol?",
      ["TCP", "RIP", "OSPF", "UDP only"],
      0,
      "BGP sessions run over TCP connections.",
    ),
    M(
      "What is one advantage of hierarchical routing?",
      [
        "Smaller routing tables and less update traffic",
        "Every router sees every other router",
        "No policy is needed anywhere",
        "Packets take the shortest possible path always",
      ],
      0,
      "Detail stays local, and only summaries cross AS boundaries.",
    ),
    {
      type: "match",
      q: "Match each protocol to its type.",
      pairs: [
        ["RIP", "Distance-vector, inside an AS"],
        ["OSPF", "Link-state, inside an AS"],
        ["BGP", "Path advertisements between ASes"],
      ],
      why: "Two intra-AS protocols with different algorithms, and one inter-AS protocol.",
    },
    M(
      "Where is OSPF typically deployed, compared with RIP?",
      [
        "Mostly in upper-tier ISPs",
        "Only in small home networks",
        "Only between different ASes",
        "Nowhere, it is no longer used",
      ],
      0,
      "OSPF is the heavier, faster-converging choice.",
    ),
    M(
      "A gateway router needs a forwarding-table entry for a destination in another AS. Which algorithms set it?",
      [
        "Both algorithms together",
        "Only the intra-AS algorithm",
        "Only the inter-AS algorithm",
        "Neither: it is fixed by hand",
      ],
      0,
      "The inter-AS protocol picks the exit; the intra-AS protocol finds the way to it.",
    ),
    M(
      "Which algorithms set the entries for destinations inside the router's own AS?",
      ["The intra-AS algorithm", "The inter-AS algorithm only", "BGP policy only", "A random choice"],
      0,
      "Internal destinations need only the AS's own protocol.",
    ),
  ]);
})();
