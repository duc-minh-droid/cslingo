/* Data Science (COM3021), Lecture 8: stream processing.
   This part: helpers shared with the other Lecture 8 files (NIC.shared.ds8), the figures for 8.1 and 8.2, and
   ds8-streams (8.1, bounded and unbounded data, shrinking the batch window). */
(function () {
  const S = (NIC.shared.ds8 = NIC.shared.ds8 || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 8, ...m });

  /* ---------- helpers (the right answer goes first: the engine shuffles the options) ---------- */
  const mc = (q, o, why, hint) => ({ q, o, a: 0, why, ...(hint ? { hint } : {}) });
  const pr = (id, q, opts, why) => predict({ id, q, opts, a: 0, why });
  const st = (t, b, v, c) => ({ t, b, v, c });
  const P = (...ps) => ps.map((p) => `<p>${p}</p>`).join("");
  const maths = (h) => `<details class="math-more"><summary>Show the maths</summary>${h}</details>`;
  const seg = (box, spec, v, cb) =>
    box.appendChild(
      N.seg(
        spec.split("|").map((x) => x.split(":")),
        v,
        cb,
      ),
    );
  const log = (box, items) =>
    (box.innerHTML = `<ul class="ds8-log">${items.map(([c, t]) => `<li class="${c}">${t}</li>`).join("")}</ul>`);
  const svg = (w, h, inner, label) =>
    `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-width:${w}px;width:100%" role="img" aria-label="${label}">${inner}</svg>`;
  const tx = (x, y, t, { a = "middle", s = 12, c = "var(--text)" } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:800 ${s}px var(--sans);fill:${c}">${t}</text>`;
  const box2 = (x, y, w, h, c, t, sub) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="color-mix(in srgb,var(--${c}) 18%,var(--panel))" stroke="var(--${c})" stroke-width="2"/>${tx(x + w / 2, y + (sub ? h / 2 - 2 : h / 2 + 5), t, { s: 12.5 })}${sub ? tx(x + w / 2, y + h / 2 + 13, sub, { s: 10.5, c: "var(--text-dim)" }) : ""}`;
  /** A dot that travels along path d forever (SMIL; the .flowdot class hides it under reduced motion). */
  const dot = (d, c, begin = 0, dur = 2.2) =>
    `<circle class="flowdot" r="5" fill="var(--${c})" opacity="0"><animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" path="${d}"/><animate attributeName="opacity" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.1;0.85;1"/></circle>`;
  /** A message chip. spec "label:colour:flags", e.g. "m3:rose:gone". */
  const chip = (s, isNew) => {
    const [t, c = "", f = ""] = s.split(":");
    return `<span class="ds8-chip ${c} ${f}${isNew ? " new" : ""}">${t}</span>`;
  };
  /** Tappable cards for pick questions: [id, title, line]. */
  const pk = (list) =>
    `<div class="ds8-grid">${list.map(([id, t, v]) => `<div class="ds8-card" data-pick="${id}" style="cursor:pointer"><h4>${t}</h4><div class="ds8-ln">${v}</div></div>`).join("")}</div>`;
  /** Hours as "3 h 16 min" / "54 min". */
  const fmtH = (h) => {
    const m = Math.round(h * 60);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`;
  };

  /** A frame recorder for lane runners: lanes keyed by row, each a list of chip specs. */
  function tape(keys) {
    const lanes = Object.fromEntries(keys.map((k) => [k, []]));
    const out = [];
    let down = [];
    return {
      L: lanes,
      off: (ks) => (down = ks),
      snap: (cap) => out.push({ cap, lanes: JSON.parse(JSON.stringify(lanes)), down: [...down] }),
      out,
    };
  }
  /** Step-through lanes (one row per actor, chips for messages). rows: [[key, name]]; plan() returns tape frames. */
  function laneRun(box, life, rows, plan) {
    let prev = {};
    F.run(box, life, {
      build(stage) {
        stage.innerHTML = `<div class="ds8-lanes">${rows.map(([k, n]) => `<div class="ds8-lane" data-r="${k}"><b>${n}</b><div class="ds8-track"></div></div>`).join("")}</div>`;
        return stage;
      },
      *frames() {
        yield* plan();
      },
      draw(stage, f) {
        stage.querySelectorAll(".ds8-lane").forEach((ln) => {
          const k = ln.dataset.r,
            list = f.lanes[k] || [],
            was = prev[k] || [];
          ln.classList.toggle("down", f.down.includes(k));
          ln.querySelector(".ds8-track").innerHTML = list.length
            ? list.map((s) => chip(s, !was.includes(s))).join("")
            : '<span class="ds8-empty">–</span>';
        });
        prev = f.lanes;
      },
    });
  }
  Object.assign(S, { reg, mc, pr, st, P, maths, seg, log, svg, tx, box2, dot, chip, pk, fmtH, tape, laneRun });

  /* ---------- 8.1 figures ---------- */
  /** Step 1: a batch job reads three bounded files, finishes, writes output; rerunning recreates it. */
  const batchRun = (box, life) =>
    laneRun(
      box,
      life,
      [
        ["in", "Input files"],
        ["job", "Batch job"],
        ["out", "Output"],
      ],
      () => {
        const t = tape(["in", "job", "out"]);
        t.L.in = ["file 1 · 4,000 lines", "file 2 · 2,500 lines", "file 3 · 3,500 lines"];
        t.snap("Yesterday's page views sit in three log files.");
        const tot = [4000, 6500, 10000];
        [0, 1, 2].forEach((i) => {
          t.L.in[i] = `${t.L.in[i]}:teal`;
          t.L.job = [`${tot[i].toLocaleString("en-GB")} lines read:blue`];
          t.snap(`The job reads file ${i + 1}.`);
        });
        t.L.job = ["finished:teal"];
        t.snap("No files are left. The input is <b>bounded</b>, so the job <b>knows it has finished</b>.");
        t.L.out = ["views per page:violet"];
        t.snap("It writes a <b>new</b> output file: views per page. The input files are untouched.");
        t.L.out = ["views per page:violet:gone"];
        t.snap("Someone deletes the output by mistake.");
        t.L.job = ["run again:blue"];
        t.L.out = ["views per page:violet"];
        t.snap("Run the job again on the same files and the same output comes back: it is <b>derived data</b>.");
        return t.out;
      },
    );

  /** Step 2: posts keep arriving and the "end of input" never comes. */
  function ticker(box, life) {
    box.innerHTML = `<div class="ds8-card"><h4>New posts <small data-n></small></h4><div class="ds8-track" data-t></div></div>
      <div class="ds8-card" style="margin-top:8px"><h4>A batch job on this data</h4><div class="ds8-ln" data-j></div></div>`;
    const words = ["mo_17 posts", "ana likes", "raj shares", "li posts", "sam likes", "eve replies"];
    let n = 0,
      list = [];
    const tick = () => {
      n++;
      const h = 9 + Math.floor(n / 6),
        m = (n * 7) % 60;
      list = [...list, `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${words[n % words.length]}`].slice(
        -6,
      );
      qs("[data-n]", box).textContent = `${n} so far`;
      qs("[data-t]", box).innerHTML = list.map((s, i) => chip(`${s}:blue`, i === list.length - 1)).join("");
      qs("[data-j]", box).innerHTML =
        `Waiting for the end of the input… still waiting after ${n} post${n === 1 ? "" : "s"}. It never comes.`;
    };
    tick();
    life.interval(tick, 1100);
  }

  /** Step 3: shrink the batch window; a post at 00:10 waits until the next run. */
  const WINS = [
    [1440, "Daily"],
    [360, "6 hours"],
    [60, "Hourly"],
    [15, "15 min"],
    [0, "Each event"],
  ];
  function windowFig(box) {
    box.innerHTML = `<div class="controls" data-s></div><div data-view></div><div class="ds8-note" data-c></div>`;
    const draw = (W) => {
      const span = W ? 2 * W : 60,
        X = (m) => 30 + (m / span) * 500,
        clock = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
      const runs = W ? [0, W, 2 * W] : [];
      const done = W ? W : 10;
      const inner = `<path d="M30 70H530" stroke="var(--line-2)" stroke-width="3"/>${runs.map((r) => `<path d="M${X(r)} 52V88" stroke="var(--violet)" stroke-width="3"/>${tx(X(r), 106, W === 1440 && r ? (r === 1440 ? "next midnight" : "") : clock(r), { s: 11 })}${tx(X(r), 44, "batch run", { s: 10.5, c: "var(--violet-ink)" })}`).join("")}
        <circle cx="${X(10)}" cy="70" r="8" fill="var(--amber)"/>${tx(X(10) + 2, 128, "post at 00:10", { s: 11, a: "start" })}
        ${W ? `<path d="M${X(10)} 70H${X(done) - 6}" stroke="var(--rose)" stroke-width="4" class="draw"/><path d="M${X(done) - 8} 64l8 6l-8 6z" fill="var(--rose)"/>` : `<circle cx="${X(10)}" cy="70" r="13" fill="none" stroke="var(--teal)" stroke-width="3"/>`}`;
      qs("[data-view]", box).innerHTML = svg(
        560,
        136,
        inner,
        W
          ? `Batch runs every ${fmtH(W / 60)}; a post at 00:10 waits until the next run`
          : "Each event is handled on arrival",
      );
      const c = qs("[data-c]", box);
      c.className = `ds8-note ${W ? "bad" : "ok"}`;
      c.innerHTML = W
        ? `The post waits until the next run: <b>${fmtH((W - 10) / 60)}</b>. The worst any post can wait is about <b>${fmtH(W / 60)}</b>.`
        : "No windows left: the post is processed <b>as it arrives</b>. That is stream processing.";
    };
    seg(qs("[data-s]", box), WINS.map(([w, l]) => `${w}:${l}`).join("|"), "1440", (v) => draw(+v));
    draw(1440);
  }

  /** Step 4: one event, three encodings, and it cannot be edited. */
  const ENC = {
    json: '{"user":"mo_17","action":"like","post":4821,"time":"2026-03-04T09:15:02Z"}',
    text: "2026-03-04T09:15:02Z mo_17 like 4821",
    bin: "00 00 00 11 | 01 | 00 00 12 D5 | 69 A7 F8 16",
  };
  function eventFig(box) {
    box.innerHTML = `<div class="controls" data-s></div><div class="ds8-code" data-e></div><div class="ds8-note" data-z></div>
      <div class="controls"><button class="btn small" data-x>Change it to an unlike</button><button class="btn small ghost" data-r>Reset</button></div><div data-l></div>`;
    let mode = "json",
      extra = false;
    const size = { json: ENC.json.length, text: ENC.text.length, bin: 13 };
    const draw = () => {
      qs("[data-e]", box).textContent = ENC[mode];
      qs("[data-z]", box).innerHTML =
        mode === "bin"
          ? `<b>${size.bin} bytes</b>: user 17, action 1 (like), post 4821, time in seconds since 1970.`
          : `<b>${size[mode]} bytes</b> of ${mode === "json" ? "JSON" : "plain text"}. Same event, same facts.`;
      log(
        qs("[data-l]", box),
        extra
          ? [
              ["no", "Edit refused: an event is <b>immutable</b>. It records something that already happened."],
              ["ok", "Instead a <b>new event</b> is appended: mo_17 unlike 4821 at 09:20:41. Both stay in the stream."],
            ]
          : [],
      );
    };
    seg(qs("[data-s]", box), "json:JSON|text:Text|bin:Binary", "json", (v) => ((mode = v), draw()));
    qs("[data-x]", box).onclick = () => ((extra = true), draw());
    qs("[data-r]", box).onclick = () => ((extra = false), draw());
    draw();
  }

  /** Step 5: one producer, three consumers, events flowing. */
  const pcFig = (() => {
    const ys = [30, 90, 150],
      names = [
        ["Notify the author", "teal"],
        ["Count likes", "amber"],
        ["Rank the feed", "violet"],
      ];
    const paths = ys.map((y) => `M150 90C250 90 290 ${y + 20} 390 ${y + 20}`);
    return svg(
      560,
      200,
      `${box2(10, 62, 140, 56, "blue", "Phone app", "producer")}${paths.map((d) => `<path d="${d}" fill="none" stroke="var(--line-2)" stroke-width="2"/>`).join("")}
      ${names.map(([t, c], i) => box2(390, ys[i], 160, 40, c, t)).join("")}${tx(270, 196, "one like event, three consumers", { s: 11.5, c: "var(--text-dim)" })}
      ${paths.map((d, i) => dot(d, "blue", i * 0.25) + dot(d, "blue", 1.1 + i * 0.25)).join("")}`,
      "A phone app produces like events; three consumers (notify the author, count likes, rank the feed) each receive them",
    );
  })();

  /** Step 6: how often to poll. */
  function pollFig(box) {
    const sl = N.slider("Poll every", 1, 60, 1, 10, (v) => `${v} s`);
    box.innerHTML = `<div class="controls"></div><div data-b></div><div class="ds8-note" data-c></div>`;
    box.firstChild.append(sl);
    const draw = (x) => {
      const polls = Math.round(3600 / x),
        hits = Math.min(12, polls);
      qs("[data-b]", box).innerHTML = F.bars(
        [
          ["polls per hour", polls, "rose"],
          ["polls that find a new event (at most)", hits, "teal"],
          ["pushes if the consumer is notified", 12, "blue"],
        ],
        { max: 3600, fmt: (v) => v.toLocaleString("en-GB") },
      );
      qs("[data-c]", box).innerHTML =
        `12 new events an hour. Polling every ${x} s asks <b>${polls.toLocaleString("en-GB")}</b> times, and at least <b>${(polls - hits).toLocaleString("en-GB")}</b> come back empty. A new event waits about <b>${x / 2} s</b> on average.`;
    };
    sl.onInput(draw);
    draw(10);
  }

  /* ---------- 8.1 demo: a day of posts, batch windows against streaming ---------- */
  const POSTS = [0.4, 1.7, 3.2, 4.9, 6.3, 8.8, 11.1, 12.6, 14.2, 17.5, 19.9, 22.3];
  const doneAt = (t, W) => (W ? Math.ceil(t / W) * W : t);
  const waits = (W) => POSTS.map((t) => doneAt(t, W) - t);
  function dayPanel(box, life) {
    box.innerHTML = `<div class="controls" data-s></div><div data-view></div>
      <div class="controls"><button class="btn primary" data-p>Play the day</button><button class="btn ghost" data-e>Jump to midnight</button></div>
      <div class="stat-row"><div class="stat blue"><small>Processed</small><b data-k></b></div><div class="stat amber"><small>Average wait</small><b data-a></b></div><div class="stat rose"><small>Worst wait</small><b data-w></b></div></div>`;
    let W = 24,
      now = 24,
      timer = null;
    const X = (h) => 20 + (h / 24) * 520;
    const draw = () => {
      const runs = W ? Array.from({ length: 24 / W }, (_, i) => (i + 1) * W) : [];
      const dots = POSTS.map((t) => {
        if (t > now) return "";
        const ok = doneAt(t, W) <= now;
        return `<circle cx="${X(t)}" cy="60" r="7" fill="var(--${ok ? "teal" : "amber"})" stroke="var(--panel)" stroke-width="2"/>`;
      }).join("");
      const inner = `<path d="M20 60H540" stroke="var(--line-2)" stroke-width="3"/>${runs.map((r) => `<path d="M${X(r)} 36V84" stroke="var(--violet)" stroke-width="${W === 1 ? 1.5 : 3}" opacity="${r <= now ? 1 : 0.35}"/>`).join("")}
        ${[0, 6, 12, 18, 24].map((h) => tx(X(h), 104, `${String(h % 24).padStart(2, "0")}:00`, { s: 10.5, c: "var(--text-dim)" })).join("")}
        ${dots}<path d="M${X(now)} 26V92" stroke="var(--blue)" stroke-width="2.5" stroke-dasharray="4 3"/>${tx(Math.min(Math.max(X(now), 40), 520), 20, now >= 24 ? "midnight" : fmtH(now).replace(" h", "h"), { s: 11, c: "var(--blue-ink)" })}
        ${tx(280, 124, W ? `purple lines: batch runs · orange: waiting · green: processed` : "streaming: each post is processed when it arrives", { s: 11, c: "var(--text-dim)" })}`;
      qs("[data-view]", box).innerHTML = svg(
        560,
        132,
        inner,
        "A day of 12 posts on a timeline with the batch runs marked",
      );
      const w = waits(W),
        k = POSTS.filter((t) => doneAt(t, W) <= now).length;
      qs("[data-k]", box).textContent = `${k} of ${POSTS.length}`;
      qs("[data-a]", box).textContent = W ? fmtH(w.reduce((a, b) => a + b, 0) / w.length) : "seconds";
      qs("[data-w]", box).textContent = W ? fmtH(Math.max(...w)) : "seconds";
    };
    const stop = () => {
      if (timer) timer();
      timer = null;
    };
    seg(qs("[data-s]", box), "24:Daily|6:Every 6 hours|1:Hourly|0:Stream", "24", (v) => {
      W = +v;
      draw();
    });
    qs("[data-p]", box).onclick = () => {
      stop();
      now = 0;
      timer = life.interval(() => {
        now = Math.min(24, now + 0.25);
        draw();
        if (now >= 24) stop();
      }, 60);
    };
    qs("[data-e]", box).onclick = () => (stop(), (now = 24), draw());
    draw();
  }

  Object.assign(S, { eventFig, pcFig, pollFig });

  /* ============ 8.1 Data that never stops ============ */
  reg({
    id: "ds8-streams",
    order: 1,
    num: "8.1",
    title: "Data that never stops",
    blurb: "Yesterday's files have an end. Today's posts don't: why that breaks batch jobs.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>A day of posts</h2><span class="tag">batch windows against streaming</span></div><div></div></div>`,
      );
      root.appendChild(card);
      dayPanel(card.lastElementChild, life);
      root.appendChild(
        pr(
          "ds8-streams-2",
          "You switched from <b>Every 6 hours</b> to <b>Hourly</b>. What happened to the <b>Worst wait</b>?",
          [
            "It dropped below one hour",
            "It stayed near 6 hours, as the posts were the same",
            "It rose, because there were more runs to wait for",
          ],
          "A post can never wait longer than one window. With hourly runs the worst case shrinks to under an hour.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Batch processing</b> reads a <b>bounded</b> set of files and writes <b>derived data</b> you can recreate by rerunning the job.",
            "Many sources are <b>unbounded</b>: the data keeps arriving and never ends.",
            "Shrink the batch window until every event is handled as it arrives, and you have <b>stream processing</b>.",
          ],
          "Batch looks back at finished data; a stream handles each event as it happens.",
        ),
      );
    },
  });

  L["ds8-streams"] = {
    sum: "Batch jobs read <b>bounded</b> input and write derived output. Unbounded data never ends, so we shrink the window until each event is processed as it arrives: <b>stream processing</b>.",
    steps: [
      st(
        "Yesterday's pile of files",
        P(
          "Picture a librarian counting yesterday's visitors from three logbooks. She reads every page, writes a summary, and goes home: the books have a last page. That is <b>batch processing</b>. A job reads a <b>bounded</b> set of input files, knows when it has finished, and writes a <b>new</b> output file. The output is <b>derived data</b>: lose it and you just run the job again.",
        ),
        (box, life) => batchRun(box, life),
        mc(
          "A batch job's output file is deleted by mistake. Why is that not a disaster?",
          [
            "It is derived data: rerun the job on the same input",
            "Batch jobs keep a hidden backup of every output",
            "The input files are rewritten to hold the output",
          ],
          "Batch output is derived from the input, which the job leaves untouched. Running the job again produces the same output.",
        ),
      ),
      st(
        "The logbook with no last page",
        P(
          "Now picture a logbook that people keep writing in while you read it. You can never reach the end. Many real sources are like that: <b>unbounded</b>. Social media users posted yesterday, are posting today and will post tomorrow. A batch job waits for the end of its input to know it is done, so on data like this it would wait forever.",
        ),
        (box, life) => ticker(box, life),
        mc(
          "Which input is unbounded?",
          [
            "Readings from sensors that report every minute",
            "Last year's archive of shop receipts, kept for audits",
            "The essays handed in for one module last term",
          ],
          "The sensors keep reporting, so their data never ends. The archive and the essays are fixed sets that a batch job can read to the end.",
        ),
      ),
      st(
        "Shrink the window",
        P(
          "One fix: run the batch job every 24 hours on that day's data. But then you're always reading old news, like a paper delivered once a day. A post at 00:10 waits until midnight. Run it hourly and the wait shrinks, then every minute… until you drop windows altogether and handle <b>every event as it arrives</b>. That is <b>stream processing</b>. Pick a window in the picture.",
        ) +
          maths(
            "<p>With runs every $W$ minutes, an event at time $t$ is processed at the next run:</p>$$t_{\\text{done}}=\\left\\lceil \\frac{t}{W}\\right\\rceil W$$<p>So its wait is less than $W$. For events spread evenly the average wait is about $W/2$. For the post at 00:10 with hourly runs: $\\lceil 10/60\\rceil\\cdot 60=60$, a wait of 50 minutes.</p>",
          ),
        (box) => windowFig(box),
      ),
    ],
    guide: [
      "Pick <b>Daily</b> and press <b>Play the day</b>: orange posts wait for a purple batch run.",
      "Try <b>Every 6 hours</b> and <b>Hourly</b> and compare the waits.",
      "Pick <b>Stream</b>, press <b>Jump to midnight</b>, then answer the question after the demo.",
    ],
  };
})();
