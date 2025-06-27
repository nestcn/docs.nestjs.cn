# 概述

NestJS 是一个用于构建高效、可扩展的 Node.js 服务端应用的框架。它采用渐进式 JavaScript，使用 TypeScript 构建并全面支持 TypeScript（同时保持与纯 JavaScript 的兼容性）。NestJS 结合了面向对象编程（OOP）、函数式编程（FP）和响应式编程（FRP）的最佳实践。

## 核心理念

NestJS 的设计灵感来自 Angular，旨在为 Node.js 带来现代化的应用架构。它使用强大的 HTTP 服务器框架，如 Express（默认）和 Fastify。

### 主要特性

- **模块化架构** - 将应用程序组织成模块，便于管理和扩展
- **依赖注入** - 强大的依赖注入系统，提高代码的可测试性和可维护性
- **装饰器** - 广泛使用装饰器来定义路由、中间件、管道等
- **TypeScript 优先** - 原生支持 TypeScript，提供强类型和现代 JavaScript 特性
- **平台无关** - 可以与任何 HTTP 库协同工作
- **微服务支持** - 内置对微服务架构的支持
- **WebSocket 支持** - 完整的 WebSocket 集成
- **GraphQL 支持** - 原生 GraphQL 支持

## 学习路径

本概述部分将引导您了解 NestJS 的核心概念：

1. **[入门指南](/overview/first-steps)** - 开始您的 NestJS 之旅
2. **[控制器](/overview/controllers)** - 处理传入请求和返回响应
3. **[提供者](/overview/providers)** - 依赖注入和服务管理
4. **[模块](/overview/modules)** - 应用程序的组织单元
5. **[中间件](/overview/middlewares)** - 请求/响应处理管道
6. **[异常过滤器](/overview/exception-filters)** - 统一的异常处理
7. **[管道](/overview/pipes)** - 数据验证和转换
8. **[守卫](/overview/guards)** - 认证和授权
9. **[拦截器](/overview/interceptors)** - 请求/响应拦截和转换
10. **[自定义装饰器](/overview/custom-decorators)** - 创建可重用的装饰器

## 架构概览

NestJS 应用程序遵循分层架构模式：

```
┌─────────────────┐
│   Controllers   │  ← 处理 HTTP 请求
├─────────────────┤
│    Services     │  ← 业务逻辑层
├─────────────────┤
│  Repositories   │  ← 数据访问层
├─────────────────┤
│    Database     │  ← 数据存储
└─────────────────┘
```

每一层都有明确的职责，这种分离使得应用程序更易于测试、维护和扩展。

准备好开始了吗？让我们从[入门指南](/overview/first-steps)开始您的 NestJS 学习之旅！
