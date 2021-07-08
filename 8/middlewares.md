# 中间件

中间件是在路由处理程序 **之前** 调用的函数。 中间件函数可以访问请求和响应对象，以及应用程序请求响应周期中的 `next()` 中间件函数。 `next()` 中间件函数通常由名为 `next` 的变量表示。

![图1](https://docs.nestjs.com/assets/Middlewares_1.png)

Nest 中间件实际上等价于 [express](http://expressjs.com/en/guide/using-middleware.html) 中间件。 下面是Express官方文档中所述的中间件功能：

中间件函数可以执行以下任务:

- 执行任何代码。
- 对请求和响应对象进行更改。
- 结束请求-响应周期。
- 调用堆栈中的下一个中间件函数。
- 如果当前的中间件函数没有结束请求-响应周期, 它必须调用 `next()` 将控制传递给下一个中间件函数。否则, 请求将被挂起。

您可以在函数中或在具有 `@Injectable()` 装饰器的类中实现自定义 `Nest`中间件。 这个类应该实现 `NestMiddleware` 接口,  而函数没有任何特殊的要求。 让我们首先使用类方法实现一个简单的中间件功能。

> logger.middleware.ts

```typescript
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

## 依赖注入

`Nest`中间件完全支持依赖注入。 就像提供者和控制器一样，它们能够**注入**属于同一模块的依赖项（通过 `constructor` ）。


## 应用中间件

中间件不能在 `@Module()` 装饰器中列出。我们必须使用模块类的 `configure()` 方法来设置它们。包含中间件的模块必须实现 `NestModule` 接口。我们将 `LoggerMiddleware` 设置在 `ApplicationModule` 层上。

> app.module.ts 

```typescript
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

我们还可以在配置中间件时将包含路由路径的对象和请求方法传递给`forRoutes()`方法。我们为之前在`CatsController`中定义的`/cats`路由处理程序设置了`LoggerMiddleware`。我们还可以在配置中间件时将包含路由路径的对象和请求方法传递给 `forRoutes()`方法，从而进一步将中间件限制为特定的请求方法。在下面的示例中，请注意我们导入了 `RequestMethod`来引用所需的请求方法类型。

> app.module.ts

```typescript
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
?> 可以使用 `async/await`来实现 `configure()`方法的异步化(例如，可以在 `configure()`方法体中等待异步操作的完成)。

## 路由通配符

路由同样支持模式匹配。例如，星号被用作**通配符**，将匹配任何字符组合。

```typescript
forRoutes({ path: 'ab*cd', method: RequestMethod.ALL });
```

以上路由地址将匹配 `abcd` 、 `ab_cd` 、 `abecd` 等。字符 `?` 、 `+` 、 `*` 以及 `()` 是它们的正则表达式对应项的子集。连字符 (`-`) 和点 (`.`) 按字符串路径解析。


?> 该 `fastify` 软件包使用该软件包的最新版本，该版本 `path-to-regexp` 不再支持通配符星号*。相反，您必须使用参数（例如(`.*`)，`:splat*`）。


## 中间件消费者

`MiddlewareConsumer` 是一个帮助类。它提供了几种内置方法来管理中间件。他们都可以被简单地**链接**起来。`forRoutes()` 可接受一个字符串、多个字符串、对象、一个控制器类甚至多个控制器类。在大多数情况下，您可能只会传递一个由逗号分隔的控制器列表。以下是单个控制器的示例：

> app.module.ts

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller.ts';

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

?> 该 `apply()` 方法可以使用单个中间件，也可以使用多个参数来指定多个**多个中间件**。

有时我们想从应用中间件中排除某些路由。我们可以使用该 `exclude()` 方法轻松排除某些路由。此方法可以采用一个字符串，多个字符串或一个 `RouteInfo` 对象来标识要排除的路由，如下所示：


```typescript
consumer
  .apply(LoggerMiddleware)
  .exclude(
    { path: 'cats', method: RequestMethod.GET },
    { path: 'cats', method: RequestMethod.POST },
    'cats/(.*)',
  )
  .forRoutes(CatsController);
```

?> 该 `exclude()` 方法使用 `path-to-regexp` 包支持通配符参数。

在上面的示例中，`LoggerMiddleware` 将绑定到内部定义的所有路由，`CatsController` 但传递给 `exclude()` 方法的三个路由除外。


## 函数式中间件

我们使用的 `LoggerMiddleware` 类非常简单。它没有成员，没有额外的方法，没有依赖关系。为什么我们不能只使用一个简单的函数？这是一个很好的问题，因为事实上 - 我们可以做到。这种类型的中间件称为**函数式中间件**。让我们把 `logger` 转换成函数。

> logger.middleware.ts

```typescript
export function logger(req, res, next) {
  console.log(`Request...`);
  next();
};
```

现在在 `AppModule` 中使用它。

> app.module.ts

```typescript
consumer
  .apply(logger)
  .forRoutes(CatsController);
```

?> 当您的中间件没有任何依赖关系时，我们可以考虑使用函数式中间件。


## 多个中间件

如前所述，为了绑定顺序执行的多个中间件，我们可以在 `apply()` 方法内用逗号分隔它们。


```typescript
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

## 全局中间件

如果我们想一次性将中间件绑定到每个注册路由，我们可以使用由`INestApplication`实例提供的 `use()`方法：

```typescript
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);
```

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
[@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) 
| [@tangkai](https://github.com/tangkai123456)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/22436910">  |  翻译  | 专注于 React，[@tangkai](https://github.com/tangkai123456) |
| [@havef](https://havef.github.io)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/54462?s=460&v=4">  |  校正  | 数据分析、机器学习、TS/JS技术栈 [@havef](https://havef.github.io) |
| [@gaoyangy](<https://github.com/gaoyangy>) | <img class="avatar-66 rm-style" height="70" src="https://avatars0.githubusercontent.com/u/23468113?s=460&v=4"> | 校正 | 专注于Vue，TS/JS |
