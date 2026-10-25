/* js/content/algo/algo-p9-x-12.js: Phase 10 extra lessons (overflow): 10.5 Multi-head attention. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
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
  const { table, softmax, grid } = shared;
  const { barRows } = shared;
  const HC = ["violet", "teal", "amber", "blue"];
  const hc = (i) => HC[i % 4];

  // step 2: the 512 numbers of a word are cut into h slices, one per head
  function splitFig(box) {
    const host = el(`<div style="padding:4px"></div>`);
    const note = el(`<div style="font-weight:800;margin-top:8px"></div>`);
    const show = (h) => {
      host.innerHTML = `<div style="display:flex;gap:3px;height:44px">${Array.from({ length: h }, (_, i) => `<span style="flex:1 1 0;display:grid;place-items:center;border-radius:8px;background:var(--${hc(i)}-dim);border:2px solid var(--${hc(i)});font:900 ${h > 4 ? 12 : 14}px var(--sans)">${512 / h}</span>`).join("")}</div><div class="faint" style="font-size:12.5px;margin-top:4px">size of each head's working space (512 in total)</div>`;
      note.innerHTML = `${h} head${h > 1 ? "s" : ""}, each working with <b>${512 / h}</b> numbers. ${h} &#215; ${512 / h} = 512, the same total however many heads.`;
    };
    box.append(
      seg(
        [
          [1, "1 head"],
          [2, "2 heads"],
          [4, "4 heads"],
          [8, "8 heads"],
        ],
        "8",
        (v) => show(+v),
      ),
      host,
      note,
    );
    show(8);
  }

  // step 3: eight heads work separately, get glued side by side, then mixed
  function concatFig(box) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = el(
      `<svg viewBox="0 0 320 186" role="img" aria-label="Eight head outputs glued side by side into one row" style="width:100%;max-width:440px;display:block"></svg>`,
    );
    const rects = Array.from({ length: 8 }, () => {
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("width", 36);
      r.setAttribute("height", 30);
      r.setAttribute("rx", 7);
      r.style.transition = "transform .45s, fill .3s, stroke .3s";
      svg.appendChild(r);
      return r;
    });
    const lab = (y, t) =>
      `<text x="160" y="${y}" text-anchor="middle" style="font:800 12px var(--sans);fill:var(--text-dim)">${t}</text>`;
    const caps = [
      "The word goes to every head: 512 numbers in.",
      "Each head runs its own attention in its own small space (64 numbers) and returns a result.",
      "Glue: put the results side by side. Back to 512 numbers.",
      "Mix: one last matrix lets the heads blend. Same size as the input.",
    ];
    const note = el(`<div style="font-weight:800;margin-top:6px;min-height:40px"></div>`);
    const set = (k) => {
      rects.forEach((r, i) => {
        const x = k === 1 ? 6 + i * 39 : 16 + i * 36,
          y = [26, 86 + (i % 2 ? 14 : -10), 146, 146][k],
          c = k === 3 ? "blue" : hc(i);
        r.style.transform = `translate(${x}px,${y}px)${k === 1 ? " scale(.85)" : ""}`;
        r.style.fill = k === 0 ? "var(--bg-2)" : `var(--${c}-dim)`;
        r.style.stroke = k === 0 ? "var(--line-2)" : `var(--${c})`;
        r.style.strokeWidth = 2;
      });
      svg.querySelectorAll("text").forEach((t) => t.remove());
      svg.insertAdjacentHTML(
        "beforeend",
        lab(
          [18, 62, 138, 138][k],
          [
            "the word: 512 numbers",
            "8 heads, 64 numbers each",
            "glued side by side: 512 numbers",
            "after W_O: 512 numbers",
          ][k],
        ),
      );
      note.textContent = caps[k];
    };
    box.append(
      seg(
        [
          [0, "1 Input"],
          [1, "2 Heads work"],
          [2, "3 Glue"],
          [3, "4 Mix"],
        ],
        "0",
        (v) => set(+v),
      ),
      svg,
      note,
    );
    set(0);
  }

  // step 5: parameters stay put, the score grid grows with the text
  function costFig(box) {
    let dm = 512,
      T = 10;
    const host = el(`<div style="padding:4px"></div>`);
    const bars = barRows(host, [
      ["1 head", "violet"],
      ["8 heads", "teal"],
      ["score grid", "amber"],
    ]);
    const show = () => {
      const p = 4 * dm * dm;
      bars(0, 1, p.toLocaleString());
      bars(1, 1, p.toLocaleString());
      bars(2, (T * T) / 1600, `${T * T}`);
    };
    box.append(
      el(
        `<div class="faint" style="font-size:13px">Attention parameters (top two bars) and scores per head (bottom bar)</div>`,
      ),
      seg(
        [
          [64, "d_model = 64"],
          [512, "d_model = 512"],
        ],
        "512",
        (v) => {
          dm = +v;
          show();
        },
      ),
      seg(
        [
          [10, "10 words"],
          [20, "20 words"],
          [40, "40 words"],
        ],
        "10",
        (v) => {
          T = +v;
          show();
        },
      ),
      host,
    );
    show();
  }

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
        seg(
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
        seg(
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
        seg(
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
        b: `<p>Inside the model every word is a long list of numbers, 512 in the example. Instead of one big attention there are several small ones, called <b>heads</b>. Every head sees the whole word, but works in a smaller space: its own query, key and value filters squeeze the word down to a short list. Eight heads each work with 64 numbers (8 &#215; 64 = 512); a single head would work with all 512.</p><p>Smaller example: a 64-number word and 4 heads gives 16 numbers per head. Pick a head count in the picture.</p><details class="math-more"><summary>Show the maths</summary><p>Each head $i$ has its own matrices $W_{Q,i},W_{K,i},W_{V,i}\\in\\mathbb{R}^{d_{\\text{model}}\\times d_h}$ with</p>$$d_h=\\frac{d_{\\text{model}}}{h}$$<p>The input embeddings are shared by all heads.</p>${table(
          ["d<sub>model</sub>", "heads h", "d<sub>h</sub> = d<sub>model</sub> / h"],
          [
            ["512", "8", "64"],
            ["512", "1", "512"],
            ["64", "4", "16"],
          ],
        )}</details>`,
        v: (box) => splitFig(box),
        c: {
          q: "The model keeps the same word length but doubles the number of heads. What happens to the number of numbers each head works with?",
          o: ["It halves", "It doubles", "It stays the same, because the word length is unchanged"],
          a: 0,
          why: "The total working space stays 512 but is shared between twice as many heads, so each gets half as many numbers (512 / 8 = 64 becomes 512 / 16 = 32).",
        },
      },
      {
        t: "Run in parallel, then concatenate",
        b: `<p>Every head runs its own attention and hands back a result for each word, 64 numbers in the example. The results are glued side by side (<b>concatenated</b>), which gives 8 &#215; 64 = 512 numbers per word, the same size as the input. One last mixing step then lets the heads blend with each other, and the layer's output can feed straight into the next layer.</p><details class="math-more"><summary>Show the maths</summary><p>Head $i$ returns $Z_i\\in\\mathbb{R}^{T\\times d_h}$. The $h$ outputs are concatenated into $T\\times d_{\\text{model}}$ and multiplied by one more matrix $W_O$.</p></details>`,
        v: (box) => concatFig(box),
        c: {
          q: "Each of 8 heads returns 64 numbers for a word. How many numbers per word after gluing the results side by side?",
          o: ["512", "64", "72"],
          a: 0,
          why: "Side by side: 8 &#215; 64 = 512, the same as the word that went in.",
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
        b: `<p>Splitting into heads is free in parameters: eight small filters hold exactly as many numbers as one big one, so 1 head and 8 heads have the same size. What does grow is the work on long texts: every head still scores every word against every word, so 10 words need 100 scores and 20 words need 400.</p><details class="math-more"><summary>Show the maths</summary><p>With $W_Q,W_K,W_V$ and $W_O$ all of size about $d_{\\text{model}}\\times d_{\\text{model}}$, one attention layer has about $4\\,d_{\\text{model}}^2$ parameters, <b>whatever $h$ is</b>. Each head's score matrix is still $T\\times T$, so the sequence-length cost stays quadratic.</p>${table(
          ["d<sub>model</sub>", "attention parameters 4·d²"],
          [
            ["64", "16,384"],
            ["512", "1,048,576"],
          ],
        )}</details>`,
        v: (box) => costFig(box),
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
