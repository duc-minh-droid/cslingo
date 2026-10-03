(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, shuffle } = N;

  /* ============ 4.8 Crossover ============ */
  N.register({
    id: "l4-crossover",
    lecture: 4,
    order: 8,
    num: "4.8",
    title: "Crossover operators",
    blurb:
      "Place the cut points yourself for 1-point, 2-point and uniform crossover, then try it on permutations and watch it break.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Recombination for k-ary encodings. <b>1-point</b>: cut both parents at the same place and swap the tails. <b>2-point / k-point</b>: k cuts, alternate segments. <b>Uniform</b>: a random binary <b>mask</b> decides, gene by gene, which parent each child takes from. Click between genes to move the cuts, or click mask bits to flip them.",
        ),
      );
      let type = "one",
        cuts = [5],
        mask = [0, 1, 0, 0, 1, 1, 0, 1],
        permMode = false;
      const P1s = () => (permMode ? "ABCDEFGH" : "ABCDEFGH").split(""),
        P2s = () => (permMode ? "HGFEDCBA" : "KLMNOPQR").split("");
      const card = el(
        `<div class="card"><div class="controls" id="b1"></div><div id="viz"></div><div class="controls"><button class="btn" id="rnd">Randomise cuts / mask</button><button class="btn ghost" id="lec">Lecture example</button></div><div id="note"></div></div>`,
      );
      root.appendChild(card);
      const pm = el(`<label class="field"><input type="checkbox"> use permutation parents</label>`);
      qs("input", pm).onchange = (e) => {
        permMode = e.target.checked;
        draw();
      };
      qs("#b1", card).append(
        N.seg(
          [
            ["one", "1-point"],
            ["two", "2-point"],
            ["k", "k-point"],
            ["uni", "Uniform"],
          ],
          type,
          (v) => {
            type = v;
            lecture();
          },
        ),
        pm,
      );
      function lecture() {
        cuts = type === "one" ? [5] : type === "two" ? [2, 6] : type === "k" ? [1, 3, 5, 7] : [];
        mask = [0, 1, 0, 0, 1, 1, 0, 1];
        draw();
      }
      function srcMask() {
        if (type === "uni") return mask;
        const m = [];
        let side = 0,
          c = [...cuts].sort((a, b) => a - b);
        for (let i = 0; i < 8; i++) {
          if (c.includes(i)) side = 1 - side;
          m.push(side);
        }
        return m;
      }
      function draw() {
        const p1 = P1s(),
          p2 = P2s(),
          m = srcMask();
        const c1 = p1.map((g, i) => (m[i] ? p2[i] : g)),
          c2 = p2.map((g, i) => (m[i] ? p1[i] : g));
        const dup = (arr) => arr.map((c) => arr.filter((x) => x === c).length > 1);
        const d1 = dup(c1),
          d2 = dup(c2);
        const geneRow = (lbl, arr, clsFn, clickable) =>
          `<div class="genome-row"><span class="lbl">${lbl}</span><span class="genome">${arr.map((g, i) => `<span class="gene ${clsFn(i)} ${clickable && type !== "uni" && i < 7 ? "click" : ""} ${type !== "uni" && cuts.includes(i + 1) ? "cut" : ""}" data-i="${i}">${g}</span>`).join("")}</span></div>`;
        qs("#viz", card).innerHTML =
          geneRow("Parent 1", p1, () => "p1", true) +
          geneRow("Parent 2", p2, () => "p2", true) +
          (type === "uni"
            ? `<div class="genome-row"><span class="lbl">Mask</span><span class="genome">${mask.map((b, i) => `<span class="gene click" data-m="${i}" style="${b ? "border-color:var(--violet);color:var(--violet)" : ""}">${b}</span>`).join("")}</span><span class="faint">1 = swap this gene</span></div>`
            : `<p class="faint" style="margin:4px 0 10px 102px;font-size:12.5px">Click a gene in either parent to toggle a cut after it.</p>`) +
          geneRow("Child 1", c1, (i) => (permMode && d1[i] ? "bad" : m[i] ? "p2" : "p1")) +
          geneRow("Child 2", c2, (i) => (permMode && d2[i] ? "bad" : m[i] ? "p1" : "p2"));
        qs("#note", card).innerHTML =
          permMode && (d1.some(Boolean) || d2.some(Boolean))
            ? `<div class="callout rose"><b>Invalid permutations.</b> Child 1 repeats ${[...new Set(c1.filter((_, i) => d1[i]))].join(", ")}. As a tour, some cities are visited twice and others never. Standard k-ary crossover doesn't respect the permutation constraint, so permutations need special operators (next lecture).</div>`
            : permMode
              ? `<div class="callout teal">This particular cut happened to produce valid children. Try other cuts.</div>`
              : "";
        qsa("[data-i]", card).forEach((g) =>
          g.addEventListener("click", () => {
            if (type === "uni") return;
            const i = +g.dataset.i + 1;
            if (i >= 8) return;
            if (type === "one") cuts = [i];
            else if (cuts.includes(i)) cuts = cuts.filter((c) => c !== i);
            else {
              cuts.push(i);
              if (type === "two" && cuts.length > 2) cuts.shift();
            }
            draw();
          }),
        );
        qsa("[data-m]", card).forEach((g) =>
          g.addEventListener("click", () => {
            const i = +g.dataset.m;
            mask[i] = 1 - mask[i];
            draw();
          }),
        );
      }
      qs("#rnd", card).onclick = () => {
        if (type === "uni") mask = mask.map(() => randint(0, 1));
        else {
          const n = type === "one" ? 1 : type === "two" ? 2 : randint(3, 5);
          cuts = shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, n);
        }
        draw();
      };
      qs("#lec", card).onclick = lecture;
      lecture();
      root.appendChild(
        predict({
          id: "l4-x-1",
          q: "With 1-point crossover on 8 genes, which pair of genes is <b>always</b> separated (always comes from different parents)?",
          opts: ["Genes 4 and 5", "Gene 1 and gene 8, the two ends", "No pair is always separated"],
          a: 1,
          why: "Every cut position (1–7) falls somewhere between gene 1 and gene 8, so the two ends <i>always</i> go to different parents, while neighbouring genes usually stay together. This is <b>positional bias</b>: 1-point crossover preserves blocks of adjacent genes. Uniform crossover has no positional bias because each gene is decided independently. (See the Eiben & Smith reading, ch. 3.)",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "1-point: one cut, swap tails. 2-point / k-point: alternate segments between cuts. Uniform: a random mask per gene.",
            "Crossover <b>combines</b> building blocks from good parents (exploitation); it can't create values that neither parent has.",
            "Representation and operators must be designed together: k-ary crossover on permutations produces invalid children.",
          ],
          "Crossover recombines existing genes via cut points or a mask; it has to respect the encoding, which plain k-ary crossover doesn't for permutations.",
        ),
      );
    },
  });
})();
