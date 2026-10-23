# 知识库正确性复核记录

复核日期：2026-10-22。范围、授权与排除项以 [任务](./KNOWLEDGE_REVIEW_TASK.md) 为准。保留任务开始时的全部未提交内容；本轮仅作本地修订，不提交、推送、打标签或发布。未执行 Android 设备命令，不从路径推断设备环境。

## 方法与证据边界

正文按小节完整阅读，分组核对概念、进程/线程、时序、API 契约、版本与权限。Android 平台以 `android-16.0.0_r1` 为基线；Compose 以原文固定提交为基线。网页文档是复核当日版本，不能代替固定源码结论。下面的内容复核与末尾的构建/浏览器验证分别记录，构建通过不证明正文正确。

本轮先审阅修订，再独立交叉核验关键修正。保留原始提纲层级、本地图与下载入口；未新增 Frida Hook 或 strace 专题。普通 JS 示例运行不等于 Android、代理环境或安全案例实测。

## 系统核心服务逐节覆盖

- `docs/android/basics/system-services.md`：完整阅读 AMS/ATMS、完整启动图、复用分支、源码地图、PMS 五方法、WMS、ContentService、PackageInstallerService 四小节及症状定位。启动部分修订见下；PMS/ContentService/安装器的主要结论经官方 API 和固定源码核对，未新增无依据的设备结论。
- `docs/android/index.md`：完整阅读基础、Framework、Kotlin、工具与笔记组织方式；分类说明与正文一致，无需修改。
- `docs/index.md`：首页为 `KnowledgeHome` 入口，没有独立技术结论；分类链接由导航统一维护。
- `docs/guide.md`：完整阅读查找、图示查看、写作与附件、本地预览；示例路径与 package scripts 相符，无需修改。

### 启动链修订与来源

1. **attach 分支条件不够明确**：原图称“正常 attach”，仅笼统指出等待开关影响时机。现明确主图要求 expedite 关闭且 wait-for-finish 开启；wait 关闭时 AMS 在 attach 内直接调用 Inner，忽略客户端后续 finish 回报。依据 [AMS.attachApplicationLocked / finishAttachApplicationInner / finishAttachApplication](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/services/core/java/com/android/server/am/ActivityManagerService.java#L4826)。没有把源码开关等同于已查询的设备配置。
2. **进程 thread 存在被误当成初始化已完成**：原图复用分支直接省略 Application 初始化。现明确已有 thread 时 bind 仍可能在途，启动事务等主线程处理；已有进程记录但缺少 thread 时还可能等待正在进行的进程启动。补上 realStart 的暂停交接门槛。依据 [ActivityTaskSupervisor.startSpecificActivity / realStartActivityLocked](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/services/core/java/com/android/server/wm/ActivityTaskSupervisor.java#L808)、[ATMS.startProcessAsync](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/services/core/java/com/android/server/wm/ActivityTaskManagerService.java#L5322)、[ActivityThread.main](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/app/ActivityThread.java#L9018)。
3. **启动身份与桌面入口范围缺失**：补足同用户普通图标、NEW_TASK 不等于每次新建任务、caller Binder / token / package 与真实 PID/UID、目标 UID 的区别；深层快捷方式和跨用户入口另列。依据 [Launcher3.ActivityContext.startActivitySafely](https://android.googlesource.com/platform/packages/apps/Launcher3/+/refs/tags/android-16.0.0_r1/src/com/android/launcher3/views/ActivityContext.java#418)、[Instrumentation.execStartActivity](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/app/Instrumentation.java#L1951)、[ActivityStarter.Request.resolveActivity](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/services/core/java/com/android/server/wm/ActivityStarter.java#L560)。属于补充边界，不是原提纲新增错误。
4. **绘制回报线程与事务顺序失真**：原图先向 SF 提交，随后由应用主线程回报 finishDrawing。现改为缓冲区与窗口同步协作，finishDrawing 可携带待合并事务，跨进程路径的同步完成回调不必先切回主线程；补充窗口可见性、启动窗口移除与过渡条件，SF 与 HWC / 显示管线协作，缓冲区与 fence 就绪后才可能呈现。依据 [ViewRootImpl 同步完成回调](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/view/ViewRootImpl.java#L4569)、[reportDrawFinished](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/view/ViewRootImpl.java#L5364)、[WindowState.finishDrawing](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/services/core/java/com/android/server/wm/WindowState.java#L5645)、[ActivityRecord.onFirstWindowDrawn](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/services/core/java/com/android/server/wm/ActivityRecord.java#L6472)。par 表示协作通道而非声称两路独立完成。
5. **显示指标和物理呈现需分开**：保留 startActivity 返回、onResume、目标内容呈现三种结束点，并明确 TTID 的 windows-drawn 计时不能直接充当面板扫描完成证据；TTFD 需应用正确报告 fully drawn，不是系统自动检测业务加载。依据 [ActivityRecord.onWindowsDrawn](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/services/core/java/com/android/server/wm/ActivityRecord.java#L6545)、[启动耗时官方说明](https://developer.android.com/topic/performance/issues/launch-time)。

### 核对后保留的结论

- 主线程在 `main()` 准备 Looper，attach 返回后进入 loop；Application 的 attachBaseContext、本次初始 Provider 的 onCreate、Application.onCreate 与 Activity 执行的相对关系按普通启动成立。依据 ActivityThread 的 `handleBindApplication`（初始 Provider 安装约 L7814，Application 回调约 L7830，finish 回报约 L7870）；公开启动说明的概述不能用于推翻该固定源码顺序。
- Zygote 与 USAP 使用 socket 启动协议；PID 回复与子进程 attach 不构成严格串行关系。依据 [ZygoteProcess.attemptUsapSendArgsAndGetResult](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/os/ZygoteProcess.java#L491)、[AOSP Zygote 说明](https://source.android.com/docs/core/runtime/zygote)。
- PMS 查询与生命周期执行不同；共享库列表不是 APK 全部依赖；公开清数据入口限自身应用。依据 [PackageManager.getSharedLibraries](https://developer.android.com/reference/android/content/pm/PackageManager#getSharedLibraries(int))、[ActivityManager.clearApplicationUserData](https://developer.android.com/reference/android/app/ActivityManager#clearApplicationUserData())，及固定 `ActivityManager.java` L3555 委托自身包名。
- ContentService 管理观察和通知，数据访问属于 Provider；固定源码的 `registerContentObserver` / `notifyChange` 检查用户和访问。依据 [ContentService](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/services/core/java/com/android/server/content/ContentService.java#L365)。
- 安装 Session 的客户端/服务端类型、写入/fsync/关闭、异步 commit 和结果 PendingIntent 可变性例外正确。依据 [PackageInstaller.Session API](https://developer.android.com/reference/android/content/pm/PackageInstaller.Session#commit(android.content.IntentSender))，target 35+ immutable 结果端点抛 IllegalArgumentException。

## 其他分组逐篇覆盖

以下合并三组完整记录，路径以仓库根目录为准；共 49 页，包含索引与覆盖页。正文阅读及来源核验与运行验证分别记录。

## Android 基础与 Framework 专业复核记录

复核日期：2026-10-22。范围为基础目录除 `system-services.md` 外的 12 页及 Framework 5 页，共 17 页；另对主任务修订后的 AMS/ATMS 启动章节做独立互审。所有正文已按章节连续阅读，索引、图、代码块、失败路径与来源段均纳入，不以关键词扫描代替正文阅读。用户已授权发现错误直接修改；保留现有未提交内容，不提交、推送、打标签、删除源码或发布。使用 `android-framework-dev` 技能。

平台实现固定 `android-16.0.0_r1`；Binder 驱动独立使用原文声明的 `android16-6.12-2025-06_r1`。通过浏览工具访问 Android Developers、AOSP 官方说明和官方 GitHub 镜像，通过 Gitiles `?format=TEXT` 实际获取固定标签源码并定位函数。Gitiles HTML 在浏览工具存在 URL 编码错误，已使用原站文本接口核验，未替换为其他版本。本文不声称编译过 Android 示例或执行过设备命令。

### 实质修订

1. `docs/android/basics/pending-intent.md:43`，“哪些参数决定复用同一份记录”：原文列操作类型、创建者、requestCode、Intent，但遗漏记录 flags 的身份作用。补充 `FLAG_ONE_SHOT`、`FLAG_IMMUTABLE` 必须在查询/修改时一致，给出一次性查询的组合，并区分获取操作控制标志。证据：[PendingIntent 官方匹配契约](https://developer.android.com/reference/android/app/PendingIntent)、[PendingIntentRecord.Key.equals](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/am/PendingIntentRecord.java)、[PendingIntentController.getIntentSender](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/am/PendingIntentController.java)。源码在构建 Key 前清除 NO_CREATE/CANCEL_CURRENT/UPDATE_CURRENT，Key 仍比较其他 flags。
2. `docs/android/basics/messenger.md:149`，“客户端绑定并构造 Messenger”：原句“记录绑定是否成功”容易把清理责任等同于返回 true。改为分别跟踪绑定尝试与清理责任，正常返回 false 也按契约释放；异常则确认是否登记连接，避免盲目解绑。证据：[Context.bindService](https://developer.android.com/reference/android/content/Context#bindService(android.content.Intent,%20android.content.ServiceConnection,%20int))、[固定 Context.java 的 bindService 返回契约](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/Context.java)、[ContextImpl.bindServiceCommon](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/ContextImpl.java)。与既有 Framework 绑定服务篇保持一致。
3. `docs/android/basics/service-lifecycle.md:55`，“BIND_AUTO_CREATE 的含义”：同一清理边界在基础 Service 篇原先缺失，补充 false 的释放责任及“尝试/已连接/已清理”三个状态，来源同第 2 项。
4. `docs/android/basics/class-loading.md:51`，“DelegateLastClassLoader 的边界”：原文“引导类 → 自身路径 → 父”未限定公开构造场景，容易与前节共享库规则冲突。补充先查已加载类、自身阶段调用继承的 findClass，平台配置共享库时仍含前置/后置共享库。证据：[DelegateLastClassLoader API](https://developer.android.com/reference/dalvik/system/DelegateLastClassLoader)、[DelegateLastClassLoader.loadClass](https://android.googlesource.com/platform/libcore/+/refs/tags/android-16.0.0_r1/dalvik/src/main/java/dalvik/system/DelegateLastClassLoader.java)、[BaseDexClassLoader.findClass](https://android.googlesource.com/platform/libcore/+/refs/tags/android-16.0.0_r1/dalvik/src/main/java/dalvik/system/BaseDexClassLoader.java)。
5. 交叉复核新增修订：主任务发现第 2、3 项及 `framework/service-manager-aidl.md:211` 对异常的说明仍过于笼统。固定 `Context.java:3979–3987` 明确要求抛出 `SecurityException` 也调用 unbindService，三页现均写明此契约（Messenger:149、Service:55、Framework:211）。另在 Messenger:151、Service:57、Framework:213 区分 `ContextImpl.java:2206–2210` 的登记前 null connection/Handler+Executor 参数异常，以及 `2214–2221` 的先取 ServiceDispatcher、后校验 Intent 顺序；不能把全部 IllegalArgumentException 都当成未登记。证据：[Context.java#L3979](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/content/Context.java#L3979)、[ContextImpl.java#L2201](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/app/ContextImpl.java#L2201)。

以上修订未改标题、锚点、导航、图片或 Mermaid。Framework 初轮认为无需修改；交叉复核发现绑定异常清理契约遗漏后，已按第 5 项修订 ServiceManager/AIDL 篇，其余四篇保留。

### 逐篇完整覆盖

#### docs/android/basics/index.md：通过，无内容修改

覆盖“通信基础、四大组件、核心服务、PendingIntent/LoadedApk/运行时、来源原图与覆盖”全部小节。核对 12 篇关联页、system-services 入口、既有显式锚点、原提纲分组与未编译声明；覆盖与导航顺序由现有测试核对。原始钉钉内容的重新采集不在本分工，来源完整性沿用已保存的覆盖清单，不声称本轮重新采集原文。

#### docs/android/basics/activity-startup.md：通过，无内容修改

覆盖 ActivityThread、Instrumentation、ActivityStarter、Task、ActivityTaskSupervisor、ClientTransaction、总览图、冷温热、生命周期与窗口、分阶段排查。确认 ActivityThread 非 Thread、进程/任务/实例不一一对应、startSpecificActivity 进程检查与失败回退、请求返回非首帧。来源：[ActivityTaskSupervisor.startSpecificActivity / realStartActivityLocked](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/wm/ActivityTaskSupervisor.java)、[官方任务返回栈](https://developer.android.com/guide/components/activities/tasks-and-back-stack)、[启动耗时](https://developer.android.com/topic/performance/issues/launch-time)。总览图限定为阶段关系，未将其当作固定调用栈。

#### docs/android/basics/binder-basics.md：通过，无内容修改

覆盖 Java 的 IBinder/Binder/BinderProxy/IInterface，Native 的 IBinder/BpBinder/BBinder，一次调用返回及学习检查点。确认业务 Stub.Proxy 与 BinderProxy 为组合而非继承、JavaBBinder 继承 BBinder、asInterface 本地直接调用与远端线程差异。来源：[AIDL 官方线程契约](https://developer.android.com/develop/background-work/services/aidl)、[android_util_Binder.cpp 的 JavaBBinder 与对象转换](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/jni/android_util_Binder.cpp)。

#### docs/android/basics/broadcast.md：通过，无内容修改

覆盖动态/Manifest 注册、发送队列、接收图、PendingResult.finish/历史截图、有序广播、goAsync 示例与排查。确认 r1 为 BroadcastQueueImpl、assumeDelivered 例外、动态 ReceiverDispatcher 与静态 handleReceiver 的区别，以及 finish 只完成当前接收步骤。来源：[BroadcastQueueImpl.finishReceiverLocked 与调度](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/am/BroadcastQueueImpl.java)、[BroadcastReceiver.PendingResult.finish / sendFinished](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/BroadcastReceiver.java)、[Android 16 广播优先级规则](https://developer.android.com/develop/background-work/background-tasks/broadcasts#changes-system-broadcasts)。异步示例含拒绝执行时 finish 和未编译声明；未声称无限时限。

#### docs/android/basics/class-loading.md：修订后通过

覆盖类身份、默认委派及图、Path/DexClassLoader、BaseDex/DexPathList、DelegateLast、动态加载及异常。修订见第 4 项。核对 optimizedDirectory 自 API 26 弃用且无效、DelegateLast API 27、定义加载器与发起加载器差异；Android 14 DCL 的只读条件属于 target SDK 34+ 行为，原文“面向”保留此条件。来源：[DexClassLoader](https://developer.android.com/reference/dalvik/system/DexClassLoader)、[Android 14 DCL](https://developer.android.com/about/versions/14/behavior-changes-14#safer-dynamic-code-loading)及第 4 项固定 libcore。

#### docs/android/basics/content-provider.md：通过，无内容修改

覆盖 Manifest 声明/Observer 注册、创建发布、查询图、Cursor/文件、线程、ContentService 通知图、注册注销片段与权限引用。确认 Observer 注册不注册 Provider，远端数据操作不由 AMS 逐行转发，onCreate 与 Application.onCreate 顺序已限定普通绑定路径。来源：[ContentProviderHelper.getContentProviderImpl / publishContentProviders](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/am/ContentProviderHelper.java)、[ActivityThread.installProvider / handleBindApplication](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/ActivityThread.java)、[ContentObserver API](https://developer.android.com/reference/android/database/ContentObserver)。观察者示例明确要求防重复、生命周期和 API 16，未编译。

#### docs/android/basics/dynamic-proxy.md：通过，无内容修改

覆盖 Proxy/InvocationHandler、调用图、Notes 示例、Object 身份语义、反射异常解包、返回值/throws、加载器与 Binder Proxy 区别。确认 equals/hashCode/toString 转交处理器、InvocationTargetException 解包与 UndeclaredThrowableException 边界。来源：[Proxy](https://developer.android.com/reference/java/lang/reflect/Proxy)、[InvocationHandler.invoke](https://developer.android.com/reference/java/lang/reflect/InvocationHandler)。嵌套类型示例已有外部类假设及未编译说明，未引入 Hook。

#### docs/android/basics/handler.md：通过，无内容修改

覆盖四对象、线程/Looper、分发图、send/post、dispatch 优先级、延迟/顺序/等待、队列版本、SerialNoteWorker 与性能生命周期。确认 Runnable 优先于 Handler.Callback、MessengerImpl 在 Binder 入口捕获 UID、延迟使用 uptime、异步消息仅越过屏障、quitSafely 不等待未来消息。来源：[Handler.dispatchMessage / MessengerImpl](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/Handler.java)、[Looper.quitSafely](https://developer.android.com/reference/android/os/Looper#quitSafely())、[CombinedMessageQueue](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/CombinedMessageQueue/MessageQueue.java)。专用线程示例已限定主线程拥有者、API 18、取消不终止运行中任务，未编译。

#### docs/android/basics/loaded-apk.md：通过，无内容修改

覆盖实例/弱缓存、Application 创建与 onCreate、初始化时序图、appDir/libDir、共享类加载器和分发职责。确认普通 bind 路径 makeApplicationInner(..., null) 后安装 Provider，再 callApplicationOnCreate；Application 对象与 attachBaseContext 已在 Provider 之前。来源：[LoadedApk.makeApplicationInner / createOrUpdateClassLoaderLocked](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/LoadedApk.java)、[ActivityThread.handleBindApplication / getPackageInfo](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/ActivityThread.java)。未将 weak cache、Resources 和 ClassLoader 混为永久单例。

#### docs/android/basics/messenger.md：修订后通过

覆盖轻量 IPC 图、两构造方式、通信四步、服务/Manifest/请求示例、Message 协议、sendingUid、顺序/失败/边界。修订见第 2 项。确认 IMessenger 为 oneway，Handler.getIMessenger 缓存实现，MessengerImpl.send 捕获 UID 再入队；同 UID 独立进程示例不等同跨应用授权。来源：[Handler.MessengerImpl](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/Handler.java)、[IMessenger.aidl](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/IMessenger.aidl)、[Message.sendingUid](https://developer.android.com/reference/android/os/Message#sendingUid)。示例已限定 API 21、短字符串、超时与失败边界，未编译。

#### docs/android/basics/pending-intent.md：修订后通过

覆盖 IntentSender、系统记录时序、复用 flags、可变性、安装回调例外及取消/完成。修订见第 1 项。确认 extras 不参与 filterEquals、IMMUTABLE 不阻止创建者 UPDATE_CURRENT、target 31 可变性声明、target 35 安装 commit 拒绝不可变接收器。来源除第 1 项外：[PackageInstaller.Session.commit](https://developer.android.com/reference/android/content/pm/PackageInstaller.Session#commit(android.content.IntentSender))。未触发安装/通知/闹钟。

#### docs/android/basics/service-lifecycle.md：修订后通过

覆盖系统/客户端记录、start、bind 图、AUTO_CREATE、Binder 缓存/线程、销毁图、started/bound、startId、onDestroy、FGS 与排查。修订见第 3 项。确认 handleCreateService 用 AppComponentFactory 构造并 attach，生命周期主线程不等于远端业务线程；onBind 缓存与 onRebind 不等于每客户端新建 Binder。来源：[ActivityThread.handleCreateService / handleBindService / handleServiceArgs](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/ActivityThread.java)、[Service API](https://developer.android.com/reference/android/app/Service)、[绑定服务](https://developer.android.com/develop/background-work/services/bound-services)。未误将 sticky/FGS 当作永久存活保证。

#### docs/android/framework/activity-token.md：通过，无内容修改

覆盖第 1–11 节、三图、三张身份/场景表与只读命令。核对 ActivityRecord.Token 继承 Binder 并弱引记录；传回拥有进程恢复本地 Binder；mActivities 先登记后 attach/onCreate；View.getWindowToken 为 IWindow；子窗口 LayoutParams.token 与普通应用 Activity token 分流；配置重建身份可保留。来源：[ActivityRecord.Token / forToken](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/wm/ActivityRecord.java)、[View.getWindowToken / getApplicationWindowToken](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/view/View.java)、[Window.adjustLayoutParamsForSubWindow](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/view/Window.java)、[ActivityThread.performLaunchActivity](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/ActivityThread.java)。BadToken 排查及权限限定未被扩大为通用授权。

#### docs/android/framework/binder-mechanism.md：通过，无内容修改

覆盖第 1–12 节及三个图：接口/代理、本地优化、目录/handle、请求回复、Parcel/拷贝、线程/重入/oneway、身份、死亡、缓冲、历史分域、设备步骤和源码路线。实际核对 IPCThreadState 的 BC_REPLY/BR_REPLY/远端事务分派、ProcessState 的 handle 0 和 BINDER_VM_SIZE、NDK 3+1+1 示例、驱动 async_todo 与引用转换。来源：[IPCThreadState.cpp](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/IPCThreadState.cpp)、[ProcessState.cpp](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/ProcessState.cpp)、[binder_process.h](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/ndk/include_platform/android/binder_process.h)、[固定 binder.c](https://android.googlesource.com/kernel/common/+/refs/tags/android16-6.12-2025-06_r1/drivers/android/binder.c)、[官方线程模型](https://source.android.com/docs/core/architecture/ipc/binder-threading)。单向 payload 拷贝、每节点异步串行、非全局 handle、失败不证明未执行等限定准确。

#### docs/android/framework/client-transaction.md：通过，无内容修改

覆盖第 1–13 节、继承图/时序图/路径图和生命周期回报表。核对 Launch 直接继承 ClientTransactionItem；服务端 Launch+Resume/Pause/Stop；pending 以进程 Binder 为 key；preExecute 在入队前；执行器按 item 顺序解释；缺记录分支、异常后无回滚；Pause 同步而 Resume/Stop/Destroy oneway。来源：[LaunchActivityItem](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/servertransaction/LaunchActivityItem.java)、[ClientLifecycleManager](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/wm/ClientLifecycleManager.java)、[TransactionExecutor](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/servertransaction/TransactionExecutor.java)、[IActivityClientController](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/IActivityClientController.aidl)。旧 callbacks/final-state 成员未被当作当前解释路径。

#### docs/android/framework/service-manager-aidl.md：交叉复核修订后通过

覆盖第 1–12 节、目录/绑定图、缓存图、跨进程绑定图、AIDL/Service 示例、返回值/断连和权限。实际核对 ServiceManagerProxy.getService2 转 checkService2、Java sCache 不自动填充、native backend 独立缓存、servicemanager add/find/isolated 检查；业务 Binder 与 ServiceRecord Token 分离。来源：[ServiceManagerNative.java](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/ServiceManagerNative.java)、[ServiceManager.java](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/ServiceManager.java)、[BackendUnifiedServiceManager.cpp](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/BackendUnifiedServiceManager.cpp)、[目录 ServiceManager.cpp](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/cmds/servicemanager/ServiceManager.cpp)。false 的解绑责任本篇原已正确，SecurityException 与参数登记顺序的遗漏按第 5 项补正。

#### docs/android/framework/surfaceflinger-vsync.md：通过，无内容修改

覆盖第 1–12 节、三个总览/回调/分发图、硬件表、fence 表及排查/时间线表。实际核对 DRM_VBLANK_RELATIVE+sequence=1、EINTR/SyntheticWaitVBlank；AIDL onVsync CLOCK_MONOTONIC；HAL 服务端 ComposerClient/BnComposerClient；SF→Scheduler→VsyncSchedule 采样与硬件开关；MessageQueue.dispatchFrame；BLAST acquireNextBufferLocked/setBuffer；CommandResultPayload 的物理视频/命令模式及虚拟 present 定义。来源：[VSyncWorker](https://android.googlesource.com/platform/external/drm_hwcomposer/+/refs/tags/android-16.0.0_r1/drm/VSyncWorker.cpp)、[ComposerClient.h](https://android.googlesource.com/platform/external/drm_hwcomposer/+/refs/tags/android-16.0.0_r1/hwc3/ComposerClient.h)、[Scheduler](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/Scheduler/Scheduler.cpp)、[MessageQueue](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/Scheduler/MessageQueue.cpp)、[BLASTBufferQueue](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/gui/BLASTBufferQueue.cpp)、[IComposerCallback](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/IComposerCallback.aidl)、[CommandResultPayload](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/CommandResultPayload.aidl)。未将 doFrame/提交/信号/物理扫描混同；未把 executeCommands 包装名写成不存在的独立 AIDL 方法。

### AMS/ATMS 独立互审

结果：PASS，仅读主任务修订结果，未编辑 `system-services.md`。

- 第 134 行两开关：r1 `AMS.attachApplicationLocked` 依据 expedite flag 早 attach ATMS，依据 wait flag 决定是否直接 finishInner；`finishAttachApplicationInner` 只在非 expedite 时 attach ATMS，公开 finish 在 wait 关闭时忽略。图选非 expedite + wait 开启，准确。
- 第 90–100、143 行 bind 消息与复用：已有 ApplicationThread 不代表初始化完成；同一应用入口的 oneway 调度和主消息队列保留初始化在先；暂停交接可暂缓 realStart，准确。
- 第 121–129、151 行绘制：`ViewRootImpl.createSyncIfNeeded` 允许非本地 WindowSession 从回调线程直接 reportDrawFinished；本地 Binder 才拷贝事务并 postAtFrontOfQueue。`WindowState.finishDrawing` 可合并事务到 mSyncTransaction。par 图附带“非独立”和事务合并说明，没有把两支宣称为无依赖提交。
- 第 153 行：TTID/Displayed/windows-drawn 非面板扫描完成；TTFD 需应用正确报告 reportFullyDrawn，准确。
- 第 136 行来源：Launcher3.startActivitySafely 加 NEW_TASK；普通同用户 startActivity、深层 shortcut/跨用户 LauncherApps 分支均核实；Intent 元数据不替代 Binder 调用身份。

独立互审来源：[AMS](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/am/ActivityManagerService.java)、[ViewRootImpl.createSyncIfNeeded / reportDrawFinished](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/view/ViewRootImpl.java)、[WindowState.finishDrawing](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/wm/WindowState.java)、[Launcher3.ActivityContext.startActivitySafely](https://android.googlesource.com/platform/packages/apps/Launcher3/+/refs/tags/android-16.0.0_r1/src/com/android/launcher3/views/ActivityContext.java)、[TTID/TTFD 官方定义](https://developer.android.com/topic/performance/issues/launch-time)。

### 修订后的第二轮逐项核验

- PASS：`pending-intent.md:43` 对照固定 `PendingIntentController.getIntentSender` 的 flags 掩码及 `PendingIntentRecord.Key.equals` 的 flags 比较；查询一次性且不可变记录的说明保留两种身份标志，没有把控制标志写成身份。
- 初次自检漏项，交叉复核后 PASS：`messenger.md:149`、`service-lifecycle.md:55`、`framework/service-manager-aidl.md:211` 现均明确正常 false 和 SecurityException 都释放；各页后续段落根据 ContextImpl:2206–2221 区分登记前参数错误与登记后 Intent 检查，未将所有异常统一归为“已登记”或“未登记”。
- PASS：`class-loading.md:51` 对照 DelegateLast 的 findLoadedClass、boot 查找、findClass、parent 路径，以及 BaseDex 的共享库前后顺序；只将普通公开构造概括为 DEX，平台配置场景明确另述。
- PASS：全部修订均未改变代码示例、章节标题、锚点、图或导航；定向扫描没有新增行尾空白。主任务已对 PendingIntentController:155/Key:231、DelegateLast:181/199/BaseDex:232 交叉核验 PASS；异常清理新增修订已回交核验。

### 定向验证与限制

- `node --test tests/android-basics-outline.test.mjs`：2/2 通过，覆盖原段落映射与导航顺序；此结果不证明机制正确。
- `git diff --check`：退出 0，仅现有仓库 LF/CRLF 提示，无空白错误。
- 本分工未改 Mermaid 或锚点；最终 `npm.cmd test`、构建和桌面/手机浏览验证由主任务统一执行，不能把历史基线当成本轮结果。
- 所有 Android Java/Kotlin/AIDL 示例均为源码/契约层面审阅，未编译或真机执行；已有页面的“未编译/未实测”声明保留。未虚构设备系统、线程日志、耗时或 trace 结果。
- 厂商 HAL、内核 IRQ、实际队列实现选择、开关值及 App 生命周期竞态没有设备证据，保留原文条件限定。历史截图不提供 Android 版本证明。

## Android 安全知识复核记录

复核日期：2026-10-22。范围是 `docs/security/android/` 的 21 页及 `docs/security/index.md`，共 22 页。逐篇按连续正文分段阅读，包含旧专题全文、代码、图示和验证限制；没有以关键词命中替代阅读。保留“通用组件安全 / 配置安全 / 文件操作 / 特殊函数 / Dos攻击”五章及所有既有标题、层级和锚点。

本组正文已冻结供主任务统一构建和浏览器验证。仅修改 5 个已有页面及本记录；不修改共享导航，不执行重组脚本，不提交、不推送、不发布。

### 逐篇与小节覆盖

下述“通过”表示文档机制与适用条件审阅完成，不表示 Android 样例已编译或设备实验通过。S 编号与 `coverage.md` 的原段落标识一致。

1. `docs/security/android/component-security.md`：完整覆盖开篇 UID/平台权限/业务授权及 S6–S96。Activity 的权限、暴露、Intent、深链、键盘；广播的动态/静态导出、双向权限、嗅探、粘性；Service 的暴露、目标、AIDL、本地/远程/异步身份、Messenger、FGS；Provider 的导出、路径、SQL、URI grant、MIME/匿名查询、无效 URI、authority、FileProvider 各小节均通过。没有新发现需改正文的问题。
2. `docs/security/android/configuration-security.md`：完整覆盖 S102–S159。权限、UID、sharedUserId、REBOOT、debuggable/新旧备份 XML/跨平台迁移、自定义权限、任务栈、命名空间、导出、隐藏入口、元数据、账户恢复/撤销、卸载、头像、包体、剪贴板、R8、位置/设置、动态代码各小节均完成；S153 的位置示例补最低运行/编译条件（R2），其余通过。
3. `docs/security/android/file-operations.md`：开篇访问主体与导入/导出模型、S165 上传、S168 下载、S171 文件读写、S174 Bitmap 全部通过。复核实际字节预算、来源与授权、重定向、canonical 边界及竞态、AtomicFile 不提供锁、像素乘法溢出与峰值差异；不把受控路径示例称为完整解析器。
4. `docs/security/android/special-functions.md`：开篇能力模型、S180 命令、S183 解压、S186 路径段、S189 序列化、S192 JEXL、S195 TA 全部通过。区分 shell/参数注入，核对可信解压根、资源配额、API34 ZIP 行为条件、类型化读取的能力边界、JEXL 滚动文档 3.7 默认变化与 TA 条件解释。
5. `docs/security/android/dos-attacks.md`：开篇可达性/资源模型、S201–S240 全小节覆盖。S201 修正 package 与 component 的优先关系，并补 resolveActivity 和 selector 条件（R1）；URI、历史 Fragment、Base64、flags、内容导入、文本选择、包查询/Binder、表单解码及全部子项其余通过。异常不等于越权或持续 DoS，缓冲区与请求回复不确定性已有正确限制。
6. `docs/security/android/coverage.md`：逐项覆盖全部 80 个 S 条目与五章映射，检查“展开/纠正/条件化”是否与正文一致；S201 同步 R1，其余通过。75 条带 S 锚点的正文定位均与对应标题精确匹配。
7. `docs/security/index.md`：五章导读、全部条目和阅读说明完整覆盖。修正 13 处能访问但指向非同名小节的链接（R3）；不变动任何标签文字与层级。75 条带 S 锚点的链接均与目标标题精确匹配。
8. `docs/security/android/foundation/security-model.md`：UID/共享身份、导出/版本、权限声明/自定义等级/命名空间、最终产物审查及全部验证段通过；与五章相应结论一致。
9. `docs/security/android/foundation/activity-intent.md`：入口、转发、set-package、deep-links、uri-grants、task-stack 全节覆盖。set-package 与主章同步 R1；其余通过。生命周期回调不能当直接客户端事务、App Links 不授权业务对象的描述正确。
10. `docs/security/android/foundation/broadcast.md`：broadcast-model、manifest-receiver、runtime-receiver、broadcast-permissions、broadcast-eavesdropping、sticky-broadcasts 全节及验证段通过；OS/target 条件、NOT_EXPORTED 对部分高权限系统应用广播的限制、收发权限方向正确。
11. `docs/security/android/foundation/service-ipc.md`：service-entry、service-hijacking、binder-authorization/aidl-methods、async-identity、messenger、foreground-service 全节通过；本地 oneway 仍同步，onBind 不代表每次事务身份，Handler 执行不延续 Binder 身份的说明与主章一致。
12. `docs/security/android/foundation/provider.md`：authority-routing/conflicts、provider-permissions/exported、path-permissions、uri-sharing、mime-type/anonymous-mime、invalid-uri 全节通过；不导出与特定 URI grant 可并存，MIME 默认委托及 API34 条件正确；authority 利用链仍明确未做安装实验。
13. `docs/security/android/engineering/file-sharing.md`：file-boundaries、fileprovider-roots、uri-grants、untrusted-provider、path-and-races、verification、related 全节及 Kotlin 导入代码通过。外部显示名不作落点，缓存暂存与失败清理、字节预算不保证时限的限制准确。
14. `docs/security/android/engineering/data-lifecycle.md`：account-binding/恢复分类、storage-and-restore、logout-cleanup、uninstall-residue、clipboard、clipboard-cleanup、verification 全节通过。备份不继承当前授权，Keystore 不保证进程内秘密不可用，剪贴板敏感标记与 API24/33 条件及非原子清理限制已明确。
15. `docs/security/android/engineering/release-hardening.md`：debuggable、backup-policy、backup-rules、hidden-entrypoints、metadata-and-package、obfuscation、verification 全节及两套备份 XML 通过。API31/OS12 的规则组合、OEM D2D 例外和滚动 QPR2 扩展已区分；未把 APK 扩展名或混淆当完整防护。
16. `docs/security/android/engineering/uri-sql-input.md`：boundaries、path-segments、query-parameters、url-decoder、sql-injection、verification 全节及 Kotlin 片段通过。规范查询示例拒绝编码键别名与重复参数；SQL 结构使用固定映射，值与行级授权分开；Android Charset 重载版本单列。
17. `docs/security/android/engineering/untrusted-files.md`：pipeline、upload、download、avatar-cache、bitmap、archive、verification 全节及 Bitmap/ZIP 片段通过。解压可信根与竞态、路径与资源预算、压缩字节与像素峰值等边界与当前主章一致。
18. `docs/security/android/engineering/injection-serialization.md`：capability-model、command-execution、jexl、deserialization、base64、verification 全节及片段通过。解释器可达能力、参数语义、JEXL 权限基线与隔离、Parcel 非持久化、Base64 非认证及分配前输入限制均有正确限定。
19. `docs/security/android/audit/location-risk.md`：mock-signals、developer-settings、candidate-validation、server-policy、verification 全节及 Java 代码通过。旧页已明确最低 API18/编译 API31，主章遗漏已补 R2；时钟必须同一启动周期，mock=false 不证明真实，未知不等于正常。
20. `docs/security/android/audit/runtime-code-trust.md`：plugin-chain、integrity、read-only、ta-scope、verification、findings 全节及摘要片段通过。摘要与信任根、真实但过时版本、API34/target34 的写入前只读、同进程执行权限及 TA/OEM 条件均与主章一致。
21. `docs/security/android/audit/ui-legacy-input.md`：ime-boundary、legacy-fragment（API/target 与精确列表）、selection-bounds、verification 全节及 Java 片段通过。IME 标志为请求、API19 默认 Fragment 校验与 target 门槛、真实过滤后文本索引限制准确。
22. `docs/security/android/audit/availability-binder.md`：dos-model、binder-budget/协议配额、package-flags/示例、resource-policy、verification 全节通过。1MB 近似契约与 libbinder 映射区分、请求回复失败不确定性、零 flags 基础字段以及未执行压力实验的说明准确。

### 实质修正与逐项二轮核验

共 15 个发现：2 个内容问题、13 个索引目标错误。涉及 5 页；不把已有原提纲勘误重复计入本次发现。

#### R1：package 不能覆盖已有显式组件

- 原文：`setPackage()` 限制匹配包范围，设置 ComponentName 可以“进一步明确组件”；没有说明外部已有 component 会优先进入显式解析，易被理解为先补 package 就能限定外部对象。
- 修正：限定 package 的匹配路径，明确 setter 不清除 component；已有 component 的 `resolveActivity()` 直接返回该值，不代表存在性、导出权限或业务鉴权；非空 package 与 selector 不可并用。建议仍是提取必要业务值后新建受应用控制的 Intent。
- 证据：固定 `android-16.0.0_r1` 的 [Intent.setPackage](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/Intent.java#11408)、[Intent.resolveActivity](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/Intent.java#10113)、[ComputerEngine 显式查询分支](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/pm/ComputerEngine.java#542)。实际读取对应函数源码；web 抓取 AOSP URL 失败后，以 Gitiles `?format=TEXT` 获取并 base64 解码核验。
- 修改位置：`dos-attacks.md:52`、`:54`；旧专题 `foundation/activity-intent.md:69`、`:71`；覆盖表 `coverage.md:103`。
- 二轮：PASS。脚本断言主章和旧专题两个完整段落完全相同；检查 S201 仍指向原锚点且已写同一结论。此项是文档事实修正，没有执行攻击样例。

#### R2：位置示例迁移到主章时遗漏版本前提

- 原文：主章给出 `SDK_INT >= 31 ? isMock() : isFromMockProvider()`，未明确最低运行版本与编译 SDK；旧专题顶部已有对应条件。
- 修正：在主章代码前补最低运行 API18、编译 SDK 支持 API31；保留未编译、未设备执行状态。
- 证据：[Location.isFromMockProvider](https://developer.android.com/reference/android/location/Location#isFromMockProvider()) 为 API18，API31 弃用；[Location.isMock](https://developer.android.com/reference/android/location/Location#isMock()) 为 API31。已实际浏览官方 API 页面及对应版本条目。
- 修改位置：`configuration-security.md:342`；对照旧专题 `audit/location-risk.md:22`。
- 二轮：PASS。两页均明确 API18 与 API31，条件与两个实际调用一致；未改变候选位置分级逻辑，不声称样例已编译。

#### R3：索引标题与链接位置不一致

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

### 已核对的关键一手依据

- 组件身份：[AOSP 沙箱](https://source.android.com/docs/security/app-sandbox)、[Binder.getCallingUid](https://developer.android.com/reference/android/os/Binder#getCallingUid())、[AIDL](https://developer.android.com/develop/background-work/services/aidl)、[Message.sendingUid](https://developer.android.com/reference/android/os/Message#sendingUid)。核对 UID、入站事务、同进程同步与 Messenger 字段适用范围；不将包名或生命周期回调当原始调用者凭据。
- 导出与广播：[Android14 行为](https://developer.android.com/about/versions/14/behavior-changes-14)、[广播总览](https://developer.android.com/develop/background-work/background-tasks/broadcasts)、[Provider 定义](https://developer.android.com/guide/topics/manifest/provider-element)。分别核对运行系统、target 条件、纯系统广播例外及高权限应用广播边界。
- MIME：[ContentProvider API](https://developer.android.com/reference/android/content/ContentProvider#getTypeAnonymous(android.net.Uri)) 与固定标签 [Transport.getType](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/ContentProvider.java#315)。核对 API34 与默认委托，源码权限不足分支在清理身份后调用匿名方法，不把覆写本身当新增权限。
- 共享文件：[官方 FileProvider 风险](https://developer.android.com/privacy-and-security/risks/file-providers)、[FileProvider API](https://developer.android.com/reference/androidx/core/content/FileProvider)、[不可信文件名](https://developer.android.com/privacy-and-security/risks/untrustworthy-contentprovider-provided-filename)、[ZIP 路径遍历](https://developer.android.com/privacy-and-security/risks/zip-path-traversal)。API 页直接抓取超时后通过官方搜索结果核对 subclass/manifest 契约；另外三页正文实际读取。专用 files/cache 子目录合法，配置根不等于无条件外部可读，canonical 仍需可信目录前提。
- 数据生命周期：[Auto Backup](https://developer.android.com/identity/data/autobackup)、[Keystore](https://developer.android.com/privacy-and-security/keystore)、[剪贴板](https://developer.android.com/privacy-and-security/risks/secure-clipboard-handling)、[ClipDescription.setExtras](https://developer.android.com/reference/android/content/ClipDescription#setExtras(android.os.PersistableBundle))。核对 OS/target 备份矩阵、API36.1/QPR2 滚动文档扩展、密钥可用性、API24 setter 与 API33 敏感常量。
- 旧框架：固定标签 [PreferenceActivity.isValidFragment](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/preference/PreferenceActivity.java#998) 与 [实例化路径](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/preference/PreferenceActivity.java#1278)，实际读取默认 target 判断及 Fragment.instantiate 前校验；[IME 标志](https://developer.android.com/reference/android/view/inputmethod/EditorInfo#IME_FLAG_NO_PERSONALIZED_LEARNING) 的 API26 与请求语义也已核对。
- URI/包/Binder：实际读取固定标签 [Uri.getQueryParameterNames](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/net/Uri.java#1617) 与 [getQueryParameter](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/net/Uri.java#1721)、[PackageInfoUtils 基础字段](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/pm/parsing/PackageInfoUtils.java#131) 和 `GET_ACTIVITIES` 分支、[ProcessState 的 BINDER_VM_SIZE](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/ProcessState.cpp#47)，结合 [TransactionTooLargeException](https://developer.android.com/reference/android/os/TransactionTooLargeException) 核对缓冲区共享与部分失败；[URLDecoder](https://developer.android.com/reference/java/net/URLDecoder) 的 Charset 重载 API33 已查证。
- 注入与加载：[不安全反序列化](https://developer.android.com/privacy-and-security/risks/unsafe-deserialization)、[JEXL 官方包说明](https://commons.apache.org/proper/commons-jexl/apidocs/org/apache/commons/jexl3/package-summary.html)、[Android14 动态代码要求](https://developer.android.com/about/versions/14/behavior-changes-14#safer-dynamic-code-loading)、[Trusty 架构](https://source.android.com/docs/security/features/trusty)。分别核对 Parcel 持久化边界、3.7 的 SECURE 基线非完整沙箱、创建新文件写入前只读与 TEE/OEM 条件。
- 设置差异：实际读取固定标签 [Settings.java](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/provider/Settings.java#14067) 的 `@Readable` 定义，并浏览[当前 DEVELOPMENT_SETTINGS_ENABLED 契约](https://developer.android.com/reference/android/provider/Settings.Global#DEVELOPMENT_SETTINGS_ENABLED) 的第三方返回 0 说明。维持二者范围差异，未编造变更版本切点。

### 验证与未核实项

- 本组执行 `node --test tests/android-security-outline.test.mjs`：3/3 通过，验证原始 80 段顺序、五章及全部标题/导航/覆盖关系。
- 本组额外脚本：150 条索引/覆盖链接标签逐字对应目标标题，Intent 主旧段落一致、位置前提一致，全部通过。
- 本组执行 `git diff --check -- docs/security`：无空白错误，只有既有仓库 LF/CRLF 转换提示。全文/标题阅读及脚本不修改源码；未新增 Frida Hook 或 strace。
- 主任务负责并记录最终 `npm.cmd test`、构建、构建产物锚点、桌面/手机浏览器检查；本组没有把历史构建结果当作本次验证。此次未改 Mermaid。
- 所有 Android/Kotlin/Java/XML 示例仍未放入 Android 工程编译、未设备执行；没有安装冲突、跨应用身份、权限撤销、FGS、输入法、真实定位、OOM/Binder 负载或 TEE 实验。
- OEM D2D、旧平台/target 组合、authority 抢先安装影响、设置字段变更切点及具体 TA 缩写/厂商协议仍未证实，正文保留限定。JEXL 为滚动官方资料，本站没有相应依赖，不把版本说明视为本地库测试。
- 文件导入示例仅保证所述字节预算与应用生成落点，没有承诺流取消能强制终止任意恶意 Provider；ZIP、动态代码与文件检查的竞态前提仍需在实际工程核对。

## Kotlin、Web 逆向与抓包实践复核记录

复核日期：2026-10-22。范围为下列 6 篇，已按正文顺序完整阅读。只修改明确分配的正文和本记录；保留现有未提交内容，不提交、推送、打标签、发布或删除源码。网站测试、构建及最终浏览器验收由主任务统一执行。

### 逐篇覆盖

#### docs/android/kotlin/compose-state.md

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

#### docs/android/kotlin/compose-rendering.md

- 导读与范围、§1 声明式模型：核对 Composable、LayoutNode、Android View 数量不一一对应。
- §2 Compiler / Runtime / UI 职责：核对 Kotlin 2.0.0 后编译器仓库归属、生成细节非固定 ABI；补充测量期间子组合例外，见 K3。
- §3 setContent 接入：核对 ComponentActivity 复用 ComposeView、Owner 设置顺序、ComposeViewContext、AndroidComposeView 与 UiApplier。
- §4 LayoutNode：核对 `Layout` 的 ReusableComposeNode 工厂、节点更新和 UiApplier 的 bottom-up 插入。
- §5 组合记录：核对 slot 存储选择、组合记录与 UI 树边界，不把 SlotTable 当绘图指令表。
- §6 测量与放置：核对约束、单次普通测量契约、Lookahead / 内在测量限定及 Android View 接入。
- §7 绘制：核对空 onDraw、dispatchDraw 先 measureAndLayout、根节点绘制、脏图层处理与 Coordinator 图层分支。
- §8 呈现：核对绘制调用、渲染工作与最终显示的边界；没有实测设备呈现帧。
- §9 按状态读取阶段更新、§10 观察点：核对与 State 文一致。K3 为适用边界补充，其余未发现需修正的事实错误。

#### docs/reverse/web-js-reverse.md

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

#### docs/reverse/index.md

已覆盖导言、Web 入口与跨主题连接；内容与 Web 正文相符，没有技术 API 或运行结果断言，无需正文修订。站内链接由主任务构建与浏览器统一验证。

#### docs/tools/app-network-capture.md

- 导言与准备：核对原始经验与未重测声明、电脑 / 手机地址区别、HTTP 代理与上游链路及三个端口职责。
- §一 配置：只读核对原始附件 304 B、HTTP 节点、Global 模式、手动组和 MATCH 规则；修正实际出口选择与流量接管前提，见 T1、T2。未改第三方附件。
- §二 CA：核对 Android target SDK 默认信任和自定义校验 / pinning 边界；补充官方调试配置，见 T3。原系统证书链接确为模拟器限定指南，保留限定。
- §三 普通 / 上游命令：核对 http2、listen-port、web-host、web-port、upstream HTTP 语法、缺失本地脚本的说明；补充当前 stable 文档的 Web UI 认证和监听边界，见 T4。
- §四 验证与附件说明：核对分阶段连通、证书、上游故障归因与原 IP 需要替换。未启动真实抓包、未安装 CA、未操作手机或目标 App。

#### docs/tools/index.md

已覆盖工具定位、抓包入口、Markdown 与本地素材、可复用记录要求；与实际正文一致，无需修订。

### 修订问题与精确证据

#### K1：读取图把观察回调放在状态记录选择之后

- 位置：`compose-state.md` §4，行 78 至 84。
- 原错误：流程边先到“选择当前可见 StateRecord”，再到 readObserver。
- 正确结论：固定源码 `Snapshot.kt` 行 2385 至 2388 先取得 Snapshot、调用 `readObserver`，再选择可见记录；组合读观察再进入 Composition 的当前作用域记录。
- 修改：改为 getter → readObserver → recordReadOf → 当前作用域 → 选择记录并返回值。保留派生状态额外分支限定。
- 来源：[Snapshot.readable](https://android.googlesource.com/platform/frameworks/support/+/a7537bce15de1ae43654cfcfdbb115211977a632/compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/snapshots/Snapshot.kt#2385)、[readObserverOf](https://android.googlesource.com/platform/frameworks/support/+/a7537bce15de1ae43654cfcfdbb115211977a632/compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/Recomposer.kt#1471)、[recordReadOf](https://android.googlesource.com/platform/frameworks/support/+/a7537bce15de1ae43654cfcfdbb115211977a632/compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/Composition.kt#1161)。

#### K2：只读 State 的替换表述不精确

- 位置：`compose-state.md` §9，行 191。
- 原错误：写成替换 `State<List<T>>` 的值，未指出只读接口。
- 正确结论 / 修改：`State<T>.value` 是 `val`；通过 `MutableState<List<T>>.value` 或其他可写状态持有者替换。
- 来源：[State / MutableState 定义，行 75、98](https://android.googlesource.com/platform/frameworks/support/+/a7537bce15de1ae43654cfcfdbb115211977a632/compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/SnapshotState.kt#75)。

#### K3：补充概念流水线的子组合适用边界

- 位置：`compose-rendering.md` §2 图后，行 58。
- 原缺口：虽标明概念主线与后续跳过，仍可能被读作所有子项均须在测量前完成组合。
- 正确结论 / 修改：BoxWithConstraints、LazyColumn 等允许在父布局测量期间组合所需子项；明确这类例外，保留原有概念图。
- 来源：[Compose 三阶段及例外](https://developer.android.com/develop/ui/compose/phases#the-three-phases-of-a-frame)。

#### W1：WAT 的定义应落在模块抽象语法

- 位置：`web-js-reverse.md` §9，行 269。
- 原缺口：“二进制的文本表示”容易与二进制字节转文本混淆。
- 正确结论 / 修改：文本格式是模块抽象语法的表示，与二进制格式表达同层次模块结构，不等于恢复高级语言源代码；改用官方规范引用。
- 来源：[WebAssembly text conventions](https://webassembly.github.io/spec/core/text/conventions.html)。同时将 Reflect.apply、JSON、URLSearchParams 的解释性引用替换为已核对的 ECMAScript / WHATWG 规范，算法与示例不变。

#### T1：Global 出口选择与自定义组选择不能混同

- 位置：`app-network-capture.md` §一，行 40。
- 原缺口：只要求“主动选择 burp”，没有说明 Global 实际取内建 GLOBAL 组，附件的 MATCH 规则在此模式不决定出口。
- 正确结论 / 修改：在 GLOBAL 选 burp；若选自定义组，组内还须选 burp。按 Mihomo 官方文档说明兼容内核语义，不虚构旧版手机客户端界面。
- 来源：[Mihomo Operation Mode](https://wiki.metacubex.one/en/config/general/#operation-mode)；本地原始附件只读核验。

#### T2：补齐目标 App 流量进入代理的前提

- 位置：`app-network-capture.md` §一，行 41。
- 原缺口：导入配置并开启代理，未说明本地监听与 VPN / TUN 接管的差别。
- 正确结论 / 修改：开启客户端相应接管模式、确认目标 App 未排除，并以电脑收到实际请求验证；仅开放 HTTP / SOCKS 监听不使其他 App 自动使用。
- 来源：[Android 按应用 VPN](https://developer.android.com/develop/connectivity/vpn#per-app)、[mitmproxy regular proxy](https://docs.mitmproxy.org/stable/concepts/modes/#regular-proxy)。

#### T3：CA 信任必须区分平台支持与 target SDK

- 位置：`app-network-capture.md` §二，行 47。
- 原缺口：只有“装用户证书不保证能抓包”，缺少默认行为判断条件。
- 正确结论 / 修改：在 Android 7.0 及以后支持该配置的平台，target 24 及以上默认仅系统 CA，target 23 及以下默认另信任用户 CA；显式配置、自定义 TLS 或固定证书另论。补充自有调试应用 debug-overrides。
- 来源：[Network Security Configuration 默认值与调试覆盖](https://developer.android.com/privacy-and-security/security-config)。

#### T4：当前 mitmweb Web UI 可能要求随机令牌

- 位置：`app-network-capture.md` §三，行 61。
- 原缺口：直接要求打开裸 8081 地址，未说明当前 stable 认证；web-host 与代理 host 容易混淆。
- 正确结论 / 修改：使用终端输出或自动打开的完整地址；当前 stable 文档说明空 web_password 生成令牌，旧版以实际输出为准；分别说明 web_host 与 listen_host。
- 来源：[mitmproxy Options 的 web_password / web_host / listen_host](https://docs.mitmproxy.org/stable/concepts/options/)。本机实际版本为 10.4.2，不能据当前 stable 文档推断它具有相同认证行为。

### 其余主要第一手来源

- [Kotlin 属性委托](https://kotlinlang.org/docs/delegated-properties.html)、[Kotlin Compose compiler migration](https://kotlinlang.org/docs/compose-compiler-migration-guide.html)。
- [Compose state](https://developer.android.com/develop/ui/compose/state)、[phases](https://developer.android.com/develop/ui/compose/phases)、[side effects](https://developer.android.com/develop/ui/compose/side-effects)、[custom layouts](https://developer.android.com/develop/ui/compose/layouts/custom)。
- [WebView API](https://developer.android.com/reference/android/webkit/WebView#setWebContentsDebuggingEnabled(boolean))、[WebView bridge API](https://developer.android.com/reference/android/webkit/WebView#addJavascriptInterface(java.lang.Object,%20java.lang.String))。
- [DevTools breakpoints](https://developer.chrome.com/docs/devtools/javascript/breakpoints)、[Network reference](https://developer.chrome.com/docs/devtools/network/reference)、[JavaScript reference](https://developer.chrome.com/docs/devtools/javascript/reference#call-stack)、[source maps](https://developer.chrome.com/docs/devtools/javascript/source-maps)、[Console utilities](https://developer.chrome.com/docs/devtools/console/utilities#debugfunction)。
- [ECMAScript Reflect.apply](https://tc39.es/ecma262/2022/multipage/reflection.html#sec-reflect.apply)、[JSON serialization](https://tc39.es/ecma262/2022/multipage/structured-data.html#sec-serializejsonobject)、[WHATWG URL](https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior)、[Fetch CORS](https://fetch.spec.whatwg.org/#http-cors-protocol)。
- [W3C Web Crypto 2017 Recommendation](https://www.w3.org/TR/2017/REC-WebCryptoAPI-20170126/#subtlecrypto-interface)、[Service Workers FetchEvent](https://w3c.github.io/ServiceWorker/#fetch-event-section)、[Node VM](https://nodejs.org/api/vm.html)。
- [Babel parser](https://babeljs.io/docs/babel-parser)、[traverse](https://babeljs.io/docs/babel-traverse)、[generator](https://babeljs.io/docs/babel-generator)。既有运行时片段仅核对 [Frida Java API](https://frida.re/docs/javascript-api/#java)，未新增专题或执行注入。

### 验证与限制

- 固定基线：`a7537bce15de1ae43654cfcfdbb115211977a632`。从两篇 Compose 正文抽取全部 23 个不同 `.kt` 引用，实际通过官方 Gitiles `?format=TEXT` 并行获取，均 HTTP 200；解码后 SHA-256 与 `artifacts/research/compose-state/`、`compose-rendering/` 已有副本全部一致。web 页面获取失败后改用官方原始接口，不用其他分支替代固定提交。
- 在这些已校验源码中按函数与行号读取相关实现，核对的读取主线为 `Snapshot.kt:2385` → `Recomposer.kt:1471` → `Composition.kt:1161`；绘制主线为 `AndroidComposeView.android.kt:2423` → `LayoutNode.kt:1054` → `NodeCoordinator.kt:507`。大文件只展示需要的局部。
- Node.js 实际版本 `v24.11.1`：从 Web 文正文提取 4 个普通 JS fenced blocks，排除 Android 运行时片段；6 个示例断言全部通过，包含 this、Promise 对象身份、JSON 顺序、URL 空格、SHA-256 abc 向量；另验 7 项边界（原异常身份、接收者、恢复函数身份、恢复描述符、冻结对象拒绝、访问器拒绝、恢复冲突）通过。
- 第一次临时测试工具的非 ASCII 正则受 PowerShell 管道编码影响而语法失败；移除该测试正则，改为断言 Error 类型后通过。失败来自临时验证脚本，不是正文示例，未以文档改动掩盖失败。
- 本机 `mitmweb --version` 实查为 `10.4.2 binary`；`--help` 输出确认文中六类参数存在（set、mode、scripts、web-port、web-host、listen-port），但该命令退出码为 1，不将帮助输出说成抓包成功。未启动代理、未做 CA / Clash / App 端到端实测。
- 已执行 `git diff --check`，无空白错误，只有仓库行尾转换提示；最终全站测试、构建和浏览器结果由主任务补入总记录。
- 需主任务浏览器验收：State §4 修改后的 Mermaid 读取图、相关页面阅读与手机目录。其余图未改；没有改标题、路由或共享导航。
- Kotlin / Android 示例未编译、未真机执行；实际重组、线程、呈现时刻与抓包兼容性仍需匹配应用依赖、设备和客户端版本验证。未声称历史截图代表当前版本。

### 第二轮自检

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

## 交叉复核

主任务独立读取固定源码核对 PendingIntent flags 掩码和 Key 比较、DelegateLast 与 BaseDex 的共享库路径、Snapshot.readable 的 readObserver 顺序、Intent.setPackage/resolveActivity 与服务端显式组件查询分支，结论与修订一致。绑定清理初次复核仍遗漏 SecurityException 的明确契约，已要求三页补全，并核对 ContextImpl 登记前参数检查与登记后 Intent 检查的不同顺序。位置主章 API18/编译 API31 前提已与旧专题对齐。基础组另按五项检查独立审阅启动时序，结果 PASS，见合并记录中的源码行号。

## 本轮验证与未核实项

- 正文冻结后的 `npm.cmd test`：11/11 通过，0 失败；覆盖来源段落映射、五章目录/锚点、旧站保留及搜索。此结果不代替正文事实核验。
- 停止经命令行确认属于本仓库的旧预览后，执行 `npm.cmd run docs:build`：通过，生成 50 个知识库 HTML，54 个旧站文件 SHA-256 全部一致。构建有大于 500 kB 的分块提示，无构建错误；未因本次内容审阅调整打包配置。随后重新启动 4173 端口预览。
- 构建目录额外解析 57 个非 legacy 子目录 HTML（含 7 个旧站保留页面），检查 6,717 条本地链接，其中 4,497 条带锚点：路径与锚点错误均为 0。Android 安全组另对索引/覆盖表 150 条链接逐字比较目标标题，全部通过，避免把“目标存在”当成“指向正确小节”。
- 针对本次 50 个知识库 HTML 中引用的本地图片、脚本和样式等资源，向重新启动的预览服务实际请求 60 个不同 URL，全部 HTTP 200。第一次扩大到旧站页面的资源检查遇到历史 favicon 404 和非 ASCII URL 未编码问题；随后按授权范围限定知识库页面并规范 URL 编码。未修改旧站生成文件，也未将旧站结果冒充本轮知识库故障。
- gstack browse 预期二进制路径不可用，已按浏览器技能使用 in-app Browser 完成真实页面验证。`domSnapshot()` 因后端方法缺失不可用，改用可用的可见 DOM、只读 DOM 查询、真实点击和截图。系统服务与 Compose State 各 3 张 Mermaid 图均渲染为 SVG，更新后的完整启动图实际显示 49 条消息，包含本轮修订的绘制同步协作；无加载失败图片。
- 启动图查看器实际执行打开、放大至 130%、复位至 100%、关闭；取得并查看窄屏启动图截图。Compose 读取图实际渲染并打开查看器。桌面截图与部分后续截图调用超时，未把 DOM 检查声称为完整桌面视觉验收；读取图的顺序还由固定源码及 Mermaid 源码独立核对。
- 手机实际点击本文目录，五章条目均存在；从“配置安全”目录进入索引对应位置，再点击“应用程序只申请必要的权限”，跳到 `configuration-security.html#s102` 且标题匹配。分类目录打开后点击“系统核心服务”，正确导航且侧栏关闭。
- 受浏览器缩放影响，请求宽度与 DOM CSS 宽度不同。实际查询到桌面宽度 1405、窄屏 416 和 338、平板宽度 836，各次 `scrollWidth == clientWidth`；没有整页横向溢出。页面 `dev.logs` 查询无 error/warn；浏览器工具自身出现遥测网络错误，未当成站点控制台错误。此处不是 Android 真机测试，也未验证全部外部站点的资源可用性。
- `git diff --check` 通过，仅有仓库 LF/CRLF 转换提示。主审阅记录包含全部 49 个实际 Markdown 页面路径及逐篇/小节结论；三份原分组记录保留供追溯。现有未提交和未跟踪文件保留，没有 commit、push、tag、删除源码或发布。

未核实项：Android Java/Kotlin/AIDL/XML 示例没有在 Android 工程编译或真机执行；未采集启动 trace、首帧耗时或设备开关实际值。未执行跨应用授权、安装冲突、OOM/Binder 压力、OEM 迁移/TEE、真实定位或真实 App 抓包实验。正文已保留相应条件与限制；普通 JavaScript 示例与固定 Compose 源码缓存核验的实际结果见上文分组记录。Frida Hook、strace 未新增为专题。
