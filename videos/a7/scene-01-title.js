/* Phase 7 · Information Theory & Compression (algo-7), scene 01-title: the title card (4 s). Same look as VID.titleCard (cards.js), but
   written out here because the phase name "Information Theory & Compression" is too long for one line: two 80 px lines. */
(function () {
  const V = window.VID;
  const { h, place, ramp, ease } = V;
  V.scene({
    bare: true,
    dur: 4,
    build(stage) {
      const mascot = V.mascot("byte", { size: 280, mood: "happy" });
      mascot.style.left = "400px";
      mascot.style.top = "130px";
      const k = h("div", {
        class: "v-kicker",
        text: "Algorithms · Phase 7",
        style: { left: "0", width: "1080px", top: "464px", textAlign: "center", fontSize: "30px" },
      });
      const line = (text, top) =>
        h("div", {
          class: "v-title-line",
          text,
          style: {
            position: "absolute",
            left: "0",
            width: "1080px",
            top: `${top}px`,
            textAlign: "center",
            whiteSpace: "nowrap",
            fontSize: "80px",
            lineHeight: "1.05",
          },
        });
      const t1 = line("Information Theory", 512);
      const t2 = line("& Compression", 598);
      const s = h("div", {
        class: "v-text dim",
        text: "How files get smaller",
        style: {
          left: "0",
          width: "1080px",
          top: "722px",
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
      stage.append(mascot, k, t1, t2, s, pill);
      return (lt) => {
        const m = ramp(lt, 0.1, 0.9, ease.pop);
        place(mascot, { y: (1 - m) * 40, s: 0.6 + 0.4 * m, o: ramp(lt, 0.1, 0.4) });
        place(k, { y: (1 - ramp(lt, 0.5, 0.9)) * 14, o: ramp(lt, 0.5, 0.9) });
        place(t1, { y: (1 - ramp(lt, 0.6, 1.1)) * 26, o: ramp(lt, 0.6, 1.1) });
        place(t2, { y: (1 - ramp(lt, 0.72, 1.22)) * 26, o: ramp(lt, 0.72, 1.22) });
        place(s, { y: (1 - ramp(lt, 1.0, 1.5)) * 18, o: ramp(lt, 1.0, 1.5) });
        place(pill, { s: 0.8 + 0.2 * ramp(lt, 1.3, 1.8, ease.pop), o: ramp(lt, 1.3, 1.6) });
      };
    },
  });
})();
