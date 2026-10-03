(function () {
  const partScope = (NIC.shared.dsWorkshops = NIC.shared.dsWorkshops || {});
  const { BL, BLOCKS, FRIENDS, GPOS, NAMES, PEOPLE, fxOn, list, nbrs, reg, snd } = partScope;
  const N = NIC,
    { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /** Run a pipeline of block ids. Returns the steps (input/output sets, edges walked) and the three cost meters. */
  function runQuery(ids) {
    let cur = [],
      seen = new Set(),
      steps = [],
      hops = 0,
      fetches = 0;
    ids.forEach((id, i) => {
      const b = BL[id],
        inp = cur.slice();
      let out,
        edges = [];
      if (b.k === "start") {
        out = id === "all" ? NAMES.slice() : ["Ana"];
        seen = new Set(out);
      } else if (b.id === "hop") {
        hops++;
        fetches += inp.length;
        out = [];
        FRIENDS.forEach(([a, c], ei) => {
          [
            [a, c],
            [c, a],
          ].forEach(([x, y]) => {
            if (inp.includes(x) && !seen.has(y) && !out.includes(y)) {
              out.push(y);
              edges.push(ei);
            }
          });
        });
        FRIENDS.forEach(([a, c], ei) => {
          if ((inp.includes(a) && out.includes(c)) || (inp.includes(c) && out.includes(a)))
            if (!edges.includes(ei)) edges.push(ei);
        });
        out.forEach((p) => seen.add(p));
      } else if (id.startsWith("c-")) out = inp.filter((p) => PEOPLE[p][0] === id.slice(2));
      else out = inp.filter((p) => PEOPLE[p][1] === id.slice(2));
      cur = out;
      steps.push({ id, inp, out, edges });
    });
    return { steps, result: cur, hops, fetches, filters: ids.filter((x) => /^[cw]-/.test(x)) };
  }

  function queryLab(stage, api, life) {
    let pipe = [],
      token = 0;
    const docText = (n) =>
      `{ <b>"name"</b>: "${n}", <b>"city"</b>: "${PEOPLE[n][0]}", <b>"works_at"</b>: "${PEOPLE[n][1]}", <b>"friends"</b>: [${nbrs(
        n,
      )
        .map((x) => `"${x}"`)
        .join(", ")}] }`;
    const build =
      el(`<div class="wk-card"><h3>Your query<span class="wk-sp"></span><button class="btn small ghost" data-clear>Clear</button></h3>
      <div class="wk-pipe" data-pipe></div>
      <div class="wk-pal" style="margin-top:12px" data-pal></div>
      <div class="wk-row" style="margin-top:12px"><button class="btn primary" data-run>Run query</button><span class="wk-note" data-res style="flex:1;min-height:0"></span></div></div>`);
    const views = el(`<div class="wk-grid3">
      <div class="wk-card"><h3>Tables</h3>
        <table class="wk-tbl" data-ptbl><tr><th>name</th><th>city</th><th>works at</th></tr>${NAMES.map((n) => `<tr data-p="${n}"><td><b>${n}</b></td><td>${PEOPLE[n][0]}</td><td>${PEOPLE[n][1]}</td></tr>`).join("")}</table>
        <table class="wk-tbl" data-ftbl style="margin-top:6px"><tr><th>friendships: a</th><th>b</th></tr>${FRIENDS.map(([a, b], i) => `<tr data-e="${i}"><td>${a}</td><td>${b}</td></tr>`).join("")}</table>
        <div class="wk-cost"><span>Self-joins on friendships</span><b data-c-tbl>-</b></div></div>
      <div class="wk-card"><h3>Documents</h3>${NAMES.map((n) => `<div class="wk-doc" data-p="${n}">${docText(n)}</div>`).join("")}
        <div class="wk-cost"><span>Extra documents your code fetches</span><b data-c-doc>-</b></div></div>
      <div class="wk-card"><h3>Graph</h3>
        <svg class="wk-gsvg" viewBox="0 0 500 105" role="img" aria-label="Five people in a line of friendships">
          ${FRIENDS.map(([a, b], i) => `<line class="ge" data-e="${i}" x1="${GPOS[a][0]}" y1="${GPOS[a][1]}" x2="${GPOS[b][0]}" y2="${GPOS[b][1]}"/>`).join("")}
          ${NAMES.map((n) => `<g class="gn" data-p="${n}"><circle cx="${GPOS[n][0]}" cy="${GPOS[n][1]}" r="22"/><text x="${GPOS[n][0]}" y="${GPOS[n][1]}">${n}</text></g>`).join("")}</svg>
        <p class="faint" style="font-weight:800;font-size:12.5px;margin:6px 0 0">Friendships are the edges. A hop follows them.</p>
        <div class="wk-cost"><span>Edge hops</span><b data-c-gr>-</b></div></div></div>`);
    stage.append(build, views);
    const pipeEl = qs("[data-pipe]", build),
      res = qs("[data-res]", build),
      pal = qs("[data-pal]", build);
    const grp = (label, kind) =>
      `<div class="wk-row"><b>${label}</b>${BLOCKS.filter((b) => b.k === kind)
        .map((b) => `<button class="wk-blk ${b.k}" data-b="${b.id}">${b.t}</button>`)
        .join("")}</div>`;
    pal.innerHTML = grp("Start", "start") + grp("Filter", "flt") + grp("Traverse", "hop");

    const drawPipe = () => {
      pipeEl.innerHTML = pipe
        .map(
          (id, i) =>
            `${i ? `<span class="wk-arr">▸</span>` : ""}<button class="wk-blk in-pipe ${BL[id].k}" data-i="${i}" title="Tap to remove">${BL[id].t}</button>`,
        )
        .join("");
      qsa("[data-i]", pipeEl).forEach(
        (b) =>
          (b.onclick = () => {
            const i = +b.dataset.i;
            pipe = BL[pipe[i]].k === "start" ? [] : pipe.filter((_, j) => j !== i);
            drawPipe();
            clear();
          }),
      );
      if (fxOn() && pipe.length) N.fx.springIn(pipeEl.lastElementChild, { from: 0.6, bounce: 0.5, dur: 0.35 });
    };
    const mark = (set, cls, edges = []) => {
      qsa("[data-p]", views).forEach((n) => {
        const on = set.includes(n.dataset.p);
        const was = n.classList.contains(cls);
        n.classList.remove("front", "hit", "pop");
        if (on) {
          n.classList.add(cls);
          if (!was) {
            void n.getBoundingClientRect();
            n.classList.add("pop");
          }
        }
      });
      qsa("[data-e]", views).forEach((n) => {
        const on = edges.includes(+n.dataset.e);
        n.classList.toggle("front", on && n.tagName === "TR");
        n.classList.toggle("on", on);
      });
    };
    const clear = () => {
      token++;
      mark([], "front");
      ["tbl", "doc", "gr"].forEach((k) => (qs(`[data-c-${k}]`, views).textContent = "-"));
      res.innerHTML = "";
    };

    qsa("[data-b]", build).forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.dataset.b,
            blk = BL[id];
          if (blk.k === "start") pipe = [id, ...pipe.slice(BL[pipe[0] || "hop"].k === "start" ? 1 : 0)];
          else if (!pipe.length || BL[pipe[0]].k !== "start") {
            api.say("Every query needs a <b>Start</b> block first: who are we searching?", "think");
            N.wk.flash(qs(".wk-row", pal), "wk-shake");
            snd("wrong");
            return;
          } else pipe.push(id);
          snd("tap");
          drawPipe();
          clear();
        }),
    );
    qs("[data-clear]", build).onclick = () => {
      pipe = [];
      drawPipe();
      clear();
    };

    const M = {
      leeds: { want: ["Ana", "Ben"], ok: (r) => r.filters.length >= 1 },
      york: { want: ["Cy"], ok: (r) => r.filters.length >= 2 },
      fof: { want: ["Cy"], ok: (r) => r.hops === 2 && r.filters.length === 0 },
      bolt: { want: ["Dee"], ok: (r) => r.hops === 3 && r.filters.includes("w-Bolt") },
    };
    qs("[data-run]", build).onclick = () => {
      if (!pipe.length || BL[pipe[0]].k !== "start") {
        api.say("Build a query first: tap a <b>Start</b> block, then add filters or hops.", "think");
        return;
      }
      const my = ++token,
        r = runQuery(pipe),
        put = (k, v) => {
          const n = qs(`[data-c-${k}]`, views);
          fxOn() ? N.fx.count(n, v, { from: 0, dur: 0.35 }) : (n.textContent = v);
        };
      const last = r.steps.length - 1;
      r.steps.forEach((s, i) =>
        life.timeout(
          () => {
            if (my !== token) return;
            mark(s.out, i === last ? "hit" : "front", s.edges);
            if (i === last) {
              put("tbl", r.hops);
              put("doc", r.fetches);
              put("gr", r.hops);
              res.innerHTML = `Result: <b>${list(r.result)}</b>`;
              snd(r.result.length ? "step" : "wrong");
              grade(r);
            }
          },
          120 + i * 480,
        ),
      );
    };
    function grade(r) {
      const hit = Object.entries(M).find(([, m]) => m.want.join() === r.result.slice().sort().join() && m.ok(r));
      if (hit) {
        api.done(hit[0]);
      }
      if (r.hops >= 1) {
        api.say(
          `<b>${r.hops}</b> hop${r.hops > 1 ? "s" : ""}: tables needed ${r.hops} self-join${r.hops > 1 ? "s" : ""}, documents made your code fetch <b>${r.fetches}</b> more document${r.fetches === 1 ? "" : "s"}, the graph just followed ${r.hops} edge${r.hops > 1 ? "s" : ""}. <b>Relationships are a graph's home ground.</b>`,
          "think",
        );
      } else if (hit)
        api.say(
          "Filters on one kind of record are easy in <b>every</b> model. The difference shows up when you follow relationships.",
          "happy",
        );
      else api.say(`That returned <b>${list(r.result)}</b>. Check the mission again and adjust the blocks.`, "think");
    }
    drawPipe();
  }

  reg(2, {
    id: "ds-querylab",
    num: "2.W",
    title: "Workshop: ask the data",
    blurb: "No code. Snap query blocks together and see one dataset as tables, documents and a graph.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro: "Same five people, three data models. Build a query from blocks and watch all three light up.",
        missions: [
          {
            id: "leeds",
            t: "Who lives in Leeds?",
            d: "Start with <b>everyone</b>, then add a city filter.",
            hint: "Start: everyone, then City is Leeds. Press <b>Run query</b>.",
          },
          {
            id: "york",
            t: "Acme staff in York",
            d: "Two filters in a row: a city <b>and</b> an employer.",
            hint: "Filters narrow the list one after another, so order doesn't matter.",
          },
          {
            id: "fof",
            t: "Friends of friends of Ana",
            d: "Start at <b>Ana</b> and go to friends twice. Who is new?",
            hint: "Start: Ana, Go to friends, Go to friends. Each hop only adds people you haven't reached yet.",
          },
          {
            id: "bolt",
            t: "Three steps away, works at Bolt",
            d: "Start at Ana, hop three times, then filter by employer.",
            hint: "Three hops, then Works at Bolt. Read the three cost meters afterwards.",
          },
        ],
        build: (stage, api) => queryLab(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "ds-ql-1",
          q: "You must list everyone within 4 friendship hops of one person. Which model makes that natural?",
          opts: [
            "A graph: follow the edges hop by hop",
            "Documents: each friend id is fetched in application code",
            "Tables: four separate single-table lookups",
          ],
          a: 0,
          why: "Variable-depth relationship queries are what graph models are built for. Documents push each hop into your own code, and tables need one more join per hop.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-ql-2",
          q: '"Everyone in York who works at Acme" uses no relationships. How do the three models compare?',
          opts: ["All three answer it easily", "Only the graph can answer it", "Only tables can answer it"],
          a: 0,
          why: "A filter over one kind of record is easy everywhere. Models diverge on many-to-many relationships, not on simple filters.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Filters</b> over one kind of record are easy in tables, documents and graphs.",
            "<b>Relationships</b> are the test: tables need a <b>join</b> per hop, documents push each hop into your application, graphs simply follow edges.",
            "Choose the model from the <b>questions you will ask</b>, not from habit.",
          ],
          "If the question is about how things connect, reach for a graph; if it is about one record, most models will do.",
        ),
      );
    },
  });
  L["ds-querylab"] = {
    sum: "Build queries from blocks and see one dataset as tables, documents and a graph.",
    steps: [
      {
        t: "What you will practise",
        b: `<p>You'll build queries without typing any syntax: snap <b>Start</b>, <b>Filter</b> and <b>Traverse</b> blocks together, then run them.</p><p>The same five people are shown as <b>tables</b>, <b>documents</b> and a <b>graph</b>, so you can compare.</p>`,
        v: F.flow([
          { t: "Start", c: "violet" },
          { t: "Filter", c: "blue" },
          { t: "Go to friends", c: "amber" },
        ]),
        c: {
          q: "In the lab, which block walks along relationships?",
          o: ["Go to friends", "City is York", "Start: everyone"],
          a: 0,
          why: "Traversal follows edges between records. Filters only narrow the records you already have.",
        },
      },
      {
        t: "Three ways to hop",
        b: `<p>A hop means <b>"go to this person's friends"</b>. Each model pays for it differently.</p>`,
        v: F.compare(
          { title: "Tables and documents", c: "amber", body: "a join, or another fetch from your code, for every hop" },
          { title: "Graph", c: "teal", body: "follow an edge: the same move every time" },
        ),
        c: {
          q: "A query needs a variable number of hops. Why is that awkward in tables?",
          o: [
            "The number of joins is fixed when you write the query",
            "Tables cannot store friendships at all",
            "Tables forbid filters on two columns",
          ],
          a: 0,
          why: "Each hop is one more join written into the query, so an unknown depth is hard to express.",
        },
      },
    ],
    guide: ["Work through the four missions in the workshop."],
  };
})();
