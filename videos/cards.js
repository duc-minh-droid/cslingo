/* The title card and the recap card every lecture video opens and closes with.
     VID.titleCard({ kicker: "Lecture 5", title: "Encodings", sub: "...", who: "sprout", dur: 4 })
     VID.recapCard({ title: "Remember", who: "sprout", dur: 9, points: [{ head: "Check it is valid", body: "...", tone: "green" }], next: "Try Workshop 5.W" })
   Both are bare scenes (full 1080 x 1080, no headline or caption). Tones: green, blue, red, orange, purple. */
(function () {
  const V = window.VID;
  const { h, place, ramp, ease } = V;

  V.titleCard = ({ kicker, title, sub, who = "sprout", dur = 4 }) =>
    V.scene({
      bare: true,
      dur,
      build(stage) {
        const mascot = V.mascot(who, { size: 300, mood: "happy" });
        mascot.style.left = "390px";
        mascot.style.top = "170px";
        const k = h("div", {
          class: "v-kicker",
          text: kicker,
          style: { left: "0", width: "1080px", top: "520px", textAlign: "center", fontSize: "30px" },
        });
        const t = h("div", {
          class: "v-title-line",
          text: title,
          style: {
            position: "absolute",
            left: "0",
            width: "1080px",
            top: "568px",
            textAlign: "center",
            fontSize: title.length > 14 ? "92px" : "116px",
            lineHeight: "1.05",
          },
        });
        const s = h("div", {
          class: "v-text dim",
          text: sub,
          style: {
            left: "0",
            width: "1080px",
            top: "720px",
            textAlign: "center",
            whiteSpace: "normal",
            fontSize: "40px",
          },
        });
        const pill = h("div", {
          class: "v-tag solid c-green",
          text: "CSLingo · explainer",
          style: { left: "400px", top: "850px" },
        });
        stage.append(mascot, k, t, s, pill);
        return (lt) => {
          const m = ramp(lt, 0.1, 0.9, ease.pop);
          place(mascot, { y: (1 - m) * 40, s: 0.6 + 0.4 * m, o: ramp(lt, 0.1, 0.4) });
          place(k, { y: (1 - ramp(lt, 0.5, 0.9)) * 14, o: ramp(lt, 0.5, 0.9) });
          place(t, { y: (1 - ramp(lt, 0.6, 1.1)) * 26, o: ramp(lt, 0.6, 1.1) });
          place(s, { y: (1 - ramp(lt, 0.9, 1.4)) * 18, o: ramp(lt, 0.9, 1.4) });
          place(pill, { s: 0.8 + 0.2 * ramp(lt, 1.2, 1.7, ease.pop), o: ramp(lt, 1.2, 1.5) });
        };
      },
    });

  V.recapCard = ({ title = "Remember", who = "sprout", dur = 9, points, next }) =>
    V.scene({
      bare: true,
      dur,
      build(stage) {
        const head = h("div", {
          class: "v-title-line",
          text: title,
          style: { position: "absolute", left: "72px", top: "96px", fontSize: "76px" },
        });
        const mascot = V.mascot(who, { size: 150, mood: "love" });
        mascot.style.left = "858px";
        mascot.style.top = "70px";
        stage.append(head, mascot);
        const rows = points.map((p, i) => {
          const top = 280 + i * 190;
          const card = h("div", {
            class: `v-card plain c-${p.tone || "green"}`,
            style: { left: "72px", top: `${top}px`, width: "936px", height: "158px" },
          });
          const badge = h("div", {
            class: `v-gene solid c-${p.tone || "green"}`,
            text: String(i + 1),
            style: { left: "28px", top: "27px", width: "96px", height: "96px", fontSize: "52px" },
          });
          const hd = h("div", {
            class: "v-text big",
            text: p.head,
            style: { left: "156px", top: "26px", fontSize: "42px" },
          });
          const bd = h("div", {
            class: "v-text dim",
            text: p.body,
            style: { left: "156px", top: "84px", fontSize: "30px", whiteSpace: "normal", width: "750px" },
          });
          card.append(badge, hd, bd);
          stage.append(card);
          return card;
        });
        const cta = next
          ? h("div", {
              class: "v-tag solid c-blue",
              text: next,
              style: { left: "72px", top: "900px", fontSize: "34px", padding: "10px 28px 12px" },
            })
          : null;
        if (cta) stage.append(cta);
        return (lt) => {
          place(head, { y: (1 - ramp(lt, 0.1, 0.6)) * 20, o: ramp(lt, 0.1, 0.6) });
          place(mascot, { s: 0.7 + 0.3 * ramp(lt, 0.2, 0.9, ease.pop), o: ramp(lt, 0.2, 0.5) });
          rows.forEach((r, i) => {
            const a = 0.8 + i * 1.1;
            const k = ramp(lt, a, a + 0.5);
            place(r, { y: (1 - k) * 36, o: k });
          });
          if (cta) place(cta, { s: 0.85 + 0.15 * ramp(lt, 4.6, 5.2, ease.pop), o: ramp(lt, 4.6, 5) });
        };
      },
    });
})();
