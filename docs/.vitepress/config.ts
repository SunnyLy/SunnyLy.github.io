import { defineConfig, type DefaultTheme } from 'vitepress'
import { knowledgeSections } from './navigation'
import { tokenize } from './search.mjs'

function sectionSidebar(section: (typeof knowledgeSections)[number]): DefaultTheme.SidebarItem[] {
  if (section.outline) return section.outline
  const items: DefaultTheme.SidebarItem[] = []
  const groups = new Map<string, DefaultTheme.SidebarItem>()
  const subgroups = new Map<string, DefaultTheme.SidebarItem>()
  for (const { text, link, group, subgroup } of section.items) {
    const article = { text, link }
    if (!group) {
      items.push(article)
      continue
    }
    let parent = groups.get(group)
    if (!parent) {
      parent = { text: group, collapsed: false, items: [] }
      groups.set(group, parent)
      items.push(parent)
    }
    if (subgroup) {
      const key = `${group}/${subgroup}`
      let child = subgroups.get(key)
      if (!child) {
        child = { text: subgroup, collapsed: false, items: [] }
        subgroups.set(key, child)
        parent.items!.push(child)
      }
      child.items!.push(article)
    } else {
      parent.items!.push(article)
    }
  }
  return items
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'Sunny · 技术手记',
  description: '关于 Android、安全与逆向的技术知识库。从原理到实践，让经验可以复用。',
  base: '/',
  cleanUrls: false,
  lastUpdated: false,
  // This one URL is copied after VitePress builds; the artifact checker
  // validates it once the legacy files are present.
  ignoreDeadLinks: [/^\/legacy\/index(?:\.html)?$/],
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#455ac5' }]
  ],
  themeConfig: {
    logo: '/mark.svg',
    siteTitle: 'Sunny / 技术手记',
    nav: [
      { text: '知识库', link: '/android/' },
      { text: '阅读指南', link: '/guide.html' },
      { text: '旧博客', link: '/legacy/index.html', target: '_self' }
    ],
    sidebar: [
      { text: '从这里开始', items: [
        { text: '知识库概览', link: '/' },
        { text: '阅读与写作指南', link: '/guide.html' }
      ] },
      ...knowledgeSections.map((section) => ({
        text: section.title,
        collapsed: false,
        items: [
          { text: `${section.title}概览`, link: section.link },
          ...sectionSidebar(section)
        ]
      }))
    ],
    outline: { level: [2, 3], label: '本文目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    sidebarMenuLabel: '分类目录',
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换浅色模式',
    darkModeSwitchTitle: '切换深色模式',
    notFound: { title: '这页笔记还没找到', quote: '可以从目录或搜索回到你需要的知识。', linkText: '返回知识库', linkLabel: '返回知识库首页' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/SunnyLy/SunnyLy.github.io', ariaLabel: 'GitHub 仓库' }],
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        miniSearch: { options: { tokenize }, searchOptions: { combineWith: 'AND', prefix: true, fuzzy: false } },
        translations: {
          button: { buttonText: '搜索笔记', buttonAriaLabel: '搜索全部笔记' },
          modal: {
            displayDetails: '显示内容摘要', resetButtonTitle: '清空搜索', backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关笔记，试试更短的关键词。',
            footer: { selectText: '打开', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    }
  },
  markdown: {
    lineNumbers: true,
    image: { lazyLoading: true },
    config(md) {
      const defaultFence = md.renderer.rules.fence!
      md.renderer.rules.fence = (tokens, index, options, env, self) => {
        const token = tokens[index]
        if (token.info.trim() === 'mermaid') {
          return `<MermaidDiagram source="${encodeURIComponent(token.content)}" />\n`
        }
        return defaultFence(tokens, index, options, env, self)
      }
    }
  }
})
