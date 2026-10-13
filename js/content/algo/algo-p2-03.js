(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const table = (head, rows, mw = 660) =>
    `<table class="t" style="max-width:${mw}px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows
      .map((r) => `<tr class="${r.hl ? "hl" : ""}">${(r.c || r).map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("")}</table>`;

  /* ============ 2.3 Distance-vector routing ============ */
  /** Three routers X–Y–Z; c(Y,Z) = 2, c(X,Z) = 40. The X–Y link changes from 3 to cNew; routers Y then Z recompute each round (distance to X). */
  function cti(cNew, poison) {
    const cYZ = 2,
      cXZ = 40;
    let dY = 3,
      dZ = 5,
      viaZ = "Y";
    const out = [];
    for (let r = 1; r < 40; r++) {
      const zAdv = poison && viaZ === "Y" ? Infinity : dZ;
      const nY = Math.min(cNew, cYZ + zAdv),
        vY = cNew <= cYZ + zAdv ? "X" : "Z";
      const yAdv = poison && vY === "Z" ? Infinity : nY;
      const nZ = Math.min(cXZ, cYZ + yAdv),
        vZ = cXZ <= cYZ + yAdv ? "X" : "Y";
      const ch = nY !== dY || nZ !== dZ;
      dY = nY;
      dZ = nZ;
      viaZ = vZ;
      out.push({ r, dY, vY, dZ, vZ });
      if (!ch) break;
    }
    return out;
  }
  const CTI_BAD = cti(30, false),
    CTI_GOOD = cti(1, false),
    CTI_PR = cti(30, true);
  const ctiTable = (rows) =>
    `<table class="t" style="max-width:440px"><tr><th>round</th><th>Y's cost to X</th><th>via</th><th>Z's cost to X</th><th>via</th></tr>${rows.map((q) => `<tr><td>${q.r}</td><td>${q.dY}</td><td>${q.vY}</td><td>${q.dZ}</td><td>${q.vZ}</td></tr>`).join("")}</table>`;

  L["a2-routing"] = {
    sum: 'Internet routers don\'t have a map. Each one only hears its neighbours say "I can reach X in d hops". Cut a link and that gossip can loop, with costs creeping upwards forever: <b>count to infinity</b>.',
    steps: [
      {
        t: "Routing by gossip (distance-vector)",
        b: `<p>Each router tells its neighbours how far it is from every destination. When B hears A say "C is 2 away", B works out: going via A costs <b>1 + 2 = 3</b>. It keeps whichever option is cheapest.</p><span class="key">A router knows only its links and what its neighbours told it. There is no global map.</span>`,
        v: F.frames([
          { t: 'C announces: "I am C, distance 0"', v: F.cells([{ v: "C", sub: "0", c: "teal" }]) },
          {
            t: "B hears it: C = 0 + 1 = 1",
            v: F.cells([{ v: "B", sub: "C:1", c: "teal" }, "←", { v: "C", sub: "0" }]),
          },
          {
            t: "A hears B: C = 1 + 1 = 2 (via B)",
            v: F.cells([{ v: "A", sub: "C:2", c: "teal" }, "←", { v: "B", sub: "C:1" }]),
          },
        ]),
      },
      {
        t: "Good news travels fast",
        b: `<p>Three routers in a row: X – Y – Z, with c(X,Y) = 3, c(Y,Z) = 2 and a long direct link X–Z of 40. Y reaches X at cost 3, Z reaches X at 5 (via Y).</p><p>Now the X–Y link gets <b>cheaper</b>: it drops to 1. Y notices at once. Z learns on the next exchange.</p>`,
        v:
          ctiTable(CTI_GOOD) +
          `<div class="fig-cap">Y's cost to X drops to 1 immediately and Z follows one round later (Z = 1 + 2 = 3). Settled after ${CTI_GOOD.length - 1} round${CTI_GOOD.length - 1 > 1 ? "s" : ""}.</div>`,
        c: {
          q: "A link gets cheaper. How quickly does a distance-vector network find out?",
          o: [
            "Quickly, one hop per round",
            "Slowly, after counting up to infinity",
            "Never, until every router restarts",
          ],
          a: 0,
          why: "A cheaper route immediately beats the old one wherever it is heard, so the improvement ripples out.",
        },
      },
      {
        t: "Cut a link and the gossip loops",
        b: `<p>The B–C link fails. B still remembers A's last message, "C is 2 away". But A's route <i>went through B</i>. B doesn't know that, so it installs "C via A, cost 3".</p><p>A then hears "3" from B and updates to 4. B updates to 5, and so on. Each round the cost creeps up by one.</p>`,
        v: F.cells([
          { v: "2", sub: "A" },
          "→",
          { v: "3", sub: "B", c: "amber" },
          "→",
          { v: "4", sub: "A", c: "amber" },
          "→",
          { v: "5", sub: "B", c: "amber" },
          "→",
          { v: "…", c: "rose" },
          "→",
          { v: "16=∞", sub: "RIP gives up", c: "rose" },
        ]),
        c: {
          q: "Why doesn't the loop stop after one round?",
          o: [
            "Routers only update once every few minutes",
            "Each router only sees the other's stale message",
            "The failed link keeps coming back up",
          ],
          a: 1,
          why: "A distance vector carries a cost, not the path, so B can't tell that A's route uses B.",
        },
      },
      {
        t: "Bad news travels slowly",
        b: `<p>Same three routers, but the X–Y link now gets <b>much worse</b>: 3 → 30. Y still has Z's old claim "X is 5 away", so it decides to go via Z (2 + 5 = 7). But Z's route went through Y! Z then sees Y at 7 and goes 9, and so on.</p><p>The costs climb by 4 per round until Y's direct link (30) is finally cheaper.</p>`,
        v:
          ctiTable(CTI_BAD) +
          `<div class="fig-cap">It takes ${CTI_BAD.length - 1} rounds to settle, and a bigger jump (say to 200) would take far longer.</div>`,
        c: {
          q: "In this table, why does Y's cost keep rising in steps?",
          o: [
            "Y and Z each build on the other's outdated estimate",
            "The link X–Z is flickering up and down",
            "Dijkstra is rerun with ever larger weights",
          ],
          a: 0,
          why: "Neither router sees the other's route is via itself, so each one raises its number a little on every exchange.",
        },
      },
      {
        t: "The patch: poisoned reverse",
        b: `<p>If B's route to C goes <b>through A</b>, B tells A "C is unreachable via me (∞)". A can't bounce the route back, so the phantom route dies immediately.</p><p>It only fixes loops between <b>two</b> routers. Loops through three or more still count up, which is why RIP caps "infinity" at 16.</p>`,
        v: F.compare(
          { title: "Without the patch", c: "rose", body: 'B → A: "C in 3"<br>A → B: "C in 4"<br>… counts to 16' },
          {
            title: "Poisoned reverse",
            c: "teal",
            body: 'B → A: "C is <b>∞</b> via me"<br>Both routers agree: unreachable, straight away',
          },
        ),
        c: {
          type: "cat",
          q: "Poisoned reverse fixes some routing problems. Which does it stop, and which can still happen?",
          buckets: ["Stopped by poisoned reverse", "Can still happen"],
          items: [
            ["Two neighbours bouncing a dead route between them", 0],
            ["A loop A→B→C→A that runs through three routers", 1],
            ["Telling a neighbour a route works through you when it really goes through that neighbour", 0],
            ["The B–C link failing in the first place", 1],
          ],
          hint: "It only changes what a router tells the neighbour whose route it is using.",
          why: "It stops a neighbour routing straight back through you, so two-router loops die at once. Loops through three or more routers still count up (RIP caps infinity at 16), and links can still fail.",
        },
      },
      {
        t: "Poisoned reverse on the three routers",
        b: `<p>Z reaches X via Y, so Z tells Y: "my cost to X is ∞". Y can then never choose the route through Z, and falls straight back to its own link.</p>`,
        v:
          ctiTable(CTI_PR) +
          `<div class="fig-cap">With poisoned reverse the same link failure settles in ${CTI_PR.length - 1} round${CTI_PR.length - 1 > 1 ? "s" : ""}, instead of ${CTI_BAD.length - 1}.</div>`,
        c: {
          q: "Will poisoned reverse completely solve count-to-infinity?",
          o: [
            "No: loops through three or more routers can still form",
            "Yes: it removes every possible loop",
            "Yes, but only on networks smaller than 16 routers",
          ],
          a: 0,
          why: "It only blocks routing straight back to the neighbour you learned the route from. Longer loops need other tricks, such as a small maximum cost.",
        },
      },
      {
        t: "Three ways to route a network",
        b: `<p>Real networks mix approaches depending on size and who is in charge.</p>`,
        v: `<table class="t"><tr><th>Approach</th><th>Each router knows</th><th>Strength</th><th>Example</th></tr><tr><td><b>Link-state</b></td><td>the whole map (floods it), then runs Dijkstra</td><td>fast, correct convergence</td><td>OSPF</td></tr><tr><td><b>Distance-vector</b></td><td>only neighbours' distances</td><td>simple, cheap</td><td>RIP</td></tr><tr><td><b>Hierarchy</b></td><td>its own network in detail, other networks only as "reachable"</td><td>scales to the whole internet</td><td>BGP between organisations</td></tr></table>`,
      },
      {
        t: "Cost, history and RIP",
        b: `<p>Distance-vector is a distributed version of the <b>Bellman–Ford</b> algorithm: about |N| rounds, each looking at up to |E| links, so $O(|N||E|)$. It was used in the early <b>ARPANET</b> and survives in RIP, where infinity is 16.</p>`,
        v: table(
          ["", "Link state", "Distance vector"],
          [
            ["Knows", "whole map", "neighbours' vectors"],
            ["Reacts to bad news", "quickly: flood and recompute", "slowly: can count to infinity"],
            ["Time", "O(|N|²) with a scan", "O(|N||E|)"],
          ],
        ),
        c: {
          q: "Which network event is distance-vector worst at?",
          o: [
            "A link failing or getting much more expensive",
            "A link getting cheaper",
            "A new router joining with a good link",
          ],
          a: 0,
          why: "Good news spreads quickly. Bad news can loop and creep upward round by round.",
        },
      },
    ],
    guide: [
      "Press <b>Exchange advertisements</b> a couple of times. Both tables stay stable.",
      "Press <b>Cut B–C link</b>, then keep exchanging. Watch the cost climb 3, 4, 5…",
      "Press <b>Reset</b>, tick <b>Poisoned reverse</b>, cut the link again and exchange once. It settles straight away.",
    ],
  };

  N.register({
    id: "a2-routing",
    subject: "algo",
    lecture: 2,
    order: 11,
    num: "2.11",
    title: "Routing without a map",
    blurb:
      "Two routers gossip reachability. Cut the link and watch count-to-infinity — then stop it with poisoned reverse.",
    render(root) {
      root.appendChild(header(this, ""));
      let cut = false,
        poison = false,
        round = 0;
      // state: dist each router believes to reach C, and via whom
      let A = { d: 2, via: "B" },
        B = { d: 1, via: "C" };
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="ex">Exchange advertisements</button><button class="btn rose" id="cut">Cut B–C link</button><button class="btn ghost" id="rs">Reset</button></div>
        <div id="prw"></div>
        <div class="grid two"><div class="card" style="background:var(--bg-2);margin:0"><h3>Router A</h3><table class="t" id="ta"></table><div class="faint" id="la"></div></div>
        <div class="card" style="background:var(--bg-2);margin:0"><h3>Router B</h3><table class="t" id="tb"></table><div class="faint" id="lb"></div></div></div>
        <div class="callout" id="msg" style="display:none"></div></div>`);
      root.appendChild(card);
      qs("#prw", card).appendChild(
        el(
          `<label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="pr"> Poisoned reverse (A tells B "C unreachable via me")</label>`,
        ),
      );
      qs("#pr", card).onchange = (e) => (poison = e.target.checked);
      function draw() {
        const row = (t, dest) => `<tr><td>${dest}</td><td>${t.d === Infinity ? "∞" : t.d}</td><td>${t.via}</td></tr>`;
        qs("#ta", card).innerHTML =
          `<tr><th>dest</th><th>cost</th><th>via</th></tr>${row(A, "C")}<tr><td>B</td><td>1</td><td>B</td></tr>`;
        qs("#tb", card).innerHTML =
          `<tr><th>dest</th><th>cost</th><th>via</th></tr>${row(B, "C")}<tr><td>A</td><td>1</td><td>A</td></tr>`;
        qs("#la", card).textContent = `round ${round}`;
        const msg = qs("#msg", card);
        if (cut && B.d === Infinity) {
          msg.style.display = "block";
          msg.className = "callout teal";
          msg.innerHTML = `<b>Converged:</b> both routers agree C is unreachable. Poisoned reverse killed the phantom route in one round.`;
        } else if (cut && round > 3) {
          msg.style.display = "block";
          msg.className = "callout rose";
          msg.innerHTML = `<b>Counting to infinity:</b> cost is already ${A.d}. In RIP this would climb to 16 before giving up — seconds of packets looping.`;
        } else msg.style.display = "none";
      }
      qs("#ex", card).onclick = () => {
        round++;
        if (!cut) return draw();
        // B's direct link gone; B updates from A's advertisement
        if (poison) {
          A.d = Infinity;
          A.via = "—";
          B.d = Infinity;
          B.via = "—";
        } else {
          if (B.d !== Infinity) {
            B.d = A.d + 1;
            B.via = "A";
          }
          if (A.d !== Infinity) {
            A.d = B.d + 1;
            A.via = "B";
          }
          if (A.d >= 16) {
            A.d = Infinity;
            B.d = Infinity;
          }
        }
        draw();
      };
      qs("#cut", card).onclick = () => {
        cut = true;
        draw();
      };
      qs("#rs", card).onclick = () => {
        cut = false;
        round = 0;
        A = { d: 2, via: "B" };
        B = { d: 1, via: "C" };
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a2-rout-1",
          q: 'B–C link is cut. B still holds A\'s old advertisement "C in 2". What does B install?',
          opts: ['"C unreachable" immediately', '"C via A, cost 3"', "It floods a link-state packet"],
          a: 1,
          why: "Distance vectors don't record <i>how</i> A reaches C — A's route went through B, so B just created a loop. That loop is count-to-infinity.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "DV = local gossip: cost + next hop, <b>no path information</b>.",
            "Stale advertisements create phantom routes → <b>count to infinity</b>.",
            "<b>Poisoned reverse</b> kills two-node loops; longer loops survive it.",
            "Link-state floods the whole map instead — fast convergence, more state.",
          ],
          "Distance vectors can't see their own loops — poisoned reverse is the patch.",
        ),
      );
    },
  });
})();
