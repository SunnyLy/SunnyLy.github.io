---
description: 从 Messenger 两种构造方式到 Service 绑定与双向消息，解释 Binder 接收、Handler 排队、调用身份及可靠性边界。
outline: [2, 3]
---

# Messenger 机制

Messenger 把一个 Handler 包装为可跨进程传递的消息端点：客户端通过 Binder 发送 Message，服务端再把它交给目标 Handler。它适合消息种类较少、希望在同一 Looper 串行处理的 IPC；复杂强类型协议或并发接口可考虑直接使用 AIDL。

本文按[原始基础提纲](https://alidocs.dingtalk.com/i/nodes/1OQX0akWmxaRZD7yfgRMaeOX8GlDd3mE)的“两种构造方法、通信四步”展开，并补充回复协议、身份与生命周期。源码基线为 **`android-16.0.0_r1`**，应用示例使用公开 SDK，未编译或真机验证。[官方绑定服务指南](https://developer.android.com/develop/background-work/services/bound-services)

## 轻量级跨进程通信

Messenger 的底层接口是隐藏的 `IMessenger` AIDL，`send(Message)` 定义为 `oneway`。远端调用无需等待 Handler 完成业务；本地直调没有远程 oneway 语义，但仍通过 Handler 入队，把业务延后到目标 Looper。[IMessenger.aidl](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/os/IMessenger.aidl)

```mermaid
sequenceDiagram
  participant C as 客户端业务
  participant M as 客户端 Messenger
  participant B as 服务端 Binder 入口
  participant Q as 服务端 MessageQueue
  participant H as 服务端 Handler
  participant R as 客户端回复 Handler
  C->>M: send(request, replyTo)
  M->>B: IMessenger.send 的远端 oneway 事务
  B->>B: 记录 sendingUid
  B->>Q: Handler.sendMessage
  Note over M,H: send 返回不代表业务完成
  Q->>H: Looper 分发消息
  H->>H: 验证身份、参数并处理
  H->>R: 通过 replyTo 发回 response
  R->>C: 按 request_id 匹配结果
```

图中回复同样经过 Binder 与客户端队列，箭头合并展示了该路径。耗时工作若转交线程池，完成顺序可能变化，需用请求标识匹配；同一 Looper 串行回调也不等于整个应用无需同步。

## 两个关键构造方法

### Messenger(Handler target)

服务端先创建 Handler，再创建 Messenger。框架内部取得该 Handler 对应的 `IMessenger` 实现，因而多个指向同一 Handler 的 Messenger 可共享同一通信端点。[Messenger API](https://developer.android.com/reference/android/os/Messenger)

原笔记引用的两个构造方法在基线中仍具有以下关系，下面仅作调用关系摘要：

```text
Messenger(Handler) → Handler.getIMessenger() → MessengerImpl
Messenger(IBinder) → IMessenger.Stub.asInterface(IBinder)
Messenger.getBinder() → 底层 IMessenger.asBinder()
Messenger.send(Message) → 底层 IMessenger.send(Message)
```

`Handler.getIMessenger()` 缓存内部实现，`MessengerImpl` 继承 `IMessenger.Stub`；其 Binder 入口先记录 `Binder.getCallingUid()` 到 `Message.sendingUid`，再调用目标 Handler 的 `sendMessage()`。[Handler 内部实现](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/os/Handler.java)

`getIMessenger()`、`MessengerImpl` 和 `IMessenger` 是源码阅读入口，**不是普通应用可直接依赖的公开 SDK API**。应用只使用 `new Messenger(handler)` 等公开入口。[Messenger.java](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/os/Messenger.java)

### Messenger(IBinder target)

客户端从 `onServiceConnected()` 收到 `IBinder`，通过 `new Messenger(binder)` 构造发送端。内部 `asInterface()` 可能取得本地接口，也可能创建远程代理；不能把两条路径都说成必然创建 BinderProxy。

原提纲“onBind 返回 Messenger”需要改正：**`Service.onBind()` 的返回类型是 `IBinder`，应返回 `messenger.getBinder()`**；客户端拿到的也首先是 IBinder，再把它适配为 Messenger。[官方 Messenger 绑定流程](https://developer.android.com/develop/background-work/services/bound-services#Messenger)

## 通信四步

### 1. 服务端创建 Handler 与 Messenger

选择明确的 Looper；如果绑定主 Looper，收到的业务消息就在主线程处理。Service 并不自带工作线程。需要长任务时可使用受控后台执行器，保留串行协议状态并限制并发。

### 2. onBind 返回底层 IBinder

下面是**同应用、同 UID、远程进程**的教学服务骨架，最低 API 21，限定小字符串请求。它展示传输和回复边界，不是持久任务执行器。

```java
import android.app.Service;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.os.Messenger;
import android.os.Process;
import android.os.RemoteException;
import android.util.Log;

public final class NoteMessageService extends Service {
    public static final int REQUEST = 1;
    public static final int RESPONSE = 2;
    private static final int MAX_TEXT_CHARS = 256;
    private Handler incoming;
    private Messenger endpoint;

    @Override public void onCreate() {
        super.onCreate();
        incoming = new Handler(Looper.getMainLooper(), this::onMessage);
        endpoint = new Messenger(incoming);
    }

    @Override public IBinder onBind(Intent intent) {
        return endpoint.getBinder();
    }

    private boolean onMessage(Message request) {
        if (request.what != REQUEST || request.sendingUid != Process.myUid()) {
            return true;
        }
        try {
            Bundle data = request.getData();
            int id = data.getInt("request_id", -1);
            String text = data.getString("text");
            if (id < 0 || text == null || text.length() > MAX_TEXT_CHARS
                    || request.replyTo == null) return true;

            Message response = Message.obtain(null, RESPONSE);
            Bundle result = new Bundle();
            result.putInt("request_id", id);
            result.putInt("length", text.length());
            response.setData(result);
            request.replyTo.send(response);
        } catch (RemoteException e) {
            Log.w("NoteMessage", "Reply endpoint unavailable", e);
        } catch (RuntimeException e) {
            Log.w("NoteMessage", "Invalid message data", e);
        }
        return true;
    }

    @Override public void onDestroy() {
        incoming.removeCallbacksAndMessages(null);
        super.onDestroy();
    }
}
```

示例为包内 `NoteMessageService` 配置显式绑定；Manifest 中放在 `<application>` 内：

```xml
<service
    android:name=".NoteMessageService"
    android:exported="false"
    android:process=":notes" />
```

`:notes` 用于演示同一应用的独立进程，仍使用相同 UID。取消绑定和销毁期间也可能有在途消息，`onDestroy()` 的队列清理不是跨进程撤销已发事务的保证，客户端必须能处理没有回复的请求。

### 3. 客户端绑定并构造 Messenger

使用显式 Intent 绑定目标 Service；`bindService()` 是异步连接，请在 `onServiceConnected(ComponentName, IBinder)` 中执行 `remote = new Messenger(binder)`，成功后才允许发送。绑定返回 `true` 也不是业务接口已经可用。

客户端的连接状态应由一个线程管理，例如主线程，至少区分“未绑定、连接中、已连接、已关闭”。单独记录绑定尝试与清理责任，按生命周期调用 `unbindService()`；SDK 契约要求正常返回 `false` 或抛出 `SecurityException` 时也释放连接，不能只在返回 `true` 时安排清理。正常解绑不依赖 `onServiceDisconnected()` 回调来清理本地状态。系统报告断连时清空远端引用，重新连接策略应有次数和退避限制。[Context.bindService 返回与释放契约](https://developer.android.com/reference/android/content/Context#bindService(android.content.Intent,%20android.content.ServiceConnection,%20int))

这与连接登记前的参数错误不同：固定版本 `ContextImpl.bindServiceCommon()` 在 `conn == null` 或同时提供 Handler/Executor 时先抛 `IllegalArgumentException`，此时尚未取得 ServiceDispatcher。不能仅按异常类型统一决定解绑，因为隐式 Intent 等其他参数校验又可能发生在登记之后；应结合具体失败位置维护清理状态。[固定版本绑定入口](https://github.com/aosp-mirror/platform_frameworks_base/blob/android-16.0.0_r1/core/java/android/app/ContextImpl.java#L2201)

### 4. send 发送请求

以下片段置于已连接客户端的方法中，`remote` 来自连接回调，`replies` 是关联客户端回复 Handler 的 Messenger；示例请求编号 `7` 在实际协议中应按连接会话分配并避免冲突：

```java
Message request = Message.obtain(null, NoteMessageService.REQUEST);
Bundle data = new Bundle();
data.putInt("request_id", 7);
data.putString("text", "Binder 与 Handler");
request.setData(data);
request.replyTo = replies;
try {
    remote.send(request);
} catch (RemoteException e) {
    // 令本次请求失败，并使当前连接失效；由拥有者统一处理重连。
}
```

客户端回复 Handler 只接受预期响应类型，校验请求编号，匹配待完成请求并删除超时任务；这里的长度计算只是无副作用的教学业务。实际写操作重试需要幂等标识，不能把“超时未收到回复”等同于“服务端没有执行”。

## 数据协议与调用身份

### Message 字段如何约定

用 `what` 区分消息类型，`arg1/arg2` 携带简单整数，Bundle 传递有明确定义的字段，`replyTo` 提供回复端点。协议应约定版本、必填字段、大小上限、错误码、超时及是否允许重复请求。

跨进程不要把普通 Java 对象塞进 `obj`。官方对 Messenger 场景下 `Message.obj` 的类型有限制；自定义数据一般放入 Bundle，并在需要自定义 Parcelable 时正确配置 ClassLoader 和兼容性。大图片、文件内容用受控 URI 或文件描述符传递，避免用大 Bundle 代替文件协议。[Message 数据与 replyTo 契约](https://developer.android.com/reference/android/os/Message)

### sendingUid 与权限边界

`Message.sendingUid` 自 API 21 提供，在 Messenger 接收路径用于表达发送 UID。对真正的远程调用，框架在 Binder 入口记录身份后才入队；等到 Handler 回调时再调用 `Binder.getCallingUid()`，已经不能据此恢复原事务调用者。[sendingUid 官方说明](https://developer.android.com/reference/android/os/Message#sendingUid)

它并不是用户登录身份、包名或权限校验的替代品。同 UID 可能对应多进程或特定共享 UID 场景；本地直调还受当前 Binder 调用上下文影响。示例只允许同 UID，跨应用开放服务时必须额外设计 Manifest 权限、调用方授权、业务数据范围和请求频率限制。不要相信 Bundle 自报的 UID 或包名，也不要未经授权使用 `replyTo` 把敏感数据发往任意端点。

## 顺序、失败与适用边界

- **执行顺序**：目标 Looper 串行分发；多个发送者的竞争不等于业务全局有序，跨线程耗时处理也可能使回复乱序。
- **成功含义**：`send()` 没有报错不等于入队后必定执行或结果已经落盘。服务死亡、进程被终止、队列退出都需要业务超时与恢复策略。
- **资源边界**：单个消息要小，入口要限流，重复刷新可合并；Messenger 自身不提供应用级背压与持久队列。
- **生命周期**：Service 绑定不是可靠后台任务保证；请求超出组件生命周期时，应重新选择持久化与任务调度方案。
- **接口选择**：同进程可用普通 Binder 或直接调用；简单跨进程串行命令可用 Messenger；需要强类型、多方法和并发协议时再设计 AIDL。

复习 [Binder 通信机制](./binder-basics.html) 中的代理与实体关系，以及 [Handler 原理](./handler.html) 中的分发线程，就可以解释 Messenger 的完整路径，而不是只记住四个 API 调用。
