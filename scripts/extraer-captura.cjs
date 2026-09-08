// Decodifica el data-URL PNG que javascript_tool vuelca a un .txt cuando
// supera el límite de tokens, y lo guarda como imagen real.
// Uso: node extraer-captura.js <archivo-tool-result.txt> <salida.png>
const fs = require("fs");
const [, , inPath, outPath] = process.argv;
const raw = fs.readFileSync(inPath, "utf8");
const arr = JSON.parse(raw);
let t = arr[0].text.trim();
if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1);
const b64 = t.replace(/^data:image\/png;base64,/, "");
const buf = Buffer.from(b64, "base64");
fs.writeFileSync(outPath, buf);
console.log("saved", outPath, "bytes:", buf.length);
