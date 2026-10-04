(function () {
  const partScope = (NIC.shared.algoP9 = NIC.shared.algoP9 || {});
  const { genomes, reg, table } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;

  // the four output bins of a 4-point DFT as unlabelled boxes to tap (data-pick = "bin k = 0" to "bin k = 3")
  const binPick = () =>
    `<svg viewBox="0 0 420 150" role="group" aria-label="Four DFT output bins, k equals 0 to 3">${[0, 1, 2, 3]
      .map(
        (k) =>
          `<g data-pick="bin k = ${k}" aria-label="Bin k = ${k}"><rect x="${30 + k * 95}" y="14" width="70" height="90" rx="12" fill="var(--bg-2)" stroke="var(--line-2)" stroke-width="3"/><text x="${65 + k * 95}" y="68" text-anchor="middle" style="font:900 18px var(--sans);fill:var(--text-dim)">?</text><text x="${65 + k * 95}" y="130" text-anchor="middle" style="font:800 13px var(--sans);fill:var(--text-faint)">bin k = ${k}</text></g>`,
      )
      .join("")}</svg>`;

  /* ============ 9.2 The halving trick ============ */
  reg({
    id: "a9-fft",
    order: 2,
    num: "9.2",
    title: "The halving trick",
    blurb:
      "The FFT isn't a new transform — it's the same DFT, computed by splitting evens from odds until only one-sample problems remain.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const LEVELS = [
        [[0, 1, 2, 3, 4, 5, 6, 7]],
        [
          [0, 2, 4, 6],
          [1, 3, 5, 7],
        ],
        [
          [0, 4],
          [2, 6],
          [1, 5],
          [3, 7],
        ],
        [[0], [4], [2], [6], [1], [5], [3], [7]],
      ];
      // step: 0 = start, 1-3 = splits reveal levels 1..3, 4-6 = combines merge levels 3→0
      let step = 0,
        playing = null;
      const STATUS = [
        ["One problem of size 8.", "Direct DFT: 8 outputs × 8 products = <b>64</b> multiply-adds."],
        [
          "Split evens / odds → two problems of size 4.",
          "Even indices <span style='color:var(--teal)'>green</span>, odd indices <span style='color:var(--amber)'>orange</span>. Each half would cost (8/2)² = 16 — already only half the work.",
        ],
        ["Split again → four problems of size 2.", "Same trick on each half."],
        [
          "Eight problems of size 1.",
          "A DFT of one number is <b>the number itself</b>. Leaf order is bit-reversed: <b>0 4 2 6 1 5 3 7</b> (reverse the 3 bits of the position: 001→100=4).",
        ],
        [
          "Combine: leaves → size-2 results.",
          "Each pair does one <b>butterfly</b>: out = a + W·b and a − W·b (one multiply, one add, one subtract). 4 butterflies so far.",
        ],
        ["Combine: size 2 → size 4.", "Same butterfly shape, longer twiddles. 8 butterflies so far."],
        [
          "Combine: size 4 → the final spectrum.",
          "12 butterflies total: <b>3 levels × 8-ish work per level = N·log₂N = 24</b>, versus N² = 64. Identical answer to the direct DFT — just organised so work is shared.",
        ],
      ];
      const card = el(`<div class="card"><div class="card-head"><h2>The FFT recursion tree (N = 8)</h2></div>
        <div class="controls"><button class="btn primary" id="nx">Next step →</button><button class="btn" id="pl">Auto-play</button><button class="btn ghost" id="rs">Reset</button><span class="mono dim" id="stc"></span></div>
        <div id="tree"></div>
        <div class="callout" id="stt" style="margin-top:14px"></div>
        <div class="stat-row"><div class="stat violet"><small>Butterflies done</small><b id="bf">0 / 12</b></div><div class="stat rose"><small>Direct DFT ops</small><b>64 (N²)</b></div><div class="stat teal"><small>FFT ops</small><b>24 (N·log₂N)</b></div></div></div>`);
      root.appendChild(card);

      function drawTree() {
        const splitDepth = Math.min(step, 3); // levels 0..splitDepth exist
        const combineK = step > 3 ? step - 3 : 0; // 0..3, merges level (4-k)→(3-k)
        const rows = [];
        for (let l = 0; l <= splitDepth; l++) {
          const mergingLevel = combineK > 0 && l === 4 - combineK;
          const targetLevel = combineK > 0 && l === 3 - combineK;
          const groups = LEVELS[l]
            .map((grp, gi) => {
              const cls = (i) => {
                if (combineK > 0) {
                  if (l === mergingLevel) return gi % 2 === 0 ? "good" : "p2"; // pair colours
                  if (l === targetLevel) return "changed";
                  return "";
                }
                if (l === splitDepth - 1 && step > 0 && step <= 3) return i % 2 === 0 ? "good" : "p2"; // just split
                return "";
              };
              return `<span style="display:inline-flex;margin:0 7px">${genomes(grp, cls)}</span>`;
            })
            .join("");
          const tag =
            l === splitDepth && combineK === 0 && l > 0
              ? `<span class="faint" style="font-size:12px;margin-left:8px">${l === 3 ? "leaves — bit-reversed order" : `${LEVELS[l].length} problems of size ${LEVELS[l][0].length}`}</span>`
              : "";
          rows.push(`<div class="genome-row"><span class="lbl">level ${l}</span>${groups}${tag}</div>`);
        }
        let extra = "";
        if (step >= 3 && combineK === 0) {
          extra = `<div class="genome-row"><span class="lbl">position</span><span class="mono dim">0&ensp;1&ensp;2&ensp;3&ensp;4&ensp;5&ensp;6&ensp;7&emsp;→ reverse 3 bits of each position to get its leaf</span></div>
            <div class="genome-row"><span class="lbl">bits</span><span class="mono dim">000 001 010 011 100 101 110 111 &nbsp;→&nbsp; 000 100 010 110 001 101 011 111 = <b>0 4 2 6 1 5 3 7</b></span></div>`;
        }
        qs("#tree", card).innerHTML = rows.join("") + extra;
        const [t, d] = STATUS[step];
        qs("#stt", card).innerHTML = `<b>${t}</b> ${d}`;
        qs("#bf", card).textContent = `${combineK * 4} / 12`;
        qs("#nx", card).textContent = step < 3 ? "Split ↓" : step < 6 ? "Combine (butterflies) ↑" : "Done — reset?";
        qs("#stc", card).textContent = `step ${step} / 6`;
      }
      const stop = () => {
        if (playing) {
          playing();
          playing = null;
          qs("#pl", card).textContent = "Auto-play";
        }
      };
      qs("#nx", card).onclick = () => {
        step = step >= 6 ? 0 : step + 1;
        if (step === 0) stop();
        drawTree();
      };
      qs("#rs", card).onclick = () => {
        stop();
        step = 0;
        drawTree();
      };
      qs("#pl", card).onclick = () => {
        if (playing) return stop();
        qs("#pl", card).textContent = "Pause";
        playing = life.interval(() => {
          step = step >= 6 ? 0 : step + 1;
          drawTree();
          if (step === 6) stop();
        }, 1500);
      };
      drawTree();

      // ---- op-count race chart ----
      let k2 = 10,
        logy = true; // N = 2^k2
      const rc =
        el(`<div class="card"><div class="card-head"><h2>The race: N² vs N·log₂N</h2><span class="faint">operations (multiply-adds, roughly)</span></div>
        <div class="controls" id="rcRow"></div><canvas class="viz" id="rcv"></canvas>
        <div class="stat-row"><div class="stat rose"><small>Direct DFT</small><b id="o1"></b></div><div class="stat teal"><small>FFT</small><b id="o2"></b></div><div class="stat amber"><small>FFT speedup</small><b id="o3"></b></div></div></div>`);
      root.appendChild(rc);
      const sk = N.slider("log₂ N", 3, 20, 1, k2, (v) => `2^${v} = ${(2 ** v).toLocaleString()}`);
      sk.onInput((v) => {
        k2 = v;
        drawRace();
      });
      const lg = el(`<label class="field"><input type="checkbox" ${logy ? "checked" : ""}> log scale</label>`);
      qs("input", lg).onchange = (e) => {
        logy = e.target.checked;
        drawRace();
      };
      qs("#rcRow", rc).append(sk, lg);
      function drawRace() {
        const C = N.colors(),
          n = 2 ** k2;
        const d = n * n,
          f = n * k2;
        const { ctx, w, h } = N.setupCanvas(qs("#rcv", rc), 220);
        const padB = 34,
          padT = 16,
          cw = w / 2;
        const sc = (v) => (logy ? Math.log10(Math.max(1, v)) : v);
        const hi = sc(d);
        const bars = [
          [d, C.rose, "direct DFT · N²"],
          [f, C.teal, "FFT · N·log₂N"],
        ];
        ctx.clearRect(0, 0, w, h);
        bars.forEach(([v, c, lb], i) => {
          const bh = (sc(v) / hi) * (h - padT - padB);
          const x = cw * i + cw * 0.22,
            bw = cw * 0.56;
          ctx.fillStyle = c;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(x, h - padB - Math.max(bh, 3), bw, Math.max(bh, 3));
          ctx.globalAlpha = 1;
          ctx.fillStyle = C.text;
          ctx.textAlign = "center";
          ctx.font = "13px monospace";
          ctx.fillText(v.toLocaleString(), x + bw / 2, h - padB - Math.max(bh, 3) - 8);
          ctx.fillStyle = C.text_faint;
          ctx.font = "12px sans-serif";
          ctx.fillText(lb, x + bw / 2, h - 14);
        });
        ctx.fillStyle = C.text_faint;
        ctx.textAlign = "left";
        ctx.font = "11px monospace";
        ctx.fillText(`N = ${n.toLocaleString()}${logy ? " · heights are log₁₀(ops)" : ""}`, 8, h - 14);
        qs("#o1", rc).textContent = d.toLocaleString();
        qs("#o2", rc).textContent = f.toLocaleString();
        qs("#o3", rc).textContent = `≈ ${fmt(n / k2, 1)}×`;
      }
      life.onResize(drawRace);
      drawRace();

      root.appendChild(
        el(
          `<div class="callout teal"><b>Same numbers, less work.</b> The FFT is not an approximation — <code>fft(x)</code> must match <code>dft(x)</code> to ~10 decimal places. Every butterfly exists in the direct sum too; the FFT just refuses to compute the same product twice. In practice, verify with the round-trip test: <code>idft(dft(x)) ≈ x</code>.</div>`,
        ),
      );
      root.appendChild(
        predict({
          id: "a9-fft-1",
          q: "Even/odd splits are repeated on 16 samples numbered 0 to 15 until every leaf holds one sample. Which sample sits in the <b>second</b> leaf, right after sample 0?",
          opts: ["1", "8", "15"],
          a: 1,
          why: "Each split groups by the <i>lowest</i> remaining bit, so the leaves end up in <b>bit-reversed</b> order: position 1 is 0001 in binary, and reversed it reads 1000 = 8. The leaves run 0, 8, 4, 12, 2, 10, 6, 14, 1, … (for 8 samples the second leaf is 4, for the same reason).",
        }),
      );
      root.appendChild(
        predict({
          id: "a9-fft-2",
          q: "Doubling N makes the direct DFT ~4× slower. The FFT gets slower by…",
          opts: ["Also about 4×, same as the DFT", "A bit more than 2×", "About 8×, since it's recursive"],
          a: 1,
          why: "Ratio = 2·(log₂N + 1)/log₂N. For N = 1024→2048 that's 2·11/10 = <b>2.2×</b>. The N² vs N·log N gap is why the FFT changed the world.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "One split: X[k] = E[k] + W·O[k], and X[k + N/2] = E[k] − W·O[k] — the same two sub-results produce <b>two</b> outputs.",
            "Recursing to size-1 leaves gives the <b>bit-reversed</b> order 0 4 2 6 1 5 3 7.",
            "Work per level ∝ N; levels = log₂N → <b>O(N log N)</b>. At N = 10⁶ that's ~50,000× fewer ops than N².",
            "Radix-2 FFT needs N = a power of two (halving must reach 1); other lengths use mixed-radix or zero-padding.",
            "FFT output = DFT output exactly. It's an organisation trick, not a new transform.",
          ],
          "Split evens from odds, recurse, butterfly back up: N log N work for the same N² answer.",
        ),
      );
    },
  });

  /* ============ Phase 9 boss ============ */

  /* =================== LESSONS =================== */
  const L = N.LESSONS;
  L["a9-dft"] = {
    sum: "Any signal is a <b>recipe of sine waves</b>. The DFT reads the recipe back — one bin per frequency — and it lies if you sampled too slowly.",
    steps: [
      {
        t: "Two questions for one signal",
        b: `<p>A wiggling signal can be asked two different questions:</p>`,
        v:
          table(
            ["Question", "Where the answer lives"],
            [
              ["How does the value move over time?", "the <b>time domain</b> — the wiggle you plot"],
              ["Which frequencies are inside, and how strong?", "the <b>frequency domain</b> — the spectrum"],
            ],
          ) +
          `<p class="dim" style="margin-top:8px">A messy-looking wiggle might be just two spikes in the spectrum. The discrete Fourier transform (DFT) is a <b>decomposition</b>, not a transformation into something else.</p>`,
      },
      {
        t: "How each bin listens",
        b: `<p>Output bin <code>X[k]</code> answers: <i>"how much of frequency k is in this signal?"</i> It multiplies every sample by a vector rotating at exactly k cycles per window and adds up the products.</p><p><b>Matching frequency</b>: every product points the same direction → they <b>add</b> → big number.<br><b>Mismatched</b>: products point all around the circle → they <b>cancel</b> → ≈ 0.</p>`,
        c: {
          q: "A signal contains only the frequency of bin 3. What does bin k = 5 return?",
          o: [
            "a large value, since every bin picks up some of every frequency",
            "about 0: the products cancel around the circle",
            "a negative number of roughly the same size as bin 3",
          ],
          a: 1,
          why: "Cancellation is what makes the DFT selective. Each bin answers its own private question.",
        },
      },
      {
        t: "Three hand DFTs worth memorising (N = 4)",
        b: `<p>For N = 4 the rotating vector only ever takes values 1, −j, −1, j, so these fit on paper:</p>`,
        v:
          table(
            ["Signal x", "X[0]", "X[1]", "X[2]", "X[3]"],
            [
              ["constant [1, 1, 1, 1]", "4", "0", "0", "0"],
              ["impulse [1, 0, 0, 0]", "1", "1", "1", "1"],
              ["alternating [1, −1, 1, −1]", "0", "0", "4", "0"],
            ],
          ) +
          `<p class="dim" style="margin-top:8px">Constant = all energy at k = 0 (DC). Impulse = every frequency at once. Alternating = the Nyquist bin k = N/2.</p>`,
        c: {
          type: "pick",
          q: "The N = 4 signal <code>[0, 1, 0, −1]</code> is one cycle of a sine at bin 1. Tap <b>every</b> output bin that lights up (is not zero).",
          fig: binPick(),
          a: ["bin k = 1", "bin k = 3"],
          hint: "A real signal's spectrum comes in mirrored pairs. Which bin is the mirror of bin 1 when N = 4?",
          why: "Bin 3 is “negative frequency” in disguise: X[1] = −2j and X[3] = +2j. Real signals always give these mirrored pairs, so half the spectrum is redundant. Bins 0 and 2 are zero.",
        },
      },
      {
        t: "Aliasing: sampling too slowly",
        b: `<p>Sample a 7 Hz sine at 8 Hz and the dots are <b>identical</b> to a 1 Hz sine. Any frequency above <code>fs/2</code> folds back and impersonates a lower one.</p><span class="key">Rule: $f_s > 2 f_{\\max}$. A true 60 Hz tone sampled at 100 Hz appears at <b>40 Hz</b> — and afterwards nothing can tell you it was fake.</span>`,
        c: {
          q: "Sampled at 80 Hz, the spectrum shows a peak at 35 Hz. The signal…",
          o: ["definitely contains 35 Hz", "might really contain 45 Hz", "contains only DC"],
          a: 1,
          why: "Folding is irreversible: real 35 Hz and aliased 45 Hz are indistinguishable once sampled.",
        },
      },
      {
        t: "Leakage: the window edge",
        b: `<p>If your N samples hold a <b>whole number of cycles</b>, energy lands in one bin. If not, the window's edges look like a sudden jump, and the energy <b>smears into neighbouring bins</b>.</p><p>The fix is multiplying by a Hann/Hamming window to taper the edges — it <i>reduces</i> leakage but never removes it, and it costs resolution. A different cause than aliasing, with a different fix.</p>`,
      },
      {
        t: "Reading the playground",
        b: `<p><b>Top canvas</b>: the faint line is the true continuous signal; the dots are the 100 samples the computer actually gets (fs = 100 Hz). <b>Bottom canvas</b>: the magnitude spectrum — bin k sits at k·fs/N = k Hz, and everything past 50 Hz is unreachable (the shaded zone folds left).</p>`,
      },
    ],
    guide: [
      "Defaults: Wave 1 = 5 Hz (amplitude 1), Wave 2 = 12 Hz (amplitude 0.5). Match the two spectrum peaks to the sliders.",
      "Drag <b>Wave 1</b> past 50 Hz and watch its dot-pattern slow down while the true curve speeds up. Set it to exactly 60 Hz — where does the peak land?",
      "Set <b>Wave 1 freq</b> to a non-integer like 10.5 Hz: the single peak smears. That's leakage.",
      "Switch to <b>Impulse</b>, <b>Constant</b> and <b>Checkerboard</b> and match each spectrum to the N = 4 hand DFTs from the lesson.",
      "Answer both Predict questions.",
    ],
  };

  L["a9-fft"] = {
    sum: "The FFT computes the <b>exact same DFT</b> — it just splits evens from odds recursively and shares work, turning N² into N·log N.",
    steps: [
      {
        t: "Where the waste is",
        b: `<p>The direct discrete Fourier transform (DFT) computes N outputs, each a sum of N products: <b>N² multiply-adds</b>.</p><p>But look closer: outputs reuse almost the same twiddle factors over and over. The same products get recomputed thousands of times. If work could be <b>shared</b>, huge savings appear. Sharing the work is exactly what the <b>fast Fourier transform (FFT)</b> does.</p>`,
      },
      {
        t: "The split that halves the work",
        b: `<p>Separate the sum into even-indexed and odd-indexed samples. Each half is itself a DFT of size N/2:</p>`,
        v: `<div class="mono" style="background:var(--bg-2);border:1px solid var(--line);border-radius:10px;padding:12px 16px;font-size:13.5px">X[k] = E[k] + W·O[k]<br>X[k + N/2] = E[k] − W·O[k]</div><p class="dim" style="margin-top:8px">E and O are the half-size DFTs of the even and odd samples. The twiddle W rotates exactly half a turn between k and k + N/2, flipping its sign.</p>`,
        c: {
          q: "Outputs k and k + N/2 share which work?",
          o: [
            "None: every output is computed separately",
            "Both reuse the same E[k] and O[k]",
            "Only E[k]; O[k] is recomputed",
          ],
          a: 1,
          why: "One pair of half-DFT results produces TWO outputs. That pairing is the butterfly, and it's where the savings live.",
        },
      },
      {
        t: "Recurse to the leaves",
        b: `<p>Apply the split again to each half, and again, until every problem has size 1 — and the DFT of one number is <b>the number itself</b>.</p><p>For N = 8 the leaves come out in a strange order:</p>`,
        v:
          genomes([0, 4, 2, 6, 1, 5, 3, 7]) +
          `<p class="dim" style="margin-top:8px">Leaf position → index = <b>reverse the bits</b>: position 001 lands index 100 = 4; position 011 lands 110 = 6. This is the famous bit-reversed order.</p>`,
        c: {
          type: "match",
          q: "The leaves of an 8-point FFT sit in bit-reversed order: the index at each position (counting from 0) is that position's 3 bits reversed. Match each position to its index.",
          pairs: [
            ["Position 1", "Index 4"],
            ["Position 3", "Index 6"],
            ["Position 4", "Index 1"],
            ["Position 6", "Index 3"],
          ],
          hint: "Write the position in 3 binary digits, then read them backwards.",
          why: "Position 1 = 001 reverses to 100 = 4. Position 3 = 011 reverses to 110 = 6. Position 4 = 100 reverses to 001 = 1. Position 6 = 110 reverses to 011 = 3.",
        },
      },
      {
        t: "Butterflies climb back up",
        b: `<p>Each level merges pairs of results with one butterfly per pair: <code>a + W·b</code> and <code>a − W·b</code> — one multiply, one add, one subtract.</p><p>Per level: work $\\propto N$. Number of levels: $\\log_2 N$. Total: $O(N \\log N)$.</p><span class="analogy">Mergesort does exactly the same accounting trick — halve the problem, do linear work to recombine.</span>`,
        c: {
          q: "N = 1024 → how many levels, and roughly how much work?",
          o: ["1024 levels, ~1M ops", "10 levels, ~10k ops", "2 levels, ~2k ops"],
          a: 1,
          why: "log₂1024 = 10 levels × N work each ≈ N·log₂N = 10,240 ops vs N² = 1,048,576 — about 100× less.",
        },
      },
      {
        t: "Why powers of two?",
        b: `<p>The halving must terminate at length 1, so radix-2 FFT needs <b>N = 2^k</b>. Odd sizes break the even/odd chain.</p><p>Real libraries handle other lengths with mixed-radix steps or by zero-padding up to the next power of two. Same result either way — the FFT always equals the DFT.</p>`,
      },
      {
        t: "The payoff, in numbers",
        b: `<p>At N = 10⁶: direct DFT ≈ 10¹² ops, FFT ≈ 2 × 10⁷ ops — <b>~50,000× less work</b>. That's the difference between "impossible in real time" and "runs on a phone", and it's why the FFT genuinely changed the world (audio, Wi-Fi, JPEG, MRI…).</p>`,
      },
      {
        t: "Reading the playground",
        b: `<p><b>Top</b>: step down the recursion tree — teal/amber = the even/odd split — to the bit-reversed leaves, then combine back up with butterflies. <b>Bottom</b>: the op-count race as N doubles; toggle log scale to see both bars at once.</p>`,
      },
    ],
    guide: [
      "Press <b>Split</b> (or <b>Auto-play</b>) and watch the tree split to the leaves, then press <b>Combine</b> to merge back up.",
      "At the leaves, check the bit row: position bits reversed give the index 0 4 2 6 1 5 3 7.",
      "Watch the butterfly counter during the combine steps: 4 per level × 3 levels = 12, vs 64 for the direct DFT.",
      "In the race card, drag <b>log₂ N</b> to 13 (N = 8,192) and read the speedup. Toggle log scale off to see the FFT bar vanish.",
    ],
  };
  /* ---------- lesson figures (added to steps that had text only) ---------- */

  const addV = (id, i, v) => {
    if (L[id] && L[id].steps[i] && !L[id].steps[i].v) L[id].steps[i].v = v;
  };
  const arrows = (freq, n = 8) =>
    Array.from({ length: n }, (_, i) => {
      const a = (-2 * Math.PI * freq * i) / n;
      return a;
    });
  const wheel = (angles, c, lbl) =>
    `<svg class="fig" viewBox="0 0 200 200" role="img" aria-label="${lbl}" style="max-height:170px"><circle cx="100" cy="100" r="70" fill="none" stroke="var(--line)"/>${angles.map((a) => `<line x1="100" y1="100" x2="${100 + 62 * Math.cos(a)}" y2="${100 + 62 * Math.sin(a)}" stroke="${c}" stroke-width="2.5" class="draw" marker-end=""/>`).join("")}<text x="100" y="192" class="fig-sub">${lbl}</text></svg>`;
  addV(
    "a9-dft",
    1,
    `<div class="fig-compare" role="group" aria-label="A matching frequency compared with a wrong frequency"><div class="fc fi" style="--c:var(--teal)"><div class="fc-h">Matching frequency</div>${wheel(arrows(0), "var(--teal)", "all arrows line up → big sum")}</div><div class="fc-vs">vs</div><div class="fc fi" style="--c:var(--rose)"><div class="fc-h">Wrong frequency</div>${wheel(arrows(1), "var(--rose)", "arrows point everywhere → cancel to ~0")}</div></div>`,
  );
  addV(
    "a9-dft",
    3,
    (() => {
      const W = 520,
        H = 170,
        X = (t) => 20 + t * (W - 40),
        Y = (v) => H / 2 - v * 58;
      const curve = (f, c, dash) =>
        `<path d="${Array.from({ length: 401 }, (_, i) => {
          const t = i / 400;
          return `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(Math.sin(2 * Math.PI * f * t)).toFixed(1)}`;
        }).join(
          " ",
        )}" fill="none" stroke="${c}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""} class="draw"/>`;
      const dots = Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        return `<circle cx="${X(t)}" cy="${Y(Math.sin(2 * Math.PI * 7 * t))}" r="5" fill="var(--amber)" class="fi"/>`;
      }).join("");
      return `<svg class="fig" viewBox="0 0 ${W} ${H}" role="img" aria-label="A true 7 Hz sine wave, sampled 8 times in a second. The 8 dots fit a slow 1 Hz wave just as well.">${curve(7, "rgba(28,176,246,.5)")}${curve(1, "var(--rose)", "6 4")}${dots}</svg><div class="legend"><span style="--c:rgba(28,176,246,.8)">true 7 Hz signal</span><span style="--c:var(--amber)">8 samples per second</span><span style="--c:var(--rose)">the 1 Hz wave those dots also fit</span></div>`;
    })(),
  );
  Object.assign(partScope, { addV });
})();
