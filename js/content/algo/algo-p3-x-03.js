/* algo-p3-x-03.js: LP: 3.5 slack form, 3.6 bakery, 3.7 simplex as a program */
(function () {
  const S = (NIC.shared.algoP3x = NIC.shared.algoP3x || {});
  const {
    BAK,
    COR,
    D0,
    D1,
    R0,
    T,
    dEnter,
    dInit,
    dLeave,
    dPivot,
    dRatios,
    dSol,
    dictFig,
    dictHTML,
    dictRun,
    fig,
    lin,
    lpSolve,
    polySVG,
    qt,
    qt0,
    qv,
    sgn,
    vn,
  } = S;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  // prettier-ignore

  L["a3-slack"] = {
    sum: "Slack variables turn every ≤ rule into an equation. Writing the basic variables on the left gives a <b>dictionary</b>; a pivot rewrites it so one variable enters and one leaves, until z has no positive coefficient.",
    steps: [
      { t: "Slack turns ≤ into =", b: `<p>Take <code>maximise 3x₁ + x₂ + 2x₃</code> with three ≤ rules. Each rule gets a <b>slack variable</b> that soaks up the unused amount: <code>x₄ = 30 − x₁ − x₂ − 3x₃</code>, and so on. Because the rule holds, <code>x₄ ≥ 0</code>.</p><p>The score gets its own line, <code>z = 3x₁ + x₂ + 2x₃</code>.</p>`,
        v: F.compare({ title: "Standard form", c: "violet", body: `max 3x₁ + x₂ + 2x₃<br>x₁ + x₂ + 3x₃ ≤ 30<br>2x₁ + 2x₂ + 5x₃ ≤ 24<br>4x₁ + x₂ + 2x₃ ≤ 36` }, { title: "Slack form", c: "teal", body: `z = 3x₁ + x₂ + 2x₃<br>x₄ = 30 − x₁ − x₂ − 3x₃<br>x₅ = 24 − 2x₁ − 2x₂ − 5x₃<br>x₆ = 36 − 4x₁ − x₂ − 2x₃` }),
        c: { q: "What does a slack variable such as x₄ measure?", o: ["The unused capacity of its rule", "The profit that its rule brings", "The distance from the origin"], a: 0, why: "x₄ = 30 − (x₁ + x₂ + 3x₃) is whatever is left of the first limit. Zero means the rule is tight." } },
      { t: "Basic and nonbasic", b: `<p>Variables on the <b>left</b> are <b>basic</b>; those on the right are <b>nonbasic</b> and are set to 0. That fixes every basic variable, giving a <b>basic solution</b>: here (0, 0, 0, 30, 24, 36) with <code>z = 0</code>.</p><p>If a basic solution exists with all values ≥ 0 you have somewhere to start. (If not, the LP may be infeasible.)</p>`,
        v: dictFig(D0, {}, "Nonbasic x₁, x₂, x₃ are 0, so the slacks equal the limits.") ,
        c: { q: "In the starting dictionary, what is the basic solution (x₁ … x₆)?", o: ["(0, 0, 0, 30, 24, 36)", "(3, 1, 2, 0, 0, 0)", "(30, 24, 36, 0, 0, 0)"], a: 0, why: "Nonbasic x₁, x₂, x₃ are 0, and each basic slack equals its constant: x₄ = 30, x₅ = 24, x₆ = 36." } },
      { t: "Who enters?", b: `<p>Look at the z line: <code>3x₁ + x₂ + 2x₃</code>. Raising x₁ earns 3 per unit, x₃ earns 2, x₂ earns 1. Choose the nonbasic variable with the <b>largest positive coefficient</b>: <b>x₁ enters</b>.</p>`,
        v: dictFig(D0, { enter: 0, sol: false }),
        c: { q: "Which variable enters first, and why?", o: ["x₁, because 3 is the largest coefficient in z", "x₃, because it has the biggest number in rule one", "x₂, because it appears in every rule"], a: 0, why: "Dantzig's rule looks only at the z line: the nonbasic variable with the most positive coefficient raises z fastest." } },
      { t: "Who leaves? The tightest rule", b: `<p>Raise x₁ and watch the three equations. x₄ reaches 0 at x₁ = 30, x₅ at 12, x₆ at 9. The <b>smallest</b> ratio, 9, belongs to the x₆ row, so <b>x₆ leaves</b>. Any further and x₆ would go negative.</p>`,
        v: dictFig(D0, { enter: 0, leave: 2, ratios: R0, sol: false }),
        c: { q: "x₁ enters. Which equation leaves, and what is the largest x₁ can become?", o: ["x₆, at x₁ = 9", "x₅, at x₁ = 12", "x₄, at x₁ = 30"], a: 0, why: "Ratios: 30 ÷ 1 = 30, 24 ÷ 2 = 12, 36 ÷ 4 = 9. The smallest wins; x₆ would be the first slack to hit zero." } },
      { t: "The pivot: rewrite the dictionary", b: `<p>Solve the leaving equation for the entering variable: <code>x₆ = 36 − 4x₁ − x₂ − 2x₃</code> gives <code>x₁ = 9 − x₂/4 − x₃/2 − x₆/4</code>. Then <b>substitute</b> this x₁ into z and into the other rows so x₁ no longer appears on any right-hand side.</p><p>New basic solution (9, 0, 0, 21, 6, 0), and z jumps to 27.</p>`,
        v: dictFig(D1, { fresh: 0 }),
        c: { q: "After the first pivot, what is the basic solution (x₁ … x₆)?", o: ["(9, 0, 0, 21, 6, 0)", "(0, 0, 0, 21, 6, 9)", "(9, 0, 0, 30, 24, 36)"], a: 0, why: "x₁ = 9 is basic; x₂, x₃ and the now-nonbasic x₆ are 0; x₄ = 21 and x₅ = 6 come from the rewritten rows." } },
      { t: "Watch it run", b: `<p>Now the whole algorithm. Press <b>play</b> or step with the arrows. It pauses twice per pivot: tap the <b>entering</b> term in the z line, then tap the <b>leaving</b> row.</p>`, v: (box, life) => dictRun(box, life, COR) },
      { t: "Stop: no positive coefficient", b: `<p>After three pivots <code>z = 28 − x₃/6 − x₅/6 − 2x₆/3</code>. Raising any nonbasic variable lowers z, and all nonbasic variables must be ≥ 0, so z cannot exceed <b>28</b>. The basic solution (8, 4, 0, 18, 0, 0) is optimal.</p>`,
        v: (box) => { const r = lpSolve(COR.c, COR.A, COR.b); box.innerHTML = `<div class="fig-wrap">${dictHTML(r.D, { done: true })}</div>`; },
        c: { q: "In the final dictionary every coefficient in z is negative. What does that tell you?", o: ["No move can raise z, so 28 is optimal", "z can still rise by increasing x₄", "The LP is unbounded"], a: 0, why: "All nonbasic variables sit at 0 and can only increase. Each increase lowers z, so the current basic solution is the maximum." } },
      { t: "Dictionary or tableau?", b: `<p>The lecture writes a pivot as <b>equations</b> (a dictionary). The tutorial's open task uses a <b>tableau</b>, the same numbers in a grid. The previous module (3.4) ran a tableau.</p><p>Same pivot, two layouts: z = 27 + x₂/4 + x₃/2 − 3x₆/4 is the tableau's gain row <code>[0, ¼, ½, 0, 0, −¾ | 27]</code>.</p>`,
        v: F.compare({ title: "Dictionary", c: "violet", body: `x₁ = 9 − x₂/4 − x₃/2 − x₆/4<br>z = 27 + x₂/4 + x₃/2 − 3x₆/4` }, { title: "Tableau row and gain row", c: "blue", body: `x₁: [1, ¼, ½, 0, 0, ¼ | 9]<br>gain: [0, ¼, ½, 0, 0, −¾ | 27]` }) },
    ],
    guide: ["Play the pivot game: pick an entering variable, then a leaving row, and watch the dictionary rewrite.", "Try a legal but non-greedy choice (a smaller positive coefficient). Do you still end at z = 28?", "Try choosing a row that is not the tightest. What goes wrong?"],
  };
  N.register({
    id: "a3-slack",
    subject: "algo",
    lecture: 3,
    order: 5,
    num: "3.5",
    title: "Slack form and the dictionary",
    blurb: "Rewrite equations pivot by pivot on a three-variable LP, choosing who enters and who leaves.",
    render(root) {
      root.appendChild(header(this, ""));
      let D, phase, e, pivots;
      const card =
        el(`<div class="card"><div class="controls"><button class="btn ghost" id="auto">Show me the best move</button><button class="btn ghost" id="rs">Reset</button><span class="faint" id="pc"></span></div>
        <div id="dc" style="min-height:190px"></div><div class="controls" id="ctl" style="min-height:48px"></div><div class="callout" id="msg" style="min-height:74px"></div></div>`);
      root.appendChild(card);
      const say = (cls, html) => {
        const m = qs("#msg", card);
        m.className = "callout " + cls;
        m.innerHTML = html;
      };
      function init() {
        D = dInit(COR.c, COR.A, COR.b);
        phase = "enter";
        e = -1;
        pivots = 0;
        draw();
        say(
          "violet",
          "Choose a nonbasic variable to <b>enter</b>. Only a positive coefficient in z can raise the score.",
        );
      }
      function draw() {
        const ent = phase === "leave" ? e : -1,
          rat = phase === "leave" ? dRatios(D, e) : null;
        qs("#dc", card).innerHTML = dictHTML(D, { enter: ent, ratios: rat, done: dEnter(D) < 0 });
        qs("#pc", card).textContent = `pivots: ${pivots}`;
        const ctl = qs("#ctl", card);
        ctl.innerHTML = "";
        if (dEnter(D) < 0) {
          say("teal", `<b>Optimal.</b> No coefficient in z is positive, so z = ${qt(D.v)} is the maximum.`);
          return;
        }
        if (phase === "enter")
          D.N.forEach((j) => {
            const b = el(
              `<button class="btn small">${vn(j)} enters (${D.c[j].n >= 0 ? "+" : ""}${qt(D.c[j])})</button>`,
            );
            b.onclick = () => chooseE(j);
            ctl.appendChild(b);
          });
        else
          D.B.forEach((bv, i) => {
            const b = el(`<button class="btn small">${vn(bv)} leaves</button>`);
            b.onclick = () => chooseL(i);
            ctl.appendChild(b);
          });
      }
      function chooseE(j) {
        if (qv(D.c[j]) <= 0) {
          say(
            "rose",
            `${vn(j)} has coefficient ${qt(D.c[j])} in z: raising it would <b>not</b> raise the score. Pick a positive one.`,
          );
          return;
        }
        e = j;
        phase = "leave";
        draw();
        say(
          "violet",
          j === dEnter(D)
            ? `Good: that is the largest coefficient (Dantzig's rule). Now the ratio test: which equation reaches 0 first?`
            : `Legal, since the coefficient is positive, but not the largest. It still works, perhaps in more pivots. Now: which equation reaches 0 first?`,
        );
      }
      function chooseL(i) {
        const rat = dRatios(D, e),
          l = dLeave(D, rat);
        if (!rat[i]) {
          say(
            "rose",
            `The ${vn(D.B[i])} row has no positive coefficient for ${vn(e)}: it never decreases, so it can't be the one to stop you.`,
          );
          return;
        }
        if (i !== l) {
          say(
            "rose",
            `The ${vn(D.B[i])} row would allow ${vn(e)} up to ${qt(rat[i])}, but the ${vn(D.B[l])} row stops you sooner, at ${qt(rat[l])}. Past that, ${vn(D.B[l])} goes negative.`,
          );
          return;
        }
        D = dPivot(D, l, e);
        pivots++;
        phase = "enter";
        draw();
        if (dEnter(D) >= 0)
          say(
            "teal",
            `Pivot done. The new basic solution is (${dSol(D).map(qt0).join(", ")}) with z = ${qt(D.v)}. Choose the next entering variable.`,
          );
      }
      qs("#auto", card).onclick = () => {
        if (dEnter(D) < 0) return;
        const ee = dEnter(D),
          rat = dRatios(D, ee),
          l = dLeave(D, rat);
        D = dPivot(D, l, ee);
        pivots++;
        phase = "enter";
        draw();
        if (dEnter(D) >= 0) say("teal", `Greedy pivot: ${vn(ee)} entered and the tightest row left.`);
      };
      qs("#rs", card).onclick = init;
      init();
      root.appendChild(
        predict({
          id: "a3-slack-1",
          q: "Starting from the dictionary, x₁ enters and x₆ leaves. After this one pivot, what is z?",
          opts: ["27", "9", "36"],
          a: 0,
          why: "x₁ rises to 9 and each unit is worth 3, so z = 3 · 9 = 27. The other nonbasic variables are still 0.",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-slack-2",
          q: "At the optimum the basic solution is (8, 4, 0, 18, 0, 0). How many of the six variables are zero?",
          opts: ["3", "2", "6"],
          a: 0,
          why: "With 3 original variables and 3 rules there are always 3 nonbasic variables, and they are set to 0. Three basic variables (x₁, x₂, x₄) carry the values.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Slack form: every ≤ rule becomes an equation with a slack ≥ 0; <b>basic</b> variables on the left, <b>nonbasic</b> (set to 0) on the right.",
            "Pivot: the entering variable has the largest positive coefficient in z; the leaving one has the smallest ratio.",
            "Rewrite the leaving equation for the entering variable, substitute everywhere, repeat. Stop when no z coefficient is positive.",
          ],
          "Choose who enters, choose who leaves, rewrite, and repeat until z has nothing left to gain.",
        ),
      );
    },
  });
  /* ============ 3.6 Worked example: the bakery ============
     max 12x1 + 11x2 + 9x3 (tens of pounds) ; oven 2x1 + x2 + x3 <= 21 ; prep x1 + 5x2 + 2x3 <= 57.
     Pivots x1>x4, x2>x5, x3>x1 ; optimum (0, 5, 16), z = 199 (checked with exact fractions). */
  const BD0 = dInit(BAK.c, BAK.A, BAK.b),
    BR0 = dRatios(BD0, 0),
    BD1 = dPivot(BD0, dLeave(BD0, BR0), 0);
  // prettier-ignore
  L["a3-bakery"] = {
    sum: "A full LP from words to a plan: write the standard form, add slacks, pivot until z stops rising, then read the plan off the final dictionary and translate it back into trays and pounds.",
    steps: [
      { t: "Task 1: the standard form", b: `<p>A bakery bakes <b>trays</b> of loaves (x₁), buns (x₂) and tarts (x₃). Each tray needs oven hours and prep hours; the week has 21 oven hours and 57 prep hours. Profit per tray is shown in <b>tens of pounds</b>.</p><p>Maximise <code>12x₁ + 11x₂ + 9x₃</code> subject to <code>2x₁ + x₂ + x₃ ≤ 21</code>, <code>x₁ + 5x₂ + 2x₃ ≤ 57</code>, <code>x ≥ 0</code>.</p>`,
        v: (box) => { box.innerHTML = `<div class="fig-wrap">${T(["per tray", "loaves x₁", "buns x₂", "tarts x₃", "available"], [["oven hours", "2", "1", "1", "21"], ["prep hours", "1", "5", "2", "57"], ["profit (£10s)", "12", "11", "9", ""]])}</div>`; } },
      { t: "Task 2: slack form", b: `<p>Add a slack for each rule: <code>x₄ = 21 − 2x₁ − x₂ − x₃</code> (spare oven hours) and <code>x₅ = 57 − x₁ − 5x₂ − 2x₃</code> (spare prep hours). Start at the origin: bake nothing, <b>z = 0</b>, slacks hold all the hours.</p>`,
        v: dictFig(BD0, {}), c: { q: "In the starting dictionary, what are x₄ and x₅?", o: ["21 and 57: all the hours are spare", "0 and 0: all the hours are used", "12 and 11: the profits"], a: 0, why: "Nothing is baked, so no hours are used. Each slack equals its whole limit." } },
      { t: "Task 3: the first pivot", b: `<p>12 is the largest coefficient, so <b>x₁ enters</b>. Ratios: oven 21 ÷ 2 = 10.5, prep 57 ÷ 1 = 57. The smaller wins, so <b>x₄ leaves</b>: loaves are limited by oven hours.</p><p>Solving gives <code>x₁ = 21/2 − x₂/2 − x₃/2 − x₄/2</code> and <code>z = 126 + 5x₂ + 3x₃ − 6x₄</code>.</p>`,
        v: dictFig(BD1, { fresh: 0 }),
        c: { q: "Why does x₄ leave rather than x₅ when x₁ enters?", o: ["10.5 is a smaller ratio than 57", "21 is a smaller number than 57", "x₄ has the bigger coefficient in z"], a: 0, why: "The ratio compares each limit to the amount of x₁ it uses: 21 ÷ 2 against 57 ÷ 1. The oven runs out first." } },
      { t: "Task 4: iterate until done", b: `<p>Repeat: pick the entering variable from the z line, find the tightest row, pivot. Watch for the stopping rule: <b>no positive coefficient left in z</b>.</p>`, v: (box, life) => dictRun(box, life, BAK) },
      { t: "Task 5: read off the plan", b: `<p>Set every nonbasic variable (the right-hand side) to 0 in the final dictionary <code>z = 199 − 4x₁ − 23x₄/3 − 2x₅/3</code>. The basics give <b>x₃ = 16</b> and <b>x₂ = 5</b>, with <b>x₁ = 0</b>.</p><p>Plan: <b>no loaves, 5 trays of buns, 16 trays of tarts</b>. The score is 199 tens of pounds, so the profit is <b>£1,990</b>. Always translate back into the story's units.</p>`,
        v: F.cells([{ v: "0", sub: "trays of loaves", c: "dim" }, { v: "5", sub: "trays of buns", c: "blue" }, { v: "16", sub: "trays of tarts", c: "amber" }, { v: "z = 199", sub: "tens of pounds = £1,990", c: "teal" }], { size: 112 }),
        c: { q: "The final z is 199 and profits were in tens of pounds. What is the weekly profit?", o: ["£1,990", "£199", "£19.90"], a: 0, why: "z uses the same unit as the objective coefficients. 199 tens of pounds is £1,990." } },
      { t: "Check it by plugging in", b: `<p>Always verify against the original rules. Oven: 2·0 + 5 + 16 = <b>21</b>, exactly the limit. Prep: 0 + 25 + 32 = <b>57</b>, also exactly the limit. Profit: 0 + 55 + 144 = <b>199</b>. Both rules are <b>binding</b> and both slacks are 0.</p>`,
        v: (box) => { box.innerHTML = `<div class="fig-wrap">${T(["rule", "used", "limit", "slack"], [["oven hours", "2·0 + 5 + 16 = 21", "21", "0"], ["prep hours", "0 + 5·5 + 2·16 = 57", "57", "0"]])}</div><div class="fig-cap">z = 12·0 + 11·5 + 9·16 = 199.</div>`; } },
      { t: "Why no loaves?", b: `<p>Loaves have the highest profit per tray (12), yet the best plan bakes none. Per oven hour they earn only 6, against 11 for buns and 9 for tarts. When resources are shared, what matters is the profit <b>per unit of the scarce resource</b>, and that is exactly what the pivots weigh up.</p>`,
        v: F.bars([["loaves", 6, "dim", "12 per tray, 2 oven hours"], ["buns", 11, "teal", "11 per tray, 1 oven hour"], ["tarts", 9, "amber", "9 per tray, 1 oven hour"]], { max: 11, fmt: (v) => v + " per oven hour" }),
        c: { q: "Why can the best plan make zero of the product with the highest profit per tray?", o: ["It spends scarce hours less efficiently", "Simplex always ignores the very first variable it sees", "Its profit is never counted inside the score z"], a: 0, why: "Profit per tray ignores how many scarce hours each tray eats. Loaves use two oven hours for 12, so buns and tarts earn more per hour." } },
    ],
    guide: ["Move the <b>loaf profit</b> slider from 4 up to 20 and note where the plan changes.", "Increase the <b>oven hours</b> slider. Which product drops out first?", "Read the binding rules and the slacks for each plan."],
  };
  N.register({
    id: "a3-bakery",
    subject: "algo",
    lecture: 3,
    order: 6,
    num: "3.6",
    title: "Worked example: the bakery",
    blurb: "Standard form, slack form, three pivots and a plan in pounds: the whole recipe on one LP.",
    render(root) {
      root.appendChild(header(this, ""));
      let c1 = 12,
        b1 = 21;
      const card = el(`<div class="card"><div class="controls" id="sl" style="flex-wrap:wrap"></div>
        <div class="stat-row"><div class="stat teal"><small>Plan (loaves, buns, tarts)</small><b id="pl"></b></div><div class="stat amber"><small>z (tens of pounds)</small><b id="zz"></b></div><div class="stat"><small>Pivots</small><b id="pv"></b></div></div>
        <div class="callout" id="msg" style="margin-top:10px;min-height:64px"></div></div>`);
      root.appendChild(card);
      const s1 = N.slider("Loaf profit per tray (x₁)", 4, 20, 1, c1, (v) => v),
        s2 = N.slider("Oven hours available", 10, 60, 1, b1, (v) => v + " h");
      s1.onInput((v) => {
        c1 = v;
        draw();
      });
      s2.onInput((v) => {
        b1 = v;
        draw();
      });
      qs("#sl", card).append(s1, s2);
      function draw() {
        const r = lpSolve([c1, 11, 9], BAK.A, [b1, 57]),
          x = r.x;
        qs("#pl", card).textContent = `(${x.slice(0, 3).map(qt0).join(", ")})`;
        qs("#zz", card).textContent = qt(r.z);
        qs("#pv", card).textContent = r.log.length;
        const bind = [];
        if (Math.abs(x[3]) < 1e-9) bind.push("oven");
        if (Math.abs(x[4]) < 1e-9) bind.push("prep");
        const made = ["loaves", "buns", "tarts"].filter((_, j) => x[j] > 1e-9);
        qs("#msg", card).className = "callout teal";
        qs("#msg", card).innerHTML =
          `Bakes <b>${made.join(", ")}</b>. Binding: <b>${bind.join(" and ") || "none"}</b>. Pivot path: ${r.log.map((s) => `${vn(s.e)} in`).join(", ")}.`;
      }
      draw();
      root.appendChild(
        predict({
          id: "a3-bak-1",
          q: "Raise the loaf profit from 12 to 15 per tray, with 21 oven hours. What happens to the plan?",
          opts: [
            "It does not change: still 0 loaves, 5 buns, 16 tarts",
            "Loaves enter the plan, since they now earn most",
            "The plan becomes infeasible",
          ],
          a: 0,
          why: "Loaves are still too oven-hungry at 15 (7.5 per oven hour, against 11 for buns). The optimum only jumps when the loaf profit reaches 16, where two corners tie.",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-bak-2",
          q: "Keep loaf profit at 12 and raise the oven hours from 21 to 30. Which product drops out of the best plan?",
          opts: ["Buns", "Tarts", "None: all three are still made"],
          a: 0,
          why: "With 30 oven hours the best plan is 1 tray of loaves and 28 of tarts, with no buns (z = 264). More oven time makes the prep hours the scarcer resource, and buns use 5 prep hours each.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Follow the recipe: standard form, slack form, pivot, iterate, read the plan, translate back to the story's units.",
            "The optimum need not make the product with the highest unit profit: shared resources decide.",
            "Check the final plan against the original rules; binding rules have zero slack.",
          ],
          "Pivot until z stops rising, then read the nonbasic zeros and basic values as the plan.",
        ),
      );
    },
  });
  /* ============ 3.7 Simplex as a program ============ */
  const UNB = {
    c: [1, 1],
    A: [
      [1, -1],
      [-1, 1],
    ],
    b: [2, 3],
  }; // x2 enters after one pivot and nothing stops it
  const DEG = {
    c: [2, 1],
    A: [
      [1, 1],
      [1, 0],
    ],
    b: [4, 4],
  }; // ratio tie 4 = 4
  const PRESETS = [
    {
      id: "factory",
      name: "Factory",
      c: [3, 2],
      A: [
        [1, 2],
        [3, 1],
      ],
      b: [10, 15],
    },
    { id: "lecture", name: "3 variables", ...COR },
    { id: "unb", name: "No limit", ...UNB },
    {
      id: "contra",
      name: "Contradiction",
      c: [1, 1],
      A: [
        [1, 1],
        [-1, -1],
      ],
      b: [4, -6],
      note: "Rule 2 is x₁ + x₂ ≥ 6 flipped to ≤.",
    },
    { id: "tie", name: "Ratio tie", ...DEG },
  ];
  const lpText = (p) => {
    const nm = ["x₁", "x₂", "x₃"];
    return `<b>maximise</b> <span class="mono">${lin(p.c, nm)}</span><br>${p.A.map((r, i) => `<span class="mono">${lin(r, nm)} ≤ ${sgn(p.b[i])}</span>`).join("<br>")}${p.note ? `<br><span class="faint">${p.note}</span>` : ""}`;
  };
  const DD1 = (() => {
    const rat = dRatios(dInit(DEG.c, DEG.A, DEG.b), 0);
    const D = dInit(DEG.c, DEG.A, DEG.b);
    return { D0: D, rat, D1: dPivot(D, dLeave(D, rat), 0) };
  })();
  const pivotCounts = () => [
    [
      "factory (2 variables)",
      lpSolve(
        [3, 2],
        [
          [1, 2],
          [3, 1],
        ],
        [10, 15],
      ).log.length,
    ],
    ["lecture LP (3 variables)", lpSolve(COR.c, COR.A, COR.b).log.length],
    ["bakery (3 variables)", lpSolve(BAK.c, BAK.A, BAK.b).log.length],
  ];
  // prettier-ignore

  L["a3-implement"] = {
    sum: "Simplex as a program takes c, A and b and returns the best plan or an honest error. The loop is short; the interesting part is what can go wrong: no feasible start, an unbounded direction, or a tie in the ratio test.",
    steps: [
      { t: "Inputs and outputs", b: `<p>The tutorial asks you to implement simplex. The contract is simple. <b>Input:</b> the coefficients <code>cⱼ</code>, <code>aᵢⱼ</code> and <code>bᵢ</code> of a standard-form LP. <b>Output:</b> the optimal plan and its score, <i>or</i> an error saying that no feasible solution exists or that the solutions are unbounded.</p>`,
        v: F.flow([{ t: "c, A, b", s: "standard form", c: "violet" }, { t: "simplex", s: "pivot loop", c: "blue" }, { t: "x*, z*", s: "or an error", c: "teal" }]) },
      { t: "Where to start", b: `<p>Simplex needs a <b>basic feasible solution</b> to begin. In standard form with every <code>bᵢ ≥ 0</code>, the <b>origin</b> works: all original variables are 0, so each slack equals its <code>bᵢ ≥ 0</code>.</p><p>If some <code>bᵢ &lt; 0</code> (for example after flipping a ≥ rule), the slack would be negative at the origin, so the origin is not a legal start. Finding another start (or proving none exists) needs an extra phase that we do not cover.</p>`,
        v: F.compare({ title: "All bᵢ ≥ 0", c: "teal", body: `origin is feasible<br>slacks = bᵢ ≥ 0<br>start pivoting` }, { title: "Some bᵢ &lt; 0", c: "rose", body: `origin is NOT feasible<br>a slack would be negative<br>need a different start` }),
        c: { q: "In standard form, when is the origin a valid starting corner?", o: ["When every bᵢ is at least 0", "When every cⱼ is positive", "Always: the origin is a corner of any LP"], a: 0, why: "At the origin each slack equals its bᵢ, and slacks must be ≥ 0. A negative bᵢ breaks that." } },
      { t: "The loop, in order", b: `<p>The lecture's summary: <b>1.</b> find a basic feasible solution; <b>2.</b> repeat: <i>if no entering variable exists, stop</i>; choose the entering variable; choose the leaving variable; update the equations; go back to the test.</p><p>The stopping test comes <b>first</b>, so a start that is already optimal exits without a pivot.</p>`,
        v: F.flow([{ t: "any z coefficient > 0?", c: "violet" }, { t: "choose entering", c: "blue" }, { t: "choose leaving", c: "amber" }, { t: "update equations", c: "teal" }], { loop: true }),
        c: { q: "What does each round of the simplex loop check first?", o: ["Whether any z coefficient is still positive", "Whether the ratio test has produced a tie", "Whether the origin is a feasible start"], a: 0, why: "If no entering variable exists, the current basic solution is optimal and the loop exits. Only then does it pick an entering and a leaving variable." } },
      { t: "Unbounded: nothing stops you", b: `<p>Take <code>maximise x₁ + x₂</code> with <code>x₁ − x₂ ≤ 2</code> and <code>−x₁ + x₂ ≤ 3</code>. After one pivot x₂ enters, and <b>no row</b> has a positive coefficient for it, so no ratio exists. The program must stop with an <b>unbounded</b> error rather than loop or invent an answer.</p>`, v: (box, life) => dictRun(box, life, UNB),
        c: { q: "The entering variable has no positive coefficient in any row. What should the program do?", o: ["Report that the LP is unbounded", "Pick the row with the smallest constant", "Return the current corner as optimal"], a: 0, why: "Without a positive coefficient there is no ratio to bound the entering variable, so z can grow forever. That is the definition of unbounded." } },
      { t: "Infeasible: no plan fits", b: `<p>Ask for <code>x₁ + x₂ ≤ 4</code> and <code>x₁ + x₂ ≥ 6</code>. No pair satisfies both. In standard form the second rule is <code>−x₁ − x₂ ≤ −6</code>, with <code>b₂ = −6 &lt; 0</code>, so the origin fails. A complete solver would confirm that nothing is feasible and return the "no feasible solution" error.</p>`,
        v: fig(polySVG([{ a: 1, b: 1, r: 4, n: "x₁ + x₂ ≤ 4", c: "var(--violet)", at: 0.7 }, { a: -1, b: -1, r: -6, n: "x₁ + x₂ ≥ 6", c: "var(--amber)", at: 0.3 }], { span: 8 }).svg, "Below the violet line and above the orange line: empty."),
        c: { q: "x₁ + x₂ ≤ 4 and x₁ + x₂ ≥ 6 are both required. What is the outcome?", o: ["Infeasible: no plan satisfies both", "Unbounded: z has no maximum", "Optimal at (0, 0) with z = 0"], a: 0, why: "The feasible region is empty. The origin gives x₁ + x₂ = 0, which breaks the ≥ 6 rule." } },
      { t: "Ties and degeneracy", b: `<p>Maximise <code>2x₁ + x₂</code> with <code>x₁ + x₂ ≤ 4</code> and <code>x₁ ≤ 4</code>. When x₁ enters, both rows reach 0 at x₁ = 4 (a <b>tie</b> in the ratio test). One leaves; the other stays basic but at value <b>0</b>: a <b>degenerate</b> corner.</p><p>A pivot there may gain nothing, and in rare cases a poor tie-break could cycle forever. Choosing the lowest-numbered candidate (Bland's rule) guarantees it stops.</p>`,
        v: (box) => { box.innerHTML = `<div class="fig-wrap">${dictHTML(DD1.D0, { enter: 0, ratios: DD1.rat, sol: false })}${dictHTML(DD1.D1, { fresh: 0 })}</div><div class="fig-cap">After pivoting, x₄ is basic but equal to 0.</div>`; },
        c: { q: "Two rows tie for the smallest ratio. After the pivot, what is special about the new basic solution?", o: ["A basic variable equals 0 (degenerate)", "The LP has become unbounded at that corner", "The entering variable has been forced to 0"], a: 0, why: "The row that did not leave also hits zero at that moment, so it stays basic with value 0." } },
      { t: "Does it always stop? How long does it take?", b: `<p>Each non-degenerate pivot strictly raises z, so no corner repeats, and there are only finitely many corners. So simplex stops. On the LPs in this course it needs only a few pivots; contrived worst cases can take exponentially many, but they are rare in practice.</p>`,
        v: (box) => { const pc = pivotCounts(); box.innerHTML = F.bars(pc.map(([l, v]) => [l, v, "teal"]), { max: 4, fmt: (v) => v + " pivots" }); },
        c: { q: "Why must simplex terminate on a non-degenerate LP?", o: ["Each pivot raises z; corners are finitely many", "It stops after exactly n pivots, one per variable", "The tableau loses one row at every single pivot"], a: 0, why: "A strictly rising z means no corner can be visited twice, and the number of corners is finite." } },
    ],
    guide: ["Choose each preset in turn and press <b>Run simplex</b>.", "Compare the 'No limit' and 'Contradiction' verdicts: they fail in different places.", "On 'Ratio tie', read the final basic solution: a zero among the basics."],
  };
  N.register({
    id: "a3-implement",
    subject: "algo",
    lecture: 3,
    order: 7,
    num: "3.7",
    title: "Simplex as a program",
    blurb: "Inputs, loop and error cases: optimal, unbounded, infeasible start and ties.",
    render(root) {
      root.appendChild(header(this, ""));
      let cur = PRESETS[0];
      const card = el(
        `<div class="card"><div class="controls" id="sg"></div><div class="grid side"><div><div id="lp" style="min-height:96px"></div><div class="controls"><button class="btn primary" id="go">Run simplex</button></div></div><div id="out" style="min-height:210px"></div></div><div class="callout" id="msg" style="margin-top:10px;min-height:74px"></div></div>`,
      );
      root.appendChild(card);
      qs("#sg", card).appendChild(
        N.seg(
          PRESETS.map((p) => [p.id, p.name]),
          cur.id,
          (v) => {
            cur = PRESETS.find((p) => p.id === v);
            show();
          },
        ),
      );
      function show() {
        qs("#lp", card).innerHTML = lpText(cur);
        qs("#out", card).innerHTML = "";
        const m = qs("#msg", card);
        m.className = "callout";
        m.innerHTML = "Press <b>Run simplex</b>.";
      }
      qs("#go", card).onclick = () => {
        const r = lpSolve(cur.c, cur.A, cur.b),
          m = qs("#msg", card),
          n = cur.c.length;
        if (r.status === "origin-infeasible") {
          qs("#out", card).innerHTML = `<p class="faint">No pivots: the start is not feasible.</p>`;
          m.className = "callout rose";
          m.innerHTML = `<b>Infeasible start.</b> b₂ = −6 &lt; 0, so the origin breaks rule 2. Here the two rules (x₁ + x₂ ≤ 4 and ≥ 6) contradict each other: <b>no plan satisfies both</b>.`;
          return;
        }
        const nm = (i) => (i < n ? "x" + (i + 1) : "s" + (i - n + 1));
        qs("#out", card).innerHTML = T(
          ["pivot", "enters", "leaves", "z", "corner"],
          [
            ["start", "", "", "0", `(${Array(n).fill(0).join(", ")})`],
            ...r.log.map((s, i) => [i + 1, nm(s.e), nm(s.out), qt(s.z), `(${s.x.slice(0, n).map(qt0).join(", ")})`]),
          ],
        );
        if (r.status === "unbounded") {
          m.className = "callout rose";
          m.innerHTML = `<b>Unbounded.</b> After ${r.log.length} pivot${r.log.length === 1 ? "" : "s"}, ${nm(r.e)} would enter but no row limits it: z can grow without bound.`;
        } else {
          const zeros = r.x.filter((v) => Math.abs(v) < 1e-9).length,
            deg = zeros > n;
          m.className = "callout teal";
          m.innerHTML = `<b>Optimal:</b> z = ${qt(r.z)} at (${r.x.slice(0, n).map(qt0).join(", ")}) after ${r.log.length} pivot${r.log.length === 1 ? "" : "s"}.${deg ? ` <b>Degenerate:</b> ${zeros} variables are 0 but only ${n} are nonbasic, so a basic variable equals 0.` : ""}`;
        }
      };
      show();
      root.appendChild(
        predict({
          id: "a3-impl-1",
          q: "Run the 'Contradiction' preset (x₁ + x₂ ≤ 4 and x₁ + x₂ ≥ 6). What does the program report?",
          opts: [
            "Optimal at the origin, with z equal to 0",
            "Unbounded: z can rise without any limit",
            "Infeasible: no plan satisfies both rules",
          ],
          a: 2,
          why: "The flipped rule has b₂ = −6, so the origin is not a legal start, and the two rules cannot both hold. There is no feasible plan to improve.",
        }),
      );
      root.appendChild(
        predict({
          id: "a3-impl-2",
          q: "In the 'Ratio tie' preset, x₁ enters and two rows both reach 0 at x₁ = 4. What is true of the final basic solution?",
          opts: [
            "Every basic variable is positive",
            "A basic variable equals 0: a degenerate corner",
            "z has fallen below its starting value",
          ],
          a: 1,
          why: "One tied row leaves; the other stays basic but at value 0. The final solution (4, 0, 0, 0) has a zero among the basics.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Input c, A, b. Output the best plan, or an error: <b>infeasible</b> (no legal start or no plan fits) or <b>unbounded</b> (no row limits the entering variable).",
            "The loop: stop if no positive coefficient in z; otherwise choose entering, choose leaving by the ratio test, update, repeat.",
            "Ties in the ratio test give degenerate corners (a basic variable at 0). A fixed tie-break such as Bland's rule prevents cycling.",
          ],
          "Simplex returns an optimum, or tells you honestly why it cannot.",
        ),
      );
    },
  });
})();
