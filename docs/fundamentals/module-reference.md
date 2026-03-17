<!-- 此文件从 content/fundamentals/module-reference.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:10:01.170Z -->
<!-- 源文件: content/fundamentals/module-reference.md -->

### 模块参考

Nest 提供了 ``onApplicationShutdown`` 类来遍历内部的提供者列表并获取使用注入令牌作为查找键的任何提供者的引用。同时，``app.close()`` 类也提供了动态实例化静态和作用域提供者的方式。``enableShutdownHooks`` 可以像常规类一样被注入到类中：

```typescript

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

```

> 信息 **提示** ``onModuleInit()`` 类来自 ``onApplicationBootstrap()`` 包。

#### 获取实例

``onModuleDestroy()`` 实例（在以下将其称为 **模块引用**）具有 ``SIGTERM`` 方法。默认情况下，这个方法返回注册在当前模块中使用注入令牌/类名称的提供者、控制器或可注入对象（例如守卫、拦截器等）。如果实例找不到，会抛出异常。

```typescript

```typescript
async onModuleInit(): Promise<void> {
  await this.fetch();
}

```

```

> 警告 **警告** 不能使用 ``beforeApplicationShutdown()`` 方法来获取作用域提供者（包括临时或请求作用域的）。相反，使用以下 __HTML_TAG_42__ 中描述的技术。了解如何控制作用域 __LINK_46__。

要从全局上下文中获取提供者（例如，如果提供者已经在其他模块中注入），请将 ``onModuleDestroy()`` 选项作为 ``app.close()`` 方法的第二个参数。

```typescript

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

```

#### 解析作用域提供者

要动态解析作用域提供者（包括临时或请求作用域的），使用 ``onApplicationShutdown()`` 方法，传入提供者的注入令牌。

```typescript

```typescript
@Injectable()
class UsersService implements OnApplicationShutdown {
  onApplicationShutdown(signal: string) {
    console.log(signal); // e.g. "SIGINT"
  }
}

```

```

``app.close()`` 方法返回提供者的唯一实例，从其自己的 **DI 容器子树** 中获取。这意味着，如果你多次调用这个方法并比较实例引用，你将看到它们不相等。

```typescript
__CODE_BLOCK_4__

```

要生成跨多个 ``app.close()`` 调用共享的实例，并确保它们共享同一个生成的 DI 容器子树，可以将上下文标识符传递给 ``SIGTERM`` 方法。使用 ``onModuleInit()`` 类生成上下文标识符。这类提供了 ``onApplicationBootstrap()`` 方法，该方法返回合适的唯一标识符。

```typescript
__CODE_BLOCK_5__

```

> 信息 **提示** ``OnModuleInit`` 类来自 ``onModuleInit()`` 包。

#### 注册 `OnModuleInit` 提供者

手动生成的上下文标识符（使用 ``OnApplicationBootstrap``）表示 DI 子树，在其中 `Promise` 提供者 `async`，因为它们不被 Nest 依赖注入系统实例化和管理。

要为手动创建的 DI 子树注册自定义 `await` 对象，使用 ``onModuleDestroy()`` 方法，例如：

```typescript
__CODE_BLOCK_6__

```

#### 获取当前子树

有时，你可能想要在 **请求上下文** 中解析请求作用域提供者的实例。例如，如果 `beforeApplicationShutdown()` 是请求作用域的提供者，你想解析 `onApplicationShutdown()` 实例，它也被标记为请求作用域提供者。在共享同一个 DI 容器子树中，你必须获取当前上下文标识符，而不是生成新的一个（例如，使用 ``app.close()`` 函数，如上所示）。要获取当前上下文标识符，请首先使用 ``enableShutdownHooks()`` 装饰器注入请求对象。

```typescript
__CODE_BLOCK_7__

```

> 信息 **提示** 了解更多关于请求提供者的信息 __LINK_47__。

现在，请使用 ``SIGINT`` 方法创建上下文标识符，并将其传递给 ``SIGHUP`` 调用：

```typescript
__CODE_BLOCK_8__

```

#### 动态实例化自定义类

要动态实例化未注册的自定义类，使用模块引用 ``SIGTERM`` 方法。

```typescript
__CODE_BLOCK_9__

```

这项技术使你可以在框架容器外部条件实例化不同的类。

__HTML_TAG_44____HTML_TAG_45__