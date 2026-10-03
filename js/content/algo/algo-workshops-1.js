/* Algorithms, Phase 1 workshop: 1.C "Code PageRank" (code lab).
   The learner writes the heart of power iteration: share rank out along links, pour a dead end to everyone, and damp.
   Every expected value is produced by running the reference algorithm below, never typed. */
(function () {
  const N = NIC,
    { qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const NS = "http://www.w3.org/2000/svg";
  const ITERS = 16;

  /** Reference PageRank (the lecture's formulation): p <- d * (A p) + (1 - d) / n, dead ends pour to everyone. */
  function ref(graph, d, iters) {
    const pages = Object.keys(graph),
      n = pages.length;
    let rank = {};
    pages.forEach((p) => (rank[p] = 1 / n));
    for (let k = 0; k < iters; k++) {
      const next = {};
      pages.forEach((p) => (next[p] = 0));
      pages.forEach((p) => {
        const links = graph[p];
        if (!links.length) pages.forEach((q) => (next[q] += rank[p] / n));
        else links.forEach((q) => (next[q] += rank[p] / links.length));
      });
      pages.forEach((p) => (next[p] = d * next[p] + (1 - d) / n));
      rank = next;
    }
    const out = {};
    pages.forEach((p) => (out[p] = Math.round(rank[p] * 1000) / 1000));
    return out;
  }
  const near = (got, want) => {
    if (!got || typeof got !== "object") return false;
    const ks = Object.keys(want);
    return (
      Object.keys(got).length === ks.length &&
      ks.every((k) => typeof got[k] === "number" && Math.abs(got[k] - want[k]) < 0.0015)
    );
  };

  // Three small webs. The third is the lecture's "leaky web".
  const G1 = { A: ["B", "C"], B: ["C"], C: ["A"] };
  const G2 = { X: ["A"], A: ["B"], B: ["A"] };
  const G3 = { A: ["B", "C"], B: ["C"], C: ["A", "D"], D: [] };
  const P1 = { A: [80, 70], B: [260, 70], C: [170, 220] };
  const P2 = { X: [70, 150], A: [230, 70], B: [230, 230] };
  const P3 = { A: [70, 70], B: [250, 60], C: [160, 220], D: [340, 210] };

  const STARTER = `def pagerank(graph, d, iters):
    pages = list(graph)
    n = len(pages)
    rank = {p: 1 / n for p in pages}           # everyone starts equal

    for k in range(1, iters + 1):
        nxt = {p: 0 for p in pages}

        for p in pages:
            links = graph[p]
            if len(links) == 0:
                # 2. A dead end: pour its rank equally into every page.
                for q in pages:
                    # YOUR CODE: add an equal 1/n share of rank[p] to nxt[q]
                    pass
            else:
                # 1. Share the rank out equally along the links.
                for q in links:
                    # YOUR CODE: add q's share of rank[p] to nxt[q]
                    pass

        # 3. Damping: follow links with probability d, teleport with 1 - d.
        for p in pages:
            # YOUR CODE: nxt[p] = d times the rank that arrived, plus the teleport floor
            pass

        trace({"iter": k, "rank": dict(nxt)})
        rank = nxt

    return {p: round(rank[p], 3) for p in pages}   # round for display`;
  const SOLUTION = `def pagerank(graph, d, iters):
    pages = list(graph)
    n = len(pages)
    rank = {p: 1 / n for p in pages}           # everyone starts equal

    for k in range(1, iters + 1):
        nxt = {p: 0 for p in pages}

        for p in pages:
            links = graph[p]
            if len(links) == 0:
                # 2. A dead end: pour its rank equally into every page.
                for q in pages:
                    nxt[q] += rank[p] / n
            else:
                # 1. Share the rank out equally along the links.
                for q in links:
                    nxt[q] += rank[p] / len(links)

        # 3. Damping: follow links with probability d, teleport with 1 - d.
        for p in pages:
            nxt[p] = d * nxt[p] + (1 - d) / n

        trace({"iter": k, "rank": dict(nxt)})
        rank = nxt

    return {p: round(rank[p], 3) for p in pages}   # round for display`;

  /* ---------- the picture: a link graph whose blobs swell with rank, plus rank bars ---------- */
  const num = (v) => (typeof v === "number" && isFinite(v) ? v : 0);
  const fmt3 = (v) => (typeof v === "number" && isFinite(v) ? v.toFixed(3) : "?");

  function prScene() {
    function edgeGeom(pos, out, u, v) {
      const [x1, y1] = pos[u],
        [x2, y2] = pos[v];
      const dx = x2 - x1,
        dy = y2 - y1,
        len = Math.hypot(dx, dy) || 1,
        ux = dx / len,
        uy = dy / len;
      const back = out[v] && out[v].includes(u),
        off = back ? 16 : 0;
      const nx = -uy * off,
        ny = ux * off;
      const sx = x1 + ux * 36 + nx,
        sy = y1 + uy * 36 + ny,
        ex = x2 - ux * 44 + nx,
        ey = y2 - uy * 44 + ny;
      return { sx, sy, ex, ey, cx: (sx + ex) / 2 + nx * 0.6, cy: (sy + ey) / 2 + ny * 0.6 };
    }
    return {
      build(stage, test) {
        const out = test.args[0],
          d = test.args[1],
          pos = test.view.pos,
          names = Object.keys(out),
          n = names.length;
        const floor = (1 - d) / n;
        const edges = [];
        names.forEach((u) => out[u].forEach((v) => edges.push([u, v])));
        stage.innerHTML = `<div class="cl-layout aw1-lay"><div><svg class="aw1-svg" viewBox="0 0 420 290" role="img" aria-label="A small web of linked pages. Bigger blobs have more rank.">
          <defs><marker id="aw1-ah" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2,2 L10,6 L2,10" fill="none" stroke="var(--text-faint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
          ${edges
            .map(([u, v]) => {
              const g = edgeGeom(pos, out, u, v);
              return `<path class="aw1-e" data-e="${u}${v}" d="M${g.sx},${g.sy} Q${g.cx},${g.cy} ${g.ex},${g.ey}" marker-end="url(#aw1-ah)"/>`;
            })
            .join("")}
          ${names.map((p) => `<g class="aw1-n${out[p].length ? "" : " dead"}" data-n="${p}"><g class="aw1-nb" style="transform:scale(1)"><circle cx="${pos[p][0]}" cy="${pos[p][1]}" r="30"/></g><text class="aw1-nm" x="${pos[p][0]}" y="${pos[p][1]}">${p}</text><text class="aw1-nv" x="${pos[p][0]}" y="${pos[p][1] + 54}"></text>${out[p].length ? "" : `<text class="aw1-dead" x="${pos[p][0]}" y="${pos[p][1] - 48}">dead end</text>`}</g>`).join("")}
          <g class="aw1-top"></g></svg>
          <div class="aw1-key"><span><i class="k big"></i>most rank</span><span><i class="k"></i>other pages</span><span><i class="k dead"></i>links nowhere</span></div></div>
          <div class="aw1-side"><div class="aw1-bars">${names.map((p) => `<div class="aw1-br" data-p="${p}"><b>${p}</b><span class="aw1-tr"><i></i><u style="left:${Math.min(100, (floor / 0.6) * 100)}%" title="teleport floor"></u></span><output>0.000</output></div>`).join("")}</div>
          <div class="aw1-foot faint">The small tick on each bar is the <b>teleport floor</b>, (1 − d) ÷ n = ${floor.toFixed(3)}.</div>
          <div class="wk-stats"><div class="wk-stat blue" data-s="it"><small>Round</small><b>0</b></div><div class="wk-stat teal" data-s="mass"><small>Total rank</small><b>1.000</b></div><div class="wk-stat amber" data-s="mv"><small>Biggest change</small><b>-</b></div></div></div></div>`;
        const svg = qs("svg", stage);
        const h = { svg, names, pos, out, d, n, floor, stage, edgeGeom: (u, v) => edgeGeom(pos, out, u, v) };
        this.reset(h);
        return h;
      },
      paint(h, rank, iter, prev) {
        const names = h.names,
          vals = names.map((p) => num(rank[p]));
        const mx = Math.max(...vals),
          mass = vals.reduce((a, b) => a + b, 0);
        names.forEach((p, i) => {
          const v = vals[i],
            g = qs(`.aw1-n[data-n="${p}"]`, h.svg);
          qs(".aw1-nb", g).style.transform = `scale(${Math.max(0.5, 2.07 * Math.sqrt(v)).toFixed(3)})`;
          qs(".aw1-nv", g).textContent = iter ? fmt3(rank[p]) : v.toFixed(3);
          g.classList.toggle("top", iter > 0 && v === mx && mx > 1 / h.n + 0.004);
          const row = qs(`.aw1-br[data-p="${p}"]`, h.stage);
          qs("i", row).style.transform = `scaleX(${Math.max(0, Math.min(1, v / 0.6)).toFixed(3)})`;
          qs("output", row).textContent = fmt3(rank[p]);
        });
        const set = (k, t, cls) => {
          const s = qs(`[data-s="${k}"]`, h.stage);
          qs("b", s).textContent = t;
          if (cls) s.className = `wk-stat ${cls}`;
          return s;
        };
        set("it", String(iter));
        const leak = Math.abs(mass - 1) > 0.005;
        const ms = set("mass", mass.toFixed(3), leak ? "rose" : "teal");
        if (leak && iter && fxOn() && N.wk) N.wk.flash(ms);
        const mv = prev ? Math.max(...names.map((p) => Math.abs(num(rank[p]) - num(prev[p])))) : null;
        set("mv", mv === null || !iter ? "-" : mv < 0.0005 ? "under 0.001" : mv.toFixed(3));
      },
      reset(h) {
        const r = {};
        h.names.forEach((p) => (r[p] = 1 / h.n));
        qs(".aw1-top", h.svg).innerHTML = "";
        this.paint(h, r, 0, null);
      },
      async frame(h, f, { i, frames, animate }) {
        if (!f) return this.reset(h);
        const prev =
          i > 0
            ? frames[i - 1].rank
            : (() => {
                const r = {};
                h.names.forEach((p) => (r[p] = 1 / h.n));
                return r;
              })();
        const top = qs(".aw1-top", h.svg);
        top.innerHTML = "";
        this.paint(h, f.rank || {}, f.iter || i + 1, prev);
        if (animate && fxOn()) this.flow(h, prev, top);
      },
      /** One light packet per link, sized by the rank it carries: the "share out" made visible. */
      flow(h, prev, top) {
        h.names.forEach((u) => {
          const links = h.out[u],
            dead = !links.length,
            targets = dead ? h.names.filter((q) => q !== u) : links;
          const share = num(prev[u]) / (dead ? h.n : links.length);
          targets.forEach((v) => {
            const path = qs(`[data-e="${u}${v}"]`, h.svg);
            let pts;
            if (path) {
              const L = path.getTotalLength();
              pts = [0, 0.25, 0.5, 0.75, 1].map((t) => path.getPointAtLength(L * t));
            } else {
              const a = h.pos[u],
                b = h.pos[v];
              pts = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t }));
            }
            const dot = document.createElementNS(NS, "circle");
            dot.setAttribute("r", (3 + share * 16).toFixed(1));
            dot.setAttribute("class", "aw1-pkt" + (dead ? " dead" : ""));
            top.appendChild(dot);
            const a = dot.animate(
              pts.map((p, k) => ({
                transform: `translate(${p.x}px,${p.y}px)`,
                opacity: k === 0 || k === 4 ? 0.15 : 1,
              })),
              { duration: 380, easing: "ease-in-out", fill: "forwards" },
            );
            a.finished.then(() => dot.remove()).catch(() => dot.remove());
          });
        });
      },
      caption(f, { i, frames, test }) {
        const r = f.rank || {},
          names = Object.keys(test.args[0]),
          vals = names.map((p) => num(r[p]));
        const mass = vals.reduce((a, b) => a + b, 0),
          best = names[vals.indexOf(Math.max(...vals))];
        if (names.some((p) => typeof r[p] !== "number" || !isFinite(r[p])))
          return `Round <b>${f.iter}</b>: one of the ranks is not a number. Look for a division by zero or a value that was never set.`;
        if (Math.abs(mass - 1) > 0.005)
          return `Round <b>${f.iter}</b>: the ranks add up to <b>${mass.toFixed(3)}</b>, not 1. Rank has ${mass < 1 ? "leaked away: did every page pass all of its rank on?" : "been created from nothing: is a share too big?"}`;
        const prev = i > 0 ? frames[i - 1].rank : null,
          mv = prev ? Math.max(...names.map((p) => Math.abs(num(r[p]) - num(prev[p])))) : 1;
        return `Round <b>${f.iter}</b>: <b>${best}</b> leads with ${fmt3(r[best])}. Total rank is 1.000. ${mv < 0.002 ? "Hardly anything moved: it has settled." : "The blobs are still moving."}`;
      },
    };
  }

  N.register({
    id: "a1-code",
    subject: "algo",
    lecture: 1,
    order: 90,
    num: "1.C",
    workshop: true,
    title: "Workshop: code PageRank",
    blurb: "Write the share-out and damping steps, then watch rank flow round a little web.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.codelab(root, life, {
        who: "byte",
        noun: "PageRank",
        entry: "pagerank",
        watch: true,
        intro:
          "You've seen rank flow round a web. Now make the computer do it. There are <b>three blanks</b>, marked in orange. Everything else is written for you.",
        brief:
          "<b>Goal:</b> return each page's rank after <code>iters</code> rounds. <code>graph</code> is a dict mapping a page to the list of pages it links to, and you return a dict of ranks. Every round, each page shares its rank equally along its links, then <code>d</code> (the damping) is applied. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> runs the tests.",
        starter: STARTER,
        solution: SOLUTION,
        hints: [
          "Blank 1 is the token trace from the lecture: a page with rank <code>r</code> and <code>k</code> links sends <code>r / k</code> down <b>each</b> link. Use <code>len(links)</code> for k.",
          "Blank 2 is the same idea for a page with no links, but the share goes to <b>all n pages</b>: add <code>rank[p] / n</code> to <code>nxt[q]</code>.",
          "Blank 3 is the surfer rule: <code>nxt[p] = d * nxt[p] + (1 - d) / n</code>. The teleport part is the same for every page.",
        ],
        tests: [
          {
            name: "Three pages",
            desc: "A links to B and C, B links to C, C links back to A. d = 0.85.",
            args: [G1, 0.85, ITERS],
            expect: ref(G1, 0.85, ITERS),
            cmp: near,
            view: { pos: P1 },
            hint: "If the total is wrong, check that a page passes on <b>all</b> of its rank: divide by how many links it has, not by n.",
          },
          {
            name: "Nobody links to X",
            desc: "X feeds A, but nothing feeds X. It should still keep a small floor, not zero.",
            args: [G2, 0.85, ITERS],
            expect: ref(G2, 0.85, ITERS),
            cmp: near,
            view: { pos: P2 },
            hint: "X only ever gets the teleport floor, so it only appears if you add <code>(1 - d) / n</code> to <b>every</b> page, including pages nobody links to.",
          },
          {
            name: "A dead-end page",
            desc: "D links nowhere. The ranks must still add up to 1.",
            args: [G3, 0.85, ITERS],
            expect: ref(G3, 0.85, ITERS),
            cmp: near,
            view: { pos: P3 },
            hint: "A dead end has an empty list, so the <code>for q in links</code> loop never runs for it. Blank 2 is what stops its rank vanishing.",
          },
          {
            name: "A different damping",
            desc: "The three-page web again with d = 0.5. Read d, don't hard-code 0.85.",
            args: [G1, 0.5, ITERS],
            expect: ref(G1, 0.5, ITERS),
            cmp: near,
            view: { pos: P1 },
            hint: "Use the parameter <code>d</code> in blank 3 instead of typing 0.85.",
          },
        ],
        scene: prScene(),
      });
      root.appendChild(
        predict({
          id: "a1-code-1",
          q: "A page has no outgoing links. What does your code do with its rank each round?",
          opts: [
            "Split it equally across all pages",
            "Throw it away, as it has no links",
            "Hand it all to the page with the top rank",
          ],
          a: 0,
          why: "A dead end can't choose, so it chooses everything: rank[p] / n goes to each of the n pages. Skipping it would make the total fall below 1 every round.",
        }),
      );
      root.appendChild(
        predict({
          id: "a1-code-2",
          q: "On a 3-page web with d = 0.85, nothing links to page X. After many rounds, what is X's rank?",
          opts: [
            "About 0.05, from teleporting alone",
            "Exactly zero, as nobody links to it",
            "About 0.33, the same as every other page",
          ],
          a: 0,
          why: "X receives no link rank, so it only has the teleport floor: (1 − 0.85) ÷ 3 = 0.05. The damping step is what stops it being stuck at zero.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Each round, a page shares its rank <b>equally along its links</b>: rank ÷ number of links.",
            "A <b>dead end</b> pours its rank to every page, so the total stays at 1.",
            "<b>Damping</b> blends the two: <code>d × (rank that arrived) + (1 − d) ÷ n</code>. The teleport floor means no page is ever stuck at zero.",
            "Repeat until the numbers stop moving: that is the PageRank vector.",
          ],
          "Share rank out along links, pour dead ends to everyone, damp, and repeat.",
        ),
      );
    },
  });

  L["a1-code"] = {
    sum: "Write the share-out and damping steps of PageRank, then watch rank settle on a small web.",
    steps: [
      {
        t: "What you will write",
        b: `<p>The code lab gives you a working skeleton of <b>power iteration</b> with <b>three blanks</b>. Each one is a rule from the lecture:</p><ol><li>a page shares its rank <b>equally along its links</b></li><li>a dead end pours its rank <b>to every page</b></li><li>damping: <code>d × arrived + (1 − d) ÷ n</code></li></ol>`,
        v: F.flow([
          { t: "Share along links", c: "blue" },
          { t: "Pour dead ends", c: "amber" },
          { t: "Damp, repeat", c: "teal" },
        ]),
        c: {
          q: "Page P has rank 0.6 and three outgoing links. How much does each target receive from P?",
          o: ["0.2 each", "0.6 each, the full rank to every target", "1.8 each, as 0.6 times 3"],
          a: 0,
          why: "A link's share is the source's rank divided by its out-degree: 0.6 ÷ 3 = 0.2 to each of the three targets.",
        },
      },
      {
        t: "Reading the picture",
        b: `<p>Under your code, the web replays <b>your run</b> round by round. Bigger blobs have more rank, and light packets show rank flowing down each link.</p><p>The <b>total rank</b> should stay at 1.000. If it drops, rank is leaking somewhere, and the caption says so.</p>`,
        v: F.compare(
          { title: "Damping", c: "teal", body: "new rank = d × arrived + (1 − d) ÷ n" },
          { title: "Teleport floor", c: "violet", body: "the (1 − d) ÷ n every page always gets" },
        ),
        c: {
          q: "With 4 pages and d = 0.8, what floor does every page get from teleporting?",
          o: [
            "0.05, since 0.2 ÷ 4",
            "0.25, since every page gets one quarter",
            "0.8, since d is what every page keeps",
          ],
          a: 0,
          why: "Teleporting happens with probability 1 − d = 0.2, spread over 4 pages: 0.2 ÷ 4 = 0.05 each.",
        },
      },
    ],
    guide: ["Fill the three blanks and pass the tests in the code lab."],
  };
})();
