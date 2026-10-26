# Frida 笔记审查记录

四篇钉钉原文均通过已登录浏览器读取，整理为总览、安装、Java API、SELinux 诊断、Smali trace 五页。原文来源链接保留在总览。

## 已纠正

- `npm frida` 是 Node 绑定；CLI 由 `frida-tools` 提供，CLI 包版本与核心版本分开核对。
- `Java.enumerateMethods()` 使用查询字符串，返回按 ClassLoader 分组的元数据；原文的回调对象形式不成立。
- `Java.perform()` 负责 VM 接入与应用类加载时机，不代表主线程执行。
- SELinux 路径字符串修改不等于内核访问策略改变；单条状态转换错误不足以归因 ART 更新，不保留卸载系统 ART 的建议。
- Smali trace 的上游测试构建、解释执行依赖与 JIT/AOT 差异明确区分，没有扩大兼容性承诺。

## 独立评审

- API 评审：PASS，检查安装职责、Frida 17 bridge、枚举契约、ClassLoader、原方法单次调用与恢复、附件一致性、一手依据，未发现 P0/P1。
- 平台评审：PASS，检查 DAC/MAC、AVC、ART 错误归因、Smali 与 Native 轨迹、上游范围和示例边界，未发现 P0/P1。
- 依据：[Frida Java API](https://frida.re/docs/javascript-api/#java)、[17 发布说明](https://frida.re/news/2025/05/17/frida-17-0-0-released/)、[bridge 源码](https://github.com/frida/frida-java-bridge)、[AOSP SELinux](https://source.android.com/docs/security/features/selinux)、[ART JIT](https://source.android.com/docs/core/runtime/jit-compiler)、[上游追踪项目](https://github.com/SeeFlowerX/frida-smali-trace)。

## 验证

- 三个 Java 文件使用本机 Java 8 与 Android SDK 35 的 `android.jar` 编译通过；两个脚本通过 `node --check`。未进行 APK 打包、Frida 注入或设备运行。
- 附件为七个源码/说明文件的 ZIP；说明文件改为 README.txt，避免站点源码排除检查拒绝 README.md。
- 11 项自动测试通过；站点构建通过，62 个 HTML、54 个旧站文件哈希与源码排除检查通过。
- 五页在手机视口 DOM 检查中无页面横向溢出，六张 Mermaid 图无错误；Java 页面十处代码/图表源码块正确显示，目录锚点有效。总览图放大至 130% 并关闭成功，附件链接具备 download 属性；控制台未发现错误。
