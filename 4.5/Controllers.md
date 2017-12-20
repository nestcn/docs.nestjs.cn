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

> 我们在这里使用`@Controller('cats')`。 这个装饰者是强制性的。 猫是在班级中注册的每条路线的前缀。 前缀是可选的，这意味着你可以将括号清空（`@Controller（）`），但是它减少了多余的样板代码，因此每次你决定创建一个新的端点时，你不必重复自己）。

> 有一个公共方法`findAll（）`，它返回一个空数组。 `@Get（）`装饰器告诉 `Nest`，有必要为这个路径路径创建一个端点，并把每个适当的请求映射到这个处理器。 由于我们为每条路线（`cats`）声明了前缀，所以Nest会在这里映射每个`/cats`的 GET 请求。

> 当一个客户端调用这个端点时，Nest将返回200个状态码和解析的 JSON，所以在这种情况下 - 只是一个空的数组。 这怎么可能？

> 有`两种`可能的方法来处理响应：