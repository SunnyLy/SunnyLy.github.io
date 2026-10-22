import DefaultTheme from 'vitepress/theme-without-fonts'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import KnowledgeHome from './components/KnowledgeHome.vue'
import MermaidDiagram from './components/MermaidDiagram.vue'
import AttachmentDownload from './components/AttachmentDownload.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('KnowledgeHome', KnowledgeHome)
    app.component('MermaidDiagram', MermaidDiagram)
    app.component('AttachmentDownload', AttachmentDownload)
  }
} satisfies Theme
