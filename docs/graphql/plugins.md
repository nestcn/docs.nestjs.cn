<!-- 此文件从 content/graphql/plugins.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:05:34.456Z -->
<!-- 源文件: content/graphql/plugins.md -->

### Apollo Server 插件

插件使您可以通过在 GraphQL 请求生命周期中或 Apollo Server 启动时执行自定义操作来扩展 Apollo Server 的核心功能。当前，这些事件对应于 GraphQL 请求生命周期的个别阶段，以及 Apollo Server 自身的启动（了解更多 __LINK_16__）。例如，基本的日志插件可能会将每个请求关联的 GraphQL 查询字符串记录到日志中。

#### 自定义插件

要创建插件，声明一个带有 __INLINE_CODE_4__ 装饰器的类，并从 __INLINE_CODE_5__ 包.exported。另外，为了提高代码自动完成，实现 __INLINE_CODE_6__ 接口来自 __INLINE_CODE_7__ 包。

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Book {
  @Field()
  title: string;
}

```

这样，我们可以将 __INLINE_CODE_8__ 注册为提供者。

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field()
  name: string;
}

```

Nest 将自动实例化插件并将其应用于 Apollo Server。

#### 使用外部插件

有几个插件提供了 out-of-the-box。要使用现有插件，只需导入它并将其添加到 __INLINE_CODE_9__ 数组：

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
});

```

> 信息 **提示** __INLINE_CODE_10__ 插件来自 __INLINE_CODE_11__ 包。

#### Mercurius 插件

一些现有的 mercurius-特定的 Fastify 插件必须在 mercurius 插件后加载（了解更多 __LINK_17__）在插件树中。

> 警告 **警告** __LINK_18__ 是个例外，它应该在主文件中注册。

为此，__INLINE_CODE_12__ exposes 一个可选的 __INLINE_CODE_13__ 配置选项。它表示一个包含两个属性：__INLINE_CODE_14__ 和其 __INLINE_CODE_15__ 的对象数组。因此，注册 __LINK_19__ 将如下所示：

```typescript
@Query(() => [ResultUnion])
search(): Array<typeof ResultUnion> {
  return [new Author(), new Book()];
}

```
