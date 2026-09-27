/* Revision-bank test, run in the page: await bankTest() → { questions, modulesCovered, failures: [...] }
   Checks content (NIC.bank.problems), renders every bank question with the real quiz engine off-screen,
   grades the correct answer, and exercises deck/record/stats without touching the learner's progress. */
async function bankTest() {
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
      const t = Q.type || "mcq", at = `${mod}[${i}] (${t})`;
      try {
        const box = document.createElement("div"); holder.appendChild(box);
        T[t].render(Q, box, () => {}, `${mod}-${i}`);
        if (t === "pick") { const ids = [...box.querySelectorAll("[data-pick]")].map((e) => e.dataset.pick); [].concat(Q.a).forEach((a) => { if (!ids.includes(a)) failures.push(`${at}: pick id ${a} not in figure`); }); }
        const v = right(Q);
        if (!T[t].grade(Q, v)) failures.push(`${at}: correct answer grades as wrong`);
        T[t].reveal(Q, box, v, true);
        if (!T[t].answer(Q)) failures.push(`${at}: empty answer text`);
        const bad = (box.textContent + " " + T[t].answer(Q)).match(/\[object Object\]|\bundefined\b|\bNaN\b/);
        if (bad) failures.push(`${at}: shows "${bad[0]}"`);
      } catch (e) { failures.push(`${at}: ${e.message}`); }
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
    if (s1.seen !== 12 || s1.due !== s0.due - 6) failures.push(`record: seen ${s1.seen}, due ${s1.due} (was ${s0.due})`);
    localStorage.setItem("nic.lessonDone", "{}");
    const onlyBoss = NIC.bank.all({ learnedOnly: true }).filter((x) => x.src !== "boss");
    if (onlyBoss.length) failures.push("learnedOnly: unfinished modules leaked into the pool");
  } finally {
    keep.rev === null ? localStorage.removeItem("nic.rev") : localStorage.setItem("nic.rev", keep.rev);
    keep.done === null ? localStorage.removeItem("nic.lessonDone") : localStorage.setItem("nic.lessonDone", keep.done);
  }
  const covered = new Set(Object.keys(NIC.bank.raw)), missing = NIC.modules.filter((m) => m.num !== "Boss" && !covered.has(m.id)).map((m) => m.id);
  if (missing.length) failures.push(`modules with no bank questions: ${missing.join(", ")}`);
  return { questions: n, modulesCovered: covered.size, failures };
}
