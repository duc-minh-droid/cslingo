/* Data Science (COM3021), Lecture 14: tensors and sparse tensors.
   This part: the lessons 14.3 (ds14-sparse, sparse and dense tensors, sparsity, why size matters) and 14.4
   (ds14-keys, dictionary of keys and coordinate list). Helpers come from ds-l14-01.js through NIC.shared.ds14. */
(function () {
  const S = NIC.shared.ds14;
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;
  const { reg, mc, pr, st, mm, stats, setStats, svg, tx, tint, card, grid, gridSvg, M9 } = S;

  /* ---------- the Sprout swap sheet: 8 members × 8 packets, cells filled in a fixed shuffled order ---------- */
  const ORDER = Array.from({ length: 64 }, (_, i) => i).sort((a, b) => ((a * 37 + 11) % 64) - ((b * 37 + 11) % 64));
  const sheet = (k) => {
    const M = Array.from({ length: 8 }, () => Array(8).fill(0));
    ORDER.slice(0, k).forEach((i, j) => (M[Math.floor(i / 8)][i % 8] = (j % 3) + 1));
    return M;
  };
  S.sheet = sheet;

  /** 14.3 demo: drag how many swaps happened; watch sparsity and the size of a full grid against a list of non-zeros. */
  function sparsityLab(b) {
    b.innerHTML = `<div class="controls" data-s></div><div data-f></div>${stats([
      ["blue", "Non-zero cells"],
      ["amber", "Sparsity"],
      ["violet", "Full grid stores"],
      ["teal", "List of non-zeros stores"],
    ])}<div class="fig-cap"></div>`;
    const sl = N.slider("Swaps recorded", 0, 64, 1, 6, (v) => `${v}`);
    b.firstChild.append(sl);
    const draw = () => {
      const k = sl.value,
        M = sheet(k),
        sp = Math.round(((64 - k) / 64) * 100);
      b.children[1].innerHTML = gridSvg(M, { cs: 30 }, `Swap sheet with ${k} non-zero cells out of 64`);
      setStats(b, [k, `${sp}%`, "64 numbers", `${3 * k} numbers`]);
      b.lastChild.innerHTML =
        sp >= 75
          ? `<b>Sparse</b>: most cells are 0. Writing down only the ${k} non-zeros (row, column, value) takes ${3 * k} numbers instead of 64.`
          : sp > 50
            ? "Getting crowded: the list of non-zeros is catching up with the full grid."
            : `<b>Dense</b>: most cells hold a value. Now the list (${3 * k} numbers) is bigger than just storing the grid.`;
    };
    sl.onInput(draw);
    draw();
  }

  const pair = (a, la, bb, lb) =>
    svg(
      360,
      176,
      `<g>${a}</g>${tx(85, 170, la, { s: 11.5, c: "var(--text-dim)" })}<g transform="translate(190,0)">${bb}</g>${tx(275, 170, lb, { s: 11.5, c: "var(--text-dim)" })}`,
      `${la} next to ${lb}`,
    );
  const sparseVsDense = pair(
    grid(sheet(6), { cs: 19, x0: 10, y0: 4 }),
    "sparse: mostly 0",
    grid(sheet(52), { cs: 19, x0: 10, y0: 4 }),
    "dense: mostly filled",
  );

  const social = svg(
    340,
    150,
    (() => {
      const P = [
        [60, 40],
        [150, 25],
        [250, 45],
        [300, 110],
        [190, 120],
        [80, 115],
      ];
      const E = [
        [0, 1],
        [1, 2],
        [2, 3],
        [4, 5],
        [1, 4],
      ];
      return (
        E.map(
          ([a, c]) =>
            `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[c][0]}" y2="${P[c][1]}" stroke="var(--line-2)" stroke-width="2"/>`,
        ).join("") +
        P.map(
          ([x, y], i) =>
            `<circle cx="${x}" cy="${y}" r="15" fill="${tint("violet", 22)}" stroke="var(--violet)" stroke-width="2"/>${tx(x, y + 4, String.fromCharCode(65 + i), { s: 11 })}`,
        ).join("") +
        tx(170, 146, "6 members, 5 links out of 15 possible", { s: 11, c: "var(--text-dim)" })
      );
    })(),
    "A small social graph: few of the possible links exist",
  );

  const bigSvg = svg(
    340,
    130,
    `<rect x="20" y="14" width="110" height="96" rx="8" fill="${tint("rose", 18)}" stroke="var(--rose)" stroke-width="2"/>${tx(75, 58, "every cell", { s: 12 })}${tx(75, 76, "n × n numbers", { s: 11, c: "var(--text-dim)", w: 700 })}` +
      `<rect x="210" y="70" width="110" height="40" rx="8" fill="${tint("teal", 22)}" stroke="var(--teal)" stroke-width="2"/>${tx(265, 88, "non-zeros only", { s: 12 })}${tx(265, 103, "about n entries", { s: 10.5, c: "var(--text-dim)", w: 700 })}` +
      `<path d="M140 62H200" stroke="var(--line-2)" stroke-width="2" marker-end="url(#ds14a)"/><defs><marker id="ds14a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--line-2)"/></marker></defs>`,
    "Storing every cell of a huge matrix against storing only its non-zero values",
  );

  /* ============ 14.3 Mostly nothing at all ============ */
  reg({
    id: "ds14-sparse",
    order: 3,
    num: "14.3",
    title: "Mostly nothing at all",
    blurb: "Sparse and dense tensors, sparsity, and why storing every zero becomes impossible.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Fill the swap sheet", "sparse or dense?");
      root.appendChild(c);
      sparsityLab(c.lastElementChild);
      root.appendChild(
        pr(
          "ds14-sparse-1",
          "As you dragged <b>Swaps recorded</b> up, what happened to the list of non-zeros?",
          [
            "It grew until it outweighed the full grid",
            "It stayed the same size throughout",
            "It shrank as the grid filled up",
          ],
          "Each non-zero costs a row, a column and a value. For a sparse sheet that is a bargain; once most cells are filled, the plain grid is smaller.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Sparse</b>: most elements are 0. <b>Dense</b>: most elements are non-zero.",
            "<b>Sparsity</b> is the proportion of zero-valued elements.",
            "Real data (social graphs, fault sensors) is often very sparse, and huge grids are too big to store in full.",
          ],
          "Lots of nothing deserves a smarter notebook.",
        ),
      );
    },
  });

  L["ds14-sparse"] = {
    sum: "A <b>sparse</b> tensor has mostly zeros, a <b>dense</b> one mostly non-zeros. <b>Sparsity</b> is the proportion of zeros. Real data is often very sparse, and storing every zero of a huge matrix can be prohibitive.",
    steps: [
      st(
        "An almost empty swap sheet",
        `<p>Sprout keeps a sheet with one row per member and one column per seed packet. A cell holds how many packets of that kind the member swapped. Most members only ever swap a few kinds, so the sheet is <b>mostly zeros</b>.</p><p>A tensor where most elements are 0 is <b>sparse</b>. One where most elements are non-zero is <b>dense</b>.</p>`,
        sparseVsDense,
        mc(
          "Sprout's sheet has thousands of packets, but each member swaps about five kinds. How would you describe it?",
          ["Sparse", "Dense", "A scalar"],
          "Almost every cell in a member's row is 0, so the sheet is sparse.",
        ),
      ),
      st(
        "Measuring emptiness",
        `<p>“Mostly empty” is a bit vague, so we put a number on it, like saying a car park is 90% free.</p><p><b>Sparsity</b> is the <b>proportion of zero-valued elements</b> in a tensor. High sparsity means a very empty tensor. For a big n × n grid, the slides call it sparse when the number of non-zeros is only about <b>in the order of n</b>, so roughly one per row, not one per cell.</p>${mm("<p>$$\\text{sparsity} = \\frac{\\text{number of zero elements}}{\\text{total number of elements}}$$<p>An $n \\times n$ matrix has $n^2$ elements; it is sparse when the non-zeros are $O(n)$, a vanishing share of $n^2$ as $n$ grows.</p>")}`,
        (b) => sparsityLab(b),
      ),
      st(
        "Real data is full of gaps",
        `<p>Think of a social network: who follows whom. Millions of people, but each follows only a few hundred. Nearly every cell of a “person × person” grid is 0.</p><p>The slides give two examples of very sparse real-world data: a <b>social graph</b> and <b>fault detection sensors</b>, which report “no fault” (0) almost all the time. Sprout's swap sheet is in the same club.</p>`,
        social,
      ),
      st(
        "Too big to write out",
        `<p>Picture printing a seating plan with a box for every pair of people in a city. Most boxes are empty, yet the paper would fill a warehouse.</p><p>A matrix with <b>n around a million</b> rows and columns has a million million cells. Storing every one as a 64-bit number is <b>prohibitive</b>: far more memory than a computer has. When a tensor is sparse, we can represent it more efficiently by keeping only the non-zeros.</p>${mm("<p>A dense $n \\times n$ matrix of 64-bit (8-byte) values needs $8n^2$ bytes. With $n \\approx 10^6$ that is $10^{12}$ cells, the slides' example of a size that is prohibitive. A sparse representation needs memory in proportion to the number of non-zeros instead.</p>")}`,
        bigSvg,
        mc(
          "Why does the slides' n ≈ 10⁶ matrix need a different representation?",
          [
            "Storing every zero would use far too much memory",
            "Computers cannot store a zero as a 64-bit number",
            "Its values are too large to fit in 64 bits each",
          ],
          "The trouble is the sheer count of cells, almost all zeros. Keep only the non-zeros and the memory problem goes away.",
        ),
      ),
    ],
    guide: [
      "Drag <b>Swaps recorded</b> from low to high.",
      "Watch the sparsity figure fall and compare the two storage sizes.",
      "Answer the question after the demo.",
    ],
  };

  /* ---------- figures for 14.4 ---------- */
  const nzHL = (M) => (r, c) => (M[r][c] ? "teal" : "");
  const DOK = [
    ["(0,0)", "1.0"],
    ["(0,2)", "5.0"],
    ["(1,1)", "3.0"],
    ["(1,5)", "11.0"],
  ];
  const list = (rows, colour, label) =>
    svg(
      340,
      34 + rows.length * 30,
      rows
        .map(
          (r, i) =>
            `<rect x="70" y="${10 + i * 30}" width="200" height="25" rx="7" fill="${tint(colour, 16)}" stroke="var(--${colour})" stroke-width="1.5"/>${tx(170, 27 + i * 30, r, { s: 12.5 })}`,
        )
        .join("") + tx(170, 26 + rows.length * 30, "…", { s: 14, c: "var(--text-faint)" }),
      label,
    );
  const dokSvg = list(
    DOK.map(([k, v]) => `${k} → ${v}`),
    "violet",
    "Dictionary of keys: each (row, column) key maps to its value",
  );
  const cooSvg = list(
    DOK.map(([k, v]) => `(${k.slice(1, -1)}, ${v})`),
    "amber",
    "Coordinate list: a list of (row, column, value) tuples",
  );

  /* ============ 14.4 Only write down what's there ============ */
  reg({
    id: "ds14-keys",
    order: 4,
    num: "14.4",
    title: "Only write down what's there",
    blurb: "Skip the zeros: the dictionary of keys and the coordinate list.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "A <b>sparse representation</b> stores only the non-zero values, each with its position.",
            "<b>Dictionary of keys</b>: (row, column) → value.",
            "<b>Coordinate list</b>: a list of (row, column, value) tuples.",
          ],
          "Keep the values, remember where they live.",
        ),
      );
    },
  });

  L["ds14-keys"] = {
    sum: "A <b>sparse representation</b> stores only the non-zero values. The <b>dictionary of keys</b> maps (row, column) to a value; the <b>coordinate list</b> keeps (row, column, value) tuples.",
    steps: [
      st(
        "Skip the zeros",
        `<p>Imagine a huge car park with only four cars. To tell a friend where they are, you would not describe every empty space; you would say “bay 2 in row 3 has a car”.</p><p>That is a <b>sparse representation</b>: store <b>only the non-zero values</b>, each with its position. The zeros are left out, and anything not on the list is understood to be 0.</p>`,
        gridSvg(M9, { hl: nzHL(M9), labels: true }, "A 4 by 4 matrix with its four non-zero cells highlighted"),
      ),
      st(
        "A dictionary of keys",
        `<p>Think of a cloakroom: you hand over a ticket and get your coat. The ticket is the key; the coat is what it unlocks.</p><p>A <b>dictionary of keys</b> stores each non-zero as <b>(row, column): value</b>. The pair (row, column) is the key. To read a cell you look up its key; a key that is missing means the cell is 0.</p>${mm("<p>The slides' example: $(0,0) \\mapsto 1.0$, $(0,2) \\mapsto 5.0$, $(1,1) \\mapsto 3.0$, $(1,5) \\mapsto 11.0$, … In Python this is just a <code>dict</code> keyed by tuples.</p>")}`,
        dokSvg,
        mc(
          "In a dictionary of keys, how do you find the value at row 1, column 5?",
          ["Look up the key (1, 5)", "Read row 1 from left to right", "Count the zeros in column 5"],
          "The (row, column) pair is the key, so you look it up directly. No key means the cell is 0.",
        ),
      ),
      st(
        "A coordinate list",
        `<p>Now picture a plain shopping list instead of a cloakroom: each line says where and what, one after another.</p><p>A <b>coordinate list</b> keeps a <b>list of (row, column, value) tuples</b>: (0, 0, 1.0), (0, 2, 5.0), (1, 1, 3.0) and so on. Same information as the dictionary, written as a simple list of triples rather than a lookup table.</p>`,
        cooSvg,
        mc(
          "What does each entry of a coordinate list hold?",
          ["A row, a column and a value", "A whole row of the matrix", "Just the non-zero value"],
          "Each tuple is (row, column, value): the value plus the address it belongs at.",
        ),
      ),
    ],
  };
})();
