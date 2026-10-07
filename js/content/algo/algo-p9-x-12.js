/* js/content/algo/algo-p9-x-12.js: Phase 10 extra lessons (overflow): 10.5 Multi-head attention. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig,
    S = "algo";
  const reg = (m) => N.register({ subject: S, lecture: 10, ...m });
  const shared = (NIC.shared.algoX = NIC.shared.algoX || {});
  const { table, softmax, grid } = shared;
  reg({
    id: "a10-heads",
    order: 5,
    num: "10.5",
    title: "Multi-head attention",
    blurb:
      "Several attention heads run side by side, each free to look for a different relationship, then their results are joined.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const TK = ["The", "animal", "didn't", "cross", "the", "street", "because", "it"],
        n = TK.length;
      const mk = (f) => Array.from({ length: n }, (_, i) => softmax(Array.from({ length: n }, (_, j) => f(i, j))));
      const HEADS = [
        { name: "Head 1: pronoun → noun", A: mk((i, j) => (i === 7 && j === 1 ? 6 : i === j ? 2 : 0)) },
        { name: "Head 2: previous word", A: mk((i, j) => (j === i - 1 ? 5 : i === 0 && j === 0 ? 5 : 0)) },
        {
          name: "Head 3: same word type",
          A: mk((i, j) => (TK[i].toLowerCase() === TK[j].toLowerCase() && i !== j ? 6 : i === j ? 2 : 0)),
        },
        {
          name: "Head 4: noun ↔ verb",
          A: mk((i, j) =>
            (i === 1 && j === 3) || (i === 3 && j === 1) || (i === 5 && j === 3) || (i === 3 && j === 5)
              ? 5
              : i === j
                ? 1.5
                : 0,
          ),
        },
      ];
      let dm = 512,
        h = 8,
        view = 0;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Four heads, four jobs</h2><span class="faint">rows = the token asking, columns = the token looked at; each row adds to 1</span></div>
        <div class="controls" id="r"></div><div id="hm"></div>
        <h3 style="margin:16px 0 6px">The shapes inside one layer</h3>
        <div class="controls" id="r2"></div><div id="shp"></div></div>`);
      root.appendChild(card);
      qs("#r", card).append(
        N.seg(
          [
            ["0", "Head 1"],
            ["1", "Head 2"],
            ["2", "Head 3"],
            ["3", "Head 4"],
            ["4", "Average of all four"],
          ],
          "0",
          (v) => {
            view = +v;
            draw();
          },
        ),
      );
      qs("#r2", card).append(
        N.seg(
          [
            ["64", "d_model = 64"],
            ["512", "d_model = 512"],
          ],
          "512",
          (v) => {
            dm = +v;
            draw();
          },
        ),
        N.seg(
          [
            ["1", "1 head"],
            ["2", "2 heads"],
            ["4", "4 heads"],
            ["8", "8 heads"],
          ],
          "8",
          (v) => {
            h = +v;
            draw();
          },
        ),
      );
      function draw() {
        const A =
          view < 4
            ? HEADS[view].A
            : HEADS[0].A.map((row, i) => row.map((_, j) => HEADS.reduce((s, hd) => s + hd.A[i][j], 0) / 4));
        qs("#hm", card).innerHTML =
          `<p style="margin:0 0 4px;font-weight:800">${view < 4 ? HEADS[view].name : "Average of the four heads: the sharp patterns blur together"}</p>` +
          grid(A, { rows: TK, cols: TK, lim: 1, digits: 2 })
            .replace(/rgba\(255,75,75/g, "rgba(88,204,2")
            .replace(/rgba\(28,176,246/g, "rgba(88,204,2");
        const dh = dm / h;
        qs("#shp", card).innerHTML = table(
          ["", "value"],
          [
            ["Per-head size d<sub>h</sub> = d<sub>model</sub> / h", `<b>${dm} / ${h} = ${dh}</b>`],
            ["Each head's W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>", `${dm} × ${dh}`],
            ["Each head's output Z<sub>i</sub> (T tokens)", `T × ${dh}`],
            ["Concatenate all ${h} heads".replace("${h}", h), `T × (${h} × ${dh}) = T × ${dm}`],
            {
              c: [
                "Attention parameters per layer (W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>, W<sub>O</sub>)",
                `4 × ${dm}² = <b>${(4 * dm * dm).toLocaleString()}</b>, whatever h is`,
              ],
              hl: true,
            },
          ],
        );
      }
      draw();
      root.appendChild(
        predict({
          id: "a10-heads-1",
          q: "d<sub>model</sub> = 512 with h = 8 heads. How many numbers does each head's query vector hold?",
          opts: ["64", "8", "512"],
          a: 0,
          hint: "d_h = d_model / h",
          why: "Each head gets a slice: 512 / 8 = <b>64</b> numbers. Eight of them concatenated give back 512.",
        }),
      );
      root.appendChild(
        predict({
          id: "a10-heads-2",
          q: "With d<sub>model</sub> fixed, switch from 1 head to 8 heads. What happens to the layer's attention parameters?",
          opts: [
            "Unchanged: the heads share out the same d_model",
            "Eight times as many, since each head has its own matrices",
            "Eight times fewer, because each head is smaller",
          ],
          a: 0,
          why: "Each of the 8 heads has matrices of size d_model × (d_model/8), so together they hold exactly as many numbers as one big head. Multi-head costs no extra parameters; it buys variety.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "One attention head produces one set of weights. <b>Multi-head attention</b> runs h heads in parallel, each with its own W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>.",
            "Each head works in a smaller space: <b>d<sub>h</sub> = d<sub>model</sub> / h</b>.",
            "The head outputs (T × d<sub>h</sub> each) are <b>concatenated</b> back to T × d<sub>model</sub> and mixed by one more matrix W<sub>O</sub>.",
            "Different heads can attend to different relationships at the same time (previous word, pronoun to noun, and so on).",
            "Splitting into heads does not add parameters; it adds variety.",
          ],
          "Many small attentions, side by side, then glued together.",
        ),
      );
    },
  });
  L["a10-heads"] = {
    sum: "A single attention head can only form one pattern of weights. <b>Multi-head attention</b> runs several heads in parallel, each in a smaller space, and concatenates their outputs.",
    steps: [
      {
        t: "Why one head is not enough",
        b: `<p>In "The animal didn't cross the street because it was too tired", the word <i>it</i> must find its noun, but a word also relates to the word before it, to its verb, to repeated words. One softmax gives one blend of weights, which is a compromise between these needs.</p><p>The fix is to let the model look several ways at once.</p>`,
        v: F.cells(
          [
            { v: "it → animal", sub: "who?", c: "violet" },
            { v: "it → because", sub: "grammar", c: "teal" },
            { v: "it → previous", sub: "order", c: "amber" },
          ],
          { size: 92 },
        ),
        c: {
          q: "What is the main reason for using several heads?",
          o: [
            "Different heads can capture different relationships at once",
            "To make the softmax step much faster to compute, as exponentials grow",
            "To remove the need for any positional encoding",
          ],
          a: 0,
          why: "Each head has its own projections, so each can specialise in a different pattern.",
        },
      },
      {
        t: "Split the work into h heads",
        b: `<p>Each head $i$ has its own matrices $W_{Q,i},W_{K,i},W_{V,i}\\in\\mathbb{R}^{d_{\\text{model}}\\times d_h}$ with</p>$$d_h=\\frac{d_{\\text{model}}}{h}$$<p>For $d_{\\text{model}}=512$ and $h=8$, every head works with 64-number queries, keys and values. The input embeddings are shared by all heads.</p>`,
        v: table(
          ["d<sub>model</sub>", "heads h", "d<sub>h</sub> = d<sub>model</sub> / h"],
          [
            ["512", "8", "64"],
            ["512", "1", "512"],
            ["64", "4", "16"],
          ],
        ),
        c: {
          q: "d<sub>model</sub> = 64 and h = 4. What is d<sub>h</sub>?",
          o: ["16", "4", "256"],
          a: 0,
          why: "64 / 4 = 16 numbers per head.",
        },
      },
      {
        t: "Run in parallel, then concatenate",
        b: `<p>Every head runs the normal attention and returns $Z_i\\in\\mathbb{R}^{T\\times d_h}$. The $h$ outputs are glued side by side (<b>concatenated</b>) into $T\\times d_{\\text{model}}$, and one last matrix $W_O$ mixes the heads together. The output is the same shape as the input, ready for the next layer.</p>`,
        v: F.cells(
          [
            { v: "Z₁", sub: "T × 64", c: "violet" },
            { v: "Z₂", sub: "T × 64", c: "teal" },
            { v: "…", c: "dim" },
            { v: "Z₈", sub: "T × 64", c: "amber" },
            "→",
            { v: "concat", sub: "T × 512", c: "blue" },
            "→",
            { v: "× W_O", sub: "T × 512", c: "rose" },
          ],
          { size: 62 },
        ),
        c: {
          q: "8 heads each return T × 64. What shape is the concatenation?",
          o: ["T × 512", "T × 64", "8T × 64"],
          a: 0,
          why: "Side by side: 8 × 64 = 512 columns for each of the T rows.",
        },
      },
      {
        t: "Heads specialise",
        b: `<p>Nobody tells the heads what to do; training finds useful patterns. Typical jobs seen in practice: attending to the <b>previous word</b>, linking a <b>pronoun to its noun</b>, linking verbs with their objects, matching repeated words. Averaging the heads would blur all of those sharp patterns together, which is why we concatenate and mix with $W_O$ instead.</p>`,
        v: F.compare(
          {
            title: "Separate heads",
            c: "teal",
            body:
              F.cells(
                [
                  { v: "sharp", c: "violet" },
                  { v: "sharp", c: "teal" },
                  { v: "sharp", c: "amber" },
                ],
                { size: 62 },
              ) + "each pattern kept",
          },
          { title: "Averaged", c: "rose", body: F.cells([{ v: "blur", c: "dim" }], { size: 62 }) + "patterns smeared" },
        ),
        c: {
          q: 'Attention weights show that one head links "it" to "animal". Does that prove the model resolved the pronoun?',
          o: [
            "No: it shows where information flowed in one head, not why",
            "Yes: attention weights are direct explanations of the output",
            "Yes, but only if that weight is above 0.5 in every head",
          ],
          a: 0,
          why: "Other heads and layers also contribute. High attention is suggestive, not proof.",
        },
      },
      {
        t: "What it costs",
        b: `<p>With $W_Q,W_K,W_V$ and $W_O$ all of size about $d_{\\text{model}}\\times d_{\\text{model}}$, one attention layer has about $4\\,d_{\\text{model}}^2$ parameters, <b>whatever $h$ is</b>. Each head's score matrix is still $T\\times T$, so the sequence-length cost stays quadratic.</p>`,
        v: table(
          ["d<sub>model</sub>", "attention parameters 4·d²"],
          [
            ["64", "16,384"],
            ["512", "1,048,576"],
          ],
        ),
        c: {
          q: "Going from 1 head to 8 heads at the same d<sub>model</sub> changes the number of attention parameters by…",
          o: ["Nothing", "A factor of 8", "A factor of 64"],
          a: 0,
          why: "The heads divide d_model between them; the total matrix size is unchanged.",
        },
      },
      {
        t: "Reading the playground",
        b: `<p>The heat grid shows one head's attention for the eight words (you can switch heads, or see their average). Below, pick d<sub>model</sub> and the number of heads to see the shapes inside a layer.</p>`,
        v: F.cells([
          { v: "4 heads", sub: "4 patterns", c: "violet" },
          "→",
          { v: "average", sub: "blurred", c: "rose" },
        ]),
      },
    ],
    guide: [
      "Click through <b>Head 1</b> to <b>Head 4</b>. Which word does the row for <b>it</b> light up in each?",
      "Open <b>Average of all four</b>. Why is it harder to read?",
      "Set d<sub>model</sub> = 512 and step the heads from 1 to 8. Which numbers change and which stay put?",
      "Answer the questions after the demo.",
    ],
  };
})();
