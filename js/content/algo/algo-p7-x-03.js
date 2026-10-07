/* Phase 7 coverage pass (3/4): 7.8 Huffman cost and limits, 7.10 LZW both directions. */
(function () {
  const sh = (NIC.shared.algoP7x = NIC.shared.algoP7x || {});
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS,
    FG = N.fig;
  const reg = (m) => N.register({ subject: "algo", lecture: 7, ...m });
  const { table, LEC_CODES, encode, decodeTree, lzwEnc, lzwDec } = sh;
  /* ============ 7.8 The Huffman algorithm: cost, limits, uses ============ */
  const FIXED = { A: "000", B: "001", C: "010", D: "011", E: "100" };
  const decodeFixed = (bits) => {
    let o = "";
    for (let i = 0; i + 3 <= bits.length; i += 3) {
      const ch = Object.entries(FIXED).find(([, v]) => v === bits.slice(i, i + 3));
      o += ch ? ch[0] : "?";
    }
    return o;
  };
  reg({
    id: "a7-huffman-algo",
    order: 8,
    num: "7.8",
    title: "Huffman: pseudocode, cost and limits",
    blurb:
      "Why greedy works here, what the algorithm costs, and why one flipped bit can wreck the rest of a Huffman stream.",
    render(root) {
      root.appendChild(header(this, ""));
      const MSGS = { a: "BBADEBC", b: "ABBEDBCBAD" };
      let mk = "a",
        code = "huff";
      const flips = new Set();
      const card =
        el(`<div class="card"><div class="card-head"><h2>Flip a bit, see what breaks</h2><span class="faint">tap bits in the stream to flip them</span></div>
        <div class="controls" id="c1"></div><div class="controls" id="c2"></div>
        <p style="margin:6px 0">Sent: <b class="mono" id="ori" style="letter-spacing:.12em"></b></p>
        <div class="rn-lzw-tape" id="tape" style="min-height:36px"></div>
        <p style="margin:8px 0">Decoded: <b class="mono" id="dec" style="letter-spacing:.12em"></b></p>
        <div class="stat-row"><div class="stat rose"><small>Symbols wrong</small><b id="wr"></b></div><div class="stat"><small>Flipped bits</small><b id="fl"></b></div></div>
        <p class="faint" id="msg" style="min-height:3em"></p></div>`);
      root.appendChild(card);
      qs("#c1", card).appendChild(
        N.seg(
          [
            ["huff", "Huffman code"],
            ["fixed", "Fixed 3-bit code"],
          ],
          code,
          (v) => {
            code = v;
            flips.clear();
            draw();
          },
        ),
      );
      qs("#c2", card).appendChild(
        N.seg(
          [
            ["a", "Short message"],
            ["b", "Longer message"],
          ],
          mk,
          (v) => {
            mk = v;
            flips.clear();
            draw();
          },
        ),
      );
      const clr = el(`<button class="btn small ghost">Undo all flips</button>`);
      clr.onclick = () => {
        flips.clear();
        draw();
      };
      qs("#c2", card).appendChild(clr);
      function draw() {
        const m = MSGS[mk],
          cd = code === "huff" ? LEC_CODES : FIXED,
          bits = encode(m, cd);
        const got = [...bits].map((b, i) => (flips.has(i) ? (b === "1" ? "0" : "1") : b)).join("");
        const dec = code === "huff" ? decodeTree(got, cd) : decodeFixed(got);
        let wrong = 0;
        const n = Math.max(m.length, dec.length);
        const cells = [...Array(n)]
          .map((_, i) => {
            const ok = dec[i] === m[i];
            if (!ok) wrong++;
            return `<span style="color:var(--${ok ? "teal" : "rose"}-ink)">${dec[i] || "∅"}</span>`;
          })
          .join("");
        qs("#ori", card).textContent = m;
        qs("#tape", card).innerHTML = [...got]
          .map(
            (b, i) =>
              `<button class="rn-lzw-cell ${flips.has(i) ? "rn-lzw-cur" : ""}" data-i="${i}" aria-label="bit ${i + 1}, flip" style="cursor:pointer;font:inherit">${b}</button>`,
          )
          .join("");
        qsa("#tape button", card).forEach(
          (b) =>
            (b.onclick = () => {
              const i = +b.dataset.i;
              flips.has(i) ? flips.delete(i) : flips.add(i);
              draw();
            }),
        );
        qs("#dec", card).innerHTML = cells;
        qs("#wr", card).textContent = wrong + " of " + m.length;
        qs("#fl", card).textContent = flips.size;
        qs("#msg", card).innerHTML = !flips.size
          ? "No bits flipped: decoding is perfect. Tap a bit above."
          : code === "huff"
            ? "Red letters are wrong. Codeword boundaries moved, so letters <i>after</i> the flip can be wrong too."
            : "Red letters are wrong. Every codeword is exactly 3 bits, so the damage stays inside one group.";
      }
      draw();
      root.appendChild(
        predict({
          id: "a7-huffman-algo-1",
          q: "Using the <b>Huffman code</b>, flip the 6th bit of the short message. What happens to the decoded text?",
          opts: [
            "Exactly one letter changes and the rest are fine",
            "Later letters go wrong too: boundaries shift",
            "Nothing: a prefix-free code ignores single-bit errors",
          ],
          a: 1,
          why: "Codewords have different lengths, so one wrong bit can change where the next codeword starts. Decoding then slides out of step. This is <b>error propagation</b>. Some flips are lucky, but many wreck the rest of the stream.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-huffman-algo-2",
          q: "Switch to the <b>Fixed 3-bit code</b> and flip any one bit. At most how many letters can be wrong?",
          opts: [
            "One: the bit belongs to a single 3-bit group",
            "Everything after it",
            "Two, the flipped letter and its neighbour",
          ],
          a: 0,
          why: "A fixed-length code never loses its place, so a flipped bit damages only its own group. Huffman buys its shorter messages with this fragility.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Huffman is <b>greedy</b>: always merge the two smallest. Greedy is not optimal for every problem, but here it provably is.",
            "Cost: sort in O(n log n), then n − 1 merges each costing O(log n): <b>O(n log n)</b> overall.",
            "The result is prefix-free, instantaneous, uniquely decodable, and used inside JPEG, MPEG and fax coding.",
            "Limits: needs the probabilities up front, and one bit error can <b>propagate</b> into the next codewords.",
          ],
          "Huffman is fast and optimal for symbol codes, but it needs known probabilities and is fragile to bit errors.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a7-huffman-algo"] = {
    sum: "Huffman's algorithm is a greedy loop on a priority queue. This module covers the pseudocode, its O(n log n) cost, what it needs, where it is used and how it fails.",
    steps: [
      { t: "Greedy: the best choice right now", b: `<p>A <b>greedy algorithm</b> always takes the choice that looks best at the moment. It doesn't always give an optimal answer, but for many problems it does.</p><p>Coins of 1, 3 and 4 to make 6: greedy takes 4 first, then 1 + 1, so <b>three coins</b>. Better is 3 + 3: <b>two coins</b>. Greedy fails there. For Huffman, merging the two least likely symbols is provably optimal.</p>`,
        v: FG.compare({ title: "Greedy on coins {1, 3, 4}, make 6", c: "rose", body: "take 4, then 1, then 1: <b>3 coins</b> (not best)" }, { title: "Greedy on Huffman", c: "teal", body: "merge the two smallest each time: <b>minimum</b> average length" }),
        c: { q: "Which statement about greedy algorithms is correct?", o: ["They always give optimal solutions to every problem", "Sometimes optimal, and Huffman's is one that is", "They never give optimal solutions to any problem"], a: 1, why: "Greedy choices are optimal for some problems (Huffman, Kruskal's tree) but not others (the coin example)." } },
      { t: "The algorithm in pseudocode", b: `<p>Input: a set $C$ of $n$ characters, each with a frequency. Output: the root of the Huffman tree.</p><pre style="margin:6px 0;overflow:auto">sort C by frequency            # O(n log n)
Q = C
repeat n - 1 times:
    z = new node
    z.left  = x = Extract-Min(Q)
    z.right = y = Extract-Min(Q)
    z.freq  = x.freq + y.freq
    Insert(Q, z)                # O(log n)
return Extract-Min(Q)           # the root</pre>`,
        v: FG.flow([{ t: "sort", s: "O(n log n)" }, { t: "n − 1 merges", s: "each 2 extracts + 1 insert", c: "violet" }, { t: "root", s: "one node left", c: "teal" }]),
        c: { q: "How many times does the main loop run for n symbols?", o: ["n − 1 times: each merge removes one node", "n times, once for every symbol in the queue", "n log n times, once per queue operation"], a: 0, why: "Each merge turns two nodes into one, so n nodes need n − 1 merges to leave a single root." } },
      { t: "Why O(n log n)", b: `<p>Sorting costs $O(n\\log n)$. The loop runs $n-1$ times and each pass does a couple of queue operations at $O(\\log n)$ apiece, so $O((n-1)\\log n)$. Add them:</p><p>$$O(n\\log n) + O\\bigl((n-1)\\log n\\bigr) \\approx O(n\\log n)$$</p>`,
        v: table(["symbols n", "merges n − 1", "n log₂ n (approx.)", "n² for comparison"], [["8", "7", "24", "64"], ["26 (letters)", "25", "122", "676"], ["256", "255", "2,048", "65,536"], ["1,024", "1,023", "10,240", "1,048,576"]], 640),
        c: { q: "A source has 26 symbols. How many merges does Huffman perform?", o: ["25", "26", "52"], a: 0, why: "n − 1 = 25 merges." } },
      { t: "What the result guarantees", b: `<p>The Huffman code is <b>uniquely decodable</b> and <b>instantaneous</b> (prefix-free): each codeword can be recognised the moment its last bit arrives, with no look-ahead. Among codes that give each symbol a whole number of bits, its average length is the smallest possible.</p>`,
        v: table(["Property", "Meaning"], [["Uniquely decodable", "one bit stream can only mean one message"], ["Instantaneous (prefix-free)", "no codeword begins another, so decode without look-ahead"], ["Optimal", "minimum average length among symbol-by-symbol codes"]], 640),
        c: { q: "Instantaneous means the decoder can…", o: ["Recognise a codeword as soon as its last bit arrives", "Decode the whole file in one operation", "Skip ahead to any symbol without reading the earlier ones"], a: 0, why: "Prefix-free codewords can be identified at their last bit, with no need to peek at later bits." } },
      { t: "Limitations", b: `<p><b>Needs the probabilities.</b> You must count the symbols first (a preliminary pass) and ship the table to the decoder.</p><p><b>Error propagation.</b> Codewords have different lengths, so a flipped bit can shift every later boundary. Try it on the lecture code: flip the 6th bit of the stream for <b>BBADEBC</b> and the decoder produces something different, and longer.</p>`,
        v: (() => { const bits = encode("BBADEBC", LEC_CODES), bad = bits.slice(0, 5) + (bits[5] === "1" ? "0" : "1") + bits.slice(6); return table(["", "bit stream", "decoded"], [["sent", `<span class="mono">${bits}</span>`, `<b class="mono">${decodeTree(bits, LEC_CODES)}</b>`], { c: ["after one flip", `<span class="mono">${bad}</span>`, `<b class="mono" style="color:var(--rose-ink)">${decodeTree(bad, LEC_CODES)}</b>`], bad: true }], 640); })(),
        c: { q: "Why does one wrong bit damage more than one Huffman symbol?", o: ["The decoder loses its place when a boundary shifts", "Huffman codewords contain checksums that spread the errors", "Each bit in the stream belongs to several symbols at once"], a: 0, why: "Variable-length codewords have no fixed boundaries. A wrong bit moves the boundary and every later codeword is cut in the wrong place." } },
      { t: "Where Huffman is used: JPEG and friends", b: `<p>Huffman coding is a component of <b>JPEG</b> image compression, <b>MPEG</b> video compression and fax machines. In JPEG the picture is converted, cut into 8×8 blocks, transformed (DCT), <b>quantised</b>, zig-zag scanned, and only then Huffman coded using a Huffman table. Decoding reverses the chain.</p>`,
        v: FG.flow(["RGB → YCbCr", "8×8 blocks", "DCT", { t: "quantise", s: "loses detail", c: "rose" }, "zig-zag", { t: "Huffman", s: "lossless", c: "teal" }]),
        c: { q: "In the JPEG chain, which stage is Huffman coding?", o: ["The last lossless stage, using a Huffman table", "The stage that throws away the fine detail", "The first stage, converting colours"], a: 0, why: "Quantisation discards detail. Huffman then stores what is left compactly, without further loss." } },
    ],
    guide: ["With <b>Huffman code</b> selected, tap the 6th bit of the short message and watch the decoded text change and grow.", "Undo it, then flip the very last bit: usually less damage.", "Switch to <b>Fixed 3-bit code</b> and flip any bit: only one letter breaks.", "Answer the questions after the demo."],
  };

  /* ============ 7.10 LZW from both ends: encoding and decoding ============ */
  const alphaOf = (t) => [...new Set(t)].sort();
  /** LZW decode runner on the lecture's example: codes 0 1 2 4 3 with A = 0, B = 1. */
  function lzwDecodeRun(box, life) {
    const ALPHA = ["A", "B"],
      CODES = [0, 1, 2, 4, 3];
    function* frames() {
      const d = ALPHA.slice();
      let prev = null;
      const outs = [];
      const snap = (x) => ({
        i: -1,
        prev: prev === null ? "·" : prev,
        e: "·",
        yn: "",
        outs: outs.slice(),
        ents: d.map((s, k) => [k, s]),
        add: -1,
        hit: -1,
        ...x,
      });
      yield snap({
        cap: `Received codes <b>${CODES.join(" ")}</b>. The decoder starts with the alphabet only: ${ALPHA.map((a, k) => `${a} = ${k}`).join(", ")}. No previous entry yet.`,
        line: 0,
      });
      for (const k of CODES) {
        const i = outs.length,
          miss = k >= d.length,
          e = miss ? prev + prev[0] : d[k];
        const ask =
          miss || k === 2
            ? {
                q: `Code <b>${k}</b> has arrived. Is it already in the decoder's dictionary? Tap yes or no.`,
                pick: ".rn-lzw-yn",
                a: miss ? "no" : "yes",
                why: miss
                  ? `The dictionary only goes up to ${d.length - 1}. Entry ${k} is the one the encoder created and used immediately.`
                  : `Entry ${k} (${d[k]}) was added earlier, so a plain lookup works.`,
              }
            : null;
        let add = -1;
        if (prev !== null) {
          add = d.length;
          d.push(prev + e[0]);
        }
        outs.push(e);
        const cap = miss
          ? `Code <b>${k}</b> is not in the dictionary yet. Rule: previous + its first letter = <b>${prev}</b> + <b>${prev[0]}</b> = <b>${e}</b>. Output it and add it as entry ${add}.`
          : prev === null
            ? `Code <b>${k}</b> is <b>${e}</b>. Output it. Nothing to add yet: there is no previous string.`
            : `Code <b>${k}</b> is <b>${e}</b>. Output it, then add previous + its first letter: <b>${prev}</b> + <b>${e[0]}</b> = <b>${prev + e[0]}</b> as entry ${add}.`;
        const pv = prev === null ? "·" : prev;
        prev = e;
        yield snap({ i, e, prev: pv, yn: miss ? "no" : "yes", hit: miss ? -1 : k, add, ask, cap, line: miss ? 2 : 1 });
      }
      yield snap({
        i: CODES.length,
        outs: outs.slice(),
        prev,
        e: "·",
        mood: "love",
        line: 3,
        cap: `All codes used. Output: <b>${outs.join("")}</b>, the original message. The dictionary was rebuilt without ever being sent.`,
      });
    }
    FG.run(box, life, {
      code: [
        "start with the alphabet only",
        "known code: output its entry; add previous + first letter",
        "unknown code: entry = previous + previous[0]; add and output",
        "previous = this entry",
      ],
      build(stage) {
        const root = el(`<div class="rn-lzw">
          <div class="rn-lzw-tape">${CODES.map((k) => `<span class="rn-lzw-cell" style="width:34px">${k}</span>`).join("")}</div>
          <div class="rn-lzw-mid"><div class="rn-lzw-box"><small>previous</small><b class="rn-lzw-w">·</b></div>
            <div class="rn-lzw-box rn-lzw-ask"><small>this code means… and is it in the dictionary?</small><div><b class="rn-lzw-wc">·</b><span class="rn-lzw-yn" data-k="yes">yes</span><span class="rn-lzw-yn" data-k="no">no</span></div></div></div>
          <div class="rn-lzw-row"><small>output</small><div class="rn-lzw-out">${CODES.map(() => `<span class="rn-lzw-code"></span>`).join("")}</div></div>
          <div class="rn-lzw-row"><small>dictionary</small><div class="rn-lzw-dict">${Array.from({ length: ALPHA.length + CODES.length }, () => `<span class="rn-lzw-ent"><i></i><b></b></span>`).join("")}</div></div></div>`);
        stage.appendChild(root);
        return {
          cells: qsa(".rn-lzw-cell", root),
          w: qs(".rn-lzw-w", root),
          wc: qs(".rn-lzw-wc", root),
          yn: qsa(".rn-lzw-yn", root),
          codes: qsa(".rn-lzw-code", root),
          ents: qsa(".rn-lzw-ent", root),
        };
      },
      draw(s, f, c) {
        s.cells.forEach((cell, k) => {
          cell.classList.toggle("rn-lzw-done", k < f.i);
          cell.classList.toggle("rn-lzw-cur", k === f.i);
        });
        FG.rn.text(c, s.w, f.prev);
        FG.rn.text(c, s.wc, f.e);
        s.yn.forEach((b) => {
          b.classList.toggle("rn-lzw-on", b.dataset.k === f.yn);
          b.classList.toggle("rn-lzw-off", !!f.yn && b.dataset.k !== f.yn);
        });
        s.codes.forEach((e, k) => {
          e.hidden = k >= f.outs.length;
          e.textContent = f.outs[k] || "";
        });
        s.ents.forEach((en, k) => {
          const e = f.ents[k];
          en.hidden = !e;
          if (!e) return;
          en.firstChild.textContent = e[0];
          en.lastChild.textContent = e[1];
          en.classList.toggle("rn-lzw-new", e[0] === f.add);
          en.classList.toggle("rn-lzw-hit", e[0] === f.hit);
        });
      },
      frames,
    });
  }

  reg({
    id: "a7-lzw-decode",
    order: 10,
    num: "7.10",
    title: "LZW: both directions, in full",
    blurb:
      "The lecture's ABABABABA example and both pseudocode listings. Encode, decode, spot the entry that isn't there yet.",
    render(root) {
      root.appendChild(header(this, ""));
      const PRE = { lec: "ABABABABA", aaa: "AAAAAAA", abra: "ABRACADABRA", miss: "MISSISSIPPI" };
      let key = "lec";
      const card =
        el(`<div class="card"><div class="card-head"><h2>Round trip</h2><span class="faint">encode, decode, and compare</span></div>
        <div class="controls" id="pre"></div>
        <p class="faint" id="al"></p>
        <div class="stat-row"><div class="stat"><small>Symbols in</small><b id="n"></b></div><div class="stat teal"><small>Codes out</small><b id="m"></b></div><div class="stat amber"><small>Missing-entry cases</small><b id="ms"></b></div><div class="stat"><small>Decoded equals input</small><b id="ok"></b></div></div>
        <div class="grid two" style="min-height:300px"><div><b>Encoder</b><div id="enc"></div></div><div><b>Decoder</b><div id="dec"></div></div></div></div>`);
      root.appendChild(card);
      qs("#pre", card).appendChild(
        N.seg(
          Object.entries(PRE).map(([k, v]) => [k, v]),
          key,
          (v) => {
            key = v;
            draw();
          },
        ),
      );
      function draw() {
        const t = PRE[key],
          al = alphaOf(t),
          e = lzwEnc(t, al),
          d = lzwDec(e.out, al),
          miss = d.steps.filter((s) => s.miss).length;
        qs("#al", card).innerHTML =
          `Starting dictionary: ${al.map((a, i) => `<b class="mono">${a} = ${i}</b>`).join(", ")}. New entries start at ${al.length}.`;
        qs("#n", card).textContent = t.length;
        qs("#m", card).textContent = e.out.length;
        qs("#ms", card).textContent = miss;
        qs("#ok", card).textContent = d.out === t ? "yes" : "NO";
        qs("#enc", card).innerHTML = table(
          ["w (longest match)", "emit", "add"],
          e.steps.map(([w, code, add, idx]) => [
            `<b class="mono">${w}</b>`,
            `<b>${code}</b>`,
            idx >= 0 ? `<span class="mono">${idx} = ${add}</span>` : "<span class='faint'>end of input</span>",
          ]),
          360,
        );
        qs("#dec", card).innerHTML = table(
          ["receive", "entry", "add"],
          d.steps.map((s) => ({
            c: [
              `<b>${s.k}</b>`,
              `<b class="mono">${s.e}</b>${s.miss ? " <small>not in dictionary yet</small>" : ""}`,
              s.added
                ? `<span class="mono">${s.added[0]} = ${s.added[1]}</span>`
                : "<span class='faint'>nothing yet</span>",
            ],
            hl: s.miss,
          })),
          380,
        );
      }
      draw();
      root.appendChild(
        predict({
          id: "a7-lzw-decode-1",
          q: "Choose <b>AAAAAAA</b> (seven As). In the decoder column, how many codes arrive before the decoder has built their entries?",
          opts: [
            "None: every code refers to an old entry",
            "Two: codes 1 and 2 need the first-letter rule",
            "All four of the codes, including the final 0",
          ],
          a: 1,
          why: "The encoder emits 0, 1, 2, 0. Entries 1 (AA) and 2 (AAA) are created and used straight away, so the decoder must reconstruct each as previous + its first letter. The final 0 is a plain lookup.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-lzw-decode-2",
          q: "<b>ABABABABA</b> (9 symbols) gives 5 codes. A message of ABAB… with four times the symbols would give about…",
          opts: [
            "20 codes, because the ratio stays the same",
            "Far fewer than 20: longer matches build up",
            "More codes than symbols, because the dictionary grows",
          ],
          a: 1,
          why: "For this pattern 9 symbols give 5 codes, 18 give 8 and 36 give 11. Each new entry is one letter longer than the last, so a repetitive message costs fewer and fewer codes per symbol.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Encoder: extend w while w + c is in the dictionary; otherwise emit code(w), add w + c, restart from c.",
            "Decoder: output the code's entry, then add <b>previous + first letter of the current entry</b>. If the code is unknown, entry = previous + previous[0].",
            "Both run in about O(n log n): n steps with a dictionary lookup each.",
            "Adaptive: nothing is sent but the codes, so decoding must start at the beginning.",
          ],
          "LZW's encoder and decoder grow the same dictionary in lock-step, even for the one entry the decoder gets to late.",
        ),
      );
    },
  });

  // prettier-ignore
  L["a7-lzw-decode"] = {
    sum: "The lecture's LZW example from both ends, with the exact pseudocode for each side and the one corner case.",
    steps: [
      { t: "Encode A B A B A B A B A", b: `<p>Start with A = 0 and B = 1. At each step, find the <b>longest</b> match in the dictionary, output its code, and add the match plus the next symbol as a new entry.</p><p>Matches: A, B, AB, ABA, BA. Codes: <b>0 1 2 4 3</b>. New entries: AB = 2, BA = 3, ABA = 4, ABAB = 5.</p>`,
        v: table(["match w", "next symbol", "output", "new entry"], lzwEnc("ABABABABA", ["A", "B"]).steps.map(([w, code, add, idx]) => [`<b class="mono">${w}</b>`, add ? add.slice(-1) : "—", `<b>${code}</b>`, idx >= 0 ? `${idx} = ${add}` : "(end)"]), 560),
        c: { q: "How many codes does the encoder output for ABABABABA?", o: ["5", "9", "3"], a: 0, why: "Matches A, B, AB, ABA, BA: five codes for nine symbols." } },
      { t: "The encoder, as pseudocode", b: `<p>Input: a message and the starting dictionary $D$. Output: a list of codes $S$.</p><pre style="margin:6px 0;overflow:auto">S = [ ];  w = ""
for each character c of the message:
    if w + c is in D:  w = w + c
    else:
        add w + c to D
        append code(w) to S
        w = c
append code(w) to S</pre><p>The loop runs $n$ times, and each dictionary lookup takes about $\\log$ of the dictionary size, so the encoder costs roughly $O(n\\log n)$.</p>`,
        v: FG.flow([{ t: "extend w", s: "while w + c is known" }, { t: "emit code(w)", s: "when it isn't", c: "violet" }, { t: "add w + c", s: "new entry", c: "teal" }, { t: "w = c", s: "restart" }]),
        c: { q: "When does the encoder output a code?", o: ["When w + c is not in the dictionary", "After every single character", "Only at the end of the message"], a: 0, why: "While w + c is known the string just grows. The moment it isn't, code(w) is output and w + c becomes a new entry." } },
      { t: "Decode 0 1 2 4 3", b: `<p>The receiver starts with only A = 0 and B = 1 and no previous string. For each code: output its entry, then add <b>previous + first letter of this entry</b>.</p><p>Codes 0, 1, 2 give A, B, AB. Then <b>4</b> arrives, but the dictionary stops at 3. This is the encoder's entry that was used at once. Rule: previous + its own first letter = AB + A = <b>ABA</b>. Finally 3 = BA.</p>`,
        v: table(["receive", "output", "adds"], lzwDec([0, 1, 2, 4, 3], ["A", "B"]).steps.map((s) => ({ c: [`<b>${s.k}</b>`, `<b class="mono">${s.e}</b>${s.miss ? " <small>(not there yet)</small>" : ""}`, s.added ? `${s.added[0]} = ${s.added[1]}` : "—"], hl: s.miss })), 520),
        c: { q: "Code 4 arrives but the decoder's dictionary only reaches entry 3. The entry must be…", o: ["previous + the first letter of the previous string", "previous + the last letter of the previous string", "an error: the stream is corrupt"], a: 0, why: "Here the previous string is AB, so the entry is AB + A = ABA. The encoder created and used it in the same breath." } },
      { t: "Watch it decode", b: `<p>Press <b>play</b> or step with the arrows. The decoder looks each code up, adds a new entry, and keeps the previous string. It will ask when a code is not in the dictionary yet.</p>`,
        v: (box, life) => lzwDecodeRun(box, life) },
      { t: "The decoder, as pseudocode", b: `<p>Input: the codes $S$ and the starting dictionary $D$. Output: the characters.</p><pre style="margin:6px 0;overflow:auto">p = ""
for each code s in S:
    if s is not in D:
        e = p + p[0];  add e to D          # the missing entry
    else:
        e = D[s]
        if p is not empty: add p + e[0] to D
    output e
    p = e</pre><p>One pass over $n$ codes with a dictionary operation each: about $O(n\\log|D|)$.</p>`,
        v: table(["Case", "Entry e", "Add to dictionary"], [["code known", "D[s]", "p + e[0] (skip for the first code)"], ["code unknown", "p + p[0]", "that same e"]], 520),
        c: { q: "The decoder has p = \"AB\" and receives a known code whose entry is \"BA\". What does it add?", o: ["ABB (p plus the first letter of BA)", "ABBA (p plus all the letters of BA)", "BA (the entry that was just looked up)"], a: 0, why: "Always previous + first letter of the current entry: AB + B = ABB." } },
      { t: "Where LZW comes from", b: `<p>LZW is a <b>dictionary coder</b>: it uses no statistical knowledge of the data. The encoder develops a dictionary and sends indices; the decoder rebuilds the dictionary to undo it. Created by Abraham Lempel, Jacob Ziv and Terry Welch, and published by Welch in <b>1984</b>. Easy to implement in hardware, it is used in the Unix <code>compress</code> utility and the GIF format. Lempel received the IEEE Richard W. Hamming Medal in 2007.</p>`,
        v: table(["", "Dictionary coding family"], [["LZW", "this lecture; adaptive; Unix compress, GIF"], ["LZ77", "dictionary coder (the lecture lists it by name)"], ["Sequitur", "dictionary coder (also listed)"]], 560),
        c: { q: "What makes a coder a <b>dictionary</b> coder?", o: ["It sends indices of dictionary strings, not symbol statistics", "It sends a dictionary of the whole language alongside the file", "It replaces each single letter by a whole word"], a: 0, why: "Dictionary coding replaces repeated strings by dictionary indices and needs no knowledge of the symbol probabilities." } },
    ],
    guide: ["Pick <b>ABABABABA</b> and read the two tables side by side: the encoder's new entries match the decoder's.", "The highlighted decoder row is the missing-entry case. Find which code it is.", "Try <b>AAAAAAA</b>: two rows are highlighted.", "Choose <b>ABRACADABRA</b> and <b>MISSISSIPPI</b>: no missing entries here. Why not?"],
  };
})();
