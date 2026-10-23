# Android 基础提纲整理记录

来源：[钉钉《知识点》](https://alidocs.dingtalk.com/i/nodes/1OQX0akWmxaRZD7yfgRMaeOX8GlDd3mE)，读取日期 2026-10-22。首次只读取顶部虚拟加载片段，错误地当作完整正文；现已纠正。通过滚动至末尾累计读取 85 个原始段落和 2 张图片，保留 ID、层级、正文及图片来源到 `android-basics-source-outline.json`。页脚字数不用于完整性判断。

## 原始结构与覆盖

1. Binder通信机制 → `docs/android/basics/binder-basics.md`
   - Java层：IBinder接口、Binder类、BinderProxy类、IInterface接口。
   - Native层：IBinder.h接口、BpBinder、BBinder。
2. Handler原理 → `docs/android/basics/handler.md`。原文只有标题，正文为补充内容。
3. Messenger机制 → `docs/android/basics/messenger.md`
   - 轻量级跨进程通信，内部用 Handler 收发。
   - 两种构造方法：`Messenger(Handler)` 调用 `getIMessenger()`；`Messenger(IBinder)` 调用 `IMessenger.Stub.asInterface()`。
   - Handler 内部缓存 MessengerImpl，在 send 中记录 calling UID，再向 Handler 发消息。
   - 四步：服务端创建 Handler/Messenger、绑定时返回通信对象、客户端绑定并构造 Messenger、调用 send。

4. 四大组件 → Activity 启动、Broadcast 发送接收、Service 启动/绑定/销毁、Provider 四篇；保留 Activity 六类型、广播 finish 链和 ContentObserver 注册。
5. 核心服务 → `system-services.md`，按 AMS/ATMS、PMS、WMS、ContentService、PackageInstallerService 排序；保留 PMS 五方法、安装器三类型和会话步骤。
6. PendingIntent → `pending-intent.md`，保留 IntentSender，补充身份、匹配、可变性和取消。
7. LoadedAPK → `loaded-apk.md`，规范类名 LoadedApk，保留 getPackageInfo、Application 创建、appDir / libDir 和共享加载器。
8. 类加载机制 → `class-loading.md`。
9. 动态代理 → `dynamic-proxy.md`。

按用户明确要求，原条目 283 Frida Hook、286 strace 与其参考 289 本次排除，不创建文章或导航。原始数据仅保留来源记录。空段落、参考链接和“重要类 / 重点步骤”上下文标签单独标记，不伪装成知识点。逐段去向见 `android-basics-coverage.json`，回归测试核对全部来源 ID 及有效目标。

公开笔记保持原顺序及层级含义，统一 API 拼写，以固定版本核对，不把原笔记直接当作结论。AMS/ATMS 额外提供从 Launcher 点击到首帧的完整时序，区分 Binder / Socket / 内部调用、主线程派发与冷暖复用，并说明 Android 16 attach 调度分支。

## 勘误与补充边界

- 生成的 AIDL Proxy 持有 `mRemote: IBinder`，远端常见实现是 BinderProxy；三者不是继承或同一对象关系。
- Java Stub 继承 Binder；JNI JavaBBinder 才继承 Native BBinder。`onTrsact` 更正为 `onTransact`。
- BinderProxy 也用于应用远端 Binder，不限于系统服务。
- `onBind()` 返回 `IBinder`，具体为 `Messenger.getBinder()`，不直接返回 Messenger。
- Handler 不创建线程；IMessenger 与 Handler.getIMessenger 仅用于源码解释，不是公开应用 API。
- Messenger 发送、Binder 接收、Handler 排队、业务完成是不同边界；补充 replyTo、请求编号、超时、身份及生命周期。
- AOSP 固定 `android-16.0.0_r1`。该标签 MessageQueue 实现已分目录，不能假定旧版单链表实现适用于所有系统。
- 两张原图位于 `docs/public/assets/android/basics/source/`，分别对应广播完成链和 PMS 查询；文章提供点击放大及本地下载，不依赖钉钉图片外链。
- Provider 声明与 ContentObserver 注册拆开；广播单接收器完成不等于全链结束；PackageInstaller.openSession 返回公开 Session，补齐写入、提交和异步结果。
- Application 创建与 onCreate 分开；普通初始 Provider 可先于 Application.onCreate。动态代理与 BinderProxy / AIDL Proxy 分开；示例未在 Android 工程编译或设备执行。

## 核验入口

公开文章在相关段落链接 Android Developers 的 IBinder、IInterface、Handler、Looper、Message、Messenger、HandlerThread、绑定服务与 AIDL 文档；实现链接固定 AOSP 标签的 Handler、Messenger、IMessenger、JNI Binder 和 Native libbinder。

补齐部分沿 Launcher3、Instrumentation、ATMS、ActivityStarter、ActivityTaskSupervisor、AMS、ProcessList、ZygoteProcess、ActivityThread、LoadedApk、广播队列、ActiveServices、ContentProviderHelper、PMS、WMS、ContentService 和安装会话源码核对；类加载使用 libcore 固定标签。公开行为另查组件生命周期、广播版本差异、PendingIntent / IntentSender、PackageInstaller.Session、ClassLoader 和 Proxy 文档。具体入口链接随文章段落保存，验证结果见 `VALIDATION.md` 对应补齐章节。
