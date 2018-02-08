# 中间件

中间件是一个函数，在路由处理器之前被调用。 中间件功能可以访问请求和响应对象，以及应用程序请求响应周期中的下一个中间件功能。下一个中间件函数通常由名为 `next` 的变量表示。

<center>![图1](https://docs.nestjs.com/assets/Middlewares_1.png)</center>

Nest中间件实际上等于表示中间件。 从Express官方文档复制的中间件功能有很多：


> 中间件函数可以执行以下任务:
- 执行任何代码。
- 对请求和响应对象进行更改。
- 结束请求-响应周期。
- 调用堆栈中的下一个中间件函数。
- 如果当前的中间件函数没有结束请求-响应周期, 它必须调用 `next()` 将控制传递给下一个中间件函数。否则, 请求将被挂起。

Nest中间件是一个带有 `@Middleware()` 装饰器的类。 这个类应该实现NestMiddleware接口。 我们来创建一个例子，`LoggerMiddleware` 类:

> logger.middleware.ts

```typescript
import { Middleware, NestMiddleware, ExpressMiddleware } from '@nestjs/common';

@Middleware()
export class LoggerMiddleware implements NestMiddleware {
  resolve(...args: any[]): ExpressMiddleware {
    return (req, res, next) => {
      console.log('Request...');
      next();
    };
  }
}
```

该 `resolve()` 方法必须返回正则表达式中间件 `(req, res, next) => void`

## 依赖注入

说到中间件, 也不例外。与组件和控制器相同, 它们可以通过属于同一模块的构造函数来注入依赖项。


## 中间件放在哪里

中间件不能在 `@Module()` 装饰器中列出。我们必须使用 `configure()` 模块类的方法来设置它们。包含中间件的模块必须实现 `NestModule` 接口。让我们设置 `LoggerMiddleware` 在 `ApplicationModule` 关卡上。

> app.module.ts 

```typescript
import { Module, NestModule, MiddlewaresConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
    imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(LoggerMiddleware).forRoutes(
            { path: '/cats', method: RequestMethod.GET },
            { path: '/cats', method: RequestMethod.POST },
        );
    }
}
```

?> 我们可以通过这里 `(inside forRoutes())`  的单一对象, 只是使用 `RequestMethod.ALL` 。


在上面的例子中, 我们已经设置了 `LoggerMiddleware` 的 `/cats` 的路由处理程序, 我们已经在 CatsController 注册。MiddlewareConsumer 是一个帮助类。它提供了几种使用中间件的方法。他们都可以简单地链接。让我们来看看这些方法。


在 `forRoutes()` 可采取单个对象，多个对象，控制器类和甚至多个控制器类。在大多数情况下，你可能只是通过控制器，并用逗号分隔。以下是单个控制器的示例

> app.module.ts

```typescript
import { Module, NestModule, MiddlewaresConsumer, RequestMethod } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
    imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(LoggerMiddleware).forRoutes(CatsController);
    }
}
```

?> 该 `apply()` 方法可以采用单个中间件或一组中间件。

## 将参数传递给中间件

有时中间件的行为取决于自定义值，例如用户角色数组，选项对象等。我们可以将其他参数传递给 `resolve()` 来使用 `with()` 方法。看下面的例子：

> app.moudle.ts

```typescript
import { Module, NestModule, MiddlewaresConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
    imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(LoggerMiddleware)
            .with('ApplicationModule')
            .forRoutes(CatsController);
    }
}
```

我们已经通过了一个自定义字符串 - `ApplicationModule` 的 `with()` 方法。现在我们必须调整 `LoggerMiddleware` 的 `resolve()` 方法。

> logger.middleware.ts

```typescript
import { Middleware, NestMiddleware, ExpressMiddleware } from '@nestjs/common';

@Middleware()
export class LoggerMiddleware implements NestMiddleware {
  resolve(name: string): ExpressMiddleware {
    return (req, res, next) => {
      console.log(`[${name}] Request...`); // [ApplicationModule] Request...
      next();
    };
 }
}
```

该 `name` 的属性值将是 `ApplicationModule`。

## 异步中间件

从解析 `resolve()` 返回异步函数没有禁忌。另外，也可以制作这个 `resolve()` 方法 `async`。这种模式被称为异步中间件。

> logger.middleware.ts

```typescript
import { Middleware, NestMiddleware, ExpressMiddleware } from '@nestjs/common';

@Middleware()
export class LoggerMiddleware implements NestMiddleware {
  async resolve(name: string): Promise<ExpressMiddleware> {
    await someAsyncFn();

    return async (req, res, next) => {
      await someAsyncFn();
      console.log(`[${name}] Request...`); // [ApplicationModule] Request...
      next();
    };
 }
}
```

`LoggerMiddleware` 很短。它没有成员，没有额外的方法，没有依赖关系。为什么我们不能只使用一个简单的函数？这是一个很好的问题，因为事实上 - 我们可以做到。这种类型的中间件称为功能中间件。让我们把记录器转换成函数。

> logger.middleware.ts

```typescript
export const loggerMiddleware = (req, res, next) => {
  console.log(`Request...`);
  next();
};
```

现在在 `ApplicationModule` 中使用它。

> app.module.ts

```typescript
import { Module, NestModule, MiddlewaresConsumer } from '@nestjs/common';
import { loggerMiddleware } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewaresConsumer): void {
    consumer.apply(loggerMiddleware).forRoutes(CatsController);
  }
}
```

?> 当您的中间件没有任何依赖关系时，我们可以考虑使用功能中间件。


