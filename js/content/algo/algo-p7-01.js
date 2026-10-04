/* Algorithms that Changed the World — Phase 7: Information Theory & Compression
   Entropy, Huffman coding, LZW. Sessions 20–23. */
(function () {
  const partScope = (NIC.shared.algoP7 = NIC.shared.algoP7 || {});

  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, fmt, esc } = N;

  const reg = (m) => N.register({ subject: "algo", lecture: 7, ...m });
  const lg2 = Math.log2;

  // ---------- shared small builders ----------
  const table = (head, rows, mw = 640) =>
    `<table class="t" style="max-width:${mw}px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows
      .map(
        (r) =>
          `<tr class="${r.hl || (r[0] && r[0].hl) ? "hl" : r.bad || (r[0] && r[0].bad) ? "bad" : ""}">${[]
            .concat(r.c || (r[0] && r[0].c) || r)
            .flat(2)
            .map((c) => `<td>${c}</td>`)
            .join("")}</tr>`,
      )
      .join("")}</table>`;
  const flow = (items) =>
    `<div class="mini-row">${items.map((it) => (Array.isArray(it) ? `<span class="pill ${it[1] || ""}">${it[0]}</span>` : `<span class="pill">${it}</span>`)).join('<span class="arrow">→</span>')}</div>`;

  /* ============ 7.1 Surprise and entropy ============ */
  reg({
    id: "a7-entropy",
    order: 1,
    num: "7.1",
    title: "Surprise and entropy",
    blurb: "Information is surprise: I(x) = −log₂ p(x). Drag the symbol weights and watch the compression floor move.",
    render(root) {
      root.appendChild(header(this, ""));
      const SYMS = ["A", "B", "C", "D"],
        COL = ["var(--teal)", "var(--violet)", "var(--amber)", "var(--rose)"],
        CK = ["teal", "violet", "amber", "rose"]; // the same hues as NIC.colors() keys: Chart.js cannot read var(--x)
      let wts = [8, 4, 2, 2]; // the loaded die: .5 .25 .125 .125 → H = 1.75
      const card =
        el(`<div class="card"><div class="card-head"><h2>A source that speaks four symbols</h2><span class="faint">sliders = how often each symbol appears</span></div>
        <div class="controls" id="sl"></div>
        <div class="grid two">
          <div><canvas class="viz" id="cv"></canvas><div class="legend">${SYMS.map((s, i) => `<span style="--c:${COL[i]}">${s}</span>`).join("")}</div></div>
          <div>
            <div id="meter"></div>
            <div class="stat-row"><div class="stat teal"><small>Entropy H</small><b id="hh"></b></div><div class="stat"><small>Ceiling (uniform)</small><b id="mx"></b></div><div class="stat amber"><small>Saved vs fixed 2-bit</small><b id="sv"></b></div></div>
          </div>
        </div>
        <table class="t" id="tb" style="margin-top:12px"></table></div>`);
      root.appendChild(card);
      SYMS.forEach((s, i) => {
        const sl = N.slider(`Symbol ${s}`, 0, 32, 1, wts[i]);
        sl.onInput((v) => {
          wts[i] = v;
          draw();
        });
        qs("#sl", card).appendChild(sl);
      });
      const probs = () => {
        const s = wts.reduce((a, b) => a + b, 0);
        return s ? wts.map((w) => w / s) : [0.25, 0.25, 0.25, 0.25];
      };
      function draw() {
        const p = probs(),
          mx = lg2(SYMS.length);
        const H = p.reduce((a, pi) => a - (pi ? pi * lg2(pi) : 0), 0);
        N.barChart(qs("#cv", card), {
          groups: [{ values: p, color: (i) => N.colors()[CK[i]] }],
          labels: SYMS,
          yMax: 1,
          decimals: 2,
          height: 190,
        });
        qs("#meter", card).innerHTML =
          `<div class="faint" style="font-size:12px">Average bits per symbol an ideal code needs — no lossless code beats this floor</div>
          <div style="position:relative;height:24px;background:var(--bg-2);border:1px solid var(--line);border-radius:7px;margin:8px 0 4px;overflow:hidden">
            <div style="position:absolute;left:0;top:0;bottom:0;width:${((H / mx) * 100).toFixed(1)}%;background:var(--teal-dim);border-right:2px solid var(--teal)"></div>
          </div>
          <div style="font-size:12px" class="faint"><span>0</span><span style="float:right">${mx} bits — all four equally likely</span></div>`;
        qs("#hh", card).textContent = fmt(H) + " bits";
        qs("#mx", card).textContent = fmt(mx) + " bits";
        qs("#sv", card).textContent = Math.max(0, (1 - H / mx) * 100).toFixed(0) + "%";
        qs("#tb", card).innerHTML =
          `<tr><th>Symbol</th><th class="num">p</th><th class="num">Surprise −log₂p</th><th class="num">Contribution p·(−log₂p)</th></tr>` +
          SYMS.map(
            (s, i) =>
              `<tr><td style="color:${COL[i]}"><b>${s}</b></td><td class="num">${p[i].toFixed(3)}</td><td class="num">${p[i] ? (-lg2(p[i])).toFixed(2) + " bits" : "—"}</td><td class="num">${(p[i] ? -p[i] * lg2(p[i]) : 0).toFixed(3)}</td></tr>`,
          ).join("") +
          `<tr class="hl"><td><b>H</b></td><td class="num"></td><td class="num"></td><td class="num"><b>${H.toFixed(3)} bits / symbol</b></td></tr>`;
      }
      draw();
      root.appendChild(
        el(
          `<div class="callout teal"><b>Predictable = compressible.</b> A source that almost always says the same thing has low entropy — most symbols carry almost no information, so a good code spends almost no bits on them. The extreme: a source that <i>always</i> says A has H = 0. There's nothing to say.</div>`,
        ),
      );
      root.appendChild(
        predict({
          id: "a7-entropy-1",
          q: "Set A and B to 8, and C and D to 0. What does the entropy H become?",
          opts: ["0.5 bits", "1 bit", "1.5 bits", "2 bits, since the alphabet still has four symbols"],
          a: 1,
          why: "Only A and B can ever appear, each half the time, just like a fair coin: <b>1 bit</b> per symbol. C and D have probability 0, so they add nothing, and the alphabet size doesn't matter. Entropy belongs to the <b>distribution</b>. You save 50% against a fixed 2-bit code.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-entropy-2",
          q: "For a 4-symbol alphabet, when is entropy at its <b>maximum</b>?",
          opts: [
            "When one symbol dominates",
            "When all four are equally likely",
            "When probabilities are powers of two",
          ],
          a: 1,
          why: "Uniform is the max: log₂n bits for n symbols. Any skew lowers H — and the gap between H and the ceiling is exactly the compressible headroom (try the 'Saved vs fixed 2-bit' stat).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Information = surprise</b>: I(x) = −log₂ p(x). Each halving of probability adds exactly one bit.",
            "<b>Entropy</b> H = Σ p·(−log₂p) is the <i>average</i> surprise — the lower bound on bits per symbol for any lossless code.",
            "Uniform is the maximum (log₂n). Skew lowers H — <b>predictability is compressibility</b>.",
            "Ideal code lengths are fractional (e.g. −log₂0.2 ≈ 2.32), but real codewords use whole bits — so H is a bound you approach, not always hit.",
          ],
          "Entropy is the average surprise of a source, and no lossless compression can beat it on average.",
        ),
      );
    },
  });

  /* ============ 7.2 Huffman ============ */
  reg({
    id: "a7-huffman",
    order: 2,
    num: "7.2",
    title: "Building the Huffman tree",
    blurb:
      "Merge the two least-probable nodes, repeat, read codewords off the branches. A greedy algorithm that is provably optimal.",
    render(root) {
      root.appendChild(header(this, ""));
      const PRESETS = {
        lecture: {
          name: "Lecture set (.35 .25 .20 .12 .08)",
          p: [
            ["A", 0.35],
            ["B", 0.25],
            ["C", 0.2],
            ["D", 0.12],
            ["E", 0.08],
          ],
        },
        die: {
          name: "Loaded die (.5 .25 .125 .125)",
          p: [
            ["A", 0.5],
            ["B", 0.25],
            ["C", 0.125],
            ["D", 0.125],
          ],
        },
        uniform: {
          name: "Uniform (.25 ×4)",
          p: [
            ["A", 0.25],
            ["B", 0.25],
            ["C", 0.25],
            ["D", 0.25],
          ],
        },
        skew: {
          name: "Skewed (.7 .1 .1 .05 .05)",
          p: [
            ["A", 0.7],
            ["B", 0.1],
            ["C", 0.1],
            ["D", 0.05],
            ["E", 0.05],
          ],
        },
      };
      let key = "lecture",
        queue = [],
        nextId = 0,
        log = [],
        picked = new Set(),
        done = false;

      const card =
        el(`<div class="card"><div class="card-head"><h2>Merge the two least-probable nodes</h2><span class="faint">click two nodes yourself, or auto-merge</span></div>
        <div class="controls" id="pre"></div>
        <p class="dim" style="margin:4px 0 8px">The queue, sorted by probability. The greedy rule: <b>always combine the two smallest</b>. Merged nodes re-enter the queue like ordinary symbols.</p>
        <div class="pop" id="q"></div>
        <div class="controls"><button class="btn primary" id="auto">Auto-merge smallest two</button><button class="btn" id="all">Finish</button><button class="btn ghost" id="rs">Reset</button><span class="mono dim" id="msg"></span></div>
        <div id="tree" style="margin-top:10px"></div>
        <div id="res"></div>
        <div class="log" id="lg" style="margin-top:10px"></div></div>`);
      root.appendChild(card);
      qs("#pre", card).appendChild(
        N.seg(
          Object.entries(PRESETS).map(([k, v]) => [k, v.name]),
          key,
          (v) => {
            key = v;
            init();
          },
        ),
      );

      const sortedQ = () => [...queue].sort((a, b) => a.p - b.p || a.id - b.id);
      // bit "0" goes to the larger child; on a tie a leaf beats a merged node, then smaller id — reproduces the lecture's exact codes
      const orderKids = (x, y) => {
        if (x.p !== y.p) return x.p > y.p ? [x, y] : [y, x];
        if (x.leaf !== y.leaf) return x.leaf ? [x, y] : [y, x];
        return x.id < y.id ? [x, y] : [y, x];
      };
      function doMerge(x, y, mine) {
        const kids = orderKids(x, y);
        const node = { id: nextId++, label: kids.map((k) => k.label).join(""), p: x.p + y.p, leaf: false, kids };
        queue = queue.filter((n) => n !== x && n !== y);
        queue.push(node);
        log.unshift(
          `${mine ? "You merged" : "Merged"} <b>${x.label}</b> (${fmt(x.p)}) + <b>${y.label}</b> (${fmt(y.p)}) → <b>${node.label}</b> (${fmt(node.p)})`,
        );
        picked.clear();
        if (queue.length === 1) done = true;
        draw();
      }
      function treeSVG(root) {
        const pos = new Map();
        const edges = [];
        let li = 0,
          maxD = 0;
        (function count(n, d) {
          if (!n.kids) maxD = Math.max(maxD, d);
          else n.kids.forEach((k) => count(k, d + 1));
        })(root, 0);
        let leaves = 0;
        (function c(n) {
          if (!n.kids) leaves++;
          else n.kids.forEach(c);
        })(root);
        const W = 520,
          H = maxD * 60 + 44;
        const X = (i) => 34 + (i + 0.5) * ((W - 68) / leaves),
          Y = (d) => 24 + d * 60;
        (function place(n, d) {
          if (!n.kids) {
            pos.set(n, [X(li++), Y(d)]);
            return;
          }
          n.kids.forEach((k) => place(k, d + 1));
          const [l, r] = n.kids,
            pl = pos.get(l),
            pr = pos.get(r);
          const p = [(pl[0] + pr[0]) / 2, Y(d)];
          pos.set(n, p);
          edges.push(
            `<line x1="${p[0]}" y1="${p[1] + 9}" x2="${pl[0]}" y2="${pl[1] - 11}" stroke="var(--line-2)"/><text x="${(p[0] + pl[0]) / 2 - 7}" y="${(p[1] + pl[1]) / 2 + 2}" fill="var(--teal)" font-size="11" font-family="var(--mono)">0</text>`,
          );
          edges.push(
            `<line x1="${p[0]}" y1="${p[1] + 9}" x2="${pr[0]}" y2="${pr[1] - 11}" stroke="var(--line-2)"/><text x="${(p[0] + pr[0]) / 2 + 7}" y="${(p[1] + pr[1]) / 2 + 2}" fill="var(--amber)" font-size="11" font-family="var(--mono)">1</text>`,
          );
        })(root, 0);
        const nodes = [...pos.entries()].map(
          ([n, [x, y]]) =>
            `<g><rect x="${x - 25}" y="${y - 11}" width="50" height="22" rx="6" fill="${n.leaf ? "var(--panel-2)" : "var(--bg-2)"}" stroke="${n.leaf ? "var(--teal)" : "var(--line-2)"}"/>
          <text x="${x}" y="${y + 4}" fill="var(--text)" font-size="11" text-anchor="middle" font-family="var(--mono)">${n.label}</text></g>`,
        );
        return `<svg class="viz" viewBox="0 0 ${W} ${H}" style="max-height:${H + 10}px">${edges.join("")}${nodes.join("")}</svg>`;
      }
      function codeOf(root) {
        const m = {};
        (function w(n, s) {
          if (!n.kids) m[n.label] = s || "0";
          else {
            w(n.kids[0], s + "0");
            w(n.kids[1], s + "1");
          }
        })(root, "");
        return m;
      }
      function draw() {
        const sq = sortedQ();
        qs("#q", card).innerHTML = sq
          .map(
            (n) =>
              `<div class="chip ${picked.has(n) ? "picked" : ""} ${n.leaf ? "" : "new"}" data-id="${n.id}" style="cursor:${done ? "default" : "pointer"}"><small>${fmt(n.p)}</small><b>${esc(n.label)}</b></div>`,
          )
          .join("");
        qsa("#q .chip", card).forEach(
          (c) =>
            (c.onclick = () => {
              if (done) return;
              const n = queue.find((x) => x.id === +c.dataset.id);
              if (picked.has(n)) picked.delete(n);
              else if (picked.size < 2) picked.add(n);
              if (picked.size === 2) {
                const [w0, w1] = twoSmallest(),
                  sel = [...picked];
                if ((sel[0] === w0 || sel[0] === w1) && (sel[1] === w0 || sel[1] === w1) && sel[0] !== sel[1])
                  doMerge(sel[0], sel[1], true);
                else {
                  qs("#msg", card).innerHTML =
                    `✗ the greedy rule picks the <b>two smallest</b>: ${w0.label} (${fmt(w0.p)}) and ${w1.label} (${fmt(w1.p)})`;
                  picked.clear();
                  draw();
                  return;
                }
              }
              draw();
            }),
        );
        qs("#lg", card).innerHTML = log
          .slice(0, 8)
          .map((l) => `<div style="margin:3px 0">${l}</div>`)
          .join("");
        if (done) {
          const rootN = queue[0],
            codes = codeOf(rootN);
          const dist = PRESETS[key].p;
          const H = dist.reduce((a, [, p]) => a - p * lg2(p), 0);
          const Lavg = dist.reduce((a, [s, p]) => a + p * codes[s].length, 0);
          qs("#tree", card).innerHTML = treeSVG(rootN);
          qs("#res", card).innerHTML =
            table(
              ["Symbol", "p", "Code", "Length", "p·len", "Ideal −log₂p"],
              dist.map(([s, p]) => [
                s,
                p.toFixed(3),
                `<code>${codes[s]}</code>`,
                codes[s].length,
                (p * codes[s].length).toFixed(3),
                (-lg2(p)).toFixed(2),
              ]),
            ) +
            `<div class="stat-row"><div class="stat teal"><small>Avg length L</small><b>${Lavg.toFixed(2)}</b></div><div class="stat"><small>Entropy H</small><b>${H.toFixed(2)}</b></div><div class="stat amber"><small>Gap L−H</small><b>${(Lavg - H).toFixed(2)}</b></div></div>
            <div class="callout ${Lavg - H < 0.01 ? "teal" : ""}">${
              Lavg - H < 0.01
                ? `<b>L = H exactly.</b> Every probability here is a power of two, so the ideal lengths (−log₂p) are whole numbers — Huffman reaches the floor.`
                : `<b>L ≥ H, always.</b> The gap (${(Lavg - H).toFixed(2)} bits) is the price of integer-length codewords — the ideals are fractional. Coding symbols in blocks narrows it.`
            }</div>`;
        } else {
          qs("#tree", card).innerHTML = "";
          qs("#res", card).innerHTML = "";
        }
      }
      const twoSmallest = () => sortedQ().slice(0, 2);
      qs("#auto", card).onclick = () => {
        if (!done) {
          const [a, b] = twoSmallest();
          doMerge(a, b, false);
        }
      };
      qs("#all", card).onclick = () => {
        while (queue.length > 1) {
          const [a, b] = twoSmallest();
          doMerge(a, b, false);
        }
      };
      qs("#rs", card).onclick = init;
      function init() {
        const p = PRESETS[key].p;
        queue = p.map(([label, pr], i) => ({ id: i, label, p: pr, leaf: true, kids: null }));
        nextId = p.length;
        log = [];
        picked = new Set();
        done = false;
        qs("#msg", card).textContent = "";
        draw();
      }
      init();
      root.appendChild(
        predict({
          id: "a7-huffman-1",
          q: "On the Lecture set (.35 .25 .20 .12 .08), which symbols end up with the longest, 3-bit codewords?",
          opts: ["D and E, the two rarest", "A and B, the two most common", "C alone, the middle one"],
          a: 0,
          why: "The rarest symbols are merged first, so they sit deepest in the tree: D (.12) and E (.08) get 3 bits, while A, B and C get 2. The average is 0.35×2 + 0.25×2 + 0.20×2 + 0.12×3 + 0.08×3 = 2.20 bits.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-huffman-2",
          q: "When does Huffman's average length L equal the entropy H <b>exactly</b>?",
          opts: [
            "Never, because codewords are whole bits",
            "When all probabilities are powers of two",
            "Whenever there are enough symbols",
          ],
          a: 1,
          why: "Try the Loaded die preset: .5 .25 .125 .125 → ideals 1, 2, 3, 3 — all integers → L = 1.75 = H. Otherwise L > H by a small gap.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Codes must be <b>prefix-free</b> (no codeword starts another) — every codeword is a leaf of a binary tree.",
            "Huffman's greedy rule: repeatedly merge the <b>two least probable</b> nodes. Optimal by the exchange argument — the rarest symbols belong deepest.",
            "Average length <b>L ≥ entropy H</b> always; equality needs power-of-two probabilities (or block coding).",
            "Huffman is <b>static</b>: it needs the frequencies up front and the tree must travel with the message.",
          ],
          "Huffman gives the best possible prefix-free code for a known distribution — rare symbols get long codes, common ones short.",
        ),
      );
    },
  });
  Object.assign(partScope, { flow, reg, table });
})();
