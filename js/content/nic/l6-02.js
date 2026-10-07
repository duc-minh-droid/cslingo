/* l6-02: Lecture 6: 6.2 random programs. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, randint, rnd } = N;
  const L = N.LESSONS;
  const sh = (NIC.shared.l6 = NIC.shared.l6 || {});
  const { row, mulberry, FN, fn, tm, size, depth, randomProgram, treeSVG, sx } = sh;

  /* ============ 6.2 Random programs ============ */
  const FS_RAND = ["+", "-", "*", "%", "IF"],
    TS_RAND = [() => "X", () => "Y", () => Math.round(rnd() * 50) / 10];

  N.register({
    id: "l6-random",
    lecture: 6,
    order: 2,
    num: "6.2",
    title: "Creating random programs",
    blurb: "Expand a random program one node at a time and see how the depth limit forces terminals.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "To start a GP run you need a <b>function set</b> F (here PLUS, MINUS, TIMES, DIV, IF) and a <b>terminal set</b> T (X, Y and any real number), with syntax rules: PLUS, MINUS, TIMES and DIV take two children and <b>IF takes four</b> (IF A &gt; B then C else D). Pick a maximum depth, choose a random function for the root, then keep giving children to function nodes that don't have any yet.",
        ),
      );
      let maxD = 5,
        tree = null,
        pend = [];
      const card = el(
        `<div class="card"><div class="card-head"><h2>Grow a program</h2></div><div class="controls" id="c"></div><div id="tr"></div><div id="note"></div><div class="controls"><button class="btn" id="stat">Create 300 random programs</button></div><canvas class="viz" id="hist" style="display:none"></canvas><div id="st"></div></div>`,
      );
      root.appendChild(card);
      const sD = N.slider("Maximum depth", 2, 6, 1, maxD);
      sD.onInput((v) => {
        maxD = v;
        newProg();
      });
      const bStep = el(`<button class="btn primary">Expand one node</button>`),
        bAll = el(`<button class="btn">Finish the program</button>`),
        bNew = el(`<button class="btn ghost">New program</button>`);
      qs("#c", card).append(sD, bStep, bAll, bNew);
      const term = () => tm(TS_RAND[Math.floor(rnd() * 3)]());
      function newProg() {
        const op = FS_RAND[randint(0, 4)];
        tree = fn(op);
        tree.kids = [];
        tree.pendingNode = true;
        pend = [{ n: tree, d: 1 }];
        draw();
      }
      function expand() {
        if (!pend.length) return;
        const i = randint(0, pend.length - 1),
          { n, d } = pend.splice(i, 1)[0];
        n.kids = Array.from({ length: FN[n.op].n }, () => {
          if (d < maxD - 1 && rnd() < 0.5) {
            const f = fn(FS_RAND[randint(0, 4)]);
            f.kids = [];
            pend.push({ n: f, d: d + 1 });
            return f;
          }
          return term();
        });
        draw(d);
      }
      bStep.onclick = expand;
      bAll.onclick = () => {
        while (pend.length) expand();
      };
      bNew.onclick = newProg;
      function draw(last) {
        const pset = new Set(pend.map((p) => p.n));
        qs("#tr", card).innerHTML = treeSVG(tree, { pend: pset, showDepth: true });
        const done = !pend.length;
        qs("#note", card).innerHTML =
          `<div class="callout ${done ? "teal" : "blue"}">${done ? `<b>Finished.</b> ` : `<b>${pend.length}</b> function node${pend.length === 1 ? " is" : "s are"} still waiting for children (dashed). `}${last === maxD - 1 ? `That node was at depth ${last} = max − 1, so all its children had to be <b>terminals</b>.` : last ? `That node was at depth ${last}, so its children could be functions or terminals.` : ""}${done ? `Size <b>${size(tree)}</b> nodes, depth <b>${depth(tree)}</b>. As a formula: <span class="mono">${sx(tree)}</span>` : ""}</div>`;
      }
      qs("#stat", card).onclick = () => {
        const sizes = [],
          bins = Array(8).fill(0);
        let hit = 0;
        for (let k = 0; k < 300; k++) {
          const t = randomProgram(Math.random, maxD, FS_RAND, TS_RAND),
            s = size(t);
          sizes.push(s);
          if (depth(t) === maxD) hit++;
        }
        const mx = Math.max(...sizes),
          w = Math.max(1, Math.ceil((mx + 1) / 8));
        sizes.forEach((s) => bins[Math.min(7, Math.floor(s / w))]++);
        const cv = qs("#hist", card);
        cv.style.display = "";
        N.barChart(cv, {
          groups: [{ values: bins, color: N.colors().blue }],
          labels: bins.map((_, i) => `${i * w}–${i * w + w - 1}`),
          height: 170,
          decimals: 0,
          names: ["programs"],
        });
        qs("#st", card).innerHTML =
          `<p>With maximum depth ${maxD}: sizes range from <b>${Math.min(...sizes)}</b> to <b>${mx}</b> nodes (mean <b>${(sizes.reduce((a, b) => a + b, 0) / 300).toFixed(1)}</b>); <b>${hit}</b> of 300 reached the full depth.</p>`;
      };
      newProg();
      root.appendChild(
        predict({
          id: "l6-rand-1",
          q: "Maximum depth is 5. A function node at depth 4 is expanded. What can its children be?",
          opts: ["Only terminals", "Functions or terminals", "Only functions"],
          a: 0,
          why: "A function at depth Max − 1 is given terminals only. Its children sit at depth 5 = Max, so they cannot have children of their own.",
        }),
      );
      root.appendChild(
        predict({
          id: "l6-rand-2",
          q: "Press <b>Create 300 random programs</b> with maximum depth 5. Which describes the sizes?",
          opts: [
            "All programs have almost exactly the same size",
            "Sizes vary a lot, from a handful of nodes to dozens",
            "Every program fills all five levels with 31 nodes",
          ],
          a: 1,
          why: "Each expansion randomly picks function or terminal, so some trees stop early and others fill out. Random programs differ greatly in size.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Initialisation needs a function set F, a terminal set T and syntax rules (arity of each function).",
            "Choose a random function for the root; then give random children to each childless function node.",
            "At depth Max − 1 the children are terminals, which caps the depth at Max.",
          ],
          "A depth limit turns an unbounded random program into a finite one.",
        ),
      );
    },
  });

  L["l6-random"] = {
    sum: "Random programs are built from a <b>function set</b> and a <b>terminal set</b>, with a <b>depth limit</b> so they stop growing.",
    steps: [
      {
        t: "Function set, terminal set, syntax",
        b: `<p><b>F</b> = PLUS, MINUS, TIMES, DIV, IF. <b>T</b> = X, Y, any real number. Syntax rules say how many children each function has: two for PLUS, MINUS, TIMES and DIV; <b>four</b> for IF (IF A &gt; B then return C else return D).</p>`,
        v:
          row(
            "F",
            `<span class="genome">${["PLUS", "MINUS", "TIMES", "DIV", "IF"].map((s) => `<span class="gene p1" style="padding:2px 6px">${s}</span>`).join("")}</span>`,
          ) +
          row(
            "T",
            `<span class="genome">${["X", "Y", "3.7"].map((s) => `<span class="gene good" style="padding:2px 6px">${s}</span>`).join("")}</span>`,
          ),
        c: {
          q: "How many children does IF have in the lecture's syntax?",
          o: ["2", "3", "4"],
          a: 2,
          why: "A, B, C and D: if A &gt; B return C, else return D.",
        },
      },
      {
        t: "Grow it with a depth limit",
        b: `<p>Maximum depth 5. <b>Start:</b> pick a random function for the root (depth 1). <b>Repeat:</b> pick a function node without children. If its depth is less than Max − 1, give it random children (functions or terminals) one level deeper. If its depth is <b>exactly Max − 1</b>, its children must all be terminals.</p>`,
        v: (box) => {
          const r = mulberry(11),
            t = randomProgram(r, 4, FS_RAND, [() => "X", () => "Y", () => Math.round(r() * 50) / 10]);
          box.innerHTML =
            treeSVG(t, { showDepth: true }) +
            `<p class="dim" style="text-align:center">A program with maximum depth 4; <i>d</i> labels show each node's depth.</p>`;
        },
        c: {
          q: "Maximum depth is 5. A function node at depth 4 gets its children. They must be…",
          o: ["Terminals", "Functions", "Anything"],
          a: 0,
          why: "Depth 4 = Max − 1, so the children land on the last allowed level.",
        },
      },
      {
        t: "Reading a random program",
        b: `<p>A tree can be read as ordinary code. Random programs are often silly: for example an IF whose two branches return the same thing. That is fine; selection will sort the useful ones from the useless ones.</p>`,
        v: `<div class="mono" style="text-align:center">(IF (&gt; X 3.1) <b>Y</b> <b>Y</b>)</div><p class="dim" style="text-align:center">Both branches return Y: harmless, and selection will not reward it.</p>`,
        c: {
          q: "A random program contains useless code, such as an IF that returns Y on both branches. What should we do?",
          o: [
            "Nothing: evolution works with random material",
            "Reject it and generate another random program",
            "Edit it by hand to remove the useless branch",
          ],
          a: 0,
          why: "GP starts from random programs and relies on selection.",
        },
      },
      {
        t: "Sizes vary a lot",
        b: `<p>Because each child is randomly a function or a terminal, one random program may stop after 3 nodes and the next may fill every level. The depth limit is the only thing that stops growth.</p>`,
        v: (box) => {
          const mk = (n) => {
            const r = mulberry(n),
              t = randomProgram(r, 4, FS_RAND, [() => "X", () => "Y", () => Math.round(r() * 50) / 10]);
            return `<div>${treeSVG(t)}<p class="dim" style="text-align:center">${size(t)} nodes</p></div>`;
          };
          box.innerHTML = `<div class="grid two">${mk(3)}${mk(21)}</div><p class="dim" style="text-align:center">Same depth limit (4), very different sizes.</p>`;
        },
        c: {
          q: "What stops a random program from growing without end?",
          o: ["The maximum depth rule", "The fitness function", "The size of the population"],
          a: 0,
          why: "At depth Max − 1 children must be terminals.",
        },
      },
    ],
    guide: [
      "Press <b>Expand one node</b> several times.",
      "Change the <b>Maximum depth</b> and press <b>Finish the program</b>.",
      "Press <b>Create 300 random programs</b> and look at the sizes.",
      "Answer the questions after the demo.",
    ],
  };
})();
