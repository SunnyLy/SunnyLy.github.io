# Android 安全知识体系产品规划

> 分类修订：用户要求完全按原提纲排列。当前前台分类为通用组件安全、配置安全、文件操作、特殊函数、Dos攻击；左侧导航与概览逐项遵循原顺序。`docs/.vitepress/android-security-outline.ts` 是导航层级与段落 ID 的依据。以下基础、工程、审计方案保留为旧规划记录，不再用于前台分类；已核验的详细正文和链接继续保留。

## 范围与编辑原则

依据 [来源基线](android-security-source.md) 的正文段落标识建立完整映射。来源中的标题、原理、条件和防护建议均作为待核验素材，收录不代表认可原结论。当前只规划文章，不修改导航或内容，不执行发布。

安全分类沿用现有 `knowledgeSections`，新增内容按基础、工程、审计分组；文章路径固定为 `/security/android/<层级英文>/<slug>.html`，源码对应 `docs/security/android/<层级英文>/<slug>.md`。分类与文章数后续从导航配置派生，不在首页另维护数字。

每篇必须形成完整学习单元：具体问题、适用条件、机制解释、正反例、检查方法、错误结论纠正、验证边界和官方参考。不能只把来源条目改成同名短清单。示例标明教学用途，设备、日志、漏洞结论只能来自真实验证。

## 分层文章目录

下表定义文章标识与固定 slug；覆盖表逐段引用该 slug。基础侧重理解边界，工程侧重落实防护，审计侧重以证据判断成立条件。

| 标识 | 层级 | slug | 文章题目与学习结果 |
| --- | --- | --- | --- |
| A01 | 基础 foundation | `security-model` | Android 安全模型与权限边界：理解 UID、沙箱、导出组件、调用者与授权策略，区分应用与平台权限。 |
| A02 | 基础 foundation | `activity-intent` | Activity、Intent 与深链信任边界：分析接收、转发、任务栈、Scheme 与 URI 授权的完整数据流。 |
| A03 | 基础 foundation | `broadcast` | 广播收发与暴露面：区分静态、动态、发送者限制和接收者限制，识别敏感广播及粘性广播风险。 |
| A04 | 基础 foundation | `service-ipc` | Service 与 IPC 身份鉴别：理解绑定、启动、AIDL、Messenger、前台服务和调用者校验。 |
| A05 | 基础 foundation | `provider` | ContentProvider 访问模型：理解 authority、路径权限、MIME 查询、URI 授权与安装冲突的边界。 |
| A06 | 工程 engineering | `file-sharing` | 文件边界与 FileProvider：限制共享目录、处理不可信 content URI、检查路径规范化与真实访问结果。 |
| A07 | 工程 engineering | `uri-sql-input` | URI、查询参数与 SQL 输入：区分解析、解码、路径分段和数据库参数化，各自建立允许规则。 |
| A08 | 工程 engineering | `release-hardening` | 发布配置与包体审查：检查 debuggable、备份策略、元数据、隐藏入口、混淆与非预期文件。 |
| A09 | 工程 engineering | `data-lifecycle` | 敏感数据全生命周期：覆盖账户/设备关联、备份恢复、退出/卸载后残留与剪贴板使用。 |
| A10 | 工程 engineering | `untrusted-files` | 不可信文件、图片与压缩包：为上传下载、缓存、解码和解压建立尺寸、路径及资源约束。 |
| A11 | 工程 engineering | `injection-serialization` | 命令、表达式与序列化边界：区分代码与数据，限制解析能力，理解 Base64 不提供安全保证。 |
| A12 | 审计 audit | `runtime-code-trust` | 动态代码与可信执行文件：验证插件来源与完整性；在明确平台前提后讨论 TA 的信任链。 |
| A13 | 审计 audit | `availability-binder` | 可用性与 Binder 数据预算：以输入规模、并发和调用链解释崩溃、拒绝服务及包信息查询失败。 |
| A14 | 审计 audit | `ui-legacy-input` | 输入界面与历史框架风险：审视键盘、剪贴板关联风险、PreferenceActivity 与文本索引边界。 |
| A15 | 审计 audit | `location-risk` | 模拟位置与位置业务风控：区分位置可信度、可用检测信号和服务端业务约束，说明漏报误报。 |

建议先完成基础主线，再按工程主题补齐防护，最后阅读审计主题。工程文章回链对应基础机制；审计文章必须说明威胁模型、成立条件、反例和证据需求。

## 原始段落完整覆盖

表中每行对应来源的一个正文 ID，说明性段落不合并丢弃。主归属唯一，其他文章可以交叉链接。路径以目录表中的层级和本表 slug 拼接；“待核验”内容在正文完成官方查证或明确保留未决，不能静默省略。

| 来源 ID | 原主题或说明要点 | 层级 | 主文章 slug | 编写要求 |
| --- | --- | --- | --- | --- |
| S3 | 通用组件安全 | 基础 | `security-model` | 建立入口、身份、能力与资源的通用检查模型。 |
| S6 | Activity | 基础 | `activity-intent` | 说明生命周期入口与跨组件输入。 |
| S9 | 权限与属性设置 | 基础 | `security-model` | 区分 Manifest 声明、授予与运行时判断。 |
| S12 | 组件暴露 | 基础 | `security-model` | exported 与权限共同决定可达性，注明适用条件。 |
| S15 | Intent 接收和发送 | 基础 | `activity-intent` | 分开检查入站和出站信任边界。 |
| S18 | Scheme URL、intent-based URI | 基础 | `activity-intent` | 解析、目标校验及深链验证，不把 Scheme 当身份。 |
| S21 | 安全键盘配置 | 审计 | `ui-legacy-input` | 先定义具体配置与攻击前提，不能把键盘类型单独判漏洞。 |
| S24 | BroadcastReceiver | 基础 | `broadcast` | 建立广播身份与敏感数据流模型。 |
| S27 | 动态广播暴露 | 基础 | `broadcast` | 按注册方式和版本检查导出与权限。 |
| S30 | 静态广播暴露 | 基础 | `broadcast` | 检查 Manifest、发送者约束和可达性。 |
| S33 | Receiver 嗅探 | 基础 | `broadcast` | 核对谁能收到广播及敏感内容。 |
| S36 | 粘性广播敏感数据 | 基础 | `broadcast` | 解释敏感信息滞留与 API 状态，不仅给禁止口号。 |
| S39 | Service | 基础 | `service-ipc` | 区分启动与绑定。 |
| S42 | Service 暴露 | 基础 | `service-ipc` | 校验入口权限和方法级授权。 |
| S45 | Service 劫持 | 基础 | `service-ipc` | 限定隐式解析、服务身份及适用平台行为。 |
| S48 | AIDL 接口 | 基础 | `service-ipc` | 方法级调用者、线程与数据校验。 |
| S51 | Messenger 服务 | 基础 | `service-ipc` | 消息载荷与调用者身份不能相互替代。 |
| S54 | 前台服务 | 基础 | `service-ipc` | 前台状态不等于可信身份；平台限制另列条件。 |
| S57 | ContenetProvider | 基础 | `provider` | 规范为 ContentProvider，保留来源 ID。 |
| S60 | Provider 暴露 | 基础 | `provider` | 区分读写、导出、路径和临时授权。 |
| S63 | Provider 目录遍历 | 工程 | `file-sharing` | 用实际文件边界验证路径处理。 |
| S66 | uriPath 权限控制 | 基础 | `provider` | 规范为 URI 路径与 path-permission，核对具体语义。 |
| S69 | SQL 注入 | 工程 | `uri-sql-input` | 参数化值与允许列表标识符分开说明。 |
| S72 | 隐式 Intent 授 URI 权限 | 基础 | `provider` | 解释目标选择与最小授权，不能直接等同必然漏洞。 |
| S75 | getType 方法 | 基础 | `provider` | 分开 MIME 元数据和资源访问。 |
| S78 | getType 无导出/权限也返回 | 基础 | `provider` | 保留原理，补充默认行为与新版匿名类型接口差异。 |
| S81 | 空或未定义 URI | 基础 | `provider` | 区分 null 与不支持路径，不能预设均可成功攻击。 |
| S84 | authority 劫持 | 基础 | `provider` | 区分冲突拒装、安装顺序与业务错误信任。 |
| S87 | authority 唯一与抢先安装原理 | 基础 | `provider` | 完整保留前提，核验多用户、签名及平台范围。 |
| S90 | FileProvider 共享目录 | 工程 | `file-sharing` | 说明目录选择与 URI 授权结合后的风险。 |
| S93 | 过大目录扩大攻击面 | 工程 | `file-sharing` | 展开泄露/覆盖需满足的条件。 |
| S96 | 禁 root/files/cache，路径最小化 | 工程 | `file-sharing` | 纠正 files-path/cache-path 一刀切禁用；保留最小范围原则。 |
| S99 | 配置安全 | 基础 | `security-model` | 作为发布配置与权限策略的总览入口。 |
| S102 | 只申请必要权限 | 基础 | `security-model` | 以业务能力解释最小权限。 |
| S105 | 应用 UID 权限 | 基础 | `security-model` | 区分 UID 身份、权限和进程。 |
| S108 | 不同应用不共享 UID | 基础 | `security-model` | 纠正原“不同越塔”笔误，解释 sharedUserId 兼容/弃用背景。 |
| S111 | reboot 权限 | 基础 | `security-model` | 核验权限保护等级和普通应用可获授权的边界。 |
| S114 | release 禁 debug 与备份 | 工程 | `release-hardening` | 分别处理调试和按敏感性配置的备份策略。 |
| S117 | signature/signatureOrSystem | 基础 | `security-model` | 使用 protectionLevel 正名；纠正弃用等级推荐。 |
| S120 | 私有组件禁 taskAffinity/launchMode | 基础 | `activity-intent` | 不能一刀切；结合任务栈机制与平台修复讨论。 |
| S123 | 自定义权限系统命名空间 | 基础 | `security-model` | 规范命名与碰撞风险，核对平台保留语义。 |
| S126 | 导出组件需访问权限 | 基础 | `security-model` | 公开业务入口需按威胁模型授权，并非所有入口必须同一权限。 |
| S129 | APK 暗码/隐藏入口 | 工程 | `release-hardening` | 定义非预期调试或控制入口，不把“暗码”作为 API 名称。 |
| S132 | meta-data 敏感数据 | 工程 | `release-hardening` | 说明包体元数据可见性与服务端密钥边界。 |
| S135 | 状态与设备或账户关联 | 工程 | `data-lifecycle` | 按业务风险选关联与恢复策略，不强制永久设备绑定。 |
| S138 | 卸载后残留 | 工程 | `data-lifecycle` | 区分应用私有数据、共享文件、备份及其他持有方。 |
| S141 | 头像缓存大小和有效性 | 工程 | `untrusted-files` | 内容、尺寸、路径与可用性校验。 |
| S144 | META-INF 内 apk/odex/so | 工程 | `release-hardening` | 按包用途和加载链核验非预期文件，不按扩展名认定敏感。 |
| S147 | 剪贴板 | 工程 | `data-lifecycle` | 说明敏感性、存续与平台限制。 |
| S150 | 混淆规则增强 | 工程 | `release-hardening` | 说明混淆价值与不能替代授权的边界。 |
| S153 | 模拟位置 | 审计 | `location-risk` | 区分模拟标记与位置真实性。 |
| S156 | 检测开发者选项/模拟应用 | 审计 | `location-risk` | 不把开发者选项开启等同攻击，核对信号可得性。 |
| S159 | 插件动态加载 | 审计 | `runtime-code-trust` | 代码来源、完整性、存储与执行权限。 |
| S162 | 文件操作 | 工程 | `file-sharing` | 作为文件读写、外部 URI 与边界验证总览。 |
| S165 | 文件上传 | 工程 | `untrusted-files` | 元信息不等于真实内容，客户端与服务端共同约束。 |
| S168 | 文件下载 | 工程 | `untrusted-files` | 来源、落地位置、完整性及后续打开处理。 |
| S171 | 文件读写 | 工程 | `file-sharing` | 最小权限、原子性、路径与竞争条件。 |
| S174 | BitmapFactory 导致 OOM | 工程 | `untrusted-files` | 解码前约束尺寸、像素和内存预算，异常处理不能替代预算。 |
| S177 | 特殊函数 | 工程 | `injection-serialization` | 作为危险能力/不可信输入分类入口，回链专项文章。 |
| S180 | 命令执行 | 工程 | `injection-serialization` | 避免拼接与解释器注入，限定外部输入。 |
| S183 | 解压 | 工程 | `untrusted-files` | 路径逃逸、总量、条目数与解压资源约束。 |
| S186 | getPathSegments | 工程 | `uri-sql-input` | 解析不等于校验，核对解码语义与索引边界。 |
| S189 | 序列化 | 工程 | `injection-serialization` | 明确具体格式、对象能力与信任域。 |
| S192 | JEXL 表达式注入 | 工程 | `injection-serialization` | 按实际库版本核验执行能力，不预设本站依赖。 |
| S195 | TA 文件 | 审计 | `runtime-code-trust` | 仅标题，保留条件性解释，不能认定具体平台或加载方式。 |
| S198 | DoS | 审计 | `availability-binder` | 区分异常、资源耗尽与可重复触发的安全影响。 |
| S201 | Intent.setPackage | 基础 | `activity-intent` | 限定包不替代输入校验与业务授权。 |
| S204 | uri.getQueryParameter | 工程 | `uri-sql-input` | 检查缺失、多值、编码与后续使用。 |
| S207 | PreferenceActivity Fragment 注入 | 审计 | `ui-legacy-input` | 更正拼写，限定遗留框架与校验机制，不扩展到所有 Fragment。 |
| S210 | Base64.decode | 工程 | `injection-serialization` | 处理格式与资源约束；编码不是加密或真实性证明。 |
| S213 | 带 Flags 的 Intent 启动 | 基础 | `activity-intent` | 形成授予能力与可控数据的完整分析链。 |
| S216 | read/write 授权与 add/setFlags 条件 | 基础 | `activity-intent` | 保留为原条件，扩查其他授权标记与 bitmask 组合。 |
| S219 | URI 外部可控条件 | 基础 | `activity-intent` | 结合目标、接收方与授权范围验证，单项不判漏洞。 |
| S222 | getContentResolver | 工程 | `file-sharing` | 访问不可信 Provider 的 URI、返回内容与流生命周期。 |
| S225 | 上述 URI 风险说明 | 工程 | `file-sharing` | 显式保留说明，回链 Intent 与 Provider 权限模型。 |
| S228 | EditText.setSelection | 审计 | `ui-legacy-input` | 解释索引与文本真实长度不匹配。 |
| S231 | 外部文本加 maxlen 条件 | 审计 | `ui-legacy-input` | 规范 maxLength 术语，验证过滤后长度，不能当充分必要条件。 |
| S234 | getPackegeInfo | 审计 | `availability-binder` | 规范为 getPackageInfo，区分返回字段、查询与 IPC。 |
| S237 | Binder 1M、flag=0 与非0 catch 说明 | 审计 | `availability-binder` | 纠正单次阈值与 blanket catch，核验包查询参数真实语义。 |
| S240 | URLDecoder.decode | 工程 | `uri-sql-input` | 区分表单解码与 URI 编码，防止重复解码与异常遗漏。 |

## 必须纠正与待确认的说法

- **已确认须纠正**：S96 的 `files-path`、`cache-path` 不应整体禁用；官方示例允许受限子目录。保留禁用过宽共享根路径与最小授权原则。[FileProvider 官方风险说明](https://developer.android.com/privacy-and-security/risks/file-providers)
- **已确认须纠正**：S117 的推荐不能包含已弃用的 `signatureOrSystem`；保护等级按信任关系选择，不是自定义权限统一强制一个等级。[permission 官方定义](https://developer.android.com/guide/topics/manifest/permission-element)
- **已确认须分开解释**：S114 调试与备份不是同一类检查。备份策略结合敏感内容、恢复需求及云备份/设备迁移规则，不写“release 一律禁止备份”。[application 官方定义](https://developer.android.com/guide/topics/manifest/application-element)
- **已确认须加条件**：S78 默认 MIME 查询确有特殊权限行为；不能跨版本绝对化，需说明 `getTypeAnonymous` 及 MIME 元数据泄露与读取文件的区别。[ContentProvider 官方定义](https://developer.android.com/reference/android/content/ContentProvider)
- **已确认须纠正**：S237 不是每笔事务都拥有独立固定上限，进程中并行事务共享缓冲预算；减少数据体积与复杂度不能被“所有非零 flag 加 catch”替代。[TransactionTooLargeException 官方说明](https://developer.android.com/reference/android/os/TransactionTooLargeException)
- **待专项核验**：S87 authority 抢注成立条件、S120 任务栈“一律禁止”、S144 指定扩展名“一律敏感”、S156 开发者选项检测、S231 setSelection 触发条件及 S237 flag=0 返回内容，均不得直接照抄成事实。
- **TA 语义未确认**：S195 只有标题。正文必须写明“若此处 TA 指 Trusted Application”，再限定平台/OEM/TEE 范围，区分普通 App 与可信应用加载链；不能声称普通 App 直接加载 TA，不能虚构设备。先对照 [AOSP Trusty](https://source.android.com/docs/security/features/trusty)，不以此反推来源作者必然所指。

## 阅读体验与内容验收

- 安全首页用简洁的分层路径展示学习目标；左侧导航按基础、工程、审计折叠分组，使用现有导航 `group` 字段，不新增一级类别。首页只显示实际完成文章。
- 正文保持清晰标题与舒适宽度，每篇用具体问题开篇；长参数或版本表格局部横滚。手机优先显示正文，可打开分类和本文目录，不做覆盖内容的常驻大卡片。
- 搜索收录正文和规范术语；易错原称谓如 `ContenetProvider`、`getPackegeInfo` 在纠错说明中保留一次，支持旧笔记关键词检索，不用错拼写作标题。
- 每篇至少有能帮助理解的机制或决策图，复杂交互用时序图；复用本站 Mermaid 查看器的缩放、拖动与全屏，不重复堆放装饰图。图中的关键结论在文字里同样说明。
- 文章把平台范围、targetSdk/依赖前提、未经验证的情形写清楚；原说明性段落必须有对应章节。核对本表 ID 与实际文章覆盖，不以文章数量替代覆盖验证。
- 完稿需检查官方引用、导航与搜索、Markdown/HTML 图片、图示渲染与手机窄屏；构建、端到端证据与覆盖检查通过后方可进入用户审阅。本轮没有发布授权，不执行推送、部署或远端配置更改。
