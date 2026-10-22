<script setup lang="ts">
function search() {
  // The stable default theme's local-search shortcut listens on window.
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
}
</script>

<template>
  <button class="sidebar-search" type="button" @click="search" aria-label="搜索全部笔记">
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
    <span>搜索知识与笔记</span><kbd>⌘ K</kbd>
  </button>
</template>
