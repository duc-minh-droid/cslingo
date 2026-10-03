/* Algorithms that Changed the World — Phase 7: Information Theory & Compression
   Entropy, Huffman coding, LZW. Sessions 20–23. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, fmt, esc } = N;
  const L = N.LESSONS;
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
        COL = ["var(--teal)", "var(--violet)", "var(--amber)", "var(--rose)"];
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
          groups: [{ values: p, color: (i) => COL[i] }],
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
          q: "Drag A to 32 and the rest near 0. Entropy H becomes…",
          opts: [
            "about 2 bits, since there are still four symbols",
            "about 0 bits: a near-certain source says almost nothing",
            "about 1 bit, halfway between the two extremes",
          ],
          a: 1,
          why: "Entropy is a property of the <b>distribution</b>, not the alphabet. Four symbols where one is near-certain ≈ no news per symbol → H ≈ 0. That's why English text (very predictable) compresses so well.",
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
          q: "Lecture set: after merging D+E → .20, the queue is C .20, DE .20, B .25, A .35. Which two merge next?",
          opts: [
            "A and B, the two biggest remaining nodes",
            "C and DE: the merged node competes like any symbol",
            "D and E again, since they were merged last",
          ],
          a: 1,
          why: "The two smallest are now C (.20) and the new node DE (.20) — a tie. The merged node is just another queue entry; that's what makes the result a <b>tree</b>, not a flat table.",
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

  /* ============ 7.3 LZW ============ */
  reg({
    id: "a7-lzw",
    order: 3,
    num: "7.3",
    title: "LZW's growing dictionary",
    blurb:
      "No frequency table, no tree: encoder and decoder grow the same dictionary from the data itself. Step BANANABANDANA, then try AAA.",
    render(root) {
      root.appendChild(header(this, ""));
      let mode = "enc",
        trace = null,
        ptr = 0;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Type a message, grow a dictionary</h2><span class="faint">A–Z only · alphabet letters get codes 0…k−1 in the order given</span></div>
        <div class="controls">
          <label class="field">Message <input type="text" id="msg" value="BANANABANDANA" style="width:180px"></label>
          <label class="field">Alphabet <input type="text" id="al" value="ABND" style="width:90px"></label>
          <span id="seg"></span>
        </div>
        <div class="controls"><button class="btn primary" id="step">Step →</button><button class="btn" id="all">Run all</button><button class="btn ghost" id="rs">Reset</button><span class="mono dim" id="st"></span></div>
        <div class="grid two">
          <div><h3 id="t1"></h3><div class="pop" id="stream" style="margin-bottom:12px"></div><h3>Trace</h3><div class="log" style="max-height:300px"><table class="t" id="lg"></table></div></div>
          <div><h3>Dictionary — rebuilt on the fly, never transmitted</h3><div class="pop" id="dict"></div><div id="note" style="margin-top:12px"></div></div>
        </div></div>`);
      root.appendChild(card);
      qs("#seg", card).appendChild(
        N.seg(
          [
            ["enc", "Encode"],
            ["dec", "Decode"],
          ],
          mode,
          (v) => {
            mode = v;
            ptr = 0;
            draw();
          },
        ),
      );

      function build() {
        const text = (qs("#msg", card).value || "A").toUpperCase().replace(/[^A-Z]/g, "") || "A";
        const alRaw = (qs("#al", card).value || "").toUpperCase().replace(/[^A-Z]/g, "");
        const alphaArr = [...new Set(alRaw.split(""))];
        for (const c of text) if (!alphaArr.includes(c)) alphaArr.push(c);
        alphaArr.sort((a, b) => alRaw.indexOf(a) - alRaw.indexOf(b));
        // --- encode trace ---
        const dict = new Map(alphaArr.map((c, i) => [c, i]));
        let next = alphaArr.length,
          w = "";
        const steps = [],
          codes = [];
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          if (dict.has(w + c)) {
            steps.push({ act: "grow", w, c, pos: i });
            w += c;
          } else {
            const code = dict.get(w);
            codes.push(code);
            steps.push({ act: "emit", w, c, pos: i, code, add: w + c, n: next });
            dict.set(w + c, next++);
            w = c;
          }
        }
        codes.push(dict.get(w));
        steps.push({ act: "final", w, pos: text.length, code: dict.get(w) });
        // --- decode trace ---
        const dd = alphaArr.slice(),
          dsteps = [];
        let prev = null,
          out = "";
        for (const code of codes) {
          let entry,
            miss = false;
          if (dd[code] !== undefined) entry = dd[code];
          else if (code === dd.length && prev !== null) {
            entry = prev + prev[0];
            miss = true;
          } else {
            dsteps.push({ code, err: true });
            break;
          }
          let added = null;
          if (prev !== null) {
            added = prev + entry[0];
            dd.push(added);
          }
          out += entry;
          prev = entry;
          dsteps.push({ code, entry, miss, added, out });
        }
        trace = { text, alphaArr, steps, codes, dsteps };
        ptr = 0;
      }

      function encRow(s, i) {
        if (s.act === "grow")
          return `<tr><td>${i + 1}</td><td class="mono">${esc(s.w)}+${esc(s.c)}</td><td><span class="dim">"${esc(s.w + s.c)}" is already in the dict → keep growing w</span></td><td class="num faint">—</td></tr>`;
        if (s.act === "final")
          return `<tr class="hl"><td>${i + 1}</td><td class="mono">end</td><td>end of input → <b>don't forget the final emit:</b> emit w="${esc(s.w)}"</td><td class="num"><b>${s.code}</b></td></tr>`;
        return `<tr class="hl"><td>${i + 1}</td><td class="mono">${esc(s.w)}+${esc(s.c)}</td><td>"${esc(s.w + s.c)}" is new → emit w="${esc(s.w)}", <b>add ${esc(s.add)} → ${s.n}</b></td><td class="num"><b>${s.code}</b></td></tr>`;
      }
      function decRow(s, i) {
        if (s.err)
          return `<tr class="bad"><td>${i + 1}</td><td class="num">${s.code}</td><td>code ${s.code} is beyond the dictionary — corrupt stream</td><td></td></tr>`;
        const addTxt = s.added
          ? ` · add ${esc(s.added)} → ${trace.alphaArr.length + [...trace.dsteps.slice(0, i + 1).values()].filter((x) => x.added).length - 1}`
          : "";
        if (s.miss)
          return `<tr class="bad"><td>${i + 1}</td><td class="num">${s.code}</td><td><b>missing entry!</b> code not in dict yet → prev "${esc(prevOf(i))}" + its first char = "<b>${esc(s.entry)}</b>"${addTxt}</td><td class="mono">${esc(s.out)}</td></tr>`;
        return `<tr class="hl"><td>${i + 1}</td><td class="num">${s.code}</td><td>→ "<b>${esc(s.entry)}</b>"${addTxt}</td><td class="mono">${esc(s.out)}</td></tr>`;
      }
      const prevOf = (i) => (trace.dsteps[i - 1] ? trace.dsteps[i - 1].entry : "");

      function draw() {
        if (!trace) build();
        const t = trace;
        const miss = t.dsteps.some((s) => s.miss);
        if (mode === "enc") {
          const upto = ptr ? (t.steps[ptr - 1].pos ?? t.text.length) : 0;
          qs("#t1", card).textContent = `Input: ${t.text.length} characters`;
          qs("#stream", card).innerHTML = t.text
            .split("")
            .map((c, i) => `<span class="gene ${i < upto ? "good" : ""}">${c}</span>`)
            .join("");
          qs("#lg", card).innerHTML =
            `<tr><th>#</th><th>w + c</th><th>What happens</th><th class="num">Emit</th></tr>` +
            t.steps.slice(0, ptr).map(encRow).join("");
          const adds = t.steps.slice(0, ptr).filter((s) => s.add);
          qs("#dict", card).innerHTML =
            t.alphaArr.map((c, i) => `<div class="chip"><small>${i}</small><b>${esc(c)}</b></div>`).join("") +
            adds.map((s) => `<div class="chip new"><small>${s.n}</small><b>${esc(s.add)}</b></div>`).join("");
          qs("#st", card).textContent =
            `step ${ptr}/${t.steps.length} · ${t.codes.length} codes for ${t.text.length} chars`;
          qs("#note", card).innerHTML =
            ptr === t.steps.length
              ? `<div class="callout teal"><b>${t.text.length} chars → ${t.codes.length} codewords:</b> <span class="mono">${t.codes.join(", ")}</span>. Fewer items isn't the whole story — codes grow wider as the dictionary grows — but repeated phrases clearly win.</div>`
              : "";
        } else {
          qs("#t1", card).textContent = `Codes arriving: ${t.codes.length}`;
          qs("#stream", card).innerHTML = t.codes
            .map((c, i) => `<span class="gene ${i < ptr ? "good" : ""}">${c}</span>`)
            .join("");
          qs("#lg", card).innerHTML =
            `<tr><th>#</th><th class="num">Code</th><th>Lookup / rule</th><th>Output so far</th></tr>` +
            t.dsteps.slice(0, ptr).map(decRow).join("");
          let idx = t.alphaArr.length;
          qs("#dict", card).innerHTML =
            t.alphaArr.map((c, i) => `<div class="chip"><small>${i}</small><b>${esc(c)}</b></div>`).join("") +
            t.dsteps
              .slice(0, ptr)
              .filter((s) => s.added)
              .map((s) => `<div class="chip new"><small>${idx++}</small><b>${esc(s.added)}</b></div>`)
              .join("");
          qs("#st", card).textContent = `decoded ${ptr}/${t.dsteps.length} codes`;
          qs("#note", card).innerHTML =
            ptr && ptr >= t.dsteps.length && miss
              ? `<div class="callout amber"><b>The missing-entry case fired.</b> A code arrived that the decoder hadn't built yet — this happens exactly when the encoder <i>just created</i> an entry and immediately reused it (a pattern like <code>AAA…</code>, i.e. <code>XYXY…</code>). The only consistent entry is <b>previous output + its own first character</b>.</div>`
              : ptr >= t.dsteps.length
                ? `<div class="callout teal"><b>Round trip:</b> ${t.dsteps[t.dsteps.length - 1] && t.dsteps[t.dsteps.length - 1].out === t.text ? "decoder rebuilt " + esc(t.text) + " perfectly — same dictionary, never sent." : "output differs from input — check the trace."}</div>`
                : "";
        }
        qs("#step", card).disabled = ptr >= (mode === "enc" ? trace.steps.length : trace.dsteps.length);
      }

      qs("#step", card).onclick = () => {
        const len = mode === "enc" ? trace.steps.length : trace.dsteps.length;
        if (ptr < len) {
          ptr++;
          draw();
        }
      };
      qs("#all", card).onclick = () => {
        ptr = mode === "enc" ? trace.steps.length : trace.dsteps.length;
        draw();
      };
      qs("#rs", card).onclick = () => {
        build();
        draw();
      };
      qs("#msg", card).onchange = () => {
        build();
        draw();
      };
      qs("#al", card).onchange = () => {
        build();
        draw();
      };
      build();
      draw();

      root.appendChild(
        predict({
          id: "a7-lzw-1",
          q: "The decoder receives a code <b>one slot past</b> its dictionary (the missing-entry case — try encoding <code>AAA</code>). The entry must be…",
          opts: [
            "Corrupt, so the decoder should reject it",
            "previous output + its own first character",
            "previous output + its own last character",
          ],
          a: 1,
          why: "It arises exactly when the encoder just created an entry and reused it instantly — a repeating pattern like XYXY…. p + first(p) is the only consistent value. Try <code>AAA</code>: codes 0,1 — code 1 arrives before entry 1 exists, and decodes to AA.",
        }),
      );
      root.appendChild(
        predict({
          id: "a7-lzw-2",
          q: "Huffman needs its frequency table sent with the message. LZW sends <b>nothing</b>, yet both sides end with identical dictionaries. How?",
          opts: [
            "The decoder guesses the likely entries",
            "Both process the same stream in the same order",
            "The dictionary is agreed in advance",
          ],
          a: 1,
          why: "Same input, same rule, same order → same table. The price: you can't decode mid-stream, and a lost codeword makes the dictionaries diverge (pair LZW with a CRC).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "LZW rule (encode): longest w in dict; when w+c is new, <b>emit code(w) and add w+c</b>. Don't forget the final emit.",
            "Decoder rebuilds the identical table: add <b>prev output + first char of current output</b>. Missing code → p + first(p).",
            "The dictionary is <b>cumulative state</b>: no mid-stream decoding, and corruption cascades.",
            "Different redundancy than Huffman: LZW exploits <b>repeated sequences</b>, Huffman exploits <b>symbol skew</b>. GIF uses LZW on palette indices.",
          ],
          "LZW builds a dictionary from the data itself, so nothing needs transmitting — but both sides must stay perfectly in sync.",
        ),
      );
    },
  });

  /* =================== LESSONS =================== */
  L["a7-entropy"] = {
    sum: "Some messages are predictable, some are full of surprises. <b>Entropy</b> measures the average surprise — and it's the hard lower bound on compression.",
    steps: [
      {
        t: "Information is surprise",
        b: `<p>A message that says what you already expected tells you nothing. A coin flip tells you something. Shannon's measure:</p><p>$$I(x) = -\\log_2 p(x)$$</p><p>Each halving of probability adds exactly <b>one bit</b> — that's why log₂ is the right unit.</p>`,
        v: table(
          ["p", "−log₂p", "meaning"],
          [
            ["1", "0 bits", "certainty — no news"],
            ["1/2", "1 bit", "one yes/no"],
            ["1/4", "2 bits", ""],
            ["1/8", "3 bits", ""],
            ["1/16", "4 bits", ""],
          ],
        ),
      },
      {
        t: "Average the surprise → entropy",
        b: `<p>Weight each surprise by how often it happens: $H = \\sum_x p(x)\\,\\bigl(-\\log_2 p(x)\\bigr)$.</p><p>Loaded die: A 0.5, B 0.25, C 0.125, D 0.125 → H = 0.5·1 + 0.25·2 + 0.125·3 + 0.125·3 = <b>1.75 bits</b>.</p>`,
        c: {
          q: "A source always sends A (p=1). Its entropy?",
          o: ["1 bit", "0 bits", "2 bits"],
          a: 1,
          why: "−log₂1 = 0. Certainty = no news = nothing to compress or send.",
        },
      },
      {
        t: "Uniform is the maximum",
        b: `<p>For n equally likely symbols, $H = \\log_2 n$ — the largest possible for that alphabet. Any skew lowers it. Four uniform symbols → 2 bits; the loaded die → 1.75.</p><span class="key">Entropy is a property of the <b>distribution</b>, not the alphabet. Same symbols, different probabilities → different entropy.</span>`,
        c: {
          q: "Two sources share the alphabet {A,B,C,D} but use different probabilities. Same entropy?",
          o: [
            "Yes, because they share exactly the same four-symbol alphabet",
            "No: entropy depends on the probabilities",
            "Only if both sources list the symbols in the same order",
          ],
          a: 1,
          why: "Relabelling changes nothing; changing probabilities changes everything.",
        },
      },
      {
        t: "Entropy is the compression floor",
        b: `<p>The ideal code length for symbol x is −log₂p(x) bits — often fractional (like 2.32). Real codewords use <b>whole bits</b>, so H is a <b>lower bound</b>: you can approach it (coding blocks of symbols together), never beat it on average.</p><span class="analogy">Entropy is to compression what a speed limit is to a road: you can get arbitrarily close, but no honest driver goes faster.</span>`,
      },
      {
        t: "Predictable = compressible",
        b: `<p>MISSISSIPPI's letters: I,S=4, P=2, M=1 out of 11 → H ≈ 1.82 bits, below the uniform 2 — the skew is the compressible part. English text is far more skewed, which is why it compresses so well.</p>`,
      },
    ],
    guide: [
      "Drag <b>A</b> to 32 and the rest toward 0 — watch H fall toward 0 and the 'saved' stat climb.",
      "Set all four sliders equal: H hits the 2-bit ceiling (the uniform max).",
      "Recreate the loaded die (8, 4, 2, 2) and confirm H = 1.75 in the table.",
      "Watch which symbol contributes most to H — it's not always the most common one.",
    ],
  };

  L["a7-huffman"] = {
    sum: "Huffman's trick: repeatedly merge the two <b>least</b> probable nodes into a tree, then read codewords off the branches. Greedy — and provably optimal.",
    steps: [
      {
        t: "Codes without separators",
        b: `<p>To decode a bit stream with no spaces, codewords must be <b>prefix-free</b>: no codeword may be a prefix of another.</p><p>A=0, B=10, C=110, D=111 → <code>010110</code> decodes left-to-right as 0|10|110 = <b>ABC</b>, unambiguously. But A=0, B=01 makes <code>01</code> ambiguous (B, or A-then-…).</p><span class="key">Prefix-free = every codeword is a <b>leaf</b> in a binary tree. That's the whole geometry.</span>`,
        c: {
          q: "A=0, B=1, C=01 — prefix-free?",
          o: [
            "Yes, all three codes are different",
            'No: A is a prefix of C, so "01" is ambiguous',
            "It can't be told without the probabilities",
          ],
          a: 1,
          why: "Any codeword that's a prefix of another breaks unique decodability.",
        },
      },
      {
        t: "The greedy merge",
        b: `<p>Probabilities: A .35, B .25, C .20, D .12, E .08. Rule: <b>merge the two smallest</b>, put the sum back in the queue, repeat until one node (the root) remains.</p>`,
        v: flow([
          ["D .12 + E .08 → DE .20", "teal"],
          ["C .20 + DE .20 → CDE .40", "violet"],
          ["A .35 + B .25 → AB .60", "amber"],
          ["AB .60 + CDE .40 → 1.00 ✓", "rose"],
        ]),
        c: {
          q: "After the first merge, the queue holds C .20, DE .20, B .25, A .35. Next merge?",
          o: ["A and B", "C and DE", "D and E again"],
          a: 1,
          why: "The merged node competes on its total probability. That's what makes a tree rather than a flat assignment.",
        },
      },
      {
        t: "Why the rarest first? (the proof sketch)",
        b: `<p>Each leaf's depth = how many bits it costs <i>every time that symbol appears</i>. The deepest positions are the most expensive — so the two <b>rarest</b> symbols should pay that cost.</p><p><b>Exchange argument:</b> take any optimal tree, swap its deepest leaves for the two rarest symbols — cost never increases. Then the smaller problem is solved the same way. Greedy choice + optimal substructure = a proof, not luck.</p>`,
      },
      {
        t: "Reading off the codes",
        b: `<p>Walk from the root: 0 = first branch, 1 = second. Lecture set gives A=00, B=01, C=10, D=110, E=111 — frequent symbols at depth 2, rare D,E at depth 3.</p><p>Average length $L = \\sum p \\cdot \\text{len} = 0.35 \\cdot 2 + 0.25 \\cdot 2 + 0.20 \\cdot 2 + 0.12 \\cdot 3 + 0.08 \\cdot 3 = \\mathbf{2.20}$ bits. Entropy H ≈ <b>2.15</b>. <b>L ≥ H always</b> — the gap pays for integer lengths.</p>`,
        c: {
          q: "L = 2.20 vs H ≈ 2.15. Which is true?",
          o: ["Bug — L must equal H", "L ≥ H is the law", "H was miscomputed"],
          a: 1,
          why: "Entropy is a bound. Equal needs power-of-two probabilities (see the Loaded die preset).",
        },
      },
      {
        t: "What Huffman needs (and doesn't do)",
        b: `<p>Huffman is <b>static</b>: it needs the symbol frequencies gathered in advance, and the tree/table must travel with the message. It learns <b>symbol skew</b>, not repeated phrases — that's LZW's job (next module).</p><span class="analogy">Huffman is a tailor measuring you once and sewing a suit. LZW is a tailor who adjusts the suit while you walk.</span>`,
      },
    ],
    guide: [
      "Click the two smallest chips yourself — wrong picks get corrected with a hint.",
      "On the Lecture preset, watch the merged nodes re-enter the queue and get merged again.",
      "Read the final tree: 0/1 on the branches give each codeword; check A=00 … E=111 in the table.",
      "Switch to <b>Loaded die</b> and Finish — notice L equals H exactly (all probabilities are powers of two).",
    ],
  };

  L["a7-lzw"] = {
    sum: "LZW needs no table sent with the message: encoder and decoder grow the <b>same</b> dictionary from the data itself.",
    steps: [
      {
        t: "The shared-dictionary trick",
        b: `<p>Huffman must send its frequency table along with the data. LZW sends <b>nothing</b> — yet both sides build identical dictionaries.</p><p>Start from a shared initial alphabet (each letter gets a code). <b>Encoder:</b> find the longest w already in the dict; when w+c isn't there, emit code(w) and <b>add w+c</b>. <b>Decoder:</b> each code outputs a string; then <b>add (previous output + first char of current)</b>. Same stream, same order → same entries at the same positions.</p>`,
        c: {
          q: "Why must decoding start at the beginning?",
          o: [
            "Because the codes are stored in order",
            "Dictionary entries are built from earlier outputs",
            "It doesn't: any code can be decoded alone",
          ],
          a: 1,
          why: "The dictionary is cumulative state. Huffman's fixed codebook allows mid-stream decoding; LZW's doesn't.",
        },
      },
      {
        t: "Encoder: longest match wins",
        b: `<p>BANANABANDANA with alphabet A,B,N,D (codes 0–3; new entries start at 4):</p>`,
        v: table(
          ["w", "c", "action"],
          [
            ["B", "A", "BA new → emit B(1), add BA→4"],
            ["A", "N", "AN new → emit A(0), add AN→5"],
            ["N", "A", "NA new → emit N(2), add NA→6"],
            ["AN", "A", "ANA new → emit AN(5), add ANA→7"],
            ["…", "", "full stream: <b>1, 0, 2, 5, 0, 4, 2, 3, 7</b> — 9 codes for 13 chars"],
          ],
          720,
        ),
      },
      {
        t: "Decoder rebuilds the same table",
        b: `<p>Receiving 1,0,2,5,… with only the alphabet: code 1→B, 0→A (add BA→4), 2→N (add AN→5), 5→AN (add NA→6). Same entries, same numbers — <b>synchronised</b>.</p><span class="key">The dictionary is derived from the data itself: nothing to transmit, but both sides must stay in perfect sync.</span>`,
      },
      {
        t: "The missing-entry case",
        b: `<p>Encode <code>AAA</code>: the encoder emits <b>0, 1</b> — but entry 1 ("AA") was <i>just</i> created and instantly reused, so it reaches the decoder before the decoder has built it.</p><p>Rule: an unknown code = <b>previous output + its own first character</b>: A + A = AA ✓. This happens exactly for immediately-repeating patterns (<code>XYXY…</code>).</p>`,
        c: {
          q: "A code arrives one slot past the dictionary. The entry must be…",
          o: [
            "impossible, so the stream must be corrupt",
            "previous output + its own first character",
            "previous output + its own last character",
          ],
          a: 1,
          why: "p + last(p) is the classic wrong guess. The entry is the one the encoder just added and reused.",
        },
      },
      {
        t: "Huffman vs LZW: different redundancy",
        b: `<p>Huffman exploits <b>which symbols</b> appear (skewed frequencies). LZW exploits <b>which sequences</b> repeat — "BANANA" compresses regardless of letter frequencies.</p>`,
        v: table(
          ["", "Huffman", "LZW"],
          [
            ["Learns", "symbol probabilities", "repeated sequences"],
            ["Model sent?", "yes — tree/frequencies", "no — rebuilt on the fly"],
            ["Decode mid-stream?", "yes (fixed codebook)", "no (state-dependent)"],
            ["Corruption", "boundary desync, may resync", "dictionary diverges — damage grows"],
            ["Shines on", "skewed symbols", "repeated phrases, GIF palettes"],
          ],
          720,
        ),
        c: {
          q: "Which wins on uniform symbols but a highly repetitive message?",
          o: [
            "Huffman: it always beats LZW on any kind of text",
            "LZW: the repeated phrases are the redundancy",
            "Neither can compress this message, because the symbols are uniform",
          ],
          a: 1,
          why: "Sequence-level redundancy is dictionary coding's home turf.",
        },
      },
    ],
    guide: [
      "Step through <b>BANANABANDANA</b>: 13 chars → 9 codes. Watch each new dictionary entry appear.",
      "Switch to <b>Decode</b> and run: the dictionary rebuilds identically — it was never sent.",
      "Type <b>AAA</b>, encode (2 codes), then decode — the <b>missing entry</b> row fires: prev + its own first char.",
      "Try a random string with no repeats — LZW can't compress what never repeats.",
    ],
  };
  /* ---------- lesson figures (added to steps that had text only) ---------- */
  const FG = NIC.fig;
  const addV = (id, i, v) => {
    if (L[id] && L[id].steps[i] && !L[id].steps[i].v) L[id].steps[i].v = v;
  };
  addV(
    "a7-entropy",
    1,
    `<table class="t" style="max-width:520px"><tr><th>symbol</th><th class="num">p</th><th class="num">surprise −log₂p</th><th class="num">p × surprise</th></tr>${[
      ["A", 0.5, 1],
      ["B", 0.25, 2],
      ["C", 0.125, 3],
      ["D", 0.125, 3],
    ]
      .map(
        ([s, p, b]) =>
          `<tr><td>${s}</td><td class="num">${p}</td><td class="num">${b} bits</td><td class="num">${(p * b).toFixed(3)}</td></tr>`,
      )
      .join("")}<tr class="hl"><td colspan="3"><b>entropy H</b></td><td class="num"><b>1.75</b></td></tr></table>`,
  );
  addV(
    "a7-entropy",
    2,
    FG.bars(
      [
        ["uniform (4 symbols)", 2, "violet", "max"],
        ["loaded die", 1.75, "teal"],
        ["always A", 0, "dim", "no surprise"],
      ],
      { max: 2, unit: " bits" },
    ),
  );
  addV(
    "a7-entropy",
    3,
    FG.compare(
      {
        title: "Ideal length (fractional)",
        c: "violet",
        body: "−log₂(0.2) = <b>2.32 bits</b>: you can't send a third of a bit",
      },
      {
        title: "Real codeword (whole bits)",
        c: "teal",
        body: "2 or 3 bits, so the average ends up <b>just above</b> H, never below it",
      },
    ),
  );
  addV(
    "a7-entropy",
    4,
    FG.cells([
      { v: "I", sub: "4", c: "teal" },
      { v: "S", sub: "4", c: "teal" },
      { v: "P", sub: "2", c: "violet" },
      { v: "M", sub: "1", c: "amber" },
    ]) +
      FG.bars(
        [
          ["MISSISSIPPI", 1.823, "teal", "bits/letter"],
          ["uniform over 4", 2, "violet"],
        ],
        { max: 2, fmt: (v) => v.toFixed(2) },
      ),
  );
  addV(
    "a7-huffman",
    0,
    FG.compare(
      {
        title: "Prefix-free ✓",
        c: "teal",
        body: "A=0 · B=10 · C=110 · D=111<br><code>010110</code> → 0|10|110 = <b>ABC</b>, only one reading",
      },
      {
        title: "Not prefix-free ✗",
        c: "rose",
        body: "A=0 · B=01<br><code>01</code> could be <b>B</b>, or A then something else",
      },
    ),
  );
  addV(
    "a7-huffman",
    2,
    FG.bars(
      [
        ["A (.35) depth 2", 0.7, "teal", "bits/symbol × p"],
        ["E (.08) depth 3", 0.24, "amber"],
        ["E at depth 2 instead?", 0.16, "dim", "would force A deeper"],
      ],
      { max: 0.8, fmt: (v) => v.toFixed(2) },
    ) + `<div class="fig-cap">Deep = expensive. Give the deepest spots to the symbols that appear least.</div>`,
  );
  addV(
    "a7-huffman",
    3,
    FG.cells(
      [
        { v: "A 00", c: "teal" },
        { v: "B 01", c: "teal" },
        { v: "C 10", c: "teal" },
        { v: "D 110", c: "violet" },
        { v: "E 111", c: "violet" },
      ],
      { size: 60 },
    ) +
      FG.bars(
        [
          ["Huffman average", 2.2, "teal", "bits"],
          ["entropy floor", 2.153, "violet"],
        ],
        { max: 2.4, fmt: (v) => v.toFixed(2) },
      ),
  );
  addV(
    "a7-huffman",
    4,
    FG.compare(
      {
        title: "Huffman",
        c: "teal",
        body: "learns <b>which symbols</b> are common. Needs frequencies up front, and the table travels with the message.",
      },
      {
        title: "LZW",
        c: "violet",
        body: "learns <b>which sequences repeat</b>. Builds its table on the fly, and sends no table at all.",
      },
    ),
  );
  addV(
    "a7-lzw",
    0,
    FG.flow([
      { t: "shared alphabet", s: "A B N D → 0 1 2 3" },
      { t: "encoder", s: "longest known match", c: "violet" },
      { t: "codes only", s: "no table sent" },
      { t: "decoder", s: "rebuilds same table", c: "teal" },
    ]),
  );
  addV(
    "a7-lzw",
    2,
    `<table class="t" style="max-width:480px"><tr><th>receive</th><th>output</th><th>decoder adds</th></tr><tr><td class="mono">1</td><td>B</td><td class="faint">—</td></tr><tr><td class="mono">0</td><td>A</td><td class="mono">4 = BA</td></tr><tr><td class="mono">2</td><td>N</td><td class="mono">5 = AN</td></tr><tr class="hl"><td class="mono">5</td><td>AN</td><td class="mono">6 = NA</td></tr></table><div class="fig-cap">Same numbers the encoder created, in the same order: the two sides stay in sync.</div>`,
  );
  addV(
    "a7-lzw",
    3,
    FG.frames([
      { t: "Encoder reads A, then AA is new → emit 0, add AA = 1", v: FG.cells([{ v: "0", c: "teal" }]) },
      { t: "…then immediately uses AA → emit 1", v: FG.cells([{ v: "0" }, { v: "1", c: "amber" }]) },
      {
        t: "Decoder gets 1 before it has built it → rule: previous + its first char = A + A",
        v: FG.cells([{ v: "A" }, "+", { v: "A", c: "amber" }, "=", { v: "AA", c: "teal" }]),
      },
    ]),
  );

  /* ---------- step-through runners (NIC.fig.run) ---------- */
  const SVGNS = "http://www.w3.org/2000/svg";

  /** Huffman tree building: the queue is the top row; each merge drops two roots under a new parent. Counts are editable. */
  function huffmanRun(box, life) {
    const SYM = [
      ["A", 35],
      ["B", 25],
      ["C", 20],
      ["D", 12],
      ["E", 8],
    ];
    const n = SYM.length,
      W = 460,
      H = 330,
      TOP = 40,
      DY = 58,
      SLOT = (W - 40) / n;
    // same tie rules as the demo: bit 0 goes to the larger child; on a tie a leaf beats a merged node, then the older node
    const kidsOrder = (x, y) => {
      if (x.f !== y.f) return x.f > y.f ? [x, y] : [y, x];
      if (x.leaf !== y.leaf) return x.leaf ? [x, y] : [y, x];
      return x.id < y.id ? [x, y] : [y, x];
    };
    function layout(roots) {
      const pos = {};
      let slot = 0;
      const place = (nd, d) => {
        if (nd.leaf) {
          pos[nd.id] = [20 + SLOT / 2 + slot++ * SLOT, TOP + d * DY];
          return;
        }
        nd.kids.forEach((k) => place(k, d + 1));
        pos[nd.id] = [(pos[nd.kids[0].id][0] + pos[nd.kids[1].id][0]) / 2, TOP + d * DY];
      };
      roots.forEach((r) => place(r, 0));
      return pos;
    }
    function* frames() {
      let id = 0;
      const leaves = SYM.map(([s, f]) => ({ id: id++, label: s, f, leaf: true }));
      const all = leaves.slice();
      let queue = leaves.slice();
      const sorted = () => queue.slice().sort((a, b) => a.f - b.f || a.id - b.id);
      const total = leaves.reduce((s, l) => s + l.f, 0);
      const snap = (x) => {
        const roots = sorted();
        return {
          pos: layout(roots),
          roots: roots.map((r) => r.id),
          nodes: all.map((nd) => ({
            id: nd.id,
            label: nd.label,
            f: nd.f,
            kids: nd.kids ? nd.kids.map((k) => k.id) : null,
          })),
          sel: [],
          codes: null,
          ...x,
        };
      };
      yield snap({
        cap: `The queue holds ${n} symbols, sorted by count (out of <b>${total}</b> symbols of text). Smallest on the left.`,
        line: 0,
      });
      for (let m = 0; queue.length > 1; m++) {
        const q = sorted(),
          [x, y] = q;
        const ties = q.filter((nd) => nd.f <= y.f).map((nd) => nd.label);
        const ask =
          m === 1 || m === 2
            ? {
                q: "Which two merge next? Tap one of them.",
                pick: ".rn-huf-node.rn-huf-root",
                a: ties,
                why: `The two smallest counts always merge: <b>${x.label} (${x.f})</b> and <b>${y.label} (${y.f})</b>.`,
              }
            : null;
        yield snap({
          sel: [x.id, y.id],
          ask,
          cap: `The two smallest counts: <b>${x.label}</b> (${x.f}) and <b>${y.label}</b> (${y.f}).`,
          line: 1,
        });
        const kids = kidsOrder(x, y),
          nd = { id: id++, label: kids.map((k) => k.label).join(""), f: x.f + y.f, leaf: false, kids };
        all.push(nd);
        queue = queue.filter((k) => k !== x && k !== y);
        queue.push(nd);
        yield snap({
          sel: [nd.id],
          cap: `Merge them into <b>${nd.label}</b>: ${x.f} + ${y.f} = <b>${nd.f}</b>. It goes back in the queue like any symbol.`,
          line: 2,
        });
      }
      const codes = {};
      const walk = (nd, s) => {
        if (nd.leaf) codes[nd.id] = s || "0";
        else {
          walk(nd.kids[0], s + "0");
          walk(nd.kids[1], s + "1");
        }
      };
      walk(queue[0], "");
      const bits = leaves.reduce((s, l) => s + l.f * codes[l.id].length, 0),
        fixed = Math.ceil(lg2(n)) * total;
      yield snap({
        codes,
        line: 3,
        mood: "love",
        cap: `One node left: the root. Read 0/1 down the branches: ${leaves.map((l) => `${l.label} = <b>${codes[l.id]}</b>`).join(", ")}. Total <b>${bits} bits</b> (${(bits / total).toFixed(2)} per symbol), vs ${fixed} with fixed ${Math.ceil(lg2(n))}-bit codes.`,
      });
    }
    const nodeCount = 2 * n - 1;
    FG.run(box, life, {
      code: [
        "queue = every symbol, sorted by count",
        "take the two smallest, x and y",
        "parent = x + y; put it back in the queue",
        "one node left: read 0/1 down to each leaf",
      ],
      build(stage, api) {
        const svg = document.createElementNS(SVGNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("class", "fig rn-svg rn-huf");
        svg.style.maxHeight = H + "px";
        let edges = "",
          nodes = "";
        for (let k = n; k < nodeCount; k++)
          edges += `<g class="rn-huf-e" data-p="${k}"><line class="rn-huf-l0" x1="0" y1="0" x2="0" y2="0"/><line class="rn-huf-l1" x1="0" y1="0" x2="0" y2="0"/><text class="rn-huf-bit rn-huf-b0" x="0" y="0">0</text><text class="rn-huf-bit rn-huf-b1" x="0" y="0">1</text></g>`;
        for (let k = 0; k < nodeCount; k++) {
          const leaf = k < n;
          nodes += `<g class="rn-huf-node ${leaf ? "rn-huf-leaf" : ""}" data-k="" transform="translate(${W / 2} ${TOP})" style="opacity:0"><g class="rn-huf-in">${
            leaf
              ? `<rect class="rn-huf-box" x="-20" y="-17" width="40" height="34" rx="10"/><text class="rn-huf-s" y="6">${SYM[k][0]}</text><g class="rn-huf-f"><rect x="-17" y="21" width="34" height="20" rx="7"/><text y="35">${SYM[k][1]}</text></g><text class="rn-huf-code" y="58" style="opacity:0"></text>`
              : `<circle class="rn-huf-box" r="19"/><text class="rn-huf-s rn-huf-sum" y="5"></text>`
          }</g></g>`;
        }
        svg.innerHTML = `<g>${edges}</g><g>${nodes}</g>`;
        stage.appendChild(svg);
        const s = {
          nodes: [...svg.querySelectorAll(".rn-huf-node")].map((g) => ({
            g,
            inner: g.querySelector(".rn-huf-in"),
            sum: g.querySelector(".rn-huf-sum"),
            fr: g.querySelector(".rn-huf-f text"),
            code: g.querySelector(".rn-huf-code"),
          })),
          edges: {},
        };
        svg
          .querySelectorAll(".rn-huf-e")
          .forEach(
            (g) =>
              (s.edges[g.dataset.p] = {
                g,
                l: [g.querySelector(".rn-huf-l0"), g.querySelector(".rn-huf-l1")],
                b: [g.querySelector(".rn-huf-b0"), g.querySelector(".rn-huf-b1")],
              }),
          );
        SYM.forEach((sym, k) =>
          api.edit(s.nodes[k].g.querySelector(".rn-huf-f"), {
            get: () => sym[1],
            set: (v) => {
              sym[1] = v;
              s.nodes[k].fr.textContent = v;
            },
            min: 1,
            max: 60,
          }),
        );
        return s;
      },
      draw(s, f, c) {
        const byId = {};
        f.nodes.forEach((nd) => (byId[nd.id] = nd));
        const prevIds = new Set(c.prev ? c.prev.nodes.map((nd) => nd.id) : []);
        const now = { instant: true };
        s.nodes.forEach((h, id) => {
          const nd = byId[id];
          if (!nd) {
            FG.rn.to(c, h.g, { opacity: 0 }, 0, 0.2);
            return;
          }
          h.g.dataset.k = nd.label;
          const [x, y] = f.pos[id],
            tr = `translate(${x} ${y})`,
            fresh = !c.instant && !prevIds.has(id);
          if (fresh) {
            FG.rn.to(now, h.g, { attr: { transform: tr }, opacity: 0 });
            FG.rn.to(c, h.g, { opacity: 1 }, 0.3, 0.3);
            FG.rn.pulse(c, h.inner, 0.55);
          } else FG.rn.to(c, h.g, { attr: { transform: tr }, opacity: 1 });
          h.g.classList.toggle("rn-huf-root", f.roots.includes(id));
          h.g.classList.toggle("rn-huf-sel", f.sel.includes(id));
          if (h.sum) h.sum.textContent = nd.f;
          if (h.fr) h.fr.textContent = nd.f;
          if (h.code) {
            if (f.codes) h.code.textContent = f.codes[id];
            FG.rn.to(c, h.code, { opacity: f.codes ? 1 : 0 }, 0.1, 0.3);
          }
        });
        Object.entries(s.edges).forEach(([pid, e]) => {
          const nd = byId[pid];
          if (!nd) {
            FG.rn.to(c, e.g, { opacity: 0 }, 0, 0.2);
            return;
          }
          const [px, py] = f.pos[pid],
            fresh = !c.instant && !prevIds.has(+pid);
          nd.kids.forEach((kid, b) => {
            const [cx, cy] = f.pos[kid],
              leaf = kid < n;
            const at = { x1: px, y1: py + 19, x2: cx, y2: cy - (leaf ? 17 : 19) };
            FG.rn.to(fresh ? now : c, e.l[b], { attr: at });
            const mx = (px + cx) / 2 + (b ? 9 : -9),
              my = (py + 19 + cy - 18) / 2 + 4;
            FG.rn.to(fresh ? now : c, e.b[b], { attr: { x: mx, y: my } });
            FG.rn.to(c, e.b[b], { opacity: f.codes ? 1 : 0 }, 0.1, 0.3);
          });
          if (fresh) {
            FG.rn.to(now, e.g, { opacity: 0 });
            FG.rn.to(c, e.g, { opacity: 1 }, 0.3, 0.3);
          } else FG.rn.to(c, e.g, { opacity: 1 });
        });
      },
      frames,
    });
  }

  /** LZW encoding: cursor over the input, the current string w, the dictionary growing, codes going out. The message is editable. */
  function lzwRun(box, life) {
    const ALPHA = ["A", "B", "N", "D"],
      MAXLEN = 16,
      SLOTS = ALPHA.length + MAXLEN;
    let text = "BANANABANDANA";
    function* frames() {
      const s = text,
        dict = new Map(ALPHA.map((ch, i) => [ch, i]));
      // pre-pass: which checks get a question (a multi-letter "yes", then the last multi-letter check if it isn't adjacent)
      const checks = [];
      {
        let w = "";
        const d = new Set(ALPHA);
        for (let p = 0; p < s.length; p++) {
          const wc = w + s[p];
          checks.push({ p, wc, has: d.has(wc) });
          if (d.has(wc)) w = wc;
          else {
            d.add(wc);
            w = s[p];
          }
        }
      }
      const multi = checks.filter((k) => k.wc.length > 1),
        asks = new Set();
      const firstYes = multi.find((k) => k.has) || multi[0];
      if (firstYes) asks.add(firstYes.p);
      const last = multi[multi.length - 1];
      if (last && firstYes && last.p - firstYes.p >= 2) asks.add(last.p);
      let w = "";
      const out = [],
        entries = ALPHA.map((ch, i) => [i, ch]);
      const snap = (x) => ({
        w,
        out: out.slice(),
        entries: entries.map((e) => e.slice()),
        cur: -1,
        wr: [0, 0],
        wc: "",
        yn: "",
        add: -1,
        hit: -1,
        ...x,
      });
      yield snap({
        cap: `Start with the alphabet: ${ALPHA.map((ch, i) => `${ch} = ${i}`).join(", ")}. The current string <b>w</b> is empty.`,
        line: 0,
      });
      for (let p = 0; p < s.length; p++) {
        const ch = s[p],
          wc = w + ch,
          has = dict.has(wc);
        yield snap({
          cur: p,
          wr: [p - w.length, p],
          wc,
          cap: `Read <b>${ch}</b>. Is w + c = <b>${wc}</b> in the dictionary?`,
          line: 1,
        });
        const ask = asks.has(p)
          ? {
              q: `Is <b>${wc}</b> already in the dictionary? Tap yes or no.`,
              pick: ".rn-lzw-yn",
              a: has ? "yes" : "no",
              why: has
                ? `${wc} was added earlier as entry <b>${dict.get(wc)}</b>, so w just grows.`
                : `${wc} has never been seen, so it becomes entry <b>${dict.size}</b>.`,
            }
          : null;
        if (has) {
          w = wc;
          yield snap({
            cur: p,
            wr: [p + 1 - w.length, p + 1],
            wc,
            yn: "yes",
            hit: dict.get(wc),
            ask,
            line: 2,
            cap: `Yes, <b>${wc}</b> is entry ${dict.get(wc)}. Keep it: w = <b>${wc}</b>.`,
          });
        } else {
          const code = dict.get(w),
            nc = dict.size;
          out.push(code);
          dict.set(wc, nc);
          entries.push([nc, wc]);
          const pw = w;
          w = ch;
          yield snap({
            cur: p,
            wr: [p, p + 1],
            wc,
            yn: "no",
            add: nc,
            ask,
            line: 3,
            cap: `No. Output <b>${code}</b> (for ${pw}), add <b>${wc} = ${nc}</b>, and restart w = <b>${ch}</b>.`,
          });
        }
      }
      const code = dict.get(w);
      out.push(code);
      yield snap({
        cur: -1,
        wr: [s.length - w.length, s.length],
        line: 4,
        mood: "love",
        hit: code,
        cap: `End of input: output <b>${code}</b> for w = ${w}. That's <b>${out.length} codes</b> for ${s.length} letters: ${out.join(", ")}.`,
      });
    }
    FG.run(box, life, {
      code: [
        "dictionary = the alphabet; w = empty",
        "read the next letter c",
        "if w + c is in it: w = w + c",
        "else: output code(w), add w + c, w = c",
        "at the end: output code(w)",
      ],
      build(stage, api) {
        const root = el(`<div class="rn-lzw">
          <label class="rn-lzw-in">Message <input type="text" maxlength="${MAXLEN}" value="${text}" spellcheck="false" autocomplete="off" aria-label="Message to encode (letters A, B, N, D)"><span>A B N D only</span></label>
          <div class="rn-lzw-tape">${Array.from({ length: MAXLEN }, () => `<span class="rn-lzw-cell"></span>`).join("")}</div>
          <div class="rn-lzw-mid">
            <div class="rn-lzw-box"><small>w</small><b class="rn-lzw-w">·</b></div>
            <div class="rn-lzw-box rn-lzw-ask"><small>w + c in the dictionary?</small><div><b class="rn-lzw-wc">·</b><span class="rn-lzw-yn" data-k="yes">yes</span><span class="rn-lzw-yn" data-k="no">no</span></div></div>
          </div>
          <div class="rn-lzw-row"><small>output</small><div class="rn-lzw-out">${Array.from({ length: MAXLEN }, () => `<span class="rn-lzw-code"></span>`).join("")}</div></div>
          <div class="rn-lzw-row"><small>dictionary</small><div class="rn-lzw-dict">${Array.from({ length: SLOTS }, () => `<span class="rn-lzw-ent"><i></i><b></b></span>`).join("")}</div></div>
        </div>`);
        stage.appendChild(root);
        const inp = qs("input", root);
        let t = 0;
        inp.addEventListener("keydown", (e) => e.stopPropagation());
        inp.addEventListener("input", () => {
          const v = inp.value
            .toUpperCase()
            .replace(/[^ABND]/g, "")
            .slice(0, MAXLEN);
          if (v !== inp.value) inp.value = v;
          clearTimeout(t);
          if (v.length < 2) return;
          t = setTimeout(() => {
            text = v;
            api.recompute();
          }, 500);
        });
        life.onCleanup(() => clearTimeout(t));
        return {
          root,
          cells: qsa(".rn-lzw-cell", root),
          w: qs(".rn-lzw-w", root),
          wc: qs(".rn-lzw-wc", root),
          yn: qsa(".rn-lzw-yn", root),
          codes: qsa(".rn-lzw-code", root),
          ents: qsa(".rn-lzw-ent", root),
        };
      },
      draw(s, f, c) {
        s.cells.forEach((cell, k) => {
          cell.hidden = k >= text.length;
          cell.textContent = text[k] || "";
          cell.classList.toggle("rn-lzw-done", k < f.wr[0]);
          cell.classList.toggle("rn-lzw-inw", k >= f.wr[0] && k < f.wr[1]);
          cell.classList.toggle("rn-lzw-cur", k === f.cur && !f.yn);
        });
        FG.rn.text(c, s.w, f.w || "·");
        FG.rn.text(c, s.wc, f.wc || "·");
        s.yn.forEach((b) => {
          b.classList.toggle("rn-lzw-on", b.dataset.k === f.yn);
          b.classList.toggle("rn-lzw-off", !!f.yn && b.dataset.k !== f.yn);
        });
        const pOut = c.prev ? c.prev.out.length : 0,
          pEnt = c.prev ? c.prev.entries.length : 0;
        s.codes.forEach((el2, k) => {
          const on = k < f.out.length;
          el2.hidden = !on;
          if (!on) return;
          el2.textContent = f.out[k];
          if (k >= pOut && !c.instant) {
            FG.rn.to({ instant: true }, el2, { opacity: 0, scale: 0.4 });
            FG.rn.to(c, el2, { opacity: 1, scale: 1 }, 0.1, 0.35);
          } else FG.rn.to({ instant: true }, el2, { opacity: 1, scale: 1 });
        });
        s.ents.forEach((en, k) => {
          const e = f.entries[k];
          en.hidden = !e;
          if (!e) return;
          en.firstChild.textContent = e[0];
          en.lastChild.textContent = e[1];
          en.classList.toggle("rn-lzw-new", e[0] === f.add);
          en.classList.toggle("rn-lzw-hit", e[0] === f.hit);
          if (k >= pEnt && !c.instant) {
            FG.rn.to({ instant: true }, en, { opacity: 0, y: -8 });
            FG.rn.to(c, en, { opacity: 1, y: 0 }, 0.15, 0.35);
          } else FG.rn.to({ instant: true }, en, { opacity: 1, y: 0 });
        });
      },
      frames,
    });
  }

  const addStep = (id, at, step) => {
    if (L[id]) L[id].steps.splice(at, 0, step);
  };
  addStep("a7-huffman", 2, {
    t: "Watch it run",
    b: `<p>Here is the merge on the lecture set, as counts per 100 symbols. Press <b>play</b> or step with the arrows. The top row is always the queue.</p><p>It will pause and ask you to pick the next pair. Tap a count to change it and the tree rebuilds.</p>`,
    v: (box, life) => huffmanRun(box, life),
  });
  addStep("a7-lzw", 2, {
    t: "Watch it run",
    b: `<p>The encoder on BANANABANDANA. Press <b>play</b> or step with the arrows: the cursor reads one letter at a time, and each new pair joins the dictionary.</p><p>It will pause and ask you to predict. Type your own message (A, B, N, D only) and the run restarts.</p>`,
    v: (box, life) => lzwRun(box, life),
  });
})();
