/* Full click-through smoke test, run inside the page (Playwright evaluate or DevTools console). Load tools/answer.js first.
   Opens every module in the lesson player, walks every screen (answering questions correctly),
   plays every step-through runner to the end (answering its predicts), presses buttons on the Try-it demo, and reports any errors. */
async function smoke({ subjects = null, buttons = 12 } = {}) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const errors = [];
  const onErr = (e) => errors.push({ where: location.hash, msg: String(e.message || e.reason || e) });
  window.addEventListener("error", onErr);
  window.addEventListener("unhandledrejection", onErr);
  const mods = NIC.modules.filter((m) => !subjects || subjects.includes(m.subject || "nic"));
  const report = [];
  // text that means a value was printed instead of rendered (e.g. an object passed where a string was expected)
  const BAD = /\[object Object\]|\bundefined\b|\bNaN\b/;
  const seenBad = new Set();
  const scan = (where, node) => { if (!node) return; const m = (node.innerText || node.textContent || "").match(BAD); if (m && !seenBad.has(where + m[0])) { seenBad.add(where + m[0]); errors.push({ where, msg: `screen shows "${m[0]}"` }); } };
  for (const m of mods) {
    localStorage.removeItem("nic.lessonPos");
    location.hash = m.id;
    await wait(250);
    if (!NIC.player.isOpen()) { errors.push({ where: m.id, msg: "player did not open" }); continue; }
    let steps = 0, figs = 0, qs = 0, runners = 0, demo = false;
    for (let guard = 0; guard < 120; guard++) {
      const st = NIC.player.state();
      if (!st.open) break;
      const scr = document.querySelector(".pl-screen:not(.leaving)");
      scan(`${m.id} ${st.kind}${st.kind === "step" ? " " + steps : ""}`, scr);
      if (st.kind === "step") {
        steps++; if (scr.querySelector(".lesson-visual:not(:empty)")) figs++;
        for (const r of scr.querySelectorAll(".rn")) { runners++; try { (await r.__rn.runAll()).forEach((msg) => errors.push({ where: `${m.id} runner`, msg })); } catch (e) { onErr(e); } }
      }
      if (st.kind === "try" && !demo) {
        demo = true;
        const play = [...scr.querySelectorAll(".pl-try-demo button:not([disabled])")].slice(0, buttons);
        for (const b of play) { try { b.click(); } catch (e) { onErr(e); } await wait(30); }
      }
      if (st.kind === "bossResult") { NIC.player.close(true); break; }
      if (st.Q && /check/.test(st.foot)) { qs++; try { await answerCurrent(); } catch (e) { onErr(e); break; } }
      if (st.kind === "streak" || st.kind === "complete") { NIC.player.close(true); break; }
      document.querySelector(".pl-go").click(); await wait(30);
    }
    if (NIC.player.isOpen()) NIC.player.close(true);
    report.push(`${m.id}: ${steps} steps, ${figs} with figures, ${qs} questions${runners ? `, ${runners} runner` : ""}${demo ? ", demo" : ""}`);
  }
  window.removeEventListener("error", onErr);
  window.removeEventListener("unhandledrejection", onErr);
  return { modules: mods.length, errors, report };
}
