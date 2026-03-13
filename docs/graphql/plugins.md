<!-- 此文件从 content/graphql/plugins.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:46:29.008Z -->
<!-- 源文件: content/graphql/plugins.md -->

### Apollo 服务器插件

插件使您可以通过在 GraphQL 请求生命周期的特定阶段或 Apollo 服务器启动时执行自定义操作来扩展 Apollo 服务器的核心功能。当前，这些事件对应于 GraphQL 请求生命周期的个别阶段，以及 Apollo 服务器的启动本身（请阅读 __LINK_16__）。例如，一种基本的日志插件可能会将每个请求发送到 Apollo 服务器的 GraphQL 查询字符串记录下来。

#### 自定义插件

要创建插件， declare a class annotated with the __INLINE_CODE_4__ decorator exported from the __INLINE_CODE_5__ package. Additionally, for better code autocompletion, implement the __INLINE_CODE_6__ interface from the __INLINE_CODE_7__ package.

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Book {
  @Field()
  title: string;
}

```

现在，我们可以将 __INLINE_CODE_8__ 注册为提供者。

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field()
  name: string;
}

```

Nest 将自动实例化插件并将其应用于 Apollo 服务器。

#### 使用外部插件

有几个插件出现在外部。要使用现有插件，只需导入它并将其添加到 __INLINE_CODE_9__ 数组：

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
});

```

> info **提示** __INLINE_CODE_10__ 插件来自 __INLINE_CODE_11__ 包。

#### Apollo 服务器插件和 Mercurius

一些现有的 mercurius 特定 Fastify 插件必须在 mercurius 插件加载后加载（请阅读 __LINK_17__）。在插件树中。

> warning **警告** __LINK_18__ 是一种例外，应该在 main 文件中注册。

为此，__INLINE_CODE_12__ expose 一个可选的 __INLINE_CODE_13__ 配置选项。它表示一个对象数组，其中每个对象都包含两个属性：__INLINE_CODE_14__ 和其 __INLINE_CODE_15__。因此，注册 __LINK_19__ 将如下所示：

```typescript
@Query(() => [ResultUnion])
search(): Array<typeof ResultUnion> {
  return [new Author(), new Book()];
}

```