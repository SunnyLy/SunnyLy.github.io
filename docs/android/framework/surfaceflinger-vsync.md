---
description: 从屏幕像素和一行文字出发，图解 App 绘制、Buffer、SurfaceFlinger 合成、VSYNC 与卡顿，再深入源码和 Play Integrity 的显示相关风险信号。
---

# SurfaceFlinger 与 VSYNC：从硬件节拍到一帧呈现

先带着一个问题阅读：**执行 `textView.setText("A")` 后，手机屏幕为什么会出现字母 A？**

## 1. 从屏幕开始：屏幕只认识像素

![字母 A 如何变成像素颜色的示意图](/assets/android/framework/surfaceflinger/text-to-pixels.svg)

- **像素**是画面中的一个位置，颜色决定这里显示什么。屏幕通过物理子像素产生颜色，排列方式随面板而异。
- **一帧**是某一时刻准备显示的图像。文字、照片、按钮最终都要变成像素颜色。
- 图中用粗网格说明原理；真实字体还涉及字形选择、排版、抗锯齿和更多像素。

**屏幕不理解 TextView，也不认识字符串。App 和系统先算好图像，显示硬件再把图像送到面板。**

## 2. 一行文字如何走到屏幕

```mermaid
flowchart TB
  subgraph App[App 进程：生成窗口画面]
    A[TextView 设置文字 A] --> B[布局确定位置和大小]
    B --> C[绘制记录文字等绘图命令]
    C --> D[RenderThread 组织渲染工作]
    D --> E[GPU 向图形 Buffer 写入像素]
  end
  E --> F[提交 Buffer 与同步信息]
  F --> G[SurfaceFlinger：组织多个图层的合成]
  G --> H[Composer HAL 与显示控制器]
  H --> I[面板更新：眼睛看见 A]
```

这里画的是**常见的硬件加速 View 窗口路径**。GPU 工作是异步的，提交 Buffer 时可以仍在渲染，后续依靠同步信息协调。软件绘制、视频、SurfaceView 的生产路径有所不同。

### 先理解三个动作

- **布局**回答“文字放哪里、多大”。
- **绘制与渲染**回答“这个位置的颜色怎么算”。硬件加速时，UI 线程通常先记录命令，后续由 RenderThread、图形库和 GPU 完成渲染。
- **显示**回答“哪幅画面在什么时间送上屏幕”。这一步还涉及 SF 和显示硬件。

下面的普通 Activity 就能触发这条路径，App 不需要直接调用 SurfaceFlinger：

```java
public final class PixelActivity extends android.app.Activity {
    @Override
    protected void onCreate(android.os.Bundle state) {
        super.onCreate(state);
        android.widget.TextView text = new android.widget.TextView(this);
        text.setText("A");
        text.setTextSize(64); // 单位为 sp；先用系统默认字体观察。
        text.setTextColor(android.graphics.Color.BLACK);
        text.setBackgroundColor(android.graphics.Color.WHITE);
        setContentView(text); // 加入窗口，后续由框架安排布局和绘制。
    }
}
```

`setText()` 改变的是 View 的状态，必要时触发布局与重绘，**调用返回时还不能认定新文字已经上屏**。路径说明见 [Android 硬件加速绘制](https://developer.android.com/develop/ui/views/graphics/hardware-accel)。

## 3. Buffer 和 Surface：画好后放哪里

**Buffer 是存放图像数据的图形内存；Surface 是生产者提交图像的入口，并不是屏幕本身。**

```mermaid
flowchart TB
  A[生产者获取可用 Buffer] --> B[向 Buffer 写入新画面]
  B --> C[提交 Buffer 与 acquire fence]
  C --> D[消费者取得 Buffer]
  D --> E[遵守同步依赖后读取或合成]
  E --> F[归还旧 Buffer 与 release fence]
  F --> A
```

- **BufferQueue** 管理生产、消费和复用，传递 Buffer 引用及同步信息；队列本身不负责逐帧复制整屏像素。
- 常见现代窗口中，App 内的 **BLASTBufferQueue** 接收队列中的 Buffer，再通过 `SurfaceControl.Transaction` 提交给 SF。
- 一个普通窗口里的多个 TextView、Button 通常先画进窗口 Buffer，**不是每个 View 都对应一个 SF 图层**。SurfaceView 等可以有独立的 Surface。

可以把这一节理解为：**先画在内存里，再把“哪块内存、什么时候能读”交给后续环节。** 参见 [BufferQueue 与 Gralloc](https://source.android.com/docs/core/graphics/arch-bq-gralloc)。

## 4. SurfaceFlinger：把多个窗口拼成完整画面

一块屏幕常常同时显示 App、状态栏、键盘和弹窗。各自提交内容后，SF 根据图层的位置、层级、透明度和裁剪等状态组织合成。

```mermaid
flowchart TB
  A[App 窗口图层] --> S[SurfaceFlinger：整理本次显示所需的图层]
  B[状态栏图层] --> S
  C[输入法图层] --> S
  S --> P{为各图层选择合成方式}
  P -->|DEVICE| D[交给厂商显示硬件合成]
  P -->|CLIENT| G[RenderEngine 使用 GPU 合成]
  G --> T[生成 client target]
  T --> H[Composer HAL 提交显示]
  D --> H
  H --> O[显示控制器与面板]
```

- **WindowManager** 管窗口的组织、布局和层级等；**SurfaceFlinger** 使用图层及 Buffer 组织输出。
- **RenderEngine** 是 SF 使用的渲染组件；**Composer HAL** 是与厂商显示实现协作的接口，不是一块固定名称的芯片。
- 同一帧可以混合使用硬件合成和 GPU 合成。**SF 不一定亲自用 GPU 重画所有图层。**

看图时区分两次 GPU 工作：App 的 GPU 渲染生成自己的内容；SF 的 GPU 合成可能把多个内容合成 client target。后者是否发生取决于合成策略。参见 [SF 与 WindowManager](https://source.android.com/docs/core/graphics/surfaceflinger-windowmanager)及 [Hardware Composer](https://source.android.com/docs/core/graphics/implement-hwc)。

## 5. VSYNC：为什么画图还要看时间

**刷新率描述屏幕更新的节奏；VSYNC 提供与显示刷新对齐的时间参考。** 假设当前屏幕以 60 Hz 工作，相邻刷新边界约隔 16.67 ms；120 Hz 则约为 8.33 ms。

```mermaid
sequenceDiagram
  participant Panel as 屏幕
  participant Sched as 系统调度与预测
  participant App as App
  participant SF as SurfaceFlinger
  Panel-->>Sched: 提供硬件 VSYNC 时间样本
  Sched->>Sched: 预测未来刷新，安排提前工作的时间
  Sched-->>App: 应用显示事件
  App->>App: Choreographer.doFrame：按需更新和绘制
  App->>SF: 提交 Buffer 与同步信息
  Sched-->>SF: SF 自己的合成调度回调
  SF->>SF: 处理可用图层并组织合成
  SF->>Panel: 经 Composer 与显示硬件提交输出
  Note over App,Panel: 屏幕可在这些工作进行时刷新上一幅画面
```

这是一帧的职责顺序示意，**不是固定时长的时间轴**。App 和 SF 的唤醒时刻分别安排，也不保证每次收到事件都产生新画面。

### Choreographer 怎样安排一次绘制

```mermaid
flowchart TB
  A[View 状态改变，需要更新] --> B[ViewRootImpl.scheduleTraversals]
  B --> C[向 Choreographer 登记 TRAVERSAL 回调]
  C --> D[等待合适的显示事件与 Looper 调度]
  D --> E[Choreographer.doFrame]
  E --> F[依次处理输入、动画等回调]
  F --> G[执行遍历：按需测量、布局、绘制]
```

源码先抓住这几行，再看完整调用链。以下节选自 **AOSP `android-16.0.0_r1`**，省略无关分支：

```java
// ViewRootImpl.java，scheduleTraversals()，原文件 3047–3052 行。
void scheduleTraversals() {
    if (!mTraversalScheduled) { // 合并重复请求，不是每次修改都立刻画一次。
        mTraversalScheduled = true;
        mTraversalBarrier = mHandler.getLooper().getQueue().postSyncBarrier();
        mChoreographer.postCallback(
                Choreographer.CALLBACK_TRAVERSAL, mTraversalRunnable, null);
        // ...
    }
}

// Choreographer.java，doFrame() 内，原文件 1108 行。
// 在此前的输入、动画等阶段之后，执行登记的遍历回调。
doCallbacks(Choreographer.CALLBACK_TRAVERSAL, frameIntervalNanos);
```

对应源码：[ViewRootImpl.java](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/view/ViewRootImpl.java#3047)、[Choreographer.java](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/view/Choreographer.java#1108)。

### 为什么不是每个硬件中断都通知 App

```mermaid
flowchart TB
  A[硬件时间样本] --> B[校准 VSYNC 预测器]
  B --> C[估计未来刷新时间]
  C --> D[分别提前调度 App 和 SF]
  B --> E[样本稳定后可减少硬件回调]
  E --> F[需要重新同步时再开启采样]
  F --> A
```

**停止接收部分硬件回调，不代表面板停止刷新。** 系统可依靠预测安排工作，并在需要时重新校准。更深的 Reactor、Predictor、EventThread 和 BitTube 路径见下方源码进阶。

## 6. 卡顿：屏幕刷新了，为什么画面没动

```mermaid
flowchart TB
  A[某次显示更新的目标时刻] --> B{新画面是否及时满足显示条件}
  B -->|是| C[显示新画面 B]
  B -->|否| D[继续显示旧画面 A]
  D --> E[下一次才看到 B：运动出现停顿]
```

- **Hz 不等于 FPS**：屏幕刷新 120 次，不代表 App 每秒生成 120 幅不同的画面。静态文字可以连续复用同一幅图像。
- **16.67 ms 不是主线程独占预算**：CPU、GPU、合成和显示需要协作，且可能流水并行；预算还受调度策略影响。
- **卡顿不一定是 UI 线程慢**：RenderThread、GPU、Buffer 等待、SF 合成或显示环节也可能错过目标时间。

排查先找“哪一帧错过目标、哪一段耗时”，再看主线程、RenderThread、GPU 和 SF。可以用 Perfetto 的 [FrameTimeline](https://perfetto.dev/docs/data-sources/frametimeline) 对齐预期与实际帧时间。

## 7. Fence：提交、画完和显示完成不是一回事

```mermaid
flowchart TB
  A[App 提交 Buffer：可早于 GPU 写完] --> B[输入 acquire fence 表达写入依赖]
  B --> C[依赖满足，消费者可安全读取]
  C --> D[合成与提交显示]
  D --> E[present fence：按输出契约标记呈现时点]
  D --> F[release fence：表达旧 Buffer 的读取结束依赖]
  F --> G[复用前仍须满足相关同步条件]
```

**Fence 是异步工作的同步凭据**。它让后续工作知道依赖何时完成，不要求每一层都让 CPU 阻塞等待。

- `queueBuffer()`、事务返回，只表示相应提交步骤完成，不能推出 GPU 或屏幕已完成。
- `present fence` 的语义与显示类型、面板模式有关，不能统一解释成“整屏像素扫描完毕”。
- 旧 Buffer 归还与“现在就能覆盖写入”也有区别，必须遵守回传的同步依赖。

精确定义见 [Composer3 Buffer](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/Buffer.aidl)及 [CommandResultPayload](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/CommandResultPayload.aidl)。

## 8. 用三个问题串起整条链

```mermaid
flowchart TB
  A[画什么] --> A1[App：布局、绘制、渲染，生成 Buffer]
  B[拼什么] --> B1[SF：图层、可用 Buffer 与合成策略]
  C[何时显示] --> C1[VSYNC 调度、同步依赖、显示硬件]
```

阅读源码或 trace 时，先把问题放回对应阶段：**内容不对查生成和图层；更新不及时查调度与耗时；花屏或复用异常查 Buffer 和同步依赖。**

## 9. 源码进阶：沿时间、数据和同步三条线下钻

<details>
<summary>展开底层链路：显示驱动 → Composer 回调 → VSYNC 预测 → App / SF 调度 → BLAST → 合成与 fence</summary>


#### 1. 先建立三个互相关联的视角

**节拍视角**：显示事件提供时间样本，预测器估计未来 VSYNC，调度器选择提前唤醒应用和 SF 的时刻。

**数据视角**：应用生产图形缓冲区，经窗口提交机制交给 SurfaceFlinger；SF 决定各层如何合成，再通过 HWC 提交显示。

**完成视角**：CPU 函数返回、GPU 写完、显示开始呈现和旧缓冲区可复用是不同事件，需要分别观察时间戳与 fence。

```mermaid
flowchart TD
  subgraph Hardware[显示硬件与内核]
    H[扫描时序或面板同步事件] --> I[显示驱动中断处理]
    I --> K[DRM vblank 或厂商事件接口]
  end
  K --> C[Composer HAL 获取时间样本]
  C -->|onVsync 反向回调| S[SurfaceFlinger 接收并校验]
  subgraph Scheduling[SurfaceFlinger 调度资源]
    S --> R[VSyncReactor 与 VSyncPredictor]
    R -->|预测未来节拍| D[VSyncDispatchTimerQueue]
    D --> A[应用侧事件分发]
    D --> F[SF 自身帧工作调度]
  end
```

图中箭头表达依赖关系，不表示每次硬件事件都同步执行图中全部步骤。HAL 还可能使用合成时间戳作为回退，收到回调也不能单独证明某次真实 IRQ 已发生。

#### 2. 显示硬件、Linux 驱动与 HWC 各做什么

| 对象 | 职责 | 需要避免的混淆 |
| --- | --- | --- |
| 显示控制器、DSI Host、面板 | 读取或接收像素，完成扫描与传输 | DSI Host 不等同于整个显示控制器；面板不是被动的函数终点 |
| Linux 显示驱动与 DRM/KMS | 管理显示模式、Plane、CRTC、Connector，处理事件和同步 | CRTC 是显示管线的 KMS 抽象，具体寄存器与 IRQ 由驱动决定 |
| Composer HAL / HWC | 对接 SF，协商合成策略、提交显示工作、报告事件 | HWC 是 HAL 接口及其实现，不能直接当作一块固定名称的硬件 |

视频模式下，控制器通常按显示时序持续传输。命令模式的某些面板可保存图像，使用 TE 等信号协调更新；是否经过 GPIO、DSI 中断或其他事件，由面板和 SoC 实现决定。**TE、frame-done 和 DRM vblank 不能仅因“每帧出现”就认定是同一个硬件事件。**

同样，“画面没有变化”不代表物理面板停止扫描；减少应用绘制、减少 SF 合成、停止某类回调与降低面板刷新率，是不同层面的策略。硬件对象与 vblank 约束参见 [Linux DRM/KMS 文档](https://docs.kernel.org/gpu/drm-kms.html)。

#### 3. 从内核事件到 HAL 时间戳

##### DRM 路径是一种可阅读的参考实现

采用 DRM/KMS 的驱动可以在对应的中断处理中调用 `drm_crtc_handle_vblank()`，由 DRM 核心维护计数、时间戳与待处理事件。具体 IRQ handler 的名称不能从 AOSP Framework 推断，更不能把一个 SoC 的函数名推广到全部设备。

用户态通过设备文件、ioctl 或事件读取获取结果。`ioctl()` 是当前线程进入内核执行驱动操作的入口，并不意味着启动另一进程；如果请求需要等待，线程可能睡眠，直到条件满足或操作失败。接口说明见 [DRM 用户态接口](https://docs.kernel.org/gpu/drm-uapi.html)。

固定版本的 [`VSyncWorker.cpp`](https://android.googlesource.com/platform/external/drm_hwcomposer/+/refs/tags/android-16.0.0_r1/drm/VSyncWorker.cpp)提供了具体阅读样本：

1. 根据目标显示管线设置 vblank 请求，使用 `DRM_VBLANK_RELATIVE` 和 `request.sequence = 1` 等字段。
2. 调用 `drmWaitVBlank()`，处理被中断重试与失败情形。
3. 成功时把回复中的秒、微秒转换为纳秒时间戳，再向上层报告。
4. 等待失败时还可能进入 `SyntheticWaitVBlank()` 回退。

因此，不能省略请求配置后，仅凭 `drmVBlank vblank{}` 和一次调用就断言“必然阻塞到下一次硬件 VSYNC”。也不能把 reference HAL 的回退时间戳当作所有设备真实中断的证据。

##### 时间戳表示事件时刻，不是收到回调的时刻

Composer `onVsync` 的 `timestamp` 使用 `CLOCK_MONOTONIC` 纳秒时间基准。IRQ 处理、HAL 等待返回、Binder 调度和 SF 接收之间会有延迟；函数被执行的时间不能替代参数中携带的事件时间。

接口契约见 [`IComposerCallback.aidl`](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/IComposerCallback.aidl)。分析跨层时序时，应先确认时间基准和单位，再比较差值。

#### 4. Composer 的会话对象与反向回调

`IComposer.createClient()` 返回 `IComposerClient` 会话接口。DRM 参考实现中的 `ComposerClient : BnComposerClient` 位于 **HAL 服务端**；名字中的 Client 表示为调用方维护的会话，并不意味着它是 SF 进程里的远端代理。

SF 持有该接口的远端引用，又实现一个 `BnComposerCallback` 回调对象并登记给 HAL。这样，控制请求从 SF 发往 HAL，而 VSYNC 通知沿相反方向进入 SF。

```mermaid
sequenceDiagram
  participant SF as SurfaceFlinger
  participant H as Composer HAL
  participant CB as SF 回调对象
  SF->>H: IComposer.createClient
  H-->>SF: IComposerClient 远端引用
  SF->>H: registerCallback 并传递回调引用
  SF->>H: setVsyncEnabled
  Note over H: 按接口约束与实现获取显示事件
  H--)CB: oneway onVsync 携带时间戳
  CB->>SF: 转入内部显示映射与调度逻辑
```

`oneway` 不要求 HAL 等待 SF 的业务处理完成，但仍需完成事务提交；它不意味着回调无延迟或提交永不失败。回调入口在 SF 的 Binder 接收上下文中，后续涉及锁、状态更新和线程间投递，不能直接把它等同于 SF 主线程合成。

源码入口：[`IComposer.aidl`](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/IComposer.aidl)、[`ComposerClient.h`](https://android.googlesource.com/platform/external/drm_hwcomposer/+/refs/tags/android-16.0.0_r1/hwc3/ComposerClient.h)、[`AidlComposerHal.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/DisplayHardware/AidlComposerHal.cpp)。

#### 5. 硬件样本怎样成为未来的调度时间

##### 接收、校准与预测

该版本可以沿以下入口阅读；这是跨对象的逻辑路径，不是一份实际设备线程栈：

```text
AidlIComposerCallbackWrapper::onVsync
  → SurfaceFlinger::onComposerHalVsync
  → HWComposer::onVsync：校验与物理显示 ID 映射
  → Scheduler::addResyncSample
  → VsyncSchedule::addResyncSample
  → VSyncReactor::addHwVsyncTimestamp
  → VSyncPredictor::addVsyncTimestamp
```

`VsyncSchedule` 管理某块物理显示器对应的预测、控制和分发资源。`VSyncReactor` 处理采样和重新同步；`VSyncPredictor` 从时间样本估计节拍，并计算未来时刻；`VSyncDispatchTimerQueue` 根据预测结果和任务预算安排软件定时回调。它们的职责不同，不能统称为“把中断转发出去”。

调度概念可以写成：

```text
期望唤醒时刻 ≈ 选定的目标 VSYNC - workDuration - readyDuration
```

该式解释预算如何影响提前量，不保证线程准时获得 CPU，也不表示应用与 SF 使用固定相同预算。实际选点、任务更新、过期处理和刷新模式变化应继续阅读 [`VSyncDispatchTimerQueue.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/Scheduler/VSyncDispatchTimerQueue.cpp)。预测与采样入口见 [Scheduler 源码目录](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/Scheduler/)。

##### 为什么可以按需关闭硬件回调

模型稳定后，SF 可以请求关闭 HWC 的 VSYNC 回调；需要重同步、切换模式或检查呈现偏差时，再按策略请求样本。是否持续采样还与配置及可用反馈有关，不存在适用于所有设备的固定采样次数。

控制方向大致为 `VsyncSchedule → Scheduler → SurfaceFlinger::requestHardwareVsync → HWComposer::setVsyncEnabled → IComposerClient`，与时间样本上行方向相反。

**关闭回调不等于关闭面板或全部中断。** DRM 参考 worker 还可能因为内部时间戳跟踪而继续工作。可核对 [`VsyncSchedule.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/Scheduler/VsyncSchedule.cpp) 和前述 `VSyncWorker.cpp`。官方 [VSync 概念页](https://source.android.com/docs/core/graphics/implement-vsync)也说明按需启停事件，但其中的 DispSync/HWC2 示例属于不同实现背景，不能直接当作本版本类名与调用链。

#### 6. 应用与 SF 使用两条调度路径

##### 应用路径：Binder 建立连接，BitTube 传递事件

应用经 `DisplayEventReceiver` 建立显示事件连接，并请求后续 VSYNC。连接管理涉及 Binder；事件数据通过 **BitTube 的 Unix 域 socket 通道**传递，它不是共享内存，也不是“每一帧都直接调用应用的 Java Binder 方法”。

SF 中的 EventThread 接收调度回调，将事件交给连接；应用侧的 `DisplayEventDispatcher` 监听接收 FD，在对应 Looper 中读取。

JNI 的 `NativeDisplayEventReceiver` 衔接 Java 接收器，`Choreographer.FrameDisplayEventReceiver.onVsync()` 再投递异步 Handler 消息，随后进入 `doFrame()`。

```mermaid
sequenceDiagram
  participant T as SF 预测与定时分发
  participant E as SF 内 EventThread
  participant A as 应用 Looper
  participant S as SF 主线程 Looper
  par 应用侧注册的调度
    T->>E: 到期的软件调度回调
    E-->>A: 经 BitTube 传递显示事件
    A->>A: DisplayEventDispatcher 与 JNI
    A->>A: onVsync 投递消息后执行 doFrame
  and SF 自身注册的调度
    T->>S: MessageQueue 回调投递帧消息
    S->>S: Scheduler.onFrameSignal
    S->>S: 按需 commit 与 composite
  end
```

图中的两条路径并行展示职责，不要求同一时刻触发，也不承诺一定对应同一幅画面。该基线还存在面向不同周期的 EventThread；不能把名称带 `appSf` 的 EventThread 直接画成驱动 SF 自身合成的入口。

`Choreographer` 运行在创建它所绑定的 Looper 线程上，常见窗口 UI 使用主线程。`doFrame()` 的回调顺序包含 INPUT、ANIMATION、INSETS_ANIMATION、TRAVERSAL、COMMIT；后续渲染还涉及 RenderThread、GPU 和缓冲区提交。**`doFrame()` 返回不等于像素已经出现在屏幕上。**

源码入口：[`EventThread.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/Scheduler/EventThread.cpp)、[`DisplayEventDispatcher.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/gui/DisplayEventDispatcher.cpp)、[`Choreographer.java`](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/view/Choreographer.java)。

##### SF 路径：自己的定时注册与主线程消息

SF 的 `MessageQueue` 向 VSYNC dispatch 注册自身回调。需要一帧工作时，`scheduleFrame()` 申请调度；回调经 `MessageQueue::vsyncCallback → Handler::dispatchFrame` 向 SF Looper 发消息，再进入 `Scheduler::onFrameSignal()`。

这一层仍会判断是否需要合成。没有新状态或输出工作时，不应把每一次预测节拍都理解成完整执行一次 GPU 合成。准确入口见 [`MessageQueue.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/Scheduler/MessageQueue.cpp)。

#### 7. 从应用 Buffer 到 SF 的 commit

BufferQueue 的基本角色是生产者获取可用缓冲区、提交内容，消费者取得缓冲区并在使用后释放。传递的是缓冲区引用和同步信息，不是由 BufferQueue 为每一帧复制整幅像素。基础说明见 [BufferQueue 与 Gralloc](https://source.android.com/docs/core/graphics/arch-bq-gralloc)。

但现代窗口路径不能简单写成“所有 BufferQueue 都由 SF 直接消费”。在常见 BLAST 路径中，客户端进程内的 `BLASTBufferQueue` 作为适配器消费本地 BufferQueue，再把取得的 buffer、acquire fence 和帧信息放进 `SurfaceControl.Transaction`，交给 SF。

该版本可追踪 `BLASTBufferQueue::onFrameAvailable → acquireNextBufferLocked → Transaction::setBuffer`。普通提交与外部同步事务的处理不同，后者可能先合并再提交；不能假定每次回调都立即单独 `apply()`。源码见 [`BLASTBufferQueue.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/gui/BLASTBufferQueue.cpp)。

SF 的 `commit()` 处理待提交状态、Layer 关系与快照、可锁存的 buffer 和相关调度决策；`composite()` 才进一步组织输出合成。图层是否有新内容、依赖 fence 是否满足、目标时间和显示策略都会影响这一帧的结果，不能仅看到“应用已提交”就认定 SF 已消费并显示。

#### 8. CompositionEngine、RenderEngine 与 Composer 命令

`SurfaceFlinger::composite()` 调用 `CompositionEngine::present()`。CompositionEngine 组织输出的准备和呈现，按策略选择客户端合成、设备合成或两者混合；一部分工作可以被卸载到其他线程，不宜将整个过程画成 SF 主线程的一段同步栈。

- **CLIENT composition**：需要 SF 的 RenderEngine 完成客户端合成，生成 client target，再交给 HWC。
- **DEVICE composition**：由 HAL 负责的设备合成路径处理相应图层；具体显示硬件能力与厂商策略有关。
- **混合路径**：部分图层先组成 client target，其他图层走设备合成，最终形成显示输出。

##### validate / present 是阶段，不是固定的两次 AIDL 方法调用

`validate` 用于协商合成策略，`present` 用于提交呈现；存在 `presentOrValidate` 和跳过某些验证工作的优化，不能写成每一帧必然完整执行固定流程。

更需要区分接口层次：在 composer3 AIDL 中，SF 的包装层把 validate/present 操作编码到 `DisplayCommand`，由 **`IComposerClient.executeCommands()`** 批量发送并解析 `CommandResultPayload`。

不要把包装函数名误写成并不存在的 `IComposerClient.validateDisplay()`、`IComposerClient.presentDisplay()` 独立 AIDL 方法。

可对照 [`AidlComposerHal.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/DisplayHardware/AidlComposerHal.cpp)、[`DisplayCommand.aidl`](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/DisplayCommand.aidl) 和 [CompositionEngine 源码](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/CompositionEngine/src/)。

##### present 也有按帧选择的线程分支 {#present-worker}

`Output` 的呈现路径检查 `mOffloadPresent`：需要卸载时调用 `presentFrameAndReleaseLayersAsync()`，否则直接执行 `presentFrameAndReleaseLayers()`。

卸载标志只对当前帧生效，之后重置，下一帧重新决策；不能把所有 present 都归到同一线程，也不能看到异步分支就推断 SF 不再等待其结果。[Output 呈现分支](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/CompositionEngine/src/Output.cpp#487)

#### 9. 用 fence 区分“已提交”和“可安全使用”

Fence 表达异步工作依赖，可以随缓冲区传递。拿到一个 fence FD，只是拿到了观察或传递该依赖的引用；它不等于依赖已经满足，也不要求每一层都在 CPU 上同步等待。

| 类型 | 在此路径中的含义 | 不能据此认定 |
| --- | --- | --- |
| 输入 / acquire fence | 输入 buffer 何时可以被后续消费者安全访问 | `queueBuffer` 或事务返回时 GPU 已经写完 |
| release fence | 旧 buffer 何时不再被相应消费者读取，可按生命周期复用 | 释放回调到达时就能无条件覆盖该 buffer |
| present fence | 按显示类型约定标记呈现或输出完成的时点 | 所有物理像素都已经完成发光或扫描 |

在 composer3 的约束中，物理视频模式面板与命令模式面板的 present 时点并不完全相同；后者可对应开始向面板存储传输。虚拟显示又有输出 buffer 可读取的语义。

因此，不能统一把 present fence 定义为“整屏扫描结束”。精确定义以 [`CommandResultPayload.aidl`](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/CommandResultPayload.aidl) 为准，输入依赖见 [`Buffer.aidl`](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/Buffer.aidl)。

SF 归还旧缓冲区时，仍可能需要合并或继续传递依赖。应用重新获取缓冲区后，也须遵守返回的同步约束。把“函数返回、提交成功、fence 已 signal、buffer 可重用”合并为一个完成状态，会同时误判性能与生命周期问题。

#### 10. 怎样阅读一帧的时间线

| 观测数据 | 表示什么 | 排查时的限制 |
| --- | --- | --- |
| HAL VSYNC timestamp | HAL 报告的显示节拍时间样本 | 区别真实事件与实现中的合成回退 |
| 回调到达与线程运行时刻 | 消息传递延迟和 CPU 调度结果 | 不能替代事件携带的 timestamp |
| 应用 frame time | 应用帧回调使用的逻辑时间 | 不是实际呈现完成时间 |
| deadline、expected presentation time | 某条 FrameTimeline 需准备完成的绝对时刻与期望呈现时刻 | 预测值不是硬件完成保证，预算须由时间差计算 |
| VsyncId | 关联帧调度与 FrameTimeline 记录的标识 | 不是硬件 vblank counter |
| present / release fence 的 signal 时刻 | 对应同步契约实际满足的时刻 | 不能互相代替，也不能脱离显示模式解释 |

FrameTimeline 的 deadline 与 expected presentation time 使用 `System.nanoTime()` 的纳秒时间基准。一个事件可携带多条候选时间线及首选项，应结合具体候选解释预算，而不是把这些字段当作已测得的完成时间。

60 Hz 的理想刷新周期约为 16.67 ms，但这个周期不是应用可独占的 CPU 预算；应用、GPU、SF 与显示硬件会跨帧并行。刷新率切换、帧率覆盖和可变刷新能力还会改变调度关系，不能固定断言“一次 VSYNC 对应一帧应用画面”或“输入到显示永远延迟两帧”。

分析时，应先选定物理显示器与关联的应用帧，再沿提交、锁存、合成和呈现关联数据。不同模块的 Display ID 命名空间也有区别，不能直接把 HAL 的显示句柄与 SF 的物理显示 ID 当作同一整数使用。

#### 11. 从症状反查阶段

| 现象 | 优先核对的阶段 | 有用的证据 |
| --- | --- | --- |
| 应用帧开始很晚 | 事件接收、Looper 消息、CPU 可运行到实际运行 | 应用主线程消息与调度片段 |
| 应用逻辑结束但画面迟到 | RenderThread、GPU 完成、提交与 acquire 依赖 | 应用帧记录、GPU 与 fence 时间线 |
| SF 收到内容却未用于目标帧 | 事务合并、锁存条件、截止时间与帧选择 | buffer/帧标识、SF 帧记录与依赖 |
| SF 工作时间明显增加 | 图层变化、合成策略、GPU client composition | CLIENT/DEVICE 变化及合成耗时 |
| 模式切换前后节拍异常 | 新周期约束、重新采样与预测、显示 ID | 模式变更与同一显示器的事件时间戳 |
| SF 回调减少但屏幕仍刷新 | 回调订阅与物理扫描的层次差异 | enable 状态、HAL 行为与驱动观测 |

##### 先确认设备，再解释 trace

先确认设备的构建、显示配置与可用追踪数据源：

```sh
adb shell getprop ro.build.fingerprint
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.sdk
adb shell uname -a
adb shell dumpsys SurfaceFlinger
adb shell perfetto --help
adb shell perfetto --query
```

记录实际构建、内核与显示信息后，再确认 Composer 实现、面板模式和可用的追踪能力。设备输出不能单独证明它采用本文源码标签；厂商内核与 HAL 的实现细节仍需对应源码或额外证据。

使用 Perfetto 时，先通过帮助与数据源查询确认该设备支持的功能，再围绕一次可复现操作对齐应用、SF、CPU 调度与 FrameTimeline。官方 [FrameTimeline 指南](https://perfetto.dev/docs/data-sources/frametimeline)说明了应用与 SF 的 Expected/Actual 轨道及关联方式；需根据设备实际暴露的数据补充 GPU、fence 或驱动事件。

不要预设所有设备都提供同一组 tracepoint，也不要把 `dumpsys` 的某一瞬间状态当作整段帧时间线。

#### 12. 按问题阅读源码

推荐从接口契约进入，再分别阅读采样、分发、应用和缓冲区路径，避免逐行通读庞大的 `SurfaceFlinger.cpp`。

1. **谁在回调谁**：[Composer AIDL 接口](https://android.googlesource.com/platform/hardware/interfaces/+/refs/tags/android-16.0.0_r1/graphics/composer/aidl/android/hardware/graphics/composer3/)与 [`AidlComposerHal.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/DisplayHardware/AidlComposerHal.cpp)。分别标出服务对象和回调对象所在进程。
2. **时间样本来自哪里**：[`VSyncWorker.cpp`](https://android.googlesource.com/platform/external/drm_hwcomposer/+/refs/tags/android-16.0.0_r1/drm/VSyncWorker.cpp)与 [`DrmHwcThree.cpp`](https://android.googlesource.com/platform/external/drm_hwcomposer/+/refs/tags/android-16.0.0_r1/hwc3/DrmHwcThree.cpp)。区分真实等待、回退与回调开关。
3. **何时重新采样、何时唤醒**：[Scheduler 目录](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/Scheduler/)。分开追踪 `addResyncSample`、软件 dispatch 和 `onFrameSignal`。
4. **应用在哪条线程执行帧回调**：[`DisplayEventReceiver.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/gui/DisplayEventReceiver.cpp)、[`BitTube.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/gui/BitTube.cpp)与 [`Choreographer.java`](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-16.0.0_r1/core/java/android/view/Choreographer.java)。标出 Binder 控制通道和 socket 事件通道。
5. **buffer 如何提交和回收**：[`BLASTBufferQueue.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/libs/gui/BLASTBufferQueue.cpp)、[`SurfaceFlinger.cpp`](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/SurfaceFlinger.cpp)与 [CompositionEngine](https://android.googlesource.com/platform/frameworks/native/+/refs/tags/android-16.0.0_r1/services/surfaceflinger/CompositionEngine/src/)。分别记录 buffer 引用、帧标识和 acquire/release/present 依赖。

阅读完成后，应能解释：为什么硬件回调关闭后软件调度仍可工作，为什么应用 `doFrame()` 完成后还会迟到，以及为什么一个 present fence 不能代表所有显示相关工作都结束。

原始笔记：[原始笔记《SurfaceFlinger VSYNC 全链路与源码导读》](https://alidocs.dingtalk.com/i/nodes/1zknDm0WRardABEYczQQowE38BQEx5rG)。

</details>

## 10. Play Integrity：显示系统与安全检测有什么关系

### 先明确：公开结果不能反推出私有探测算法

**截至 2026-10-26，Google 官方资料未披露 Play Integrity 直接探测 SurfaceFlinger 的调用链。**

先把两类问题分开：

```mermaid
flowchart TB
  P[Play Integrity 返回结果] --> D[deviceIntegrity：设备完整性]
  P --> E[environmentDetails：额外环境信号]
  E --> A[appAccessRiskVerdict：捕获、控制、覆盖风险]
  E --> V[playProtectVerdict：Play Protect 状态与已知恶意软件结果]
  D --> X[不是某个 SF 检测项的逐项报告]
  A --> Y[不是图层列表或 SurfaceFlinger 调用日志]
```

设备完整性与屏幕访问风险是不同字段。**缺少某个设备标签，不能单凭结果定位为 SurfaceFlinger 异常。** 官方字段含义见 [Integrity verdicts](https://developer.android.com/google/play/integrity/verdicts)。

### 为什么屏幕安全会涉及 SurfaceFlinger 这条管线

下面画的是 **Android 显示与捕获的职责关系**，不是 Google 的私有采集流程：

```mermaid
flowchart TB
  A[App 窗口内容] --> S[SurfaceFlinger 与系统显示管线]
  O[获准显示的覆盖窗口] --> S
  S --> P[物理显示输出：用户看到画面]
  M[用户授权的 MediaProjection 会话] --> V[建立虚拟显示与捕获输出]
  S -->|按捕获范围及安全策略组织内容| V
  V --> U[应用提供的 Surface]
  U --> R[录制、投屏或图像消费]
```

- **覆盖**：额外窗口可能挡住或伪装界面，最终会影响用户看到的合成画面。
- **捕获**：MediaProjection 可将屏幕或指定 App 内容输出到虚拟显示关联的 Surface；能捕获哪些内容仍受授权和系统安全策略约束。
- **控制**：还涉及输入与辅助功能等机制，不能只用 SF 图层解释。

这是理解风险的背景。**存在显示管线关联，不等于已证明 Play Integrity 通过查询 SF 收集该风险。** 捕获架构见 [Media projection](https://developer.android.com/media/grow/media-projection)。

### 官方可确认的检查与决策流程

```mermaid
sequenceDiagram
  participant App as 业务 App
  participant PI as Play Integrity 客户端能力
  participant Back as 业务后端
  participant Google as Google Play 服务端
  App->>PI: 预热后，携带 requestHash 请求 token
  PI-->>App: 返回签名且加密的 token
  App->>Back: 提交业务请求与 token
  Back->>Google: 请求解密并验证 token
  Google-->>Back: 返回可核对的结果字段
  Back->>Back: 核对请求绑定、时效，再按风险制定策略
  Back-->>App: 返回业务处理结果
```

**可信判断在后端完成**，而不是让客户端自行上报“SF 正常”。标准请求流程见 [Make a standard API request](https://developer.android.com/google/play/integrity/standard)。

理解屏幕相关风险时，只记住这些边界：

- `CAPTURING`、`OVERLAYS`、`CONTROLLING` 描述运行中应用具备的相应访问风险，不是某次具体操作的取证结论。
- `KNOWN_` / `UNKNOWN_` 主要区分安装来源，不等于安全 / 恶意；跨用户配置文件还有特殊规则。
- 空结果可能表示未评估，不能当作检测通过；经 Google 特别审核的辅助功能服务也有排除规则。

**要证明某版本确实检测 SF，必须补充能关联到该版本与调用的证据。** 单独一条风险标签、一次 Binder 调用或“检测未通过”，都不能确定调用的目的及最终决策依据。以上边界依据 [Google 官方结果解释](https://developer.android.com/google/play/integrity/verdicts#environment-details-field)。
