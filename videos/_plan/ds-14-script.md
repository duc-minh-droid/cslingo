# ds-14 recap video script: Tensors

**Purpose:** show what tensors are (numbers arranged in more and more directions), what shape real data takes, and how a mostly-zero tensor is stored by keeping only its non-zeros (dictionary of keys, coordinate list, CSR and CSC).

**Target length:** about 2 minutes silent (title 4 s + nine scenes, 111 s + recap 9 s = 124 s), about 4 minutes narrated.

**Running example (from the lessons):** Sprout, a neighbourhood seed-swap app: the greenhouse thermometer (18 degrees), one member's ratings 3, 5, 1, 4, the sweet pea packet's profile card, the soil sensor, seedling photos, a sunflower time-lapse, and the swap sheet (one row per member, one column per seed packet, mostly zeros). The storage scenes use the slides' own small matrices, kept exactly as in the lessons.

**Source lessons:** 14.1 ds14-orders and 14.2 ds14-shapes (`js/content/ds/ds-l14-01.js`), 14.3 ds14-sparse and 14.4 ds14-keys (`ds-l14-02.js`), 14.5 ds14-csr and 14.6 ds14-csc (`ds-l14-03.js`). Workshop 14.W "Workshop: pack the swap sheet" (`ds-l14-workshop.js`).

**Colour roles (whole video):**
- **grey**: zeros (faint cells), grid lines, axes, arrows, plain labels.
- **blue**: stored values (the numbers in a vector, matrix or tensor, the non-zeros, the V / VALUES array).
- **orange**: positions (row and column numbers, keys, COL_INDEX in CSR, ROW_INDEX in CSC, the names of the directions).
- **purple**: bookmarks and directions (ROW_INDEX in CSR, COL_PTR in CSC, the index arrows that show the order).
- **green**: the answer (a row or column read back, the smaller store, a tick).
- **red**: waste (storing every zero, the dense list that is bigger than the grid, a size too big to store).

---

## Title card (4 s)
- Kicker: `DATA SCIENCE · LECTURE 14`
- Title: `Tensors`
- Sub-line: `One number, a row, a grid, a pile of grids`
- SPOKEN (at 0.9 s): "Lecture fourteen. Tensors. How data is arranged in boxes of numbers, and how to store the ones that are mostly empty."

---

## Scene 2 · `scene-02-orders.js` · 14 s
- Kicker: `THE ORDER OF A TENSOR`
- Headline: `Count the indices` / `you need to find one value`
- VISUAL: One figure grows in place, with a counter "order 0 / 1 / 2 / 3" and purple index arrows. At 0.5 a single blue cube "18°" (the greenhouse thermometer): label "scalar · 0 indices". At 3.0 it becomes a row of four blue cubes 3, 5, 1, 4 with one purple arrow along the row: "vector · 1 index". At 5.8 two more rows drop in below, making the 3 by 4 grid [3 5 1 4 / 2 0 4 1 / 0 3 5 2] with a second purple arrow down the side: "matrix · 2 indices (row, column)". At 8.8 two more copies of the grid slide in behind it, offset, in purple and green-tinted outlines, making a pile of three; a third purple arrow into the depth: "3-order tensor · 3 indices (grid, row, column)".
- CAPTIONS:
  - [0.4, 2.8] "Sprout's thermometer: 18°. One number is a scalar."
  - [3.0, 5.6] "One member's ratings, 3, 5, 1, 4: a vector."
  - [5.8, 8.6] "Rows under rows: a matrix. Two indices find a value."
  - [8.8, 13.7] "A pile of grids is a 3-order tensor: three indices."
- SPOKEN:
  1. "Meet Sprout, a seed-swap app. Its greenhouse thermometer shows one number, eighteen degrees. A single number is a scalar, a tensor of order zero."
  2. "One member's ratings for four seed packets, three, five, one and four, make a row. That is a vector, order one: one index finds a value."
  3. "Put every member's row under the next, and you get a matrix, order two. Now you need a row and a column."
  4. "Stack several grids into a pile, and you have a tensor of order three. The order is simply how many indices you need to point at one value."

## Scene 3 · `scene-03-shapes.js` · 14 s
- Kicker: `THE SHAPES OF DATA`
- Headline: `Name the directions,` / `and you know the shape`
- VISUAL: Four panels build left to right, top to bottom (each ~3 s), each with its shape label in orange underneath. Panel 1 at 0.5: a "Sweet pea packet" card with four blue cubes 180, 10, 150, 7 labelled "height (cm)", "days to sprout", "price (p)", "swaps"; label "features". Panel 2 at 3.4: a 2 by 6 grid, rows "moisture" (31 30 28 26 25 29) and "soil °C" (14 15 17 19 18 16), columns 6am, 9am, 12pm, 3pm, 6pm, 9pm, a new column sliding in on the right each beat; label "features × timestamps". Panel 3 at 6.6: three stacked tinted rectangles red, green, blue (the photo's colour channels); label "width × height × channels". Panel 4 at 9.6: four photos in a row "frame 1..4", each a little RGB stack; label "frames × width × height × channels"; a small order badge "order 4".
- CAPTIONS:
  - [0.4, 3.2] "A packet's features: one vector."
  - [3.4, 6.4] "Sensor readings: features × timestamps, a matrix."
  - [6.6, 9.4] "A photo: width × height × channels (RGB)."
  - [9.6, 13.7] "A video: frames × width × height × channels."
- SPOKEN:
  1. "Each seed packet has a profile card: height, days to sprout, price and swaps. A list of features like this is vector data."
  2. "The soil sensor records moisture and temperature again and again. A time series has the shape features by timestamps, a matrix."
  3. "A photo is three grids, one for each colour channel, red, green and blue. Its shape is width by height by channels."
  4. "A time-lapse video is a pile of photos, one per frame. So its shape is frames by width by height by channels, a tensor of order four."

## Scene 4 · `scene-04-sparse.js` · 13 s
- Kicker: `SPARSE OR DENSE`
- Headline: `Mostly zeros,` / `or mostly filled`
- VISUAL: Sprout's 8 by 8 swap sheet (rows = members, columns = seed packets), all 64 cells grey "0". At 0.5 six cells fill with blue values 1 to 3, one by one; counters on the right: "Non-zero cells 6", "Sparsity 91%" (orange), label "sparse: mostly 0". At 4.2 two storage bars appear under the counters: red bar "Full grid stores 64 numbers", green bar "List of non-zeros stores 18 numbers" (3 per non-zero: row, column, value). At 7.6 the sheet fills fast up to 52 non-zero cells; counters run to "52" and "Sparsity 19%", label "dense: mostly filled"; the list bar grows past the grid bar to "156 numbers" and turns red, the grid bar turns green.
- CAPTIONS:
  - [0.4, 4.0] "Sprout's swap sheet: 6 non-zeros of 64. Sparsity 91%."
  - [4.2, 7.4] "Listing only the non-zeros: 18 numbers instead of 64."
  - [7.6, 10.2] "Fill it to 52: dense, sparsity 19%."
  - [10.4, 12.7] "Now the list, 156 numbers, is bigger than the grid."
- SPOKEN:
  1. "Sprout's swap sheet has one row per member and one column per seed packet. Only six of its sixty-four cells are not zero. Sparsity, the share of zeros, is ninety-one percent."
  2. "Writing down only the non-zeros, each with its row, column and value, takes eighteen numbers instead of sixty-four."
  3. "Now fill the sheet to fifty-two values. Most cells hold something, so it is dense, with a sparsity of nineteen percent."
  4. "This time the list needs one hundred and fifty-six numbers, more than the plain grid. Keeping only the non-zeros pays off when a tensor is sparse."

## Scene 5 · `scene-05-toobig.js` · 11 s
- Kicker: `WHY IT MATTERS`
- Headline: `Real data is full of gaps,` / `and too big to write out`
- VISUAL: At 0.5 a small social graph: six grey-outlined member circles A to F; five grey links draw in one by one (A-B, B-C, C-D, E-F, B-E); label "6 members, 5 links out of 15 possible". At 3.4 a small grey sensor icon with a strip of readings "0 0 0 0 0 0 1 0 0 0" (blue 1): label "fault sensors: almost always 0". At 5.8 both slide aside; a big red square "every cell: n × n numbers" grows with a counter "n ≈ 1,000,000 → a million million cells, 64-bit each"; at 8.0 a grey arrow to a small green box "non-zeros only: about n entries".
- CAPTIONS:
  - [0.4, 3.2] "A social graph: 5 links out of 15 possible."
  - [3.4, 5.6] "Fault sensors report 0 almost all the time."
  - [5.8, 7.8] "n ≈ a million: a million million cells. Too big to store."
  - [8.0, 10.7] "Keep only the non-zeros instead."
- SPOKEN:
  1. "Real data is often very sparse. In this social graph, six members have only five of the fifteen possible links."
  2. "Fault detection sensors report no fault, a zero, almost all of the time."
  3. "Now picture a matrix with about a million rows and a million columns. That is a million million cells, and storing every one as a sixty-four bit number is prohibitive."
  4. "When a tensor is sparse, we store only the non-zeros, and the memory problem goes away."

## Scene 6 · `scene-06-keys.js` · 13 s
- Kicker: `DICTIONARY OF KEYS AND COORDINATE LIST`
- Headline: `Keep the values,` / `remember where they live`
- VISUAL: At 0.5 the slides' 4 by 4 matrix with orange row and column numbers 0 to 3 along the edges: [5 0 0 0 / 0 8 0 0 / 0 0 3 0 / 0 6 0 0]; zeros grey, the four non-zeros pulse blue; label "anything not listed is 0". At 3.2 the matrix shrinks left; on the right a list builds row by row (0.5 s apart), header "dictionary of keys": orange key, grey arrow, blue value: "(0,0) → 1.0", "(0,2) → 5.0", "(1,1) → 3.0", "(1,5) → 11.0", "…" (the slides' example). At 6.0 the key "(1,5)" is looked up: a magnifier hops onto it and "11.0" glows green; a missing key "(1,4)" is tried and returns grey "0". At 8.8 the list morphs into the header "coordinate list" with rows "(0, 0, 1.0)", "(0, 2, 5.0)", "(1, 1, 3.0)", "(1, 5, 11.0)", "…" (orange row and column, blue value).
- CAPTIONS:
  - [0.4, 3.0] "Store only the non-zeros, each with its position."
  - [3.2, 5.8] "Dictionary of keys: (row, column) → value."
  - [6.0, 8.6] "Look up key (1, 5): 11.0. A missing key means 0."
  - [8.8, 12.7] "Coordinate list: a list of (row, column, value) tuples."
- SPOKEN:
  1. "A sparse representation stores only the non-zero values, each with its position. Anything not written down is understood to be zero."
  2. "A dictionary of keys uses the pair row and column as the key, and maps it to the value."
  3. "To read row one, column five, look up that key and get eleven. A key that is missing means the cell is zero."
  4. "A coordinate list holds the same information as a plain list of triples: row, column and value, one after another."

## Scene 7 · `scene-07-csr.js` · 13 s
- Kicker: `COMPRESSED SPARSE ROW`
- Headline: `Values, columns,` / `and bookmarks for each row`
- VISUAL: Left: the slides' 4 by 4 matrix [5 0 0 0 / 0 8 0 0 / 0 0 3 0 / 0 6 0 0] with orange row and column numbers. Right: three empty array rows labelled "V", "COL_INDEX", "ROW_INDEX". At 0.5 a reading cursor sweeps the matrix row by row, left to right; each time it hits a non-zero, the value flies into V (blue) and its column into COL_INDEX (orange): V = 5, 8, 3, 6 and COL_INDEX = 0, 1, 2, 1 (one pair every 0.7 s). At 4.8 purple bookmark ticks appear above V at positions 0, 1, 2, 3 and at the end (4), and ROW_INDEX fills in purple: 0, 1, 2, 3, 4. At 8.4 a purple brace under ROW_INDEX: "4 rows → 5 entries (m + 1)"; the last entry "4" pulses: "where the last row ends".
- CAPTIONS:
  - [0.4, 4.6] "Read row by row: V = 5, 8, 3, 6; COL_INDEX = 0, 1, 2, 1."
  - [4.8, 8.2] "ROW_INDEX marks where each row starts in V: 0, 1, 2, 3, 4."
  - [8.4, 12.7] "m rows need m + 1 bookmarks: the last marks the end."
- SPOKEN:
  1. "Compressed sparse row, or CSR, reads the matrix like a book, row by row. The non-zero values go into V: five, eight, three and six. Their columns go into column index: zero, one, two and one."
  2. "A third array, row index, holds bookmarks. Each entry says where that row starts in V. Here it is zero, one, two, three and four."
  3. "A matrix with m rows needs m plus one bookmarks. The extra one at the end marks where the last row stops."

## Scene 8 · `scene-08-readrow.js` · 14 s
- Kicker: `READING A ROW BACK`
- Headline: `Open at one bookmark,` / `stop at the next`
- VISUAL: The slides' 4 by 6 matrix [10 20 0 0 0 0 / 0 30 0 40 0 0 / 0 0 50 60 70 0 / 0 0 0 0 0 80] on the left; right, its arrays: V = 10, 20, 30, 40, 50, 60, 70, 80; COL_INDEX = 0, 1, 1, 3, 2, 3, 4, 5; ROW_INDEX = 0, 2, 4, 7, 8 (all on screen from 0.5). At 2.4 ROW_INDEX[2] = 4 and ROW_INDEX[3] = 7 glow purple: labels "start 4", "end 7". At 4.8 a green slice bracket covers positions 4 to 6 of V (50, 60, 70) and of COL_INDEX (2, 3, 4). At 7.0 the three values fly into row 2 of the matrix at columns 2, 3, 4; the row reads "0 0 50 60 70 0" with the zeros grey; green tick. At 9.6 the figure is replaced by a small 3 by 3 matrix [4 0 2 / 0 0 0 / 0 7 0] with ROW_INDEX = 0, 2, 2, 3: the two middle bookmarks "2, 2" glow purple, the slice between them is empty, the middle row is all grey zeros.
- CAPTIONS:
  - [0.4, 2.2] "Read row 2 of the slides' 4 × 6 matrix."
  - [2.4, 4.6] "Start = ROW_INDEX[2] = 4, end = ROW_INDEX[3] = 7."
  - [4.8, 6.8] "Slice V: 50, 60, 70 at columns 2, 3, 4."
  - [7.0, 9.4] "Row 2 is 0, 0, 50, 60, 70, 0."
  - [9.6, 13.7] "Equal bookmarks, 2 and 2: an empty slice, an all-zero row."
- SPOKEN:
  1. "Now read one row back from CSR. Take row two of the slides' four by six matrix."
  2. "Its start is row index at two, which is four. Its end is row index at three, which is seven."
  3. "Slice V from four up to seven: fifty, sixty and seventy. Column index gives their columns: two, three and four."
  4. "So row two is zero, zero, fifty, sixty, seventy, zero. Every other cell is zero."
  5. "If two neighbouring bookmarks are equal, like two and two here, the slice is empty, and that row holds only zeros."

## Scene 9 · `scene-09-csc.js` · 11 s
- Kicker: `COMPRESSED SPARSE COLUMN`
- Headline: `The same trick,` / `turned on its side`
- VISUAL: Left: the slides' 4 by 4 matrix [10 0 0 0 / 0 5 0 0 / 0 0 7 0 / 2 0 0 9]. Right: three array rows "VALUES", "ROW_INDEX", "COL_PTR". At 0.5 a cursor sweeps column by column, top to bottom; non-zeros fly into VALUES (blue) and their rows into ROW_INDEX (orange): VALUES = 10, 2, 5, 7, 9; ROW_INDEX = 0, 3, 1, 2, 3. At 4.6 COL_PTR fills in purple: 0, 2, 3, 4, 5. At 7.0 column 0 is read back: COL_PTR[0] = 0 and COL_PTR[1] = 2 glow purple, a green slice covers 10 and 2, and they land in column 0 at rows 0 and 3; green tick.
- CAPTIONS:
  - [0.4, 4.4] "CSC reads column by column: VALUES = 10, 2, 5, 7, 9."
  - [4.6, 6.8] "COL_PTR marks where each column starts: 0, 2, 3, 4, 5."
  - [7.0, 10.7] "Column 0: from 0 to 2, so 10 at row 0 and 2 at row 3."
- SPOKEN:
  1. "Compressed sparse column, or CSC, is CSR's sibling. It reads the matrix top to bottom, one column at a time. The values are ten, two, five, seven and nine, and row index stores the row of each one."
  2. "Column pointer holds the bookmarks where each column starts: zero, two, three, four and five."
  3. "To read column zero, slice from zero up to two. That gives ten in row zero, and two in row three."

## Scene 10 · `scene-10-choose.js` · 12 s
- Kicker: `CSR OR CSC`
- Headline: `Store it` / `the way you will read it`
- VISUAL: Two cards side by side. Left blue card at 0.5, header "CSR: fast rows": a mini graph where node "Ada" links to "Ben", "Cy" and "Dot"; at 1.6 Ada's row in a small sparse grid glows green and reads "Ben, Cy, Dot" ("row of Ada = Ada's neighbours"). At 3.6 under it two grey tags: "row slicing", "many A × x products" with a small sweep showing x multiplied row by row. Right orange card at 6.2, header "CSC: fast columns": a wide sparse table with columns "tomato", "basil", "sunflower" and 1s scattered; at 7.2 the "tomato" column glows green: "who swapped it". At 9.4 a grey tag "many categorical features"; a small red label under CSR's card "slow for one column".
- CAPTIONS:
  - [0.4, 3.4] "CSR: fast row operations. A graph row is one node's neighbours."
  - [3.6, 6.0] "Good for row slicing and many A × x products."
  - [6.2, 9.2] "CSC: fast column operations, like 'who swapped tomato?'"
  - [9.4, 11.7] "Good for huge datasets with many categorical features."
- SPOKEN:
  1. "Which notebook should Sprout pick? CSR makes row operations fast. In the swap graph, Ada's row is simply her neighbours, Ben, Cy and Dot."
  2. "So CSR suits fast row slicing, and many matrix times vector products, which work through the matrix row by row."
  3. "CSC makes column operations fast. A question like who swapped tomato reads a single column."
  4. "So CSC suits huge sparse datasets with many categorical features."

---

## Recap card (9 s)
Rows slide in at 0.8 / 1.9 / 3.0 s; tag "Next: Workshop 14.W" at about 4.2 s.
1. **Order = how many indices find one value** · purple · pictogram: a cube, a row, a grid and a pile of grids, growing left to right.
2. **Sparse: mostly zeros, so store only the non-zeros** · blue · pictogram: a faint grid with three blue cells and an arrow to a short list.
3. **CSR for rows, CSC for columns** · green · pictogram: three small arrays (blue, orange, purple) with one row highlighted, next to one column highlighted.
- SPOKEN ("at" 0.9 / 2.0 / 3.1):
  1. "A tensor's order is how many indices you need to find one value."
  2. "A sparse tensor is mostly zeros, so we keep only the non-zeros and their positions."
  3. "CSR stores values row by row with bookmarks, and CSC does the same by columns. Next: Workshop fourteen W."

## Chapters
1. Scalars, vectors, matrices, tensors
2. The shapes of real data
3. Sparse or dense
4. Real data is full of gaps
5. Dictionary of keys and coordinate list
6. Compressed sparse row
7. Reading a row back
8. Compressed sparse column
9. CSR or CSC?
