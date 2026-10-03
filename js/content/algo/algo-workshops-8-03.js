(function () {
  const partScope = (NIC.shared.algoWorkshops8 = NIC.shared.algoWorkshops8 || {});
  const { chainWorkshop } = partScope;
  const N = NIC,
    { predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  N.register({
    id: "a8-chain",
    subject: "algo",
    lecture: 8,
    order: 90,
    num: "8.W",
    workshop: true,
    title: "Workshop: poke a blockchain",
    blurb: "Mine blocks by guessing nonces, tamper with history, then pay the price to repair it.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro:
          "Here is a tiny chain. <b>Mine</b> it, <b>break</b> it, then <b>repair</b> it, and feel why history is hard to rewrite.",
        missions: [
          {
            id: "seal",
            t: "Seal block 1 by guessing",
            d: "Select <b>block 1</b> and press <b>Try next nonce</b> (or <b>Try 10</b>) until the hash starts with a zero.",
            hint: "At difficulty 1, about 1 hash in 16 starts with 0. Use Try 10 to go faster; there is no cleverer way.",
          },
          {
            id: "chain",
            t: "Mine blocks 2 and 3",
            d: "Set difficulty to <b>2 zeros</b>, pick blocks 2 and 3 and press <b>Auto-mine</b>. Compare the tries with block 1.",
            hint: "Mine in order. Each new block copies the previous block's hash into its own prev.",
          },
          {
            id: "tamper",
            t: "Tamper with history",
            d: "Press <b>✎ edit</b> on block 1 and watch what happens further down the chain.",
            hint: "The edit only works as an attack if later blocks already exist, so finish mission 2 first.",
          },
          {
            id: "repair",
            t: "Repair the chain",
            d: "Keep the edited data, but make every block green again. Re-mine block 1, then 2, then 3.",
            hint: "<b>Re-link, no mining</b> only fixes the pointers and breaks the seals. Select each block in order and mine it again.",
          },
          {
            id: "audit",
            t: "Check the bill",
            d: "Press <b>Verify chain</b> and compare the cost of checking with the cost of the rewrite.",
          },
        ],
        build: chainWorkshop,
      });
      root.appendChild(
        predict({
          id: "a8-wk-1",
          q: "You need a hash that starts with <b>00</b> (two hex zeros). About how many nonces do you expect to try?",
          opts: ["About 16", "About 256", "About 4,096"],
          a: 1,
          why: "One hex zero is a 1-in-16 chance, two is 1 in 16 × 16 = 256, so about 256 tries on average. Each extra zero multiplies the work by 16.",
        }),
      );
      root.appendChild(
        predict({
          id: "a8-wk-2",
          q: "Someone edits the data in block 1 of a sealed three-block chain. To make the whole chain valid again, which blocks must be mined again?",
          opts: [
            "Just block 1, the one they changed",
            "Blocks 1, 2 and 3, each in turn",
            "None, if they fix the prev fields",
          ],
          a: 1,
          why: "Block 1's new hash changes block 2's prev, which changes block 2's hash, which changes block 3's prev. Every block from the edit onward needs fresh proof of work. Patching prev alone breaks the zeros.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A nonce is found by <b>guessing</b>: each try gives an unpredictable hash, and each extra zero means about 16× more tries.",
            "Edit an old block and its hash changes, so the next block's <code>prev</code> no longer matches: the break is <b>visible</b>.",
            "Repairing means re-mining every block from the edit onward. That <b>work</b>, not the hash alone, makes history costly to rewrite.",
          ],
          "Mining is expensive, checking takes one hash, and rewriting means redoing all the work after the edit.",
        ),
      );
    },
  });

  L["a8-chain"] = {
    sum: "Mine a tiny chain by guessing nonces, tamper with an old block and see the break, then pay the price of repairing it.",
    steps: [
      {
        t: "Sealing a block",
        b: `<p>To <b>seal</b> a block you change its <b>nonce</b> until the block's hash starts with enough zeros. Every nonce gives a new, unpredictable hash, so you just guess and check.</p>`,
        v: F.flow([
          { t: "Nonce 1", s: "hash starts 7…" },
          { t: "Nonce 2", s: "hash starts c…" },
          { t: "Nonce 3", s: "hash starts 0…", c: "teal" },
        ]),
        c: {
          q: "Why does sealing a block take so many tries?",
          o: [
            "Hashes look random, so you can only try nonces",
            "Each nonce must be approved by a peer first",
            "The nonce stays hidden until blocks pile up",
          ],
          a: 0,
          why: "A good hash gives no clue which nonce will work, so the only method is guess, hash, check. Checking a winner is a single hash.",
        },
      },
      {
        t: "Breaking and repairing",
        b: `<p>Each block stores the hash of the block before it in <code>prev</code>. Edit an old block and its hash changes, so the next block's <code>prev</code> no longer matches. To fix it you must <b>mine again</b>, block after block.</p>`,
        v: F.flow([
          { t: "Block 1", s: "data edited", c: "rose" },
          { t: "Block 2", s: "prev ≠ hash", c: "rose" },
          { t: "Block 3", s: "after the break", c: "rose" },
        ]),
        c: {
          q: "Block 1's data is edited. What shows up at block 2?",
          o: [
            "Its stored prev no longer matches block 1",
            "Its nonce is rewritten by the network",
            "Its data is edited to keep in step",
          ],
          a: 0,
          why: "Block 2 still remembers block 1's old hash in prev, while block 1 now hashes to something completely different. That mismatch is the visible break.",
        },
      },
    ],
    guide: ["Work through the missions in the workshop."],
  };
})();
