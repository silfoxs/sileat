# 今天吃什么

一个用于解决日常用餐选择困难的小工具。应用以本地菜单库为基础，支持按标签筛选、临时跳过某些选项，并通过抽签动画给出今天吃什么的结果。

## 功能

- 抽签决定今天吃什么
- 维护常吃菜单：名称、图标、描述、距离和标签
- 按标签筛选抽签范围
- 临时跳过今天不想吃的选项
- 深色模式切换
- 使用本地 SQLite 保存数据

## 技术栈

- Vue 3 + TypeScript
- Vite
- Tauri 2
- Pinia
- Vue Router
- Tailwind CSS
- Reka UI
- Tauri SQL Plugin + SQLite

## 环境要求

- Node.js
- pnpm
- Rust
- Tauri 2 开发环境

如果是第一次开发 Tauri 应用，请先按官方文档安装系统依赖：

https://tauri.app/start/prerequisites/

## 本地开发

安装依赖：

```bash
pnpm install
```

启动 Web 开发服务：

```bash
pnpm dev
```

启动桌面应用开发模式：

```bash
pnpm tauri dev
```

默认 Vite 端口是 `1420`，配置见 [vite.config.ts](vite.config.ts)。

## 构建

构建前端产物：

```bash
pnpm build
```

构建桌面安装包：

```bash
pnpm tauri build
```

Tauri 构建配置见 [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json)。

## 项目结构

```text
.
|-- src
|   |-- assets/styles      # 全局样式
|   |-- components         # 通用组件和 UI 组件
|   |-- composables        # 复用逻辑
|   |-- router             # 路由配置
|   |-- stores             # Pinia 状态管理
|   |-- types              # TypeScript 类型
|   `-- views              # 页面
|-- src-tauri              # Tauri 后端、配置和图标资源
|-- public                 # 静态资源
`-- package.json           # 前端脚本和依赖
```

## 核心页面

- [src/views/LotteryView.vue](src/views/LotteryView.vue)：抽签首页
- [src/views/KitchenView.vue](src/views/KitchenView.vue)：菜单管理
- [src/views/SettingsView.vue](src/views/SettingsView.vue)：应用设置

## 数据存储

应用通过 Tauri SQL Plugin 打开本地 SQLite 数据库 `sileat.db`。数据库初始化和简单迁移逻辑在 [src/composables/useDatabase.ts](src/composables/useDatabase.ts)。

主要数据表：

- `food_items`：菜单项、标签、跳过状态等
- `settings`：预留的设置表

主题偏好目前存储在 `localStorage`。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Vite 开发服务 |
| `pnpm build` | 类型检查并构建前端 |
| `pnpm preview` | 预览前端构建产物 |
| `pnpm tauri dev` | 启动 Tauri 桌面应用开发模式 |
| `pnpm tauri build` | 构建桌面应用安装包 |
