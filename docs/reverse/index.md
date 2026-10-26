---
description: 用清楚的问题、可追溯的证据与可复现的步骤组织分析笔记。
---

# 逆向

分析 Web 请求链、Java 方法调用与 ART 执行路径，理解不同观察层级提供的信息。

## Web

[Web JS 逆向：从 WebView 调试到请求链路还原](./web-js-reverse.html)从 Android WebView 远程调试切入，串联断点、调用栈、可恢复 Hook、参数字节、混淆阅读与多样本验证，配有流程图、请求时序图和本地截图。

## Frida

[Frida 原理与学习路线](./frida/)串联[安装与版本](./frida/installation.html)、[Java API 与方法观察](./frida/java-api.html)、[SELinux 权限拒绝](./frida/selinux-diagnostics.html)和 [Smali trace 与 ART](./frida/smali-trace.html)。附自有 Java Demo、可下载源码，以及类 / 方法 / 指令三种观察层级的流程图。

## 与其他主题连接

分类目录保留 [Android](/android/) 与[安全](/security/)入口；新增笔记与本地图文的维护方法见[阅读与写作指南](/guide.html)。
