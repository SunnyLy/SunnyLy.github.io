# Android 基础与 Framework 专业复核记录

复核日期：2026-10-22。范围为基础目录除 `system-services.md` 外的 12 页及 Framework 5 页，共 17 页；另对主任务修订后的 AMS/ATMS 启动章节做独立互审。所有正文已按章节连续阅读，索引、图、代码块、失败路径与来源段均纳入，不以关键词扫描代替正文阅读。用户已授权发现错误直接修改；保留现有未提交内容，不提交、推送、打标签、删除源码或发布。使用 `android-framework-dev` 技能。

平台实现固定 `android-16.0.0_r1`；Binder 驱动独立使用原文声明的 `android16-6.12-2025-06_r1`。通过浏览工具访问 Android Developers、AOSP 官方说明和官方 GitHub 镜像，通过 Gitiles `?format=TEXT` 实际获取固定标签源码并定位函数。Gitiles HTML 在浏览工具存在 URL 编码错误，已使用原站文本接口核验，未替换为其他版本。本文不声称编译过 Android 示例或执行过设备命令。

## 实质修订

1. `docs/android/basics/pending-intent.md:43`，“哪些参数决定复用同一份记录”：原文列操作类型、创建者、requestCode、Intent，但遗漏记录 flags 的身份作用。补充 `FLAG_ONE_SHOT`、`FLAG_IMMUTABLE` 必须在查询/修改时一致，给出一次性查询的组合，并区分获取操作控制标志。证据：[PendingIntent 官方匹配契约](https://developer.android.com/reference/android/app/PendingIntent)、[PendingIntentRecord.Key.equals](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/am/PendingIntentRecord.java)、[PendingIntentController.getIntentSender](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/am/PendingIntentController.java)。源码在构建 Key 前清除 NO_CREATE/CANCEL_CURRENT/UPDATE_CURRENT，Key 仍比较其他 flags。
2. `docs/android/basics/messenger.md:149`，“客户端绑定并构造 Messenger”：原句“记录绑定是否成功”容易把清理责任等同于返回 true。改为分别跟踪绑定尝试与清理责任，正常返回 false 也按契约释放；异常则确认是否登记连接，避免盲目解绑。证据：[Context.bindService](https://developer.android.com/reference/android/content/Context#bindService(android.content.Intent,%20android.content.ServiceConnection,%20int))、[固定 Context.java 的 bindService 返回契约](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/Context.java)、[ContextImpl.bindServiceCommon](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/ContextImpl.java)。与既有 Framework 绑定服务篇保持一致。
3. `docs/android/basics/service-lifecycle.md:55`，“BIND_AUTO_CREATE 的含义”：同一清理边界在基础 Service 篇原先缺失，补充 false 的释放责任及“尝试/已连接/已清理”三个状态，来源同第 2 项。
4. `docs/android/basics/class-loading.md:51`，“DelegateLastClassLoader 的边界”：原文“引导类 → 自身路径 → 父”未限定公开构造场景，容易与前节共享库规则冲突。补充先查已加载类、自身阶段调用继承的 findClass，平台配置共享库时仍含前置/后置共享库。证据：[DelegateLastClassLoader API](https://developer.android.com/reference/dalvik/system/DelegateLastClassLoader)、[DelegateLastClassLoader.loadClass](https://android.googlesource.com/platform/libcore/+/refs/tags/android-16.0.0_r1/dalvik/src/main/java/dalvik/system/DelegateLastClassLoader.java)、[BaseDexClassLoader.findClass](https://android.googlesource.com/platform/libcore/+/refs/tags/android-16.0.0_r1/dalvik/src/main/java/dalvik/system/BaseDexClassLoader.java)。
5. 交叉复核新增修订：主任务发现第 2、3 项及 `framework/service-manager-aidl.md:211` 对异常的说明仍过于笼统。固定 `Context.java:3979–3987` 明确要求抛出 `SecurityException` 也调用 unbindService，三页现均写明此契约（Messenger:149、Service:55、Framework:211）。另在 Messenger:151、Service:57、Framework:213 区分 `ContextImpl.java:2206–2210` 的登记前 null connection/Handler+Executor 参数异常，以及 `2214–2221` 的先取 ServiceDispatcher、后校验 Intent 顺序；不能把全部 IllegalArgumentException 都当成未登记。证据：[Context.java#L3979](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/content/Context.java#L3979)、[ContextImpl.java#L2201](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/app/ContextImpl.java#L2201)。

以上修订未改标题、锚点、导航、图片或 Mermaid。Framework 初轮认为无需修改；交叉复核发现绑定异常清理契约遗漏后，已按第 5 项修订 ServiceManager/AIDL 篇，其余四篇保留。

## 逐篇完整覆盖

### basics/index.md：通过，无内容修改

覆盖“通信基础、四大组件、核心服务、PendingIntent/LoadedApk/运行时、来源原图与覆盖”全部小节。核对 12 篇关联页、system-services 入口、既有显式锚点、原提纲分组与未编译声明；覆盖与导航顺序由现有测试核对。原始钉钉内容的重新采集不在本分工，来源完整性沿用已保存的覆盖清单，不声称本轮重新采集原文。

### basics/activity-startup.md：通过，无内容修改

覆盖 ActivityThread、Instrumentation、ActivityStarter、Task、ActivityTaskSupervisor、ClientTransaction、总览图、冷温热、生命周期与窗口、分阶段排查。确认 ActivityThread 非 Thread、进程/任务/实例不一一对应、startSpecificActivity 进程检查与失败回退、请求返回非首帧。来源：[ActivityTaskSupervisor.startSpecificActivity / realStartActivityLocked](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/wm/ActivityTaskSupervisor.java)、[官方任务返回栈](https://developer.android.com/guide/components/activities/tasks-and-back-stack)、[启动耗时](https://developer.android.com/topic/performance/issues/launch-time)。总览图限定为阶段关系，未将其当作固定调用栈。

### basics/binder-basics.md：通过，无内容修改

覆盖 Java 的 IBinder/Binder/BinderProxy/IInterface，Native 的 IBinder/BpBinder/BBinder，一次调用返回及学习检查点。确认业务 Stub.Proxy 与 BinderProxy 为组合而非继承、JavaBBinder 继承 BBinder、asInterface 本地直接调用与远端线程差异。来源：[AIDL 官方线程契约](https://developer.android.com/develop/background-work/services/aidl)、[android_util_Binder.cpp 的 JavaBBinder 与对象转换](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/jni/android_util_Binder.cpp)。

### basics/broadcast.md：通过，无内容修改

覆盖动态/Manifest 注册、发送队列、接收图、PendingResult.finish/历史截图、有序广播、goAsync 示例与排查。确认 r1 为 BroadcastQueueImpl、assumeDelivered 例外、动态 ReceiverDispatcher 与静态 handleReceiver 的区别，以及 finish 只完成当前接收步骤。来源：[BroadcastQueueImpl.finishReceiverLocked 与调度](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/am/BroadcastQueueImpl.java)、[BroadcastReceiver.PendingResult.finish / sendFinished](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/content/BroadcastReceiver.java)、[Android 16 广播优先级规则](https://developer.android.com/develop/background-work/background-tasks/broadcasts#changes-system-broadcasts)。异步示例含拒绝执行时 finish 和未编译声明；未声称无限时限。

### basics/class-loading.md：修订后通过

覆盖类身份、默认委派及图、Path/DexClassLoader、BaseDex/DexPathList、DelegateLast、动态加载及异常。修订见第 4 项。核对 optimizedDirectory 自 API 26 弃用且无效、DelegateLast API 27、定义加载器与发起加载器差异；Android 14 DCL 的只读条件属于 target SDK 34+ 行为，原文“面向”保留此条件。来源：[DexClassLoader](https://developer.android.com/reference/dalvik/system/DexClassLoader)、[Android 14 DCL](https://developer.android.com/about/versions/14/behavior-changes-14#safer-dynamic-code-loading)及第 4 项固定 libcore。

### basics/content-provider.md：通过，无内容修改

覆盖 Manifest 声明/Observer 注册、创建发布、查询图、Cursor/文件、线程、ContentService 通知图、注册注销片段与权限引用。确认 Observer 注册不注册 Provider，远端数据操作不由 AMS 逐行转发，onCreate 与 Application.onCreate 顺序已限定普通绑定路径。来源：[ContentProviderHelper.getContentProviderImpl / publishContentProviders](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/am/ContentProviderHelper.java)、[ActivityThread.installProvider / handleBindApplication](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/ActivityThread.java)、[ContentObserver API](https://developer.android.com/reference/android/database/ContentObserver)。观察者示例明确要求防重复、生命周期和 API 16，未编译。

### basics/dynamic-proxy.md：通过，无内容修改

覆盖 Proxy/InvocationHandler、调用图、Notes 示例、Object 身份语义、反射异常解包、返回值/throws、加载器与 Binder Proxy 区别。确认 equals/hashCode/toString 转交处理器、InvocationTargetException 解包与 UndeclaredThrowableException 边界。来源：[Proxy](https://developer.android.com/reference/java/lang/reflect/Proxy)、[InvocationHandler.invoke](https://developer.android.com/reference/java/lang/reflect/InvocationHandler)。嵌套类型示例已有外部类假设及未编译说明，未引入 Hook。

### basics/handler.md：通过，无内容修改

覆盖四对象、线程/Looper、分发图、send/post、dispatch 优先级、延迟/顺序/等待、队列版本、SerialNoteWorker 与性能生命周期。确认 Runnable 优先于 Handler.Callback、MessengerImpl 在 Binder 入口捕获 UID、延迟使用 uptime、异步消息仅越过屏障、quitSafely 不等待未来消息。来源：[Handler.dispatchMessage / MessengerImpl](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/Handler.java)、[Looper.quitSafely](https://developer.android.com/reference/android/os/Looper#quitSafely())、[CombinedMessageQueue](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/CombinedMessageQueue/MessageQueue.java)。专用线程示例已限定主线程拥有者、API 18、取消不终止运行中任务，未编译。

### basics/loaded-apk.md：通过，无内容修改

覆盖实例/弱缓存、Application 创建与 onCreate、初始化时序图、appDir/libDir、共享类加载器和分发职责。确认普通 bind 路径 makeApplicationInner(..., null) 后安装 Provider，再 callApplicationOnCreate；Application 对象与 attachBaseContext 已在 Provider 之前。来源：[LoadedApk.makeApplicationInner / createOrUpdateClassLoaderLocked](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/LoadedApk.java)、[ActivityThread.handleBindApplication / getPackageInfo](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/ActivityThread.java)。未将 weak cache、Resources 和 ClassLoader 混为永久单例。

### basics/messenger.md：修订后通过

覆盖轻量 IPC 图、两构造方式、通信四步、服务/Manifest/请求示例、Message 协议、sendingUid、顺序/失败/边界。修订见第 2 项。确认 IMessenger 为 oneway，Handler.getIMessenger 缓存实现，MessengerImpl.send 捕获 UID 再入队；同 UID 独立进程示例不等同跨应用授权。来源：[Handler.MessengerImpl](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/Handler.java)、[IMessenger.aidl](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/IMessenger.aidl)、[Message.sendingUid](https://developer.android.com/reference/android/os/Message#sendingUid)。示例已限定 API 21、短字符串、超时与失败边界，未编译。

### basics/pending-intent.md：修订后通过

覆盖 IntentSender、系统记录时序、复用 flags、可变性、安装回调例外及取消/完成。修订见第 1 项。确认 extras 不参与 filterEquals、IMMUTABLE 不阻止创建者 UPDATE_CURRENT、target 31 可变性声明、target 35 安装 commit 拒绝不可变接收器。来源除第 1 项外：[PackageInstaller.Session.commit](https://developer.android.com/reference/android/content/pm/PackageInstaller.Session#commit(android.content.IntentSender))。未触发安装/通知/闹钟。

### basics/service-lifecycle.md：修订后通过

覆盖系统/客户端记录、start、bind 图、AUTO_CREATE、Binder 缓存/线程、销毁图、started/bound、startId、onDestroy、FGS 与排查。修订见第 3 项。确认 handleCreateService 用 AppComponentFactory 构造并 attach，生命周期主线程不等于远端业务线程；onBind 缓存与 onRebind 不等于每客户端新建 Binder。来源：[ActivityThread.handleCreateService / handleBindService / handleServiceArgs](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/ActivityThread.java)、[Service API](https://developer.android.com/reference/android/app/Service)、[绑定服务](https://developer.android.com/develop/background-work/services/bound-services)。未误将 sticky/FGS 当作永久存活保证。

### framework/activity-token.md：通过，无内容修改

覆盖第 1–11 节、三图、三张身份/场景表与只读命令。核对 ActivityRecord.Token 继承 Binder 并弱引记录；传回拥有进程恢复本地 Binder；mActivities 先登记后 attach/onCreate；View.getWindowToken 为 IWindow；子窗口 LayoutParams.token 与普通应用 Activity token 分流；配置重建身份可保留。来源：[ActivityRecord.Token / forToken](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/wm/ActivityRecord.java)、[View.getWindowToken / getApplicationWindowToken](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/view/View.java)、[Window.adjustLayoutParamsForSubWindow](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/view/Window.java)、[ActivityThread.performLaunchActivity](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/ActivityThread.java)。BadToken 排查及权限限定未被扩大为通用授权。

### framework/binder-mechanism.md：通过，无内容修改

覆盖第 1–12 节及三个图：接口/代理、本地优化、目录/handle、请求回复、Parcel/拷贝、线程/重入/oneway、身份、死亡、缓冲、历史分域、设备步骤和源码路线。实际核对 IPCThreadState 的 BC_REPLY/BR_REPLY/远端事务分派、ProcessState 的 handle 0 和 BINDER_VM_SIZE、NDK 3+1+1 示例、驱动 async_todo 与引用转换。来源：[IPCThreadState.cpp](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/IPCThreadState.cpp)、[ProcessState.cpp](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/ProcessState.cpp)、[binder_process.h](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/ndk/include_platform/android/binder_process.h)、[固定 binder.c](https://android.googlesource.com/kernel/common/+/refs/tags/android16-6.12-2025-06_r1/drivers/android/binder.c)、[官方线程模型](https://source.android.com/docs/core/architecture/ipc/binder-threading)。单向 payload 拷贝、每节点异步串行、非全局 handle、失败不证明未执行等限定准确。

### framework/client-transaction.md：通过，无内容修改

覆盖第 1–13 节、继承图/时序图/路径图和生命周期回报表。核对 Launch 直接继承 ClientTransactionItem；服务端 Launch+Resume/Pause/Stop；pending 以进程 Binder 为 key；preExecute 在入队前；执行器按 item 顺序解释；缺记录分支、异常后无回滚；Pause 同步而 Resume/Stop/Destroy oneway。来源：[LaunchActivityItem](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/servertransaction/LaunchActivityItem.java)、[ClientLifecycleManager](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/wm/ClientLifecycleManager.java)、[TransactionExecutor](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/servertransaction/TransactionExecutor.java)、[IActivityClientController](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/app/IActivityClientController.aidl)。旧 callbacks/final-state 成员未被当作当前解释路径。

### framework/service-manager-aidl.md：交叉复核修订后通过

覆盖第 1–12 节、目录/绑定图、缓存图、跨进程绑定图、AIDL/Service 示例、返回值/断连和权限。实际核对 ServiceManagerProxy.getService2 转 checkService2、Java sCache 不自动填充、native backend 独立缓存、servicemanager add/find/isolated 检查；业务 Binder 与 ServiceRecord Token 分离。来源：[ServiceManagerNative.java](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/ServiceManagerNative.java)、[ServiceManager.java](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/ServiceManager.java)、[BackendUnifiedServiceManager.cpp](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/BackendUnifiedServiceManager.cpp)、[目录 ServiceManager.cpp](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/cmds/servicemanager/ServiceManager.cpp)。false 的解绑责任本篇原已正确，SecurityException 与参数登记顺序的遗漏按第 5 项补正。

### framework/surfaceflinger-vsync.md：通过，无内容修改

覆盖第 1–12 节、三个总览/回调/分发图、硬件表、fence 表及排查/时间线表。实际核对 DRM_VBLANK_RELATIVE+sequence=1、EINTR/SyntheticWaitVBlank；AIDL onVsync CLOCK_MONOTONIC；HAL 服务端 ComposerClient/BnComposerClient；SF→Scheduler→VsyncSchedule 采样与硬件开关；MessageQueue.dispatchFrame；BLAST acquireNextBufferLocked/setBuffer；CommandResultPayload 的物理视频/命令模式及虚拟 present 定义。来源：[VSyncWorker](https://android.googlesource.com/platform/external/drm_hwcomposer/+/refs/tags/android-16.0.0_r1/drm/VSyncWorker.cpp)、[ComposerClient.h](https://android.googlesource.com/platform/external/drm_hwcomposer/+/refs/tags/android-16.0.0_r1/hwc3/ComposerClient.h)、[Scheduler](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/Scheduler/Scheduler.cpp)、[MessageQueue](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/Scheduler/MessageQueue.cpp)、[BLASTBufferQueue](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/gui/BLASTBufferQueue.cpp)、[IComposerCallback](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/IComposerCallback.aidl)、[CommandResultPayload](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/CommandResultPayload.aidl)。未将 doFrame/提交/信号/物理扫描混同；未把 executeCommands 包装名写成不存在的独立 AIDL 方法。

## AMS/ATMS 独立互审

结果：PASS，仅读主任务修订结果，未编辑 `system-services.md`。

- 第 134 行两开关：r1 `AMS.attachApplicationLocked` 依据 expedite flag 早 attach ATMS，依据 wait flag 决定是否直接 finishInner；`finishAttachApplicationInner` 只在非 expedite 时 attach ATMS，公开 finish 在 wait 关闭时忽略。图选非 expedite + wait 开启，准确。
- 第 90–100、143 行 bind 消息与复用：已有 ApplicationThread 不代表初始化完成；同一应用入口的 oneway 调度和主消息队列保留初始化在先；暂停交接可暂缓 realStart，准确。
- 第 121–129、151 行绘制：`ViewRootImpl.createSyncIfNeeded` 允许非本地 WindowSession 从回调线程直接 reportDrawFinished；本地 Binder 才拷贝事务并 postAtFrontOfQueue。`WindowState.finishDrawing` 可合并事务到 mSyncTransaction。par 图附带“非独立”和事务合并说明，没有把两支宣称为无依赖提交。
- 第 153 行：TTID/Displayed/windows-drawn 非面板扫描完成；TTFD 需应用正确报告 reportFullyDrawn，准确。
- 第 136 行来源：Launcher3.startActivitySafely 加 NEW_TASK；普通同用户 startActivity、深层 shortcut/跨用户 LauncherApps 分支均核实；Intent 元数据不替代 Binder 调用身份。

独立互审来源：[AMS](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/am/ActivityManagerService.java)、[ViewRootImpl.createSyncIfNeeded / reportDrawFinished](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/view/ViewRootImpl.java)、[WindowState.finishDrawing](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/services/core/java/com/android/server/wm/WindowState.java)、[Launcher3.ActivityContext.startActivitySafely](https://android.googlesource.com/platform/packages/apps/Launcher3/+/refs/tags/android-16.0.0_r1/src/com/android/launcher3/views/ActivityContext.java)、[TTID/TTFD 官方定义](https://developer.android.com/topic/performance/issues/launch-time)。

## 修订后的第二轮逐项核验

- PASS：`pending-intent.md:43` 对照固定 `PendingIntentController.getIntentSender` 的 flags 掩码及 `PendingIntentRecord.Key.equals` 的 flags 比较；查询一次性且不可变记录的说明保留两种身份标志，没有把控制标志写成身份。
- 初次自检漏项，交叉复核后 PASS：`messenger.md:149`、`service-lifecycle.md:55`、`framework/service-manager-aidl.md:211` 现均明确正常 false 和 SecurityException 都释放；各页后续段落根据 ContextImpl:2206–2221 区分登记前参数错误与登记后 Intent 检查，未将所有异常统一归为“已登记”或“未登记”。
- PASS：`class-loading.md:51` 对照 DelegateLast 的 findLoadedClass、boot 查找、findClass、parent 路径，以及 BaseDex 的共享库前后顺序；只将普通公开构造概括为 DEX，平台配置场景明确另述。
- PASS：全部修订均未改变代码示例、章节标题、锚点、图或导航；定向扫描没有新增行尾空白。主任务已对 PendingIntentController:155/Key:231、DelegateLast:181/199/BaseDex:232 交叉核验 PASS；异常清理新增修订已回交核验。

## 定向验证与限制

- `node --test tests/android-basics-outline.test.mjs`：2/2 通过，覆盖原段落映射与导航顺序；此结果不证明机制正确。
- `git diff --check`：退出 0，仅现有仓库 LF/CRLF 提示，无空白错误。
- 本分工未改 Mermaid 或锚点；最终 `npm.cmd test`、构建和桌面/手机浏览验证由主任务统一执行，不能把历史基线当成本轮结果。
- 所有 Android Java/Kotlin/AIDL 示例均为源码/契约层面审阅，未编译或真机执行；已有页面的“未编译/未实测”声明保留。未虚构设备系统、线程日志、耗时或 trace 结果。
- 厂商 HAL、内核 IRQ、实际队列实现选择、开关值及 App 生命周期竞态没有设备证据，保留原文条件限定。历史截图不提供 Android 版本证明。
