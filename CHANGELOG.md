# Changelog

## 1.3 (2025-01)

### ✨ 新增
- 字体大小设置（10–18px，默认 12px），图标跟随字体等比缩放
- 快速恢复开启时，宽度/数量/字体设置自动折叠（带动画）

### 🔧 优化
- 抽取 `shared/utils.js` 公共模块，消除 popup / options 重复代码
- popup 用 HTML `<template>` 替代手动 `createElement` 构建 DOM
- 全部 Chrome API 调用增加 `lastError` 错误处理
- 暗色模式配色重做：偏冷调深色、hover 更明显、文字更柔和
- CSS 图标 filter 收敛为 `--icon-filter` 单一变量
- 选项页模块顺序调整：主题 → 快速恢复 → 显示设置

### 🐛 修复
- `createWindowItem` 参数名 `window` 遮盖全局对象
- 折叠容器 `display: grid` 导致滑块数值弹窗被裁剪
- 分隔线 `z-index` 遮挡下层滑块弹窗

## 1.2

- 初始版本
