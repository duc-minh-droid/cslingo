import { serve, launch } from "/home/user/cslingo/tools/video-lib.js";
const { server, base } = await serve(); const b = await launch();
const p = await b.newPage(); p.on("pageerror", e=>console.log("ERR", e.message)); p.on("console", m=>console.log("C", m.text()));
await p.goto(base + "/videos/lecture-2.html?rec=1"); await p.waitForTimeout(4000); await b.close(); server.close();
