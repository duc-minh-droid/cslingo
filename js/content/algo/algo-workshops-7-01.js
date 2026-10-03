/* Algorithms, Phase 7 workshop: build a Huffman tree by hand (no code).
   7.W "Workshop: build the tree". Every number comes from running the real greedy algorithm. */
(function () {
  const partScope = (NIC.shared.algoWorkshops7 = NIC.shared.algoWorkshops7 || {});

  const N = NIC;

  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);
  const wait = (ms) => new Promise((r) => setTimeout(r, fxOn() ? ms : 0));

  // A weather station reports one symbol per hour. 46 hours of reports:
  const SYMS = [
    { s: "S", name: "Sun", f: 18, c: "teal" },
    { s: "C", name: "Cloud", f: 11, c: "blue" },
    { s: "R", name: "Rain", f: 8, c: "violet" },
    { s: "W", name: "Wind", f: 5, c: "amber" },
    { s: "F", name: "Fog", f: 3, c: "rose" },
    { s: "H", name: "Hail", f: 1, c: "dim" },
  ];
  const MSG = ["S", "S", "C", "S", "R", "F"]; // the forecast to encode at the end
  const SLOT = 66,
    DY = 64,
    YB = 348,
    X0 = 12,
    VBW = X0 * 2 + SLOT * SYMS.length,
    VBH = 380;

  /** Cost of finishing greedily from these weights (sum of every merge). */
  function greedyCost(ws) {
    const q = ws.slice().sort((a, b) => a - b);
    let c = 0;
    while (q.length > 1) {
      const a = q.shift(),
        b = q.shift();
      c += a + b;
      q.push(a + b);
      q.sort((x, y) => x - y);
    }
    return c;
  }
  const log2 = Math.log2;
  const TOTAL = SYMS.reduce((s, x) => s + x.f, 0);
  const ENTROPY = SYMS.reduce((s, x) => s - (x.f / TOTAL) * log2(x.f / TOTAL), 0); // bits per symbol
  const FIXED_LEN = Math.ceil(log2(SYMS.length));
  Object.assign(partScope, {
    DY,
    ENTROPY,
    FIXED_LEN,
    MSG,
    SLOT,
    SYMS,
    TOTAL,
    VBH,
    VBW,
    X0,
    YB,
    fxOn,
    greedyCost,
    snd,
    wait,
  });
})();
