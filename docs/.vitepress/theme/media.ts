import { nextTick, shallowRef } from 'vue'

export interface MediaPayload {
  kind: 'image' | 'diagram'
  src?: string
  svg?: string
  title: string
  trigger?: HTMLElement
  link?: string
}

export const state = shallowRef<MediaPayload | null>(null)

export function openMedia(payload: MediaPayload) {
  state.value = payload
}

export function closeMedia() {
  const previous = state.value
  if (!previous) return
  state.value = null
  void nextTick(() => {
    if (typeof document === 'undefined') return
    const target = previous.trigger?.isConnected
      ? previous.trigger
      : document.querySelector<HTMLElement>('.vp-doc h1, main h1, main')
    if (!target) return
    if (!target.matches('a, button, input, select, textarea, [tabindex]')) {
      target.setAttribute('tabindex', '-1')
    }
    target.focus({ preventScroll: true })
  })
}
