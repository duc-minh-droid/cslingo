/* Revision-bank test, run in the page: await bankTest() → { questions, modulesCovered, failures: [...] }
   Checks content (NIC.bank.problems), renders every bank question with the real quiz engine off-screen,
   grades the correct answer, and exercises deck/record/stats without touching the learner's progress. */
async function bankTest() {
  if (NIC.bank.load) await NIC.bank.load(); // the question lists load on demand
  const failures = [...NIC.bank.problems()];
  const T = NIC.QUIZ_TYPES;
  const right = (Q) => {
    const t = Q.type || "mcq";
    if (t === "mcq" || t === "bug") return Q.a;
    if (t === "multi") return Q.a.slice();
    if (t === "slider") return Q.ans;
    if (t === "order" || t === "match") return (Q.items || Q.pairs).map((_, k) => k);
    if (t === "cat") return Q.items.map((x) => x[1]);
    if (t === "pick") return Array.isArray(Q.a) ? Q.a.slice().sort() : Q.a;
  };
  const holder = document.createElement("div");
  holder.style.cssText = "position:absolute;left:-9999px;top:0;width:640px";
  document.body.appendChild(holder);
  let n = 0;
  for (const [mod, qs] of Object.entries(NIC.bank.raw)) {
    qs.forEach((Q, i) => {
      n++;
      const t = Q.type || "mcq",
        at = `${mod}[${i}] (${t})`;
      if (t === "num") failures.push(`${at}: typed-answer question (use mcq or slider; learners never type answers)`);
      try {
        const box = document.createElement("div");
        holder.appendChild(box);
        T[t].render(Q, box, () => {}, `${mod}-${i}`);
        if (t === "pick") {
          const ids = [...box.querySelectorAll("[data-pick]")].map((e) => e.dataset.pick);
          [].concat(Q.a).forEach((a) => {
            if (!ids.includes(a)) failures.push(`${at}: pick id ${a} not in figure`);
          });
        }
        const v = right(Q);
        if (!T[t].grade(Q, v)) failures.push(`${at}: correct answer grades as wrong`);
        T[t].reveal(Q, box, v, true);
        if (!T[t].answer(Q)) failures.push(`${at}: empty answer text`);
        const bad = (box.textContent + " " + T[t].answer(Q)).match(/\[object Object\]|\bundefined\b|\bNaN\b/);
        if (bad) failures.push(`${at}: shows "${bad[0]}"`);
      } catch (e) {
        failures.push(`${at}: ${e.message}`);
      }
    });
  }
  holder.remove();
  // deck / record / stats on a sandboxed copy of progress
  const keep = { rev: localStorage.getItem("nic.rev"), done: localStorage.getItem("nic.lessonDone") };
  try {
    const all = NIC.modules.filter((m) => m.num !== "Boss").map((m) => m.id);
    localStorage.setItem("nic.lessonDone", JSON.stringify(Object.fromEntries(all.map((id) => [id, true]))));
    localStorage.removeItem("nic.rev");
    const s0 = NIC.bank.stats();
    if (s0.available < n) failures.push(`stats: only ${s0.available} available, expected ≥ ${n}`);
    const d = NIC.bank.deck({ n: 12 });
    if (d.length !== 12) failures.push(`deck: got ${d.length} items, expected 12`);
    if (new Set(d.map((x) => x.id)).size !== d.length) failures.push("deck: duplicate questions");
    d.forEach((x, k) => NIC.bank.record(x.id, k % 2 === 0));
    const s1 = NIC.bank.stats();
    if (s1.seen !== 12 || s1.due !== s0.due - 6)
      failures.push(`record: seen ${s1.seen}, due ${s1.due} (was ${s0.due})`);
    scheduleChecks(failures);
    localStorage.setItem("nic.lessonDone", "{}");
    const onlyBoss = NIC.bank.all({ learnedOnly: true }).filter((x) => x.src !== "boss");
    if (onlyBoss.length) failures.push("learnedOnly: unfinished modules leaked into the pool");
  } finally {
    keep.rev === null ? localStorage.removeItem("nic.rev") : localStorage.setItem("nic.rev", keep.rev);
    keep.done === null ? localStorage.removeItem("nic.lessonDone") : localStorage.setItem("nic.lessonDone", keep.done);
  }
  const covered = new Set(Object.keys(NIC.bank.raw)),
    missing = NIC.modules.filter((m) => m.num !== "Boss" && !m.workshop && !covered.has(m.id)).map((m) => m.id);
  if (missing.length) failures.push(`modules with no bank questions: ${missing.join(", ")}`);
  return { questions: n, modulesCovered: covered.size, failures };
}

/* Review scheduling (run inside bankTest's sandbox: every module finished, `nic.rev` is restored afterwards). Uses real question ids
   and explicit clocks, so nothing depends on today's date. Covers: due by local calendar day, record() promoting only a question
   that was due, wrong always demoting, dueSeen() ignoring ids that no longer exist, and the helpers for the revision complete screen. */
function scheduleChecks(failures) {
  const bank = NIC.bank,
    [A, A2, A3] = bank.all({ learnedOnly: true }).filter((x) => x.src === "bank");
  const at = (day, h, m = 0, s = 0) => new Date(2030, 5, 15 + day, h, m, s).getTime(); // local time, day 0 = 15 June 2030
  const put = (o) => localStorage.setItem("nic.rev", JSON.stringify(o));
  const get = (id) => JSON.parse(localStorage.getItem("nic.rev"))[id];
  const isDue = (box, t, now) => {
    put({ [A.id]: { box, n: 1, right: box > 1 ? 1 : 0, t } });
    return bank.dueSeen({ now }) === 1;
  };
  const must = (ok, msg) => ok || failures.push(`schedule: ${msg}`);
  // due by calendar day, not by elapsed hours
  must(
    isDue(2, at(0, 23, 59), at(1, 0, 1)),
    "box 2 answered at 23:59 should be due two minutes later, at the next midnight",
  );
  must(!isDue(2, at(0, 0, 1), at(0, 23, 59)), "box 2 answered at 00:01 is not due the same day");
  must(isDue(2, at(0, 0, 1), at(1, 0, 0)), "box 2 answered at 00:01 is due from the next midnight");
  must(!isDue(3, at(0, 10), at(2, 23, 59)), "box 3 (3 days) must not be due on day 2");
  must(isDue(3, at(0, 10), at(3, 0, 0)), "box 3 (3 days) is due from midnight of day 3");
  must(!isDue(4, at(0, 23, 59), at(6, 23, 59)) && isDue(4, at(0, 23, 59), at(7, 0, 0)), "box 4 (7 days) boundary");
  must(!isDue(5, at(0, 8), at(13, 23, 59)) && isDue(5, at(0, 8), at(14, 0, 0)), "box 5 (14 days) boundary");
  must(isDue(1, at(0, 12), at(0, 12)), "box 1 is always due");
  // record(): promote only when due, demote always
  put({});
  let r = bank.record(A.id, true, at(0, 9));
  must(
    r.box === 2 && r.n === 1 && r.right === 1 && r.t === at(0, 9) && !r.fixed,
    "first right answer moves a new question to box 2",
  );
  r = bank.record(A.id, true, at(0, 15)); // answered again the same day: not due, so no promotion and the schedule is untouched
  must(
    r.box === 2 && get(A.id).t === at(0, 9) && r.n === 2 && r.right === 2,
    "an early right answer keeps the box and the due date but counts in the totals",
  );
  r = bank.record(A.id, false, at(0, 16)); // wrong early still demotes
  must(
    r.box === 1 && get(A.id).t === at(0, 16) && r.n === 3 && r.right === 2,
    "a wrong answer always sends the question back to box 1",
  );
  r = bank.record(A.id, true, at(0, 17)); // box 1 is due: promotes, and it is a missed question put right
  must(r.box === 2 && r.fixed === true, "a missed question answered right is promoted and reported as fixed");
  put({ [A.id]: { box: 3, n: 2, right: 2, t: at(-3, 9) } });
  r = bank.record(A.id, true, at(0, 9));
  must(r.box === 4 && r.fixed === false, "a due question answered right moves up one box (not fixed: never missed)");
  put({ [A.id]: { box: 5, n: 4, right: 4, t: at(-20, 9) } });
  must(bank.record(A.id, true, at(0, 9)).box === 5, "box 5 stays at 5");
  put({ [A.id]: { box: 4, n: 3, right: 3, t: at(0, 9) } });
  must(bank.record(A.id, false, at(1, 9)).box === 1, "a wrong answer on a not-due question sends it to box 1");
  put({ [A.id]: { box: 2, n: 1, right: 1 } }); // a log entry with no date (should not hide the question forever)
  must(bank.dueSeen({ now: at(0, 9) }) === 1, "an entry with no date counts as due");
  // dueSeen() ignores log entries for questions that no longer exist (the bank is loaded here)
  put({
    [A.id]: { box: 1, n: 1, right: 0, t: at(0, 9) },
    [`${A.mod}:zzzzzzz`]: { box: 1, n: 1, right: 0, t: at(0, 9) },
  });
  must(bank.dueSeen({ now: at(0, 10) }) === 1, "dueSeen counted a log entry whose question no longer exists");
  // helpers for the revision complete screen
  put({
    [A.id]: { box: 1, n: 2, right: 1, t: at(0, 9) }, // missed: due again straight away
    [A2.id]: { box: 3, n: 1, right: 1, t: at(0, 9) }, // right: back in 3 days
    [A3.id]: { box: 2, n: 1, right: 1, t: at(0, 9) }, // right: back tomorrow
  });
  const ar = bank.afterRound([A.id, A2.id, A3.id, "no:such"], { now: at(0, 10) });
  must(
    ar.soon === 1 && ar.next === at(1, 0, 0) && ar.nextLabel === "tomorrow",
    `afterRound gave ${JSON.stringify(ar)}`,
  );
  must(
    bank.afterRound([A.id, A2.id], { now: at(0, 10) }).nextLabel === "in 3 days",
    "afterRound: next label for a box-3 question",
  );
  must(
    bank.whenLabel(at(5, 0), at(0, 22)) === "in 5 days" && bank.whenLabel(at(0, 0), at(0, 22)) === "today",
    "whenLabel wording",
  );
  must(bank.nextDue({ now: at(0, 10) }) === at(1, 0, 0), "nextDue is the earliest not-yet-due date");
  const bonus = [5, 10, 20].map(bank.roundBonus);
  must(bonus.join() === "5,7,10" && bonus.every((x, k) => k === 0 || x >= bonus[k - 1]), `roundBonus gave ${bonus}`);
}
