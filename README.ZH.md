# McpSynergy Client &middot; [![GitHub license](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE) [![npm version](https://img.shields.io/npm/v/mcps-client.svg?style=flat)](https://www.npmjs.com/package/mcps-client) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/McpSynergy/client)

[English](README.md) | 简体中文

McpSynergy Client 是一个基于 MCP 协议实现在客户端渲染 UI 组件的方案。他可以在你的智能聊天框中渲染可交互的 UI 组件，进一步的增强智能助手的能力。

* **快速开发：** 基于 Vite 6 的快速开发体验，支持热更新和即时构建。
* **类型安全：** 使用 TypeScript 提供完整的类型支持，让开发更加可靠。
* **模块化：** 采用 Turborepo 实现 monorepo 架构，支持多包管理和代码共享。
* **统一规范：** 使用 Prettier 进行代码格式化，确保代码风格统一。
* **前后端方案：** 在 Vite 插件内部实现开发时前后端热更新机制，更新配置文件。


## 快速开始

```bash
# 克隆仓库
git clone https://github.com/your-username/mcps-client.git

# 进入项目目录
cd mcps-client

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 文档

你可以在以下位置找到 McpSynergy Client 的文档：

## 示例

这里是一个简单的示例：

```tsx
import { ChatComponent } from "@mcp-synergy/react";

// 大模型请求
const data = request('url')
const content = data?.content
const meta = data?.meta;
const props = meta?.componentProps;

return <ChatComponent name={meta.toolName} props={props} fallback={<></>} />
```

这个示例将在页面上渲染服务端 mcp 需要渲染的 UI 组件。

## 项目结构

```
.
├── apps/                # 应用目录
│   └── antd-example/   # Ant Design 示例应用
├── packages/           # 共享包目录
├── packages-private/   # 私有包目录
└── ...
```

## 技术栈

* **框架**: React 19
* **构建工具**: Vite 6
* **语言**: TypeScript
* **包管理**: pnpm 7.8.0
* **Monorepo**: Turborepo
* **代码规范**: Prettier
* **依赖管理**: syncpack

## 贡献

我们欢迎任何形式的贡献，包括但不限于：

* 提交 Bug 报告
* 提出新功能建议
* 改进文档
* 提交代码修复

### 行为准则

请阅读我们的[行为准则](CODE_OF_CONDUCT.md)，了解我们期望的行为标准。

### 贡献指南

请阅读我们的[贡献指南](CONTRIBUTING.md)，了解如何参与项目开发。

### 开发流程

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 许可证

McpSynergy Client 采用 [ISC 许可证](LICENSE)。

## 相关链接

* [React 文档](https://react.dev/)
* [Vite 文档](https://vitejs.dev/)
* [TypeScript 文档](https://www.typescriptlang.org/)
* [Turborepo 文档](https://turbo.build/repo)

