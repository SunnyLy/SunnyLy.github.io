---
description: 从组件与进程边界出发，逐步建立 Android 系统机制的知识框架。
---

# Android

理解平台行为，比记住某个调用方式更重要。这里从可解释、可验证的小问题出发，整理组件协作、进程通信和系统机制。

## 基础

按[原始 Android 基础提纲](https://alidocs.dingtalk.com/i/nodes/1OQX0akWmxaRZD7yfgRMaeOX8GlDd3mE)的顺序，从进程通信延伸到四大组件、核心服务与运行时。[基础阅读索引](./basics/)提供原提纲与笔记的逐项对应。

- [Binder 通信机制](./basics/binder-basics.html)：Java 层四个核心类型与 Native 层接口、代理、实体，厘清 AIDL Proxy 与 BinderProxy 的组合关系。
- [IPC 方式与场景选型](./basics/ipc-methods.html)：比较通信语义、数据通路与线程模型，包含 AIDL、SharedMemory、Provider 和 Socket 关键代码。
- [Handler 原理](./basics/handler.html)：消息如何进入队列、在哪个线程执行，以及延迟、取消和退出的边界。
- [JobScheduler 系统任务调度](./basics/job-scheduler.html)：约束、系统调度链、JobService 调用示例、停止竞态与跨重启持久化。
- [Messenger 机制](./basics/messenger.html)：两种构造方式、绑定通信四步、双向回复、调用身份与断连处理。
- [View 触摸机制](./basics/view-touch.html)：经典 U 型图、目标选择、拦截与 CANCEL、点击、滑动冲突、多指和系统输入链路。
- 四大组件：[Activity 启动](./basics/activity-startup.html)、[Broadcast 发送接收](./basics/broadcast.html)、[Service 生命周期](./basics/service-lifecycle.html)、[Provider 与内容观察](./basics/content-provider.html)。
- [系统核心服务](./basics/system-services.html)：AMS/ATMS、PMS、WMS、ContentService 和 PackageInstallerService；包含 [Launcher 点击到首帧的完整时序](./basics/system-services/ams-atms.html#ams-atms-launch-sequence)。
- 运行时：[PendingIntent](./basics/pending-intent.html)、[LoadedApk](./basics/loaded-apk.html)、[类加载机制](./basics/class-loading.html)、[动态代理](./basics/dynamic-proxy.html)。
- [打包与签名原理](./basics/apk-signing.html)：构建与验签流程、签名方案差异、密钥轮换、覆盖更新及 Play App Signing。

## Framework

[Binder 机制：从 AIDL 到内核事务](./framework/binder-mechanism.html)以固定 AOSP 与内核源码串联服务发现、Java/JNI 调用链、Parcel、线程模型和调用身份，区分源码结论与设备验证。

[SurfaceFlinger 与 VSYNC：从硬件节拍到一帧呈现](./framework/surfaceflinger-vsync.html)从文字如何变成屏幕像素开始，图解 App 绘制、Buffer、图层合成、VSYNC 和卡顿，再展开底层源码与 Play Integrity 的显示相关风险信号。

[Android Token 原理：从 Activity 启动到窗口归属](./framework/activity-token.html)区分活动、窗口和输入通道身份，沿启动事务、窗口校验、生命周期回报与重建追踪同一份 Binder 引用。

[ClientTransaction 机制：从跨进程调度到生命周期状态机](./framework/client-transaction.html)串联服务端批量派发、Binder 接收与主线程执行，解释生命周期补齐、状态回报及异常处理边界。

[ServiceManager 与 AIDL：系统服务和应用绑定的两条路径](./framework/service-manager-aidl.html)对照系统服务注册、目录查找与应用绑定，解释 Stub / Proxy、本地优化、线程、权限和断连处理。

## 三方开源库

[OkHttp：版本演进、设计模式与 Retrofit 实战](./libraries/okhttp.html)讲解网络请求；[Glide：图片加载、缓存与源码设计](./libraries/glide.html)拆解图片加载与资源复用。更多内容见[三方开源库目录](./libraries/index.html)。

## Kotlin

从 Kotlin 语法与 Android 开发中的实际机制出发，区分语言能力、状态模型和库运行时。

[Compose State 原理：从 Kotlin 委托到 Snapshot 与重组](./kotlin/compose-state.html)拆解 remember、MutableState、动态读取依赖和 Snapshot 提交通知，解释重组、布局、绘制的不同触发边界。

[Compose 渲染流程：从编译改写到屏幕呈现](./kotlin/compose-rendering.html)串联 Compiler、Runtime、LayoutNode 与 AndroidComposeView，区分组合记录、布局树、绘制入口与显示呈现。

## 工具与实践

网络观察相关的工具记录见 [App 网络请求抓包](/tools/app-network-capture.html)。

## 笔记的组织方式

基础篇解释组件与应用 API，Framework 篇追踪系统服务、运行时与内核协作，三方开源库篇拆解常用库的使用与内部实现，Kotlin 篇分析 Compose 状态和渲染。

分类入口与维护方法见[阅读与写作指南](/guide.html)。
