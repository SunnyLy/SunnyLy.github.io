# Kotlin、Web 逆向与抓包实践复核记录

复核日期：2026-10-22。范围为下列 6 篇，已按正文顺序完整阅读。只修改明确分配的正文和本记录；保留现有未提交内容，不提交、推送、打标签、发布或删除源码。网站测试、构建及最终浏览器验收由主任务统一执行。

## 逐篇覆盖

### docs/android/kotlin/compose-state.md

- 导读与源码范围：核对 AndroidX 与 Android 系统版本独立、固定提交、示例未编译和未真机测试的说明。
- §1 Kotlin 委托：核对 `getValue` / `setValue`、`mutableStateOf` 与 `remember` 的不同职责；示例为缺少 Material imports 的教学片段，非可直接运行工程。
- §2 remember：核对调用位置、key 的 `==` 比较、离开 Composition 与恢复状态边界。
- §3 State 实现：核对 Android 平台包装、`SnapshotMutableStateImpl` getter / setter、StateObject / StateRecord 角色。
- §4 读取链、Text 参数求值、动态依赖：核对 `readObserverOf`、`recordReadOf`、实际读取位置和依赖清理。修正读取图中内部顺序，见问题 K1。
- §5 等价策略、写入图：核对结构、引用、永不等价策略，外部快照变更集合与组合内写观察分支；没有把赋值次数等同重组次数。
- §6 提交与通知：核对 `withMutableSnapshot` 的 apply 冲突异常、不可挂起与复合读改写的非原子性。
- §7 作用域与调度：核对 RecomposeScope / Composition / Composer / Recomposer 职责、帧时钟与变更合并、副作用边界。
- §8 阶段观察：核对组合、测量、放置、绘制的不同读取与失效路径，OwnerSnapshotObserver 与组合观察器的区别。
- §9 列表、remember 派生值、derivedStateOf：修正只读 `State` 的赋值表述，见 K2；核对快照集合不自动观察元素普通字段，以及显式派生策略与无策略重载的差别。
- §10 snapshotFlow：核对只读快照、重执行、按结果相等去重、快速更新合并与生命周期桥接。
- §11 排查入口：核对入口与前文源码主线一致。除 K1、K2 外未发现需修正的事实错误；不据源码阅读声称实测重组次数。

### docs/android/kotlin/compose-rendering.md

- 导读与范围、§1 声明式模型：核对 Composable、LayoutNode、Android View 数量不一一对应。
- §2 Compiler / Runtime / UI 职责：核对 Kotlin 2.0.0 后编译器仓库归属、生成细节非固定 ABI；补充测量期间子组合例外，见 K3。
- §3 setContent 接入：核对 ComponentActivity 复用 ComposeView、Owner 设置顺序、ComposeViewContext、AndroidComposeView 与 UiApplier。
- §4 LayoutNode：核对 `Layout` 的 ReusableComposeNode 工厂、节点更新和 UiApplier 的 bottom-up 插入。
- §5 组合记录：核对 slot 存储选择、组合记录与 UI 树边界，不把 SlotTable 当绘图指令表。
- §6 测量与放置：核对约束、单次普通测量契约、Lookahead / 内在测量限定及 Android View 接入。
- §7 绘制：核对空 onDraw、dispatchDraw 先 measureAndLayout、根节点绘制、脏图层处理与 Coordinator 图层分支。
- §8 呈现：核对绘制调用、渲染工作与最终显示的边界；没有实测设备呈现帧。
- §9 按状态读取阶段更新、§10 观察点：核对与 State 文一致。K3 为适用边界补充，其余未发现需修正的事实错误。

### docs/reverse/web-js-reverse.md

- 导读与 §1 闭环：核对基线、变量控制、输入字节与证据链，不据函数名推断算法。
- §2.1 WebView：官方 API 确认调试开关为 API 19、WebView 113.0.5656.0 后可依 debuggable 默认开启；区分提供者版本与系统 API。
- §2.2 既有运行时片段：按任务排除范围保留，不扩展或增加 Hook；仅查官方 Java API，区分 VM 附着和主线程调度。片段仍未设备执行。
- §2.3 设备与目标页面：核对远程调试步骤、实际系统 / WebView 查询，未假设设备环境。
- §3 DevTools、§4 请求回溯、§5 调用栈：核对断点类型、Network / Initiator、HAR sanitized 仅隐藏部分请求头、异步帧与 Ignore List 边界。
- §6.1 普通方法观察器、§6.2 时机与上下文：核对自身可写数据属性限制、this / 参数 / 返回值 / 异常 / Promise 身份、恢复冲突与闭包引用限制；执行普通 JS 示例，见验证。
- §7 变换分类、§7.1 序列化、§7.2 SHA-256：核对编码、摘要、HMAC、签名和加密职责；以规范核对属性顺序与表单空格编码，并执行公开 abc 摘要向量。
- §8 AST：核对 Babel parser / traverse / generator 职责、Source Map 映射与实际执行代码的区别、语义等价与作用域限制。
- §9 边界：核对 WebView bridge、Worker / Service Worker 独立上下文、Wasm 文本格式和 Node VM 的非安全边界；校正 WAT 定义，见 W1。
- §10 多样本验证、§11 记录、§12 引用：核对 HTTP 200 非业务成功、CORS 非认证、三种证据强度。其余未发现需修正的事实错误，未运行目标站点或实际 App 案例。

### docs/reverse/index.md

已覆盖导言、Web 入口与跨主题连接；内容与 Web 正文相符，没有技术 API 或运行结果断言，无需正文修订。站内链接由主任务构建与浏览器统一验证。

### docs/tools/app-network-capture.md

- 导言与准备：核对原始经验与未重测声明、电脑 / 手机地址区别、HTTP 代理与上游链路及三个端口职责。
- §一 配置：只读核对原始附件 304 B、HTTP 节点、Global 模式、手动组和 MATCH 规则；修正实际出口选择与流量接管前提，见 T1、T2。未改第三方附件。
- §二 CA：核对 Android target SDK 默认信任和自定义校验 / pinning 边界；补充官方调试配置，见 T3。原系统证书链接确为模拟器限定指南，保留限定。
- §三 普通 / 上游命令：核对 http2、listen-port、web-host、web-port、upstream HTTP 语法、缺失本地脚本的说明；补充当前 stable 文档的 Web UI 认证和监听边界，见 T4。
- §四 验证与附件说明：核对分阶段连通、证书、上游故障归因与原 IP 需要替换。未启动真实抓包、未安装 CA、未操作手机或目标 App。

### docs/tools/index.md

已覆盖工具定位、抓包入口、Markdown 与本地素材、可复用记录要求；与实际正文一致，无需修订。

## 修订问题与精确证据

### K1：读取图把观察回调放在状态记录选择之后

- 位置：`compose-state.md` §4，行 78 至 84。
- 原错误：流程边先到“选择当前可见 StateRecord”，再到 readObserver。
- 正确结论：固定源码 `Snapshot.kt` 行 2385 至 2388 先取得 Snapshot、调用 `readObserver`，再选择可见记录；组合读观察再进入 Composition 的当前作用域记录。
- 修改：改为 getter → readObserver → recordReadOf → 当前作用域 → 选择记录并返回值。保留派生状态额外分支限定。
- 来源：[Snapshot.readable](https://android.googlesource.com/platform/frameworks/support/+/a7537bce15de1ae43654cfcfdbb115211977a632/compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/snapshots/Snapshot.kt#2385)、[readObserverOf](https://android.googlesource.com/platform/frameworks/support/+/a7537bce15de1ae43654cfcfdbb115211977a632/compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/Recomposer.kt#1471)、[recordReadOf](https://android.googlesource.com/platform/frameworks/support/+/a7537bce15de1ae43654cfcfdbb115211977a632/compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/Composition.kt#1161)。

### K2：只读 State 的替换表述不精确

- 位置：`compose-state.md` §9，行 191。
- 原错误：写成替换 `State<List<T>>` 的值，未指出只读接口。
- 正确结论 / 修改：`State<T>.value` 是 `val`；通过 `MutableState<List<T>>.value` 或其他可写状态持有者替换。
- 来源：[State / MutableState 定义，行 75、98](https://android.googlesource.com/platform/frameworks/support/+/a7537bce15de1ae43654cfcfdbb115211977a632/compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/SnapshotState.kt#75)。

### K3：补充概念流水线的子组合适用边界

- 位置：`compose-rendering.md` §2 图后，行 58。
- 原缺口：虽标明概念主线与后续跳过，仍可能被读作所有子项均须在测量前完成组合。
- 正确结论 / 修改：BoxWithConstraints、LazyColumn 等允许在父布局测量期间组合所需子项；明确这类例外，保留原有概念图。
- 来源：[Compose 三阶段及例外](https://developer.android.com/develop/ui/compose/phases#the-three-phases-of-a-frame)。

### W1：WAT 的定义应落在模块抽象语法

- 位置：`web-js-reverse.md` §9，行 269。
- 原缺口：“二进制的文本表示”容易与二进制字节转文本混淆。
- 正确结论 / 修改：文本格式是模块抽象语法的表示，与二进制格式表达同层次模块结构，不等于恢复高级语言源代码；改用官方规范引用。
- 来源：[WebAssembly text conventions](https://webassembly.github.io/spec/core/text/conventions.html)。同时将 Reflect.apply、JSON、URLSearchParams 的解释性引用替换为已核对的 ECMAScript / WHATWG 规范，算法与示例不变。

### T1：Global 出口选择与自定义组选择不能混同

- 位置：`app-network-capture.md` §一，行 40。
- 原缺口：只要求“主动选择 burp”，没有说明 Global 实际取内建 GLOBAL 组，附件的 MATCH 规则在此模式不决定出口。
- 正确结论 / 修改：在 GLOBAL 选 burp；若选自定义组，组内还须选 burp。按 Mihomo 官方文档说明兼容内核语义，不虚构旧版手机客户端界面。
- 来源：[Mihomo Operation Mode](https://wiki.metacubex.one/en/config/general/#operation-mode)；本地原始附件只读核验。

### T2：补齐目标 App 流量进入代理的前提

- 位置：`app-network-capture.md` §一，行 41。
- 原缺口：导入配置并开启代理，未说明本地监听与 VPN / TUN 接管的差别。
- 正确结论 / 修改：开启客户端相应接管模式、确认目标 App 未排除，并以电脑收到实际请求验证；仅开放 HTTP / SOCKS 监听不使其他 App 自动使用。
- 来源：[Android 按应用 VPN](https://developer.android.com/develop/connectivity/vpn#per-app)、[mitmproxy regular proxy](https://docs.mitmproxy.org/stable/concepts/modes/#regular-proxy)。

### T3：CA 信任必须区分平台支持与 target SDK

- 位置：`app-network-capture.md` §二，行 47。
- 原缺口：只有“装用户证书不保证能抓包”，缺少默认行为判断条件。
- 正确结论 / 修改：在 Android 7.0 及以后支持该配置的平台，target 24 及以上默认仅系统 CA，target 23 及以下默认另信任用户 CA；显式配置、自定义 TLS 或固定证书另论。补充自有调试应用 debug-overrides。
- 来源：[Network Security Configuration 默认值与调试覆盖](https://developer.android.com/privacy-and-security/security-config)。

### T4：当前 mitmweb Web UI 可能要求随机令牌

- 位置：`app-network-capture.md` §三，行 61。
- 原缺口：直接要求打开裸 8081 地址，未说明当前 stable 认证；web-host 与代理 host 容易混淆。
- 正确结论 / 修改：使用终端输出或自动打开的完整地址；当前 stable 文档说明空 web_password 生成令牌，旧版以实际输出为准；分别说明 web_host 与 listen_host。
- 来源：[mitmproxy Options 的 web_password / web_host / listen_host](https://docs.mitmproxy.org/stable/concepts/options/)。本机实际版本为 10.4.2，不能据当前 stable 文档推断它具有相同认证行为。

## 其余主要第一手来源

- [Kotlin 属性委托](https://kotlinlang.org/docs/delegated-properties.html)、[Kotlin Compose compiler migration](https://kotlinlang.org/docs/compose-compiler-migration-guide.html)。
- [Compose state](https://developer.android.com/develop/ui/compose/state)、[phases](https://developer.android.com/develop/ui/compose/phases)、[side effects](https://developer.android.com/develop/ui/compose/side-effects)、[custom layouts](https://developer.android.com/develop/ui/compose/layouts/custom)。
- [WebView API](https://developer.android.com/reference/android/webkit/WebView#setWebContentsDebuggingEnabled(boolean))、[WebView bridge API](https://developer.android.com/reference/android/webkit/WebView#addJavascriptInterface(java.lang.Object,%20java.lang.String))。
- [DevTools breakpoints](https://developer.chrome.com/docs/devtools/javascript/breakpoints)、[Network reference](https://developer.chrome.com/docs/devtools/network/reference)、[JavaScript reference](https://developer.chrome.com/docs/devtools/javascript/reference#call-stack)、[source maps](https://developer.chrome.com/docs/devtools/javascript/source-maps)、[Console utilities](https://developer.chrome.com/docs/devtools/console/utilities#debugfunction)。
- [ECMAScript Reflect.apply](https://tc39.es/ecma262/2022/multipage/reflection.html#sec-reflect.apply)、[JSON serialization](https://tc39.es/ecma262/2022/multipage/structured-data.html#sec-serializejsonobject)、[WHATWG URL](https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior)、[Fetch CORS](https://fetch.spec.whatwg.org/#http-cors-protocol)。
- [W3C Web Crypto 2017 Recommendation](https://www.w3.org/TR/2017/REC-WebCryptoAPI-20170126/#subtlecrypto-interface)、[Service Workers FetchEvent](https://w3c.github.io/ServiceWorker/#fetch-event-section)、[Node VM](https://nodejs.org/api/vm.html)。
- [Babel parser](https://babeljs.io/docs/babel-parser)、[traverse](https://babeljs.io/docs/babel-traverse)、[generator](https://babeljs.io/docs/babel-generator)。既有运行时片段仅核对 [Frida Java API](https://frida.re/docs/javascript-api/#java)，未新增专题或执行注入。

## 验证与限制

- 固定基线：`a7537bce15de1ae43654cfcfdbb115211977a632`。从两篇 Compose 正文抽取全部 23 个不同 `.kt` 引用，实际通过官方 Gitiles `?format=TEXT` 并行获取，均 HTTP 200；解码后 SHA-256 与 `artifacts/research/compose-state/`、`compose-rendering/` 已有副本全部一致。web 页面获取失败后改用官方原始接口，不用其他分支替代固定提交。
- 在这些已校验源码中按函数与行号读取相关实现，核对的读取主线为 `Snapshot.kt:2385` → `Recomposer.kt:1471` → `Composition.kt:1161`；绘制主线为 `AndroidComposeView.android.kt:2423` → `LayoutNode.kt:1054` → `NodeCoordinator.kt:507`。大文件只展示需要的局部。
- Node.js 实际版本 `v24.11.1`：从 Web 文正文提取 4 个普通 JS fenced blocks，排除 Android 运行时片段；6 个示例断言全部通过，包含 this、Promise 对象身份、JSON 顺序、URL 空格、SHA-256 abc 向量；另验 7 项边界（原异常身份、接收者、恢复函数身份、恢复描述符、冻结对象拒绝、访问器拒绝、恢复冲突）通过。
- 第一次临时测试工具的非 ASCII 正则受 PowerShell 管道编码影响而语法失败；移除该测试正则，改为断言 Error 类型后通过。失败来自临时验证脚本，不是正文示例，未以文档改动掩盖失败。
- 本机 `mitmweb --version` 实查为 `10.4.2 binary`；`--help` 输出确认文中六类参数存在（set、mode、scripts、web-port、web-host、listen-port），但该命令退出码为 1，不将帮助输出说成抓包成功。未启动代理、未做 CA / Clash / App 端到端实测。
- 已执行 `git diff --check`，无空白错误，只有仓库行尾转换提示；最终全站测试、构建和浏览器结果由主任务补入总记录。
- 需主任务浏览器验收：State §4 修改后的 Mermaid 读取图、相关页面阅读与手机目录。其余图未改；没有改标题、路由或共享导航。
- Kotlin / Android 示例未编译、未真机执行；实际重组、线程、呈现时刻与抓包兼容性仍需匹配应用依赖、设备和客户端版本验证。未声称历史截图代表当前版本。

## 第二轮自检

结论：PASS，正文冻结，交主任务独立抽核与最终页面验证。

- K1：`compose-state.md:83`、`:84` 的图边先进入 Observer，再到 Track / Scope，最后选择 Record，与固定源码 `Snapshot.kt:2385` 至 `:2388` 一致。
- K2：`compose-state.md:191` 已明确 `MutableState<List<T>>.value` 与只读 State。初始示例现有 `Composable`、`getValue`、`mutableStateOf`、`remember`、`setValue` imports 均存在；组件 imports 的省略与未编译范围已明确。此次修改没有引入新代码块或未导入的新调用。
- K3：`compose-rendering.md:58` 明确普通布局主线和 BoxWithConstraints / LazyColumn 子组合例外，没有改写成每帧固定全量执行。
- W1：`web-js-reverse.md:269` 直接引用 Wasm 官方模块文本规范，未宣称恢复原 C / C++ 源码；`:160`、`:207`、`:220` 使用语言与 URL 规范。
- T1 / T2：`app-network-capture.md:40`、`:41` 区分 GLOBAL 选择、自定义组内选择和 VPN / TUN 接管，仍要求实际请求验证；未把某个新内核的界面名称声称为原客户端实测。
- T3：`app-network-capture.md:47` 同时限定平台与 target SDK，并保留显式配置和自定义 TLS / pinning 边界。
- T4：`app-network-capture.md:61` 明确认证说明来自当前 stable 文档，旧版本按实际输出，未把本机 10.4.2 当成相同实现；web_host / listen_host 已分开。
- 方法：用 Node `assert/strict` 对上述改后事实和原 imports 做定点断言，输出 `Second-pass assertions PASS`；再检查 4 篇正文 diff，未改标题 / 路由 / 附件 / 共享导航。定点断言仅辅助防遗漏，事实依据仍是各问题的官方来源。
- JS 执行方法补记：正则提取正文 `javascript` fenced blocks，排除包含 `Java.perform` 的块，以 `new Function` 的 async 包装按顺序执行，传入会在断言失败时抛错的 `console.assert` 替身，避免普通 console.assert 仅打印错误而使进程成功退出；附加边界断言使用 `node:assert/strict`。SHA-256 使用运行时 Web Crypto，没有替换算法。

23 个官方源码文件校验摘要（SHA-256；均与本地同名副本相等）：

```text
SnapshotState.kt f8a232ed56459172a07cc8c8a1c3804866b511127bb960bc710c46120f8d4d6e
Composables.kt 36abefa429f54144b7f8353425cda969f8c3a5f56b4560942855cd3ff8b6e00b
Composer.kt a2b603b85e780c12a271970f6f93a3d3f6f8fc185c2d0ee0468b3f4625de041f
SnapshotState.android.kt e87a3629631d0a6fef8fea9a1cdd7567a8261b010f728e947c846e7e28ccccf2
Snapshot.kt 711a754735c9224ee1531c93e70f09195a36e87ecebfc4b9c55c061aec620563
Recomposer.kt 0fdedeedc19f067b07efacdec458271a6bcb75d0f041b78d9f7acd2efae2401e
Composition.kt a2dc28011456089607e4d16ca511bc51d48bc9c1bdd8a7c5d5150af59bfac0e4
RecomposeScopeImpl.kt 3e1629f92f411914fd076a4813fc606181588beada5d11b173b6256d108b8d8c
SnapshotMutationPolicy.kt b246d37dcb8ad0fd969b09b503d4dcb6057411ba75196ffed430ddc5ea1c4854
SnapshotStateObserver.kt 00c33d598077337c3640fbd5fb77067e4242a7e8ab2c2bbb2d01b5420654b6af
OwnerSnapshotObserver.kt 425237c750c337a8b0da34c2354bb1e3d56ffc7bae4336d93f8862af0c42f104
DerivedState.kt fa3c0f17519b66ececb9729f139bd8fc3f70e3774e26a310a7f46aa401cf510e
SnapshotFlow.kt 155e762b0619ff86bffb49f99fdcabf171d9e20bb36279e30eb7ab2797fb7997
ComponentActivity.kt 09866e148e8e5df76ade903148923b03e24a7aa302734b0fecbe24411a854986
ComposeView.android.kt 8d2aa9ba0432806cdef97219ea66f67c237f15f058c79a975bfce5ca30b387a3
Wrapper.android.kt d73c2e58480f3921f6d961de5761dd2bfd0995736ed8d3df53acfab33fe88c73
AndroidComposeView.android.kt 3ebca3043b05ca5b05e07fa580f7321a1467c768a3a86db6856370f8ffc07f83
Layout.kt 62c25604fe2f8dcda24dfce0e7b687a4bf10b0a17bbe296a594d7c77c41df8a0
ComposeUiNode.kt 080654e3dcc4facfea87951d04f42da05e930d9f5ea149b0c79f58964f0ed568
UiApplier.android.kt f3bf395d62ba6b6ea04639fa6178a8807683c41e23c5c73d44b60b8c91a96dc1
MeasureAndLayoutDelegate.kt b98393246572f98e8917ce054c8bafeb48f2c5668c0f3deef5d246abdedad410
LayoutNode.kt 6943c797925bf45506829c48cca6af1c3cd7ebcacb92176d9b098169a60561f0
NodeCoordinator.kt 483779b7d4c7c8ccd00c2d2a5fa57d03330fb55ed4b9e65aba855293fbe85ab7
```
