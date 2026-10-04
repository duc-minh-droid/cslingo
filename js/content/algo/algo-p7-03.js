(function () {
  const partScope = (NIC.shared.algoP7 = NIC.shared.algoP7 || {});
  const { table } = partScope;
  const N = NIC;
  const L = N.LESSONS;

  L["a7-lzw"] = {
    sum: "LZW needs no table sent with the message: encoder and decoder grow the <b>same</b> dictionary from the data itself.",
    steps: [
      {
        t: "The shared-dictionary trick",
        b: `<p>Huffman must send its frequency table along with the data. LZW (Lempel–Ziv–Welch) sends <b>nothing</b> — yet both sides build identical dictionaries.</p><p>Start from a shared initial alphabet (each letter gets a code). <b>Encoder:</b> find the longest w already in the dict; when w+c isn't there, emit code(w) and <b>add w+c</b>. <b>Decoder:</b> each code outputs a string; then <b>add (previous output + first char of current)</b>. Same stream, same order → same entries at the same positions.</p>`,
        c: {
          q: "Why must decoding start at the beginning?",
          o: [
            "Because the codes are stored in order",
            "Dictionary entries are built from earlier outputs",
            "It doesn't: any code can be decoded alone",
          ],
          a: 1,
          why: "The dictionary is cumulative state. Huffman's fixed codebook allows mid-stream decoding; LZW's doesn't.",
        },
      },
      {
        t: "Encoder: longest match wins",
        b: `<p>BANANABANDANA with alphabet A,B,N,D (codes 0–3; new entries start at 4):</p>`,
        v: table(
          ["w", "c", "action"],
          [
            ["B", "A", "BA new → emit B(1), add BA→4"],
            ["A", "N", "AN new → emit A(0), add AN→5"],
            ["N", "A", "NA new → emit N(2), add NA→6"],
            ["AN", "A", "ANA new → emit AN(5), add ANA→7"],
            ["…", "", "full stream: <b>1, 0, 2, 5, 0, 4, 2, 3, 7</b> — 9 codes for 13 chars"],
          ],
          720,
        ),
      },
      {
        t: "Decoder rebuilds the same table",
        b: `<p>Receiving 1,0,2,5,… with only the alphabet: code 1→B, 0→A (add BA→4), 2→N (add AN→5), 5→AN (add NA→6). Same entries, same numbers — <b>synchronised</b>.</p><span class="key">The dictionary is derived from the data itself: nothing to transmit, but both sides must stay in perfect sync.</span>`,
      },
      {
        t: "The missing-entry case",
        b: `<p>Encode <code>AAA</code>: the encoder emits <b>0, 1</b> — but entry 1 ("AA") was <i>just</i> created and instantly reused, so it reaches the decoder before the decoder has built it.</p><p>Rule: an unknown code = <b>previous output + its own first character</b>: A + A = AA ✓. This happens exactly for immediately-repeating patterns (<code>XYXY…</code>).</p>`,
        c: {
          q: "A code arrives one slot past the dictionary. The entry must be…",
          o: [
            "impossible, so the stream must be corrupt",
            "previous output + its own first character",
            "previous output + its own last character",
          ],
          a: 1,
          why: "p + last(p) is the classic wrong guess. The entry is the one the encoder just added and reused.",
        },
      },
      {
        t: "Huffman vs LZW: different redundancy",
        b: `<p>Huffman exploits <b>which symbols</b> appear (skewed frequencies). LZW exploits <b>which sequences</b> repeat — "BANANA" compresses regardless of letter frequencies.</p>`,
        v: table(
          ["", "Huffman", "LZW"],
          [
            ["Learns", "symbol probabilities", "repeated sequences"],
            ["Model sent?", "yes — tree/frequencies", "no — rebuilt on the fly"],
            ["Decode mid-stream?", "yes (fixed codebook)", "no (state-dependent)"],
            ["Corruption", "boundary desync, may resync", "dictionary diverges — damage grows"],
            ["Shines on", "skewed symbols", "repeated phrases, GIF palettes"],
          ],
          720,
        ),
        c: {
          type: "cat",
          q: "Huffman learns which <i>symbols</i> are common. LZW learns which <i>sequences</i> repeat. Which compresses each message better?",
          buckets: ["Huffman does better", "LZW does better"],
          items: [
            ["Letters used very unevenly, with no phrase ever repeated", 0],
            ["Every letter equally common, but one long phrase repeats again and again", 1],
            ["One symbol makes up 90% of a message of otherwise unrelated symbols", 0],
            ["A log file where the same long lines repeat over and over", 1],
          ],
          hint: "Ask where the redundancy lives: in how often each symbol appears, or in which groups of symbols keep coming back.",
          why: "Huffman exploits skewed symbol frequencies. LZW exploits repeated sequences: a repeated phrase is the redundancy even when every letter is equally common, which is dictionary coding's home turf.",
        },
      },
    ],
    guide: [
      "Press <b>Step</b> repeatedly on BANANABANDANA: 13 chars → 9 codes. Watch each new dictionary entry appear.",
      "Switch to <b>Decode</b> and run: the dictionary rebuilds identically — it was never sent.",
      "Type AAA, press <b>Encode</b> (2 codes), then <b>Decode</b> — the <i>missing entry</i> row fires: prev + its own first char.",
      "Try a random string with no repeats — LZW can't compress what never repeats.",
    ],
  };
  /* ---------- lesson figures (added to steps that had text only) ---------- */
  const FG = NIC.fig;
  const addV = (id, i, v) => {
    if (L[id] && L[id].steps[i] && !L[id].steps[i].v) L[id].steps[i].v = v;
  };
  addV(
    "a7-entropy",
    1,
    `<table class="t" style="max-width:520px"><tr><th>symbol</th><th class="num">p</th><th class="num">surprise −log₂p</th><th class="num">p × surprise</th></tr>${[
      ["A", 0.5, 1],
      ["B", 0.25, 2],
      ["C", 0.125, 3],
      ["D", 0.125, 3],
    ]
      .map(
        ([s, p, b]) =>
          `<tr><td>${s}</td><td class="num">${p}</td><td class="num">${b} bits</td><td class="num">${(p * b).toFixed(3)}</td></tr>`,
      )
      .join("")}<tr class="hl"><td colspan="3"><b>entropy H</b></td><td class="num"><b>1.75</b></td></tr></table>`,
  );
  addV(
    "a7-entropy",
    2,
    FG.bars(
      [
        ["uniform (4 symbols)", 2, "violet", "max"],
        ["loaded die", 1.75, "teal"],
        ["always A", 0, "dim", "no surprise"],
      ],
      { max: 2, unit: " bits" },
    ),
  );
  addV(
    "a7-entropy",
    3,
    FG.compare(
      {
        title: "Ideal length (fractional)",
        c: "violet",
        body: "−log₂(0.2) = <b>2.32 bits</b>: you can't send a third of a bit",
      },
      {
        title: "Real codeword (whole bits)",
        c: "teal",
        body: "2 or 3 bits, so the average ends up <b>just above</b> H, never below it",
      },
    ),
  );
  addV(
    "a7-entropy",
    4,
    FG.cells([
      { v: "I", sub: "4", c: "teal" },
      { v: "S", sub: "4", c: "teal" },
      { v: "P", sub: "2", c: "violet" },
      { v: "M", sub: "1", c: "amber" },
    ]) +
      FG.bars(
        [
          ["MISSISSIPPI", 1.823, "teal", "bits/letter"],
          ["uniform over 4", 2, "violet"],
        ],
        { max: 2, fmt: (v) => v.toFixed(2) },
      ),
  );
  addV(
    "a7-huffman",
    0,
    FG.compare(
      {
        title: "Prefix-free ✓",
        c: "teal",
        body: "A=0 · B=10 · C=110 · D=111<br><code>010110</code> → 0|10|110 = <b>ABC</b>, only one reading",
      },
      {
        title: "Not prefix-free ✗",
        c: "rose",
        body: "A=0 · B=01<br><code>01</code> could be <b>B</b>, or A then something else",
      },
    ),
  );
  addV(
    "a7-huffman",
    2,
    FG.bars(
      [
        ["A (.35) depth 2", 0.7, "teal", "bits/symbol × p"],
        ["E (.08) depth 3", 0.24, "amber"],
        ["E at depth 2 instead?", 0.16, "dim", "would force A deeper"],
      ],
      { max: 0.8, fmt: (v) => v.toFixed(2) },
    ) + `<div class="fig-cap">Deep = expensive. Give the deepest spots to the symbols that appear least.</div>`,
  );
  addV(
    "a7-huffman",
    3,
    FG.cells(
      [
        { v: "A 00", c: "teal" },
        { v: "B 01", c: "teal" },
        { v: "C 10", c: "teal" },
        { v: "D 110", c: "violet" },
        { v: "E 111", c: "violet" },
      ],
      { size: 60 },
    ) +
      FG.bars(
        [
          ["Huffman average", 2.2, "teal", "bits"],
          ["entropy floor", 2.153, "violet"],
        ],
        { max: 2.4, fmt: (v) => v.toFixed(2) },
      ),
  );
  addV(
    "a7-huffman",
    4,
    FG.compare(
      {
        title: "Huffman",
        c: "teal",
        body: "learns <b>which symbols</b> are common. Needs frequencies up front, and the table travels with the message.",
      },
      {
        title: "LZW",
        c: "violet",
        body: "learns <b>which sequences repeat</b>. Builds its table on the fly, and sends no table at all.",
      },
    ),
  );
  addV(
    "a7-lzw",
    0,
    FG.flow([
      { t: "shared alphabet", s: "A B N D → 0 1 2 3" },
      { t: "encoder", s: "longest known match", c: "violet" },
      { t: "codes only", s: "no table sent" },
      { t: "decoder", s: "rebuilds same table", c: "teal" },
    ]),
  );
  addV(
    "a7-lzw",
    2,
    `<table class="t" style="max-width:480px"><tr><th>receive</th><th>output</th><th>decoder adds</th></tr><tr><td class="mono">1</td><td>B</td><td class="faint">—</td></tr><tr><td class="mono">0</td><td>A</td><td class="mono">4 = BA</td></tr><tr><td class="mono">2</td><td>N</td><td class="mono">5 = AN</td></tr><tr class="hl"><td class="mono">5</td><td>AN</td><td class="mono">6 = NA</td></tr></table><div class="fig-cap">Same numbers the encoder created, in the same order: the two sides stay in sync.</div>`,
  );
  addV(
    "a7-lzw",
    3,
    FG.frames([
      { t: "Encoder reads A, then AA is new → emit 0, add AA = 1", v: FG.cells([{ v: "0", c: "teal" }]) },
      { t: "…then immediately uses AA → emit 1", v: FG.cells([{ v: "0" }, { v: "1", c: "amber" }]) },
      {
        t: "Decoder gets 1 before it has built it → rule: previous + its first char = A + A",
        v: FG.cells([{ v: "A" }, "+", { v: "A", c: "amber" }, "=", { v: "AA", c: "teal" }]),
      },
    ]),
  );

  /* ---------- step-through runners (NIC.fig.run) ---------- */
})();
