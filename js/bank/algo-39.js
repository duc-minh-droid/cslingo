(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const {
    arrow,
    blockHash,
    circ,
    cross,
    f1,
    figArrows,
    figWeightPanels,
    lines,
    ln,
    mineBlock,
    pk,
    rc,
    scrambled,
    svg,
    tick,
    tint,
    tx,
    zeros,
  } = partScope;
  const B = NIC.bank;

  // A3: heatmap of attention received
  function figHeat() {
    const toks = ["the", "cat", "sat", "down"],
      M = [
        [0.1, 0.5, 0.3, 0.1],
        [0.05, 0.15, 0.7, 0.1],
        [0.1, 0.55, 0.25, 0.1],
        [0.05, 0.55, 0.3, 0.1],
      ];
    const x0 = 78,
      y0 = 62,
      cw = 56,
      ch = 38;
    let s =
      tx(8, 16, "Rows: the token that is looking.", { a: "start", s: 11, c: "var(--text-dim)" }) +
      tx(8, 32, "Columns: the token looked at. Each row adds to 1.", { a: "start", s: 11, c: "var(--text-dim)" });
    toks.forEach(
      (t, c) =>
        (s += pk(
          `c${c}`,
          rc(x0 + c * cw + 2, y0 - 26, cw - 4, 22, "p", { r: 7 }) + tx(x0 + c * cw + cw / 2, y0 - 10, t, { s: 12 }),
        )),
    );
    M.forEach((row, r) => {
      s += tx(x0 - 8, y0 + r * ch + ch / 2 + 4, toks[r], { a: "end", s: 12, c: "var(--text-dim)" });
      row.forEach(
        (v, c) =>
          (s +=
            `<rect x="${x0 + c * cw + 2}" y="${y0 + r * ch + 2}" width="${cw - 4}" height="${ch - 4}" rx="5" fill="${tint("var(--blue)", Math.round(v * 120))}" stroke="var(--line)" stroke-width="1"/>` +
            tx(x0 + c * cw + cw / 2, y0 + r * ch + ch / 2 + 4, v.toFixed(2), { s: 12 })),
      );
    });
    return svg(
      310,
      y0 + 4 * ch + 4,
      s,
      "Four by four heatmap of attention weights between the tokens the, cat, sat, down",
    );
  }

  B.add("a10-attn", [
    {
      type: "pick",
      q: "One token has the query <b>q = (2, 2)</b> (blue). Its score for a key is the dot product q · k. Tap the key that gets the <b>highest score</b>.",
      fig: figArrows(),
      a: "B",
      hint: "Dot product = (q across × k across) + (q up × k up).",
      why: "q · B = 2×4 + 2×1 = 10, q · C = 6, q · A = 4 and q · D = 2. A points exactly the same way as q but is short, and B is longer and a little off-angle. The dot product rewards both alignment and size, so it is not the same as “whose tip is nearest” (A's is).",
    },
    {
      type: "pick",
      q: "A head with d_k = 4 gets raw dot-product scores [4, 2, 0] for three keys. It divides by √d_k before softmax. Tap the panel that shows the <b>final weights</b>.",
      fig: figWeightPanels(),
      a: "B",
      hint: "√4 = 2, so the scores become 2, 1, 0 (and e ≈ 2.7).",
      why: "Dividing by √4 = 2 turns [4, 2, 0] into [2, 1, 0], whose softmax is about 0.67, 0.24, 0.09 (panel B). Panel A skipped the scaling, so it is too sharp. Panel C divided by d_k = 4 instead of √d_k, a common slip, which over-flattens it.",
    },
    {
      type: "pick",
      q: "Four tokens attend to each other with no mask. The biggest single cell is cat → sat (0.70). Add up each column in your head. Which token receives the most attention <b>overall</b>? Tap its header.",
      fig: figHeat(),
      a: "c1",
      hint: "Column “cat”: 0.50 + 0.15 + 0.55 + 0.55. Column “sat”: 0.30 + 0.70 + 0.25 + 0.30.",
      why: "Reading down a column gives how much attention a token receives: cat gets 0.50 + 0.15 + 0.55 + 0.55 = 1.75, sat only 1.55 even though it holds the largest single cell. Reading along a row instead shows who one token listens to, and each row adds to 1. Column totals do not have to.",
    },
    {
      type: "bug",
      q: "Rows of <code>s</code> are queries, columns are keys. <code>softmax(s, axis=k)</code> makes the numbers along axis <i>k</i> add up to 1 (axis 0 runs down the rows, axis 1 runs along them). The code runs without error, but a token's weights no longer add up to 1. Click the faulty line.",
      code: [
        "def attend(Q, K, V, d_k):",
        "    s = Q @ K.T / math.sqrt(d_k)",
        "    w = softmax(s, axis=0)",
        "    return w @ V",
      ],
      a: 2,
      why: "Each query needs its shares across <b>all the keys</b>, which means normalising along each row, <code>axis=1</code> (or −1). With <code>axis=0</code> each column adds to 1 instead, so a token's weights over the keys can total anything.",
    },
  ]);

  /* ================================================================== a8-chain (workshop) ================================================================== */

  // C1: cards after a Verify
  function figVerifiedChain() {
    const cards = [
      ["Genesis", "sealed", "g"],
      ["Block 1", "sealed", "g"],
      ["Block 2", "seal broken", "r"],
      ["Block 3", "after a break", "n"],
    ];
    let s = "";
    cards.forEach(([t, st, k], i) => {
      const x = 6 + i * 84;
      s += pk(
        `b${i}`,
        rc(x, 12, 78, 62, k, { r: 10, d: i === 3 ? "5 4" : "", st: i === 3 ? "var(--rose)" : undefined }) +
          tx(x + 39, 34, t, { s: 13 }) +
          tx(x + 39, 58, st, { s: 11, c: k === "g" ? "var(--teal-ink)" : "var(--rose-ink)" }),
      );
    });
    const link = (x, ok, t) =>
      (ok ? tick(x, 102) : cross(x, 100)) +
      tx(x + 12, 106, t, { a: "start", s: 12, c: ok ? "var(--teal-ink)" : "var(--rose-ink)" });
    s +=
      tx(8, 106, "Links:", { a: "start", s: 12, c: "var(--text-dim)" }) +
      link(70, true, "0 to 1") +
      link(142, true, "1 to 2") +
      link(214, false, "2 to 3: prev ≠ hash");
    return svg(
      340,
      118,
      s,
      "Four block cards after Verify: block 2 has a broken seal and the link from block 2 to block 3 is broken",
    );
  }

  // C2: dot plot of tries
  function figTriesDots() {
    const need = 2,
      tries = [];
    for (let i = 0; i < 16; i++) {
      let n = 1;
      while (!scrambled(`${n}|blk ${i}`).startsWith("0".repeat(need))) n++;
      tries.push(n);
    }
    const X = (v) => 22 + (v / 800) * 296,
      cnt = {};
    let s = ln(22, 150, 318, 150, { c: "var(--text-faint)", w: 2 });
    [0, 200, 400, 600, 800].forEach(
      (v) =>
        (s +=
          ln(X(v), 150, X(v), 155, { c: "var(--text-faint)", w: 2 }) +
          tx(X(v), 170, v, { s: 11, c: "var(--text-dim)" })),
    );
    tries.forEach((t) => {
      const b = Math.floor(t / 100);
      cnt[b] = (cnt[b] || 0) + 1;
      s += circ(X(b * 100 + 50), 150 - 9 - (cnt[b] - 1) * 17, 7, "b", {
        f: "var(--blue)",
        st: "var(--blue-ink)",
        sw: 1.5,
      });
    });
    s +=
      ln(X(256), 24, X(256), 150, { c: "var(--amber)", w: 2.5, d: "5 4" }) +
      tx(X(256) + 5, 34, "16 × 16 = 256", { a: "start", s: 12, c: "var(--amber-ink)" });
    s += tx(170, 190, "nonces tried before the hash started with 00", { s: 12, c: "var(--text-dim)" });
    return svg(340, 200, s, "Dot plot of the number of nonces tried for 16 blocks at difficulty 2");
  }

  // C4: before and after Re-link, built by really mining a chain
  function figRelink() {
    const DATA = ["genesis", "alice pays bob 5", "bob pays carol 2", "carol pays dave 1"],
      bl = DATA.map((d, i) => ({ i, data: d, nonce: 0, prev: "00000000" }));
    mineBlock(bl[0], 2);
    for (let i = 1; i < 4; i++) {
      bl[i].prev = blockHash(bl[i - 1]);
      mineBlock(bl[i], 2);
    }
    const stale = bl.map((b) => ({ ...b }));
    stale[1].data = "alice pays mallory 50";
    const linked = stale.map((b) => ({ ...b }));
    for (let i = 1; i < 4; i++) linked[i].prev = blockHash(linked[i - 1]);
    const mark = (x, y, ok) => (ok ? tick(x, y) : cross(x, y - 1));
    const panel = (y0, title, ch) => {
      let s =
        tx(8, y0, title, { a: "start", s: 13 }) +
        tx(86, y0 + 20, "prev", { s: 11, c: "var(--text-faint)" }) +
        tx(182, y0 + 20, "own hash", { s: 11, c: "var(--text-faint)" }) +
        tx(262, y0 + 20, "link", { s: 11, c: "var(--text-faint)" }) +
        tx(306, y0 + 20, "seal", { s: 11, c: "var(--text-faint)" });
      for (let i = 1; i < 4; i++) {
        const b = ch[i],
          h = blockHash(b),
          y = y0 + 28 + (i - 1) * 26,
          linkOk = b.prev === blockHash(ch[i - 1]),
          sealOk = zeros(h) >= 2;
        s +=
          tx(8, y + 17, `block ${i}`, { a: "start", s: 12, c: "var(--text-dim)" }) +
          tx(86, y + 17, b.prev, { m: 1, s: 12, c: linkOk ? "var(--ink)" : "var(--rose-ink)" }) +
          tx(182, y + 17, h, { m: 1, s: 12, c: sealOk ? "var(--teal-ink)" : "var(--rose-ink)" }) +
          mark(262, y + 13, linkOk) +
          mark(306, y + 13, sealOk);
      }
      return s;
    };
    return svg(
      330,
      252,
      panel(16, "After editing block 1", stale) +
        ln(8, 128, 322, 128, { c: "var(--line)", w: 1.5 }) +
        panel(148, "After pressing Re-link, no mining", linked),
      "Two small tables of prev and hash values for blocks 1 to 3, before and after re-linking",
    );
  }

  // C5: a timeline of the repair bill
  function figRepairBar() {
    let s = tx(8, 16, "After editing block 1", { a: "start", s: 12, c: "var(--text-dim)" });
    ["Re-mine block 1", "Re-mine block 2", "Re-mine block 3"].forEach((t, i) => {
      s +=
        rc(8 + i * 98, 26, 94, 44, "a", { r: 8 }) +
        lines(55 + i * 98, 46, [t.split(" ").slice(0, 2).join(" "), t.split(" ").slice(2).join(" ")], {
          s: 12,
          c: "var(--amber-ink)",
          lh: 14,
        });
    });
    s += rc(306, 26, 26, 44, "g", { r: 8 }) + tx(319, 52, "✓", { s: 15, c: "var(--teal-ink)" });
    s +=
      arrow(8, 94, 330, 94, "var(--text-faint)") +
      tx(8, 112, "time", { a: "start", s: 11, c: "var(--text-faint)" }) +
      tx(319, 112, "check", { a: "end", s: 11, c: "var(--text-faint)" });
    s += tx(170, 134, "each block needs a hash starting with 00", { s: 12, c: "var(--text-dim)" });
    return svg(
      340,
      144,
      s,
      "Timeline: after the edit, three blocks are re-mined one after another, then a quick check at the end",
    );
  }

  // C6: the Verify walk as a flow chart
  function figVerifyFlow() {
    const S = [
      ["l1", "1 · Block 1", ["link: prev is", "genesis hash?"]],
      ["s1", "2 · Block 1", ["seal: hash", "starts 00?"]],
      ["l2", "3 · Block 2", ["link: prev is", "block 1's hash?"]],
      ["s2", "4 · Block 2", ["seal: hash", "starts 00?"]],
      ["l3", "5 · Block 3", ["link: prev is", "block 2's hash?"]],
      ["s3", "6 · Block 3", ["seal: hash", "starts 00?"]],
    ];
    let s = tx(172, 14, "Walk order 1 to 6. It stops at the first failure.", { s: 12, c: "var(--text-dim)" });
    S.forEach(([id, b, t], i) => {
      const col = i % 3,
        row = i < 3 ? 0 : 1,
        x = 6 + col * 114,
        y = 26 + row * 82;
      s += pk(
        id,
        rc(x, y, 100, 58, "p") +
          tx(x + 50, y + 16, b, { s: 11.5, c: "var(--text-dim)" }) +
          lines(x + 50, y + 33, t, { s: 11, lh: 13 }),
      );
      if (col < 2) s += arrow(x + 102, y + 29, x + 112, y + 29, "var(--text-faint)");
    });
    s += `<path d="M 290 86 L 290 98 L 56 98 L 56 104" fill="none" stroke="var(--text-faint)" stroke-width="2" stroke-linejoin="round"/><polygon points="56,108 51,100 61,100" fill="var(--text-faint)"/>`;
    return svg(
      332,
      172,
      s,
      "Flow chart of six checks, a link check then a seal check for each of blocks 1, 2 and 3, in order",
    );
  }

  B.add("a8-chain", [
    {
      type: "pick",
      q: "Someone edited the data of exactly <b>one</b> block, then you pressed Verify. The chain now looks like this. Which block's data was edited? Tap it.",
      fig: figVerifiedChain(),
      a: "b2",
      why: "Editing a block changes its own hash, so its seal breaks (block 2 shows ✗ seal broken) and the next block's stored prev no longer matches (the 2→3 link shows prev ≠ hash). Block 3 only looks bad because it points at a block whose hash changed. Block 3's own data is fine.",
    },
    {
      type: "mcq",
      q: "Sixteen blocks were each mined with the same puzzle: a hash starting with <b>00</b>. The dots show how many nonces each block needed. What does the spread tell you?",
      fig: figTriesDots(),
      o: [
        "Every guess is an independent 1-in-256 shot, so luck swings widely around about 256",
        "The quick blocks used a smarter nonce order that the slow blocks could have copied too",
        "The difficulty was lowered for the quick blocks and raised again for the slow ones",
        "Mining gets steadily easier as the chain grows, so later blocks should always be quicker",
      ],
      a: 0,
      why: "Each nonce is a fresh, unpredictable hash with a 1-in-256 chance of starting 00, so the count to the first win varies a lot (some blocks got lucky in 5 tries, one needed over 700), but averages near 256. There is no better strategy than guessing, and the difficulty here never changed.",
    },
    {
      type: "cat",
      q: "The target is two leading hex zeros, <b>00</b>. Sort each hash by whether it seals a block.",
      buckets: ["Seals at 2 zeros", "Doesn't seal"],
      items: [
        ["<code>00a32139</code>", 0],
        ["<code>0a22e6db</code>", 1],
        ["<code>80378a61</code>", 1],
        ["<code>000d98d4</code>", 0],
        ["<code>0c257d45</code>", 1],
        ["<code>00e9a037</code>", 0],
      ],
      why: "Only zeros at the very <b>start</b> count, and you need two of them in a row. <code>0a22e6db</code> and <code>0c257d45</code> have one, <code>80378a61</code> has a zero in the wrong place, and <code>000d98d4</code> has three, which is more than enough.",
    },
    {
      type: "mcq",
      q: "Block 1 was edited and the chain mined as in the workshop. After pressing <b>Re-link, no mining</b> every prev matches the block before it, yet blocks 2 and 3 now fail their seals. Why?",
      fig: figRelink(),
      o: [
        "prev is part of what a block hashes, so fixing it changed the hash and the zeros vanished",
        "Re-link wipes every nonce, so each block has to be mined again from nothing at all, in order",
        "Only block 1 was ever edited, so the seals on later blocks switch themselves off with it too",
        "Re-link copies the wrong hash into each prev, so the links are still broken in the picture",
      ],
      a: 0,
      why: "A block's hash is computed from its nonce, data <b>and prev</b>. Block 2's prev changed, so its hash changed to <code>3b1fd712</code>, which no longer starts with 00 (the nonce was found for the old prev). The same ripples to block 3. Fixing pointers is free; the proof of work is not.",
    },
    {
      type: "slider",
      q: "After the edit you must re-mine blocks 1, 2 <b>and</b> 3 in turn, each needing a hash that starts <b>00</b>. About how many hashes will that take in total, on average?",
      fig: figRepairBar(),
      min: 0,
      max: 1500,
      step: 50,
      ans: 750,
      tol: 150,
      unit: " hashes",
      hint: "Two hex zeros means 16 × 16 tries for one block. Then ×3.",
      why: "Each block needs about 16 × 16 = 256 guesses, so three blocks need about 3 × 256 = 768. Checking the finished chain costs only a hash or two per block. That gap, hundreds of guesses against one hash to verify, is what makes history expensive to rewrite and cheap to audit.",
    },
    {
      type: "pick",
      q: "Block 1's data was edited and nothing has been re-mined. You press Verify, which walks the checks in order and stops at the first failure. Which check is the first to fail? Tap it.",
      fig: figVerifyFlow(),
      a: "s1",
      why: "Block 1's link check still passes (its prev is the genesis hash, which did not change). Its own hash changed, so its seal fails and the walk stops there. Blocks 2 and 3 have broken links too, but Verify never gets that far, which is why it can report the break after just a couple of hashes.",
    },
  ]);

  /* ================================================================== a9-mix (workshop) ================================================================== */

  // M1: faders and three candidate spectra
  function figMixerBoard() {
    const fader = (y, name, f, a) => {
      const tr = (x0, v, vmax, lab) =>
        ln(x0, y + 16, x0 + 100, y + 16, { c: "var(--line-2)", w: 4 }) +
        circ(x0 + (v / vmax) * 100, y + 16, 8, "b", { f: "var(--blue)", st: "var(--blue-ink)", sw: 1.5 }) +
        tx(x0 + 50, y + 40, lab, { s: 12, c: "var(--text-dim)" });
      return (
        tx(8, y + 21, name, { a: "start", s: 13 }) + tr(80, f, 12, `frequency ${f} Hz`) + tr(214, a, 1, `strength ${a}`)
      );
    };
    let s = fader(4, "Wave 1", 3, 1) + fader(56, "Wave 2", 8, 0.5);
    const opts = [
      [
        "A",
        [
          [3, 0.5],
          [8, 1],
        ],
      ],
      [
        "B",
        [
          [3, 1],
          [11, 0.5],
        ],
      ],
      [
        "C",
        [
          [3, 1],
          [8, 0.5],
        ],
      ],
    ];
    opts.forEach(([id, bars], p) => {
      const x0 = 6 + p * 112;
      let g = rc(x0, 116, 104, 100, "p", { r: 10 }) + tx(x0 + 52, 134, `Spectrum ${id}`, { s: 12 });
      for (let k = 0; k <= 12; k++) {
        const b = bars.find((q) => q[0] === k),
          h = b ? b[1] * 56 : 0;
        g += `<rect x="${x0 + 8 + k * 7.4}" y="${f1(200 - h)}" width="5" height="${f1(Math.max(h, 1.5))}" rx="1.5" fill="${b ? "var(--blue)" : "var(--line-2)"}"/>`;
      }
      g +=
        tx(x0 + 8, 212, "0", { a: "start", s: 10, c: "var(--text-faint)" }) +
        tx(x0 + 98, 212, "12 Hz", { a: "end", s: 10, c: "var(--text-faint)" });
      s += pk(id, g);
    });
    return svg(
      340,
      222,
      s,
      "A mixer with two waves (3 Hz at strength 1, 8 Hz at strength 0.5) and three candidate spectra",
    );
  }
  Object.assign(partScope, { figMixerBoard });
})();
