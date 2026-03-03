<!-- 此文件从 content/middlewares.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:07:45.988Z -->
<!-- 源文件: content/middlewares.md -->

### Middleware

Middleware 是一个在路由处理器之前被调用的函数。Middleware 函数可以访问 `request` 和 `response` 对象，并且可以在应用程序的请求响应周期中执行任何代码。

__HTML_TAG_72____HTML_TAG_73____HTML_TAG_74__

NestJS 的 middleware 等同于 Express 中的 middleware。Middleware 函数可以执行以下任务：

__HTML_TAG_75__
  中WARE 函数可以执行以下任务：
  __HTML_TAG_76__执行任何代码。
  __HTML_TAG_77__修改请求和响应对象。
  __HTML_TAG_78__结束请求响应周期。
  __HTML_TAG_79__调用下一个 middleware 函数。
  __HTML_TAG_80__如果当前 middleware 函数不结束请求响应周期，必须调用 `next()` 将控制权传递给下一个 middleware 函数。否则，请求将被留下。
  __HTML_TAG_81__
__HTML_TAG_90__

您可以使用函数或类来实现自定义 Nest middleware。类中应该实现 `@Injectable` 装饰器，而函数不需要特殊要求。

#### 依赖注入

Nest middleware 完全支持依赖注入。正如提供者和控制器一样，它们可以注入同一个模块中的依赖项。通过 `@Inject` 装饰器来实现依赖注入。

#### 应用 middleware

middleware 不在 `@Controller` 装饰器中。相反，我们使用 `@Module` 类的 `forRoot()` 方法来设置它们。实现 `@Module` 接口的模块可以包含 middleware。

#### 路由通配符

NestJS 还支持模式路由。例如，命名通配符 (`__INLINE_CODE_42__`) 可以用作通配符，以匹配路由中的任何组合字符。下面是一个示例，middleware 将被执行为任何以 `__INLINE_CODE_43__` 开头的路由，无论其后字符的数量。

```typescript
constructor(private catsService: CatsService) {}
```

> info **Hint** __INLINE_CODE_44__ 是通配符参数的名称，它没有特殊含义。您可以将其命名为任何名称，例如 `__INLINE_CODE_45__`。

#### middleware 消费者

__INLINE_CODE_53__ 是一个帮助类，它提供了多种方法来管理 middleware。所有这些方法都可以被链式调用在 `__LINK_97__` 中。`__INLINE_CODE_54__` 方法可以接受单个字符串、多个字符串、`__INLINE_CODE_55__` 对象、控制器类或多个控制器类。通常情况下，您可能会传递控制器列表，使用逗号分隔。下面是一个使用单个控制器的示例：

```typescript
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class HttpService<T> {
  @Inject('HTTP_OPTIONS')
  private readonly httpClient: T;
}
```

> info **Hint** `__INLINE_CODE_56__` 方法可以接受单个 middleware 或多个参数，以指定多个 middleware。

#### 排除路由

有时，我们可能想排除某些路由不应用 middleware。这可以使用 `__INLINE_CODE_57__` 方法来实现。`__INLINE_CODE_58__` 方法接受单