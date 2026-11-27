/* Data Science Lecture 14 (tensors and sparse tensors): the boss quiz. New scenario: Tidepool, a small music-streaming
   service with listeners, songs, album covers and music videos. */
(function () {
  const S = NIC.shared.ds14;
  const { csrView } = S;
  const chips = (list) =>
    `<div class="ds14-chiprow">${list.map(([k, t]) => `<span class="ds14-pick" data-pick="${k}">${t}</span>`).join("")}</div>`;

  NIC.registerBoss({
    id: "ds14-boss",
    subject: "ds",
    lecture: 14,
    title: "Lecture 14 boss quiz",
    blurb: "Ten questions set at a music-streaming service: tensor orders and shapes, sparsity, and sparse formats.",
    lede: "A new scenario: <b>Tidepool</b> streams music. It stores listeners, songs, album covers and music videos, and its “who played what” table is almost entirely zeros. Help it store everything sensibly.",
    qs: [
      {
        type: "match",
        q: "Match each Tidepool record to its kind of tensor.",
        pairs: [
          ["Scalar (0-order)", "Today's total number of plays"],
          ["Vector (1-order)", "One song's list of features"],
          ["Matrix (2-order)", "A table of listeners against songs"],
          ["3-order tensor", "A colour album cover"],
        ],
        why: "One number is a scalar; a list is a vector; a grid of rows and columns is a matrix; an RGB image is width × height × channels, a 3-order tensor.",
      },
      {
        type: "cat",
        q: "Which shape does each Tidepool dataset have?",
        buckets: ["features × timestamps", "width × height × channels", "frames × width × height × channels"],
        items: [
          ["A listener's plays per hour, tracked all week", 0],
          ["A server's CPU and memory, logged every minute", 0],
          ["An album cover", 1],
          ["An artist's profile photo", 1],
          ["A music video", 2],
          ["A short animated loop shown on the home screen", 2],
        ],
        why: "Readings repeated over time are a time series (features × timestamps). One picture is width × height × channels. A video is a sequence of pictures, adding frames.",
      },
      {
        type: "mcq",
        q: "Tidepool has millions of listeners and songs, but each listener plays only a few hundred songs. What is its “listener × song plays” table?",
        o: ["Sparse", "Dense", "A scalar", "A time series"],
        a: 0,
        why: "Nearly every cell is 0 (a song that listener never played), so the table is sparse, and its sparsity (the proportion of zeros) is very high.",
      },
      {
        type: "multi",
        q: "Select every true statement about storing Tidepool's plays table.",
        o: [
          "Storing every cell as a 64-bit value could be prohibitive",
          "A sparse representation keeps only the non-zero values",
          "Sparsity is the proportion of zero-valued elements",
          "A dense table is one where most elements are 0",
          "Zeros must always be stored to keep the positions",
        ],
        a: [0, 1, 2],
        why: "A huge table of 64-bit cells can be far too big; sparse formats store only the non-zeros with their positions, and sparsity measures the share of zeros. A dense table has mostly non-zeros, and positions are stored with the values, not by keeping the zeros.",
      },
      {
        type: "match",
        q: "Match each storage format to how it records Tidepool's plays.",
        pairs: [
          ["Dictionary of keys", "(listener, song) → plays"],
          ["Coordinate list", "A list of (listener, song, plays) tuples"],
          ["CSR", "Values, their columns, and where each row starts"],
          ["CSC", "Values, their rows, and where each column starts"],
        ],
        why: "DOK maps a (row, column) key to a value; COO lists (row, column, value) triples; CSR and CSC pack values into three arrays, bookmarked by row or by column.",
      },
      {
        type: "order",
        q: "Put the steps for reading one row back from CSR in order.",
        items: [
          "Read row_start = ROW_INDEX[row]",
          "Read row_end = ROW_INDEX[row + 1]",
          "Slice V from row_start to row_end for the values",
          "Slice COL_INDEX the same way for their columns",
        ],
        why: "The two bookmarks give the start and end; the same slice of V and COL_INDEX gives the row's values and their columns. Every other cell is 0.",
      },
      {
        type: "bug",
        q: "This function should return one row of a CSR matrix as (column, value) pairs. It always returns an empty list. Tap the faulty line.",
        code: [
          "def read_row(V, COL_INDEX, ROW_INDEX, row):",
          "    start = ROW_INDEX[row]",
          "    end = ROW_INDEX[row]",
          "    cols = COL_INDEX[start:end]",
          "    vals = V[start:end]",
          "    return list(zip(cols, vals))",
        ],
        a: 2,
        hint: "Where does a row stop?",
        why: "The row ends at the next bookmark: end = ROW_INDEX[row + 1]. With end equal to start, every slice is empty.",
      },
      {
        type: "pick",
        q: "Here is a small Tidepool table in CSR. Tap the row that has <b>no</b> plays at all.",
        fig:
          csrView(
            [
              [3, 0, 1, 0],
              [0, 2, 0, 0],
              [0, 0, 0, 0],
              [4, 0, 0, 5],
            ],
            -1,
            "A 4 by 4 table and its CSR arrays: ROW_INDEX is 0, 2, 3, 3, 5",
          ) +
          chips([
            ["r2", "Row 2"],
            ["r0", "Row 0"],
            ["r1", "Row 1"],
            ["r3", "Row 3"],
          ]),
        a: "r2",
        hint: "Look for two neighbouring ROW_INDEX entries that are equal.",
        why: "ROW_INDEX[2] and ROW_INDEX[3] are both 3, so row 2's slice is empty: it holds only zeros.",
      },
      {
        type: "mcq",
        q: "Tidepool's recommender repeatedly asks “which songs did this listener play?” and multiplies the plays table by a vector. Which format fits best?",
        o: ["CSR", "CSC", "A dense grid", "A scalar"],
        a: 0,
        why: "Both jobs work row by row: fetching one listener's row and matrix-vector products A × x. CSR gives fast row operations.",
      },
      {
        type: "mcq",
        q: "Tidepool's data team keeps a huge sparse table with one column per genre tag (thousands of categorical features) and mostly asks about one tag at a time. Which format fits best?",
        o: ["CSC", "CSR", "A dense grid", "A coordinate list"],
        a: 0,
        why: "Questions about one column want fast column operations, which is CSC's strength; the slides name huge sparse datasets with many categorical features as its use.",
      },
    ],
  });
})();
