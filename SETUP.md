# 微信云开发 — 环境配置指南

## 1. 注册微信小程序

1. 访问 https://mp.weixin.qq.com/ 注册小程序账号 (个人主体即可)
2. 获取 **AppID** (开发 → 开发管理 → 开发设置)

## 2. 开通云开发

1. 微信开发者工具中打开本项目
2. 点击左上角「云开发」按钮
3. 首次使用会提示开通，选择「新建环境」
4. 环境名称随意 (如 `my-life`)，环境 ID 自动生成
5. 创建后记录 **云环境 ID** (形如 `my-life-xxxxx`)
6. 将环境 ID 填入 `src/common/cloud.js` 中的 `CLOUD_ENV_ID`

## 3. 创建数据库集合

在云开发控制台 → 数据库 → 添加集合，依次创建：

### 集合 1: `posts` (日常动态)

```
字段:
  content      String    正文内容
  images       Array     图片 fileID 数组
  tags         Array     标签
  mood         String    心情
  weather      String    天气
  location     String    地点
  createdAt    Date      创建时间 (同时作为展示日期)
  updatedAt    Date      更新时间
  isPublished  Boolean   是否发布 (默认 true)
  viewCount    Number    浏览数 (默认 0)

索引:
  createdAt: -1 (降序)
```

### 集合 2: `dog_photos` (狗狗照片)

```
字段:
  image        String    照片 fileID
  thumbnail    String    缩略图 fileID
  width        Number    原始宽度
  height       Number    原始高度
  caption      String    照片说明
  tags         Array     标签
  takenAt      Date      拍摄日期
  createdAt    Date      上传时间
  sortOrder    Number    排序权重
  isFavorite   Boolean   是否精选

索引:
  takenAt: -1
  tags: 1, sortOrder: -1
```

### 集合 3: `site_config` (站点配置)

```
字段:
  key          String    配置键
  value        Any       配置值
  updatedAt    Date      更新时间

预置数据:
  { key: "cover_images",    value: [] }
  { key: "hero_quote",      value: "我们的故事" }
  { key: "dog_name",        value: "海巴" }
  { key: "dog_bio",         value: "" }
  { key: "dog_birthday",    value: "" }
  { key: "about_title",     value: "关于我们" }
  { key: "about_content",   value: "" }
  { key: "about_images",    value: [] }

索引:
  key: 1
```

## 4. 上传测试数据

在云开发控制台 → 存储 → 上传文件，上传几张测试照片。
将照片的 **fileID** (形如 `cloud://my-life-xxxxx.xxxxx/photo.jpg`) 填入对应的数据库记录。

## 5. 设置体验版

1. 微信开发者工具 → 上传 → 上传为体验版
2. 登录 https://mp.weixin.qq.com/ → 管理 → 版本管理 → 体验版
3. 添加女朋友和家人的微信号为「体验者」

## 免费额度提醒

| 资源 | 额度 |
|------|------|
| 数据库 + 存储 | 2 GB |
| 月调用次数 | 20 万次 |
| 免费期限 | 发布前无限制 |

超出后基础套餐: **19.9 元/月**。
