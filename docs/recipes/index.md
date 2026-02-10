# 实用食谱

本节收录了 NestJS 开发中的常用技巧、最佳实践和解决方案。这些"食谱"涵盖了从基础配置到高级架构模式的各种实际应用场景，帮助开发者快速解决常见问题并提升开发效率。

## 🔐 认证与安全

### 认证系统
- **[认证](/security/authentication)** - JWT、Session 等认证方式
- **[授权](/security/authorization)** - 基于角色和权限的访问控制
- **[Passport](./passport.md)** - 多种认证策略集成
- **[加密和哈希](/security/encryption-hashing)** - 密码加密和数据安全

### 安全防护
- **[CORS](/security/cors)** - 跨域资源共享配置
- **[CSRF 防护](/security/csrf)** - 跨站请求伪造防护
- **[Helmet](/security/helmet)** - HTTP 安全头部设置
- **[速率限制](/security/rate-limiting)** - API 访问频率控制

## 🏗️ 架构模式

### 设计模式
- **[CQRS](./cqrs.md)** - 命令查询职责分离模式
- **[路由模块](./router-module.md)** - 模块化路由管理
- **[CRUD 生成器](./crud-generator.md)** - 自动生成 CRUD 操作
- **[测试套件](./suites.md)** - 完整的测试解决方案

## 💾 数据库集成

### ORM/ODM 支持
- **[TypeORM](./sql-typeorm.md)** - 功能丰富的 ORM 框架
- **[Sequelize](./sql-sequelize.md)** - 经典的 SQL ORM
- **[Prisma](./prisma.md)** - 现代化数据库工具包
- **[MikroORM](./mikroorm.md)** - 基于 Data Mapper 的 TypeScript ORM
- **[MongoDB](./mongodb.md)** - MongoDB 数据库集成

## 🚀 性能优化

### 构建和部署
- **[SWC](./swc.md)** - 超快的 TypeScript/JavaScript 编译器
- **[热重载](./hot-reload.md)** - 开发环境快速重载
- **[静态资源服务](./serve-static.md)** - 静态文件托管
- **[异步本地存储](./async-local-storage.md)** - 异步上下文管理

## 📚 文档和工具

### 开发工具
- **[文档生成](./documentation.md)** - 自动化 API 文档
- **[REPL](./repl.md)** - 交互式开发环境
- **[Commander](./nest-commander.md)** - CLI 应用构建
- **[Necord](./necord.md)** - Discord 机器人开发

## 🔧 监控和维护

### 应用监控
- **[Terminus](./terminus.md)** - 健康检查和优雅关闭
- **[Sentry](./sentry.md)** - 错误监控和性能追踪

## 快速导航

### 按使用频率分类

**🔥 高频使用**
- [认证](/security/authentication) - 用户身份验证
- [TypeORM](./sql-typeorm.md) - 数据库 ORM
- [CORS](/security/cors) - 跨域配置
- [SWC](./swc.md) - 快速编译
- [文档生成](./documentation.md) - API 文档

**📈 进阶应用**
- [CQRS](./cqrs.md) - 企业级架构
- [Prisma](./prisma.md) - 现代数据库
- [速率限制](/security/rate-limiting) - API 保护
- [Terminus](./terminus.md) - 健康检查
- [Sentry](./sentry.md) - 错误监控

**🛠️ 开发工具**
- [热重载](./hot-reload.md) - 开发效率
- [REPL](./repl.md) - 调试工具
- [Commander](./nest-commander.md) - CLI 工具
- [测试套件](./suites.md) - 测试框架

### 按应用场景分类

**🌐 Web 应用**
```typescript
// 典型的 Web 应用技术栈
- 认证: JWT + Passport
- 数据库: TypeORM + PostgreSQL
- 安全: CORS + Helmet + CSRF
- 文档: OpenAPI + Swagger
- 监控: Terminus + Sentry
```

**🏢 企业应用**
```typescript
// 企业级应用推荐配置
- 架构: CQRS + 微服务
- 数据库: Prisma + 多数据源
- 安全: RBAC + 速率限制
- 监控: 健康检查 + 错误追踪
- 测试: 完整测试套件
```

**🎮 实时应用**
```typescript
// 实时应用技术选择
- 通信: WebSocket + Socket.IO
- 状态: CQRS + Event Sourcing
- 缓存: Redis + 会话管理
- 安全: 实时认证 + 权限控制
```

## 实践建议

### 🔰 新手推荐路径

1. **基础设置**
   - 配置 [CORS](/security/cors) 解决跨域问题
   - 集成 [TypeORM](./sql-typeorm.md) 管理数据库
   - 实现 [认证](/security/authentication) 系统

2. **安全加固**
   - 启用 [Helmet](/security/helmet) 安全头部
   - 配置 [CSRF 防护](/security/csrf)
   - 设置 [速率限制](/security/rate-limiting)

3. **开发优化**
   - 使用 [SWC](./swc.md) 提升编译速度
   - 配置 [热重载](./hot-reload.md)
   - 生成 [API 文档](./documentation.md)

### 🚀 进阶优化路径

1. **架构升级**
   - 采用 [CQRS](./cqrs.md) 模式
   - 实现 [授权](/security/authorization) 系统
   - 引入 [Prisma](./prisma.md) 现代化 ORM

2. **监控完善**
   - 集成 [Terminus](./terminus.md) 健康检查
   - 配置 [Sentry](./sentry.md) 错误监控
   - 建立完整 [测试套件](./suites.md)

3. **生产优化**
   - 优化异步处理
   - 配置负载均衡
   - 实施缓存策略

## 最佳实践总结

### ✅ 推荐做法

- **模块化设计** - 合理划分功能模块
- **类型安全** - 充分利用 TypeScript
- **安全优先** - 从设计阶段考虑安全
- **测试驱动** - 保证代码质量
- **文档齐全** - 维护完整的 API 文档

### ❌ 避免陷阱

- 过度复杂的架构设计
- 忽视安全配置
- 缺乏错误处理
- 性能监控不足
- 文档更新滞后

### 🎯 性能建议

- 使用 [SWC](./swc.md) 替代 tsc 提升编译速度
- 合理配置数据库连接池
- 实施适当的缓存策略
- 监控应用性能指标
- 优化资源打包大小

通过这些实用食谱，您可以快速构建高质量、安全、可维护的 NestJS 应用程序。每个食谱都包含详细的实现步骤和最佳实践建议。
