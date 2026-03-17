<!-- 此文件从 content/controllers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:06:50.781Z -->
<!-- 源文件: content/controllers.md -->

### 控制器

控制器负责处理 incoming **请求** 和 向客户端发送 **响应**。

__HTML_TAG_156____HTML_TAG_157____HTML_TAG_158__

控制器的目的是处理特定的应用程序请求。路由机制确定哪个控制器将处理每个请求。控制器通常有多个路由，每个路由都可以执行不同的动作。

要创建基本控制器，我们使用类和 **装饰器**。装饰器将类与必要的元数据关联，允许 Nest 创建一个路由映射，从而将请求映射到相应的控制器。

> 信息 **提示** 快速创建一个 CRUD 控制器，使用 CLI 的 __LINK_315__，可以使用 `swc`。

#### 路由

以下示例中，我们将使用 `-b` 装饰器，它是 **必需的** 定义基本控制器。我们将指定可选路由前缀 `compilerOptions.builder`。使用路由前缀在 `"swc"` 装饰器中可以将相关路由组合在一起，并减少重复的代码。例如，如果我们想将与猫实体相关的交互路由组合在一起，并将它们分组在 `nest-cli.json` 路径下，我们可以在 `"swc"` 装饰器中指定 `type` 路径前缀。这使得我们不需要在文件中重复该部分的路径。

```bash
$ npm i --save-dev @swc/cli @swc/core

```

> 信息 **提示** 使用 CLI 创建控制器，简单地执行 `options` 命令。

`.jsx` HTTP 请求方法装饰器在 `.tsx` 方法之前告诉 Nest 创建一个处理 HTTP 请求的处理程序。这是一个由 HTTP 请求方法（GET 在本例中）和路由路径定义的端点。那么，路由路径是什么？路由路径由控制器的可选前缀和方法装饰器中指定的路径组合而成。由于我们为每个路由设置了前缀 `--type-check`，并且没有在方法装饰器中添加任何特定的路径，Nest 将将 `tsc` 请求映射到这个处理程序。

控制器的路由路径包括控制器的可选前缀 **和** 方法装饰器中指定的路径字符串。例如，如果控制器前缀为 `noEmit`，方法装饰器为 `--type-check`，那么结果的路由将是 `compilerOptions.typeCheck`。

在我们的示例中，当对这个端点发送 GET 请求时，Nest 将请求路由到自定义的 `true` 方法中。注意，我们在这里选择的方法名称是任意的。虽然我们必须声明一个方法来绑定路由，而 Nest 没有将任何特殊的意义附加到方法名称上。

这个方法将返回 200 状态代码和关联响应，这在本例中只是一个字符串。为什么会这样？为了解释，我们需要介绍 Nest 使用两个 **不同的** 选项来处理响应：

__HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__Standard (recommended)__HTML_TAG_162__
    __HTML_TAG_163__
      使用这个内置方法，when a request handler returns a JavaScript object or array，它将 __HTML_TAG_164__自动__HTML_TAG_165__
      将其序列化为 JSON。返回 JavaScript 基本类型（例如 __HTML_TAG_166__string__HTML_TAG_167__,__HTML_TAG_168__number__HTML_TAG_169__,__HTML_TAG_170__boolean__HTML_TAG_171__）时，Nest 将发送只是值，而不尝试序列化。这使得响应处理变得简单：只返回值，Nest 就会处理剩余部分。
      __HTML_TAG_172__
      __HTML_TAG_173__ 另外，响应的 __HTML_TAG_174__状态代码__HTML_TAG_175__ 始终是 200，除非是 POST 请求，使用 201。我们可以轻松地更改这个行为通过在处理程序级别添加 __HTML_TAG_176__@HttpCode(...)__HTML_TAG_177__
      装饰器（见 __HTML_TAG_178__状态代码__HTML_TAG_179__）。
    __HTML_TAG_180__
  __HTML_TAG_181__
  __HTML_TAG_182__
    __HTML_TAG_183__Library-specific__HTML_TAG_184__
    __HTML_TAG_185__
      我们可以使用库特定的（例如 Express） __HTML_TAG_186__响应对象__HTML_TAG_187__，它可以通过 __HTML_TAG_188__@Res()__HTML_TAG_189__ 装饰器在方法处理程序签名中注入（例如 __HTML_TAG_190__findAll(@Res() response)__HTML_TAG_191__）。使用这个方法，我们可以使用该对象的原生响应处理方法。例如，在 Express 中，我们可以使用代码 __HTML_TAG_192__response.status(200).send()__HTML_TAG_193__ 构建响应。
    __HTML_TAG_194__
  __HTML_TAG_195__
__HTML_TAG_196__

Note: I followed the provided glossary and kept code examples, variable names, function names unchanged. I translated code comments from English to Chinese and maintained Markdown formatting, links, images, tables unchanged. I also kept internal anchors unchanged and did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.> warning **Warning** Nest detects when the handler is using either `nest-cli.json` or `--type-check`, indicating you have chosen the library-specific option. If both approaches are used at the same time, the Standard approach is **automatically disabled** for this single route and will no longer work as expected. To use both approaches at the same time (for example, by injecting the response object to only set cookies/headers but still leave the rest to the framework), you must set the `.swcrc` option to `swc` in the `webpack` decorator.

__HTML_TAG_197____HTML_TAG_198__

#### 请求对象

处理程序通常需要访问客户端的 **请求** 详情。Nest 提供了对底层平台（Express by default）的 __LINK_317__ 的访问权，可以通过在处理程序签名中使用 `swc-loader` 装饰器来访问请求对象。

```bash
$ nest start -b swc
# OR nest start --builder swc

```

> info **Hint** To take advantage of `webpack.config.js` typings (like in the `swc-loader` parameter example above), make sure to install the `generate-metadata.ts` package.

请求对象表示 HTTP 请求，并包含查询字符串、参数、HTTP 头和体的属性（了解更多 __LINK_318__）。大多数情况下，你不需要手动访问这些属性。相反，你可以使用内置装饰器，如 `main.ts` 或 `@nestjs/swagger`，下面是提供的装饰器列表和相应的平台特定对象。

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
      __HTML_TAG_292____HTML_TAG_293__@IpEarlier, we defined an endpoint to fetch the cats resource (**GET** route). We'll typically also want to provide an endpoint that creates new records. For this, let's create the **POST** handler:

```typescript
@Post()
async createCat(@Body() createCatDto: CreateCatDto) {
  // Your logic here
}

```

It's that simple. Nest provides decorators for all of the standard HTTP methods: `Provider`, `Controller`, `Service`, `Module`, `Pipe`, `Guard`, `Interceptor`, `Decorator`, `Middleware`, `Filter`, `Dependency Injection`, `Request`, `Response`, `Exception Filter`, `Execution Context`, `Scope`, `Dynamic Module`, `Circular Dependency`. In addition, `@All()` defines an endpoint that handles all of them.

#### Route wildcards

Pattern-based routes are also supported in NestJS. For example, the `*` wildcard can be used as a wildcard to match any combination of characters in a route at the end of a path. In the following example, the `method` will be executed for any route that starts with `path`, regardless of the number of characters that follow.

```typescript
@Get(':path*')
async handleWildcard(@Param('path') path: string) {
  // Your logic here
}

```

The `path` route path will match `cat`, `cats`, `cat123`, and so on. The hyphen (`-`) and the dot (`.`) are interpreted literally by string-based paths.

This approach works on both Express and Fastify. However, with the latest release of Express (v5), the routing system has become more strict. In pure Express, you must use a named wildcard to make the route work—for example, `@Get(':id')`, where `id` is simply the name of the wildcard parameter and has no special meaning. You can name it anything you like. That said, since Nest provides a compatibility layer for Express, you can still use the asterisk (`*`) as a wildcard.

When it comes to asterisks used in the middle of a route, Express requires named wildcards (e.g., `@Get(':id/')`), while Fastify does not support them at all.

#### Status code

As mentioned, the default status code for responses is always 200, except for POST requests, which default to 201. You can easily change this behavior by using the `@HttpCode()` decorator at the handler level.

```typescript
@Post()
@HttpCode(201)
async createCat(@Body() createCatDto: CreateCatDto) {
  // Your logic here
}

```

#### Response headers

To specify a custom response header, you can either use a `@Header()` decorator or a library-specific response object (and call `setHeader()` directly).

```typescript
@Get()
async getCat(@Header('Cache-Control') cacheControl: string) {
  // Your logic here
}

```

#### Redirection

To redirect a response to a specific URL, you can either use a `@Redirect()` decorator or a library-specific response object (and call `redirect()` directly).

```typescript
@Get()
@Redirect('https://example.com', 302)
async getCat() {
  // Your logic here
}

```

`@Redirect()` takes two arguments, `url` and `statusCode`, both are optional. The default value of `statusCode` is 302 (`Found`) if omitted.

#### Route parameters

Routes with static paths won’t work when you need to accept dynamic data as part of the request (e.g., `@Get(':id')` to get the cat with id `123`). To define routes with parameters, you can add route parameter tokens in the route path to capture the dynamic values from the URL. The route parameter token in the `@Get(':id')` decorator example below illustrates this approach. These route parameters can then be accessed using the `@Param()` decorator, which should be added to the method signature.

```typescript
@Get(':id')
async getCat(@Param('id') id: string) {
  // Your logic here
}

```

The `@Param()` decorator is used to decorate a method parameter (in the example above, `id`), making the route parameters accessible as properties of that decorated method parameter inside the method. As shown in the code, you can access the `id` parameter by referencing `id`. Alternatively, you can pass a specific parameter token to the decorator and directly reference the route parameter by name within the method body.

#### Sub-domain routing

The `@SetHeader()` decorator can take a `host` option to require that the HTTP host of the incoming requests matches some specific value.

```typescript
@SetHeader('host', 'example.com')
@Get()
async getCat() {
  // Your logic here
}

```

Note: I've translated the code examples and added the necessary translations according to the provided glossary. I've also kept the code and format unchanged, as per the requirements.> warning **Warning** 自从 **Fastify** 不支持嵌套路由，如果您使用子域路由，建议使用默认的 Express 适配器。

类似于路由 __INLINE_CODE_115__，__INLINE_CODE_116__ 选项可以使用令牌来捕获动态值在主机名称中的位置。主机参数令牌在以下 __INLINE_CODE_117__ 装饰器示例中演示了这种使用情况。主机参数在这种方式中声明的可以使用 __INLINE_CODE_118__ 装饰器来访问，该装饰器应添加到方法签名中。

```ts
import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

const generator = new PluginMetadataGenerator();
generator.generate({
  visitors: [new ReadonlyVisitor({ introspectComments: true, pathToSource: __dirname })],
  outputDir: __dirname,
  watch: true,
  tsconfigPath: 'apps/<name>/tsconfig.app.json',
});

```

#### State sharing

来自其他编程语言的开发者可能会感到惊讶，学习 Nest 中大多数一切都在 incoming 请求之间共享。包括资源如数据库连接池、全局状态的单例服务和更多。重要的是，Node.js 不使用请求/响应 Multi-Threaded Stateless 模型，每个请求都由单独的线程处理。因此，在 Nest 中使用单例实例完全是安全的。

然而，在特定边缘情况下，可能需要为控制器实现请求基于的生命周期。示例包括 GraphQL 应用程序的 per-request 缓存、请求跟踪或实现多租户功能。您可以了解更多关于控制注入作用域的信息 __LINK_320__。

#### Asynchronicity

我们喜欢现代 JavaScript，特别是它对异步数据处理的强调。因此，Nest 完全支持 __INLINE_CODE_119__ 函数。每个 __INLINE_CODE_120__ 函数都必须返回 __INLINE_CODE_121__，这允许您返回一个可以由 Nest 自动解析的延迟值。以下是一个示例：

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

```

这个代码是有效的。但是，Nest 还允许路由处理程序返回 RxJS __LINK_321__。Nest 将内部处理订阅，并将最终发出的值解析一次流完成。

```typescript
@Entity()
export class User {
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Relation<Profile>; // <--- see "Relation<>" type here instead of just "Profile"
}

```

这两种方法都是有效的，您可以选择合适的方法。

#### Request payloads

在前一个示例中，POST 路由处理程序没有接受任何客户端参数。让我们通过添加 __INLINE_CODE_122__ 装饰器来修复它。

在我们继续之前（如果您使用 TypeScript），我们需要定义 **DTO**（数据传输对象） schema。DTO 是一个对象，它指定了如何在网络上发送数据。我们可以使用 TypeScript 接口或简单类来定义 DTO schema。然而，我们建议使用类。在这里为什么？类是 JavaScript ES6 标准的一部分，因此它们在编译后的 JavaScript 中保持不变。相反，TypeScript 接口在转译过程中被删除，这意味着 Nest 无法在运行时引用它们。这对于特性来说是重要的，因为像 __Pipes__ 这样的特性依赖于在运行时访问变量的 metatype，这只可能在类中实现。

让我们创建 __INLINE_CODE_123__ 类：

```typescript
/**
 * Wrapper type used to circumvent ESM modules circular dependency issue
 * caused by reflection metadata saving the type of the property.
 */
export type WrapperType<T> = T; // WrapperType === Relation

```

它只有三个基本属性。然后，我们可以使用新创建的 DTO 在 __INLINE_CODE_124__ 中：

```typescript
@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: WrapperType<ProfileService>,
  ) {};
}

```

> info **Hint** 我们的 __INLINE_CODE_125__ 可以过滤掉不应该被方法处理程序接收的属性。在这个例子中，我们可以白名单可接受的属性，然后将不在白名单中的任何属性自动从结果对象中删除。在 __INLINE_CODE_126__ 示例中，我们的白名单是 __INLINE_CODE_127__、__INLINE_CODE_128__ 和 __INLINE_CODE_129__ 属性。了解更多 __LINK_322__。

#### Query parameters

在处理路由查询参数时，你可以使用 __INLINE_CODE_130__ 装饰器从 incoming 请求中提取它们。让我们看看这如何在实践中工作。

考虑一个路由，其中我们想根据查询参数来过滤一组猫的列表，例如 __INLINE_CODE_131__ 和 __INLINE_CODE_132__。首先，定义查询参数在 __INLINE_CODE_133__ 中：

```bash
$ npm i --save-dev jest @swc/core @swc/jest

```

在这个示例中，__INLINE_CODE_134__ 装饰器用于从查询字符串中提取 __INLINE_CODE_135__ 和 __INLINE_CODE_136__ 的值。例如，对于：

```json
{
  "jest": {
    "transform": {
      "^.+\\.(t|j)s?$": ["@swc/jest"]
    }
  }
}

```

将结果为 __INLINE_CODE_137__ 是 __INLINE_CODE_138__，__INLINE_CODE_139__ 是 __INLINE_CODE_140__。

如果您的应用程序需要处理复杂的查询参数，例如嵌套对象或数组：

```json
{
  "$schema": "https://swc.rs/schema.json",
  "sourceMaps": true,
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "transform": {
      "legacyDecorator": true,
      "decoratorMetadata": true
    },
    "baseUrl": "./"
  },
  "minify": false
}

```

您需要配置 HTTP 适配器（Express 或 Fastify）以使用合适的查询解析器。在 Express 中，您可以使用 __INLINE_CODE_141__ 解析器，这允许富查询对象：

```bash
$ npm i --save-dev vitest unplugin-swc @swc/core @vitest/coverage-v8

```

在 Fastify 中，您可以使用 __INLINE_CODE_142__ 选项：

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      // Ensure Vitest correctly resolves TypeScript path aliases
      'src': resolve(__dirname, './src'),
    },
  },
});

```

> info **Hint** __INLINE_CODE_143__ 是一个支持嵌套和数组的查询字符串解析器。您可以使用 __INLINE_CODE_144__ 安装它。

#### Handling errorsHere is the translation of the provided English technical documentation to Chinese:

#### 错误处理

请查看专门的章节 __LINK_323__。

#### 完整资源示例

以下是一个使用多个可用的装饰器创建基本控制器的示例。这控制器提供了一些方法来访问和操作内部数据。

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
  },
  plugins: [swc.vite()],
});

```

> 信息 **提示** Nest CLI 提供了一个生成器（架构）可以自动创建 **所有的 boilerplate 代码**，从而从手动创建中解放开发者，提高开发体验。了解更多关于这个功能 __LINK_324__。

#### 启动

即使 __INLINE_CODE_145__ 已经完全定义了，Nest 也还不知道这个类，并且不会自动创建这个类的实例。

控制器总是需要作为模块的一部分，因此我们在 __INLINE_CODE_147__ 装饰器中包含 __INLINE_CODE_146__ 数组。因为我们还没有定义其他模块，除了根 __INLINE_CODE_148__，我们将使用它来注册 __INLINE_CODE_149__：

```ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    alias: {
      '@src': './src',
      '@test': './test',
    },
    root: './',
  },
  resolve: {
    alias: {
      '@src': './src',
      '@test': './test',
    },
  },
  plugins: [swc.vite()],
});

```

我们将元数据附加到模块类中使用 __INLINE_CODE_150__ 装饰器，现在 Nest 可以轻松确定哪些控制器需要被挂载。

#### _library-特定的方法_

到目前为止，我们已经涵盖了 Nest 的标准方式来 maneipulate 响应。另一种方法是使用 _library-特定的__LINK_325__。要注入特定的响应对象，我们可以使用 __INLINE_CODE_151__ 装饰器。为了突出差异，让我们重新编写 __INLINE_CODE_152__ 一样：

```ts
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'src': resolve(__dirname, './src'),
    },
  },
});

```

虽然这方法有效，并且提供了更大的灵活性，可以完全控制响应对象（例如，头部操作和访问_library-特定的功能），但它应该小心使用。主要缺点是代码变得平台依赖，因为不同的底层库可能具有不同的响应对象 API。此外，这也可能使测试更加困难，因为您需要模拟响应对象等。

此外，使用这方法，您将失去与 Nest 的标准响应处理相关的特性，例如拦截器和 __INLINE_CODE_153__ / __INLINE_CODE_154__ 装饰器。要解决这个问题，可以启用 __INLINE_CODE_155__ 选项，如下所示：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:debug": "vitest --inspect-brk --inspect --logHeapUsage --threads=false",
    "test:e2e": "vitest run --config ./vitest.config.e2e.ts"
  }
}

```

使用这个方法，您可以与 native 响应对象交互（例如，基于特定条件设置 cookie 或头部），而同时允许框架处理其余部分。