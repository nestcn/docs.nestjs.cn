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

|         |    |
| -------------   | :----: |
| 标准（推荐）|   我们以与普通函数相同的方式来对待处理程序。 当我们返回JavaScript对象或数组时，它会自动转换为JSON。 当我们返回字符串时，Nest会发送一个字符串。而且，响应状态代码默认为200，除了POST请求，当它是201时。我们可以通过在处理程序级别添加@HttpCode（...）装饰器来轻松地更改此行为。   |
| 明确        |   我们可以使用快速响应对象，我们可以在函数签名中使用@Res（）装饰器注入，例如findAll（@Res（）response）。    |


!> 注意！ 禁止同时使用两种方法。 Nest检测处理程序是否正在使用 `@Res（）`或 `@Next（）`，如果是这样,此单个路由的标准方式将被禁用。