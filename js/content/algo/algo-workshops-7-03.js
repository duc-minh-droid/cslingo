(function () {
  const partScope = (NIC.shared.algoWorkshops7 = NIC.shared.algoWorkshops7 || {});
  const { buildTree } = partScope;
  const N = NIC,
    { predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /* ------------------------------------------------------------------ */
  N.register({
    id: "a7-build",
    subject: "algo",
    lecture: 7,
    order: 90,
    num: "7.W",
    workshop: true,
    title: "Workshop: build the tree",
    blurb:
      "No code. Merge the two smallest nodes by hand, read the codes off the branches, then send a forecast with them.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro: `A weather station reports <b>Sun, Cloud, Rain, Wind, Fog</b> or <b>Hail</b> once an hour. Here are 46 hours of reports. Tap the <b>two smallest</b> nodes to merge them.`,
        missions: [
          {
            id: "first",
            t: "Make your first merge",
            d: "Tap the two nodes with the <b>smallest</b> counts in the queue.",
            hint: "The queue is sorted: they are the two on the left, Hail (1) and Fog (3).",
          },
          {
            id: "mistake",
            t: "Make a mistake on purpose",
            d: "Tap a pair that <b>isn't</b> the two smallest and read what it would cost. Nothing is changed.",
            hint: "Try Hail (1) and Sun (18): the rarest with the most common. That ends 12 bits worse. If the tree is already built, press Restart first.",
          },
          {
            id: "tree",
            t: "Finish the tree",
            d: "Keep merging until one node is left. Each new node rejoins the queue.",
            hint: "After a merge, find the two smallest again. The new node counts as its total.",
          },
          {
            id: "encode",
            t: "Send a forecast",
            d: "Tap the symbols of the forecast in order. The path down your tree becomes the bits.",
            hint: "You need the finished tree first. The forecast is shown as coloured letters above the keys.",
          },
        ],
        build: (stage, api) => buildTree(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "a7-build-1",
          q: "Four symbols are all equally likely. What do Huffman's codeword lengths come out as?",
          opts: ["All four get exactly 2 bits", "Lengths of 1, 2, 3 and 3 bits", "Lengths of 1, 1, 2 and 2 bits"],
          a: 0,
          why: "Equal counts merge into pairs, then pair with pair, so the tree is perfectly balanced: every leaf is 2 steps down. With no skew there is nothing to save.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-build-2",
          q: "Your tree spends 104 bits on the day's reports, and fixed 3-bit codes spend 138. Could any code give 90 bits for the same reports?",
          opts: [
            "No: the entropy floor is about 101 bits",
            "Yes: a cleverer tree always exists for any data",
            "Yes: but only if the data is sorted first",
          ],
          a: 0,
          why: "Entropy is the floor for any lossless code on this source: about 2.19 bits a report, which is 101 bits over 46 reports. Huffman is optimal among whole-bit codes, so nothing gets to 90.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Keep a queue sorted by count. Always <b>merge the two smallest</b> and put the total back.",
            "A merge costs its <b>combined count</b> in bits, because everything beneath it goes one bit deeper. Merging big nodes early is expensive.",
            "Read codes off the branches: rare symbols end up deep (long codes), common ones near the root (short codes).",
            "The result is shorter than fixed-length codes but never below the <b>entropy</b> floor.",
          ],
          "Merge the two rarest, repeat, and read the codes off the branches.",
        ),
      );
    },
  });

  L["a7-build"] = {
    sum: "Build a Huffman tree yourself, see why the two smallest must merge, and compare the total with fixed-length codes and entropy.",
    steps: [
      {
        t: "What you will do",
        b: `<p>You'll build a Huffman tree by hand. Keep a <b>queue</b> of nodes sorted by count. Each round, take the <b>two smallest</b>, join them under a new node whose count is their sum, and put it back.</p><p><span class="key">When one node is left, it is the root. Read the 0s and 1s down the branches to get each code.</span></p>`,
        v: F.flow([
          { t: "Take two smallest", c: "blue" },
          { t: "Merge into one", c: "teal" },
          { t: "Put it back", c: "amber" },
        ]),
        c: {
          q: "Which two nodes does the queue merge each round?",
          o: [
            "The two with the smallest counts",
            "The two with the largest counts",
            "The first two in alphabetical order",
          ],
          a: 0,
          why: "The smallest two sit deepest, where each extra bit is paid for least often. That is the whole greedy rule.",
        },
      },
      {
        t: "Every merge costs bits",
        b: `<p>Merging two nodes pushes <b>every symbol beneath them one step deeper</b>, so each of their appearances costs one more bit. A merge of nodes with counts 3 and 5 adds <b>3 + 5 = 8</b> bits to the total.</p><p>Add up all the merges and you get the size of the whole compressed message.</p>`,
        v: F.compare(
          { title: "Merge small nodes", c: "teal", body: "few appearances pay the extra bit: a <b>small</b> cost now" },
          {
            title: "Merge big nodes",
            c: "rose",
            body: "many appearances pay the extra bit: a <b>big</b> cost now and later",
          },
        ),
        c: {
          q: "Nodes with counts 3 and 5 merge. How many bits does that merge add to the total?",
          o: ["2", "8", "15"],
          a: 1,
          why: "All 3 + 5 = 8 appearances beneath the new node move one bit deeper, so the merge adds 8 bits.",
        },
      },
    ],
    guide: ["Work through the four missions in the workshop."],
  };
})();
