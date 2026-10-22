<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { closeMedia, state } from '../media'

const dialog = ref<HTMLDialogElement>()
const stage = ref<HTMLDivElement>()
const canvas = ref<HTMLDivElement>()
const closeButton = ref<HTMLButtonElement>()
const width = ref(800)
const height = ref(500)
const fit = ref(1)
const zoom = ref(1)
const x = ref(0)
const y = ref(0)
const failed = ref(false)
const viewportFull = ref(false)
const nativeFull = ref(false)
const pointers = new Map<number, { x: number; y: number }>()
let resizeObserver: ResizeObserver | undefined
let previousOverflow: string | undefined
let mounted = false
let openGeneration = 0
const full = computed(() => viewportFull.value || nativeFull.value)
const transform = computed(() => `translate(-50%, -50%) translate(${x.value}px, ${y.value}px) scale(${fit.value * zoom.value})`)

function measure() {
  if (!stage.value) return
  const rect = stage.value.getBoundingClientRect()
  fit.value = Math.min(Math.max(1, rect.width - 32) / width.value, Math.max(1, rect.height - 32) / height.value, 1)
}

function reset() {
  zoom.value = 1
  x.value = 0
  y.value = 0
  clearPointers()
  measure()
}

function zoomAt(value: number, clientX?: number, clientY?: number) {
  const next = Math.min(16, Math.max(.25, value))
  const rect = stage.value?.getBoundingClientRect()
  const anchorX = rect && clientX !== undefined ? clientX - rect.left - rect.width / 2 : 0
  const anchorY = rect && clientY !== undefined ? clientY - rect.top - rect.height / 2 : 0
  const ratio = next / zoom.value
  x.value = anchorX - (anchorX - x.value) * ratio
  y.value = anchorY - (anchorY - y.value) * ratio
  zoom.value = next
}

function onWheel(event: WheelEvent) {
  event.preventDefault()
  zoomAt(zoom.value * Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * .006), event.clientX, event.clientY)
}

function pointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  event.preventDefault()
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  stage.value?.setPointerCapture(event.pointerId)
}

function pointerMove(event: PointerEvent) {
  const previous = pointers.get(event.pointerId)
  if (!previous) return
  event.preventDefault()
  const before = [...pointers.values()]
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  const after = [...pointers.values()]
  if (after.length === 1) {
    x.value += event.clientX - previous.x
    y.value += event.clientY - previous.y
  } else if (after.length === 2) {
    const oldDistance = Math.hypot(before[0].x - before[1].x, before[0].y - before[1].y)
    const newDistance = Math.hypot(after[0].x - after[1].x, after[0].y - after[1].y)
    const centerX = (after[0].x + after[1].x) / 2
    const centerY = (after[0].y + after[1].y) / 2
    x.value += centerX - (before[0].x + before[1].x) / 2
    y.value += centerY - (before[0].y + before[1].y) / 2
    if (oldDistance > 0) zoomAt(zoom.value * newDistance / oldDistance, centerX, centerY)
  }
}

function pointerUp(event: PointerEvent) {
  pointers.delete(event.pointerId)
  if (stage.value?.hasPointerCapture(event.pointerId)) stage.value.releasePointerCapture(event.pointerId)
}

function clearPointers() {
  for (const id of pointers.keys()) {
    if (stage.value?.hasPointerCapture(id)) stage.value.releasePointerCapture(id)
  }
  pointers.clear()
}

function loaded(event: Event) {
  const image = event.target as HTMLImageElement
  width.value = image.naturalWidth || 800
  height.value = image.naturalHeight || 500
  reset()
}

async function toggleFull() {
  const element = dialog.value
  if (!element) return
  if (document.fullscreenElement === element) {
    try { await document.exitFullscreen() } catch { /* Dialog remains usable. */ }
  } else if (viewportFull.value) {
    viewportFull.value = false
  } else if (document.fullscreenEnabled && element.requestFullscreen) {
    try { await element.requestFullscreen() }
    catch { viewportFull.value = true }
  } else {
    viewportFull.value = true
  }
  await nextTick()
  reset()
}

function fullscreenChanged() {
  nativeFull.value = document.fullscreenElement === dialog.value
  void nextTick(reset)
}

function restorePage() {
  clearPointers()
  if (previousOverflow !== undefined) {
    document.body.style.overflow = previousOverflow
    previousOverflow = undefined
  }
  viewportFull.value = false
  if (document.fullscreenElement === dialog.value) void document.exitFullscreen().catch(() => {})
}

async function syncViewer() {
  const current = ++openGeneration
  const payload = state.value
  if (!mounted) return
  if (!payload) {
    restorePage()
    dialog.value?.close()
    return
  }
  failed.value = false
  width.value = 800
  height.value = 500
  await nextTick()
  if (current !== openGeneration || !state.value) return
  const element = dialog.value
  if (!element || typeof element.showModal !== 'function') {
    if (payload.src) window.open(payload.src, '_blank', 'noopener,noreferrer')
    closeMedia()
    return
  }
  if (!element.open) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    closeButton.value?.focus()
  }
  if (payload.kind === 'diagram') {
    const svg = canvas.value?.querySelector('svg')
    const viewBox = svg?.viewBox.baseVal
    width.value = viewBox?.width || Number.parseFloat(svg?.getAttribute('width') || '') || 800
    height.value = viewBox?.height || Number.parseFloat(svg?.getAttribute('height') || '') || 500
  }
  reset()
}

watch(state, () => { void syncViewer() })
onMounted(() => {
  mounted = true
  document.addEventListener('fullscreenchange', fullscreenChanged)
  window.addEventListener('resize', measure)
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(measure)
    if (stage.value) resizeObserver.observe(stage.value)
  }
  void syncViewer()
})
onBeforeUnmount(() => {
  mounted = false
  openGeneration++
  restorePage()
  resizeObserver?.disconnect()
  document.removeEventListener('fullscreenchange', fullscreenChanged)
  window.removeEventListener('resize', measure)
  closeMedia()
})
</script>

<template>
  <dialog ref="dialog" class="media-viewer" :class="{ 'is-full': full }" aria-labelledby="media-viewer-title"
    @cancel.prevent="closeMedia" @close="() => { if (!dialog?.open) closeMedia() }" @click="(event) => { if (event.target === dialog) closeMedia() }">
    <div class="media-shell">
      <header class="media-header">
        <div class="media-title"><span class="media-eyebrow">{{ state?.kind === 'diagram' ? 'DIAGRAM' : 'IMAGE' }}</span><h2 id="media-viewer-title">{{ state?.title || '图片预览' }}</h2></div>
        <button ref="closeButton" type="button" class="close-control" aria-label="关闭查看器" @click="closeMedia">关闭 <span aria-hidden="true">×</span></button>
      </header>
      <div ref="stage" class="media-stage" :class="{ failed }" @wheel="onWheel" @pointerdown="pointerDown"
        @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerUp" @lostpointercapture="pointerUp" @dblclick="reset">
        <p v-if="failed" class="media-error" role="status">图片暂时无法加载。{{ state?.title }}</p>
        <div v-else ref="canvas" class="media-canvas" :style="{ width: `${width}px`, height: `${height}px`, transform }">
          <img v-if="state?.kind === 'image'" :key="state.src" :src="state.src" :alt="state.title" draggable="false" @load="loaded" @error="failed = true">
          <div v-else-if="state?.svg" class="media-svg" v-html="state.svg" />
        </div>
      </div>
      <footer class="media-footer">
        <div class="media-tools" role="group" aria-label="缩放与显示控制">
          <button type="button" aria-label="缩小" :disabled="zoom <= .25" @click="zoomAt(zoom / 1.3)">−</button>
          <output aria-live="polite" aria-label="当前缩放比例">{{ Math.round(zoom * 100) }}%</output>
          <button type="button" aria-label="放大" :disabled="zoom >= 16" @click="zoomAt(zoom * 1.3)">+</button>
          <button type="button" @click="reset">复位</button>
          <button type="button" :aria-pressed="full" @click="toggleFull">{{ full ? '退出全屏' : '全屏' }}</button>
          <a v-if="state?.link" :href="state.link" target="_blank" rel="noopener noreferrer">打开链接</a>
        </div>
        <span class="media-help">拖动查看 · 双指或滚轮缩放 · Esc 关闭</span>
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
.media-viewer { box-sizing: border-box; position: fixed; inset: 0; width: min(1120px, calc(100vw - 32px)); height: min(820px, calc(100dvh - 32px)); max-width: 100vw; max-height: 100dvh; margin: auto; padding: 0; overflow: hidden; border: 1px solid var(--vp-c-divider); border-radius: 16px; color: var(--vp-c-text-1); background: var(--vp-c-bg); box-shadow: 0 24px 100px #0006; overscroll-behavior: contain; }
.media-viewer::backdrop { background: #080d19b8; backdrop-filter: blur(8px); }
.media-viewer.is-full, .media-viewer:fullscreen { width: 100vw; height: 100dvh; max-width: none; max-height: none; border: 0; border-radius: 0; }
.media-shell { display: flex; flex-direction: column; height: 100%; }
.media-header { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 76px; padding: 12px 22px; border-bottom: 1px solid var(--vp-c-divider); }
.media-title { min-width: 0; }
.media-eyebrow { font-size: 10px; letter-spacing: .13em; font-weight: 700; color: var(--vp-c-text-2); }
.media-header h2 { margin: 2px 0 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 15px; font-weight: 600; }
.media-stage { position: relative; flex: 1; min-height: 0; overflow: hidden; background: var(--vp-c-bg-soft); touch-action: none; cursor: grab; user-select: none; }
.media-stage:active { cursor: grabbing; }
.media-canvas { position: absolute; left: 50%; top: 50%; transform-origin: center; will-change: transform; }
.media-canvas img { display: block; width: 100%; height: 100%; max-width: none; object-fit: contain; pointer-events: none; }
.media-svg, .media-svg :deep(svg) { display: block; width: 100%; height: 100%; max-width: none !important; }
.media-footer { flex: none; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 12px 18px; border-top: 1px solid var(--vp-c-divider); }
.media-tools { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.media-tools button, .media-tools a, .close-control { display: inline-flex; align-items: center; justify-content: center; min-width: 40px; min-height: 40px; padding: 0 10px; border: 1px solid var(--vp-c-divider); border-radius: 7px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font: inherit; font-size: 12px; white-space: nowrap; cursor: pointer; }
.close-control { gap: 10px; }
.close-control span { font-size: 22px; }
.media-tools button:hover, .close-control:hover { color: var(--vp-c-brand-1); background: var(--vp-c-bg-soft); }
.media-tools button:disabled { cursor: default; opacity: .4; }
button:focus-visible, a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.media-tools output { min-width: 52px; text-align: center; font-size: 12px; font-variant-numeric: tabular-nums; }
.media-help { font-size: 11px; color: var(--vp-c-text-2); }
.media-error { position: absolute; inset: 0; display: grid; place-content: center; padding: 32px; text-align: center; font-size: 14px; color: var(--vp-c-text-2); }
@media (max-width: 600px) { .media-viewer { width: calc(100vw - 16px); height: calc(100dvh - 16px); border-radius: 12px; } .media-header { padding: 10px 14px; min-height: 68px; } .media-footer { padding: 10px; } .media-help { width: 100%; text-align: center; } .media-tools { justify-content: center; width: 100%; } }
@media (prefers-reduced-motion: reduce) { .media-canvas { will-change: auto; } }
</style>
