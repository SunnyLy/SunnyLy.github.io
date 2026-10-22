export interface KnowledgeSection {
  id: string
  title: string
  en: string
  description: string
  link: string
  items: { text: string; link: string; description?: string; group?: string }[]
}

// Shared by the home page and navigation. Derive counts from this array.
export const knowledgeSections: KnowledgeSection[] = [
  {
    id: 'android',
    title: 'Android',
    en: 'PLATFORM & INTERNALS',
    description: '从组件协作到系统机制，理解 Android 行为背后的原因。',
    link: '/android/',
    items: [
      {
        text: 'Binder 机制',
        group: 'Framework',
        link: '/android/framework/binder-mechanism.html',
        description: '从 AIDL 到内核事务，理解服务发现、线程、内存与调用身份。',
      },
      {
        text: 'SurfaceFlinger 与 VSYNC',
        group: 'Framework',
        link: '/android/framework/surfaceflinger-vsync.html',
        description: '从硬件节拍到应用帧调度、缓冲区提交与显示呈现。',
      },
      {
        text: 'Android Token 原理',
        group: 'Framework',
        link: '/android/framework/activity-token.html',
        description: '跟踪 Activity 身份、启动事务、窗口归属与实例重建的边界。',
      },
    ],
  },
  {
    id: 'security',
    title: '安全',
    en: 'BOUNDARIES & TRUST',
    description: '从输入、身份与权限出发，建立可验证的安全边界。',
    link: '/security/',
    items: [],
  },
  {
    id: 'reverse',
    title: '逆向',
    en: 'EVIDENCE & REASONING',
    description: '让观察、假设与证据分开记录，让结论可以复查。',
    link: '/reverse/',
    items: [],
  },
  {
    id: 'tools',
    title: '工具与实践',
    en: 'WORKFLOW & FIELD NOTES',
    description: '整理方法、阅读图示与记录过程，把经验变成可复用的笔记。',
    link: '/tools/',
    items: [
      {
        text: 'App 网络请求抓包',
        link: '/tools/app-network-capture.html',
        description: '使用 Clash 与 mitmweb 抓包，下载配置并理解代理链路。',
      },
    ],
  },
]
