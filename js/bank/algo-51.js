(function () {
  const B = NIC.bank;

  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 14}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px">${body}</svg>`;
  const box = (id, x, y, w, h, inner) =>
    `<g data-pick="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${inner}</g>`;

  /* ============================== a1-anatomy ============================== */
  const cellsFig = svg(
    420,
    96,
    [4, 9, 2, 6, 7]
      .map((v, i) => box("c" + i, 10 + i * 80, 30, 70, 50, tx(45 + i * 80, 63, v, { sz: 20, f: "var(--mono)" })))
      .join("") +
      `<path d="M12 22 H228 M12 22 V28 M228 22 V28" stroke="var(--blue)" stroke-width="3" fill="none"/>` +
      tx(120, 14, "checked so far (k = 3)", { sz: 12, c: "var(--text-dim)" }),
  );

  B.add("a1-anatomy", [
    {
      type: "cat",
      q: "A manager gives a programmer four instructions for sorting a support queue. Sort each as a wish or a real algorithm step.",
      buckets: ["A wish: too vague to run", "An algorithm step: nothing left to guess"],
      items: [
        ["Put the more important tickets first", 0],
        ["Swap two neighbours if the left ticket has a lower priority number than the right", 1],
        ["Sort the queue in a sensible way", 0],
        ["Set best to the first ticket in the queue", 1],
      ],
      hint: "Could a computer follow the line with no human judgement?",
      why: "A step is an algorithm step when every question is answered in advance: which two tickets, what comparison, what happens next. 'More important' and 'sensible' leave the meaning to the reader, so they are wishes until someone defines them with numbers and rules.",
    },
    {
      type: "bug",
      q: "This should return the product of all the numbers in a list. The invariant is: after k items, <code>total</code> = the product of those k items. It returns 0 for every list. Click the faulty line.",
      code: ["def product(xs):", "    total = 0", "    for x in xs:", "        total = total * x", "    return total"],
      a: 1,
      hint: "What should the product of zero items be, so that the first multiplication works?",
      why: "The invariant must be true before the loop starts, when 0 items have been checked. The product of nothing is 1, not 0. Starting at 0 makes every later multiplication give 0, so the invariant is false from the very first pass. The loop line itself is right.",
    },
    {
      type: "slider",
      q: "The loop sets <code>best</code> to the first item, then for each later item x does: if x > best, set best to x. It runs on [3, 8, 8, 5, 11, 11, 2]. How many times is <code>best</code> reassigned inside the loop?",
      min: 0,
      max: 6,
      step: 1,
      start: 0,
      ans: 2,
      tol: 0.5,
      unit: " times",
      hint: "The test is strictly greater, so an equal value does not count. Track best: 3, then 8, then 8 again, and so on.",
      why: "best starts at 3. The 8 beats it (change 1). The second 8 is equal, not greater, so no change. 5 is smaller. 11 beats 8 (change 2). The second 11 is equal, so no change. 2 is smaller. That is 2 reassignments, and the invariant still holds at every step.",
    },
    {
      type: "match",
      q: "A find-the-biggest loop has these parts. Match each part to the job it does in the correctness argument.",
      pairs: [
        ["best ← first item", "Initialisation: makes the invariant true before the loop"],
        ["if x > best: best ← x", "Maintenance: keeps the invariant true after each item"],
        ["return best", "Termination: the invariant now answers the question"],
        ["if the list is empty, report an error", "Edge case: settled before the invariant can start"],
      ],
      why: "A loop proof has three checks and one safety net. The start makes the promise true, each pass keeps it true, and at the end the promise is the answer. The empty-list rule exists because 'first item' does not exist there, so the promise could not even begin.",
    },
    {
      type: "pick",
      q: "A loop finds the biggest number. The invariant is: <code>best</code> = the biggest of the items checked so far. The first 3 items (in the blue bracket) have been checked. Tap the cell that <code>best</code> was copied from.",
      fig: cellsFig,
      a: "c1",
      hint: "Look only inside the bracket. Which of those three is biggest?",
      why: "The checked items are 4, 9 and 2, so best is 9, copied from the second cell. The 6 and the 7 are outside the bracket: the invariant says nothing about them yet, and neither one has been looked at.",
    },
    {
      type: "mcq",
      q: "The documentation for <code>average(xs)</code> says: 'xs must hold at least one number.' What kind of statement is this?",
      o: [
        "A precondition on the input",
        "A loop invariant for the sum",
        "A promise about the output",
        "A proof that the loop stops",
      ],
      a: 0,
      hint: "Who has to make this sentence true: the caller before the call, or the code during the loop?",
      why: "A precondition is what the caller must supply for the algorithm to be allowed to work. Dividing by the length of an empty list would fail, so the contract rules that input out. An invariant describes the state during the loop, and a postcondition is about the result.",
    },
  ]);

  /* ============================== a1-bigo ============================== */
  const rowsFig = svg(
    420,
    190,
    [
      ["A", "100 → 400 steps"],
      ["B", "7 → 8 steps"],
      ["C", "300 → 600 steps"],
      ["D", "50 → 50 steps"],
    ]
      .map((r, i) =>
        box(
          r[0],
          10,
          8 + i * 44,
          400,
          36,
          tx(32, 32 + i * 44, r[0], { sz: 18 }) + tx(130, 32 + i * 44, r[1], { sz: 16, f: "var(--mono)", a: "start" }),
        ),
      )
      .join(""),
  );

  B.add("a1-bigo", [
    {
      type: "slider",
      q: "This code runs with n = 40. About how many times does <code>work()</code> run?<br><code>for i in range(n):</code><br><code>&nbsp;&nbsp;for j in range(5):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;work()</code>",
      min: 0,
      max: 400,
      step: 10,
      start: 100,
      ans: 200,
      tol: 20,
      unit: " calls",
      hint: "The inner loop always runs 5 times, whatever n is. So it is 5 per pass of the outer loop.",
      why: "The outer loop runs 40 times and each pass makes 5 calls: 5 × 40 = 200. The inner loop's size never grows with n, so this is still O(n): the 5 is a constant factor that Big-O throws away.",
    },
    {
      type: "cat",
      q: "Sort each piece of code by how its work grows with n, the length of the list <code>xs</code>.",
      buckets: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      items: [
        ["Return the middle item, xs[len(xs) // 2]", 0],
        ["i = n; while i > 1: i = i // 3", 1],
        ["Run two separate loops over xs, one after the other", 2],
        ["For every x in xs, compare it with every y in xs", 3],
        ["Add up the first 10 items of xs", 0],
      ],
      hint: "Ask what grows with n. Dividing by 3 each time is still repeated shrinking.",
      why: "Reading the middle item and adding a fixed 10 items cost the same however long the list is. Dividing by 3 each pass is repeated shrinking, so it is logarithmic (a different base only changes a constant). Two loops in a row add up to 2n, which is O(n). A loop inside a loop over the same list is n × n.",
    },
    {
      type: "bug",
      q: "<code>steps(n)</code> is meant to count how many times you can double <code>i</code> before it reaches n, which takes about log₂ n steps. For n = 1,000,000 it takes a million steps. Click the faulty line.",
      code: [
        "def steps(n):",
        "    count = 0",
        "    i = 1",
        "    while i < n:",
        "        i = i + 1",
        "        count += 1",
        "    return count",
      ],
      a: 4,
      hint: "Adding 1 each time moves very slowly. What would make the gap close faster and faster?",
      why: "Adding 1 climbs from 1 to n one step at a time, which is n steps. Doubling (i = i * 2) covers the distance in about log₂ n steps, since 2 to the power 20 is about a million. The shape of the update, not the loop test, decides the big-O.",
    },
    {
      type: "multi",
      q: "Which of these step counts have n² as their dominant term, so they are O(n²)? Select all.",
      o: ["3n² + 7", "n(n − 1) / 2", "n² + 50n", "40n + 1000", "n³ / 10", "0.01n²"],
      a: [0, 1, 2, 5],
      hint: "Find the biggest power of n in each one. Constants and smaller terms do not change the class.",
      why: "3n² + 7, n(n − 1)/2 (which is n²/2 − n/2), n² + 50n and 0.01n² all have n² as the biggest term; the multipliers 3, ½ and 0.01 are constants that Big-O ignores. 40n + 1000 grows only linearly and n³/10 grows faster, so neither is O(n²) as a tight description.",
    },
    {
      type: "pick",
      q: "Four programs were timed by counting steps at n = 100 and then n = 200. Each row shows the two counts. Tap the program that is <b>quadratic</b>.",
      fig: rowsFig,
      a: "A",
      hint: "Doubling n should make a quadratic program do 2 × 2 = 4 times the work.",
      why: "Going from 100 to 200 doubles n. Row A goes from 100 to 400, which is four times as much, the signature of n². Row C doubles (linear), row B adds one step (logarithmic) and row D does not change (constant).",
    },
    {
      type: "mcq",
      q: "Why do we count <code>work()</code> calls as a function of n, instead of timing the program in seconds?",
      o: [
        "Counts ignore the machine and language",
        "Seconds can never be measured on a real computer",
        "Counts are always smaller than the seconds",
        "Counts include the time the operating system uses",
      ],
      a: 0,
      hint: "Run the same algorithm on a phone and on a supercomputer. What stays the same?",
      why: "Seconds change with the hardware, the language and even what else is running. The number of steps depends only on the algorithm and the input size, so it lets us compare two algorithms fairly. The other options are not true: seconds can be timed, and counts do not include operating-system time.",
    },
  ]);

  /* ============================== a1-surfer ============================== */
  const dilute = svg(
    420,
    140,
    [
      ["F", "rank 0.6", "3 links out"],
      ["G", "rank 0.4", "1 link out"],
      ["H", "rank 0.3", "2 links out"],
    ]
      .map((r, i) => {
        const x = 10 + i * 135;
        return box(
          r[0],
          x,
          10,
          125,
          100,
          tx(x + 62, 40, r[0], { sz: 22 }) +
            tx(x + 62, 66, r[1], { sz: 15, f: "var(--mono)" }) +
            tx(x + 62, 90, r[2], { sz: 15, f: "var(--mono)" }),
        );
      })
      .join("") +
      tx(210, 132, "Each page has exactly one of its links pointing at Z", { sz: 12, c: "var(--text-dim)" }),
  );

  B.add("a1-surfer", [
    {
      type: "order",
      q: "Put the parts of one move of the random surfer in order.",
      items: [
        "Pick a random number between 0 and 1",
        "Compare it with the damping value d",
        "Follow a random link, or teleport to a random page",
        "Add one to the visit count of the page you landed on",
      ],
      hint: "The surfer must decide first, then move, then record.",
      why: "The random number is the coin toss. Comparing it with d tells the surfer whether to click or teleport. Only then can it move, and the visit is counted after landing. Over many moves, the visit shares settle towards each page's PageRank.",
    },
    {
      type: "slider",
      q: "A tiny web has three pages. P links only to Q. Q links to P and R. R has no links out. Each page holds 30 tokens. Each page pours its tokens out equally; a page with no links shares its tokens equally between all 3 pages. After one step, how many tokens does Q hold?",
      min: 0,
      max: 90,
      step: 5,
      start: 30,
      ans: 40,
      tol: 5,
      unit: " tokens",
      hint: "Q gets all 30 of P's tokens, nothing from itself, and a third of R's 30.",
      why: "P sends all 30 to Q. Q sends its own 30 to P and R, so it gives none to itself. R shares its 30 three ways, 10 each, so Q gets 10 more. Q holds 30 + 10 = 40. Check the total: P gets 15 + 10 = 25, R gets 15 + 10 = 25, and 25 + 40 + 25 = 90, so nothing leaked.",
    },
    {
      type: "cat",
      q: "Each situation describes a part of a web. Sort it by what goes wrong for rank if the surfer never teleports.",
      buckets: ["Rank leaks away", "Rank gets trapped", "Neither"],
      items: [
        ["A page with no links out", 0],
        ["Two pages that link only to each other, with other pages linking into them", 1],
        ["A page that links to 12 others, some of which link back", 2],
        ["A page whose only link points back to itself", 1],
        ["A page that nobody links to but which links to two others", 2],
      ],
      hint: "A leak means rank has nowhere to go. A trap means it can go, but only round and round.",
      why: "A page with no links out cannot pass its rank on, so it leaks. A closed loop (or a self-link) lets rank in and never out, which traps it. Pages with a mix of in and out links are fine. A page with no incoming links just has a low rank, which is not a fault.",
    },
    {
      type: "pick",
      q: "F, G and H each have exactly one link that points at page Z. The cards show each page's rank and how many links it has out (rank is shared equally between them). Tap the page that passes the <b>most</b> rank to Z.",
      fig: dilute,
      a: "G",
      hint: "Each link carries rank ÷ links out. F: 0.6 ÷ 3. G: 0.4 ÷ 1. H: 0.3 ÷ 2.",
      why: "F passes 0.6 ÷ 3 = 0.2, G passes 0.4 ÷ 1 = 0.4 and H passes 0.3 ÷ 2 = 0.15. F has the biggest rank but splits it three ways. A link is worth the page's rank divided by its out-links, so a quiet page with one link can beat a busy page with many.",
    },
    {
      type: "bug",
      q: "This step pours rank out. A page with no links should share its rank equally between all pages, but the total rank grows every step. Click the faulty line.",
      code: [
        "def pour(rank, links, pages):",
        "    new = {p: 0 for p in pages}",
        "    for p in pages:",
        "        if not links[p]:",
        "            for q in pages: new[q] += rank[p]",
        "        else:",
        "            for q in links[p]: new[q] += rank[p] / len(links[p])",
        "    return new",
      ],
      a: 4,
      hint: "Add up what the dead-end page hands out in total. Is it more or less than its rank?",
      why: "With 4 pages, this line gives each page the full rank of the dead-end page, so 4 × its rank leaves it: three extra copies appear from nowhere. Each page should receive rank[p] / len(pages). The linked case already divides by the number of links, which is why that line is fine.",
    },
    {
      type: "multi",
      q: "Page T has a PageRank. Which changes would push T's rank <b>up</b>? Select all.",
      o: [
        "A highly ranked page adds a link to T",
        "A page that already links to T removes its other links, so only T is left",
        "Ten obscure pages with no incoming links of their own each link to T",
        "A page that links to T adds 50 new links to other pages",
        "The only page that linked to T deletes its link to T",
      ],
      a: [0, 1, 2],
      hint: "Rank comes in along incoming links. What happens to each link's share when its source adds or removes links?",
      why: "A link from an important page carries a lot. A page that drops its other links no longer splits its rank, so T gets all of it. Ten small links still add up. But when a linking page adds 50 more links, its share for T shrinks to a fiftieth, and if the only page linking to T removes that link, T loses its main source of rank.",
    },
  ]);

  /* ============================== a1-pagerank ============================== */
  const errFig = svg(
    420,
    170,
    [0.3, 0.12, 0.05, 0.02, 0.008, 0.003, 0.001]
      .map((e, i) => {
        const x = 12 + i * 57,
          h = Math.max(6, Math.round(e * 360));
        return box(
          "it" + (i + 1),
          x,
          12,
          50,
          148,
          `<rect x="${x + 10}" y="${130 - h + 20}" width="30" height="${h}" rx="4" fill="var(--blue)"/>` +
            tx(x + 25, 30, e, { sz: 12, f: "var(--mono)" }) +
            tx(x + 25, 154, "it " + (i + 1), { sz: 11, c: "var(--text-dim)" }),
        );
      })
      .join(""),
  );

  B.add("a1-pagerank", [
    {
      type: "slider",
      q: "A web has N = 4 pages and damping d = 0.8. Page J links to exactly 2 pages, one of which is K. In the Google matrix G = d·A + (1 − d)·B, what percentage of J's rank goes to K in one step? Remember the teleport share added to every entry.",
      min: 0,
      max: 100,
      step: 5,
      start: 20,
      ans: 45,
      tol: 5,
      unit: "%",
      hint: "Link part: 0.8 × ½ = 0.4. Teleport part: 0.2 ÷ 4 = 0.05. Add them.",
      why: "G = d × A + (1 − d) × B. J's link to K gives 0.8 × ½ = 0.4, and teleporting adds (1 − 0.8) ÷ 4 = 0.05 to every entry. So K gets 0.4 + 0.05 = 0.45, which is 45%. A page J does not link to still gets 0.05, 5%.",
    },
    {
      type: "order",
      q: "Put the steps of the whole PageRank method in order.",
      items: [
        "Count each page's out-links and fill the link matrix H",
        "Replace each no-link column with 1/N in every entry",
        "Mix in the teleport share to make the Google matrix G",
        "Start with p = 1/N for every page and multiply by G again and again",
        "Stop when p stops changing",
      ],
      hint: "Build the matrix completely before you start multiplying.",
      why: "The matrix has to be finished before you iterate: links first (H), then the dead-end repair, then the teleport mix (G). Power iteration then starts from an equal guess and multiplies by G until the vector settles. Changing the matrix mid-way would mean it never settles on one answer.",
    },
    {
      type: "cat",
      q: "During PageRank, which of these are fixed before iterating and which change on every iteration?",
      buckets: ["Fixed before iterating", "Changes on every iteration"],
      items: [
        ["The link matrix H", 0],
        ["The Google matrix G", 0],
        ["The rank vector p", 1],
        ["The damping value d", 0],
        ["The gap between the new p and the old p", 1],
      ],
      hint: "Only the quantity being improved changes. The rules used to improve it are set up first.",
      why: "H, G and d describe the web and the rules, so they stay put. Each iteration produces a new p, and the gap between consecutive vectors changes as p settles. That shrinking gap is what the stopping rule watches.",
    },
    {
      type: "bug",
      q: "This builds the link matrix H, where column j holds page j's out-links. The result has columns that add up to more than 1. Click the faulty line.",
      code: [
        "def build_h(links, n):",
        "    H = [[0] * n for _ in range(n)]",
        "    for j in range(n):",
        "        for i in links[j]:",
        "            H[i][j] = 1",
        "    return H",
      ],
      a: 4,
      hint: "A page with 4 links should hand each link a quarter of its rank, not all of it.",
      why: "Setting each entry to 1 means a page with 4 links hands out 4 times its rank. Each entry should be 1 / len(links[j]) so every column adds up to 1. The loops are right: j picks the source column and i the target row.",
    },
    {
      type: "pick",
      q: "The bars show how far the rank vector moved at each iteration. You stop at the <b>first</b> iteration where the change is below 0.01. Tap that iteration.",
      fig: errFig,
      a: "it5",
      hint: "Read the numbers above the bars from left to right. 0.02 is still above 0.01.",
      why: "The changes are 0.3, 0.12, 0.05, 0.02, 0.008, 0.003 and 0.001. Iteration 4 (0.02) is still above the line, so iteration 5 (0.008) is the first below 0.01. Iterations 6 and 7 are smaller still, but you have already stopped. Stopping on a small change is enough because each step shrinks the remaining error by a roughly fixed factor.",
    },
    {
      type: "mcq",
      q: "Suppose every iteration halves the remaining error. After 10 iterations, how much of the starting error is left?",
      o: ["About 0.1% is left", "About 3% is left", "About 10% is left", "About 50% is left"],
      a: 0,
      hint: "Halving 10 times: 2 × 2 × 2 × 2 × 2 = 32, and 32 × 32 is about 1,000.",
      why: "Halving ten times divides the error by 2 to the power 10 = 1,024, about a thousand. So roughly a thousandth (0.1%) is left, and the nearest other option, 3%, would need only about 5 halvings. This geometric shrinking is why PageRank on billions of pages needs only a few dozen iterations, not millions.",
    },
  ]);
})();
