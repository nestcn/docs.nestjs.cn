### 懒加载模块

默认情况下，模块采用急切加载方式，这意味着应用一旦启动就会加载所有模块，无论它们是否立即需要。虽然这对大多数应用来说没有问题，但对于运行在**无服务器环境**中的应用/工作器可能成为瓶颈，其中启动延迟（"冷启动"）至关重要。

懒加载可以通过仅加载特定无服务器函数调用所需的模块来减少引导时间。此外，一旦无服务器函数"预热"后，您还可以异步加载其他模块，从而进一步加快后续调用的引导时间（延迟模块注册）。

> info **提示** 如果您熟悉 **[Angular](https://angular.dev/)** 框架，可能之前见过" [懒加载模块](https://angular.dev/guide/ngmodules/lazy-loading#lazy-loading-basics) "这个术语。请注意这项技术在 Nest 中**功能上有所不同** ，因此请将其视为共享相似命名规范的完全不同的功能。

> warning **警告** 请注意[生命周期钩子方法](../fundamentals/lifecycle-events)在懒加载模块和服务中不会被调用。

#### 入门指南

为了实现按需加载模块，Nest 提供了 `LazyModuleLoader` 类，可以通过常规方式注入到类中：

```typescript title="cats.service"
@Injectable()
export class CatsService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}
}
```

> info **提示** `LazyModuleLoader` 类是从 `@nestjs/core` 包中导入的。

或者，你也可以从应用程序引导文件(`main.ts`)中获取 `LazyModuleLoader` 提供者的引用，如下所示：

```typescript
// "app" 代表 Nest 应用实例
const lazyModuleLoader = app.get(LazyModuleLoader);
```

这样配置后，您现在可以使用以下结构加载任何模块：

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);
```

> info **提示** "懒加载"模块会在首次调用 `LazyModuleLoader#load` 方法时被**缓存** 。这意味着后续每次尝试加载 `LazyModule` 都会**非常快速** ，并返回缓存实例，而不会重新加载模块。
>
> ```bash
> Load "LazyModule" attempt: 1
> time: 2.379ms
> Load "LazyModule" attempt: 2
> time: 0.294ms
> Load "LazyModule" attempt: 3
> time: 0.303ms
> ```
>
> 此外，"懒加载"模块与应用启动时急切加载的模块以及后续在应用中注册的其他懒加载模块共享相同的模块关系图。
```

其中 `lazy.module.ts` 是一个导出**常规 Nest 模块**的 TypeScript 文件（无需额外修改）。

`LazyModuleLoader#load` 方法返回一个[模块引用](/fundamentals/module-ref) （属于 `LazyModule` 类型），该引用允许您遍历内部提供者列表，并使用注入令牌作为查找键获取任意提供者的引用。

例如，假设我们有一个 `LazyModule` 包含以下定义：

```typescript
@Module({
  providers: [LazyService],
  exports: [LazyService],
})
export class LazyModule {}
```

> info **提示** 延迟加载的模块不能注册为**全局模块** ，这毫无意义（因为它们是在所有静态注册模块都已实例化后，按需延迟注册的）。同样，已注册的**全局增强器** （守卫/拦截器等） **也无法**正常工作。

通过这种方式，我们可以获取 `LazyService` 提供者的引用，如下所示：

```typescript
const { LazyModule } = await import('./lazy.module');
const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);

const { LazyService } = await import('./lazy.service');
const lazyService = moduleRef.get(LazyService);
```

> warning **警告** 如果使用 **Webpack**，请确保更新您的 `tsconfig.json` 文件 - 将 `compilerOptions.module` 设置为 `"esnext"` 并添加值为 `"node"` 的 `compilerOptions.moduleResolution` 属性：
> 
> ```json
> {
>   "compilerOptions": {
>     "module": "esnext",
>     "moduleResolution": "node",
>     ...
>   }
> }
> ```
> 
> 设置这些选项后，您就能利用[代码分割](https://webpack.js.org/guides/code-splitting/)功能。

#### 懒加载控制器、网关和解析器

由于 Nest 中的控制器（或 GraphQL 应用中的解析器）代表路由/路径/主题集（或查询/变更），您**无法通过** `LazyModuleLoader` 类实现懒加载。

 > error **警告** 在懒加载模块中注册的控制器、 [解析器](/graphql/resolvers)和[网关](/websockets/gateways)将无法按预期工作。同样，你也不能按需注册中间件函数（通过实现 `MiddlewareConsumer` 接口）。

例如，假设你正在构建一个底层使用 Fastify 驱动（通过 `@nestjs/platform-fastify` 包）的 REST API（HTTP 应用）。Fastify 不允许在应用准备就绪/成功监听消息后注册路由。这意味着即使我们分析了模块控制器中注册的路由映射，所有懒加载路由也无法访问，因为在运行时无法注册它们。

同样，我们作为 `@nestjs/microservices` 包一部分提供的某些传输策略（包括 Kafka、gRPC 或 RabbitMQ）需要在建立连接前订阅/监听特定主题/通道。一旦你的应用开始监听消息，框架将无法订阅/监听新的主题。

最后，启用了代码优先方法的 `@nestjs/graphql` 包会根据元数据动态自动生成 GraphQL 模式。这意味着它需要预先加载所有类，否则无法创建正确有效的模式。

#### 常见用例

最常见的情况是，当你的工作进程/定时任务/lambda 及无服务器函数/webhook 需要根据输入参数（路由路径/日期/查询参数等）触发不同服务（不同逻辑）时，你会看到延迟加载模块的使用。另一方面，对于单体应用来说，启动时间并不那么重要，延迟加载模块可能没有太大意义。
