/* Data Science (COM3021), Lecture 14: tensors and sparse tensors.
   This part: shared helpers (grids, arrays, the Sprout seed-swap sheet) and the lessons 14.1 (ds14-orders, scalar,
   vector, matrix, tensor) and 14.2 (ds14-shapes, the shapes of real data). Running example: Sprout, a neighbourhood
   seed-swap app. */
(function () {
  const S = (NIC.shared.ds14 = NIC.shared.ds14 || {});
  const N = NIC;
  const { el, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 14, ...m });

  /* ---------- helpers shared with the other Lecture 14 files (the right answer goes first: the engine shuffles) ---------- */
  const mc = (q, o, why, hint) => ({ q, o, a: 0, why, ...(hint ? { hint } : {}) });
  const pr = (id, q, opts, why) => predict({ id, q, opts, a: 0, why });
  const st = (t, b, v, c) => ({ t, b, v, c });
  const mm = (html) => `<details class="math-more"><summary>Show the maths</summary>${html}</details>`;
  const seg = (box, spec, v, cb) =>
    box.appendChild(
      N.seg(
        spec.split("|").map((x) => x.split(":")),
        String(v),
        cb,
      ),
    );
  const stats = (list) =>
    `<div class="stat-row">${list.map(([c, l]) => `<div class="stat ${c}"><small>${l}</small><b>–</b></div>`).join("")}</div>`;
  const setStats = (box, vals) => box.querySelectorAll(".stat b").forEach((b, i) => (b.textContent = vals[i]));
  const svg = (w, h, inner, label) =>
    `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-width:${w}px" role="img" aria-label="${label}">${inner}</svg>`;
  const tx = (x, y, t, { a = "middle", s = 12, c = "var(--text)", w = 800 } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${w} ${s}px var(--sans);fill:${c}">${t}</text>`;
  const tint = (c, p = 16) => `color-mix(in srgb,var(--${c}) ${p}%,var(--panel))`;
  const card = (title, tag) =>
    el(
      `<div class="card"><div class="card-head"><h2>${title}</h2><span class="tag">${tag}</span></div><div></div></div>`,
    );

  /** A grid of numbers as SVG. hl(r, c) returns a colour name or "" for each cell; zeros are drawn faint. */
  function grid(M, { cs = 34, x0 = 0, y0 = 0, hl = () => "", labels = false } = {}) {
    const off = labels ? 22 : 0;
    let out = "";
    M.forEach((row, r) =>
      row.forEach((v, c) => {
        const k = hl(r, c),
          x = x0 + off + c * cs,
          y = y0 + off + r * cs;
        out += `<rect x="${x}" y="${y}" width="${cs - 3}" height="${cs - 3}" rx="6" fill="${k ? tint(k, 34) : v ? tint("blue", 14) : "var(--panel-2)"}" stroke="var(--${k || (v ? "blue" : "line")})" stroke-width="${k ? 2.5 : 1.5}"/>${tx(x + (cs - 3) / 2, y + cs / 2 + 2, v, { s: cs > 30 ? 12 : 10.5, c: v ? "var(--text)" : "var(--text-faint)", w: v ? 800 : 600 })}`;
      }),
    );
    if (labels) {
      M[0].forEach(
        (_, c) => (out += tx(x0 + off + c * cs + cs / 2 - 1, y0 + 14, c, { s: 10, c: "var(--text-faint)" })),
      );
      M.forEach((_, r) => (out += tx(x0 + 9, y0 + off + r * cs + cs / 2 + 2, r, { s: 10, c: "var(--text-faint)" })));
    }
    return out;
  }
  const gridSvg = (M, opts = {}, label = "A grid of numbers") => {
    const cs = opts.cs || 34,
      off = opts.labels ? 22 : 0;
    return svg(M[0].length * cs + off + 4, M.length * cs + off + 4, grid(M, opts), label);
  };
  /** One named array as a row of chips; on(i) returns a colour name or "" for each entry. */
  const arr = (name, vals, on = () => "") =>
    `<div class="ds14-arr"><b>${name}</b><span class="ds14-chips">${vals.map((v, i) => `<span class="ds14-chip ${on(i) ? `on ${on(i)}` : ""}" title="position ${i}"><i>${i}</i>${v}</span>`).join("")}</span></div>`;

  /** Build every sparse format from a grid. */
  function formats(M) {
    const nz = [];
    M.forEach((row, r) => row.forEach((v, c) => v && nz.push([r, c, v])));
    const rowIdx = [0];
    M.forEach((_, r) => rowIdx.push(nz.filter((t) => t[0] <= r).length));
    const byCol = [...nz].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    const colPtr = [0];
    M[0].forEach((_, c) => colPtr.push(byCol.filter((t) => t[1] <= c).length));
    return {
      nz,
      V: nz.map((t) => t[2]),
      COL: nz.map((t) => t[1]),
      ROW: rowIdx,
      cV: byCol.map((t) => t[2]),
      cROW: byCol.map((t) => t[0]),
      cPTR: colPtr,
    };
  }

  /* The slide examples, kept exactly. */
  const M9 = [
    [5, 0, 0, 0],
    [0, 8, 0, 0],
    [0, 0, 3, 0],
    [0, 6, 0, 0],
  ];
  const M12 = [
    [10, 20, 0, 0, 0, 0],
    [0, 30, 0, 40, 0, 0],
    [0, 0, 50, 60, 70, 0],
    [0, 0, 0, 0, 0, 80],
  ];
  const M13 = [
    [10, 0, 0, 0],
    [0, 5, 0, 0],
    [0, 0, 7, 0],
    [2, 0, 0, 9],
  ];

  Object.assign(S, { reg, mc, pr, st, mm, seg, stats, setStats, svg, tx, tint, card, grid, gridSvg, arr, formats });
  Object.assign(S, { M9, M12, M13 });

  /* ---------- figures for 14.1 ---------- */
  const cube = (x, y, v, c = "blue", s = 34) =>
    `<rect x="${x}" y="${y}" width="${s - 3}" height="${s - 3}" rx="6" fill="${tint(c, 22)}" stroke="var(--${c})" stroke-width="2"/>${tx(x + (s - 3) / 2, y + s / 2 + 3, v, { s: 12 })}`;
  const ROWV = [3, 5, 1, 4];
  const MAT = [
    [3, 5, 1, 4],
    [2, 0, 4, 1],
    [0, 3, 5, 2],
  ];
  function orderSvg(o) {
    if (o === 0)
      return svg(
        320,
        110,
        cube(140, 30, "18°", "amber", 44) +
          tx(160, 100, "one value, no position needed", { s: 11.5, c: "var(--text-dim)" }),
        "A scalar: one number",
      );
    if (o === 1)
      return svg(
        320,
        110,
        ROWV.map((v, i) => cube(92 + i * 34, 34, v)).join("") +
          tx(160, 96, "one index: which position?", { s: 11.5, c: "var(--text-dim)" }),
        "A vector: a row of four numbers",
      );
    if (o === 2)
      return svg(
        320,
        150,
        grid(MAT, { x0: 92, y0: 14 }) +
          tx(160, 140, "two indices: which row, which column?", { s: 11.5, c: "var(--text-dim)" }),
        "A matrix: a grid of three rows and four columns",
      );
    const layers = ["violet", "teal", "blue"]
      .map((c, k) =>
        MAT.map((row, r) =>
          row.map((v, i) => cube(70 + i * 34 + k * 22, 14 + r * 34 + (2 - k) * 16 - 16, (v + k) % 6, c)).join(""),
        ).join(""),
      )
      .join("");
    return svg(
      320,
      170,
      layers + tx(160, 162, "three indices: which grid, row and column?", { s: 11.5, c: "var(--text-dim)" }),
      "A 3-order tensor: three grids stacked into a pile",
    );
  }
  function ordersFig(b) {
    b.innerHTML = '<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>';
    const NAMES = [
      "a <b>scalar</b> (0-order)",
      "a <b>vector</b> (1-order)",
      "a <b>matrix</b> (2-order)",
      "a <b>3-order tensor</b>",
    ];
    const draw = (v) => {
      const o = +v;
      b.children[1].innerHTML = orderSvg(o);
      b.lastChild.innerHTML = `This is ${NAMES[o]}. To point at one value you need <b>${o}</b> index${o === 1 ? "" : "es"}.`;
    };
    seg(b.firstChild, "0:Order 0|1:Order 1|2:Order 2|3:Order 3", "2", draw);
    draw("2");
  }
  Object.assign(S, { orderSvg, ordersFig, cube });

  /* ---------- figures for 14.2 ---------- */
  const profile = svg(
    340,
    120,
    `<rect x="10" y="10" width="320" height="100" rx="12" fill="${tint("teal", 12)}" stroke="var(--teal)" stroke-width="2"/>${tx(26, 34, "Sweet pea packet", { a: "start", s: 13 })}` +
      [
        ["height (cm)", 180],
        ["days to sprout", 10],
        ["price (p)", 150],
        ["swaps", 7],
      ]
        .map(
          ([k, v], i) =>
            cube(26 + i * 76, 48, v, "teal", 40) + tx(46 + i * 76, 102, k, { s: 9.5, c: "var(--text-dim)", w: 700 }),
        )
        .join(""),
    "A seed packet described by four features: one vector",
  );
  const SENS = [
    [31, 30, 28, 26, 25, 29],
    [14, 15, 17, 19, 18, 16],
  ];
  const sensor = svg(
    340,
    120,
    tx(70, 36, "moisture", { a: "end", s: 11 }) +
      tx(70, 70, "soil °C", { a: "end", s: 11 }) +
      grid(SENS, { x0: 78, y0: 12, cs: 34 }) +
      ["6am", "9am", "12pm", "3pm", "6pm", "9pm"]
        .map((t, i) => tx(93 + i * 34, 100, t, { s: 9.5, c: "var(--text-faint)" }))
        .join("") +
      tx(180, 116, "features × timestamps", { s: 11, c: "var(--text-dim)" }),
    "Soil sensor readings: two features measured at six times, a matrix",
  );
  const rgb = svg(
    340,
    150,
    ["rose", "teal", "blue"]
      .map(
        (c, k) =>
          `<rect x="${110 + k * 26}" y="${14 + (2 - k) * 18}" width="100" height="80" rx="8" fill="${tint(c, 30)}" stroke="var(--${c})" stroke-width="2"/>`,
      )
      .join("") +
      tx(80, 60, "red", { a: "end", s: 11, c: "var(--rose-ink)" }) +
      tx(80, 78, "green", { a: "end", s: 11, c: "var(--teal-ink)" }) +
      tx(80, 96, "blue", { a: "end", s: 11, c: "var(--blue-ink)" }) +
      tx(196, 140, "width × height × channels", { s: 11, c: "var(--text-dim)" }),
    "A photo as three stacked grids, one per colour channel",
  );
  const video = svg(
    340,
    150,
    [0, 1, 2, 3]
      .map(
        (k) =>
          `<g transform="translate(${40 + k * 62},${20 + k * 6})"><rect width="80" height="64" rx="8" fill="${tint("violet", 14 + k * 6)}" stroke="var(--violet)" stroke-width="2"/>${["rose", "teal", "blue"].map((c, j) => `<rect x="${10 + j * 6}" y="${10 + j * 5}" width="40" height="30" rx="4" fill="${tint(c, 34)}" stroke="var(--${c})"/>`).join("")}${tx(40, 58, `frame ${k + 1}`, { s: 10 })}</g>`,
      )
      .join("") + tx(170, 140, "frames × width × height × channels", { s: 11, c: "var(--text-dim)" }),
    "A time-lapse video: a pile of photos, one per frame",
  );

  /* ============ 14.1 Boxes inside boxes ============ */
  reg({
    id: "ds14-orders",
    order: 1,
    num: "14.1",
    title: "Boxes inside boxes",
    blurb: "Scalars, vectors, matrices and tensors: numbers arranged in more and more directions.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Climb the orders", "order 0 to 3");
      root.appendChild(c);
      ordersFig(c.lastElementChild);
      root.appendChild(
        pr(
          "ds14-orders-1",
          "You stepped from <b>Order 2</b> to <b>Order 3</b> in the demo. What changed?",
          ["The grids were stacked into a pile", "Every number got bigger", "The grid gained one more row"],
          "A 3-order tensor adds a whole new direction: several grids stacked up. Now you need a third index to say which grid you mean.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>0-order</b>: a scalar. <b>1-order</b>: a vector. <b>2-order</b>: a matrix. <b>3-order</b>: a tensor.",
            "The <b>order</b> is how many indices you need to point at one value.",
            "Data is frequently represented as <b>tensors</b>.",
          ],
          "One number, a row, a grid, a pile of grids.",
        ),
      );
    },
  });

  L["ds14-orders"] = {
    sum: "Data is frequently represented as <b>tensors</b>: a scalar is 0-order, a vector 1-order, a matrix 2-order, and a pile of matrices a 3-order tensor.",
    steps: [
      st(
        "One number on its own",
        `<p>Meet <b>Sprout</b>, a neighbourhood seed-swap app. Its greenhouse thermometer shows a single number: 18 degrees. Nothing else to look up.</p><p>A single number like that is a <b>scalar</b>. It is the smallest kind of <b>tensor</b>, the general name for numbers arranged in boxes. A scalar is a <b>0-order</b> tensor: you need zero directions to find its value, because there is only one.</p>`,
        orderSvg(0),
      ),
      st(
        "A row of numbers",
        `<p>Now Sprout notes one member's ratings for four seed packets: 3, 5, 1, 4. That is a short row of numbers, like beads on a string.</p><p>A row like this is a <b>vector</b>, a <b>1-order</b> tensor. To find one value you give one index: “the second rating”. Vectors are everywhere in data science, because one thing (a packet, a person) is often described by a list of numbers.</p>`,
        orderSvg(1),
      ),
      st(
        "Grids, and piles of grids",
        `<p>Put every member's row under the next and you get a spreadsheet: a <b>matrix</b>, a <b>2-order</b> tensor. One value needs two indices: row and column.</p><p>Stack several matrices, like sheets of paper in a pile, and you have a <b>3-order tensor</b>: one value needs three indices. That is the whole idea of <b>order</b>: how many directions the numbers spread in.</p>${mm("<p>Order = number of indices: a scalar $s$, a vector $v_i$, a matrix $A_{ij}$, a 3-order tensor $T_{ijk}$. The pile in the figure has shape $3 \\times 3 \\times 4$.</p>")}`,
        orderSvg(3),
        mc(
          "Which of Sprout's records is a matrix?",
          [
            "A sheet of members against seed packets",
            "The greenhouse temperature right now",
            "One member's list of four ratings",
          ],
          "A matrix is a grid with rows and columns, like members × packets. A single temperature is a scalar, and one member's list is a vector.",
        ),
      ),
    ],
    guide: [
      "Tap <b>Order 0</b> to <b>Order 3</b> and watch the shape grow.",
      "Read the caption: how many indices pick out one value?",
      "Answer the question after the demo.",
    ],
  };

  /* ============ 14.2 Every kind of data has a shape ============ */
  reg({
    id: "ds14-shapes",
    order: 2,
    num: "14.2",
    title: "Every kind of data has a shape",
    blurb: "Features, time series, images and video: what shape of tensor each one becomes.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>Vector data</b>: features. <b>Time series</b>: features × timestamps.",
            "<b>Image</b>: width × height × channels (for example RGB).",
            "<b>Video</b>: frames × width × height × channels.",
          ],
          "Name the directions, and you know the shape.",
        ),
      );
    },
  });

  L["ds14-shapes"] = {
    sum: "Real data comes in tensor shapes: <b>vector data</b> is features, a <b>time series</b> features × timestamps, an <b>image</b> width × height × channels, a <b>video</b> frames × width × height × channels.",
    steps: [
      st(
        "A packet's profile card",
        `<p>Every seed packet on Sprout has a little profile card: how tall the plant grows, days to sprout, price, how often it is swapped. Each of those numbers is a <b>feature</b>.</p><p>A list of features is <b>vector data</b>: one vector per packet. Line many packets up and you have a table, but each single item is still described by one row of features.</p>`,
        profile,
      ),
      st(
        "Readings over time",
        `<p>Sprout's greenhouse has a soil sensor. Every few hours it records moisture and temperature, like a diary with two columns of notes per entry.</p><p>That is a <b>time series</b>: the same features measured again and again. Its shape is <b>features × timestamps</b>, a matrix: one direction says which reading, the other says when.</p>`,
        sensor,
        mc(
          "The soil sensor's diary grows by one column every few hours. Which direction is getting longer?",
          ["The timestamps", "The features", "The colour channels"],
          "A time series is features × timestamps. Each new reading adds a timestamp; the features (moisture, temperature) stay the same.",
        ),
      ),
      st(
        "A photo is three grids",
        `<p>Members upload photos of their seedlings. Zoom right in and a photo is a grid of tiny dots, but each dot mixes three colours of light: red, green and blue.</p><p>So an <b>image</b> is stored as <b>width × height × channels</b>: one grid per colour channel (<b>RGB</b>), stacked. That makes a photo a 3-order tensor.</p>${mm("<p>A 640 × 480 RGB photo has shape $640 \\times 480 \\times 3$: three numbers per pixel. A greyscale photo has one channel, so it is just a matrix.</p>")}`,
        rgb,
      ),
      st(
        "A time-lapse adds frames",
        `<p>One keen member films a sunflower growing, one photo every hour. Play them in order and the flower climbs.</p><p>A <b>video</b> is a pile of images, one per <b>frame</b>, so its shape is <b>frames × width × height × channels</b>: a 4-order tensor. Each new kind of data just adds a direction to the shape.</p>`,
        video,
        mc(
          "Sprout's time-lapse is a stack of colour photos. Which shape fits it?",
          ["frames × width × height × channels", "width × height × channels", "features × timestamps"],
          "A video is a sequence of images: each frame is width × height × channels, and the frames add one more direction in front.",
        ),
      ),
    ],
  };
})();
