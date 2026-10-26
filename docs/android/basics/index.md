---
description: 按原始 Android 基础提纲组织通信、四大组件、核心服务与运行时，提供逐项覆盖索引。
outline: [2, 3]
---

# Android 基础提纲

从通信机制进入四大组件，再理解系统服务、包加载和运行时。各篇串联核心对象、调用顺序、使用代码与关键限制。

## 通信基础 {#communication}

1. [Binder 通信机制](./binder-basics.html)：Java 层 IBinder、Binder、BinderProxy、IInterface；Native 层 IBinder.h、BpBinder、BBinder。
2. [Handler 原理](./handler.html)：Looper、MessageQueue、Handler、Message，分发顺序和生命周期。
3. [Messenger 机制](./messenger.html)：轻量 IPC、两种构造方式、服务端到客户端的通信四步。

补充：[IPC 方式与场景选型](./ipc-methods.html)对比远程方法、消息、组件、共享数据和字节流，提供 AIDL、共享内存、Provider 与 Socket 的关键代码，与 Binder 篇配合阅读。

## 后台任务调度 {#background-scheduling}

[JobScheduler 系统任务调度](./job-scheduler.html)补充原提纲之外的后台基础知识，覆盖系统原理、使用场景、JobService 示例、停止竞态及版本限制；与 [Handler / WorkManager 选型](./handler.html#handlerthread-是否弃用-应该换成什么)配合阅读。

## View 与交互 {#views-and-input}

[View 触摸机制](./view-touch.html)从经典 U 型图和手势序列开始，解释分发、拦截、点击、滑动冲突、坐标与多指处理，再追到系统输入通道；附可观察 CANCEL 与父级接管的交互 Demo。

## 四大组件 {#components}

### Activity 启动原理

[Activity 篇](./activity-startup.html)逐个解释 ActivityThread、Instrumentation、ActivityStarter、Task、ActivityTaskSupervisor 和 ClientTransaction；[AMS/ATMS 完整时序](./system-services/ams-atms.html#ams-atms-launch-sequence)从 Launcher 点击图标一直到应用首帧显示。

### Broadcast 发送接收原理

[广播篇](./broadcast.html)覆盖注册、发送、调度、onReceive 和 PendingResult.finish。保留原截图，修正“一个接收器完成等于整条广播完成”的混淆，并补充 goAsync、线程和版本边界。

### Service 启动、绑定与销毁原理

[Service 篇](./service-lifecycle.html)区分 started / bound 状态，解释创建、onStartCommand、onBind、连接发布、解绑与销毁，并补充 IntentService 原理与迁移、前台服务限制，以及[通知绑定和笔记导出 Demo](./service-lifecycle.html#foreground-demo)。

### Provider 原理

[Provider 篇](./content-provider.html)解释声明、首次取得、进程启动和数据调用；将原提纲中的“动态注册”准确归入 ContentObserver → ContentService 观察通知链。

## 核心服务 {#services}

[核心服务篇](./system-services.html)按原顺序整理：

1. [AMS / ATMS](./system-services/ams-atms.html#s160)：职责、完整启动时序、冷暖复用分支及源码阅读入口。
2. [PMS](./system-services/pms.html#s166)：queryIntentActivities、getSharedLibraries、deletePackageAsUser、clearApplicationUserData、getPackageInstaller。
3. [WMS](./system-services/wms.html#s197)：窗口会话、归属、布局和显示协作。
4. [ContentService](./system-services/content-service.html#s200)：URI 观察注册与变化通知。
5. [PackageInstallerService](./system-services/package-installer-service.html#s203)：PackageInstallerSession、PackageInstaller、SessionParams，创建、写入、提交、用户确认与最终结果。

## PendingIntent、LoadedApk 与运行时 {#runtime}

1. [PendingIntent 原理](./pending-intent.html)：IntentSender、凭据身份、匹配复用、可变性与取消。
2. [LoadedApk 原理](./loaded-apk.html)：ActivityThread.getPackageInfo、Application 创建、appDir / libDir 和共享类加载器。
3. [类加载机制](./class-loading.html)：默认委派、PathClassLoader、DexClassLoader、共享库与类型身份。
4. [动态代理原理](./dynamic-proxy.html)：Proxy、InvocationHandler、接口可见性和异常契约。

## 构建与发布 {#build-and-release}

[打包与签名原理](./apk-signing.html)：源码如何变成 APK、系统如何验签、v1～v4 与 v3.2 的区别，以及签名方案升级、密钥轮换和 Play 上传密钥重置。

## 来源、原图与覆盖 {#source-coverage}

[原始提纲](https://alidocs.dingtalk.com/i/nodes/1OQX0akWmxaRZD7yfgRMaeOX8GlDd3mE)。各条目与站内章节的对应关系保存在 `planning/android-basics-coverage.json`。

原提纲截图：[广播原图](/assets/android/basics/source/broadcast-original.webp)、[PMS 查询原图](/assets/android/basics/source/package-query-original.webp)。截图未标版本，当前机制见对应正文中的源码链接。
