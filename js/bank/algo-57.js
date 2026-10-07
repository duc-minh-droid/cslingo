/* js/bank/algo-58.js: Phase 2 revision questions (a2-graphs, a2-astar-hand, a2-admissible). */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, TF } = partScope;
  const B = NIC.bank;
  B.add("a2-graphs", [
    M(
      "In a social-network graph, what would a natural edge be?",
      [
        "A friendship between two people",
        "A single person's profile photo",
        "The total number of users on the site",
        "The text of one message",
      ],
      0,
      "Nodes are people. An edge joins two nodes when the two people are linked.",
    ),
    TF(
      "A directed graph can contain an edge from A to B without any edge from B to A.",
      true,
      "Direction is the whole point: a one-way street is an edge in one direction only.",
    ),
    M(
      "A grid map is 50 cells wide and 50 cells tall with no walls. How many states does its state-space graph have?",
      ["100", "250", "2,500", "125,000"],
      2,
      "One state per cell: 50 × 50 = 2,500.",
    ),
    M(
      "When do breadth-first search and Dijkstra find the same cheapest route?",
      [
        "When every edge has the same cost",
        "When the graph is directed",
        "When the graph has no cycles",
        "Whenever the goal is close to the start",
      ],
      0,
      "If all edges cost the same, the fewest-hops route is also the cheapest.",
    ),
    {
      type: "match",
      q: "Match each pick rule to the search it defines.",
      pairs: [
        ["Lowest cost paid so far", "Dijkstra"],
        ["Lowest estimate to the goal only", "Greedy best-first"],
        ["Lowest cost so far plus estimate", "A*"],
        ["Fewest edges from the start", "Breadth-first search"],
      ],
      why: "The loop is the same; the quantity used to rank the frontier is what differs.",
    },
    M(
      "Which search can finish quickly on an easy map but gives no promise of the cheapest route?",
      [
        "Greedy best-first search",
        "Dijkstra's algorithm",
        "A* with an admissible estimate",
        "Breadth-first search on equal costs",
      ],
      0,
      "It follows the estimate alone, so it ignores what the route has already cost.",
    ),
    TF(
      "A state-space graph must be stored completely in memory before a search can begin.",
      false,
      "Searches usually generate the neighbours of each state on demand and never build most of the graph.",
    ),
    M(
      "Why might a planner use a roadmap instead of a grid for a large outdoor area?",
      [
        "It has far fewer nodes to search",
        "It guarantees diagonal moves",
        "It makes every edge cost 1",
        "It never needs a heuristic",
      ],
      0,
      "A handful of waypoints and roads replaces thousands of tiny cells.",
    ),
    {
      type: "order",
      q: "Put one turn of the generic search loop in order.",
      items: [
        "Pick a node from the frontier using the pick rule",
        "Check whether it is the goal",
        "Expand it: find its neighbours",
        "Add the new neighbours to the frontier",
      ],
      why: "Every search in this lesson follows the same loop; only the pick rule changes.",
    },
    M(
      "A roadmap has 12 waypoints. A grid of the same area has 3,000 cells. Roughly how many times fewer nodes is the roadmap?",
      ["About 25 times", "About 250 times", "About 2,500 times", "About 25,000 times"],
      1,
      "3,000 ÷ 12 = 250.",
      { hint: "3,000 split into 12 equal parts: 3,000 ÷ 10 is 300, so a bit under that." },
    ),
    M(
      "In a weighted graph, how is the cost of a route computed?",
      [
        "Add up the weights of its edges",
        "Count the nodes it visits",
        "Take the largest edge weight on it",
        "Multiply the weights together",
      ],
      0,
      "A route's cost is the sum of the edge costs along it.",
    ),
  ]);
  B.add("a2-astar-hand", [
    M(
      "Node P has g = 7 and h = 3. Node Q has g = 4 and h = 8. Which does A* expand first?",
      ["P, with f = 10", "Q, with f = 12", "Q, because its g is smaller", "Either: they tie"],
      0,
      "f = g + h: P is 10 and Q is 12. The lower f goes first.",
    ),
    M(
      "While A* runs, what can happen to the g value of a node that is already in the open list?",
      [
        "It can drop when a cheaper route to it is found",
        "It never changes once the node is added",
        "It can only increase",
        "It is reset to zero",
      ],
      0,
      "If expanding another node reveals a cheaper route, g and the parent are overwritten.",
    ),
    TF(
      "A* stops as soon as the goal is first added to the open list.",
      false,
      "A cheaper route might still be hiding behind a node with lower f. A* stops when the goal is expanded.",
    ),
    M(
      "Two open nodes both have f = 9. One has h = 2 and the other has h = 6. A common tie-break expands…",
      [
        "The one with h = 2, which is closer to the goal",
        "The one with h = 6, which is further away",
        "Neither: ties cause a failure",
        "Both together",
      ],
      0,
      "Preferring the smaller h pushes the search towards the goal.",
    ),
    M(
      "The open list becomes empty before the goal is expanded. What does A* conclude?",
      ["No route exists", "The goal is the start", "The heuristic was too small", "The route has cost 0"],
      0,
      "Every reachable node was expanded. If the goal was not among them, it cannot be reached.",
    ),
    {
      type: "cat",
      q: "Which quantity is each of these in A*?",
      buckets: ["g", "h", "f"],
      items: [
        ["The cost actually paid from the start so far", 0],
        ["A guess of the cost still to go", 1],
        ["The priority that decides which node goes next", 2],
        ["Straight-line distance to the goal", 1],
      ],
      why: "g is known, h is estimated, and f = g + h ranks the open list.",
    },
    M(
      "Neighbour m currently has g = 12. You are expanding n with g = 6, and the edge n→m costs 5. What is g(m) afterwards?",
      ["11", "12", "17", "6"],
      0,
      "6 + 5 = 11 is below 12, so m is updated to 11 with parent n.",
    ),
    {
      type: "order",
      q: "Put one turn of A* in order.",
      items: [
        "Take the open node with the lowest f",
        "Stop if it is the goal",
        "Close it",
        "Update the g and parent of its neighbours",
      ],
      why: "Pick, test, close, update: the loop repeats until the goal is picked or the open list is empty.",
    },
    M(
      "The open list in A* is best stored as…",
      [
        "A priority queue ordered by f",
        "A sorted list of closed nodes",
        "An unordered set with no order",
        "A stack of recent nodes",
      ],
      0,
      "The operation needed is 'remove the lowest f', which is what a priority queue does well.",
    ),
    TF(
      "A* reopens and re-expands a closed node every time any new route to it appears.",
      false,
      "With a consistent heuristic, a closed node already has its cheapest g, so it is not expanded again.",
    ),
    M(
      "A* is asked for a route from a node to itself. What does it return?",
      ["Cost 0 at once", "No route", "A route of cost 1", "It loops forever"],
      0,
      "The start is the first node taken from the open list and it is already the goal.",
    ),
  ]);
  B.add("a2-admissible", [
    M(
      "What does h*(n) stand for in the definition of an admissible heuristic?",
      [
        "The true cheapest cost left from n",
        "The estimate used by A* at node n",
        "The cost from the start to node n",
        "The number of neighbours of node n",
      ],
      0,
      "Admissible means h(n) ≤ h*(n) for every node.",
    ),
    TF(
      "The heuristic h = 0 for every node is admissible.",
      true,
      "Zero never exceeds the true cost. It just gives no guidance, which turns A* into Dijkstra.",
    ),
    M(
      "On an empty 4-direction grid the goal is 6 cells across and 3 cells up. What is the Manhattan distance?",
      ["3", "6", "9", "18"],
      2,
      "6 + 3 = 9.",
    ),
    M(
      "What is the straight-line distance to a goal 6 cells across and 8 cells up?",
      ["10", "14", "48", "100"],
      0,
      "√(6² + 8²) = √100 = 10.",
    ),
    {
      type: "cat",
      q: "A robot moves in 4 directions on an empty grid. Is each heuristic admissible?",
      buckets: ["Admissible", "Not admissible"],
      items: [
        ["Manhattan distance", 0],
        ["Euclidean distance", 0],
        ["Twice the Manhattan distance", 1],
        ["Manhattan distance plus 3", 1],
      ],
      why: "Manhattan is exactly the true cost on an empty grid and Euclidean is smaller. Doubling it or adding 3 pushes it above the true cost.",
    },
    M(
      "What can an overestimating heuristic cause?",
      [
        "A* skips a cheaper route",
        "A* expands every single node",
        "A* returns no route when one exists",
        "A* runs out of memory",
      ],
      0,
      "The inflated node loses its place in the f ranking.",
    ),
    TF(
      "If h is admissible, A* returns a cheapest route.",
      true,
      "That is the guarantee: optimistic estimates never rule out the best route.",
    ),
    M(
      "Both h1 and h2 are admissible, and h1 ≤ h2 everywhere. Which usually expands fewer nodes?",
      [
        "h2, the larger one",
        "h1, the smaller one",
        "They always expand the same number",
        "Neither: admissibility decides it",
      ],
      0,
      "A larger admissible estimate is closer to the truth, so it prunes more.",
    ),
    M(
      "You solve an easier version of the problem with the walls removed and use its cost as h. Why is h admissible?",
      [
        "Removing rules can only make routes cheaper",
        "Easier problems always offer more routes",
        "Walls always add exactly 1 to the cost",
        "It is always equal to the true cost",
      ],
      0,
      "Any real route is also legal in the relaxed problem, so the relaxed optimum is no larger.",
    ),
    M(
      "A robot moves in 8 directions (diagonal √2 ≈ 1.4). The goal is 5 across and 5 up on an empty grid. By about how much does the Manhattan distance overestimate the true cost?",
      ["About 3", "About 0", "About 5", "About 10"],
      0,
      "Manhattan says 10. The true cost is 5 diagonals ≈ 5 × 1.4 = 7. The overestimate is about 3.",
      { hint: "Five diagonal steps at about 1.4 each cost about 7." },
    ),
    {
      type: "match",
      q: "Match each heuristic to when it is safe.",
      pairs: [
        ["Manhattan distance", "Only when moves are 4-direction"],
        ["Euclidean distance", "On any map without shortcuts under the straight line"],
        ["h = 0", "Always, but it gives no guidance"],
      ],
      why: "Manhattan can overestimate once diagonal moves exist. Straight-line distance never does. Zero is safe but useless.",
    },
    M(
      "A heuristic equals the true remaining cost at every node. How does A* behave?",
      [
        "It heads straight along a cheapest route",
        "It behaves like breadth-first search",
        "It expands every node on the map",
        "It returns a suboptimal route",
      ],
      0,
      "With perfect h, only nodes on a cheapest route have the lowest f.",
    ),
  ]);
})();
