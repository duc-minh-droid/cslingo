/* algo-p8-x-04: 8.7 proof of work and the longest chain (ported from the vault). */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const S = (NIC.shared.algoP8 = NIC.shared.algoP8 || {});
  const { toy, bx, tiles, tbl, runner, reg } = S;
  /* ============================================================
     8.7  Proof of work and the longest chain
     ============================================================ */
  function mineRun(box, life) {
    const DATA = "block 7|cat pays dan 4",
      WANT = "0";
    const hashN = (n) => toy(`${DATA}|nonce ${n}`);
    let win = 0;
    while (hashN(win)[0] !== WANT) win++;
    const lines = (upto) => {
      const from = Math.max(0, upto - 6);
      const rows = [];
      for (let n = from; n <= upto; n++) {
        const h = hashN(n),
          good = h[0] === WANT;
        rows.push(
          `<tr class="${n === upto ? "hl" : ""}"><td class="mono">${n}</td><td class="mono">${good ? `<b style="color:var(--teal)">${h[0]}</b>${h.slice(1)}` : h}</td><td>${good ? "✓ target met" : "✗"}</td></tr>`,
        );
      }
      return `<div>${bx(DATA.replace("|", " | "), "violet")} <span class="faint">target: hash starts with</span> ${bx("0", "amber")}</div><table class="t" style="max-width:440px;margin-top:8px"><tr><th>nonce</th><th>hash</th><th></th></tr>${rows.join("")}</table>`;
    };
    runner(box, life, {
      minH: 230,
      code: [
        "collect the transactions into a block",
        "nonce = 0",
        "hash the block with this nonce",
        "if the hash starts with enough zeros: done",
        "else nonce = nonce + 1 and hash again",
      ],
      frames() {
        const out = [
          {
            cap: "Miners hash the block with different <b>nonces</b> until the hash starts with enough zeros. This toy needs just <b>one hex zero</b>.",
            line: 0,
            html: `<div>${bx(DATA.replace("|", " | "), "violet")} <span class="faint">target: hash starts with</span> ${bx("0", "amber")}</div>`,
          },
        ];
        out.push({
          cap: "Nonce 0 first.",
          line: 2,
          html: lines(0),
          ask: {
            q: "A hex digit has 16 values. On average, how many nonces until the first hash starts with 0? Tap one.",
            a: "16",
            tiles: tiles("Average tries", [
              ["2", "about 2"],
              ["16", "about 16"],
              ["256", "about 256"],
            ]),
            why: "Each hash starts with 0 with probability 1/16, so about 16 tries on average. Each extra zero multiplies that by 16.",
          },
        });
        for (let n = 1; n <= win; n++)
          out.push({
            cap:
              n === win
                ? `Nonce <b>${n}</b> gives <b>${hashN(n)}</b>: it starts with 0. <b>Mined</b> after ${n + 1} hashes.`
                : `Nonce ${n}: hash ${hashN(n)}. Does not start with 0. Try the next.`,
            line: n === win ? 3 : 4,
            html: lines(n),
          });
        out.push({
          cap: `Checking costs <b>one</b> hash: anyone hashes the block with nonce ${win} and sees the zero. Finding it took ${win + 1}.`,
          line: 3,
          mood: "love",
          html: lines(win),
          ask: {
            q: "Another miner receives this block and nonce. How many hashes must they compute to verify it? Tap one.",
            a: "1",
            tiles: tiles("Hashes to verify", [
              ["1", "1 hash"],
              ["16", "about 16"],
              ["all", `all ${win + 1} tries`],
            ]),
            why: "Verification is a single hash. Finding the nonce took many; checking takes one. That asymmetry is proof of work.",
          },
        });
        return out;
      },
    });
  }

  function forkSvg() {
    const blk = (x, y, t, c, o = 1) =>
      `<g class="fi" opacity="${o}"><rect x="${x}" y="${y}" width="76" height="34" rx="9" fill="color-mix(in srgb, ${c} 14%, var(--panel))" stroke="${c}" stroke-width="2"/><text x="${x + 38}" y="${y + 22}" text-anchor="middle" class="fig-box" style="font-size:13px">${t}</text></g>`;
    const ar = (x1, y1, x2, y2) =>
      `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="var(--text-faint)" stroke-width="2" fill="none"/>`;
    return `<svg class="fig" viewBox="0 0 560 190" style="max-height:190px">${ar(120, 87, 170, 87)}${ar(246, 87, 300, 48)}${ar(246, 87, 300, 128)}${ar(376, 128, 430, 128)}
      ${blk(44, 70, "block 9", "var(--text-faint)")}${blk(170, 70, "block 10", "var(--text-faint)")}${blk(300, 31, "A", "var(--rose)", 0.55)}${blk(300, 111, "B", "var(--teal)")}${blk(430, 111, "C", "var(--teal)")}
      <text x="338" y="22" text-anchor="middle" class="fig-sub" style="fill:var(--rose)">orphaned</text><text x="468" y="170" text-anchor="middle" class="fig-sub" style="fill:var(--teal)">longest chain wins</text></svg>`;
  }

  const lcg = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };
  const race = (q, z, trials = 600, maxBlocks = 300) => {
    const r = lcg(12345);
    let ok = 0;
    for (let t = 0; t < trials; t++) {
      let d = z;
      for (let b = 0; b < maxBlocks; b++) {
        d += r() < q ? -1 : 1;
        if (d < 0) {
          ok++;
          break;
        }
      }
    }
    return ok / trials;
  };

  reg({
    id: "a8-pow",
    order: 7,
    num: "8.7",
    title: "Proof of work and the longest chain",
    blurb:
      "Why the world accepts one block, what mining costs, and how much computing power an attacker needs to rewrite history.",
    render(root) {
      root.appendChild(header(this, ""));
      let share = 30,
        behind = 3;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Race to rewrite history</h2><span class="faint">600 simulated races, up to 300 blocks each</span></div>
        <div id="sls"></div>
        <div class="stat-row"><div class="stat"><small>Attacker's share of mining power</small><b id="sv">30%</b></div><div class="stat amber"><small>Blocks behind at the start</small><b id="bv">3</b></div><div class="stat rose"><small>Races where the attacker pulls ahead</small><b id="rv">·</b></div></div>
        <div id="bar" style="margin-top:8px;min-height:84px"></div><div class="callout" id="msg" style="min-height:56px"></div></div>`);
      root.appendChild(card);
      const s1 = N.slider("Attacker's share of the power (%)", 5, 60, 5, 30, (v) => v + "%"),
        s2 = N.slider("Blocks the attacker is behind", 0, 6, 1, 3, (v) => v);
      qs("#sls", card).append(s1, s2);
      function draw() {
        const r = race(share / 100, behind),
          pct = Math.round(r * 100);
        qs("#sv", card).textContent = share + "%";
        qs("#bv", card).textContent = behind;
        qs("#rv", card).textContent = pct + "%";
        qs("#bar", card).innerHTML = F.bars(
          [
            ["attacker pulls ahead", pct, pct > 50 ? "rose" : "amber"],
            ["honest chain holds", 100 - pct, "teal"],
          ],
          { max: 100, fmt: (v) => v + "%" },
        );
        const m = qs("#msg", card);
        m.className = "callout " + (share >= 50 ? "rose" : "teal");
        m.innerHTML =
          share >= 50
            ? "With half the power or more, the attacker catches up whatever the head start: given time, the longest chain is theirs. This is the <b>51% attack</b>."
            : `With less than half the power, every extra block of depth makes the attack much less likely. The honest majority outpaces the attacker on average.`;
      }
      s1.onInput((v) => {
        share = v;
        draw();
      });
      s2.onInput((v) => {
        behind = v;
        draw();
      });
      draw();
      root.appendChild(
        predict({
          id: "a8-pow-1",
          q: "Attacker share 30%, 3 blocks behind. Out of many races, how often does the attacker end up with the longer chain?",
          opts: ["Rarely: under about 10%", "About half the time", "Almost always"],
          a: 0,
          why: "At 30% the attacker finds about 3 blocks for every 7 the honest network finds, and has to win a long streak from behind. The chance falls as (30/70) raised to the number of blocks needed, about 3% here.",
        }),
      );
      root.appendChild(
        predict({
          id: "a8-pow-2",
          q: "Raise the attacker's share to 55%, still 3 blocks behind. How often do they eventually pull ahead?",
          opts: ["Rarely, under 10%", "About half the time", "Almost every time"],
          a: 2,
          why: "With the majority of the power, the attacker's chain grows faster on average, so any head start is eventually overturned. Proof of work is only safe while honest miners hold most of the power.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Proof of work answers 'which block does the world accept?': the one with a valid, costly nonce, and the <b>longest chain</b> wins.",
            "Mining is trial and error; checking is one hash. Each extra zero multiplies the work by 16 (hex).",
            "Rewriting history means redoing the work of every later block while out-running the honest majority. Safe only while honest miners hold &gt; 50%.",
          ],
          "Buy the chain's security with work: cheap to check, expensive to forge.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a8-pow"] = {
    sum: "<b>Proof of work</b> lets strangers agree on the next block without a boss: find a nonce that makes the block hash start with enough zeros. It limits how fast blocks appear, makes invalid blocks costly, and lets nodes pick between competing chains: the <b>longer chain wins</b>.",
    steps: [
      { t: "What will the world accept as the next block?", b: `<p>Anyone can build a block of transactions and announce it. With no referee, how does the network pick <b>one</b> history? Counting votes is useless, because fake identities are free.</p><p>Bitcoin's answer is to make proposing a block <b>cost real work</b>.</p>`,
        v: F.flow([{ t: "Many miners", s: "all propose blocks", c: "amber" }, { t: "A rule", s: "which one counts?", c: "violet" }, { t: "One chain", s: "everyone follows", c: "teal" }]),
        c: { q: "Why can't the network simply count votes, one per node, to choose the next block?", o: ["One attacker could make unlimited fake nodes", "Votes take too long to collect across the world", "Honest nodes refuse to vote when asked"], a: 0, why: "Identities cost nothing online, so a one-node-one-vote scheme is easy to swamp. Work cannot be faked: it needs real computing power." } },
      { t: "Proof of work", b: `<p>The miner must do a <b>huge computation</b> to prove it found the block, while it takes others <b>little time to check</b>. Three benefits:</p><ul><li>it <b>limits the rate</b> at which new blocks appear;</li><li>it makes attempts to add <b>invalid blocks extremely difficult</b>;</li><li>it gives a clear way to <b>decide between competing chains: the longer one wins</b>.</li></ul>`,
        v: F.compare({ title: "Finding a valid block", c: "rose", body: "trillions of hashes,<br>trial and error" }, { title: "Checking it", c: "teal", body: "one hash,<br>instant" }),
        c: { q: "Which is a benefit of making blocks costly to find?", o: ["It limits how quickly new blocks can appear", "It makes every transaction in a block honest", "It removes the need for hash functions"], a: 0, why: "Work throttles block creation and makes forging expensive. It does not check transactions are honest (the rules do that) and it relies on hashes." } },
      { t: "Bitcoin's recipe", b: `<p>To mine a block:</p><ol><li>Collect new transactions into a block.</li><li>Hash the block header to get a <b>256-bit hash</b>.</li><li>If the hash <b>starts with enough zeros</b>, the block is mined: broadcast it, and the hash becomes its identifier.</li><li>Otherwise change the <b>nonce</b> and hash again.</li></ol><p>A new block appears about <b>every 10 minutes</b>, and then the race starts again.</p>`,
        v: F.flow([{ t: "Collect", s: "transactions" }, { t: "Hash header", s: "SHA-256", c: "violet" }, { t: "Enough zeros?", s: "no: new nonce", c: "amber" }, { t: "Broadcast", s: "hash = block ID", c: "teal" }], { loop: true }),
        c: { q: "A miner's hash does not start with enough zeros. What does she change before hashing again?", o: ["The nonce", "The previous block hash", "The difficulty target"], a: 0, why: "The nonce exists only to be varied. Changing the previous hash would mean building on a different block, and the target is set by the network." } },
      { t: "Watch it run: one nonce at a time", b: `<p>A toy miner with a very low bar: a hash that starts with <b>0</b>. Press <b>play</b> or step with the arrows and watch the nonce climb until the target is met.</p><p>It will ask two questions: the average work, and the cost of checking.</p>`,
        v: (box, life) => mineRun(box, life) },
      { t: "Odds and cost", b: `<p>Every extra required hex zero shrinks the success chance 16-fold, so the <b>average work is 16 to the power of the number of zeros</b>. (Bitcoin actually counts leading zero bits in the 256-bit hash, so its difficulty can be tuned in smaller steps.)</p><p>A miner who can hash 1,000 times a second needs about a minute on average for 4 hex zeros: 65,536 / 1,000.</p>`,
        v: tbl(["Hex zeros needed", "Chance per try", "Average tries"], [["1", "1 in 16", "16"], ["2", "1 in 256", "256"], ["3", "1 in 4,096", "4,096"], { c: ["4", "1 in 65,536", "65,536"], hl: true }, ["6", "1 in 16.8 million", "16,777,216"]], 560),
        c: { q: "A miner tries 1,000 hashes per second. About how long, on average, to find a hash with 4 leading hex zeros?", o: ["About a second", "About a minute", "About an hour"], a: 1, hint: "16 × 16 × 16 × 16 = 65,536 tries.", why: "65,536 tries at 1,000 per second is about 65 seconds, so roughly a minute." } },
      { t: "Competing chains: the longer chain wins", b: `<p>Two miners may find a block at nearly the same moment, giving a short-lived <b>fork</b>. Nodes build on whichever they saw first, until a further block makes one branch <b>longer</b>. Everyone then switches to the longest chain, and the shorter branch's blocks are <b>orphaned</b> (their transactions go back to the waiting pool).</p>`,
        v: forkSvg(),
        c: { q: "Blocks A and B are found at the same height. Then a block C is built on top of B. Which chain do nodes follow?", o: ["The chain through B and C, because it is longer", "The chain through A, because it appeared first", "Both, until someone deletes one by hand"], a: 0, why: "Nodes follow the longest valid chain. Once C extends B's branch it is ahead, and A's branch is abandoned." } },
      { t: "Rewriting history needs most of the power", b: `<p>To change an old block, an attacker must <b>redo the work for that block and every block after it</b>, while honest miners keep extending the real chain. That costs a lot. With less than half the total power the chance of ever catching up shrinks <b>geometrically</b> with the depth: for an attacker with 30% of the power it is (30/70)<sup>z</sup> to catch up from z blocks behind.</p><p>With <b>more than half</b> (a 51% attack) the attacker wins eventually, however deep the block.</p>`,
        v: F.bars([["1 block deep", 43, "rose"], ["2 deep", 18, "rose"], ["3 deep", 8, "amber"], ["4 deep", 3, "teal"], ["6 deep", 0.6, "teal"]], { max: 45, fmt: (v) => v + "%" }) + `<div class="fig-cap">Chance a 30% attacker ever catches up, by depth. That is why sellers wait for several confirmations.</div>`,
        c: { q: "An attacker controls 60% of all mining power. What happens to the chance of eventually rewriting a deeply buried block?", o: ["It stays tiny, because the block is buried deep", "It approaches certainty as they out-pace the rest", "It stays at exactly 60%, however deep the block"], a: 1, why: "A majority attacker's chain grows faster than the honest one on average, so any lead the honest chain has is eventually overturned. Depth only protects against a minority attacker." } },
      { t: "The costs of proof of work", b: `<p>The lecture ends by asking about the disadvantages. Proof of work is secure <i>because</i> it is wasteful:</p><ul><li><b>Energy</b>: huge computation, burned on purpose.</li><li><b>Speed</b>: about 10 minutes per block, so few transactions per second and waiting for confirmations.</li><li><b>Concentration</b>: security depends on no one holding half the power.</li><li><b>Irreversibility</b>: a mistaken payment cannot be undone, and prices swing wildly.</li></ul>`,
        v: tbl(["Benefit", "Cost that comes with it"], [["Costly to forge", "huge energy use"], ["Rate-limited blocks", "slow confirmation, low throughput"], ["No central authority", "no one to reverse a mistake"], ["Longest chain wins", "needs an honest majority of power"]], 600),
        c: { q: "Which is a direct consequence of making blocks expensive to find?", o: ["Mining uses a lot of electricity", "Blocks confirm in under a second", "Anyone can rewrite history cheaply"], a: 0, why: "The expense is the point: it deters forgers, but it costs energy. Cost also slows blocks down and makes rewrites expensive, the opposite of the other options." } },
    ],
    guide: ["Set the attacker to 30%, 3 behind. Note the success rate.", "Slide the share past 50%. What changes?", "Try 40% with the start 0 behind and then 6 behind.", "Answer the questions after the demo."],
  };
})();
