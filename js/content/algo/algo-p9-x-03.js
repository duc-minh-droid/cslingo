/* js/content/algo/algo-p9-x-03.js: Phase 10 extra lessons: 10.1 Tokens and position, 10.8 Beyond text. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header, fmt } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 10, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, cap, grid, archSvg } = shared;
  reg({
    id: "a10-tokens",
    order: 1,
    num: "10.1",
    title: "Tokens, embeddings and position",
    blurb:
      "How a sentence becomes numbers: split into tokens, look up a vector for each, then add a position signal so word order survives.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const TOK = ["the", "bank", "by", "the", "river", "bank"],
        D = 8;
      const EMB = {
        the: [0.2, -0.1, 0.4, 0.0, 0.1, -0.3, 0.2, 0.1],
        bank: [0.7, 0.5, -0.4, 0.3, -0.6, 0.2, 0.8, -0.1],
        by: [-0.3, 0.2, 0.1, 0.6, 0.0, 0.4, -0.2, 0.3],
        river: [0.6, -0.5, 0.3, -0.2, 0.7, -0.4, 0.1, 0.5],
      };
      const pe = (pos) =>
        Array.from({ length: D }, (_, d) => {
          const i = Math.floor(d / 2),
            a = pos / 10000 ** ((2 * i) / D);
          return d % 2 ? Math.cos(a) : Math.sin(a);
        });
      let usePos = false;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Word embedding + position = model input</h2><span class="faint">8 numbers per token (blue = positive, red = negative)</span></div>
        <div class="controls" id="r"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;align-items:start">
          <div><div class="faint" style="font-weight:800;margin-bottom:4px">Word embedding E (a lookup by word)</div><div id="e"></div></div>
          <div><div class="faint" style="font-weight:800;margin-bottom:4px">Positional encoding P (a lookup by slot)</div><div id="p"></div></div>
          <div><div class="faint" style="font-weight:800;margin-bottom:4px">Model input = E + P</div><div id="s"></div></div></div>
        <div class="stat-row"><div class="stat teal"><small>Distance between the two "the" rows</small><b id="d1"></b></div><div class="stat amber"><small>Distance between the two "bank" rows</small><b id="d2"></b></div></div>
        <div id="note"></div></div>`);
      root.appendChild(card);
      qs("#r", card).append(
        N.seg(
          [
            ["0", "Word embedding only"],
            ["1", "Add the positional encoding"],
          ],
          "0",
          (v) => {
            usePos = v === "1";
            draw();
          },
        ),
      );
      const dist = (a, b) => Math.hypot(...a.map((x, i) => x - b[i]));
      function draw() {
        const E = TOK.map((t) => EMB[t]),
          P = TOK.map((_, i) => pe(i)),
          Sx = E.map((e, i) => e.map((v, d) => v + (usePos ? P[i][d] : 0)));
        const rows = TOK.map((t, i) => `${t} <span style="opacity:.55">(${i})</span>`),
          cols = Array.from({ length: D }, (_, d) => d);
        qs("#e", card).innerHTML = grid(E, { rows, cols });
        qs("#p", card).innerHTML = grid(usePos ? P : P.map((r) => r.map(() => 0)), { rows, cols });
        qs("#s", card).innerHTML = grid(Sx, { rows, cols, lim: 1.5 });
        const dt = dist(Sx[0], Sx[3]),
          db = dist(Sx[1], Sx[5]);
        qs("#d1", card).textContent = dt < 1e-9 ? "0 (identical)" : fmt(+dt.toFixed(2), 2);
        qs("#d2", card).textContent = db < 1e-9 ? "0 (identical)" : fmt(+db.toFixed(2), 2);
        qs("#note", card).innerHTML = usePos
          ? `<div class="callout teal">Now the first and last <b>bank</b> get different inputs because they sit in different slots. The model can tell them apart, and it knows <i>which</i> comes first.</div>`
          : `<div class="callout rose">Without position, the same word always gets the same vector. Shuffle the sentence and the set of input vectors would not change at all.</div>`;
      }
      draw();
      root.appendChild(
        predict({
          id: "a10-tokens-1",
          q: 'With <b>Word embedding only</b>, compare the two rows for "the" (positions 0 and 3). What does the model see?',
          opts: [
            "Identical vectors: nothing says where each one sits",
            "Different vectors, because the model infers the position by itself",
            "Slightly different vectors, because of random noise",
          ],
          a: 0,
          why: "An embedding is a lookup by word, so the same word gives the same row wherever it appears. Attention then has no way to know the order. That is why position is added.",
        }),
      );
      root.appendChild(
        predict({
          id: "a10-tokens-2",
          q: 'Now switch on the <b>positional encoding</b>. What happens to the two "the" rows?',
          opts: [
            "They differ: slot 0 and slot 3 add different position vectors",
            'They stay identical, because both are the word "the"',
            "They are both reset to zero by the encoding",
          ],
          a: 0,
          why: "Input = word embedding + positional encoding. Same word, different slot, so the sums differ, and the distance stat becomes non-zero.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>tokenizer</b> splits text into tokens (words or word pieces); each token has an integer id.",
            "An <b>embedding</b> is a learned lookup: id → vector of d<sub>model</sub> numbers, so similar meanings get nearby vectors.",
            "Attention ignores order by itself, so the model adds a <b>positional encoding</b>: InputEmbedding = WordEmbedding + PositionalEncoding.",
            "The model then sees both <b>meaning</b> (the word embedding) and <b>location</b> (the positional encoding).",
            "Original transformer: stacks of encoder and decoder layers (× N), each with attention, a feed-forward network, residual connections and layer norm.",
          ],
          "Text → tokens → vectors → add position: only then is the sentence ready for attention.",
        ),
      );
    },
  });
  L["a10-tokens"] = {
    sum: "A transformer cannot read letters. Text is split into <b>tokens</b>, each token becomes a <b>vector</b> (embedding), and a <b>positional encoding</b> is added so word order is not lost.",
    steps: [
      {
        t: "How does an LLM work?",
        b: `<p>A large language model is a transformer that has learned, from a huge amount of text, to predict the next token. Every request goes through the same pipeline:</p>`,
        v: F.flow([
          { t: "Text", c: "blue" },
          { t: "Tokens", s: "pieces", c: "violet" },
          { t: "Vectors", s: "+ position", c: "amber" },
          { t: "Transformer", s: "layers of attention", c: "teal" },
          { t: "Next word", s: "probabilities", c: "rose" },
        ]),
        c: {
          q: "What is the very first step of the pipeline?",
          o: ["Split the text into tokens", "Run the attention layers", "Choose the next word"],
          a: 0,
          why: "Models work on numbers. First the text is cut into tokens, then each token is turned into a vector.",
        },
      },
      {
        t: "Tokenizer",
        b: `<p>The <b>tokenizer</b> cuts text into <b>tokens</b> and maps each to an integer id from a fixed vocabulary. A token is often a whole word, but rare words are split into pieces so that nothing is out of vocabulary.</p><p>"I am going to the bank" becomes six tokens.</p>`,
        v:
          F.cells(
            [
              { v: "I", sub: "id 40", c: "blue" },
              { v: "am", sub: "id 589", c: "blue" },
              { v: "going", sub: "id 1016", c: "blue" },
              { v: "to", sub: "id 311", c: "blue" },
              { v: "the", sub: "id 262", c: "blue" },
              { v: "bank", sub: "id 2802", c: "blue" },
            ],
            { size: 62 },
          ) + cap("Illustrative ids. Real vocabularies have tens of thousands of entries."),
        c: {
          q: '"I am going to the bank" is split into whole-word tokens. How many tokens is that?',
          o: ["5", "6", "22"],
          a: 1,
          why: "I, am, going, to, the, bank: six tokens. (22 would be counting characters including spaces.)",
        },
      },
      {
        t: "Embedding: a vector per token",
        b: `<p>Each token id picks out a row of a big learned table: its <b>embedding</b>, a vector of $d_{\\text{model}}$ numbers (512 in the original paper). Words used in similar ways end up with nearby vectors. The table is learned during training like any other weights.</p>`,
        v:
          table(
            ["token id", "embedding (first 4 of d<sub>model</sub> numbers)"],
            [
              ["40 (I)", "[0.12, −0.40, 0.05, 0.77, …]"],
              ["589 (am)", "[−0.31, 0.22, 0.64, −0.10, …]"],
              ["2802 (bank)", "[0.70, 0.50, −0.40, 0.30, …]"],
            ],
          ) + cap("The table has one row per token in the vocabulary."),
        c: {
          q: "A vocabulary of 1,000 tokens and d<sub>model</sub> = 64. How many numbers are in the embedding table?",
          o: ["1,064", "64,000", "640"],
          a: 1,
          hint: "One row of 64 numbers for each of the 1,000 tokens.",
          why: "1,000 rows × 64 numbers = 64,000.",
        },
      },
      {
        t: "Positional encoding",
        b: `<p>Attention compares every token with every other one, but it does not know <i>where</i> a token is. "Dog bites man" and "man bites dog" would give the same set of vectors. So each token's input is</p><span class="key">InputEmbedding = WordEmbedding + PositionalEncoding</span><p>The original paper builds the positional vector from sines and cosines of different frequencies, so every slot gets a unique pattern. The model sees <b>semantic meaning</b> (the word) and <b>location</b> (the slot).</p>`,
        v: F.plot(
          [
            { f: (p) => Math.sin(p), c: "blue", label: "fast dimension" },
            { f: (p) => Math.sin(p / 10), c: "teal", label: "medium" },
            { f: (p) => Math.sin(p / 100), c: "amber", label: "slow" },
          ],
          { x: [0, 30], y: [-1.2, 1.2], xl: "position in the sentence", h: 170 },
        ),
        c: {
          q: "Two copies of the same word appear in different positions. How do their model inputs compare?",
          o: [
            "Different, because the positional encodings differ",
            "Identical, because the word is the same",
            "Different only if the sentence has more than 10 words",
          ],
          a: 0,
          why: "Word embedding + position: the first term matches, the second does not, so the sums differ.",
        },
      },
      {
        t: "The whole picture",
        b: `<p>The original transformer has two stacks. The <b>encoder</b> reads the input sentence. The <b>decoder</b> writes the output sentence so far, one word at a time. Each stack repeats a layer $N$ times. The next modules open up each box.</p>`,
        v: archSvg(["e0", "e1", "d0", "d1"]),
        c: {
          q: "In the diagram the input tokens first pass through…",
          o: [
            "The embedding and positional encoding",
            "The feed-forward network of a layer",
            "The final softmax at the output",
          ],
          a: 0,
          why: "Tokens are turned into vectors (embedding) and given a position before any attention layer sees them.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>Six tokens, each with an 8-number embedding. The three tables show the word embedding $E$, the positional encoding $P$ and the sum. Tick on the positional encoding and watch the distance stats: repeated words stop being identical.</p>`,
        v: F.cells([
          { v: "E", sub: "meaning", c: "blue" },
          "+",
          { v: "P", sub: "position", c: "amber" },
          "=",
          { v: "input", sub: "to the model", c: "teal" },
        ]),
      },
    ],
    guide: [
      "Leave it on <b>Word embedding only</b>. Compare the two rows for <b>the</b> and the two rows for <b>bank</b>.",
      "Switch to <b>Add the positional encoding</b>. Which stats change from 0 to a number?",
      "Look at the positional encoding table: how do the rows change from position 0 to position 5?",
      "Answer the questions after the demo.",
    ],
  };

  reg({
    id: "a10-uses",
    order: 8,
    num: "10.8",
    title: "Beyond text: where transformers are used",
    blurb:
      "Language, images and sound all become sequences of tokens. Cut a picture into patches and count the cost of attention.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let p = 16;
      const card =
        el(`<div class="card"><div class="card-head"><h2>A picture as tokens (Vision Transformer)</h2><span class="faint">224 × 224 pixel image cut into square patches; each patch becomes one token</span></div>
        <div class="controls" id="r"></div>
        <canvas class="viz" id="cv"></canvas>
        <div class="stat-row"><div class="stat teal"><small>Patch size</small><b id="s0"></b></div><div class="stat amber"><small>Tokens (patches)</small><b id="s1"></b></div><div class="stat violet"><small>Attention scores (tokens²)</small><b id="s2"></b></div></div>
        <div id="note"></div></div>`);
      root.appendChild(card);
      qs("#r", card).append(
        N.seg(
          [
            ["8", "8 × 8 patches"],
            ["16", "16 × 16"],
            ["32", "32 × 32"],
            ["56", "56 × 56"],
          ],
          "16",
          (v) => {
            p = +v;
            draw();
          },
        ),
      );
      function draw() {
        const { ctx, w } = N.setupCanvas(qs("#cv", card), Math.min(300, qs("#cv", card).clientWidth || 300));
        const side = w,
          s = side / 224;
        if (w >= 40) {
          ctx.clearRect(0, 0, w, side);
          ctx.fillStyle = "#8fd3ff";
          ctx.fillRect(0, 0, side, side);
          ctx.fillStyle = "#58cc02";
          ctx.beginPath();
          ctx.moveTo(0, 180 * s);
          ctx.quadraticCurveTo(110 * s, 110 * s, 224 * s, 170 * s);
          ctx.lineTo(224 * s, 224 * s);
          ctx.lineTo(0, 224 * s);
          ctx.fill();
          ctx.fillStyle = "#ffc800";
          ctx.beginPath();
          ctx.arc(170 * s, 50 * s, 26 * s, 0, 7);
          ctx.fill();
          ctx.fillStyle = "#ff9600";
          ctx.fillRect(50 * s, 120 * s, 50 * s, 40 * s);
          ctx.fillStyle = "#e0564c";
          ctx.beginPath();
          ctx.moveTo(44 * s, 120 * s);
          ctx.lineTo(75 * s, 92 * s);
          ctx.lineTo(106 * s, 120 * s);
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,.45)";
          ctx.lineWidth = 1;
          for (let g = 0; g <= 224; g += p) {
            ctx.beginPath();
            ctx.moveTo(g * s, 0);
            ctx.lineTo(g * s, side);
            ctx.moveTo(0, g * s);
            ctx.lineTo(side, g * s);
            ctx.stroke();
          }
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#000";
          ctx.font = "800 12px sans-serif";
          ctx.textAlign = "center";
          if (p >= 32)
            for (let r = 0; r < 224 / p; r++)
              for (let c = 0; c < 224 / p; c++)
                ctx.fillText(r * (224 / p) + c + 1, (c + 0.5) * p * s, (r + 0.5) * p * s + 4);
        }
        const n = (224 / p) ** 2;
        qs("#s0", card).textContent = p + " × " + p;
        qs("#s1", card).textContent = n.toLocaleString();
        qs("#s2", card).textContent = (n * n).toLocaleString();
        qs("#note", card).innerHTML =
          `<div class="callout">Each patch is flattened into a vector, given a position, and fed in like a word. Halving the patch size gives <b>4× the tokens</b> and <b>16× the attention work</b>.</div>`;
      }
      life.onResize(draw);
      draw();
      root.appendChild(
        predict({
          id: "a10-uses-1",
          q: "The picture is cut into 16 × 16 patches. How many tokens does the transformer receive?",
          opts: ["196, a 14 × 14 grid", "224, the side of the image", "256, a 16 × 16 grid"],
          a: 0,
          why: "224 / 16 = 14 patches along each side, and 14 × 14 = 196 tokens. Check with the demo.",
        }),
      );
      root.appendChild(
        predict({
          id: "a10-uses-2",
          q: "Switch from 16 × 16 patches to 8 × 8 patches. What happens to the number of attention scores?",
          opts: ["About 16 times as many", "About 4 times as many", "Twice as many"],
          a: 0,
          why: "Patches go from 196 to 784 (×4), and attention scores are tokens², so ×16 (38,416 → 614,656).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Anything that can be cut into a sequence of tokens can use a transformer.",
            "<b>NLP</b>: language understanding, language generation, translation. <b>Computer vision</b>: Vision Transformers (ViT), object detection, image generation. <b>Audio and speech</b>.",
            "A ViT cuts an image into <b>patches</b>; each patch is one token (224/16 = 14, so 14² = 196 tokens).",
            "Attention cost is quadratic in the number of tokens: smaller patches mean far more work.",
          ],
          "Same machine, different tokens: words, patches or sound slices.",
        ),
      );
    },
  });
  L["a10-uses"] = {
    sum: "Transformers work on any sequence of tokens: words, image patches or slices of sound. The encoder reads, the decoder writes, and the cost grows with the square of the length.",
    steps: [
      {
        t: "Three shapes of transformer",
        b: `<p>The same building blocks are arranged in three ways, depending on the job:</p>`,
        v: table(
          ["Arrangement", "Job", "Example tasks"],
          [
            ["Encoder only", "understand an input", "classifying text, tagging words"],
            ["Decoder only", "generate text", "chat, code generation"],
            ["Encoder + decoder", "turn one sequence into another", "translation, summarisation (T5, mT5)"],
          ],
        ),
        c: {
          q: "Translating English to German with the original transformer uses…",
          o: ["Both an encoder and a decoder", "Only an encoder", "Neither: translation needs a different model"],
          a: 0,
          why: "The encoder reads the English; the decoder writes the German, with cross-attention linking them.",
        },
      },
      {
        t: "Natural language processing",
        b: `<p>Language is where transformers started: <b>language understanding</b> (what does this text mean?), <b>language generation</b> (write the next words) and <b>translation</b>. Large language models are decoder stacks trained to predict the next token on enormous amounts of text.</p>`,
        v: F.cells(
          [
            { v: "understand", c: "blue" },
            { v: "generate", c: "teal" },
            { v: "translate", c: "violet" },
          ],
          { size: 92 },
        ),
        c: {
          q: 'A model asked to continue "Once upon a" is doing…',
          o: ["Language generation", "Language understanding only", "Image classification"],
          a: 0,
          why: "It predicts the next tokens one at a time, which is generation.",
        },
      },
      {
        t: "Pictures as patches",
        b: `<p>A <b>Vision Transformer (ViT)</b> cuts the picture into square patches, flattens each patch to a vector and treats the patches as a sentence. A 224 × 224 image in 16 × 16 patches is $14\\times14=196$ tokens. Uses: image recognition, <b>object detection</b> and <b>image generation</b>.</p>`,
        v: F.cells(
          [
            { v: "image", sub: "224 × 224", c: "blue" },
            "→",
            { v: "196 patches", sub: "16 × 16 each", c: "amber" },
            "→",
            { v: "tokens", sub: "+ position", c: "violet" },
            "→",
            { v: "transformer", c: "teal" },
          ],
          { size: 70 },
        ),
        c: {
          q: "A 64 × 64 image is cut into 16 × 16 patches. How many tokens?",
          o: ["16", "4", "256"],
          a: 0,
          hint: "64 / 16 patches along each side.",
          why: "4 patches along each side, 4 × 4 = 16 tokens.",
        },
      },
      {
        t: "Audio and speech",
        b: `<p>Sound can be tokenised too. Recall that the FFT turns a short slice of audio into a spectrum: stack the spectra of consecutive slices to make a <b>spectrogram</b>, and cut it into frames or patches. Speech recognition and audio generation models then process these frames as a sequence.</p>`,
        v: F.flow([
          { t: "Sound", c: "blue" },
          { t: "FFT slices", s: "Phase 9", c: "violet" },
          { t: "Spectrogram", s: "frames", c: "amber" },
          { t: "Transformer", c: "teal" },
        ]),
        c: {
          q: "Which tool from earlier in the course turns a slice of sound into frequency information?",
          o: ["The FFT", "Huffman coding", "Dijkstra's algorithm"],
          a: 0,
          why: "The FFT gives the spectrum of each slice; stacking them gives a spectrogram.",
        },
      },
      {
        t: "The price of length",
        b: `<p>Every token attends to every token, so doubling the number of tokens quadruples the attention work. That is why high-resolution images (many small patches) and very long documents are expensive.</p>`,
        v: table(
          ["Patch size", "Tokens", "Attention scores"],
          [
            ["56 × 56", "16", "256"],
            ["32 × 32", "49", "2,401"],
            { c: ["16 × 16", "196", "38,416"], hl: true },
            ["8 × 8", "784", "614,656"],
          ],
        ),
        c: {
          q: "The number of tokens triples. By what factor does the attention score matrix grow?",
          o: ["9", "3", "27"],
          a: 0,
          why: "Scores = tokens², and 3² = 9.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>Pick a patch size and watch the grid, the number of tokens and the number of attention scores. Patch numbers show on the larger patches.</p>`,
        v: F.cells([
          { v: "56", sub: "16 tokens", c: "teal" },
          "→",
          { v: "16", sub: "196", c: "amber" },
          "→",
          { v: "8", sub: "784", c: "rose" },
        ]),
      },
    ],
    guide: [
      "Start at <b>16 × 16</b> and read the token count. Does it match 14 × 14?",
      "Step to <b>8 × 8</b>. Compare the two <i>attention scores</i> numbers.",
      "Step to <b>56 × 56</b>: the patches get large enough to number. How many?",
      "Answer the questions after the demo.",
    ],
  };
})();
