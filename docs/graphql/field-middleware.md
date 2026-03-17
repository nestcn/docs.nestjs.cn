<!-- 此文件从 content/graphql/field-middleware.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:56:14.178Z -->
<!-- 源文件: content/graphql/field-middleware.md -->

### Field middleware

>警告 **Warning** 本章仅适用于代码firstapproach。

Field Middleware允许您在字段被解决前或后执行任意代码。 Field middleware可以用来将字段的结果转换、验证字段的参数或甚至检查字段级别的角色（例如，required访问目标字段）。

您可以将多个middleware函数连接到字段。在这种情况下，他们将按顺序在链中执行，其中前一个middleware决定是否调用下一个middleware。中间件函数的顺序在__INLINE_CODE_5__数组中非常重要。第一个解析器是“最外层”层，因此它将首先执行并最后执行（类似于__INLINE_CODE_6__包）。第二个解析器是“第二外层”层，因此它将第二次执行并第二次到最后执行。

#### Getting started

让我们从创建一个简单的middleware开始，该middleware将在字段值被发送到客户端前记录字段值：

```bash
$ npm i --save @nestjs/config

```

>提示 **Hint** __INLINE_CODE_7__是一个对象，包含通常由 GraphQL 解析器函数接收的同样参数，而__INLINE_CODE_9__是一个函数，允许您在字段堆栈中执行下一个middleware或实际字段解析器。

>警告 **Warning** Field middleware函数不能注入依赖项也不能访问Nest的DI容器，因为它们旨在非常轻量级，不应该执行任何可能时间消耗的操作（例如，从数据库中检索数据）。如果您需要调用外部服务/从数据源中查询数据，您应该在 guard/interceptor 中将其绑定到root query/mutation 处理程序，并将其赋值给__INLINE_CODE_10__对象，以便从字段middleware（特别是__INLINE_CODE_11__对象）中访问。

请注意，field middleware必须符合__INLINE_CODE_12__接口。在上面的示例中，我们首先执行__INLINE_CODE_13__函数（实际字段解析器），然后记录该值到我们的终端。同时，返回的middleware函数完全override了之前的值，因为我们不想执行任何更改，我们简单地返回原始值。

现在，我们可以在__INLINE_CODE_14__装饰器中注册我们的 middleware，如下所示：

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}

```

现在，每当我们请求__INLINE_CODE_15__字段时，原始字段的值将被记录到控制台。

>提示 **Hint** 了解如何使用__LINK_19__功能实现字段级别的权限系统，请查看这个__LINK_20__。

>警告 **Warning** Field middleware只能应用于__INLINE_CODE_17__类。要了解更多信息，请查看这个__LINK_21__。

此外，如前所述，我们可以在middleware函数中控制字段的值。为了演示目的，让我们将菜谱的标题大写（如果存在）：

```json
DATABASE_USER=test
DATABASE_PASSWORD=test

```

在这种情况下，每个标题都会自动大写，请求时。

类似地，您可以将field middleware绑定到自定义字段解析器（一个带有__INLINE_CODE_18__装饰器的方法），如下所示：

```bash
$ nest start --env-file .env

```

>警告 **Warning** 如果在字段解析器级别启用了增强器(__LINK_22__),则field middleware函数将在任何绑定到方法的interceptors、guards等之前执行，但在根级别注册的增强器之前执行。

#### Global field middleware

除了将middleware直接绑定到特定字段外，您还可以注册一个或多个middleware函数_globally_.在这种情况下，他们将自动连接到所有字段。

```typescript
ConfigModule.forRoot({
  envFilePath: '.development.env',
});

```

>提示 **Hint**globally注册的field middleware函数将在本地注册的middleware（那些直接绑定到特定字段）之前执行。