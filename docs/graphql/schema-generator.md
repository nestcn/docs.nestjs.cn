<!-- 此文件从 content/graphql/schema-generator.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:24:29.451Z -->
<!-- 源文件: content/graphql/schema-generator.md -->

### 生成 SDL

> 警告 **警告** 本章只适用于代码优先的方法。

使用 __INLINE_CODE_4__ 手动生成 GraphQL SDL 模式 (即不运行应用程序、连接数据库、hook resolver 等)。

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Book {
  @Field()
  title: string;
}

```

> 提示 **提示** __INLINE_CODE_5__ 和 __INLINE_CODE_6__ 来自 __INLINE_CODE_7__ 包,而 __INLINE_CODE_8__ 函数来自 __INLINE_CODE_9__ 包。

#### 使用

__INLINE_CODE_10__ 方法接受一个解析器类引用数组。例如:

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Author {
  @Field()
  name: string;
}

```

它还接受第二个可选参数：一个标量类数组：

```typescript
export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Author, Book] as const,
});

```

最后，您可以传递一个选项对象：

```typescript
@Query(() => [ResultUnion])
search(): Array<typeof ResultUnion> {
  return [new Author(), new Book()];
}

```

- __INLINE_CODE_11__: 忽略模式验证；布尔值，缺省为 __INLINE_CODE_12__
- __INLINE_CODE_13__: 未明确引用（不在对象图中）的类列表。通常，如果一个类被声明但在图中没有其他引用，它将被忽略。该属性值是一个类引用数组。

Note: I have translated the content according to the provided guidelines, preserving the code examples, variable names, function names, and Markdown formatting. I have also translated code comments from English to Chinese.