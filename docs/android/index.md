---
description: 从组件与进程边界出发，逐步建立 Android 系统机制的知识框架。
---

# Android

理解平台行为，比记住某个调用方式更重要。这里从可解释、可验证的小问题出发，整理组件协作、进程通信和系统机制。

## Framework

[Binder 机制：从 AIDL 到内核事务](./framework/binder-mechanism.html)以固定 AOSP 与内核源码串联服务发现、Java/JNI 调用链、Parcel、线程模型和调用身份，区分源码结论与设备验证。

网络观察相关的工具记录见 [App 网络请求抓包](/tools/app-network-capture.html)。

## 笔记的组织方式

每篇笔记围绕具体问题展开，记录适用条件、原理、验证方法与原始参考。涉及设备或系统差异时，必须注明实际查询结果，避免把一个环境中的行为推广到所有设备。

分类入口与维护方法见[阅读与写作指南](/guide.html)。
