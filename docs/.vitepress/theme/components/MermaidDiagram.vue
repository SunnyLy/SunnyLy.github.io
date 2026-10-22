<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { closeMedia, openMedia, state } from '../media'
import { renderDiagram } from '../mermaid-render'

const props = withDefaults(defineProps<{ source: string; title?: string }>(), {
  title: '流程图',
})
const { isDark } = useData()
const sourceText = computed(() => {
  try { return decodeURIComponent(props.source) }
  catch { return props.source }
})
const svg = ref('')
const loading = ref(true)
const error = ref('')
const trigger = ref<HTMLButtonElement>()
let mounted = false
let generation = 0

function view() {
  if (!svg.value) return
  openMedia({ kind: 'diagram', svg: svg.value, title: props.title, trigger: trigger.value })
}

async function render() {
  if (!mounted) return
  const current = ++generation
  loading.value = true
  error.value = ''
  try {
    const nextSvg = await renderDiagram(sourceText.value, isDark.value)
    if (!mounted || current !== generation) return
    svg.value = nextSvg
    if (state.value?.trigger === trigger.value && state.value?.kind === 'diagram') view()
  } catch {
    if (!mounted || current !== generation) return
    svg.value = ''
    error.value = '流程图暂时无法渲染，请查看下方源码。'
    if (state.value?.trigger === trigger.value) closeMedia()
  } finally {
    if (mounted && current === generation) loading.value = false
  }
}

onMounted(() => { mounted = true; void render() })
watch([sourceText, isDark], () => { void render() })
onBeforeUnmount(() => {
  mounted = false
  generation++
  if (state.value?.trigger === trigger.value) closeMedia()
})
</script>

<template>
  <figure class="diagram-block" :aria-label="title">
    <div class="diagram-heading">
      <span>{{ title }}</span>
      <button ref="trigger" type="button" :disabled="!svg" @click="view">
        放大查看 <span aria-hidden="true">↗</span>
      </button>
    </div>
    <p v-if="loading" class="diagram-status" role="status">正在加载流程图…</p>
    <p v-if="error" class="diagram-error" role="status">{{ error }}</p>
    <div v-if="svg" class="diagram-preview" role="img" :aria-label="title" v-html="svg" />
    <details :open="!!error" class="diagram-source">
      <summary>查看 Mermaid 源码</summary>
      <pre><code>{{ sourceText }}</code></pre>
    </details>
    <noscript><p>启用 JavaScript 后可查看图示，源码见上方。</p></noscript>
  </figure>
</template>

<style scoped>
.diagram-block { margin: 28px 0; overflow: hidden; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); }
.diagram-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--vp-c-divider); font-size: 12px; font-weight: 600; color: var(--vp-c-text-2); }
.diagram-heading button { min-height: 36px; padding: 0 10px; border: 1px solid var(--vp-c-divider); border-radius: 7px; color: var(--vp-c-brand-1); background: var(--vp-c-bg); font: inherit; cursor: pointer; }
.diagram-heading button:disabled { opacity: .45; cursor: wait; }
.diagram-heading button:focus-visible, summary:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.diagram-preview { padding: 24px 12px; overflow: auto; text-align: center; }
.diagram-preview :deep(svg) { display: block; max-width: 100%; height: auto; margin: auto; }
.diagram-source { padding: 12px 16px; border-top: 1px solid var(--vp-c-divider); font-size: 12px; color: var(--vp-c-text-2); }
.diagram-source summary { cursor: pointer; }
.diagram-source pre { max-width: 100%; margin: 12px 0 0; overflow: auto; white-space: pre; line-height: 1.7; }
.diagram-status, .diagram-error { padding: 16px; margin: 0; font-size: 13px; color: var(--vp-c-text-2); }
.diagram-error { color: var(--vp-c-danger-1); }
</style>
