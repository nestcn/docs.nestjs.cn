# FAQ

## HTTP 适配器

有时，您可能希望在 `Nest` 应用程序上下文中或从外部访问底层 `HTTP` 服务器。

基本上，每个本机（特定于平台的）`HTTP` 服务器/库实例都包含在 `adapter`（适配器）中。适配器注册为全局可用的提供程序，可以从应用程序上下文中提取，也可以轻松地注入其他提供程序。

### 外部应用上下文策略

为了从应用程序上下文外部获取 `HttpAdapter` 引用，您可以调用 `getHttpAdapter()` 方法。

```typescript
const app = await NestFactory.create(ApplicationModule);
const httpAdapter = app.getHttpAdapter();
```


### 上下文策略


为了从应用程序上下文中获取`HttpAdapterHost` 引用，您可以采用与任何其他现有提供程序相同的方式注入它（例如，通过 `constructor`注入）。

```typescript
export class CatsService {
  constructor(private adapterHost: HttpAdapterHost) {}
}
```

!> `HttpAdapterHost` 需要从 `@nestjs/core` 导入包。


`HttpAdapterHost` 不是真实的 `HttpAdapter` 。为了获得 `HttpAdapter` ，只需访问该 `httpAdapter` 属性。

```typescript
const adapterHost = app.get(HttpAdapterHost);
const httpAdapter = adapterHost.httpAdapter;
```

该 `httpAdapter` 是底层框架使用的 `HTTP` 适配器的实际实例。它可以是 `ExpressAdapter` 或 `FastifyAdapter`的实例（两个类都扩展了自`AbstractHttpAdapter`）。

每个适配器都公开了几种与 `HTTP` 服务器交互的有用方法。尽管如此，如果您想直接访问库引用，请调用 `getInstance()` 方法。


```typescript
const instance = httpAdapter.getInstance();
```

## 全局路由前缀

要为应用程序中的每个路由设置前缀, 让我们使用 `INestApplication` 对象的 `setGlobalPrefix()` 方法。

```typescript
const app = await NestFactory.create(ApplicationModule);
app.setGlobalPrefix('v1');
```

## 混合应用

混合应用程序是一个应用程序，它监听 `HTTP` 请求，可以通过 `connectMicroservice()` 函数将 `INestApplication` 实例与 `INestMicroservice` 实例结合起来。

```typescript
const app = await NestFactory.create(ApplicationModule);
const microservice = app.connectMicroservice({
  transport: Transport.TCP,
});

await app.startAllMicroservicesAsync();
await app.listen(3001);
```

要连接多个微服务实例，要为每个微服务调用`connectMicroservice()`方法：

```typescript
const app = await NestFactory.create(AppModule);
// microservice #1
const microserviceTcp = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
  options: {
    port: 3001,
  },
});
// microservice #2
const microserviceRedis = app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.REDIS,
  options: {
    url: 'redis://localhost:6379',
  },
});

await app.startAllMicroservicesAsync();
await app.listen(3001);
```

## HTTPS 和多服务器

### HTTPS

为了创建使用 `HTTPS` 协议的应用程序，在传递给`NestFactory`的`create()`方法中设置`httpsOptions`属性：

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};
const app = await NestFactory.create(ApplicationModule, {
  httpsOptions,
});
await app.listen(3000);
```
如果使用`FastifyAdapter`，则创建应用如下：

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  ApplicationModule,
  new FastifyAdapter({ https: httpsOptions }),
);
```
### 多个同步服务器

下列方法展示了如何使用Nest应用同时监视多个端口（例如，在非HTTPS端口和HTTPS端口）。

```typescript
const httpsOptions = {
  key: fs.readFileSync('./secrets/private-key.pem'),
  cert: fs.readFileSync('./secrets/public-certificate.pem'),
};

const server = express();
const app = await NestFactory.create(
  ApplicationModule,
  new ExpressAdapter(server),
);
await app.init();

http.createServer(server).listen(3000);
https.createServer(httpsOptions, server).listen(443);
```
?> `ExpressAdapter` 需要从 `@nestjs/platform-express` 包导入。`http`和`https`包是原生的Node.js包。

!> `GraphQL Subscriptions` 中该方法无法工作。

## 请求生命周期

`Nest`应用程序处理请求并生成回应的过程被称为**请求生命周期**。使用中间件、管道、守卫和拦截器时，要在请求生命周期中追踪特定的代码片段的执行很困难，尤其是在全局、控制器或者路由的部件中。一般来说，一个请求流经中间件、守卫与拦截器，然后到达管道，并最终回到拦截器中的返回路径中（从而产生响应）。

### 中间件

中间件以特殊的顺序执行。首先，`Nest`运行全局绑定的中间件（例如`app.use`中绑定的中间件），然后运行在路径中指定的**模块绑定的中间件**。中间件以他们绑定的次序顺序执行，这和在`Express`中的中间件工作原理是类似的。

### 守卫

守卫的执行首先从全局守卫开始，然后处理控制器守卫，最后是路径守卫。和中间件一样，守卫的执行也和他们的绑定顺序一致。例如：

```typescript
@UseGuards(Guard1, Guard2)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UseGuards(Guard3)
  @Get()
  getCats(): Cats[] {
    return this.catsService.getCats();
  }
}
```
`Guard1`会在`Guard2`之前执行并且这两者都先于`Guard3`执行。

?> 在提到全局绑定和本地绑定时主要是指守卫（或其他部件）绑定的位置不同。如果你正在使用`app.useGlobalGuard()`或者通过模块提供一个部件，它就是全局绑定的。否则，当一个装饰器在控制器类之前时，它就是绑定在控制器上的，当装饰器在路径声明之前时它就是绑定在路径上的。

### 拦截器

拦截器在大部分情况下和守卫类似。只有一种情况例外：当拦截器返回的是一个`RxJS Observables`时，`observables`是以先进后出的顺序执行的。因此，入站请求是按照标准的全局、控制器和路由层次执行的，但请求的响应侧（例如，当从一个控制器方法的处理器返回时）则是从路由到控制器再到全局。另外，由管道、控制器或者服务抛出的任何错误都可以在拦截器的`catchError`操作者中被读取。

### 管道

管道按照标准的从全局到控制器再到路由的绑定顺序，遵循先进先出的原则按照`@usePipes()`参数次序顺序执行。然而，在路由参数层次，如果由多个管道在执行，则会按照自后向前的参数顺序执行，这在路由层面和控制器层面的管道中同样如此，例如，我们有如下控制器：

```typescript
@UsePipes(GeneralValidationPipe)
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @UsePipes(RouteSpecificPipe)
  @Patch(':id')
  updateCat(
    @Body() body: UpdateCatDTO,
    @Param() params: UpdateCatParams,
    @Query() query: UpdateCatQuery,
  ) {
    return this.catsService.updateCat(body, params, query);
  }
}
```
在这里`GeneralValidationPipe`会先执行`query`，然后是`params`，最后是`body`对象，接下来在执行`RouteSpecificPipe`管道时同样按照上述次序执行。如果存在任何参数层的管道，它会在（同样的，按照自后向前的参数顺序）控制器和路由层的管道之后执行。

### 过滤器

过滤器是唯一一个不按照全局第一顺序执行的组件。而是会从最低层次开始处理，也就是说先从任何路由绑定的过滤器开始，然后是控制器层，最后才是全局过滤器。注意，异常无法从过滤器传递到另一个过滤器；如果一个路由层过滤器捕捉到一个异常，一个控制器或者全局层面的过滤器就捕捉不到这个异常。如果要实现类似的效果可以在过滤器之间使用继承。

?> 过滤器仅在请求过程中任何没有捕获的异常发生时执行。捕获的异常如`try/catch`语句不会触发过滤器。一旦遇到未处理的异常，请求接下来的生命周期会被忽略并直接跳转到过滤器。

### 总结

一般来说，请求生命周期大致如下：
  1. 收到请求
  2. 全局绑定的中间件
  3. 模块绑定的中间件
  4. 全局守卫
  5. 控制层守卫
  6. 路由守卫
  7. 全局拦截器（控制器之前）
  8. 控制器层拦截器 （控制器之前）
  9. 路由拦截器 （控制器之前）
  10. 全局管道
  11. 控制器管道
  12. 路由管道
  13. 路由参数管道
  14. 控制器（方法处理器）
  15。服务（如果有）
  16. 路由拦截器（请求之后）
  17. 控制器拦截器 （请求之后）
  18. 全局拦截器 （请求之后）
  19. 异常过滤器 （路由，之后是控制器，之后是全局）
  20. 服务器响应

## 常见错误

在使用Nestjs开发时，可能遇到不同错误。

### `Cannot resolve dependency(无法处理依赖)`错误

最常见的错误信息可能是Nest无法处理提供者依赖，这个错误看上去往往像这样：

```bash
Nest can't resolve dependencies of the <provider> (?). Please make sure that the argument <unknown_token> at index [<index>] is available in the <module> context.

Potential solutions:
- If <unknown_token> is a provider, is it part of the current <module>?
- If <unknown_token> is exported from a separate @Module, is that module imported within <module>?
  @Module({
    imports: [ /* the Module containing <unknown_token> */ ]
  })
```

这个错误最常用的原因，是提供者没有列在模块的`provider`数组中。确保提供者在提供者数组中并且遵循以下NestJs提供者实践。

有一些常规的错误。其中一个是把提供者放到了`import`数组里。在这种情况下，错误会是提供者的名字在`<module>`应该在的地方。

如果你在开发过程中遇到这些错误，看看提到的出错信息以及其提供者。确保提供者在提供者数组中，模块可以访问所有的依赖。有时提供者在"Feature Module"和"Root Module"中重复，这意味着Nest将尝试实例化提供者两次。更可能的是，从模块复制的提供者应该替换为在"Root Module"的`imports`数组中引入。

### `Circular dependency（循环依赖）`错误

有时你会发现在应用中无法避免循环依赖。你可能需要做一些工作来帮助Nest解决它，循环依赖错误看上去可能像这样：

```bash
Nest cannot create the <module> instance.
The module at index [<index>] of the <module> "imports" array is undefined.

Potential causes:
- A circular dependency between modules. Use forwardRef() to avoid it. Read more: https://docs.nestjs.com/fundamentals/circular-dependency
- The module at index [<index>] is of type "undefined". Check your import statements and the type of the module.

Scope [<module_import_chain>]
# example chain AppModule -> FooModule
```

循环依赖错误可能来自提供者间的相互依赖，或者TypeScript文件常量相互依赖，例如从一个模型文件中导出常量而在一个服务中引入他们。在后一种情况下，建议为常量创建一个独立的文件。在前一种情况下，查看循环依赖指导并保证两个模块和提供者都标记有`forwarRef`。

## 实例

[更多例子参考](https://github.com/nestjs/nest/tree/master/sample)

 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |  [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) | 
| [@weizy0219](https://github.com/weizy0219)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/19883738?s=60&v=4">  |  翻译  | 专注于TypeScript全栈、物联网和Python数据科学，[@weizhiyong](https://www.weizhiyong.com) |
