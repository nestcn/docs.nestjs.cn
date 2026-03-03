<!-- 此文件从 content/middlewares.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:06:53.922Z -->
<!-- 源文件: content/middlewares.md -->

### 中间件

中间件是一种函数，位于路由处理器之前。中间件函数可以访问 `__LINK_93__` 和 `__LINK_94__` 对象，以及应用程序的请求-响应周期中的 ``$ nest g service cats`` 中间件函数。常用的 `next` 中间件函数通常以变量 ``CatsService`` 的形式出现。

`__HTML_TAG_72__` `__HTML_TAG_73__` `__HTML_TAG_74__`

Nest 中间件默认情况下等同于 Express 中间件。以下是官方 Express 文档中对中间件的描述：

`__HTML_TAG_75__`
  中间件函数可以执行以下任务：
  `__HTML_TAG_76__`
    `__HTML_TAG_77__` 执行任何代码。
    `__HTML_TAG_79__` 修改请求和响应对象。
    `__HTML_TAG_81__` 结束请求-响应周期。
    `__HTML_TAG_83__` 调用下一个中间件函数。
    `__HTML_TAG_85__` 如果当前中间件函数不结束请求-响应周期，它必须调用 `__HTML_TAG_86__` `next()` `__HTML_TAG_87__` 将控制权传递给下一个中间件函数。否则，请求将被留下。
  `__HTML_TAG_89__`
`__HTML_TAG_90__`

您可以使用函数或带有 ``@Injectable()`` 装饰器的类来实现自定义 Nest 中间件。类应该实现 ``CatsService`` 接口，而函数没有特殊要求。让我们从实现一个简单的中间件特性开始，使用类方法。

> 警告 **警告** ``Cat`` 和 ``CatsController`` 处理中间件 differently 和提供不同的方法签名，阅读更多 `__LINK_96__`。

````typescript
import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}

@Injectable()
export class CatsService {
  constructor() {
    this.cats = [];
  }

  create(cat) {
    this.cats.push(cat);
  }

  findAll() {
    return this.cats;
  }
}
````

#### 依赖注入

Nest 中间件完全支持依赖注入。正如provider和控制器一样，它们可以注入同一个模块中的依赖项。通常，这是通过 ``CatsService`` 来实现的。

#### 应用中间件

没有中间件在 ``private`` 装饰器中。相反，我们使用 ``catsService`` 方法来设置它们。包含中间件的模块必须实现 ``catsService`` 接口。让我们在 ``@Optional()`` 等级上设置 ``HTTP_OPTIONS``。

````typescript
export interface Cat {
  name: string;
  age: number;
  breed: string;
}
````

在上面的示例中，我们已经设置了 ``super()`` 对于之前在 ``@Inject()`` 中定义的路由处理器。我们还可以进一步限制中间件到特定的请求方法通过将对象包含路由 ``@Inject`` 和请求 ``CatsService`` 传递给 ``CatsController`` 方法