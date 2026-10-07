/* js/content/algo/algo-p9-x-11.js: Phase 10 extra lessons (overflow): 10.2 Softmax. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 10, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, cap, softmax } = shared;
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
        b: `<p>Attention produces a list of raw scores, one per token, that can be any real numbers. We need <b>weights</b>: positive, adding up to 1, with bigger scores getting bigger shares. That is what softmax does:</p>$$\\operatorname{softmax}(z)_i=\\frac{e^{z_i}}{\\sum_{j=1}^{n}e^{z_j}}$$`,
        v: F.flow([
          { t: "Scores", s: "any numbers", c: "blue" },
          { t: "e^score", s: "all positive", c: "violet" },
          { t: "÷ total", s: "add up to 1", c: "amber" },
          { t: "Weights", c: "teal" },
        ]),
        c: {
          q: "Which of these can never be a softmax output?",
          o: ["A weight of −0.2", "A weight of 0.99", "Three equal weights of one third"],
          a: 0,
          why: "Every e^z is positive, so every share is positive (and below 1 unless it is the only entry).",
        },
      },
      {
        t: "Worked example: scores 2, 1, 0",
        b: `<p>Exponentiate: $e^2=7.39$, $e^1=2.72$, $e^0=1$. The total is $11.11$. Divide each by it:</p>`,
        v:
          table(
            ["score", "e<sup>score</sup>", "÷ 11.11"],
            [
              ["2", "7.39", "<b>0.67</b>"],
              ["1", "2.72", "<b>0.24</b>"],
              ["0", "1.00", "<b>0.09</b>"],
            ],
          ) + cap("A difference of just 1 is a ratio of e ≈ 2.7 between weights."),
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
        b: `<p>Adding the same constant $c$ to every score multiplies each exponential by $e^c$, and that factor cancels in the division. So softmax only depends on the <b>differences</b> between scores.</p><p>Programs use this: subtract the largest score before exponentiating, so the biggest exponent is $e^0=1$ and nothing overflows. Naive code would compute $e^{1000}$, which overflows to infinity and the shares cannot be computed.</p>`,
        v: table(
          ["scores", "after subtracting the max", "shares"],
          [
            ["2, 1, 0", "0, −1, −2", "0.67, 0.24, 0.09"],
            ["7, 6, 5", "0, −1, −2", "0.67, 0.24, 0.09"],
            ["1002, 1001, 1000", "0, −1, −2", "0.67, 0.24, 0.09"],
          ],
        ),
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
        b: `<p>Dot products of long vectors grow with the vector length: for $d_k$ numbers each of size about 1, scores have a size about $\\sqrt{d_k}$. Large scores push softmax towards <b>all-or-nothing</b>, where tiny changes in input give almost no gradient. So attention divides the scores by $\\sqrt{d_k}$ first. For $d_k=64$ that is $\\div 8$.</p>`,
        v:
          F.bars(
            [
              ["scores 16, 8, 0 (raw)", 0.9997, "rose"],
              ["÷ 8  →  2, 1, 0", 0.665, "teal"],
            ],
            { max: 1, fmt: (v) => v.toFixed(2) },
          ) + cap("Weight on the biggest score before and after scaling by √64 = 8."),
        c: {
          q: "Keys have d<sub>k</sub> = 16. What are the raw scores divided by?",
          o: ["4", "16", "256"],
          a: 0,
          why: "$\\sqrt{16}=4$.",
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
