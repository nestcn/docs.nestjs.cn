### 控制器

控制器负责处理传入的**请求**并向客户端返回**响应**。

<figure><img class="illustrative-image" src="/assets/Controllers_1.png" /></figure>

控制器的目的是处理应用程序的特定请求。**路由**机制决定了哪个控制器将处理每个请求。通常，一个控制器具有多个路由，每个路由可以执行不同的操作。

要创建基本控制器，我们使用类和**装饰器**。装饰器将类与必要的元数据关联起来，使 Nest 能够创建将请求连接到相应控制器的路由映射。

> info **提示** 要快速创建带有内置[验证](https://docs.nestjs.com/techniques/validation)功能的 CRUD 控制器，可以使用 CLI 的 [CRUD 生成器](https://docs.nestjs.com/recipes/crud-generator#crud-generator)：`nest g resource [name]`。

#### 路由

在以下示例中，我们将使用 `@Controller()` 装饰器，这是定义基本控制器**必需**的。我们将指定一个可选的路径前缀 `cats`。在 `@Controller()` 装饰器中使用路径前缀有助于我们将相关路由分组，并减少重复代码。例如，如果我们想将与猫实体交互的路由分组到 `/cats` 路径下，可以在 `@Controller()` 装饰器中指定 `cats` 路径前缀。这样，我们就不需要为文件中的每个路由重复该路径部分。

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

> info **提示** 要使用 CLI 创建控制器，只需执行 `$ nest g controller [name]` 命令。

`@Get()` HTTP 请求方法装饰器放置在 `findAll()` 方法前，告知 Nest 为 HTTP 请求创建特定端点的处理器。该端点由 HTTP 请求方法（本例中为 GET）和路由路径共同定义。那么什么是路由路径？处理器的路由路径由控制器声明的（可选）前缀与方法装饰器中指定的路径组合而成。由于我们为所有路由设置了 `cats` 前缀且未在方法装饰器中添加具体路径，Nest 会将 `GET /cats` 请求映射到该处理器。

如前所述，路由路径既包含可选的控制器路径前缀**也包含**方法装饰器中指定的路径字符串。例如，若控制器前缀为 `cats` 且方法装饰器为 `@Get('breed')`，则最终路由将是 `GET /cats/breed`。

在上面的示例中，当向该端点发起 GET 请求时，Nest 会将请求路由到用户定义的 `findAll()` 方法。请注意，此处选择的方法名称完全是任意的。虽然我们必须声明一个方法来绑定路由，但 Nest 不会对方法名称赋予任何特定含义。

该方法将返回 200 状态码及关联响应（本例中仅为一个字符串）。为什么会这样？为了解释，我们首先需要介绍 Nest 采用的两种**不同**响应处理方式：

<table>
  <tr>
    <td>标准方式（推荐）</td>
    <td>使用这种内置方法时，当请求处理程序返回 JavaScript 对象或数组时，它会自动序列化为 JSON。然而，当返回 JavaScript 基本类型（如 string、number、boolean）时，Nest 会直接发送该值而不进行序列化。这使得响应处理变得简单：只需返回值，Nest 会处理其余部分。
    <br /><br />
    此外，默认情况下响应的状态码始终为 200，POST 请求除外（POST 请求使用 201 状态码）。我们可以通过在处理器级别添加 `@HttpCode(...)` 装饰器来轻松更改此行为（参见<a href="controllers#status-code">状态码</a>）。
    </td>
  </tr>
  <tr>
    <td>特定库实现</td>
    <td>我们可以使用特定库（如 Express）的<a href="https://expressjs.com/en/api.html#res">响应对象</a>，通过在方法处理程序签名中使用 `@Res()` 装饰器注入（例如 `findAll(@Res() response)`）。采用这种方式，您能够使用该对象暴露的原生响应处理方法。例如，在 Express 中，您可以使用类似 `response.status(200).send()` 的代码构建响应。</td>
  </tr>
</table>

> warning **警告** 当 Nest 检测到处理程序使用了 `@Res()` 或 `@Next()` 时，表明您选择了特定库实现方式。如果同时使用两种方式，标准方式将针对该路由**自动禁用**且不再按预期工作。若要同时使用两种方式（例如通过注入响应对象仅设置 cookies/headers 但仍将剩余工作交给框架处理），必须在 `@Res({ passthrough: true })` 装饰器中将 `passthrough` 选项设为 `true`。
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
```

> info **提示** 要充分利用 `express` 的类型定义（如上面 `request: Request` 参数示例所示），请确保安装 `@types/express` 包。

请求对象代表 HTTP 请求，包含查询字符串、参数、HTTP 标头和正文等属性（更多信息请参阅[此处](https://expressjs.com/en/api.html#req) ）。在大多数情况下，您不需要手动访问这些属性。相反，可以直接使用开箱即用的专用装饰器，如 `@Body()` 或 `@Query()`。以下是提供的装饰器及其对应平台特定对象的列表。

<table>
  <tr>
    <td><code>@Request(), @Req()</code></td>
    <td><code>req</code></td>
  </tr>
  <tr>
    <td><code>@Response(), @Res()*</code></td>
    <td><code>res</code></td>
  </tr>
  <tr>
    <td><code>@Next()</code></td>
    <td><code>next</code></td>
  </tr>
  <tr>
    <td><code>@Session()</code></td>
    <td><code>req.session</code></td>
  </tr>
  <tr>
    <td><code>@Param(key?: string)</code></td>
    <td><code>req.params</code> / <code>req.params[key]</code></td>
  </tr>
  <tr>
    <td><code>@Body(key?: string)</code></td>
    <td><code>req.body</code> / <code>req.body[key]</code></td>
  </tr>
  <tr>
    <td><code>@Query(key?: string)</code></td>
    <td><code>req.query</code> / <code>req.query[key]</code></td>
  </tr>
  <tr>
    <td><code>@Headers(name?: string)</code></td>
    <td><code>req.headers</code> / <code>req.headers[name]</code></td>
  </tr>
  <tr>
    <td><code>@Ip()</code></td>
    <td><code>req.ip</code></td>
  </tr>
  <tr>
    <td><code>@HostParam()</code></td>
    <td><code>req.hosts</code></td>
  </tr>
</table>

\* 为兼容底层 HTTP 平台（如 Express 和 Fastify）的类型定义，Nest 提供了 `@Res()` 和 `@Response()` 装饰器。`@Res()` 是 `@Response()` 的别名。两者都直接暴露底层原生平台的 `response` 对象接口。使用时还需导入相应底层库的类型定义（如 `@types/express`）以获得完整支持。注意：在方法处理程序中注入 `@Res()` 或 `@Response()` 时，该处理程序将进入**库特定模式** ，此时需手动管理响应。必须通过调用 `response` 对象方法（如 `res.json(...)` 或 `res.send(...)`）返回响应，否则 HTTP 服务器会挂起。

> info **提示** 要了解如何创建自定义装饰器，请参阅[本章节](/custom-decorators) 。

#### 资源

此前，我们定义了一个用于获取猫咪资源的端点（**GET** 路由）。通常我们还需要提供创建新记录的端点。为此，让我们创建 **POST** 处理器：

```typescript
@@filename(cats.controller)
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(): string {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

就是这么简单。Nest 为所有标准 HTTP 方法提供了装饰器：`@Get()`、`@Post()`、`@Put()`、`@Delete()`、`@Patch()`、`@Options()` 以及 `@Head()`。此外，`@All()` 可定义处理所有这些方法的端点。

#### 路由通配符

NestJS 也支持基于模式的路由。例如，星号（`*`）可作为通配符，匹配路径末尾任意字符组合。在以下示例中，`findAll()` 方法将对任何以 `abcd/` 开头的路由执行，无论后面跟随多少字符。

```typescript
@Get('abcd/*')
findAll() {
  return 'This route uses a wildcard';
}
```

路由路径 `'abcd/*'` 将匹配 `abcd/`、`abcd/123`、`abcd/abc` 等路径。在基于字符串的路径中，连字符（`-`）和点号（`.`）会按字面意义解析。

这种方式在 Express 和 Fastify 上都适用。不过随着 Express 最新版本(v5)的发布，路由系统变得更加严格。在纯 Express 中，必须使用命名通配符才能使路由生效——例如 `abcd/*splat`，其中 `splat` 只是通配参数的名称，没有特殊含义。您可以随意命名。也就是说，由于 Nest 为 Express 提供了兼容层，您仍然可以使用星号（`*`）作为通配符。

当星号用于**路由中间**时，Express 要求使用命名通配符（例如 `ab{{ '{' }}*splat&#125;cd`），而 Fastify 则完全不支持这种用法。

#### 状态码

如前所述，响应的默认**状态码**通常为 **200**，但 POST 请求除外，其默认状态码为 **201**。通过在处理器级别使用 `@HttpCode(...)` 装饰器，您可以轻松更改此行为。

```typescript
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

> info **提示** 从 `@nestjs/common` 包中导入 `HttpCode`。

通常，您的状态码并非静态，而是取决于多种因素。在这种情况下，您可以使用库特定的**响应**对象（通过 `@Res()` 注入），或者在出错时抛出异常。

#### 响应头

要指定自定义响应头，您可以使用 `@Header()` 装饰器或特定库的响应对象（直接调用 `res.header()`）。

```typescript
@Post()
@Header('Cache-Control', 'no-store')
create() {
  return 'This action adds a new cat';
}
```

> info **提示** 从 `@nestjs/common` 包中导入 `Header`。

#### 重定向

要将响应重定向到特定 URL，您可以使用 `@Redirect()` 装饰器或特定库的响应对象（直接调用 `res.redirect()`）。

`@Redirect()` 接收两个可选参数：`url` 和 `statusCode`。若省略 `statusCode`，其默认值为 `302`（`Found`）。

```typescript
@Get()
@Redirect('https://nestjs.com', 301)
```

> info **提示** 有时您可能需要动态决定 HTTP 状态码或重定向 URL。可通过返回遵循 `HttpRedirectResponse` 接口（来自 `@nestjs/common`）的对象来实现。

返回值将覆盖传递给 `@Redirect()` 装饰器的任何参数。例如：

```typescript
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' };
  }
}
```

#### 路由参数

当需要接收**动态数据**作为请求的一部分时（例如通过 `GET /cats/1` 获取 ID 为 `1` 的猫），静态路径路由将无法工作。要定义带参数的路由，您可以在路由路径中添加路由参数**标记**来捕获 URL 中的动态值。下面 `@Get()` 装饰器示例中的路由参数标记展示了这种方法。然后可以使用 `@Param()` 装饰器来访问这些路由参数，该装饰器应添加到方法签名中。

> info **注意** 带参数的路由应在所有静态路径之后声明。这样可以防止参数化路径拦截本该由静态路径处理的流量。

```typescript
@@filename()
@Get(':id')
findOne(@Param() params: any): string {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
```

`@Param()` 装饰器用于修饰方法参数（如上例中的 `params`），使得**路由**参数可以在方法内部通过该装饰参数的属性进行访问。如代码所示，你可以通过 `params.id` 来访问 `id` 参数。或者，你也可以向装饰器传递特定的参数标记，直接在方法体中按名称引用路由参数。

> info **提示** 从 `@nestjs/common` 包中导入 `Param`。

```typescript
@@filename()
@Get(':id')
findOne(@Param('id') id: string): string {
  return `This action returns a #${id} cat`;
}
```

#### 子域名路由

`@Controller` 装饰器可以接受 `host` 选项，用于要求传入请求的 HTTP 主机头必须匹配特定值。

```typescript
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin page';
  }
}
```

> warning **警告** 由于 **Fastify** 不支持嵌套路由器，如果您正在使用子域名路由，建议改用默认的 Express 适配器。

与路由 `path` 类似，`host` 选项可以使用令牌来捕获主机名中该位置的动态值。下面 `@Controller()` 装饰器示例中的主机参数令牌演示了这种用法。通过这种方式声明的主机参数可以使用 `@HostParam()` 装饰器访问，该装饰器应添加到方法签名中。

```typescript
@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return account;
  }
}
```

#### 状态共享

对于来自其他编程语言的开发者来说，可能会惊讶地发现，在 Nest 中几乎所有内容都在传入请求之间共享。这包括数据库连接池、具有全局状态的单例服务等资源。需要理解的是，Node.js 不使用请求/响应的多线程无状态模型（即每个请求由单独的线程处理）。因此，在我们的应用程序中使用单例实例是完全 **安全** 的。

话虽如此，在某些特定边缘场景中，控制器可能需要基于请求的生命周期。例如 GraphQL 应用中的请求级缓存、请求追踪或多租户实现。您可在此处详细了解如何控制注入作用域 [here](/fundamentals/injection-scopes)。

#### 异步特性

我们热爱现代 JavaScript，尤其推崇其**异步**数据处理机制。因此 Nest 全面支持 `async` 函数，每个 `async` 函数都必须返回 `Promise`，这使得您可以返回一个延迟值由 Nest 自动解析。示例如下：

```typescript
@@filename(cats.controller)
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```

这段代码完全有效。但 Nest 更进一步，允许路由处理器返回 RxJS 的[可观察流](https://rxjs-dev.firebaseapp.com/guide/observable) ，Nest 会在内部处理订阅并在流完成时解析最终发出的值。

```typescript
@@filename(cats.controller)
@Get()
findAll(): Observable<any[]> {
  return of([]);
}
```

两种方法都有效，您可以根据需求选择最适合的方式。

#### 请求负载

在前面的示例中，POST 路由处理程序没有接收任何客户端参数。现在让我们通过添加 `@Body()` 装饰器来解决这个问题。

在继续之前（如果您使用 TypeScript），我们需要先定义 **DTO**（数据传输对象）模式。DTO 是一个规定了网络数据传输格式的对象。我们可以使用 **TypeScript** 接口或简单类来定义 DTO 模式，但这里我们推荐使用**类** 。为什么？因为类是 JavaScript ES6 标准的一部分，编译成 JavaScript 后仍会保留为实际实体。而 TypeScript 接口在转译过程中会被移除，这意味着 Nest 在运行时无法引用它们。这一点很重要，因为像**管道**这样的功能需要能在运行时访问变量的元类型，而这只有使用类才能实现。

我们来创建 `CreateCatDto` 类：

```typescript
@@filename(create-cat.dto)
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}
```

它仅包含三个基本属性。之后我们就可以在 `CatsController` 中使用新创建的 DTO：

```typescript
@@filename(cats.controller)
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

> info **提示** 我们的 `ValidationPipe` 可以过滤掉不应被方法处理器接收的属性。在这种情况下，我们可以将可接受的属性加入白名单，任何未包含在白名单中的属性都会自动从结果对象中剔除。在 `CreateCatDto` 示例中，我们的白名单包含 `name`、`age` 和 `breed` 属性。了解更多 [请点击这里](https://docs.nestjs.com/techniques/validation#stripping-properties) 。

#### 查询参数

在处理路由中的查询参数时，可以使用 `@Query()` 装饰器从传入请求中提取它们。下面我们通过实例来看这个机制如何运作。

假设有个路由需要基于 `age` 和 `breed` 等查询参数筛选猫咪列表。首先在 `CatsController` 中定义查询参数：

```typescript
@@filename(cats.controller)
@Get()
async findAll(@Query('age') age: number, @Query('breed') breed: string) {
  return `This action returns all cats filtered by age: ${age} and breed: ${breed}`;
}
```

本示例使用 `@Query()` 装饰器从查询字符串提取 `age` 和 `breed` 的值。例如这样的请求：

```plaintext
GET /cats?age=2&breed=Persian
```

将使得 `age` 取值 `2`，`breed` 取值 `Persian`。

如果您的应用需要处理更复杂的查询参数，例如嵌套对象或数组：

```plaintext
?filter[where][name]=John&filter[where][age]=30
?item[]=1&item[]=2
```

您需要配置 HTTP 适配器（Express 或 Fastify）以使用适当的查询解析器。在 Express 中，可以使用 `extended` 解析器，它支持丰富的查询对象：

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
app.set('query parser', 'extended');
```

在 Fastify 中，可以使用 `querystringParser` 选项：

```typescript
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter({
    querystringParser: (str) => qs.parse(str),
  })
);
```

> info **提示**`qs` 是一个支持嵌套和数组的查询字符串解析器。您可以通过 `npm install qs` 命令安装它。

#### 错误处理

关于错误处理（即异常处理）的详细内容请参阅[此处](/exception-filters)的独立章节。

#### 完整资源示例

以下示例展示了如何使用多个可用装饰器来创建基础控制器。该控制器提供了一些方法来访问和操作内部数据。

```typescript
@@filename(cats.controller)
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { CreateCatDto, UpdateCatDto, ListAllEntities } from './dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query: ListAllEntities) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
```

> info **Nest CLI** 提供了一个生成器（schematic），可自动创建**所有样板代码** ，省去手动操作并提升开发体验。详细了解此功能请点击[此处](/recipes/crud-generator) 。

#### 快速开始

即使已完整定义 `CatsController`，Nest 仍无法识别它，也不会自动创建该类的实例。

控制器必须始终属于某个模块，这就是为什么我们要在 `@Module()` 装饰器的 `controllers` 数组中包含它们。由于目前除了根模块 `AppModule` 外尚未定义其他模块，我们将用它来注册 `CatsController`：

```typescript
@@filename(app.module)
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class AppModule {}
```

我们使用 `@Module()` 装饰器将元数据附加到模块类上，现在 Nest 可以轻松确定需要挂载哪些控制器。

#### 库特定方法

到目前为止，我们已经介绍了 Nest 操作响应的标准方式。另一种方法是使用库特定的[响应对象](https://expressjs.com/en/api.html#res) 。要注入特定的响应对象，我们可以使用 `@Res()` 装饰器。为了突出差异，让我们像这样重写 `CatsController`：

```typescript
@@filename()
import { Controller, Get, Post, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res: Response) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  findAll(@Res() res: Response) {
     res.status(HttpStatus.OK).json([]);
  }
}
```

虽然这种方法有效，并且通过完全控制响应对象（如头部操作和访问库特定功能）提供了更大的灵活性，但应谨慎使用。通常，这种方法不够清晰且存在一些缺点。主要缺点是代码会变得与平台相关，因为不同的底层库可能具有不同的响应对象 API。此外，它还会使测试更具挑战性，因为您需要模拟响应对象等。

此外，采用这种方法会导致失去与依赖标准响应处理的 Nest 功能的兼容性，例如拦截器和 `@HttpCode()`/`@Header()` 装饰器。为解决这个问题，你可以像这样启用 `passthrough` 选项：

```typescript
@@filename()
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.status(HttpStatus.OK);
  return [];
}
```

通过这种方式，你既可以操作原生响应对象（例如根据特定条件设置 cookie 或 headers），同时仍允许框架处理其余部分。
