---
description: 以固定 AOSP 与内核源码为依据，串联 Binder 服务发现、Java 到驱动的事务路径、Parcel、线程模型、调用身份与故障排查。
---

# Binder 机制：从 AIDL 到内核事务

Binder 将接口调用转换为跨进程事务，同时管理远端对象引用、线程调度与调用者身份。理解它，需要把接口生成代码、用户态运行库与内核驱动连接起来，沿着一次请求与回复逐层阅读。

平台实现对应 `android-16.0.0_r1`，内核参考独立标签 `android16-6.12-2025-06_r1`；两者不自动构成某台设备的组合。以下讨论 kernel Binder，socket Binder RPC 的传输路径另计。

## 1. 先分清接口、代理与实体

**AIDL 定义跨进程接口的协议，Binder 执行事务，Parcel 承载数据。** AIDL 编译器生成的代码负责参数编码、事务码分派与返回值解码；驱动不理解业务方法的 Java 名称，而是根据目标引用、事务码和数据执行传递。

Java 调用栈里有三种不同的“代理”，不能混为一谈：

- **生成的 `Stub.Proxy`**：对应具体 AIDL 接口，知道业务方法如何读写 Parcel。
- **`android.os.BinderProxy`**：Java 层的远端 `IBinder`，把通用 `transact` 操作交给 JNI。
- **原生 `BpBinder`**：在 kernel Binder 路径中持有远端 handle，并通过 `IPCThreadState` 与驱动交互。

服务端则由 Java `Binder`、JNI 的 `JavaBBinder` 与生成的 `Stub.onTransact()` 衔接到业务实现。纯 C++ 服务通常使用对应的 `Bp/Bn` 接口类型，不能套用整条 Java/JNI 调用栈。

```mermaid
flowchart TB
  subgraph A[客户端进程]
    A1[业务调用] --> A2[AIDL Stub.Proxy]
    A2 --> A3[BinderProxy 与 JNI]
    A3 --> A4[BpBinder 与 IPCThreadState]
  end
  subgraph K[内核 Binder 驱动]
    K1[按发送进程的 handle 查引用] --> K2[定位目标节点与接收进程]
  end
  subgraph B[服务端进程]
    B1[接收事务的线程] --> B2[BBinder 与 JavaBBinder]
    B2 --> B3[Binder.execTransact 与 Stub.onTransact]
    B3 --> B4[业务实现]
  end
  A4 -->|事务命令与 Parcel| K1
  K2 -->|BR_TRANSACTION| B1
  B1 -.同步回复经驱动返回.-> A4
```

源码入口：[AIDL Java 生成器](https://android.googlesource.com/platform/system/tools/aidl/+/refs/tags/android-16.0.0_r1/generate_java_binder.cpp)、[`BinderProxy.java`](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/BinderProxy.java)、[`BpBinder.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/BpBinder.cpp)。

## 2. 同一份 AIDL，本地与远端执行不同

生成的 `Stub.asInterface()` 会先调用 `queryLocalInterface()`。如果匹配到本进程的接口实现，就直接返回该实现；否则才构造生成的代理。常见本地路径既不经过驱动，也不需要把参数编码成跨进程 Parcel。

即使显式调用本地 `Binder.transact()`，该基线的实现也是直接进入 `onTransact()`，并非自动经过一次驱动往返。

| 比较维度 | 同进程直接接口调用 | 远端同步调用 | 远端 `oneway` 调用 |
| --- | --- | --- | --- |
| 典型执行入口 | 本地实现方法 | 代理编码，服务端分派 | 代理编码，服务端分派 |
| 是否进入驱动 | 通常不进入 | 进入 | 进入 |
| 业务在哪条线程执行 | 当前调用线程 | 服务端接收事务的线程 | 服务端接收事务的线程 |
| 调用方何时继续 | 本地方法返回后 | 收到同步结果或失败后 | 提交阶段完成或失败后，不等业务执行结束 |
| 返回值与业务异常 | 普通语言调用语义 | 经回复 Parcel 或传输错误返回 | 没有普通业务回复，提交仍可能失败 |

因此，AIDL 中的 `oneway` 不会把本地直接调用自动变成后台任务；将服务从同进程改成独立进程，也可能改变时序、异常与线程语义。应用服务的生命周期回调与 Binder 接口方法同样应分别分析，不能因为 `onBind()` 通常在主线程，就认为远端接口方法也在主线程。

依据：[`Binder.java` 的 `queryLocalInterface()` 与 `transact()`](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/Binder.java)、[Android 进程与线程说明](https://developer.android.com/guide/components/processes-and-threads)。

## 3. ServiceManager 如何让双方找到彼此

### 服务发现与业务调用是两个阶段

在这一基线中，原生 ServiceManager 建立 context object，并通过 `becomeContextManager()` 向驱动注册为当前 Binder context 的管理者。`ProcessState::getContextObject()` 获取 handle 0 对应的入口。**handle 0 是当前 context manager 的特殊入口，不是每个系统服务统一使用的 handle。**

一次典型注册与查找可分为四步：

1. 服务进程创建实现对象，将名称和 Binder 对象交给 ServiceManager。准入检查通过后，ServiceManager 保存名称到服务引用的映射。
2. Binder 对象跨进程传给 ServiceManager 时，驱动进行对象引用转换；它保存的是可操作的服务引用，不是能直接解引用的其他进程 Java 对象地址。
3. 客户端按名称查找服务，ServiceManager 执行查找及可见性检查，将服务引用返回；驱动将其转换成客户端可使用的引用。
4. 客户端持有目标引用后，业务事务直接发往服务进程。**ServiceManager 不负责中转每一次业务请求。**

Android 16 的 Java ServiceManager 仍有兼容包装层，不应把旧教程中的手工事务码实现直接套到这个版本。普通应用也不应把隐藏的 ServiceManager 接口当作公开 SDK；平台服务通常通过相应的 Framework manager 使用，应用间服务则按绑定服务的接口契约接入。

源码入口：[`servicemanager/main.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/cmds/servicemanager/main.cpp)、[`ServiceManager.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/cmds/servicemanager/ServiceManager.cpp)、[`ServiceManagerNative.java`](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/ServiceManagerNative.java)。

### handle 为什么不是全局对象 ID

| 对象 | 所在层次 | 表达什么 | 阅读时注意 |
| --- | --- | --- | --- |
| `binder_proc` | 内核 | 一个 Binder 进程上下文 | 包含该进程的引用、线程等状态 |
| `binder_node` | 内核 | 由某进程拥有的 Binder 实体节点 | 关联拥有者及本地对象标识 |
| `binder_ref` | 内核 | 某进程对节点的引用 | 描述符属于引用进程的命名空间 |
| handle | 用户态协议与内核引用表 | 当前进程用于寻址远端节点的引用描述符 | 不同进程的同一数值不保证指向同一节点 |
| `binder_thread` | 内核 | 参与事务的线程状态 | 包含待办与同步事务栈等信息 |
| `binder_transaction` | 内核 | 一次正在传递或处理的事务 | 不等同于永久对象或业务成功记录 |

客户端把某个 Binder 引用继续传给第三个进程时，第三个进程得到自己的引用描述符；如果对象回到其所属进程，驱动可以将它还原为本地对象形式。不能把某进程的 handle 直接当成另一进程可复用的地址。

依据：固定内核的 [`binder_internal.h`](https://android.googlesource.com/kernel/common/+/refs/tags/android16-6.12-2025-06_r1/drivers/android/binder_internal.h) 与 [`binder.c` 的对象翻译和目标查找](https://android.googlesource.com/kernel/common/+/refs/tags/android16-6.12-2025-06_r1/drivers/android/binder.c)。

## 4. 一次 Java 远端同步调用如何完成

### 从应用到驱动的请求路径

下面按请求经过的入口排列；它跨越两端的进程和线程，不能当作单条线程栈。

```text
客户端：
生成的 Stub.Proxy.业务方法
  → BinderProxy.transact / transactNative
  → JNI android_os_BinderProxy_transact
  → BpBinder::transact
  → IPCThreadState::transact
  → writeTransactionData(BC_TRANSACTION, ...)
  → talkWithDriver → ioctl(BINDER_WRITE_READ)

内核：
binder_ioctl → binder_ioctl_write_read
  → binder_thread_write → binder_transaction
  → 定位引用/节点，分配目标缓冲区，转换对象，投递事务
  → binder_thread_read 返回 BR_TRANSACTION

服务端：
IPCThreadState::executeCommand
  → BBinder::transact
  → JavaBBinder::onTransact
  → Binder.execTransact / execTransactInternal
  → 生成的 Stub.onTransact
  → 业务实现方法
```

客户端代理把接口标识与参数写入 Parcel，并将事务码作为 `transact()` 的独立参数传递。`writeTransactionData()` 组织 `binder_transaction_data` 等协议数据，其中包括目标 handle、code、flags、数据区及对象偏移表信息；`BINDER_WRITE_READ` 负责交换一批命令和返回事件，并不意味着一次业务调用只发生一次 ioctl。

驱动根据发送进程的引用表找到目标节点，将工作交给目标线程或进程队列。服务端用户态读取 `BR_TRANSACTION` 后建立 Parcel 视图，再由本地 Binder 对象逐层分派。生成的 `Stub.onTransact()` 负责检查协议、解码参数和调用实现，驱动本身不执行 Java 业务方法。

源码入口：[`android_util_Binder.cpp`](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/jni/android_util_Binder.cpp)、[`IPCThreadState.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/IPCThreadState.cpp)、[`Binder.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/Binder.cpp)。

### 回复并不是函数返回时自动跨过进程边界

```mermaid
sequenceDiagram
  participant C as 客户端调用线程
  participant P as AIDL 与原生代理
  participant D as Binder 驱动
  participant T as 服务端接收线程
  participant S as Stub 与业务实现
  C->>P: 调用接口并编码参数
  P->>D: BC_TRANSACTION / BINDER_WRITE_READ
  Note over P,D: 客户端等待同步回复，可处理嵌套事务
  D->>T: BR_TRANSACTION
  T->>S: 分派 onTransact 并执行方法
  S-->>T: 返回结果或可编码的异常
  T->>D: BC_REPLY
  D-->>P: BR_REPLY 或失败事件
  P-->>C: 解码结果或抛出相应异常
```

服务端将同步结果写入回复 Parcel，经 `sendReply()` 发送 `BC_REPLY`。驱动把回复交回对应等待线程，客户端处理 `BR_REPLY`，生成的 Java 代理读取异常状态及返回值。

要区分三层结果：驱动是否接受事务、Binder 传输是否完成、业务是否成功。`BR_TRANSACTION_COMPLETE` 是驱动侧完成通知，不能替代同步回复，更不能当作业务成功确认。协议和执行细节见 [`IPCThreadState::waitForResponse()`、`executeCommand()` 与 `sendReply()`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/IPCThreadState.cpp)。

## 5. Parcel、对象转换与内存拷贝

### Parcel 中不只有一串普通字节

普通字段按约定编码；Binder 对象、文件描述符等还需要相应的对象元数据与偏移信息。`Parcel::flattenBinder()` 根据本地实体或远端代理写入不同对象形式，驱动随后将它们转换成接收进程可使用的表示；`unflattenBinder()` 再构造本地对象引用或代理。

因此，把一个原始指针数值写进 Parcel，并不会使接收进程拥有可解引用的同一对象。跨进程传递 FD 也涉及内核中的引用和接收方描述符安装，不能简单理解为复制一个整数。

源码入口：[`Parcel.cpp` 的 `flattenBinder()`、`unflattenBinder()`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/Parcel.cpp) 及驱动的 `binder_translate_binder()`、`binder_translate_handle()`。

### 怎样准确理解“一次拷贝”

该基线的 libbinder 通过 `mmap` 建立接收缓冲区映射。驱动把发送方的 payload 写入接收方缓冲区；接收方用户态 Parcel 可以引用这一映射，避免再把同一 payload 从独立内核中转区完整复制到接收方用户缓冲区。

这个描述只针对**一个方向的 payload 传输机制**。参数序列化、协议元数据、对象转换、读取字符串或数组时的分配，以及反方向回复都有自己的成本，整个 RPC 不能称为“零拷贝”，也不能不加条件地说“总共只复制一次”。

读取结束后的缓冲区释放也属于协议的一部分，不能把映射地址当作无限期有效的业务存储。核对入口：[`ProcessState.cpp` 的映射建立](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/ProcessState.cpp)、[`binder_alloc.c` 的分配与复制](https://android.googlesource.com/kernel/common/+/refs/tags/android16-6.12-2025-06_r1/drivers/android/binder_alloc.c)、[`Parcel::ipcSetDataReference()`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/Parcel.cpp)。

### 接收缓冲区怎样归还给驱动 {#receive-buffer-lifetime}

接收 Parcel 可以引用驱动映射的数据，但该地址不是业务永久存储。释放接收数据时，`IPCThreadState::freeBuffer()` 将 `BC_FREE_BUFFER` 和缓冲区地址写入输出命令队列，并调用 `flushIfNeeded()`；驱动据此回收接收空间。及时结束接收数据的持有，既是对象生命周期问题，也是并发事务的容量问题。[释放协议](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/IPCThreadState.cpp#1696)

保留反序列化得到的业务值，与保留 Parcel 内部数据指针是两回事。原生代码需要跨越 Parcel 生命周期使用数据时，应取得有明确所有权的副本或对象引用。

## 6. 线程池、同步重入与 oneway

### 线程池容量不是一个通用常数

原生 `ProcessState` 管理进程中的 Binder 运行时状态，`IPCThreadState` 保存参与调用的线程状态。服务端方法应按可能被不同调用线程并发进入来设计，不能依赖“系统会固定派给同一条线程”。

`maxThreads` 也不能机械解释为进程总 Binder 线程上限。该版本 NDK 头文件明确区分：内核按需启动的线程、`startThreadPool()` 主动启动的线程，以及调用 `joinThreadPool()` 加入的线程。它给出的配置 3、再启动 1 条并由主线程加入 1 条的例子，可形成 5 条线程；这不是所有 Java 或原生服务的统一配置。

遇到拥塞，先区分业务耗时、锁等待、嵌套调用和队列积压，再考虑线程池设置。增加线程不能修复持锁跨进程调用的死锁。依据：[`binder_process.h` 的线程池契约](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/ndk/include_platform/android/binder_process.h)。

### 等待回复的线程可能再次进入业务代码

```mermaid
sequenceDiagram
  participant A as 进程 A 的线程 A1
  participant D as Binder 驱动
  participant B as 进程 B 的线程 B1
  A->>D: 同步调用 B.foo
  D->>B: 执行 foo
  B->>D: 同步回调 A.bar
  D->>A: 可复用正在等待的 A1 执行 bar
  A-->>D: bar 的回复
  D-->>B: 回调返回
  B-->>D: foo 的回复
  D-->>A: 最初调用返回
```

同步事务链支持嵌套回调，原线程可能在外层调用尚未结束时被重新进入。即使进程只有一条 Binder 线程，也不能据此排除重入。

如果 A 在持有非递归锁时调用 B，B 又同步回调 A 并尝试获取同一把锁，就可能死锁。Java 的可重入锁在这种同线程场景下未必自锁，但回调仍可能看到尚未恢复的不完整状态。工程上应避免持锁发起 Binder 调用，缩小临界区，并在跨进程调用前建立明确、可回入的状态。依据：[官方 Binder 线程模型](https://source.android.com/docs/core/architecture/ipc/binder-threading)。

### oneway 的串行边界在 Binder 节点上

远端 `oneway` 不等待服务端业务执行结束，仍要完成编码与提交，且提交可能失败。它没有普通业务回复，服务端后来抛出的异常也不能按同步调用方式返回给调用方。

同一 Binder 节点上的异步事务会依次交付处理，但先后执行的线程可以不同。这个保证不能推广成“整个服务进程串行”，也不能约束同一节点的同步事务；如果 handler 把任务转交给业务线程池，后续业务任务是否并行与是否有序，要由业务层保证。

异步队列受缓冲区等资源约束，并非无限队列。需要业务完成确认时，应设计回调、结果查询或请求状态协议，而不是把方法改成 `oneway` 后假定任务必达。

核对入口：[`IPCThreadState::transact()` 的异步分支](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/IPCThreadState.cpp)、固定内核 [`binder.c` 的 `async_todo`](https://android.googlesource.com/kernel/common/+/refs/tags/android16-6.12-2025-06_r1/drivers/android/binder.c) 与 [`binder_alloc.c` 的异步空间管理](https://android.googlesource.com/kernel/common/+/refs/tags/android16-6.12-2025-06_r1/drivers/android/binder_alloc.c)。

## 7. 调用身份与权限检查

服务端处理入站事务时，`Binder.getCallingUid()` 读取当前线程的调用者身份；普通远端事务的身份由内核提供，不能让客户端自行提交一个 UID 字段来替代它。参数中的包名、业务账号等仍需按自己的协议核实。

身份属于接收事务的线程上下文。需要异步处理时，应在入口完成鉴权，并按需要显式保存已经核实的身份信息；把工作切到另一条线程后再调用 `getCallingUid()`，不能恢复最初那笔事务的来访者。

`getCallingPid()` 不适合作为安全身份：该基线的远端 `oneway` 调用返回 0，同步调用也可能因发送方死亡的竞态返回 0；PID 还可能被复用。鉴权应基于经验证的 UID、权限与具体资源规则，而不是 PID 或接口描述符。依据：[`Binder` 调用身份 API](https://developer.android.com/reference/android/os/Binder)。

### clearCallingIdentity 改变什么

它重置当前线程的 Binder 入站调用身份，用于明确需要以本服务身份执行的操作，**不会改变进程的 Linux UID，也不是通用的权限提升接口**。先检查原始调用者，再按需要清除，并在同一线程的 `finally` 中恢复。

```java
// 结构示意：授权规则和具体操作由服务实现。
final int callerUid = Binder.getCallingUid();
// 在这里校验 callerUid 是否有权执行目标操作，失败则拒绝。

final long identity = Binder.clearCallingIdentity();
try {
    // 仅执行确实需要本服务身份的操作。
} finally {
    Binder.restoreCallingIdentity(identity);
}
```

还要区分下一跳远程调用与本进程内的检查：A 调用 B，B 再发起到 C 的普通 Binder 事务时，C 看到的发送方是 B；这并不以 B 先调用 `clearCallingIdentity()` 为前提。B 线程上仍保留的入站身份，会影响 B 的本地调用和身份查询，正是需要谨慎处理的上下文。

接口 token/descriptor 用于核对协议，不等同于授权；ServiceManager 的服务发现准入、SELinux 的 Binder 策略与具体业务方法的权限检查也各有职责，拿到引用不能代替业务鉴权。核对入口：[`Binder.java`](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/os/Binder.java)、[`IPCThreadState::clearCallingIdentity()` 与 `clearCaller()`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/IPCThreadState.cpp)。

## 8. 引用计数、死亡通知与业务可靠性

Binder 运行库和驱动共同维护对象与远端引用的生命周期。持有代理意味着持有对端对象的引用关系，**不保证承载服务的进程永远存活**；系统仍可能结束进程，进程也可能崩溃。

`linkToDeath()` 用于监听远端 Binder 的死亡。本地对象没有同样的远端进程死亡语义；登记通知时目标也可能已经死亡。`isBinderAlive()` 等检查存在检查后状态变化的竞态，不能把“检查为存活”当作下一次调用必定成功的保证。

死亡通知既不会自动重新连接，也不能证明此前某个业务请求没有执行。重连后需要重新取得有效代理并按需登记死亡通知；是否重试、如何去重及如何查询提交结果，则属于业务协议。

对转账、创建任务、写配置等有副作用操作，合理的工程设计包括请求编号、幂等规则和状态查询。不要仅凭一次 `RemoteException` 或进程死亡，就无限重放可能已经完成的操作。依据：[`IBinder` 生命周期契约](https://developer.android.com/reference/android/os/IBinder) 与[原生 `IBinder.h`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/include/binder/IBinder.h)。

## 9. 缓冲区、延迟与常见故障

### “1 MiB”不是单笔请求的安全上限

官方 API 说明 Binder 事务缓冲区容量有限，并由进程进行中的事务共享。该基线 libbinder 的接收区大小还包含 `1 MiB - 2 × page size` 这样的实现细节，不能把一个近似数值直接当成单笔 payload 的可用预算。

并发事务、对象元数据和占用尚未释放的缓冲区都会影响分配。请求发不出去和回复发不回来，都可能表现为 `TransactionTooLargeException`；客户端不能仅凭该异常判定服务端没有执行。

接口应控制请求和回复规模，对集合分页、对字段做体积约束；大数据优先考虑带明确生命周期的文件描述符或共享内存通道，并单独管理所有权与权限。依据：[`TransactionTooLargeException` 契约](https://developer.android.com/reference/android/os/TransactionTooLargeException) 与 [`ProcessState.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/binder/ProcessState.cpp)。

### 按等待阶段定位问题

| 现象 | 优先检查 | 需要的证据 |
| --- | --- | --- |
| 查不到服务 | 注册时序、名称、当前 Binder context、可见性或权限 | 注册日志、ServiceManager 状态与策略日志 |
| 调用线程长期等待 | 服务端耗时、锁、嵌套依赖与可用接收线程 | 双方线程栈、同一时段的调度和 Binder trace |
| 小请求也失败 | 对端死亡、共享缓冲占用、异常回复与运行时状态 | 异常类型、服务生命周期、并发及回复大小 |
| oneway 延迟持续增加 | 接收端处理速度、同节点排队、异步空间 | 发送/接收时间、队列趋势与业务处理耗时 |
| UI 卡顿或 ANR | 主线程上的同步调用及下游阻塞 | 主线程栈、系统 trace 与关联服务线程状态 |

一次调用的延迟包含编码、驱动处理、排队与调度、业务执行和回复等阶段。只看到客户端停在 `transact`，不足以判断驱动慢或线程池不足；扩容、改异步和增加重试之前，应先找到等待发生的位置。

## 10. 现代 AIDL 与历史 Binder 分域

Android 8 的相关文档介绍了 `/dev/binder`、`/dev/hwbinder` 与 `/dev/vndbinder` 等历史分域，每个 context 有自己的服务管理入口。它们不是可以任意互通、共享 handle 的同一个命名空间。

但不能把“Framework 永远用 binder，所有 vendor 服务永远用 hwbinder/vndbinder”当作现代规则。Stable AIDL 自 Android 10 提供接口稳定性支持，Android 11 引入 AIDL HAL；现代跨 system/vendor 的 Stable AIDL 使用 `/dev/binder`，并对后端与运行库有具体要求。`vndservicemanager` 自 Android 11 被弃用，不表示所有存量设备立刻移除。

跨 system/vendor 的 HAL 接口还涉及 `@VintfStability`、构建中的 `stability: "vintf"`、接口版本冻结与 VINTF 清单等约束。写了 `.aidl` 文件并不自动获得跨版本兼容；不能把本地 Java AIDL、平台内部 C++ ABI 和稳定 HAL 接口当成同一层保证。

依据：[Binder 分域的历史与迁移说明](https://source.android.com/docs/core/architecture/hidl/binder-ipc)、[AIDL HAL](https://source.android.com/docs/core/architecture/aidl/aidl-hals)、[Stable AIDL](https://source.android.com/docs/core/architecture/aidl/stable-aidl)、[AIDL 后端与 API 边界](https://source.android.com/docs/core/architecture/aidl/aidl-backends)。

## 11. 怎样用源码和设备验证理解

### 先记录实际环境

先查询实际版本、构建和内核，再选择对应源码；服务列表用于确认目录可见性：

```sh
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.sdk
adb shell getprop ro.build.fingerprint
adb shell uname -r
adb shell service list
adb shell dumpsys -l
```

`service list` 列出服务名称及可获取的接口描述；`dumpsys -l` 只列出服务，不执行各服务的完整 dump。它们反映当前上下文中可见的服务，不是所有内核 Binder 节点或 handle 的清单。命令语义可核对固定版本的 [`service.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/cmds/service/service.cpp) 与 [`dumpsys.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/cmds/dumpsys/dumpsys.cpp)。

即使设备显示 Android 16，也不能由版本字符串单独推出它与本文源码标签完全一致。进一步分析应使用与设备构建匹配的源码、符号和厂商修改信息。

### 再构造能区分机制的观察

1. 在受控测试服务中，比较同进程与独立进程调用，记录入口线程、UID 与执行顺序，验证本地优化是否发生。
2. 分别观察同步方法与 `oneway` 的发送返回、服务端开始和业务完成时刻，避免把提交时间当作完成时间。
3. 给请求与回复加入可关联的业务编号，结合双方线程栈与系统 trace，定位编码、排队、执行和回复的等待阶段。
4. 在隔离环境验证服务死亡、连接恢复和大消息失败，核对副作用是否已经发生，检查重试幂等与资源释放。

设备与构建可能限制 trace、调试文件或进程信息的可见性，应按实际权限选择观察方法。记录结论时同时写明设备输出、源码版本、执行步骤与无法覆盖的条件。

## 12. 源码阅读路线

建议先追踪一个实际接口的方法，再按下面的顺序扩展；不要仅背诵一串类名。

- **接口与生成代码**：AIDL 声明、生成的 `asInterface()`、代理方法和 `Stub.onTransact()`，确认本地分支、事务码、参数方向及异常读取。
- **Framework 与 JNI**：`BinderProxy.transactNative`、`android_os_BinderProxy_transact`、`JavaBBinder::onTransact`、`Binder.execTransactInternal`，连接 Java 与原生对象。
- **原生运行库**：`BpBinder::transact`、`IPCThreadState::transact` / `waitForResponse` / `executeCommand`、`ProcessState` 与 `Parcel`，确认协议命令和线程上下文。
- **独立内核参考**：`binder_transaction`、对象引用转换、线程待办和事务栈、`binder_alloc`，确认目标解析、缓冲区与投递边界。
- **服务发现与约束**：ServiceManager 的注册查找、调用身份检查，以及实际服务的业务权限和重试语义。

对照源码时，反复回答五个问题：当前在哪个进程与线程？持有本地实体还是代理？正在等待提交、执行还是回复？调用身份属于谁？出现失败后，已经完成的业务动作能否确定？

原始笔记：[原始 Binder 笔记](https://alidocs.dingtalk.com/i/nodes/14dA3GK8gjRyZe27foyNY7MoJ9ekBD76)。
