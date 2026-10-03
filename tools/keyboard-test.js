/* Keyboard checks that need real key presses, so they run from Node (Playwright) instead of inside the page.
   The lesson player's shortcuts (Enter = Check / Continue, ← = back) must not hijack keys that belong to a figure or a demo:
   with a control focused by keyboard inside one, Enter has to press that control and the arrows have to move a plan dot. */
export async function keyboardChecks(page) {
  const problems = [];
  const key = () => page.evaluate(() => (NIC.player.isOpen() ? NIC.player.state().key : "closed"));

  /* Open a module and walk it (answering questions) until a screen contains `stop`. */
  const openUntil = (id, stop) =>
    page.evaluate(
      async ([id, stop]) => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        if (NIC.player.isOpen()) NIC.player.close(true);
        localStorage.removeItem("nic.lessonPos");
        location.hash = "#home"; // opening the player needs a hash change
        await wait(150);
        location.hash = id;
        await wait(500);
        for (let i = 0; i < 60 && NIC.player.isOpen(); i++) {
          const screen = document.querySelector(".pl-screen:not(.leaving)");
          if (stop && screen && screen.querySelector(stop)) break;
          const st = NIC.player.state();
          if (st.Q && /check/.test(st.foot)) await answerCurrent();
          else if (!stop) break;
          else document.querySelector(".pl-go").click();
          await wait(40);
        }
        await wait(500);
        return NIC.player.isOpen();
      },
      [id, stop],
    );

  // 1. a runner's own buttons: Enter presses Play and the lesson stays on its step
  if (!(await openUntil("a2-dijkstra", ".rn"))) problems.push("could not open the runner step");
  else {
    const before = await key();
    const label = () =>
      page.evaluate(() => document.querySelector(".pl-screen:not(.leaving) .rn-play")?.getAttribute("aria-label"));
    await page.evaluate(() => document.querySelector(".pl-screen:not(.leaving) .rn-play").focus());
    const play = await label();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(250);
    if ((await key()) !== before) problems.push("Enter on a runner button also moved the lesson on");
    if ((await label()) === play) problems.push("Enter on a runner button did not press it");
  }

  // 2. a workshop: arrows move the plan dot (also ←), Enter toggles the demand cap, and the workshop stays open
  if (!(await openUntil("a3-lab", ".aw3-svg"))) problems.push("could not open the corner-hunt workshop");
  else {
    const before = await key();
    const dot = () => page.evaluate(() => document.querySelector("[data-pi]").parentElement.style.transform);
    await page.evaluate(() => document.querySelector("[data-pi]").focus());
    const start = await dot();
    await page.keyboard.press("ArrowRight");
    const right = await dot();
    await page.keyboard.press("ArrowLeft");
    if (right === start) problems.push("→ did not move the plan dot");
    if ((await dot()) === right) problems.push("← did not move the plan dot");
    await page.evaluate(() => document.querySelector("[data-cap]").focus());
    await page.keyboard.press("Enter");
    if ((await page.getAttribute("[data-cap]", "aria-pressed")) !== "true")
      problems.push("Enter did not toggle the cap");
    if ((await key()) !== before) problems.push("← or Enter inside the workshop moved the lesson");
  }

  // 3. everywhere else the shortcut still works: Enter on a plain lesson step continues
  if (!(await openUntil("l1-what", null))) problems.push("could not open a lesson");
  else {
    const before = await key();
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    if ((await key()) === before) problems.push("Enter no longer continues a lesson step");
  }

  // 4. a control you clicked with the mouse doesn't capture Enter: it still continues, as it always did
  if (!(await openUntil("a2-dijkstra", ".rn"))) problems.push("could not open the runner step again");
  else {
    const before = await key();
    await page.click(".pl-screen:not(.leaving) .rn-play");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    if ((await key()) === before) problems.push("Enter after clicking a runner button no longer continues");
  }

  await page.evaluate(() => NIC.player.isOpen() && NIC.player.close(true));
  return problems;
}
