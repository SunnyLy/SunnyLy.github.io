# Sunny / 技术手记

面向手机与桌面浏览器的中文技术知识库。使用 Markdown 编写笔记，由 VitePress 生成独立 HTML，通过 GitHub Pages 提供访问，无需个人域名或阅读账号。

## 阅读与交互

知识库提供分类导航、中文标题和正文搜索、明暗主题、代码复制和文章目录。普通 Markdown 图片与正文 HTML 图片可点击查看大图，Mermaid 围栏生成可缩放、拖动的流程图。手机上使用顶部菜单打开分类；搜索可通过页面按钮打开。

旧博客通过首页历史入口访问。原文章、相册、Android App Links 和安装入口继续使用原路径；旧站已有的外链头像、缺失搜索数据等缺陷不代表新知识库功能。

## 本地开发

安装 Node.js 24，在仓库根目录执行：

```sh
npm ci
npm run docs:dev
```

Windows PowerShell 若阻止运行 `npm.ps1`，使用 `npm.cmd` 执行相同命令，无需调整系统执行策略。

终端会显示本地地址。正式预览必须先构建：

```sh
npm test
npm run docs:build
npm run docs:preview
git diff --check
```

测试验证旧文件保留、路径边界和碰撞拒绝；构建生成静态页面、复制旧站白名单并验证文件哈希与新页面资源。`docs:preview` 用于检查生产产物中的直接文章链接、刷新、导航与搜索。

## 添加知识笔记

在 `docs/` 对应分类目录新增 Markdown 文件，并在 `docs/.vitepress/navigation.ts` 的 `knowledgeSections` 中登记入口。分类、导航和首页入口以此配置为准。标题描述具体问题；正文说明适用范围、原理、步骤、验证与参考资料，区分示例和已验证结论。

新图片放在 `docs/public/`，使用以 `/` 开头的站点路径引用。为图片填写有意义的替代文字，为流程图补充文字说明：

````md
![运行时组件关系](/media/example.svg)

```mermaid
flowchart LR
  Read[阅读笔记] --> Verify[验证理解]
```
````

仅引用实际存在的图片；示例路径须替换为你添加的资源。长代码和表格应局部滚动。修改后检查手机窄屏、暗色主题、搜索命中、图片放大和图示查看。

## GitHub Pages

发布配置位于 `.github/workflows/deploy.yml`。在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**，站点使用 `https://sunnyly.github.io/` 根路径。无需配置过期域名或 `CNAME`。

工作流在 `master` 的 push 或手动触发时构建并发布，PR 仅执行测试和构建。发布产物来自 `docs/.vitepress/dist`；旧资源由 `scripts/copy-legacy.mjs` 的固定白名单保留，不直接发布仓库源码。调整旧站保留范围时修改白名单并运行测试。

站点发布到 `https://sunnyly.github.io/`。推送到 `master` 后，在仓库 Actions 中检查构建和部署结果，再核对首页、笔记直链、搜索与附件下载。实际手机触控效果仍需真机验证。
