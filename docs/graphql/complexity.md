<!-- 此文件从 content/graphql/complexity.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:48:15.696Z -->
<!-- 源文件: content/graphql/complexity.md -->

### 复杂度

> 警告 **Warning** 本章仅适用于代码优先方法。

复杂度查询允许您定义某些字段的复杂度，并限制查询的 **最大复杂度**。该想法是在使用简单的数字来定义每个字段的复杂度。一个常见的默认值是为每个字段分配复杂度为 __INLINE_CODE_5__。此外，您还可以使用所谓的复杂度估算器来自定义 GraphQL 查询的复杂度计算。复杂度估算器是一种简单函数，它将为字段计算复杂度。您可以添加任意数量的复杂度估算器到规则中，它们将按顺序执行。首先执行返回数字复杂度值的估算器将确定该字段的复杂度。

__INLINE_CODE_6__ 包含了与 __LINK_18__ 类似的工具，后者提供基于成本分析的解决方案。使用该库，您可以拒绝您的 GraphQL 服务器上认为太复杂以执行的查询。

#### 安装

要开始使用它，我们首先安装所需的依赖项。

```typescript
import { Field, ID, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class Character {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

```

#### 入门

安装过程完成后，我们可以定义 __INLINE_CODE_7__ 类：

```graphql
interface Character {
  id: ID!
  name: String!
}

```

为了演示目的，我们指定了允许的最大复杂度为 `@InterfaceType()`。在上面的示例中，我们使用了 2 个估算器，分别是 `@nestjs/graphql` 和 `Character`。

- `implements`:简单估算器将为每个字段返回固定的复杂度
- `@ObjectType()`:字段扩展估算器将从您的 schema 中提取每个字段的复杂度值

> 提示 **Hint** 不忘将该类添加到任何模块的 providers 数组中。

#### 字段级复杂度

安装了插件后，我们现在可以定义字段的复杂度 bằng 指定 `@nestjs/graphql` 属性在 `resolveType()` 装饰器的选项对象中，如下所示：

```typescript
@ObjectType({
  implements: () => [Character],
})
export class Human implements Character {
  id: string;
  name: string;
}

```

Alternatively, you can define the estimator function:

```typescript
@InterfaceType({
  resolveType(book) {
    if (book.colors) {
      return ColoringBook;
    }
    return TextBook;
  },
})
export abstract class Book {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;
}

```

#### 查询/变更级复杂度

此外， `resolveType()` 和 `resolveType` 装饰器可能具有 `@InterfaceType()` 属性，如下所示：

```typescript
import { Resolver, ResolveField, Parent, Info } from '@nestjs/graphql';

@Resolver((type) => Character) // Reminder: Character is an interface
export class CharacterInterfaceResolver {
  @ResolveField(() => [Character])
  friends(
    @Parent() character, // Resolved object that implements Character
    @Info() { parentType }, // Type of the object that implements Character
    @Args('search', { type: () => String }) searchTerm: string,
  ) {
    // 获取 character's friends
    return [];
  }
}

```