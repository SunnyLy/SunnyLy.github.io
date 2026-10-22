---
description: 从组件与进程边界出发，逐步建立 Android 系统机制的知识框架。
---

# Android

理解平台行为，比记住某个调用方式更重要。这里从可解释、可验证的小问题出发，整理组件协作、进程通信和系统机制。

## Framework

[Binder 机制：从 AIDL 到内核事务](./framework/binder-mechanism.html)以固定 AOSP 与内核源码串联服务发现、Java/JNI 调用链、Parcel、线程模型和调用身份，区分源码结论与设备验证。

[SurfaceFlinger 与 VSYNC：从硬件节拍到一帧呈现](./framework/surfaceflinger-vsync.html)连接显示驱动、Composer HAL、VSYNC 预测、应用 Choreographer、BLAST 与合成管线，说明提交、呈现和缓冲区复用的时间边界。

[Android Token 原理：从 Activity 启动到窗口归属](./framework/activity-token.html)区分活动、窗口和输入通道身份，沿启动事务、窗口校验、生命周期回报与重建追踪同一份 Binder 引用。

[ClientTransaction 机制：从跨进程调度到生命周期状态机](./framework/client-transaction.html)串联服务端批量派发、Binder 接收与主线程执行，解释生命周期补齐、状态回报及异常处理边界。

[ServiceManager 与 AIDL：系统服务和应用绑定的两条路径](./framework/service-manager-aidl.html)对照系统服务注册、目录查找与应用绑定，解释 Stub / Proxy、本地优化、线程、权限和断连处理。

## Kotlin

从 Kotlin 语法与 Android 开发中的实际机制出发，区分语言能力、状态模型和库运行时。

[Compose State 原理：从 Kotlin 委托到 Snapshot 与重组](./kotlin/compose-state.html)拆解 remember、MutableState、动态读取依赖和 Snapshot 提交通知，解释重组、布局、绘制的不同触发边界。

## 工具与实践

网络观察相关的工具记录见 [App 网络请求抓包](/tools/app-network-capture.html)。

## 笔记的组织方式

每篇笔记围绕具体问题展开，记录适用条件、原理、验证方法与原始参考。涉及设备或系统差异时，必须注明实际查询结果，避免把一个环境中的行为推广到所有设备。

分类入口与维护方法见[阅读与写作指南](/guide.html)。
