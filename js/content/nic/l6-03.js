/* l6-03: Lecture 6: 6.3 mutation and crossover on trees. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const sh = (NIC.shared.l6 = NIC.shared.l6 || {});
  const { ga, row, fn, tm, size, depth, nodesOf, randomProgram, mutate, crossover, treeSVG, sx } = sh;

  /* ============ 6.3 Mutation and crossover ============ */
  const FS_V = ["+", "-", "*", "%"],
    TS_V = [() => "X", () => "X", () => Math.round(rnd() * 4) - 2];
  N.register({
    id: "l6-vary",
    lecture: 6,
    order: 3,
    num: "6.3",
    title: "Mutation and crossover on trees",
    blurb: "Click a node to choose where to cut. Mutate with a fresh subtree, or swap subtrees between two parents.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "<b>Subtree mutation:</b> choose a node at random, remove the subtree rooted there and grow a new subtree in its place, respecting the depth limit. <b>Subtree crossover:</b> choose a node in each parent and swap the subtrees to make two children. Choosing a subtree is the same as choosing a node, and since most nodes are near the bottom, the changes are usually small.",
        ),
      );
      const MAXD = 5;
      let A = fn("+", fn("*", tm("X"), tm("X")), fn("-", tm("X"), tm(1))),
        B = fn("%", fn("+", tm(2), tm("X")), fn("*", tm(1), fn("-", tm("X"), tm(2))));
      let selA = null,
        selB = null,
        out = null,
        mode = "mut";
      const card = el(
        `<div class="card"><div class="card-head"><h2>Vary the trees</h2></div><div class="controls" id="c"></div><div class="grid two"><div><h4>Parent A <span class="dim mono" id="sa"></span></h4><div id="ta"></div></div><div><h4 id="hb">Parent B <span class="dim mono" id="sb"></span></h4><div id="tb"></div></div></div><div id="res"></div></div>`,
      );
      root.appendChild(card);
      const bGo = el(`<button class="btn primary">Apply</button>`),
        bPick = el(`<button class="btn">Pick random nodes</button>`),
        bNew = el(`<button class="btn ghost">New parents</button>`);
      qs("#c", card).append(
        N.seg(
          [
            ["mut", "Subtree mutation"],
            ["x", "Subtree crossover"],
          ],
          mode,
          (v) => {
            mode = v;
            out = null;
            draw();
          },
        ),
        bPick,
        bGo,
        bNew,
      );
      const rndTree = () => randomProgram(Math.random, 4, FS_V, TS_V);
      bNew.onclick = () => {
        A = rndTree();
        B = rndTree();
        selA = selB = null;
        out = null;
        draw();
      };
      bPick.onclick = () => {
        selA = randint(0, nodesOf(A).length - 1);
        selB = randint(0, nodesOf(B).length - 1);
        out = null;
        draw();
      };
      bGo.onclick = () => {
        if (mode === "mut") {
          const r = mutate(Math.random, A, MAXD, FS_V, TS_V, selA);
          out = { kind: "mut", tree: r.tree, at: r.at };
        } else {
          const r = crossover(Math.random, A, B, MAXD, selA, selB);
          out = { kind: "x", kids: r.kids, ia: r.ia, ib: r.ib };
        }
        draw();
      };
      function draw() {
        qs("#hb", card).style.display = qs("#tb", card).style.display = mode === "x" ? "" : "none";
        qs("#ta", card).innerHTML = treeSVG(A, { sel: new Set(selA != null ? [selA] : []), clickable: true });
        qs("#tb", card).innerHTML =
          mode === "x" ? treeSVG(B, { sel: new Set(selB != null ? [selB] : []), clickable: true }) : "";
        qs("#sa", card).textContent = `size ${size(A)}, depth ${depth(A)}`;
        qs("#sb", card).textContent = `size ${size(B)}, depth ${depth(B)}`;
        const R = qs("#res", card);
        if (!out) {
          R.innerHTML = `<p class="dim">${mode === "mut" ? "Click a node in the tree to choose the mutation point (or leave it to chance), then press <b>Apply</b>." : "Click a node in each parent (or press <b>Pick random nodes</b>), then press <b>Apply</b>."}</p>`;
        } else if (out.kind === "mut")
          R.innerHTML = `<h4>Mutant <span class="dim mono">size ${size(out.tree)}, depth ${depth(out.tree)}</span></h4>${treeSVG(out.tree, { sel: new Set([out.at]) })}<p class="mono dim">${sx(out.tree)}</p>`;
        else
          R.innerHTML = `<div class="grid two"><div><h4>Child 1 <span class="dim mono">size ${size(out.kids[0])}, depth ${depth(out.kids[0])}</span></h4>${treeSVG(out.kids[0])}</div><div><h4>Child 2 <span class="dim mono">size ${size(out.kids[1])}, depth ${depth(out.kids[1])}</span></h4>${treeSVG(out.kids[1])}</div></div><p class="dim">Sizes: ${size(A)} + ${size(B)} = ${size(A) + size(B)} before, ${size(out.kids[0])} + ${size(out.kids[1])} = ${size(out.kids[0]) + size(out.kids[1])} after. Crossover only moves nodes between the trees.</p>`;
        qsa("[data-id]", card).forEach((g) =>
          g.addEventListener("click", () => {
            const which = g.closest("#ta") ? "A" : g.closest("#tb") ? "B" : null;
            if (!which) return;
            if (which === "A") selA = +g.dataset.id;
            else selB = +g.dataset.id;
            out = null;
            draw();
          }),
        );
      }
      draw();
      root.appendChild(
        predict({
          id: "l6-vary-1",
          q: "A full binary tree has 15 nodes (8 of them leaves). You pick a node uniformly at random for mutation. How likely is it a leaf?",
          opts: ["About 1 in 8", "About half", "About 90%"],
          a: 1,
          why: "8 of the 15 nodes are leaves: 8/15 ≈ 53%. That is why subtree mutation is biased towards nodes with high depth, and most mutations change only a small piece.",
        }),
      );
      root.appendChild(
        predict({
          id: "l6-vary-2",
          q: "Subtree crossover swaps a 3-node subtree from a parent of size 7 with a 5-node subtree from a parent of size 11. What are the children's sizes?",
          opts: ["9 and 9", "7 and 11", "10 and 8"],
          a: 0,
          why: "Child 1 is 7 − 3 + 5 = 9. Child 2 is 11 − 5 + 3 = 9. Total nodes are conserved (18 before, 18 after), but each child's size changes.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Subtree mutation: choose a node, delete its subtree, grow a new one (within the depth limit).",
            "Subtree crossover: pick a node in each parent and swap the subtrees to make two children.",
            "Picking a node uniformly favours deep nodes, since most nodes are near the leaves.",
          ],
          "Mutation and crossover just cut and paste branches.",
        ),
      );
    },
  });

  L["l6-vary"] = {
    sum: "GP's operators cut and paste <b>subtrees</b>. They are the same ideas as before, in tree form.",
    steps: [
      {
        t: "Subtree mutation",
        b: `<p>Choose a node at random. <b>Remove</b> the subtree rooted there. <b>Generate</b> a new subtree in its place, following the usual depth rules. The new subtree may be a single terminal or a whole tree down to the depth limit.</p>`,
        v: (box) => {
          const t = fn("+", fn("*", tm("X"), tm("X")), fn("-", tm("X"), tm(1)));
          box.innerHTML =
            `<p class="dim" style="text-align:center">Pick the “−” node…</p>` +
            treeSVG(t, { sel: new Set([4]) }) +
            `<p class="mono dim" style="text-align:center">(+ (* X X) <b>(- X 1)</b>) → (+ (* X X) <b>(+ X 1)</b>)</p>`;
        },
        c: {
          q: "In subtree mutation, what replaces the chosen subtree?",
          o: [
            "A newly grown random subtree",
            "A copy of a subtree from another parent",
            "Nothing: the node is deleted",
          ],
          a: 0,
          why: "Crossover would take it from a second parent. Mutation grows a fresh one.",
        },
      },
      {
        t: "Which node?",
        b: `<p>Choosing a subtree is the same as choosing a node. In a bushy tree most nodes are near the bottom, so a uniformly random choice is <b>biased towards high-depth nodes</b>. In a full binary tree of 15 nodes, 8 are leaves.</p>`,
        v:
          F.bars(
            [
              ["leaves", 8, "teal"],
              ["internal nodes", 7, "blue"],
            ],
            { max: 15 },
          ) + `<p class="dim">Full binary tree of 15 nodes.</p>`,
        c: {
          q: "A random node of a full binary tree of 15 nodes is a leaf with probability about…",
          o: ["1 in 15", "Half", "Nearly 100%"],
          a: 1,
          why: "8 of 15 nodes are leaves, about 53%.",
        },
      },
      {
        t: "Subtree crossover",
        b: `<p>Pick a crossover point (a node) in each parent and <b>swap</b> the two subtrees. That gives two children. The nodes are conserved: they just move between the trees.</p>`,
        v:
          row("Parent A", `<span class="mono">(+ (* <b style="color:var(--violet)">X X</b>) (- X 1))</span>`) +
          row("Parent B", `<span class="mono">(% (+ 2 X) <b style="color:var(--violet)">(- X 2)</b>)</span>`) +
          row("Child 1", `<span class="mono">(+ (* <b style="color:var(--violet)">(- X 2)</b>) (- X 1))</span>`) +
          row("Child 2", `<span class="mono">(% (+ 2 X) <b style="color:var(--violet)">X X</b>)</span>`),
        c: {
          q: "How many children does one subtree crossover produce?",
          o: ["Two", "One", "Three"],
          a: 0,
          why: "Each parent receives the other's subtree.",
        },
      },
      {
        t: "Sizes can change",
        b: `<p>Parents of size 7 and 11 swapping subtrees of size 3 and 5 give children of size 7 − 3 + 5 = <b>9</b> and 11 − 5 + 3 = <b>9</b>. Trees may also grow deeper than either parent, so real GP systems limit the depth of children.</p>`,
        v: row("parents", ga([7, 11])) + row("swap", ga(["−3 +5", "−5 +3"])) + row("children", ga([9, 9], "good")),
        c: {
          q: "Parents of size 6 and 10 swap subtrees of size 2 and 4. The children have sizes…",
          o: ["8 and 8", "6 and 10", "4 and 12"],
          a: 0,
          why: "6 − 2 + 4 = 8 and 10 − 4 + 2 = 8.",
        },
      },
    ],
    guide: [
      "Click different nodes in the tree and press <b>Apply</b>.",
      "Switch to <b>Subtree crossover</b> and choose a node in each parent.",
      "Press <b>New parents</b> and compare sizes before and after.",
      "Answer the questions after the demo.",
    ],
  };
})();
