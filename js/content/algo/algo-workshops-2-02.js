(function () {
  const partScope = (NIC.shared.algoWorkshops2 = NIC.shared.algoWorkshops2 || {});
  const { MAP, beDijkstra, graphView, reg } = partScope;
  const N = NIC,
    { qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const INF = "∞";

  reg({
    id: "a2-watch",
    order: 90,
    num: "2.W",
    title: "Workshop: be Dijkstra",
    blurb: "No code. Settle nodes yourself, watch roads get checked, and trace the best route.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro:
          "You are the algorithm. The map shows roads and their lengths. Tap <b>A</b> to begin: its distance is 0.",
        missions: [
          {
            id: "first",
            t: "Settle your first node",
            d: "Tap <b>A</b> and watch every road out of it get checked.",
            hint: "A starts at distance 0, so it is the only node you can settle.",
          },
          {
            id: "shortcut",
            t: "Catch a shortcut",
            d: "Keep going until a road gives a node a <b>shorter</b> distance than it had.",
            hint: "Settle C (2). Its road to B is only 1, so B drops from 4 to 3.",
          },
          {
            id: "streak",
            t: "Five right in a row",
            d: "Settle five nodes with no wrong pick and no hints.",
            hint: "Always look at the waiting room and take the smallest distance. The Hint button breaks your streak.",
          },
          {
            id: "route",
            t: "Trace a route",
            d: "After every node is settled, tap a node to see its best route back to A.",
            hint: "Tap F. The route comes from following each node's came-from entry backwards.",
          },
        ],
        build: (stage, api) => beDijkstra(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "a2-watch-1",
          q: "A node in the waiting room has distance 6 and another has 9. Why settle the 6 first?",
          opts: [
            "Every other route would have to pass through something at least 6 away",
            "Smaller numbers are always closer to the goal",
            "Nodes are settled in alphabetical order",
          ],
          a: 0,
          why: "All remaining routes leave the settled set through a node that is already at least 6 away, and road lengths are never negative, so nothing can beat 6. That is why it is final.",
        }),
      );
      root.appendChild(
        predict({
          id: "a2-watch-2",
          q: "You settle a node and one road gives a neighbour 3 instead of its old 4. What is that called?",
          opts: ["Relaxing the edge", "Settling the node", "Breaking the tie"],
          a: 0,
          why: "Relaxing an edge means checking whether going through the node you just settled is shorter, and updating the neighbour's distance (and came-from) if so.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Keep a <b>distance</b> for every node (∞ until reached) and a waiting room of reached-but-unsettled nodes.",
            "Always settle the node with the <b>smallest distance</b>. That distance is final, because roads are never negative.",
            "After settling, <b>relax</b> each road: if going through this node is shorter, update the neighbour and remember where it came from.",
            "Follow <b>came from</b> backwards to rebuild the best route.",
          ],
          "Settle the closest unsettled node, then check every road out of it for a shortcut.",
        ),
      );
    },
  });
  L["a2-watch"] = {
    sum: "Run Dijkstra by hand: pick the smallest, relax the roads, trace the route.",
    steps: [
      {
        t: "What you will practise",
        b: `<p>You'll run <b>Dijkstra</b> yourself, with no code. Each node has a <b>distance</b> from the start (∞ until reached).</p><p>The rule is one line: <span class="key">settle the reached node with the smallest distance, then check its roads for shortcuts.</span></p>`,
        v: F.flow([
          { t: "Pick smallest", c: "blue" },
          { t: "Settle it", c: "teal" },
          { t: "Relax its roads", c: "amber" },
        ]),
        c: {
          q: "Which node do you settle first on a fresh map?",
          o: ["The start node, at distance 0", "The node with the shortest road", "The goal node"],
          a: 0,
          why: "Only the start has a distance at first (0), and 0 is the smallest, so it is settled first.",
        },
      },
      {
        t: "Relaxing a road",
        b: `<p>After settling <b>u</b>, look at each road <b>u – v</b> of length <b>w</b>. The new candidate for <b>v</b> is <span class="key">dist[u] + w</span>. If it is smaller than v's current distance, update v and remember it came from u.</p>`,
        v: F.compare(
          { title: "Candidate is smaller", c: "teal", body: "update the distance, set came-from = u" },
          { title: "Candidate is not smaller", c: "dim", body: "leave it alone" },
        ),
        c: {
          q: "B has distance 4. You settle C (2) and the road C–B is 1. What happens to B?",
          o: [
            "It becomes 3, because 2 + 1 beats 4",
            "It stays 4, because it was reached first",
            "It becomes 1, the length of the road",
          ],
          a: 0,
          why: "The candidate is dist[C] + 1 = 3, which is smaller than 4, so B is updated.",
        },
      },
    ],
    guide: ["Work through the four missions in the workshop."],
  };

  /* =====================================================================
     2.C  CODE DIJKSTRA
     ===================================================================== */
  const adj = (g) => {
    const a = {};
    Object.keys(g.nodes).forEach((n) => (a[n] = []));
    g.edges.forEach(([x, y, w]) => {
      a[x].push([y, w]);
      a[y].push([x, w]);
    });
    return a;
  };
  const G2 = {
    nodes: { S: [60, 150], X: [260, 70], Y: [160, 240], Z: [440, 160] },
    edges: [
      ["S", "X", 7],
      ["S", "Y", 2],
      ["Y", "X", 3],
      ["X", "Z", 1],
    ],
  };
  const G3 = { nodes: { A: [110, 150], B: [260, 150], C: [420, 150] }, edges: [["A", "B", 1]] };

  const STARTER = `def dijkstra(graph, start):
    dist = {v: float("inf") for v in graph}
    dist[start] = 0
    done = set()

    while True:
        # 1. Pick the unsettled node with the smallest distance.
        u = None
        for v in graph:
            # YOUR CODE: if v is not done, is reachable, and is closer than u, let u = v
            pass
        if u is None:
            break                      # nothing left to settle
        done.add(u)
        trace({"type": "settle", "u": u, "dist": dict(dist)})

        # 2. Relax every road out of u.
        for v, w in graph[u]:
            cand = dist[u] + w
            trace({"type": "look", "u": u, "v": v, "cand": cand, "cur": dist[v]})
            # YOUR CODE: if cand is smaller than dist[v], update dist[v]
            pass
    return dist`;
  const SOLUTION = `def dijkstra(graph, start):
    dist = {v: float("inf") for v in graph}
    dist[start] = 0
    done = set()

    while True:
        # 1. Pick the unsettled node with the smallest distance.
        u = None
        for v in graph:
            if v not in done and dist[v] < float("inf") and (u is None or dist[v] < dist[u]):
                u = v
        if u is None:
            break                      # nothing left to settle
        done.add(u)
        trace({"type": "settle", "u": u, "dist": dict(dist)})

        # 2. Relax every road out of u.
        for v, w in graph[u]:
            cand = dist[u] + w
            trace({"type": "look", "u": u, "v": v, "cand": cand, "cur": dist[v]})
            if cand < dist[v]:
                dist[v] = cand
    return dist`;

  function codeScene() {
    return {
      build(stage, test) {
        stage.innerHTML = `<div class="cl-layout"><div data-g></div><table class="dj-tbl" data-t></table></div>`;
        const view = graphView(qs("[data-g]", stage), test.view),
          nodes = Object.keys(test.view.nodes),
          tbl = qs("[data-t]", stage);
        const h = { view, nodes, tbl, start: test.args[1] };
        this.reset(h, test);
        return h;
      },
      reset(h) {
        const dist = Object.fromEntries(h.nodes.map((n) => [n, n === h.start ? 0 : Infinity]));
        h.view.set({ dist, settled: new Set(), cur: null });
        h.view.clearRoute();
        draw(h, dist, new Set(), null, null);
      },
      async frame(h, f, { i, frames, animate }) {
        if (!f) return this.reset(h);
        // rebuild the picture from the start of the trace, so stepping back and scrubbing are exact
        let dist = Object.fromEntries(h.nodes.map((n) => [n, n === h.start ? 0 : Infinity])),
          settled = new Set(),
          cur = null,
          look = null;
        for (let k = 0; k <= i; k++) {
          const x = frames[k];
          if (x.type === "settle") {
            dist = { ...dist, ...x.dist };
            settled.add(x.u);
            cur = x.u;
            look = null;
          } else if (x.type === "look") {
            look = x;
            if (x.cand < (dist[x.v] === undefined ? Infinity : dist[x.v])) dist = { ...dist, [x.v]: x.cand };
          }
        }
        h.view.set({ dist, settled, cur, flash: look && f === look ? look.v : null });
        draw(h, dist, settled, cur, look);
        if (animate && f.type === "look") h.view.look(f.u, f.v, f.cand < f.cur ? "good" : "meh");
      },
      caption(f) {
        if (!f) return "";
        if (f.type === "settle")
          return `Settle <b>${f.u}</b>: the smallest unsettled distance is <b>${f.dist[f.u]}</b>.`;
        if (f.type === "look")
          return `Road ${f.u} – ${f.v}: candidate ${f.cand} vs current ${f.cur === Infinity ? INF : f.cur}. ${f.cand < f.cur ? `<b>Better</b>, so ${f.v} should update.` : "Not better."}`;
        return "";
      },
    };
    function draw(h, dist, settled, cur, look) {
      h.tbl.innerHTML =
        `<tr><th>Node</th><th>Distance</th><th></th></tr>` +
        h.nodes
          .map(
            (n) =>
              `<tr class="${settled.has(n) ? "done" : dist[n] !== Infinity ? "front" : ""} ${n === cur ? "cur" : ""} ${look && look.v === n ? "look" : ""}"><td><b>${n}</b></td><td>${dist[n] === Infinity ? INF : dist[n]}</td><td>${settled.has(n) ? "settled" : ""}</td></tr>`,
          )
          .join("");
    }
  }

  reg({
    id: "a2-code",
    order: 91,
    num: "2.C",
    title: "Workshop: code Dijkstra",
    blurb: "Fill in two short blanks, run the tests and watch your own code settle the map.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.codelab(root, life, {
        who: "byte",
        noun: "Dijkstra",
        entry: "dijkstra",
        watch: true,
        intro:
          "You've done it by hand. Now teach the computer. There are <b>two blanks</b>, marked in orange. Everything else is written for you.",
        brief:
          '<b>Goal:</b> return a dict of shortest distances from <code>start</code>. <code>graph</code> maps each node to a list of <code>[neighbour, length]</code> pairs. Unreachable nodes stay <code>float("inf")</code>. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs the tests.',
        starter: STARTER,
        solution: SOLUTION,
        hints: [
          'Blank 1 is the same decision you made by hand: among nodes that are <b>not done</b> and <b>already reached</b> (<code>dist[v] &lt; float("inf")</code>), which has the smallest distance? Keep the best so far in <code>u</code>.',
          "The first candidate has nothing to compare with, so test <code>u is None</code> before <code>dist[v] &lt; dist[u]</code>. Replace the <code>pass</code> with your <code>if</code>.",
          "Blank 2 is the relax step: <code>if cand &lt; dist[v]:</code> then <code>dist[v] = cand</code> on the next line.",
        ],
        tests: [
          {
            name: "The map from the workshop",
            desc: "Six nodes, nine roads, from A.",
            args: [adj(MAP), "A"],
            expect: { A: 0, B: 3, C: 2, D: 8, E: 10, F: 13 },
            view: MAP,
          },
          {
            name: "A side road is shorter",
            desc: "S to X: direct is 7, via Y is 5.",
            args: [adj(G2), "S"],
            expect: { S: 0, X: 5, Y: 2, Z: 6 },
            view: G2,
            hint: "If this one fails but the map passes, check you update <code>dist[v]</code> whenever the new candidate is smaller.",
          },
          {
            name: "An island",
            desc: "C has no roads. It should stay at infinity.",
            args: [adj(G3), "A"],
            expect: { A: 0, B: 1, C: Infinity },
            view: G3,
            hint: "Only pick nodes that have been reached, otherwise you'd 'settle' C at infinity.",
          },
        ],
        scene: codeScene(),
      });
      root.appendChild(
        predict({
          id: "a2-code-1",
          q: 'In your code, why check <code>dist[v] &lt; float("inf")</code> before picking v as the next node?',
          opts: [
            "An unreached node has no known route, so it can't be settled yet",
            "Infinity is slower to compare than a number",
            "It stops the loop from visiting the start twice",
          ],
          a: 0,
          why: "A node at infinity hasn't been reached by any settled node. Picking it would 'settle' something with no route, and relaxing from it would give nonsense (infinity + w).",
        }),
      );
      root.appendChild(
        predict({
          id: "a2-code-2",
          q: "A graph has 1,000 nodes. Your code scans every node to find the smallest each round. Roughly how many scans happen in total?",
          opts: [
            "About a million: 1,000 rounds of 1,000 checks",
            "About 1,000: one scan in total",
            "About ten thousand",
          ],
          a: 0,
          why: "Each of the 1,000 rounds scans all 1,000 nodes, which is about 1,000 × 1,000 = 1,000,000 checks. A priority queue (heap) is how real implementations avoid the full scan.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Dijkstra in code is two loops: <b>pick the smallest unsettled</b>, then <b>relax its edges</b>.",
            "<code>float(\"inf\")</code> is a handy 'not reached yet' value, but never settle a node that is still at it.",
            "Scanning all nodes each round costs about n² checks; a <b>priority queue</b> is the standard speed-up.",
          ],
          "Pick the closest unsettled node, then improve its neighbours: repeat until nothing is left.",
        ),
      );
    },
  });
  L["a2-code"] = {
    sum: "Write the two decisions at the heart of Dijkstra and watch your code run.",
    steps: [
      {
        t: "What you will write",
        b: `<p>The code lab gives you a working Python skeleton with <b>two blanks</b>. You'll fill them with exactly what you did by hand:</p><ol><li>pick the unsettled node with the smallest distance</li><li>relax each road out of it</li></ol><p>Then run the tests and watch your code settle the map, one step at a time.</p>`,
        v: F.flow([
          { t: "Blank 1: pick", c: "amber" },
          { t: "Settle", c: "teal" },
          { t: "Blank 2: relax", c: "amber" },
        ]),
        c: {
          q: "Which part of Dijkstra is 'relaxing'?",
          o: [
            "Updating a neighbour if the route through this node is shorter",
            "Choosing the next node to settle",
            "Returning the final distances",
          ],
          a: 0,
          why: "Relaxing an edge means testing dist[u] + w against dist[v] and improving it if we can.",
        },
      },
      {
        t: "Reading the picture",
        b: `<p>Under your code, the map replays <b>your run</b> step by step: a pulse along a road is one candidate being checked, and the notebook shows the distances your code holds at that moment.</p><p>If a test fails, pick it in the list and step through: the first wrong number shows where the code went astray.</p>`,
        v: F.compare(
          { title: "Your code's trace", c: "blue", body: "every settle and every road checked is recorded" },
          { title: "The replay", c: "teal", body: "play, step or scrub to find the exact step that went wrong" },
        ),
        c: {
          q: "A test fails. What is the most useful next move?",
          o: [
            "Step through its replay and find the first wrong distance",
            "Run the tests again without changing anything",
            "Load the solution straight away",
          ],
          a: 0,
          why: "Stepping through shows exactly where your code's distances first differ from what you expect, which points at the faulty line.",
        },
      },
    ],
    guide: ["Fill the two blanks and pass the tests in the code lab."],
  };
})();
