import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import { copyFile, lstat, mkdir, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directories = ['.well-known', '2019', 'archives', 'css', 'fancybox', 'fonts', 'images', 'img', 'js', 'photoes', 'test'];
const files = ['tyinstall.html', 'main.0cf68a.css', 'main.0cf68a.js', 'mobile.992cbe.js', 'slider.e37972.js'];

export const legacyEntries = Object.freeze([
  ...directories.map((name) => Object.freeze({ source: name, target: name })),
  ...files.map((name) => Object.freeze({ source: name, target: name })),
  Object.freeze({ source: 'index.html', target: 'legacy/index.html' }),
]);

export function containedPath(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

export async function sha256(filename) {
  return createHash('sha256').update(await readFile(filename)).digest('hex');
}

async function assertNoSymlink(filename) {
  const stat = await lstat(filename);
  if (stat.isSymbolicLink()) throw new Error(`Symbolic links are not allowed: ${filename}`);
  return stat;
}

async function exists(filename) {
  try { await lstat(filename); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

export async function legacyFileRecords(root) {
  root = await realpath(root);
  const records = [];
  async function visit(source, target) {
    const absolute = path.resolve(root, source);
    if (!containedPath(root, absolute)) throw new Error(`Source escapes repository: ${source}`);
    const stat = await assertNoSymlink(absolute);
    if (stat.isDirectory()) {
      for (const name of (await readdir(absolute)).sort()) {
        await visit(path.join(source, name), path.join(target, name));
      }
    } else if (stat.isFile()) {
      records.push({ source, target, hash: await sha256(absolute) });
    } else {
      throw new Error(`Unsupported legacy file type: ${source}`);
    }
  }
  for (const entry of legacyEntries) await visit(entry.source, entry.target);
  return records;
}

export async function copyLegacy({ root, dist }) {
  root = await realpath(root);
  dist = path.resolve(dist);
  if (!containedPath(root, dist)) throw new Error('Output directory must be inside the repository');
  let segment = root;
  for (const name of path.relative(root, dist).split(path.sep)) {
    segment = path.join(segment, name);
    const stat = await assertNoSymlink(segment);
    if (!stat.isDirectory()) throw new Error(`Output path is not a directory: ${segment}`);
  }
  for (const entry of legacyEntries) {
    const source = path.resolve(root, entry.source);
    if (dist === source || containedPath(source, dist)) throw new Error('Output overlaps legacy source');
    const destination = path.resolve(dist, entry.target);
    if (!containedPath(dist, destination)) throw new Error('Destination escapes output directory');
    // Preflight every top-level destination before writing any legacy files.
    const top = path.join(dist, entry.target.split('/')[0]);
    if (await exists(top)) throw new Error(`Legacy destination collision: ${entry.target}`);
  }
  const records = await legacyFileRecords(root);
  for (const record of records) {
    const destination = path.resolve(dist, record.target);
    if (!containedPath(dist, destination)) throw new Error('Destination escapes output directory');
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(path.join(root, record.source), destination, constants.COPYFILE_EXCL);
    if (await sha256(destination) !== record.hash) throw new Error(`Legacy hash mismatch: ${record.target}`);
  }
  return records;
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  try {
    const records = await copyLegacy({ root, dist: path.join(root, 'docs/.vitepress/dist') });
    console.log(`Preserved ${records.length} legacy files; all SHA-256 hashes match.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
