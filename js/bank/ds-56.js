/* js/bank/ds-56.js: Data Science lecture 14 revision questions, part 2: ds14-keys, ds14-csr and ds14-csc. */
(function () {
  const B = NIC.bank;
  const { mc, csrView } = NIC.shared.ds14;

  B.add("ds14-keys", [
    mc(
      "What does every sparse representation store?",
      [
        "Only the non-zero values, with their positions",
        "Every value, zeros included, in a list",
        "Only the positions of the zeros",
      ],
      "Skipping the zeros is the whole point; each kept value needs its position so the matrix can be rebuilt.",
    ),
    mc(
      "In a dictionary of keys, what is the key?",
      ["The (row, column) pair", "The value itself", "The row number alone"],
      "A dictionary of keys maps (row, column) to the value stored there.",
    ),
    mc(
      "A dictionary of keys has no entry for (3, 4). What is the value at row 3, column 4?",
      ["0", "Unknown", "The value of (3, 3)"],
      "Only non-zeros are stored, so a missing key means the cell is 0.",
    ),
    mc(
      "What does a coordinate list store?",
      [
        "A list of (row, column, value) tuples",
        "One list of values for each row",
        "A (row, column) key mapped to a value",
      ],
      "The coordinate list is a plain list of triples. Mapping (row, column) keys to values is the dictionary of keys.",
    ),
    {
      type: "match",
      q: "Match each format to an entry written in it.",
      pairs: [
        ["Dictionary of keys", "(1,5): 11.0"],
        ["Coordinate list", "(1, 5, 11.0)"],
      ],
      why: "DOK writes key: value; COO writes one triple with the value last.",
    },
    {
      type: "multi",
      q: "Select every true statement about the dictionary of keys and the coordinate list.",
      o: [
        "Both keep only the non-zero values",
        "Both record a row and a column for each value",
        "Both are sparse representations",
        "Both need three separate arrays",
      ],
      a: [0, 1, 2],
      why: "They hold the same information in different shapes. Three separate arrays is how CSR and CSC work.",
    },
  ]);

  B.add("ds14-csr", [
    {
      type: "match",
      q: "Match each CSR array to what it holds.",
      pairs: [
        ["V", "The non-zero values"],
        ["COL_INDEX", "The column of each non-zero"],
        ["ROW_INDEX", "Where each row starts in V"],
      ],
      why: "CSR uses three arrays: values, their columns, and row bookmarks.",
    },
    mc(
      "A matrix has m rows. How long is its ROW_INDEX?",
      ["m + 1", "m", "The number of non-zeros"],
      "One bookmark per row plus one at the end, marking where the last row stops.",
    ),
    {
      type: "order",
      q: "Put the steps to rebuild one row from CSR in order.",
      items: [
        "row_start = ROW_INDEX[row]",
        "row_end = ROW_INDEX[row + 1]",
        "Take V[row_start:row_end] as the values",
        "Take COL_INDEX[row_start:row_end] as their columns",
      ],
      why: "The two bookmarks set the slice; the slice of V gives the values and the same slice of COL_INDEX gives where they go.",
    },
    mc(
      "In CSR, why does a row not need its own “end” array?",
      [
        "A row ends where the next row starts",
        "Every row has the same number of values",
        "COL_INDEX already marks the row ends",
      ],
      "ROW_INDEX[row + 1] is both the next row's start and this row's end.",
    ),
    {
      type: "pick",
      q: "In this CSR picture, tap the row with <b>no</b> non-zeros.",
      fig:
        csrView(
          [
            [0, 6, 0],
            [0, 0, 0],
            [2, 0, 9],
          ],
          -1,
          "A 3 by 3 matrix with ROW_INDEX 0, 1, 1, 3",
        ) +
        `<div class="ds14-chiprow">${[
          ["r1", "Row 1"],
          ["r0", "Row 0"],
          ["r2", "Row 2"],
        ]
          .map(([k, t]) => `<span class="ds14-pick" data-pick="${k}">${t}</span>`)
          .join("")}</div>`,
      a: "r1",
      hint: "Find two neighbouring ROW_INDEX entries that are equal.",
      why: "ROW_INDEX[1] and ROW_INDEX[2] are both 1, so row 1's slice is empty: all zeros.",
    },
    mc(
      "In which order does CSR copy the non-zero values into V?",
      ["Row by row, left to right", "Column by column, top to bottom", "From the largest value to the smallest"],
      "CSR reads the matrix like a book, row by row. Column by column is CSC.",
    ),
  ]);

  B.add("ds14-csc", [
    mc(
      "How is CSC related to CSR?",
      [
        "It is the same idea, built column by column",
        "It stores every zero as well",
        "It keeps a dictionary of (row, column) keys",
      ],
      "Compressed sparse column is CSR's sibling: values, their rows, and column bookmarks.",
    ),
    {
      type: "match",
      q: "Match each CSC array to what it holds.",
      pairs: [
        ["VALUES", "The non-zeros, column by column"],
        ["ROW_INDEX", "The row of each non-zero"],
        ["COL_PTR", "Where each column starts"],
      ],
      why: "CSC mirrors CSR with rows and columns swapped.",
    },
    mc(
      "Which operations does CSR make fast?",
      ["Row operations", "Column operations", "Adding new columns"],
      "CSR keeps each row's values together, so rows are fast and columns are slow.",
    ),
    {
      type: "cat",
      q: "Which format suits each job?",
      buckets: ["CSR", "CSC"],
      items: [
        ["Listing every node's neighbours in a graph", 0],
        ["Many matrix-vector products A × x", 0],
        ["Fast slicing of whole rows", 0],
        ["A huge sparse dataset with many categorical features", 1],
        ["Fetching every value in one feature column", 1],
      ],
      why: "Row work (graphs, row slicing, A × x) fits CSR; column work (categorical features) fits CSC.",
    },
    mc(
      "In a graph stored as CSR, what does one row hold?",
      ["The neighbours of one node", "Every edge in the graph", "The number of nodes"],
      "Each row corresponds to one node, and its non-zeros mark that node's neighbours.",
    ),
    mc(
      "A model keeps asking for one whole column of a huge sparse table at a time. Which format is the better fit?",
      ["CSC", "CSR", "A dense grid"],
      "CSC gives fast column operations; CSR would have to look through every row.",
    ),
  ]);
})();
