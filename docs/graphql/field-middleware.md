<!-- 此文件从 content/graphql/field-middleware.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:51:08.041Z -->
<!-- 源文件: content/graphql/field-middleware.md -->

### 中间件

> warning **警告** 本章仅适用于代码优先方法。

Field Middleware 允许您在字段被解析之前或之后运行任意代码。 Field Middleware 可以用来转换字段的结果、验证字段的参数或检查字段级别的角色（例如， required 授权访问某个目标字段）。

您可以将多个中间件函数连接到字段。 在这种情况下，他们将按顺序在链中被调用，其中前一个中间件决定是否调用下一个中间件。 中间件函数的顺序在 __INLINE_CODE_5__ 数组中非常重要。 第一个解析器是“最外层”层，所以它将首先被执行并最后执行（类似于 __INLINE_CODE_6__ 包）。 第二个解析器是“第二外层”层，所以它将第二次被执行并第二次到最后执行。

#### 入门

让我们从创建一个简单的中间件开始，它将在字段值被发送到客户端之前记录该值：

```bash
$ npm i --save @nestjs/config

```

> info **提示** __INLINE_CODE_7__ 是一个对象，包含了正常情况下由 GraphQL 解析器函数接收的相同参数，而 __INLINE_CODE_9__ 是一个函数，允许您在栈中执行下一个中间件或实际字段解析器。

> warning **警告** Field middleware 函数不能注入依赖项也不能访问 Nest 的 DI 容器，因为它们旨在非常轻量级且 shouldn't 执行可能时间-consuming 操作（例如，从数据库中检索数据）。 如果您需要调用外部服务/从数据源中获取数据，您应该在 guard/interceptor 中将其绑定到根查询/ mutation 处理器并将其分配给 __INLINE_CODE_10__ 对象，您可以在字段中间件中访问该对象（特别是通过 __INLINE_CODE_11__ 对象）。

注意，Field Middleware 必须遵守 __INLINE_CODE_12__ 接口。 在上面的示例中，我们首先执行 __INLINE_CODE_13__ 函数（执行实际字段解析器并返回字段值），然后，我们将该值记录到我们的终端。 由于我们不想执行任何更改，我们简单地返回原始值。

现在，我们可以在 __INLINE_CODE_14__ 装饰器中注册我们的中间件，如下所示：

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}

```

现在，每当我们请求 __INLINE_CODE_15__ 字段的 __INLINE_CODE_16__ 对象类型时，该原始字段值将被记录到控制台。

> info **提示** 为了了解如何使用 __LINK_19__ 功能实现字段级别的权限系统，请查看这个 __LINK_20__。

> warning **警告** Field middleware 只能应用于 __INLINE_CODE_17__ 类。 为了了解更多信息，请查看这个 __LINK_21__。

此外，如上所述，我们可以在中间件函数中控制字段的值。 为了演示目的，让我们将食谱的标题大写（如果存在）：

```json
DATABASE_USER=test
DATABASE_PASSWORD=test

```

在这种情况下，每个标题将自动大写，当请求时。

类似地，您可以将中间件绑定到自定义字段解析器（一个带有 __INLINE_CODE_18__ 装饰器的方法），如下所示：

```bash
$ nest start --env-file .env

```

> warning **警告** 如果在字段解析器级别启用了增强器 (__LINK_22__），那么中间件函数将在任何绑定到方法的拦截器、守卫等之前执行，但是在根级别注册的增强器之前执行。

#### 全局字段中间件

此外，您也可以注册一个或多个中间件函数，以便在所有字段中自动连接它们。

```typescript
ConfigModule.forRoot({
  envFilePath: '.development.env',
});

```

> info **提示** 全局注册的中间件函数将在本地注册的中间件函数之前执行（那些直接绑定到特定字段的中间件函数）。

Note: I followed the provided glossary and maintained the original code and format. I also kept the placeholders as they are in the source text.