# Android 安全知识复核记录

复核日期：2026-10-22。范围是 `docs/security/android/` 的 21 页及 `docs/security/index.md`，共 22 页。逐篇按连续正文分段阅读，包含旧专题全文、代码、图示和验证限制；没有以关键词命中替代阅读。保留“通用组件安全 / 配置安全 / 文件操作 / 特殊函数 / Dos攻击”五章及所有既有标题、层级和锚点。

本组正文已冻结供主任务统一构建和浏览器验证。仅修改 5 个已有页面及本记录；不修改共享导航，不执行重组脚本，不提交、不推送、不发布。

## 逐篇与小节覆盖

下述“通过”表示文档机制与适用条件审阅完成，不表示 Android 样例已编译或设备实验通过。S 编号与 `coverage.md` 的原段落标识一致。

1. `android/component-security.md`：完整覆盖开篇 UID/平台权限/业务授权及 S6–S96。Activity 的权限、暴露、Intent、深链、键盘；广播的动态/静态导出、双向权限、嗅探、粘性；Service 的暴露、目标、AIDL、本地/远程/异步身份、Messenger、FGS；Provider 的导出、路径、SQL、URI grant、MIME/匿名查询、无效 URI、authority、FileProvider 各小节均通过。没有新发现需改正文的问题。
2. `android/configuration-security.md`：完整覆盖 S102–S159。权限、UID、sharedUserId、REBOOT、debuggable/新旧备份 XML/跨平台迁移、自定义权限、任务栈、命名空间、导出、隐藏入口、元数据、账户恢复/撤销、卸载、头像、包体、剪贴板、R8、位置/设置、动态代码各小节均完成；S153 的位置示例补最低运行/编译条件（R2），其余通过。
3. `android/file-operations.md`：开篇访问主体与导入/导出模型、S165 上传、S168 下载、S171 文件读写、S174 Bitmap 全部通过。复核实际字节预算、来源与授权、重定向、canonical 边界及竞态、AtomicFile 不提供锁、像素乘法溢出与峰值差异；不把受控路径示例称为完整解析器。
4. `android/special-functions.md`：开篇能力模型、S180 命令、S183 解压、S186 路径段、S189 序列化、S192 JEXL、S195 TA 全部通过。区分 shell/参数注入，核对可信解压根、资源配额、API34 ZIP 行为条件、类型化读取的能力边界、JEXL 滚动文档 3.7 默认变化与 TA 条件解释。
5. `android/dos-attacks.md`：开篇可达性/资源模型、S201–S240 全小节覆盖。S201 修正 package 与 component 的优先关系，并补 resolveActivity 和 selector 条件（R1）；URI、历史 Fragment、Base64、flags、内容导入、文本选择、包查询/Binder、表单解码及全部子项其余通过。异常不等于越权或持续 DoS，缓冲区与请求回复不确定性已有正确限制。
6. `android/coverage.md`：逐项覆盖全部 80 个 S 条目与五章映射，检查“展开/纠正/条件化”是否与正文一致；S201 同步 R1，其余通过。75 条带 S 锚点的正文定位均与对应标题精确匹配。
7. `index.md`：五章导读、全部条目和阅读说明完整覆盖。修正 13 处能访问但指向非同名小节的链接（R3）；不变动任何标签文字与层级。75 条带 S 锚点的链接均与目标标题精确匹配。
8. `android/foundation/security-model.md`：UID/共享身份、导出/版本、权限声明/自定义等级/命名空间、最终产物审查及全部验证段通过；与五章相应结论一致。
9. `android/foundation/activity-intent.md`：入口、转发、set-package、deep-links、uri-grants、task-stack 全节覆盖。set-package 与主章同步 R1；其余通过。生命周期回调不能当直接客户端事务、App Links 不授权业务对象的描述正确。
10. `android/foundation/broadcast.md`：broadcast-model、manifest-receiver、runtime-receiver、broadcast-permissions、broadcast-eavesdropping、sticky-broadcasts 全节及验证段通过；OS/target 条件、NOT_EXPORTED 对部分高权限系统应用广播的限制、收发权限方向正确。
11. `android/foundation/service-ipc.md`：service-entry、service-hijacking、binder-authorization/aidl-methods、async-identity、messenger、foreground-service 全节通过；本地 oneway 仍同步，onBind 不代表每次事务身份，Handler 执行不延续 Binder 身份的说明与主章一致。
12. `android/foundation/provider.md`：authority-routing/conflicts、provider-permissions/exported、path-permissions、uri-sharing、mime-type/anonymous-mime、invalid-uri 全节通过；不导出与特定 URI grant 可并存，MIME 默认委托及 API34 条件正确；authority 利用链仍明确未做安装实验。
13. `android/engineering/file-sharing.md`：file-boundaries、fileprovider-roots、uri-grants、untrusted-provider、path-and-races、verification、related 全节及 Kotlin 导入代码通过。外部显示名不作落点，缓存暂存与失败清理、字节预算不保证时限的限制准确。
14. `android/engineering/data-lifecycle.md`：account-binding/恢复分类、storage-and-restore、logout-cleanup、uninstall-residue、clipboard、clipboard-cleanup、verification 全节通过。备份不继承当前授权，Keystore 不保证进程内秘密不可用，剪贴板敏感标记与 API24/33 条件及非原子清理限制已明确。
15. `android/engineering/release-hardening.md`：debuggable、backup-policy、backup-rules、hidden-entrypoints、metadata-and-package、obfuscation、verification 全节及两套备份 XML 通过。API31/OS12 的规则组合、OEM D2D 例外和滚动 QPR2 扩展已区分；未把 APK 扩展名或混淆当完整防护。
16. `android/engineering/uri-sql-input.md`：boundaries、path-segments、query-parameters、url-decoder、sql-injection、verification 全节及 Kotlin 片段通过。规范查询示例拒绝编码键别名与重复参数；SQL 结构使用固定映射，值与行级授权分开；Android Charset 重载版本单列。
17. `android/engineering/untrusted-files.md`：pipeline、upload、download、avatar-cache、bitmap、archive、verification 全节及 Bitmap/ZIP 片段通过。解压可信根与竞态、路径与资源预算、压缩字节与像素峰值等边界与当前主章一致。
18. `android/engineering/injection-serialization.md`：capability-model、command-execution、jexl、deserialization、base64、verification 全节及片段通过。解释器可达能力、参数语义、JEXL 权限基线与隔离、Parcel 非持久化、Base64 非认证及分配前输入限制均有正确限定。
19. `android/audit/location-risk.md`：mock-signals、developer-settings、candidate-validation、server-policy、verification 全节及 Java 代码通过。旧页已明确最低 API18/编译 API31，主章遗漏已补 R2；时钟必须同一启动周期，mock=false 不证明真实，未知不等于正常。
20. `android/audit/runtime-code-trust.md`：plugin-chain、integrity、read-only、ta-scope、verification、findings 全节及摘要片段通过。摘要与信任根、真实但过时版本、API34/target34 的写入前只读、同进程执行权限及 TA/OEM 条件均与主章一致。
21. `android/audit/ui-legacy-input.md`：ime-boundary、legacy-fragment（API/target 与精确列表）、selection-bounds、verification 全节及 Java 片段通过。IME 标志为请求、API19 默认 Fragment 校验与 target 门槛、真实过滤后文本索引限制准确。
22. `android/audit/availability-binder.md`：dos-model、binder-budget/协议配额、package-flags/示例、resource-policy、verification 全节通过。1MB 近似契约与 libbinder 映射区分、请求回复失败不确定性、零 flags 基础字段以及未执行压力实验的说明准确。

## 实质修正与逐项二轮核验

共 15 个发现：2 个内容问题、13 个索引目标错误。涉及 5 页；不把已有原提纲勘误重复计入本次发现。

### R1：package 不能覆盖已有显式组件

- 原文：`setPackage()` 限制匹配包范围，设置 ComponentName 可以“进一步明确组件”；没有说明外部已有 component 会优先进入显式解析，易被理解为先补 package 就能限定外部对象。
- 修正：限定 package 的匹配路径，明确 setter 不清除 component；已有 component 的 `resolveActivity()` 直接返回该值，不代表存在性、导出权限或业务鉴权；非空 package 与 selector 不可并用。建议仍是提取必要业务值后新建受应用控制的 Intent。
- 证据：固定 `android-16.0.0_r1` 的 [Intent.setPackage](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/Intent.java#11408)、[Intent.resolveActivity](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/Intent.java#10113)、[ComputerEngine 显式查询分支](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/pm/ComputerEngine.java#542)。实际读取对应函数源码；web 抓取 AOSP URL 失败后，以 Gitiles `?format=TEXT` 获取并 base64 解码核验。
- 修改位置：`dos-attacks.md:52`、`:54`；旧专题 `foundation/activity-intent.md:69`、`:71`；覆盖表 `coverage.md:103`。
- 二轮：PASS。脚本断言主章和旧专题两个完整段落完全相同；检查 S201 仍指向原锚点且已写同一结论。此项是文档事实修正，没有执行攻击样例。

### R2：位置示例迁移到主章时遗漏版本前提

- 原文：主章给出 `SDK_INT >= 31 ? isMock() : isFromMockProvider()`，未明确最低运行版本与编译 SDK；旧专题顶部已有对应条件。
- 修正：在主章代码前补最低运行 API18、编译 SDK 支持 API31；保留未编译、未设备执行状态。
- 证据：[Location.isFromMockProvider](https://developer.android.com/reference/android/location/Location#isFromMockProvider()) 为 API18，API31 弃用；[Location.isMock](https://developer.android.com/reference/android/location/Location#isMock()) 为 API31。已实际浏览官方 API 页面及对应版本条目。
- 修改位置：`configuration-security.md:342`；对照旧专题 `audit/location-risk.md:22`。
- 二轮：PASS。两页均明确 API18 与 API31，条件与两个实际调用一致；未改变候选位置分级逻辑，不声称样例已编译。

### R3：索引标题与链接位置不一致

来源为本仓库对应章节的真实显式锚点及 `docs/.vitepress/android-security-outline.ts` 目录基准；没有修改共享导航。每行是一次发现，旧位置 → 同名小节实际位置：

- `index.md:27` Service 暴露：component `s39` → `s42`。
- `index.md:39` MIME 查询：component `s75` → `s78`。
- `index.md:42` authority 原理：component `s84` → `s87`。
- `index.md:44` 共享范围风险：component `s90` → `s93`。
- `index.md:45` 共享路径防护：component `s90` → `s96`。
- `index.md:51` 只申请必要权限：component `s9` → configuration `s102`。
- `index.md:58` 权限命名空间：configuration `s111` → `s123`。
- `index.md:59` 导出访问权限：component `s12` → configuration `s126`。
- `index.md:65` META-INF：configuration `s132` → `s144`。
- `index.md:78` 文件读写：component `s63` → file-operations `s171`。
- `index.md:101` URI 读写授权：dos `s213` → `s216`。
- `index.md:102` URI 外控：dos `s213` → `s219`。
- `index.md:106` maxLength 条件：dos `s228` → `s231`。

二轮：13/13 PASS。程序分别解析索引和覆盖表的所有带 S 锚点链接，读取目标页该锚点的实际标题并逐字比较标签，共 150/150 通过。该检查覆盖链接语义位置，不只是检测锚点存在；原顺序、层级、标签未修改。

## 已核对的关键一手依据

- 组件身份：[AOSP 沙箱](https://source.android.com/docs/security/app-sandbox)、[Binder.getCallingUid](https://developer.android.com/reference/android/os/Binder#getCallingUid())、[AIDL](https://developer.android.com/develop/background-work/services/aidl)、[Message.sendingUid](https://developer.android.com/reference/android/os/Message#sendingUid)。核对 UID、入站事务、同进程同步与 Messenger 字段适用范围；不将包名或生命周期回调当原始调用者凭据。
- 导出与广播：[Android14 行为](https://developer.android.com/about/versions/14/behavior-changes-14)、[广播总览](https://developer.android.com/develop/background-work/background-tasks/broadcasts)、[Provider 定义](https://developer.android.com/guide/topics/manifest/provider-element)。分别核对运行系统、target 条件、纯系统广播例外及高权限应用广播边界。
- MIME：[ContentProvider API](https://developer.android.com/reference/android/content/ContentProvider#getTypeAnonymous(android.net.Uri)) 与固定标签 [Transport.getType](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/ContentProvider.java#315)。核对 API34 与默认委托，源码权限不足分支在清理身份后调用匿名方法，不把覆写本身当新增权限。
- 共享文件：[官方 FileProvider 风险](https://developer.android.com/privacy-and-security/risks/file-providers)、[FileProvider API](https://developer.android.com/reference/androidx/core/content/FileProvider)、[不可信文件名](https://developer.android.com/privacy-and-security/risks/untrustworthy-contentprovider-provided-filename)、[ZIP 路径遍历](https://developer.android.com/privacy-and-security/risks/zip-path-traversal)。API 页直接抓取超时后通过官方搜索结果核对 subclass/manifest 契约；另外三页正文实际读取。专用 files/cache 子目录合法，配置根不等于无条件外部可读，canonical 仍需可信目录前提。
- 数据生命周期：[Auto Backup](https://developer.android.com/identity/data/autobackup)、[Keystore](https://developer.android.com/privacy-and-security/keystore)、[剪贴板](https://developer.android.com/privacy-and-security/risks/secure-clipboard-handling)、[ClipDescription.setExtras](https://developer.android.com/reference/android/content/ClipDescription#setExtras(android.os.PersistableBundle))。核对 OS/target 备份矩阵、API36.1/QPR2 滚动文档扩展、密钥可用性、API24 setter 与 API33 敏感常量。
- 旧框架：固定标签 [PreferenceActivity.isValidFragment](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/preference/PreferenceActivity.java#998) 与 [实例化路径](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/preference/PreferenceActivity.java#1278)，实际读取默认 target 判断及 Fragment.instantiate 前校验；[IME 标志](https://developer.android.com/reference/android/view/inputmethod/EditorInfo#IME_FLAG_NO_PERSONALIZED_LEARNING) 的 API26 与请求语义也已核对。
- URI/包/Binder：实际读取固定标签 [Uri.getQueryParameterNames](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/net/Uri.java#1617) 与 [getQueryParameter](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/net/Uri.java#1721)、[PackageInfoUtils 基础字段](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/pm/parsing/PackageInfoUtils.java#131) 和 `GET_ACTIVITIES` 分支、[ProcessState 的 BINDER_VM_SIZE](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/ProcessState.cpp#47)，结合 [TransactionTooLargeException](https://developer.android.com/reference/android/os/TransactionTooLargeException) 核对缓冲区共享与部分失败；[URLDecoder](https://developer.android.com/reference/java/net/URLDecoder) 的 Charset 重载 API33 已查证。
- 注入与加载：[不安全反序列化](https://developer.android.com/privacy-and-security/risks/unsafe-deserialization)、[JEXL 官方包说明](https://commons.apache.org/proper/commons-jexl/apidocs/org/apache/commons/jexl3/package-summary.html)、[Android14 动态代码要求](https://developer.android.com/about/versions/14/behavior-changes-14#safer-dynamic-code-loading)、[Trusty 架构](https://source.android.com/docs/security/features/trusty)。分别核对 Parcel 持久化边界、3.7 的 SECURE 基线非完整沙箱、创建新文件写入前只读与 TEE/OEM 条件。
- 设置差异：实际读取固定标签 [Settings.java](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/provider/Settings.java#14067) 的 `@Readable` 定义，并浏览[当前 DEVELOPMENT_SETTINGS_ENABLED 契约](https://developer.android.com/reference/android/provider/Settings.Global#DEVELOPMENT_SETTINGS_ENABLED) 的第三方返回 0 说明。维持二者范围差异，未编造变更版本切点。

## 验证与未核实项

- 本组执行 `node --test tests/android-security-outline.test.mjs`：3/3 通过，验证原始 80 段顺序、五章及全部标题/导航/覆盖关系。
- 本组额外脚本：150 条索引/覆盖链接标签逐字对应目标标题，Intent 主旧段落一致、位置前提一致，全部通过。
- 本组执行 `git diff --check -- docs/security`：无空白错误，只有既有仓库 LF/CRLF 转换提示。全文/标题阅读及脚本不修改源码；未新增 Frida Hook 或 strace。
- 主任务负责并记录最终 `npm.cmd test`、构建、构建产物锚点、桌面/手机浏览器检查；本组没有把历史构建结果当作本次验证。此次未改 Mermaid。
- 所有 Android/Kotlin/Java/XML 示例仍未放入 Android 工程编译、未设备执行；没有安装冲突、跨应用身份、权限撤销、FGS、输入法、真实定位、OOM/Binder 负载或 TEE 实验。
- OEM D2D、旧平台/target 组合、authority 抢先安装影响、设置字段变更切点及具体 TA 缩写/厂商协议仍未证实，正文保留限定。JEXL 为滚动官方资料，本站没有相应依赖，不把版本说明视为本地库测试。
- 文件导入示例仅保证所述字节预算与应用生成落点，没有承诺流取消能强制终止任意恶意 Provider；ZIP、动态代码与文件检查的竞态前提仍需在实际工程核对。
