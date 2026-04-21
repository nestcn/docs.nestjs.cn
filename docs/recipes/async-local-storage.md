### Async Local Storage

`AsyncLocalStorage` 是一个 [Node.js API](https://nodejs.org/api/async_context.html#class-asynclocalstorage)（基于 `async_hooks` API），它为应用程序提供了一种不需要显式将局部状态作为函数参数的方式来传播局部状态。它类似于其他语言中的线程本地存储。

Async Local Storage 的主要思想是可以将某个函数调用包装在 `run()` 调用中。所有在包装调用中调用的代码都可以访问同一个存储实例，该存储实例将独特地与每个调用链相关。

在 NestJS 中，这意味着如果我们可以找到在请求的生命周期中将剩余的请求代码包装起来，我们就可以访问和修改仅对该请求可见的状态，这可能会作为 REQUEST-scoped 提供者的替代方案和一些限制的解决方案。

另外，我们可以使用 ALS 来传播某个系统的上下文（例如 _transaction_ 对象），而不需要将其显式传递给服务，这可以增加隔离和封装。

#### 自定义实现

NestJS 自身不提供任何内置抽象来实现 `AsyncLocalStorage`，因此让我们通过实现最简单的 HTTP 情况来了解整个概念：

>  info **信息** 对于现成的 `nestjs-cls` 包，继续阅读下面的内容。

1. 首先，创建一个新的 `AsyncLocalStorage` 实例在共享源文件中。由于我们使用 NestJS,让我们将其转换为一个模块的自定义提供者。

```typescript
// src/async-local-storage/async-local-storage.module.ts
import { Module, Global } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Global()
@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
  ],
  exports: [AsyncLocalStorage],
})
export class AsyncLocalStorageModule {}

```

>  info **提示** `AsyncLocalStorage` 从 `async_hooks` 导入。

2. 我们只关心 HTTP，因此使用一个中间件将 `next()` 函数包装在 `run()` 中。由于中间件是请求的第一个触摸点，这将使存储在所有增强器和系统中可用。

```typescript
// src/async-local-storage/async-local-storage.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class AsyncLocalStorageMiddleware implements NestMiddleware {
  constructor(private readonly asyncLocalStorage: AsyncLocalStorage) {}

  use(req: any, res: any, next: () => void) {
    this.asyncLocalStorage.run(new Map(), next);
  }
}

```

3. 现在，在请求的生命周期中任何地方，我们都可以访问本地存储实例。

```typescript
// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class AppService {
  constructor(private readonly asyncLocalStorage: AsyncLocalStorage) {}

  getHello(): string {
    const store = this.asyncLocalStorage.getStore() as Map<string, any>;
    store.set('requestId', '12345');
    return 'Hello World!';
  }

  getRequestId(): string {
    const store = this.asyncLocalStorage.getStore() as Map<string, any>;
    return store.get('requestId');
  }
}

```

4. 这样，我们就有了一种共享请求相关状态的方法，而不需要注入整个 `Request` 对象。

>  warning **警告** 请注意，虽然这种技术对很多用例非常有用，但它隐式地混淆了代码流程（创建隐式上下文），因此在使用时要小心，并且避免创建上下文地狱。

### NestJS CLS

`nestjs-cls` 包提供了使用 plain `AsyncLocalStorage` 的多个 DX 改进。它将实现抽象到一个模块中，该模块提供了多种方式来初始化 CLS 对于不同传输方式（不仅限于 HTTP），并且提供了强类型支持。

可以使用 injectable `ClsService` 访问存储，或者将其抽象化到业务逻辑中使用装饰器。

>  info **信息** `nestjs-cls` 是一个第三方包，不是 NestJS 核心团队管理的包。请在 GitHub 仓库报告任何与库相关的问题。

#### 安装

除了对 `@nestjs/common` 的 peer 依赖关系，它只使用 Node.js 的内置 API。安装它像安装其他包一样。

```bash
$ npm i nestjs-cls

```

#### 使用

可以使用 `nestjs-cls` 来实现类似的功能：

1. 在根模块中导入 `ClsModule`。

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
  ],
})
export class AppModule {}

```

2. 然后可以使用 `ClsService` 访问存储值。

```typescript
// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AppService {
  constructor(private readonly cls: ClsService) {}

  getHello(): string {
    this.cls.set('requestId', '12345');
    return 'Hello World!';
  }

  getRequestId(): string {
    return this.cls.get('requestId');
  }
}

```

3. 要获得强类型的存储值，使用可选的泛型类型参数注入它。

```typescript
// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

interface ClsStore {
  requestId: string;
  userId: number;
}

@Injectable()
export class AppService {
  constructor(private readonly cls: ClsService<ClsStore>) {}

  getHello(): string {
    this.cls.set('requestId', '12345');
    this.cls.set('userId', 1);
    return 'Hello World!';
  }

  getRequestId(): string {
    return this.cls.get('requestId');
  }

  getUserId(): number {
    return this.cls.get('userId');
  }
}

```

>  info **提示** 也可以使用 `ClsModule` 自动生成请求 ID，并使用 `ClsService` 获取整个请求对象。

#### 测试

由于 `ClsService` 只是一个可注入的提供者，可以在单元测试中完全模拟它。

然而，在某些集成测试中，我们可能仍然需要使用实际的 `ClsService` 实现。 在这种情况下，我们需要将上下文相关代码包装在 `cls.run()` 或 `cls.enter()` 调用中。

```typescript
// src/app.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule, ClsService } from 'nestjs-cls';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let cls: ClsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModule.forRoot({ global: true })],
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
    cls = module.get<ClsService>(ClsService);
  });

  it('should set and get requestId', () => {
    cls.run(() => {
      service.getHello();
      expect(service.getRequestId()).toBe('12345');
    });
  });
});

```

#### 更多信息

访问 GitHub 仓库查看完整的 API 文档和更多代码示例。
