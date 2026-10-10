/* Phase 7 · Information Theory & Compression: the data and algorithms every scene of this video shares (pure, no DOM, no
   randomness). Everything hangs off VID.a7; scenes start with  const A7 = VID.a7;  Drawing helpers are in common-2.js (tag,
   tiles, chips, bit strips, counter, bar, span, token) and common-3.js (the code tree). Every number below is computed by
   running the real algorithm when the page loads and is asserted against the storyboard (videos/_plan/algo-7.json): a wrong
   number throws an Error with a clear message.

   THE LECTURE SOURCE (lessons 7.1 and 7.7).  Five letters with chances A .16, B .51, C .09, D .13, E .11 (weights are whole
   percents so nothing is rounded: 16, 51, 9, 13, 11). The video's message is BBADEBC.
     A7.LETTERS = ["A","B","C","D","E"]     A7.PCT = {A: 16, B: 51, C: 9, D: 13, E: 11}     A7.MSG = "BBADEBC"
     A7.fmtW(20) -> ".20"   A7.fmtW(9) -> ".09"   A7.fmtW(100) -> "1.00"      (a weight in percent as the lesson writes it)
     A7.fmtBits(198) -> "1.98"                                                  (percent-of-a-bit units as bits)
     A7.ORDER = ["C","E","D","A","B"]       the letters rarest to commonest (and the leaf order of the Huffman figures)
   SCENE 2, fixed codes.  A7.FIXED = {C:"000", E:"001", D:"010", A:"011", B:"100"} (3 bits each; the letters are numbered
     rarest first so that shortening B to "1" is legal; the lesson's alphabetical table gives the same 21 bits).
     A7.REDUNDANCY = {msg, counts: {A:1,B:3,C:1,D:1,E:1}, fixed: ["100","100","011","010","001","100","000"], fixedTotal: 21,
                      short: ["1","1","011","010","001","1","000"], shortTotal: 15, saved: 6}
       short = the same codes with B shortened to "1" (the Huffman codes of scene 7, so 15 is not a coincidence).
   SCENE 3, surprise.  A7.surprise(p) = -log2 p.   A7.LADDER = [{k, p, frac, say, bits}] five rows, each half the chance of the
       last: k 0 p 1 frac "1" say "certain" bits 0;  k 1 p 1/2 "1/2" "1 in 2" 1;  k 2 p 1/4 "1/4" "1 in 4" 2;  k 3 p 1/8 "1/8"
       "1 in 8" 3;  k 4 p 1/16 "1/16" "1 in 16" 4.
   SCENE 4, entropy.  A7.DIE = {letters: ["A","B","C","D"], p: [.5,.25,.125,.125], frac: ["1/2","1/4","1/8","1/8"], bits:
       [1,2,3,3], share: [.5,.5,.375,.375], H: 1.75, fixedBits: 2}.   A7.entropy(ps) = sum p log2(1/p).
     A7.SAMPLE = {msg: "ABAACABD", bits: [1,2,1,1,3,1,2,3] (surprise of each symbol), total: 14, fixedTotal: 16,
                  perSymbol: 1.75, fixedPerSymbol: 2}   eight symbols with exactly the die's chances (A 4, B 2, C 1, D 1).
   SCENE 5, prefix-free codes.
     A7.BAD = {codes: {A:"0", B:"1", C:"01"}, stream: "01", readings: [["A","B"], ["C"]]}   one bit string, two messages
     A7.PREFIX = {codes: {A:"0", B:"10", C:"110", D:"111"}, stream: "010110", out: "ABC", tree, walk}
       tree = A7.codeTree(codes) (below): ids "root","0"(A),"1","10"(B),"11","110"(C),"111"(D).
       walk[i] (one per bit): {i, bit, from, to, leaf: letter | null, out: letters decoded so far, start, end}; the token goes
       from -> to; when leaf is a letter it has arrived (start..end are the bit indexes of that codeword, end exclusive).
     A7.codeTree(codes) -> {nodes: {id: {id, leaf: letter | null, depth, kids: [id0, id1] | null, parent, path}}, edges:
       [[parent, child, bit]], order: [letters left to right], maxDepth, root: "root"}.  id = the bit path ("" is "root").
     A7.ek(parent, child) -> "parent>child": the key of an edge in the tree drawer.
   SCENES 6 and 7, Huffman.  A7.HUFF = {nodes, root: "CEDAB", order: ORDER, maxDepth: 3, merges, roots, smallest, edges, codes,
       L: 1.98, H: 1.964..., fixedBits: 3, costs: [20,49,98,198]}
     nodes[id] = {id, w (percent), leaf, kids: [lower, higher] | null, parent, depth, height, path (code), lo, hi (leaf indexes)}
       ids: the five letters, then CE (C+E), DA (D+A), CEDA, CEDAB (the root); id = its leaves left to right. The kid with
       the larger weight is kids[1] and gets bit 1 (the lecture's convention), so C=000 E=001 D=010 A=011 B=1.
     merges[n-1], n = 1..4: {n, a, b (ids, a lighter), id (the new node), w, cost (running total, percent), roots (ids left to
       right AFTER this merge)}:   1 C .09 + E .11 -> CE .20 (cost .20)   2 D .13 + A .16 -> DA .29 (.49)
       3 CE .20 + DA .29 -> CEDA .49 (.98)   4 CEDA .49 + B .51 -> CEDAB 1.00 (1.98)
     roots[s], s = 0..4: the roots standing after s merges, left to right (leaves never move: a root's x is the middle of its
       kids). smallest[s], s = 0..3: the two lightest roots at that moment, i.e. the pair merged next (lighter first).
     edges: [[parent, child, bit]] in drawing order: CEDAB>CEDA 0, CEDAB>B 1, CEDA>CE 0, CEDA>DA 1, CE>C 0, CE>E 1, DA>D 0, DA>A 1.
     codes {C:"000", E:"001", D:"010", A:"011", B:"1"}.  L = 0.51*1 + 0.49*3 = 1.98 = costs[3]/100: the average code length
       equals the sum of all the merge weights.  H = 1.964 bits (sum p log2(1/p)); L >= H, 0.016 above.
     A7.huffman(items) runs the algorithm on any [[letter, percent], ...] (ties: a leaf beats a merged node, then older first).
   SCENE 7, encoding.  A7.ENCODE = {msg, codes: ["1","1","011","010","001","1","000"], bits: "110110100011000", count: 15,
       fixed: ["100","100","011","010","001","100","000"], fixedBits: "100100011010001100000", fixedCount: 21, saved: 6}
   SCENES 8 and 9, LZW (the lecture's example, lessons 7.9 and 7.10).  Alphabet A = 0, B = 1; message ABABABABA.
     A7.LZW = {text, alpha: ["A","B"], steps, codes: [0,1,2,4,3], chunks, dict, entries}
       steps[k] (9 of them): {k, i (index of c; i = 9 for the last), w, c, act: "grow" | "emit" | "final", code (emit/final),
         add: {idx, text} | null (the new entry), wFrom, wTo (w covers text[wFrom..wTo) BEFORE the step), wTo2 (end of w
         after it: grows by one letter on "grow", restarts at c on "emit"), codes (the codes emitted so far, incl. this one)}
         act by step: emit 0 (A, adds AB=2), emit 1 (B, adds BA=3), grow (AB), emit 2 (AB, adds ABA=4), grow (AB), grow
         (ABA), emit 4 (ABA, adds ABAB=5), grow (BA), final 3 (BA).
       chunks: [{text, from, to, code}] the text cut where codes are emitted: A | B | AB | ABA | BA (1+1+2+3+2 = 9 letters).
       dict: [{idx, text}] the final dictionary: 0 A, 1 B, 2 AB, 3 BA, 4 ABA, 5 ABAB;   entries = dict.slice(2) (the learned ones).
     A7.LZW_DEC (the decoder, same codes)  = {steps, out: "ABABABABA"}
       steps[k] (5): {k, code, prev (previous output chunk, "" at first), known (code already in the decoder's dictionary),
         entry (the chunk output), added: {idx, text} | null, out (all output so far), outFrom, outTo (letters), missing,
         rule: {prev, first, text} when missing (the entry is previous + its OWN first letter)}.
         0 -> A (adds nothing)   1 -> B (adds AB=2)   2 -> AB (adds BA=3)   4 -> MISSING: AB + A = ABA (adds ABA=4)
         3 -> BA (adds ABAB=5).   The decoder always trails the encoder by one entry; code 4 is the entry the encoder had just
         made and used at once.
     A7.lzwEncode(text, alpha) / A7.lzwDecode(codes, alpha) run any message.
   SCENE 10, GIF (lesson 7.11).  A7.GIF = {alpha: ["A","B","C","D"], tones: {A:"green", B:"blue", C:"purple", D:"orange"},
       flat: {text: "AAAAAABBBCCCCCDDDD", count: 11, chunks}, noisy: {text: "DBCBAABDADDCDDACCA", count: 17, chunks}}
       count = number of LZW codes for the 18 pixels; chunks as above. Flat chunks: A|AA|AAA|B|BB|C|CC|CC|D|DD|D.
   SMALL TOOLS.  A7.rng(seed) (mulberry32: the only randomness allowed)   A7.same(what, got, want) throws when JSON differs
       A7.close(what, got, want, tol) throws when numbers differ    A7.TONES = ["grey","green","red","orange","blue","purple"]
       A7.sum(list)   A7.mix(p, q, f) -> [x, y]   A7.cyc(t, t0, period) (time inside a loop, -1 before t0) */
(function () {
  const V = window.VID;
  const A7 = (V.a7 = V.a7 || {});
  const lg = Math.log2;

  // ---------- small tools ----------
  const rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.a7: ${what}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 1e-9) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.a7: ${what}: got ${got}, expected ${want} (tol ${tol})`);
  };
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);
  const mix = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
  const cyc = (t, t0, period) => (t < t0 ? -1 : (t - t0) % period);
  const fmtW = (w) => (w >= 100 ? (w / 100).toFixed(2) : `.${String(w).padStart(2, "0")}`);
  const fmtBits = (w) => (w / 100).toFixed(2);
  const TONES = ["grey", "green", "red", "orange", "blue", "purple"];
  const entropy = (ps) => ps.reduce((a, p) => a - (p > 0 ? p * lg(p) : 0), 0);
  const surprise = (p) => -lg(p);

  // ---------- the lecture source, fixed codes (scene 2) ----------
  const LETTERS = ["A", "B", "C", "D", "E"];
  const PCT = { A: 16, B: 51, C: 9, D: 13, E: 11 };
  const MSG = "BBADEBC";
  const ORDER = [...LETTERS].sort((a, b) => PCT[a] - PCT[b]);
  const FIXED = Object.fromEntries(ORDER.map((c, i) => [c, i.toString(2).padStart(3, "0")]));
  const REDUNDANCY = (() => {
    const counts = Object.fromEntries(LETTERS.map((c) => [c, [...MSG].filter((x) => x === c).length]));
    const fixed = [...MSG].map((c) => FIXED[c]);
    const short = [...MSG].map((c) => (c === "B" ? "1" : FIXED[c]));
    const len = (xs) => sum(xs.map((s) => s.length));
    return { msg: MSG, counts, fixed, fixedTotal: len(fixed), short, shortTotal: len(short), saved: len(fixed) - len(short) };
  })();

  // ---------- surprise (scene 3) and entropy (scene 4) ----------
  const LADDER = [0, 1, 2, 3, 4].map((k) => ({
    k,
    p: 1 / 2 ** k,
    frac: k ? `1/${2 ** k}` : "1",
    say: k ? `1 in ${2 ** k}` : "certain",
    bits: surprise(1 / 2 ** k) + 0,
  }));
  const DIE = (() => {
    const p = [0.5, 0.25, 0.125, 0.125];
    const bits = p.map((x) => surprise(x));
    return {
      letters: ["A", "B", "C", "D"],
      p,
      frac: ["1/2", "1/4", "1/8", "1/8"],
      bits,
      share: p.map((x, i) => x * bits[i]),
      H: entropy(p),
      fixedBits: 2,
    };
  })();
  const SAMPLE = (() => {
    const msg = "ABAACABD";
    const bits = [...msg].map((c) => DIE.bits[DIE.letters.indexOf(c)]);
    return { msg, bits, total: sum(bits), fixedTotal: msg.length * DIE.fixedBits, perSymbol: sum(bits) / msg.length, fixedPerSymbol: 2 };
  })();

  // ---------- code trees (scenes 5 and 7) ----------
  const ek = (p, c) => `${p}>${c}`;
  function codeTree(codes) {
    const nodes = {};
    const root = { id: "root", leaf: null, depth: 0, kids: null, parent: null, path: "" };
    nodes.root = root;
    Object.entries(codes).forEach(([letter, code]) => {
      let cur = root;
      [...code].forEach((bit, i) => {
        const path = code.slice(0, i + 1);
        if (!nodes[path]) nodes[path] = { id: path, leaf: null, depth: i + 1, kids: null, parent: cur.id, path };
        cur.kids = cur.kids || [null, null];
        cur.kids[+bit] = path;
        cur = nodes[path];
      });
      cur.leaf = letter;
    });
    const edges = [];
    const order = [];
    (function walk(id) {
      const n = nodes[id];
      if (n.leaf) order.push(n.leaf);
      (n.kids || []).forEach((k, bit) => {
        if (k) {
          edges.push([id, k, bit]);
          walk(k);
        }
      });
    })("root");
    return { nodes, edges, order, maxDepth: Math.max(...Object.values(nodes).map((n) => n.depth)), root: "root" };
  }
  const readings = (codes, stream) => {
    const out = [];
    (function go(i, acc) {
      if (i === stream.length) return out.push(acc);
      Object.entries(codes).forEach(([c, w]) => stream.startsWith(w, i) && go(i + w.length, [...acc, c]));
    })(0, []);
    return out.sort((a, b) => b.length - a.length);
  };
  const BAD = { codes: { A: "0", B: "1", C: "01" }, stream: "01" };
  BAD.readings = readings(BAD.codes, BAD.stream);
  const PREFIX = (() => {
    const codes = { A: "0", B: "10", C: "110", D: "111" };
    const stream = "010110";
    const tree = codeTree(codes);
    const inv = Object.fromEntries(Object.entries(codes).map(([c, w]) => [w, c]));
    const walk = [];
    let cur = "root";
    let out = "";
    let start = 0;
    [...stream].forEach((bit, i) => {
      const to = tree.nodes[cur].kids[+bit];
      const leaf = tree.nodes[to].leaf;
      if (leaf) out += leaf;
      walk.push({ i, bit, from: cur, to, leaf, out, start, end: leaf ? i + 1 : null });
      if (leaf) start = i + 1;
      cur = leaf ? "root" : to;
    });
    return { codes, stream, out, tree, walk, inv };
  })();

  // ---------- Huffman's algorithm (scenes 6 and 7) ----------
  function huffman(items) {
    let uid = 0;
    const leaves = items.map(([s, w]) => ({ uid: uid++, s, w, leaf: true }));
    let q = leaves.slice();
    const merges = [];
    while (q.length > 1) {
      q.sort((a, b) => a.w - b.w || b.leaf - a.leaf || a.uid - b.uid);
      const [x, y] = q;
      const [lo, hi] = x.w <= y.w ? [x, y] : [y, x];
      const nd = { uid: uid++, w: x.w + y.w, kids: [lo, hi] };
      merges.push({ x: lo, y: hi, nd });
      q = q.filter((k) => k !== x && k !== y);
      q.push(nd);
    }
    const root = q[0];
    const idOf = (n) => (n.leaf ? n.s : idOf(n.kids[0]) + idOf(n.kids[1]));
    const nodes = {};
    let leafNo = 0;
    (function build(n, parent, depth, path) {
      const id = idOf(n);
      const rec = { id, w: n.w, leaf: !!n.leaf, kids: n.leaf ? null : n.kids.map(idOf), parent, depth, path, lo: leafNo, hi: 0 };
      nodes[id] = rec;
      if (n.leaf) leafNo++;
      else n.kids.forEach((k, bit) => build(k, id, depth + 1, path + bit));
      rec.hi = leafNo;
    })(root, null, 0, "");
    const height = (id) => (nodes[id].kids ? 1 + Math.max(...nodes[id].kids.map(height)) : 0);
    Object.keys(nodes).forEach((id) => (nodes[id].height = height(id)));
    const rootId = idOf(root);
    const order = [...Object.values(nodes)].filter((n) => n.leaf).sort((a, b) => a.lo - b.lo).map((n) => n.id);
    const byPos = (ids) => ids.sort((a, b) => nodes[a].lo - nodes[b].lo);
    let cost = 0;
    const log = merges.map((m, i) => {
      cost += m.nd.w;
      const done = new Set(merges.slice(0, i + 1).flatMap((mm) => [idOf(mm.x), idOf(mm.y)]));
      const made = merges.slice(0, i + 1).map((mm) => idOf(mm.nd));
      const roots = byPos([...order, ...made].filter((id) => !done.has(id)));
      return { n: i + 1, a: idOf(m.x), b: idOf(m.y), id: idOf(m.nd), w: m.nd.w, cost, roots };
    });
    const roots = [order.slice(), ...log.map((m) => m.roots)];
    const smallest = log.map((m) => [m.a, m.b]);
    const edges = [];
    (function walk(id) {
      (nodes[id].kids || []).forEach((k, bit) => {
        edges.push([id, k, bit]);
        walk(k);
      });
    })(rootId);
    const codes = Object.fromEntries(order.map((id) => [id, nodes[id].path]));
    const total = sum(items.map(([, w]) => w));
    const L = sum(order.map((id) => (nodes[id].w / total) * codes[id].length));
    const H = entropy(items.map(([, w]) => w / total));
    return { items, nodes, root: rootId, order, maxDepth: Math.max(...order.map((id) => nodes[id].depth)), merges: log, roots, smallest, edges, codes, L, H, fixedBits: Math.ceil(lg(items.length)), costs: log.map((m) => m.cost) };
  }
  const HUFF = huffman(ORDER.map((c) => [c, PCT[c]]));
  const ENCODE = (() => {
    const codes = [...MSG].map((c) => HUFF.codes[c]);
    const fixed = [...MSG].map((c) => FIXED[c]);
    return { msg: MSG, codes, bits: codes.join(""), count: codes.join("").length, fixed, fixedBits: fixed.join(""), fixedCount: fixed.join("").length, saved: fixed.join("").length - codes.join("").length };
  })();

  // ---------- LZW (scenes 8, 9 and 10) ----------
  function lzwEncode(text, alpha) {
    const d = new Map(alpha.map((c, i) => [c, i]));
    let w = text[0];
    let wFrom = 0;
    const codes = [];
    const steps = [];
    const chunks = [];
    const emit = (code, from, to) => {
      codes.push(code);
      chunks.push({ text: text.slice(from, to), from, to, code });
    };
    for (let i = 1; i <= text.length; i++) {
      const c = text[i];
      const last = i === text.length;
      if (!last && d.has(w + c)) {
        steps.push({ k: steps.length, i, w, c, act: "grow", add: null, wFrom, wTo: i, wTo2: i + 1, codes: codes.slice() });
        w += c;
      } else if (!last) {
        const add = { idx: d.size, text: w + c };
        emit(d.get(w), wFrom, i);
        steps.push({ k: steps.length, i, w, c, act: "emit", code: d.get(w), add, wFrom, wTo: i, wTo2: i + 1, codes: codes.slice() });
        d.set(w + c, d.size);
        w = c;
        wFrom = i;
      } else {
        emit(d.get(w), wFrom, i);
        steps.push({ k: steps.length, i, w, c: null, act: "final", code: d.get(w), add: null, wFrom, wTo: i, wTo2: i, codes: codes.slice() });
      }
    }
    const dict = [...d].map(([t, idx]) => ({ idx, text: t })).sort((a, b) => a.idx - b.idx);
    return { text, alpha, steps, codes, chunks, dict, entries: dict.slice(alpha.length) };
  }
  function lzwDecode(codes, alpha) {
    const d = alpha.slice();
    let prev = "";
    let out = "";
    const steps = codes.map((code, k) => {
      const known = code < d.length;
      const entry = known ? d[code] : prev + prev[0];
      const added = prev ? { idx: d.length, text: prev + entry[0] } : null;
      if (added) d.push(added.text);
      const outFrom = out.length;
      out += entry;
      const rec = { k, code, prev, known, entry, added, out, outFrom, outTo: out.length, missing: !known };
      if (!known) rec.rule = { prev, first: prev[0], text: entry };
      prev = entry;
      return rec;
    });
    return { steps, out, dict: d };
  }
  const LZW = lzwEncode("ABABABABA", ["A", "B"]);
  const LZW_DEC = lzwDecode(LZW.codes, LZW.alpha);
  const GIF = (() => {
    const alpha = ["A", "B", "C", "D"];
    const mk = (text) => {
      const r = lzwEncode(text, alpha);
      return { text, count: r.codes.length, chunks: r.chunks, codes: r.codes };
    };
    return { alpha, tones: { A: "green", B: "blue", C: "purple", D: "orange" }, flat: mk("AAAAAABBBCCCCCDDDD"), noisy: mk("DBCBAABDADDCDDACCA") };
  })();

  // ---------- assert every number the storyboard quotes ----------
  same("letters rarest first", ORDER, ["C", "E", "D", "A", "B"]);
  same("fixed code", FIXED, { C: "000", E: "001", D: "010", A: "011", B: "100" });
  same("redundancy", [REDUNDANCY.fixedTotal, REDUNDANCY.shortTotal, REDUNDANCY.saved, REDUNDANCY.counts.B], [21, 15, 6, 3]);
  same("ladder bits", LADDER.map((r) => r.bits), [0, 1, 2, 3, 4]);
  same("die bits", DIE.bits, [1, 2, 3, 3]);
  close("die entropy", DIE.H, 1.75);
  same("die shares", DIE.share, [0.5, 0.5, 0.375, 0.375]);
  same("sample", [SAMPLE.bits, SAMPLE.total, SAMPLE.fixedTotal, SAMPLE.perSymbol], [[1, 2, 1, 1, 3, 1, 2, 3], 14, 16, 1.75]);
  same("bad code readings", BAD.readings, [["A", "B"], ["C"]]);
  same("prefix decode", [PREFIX.out, PREFIX.walk.map((s) => s.to)], ["ABC", ["0", "1", "10", "1", "11", "110"]]);
  same("huffman codes", HUFF.codes, { C: "000", E: "001", D: "010", A: "011", B: "1" });
  same("huffman merges", HUFF.merges.map((m) => [m.a, m.b, m.id, m.w, m.cost]), [["C", "E", "CE", 20, 20], ["D", "A", "DA", 29, 49], ["CE", "DA", "CEDA", 49, 98], ["CEDA", "B", "CEDAB", 100, 198]]);
  same("huffman roots", HUFF.roots, [["C", "E", "D", "A", "B"], ["CE", "D", "A", "B"], ["CE", "DA", "B"], ["CEDA", "B"], ["CEDAB"]]);
  same("huffman order", HUFF.order, ["C", "E", "D", "A", "B"]);
  close("huffman L", HUFF.L, 1.98, 1e-9);
  close("huffman H", HUFF.H, 1.964, 0.0006);
  same("encode", [ENCODE.bits, ENCODE.count, ENCODE.fixedCount, ENCODE.saved], ["110110100011000", 15, 21, 6]);
  same("short codes match huffman", REDUNDANCY.short, ENCODE.codes);
  same("lzw codes", LZW.codes, [0, 1, 2, 4, 3]);
  same("lzw acts", LZW.steps.map((s) => s.act), ["emit", "emit", "grow", "emit", "grow", "grow", "emit", "grow", "final"]);
  same("lzw dictionary", LZW.dict.map((e) => `${e.idx}${e.text}`), ["0A", "1B", "2AB", "3BA", "4ABA", "5ABAB"]);
  same("lzw chunks", LZW.chunks.map((c) => c.text), ["A", "B", "AB", "ABA", "BA"]);
  same("lzw decode", [LZW_DEC.out, LZW_DEC.steps.map((s) => s.entry), LZW_DEC.steps.map((s) => s.missing)], ["ABABABABA", ["A", "B", "AB", "ABA", "BA"], [false, false, false, true, false]]);
  same("lzw decode adds", LZW_DEC.steps.map((s) => (s.added ? `${s.added.idx}${s.added.text}` : "")), ["", "2AB", "3BA", "4ABA", "5ABAB"]);
  same("gif flat", [GIF.flat.count, GIF.flat.chunks.map((c) => c.text).join("|")], [11, "A|AA|AAA|B|BB|C|CC|CC|D|DD|D"]);
  same("gif flat codes (the lesson counts palette entries from 1)", GIF.flat.codes.map((c) => c + 1), [1, 5, 6, 2, 8, 3, 10, 10, 4, 13, 4]);
  same("gif noisy", GIF.noisy.count, 17);

  Object.assign(A7, {
    TONES, rng, same, close, sum, mix, cyc, fmtW, fmtBits, entropy, surprise, ek,
    LETTERS, PCT, MSG, ORDER, FIXED, REDUNDANCY, LADDER, DIE, SAMPLE, BAD, PREFIX, HUFF, ENCODE, LZW, LZW_DEC, GIF,
    codeTree, huffman, lzwEncode, lzwDecode,
  });
})();
