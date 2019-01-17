# 中间件

中间件是一个在路由处理器**之前**被调用的函数。 中间件函数可以访问请求和响应对象，以及应用程序请求响应周期中的下一个中间件函数。**下一个**中间件函数通常由名为 `next` 的变量表示。

<center>![图1](https://docs.nestjs.com/assets/Middlewares_1.png)</center>

Nest 中间件实际上等价于 [express](http://www.expressjs.com.cn/guide/using-middleware.html) 中间件。 下面是Express官方文档中所述的中间件功能：


> 中间件函数可以执行以下任务:
- 执行任何代码。
- 对请求和响应对象进行更改。
- 结束请求-响应周期。
- 调用堆栈中的下一个中间件函数。
- 如果当前的中间件函数没有结束请求-响应周期, 它必须调用 `next()` 将控制传递给下一个中间件函数。否则, 请求将被挂起。

Nest 中间件可以是一个函数，也可以是一个带有 `@Injectable()` 装饰器的类。 这个类应该实现 `NestMiddleware` 接口。 我们来创建一个例子，`LoggerMiddleware` 类:

> logger.middleware.ts

```typescript
import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  resolve(...args: any[]): MiddlewareFunction {
    return (req, res, next) => {
      console.log('Request...');
      next();
    };
  }
}
```

该 `resolve()` 方法必须返回类库特有的常规中间件 `(req, res, next) => any`

## 依赖注入

说到中间件, 也不例外。与提供者和控制器相同, 它们能够**注入**属于统一模块的依赖项（通过 `constructor` ）。


## 应用中间件

中间件不能在 `@Module()` 装饰器中列出。我们必须使用模块类的 `configure()` 方法来设置它们。包含中间件的模块必须实现 `NestModule` 接口。我们将 `LoggerMiddleware` 设置在 `ApplicationModule` 层上。

> app.module.ts 

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('/cats');
  }
}
```

在上面的例子中, 我们给之前在`CatsController`中定义的 `/cats` 路由处理程序设置了 `LoggerMiddleware` 。此外，我们可能会将中间件限制为特定的请求方法。

> app.module.ts

```typescript
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```


## 路由通配符

路由同样支持模式匹配。例如，星号被用作**通配符**，将匹配任何字符组合。

```
forRoutes({ path: 'ab*cd', method: RequestMethod.ALL })
```

以上路由地址将匹配 `abcd` 、 `ab_cd` 、 `abecd` 等。字符 `?` 、 `+` 、 `*` 以及 `()` 是它们的正则表达式对应项的子集。连字符 (`-`) 和点 (`.`) 按字符串路径解析。


## 中间件消费者

`MiddlewareConsumer` 是一个帮助类。它提供了几种使用中间件的方法。他们都可以简单地**链接**。在 `forRoutes()` 可采取一个字符串、多个字符串、`RouteInfo` 对象、控制器类甚至多个控制器类。在大多数情况下，你可能只是通过**控制器**，并用逗号分隔。以下是单个控制器的示例

> app.module.ts

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```

?> 该 `apply()` 方法可以采用单个中间件或**一组中间件**。

在使用该类时，我们可能需要**排除**某些路径，由于使用了 `exclude()` 方法，这将是非常直观的。 

> app.module.ts

```typescript
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        { path: 'cats', method: RequestMethod.GET },
        { path: 'cats', method: RequestMethod.POST },
      )
      .forRoutes(CatsController);
  }
}
```

因此，`LoggerMiddleware` 将限制在 `CatsController` 中定义的所有路由，除了这两个传递给 `exclude()` 函数的。 请注意，`exclude()` 方法**不适用**于函数式中间件。 此外，此功能不排除来自更通用路由（例如通配符）的路径。 在这种情况下，您应该将路径限制逻辑直接放在中间件中，例如，比较请求的URL。

## 可配置中间件

有时中间件的行为取决于自定义值，例如用户角色数组，选项对象等。我们可以将其他参数传递给 `resolve()` 来使用 `with()` 方法。看下面的例子：

> app.moudle.ts

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .with('ApplicationModule')
      .forRoutes(CatsController);
  }
}
```

我们已经传递了一个自定义字符串 - `ApplicationModule` 给 `with()` 方法。现在我们必须调整 `LoggerMiddleware` 的 `resolve()` 方法。

> logger.middleware.ts

```typescript
import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  resolve(name: string): MiddlewareFunction {
    return (req, res, next) => {
      console.log(`[${name}] Request...`); // [ApplicationModule] Request...
      next();
    };
 }
}
```

该 `name` 的属性值将是 `ApplicationModule`。

## 异步中间件

从 `resolve()` 方法中返回异步函数没有禁忌。所以，`resolve()` 方法也可以写成 `async` 的。这种模式被称为 **延迟中间件** 。

> logger.middleware.ts

```typescript
import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  async resolve(name: string): Promise<MiddlewareFunction> {
    await someAsyncJob();

    return async (req, res, next) => {
      await someAsyncJob();
      console.log(`[${name}] Request...`); // [ApplicationModule] Request...
      next();
    };
 }
}
```

## 函数式中间件

`LoggerMiddleware` 很短。它没有成员，没有额外的方法，没有依赖关系。为什么我们不能只使用一个简单的函数？这是一个很好的问题，因为事实上 - 我们可以做到。这种类型的中间件称为**函数式中间件**。让我们把 logger 转换成函数。

> logger.middleware.ts

```typescript
export function logger(req, res, next) {
  console.log(`Request...`);
  next();
};
```

现在在 `ApplicationModule` 中使用它。

> app.module.ts

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { logger } from './common/middlewares/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(logger)
      .forRoutes(CatsController);
  }
}
```

?> 当您的中间件没有任何依赖关系时，我们可以考虑使用函数式中间件。


## 多个中间件

如前所述，为了绑定顺序执行的多个中间件，我们可以在 apply() 方法内用逗号分隔它们。


```typescript
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cors(), helmet(), logger)
      .forRoutes(CatsController);
  }
}
```

## 全局中间件

为了一次将中间件绑定到每个注册路由，我们可以利用实例 `INestApplication` 提供的方法 `use() `：

```typescript
const app = await NestFactory.create(ApplicationModule);
app.use(logger);
await app.listen(3000);
```

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |


