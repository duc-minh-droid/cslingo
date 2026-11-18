// usage: node smoke-mods.mjs <moduleId> [<moduleId> ...]   (smoke() on just those modules + bankTest + answerBias summary)
import { serve, launch, root } from "/home/user/cslingo/tools/video-lib.js";
import { join } from "node:path";
const ids = process.argv.slice(2);
const { server, base } = await serve(); const b = await launch();
try {
  const page = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(base + "/index.html#home");
  await page.waitForFunction(() => window.NIC && NIC.content && NIC.refresh, null, { timeout: 30000 });
  for (const f of ["answer.js", "smoke.js", "bank-test.js", "answer-bias.js"]) await page.addScriptTag({ path: join(root, "tools", f) });
  const r = await page.evaluate(async (ids) => {
    await NIC.content.all();
    const all = NIC.modules.slice();
    const missing = ids.filter((id) => !all.some((m) => m.id === id));
    const keep = all.filter((m) => ids.includes(m.id));
    NIC.modules.splice(0, NIC.modules.length, ...keep);
    const s = await smoke({});
    NIC.modules.splice(0, NIC.modules.length, ...all);
    const bt = await bankTest();
    await NIC.bank.load();
    const ab = answerBias();
    const counts = Object.fromEntries(ids.map((id) => [id, NIC.bank.all({}).filter((x) => x.mod === id && x.src === "bank").length]));
    return { missing, smokeErrors: s.errors.filter((e) => e.where !== "phone layout"), report: s.report, bankFailures: (bt.failures || []).filter((f) => !/^schedule:/.test(f)).slice(0, 15), bankPerModule: counts, calcRisk: (ab.calcRisk || []).length };
  }, ids);
  console.log(JSON.stringify({ ...r, pageErrors: errs }, null, 1));
} finally { await b.close(); server.close(); }
