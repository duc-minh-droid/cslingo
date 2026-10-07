/* js/bank/algo-59.js: Phase 2 revision questions (a2-weighted, a2-astar-code, a2-internet). */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, TF } = partScope;
  const B = NIC.bank;
  B.add("a2-weighted", [
    M(
      "Weighted A* ranks nodes by…",
      ["g + ε·h with ε above 1", "ε·g + h with ε above 1", "g − h", "h alone, with g ignored"],
      0,
      "Only the heuristic term is scaled up.",
    ),
    TF("With ε = 1, weighted A* is ordinary A*.", true, "f = g + 1·h is the usual f = g + h."),
    M(
      "The cheapest route costs 10 and ε = 4. What is the highest cost weighted A* may return?",
      ["14", "40", "2.5", "10"],
      1,
      "ε-suboptimal means cost ≤ 4 × 10 = 40.",
    ),
    M(
      "Raising ε usually does what?",
      [
        "Expands fewer nodes but may return a costlier route",
        "Expands more nodes and returns a cheaper route",
        "Changes nothing about the work done",
        "Guarantees the cheapest route",
      ],
      0,
      "A bigger ε makes the search greedier.",
    ),
    M(
      "ε grows very large. Weighted A* turns into…",
      ["Greedy best-first search", "Dijkstra's algorithm", "Breadth-first search", "Random search"],
      0,
      "When ε·h swamps g, nodes are ranked by h alone.",
    ),
    {
      type: "match",
      q: "Match each method to its idea.",
      pairs: [
        ["Weighted A*", "Inflate h to trade quality for speed"],
        ["Anytime A*", "Give a quick answer, then improve it while time remains"],
        ["ARA*", "Lower ε step by step, reusing earlier work"],
        ["D*", "Repair the plan when the map changes"],
      ],
      why: "All four belong to the A* family from the lecture.",
    },
    M(
      "A robot driving along a corridor discovers a new blocked doorway. Which method is designed for this?",
      [
        "D*, which repairs the existing plan",
        "Plain Dijkstra restarted from the goal",
        "Weighted A* with ε = 0",
        "Breadth-first search",
      ],
      0,
      "D* reuses most of the old search when the world changes.",
    ),
    TF(
      "Weighted A* with ε = 2 can return a route costing more than twice the cheapest.",
      false,
      "The guarantee is cost ≤ ε × optimal, so twice the cheapest is the ceiling.",
    ),
    M(
      "Which is a practical problem when running A* on a huge map?",
      [
        "The open list can grow to millions of cells",
        "Heuristics are not allowed on big maps",
        "Routes can no longer be traced back",
        "Diagonal moves are forbidden outright",
      ],
      0,
      "Memory for the frontier is a real limit, so coarser maps or weighted A* are used.",
    ),
    {
      type: "order",
      q: "Anytime-style planning lowers ε over time. Order these settings from the roughest and fastest to the exact one.",
      items: ["ε = 4", "ε = 2", "ε = 1.5", "ε = 1"],
      why: "Bigger ε answers sooner with a looser guarantee. ε = 1 is optimal.",
    },
    {
      type: "slider",
      q: "The cheapest route costs 18. With ε = 2.5, what is the highest cost the guarantee allows?",
      min: 10,
      max: 80,
      step: 1,
      ans: 45,
      tol: 2,
      unit: "",
      hint: "2.5 × 18 is 2 × 18 plus half of 18.",
      why: "2.5 × 18 = 45.",
    },
    M(
      "On an empty grid, how do the route costs of Dijkstra and A* with Manhattan distance compare?",
      [
        "Equal, because both are optimal",
        "A* is cheaper, since it has a heuristic",
        "Dijkstra is cheaper, since it explores more",
        "A* is always worse",
      ],
      0,
      "Both return a cheapest route. A* just does less work.",
    ),
  ]);
  B.add("a2-astar-code", [
    M(
      "Why does the Node class define __lt__ using f?",
      [
        "So a heap can order nodes by their score",
        "So nodes at the same cell are merged",
        "So g is recalculated automatically",
        "So the path is stored in order",
      ],
      0,
      "heapq compares items with <. Comparing by f makes heappop return the lowest-f node.",
    ),
    M(
      "How many neighbours does an interior cell have with 8-direction movement and no obstacles?",
      ["4", "6", "8", "9"],
      2,
      "Four straight plus four diagonal.",
    ),
    M(
      "What does the Euclidean heuristic give from (0, 0) to (5, 12)?",
      ["13", "17", "60", "7"],
      0,
      "√(25 + 144) = √169 = 13.",
    ),
    TF(
      "Python's heapq.heappop returns the largest item.",
      false,
      "heapq is a min-heap: it returns the smallest item, here the lowest f.",
    ),
    M(
      "What is the closed set for?",
      [
        "Remembering which cells are already expanded",
        "Holding the cells waiting to be expanded",
        "Storing the obstacle cells",
        "Holding the final path",
      ],
      0,
      "Closed nodes are finished. The open list holds the waiting ones.",
    ),
    M(
      "You follow parent pointers from the goal back to the start. What must you do to get the route in travel order?",
      ["Reverse the list", "Sort it by f", "Remove the first cell", "Nothing: it is already in order"],
      0,
      "Following parents gives goal-first order.",
    ),
    M(
      "One diagonal step crosses a corner that two straight steps would also cross. Roughly how do their costs compare?",
      [
        "Diagonal ≈ 1.4, two straight steps = 2",
        "Diagonal = 2, two straight steps ≈ 1.4",
        "Both cost exactly 1",
        "Both cost exactly 2",
      ],
      0,
      "The diagonal of a unit square is √2 ≈ 1.4, shorter than 1 + 1.",
    ),
    M(
      "A path is made of 9 cells. How many moves does it contain?",
      ["8", "9", "10", "18"],
      0,
      "Consecutive cells are joined by one move each: 9 − 1 = 8.",
    ),
    {
      type: "bug",
      q: "This should return the route from start to goal, but it comes out backwards. Click the faulty line.",
      code: [
        "def rebuild(goal_node):",
        "    path = []",
        "    node = goal_node",
        "    while node is not None:",
        "        path.append(node.position);  node = node.parent",
        "    return path",
      ],
      a: 5,
      why: "The loop collects cells goal-first. It needs <code>return path[::-1]</code> to put them in travel order.",
    },
    M(
      "How many neighbours does a non-corner cell on the edge of the grid have, with 8 directions and no obstacles?",
      ["3", "5", "7", "8"],
      1,
      "Three of the eight offsets would leave the grid, leaving 5.",
    ),
    TF(
      "Python's heapq lets you lower the priority of an item that is already in the heap directly.",
      false,
      "It does not. Code either pushes a duplicate with the better priority or keeps a dictionary of the best node for each cell.",
    ),
    M(
      "On the 8-direction practice map, Manhattan distance expanded fewer cells than Euclidean but gave a longer path. Why?",
      [
        "It overestimates when diagonals are allowed",
        "It ignores every obstacle on the map",
        "It has no heuristic term in f at all",
        "Its f is always smaller than its g",
      ],
      0,
      "Overestimating h makes A* greedier and breaks the optimality guarantee.",
    ),
  ]);
  B.add("a2-internet", [
    {
      type: "order",
      q: "Put the TCP/IP layers in order, from the one nearest the user to the wires.",
      items: ["Application", "Transport", "Network", "Data link", "Physical"],
      why: "A message passes down this stack on the sender and up it on the receiver.",
    },
    M(
      "Which layers does a router need in order to forward packets?",
      [
        "Network, data link and physical",
        "Only the application layer",
        "Application and transport only",
        "Only the physical layer",
      ],
      0,
      "A router reads the destination address at the network layer and uses the layers below to send the packet on.",
    ),
    TF(
      "The entries of a forwarding table are produced by a routing algorithm.",
      true,
      "Routing builds the tables; forwarding uses them.",
    ),
    M(
      "Which job is done again for every single packet that arrives at a router?",
      [
        "Forwarding: a table lookup",
        "Running Dijkstra on the whole map",
        "Rebuilding the topology",
        "Changing the link costs",
      ],
      0,
      "Forwarding is the fast, local step. Routing runs far less often.",
    ),
    M(
      "Links P–Q 4, Q–R 2, R–S 3 and P–S 10 form the whole network. Which is the least-cost path from P to S?",
      ["P → Q → R → S (cost 9)", "P → S (cost 10)", "P → Q → S (cost 14)", "No path exists"],
      0,
      "4 + 2 + 3 = 9, which beats the direct link at 10.",
    ),
    {
      type: "cat",
      q: "Is each statement about a global or a decentralised routing algorithm?",
      buckets: ["Global", "Decentralised"],
      items: [
        ["Every router knows the whole topology and all link costs", 0],
        ["A router knows only its attached links and its neighbours' information", 1],
        ["Each router can run Dijkstra on its own copy of the map", 0],
        ["Routers compute iteratively by exchanging results with neighbours", 1],
      ],
      why: "Link-state is global. Distance-vector is decentralised.",
    },
    M(
      "Why is a message cut into packets?",
      [
        "So many senders can share the links",
        "So that it uses less data in total",
        "So that it can skip some routers",
        "So the receiver gets the end first",
      ],
      0,
      "Small units are forwarded independently and interleave on shared links.",
    ),
    TF(
      "In the routing lectures, the graph is treated as undirected, so c(x, y) equals c(y, x).",
      true,
      "That assumption keeps costs symmetric.",
    ),
    M(
      "A routing algorithm that adjusts link costs according to current congestion is called…",
      ["Load-sensitive", "Static", "Global", "Hierarchical"],
      0,
      "Load-sensitive algorithms respond to traffic conditions.",
    ),
    M(
      "Which of these is hardware rather than a protocol?",
      ["An optical fibre", "TCP", "IP", "A routing protocol"],
      0,
      "TCP and IP are protocols (rules). A fibre is physical medium.",
    ),
    M(
      "What is the cost of a path through routers V → W → X → Y with link costs 2, 5 and 1?",
      ["8", "5", "10", "6"],
      0,
      "2 + 5 + 1 = 8.",
    ),
    M(
      "What does it mean that a packet is forwarded 'store and forward'?",
      [
        "A router gets the whole packet first",
        "The packet is saved at the sender forever",
        "Only the destination keeps a copy",
        "Routers drop every second packet",
      ],
      0,
      "Each router reads the full packet, then transmits it onward.",
    ),
  ]);
})();
