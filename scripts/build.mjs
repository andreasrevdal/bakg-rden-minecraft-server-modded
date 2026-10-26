// Builds the Bakgården modpack from pack/mods.json.
//   node scripts/build.mjs            -> dist/bakgarden.mrpack (from lockfile, resolves it if missing)
//   node scripts/build.mjs --update   -> re-resolve newest versions into pack/modrinth.index.json first
//   node scripts/build.mjs --server   -> also download server-side jars + overrides into dist/server/
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const cfg = JSON.parse(fs.readFileSync(path.join(root, "pack/mods.json"), "utf8"));
const lockPath = path.join(root, "pack/modrinth.index.json");
const overrides = path.join(root, "pack/overrides");
const dist = path.join(root, "dist");
const args = process.argv.slice(2);
const API = "https://api.modrinth.com/v2";
const UA = { "User-Agent": "bakgarden-modpack-builder" };

async function get(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

// pin: optional text the version number must contain ("sodium@0.6.13" in mods.json).
async function latestVersion(projectId, pin) {
  const q = `loaders=${encodeURIComponent(JSON.stringify([cfg.loader]))}&game_versions=${encodeURIComponent(JSON.stringify([cfg.minecraft]))}`;
  const versions = (await get(`${API}/project/${projectId}/version?${q}`)).filter((v) => !pin || v.version_number.includes(pin));
  if (!versions.length) throw new Error(`${projectId} has no ${cfg.loader} ${cfg.minecraft} version${pin ? ` matching ${pin}` : ""}`);
  return versions.find((v) => v.version_type === "release") ?? versions[0];
}

const side = (s) => (s === "unsupported" ? "unsupported" : s === "optional" ? "optional" : "required");

async function resolve() {
  const wanted = Object.values(cfg.mods).flat();
  const seen = new Map(); // project_id -> { project, version }
  const incompatible = [];
  const edges = []; // [parent project id, required dependency project id]
  const pins = new Map(wanted.map((w) => w.split("@")));
  const queue = [...pins.keys()];
  while (queue.length) {
    const id = queue.shift();
    const project = await get(`${API}/project/${id}`);
    if (seen.has(project.id)) continue;
    const version = await latestVersion(project.id, pins.get(project.slug) ?? pins.get(id));
    seen.set(project.id, { project, version, env: { client: side(project.client_side), server: side(project.server_side) } });
    console.log(`  ${project.slug} ${version.version_number}`);
    for (const d of version.dependencies) {
      if (!d.project_id) continue;
      if (d.dependency_type === "required") queue.push(d.project_id), edges.push([project.id, d.project_id]);
      if (d.dependency_type === "incompatible") incompatible.push([project.slug, d.project_id]);
    }
  }
  for (const [slug, other] of incompatible)
    if (seen.has(other)) console.warn(`WARNING: ${slug} is incompatible with ${seen.get(other).project.slug}`);
  // A library must be installed on every side its dependents run on, whatever its own project page says.
  for (let changed = true; changed; ) {
    changed = false;
    for (const [p, c] of edges) {
      const parent = seen.get(p).env, child = seen.get(c)?.env;
      if (!child) continue;
      for (const s of ["client", "server"])
        if (parent[s] !== "unsupported" && child[s] === "unsupported") (child[s] = "required"), (changed = true);
    }
  }

  const loaders = await get(`https://meta.fabricmc.net/v2/versions/loader/${cfg.minecraft}`);
  const files = [...seen.values()]
    .sort((a, b) => a.project.slug.localeCompare(b.project.slug))
    .map(({ version, env }) => {
      const f = version.files.find((x) => x.primary) ?? version.files[0];
      return {
        path: `mods/${f.filename}`,
        hashes: { sha1: f.hashes.sha1, sha512: f.hashes.sha512 },
        env,
        downloads: [f.url],
        fileSize: f.size,
      };
    });
  return {
    formatVersion: 1,
    game: "minecraft",
    versionId: cfg.version,
    name: cfg.name,
    files,
    dependencies: { minecraft: cfg.minecraft, "fabric-loader": loaders.find((l) => l.loader.stable).loader.version },
  };
}

if (args.includes("--update") || !fs.existsSync(lockPath)) {
  console.log("Resolving mods...");
  fs.writeFileSync(lockPath, JSON.stringify(await resolve(), null, 2) + "\n");
}
const index = JSON.parse(fs.readFileSync(lockPath, "utf8"));

// mrpack = zip of modrinth.index.json + overrides/
const stage = path.join(dist, "mrpack");
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });
fs.copyFileSync(lockPath, path.join(stage, "modrinth.index.json"));
if (fs.existsSync(overrides)) fs.cpSync(overrides, path.join(stage, "overrides"), { recursive: true });
const out = path.join(dist, "bakgarden.mrpack");
fs.rmSync(out, { force: true });
// Windows' built-in bsdtar can write zip; elsewhere use `zip` (preinstalled on GitHub runners).
if (process.platform === "win32") execFileSync("C:\\Windows\\System32\\tar.exe", ["--format", "zip", "-cf", out, "-C", stage, "."]);
else execFileSync("zip", ["-qr", out, "."], { cwd: stage });
console.log(`Wrote ${path.relative(root, out)} (${index.files.length} mods)`);

if (args.includes("--server")) {
  const serverDir = path.join(dist, "server");
  fs.rmSync(path.join(serverDir, "mods"), { recursive: true, force: true });
  fs.mkdirSync(path.join(serverDir, "mods"), { recursive: true });
  for (const f of index.files.filter((f) => f.env.server !== "unsupported")) {
    const buf = Buffer.from(await (await fetch(f.downloads[0], { headers: UA })).arrayBuffer());
    if (crypto.createHash("sha1").update(buf).digest("hex") !== f.hashes.sha1) throw new Error(`hash mismatch: ${f.path}`);
    fs.writeFileSync(path.join(serverDir, f.path), buf);
  }
  if (fs.existsSync(overrides)) fs.cpSync(overrides, serverDir, { recursive: true });
  if (fs.existsSync(path.join(root, "server"))) fs.cpSync(path.join(root, "server"), serverDir, { recursive: true });
  console.log(`Server files in ${path.relative(root, serverDir)}/ — upload via SFTP`);
}
