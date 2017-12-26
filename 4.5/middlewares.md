# 中间件

中间件是一个函数，在路由处理器之前被调用。 中间件功能可以访问请求和响应对象，以及应用程序请求 - 响应周期中的下一个中间件功能。 下一个中间件函数通常用名为 `next` 的变量表示。

<center>![图1](https://docs.nestjs.com/assets/Middlewares_1.png)</center>

Nest中间件实际上等于表示中间件。 从官方快递文档复制的中间件功能有很多：



> 中间件功能可以执行以下任务： 
* 执行任何代码。
* 更改请求和响应对象。
* 结束请求 - 响应循环。
* 调用堆栈中的下一个中间件功能。
* 如果当前的中间件功能没有结束请求 - 响应周期，则必须调用 `next()` 将控制权交给下一个中间件功能。 否则，请求将被挂起。

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
