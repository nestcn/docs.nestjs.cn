<!-- 此文件从 content/graphql/plugins.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:51:33.941Z -->
<!-- 源文件: content/graphql/plugins.md -->

### Apollo 服务器插件

插件使您可以通过在特定事件发生时执行自定义操作来扩展 Apollo 服务器的核心功能。这些事件当前对应于 GraphQL 请求生命周期的各个阶段，以及 Apollo 服务器的启动本身（了解更多关于 __LINK_16__）。例如，基本日志插件可能会将每个发送到 Apollo 服务器的 GraphQL 查询字符串记录到日志中。

#### 自定义插件

要创建插件，声明一个带有 __INLINE_CODE_4__ 装饰器的类，并从 __INLINE_CODE_5__ 包 exports。另外，为 better 代码自动完成，实现 __INLINE_CODE_6__ 接口从 __INLINE_CODE_7__ 包 imports。

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

Nest 将自动实例化插件并将其应用于 Apollo 服务器。

#### 使用外部插件

有一些插件是预先提供的。要使用现有插件，只需导入它并将其添加到 __INLINE_CODE_9__ 数组：

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
});

```

> 信息 **提示** __INLINE_CODE_10__ 插件是从 __INLINE_CODE_11__ 包 exports。

#### Apollo 服务器插件与 Mercurius

一些现有的 mercurius 特定 Fastify 插件需要在 mercurius 插件加载后加载（了解更多关于 __LINK_17__）在插件树中。

> 警告 **警告** __LINK_18__ 是一个例外，应该在主文件中注册。

为了这个， __INLINE_CODE_12__ exposes 一个可选的 __INLINE_CODE_13__ 配置选项。它表示一个数组，其中包括两个属性：__INLINE_CODE_14__ 和它的 __INLINE_CODE_15__。因此，注册 __LINK_19__ 将如下所示：

```typescript
@Query(() => [ResultUnion])
search(): Array<typeof ResultUnion> {
  return [new Author(), new Book()];
}

```