<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts'
import { useRoute } from 'vitepress'
import { computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { knowledgeSections } from '../navigation'
import MediaViewer from './components/MediaViewer.vue'
import SidebarSearch from './components/SidebarSearch.vue'
import { closeMedia, openMedia } from './media'

const route = useRoute()
const section = computed(() => knowledgeSections.find((entry) => route.path.startsWith(`/${entry.id}/`)))
let observer: MutationObserver | undefined

function prepareImages() {
  document.querySelectorAll<HTMLImageElement>('.vp-doc img:not([data-no-zoom])').forEach((image) => {
    if (image.closest('.mermaid-diagram, .media-viewer, button, a[download], [data-no-zoom]')) return
    image.tabIndex = 0
    image.setAttribute('role', 'button')
    image.setAttribute('aria-haspopup', 'dialog')
    image.setAttribute('aria-label', `查看大图：${image.alt || '正文图片'}`)
    image.classList.add('zoomable-image')
    image.decoding = 'async'
  })
}

function activateImage(event: MouseEvent | KeyboardEvent) {
  if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) return
  if (event instanceof MouseEvent && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return
  const image = event.target
  if (!(image instanceof HTMLImageElement) || !image.matches('.zoomable-image')) return
  if (image.closest('a[download], [data-no-zoom]')) return
  if (!image.complete || !image.naturalWidth) return
  event.preventDefault()
  // Handle linked images before the document router or native link activation.
  event.stopPropagation()
  const anchor = image.closest('a')
  openMedia({ kind: 'image', src: image.currentSrc || image.src, title: image.alt || '正文图片', trigger: image, link: anchor?.href })
}

watch(() => route.path, async () => {
  closeMedia()
  await nextTick()
  prepareImages()
})

onMounted(() => {
  prepareImages()
  document.addEventListener('click', activateImage, true)
  document.addEventListener('keydown', activateImage)
  observer = new MutationObserver(prepareImages)
  const content = document.querySelector('.VPContent')
  if (content) observer.observe(content, { childList: true, subtree: true })
})
onUnmounted(() => {
  observer?.disconnect()
  document.removeEventListener('click', activateImage, true)
  document.removeEventListener('keydown', activateImage)
})
</script>

<template>
  <DefaultTheme.Layout>
    <template #sidebar-nav-before>
      <SidebarSearch />
      <div class="sidebar-caption">KNOWLEDGE LIBRARY</div>
    </template>
    <template #sidebar-nav-after>
      <a class="sidebar-archive" href="/legacy/index.html"><span>2019</span> 翻阅旧时光 <span aria-hidden="true">↗</span></a>
    </template>
    <template #doc-before>
      <div class="doc-breadcrumb"><a href="/">知识库</a><span aria-hidden="true">/</span><span>{{ section?.title || '阅读指南' }}</span></div>
    </template>
    <template #doc-after>
      <div class="reading-end"><span class="reading-end-line"></span>把问题弄明白，把经验留下来。<span class="reading-end-line"></span></div>
    </template>
    <template #layout-bottom><MediaViewer /></template>
  </DefaultTheme.Layout>
</template>
