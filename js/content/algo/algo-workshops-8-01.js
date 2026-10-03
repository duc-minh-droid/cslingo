/* Algorithms, Phase 8 workshop: "Poke a blockchain" (no code).
   A tiny chain with the lecture's toy hash (djb2) and leading-hex-zero proof of work. Every hash, nonce and count
   comes from really running the hash; nothing shown is typed in.
   Plain djb2 is used as in the lecture, then scrambled once more (murmur3's finaliser). Reason: djb2 only mixes its
   last characters into the LOW bits, so the leading hex digits barely change when the nonce changes and mining for
   leading zeros can take thousands of tries even at 1 zero. The scramble gives the honest 16x-per-zero difficulty. */
(function () {
  const partScope = (NIC.shared.algoWorkshops8 = NIC.shared.algoWorkshops8 || {});

  const N = NIC;

  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);

  const djb2 = (s) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };
  const fmix = (h) => {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  };
  const hashOf = (b) =>
    fmix(parseInt(djb2(`${b.nonce}|${b.i}|${b.data}|${b.prev}`), 16))
      .toString(16)
      .padStart(8, "0");
  const zeros = (h) => {
    let k = 0;
    while (k < h.length && h[k] === "0") k++;
    return k;
  };
  const DATA = [
    ["genesis", "genesis"],
    ["alice pays bob 5", "alice pays mallory 50"],
    ["bob pays carol 2", "bob pays mallory 20"],
    ["carol pays dave 1", "carol pays mallory 10"],
  ];

  function tiles(h, target) {
    return h
      .split("")
      .map((c, i) => {
        const inZ = i < target;
        let cls = "";
        if (inZ) {
          const ok = h.slice(0, i + 1) === "0".repeat(i + 1);
          cls = ok ? "z" : h.slice(0, i) === "0".repeat(i) ? "x" : "m";
        }
        return `<i class="${cls}">${c}</i>`;
      })
      .join("");
  }
  Object.assign(partScope, { DATA, fxOn, hashOf, snd, tiles, zeros });
})();
