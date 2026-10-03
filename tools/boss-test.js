/* Answers every boss question correctly through the lesson player and checks each boss scores full marks.
   Load tools/answer.js first. Run in the page: await bossTest()  → { bosses, failures: [...] } */
async function bossTest() {
  if (NIC.content) await NIC.content.all(); // every course's lessons load on demand
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const failures = [];
  const bosses = NIC.modules.filter((m) => m.num === "Boss");
  localStorage.removeItem("nic.quiz");
  for (const m of bosses) {
    location.hash = m.id; await wait(250);
    // time budget, not a step count: screen transitions got longer with the motion passes
    for (const end = Date.now() + 20000; Date.now() < end; ) {
      const st = NIC.player.state();
      if (!st.open) break;
      if (st.kind === "bossResult" || st.kind === "complete") break; // a perfect run skips straight to complete
      if (st.Q && /check/.test(st.foot)) {
        try { const ok = await answerCurrent(); if (!ok) failures.push(`${m.id} ${st.key} (${st.Q.type || "mcq"}) graded wrong`); }
        catch (e) { failures.push(`${m.id} ${st.key}: ${e.message}`); break; }
      }
      document.querySelector(".pl-go").click(); await wait(40);
    }
    NIC.bossDef(m.id).qs.forEach((Q, i) => { if (Q.type === "num") failures.push(`${m.id} Q${i + 1}: typed-answer question (use mcq or slider)`); });
    const n = NIC.bossDef(m.id).qs.length, q = JSON.parse(localStorage.getItem("nic.quiz") || "{}");
    const right = Array.from({ length: n }, (_, i) => q[`${m.id}-${i}`]).filter((x) => x && x.ok).length;
    if (right !== n) failures.push(`${m.id}: ${right}/${n} stored as correct`);
    NIC.player.close(true);
  }
  return { bosses: bosses.length, failures };
}
