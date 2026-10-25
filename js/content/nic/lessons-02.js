(function () {
  const partScope = (NIC.shared.lessons = NIC.shared.lessons || {});
  const { flow, g, row, table } = partScope;
  const L = NIC.LESSONS;

  L["l2-optim"] = {
    sum: 'Optimisation = find the best solution in a set <b>S</b>, where "best" is measured by a <b>fitness function f(s)</b>.',
    steps: [
      {
        t: "A tiny problem",
        b: `<p>Three items: <b>20 kg</b>, <b>75 kg</b>, <b>60 kg</b>. Choose a subset whose total weight is <b>as close to 100 kg as possible</b>.</p>`,
      },
      {
        t: "Write each solution as bits",
        b: `<p>Use one bit per item: 1 = take it, 0 = leave it. So <code>110</code> means "items 1 and 2", and <code>101</code> means "items 1 and 3". Every item is a yes-or-no choice, and each new item <b>doubles</b> the list of possible solutions: copy the list, then put a 0 on one copy and a 1 on the other. With 3 items that gives <b>8</b> solutions. The whole list is the <b>search space S</b>.</p><p>Use the slider to add items and watch the list double. The newest bit is shown in orange.</p><details class="math-more"><summary>Show the maths</summary><p>Each of the $n$ items has 2 choices, so the search space has $2\\times 2\\times\\dots\\times 2 = 2^n$ solutions. For 3 items that is $2^3=8$. The solutions <code>110</code> and <code>101</code> weigh $20+75=95$ kg and $20+60=80$ kg.</p></details>`,
        v: (box) => NIC.shared.lessons.bitsFig(box),
      },
      {
        t: "Score each one with a fitness function",
        b: `<p>Our score is <b>f(s) = |weight − 100|</b>, how far we are from 100 kg. <b>Smaller is better</b> (a minimisation problem).</p><p><code>110</code>: 95 kg → f = 5.</p>`,
        c: {
          type: "order",
          q: "Items weigh 20 kg, 75 kg and 60 kg, and the target is 100 kg, so f(s) = |weight − 100|. Put these subsets in order from <b>best</b> (smallest f) to <b>worst</b>.",
          items: [
            "<code>101</code>: items 1 and 3",
            "<code>011</code>: items 2 and 3",
            "<code>111</code>: all three items",
            "<code>100</code>: item 1 only",
          ],
          hint: "Add up each subset's weight first, then see how far it is from 100 kg.",
          why: "<code>101</code>: 20 + 60 = 80 kg, so f = 20. <code>011</code>: 75 + 60 = 135 kg, so f = 35. <code>111</code>: 155 kg, so f = 55. <code>100</code>: 20 kg, so f = 80. Smaller f is better.",
        },
      },
      {
        t: "You just did exhaustive search",
        b: `<p>Try all 8, score each, keep the best: that's <b>exhaustive search</b> (also called <b>enumeration</b>). It's <b>guaranteed</b> to find the optimum: here <code>110</code> with f = 5.</p>`,
      },
      {
        t: "The catch: S is usually enormous",
        b: `<p>Doubling sounds harmless until you keep doing it. Ten items give about a thousand subsets, thirty give about a billion, and sixty items would keep a computer busy for tens of years even at a billion checks a second. A real timetable problem (500 exams, 3 weeks) has around <b>10<sup>30</sup></b> candidate timetables, and some spaces are <b>infinite</b> (all real numbers, say). Drag the slider and watch the time to check everything.</p><span class="key">Enumeration is only possible when S is small. Almost every interesting problem is far too big.</span><details class="math-more"><summary>Show the maths</summary><p>$n$ items give $2^n$ subsets: $2^{10}=1{,}024$, $2^{30}\\approx 1.07\\times 10^{9}$ and $2^{60}\\approx 1.15\\times 10^{18}$. At $10^9$ checks per second that last one takes $1.15\\times 10^{9}$ seconds, about 37 years.</p></details>`,
        v: (box) =>
          NIC.shared.lessons.choicesFig(box, {
            label: "Items",
            min: 1,
            max: 60,
            value: 30,
            mainLabel: "subsets",
            l10: (n) => n * Math.log10(2),
            tiles: (n) => Array.from({ length: n }, () => "×2"),
            say: (n, a) => `${n} items give <b>${NIC.shared.lessons.sci(a)}</b> subsets.`,
          }),
        c: {
          q: "You add one more item to a problem. What happens to the number of subsets?",
          o: ["It goes up by one", "It doubles", "It goes up by the number of items you had"],
          a: 1,
          why: "Every old subset now has two versions: with the new item and without it. So the count doubles, and that is why it explodes.",
        },
      },
      {
        t: "Real fitness functions",
        b: `<p><b>Timetabling</b>: f = number of clashes (minimise).<br><b>Car design</b>: f = distance covered on terrain (maximise).<br><b>Circuits, water networks, antennas</b>: f = how closely the design meets the spec.</p>`,
      },
    ],
    guide: [
      "Click the item buttons to build subsets. Watch weight and f(s) update.",
      "Try to find the best subset <i>before</i> revealing. Your tries fill in the table.",
      "Once you've tried all 8 you've done exhaustive search. Then press <b>Reveal</b> to check.",
    ],
  };

  L["l2-complexity"] = {
    sum: "<b>Easy</b> problems: time grows like a polynomial (n²). <b>Hard</b> problems: time grows like an exponential (2ⁿ), which always explodes.",
    steps: [
      {
        t: "Complexity = how time grows with size",
        b: `<p>Let <b>n</b> be the size of a problem (number of items, cities…). Complexity asks how the <b>fastest known exact algorithm's</b> time grows as n grows.</p>`,
        v: table(
          ["Problem", "Steps needed"],
          [
            ["Sort n numbers", "about n log n"],
            ["Closest pair of n vectors", "about n²"],
            ["Best alignment of n sequences", "about 2ⁿ"],
          ],
        ),
      },
      {
        t: "Polynomial vs exponential",
        b: `<p>Some problems get a little harder with every extra item, and some get <b>twice as hard</b>. Take two methods. The first does about n × n steps for n items. The second doubles its work for every extra item. At 10 items they look similar (100 steps against 1,024). At 30 items one needs 900 steps and the other over a billion. Drag the slider and watch the red bar leave the green one far behind.</p><span class="analogy">Polynomial is like adding more lanes of traffic. Exponential is like doubling the traffic every time n goes up by one.</span><details class="math-more"><summary>Show the maths</summary><p><b>Polynomial</b>: n is in the <i>base</i>: $n^2$, $n^3$, $n\\log n$. <b>Exponential</b>: n is in the <i>exponent</i>: $2^n$, $1.1^n$.</p>${table(
          ["n", "n²", "2ⁿ"],
          [
            ["10", "100", "1,024"],
            ["20", "400", "1,048,576"],
            ["30", "900", "1,073,741,824"],
          ],
        )}</details>`,
        v: (box) =>
          NIC.shared.lessons.growthFig(box, {
            min: 2,
            max: 30,
            value: 10,
            a: { l: "n × n steps", f: (n) => n * n },
            b: { l: "2ⁿ steps", f: (n) => 2 ** n },
            say: (n, x, y) =>
              `At n = ${n} the doubling method needs <b>${Math.round(y / x).toLocaleString("en-GB")}</b> times as many steps.`,
          }),
      },
      {
        t: "An exponential always wins eventually",
        b: `<p>An exponential can look harmless at first. Compare one that grows by 10% per item with a polynomial that grows very gently. For small n the polynomial is the bigger one, so it is easy to be fooled. Drag n upwards: the red bar catches up, passes the green one, and never gets caught again.</p><details class="math-more"><summary>Show the maths</summary><p>Even a tiny exponential like $1.1^n$ beats a polynomial like $n^{1.1}$, but only from about $n = 44$ on:</p>${table(
          ["n", "1.1ⁿ", "n¹·¹"],
          [
            ["10", "2.59", "12.6"],
            ["20", "6.73", "27.0"],
            { c: ["50", "117", "73.9"], bad: 1 },
            { c: ["100", "13,780", "159"], bad: 1 },
          ],
        )}</details>`,
        v: (box) =>
          NIC.shared.lessons.growthFig(box, {
            min: 2,
            max: 100,
            value: 10,
            a: { l: "n<sup>1.1</sup> steps", f: (n) => n ** 1.1 },
            b: { l: "1.1<sup>n</sup> steps", f: (n) => 1.1 ** n },
            say: (n, x, y) => (y > x ? "The exponential is now in the lead." : "The gentle polynomial is still ahead."),
          }),
        c: {
          q: "At n = 10, 1.1ⁿ is smaller. What happens as n grows?",
          o: [
            "It stays smaller than n¹·¹ forever",
            "It overtakes n¹·¹ (around n = 44) and races away",
            "They grow at the same rate from then on",
          ],
          a: 1,
          why: "Any exponential eventually dominates any polynomial.",
        },
      },
      {
        t: "Easy vs hard",
        b: `<p><b>Easy (tractable)</b>: a polynomial-time exact algorithm is known. Sorting and finding a minimum spanning tree (MST) are examples.<br><b>Hard (intractable)</b>: the fastest <i>known</i> exact algorithm is exponential, often not much better than exhaustive search.</p><span class="key">"Hard" means no fast exact method is <b>known</b>. It doesn't mean the search space is big: sorting has n! orderings but is easy.</span>`,
      },
      {
        t: "Why you should care",
        b: `<p><b>Almost all important real-world problems are technically hard.</b> Searching all protein structures with 500 amino acids would take trillions of times longer than the age of the universe.</p><p>So for real problems we can't insist on the perfect answer. That's where evolutionary algorithms (EAs) come in.</p>`,
        c: {
          type: "cat",
          q: "Which problems are <b>easy</b> (a polynomial-time exact algorithm is known) and which are <b>hard</b>?",
          buckets: ["Easy", "Hard"],
          items: [
            ["Sorting a list of names", 0],
            ["The travelling salesperson problem", 1],
            ["Finding a minimum spanning tree", 0],
            ["Timetabling 500 exams with no clashes", 1],
          ],
          hint: "Hard means no fast exact method is known, not that the search space is big. Sorting has n! orderings but is easy.",
          why: "No polynomial exact algorithm is known for TSP or for real timetabling, so both are hard. Sorting and finding a minimum spanning tree are easy.",
        },
      },
    ],
    guide: [
      "Drag the <b>problem size</b> slider slowly from 2 to 100 and watch the red (exponential) curve.",
      "Stop at n = 43 and 44: that's where it overtakes.",
      "Look at the time table at n = 20, 40 and 60. The easy rows barely change, while the hard rows explode.",
    ],
  };

  L["l2-mst"] = {
    sum: "The <b>minimum spanning tree</b> is easy: Prim's algorithm solves it fast and perfectly. Add one real-world constraint and it becomes <b>hard</b>.",
    steps: [
      {
        t: "The problem",
        b: `<p>You want to connect 5 towns with cable. Each possible link has a cost. Connect <b>all</b> towns for the <b>lowest total cost</b>. That is the <b>minimum spanning tree (MST)</b> problem.</p><p>Applications: comms network backbones, electricity and water distribution.</p>`,
      },
      {
        t: "What is a spanning tree?",
        b: `<p>A <b>spanning tree</b> uses some of the links so that:</p><p>① every town is connected (it <b>spans</b>), and<br>② there are <b>no cycles</b> (no loops, since a loop means a wasted link).</p><span class="key">A spanning tree on n nodes always has exactly <b>n − 1</b> edges.</span>`,
        c: {
          type: "match",
          q: "A spanning tree on n nodes always has the same number of edges. Match each network to the number of links its spanning tree uses.",
          pairs: [
            ["3 towns", "2 links"],
            ["5 towns", "4 links"],
            ["8 towns", "7 links"],
            ["20 towns", "19 links"],
          ],
          hint: "Every town except the first needs exactly one link to join the tree.",
          why: "n − 1 edges. One fewer and a node is left out. One more and you create a cycle.",
        },
      },
      {
        t: "Prim's algorithm (greedy)",
        b: `<p>① Start from any node.<br>② Look at every edge that connects the tree to a <b>new</b> node.<br>③ Add the <b>cheapest</b> one.<br>④ Repeat until you have n − 1 edges.</p><p>Mini example: A–B 1, B–C 2, A–C 3, C–D 4. Starting at A: take A–B (1), then B–C (2), then C–D (4). Total <b>7</b>.</p>`,
      },
      {
        t: "Why MST counts as easy",
        b: `<p>Prim runs in <b>polynomial time</b> and is <b>guaranteed optimal</b>. Being greedy happens to be perfect for this particular problem.</p>`,
      },
      {
        t: "Add a constraint and everything changes",
        b: `<p>Real networks have extra rules, e.g. <b>no node may have more than 2 connections</b> (a degree limit), or bandwidth requirements between certain pairs.</p><p>Now many trees are <b>infeasible</b>, greedy choices can paint you into a corner, and no fast exact algorithm is known: the problem is <b>hard</b>.</p><span class="key">Real-world MST-style problems are almost always the constrained, hard kind.</span>`,
        c: {
          q: "Why does a constraint break Prim's guarantee?",
          o: [
            "Prim can't add any more edges once a constraint is present",
            "An early cheap choice can force costly ones later",
            "The constraint makes every remaining edge cost more to add",
          ],
          a: 1,
          why: "Greedy never looks ahead. You'll see it happen below: greedy gets 20, but 19 is possible.",
        },
      },
    ],
    guide: [
      "Click edges to build your own spanning tree (4 edges). The panel tells you if it's valid and optimal.",
      "Load <b>Slide tree #1</b> (36) and <b>#2</b> (20).",
      "Press <b>Run Prim step by step</b> repeatedly. Orange dashed edges are the candidates. It ends at 18, the optimum.",
      "Tick <b>Constraint: no node may have degree above 2</b> and run Prim again. It gets 20. Can you find the 19 by hand?",
    ],
  };

  L["l2-approx"] = {
    sum: "For hard problems we use <b>approximate algorithms</b>: good answers in reasonable time, with <b>no guarantee</b> of the best.",
    steps: [
      {
        t: "Exact algorithms",
        b: `<p>An <b>exact</b> algorithm is guaranteed to return an optimal solution. For hard problems the fastest known exact methods are basically exhaustive search, which is far too slow.</p>`,
      },
      {
        t: 'How big is "too slow"?',
        b: `<p><b>New York Tunnels</b> (a simplified water network): 21 pipes, and each pipe can be one of 16 diameters. Choosing a diameter for every pipe is like setting 21 dials with 16 positions each. Every extra pipe makes the pile of designs <b>16 times bigger</b>. Drag the slider up to 21 pipes.</p><span class="key">For the full network there are about 10<sup>25</sup> designs. Checking them all at a billion a second takes hundreds of millions of years.</span><details class="math-more"><summary>Show the maths</summary><p>21 pipes with 16 choices each give $16\\times 16\\times\\dots\\times 16 = 16^{21}\\approx 1.9\\times 10^{25}$ designs. At $10^9$ designs per second that is $1.9\\times 10^{16}$ seconds, about 600 million years.</p></details>`,
        v: (box) =>
          NIC.shared.lessons.choicesFig(box, {
            label: "Pipes",
            min: 1,
            max: 21,
            value: 21,
            mainLabel: "designs",
            l10: (n) => n * Math.log10(16),
            tiles: (n) => Array.from({ length: n }, () => "16"),
            say: (n, a) => `${n} pipes, 16 diameters each: <b>${NIC.shared.lessons.sci(a)}</b> designs.`,
          }),
      },
      {
        t: "Approximate algorithms",
        b: `<p>They:</p><p>✓ deliver solutions in <b>reasonable time</b><br>✓ find <b>pretty good</b> (near-optimal) solutions, and often optimal ones<br>✗ <b>cannot guarantee</b> that the answer is optimal</p><span class="analogy">A sat-nav finds you a very good route in a second. It doesn't prove there's no better route, and you don't care.</span>`,
        c: {
          q: "An approximate algorithm returned a solution. What do you know for sure?",
          o: [
            "It's optimal, since the algorithm finished",
            "It's valid and probably good, but maybe not optimal",
            "It's worse than any exact answer",
          ],
          a: 1,
          why: "No guarantee of optimality. That's the price of speed.",
        },
      },
      {
        t: "Quality vs time",
        b: `<p>The lecture's key curve: a <b>simple method gets good solutions fast</b> but levels off. A <b>sophisticated method (like an evolutionary algorithm, or EA) is slow</b> but gets <b>better solutions eventually</b>.</p>`,
        v: `<svg viewBox="0 0 520 150" role="img" aria-label="Solution quality against time. The simple method climbs quickly, then levels off. The evolutionary algorithm starts slower but ends higher." style="width:100%;max-width:520px;background:var(--bg-2);border:1px solid var(--line);border-radius:12px"><path d="M30 120 C 50 50, 90 45, 490 42" fill="none" stroke="var(--amber)" stroke-width="3"/><path d="M30 130 C 150 125, 220 60, 490 18" fill="none" stroke="var(--teal)" stroke-width="3"/><text x="300" y="60" fill="var(--amber)" font-size="12">simple: good fast</text><text x="330" y="16" fill="var(--teal)" font-size="12">EA: slow, better later</text><text x="20" y="145" fill="var(--text-faint)" font-size="11">time →</text><text x="4" y="14" fill="var(--text-faint)" font-size="11">quality</text></svg>`,
        c: {
          type: "cat",
          q: "Using the quality-vs-time curve, which method would you reach for in each situation?",
          buckets: ["Simple fast method", "EA (sophisticated)"],
          items: [
            ["A sat-nav must re-route you within a second", 0],
            ["Hours of compute to plan the best possible delivery route", 1],
            ["A game must choose a move in 50 milliseconds", 0],
            ["An overnight run to design the cheapest pipe network", 1],
          ],
          hint: "On the curve, the simple method is ahead early on. The EA catches up and overtakes it later.",
          why: "With a tiny time budget the simple method's quick, decent answer wins. With a big budget the sophisticated method overtakes and finds better solutions.",
        },
      },
      {
        t: "Where EAs fit",
        b: `<p><b>EAs are approximate algorithms</b>, and among the most successful and general ones. They often take a while, so get used to that quality-vs-time curve.</p>`,
      },
    ],
    guide: [
      "Press <b>Run EA</b>.",
      "At first the EA's tour (teal) is worse than nearest-neighbour (orange dashed line). Watch for the moment it crosses.",
      "Compare the two tour drawings at the end.",
      "Press <b>New cities</b> and repeat. Does the crossover always happen?",
    ],
  };

  /* =================== LECTURE 3 =================== */
  L["l3-recipe"] = {
    sum: "Every EA is the same loop: <b>score</b> candidates, <b>pick parents</b>, <b>make children</b>, decide <b>who survives</b>.",
    steps: [
      {
        t: "The loop at a glance",
        b: `<p>Lecture 3 opens with the cycle that every evolutionary algorithm (EA) follows. Everything in Lectures 3 and 4 is a detail of one of these boxes.</p>`,
        v:
          flow([
            ["Population", "violet"],
            ["Fitness", "teal"],
            ["Selection", "amber"],
            ["Recombination", "violet"],
            ["Mutation", "rose"],
            ["Replacement", "teal"],
          ]) + `<p class="dim">…then back to the start.</p>`,
      },
      {
        t: "Fitness: give each candidate a score",
        b: `<p>Toy problem <b>OneMax</b>: a solution is a string of bits, and fitness = <b>how many 1s</b> it has. Best possible: all 1s.</p>`,
        v: row(
          "s",
          g("10110", (i) => ("10110"[i] === "1" ? "good" : "")),
          "f(s) = 3",
        ),
      },
      {
        t: "Selection: pick parents (fitter = more likely)",
        b: `<p>One simple way is a <b>tournament of 2</b>: grab two at random and keep the better one.</p>`,
        v:
          row("random pick", g("10110"), "f = 3") +
          row("random pick", g("11101", "good"), "f = 4 → wins, becomes a parent"),
      },
      {
        t: "Recombination: mix two parents",
        b: `<p><b>Crossover</b> copies part of parent 1 and the rest from parent 2.</p>`,
        v:
          row(
            "Parent 1",
            g("11101", (i) => (i < 2 ? "p1" : "")),
          ) +
          row(
            "Parent 2",
            g("00111", (i) => (i >= 2 ? "p2" : "")),
          ) +
          row(
            "Child",
            g("11111", (i) => (i < 2 ? "p1" : "p2")),
            "cut after gene 2",
          ),
      },
      {
        t: "Mutation: a small random change",
        b: `<p>Flip one random bit. This is the only step that creates genetic material that neither parent had.</p>`,
        v:
          row("before", g("11011")) +
          row(
            "after",
            g("11111", (i) => (i === 2 ? "changed" : "")),
            "bit 3 flipped",
          ),
      },
      {
        t: "Replacement: who survives?",
        b: `<p>Here: the child replaces the <b>weakest</b> member if it's at least as good. Otherwise it's thrown away.</p>`,
        c: {
          type: "cat",
          q: "Which steps of the EA recipe look at fitness scores, and which are <b>blind</b> to fitness?",
          buckets: ["Uses fitness", "Blind to fitness"],
          items: [
            ["Selection: choose which parents breed", 0],
            ["Mutation: flip one random bit", 1],
            ["Replacement: choose who survives", 0],
            ["Recombination: cut and join two parents", 1],
          ],
          hint: "Ask whether the step needs to compare scores, or just changes genes.",
          why: "Mutation and crossover just change genes. Selection and replacement use fitness to decide.",
        },
      },
      {
        t: "The rest is vocabulary",
        b: `<p>Different EAs are just different choices for each box: <b>generational vs steady-state</b>, <b>roulette vs rank vs tournament</b> selection, <b>1-point vs uniform</b> crossover, <b>replace weakest vs first weaker</b>. Lecture 4 covers each one.</p>`,
      },
    ],
    guide: [
      "Press <b>Next stage</b> six times, reading the right-hand panel each time. The diagram highlights where you are.",
      'Press <b>Auto-play</b> and watch "best f" climb towards 8.',
      "Click a few terms in the vocabulary map at the bottom.",
    ],
  };

  L["l3-tsp"] = {
    sum: "TSP: visit every city once and come back, as short as possible. A solution is simply an <b>order of cities</b>.",
    steps: [
      {
        t: "The problem",
        b: `<p>A salesperson must visit 5 cities (A–E), each <b>exactly once</b>, and <b>return home</b>. Find the <b>shortest</b> round trip.</p>`,
      },
      {
        t: "Encoding: a solution is an ordering",
        b: `<p>Write a tour as a <b>permutation</b> (every city exactly once):</p>`,
        v: row("tour", g("ABDEC")) + `<p class="dim">means A → B → D → E → C → back to A</p>`,
      },
      {
        t: "Fitness: total distance",
        b: `<p>Look up each hop in the lecture's distance table and add them up. Shorter is better, so we <b>minimise</b>.</p>`,
        v:
          NIC.matrixHTML([
            ["A", "B"],
            ["B", "D"],
            ["D", "E"],
            ["E", "C"],
            ["C", "A"],
          ]) + `<p class="mono" style="margin-top:8px">ABDEC = 5 + 4 + 9 + 7 + 7 = <b>32</b></p>`,
        c: {
          type: "order",
          q: "Using the distance table, put these tours in order from <b>shortest</b> to <b>longest</b>. Each tour returns to its start.",
          fig: `<div style="max-width:360px">${NIC.matrixHTML()}</div>`,
          items: ["<code>ABCED</code>", "<code>ABDEC</code>", "<code>ABCDE</code>", "<code>ACBDE</code>"],
          hint: "Add the five hops of each tour, including the trip back to the start. Compare the totals.",
          why: "ABCED = 5 + 3 + 7 + 9 + 4 = 28. ABDEC = 5 + 4 + 9 + 7 + 7 = 32. ABCDE = 5 + 3 + 2 + 9 + 15 = 34. ACBDE = 7 + 3 + 4 + 9 + 15 = 38.",
        },
      },
      {
        t: "Same tour, different strings",
        b: `<p><code>ABDEC</code> and <code>BDECA</code> are the same loop, just started elsewhere. <code>CEDBA</code> is the same loop driven backwards. So several strings describe one tour.</p>`,
      },
      {
        t: "Too many tours to check",
        b: `<p>Build the tours up one city at a time. Three cities make just one loop. A fourth city can join that loop in any of its <b>3 gaps</b>, giving 3 tours. A fifth can join in any of 4 gaps: 3 × 4 = <b>12 tours</b>. Every new city multiplies the count again, so it explodes. Drag the slider to 20 cities.</p><p>We can't check them all, so we need search methods like hillclimbing (next).</p><details class="math-more"><summary>Show the maths</summary><p>Fix the starting city and order the other $k-1$ cities in $(k-1)!$ ways. Each loop is counted twice (once in each direction), so the number of distinct tours is $\\frac{(k-1)!}{2}$. For $k=5$ that is $24/2=12$, and for $k=20$ about $6\\times 10^{16}$.</p></details>`,
        v: (box) => NIC.shared.lessons.toursFig(box),
        c: {
          q: "Going from 5 cities to 6, the number of distinct tours is multiplied by about",
          o: ["2", "5", "6"],
          a: 1,
          why: "A 6th city can slot into any of the 5 gaps of the 5-city loop, so the count is multiplied by 5: 12 tours become 60.",
        },
      },
    ],
    guide: [
      "Click cities in order to build a tour. The used distances light up in the table.",
      "Try to beat 30 by hand, then press <b>Show an optimal tour</b> (28).",
      "Drag the <b>Cities k</b> slider to see how fast the number of tours explodes.",
    ],
  };
})();
