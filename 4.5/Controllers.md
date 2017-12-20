# 控制器

> 控制器层负责处理传入的请求，并将响应返回给客户端。

<center>![图1](https://docs.nestjs.com/assets/Controllers_1.png)</center>

> 要创建一个基本的控制器，你必须将`元数据`附加到类。 感谢元数据Nest知道如何将您的控制器映射到适当的路由。 要附加元数据，我们正在使用`装饰器`（在这种情况下`@Controller('cats')`）。

## TypeScript

```
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    return [];
  }
}
```

## JavaScript

```
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll() {
    return [];
  }
}
```

# 元数据

> 我们在这里使用`@Controller('cats')`。 这个装饰者是强制性的。 `'cats'`是在班级中注册的每条路线的前缀。 前缀是可选的，这意味着你可以将括号清空（`@Controller（）`），但是它减少了多余的样板代码，因此每次你决定创建一个新的端点时，你不必重复自己）。

> 有一个公共方法`findAll（）`，它返回一个空数组。 `@Get（）`装饰器告诉 `Nest`，有必要为这个路径路径创建一个端点，并把每个适当的请求映射到这个处理器。 由于我们为每条路线（`cats`）声明了前缀，所以Nest会在这里映射每个`/cats`的 GET 请求。

> 当一个客户端调用这个端点时，Nest将返回200个状态码和解析的 JSON，所以在这种情况下 - 只是一个空的数组。 这怎么可能？

> 有`两种`可能的方法来处理响应：

|    方法     |  说明  |
| -------------   | :----: |
| 标准（推荐）|   我们以与普通函数相同的方式来对待处理程序。 当我们返回JavaScript对象或数组时，它会自动转换为JSON。 当我们返回字符串时，Nest会发送一个字符串。而且，响应状态代码默认为200，除了POST请求，当它是201时。我们可以通过在处理程序级别添加@HttpCode（...）装饰器来轻松地更改此行为。   |
| 明确 |   我们可以使用快速响应对象，我们可以在函数签名中使用@Res（）装饰器注入，例如findAll（@Res（）response）。    |

!> 注意！ 禁止同时使用两种方法。 Nest检测处理程序是否正在使用 `@Res（）`或 `@Next（）`，如果是这样,此单个路由的标准方式将被禁用。

# 请求对象

> 许多端点需要访问客户端请求细节。 实际上，Nest 正在使用快速请求对象。 我们可以强制 Nest 使用 @Req（）装饰器将请求对象注入处理程序。

!> 提示有一个@ types / express包，我们强烈建议使用它（请求有它自己的类型）。

## TypeScript & JavaScript

`cats.controller.ts`
```
import { Controller, Get, Req } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request) {
    return [];
  }
}
```

`cats.controller.js`
```
import { Controller, Bind, Get, Req } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  @Bind(Req())
  findAll(request) {
    return [];
  }
}
```

> 请求对象代表HTTP请求，并具有请求查询字符串，参数，HTTP标题和 （在这里阅读更多），但在大多数情况下，没有必要手动抓住它们。 我们可以使用专用的装饰器，比如@Body（）或@Query（），它们都是可用的。 下面是装饰者和普通表达对象的比较。

```
```

# 更多端点

> 我们已经创建了一个端点来获取数据（GET路线）。 提供创建新记录的方式也是很好的。 我们来创建POST处理程序：

## TypeScript & JavaScript

`cats.controller.ts`
```
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create() {
    // TODO: Add some logic here
  }

  @Get()
  findAll() {
    return [];
  }
}
```

`cats.controller.js`
```
import { Controller, Get, Post } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Post()
  create() {
    // TODO: Add some logic here
  }

  @Get()
  findAll() {
    return [];
  }
}
```

> 这很容易。 Nest以同样的方式提供了其他的端点装饰器 - @Put（），@Delete（），@Patch（），@Options（），@Head（）和@All（）。

# 状态码操作

> 如前所述，默认情况下，响应状态代码始终是200，除了POST请求之外，我们可以通过在处理程序级别添加@HttpCode（...）装饰器来轻松更改此行为。

## TypeScript & JavaScript

`cats.controller.ts`
```
import { Controller, Get, Post, HttpStatus } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @HttpStatus(204)
  @Post()
  create() {
    // TODO: Add some logic here
  }

  @Get()
  findAll() {
    return [];
  }
}
```

`cats.controller.js`
```
import { Controller, Get, Post, HttpStatus } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @HttpStatus(204)
  @Post()
  create() {
    // TODO: Add some logic here
  }

  @Get()
  findAll() {
    return [];
  }
}
```

# 路由参数

> 当您需要接受动态数据作为URL的一部分时，使用静态路径的路由无法提供帮助。 要使用路由参数定义路由，只需在路由的路径中指定路由参数，如下所示。

```
@Get(':id')
findOne(@Param() params) {
  console.log(params.id);
  return {};
}
```

# 异步/等待

> 我们喜欢现代JavaScript，而且我们知道数据提取大多是异步的。 这就是为什么Nest支持异步功能，并且与他们一起工作得非常好。

!> 了解更多关于 异步/等待 请点击[这里](https://kamilmysliwiec.com/typescript-2-1-introduction-async-await)！

> 每个异步函数都必须返回Promise。这意味着你可以返回被缓存的值，Nest会自己解决它。让我们来看看下面的例子：

## TypeScript & JavaScript

`cats.controller.ts`
```
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```

`cats.controller.js`
```
@Get()
async findAll() {
  return [];
}
```
> 这是完全有效的。

> 此外，Nest路由处理程序更加强大。 他们可以返回RxJS可观察的流。 它使简单的Web应用程序和Nest微服务之间的迁移变得更容易。

## TypeScript & JavaScript

`cats.controller.ts`
```
@Get()
findAll(): Observable<any[]> {
  return Observable.of([]);
}
```

`cats.controller.js`
```
@Get()
findAll() {
  return Observable.of([]);
}
```

> 没有推荐的方法。 你可以使用任何你想要的。

# POST处理程序

> 这很奇怪，这个POST路由处理程序不接受任何客户端参数。 我们应该至少期待这里的@Body（）参数。

> 首先，我们需要建立DTO（数据传输对象）模式。 DTO是定义数据如何通过网络发送的对象。 我们可以使用TypeScript接口或简单的类来完成。 令人惊讶的是，我们建议在这里使用类。 为什么？ 这些类是JavaScript ES6标准的一部分，所以它们只是普通的功能。 另一方面，TypeScript接口在转换过程中被删除，Nest不能引用它们。 这一点很重要，因为Pipes等特性可以在访问变量的元类型时提供更多的可能性。

> 我们来创建CreateCatDto：

## TypeScript & JavaScript

`dto/create-cat.dto.ts`
```
export class CreateCatDto {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

`dto/create-cat.dto.ts`
```
export class CreateCatDto {
  readonly name: string;
  readonly age: number;
  readonly breed: string;
}
```

> 它只有三个基本属性。 所有这些都被标记为只读，因为我们应该尽可能使我们的功能尽可能纯净。

> 现在我们可以使用CatsController中的模式：

## TypeScript & JavaScript

`cats.controller.ts`
```
@Post()
async create(@Body() createCatDto: CreateCatDto) {
  // TODO: Add some logic here
```

`cats.controller.js`
```
@Post()
@Bind(Body())
async create(createCatDto) {
// TODO: Add some logic here
}
```

# 处理错误

> 这里有一个关于处理异常的独立章节。

# 最后一步

> 控制器准备就绪，可以使用，但是Nest不知道CatsController还没有存在，所以它不会创建这个类的一个实例。 我们需要告诉它。

> 控制器总是属于模块，这就是为什么我们在@Module（）装饰器中保存控制器数组。 由于除了根ApplicationModule，我们没有其他模块，现在就让我们使用它：

## TypeScript & JavaScript

`app.module.ts`
```
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
    controllers: [CatsController],
})
export class ApplicationModule {}
```

`app.module.js`
```
import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';

@Module({
    controllers: [CatsController],
})
export class ApplicationModule {}
```

> 田田！ 我们将元数据附加到模块类，所以现在Nest可以很容易地反映哪些控制器必须被安装。

# 快递方式

> 操作响应的第二种方法是使用快速响应对象。 这是Nest 4之前唯一可用的选项。要注入响应对象，我们需要使用@Res（）装饰器。 为了显示差异，我将重写CatsController：

## TypeScript & JavaScript

```
import { Controller, Get, Post, Res, Body, HttpStatus } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Res() res, @Body() createCatDto: CreateCatDto) {
    // TODO: Add some logic here
    res.status(HttpStatus.CREATED).send();
  }

  @Get()
  findAll(@Res() res) {
     res.status(HttpStatus.OK).json([]);
  }
}
```

> 从我的角度来看，这种方式是非常不明确的。 我绝对更喜欢第一种方法，但为了使Nest向后兼容以前的版本，这种方法仍然可用。 而且，响应对象提供了更大的灵活性 - 您可以完全控制响应。