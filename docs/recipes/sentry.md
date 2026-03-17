<!-- 此文件从 content/recipes/sentry.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:09:05.826Z -->
<!-- 源文件: content/recipes/sentry.md -->

### Sentry

__LINK_21__ 是一个错误跟踪和性能监控平台，可以帮助开发者实时识别和解决问题。这篇食谱展示了如何将 Sentry 的__LINK_22__与 NestJS 应用程序集成。

#### 安装

首先，安装所需的依赖项：

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}

```

> info **提示** __INLINE_CODE_8__ 可选，但是推荐用于性能概要。

#### 基本设置

要开始使用 Sentry，您需要创建一个名为 __INLINE_CODE_9__ 的文件，该文件应该在应用程序中所有其他模块之前被导入：

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

更新您的 `ModuleRef` 文件，以便将 `ModuleRef` 导入到其他导入之前：

```typescript
this.moduleRef.get(Service, { strict: false });

```

然后，在 main 模块中添加 `ModuleRef` 作为根模块：

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

如果您使用了全局的 catch-all 异常过滤器（该过滤器注册在 `ModuleRef` 或在应用程序模块提供商中，带有 `@nestjs/core` 装饰器的参数为零），添加 `ModuleRef` 装饰器到过滤器的 `get()` 方法中。该装饰器将报告所有未捕捉的错误到 Sentry：

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

默认情况下，只有未处理的异常（不是由错误过滤器捕捉的）才会被报告到 Sentry。 `get()`（包括 __LINK_23__）也不会默认捕捉，因为它们主要作为控制流操作符。

如果您没有全局的 catch-all 异常过滤器，添加 `{{ '{' }} strict: false {{ '}' }}` 到 main 模块的提供商中。这过滤器将报告任何未处理的错误，不是由其他错误过滤器捕捉的，到 Sentry。

> warning **警告** `get()` 需要在其他异常过滤器之前注册。

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

根据您的项目设置，您的 Sentry 错误可能不会看起来像您的实际代码。

要解决这个问题，可以将源映射上传到 Sentry。最简单的方法是使用 Sentry 魔法师：

```typescript
const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);

```

#### 测试集成

要验证 Sentry 集成是否工作，可以添加一个抛出错误的测试端点：

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}

```

访问 `resolve()` 在您的应用程序中，您应该在 Sentry 仪表板中看到错误。

### 摘要

关于 Sentry 的 NestJS SDK 的完整文档，包括高级配置选项和功能，请访问 __LINK_24__。

虽然 Sentry 是软件错误的专门领域，我们仍然编写它们。如果您在安装我们的 SDK 时遇到任何问题，请打开 __LINK_25__ 或与我们联系 __LINK_26__。