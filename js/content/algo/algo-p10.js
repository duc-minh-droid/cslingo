/* Phase 10 — Transformers & Attention + Phase 11 capstone */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  /* ============ 10.1 Attention heatmap ============ */
  const TOKENS = ["The", "robot", "moved", "because", "it", "detected", "danger", "."];
  // hand-tuned 4-dim embeddings — crafted so "it" attends strongly to "robot"
  const EMB = {
    The: [0.1, 0.9, 0.0, 0.2],
    robot: [1.0, 0.2, 0.8, 0.1],
    moved: [0.2, 1.0, 0.1, 0.9],
    because: [0.0, 0.3, 0.9, 0.4],
    it: [0.9, 0.1, 0.7, 0.3],
    detected: [0.3, 0.9, 0.2, 0.8],
    danger: [0.8, 0.4, 0.9, 0.0],
    ".": [0.0, 0.0, 0.1, 0.1],
  };
  const WQ = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  const WK = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  const matVec = (M, v) => M.map((r) => r.reduce((s, w, i) => s + w * v[i], 0));
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const softmax = (arr) => {
    const m = Math.max(...arr);
    const e = arr.map((x) => Math.exp(x - m));
    const s = e.reduce((a, b) => a + b);
    return e.map((x) => x / s);
  };

  L["a10-attn"] = {
    sum: "Attention lets each word <b>look at the other words</b> and pull in the ones that matter. Each word asks a question (query), every word advertises what it has (key), and the answer is a weighted mix of their content (values).",
    steps: [
      {
        t: "Words become vectors, plus a position",
        b: `<p>Text is split into <b>tokens</b>, and each token becomes a vector of numbers, its <b>embedding</b>. A <b>position</b> vector is added so the model knows word order. Without it, "dog bites man" and "man bites dog" would look identical.</p>`,
        v: F.cells(
          TOKENS.map((t, i) => ({ v: t, sub: `pos ${i}`, c: t === "it" ? "amber" : t === "robot" ? "teal" : null })),
        ),
        c: {
          q: "The same word appears at two positions. What makes them different to the model?",
          o: [
            "Each occurrence is given its own separate learned embedding",
            "Different position vectors are added to the embedding",
            "The model randomly perturbs repeated words so they differ",
          ],
          a: 1,
          why: "The embedding depends on the word; the position vector depends on the slot. Adding them makes each occurrence unique.",
        },
      },
      {
        t: "Query, key, value",
        b: `<p>Each token's vector is turned into three new vectors:</p><p><b style="color:var(--violet)">Query</b>: "what am I looking for?"<br><b style="color:var(--teal)">Key</b>: "what do I contain?"<br><b style="color:var(--amber)">Value</b>: "what I'll pass on if you pick me"</p><p>For "it", the query should match the key of "robot".</p>`,
        v: F.flow([
          { t: '"it" query', c: "violet" },
          { t: "· each key", s: "dot product = score", c: "teal" },
          { t: "softmax", s: "scores → weights" },
          { t: "Σ weight × value", s: 'new vector for "it"', c: "amber" },
        ]),
        c: {
          q: "What's the value vector's job?",
          o: [
            "To set how much attention weight each token receives",
            "To carry the content passed on, scaled by weight",
            "To hide future tokens from the query during text generation",
          ],
          a: 1,
          why: "Keys decide how much each token counts; values are what actually gets passed on.",
        },
      },
      {
        t: "Softmax turns scores into shares",
        b: `<p>Raw scores can be any numbers. <b>Softmax</b> turns them into positive weights that add up to 1: bigger scores get bigger shares.</p><p>Example: scores 2, 1, 0 become weights 0.67, 0.24, 0.09.</p>`,
        v:
          F.bars(
            [
              ["score 2", 0.665, "teal"],
              ["score 1", 0.245, "violet"],
              ["score 0", 0.09, "dim"],
            ],
            { max: 1, fmt: (v) => v.toFixed(2) },
          ) +
          `<div class="fig-cap">Adding the same number to every score changes nothing. Only the differences matter.</div>`,
        c: {
          q: "Add 5 to every score. What happens to the weights?",
          o: [
            "They all go up by the same amount",
            "Nothing: softmax only depends on the differences",
            "They all go down, since the total must stay 1",
          ],
          a: 1,
          why: "e^(s+5) = e⁵·eˢ, and the e⁵ cancels when you normalise.",
        },
      },
      {
        t: "No peeking at the future",
        b: `<p>When a model <b>generates</b> text, word 3 must not see words 4, 5, 6 (they haven't been written yet). A <b>causal mask</b> sets those scores to −∞ <i>before</i> softmax, so their weights become exactly 0.</p>`,
        v: `<svg class="fig" viewBox="0 0 300 170" style="max-height:170px">${[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${60 + c * 30}" y="${20 + r * 28}" width="26" height="24" rx="4" fill="${c > r ? "var(--bg)" : "rgba(88,204,2," + (0.2 + 0.15 * (4 - Math.abs(r - c))) + ")"}" stroke="var(--line)" class="fi"/>`).join("")).join("")}<text x="30" y="92" class="fig-sub" transform="rotate(-90 30 92)">each word…</text><text x="135" y="162" class="fig-sub">…may only look left</text></svg>`,
      },
      {
        t: "The cost and the caveat",
        b: `<p>Every token scores every other token, so the work grows as <b>n²</b>: double the text length, four times the attention work.</p><span class="key">Attention weights show <i>where</i> information flowed, not <i>why</i>. A high weight isn't proof the model "understood" anything.</span>`,
      },
    ],
    guide: [
      "Find the row for <b>it</b> in the heatmap. Which column is brightest?",
      "Tick <b>Causal mask</b>. The upper-right triangle fades out.",
      "Untick <b>Scale by √d_k</b>. The weights get sharper, closer to all-or-nothing.",
    ],
  };

  N.register({
    id: "a10-attn",
    subject: "algo",
    lecture: 10,
    order: 1,
    num: "10.1",
    title: "Attention: who matters to whom?",
    blurb:
      'A tiny real computation — scores, softmax, weighted values — on a sentence where "it" needs to find "robot".',
    render(root) {
      root.appendChild(header(this, ""));
      let mask = false,
        scale = true;
      const card = el(`<div class="card"><div class="controls">
        <label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="mk"> Causal mask (decoder mode)</label>
        <label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="sc" checked> Scale by √d_k</label></div>
        <div id="hm"></div><div class="legend"><span style="--c:var(--teal)">high weight</span><span style="--c:var(--line-2)">~zero / masked</span></div>
        <div class="callout" id="out"></div></div>`);
      root.appendChild(card);
      qs("#mk", card).onchange = (e) => {
        mask = e.target.checked;
        draw();
      };
      qs("#sc", card).onchange = (e) => {
        scale = e.target.checked;
        draw();
      };
      function draw() {
        const Q = TOKENS.map((t) => matVec(WQ, EMB[t])),
          K = TOKENS.map((t) => matVec(WK, EMB[t])),
          V = TOKENS.map((t) => EMB[t]);
        const dk = Math.sqrt(4);
        const rows = TOKENS.map((t, i) => {
          let s = K.map((k, j) => dot(Q[i], k) / (scale ? dk : 1));
          if (mask) s = s.map((v, j) => (j > i ? -1e9 : v));
          return softmax(s);
        });
        const tbl = [
          `<table class="t" style="font-size:12px"><tr><th></th>${TOKENS.map((t) => `<th>${t}</th>`).join("")}</tr>`,
        ];
        TOKENS.forEach((t, i) => {
          tbl.push(
            `<tr><th>${t}${t === "it" ? " ⬅" : ""}</th>${rows[i].map((w, j) => `<td style="background:rgba(88,204,2,${(w * 1.4).toFixed(2)});${mask && j > i ? "opacity:0.25" : ""}">${w.toFixed(2)}</td>`).join("")}</tr>`,
          );
        });
        qs("#hm", card).innerHTML = tbl.join("") + "</table>";
        const itRow = rows[4];
        const out = V.reduce((acc, v, j) => acc.map((x, k) => x + itRow[j] * v[k]), [0, 0, 0, 0]);
        qs("#out", card).innerHTML =
          `<b>"it" attends most to "${TOKENS[itRow.indexOf(Math.max(...itRow))]}"</b> (${Math.max(...itRow).toFixed(2)} weight). Its output vector = the blend [${out.map((x) => x.toFixed(2)).join(", ")}] — a <b>contextual</b> representation, not a copied word.${mask ? '<br>Causal mask on: "it" can only see positions ≤ itself — the decoder can\'t peek at the future.' : ""}`;
      }
      draw();
      root.appendChild(
        predict({
          id: "a10-at-1",
          q: "Adding 5 to every score in a row changes the softmax weights…",
          opts: ["All increase", "Not at all", "Uniformly toward 0"],
          a: 1,
          why: "e^(s+c) factors out and cancels in normalisation. That's also why max-subtraction for numerical stability is exact.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "score = q·k → softmax → weights; output = Σ weight·value — retrieval by similarity.",
            "Attention cost is O(n²) in sequence length — every position scores every position.",
            "Attention weights show where content flowed, <b>not why</b> — correlation, not explanation.",
          ],
          "Ask with Q, advertise with K, deliver with V — and let softmax do the apportioning.",
        ),
      );
    },
  });

  /* ============ Phase 11 capstone ============ */
  L["a11-capstone"] = {
    sum: "One quiz, every phase. Each question is a scenario — pick the right algorithm and defend it. The recurring questions: what state? what invariant? how does it scale? what breaks?",
    steps: [
      {
        t: "The four questions that pick an algorithm",
        b: `<p><b>What state?</b> (sorted edge list? settled set? growing dictionary?)<br><b>What makes the next step safe?</b> (non-negative edges, admissible h, a cut, a lightest probe)<br><b>How does work scale?</b> (n² vs n log n vs n·h)<br><b>What breaks it?</b> (negative edges, inadmissible h, adversarial input, second bit flip)</p>`,
      },
      {
        t: "Answer format",
        b: `<p>Don't just name an algorithm — name the <b>assumption it exploits</b>. "A* because the heuristic is admissible", "Kruskal because the graph is sparse", "Huffman because the symbol distribution is skewed".</p>`,
        c: {
          q: "A scenario changes one assumption (e.g. a negative edge appears). The right response is…",
          o: [
            "Keep the same algorithm; it will cope",
            "Find which guarantee broke, then pick one that survives",
            "Start from scratch with a brand-new algorithm",
          ],
          a: 1,
          why: "Every algorithm in this module is a bet on its assumptions. The bet changes → the algorithm changes.",
        },
      },
    ],
    guide: [
      "Answer each scenario by naming the algorithm AND the assumption it needs.",
      "≥80% = ready for the oral synthesis.",
    ],
  };
})();
