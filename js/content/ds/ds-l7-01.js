/* Data Science (COM3021), Lecture 7: the Paxos consensus protocol.
   This part: shared helpers (figures, the Paxos simulation) and ds7-roles (7.1, roles, proposal numbers and quorums). */
(function () {
  const S = (NIC.shared.dsL7 = NIC.shared.dsL7 || {});
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const reg = (m) => N.register({ subject: "ds", lecture: 7, ...m });

  if (!document.getElementById("ds7-style")) {
    const css = document.createElement("style");
    css.id = "ds7-style";
    css.textContent = `
.ds7-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:10px;margin:8px 0}
.ds7-node{border:2px solid var(--line);border-radius:14px;padding:8px 8px;background:var(--panel-2);box-shadow:0 3px 0 var(--line);min-width:0;text-align:center;color:var(--text);font:inherit}
.ds7-node h4{margin:0 0 3px;font-size:13px;font-weight:900;display:flex;justify-content:space-between;gap:6px}
.ds7-node h4 small{font-weight:800;color:var(--text-faint)}
.ds7-ln{font-size:12.5px;font-weight:800;min-height:17px}
.ds7-node.down{border-style:dashed;opacity:.6}.ds7-node.m1{border-color:var(--blue)}.ds7-node.m2{border-color:var(--amber)}
.ds7-node.m3{border-color:var(--violet)}.ds7-node.ok{border-color:var(--teal)}.ds7-node.bad{border-color:var(--rose)}
.ds7-grid.c3{grid-template-columns:repeat(3,minmax(0,1fr))}.ds7-grid.c3 .ds7-ln{font-size:11px}
button.ds7-node{cursor:pointer}
button.ds7-node h4{justify-content:center}
.ds7-node .btn{margin-top:4px}
.ds7-strip{border:2px solid var(--line);border-radius:12px;padding:6px 10px;margin:6px 0;font-weight:800;font-size:13px;background:var(--panel)}
.ds7-strip.on{border-color:var(--blue)}.ds7-strip.ok{border-color:var(--teal)}
.ds7-log{font-size:13px;font-weight:700;margin:6px 0 0;padding:0;list-style:none;display:grid;gap:3px}
.ds7-log li{border-left:4px solid var(--line-2);padding:2px 8px}.ds7-log li.ok{border-color:var(--teal)}.ds7-log li.no{border-color:var(--rose)}`;
    document.head.appendChild(css);
  }

  /* ---------- helpers shared with the other Lecture 7 files (the right answer goes first: the engine shuffles) ---------- */
  const mc = (q, o, why, hint) => ({ q, o, a: 0, why, ...(hint ? { hint } : {}) });
  const pr = (id, q, opts, why) => predict({ id, q, opts, a: 0, why });
  const st = (t, b, v, c) => ({ t, b: `<p>${b}</p>`, v, c });
  const majority = (n) => Math.floor(n / 2) + 1;
  const IDS = "ABCDEFG";
  const seg = (box, spec, v, cb) =>
    box.appendChild(
      N.seg(
        spec.split("|").map((x) => x.split(":")),
        v,
        cb,
      ),
    );
  const log = (box, items) =>
    (box.innerHTML = `<ul class="ds7-log">${items.map(([c, t]) => `<li class="${c}">${t}</li>`).join("")}</ul>`);
  const svg = (w, h, inner, label) =>
    `<svg class="fig" viewBox="0 0 ${w} ${h}" style="max-width:${w}px" role="img" aria-label="${label}">${inner}</svg>`;
  const tx = (x, y, t, { a = "middle", s = 12, c = "var(--text)" } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:800 ${s}px var(--sans);fill:${c}">${t}</text>`;
  const node = (n) =>
    `<div class="ds7-node ${n.cls || ""}" data-k="${n.k || n.name}"><h4>${n.name}${n.sub ? `<small>${n.sub}</small>` : ""}</h4>${(n.lines || []).map((l) => `<div class="ds7-ln">${l}</div>`).join("")}</div>`;
  const grid = (a, cls = "") => `<div class="ds7-grid ${cls}">${a.map(node).join("")}</div>`;
  /** Tappable cards for pick questions: [id, title, line]. */
  const pk = (list) =>
    `<div class="ds7-grid">${list.map(([id, t, v]) => `<div class="ds7-node" data-pick="${id}" style="cursor:pointer"><h4>${t}</h4><div class="ds7-ln">${v}</div></div>`).join("")}</div>`;
  /** A row of acceptors as circles. list: [{id, c, top, sub, rings, down}]. */
  const row = (list, note, label) => {
    const gap = 96,
      W = list.length * gap + 20;
    const g = list
      .map((a, i) => {
        const x = 10 + gap / 2 + i * gap,
          col = a.c ? `var(--${a.c})` : "var(--line-2)";
        const rings = (a.rings || [])
          .map(
            (c, k) =>
              `<circle cx="${x}" cy="66" r="${31 + k * 5}" fill="none" stroke="var(--${c})" stroke-width="3"${a.down ? ' stroke-dasharray="5 4"' : ""}/>`,
          )
          .join("");
        return `<g class="fi"${a.down ? ' opacity=".55"' : ""}>${rings}<circle cx="${x}" cy="66" r="26" fill="color-mix(in srgb,${col} 18%,var(--panel))" stroke="${col}" stroke-width="2"${a.down ? ' stroke-dasharray="5 4"' : ""}/>${tx(x, 71, a.id, { s: 15 })}${a.top ? tx(x, 18, a.top, { s: 12 }) : ""}${a.sub ? tx(x, 122, a.sub, { s: 11, c: "var(--text-faint)" }) : ""}</g>`;
      })
      .join("");
    return svg(W, note ? 150 : 132, `${g}${note ? tx(W / 2, 146, note, { s: 12.5, c: "var(--text)" }) : ""}`, label);
  };

  /* ---------- the Paxos simulation: n acceptors, any number of proposers, one decision (a log position) at a time ---------- */
  function makeSim(n, props) {
    const q = majority(n),
      P = props.length;
    const fresh = () => Array.from({ length: n }, (_, i) => ({ id: IDS[i], up: true, prom: 0, accN: 0, accV: null }));
    const s = { n, q, acc: fresh(), ps: [], chosen: null, slot: 0, decided: [], last: null };
    const clear = (p) => Object.assign(p, { prom: [], quorum: false, val: p.own, forced: false, from: "" });
    const init = () => (s.ps = props.map((p, i) => clear({ ...p, i, n: 0 })));
    const downIds = () => s.acc.filter((a) => !a.up).map((a) => a.id);
    init();
    s.prepare = (i) => {
      const p = s.ps[i],
        lines = [],
        ign = [];
      p.n = p.n ? p.n + P : i + 1;
      const got = [];
      lines.push(["", `<b>${p.name}</b> sends PREPARE(${p.n}) to the acceptors.`]);
      s.acc.forEach((a) => {
        if (!a.up) lines.push(["no", `${a.id} is crashed: no reply.`]);
        else if (p.n > a.prom) {
          a.prom = p.n;
          got.push({ id: a.id, n: a.accN, v: a.accV });
          lines.push([
            "ok",
            `${a.id} replies PROMISE(${p.n})${got[got.length - 1].v ? `, reporting that it already accepted <b>${got[got.length - 1].v}</b> (number ${got[got.length - 1].n})` : ""}.`,
          ]);
        } else {
          ign.push({ id: a.id, prom: a.prom });
          lines.push(["no", `${a.id} ignores PREPARE(${p.n}): it has already promised ${a.prom}.`]);
        }
      });
      const best = got.filter((g) => g.v).sort((x, y) => y.n - x.n)[0];
      Object.assign(p, { prom: got, quorum: got.length >= q, forced: !!best, from: best ? best.id : "" });
      p.val = best ? best.v : p.own;
      lines.push(
        p.quorum
          ? [
              "ok",
              `${got.length} PROMISE${got.length === 1 ? "" : "s"} and ${q} are needed: a <b>quorum</b>. ${p.name} may send ACCEPT(${p.n}, ${p.val})${best ? `: it <b>must re-propose ${best.v}</b> instead of ${p.own}` : ""}.`,
            ]
          : [
              "no",
              `Only ${got.length} PROMISE${got.length === 1 ? "" : "s"}: a quorum needs ${q}, so ${p.name} cannot send ACCEPT.`,
            ],
      );
      return (s.last = { t: "prepare", p: i, n: p.n, got: got.map((g) => g.id), ign, down: downIds(), lines });
    };
    s.accept = (i) => {
      const p = s.ps[i];
      if (!p.quorum) return null;
      const ok = [],
        ign = [],
        lines = [["", `<b>${p.name}</b> sends ACCEPT(${p.n}, ${p.val}).`]];
      s.acc.forEach((a) => {
        if (!a.up) lines.push(["no", `${a.id} is crashed: no reply.`]);
        else if (p.n >= a.prom) {
          Object.assign(a, { prom: p.n, accN: p.n, accV: p.val });
          ok.push(a.id);
          lines.push(["ok", `${a.id} accepts and replies ACCEPTED(${p.n}, ${p.val}).`]);
        } else {
          ign.push({ id: a.id, prom: a.prom });
          lines.push(["no", `${a.id} ignores ACCEPT(${p.n}, ${p.val}): it has promised ${a.prom}, a newer proposal.`]);
        }
      });
      const hold = s.acc.filter((a) => a.accN === p.n && a.accV === p.val).length;
      if (hold >= q && !s.chosen) s.chosen = { n: p.n, v: p.val };
      lines.push(
        hold >= q
          ? [
              "ok",
              `${hold} of ${n} acceptors hold ${p.val}: a majority, so it is <b>chosen</b> and the learners learn it.`,
            ]
          : ["no", `Only ${hold} ACCEPTED: a majority needs ${q}, so nothing is chosen yet.`],
      );
      return (s.last = { t: "accept", p: i, n: p.n, v: p.val, ok, ign, hold, down: downIds(), lines });
    };
    s.toggle = (i) => (s.acc[i].up = !s.acc[i].up);
    s.next = () => {
      if (!s.chosen) return;
      s.decided.push(s.chosen.v);
      s.slot++;
      s.chosen = null;
      s.acc = fresh();
      s.ps.forEach(clear);
    };
    s.reset = () => {
      s.acc = fresh();
      s.chosen = null;
      s.slot = 0;
      s.decided = [];
      s.last = null;
      init();
    };
    return s;
  }
  Object.assign(S, { reg, mc, pr, st, majority, seg, log, svg, tx, node, grid, pk, row, makeSim });

  /* ---------- figures for 7.1 ---------- */
  const five = (f) =>
    IDS.slice(0, 5)
      .split("")
      .map((id, i) => ({ id, ...f(id, i) }));
  const quorumFig = row(
    five((id, i) => ({ c: i < 3 ? "teal" : "", sub: i < 3 ? "in the quorum" : "" })),
    "a quorum of 3 acceptors out of 5",
    "Five acceptors A to E, with A, B and C forming a quorum of three",
  );
  const valuesFig = row(
    five((id, i) => ({
      top: ["Noodles", "Noodles", "Tacos", "Noodles", "-"][i],
      c: ["blue", "blue", "amber", "blue", ""][i],
    })),
    "3 of 5 hold Noodles: Noodles is chosen",
    "Acceptors A, B and D hold Noodles, C holds Tacos, E holds nothing: Noodles has a majority",
  );
  const overlapFig = row(
    five((id, i) => ({
      c: i === 2 ? "violet" : i < 2 ? "blue" : "amber",
      rings: i < 3 ? ["blue"].concat(i === 2 ? ["amber"] : []) : ["amber"],
      sub: i === 2 ? "in both" : "",
    })),
    "majority 1 = A, B, C  |  majority 2 = C, D, E",
    "Two majorities of five acceptors, A B C and C D E, share acceptor C",
  );
  const rolesFig = svg(
    560,
    150,
    `<g class="fi"><rect x="14" y="62" width="124" height="46" rx="12" fill="color-mix(in srgb,var(--blue) 18%,var(--panel))" stroke="var(--blue)" stroke-width="2"/>${tx(76, 82, "Proposer")}${tx(76, 98, "suggests a value", { s: 10.5 })}
    ${[44, 84, 124].map((y, i) => `<path d="M138 85L246 ${y}" stroke="var(--line-2)" stroke-width="2"/><path d="M314 ${y}L422 85" stroke="var(--line-2)" stroke-width="2"/><circle cx="280" cy="${y}" r="21" fill="color-mix(in srgb,var(--teal) 18%,var(--panel))" stroke="var(--teal)" stroke-width="2"/>${tx(280, y + 5, "ABC"[i], { s: 14 })}`).join("")}
    ${tx(280, 12, "Acceptors: decide", { s: 11.5 })}
    <rect x="422" y="62" width="124" height="46" rx="12" fill="color-mix(in srgb,var(--amber) 18%,var(--panel))" stroke="var(--amber)" stroke-width="2"/>${tx(484, 82, "Learners")}${tx(484, 98, "are told the result", { s: 10.5 })}</g>`,
    "A proposer sends a value to three acceptors, which decide; the learners are told the outcome",
  );
  const numbersFig = svg(
    560,
    128,
    `<g class="fi">${Array.from({ length: 9 }, (_, i) => {
      const c = ["blue", "amber", "violet"][i % 3];
      return `<circle cx="${40 + i * 60}" cy="40" r="20" fill="color-mix(in srgb,var(--${c}) 18%,var(--panel))" stroke="var(--${c})" stroke-width="2"/>${tx(40 + i * 60, 45, i + 1, { s: 14 })}`;
    }).join(
      "",
    )}</g><path d="M20 82H536" stroke="var(--text-faint)" stroke-width="2"/><path d="M536 82l-8 -4v8z" fill="var(--text-faint)"/>${tx(280, 100, "numbers only go up: a newer proposal supersedes an older one", { s: 12 })}${tx(280, 120, "P1 uses 1, 4, 7  |  P2 uses 2, 5, 8  |  P3 uses 3, 6, 9", { s: 11.5, c: "var(--text-faint)" })}`,
    "Proposal numbers 1 to 9 shared out between three proposers so that none repeats",
  );

  /** Lesson 7.1 demo: tap acceptors to crash them, watch the quorum, and compare two random majorities. */
  function quorumPanel(box) {
    let n = 5,
      up = Array(5).fill(true),
      pair = null,
      bad = 0,
      say = [["", "Tap an acceptor to crash it, tap again to restart it."]];
    box.innerHTML = `<div class="controls" data-n></div><div data-g></div><div class="controls"><button class="btn primary" data-p>Pick two majorities</button><button class="btn ghost" data-r>Restart all</button></div>
      <div class="stat-row"><div class="stat teal"><small>Quorum needed</small><b></b></div><div class="stat blue"><small>Acceptors up</small><b></b></div><div class="stat rose"><small>Pairs sharing nobody</small><b></b></div></div><div data-l></div>`;
    const $ = (s) => qs(s, box);
    function draw() {
      const q = majority(n),
        u = up.filter(Boolean).length;
      $("[data-g]").innerHTML = `<div class="ds7-grid">${up
        .map(
          (v, i) =>
            `<button class="ds7-node ${!v ? "down" : ""} ${pair ? (pair[0].has(i) && pair[1].has(i) ? "m3" : pair[0].has(i) ? "m1" : pair[1].has(i) ? "m2" : "") : ""}" data-i="${i}" aria-label="Acceptor ${IDS[i]}, ${v ? "up" : "crashed"}. Tap to ${v ? "crash" : "restart"} it."><h4>${IDS[i]}</h4><div class="ds7-ln">${v ? "up" : "crashed"}</div><div class="ds7-ln">${pair ? (pair[0].has(i) && pair[1].has(i) ? "both majorities" : pair[0].has(i) ? "majority 1" : pair[1].has(i) ? "majority 2" : "") : ""}</div></button>`,
        )
        .join("")}</div>`;
      $("[data-g]")
        .querySelectorAll("[data-i]")
        .forEach((b) => {
          b.onclick = () => {
            const i = +b.dataset.i;
            up[i] = !up[i];
            const k = up.filter(Boolean).length;
            say = [
              [
                k >= q ? "ok" : "no",
                `${IDS[i]} ${up[i] ? "restarts" : "crashes"}. ${k} up: ${k >= q ? `a quorum of ${q} can still be reached, so proposals can go on.` : `fewer than the ${q} needed, so no proposal can be made or accepted.`}`,
              ],
            ];
            draw();
          };
        });
      const b = box.querySelectorAll(".stat b");
      [q, u, bad].forEach((v, i) => (b[i].textContent = v));
      log($("[data-l]"), say);
    }
    seg($("[data-n]"), "3:3 acceptors|4:4 acceptors|5:5 acceptors|7:7 acceptors", "5", (v) => {
      n = +v;
      up = Array(n).fill(true);
      pair = null;
      bad = 0;
      say = [["", `${n} acceptors: a quorum is more than half, so ${majority(n)}.`]];
      draw();
    });
    $("[data-p]").onclick = () => {
      const pick = () => {
        const ids = [...Array(n).keys()].sort(() => Math.random() - 0.5);
        return new Set(ids.slice(0, majority(n)));
      };
      pair = [pick(), pick()];
      const shared = [...pair[0]].filter((i) => pair[1].has(i)).map((i) => IDS[i]);
      if (!shared.length) bad++;
      const nm = (s) =>
        [...s]
          .sort()
          .map((i) => IDS[i])
          .join(", ");
      say = [
        ["", `Majority 1: ${nm(pair[0])}. Majority 2: ${nm(pair[1])}.`],
        ["ok", `They share <b>${shared.join(", ")}</b>: two majorities always have at least one acceptor in common.`],
      ];
      draw();
    };
    $("[data-r]").onclick = () => {
      up = Array(n).fill(true);
      pair = null;
      say = [["", "All acceptors are up again."]];
      draw();
    };
    draw();
  }

  /* ============ 7.1 Paxos: roles, proposal numbers and quorums ============ */
  reg({
    id: "ds7-roles",
    order: 1,
    num: "7.1",
    title: "Paxos: roles, proposals and quorums",
    blurb: "Agreement without waiting for everyone: who plays which part, and why a majority is enough.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>Who can still decide?</h2><span class="tag">tap acceptors to crash them</span></div><div></div></div>`,
      );
      root.appendChild(card);
      quorumPanel(card.lastElementChild);
      root.appendChild(
        pr(
          "ds7-roles-1",
          "Choose <b>4 acceptors</b>, then tap two acceptors to crash them. Can a proposer still reach a quorum?",
          [
            "No: a quorum of 4 is 3, but only 2 are up",
            "Yes: 2 of 4 is exactly half, which is enough",
            "Yes: whichever two are up always form a quorum",
          ],
          "A quorum is <b>more than half</b>. Half of 4 is 2, so a majority is 3. With two crashed only 2 are up, which is not enough.",
        ),
      );
      root.appendChild(
        pr(
          "ds7-roles-2",
          "With <b>5 acceptors</b>, press <b>Pick two majorities</b> several times. At least how many acceptors do the two majorities share?",
          ["At least one, every time", "None: two majorities can be completely separate", "Exactly two, every time"],
          "Two groups of 3 taken from 5 acceptors need 6 places but there are only 5, so at least one acceptor is in both. Sometimes they share two or three.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Paxos</b> is a consensus algorithm for distributed systems, proposed by Lamport in 1989. It has three roles: <b>proposers</b> suggest, <b>acceptors</b> decide, <b>learners</b> are told.",
            "Every proposal has a <b>unique proposal number</b>. Numbers only go up, so newer proposals supersede older ones.",
            "A <b>quorum</b> is <b>more than half</b> of the acceptors, needed to propose and to accept. When a majority agree on a value it is <b>chosen</b>.",
            "Beyond the slides: any two majorities share an acceptor, which is why a majority is enough.",
          ],
          "No boss, no waiting for everyone: just more than half of the acceptors.",
        ),
      );
    },
  });

  L["ds7-roles"] = {
    sum: "<b>Paxos</b> is a consensus algorithm with proposers, acceptors and learners. Proposals carry unique increasing numbers and a <b>quorum</b> is more than half of the acceptors.",
    steps: [
      st(
        "Agreeing without waiting for everyone",
        "Lecture 6 introduced <b>consensus</b> and two-phase commit, where a coordinator needs a <b>yes from every node</b>. <b>Paxos</b> is a <b>consensus algorithm for distributed systems</b>, proposed in <b>1989 by Leslie Lamport</b>. It needs only a <b>majority</b> to agree.",
        F.compare(
          {
            title: "Two-phase commit (Lecture 6)",
            c: "rose",
            body: "every node must vote <b>yes</b>; a no or silence aborts",
          },
          { title: "Paxos", c: "teal", body: "a <b>majority</b> of the acceptors is enough" },
        ),
        mc(
          "What is Paxos?",
          [
            "A consensus algorithm for distributed systems, proposed in 1989",
            "A replication scheme where one leader copies writes to followers",
            "A way to split one table across several nodes by key range",
            "A test for whether a history of reads and writes is linearizable",
          ],
          "Paxos is a consensus algorithm: it lets several nodes agree on a value even if some of them fail.",
        ),
      ),
      st(
        "Three roles",
        "A node can play three roles. A <b>proposer</b> suggests a value to be chosen (an update to make). <b>Acceptors</b> decide which value is chosen. <b>Learners</b> are told which value was chosen: they take no part in the decision.",
        rolesFig,
        {
          type: "match",
          q: "Match each Paxos role to what it does.",
          pairs: [
            ["Proposer", "Suggests a value to be chosen"],
            ["Acceptor", "Decides which value is chosen"],
            ["Learner", "Is told the outcome and does not vote"],
          ],
          why: "Proposers suggest, acceptors decide by majority and learners only need to know the result.",
        },
      ),
      st(
        "Proposal numbers",
        "Each value is proposed with a <b>unique proposal number</b>. The number must be greater than any this proposer used before, so proposals are <b>ordered</b> and an old one can be <b>superseded</b> by a newer one. (One simple way to keep numbers unique is to share them out, as in the figure.)",
        numbersFig,
        mc(
          "A proposer has already used numbers 4 and 9. Which number may it use next?",
          ["12", "9", "6"],
          "The next number must be greater than every number it has used. Only 12 is above 9.",
        ),
      ),
      st(
        "A quorum is a majority",
        "A <b>quorum</b> is a <b>majority of the acceptors</b>: <b>more than half</b>. It is needed to <b>propose</b> a value and to <b>accept</b> one. With 5 acceptors a quorum is 3, so 2 acceptors may crash.",
        quorumFig,
        mc(
          "A cluster has 6 acceptors. How many make a quorum?",
          ["4", "3", "6"],
          "More than half of 6 means more than 3, so 4. Exactly half (3) is not a majority.",
          "Half of 6 is 3, so you need one more.",
        ),
      ),
      st(
        "Consensus: a majority agree",
        "The system reaches <b>consensus</b> when a <b>majority of acceptors agree on the same value</b>. Once they do, that value is considered <b>chosen</b>.",
        valuesFig,
        mc(
          "Five acceptors hold Tea, Tea, Coffee, Coffee and nothing. Has a value been chosen?",
          [
            "No: neither value is held by 3 of the 5",
            "Yes: Tea, because it is listed first",
            "Yes: any two matching acceptors are enough",
          ],
          "Chosen needs a majority of the 5, which is 3 acceptors holding the same value. Two and two is not enough.",
        ),
      ),
      st(
        "Beyond the slides: why a majority is enough",
        "<b>Not on the slides</b>, but it explains the rule: <b>any two majorities share at least one acceptor</b>. If 3 of 5 agreed on a value, any later group of 3 includes someone who knows about it.",
        overlapFig,
        mc(
          "Two groups of 3 are picked from 5 acceptors. Which must be true?",
          [
            "At least one acceptor is in both groups",
            "Exactly one acceptor is in both of the groups",
            "The groups can be entirely separate from each other",
          ],
          "Together the groups need 6 places and there are only 5 acceptors, so someone is in both. They may share one, two or three.",
        ),
      ),
    ],
    guide: [
      "Pick <b>5 acceptors</b>, then tap an acceptor to crash it, and tap again to restart it. Watch <b>Acceptors up</b> against <b>Quorum needed</b>.",
      "Press <b>Pick two majorities</b> a few times and see which acceptor they share.",
      "Try <b>4 acceptors</b> and <b>3 acceptors</b>, then answer the questions after the demo.",
    ],
  };
})();
