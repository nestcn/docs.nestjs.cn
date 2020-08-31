## 迁移指南


本文提供了一套从 `v5` 迁移到最新 `v6` 版本的**指导原则**。尽管我们试图减少一些重大变化，但必须在几个地方修改 `API` 以简化其使用。

### 中间件

基于[此主题](https://github.com/nestjs/nest/issues/1378)，中间件 `API` 已经更改，以便来自不同 `Node` 库的人员更直接使用，并减少先前 `API` 产生的混淆。

```typescript
// Before
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
 resolve(...args: any[]): MiddlewareFunction {
   return (req: Request, res: Response, next: Function) => {
     console.log('Request...');
     next();
   };
 }
}

// After
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.log('Request...');
    next();
  }
}
```

因此，该 `with()` 方法 `MiddlewareConsumer` 将不再起作用（完全无用）。如果要将选项传递给中间件类，请使用[自定义提供程序](/6/customdecorators)或[在此处](https://github.com/nestjs/nest/issues/1378)查看更多示例。

### 拦截器

拦截器 `API` 也已简化。此外，由于社区报告[此问题](https://github.com/nestjs/nest/issues/1016)，因此需要进行更改。

```typescript
// Before
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    call$: Observable<T>,
  ): Observable<Response<T>> {
    return call$.pipe(map(data => ({ data })));
  }
}

// After
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next
      .handle()
      .pipe(map(data => ({ data })));
  }
}
```

!> 该 `CallHandler` 接口需要从 `@nestjs/common ` 包导入。

请注意，你的拦截器现在将以正确的顺序运行 - 它们将遵循一个简单的请求来处理管道，一旦请求想要命中一个终端处理程序，就从全局执行到具体执行，然后（在响应管道中），它们将是从特定的到全局的（如果你在其中附加一些异步/映射逻辑）执行。


### 平台

到目前为止，即使您没有使用 `HTTP` 服务器，也必须在内部安装 `express` 库（作为 `@nestjs/core` 软件包的依赖项）。自从新的主要版本发布以来，`Nest` 将不再提供这些软件包。每个平台已经提取到单个包中，分别为 `@nestjs/platform-express`，`@nestjs/platform-fastify`，`@nestjs/platform-ws`，和 `@nestjs/platform-socket.io`。假设您的应用程序同时使用 `express` 和 `socket.io`，则需安装相应的平台：

```
$ npm i @nestjs/platform-express @nestjs/platform-socket.io
```

现在，每个现有的适配器（例如 `FastifyAdapter`）都是从专用平台包提供的。


- FastifyAdapter -  @nestjs/platform-fastify
- ExpressAdapter -  @nestjs/platform-express
- WsAdapter -  @nestjs/platform-ws
- IoAdapter -  @nestjs/platform-socket.io

此外，`FileInterceptor`（和其他 `multer` 相关的拦截器）现在从 `@nestjs/platform-express`（因为 `multer` 库不兼容 `fastify`）导出 。

### 元数据相关

该 `@ReflectMetadata()` 装饰已被弃用，并将在下一主要版本中删除（现在它只会显示一个警告）。请改用 `@SetMetadata()` 装饰器。

### GraphQL

订阅机制已更改。检查[此章](/6/subscriptions)的说明。此外，`@nestjs/graphql` 软件包严重依赖 `@ReflectMetadata()`（已被弃用），因此也需要更新软件包本身。

### Express实例

我们不再支持将 `express` 实例作为方法的第二个参数传递 `NestFactory.create()` 。为了获取底层 `HTTP` 适配器，请使用[此处](/6/faq?id=http-适配器)描述的技术。此外，您可以传递 `ExpressAdapter`（只需将您的 `express` 实例作为构造函数参数传递 `new ExpressAdapter(express)`）。

```typescript

// Before (no longer supported)
const server = express();
const app = await NestFactory.create(ApplicationModule, server);

// After (potential solution)
const server = express();
const app = await NestFactory.create(
  ApplicationModule,
  new ExpressAdapter(server),
);

```

### 弃用

最终删除了所有弃用（从 `4` 到 `5` 版本）。

### TypeScript

`Nest 6` 支持 `TypeScript（3.0.0）`的最新主要版本。

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) | 
