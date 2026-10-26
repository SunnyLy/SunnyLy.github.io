---
description: Android 安全原提纲的段落、正文锚点与官方资料对照表。
---

# Android 安全提纲覆盖与勘误

这份对照表保留[原提纲](https://alidocs.dingtalk.com/i/nodes/X6GRezwJlARdZ9n3IX4XGmwr8dqbropQ?utm_scene=person_space)的段落标识，包含标题及说明性段落。它用于核查覆盖，分类与子项顺序见[Android 安全提纲](/security/)。

本页用于维护提纲覆盖与出处，具体机制和版本条件见所链接正文。

“展开”补充机制、防护与验证，“纠正”修订原强断言，“条件化”限定风险成立范围，“导读”保留组织层级。S 编号仅用于追溯，不表示风险等级。

## 通用组件安全

| 原段落 | 原始要点 | 正文定位 | 处理与适用边界 | 依据 |
| --- | --- | --- | --- | --- |
| S3 | 通用组件安全 | [通用组件安全](/security/android/component-security.html) | 导读：区分 UID、平台权限与业务授权 | [官方资料](https://source.android.com/docs/security/app-sandbox) |
| S6 | Activity | [Activity](/security/android/component-security.html#s6) | 导读：入口可达不代表允许敏感操作 | [官方资料](https://developer.android.com/reference/android/app/Activity) |
| S9 | 权限与属性设置 | [权限与属性设置](/security/android/component-security.html#s9) | 展开：区分 UID、平台权限与业务授权 | [官方资料](https://developer.android.com/guide/topics/permissions/overview) |
| S12 | 组件暴露 | [组件暴露](/security/android/component-security.html#s12) | 展开：区分 UID、平台权限与业务授权 | [官方资料](https://developer.android.com/privacy-and-security/risks/android-exported) |
| S15 | Intent 接收和发送 | [Intent 接收/发送安全](/security/android/component-security.html#s15) | 展开：入口可达不代表允许敏感操作 | [官方资料](https://developer.android.com/privacy-and-security/risks/intent-redirection) |
| S18 | Scheme URL、intent-based URI | [Scheme URL / intent-based URI 启动组件](/security/android/component-security.html#s18) | 展开：入口可达不代表允许敏感操作 | [官方资料](https://developer.android.com/privacy-and-security/risks/unsafe-use-of-deeplinks) |
| S21 | 安全键盘配置 | [安全键盘配置漏洞](/security/android/component-security.html#s21) | 展开：输入法学习标志是请求，不是防窃取保证 | [官方资料](https://developer.android.com/develop/ui/views/touch-and-input/creating-input-method) |
| S24 | BroadcastReceiver | [BroadcastReceiver](/security/android/component-security.html#s24) | 导读：运行 OS、target 与广播来源分别核对 | [官方资料](https://developer.android.com/develop/background-work/background-tasks/broadcasts) |
| S27 | 动态广播暴露 | [动态广播组件暴露](/security/android/component-security.html#s27) | 展开：Android 13 提供标志；14/target34+有条件要求 | [官方资料](https://developer.android.com/about/versions/14/behavior-changes-14#runtime-receivers-exported) |
| S30 | 静态广播暴露 | [静态广播组件暴露](/security/android/component-security.html#s30) | 展开：Android 12/target31+有显式导出条件 | [官方资料](https://developer.android.com/guide/topics/manifest/receiver-element) |
| S33 | Receiver 嗅探 | [Receiver 嗅探](/security/android/component-security.html#s33) | 展开：运行 OS、target 与广播来源分别核对 | [官方资料](https://developer.android.com/develop/background-work/background-tasks/broadcasts#security-considerations) |
| S36 | 粘性广播敏感数据 | [粘性广播与敏感数据](/security/android/component-security.html#s36) | 展开：运行 OS、target 与广播来源分别核对 | [官方资料](https://developer.android.com/privacy-and-security/risks/sticky-broadcast) |
| S39 | Service | [Service](/security/android/component-security.html#s39) | 导读：区分远程事务、本地调用与异步 | [官方资料](https://developer.android.com/develop/background-work/services/bound-services) |
| S42 | Service 暴露 | [Service 组件暴露安全](/security/android/component-security.html#s42) | 展开：区分远程事务、本地调用与异步 | [官方资料](https://developer.android.com/develop/background-work/services/bound-services) |
| S45 | Service 劫持 | [Service 劫持](/security/android/component-security.html#s45) | 展开：区分远程事务、本地调用与异步 | [官方资料](https://developer.android.com/guide/components/intents-filters) |
| S48 | AIDL 接口 | [AIDL 接口安全](/security/android/component-security.html#s48) | 展开：AIDL 不自动生成资源授权 | [官方资料](https://developer.android.com/develop/background-work/services/aidl) |
| S51 | Messenger 服务 | [Messenger 服务安全](/security/android/component-security.html#s51) | 展开：区分远程事务、本地调用与异步 | [官方资料](https://developer.android.com/reference/android/os/Message#sendingUid) |
| S54 | 前台服务 | [前台服务安全](/security/android/component-security.html#s54) | 展开：FGS 类型、权限与启动条件按版本核对 | [官方资料](https://developer.android.com/develop/background-work/services/fgs) |
| S57 | ContenetProvider | [ContentProvider](/security/android/component-security.html#s57) | 导读：区分读写、元数据与 URI grant | [官方资料](https://developer.android.com/guide/topics/manifest/provider-element) |
| S60 | Provider 暴露 | [组件暴露安全](/security/android/component-security.html#s60) | 展开：区分读写、元数据与 URI grant | [官方资料](https://developer.android.com/guide/topics/manifest/provider-element#prmsn) |
| S63 | Provider 目录遍历 | [Provider 文件目录遍历漏洞](/security/android/component-security.html#s63) | 展开：限定可信目录、路径和授予能力 | [官方资料](https://developer.android.com/privacy-and-security/risks/path-traversal) |
| S66 | uriPath 权限控制 | [Provider uriPath 权限控制](/security/android/component-security.html#s66) | 展开：区分读写、元数据与 URI grant | [官方资料](https://developer.android.com/guide/topics/manifest/path-permission-element) |
| S69 | SQL 注入 | [SQL 注入](/security/android/component-security.html#s69) | 展开：受限协议；解析后仍需授权 | [官方资料](https://developer.android.com/privacy-and-security/risks/sql-injection) |
| S72 | 隐式 Intent 授 URI 权限 | [隐式 Intent 的 URI 操作权限](/security/android/component-security.html#s72) | 条件化：区分读写、元数据与 URI grant | [官方资料](https://developer.android.com/guide/topics/providers/content-provider-basics#Permissions) |
| S75 | getType 方法 | [getType() 方法安全](/security/android/component-security.html#s75) | 条件化：区分读写、元数据与 URI grant | [官方资料](https://developer.android.com/reference/android/content/ContentProvider#getType(android.net.Uri)) |
| S78 | getType 无导出/权限也返回 | [MIME 查询原理与权限边界](/security/android/component-security.html#s78) | 条件化：默认 MIME 行为与 API34 匿名分支分开解释 | [官方资料](https://developer.android.com/reference/android/content/ContentProvider#getType(android.net.Uri)) |
| S81 | 空或未定义 URI | [空 URI 与未定义 URI](/security/android/component-security.html#s81) | 条件化：区分 null、未知 URI 与资源不存在 | [官方资料](https://developer.android.com/guide/topics/manifest/provider-element) |
| S84 | authority 劫持 | [authority 劫持](/security/android/component-security.html#s84) | 条件化：区分读写、元数据与 URI grant | [官方资料](https://developer.android.com/guide/topics/manifest/provider-element) |
| S87 | authority 唯一与抢先安装原理 | [authority 唯一性与抢先安装](/security/android/component-security.html#s87) | 条件化：冲突、安装失败与接管数据不是同一影响 | [官方资料](https://developer.android.com/guide/topics/manifest/provider-element) |
| S90 | FileProvider 共享目录 | [FileProvider 共享目录范围](/security/android/component-security.html#s90) | 展开：限定可信目录、路径和授予能力 | [官方资料](https://developer.android.com/privacy-and-security/risks/file-providers) |
| S93 | 过大目录扩大攻击面 | [共享范围过大的风险](/security/android/component-security.html#s93) | 展开：限定可信目录、路径和授予能力 | [官方资料](https://developer.android.com/privacy-and-security/risks/file-providers) |
| S96 | 禁 root/files/cache，路径最小化 | [共享路径最小化防护](/security/android/component-security.html#s96) | 纠正：可使用专用 files/cache 子目录；拒绝过宽共享 | [官方资料](https://developer.android.com/privacy-and-security/risks/file-providers) |

## 配置安全

| 原段落 | 原始要点 | 正文定位 | 处理与适用边界 | 依据 |
| --- | --- | --- | --- | --- |
| S99 | 配置安全 | [配置安全](/security/android/configuration-security.html) | 导读：区分 UID、平台权限与业务授权 | [官方资料](https://source.android.com/docs/security/app-sandbox) |
| S102 | 只申请必要权限 | [应用程序只申请必要的权限](/security/android/configuration-security.html#s102) | 展开：区分 UID、平台权限与业务授权 | [官方资料](https://developer.android.com/guide/topics/permissions/overview) |
| S105 | 应用 UID 权限 | [应用的 UID 权限](/security/android/configuration-security.html#s105) | 展开：区分 UID、平台权限与业务授权 | [官方资料](https://source.android.com/docs/security/app-sandbox) |
| S108 | 不同应用不共享 UID | [sharedUserId 与 UID 共享](/security/android/configuration-security.html#s108) | 纠正：sharedUserId 自 API29 弃用；不能直接删除迁移 | [官方资料](https://developer.android.com/guide/topics/manifest/manifest-element#uid) |
| S111 | reboot 权限 | [reboot 权限](/security/android/configuration-security.html#s111) | 展开：区分 UID、平台权限与业务授权 | [官方资料](https://developer.android.com/reference/android/Manifest.permission#REBOOT) |
| S114 | release 禁 debug 与备份 | [release 配置：debuggable 与 allowBackup](/security/android/configuration-security.html#s114) | 纠正：调试与备份分开；云备份、D2D 和跨平台另核 | [官方资料](https://developer.android.com/guide/topics/manifest/application-element#debug) |
| S117 | signature/signatureOrSystem | [自定义权限保护等级](/security/android/configuration-security.html#s117) | 纠正：signatureOrSystem 自 API23 弃用；按信任关系选择 | [官方资料](https://developer.android.com/guide/topics/manifest/permission-element) |
| S120 | 私有组件禁 taskAffinity/launchMode | [私有组件的 taskAffinity 与 launchMode](/security/android/configuration-security.html#s120) | 纠正：按任务模型评估，不一律禁用属性 | [官方资料](https://developer.android.com/guide/topics/manifest/activity-element) |
| S123 | 自定义权限系统命名空间 | [自定义权限的系统命名空间](/security/android/configuration-security.html#s123) | 展开：区分 UID、平台权限与业务授权 | [官方资料](https://developer.android.com/guide/topics/manifest/permission-element#name) |
| S126 | 导出组件需访问权限 | [对外导出组件的访问权限](/security/android/configuration-security.html#s126) | 展开：区分 UID、平台权限与业务授权 | [官方资料](https://developer.android.com/privacy-and-security/risks/android-exported) |
| S129 | APK 暗码/隐藏入口 | [APK 暗码与隐藏入口](/security/android/configuration-security.html#s129) | 展开：发布变体；迁移规则按 OS/target | [官方资料](https://developer.android.com/privacy-and-security/risks/android-exported) |
| S132 | meta-data 敏感数据 | [meta-data 中的敏感数据](/security/android/configuration-security.html#s132) | 展开：发布变体；迁移规则按 OS/target | [官方资料](https://developer.android.com/privacy-and-security/risks/hardcoded-cryptographic-secrets) |
| S135 | 状态与设备或账户关联 | [应用状态与设备或账号关联](/security/android/configuration-security.html#s135) | 展开：区分账户、设备、撤销与副本 | [官方资料](https://developer.android.com/identity/user-data-ids) |
| S138 | 卸载后残留 | [软件卸载后的残留信息检查](/security/android/configuration-security.html#s138) | 展开：区分账户、设备、撤销与副本 | [官方资料](https://developer.android.com/training/data-storage/app-specific) |
| S141 | 头像缓存大小和有效性 | [头像本地缓存的大小和有效性](/security/android/configuration-security.html#s141) | 展开：资源阈值为业务预算 | [官方资料](https://developer.android.com/training/data-storage) |
| S144 | META-INF 内 apk/odex/so | [META-INF 中的 APK、ODEX、SO](/security/android/configuration-security.html#s144) | 纠正：包内扩展名不能独立证明敏感或恶意 | [官方资料](https://developer.android.com/studio/debug/apk-analyzer) |
| S147 | 剪贴板 | [剪贴板安全使用](/security/android/configuration-security.html#s147) | 展开：区分账户、设备、撤销与副本 | [官方资料](https://developer.android.com/privacy-and-security/risks/secure-clipboard-handling) |
| S150 | 混淆规则增强 | [应用混淆规则增强](/security/android/configuration-security.html#s150) | 展开：发布变体；迁移规则按 OS/target | [官方资料](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization) |
| S153 | 模拟位置 | [模拟位置检查](/security/android/configuration-security.html#s153) | 条件化：信号有误报漏报，不等同欺诈 | [官方资料](https://developer.android.com/reference/android/location/Location#isMock()) |
| S156 | 检测开发者选项/模拟应用 | [开发者选项与模拟位置应用检测](/security/android/configuration-security.html#s156) | 纠正：开发选项不证明模拟；读取 0 不证明关闭 | [官方资料](https://developer.android.com/reference/android/provider/Settings.Global#DEVELOPMENT_SETTINGS_ENABLED) |
| S159 | 插件动态加载 | [插件动态加载](/security/android/configuration-security.html#s159) | 展开：加载链需可信根；TA 为条件解释 | [官方资料](https://developer.android.com/privacy-and-security/risks/dynamic-code-loading) |

## 文件操作

| 原段落 | 原始要点 | 正文定位 | 处理与适用边界 | 依据 |
| --- | --- | --- | --- | --- |
| S162 | 文件操作 | [文件操作](/security/android/file-operations.html) | 导读：限定可信目录、路径和授予能力 | [官方资料](https://developer.android.com/privacy-and-security/risks/file-providers) |
| S165 | 文件上传 | [文件上传](/security/android/file-operations.html#s165) | 展开：资源阈值为业务预算 | [官方资料](https://mas.owasp.org/MASTG/best-practices/MASTG-BEST-0057/) |
| S168 | 文件下载 | [文件下载](/security/android/file-operations.html#s168) | 展开：资源阈值为业务预算 | [官方资料](https://developer.android.com/privacy-and-security/security-config) |
| S171 | 文件读写 | [文件读写](/security/android/file-operations.html#s171) | 展开：限定可信目录、路径和授予能力 | [官方资料](https://developer.android.com/privacy-and-security/risks/path-traversal) |
| S174 | BitmapFactory 导致 OOM | [BitmapFactory 图片解析与 OOM](/security/android/file-operations.html#s174) | 展开：资源阈值为业务预算 | [官方资料](https://developer.android.com/topic/performance/graphics/load-bitmap.html) |

## 特殊函数

| 原段落 | 原始要点 | 正文定位 | 处理与适用边界 | 依据 |
| --- | --- | --- | --- | --- |
| S177 | 特殊函数 | [特殊函数](/security/android/special-functions.html) | 导读：格式、引擎版本与能力分别核对 | [官方资料](https://developer.android.com/reference/java/lang/Runtime#exec(java.lang.String,java.lang.String%5B%5D,java.io.File)) |
| S180 | 命令执行 | [命令执行安全](/security/android/special-functions.html#s180) | 展开：格式、引擎版本与能力分别核对 | [官方资料](https://developer.android.com/reference/java/lang/Runtime#exec(java.lang.String,java.lang.String%5B%5D,java.io.File)) |
| S183 | 解压 | [解压安全](/security/android/special-functions.html#s183) | 展开：路径检查仍需可信根、配额及竞态前提 | [官方资料](https://developer.android.com/privacy-and-security/risks/zip-path-traversal) |
| S186 | getPathSegments | [getPathSegments 函数](/security/android/special-functions.html#s186) | 展开：返回已解码片段，不是安全文件名保证 | [官方资料](https://developer.android.com/reference/android/net/Uri#getPathSegments()) |
| S189 | 序列化 | [序列化安全](/security/android/special-functions.html#s189) | 展开：格式、引擎版本与能力分别核对 | [官方资料](https://developer.android.com/privacy-and-security/risks/unsafe-deserialization) |
| S192 | JEXL 表达式注入 | [JEXL 表达式注入](/security/android/special-functions.html#s192) | 展开：滚动文档说明自3.7默认变化；项目版本另核 | [官方资料](https://commons.apache.org/proper/commons-jexl/apidocs/org/apache/commons/jexl3/package-summary.html) |
| S195 | TA 文件 | [TA 文件安全](/security/android/special-functions.html#s195) | 条件化：若 TA 指 Trusted Application；限平台/OEM/TEE | [官方资料](https://source.android.com/docs/security/features/trusty) |

## Dos攻击

| 原段落 | 原始要点 | 正文定位 | 处理与适用边界 | 依据 |
| --- | --- | --- | --- | --- |
| S198 | DoS | [Dos攻击](/security/android/dos-attacks.html) | 导读：共享预算；不能仅按 flags 判异常 | [官方资料](https://developer.android.com/topic/performance/vitals/anr) |
| S201 | Intent.setPackage | [Intent.setPackage 安全](/security/android/dos-attacks.html#s201) | 条件化：package 不覆盖显式 component，解析结果不等于鉴权 | [固定源码](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/Intent.java#11408) |
| S204 | uri.getQueryParameter | [uri.getQueryParameter](/security/android/dos-attacks.html#s204) | 展开：缺失/重复/编码别名；示例限定规范编码 | [官方资料](https://developer.android.com/reference/android/net/Uri#getQueryParameter(java.lang.String)) |
| S207 | PreferenceActivity Fragment 注入 | [Fragment 框架注入（PreferenceActivity）](/security/android/dos-attacks.html#s207) | 条件化：旧 PreferenceActivity 的 OS/target/覆写条件 | [官方资料](https://developer.android.com/reference/android/preference/PreferenceActivity#isValidFragment(java.lang.String)) |
| S210 | Base64.decode | [Base64.decode 解码安全](/security/android/dos-attacks.html#s210) | 展开：Base64 不提供保密或真实性 | [官方资料](https://developer.android.com/reference/android/util/Base64) |
| S213 | 带 Flags 的 Intent 启动 | [带 Flags 的 Intent 启动组件](/security/android/dos-attacks.html#s213) | 条件化：入口可达不代表允许敏感操作 | [官方资料](https://developer.android.com/reference/android/content/Intent#FLAG_GRANT_READ_URI_PERMISSION) |
| S216 | read/write 授权与 add/setFlags 条件 | [URI 读写授权与 addFlags / setFlags](/security/android/dos-attacks.html#s216) | 条件化：标志只是授予链的一部分，需追真实能力 | [官方资料](https://developer.android.com/reference/android/content/Intent#FLAG_GRANT_READ_URI_PERMISSION) |
| S219 | URI 外部可控条件 | [URI 外部可控条件](/security/android/dos-attacks.html#s219) | 条件化：外控 URI 还须结合授予范围与接收方 | [官方资料](https://developer.android.com/reference/android/content/Intent#FLAG_GRANT_READ_URI_PERMISSION) |
| S222 | getContentResolver | [getContentResolver() 安全](/security/android/dos-attacks.html#s222) | 展开：限定可信目录、路径和授予能力 | [官方资料](https://developer.android.com/privacy-and-security/risks/untrustworthy-contentprovider-provided-filename) |
| S225 | 上述 URI 风险说明 | [不可信 URI 的访问边界](/security/android/dos-attacks.html#s225) | 展开：限定可信目录、路径和授予能力 | [官方资料](https://developer.android.com/privacy-and-security/risks/file-providers) |
| S228 | EditText.setSelection | [EditText.setSelection() 光标定位](/security/android/dos-attacks.html#s228) | 展开：按当前文本长度限制索引 | [官方资料](https://developer.android.com/reference/android/widget/EditText#setSelection(int)) |
| S231 | 外部文本加 maxlen 条件 | [外部文本与 maxLength 条件](/security/android/dos-attacks.html#s231) | 纠正：maxLength 不是索引异常的必要条件 | [官方资料](https://developer.android.com/reference/android/widget/EditText#setSelection(int)) |
| S234 | getPackegeInfo | [getPackageInfo 安全](/security/android/dos-attacks.html#s234) | 展开：flags 按字段需求；零不只返回版本 | [固定源码](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/pm/parsing/PackageInfoUtils.java#131) |
| S237 | Binder 1M、flag=0 与非0 catch 说明 | [Binder 事务预算、flags 与异常处理](/security/android/dos-attacks.html#s237) | 纠正：在途事务共享缓冲；非零 flag 不必然异常 | [官方资料](https://developer.android.com/reference/android/os/TransactionTooLargeException) |
| S240 | URLDecoder.decode | [URLDecoder.decode 解码安全](/security/android/dos-attacks.html#s240) | 展开：表单解码；Android Charset 重载为 API33+ | [官方资料](https://developer.android.com/reference/java/net/URLDecoder) |

原文检索别名：`ContenetProvider` 对应 `ContentProvider`，`getPackegeInfo` 对应 `getPackageInfo`，`maxlen` 对应 `android:maxLength`。

