# Android 安全个人笔记审查

范围：五篇提纲正文、覆盖表和安全首页。保留五大分类、全部标题层级与显式锚点，未调整导航或覆盖映射。审查依据为 AOSP 固定标签、Android API 契约与 Apache 官方文档。

- **通用组件安全：已改进。** 删除重复前言和统一声明；补充系统组件准入与业务授权分层、Service 生命周期与远程事务身份的区别、Messenger 入队前记录 UID、Provider Transport 检查及文件打开过程、SQL 编译和参数绑定。Activity 过滤器说明保留 Android 13 / target 33+ 条件，避免套用旧版显式 Intent 结论。依据：[Intent 匹配](https://developer.android.com/guide/components/intents-filters)、[AOSP Handler](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/os/Handler.java#L974)、[AOSP ContentProvider](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/content/ContentProvider.java#L588)、[SQLiteQueryBuilder](https://developer.android.com/reference/android/database/sqlite/SQLiteQueryBuilder)。
- **配置安全：已改进。** 补齐权限定义、申请、授予和 UID 检查过程，以及共享 UID 合并文件/权限边界的原因。将隐藏入口、头像缓存与模拟位置的整理说明改为实际机制，保留备份、剪贴板、动态代码只读及旧接口版本条件。依据：[权限概览](https://developer.android.com/guide/topics/permissions/overview)、[sharedUserId](https://developer.android.com/guide/topics/manifest/manifest-element#uid)、[动态加载要求](https://developer.android.com/about/versions/14/behavior-changes-14#safer-dynamic-code-loading)。
- **文件操作：已改进。** 补充路径在打开时解析、描述符指向已打开对象、重新打开的竞态，以及 Provider 可能返回管道的限制。保留上传/下载流预算、临时文件发布和图片像素预算，不用泛化声明替代具体前提。依据：[Os.open](https://developer.android.com/reference/android/system/Os#open(java.lang.String,int,int))、[ParcelFileDescriptor](https://developer.android.com/reference/android/os/ParcelFileDescriptor)、[大图加载](https://developer.android.com/topic/performance/graphics/load-bitmap)。
- **特殊函数：已改进。** 补充 Java 对象恢复回调、Parcelable CREATOR 重建为何早于事后类型检查；区分 JEXL 语法功能限制与成员访问权限，保留 3.7 默认策略变化；TA 改为信任链和运行期消息校验的解释。命令、解压代码均保持防御用途。依据：[ObjectInputStream](https://developer.android.com/reference/java/io/ObjectInputStream)、[Parcelable.Creator](https://developer.android.com/reference/android/os/Parcelable.Creator)、[JEXL 安全配置](https://commons.apache.org/proper/commons-jexl/apidocs/org/apache/commons/jexl3/package-summary.html)、[Trusty](https://source.android.com/docs/security/features/trusty)。
- **Dos攻击：已改进。** 去除统一声明和拼写整理史，直接说明 Fragment 类名校验至实例化顺序、实际 Editable 与旧光标索引的关系、PackageInfo 的生成和 flags 语义。保留流阻塞、Binder 共享缓冲区及失败后不可盲目重试等具体机制。依据：[PreferenceActivity](https://developer.android.com/reference/android/preference/PreferenceActivity)、[LengthFilter](https://developer.android.com/reference/android/text/InputFilter.LengthFilter)、[TransactionTooLargeException](https://developer.android.com/reference/android/os/TransactionTooLargeException)。
- **覆盖表：已精简。** 保留维护用途、原段落标识、全部映射行和出处；移除统一验证声明，把原文拼写别名集中保留在表后。
- **安全首页：已改进。** 导读改为输入流、身份检查、底层操作和能力收紧的阅读顺序；保留全部分类和条目，移除教学声明及审校过程叙述。

检查：`node --test tests/android-security-outline.test.mjs` 的 3 项通过，覆盖原提纲顺序、正文标题/锚点和导航/coverage 一致性；`git diff --check -- docs/security` 通过。未进行全站构建、Android 编译或设备运行。审查未新增利用、保护绕过或第三方攻击代码。

## 历史专题页

以下八页保留 `search: false`、原显式锚点和指向现行章节的全部链接；旧专题提示合并成一行“现行分类”。

- `foundation/activity-intent.md`：补系统入口准入与 Activity 业务处理的职责，保留 Android 13 / target 33+ 过滤器匹配条件；清理基础层和运行状态声明。依据为 Android Intent 官方文档。
- `foundation/broadcast.md`：补发送参数限制接收者、注册参数限制发送者的具体方向，保留导出、系统广播与平台版本条件。依据为广播权限官方契约。
- `foundation/provider.md`：补 Transport 到业务方法、文件模式检查与描述符交付；把 authority、URI grant 和空 URI 的整理史改为直接机制。依据为 AOSP ContentProvider 固定标签。
- `foundation/security-model.md`：补权限定义至 UID 检查链和 sharedUserId 合并访问边界的原因，清理通用声明。依据为权限与 Manifest 官方文档。
- `foundation/service-ipc.md`：补 Messenger 入队前记录事务 UID，区分同签名能力与指定 App 身份认证；链接正式篇代码，注明包名/UID 关联、可信证书、共享 UID 与轮换策略，不复制整段实现。依据为 AOSP Handler 与 PackageManager 证书契约。
- `engineering/file-sharing.md`：补 FileProvider 的文件/URI 双向映射及描述符与重新解析路径的差异，保留防御导入示例、实际 AndroidX 条件与检查用例，清理未执行声明。依据为 FileProvider 与 ParcelFileDescriptor 官方 API。
- `engineering/uri-sql-input.md`：补 SQLite 编译/绑定阶段、固定结构与账户资源条件的区别，保留严格规范 URI 示例；回归说明改为直接检查副作用与资源释放。依据为 SQLiteQueryBuilder 官方 API。
- `engineering/injection-serialization.md`：补 JEXL 解析/求值、权限与语法功能，以及对象重建早于事后类型检查的原因；清理元叙述，保留已有防御示例。依据为 Apache JEXL、ObjectInputStream 与 Parcelable 官方 API。
