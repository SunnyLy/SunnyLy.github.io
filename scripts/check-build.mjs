import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { knowledgeSections } from '../docs/.vitepress/navigation.ts';
import { containedPath, legacyFileRecords, sha256 } from './copy-legacy.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = await realpath(path.join(root, 'docs/.vitepress/dist'));
const forbiddenNames = new Set(['AGENTS.md', 'README.md', 'DESIGN.md', 'CNAME', '.git', '.github', 'planning', 'node_modules', 'package.json', 'package-lock.json', 'tsconfig.json']);
const forbiddenRoots = new Set(['docs', 'scripts', 'tests']);
const artifactFiles = [];

async function walk(directory) {
  for (const name of await readdir(directory)) {
    const absolute = path.join(directory, name);
    const relative = path.relative(dist, absolute);
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) throw new Error(`Artifact contains a symbolic link: ${relative}`);
    if (forbiddenNames.has(name) || forbiddenRoots.has(relative) || /\.(?:md|vue|ts|tsx|map)$/i.test(name)) {
      throw new Error(`Authoring source leaked into artifact: ${relative}`);
    }
    if (stat.isDirectory()) await walk(absolute);
    else artifactFiles.push(relative);
  }
}

function decodeAttribute(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');
}

function srcsetUrls(value) {
  const urls = [];
  let remaining = value;
  while (remaining) {
    remaining = remaining.replace(/^[\s,]+/, '');
    const match = remaining.match(/^\S+/);
    if (!match) break;
    const url = match[0];
    remaining = remaining.slice(url.length);
    urls.push(url.replace(/,+$/, ''));
    // A trailing comma ends a candidate without a descriptor. Data URLs may
    // contain commas internally, so splitting the entire value on commas is wrong.
    if (!url.endsWith(',')) {
      const separator = remaining.indexOf(',');
      remaining = separator === -1 ? '' : remaining.slice(separator + 1);
    }
  }
  return urls;
}

async function resolveReference(reference, page) {
  if (!reference || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference)) return null;
  const url = new URL(decodeAttribute(reference), `https://build.invalid/${page.split(path.sep).join('/')}`);
  let absolute = path.resolve(dist, `.${decodeURIComponent(url.pathname)}`);
  if (!containedPath(dist, absolute) && absolute !== dist) throw new Error(`Reference escapes artifact: ${reference}`);
  if (absolute === dist || (await lstat(absolute)).isDirectory()) absolute = path.join(absolute, 'index.html');
  const stat = await lstat(absolute);
  if (!stat.isFile()) throw new Error(`Reference is not a file: ${reference}`);
  return absolute;
}

await walk(dist);
const legacy = await legacyFileRecords(root);
const legacyTargets = new Set(legacy.map((record) => path.normalize(record.target)));
for (const record of legacy) {
  if (await sha256(path.join(dist, record.target)) !== record.hash) {
    throw new Error(`Preserved file changed: ${record.target}`);
  }
}

const coreLinks = ['/', ...knowledgeSections.flatMap((section) => [section.link, ...section.items.map((item) => item.link)])];
for (const link of coreLinks) {
  const filename = await resolveReference(link, 'index.html');
  if (!filename?.endsWith('.html')) throw new Error(`Core page is not standalone HTML: ${link}`);
}

const newPages = artifactFiles.filter((name) => name.endsWith('.html') && !legacyTargets.has(name));
for (const page of newPages) {
  const html = await readFile(path.join(dist, page), 'utf8');
  // Restrict parsing to tags so bundled inline JavaScript cannot create false links.
  const tags = html.match(/<(?:a|img|script|link|source|video|audio|iframe)\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    for (const match of tag.matchAll(/\s(href|src|srcset|poster)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      const value = match[2] ?? match[3];
      const references = match[1].toLowerCase() === 'srcset' ? srcsetUrls(value) : [value];
      for (const reference of references) {
        try { await resolveReference(reference, page); }
        catch (error) { throw new Error(`Broken local reference in ${page}: ${reference} (${error.message})`); }
      }
    }
  }
}

console.log(`Verified ${newPages.length} generated HTML pages, ${legacy.length} preserved file hashes, and source exclusion.`);
