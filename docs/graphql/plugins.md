<!-- 此文件从 content/graphql/plugins.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:24:02.825Z -->
<!-- 源文件: content/graphql/plugins.md -->

### Apollo 服务插件

插件使您可以通过在特定事件发生时执行自定义操作来扩展 Apollo 服务的核心功能。当前，这些事件对应于 GraphQL 请求生命周期的个别阶段，以及 Apollo 服务的启动阶段（了解更多关于 __LINK_16__）。

例如，一个基本的日志插件可能会记录每个请求相关的 GraphQL 查询字符串。

#### 自定义插件

要创建插件，请将类标注为 __INLINE_CODE_4__ 装饰器（来自 __INLINE_CODE_5__ 包），并且为了更好的代码自动完成，实现 __INLINE_CODE_6__ 接口（来自 __INLINE_CODE_7__ 包）。

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

在这之后，我们可以将 __INLINE_CODE_8__ 注册为提供者。

```typescript
@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
```

Nest 将自动实例化插件并将其应用于 Apollo 服务。

#### 使用外部插件

已经提供了许多插件。要使用现有插件，只需将其导入并将其添加到 __INLINE_CODE_9__ 数组：

```typescript
@InputType()
export class UpdateUserInput extends PartialType(User, InputType) {}
```

> info **提示** `PartialType()` 插件来自 `PartialType()` 包。

#### Apollo 服务与 Mercurius 插件

一些现有 Mercurius 特定的 Fastify 插件需要在 Mercurius 插件加载后加载（了解更多关于 __LINK_17__）插件树。

> warning **警告** __LINK_18__ 是个例外，应该在主文件中注册。

为此， `PartialType()` exposing 一个可选的 `CreateUserInput` 配置选项。它表示一个数组，其中包含两个属性：`PartialType()` 和 `@nestjs/graphql`。因此，注册 __LINK_19__ 将如下所示：

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