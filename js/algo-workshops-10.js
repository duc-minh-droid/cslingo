/* Algorithms, Phase 10 workshop: Code attention (code lab).
   10.C "Code attention": write softmax and the weighted blend, then watch attention lines thicken for every token.
   The expected outputs come from a reference implementation run at load time, never typed in. */
(function () {
  const N = NIC, { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig, L = N.LESSONS;
  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();

  /* ---------- reference attention (the real algorithm) ---------- */
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  function ref(Q, K, V) {
    return Q.map((q) => {
      const s = K.map((k) => dot(q, k) / Math.sqrt(k.length));
      const m = Math.max(...s), e = s.map((x) => Math.exp(x - m)), t = e.reduce((a, b) => a + b, 0), w = e.map((x) => x / t);
      return V[0].map((_, d) => w.reduce((acc, wj, j) => acc + wj * V[j][d], 0));
    });
  }
  const r3 = (M) => M.map((v) => v.map((x) => Math.round(x * 1000) / 1000));

  const K4 = [[4, 0, 0, 0], [0, 4, 0, 0], [0, 0, 4, 0]];
  const V3 = [[1, 0], [0, 1], [1, 1]];
  const CASES = [
    { name: "A tiny sentence", desc: "Three tokens. Each one matches itself best.", tokens: ["the", "cat", "sat"],
      Q: [[2, 0, 0, 0], [0, 2, 0, 0], [0, 0, 2, 0]], K: [[2, 0, 0, 0], [0, 2, 0, 0], [0, 0, 2, 0]], V: V3,
      hint: "Each row of scores is like 2, 0, 0. If your weights are not about 0.79, 0.11, 0.11, check that you divide every <code>Math.exp</code> by the <b>total</b> of them all." },
    { name: "One word dominates", desc: "\"she\" is only looking for \"Ana\". Nearly all the weight should land there.", tokens: ["Ana", "said", "she"],
      Q: [[2, 0, 0, 0], [0, 2, 0, 0], [2, 0, 0, 0]], K: K4, V: V3,
      hint: "Attention is a <b>soft</b> blend, not a pick-the-winner. The small weights still count: the output is close to the winner's value, but not equal to it." },
    { name: "Nobody stands out", desc: "Every query is blank, so every score is 0. What is the fairest blend?", tokens: ["hm", "well", "so"],
      Q: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], K: [[1, 2, 0, 0], [0, 1, 2, 0], [2, 0, 0, 1]], V: [[3, 0], [0, 3], [3, 3]],
      hint: "Equal scores should give equal shares (1 ÷ 3 each), so the output is the plain average of the three value vectors." },
    { name: "Huge scores", desc: "Scores in the thousands. Does your softmax survive?", tokens: ["one", "two", "three"],
      Q: [[1000, 0, 0, 0], [0, 1000, 0, 0], [0, 0, 1000, 0]], K: K4, V: V3,
      hint: "<code>Math.exp(2000)</code> overflows to Infinity, and Infinity ÷ Infinity is not a number. Subtract the <b>largest</b> score from every score first: only the differences matter, so nothing changes except that it stops overflowing." },
  ].map((c) => ({ ...c, args: [c.Q, c.K, c.V], expect: r3(ref(c.Q, c.K, c.V)), view: { tokens: c.tokens, Q: c.Q, K: c.K, V: c.V },
    cmp: (got, want) => Array.isArray(got) && got.length === want.length && got.every((r, i) => Array.isArray(r) && r.length === want[i].length && r.every((x, k) => Math.abs(x - want[i][k]) < 0.01)) }));

  const STARTER = `function attention(Q, K, V) {
  // Q, K: one vector per token (d_k numbers each). V: one value vector per token.
  const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
  const out = [];

  for (let i = 0; i < Q.length; i++) {
    // Step 1: score every key against token i's query, scaled by sqrt(d_k).
    const scores = K.map((k) => dot(Q[i], k) / Math.sqrt(k.length));
    trace({ type: "scores", i, scores: [...scores] });

    // Step 2: softmax turns the scores into weights that add up to 1.
    let weights = [];
    /* YOUR CODE: softmax. Fill weights with one share for each score. */
    trace({ type: "weights", i, weights: [...weights] });

    // Step 3: blend the value vectors, each scaled by its weight.
    const mix = V[0].map(() => 0);
    /* YOUR CODE: for every token j and slot d, add weights[j] * V[j][d] into mix[d]. */
    trace({ type: "mix", i, mix: [...mix] });

    out.push(mix);
  }
  return out;
}`;
  const SOLUTION = `function attention(Q, K, V) {
  // Q, K: one vector per token (d_k numbers each). V: one value vector per token.
  const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
  const out = [];

  for (let i = 0; i < Q.length; i++) {
    // Step 1: score every key against token i's query, scaled by sqrt(d_k).
    const scores = K.map((k) => dot(Q[i], k) / Math.sqrt(k.length));
    trace({ type: "scores", i, scores: [...scores] });

    // Step 2: softmax turns the scores into weights that add up to 1.
    let weights = [];
    const biggest = Math.max(...scores);
    const e = scores.map((s) => Math.exp(s - biggest));
    const total = e.reduce((a, b) => a + b, 0);
    weights = e.map((x) => x / total);
    trace({ type: "weights", i, weights: [...weights] });

    // Step 3: blend the value vectors, each scaled by its weight.
    const mix = V[0].map(() => 0);
    for (let j = 0; j < V.length; j++) {
      for (let d = 0; d < mix.length; d++) mix[d] += weights[j] * V[j][d];
    }
    trace({ type: "mix", i, mix: [...mix] });

    out.push(mix);
  }
  return out;
}`;

  /* ---------- the scene ---------- */
  const NS = "http://www.w3.org/2000/svg";
  const fmt = (x) => (typeof x !== "number" || !isFinite(x) ? (isNaN(x) ? "NaN" : x > 0 ? "∞" : "-∞") : Math.abs(x) >= 100 ? String(Math.round(x)) : String(+x.toFixed(2)));
  const vec = (v) => "[" + v.map(fmt).join(", ") + "]";
  const W = 520, TOPY = 28, BOTY = 168, CH = 40;

  function scene() {
    return {
      build(stage, test) {
        const { tokens, Q, K, V } = test.view, n = tokens.length;
        const xs = tokens.map((_, j) => (W * (j + 0.5)) / n), cw = Math.min(118, W / n - 14);
        let lines = "";
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const dx = xs[j] - xs[i], dy = BOTY - (TOPY + CH), len = Math.hypot(dx, dy), ang = (Math.atan2(dy, dx) * 180) / Math.PI;
          lines += `<g class="aw10-lg" data-q="${i}" data-k="${j}"><rect class="aw10-ln" x="0" y="-7" width="${len.toFixed(1)}" height="14" rx="7" style="transform:translate(${xs[i].toFixed(1)}px,${TOPY + CH}px) rotate(${ang.toFixed(2)}deg) scaleY(0.05)"/>` +
            `<text class="aw10-wt" x="${(xs[i] + dx * 0.72).toFixed(1)}" y="${(TOPY + CH + dy * 0.72 - 10).toFixed(1)}"></text></g>`;
        }
        stage.innerHTML = `<div class="aw10-vis">
          <svg class="aw10-svg" viewBox="0 0 ${W} 236" role="img" aria-label="Attention lines from one query token to every key token">
            <text class="aw10-lab" x="4" y="14">asks (query)</text><text class="aw10-lab" x="4" y="${BOTY + CH + 22}">answers (keys and values)</text>
            ${lines}
            ${tokens.map((t, j) => `<g class="aw10-tk aw10-top" data-t="${j}"><rect x="${xs[j] - cw / 2}" y="${TOPY}" width="${cw}" height="${CH}" rx="12"/><text x="${xs[j]}" y="${TOPY + CH / 2}">${t}</text></g>`).join("")}
            ${tokens.map((t, j) => `<g class="aw10-tk aw10-bot" data-b="${j}"><rect x="${xs[j] - cw / 2}" y="${BOTY}" width="${cw}" height="${CH}" rx="12"/><text x="${xs[j]}" y="${BOTY + CH / 2}">${t}</text></g>`).join("")}
          </svg>
          <div class="aw10-out" data-out>New vector for the chosen token appears here.</div>
          <div class="aw10-charts">
            <div class="aw10-chart"><b>Scores <small>q·k ÷ √d_k</small></b><div data-sc></div></div>
            <div class="aw10-chart"><b>Weights <small>after softmax</small></b><div data-wt></div></div>
          </div>
          <details class="aw10-vecs"><summary>The numbers in this test</summary>
            <table class="aw10-tbl"><tr><th>token</th><th>query q</th><th>key k</th><th>value v</th></tr>
            ${tokens.map((t, j) => `<tr data-r="${j}"><td><b>${t}</b></td><td>${vec(Q[j])}</td><td>${vec(K[j])}</td><td>${vec(V[j])}</td></tr>`).join("")}</table></details>
        </div>`;
        const h = { stage, tokens, n, rows: {}, test };
        ["sc", "wt"].forEach((k) => { h[k] = qs(`[data-${k}]`, stage); h[k].innerHTML = tokens.map((t) => `<div class="aw10-row"><span>${t}</span><span class="aw10-tr"><i></i></span><output>·</output></div>`).join(""); });
        h.ln = qsa(".aw10-lg", stage); h.out = qs("[data-out]", stage);
        this.reset(h);
        return h;
      },
      reset(h) { paint(h, 0, null, null, null, false); },
      frame(h, f, { i, frames, animate }) {
        if (!f) return this.reset(h);
        let scores = null, weights = null, mix = null;
        for (let k = i; k >= 0; k--) { const x = frames[k]; if (x.i !== f.i) break; if (x.type === "scores" && !scores) scores = x.scores; if (x.type === "weights" && !weights) weights = x.weights; if (x.type === "mix" && !mix) mix = x.mix; }
        paint(h, f.i, scores, weights, mix, animate, f.type);
      },
      caption(f, { test }) {
        if (!f || !f.type) return f && f.cap ? f.cap : "";
        const t = test.view.tokens[f.i] || "?";
        if (f.type === "scores") return `Query <b>${t}</b> scores every key: <b>q · k ÷ √d_k</b> = ${vec(f.scores)}. Raw scores can be any size.`;
        if (f.type === "weights") {
          const w = f.weights || [], bad = w.some((x) => typeof x !== "number" || !isFinite(x)), s = w.reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
          if (!w.length) return `Query <b>${t}</b>: your code has not filled <code>weights</code> yet, so no line is drawn. That is blank 1.`;
          if (bad) return `Some weights for <b>${t}</b> are not numbers: ${vec(w)}. A huge score can make <code>Math.exp</code> overflow. Subtract the biggest score first.`;
          return `Softmax turns the scores into shares: ${vec(w)}. Total <b>${fmt(+s.toFixed(3))}</b>${Math.abs(s - 1) > 0.01 ? ". They should add up to 1, so the normalising step is off." : ", as it should."}`;
        }
        if (f.type === "mix") return `Output for <b>${t}</b> = Σ weight × value = <b>${vec(f.mix)}</b>${f.mix.every((x) => x === 0) ? ". Still all zeros: blank 2 has not added anything yet." : ""}`;
        return "";
      },
    };
    function paint(h, qi, scores, weights, mix, animate, type) {
      qsa("[data-t]", h.stage).forEach((g) => g.classList.toggle("on", +g.dataset.t === qi));
      qsa("[data-r]", h.stage).forEach((g) => g.classList.toggle("on", +g.dataset.r === qi));
      const hasW = !!(weights && weights.length), ok = hasW && weights.every((x) => typeof x === "number" && isFinite(x));
      h.ln.forEach((g) => {
        const q = +g.dataset.q, j = +g.dataset.k, r = qs("rect", g), t = qs("text", g);
        const mine = q === qi;
        let s = 0.05, op = 0, cls = "aw10-ln";
        if (mine && scores && !hasW) { s = 0.14; op = 0.5; cls = "aw10-ln raw"; }
        if (mine && ok) { const w = Math.max(0, Math.min(1, weights[j])); s = Math.max(0.06, w); op = 0.3 + 0.7 * w; }
        r.setAttribute("class", cls);
        r.style.transform = r.style.transform.replace(/scaleY\([^)]*\)/, `scaleY(${s.toFixed(3)})`);
        r.style.opacity = op;
        t.textContent = mine && ok ? fmt(+weights[j].toFixed(2)) : "";
        t.style.opacity = mine && ok ? 1 : 0;
      });
      bars(h.sc, scores, false);
      bars(h.wt, hasW ? weights : null, true);
      qsa("[data-b]", h.stage).forEach((g) => { const j = +g.dataset.b; g.style.opacity = ok ? 0.45 + 0.55 * Math.max(0, Math.min(1, weights[j])) : 1; });
      const tk = h.tokens[qi];
      if (mix) { h.out.innerHTML = `New vector for <b>${tk}</b>: <b>${vec(mix)}</b>`; h.out.classList.add("has"); if (animate && fxOn()) N.fx.bump(h.out, { scale: 1.04, y: 0 }); }
      else { h.out.innerHTML = `Query <b>${tk}</b>: its new vector is built after the weights.`; h.out.classList.remove("has"); }
    }
    function bars(box, vals, unit) {
      const rows = qsa(".aw10-row", box), mx = vals ? Math.max(1e-9, unit ? 1 : Math.max(...vals.map((x) => (isFinite(x) ? Math.abs(x) : 0)), 1)) : 1;
      rows.forEach((row, j) => {
        const v = vals ? vals[j] : undefined, i = qs("i", row), o = qs("output", row);
        const bad = vals && (typeof v !== "number" || !isFinite(v));
        const x = vals && !bad ? Math.min(1, Math.abs(v) / mx) : 0;
        i.style.transform = `scaleX(${x.toFixed(3)})`;
        i.className = bad ? "bad" : vals && v < 0 ? "neg" : unit ? "w" : "s";
        o.textContent = vals ? (v === undefined ? "·" : fmt(v)) : "·";
      });
    }
  }

  N.register({
    id: "a10-code", subject: "algo", lecture: 10, order: 90, num: "10.C", workshop: true,
    title: "Workshop: code attention",
    blurb: "Write softmax and the weighted blend, then watch every token decide whom to listen to.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.codelab(root, life, {
        who: "byte", noun: "attention layer", entry: "attention", watch: true,
        intro: "You've seen attention as a heatmap. Now write its heart. The scores are done for you; there are <b>two blanks</b>, marked in orange: softmax and the blend.",
        brief: "<b>Goal:</b> for each token, return its <b>new vector</b>. <code>Q</code>, <code>K</code>, <code>V</code> hold one query, key and value vector per token. Steps: scores → <b>softmax</b> → weights → <b>Σ weight × value</b>. Scores are already divided by √d_k. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs the tests.",
        starter: STARTER, solution: SOLUTION,
        hints: ["Blank 1 (softmax): take e to the power of each score, then divide each by the total of them all. Then the weights add up to 1.", "Blank 1, stability: subtract the biggest score from every score before <code>Math.exp</code>. The lecture showed that adding or subtracting the same number changes nothing, and it stops huge scores overflowing.", "Blank 2 (blend): <code>mix</code> starts as zeros. For each token <code>j</code>, add <code>weights[j]</code> times each number of <code>V[j]</code> into the matching slot of <code>mix</code>."],
        tests: CASES,
        scene: scene(),
      });
      root.appendChild(predict({ id: "a10-code-1", q: "A query is completely blank, so all its scores are 0. What does attention give that token?", opts: ["The plain average of every value vector", "The value vector of the first token only", "A vector of zeros, as nothing stood out"], a: 0,
        why: "e⁰ = 1 for every score, so every token gets the same share, 1 ÷ n. The blend is then the plain average of the values: with nothing to go on, listen to everyone equally." }));
      root.appendChild(predict({ id: "a10-code-2", q: "A sentence grows from 500 to 1,000 tokens. Roughly how many times more scores does one attention head compute?", opts: ["About 2 times as many", "About 4 times as many", "About 10 times as many"], a: 1,
        why: "Every token scores every token, so the count is n × n. Doubling n gives 2 × 2 = 4 times as many scores. That quadratic growth is the price of letting every word look at every other." }));
      root.appendChild(takeaways([
        "Attention for one token: <b>scores</b> (q · k ÷ √d_k), then <b>softmax</b> into weights, then the <b>weighted sum</b> of the values.",
        "Softmax is <code>e^score ÷ total</code>. Subtracting the biggest score first gives the same answer and avoids overflow.",
        "The output is a <b>soft blend</b>: even a dominant token leaves a little weight for the rest.",
        "Every token scores every token, so the work grows as <b>n²</b>.",
      ], "Score every key, softmax into shares, then blend the values by those shares."));
    },
  });
  L["a10-code"] = {
    sum: "Write the two steps at the heart of attention, softmax and the weighted blend, and watch the attention lines thicken as your code runs.",
    steps: [
      { t: "What you will write", b: `<p>Attention for one token is three moves: <b>score</b> every key with <span class="key">q · k ÷ √d_k</span>, turn the scores into weights with <b>softmax</b>, then <b>blend</b> the value vectors by those weights.</p><p>The scoring is written for you. You fill in <b>two blanks</b>: softmax and the blend.</p>`,
        v: F.flow([{ t: "Scores", s: "q · k ÷ √d_k", c: "blue" }, { t: "Blank 1: softmax", s: "scores → weights", c: "amber" }, { t: "Blank 2: blend", s: "Σ weight × value", c: "amber" }]),
        c: { q: "After softmax, what do one token's weights add up to?", o: ["Exactly 1", "The number of tokens", "The biggest raw score"], a: 0, why: "Softmax divides each e^score by the total of all of them, so the shares always sum to 1." } },
      { t: "Reading the picture", b: `<p>Under your code, the sentence is drawn twice. The top row <b>asks</b>; the bottom row <b>answers</b>. A line from the chosen token to each key gets <b>thicker</b> the more weight that key receives.</p><p>Two bar charts show the scores before softmax and the weights after. If a test fails, step through its replay and find the first wrong number.</p>`,
        v: F.compare({ title: "Thick line", c: "blue", body: "that key's value counts for a lot in the blend" }, { title: "Thin line", c: "dim", body: "that key is nearly ignored" }),
        c: { q: "In the picture, a thicker line from \"cat\" to a key means…", o: ["Its value counts for more in the blend", "That word is nearer in the sentence", "Its raw score was the lowest of all"], a: 0, why: "Line thickness is the softmax weight. A bigger weight means that key's value is mixed in more strongly." } },
    ],
    guide: ["Fill the two blanks and pass the tests in the code lab."],
  };
})();
