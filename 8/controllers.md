# 控制器

控制器负责处理传入的**请求**和向客户端返回**响应**。

![img](https://docs.nestjs.com/assets/Controllers_1.png '控制器')

控制器的目的是接收应用的特定请求。**路由**机制控制哪个控制器接收哪些请求。通常，每个控制器有多个路由，不同的路由可以执行不同的操作。

为了创建一个基本的控制器，我们使用类和`装饰器`。装饰器将类与所需的元数据相关联，并使 Nest 能够创建路由映射（将请求绑定到相应的控制器）。

## 路由

在下面的例子中，我们使用 `@Controller()` 装饰器定义一个基本的控制器。可选 路由路径前缀设置为 `cats`。在 `@Controller()` 装饰器中使用路径前缀可以使我们轻松地对一组相关的路由进行分组，并最大程度地减少重复代码。例如，我们可以选择将一组用于管理与 `/customers` 下的客户实体进行互动的路由进行分组。这样，我们可以在 `@Controller()` 装饰器中指定路径前缀 `customers`，这样就不必为文件中的每个路由重复路径的那部分。

```typescript
/* cats.controller.ts */

import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

?> 要使用 CLI 创建控制器，只需执行 `$ nest g controller cats` 命令。

`findAll()` 方法之前的 `@Get()` HTTP 请求方法装饰器告诉 Nest 为 HTTP 请求的特定端点创建处理程序。端点对应于 `HTTP` 请求方法（在本例中为 GET ）和路由路径（如 `GET /customer` ）。什么是路由路径 ？ 一个处理程序的路由路径是通过连接为控制器 （Controller） 声明的（可选）前缀和请求装饰器中指定的任何路径来确定的。由于我们已经为每个 `route（cats`） 声明了一个前缀，并且没有在装饰器中添加任何路由信息，因此 Nest 会将 `GET /cats` 请求映射到此处理程序。如上所述，该路径包括可选的控制由路径前缀和请求方法装饰器中声明的任何路径字符串。例如，路径前缀 `customers` 与装饰器 `@Get('profile')` 组合会为 `GET /customers/profile` 请求生成路由映射。

在上面的示例中，当对此端点发出 `GET` 请求时， Nest 会将请求路由到我们的自定义的 `findAll()` 方法。请注意，我们在此处选择的函数名称完全是任意的。显然，我们必须声明一个绑定到路由的函数，但 Nest 不会对所选的函数名称附加任何意义。（译者注：即路由与处理函数命名无关）

此函数将返回 `200` 状态代码和相关的响应，在本例中只返回了一个字符串。为什么会这样？ 为了解释原因，首先我们将介绍 Nest 使用两种不同的操作响应选项的概念：

|              |                                                                                                                                                                                                                                                                        |
| :----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 标准（推荐） | 使用这个内置方法，当请求处理程序返回一个 `JavaScript` 对象或数组时，它将自动序列化为 `JSON`。但是，当它返回一个 `JavaScript` 基本类型（例如`string、number、boolean`）时， Nest 将只发送值，而不尝试序列化它。这使响应处理变得简单：只需要返回值，其余的由 Nest 负责。 |
|  类库特有的  | 我们可以在函数签名处通过 `@Res()` 注入类库特定的响应对象（例如， `Express`）。使用此方法，你就能使用由该响应对象暴露的原生响应处理函数。例如，使用 `Express`，您可以使用 `response.status(200).send()` 构建响应                                                        |

!> 注意！Nest 检测处理程序何时使用 `@Res()` 或 `@Next()`，表明你选择了特定于库的选项。如果在一个处理函数上同时使用了这两个方法，那么此处的标准方式就是自动禁用此路由, 你将不会得到你想要的结果。如果需要在某个处理函数上同时使用这两种方法（例如，通过注入响应对象，单独设置 cookie / header，但把其余部分留给框架），你必须在装饰器 `@Res({ passthrough: true })` 中将 `passthrough` 选项设为 `true`

## Request

处理程序有时需要访问客户端的**请求**细节。Nest 提供了对底层平台（默认为 `Express`）的[**请求对象**](http://expressjs.com/en/api.html#req)（`request`）的访问方式。我们可以在处理函数的签名中使用 `@Req()` 装饰器，指示 Nest 将请求对象注入处理程序。

```typescript
/* cats.controller.ts */

import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
```

?> 为了在 `express` 中使用 `Typescript` （如 `request: Request` 上面的参数示例所示），请安装 `@types/express` 。

`Request` 对象代表 `HTTP` 请求，并具有查询字符串，请求参数参数，HTTP 标头（HTTP header） 和 正文（HTTP body）的属性（在[这里](https://expressjs.com/en/api.html#req)阅读更多）。在多数情况下，不必手动获取它们。 我们可以使用专用的装饰器，比如开箱即用的 `@Body()` 或 `@Query()` 。 下面是 Nest 提供的装饰器及其代表的底层平台特定对象的对照列表。

|                           |                                   |
| ------------------------- | --------------------------------- |
| `@Request()，@Req()`      | `req`                             |
| `@Response()，@Res()*`    | `res`                             |
| `@Next()`                 | `next`                            |
| `@Session()`              | `req.session`                     |
| `@Param(key?: string)`    | `req.params`/`req.params[key]`    |
| `@Body(key?: string)`     | `req.body`/`req.body[key]`        |
| `@Query(key?: string)`    | `req.query`/`req.query[key]`      |
| `@Headers(name?: string)` | `req.headers`/`req.headers[name]` |
| `@Ip()`                   | `req.ip`                          |
| `@HostParam()`            | `req.hosts`                       |

为了与底层 HTTP 平台（例如，`Express` 和 `Fastify`）之间的类型兼容， Nest 提供了 `@Res()`和 `@Response()` 装饰器。`@Res()` 只是 `@Response()` 的别名。两者都直接暴露了底层平台的 `response` 对象接口。在使用它们时，您还应该导入底层库的类型声明（如：`@types/express`）以充分利用它们。需要注意的是，在请求处理函数中注入 `@Res()`或 `@Response()` 时，会将 Nest 置于该处理函数的**特定于库**（Library-specific mode）的模式下，并负责管理响应。这样做时，必须通过调用 `response` 对象（例如，`res.json(…)` 或 `res.send(…)`）发出某种响应，否则 HTTP 服务器将挂起。

?> 想要了解如何创建自定义的装饰器，阅读[这一章](/8/customdecorators)。

## 资源

我们已经创建了一个端点来获取 cats 的数据（**GET** 路由）。我们通常还希望提供一个创建新记录的端点。为此，让我们创建 **POST** 处理程序:

```typescript
/* cats.controller.ts */

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

就这么简单。 Nest 为所有标准的 HTTP 方法提供了相应的装饰器：`@Put()`、`@Delete()`、`@Patch()`、`@Options()`、以及 `@Head()`。此外，`@All()` 则用于定义一个用于处理所有 HTTP 请求方法的处理程序。

## 路由通配符

路由同样支持模式匹配。例如，星号被用作通配符，将匹配任何字符组合。

```typescript
@Get('ab*cd')
findAll() {
  return 'This route uses a wildcard';
}
```

路由路径 `'ab*cd'` 将匹配 `abcd` 、`ab_cd` 、`abecd` 等。字符 `?` 、`+` 、 `*` 以及 `()` 是它们的正则表达式对应项的子集。连字符（`-`） 和点（`.`）按字符串路径逐字解析。

## 状态码

如上所述，默认情况下，响应的**状态码**总是默认为 **200**，除了 POST 请求（默认响应状态码为 **201**），我们可以通过在处理函数外添加 `@HttpCode（...）` 装饰器来轻松更改此行为。

```typescript
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

?> `HttpCode` 需要从 `@nestjs/common` 包导入。

通常，状态码不是固定的，而是取决于各种因素。在这种情况下，您可以使用类库特有（library-specific）的 **`response`** （通过` @Res()`注入 ）对象（或者在出现错误时，抛出异常）。

## Headers

要指定自定义响应头，可以使用 `@header()` 装饰器或类库特有的响应对象，（并直接调用 `res.header()`）。

```typescript
@Post()
@Header('Cache-Control', 'none')
create() {
  return 'This action adds a new cat';
}
```

?> `Header` 需要从 `@nestjs/common` 包导入。

## 重定向

要将响应重定向到特定的 `URL`，可以使用 `@Redirect()` 装饰器或特定于库的响应对象（并直接调用 `res.redirect()`）。

`@Redirect()` 装饰器有两个可选参数，`url` 和 `statusCode`。 如果省略，则 `statusCode` 默认为 `302`。

```typescript
@Get()
@Redirect('https://nestjs.com', 301)
```

有时您可能想动态地决定 HTTP 状态代码或重定向 URL。通过从路由处理方法返回一个如下格式的对象：

```json
{
  "url": string,
  "statusCode": number
}
```

返回的值将覆盖传递给 `@Redirect()`装饰器的所有参数。 例如：

```typescript
@Get('docs')
@Redirect('https://docs.nestjs.com', 302)
getDocs(@Query('version') version) {
  if (version && version === '5') {
    return { url: 'https://docs.nestjs.com/v5/' };
  }
}
```

## 路由参数

当您需要接受**动态数据**（dynamic data）作为请求的一部分时（例如，使用`GET /cats/1` 来获取 id 为 `1` 的 `cat`），带有静态路径的路由将无法工作。为了定义带参数的路由，我们可以在路由路径中添加路由参数**标记**（token）以捕获请求 URL 中该位置的动态值。下面的 `@Get()` 装饰器示例中的路由参数标记（route parameter token）演示了此用法。以这种方式声明的路由参数可以使用 `@Param()` 装饰器访问，该装饰器应添加到函数签名中。

```typescript
@Get(':id')
findOne(@Param() params): string {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
```

`@Param()` 用于修饰一个方法的参数（上面示例中的 `params`），并在该方法内将**路由参数**作为被修饰的方法参数的属性。如上面的代码所示，我们可以通过引用 `params.id`来访问（路由路径中的） `id` 参数。 您还可以将特定的参数标记传递给装饰器，然后在方法主体中按参数名称直接引用路由参数。

?> `Param` 需要从 `@nestjs/common` 包导入。

```typescript
@Get(':id')
findOne(@Param('id') id): string {
  return `This action returns a #${id} cat`;
}
```

## 子域路由

`@Controller` 装饰器可以接受一个 `host` 选项，以要求传入请求的 `HTTP` 主机匹配某个特定值。

```typescript
@Controller({ host: 'admin.example.com' })
export class AdminController {
  @Get()
  index(): string {
    return 'Admin page';
  }
}
```

!> 由于 **Fastify** 缺乏对嵌套路由器的支持，因此当使用子域路由时，应该改用（默认） **Express** 适配器（Express adapter）。

与一个路由路径 `path` 类似，该 `hosts` 选项可以使用参数标识（token）来捕获主机名中该位置的动态值。下面的 `@Controller()` 装饰器示例中的主机参数标识（host parameter token）演示了此用法。可以使用 `@HostParam()` 装饰器访问以这种方式声明的主机参数，该装饰器应添加到方法签名中。

```typescript
@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return account;
  }

```

## 作用域

对于来自不同编程语言背景的人来说，可能对 Nest 中几乎所有内容都可以在传入的请求之间共享感到非常意外。例如，我们有一个数据库连接池，具有全局状态的单例服务等。请记住，`Node.js` 并不遵循请求/响应多线程无状态模型（在该模型中，每个请求都由单独的线程处理），在 Nest 中，每个请求都由主线程处理。因此，使用单例实例对我们的应用程序来说是完全安全的。

但是，存在基于请求的控制器生命周期可能是期望行为的边缘情况，例如 `GraphQL` 应用程序中的请求缓存，请求跟踪或多租户。在[这里](/8/fundamentals?id=注入作用域 ':disabled')学习如何控制作用域。

## 异步性

我们酷爱现代 Javascript，并且我们知道数据读取（data extraction）大多是**异步**的.这就是为什么 Nest 完美支持**异步函数**（Async Function）特性的原因。

?> 了解更多关于 `Async / await` 请点击[这里](https://kamilmysliwiec.com/typescript-2-1-introduction-async-await)

每个异步函数都必须返回一个 `Promise`。这意味着您可以返回延迟值，而 Nest 将自行解析它。让我们看看下面这个例子:

```typescript
/* cats.controller.ts */

@Get()
async findAll(): Promise<any[]> {
  return [];
}
```

这是完全有效的。此外，通过返回 RxJS [observable 流](http://reactivex.io/rxjs/class/es8/Observable.js~Observable.html)，Nest 路由处理程序将更加强大。 Nest 将自动订阅下面的源并获取最后发出的值（在流完成后）。

```typescript
/* cats.controller.ts */

@Get()
findAll(): Observable<any[]> {
  return of([]);
}
```

上述的两种方法都是可行的，你可以选择你喜欢的方式。

## 请求负载

此前我们列举的的 `POST` 路由处理程序样例中，处理程序没有接受任何客户端参数。我们在这里通过添加 `@Body()` 参数来解决这个问题。

首先（如果您使用 TypeScript），我们需要确定 `DTO`（数据传输对象）模式。`DTO`是一个对象，它定义了如何通过网络发送数据。我们可以通过使用 **TypeScript** 接口（Interface）或简单的类（Class）来定义 DTO 模式。有趣的是，我们在这里推荐使用**类**。为什么？类是 JavaScript ES6 标准的一部分，因此它们在编译后的 JavaScript 中被保留为实际实体。另一方面，由于 TypeScript 接口在转换过程中被删除，所以 Nest 不能在运行时引用它们。这一点很重要，因为诸如**管道**（Pipe）之类的特性为在运行时访问变量的元类型提供更多的可能性。

现在，我们来创建 `CreateCatDto` 类：

```typescript
/*
  create-cat.dto.ts
*/
export class CreateCatDto {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

它只有三个基本属性。 之后，我们可以在 `CatsController` 中使用新创建的`DTO`：

```typescript
/* cats.controller.ts */

@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

## 处理错误

[这里](/8/exceptionfilters)有单独的一章关于处理错误（即处理异常）。

## 完整示例

下面是一个示例，该示例利用几个可用的装饰器来创建基本控制器。 该控制器暴露了几个访问和操作内部数据的方法。

```typescript
/* cats.controller.ts */

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

!> `Nest CLI` 提供了一个能够自动生成所有这些模板代码的生成器，它帮助我们规避手动建立这些文件，并使开发体验变得更加简单。在[这里](/8/recipes?id=crud生成器)阅读关于该功能的更多信息。

## 最后一步

控制器已经准备就绪，可以使用，但是 Nest 依然不知道 `CatsController` 是否存在，所以它不会创建这个类的一个实例。

控制器总是属于模块，这就是为什么我们在 `@Module()` 装饰器中包含 `controllers` 数组的原因。 由于除了根模块 `AppModule`之外，我们还没有定义其他模块，所以我们将使用它来介绍 `CatsController`：

```typescript
/* app.module.ts */

import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class AppModule {}
```

我们使用 `@Module()` 装饰器将元数据附加到模块类中，现在，Nest 可以轻松反射（reflect）出哪些控制器（controller）必须被安装。

## 类库特有方式

到目前为止，我们已经讨论了 Nest 操作响应的标准方式。操作响应的第二种方法是使用类库特有的[响应对象(Response)](http://expressjs.com/en/api.html#res)。为了注入特定的响应对象，我们需要使用 `@Res()` 装饰器。为了对比差异，让我们来重写 `CatsController`：

```typescript
/* cats.controller.ts */

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

尽管此方法有效，并且实际上通过提供对响应对象的完全控制（标头操作，特定于库的功能等）在某些方面提供了更大的灵活性，但应谨慎使用此种方法。通常来说，这种方式非常不清晰，并且有一些缺点。 主要的缺点是你的代码变得依赖于平台（因为不同的底层库在响应对象（Response）上可能具有不同的 API），并且更加难以测试（您必须模拟响应对象等）。

而且，在上面的示例中，你失去与依赖于 Nest 标准响应处理的 Nest 功能（例如，拦截器（Interceptors） 和 `@HttpCode()`/`@Header()` 装饰器）的兼容性。要解决此问题，可以将 `passthrough` 选项设置为 `true`，如下所示：

```typescript
@Get()
findAll(@Res({ passthrough: true }) res: Response) {
  res.status(HttpStatus.OK);
  return [];
}
```

现在，你就能与底层框架原生的响应对象（Response）进行交互（例如，根据特定条件设置 Cookie 或 HTTP 头），并将剩余的部分留给 Nest 处理。

### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
