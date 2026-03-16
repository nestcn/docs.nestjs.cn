<!-- 此文件从 content/microservices/interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:23:27.238Z -->
<!-- 源文件: content/microservices/interceptors.md -->

### 拦截器

与微服务拦截器没有区别。以下示例使用了手动实例化的方法作用域拦截器。与基于 HTTP 的应用程序一样，你也可以使用控制器作用域拦截器（即在控制器类前缀一个 __INLINE_CODE_1__ 装饰器）。

```typescript
// example.interceptor.ts
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class ExampleInterceptor {
  intercept(request: Request, response: Response, next: () => void) {
    // Do something before the request is processed
    next();
    // Do something after the request is processed
  }
}

```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ExampleInterceptor } from './example.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  providers: [ExampleInterceptor],
  controllers: [AppController],
  services: [AppService],
})
export class AppModule {}

```

```typescript
// app.controller.ts
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ExampleInterceptor } from './example.interceptor';

@Controller()
@UseInterceptors(ExampleInterceptor)
export class AppController {
  @Get()
  hello() {
    return 'Hello World!';
  }
}

```