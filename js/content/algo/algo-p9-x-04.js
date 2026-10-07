/* js/content/algo/algo-p9-x-04.js: Phase 10 extra lessons: 10.7 The decoder. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 10, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { cap, softmax, archSvg } = shared;
  const STEPS = [
    { ctx: "<sos>", words: ["Ich", "Wir", "Das", "Es"], logits: [4, 2.5, 1.5, 1] },
    { ctx: "<sos> Ich", words: ["habe", "esse", "bin", "werde"], logits: [3.5, 3, 2, 1] },
    { ctx: "<sos> Ich habe", words: ["einen", "eine", "den", "meinen"], logits: [3.5, 2.5, 1.5, 0.5] },
    { ctx: "<sos> Ich habe einen", words: ["Apfel", "Kuchen", "Hund", "Tisch"], logits: [4, 2.5, 1.5, 1] },
    {
      ctx: "<sos> Ich habe einen Apfel",
      words: ["gegessen", "gesehen", "gekauft", "genommen"],
      logits: [4, 2.5, 2, 1],
    },
    { ctx: "<sos> Ich habe einen Apfel gegessen", words: ["<eos>", ".", "und", "dann"], logits: [5, 1, 0.5, 0] },
  ];
  const OUT = ["Ich", "habe", "einen", "Apfel", "gegessen", "<eos>"];
  function decRun(box, life) {
    const maskHtml = (n, row) =>
      `<table class="t" style="font-size:11.5px;text-align:center;display:inline-table"><tr><th></th>${["<sos>", ...OUT.slice(0, n - 1)].map((w) => `<th>${w}</th>`).join("")}</tr>${Array.from({ length: n }, (_, i) => `<tr><th>${["<sos>", ...OUT][i]}</th>${Array.from({ length: n }, (_, j) => `<td style="background:${j <= i ? (i === row ? "rgba(88,204,2,.5)" : "rgba(88,204,2,.18)") : "rgba(128,128,128,.25)"};${j > i ? "color:transparent" : ""}">${j <= i ? "✓" : "x"}</td>`).join("")}</tr>`).join("")}</table>`;
    const chip = (w, k, on) =>
      `<span class="dc-w" data-k="${k}" style="display:inline-block;margin:3px 6px 3px 0;padding:4px 10px;border:2px solid ${on ? "var(--teal)" : "var(--line-2)"};border-radius:10px;background:var(--panel-2);font:800 12.5px var(--sans)">${w}</span>`;
    function* frames() {
      for (let t = 0; t < 6; t++) {
        const st = STEPS[t],
          p = softmax(st.logits),
          best = p.indexOf(Math.max(...p)),
          n = t + 1;
        yield {
          cap: `<b>Step ${t + 1}.</b> Feed the decoder: <b>${st.ctx}</b>. Masked attention lets each token see only itself and the tokens before it (green).`,
          html: `<div style="margin-bottom:6px"><b>Output so far:</b> ${st.ctx}</div>${maskHtml(n, n - 1)}<div style="margin-top:8px">Candidates: ${st.words.map((w, k) => chip(w, w, false)).join("")}</div>`,
        };
        yield {
          cap: `The last position's vector goes through a linear layer and softmax over the whole vocabulary. Most likely next word: <b>${st.words[best]}</b> (${p[best].toFixed(2)}). Append it and go round again.`,
          ask:
            t === 2
              ? {
                  q: 'After "<sos> Ich habe" the decoder scores the candidates. Which does it pick as most likely? Tap it.',
                  pick: ".dc-w",
                  a: [st.words[best]],
                  why: `"${st.words[best]}" has the highest score (${p[best].toFixed(2)} after softmax): "I have a…" needs an article.`,
                }
              : null,
          mood: t === 5 ? "love" : undefined,
          html: `<div style="margin-bottom:6px"><b>Output so far:</b> ${st.ctx}</div><div>${F.bars(
            st.words.map((w, k) => [w, p[k], k === best ? "teal" : "dim"]),
            { max: 1, fmt: (v) => v.toFixed(2) },
          )}</div>${t === 5 ? `<div class="callout teal" style="margin-top:8px">&lt;eos&gt; means "end of sequence": generation stops. Final sentence: <b>Ich habe einen Apfel gegessen</b>.</div>` : ""}`,
        };
      }
    }
    F.run(box, life, {
      build(stage) {
        stage.style.minHeight = "300px";
        const host = el(`<div style="padding:6px;line-height:1.6"></div>`);
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
    id: "a10-decoder",
    order: 7,
    num: "10.7",
    title: "The decoder: one word at a time",
    blurb:
      "How a transformer writes: masked attention, a probability for every next word, and the temperature that decides how adventurous it is.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let step = 0,
        temp = 1,
        seed = 5;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
      const card =
        el(`<div class="card"><div class="card-head"><h2>Next-word probabilities</h2><span class="faint">toy scores for translating "I have eaten an apple" into German</span></div>
        <div class="controls" id="r"></div><div class="controls" id="r2"></div>
        <div id="ctx" style="margin:6px 0;font-weight:800"></div><div id="bars"></div>
        <div class="stat-row"><div class="stat teal"><small>Most likely word</small><b id="s1"></b></div><div class="stat amber"><small>Its probability</small><b id="s2"></b></div><div class="stat violet"><small>Last random draw</small><b id="s3">–</b></div></div>
        <div id="draws"></div><div id="note"></div></div>`);
      root.appendChild(card);
      qs("#r", card).append(
        N.seg(
          STEPS.map((_, i) => [String(i), "Step " + (i + 1)]),
          "0",
          (v) => {
            step = +v;
            qs("#s3", card).textContent = "–";
            qs("#draws", card).innerHTML = "";
            draw();
          },
        ),
      );
      const st = N.slider("Temperature (scores ÷ T)", 0.3, 3, 0.1, temp, (v) => fmt(v, 1));
      st.onInput((v) => {
        temp = v;
        draw();
      });
      const b1 = el(`<button class="btn small primary">Draw one word</button>`),
        b2 = el(`<button class="btn small">Draw 1000 words</button>`);
      qs("#r2", card).append(st, b1, b2);
      const probs = () => softmax(STEPS[step].logits.map((v) => v / temp));
      const pick = (p) => {
        let x = rnd(),
          a = 0;
        for (let i = 0; i < p.length; i++) {
          a += p[i];
          if (x < a) return i;
        }
        return p.length - 1;
      };
      b1.onclick = () => {
        const p = probs();
        qs("#s3", card).textContent = STEPS[step].words[pick(p)];
      };
      b2.onclick = () => {
        const p = probs(),
          c = p.map(() => 0);
        for (let i = 0; i < 1000; i++) c[pick(p)]++;
        qs("#draws", card).innerHTML =
          `<p class="faint" style="margin:6px 0 2px">1000 draws: ${STEPS[step].words.map((w, i) => `${w} ${c[i]}`).join(" · ")}</p>`;
      };
      function draw() {
        const s = STEPS[step],
          p = probs(),
          best = p.indexOf(Math.max(...p));
        qs("#ctx", card).innerHTML = `Context: <span class="mono">${s.ctx.replace(/</g, "&lt;")}</span> → next word?`;
        qs("#bars", card).innerHTML = F.bars(
          s.words.map((w, i) => [w.replace(/</g, "&lt;"), p[i], i === best ? "teal" : "violet"]),
          { max: 1, fmt: (v) => v.toFixed(2) },
        );
        qs("#s1", card).textContent = s.words[best].replace(/</g, "<");
        qs("#s2", card).textContent = p[best].toFixed(2);
        qs("#note", card).innerHTML =
          temp <= 0.6
            ? `<div class="callout teal"><b>Low temperature:</b> sharp. The top word almost always wins, so the text is safe and repetitive.</div>`
            : temp >= 2
              ? `<div class="callout rose"><b>High temperature:</b> flat. Unlikely words get a real chance, so the text gets creative and then nonsensical.</div>`
              : "";
      }
      draw();
      root.appendChild(
        predict({
          id: "a10-decoder-1",
          q: 'Step 1, temperature 1. Now drag the temperature up to 3. What happens to the probability of the top word "Ich"?',
          opts: [
            "It falls, as the distribution flattens",
            "It rises towards 1 as the scores spread",
            "It stays exactly the same at any temperature",
          ],
          a: 0,
          why: "Dividing the scores by a bigger T shrinks the gaps between them, so softmax spreads the probability out. Low T does the opposite.",
        }),
      );
      root.appendChild(
        predict({
          id: "a10-decoder-2",
          q: 'Press <b>Draw 1000 words</b> at Step 1 and temperature 1. About how often should "Wir" come up?',
          opts: [
            "Around 1 time in 5 (a bit under 200 of 1000)",
            'Never, since "Ich" is the top word',
            "Around 1 time in 2 (about 500 of 1000)",
          ],
          a: 0,
          why: 'Sampling follows the probabilities, not just the top choice. "Wir" has probability ≈ 0.17, so about 170 of 1000 draws. Picking the top word every time is called greedy decoding.',
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Use a <b>decoder</b> when the model must <b>generate</b>: translation, summarisation, dialogue, code, text-to-text tasks (T5, mT5).",
            "Generation is a loop: start from <b>&lt;sos&gt;</b>, predict the next token, append it, repeat until <b>&lt;eos&gt;</b>.",
            "<b>Masked self-attention</b> adds a mask M to QKᵀ so a position cannot see later positions (their weights become 0).",
            "A second sublayer, <b>cross-attention</b>, takes queries from the decoder and keys and values from the encoder's output.",
            "A final linear layer and softmax turn the last vector into a probability for every word in the vocabulary. <b>Temperature</b> sharpens or flattens them.",
          ],
          "A decoder writes by repeatedly predicting one next word and feeding it back in.",
        ),
      );
    },
  });
  L["a10-decoder"] = {
    sum: "The decoder <b>generates</b> text one token at a time: masked self-attention over what it has written, cross-attention to the encoder, then a softmax over the vocabulary.",
    steps: [
      {
        t: "When do you need a decoder?",
        b: `<p>Use a decoder when the model must <b>generate</b> something new, one piece after another:</p><p>translation, summarisation, dialogue, code generation, and text-to-text models such as T5 and mT5.</p>`,
        v: F.cells(
          [
            { v: "Translate", c: "blue" },
            { v: "Summarise", c: "violet" },
            { v: "Dialogue", c: "teal" },
            { v: "Code", c: "amber" },
            { v: "T5 / mT5", c: "rose" },
          ],
          { size: 76 },
        ),
        c: {
          q: "Which job most clearly needs a decoder?",
          o: [
            "Writing a summary of an article",
            "Deciding whether a sentence is a question",
            "Counting the words in a sentence",
          ],
          a: 0,
          why: "Summarising produces new text. A yes/no decision about existing text only needs to read it.",
        },
      },
      {
        t: "One word at a time",
        b: `<p>At inference time the decoder starts with a special start token <b>&lt;sos&gt;</b>. It predicts the next word, appends it to its own input, and goes round again, until it produces the end token <b>&lt;eos&gt;</b>.</p>`,
        v: F.frames([
          { t: "start", v: "<b>&lt;sos&gt;</b>" },
          { t: "after 1", v: "&lt;sos&gt; <b>Ich</b>" },
          { t: "after 2", v: "&lt;sos&gt; Ich <b>habe</b>" },
          { t: "after 5", v: "… <b>gegessen</b>" },
          { t: "after 6", v: "… <b>&lt;eos&gt;</b>" },
        ]),
        c: {
          q: 'The decoder writes "Ich habe einen Apfel gegessen" and then &lt;eos&gt;. How many next-token predictions does that take?',
          o: ["6", "1", "5"],
          a: 0,
          why: "One prediction per output token: five words plus &lt;eos&gt; = 6, each fed back in as input.",
        },
      },
      {
        t: "Masked self-attention",
        b: `<p>While it writes, the decoder must not look at words that do not exist yet. In <b>masked multi-head attention</b> a mask $M$ is added to the score matrix, with $-\\infty$ above the diagonal:</p>$$\\operatorname{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d_k}}+M\\right)V$$<p>After softmax the blocked cells are exactly 0. This also lets training process a whole sentence in parallel without cheating.</p>`,
        v: `<svg class="fig" viewBox="0 0 300 170" style="max-height:170px">${[0, 1, 2, 3, 4, 5].map((r) => [0, 1, 2, 3, 4, 5].map((c) => `<rect x="${60 + c * 30}" y="${12 + r * 25}" width="26" height="21" rx="4" fill="${c > r ? "rgba(128,128,128,.3)" : "rgba(88,204,2,.45)"}" stroke="var(--line)" class="fi"/>`).join("")).join("")}<text x="150" y="168" class="fig-sub">grey = blocked (−∞ → weight 0)</text></svg>`,
        c: {
          q: "A sentence has 6 tokens. How many cells of the 6 × 6 score matrix does the causal mask block?",
          o: ["15", "6", "21"],
          a: 0,
          hint: "Count the cells above the diagonal: 5 + 4 + 3 + 2 + 1.",
          why: "Row 1 blocks 5, row 2 blocks 4, … : 5+4+3+2+1 = 15. (21 is the allowed cells including the diagonal.)",
        },
      },
      {
        t: "Cross-attention",
        b: `<p>The decoder's second attention sublayer connects it to the input sentence. Its <b>queries</b> come from the decoder, but the <b>keys and values</b> come from the encoder's output. So each German word being written can look back at the English words and decide which to translate next.</p>`,
        v: archSvg(["d3", "e5"]),
        c: {
          q: "In cross-attention, where do the keys and values come from?",
          o: ["The encoder's output", "The decoder's own previous words", "The positional encoding"],
          a: 0,
          why: "Queries from the decoder, keys and values from the encoder: the decoder asks questions about the input.",
        },
      },
      {
        t: "From a vector to a word",
        b: `<p>The top of the decoder is a <b>linear layer</b> that produces one score for every word in the vocabulary, then <b>softmax</b> makes them probabilities. The model can pick the top word (<b>greedy</b>) or draw randomly in proportion to the probabilities. Dividing the scores by a <b>temperature</b> first makes the choice safer (low) or more adventurous (high).</p>`,
        v:
          F.bars(
            [
              ["Ich", 0.74, "teal"],
              ["Wir", 0.17, "violet"],
              ["Das", 0.06, "violet"],
              ["Es", 0.04, "violet"],
            ],
            { max: 1, fmt: (v) => v.toFixed(2) },
          ) + cap("One probability for every word in the vocabulary (a few shown)."),
        c: {
          q: "The vocabulary has 32,000 tokens. How many scores does the final linear layer produce for the next position?",
          o: ["32,000", "1", "512"],
          a: 0,
          why: "One score (logit) per vocabulary entry, then softmax over all of them.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>The decoder writes a German translation of "I have eaten an apple". Each step feeds the output so far, shows which positions masked attention may use, then picks the next word from the probabilities (toy scores). It pauses once for a prediction.</p>`,
        v: (box, life) => decRun(box, life),
      },
      {
        t: "Reading the playground",
        b: `<p>Pick a step to see the probabilities for the next word. <b>Temperature</b> flattens or sharpens them, and the draw buttons sample from the distribution, which is how chatbots vary their replies.</p>`,
        v: F.cells([
          { v: "scores", c: "blue" },
          "→",
          { v: "÷ T", c: "violet" },
          "→",
          { v: "softmax", c: "amber" },
          "→",
          { v: "draw", c: "teal" },
        ]),
      },
    ],
    guide: [
      "Look at <b>Step 1</b>. Which word is most likely and with what probability?",
      "Drag the temperature to 0.3, then to 3. Watch the bars and the notes.",
      "Press <b>Draw 1000 words</b> at temperature 1, then at 0.3. How do the counts differ?",
      "Answer the questions after the demo.",
    ],
  };
})();
