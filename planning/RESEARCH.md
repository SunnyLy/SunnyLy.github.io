# 技术知识库调研

调研日期：2026-10-22。采用官方文档、公开案例与浏览器实际页面观察，不声称存在统一的“最好”或市场占有率排名。

## 代表产品与可借鉴之处

| 对象 | 适合场景 | 本项目吸收的特点 |
| --- | --- | --- |
| [VitePress / Vue 文档](https://vuejs.github.io/vitepress/v1/guide/what-is-vitepress) | 开源技术文档、个人知识库 | 左侧树、正文、本文目录；Markdown 原稿；静态 HTML 首屏；本地搜索 |
| [Docusaurus](https://docusaurus.io/showcase) | 大型项目、多版本文档 | 清晰分类和当前项、文档之间连续阅读；公开 showcase 提供实际采用案例 |
| [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) | 工程手册、技术笔记 | 搜索高亮、代码复制、提示块、随主题变化的图示 |
| [GitBook](https://gitbook.com/docs/guides/docs-best-practices/documentation-structure-tips) | 产品指南与团队知识 | 按用户任务组织内容；三栏阅读；清晰标题和相关内容 |
| [Notion](https://www.notion.com/help/search) | 个人与团队笔记 | 侧栏组织、快捷键打开搜索、快速定位内容 |
| [Stripe Docs](https://docs.stripe.com/development) | 开发者任务与参考 | 任务入口明确、说明与可操作代码相邻、重视快速查阅 |

VitePress 官方列出 Vue、Vite、Pinia 等采用案例；Docusaurus 官方维护公开 showcase。以上是代表性和生态证据，不把 GitHub stars 等同于用户量。浏览器实际观察了 VitePress、Material for MkDocs、GitBook：共同采用安静背景、可辨识的左侧导航、窄于整屏的正文、独立章节目录。视觉观察不等同于对每款产品全部功能的测试。

## 共同规律与选择

- 导航和搜索互补：目录用于理解知识结构，全文搜索用于快速找具体问题。
- 文章优先：适度正文宽度、清晰层级、舒适行距；首页不能阻挡进入内容。
- 图示是知识的一部分：代码、提示、图片、流程图在同一篇文章内，保持文字解释。
- 手机上保留功能、折叠布局：分类变抽屉，目录可收起，宽代码和图在局部容器查看。
- 内容可链接和持续维护：独立文章 HTML、稳定 URL、Markdown 与版本控制。

采用 VitePress 稳定版作为基础，单独实现通用媒体查看器和 Mermaid 组件，不引入与个人知识库无关的 SaaS 编辑、账号体系、多版本切换或 AI 问答。

## 实现依据

- [稳定版主题搜索](https://vuejs.github.io/vitepress/v1/reference/default-theme-search)：本地全文索引，可配置 tokenize；中文分词必须同时用于建索引和查询。
- [稳定版部署](https://vuejs.github.io/vitepress/v1/guide/deploy)：GitHub Actions 发布构建产物；用户站点使用根路径。
- [MkDocs 图示](https://squidfunk.github.io/mkdocs-material/reference/diagrams/) 与 [图片](https://squidfunk.github.io/mkdocs-material/reference/images/)：图示主题一致、图片懒加载与灯箱是可借鉴的具体模式。
- [Mermaid API](https://mermaid.js.org/config/usage.html)：使用 render API；独立查看器负责缩放、拖动、触控和恢复焦点。

包元数据实查：VitePress latest 为 1.6.4，next 为 2.0.0-alpha.20；选择 latest。Mermaid 12.2.0 要求 Node >=22.12.0，本机实际 Node v24.11.1。安装后以锁文件和类型声明确认 API，不照抄 alpha 版功能。
