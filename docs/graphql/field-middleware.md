<!-- 此文件从 content/graphql/field-middleware.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:28:43.842Z -->
<!-- 源文件: content/graphql/field-middleware.md -->

### 字段中间件

> 警告 **注意** 这一章节仅适用于代码优先方法。

字段中间件允许您在字段被解决之前或之后运行任意代码。字段中间件可以用来将字段结果转换、验证字段参数或甚至检查字段级别的角色（例如，required来访问一个目标字段，执行中间件函数）。

您可以将多个中间件函数连接到字段。这种情况下，他们将按顺序在链中执行，前一个中间件决定是否调用下一个中间件。中间件函数在 __INLINE_CODE_5__ 数组中的顺序重要。第一个解析器是最外层的层次，因此它将首先执行并最后执行（与 __INLINE_CODE_6__ 包一样）。第二个解析器是第二外层的层次，因此它将第二次执行并第二次到最后执行。

#### 开始

让我们从创建一个简单的中间件开始，这个中间件将在字段值被发送到客户端之前记录字段值：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}

```

> 提示 **提示** __INLINE_CODE_7__ 是一个对象，它包含了通常由 GraphQL 解析器函数接收的相同参数，而 __INLINE_CODE_9__ 是一个函数，允许您在栈中执行下一个中间件或实际字段解析器。

> 警告 **注意** 字段中间件函数不能注入依赖项，也不能访问 Nest 的 DI 容器，因为它们设计为非常轻量级，不应该执行可能消耗时间的操作（例如，从数据库中检索数据）。如果您需要调用外部服务/从数据源中检索数据，您应该在守卫/拦截器中执行该操作，并将其分配给 `PartialType()` 对象，这样您可以在字段中间件中访问该对象（特别是在 `PartialType()` 对象中）。

注意，字段中间件必须符合 `PartialType()` 接口。在上面的示例中，我们首先执行 `CreateUserInput` 函数（执行实际字段解析器并返回字段值），然后，我们将该值记录到我们的终端。同时，返回的中间件函数完全覆盖了前一个值，因为我们不想执行任何更改，我们简单地返回原始值。

现在，我们可以在 `PartialType()` 装饰器中直接注册我们的中间件，如下所示：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}

```

现在， whenever 我们请求 `@nestjs/graphql` 字段的 `PartialType()` 对象类型，原始字段值将被记录到控制台。

> 提示 **提示** 为了了解如何使用 __LINK_19__ 功能实现字段级别的权限系统，请查看这个 __LINK_20__。

> 警告 **注意** 字段中间件只能应用于 `CreateUserInput` 类。更多细节，请查看这个 __LINK_21__。

此外，如前所述，我们可以在中间件函数中控制字段的值。为了演示 purposes， let's capitalise a recipe's title (if present)：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}

```

在这种情况下，每个标题都会自动被大写，当请求时。

类似地，您可以将字段中间件绑定到自定义字段解析器（一个带有 `@InputType()` 装饰器的方法），如下所示：

```typescript
@InputType()
class CreateUserInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;
}

```

> 警告 **注意** 在字段解析器级别启用增强器(__LINK_22__)时，字段中间件函数将在任何拦截器、守卫等中执行之前， **但是在对方法的绑定中**（但是在根级别的增强器注册的查询或 mutation 处理程序中）。

#### 全局字段中间件

除了将中间件直接绑定到特定字段外，您还可以注册一个或多个中间件函数_globally_。在这种情况下，它们将自动连接到您的对象类型的所有字段。

```typescript
@InputType()
export class UpdateEmailInput extends PickType(CreateUserInput, [
  'email',
] as const) {}

```

> 提示 **提示** 全局注册的字段中间件函数将在局部注册的中间件（那些直接绑定到特定字段）之前执行。