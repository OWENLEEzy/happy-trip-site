# Happy Trip Site

> Turn rough travel notes into a mobile-first, shareable itinerary website.
> 把零散的旅行笔记，变成一个手机优先、可分享的行程网站。

**🌏 Live demo / 在线示例:** https://owenleezy.github.io/happy-trip-site/
(9-day Malaysia & Singapore itinerary / 9 天马来西亚 + 新加坡行程, in [`docs/`](docs/))

**Language / 语言:** [English](#english) ・ [简体中文](#简体中文)

---

## English

`happy-trip-site` is a reusable **agent skill**: it guides an AI agent to turn natural-language travel notes into a **static itinerary website you open on your phone** — one URL holding the whole trip's daily routes, maps, check-off list, and every reference link.

It is not a program you run, but an **instruction set** (`skill/happy-trip-site/SKILL.md`) the agent follows. The agent copies the static template, writes the trip data, sources content-verified images, runs the verifier, and produces the site.

### What it does

- **One URL = the whole trip**: daily route overview, one-tap Google Maps routes, tappable stop pins, and visible link buttons for maps, official pages, bookings, restaurants, videos, Xiaohongshu, and more.
- **Mobile-first**: bottom day-tabs, per-item check-off, per-day `X/Y complete` progress bar, ≥44px tap targets.
- **Destination-aware aesthetic layer**: texture, motif, glyph mark, palette, and fonts derived from the destination — not a one-size-fits-all recolor.
- **Content-verified imagery**: every hero is a named landmark, sourced via Wikipedia REST → Wikimedia Commons → official page. A `200` is not proof of content.
- **Silent-failure guards**: the zero-dependency `scripts/verify-preview.mjs` catches data issues that eyes and grep miss — broken texture encoding, badge labels that don't match a route stop, a missing aesthetic block, thin days, and items with no link; the browser-backed `scripts/verify-mobile-runtime.mjs` checks real mobile layout and 44px tap targets.

### Repository layout

| Path | Role |
|------|------|
| `skill/happy-trip-site/` | The skill itself; entrypoint `SKILL.md` |
| `skill/happy-trip-site/references/` | Trip schema, extraction rules, design principles, architecture & deployment notes |
| `skill/happy-trip-site/assets/static-template/` | Destination-neutral static runtime (HTML/CSS/JS template) |
| `skill/happy-trip-site/scripts/verify-preview.mjs` | Zero-dependency verifier |
| `skill/happy-trip-site/scripts/verify-mobile-runtime.mjs` | Browser-backed mobile runtime verifier |
| `docs/` | GitHub Pages live example (9-day Malaysia & Singapore) |
| `tests/` | Pure-JS helper unit tests |

### Install the skill

Tell your agent:

> Install the **happy-trip-site** skill from `https://github.com/owenleezy/happy-trip-site`

The agent clones the repo, copies `skill/happy-trip-site` into your skills directory, and discovers it automatically next session.

### Quick start

Once the skill is installed, hand your itinerary to the agent:

> Use happy-trip-site to turn this itinerary into a mobile website: <paste your trip — natural language, a spreadsheet, chat notes, or Markdown>

The agent will: ask for any missing details → show 3 style previews for you to pick A/B/C → generate and self-check → hand you a phone-ready link (or a local backup package).

### Workflow contract

The agent should:

1. Extract a Trip Brief from natural-language itinerary text, pasted spreadsheet rows, chat notes, or Markdown.
2. Ask follow-up questions until required details are complete.
3. Derive 3 materially different UI options from destination, season, pace, and activity mix.
4. Generate local previews through the real runtime with real trip content so the user can choose A/B/C, request a mix, or delegate the recommended default.
5. Auto-select content-verified stable network images for the whole-trip hero and each day hero.
6. Show a confirmation summary (Trip Brief, full UI choices, images, output folder, deploy target) before generating.
7. Generate the static site and validate the data contract with Bash + grep + `verify-preview.mjs`.
8. Pass the browser-backed mobile usability gate with `verify-mobile-runtime.mjs`.
9. Publish a shareable URL only after confirmation and smoke testing.
10. Return `ready_to_share` / `package_ready` / `blocked` with the local folder, preview paths, backup package, trusted URL, validation status, and assumptions.

Do not generate or deploy before the readiness gate in `references/itinerary-schema.md` passes.

### Mobile link rules (hard constraints)

- Every itinerary item needs at least one visible external link button.
- User-provided URLs are preserved and moved into `links`, never buried in prose.
- Items without a URL get a Google Maps search link.
- Every day needs `routeOverview.stops` so the template can render the daily route button and tappable pins.

### Verification

```bash
node --test tests/*.test.js                       # unit tests
node skill/happy-trip-site/scripts/verify-preview.mjs docs/assets/js/travel-data.js   # validate generated data
node skill/happy-trip-site/scripts/verify-mobile-runtime.mjs docs/index.html          # validate real mobile tap targets
```

### Deploy

The generated site is a folder of static files. The skill defaults to **Vercel Drop**: the agent generates and packages the local folder, you drag the whole folder to `vercel.com/drop`, then the agent smoke-tests the returned URL.

- **Vercel Drop (default)**: drag the generated site folder to `vercel.com/drop`; no CLI required.
- **GitHub Pages**: used for this repository's live demo; drop the site into `docs/`, then point repo settings at the `main` branch `/docs`.
- **Local / offline**: just send the whole folder; double-click `index.html` to open.

### Dependencies

- **Node.js** — required for tests and verifier scripts; Vercel Drop does not need a CLI.
- **Playwright** — required only for the browser-backed mobile verifier `verify-mobile-runtime.mjs`.
- **No Python required.** The skill is an instruction set; the agent copies the template and validates with Bash and grep.

### Reference docs

- Skill contract: `skill/happy-trip-site/SKILL.md`
- Trip schema: `skill/happy-trip-site/references/itinerary-schema.md`
- Extraction rules: `skill/happy-trip-site/references/extraction-rules.md`
- Design principles: `skill/happy-trip-site/references/design-principles.md`
- CSS vocabulary: `skill/happy-trip-site/references/design-reference.css`
- Architecture: `skill/happy-trip-site/references/architecture.md`
- Vercel deployment: `skill/happy-trip-site/references/vercel-deploy.md`

---

## 简体中文

`happy-trip-site` 是一个可复用的 **agent 技能（skill）**：它指导 AI agent 把一段自然语言行程，转成一个**手机上打开的静态行程网站**——一个链接装下整趟旅行的每日路线、地图、打卡清单和所有参考链接。

它不是一套要你运行的程序，而是一份 agent 照着执行的**指令集**（`skill/happy-trip-site/SKILL.md`）。agent 负责复制静态模板、写入行程数据、按内容核对选图、跑校验脚本，最后产出站点。

### 它能做什么

- **一个链接 = 整趟旅行**：每日路线总览、一键打开 Google Maps 路线、可点的站点角标，以及地图 / 官网 / 预订 / 餐厅 / 视频 / 小红书等所有可点链接。
- **手机优先**：底部按天切换标签、逐项打卡、每日 `X/Y 完成` 进度条、44px 以上点击区。
- **目的地美学层**：根据目的地自动推导纹理、纹样、字形印章、配色与字体（不是千篇一律的换色）。
- **图片必须经过内容核对**：hero 一律用具名地标，按 Wikipedia REST → Wikimedia Commons → 官方页面顺序取图，`200` 不等于内容对。
- **静默失败有守卫**：零依赖校验脚本 `scripts/verify-preview.mjs` 会抓出纹理编码错误、角标地名不匹配、缺失美学块、行程太单薄、以及"某项没有链接"等数据问题；浏览器校验脚本 `scripts/verify-mobile-runtime.mjs` 会检查真实移动端布局里的 44px 点击区。

### 仓库结构

| 路径 | 作用 |
|------|------|
| `skill/happy-trip-site/` | 技能本体，入口 `SKILL.md` |
| `skill/happy-trip-site/references/` | 行程 schema、抽取规则、设计原则、架构与部署说明 |
| `skill/happy-trip-site/assets/static-template/` | 目的地无关的静态运行时（HTML/CSS/JS 模板） |
| `skill/happy-trip-site/scripts/verify-preview.mjs` | 零依赖校验脚本 |
| `skill/happy-trip-site/scripts/verify-mobile-runtime.mjs` | 真实浏览器移动端校验脚本 |
| `docs/` | GitHub Pages 在线示例（马来西亚 + 新加坡 9 天） |
| `tests/` | 纯 JS 辅助函数单元测试 |

### 安装技能

告诉你的 agent：

> 从 `https://github.com/owenleezy/happy-trip-site` 安装 **happy-trip-site** 技能

agent 会自动克隆仓库、把 `skill/happy-trip-site` 复制到你的技能目录，下次会话即可使用。

### 快速开始

装好技能后，直接把行程丢给 agent：

> 用 happy-trip-site 把这份行程做成手机网站：<粘贴你的行程——自然语言、表格、聊天记录、Markdown 都行>

agent 会：追问缺失信息 → 给 3 个风格预览让你选 A/B/C → 生成并自检 → 交给你一个手机打开的链接（或本地备份包）。

### 工作流约定

agent 应当：

1. 从自然语言行程（或粘贴的表格、聊天记录、Markdown）抽取出 Trip Brief。
2. 追问直到必填信息齐全。
3. 基于目的地、季节、节奏、活动类型，推导出 3 个实质不同的 UI 选项。
4. 用真实 runtime 和真实行程内容生成本地预览，让用户选 A/B/C、要求混搭、或明确委托推荐默认值。
5. 自动为整趟 hero 和每日 hero 选取经内容核对的稳定网络图片。
6. 生成前给出确认摘要（Trip Brief、完整 UI 选择、图片、输出目录、部署目标）。
7. 生成静态站点并用 Bash + grep + `verify-preview.mjs` 校验数据契约。
8. 用 `verify-mobile-runtime.mjs` 通过真实浏览器手机可用性关卡。
9. 仅在确认且冒烟测试通过后才发布可分享 URL。
10. 返回 `ready_to_share` / `package_ready` / `blocked`，并附上本地目录、预览路径、备份包、可信时的 URL、校验状态与所有假设。

在 `references/itinerary-schema.md` 的就绪关卡通过之前，不得生成或部署。

### 手机链接规则（硬约束）

- 每个行程项都要有至少一个可见的外部链接按钮。
- 用户提供的 URL 必须保留并移入 `links`，不能埋在正文里。
- 没有 URL 的项（如休息、转场）自动补一个 Google Maps 搜索链接。
- 每一天都要有 `routeOverview.stops`，模板才能渲染当日路线按钮和可点角标。

### 验证

```bash
node --test tests/*.test.js                       # 单元测试
node skill/happy-trip-site/scripts/verify-preview.mjs docs/assets/js/travel-data.js   # 校验生成数据
node skill/happy-trip-site/scripts/verify-mobile-runtime.mjs docs/index.html          # 校验真实移动端点击区
```

### 发布

生成的站点是一组静态文件。技能默认用 **Vercel Drop** 发布：agent 先生成并打包本地文件夹，然后你把整个文件夹拖到 `vercel.com/drop`，拿到 URL 后交给 agent 做冒烟测试。

- **Vercel Drop（默认）**：拖拽生成的站点文件夹到 `vercel.com/drop`，无需 CLI。
- **GitHub Pages**：适合维护本仓库的在线示例，放进 `docs/`，仓库设置里指向 `main` 分支 `/docs`。
- **本地 / 离线**：直接发送整个文件夹，双击 `index.html` 即可打开。

### 依赖

- **Node.js** —— 运行测试和校验脚本需要；Vercel Drop 发布不需要 CLI。
- **Playwright** —— 仅真实浏览器移动端校验 `verify-mobile-runtime.mjs` 需要。
- **无需 Python。** 技能是指令集，agent 用 Bash 和 grep 完成复制与校验。

### 参考文档

- 技能契约：`skill/happy-trip-site/SKILL.md`
- 行程 schema：`skill/happy-trip-site/references/itinerary-schema.md`
- 抽取规则：`skill/happy-trip-site/references/extraction-rules.md`
- 设计原则：`skill/happy-trip-site/references/design-principles.md`
- CSS 词汇参考：`skill/happy-trip-site/references/design-reference.css`
- 架构说明：`skill/happy-trip-site/references/architecture.md`
- Vercel 部署：`skill/happy-trip-site/references/vercel-deploy.md`
