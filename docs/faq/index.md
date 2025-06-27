# 常见问题 FAQ

本节收录了 NestJS 使用过程中的常见问题与解答，帮助开发者快速解决遇到的问题和挑战。

## 错误排查

### 常见错误类型

- **模块导入错误** - 循环依赖和模块配置问题
- **依赖注入问题** - 提供者注册和作用域问题
- **装饰器错误** - 装饰器使用和元数据问题
- **路由冲突** - 路径匹配和参数冲突
- **中间件问题** - 执行顺序和配置错误

### 调试技巧

- 启用详细日志记录
- 使用 NestJS DevTools
- 检查模块依赖图
- 验证提供者注册

## 应用架构

### 生命周期管理

- **应用启动** - 模块初始化顺序
- **请求处理** - 中间件、守卫、拦截器执行流程
- **应用关闭** - 优雅关闭和资源清理

### 多服务器支持

- **负载均衡** - 多实例部署策略
- **会话共享** - 分布式会话管理
- **缓存同步** - 多实例缓存一致性

## 部署相关

### Serverless 部署

- **AWS Lambda** - 无服务器部署配置
- **Vercel** - 前端友好的部署平台
- **Netlify Functions** - JAMstack 架构支持
- **冷启动优化** - 减少启动时间

### 性能优化

- **内存管理** - 避免内存泄漏
- **连接池** - 数据库连接优化
- **缓存策略** - 提高响应速度
- **代码分割** - 减少包大小

## 集成问题

### HTTP 适配器

- **Express vs Fastify** - 选择合适的 HTTP 框架
- **中间件兼容性** - 第三方中间件集成
- **性能对比** - 不同适配器的性能特点

### 混合应用

- **微服务集成** - HTTP 服务与微服务结合
- **WebSocket 集成** - 实时通信支持
- **GraphQL 集成** - API 架构选择

## 开发最佳实践

### 代码组织

- **模块设计** - 合理的模块划分
- **目录结构** - 可维护的项目结构
- **命名规范** - 一致的命名约定

### 测试策略

- **单元测试** - 服务和控制器测试
- **集成测试** - 端到端测试
- **测试覆盖率** - 代码质量保证

## 常见问题解答

### Q: 如何解决循环依赖问题？

**A:** 循环依赖是 NestJS 中常见的问题，可以通过以下方式解决：

1. **使用 forwardRef()**：
```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService,
  ) {}
}
```

2. **重构模块结构**：
```typescript
// 将共享逻辑提取到单独的模块
@Module({
  exports: [CommonService],
})
export class SharedModule {}
```

### Q: 如何处理全局前缀问题？

**A:** 使用 `setGlobalPrefix()` 方法：

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(3000);
}
```

### Q: 如何保持长连接？

**A:** 配置 keep-alive 连接：

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 启用 keep-alive
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  
  await app.listen(3000);
}
```

### Q: 如何获取原始请求体？

**A:** 使用 raw-body 中间件：

```typescript
import { NestFactory } from '@nestjs/core';
import { raw } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use('/webhook', raw({ type: 'application/json' }));
  
  await app.listen(3000);
}
```

### Q: 如何在 Serverless 环境中部署？

**A:** Serverless 部署需要特殊配置：

```typescript
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { Context, Handler } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    await nestApp.init();
    cachedServer = createServer(expressApp);
  }
  return cachedServer;
}

export const handler: Handler = async (event: any, context: Context) => {
  const server = await bootstrap();
  return proxy(server, event, context, 'PROMISE').promise;
};
```

## 性能优化建议

### 1. 启动优化

- 使用懒加载模块
- 优化依赖注入
- 减少模块导入

### 2. 运行时优化

- 实施缓存策略
- 使用连接池
- 优化数据库查询

### 3. 内存管理

- 监控内存使用
- 及时清理资源
- 避免内存泄漏

## 调试工具

### NestJS DevTools

- 可视化模块依赖
- 监控应用性能
- 调试路由问题

### 日志记录

```typescript
import { Logger } from '@nestjs/common';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get()
  getHello(): string {
    this.logger.log('处理 GET 请求');
    return 'Hello World!';
  }
}
```

## 相关章节

- [错误处理](./errors.md) - 常见错误排查
- [全局前缀](./global-prefix.md) - 全局前缀配置
- [HTTP 适配器](./http-adapter.md) - HTTP 框架选择
- [混合应用](./hybrid-application.md) - 混合架构
- [长连接](./keep-alive-connections.md) - 连接管理
- [多服务器](./multiple-servers.md) - 多实例部署
- [原始请求体](./raw-body.md) - 请求体处理
- [请求生命周期](./request-lifecycle.md) - 请求处理流程
- [Serverless](./serverless.md) - 无服务器部署

通过这些常见问题的解答，您可以更好地理解和使用 NestJS，避免常见的陷阱并构建高质量的应用程序。
