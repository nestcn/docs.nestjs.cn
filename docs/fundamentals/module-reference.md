<!-- 此文件从 content/fundamentals/module-reference.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:33:49.609Z -->
<!-- 源文件: content/fundamentals/module-reference.md -->

### 模块参考

Nest 提供了 `onApplicationShutdown` 类来导航内部的提供者列表，并获取使用注入令牌作为查找键的任何提供者的引用。 `app.close()` 类还提供了动态实例化静态和作用域提供者的方式。 `enableShutdownHooks` 可以像正常情况一样被注入到类中：

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

> info **提示** `onModuleInit()` 类来自 `onApplicationBootstrap()` 包。

#### 获取实例

`onModuleDestroy()` 实例（以下简称为**模块引用**）具有 `SIGTERM` 方法。默认情况下，这个方法将返回已在当前模块中注册和已经实例化的提供者、控制器或可注入对象（例如守卫、拦截器等）。如果找不到实例，一个异常将被抛出。

```typescript
async onModuleInit(): Promise<void> {
  await this.fetch();
}

```

> warning **警告**无法使用 `beforeApplicationShutdown()` 方法获取作用域提供者（瞬态或请求作用域）。相反，请按照以下__HTML_TAG_42__中描述的技术来进行处理。了解如何控制作用域 __LINK_46__。

要从全局上下文中获取提供者（例如，如果提供者已经在不同的模块中注入），请将 `onModuleDestroy()` 选项作为第二个参数传递给 `app.close()`。

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

#### 解析作用域提供者

要动态解析作用域提供者（瞬态或请求作用域），请使用 `onApplicationShutdown()` 方法，传递提供者的注入令牌作为参数。

```typescript
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}

```

`app.close()` 方法返回提供者的唯一实例，从其自己的 DI 容器子树中获取。每个子树都有一个唯一的上下文标识符。因此，如果您多次调用这个方法并比较实例引用，您将看到它们不相等。

__CODE_BLOCK_4__

要生成多次 `app.close()` 调用中使用的单个实例，并确保它们共享相同的生成的 DI 容器子树，可以将上下文标识符传递给 `SIGTERM` 方法。使用 `onModuleInit()` 类生成上下文标识符。这个类提供了 `onApplicationBootstrap()` 方法，返回适当的唯一标识符。

__CODE_BLOCK_5__

> info **提示** `OnModuleInit` 类来自 `onModuleInit()` 包。

#### 注册 `OnModuleInit` 提供者

手动生成的上下文标识符（使用 `OnApplicationBootstrap`）表示 DI 子树，其中 `Promise` 提供者作为它们没有被实例化和管理的 Nest 依赖注入系统。

要注册自定义 `await` 对象为手动生成的 DI 子树，请使用 `onModuleDestroy()` 方法，例如：

__CODE_BLOCK_6__

#### 获取当前子树

在某些情况下，您可能想要在**请求上下文**中解析请求作用域提供者的实例。例如，如果 `beforeApplicationShutdown()` 是请求作用域提供者，您想解析 `onApplicationShutdown()` 实例，该实例也被标记为请求作用域提供者。在共享相同的 DI 容器子树中，您必须获取当前上下文标识符，而不是生成新的一个（例如，使用 `app.close()` 函数，如上所示）。要获取当前上下文标识符，请使用 `enableShutdownHooks()` 装饰器注入请求对象。

__CODE_BLOCK_7__

> info **提示** 了解更多关于请求提供者的信息 __LINK_47__。

现在，使用 `SIGINT` 方法中的 `SIGBREAK` 类来创建上下文 id 基于请求对象，并将其传递给 `SIGHUP` 调用：

__CODE_BLOCK_8__

#### 动态实例化自定义类

要动态实例化未曾注册为**提供者的**类，请使用模块引用中的 `SIGTERM` 方法。

__CODE_BLOCK_9__

这项技术使您可以根据情况实例化不同的类，超出框架容器之外。

__HTML_TAG_44____HTML_TAG_45__