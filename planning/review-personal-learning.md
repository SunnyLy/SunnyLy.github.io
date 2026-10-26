# 个人学习笔记审查

目标：正文聚焦原理、流程、用法与具体限制。删除整理史、分类归属自述、反复介绍源码基线、查看器操作和构建验收口吻；保留有行为含义的版本条件、必要示例前提与原始来源。构建记录留在 planning，不能因删除正文免责声明而宣称做过设备实测。

## 主控审查

| 文件 | 审查及修改 |
| --- | --- |
| android/basics/service-lifecycle.md | 保留 started/bound 条件、IntentService 与完整前台服务 Demo；补 ApplicationThread → H.CREATE_SERVICE → handleCreateService → attach/onCreate → token 缓存的实际创建链，依据 AOSP r1 ActivityThread。移除编译报告与提纲介绍。 |
| android/basics/job-scheduler.md | 复核控制器、候选资格、并发调度、Binder 到 JobServiceEngine 主线程分发及三种完成/停止契约；现有说明已深入到框架内部，不重复扩写；去掉开头的核对日期和编译报告。 |
| android/basics/ipc-methods.md | 保留数据种类/容量与方向两张聚焦对比表、AIDL 和八类完整 Java 示例；补 SharedMemory.map 的 mmap、独立地址空间、ByteBuffer 映射与关闭/解除映射的职责，依据 SharedMemory API。移除类型检查报告口吻。 |
| android/kotlin/compose-state.md | 复核 Kotlin 委托、remember、StateRecord、读取观察、写入/提交、Recomposer、阶段失效与 snapshotFlow；现有调用图和源码说明保留，删来源整理史与通用版本/验收前言。 |
| android/kotlin/compose-rendering.md | 复核 Compiler/Runtime、SlotTable/LayoutNode、约束测量、dispatchDraw、Coordinator、Android 呈现；保留实际源码快照引用及实现差异，删泛化前言，来源链接集中末尾。 |
| reverse/web-js-reverse.md | 去掉阅读路线、整理史和构建报告；补同步执行上下文出入栈、Promise/await 微任务与异步父栈的区别，依据 WHATWG HTML 事件循环、MDN 执行模型和 Chrome DevTools。未新增第三方目标分析。 |
| tools/app-network-capture.md | 补 App—代理与代理—服务器两条 TLS 连接，以及路由成功不等于证书握手成功的原因，依据 mitmproxy Certificates；保留自有 App debug-overrides、不同 CA 默认值及原附件。 |
| security/android/engineering/data-lifecycle.md | 复核服务端撤销、本地会话、Keystore、备份恢复、卸载副本与剪贴板并发；具体行为已有说明，去掉工程层自述和重复未验证声明，保留版本条件与检查步骤。 |
| security/android/engineering/release-hardening.md | 复核最终合并 Manifest、备份/迁移、元数据、R8 入口与 mapping；去掉层级和验证状态模板，检查步骤改为直接执行要求。 |
| security/android/engineering/untrusted-files.md | 复核接收/暂存/解析/发布、路径和资源双预算、Bounds/采样和解压约束；保留参数是业务示例的具体说明，删除覆盖范围和旧页提示套话。 |
| guide.md | 写作模板改为原理 → 调用流程 → 用法 → 注意事项；要求依据就近、维护记录进 planning，减少后续新增笔记再次出现模板前言。 |

Android、基础、系统服务、逆向和工具分类入口一并精简，原分类与原图入口保留。首页为 KnowledgeHome 组件入口，无文章正文，本轮未改布局。

## 证据与既有验证

- Service 创建链已实际读取 [AOSP r1 ActivityThread](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/android-16.0.0_r1/core/java/android/app/ActivityThread.java)，核对 scheduleCreateService、handleCreateService 与 handleBindService。
- 共享内存依据 [SharedMemory](https://developer.android.com/reference/android/os/SharedMemory) 的 map/unmap/close 契约；JS 调度依据 [HTML Event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)；TLS 依据 [mitmproxy Certificates](https://docs.mitmproxy.org/stable/concepts/certificates/)。
- 移出正文的既有验证记录：JobScheduler 两个 Java 类、Service 三个完整类、IPC AIDL 生成类及八个完整 Java 类曾通过 SDK35 类型检查；Service ZIP 工具曾通过桌面 JVM 内容、取消与清理测试。此次未改变这些应用示例代码。未执行 APK 或设备实验。
- Framework/系统服务、通信/组件基础、安全现行篇与历史兼容篇的逐篇记录分别见 review-personal-system.md、review-personal-basics.md、review-personal-security.md。

## 交叉复核与最终检查

- 独立复核：Framework/系统服务十篇 PASS；安全现行正文五篇与工程历史页三篇 PASS；Compose、Service、JobScheduler、IPC、Web JS、抓包七篇 PASS。Frida 两路评审见 frida-review.md。
- 修正安装图的顺序：commit 后先封存与暂存 APK 初检，再按需用户确认，允许后进入后续验证/安装；补初检失败及用户拒绝分支。删除复审发现的 ServiceManager 和 AMS 末尾报告口吻。
- 用原始 UTF-8 源码核对新增 GitHub 行锚，修正 Handler、ContentProvider、TransactionExecutor、LoadedApk、InputFilter 与安装会话链接。网页抽取结果会折叠空行，不再用其行号直接生成 GitHub 锚点。
- 本轮覆盖 61 个知识库 Markdown 页面，含分类、写作指南、原提纲覆盖页与历史兼容页面；首页组件入口检查后保留。
- 11 项自动测试通过；最终构建通过，62 个生成 HTML、54 个旧站哈希、源码排除检查通过。检查全部知识页的 5,614 处站内片段链接，无失效锚点；git diff --check 通过。
- 手机视口 DOM 验收：Frida 五页、WMS、ContentService、PackageInstaller 和通用组件安全均无页面横向溢出或 Mermaid 错误；新增安装图的失败/拒绝分支可见。Frida 分类五项与 enumerateMethods 搜索通过，图表放大到 130% 后关闭成功；源码 ZIP 七文件逐字节匹配，HTTP 200，与构建副本 SHA-256 相同。
- 构建仍提示部分包体超过 500 kB，为现有 Mermaid 等依赖体积提示，不阻止生成。未执行 APK、Frida 注入或设备实验，未提交、推送或发布。
