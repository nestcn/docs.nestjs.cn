# 部署

本指南涵盖了将 NestJS 应用程序部署到各种云平台和环境的最佳实践。

## 生产环境构建

在部署之前，请确保创建一个优化的生产构建：

```bash
npm run build
```

这将在 `dist/` 目录中创建一个优化的应用程序版本。

## 环境配置

### 环境变量

使用环境变量管理不同环境的配置：

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
  ],
})
export class AppModule {}
```

### 常用环境变量

```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379
```

## 云平台部署

### Vercel

1. 在项目根目录创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts",
      "methods": ["GET", "POST", "PUT", "DELETE"]
    }
  ]
}
```

2. 部署：

```bash
npm i -g vercel
vercel
```

### Heroku

1. 创建 `Procfile`：

```
web: node dist/main
```

2. 在 `package.json` 中添加构建脚本：

```json
{
  "scripts": {
    "postinstall": "npm run build",
    "start:prod": "node dist/main"
  }
}
```

3. 部署：

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Docker

1. 创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

2. 创建 `.dockerignore`：

```
node_modules
npm-debug.log
.git
.env
```

3. 构建和运行：

```bash
docker build -t nestjs-app .
docker run -p 3000:3000 nestjs-app
```

### AWS

#### AWS Lambda

使用 `@vendia/serverless-express` 适配器：

```typescript
// lambda.ts
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import serverlessExpress from '@vendia/serverless-express';
import { Handler } from 'aws-lambda';
import express from 'express';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  await app.init();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context) => {
  server = server ?? (await bootstrap());
  return server(event, context);
};
```

#### AWS ECS

使用 Docker 容器部署到 ECS：

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
```

### 阿里云

#### 阿里云 ECS

1. 购买 ECS 实例
2. 安装 Node.js 和 PM2
3. 部署应用：

```bash
# 在服务器上
git clone your-repo
cd your-app
npm install
npm run build
pm2 start dist/main.js --name nestjs-app
pm2 startup
pm2 save
```

#### 阿里云容器服务

使用 Docker 镜像部署到阿里云容器服务 ACK。

## 进程管理

### PM2

PM2 是 Node.js 应用的生产进程管理器：

```bash
npm install -g pm2
```

#### 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'nestjs-app',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

#### 启动应用

```bash
pm2 start ecosystem.config.js --env production
pm2 startup
pm2 save
```

## 性能优化

### 启用 gzip 压缩

```typescript
// main.ts
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());
  await app.listen(3000);
}
```

### 启用 CORS

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });
  await app.listen(3000);
}
```

### 设置全局前缀

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
```

## 健康检查

### 基本健康检查

```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

## 日志管理

### 配置 Logger

```typescript
// main.ts
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn', 'log'] 
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}
```

## 安全配置

### 安全头

```typescript
// main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  await app.listen(3000);
}
```

### 速率限制

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

## 监控

### 应用性能监控

推荐使用以下 APM 工具：

- **New Relic**: 全面的应用性能监控
- **DataDog**: 基础设施和应用监控
- **Sentry**: 错误追踪和性能监控

```typescript
// 示例: Sentry 集成
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});
```

## 故障排除

### 常见问题

1. **内存泄漏**
   - 使用 `clinic.js` 或 `0x` 进行性能分析
   - 检查事件监听器是否正确移除

2. **数据库连接**
   - 确保数据库连接池配置正确
   - 检查连接字符串和权限

3. **环境变量**
   - 验证所有必需的环境变量都已设置
   - 使用 `@nestjs/config` 进行配置验证

### 调试技巧

```bash
# 启用调试模式
DEBUG=* npm run start:prod
```

# 分析内存使用
node --inspect dist/main.js
```

## 最佳实践

1. **使用 TypeScript 严格模式**
2. **实施适当的错误处理**
3. **设置适当的超时**
4. **使用连接池**
5. **实施健康检查**
6. **设置适当的日志级别**
7. **使用环境变量管理配置**
8. **实施安全最佳实践**
9. **设置监控和告警**
10. **定期备份数据**

通过遵循这些指南，你可以确保 NestJS 应用程序在生产环境中稳定、安全、高效地运行。
