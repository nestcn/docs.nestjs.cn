# 安全

安全是大多数应用程序的重要组成部分。有很多不同的方法和策略来处理身份验证。任何项目采用的方法都取决于其特定的应用程序要求。本章节介绍了可以适应各种不同要求的几种安全方法。

## 核心安全概念

### 认证 (Authentication)

认证是验证用户身份的过程。通常涉及：

- **身份验证** - 验证用户提供的凭据
- **会话管理** - 维护用户的登录状态
- **令牌管理** - 使用 JWT 或其他令牌标准

### 授权 (Authorization)

授权是确定经过身份验证的用户是否有权访问特定资源的过程：

- **基于角色的访问控制 (RBAC)** - 基于用户角色的权限管理
- **基于属性的访问控制 (ABAC)** - 基于属性的细粒度权限控制
- **资源保护** - 保护敏感的 API 端点和数据

## 主要安全功能

### 身份验证系统

- **JWT 令牌** - JSON Web Token 认证
- **会话认证** - 基于会话的认证
- **OAuth 2.0** - 第三方登录集成
- **Passport 集成** - 多种认证策略支持
- **多因素认证 (MFA)** - 增强安全性

### 安全防护

- **CORS 配置** - 跨域资源共享控制
- **CSRF 防护** - 跨站请求伪造防护
- **XSS 防护** - 跨站脚本攻击防护
- **SQL 注入防护** - 数据库安全
- **输入验证** - 数据验证和清理

### 安全头部

- **Helmet** - 设置各种 HTTP 头部
- **内容安全策略 (CSP)** - 防止代码注入
- **HSTS** - HTTP 严格传输安全
- **X-Frame-Options** - 防止点击劫持

## 快速开始

### 安装依赖

```bash
# JWT 认证
$ npm install --save @nestjs/jwt
```

# Passport 集成
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local

# 安全头部
$ npm install --save helmet

# CORS 支持
$ npm install --save @nestjs/cors

# 速率限制
$ npm install --save @nestjs/throttler
```

### 基本 JWT 认证

#### 1. 创建认证模块

```bash
$ nest g module auth
$ nest g controller auth  
$ nest g service auth
```

#### 2. 实现认证服务

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    const payload = { sub: user.userId, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  private async validateUser(username: string, password: string) {
    // 实现用户验证逻辑
    // 在真实应用中，这里应该查询数据库并验证密码哈希
  }
}
```

#### 3. 配置 JWT 模块

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  // ...
})
export class AuthModule {}
```

#### 4. 创建认证守卫

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException();
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

#### 5. 保护路由

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Controller('protected')
export class ProtectedController {
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
```

## 安全配置

### CORS 配置

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  
  await app.listen(3000);
}
bootstrap();
```

### Helmet 安全头部

```typescript
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        scriptSrc: [`'self'`],
        imgSrc: [`'self'`, 'data:', 'https:'],
      },
    },
  }));
  
  await app.listen(3000);
}
```

### 速率限制

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
})
export class AppModule {}
```

## 高级安全功能

### 基于角色的访问控制 (RBAC)

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### 密码加密

```typescript
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

### API 密钥认证

```typescript
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    
    return this.validateApiKey(apiKey);
  }

  private validateApiKey(apiKey: string): boolean {
    return apiKey === process.env.VALID_API_KEY;
  }
}
```

## 安全最佳实践

### 1. 密码安全

- 使用强密码策略
- 实施密码加密存储
- 支持密码重置功能
- 考虑多因素认证

### 2. 令牌管理

- 设置合理的令牌过期时间
- 实现令牌刷新机制
- 支持令牌撤销
- 安全存储敏感密钥

### 3. 输入验证

- 验证所有用户输入
- 使用白名单而非黑名单
- 防止 SQL 注入
- 清理和转义输出

### 4. 传输安全

- 始终使用 HTTPS
- 实施 HSTS
- 验证 SSL 证书
- 配置安全的 Cookie

### 5. 错误处理

- 不泄露敏感信息
- 实现统一错误处理
- 记录安全事件
- 监控异常活动

## 官方认证课程

NestJS 提供专业的认证和授权课程：

- 19 章深入内容
- 认证和授权最佳实践
- 官方认证证书
- 深度学习会话

[购买认证课程](https://courses.nestjs.com/#认证)

## 示例应用

完整的认证示例可在[这里](https://github.com/nestjs/nest/tree/master/sample/19-auth-jwt)找到。

## 相关章节

- [认证](./authentication.md) - 用户身份验证
- [授权](./authorization.md) - 访问控制
- [加密和哈希](./encryption-and-hashing.md) - 数据加密
- [Helmet](./helmet.md) - 安全头部
- [CORS](./cors.md) - 跨域配置
- [CSRF 防护](./csrf.md) - 跨站请求伪造防护
- [速率限制](./rate-limiting.md) - API 速率控制

通过实施这些安全措施，您可以构建安全、可靠的 NestJS 应用程序，保护用户数据和系统资源免受各种安全威胁。
