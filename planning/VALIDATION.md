# 本地验收记录

验证日期：2026-10-22。范围为本地生产产物和隔离测试页，尚未发布至 GitHub Pages。

## 自动检查

- `node --test tests/*.test.mjs`：6 项通过，覆盖中文与中英文混排搜索分词、旧站复制、目标碰撞、符号链接及输出路径边界。
- `npm.cmd run docs:build`：清理示例后生成 8 个 HTML 页面；54 个旧站文件逐个 SHA-256 匹配；新页面本地资源、链接和源码排除检查通过。
- `git diff --check`：通过。改造文件尚未暂存，因此该命令不能替代对新增文件内容的审阅。
- Mermaid 的延迟加载资源存在超过 500 kB 的构建提示；渲染库在实际图示需要时加载。

## 浏览器检查

本地生产预览使用 `http://127.0.0.1:4174/`。检查使用桌面浏览器及窄视口，并非物理手机。

- 分类抽屉可打开并跳转文章，跳转后关闭；文章直接 URL 和刷新可用。
- 中文正文查询“序列化细节”命中 Binder 文章对应小节，点击进入锚点；无结果查询显示中文提示。
- 320、390、767 CSS 像素视口检查无页面横向溢出；修正主题默认最小宽度造成的窄屏问题。
- 普通 Markdown 与 HTML 图片可打开查看器；Enter 打开、放大至 130%、复位、Esc 关闭、恢复触发点焦点与页面滚动均正常。
- 流程图与时序图均生成 SVG；图示查看器按钮缩放、拖动和滚轮缩放可用。拖动后位移为 60 × 40 CSS 像素。
- 当前浏览器未进入原生全屏，查看器正确回退至铺满视口，退出操作正常。
- 桌面与手机菜单可切换主题；深色状态在刷新后保持，两种图示仍可渲染。后续深色截图捕获超时，因此不将 DOM 检查描述为完整深色视觉验收。
- 已保存浅色截图：`artifacts/mobile-home.png`、`artifacts/mobile-diagram.png`。截图为本地证据，目录不进入版本控制或发布产物。

## 隔离异常用例

测试项目仅位于忽略目录 `.cache/media-fixture/`，直接引用生产主题、查看器和 Mermaid 围栏处理器。独立构建通过。

- 失效图片保留替代文字，点击不打开空查看器。
- 无效 Mermaid 显示错误说明并展开源码；后面的有效图继续渲染。
- `data-no-zoom`（含父容器）图片维持普通图片语义，点击不开查看器。
- 下载图片保留 `download` 属性，不添加查看器角色或键盘入口；未实际触发文件下载。
- 带链接图片通过 Enter 打开查看器，并提供原目标“打开链接”入口。
- 跨文章跳转后重新打开图片正常，页面仅保留一个查看器，关闭后清除滚动锁定。

## 验证限制

- **带链接图片的鼠标点击需普通浏览器复核。** 当前自动化浏览器在 window 捕获阶段已经取消事件并发起链接导航；应用的 document 捕获处理仍正确设置 `defaultPrevented` 与 `cancelBubble`。此行为发生在应用导航处理之前，无法在当前工具环境中完成可靠的端到端确认；未将其标记为通过。
- 双指捏合已实现，物理 Android/iOS 触控、原生全屏以及线上 Pages 发布效果尚未验证。
- 未提交、推送或修改远端 Pages 设置；发布方式见根目录 `README.md`。

## 抓包笔记与附件

- 已新增 `docs/tools/app-network-capture.md`，接入分类导航、工具分类页和站内搜索构建，包含 Mermaid 代理链路图与独立下载卡片。
- 原附件从仓库根目录移动至 `docs/public/attachments/app-network-capture/burp.yml`，304 字节，移动前后 SHA-256 一致：`27c6425a7233bd1d894e868862b31de23069b8cd9b3d8c9f2df764c40d8b095b`。
- 本地生产站点文章与附件均返回 HTTP 200；文章包含单个带 `download="burp.yml"` 的附件卡片；下载响应逐字节匹配原附件。
- 本次构建与 6 项测试通过。浏览器连接持续超时，本次新增卡片的手机视觉效果、实际点击下载与图示交互尚未端到端复核；不将既有组件的验收结果等同于本篇验收。
- 原笔记的代理设置截图尚未取得本地文件；已规划 `docs/public/media/app-network-capture/`，等待原图归档，未使用失效外链或伪造图片替代。

## 发布前清理

- 按用户要求删除 Binder、Intent、证据记录和图文演示四篇示例文章及两张示例图片；移除导航、分类页和阅读指南中的对应入口。
- 首页阅读入口改为从全部分类中查找首篇正式笔记，当前指向 App 网络请求抓包；空分类明确显示整理状态。
- 再次通过构建、6 项测试与附件逐字节校验；生产首页不存在已删除示例的链接。
- 已通过 GitHub API 核对仓库推送权限、Actions 启用状态与发布源，当前 Pages 为 legacy 模式，无自定义域名；待切换 workflow 并发布。

## GitHub Pages 首次发布

- 上述发布前状态已完成切换：Pages 使用 workflow，无自定义域名。提交 `a153bf89f1da1ef931acb2f084f3f89b4dfa2873` 的 [Actions 39719221432](https://github.com/SunnyLy/SunnyLy.github.io/actions/runs/39719221432) 成功。
- 线上首页与抓包笔记返回 200，已删除的图文示例返回 404；线上 `burp.yml` 为 304 字节，SHA-256 与仓库原件一致。

## Framework Binder 笔记

- 新增正式文章 `docs/android/framework/binder-mechanism.md`，接入 Android 分类与侧栏；以 `android-16.0.0_r1` 和独立内核标签 `android16-6.12-2025-06_r1` 为源码基线，不宣称二者是实测设备组合。
- AOSP 调用链与独立并发/身份审校均通过；复核修正事务码是 `transact()` 独立参数的表述，并明确 `getCallingPid()` 返回 0 的条件。
- 构建通过：9 个知识库 HTML 页面、54 个旧站文件哈希一致；6 项自动测试通过。
- 浏览器确认三张 Mermaid 图均生成 SVG，查看器可打开与关闭，缩放由 100% 调至 130% 后可复位至 100%；手机窄屏实际 DOM 宽度 416px，无整页横向溢出。中文“同步重入”命中该文章及正文小节。
- 本次为源码与文档核对，未执行文章中的设备命令；浏览器截图能力受限，不将 DOM 检查表述为截图视觉验收。

## Framework 分类发布检查

- 按用户要求将侧栏组织为 Android → Framework → Binder 机制；文章保存在 `docs/android/framework/binder-mechanism.md`，URL 保持 `/android/framework/binder-mechanism.html`。
- 分组从导航的共享文章数据生成，同一分组内的新文章会合并到同一目录；首页文章入口仍从该数据派生。
- 构建和 6 项测试通过，9 个知识库页面及 54 个旧站文件校验通过；浏览器确认 Framework 可折叠、展开并显示 Binder 入口。
- 用户已明确授权此次发布，使用现有 GitHub Pages Actions 流程。

## SurfaceFlinger 与 VSYNC 笔记

- 已读取钉钉原文至源码索引，新增 `docs/android/framework/surfaceflinger-vsync.md`，并接入同一 Framework 分组及 Android 概览。
- AOSP 调用链与独立应用/缓冲区审校均通过；统一采用 `android-16.0.0_r1`，明确 DRM 参考实现、合成时间戳回退和厂商边界。
- 补充 Composer 会话与反向回调、BitTube/Looper、BLAST、composer3 命令批处理和 fence 契约；deadline 使用绝对时刻表述，区分预算与实际完成。
- 构建通过：10 个知识库页面、54 个旧站文件哈希一致；6 项自动测试通过，`git diff --check` 无空白错误。
- 浏览器确认 3 张 Mermaid 图均生成 SVG；反向回调时序图可从 100% 放大至 130% 并复位。窄屏实际 DOM 宽度 416px，无整页横向溢出；中文“反向回调”可命中正文并跳到对应锚点。
- 未执行文章中的设备查询或采集命令；DOM 检查不等同于截图视觉验收。使用现有 Pages 工作流继续发布。

## Android Token 原理笔记

- 已读取钉钉原文至第 43 节和参考索引，新增 `docs/android/framework/activity-token.md`，接入 Android → Framework 与分类概览。
- 两位独立源码审校均通过；统一采用 `android-16.0.0_r1`，区分 ActivityRecord、WindowToken 容器、IWindow、应用输入身份与输入通道身份，并修正冷启动注册的主线程归属和主/子窗口解析图示。
- 补充现代事务调度、配置重建和进程死亡保留边界、窗口添加异常、权限边界与待执行只读查询；未执行设备命令或虚构设备结果。
- 最终构建通过：11 个知识库页面、54 个旧站文件哈希一致；6 项自动测试通过，`git diff --check` 无空白错误。
- 浏览器确认三张 Mermaid 图生成 SVG 且无错误，身份往返图查看器由 100% 放大至 130% 后成功复位并关闭；正文“层级有效性”可命中新文章并跳转第 9 节锚点。
- 窄屏实际 DOM 宽度 416px 与分类导航展开后的 433px 均无整页横向溢出，Framework 分组只有一个，新文章入口可点击；DOM 检查不等同于截图视觉验收。

## ClientTransaction 机制笔记

- 已完整读取钉钉原文至第 21 节及参考索引，新增 `docs/android/framework/client-transaction.md`，接入 Android → Framework 与分类概览，并交叉链接 Token、Binder 和 SurfaceFlinger 文章。
- 固定 `android-16.0.0_r1` 核对统一 item 列表、跨 Activity 归并、独立立即发送、布局派发、preExecute 线程边界、生命周期补齐与缺失记录分支；三张图分别展示继承、线程时序和 Resume 路径示例。
- 明确 Pause 同步回报、其他三类回报 oneway、StopInfo 延后上报和 finishing 条件下的销毁回报；未执行设备查询或虚构日志与耗时。
- 最终构建通过：12 个知识库页面、54 个旧站文件哈希一致；6 项自动测试通过，`git diff --check` 无空白错误。
- 浏览器确认 3 张 Mermaid 图生成 SVG 且无错误，类图查看器由 100% 放大至 130% 后复位并关闭；中文正文“待发队列”命中新文章并跳转第 4 节。
- 窄屏实际 DOM 宽度 416px 与分类导航展开后的 433px 均无整页横向溢出，Framework 分组唯一，新文章入口可点击；DOM 检查不等同于截图视觉验收。

## ServiceManager 与 AIDL 笔记

- 已完整读取钉钉原文至第 21 节及参考索引，新增 `docs/android/framework/service-manager-aidl.md`，接入 Android → Framework 与分类概览，交叉链接 Binder 与 Token 文章；未改动已有 `AGENTS.md`。
- 固定 `android-16.0.0_r1` 核对 Java / native backend 适配、get/check/wait、两层缓存、Power 发布、LocalServices、AIDL 生成器和应用绑定链，校正 AIDL 必须依赖 Service 组件等过度概括。
- 两轮只读源码审校通过；修正绑定时序图中 oneway 调度与主线程执行的关系，明确记录 Token / 业务 Binder、连接清理、业务权限和调用身份边界。未执行设备查询或宣称设备实测。
- 最终构建通过：13 个知识库页面、54 个旧站文件哈希一致；6 项自动测试通过，`git diff --check` 无空白错误。AIDL 示例采用 Java 高亮，不再产生不支持语言的回退提示；构建仍有既有大分块提示。
- 浏览器确认 3 张 Mermaid 图生成 SVG 且无渲染错误；时序图查看器由 100% 放大至 130%，复位至 100% 并关闭；中文搜索“两层缓存”命中新文章并跳转对应章节。
- 窄屏实际 DOM 宽度 416px、分类导航展开及查看器打开时 433px 均无整页横向溢出；Framework 分组唯一，新文章入口可点击。以上为 DOM 与交互检查，不等同于截图视觉验收或物理触控验证。
- 按本轮最新安全规则保留本地变更，未执行 git commit、git push 或线上发布。

## Kotlin 分类与 Compose State 笔记

- 完整读取钉钉原文至第 24 节与结尾，新建 `docs/android/kotlin/compose-state.md`；Android 导航新增与 Framework 同级的 Kotlin 分组，分类概览增加入口，保留上一轮 ServiceManager 本地变更。
- 固定 AndroidX 提交 `a7537bce15de1ae43654cfcfdbb115211977a632` 核对状态工厂、委托、缓存、Snapshot 读写、策略、动态依赖、提交与 Recomposer；21 个源码链接均指向该提交。明确其为源码快照，未声称稳定库版本或 Android 设备版本。
- 整理为 11 节，补充 3 张图与 Kotlin 示例；修正参数读取的作用域、SnapshotStateObserver 与组合观察的分工，以及状态变化不一定先重组等表述。未在 Android 工程编译示例或进行真机运行验证。
- 最终构建通过：14 个知识库 HTML 页面、54 个旧站文件哈希一致；6 项自动测试通过，`git diff --check` 无空白错误。构建仍有既有大分块提示。
- 浏览器确认 3 张 Mermaid 图均生成 SVG、无渲染错误，4 处 Kotlin 代码高亮；查看器由 100% 放大到 130%，复位到 100% 并关闭；中文搜索“读取链”命中新文章并跳转第 4 节。
- 手机窄屏实际 DOM 宽度 416px，分类目录和查看器打开时 433px，均无整页横向溢出；Framework / Kotlin 分组各一个，新文章分类入口可点击。此为 DOM 和交互验证，不等同于截图视觉验收或物理触控测试。
- 未修改已有 `AGENTS.md`，未执行提交、推送或线上发布。
