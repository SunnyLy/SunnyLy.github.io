import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { androidSecurityOutline } from '../docs/.vitepress/android-security-outline.ts'
import { knowledgeSections } from '../docs/.vitepress/navigation.ts'

function flatten(items, depth = 1) {
  return items.flatMap(item => [{ ...item, depth }, ...flatten(item.items || [], depth + 1)])
}

function headings(markdown) {
  let fence = false
  return markdown.split('\n').flatMap(line => {
    if (/^```/.test(line)) fence = !fence
    if (fence) return []
    const match = line.match(/^(#{1,4}) (.+?)(?: \{#([^}]+)\})?$/)
    return match ? [{ depth: match[1].length, text: match[2], anchor: match[3] }] : []
  })
}

test('Android security chapters preserve every original paragraph in order', () => {
  const source = fs.readFileSync(new URL('../planning/android-security-source.md', import.meta.url), 'utf8')
  const expected = [...source.matchAll(/\*\*S(\d+)\*\*/g)].map(match => +match[1])
  const actual = flatten(androidSecurityOutline).map(item => item.id)
  assert.deepEqual(actual, expected)
  assert.equal(new Set(actual).size, expected.length)
  assert.deepEqual(androidSecurityOutline.map(item => item.text), ['通用组件安全', '配置安全', '文件操作', '特殊函数', 'Dos攻击'])
})

test('Every navigation label has a matching heading in the same chapter', () => {
  for (const chapter of androidSecurityOutline) {
    const file = new URL('../docs' + chapter.link.replace(/\.html$/, '.md'), import.meta.url)
    const markdown = fs.readFileSync(file, 'utf8')
    assert.match(markdown, /^outline: \[2, 4\]$/m)
    const expected = flatten([chapter])
    const actual = headings(markdown)
    assert.equal(actual.length, expected.length, chapter.text)
    expected.forEach((item, index) => {
      assert.equal(item.link.split('#')[0], chapter.link, item.text)
      assert.equal(actual[index].text, item.text, item.text)
      assert.equal(actual[index].depth, item.depth, item.text)
      if (index) assert.equal('#' + actual[index].anchor, '#' + item.link.split('#')[1], item.text)
    })
  }
})

test('Active article navigation and coverage use the five chapter destinations', () => {
  const security = knowledgeSections.find(section => section.id === 'security')
  assert.deepEqual(security.items.map(item => item.link), androidSecurityOutline.map(item => item.link))
  const coverage = fs.readFileSync(new URL('../docs/security/android/coverage.md', import.meta.url), 'utf8')
  const rows = new Map(coverage.split('\n').flatMap(line => {
    const match = line.match(/^\| S(\d+) \|/)
    return match ? [[+match[1], line.split(' | ')[2]]] : []
  }))
  const all = flatten(androidSecurityOutline)
  assert.equal(rows.size, all.length)
  for (const item of all) assert.equal(rows.get(item.id), `[${item.text}](${item.link})`)
})
