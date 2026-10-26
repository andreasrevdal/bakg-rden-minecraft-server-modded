// Checks pack/modrinth.index.json the way Fabric Loader would: every mod's "depends" and "breaks"
// against the jars that actually end up on the client and on the server.
//   node scripts/check.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const index = JSON.parse(fs.readFileSync(path.join(root, "pack/modrinth.index.json"), "utf8"));
const cacheDir = path.join(root, "dist/cache");
const JAVA = "21";
fs.mkdirSync(cacheDir, { recursive: true });

const tar = process.platform === "win32" ? "C:\\Windows\\System32\\tar.exe" : "bsdtar";
const unzip = (jar, member) => execFileSync(tar, ["-xOf", jar, member], { maxBuffer: 64e6 });
const list = (jar) => execFileSync(tar, ["-tf", jar], { encoding: "utf8", maxBuffer: 64e6 }).split(/\r?\n/);

// Reads fabric.mod.json from a jar and from every jar nested in it (META-INF/jars).
function modsIn(jar, tmp) {
  const names = list(jar);
  const out = [];
  if (names.includes("fabric.mod.json")) {
    // Some mods put raw newlines inside strings; Fabric tolerates that, JSON.parse does not.
    out.push(JSON.parse(unzip(jar, "fabric.mod.json").toString("utf8").replace(/[\r\n\t]+/g, " ")));
  }
  for (const n of names.filter((n) => /^META-INF\/jars\/.+\.jar$/.test(n))) {
    const nested = path.join(tmp, crypto.randomUUID() + ".jar");
    fs.writeFileSync(nested, unzip(jar, n));
    out.push(...modsIn(nested, tmp));
  }
  return out;
}

// Fabric version predicates: "*", ">=1.2", "<2", "~1.2", "^1.2", "1.21.x", "1.2 - 1.4", space = AND, array = OR.
const parse = (v) => {
  const [core, pre] = String(v).replace(/\+.*$/, "").split(/-(.*)/);
  return { nums: core.split(".").map((x) => (/^\d+$/.test(x) ? +x : x)), pre: pre ?? null };
};
function cmp(a, b) {
  const A = parse(a), B = parse(b);
  for (let i = 0; i < Math.max(A.nums.length, B.nums.length); i++) {
    const x = A.nums[i] ?? 0, y = B.nums[i] ?? 0;
    if (x === y) continue;
    if (typeof x === "number" && typeof y === "number") return x - y;
    return String(x).localeCompare(String(y));
  }
  if (A.pre === B.pre) return 0;
  if (A.pre === null) return 1;
  if (B.pre === null) return -1;
  return A.pre.localeCompare(B.pre, undefined, { numeric: true });
}
function matchOne(ver, pred) {
  pred = pred.trim();
  if (pred === "" || pred === "*") return true;
  const m = pred.match(/^(>=|<=|>|<|=|~|\^)?\s*(.+)$/);
  const [, op = "=", rawTarget] = m;
  if (/(^|\.)[xX*]$/.test(rawTarget)) {
    const prefix = rawTarget.replace(/\.?[xX*]$/, "");
    return parse(ver).nums.slice(0, prefix.split(".").length).join(".") === prefix;
  }
  const target = rawTarget;
  const c = cmp(ver, target);
  const t = parse(target).nums;
  switch (op) {
    case ">=": return c >= 0;
    case "<=": return c <= 0;
    case ">": return c > 0;
    case "<": return c < 0;
    case "~": return c >= 0 && parse(ver).nums[0] === t[0] && parse(ver).nums[1] === (t[1] ?? 0);
    case "^": return c >= 0 && parse(ver).nums[0] === t[0];
    default: return c === 0;
  }
}
function matches(ver, spec) {
  if (Array.isArray(spec)) return spec.length === 0 || spec.some((s) => matches(ver, s));
  const range = String(spec).match(/^(\S+)\s+-\s+(\S+)$/);
  if (range) return cmp(ver, range[1]) >= 0 && cmp(ver, range[2]) <= 0;
  return String(spec).split(/\s+/).every((p) => matchOne(ver, p));
}

const tmp = fs.mkdtempSync(path.join(cacheDir, "nested-"));
const jars = [];
for (const f of index.files) {
  const file = path.join(cacheDir, `${f.hashes.sha1}.jar`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, Buffer.from(await (await fetch(f.downloads[0])).arrayBuffer()));
  jars.push({ f, mods: modsIn(file, tmp) });
}
fs.rmSync(tmp, { recursive: true, force: true });

let problems = 0;
for (const sideName of ["client", "server"]) {
  const present = new Map([["minecraft", index.dependencies.minecraft], ["fabricloader", index.dependencies["fabric-loader"]], ["java", JAVA]]);
  const onSide = jars.filter((j) => j.f.env[sideName] !== "unsupported");
  for (const { mods } of onSide)
    // Fabric loads the newest copy when several jars (incl. nested ones) carry the same mod.
    for (const m of mods)
      for (const id of [m.id, ...(m.provides ?? [])])
        if (!present.has(id) || cmp(m.version, present.get(id)) > 0) present.set(id, m.version);
  for (const { f, mods } of onSide) {
    for (const m of mods) {
      // Client-only mods are skipped on a dedicated server by "environment": "client".
      if (m.environment && m.environment !== "*" && m.environment !== sideName) continue;
      for (const [dep, spec] of Object.entries(m.depends ?? {})) {
        const have = present.get(dep);
        if (have === undefined) console.log(`[${sideName}] ${m.id} needs ${dep} ${JSON.stringify(spec)} – missing (${path.basename(f.path)})`), problems++;
        else if (have !== "${version}" && !matches(have, spec)) console.log(`[${sideName}] ${m.id} needs ${dep} ${JSON.stringify(spec)} – have ${have}`), problems++;
      }
      for (const [dep, spec] of Object.entries(m.breaks ?? {})) {
        const have = present.get(dep);
        if (have !== undefined && matches(have, spec)) console.log(`[${sideName}] ${m.id} breaks ${dep} ${JSON.stringify(spec)} – have ${have}`), problems++;
      }
    }
  }
}
console.log(problems ? `${problems} problem(s)` : "OK: all depends/breaks satisfied on client and server");
process.exitCode = problems ? 1 : 0;
