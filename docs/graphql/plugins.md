<!-- 此文件从 content/graphql/plugins.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:16:41.813Z -->
<!-- 源文件: content/graphql/plugins.md -->

### Apollo 服务插件

插件使您可以通过在特定事件中执行自定义操作来扩展 Apollo 服务的核心功能。当前，这些事件对应于 GraphQL 请求生命周期的个别阶段，以及 Apollo 服务的启动本身（了解更多关于 __LINK_16__）。例如，一个基本的日志插件可能会将每个发送到 Apollo 服务的 GraphQL 查询字符串日志记录。

#### 自定义插件

要创建插件， declare a class annotated with the __INLINE_CODE_4__ decorator exported from the __INLINE_CODE_5__ package. Besides, for better code autocompletion, implement the __INLINE_CODE_6__ interface from the __INLINE_CODE_7__ package.

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

这样，我们可以将 __INLINE_CODE_8__ 注册为提供者。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
```

Nest 将自动实例化插件并将其应用于 Apollo 服务。

#### 使用外部插件

有几个插件在外部提供。要使用现有插件，简单地导入它并将其添加到 __INLINE_CODE_9__ 数组中：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}
```

> info **提示** `PartialType()` 插件来自 `PartialType()` 包。

#### Mercurius 插件

一些现有的 Mercurius 特定 Fastify 插件需要在 Mercurius 插件加载后加载（了解更多关于 __LINK_17__）在插件树中。

> warning **警告** __LINK_18__ 是一个例外，应该在主文件中注册。

为此，`PartialType()` exposing an optional `CreateUserInput` 配置选项。它表示一个数组对象，其中包含两个属性：`PartialType()` 和它的 `@nestjs/graphql`。因此，注册 __LINK_19__ 将如下所示：

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