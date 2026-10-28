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
        text: 'View 触摸机制',
        group: '基础',
        link: '/android/basics/view-touch.html',
        description: '用 U 型图理解分发、拦截、点击、多指与滑动冲突，深入系统输入通道。',
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
        text: '打包与签名原理', group: '基础',
        link: '/android/basics/apk-signing.html',
        description: '从构建、APK 验签到 v1～v4、密钥轮换与 Play App Signing。',
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
        text: 'OkHttp 原理与使用',
        group: '三方开源库',
        link: '/android/libraries/okhttp.html',
        description: '理解版本演进与设计模式，实战 Retrofit 泛型封装、业务 Code、JSON Bean 映射和请求原理。',
      },
      {
        text: 'Glide 源码与缓存',
        group: '三方开源库',
        link: '/android/libraries/glide.html',
        description: '从图片加载入门，理解请求、生命周期、四层缓存和设计模式。',
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
    id: 'network',
    title: '网络通信',
    en: 'FROM BYTES TO SERVICES',
    description: '从一次网页访问开始，看懂地址、传输、协议、加密和部署，自己动手收发数据。',
    link: '/network/',
    items: [
      { text: '一次访问与网络分层', group: '看懂一次通信', link: '/network/overview.html', description: '把网址、DNS、连接、HTTP 与页面显示串成一条主线。' },
      { text: 'IP、端口与路由', group: '看懂一次通信', link: '/network/ip-routing.html', description: '找到机器、下一跳与进程，理解子网、网关和 NAT。' },
      { text: '域名与 DNS', group: '看懂一次通信', link: '/network/dns.html', description: '追踪名称解析、递归与迭代、缓存和记录类型。' },
      { text: 'TCP、UDP 与 QUIC', group: '建立可靠连接', link: '/network/transport.html', description: '从报文与字节流深入握手、重传、流控和拥塞控制。' },
      { text: 'Socket 与消息边界', group: '建立可靠连接', link: '/network/socket.html', description: '理解内核收发缓冲区，用长度前缀完成本地请求响应。' },
      { text: 'HTTP 报文、缓存与重试', group: 'HTTP 与安全通信', link: '/network/http.html', description: '读懂方法、状态、JSON、身份、条件缓存和断点下载。' },
      { text: 'HTTP/1.1、HTTP/2 与 HTTP/3', group: 'HTTP 与安全通信', link: '/network/http-versions.html', description: '看清连接、帧、流、多路复用与队头阻塞。' },
      { text: '加密、签名与密钥', group: 'HTTP 与安全通信', link: '/network/cryptography.html', description: '分清编码、摘要、认证、加密与密钥协商。' },
      { text: 'HTTPS、TLS 与证书', group: 'HTTP 与安全通信', link: '/network/tls.html', description: '从锁头进入 TLS 1.3 握手、信任链和流量密钥。' },
      { text: '服务端架构与组件分工', group: '服务部署与中间件', link: '/network/service-architecture.html', description: '把 Web 服务、MySQL、Redis、消息队列和对象存储放回请求路径。' },
      { text: '服务器部署与反向代理', group: '服务部署与中间件', link: '/network/deployment.html', description: '把域名、服务入口、代理、应用与数据库连接起来。' },
      { text: 'Nginx、网关与负载均衡', group: '服务部署与中间件', link: '/network/gateway-load-balancing.html', description: '理解正反代理、四层七层分发、健康判断和故障转移。' },
      { text: 'Redis 原理与缓存实践', group: '服务部署与中间件', link: '/network/redis.html', description: '从协议与数据结构进入缓存、过期、持久化和一致性。' },
      { text: '长连接、推送与实时协议', group: '实时通信与运维', link: '/network/realtime.html', description: '比较轮询、SSE、WebSocket、MQTT 和 gRPC 的使用边界。' },
      { text: '分层排障与性能分析', group: '实时通信与运维', link: '/network/diagnostics.html', description: '用现象与证据区分解析、连接、TLS、HTTP 和业务故障。' },
      { text: 'QPS、容量与可观测性', group: '实时通信与运维', link: '/network/capacity-observability.html', description: '区分请求速率、并发、延迟和容量，用指标、日志与追踪定位瓶颈。' },
      { text: '网络与运维术语速查', group: '术语速查', link: '/network/glossary.html', description: '按地址、协议、安全、中间件和运维场景查词并进入原理。' },
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
