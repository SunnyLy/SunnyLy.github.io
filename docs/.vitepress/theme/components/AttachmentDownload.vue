<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{ href: string; name: string; size?: string; description?: string }>()
</script>

<template>
  <a class="attachment-download" :href="withBase(href)" :download="name" :aria-label="`下载附件 ${name}`">
    <span class="attachment-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" /><path d="M14 3v6h6M12 12v6m-3-3 3 3 3-3" /></svg>
    </span>
    <span class="attachment-content">
      <span class="attachment-name">{{ name }}<span v-if="size" class="attachment-size">{{ size }}</span></span>
      <span v-if="description" class="attachment-description">{{ description }}</span>
    </span>
    <span class="attachment-action">下载 <span aria-hidden="true">↓</span></span>
  </a>
</template>

<style scoped>
.vp-doc .attachment-download { display: flex; align-items: center; gap: 14px; margin: 24px 0; padding: 18px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); text-decoration: none; transition: border-color .16s, background .16s; }
.vp-doc .attachment-download:hover { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
.attachment-icon { display: grid; place-items: center; flex: 0 0 40px; height: 44px; border: 1px solid var(--vp-c-divider); border-radius: 9px; background: var(--vp-c-bg); color: var(--vp-c-brand-1); }
.attachment-content { display: grid; gap: 4px; min-width: 0; }
.attachment-name { font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
.attachment-size { display: inline-block; margin-left: 10px; font-size: 11px; font-weight: 400; color: var(--vp-c-text-3); }
.attachment-description { font-size: 12px; line-height: 1.7; font-weight: 400; color: var(--vp-c-text-2); overflow-wrap: anywhere; }
.attachment-action { flex-shrink: 0; margin-left: auto; font-size: 12px; color: var(--vp-c-brand-1); white-space: nowrap; }
@media (max-width: 480px) { .vp-doc .attachment-download { gap: 10px; padding: 14px; } .attachment-icon { flex-basis: 32px; height: 38px; } .attachment-action { font-size: 11px; } }
@media (prefers-reduced-motion: reduce) { .vp-doc .attachment-download { transition: none; } }
</style>
