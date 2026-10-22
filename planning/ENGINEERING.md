# 知识库技术设计

## 架构与目录

保留原始静态站文件，新增 `docs/` Markdown 源码，以 VitePress 静态生成 HTML，部署入口为 `https://sunnyly.github.io/`，`base: '/'`。保留默认 `.html` 路由，文章可直接打开、刷新、分享，无后端服务。现有 `AGENTS.md` 不修改。

- `docs/.vitepress/config.ts`：站点、中文搜索、Markdown 扩展、默认主题配置。
- `docs/.vitepress/navigation.ts`：导出 `knowledgeSections`，统一 Android / 安全 / 逆向 / 工具的标题、路径与文章条目。左侧分类、首页卡片和入口数量由其生成，文档引用名称而不维护重复数字。
- `docs/.vitepress/theme/`：扩展默认主题、视觉样式、`MermaidDiagram.vue`、共享 `MediaViewer.vue`。
- `docs/public/`：知识库使用的新图片和 favicon；内容页位于 `docs/android/`、`security/`、`reverse/`、`tools/`。
- `scripts/copy-legacy.mjs`：构建后拷贝旧站白名单；`.github/workflows/deploy.yml` 构建并发布产物。

## 依赖与构建

注册表实查候选版本为 VitePress `1.6.4`、Mermaid `12.2.0`、Vue `3.5.44`；实施前核对依赖要求、实际 Node 环境与锁文件，安装后的类型定义和源码为 API 判断依据。选择稳定 VitePress，不使用默认官网展示的 2.x alpha API。精确版本写入 manifest 与 lockfile，CI 使用 `npm ci`。

提供 `docs:dev`、`docs:build`、`docs:preview`。`docs:build` 先生成 `docs/.vitepress/dist`，成功后运行旧站拷贝脚本。`docs/.vitepress/dist`、cache、node_modules 加入忽略规则，不提交生成文件。

## 导航、阅读与搜索

沿用默认主题的语义导航、可折叠左侧分类、移动端目录抽屉、右侧页内目录、标题锚点和代码复制；用自定义 CSS 与首页组件统一字体、间距、强调色和明暗配色。导航路径统一来自 `knowledgeSections`。长代码与表格在局部容器滚动，正文不产生横向滚动，移动端搜索入口始终可达。

启用 MiniSearch 本地全文索引，不引入托管检索账号。稳定版支持自定义 `miniSearch.options.tokenize`；实现确定性中英文 tokenizer，同一纯函数在构建端和浏览器执行，避免 Node 与手机分词差异。按拉丁字母/数字词与中文相邻字组合生成检索词，覆盖中文片段和 Android、Binder 等混合查询。验收真实标题、正文、中文片段、英文大小写及无结果状态；结果落到对应章节。搜索只索引新知识库，旧站通过保留入口进入。

## 图片与流程图

Markdown 图片及正文原生 `<img>` 使用共享图片查看器，默认限制正文宽度并保持比例。委托监听只作用于 `.vp-doc` 的内容图片，保留显式链接、下载和 `data-no-zoom` 的语义；图片获得可访问名称与键盘打开能力。弹层展示 `currentSrc` 和 alt/说明，使用原生 `dialog`，包含关闭与缩放按钮，支持 Escape、背景关闭、焦点恢复和触控操作。无 dialog 支持时打开原图片地址；图片加载失败显示替代说明。

Markdown `mermaid` 围栏由扩展生成安全编码的组件属性，不把笔记源码直接拼成 HTML。SSR 输出带说明的源码占位，客户端挂载后按需动态导入 Mermaid，`startOnLoad: false`、`securityLevel: 'strict'`，不启用图中脚本或回调。组件只注入 Mermaid 渲染得到的 SVG。源代码保留在折叠区，加载失败或语法错误显示可读错误与源码，不能使整页崩溃。

流程图提供查看/缩放入口，打开共享 SVG 查看器后支持按钮放大缩小、鼠标滚轮缩放、指针拖动、双指缩放、复位及全屏。缩放以指针中心为基点并设上下界，拖动只在查看器内消费事件，避免阻断正文滚动。全屏优先 Fullscreen API，移动 Safari 或拒绝权限时使用视口内全屏 dialog，不影响缩放。无 JavaScript 时正文和图片正常可读，流程图至少显示原始文本，不声称交互仍可用。

## 生命周期、并发与主题

浏览器 DOM、dialog、Pointer Events 与 Mermaid import 仅在挂载后使用，避免 SSR 崩溃。监听路由路径变化关闭查看器并清理对象；采用 Vue `watch` 与 `nextTick` 对新正文图片补充交互，卸载撤销监听和 pointer capture。所有监听只注册一次，不覆盖主题已有路由回调。

Mermaid 渲染统一排队，每次分配唯一渲染 ID，避免多个组件共享 Mermaid 全局配置竞态。组件使用递增任务标记，路由离开/主题切换后丢弃旧异步结果；图片查看器保存进入前焦点，若原节点已卸载则恢复到文章标题或主内容。明暗切换触发当前图重渲染，保持 strict 安全配置，打开的流程图查看器同步更新 SVG 并复位，防止显示过期图。

## 旧站兼容与发布

拷贝算法只接受固定白名单，拒绝符号链接和产物路径冲突，不递归复制仓库根目录。白名单目录为 `.well-known/`、`2019/`、`archives/`、`css/`、`fancybox/`、`fonts/`、`images/`、`img/`、`js/`、`photoes/`、`test/`；文件为 `tyinstall.html`、`main.0cf68a.css`、`main.0cf68a.js`、`mobile.992cbe.js`、`slider.e37972.js`。旧 `index.html` 单独复制到 `/legacy/index.html`，首页提供历史博客入口。旧站内根 `/` 返回新知识库，其他旧页面地址与资源不变。

脚本验证源路径位于仓库、目标位于 dist；已存在目标时构建失败，不能静默覆盖知识库。白名单只从这一脚本维护；测试从脚本导出配置验证，不在多份文件复制数字。`AGENTS.md`、planning、新源码、`.git`、依赖目录和 CNAME 均不发布。

Actions 只在核实默认分支的 push 或手动触发时发布，PR 只构建。官方 Pages action 版本实施时查文档；按官方所需权限上传 `docs/.vitepress/dist` 产物并发布到 GitHub Pages environment，限制并发部署。远端 Pages 设置需选择 GitHub Actions；本任务准备 workflow 和本地验证，不执行 push/部署或改远端设置。

## 验收与故障边界

构建必须通过断链检查，检查产物中包含原 `assetlinks.json` 和旧页面，且原文件哈希不变。通过真实静态产物服务器验证新 `.html` 深链刷新、旧 URL、全部导航与本地搜索。浏览器检查手机窄屏和桌面、浅色/深色、Markdown/HTML 图片、多个图及无效图、关闭焦点、拖动/缩放/复位/全屏、切换路由后重复打开；检查 console 与失败网络请求。触控双指若工具不能模拟，记录未验证并提供按钮方式。

## 已核对的官方资料

- [VitePress 1.x 搜索配置](https://vuejs.github.io/vitepress/v1/reference/default-theme-search)
- [VitePress 1.x Runtime API](https://vuejs.github.io/vitepress/v1/reference/runtime-api)
- [VitePress 1.x 部署](https://vuejs.github.io/vitepress/v1/guide/deploy)
- [Mermaid usage](https://mermaid.js.org/config/usage)
- [Mermaid 安全配置](https://mermaid.js.org/config/schema-docs/config.html)
