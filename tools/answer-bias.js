/* Answer-bias audit, run in the page: answerBias() → { total, position, longestCount, list, calcRisk }
   Checks every multiple-choice question (lesson checks, predicts, boss quizzes, revision bank) for the two classic tells:
   the right answer is usually in the same position, or it is usually the longest option. */
function answerBias({ ratio = 1.25 } = {}) {
  const plain = (h) => String(h).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const qs = [];
  const add = (src, where, q, o, a, hint) => { if (Array.isArray(o) && o.length > 2 && typeof a === "number") qs.push({ src, where, q: plain(q), o: o.map(plain), a, hint: hint || "" }); };
  NIC.modules.forEach((m) => {
    const L = NIC.LESSONS[m.id];
    if (L) L.steps.forEach((s, k) => s.c && add("check", `${m.id} step ${k + 1}`, s.c.q, s.c.o, s.c.a));
    if (m.num === "Boss") { const B = NIC.bossDef && NIC.bossDef(m.id); if (B) B.qs.forEach((Q, i) => (Q.type || "mcq") === "mcq" && add("boss", `${m.id} Q${i + 1}`, Q.q, Q.o, Q.a, Q.hint)); return; }
    try { const h = document.createElement("div"), life = NIC.lifecycle(); m.render(h, life); h.querySelectorAll(".predict").forEach((n) => n.__opts && add("predict", `${m.id} ${n.__opts.id}`, n.__opts.q, n.__opts.opts, n.__opts.a)); life.dispose(); } catch (e) { /* demo needs the page */ }
  });
  Object.entries(NIC.bank.raw).forEach(([mod, list]) => list.forEach((Q, i) => (Q.type || "mcq") === "mcq" && add("bank", `${mod}[${i}]`, Q.q, Q.o, Q.a, Q.hint)));
  const fixed = (o) => /^(true|false)$/i.test(o[0]) || o.every((x) => /^[−\-]?[\d.,/ ]+[\w%×]*$|^about /i.test(x));
  const pos = {}, longest = [];
  qs.forEach((x) => {
    const shown = NIC.optOrder ? NIC.optOrder({ q: x.q, o: x.o }).indexOf(x.a) : x.a; // position the learner actually sees
    pos[shown] = (pos[shown] || 0) + 1;
    const L = x.o.map((s) => s.length), other = Math.max(...L.filter((_, i) => i !== x.a));
    x.long = L[x.a] >= ratio * other;
    if (x.long && !fixed(x.o)) longest.push(x);
  });
  const bySrc = {}; qs.forEach((x) => { const b = (bySrc[x.src] = bySrc[x.src] || { n: 0, long: 0, mid: 0 }); b.n++; if (x.long) b.long++; if (x.a === 1) b.mid++; });
  // calculator risk: number answers too precise, or too close to another option, to pick by estimating
  const num = (t) => { const m = String(t).replace(/,/g, "").match(/^(?:about |roughly |≈ ?)?(-?\d*\.?\d+)$/i); return m ? +m[1] : NaN; };
  const calc = qs.filter((x) => {
    if (x.hint || x.o.every((o) => /^[01]{2,}$/.test(o))) return false; // hinted, or bit strings
    const v = x.o.map(num); if (v.some((n) => !Number.isFinite(n)) || Number.isInteger(v[x.a])) return false; // whole-number sums are fine to do exactly
    const ans = v[x.a], near = Math.min(...v.filter((_, i) => i !== x.a).map((n) => Math.abs(n - ans) / Math.max(Math.abs(ans), 1e-9)));
    const precise = !Number.isInteger(ans) && String(ans).replace(/^-?0\./, "").replace(/^-?\d+\./, "").length >= 3;
    return precise || near < 0.15;
  });
  return { total: qs.length, position: pos, bySrc, longestCount: longest.length, list: longest, calcRisk: calc };
}
