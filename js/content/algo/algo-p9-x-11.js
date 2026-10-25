/* js/content/algo/algo-p9-x-11.js: Phase 10 extra lessons (overflow): 10.2 Softmax. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const seg = (o, v, f) =>
    N.seg(
      o.map(([a, l]) => [String(a), l]),
      String(v),
      f,
    );
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 10, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, softmax, barRows } = shared;
  const COL = ["teal", "violet", "amber"];

  // step 1: one cake, sliced by score. Token A's score moves; the slices always fill the whole bar
  function cakeFig(box) {
    let a = 2;
    const sc = () => [a, 1, 0],
      names = ["token A", "token B", "token C"];
    const strip = el(
      `<div style="display:flex;height:40px;border-radius:12px;overflow:hidden;border:2px solid var(--line);margin:10px 0 4px">${COL.map((c) => `<span style="flex:1 1 0;display:grid;place-items:center;background:var(--${c}-dim);border-right:2px solid var(--bg);font:900 13px var(--sans);transition:flex-grow .3s"></span>`).join("")}</div>`,
    );
    const note = el(`<div class="faint" style="font-size:13px"></div>`);
    const show = () => {
      const p = softmax(sc());
      [...strip.children].forEach((s, i) => {
        s.style.flexGrow = Math.max(0.02, p[i]);
        s.textContent = p[i] > 0.07 ? Math.round(p[i] * 100) + "%" : "";
      });
      note.innerHTML = `Scores: ${sc()
        .map((v, i) => `${names[i]} <b>${v}</b>`)
        .join(" · ")}. One whole bar = 100%; the three slices always add up to it.`;
    };
    box.append(
      N.slider("Score of token A (B stays 1, C stays 0)", -2, 6, 1, a, (v) => v),
      strip,
      note,
    );
    box.firstChild.onInput((v) => {
      a = v;
      show();
    });
    show();
  }

  // step 2: scores -> e^score -> shares, one stage at a time
  function stagesFig(box) {
    const sc = [2, 1, 0],
      ex = sc.map(Math.exp),
      tot = ex.reduce((s, v) => s + v),
      p = softmax(sc);
    const host = el(`<div style="padding:4px"></div>`),
      note = el(`<div style="font-weight:800;margin-top:6px;min-height:40px"></div>`);
    const bars = barRows(
      host,
      sc.map((_, i) => ["token " + "ABC"[i], COL[i]]),
    );
    const stage = [
      () => {
        sc.forEach((v, i) => bars(i, v / 8, "score " + v));
        note.textContent = "1. Raw scores: bigger means a better match.";
      },
      () => {
        ex.forEach((v, i) => bars(i, v / 8, v.toFixed(2)));
        note.textContent =
          "2. Exponentiate: a score of 2 becomes 7.39, a score of 0 becomes 1. All positive, gaps stretched.";
      },
      () => {
        p.forEach((v, i) => bars(i, v, Math.round(v * 100) + "%"));
        note.textContent = `3. Divide by the total (${tot.toFixed(2)}): shares of 67%, 24% and 9%, adding to 100%.`;
      },
    ];
    box.append(
      seg(
        [
          [0, "1 Scores"],
          [1, "2 Exponentiate"],
          [2, "3 Divide by total"],
        ],
        "0",
        (v) => stage[v](),
      ),
      host,
      note,
    );
    stage[0]();
  }

  // step 4: adding the same number to every score changes nothing
  function shiftFig(box) {
    const host = el(`<div style="padding:4px"></div>`),
      host2 = el(`<div style="padding:4px"></div>`),
      note = el(`<div style="font-weight:800;margin-top:6px;min-height:40px"></div>`);
    const b1 = barRows(
      host,
      ["A", "B", "C"].map((t, i) => ["score " + t, "blue"]),
    );
    const b2 = barRows(
      host2,
      ["A", "B", "C"].map((t, i) => ["share " + t, COL[i]]),
    );
    const set = (k) => {
      const sc = [2, 1, 0].map((v) => v + k);
      sc.forEach((v, i) => b1(i, 0.15 + (v - k) / 3, "" + v));
      softmax(sc).forEach((v, i) => b2(i, v, v.toFixed(2)));
      const big = Math.exp(Math.max(...sc));
      note.innerHTML = !isFinite(big)
        ? `Computed naively, e<sup>${sc[0]}</sup> is too big for the computer (it overflows). Subtracting the largest score first still gives the same shares.`
        : "The shares are the same. Only the gaps between scores matter.";
    };
    box.append(
      seg(
        [
          [0, "scores 2, 1, 0"],
          [5, "+5"],
          [100, "+100"],
          [1000, "+1000"],
        ],
        "0",
        (v) => set(+v),
      ),
      host,
      host2,
      note,
    );
    set(0);
  }

  // step 5: the bigger the key vectors, the bigger the raw scores, unless we divide by the square root of d_k
  function scaleFig(box) {
    const host = el(`<div style="padding:4px"></div>`),
      note = el(`<div style="font-weight:800;margin-top:6px;min-height:40px"></div>`);
    const bars = barRows(host, [
      ["raw scores", "rose"],
      ["÷ √d_k", "teal"],
    ]);
    const set = (dk) => {
      const r = Math.sqrt(dk),
        raw = [2 * r, r, 0];
      bars(0, softmax(raw)[0], `${Math.round(softmax(raw)[0] * 100)}%`);
      bars(1, softmax(raw.map((v) => v / r))[0], `${Math.round(softmax(raw.map((v) => v / r))[0] * 100)}%`);
      note.innerHTML = `Raw scores about <b>${raw.map((v) => +v.toFixed(1)).join(", ")}</b> give the top token that share of the weight. Divided by √${dk} = ${r}, the scores are back to 2, 1, 0.`;
    };
    box.append(
      seg(
        [
          [1, "d_k = 1"],
          [4, "d_k = 4"],
          [16, "d_k = 16"],
          [64, "d_k = 64"],
        ],
        "64",
        (v) => set(+v),
      ),
      el(
        `<div class="faint" style="font-size:13px;margin-top:6px">Share of the weight taken by the best-matching token:</div>`,
      ),
      host,
      note,
    );
    set(64);
  }

  // 10.4 step 6 (registered here to keep that file short): the T x T grid of scores
  function gridFig(box) {
    let T = 3;
    const host = el(`<div style="padding:4px"></div>`),
      note = el(`<div style="font-weight:800;margin-top:6px"></div>`);
    const show = () => {
      const cell = Math.min(34, Math.floor(280 / T));
      host.innerHTML = `<div style="display:inline-grid;grid-template-columns:repeat(${T},${cell}px);gap:2px">${Array.from({ length: T * T }, (_, i) => `<span style="height:${cell}px;border-radius:5px;background:var(--${i % T === Math.floor(i / T) ? "violet" : "blue"}-dim);border:1.5px solid var(--${i % T === Math.floor(i / T) ? "violet" : "blue"})"></span>`).join("")}</div>`;
      note.innerHTML = `${T} words, each scored against all ${T}: ${T} × ${T} = <b>${T * T}</b> scores. One row is one word's question.`;
    };
    box.append(
      N.slider("Number of words", 2, 16, 1, T, (v) => v),
      host,
      note,
    );
    box.firstChild.onInput((v) => {
      T = v;
      show();
    });
    show();
  }
  Object.assign(shared, { gridFig });
  reg({
    id: "a10-softmax",
    order: 2,
    num: "10.2",
    title: "Softmax: scores into shares",
    blurb: "Exponentiate, then normalise: the function that turns attention scores into weights that add up to 1.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const sc = [2, 1, 0],
        names = ["token A", "token B", "token C"];
      let scale = 1;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Softmax calculator</h2><span class="faint">share<sub>i</sub> = e<sup>score<sub>i</sub></sup> / (sum of all the e<sup>score</sup>)</span></div>
        <div class="controls" id="r" style="gap:10px 18px"></div><div class="controls" id="r2"></div>
        <div id="tb"></div><div id="bars"></div>
        <div class="stat-row"><div class="stat teal"><small>Shares add up to</small><b id="s1"></b></div><div class="stat amber"><small>Biggest share</small><b id="s2"></b></div><div class="stat violet"><small>Biggest ÷ smallest share</small><b id="s3"></b></div></div>
        <div id="note"></div>
        <h3 style="margin:18px 0 6px">Why implementations subtract the maximum</h3>
        <div id="big"></div></div>`);
      root.appendChild(card);
      const r = qs("#r", card);
      const sliders = sc.map((v, i) => {
        const s = N.slider(names[i], -4, 8, 0.5, v, (x) => fmt(x, 1));
        s.onInput((x) => {
          sc[i] = x;
          draw();
        });
        r.append(s);
        return s;
      });
      const r2 = qs("#r2", card);
      const sl = N.slider("Divide the scores by", 0.5, 4, 0.5, scale, (x) => fmt(x, 1));
      sl.onInput((x) => {
        scale = x;
        draw();
      });
      const b5 = el(`<button class="btn small">Add 5 to every score</button>`);
      b5.onclick = () => {
        sc.forEach((v, i) => {
          sc[i] = Math.min(8, v + 5);
          sliders[i].value = sc[i];
        });
        draw();
      };
      const b0 = el(`<button class="btn small ghost">Reset to 2, 1, 0</button>`);
      b0.onclick = () => {
        [2, 1, 0].forEach((v, i) => {
          sc[i] = v;
          sliders[i].value = v;
        });
        scale = 1;
        sl.value = 1;
        draw();
      };
      r2.append(sl, b5, b0);
      function draw() {
        const z = sc.map((v) => v / scale),
          p = softmax(z),
          ex = z.map((v) => Math.exp(v - Math.max(...z)));
        qs("#tb", card).innerHTML = table(
          ["", "score", "÷ scale", "e<sup>x</sup> (relative to the biggest)", "share"],
          sc.map((v, i) => [
            names[i],
            fmt(v, 1),
            fmt(+z[i].toFixed(2), 2),
            fmt(+ex[i].toFixed(3), 3),
            `<b>${p[i].toFixed(3)}</b>`,
          ]),
        );
        qs("#bars", card).innerHTML = F.bars(
          sc.map((_, i) => [names[i], p[i], ["teal", "violet", "amber"][i]]),
          { max: 1, fmt: (v) => v.toFixed(2) },
        );
        qs("#s1", card).textContent = fmt(+p.reduce((a, b) => a + b).toFixed(3), 3);
        qs("#s2", card).textContent = fmt(+Math.max(...p).toFixed(3), 3);
        qs("#s3", card).textContent = "× " + fmt(+(Math.max(...p) / Math.min(...p)).toFixed(1), 1);
        qs("#note", card).innerHTML =
          Math.max(...p) > 0.85
            ? `<div class="callout violet"><b>Saturated.</b> One share is almost 1, so the rest barely count. This is what happens when raw scores get large, and why attention divides by √d<sub>k</sub>.</div>`
            : `<div class="callout">Each extra point of score multiplies the weight by e ≈ 2.72, so differences are magnified before the shares are normalised.</div>`;
        const naive = [1000, 1001, 999].map(Math.exp),
          stable = softmax([1000, 1001, 999]);
        qs("#big", card).innerHTML =
          `<p class="faint" style="margin:0 0 6px">Scores 1000, 1001, 999:</p>` +
          table(
            ["method", "result"],
            [
              [
                "e<sup>score</sup> directly, then divide",
                `e<sup>1000</sup> overflows to <b>${naive[0]}</b>, so the shares are infinity divided by infinity, which has no answer`,
              ],
              {
                c: [
                  "subtract the largest score first",
                  `<b>${stable.map((v) => v.toFixed(3)).join(", ")}</b> (same answer the maths promises)`,
                ],
                hl: true,
              },
            ],
          );
      }
      draw();
      root.appendChild(
        predict({
          id: "a10-softmax-1",
          q: "Start from the default scores 2, 1, 0 and press <b>Add 5 to every score</b>. What happens to the three shares?",
          opts: ["They do not change at all", "The biggest share gets even bigger", "They all become equal"],
          a: 0,
          why: "e<sup>s+5</sup> = e<sup>5</sup>·e<sup>s</sup>, and the common factor e<sup>5</sup> cancels when you divide by the total. Only <b>differences</b> between scores matter.",
        }),
      );
      root.appendChild(
        predict({
          id: "a10-softmax-2",
          q: "Set the scores to 4, 2, 0 (double the defaults), with scale 1. Compared with 2, 1, 0 the biggest share is…",
          opts: [
            "Larger: the distribution gets sharper",
            "Smaller: the shares spread out",
            "The same, since the ratios of the scores are unchanged",
          ],
          a: 0,
          why: "Doubling the scores doubles the gaps, so the exponentials are squared in effect: the top share rises from 0.67 to about 0.87. Dividing by a larger scale does the reverse.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Softmax turns any list of numbers into <b>positive weights that add up to 1</b>.",
            "It <b>exponentiates</b> (magnifying differences: e² = 7.39 against e¹ = 2.72) and then <b>normalises</b>.",
            "Adding the same number to every score changes nothing, so implementations subtract the maximum first to avoid overflow.",
            "Bigger gaps between scores give sharper (more all-or-nothing) weights; dividing scores by a scale softens them.",
          ],
          "Softmax is a share-out: exponentiate, then divide by the total.",
        ),
      );
    },
  });
  L["a10-softmax"] = {
    sum: "Softmax turns raw scores into <b>shares that add up to 1</b>: exponentiate each score, then divide by the total.",
    steps: [
      {
        t: "Scores to probabilities",
        b: `<p>Attention gives each word a raw score for how well it matches. Scores can be any numbers, even negative, but to blend words together we need <b>shares</b>: never negative, and adding up to one whole, like slices of one cake. The bigger the score, the bigger the slice. Softmax is the recipe that does this.</p><p>Example: three tokens score 2, 1 and 0. Softmax gives them slices of about 67%, 24% and 9%. Move token A's score in the picture and watch the cake get re-cut.</p><details class="math-more"><summary>Show the maths</summary>$$\\operatorname{softmax}(z)_i=\\frac{e^{z_i}}{\\sum_{j=1}^{n}e^{z_j}}$$<p>Every $e^{z_i}$ is positive, so every share is positive, and dividing by the total makes them add up to 1.</p></details>`,
        v: (box) => cakeFig(box),
        c: {
          q: "Token A's score goes up while B and C stay the same. What happens to the shares of B and C?",
          o: [
            "Both get smaller, as A's slice grows",
            "They stay the same, because their scores did not change",
            "They get bigger, so the total stays 100%",
          ],
          a: 0,
          why: "The slices always add up to one whole. If A's slice grows, the others must shrink, even though their own scores are unchanged.",
        },
      },
      {
        t: "Worked example: scores 2, 1, 0",
        b: `<p>Softmax works in two moves. First it turns every score into a positive size: a score of 2 becomes 7.39, a score of 1 becomes 2.72 and a score of 0 becomes 1. Then it divides each size by the total (11.11), so the three come out as 67%, 24% and 9%.</p><p>Step through the three stages in the picture. Notice that a score gap of just 1 makes a slice about 2.7 times bigger.</p><details class="math-more"><summary>Show the maths</summary><p>The sizes are $e^2=7.39$, $e^1=2.72$, $e^0=1$, with total $11.11$.</p>${table(
          ["score", "e<sup>score</sup>", "÷ 11.11"],
          [
            ["2", "7.39", "<b>0.67</b>"],
            ["1", "2.72", "<b>0.24</b>"],
            ["0", "1.00", "<b>0.09</b>"],
          ],
        )}</details>`,
        v: (box) => stagesFig(box),
        c: {
          q: "Scores [0, 0, 0, 0]. What are the softmax shares?",
          o: ["0.25 each", "0 each", "1 for the first and 0 for the rest"],
          a: 0,
          why: "Equal scores give equal shares: e⁰ = 1 four times, total 4, so 1/4 each.",
        },
      },
      {
        t: "Differences are magnified",
        b: `<p>The exponential turns a gap into a <b>ratio</b>: add 1 to a score and its weight is multiplied by $e\\approx 2.72$. A gap of 2 gives a ratio of $e^2=7.39$. Doubling every score doubles every gap, so the weights get much sharper:</p>`,
        v: F.compare(
          {
            title: "Scores 2, 1, 0",
            c: "teal",
            body: F.bars(
              [
                ["A", 0.665, "teal"],
                ["B", 0.245, "violet"],
                ["C", 0.09, "dim"],
              ],
              { max: 1, fmt: (v) => v.toFixed(2) },
            ),
          },
          {
            title: "Scores 4, 2, 0",
            c: "rose",
            body: F.bars(
              [
                ["A", 0.867, "teal"],
                ["B", 0.117, "violet"],
                ["C", 0.016, "dim"],
              ],
              { max: 1, fmt: (v) => v.toFixed(2) },
            ),
          },
        ),
        c: {
          q: "Scores of 3 and 1 become weights in what ratio?",
          o: ["About 7.4 to 1", "3 to 1", "About 2.7 to 1"],
          a: 0,
          hint: "The gap is 2 and the ratio is e to the power of the gap.",
          why: "$e^{3}/e^{1}=e^{2}\\approx 7.4$. Softmax is far more decisive than a plain proportion.",
        },
      },
      {
        t: "Shift invariance",
        b: `<p>Softmax only cares about the <b>gaps</b> between scores, not their size. If every score goes up by the same amount, nobody gains on anybody, so the shares stay exactly the same. Scores 2, 1, 0 and scores 1002, 1001, 1000 give identical shares.</p><p>Programs use this. A computer cannot hold a number as huge as e to the power 1000, so before exponentiating it subtracts the largest score from every score. The biggest becomes 0, the gaps are untouched, and nothing overflows. Try the buttons.</p><details class="math-more"><summary>Show the maths</summary><p>Adding a constant $c$ to every score multiplies each exponential by $e^c$, and that factor cancels in the division. After subtracting the maximum, the biggest exponent is $e^0=1$.</p>${table(
          ["scores", "after subtracting the max", "shares"],
          [
            ["2, 1, 0", "0, −1, −2", "0.67, 0.24, 0.09"],
            ["7, 6, 5", "0, −1, −2", "0.67, 0.24, 0.09"],
            ["1002, 1001, 1000", "0, −1, −2", "0.67, 0.24, 0.09"],
          ],
        )}</details>`,
        v: (box) => shiftFig(box),
        c: {
          q: "Why subtract the maximum score before taking exponentials?",
          o: [
            "It prevents overflow without changing the result",
            "It makes the shares add up to exactly 1",
            "It makes the biggest share noticeably bigger",
          ],
          a: 0,
          why: "The shares sum to 1 anyway. Subtracting the max is exact (the constant cancels) and keeps e^x within range.",
        },
      },
      {
        t: "Why attention divides by √d_k",
        b: `<p>The longer the lists of numbers being compared, the bigger the raw match scores tend to get, simply because more terms are added up. Big scores make softmax <b>all-or-nothing</b>: one token takes almost the whole cake and the rest barely count, so learning gets stuck.</p><p>The cure is to shrink the scores before softmax, dividing by a number that grows with the list length. Pick a list length in the picture: with 64 numbers, the raw scores give the best token nearly everything, but dividing by 8 restores a sensible spread.</p><details class="math-more"><summary>Show the maths</summary><p>For $d_k$ numbers each of size about 1, dot-product scores have a size about $\\sqrt{d_k}$. So attention divides the scores by $\\sqrt{d_k}$ first. For $d_k=64$ that is $\\div 8$, and for $d_k=16$ it is $\\div 4$.</p></details>`,
        v: (box) => scaleFig(box),
        c: {
          q: "Attention skips the scaling step and the key vectors are very long. What goes wrong?",
          o: [
            "Softmax becomes all-or-nothing, with one token winning",
            "The shares stop adding up to 100%, so the output shrinks",
            "Every token ends up with the same share, whatever the scores",
          ],
          a: 0,
          why: "Long vectors give large raw scores, large gaps, and softmax turns large gaps into near-total winners. The shares still add to 1 either way.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>Drag the three scores and read the table: $e^{x}$ is relative to the biggest score, so the largest entry is always 1. The bars show the shares. <b>Divide the scores by</b> mimics the $\\sqrt{d_k}$ scaling, and the bottom table shows the overflow problem for scores around 1000.</p>`,
        v: F.cells([
          { v: "scores", c: "blue" },
          "→",
          { v: "÷ scale", c: "violet" },
          "→",
          { v: "e^x", c: "amber" },
          "→",
          { v: "÷ total", c: "teal" },
        ]),
      },
    ],
    guide: [
      "With scores 2, 1, 0 read the three shares from the table. They should be 0.67, 0.24 and 0.09.",
      "Press <b>Add 5 to every score</b>. Do the shares move?",
      "Drag one score up by 1. By what factor does its exponential change?",
      "Set <b>Divide the scores by</b> to 4 after doubling the scores. What does scaling do to the sharpness?",
      "Answer the questions after the demo.",
    ],
  };
})();
