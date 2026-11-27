/* Data Science (COM3021), Lecture 14: tensors and sparse tensors.
   This part: the lessons 14.5 (ds14-csr, compressed sparse row and reading a row back) and 14.6 (ds14-csc, compressed
   sparse column and when to pick CSR or CSC). Helpers come from ds-l14-01.js through NIC.shared.ds14. */
(function () {
  const S = NIC.shared.ds14;
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;
  const { reg, mc, pr, st, mm, seg, svg, tx, tint, card, gridSvg, arr, formats, M9, M12, M13 } = S;

  /** The CSR picture of a matrix, with one row (or none) highlighted in the grid and in all three arrays. */
  function csrView(M, row = -1, label = "A matrix and its three CSR arrays") {
    const f = formats(M),
      a = row < 0 ? 0 : f.ROW[row],
      z = row < 0 ? 0 : f.ROW[row + 1],
      inS = (i) => (i >= a && i < z ? "teal" : "");
    return `<div class="ds14-pair">${gridSvg(M, { hl: (r, c) => (r === row && M[r][c] ? "teal" : r === row ? "amber" : ""), labels: true, cs: 32 }, label)}<div>${arr("V", f.V, inS)}${arr("COL_INDEX", f.COL, inS)}${arr("ROW_INDEX", f.ROW, (i) => (row >= 0 && (i === row || i === row + 1) ? "violet" : ""))}</div></div>`;
  }
  S.csrView = csrView;

  /** 14.5 demo: pick a row of the slides' 4 × 6 matrix and watch CSR hand it back. */
  function csrLab(b) {
    b.innerHTML = '<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>';
    const f = formats(M12);
    const draw = (v) => {
      const r = +v,
        a = f.ROW[r],
        z = f.ROW[r + 1];
      b.children[1].innerHTML = csrView(M12, r, `Row ${r} highlighted in the matrix and in its CSR arrays`);
      b.lastChild.innerHTML = `Row ${r}: start = ROW_INDEX[${r}] = <b>${a}</b>, end = ROW_INDEX[${r + 1}] = <b>${z}</b>. Slice V → <b>${f.V.slice(a, z).join(", ")}</b> at columns <b>${f.COL.slice(a, z).join(", ")}</b>.`;
    };
    seg(b.firstChild, "0:Row 0|1:Row 1|2:Row 2|3:Row 3", "0", draw);
    draw("0");
  }
  S.csrLab = csrLab;

  const bookmarks = svg(
    340,
    120,
    [0, 1, 2, 3, 4]
      .map((i) => {
        const x = 40 + [0, 2, 4, 7, 8][i] * 32;
        return `<line x1="${x}" y1="28" x2="${x}" y2="84" stroke="var(--violet)" stroke-width="3"/>${tx(x, 20, `[${i}]`, { s: 10.5, c: "var(--violet-ink)" })}`;
      })
      .join("") +
      [10, 20, 30, 40, 50, 60, 70, 80]
        .map(
          (v, i) =>
            `<rect x="${42 + i * 32}" y="40" width="28" height="32" rx="6" fill="${tint("blue", 16)}" stroke="var(--blue)" stroke-width="1.5"/>${tx(56 + i * 32, 61, v, { s: 11.5 })}`,
        )
        .join("") +
      ["row 0", "row 1", "row 2", "row 3"]
        .map((t, i) =>
          tx(40 + (([0, 2, 4, 7][i] + [2, 4, 7, 8][i]) / 2) * 32, 102, t, { s: 10.5, c: "var(--text-dim)" }),
        )
        .join(""),
    "ROW_INDEX entries 0, 2, 4, 7 and 8 marking where each row starts in V",
  );

  /* ============ 14.5 Three arrays: compressed sparse row ============ */
  reg({
    id: "ds14-csr",
    order: 5,
    num: "14.5",
    title: "Three tidy arrays",
    blurb: "Compressed sparse row (CSR): values, column indexes and row bookmarks, and how to read a row back.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Read a row back", "CSR");
      root.appendChild(c);
      csrLab(c.lastElementChild);
      root.appendChild(
        pr(
          "ds14-csr-1",
          "Each time you picked a row, which array told CSR where that row starts and stops?",
          ["ROW_INDEX", "V", "COL_INDEX"],
          "ROW_INDEX holds the bookmarks: entry [row] is where the row starts and entry [row + 1] is where it stops. V and COL_INDEX are then sliced between those two.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>CSR</b> uses three arrays: <b>V</b> (non-zero values), <b>COL_INDEX</b> (their columns), <b>ROW_INDEX</b> (length m + 1).",
            "<b>ROW_INDEX</b> says where each row starts in V and COL_INDEX.",
            "To read row r, slice V and COL_INDEX from ROW_INDEX[r] to ROW_INDEX[r + 1].",
          ],
          "Values, columns, bookmarks.",
        ),
      );
    },
  });

  L["ds14-csr"] = {
    sum: "<b>Compressed sparse row (CSR)</b> stores a sparse matrix in three arrays: V (the non-zero values), COL_INDEX (their columns) and ROW_INDEX (length m + 1, where each row starts).",
    steps: [
      st(
        "Line the values up row by row",
        `<p>Sprout wants a tighter notebook than a list of triples. Picture reading the swap sheet like a book, row by row, and copying down only the non-zero numbers.</p><p>That is <b>compressed sparse row (CSR)</b>. It uses three arrays: <b>V</b> holds the non-zero values in reading order, <b>COL_INDEX</b> holds the column of each one, and a third array, <b>ROW_INDEX</b>, marks where each row begins.</p>`,
        csrView(
          M9,
          -1,
          "The slides' 4 by 4 matrix with V = 5, 8, 3, 6, COL_INDEX = 0, 1, 2, 1 and ROW_INDEX = 0, 1, 2, 3, 4",
        ),
      ),
      st(
        "Bookmarks for each row",
        `<p>Think of bookmarks in a recipe book: each one says “this chapter starts on page…”. You never need to write down where a chapter ends: it ends where the next one starts.</p><p><b>ROW_INDEX</b> works like that. Entry r is the position in V (and COL_INDEX) where <b>row r starts</b>. It has <b>m + 1</b> entries for m rows: the extra last one marks the end of the final row.</p>${mm("<p>For an $m$-row matrix with $\\text{nnz}$ non-zeros, $\\text{ROW\\_INDEX}[0] = 0$ and $\\text{ROW\\_INDEX}[m] = \\text{nnz}$. Row $r$ holds $\\text{ROW\\_INDEX}[r+1] - \\text{ROW\\_INDEX}[r]$ non-zeros.</p>")}`,
        bookmarks,
        mc(
          "What does ROW_INDEX tell you?",
          ["Where each row starts in V", "The column of each non-zero value", "The values that are not zero"],
          "ROW_INDEX holds one bookmark per row (plus one at the end). The columns live in COL_INDEX and the values in V.",
        ),
      ),
      st(
        "Reading one row back",
        `<p>To read chapter 3, open at its bookmark and stop at the next one.</p><p>To rebuild a row from CSR: <b>row_start = ROW_INDEX[row]</b> and <b>row_end = ROW_INDEX[row + 1]</b>. Then slice <b>V[row_start:row_end]</b> for the values and <b>COL_INDEX[row_start:row_end]</b> for their columns. Every other cell in that row is 0.</p>${mm("<p>The slides' exercise: $V = [10, 20, 30, 40, 50, 60, 70, 80]$, $\\text{COL\\_INDEX} = [0, 1, 1, 3, 2, 3, 4, 5]$, $\\text{ROW\\_INDEX} = [0, 2, 4, 7, 8]$. The third row is row 2: start $= 4$, end $= 7$, so the values $50, 60, 70$ sit in columns $2, 3, 4$, giving $[0, 0, 50, 60, 70, 0]$.</p>")}`,
        csrView(M12, 2, "The slides' 4 by 6 matrix with its third row highlighted in the CSR arrays"),
      ),
      st(
        "A row with nothing in it",
        `<p>Suppose a new Sprout member has not swapped anything yet. Their row is all zeros, so nothing of theirs goes into V.</p><p>Their bookmark and the next one then point at the <b>same position</b>: the slice from start to end is empty. Following the reading rule, that is exactly right: an empty slice means an all-zero row. (This case follows from the slides' rule; it is not shown on them.)</p>`,
        csrView(
          [
            [4, 0, 2],
            [0, 0, 0],
            [0, 7, 0],
          ],
          1,
          "A 3 by 3 matrix whose middle row is empty: ROW_INDEX is 0, 2, 2, 3",
        ),
        mc(
          "Two neighbouring entries of ROW_INDEX are equal. What does that row hold?",
          ["Only zeros", "One non-zero value", "The largest values"],
          "Equal bookmarks mean the slice of V is empty, so the row has no non-zeros at all.",
        ),
      ),
    ],
    guide: [
      "Tap <b>Row 0</b> to <b>Row 3</b>.",
      "Watch the two purple ROW_INDEX entries and the green slice of V and COL_INDEX.",
      "Answer the question after the demo.",
    ],
  };

  /* ---------- figures for 14.6 ---------- */
  function cscView(M, label) {
    const f = formats(M);
    return `<div class="ds14-pair">${gridSvg(M, { hl: (r, c) => (M[r][c] ? "teal" : ""), labels: true, cs: 32 }, label)}<div>${arr("VALUES", f.cV)}${arr("ROW_INDEX", f.cROW)}${arr("COL_PTR", f.cPTR)}</div></div>`;
  }
  S.cscView = cscView;
  const graphSvg = svg(
    340,
    130,
    `<rect x="16" y="20" width="140" height="90" rx="10" fill="${tint("blue", 12)}" stroke="var(--blue)" stroke-width="2"/>${tx(86, 44, "row of Ada", { s: 12 })}${tx(86, 66, "= Ada's neighbours", { s: 11, c: "var(--text-dim)", w: 700 })}${tx(86, 90, "Ben, Cy, Dot", { s: 11.5, c: "var(--blue-ink)" })}` +
      `<rect x="184" y="20" width="140" height="90" rx="10" fill="${tint("amber", 14)}" stroke="var(--amber)" stroke-width="2"/>${tx(254, 44, "column “tomato”", { s: 12 })}${tx(254, 66, "= one category", { s: 11, c: "var(--text-dim)", w: 700 })}${tx(254, 90, "who swapped it", { s: 11.5, c: "var(--amber-ink)" })}`,
    "Left: a row holds one node's neighbours, a job for CSR. Right: a column is one category, a job for CSC",
  );

  /* ============ 14.6 Columns first, and choosing ============ */
  reg({
    id: "ds14-csc",
    order: 6,
    num: "14.6",
    title: "Rows or columns? Pick your notebook",
    blurb: "Compressed sparse column (CSC), and when CSR or CSC is the faster choice.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>CSC</b> is CSR's sibling, built column by column: VALUES, ROW_INDEX, COL_PTR.",
            "<b>CSR</b>: fast row operations, slow column ones. Good for row slicing, many A × x products, graphs.",
            "<b>CSC</b>: fast column operations. Good for huge sparse datasets with many categorical features.",
          ],
          "Store it the way you will read it.",
        ),
      );
    },
  });

  L["ds14-csc"] = {
    sum: "<b>Compressed sparse column (CSC)</b> is CSR's sibling, built column by column. CSR gives fast row operations (graphs, matrix-vector products); CSC gives fast column operations (many categorical features).",
    steps: [
      st(
        "CSR's sibling, sideways",
        `<p>Read the swap sheet top to bottom, one column at a time, instead of left to right. Same trick, turned on its side.</p><p>That is <b>compressed sparse column (CSC)</b>, the sibling of CSR. <b>VALUES</b> holds the non-zeros column by column, <b>ROW_INDEX</b> the row of each one, and <b>COL_PTR</b> the bookmarks where each column starts.</p>${mm("<p>The slides' example: $\\text{VALUES} = [10, 2, 5, 7, 9]$, $\\text{ROW\\_INDEX} = [0, 3, 1, 2, 3]$, $\\text{COL\\_PTR} = [0, 2, 3, 4, 5]$. Column $c$ is the slice from $\\text{COL\\_PTR}[c]$ to $\\text{COL\\_PTR}[c+1]$: column 0 holds 10 (row 0) and 2 (row 3).</p>")}`,
        cscView(M13, "The slides' 4 by 4 matrix with its CSC arrays"),
        mc(
          "In CSC, what are the bookmarks in COL_PTR for?",
          ["Where each column starts in VALUES", "Where each row starts in VALUES", "The column of each stored value"],
          "CSC mirrors CSR: its bookmarks mark the start of each column. The row of each value lives in ROW_INDEX.",
        ),
      ),
      st(
        "CSR when you think in rows",
        `<p>Sprout's “who swaps with whom” map is a <b>graph</b>: each member is a node, and their row lists their swap partners, their <b>neighbours</b>.</p><p>CSR makes <b>row operations fast</b> and column ones slow. Pick it when you need fast <b>row slicing</b> or perform many <b>matrix-vector products A × x</b>, which work through the matrix row by row. Graphs fit perfectly: each row holds one node's neighbours.</p>`,
        graphSvg,
      ),
      st(
        "CSC when you think in columns",
        `<p>Now Sprout's data team builds a giant table: one column per category, such as “tomato”, “basil” or “sunflower”, with a 1 wherever a member swapped it. Almost every cell is 0.</p><p>CSC makes <b>column operations fast</b>. It suits <b>huge sparse datasets with many categorical features</b>, where you often want everything about one column at a time.</p>`,
        graphSvg,
        mc(
          "Sprout often asks “who swapped this one packet?”, a question about a single column. Which format suits it?",
          ["CSC", "CSR", "A dense grid"],
          "A question about one column wants fast column access, which is what CSC gives. CSR would have to look through every row.",
        ),
      ),
    ],
  };
})();
