<!-- 此文件从 content/controllers.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:34:21.141Z -->
<!-- 源文件: content/controllers.md -->

### 控制器

控制器负责处理 incoming 请求并将响应发送回客户端。

__HTML_TAG_156__ _____ __HTML_TAG_157__ _____ __HTML_TAG_158__

控制器的目的是处理特定的应用程序请求。路由机制确定哪个控制器将处理每个请求。经常，控制器有多个路由，每个路由可以执行不同的操作。

要创建基本控制器，我们使用类和装饰器。装饰器将类与必要的元数据关联，使Nest可以创建一个路由映射，该映射将请求与对应控制器连接。

> info 提示使用 CLI 的 __LINK_315__ 可以快速创建一个 CRUD 控制器，带有内置的 __LINK_316__： `swc`。

#### 路由

以下示例中，我们将使用 `-b` 装饰器，该装饰器是创建基本控制器所必需的。我们将指定可选的路由路径前缀 `compilerOptions.builder`。使用路径前缀在 `"swc"` 装饰器中帮助我们将相关路由组合在一起，并减少重复的代码。例如，如果我们想将猫实体的交互路由组合在一起，并将它们分组在 `nest-cli.json` 路径下，我们可以在 `"swc"` 装饰器中指定 `type` 路径前缀。这 way，我们不需要在文件中重复该部分的路径。

```bash
$ npm i --save-dev @swc/cli @swc/core

```

> info 提示使用 CLI 创建控制器，只需执行 `options` 命令。

`.jsx` HTTP 请求方法装饰器 placed before `.tsx` 方法告诉 Nest 创建一个处理 HTTP 请求的处理程序。这 个处理程序由 HTTP 请求方法（GET 在本例中）和路由路径定义。因此，路由路径是什么？路由路径由控制器的可选前缀与方法装饰器指定的路径组合。因为我们为每个路由设置了前缀 `--type-check`，并且没有在方法装饰器中添加任何特定的路径，Nest 将将 `tsc` 请求映射到这个处理程序。

如前所述，路由路径包括控制器的可选前缀和方法装饰器指定的路径字符串。例如，如果控制器前缀是 `noEmit`，方法装饰器是 `--type-check`，则路由将是 `compilerOptions.typeCheck`。

在我们的示例中，当收到 GET 请求时，Nest 将将请求路由到用户定义的 `true` 方法。请注意，我们在这里选择的方法名称是任意的。虽然我们必须声明一个方法来绑定路由，但 Nest 没有附加任何特定的意义于方法名称。

这个方法将返回 200 状态代码和关联的响应，这个响应在本例中是一个字符串。为什么会这样？为了解释，我们需要介绍 Nest 使用两个不同的选项来处理响应：

__HTML_TAG_159__
  __HTML_TAG_160__
    __HTML_TAG_161__Standard (recommended)__HTML_TAG_162__
    __HTML_TAG_163__
      使用内置方法时，当请求处理程序返回 JavaScript 对象或数组时，它将自动被序列化为 JSON。对于返回 JavaScript 基本类型（例如 __HTML_TAG_166__ string __HTML_TAG_167__，__HTML_TAG_168__ number __HTML_TAG_169__，__HTML_TAG_170__ boolean __HTML_TAG_171__）时，Nest 将发送只是该值，而不尝试序列化。这使得响应处理简单：只返回值，Nest 就会处理剩余的部分。
      __HTML_TAG_172__
      __HTML_TAG_173__此外，响应的 __HTML_TAG_174__状态代码__HTML_TAG_175__始终是 200，除非是 POST 请求使用 201。我们可以轻松地更改这个行为 bằng 添加 __HTML_TAG_176__@HttpCode(...)__HTML_TAG_177__ 装饰器在处理程序级别（见 __HTML_TAG_178__状态代码__HTML_TAG_179__）。
    __HTML_TAG_180__
  __HTML_TAG_181__
  __HTML_TAG_182__
    __HTML_TAG_183__Library-specific__HTML_TAG_184__
    __HTML_TAG_185__
      我们可以使用库特定的（例如 Express） __HTML_TAG_186__ response 对象__HTML_TAG_187__，该对象可以使用 __HTML_TAG_188__@Res()__HTML_TAG_189__ 装饰器在方法处理程序签名中注入（例如 __HTML_TAG_190__ findAll (@Res() response)__HTML_TAG_191__）。使用这种方法，您可以使用该对象提供的原生响应处理方法。例如，在 Express 中，您可以使用代码 __HTML_TAG_192__ response.status(200).send()__HTML_TAG_193__ 构建响应。
    __HTML_TAG_194__
  __HTML_TAG_195__
__HTML_TAG_196__> 警告 **Warning** Nest 可以检测到处理程序使用了 `nest-cli.json` 或 `--type-check`，这表明您已经选择了库特定的选项。如果同时使用这两个方法， Standard 方法将被 **自动禁用**，并且将不再像预期那样工作。要同时使用这两个方法（例如，通过将响应对象注入到处理程序中，以便只设置 Cookie/头信息，但仍然留下框架的其余部分），您必须将 `.swcrc` 选项设置为 `swc` 在 `webpack` 装饰器中。

__HTML_TAG_197____HTML_TAG_198__

#### 请求对象

处理程序通常需要访问客户端的 **请求** 详情。Nest 提供了对底层平台（Express by default）的 __LINK_317__ 的访问权，你可以使用 `swc-loader` 装饰器在处理程序签名中注入请求对象。

```bash
$ nest start -b swc
# OR nest start --builder swc

```

> 信息 **Hint** 要充分利用 `webpack.config.js` 类型（像在 `swc-loader` 参数示例中），请确保安装 `generate-metadata.ts` 包。

请求对象代表 HTTP 请求，并包含查询字符串、参数、HTTP 头和体（了解更多 __LINK_318__）。在大多数情况下，您不需要手动访问这些属性。相反，您可以使用专门的装饰器，如 `main.ts` 或 `@nestjs/swagger`，这两个装饰器都是内置的。下面是提供的装饰器和相应平台特定的对象列表。

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
   Here is the translation of the provided English technical documentation to Chinese:

Earlier, we defined an endpoint to fetch the cats resource (**GET** route). We'll typically also want to provide an endpoint that creates new records. For this, let's create the **POST** handler:

```typescript

```json
{
  "compilerOptions": {
    "builder": "swc"
  }
}

```

```

It's that simple. Nest provides decorators for all of the standard HTTP methods: `generate-metadata`, `Relation`, `typeorm`, `package.json`, `jest.config.js`, `transform`, and `.swcrc`. In addition, `legacyDecorator` defines an endpoint that handles all of them.

#### Route wildcards

Pattern-based routes are also supported in NestJS. For example, the asterisk (`decoratorMetadata`) can be used as a wildcard to match any combination of characters in a route at the end of a path. In the following example, the `PluginMetadataGenerator` method will be executed for any route that starts with `vitest.config.ts`, regardless of the number of characters that follow.

```typescript

```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": {
        "swcrcPath": "infrastructure/.swcrc",
      }
    }
  }
}

```

```

The `include` route path will match `alias`, `src/`, `resolve.alias`, and so on. The hyphen ( `vitest.config.ts`) and the dot (`import * as request from 'supertest'`) are interpreted literally by string-based paths.

This approach works on both Express and Fastify. However, with the latest release of Express (v5), the routing system has become more strict. In pure Express, you must use a named wildcard to make the route work—for example, `import request from 'supertest'`, where __INLINE_CODE_81__ is simply the name of the wildcard parameter and has no special meaning. You can name it anything you like. That said, since Nest provides a compatibility layer for Express, you can still use the asterisk (__INLINE_CODE_82__) as a wildcard.

When it comes to asterisks used in the **middle of a route**, Express requires named wildcards (e.g., __INLINE_CODE_83__), while Fastify does not support them at all.

#### Status code

As mentioned, the default **status code** for responses is always **200**, except for POST requests, which default to **201**. You can easily change this behavior by using the __INLINE_CODE_84__ decorator at the handler level.

```typescript

```json
{
  "compilerOptions": {
    "builder": {
      "type": "swc",
      "options": { "extensions": [".ts", ".tsx", ".js", ".jsx"] }
    },
  }
}

```

```

> info **Hint** Import __INLINE_CODE_85__ from the __INLINE_CODE_86__ package.

Often, your status code isn't static but depends on various factors. In that case, you can use a library-specific **response** (inject using __INLINE_CODE_87__) object (or, in case of an error, throw an exception).

#### Response headers

To specify a custom response header, you can either use a __INLINE_CODE_88__ decorator or a library-specific response object (and call __INLINE_CODE_89__ directly).

```typescript

```bash
$ nest start -b swc -w
# OR nest start --builder swc --watch

```

```

> info **Hint** Import __INLINE_CODE_90__ from the __INLINE_CODE_91__ package.

#### Redirection

To redirect a response to a specific URL, you can either use a __INLINE_CODE_92__ decorator or a library-specific response object (and call __INLINE_CODE_93__ directly).

__INLINE_CODE_94__ takes two arguments, __INLINE_CODE_95__ and __INLINE_CODE_96__, both are optional. The default value of __INLINE_CODE_97__ is __INLINE_CODE_98__ (__INLINE_CODE_99__) if omitted.

```typescript

```bash
$ nest start -b swc --type-check

```

```

> info **Hint** Sometimes you may want to determine the HTTP status code or the redirect URL dynamically. Do this by returning an object following the __INLINE_CODE_100__ interface (from __INLINE_CODE_101__).

Returned values will override any arguments passed to the __INLINE_CODE_102__ decorator. For example:

```typescript

```json
{
  "compilerOptions": {
    "builder": "swc",
    "typeCheck": true
  }
}

```

```

#### Route parameters

Routes with static paths won’t work when you need to accept **dynamic data** as part of the request (e.g., __INLINE_CODE_103__ to get the cat with id __INLINE_CODE_104__). To define routes with parameters, you can add route parameter **tokens** in the route path to capture the dynamic values from the URL. The route parameter token in the __INLINE_CODE_105__ decorator example below illustrates this approach. These route parameters can then be accessed using the __INLINE_CODE_106__ decorator, which should be added to the method signature.

> info **Hint** Routes with parameters should be declared after any static paths. This prevents the parameterized paths from intercepting traffic destined for the static paths.

```typescript

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
    "baseUrl": "./"
  },
  "minify": false
}

```

```

The __INLINE_CODE_107__ decorator is used to decorate a method parameter (in the example above, __INLINE_CODE_108__), making the **route** parameters accessible as properties of that decorated method parameter inside the method. As shown in the code, you can access the __INLINE_CODE_109__ parameter by referencing __INLINE_CODE_110__. Alternatively, you can pass a specific parameter token to the decorator and directly reference the route parameter by name within the method body.

> info **Hint** Import __INLINE_CODE_111__ from the __INLINE_CODE_112__ package.

```typescript

```bash
$ npm i --save-dev swc-loader

```

```

#### Sub-domain routing

The __INLINE_CODE_113__ decorator can take a __INLINE_CODE_114__ option to require that the HTTP host of the incoming requests matches some specific value.

```typescript

```js
const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;

module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: swcDefaultConfig,
        },
      },
    ],
  },
};

```

```

Translation Notes:

* I strictly followed the> 警告 **Warning** 自因 **Fastify** 不支持嵌套路由，如果您正在使用子域路由，建议使用默认的 Express 适配器。

类似于一个路由 __INLINE_CODE_115__，__INLINE_CODE_116__ 选项可以使用令牌来捕捉动态值在主机名称中的该位置。下面是 __INLINE_CODE_117__ 装饰器示例中 host 参数令牌的使用。使用这种方式 declare 的主机参数可以使用 __INLINE_CODE_118__ 装饰器访问，该装饰器应添加到方法签名中。

__代码块 11__

#### 状态共享

来自其他编程语言的开发者可能会感到惊讶，因为在 Nest 中，几乎所有内容都可以在 incoming 请求之间共享。这包括资源，如数据库连接池、全局状态的单例服务，以及更多。需要注意的是，Node.js 不使用请求/响应多线程无状态模型，每个请求都由单独的线程处理。因此，在 Nest 中使用单例实例是完全安全的。

然而，有些特殊情况下，可能需要在控制器中使用请求基于的生命周期。示例包括 GraphQL 应用程序中的 per-request 缓存、请求跟踪或实现多租户。您可以了解更多关于控制注入作用域 __LINK_320__。

#### 异步性

我们热爱 modern JavaScript，特别是它对异步数据处理的强调。因此，Nest 完全支持 __INLINE_CODE_119__ 函数。每个 __INLINE_CODE_120__ 函数都必须返回 __INLINE_CODE_121__，这允许您返回一个可以由 Nest 自动解析的延迟值。下面是一个示例：

__代码块 12__

这个代码是有效的。但是，Nest 还允许路由处理程序返回 RxJS __LINK_321__。Nest 将内部处理订阅并在流完成时解析最终 emitted 值。

__代码块 13__

两种方法都是有效的，您可以根据需要选择一种。

#### 请求负载

在我们的前一个示例中，POST 路由处理程序没有接受客户端参数。让我们修复这个问题，添加 __INLINE_CODE_122__ 装饰器。

在继续之前（如果您使用 TypeScript），我们需要定义 **DTO**（数据传输对象）架构。DTO 是一个对象，它指定了数据应该如何在网络上发送。我们可以使用 TypeScript 接口或简单类来定义 DTO 架构。然而，我们建议使用类。为什么？类是 JavaScript ES6 标准的一部分，因此它们在编译后的 JavaScript 中保持不变。相反，TypeScript 接口在转译期间被删除，这意味着 Nest 在 runtime 无法引用它们。这是重要的，因为特性，如 __Pipes__ 依赖于在 runtime 有访问变量元类型的能力，这只可能在类中实现。

让我们创建 __INLINE_CODE_123__ 类：

__代码块 14__

它只有三个基本属性。然后，我们可以使用新创建的 DTO 内部 __INLINE_CODE_124__：

__代码块 15__

> 提示 **Hint** 我们的 __INLINE_CODE_125__ 可以过滤掉不应该由方法处理程序接收的属性。在这个示例中，我们可以 whitelist 可接受的属性，然后将任何不包括在 whitelist 中的属性自动从结果对象中删除。在 __INLINE_CODE_126__ 示例中，我们的 whitelist 是 __INLINE_CODE_127__、__INLINE_CODE_128__ 和 __INLINE_CODE_129__ 属性。了解更多 __LINK_322__。

#### 查询参数

当处理路由查询参数时，您可以使用 __INLINE_CODE_130__ 装饰器将其从 incoming 请求中提取。让我们来看这个示例。

考虑一个路由，我们想要根据查询参数 __INLINE_CODE_131__ 和 __INLINE_CODE_132__ 筛选一组猫。首先，定义查询参数在 __INLINE_CODE_133__：

__代码块 16__

在这个示例中，__INLINE_CODE_134__ 装饰器用于从查询字符串中提取 __INLINE_CODE_135__ 和 __INLINE_CODE_136__ 的值。例如，对于：

__代码块 17__

将结果为 __INLINE_CODE_137__ 是 __INLINE_CODE_138__，__INLINE_CODE_139__ 是 __INLINE_CODE_140__。

如果您的应用程序需要处理更复杂的查询参数，如嵌套对象或数组：

__代码块 18__

您需要配置 HTTP 适配器（Express 或 Fastify）以使用适当的查询解析器。在 Express 中，您可以使用 __INLINE_CODE_141__ 解析器，它支持 rich 查询对象：

__代码块 19__

在 Fastify 中，您可以使用 __INLINE_CODE_142__ 选项：

__代码块 20__

> 提示 **Hint** __INLINE_CODE_143__ 是一个 querystring 解析器，支持嵌套和数组。您可以使用 __INLINE_CODE_144__ 安装它。

#### 处理错误Here is the translation of the provided English technical documentation to Chinese:

#### 错误处理（错误）

__LINK_323__。

#### 完整资源示例

以下是一个使用多个可用的装饰器来创建基本控制器的示例。这控制器提供了一些方法来访问和操作内部数据。

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

> 信息 **提示**：Nest CLI 提供了一个生成器（架构）可以自动创建 **所有 boilerplate 代码**，避免手动编写代码，提高开发体验。了解更多关于这个功能 __LINK_324__。

#### 获取开始

即使代码 __INLINE_CODE_145__ 已经完全定义，但 Nest 还不知道这个类的实例并不会自动创建。

控制器总是需要在模块中，所以我们将 __INLINE_CODE_146__ 数组包含在 __INLINE_CODE_147__ 装饰器中。因为我们还没有定义其他模块except for the root __INLINE_CODE_148__，所以我们将使用它来注册 __INLINE_CODE_149__：

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

我们将元数据附加到模块类使用 __INLINE_CODE_150__ 装饰器，现在 Nest 可以轻松确定哪些控制器需要安装。

#### 库特定的方法

到目前为止，我们已经涵盖了 Nest 的标准方式来处理响应。另一种方法是使用库特定的 __LINK_325__。要注入特定的响应对象，我们可以使用 __INLINE_CODE_151__ 装饰器。为了突出差异，让我们重写 __INLINE_CODE_152__ 如下：

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

虽然这个方法可以工作，并且提供了更多的灵活性，允许完全控制响应对象（例如，头部 manipulation 和访问库特定的功能），但应该小心使用。这个方法的主要缺点是您的代码会变得平台依赖，因为不同的 underlying 库可能具有不同的响应对象 API。另外，这也可能会使测试变得更加困难，因为您需要模拟响应对象等。

此外，使用这个方法，您将失去与 Nest 特性相关的响应处理的兼容性，例如拦截器和 __INLINE_CODE_153__ / __INLINE_CODE_154__ 装饰器。为了解决这个问题，您可以启用 __INLINE_CODE_155__ 选项，如下所示：

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

使用这个方法，您可以与原生的响应对象交互（例如，根据特定条件设置cookie 或头部），而仍然允许框架处理其余部分。