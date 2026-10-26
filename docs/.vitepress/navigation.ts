import { androidSecurityOutline } from './android-security-outline.ts'

export interface KnowledgeSection {
  id: string
  title: string
  en: string
  description: string
  link: string
  items: { text: string; link: string; description?: string; group?: string; subgroup?: string }[]
  outline?: typeof androidSecurityOutline
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
        text: '基础提纲与阅读索引',
        group: '基础',
        link: '/android/basics/',
        description: '按原提纲串联通信、四大组件、核心服务与运行时。',
      },
      {
        text: 'Binder 通信机制',
        group: '基础',
        link: '/android/basics/binder-basics.html',
        description: '辨明 Java 与 Native 层接口、代理、实体的关系。',
      },
      {
        text: 'IPC 方式与场景选型',
        group: '基础',
        link: '/android/basics/ipc-methods.html',
        description: '对比 AIDL、Messenger、组件、共享内存和 Socket，配套关键代码。',
      },
      {
        text: 'Handler 原理',
        group: '基础',
        link: '/android/basics/handler.html',
        description: '理解消息入队、Looper 分发、延迟调度与生命周期。',
      },
      {
        text: 'JobScheduler 系统任务调度',
        group: '基础',
        link: '/android/basics/job-scheduler.html',
        description: '从系统调度链到 JobService，掌握约束、停止竞态与版本限制。',
      },
      {
        text: 'Messenger 机制',
        group: '基础',
        link: '/android/basics/messenger.html',
        description: '串联服务绑定、Binder 传输与 Handler 请求响应。',
      },
      {
        text: 'Activity 启动原理', group: '基础', subgroup: '四大组件',
        link: '/android/basics/activity-startup.html',
        description: '厘清启动六个关键类型、任务复用与生命周期。',
      },
      {
        text: 'Broadcast 发送与接收', group: '基础', subgroup: '四大组件',
        link: '/android/basics/broadcast.html',
        description: '从注册、发送、接收到 PendingResult 完成回报。',
      },
      {
        text: 'Service 启动、绑定与销毁', group: '基础', subgroup: '四大组件',
        link: '/android/basics/service-lifecycle.html',
        description: '串联组件生命周期、IntentService 与前台服务通知 Demo。',
      },
      {
        text: 'Provider 与内容观察', group: '基础', subgroup: '四大组件',
        link: '/android/basics/content-provider.html',
        description: '区分 Provider 声明与 ContentObserver 动态注册。',
      },
      {
        text: '服务总览', group: '基础', subgroup: '系统核心服务',
        link: '/android/basics/system-services.html',
        description: '核心服务职责、专题入口与排查方向。',
      },
      {
        text: 'AMS / ATMS', group: '基础', subgroup: '系统核心服务',
        link: '/android/basics/system-services/ams-atms.html',
        description: '进程与任务管理、Launcher 点击到首帧的完整启动时序。',
      },
      {
        text: 'PMS：包管理', group: '基础', subgroup: '系统核心服务',
        link: '/android/basics/system-services/pms.html',
        description: '包与组件查询、共享库、卸载及包状态。',
      },
      {
        text: 'WMS：窗口管理', group: '基础', subgroup: '系统核心服务',
        link: '/android/basics/system-services/wms.html',
        description: '窗口会话、Token、布局与显示协作。',
      },
      {
        text: 'ContentService', group: '基础', subgroup: '系统核心服务',
        link: '/android/basics/system-services/content-service.html',
        description: 'URI 观察注册与变化通知。',
      },
      {
        text: 'PackageInstallerService', group: '基础', subgroup: '系统核心服务',
        link: '/android/basics/system-services/package-installer-service.html',
        description: '安装会话、用户确认与异步结果。',
      },
      {
        text: 'PendingIntent 原理', group: '基础',
        link: '/android/basics/pending-intent.html',
        description: 'IntentSender、身份、复用规则与可变性。',
      },
      {
        text: 'LoadedApk 原理', group: '基础',
        link: '/android/basics/loaded-apk.html',
        description: '包缓存、Application 初始化、资源路径与类加载。',
      },
      {
        text: '类加载机制', group: '基础',
        link: '/android/basics/class-loading.html',
        description: '父委派、DEX 搜索、共享库与类型身份。',
      },
      {
        text: '动态代理原理', group: '基础',
        link: '/android/basics/dynamic-proxy.html',
        description: '接口分发、InvocationHandler 与返回值和异常契约。',
      },
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
      {
        text: 'ClientTransaction 机制',
        group: 'Framework',
        link: '/android/framework/client-transaction.html',
        description: '理解事务归并、线程切换、逐项执行与生命周期状态迁移。',
      },
      {
        text: 'ServiceManager 与 AIDL',
        group: 'Framework',
        link: '/android/framework/service-manager-aidl.html',
        description: '区分系统服务发现与应用绑定，理解接口、缓存、权限和连接生命周期。',
      },
      {
        text: 'Compose State 原理',
        group: 'Kotlin',
        link: '/android/kotlin/compose-state.html',
        description: '从属性委托到 Snapshot 读写，追踪动态依赖、作用域失效和重组调度。',
      },
      {
        text: 'Compose 渲染流程',
        group: 'Kotlin',
        link: '/android/kotlin/compose-rendering.html',
        description: '串联编译改写、运行时节点、测量布局、Android 绘制与显示边界。',
      },
    ],
  },
  {
    id: 'security',
    title: '安全',
    en: 'BOUNDARIES & TRUST',
    description: '按提纲学习通用组件、配置、文件操作、特殊函数与 Dos 攻击。',
    link: '/security/',
    outline: androidSecurityOutline,
    items: [
      { text: '通用组件安全', link: '/security/android/component-security.html', description: '按原提纲逐项学习。' },
      { text: '配置安全', link: '/security/android/configuration-security.html', description: '按原提纲逐项学习。' },
      { text: '文件操作', link: '/security/android/file-operations.html', description: '按原提纲逐项学习。' },
      { text: '特殊函数', link: '/security/android/special-functions.html', description: '按原提纲逐项学习。' },
      { text: 'Dos攻击', link: '/security/android/dos-attacks.html', description: '按原提纲逐项学习。' },
    ],
  },
  {
    id: 'reverse',
    title: '逆向',
    en: 'EVIDENCE & REASONING',
    description: '让观察、假设与证据分开记录，让结论可以复查。',
    link: '/reverse/',
    items: [
      { text: 'Frida 原理与学习路线', group: 'Frida', link: '/reverse/frida/', description: '进程内脚本、Java bridge 与自有实验 App。' },
      { text: '安装、版本与连接', group: 'Frida', link: '/reverse/frida/installation.html', description: '区分 CLI、绑定与 server，理解 Frida 17 bridge。' },
      { text: 'Java API 与方法观察', group: 'Frida', link: '/reverse/frida/java-api.html', description: '类、实例、方法、ClassLoader 和可恢复的单方法观察。' },
      { text: 'SELinux 与权限拒绝', group: 'Frida', link: '/reverse/frida/selinux-diagnostics.html', description: '从 AVC 与进程域定位访问拒绝。' },
      { text: 'Smali trace 与 ART', group: 'Frida', link: '/reverse/frida/smali-trace.html', description: '理解 DEX、解释执行与 JIT / AOT 的追踪边界。' },
      {
        text: 'Web JS 逆向',
        group: 'Web',
        link: '/reverse/web-js-reverse.html',
        description: '从 WebView 调试、断点与 Hook 到请求链路、数据变换及证据验证。',
      },
    ],
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
