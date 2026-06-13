# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此仓库中工作提供指引。

## 项目概述

**她和它的日常** — 个人生活记录微信小程序，基于 uni-app (Vue 3 + Vite) 构建。使用微信云开发（云数据库 + 云存储）作为后端，UI 组件库为 Wot Design Uni。

## 构建与开发

```bash
npm run dev:mp-weixin    # 开发模式 → dist/dev/mp-weixin
npm run build:mp-weixin  # 生产构建 → dist/build/mp-weixin
```

构建完成后，打开微信开发者工具导入 `dist/build/mp-weixin`（或 `dist/dev/mp-weixin`）目录。项目没有配置测试和代码检查工具。

## 架构

### 技术栈

- **框架**: uni-app 3（跨平台），Vue 3 Options API 风格
- **UI**: [Wot Design Uni](https://wot-design-uni.pages.dev) — 通过 `pages.json` 中的 `easycom` 自动按需导入
- **样式**: SCSS，设计变量定义在 `src/uni.scss`（暖色调/干枯玫瑰色系，`$color-primary: #D4A5A5`）
- **目标平台**: 仅 `MP-WEIXIN` — 所有云开发代码使用 `#ifdef MP-WEIXIN` 条件编译

### 页面路由 & tabBar

3 个 tabBar 页面 + 分包：

| Tab | 路径 | 说明 |
|-----|------|------|
| 日常 | `pages/index/index` | 首页，封面轮播 + 动态列表 + 双入口卡片 |
| 狗狗 | `pages/dogs/album` | 狗狗照片瀑布流，支持标签筛选 |
| 我们 | `pages/about/index` | 关于我们 + 纪念日卡片（在一起时间/天数） |

**分包**（懒加载）：`pages/daily/list`（动态时间线列表）、`pages/daily/detail`（动态详情）、`pages-sub/viewer/index`（图片查看器）。

### 云数据库

3 个集合，通过 `src/common/cloud.js` 访问：

| 集合 | 用途 | 关键字段 |
|------|------|----------|
| `posts` | 日常动态 | `type`, `title`, `content`, `images[]`, `tags[]`, `mood`, `weather`, `location`, `createdAt`, `isPublished` |
| `dog_photos` | 狗狗相册 | `image`, `caption`, `tags[]`, `takenAt`, `sortOrder`, `isFavorite`, `width`, `height` |
| `site_config` | 站点配置（KV 结构） | `key`, `value` — 关于我们内容、封面语录、纪念日、封面图片、狗狗信息、底部文字等 |

**云函数**: `getTempUrls`（位于 `cloudfunctions/`）— 以管理员权限调用 `cloud.getTempFileURL()` 换取云存储临时链接，绕过客户端权限限制。`cloud.js` 中的 `getTempFileUrls()` 调用此云函数，每次最多批量 50 个 fileID。

### 数据访问模式

所有数据库读取统一通过 `src/common/cloud.js`。主要导出函数：
- `getPosts(pageSize, after)` — 游标分页，按 `createdAt` 降序
- `getPostById(id)` / `getNewerPost(createdAt)` — 详情 + "下一篇"导航
- `getDogPhotos(pageSize, tags, skip)` — 按 `sortOrder desc, takenAt desc` 排序
- `getSiteConfig(keys)` — 返回 `{ key: value }` 映射对象
- `getTempFileUrls(fileIds)` — 云存储 fileID → 临时 HTTPS 链接

在 `#ifndef MP-WEIXIN` 块（H5/其他平台）中，所有函数返回空值桩。

### 组件

- `CustomNavbar` — 自定义导航栏（替换系统导航栏，支持 `transparent` 透明模式）
- `SkeletonCard` — 加载骨架屏，支持 `variant` 属性（`detail` / `list`）

### 种子数据

`seed/` 目录包含 JSON 数据文件和导入脚本：
- `posts.json`、`dog_photos.json` — 静态数据快照
- `import.js` — 全量种子导入脚本，复制到微信开发者工具 Console 执行
- `import-*.js` — 单条记录导入脚本（同上）
- `export/export-all.js` — 全量导出数据库到 JSON，同样在 Console 执行

所有种子脚本使用 `wx.cloud.database()` API，设计为在微信开发者工具 Console 中运行 —— 没有 Node.js 导入管线。

### 样式规范

- 设计变量在 `src/uni.scss`：间距 (`$spacing-xs`–`$spacing-xl`)、字号 (`$font-h1`–`$font-small`)、圆角 (`$radius-sm`–`$radius-round`)、阴影 (`$shadow-card`、`$shadow-float`)
- 配色为暖色调/浪漫风：干枯玫瑰主色、暖白 `#FAF7F4` 底色、柔和棕色文字
- 全局卡片样式 `.card` 在 `App.vue` 中定义
- 页面背景统一使用 `$color-bg-page`，各页面自行处理底部安全区
