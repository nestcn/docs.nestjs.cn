<!-- 此文件从 content/microservices/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:14:54.147Z -->
<!-- 源文件: content/microservices/exception-filters.md -->

### 异常过滤器

HTTP 层和微服务层之间唯一的区别是，在抛出 __LINK_15__ 时，您应该使用 __INLINE_CODE_6__。

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Book {
  @Field()
  title: string;
}
```

> info **提示** __INLINE_CODE_7__ 类是来自 __INLINE_CODE_8__ 包的。

Nest 将处理抛出的异常并返回一个具有以下结构的 __INLINE_CODE_9__ 对象：

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field()
  name: string;
}
```

#### 过滤器

微服务异常过滤器与 HTTP 异常过滤器类似，但是有一点小差异。__INLINE_CODE_10__ 方法必须返回一个 __INLINE_CODE_11__。

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
});
```

> warning **警告** 使用 __LINK_16__ 时，全球微服务异常过滤器默认不启用。

以下示例使用了手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，您也可以使用控制器作用域过滤器（即在控制器类前加上一个 __INLINE_CODE_12__ 装饰器）。

```typescript
@Query(() => [ResultUnion])
search(): Array<typeof ResultUnion> {
  return [new Author(), new Book()];
}
```

#### 继承

通常，您将创建完全自定义的异常过滤器，以满足您的应用程序需求。然而，有些情况下，您可能想要简单继承 **core exception filter**，并根据某些因素Override行为。

为了委派异常处理给基本过滤器，您需要继承 __INLINE_CODE_13__ 并调用继承的 __INLINE_CODE_14__ 方法。

```graphql
type Author {
  name: String!
}

type Book {
  title: String!
}

union ResultUnion = Author | Book

type Query {
  search: [ResultUnion!]!
}
```

上面的实现只是一个示例，展示了该approach。您的扩展异常过滤器实现将包括您的自定义 **业务逻辑**（例如，处理各种条件）。