(function () {
  const partScope = (NIC.shared.algoP1 = NIC.shared.algoP1 || {});
  const { PATS, table } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header, esc } = N;
  const L = NIC.LESSONS;

  N.register({
    id: "a1-bigo",
    subject: "algo",
    lecture: 1,
    order: 2,
    num: "1.2",
    title: "How loops grow",
    blurb: "Double the input, watch the work. Every loop pattern has a signature: ×2, ×4, or +1.",
    render(root) {
      root.appendChild(header(this, ""));
      let pat = "dependent",
        n = 8,
        rows = [];
      const card = el(`<div class="card">
        <div class="card-head"><h2>The doubling experiment</h2><span class="faint">each row doubles n — what does work() do?</span></div>
        <div class="grid side">
          <div>
            <div class="controls" id="seg"></div>
            <div class="pseudo" id="code"></div>
            <p class="dim" id="pnote" style="margin:8px 0 0;font-size:13.5px"></p>
            <div class="controls">
              <button class="btn primary" id="dbl">Double n →</button>
              <button class="btn" id="run4">Run to n = 4096</button>
              <button class="btn ghost" id="rs">Reset</button>
            </div>
          </div>
          <div>
            <table class="t" id="tbl"><tr><th>n</th><th>work() calls</th><th>× previous</th><th>+ previous</th></tr></table>
            <div id="sig" style="margin-top:10px"></div>
          </div>
        </div></div>`);
      root.appendChild(card);
      qs("#seg", card).appendChild(
        N.seg(
          Object.keys(PATS).map((k) => [k, PATS[k].name]),
          pat,
          (v) => {
            pat = v;
            reset();
          },
        ),
      );
      const drawCode = () => {
        qs("#code", card).innerHTML = PATS[pat].code
          .split("\n")
          .map((s) => `<div>${esc(s)}</div>`)
          .join("");
        qs("#pnote", card).innerHTML = `${PATS[pat].note} &nbsp;Class: <b>${PATS[pat].cls}</b>`;
      };
      function drawTbl() {
        const t = qs("#tbl", card);
        t.innerHTML =
          `<tr><th>n</th><th>work() calls</th><th>× previous</th><th>+ previous</th></tr>` +
          rows
            .map((r, k) => {
              const prev = k ? rows[k - 1].ops : null;
              return `<tr><td>${r.n.toLocaleString()}</td><td>${r.ops.toLocaleString()}</td>
            <td>${prev === null ? "—" : "×" + (r.ops / prev).toFixed(2)}</td>
            <td>${prev === null ? "—" : "+" + (r.ops - prev).toLocaleString()}</td></tr>`;
            })
            .join("");
        const last2 = rows.slice(-2);
        let sig = "";
        if (last2.length === 2 && rows.length >= 3) {
          const ratio = last2[1].ops / last2[0].ops,
            diff = last2[1].ops - last2[0].ops;
          sig =
            ratio > 3
              ? `<span class="pill rose">×~4 each doubling → quadratic O(n²)</span>`
              : ratio > 1.5
                ? `<span class="pill teal">×~2 each doubling → linear O(n)</span>`
                : diff <= 2
                  ? `<span class="pill amber">+~1 each doubling → logarithmic O(log n)</span>`
                  : "";
        }
        qs("#sig", card).innerHTML = sig;
      }
      function dbl() {
        rows.push({ n, ops: PATS[pat].f(n) });
        n *= 2;
        drawTbl();
      }
      function reset() {
        n = 8;
        rows = [];
        drawCode();
        dbl();
      }
      qs("#dbl", card).onclick = () => {
        if (n <= 65536) dbl();
      };
      qs("#run4", card).onclick = () => {
        while (n <= 4096) dbl();
      };
      qs("#rs", card).onclick = reset;
      reset();
      // all four compared at n=1024, log-scaled so the tiny ones stay visible
      const comp =
        el(`<div class="card"><div class="card-head"><h3>All four at n = 1,024</h3><span class="faint">bar width is log-scaled, or you'd never see the small ones</span></div>
        <div style="display:grid;gap:7px">${Object.values(PATS)
          .map((p) => {
            const ops = p.f(1024),
              w = (Math.log10(Math.max(1, ops)) / 6) * 100;
            return `<div style="display:grid;grid-template-columns:150px 1fr 130px;gap:10px;align-items:center"><span class="mono dim" style="font-size:12.5px">${p.name} <b>${p.cls}</b></span><span style="height:14px;border-radius:7px;background:var(--bg-2);border:1px solid var(--line);overflow:hidden"><span style="display:block;height:100%;width:${w.toFixed(1)}%;background:var(--violet)"></span></span><span class="mono">${ops.toLocaleString()} calls</span></div>`;
          })
          .join("")}</div>
        <p class="dim" style="margin:10px 0 0;font-size:13.5px">The quadratic patterns did <b>~100,000×</b> more work than halving — at n = 1024. At web scale that gap is the difference between "finished before lunch" and "heat death of the universe".</p></div>`);
      root.appendChild(comp);
      root.appendChild(
        predict({
          id: "a1-bigo-1",
          q: "The growing-inner loop runs <code>work()</code> n(n−1)/2 times. You double n. The work goes up by roughly…",
          opts: ["×2 — twice the input, twice the work", "×4 — it behaves like n²", "+1 — like the halving loop"],
          a: 1,
          why: "$\\frac{n(n-1)}{2} \\approx \\frac{n^2}{2}$ for large n, and $\\frac{(2n)^2}{2} = 4 \\cdot \\frac{n^2}{2}$. Halving a quadratic just makes a <i>cheaper</i> quadratic — try it in the table above.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Count <code>work()</code> calls as a function of n — seconds lie, counts don't.",
            "Doubling signatures: ×2 → O(n), ×4 → O(n²), +1 → O(log n).",
            "<code>n(n−1)/2</code> is still O(n²): Big-O keeps the dominant term, drops constants.",
            "Exponential (2ⁿ) eventually beats every polynomial, no matter how big the degree.",
          ],
          "Double the input and watch what the work does: ×2 is linear, ×4 is quadratic, +1 is logarithmic.",
        ),
      );
    },
  });

  /* ================================================================
     1.3 — The random surfer
     ================================================================ */
  const SURF = {
    leaky: {
      name: "The leaky web",
      nodes: { A: [80, 60], B: [290, 45], C: [180, 160], D: [430, 130] },
      out: { A: ["B", "C"], B: ["C"], C: ["A", "D"], D: [] },
      note: "D is a <b>dangling</b> page: pages link to it, but it links nowhere. Without teleports, the surfer parks there forever once it arrives.",
      converges: "C ≈ 35%, A ≈ D ≈ 23%, B ≈ 19%",
    },
    trap: {
      name: "The link trap",
      nodes: { X: [80, 105], A: [250, 70], B: [420, 135] },
      out: { X: ["A"], A: ["B"], B: ["A"] },
      note: "A ↔ B bounce rank between themselves forever. X feeds them but gets nothing back. Only teleports let the surfer escape.",
      converges: "A ≈ 49%, B ≈ 46%, X ≈ 5% (pure teleport floor)",
    },
  };
  L["a1-surfer"] = {
    sum: "Rank <b>flows</b> through links and splits over out-degree. Dead ends leak it, closed loops trap it — a small <b>teleport</b> probability fixes both.",
    steps: [
      {
        t: "Rank is a flow, not a count",
        b: `<p>Counting incoming links is easy to cheat and wrong in spirit: one link from an important page outweighs fifty from empty blogs. PageRank treats rank like <b>water</b>:</p><p>① every page <b>pours all its rank</b> into its outgoing links, split equally;<br>② a link from an important page carries more;<br>③ a page linking to 100 places dilutes each drop to 1/100.</p>`,
        c: {
          q: "X has rank 0.8 and 100 outgoing links; Y has rank 0.2 and one link. Both link to Z. Who contributes more?",
          o: [
            "X, because its rank is four times higher than Y's",
            "Y: X's share is diluted to 0.008; Y gives 0.2",
            "They tie, since each of them links to Z exactly once",
          ],
          a: 1,
          why: "A link's worth = source rank ÷ out-degree. 0.8/100 = 0.008 &lt; 0.2/1 = 0.2.",
        },
      },
      {
        t: "The token trace",
        b: `<p>Give every page <b>25 tokens</b>. Each pours all of them, split equally over outgoing links. On the leaky web (A→B,C · B→C · C→A,D · D→nowhere):</p>`,
        v:
          table(
            ["Source", "Pours", "To"],
            [
              ["A", "12.5 each", "B, C"],
              ["B", "25", "C"],
              ["C", "12.5 each", "A, D"],
              ["D", "25", "<b>nowhere</b>"],
            ],
          ) +
          `<p style="margin-top:10px">Received: A = 12.5, B = 12.5, C = 37.5, D = 12.5 — total <b>75, not 100</b>.</p>`,
        c: {
          q: "Where did the missing 25 tokens go?",
          o: ["To the page with most links", "They evaporated", "They doubled back to A"],
          a: 1,
          why: "D holds 25 tokens with nowhere to send them. A dangling page leaks rank out of the system entirely.",
        },
      },
      {
        t: "The repair: pour to everyone",
        b: `<p>The standard fix treats “no outgoing choice” as <b>complete uncertainty</b>: a dangling page distributes its rank <b>uniformly to all pages</b> (25 tokens → 6.25 each on a 4-page web). Total returns to 100, and no link knowledge is invented.</p><span class="key">Mass can't vanish in a probability model. If a page can't choose, it chooses everything.</span>`,
      },
      {
        t: "The link trap",
        b: `<p>Dangling isn't the only failure. Take <code>X → A → B → A</code>: once rank enters the A↔B cycle, it <b>sloshes between them forever</b> — conserved, but trapped. X sits at 0 and the ranking says nothing real about A vs B.</p>`,
        v:
          table(
            ["Step", "X", "A", "B"],
            [
              { c: ["0", "25", "25", "25"] },
              { c: ["1", "0", "50", "25"] },
              { c: ["2", "0", "25", "50"] },
              { c: ["3", "0", "50", "25"], bad: true },
            ],
          ) + `<p class="dim" style="margin-top:8px">A↔B oscillate forever. The trap is plugged only by…</p>`,
      },
      {
        t: "The random surfer rule",
        b: `<p>A lazy reader clicks links. A lazier reader sometimes types a random address:</p><span class="key">With probability <b>d ≈ 0.85</b>: follow a random outgoing link.<br>With probability <b>1 − d ≈ 0.15</b>: teleport to a random page.</span><p>Teleporting escapes every trap, crosses disconnected islands, and gives every page a floor of attention. The price: damping is a dial between “trust the link structure” and “trust nothing”.</p>`,
        c: {
          q: "A search engine sets d = 0.999. Most likely effect?",
          o: [
            "Rankings get faster to compute and fairer",
            "Traps and dangling behaviour come back",
            "The rankings stay exactly the same",
          ],
          a: 1,
          why: "d → 1 means the surfer almost never escapes. Convergence slows and pathological graphs dominate again.",
        },
      },
    ],
    guide: [
      "Press <b>Surf</b> and watch the dot hop along links. Occasionally it teleports (orange flash).",
      "Watch the visit bars settle — compare with the long-run PageRank values under each bar.",
      "Drag damping to <b>1.00</b> (never teleport) on the leaky web: the surfer eventually parks at D forever.",
      "Switch to <b>The link trap</b> with d = 1.00: watch A↔B oscillate while X starves. Then lower d and watch X come back to ~5%.",
      "Answer the Predict question.",
    ],
  };
  Object.assign(partScope, { SURF });
})();
