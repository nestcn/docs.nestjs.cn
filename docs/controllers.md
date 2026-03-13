<!-- 此文件从 content/controllers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:28:48.666Z -->
<!-- 源文件: content/controllers.md -->

### 控制器

控制器负责处理 incoming 请求和发送响应回客户端。

__HTML_TAG_156____HTML_TAG_157____HTML_TAG_158__

控制器的目的是处理特定的应用程序请求。路由机制确定哪个控制器将处理每个请求。控制器通常具有多个路由，每个路由可以执行不同的操作。

要创建基本控制器，我们使用类和装饰器。装饰器将类与必要的元数据相连，让 Nest 创建一个路由映射，该映射将请求与相应的控制器相连。

>  info 提示：要快速创建一个 CRUD 控制器，带有内置 __LINK_315__，可以使用 CLI 的 __LINK_316__： __INLINE_CODE_25__。

#### 路由

以下示例中，我们将使用 __INLINE_CODE_26__ 装饰器，该装饰器是定义基本控制器所必需的。我们将指定可选的路由路径前缀 __INLINE_CODE_27__。在 __INLINE_CODE_28__ 装饰器中使用路径前缀可以将相关路由组合在一起，减少重复代码。例如，如果我们想将与猫实体相关的交互路由组合在一起，使用 __INLINE_CODE_29__ 路径前缀在 __INLINE_CODE_31__ 装饰器中指定该路径前缀。这样，我们不需要在文件中重复该部分路径。

```bash
$ npm i -D @compodoc/compodoc

```

>  info 提示：要使用 CLI 创建控制器，简单地执行 __INLINE_CODE_32__ 命令。

__INLINE_CODE_33__ HTTP 请求方法装饰器在 __INLINE_CODE_34__ 方法之前置置 Nest 创建一个处理 HTTP 请求的处理程序。这个处理程序由 HTTP 请求方法（GET 在这个案例中）和路由路径确定。那么，路由路径是什么？路由路径是由控制器的可选前缀和方法装饰器中的路径字符串组合而成。由于我们为每个路由设置了前缀 __INLINE_CODE_35__，并且没有在方法装饰器中添加特定的路径字符串，Nest 将将 __INLINE_CODE_36__ 请求映射到这个处理程序。

在我们的示例中，当发送 GET 请求到这个端点时，Nest 将请求路由到定义的 __INLINE_CODE_40__ 方法。注意，我们在这里选择的方法名称是任意的。虽然我们必须声明一个方法来将路由绑定到，但是 Nest 不将任何特定的意义附加到方法名称上。

这个方法将返回 200 状态代码和相关的响应，这个响应在这个案例中是一个字符串。为什么这样发生？为了解释，我们需要介绍 Nest 使用两个不同的选项来处理响应：

__HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__Standard (recommended)__HTML_TAG_162__
    __HTML_TAG_163__
      使用该内置方法，当请求处理程序返回 JavaScript 对象或数组时，它将 __HTML_TAG_164__自动__HTML_TAG_165__
      将其序列化为 JSON。对于返回 JavaScript 基本类型（例如 __HTML_TAG_166__字符串__HTML_TAG_167__、 __HTML_TAG_168__数字__HTML_TAG_169__、 __HTML_TAG_170__布尔值__HTML_TAG_171__）时，Nest 将发送仅值而不尝试序列化。这使得响应处理变得简单：只返回值，Nest 就会处理剩余的部分。
      __HTML_TAG_172__
      __HTML_TAG_173__ 此外，响应的 __HTML_TAG_174__状态代码__HTML_TAG_175__ 默认情况下总是 200，除非是 POST 请求，使用 201。我们可以轻松地更改这些行为 bằng 添加 __HTML_TAG_176__@HttpCode(...)__HTML_TAG_177__
      装饰器在处理程序级别（见 __HTML_TAG_178__状态代码__HTML_TAG_179__）。
    __HTML_TAG_180__
  __HTML_TAG_181__
  __HTML_TAG_182__
    __HTML_TAG_183__Library-specific__HTML_TAG_184__
    __HTML_TAG_185__
      我们可以使用库特定的（例如 Express） __HTML_TAG_186__响应对象__HTML_TAG_187__，使用 __HTML_TAG_188__@Res()__HTML_TAG_189__ 装饰器在方法处理程序签名中注入该对象（例如 __HTML_TAG_190__findAll(@Res() response)__HTML_TAG_191__）。使用这种方法，你可以使用该对象中的原生响应处理方法。例如，在 Express 中，可以使用代码 __HTML_TAG_192__response.status(200).send()__HTML_TAG_193__ 构建响应。
    __HTML_TAG_194__
  __HTML_TAG_195__
__HTML_TAG_196__> warning **Warning** Nest detects when the handler is using either __INLINE_CODE_41__ or __INLINE_CODE_42__, indicating you have chosen the library-specific option. If both approaches are used at the same time, the Standard approach is **automatically disabled** for this single route and will no longer work as expected. To use both approaches at the same time (for example, by injecting the response object to only set cookies/headers but still leave the rest to the framework), you must set the __INLINE_CODE_43__ option to __INLINE_CODE_44__ in the __INLINE_CODE_45__ decorator.

__HTML_TAG_197____HTML_TAG_198__

#### 请求对象

处理器通常需要访问客户端的 **请求** 详情。Nest 提供了对 underlying 平台（Express 默认）的 __LINK_317__ 的访问权限。您可以使用 __INLINE_CODE_46__ 装饰器在处理器签名中注入请求对象。

```bash
$ npx @compodoc/compodoc -p tsconfig.json -s

```

> info **Hint** To take advantage of __INLINE_CODE_47__ typings (like in the __INLINE_CODE_48__ parameter example above), make sure to install the __INLINE_CODE_49__ package.

请求对象表示 HTTP 请求，并包含查询字符串、参数、HTTP 头和正文（了解更多 __LINK_318__）。在大多数情况下，您不需要手动访问这些属性。相反，您可以使用专门的装饰器，如 __INLINE_CODE_50__ 或 __INLINE_CODE_51__，这些装饰器是出-of-the-box 提供的。下面是一个提供的装饰器列表和对应的平台特定对象。

__HTML_TAG_199__
  __HTML_TAG_200__
    __HTML_TAG_201__
      __HTML_TAG_202____HTML_TAG_203__@Provider(), @Req()__HTML_TAG_204____HTML_TAG_205__
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
Earlier, we defined an endpoint to fetch the cats resource (**GET** route). We'll typically also want to provide an endpoint that creates new records. For this, let's create the **POST** handler:

```typescript title="创建 POST 处理程序"

```

It's that simple. Nest provides decorators for all of the standard HTTP methods: `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`, and `@All`, and `@All` defines an endpoint that handles all of them.

```

#### Route wildcards

Pattern-based routes are also supported in NestJS. For example, the asterisk (`*`) can be used as a wildcard to match any combination of characters in a route at the end of a path. In the following example, the `method` will be executed for any route that starts with `path`, regardless of the number of characters that follow.

```typescript title="使用通配符"

```

The `path` route path will match `path1`, `path2`, `path3`, and so on. The hyphen (`-`) and the dot (`.`) are interpreted literally by string-based paths.

```

This approach works on both Express and Fastify. However, with the latest release of Express (v5), the routing system has become more strict. In pure Express, you must use a named wildcard to make the route work—for example, `path/:wildcard`, where `wildcard` is simply the name of the wildcard parameter and has no special meaning. You can name it anything you like. That said, since Nest provides a compatibility layer for Express, you can still use the asterisk (`*`) as a wildcard.

When it comes to asterisks used in the middle of a route, Express requires named wildcards (e.g., `path/*wildcard*`), while Fastify does not support them at all.

#### Status code

As mentioned, the default status code for responses is always 200, except for POST requests, which default to 201. You can easily change this behavior by using the `@HttpCode` decorator at the handler level.

```typescript title="使用状态码"

```

> info 提示 Import `HttpStatus` from the `@nestjs/common` package.

Often, your status code isn't static but depends on various factors. In that case, you can use a library-specific response object (inject using `Response`) object (or, in case of an error, throw an exception).

#### Response headers

To specify a custom response header, you can either use a `@Header` decorator or a library-specific response object (and call `setHeader` directly).

```typescript title="设置响应头"

```

> info 提示 Import `Response` from the `@nestjs/common` package.

#### Redirection

To redirect a response to a specific URL, you can either use a `@Redirect` decorator or a library-specific response object (and call `redirect` directly).

`redirect` takes two arguments, `url` and `statusCode`, both are optional. The default value of `statusCode` is 302 (`Found`) if omitted.

```typescript title="重定向"

```

> info 提示 Sometimes you may want to determine the HTTP status code or the redirect URL dynamically. Do this by returning an object following the `Redirect` interface (from `@nestjs/common`).

Returned values will override any arguments passed to the `@Redirect` decorator. For example:

```typescript title="动态重定向"

```

#### Route parameters

Routes with static paths won’t work when you need to accept dynamic data as part of the request (e.g., `path/:id` to get the cat with id `123`). To define routes with parameters, you can add route parameter tokens in the route path to capture the dynamic values from the URL. The route parameter token in the `@Param` decorator example below illustrates this approach. These route parameters can then be accessed using the `@Param` decorator, which should be added to the method signature.

> info 提示 Routes with parameters should be declared after any static paths. This prevents the parameterized paths from intercepting traffic destined for the static paths.

```typescript title="使用路由参数"

```

The `@Param` decorator is used to decorate a method parameter (in the example above, `id`), making the route parameters accessible as properties of that decorated method parameter inside the method. As shown in the code, you can access the `id` parameter by referencing `id`. Alternatively, you can pass a specific parameter token to the decorator and directly reference the route parameter by name within the method body.

> info 提示 Import `Param` from the `@nestjs/common` package.

```typescript title="使用路由参数"

```

#### Sub-domain routing

The `@Subdomain` decorator can take a `subdomain` option to require that the HTTP host of the incoming requests matches some specific value.

```typescript title="子域路由"

```

```> warning **警告**Fastify 不支持嵌套路由，如果您正在使用子域路由，建议使用默认的 Express 适配器。

类似于路由 __INLINE_CODE_115__，__INLINE_CODE_116__ 选项可以使用标记来捕获在主机名称中的动态值。下面是 __INLINE_CODE_117__ 装饰器示例中 host 参数 token 的使用。通过这种方式声明的主机参数可以使用 __INLINE_CODE_118__ 装饰器来访问，这个装饰器应该添加到方法签名中。

__CODE_BLOCK_11__

#### 状态共享

来自其他编程语言的开发者可能会感到惊讶的是，在 Nest 中，几乎所有东西都是跨请求共享的。这包括资源，如数据库连接池、单例服务具有全局状态、等等。需要注意的是，Node.js 不使用请求/响应多线程无状态模型，每个请求都由单独的线程处理。因此，在 Nest 中使用单例实例是完全安全的。

然而，在某些特殊情况下，可能需要将控制器请求到期的生命周期。例如，GraphQL 应用程序中的 per-request 缓存、请求跟踪或实现多租户。你可以了解更多关于控制依赖注入作用域的信息 __LINK_320__。

#### 异步处理

我们热爱现代 JavaScript，特别是其强调异步数据处理的特点。这是 Nest 全部支持 __INLINE_CODE_119__ 函数的原因。每个 __INLINE_CODE_120__ 函数都必须返回 __INLINE_CODE_121__，这允许您返回一个 Nest 可以自动解析的延迟值。下面是一个示例：

__CODE_BLOCK_12__

这个代码是有效的。但是，Nest 还允许路由处理程序返回 RxJS __LINK_321__。Nest 将内部处理订阅并在流完成时解析最终 emit 的值。

__CODE_BLOCK_13__

这两种方法都是有效的，您可以根据需要选择一种。

#### 请求负载

在我们的前一个示例中，POST 路由处理程序没有接受任何客户端参数。让我们修复它，添加 __INLINE_CODE_122__ 装饰器。

在继续之前（如果您使用 TypeScript），我们需要定义 **DTO**（数据传输对象）架构。DTO 是一个对象，它指定了数据如何在网络上发送。我们可以使用 TypeScript 接口或简单类来定义 DTO 架构。然而，我们建议使用类这里。为什么？类是 JavaScript ES6 标准的一部分，因此在编译成 JavaScript 时它们保持不变。在contrast，TypeScript 接口在转换过程中被删除，这意味着 Nest 在运行时无法引用它们。这对于像 __Pipes__ 这样的特性非常重要，因为它们依赖于在运行时访问变量的元类型，这种元类型只能在类中访问。

让我们创建 __INLINE_CODE_123__ 类：

__CODE_BLOCK_14__

它只有三个基本属性。然后，我们可以使用新创建的 DTO 在 __INLINE_CODE_124__ 中：

__CODE_BLOCK_15__

> info **提示**我们的 __INLINE_CODE_125__ 可以过滤掉不应该被方法处理程序接收的属性。在这个例子中，我们可以 whitelist 可接受的属性，并且在结果对象中自动删除任何不在 whitelist 中的属性。在 __INLINE_CODE_126__ 示例中，我们的 whitelist 是 __INLINE_CODE_127__、__INLINE_CODE_128__ 和 __INLINE_CODE_129__ 属性。了解更多信息 __LINK_322__。

#### 查询参数

在处理路由查询参数时，你可以使用 __INLINE_CODE_130__ 装饰器来从 incoming 请求中提取它们。让我们来看看这个示例。

考虑一个路由，我们想根据查询参数来过滤一组猫的列表，例如 __INLINE_CODE_131__ 和 __INLINE_CODE_132__。首先，定义查询参数在 __INLINE_CODE_133__ 中：

__CODE_BLOCK_16__

在这个示例中，__INLINE_CODE_134__ 装饰器用于从查询字符串中提取 __INLINE_CODE_135__ 和 __INLINE_CODE_136__ 的值。例如，请求：

__CODE_BLOCK_17__

将结果在 __INLINE_CODE_137__ 是 __INLINE_CODE_138__，__INLINE_CODE_139__ 是 __INLINE_CODE_140__。

如果您的应用程序需要处理更复杂的查询参数，例如嵌套对象或数组：

__CODE_BLOCK_18__

那么，您需要配置 HTTP 适配器（Express 或 Fastify）以使用适当的查询解析器。在 Express 中，您可以使用 __INLINE_CODE_141__ 解析器，这允许富查询对象：

__CODE_BLOCK_19__

在 Fastify 中，您可以使用 __INLINE_CODE_142__ 选项：

__CODE_BLOCK_20__

> info **提示** __INLINE_CODE_143__ 是一个支持嵌套和数组的查询字符串解析器。您可以使用 __INLINE_CODE_144__ 安装它。

#### 处理错误Here is the translated Chinese technical documentation:

#### 错误处理

请查看关于错误处理的独立章节：__LINK_323__。

#### 完整示例资源

以下是一个示例，展示了使用多个可用的装饰器来创建基本控制器。这控制器提供了一些方法来访问和操作内部数据。

__CODE_BLOCK_21__

> 信息 **提示**Nest CLI 提供了一种生成器（ schematics），自动创建**所有 boilerplate 代码**，从而节省了手动创建代码的时间，并提高开发体验。了解更多关于这个功能的信息 __LINK_324__。

#### 获取运行

即使 __INLINE_CODE_145__ 已经完全定义，但是 Nest 还不知道这个类，并且不会自动创建这个类的实例。

控制器总是需要作为模块的一部分，因此我们在 __INLINE_CODE_147__ 装饰器中包含 __INLINE_CODE_146__ 数组。因为我们尚未定义其他模块，除了根 __INLINE_CODE_148__，我们将使用它来注册 __INLINE_CODE_149__：

__CODE_BLOCK_22__

我们使用 __INLINE_CODE_150__ 装饰器将元数据附加到模块类上，所以 Nest 可以轻松确定哪些控制器需要被挂载。

#### 库特定的方法

到目前为止，我们已经涵盖了 Nest 对应的标准方法来处理响应。另一个方法是使用库特定的 __LINK_325__。要将特定的响应对象注入，我们可以使用 __INLINE_CODE_151__ 装饰器。为了突出差异，让我们重写 __INLINE_CODE_152__：

__CODE_BLOCK_23__

虽然这个方法工作，并且提供了更多的灵活性，允许完全控制响应对象（例如头部 manipulation 和访问库特定的功能），但是需要小心使用。这个方法的主要缺点是代码变得平台依赖，因为不同的 underlying 库可能具有不同的 API 来响应对象。另外，这也会使测试更加困难，因为需要模拟响应对象等。

此外，使用这个方法，您将失去与 Nest 功能相关的标准响应处理的兼容性，例如拦截器和 __INLINE_CODE_153__ / __INLINE_CODE_154__ 装饰器。为了解决这个问题，可以启用 __INLINE_CODE_155__ 选项：

__CODE_BLOCK_24__

使用这个方法，您可以与 native 响应对象交互（例如根据特定条件设置Cookie或头部），而仍然允许框架处理其余部分。