<!-- 此文件从 content/microservices/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:15:55.534Z -->
<!-- 源文件: content/microservices/exception-filters.md -->

### 异常过滤器

HTTP 层和微服务层之间唯一的不同之处是，而不是抛出 __INLINE_CODE_5__, 应该使用 __INLINE_CODE_6__。

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Book {
  @Field()
  title: string;
}
```

> info **提示** 类 __INLINE_CODE_7__ 来自包 __INLINE_CODE_8__。

Nest 将处理抛出的异常，并将返回 __INLINE_CODE_9__ 对象，具有以下结构：

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field()
  name: string;
}
```

#### 过滤器

微服务异常过滤器的行为与 HTTP 异常过滤器相似，但有一小点不同。方法 __INLINE_CODE_10__ 必须返回 __INLINE_CODE_11__。

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
});
```

> warning **警告** 使用 __LINK_16__ 时，全球微服务异常过滤器默认不可用。

以下示例使用手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，你也可以使用控制器作用域过滤器（即将控制器类前缀为 __INLINE_CODE_12__ 装饰器）。

```typescript
@Query(() => [ResultUnion])
search(): Array<typeof ResultUnion> {
  return [new Author(), new Book()];
}
```

#### 继承

通常，您将创建完全定制的异常过滤器，以满足您的应用程序需求。然而，有些情况下，您可能想要简单地扩展 **core 异常过滤器**，并根据特定因素Override行为。

为了将异常处理委派给基本过滤器，您需要扩展 __INLINE_CODE_13__ 并调用继承的 __INLINE_CODE_14__ 方法。

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

上面的实现只是一个 shell，显示了该方法。您的扩展异常过滤器实现将包括您定制的 **业务逻辑**（例如，处理各种情况）。