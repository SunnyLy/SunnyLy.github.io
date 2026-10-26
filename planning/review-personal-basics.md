# Android 基础笔记技术审查

审查范围为已有调用链、对象与引用生命周期、线程/进程边界和新增机制解释。保留原有标题、显式锚点、图与分类顺序；原始笔记链接移至各页末尾。以下为源码与 API 审查，不包含设备运行结论。

- **activity-startup.md：通过。** 保留 ApplicationThread Binder → H → TransactionExecutor 主线程链及各类源码节选；补充 `executeLifecycleItem → cycleToPath(excludeLastState=true) → execute/postExecute`，解释从 Created 补齐 Start 再 Resume，避免重复执行最后状态。位置：`docs/android/basics/activity-startup.md:544`。依据：[AOSP TransactionExecutor](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/app/servertransaction/TransactionExecutor.java#L146)。
- **loaded-apk.md：通过。** 保留 Application 实例创建 → 初始 Provider 安装 → Application.onCreate 的顺序；补充 LoadedApk.mApplication 与进程内 sApplications 两层缓存，区分弱包缓存与 Application 实例持有。位置：`docs/android/basics/loaded-apk.md:36`。依据：[AOSP LoadedApk](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/app/LoadedApk.java#L1415)。
- **class-loading.md：通过。** 继承图、parent 委派图及 DexPathList → DexFile → ART 路径保留；补充初始化锁、初始化失败后的错误状态与 NoClassDefFoundError，区分“找不到类”和“类初始化失败”。位置：`docs/android/basics/class-loading.md:113`。依据：[JLS §12.4.2](https://docs.oracle.com/javase/specs/jls/se17/html/jls-12.html#jls-12.4.2)。
- **dynamic-proxy.md：通过。** 保留目标反射调用、异常解包与代理身份示例；补充调用线程与处理器并发，明确代理类继承 Proxy，而真实目标是委托关系。位置：`docs/android/basics/dynamic-proxy.md:33`。依据：[Java Proxy 契约](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/reflect/Proxy.html)。
- **binder-basics.md：通过。** 已验证的 SVG 与请求/回复连接顺序不变；补充同步嵌套事务复用等待线程时的重入风险，以及释放业务锁后再调用远端的状态校验方式。位置：`docs/android/basics/binder-basics.md:240`。依据：[AOSP Binder threading](https://source.android.com/docs/core/architecture/ipc/binder-threading#avoid-deadlocks)。
- **broadcast.md：通过。** 保留动态/静态入口差异、finishReceiver 及有序交付状态图；补充 goAsync 取出并清空 mPendingResult，异步结果设置必须操作本次 PendingResult，不能继续操作 Receiver 或跨次复用。位置：`docs/android/basics/broadcast.md:515`。依据：[AOSP BroadcastReceiver.goAsync](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/content/BroadcastReceiver.java#L411)。
- **content-provider.md：通过。** 保留获取接口与实际数据调用的进程边界；补充 query 的 unstable 引用、死亡重取 stable 引用及 CursorWrapperInner 关闭释放责任，未推广为写入自动重试。位置：`docs/android/basics/content-provider.md:62`。依据：[AOSP ContentResolver.query](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/content/ContentResolver.java#L1126)。
- **pending-intent.md：通过。** 保留 filterEquals/flags 身份及可变性、PackageInstaller 的具体条件；补充创建者身份委托与转交方身份的区别，不把 getCreatorUid 当作交付方证明。位置：`docs/android/basics/pending-intent.md:17`。依据：[PendingIntent.getCreatorUid](https://developer.android.com/reference/android/app/PendingIntent#getCreatorUid())。
- **messenger.md：通过。** 保留 sendingUid 框架赋值、固定包名 + 证书 pin、共享 UID 拒绝及签名轮转语义；补充 MessengerImpl 不回传 Handler.sendMessage boolean，因此 Binder 存活/发送无异常不代表入队或业务成功。位置：`docs/android/basics/messenger.md:308`。依据：[AOSP Handler.MessengerImpl](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/os/Handler.java#L974)。
- **handler.md：通过。** 保留 HandlerThread 退出责任与 WorkManager 状态机、协作取消示例；补充 ThreadLocal 归属与 JNI pollOnce/wake，避免把等待入口认定为忙轮询或死锁。位置：`docs/android/basics/handler.md:24`、`:72`。依据：[AOSP Looper](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/os/Looper.java)、[MessageQueue JNI](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/jni/android_os_MessageQueue.cpp)。WorkManager 2.12.0/API 24 条件已对照[官方发布记录](https://developer.android.com/jetpack/androidx/releases/work#2.12.0)。

检查：10 页标题与锚点行数组与编辑前逐一比较一致；限定范围的 `git diff --check` 通过。全站构建与页面验证由主控统一执行。

## 历史审计专题

保留 4 页的 `search: false`、全部标题/锚点及现行五类目录链接；删除整理史与未运行声明，具体 API 条件保留在相应机制或示例旁。

- **availability-binder.md：通过。** 明确请求使用服务端接收区、回复使用客户端接收区，分别管理双向预算；保留共享缓冲区、幂等和有界负载的说明。位置：`docs/security/android/audit/availability-binder.md:49`。依据：[Binder 驱动目标路由与分配](https://android.googlesource.com/kernel/common/+/refs/tags/android16-6.12-2025-06_r1/drivers/android/binder.c#3189)。
- **location-risk.md：通过。** 补入经纬度 NaN/范围检查；补充 getAccuracy 为约 68% 置信水平的误差半径，并非绝对误差上界。API 18/31 分支、单调时钟边界与开发者选项读取限制保持。位置：`docs/security/android/audit/location-risk.md:94`。依据：[Location API](https://developer.android.com/reference/android/location/Location#getAccuracy())、[Settings.Global 当前契约](https://developer.android.com/reference/android/provider/Settings.Global#DEVELOPMENT_SETTINGS_ENABLED)。
- **runtime-code-trust.md：通过。** 补充磁盘版本切换与已加载 Class/实例分离，解释加载器回收、在途任务与对象引用对旧代码生命周期的影响；保留 DCL 文件只读顺序和 TA 条件范围。位置：`docs/security/android/audit/runtime-code-trust.md:78`。依据：[JLS §12.7](https://docs.oracle.com/javase/specs/jls/se17/html/jls-12.html#jls-12.7)。
- **ui-legacy-input.md：通过。** 补充 LengthFilter 插入预算、UTF-16 代理对截断处理与最终 Editable 光标索引的关系；保留 API 19/target 条件的 isValidFragment 语义及输入法标志的请求性质。位置：`docs/security/android/audit/ui-legacy-input.md:87`。依据：[AOSP InputFilter.LengthFilter](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/text/InputFilter.java#L168)。

检查：4 页标题、显式锚点和搜索配置与编辑前一致。示例限于防御校验与自有测试流程，没有新增第三方利用或绕过步骤。
