/* Shared by smoke.js and boss-test.js: answer the player's current question correctly through the real UI.
   Load this file first. answerCurrent() returns after pressing CHECK. */
async function answerCurrent() {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const st = NIC.player.state(), Q = st.Q;
  if (!Q) return false;
  const body = $(".pl-screen:not(.leaving) .pl-body");
  const t = Q.type || "mcq";
  if (t === "mcq") $$(".opt", body)[Q.a].click();
  else if (t === "multi") Q.a.forEach((k) => $$(".opt", body)[k].click());
  else if (t === "num") { const inp = $("input", body); inp.value = Q.ans; inp.dispatchEvent(new Event("input")); }
  else if (t === "slider") { const r = $("input", body); r.value = Q.ans; r.dispatchEvent(new Event("input")); }
  else if (t === "order") Q.items.forEach((_, k) => $(`.qo-pool [data-i="${k}"]`, body).click());
  else if (t === "match") Q.pairs.forEach((_, k) => { $(`.qm-l[data-k="${k}"]`, body).click(); $(`.qm-r[data-i="${k}"]`, body).click(); });
  else if (t === "cat") $$(".qc-row", body).forEach((r, k) => $$("button", r)[Q.items[k][1]].click());
  else if (t === "pick") [].concat(Q.a).forEach((id) => $(`[data-pick="${id}"]`, body).dispatchEvent(new MouseEvent("click", { bubbles: true })));
  else if (t === "bug") $$(".qc-line", body)[Q.a].click();
  await wait(40);
  const go = $(".pl-go");
  if (go.disabled) throw new Error(`CHECK stayed disabled for a ${t} question`);
  go.click();
  await wait(60);
  return /f-ok/.test($(".pl-foot").className);
}
