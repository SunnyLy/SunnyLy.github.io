# Android 安全资料核对

核对日期：2026-10-22。下列为官方资料支持的边界，最终文章仍需就具体论断就近引用。未进行 APK、真机或 TEE 运行验证。

## FileProvider

可用窄范围 files-path/cache-path；禁止的是过宽共享尤其root-path，不能一概禁止内部路径元素。

[官方来源](https://developer.android.com/privacy-and-security/risks/file-providers)

## ContentProvider.getType

默认MIME查询无需普通读写权限；API34 getTypeAnonymous可拆分公开MIME与受保护信息，不等于可任意读数据。

[官方来源](https://developer.android.google.cn/reference/android/content/ContentProvider)

## 备份

按OS及target控制fullBackupContent/dataExtractionRules，部分厂商D2D不受allowBackup=false完全限制。

[官方来源](https://developer.android.com/identity/data/autobackup)

## Binder

文档所述当前1MB为进程在途事务共享buffer，不是每个事务独享；失败也可能发生在响应，不能凭异常断言未执行。

[官方来源](https://developer.android.com/reference/android/os/TransactionTooLargeException)

## Uri

getPathSegments返回已解码路径片段；getQueryParameter返回首个键的解码值，缺失为null，opaque URI抛UnsupportedOperationException；重复参数需显式策略。

[官方来源](https://developer.android.com/reference/android/net/Uri)

## Base64

padding不正确可抛IllegalArgumentException，限制输入/输出体积；API不等于认证或加密。

[官方来源](https://developer.android.com/reference/android/util/Base64)

## URLDecoder

用于form-urlencoded，+转空格；应明确UTF-8，不将其当完整URL解析器。

[官方来源](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/net/URLDecoder.html)

## ZIP

逐entry验证canonical目标位于私有可信解压根下；此检查假设目标目录不受攻击者控制，另需配额/符号链接策略。

[官方来源](https://developer.android.com/privacy-and-security/risks/zip-path-traversal)

## Android14

OS14+且target34+动态广播导出标志有系统广播例外；动态加载只读要求；ZIP ..或绝对entry校验不取代其他配额和竞态防护。

[官方来源](https://developer.android.com/about/versions/14/behavior-changes-14)

## JEXL

官方滚动文档说明自 3.7 起默认 SECURE，旧版本默认可能不同；项目实际依赖版本需单独核对，不能把滚动链接视为固定发行版证据。RESTRICTED 或 SECURE 都不保证可安全执行任意不可信输入；首选不执行不可信表达式，确有需要时采用严格白名单、隔离与资源限制。

[官方来源](https://commons.apache.org/proper/commons-jexl/apidocs/org/apache/commons/jexl3/package-summary.html)

## TEE/TA

TA原纲只有标题，按Trusted Application解释需声明前提。Trusty只是TEE一种实现；普通APK不能随意部署TA。OEM签名/启动信任链和消息验证是不同责任。

[官方来源](https://source.android.com/docs/security/features/trusty)

