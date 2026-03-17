<!-- 此文件从 content/recipes/sentry.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:36:20.995Z -->
<!-- 源文件: content/recipes/sentry.md -->

### Sentry

__LINK_21__ 是一个错误跟踪和性能监控平台，帮助开发者实时识别和修复问题。这个配方展示了如何将 Sentry 的 __LINK_22__ 与 NestJS 应用程序集成。

#### 安装

首先，安装必要的依赖项：

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}

```

> 信息 **提示** __INLINE_CODE_8__ 可以是可选的，但是为了性能分析推荐使用。

#### 基本设置

要开始使用 Sentry，需要创建一个名为 __INLINE_CODE_9__ 的文件，该文件在应用程序中被导入：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

```

更新您的 `ModuleRef` 文件，以便在其他导入之前导入 `ModuleRef`：

```typescript
this.moduleRef.get(Service, { strict: false });

```

然后，在您的 main 模块中添加 `ModuleRef` 作为根模块：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}

```

#### 异常处理

如果您正在使用全局 catch-all 异常过滤器（即使用 `ModuleRef` 注册的过滤器或在应用程序提供商注解为 `@nestjs/core` 装饰器的过滤器），请在过滤器的 `get()` 方法中添加 `ModuleRef` 装饰器。这个装饰器将报告所有未捕获的错误到 Sentry：

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}

```

缺省情况下，只有未处理的异常（不是由错误过滤器捕获的）才会被报告到 Sentry。 `get()`（包括 __LINK_23__）默认情况下不被捕获，因为它们主要是控制流的载体。

如果您没有全局 catch-all 异常过滤器，请将 `{{ '{' }} strict: false {{ '}' }}` 添加到您的 main 模块的提供商中。这将报告任何未处理的错误（不是由其他错误过滤器捕获的）到 Sentry。

> 警告 **警告** `get()` 需要在其他异常过滤器之前注册。

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}

```

#### 可读的堆栈跟踪

根据您的项目设置，Sentry 错误中的堆栈跟踪可能看起来不是您的实际代码。

要解决这个问题，可以将您的源映射上传到 Sentry。最简单的方法是使用 Sentry 导航器：

```typescript
const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);

```

#### 测试集成

要验证 Sentry 集成是否正确，可以添加一个抛出错误的测试端点：

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}

```

访问 `resolve()` 在您的应用程序中，您应该看到错误出现在您的 Sentry 仪表盘上。

### 概要

有关 Sentry 的 NestJS SDK 的完整文档，包括高级配置选项和功能，请访问 __LINK_24__。

即使软件错误是 Sentry 的事，我们仍然编写它们。如果您在安装我们的 SDK 时遇到任何问题，请打开 __LINK_25__ 或访问 __LINK_26__。