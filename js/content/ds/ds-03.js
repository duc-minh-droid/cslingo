(function () {
  const partScope = (NIC.shared.ds = NIC.shared.ds || {});
  const { reg } = partScope;
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, rnd } = N;

  /* ============ 1.4 Load & performance ============ */
  reg({
    id: "ds-load",
    order: 4,
    num: "1.4",
    title: "Load & performance",
    blurb:
      "Describe load with numbers, read response-time distributions, and see why an average hides your unhappiest users.",
    render(root, life) {
      root.appendChild(header(this, ""));
      // --- distribution ---
      let tail = 0.05,
        slo = 300,
        data = [];
      const card =
        el(`<div class="card"><div class="card-head"><h2>1,000 requests: the response-time distribution</h2></div><div class="controls" id="p1"></div>
        <canvas class="viz" id="hist"></canvas>
        <div class="stat-row"><div class="stat"><small>Mean (average)</small><b id="mn"></b></div><div class="stat teal"><small>Median (p50)</small><b id="md"></b></div><div class="stat amber"><small>p95</small><b id="p95"></b></div><div class="stat rose"><small>p99</small><b id="p99"></b></div><div class="stat violet"><small>Within target</small><b id="ok"></b></div></div>
        <p class="dim">p95 = 95% of requests were faster than this. The dashed line is your target ("respond within X ms").</p>
        <div class="controls"><button class="btn" id="regen">New sample</button></div></div>`);
      root.appendChild(card);
      const sT = N.slider("Share of slow requests", 0, 0.3, 0.01, tail, (v) => Math.round(v * 100) + "%"),
        sS = N.slider("Target (ms)", 100, 1500, 50, slo);
      sT.onInput((v) => {
        tail = v;
        gen();
      });
      sS.onInput((v) => {
        slo = v;
        draw();
      });
      qs("#p1", card).append(sT, sS);
      const gn = () => {
        let u = 0,
          v = 0;
        while (!u) u = rnd();
        while (!v) v = rnd();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      };
      function gen() {
        data = Array.from({ length: 1000 }, () =>
          rnd() < tail ? 600 + rnd() * 1800 : Math.exp(Math.log(120) + 0.35 * gn()),
        ).sort((a, b) => a - b);
        draw();
      }
      const pct = (q) => data[Math.min(data.length - 1, Math.floor(q * data.length))];
      function draw() {
        const C = N.colors(),
          bins = 40,
          max = 2500,
          cnt = new Array(bins).fill(0);
        data.forEach((x) => cnt[Math.min(bins - 1, Math.floor((x / max) * bins))]++);
        N.barChart(qs("#hist", card), {
          groups: [{ values: cnt, color: (i) => (((i + 0.5) * max) / bins > slo ? C.rose : C.teal) }],
          labels: cnt.map((_, i) => (i % 4 === 0 ? Math.round((i * max) / bins) + "" : "")),
          height: 200,
          decimals: 0,
          names: ["requests"],
          tipTitle: (i) => `${Math.round((i * max) / bins)}–${Math.round(((i + 1) * max) / bins)} ms`,
          markers: [{ x: (slo / max) * bins - 0.5, color: C.amber, label: `target ${slo} ms` }],
        });
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        qs("#mn", card).textContent = Math.round(mean) + " ms";
        qs("#md", card).textContent = Math.round(pct(0.5)) + " ms";
        qs("#p95", card).textContent = Math.round(pct(0.95)) + " ms";
        qs("#p99", card).textContent = Math.round(pct(0.99)) + " ms";
        qs("#ok", card).textContent = (data.filter((v) => v <= slo).length / 10).toFixed(1) + "%";
      }
      life.onResize(draw);
      gen();
      qs("#regen", card).onclick = gen;

      // --- load vs response time ---
      const MU = 100;
      let lam = 600,
        servers = 8,
        target = 50;
      const q =
        el(`<div class="card"><div class="card-head"><h2>What happens when load grows?</h2><span class="faint">each server handles ${MU} req/s (10 ms per request) · simple queueing model</span></div>
        <div class="controls" id="q1"></div><div class="grid two"><div><h3>① Keep the system (fixed servers): what happens to performance?</h3><canvas class="viz" id="qc"></canvas><p class="dim" id="qT"></p></div>
        <div><h3>② Keep the performance: how many servers do you need?</h3><div class="controls" id="q2"></div><div class="stat-row"><div class="stat teal"><small>Servers needed</small><b id="need"></b></div></div><p class="dim" id="nT"></p></div></div></div>`);
      root.appendChild(q);
      const sLam = N.slider("Load (req/s)", 50, 2000, 50, lam),
        sSrv = N.slider("Servers", 1, 25, 1, servers),
        sTg = N.slider("Target response time (ms)", 15, 200, 5, target);
      sLam.onInput((v) => {
        lam = v;
        qdraw();
      });
      sSrv.onInput((v) => {
        servers = v;
        qdraw();
      });
      sTg.onInput((v) => {
        target = v;
        qdraw();
      });
      qs("#q1", q).append(sLam, sSrv);
      qs("#q2", q).append(sTg);
      const T = (l, n) => {
        const per = l / n;
        return per >= MU ? Infinity : 1000 / (MU - per);
      };
      function qdraw() {
        const xs = Array.from({ length: 40 }, (_, i) => 50 + (i * 1950) / 39);
        N.lineChart(qs("#qc", q), {
          series: [
            { data: xs.map((x) => Math.min(300, T(x, servers))), color: N.colors().teal },
            { data: xs.map(() => target), color: N.colors().amber, dash: [5, 4] },
          ],
          yMin: 0,
          yMax: 300,
          height: 190,
          xLabel: "load 50 → 2000 req/s",
        });
        const t = T(lam, servers);
        qs("#qT", q).innerHTML =
          t === Infinity
            ? `<b style="color:var(--rose-ink)">Overloaded:</b> ${lam} req/s is more than ${servers} × ${MU} = ${servers * MU} capacity. The queue grows forever.`
            : `At ${lam} req/s on ${servers} servers: <b>${t.toFixed(0)} ms</b>. Response time stays flat, then shoots up near capacity (${servers * MU} req/s).`;
        const need = target <= 1000 / MU ? Infinity : Math.ceil(lam / (MU - 1000 / target));
        qs("#need", q).textContent = need === Infinity ? "impossible" : need;
        qs("#nT", q).innerHTML =
          need === Infinity
            ? `A single request takes 10 ms, so a ${target} ms target can't be met.`
            : `To answer ${lam} req/s within ${target} ms, each server may take at most ${(MU - 1000 / target).toFixed(0)} req/s, so you need ⌈${lam} / ${(MU - 1000 / target).toFixed(0)}⌉ = <b>${need}</b> servers.`;
      }
      life.onResize(qdraw);
      qdraw();
      root.appendChild(
        predict({
          id: "ds-load-1",
          q: "Raise the share of slow requests to ~10%. The median barely moves. What's the lesson?",
          opts: [
            "The slow requests were just measurement noise and can be ignored",
            "One number like the median hides the unhappy users",
            "The median is the wrong way to average response times",
          ],
          a: 1,
          why: "The lecture: <i>not only a single value (e.g. average response time) but the distribution of values is also important. What fraction of users experience a performance level within the expected range?</i>",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Scalability</b> = the system's ability to cope with increased load.",
            "Describe load with <b>load parameters</b> specific to the system: requests/sec (web app), read/write ratio (database), concurrent players (game). Watch for bottlenecks, average vs extreme cases, and the cost of different operations.",
            "<b>Performance</b>: response time (web services), or records per second / time to process a dataset (data analysis).",
            "Two questions: <b>keep the system</b> → how does performance change? <b>Keep the performance</b> → how many more resources?",
            "Performance varies (load, network), so look at the <b>distribution</b>, not just the average.",
          ],
          "Scalability is coping with more load: measure load with the right parameters, and judge performance by its distribution, not its average.",
        ),
      );
    },
  });

  /* ============ 1.5 Twitter fan-out ============ */
  const USERS = ["Ana", "Ben", "Cat", "Dev", "Eli", "Fay"];
  const FOLLOWS = {
    Ana: ["Ben", "Cat", "Dev"],
    Ben: ["Ana", "Cat"],
    Cat: ["Ana", "Dev", "Eli", "Fay"],
    Dev: ["Cat"],
    Eli: ["Ana", "Cat"],
    Fay: ["Cat", "Ben"],
  }; // X follows these
  const followersOf = (u) => USERS.filter((x) => FOLLOWS[x].includes(u));
  reg({
    id: "ds-twitter",
    order: 5,
    num: "1.5",
    title: "Twitter: do the work on write or on read?",
    blurb: "The fan-out case study: two designs for home timelines, the real numbers, and why Twitter ended up hybrid.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let appr = 1,
        global = [],
        boxes = {},
        writes = 0,
        reads = 0,
        n = 0;
      const card =
        el(`<div class="card"><div class="card-head"><h2>A tiny Twitter with 6 users</h2></div><div class="controls" id="t1"></div>
        <div class="grid side"><svg class="viz" id="g" viewBox="0 0 520 300"></svg><div>
          <div class="stat-row"><div class="stat amber"><small>Writes</small><b id="w"></b></div><div class="stat violet"><small>Reads</small><b id="r"></b></div></div>
          <div id="store"></div></div></div>
        <div class="controls" id="acts"></div><div id="msg" class="callout" style="display:none"></div></div>`);
      root.appendChild(card);
      const POS = { Ana: [90, 70], Ben: [260, 40], Cat: [260, 160], Dev: [430, 70], Eli: [110, 250], Fay: [420, 250] };
      qs("#t1", card).appendChild(
        N.seg(
          [
            ["1", "Approach 1: merge on read"],
            ["2", "Approach 2: fan-out on write"],
          ],
          "1",
          (v) => {
            appr = +v;
            reset();
          },
        ),
      );
      const reset = () => {
        global = [];
        boxes = Object.fromEntries(USERS.map((u) => [u, []]));
        writes = 0;
        reads = 0;
        qs("#msg", card).style.display = "none";
        draw();
      };
      function draw(hl = []) {
        const edges = USERS.flatMap((u) => FOLLOWS[u].map((v) => [u, v]));
        qs("#g", card).innerHTML =
          `<defs><marker id="ar" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="var(--text-faint)"/></marker></defs>` +
          edges
            .map(([a, b]) => {
              const [x1, y1] = POS[a],
                [x2, y2] = POS[b],
                d = Math.hypot(x2 - x1, y2 - y1),
                on = hl.some(([p, q]) => p === a && q === b);
              return `<line x1="${x1}" y1="${y1}" x2="${x2 - ((x2 - x1) / d) * 24}" y2="${y2 - ((y2 - y1) / d) * 24}" stroke="${on ? "var(--amber)" : "var(--line-2)"}" stroke-width="${on ? 3 : 1.3}" marker-end="url(#ar)"/>`;
            })
            .join("") +
          USERS.map(
            (u) =>
              `<g><circle cx="${POS[u][0]}" cy="${POS[u][1]}" r="22" fill="var(--panel-2)" stroke="var(--teal)" stroke-width="2"/><text x="${POS[u][0]}" y="${POS[u][1] + 5}" text-anchor="middle" fill="var(--text)" font-size="13" font-weight="700">${u}</text></g>`,
          ).join("") +
          `<text x="10" y="292" fill="var(--text-faint)" font-size="11">arrow A → B means "A follows B"</text>`;
        qs("#w", card).textContent = writes;
        qs("#r", card).textContent = reads;
        qs("#store", card).innerHTML =
          appr === 1
            ? `<h3>Global tweets table</h3><div class="log" style="max-height:160px">${
                global.length
                  ? global
                      .slice()
                      .reverse()
                      .map((t) => `<div class="mono" style="font-size:12.5px">${t.u}: tweet #${t.n}</div>`)
                      .join("")
                  : '<span class="faint">empty</span>'
              }</div>`
            : `<h3>Timeline caches (one mailbox per user)</h3>${USERS.map(
                (u) =>
                  `<div class="mono" style="font-size:12.5px;margin:2px 0"><b>${u}</b>: ${
                    boxes[u].length
                      ? boxes[u]
                          .slice(-4)
                          .map((t) => `${t.u}#${t.n}`)
                          .join(", ")
                      : '<span class="faint">–</span>'
                  }</div>`,
              ).join("")}`;
      }
      const acts = qs("#acts", card);
      acts.innerHTML = `<span class="faint" style="font-size:13px">Post a tweet as:</span> ${USERS.map((u) => `<button class="btn small" data-post="${u}">${u}</button>`).join("")} <span class="faint" style="font-size:13px;margin-left:12px">Open home timeline of:</span> ${USERS.map((u) => `<button class="btn small" data-read="${u}">${u}</button>`).join("")} <button class="btn ghost small" id="rs">Reset</button>`;
      const msg = (h) => {
        const m = qs("#msg", card);
        m.style.display = "block";
        m.innerHTML = h;
      };
      qsa("[data-post]", acts).forEach(
        (b) =>
          (b.onclick = () => {
            const u = b.dataset.post,
              t = { u, n: ++n };
            if (appr === 1) {
              global.push(t);
              writes++;
              draw();
              msg(`<b>${u}</b> posts → <b>1 write</b> into the global table. Cheap!`);
            } else {
              const fs = followersOf(u);
              fs.forEach((f) => boxes[f].push(t));
              writes += fs.length;
              draw(fs.map((f) => [f, u]));
              msg(
                `<b>${u}</b> posts → copied into the timeline cache of each of ${u}'s <b>${fs.length} followers</b> (${fs.join(", ")}) = <b>${fs.length} writes</b>.`,
              );
            }
          }),
      );
      qsa("[data-read]", acts).forEach(
        (b) =>
          (b.onclick = () => {
            const u = b.dataset.read,
              fl = FOLLOWS[u];
            if (appr === 1) {
              reads += fl.length;
              const tl = global.filter((t) => fl.includes(t.u));
              draw(fl.map((f) => [u, f]));
              msg(
                `<b>${u}</b> opens their timeline → look up the ${fl.length} people they follow (${fl.join(", ")}), fetch each one's tweets and merge them by time = <b>${fl.length} reads</b> + a merge. Result: ${tl.length ? tl.map((t) => `${t.u}#${t.n}`).join(", ") : "nothing yet"}.`,
              );
            } else {
              reads += 1;
              draw();
              msg(
                `<b>${u}</b> opens their timeline → read their own mailbox = <b>1 read</b>. It's already built: ${boxes[u].length ? boxes[u].map((t) => `${t.u}#${t.n}`).join(", ") : "empty"}.`,
              );
            }
          }),
      );
      acts.querySelector("#rs").onclick = reset;
      reset();

      // --- at scale ---
      let tps = 4600,
        rps = 300000,
        fol = 75,
        celeb = false;
      const sc =
        el(`<div class="card"><div class="card-head"><h2>At Twitter's scale (November 2012 numbers)</h2></div><div class="controls" id="s1"></div>
        <div class="grid two"><div><canvas class="viz" id="bc"></canvas><div class="legend"><span style="--c:var(--amber)">writes/sec</span><span style="--c:var(--violet)">timeline reads/sec (lookups)</span></div></div><div id="sT" class="dim"></div></div></div>`);
      root.appendChild(sc);
      const sTp = N.slider("Tweets posted /s", 1000, 12000, 100, tps, (v) => v.toLocaleString()),
        sRp = N.slider("Timeline reads /s", 50000, 500000, 10000, rps, (v) => v.toLocaleString()),
        sFo = N.slider("Avg followers", 10, 300, 5, fol);
      const cb = el(
        `<label class="field"><input type="checkbox"> A celebrity with 30 million followers tweets</label>`,
      );
      qs("input", cb).onchange = (e) => {
        celeb = e.target.checked;
        sdraw();
      };
      sTp.onInput((v) => {
        tps = v;
        sdraw();
      });
      sRp.onInput((v) => {
        rps = v;
        sdraw();
      });
      sFo.onInput((v) => {
        fol = v;
        sdraw();
      });
      qs("#s1", sc).append(sTp, sRp, sFo, cb);
      const k = (x) => (x >= 1e6 ? (x / 1e6).toFixed(1) + "M" : Math.round(x / 1000) + "k");
      function sdraw() {
        const a1w = tps,
          a1r = rps * fol,
          a2w = tps * fol,
          a2r = rps;
        N.barChart(qs("#bc", sc), {
          groups: [
            { values: [a1w, a2w].map((x) => x / 1e6), color: N.colors().amber },
            { values: [a1r, a2r].map((x) => x / 1e6), color: N.colors().violet },
          ],
          labels: ["Approach 1", "Approach 2"],
          height: 200,
          decimals: 1,
        });
        qs("#sT", sc).innerHTML =
          `<p><b>Approach 1</b>: ${k(a1w)} writes/s, but every timeline read has to look up ~${fol} accounts and merge: ${k(rps)} × ${fol} ≈ <b>${k(a1r)} lookups/s</b>.</p>
          <p><b>Approach 2</b>: every tweet is copied to ~${fol} caches: ${k(tps)} × ${fol} = <b>${k(a2w)} writes/s</b> (the slide: 4.6k → <b>345k</b>), but each read is 1 cheap lookup: ${k(a2r)}/s.</p>
          <p>Reads outnumber tweets ~${Math.round(rps / tps)}× (the slide rounds this to "two orders of magnitude"), so doing the work <b>at write time</b> wins.</p>
          ${celeb ? `<div class="callout rose"><b>Celebrity problem:</b> one tweet = <b>30,000,000</b> cache writes. Twitter's goal is to deliver a tweet within <b>5 seconds</b>, so that would need 6M writes/s for just this one tweet. Hence the <b>hybrid</b>: approach 2 for most users, approach 1 for accounts with huge follower counts (their tweets are fetched and merged in at read time).</div>` : ""}
          <p class="faint" style="font-size:12.5px">Approach 1's lookup count assumes each user follows ~${fol} accounts (on average, followers = followees across the whole network).</p>`;
      }
      life.onResize(sdraw);
      sdraw();
      root.appendChild(
        predict({
          id: "ds-tw-1",
          q: "Why did Twitter switch from approach 1 to approach 2?",
          opts: [
            "Approach 2 needs far fewer database writes per tweet posted",
            "Timeline reads are ~100× more common than tweets",
            "Approach 1 kept losing tweets whenever load got high",
          ],
          a: 1,
          why: "Approach 1 struggled to keep up with home-timeline queries. Approach 2 moves the cost to posting (4.6k tweets/s → 345k cache writes/s), which is fine because posting is far rarer than reading.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Twitter's load: post tweet 4.6k/s average (12k+ peak), home timeline 300k/s. <b>Fan-out</b>: each user follows many people and is followed by many.",
            "<b>Approach 1</b>: insert into a global collection, and on read look up the followees, fetch their tweets and merge. Cheap writes, expensive reads.",
            "<b>Approach 2</b>: keep a timeline cache (mailbox) per user, and on post insert into every follower's cache. Expensive writes (345k/s), cheap reads.",
            "<b>Hybrid</b>: approach 2 for most users, approach 1 for users with very many followers.",
          ],
          "Twitter moved the work from read time to write time because reads vastly outnumber tweets, except for celebrities, where fan-out is too expensive.",
        ),
      );
    },
  });
})();
