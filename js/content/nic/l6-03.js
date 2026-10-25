/* l6-03: Lecture 6: 6.3 mutation and crossover on trees. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd } = N;
  const L = N.LESSONS;
  const sh = (NIC.shared.l6 = NIC.shared.l6 || {});
  const { row, fn, tm, size, depth, nodesOf, randomProgram, mutate, crossover, treeSVG, sx } = sh;

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
        b: `<p>Mutation begins by picking a node at random. That sounds fair, but a bushy tree is mostly <b>leaves</b> at the bottom, so most picks land on a small piece near the bottom and the change is small.</p><p>For example, a full tree of 15 nodes has 8 leaves and only 7 inner nodes, so a random pick is a leaf a little over half the time. Press the buttons below and watch the tally.</p><details class="math-more"><summary>Show the maths</summary><p>A full binary tree with $d$ levels has $2^d-1$ nodes, of which $2^{d-1}$ are leaves. A uniform pick is a leaf with probability</p><p>$$\\frac{2^{d-1}}{2^d-1}$$</p><p>which is just over $\\tfrac12$. For $d=4$ that is $8/15\\approx 53\\%$. So a uniformly random node is biased towards high-depth nodes.</p></details>`,
        v: (box) => sh.fullTree(box),
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
        b: `<p>A swap moves nodes from one tree to the other. Each child <b>loses the piece that was cut out and gains the other parent's piece</b>, so it grows if the piece it receives is bigger than the one it gave away.</p><p>For example, parents of 7 and 11 nodes swap pieces of 3 and 5 nodes. The first child gives away 3 and gets 5, so it grows to 9. The second gives away 5 and gets 3, so it shrinks to 9. Flip between before and after below. Children can also end up deeper than either parent, so real GP systems limit the depth of children.</p><details class="math-more"><summary>Show the maths</summary><p>Child 1 has $7-3+5=9$ nodes and child 2 has $11-5+3=9$. The total is conserved: $7+11=9+9=18$.</p></details>`,
        v: (box) => sh.swapSizes(box),
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

  /* ============ small pictures for 6.3 and 6.4 (the shared mini-figures of lectures 7 and 8 continue below) ============ */
  const nf = (NIC.shared.nicFig = NIC.shared.nicFig || {});
  const { tint, r2, wrap, btn } = nf;
  const COLS = ["teal", "blue", "violet", "amber", "rose"];

  /** A full binary tree of 15 nodes: pick random nodes and count leaves. */
  sh.fullTree = (box) => {
    const out = wrap(box),
      P = [];
    for (let lv = 0; lv < 4; lv++)
      for (let k = 0; k < 2 ** lv; k++) P.push([(400 / 2 ** lv) * (k + 0.5), 22 + lv * 44]);
    let pick = -1,
      tally = [0, 0];
    const draw = () => {
      qs("[data-g]", out).innerHTML =
        `<svg class="fig" viewBox="0 0 400 170" style="max-height:190px" role="img" aria-label="A full binary tree of 15 nodes: 8 leaves along the bottom and 7 internal nodes above them.">${P.map((p, i) => (i ? `<line x1="${P[(i - 1) >> 1][0]}" y1="${P[(i - 1) >> 1][1]}" x2="${p[0]}" y2="${p[1]}" stroke="var(--line-2)" stroke-width="2"/>` : "")).join("")}${P.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${pick === i ? 15 : 11}" fill="${tint(i >= 7 ? "teal" : "blue", pick === i ? 60 : 28)}" stroke="var(--${i >= 7 ? "teal" : "blue"})" stroke-width="${pick === i ? 4 : 2.5}"/>`).join("")}</svg><p style="text-align:center;margin:4px 0">Green leaves: 8. Blue inner nodes: 7. ${tally[0] + tally[1] ? `Picked so far: <b>${tally[0]}</b> leaves, <b>${tally[1]}</b> inner nodes.` : "Pick nodes at random and see what you hit."}</p>`;
    };
    out.innerHTML = `<div data-g></div><div class="controls" data-b style="justify-content:center"></div>`;
    const go = (n) => {
      for (let j = 0; j < n; j++) {
        pick = Math.floor(rnd() * 15);
        tally[pick >= 7 ? 0 : 1]++;
      }
      draw();
    };
    qs("[data-b]", out).append(
      btn("Pick a node", () => go(1), "primary"),
      btn("Pick 30", () => go(30)),
      btn(
        "Reset",
        () => {
          pick = -1;
          tally = [0, 0];
          draw();
        },
        "ghost",
      ),
    );
    draw();
  };

  /** Crossover swaps a piece of each parent: the pieces differ in size, so the children do too. */
  sh.swapSizes = (box) => {
    const out = wrap(box);
    const blocks = (n, c) =>
      Array.from(
        { length: n },
        () =>
          `<span style="width:20px;height:20px;border-radius:5px;background:${tint(c, 40)};border:2px solid var(--${c})"></span>`,
      ).join("");
    const line = (lab, a, ca, b, cb) =>
      `<div style="display:flex;align-items:center;gap:10px;margin:8px 0"><b style="width:76px;font-size:13px">${lab}</b><span style="display:flex;gap:3px;flex-wrap:wrap">${blocks(a, ca)}<span style="width:8px"></span>${blocks(b, cb)}</span><span class="dim" style="font-size:13px;white-space:nowrap">size ${a + b}</span></div>`;
    const draw = (v) => {
      qs("[data-g]", out).innerHTML =
        (v === "before"
          ? line("Parent A", 4, "blue", 3, "amber") + line("Parent B", 6, "teal", 5, "violet")
          : line("Child 1", 4, "blue", 5, "violet") + line("Child 2", 6, "teal", 3, "amber")) +
        `<p class="dim" style="margin:6px 0 0">${v === "before" ? "The orange piece (3 nodes) and the purple piece (5 nodes) are the subtrees we cut out." : "Swap the pieces. Each child lost one piece and gained the other, so each is 9 nodes. 18 nodes before, 18 after."}</p>`;
    };
    out.innerHTML = `<div class="controls" data-c></div><div data-g></div>`;
    qs("[data-c]", out).append(
      N.seg(
        [
          ["before", "Before the swap"],
          ["after", "After the swap"],
        ],
        "before",
        draw,
      ),
    );
    draw("before");
  };

  /** Regression error: the shaded gap between the target curve and a candidate is its error. cands: [{n, f, err}] */
  sh.errFig = (box, target, cands) => {
    const out = wrap(box),
      xs = Array.from({ length: 41 }, (_, i) => -1 + i * 0.05);
    const X = (x) => 40 + ((x + 1) / 2) * 340,
      Y = (v) => 180 - (v / 3.3) * 160;
    const draw = (k) => {
      const c = cands[k],
        pts = (f) => xs.map((x) => `${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`);
      qs("[data-g]", out).innerHTML =
        `<svg class="fig" viewBox="0 0 400 205" style="max-width:520px;margin:auto" role="img" aria-label="The target curve and the candidate ${c.n} with the gap between them shaded. The area of the gap is ${r2(c.err)}.">${[-1, 0, 1].map((x) => `<line x1="${X(x)}" y1="20" x2="${X(x)}" y2="180" stroke="var(--line)"/><text x="${X(x)}" y="198" class="fig-sub">${x}</text>`).join("")}<polygon points="${[...pts(target), ...pts(c.f).reverse()].join(" ")}" fill="var(--rose)" opacity=".28"/><polyline points="${pts(target).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="3" stroke-dasharray="7 5"/><polyline points="${pts(c.f).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3.5"/></svg><p style="text-align:center;margin:2px 0 0"><span style="color:var(--teal-ink)"><b>- - -</b> target</span> &nbsp; <span style="color:var(--blue-ink)"><b>——</b> candidate ${c.n}</span> &nbsp; <b style="color:var(--rose-ink)">shaded gap = error ${r2(c.err)}</b></p>`;
    };
    out.innerHTML = `<div class="controls" data-c></div><div data-g></div>`;
    qs("[data-c]", out).append(
      N.seg(
        cands.map((c, i) => [i, c.n]),
        0,
        (v) => draw(+v),
      ),
    );
    draw(0);
  };

  /** Road cards: pheromone and distance side by side, the weight they give, then a draw. items: [{n, tau, d}] */
  nf.weights = (box, items) => {
    const mt = Math.max(...items.map((i) => i.tau)),
      md = Math.max(...items.map((i) => i.d)),
      out = wrap(box);
    const bar = (v, max, c) =>
      `<span style="display:block;height:12px;width:${Math.max(4, (v / max) * 100)}%;background:var(--${c});border-radius:6px"></span>`;
    out.innerHTML = `<div style="display:grid;grid-template-columns:auto 1fr 1fr auto;gap:6px 10px;align-items:center;font-size:13px"><span></span><b>pheromone</b><b>distance</b><b>weight</b>${items
      .map(
        (it) =>
          `<b>${it.n}</b><span>${bar(it.tau, mt, "blue")}<small>${it.tau}</small></span><span>${bar(it.d, md, "amber")}<small>${it.d}</small></span><b style="color:var(--teal-ink)">${r2(it.tau / it.d)}</b>`,
      )
      .join(
        "",
      )}</div><p class="dim" style="margin:8px 0 10px;text-align:center">More pheromone raises the weight, a longer road lowers it.</p>`;
    nf.spin(
      out,
      items.map((it, i) => ({ n: it.n, w: it.tau / it.d, c: ["blue", "teal", "amber", "violet"][i] })),
      { bare: true },
    );
  };

  /** The pull of a road is 1/d; the exponent beta stretches the gap. */
  nf.pull = (box) => {
    const out = wrap(box),
      D = [2, 4, 5, 8, 10];
    let beta = 1;
    const sl = N.slider("How strongly distance counts", 1, 3, 1, beta);
    const draw = () => {
      const w = D.map((d) => (1 / d) ** beta),
        s = w.reduce((a, b) => a + b, 0);
      qs("[data-g]", out).innerHTML = `<div class="fig-bars">${D.map(
        (d, i) =>
          `<div class="fb-row"><span class="fb-l">${d} km road</span><span class="fb-track"><span class="fb-fill" style="--w:${w[i] / s / (w[0] / s)};background:var(--${i ? "blue" : "teal"})"></span></span><span class="fb-v">${Math.round((w[i] / s) * 100)}%</span></div>`,
      ).join(
        "",
      )}</div><p style="text-align:center;margin:8px 0 0">Half the distance gives <b>${2 ** beta} times</b> the pull. Share of the draw if the pheromone is equal.</p>`;
    };
    out.innerHTML = `<div class="controls" data-c></div><div data-g></div>`;
    sl.onInput((v) => ((beta = v), draw()));
    qs("[data-c]", out).append(sl);
    draw();
  };

  /** Tap a town to put it on the tabu list; the other towns' shares grow. */
  nf.tabuScores = (box) => {
    const out = wrap(box),
      T = [
        ["Pell", 6, "teal"],
        ["Rudd", 3, "blue"],
        ["Sowe", 4, "rose"],
        ["Kell", 1, "violet"],
      ],
      off = new Set(["Sowe"]);
    const draw = () => {
      const tot = T.reduce((s, [n, v]) => s + (off.has(n) ? 0 : v), 0);
      qs("[data-g]", out).innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">${T.map(
        ([n, v, c]) =>
          `<button class="btn small ${off.has(n) ? "ghost" : ""}" data-t="${n}" aria-pressed="${off.has(n)}" style="flex:1 1 70px;display:grid;gap:2px;padding:8px 4px;${off.has(n) ? "opacity:.55" : `background:${tint(c, 22)}`}"><b>${n}${off.has(n) ? " (tabu)" : ""}</b><span>score ${off.has(n) ? 0 : v}</span><span style="font-weight:900">${off.has(n) ? "0%" : Math.round((v / tot) * 100) + "%"}</span></button>`,
      ).join(
        "",
      )}</div><p class="dim" style="text-align:center;margin:8px 0 0">Tap a town to put it on the tabu list, or take it off. Total of the scores left: ${tot}.</p>`;
      qsa("[data-t]", out).forEach(
        (b) =>
          (b.onclick = () => {
            const k = b.dataset.t;
            if (off.has(k)) off.delete(k);
            else if (off.size < T.length - 1) off.add(k);
            draw();
          }),
      );
    };
    out.innerHTML = `<div data-g></div>`;
    draw();
  };

  /** Ring of six towns: tap an allowed town to move the ant; visited towns go on the tabu list. */
  nf.walk = (box) => {
    const out = wrap(box),
      names = "ABCDEF".split(""),
      P = names.map((_, i) => [
        200 + 130 * Math.cos((i / 6) * 6.2832 - 1.5708),
        90 + 62 * Math.sin((i / 6) * 6.2832 - 1.5708),
      ]);
    let path = [0, 1, 2];
    const draw = () => {
      const left = names.map((_, i) => i).filter((i) => !path.includes(i)),
        cur = path[path.length - 1];
      qs("[data-g]", out).innerHTML =
        `<svg class="fig" viewBox="0 0 400 180" style="max-height:200px" role="img" aria-label="Six towns. The ant has visited ${path.map((i) => names[i]).join(", ")}.">${path
          .slice(1)
          .map(
            (p, i) =>
              `<line x1="${P[path[i]][0]}" y1="${P[path[i]][1]}" x2="${P[p][0]}" y2="${P[p][1]}" stroke="var(--teal)" stroke-width="5" stroke-linecap="round"/>`,
          )
          .join("")}${names
          .map((n, i) => {
            const v = path.includes(i),
              ok = left.includes(i);
            return `<g ${ok ? `data-go="${i}" style="cursor:pointer"` : ""}><circle cx="${P[i][0]}" cy="${P[i][1]}" r="20" fill="${i === cur ? tint("violet", 40) : v ? tint("teal", 30) : "var(--panel)"}" stroke="${ok ? "var(--blue)" : v ? "var(--teal)" : "var(--line-2)"}" stroke-width="${ok ? 4 : 3}"/><text x="${P[i][0]}" y="${P[i][1] + 5}" class="fig-n">${n}</text></g>`;
          })
          .join(
            "",
          )}</svg><p style="text-align:center;margin:4px 0"><b>Tabu list</b> (visited): ${path.map((i) => `<span class="pill teal">${names[i]}</span>`).join(" ")}</p><p style="text-align:center;margin:4px 0"><b>Allowed</b>: ${left.length ? left.map((i) => `<span class="pill blue">${names[i]}</span>`).join(" ") : "none left, so the tour ends"}</p>`;
      qsa("[data-go]", out).forEach(
        (g) =>
          (g.onclick = () => {
            path.push(+g.dataset.go);
            draw();
          }),
      );
    };
    out.innerHTML = `<div data-g></div><div class="controls" data-b style="justify-content:center"></div>`;
    qs("[data-b]", out).append(
      btn(
        "Start again",
        () => {
          path = [0, 1, 2];
          draw();
        },
        "ghost",
      ),
    );
    draw();
  };

  /** Due dates on a ruler: the sooner a job is due, the bigger its pull. jobs: [{k, due}] */
  nf.dueRuler = (box, jobs) => {
    const out = wrap(box);
    const X = (t) => 30 + (t / 100) * 340;
    const sc = jobs.map((j, i) => ({ ...j, c: j.c || COLS[i % 5], eta: 100 / j.due }));
    out.innerHTML = `<svg class="fig" viewBox="0 0 400 130" style="max-height:150px" role="img" aria-label="A ruler of due times from 0 to 100 minutes. ${sc.map((j) => `Job ${j.k} due at ${j.due}`).join(", ")}. Jobs due sooner are drawn bigger."><line x1="30" y1="86" x2="370" y2="86" stroke="var(--line-2)" stroke-width="4" stroke-linecap="round"/>${[0, 50, 100].map((t) => `<text x="${X(t)}" y="118" class="fig-sub">${t} min</text>`).join("")}${sc
      .map(
        (j) =>
          `<circle cx="${X(j.due)}" cy="${(80 - (4 + 2.6 * j.eta)).toFixed(1)}" r="${(4 + 2.6 * j.eta).toFixed(1)}" fill="${tint(j.c, 30)}" stroke="var(--${j.c})" stroke-width="3"/><text x="${X(j.due)}" y="${(85 - (4 + 2.6 * j.eta)).toFixed(1)}" class="fig-n">${j.k}</text>`,
      )
      .join(
        "",
      )}</svg><p class="dim" style="text-align:center;margin:0 0 10px">Each circle sits at the job's due time. Bigger circle, stronger pull.</p>`;
    nf.spin(
      out,
      sc.map((j) => ({ n: j.k, w: j.eta, c: j.c })),
      { bare: true, hint: "If the heuristic alone chose, the strip is sliced like this. Press <b>Draw</b> to try it." },
    );
  };
})();
