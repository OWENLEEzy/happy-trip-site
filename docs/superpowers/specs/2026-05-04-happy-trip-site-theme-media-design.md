# Happy Trip Site 视觉主题与真实图片设计

日期：2026-05-04

状态：已通过讨论确认，等待实现计划

适用范围：`skill/happy-trip-site`

## 1. 背景

`happy-trip-site` 当前已经能从行程文本生成移动端静态旅行站点。它的 UX 骨架有效：日期抽屉、每日路线总览、时间线 checklist、Google Maps 路线、外部链接按钮都适合旅行时在手机上使用。

现有问题在表现层。模板仍强依赖最初的关西旅行视觉：和纸底色、樱花动画、日式印章、文本式 hero 和默认图标。这会让非日本行程看起来像套用旧模板。生成页也缺少真实图片，最终体验容易落到占位符和通用装饰。

本设计只细化 skill 的视觉主题和图片资产能力。它不重做 UX 骨架，也不引入前端框架。

## 2. 目标

- 让 skill 根据任意 Trip Brief 自动推荐 2-4 个视觉方向。
- 在生成前让用户确认视觉方向，而不是直接复用默认风格。
- 让 skill 自动寻找真实图片候选，并在生成前让用户确认图片组。
- 把确认后的图片下载到生成站点的 `assets/media/`，让静态站点自包含。
- 禁止最终站点使用占位图片、示例图片、旧关西专用视觉或仅文本 hero 作为兜底。
- 保留当前移动端 UX 骨架和链接契约。

## 3. 非目标

- 不把 skill 扩展成通用网页设计器。
- 不引入 React、Next.js、Vite 或服务端渲染。
- 不做完整图片授权审计平台。
- 不为用户提供站内图片编辑器。
- 不在用户未确认主题和图片组时生成最终站点。

## 4. 推荐方案

采用“主题 + 图片解析流程”。

生成前流程变为：

1. 抽取 `Trip Brief`：行程事实、日期、城市、地点、路线、链接、模糊项。
2. 推导 `Theme Brief`：基于目的地、季节、城市气质和活动内容推荐 2-4 个视觉方向，并标出默认推荐项。
3. 生成 `Media Brief`：为整站 hero、每日 hero 和必要地点图搜索真实图片候选。
4. 展示确认摘要：行程内容、推荐主题、候选主题、图片候选、来源和匹配理由。
5. 用户确认主题和图片组后，才运行生成脚本。
6. 生成脚本复制模板，写入主题 token，下载图片到 `assets/media/`，写入 `media-manifest.json`。
7. 校验脚本检查链接、路线、主题、图片文件和占位符禁用规则。

这个方案比“只加字段”更能解决模板复用问题，也比“一期做完整资产系统”更可控。

## 5. 数据结构

### 5.1 Trip Brief

`Trip Brief` 继续只描述行程事实：

```json
{
  "trip_title": "粤港澳大湾区 2025 秋季行程",
  "trip_slug": "greater-bay-area-2025",
  "date_range": "2025-10-31 to 2025-11-09",
  "language": "zh-CN",
  "days": [],
  "assumptions": [],
  "uncertain_items": []
}
```

`Trip Brief` 不负责决定视觉风格，也不直接持有最终图片文件。它可以在图片缺失时成立，但不能直接进入最终生成。

### 5.2 Theme Brief

新增 `Theme Brief`，专门描述视觉方向：

```json
{
  "recommended_theme_id": "urban-bay-neon",
  "confirmed_theme_id": "urban-bay-neon",
  "theme_options": [
    {
      "id": "urban-bay-neon",
      "name": "城市海湾夜行",
      "reason": "行程跨香港、广州、深圳，夜景、交通和城市步行为主要内容。",
      "palette": {
        "background": "#F6F4EE",
        "surface": "#FFFFFF",
        "ink": "#171A1F",
        "muted": "#67717D",
        "accent": "#0E7C86",
        "accent2": "#D34F2F",
        "line": "rgba(23,26,31,.14)"
      },
      "typography": {
        "sans": "system-ui",
        "serif": "Noto Serif SC",
        "display": "system-ui"
      },
      "motifs": ["bay", "metro", "street", "night-lights"]
    }
  ]
}
```

规则：

- 每次生成前提供 2-4 个 `theme_options`。
- `recommended_theme_id` 由 skill 自动给出。
- `confirmed_theme_id` 必须来自用户确认。
- `trip-data.js` 只能写入已确认主题，不能只写 `auto`。

### 5.3 Media Brief

新增 `Media Brief`，专门描述图片候选和确认状态：

```json
{
  "siteHero": {
    "confirmed": true,
    "selected_asset_id": "site-hero-01",
    "candidates": []
  },
  "dayHeroes": {
    "day-1": {
      "confirmed": true,
      "selected_asset_id": "day-1-hero-01",
      "candidates": []
    }
  }
}
```

候选图片结构：

```json
{
  "asset_id": "day-1-hero-01",
  "remote_url": "https://example.com/image.jpg",
  "local_path": "assets/media/day-1-hero-01.jpg",
  "source": "Wikimedia Commons",
  "credit": "Photographer or source name",
  "usage_note": "Public page source recorded for attribution.",
  "matched_query": "Hong Kong skyline night",
  "reason": "Matches arrival day and city skyline.",
  "width": 1600,
  "height": 1000
}
```

规则：

- 每个整站 hero 和每日 hero 都必须有确认图片。
- 每个候选必须记录来源、匹配 query 和选择理由。
- 确认后的图片必须下载到生成站点的 `assets/media/`。
- 如果图片下载失败，生成失败，并要求用户重选或重搜。

## 6. 图片搜索与确认

`Media resolver` 负责从行程内容生成搜索 query。它优先使用城市、地标、当天路线主题和活动类型。例如：

- `香港 skyline night`
- `广州塔 珠江 夜景`
- `深圳湾公园 日落`
- `永庆坊 广州 街区`

筛选规则：

- 优先横图，适合移动端 hero 裁切。
- 优先清晰、真实、目的地匹配的图片。
- 跳过地图截图、二维码、明显广告图、水印重的图、低清图。
- 对每个 hero 给出 1 个推荐图和 1-2 个备选图。

确认规则：

- 用户可以接受推荐图、选择备选图、要求重搜，或提供自己的图片链接。
- 未确认的图片不能写入最终站点。
- 找不到合适图片时，skill 必须继续询问用户，不能用占位符兜底。

## 7. 模板边界

保留：

- 手机 sticky topbar。
- 日期抽屉导航。
- 每日 route overview 和 Google Maps directions。
- 时间线 checklist。
- 外部链接 pill。
- 静态 HTML/CSS/JS 部署形态。

替换：

- 去掉模板对 `washi`、`sakura`、日式印章和关西图标的硬依赖。
- CSS 读取 theme tokens：背景、文本、强调色、线条、surface、字体。
- hero 区域使用 confirmed media asset。
- 每日页面可使用 day hero 图增强视觉，但不改变原有信息结构。
- 装饰 motif 必须来自 confirmed theme，而不是模板默认写死。

如果某个主题不需要动画，模板应关闭 canvas 动画。不能默认给所有行程加樱花。

## 8. 生成输出

生成站点新增文件：

```text
~/Desktop/<trip-slug>-travel-site/
├── assets/
│   ├── media/
│   │   ├── site-hero-01.jpg
│   │   └── day-1-hero-01.jpg
│   └── js/trip-data.js
├── trip-brief.json
├── theme-brief.json
├── media-brief.json
├── media-manifest.json
└── validation-result.json
```

`media-manifest.json` 记录最终进入站点的图片：

```json
{
  "assets": [
    {
      "asset_id": "site-hero-01",
      "local_path": "assets/media/site-hero-01.jpg",
      "source": "Wikimedia Commons",
      "credit": "Photographer or source name",
      "usage_note": "Source page recorded.",
      "matched_query": "Hong Kong skyline night"
    }
  ]
}
```

## 9. 校验规则

`validate_site.py` 保留现有规则：

- 每个 itinerary item 至少一个外部链接。
- 每天必须有 `routeOverview.stops`。
- `index.html` 必须有 mobile viewport。
- `trip-data.js` 必须能解析。

新增规则：

- `theme-brief.json` 必须存在。
- `media-brief.json` 必须存在。
- `media-manifest.json` 必须存在。
- `trip-data.js` 必须包含已确认 `themeId` 和 theme tokens。
- `trip-data.js` 引用的图片路径必须存在于 `assets/media/`。
- `media-manifest.json` 中每个 asset 必须有 `local_path`、`source`、`matched_query` 和 `usage_note` 或 `credit`。
- 最终输出不得包含用于最终 UI 的占位图片、示例图片、旧关西专用 hero 或仅文本 hero 兜底。

校验失败时，agent 不能声称生成完成。

## 10. 错误处理

- 主题候选不足：继续询问用户偏好，不生成。
- 用户拒绝所有主题：重新生成主题候选。
- 图片候选不足：重搜或要求用户提供图片。
- 图片下载失败：停止生成，报告失败图片和来源。
- 图片校验失败：停止交付，要求重选或重搜。
- Vercel 部署失败：保留本地生成目录，报告失败阶段。

所有错误都应指向下一步操作，而不是自动降级为占位符。

## 11. 测试计划

单元测试：

- `create_site.py` 能写入 `theme-brief.json`、`media-brief.json` 和 `media-manifest.json`。
- 确认图片能下载到 `assets/media/`。
- `trip-data.js` 引用本地图片路径。
- 未确认主题时生成失败。
- 未确认图片时生成失败。
- 图片下载失败时生成失败。

校验测试：

- 缺少 `media-manifest.json` 时失败。
- 图片路径不存在时失败。
- 图片路径不在 `assets/media/` 时失败。
- 缺少 `source` 或 `matched_query` 时失败。
- 出现最终占位图片引用时失败。
- 旧链接和 routeOverview 合约继续通过测试覆盖。

端到端测试：

- 用现有 Osaka/Nara fixture 扩展一个带主题和图片的版本。
- 用一个非日本 fixture 验证主题不再默认使用日式视觉。
- 生成后运行 `validate_site.py`，并用本地 HTTP 服务冒烟检查 HTML、CSS、JS 和图片资源。

## 12. 实现顺序建议

1. 更新 schema 和 extraction rules，加入 `Theme Brief`、`Media Brief` 和确认 gate。
2. 扩展生成脚本参数，让它接收已确认主题和媒体 brief。
3. 实现图片下载和 `media-manifest.json` 写入。
4. 改模板，让 CSS/JS 读取 theme tokens 和 confirmed media。
5. 扩展 validator。
6. 更新测试 fixture 和单元测试。
7. 用本地生成站点验证非日本行程不会复用关西视觉。

## 13. 通过标准

这次细化完成后，一个合格的 skill 行为应满足：

- 用户在生成前能看到并确认视觉方向。
- 用户在生成前能看到并确认图片候选。
- 最终站点有真实图片，且图片在生成目录内。
- 最终站点不含占位图片或旧模板专用视觉。
- 现有移动端 UX 骨架不退化。
- `validate_site.py <generated-site>` 通过后，agent 才能说本地生成完成。
