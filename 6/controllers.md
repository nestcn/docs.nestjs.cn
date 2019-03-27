# 控制器

控制器层负责处理传入的**请求**, 并返回对客户端的**响应**。

<center>![图1](https://docs.nestjs.com/assets/Controllers_1.png)</center>

控制器的目的是接收应用的特定请求。**路由**机制控制哪个控制器接收哪些请求。通常，每个控制器有多个路由，不同的路由可以执行不同的操作。

为了创建一个基本的控制器，我们必须使用`装饰器`。装饰器将类与所需的元数据关联，并使Nest能够创建路由映射（将请求绑定到相应的控制器）。

## 路由

在下面的例子中，我们使用了定义基本控制器所需的 `@Controller('cats')` 装饰器。我们将可选前缀设置为 `cats`。使用前缀可以避免在所有路由共享通用前缀时出现冲突的情况。

> cats.controller.ts

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    return 'This action returns all cats';
  }
}
```

?> 要使用 CLI 创建控制器，只需执行 `$nest g controller cats` 命令。

`findAll()` 方法前的 `@Get()` 修饰符告诉 Nest 创建此路由路径的端点，并将每个相应的请求映射到此处理程序。由于我们为每个路由（`cats`）声明了前缀，所以 Nest 会在这里映射每个 `/cats` 的 **GET** 请求。

当客户端调用此端点时, Nest 将返回 200 状态码和解析的 JSON, 在本例中只是个字符串。这怎么可能？有`两种`可能的方法来处理响应：

|         |    |
| -------------   | :----: |
| 标准（推荐）|   我们对处理程序的处理方式与普通函数相同。当我们返回 JavaScript 对象或数组时, 它会**自动**转换为 JSON。当我们返回字符串, Nest 将只发送一个字符串而不尝试解析它。|
| |此外, 响应状态代码在默认情况下总是 200, 除了 POST 请求外，此时它是 201。我们可以通过在处理程序层添加 `@HttpCode（...)` 装饰器来轻松地更改此行为。|
| 类库特有的 |   我们可以在函数签名通过 `@Res()` 注入类库特定的[响应对象](http://expressjs.com/en/api.html#res)。（例如 `findAll(@Res() response)`）。    |

!> 注意！ 禁止同时使用这两种方法。 Nest 检测处理程序是否正在使用 `@Res()`或 `@Next()`，如果两个方法都用了的话, 那么在这里的标准方式就是自动禁用此路由, 你将不会得到你想要的结果。

## Request 对象

许多端点需要访问客户端的**请求**细节。实际上，Nest 正使用类库特有(默认是`express`)的[请求对象](http://expressjs.com/en/api.html#req)。因此，我们可以强制 Nest 使用 `@Req()` 装饰器将请求对象注入处理程序。

> cats.controller.ts

```typescript
import { Controller, Get, Req } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request) {
    return 'This action returns all cats';
  }
}
```

「Request」对象表示 HTTP 请求，并具有「Request」查询字符串，参数，HTTP 标头 和 正文的属性（在[这里](http://www.expressjs.com.cn/4x/api.html##req)阅读更多），但在大多数情况下, 不必手动获取它们。 我们可以使用**专用**的装饰器，比如开箱即用的 `@Body()` 或 `@Query()` 。 下面是装饰器和 普通表达对象的比较。


|||
|----------|-----------|
|`@Request()`	|`req`|
|`@Response()`	|`res`|
|`@Next()`	|`next`|
|`@Session()`	|`req.session`|
|`@Param(param?: string)`	|`req.params` / `req.params[param]`       |
|`@Body(param?: string)`	|`req.body` / `req.body[param]`|
|`@Query(param?: string)`	|`req.query` / `req.query[param]`|
|`@Headers(param?: string)`	|`req.headers` / `req.headers[param]`|

?> 想要了解如何创建自定义的装饰器，阅读[这一章](/5.0/customdecorators)。

## 资源

我们已经创建了一个端点来获取数据（**GET** 路由）。 提供创建新记录的方式也是很好的。让我们创建 **POST** 处理程序:

> cats.controller.ts

```typescript
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create() {
    return 'This action adds a new cat';
  }

  @Get()
  findAll() {
    return 'This action returns all cats';
  }
}
```

就这么简单。Nest以相同的方式提供其余的端点装饰器- `@Put()` 、 `@Delete()`、 `@Patch()`、 `@Options()`、 `@Head()`和 `@All()`。这些表示各自的HTTP请求方法

## 路由通配符

路由同样支持模式匹配。例如，星号被用作通配符，将匹配任何字符组合。

```typescript
@Get('ab*cd')
findAll() {
  return 'This route uses a wildcard';
}
```

以上路由地址将匹配 `abcd` 、 `ab_cd` 、 `abecd` 等。字符 `?` 、 `+` 、 `*` 以及 `()` 是它们的正则表达式对应项的子集。连字符 (`-`) 和点 (`.`) 按字符串路径解析。

## 状态码

如前面所说，默认情况下，响应的**状态码**总是**200**，除了 POST 请求外，此时它是**201**，我们可以通过在处理程序层添加`@HttpCode（...）` 装饰器来轻松更改此行为。

```typescript
@Post()
@HttpCode(204)
create() {
  return 'This action adds a new cat';
}
```

通常，状态码不是固定的，而是取决于各种因素。在这种情况下，您可以使用类库特有的的**响应**（通过` @Res()`注入 ）对象（或者，在出现错误时，抛出异常）。

## Headers

要指定自定义响应头，可以使用 `@header()` 修饰器或类库特有的响应对象

```typescript
@Post()
@Header('Cache-Control', 'none')
create() {
  return 'This action adds a new cat';
}
```

## 路由参数

当需要将**动态数据**作为 URL 的一部分接受时, 使用静态路径的路由无法提供帮助。要使用路由参数定义路由，只需在路由的路径中指定路由参数，如下所示。

```typescript
@Get(':id')
findOne(@Param() params) {
  console.log(params.id);
  return `This action returns a #${params.id} cat`;
}
```

为了获取特定的参数，只需在括号中传入其参数名。

```typescript
@Get(':id')
findOne(@Param('id') id) {
  return `This action returns a #${id} cat`;
}
```

## Async / await

我们喜欢现代 JavaScript，而且我们知道数据读取大多是**异步**的。 这就是为什么 Nest 支持 `async` 函数，并且与他们一起工作得非常好。

!> 了解更多关于 `Async / await` 请点击[这里](https://kamilmysliwiec.com/typescript-2-1-introduction-async-await)！

每个异步函数都必须返回 `Promise`。这意味着您可以返回延迟值, 而 Nest 将自行解析它。让我们看看下面的例子:


> cats.controller.ts

```typescript
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```


这是完全有效的。此外, Nest 路由处理程序更强大。它可以返回一个 [Rxjs observable 流](http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html)，Nest 将自动订阅下面的源并获取最后发出的值（在流完成后）。

> cats.controller.ts

```typescript
@Get()
findAll(): Observable<any[]> {
  return of([]);
}
```

 上面的方法都可以, 你可以选择你喜欢的方式。

## 请求负载

之前的 POST 路由处理程序不接受任何客户端参数。我们在这里添加 `@Body()` 参数来解决这个问题。

首先（如果你使用了 `TypeScript`）, 我们需要确定 DTO (数据传输对象) 架构。DTO 是一个定义如何通过网络发送数据的对象。我们可以使用 TypeScript 接口或简单的类来完成。令人惊讶的是，我们建议在这里使用类。为什么？这些类是 JavaScript ES6 标准的一部分, 所以它们只是简单的函数。另一方面, TypeScript 接口在编译过程中被删除, Nest 不能引用它们。这一点很重要, 因为**管道**等特性能够在访问变量的元类型时提供更多的可能性。

我们来创建 `CreateCatDto` 类：

> create-cat.dto.ts

```typescript
export class CreateCatDto {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

 它只有三个基本属性。 所有这些都被标记为 `只读`，因为我们应该尽可能的使我们的函数[纯净](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-a-pure-function-d1c076bec976)。

 现在我们可以使用 `CatsController` 中的模式：

> cats.controller.ts

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

## 完整示例

下面是一个使用一些可用的装饰器来创建基本控制器的示例。该控制器暴露了一些访问和操作内部数据的方法。

> cats.controller.ts

```typescript
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }

  @Get(':id')
  findOne(@Param('id') id) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id, @Body() updateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id) {
    return `This action removes a #${id} cat`;
  }
}
```

## 处理 errors

这里有一个关于处理异常的独立[章节](5.0/exceptionfilters.md)。

## 最后一步

控制器已经准备就绪，可以使用，但是 Nest 不知道 `CatsController` 是否存在，所以它不会创建这个类的一个实例。

控制器总是属于模块，这就是为什么我们将 `controllers ` 数组保存在 `@module()` 装饰器中。 由于除了根 `ApplicationModule`，我们没有其他模块，所以我们将使用它来介绍 `CatsController`：

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class ApplicationModule {}
```

!> 我们将元数据附加到 module 类，所以现在 Nest 可以很容易地通过反射挂载必须的控制器。


## 类库特有 方式

到目前为止，我们已经讨论了 Nest 操作响应的标准方式。操作响应的第二种方法是使用类库特有的[响应对象(Response)](http://expressjs.com/en/api.html#res)。为了注入响应对象，我们需要使用 `@Res()` 装饰器。为了对比差异，我们重写  `CatsController` ：


```typescript
import { Controller, Get, Post, Res, Body, HttpStatus } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res, @Body() createCatDto: CreateCatDto) {
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  findAll(@Res() res) {
     res.status(HttpStatus.OK).json([]);
  }
}
```

从我的角度来看，这种方式是非常不清晰。 我当然更喜欢第一种方法，但为了使 Nest **向下兼容**以前的版本，这种方法仍然可用。 另外，**响应对象**提供了更大的灵活性 - 我们可以完全控制 response 对象(比如操作 header 等等)。


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://github.com/zuohuadong)  | <img class="avatar-66 rm-style" src="https://wx3.sinaimg.cn/large/006fVPCvly1fmpnlt8sefj302d02s742.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@tangkai](https://github.com/tangkai123456)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/22436910">  |  翻译  | 专注于 React，[@tangkai](https://github.com/tangkai123456) |
| [@havef](https://havef.github.io)  | <img class="avatar-66 rm-style" height="70" src="https://avatars1.githubusercontent.com/u/54462?s=460&v=4">  |  校正  | 数据分析、机器学习、TS/JS技术栈 [@havef](https://havef.github.io) |
