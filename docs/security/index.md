---
description: 按原提纲组织 Android 安全笔记：通用组件安全、配置安全、文件操作、特殊函数、Dos攻击。
---

# 安全

## Android 安全提纲

按入口、配置、文件、解释执行与资源消耗学习 Android 安全。每个知识点沿“输入怎样到达 → 谁检查身份 → 底层执行什么 → 如何收紧能力”展开；下列条目直达对应正文。

## [通用组件安全](/security/android/component-security.html) {#component-security}

按原提纲依次查看 Activity、BroadcastReceiver、Service 和 ContentProvider。先阅读[组件身份与权限边界](./android/foundation/security-model.html#uid-permissions)，再核对各入口的暴露与授权。

- [Activity](/security/android/component-security.html#s6)
  - [权限与属性设置](/security/android/component-security.html#s9)
  - [组件暴露](/security/android/component-security.html#s12)
  - [Intent 接收/发送安全](/security/android/component-security.html#s15)
  - [Scheme URL / intent-based URI 启动组件](/security/android/component-security.html#s18)
  - [安全键盘配置漏洞](/security/android/component-security.html#s21)
- [BroadcastReceiver](/security/android/component-security.html#s24)
  - [动态广播组件暴露](/security/android/component-security.html#s27)
  - [静态广播组件暴露](/security/android/component-security.html#s30)
  - [Receiver 嗅探](/security/android/component-security.html#s33)
  - [粘性广播与敏感数据](/security/android/component-security.html#s36)
- [Service](/security/android/component-security.html#s39)
  - [Service 组件暴露安全](/security/android/component-security.html#s42)
  - [Service 劫持](/security/android/component-security.html#s45)
  - [AIDL 接口安全](/security/android/component-security.html#s48)
  - [Messenger 服务安全](/security/android/component-security.html#s51)
  - [前台服务安全](/security/android/component-security.html#s54)
- [ContentProvider](/security/android/component-security.html#s57)
  - [组件暴露安全](/security/android/component-security.html#s60)
  - [Provider 文件目录遍历漏洞](/security/android/component-security.html#s63)
  - [Provider uriPath 权限控制](/security/android/component-security.html#s66)
  - [SQL 注入](/security/android/component-security.html#s69)
  - [隐式 Intent 的 URI 操作权限](/security/android/component-security.html#s72)
  - [getType() 方法安全](/security/android/component-security.html#s75)
    - [MIME 查询原理与权限边界](/security/android/component-security.html#s78)
    - [空 URI 与未定义 URI](/security/android/component-security.html#s81)
  - [authority 劫持](/security/android/component-security.html#s84)
    - [authority 唯一性与抢先安装](/security/android/component-security.html#s87)
  - [FileProvider 共享目录范围](/security/android/component-security.html#s90)
    - [共享范围过大的风险](/security/android/component-security.html#s93)
    - [共享路径最小化防护](/security/android/component-security.html#s96)

## [配置安全](/security/android/configuration-security.html) {#configuration-security}

逐项检查应用权限、发布属性、数据、包体、位置与插件配置。参照[配置审查方法](./android/foundation/security-model.html#review-workflow)，将检查项落实到最终构建产物和实际数据流。

- [应用程序只申请必要的权限](/security/android/configuration-security.html#s102)
- [应用的 UID 权限](/security/android/configuration-security.html#s105)
- [sharedUserId 与 UID 共享](/security/android/configuration-security.html#s108)
- [reboot 权限](/security/android/configuration-security.html#s111)
- [release 配置：debuggable 与 allowBackup](/security/android/configuration-security.html#s114)
- [自定义权限保护等级](/security/android/configuration-security.html#s117)
- [私有组件的 taskAffinity 与 launchMode](/security/android/configuration-security.html#s120)
- [自定义权限的系统命名空间](/security/android/configuration-security.html#s123)
- [对外导出组件的访问权限](/security/android/configuration-security.html#s126)
- [APK 暗码与隐藏入口](/security/android/configuration-security.html#s129)
- [meta-data 中的敏感数据](/security/android/configuration-security.html#s132)
- [应用状态与设备或账号关联](/security/android/configuration-security.html#s135)
- [软件卸载后的残留信息检查](/security/android/configuration-security.html#s138)
- [头像本地缓存的大小和有效性](/security/android/configuration-security.html#s141)
- [META-INF 中的 APK、ODEX、SO](/security/android/configuration-security.html#s144)
- [剪贴板安全使用](/security/android/configuration-security.html#s147)
- [应用混淆规则增强](/security/android/configuration-security.html#s150)
- [模拟位置检查](/security/android/configuration-security.html#s153)
- [开发者选项与模拟位置应用检测](/security/android/configuration-security.html#s156)
- [插件动态加载](/security/android/configuration-security.html#s159)

## [文件操作](/security/android/file-operations.html) {#file-operations}

按上传、下载、读写、图片解析的顺序检查文件处理链路。先确认[文件来源、访问身份和资源预算](./android/engineering/file-sharing.html#file-boundaries)。

- [文件上传](/security/android/file-operations.html#s165)
- [文件下载](/security/android/file-operations.html#s168)
- [文件读写](/security/android/file-operations.html#s171)
- [BitmapFactory 图片解析与 OOM](/security/android/file-operations.html#s174)

## [特殊函数](/security/android/special-functions.html) {#special-functions}

按原提纲检查命令执行、解压、路径解析、序列化、表达式和 TA 文件。[危险能力边界](./android/engineering/injection-serialization.html#capability-model)说明这些接口何时会形成风险。

- [命令执行安全](/security/android/special-functions.html#s180)
- [解压安全](/security/android/special-functions.html#s183)
- [getPathSegments 函数](/security/android/special-functions.html#s186)
- [序列化安全](/security/android/special-functions.html#s189)
- [JEXL 表达式注入](/security/android/special-functions.html#s192)
- [TA 文件安全](/security/android/special-functions.html#s195)

## [Dos攻击](/security/android/dos-attacks.html) {#dos-attacks}

保留原提纲中的接口与异常输入检查顺序。先区分[可用性风险与资源预算](./android/audit/availability-binder.html#dos-model)；其中 URI 授权、注入等问题也可能影响保密性或完整性，应按实际后果判断。

- [Intent.setPackage 安全](/security/android/dos-attacks.html#s201)
- [uri.getQueryParameter](/security/android/dos-attacks.html#s204)
- [Fragment 框架注入（PreferenceActivity）](/security/android/dos-attacks.html#s207)
- [Base64.decode 解码安全](/security/android/dos-attacks.html#s210)
- [带 Flags 的 Intent 启动组件](/security/android/dos-attacks.html#s213)
  - [URI 读写授权与 addFlags / setFlags](/security/android/dos-attacks.html#s216)
  - [URI 外部可控条件](/security/android/dos-attacks.html#s219)
- [getContentResolver() 安全](/security/android/dos-attacks.html#s222)
  - [不可信 URI 的访问边界](/security/android/dos-attacks.html#s225)
- [EditText.setSelection() 光标定位](/security/android/dos-attacks.html#s228)
  - [外部文本与 maxLength 条件](/security/android/dos-attacks.html#s231)
- [getPackageInfo 安全](/security/android/dos-attacks.html#s234)
  - [Binder 事务预算、flags 与异常处理](/security/android/dos-attacks.html#s237)
- [URLDecoder.decode 解码安全](/security/android/dos-attacks.html#s240)

## 阅读说明

先理解通信或文件操作的实际调用链，再看防护代码。运行 OS、target SDK 与独立库版本分别影响行为，重要差异在对应知识点中说明；身份认证、资源授权和输入校验应分别落实。

[提纲覆盖与勘误](./android/coverage.html)保留原始段落与正文锚点的对应关系，便于回查来源。

相关实践：[App 网络请求抓包](/tools/app-network-capture.html)、[Binder 机制](/android/framework/binder-mechanism.html)、[Web JS 分析](/reverse/web-js-reverse.html)。
