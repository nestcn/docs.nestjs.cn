# 控制器

控制器层负责处理传入的请求, 并返回对客户端的响应。

<center>![图1](https://docs.nestjs.com/assets/Controllers_1.png)</center>

为了创建一个基本的控制器，我们必须使用`装饰器`。多亏了他们，Nest 知道如何将控制器映射到相应的路由。


> cats.controller.ts

```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    return [];
  }
}
```


# 装饰器

 在上面的例子中，我们使用了定义基本控制器所需的 `@Controller('cats')` 装饰器 。 这个装饰器是强制性的。 `cats` 是每个在类中注册的每个路由的可选前缀。使用前缀可以避免在所有路由共享通用前缀时出现冲突的情况， `findAll()` 方法附近的 `@Get()` 修饰符告诉 Nest 创建此路由路径的端点，并将每个相应的请求映射到此处理程序。由于我们为每个路由（`cats`）声明了前缀，所以 Nest 会在这里映射每个 `/cats` 的 GET 请求。

当客户端调用此端点时, Nest 将返回 200 状态码和解析的 JSON, 因此在本例中-它只是一个空数组。这怎么可能？

 有`两种`可能的方法来处理响应：

|         |    |
| -------------   | :----: |
| 标准（推荐）|   我们对处理程序的处理方式与普通函数相同。当我们返回 JavaScript 对象或数组时, 它会自动转换为 JSON。当我们返回字符串, Nest 将只发送一个字符串而不尝试解析它。|
| |此外, 响应状态代码在默认情况下总是 200, 除了 POST 请求外，此时它是 201。我们可以通过在处理程序层添加 `@HttpCode（...)` 装饰器来轻松地更改此行为。|
| 库专用 |   我们可以使用库特定的响应对象，，例如findAll（@Res（）response）。    |

我们可以使用 「express」 响应对象, 我们可以在函数签名中使用 `@Res()` 装饰器注入, 例如 `findAll (@Res() response)` 。

!> 注意！ 禁止同时使用这两种方法。 Nest 检测处理程序是否正在使用 `@Res（）`或 `@Next（）`，如果是这样,此单个路由的「标准」方式将被禁用。

# Request 对象

许多端点需要访问客户端的请求细节。 实际上，Nest 正使用 特定的库 请求对象。 我们可以强制 Nest 使用 `@Req（）` 装饰器将请求对象注入处理程序。


`cats.controller.ts`

```typescript
import { Controller, Get, Req } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request) {
    return [];
  }
}
```

「Request」对象表示 HTTP 请求，并具有「Request」查询字符串，参数，HTTP 标头 和 正文的属性（在[这里](http://www.expressjs.com.cn/4x/api.html#req)阅读更多），但在大多数情况下, 不必手动获取它们。 我们可以使用专用的装饰器，比如 `@Body()`或 可以直接使用的装饰器 `@Query()` 。 下面是装饰器和 普通表达对象的比较。


|||
|----------|-----------|
|@Request()	|req|
|@Response()	|res|
|@Next()	|next|
|@Session()	|req.session|
|@Param(param?: string)	|req.params / req.params[param]         |
|@Body(param?: string)	|req.body / req.body[param]|
|@Query(param?: string)	|req.query / req.query[param]|
|@Headers(param?: string)	|req.headers / req.headers[param]|



# 更多端点

我们已经创建了一个端点来获取数据（GET 路由）。 提供创建新记录的方式也是很好的。让我们创建 POST 处理程序:

> cats.controller.ts

```typescript
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create() {}

  @Get()
  findAll() {
    return [];
  }
}
```
这很容易。 Nest 以同样的方式提供了其他的端点装饰器 - `@Put()`，`@Delete()`，`@Patch()`，`@Options()`，`@Head()` 和 `@All()`。

# 状态码操作

> 如前面所说，默认情况下，响应的状态码总是200，除了 POST 请求外，此时它是201，我们可以通过在处理程序层添加`@HttpCode（...）` 装饰器来轻松更改此行为。

`cats.controller.ts`

```typescript
import { Controller, Get, Post, HttpCode } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @HttpCode(204)
  @Post()
  create() {}

  @Get()
  findAll() {
    return [];
  }
}
```


# 路由参数

当需要将动态数据作为 URL 的一部分接受时, 使用静态路径的路由无法提供帮助。要使用路由参数定义路由，只需在路由的路径中指定路由参数，如下所示。

```typescript
@Get(':id')
findOne(@Param() params) {
  console.log(params.id);
  return {};
}
```

# Async / await

我们喜欢现代 JavaScript，而且我们知道数据读取大多是异步的。 这就是为什么 Nest 支持异步函数，并且与他们一起工作得非常好。

!> 了解更多关于 `Async / await` 请点击[这里](https://kamilmysliwiec.com/typescript-2-1-introduction-async-await)！

每个异步函数都必须返回 Promise。这意味着您可以返回延迟值, 而 Nest 将自行解析它。让我们看看下面的例子:


> cats.controller.ts

```typescript
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```


这是完全有效的。


此外, Nest 路由处理程序更强大。它可以返回一个 Rxjs observable 的流,使得在简单的 web 应用程序和 微服务 之间的迁移更加容易。

> cats.controller.ts

```typescript
@Get()
findAll(): Observable<any[]> {
  return of([]);
}
```

 没有推荐的方法。 你可以使用任何你想要的。

# POST 处理程序

奇怪的是, 这个 POST 路由处理程序不接受任何客户端参数。我们至少应该在 `@Body()` 这里添加参数来解决这个问题。

首先, 我们需要确定 DTO (数据传输对象) 架构。DTO 是一个定义如何通过网络发送数据的对象。我们可以使用 TypeScript 接口或简单的类来完成。令人惊讶的是，我们建议在这里使用类。为什么？这些类是 JavaScript ES6 标准的一部分, 所以它们只是简单的函数。另一方面, TypeScript 接口在编译过程中被删除, Nest 不能引用它们。这一点很重要, 因为管道等特性能够在访问变量的元类型时提供更多的可能性。

我们来创建 `CreateCatDto`：

> create-cat.dto.ts

```typescript
export class CreateCatDto {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```
 它只有三个基本属性。 所有这些都被标记为只读，因为我们应该尽可能使我们的功能尽可能不被污染。

 现在我们可以使用 `CatsController` 中的模式：

> cats.controller.ts

```typescript
@Post()
async create(@Body() createCatDto: CreateCatDto) {}
```


# 处理 errors

这里有一个关于处理异常的独立[章节](5.0/exceptionfilters.md)。

# 最后一步

控制器已经准备就绪，可以使用，但是 Nest 不知道 CatsController 是否存在，所以它不会创建这个类的一个实例。 我们需要告诉它。

控制器总是属于模块，这就是为什么我们 controllers 在 `@Module()` 装饰器中保存数组。 由于除了根 ApplicationModule，我们没有其他模块，现在就让我们使用它：

> app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class ApplicationModule {}
```

!> 我们将元数据附加到 module 类，所以现在 Nest 可以很容易地反映出哪些控制器必须被安装。


# 特定库 方式

到目前为止，我们已经讨论了 Nest 操作响应的标准方式。操作响应的第二种方法是使用特定于库的响应对象。为了注入响应对象，我们需要使用 `@Res()` 装饰器。为了对比差异，我们重写 CatsController：


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

从我的角度来看，这种方式是非常不清晰。 我当然更喜欢第一种方法，但为了使 Nest 向下兼容以前的版本，这种方法仍然可用。 而且，响应对象提供了更大的灵活性 - 您可以完全控制响应。
