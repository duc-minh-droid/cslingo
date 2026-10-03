(function () {
  const partScope = (NIC.shared.algoP7 = NIC.shared.algoP7 || {});
  const lg2 = Math.log2;
  const FG = NIC.fig;
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
        svg.querySelectorAll(".rn-huf-e").forEach(
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
  Object.assign(partScope, { huffmanRun });
})();
