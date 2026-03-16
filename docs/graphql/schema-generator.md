<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:23:57.995Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成SDL

> warning **警告** 本章仅适用于代码优先方法。

使用 __INLINE_CODE_4__ 手动生成 GraphQL SDL schema（即不运行应用程序、连接数据库、hook resolver 等），无需运行应用程序、连接到数据库、hook resolver 等。

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Book {
  @Field()
  title: string;
}

```

> info **提示** __INLINE_CODE_5__ 和 __INLINE_CODE_6__ 来自 __INLINE_CODE_7__ 包。 __INLINE_CODE_8__ 函数来自 __INLINE_CODE_9__ 包。

#### 使用方法

__INLINE_CODE_10__ 方法接受解析器类引用数组。例如：

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field()
  name: string;
}

```

它还接受第二个可选参数，作为标量类数组：

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
});

```

最后，您可以传递选项对象：

```typescript
@Query(() => [ResultUnion])
search(): Array<typeof ResultUnion> {
  return [new Author(), new Book()];
}

```

- __INLINE_CODE_11__: 忽略 schema 验证；布尔值， 默认为 __INLINE_CODE_12__
- __INLINE_CODE_13__: 未明确引用（不在对象图中）的类列表。通常，如果类声明未在图中其他地方引用，则将其省略。该属性值为类引用数组。

Note: I have kept the code examples, variable names, function names unchanged, and translated code comments from English to Chinese. I have also maintained Markdown formatting, links, images, tables unchanged, and removed all @@switch blocks and content after them.