/* Data Science (COM3021) — Lecture 1: reliable, scalable and maintainable data systems */
(function () {
  const partScope = (NIC.shared.ds = NIC.shared.ds || {});

  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, shuffle } = N;
  const S = "ds";
  const reg = (m) => N.register({ subject: S, lecture: 1, ...m });

  // ---------- shared small builders ----------
  const table = (head, rows) =>
    `<table class="t" style="max-width:680px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows
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
  const box = (label, sub, color) =>
    `<div style="border:1px solid ${color || "var(--line-2)"};border-radius:10px;padding:8px 12px;background:var(--bg-2);min-width:110px"><b>${label}</b><br><span class="faint" style="font-size:12.5px">${sub}</span></div>`;
  function sorter(root, title, cats, items) {
    let order = shuffle(items.map((_, i) => i)),
      idx = 0,
      right = 0,
      log = [];
    const card =
      el(`<div class="card"><div class="card-head"><h2>${title}</h2><span class="mono dim" data-sc></span></div>
      <div data-item style="font-size:18px;font-weight:600;margin:4px 0 14px"></div>
      <div style="display:grid;grid-template-columns:repeat(${Math.min(cats.length, 4)},1fr);gap:10px">${cats.map(([c, d]) => `<button class="btn" data-c="${c}" style="text-align:left;padding:12px 14px;white-space:normal"><b>${c}</b>${d ? `<br><span class="faint" style="font-size:12.5px">${d}</span>` : ""}</button>`).join("")}</div>
      <div data-fb style="margin-top:12px;min-height:24px"></div><table class="t" data-log style="margin-top:8px"></table></div>`);
    const draw = () => {
      qs("[data-sc]", card).textContent = `${right} / ${log.length}`;
      qs("[data-item]", card).textContent =
        idx < order.length ? `“${items[order[idx]][0]}”` : `Done: ${right}/${items.length}`;
      qs("[data-log]", card).innerHTML = log
        .map(
          ([i, p]) =>
            `<tr><td>${items[i][0]}</td><td style="color:${p === items[i][1] ? "var(--teal)" : "var(--rose)"}">${p}</td><td class="faint">${p === items[i][1] ? "" : "→ " + items[i][1]}${items[i][2] ? ` · ${items[i][2]}` : ""}</td></tr>`,
        )
        .join("");
    };
    qsa("[data-c]", card).forEach(
      (b) =>
        (b.onclick = () => {
          if (idx >= order.length) return;
          const i = order[idx],
            ok = b.dataset.c === items[i][1];
          if (ok) right++;
          log.unshift([i, b.dataset.c]);
          idx++;
          qs("[data-fb]", card).innerHTML = ok
            ? `<span style="color:var(--teal-ink)">✓ ${items[i][1]}</span>${items[i][2] ? ` <span class="dim">· ${items[i][2]}</span>` : ""}`
            : `<span style="color:var(--rose-ink)">✗ It's <b>${items[i][1]}</b></span>${items[i][2] ? ` <span class="dim">· ${items[i][2]}</span>` : ""}`;
          draw();
        }),
    );
    draw();
    root.appendChild(card);
  }

  /* ============ 1.1 Why data-intensive? ============ */
  reg({
    id: "ds-why",
    order: 1,
    num: "1.1",
    title: "Why data-intensive systems are hard",
    blurb: "From one mainframe to Google-scale: why a single server broke down, and the two big trade-offs.",
    render(root, life) {
      root.appendChild(header(this, ""));
      // --- single server vs cluster ---
      let mode = "single",
        load = 3000,
        nodes = 6,
        broken = new Set();
      const CAP_BIG = 6000,
        CAP_SMALL = 1000;
      const card = el(`<div class="card"><div class="card-head"><h2>One powerful server vs many cheap ones</h2></div>
        <div class="controls" id="b1"></div><div class="controls" id="b2"></div>
        <div id="machines" style="display:flex;gap:10px;flex-wrap:wrap;margin:10px 0"></div>
        <div class="stat-row"><div class="stat"><small>Capacity (req/s)</small><b id="cap"></b></div><div class="stat teal"><small>Served</small><b id="srv"></b></div><div class="stat rose"><small>Dropped</small><b id="drp"></b></div><div class="stat"><small>Status</small><b id="stt"></b></div></div>
        <p class="faint" style="font-size:12.5px">Click a machine to break it (a fault), and click again to repair it. The numbers are illustrative.</p></div>`);
      root.appendChild(card);
      const sL = N.slider("Incoming load (requests/sec)", 0, 12000, 100, load, (v) => v.toLocaleString());
      sL.onInput((v) => {
        load = v;
        draw();
      });
      const sN = N.slider("Cheap machines", 2, 12, 1, nodes);
      sN.onInput((v) => {
        nodes = v;
        broken.clear();
        draw();
      });
      qs("#b1", card).append(
        N.seg(
          [
            ["single", "Single powerful server"],
            ["cluster", "Cluster of cheap machines"],
          ],
          mode,
          (v) => {
            mode = v;
            broken.clear();
            sN.style.display = v === "cluster" ? "" : "none";
            draw();
          },
        ),
        sN,
      );
      sN.style.display = "none";
      qs("#b2", card).append(sL);
      function draw() {
        const ms =
          mode === "single"
            ? [{ cap: CAP_BIG, name: "Mainframe" }]
            : Array.from({ length: nodes }, (_, i) => ({ cap: CAP_SMALL, name: "Node " + (i + 1) }));
        const alive = ms.filter((_, i) => !broken.has(i));
        const cap = alive.reduce((a, m) => a + m.cap, 0),
          served = Math.min(load, cap);
        const per = alive.length ? load / alive.length : 0;
        qs("#machines", card).innerHTML = ms
          .map((m, i) => {
            const dead = broken.has(i),
              util = dead ? 0 : Math.min(1, per / m.cap);
            return `<button class="btn" data-i="${i}" style="width:${mode === "single" ? 220 : 96}px;padding:10px;text-align:left;border-color:${dead ? "var(--rose)" : util >= 1 ? "var(--amber)" : "var(--line-2)"}">
            <div style="font-size:12px" class="${dead ? "" : "dim"}">${dead ? "💥 " : ""}${m.name}</div><div class="mono" style="font-size:11px;color:var(--text-faint)">${m.cap.toLocaleString()} req/s</div>
            <div style="height:6px;border-radius:3px;background:var(--bg);margin-top:6px;overflow:hidden"><div style="height:100%;width:${util * 100}%;background:${util >= 1 ? "var(--amber)" : "var(--teal)"}"></div></div></button>`;
          })
          .join("");
        qsa("#machines [data-i]", card).forEach(
          (b) =>
            (b.onclick = () => {
              const i = +b.dataset.i;
              broken.has(i) ? broken.delete(i) : broken.add(i);
              draw();
            }),
        );
        qs("#cap", card).textContent = cap.toLocaleString();
        qs("#srv", card).textContent = served.toLocaleString();
        qs("#drp", card).textContent = (load - served).toLocaleString();
        const st =
          cap === 0 ? ["DOWN", "var(--rose)"] : load > cap ? ["Overloaded", "var(--amber)"] : ["Up", "var(--teal)"];
        qs("#stt", card).textContent = st[0];
        qs("#stt", card).style.color = st[1];
      }
      draw();

      // --- consistency vs availability ---
      let a = 5,
        b = 5,
        link = true,
        pref = "consistent",
        logs = [];
      const cv =
        el(`<div class="card"><div class="card-head"><h2>Consistency vs availability</h2><span class="tag">the first trade-off</span></div>
        <p class="dim">The same "tickets left" value is stored on two servers (replicas) in different cities. They copy updates to each other over a network link.</p>
        <div class="controls" id="c1"></div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin:10px 0">
          <div class="card" style="margin:0;background:var(--bg-2);text-align:center"><div class="faint">🇬🇧 London replica</div><div class="mono" style="font-size:28px" id="va"></div><button class="btn small" id="buy">Buy 1 ticket here</button></div>
          <button class="btn" id="lnk"></button>
          <div class="card" style="margin:0;background:var(--bg-2);text-align:center"><div class="faint">🇺🇸 New York replica</div><div class="mono" style="font-size:28px" id="vb"></div><button class="btn small" id="read">Read "tickets left" here</button></div>
        </div><div id="clog" class="log"></div></div>`);
      root.appendChild(cv);
      qs("#c1", cv).append(
        el(`<span class="faint" style="font-size:13px">When the link is broken, New York should…</span>`),
        N.seg(
          [
            ["consistent", "stay consistent (refuse to answer)"],
            ["available", "stay available (answer anyway)"],
          ],
          pref,
          (v) => (pref = v),
        ),
      );
      const cdraw = () => {
        qs("#va", cv).textContent = a;
        qs("#vb", cv).textContent = b;
        qs("#lnk", cv).innerHTML = link
          ? "⇄ link OK<br><span class='faint' style='font-size:11px'>click to cut</span>"
          : "✂ link CUT<br><span class='faint' style='font-size:11px'>click to repair</span>";
        qs("#lnk", cv).style.borderColor = link ? "var(--teal)" : "var(--rose)";
        qs("#clog", cv).innerHTML = logs
          .slice(0, 6)
          .map((l) => `<div style="margin:4px 0">${l}</div>`)
          .join("");
      };
      qs("#buy", cv).onclick = () => {
        if (a > 0) a--;
        if (link) {
          b = a;
          logs.unshift(`London sold a ticket → ${a}. Copied to New York straight away.`);
        } else
          logs.unshift(
            `London sold a ticket → ${a}. <span style="color:var(--amber-ink)">Link is cut, so New York still thinks ${b}.</span>`,
          );
        cdraw();
      };
      qs("#read", cv).onclick = () => {
        if (link) logs.unshift(`New York answers <b>${b}</b>, which is correct and up to date. ✓`);
        else if (pref === "consistent")
          logs.unshift(
            `<span style="color:var(--rose-ink)">New York refuses: "can't confirm the latest value, try later".</span> Consistent, but <b>unavailable</b>.`,
          );
        else
          logs.unshift(
            `New York answers <b>${b}</b>${b !== a ? ` <span style="color:var(--amber-ink)">but the real value is ${a}: stale!</span> Available, but <b>inconsistent</b>.` : " (happens to still be correct)."}`,
          );
        cdraw();
      };
      qs("#lnk", cv).onclick = () => {
        link = !link;
        if (link) {
          b = a;
          logs.unshift(`Link repaired. Replicas sync → both ${a}.`);
        } else logs.unshift("✂ Network link cut.");
        cdraw();
      };
      cdraw();

      root.appendChild(
        predict({
          id: "ds-why-1",
          q: "An online shop's single database server dies at 2 a.m. What limitation of the traditional approach is this?",
          opts: [
            "Scalability: the server couldn't grow",
            "Availability and fault tolerance",
            "Maintenance: it needed an upgrade",
          ],
          a: 1,
          why: "With everything on one server, any fault takes the whole service down. Spreading work over several machines lets the service survive individual faults.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Past: single servers (mainframes), static data formats, expensive RDBMSs (MS SQL, Oracle).",
            "The Web changed everything: more services online, dynamically generated content, rapid growth (Google, eBay, Facebook).",
            "Single servers struggle with <b>availability / fault tolerance</b>, <b>scalability</b> and <b>maintenance</b>.",
            "Two trade-offs: <b>consistency vs availability</b>, and <b>one powerful system vs several cheap commodity computers</b>.",
          ],
          "The web made data huge and dynamic, and single servers couldn't stay up or keep up, so we trade consistency against availability and one big machine against many cheap ones.",
        ),
      );
    },
  });
  Object.assign(partScope, { box, flow, reg, sorter, table });
})();
