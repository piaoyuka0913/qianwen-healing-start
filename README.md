# 开工疗愈站：千问陪你从卡住到开始

一个可部署的 React + Vite 单页互动网页/H5。作品围绕“千问大模型，AI 时代的操作系统，助力千行百业 AI 应用创新实现”，模拟治愈系学习陪伴智能体的工作流：识别情绪、识别任务、拆解方案、生成 30 分钟开工清单。

## 作品功能

- 首页：标题、slogan 与开始入口
- 状态选择：焦虑、拖延、迷茫、时间紧张、灵感枯竭
- 任务选择：PPT、论文、调研报告、海报、短视频、课程设计、UI 设计、互动网页
- 卡点输入：用户填写当前遇到的问题
- 千问分析：动态展示“情绪识别 - 任务识别 - 方案拆解 - 生成开工清单”
- 结果页：生成治愈回应、任务拆解、30 分钟开工清单和后续计划
- 分享页：生成“今日开工卡”，支持截图或打印保存

## 技术栈

- React
- Vite
- lucide-react 图标
- 纯前端模拟生成结果，无后端、无真实 API

说明：当前版本不会调用真实千问接口，而是在前端根据用户选择的状态、任务类型和输入卡点，模拟“千问工作流”的分析与生成过程，适合课程作业展示和静态部署。

## 本地运行

先安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

打包生产版本：

```bash
npm run build
```

本地预览打包结果：

```bash
npm run preview
```

## 部署到 Vercel

1. 将项目推送到 GitHub、GitLab 或 Bitbucket。
2. 打开 [Vercel](https://vercel.com/)，选择 `New Project`。
3. 导入当前项目仓库。
4. Vercel 通常会自动识别 Vite 项目，确认配置：
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 点击 `Deploy`。

## 部署到 GitHub Pages

如果仓库名是 `your-repo-name`，先在 `vite.config.js` 中加入 `base`：

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',
});
```

然后构建：

```bash
npm install
npm run build
```

推荐使用 GitHub Actions 自动发布。创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

在 GitHub 仓库的 `Settings -> Pages` 中，将 Source 设置为 `GitHub Actions`。

## 项目结构

```text
.
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src
    ├── main.jsx
    └── styles.css
```
