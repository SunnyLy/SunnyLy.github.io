import test from 'node:test'
import assert from 'node:assert/strict'
import { tokenize } from '../docs/.vitepress/search.mjs'

test('Chinese body phrases share index tokens with partial queries', () => {
  const body = tokenize('记录跨进程通信的证据链，与 Android Binder 关联。')
  for (const token of tokenize('跨进程通信')) assert.ok(body.includes(token))
  for (const token of tokenize('证据链')) assert.ok(body.includes(token))
})

test('Mixed technical queries are stable across case, width, and punctuation', () => {
  assert.deepEqual(tokenize('ＡＮＤＲＯＩＤ / Binder_1'), ['android', 'binder_1'])
  assert.deepEqual(tokenize('中文 Android API 34'), ['中文', 'android', 'api', '34'])
  assert.deepEqual(tokenize(''), [])
  const body = tokenize('Binder跨进程通信与Android权限检查')
  for (const token of tokenize('跨进程通信')) assert.ok(body.includes(token))
  for (const token of tokenize('权限检查')) assert.ok(body.includes(token))
  assert.ok(body.includes('binder'))
  assert.ok(body.includes('android'))
})
