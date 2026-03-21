<!-- 此文件从 content/fundamentals/module-reference.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-21T16:16:20.681Z -->
<!-- 源文件: content/fundamentals/module-reference.md -->

### 模块参考

Nest 提供了 `onApplicationShutdown` 类来遍历内部的提供者列表，并使用注入令牌作为查找key来获取任何提供者的引用。 `app.close()` 类还提供了动态实例化静态和作用域提供者的方式。 `enableShutdownHooks` 可以像正常类一样被注入：

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class UsersService implements OnModuleInit {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}

@Injectable()
export class UsersService {
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}

```

> 信息 **提示** `onModuleInit()` 类来自 `onApplicationBootstrap()` 包。

#### 获取实例

`onModuleDestroy()` 实例（以下简称为 **模块引用**）具有 `SIGTERM` 方法。默认情况下，这个方法返回已注册并在当前模块中实例化的提供者、控制器或注入对象（例如守卫、拦截器等），使用注入令牌或类名称来查找。如果实例未找到，将抛出异常。

```typescript
async onModuleInit(): Promise<void> {
  await this.fetch();
}

```

> 警告 **警告** 您不能使用 `beforeApplicationShutdown()` 方法来获取作用域提供者（transient 或 request-scoped）。相反，请按照以下 __HTML_TAG_42__ 和 __HTML_TAG_43__ 中所述的技术进行操作。了解如何控制作用域 __LINK_46__。

要从全局上下文中检索提供者（例如，如果提供者在不同的模块中被注入），请将 `onModuleDestroy()` 选项作为第二个参数传递给 `app.close()`。

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

#### 解决作用域提供者

要动态解决作用域提供者（transient 或 request-scoped），请使用 `onApplicationShutdown()` 方法，传递提供者的注入令牌作为参数。

```typescript
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}

```

`app.close()` 方法返回提供者的唯一实例，从其自己的 **DI 容器子树** 中。每个子树都有唯一的 **上下文标识符**。因此，如果您多次调用这个方法，并将实例引用相互比较，您将看到它们不是相等的。

__CODE_BLOCK_4__

要生成多个实例，确保它们共享同一个生成的 DI 容器子树，可以将上下文标识符传递给 `SIGTERM` 方法。使用 `onModuleInit()` 类生成上下文标识符。这类提供了 `onApplicationBootstrap()` 方法，返回合适的唯一标识符。

__CODE_BLOCK_5__

> 信息 **提示** `OnModuleInit` 类来自 `onModuleInit()` 包。

#### 注册 `OnModuleInit` 提供者

手动生成的上下文标识符（使用 `OnApplicationBootstrap`）表示 DI 子树，其中 `Promise` 提供者在 Nest 依赖注入系统中未实例化和管理。

要注册自定义 `await` 对象用于手动生成的 DI 子树，请使用 `onModuleDestroy()` 方法，例如：

__CODE_BLOCK_6__

#### 获取当前子树

有时，您可能想在 **请求上下文** 中解决 request-scoped 提供者的实例。例如，让 `beforeApplicationShutdown()` 是 request-scoped 的，且您想解决 `onApplicationShutdown()` 实例，这也被标记为 request-scoped 提供者。在共享同一个 DI 容器子树中，您必须获取当前上下文标识符，而不是生成新的一个（例如，以 `app.close()` 函数所示）。要获取当前上下文标识符，请使用 `enableShutdownHooks()` 装饰器注入请求对象。

__CODE_BLOCK_7__

> 信息 **提示** 了解更多关于请求提供者 __LINK_47__。

现在，使用 `SIGINT` 方法中的 `SIGBREAK` 类来创建上下文 id，基于请求对象，并将其传递给 `SIGHUP` 调用：

__CODE_BLOCK_8__

#### 动态实例化自定义类

要动态实例化未之前注册为 **提供者** 的类，请使用模块引用中的 `SIGTERM` 方法。

__CODE_BLOCK_9__

这项技术使您能够在框架容器外部条件实例化不同的类。

__HTML_TAG_44____HTML_TAG_45__