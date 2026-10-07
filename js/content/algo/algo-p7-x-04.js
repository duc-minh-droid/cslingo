/* Phase 7 coverage pass (4/4): 7.11 LZW in GIF, 7.12 rate and distortion, extra steps for the three original modules. */
(function () {
  const sh = (NIC.shared.algoP7x = NIC.shared.algoP7x || {});
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    FG = N.fig;
  const reg = (m) => N.register({ subject: "algo", lecture: 7, ...m });
  const lg2 = Math.log2;
  const { table, H, mseed, curve, lzwEnc, lzwDec, Hb } = sh;
  /* ============ 7.4 Kraft's inequality and the source coding theorem ============ */
  reg({
    id: "a7-source-coding",
    order: 4,
    num: "7.4",
    title: "Kraft, and the entropy floor",
    blurb:
      "Pick codeword lengths yourself. Kraft's inequality says which are allowed, and the source coding theorem says none beat entropy.",
    render(root) {
      root.appendChild(header(this, ""));
      const SRC = {
        loaded: ["Loaded: ½ ¼ ⅛ ⅛", [0.5, 0.25, 0.125, 0.125]],
        skew: ["Skewed: .6 .2 .1 .1", [0.6, 0.2, 0.1, 0.1]],
        uni: ["Uniform: ¼ ×4", [0.25, 0.25, 0.25, 0.25]],
      };
      const SYMS = ["A", "B", "C", "D"],
        COL = ["var(--teal)", "var(--violet)", "var(--amber)", "var(--rose)"];
      let key = "loaded";
      const len = [2, 2, 2, 2];
      const card =
        el(`<div class="card"><div class="card-head"><h2>Choose your codeword lengths</h2><span class="faint">each codeword of length l uses 2<sup>−l</sup> of the code tree</span></div>
        <div class="controls" id="pre"></div><div id="rows"></div>
        <div id="bar" style="margin:10px 0"></div>
        <div class="stat-row"><div class="stat"><small>Kraft sum Σ 2⁻ˡ</small><b id="k"></b></div><div class="stat teal"><small>Average length L</small><b id="al"></b></div><div class="stat amber"><small>Entropy H</small><b id="hh"></b></div><div class="stat"><small>L − H</small><b id="gap"></b></div></div>
        <p id="msg" style="min-height:3.4em;font-weight:700"></p></div>`);
      root.appendChild(card);
      qs("#pre", card).appendChild(
        N.seg(
          Object.entries(SRC).map(([k, v]) => [k, v[0]]),
          key,
          (v) => {
            key = v;
            draw();
          },
        ),
      );
      qs("#rows", card).innerHTML = SYMS.map(
        (s, i) =>
          `<div class="controls" style="margin:4px 0"><b style="color:${COL[i]};min-width:18px">${s}</b><span class="faint" style="min-width:90px" id="p${i}"></span><button class="btn small" data-i="${i}" data-d="-1" aria-label="shorter">−</button><b class="mono" id="l${i}" style="min-width:68px;text-align:center"></b><button class="btn small" data-i="${i}" data-d="1" aria-label="longer">+</button><span class="faint mono" id="c${i}"></span></div>`,
      ).join("");
      qsa("button[data-i]", card).forEach(
        (b) =>
          (b.onclick = () => {
            const i = +b.dataset.i;
            len[i] = Math.max(1, Math.min(6, len[i] + +b.dataset.d));
            draw();
          }),
      );
      function draw() {
        const p = SRC[key][1],
          ks = len.reduce((a, l) => a + 2 ** -l, 0),
          al = len.reduce((a, l, i) => a + p[i] * l, 0),
          h = H(p),
          cap = Math.max(1, ks);
        SYMS.forEach((s, i) => {
          qs("#p" + i, card).textContent = "p = " + p[i];
          qs("#l" + i, card).textContent = len[i] + " bit" + (len[i] > 1 ? "s" : "");
          qs("#c" + i, card).textContent = "uses " + fmt(2 ** -len[i], 4);
        });
        qs("#bar", card).innerHTML =
          `<div style="display:flex;height:26px;border:2px solid var(--line);border-radius:8px;overflow:hidden;background:var(--bg-2)">${len.map((l, i) => `<div style="width:${((2 ** -l / cap) * 100).toFixed(2)}%;background:${COL[i]};opacity:.85"></div>`).join("")}</div>
          <div class="faint" style="font-size:12px;display:flex;justify-content:space-between"><span>0</span><span>${ks > 1 ? "budget 1 is full at " + (100 / ks).toFixed(0) + "% of this bar" : "budget: 1 whole tree"}</span></div>`;
        qs("#k", card).textContent = fmt(ks, 4);
        qs("#al", card).textContent = al.toFixed(3);
        qs("#hh", card).textContent = h.toFixed(3);
        qs("#gap", card).textContent = (al - h >= 0 ? "+" : "") + (al - h).toFixed(3);
        qs("#msg", card).innerHTML =
          ks > 1 + 1e-9
            ? `<span style="color:var(--rose-ink)">Over budget: Σ 2⁻ˡ exceeds 1, so no uniquely decodable code has these lengths.${al < h ? " (L dips below H only because the code is impossible.)" : ""}</span>`
            : Math.abs(al - h) < 1e-9
              ? `<span style="color:var(--teal-ink)">Allowed, and L equals H exactly: the best any code can do.</span>`
              : `<span style="color:var(--teal-ink)">Allowed. L is ${(al - h).toFixed(3)} bits above the floor H.</span>`;
      }
      draw();
      root.appendChild(
        predict({
          id: "a7-source-coding-1",
          q: "Set the lengths to <b>1, 1, 2, 2</b> on any source. Is there a prefix code with those lengths?",
          opts: [
            "Yes, because every length is at least one bit long",
            "No: two 1-bit words fill the whole tree",
            "Only if the probabilities are all powers of ½",
          ],
          a: 1,
          why: "Kraft's sum is ½ + ½ + ¼ + ¼ = 1.5, which is over the budget of 1. Two 1-bit codewords (0 and 1) already claim every possible bit string.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-source-coding-2",
          q: "On the <b>Loaded</b> source, set the lengths to 1, 2, 3, 3. How does L compare with H?",
          opts: [
            "L is slightly above H",
            "L equals H exactly",
            "L is below H, which is a better code than entropy allows",
          ],
          a: 1,
          why: "These are exactly −log₂ p for ½, ¼, ⅛, ⅛. Every ideal length is a whole number, so nothing is lost to rounding and L = H = 1.75. Only a code that breaks Kraft's inequality can get below H.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Average length <b>L = Σ pᵢ lᵢ</b>. We want it small.",
            "<b>Kraft's inequality</b>: a prefix code with lengths lᵢ exists exactly when Σ 2<sup>−lᵢ</sup> ≤ 1. Short codewords eat a lot of the budget.",
            "Minimising L under Kraft gives the ideal length <b>lᵢ = −log₂ pᵢ</b>, so <b>L ≥ H</b>: the source coding theorem.",
            "Equality needs every p to be a power of ½. Otherwise ideal lengths are fractions and L sits a little above H.",
          ],
          "No lossless code beats entropy, and Kraft's inequality is the budget that proves it.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a7-source-coding"] = {
    sum: "Short codewords are a limited resource. <b>Kraft's inequality</b> is the budget; spending it best gives lengths of −log₂ p, and the total is the entropy.",
    steps: [
      { t: "Expected code length", b: `<p>A code gives symbol $x_i$ a codeword of length $l_i$. The cost to compress a source is the <b>expected length</b>:</p><p>$$L = \\sum_i p_i\\, l_i$$</p><p>Loaded die ($p = \\tfrac12, \\tfrac14, \\tfrac18, \\tfrac18$) with lengths 1, 2, 3, 3: $L = 0.5 + 0.5 + 0.375 + 0.375 = 1.75$ bits.</p>`,
        v: FG.bars([["A (p = ½) × 1 bit", 0.5, "teal", "bits"], ["B (p = ¼) × 2 bits", 0.5, "violet"], ["C (p = ⅛) × 3 bits", 0.375, "amber"], ["D (p = ⅛) × 3 bits", 0.375, "rose"]], { max: 0.6, fmt: (v) => v.toFixed(3) }) + `<div class="fig-cap">The four contributions add to L = 1.75.</div>`,
        c: { q: "Probabilities ½ and ½, codeword lengths 1 and 1. What is L?", o: ["1 bit", "2 bits", "½ bit"], a: 0, why: "L = ½·1 + ½·1 = 1." } },
      { t: "The budget: Kraft's inequality", b: `<p>Think of the binary tree of all bit strings. A codeword of length $l$ rules out everything below it, which is a share $2^{-l}$ of the leaves. For a prefix code the shares can't overlap, so</p><p>$$\\sum_i 2^{-l_i} \\le 1$$</p><p>Short codewords are expensive: a 1-bit word uses half the tree. This is the <b>Kraft inequality</b>, and it works both ways: any lengths that satisfy it can be realised as a prefix code.</p>`,
        v: FG.cells([{ v: "A: 1 bit", sub: "uses ½", c: "teal" }, { v: "B: 2 bits", sub: "uses ¼", c: "violet" }, { v: "C: 3", sub: "uses ⅛", c: "amber" }, { v: "D: 3", sub: "uses ⅛", c: "rose" }, "=", { v: "1", sub: "full", c: "blue" }], { label: "lengths 1, 2, 3, 3" }),
        c: { q: "Lengths 1, 2, 2 for three symbols. Does a prefix code exist?", o: ["Yes: ½ + ¼ + ¼ = 1", "No: the sum is above 1", "No: lengths must all differ"], a: 0, why: "The sum is exactly 1, so it fits (for example 0, 10, 11)." } },
      { t: "Spend the budget wisely", b: `<p>We want the smallest $L$ subject to Kraft. Treat the budget as a constraint and use a Lagrange multiplier $\\lambda$:</p><p>$$\\mathcal{L} = \\sum_i p_i l_i + \\lambda\\Bigl(\\sum_i 2^{-l_i} - 1\\Bigr)$$</p><p>Setting $\\partial\\mathcal{L}/\\partial l_i = 0$ gives $2^{-l_i} \\propto p_i$, and using the full budget fixes the constant:</p><p>$$2^{-l_i} = p_i \\;\\Rightarrow\\; l_i = -\\log_2 p_i$$</p><span class="key">Likely symbols get short words, in exactly the proportion their surprise suggests.</span>`,
        v: table(["p", "ideal length −log₂ p"], [["½", "1"], ["¼", "2"], ["⅛", "3"], ["1/16", "4"], ["0.3", "1.74 (not a whole number)"]], 460),
        c: { q: "A symbol has p = 1/16. Its ideal codeword length is…", o: ["4 bits", "16 bits", "1/16 of a bit"], a: 0, why: "−log₂(1/16) = 4." } },
      { t: "The source coding theorem", b: `<p>Put the ideal lengths into $L$:</p><p>$$L_{\\min} = \\sum_i p_i(-\\log_2 p_i) = H$$</p><p>So every uniquely decodable code has</p><p>$$\\boxed{L \\ge H}$$</p><p>Equality holds when every $p_i$ is a power of $\\tfrac12$ (all ideal lengths are whole numbers). This is Shannon's 1948 result.</p>`,
        v: FG.compare({ title: "Powers of ½", c: "teal", body: "p = ½, ¼, ⅛, ⅛<br>whole-bit ideal lengths: <b>L = H = 1.75</b>" }, { title: "Anything else", c: "violet", body: "p = 0.4, 0.3, 0.2, 0.1<br>fractional ideal lengths: <b>L &gt; H</b> for any real code" }),
        c: { q: "A claimed code for a source with H = 1.5 bits has L = 1.2 bits. What should you conclude?", o: ["It is not uniquely decodable, or the claim is wrong", "It is a very good code that beats the usual limit", "Entropy was computed in the wrong units by mistake"], a: 0, why: "L ≥ H for every uniquely decodable code. A code that breaks Kraft's budget is the usual explanation for a too-good result." } },
      { t: "Rounding up: how close can you get?", b: `<p>Whole-bit codewords must round the ideal length up: $l_i = \\lceil -\\log_2 p_i \\rceil$. These lengths still satisfy Kraft, and they give</p><p>$$H \\le L < H + 1$$</p><p>Example $p = (0.4, 0.3, 0.2, 0.1)$: lengths 2, 2, 3, 4, so $L = 2.4$, while $H \\approx 1.85$. Huffman's algorithm does better than this rounding rule (next module).</p>`,
        v: table(["p", "−log₂ p", "rounded up", "uses 2⁻ˡ"], [["0.4", "1.32", "2", "0.25"], ["0.3", "1.74", "2", "0.25"], ["0.2", "2.32", "3", "0.125"], ["0.1", "3.32", "4", "0.0625"], { c: ["", "", "Kraft sum", "0.6875 (≤ 1)"], hl: true }], 560),
        c: { q: "Rounded-up lengths always satisfy Kraft, so the average L is…", o: ["At least H but less than H + 1", "Exactly H, with no rounding loss at all", "Always at least H + 1, one whole bit too many"], a: 0, why: "Rounding each length up costs less than one bit per symbol, so H ≤ L < H + 1." } },
      { t: "Why base 2?", b: `<p>The logarithm's base is the size of the <b>code alphabet</b>. Binary codewords (0 and 1) give $l = -\\log_2 p$, measured in <b>bits</b>. A ternary alphabet {0, 1, 2} gives $-\\log_3 p$ in <b>trits</b>, and natural logs give <b>nats</b>. The encoder and decoder agree on the alphabet, and that fixes the unit.</p>`,
        v: table(["Code alphabet", "log base", "Unit"], [["2 symbols (0, 1)", "2", "bit"], ["3 symbols (0, 1, 2)", "3", "trit"], ["10 digits", "10", "decimal digit"], ["(natural logarithm)", "e", "nat"]], 520),
        c: { q: "A source's entropy is 3 bits. In a ternary code, about how many trits is that?", o: ["About 1.9 trits", "Exactly 3 trits, the same number", "Exactly 9 trits, three each"], a: 0, why: "One trit carries log₂3 ≈ 1.58 bits, so 3 bits ≈ 3 ÷ 1.58 ≈ 1.9 trits." } },
    ],
    guide: ["On <b>Loaded</b>, press the + and − buttons until the lengths are 1, 2, 3, 3: Kraft hits 1 and L = H.", "Make every codeword 1 bit long: Kraft goes over 1 and the message says it is impossible.", "Switch to <b>Skewed</b> and find the shortest allowed lengths.", "Answer the questions after the demo."],
  };

  /* ============ 7.11 LZW in GIF images ============ */
  reg({
    id: "a7-gif",
    order: 11,
    num: "7.11",
    title: "LZW in GIF images",
    blurb: "A row of pixels is a string over a 256-colour palette. Watch LZW shrink flat colour and fail on noise.",
    render(root) {
      root.appendChild(header(this, ""));
      const rn = mseed(1);
      const ROWS = {
        lec: ["Lecture row", "AAAAAABBBCCCCCDDDD"],
        stripe: ["Stripes", "AB".repeat(9)],
        flat: ["One colour", "A".repeat(18)],
        noise: ["Noisy", Array.from({ length: 18 }, () => "ABCD"[Math.floor(rn() * 4)]).join("")],
      };
      const COL = { A: "teal", B: "violet", C: "amber", D: "rose" };
      let key = "lec";
      const card =
        el(`<div class="card"><div class="card-head"><h2>One row of GIF pixels</h2><span class="faint">palette: A = 1, B = 2, C = 3, D = 4</span></div>
        <div class="controls" id="pre"></div><div id="px"></div><div id="cd" style="min-height:80px"></div>
        <div class="stat-row"><div class="stat"><small>Pixels</small><b id="n"></b></div><div class="stat teal"><small>Codes</small><b id="m"></b></div><div class="stat amber"><small>Codes per pixel</small><b id="r"></b></div><div class="stat"><small>New dictionary entries</small><b id="e"></b></div><div class="stat"><small>Decoded back</small><b id="ok"></b></div></div>
        <p class="faint" id="msg" style="min-height:3em"></p></div>`);
      root.appendChild(card);
      qs("#pre", card).appendChild(
        N.seg(
          Object.entries(ROWS).map(([k, v]) => [k, v[0]]),
          key,
          (v) => {
            key = v;
            draw();
          },
        ),
      );
      function draw() {
        const t = ROWS[key][1],
          e = lzwEnc(t, ["A", "B", "C", "D"]),
          d = lzwDec(e.out, ["A", "B", "C", "D"]);
        qs("#px", card).innerHTML = FG.cells(
          [...t].map((c) => ({ v: c, c: COL[c] })),
          { label: "pixels", size: 28 },
        );
        qs("#cd", card).innerHTML = FG.cells(
          e.out.map((k) => ({ v: k + 1, c: k < 4 ? undefined : "blue" })),
          { label: "LZW codes", size: 34 },
        );
        qs("#n", card).textContent = t.length;
        qs("#m", card).textContent = e.out.length;
        qs("#r", card).textContent = (e.out.length / t.length).toFixed(2);
        qs("#e", card).textContent = e.steps.filter((s) => s[3] >= 0).length;
        qs("#ok", card).textContent = d.out === t ? "yes" : "NO";
        qs("#msg", card).innerHTML =
          `Plain colour codes are 1 to 4 (the palette). Blue codes (5 and up) stand for <b>several pixels at once</b>. ` +
          (e.out.length <= t.length / 2
            ? "Long repeats make each code cover many pixels."
            : e.out.length >= t.length * 0.75
              ? "Hardly any pattern repeats, so there is little to save."
              : "A moderate saving.");
      }
      draw();
      root.appendChild(
        predict({
          id: "a7-gif-1",
          q: "Choose <b>Noisy</b>. Compared with the 18 pixels, the number of codes is…",
          opts: [
            "About a third of 18, so 6 codes",
            "Only a little fewer: nothing repeats much",
            "More than 18, since the dictionary adds extras",
          ],
          a: 1,
          why: "A random-looking row hardly ever repeats a multi-pixel pattern, so the dictionary entries are never reused. This is the lecture's warning that LZW is less effective for complex images with high detail.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-gif-2",
          q: "Choose <b>One colour</b> (18 identical pixels). How many codes will it take?",
          opts: [
            "18, one for every single pixel",
            "A handful: each new entry is one pixel longer",
            "Exactly 1, since every pixel is the same",
          ],
          a: 1,
          why: "Each code covers one more pixel than the last (1, 2, 3, 4, 5 pixels, then 3 more), so 18 identical pixels need only 6 codes. A completely flat region is the best case.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A GIF holds up to 256 colours; each pixel is an index, so a row of pixels is a string over a small alphabet.",
            "LZW scans for repeating patterns, builds the dictionary as it goes and replaces patterns with shorter codes.",
            "It is <b>lossless</b>: the picture comes back exactly. It shines on flat colour, stripes and logos.",
            "It struggles on complex, detailed images, and a bigger dictionary slows long sequences.",
          ],
          "GIF uses LZW because pictures with flat colours are full of repeated pixel strings, and nothing is lost.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a7-gif"] = {
    sum: "GIF images are palette indices compressed with LZW: great for flat colour and logos, poor for photographs.",
    steps: [
      { t: "What a GIF is", b: `<p><b>GIF</b> (Graphics Interchange Format) holds simple animations and still images. It is popular for its small size, fast loading and looping animations. A GIF supports at most <b>256 colours</b>: each pixel stores an index into a palette, a single byte.</p>`,
        v: FG.cells([{ v: "0", sub: "teal", c: "teal" }, { v: "1", sub: "violet", c: "violet" }, { v: "2", sub: "amber", c: "amber" }, { v: "3", sub: "rose", c: "rose" }, "…", { v: "255", sub: "last", c: "blue" }], { label: "palette" }),
        c: { q: "Why are GIF colours limited to 256?", o: ["Each pixel is a palette index held in one byte", "Because LZW can't handle more than 256 colours", "Browsers can only ever show 256 colours at once"], a: 0, why: "One byte has 256 values. The palette lists the actual colours and each pixel just holds an index." } },
      { t: "How LZW is used on pixels", b: `<p>The encoder scans the pixel data for repeating patterns, builds a dictionary of patterns <b>as it goes</b>, replaces patterns with shorter dictionary codes, and stores the code stream in the GIF file.</p>`,
        v: FG.flow([{ t: "pixel row", s: "A A A A A A B B B …" }, { t: "scan for patterns", s: "build dictionary", c: "violet" }, { t: "codes", s: "1 5 6 2 …", c: "teal" }, { t: "stored in file", s: "lossless" }]),
        c: { q: "In GIF, LZW works on…", o: ["Strings of pixel colour indices", "The photograph's brightness", "The file's metadata only"], a: 0, why: "Each pixel is a symbol (a palette index), so a row is a string for LZW to find patterns in." } },
      { t: "The lecture's row", b: `<p>Row <b>AAAAAABBBCCCCCDDDD</b> (6 A, 3 B, 5 C, 4 D) with A = 1, B = 2, C = 3, D = 4. Run the real algorithm and the codes are <b>1, 5, 6, 2, 8, 3, 10, 10, 4, 13, 4</b>: eleven codes for eighteen pixels.</p><p><span class="analogy">Heads-up: the lecture's sketch lists 1, 5, 6, 2, 7, 3, 8, 8, 4, 9, 4. It has the same shape (eleven codes), but its later numbers skip some dictionary entries (AAAB, BBC, CCC, CCD ...). The full algorithm numbers every new entry in order, as shown here.</span></p>`,
        v: table(["w", "output", "new entry"], lzwEnc("AAAAAABBBCCCCCDDDD", ["A", "B", "C", "D"]).steps.map(([w, code, add, idx]) => [`<b class="mono">${w}</b>`, `<b>${code + 1}</b>`, idx >= 0 ? `${idx + 1} = ${add}` : "(end)"]), 520),
        c: { q: "How many codes does the row AAAAAABBBCCCCCDDDD become?", o: ["11", "18", "4"], a: 0, why: "The 18 pixels are covered by 11 matches, so 11 codes." } },
      { t: "Decompression", b: `<p>The decoder rebuilds the pixel row exactly, using the same rule as before: output the entry, add previous + first letter. This row even triggers the missing-entry case once: the second code 10 (CC) is read right after 3 (C), before the decoder has made entry 10, so it uses C + C.</p>`,
        v: table(["receive", "output", "adds"], lzwDec(lzwEnc("AAAAAABBBCCCCCDDDD", ["A", "B", "C", "D"]).out, ["A", "B", "C", "D"]).steps.map((s) => ({ c: [`<b>${s.k + 1}</b>`, `<b class="mono">${s.e}</b>${s.miss ? " <small>(not there yet)</small>" : ""}`, s.added ? `${s.added[0] + 1} = ${s.added[1]}` : "—"], hl: s.miss })), 520),
        c: { q: "LZW decompression of a GIF row gives back…", o: ["The identical row of pixels", "A close but slightly blurred row", "Only the most common colours"], a: 0, why: "LZW is lossless: every pixel returns exactly." } },
      { t: "What it buys you", b: `<p>Benefits: smaller files for faster sharing and loading; <b>lossless</b>, so no loss of image quality; efficient for images and animations with repeating patterns. That's why GIF suits web animations, memes, simple logos, icons and instructional graphics.</p>`,
        v: FG.bars([["flat colour (18 same pixels)", lzwEnc("A".repeat(18), ["A", "B", "C", "D"]).out.length / 18, "teal", "codes per pixel"], ["stripes (ABAB…)", lzwEnc("AB".repeat(9), ["A", "B", "C", "D"]).out.length / 18, "violet"], ["lecture row", 11 / 18, "amber"]], { max: 1, fmt: (v) => v.toFixed(2) }),
        c: { q: "Which image would LZW in a GIF compress best?", o: ["A logo with large blocks of one colour", "A photograph with fine grain", "A noisy scan with random speckle"], a: 0, why: "Big flat areas produce long repeated pixel strings, which LZW turns into single codes." } },
      { t: "Challenges", b: `<p>LZW is <b>less effective for complex images or high detail</b>, because few patterns repeat. It is limited by the 256-colour palette. And the dictionary keeps growing, which can slow encoding of long sequences.</p><p>Each code also needs a few more bits than a plain pixel index, so the real saving is a little smaller than "fewer codes" suggests.</p>`,
        v: (() => { const r = mseed(1), n = Array.from({ length: 18 }, () => "ABCD"[Math.floor(r() * 4)]).join(""); return FG.compare({ title: "Flat colour", c: "teal", body: `18 pixels → <b>${lzwEnc("A".repeat(18), ["A", "B", "C", "D"]).out.length} codes</b>` }, { title: "Noisy detail", c: "rose", body: `18 pixels → <b>${lzwEnc(n, ["A", "B", "C", "D"]).out.length} codes</b>, barely fewer` }); })(),
        c: { q: "Which is a challenge for LZW in GIFs?", o: ["It does little for detailed images with few repeats", "It loses colour accuracy every time it runs", "It can't compress logos or other flat graphics"], a: 0, why: "Detail breaks up the repeats the dictionary relies on." } },
    ],
    guide: ["Pick <b>Lecture row</b>: 18 pixels become 11 codes. Blue codes are multi-pixel dictionary entries.", "Try <b>Stripes</b> and <b>One colour</b>: how few codes can an entire row need?", "Now <b>Noisy</b>: is there anything to save?", "Check that the Decoded back card always says yes."],
  };

  /* ============ 7.12 Lossy compression: rate, distortion, neural codecs ============ */
  const RD = (() => {
    const r = mseed(42),
      X = Array.from({ length: 3000 }, () => {
        const z = (r() + r() + r() + r() - 2) / Math.sqrt(4 / 12);
        return Math.min(1, Math.max(0, 0.5 + 0.15 * z));
      });
    const at = (d) => {
      const c = new Map();
      let mse = 0;
      for (const x of X) {
        const k = Math.round(x / d);
        c.set(k, (c.get(k) || 0) + 1);
        const e = x - k * d;
        mse += e * e;
      }
      mse /= X.length;
      let h = 0;
      for (const v of c.values()) {
        const p = v / X.length;
        h -= p * lg2(p);
      }
      return { d, R: h, D: mse, P: 10 * Math.log10(1 / mse) };
    };
    const grid = Array.from({ length: 60 }, (_, i) => at((i + 1) / 100));
    return { X, at, grid, best: (lam) => grid.reduce((b, o) => (o.R + lam * o.D < b.R + lam * b.D ? o : b)) };
  })();

  reg({
    id: "a7-rate-distortion",
    order: 12,
    num: "7.12",
    title: "Lossy compression: rate and distortion",
    blurb:
      "Throw away detail on purpose. Quantise signals, measure bits (rate) against error (distortion), and let one knob λ choose the trade.",
    render(root) {
      root.appendChild(header(this, ""));
      let step = 0.2,
        lam = 300;
      const card =
        el(`<div class="card"><div class="card-head"><h2>A tiny quantiser</h2><span class="faint">3000 pixel-like values in [0, 1], rounded to steps of size Δ</span></div>
        <div class="controls" id="c1"></div><div class="controls"><span class="faint">λ (how much error hurts)</span><span id="c2"></span></div>
        <div class="stat-row"><div class="stat teal"><small>Rate R (bits/value)</small><b id="r"></b></div><div class="stat rose"><small>Distortion D (MSE)</small><b id="d"></b></div><div class="stat"><small>PSNR (dB)</small><b id="p"></b></div><div class="stat amber"><small>Total loss</small><b id="j"></b></div></div>
        <div id="cv"></div><p class="faint" id="msg" style="min-height:3.2em"></p></div>`);
      root.appendChild(card);
      const sl = N.slider("Step size Δ", 1, 60, 1, 20, (v) => (v / 100).toFixed(2));
      sl.onInput((v) => {
        step = v / 100;
        draw();
      });
      qs("#c1", card).appendChild(sl);
      qs("#c2", card).appendChild(
        N.seg(
          [
            ["30", "30"],
            ["300", "300"],
            ["3000", "3000"],
            ["30000", "30000"],
          ],
          "300",
          (v) => {
            lam = +v;
            draw();
          },
        ),
      );
      function draw() {
        const o = RD.grid[Math.round(step * 100) - 1],
          best = RD.best(lam),
          J = (q) => q.R + lam * q.D;
        qs("#r", card).textContent = o.R.toFixed(2);
        qs("#d", card).textContent = o.D.toFixed(4);
        qs("#p", card).textContent = o.P.toFixed(1);
        qs("#j", card).textContent = J(o).toFixed(2);
        const Jmax = Math.max(...RD.grid.map(J)),
          ymax = Math.min(Jmax, 12);
        qs("#cv", card).innerHTML = curve(
          (x) => Math.min(ymax, J(RD.grid[Math.max(0, Math.min(59, Math.round(x * 100) - 1))])),
          {
            x: [0.01, 0.6],
            y: [0, ymax],
            xl: "step size Δ",
            yl: "loss R + λD (bits)",
            marks: [
              [step, Math.min(ymax, J(o)), "var(--amber)", "you", -14],
              [best.d, Math.min(ymax, J(best)), "var(--teal)", "best", 26],
            ],
          },
        );
        qs("#msg", card).innerHTML =
          `With λ = ${lam.toLocaleString()} the lowest loss is at Δ = <b>${best.d.toFixed(2)}</b> (rate ${best.R.toFixed(2)} bits, PSNR ${best.P.toFixed(1)} dB). ` +
          (Math.abs(step - best.d) < 0.015
            ? "You are on it."
            : step > best.d
              ? "Your step is coarser: fewer bits but too much error for this λ."
              : "Your step is finer: very accurate but too many bits for this λ.");
      }
      draw();
      root.appendChild(
        predict({
          id: "a7-rate-distortion-1",
          q: "Increase the step size Δ (coarser quantising). What happens to the rate R and the distortion D?",
          opts: ["R falls and D rises", "R rises and D falls", "Both fall: a coarser step is simply better"],
          a: 0,
          why: "A coarser step lumps more values into the same symbol, so there are fewer distinct symbols (lower entropy, fewer bits) and larger rounding errors. This is the rate-distortion trade-off.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-rate-distortion-2",
          q: "Raise λ from 300 to 30,000, making error very expensive. The best step size Δ will…",
          opts: [
            "Get larger, since that saves even more bits",
            "Get smaller: accuracy matters most now",
            "Stay the same, since λ doesn't affect the best step",
          ],
          a: 1,
          why: "The loss is R + λD. A large λ makes distortion cost a lot, so the minimum moves to a fine step (about 0.02) with a high rate. A small λ puts rate first and picks a coarse step.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Lossless</b> coding can't beat the entropy. <b>Lossy</b> coding spends error (distortion D) to buy a lower rate R.",
            "Rate is an entropy-style quantity, R = E[−log₂ p(ẑ)]: the expected length of the coded bitstream.",
            "Loss = <b>R + λD</b>. λ is the knob: large λ protects quality, small λ saves bits.",
            "PSNR = 10 log₁₀(MAX²/MSE) turns the error into decibels; higher is better.",
          ],
          "Lossy compression picks a point on the rate-distortion curve, and λ decides which one.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a7-rate-distortion"] = {
    sum: "Entropy bounds lossless compression. Allow some error and you can go lower: modern neural codecs balance rate against distortion with one weight, λ.",
    steps: [
      { t: "Lossless versus lossy", b: `<p>Everything so far (Huffman, LZW) is <b>lossless</b>: decode and you get the data back exactly, and entropy is the floor. A <b>lossy</b> codec throws information away on purpose, so the output is only close to the input. In return it can go far below the entropy of the original.</p>`,
        v: FG.compare({ title: "Lossless", c: "teal", body: "Huffman, LZW/GIF<br>exact copy back<br>limited by <b>entropy</b>" }, { title: "Lossy", c: "violet", body: "JPEG, neural codecs<br>close copy back<br>trades <b>error for bits</b>" }),
        c: { q: "Which statement is true of a lossy codec?", o: ["It can spend fewer bits than the entropy by allowing error", "It always reproduces the input exactly, bit for bit", "It never uses the idea of entropy at all"], a: 0, why: "Entropy bounds lossless coding. Accepting distortion lets a lossy codec go lower." } },
      { t: "Rate: the entropy of what you send", b: `<p>A neural codec turns an image into a short <b>latent</b> vector, rounds it to integers $\\hat z$ and entropy-codes those. The cost is the <b>rate</b>:</p><p>$$R = \\mathbb{E}\\bigl[-\\log_2 p_{\\hat z}(\\hat z)\\bigr]$$</p><p>It plays exactly the role entropy played before: the expected length of the (arithmetic-coded) bitstream.</p>`,
        v: FG.flow([{ t: "image x", s: "28 × 28 pixels" }, { t: "encoder", s: "latent y", c: "violet" }, { t: "round", s: "ẑ = round(y)", c: "amber" }, { t: "entropy code", s: "rate R bits", c: "teal" }, { t: "decoder", s: "x̂ ≈ x", c: "violet" }]),
        c: { q: "In a neural codec, what does the rate term R measure?", o: ["The expected bits needed for the coded latents", "How blurry the final output image is", "How long the training run takes in total"], a: 0, why: "R is the entropy-style cost of the rounded latents: the expected length of the bitstream." } },
      { t: "Distortion and PSNR", b: `<p><b>Distortion</b> $D$ measures how far the reconstruction $\\hat x$ is from $x$, most simply the mean squared error. A standard way to quote it is the peak signal-to-noise ratio:</p><p>$$\\mathrm{PSNR} = 10\\log_{10}\\frac{\\mathrm{MAX}^2}{\\mathrm{MSE}}\\ \\text{dB}$$</p><p>With pixels in $[0,1]$ ($\\mathrm{MAX}=1$): MSE 0.01 gives 20 dB, MSE 0.0001 gives 40 dB. <b>Lower error, higher PSNR.</b></p>`,
        v: table(["MSE", "PSNR (MAX = 1)", "quality"], [["0.01", "20 dB", "rough"], ["0.001", "30 dB", "decent"], ["0.0001", "40 dB", "very close"]], 480),
        c: { q: "The MSE falls from 0.01 to 0.0001 (pixels in [0, 1]). The PSNR…", o: ["Rises from 20 dB to 40 dB", "Falls from 40 dB to 20 dB", "Stays at 20 dB"], a: 0, why: "Each tenfold drop in MSE adds 10 dB. Two such drops add 20 dB." } },
      { t: "One knob: loss = R + λD", b: `<p>Training minimises a single number: $\\mathcal{L} = R + \\lambda D$. Bits and error compete, and $\\lambda$ says how much one unit of error is worth.</p><p><b>Large $\\lambda$:</b> error is costly, so the codec keeps detail and spends more bits. <b>Small $\\lambda$:</b> bits are costly, so it compresses hard and tolerates blur. Plot rate against quality for several $\\lambda$ and you trace the <b>rate-distortion curve</b>.</p>`,
        v: FG.plot([{ pts: [0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.6].map((d) => [RD.at(d).R, RD.at(d).P]), c: "blue", label: "each point: one step size" }], { x: [0, 5.2], y: [10, 48], xl: "rate: bits per value", yl: "PSNR dB", marks: [[RD.at(0.1).R, "better quality costs bits", "amber", RD.at(0.1).P]] }),
        c: { q: "A codec is retrained with a much <b>larger</b> λ. You should expect…", o: ["Higher quality and a higher bit rate", "Lower quality and a lower bit rate", "No change to either"], a: 0, why: "Larger λ weights the error term more, so training pays bits to reduce it." } },
      { t: "Quantisation breaks learning", b: `<p>Rounding is a staircase: its slope is <b>zero</b> almost everywhere, so gradients can't flow back through it and training stalls. The fix: during training <b>add noise</b> $\\tilde y = y + \\mathcal{U}(-\\tfrac12,\\tfrac12)$ instead of rounding. Uniform noise has the same spread as the rounding error, but it's smooth. At test time, switch back to real rounding.</p>`,
        v: FG.plot([{ f: (x) => Math.round(x), c: "rose", label: "round(y): flat steps" }, { f: (x) => x, c: "dim", dash: "5 5", label: "y + noise on average" }], { x: [0, 4], y: [0, 4], xl: "y", yl: "output" }),
        c: { q: "Why not just backpropagate through round()?", o: ["Its gradient is zero almost everywhere", "It is far too slow to compute for every pixel", "It always makes the output values negative"], a: 0, why: "A flat staircase has slope 0, so no learning signal gets through. Adding uniform noise during training mimics the rounding error with a smooth function." } },
      { t: "Bits per pixel", b: `<p>The rate is per latent value, but pictures are compared per pixel: $\\mathrm{bpp} = R \\times (\\text{latent values}) / (\\text{pixels})$. Say 16 latents at 3 bits each describe a 28 × 28 = 784-pixel digit: $16 \\times 3 = 48$ bits, so $48/784 \\approx 0.06$ bpp, against 8 bpp raw. A plain pixel-value histogram of such images has an entropy well under 8 bits, because most pixels are black: that is the redundancy a lossless coder could remove.</p>`,
        v: FG.bars([["raw 8-bit pixels", 8, "dim", "bpp"], ["neural codec (16 latents × 3 bits)", 48 / 784, "teal"]], { max: 8, fmt: (v) => v.toFixed(2) }),
        c: { q: "A latent of 32 values costs 2 bits each for a 784-pixel image. Roughly how many bits per pixel?", o: ["0.08", "0.8", "8"], a: 0, why: "32 × 2 = 64 bits, and 64 / 784 ≈ 0.08. About one hundredth of the raw 8 bits per pixel." } },
      { t: "The same trade-off in JPEG", b: `<p>JPEG shows the whole story: the <b>quantisation</b> stage is where information is lost (the lossy part, tuned by the quality setting), and the <b>Huffman</b> stage then packs what is left with no further loss. Lossy and lossless coding work together.</p>`,
        v: FG.flow(["blocks", "DCT", { t: "quantise", s: "lossy: error enters here", c: "rose" }, "zig-zag", { t: "Huffman", s: "lossless packing", c: "teal" }, { t: "file", s: "small" }]),
        c: { q: "In JPEG, which stage chooses how much quality to give up?", o: ["Quantisation", "Huffman coding", "Zig-zag scanning"], a: 0, why: "Quantisation rounds the transform values; coarser rounding saves bits but adds error. Huffman afterwards is lossless." } },
    ],
    guide: ["Drag the <b>Δ</b> slider: watch rate fall and error rise as the steps get coarser.", "Set <b>λ = 300</b> and drag Δ until your amber dot sits on the teal one: the best trade for that λ.", "Switch to <b>λ = 30</b> and then <b>30000</b>: the teal (best) dot slides along the curve.", "Answer the questions after the demo."],
  };

  /* ============ deepen the three original modules (their ids, predicts and checks stay) ============ */
  const pushSteps = (id, steps) => {
    if (L[id]) L[id].steps.push(...steps);
  };

  // prettier-ignore
  pushSteps("a7-entropy", [
    { t: "Worked example: three symbols", b: `<p>Probabilities 0.7, 0.2, 0.1. Surprise of each: $-\\log_2 0.7 \\approx 0.51$, $-\\log_2 0.2 \\approx 2.32$, $-\\log_2 0.1 \\approx 3.32$. Weight and add:</p><p>$H = 0.7(0.51) + 0.2(2.32) + 0.1(3.32) \\approx 1.16$ bits per symbol, against 1.58 for three equally likely symbols.</p>`,
      v: table(["symbol", "p", "surprise", "p × surprise"], [["X", "0.7", "0.51", "0.360"], ["Y", "0.2", "2.32", "0.464"], ["Z", "0.1", "3.32", "0.332"], { c: ["H", "1.0", "", "<b>1.157</b>"], hl: true }], 520),
      c: { q: "In this table, which symbol adds the most to H?", o: ["Y (p = 0.2)", "X (p = 0.7), the most likely", "Z (p = 0.1), the rarest"], a: 0, why: "A symbol's share is p × surprise. X is common but barely surprising; Z is very surprising but rare; Y balances both best." } },
    { t: "Surprise adds up", b: `<p>For two <b>independent</b> events, probabilities multiply, and logs turn products into sums, so surprises add: $-\\log_2 (p\\,q) = -\\log_2 p - \\log_2 q$. Two fair coin flips (probability ¼) carry 2 bits: exactly 1 + 1. This is why entropy of a long message is just the per-symbol entropy times its length.</p>`,
      v: FG.cells([{ v: "flip 1", sub: "1 bit", c: "teal" }, "+", { v: "flip 2", sub: "1 bit", c: "violet" }, "=", { v: "HH", sub: "2 bits (p = ¼)", c: "amber" }], { size: 74 }),
      c: { q: "A source sends 100 independent symbols, each with entropy 0.47 bits. The whole message needs at best about…", o: ["47 bits", "100 bits", "0.47 bits"], a: 0, why: "Independent surprises add: 100 × 0.47 = 47 bits." } },
    { t: "Entropy of written English", b: `<p>The lecture's measured value for written English is about <b>4.5 bits per letter</b>. ASCII spends 8, and a uniform pick among 26 letters would be 4.70, so letter frequencies alone already show room to shrink: up to $(8-4.5)/8 \\approx 44\\%$ against ASCII.</p><p>Counting letters one at a time misses most of English's structure (spelling, word order, grammar). That is why scrambled text is still readable and why smarter models compress even more.</p>`,
      v: FG.bars([["ASCII", 8, "dim", "bits per letter"], ["uniform over 26 letters", lg2(26), "violet"], ["written English (lecture)", 4.5, "teal"]], { max: 8, fmt: (v) => v.toFixed(2) }),
      c: { q: "English letters carry about 4.5 bits each, but ASCII uses 8. What does the gap mean?", o: ["A good code could use far fewer bits per letter", "ASCII is already optimal, so nothing can be saved", "English text must be longer than it seems to be"], a: 0, why: "Entropy is the floor for an ideal lossless code. ASCII spends almost twice that." } },
  ]);

  // prettier-ignore
  pushSteps("a7-huffman", [
    { t: "Decoding is a tree walk", b: `<p>The tree is also the decoder. Start at the root, follow each incoming bit down, and the moment you land on a letter output it and jump back to the root. For the lecture code, the bits <b class="mono">0 1 0</b> go root → 0 → 1 → 0 and land on <b>D</b>; a lone <b class="mono">1</b> lands on <b>B</b> straight away.</p>`,
      v: FG.graph({ nodes: { r: { x: 230, y: 28, label: "1.0", c: "blue" }, B: { x: 340, y: 110, label: "B", c: "teal" }, n49: { x: 130, y: 105, label: ".49" }, n20: { x: 60, y: 185, label: ".20" }, n29: { x: 200, y: 185, label: ".29" }, C: { x: 25, y: 255, label: "C", c: "violet" }, E: { x: 100, y: 255, label: "E", c: "violet" }, D: { x: 165, y: 255, label: "D", c: "violet" }, A: { x: 240, y: 255, label: "A", c: "violet" } },
        edges: [["r", "B", "1"], ["r", "n49", "0"], ["n49", "n20", "0"], ["n49", "n29", "1"], ["n20", "C", "0"], ["n20", "E", "1"], ["n29", "D", "0"], ["n29", "A", "1"]], w: 380, h: 280, r: 17 }),
      c: { q: "With the lecture's tree, the bits 0 0 1 decode to…", o: ["E", "C", "A"], a: 0, why: "Root → 0 (.49) → 0 (.20) → 1 (E)." } },
    { t: "Edge case: a very lopsided pair", b: `<p>With only two symbols, each gets one bit, even when one has probability 0.99. The entropy of that source is about 0.08 bits per symbol, yet Huffman spends <b>1 bit</b>. A whole-bit codeword can't be shorter than one bit, so a symbol-by-symbol code leaves a lot on the table here. Grouping symbols into blocks before coding recovers the gap.</p>`,
      v: FG.bars([["Huffman on {0.99, 0.01}", 1, "rose", "bit/symbol"], ["entropy floor", Hb(0.01), "teal"]], { max: 1, fmt: (v) => v.toFixed(2) }),
      c: { q: "A source sends A with 99% probability and B with 1%. Huffman's average length is…", o: ["1 bit per symbol, far above the entropy", "0.08 bits per symbol, matching the entropy", "0.5 bits per symbol, halfway down to zero"], a: 0, why: "Each symbol needs at least a one-bit codeword. Huffman can't use fractional bits." } },
  ]);

  // prettier-ignore
  pushSteps("a7-lzw", [
    { t: "How the dictionary grows", b: `<p>Every time the encoder emits a code (except the last) it adds exactly <b>one</b> new entry. BANANABANDANA starts with 4 entries (A, B, N, D) and emits 9 codes, so it ends with $4 + 8 = 12$ entries. The entries get longer as repeats are found, but the dictionary only ever <b>grows</b>, which is why very long inputs can slow encoding and why practical GIF coders cap or reset it.</p>`,
      v: FG.bars([["start", 4, "dim", "entries"], ["after 3 codes", 7, "violet"], ["after 6 codes", 10, "amber"], ["after all 9 codes", 12, "teal"]], { max: 12, fmt: (v) => String(v) }),
      c: { q: "The encoder has emitted 5 codes so far from a 4-letter starting alphabet. How many entries does the dictionary hold?", o: ["9: 4 letters plus 5 added", "8: 4 letters plus 4 added", "5, one per code"], a: 0, why: "Each code emitted mid-stream adds one entry (w plus the next symbol). Five codes add five, so 4 + 5 = 9. Only the very last code, at the end of the input, adds nothing." } },
  ]);
})();
