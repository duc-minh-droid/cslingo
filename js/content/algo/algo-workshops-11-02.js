(function () {
  const partScope = (NIC.shared.algoWorkshops11 = NIC.shared.algoWorkshops11 || {});
  const {
    CRC_DATA,
    CRC_GEN,
    FIELD,
    FREQ,
    GRID,
    HAM_DATA,
    HAM_HIT,
    HPOS,
    LEDGER,
    LP,
    OFFICES,
    ROADS,
    SIG,
    SQUARE,
    WEB,
    cells,
    crcRem,
    dftMags,
    dijkstra,
    djb2,
    flash,
    graham,
    graphSvg,
    gridSearch,
    hammingCheck,
    hammingEncode,
    huffman,
    kruskal,
    lpCorners,
    pageRank,
    r2,
    treeCost,
  } = partScope;
  const N = NIC,
    { qs, qsa } = N;

  /* =====================================================================
     Demos: each runs a real algorithm and narrates with c.cap(html). c.wait(ms) resolves false when superseded.
     ===================================================================== */
  const DEMOS = {
    async dijkstra(box, c) {
      const g = graphSvg(box, ROADS),
        r = dijkstra(Object.keys(ROADS.nodes), ROADS.edges, "A");
      g.sub("A", "0");
      c.cap(`Dijkstra starts at <b>A</b> (0) and always settles the closest unsettled junction.`);
      for (const u of r.order) {
        if (!(await c.wait(520))) return;
        g.n(u).classList.add("cur");
        g.sub(u, String(r.dist[u]));
        if (r.prev[u]) g.e(r.prev[u], u).classList.add("tree");
        if (!(await c.wait(260))) return;
        g.n(u).classList.remove("cur");
        g.n(u).classList.add("done");
        c.cap(`Settled <b>${u}</b> at <b>${r.dist[u]}</b>. No road is negative, so nothing can make it cheaper later.`);
      }
      c.cap(
        `Every junction is settled with its quickest time from A (teal roads are the best routes). Longest: <b>${Math.max(...Object.values(r.dist))}</b>.`,
      );
    },
    async tree(box, c, mode) {
      // trap demos on the square: "path" (MST used as a route) or "spt" (shortest-path tree used as cabling)
      const nodes = Object.keys(SQUARE.nodes),
        g = graphSvg(box, SQUARE, { h: 300 }),
        mst = kruskal(nodes, SQUARE.edges),
        sp = dijkstra(nodes, SQUARE.edges, "S");
      const mstST = treeCost(mst.tree, "S", "T"),
        spTree = nodes
          .filter((n) => sp.prev[n])
          .map((n) => [
            sp.prev[n],
            n,
            SQUARE.edges.find(([a, b]) => (a === sp.prev[n] && b === n) || (b === sp.prev[n] && a === n))[2],
          ]),
        spTotal = spTree.reduce((s, e) => s + e[2], 0);
      if (mode === "path") {
        c.cap(`The cheapest wiring (an MST) keeps the three cheap links: total <b>${mst.total}</b>.`);
        mst.tree.forEach(([a, b]) => g.e(a, b).classList.add("ok"));
        if (!(await c.wait(900))) return;
        ["S", "P", "Q", "T"].forEach((n) => g.n(n).classList.add("cur"));
        c.cap(
          `But driving S to T along that tree costs <b>${mstST}</b>, while the direct road is only <b>${sp.dist.T}</b>. An MST minimises total wiring, not any single journey.`,
        );
        g.e("S", "T").classList.add("route");
      } else {
        c.cap(
          `Dijkstra's shortest-path tree from S: every junction as close to S as possible. Total length <b>${spTotal}</b>.`,
        );
        spTree.forEach(([a, b]) => g.e(a, b).classList.add("route"));
        if (!(await c.wait(1000))) return;
        qsa(".aw11-ge", g.svg).forEach((e) => e.classList.remove("route"));
        mst.tree.forEach(([a, b]) => g.e(a, b).classList.add("ok"));
        c.cap(
          `Cheapest way to connect everything (MST): only <b>${mst.total}</b> in total, against ${spTotal}. Shortest routes are not cheapest wiring.`,
        );
      }
    },
    async grid(box, c) {
      const { cols, rows, walls, s, g } = GRID,
        dj = gridSearch(cols, rows, walls, s, g, false),
        as = gridSearch(cols, rows, walls, s, g, true);
      const mk = (title) =>
        `<div class="aw11-gb"><b>${title}</b><span class="aw11-cnt">0 explored</span><div class="aw11-gridc" style="--cols:${cols}">${Array.from(
          { length: cols * rows },
          (_, i) => {
            const x = i % cols,
              y = (i / cols) | 0;
            return `<i data-k="${x},${y}" class="${walls.has(x + "," + y) ? "w" : x === s[0] && y === s[1] ? "s" : x === g[0] && y === g[1] ? "g" : ""}"></i>`;
          },
        ).join("")}</div></div>`;
      box.innerHTML = `<div class="aw11-2">${mk("Dijkstra")}${mk("A* (with a distance guess)")}</div>`;
      const boxes = qsa(".aw11-gb", box),
        run = [dj, as];
      c.cap("Both searches look for the same shelf. Watch how many squares each has to explore before it finds it.");
      const steps = Math.max(dj.order.length, as.order.length);
      for (let i = 0; i < steps; i += 2) {
        if (!(await c.wait(70))) return;
        run.forEach((r, b) => {
          for (let k = i; k < Math.min(i + 2, r.order.length); k++) {
            const cell = qs(`[data-k="${r.order[k][0]},${r.order[k][1]}"]`, boxes[b]);
            if (cell && !cell.className) cell.className = "seen";
          }
          qs(".aw11-cnt", boxes[b]).textContent = `${Math.min(i + 2, r.order.length)} explored`;
        });
      }
      run.forEach((r, b) => {
        r.path.forEach(([x, y]) => {
          const cell = qs(`[data-k="${x},${y}"]`, boxes[b]);
          if (cell && !/[sg]/.test(cell.className)) cell.className = "path";
        });
        qs(".aw11-cnt", boxes[b]).textContent = `${r.order.length} explored`;
      });
      c.cap(
        `Same shortest path (<b>${dj.cost}</b> steps). Dijkstra explored <b>${dj.order.length}</b> squares; A* explored only <b>${as.order.length}</b>, because its estimate pulls it towards the goal.`,
      );
    },
    async kruskal(box, c) {
      const g = graphSvg(box, OFFICES),
        nodes = Object.keys(OFFICES.nodes),
        r = kruskal(nodes, OFFICES.edges);
      c.cap(
        "Kruskal goes through the links <b>cheapest first</b>, keeping a link only if it joins two separate pieces.",
      );
      let total = 0;
      for (const { e, take } of r.steps) {
        if (!(await c.wait(650))) return;
        const line = g.e(e[0], e[1]);
        line.classList.add(take ? "ok" : "skip");
        if (take) {
          total += e[2];
          c.cap(`<b>${e[0]}–${e[1]}</b> (${e[2]}) joins two separate pieces: <b>keep</b>. Running total ${total}.`);
        } else {
          c.cap(
            `<b>${e[0]}–${e[1]}</b> (${e[2]}): both ends are already connected. A second route would be a loop: <b>skip</b>.`,
          );
          setTimeout(() => line.classList.remove("skip"), 500);
        }
      }
      c.cap(
        `Every office is connected using ${r.tree.length} links for a total of <b>${r.total}</b>. Nothing cheaper connects them all.`,
      );
    },
    async hull(box, c) {
      const H = 260,
        pts = FIELD.map(([x, y]) => [x, H - y]),
        gr = graham(pts),
        flipY = (p) => [p[0], H - p[1]];
      box.innerHTML = `<svg class="aw11-svg" viewBox="0 0 520 ${H + 10}" role="img" aria-label="Points with a fence growing around them"><polygon class="aw11-hl" points=""/><polyline class="aw11-hp" points=""/>${FIELD.map(([x, y], i) => `<circle class="aw11-pt" data-i="${i}" cx="${x}" cy="${y}" r="7"/>`).join("")}<circle class="aw11-ring" r="12" cx="-50" cy="-50"/></svg>`;
      const svg = qs("svg", box),
        pl = qs(".aw11-hp", svg),
        ring = qs(".aw11-ring", svg),
        ptEl = (p) => qs(`[data-i="${FIELD.findIndex(([x, y]) => x === p[0] && H - y === p[1])}"]`, svg);
      c.cap(
        "Graham scan: sort the pins by angle around the lowest one, then walk round with a stack. A <b>right turn</b> pops the last pin.",
      );
      for (const o of gr.ops) {
        if (!(await c.wait(o.op === "pop" ? 650 : 480))) return;
        const show = o.st.map(flipY),
          p = flipY(o.p);
        pl.setAttribute("points", show.map((q) => q.join(",")).join(" "));
        ring.setAttribute("cx", p[0]);
        ring.setAttribute("cy", p[1]);
        if (o.op === "pop") {
          flash(ptEl(o.p), "bad");
          c.cap(`The turn at this pin goes the wrong way (a right turn): <b>pop</b> it. It is inside the fence.`);
        } else c.cap(`Left turn: <b>keep</b> this pin on the stack (${o.st.length} on the fence so far).`);
      }
      const hs = gr.hull.map(flipY);
      qs(".aw11-hl", svg).setAttribute("points", hs.map((q) => q.join(",")).join(" "));
      pl.setAttribute("points", "");
      ring.setAttribute("cx", -50);
      gr.hull.forEach((p) => ptEl(p).classList.add("hullpt"));
      c.cap(
        `The fence touches <b>${gr.hull.length}</b> of the ${FIELD.length} pins. The other ${FIELD.length - gr.hull.length} are inside, so they need no fence.`,
      );
    },
    async hamming(box, c) {
      const w = hammingEncode(HAM_DATA),
        bad = w.slice();
      bad[HAM_HIT - 1] ^= 1;
      const row = (word, marks = {}) =>
        cells(
          HPOS.map((p) => ({
            v: word[p - 1],
            sub: [1, 2, 4].includes(p) ? "p" + p : "d" + p,
            c: marks[p] || ([1, 2, 4].includes(p) ? "par" : ""),
          })),
        );
      box.innerHTML = `<div class="aw11-ham"><div data-r1></div><div class="aw11-chk" data-chk></div></div>`;
      const r1 = qs("[data-r1]", box),
        chk = qs("[data-chk]", box);
      r1.innerHTML = row(w);
      c.cap(`The probe sends 4 data bits as a 7-bit codeword (parity bits at positions 1, 2 and 4).`);
      if (!(await c.wait(900))) return;
      r1.innerHTML = row(bad, { [HAM_HIT]: "bad" });
      c.cap(`Noise flips one bit on the way. The receiver does not know which.`);
      flash(qs(".bad", r1), "aw11-pop");
      if (!(await c.wait(900))) return;
      const ck = hammingCheck(bad);
      chk.innerHTML = [4, 2, 1]
        .map(
          (p) => `<span class="aw11-chip ${ck.fail[p] ? "no" : "ok"}">p${p} ${ck.fail[p] ? "fails" : "passes"}</span>`,
        )
        .join("");
      c.cap(
        `It re-checks the three overlapping groups. Failed checks p4 p2 p1 read <b>${[4, 2, 1].map((p) => (ck.fail[p] ? 1 : 0)).join("")}</b> in binary.`,
      );
      if (!(await c.wait(1100))) return;
      const fixed = bad.slice();
      fixed[ck.pos - 1] ^= 1;
      r1.innerHTML = row(fixed, { [ck.pos]: "good" });
      flash(qs(".good", r1), "aw11-pop");
      c.cap(`That is position <b>${ck.pos}</b>. Flip it back and the codeword is repaired at once, with no resend.`);
    },
    async crc(box, c) {
      const rem = crcRem(CRC_DATA, CRC_GEN),
        frame = (CRC_DATA + rem).split("").map(Number),
        bad = frame.slice();
      bad[5] ^= 1;
      const row = (word, mark) =>
        cells(word.map((b, i) => ({ v: b, sub: i < 4 ? "data" : "crc", c: i === mark ? "bad" : i >= 4 ? "par" : "" })));
      box.innerHTML = `<div class="aw11-ham"><div data-r1></div><div class="aw11-chk" data-chk></div></div>`;
      const r1 = qs("[data-r1]", box),
        chk = qs("[data-chk]", box);
      r1.innerHTML = row(frame, -1);
      c.cap(`CRC: divide by ${CRC_GEN}, send the remainder <b>${rem}</b> after the data.`);
      if (!(await c.wait(900))) return;
      r1.innerHTML = row(bad, 5);
      flash(qs(".bad", r1), "aw11-pop");
      const check = crcRem(bad.join("").slice(0, 4), CRC_GEN) !== bad.join("").slice(4);
      chk.innerHTML = `<span class="aw11-chip no">${check ? "CRC mismatch: corrupted!" : "no mismatch"}</span><span class="aw11-chip">which bit? unknown</span>`;
      c.cap(
        `One bit flips. The receiver's CRC no longer matches, so it knows the frame is bad, <b>but not where</b>. All CRC can do is ask for a resend. This probe cannot be asked.`,
      );
    },
    async hash(box, c) {
      const mk = (data) => {
        const b = [];
        data.forEach((d, i) => {
          const prev = i ? b[i - 1].hash : "00000000";
          b.push({ d, prev, hash: djb2(`${i}|${d}|${prev}`) });
        });
        return b;
      };
      const good = mk(LEDGER),
        sh = (h) => h.slice(0, 5);
      const draw = (blocks, edit, broke) => {
        box.innerHTML = `<div class="aw11-chain">${blocks.map((b, i) => `<div class="aw11-blk ${i === edit ? "edit" : ""} ${broke !== null && i > broke ? "after" : ""}"><b>Block ${i}</b><span>${b.d}</span><small>prev ${sh(b.prev)}</small><small>hash ${sh(i === edit ? djb2(`${i}|${b.d}|${b.prev}`) : b.hash)}</small></div>${i < blocks.length - 1 ? `<i class="aw11-lk ${broke === i ? "no" : "ok"}">${broke === i ? "✗" : "→"}</i>` : ""}`).join("")}</div>`;
      };
      draw(good, -1, null);
      c.cap("Each block stores the hash of the block before it. Everything checks out.");
      if (!(await c.wait(1100))) return;
      const forged = good.map((b) => ({ ...b }));
      forged[1].d = "Ben +2";
      draw(forged, 1, 1);
      flash(qs(".edit", box), "aw11-pop");
      c.cap(
        `Someone quietly edits block 1. Its hash becomes <b>${sh(djb2(`1|${forged[1].d}|${forged[1].prev}`))}</b>, not <b>${sh(good[1].hash)}</b>, so block 2's stored <i>prev</i> no longer matches: the link turns red. To hide it they would have to recompute every later block.`,
      );
    },
    async fft(box, c) {
      const mags = dftMags(SIG),
        mx = 1.2;
      box.innerHTML = `<svg class="aw11-svg" viewBox="0 0 520 120" aria-label="The 16 samples of the signal"><line class="aw11-ax" x1="10" x2="510" y1="60" y2="60"/><polyline class="aw11-wave" points=""/>${SIG.map((v, i) => `<circle class="aw11-dot" cx="${20 + i * 32}" cy="${60 - v * 34}" r="4.5"/>`).join("")}</svg>
        <div class="aw11-bars">${mags.map((m, k) => `<div class="aw11-bar" data-k="${k}"><i style="transform:scaleY(0)"></i><small>${k}</small></div>`).join("")}</div>`;
      const wave = qs(".aw11-wave", box);
      wave.setAttribute("points", SIG.map((v, i) => `${20 + i * 32},${60 - v * 34}`).join(" "));
      c.cap(
        "Sixteen samples of a hum look like a messy wiggle. The DFT asks, for each frequency, how much of it is inside.",
      );
      if (!(await c.wait(1100))) return;
      for (let k = 0; k < mags.length; k++) {
        if (!(await c.wait(130))) return;
        const b = qs(`[data-k="${k}"] i`, box);
        b.style.transform = `scaleY(${Math.min(1, mags[k] / mx).toFixed(3)})`;
        if (mags[k] > 0.1) b.className = "peak";
      }
      const peaks = mags.map((m, k) => [k, m]).filter(([, m]) => m > 0.1);
      c.cap(
        `One bar per frequency. Two tall bars: <b>${peaks.map(([k, m]) => `${k} cycles (${r2(m)})`).join("</b> and <b>")}</b>. The hum is two pure tones mixed together. (The FFT gives the same bars, just faster.)`,
      );
    },
    async huffman(box, c) {
      const h = huffman(FREQ),
        total = Object.values(FREQ).reduce((a, b) => a + b, 0);
      box.innerHTML = `<div class="aw11-huf"><div class="aw11-hs" data-s></div><div class="aw11-hc" data-c></div></div>`;
      const s = qs("[data-s]", box),
        cc = qs("[data-c]", box);
      c.cap(
        `Letter counts: ${Object.entries(FREQ)
          .map(([a, f]) => `<b>${a}</b> ${f}`)
          .join(", ")}. Huffman repeatedly merges the two <b>rarest</b>.`,
      );
      for (const st of h.steps) {
        if (!(await c.wait(900))) return;
        s.insertAdjacentHTML(
          "beforeend",
          `<div class="aw11-merge"><span>${st.a.s} (${st.a.f})</span><em>+</em><span>${st.b.s} (${st.b.f})</span><em>→</em><b>${st.m.f}</b></div>`,
        );
        flash(s.lastElementChild, "aw11-pop");
      }
      if (!(await c.wait(800))) return;
      let bits = 0;
      cc.innerHTML = Object.entries(h.codes)
        .map(([a, code]) => {
          bits += code.length * FREQ[a];
          return `<div class="aw11-code"><b>${a}</b><span>${code
            .split("")
            .map((x) => `<i>${x}</i>`)
            .join("")}</span><small>${FREQ[a]} times</small></div>`;
        })
        .join("");
      c.cap(
        `The common letter gets the shortest code. The whole message takes <b>${bits}</b> bits, against <b>${total * 2}</b> with a plain 2 bits per letter.`,
      );
    },
    async lp(box, c) {
      const pts = lpCorners(LP.cons, LP.profit),
        best = pts.reduce((m, p) => (p.v > m.v ? p : m)),
        X = (x) => 50 + x * 30,
        Y = (y) => 270 - y * 30;
      box.innerHTML = `<svg class="aw11-svg" viewBox="0 0 520 290" role="img" aria-label="Feasible region for chairs and tables"><line class="aw11-ax" x1="50" y1="270" x2="470" y2="270"/><line class="aw11-ax" x1="50" y1="270" x2="50" y2="20"/>
        <text class="aw11-lab" x="470" y="286" text-anchor="end">chairs</text><text class="aw11-lab" x="8" y="20">tables</text>
        <polygon class="aw11-poly" points="${pts.map((p) => `${X(p.x)},${Y(p.y)}`).join(" ")}"/>
        ${pts.map((p, i) => `<g class="aw11-cor" data-i="${i}"><circle cx="${X(p.x)}" cy="${Y(p.y)}" r="8"/><text x="${X(p.x) + (p.x < 1 ? 14 : 10)}" y="${Y(p.y) - 12}">(${r2(p.x)}, ${r2(p.y)}) → ${r2(p.v)}</text></g>`).join("")}</svg>`;
      c.cap(
        `Wood and hours limits cut out a polygon of allowed plans. Profit is <b>${LP.profit[0]}</b> per chair, <b>${LP.profit[1]}</b> per table.`,
      );
      qs(".aw11-poly", box).classList.add("on");
      if (!(await c.wait(900))) return;
      for (let i = 0; i < pts.length; i++) {
        if (!(await c.wait(650))) return;
        const g = qs(`[data-i="${i}"]`, box);
        g.classList.add("on");
        c.cap(`Corner (${r2(pts[i].x)} chairs, ${r2(pts[i].y)} tables) earns <b>${r2(pts[i].v)}</b>.`);
      }
      if (!(await c.wait(650))) return;
      qs(`[data-i="${pts.indexOf(best)}"]`, box).classList.add("best");
      c.cap(
        `The best plan is always at a <b>corner</b>: ${r2(best.x)} chairs and ${r2(best.y)} tables for <b>${r2(best.v)}</b>. Simplex walks corner to corner instead of searching the inside.`,
      );
    },
    async pagerank(box, c) {
      const hist = pageRank(WEB.nodes, WEB.links, 0.85, 14);
      box.innerHTML = `<div class="aw11-pr"><div class="aw11-links">${WEB.nodes.map((n) => `<span><b>${n}</b> → ${WEB.links[n].join(", ")}</span>`).join("")}</div>
        <div class="aw11-rbars">${WEB.nodes.map((n) => `<div class="aw11-rrow"><b>${n}</b><span class="aw11-tr"><i style="transform:scaleX(${hist[0][n] / 0.6})"></i></span><output>${r2(hist[0][n])}</output></div>`).join("")}</div><div class="aw11-it">start</div></div>`;
      c.cap("Everyone starts with equal rank. Each round, every page shares its rank out along its links.");
      for (let t = 1; t < hist.length; t++) {
        if (!(await c.wait(380))) return;
        qsa(".aw11-rrow", box).forEach((row, i) => {
          const v = hist[t][WEB.nodes[i]];
          qs("i", row).style.transform = `scaleX(${Math.min(1, v / 0.6).toFixed(3)})`;
          qs("output", row).textContent = r2(v);
        });
        qs(".aw11-it", box).textContent = `round ${t}`;
      }
      const last = hist[hist.length - 1],
        top = WEB.nodes.reduce((m, n) => (last[n] > last[m] ? n : m));
      qsa(".aw11-rrow", box).forEach((row, i) => row.classList.toggle("top", WEB.nodes[i] === top));
      c.cap(
        `The scores settle. <b>${top}</b> wins (${r2(last[top])}) because the most pages link to it, and <b>D</b> (nobody links to it) stays at the teleport floor, ${r2(last.D)}.`,
      );
    },
  };

  /* =====================================================================
     Tools and scenarios
     ===================================================================== */
  const TOOLS = [
    {
      id: "dijk",
      name: "Dijkstra",
      ph: 2,
      does: "quickest routes from one start to everywhere, when no cost is negative",
    },
    {
      id: "astar",
      name: "A*",
      ph: 2,
      does: "one start and one goal, guided by an honest estimate of the distance left",
    },
    {
      id: "lp",
      name: "Linear programming",
      ph: 3,
      does: "the best mix of quantities when everything is a straight-line limit",
    },
    {
      id: "golden",
      name: "Golden-section search",
      ph: 3,
      does: "the lowest point of a one-knob curve with a single dip, using only evaluations",
    },
    { id: "mst", name: "MST (Prim / Kruskal)", ph: 4, does: "connecting every point with the cheapest total wiring" },
    { id: "hull", name: "Convex hull", ph: 5, does: "the smallest outline that wraps around a set of points" },
    { id: "crc", name: "CRC", ph: 6, does: "detecting accidental bit flips so the data can be resent" },
    { id: "ham", name: "Hamming code", ph: 6, does: "finding and repairing one flipped bit without a resend" },
    { id: "huff", name: "Huffman coding", ph: 7, does: "shrinking data whose symbols have very uneven frequencies" },
    { id: "lzw", name: "LZW", ph: 7, does: "shrinking data in which whole phrases repeat" },
    { id: "hash", name: "Hash chain", ph: 8, does: "making any later edit to a history visible" },
    { id: "fft", name: "DFT / FFT", ph: 9, does: "finding which frequencies are inside a signal" },
    { id: "attn", name: "Attention", ph: 10, does: "letting each item in a sequence decide which others matter to it" },
    { id: "pr", name: "PageRank", ph: 1, does: "scoring pages by who links to them" },
  ];
  const TOOL = Object.fromEntries(TOOLS.map((t) => [t.id, t]));
  Object.assign(partScope, { DEMOS, TOOL, TOOLS });
})();
