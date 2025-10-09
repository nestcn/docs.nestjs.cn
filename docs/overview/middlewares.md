# 中间件

中间件是在路由处理程序**之前**调用的函数。中间件函数可以访问[请求](https://expressjs.com/en/4x/api.html#req)和[响应](https://expressjs.com/en/4x/api.html#res)对象，以及应用程序请求-响应周期中的 `next()` 中间件函数。 **下一个**中间件函数通常由名为 `next` 的变量表示。

<figure><img class="illustrative-image" src="/assets/Middlewares_1.png" /></figure>

默认情况下，Nest 中间件等同于 [express](https://expressjs.com/en/guide/using-middleware.html) 中间件。以下来自 express 官方文档的描述说明了中间件的功能：

<blockquote class="external">
  中间件函数可以执行以下任务：
  <ul>
    <li>执行任意代码。</li>
    <li>修改请求和响应对象。</li>
    <li>结束请求-响应周期。</li>
    <li>调用堆栈中的下一个中间件函数。</li>
    <li>如果当前中间件函数没有结束请求-响应周期，它必须调用 <code>next()</code> 将控制权传递给下一个中间件函数。否则，请求将被挂起。</li>
  </ul>
</blockquote>

您可以在函数中或在带有 `@Injectable()` 装饰器的类中实现自定义 Nest 中间件。该类应该实现 `NestMiddleware` 接口，而函数没有任何特殊要求。让我们首先使用类方法实现一个简单的中间件功能。

:::warning 警告
`Express` 和 `fastify` 处理中间件的方式不同，并提供不同的方法签名，更多信息请阅读[此处](/techniques/performance#中间件)。
:::

 ```typescript title="logger.middleware.ts"
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
```

#### Dependency injection

Nest 中间件完全支持依赖注入。与提供者和控制器一样，它们能够**注入依赖项** ，这些依赖项在同一模块中可用。通常，这是通过 `constructor` 完成的。

#### 应用中间件

在 `@Module()` 装饰器中没有中间件的位置。相反，我们使用模块类的 `configure()` 方法来设置它们。包含中间件的模块必须实现 `NestModule` 接口。让我们在 `AppModule` 级别设置 `LoggerMiddleware`。

 ```typescript title="app.module.ts"
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

在上述示例中，我们为之前定义在 `CatsController` 中的 `/cats` 路由处理器配置了 `LoggerMiddleware`。在配置中间件时，我们还可以通过向 `forRoutes()` 方法传递包含路由 `path` 和请求 `method` 的对象来进一步限制中间件仅适用于特定请求方法。在下面的示例中，请注意我们导入了 `RequestMethod` 枚举来引用所需的请求方法类型。

 ```typescript title="app.module.ts"
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```

:::info 提示
可以通过使用 `async/await` 使 `configure()` 方法变为异步（例如，您可以在 `configure()` 方法体内 `await` 异步操作的完成）。
:::

:::warning 警告
 使用 `express` 适配器时，NestJS 应用默认会注册 `body-parser` 包中的 `json` 和 `urlencoded` 中间件。这意味着如果你想通过 `MiddlewareConsumer` 自定义该中间件，就需要在使用 `NestFactory.create()` 创建应用时将 `bodyParser` 标志设为 `false` 来禁用全局中间件。
:::

#### 路由通配符

NestJS 中间件同样支持基于模式的路由。例如，命名通配符 (`*splat`) 可用作匹配路由中任意字符组合的通配符。在以下示例中，中间件会为所有以 `abcd/` 开头的路由执行，无论后面跟随多少字符。

```typescript
forRoutes({
  path: 'abcd/*splat',
  method: RequestMethod.ALL,
});
```

:::info 注意
`splat` 仅仅是通配参数的名称，并无特殊含义。你可以随意命名它，例如 `*wildcard`。
:::


路由路径 `'abcd/*'` 将匹配 `abcd/1`、`abcd/123`、`abcd/abc` 等路径。基于字符串的路径会原样解析连字符（`-`）和点号（`.`）。但单独的 `abcd/` 不会匹配该路由，此时需要用花括号包裹通配符以使其可选：

```typescript
forRoutes({
  path: 'abcd/{*splat}',
  method: RequestMethod.ALL,
});
```

#### 中间件消费者

`MiddlewareConsumer` 是一个辅助类，提供多个内置方法来管理中间件。这些方法都支持**链式调用**的[流畅风格](https://en.wikipedia.org/wiki/Fluent_interface) 。`forRoutes()` 方法可接收单个字符串、多个字符串、`RouteInfo` 对象、控制器类甚至多个控制器类。多数情况下只需传入逗号分隔的**控制器**列表。以下是单个控制器的示例：

 ```typescript title="app.module.ts"
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```

:::info 提示
`apply()` 方法既可接收单个中间件，也可通过多个参数指定[多个中间件](/overview/middlewares#多个中间件) 。
:::



#### 排除路由

有时，我们可能希望**排除**某些路由不应用中间件。这可以通过 `exclude()` 方法轻松实现。`exclude()` 方法接收单个字符串、多个字符串或 `RouteInfo` 对象来指定需要排除的路由。

以下是一个使用示例：

```typescript
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/{*splat}'
  )
  .forRoutes(CatsController);
```

:::info 提示
`exclude()` 方法支持使用 [path-to-regexp](https://github.com/pillarjs/path-to-regexp#parameters) 包进行通配符参数匹配。
:::



在上述示例中，`LoggerMiddleware` 将被绑定到 `CatsController` 内定义的所有路由**除了**传递给 `exclude()` 方法的三个路由。

这种方法提供了根据特定路由或路由模式灵活应用或排除中间件的能力。

#### 函数式中间件

我们一直使用的 `LoggerMiddleware` 类非常简单。它没有成员变量、没有额外方法、也没有依赖项。为什么我们不能直接用一个简单函数来定义它，而非要用类呢？实际上是可以的。这种类型的中间件被称为**函数式中间件** 。让我们将基于类的日志中间件转换为函数式中间件来说明两者的区别：

 ```typescript title="logger.middleware.ts"
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
};
```

并在 `AppModule` 中使用它：

 ```typescript title="app.module.ts"
consumer
  .apply(logger)
  .forRoutes(CatsController);
```

:::info 提示
当您的中间件不需要任何依赖项时，请考虑使用更简单的 **函数式中间件** 替代方案。
:::

#### 多个中间件

如上所述，要绑定多个按顺序执行的中间件，只需在 `apply()` 方法中提供一个逗号分隔的列表：

```typescript
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

#### 全局中间件

如果我们需要一次性将中间件绑定到所有已注册的路由，可以使用 `INestApplication` 实例提供的 `use()` 方法：

 ```typescript title="main.ts"
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(process.env.PORT ?? 3000);
```

:::info 注意
在全局中间件中无法访问 DI 容器。使用 `app.use()` 时，可以改用[函数式中间件](middleware#函数式中间件) 。或者，也可以使用类中间件并通过 `AppModule`（或其他模块）中的 `.forRoutes('*')` 来消费它。
:::

