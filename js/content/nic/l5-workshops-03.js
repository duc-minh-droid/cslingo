/* l5-workshops-03.js: Nature-Inspired Lecture 5 code lab 5.C "Code a valid tour" (Python).
   The learner writes the three small decisions that keep a permutation chromosome valid: the validity test, the swap mutation
   and the repair after a one-point crossover. Expected outputs come from a reference implementation in this file. */
(function () {
  const N = NIC,
    { qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  const STARTER = `def evolve(p1, p2, cut, i, j):
    cities = sorted(p1)
    child = list(p1[:cut]) + list(p2[cut:])    # one-point crossover
    trace({"type": "cross", "child": list(child), "cut": cut})
    raw_valid = is_valid_tour(child, cities)
    trace({"type": "check", "child": list(child), "ok": raw_valid})

    missing = [c for c in cities if c not in child]
    seen = set()
    for k in range(len(child)):
        if child[k] in seen:
            # YOUR CODE: put the next missing city here (missing.pop(0)) so no city repeats
            pass
        seen.add(child[k])
        trace({"type": "scan", "child": list(child), "k": k})

    mutant = swap_mutation(child, i, j)
    trace({"type": "swap", "tour": list(mutant), "i": i, "j": j})
    return {"raw_valid": raw_valid, "child": child, "mutant": mutant}


def is_valid_tour(tour, cities):
    # YOUR CODE: return True only when every city appears exactly once
    return False


def swap_mutation(tour, i, j):
    t = list(tour)
    # YOUR CODE: swap the cities at positions i and j
    pass
    return t`;

  const SOLUTION = `def evolve(p1, p2, cut, i, j):
    cities = sorted(p1)
    child = list(p1[:cut]) + list(p2[cut:])    # one-point crossover
    trace({"type": "cross", "child": list(child), "cut": cut})
    raw_valid = is_valid_tour(child, cities)
    trace({"type": "check", "child": list(child), "ok": raw_valid})

    missing = [c for c in cities if c not in child]
    seen = set()
    for k in range(len(child)):
        if child[k] in seen:
            child[k] = missing.pop(0)
        seen.add(child[k])
        trace({"type": "scan", "child": list(child), "k": k})

    mutant = swap_mutation(child, i, j)
    trace({"type": "swap", "tour": list(mutant), "i": i, "j": j})
    return {"raw_valid": raw_valid, "child": child, "mutant": mutant}


def is_valid_tour(tour, cities):
    return sorted(tour) == sorted(cities)


def swap_mutation(tour, i, j):
    t = list(tour)
    t[i], t[j] = t[j], t[i]
    return t`;

  // reference implementation (JavaScript twin of the solution)
  function ref(p1, p2, cut, i, j) {
    const cities = [...p1].sort(),
      child = p1.slice(0, cut).concat(p2.slice(cut)),
      rawValid = new Set(child).size === child.length;
    const missing = cities.filter((c) => !child.includes(c)),
      seen = new Set();
    child.forEach((c, k) => {
      if (seen.has(c)) child[k] = missing.shift();
      seen.add(child[k]);
    });
    const mutant = child.slice();
    [mutant[i], mutant[j]] = [mutant[j], mutant[i]];
    return { raw_valid: rawValid, child, mutant };
  }
  const mk = (p1, p2, cut, i, j, name, desc, hint) => ({
    name,
    desc,
    hint,
    args: [p1, p2, cut, i, j],
    expect: ref(p1, p2, cut, i, j),
  });
  const A = ["A", "B", "C", "D", "E", "F"];
  const TESTS = [
    mk(
      A,
      ["A", "B", "C", "F", "E", "D"],
      3,
      1,
      4,
      "A child that is already a tour",
      "Parents ABCDEF and ABCFED, cut after 3 cities. Nothing repeats, so nothing needs repairing.",
      "If this fails, check <code>is_valid_tour</code> returns <code>True</code> for a tour with no repeats, and that the swap really exchanges the two positions.",
    ),
    mk(
      ["C", "A", "F", "B", "E", "D"],
      A,
      3,
      0,
      5,
      "One city appears twice",
      "The child CAF + DEF has F twice and no B. Repair puts B where the second F is.",
      "The raw child must be reported invalid (<code>raw_valid</code> False). Then the blank in the loop replaces the repeat with <code>missing.pop(0)</code>.",
    ),
    mk(
      ["B", "E", "A", "F", "C", "D"],
      ["D", "C", "F", "B", "A", "E"],
      2,
      2,
      3,
      "Two cities appear twice",
      "Two repeats and two missing cities. The missing ones are used in alphabetical order, left to right.",
      "Keep the <b>first</b> copy of a city and replace later ones. <code>missing.pop(0)</code> takes the next missing city each time.",
    ),
    mk(
      ["F", "E", "D", "C", "B", "A"],
      A,
      4,
      0,
      5,
      "Swap the two ends",
      "A late cut, and a swap between the first and last positions.",
      "Positions count from 0, so <code>t[0]</code> and <code>t[5]</code> are the ends. Swap with <code>t[i], t[j] = t[j], t[i]</code>.",
    ),
  ];

  const row = (lbl, cells) =>
    `<div class="genome-row"><span class="lbl">${lbl}</span><span class="genome">${cells.join("")}</span></div>`;
  const cell = (c, cls = "") => `<span class="gene ${cls}">${c}</span>`;

  function scene() {
    const draw = (h, rows, status) => {
      h.rows.innerHTML = rows;
      h.status.innerHTML = status;
    };
    return {
      build(stage, test) {
        stage.innerHTML = `<div class="nw5-scene"><div data-r></div><div class="callout blue" data-s></div></div>`;
        const h = { rows: qs("[data-r]", stage), status: qs("[data-s]", stage) };
        this.reset(h, test);
        return h;
      },
      reset(h, test) {
        const [p1, p2, cut] = test.args;
        draw(
          h,
          row(
            "parent 1",
            p1.map((c, k) => cell(c, `p1${k === cut - 1 ? " cut" : ""}`)),
          ) +
            row(
              "parent 2",
              p2.map((c, k) => cell(c, `p2${k === cut - 1 ? " cut" : ""}`)),
            ) +
            row(
              "child",
              p1.map(() => cell("·")),
            ),
          "Run your tests, then step through the replay.",
        );
      },
      frame(h, f, { frames, test }) {
        if (!f) return this.reset(h, test);
        const [p1, p2, cut, si, sj] = test.args,
          first = frames.find((x) => x.type === "cross"),
          raw = first ? first.child : [];
        const top =
          row(
            "parent 1",
            p1.map((c, k) => cell(c, `p1${k === cut - 1 ? " cut" : ""}`)),
          ) +
          row(
            "parent 2",
            p2.map((c, k) => cell(c, `p2${k === cut - 1 ? " cut" : ""}`)),
          );
        const count = (arr, c) => arr.filter((x) => x === c).length;
        if (f.type === "swap") {
          return draw(
            h,
            top +
              row(
                "mutant",
                f.tour.map((c, k) => cell(c, k === si || k === sj ? "changed" : "good")),
              ),
            `Swap positions <b>${si}</b> and <b>${sj}</b>.`,
          );
        }
        const cells = f.child.map((c, k) => {
          let cls = k < cut ? "p1" : "p2";
          if (f.type === "scan") {
            if (raw[k] !== c) cls = "good";
            else if (k > f.k && count(f.child, c) > 1) cls = "bad";
            if (k === f.k) cls += " changed";
          } else if (count(f.child, c) > 1) cls = "bad";
          return cell(c, cls);
        });
        const left = f.child.filter((c) => count(f.child, c) > 1);
        const msg =
          f.type === "cross"
            ? `Copy the first <b>${cut}</b> cities from parent 1 and the rest from parent 2.`
            : f.type === "check"
              ? f.ok
                ? "Your validity test says: <b>a valid tour</b>."
                : `Your validity test says: <b>not a tour</b>${left.length ? ` (${[...new Set(left)].join(", ")} repeated)` : ""}.`
              : `Checking position <b>${f.k}</b>: ${raw[f.k] !== f.child[f.k] ? `a repeat, replaced by <b>${f.child[f.k]}</b>` : "fine so far"}.`;
        draw(h, top + row("child", cells), msg);
      },
      caption(f) {
        if (!f) return "";
        return {
          cross: "One-point crossover.",
          check: "Is the raw child a tour?",
          scan: "Repair scan.",
          swap: "Swap mutation.",
        }[f.type];
      },
    };
  }

  N.register({
    id: "l5-tourlab",
    subject: "nic",
    lecture: 5,
    order: 92,
    num: "5.C",
    workshop: true,
    title: "Workshop: code a valid tour",
    blurb: "Write the validity test, the swap and the repair step, and watch your code fix a crossover child.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.codelab(root, life, {
        who: "nic",
        noun: "tour repair",
        entry: "evolve",
        watch: true,
        intro:
          "A tour must visit every city once. Crossover can break that. There are <b>three blanks</b>, marked in orange: the validity test, the swap and the repair.",
        brief:
          "<b>Goal:</b> <code>evolve(p1, p2, cut, i, j)</code> makes a child from the first <code>cut</code> cities of <code>p1</code> and the rest of <code>p2</code>, reports whether that raw child was a valid tour, repairs it, then swaps positions <code>i</code> and <code>j</code>. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs the tests.",
        starter: STARTER,
        solution: SOLUTION,
        hints: [
          "Blank 1: a tour is valid when it holds exactly the same cities as <code>cities</code>. <code>return sorted(tour) == sorted(cities)</code> does it.",
          "Blank 2 is Python's tuple swap: <code>t[i], t[j] = t[j], t[i]</code>.",
          "Blank 3 sits inside the loop, at a position whose city was already seen. Write <code>child[k] = missing.pop(0)</code> in place of the <code>pass</code>.",
        ],
        tests: TESTS,
        scene: scene(),
      });
      root.appendChild(
        predict({
          id: "l5-tourlab-1",
          q: "One-point crossover of two valid tours gives a child that repeats a city. What must be true of the child?",
          opts: [
            "Some other city is missing from it",
            "The cut was at the very start",
            "The two parents were identical",
          ],
          a: 0,
          why: "The child has the same length as a tour, so if one city appears twice, another city has no place. The repair step swaps repeats for exactly the missing cities.",
        }),
      );
      root.appendChild(
        predict({
          id: "l5-tourlab-2",
          q: "After a swap mutation of a valid tour, is the result always a valid tour?",
          opts: [
            "Yes: it only reorders the same cities",
            "No: the swap can repeat a city",
            "Only if i and j are next to each other",
          ],
          a: 0,
          why: "Swapping two positions exchanges two cities and adds or removes nothing, so every city still appears exactly once. That is why swap is a safe mutation for permutations.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A permutation is valid when it holds <b>exactly the same cities</b> as the original set: compare the sorted lists.",
            "<b>Swap mutation</b> only reorders, so it keeps a tour valid.",
            "<b>One-point crossover</b> can repeat cities, so repair: keep the first copy and replace later repeats with the missing cities.",
          ],
          "Mutation by swap is safe, crossover needs a repair step.",
        ),
      );
    },
  });

  L["l5-tourlab"] = {
    sum: "Code the validity test, swap mutation and repair that keep a tour valid.",
    steps: [
      {
        t: "What you will write",
        b: `<p>The lab gives you a working <b>crossover, repair and swap</b> pipeline with <b>three blanks</b>:</p><ol><li>the <b>validity test</b>: does every city appear once?</li><li>the <b>swap</b> of two positions</li><li>the <b>repair</b>: replace a repeat with a missing city</li></ol><p>The picture replays <span class="key">your</span> run row by row.</p>`,
        v: F.flow([
          { t: "Crossover", c: "blue" },
          { t: "Valid?", c: "amber" },
          { t: "Repair", c: "teal" },
          { t: "Swap", c: "violet" },
        ]),
        c: {
          q: "A raw child is C A F D E F. Which city is missing?",
          o: ["B", "A", "F"],
          a: 0,
          why: "The cities are A to F. C, A, F, D and E are all there, and F is there twice, so B has no place.",
        },
      },
      {
        t: "Reading the replay",
        b: `<p>The child row is coloured by where each city came from: <b>blue</b> from parent 1, <b>orange</b> from parent 2. A city shown in <b>red</b> is a repeat. When your repair replaces one, it turns <b>green</b>.</p><p>If a test fails, pick it in the list and step through to find the first row that differs from what you expect.</p>`,
        v: F.compare(
          { title: "Red city", c: "rose", body: "appears more than once in the child" },
          { title: "Green city", c: "teal", body: "your repair put a missing city here" },
        ),
        c: {
          q: "A test fails and the raw child is shown as a valid tour, but it has a repeat. Which blank is most likely wrong?",
          o: ["The validity test", "The swap", "The repair"],
          a: 0,
          why: "The raw check says the child is a tour when it is not, so the validity test accepts something it should reject.",
        },
      },
    ],
    guide: [],
  };
})();
