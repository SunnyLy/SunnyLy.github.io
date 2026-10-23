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

## GitHub Pages 发布：ServiceManager 与 Compose State

- 按用户发布指令提交并推送 `796bd3680660ec56e1b31a18ca9e0090ae0f8541`；GitHub Actions [39750659574](https://github.com/SunnyLy/SunnyLy.github.io/actions/runs/39750659574) 的 build、deploy 均成功。
- 线上 ServiceManager 与 Compose State 页面均返回 HTTP 200，各有 3 张 Mermaid SVG、无图表渲染错误；Framework / Kotlin 分类入口正常。

## Compose 渲染流程笔记

- 读取钉钉原文文字与内嵌主流程图，新建 `docs/android/kotlin/compose-rendering.md`，接入 Android / Kotlin 分类和概览入口。原截图涉及的实现说明改用核验后的源码解释与重绘流程图，未归档原截图。
- 固定 AndroidX 提交 `a7537bce15de1ae43654cfcfdbb115211977a632`，17 个源码链接全部固定到该提交。文章共 10 节、3 张 Mermaid 图，修正编译期创建布局节点、SlotTable 直接绘制等表述，补充 `dispatchDraw` 到节点绘制及屏幕呈现的边界。
- 最终构建通过：15 个知识库 HTML 页面、54 个旧站文件哈希一致；6 项自动测试通过。保留既有大分块提示。
- 浏览器确认 3 张流程图生成 SVG、无图表渲染错误；手机分类中 Kotlin 分组及文章入口可点击，中文搜索“绘图清单”命中并跳转第 2 节；图表查看器由 100% 放大至 130%，复位至 100% 后关闭。
- 手机窄屏实际 DOM 宽度 416px，分类目录和查看器打开时 433px，均无整页横向溢出。以上为 DOM 和交互验证，未进行截图视觉验收、Android 示例编译或真机运行验证。
- 本篇为本地待发布内容，未提交或推送；未修改已有 `AGENTS.md`。

## GitHub Pages 发布：Compose 渲染流程

- 按用户发布指令提交并推送 `933690665cc9d1670c390860c1f656a6507de4ce`；GitHub Actions [39753569196](https://github.com/SunnyLy/SunnyLy.github.io/actions/runs/39753569196) 的 build、deploy 均成功。
- 线上新文章返回 HTTP 200，固定源码基线和 Kotlin 导航入口存在；浏览器确认 3 张流程图生成 SVG、无图表渲染错误。

## Web JS 逆向笔记

- 读取钉钉原文分段文字与代码至评论区，导出并检查 6 张可获取截图；研究原图保存在忽略的 `artifacts/research/web-js-reverse/originals/`，正文选用其中两张 DevTools 教学截图，存于 `docs/public/media/web-js-reverse/`，不依赖钉钉外链加载。
- 新建 `docs/reverse/web-js-reverse.md`，共 12 节、2 张流程图、1 张请求时序图、2 张图片及 Java / JavaScript 示例；接入逆向 / Web 导航与分类概览，移除该分类尚无笔记的占位描述。
- 核对 Android WebView、Chrome DevTools、Frida、MDN、Babel、Node.js 官方资料，明确新版 WebView 默认调试条件与旧指南的差异；补充进程边界、调用栈、可恢复 Hook、参数字节、数据变换、混淆、Native Bridge / Worker / Wasm 与多样本验证。
- 最终构建通过：16 个知识库 HTML 页面、54 个旧站文件哈希一致；6 项自动测试通过，保留既有大分块提示。额外执行文章中 4 组普通 JS 示例，断言 this / 全实参转发、同步异常、Promise 身份与拒绝、属性恢复、非法目标及恢复冲突保护、查询编码和 SHA-256 向量均通过。首次验证脚本中的中文正则受 PowerShell 管道编码影响，改用错误类型断言后通过，文章示例未因此改动。
- 浏览器确认 2 张流程图与 1 张时序图生成 SVG、无图表渲染错误；两张本地图片加载成功，调用栈截图可打开大图；时序图查看器由 100% 放大到 130%，复位至 100% 后关闭。
- 手机窄屏实际 DOM 宽度 416px，目录与查看器打开时 433px，均无整页横向溢出；分类概览可跳转文章，手机侧栏含逆向 / Web 分组及正确入口；中文搜索“字节处理”命中新文章并跳转第 7.2 节。
- 以上为文档构建、示例独立运行及 DOM / 交互验证，未进行截图视觉验收、Android 示例编译、Frida 注入或真机案例运行。本轮未提交、推送或发布，未修改已有 `AGENTS.md`。

## Android 安全知识体系

- 完整读取钉钉《Android基础安全提纲》，保留 80 个原始段落 ID；按基础、工程、审计三级学习路径新增 15 篇专题，逐项覆盖与勘误表位于 `docs/security/android/coverage.md`。原文无图片或附件。
- 依据 Android Developers、固定标签 AOSP、OWASP MASVS / MASTG 及相关项目官方文档补充原理、成立条件、版本边界、防护和验证方法。学习层级不代表漏洞严重性或认证等级。
- 规划阶段两轮评审通过；正文交叉审校修复 URI 编码键检查歧义、同进程 AIDL 身份边界、匿名 MIME 默认委托，以及覆盖表 Android API 依据错配，复核均通过。覆盖 80/80、导航 15/15，全部主篇章及补充锚点有效。
- 最终 `npm test` 的 6 项测试通过；`npm run docs:build` 通过，验证 32 个知识库 HTML 页面与 54 个旧站文件哈希，保留既有大分块提示。额外检查新增 16 个 HTML 中 978 个站内链接及锚点，无缺失；`git diff --check` 通过。
- 生产预览中逐篇确认 15 张 Mermaid 图生成 SVG、无渲染错误；Provider 图查看器从 100% 放大至 130%，复位至 100% 并关闭；深色模式的 Service / IPC 时序图正常渲染。检查的文章页面控制台无错误。
- 手机布局实际 DOM 宽度 416px，侧栏打开时 433px，均无整页横向溢出；侧栏含三组全部 15 篇入口并可跳转。搜索“重复参数”命中 URI 专题并跳转 `#query-parameters`；覆盖表显示 5 张表、80 行，页面宽度与滚动宽度均为 416px。
- 预览服务在重新构建后缓存旧资源目录，曾导致脚本 404 与图表停留加载；构建完成后重启预览即恢复，未修改站点代码。浏览器工具的固定等待曾提前超时，后续直接检查 SVG DOM 确认渲染结果。
- 验证范围为文档、来源、构建及浏览器 DOM / 交互；浏览器后端不支持截图，因此未作截图视觉验收；未编译 Android 示例、未运行真机安全案例。未提交、推送或发布，未修改已有 `AGENTS.md`。

## Android 安全分类恢复为原提纲

- 按用户修订意见，将前台分类改为通用组件安全、配置安全、文件操作、特殊函数、Dos攻击。概览与左侧导航均按原提纲子项及说明段落的顺序排列，详细正文继续保留；覆盖表同步使用原分类名称。
- 新增 `docs/.vitepress/android-security-outline.ts`，按原段落 ID 维护可折叠的层级目录。核对 80 个 ID 与来源顺序完全一致，无重复遗漏，概览链接及全部目标锚点有效，前台移除基础、工程、审计分组。
- 6 项自动测试通过；最终构建通过，验证 32 个知识库 HTML 页面、54 个旧站文件哈希与源码排除。17 个安全页面的 2205 个站内链接及锚点检查通过。校验先后拦截并修复了目录层级字段误用和 Node 直接导入所需的 `.ts` 扩展名问题，未关闭校验规则。
- 浏览器确认手机侧栏包含五类名称；Activity 的权限子项直达 `#permission-policy`，Dos攻击可以展开并通过 URLDecoder 子项直达 `#url-decoder`。概览与正文实际宽度 416px，侧栏打开时 433px，均无整页横向溢出。验证仍限于 DOM / 交互，未新增截图验收或 Android 设备验证，未提交、推送或发布。

## Android 安全正文与目录一致性修复

- 根因：上一轮仅重排左侧链接，正文仍散落在混合主题的旧专题中；概览子项使用列表，无法成为本文目录。此次新增五章完整正文并迁移对应知识内容，80 个原段落按原层级对应正文标题；左右目录指向同一章同一标题，四级说明通过页面 `outline: [2, 4]` 显示。
- 五章正文分别为 `component-security.md`、`configuration-security.md`、`file-operations.md`、`special-functions.md`、`dos-attacks.md`。旧专题保留历史内容和新章节入口，设置 `search: false` 与 `outline: false`，避免全文搜索再进入混合目录；概览、覆盖表及导航同步到新章节。
- 新增 3 项回归测试，验证原段落顺序、同章标题/锚点一致及覆盖表入口；全部 9 项测试通过。构建通过，验证 37 个知识库页面和 54 个旧站文件哈希；22 个安全页面共 2923 个站内链接与锚点检查无缺失。
- 浏览器逐章实测：右侧条目与正文标题在文字、顺序、锚点上完全一致，数量分别为 31、20、4、6、14；五章共 16 张图渲染成功，无图表错误，逐章点击末级目录均到对应正文。手机本文目录显示四级条目，点击共享路径最小化防护直达 `component-security.html#s96`，实际宽度与滚动宽度均为 416px。
- 仍未进行截图视觉验收、Android 示例编译或真机案例验证，未提交、推送或发布。后续 Android 基础知识提纲需沿用同章标题与目录一致的验证门禁。

## Android 基础提纲笔记

- 首轮仅按可见片段新增 Binder、Handler、Messenger 三篇及导航。此前“完整读取、未见附件”的判断有误：钉钉使用虚拟加载，后续已滚动累计读取末尾并补齐来源。此节其余验证数字仅对应首轮三篇，不表示全部提纲已覆盖。
- 结合 Android Developers 与固定 AOSP `android-16.0.0_r1` 核对 Proxy 组合关系、JavaBBinder 桥接、Handler 分发顺序、Messenger 构造和 onBind 返回值；说明 MessageQueue 的实现目录差异、公开 SDK 与隐藏接口边界。
- `npm.cmd test` 全部 9 项通过；构建验证 40 个知识库 HTML、54 个旧站文件哈希与源码排除。新增三篇和 Android 概览的 514 个站内链接及锚点均有效；`git diff --check` 通过。
- 浏览器逐篇核对正文与右侧目录，条目数 11、11、13，文字、顺序和锚点全部一致；逐篇目录点击均改变到正确目标，3 张 Mermaid SVG 渲染成功，无图表错误。Messenger 图表查看器由 100% 放大至 130%，复位回 100% 并关闭。
- 手机窄屏验证基础分类进入 Handler、Messenger 本文目录进入 sendingUid 小节；中文搜索“延迟不是准点执行”命中新笔记并跳至对应标题。实际 DOM 内容宽 416px、窗口报告宽 433px，无整页横向溢出。
- 以上为 DOM 和交互检查，未进行截图视觉验收、物理触控测试或 Android 示例编译及真机运行；未提交、推送或发布。

## Android 基础提纲完整性补齐与启动时序

- 确认遗漏来自钉钉编辑器的虚拟加载：滚动至末尾并累计段落 ID，取得 85 个原段落与 2 张原图。`android-basics-source-outline.json` 保存来源，`android-basics-coverage.json` 逐段分类为 64 个知识条目、10 个空段落、6 个参考链接、2 个上下文标签和 3 个用户指定排除项。Frida Hook、strace 及其参考不进入站点导航或文章。
- 在原三篇基础上新增四大组件、核心服务、PendingIntent、LoadedApk、类加载与动态代理共九篇及阅读索引，基础目录现有 13 页。左栏按原顺序组织，在基础下保留“四大组件”子组；核心服务保持 AMS/ATMS、PMS 五方法、WMS、ContentService、PackageInstallerService 与安装会话层级。
- AMS/ATMS 加入 Launcher 点击图标至目标应用首帧的完整 Mermaid 时序，实际 SVG 包含 48 条消息。标出进程边界、Binder / Socket / 内部协作、应用主线程派发、Application / 初始 Provider、Activity 生命周期、窗口与显示合成；说明进程/任务复用、USAP、冷启动提前调度标志及请求返回、onResume、TTID/TTFD 的区别。关键入口核对固定 AOSP `android-16.0.0_r1` 和公开文档，不推断设备配置。
- `npm.cmd test` 全部 11 项通过；补强目标缺失断言后，单独重跑两项基础提纲回归亦通过。最终构建验证 50 个知识库 HTML、54 个旧站文件哈希和源码排除；基础 13 页的 1,801 个站内链接/锚点有效，`git diff --check` 通过，新增基础 Markdown 无尾随空白。
- 浏览器核对新增九篇与索引的 H2/H3 正文和右侧目录，条目数为 20、10、11、12、10、5、9、8、5、9，文字、顺序、锚点逐项一致。14 张 Mermaid 图全部生成 SVG，无图表错误；完整启动图在桌面与手机查看器均可从 100% 放大至 130%，桌面复位至 100%。
- 两张来源图片已存放到 `docs/public/assets/android/basics/source/`，延迟加载后自然宽度分别 842px、1778px。广播图片点击可打开查看器；两处下载链接保留 download 属性。生产预览下载地址返回 HTTP 200，54,302 / 37,596 字节与本地文件逐字节一致；未触发浏览器保存对话框或验证用户设备的下载落盘。
- 手机模拟布局确认分类侧栏含四大组件子组，可进入核心服务；本文目录直达 `#ams-atms-launch-sequence`，查看器内仍有 48 条消息。搜索 InvocationHandler 命中动态代理对应小节并成功跳转。检查点实际窗口宽 433px、正文滚动宽 416px，无整页横向溢出。
- 验证限于构建、静态链接、浏览器 DOM 与交互；未进行截图视觉验收、真机触控、Android 示例编译或运行。本次未提交、推送或发布。
