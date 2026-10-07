/* l6-workshops-03: Lecture 6 code lab 6.C, score a program tree in Python (evaluate it, sum its absolute errors). */
(function () {
  const N = NIC,
    { qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const sh = (NIC.shared.l6 = NIC.shared.l6 || {});
  const { fn, tm, treeSVG, FN } = sh;

  // A tree is a nested list: ["+", left, right] for a function, "X" or a number for a terminal.
  const toNode = (t) => (Array.isArray(t) ? fn(t[0], toNode(t[1]), toNode(t[2])) : tm(t));
  const ref = (t, x) => (Array.isArray(t) ? FN[t[0]].f(ref(t[1], x), ref(t[2], x)) : t === "X" ? x : t);
  /** value at every node of the drawing, in drawing (pre-order) order */
  const vals = (t, x) => {
    const out = [];
    (function go(n) {
      const id = out.length;
      out.push(0);
      out[id] = Array.isArray(n) ? FN[n[0]].f(go(n[1]), go(n[2])) : n === "X" ? x : n;
      return out[id];
    })(t);
    return out;
  };
  const fmt = (v) => (typeof v !== "number" ? String(v) : Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));
  const GOAL = [-1, -0.5, 0, 0.5, 1].map((x) => [x, x * x + x + 1]);

  const STARTER = `def sum_abs_error(tree, data):
    total = 0
    for x, y in data:
        got = evaluate(tree, x)
        # YOUR CODE: add the absolute difference between got and y to total
        pass
        trace({"x": x, "got": got, "want": y, "total": total})
    return total


def evaluate(node, x):
    # A function node is a list [op, left, right]. A terminal is "X" or a number.
    if not isinstance(node, list):
        # YOUR CODE: return x when node is "X", otherwise return the number itself
        return 0
    op, left, right = node
    a = evaluate(left, x)
    b = evaluate(right, x)
    if op == "+":
        return a + b
    if op == "-":
        return a - b
    if op == "*":
        return a * b
    # YOUR CODE: protected division: return 1 when b is 0, otherwise a / b
    return 0`;
  const SOLUTION = `def sum_abs_error(tree, data):
    total = 0
    for x, y in data:
        got = evaluate(tree, x)
        total += abs(got - y)
        trace({"x": x, "got": got, "want": y, "total": total})
    return total


def evaluate(node, x):
    # A function node is a list [op, left, right]. A terminal is "X" or a number.
    if not isinstance(node, list):
        if node == "X":
            return x
        return node
    op, left, right = node
    a = evaluate(left, x)
    b = evaluate(right, x)
    if op == "+":
        return a + b
    if op == "-":
        return a - b
    if op == "*":
        return a * b
    if b == 0:
        return 1
    return a / b`;

  function scene() {
    function draw(h, f, frames, i) {
      const rows = frames.slice(0, i + 1).map((r, k) => {
        const real = ref(h.tree, r.x),
          bad = Math.abs(real - r.got) > 1e-9;
        return `<tr class="${k === i ? "cur" : ""} ${bad ? "bad" : ""}"><td>${fmt(r.x)}</td><td>${fmt(r.got)}</td><td>${fmt(r.want)}</td><td>${fmt(Math.abs(r.got - r.want))}</td></tr>`;
      });
      h.tree$.innerHTML = treeSVG(toNode(h.tree), { vals: vals(h.tree, f.x) });
      h.tbl.innerHTML = `<tr><th>x</th><th>your output</th><th>data</th><th>|error|</th></tr>${rows.join("")}`;
      h.sum.innerHTML = `Running total: <b>${fmt(f.total)}</b>`;
    }
    return {
      build(stage, test) {
        stage.innerHTML = `<div class="nw6-lab"><div class="nw6-lab-tree" data-t></div><div><table class="t nw6-pts" data-p></table><p class="nw6-total" data-s></p></div></div>`;
        const h = {
          tree: test.view.tree,
          tree$: qs("[data-t]", stage),
          tbl: qs("[data-p]", stage),
          sum: qs("[data-s]", stage),
        };
        this.reset(h);
        return h;
      },
      reset(h) {
        h.tree$.innerHTML = treeSVG(toNode(h.tree));
        h.tbl.innerHTML = `<tr><th>x</th><th>your output</th><th>data</th><th>|error|</th></tr>`;
        h.sum.innerHTML = `Press play to score the tree one data point at a time.`;
      },
      frame(h, f, { i, frames }) {
        if (!f) return this.reset(h);
        draw(h, f, frames, i);
      },
      caption(f) {
        if (!f) return "";
        return `At x = ${fmt(f.x)} your code gave <b>${fmt(f.got)}</b>; the data say <b>${fmt(f.want)}</b>. Total so far <b>${fmt(f.total)}</b>.`;
      },
    };
  }

  const tests = [
    {
      name: "x + 1 against the data",
      desc: "The lecture's best first guess, scored on five points of x² + x + 1. The error is x² each time.",
      tree: ["+", "X", 1],
      data: GOAL,
      expect: 2.5,
    },
    {
      name: "One short everywhere",
      desc: "x² + x against the data: every point is off by exactly 1, so five points give 5.",
      tree: ["+", ["*", "X", "X"], "X"],
      data: GOAL,
      expect: 5,
      hint: "If this fails while the first test passes, check how you return the number for a terminal and how * is handled.",
    },
    {
      name: "Protected division",
      desc: "(2 × x) % x gives 2, except at x = 0 where the protected answer is 1.",
      tree: ["%", ["*", 2, "X"], "X"],
      data: [
        [1, 2],
        [2, 3],
        [0, 1],
      ],
      expect: 1,
      hint: "At x = 0 you divide 0 by 0. Test <code>b == 0</code> before dividing, and return 1.",
    },
    {
      name: "A lone terminal",
      desc: "The tree is just the number 2, so the answer is |2 − 1| + |2 − 3|.",
      tree: 2,
      data: [
        [0, 1],
        [1, 3],
      ],
      expect: 2,
      hint: "A terminal is not a list, so evaluate must hand back the number itself.",
    },
  ].map((t) => ({ name: t.name, desc: t.desc, args: [t.tree, t.data], expect: t.expect, hint: t.hint, view: t }));

  N.register({
    id: "l6-wcode",
    lecture: 6,
    order: 92,
    num: "6.C",
    workshop: true,
    title: "Workshop: score a program tree",
    blurb:
      "Three short blanks: evaluate a tree in Python, protect the division, and add up its absolute error against data.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.codelab(root, life, {
        who: "sprout",
        noun: "tree scoring",
        entry: "sum_abs_error",
        watch: true,
        intro:
          "In GP the fitness of a program is found by <b>running</b> it. You have used trees in the sandbox. Now write the scorer: <b>three blanks</b>, marked in orange.",
        brief:
          '<b>Goal:</b> return the sum of absolute errors of <code>tree</code> over <code>data</code>, a list of <code>[x, y]</code> pairs. A tree is a nested list <code>["+", left, right]</code> (operators <code>+ - * %</code>); a terminal is <code>"X"</code> or a number. <code>%</code> is <b>protected</b> division. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs the tests.',
        starter: STARTER,
        solution: SOLUTION,
        hints: [
          'Blank 1: a terminal is the text <code>"X"</code> (give back <code>x</code>) or a number (give back <code>node</code> as it is). Use <code>if node == "X":</code>.',
          "Blank 2: protected division. <code>if b == 0:</code> return 1, otherwise <code>return a / b</code>.",
          "Blank 3: the error of one point is <code>abs(got - y)</code>. Add it to the running total with <code>total += …</code>.",
        ],
        tests,
        scene: scene(),
      });
      root.appendChild(
        predict({
          id: "l6-wcode-1",
          q: "Your evaluate function calls itself on the left and right children before it applies the operator. Why that order?",
          opts: [
            "The operator needs the children's values first, so they must be evaluated before it",
            "Python only allows a function to call itself at the start",
            "It makes the tree shallower",
          ],
          a: 0,
          why: "A node's value depends on its children's values. Evaluating them first (down to the leaves) is exactly how values flow up the tree.",
        }),
      );
      root.appendChild(
        predict({
          id: "l6-wcode-2",
          q: "A tree outputs 4 and 6 where the data say 5 and 5. Why does your scorer take the absolute value of each difference?",
          opts: [
            "Without it, −1 and +1 would cancel and a wrong tree would score 0",
            "It makes the error computation faster",
            "It stops the tree getting too deep",
          ],
          a: 0,
          why: "With signs, (4 − 5) + (6 − 5) = 0, which looks perfect. With absolute values the total is 1 + 1 = 2, so errors can never hide each other.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Evaluating a tree is <b>recursion</b>: a terminal returns its value, a function evaluates its children first and then applies its operator.",
            "<b>Protected division</b> returns a safe value (here 1) when the divisor is 0, so a random program never crashes the run.",
            "Fitness is the <b>sum of absolute errors</b> over the data. 0 means a perfect fit; absolute values stop errors cancelling.",
          ],
          "Run the tree on every data point and add up how far off it is.",
        ),
      );
    },
  });

  L["l6-wcode"] = {
    sum: "Write the scorer at the heart of GP: evaluate a program tree and add up its absolute errors.",
    steps: [
      {
        t: "A tree as nested lists",
        b: `<p>In Python a program tree is a <b>nested list</b>: <code>["+", "X", 1]</code> is <i>X + 1</i>. A terminal is <code>"X"</code> or a number; anything that is a list is a function with an operator and two children.</p><p>You fill in <b>three blanks</b>: what a terminal returns, protected division, and adding up the error. The rest is written for you.</p>`,
        v: F.flow([
          { t: "Terminal: X or a number", c: "teal" },
          { t: "Function: [op, left, right]", c: "blue" },
          { t: "Evaluate children first", c: "amber" },
        ]),
        c: {
          q: "How does the code tell a function node from a terminal?",
          o: [
            "A function is a list; a terminal is not",
            "A terminal is always the text X",
            "A function always has the operator +",
          ],
          a: 0,
          why: "isinstance(node, list) is true for a function node. A terminal is the string X or a plain number.",
        },
      },
      {
        t: "Fitness is a sum of errors",
        b: `<p>To score a tree you run it on each data point, take the <b>absolute</b> difference from the wanted value and add them all up. Lower is better, and <b>0 is a perfect fit</b>.</p><p>Under your code, the replay draws the tree with the value at every node for each x, and keeps your running total.</p>`,
        v: F.flow(["Run the tree at x", "|output − data|", "Add to the total", "Next x"], { loop: true }),
        c: {
          q: "A tree has a sum of absolute errors of 0 on the data. What does that tell you?",
          o: [
            "It matches every data point exactly",
            "It is the shortest possible program",
            "It was only run on one input",
          ],
          a: 0,
          why: "Each |output − data| is at least 0, and they add to 0 only if every one is exactly 0.",
        },
      },
    ],
    guide: ["Fill the three blanks and pass the tests in the code lab."],
  };
})();
