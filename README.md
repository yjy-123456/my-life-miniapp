# 她和它的日常 💕

个人生活记录微信小程序，记录我们一起走过的每一天。

## 技术栈

uni-app (Vue 3) + 微信云开发 + Wot Design Uni

## 开始

```bash
npm install
npm run dev:mp-weixin   # 开发
npm run build:mp-weixin # 打包
```

用微信开发者工具导入 `dist/dev/mp-weixin` 或 `dist/build/mp-weixin`。

## 项目结构

```
src/
├── pages/          # 主页面 (首页/狗狗/关于我们)
├── pages/daily/    # 分包 (动态列表/详情)
├── common/cloud.js # 云开发 SDK 封装
├── components/     # 公共组件
└── uni.scss        # 全局样式变量

seed/               # 种子数据 & 导入导出脚本
cloudfunctions/     # 云函数
```

## 许可

MIT
