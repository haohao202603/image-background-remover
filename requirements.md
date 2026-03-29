# Image Background Remover — MVP 需求文档

> 豪哥 · 2026-03-29

---

## 1. 产品概述

| 字段 | 内容 |
|------|------|
| 产品名称 | BG Remover（待定） |
| 核心价值 | 一键去除图片背景，下载透明PNG |
| 目标用户 | 设计师、电商卖家、内容创作者 |
| 技术栈 | Cloudflare Workers + React (前端) |
| 外部依赖 | Remove.bg API |
| 部署平台 | Cloudflare Pages / Workers |

---

## 2. 功能范围（MVP）

### 2.1 核心功能

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 图片上传 | 支持拖拽 + 点击上传，格式：JPG/PNG/WEBP，最大 10MB | P0 |
| 自动抠图 | 调用 Remove.bg API 去除背景 | P0 |
| 预览 & 下载 | 处理完成后在浏览器预览，支持一键下载 PNG | P0 |
| 进度指示 | 上传中/处理中/完成，三种状态反馈 | P0 |

### 2.2 边界控制（MVP不做）

- ❌ 用户账号体系
- ❌ 批量处理
- ❌ 历史记录
- ❌ 存储/云端相册
- ❌ 高级修图（边缘优化、阴影添加）

---

## 3. 页面流程

```
[首页] → 上传区域（拖拽/点击）
         ↓
[处理中] → 进度条 + 状态文案
         ↓
[结果页] → 左侧原图 / 右侧透明图 对比展示
         ↓
      [下载 PNG] 按钮
         ↓
      [重新上传] 继续下一张
```

---

## 4. 技术方案

### 4.1 前端

- **框架**：React + Vite（或者纯 HTML/JS 极简版）
- **样式**：TailwindCSS（快速搭建）
- **交互**：Axios 发请求，FormData 上传

### 4.2 后端（Cloudflare Worker）

```
请求流程：
1. 接收前端 FormData（图片base64或blob）
2. 构造请求调用 Remove.bg API
3. 拿到结果图片（PNG），直接返回给前端
4. 内存操作，不落盘
```

### 4.3 Remove.bg API

- Endpoint: `https://api.remove.bg/v1.0/removebg`
- 鉴权: `X-Api-Key` header
- 请求: `image_url` 或 `image_file_b64`
- 响应: 返回透明背景 PNG 图片

### 4.4 环境变量

```bash
REMOVE_BG_API_KEY=你的APIKey  # 配置在 Cloudflare Worker 环境变量中
```

---

## 5. API 设计

### 前端 → Worker

```
POST /api/remove-bg
Content-Type: multipart/form-data

body: { image: File }

响应 200:
{
  "success": true,
  "image": "data:image/png;base64,xxxxx"   // 或直接返回二进制
}

响应 4xx/5xx:
{
  "success": false,
  "error": "错误描述"
}
```

---

## 6. 计费与限制

| 项目 | 说明 |
|------|------|
| Remove.bg 免费额度 | 50次/月（免费账户） |
| 单图大小限制 | 10MB |
| 图片格式 | JPG / PNG / WEBP |
| 并发限制 | MVP阶段不限 |

---

## 7. 页面 UI 设计方向

**风格：极简工具风**

- 整体白底，主题色蓝色/紫色渐变
- 中央上传区域，大拖拽框 + 图标
- 处理状态用简洁进度条或 loading 动画
- 结果页左右对比布局，下载按钮突出

---

## 8. MVP 交付清单

- [ ] 页面：上传页 + 结果页
- [ ] Worker：接收图片 → 调用 API → 返回结果
- [ ] 环境变量配置（API Key）
- [ ] 错误处理（文件太大/格式错误/API失败）
- [ ] 移动端适配

---

## 9. 后续迭代方向（V1.0+）

- 用户体系 + 积分/订阅
- 批量上传
- Chrome 插件
- 历史记录
- 边缘优化 / 阴影添加

---

> 有问题随时说，或者想调整什么功能、交互方式，告诉我 👊