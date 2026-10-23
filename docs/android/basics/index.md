---
description: 按原始 Android 基础提纲组织通信、四大组件、核心服务与运行时，提供逐项覆盖索引。
outline: [2, 3]
---

# Android 基础提纲

沿[原提纲](https://alidocs.dingtalk.com/i/nodes/1OQX0akWmxaRZD7yfgRMaeOX8GlDd3mE)的层级与顺序学习，先理解通信，再进入组件、系统服务和运行时。内部实现统一标注 AOSP `android-16.0.0_r1`；公开 SDK 与历史截图分开说明，源码路径不代表所有设备的固定实现。

## 通信基础 {#communication}

1. [Binder 通信机制](./binder-basics.html)：Java 层 IBinder、Binder、BinderProxy、IInterface；Native 层 IBinder.h、BpBinder、BBinder。
2. [Handler 原理](./handler.html)：Looper、MessageQueue、Handler、Message，分发顺序和生命周期。
3. [Messenger 机制](./messenger.html)：轻量 IPC、两种构造方式、服务端到客户端的通信四步。

## 四大组件 {#components}

### Activity 启动原理

[Activity 篇](./activity-startup.html)逐个解释 ActivityThread、Instrumentation、ActivityStarter、Task、ActivityTaskSupervisor 和 ClientTransaction；[AMS/ATMS 完整时序](./system-services.html#ams-atms-launch-sequence)从 Launcher 点击图标一直到应用首帧显示。

### Broadcast 发送接收原理

[广播篇](./broadcast.html)覆盖注册、发送、调度、onReceive 和 PendingResult.finish。保留原截图，修正“一个接收器完成等于整条广播完成”的混淆，并补充 goAsync、线程和版本边界。

### Service 启动、绑定与销毁原理

[Service 篇](./service-lifecycle.html)区分 started / bound 状态，解释创建、onStartCommand、onBind、连接发布、解绑与销毁，以及后台限制和进程死亡。

### Provider 原理

[Provider 篇](./content-provider.html)解释声明、首次取得、进程启动和数据调用；将原提纲中的“动态注册”准确归入 ContentObserver → ContentService 观察通知链。

## 核心服务 {#services}

[核心服务篇](./system-services.html)按原顺序整理：

1. [AMS / ATMS](./system-services.html#s160)：职责、完整启动时序、冷暖复用分支及源码阅读入口。
2. [PMS](./system-services.html#s166)：queryIntentActivities、getSharedLibraries、deletePackageAsUser、clearApplicationUserData、getPackageInstaller。
3. [WMS](./system-services.html#s197)：窗口会话、归属、布局和显示协作。
4. [ContentService](./system-services.html#s200)：URI 观察注册与变化通知。
5. [PackageInstallerService](./system-services.html#s203)：PackageInstallerSession、PackageInstaller、SessionParams，创建、写入、提交、用户确认与最终结果。

## PendingIntent、LoadedApk 与运行时 {#runtime}

1. [PendingIntent 原理](./pending-intent.html)：IntentSender、凭据身份、匹配复用、可变性与取消。
2. [LoadedApk 原理](./loaded-apk.html)：ActivityThread.getPackageInfo、Application 创建、appDir / libDir 和共享类加载器。
3. [类加载机制](./class-loading.html)：默认委派、PathClassLoader、DexClassLoader、共享库与类型身份。
4. [动态代理原理](./dynamic-proxy.html)：Proxy、InvocationHandler、接口可见性和异常契约。

## 来源、原图与覆盖 {#source-coverage}

本次通过持续滚动至钉钉文档末尾、累计段落 ID 核对来源。该页面虚拟加载，顶部可见段落和页脚字数都不能代表完整正文。原提纲的每个知识条目均保留在内部覆盖清单，关联到本文列出的文章或具体小节。

两张来源图片已随站点保存，文章内可点击放大，也可下载：[广播原图](/assets/android/basics/source/broadcast-original.webp)、[PMS 查询原图](/assets/android/basics/source/package-query-original.webp)。截图未标版本，作为历史材料保留；更新后的结论以对应公开文档和固定 AOSP 链接为准。示例未在 Android 工程编译或真机运行。
