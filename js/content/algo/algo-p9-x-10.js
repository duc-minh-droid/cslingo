/* js/content/algo/algo-p9-x-10.js: Phase 10 extra lessons (overflow): 10.4 Queries, keys and values. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 10, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, r2, softmax, mm, tr } = shared;
  const TOK3 = ["the", "dog", "barked"];
  const X3 = [
    [1, 0, 1, 0],
    [0, 1, 1, 1],
    [1, 1, 0, 0],
  ];
  const WQ3 = [
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 0],
    ],
    WK3 = [
      [1, 0],
      [0, 1],
      [0, 0],
      [1, 1],
    ],
    WV3 = [
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 1],
    ];
  const mat = (M, { rows = [], cols = [], hl = null, digits = 2, cls = "" } = {}) =>
    `<table class="t ${cls}" style="font-size:12.5px;text-align:center;display:inline-table;margin:2px 8px 2px 0"><tr><th></th>${cols.map((c) => `<th>${c}</th>`).join("")}</tr>${M.map((r, i) => `<tr><th>${rows[i] ?? ""}</th>${r.map((v, j) => `<td style="${hl && hl(i, j) ? "background:rgba(255,200,0,.35);font-weight:900" : ""}">${Number.isInteger(v) ? v : (+v).toFixed(digits)}</td>`).join("")}</tr>`).join("")}</table>`;

  function attnRun(box, life) {
    const Q = mm(X3, WQ3),
      K = mm(X3, WK3),
      V = mm(X3, WV3),
      dk = 2,
      QI = 2; // the walk-through follows the last token, "barked"
    const sc = K.map((k) => Q[QI].reduce((s, v, i) => s + v * k[i], 0)),
      sd = sc.map((v) => v / Math.sqrt(dk)),
      w = softmax(sd);
    const out = [0, 1].map((c) => w.reduce((s, a, j) => s + a * V[j][c], 0));
    const S = mm(Q, tr(K)),
      A = S.map((r) => softmax(r.map((v) => v / Math.sqrt(dk)))),
      Z = mm(A, V);
    const keyChip = (j, on) =>
      `<span class="at-k" data-k="${j}" style="display:inline-block;margin:3px 6px 3px 0;padding:4px 10px;border:2px solid ${on ? "var(--blue)" : "var(--line-2)"};border-radius:10px;background:var(--panel-2);font:800 12.5px var(--sans);cursor:default">${TOK3[j]}</span>`;
    const cm = (M, rows, cols, hl) => mat(M, { rows, cols, hl });
    function* frames() {
      const dn = ["d1", "d2"];
      yield {
        cap: "Three tokens, each already a vector of 4 numbers (rows of <b>X</b>). We will compute attention for <b>barked</b> first.",
        html: `<div>${cm(X3, TOK3, [1, 2, 3, 4])}</div>`,
      };
      yield {
        cap: "Multiply by three learned matrices: <b>Q = X·W<sub>Q</sub></b>. Every token gets a 2-number query (what am I looking for?).",
        html: `<div>X ${cm(X3, TOK3, [1, 2, 3, 4])} × W<sub>Q</sub> ${cm(WQ3, [1, 2, 3, 4], dn)} = Q ${cm(Q, TOK3, dn, (i) => i === QI)}</div>`,
      };
      yield {
        cap: "Same again with W<sub>K</sub>: <b>K = X·W<sub>K</sub></b>. Each token advertises a key (what do I contain?).",
        html: `<div>Q ${cm(Q, TOK3, dn, (i) => i === QI)} &nbsp; K ${cm(K, TOK3, dn)}</div>`,
      };
      yield {
        cap: "And W<sub>V</sub>: <b>V = X·W<sub>V</sub></b>. The value is the content a token hands over if chosen.",
        html: `<div>Q ${cm(Q, TOK3, dn, (i) => i === QI)} &nbsp; K ${cm(K, TOK3, dn)} &nbsp; V ${cm(V, TOK3, dn)}</div>`,
      };
      const head = (n) =>
        `<div style="margin-bottom:6px">Query of <b>barked</b> = [${Q[QI].join(", ")}]. Keys: ${K.map((k, j) => `${TOK3[j]} = [${k.join(", ")}]`).join(" · ")}</div>`;
      yield {
        cap: `Now score <b>barked</b> against each key. Which token do you expect to score highest?`,
        html: head() + [0, 1, 2].map((j) => keyChip(j, false)).join(""),
      };
      for (let j = 0; j < 3; j++)
        yield {
          ask:
            j === 0
              ? {
                  q: "The query of <b>barked</b> is [1, 1]. Tap the token whose key matches it best.",
                  pick: ".at-k",
                  a: ["1"],
                  why: "Score = query · key: the=1, <b>dog</b>=3, barked=2. The key of dog points the way barked is looking.",
                }
              : null,
          cap: `Score for <b>${TOK3[j]}</b>: q·k = ${Q[QI].map((v, i) => `${v}×${K[j][i]}`).join(" + ")} = <b>${sc[j]}</b>.`,
          html:
            head() +
            [0, 1, 2].map((m) => keyChip(m, m === j)).join("") +
            `<div style="margin-top:6px">scores so far: ${sc
              .slice(0, j + 1)
              .map((v, m) => `${TOK3[m]} ${v}`)
              .join(", ")}</div>`,
        };
      yield {
        cap: `Divide by √d<sub>k</sub> = √2 ≈ 1.41: [${sd.map((v) => r2(v)).join(", ")}]. This keeps the scores from growing with the vector length.`,
        html: `<div>scores [${sc.join(", ")}] ÷ 1.41 = <b>[${sd.map((v) => r2(v)).join(", ")}]</b></div>`,
      };
      yield {
        cap: `Softmax turns them into weights that add up to 1: <b>${w.map((v) => r2(v)).join(", ")}</b>. <b>${TOK3[w.indexOf(Math.max(...w))]}</b> gets the biggest share.`,
        html: `<div>${F.bars(
          TOK3.map((t, j) => [t, w[j], ["blue", "teal", "amber"][j]]),
          { max: 1, fmt: (v) => v.toFixed(2) },
        )}</div>`,
      };
      yield {
        cap: `Blend the values with those weights: ${w.map((a, j) => `${r2(a)}·[${V[j].join(",")}]`).join(" + ")} = <b>[${out.map((v) => r2(v)).join(", ")}]</b>. That is the new, contextual vector for <b>barked</b>.`,
        html: `<div>weights ${cm([w], ["a"], TOK3)} × V ${cm(V, TOK3, dn)} = z ${cm([out], ["barked"], dn)}</div>`,
      };
      yield {
        cap: `Doing every token at once is just matrices: <b>S = Q·Kᵀ</b> (a 3×3 grid of scores).`,
        html: `<div>Q·Kᵀ = S ${cm(S, TOK3, TOK3, (i) => i === QI)}</div>`,
      };
      yield {
        cap: `Row-wise softmax of S÷√d<sub>k</sub> gives the attention matrix <b>A</b>; each row sums to 1.`,
        html: `<div>A ${cm(A, TOK3, TOK3, (i) => i === QI)}</div>`,
      };
      yield {
        cap: `<b>Z = A·V</b>: one new vector per token, each a blend of all the values. Row 3 is the one we computed by hand.`,
        mood: "love",
        html: `<div>A ${cm(A, TOK3, TOK3)} × V ${cm(V, TOK3, dn)} = Z ${cm(Z, TOK3, dn, (i) => i === QI)}</div>`,
      };
    }
    F.run(box, life, {
      build(stage) {
        stage.style.minHeight = "230px";
        const host = el(`<div style="padding:6px;line-height:1.7"></div>`);
        stage.appendChild(host);
        return { host };
      },
      frames,
      draw(s, f) {
        s.host.innerHTML = f.html;
      },
    });
  }

  reg({
    id: "a10-qkv",
    order: 4,
    num: "10.4",
    title: "Queries, keys and values by hand",
    blurb:
      "Aim a query at three keys and watch the dot products become weights, then follow a full attention calculation with three tokens.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const KEYS = [
        { n: "animal", a: 40, c: [88, 204, 2] },
        { n: "street", a: 140, c: [28, 176, 246] },
        { n: "tired", a: 250, c: [255, 150, 0] },
      ];
      let qa = 90,
        ql = 1,
        scaled = false;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Aim a query</h2><span class="faint">"The animal didn't cross the street because it was too tired": what should <b>it</b> look at?</span></div>
        <div class="controls" id="r"></div>
        <canvas class="viz" id="cv"></canvas>
        <div id="tb"></div><div id="bars"></div>
        <div class="stat-row"><div class="stat teal"><small>Biggest weight goes to</small><b id="s1"></b></div><div class="stat violet"><small>Output (blend of the value colours)</small><b id="s2" style="display:inline-block;width:56px;height:24px;border-radius:8px;border:2px solid var(--line)"></b></div></div></div>`);
      root.appendChild(card);
      const r = qs("#r", card);
      const sa = N.slider("Query direction (degrees)", 0, 355, 5, qa, (v) => v + "°");
      sa.onInput((v) => {
        qa = v;
        draw();
      });
      const sl = N.slider("Query length", 0.5, 4, 0.5, ql, (v) => fmt(v, 1));
      sl.onInput((v) => {
        ql = v;
        draw();
      });
      const ck = el(
        `<label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox"> Divide by √d<sub>k</sub> (d<sub>k</sub> = 4, so ÷ 2)</label>`,
      );
      qs("input", ck).onchange = (e) => {
        scaled = e.target.checked;
        draw();
      };
      r.append(sa, sl, ck);
      const rad = (d) => (d * Math.PI) / 180;
      function draw() {
        const C = N.colors();
        const sc = KEYS.map((k) => (ql * Math.cos(rad(qa - k.a))) / (scaled ? 2 : 1)),
          w = softmax(sc);
        const { ctx, w: W, h } = N.setupCanvas(qs("#cv", card), 250);
        if (W >= 40) {
          ctx.clearRect(0, 0, W, h);
          const cx = W / 2,
            cy = h / 2,
            R = Math.min(W, h) / 2 - 34;
          ctx.strokeStyle = C.line;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, 7);
          ctx.stroke();
          const arrow = (ang, len, col, wd, label) => {
            const x = cx + len * Math.cos(-rad(ang)),
              y = cy + len * Math.sin(-rad(ang));
            ctx.strokeStyle = col;
            ctx.fillStyle = col;
            ctx.lineWidth = wd;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x, y);
            ctx.stroke();
            const a = Math.atan2(y - cy, x - cx);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 10 * Math.cos(a - 0.4), y - 10 * Math.sin(a - 0.4));
            ctx.lineTo(x - 10 * Math.cos(a + 0.4), y - 10 * Math.sin(a + 0.4));
            ctx.closePath();
            ctx.fill();
            ctx.font = "800 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(label, cx + (len + 20) * Math.cos(-rad(ang)), cy + (len + 20) * Math.sin(-rad(ang)) + 4);
          };
          KEYS.forEach((k, i) => arrow(k.a, R, `rgb(${k.c.join(",")})`, 3, `${k.n} (key)`));
          arrow(qa, Math.min(R * 1.0, (R * ql) / 2.2 + 18), C.violet, 4.5, "query");
          ctx.lineWidth = 1;
        }
        qs("#tb", card).innerHTML = table(
          ["key", "score = query · key" + (scaled ? " ÷ 2" : ""), "weight"],
          KEYS.map((k, i) => [k.n, fmt(+sc[i].toFixed(2), 2), `<b>${w[i].toFixed(2)}</b>`]),
        );
        qs("#bars", card).innerHTML = F.bars(
          KEYS.map((k, i) => [k.n, w[i], ["teal", "blue", "amber"][i]]),
          { max: 1, fmt: (v) => v.toFixed(2) },
        );
        qs("#s1", card).textContent = KEYS[w.indexOf(Math.max(...w))].n;
        const mix = [0, 1, 2].map((c) => Math.round(KEYS.reduce((s, k, i) => s + w[i] * k.c[c], 0)));
        qs("#s2", card).style.background = `rgb(${mix.join(",")})`;
      }
      life.onResize(draw);
      draw();
      root.appendChild(
        predict({
          id: "a10-qkv-1",
          q: "Point the query straight at <b>animal</b> (40°), length 1. What happens to the weight on animal?",
          opts: [
            "It is the largest, since the dot product peaks when the vectors point the same way",
            "It is zero, because the query and key cancel when they are identical",
            "All three weights stay equal, because the keys all have length 1",
          ],
          a: 0,
          why: "score = |q||k|cos(angle). The angle is 0, so cos = 1 and animal gets the top score. The other two keys are 100° and 210° away, which gives lower or negative scores.",
        }),
      );
      root.appendChild(
        predict({
          id: "a10-qkv-2",
          q: "Keep the query aimed at animal, but stretch its length from 1 to 4. How do the weights change?",
          opts: [
            "Sharper: animal takes almost all of the weight",
            "Flatter: the weights spread out",
            "No change, because only the direction matters",
          ],
          a: 0,
          why: "A longer query multiplies every score, which widens the gaps, and softmax turns bigger gaps into more decisive weights. This is why the scores are divided by √d<sub>k</sub>.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Query</b> = what I am looking for, <b>key</b> = what I contain, <b>value</b> = what I pass on if chosen.",
            "Each token's embedding <b>x</b> is multiplied by three learned matrices to give <b>q = xW<sub>Q</sub></b>, <b>k = xW<sub>K</sub></b>, <b>v = xW<sub>V</sub></b>.",
            "<b>score = q·k</b>: large when the query and key point the same way. Divide by √d<sub>k</sub>, softmax to weights, then take the weighted sum of the values.",
            "In matrix form: <b>Attention(Q, K, V) = softmax(QKᵀ / √d<sub>k</sub>) V</b>. For T tokens the score matrix is T × T.",
            "The result is a <b>contextual embedding</b>: the token's vector rebuilt from the tokens it attends to.",
          ],
          "Match the query to the keys, then blend the values by the match.",
        ),
      );
    },
  });
  L["a10-qkv"] = {
    sum: "Attention is a soft lookup: a <b>query</b> is matched to <b>keys</b> by dot product, softmax turns the scores into weights, and the output is the weighted blend of the <b>values</b>.",
    steps: [
      {
        t: "A library search",
        b: `<p>Think of a library. Your <b>query</b> is what you type into the search box. Each book has a <b>key</b>, its label on the spine, which the search matches. The <b>value</b> is the content of the book you actually read.</p><p>In "The animal didn't cross the street because it was too tired", the word <i>it</i> asks "I need the noun I refer to". <i>animal</i> has a key like "I am a singular animate entity"; <i>street</i> has one like "I am an inanimate location".</p>`,
        v: F.cells(
          [
            { v: "query", sub: '"it": which noun?', c: "violet" },
            "→",
            { v: "keys", sub: "animal · street", c: "teal" },
            "→",
            { v: "best match", sub: "animal", c: "amber" },
            "→",
            { v: "value", sub: "its content", c: "blue" },
          ],
          { size: 86 },
        ),
        c: {
          q: "In the library analogy, what does the <b>value</b> correspond to?",
          o: ["The contents of the book you read", "The label on the spine", "The words you type into the search box"],
          a: 0,
          why: "Query = the search words, key = the spine label that gets matched, value = what you actually take away.",
        },
      },
      {
        t: "Dot product = match score",
        b: `<p>To compare a query $q$ with a key $k$ we use their <b>dot product</b>, $q\\cdot k=\\sum_i q_ik_i$. It is large when the two vectors point the same way, near zero when they are at right angles, and negative when they point opposite ways.</p><span class="key">score(it, animal) ≫ score(it, street)</span>`,
        v: table(
          ["query", "key", "q · k"],
          [
            ["[1, 2]", "[2, 1]", "1×2 + 2×1 = <b>4</b>"],
            ["[1, 2]", "[2, −1]", "1×2 + 2×(−1) = <b>0</b>"],
            ["[1, 2]", "[−1, −2]", "<b>−5</b>"],
          ],
        ),
        c: {
          q: "q = [1, 2] and k = [2, −1]. What is q·k?",
          o: ["0", "4", "−1"],
          a: 0,
          why: "1×2 + 2×(−1) = 0: the vectors are perpendicular, so this key is no match at all.",
        },
      },
      {
        t: "Where q, k and v come from",
        b: `<p>The token's embedding $x$ (a row of $d_{\\text{model}}$ numbers) is multiplied by <b>three different learned matrices</b>:</p>$$q=xW_Q\\qquad k=xW_K\\qquad v=xW_V$$<p>So one word gives three vectors, each shaped for a different job. The matrices are the parameters learned in training. Every token uses the same three matrices.</p>`,
        v: F.flow([
          { t: "x", s: "embedding", c: "blue" },
          { t: "× W_Q", s: "→ query", c: "violet" },
          { t: "× W_K", s: "→ key", c: "teal" },
          { t: "× W_V", s: "→ value", c: "amber" },
        ]),
        c: {
          q: "How many different weight matrices turn a token's embedding into q, k and v?",
          o: ["Three: W_Q, W_K and W_V", "One, shared by all three", "Two: one for queries and keys, one for values"],
          a: 0,
          why: "Each role has its own learned projection, so the same word can ask, advertise and deliver different things.",
        },
      },
      {
        t: "Scale, softmax, blend",
        b: `<p>For one query: score it against every key, <b>divide by $\\sqrt{d_k}$</b> (so long vectors do not make scores huge), apply <b>softmax</b> to get weights adding to 1, then add up the values weighted by those shares:</p>$$z=\\sum_j \\operatorname{softmax}_j\\!\\left(\\frac{q\\cdot k_j}{\\sqrt{d_k}}\\right) v_j$$<p>$z$ is the token's <b>contextual embedding</b>: a blend of the tokens it paid attention to.</p>`,
        v: F.flow([
          { t: "q · kⱼ", s: "scores", c: "violet" },
          { t: "÷ √d_k", c: "amber" },
          { t: "softmax", s: "weights", c: "blue" },
          { t: "Σ wⱼ vⱼ", s: "contextual vector", c: "teal" },
        ]),
        c: {
          q: "The softmax weights for three tokens are 0.1, 0.7 and 0.2. The output z is…",
          o: ["0.1·v₁ + 0.7·v₂ + 0.2·v₃", "The value of the token with weight 0.7 only", "The sum of the three keys"],
          a: 0,
          why: "Attention is a soft lookup: a weighted blend of all values, not a hard pick.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>A complete calculation for three tokens with small whole-number matrices. We follow the last token, <i>barked</i>, in detail, then do all three with matrices. It pauses once to ask you which key will match best.</p>`,
        v: (box, life) => attnRun(box, life),
      },
      {
        t: "All tokens at once: matrix form",
        b: `<p>Stack the queries, keys and values as matrices with one row per token and everything happens in three matrix products:</p>$$\\operatorname{Attention}(Q,K,V)=\\operatorname{softmax}\\!\\left(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\right)V$$<p>$QK^\\top$ is a $T\\times T$ grid: every token scored against every token. That grid is why attention costs $O(T^2)$.</p>`,
        v: table(
          ["matrix", "shape (T tokens)"],
          [
            ["Q, K, V", "T × d<sub>k</sub> (V: T × d<sub>v</sub>)"],
            ["Q Kᵀ (scores)", "T × T"],
            ["softmax rows", "T × T, each row adds to 1"],
            { c: ["output Z = A V", "T × d<sub>v</sub>"], hl: true },
          ],
        ),
        c: {
          q: "A sentence has 10 tokens. How many scores are in the attention score matrix?",
          o: ["20", "100", "10"],
          a: 1,
          why: "Every one of the 10 tokens is scored against every one of the 10: 10 × 10 = 100.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>The circle shows three keys (green, blue, orange) and a violet query you can rotate and stretch. The table lists each score and the softmax weight. The swatch mixes the three value colours with those weights: that is the output.</p>`,
        v: F.cells([
          { v: "turn", sub: "the query", c: "violet" },
          "→",
          { v: "scores", c: "teal" },
          "→",
          { v: "weights", c: "blue" },
          "→",
          { v: "blend", sub: "of values", c: "amber" },
        ]),
      },
    ],
    guide: [
      "Rotate the query towards animal, then towards street. Watch the weights and the output colour change.",
      "Tick <b>Divide by √d<sub>k</sub></b>: are the weights sharper or softer?",
      "Stretch the query length to 4 while it points at one key. What happens to the weights?",
      "Answer the questions after the demo.",
    ],
  };
})();
