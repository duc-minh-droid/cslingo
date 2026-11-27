/* Data Science Lecture 14 workshop (14.W): pack Sprout's swap sheet. Tap cells on and off, watch sparsity, and see the
   same sheet as a dictionary of keys, a coordinate list, CSR and CSC. No code, no typing. */
(function () {
  const S = NIC.shared.ds14;
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, seg, stats, setStats, arr, formats, csrView } = S;

  const R = 4,
    C = 6;
  const val = (r, c) => (((r * C + c) * 7) % 9) + 1;
  const START = [
    [1, 1, 0, 1, 0, 1],
    [0, 1, 1, 0, 1, 0],
    [1, 0, 1, 1, 0, 1],
    [0, 1, 0, 1, 1, 0],
  ];

  function sandbox(stage, api) {
    let on = START.map((r) => [...r]),
      view = "dok",
      row = "none";
    const seen = new Set();
    const box = el(
      `<div class="wk-card"><h3>Sprout's swap sheet (4 members × 6 packets)</h3><p class="fig-cap">Tap a cell to switch it between 0 and a swap count.</p><div class="ds14-sheet" data-g></div>${stats(
        [
          ["blue", "Non-zeros"],
          ["amber", "Sparsity"],
        ],
      )}<div class="controls" data-v></div><div class="controls" data-r></div><div class="ds14-out" data-o></div><div class="fig-cap" data-c></div></div>`,
    );
    stage.append(box);
    const $ = (s) => qs(s, box);
    const M = () => on.map((r, i) => r.map((x, j) => (x ? val(i, j) : 0)));

    const draw = () => {
      const m = M(),
        f = formats(m),
        nnz = f.nz.length,
        sp = Math.round(((R * C - nnz) / (R * C)) * 100),
        rr = row === "none" ? -1 : +row;
      $("[data-g]").innerHTML = m
        .map((r, i) =>
          r
            .map(
              (v, j) =>
                `<button class="ds14-cell ${v ? "on" : ""} ${view === "csr" && i === rr ? "row" : ""}" data-rc="${i},${j}" aria-label="Member ${i}, packet ${j}: ${v}">${v}</button>`,
            )
            .join(""),
        )
        .join("");
      setStats(box, [nnz, `${sp}%`]);
      let out;
      if (view === "dok")
        out = `<p><b>Dictionary of keys</b></p><p class="ds14-code">${f.nz.map(([r, c, v]) => `(${r},${c}): ${v}`).join("&nbsp; ") || "(empty)"}</p>`;
      else if (view === "coo")
        out = `<p><b>Coordinate list</b></p><p class="ds14-code">${f.nz.map(([r, c, v]) => `(${r}, ${c}, ${v})`).join("&nbsp; ") || "(empty)"}</p>`;
      else if (view === "csr") {
        const a = rr < 0 ? 0 : f.ROW[rr],
          z = rr < 0 ? 0 : f.ROW[rr + 1],
          inS = (i) => (i >= a && i < z ? "teal" : "");
        out = `<p><b>CSR</b></p>${arr("V", f.V, inS)}${arr("COL_INDEX", f.COL, inS)}${arr("ROW_INDEX", f.ROW, (i) => (rr >= 0 && (i === rr || i === rr + 1) ? "violet" : ""))}`;
      } else out = `<p><b>CSC</b></p>${arr("VALUES", f.cV)}${arr("ROW_INDEX", f.cROW)}${arr("COL_PTR", f.cPTR)}`;
      $("[data-o]").innerHTML = out;
      $("[data-r]").style.display = view === "csr" ? "" : "none";
      $("[data-c]").innerHTML =
        view === "csr" && rr >= 0
          ? `Row ${rr}: slice ${f.ROW[rr]} to ${f.ROW[rr + 1]} → ${f.ROW[rr] === f.ROW[rr + 1] ? "<b>empty</b>: an all-zero row" : `values <b>${f.V.slice(f.ROW[rr], f.ROW[rr + 1]).join(", ")}</b> in columns <b>${f.COL.slice(f.ROW[rr], f.ROW[rr + 1]).join(", ")}</b>`}.`
          : `${nnz} non-zeros out of ${R * C} cells: <b>${sp >= 75 ? "sparse" : sp >= 50 ? "half empty" : "dense"}</b>.`;

      /* missions */
      if (sp >= 75 && nnz >= 3 && api.done("thin"))
        api.say(`Sparsity ${sp}%: most of the sheet is now 0. That is a sparse matrix.`, "happy");
      if (seen.size === 4 && api.done("formats"))
        api.say("Same sheet, four notebooks. Each one keeps only the non-zeros.", "love");
      const empty = f.ROW.findIndex((x, i) => i < R && x === f.ROW[i + 1]);
      if (view === "csr" && empty >= 0 && api.done("empty"))
        api.say(`Row ${empty} has no non-zeros, so ROW_INDEX[${empty}] equals ROW_INDEX[${empty + 1}].`, "surprised");
      if (view === "csr" && rr >= 0 && f.ROW[rr] < f.ROW[rr + 1] && api.done("read"))
        api.say(`Row ${rr} rebuilt from two bookmarks and two slices.`, "happy");
    };

    $("[data-g]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-rc]");
      if (!b) return;
      const [i, j] = b.dataset.rc.split(",").map(Number);
      on[i][j] = on[i][j] ? 0 : 1;
      draw();
    });
    seg($("[data-v]"), "dok:Dictionary of keys|coo:Coordinate list|csr:CSR|csc:CSC", view, (v) => {
      view = v;
      seen.add(v);
      draw();
    });
    seg($("[data-r]"), "none:No row|0:Row 0|1:Row 1|2:Row 2|3:Row 3", row, (v) => {
      row = v;
      draw();
    });
    seen.add(view);
    draw();
  }

  reg({
    id: "ds14-lab",
    order: 90,
    workshop: true,
    num: "14.W",
    title: "Workshop: pack the swap sheet",
    blurb: "No code. Thin out Sprout's swap sheet and store it four different ways.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "Sprout's swap sheet is too full of numbers. Make it sparse, then pack it into every format you have met.",
        missions: [
          {
            id: "thin",
            t: "Thin it out",
            d: "Tap cells to switch them off until <b>Sparsity</b> reaches 75% or more, keeping at least 3 non-zeros.",
            hint: "24 cells in all: 6 or fewer non-zeros gives 75%.",
          },
          {
            id: "formats",
            t: "Try every notebook",
            d: "View the sheet as a <b>Dictionary of keys</b>, a <b>Coordinate list</b>, <b>CSR</b> and <b>CSC</b>.",
            hint: "Tap each of the four format buttons once.",
          },
          {
            id: "empty",
            t: "Make an empty row",
            d: "With <b>CSR</b> showing, switch off every cell in one row and watch ROW_INDEX.",
            hint: "Two neighbouring bookmarks in ROW_INDEX become equal.",
          },
          {
            id: "read",
            t: "Read a row back",
            d: "With <b>CSR</b> showing, pick a row that still has values and see its slice light up.",
            hint: "Use the <b>Row</b> buttons under the format buttons.",
          },
        ],
        build(stage, api) {
          sandbox(stage, api);
        },
      });
      root.appendChild(
        pr(
          "ds14-lab-1",
          "You switched on a cell in row 0 while CSR was showing. Which ROW_INDEX entries moved?",
          ["All of them except the first", "Only the entry for row 0", "None: ROW_INDEX never changes"],
          "A new value in row 0 slides every later value one place along V, so every bookmark after row 0's start goes up by one.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A sheet with mostly zeros is <b>sparse</b>; storing only its non-zeros saves space.",
            "<b>Dictionary of keys</b> and <b>coordinate list</b> keep each value with its (row, column).",
            "<b>CSR</b> and <b>CSC</b> pack the same values into three arrays, by row or by column.",
          ],
          "Store the something, skip the nothing.",
        ),
      );
    },
  });

  L["ds14-lab"] = {
    sum: "Thin out a swap sheet until it is sparse, then see it as a dictionary of keys, a coordinate list, CSR and CSC.",
    steps: [
      st(
        "What you will practise",
        "<p>Sprout's swap sheet has 4 members and 6 seed packets. You will switch cells off until the sheet is sparse, then pack it four ways: dictionary of keys, coordinate list, CSR and CSC. Last, you will read a row back from CSR, including an empty one.</p>",
        F.flow([
          { t: "Thin it", s: "make it sparse", c: "blue" },
          { t: "Pack it", s: "four formats", c: "teal" },
          { t: "Empty row", s: "equal bookmarks", c: "amber" },
          { t: "Read a row", s: "slice it back", c: "violet" },
        ]),
        mc(
          "Before you start: which cells does every sparse format leave out?",
          ["The zeros", "The largest values", "The first row"],
          "All the sparse formats store the non-zero values with their positions; a cell that is not stored is understood to be 0.",
        ),
      ),
      st(
        "One sheet, two directions",
        `<p>CSR reads the sheet row by row, CSC column by column. The values are the same; only the order and the bookmarks differ.</p>`,
        csrView(S.M9, -1, "The slides' 4 by 4 example in CSR"),
      ),
    ],
    guide: ["Work through the four missions in the workshop."],
  };
})();
