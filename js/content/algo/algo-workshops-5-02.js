(function () {
  const partScope = (NIC.shared.algoWorkshops5 = NIC.shared.algoWorkshops5 || {});
  const { SOLUTION, STARTER, T_COL, T_NINE, T_SQ, T_TRI, refHull, scene } = partScope;
  const N = NIC,
    { predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  N.register({
    id: "a5-code",
    subject: "algo",
    lecture: 5,
    order: 90,
    num: "5.C",
    workshop: true,
    title: "Workshop: code the hull",
    blurb: "Write the turn test, find the pivot, pop the dents. Watch your rubber band wrap the points.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.codelab(root, life, {
        who: "byte",
        noun: "convex hull",
        entry: "convex_hull",
        watch: true,
        intro:
          "You've seen the rubber band. Now build it. There are <b>three blanks</b>, marked in orange: the turn test, the pivot and the pop rule.",
        brief:
          "<b>Goal:</b> return the hull corners as <code>[x, y]</code> points, anticlockwise, starting at the lowest point. <code>y</code> points <b>up</b>, like a graph. Points that only sit on an edge (collinear) are <b>not</b> corners. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs the tests.",
        starter: STARTER,
        solution: SOLUTION,
        hints: [
          "Blank 1 is the cross product from the lecture, returned from <code>orient</code>: <code>(a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])</code>. Positive means a left turn.",
          "Blank 2 is an <code>if</code> with two parts joined by <code>or</code>: <code>q[1] &lt; pivot[1]</code>, or the same <code>y</code> (<code>==</code>) and a smaller <code>x</code>. Then set <code>pivot = q</code>.",
          "Blank 3: a right turn gives a negative <code>t</code> and a straight line gives <code>0</code>. Both mean pop, so set <code>pop = True</code> when <code>t</code> is at most 0.",
        ],
        tests: [
          {
            name: "A triangle",
            desc: "Three points in a jumbled order. All three are corners.",
            args: [T_TRI],
            expect: refHull(T_TRI),
            hint: "If this fails, check the sign of <code>orient</code>: a left turn must be positive.",
          },
          {
            name: "A square with a point inside",
            desc: "The centre point must be popped.",
            args: [T_SQ],
            expect: refHull(T_SQ),
            hint: "The first point in the list is not the pivot here. Did your pivot loop find the lowest, leftmost point?",
          },
          {
            name: "Points along the edges",
            desc: "Some points sit in the middle of an edge. They are not corners.",
            args: [T_COL],
            expect: refHull(T_COL),
            hint: "A straight line gives 0, and 0 is not a left turn. Pop on <code>t &lt;= 0</code>, not <code>t &lt; 0</code>.",
          },
          {
            name: "Nine scattered points",
            desc: "A small fixed set with a mixture of corners and inside points.",
            args: [T_NINE],
            expect: refHull(T_NINE),
            hint: "Step through the replay: the first turn that differs from what you expect shows which blank is wrong.",
          },
        ],
        scene: scene(),
      });
      root.appendChild(
        predict({
          id: "a5-code-1",
          q: "After sorting, the scan over n points takes only about n steps of stack work. Why?",
          opts: [
            "Each point is pushed once and popped at most once",
            "The stack never holds more than three points at a time",
            "Popped points are pushed back and rechecked later",
          ],
          a: 0,
          why: "A point goes onto the stack once and can leave it only once, so the pushes and pops together are at most 2n. The sort is what costs O(n log n).",
        }),
      );
      root.appendChild(
        predict({
          id: "a5-code-2",
          q: "Your code picks the lowest point as the pivot. Why is that point certain to be a corner of the hull?",
          opts: [
            "Nothing is lower, so the band must touch it",
            "It is always nearest to the middle of the set",
            "Every other point lies to the right of it",
          ],
          a: 0,
          why: "A band stretched around all the points has to reach the lowest one, because no other point is further down. Being a corner is about being extreme in some direction, not about being central.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "The <b>turn test</b> is one cross product: positive is a left turn, negative a right turn, and 0 is a straight line.",
            "The <b>lowest point</b> (leftmost if tied) is always on the hull, so it is a safe place to start.",
            "<b>Pop while the turn is not a left turn</b>, then push. A straight line pops too, so edge points are not corners.",
            "Sorting costs <b>O(n log n)</b> and the stack scan only O(n).",
          ],
          "Sort by angle, then pop every point that does not keep turning left.",
        ),
      );
    },
  });

  L["a5-code"] = {
    sum: "Write the turn test, the pivot and the pop rule, and watch your own Graham scan wrap the points.",
    steps: [
      {
        t: "What you will write",
        b: `<p>The lab gives you a working Graham scan with <b>three blanks</b>:</p><ol><li>the <b>turn test</b> (a cross product)</li><li>the <b>pivot</b> (the lowest point)</li><li>the <b>pop rule</b> (pop unless the turn is left)</li></ol><p>The picture replays <span class="key">your</span> run: a green rubber band that grows, with each turn shown as left or right.</p>`,
        v: F.flow([
          { t: "Turn test", c: "amber" },
          { t: "Pivot", c: "blue" },
          { t: "Pop rule", c: "teal" },
        ]),
        c: {
          q: "Walking o → a → b, your orient function returns a negative number. Which way does the path turn?",
          o: ["To the right", "To the left", "It goes straight on"],
          a: 0,
          why: "Positive means a left turn, negative a right turn, and zero a straight line. A right turn is the signal that the middle point dents the hull.",
        },
      },
      {
        t: "Reading the replay",
        b: `<p>Each step tests the last two stack points and the next point. The dashed line is green for a <b>left</b> turn, red for a <b>right</b> turn and orange for <b>straight on</b>.</p><p>If a test fails, pick it in the list and step through. The caption names the first turn where your code disagrees with the true cross product.</p>`,
        v: F.compare(
          { title: "Left turn", c: "teal", body: "keep the middle point and push the new one" },
          { title: "Right or straight", c: "rose", body: "pop the middle point and test again" },
        ),
        c: {
          q: "Three points lie on one straight edge and your code pops when the turn value is 0 or less. What happens to the middle one?",
          o: [
            "It is dropped, as only corners stay",
            "It stays, because it lies on the hull edge",
            "The scan crashes on the zero",
          ],
          a: 0,
          why: "A straight line gives 0, which is not a left turn, so the middle point is popped. The hull keeps corners only.",
        },
      },
    ],
    guide: ["Fill the three blanks and pass the tests in the code lab."],
  };
})();
