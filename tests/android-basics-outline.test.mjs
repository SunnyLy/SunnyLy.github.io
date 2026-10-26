import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createMarkdownRenderer } from 'vitepress'
import { knowledgeSections } from '../docs/.vitepress/navigation.ts'

const source = JSON.parse(fs.readFileSync(new URL('../planning/android-basics-source-outline.json', import.meta.url), 'utf8'))
const coverage = JSON.parse(fs.readFileSync(new URL('../planning/android-basics-coverage.json', import.meta.url), 'utf8'))

test('Every captured Android basics paragraph is mapped or explicitly classified', async () => {
  assert.deepEqual(coverage.rows.map(r => r.sourceId), source.rows.map(r => r.key))
  assert.equal(new Set(coverage.rows.map(r => r.sourceId)).size, source.rows.length)
  assert.deepEqual(coverage.rows.filter(r => r.kind === 'excluded').map(r => r.sourceId), source.excludedAtUserRequest)
  const md = await createMarkdownRenderer(path.resolve('docs'))
  const rendered = new Map()
  for (const row of coverage.rows) {
    const original = source.rows.find(r => r.key === row.sourceId).text.replace(/[\uFEFF\u200B-\u200D]/g, '').trim()
    if (row.kind === 'blank') assert.equal(original, '')
    else if (row.kind === 'reference') assert.match(original, /^https:\/\//)
    else if (row.kind === 'context') assert.ok(['206', '218'].includes(row.sourceId))
    else if (row.kind === 'excluded') assert.ok(source.excludedAtUserRequest.includes(row.sourceId))
    else assert.equal(row.kind, 'knowledge', `Unclassified paragraph ${row.sourceId}`)
    if (row.kind === 'knowledge' || row.kind === 'context') assert.equal(typeof row.target, 'string', `Missing destination ${row.sourceId}`)
    if (!row.target) continue
    const [route, anchor] = row.target.split('#')
    assert.ok(route.startsWith('/android/basics/'))
    const file = route.endsWith('/') ? `${route}index.md` : route.replace(/\.html$/, '.md')
    if (!rendered.has(file)) rendered.set(file, md.render(fs.readFileSync(path.join('docs', file), 'utf8')))
    if (anchor) assert.ok(rendered.get(file).includes(`id="${anchor}"`), `${row.sourceId}: ${row.target}`)
  }
  // Descendants must remain in the article for their original topic.
  const byId = new Map(coverage.rows.map(r => [r.sourceId, r]))
  for (const ids of [[65,68,71,74,77,80,83],[89,120,130,133,136],[145,148,151,154],[166,169,182,185,188,191],[203,206,209,212,215,218,221],[233,250,253,256,262,265,268,271]]) {
    const routes = ids.map(id => byId.get(String(id)).target.split('#')[0])
    assert.ok(routes.every(route => route === routes[0]), `Moved descendant in source group ${ids[0]}`)
  }
})

test('Android basics navigation includes all active topics in source order', () => {
  const basics = knowledgeSections.find(s => s.id === 'android').items.filter(i => i.group === '基础')
  assert.deepEqual(basics.map(i => i.link), [
    '/android/basics/',
    ...['binder-basics','ipc-methods','handler','job-scheduler','messenger','view-touch','activity-startup','broadcast','service-lifecycle','content-provider','system-services'].map(s => `/android/basics/${s}.html`),
    ...['ams-atms','pms','wms','content-service','package-installer-service'].map(s => `/android/basics/system-services/${s}.html`),
    ...['pending-intent','loaded-apk','class-loading','dynamic-proxy','apk-signing'].map(s => `/android/basics/${s}.html`),
  ])
  assert.deepEqual(basics.filter(i => i.subgroup).map(i => i.subgroup), [
    ...Array(4).fill('四大组件'),
    ...Array(6).fill('系统核心服务'),
  ])
  assert.ok(basics.every(i => !/frida|strace/i.test(i.text + i.link)))
})
