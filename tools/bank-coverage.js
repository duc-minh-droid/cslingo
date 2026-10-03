/* Revision-bank coverage helper, run in the page (Playwright addScriptTag + evaluate, or DevTools console).
   bankCoverage({min})        → sessions (non-boss modules) with fewer than `min` bank questions, plus totals
   bankExisting(moduleId)     → every question already asked about a module (bank, lesson checks, predicts,
                                and its lecture's boss quiz), as plain text, so new questions don't repeat them */
const needBank = () => { if (NIC.bank.loaded && !NIC.bank.loaded()) throw new Error("run `await NIC.bank.load()` first (the question lists load on demand)"); };
function bankCoverage({ min = 12, subject = null } = {}) {
  needBank();
  const mods = NIC.modules.filter((m) => m.num !== "Boss" && (!subject || (m.subject || "nic") === subject));
  const rows = mods.map((m) => ({ id: m.id, subject: m.subject || "nic", lecture: m.lecture, num: m.num, title: m.title.replace(/<[^>]+>/g, ""), bank: (NIC.bank.raw[m.id] || []).length }));
  const types = {};
  Object.values(NIC.bank.raw).flat().forEach((q) => (types[q.type || "mcq"] = (types[q.type || "mcq"] || 0) + 1));
  return { sessions: rows.length, total: rows.reduce((s, r) => s + r.bank, 0), below: rows.filter((r) => r.bank < min), types };
}

function bankExisting(id) {
  needBank();
  const plain = (h) => String(h).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const m = NIC.modules.find((x) => x.id === id);
  if (!m) return { error: `no module ${id}` };
  const out = { bank: (NIC.bank.raw[id] || []).map((q) => plain(q.q)), checks: [], predicts: [], boss: [] };
  const L = NIC.LESSONS[id];
  if (L) L.steps.forEach((s) => s.c && out.checks.push(plain(s.c.q)));
  // predicts are created by render(); render into a detached node to read them
  try {
    const holder = document.createElement("div"), life = NIC.lifecycle();
    m.render(holder, life);
    holder.querySelectorAll(".predict").forEach((n) => n.__opts && out.predicts.push(plain(n.__opts.q)));
    life.dispose();
  } catch (e) { out.predicts.push(`(render failed: ${e.message})`); }
  const boss = NIC.modules.find((x) => x.num === "Boss" && (x.subject || "nic") === (m.subject || "nic") && x.lecture === m.lecture);
  const B = boss && NIC.bossDef && NIC.bossDef(boss.id);
  if (B) out.boss = B.qs.map((q) => plain(q.q));
  out.lesson = L ? L.steps.map((s) => `${plain(s.t)}: ${plain(s.b)}`) : [];
  return out;
}
