/* algo-p8-x-03: 8.6 Bitcoin and the blockchain (ported from the vault). */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, esc } = N;
  const L = N.LESSONS,
    F = N.fig;
  const S = (NIC.shared.algoP8 = NIC.shared.algoP8 || {});
  const { toy, bx, tbl, runner, reg, TONE } = S;
  /* ============================================================
     8.6  Bitcoin and the blockchain
     ============================================================ */
  const merkleLevels = (tx) => {
    const lv = [tx.map((t) => toy(t).slice(0, 4))];
    while (lv[lv.length - 1].length > 1) {
      const a = lv[lv.length - 1],
        b = [];
      for (let i = 0; i < a.length; i += 2) b.push(toy(a[i] + a[i + 1]).slice(0, 4));
      lv.push(b);
    }
    return lv;
  };
  const merkleSvg = (tx, clean) => {
    const lv = merkleLevels(tx),
      base = clean ? merkleLevels(clean) : lv;
    const X = [[70, 200, 330, 460], [135, 395], [265]],
      Y = [168, 98, 28];
    const nd = (l, i) => {
      const bad = lv[l][i] !== base[l][i],
        c = bad ? "var(--rose)" : "var(--teal)";
      return `<g class="fi"><rect x="${X[l][i] - 40}" y="${Y[l] - 15}" width="80" height="30" rx="9" fill="color-mix(in srgb, ${c} 14%, var(--panel))" stroke="${c}" stroke-width="2"/><text x="${X[l][i]}" y="${Y[l] + 5}" text-anchor="middle" style="font:800 13px ui-monospace,monospace;fill:var(--ink)">${lv[l][i]}</text></g>`;
    };
    const ln = (l, i) =>
      `<path d="M${X[l][i]} ${Y[l] - 15} L${X[l + 1][i >> 1]} ${Y[l + 1] + 15}" stroke="var(--line-2)" stroke-width="2" fill="none"/>`;
    return `<svg class="fig" viewBox="0 0 520 232" style="max-height:232px">${[0, 1, 2, 3].map((i) => ln(0, i)).join("")}${[0, 1].map((i) => ln(1, i)).join("")}${lv[2].map((_, i) => nd(2, i)).join("")}${lv[1].map((_, i) => nd(1, i)).join("")}${lv[0].map((_, i) => nd(0, i)).join("")}<text x="265" y="8" text-anchor="middle" class="fig-sub">Merkle root</text>${tx.map((t, i) => `<text x="${X[0][i]}" y="208" text-anchor="middle" class="fig-sub">${esc(t)}</text>`).join("")}</svg>`;
  };
  const TXS = ["ann→ben 3", "ben→cat 1", "cat→dan 2", "dan→eve 4"];

  function dsRun(box, life) {
    const T = { T1: { f: "Alice", t: "Bob", a: 5 }, T2: { f: "Alice", t: "Carol", a: 5 } };
    const apply = (bal, id) => {
      const t = T[id];
      if (bal[t.f] >= t.a) {
        const b = { ...bal };
        b[t.f] -= t.a;
        b[t.t] += t.a;
        return b;
      }
      return null;
    };
    const balRow = (b) =>
      `<div>${Object.entries(b)
        .map(([k, v]) => bx(`${k}: ${v}`, v ? "teal" : null))
        .join("")}</div>`;
    const pool = (ids, mark) =>
      `<div><small class="faint" style="font-weight:800">Waiting to be mined</small><div>${ids.map((id) => `<span class="a8-tile" data-k="${id}" style="display:inline-block;padding:6px 12px;margin:4px;border-radius:12px;border:2px solid ${mark && mark[id] ? TONE[mark[id]] : "var(--line-2)"};background:var(--panel);font:800 14px var(--sans);cursor:pointer">${id}: ${T[id].f} pays ${T[id].t} ${T[id].a}</span>`).join("")}</div></div>`;
    runner(box, life, {
      minH: 170,
      code: [
        "a transaction is valid if its sender owns enough coins",
        "the miner applies transactions in order",
        "valid: update balances; invalid: reject",
        "the mined block is appended to the chain",
        "later blocks bury it deeper",
      ],
      frames() {
        const bal = { Alice: 5, Bob: 0, Carol: 0 };
        const out = [
          {
            cap: "Alice owns 5 coins. She signs <b>two payments of the same 5 coins</b> and broadcasts both. That is a <b>double spend</b> attempt.",
            line: 0,
            html: balRow(bal) + pool(["T1", "T2"]),
          },
        ];
        out.push({
          cap: "A miner builds block 7 and applies waiting transactions to the ledger <b>in order</b>. T1 goes first.",
          line: 1,
          html: balRow(bal) + pool(["T1", "T2"]),
          ask: {
            q: "T1 is applied first and uses up Alice's coins. Which transaction does the ledger reject? Tap it.",
            a: "T2",
            tiles: "",
            why: "After T1, Alice has 0 coins, so T2 (spend 5) fails the 'sender owns enough' check.",
          },
        });
        const b1 = apply(bal, "T1");
        out.push({
          cap: "T1: Alice has 5 ≥ 5, so it is <b>valid</b>. Balances update: Alice 0, Bob 5.",
          line: 2,
          html: balRow(b1) + pool(["T1", "T2"], { T1: "teal" }),
        });
        const b2 = apply(b1, "T2");
        out.push({
          cap: `T2: Alice now has ${b1.Alice} and needs 5, so it is <b>${b2 === null ? "rejected" : "accepted"}</b>. The second spend never happened.`,
          line: 2,
          html: balRow(b1) + pool(["T1", "T2"], { T1: "teal", T2: "rose" }),
        });
        out.push({
          cap: "Block 7 is mined and added to the chain. T1 has <b>1 confirmation</b>.",
          line: 3,
          html: balRow(b1) + `<div>${bx("block 6")}${bx("block 7 (T1)", "teal")}</div>`,
        });
        out.push({
          cap: "More blocks arrive on top. Six blocks deep, an attacker would have to redo the work of all of them (and out-run the honest miners) to swap T1 for T2.",
          line: 4,
          mood: "love",
          html:
            balRow(b1) +
            `<div>${[6, 7, 8, 9, 10, 11, 12].map((h) => bx("block " + h, h === 7 ? "teal" : h > 7 ? "blue" : null)).join("")}</div><div class="faint" style="margin-top:4px">T1 sits in block 7 with five blocks on top of it (8 to 12)</div>`,
        });
        return out;
      },
    });
  }

  reg({
    id: "a8-bitcoin",
    order: 6,
    num: "8.6",
    title: "Bitcoin and the blockchain",
    blurb:
      "Wallets, blocks and Merkle roots: what a block holds, how a ledger without a bank stops double spending, and what it could be used for.",
    render(root) {
      root.appendChild(header(this, ""));
      const tx = TXS.slice(),
        clean = TXS.slice();
      const card =
        el(`<div class="card"><div class="card-head"><h2>Merkle root: one fingerprint for every transaction</h2><span class="faint">toy hash, 4 hex digits shown</span></div>
        <div class="controls" id="tg"></div><div id="tree"></div>
        <div class="callout" id="msg" style="min-height:52px"></div></div>`);
      root.appendChild(card);
      function draw() {
        qs("#tg", card).innerHTML = tx
          .map(
            (t, i) =>
              `<button class="btn small ${t !== clean[i] ? "rose" : ""}" data-i="${i}">${t !== clean[i] ? "restore" : "tamper"} tx ${i + 1}</button>`,
          )
          .join(" ");
        qsa("[data-i]", card).forEach(
          (b) =>
            (b.onclick = () => {
              const i = +b.dataset.i;
              tx[i] = tx[i] === clean[i] ? clean[i].replace(/\d+$/, "99") : clean[i];
              draw();
            }),
        );
        qs("#tree", card).innerHTML = merkleSvg(tx, clean);
        const a = merkleLevels(tx).flat(),
          c = merkleLevels(clean).flat();
        const changed = a.filter((h, i) => h !== c[i]).length;
        const m = qs("#msg", card);
        m.className = "callout " + (changed ? "rose" : "teal");
        m.innerHTML = changed
          ? `<b>${changed} of 7 hashes changed</b>, from the tampered leaf up to the root. The block header stores the root, so the block's own hash changes too.`
          : "Untouched: the root matches the one in the block header. Tamper with any transaction to see the damage travel up.";
      }
      draw();
      root.appendChild(
        predict({
          id: "a8-bitcoin-1",
          q: "You tamper with exactly one of the four transactions. How many of the 7 hashes in the tree change?",
          opts: ["1", "3", "7"],
          a: 1,
          why: "Its leaf, its parent and the root change (1 + 1 + 1 = 3). The other branch of the tree is untouched, but the root alone is enough to expose the change.",
        }),
      );
      root.appendChild(
        predict({
          id: "a8-bitcoin-2",
          q: "Alice's coins are signed away in two separate payments. After the network has settled, how many of the two end up recorded in the chain?",
          opts: ["Both, split in half", "Exactly one", "Neither"],
          a: 1,
          why: "Ledger rules check each transaction against the balances left by earlier ones. Whichever is confirmed first uses up the coins, and the other fails validation.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A block header holds the <b>previous block hash</b>, a <b>Merkle root</b> of its transactions, a timestamp, the difficulty target and a nonce.",
            "A ledger without a bank works because every miner validates every transaction against the history, and conflicts are settled by chain order.",
            "Persistence comes from depth: each later block means more work to rewrite.",
          ],
          "A block commits to its past and its transactions with hashes, and to its future by being buried.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a8-bitcoin"] = {
    sum: "<b>Bitcoin</b> is a cryptocurrency whose ledger, the <b>blockchain</b>, is kept by thousands of miners instead of a bank. Blocks chain together by hash, hold their transactions via a Merkle root, and stop double spending by ordering conflicts.",
    steps: [
      { t: "A cryptocurrency", b: `<p><b>Bitcoin</b> (capital B) is the protocol, software and community. <b>bitcoins</b> (lower case) are the unit of value. The smallest piece is the <b>satoshi</b>: 0.0001 bitcoin = 10,000 satoshi, so one bitcoin is 100,000,000 satoshi.</p><p>Its price has risen and fallen sharply, and governments, the finance sector and companies have all reacted to it.</p>`,
        v: F.cells([{ v: "1 bitcoin", c: "amber" }, "=", { v: "100,000,000", c: "teal", sub: "satoshi" }]) + F.cells([{ v: "0.0001 bitcoin" }, "=", { v: "10,000", c: "teal", sub: "satoshi" }]),
        c: { q: "How many satoshi is 0.0005 bitcoin?", o: ["5,000", "50,000", "500,000"], a: 1, hint: "0.0001 bitcoin is 10,000 satoshi, and 0.0005 is five of those.", why: "5 × 10,000 = 50,000 satoshi." } },
      { t: "Sending money without a bank", b: `<p>Bitcoin exists as software. A <b>wallet</b> creates a Bitcoin <b>address</b>. To receive money you share your address; the sender enters your address and an amount. The transaction is <b>broadcast to the network</b>, where <b>miners</b> verify it and add it to the transaction history.</p>`,
        v: F.flow([{ t: "Wallet", s: "makes an address" }, { t: "Send", s: "address + amount", c: "violet" }, { t: "Broadcast", s: "to the network", c: "amber" }, { t: "Miners", s: "verify, add to block", c: "teal" }]),
        c: { q: "Who confirms that a Bitcoin payment is valid?", o: ["A central bank that keeps the ledger", "Miners, each checking the rules", "The sender's wallet software alone"], a: 1, why: "There is no central ledger-keeper. Every miner checks each transaction against the shared history before adding it to a block." } },
      { t: "What is inside a block", b: `<p>A block has a <b>header</b> and a list of <b>transactions</b> (the first is the miner's reward, the <i>coinbase</i> transaction). The header holds: version, <b>previous block hash</b>, <b>Merkle root</b>, timestamp, <b>bits</b> (the difficulty target) and the <b>nonce</b>.</p><p>The block's identifier is the <b>hash of the header</b>, which has to start with many zeros.</p>`,
        v: tbl(["Header field", "Role"], [["version", "rules the block follows"], { c: ["previous block hash", "links to the block before"], hl: true }, { c: ["Merkle root", "one hash for all transactions"], hl: true }, ["timestamp", "when it was made"], ["bits", "the difficulty target"], { c: ["nonce", "the number miners vary"], hl: true }], 520),
        c: { q: "One transaction in a block is edited, and nothing is re-mined yet. Which header field is now wrong?", o: ["Previous block hash", "Merkle root", "Version"], a: 1, why: "The Merkle root is computed from the transactions, so editing one changes it. The previous-block hash points at an older block and is unaffected." } },
      { t: "The Merkle root", b: `<p>Hash each transaction, then hash the results <b>in pairs</b>, and keep pairing until a single hash is left: the <b>Merkle root</b>. It commits to every transaction at once: change any one and the hashes on its path to the root all change.</p><p>(With an odd number at some level, Bitcoin pairs the last hash with a copy of itself.)</p>`,
        v: merkleSvg(TXS),
        c: { q: "A block holds 8 transactions. After hashing each one, how many more hashes are needed to reach the Merkle root?", o: ["7", "8", "16"], a: 0, hint: "Pair them up: 4 hashes, then 2, then 1.", why: "4 + 2 + 1 = 7 pairing hashes on top of the 8 leaf hashes." } },
      { t: "Double spending", b: `<p>Digital data can be copied, so the danger is spending the same coin twice. Bitcoin stops it with <b>order</b>: transactions are applied to the ledger one after another, and a transaction is only valid if the sender still owns the coins. The first confirmed one wins and the other becomes invalid.</p>`,
        v: F.flow([{ t: "T1: Alice → Bob 5", s: "confirmed first", c: "teal" }, { t: "Alice now has 0", s: "ledger updated" }, { t: "T2: Alice → Carol 5", s: "rejected", c: "rose" }]),
        c: { q: "Two payments spending the same coins are both broadcast. What decides which one counts?", o: ["Whichever is confirmed first; the other then fails validation", "The one carrying the larger fee, whatever the order", "Both are recorded and the coins are shared out equally"], a: 0, why: "A transaction is checked against the balances left by everything earlier in the chain. After one spend, the coins are gone and the conflicting one is invalid." } },
      { t: "Watch it run: a double spend fails", b: `<p>Alice signs two payments of the same 5 coins. Press <b>play</b> or step with the arrows: a miner builds a block and the ledger applies the payments in order.</p><p>It will ask which payment is rejected. Tap it.</p>`,
        v: (box, life) => dsRun(box, life) },
      { t: "Height, depth and confirmations", b: `<p>Every block has a <b>height</b> (its position counted from the first block) and, as new blocks pile on, a <b>depth</b>: the number of blocks on top of it, also called <b>confirmations</b>. The lecture's snapshot had about 428,000 blocks; the chain only ever grows.</p><p>The deeper a payment sits, the more work it would take to rewrite it.</p>`,
        v: F.cells([{ v: "100", sub: "5 on top", c: "teal" }, { v: "101", sub: "4" }, { v: "102", sub: "3" }, { v: "103", sub: "2" }, { v: "104", sub: "1" }, { v: "105", sub: "tip", c: "amber" }]) + `<div class="fig-cap">Heights 100 to 105. Block 100 has five blocks on top of it.</div>`,
        c: { q: "Your payment is in block 100 and the newest block is 105. How many blocks sit on top of yours?", o: ["4", "5", "6"], a: 1, why: "105 − 100 = 5 blocks (101 to 105) sit on top. The deeper the block, the safer the payment." } },
      { t: "Consensus, persistence, liveness", b: `<p>What a blockchain must provide:</p><ul><li><b>Consensus</b>: honest nodes agree on the same history.</li><li><b>Persistence</b>: once a transaction is buried deep enough, it stays.</li><li><b>Liveness</b>: valid transactions keep getting included.</li></ul><p>For Bitcoin these deliver the two headline guarantees: <b>history cannot be amended</b> and <b>double spending is avoided</b>.</p>`,
        v: tbl(["Property", "Question it answers"], [["Consensus", "do we all see the same chain?"], ["Persistence", "will my confirmed payment stay?"], ["Liveness", "will my valid payment get in?"]], 480),
        c: { q: "A perfectly valid transaction is broadcast, but no miner ever includes it. Which property has failed?", o: ["Consensus", "Persistence", "Liveness"], a: 2, why: "Liveness means valid transactions are eventually included. Here the network agrees and history is stable, but this payment is stuck." } },
      { t: "What might it be used for?", b: `<p>The lecture's list of possible uses groups into four areas: <b>digital currency</b> and fraud reduction (payments, remittance, microfinance), <b>smart contracts</b> (escrow, digital rights), <b>record keeping</b> (supply chains, ownership, identity, intellectual property) and <b>securities</b> (equity, crowdfunding, debt).</p><p>What they share: a record many parties can trust without one party owning it.</p>`,
        v: tbl(["Area", "Examples"], [["Digital currency", "global payments, remittance, microfinance"], ["Smart contracts", "escrow, digital rights"], ["Record keeping", "supply chain, ownership, proof of identity"], ["Securities", "equity, crowdfunding, debt"]], 600) },
    ],
    guide: ["Tamper with one transaction. Count how many hashes change.", "Tamper with a second one. Which hashes change now, and which stay the same?", "Press <b>restore</b> and check the root returns.", "Answer the questions after the demo."],
  };
})();
