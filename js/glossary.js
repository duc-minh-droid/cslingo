/* Glossary for revision questions: NIC.glossify(root, {max}) underlines the first mention of each known term in a node's text and
   gives it the hover / tap tooltip (.term, see css/ux.css). Used by the player on revision questions only.
   Each entry: [pattern (regex source, case-insensitive), short definition]. Keep definitions to one plain sentence. */
(function () {
  const N = NIC;
  const G = [
    // ---- Nature-inspired computing ----
    [
      "evolutionary algorithms?|EAs?",
      "A search that evolves a population of candidate answers using selection, crossover and mutation.",
    ],
    ["populations?", "The set of candidate solutions the algorithm is working with at one time."],
    ["fitness", "A score for how good a candidate solution is. Higher (or lower, if minimising) means better."],
    ["tournaments?", "Pick a few random individuals and let the fittest of them win a place as a parent."],
    [
      "roulette[- ]wheel|fitness[- ]proportional",
      "Selection where each individual's chance of being picked is proportional to its fitness.",
    ],
    [
      "rank selection|rank-based",
      "Selection by position in the fitness ranking, not by the raw scores, so close scores still get a clear edge.",
    ],
    [
      "elitism|elitist",
      "Always copying the best individual(s) unchanged into the next generation, so progress is never lost.",
    ],
    ["mutation", "A small random change to a candidate, which keeps new variety flowing in."],
    ["crossover", "Combining parts of two parents to make a child."],
    ["genome", "The encoded form of a candidate solution, such as a string of bits or a tour order."],
    ["generations?", "One round of selecting parents, making children and forming the next population."],
    [
      "steady[- ]state",
      "An EA that replaces only one or a few individuals per step, instead of the whole population at once.",
    ],
    [
      "selection pressure",
      "How strongly selection favours the fittest. High pressure converges fast but loses variety.",
    ],
    ["premature convergence", "The population becomes too similar too early and gets stuck on a mediocre answer."],
    ["diversity", "How different the individuals in the population are from each other."],
    ["hill[- ]?climb(?:ing|er)?", "Repeatedly move to a better neighbouring solution until none is better."],
    [
      "local optimum|local optima|local maxim(?:um|a)",
      "A solution better than all its neighbours but not the best overall.",
    ],
    ["global optimum|global optima", "The best solution anywhere in the search space."],
    [
      "fitness landscape|landscape",
      "A picture of fitness over the search space: peaks are good solutions, valleys are bad ones.",
    ],
    ["neighbourhoods?", "The set of solutions reachable from the current one with a single small move."],
    ["tabu search", "Local search that forbids recently visited moves for a while, to avoid going round in circles."],
    ["simulated annealing", "Local search that sometimes accepts worse moves, less often as a 'temperature' falls."],
    ["metaheuristics?", "A general search strategy, not tied to one problem, that guides other search steps."],
    ["heuristics?", "A rule of thumb that finds good answers quickly but gives no guarantee of the best."],
    [
      "NP-hard|NP-complete",
      "A class of problems with no known fast exact algorithm: the time needed explodes as the problem grows.",
    ],
    [
      "approximation algorithms?",
      "A fast algorithm that guarantees an answer within a known factor of the best possible.",
    ],
    ["minimum spanning tree|MST", "The cheapest set of edges that connects every node of a graph with no cycles."],
    ["Prim(?:'s)?", "Grows a spanning tree from one node, always adding the cheapest edge that reaches a new node."],
    [
      "Kruskal(?:'s)?",
      "Builds a spanning tree by adding edges from cheapest to dearest, skipping any that make a cycle.",
    ],
    ["travelling salesman|traveling salesman|TSP", "Find the shortest round trip that visits every city exactly once."],
    ["search space", "The set of all possible candidate solutions."],
    ["objective function", "The formula that scores a candidate: what we are trying to maximise or minimise."],
    [
      "ant colony|pheromones?",
      "A method where simulated ants leave 'pheromone' on good paths so later ants prefer them.",
    ],
    ["swarm", "A group of simple agents that follow local rules and together produce clever behaviour."],
    ["Monte Carlo", "Using random sampling to estimate an answer or explore possibilities."],
    ["brute force", "Trying every possible candidate. Always right, but far too slow for big problems."],
    ["combinatorial explosion", "The number of possibilities growing so fast that checking them all is impossible."],
    ["exploration", "Trying new, different regions of the search space."],
    ["exploitation", "Refining the best areas already found."],
    ["one-point crossover", "Cut both parents at one place and swap the tails."],
    ["uniform crossover", "For each gene, copy it from either parent with equal chance."],
    ["permutations?", "An ordering of items, such as the order of cities in a tour."],
    ["deceptive", "A landscape where following the slope leads away from the real best answer."],
    ["bit[- ]flip", "A mutation that flips each bit with a small probability."],
    // ---- Data science: data-intensive systems ----
    ["replicat(?:ion|es?|ed|ing)", "Keeping copies of the same data on several machines."],
    ["partitioning|shard(?:ing|s|ed)?", "Splitting data across machines so each holds only a slice."],
    ["availability", "The system keeps answering requests even when parts of it fail."],
    ["consistency", "Every reader sees the same, up-to-date data."],
    ["eventual consistency", "Copies may disagree briefly, but they all agree if you wait long enough."],
    ["latency", "How long one request takes, from sending to getting the answer."],
    ["throughput", "How much work the system completes per second."],
    [
      "percentiles?|p9[059]|p99\\.9",
      "The value below which a given share of requests fall; p99 means 99% were at least this fast.",
    ],
    ["tail latency", "The slowest few percent of requests, which often hurt users most."],
    ["load balancer", "A front door that spreads incoming requests across several servers."],
    ["caches?|caching", "A small, fast store of recent or popular results, to avoid recomputing or re-reading them."],
    ["fan-out", "How many other places one action must reach, such as the followers who must see a new post."],
    ["scalab(?:le|ility)", "How well the system copes as load or data grows."],
    ["vertical scaling|scaling up", "Making one machine bigger: more CPU, memory or disk."],
    ["horizontal scaling|scaling out", "Adding more machines and sharing the work between them."],
    ["single point of failure|SPOF", "One component whose failure takes down the whole system."],
    ["fault[- ]tolerant|fault tolerance", "The system keeps working correctly even when some parts fail."],
    ["failover", "Automatically switching to a standby copy when the main one fails."],
    ["tombstones?", "A marker saying a key was deleted, so older copies of it are ignored."],
    ["compaction", "Merging log segments and dropping overwritten or deleted entries to reclaim space."],
    ["SSTables?|sorted string tables?", "An immutable file of key-value pairs sorted by key."],
    ["memtable", "The in-memory sorted buffer where recent writes wait before being flushed to disk."],
    [
      "LSM[- ]tree",
      "A storage design that buffers writes in memory and merges sorted files on disk in the background.",
    ],
    ["write-ahead log|WAL", "A log written before the change itself, so the change can be replayed after a crash."],
    ["hash index", "An in-memory map from each key to where its latest value sits in the log file."],
    ["B-trees?", "A sorted, page-based tree index that supports fast lookups and range scans."],
    ["document (?:store|database)s?", "A database holding self-contained, flexible documents such as JSON."],
    ["graph database", "A database that stores nodes and relationships, built for following links."],
    ["key-value", "A store where you look up a value by its key and nothing else."],
    ["wide-column", "A store that groups values into column families under a row key."],
    ["schema", "The agreed structure of the data: which fields exist and what type each has."],
    ["normali[sz]ation|normali[sz]ed", "Storing each fact once and linking to it, to avoid duplicated data."],
    [
      "denormali[sz]ation|denormali[sz]ed",
      "Copying data into several places so reads are fast, at the cost of keeping copies in step.",
    ],
    ["CAP theorem", "During a network split you can keep consistency or availability, but not both."],
    ["quorum", "The minimum number of replicas that must agree for a read or write to count."],
    ["batch processing|batch job", "Processing a large chunk of stored data in one scheduled run."],
    ["stream processing", "Processing events continuously as they arrive."],
    ["technical debt", "Shortcuts in the design that make later changes slower and riskier."],
    ["idempotent", "Doing it twice has the same effect as doing it once, so retries are safe."],
    ["write amplification", "One logical write causing several physical writes on disk."],
    // ---- Algorithms ----
    ["Big[- ]?O|big-oh", "A way to describe how running time or memory grows as the input size n grows."],
    ["admissible", "A heuristic that never overestimates the true remaining cost, so A* stays optimal."],
    ["Dijkstra(?:'s)?", "Finds shortest paths from one start node by always settling the closest unsettled node next."],
    ["A\\*|A-star", "Dijkstra guided by a heuristic that estimates the distance left to the goal."],
    [
      "relax(?:ation|ing|ed|es)?",
      "Checking whether going via this node gives a shorter path to a neighbour, and updating it if so.",
    ],
    ["priority queue|min-heap", "A collection that always hands back the smallest item first."],
    ["PageRank", "Ranks pages by how many important pages link to them."],
    ["damping factor", "The chance that the random surfer follows a link instead of jumping to a random page."],
    ["Markov chain", "A random process where the next state depends only on the current one."],
    ["linear programming|LP", "Optimising a linear objective subject to linear constraints."],
    ["feasible region", "The set of points that satisfy every constraint."],
    ["simplex", "Moves from corner to corner of the feasible region, improving the objective each step."],
    ["slack", "How much room a constraint has left before it is binding."],
    ["tableau", "The table of numbers that simplex updates at each step."],
    [
      "golden[- ]section",
      "A bracket-shrinking search for the minimum of a single-valley function, reusing one probe each time.",
    ],
    ["Nelder[- ]Mead", "Searches without gradients by moving a shape of points (a simplex) across the surface."],
    ["unimodal", "Having a single valley (or peak), so the bracket can be shrunk safely."],
    [
      "minimum cut|min[- ]cut|graph cut",
      "A split of the nodes into two groups. The cut's weight is the total of edges crossing it.",
    ],
    ["cycle property", "The heaviest edge on any cycle is never needed in a minimum spanning tree."],
    ["cut property", "The lightest edge crossing any cut belongs to some minimum spanning tree."],
    ["convex hull", "The smallest convex shape that contains all the points, like a rubber band around them."],
    ["Graham scan", "Sorts points by angle, then keeps only left turns using a stack to build the hull."],
    [
      "orientation|cross product",
      "The sign of a cross product tells whether three points turn left, turn right or are in a line.",
    ],
    [
      "CRC|cyclic redundancy check",
      "A check value from dividing the message, as a polynomial, by a fixed generator to detect errors.",
    ],
    [
      "Hamming code",
      "An error-correcting code with parity bits placed so a single flipped bit can be located and fixed.",
    ],
    ["parity", "An extra bit that makes the count of 1s even (or odd), to detect a flipped bit."],
    ["syndrome", "The pattern of failed parity checks, which points to the position of the bad bit."],
    ["entropy", "The average information per symbol, in bits. Less predictable data has higher entropy."],
    ["Huffman", "A prefix code that gives short bit-strings to common symbols and long ones to rare symbols."],
    ["prefix code", "A code where no codeword begins another, so it can be decoded without separators."],
    ["LZW", "Compression that learns repeated sequences into a growing dictionary as it goes."],
    [
      "hash functions?|hashing",
      "A function that turns any input into a fixed-size number that looks random but is repeatable.",
    ],
    ["collisions?", "Two different inputs that produce the same hash value."],
    ["avalanche", "A tiny change to the input flips about half the bits of the output."],
    ["DFT|discrete Fourier transform", "Breaks a signal into the strengths of its different frequencies."],
    ["FFT|fast Fourier transform", "A fast way to compute the DFT by splitting it into smaller transforms."],
    ["Nyquist", "To capture a frequency you must sample at more than twice that frequency."],
    ["frequency bins?", "One slot of a spectrum, covering a narrow band of frequencies."],
    ["attention", "A mechanism where each token weights the other tokens by relevance and blends their values."],
    ["softmax", "Turns a list of scores into positive weights that add up to 1."],
    ["causal mask", "Blocks attention to certain positions, such as future tokens."],
    ["link[- ]state", "Routing where every router learns the whole map and computes its own shortest paths."],
    ["distance[- ]vector", "Routing where each router shares its distance table only with its neighbours."],
    ["poisoned reverse", "Telling a neighbour your route via it is infinitely far, to stop routing loops."],
    ["invariant", "A statement that stays true at every step of an algorithm."],
  ].map(([pat, tip]) => [new RegExp(`(?<![A-Za-z0-9_])(?:${pat})(?![A-Za-z0-9_])`, "i"), tip]);

  const SKIP = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "SVG", "BUTTON", "INPUT", "TEXTAREA", "SELECT", "A"]);
  function glossify(root, { max = 3 } = {}) {
    if (!root || root.__gloss) return 0;
    root.__gloss = true;
    const used = new Set();
    let count = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        for (let p = n.parentNode; p && p !== root.parentNode; p = p.parentNode) {
          if (
            p.nodeType === 1 &&
            (SKIP.has(p.tagName.toUpperCase()) || p.classList.contains("term") || p.classList.contains("katex"))
          )
            return NodeFilter.FILTER_REJECT;
        }
        return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      let text = node.nodeValue;
      while (count < max) {
        let best = null;
        G.forEach(([re, tip], k) => {
          if (used.has(k)) return;
          const m = re.exec(text);
          if (m && (!best || m.index < best.m.index || (m.index === best.m.index && m[0].length > best.m[0].length)))
            best = { m, tip, k };
        });
        if (!best) break;
        used.add(best.k);
        count++;
        const { m } = best,
          frag = document.createDocumentFragment();
        if (m.index) frag.appendChild(document.createTextNode(text.slice(0, m.index)));
        const span = document.createElement("span");
        span.className = "term";
        span.tabIndex = 0;
        span.dataset.tip = best.tip;
        span.textContent = m[0];
        frag.appendChild(span);
        const rest = text.slice(m.index + m[0].length);
        const tail = document.createTextNode(rest);
        frag.appendChild(tail);
        node.parentNode.replaceChild(frag, node);
        text = rest;
        if (!rest) break;
        // continue scanning the remainder as its own text node
        nodes.splice(nodes.indexOf(node) + 1, 0, tail);
        break;
      }
      if (count >= max) break;
    }
    return count;
  }
  N.glossify = glossify;
})();
