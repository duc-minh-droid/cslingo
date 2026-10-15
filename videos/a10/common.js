/* Phase 10 · Transformers & Attention (video algo-10): the data and algorithms every scene shares (pure, no DOM, no randomness).
   Everything hangs off VID.a10; scenes start with  const A10 = VID.a10;  Drawing helpers are in common-2.js (tags, cells, discs,
   operator icons), common-3.js (sentence strips, arcs, heat grids, bars, the picture and its patch lattice). Every number below comes
   from running the real algorithm when the page loads and is asserted against the storyboard (videos/_plan/algo-10.json): a wrong
   number throws an Error with a clear message. The lesson data (embeddings, the dog-barked matrices, x = [1, 3, 5, 7], the German
   scores, the 224 pixel picture) is the app's own (js/content/algo/algo-p9-x-0[2-4].js, -1[0-2].js); the robot sentence and the four
   head patterns are made-up scores in the lessons' spirit, pushed through the real softmax.

   MATHS  A10.softmax(arr, scale = 1) -> shares (scores are divided by scale first)     A10.dot(a, b)     A10.mm(A, B)     A10.tr(A)
          A10.sum(a)    A10.r(x, d = 2) -> x rounded to d decimals (a number)
          A10.fmt(x, d = 1) -> text with a real minus sign and fixed decimals: fmt(-0.26, 1) = "−0.3", fmt(0, 1) = "0.0"
          A10.commas(n) -> "38,416"      A10.same(what, got, want) / A10.close(what, got, want, tol) throw when a number differs
          A10.rng(seed) -> () => 0..1 (the only randomness allowed)
          A10.layerNorm(arr) -> {mean, variance, z}   (eps 1e-5, as the lesson)

   1. TOKENS (scene 2; lesson 10.1)  "the bank by the river bank": six tokens, a 4-number embedding each (the first 4 of the lesson's 8
        numbers) and the sine / cosine position pattern of the slot (first 4 of 8).
        A10.TOK = {words: [6 words], emb: [[4 numbers] x6], pos: [[4] x6], sum: [[4] x6] (emb + pos, exact),
                   embTxt / posTxt / sumTxt: [[4 strings] x6] (1 decimal; every shown sum equals the sum of the shown parts),
                   pairs: {the: [0, 3], bank: [1, 5]} (same word at two slots), dist: {the: [no pos, with pos], bank: [..]} (Euclidean
                   distance of the 4-number rows, 0 without position)}
   2. SOFTMAX (scene 3; lesson 10.2)  scores 2, 1, 0
        A10.SOFT = {scores: [2,1,0], exps: [7.389, 2.718, 1], expTxt: ["7.39","2.72","1.00"], total: 11.107 (totalTxt "11.11"),
                    shares: [0.665, 0.245, 0.090], shareTxt: ["0.67","0.24","0.09"] (they add up to 1.00),
                    sharp: {scores: [4,2,0], shares: [0.867, 0.117, 0.016], topTxt: "0.87"}   // show only the top share (0.87 + 0.12 + 0.02 = 1.01)
                    shift: {scores: [7,6,5], shares: same as shares}}   // adding 5 to every score changes nothing
   3. ATTENTION (scene 4; lesson 10.3)  "The robot moved because it detected danger": seven words, the word "it" asks.
        A10.ATT = {words: ["The","robot","moved","because","it","detected","danger"], IT: 4, ROBOT: 1,
                   logits: 7x7 made-up scores (row i = the word looking, column j = the word looked at), w: 7x7 softmax of each row,
                   itRow: w[4] = [0.01, 0.82, 0.01, 0.01, 0.11, 0.01, 0.01] (robot 0.82, itself 0.11), itTxt: {robot: "0.82", self: "0.11"},
                   web: [{i, j, w}] every link of weight >= 0.1 (the arcs of "everyone looks at everyone"; row 4 = the two arcs of "it"),
                   n: 7, links: 49 (7 x 7 shares)}
   4. QUERY / KEY / VALUE BY HAND (scenes 5, 6, 8; lesson 10.4 "the dog barked")
        A10.QKV = {words: ["the","dog","barked"], X: 3 x 4, Wq / Wk / Wv: 4 x 2, Q, K, V: 3 x 2 integer matrices
                     Q = [[2,1],[1,2],[1,1]]   K = [[1,0],[1,2],[1,1]]   V = [[2,1],[1,3],[1,1]],
                   S: Q K^T = [[2,4,3],[1,5,3],[1,3,2]] (raw scores), dk: 2, root: 1.414 (shown as "1.41"), A: 3 x 3 softmax(S / root) rows,
                   Z: A V (3 x 2),  AT: A as 2-decimal strings, ZT: Z as strings (e.g. barked: ["1.14", "2.15"]),
                   F: 2, the asking word "barked" (index 2) = {q: [1,1], rows: [{word, k, prods: [q0*k0, q1*k1], score, scaled, scaledTxt, w, wTxt}] x3,
                      weights: [0.14, 0.58, 0.28] (wTxt "0.14","0.58","0.28"), blend: {v: V, parts: [[w*v0, w*v1] x3] (partsTxt), z: [1.14, 2.152], zTxt: ["1.14","2.15"]}}
                   Scores for barked: the 1, dog 3, barked 2; scaled 0.71, 2.12, 1.41.  Row "the" has the same weights as "barked" (scores differ by 1).
   5. HEADS (scene 7; lesson 10.5)  four made-up attention patterns on the robot sentence (7 x 7 weights), d_model 64, 4 heads of 16
        A10.HEADS = {n: 4, dModel: 64, dHead: 16, patterns: [{name, tag, w: 7x7, key: [[r, c], ...]} x4]}
          0 "who is it?"  (tag text: "who is “it”?")  it -> robot 0.97, every other word looks at itself 0.77   key [[4, 1]]
          1 "word before" every word looks at the word before it (the first at itself) 0.96                                key [[1,0],[2,1],[3,2],[4,3],[5,4],[6,5],[0,0]]
          2 "who acts?"   moved and detected look at robot 0.95; robot looks at both 0.47 each                              key [[2,1],[5,1],[1,2],[1,5]]
          3 "acts on what?" detected and danger look at each other 0.95                                                      key [[5,6],[6,5]]
   6. ONE LAYER (scene 8; lesson 10.6)  one token's vector x = [1, 3, 5, 7] and a sublayer output F(x) = [2, -1, 0.5, -2]
        A10.LAYER = {x, fx, sum: [3, 2, 5.5, 5] (x + F(x)), mean: 3.875, variance: 2.047, norm: [-0.61, -1.31, 1.14, 0.79] (layer norm of the sum),
                     normTxt, xNorm: layer norm of x alone = [-1.34, -0.45, 0.45, 1.34] (mean 4, variance 5), N: 6 layers, ffn: {in: 512, hidden: 2048}}
   7. DECODER (scene 9; lesson 10.7)  translating "I have eaten an apple" word by word (toy scores)
        A10.DEC = {out: ["Ich","habe","einen","Apfel","gegessen","<eos>"], sos: "<sos>",
                   steps: [{ctx: [words so far, starting with "<sos>"], words: [4 candidates], logits, probs, best: index, top: word, topTxt: "0.74"...}] x6,
                   topTxt: ["0.74","0.52","0.64","0.74","0.71","0.97"], step 3 (index 2) candidates einen/eine/den/meinen = 0.64/0.24/0.09/0.03,
                   mask: {n: 6, blocked: 15, allowed: 21, cells: (n) => n x n booleans, true = allowed (row i may see column j <= i)}}
   8. PICTURES AS TOKENS (scene 10; lesson 10.8)  a 224 x 224 picture
        A10.VIT = {image: 224, coarse: {patch: 16, side: 14, tokens: 196, scores: 38416, scoresTxt: "38,416"},
                   fine: {patch: 8, side: 28, tokens: 784, scores: 614656, scoresTxt: "614,656"}, tokenRatio: 4, scoreRatio: 16} */
(function () {
  const V = window.VID;
  const A10 = (V.a10 = V.a10 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.a10: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.001) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.a10: ${what} is ${got}, the storyboard says ${want}`);
  };
  const rng = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = (x, d = 2) => +x.toFixed(d);
  const fmt = (x, d = 1) => {
    const v = +x.toFixed(d);
    return (v < 0 ? "−" : "") + Math.abs(v).toFixed(d);
  };
  const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sum = (a) => a.reduce((p, q) => p + q, 0);
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const tr = (A) => A[0].map((_, j) => A.map((row) => row[j]));
  const mm = (A, B) => A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));
  const softmax = (arr, scale = 1) => {
    const z = arr.map((v) => v / scale);
    const m = Math.max(...z);
    const e = z.map((v) => Math.exp(v - m));
    const t = sum(e);
    return e.map((v) => v / t);
  };
  const layerNorm = (x) => {
    const mean = sum(x) / x.length;
    const variance = sum(x.map((t) => (t - mean) ** 2)) / x.length;
    return { mean, variance, z: x.map((t) => (t - mean) / Math.sqrt(variance + 1e-5)) };
  };
  const dist = (a, b) => Math.hypot(...a.map((x, i) => x - b[i]));
  Object.assign(A10, { same, close, rng, r, fmt, commas, sum, dot, tr, mm, softmax, layerNorm });

  // ---------- 1. tokens, embeddings and position ----------
  const D8 = 8;
  const EMB8 = {
    the: [0.2, -0.1, 0.4, 0.0, 0.1, -0.3, 0.2, 0.1],
    bank: [0.7, 0.5, -0.4, 0.3, -0.6, 0.2, 0.8, -0.1],
    by: [-0.3, 0.2, 0.1, 0.6, 0.0, 0.4, -0.2, 0.3],
    river: [0.6, -0.5, 0.3, -0.2, 0.7, -0.4, 0.1, 0.5],
  };
  const pe8 = (pos) =>
    Array.from({ length: D8 }, (_, d) => {
      const a = pos / 10000 ** ((2 * Math.floor(d / 2)) / D8);
      return d % 2 ? Math.cos(a) : Math.sin(a);
    });
  const T = { words: ["the", "bank", "by", "the", "river", "bank"], pairs: { the: [0, 3], bank: [1, 5] } };
  T.emb = T.words.map((w) => EMB8[w].slice(0, 4));
  T.pos = T.words.map((_, i) => pe8(i).slice(0, 4));
  T.sum = T.emb.map((e, i) => e.map((v, d) => v + T.pos[i][d]));
  const txt = (M) => M.map((row) => row.map((v) => fmt(v, 1)));
  T.embTxt = txt(T.emb);
  T.posTxt = txt(T.pos);
  T.sumTxt = txt(T.sum);
  T.dist = Object.fromEntries(
    Object.entries(T.pairs).map(([w, [i, j]]) => [w, [r(dist(T.emb[i], T.emb[j]), 3), r(dist(T.sum[i], T.sum[j]), 2)]]),
  );
  A10.TOK = T;
  const num = (t) => +t.replace("\u2212", "-");
  T.emb.forEach((_, i) =>
    T.emb[i].forEach((__, d) =>
      close(
        `tokens: the shown sum ${i}.${d}`,
        +(num(T.embTxt[i][d]) + num(T.posTxt[i][d])).toFixed(1),
        num(T.sumTxt[i][d]),
        1e-9,
      ),
    ),
  );
  same(
    "tokens: the bank at slot 1",
    [T.embTxt[1], T.posTxt[1], T.sumTxt[1]],
    [
      ["0.7", "0.5", "−0.4", "0.3"],
      ["0.8", "0.5", "0.1", "1.0"],
      ["1.5", "1.0", "−0.3", "1.3"],
    ],
  );
  same(
    "tokens: the bank at slot 5",
    [T.embTxt[5], T.posTxt[5], T.sumTxt[5]],
    [
      ["0.7", "0.5", "−0.4", "0.3"],
      ["−1.0", "0.3", "0.5", "0.9"],
      ["−0.3", "0.8", "0.1", "1.2"],
    ],
  );
  same(
    "tokens: the at slot 0 and 3",
    [T.sumTxt[0], T.sumTxt[3]],
    [
      ["0.2", "0.9", "0.4", "1.0"],
      ["0.3", "−1.1", "0.7", "1.0"],
    ],
  );
  same(
    "tokens: by / river sums",
    [T.sumTxt[2], T.sumTxt[4]],
    [
      ["0.6", "−0.2", "0.3", "1.6"],
      ["−0.2", "−1.2", "0.7", "0.7"],
    ],
  );
  same("tokens: position rows", T.posTxt, [
    ["0.0", "1.0", "0.0", "1.0"],
    ["0.8", "0.5", "0.1", "1.0"],
    ["0.9", "−0.4", "0.2", "1.0"],
    ["0.1", "−1.0", "0.3", "1.0"],
    ["−0.8", "−0.7", "0.4", "0.9"],
    ["−1.0", "0.3", "0.5", "0.9"],
  ]);
  same("tokens: same word, same embedding", [T.emb[0], T.emb[1]], [T.emb[3], T.emb[5]]);
  same("tokens: distance of the repeats", [T.dist.the[0], T.dist.bank[0]], [0, 0]);
  if (!(T.dist.the[1] > 0.5 && T.dist.bank[1] > 0.5))
    throw new Error("VID.a10: position must make repeated words differ");

  // ---------- 2. softmax ----------
  const S = { scores: [2, 1, 0] };
  S.exps = S.scores.map(Math.exp);
  S.total = sum(S.exps);
  S.shares = S.exps.map((v) => v / S.total);
  S.expTxt = S.exps.map((v) => v.toFixed(2));
  S.totalTxt = S.total.toFixed(2);
  S.shareTxt = S.shares.map((v) => v.toFixed(2));
  S.sharp = { scores: [4, 2, 0], shares: softmax([4, 2, 0]) };
  S.sharp.topTxt = S.sharp.shares[0].toFixed(2);
  S.shift = { scores: [7, 6, 5], shares: softmax([7, 6, 5]) };
  A10.SOFT = S;
  same("softmax: e^score", S.expTxt, ["7.39", "2.72", "1.00"]);
  same("softmax: total and shares", [S.totalTxt, S.shareTxt], ["11.11", ["0.67", "0.24", "0.09"]]);
  same("softmax: the shown shares add up to 1", r(sum(S.shareTxt.map(Number))), 1);
  same(
    "softmax: shares in 3 decimals",
    S.shares.map((v) => r(v, 3)),
    [0.665, 0.245, 0.09],
  );
  same(
    "softmax: sharper shares",
    [S.sharp.shares.map((v) => r(v, 3)), S.sharp.topTxt],
    [[0.867, 0.117, 0.016], "0.87"],
  );
  close("softmax: adding 5 to every score changes nothing", S.shift.shares[0], S.shares[0], 1e-12);

  // ---------- 3. attention on the robot sentence ----------
  const N7 = 7;
  const grid7 = (f) => Array.from({ length: N7 }, (_, i) => Array.from({ length: N7 }, (_, j) => f(i, j)));
  const ATT = {
    words: ["The", "robot", "moved", "because", "it", "detected", "danger"],
    IT: 4,
    ROBOT: 1,
    n: N7,
    links: N7 * N7,
  };
  const link = { "0,1": 3, "1,2": 3, "2,1": 3, "3,2": 2.5, "3,5": 2.5, "4,1": 4, "5,1": 2.5, "5,6": 3.5, "6,5": 3.5 };
  ATT.logits = grid7((i, j) => link[`${i},${j}`] ?? (i === j ? 2 : 0));
  ATT.w = ATT.logits.map((row) => softmax(row));
  ATT.itRow = ATT.w[ATT.IT];
  ATT.itTxt = { robot: ATT.itRow[1].toFixed(2), self: ATT.itRow[4].toFixed(2) };
  ATT.web = ATT.w.flatMap((row, i) => row.flatMap((w, j) => (w >= 0.1 ? [{ i, j, w }] : [])));
  A10.ATT = ATT;
  ATT.w.forEach((row, i) => close(`attention: row ${i} adds up to 1`, sum(row), 1, 1e-9));
  same(
    "attention: the row of it",
    ATT.itRow.map((v) => r(v, 2)),
    [0.01, 0.82, 0.01, 0.01, 0.11, 0.01, 0.01],
  );
  same(
    "attention: it looks hardest at robot",
    [ATT.itTxt, ATT.itRow.indexOf(Math.max(...ATT.itRow))],
    [{ robot: "0.82", self: "0.11" }, ATT.ROBOT],
  );
  same(
    "attention: the web has these links",
    ATT.web.map((l) => `${l.i}>${l.j}`),
    ["0>0", "0>1", "1>1", "1>2", "2>1", "2>2", "3>2", "3>3", "3>5", "4>1", "4>4", "5>1", "5>5", "5>6", "6>5", "6>6"],
  );

  // ---------- 4. query, key, value by hand: the dog barked ----------
  const Q3 = { words: ["the", "dog", "barked"], F: 2 };
  Q3.X = [
    [1, 0, 1, 0],
    [0, 1, 1, 1],
    [1, 1, 0, 0],
  ];
  Q3.Wq = [
    [1, 0],
    [0, 1],
    [1, 1],
    [0, 0],
  ];
  Q3.Wk = [
    [1, 0],
    [0, 1],
    [0, 0],
    [1, 1],
  ];
  Q3.Wv = [
    [1, 0],
    [0, 1],
    [1, 1],
    [0, 1],
  ];
  [Q3.Q, Q3.K, Q3.V] = [Q3.Wq, Q3.Wk, Q3.Wv].map((W) => mm(Q3.X, W));
  Q3.S = mm(Q3.Q, tr(Q3.K));
  Q3.dk = 2;
  Q3.root = Math.sqrt(Q3.dk);
  Q3.A = Q3.S.map((row) => softmax(row, Q3.root));
  Q3.Z = mm(Q3.A, Q3.V);
  Q3.AT = Q3.A.map((row) => row.map((v) => v.toFixed(2)));
  Q3.ZT = Q3.Z.map((row) => row.map((v) => v.toFixed(2)));
  const qi = Q3.F;
  const w3 = Q3.A[qi];
  Q3.barked = {
    q: Q3.Q[qi],
    rows: Q3.words.map((word, j) => ({
      word,
      k: Q3.K[j],
      prods: Q3.Q[qi].map((q, d) => q * Q3.K[j][d]),
      score: Q3.S[qi][j],
      scaled: Q3.S[qi][j] / Q3.root,
      scaledTxt: (Q3.S[qi][j] / Q3.root).toFixed(2),
      w: w3[j],
      wTxt: w3[j].toFixed(2),
    })),
    weights: w3,
    blend: { v: Q3.V, parts: w3.map((w, j) => Q3.V[j].map((v) => w * v)), z: Q3.Z[qi] },
  };
  Q3.barked.blend.partsTxt = Q3.barked.blend.parts.map((p) => p.map((v) => v.toFixed(2)));
  Q3.barked.blend.zTxt = Q3.barked.blend.z.map((v) => v.toFixed(2));
  A10.QKV = Q3;
  same(
    "qkv: Q, K, V",
    [Q3.Q, Q3.K, Q3.V],
    [
      [
        [2, 1],
        [1, 2],
        [1, 1],
      ],
      [
        [1, 0],
        [1, 2],
        [1, 1],
      ],
      [
        [2, 1],
        [1, 3],
        [1, 1],
      ],
    ],
  );
  same("qkv: raw scores", Q3.S, [
    [2, 4, 3],
    [1, 5, 3],
    [1, 3, 2],
  ]);
  same(
    "qkv: barked scores, products and scaled scores",
    [Q3.barked.rows.map((x) => x.score), Q3.barked.rows.map((x) => x.prods), Q3.barked.rows.map((x) => x.scaledTxt)],
    [
      [1, 3, 2],
      [
        [1, 0],
        [1, 2],
        [1, 1],
      ],
      ["0.71", "2.12", "1.41"],
    ],
  );
  same(
    "qkv: barked weights",
    Q3.barked.rows.map((x) => x.wTxt),
    ["0.14", "0.58", "0.28"],
  );
  same("qkv: the shown weights add up to 1", r(sum(Q3.barked.rows.map((x) => +x.wTxt))), 1);
  same("qkv: barked blend parts", Q3.barked.blend.partsTxt, [
    ["0.28", "0.14"],
    ["0.58", "1.73"],
    ["0.28", "0.28"],
  ]);
  same("qkv: barked new vector", Q3.barked.blend.zTxt, ["1.14", "2.15"]);
  same("qkv: the attention matrix", Q3.AT, [
    ["0.14", "0.58", "0.28"],
    ["0.05", "0.77", "0.19"],
    ["0.14", "0.58", "0.28"],
  ]);
  same("qkv: Z rows", Q3.ZT, [
    ["1.14", "2.15"],
    ["1.05", "2.54"],
    ["1.14", "2.15"],
  ]);
  Q3.A.forEach((row, i) => close(`qkv: row ${i} adds up to 1`, sum(row), 1, 1e-9));
  close("qkv: the root of d_k", Q3.root, 1.4142, 1e-3);

  // ---------- 5. heads ----------
  const pat = (f) => grid7(f).map((row) => softmax(row));
  const diag3 = (i, j) => (i === j ? 3 : 0);
  const H = { n: 4, dModel: 64 };
  H.dHead = H.dModel / H.n;
  H.patterns = [
    {
      name: "who is it?",
      tag: "who is “it”?",
      key: [[4, 1]],
      w: pat((i, j) => (i === 4 ? (j === 1 ? 6 : j === 4 ? 2 : 0) : diag3(i, j))),
    },
    {
      name: "word before",
      tag: "word before",
      key: [
        [0, 0],
        [1, 0],
        [2, 1],
        [3, 2],
        [4, 3],
        [5, 4],
        [6, 5],
      ],
      w: pat((i, j) => (j === i - 1 || (i === 0 && j === 0) ? 5 : 0)),
    },
    {
      name: "who acts?",
      tag: "who acts?",
      key: [
        [2, 1],
        [5, 1],
        [1, 2],
        [1, 5],
      ],
      w: pat((i, j) =>
        i === 2 || i === 5
          ? j === 1
            ? 5
            : j === i
              ? 1
              : 0
          : i === 1
            ? j === 2 || j === 5
              ? 4
              : j === 1
                ? 1
                : 0
            : diag3(i, j),
      ),
    },
    {
      name: "acts on what?",
      tag: "acts on what?",
      key: [
        [5, 6],
        [6, 5],
      ],
      w: pat((i, j) => (i === 5 || i === 6 ? (j === 11 - i ? 5 : j === i ? 1 : 0) : diag3(i, j))),
    },
  ];
  A10.HEADS = H;
  H.patterns.forEach((p, k) =>
    p.w.forEach((row, i) => close(`heads: head ${k} row ${i} adds up to 1`, sum(row), 1, 1e-9)),
  );
  const cell = (k, i, j) => r(H.patterns[k].w[i][j], 2);
  same("heads: it finds robot", [cell(0, 4, 1), cell(0, 0, 0)], [0.97, 0.77]);
  same("heads: the word before", [cell(1, 3, 2), cell(1, 0, 0), cell(1, 6, 5)], [0.96, 0.96, 0.96]);
  same("heads: who acts", [cell(2, 2, 1), cell(2, 5, 1), cell(2, 1, 2), cell(2, 1, 5)], [0.95, 0.95, 0.47, 0.47]);
  same("heads: acts on what", [cell(3, 5, 6), cell(3, 6, 5)], [0.95, 0.95]);
  same("heads: sizes", [H.dHead, H.n * H.dHead, H.dModel], [16, 64, 64]);

  // ---------- 6. one layer: residual and layer norm ----------
  const LY = { x: [1, 3, 5, 7], fx: [2, -1, 0.5, -2], N: 6, ffn: { in: 512, hidden: 2048 } };
  LY.sum = LY.x.map((v, i) => v + LY.fx[i]);
  const ln = layerNorm(LY.sum);
  LY.mean = ln.mean;
  LY.variance = ln.variance;
  LY.norm = ln.z.map((v) => r(v, 2));
  LY.normTxt = ln.z.map((v) => fmt(v, 2));
  const lx = layerNorm(LY.x);
  LY.xNorm = lx.z.map((v) => r(v, 2));
  LY.xNormMean = lx.mean;
  LY.xNormVar = lx.variance;
  A10.LAYER = LY;
  same("layer: x + F(x)", [LY.sum, LY.mean], [[3, 2, 5.5, 5], 3.875]);
  close("layer: variance of x + F(x)", LY.variance, 2.047, 1e-3);
  same("layer: norm of x + F(x)", LY.norm, [-0.61, -1.31, 1.14, 0.79]);
  same("layer: norm of x alone", [LY.xNorm, LY.xNormMean, LY.xNormVar], [[-1.34, -0.45, 0.45, 1.34], 4, 5]);
  same("layer: the numbers of the lesson", [LY.N, LY.ffn.hidden / LY.ffn.in], [6, 4]);

  // ---------- 7. the decoder ----------
  const STEP_DATA = [
    ["Ich", ["Ich", "Wir", "Das", "Es"], [4, 2.5, 1.5, 1]],
    ["habe", ["habe", "esse", "bin", "werde"], [3.5, 3, 2, 1]],
    ["einen", ["einen", "eine", "den", "meinen"], [3.5, 2.5, 1.5, 0.5]],
    ["Apfel", ["Apfel", "Kuchen", "Hund", "Tisch"], [4, 2.5, 1.5, 1]],
    ["gegessen", ["gegessen", "gesehen", "gekauft", "genommen"], [4, 2.5, 2, 1]],
    ["<eos>", ["<eos>", ".", "und", "dann"], [5, 1, 0.5, 0]],
  ];
  const DEC = { sos: "<sos>", out: STEP_DATA.map((s) => s[0]) };
  DEC.steps = STEP_DATA.map(([top, words, logits], i) => {
    const probs = softmax(logits);
    const best = probs.indexOf(Math.max(...probs));
    return {
      ctx: ["<sos>", ...DEC.out.slice(0, i)],
      words,
      logits,
      probs,
      best,
      top: words[best],
      topTxt: probs[best].toFixed(2),
      probsTxt: probs.map((p) => p.toFixed(2)),
    };
  });
  DEC.topTxt = DEC.steps.map((s) => s.topTxt);
  const maskCells = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => j <= i));
  DEC.mask = {
    n: 6,
    cells: maskCells,
    allowed: sum(maskCells(6).flat().map(Number)),
    blocked: 36 - sum(maskCells(6).flat().map(Number)),
  };
  A10.DEC = DEC;
  same(
    "decoder: every step picks the word it writes",
    DEC.steps.map((s) => s.top),
    DEC.out,
  );
  same("decoder: top probabilities", DEC.topTxt, ["0.74", "0.52", "0.64", "0.74", "0.71", "0.97"]);
  same("decoder: step 3 candidates", DEC.steps[2].probsTxt, ["0.64", "0.24", "0.09", "0.03"]);
  same("decoder: the mask", [DEC.mask.allowed, DEC.mask.blocked], [21, 15]);

  // ---------- 8. pictures as tokens ----------
  const vit = (patch) => {
    const side = 224 / patch;
    return { patch, side, tokens: side * side, scores: side ** 4, scoresTxt: commas(side ** 4) };
  };
  const VIT = { image: 224, coarse: vit(16), fine: vit(8) };
  VIT.tokenRatio = VIT.fine.tokens / VIT.coarse.tokens;
  VIT.scoreRatio = VIT.fine.scores / VIT.coarse.scores;
  A10.VIT = VIT;
  same("vit: 16 pixel patches", [VIT.coarse.side, VIT.coarse.tokens, VIT.coarse.scoresTxt], [14, 196, "38,416"]);
  same("vit: 8 pixel patches", [VIT.fine.side, VIT.fine.tokens, VIT.fine.scoresTxt], [28, 784, "614,656"]);
  same("vit: four times the tokens, sixteen times the scores", [VIT.tokenRatio, VIT.scoreRatio], [4, 16]);
})();
