# Image Background Remover

一键去除图片背景，下载透明PNG

## 技术栈

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Remove.bg API**

## Getting Started

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
REMOVE_BG_API_KEY=你的RemoveBgAPIKey
```

获取 API Key: https://www.remove.bg/api

### 3. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 功能

- ✅ 拖拽/点击上传图片
- ✅ 支持 JPG、PNG、WebP
- ✅ 10MB 文件大小限制
- ✅ 进度状态反馈（上传中/处理中）
- ✅ 处理完成后对比预览
- ✅ 一键下载透明PNG
- ✅ 移动端适配

## 部署

推荐部署到 Vercel（原生支持 Next.js）或 Cloudflare Pages。

### Vercel

```bash
npm i -g vercel
vercel
```

设置环境变量 `REMOVE_BG_API_KEY`