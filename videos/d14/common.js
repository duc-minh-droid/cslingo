/* Lecture 14 · Tensors (Data Science, COM3021): the data every scene of this video shares (VID.d14, short name D14). PURE: no
   DOM, no Math.random, no Date. Drawing pieces are in common-2.js (matrix grids, labelled arrays, flying packets, frames); the
   small stickers (tags, labels, chips, cards, bars) come from the lecture 4 kit VID.d4, so the page loads videos/l5/common.js and
   videos/d4/common*.js first. Everything is ported from the lessons (js/content/ds/ds-l14-*.js: formats(), sheet(), the slide
   matrices M9, M12, M13) and asserted against the script (videos/_plan/ds-14-script.md): a wrong number throws an Error.

   COLOUR ROLES OF THIS VIDEO (the same in every scene):
     "grey"    zeros (faint cells), grid lines, axes, arrows, plain labels
     "blue"    stored values: the numbers in a vector, matrix or tensor, the non-zeros, the V / VALUES array
     "orange"  positions: row and column numbers, keys, COL_INDEX in CSR, ROW_INDEX in CSC, the shape names
     "purple"  bookmarks and directions: ROW_INDEX in CSR, COL_PTR in CSC, the index arrows, the order counter
     "green"   the answer: a row or column read back, the smaller store, a tick
     "red"     waste: storing every zero, the store that is too big

   D14.ORD    {scalar: 18, vec: [3, 5, 1, 4], mat: [[3,5,1,4],[2,0,4,1],[0,3,5,2]]}   (scene 2, lesson 14.1)
   D14.SHAPE  {profile: [[name, value] x 4], sens: {names, rows: [[31..],[14..]], times}, frames: 4, order: 4}   (scene 3)
   D14.sheet(k) -> the 8 x 8 swap sheet with its first k cells filled (the lesson's fixed shuffled ORDER, values 1..3)
   D14.SHEET  {n: 64, order: [cell index ...], fill(j) -> {r, c, v} of the j-th filled cell, sparsity(k) -> %, list(k) -> 3k,
              sparse: 6, dense: 52}   (scene 4, lesson 14.3)
   D14.BIG    {members: 6, links: [[0,1],...] (5), possible: 15, n: 1e6, cells: 1e12}   (scene 5)
   D14.formats(M) -> {nz: [[r, c, v]], V, COL, ROW (CSR), cV, cROW, cPTR (CSC)}   (the lesson's own code)
   D14.M9, M12, M13, M3 (the slides' matrices and the empty-row 3 x 3), D14.F9 / F12 / F13 / F3 = their formats
   D14.readRow(F, r, n) -> {start, end, vals, cols, row}   D14.readCol(F, c, m) -> {start, end, vals, rows, col}
   D14.R2 (row 2 of M12), D14.R3 (the empty middle row of M3), D14.C0 (column 0 of M13), D14.DOK (lookups in M9's keys)
   D14.CHOOSE {names: ["Ada","Ben","Cy","Dot"], adj (4 x 4), crops: ["tomato","basil","sunflower"], swaps (4 x 3)}   (scene 10)
   SMALL TOOLS  D14.same(what, got, want) throws on a mismatch; D14.seq = D4.seq; D14.tone = D4.tone. */
(function () {
  const V = window.VID;
  const D14 = (V.d14 = V.d14 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.d14: ${what} is ${JSON.stringify(got)}, the script says ${JSON.stringify(want)}`);
  };
  Object.assign(D14, { same, tone: (n) => V.d4.tone(n), seq: (...a) => V.d4.seq(...a) });

  // ---------- scene 2: orders ----------
  D14.ORD = {
    scalar: 18,
    vec: [3, 5, 1, 4],
    mat: [
      [3, 5, 1, 4],
      [2, 0, 4, 1],
      [0, 3, 5, 2],
    ],
  };
  same("ORD: the vector is the matrix's first row", D14.ORD.mat[0], D14.ORD.vec);

  // ---------- scene 3: shapes ----------
  D14.SHAPE = {
    profile: [
      ["height (cm)", 180],
      ["days to sprout", 10],
      ["price (p)", 150],
      ["swaps", 7],
    ],
    sens: {
      names: ["moisture", "soil °C"],
      rows: [
        [31, 30, 28, 26, 25, 29],
        [14, 15, 17, 19, 18, 16],
      ],
      times: ["6am", "9am", "12pm", "3pm", "6pm", "9pm"],
    },
    channels: ["red", "green", "blue"],
    frames: 4,
    dims: ["frames", "width", "height", "channels"],
  };
  D14.SHAPE.order = D14.SHAPE.dims.length;
  same("SHAPE: sensor grid is 2 x 6", [D14.SHAPE.sens.rows.length, D14.SHAPE.sens.rows[0].length], [2, 6]);
  same("SHAPE: video order", D14.SHAPE.order, 4);

  // ---------- scene 4: the swap sheet (the lesson's sheet(), line for line) ----------
  const ORDER = Array.from({ length: 64 }, (_, i) => i).sort((a, b) => ((a * 37 + 11) % 64) - ((b * 37 + 11) % 64));
  const sheet = (k) => {
    const M = Array.from({ length: 8 }, () => Array(8).fill(0));
    ORDER.slice(0, k).forEach((i, j) => (M[Math.floor(i / 8)][i % 8] = (j % 3) + 1));
    return M;
  };
  D14.sheet = sheet;
  const nzOf = (M) => M.flat().filter((v) => v).length;
  D14.SHEET = {
    n: 64,
    order: ORDER,
    fill: (j) => ({ r: Math.floor(ORDER[j] / 8), c: ORDER[j] % 8, v: (j % 3) + 1 }),
    sparsity: (k) => Math.round(((64 - k) / 64) * 100),
    list: (k) => 3 * k,
    sparse: 6,
    dense: 52,
  };
  {
    const S = D14.SHEET;
    same("SHEET non-zeros", [nzOf(sheet(6)), nzOf(sheet(52))], [6, 52]);
    same("SHEET sparsity", [S.sparsity(6), S.sparsity(52)], [91, 19]);
    same("SHEET list sizes", [S.list(6), S.list(52)], [18, 156]);
    same("SHEET fill matches sheet(52)", sheet(52)[S.fill(51).r][S.fill(51).c], S.fill(51).v);
  }

  // ---------- scene 5: too big ----------
  {
    const members = 6;
    const links = [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 5],
      [1, 4],
    ];
    const n = 1e6;
    D14.BIG = { members, links, possible: (members * (members - 1)) / 2, n, cells: n * n };
    same("BIG links and possible", [links.length, D14.BIG.possible], [5, 15]);
    same("BIG cells (a million million)", D14.BIG.cells, 1e12);
  }

  // ---------- storage formats (the lesson's formats(), line for line) ----------
  function formats(M) {
    const nz = [];
    M.forEach((row, r) => row.forEach((v, c) => v && nz.push([r, c, v])));
    const rowIdx = [0];
    M.forEach((_, r) => rowIdx.push(nz.filter((t) => t[0] <= r).length));
    const byCol = [...nz].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    const colPtr = [0];
    M[0].forEach((_, c) => colPtr.push(byCol.filter((t) => t[1] <= c).length));
    return {
      nz,
      byCol,
      V: nz.map((t) => t[2]),
      COL: nz.map((t) => t[1]),
      ROW: rowIdx,
      cV: byCol.map((t) => t[2]),
      cROW: byCol.map((t) => t[0]),
      cPTR: colPtr,
    };
  }
  D14.formats = formats;
  D14.readRow = (F, r, n) => {
    const start = F.ROW[r];
    const end = F.ROW[r + 1];
    const vals = F.V.slice(start, end);
    const cols = F.COL.slice(start, end);
    const row = Array(n).fill(0);
    cols.forEach((c, i) => (row[c] = vals[i]));
    return { start, end, vals, cols, row };
  };
  D14.readCol = (F, c, m) => {
    const start = F.cPTR[c];
    const end = F.cPTR[c + 1];
    const vals = F.cV.slice(start, end);
    const rows = F.cROW.slice(start, end);
    const col = Array(m).fill(0);
    rows.forEach((r, i) => (col[r] = vals[i]));
    return { start, end, vals, rows, col };
  };

  D14.M9 = [
    [5, 0, 0, 0],
    [0, 8, 0, 0],
    [0, 0, 3, 0],
    [0, 6, 0, 0],
  ];
  D14.M12 = [
    [10, 20, 0, 0, 0, 0],
    [0, 30, 0, 40, 0, 0],
    [0, 0, 50, 60, 70, 0],
    [0, 0, 0, 0, 0, 80],
  ];
  D14.M13 = [
    [10, 0, 0, 0],
    [0, 5, 0, 0],
    [0, 0, 7, 0],
    [2, 0, 0, 9],
  ];
  D14.M3 = [
    [4, 0, 2],
    [0, 0, 0],
    [0, 7, 0],
  ];
  const F9 = (D14.F9 = formats(D14.M9));
  const F12 = (D14.F12 = formats(D14.M12));
  const F13 = (D14.F13 = formats(D14.M13));
  const F3 = (D14.F3 = formats(D14.M3));
  same(
    "M9 CSR",
    [F9.V, F9.COL, F9.ROW],
    [
      [5, 8, 3, 6],
      [0, 1, 2, 1],
      [0, 1, 2, 3, 4],
    ],
  );
  same("M9 keys", F9.nz, [
    [0, 0, 5],
    [1, 1, 8],
    [2, 2, 3],
    [3, 1, 6],
  ]);
  same(
    "M12 CSR",
    [F12.V, F12.COL, F12.ROW],
    [
      [10, 20, 30, 40, 50, 60, 70, 80],
      [0, 1, 1, 3, 2, 3, 4, 5],
      [0, 2, 4, 7, 8],
    ],
  );
  D14.R2 = D14.readRow(F12, 2, 6);
  same(
    "M12 row 2",
    [D14.R2.start, D14.R2.end, D14.R2.vals, D14.R2.cols, D14.R2.row],
    [4, 7, [50, 60, 70], [2, 3, 4], [0, 0, 50, 60, 70, 0]],
  );
  same("M12 row 2 equals the matrix row", D14.R2.row, D14.M12[2]);
  same(
    "M3 CSR",
    [F3.V, F3.COL, F3.ROW],
    [
      [4, 2, 7],
      [0, 2, 1],
      [0, 2, 2, 3],
    ],
  );
  D14.R3 = D14.readRow(F3, 1, 3);
  same("M3 middle row is empty", [D14.R3.start, D14.R3.end, D14.R3.vals, D14.R3.row], [2, 2, [], [0, 0, 0]]);
  same(
    "M13 CSC",
    [F13.cV, F13.cROW, F13.cPTR],
    [
      [10, 2, 5, 7, 9],
      [0, 3, 1, 2, 3],
      [0, 2, 3, 4, 5],
    ],
  );
  D14.C0 = D14.readCol(F13, 0, 4);
  same(
    "M13 column 0",
    [D14.C0.start, D14.C0.end, D14.C0.vals, D14.C0.rows, D14.C0.col],
    [0, 2, [10, 2], [0, 3], [10, 0, 0, 2]],
  );
  // the dictionary-of-keys lookups in scene 6 (keys of M9): a stored key and a missing one
  D14.DOK = {
    hit: [3, 1],
    miss: [3, 2],
    get: (r, c) => (F9.nz.find((t) => t[0] === r && t[1] === c) || [r, c, 0])[2],
  };
  same("DOK lookups", [D14.DOK.get(3, 1), D14.DOK.get(3, 2)], [6, 0]);

  // ---------- scene 10: CSR or CSC ----------
  D14.CHOOSE = {
    names: ["Ada", "Ben", "Cy", "Dot"],
    adj: [
      [0, 1, 1, 1],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ],
    crops: ["tomato", "basil", "sunflower"],
    swaps: [
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 0],
    ],
  };
  {
    const C = D14.CHOOSE;
    C.adaRow = C.names.filter((_, j) => C.adj[0][j]);
    C.tomato = C.names.filter((_, i) => C.swaps[i][0]);
    same("CHOOSE: Ada's neighbours", C.adaRow, ["Ben", "Cy", "Dot"]);
    same("CHOOSE: who swapped tomato", C.tomato, ["Ada", "Cy", "Dot"]);
  }
})();
