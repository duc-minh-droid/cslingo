/* Algorithms, Phase 6 workshop: a hands-on noisy channel (no code).
   6.W "Workshop: noisy wire". Parity, CRC and Hamming(7,4), using the exact schemes from the lecture.
   Every number (counts, remainders, syndromes) is computed from the bits on screen. */
(function () {
  const partScope = (NIC.shared.algoWorkshops6 = NIC.shared.algoWorkshops6 || {});

  const N = NIC,
    { qs, qsa } = N;

  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);

  /* ---------- the real algorithms ---------- */
  const GEN = "1101",
    MSG4 = "1011";
  const crcDivide = (bits, gen) => {
    const m = bits.split("").map(Number),
      g = gen.split("").map(Number),
      steps = [];
    for (let i = 0; i <= m.length - g.length; i++) {
      if (!m[i]) continue;
      for (let j = 0; j < g.length; j++) m[i + j] ^= g[j];
      steps.push({ at: i, reg: m.join("") });
    }
    return { rem: m.slice(-(g.length - 1)).join(""), steps };
  };
  const CRC_REM = crcDivide(MSG4 + "0".repeat(GEN.length - 1), GEN).rem; // "100"
  const CRC_FRAME = (MSG4 + CRC_REM).split("").map(Number); // 1011100
  const PAR_DATA = [1, 0, 1, 1, 0, 0, 1];
  const PAR_FRAME = PAR_DATA.concat([PAR_DATA.reduce((a, b) => a + b, 0) % 2]); // even parity: 10110010
  // Hamming(7,4): positions 1..7 (index 0 = position 1), parity bits at 1, 2, 4, data at 3, 5, 6, 7, even parity
  const hEncode = (d) => {
    const c = [0, 0, d[0], 0, d[1], d[2], d[3]];
    c[0] = c[2] ^ c[4] ^ c[6];
    c[1] = c[2] ^ c[5] ^ c[6];
    c[3] = c[4] ^ c[5] ^ c[6];
    return c;
  };
  const hChecks = (c) => ({
    p1: c[0] ^ c[2] ^ c[4] ^ c[6],
    p2: c[1] ^ c[2] ^ c[5] ^ c[6],
    p4: c[3] ^ c[4] ^ c[5] ^ c[6],
  }); // 1 = that check fails
  const hSyn = (c) => {
    const k = hChecks(c);
    return k.p4 * 4 + k.p2 * 2 + k.p1;
  };
  const hData = (c) => [c[2], c[4], c[5], c[6]];
  const diffIdx = (a, b) => a.reduce((o, v, i) => (v !== b[i] ? o.concat(i) : o), []);

  /* ---------- a bit strip: fixed sender row, tappable receiver row ---------- */
  function strip(host, { sent, rx, labels, tone, onTap, cls = "" }) {
    host.className = "aw6-strip " + cls;
    host.innerHTML = sent
      .map(
        (_, i) =>
          `<div class="aw6-cell ${tone ? tone(i) : ""}"><button class="aw6-bit" data-i="${i}" aria-label="Bit ${i + 1}"></button><small>${labels ? labels[i] : ""}</small></div>`,
      )
      .join("");
    const btn = (i) => qs(`[data-i="${i}"]`, host);
    const api = {
      paint(flash) {
        sent.forEach((_, i) => {
          const b = btn(i),
            v = rx ? rx[i] : sent[i];
          if (b.textContent !== String(v)) b.textContent = v;
          const fl = rx && v !== sent[i];
          b.classList.toggle("flipped", !!fl);
          b.classList.toggle("one", v === 1);
          b.setAttribute("aria-pressed", fl ? "true" : "false");
        });
        if (flash !== undefined && fxOn()) {
          const b = btn(flash);
          N.fx.bump(b, { scale: 1.25 });
        }
      },
      btn,
    };
    if (onTap) qsa(".aw6-bit", host).forEach((b) => (b.onclick = () => onTap(+b.dataset.i)));
    else
      qsa(".aw6-bit", host).forEach((b) => {
        b.disabled = true;
        b.tabIndex = -1;
      });
    api.paint();
    return api;
  }

  const wire = (noisy) =>
    `<div class="aw6-wire${noisy ? " noisy" : ""}" aria-hidden="true"><i></i><i></i><i></i><span class="aw6-bolt">noise</span></div>`;
  Object.assign(partScope, {
    CRC_FRAME,
    CRC_REM,
    PAR_FRAME,
    crcDivide,
    diffIdx,
    fxOn,
    hChecks,
    hData,
    hEncode,
    hSyn,
    snd,
    strip,
    wire,
  });
})();
