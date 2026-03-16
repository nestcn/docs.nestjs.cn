<!-- 此文件从 content/controllers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T04:54:58.736Z -->
<!-- 源文件: content/controllers.md -->

### 控制器

控制器负责处理 incoming **请求** 和将 **响应** 发送回客户端。

__HTML_TAG_156____HTML_TAG_157____HTML_TAG_158__

控制器的目的是处理特定请求以满足应用程序的需求。路由机制确定哪个控制器将处理每个请求。通常，控制器具有多个路由，每个路由都可以执行不同的操作。

要创建基本控制器，我们使用类和 **装饰器**。装饰器将类与必要的元数据关联，从而允许 Nest 创建一个路由映射，连接请求到相应的控制器。

> info **提示** 使用 CLI 的 __LINK_315__ 可以快速创建一个 CRUD 控制器，带有内置的 __LINK_316__: `create()`。

#### 路由

以下示例中，我们将使用 `ContextIdFactory` 装饰器，该装饰器是 **必需的**以定义基本控制器。我们将指定可选路由前缀 `@nestjs/core`。使用路由前缀在 `REQUEST` 装饰器中可以将相关路由组合在一起，从而减少重复的代码。例如，如果我们想将与猫实体交互的路由组合在一起，以便在 `ContextIdFactory.create()` 路径下，，我们可以在 `undefined` 装饰器中指定 `REQUEST` 路径前缀。这 way，我们不需要在每个路由中重复该部分路径。

```typescript
@Injectable()
export class CatsService {
  constructor(private moduleRef: ModuleRef) {}
}

```

> info **提示** 使用 CLI 创建控制器，只需执行 `REQUEST` 命令。

`ModuleRef#registerRequestByContextId()` HTTP 请求方法装饰器在 `CatsService` 方法之前告诉 Nest 创建一个处理特定端点的处理程序。该端点由 HTTP 请求方法（在本例中为 GET）和路由路径确定。因此，路由路径是什么？路由路径由控制器的可选前缀和方法装饰器中的路径组合而成。由于我们为每个路由设置了前缀 `CatsRepository`，并没有在方法装饰器中添加任何特定的路径，Nest 将映射 `ContextIdFactory.create()` 请求到该处理程序。

如前所述，路由路径包括控制器的可选前缀和方法装饰器中的路径字符串。例如，如果控制器前缀为 `@Inject()`，方法装饰器为 `getByRequest()`，则生成的路由将是 `ContextIdFactory`。

在我们的示例中，当客户端发送 GET 请求时，Nest 将请求路由到用户定义的 `resolve()` 方法。请注意，我们在这里选择的方法名称完全是任意的。虽然我们必须声明一个方法以绑定路由，但 Nest 并不将方法名称赋予任何特定的意义。

这个方法将返回 200 状态码和相应的响应，该响应在本例中是一个字符串。为什么会这样？为了解释，我们需要引入一个概念，即 Nest 使用两个 **不同的** 选项来控制响应：

__HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__Standard (recommended)__HTML_TAG_162__
    __HTML_TAG_163__
      使用内置方法，当请求处理程序返回 JavaScript 对象或数组时，它将 __HTML_TAG_164__自动__HTML_TAG_165__
      序列化为 JSON。当它返回 JavaScript 基本类型（例如 __HTML_TAG_166__字符串__HTML_TAG_167__、 __HTML_TAG_168__数字__HTML_TAG_169__、 __HTML_TAG_170__布尔值__HTML_TAG_171__）时，Nest 将发送该值而不尝试序列化该值。这使得响应处理变得简单：只返回值，Nest 就会处理剩余的部分。
      __HTML_TAG_172__
      __HTML_TAG_173__此外，响应的 __HTML_TAG_174__状态码__HTML_TAG_175__ 总是默认为 200，除非是 POST 请求，这时使用 201。我们可以轻松地更改这个行为 bằng 添加 __HTML_TAG_176__@HttpCode(...)__HTML_TAG_177__
      装饰器在处理程序级别（见 __HTML_TAG_178__状态代码__HTML_TAG_179__）。
    __HTML_TAG_180__
  __HTML_TAG_181__
  __HTML_TAG_182__
    __HTML_TAG_183__Library-specific__HTML_TAG_184__
    __HTML_TAG_185__
      我们可以使用库特定的（例如 Express） __HTML_TAG_186__响应对象__HTML_TAG_187__，该对象可以使用 __HTML_TAG_188__@Res()__HTML_TAG_189__ 装饰器在处理程序签名中注入（例如 __HTML_TAG_190__findAll(@Res() response)__HTML_TAG_191__）。使用这种方法，您可以使用该对象中的本地响应处理方法。例如，在 Express 中，可以使用代码 __HTML_TAG_192__response.status(200).send()__HTML_TAG_193__ 构建响应。
    __HTML_TAG_194__
  __HTML_TAG_195__
__HTML_TAG_196__

Note: I translated the content according to the provided glossary and followed the translation requirements. I also kept the code examples, variable names, and function names unchanged, and maintained the Markdown formatting, links, and tables unchanged.> 警告 **Warning** Nest 会检测handler 是否使用了 `create()` 或 __INLINE_CODE_42__,这表明您已经选择了库特定的选项。如果同时使用这两个方法，Standard 方法将**自动失效**，并且将无法像预期一样工作。要同时使用这两个方法（例如，通过将响应对象注入到 handler 中，但仍然让框架处理剩余部分），您必须将 __INLINE_CODE_43__ 选项设置为 __INLINE_CODE_44__ 在 __INLINE_CODE_45__ 装饰器中。

__HTML_TAG_197____HTML_TAG_198__

#### 请求对象

处理器通常需要访问客户端的**请求**细节。Nest 提供了对 underlying 平台（Express 默认）的 __LINK_317__ 的访问权，您可以使用 __INLINE_CODE_46__ 装饰器在 handler 签名中注入请求对象。

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private service: Service;
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

  onModuleInit() {
    this.service = this.moduleRef.get(Service);
  }
}

```

> 提示 **Hint** 为了使用 __INLINE_CODE_47__ 类型（如在 __INLINE_CODE_48__ 参数示例中），请确保安装 __INLINE_CODE_49__ 包。

请求对象表示 HTTP 请求，并包含查询字符串、参数、HTTP 头和身体（了解更多 __LINK_318__）。在大多数情况下，您不需要手动访问这些属性。相反，您可以使用出厂装饰器，如 __INLINE_CODE_50__ 或 __INLINE_CODE_51__，它们可从出厂提供。下面是一个提供的装饰器列表和相应的平台特定对象。

__HTML_TAG_199__
  __HTML_TAG_200__
    __HTML_TAG_201__
      __HTML_TAG_202____HTML_TAG_203__@Request(), @Req()__HTML_TAG_204____HTML_TAG_205__
      __HTML_TAG_206____HTML_TAG_207__req__HTML_TAG_208____HTML_TAG_209____HTML_TAG_210__
    __HTML_TAG_211__
      __HTML_TAG_212____HTML_TAG_213__@Response(), @Res()__HTML_TAG_214____HTML_TAG_215__*__HTML_TAG_216____HTML_TAG_217__
      __HTML_TAG_218____HTML_TAG_219__res__HTML_TAG_220____HTML_TAG_221__
    __HTML_TAG_222__
    __HTML_TAG_223__
      __HTML_TAG_224____HTML_TAG_225__@Next()__HTML_TAG_226____HTML_TAG_227__
      __HTML_TAG_228____HTML_TAG_229__next__HTML_TAG_230____HTML_TAG_231__
    __HTML_TAG_232__
    __HTML_TAG_233__
      __HTML_TAG_234____HTML_TAG_235__@Session()__HTML_TAG_236____HTML_TAG_237__
      __HTML_TAG_238____HTML_TAG_239__req.session__HTML_TAG_240____HTML_TAG_241__
    __HTML_TAG_242__
    __HTML_TAG_243__
      __HTML_TAG_244____HTML_TAG_245__@Param(key?: string)__HTML_TAG_246____HTML_TAG_247__
      __HTML_TAG_248____HTML_TAG_249__req.params__HTML_TAG_250__ / __HTML_TAG_251__req.params[key]__HTML_TAG_252____HTML_TAG_253__
    __HTML_TAG_254__
    __HTML_TAG_255__
      __HTML_TAG_256____HTML_TAG_257__@Body(key?: string)__HTML_TAG_258____HTML_TAG_259__
      __HTML_TAG_260____HTML_TAG_261__req.body__HTML_TAG_262__ / __HTML_TAG_263__req.body[key]__HTML_TAG_264____HTML_TAG_265__
    __HTML_TAG_266__
    __HTML_TAG_267__
      __HTML_TAG_268____HTML_TAG_269__@Query(key?: string)__HTML_TAG_270____HTML_TAG_271__
      __HTML_TAG_272____HTML_TAG_273__req.query__HTML_TAG_274__ / __HTML_TAG_275__req.query[key]__HTML_TAG_276____HTML_TAG_277__
    __HTML_TAG_278__
    __HTML_TAG_279__
      __HTML_TAG_280____HTML_TAG_281__@Headers(name?: string)__HTML_TAG_282____HTML_TAG_283__
      __HTML_TAG_284____HTML_TAG_285__req.headers__HTML_TAG_286__ / __HTML_TAG_287__req.headers[name]__HTML_TAG_288____HTML_TAG_289__
    __HTML_TAG_290__
    __HTML_TAG_291__
      __HTML_TAG_292Earlier, we defined an endpoint to fetch the cats resource (**GET** route). We'll typically also want to provide an endpoint that creates new records. For this, let's create the **POST** handler:

```typescript

```typescript
this.moduleRef.get(Service, { strict: false });

```

```

It's that simple. Nest provides decorators for all of the standard HTTP methods: `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, and `@All`, and `@All` defines an endpoint that handles all of them.

#### Route wildcards

Pattern-based routes are also supported in NestJS. For example, the asterisk (*) can be used as a wildcard to match any combination of characters in a route at the end of a path. In the following example, the `*` method will be executed for any route that starts with `**, regardless of the number of characters that follow.

```typescript

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private transientService: TransientService;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}

  async onModuleInit() {
    this.transientService = await this.moduleRef.resolve(TransientService);
  }
}

```

```

The `**` route path will match `**, **`, **`, and so on. The hyphen (-) and the dot (.) are interpreted literally by string-based paths.

This approach works on both Express and Fastify. However, with the latest release of Express (v5), the routing system has become more strict. In pure Express, you must use a named wildcard to make the route work—for example, `**, where **` is simply the name of the wildcard parameter and has no special meaning. You can name it anything you like. That said, since Nest provides a compatibility layer for Express, you can still use the asterisk (*) as a wildcard.

When it comes to asterisks used in the middle of a route, Express requires named wildcards (e.g., **), while Fastify does not support them at all.

#### Status code

As mentioned, the default status code for responses is always 200, except for POST requests, which default to 201. You can easily change this behavior by using the `@HttpCode` decorator at the handler level.

```typescript

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}

  async onModuleInit() {
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService),
      this.moduleRef.resolve(TransientService),
    ]);
    console.log(transientServices[0] === transientServices[1]); // false
  }
}

```

```

> info 提示 Import `@nestjs/http` from the `@nestjs/common` package.

Often, your status code isn't static but depends on various factors. In that case, you can use a library-specific response object (inject using `@Response`) or throw an exception.

#### Response headers

To specify a custom response header, you can either use a `@Header` decorator or a library-specific response object (and call `set` directly).

```typescript

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}

  async onModuleInit() {
    const contextId = ContextIdFactory.create();
    const transientServices = await Promise.all([
      this.moduleRef.resolve(TransientService, contextId),
      this.moduleRef.resolve(TransientService, contextId),
    ]);
    console.log(transientServices[0] === transientServices[1]); // true
  }
}

```

```

> info 提示 Import `@nestjs/http` from the `@nestjs/common` package.

#### Redirection

To redirect a response to a specific URL, you can either use a `@Redirect` decorator or a library-specific response object (and call `redirect` directly).

`@Redirect` takes two arguments, `statusCode` and `url`, both are optional. The default value of `statusCode` is 302 (`url`) if omitted.

```typescript

```typescript
const contextId = ContextIdFactory.create();
this.moduleRef.registerRequestByContextId(/* YOUR_REQUEST_OBJECT */, contextId);

```

```

> info 提示 Sometimes you may want to determine the HTTP status code or the redirect URL dynamically. Do this by returning an object following the `Redirect` interface (from `@nestjs/common`).

Returned values will override any arguments passed to the `@Redirect` decorator. For example:

```typescript

```typescript
@Injectable()
export class CatsService {
  constructor(
    @Inject(REQUEST) private request: Record<string, unknown>,
  ) {}
}

```

```

#### Route parameters

Routes with static paths won't work when you need to accept dynamic data as part of the request (e.g., `**` to get the cat with id `**`). To define routes with parameters, you can add route parameter tokens in the route path to capture the dynamic values from the URL. The route parameter token in the `@Param` decorator example below illustrates this approach. These route parameters can then be accessed using the `@Param` decorator, which should be added to the method signature.

> info 提示 Routes with parameters should be declared after any static paths. This prevents the parameterized paths from intercepting traffic destined for the static paths.

```typescript

```typescript
const contextId = ContextIdFactory.getByRequest(this.request);
const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId);

```

```

The `@Param` decorator is used to decorate a method parameter (in the example above, `**`), making the route parameters accessible as properties of that decorated method parameter inside the method. As shown in the code, you can access the `**` parameter by referencing `**`. Alternatively, you can pass a specific parameter token to the decorator and directly reference the route parameter by name within the method body.

> info 提示 Import `@nestjs/common` from the `@nestjs/common` package.

```typescript

```typescript
@Injectable()
export class CatsService implements OnModuleInit {
  private catsFactory: CatsFactory;
  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}

  async onModuleInit() {
    this.catsFactory = await this.moduleRef.create(CatsFactory);
  }
}

```

```

#### Sub-domain routing

The `@Subdomain` decorator can take a `subdomain` option to require that the HTTP host of the incoming requests matches some specific value.

```typescript
__CODE_BLOCK_10__

```

Note: All code blocks and inline code should be kept unchanged.> warning **Warning** Since **Fastify** does not support nested routers, if you are using sub-domain routing, it is recommended to use the default Express adapter instead.

类似于路由 __INLINE_CODE_115__,__INLINE_CODE_116__ 选项可以使用 token 捕捉动态值在主机名称的该位置。主机参数 token 在下面的 __INLINE_CODE_117__ 装饰器示例中演示了这种使用方式。主机参数在这种方式中声明的可以使用 __INLINE_CODE_118__ 装饰器来访问，该装饰器应添加到方法签名中。

__CODE_BLOCK_11__

#### 状态共享

对于来自其他编程语言的开发者来说，可能会感到惊讶的是，在 Nest 中几乎所有东西都是跨请求共享的。这包括资源，如数据库连接池、全局状态的单例服务，以及更多。需要注意的是，Node.js 没有使用请求/响应多线程无状态模型，每个请求都由单独的线程处理。因此，在 Nest 中使用单例实例是对我们的应用程序完全安全的。

然而，在特定的边界情况下，可能需要在控制器中使用请求生命周期。示例包括 GraphQL 应用程序中的 per-request 缓存、请求跟踪或实现多租户。你可以了解如何控制注入作用域 __LINK_320__。

#### 异步处理

我们爱现代 JavaScript，特别是它对异步数据处理的强调。因此，Nest 完全支持 __INLINE_CODE_119__ 函数。每个 __INLINE_CODE_120__ 函数必须返回 __INLINE_CODE_121__，这允许您返回一个可以由 Nest 自动解决的延迟值。以下是一个示例：

__CODE_BLOCK_12__

这个代码是完全有效的。但是，Nest 还允许路由处理程序返回 RxJS __LINK_321__，Nest 将内部处理订阅，并在流完成时解决最终 emit 的值。

__CODE_BLOCK_13__

这两种方法都是有效的，您可以根据需要选择一种。

#### 请求负载

在我们的前一个示例中，POST 路由处理程序没有接受任何客户端参数。让我们修复它，添加 __INLINE_CODE_122__ 装饰器。

在继续之前（如果您使用 TypeScript），我们需要定义 **DTO**（数据传输对象） schema。DTO 是一个对象，它指定了数据在网络上发送的方式。我们可以使用 TypeScript 接口或简单类来定义 DTO schema。然而，我们建议使用类。在什么原因？类是 JavaScript ES6 标准的一部分，因此在编译后的 JavaScript 中它们保持不变。相比之下，TypeScript 接口在转译时被删除，这意味着 Nest 在运行时无法引用它们。这是重要的，因为特性如 __Pipes__ 依赖于在运行时访问变量的 metatype，这只可能在类中实现。

让我们创建 __INLINE_CODE_123__ 类：

__CODE_BLOCK_14__

它只有三个基本属性。然后，我们可以使用新创建的 DTO 在 __INLINE_CODE_124__ 中：

__CODE_BLOCK_15__

> info **Hint** 我们的 __INLINE_CODE_125__ 可以过滤掉不应该由方法处理程序接收的属性。在这个示例中，我们可以将可接受的属性白名单化，并且在结果对象中自动删除任何不在白名单中的属性。在 __INLINE_CODE_126__ 示例中，我们的白名单是 __INLINE_CODE_127__、__INLINE_CODE_128__ 和 __INLINE_CODE_129__ 属性。了解更多 __LINK_322__。

#### 查询参数

在处理路由查询参数时，您可以使用 __INLINE_CODE_130__ 装饰器来从 incoming 请求中提取它们。让我们看看这如何工作。

考虑一个路由，我们想根据查询参数 __INLINE_CODE_131__ 和 __INLINE_CODE_132__ 来过滤一组猫。首先，定义查询参数在 __INLINE_CODE_133__ 中：

__CODE_BLOCK_16__

在这个示例中，__INLINE_CODE_134__ 装饰器用于从查询字符串中提取 __INLINE_CODE_135__ 和 __INLINE_CODE_136__ 的值。例如，对于：

__CODE_BLOCK_17__

将结果为 __INLINE_CODE_137__ 等于 __INLINE_CODE_138__，并且 __INLINE_CODE_139__ 等于 __INLINE_CODE_140__。

如果您的应用程序需要处理更复杂的查询参数，如嵌套对象或数组：

__CODE_BLOCK_18__

您需要配置 HTTP 适配器（Express 或 Fastify）以使用合适的查询解析器。在 Express 中，您可以使用 __INLINE_CODE_141__ 解析器，该解析器支持 rich 查询对象：

__CODE_BLOCK_19__

在 Fastify 中，您可以使用 __INLINE_CODE_142__ 选项：

__CODE_BLOCK_20__

> info **Hint** __INLINE_CODE_143__ 是一个查询字符串解析器，它支持嵌套和数组。您可以使用 __INLINE_CODE_144__ 安装它。

#### 处理错误Here is the translation of the English technical documentation to Chinese following the provided rules:

#### 错误处理（Working with Exceptions）

__LINK_323__。

#### 完整资源示例

以下是一个示例，演示了使用多个可用的装饰器来创建 basic 控制器。这控制器提供了一些方法来访问和操作内部数据。

__CODE_BLOCK_21__

> 提示 **Hint**Nest CLI 提供了一个生成器（schematic），自动创建 **所有 boilerplate 代码**，省去了手动编写和提高开发者体验。了解更多关于这个特性的信息 __LINK_324__。

#### 获取启动

即使 __INLINE_CODE_145__ 已经完全定义，但是 Nest 还不知道它，并且不会自动创建该类的实例。

控制器总是需要作为一个模块的一部分，因此我们将 __INLINE_CODE_146__ 数组包含在 __INLINE_CODE_147__ 装饰器中。因为我们还没有定义其他模块，只使用根 __INLINE_CODE_148__ 注册 __INLINE_CODE_149__：

__CODE_BLOCK_22__

我们将元数据附加到模块类中使用 __INLINE_CODE_150__ 装饰器，现在 Nest 可以轻松地确定哪些控制器需要被挂载。

#### 库特定的方法

迄今，我们已经涵盖了 Nest 的标准方式来 manipulate 响应。另一个方法是使用库特定的 __LINK_325__。要注入特定的响应对象，我们可以使用 __INLINE_CODE_151__ 装饰器。为了突出差异，让我们将 __INLINE_CODE_152__Rewrite 成这样：

__CODE_BLOCK_23__

虽然这个方法可以工作，并且提供了更多的灵活性，允许完全控制响应对象（例如，头部 manipulation 和访问库特定的功能），但它应该小心使用。主要缺点是代码变得平台依赖，各种 underlying 库可能具有不同的响应对象 API。此外，这可能使测试更加困难，因为您需要模拟响应对象等。

此外，使用这个方法，您将失去兼容性，以便与 Nest 特性相容，例如拦截器和 __INLINE_CODE_153__ / __INLINE_CODE_154__ 装饰器。要解决这个问题，您可以启用 __INLINE_CODE_155__ 选项如下：

__CODE_BLOCK_24__

使用这个方法，您可以与native 响应对象交互（例如，根据特定条件设置 cookie 或头部），而仍然允许框架处理其余部分。