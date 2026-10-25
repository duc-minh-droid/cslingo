(function () {
  const partScope = (NIC.shared.ds = NIC.shared.ds || {});
  const { addV } = partScope;
  const FG = NIC.fig;
  addV(
    "ds-twitter",
    4,
    FG.bars(
      [
        ["target delivery", 5, "teal", "s"],
        ["celebrity fan-out", 87, "rose", "s"],
      ],
      { max: 87 },
    ) +
      `<div class="fig-cap">30 million mailbox writes ÷ 345k writes/s ≈ <b>87 seconds</b>, way over the 5 s goal. Hence the hybrid.</div>`,
  );
  addV(
    "ds-scaling",
    0,
    FG.compare(
      { title: "Before", c: "dim", body: "🚐 one van, 4 CPUs, 16 GB" },
      { title: "Scale up", c: "violet", body: "🚚 one lorry, 64 CPUs, 1 TB, still <b>one</b> machine" },
    ),
  );
  addV(
    "ds-scaling",
    1,
    FG.plot(
      [
        { f: (p) => p, c: "teal", dash: "5 4", label: "fair price" },
        { f: (p) => 0.15 * Math.pow(p, 2.2), c: "rose", label: "real price" },
      ],
      { x: [0.5, 4], xl: "power →", yl: "cost", h: 170 },
    ),
  );
  addV(
    "ds-scaling",
    2,
    FG.graph({
      nodes: {
        LB: { x: 60, y: 110, label: "LB" },
        N1: { x: 250, y: 30, label: "1" },
        N2: { x: 270, y: 90, label: "2" },
        N3: { x: 270, y: 150, label: "3" },
        N4: { x: 250, y: 205, label: "4", c: "rose", sub: "down" },
      },
      edges: [
        ["LB", "N1"],
        ["LB", "N2"],
        ["LB", "N3"],
        ["LB", "N4", null, "rose"],
      ],
      hl: { N1: "teal", N2: "teal", N3: "teal" },
      w: 360,
      h: 240,
    }) +
      `<div class="fig-cap">A load balancer spreads requests over several ordinary machines. One dies, and the others keep serving.</div>`,
  );
  addV(
    "ds-scaling",
    3,
    FG.compare(
      { title: "You gain", c: "teal", body: "cheaper growth · no single point of failure" },
      { title: "You pay", c: "amber", body: "coordination · consistency · partial failures to handle" },
    ),
  );
  addV(
    "ds-maintain",
    1,
    FG.cells(
      [
        { v: "📈 monitoring", c: "teal" },
        { v: "🤖 automation", c: "teal" },
        { v: "🔁 no special machines", c: "teal" },
        { v: "🎯 no surprises", c: "teal" },
      ],
      { size: 140 },
    ),
  );
  addV(
    "ds-maintain",
    2,
    FG.compare(
      {
        title: "Essential complexity",
        c: "violet",
        body: "part of the problem itself: bus routes really do change hourly",
      },
      {
        title: "Accidental complexity",
        c: "rose",
        body: "caused by how it was built: three formats for the same timestamp, undocumented scripts",
      },
    ) +
      `<div class="fig-cap">Good abstractions remove the accidental kind and leave only what the problem needs.</div>`,
  );
  addV(
    "ds-maintain",
    3,
    FG.flow([
      { t: "new requirement", s: '"add ferries"' },
      { t: "simple design", s: "one new module", c: "teal" },
      { t: "shipped", s: "in days, not months" },
    ]),
  );
  /* ---------- plain-words figures: the idea first, the formal maths in the step's "Show the maths" drawer ---------- */
  const N = NIC;
  const F = N.fig;
  const cap = (t) => `<div class="fig-cap">${t}</div>`;
  const tint = (c, p = 26) => `color-mix(in srgb, var(--${c}) ${p}%, var(--panel-2))`;
  const num = (v) => v.toLocaleString("en-GB");
  if (!document.getElementById("dsplain-style")) {
    const css = document.createElement("style");
    css.id = "dsplain-style";
    css.textContent = `
.dp-grid{position:relative;height:96px;margin:6px 0 4px}
.dp-t{position:absolute;left:0;top:0;width:10%;height:48px;transform:translate(calc(var(--c)*100%),calc(var(--r)*100%));transition:transform .3s var(--ease-out)}
.dp-t span{display:grid;place-items:center;margin:3px;height:42px;border:2px solid var(--line);border-radius:10px;background:var(--panel-2);font:800 11px var(--sans);color:var(--text)}
.dp-t.ok span{border-color:var(--teal);background:${tint("teal")}}.dp-t.over span{border-color:var(--amber);background:${tint("amber")}}
.dp-t.pick span{border-width:3px;box-shadow:0 3px 0 var(--teal-lip)}
.dp-fr{display:grid;gap:4px;margin:10px 0}.dp-fl{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:13.5px}
.dp-fl small{font-weight:700;color:var(--text-faint);font-size:12.5px}
.dp-ft{display:flex;height:22px;border-radius:8px;background:var(--bg-2);overflow:hidden}.dp-ft i{display:block;height:100%;min-width:3px}
.dp-lg{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;font-weight:800;color:var(--text-faint)}.dp-lg i{display:inline-block;width:12px;height:12px;border-radius:4px;margin-right:5px;vertical-align:-1px}
.dp-rl{font-size:12.5px;font-weight:800;color:var(--text-faint);margin:8px 0 3px}
.dp-row{display:grid;grid-template-columns:repeat(12,1fr);gap:3px}
.dp-k{display:grid;place-items:center;height:34px;border:2px solid var(--line);border-radius:8px;background:var(--panel-2);font:800 12px var(--sans);color:var(--text)}
.dp-k.stay{opacity:.45}.dp-k.mv{border-color:var(--rose);border-width:3px}
.dp-lost{width:100%;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;align-items:stretch}
.dp-w,.dp-db{border:2px solid var(--line);border-radius:14px;padding:8px;text-align:center;background:var(--panel-2);font-size:13px;min-width:0}
.dp-w.on{border-color:var(--blue)}.dp-w b,.dp-db b{display:block}.dp-w span{display:block;font-weight:800;min-height:19px}
.dp-db b{font-size:22px}.dp-db.bad{border-color:var(--rose)}.dp-db.good{border-color:var(--teal)}.dp-db small{font-weight:800;color:var(--text-faint)}`;
    document.head.appendChild(css);
  }

  /** Percentiles: 20 requests, sorted fastest to slowest; pick the p-th by counting along. */
  function pct(box) {
    const ARR = [135, 420, 95, 110, 1900, 100, 160, 125, 90, 185, 115, 900, 105, 150, 210, 120, 140, 260, 170, 130];
    const SRT = [...ARR].sort((a, b) => a - b),
      n = ARR.length,
      mean = Math.round(ARR.reduce((a, b) => a + b) / n);
    let sorted = false,
      p = 95;
    box.innerHTML = `<div class="dp-grid" role="group" aria-label="${n} requests with their response times in milliseconds">${ARR.map((v) => `<div class="dp-t"><span>${v}</span></div>`).join("")}</div><div class="controls" style="justify-content:center"></div><div class="fig-cap" style="min-height:4.2em"></div>`;
    const tiles = [...box.querySelectorAll(".dp-t")],
      ctl = box.querySelector(".controls"),
      out = box.querySelector(".fig-cap");
    const btn = N.el(`<button class="btn small primary">Sort fastest to slowest</button>`);
    const draw = () => {
      const r = Math.ceil((p * n) / 100),
        v = SRT[r - 1];
      tiles.forEach((t, i) => {
        const k = sorted ? SRT.indexOf(ARR[i]) : i;
        t.style.setProperty("--c", k % 10);
        t.style.setProperty("--r", Math.floor(k / 10));
        t.className = `dp-t${sorted ? (k < r ? " ok" : " over") + (k === r - 1 ? " pick" : "") : ""}`;
      });
      btn.textContent = sorted ? "Back to arrival order" : "Sort fastest to slowest";
      out.innerHTML = sorted
        ? `Sorted, the ${r}th of ${n} is <b>${num(v)} ms</b>, so <b>p${p} = ${num(v)} ms</b>: ${r} of ${n} requests took that long or less${n - r ? `, ${n - r} took longer` : ""}. The average (${mean} ms) hides this.${p === 99 ? " With only 20 requests, p99 is just the slowest one." : ""}`
        : `${n} requests in the order they arrived (milliseconds). The average is <b>${mean} ms</b>, which looks healthy. Sort them to see who is waiting.`;
    };
    btn.onclick = () => ((sorted = !sorted), draw());
    ctl.append(
      btn,
      N.seg(
        ["50", "90", "95", "99"].map((x) => [x, `p${x}`]),
        String(p),
        (x) => ((p = +x), (sorted = true), draw()),
      ),
    );
    draw();
  }

  /** Fan-out: total work per second under both approaches, as the number of follows grows. */
  function fan(box) {
    const POST = 4.6,
      READ = 300; // thousands per second (Twitter, 2012)
    const big = (v) => (v >= 1000 ? `${+(v / 1000).toFixed(1)} million` : `${Math.round(v)} thousand`);
    box.innerHTML = `<div class="controls"></div><div></div>`;
    const sl = N.slider("People each user follows (and is followed by)", 1, 200, 1, 75);
    box.firstChild.append(sl);
    const out = box.lastChild;
    const row = (name, sub, a, b, total, hi) =>
      `<div class="dp-fr"><div class="dp-fl"><b>${name}</b><b>${big(total)} a second</b></div><small class="dp-fl">${sub}</small><div class="dp-ft"><i style="width:${(100 * a) / hi}%;background:var(--violet)"></i><i style="width:${(100 * b) / hi}%;background:var(--teal)"></i></div></div>`;
    const draw = (f) => {
      const a1 = POST + READ * f,
        a2 = POST * f + READ,
        hi = Math.max(a1, a2);
      out.innerHTML =
        row("Merge on read", `${POST}k posts × 1 write, plus 300k opens × ${f} lookups`, POST, READ * f, a1, hi) +
        row("Fan out on write", `${POST}k posts × ${f} copies, plus 300k opens × 1 lookup`, POST * f, READ, a2, hi) +
        `<div class="dp-lg"><span><i style="background:var(--violet)"></i>writes</span><span><i style="background:var(--teal)"></i>reads</span></div>` +
        cap(
          a1 / a2 > 1.05
            ? `Following ${f}: fan-out does about <b>${Math.round(a1 / a2)}× less work</b>, because it multiplies the rare operation.`
            : "Following just one account: the work is the same either way. The gap opens as follows grow.",
        );
    };
    sl.onInput(draw);
    draw(75);
  }

  /** Synchronous, semi-synchronous and asynchronous replication on one timeline: the client waits for the slowest one it waits for. */
  function sync(box) {
    const LANES = [
      ["Leader", 0, 5, "blue", "stores the write: 5 ms"],
      ["Follower A", 5, 35, "teal", "confirms after 30 ms"],
      ["Follower B", 5, 95, "amber", "confirms after 90 ms"],
    ];
    const MODE = {
      async: [5, [], "Asynchronous"],
      semi: [35, [1], "Semi-synchronous"],
      all: [95, [1, 2], "Synchronous (all followers)"],
    };
    const WHY = {
      async:
        "the client hears back as soon as the leader has stored the write. No follower has it yet, so a leader crash now loses it.",
      semi: "the leader also waits for follower A. The client hears at 5 + 30 = <b>35 ms</b>, and the write is on two machines. B is still catching up.",
      all: "the leader waits for the slowest follower, B. The client hears at 5 + 90 = <b>95 ms</b>, but all three machines hold the write.",
    };
    let mode = "semi";
    const X = (t) => 60 + t * 4.8;
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap" style="min-height:3.6em"></div>`;
    const [ctl, fig, out] = [...box.children];
    const draw = () => {
      const [t, wait, name] = MODE[mode];
      const lane = ([l, s, e, c, txt], i) =>
        `<text x="52" y="${i * 44 + 40}" class="fig-box" style="text-anchor:end;font-size:12px">${l}</text><rect x="${X(s)}" y="${i * 44 + 22}" width="${(e - s) * 4.8}" height="26" rx="7" fill="${tint(c, 40)}" stroke="var(--${c})" stroke-width="2" opacity="${!i || wait.includes(i) ? 1 : 0.35}"/>${txt ? `<text x="${i ? X(s) + 10 : X(e) + 8}" y="${i * 44 + 40}" class="fig-sub" style="text-anchor:start">${txt}</text>` : ""}`;
      const ticks = [0, 20, 40, 60, 80, 100]
        .map((v) => `<text x="${X(v)}" y="196" class="fig-sub">${v}</text>`)
        .join("");
      fig.innerHTML = `<svg class="fig" viewBox="0 0 560 204" style="max-height:204px" role="img" aria-label="Timeline in milliseconds: the leader stores the write by 5 ms, follower A confirms at 35 ms, follower B at 95 ms. ${name}: the client is told at ${t} ms."><line x1="60" y1="170" x2="${X(100)}" y2="170" stroke="var(--line-2)" stroke-width="2"/>${ticks}${LANES.map(lane).join("")}<line x1="${X(t)}" y1="22" x2="${X(t)}" y2="170" stroke="var(--violet)" stroke-width="3" stroke-dasharray="6 4"/><text x="${Math.max(X(t), 130)}" y="14" class="fig-box" style="fill:var(--violet-ink);font-size:12px">client told at ${t} ms</text></svg>`;
      out.innerHTML = `<b>${name}</b>: ${WHY[mode]}`;
    };
    ctl.append(
      N.seg(
        Object.entries(MODE).map(([k, m]) => [k, m[2].replace(" (all followers)", "")]),
        mode,
        (k) => ((mode = k), draw()),
      ),
    );
    draw();
  }

  /** hash mod N: the same 12 keys before and after the number of nodes changes. */
  function mod(box) {
    const COL = ["teal", "blue", "violet", "amber", "rose", "gold"],
      K = 12;
    let after = 4;
    box.innerHTML = `<div class="controls" style="justify-content:center"></div><div></div><div class="fig-cap"></div>`;
    const [ctl, fig, out] = [...box.children];
    const cell = (k, n, cls = "") =>
      `<div class="dp-k ${cls}" style="background:${tint(COL[k % n], 45)}">${"ABCDEF"[k % n]}</div>`;
    const draw = () => {
      const keys = Array.from({ length: K }, (_, k) => k),
        moved = keys.filter((k) => k % 3 !== k % after).length,
        least = Math.ceil((K * Math.abs(after - 3)) / Math.max(after, 3));
      fig.innerHTML =
        `<div class="dp-rl">Hash of the key</div><div class="dp-row">${keys.map((k) => `<div class="dp-k">${k}</div>`).join("")}</div>` +
        `<div class="dp-rl">3 nodes: node = hash mod 3</div><div class="dp-row">${keys.map((k) => cell(k, 3)).join("")}</div>` +
        `<div class="dp-rl">${after} nodes: node = hash mod ${after} (red outline = the key moves)</div><div class="dp-row">${keys.map((k) => cell(k, after, k % 3 === k % after ? "stay" : "mv")).join("")}</div>`;
      out.innerHTML = `<b>${moved} of ${K}</b> keys change node. The fewest moves that could ever be needed is ${least}.`;
    };
    ctl.append(
      N.seg(
        [
          ["4", "Add a node"],
          ["5", "Add two"],
          ["2", "Remove one"],
        ],
        "4",
        (v) => ((after = +v), draw()),
      ),
    );
    draw();
  }

  /** Lost update: two withdrawals of 30 from 100, interleaved (no isolation) and one after the other (isolated). */
  function lost(box, life) {
    const plan = (title, sched, end) => {
      let db = 100;
      const loc = [null, null],
        st = [
          { r: "", w: "" },
          { r: "", w: "" },
        ];
      const snap = (cap, on, fin = "") => ({ cap, on, fin, db, st: st.map((s) => ({ ...s })) });
      const f = [snap(`<b>${title}</b>: two withdrawals of £30 start at the same moment. The balance is £100.`, -1)];
      sched.forEach(([who, op]) => {
        const i = who - 1;
        if (op === "r") {
          loc[i] = db;
          st[i].r = `read ${db}`;
          f.push(snap(`Withdrawal ${who} reads the balance: <b>${db}</b>.`, i));
        } else {
          db = loc[i] - 30;
          st[i].w = `write ${db}`;
          f.push(snap(`Withdrawal ${who} works out ${loc[i]} − 30 and writes <b>${db}</b>.`, i));
        }
      });
      f.push(snap(end(db), -1, db === 40 ? "good" : "bad"));
      return f;
    };
    const mix = [
      [1, "r"],
      [2, "r"],
      [1, "w"],
      [2, "w"],
    ];
    const one = [
      [1, "r"],
      [1, "w"],
      [2, "r"],
      [2, "w"],
    ];
    F.run(box, life, {
      build(stage) {
        const w = (i) => `<div class="dp-w"><b>Withdrawal ${i}</b><span></span><span></span></div>`;
        stage.innerHTML = `<div class="dp-lost">${w(1)}<div class="dp-db"><small>Balance in the database</small><b></b></div>${w(2)}</div>`;
        return stage;
      },
      *frames() {
        yield* plan(
          "No isolation",
          mix,
          (d) => `The database says <b>£${d}</b>, but £60 was withdrawn from £100. One withdrawal has vanished.`,
        );
        yield* plan("Isolated", one, (d) => `Run one after the other, nothing is lost: <b>£${d}</b>.`);
      },
      draw(sc, f) {
        sc.querySelectorAll(".dp-w").forEach((c, i) => {
          c.classList.toggle("on", f.on === i);
          [f.st[i].r || "–", f.st[i].w || "–"].forEach((t, j) => (c.children[j + 1].textContent = t));
        });
        const db = sc.querySelector(".dp-db");
        db.className = `dp-db ${f.fin}`;
        db.querySelector("b").textContent = `£${f.db}`;
      },
    });
  }

  /** Reading a key means scanning the file: the longest read grows in step with the file. */
  function scan(box) {
    box.innerHTML = `<div class="controls"></div><div></div>`;
    const sl = N.slider("Lines in the file", 3, 16, 1, 10, (m) => num(2 ** m));
    box.firstChild.append(sl);
    const draw = (m) => {
      const n = 2 ** m;
      box.lastChild.innerHTML =
        F.bars(
          [
            ["write: add one line", 1, "teal", " step"],
            ["read: scan every line", n, "rose", " steps"],
          ],
          { max: n, fmt: num },
        ) +
        cap(
          `A file of ${num(n)} lines: a write is 1 step, the longest read is ${num(n)}. Drag one notch right to double the file.`,
        );
    };
    sl.onInput(draw);
    draw(10);
  }
  Object.assign(partScope, { plain: { pct, fan, sync, mod, lost, scan } });
})();
