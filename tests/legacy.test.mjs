import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { copyLegacy, legacyEntries, legacyFileRecords, sha256 } from '../scripts/copy-legacy.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sunny-legacy-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const entry of legacyEntries) {
    const isFile = path.extname(entry.source) !== '';
    const filename = path.join(root, entry.source, ...(isFile ? [] : ['example.txt']));
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, `original:${entry.source}`, 'utf8');
  }
  await writeFile(path.join(root, 'AGENTS.md'), 'private authoring instructions');
  const dist = path.join(root, 'output');
  await mkdir(dist);
  await writeFile(path.join(dist, 'index.html'), '<h1>New knowledge base</h1>');
  return { root, dist };
}

test('copies exact allowlist with matching bytes and preserves source and new homepage', async (t) => {
  const { root, dist } = await fixture(t);
  const before = await legacyFileRecords(root);
  const records = await copyLegacy({ root, dist });
  assert.deepEqual(records, before);
  for (const record of records) {
    assert.equal(await sha256(path.join(dist, record.target)), record.hash);
    assert.equal(await sha256(path.join(root, record.source)), record.hash);
  }
  assert.equal(await readFile(path.join(dist, 'index.html'), 'utf8'), '<h1>New knowledge base</h1>');
  assert.equal(await readFile(path.join(dist, 'legacy/index.html'), 'utf8'), 'original:index.html');
  await assert.rejects(lstat(path.join(dist, 'AGENTS.md')), { code: 'ENOENT' });
});

test('rejects destination collisions before copying any legacy files', async (t) => {
  const { root, dist } = await fixture(t);
  const protectedFile = path.join(dist, 'tyinstall.html');
  await writeFile(protectedFile, 'new content');
  await assert.rejects(copyLegacy({ root, dist }), /collision/);
  assert.equal(await readFile(protectedFile, 'utf8'), 'new content');
  assert.deepEqual((await readdir(dist)).sort(), ['index.html', 'tyinstall.html']);
  assert.equal(await readFile(path.join(root, 'tyinstall.html'), 'utf8'), 'original:tyinstall.html');
});

test('rejects symbolic links within allowlisted directories', async (t) => {
  const { root, dist } = await fixture(t);
  // Directory junctions work on Windows without file-symlink developer privileges.
  await symlink(path.join(root, 'images'), path.join(root, 'js', 'linked-assets'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(copyLegacy({ root, dist }), /Symbolic links/);
  assert.deepEqual(await readdir(dist), ['index.html']);
});

test('rejects output outside repository and output redirected through a symbolic link', async (t) => {
  const { root, dist } = await fixture(t);
  await assert.rejects(copyLegacy({ root, dist: path.resolve(root, '..') }), /inside the repository/);
  const redirected = path.join(root, 'redirected');
  await symlink(dist, redirected, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(copyLegacy({ root, dist: redirected }), /Symbolic links/);
  assert.equal(await readFile(path.join(root, 'index.html'), 'utf8'), 'original:index.html');
});
