let queue: Promise<void> = Promise.resolve()
let sequence = 0

/** Mermaid owns global configuration; keep configuration and rendering serial. */
export function renderDiagram(source: string, dark: boolean): Promise<string> {
  const task = queue.then(async () => {
    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: dark ? 'dark' : 'default',
      htmlLabels: false,
    })
    const result = await mermaid.render(`knowledge-diagram-${++sequence}`, source)
    return result.svg
  })
  queue = task.then(() => undefined, () => undefined)
  return task
}
