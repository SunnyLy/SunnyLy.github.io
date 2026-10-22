// Shared by MiniSearch at build time and in the browser. Avoid locale-dependent
// segmentation so an older mobile browser uses the same index vocabulary.
export function tokenize(text) {
  const runs = String(text).normalize('NFKC').toLowerCase().match(/[\p{Script=Han}]+|(?:(?!\p{Script=Han})[\p{L}\p{N}_])+/gu) || []
  return runs.flatMap((run) => {
    if (!/^\p{Script=Han}+$/u.test(run)) return [run]
    const chars = Array.from(run)
    return chars.length < 2 ? chars : chars.slice(0, -1).map((char, index) => char + chars[index + 1])
  })
}
