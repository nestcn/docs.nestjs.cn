<!-- 此文件从 content/graphql/complexity.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-15T05:07:37.910Z -->
<!-- 源文件: content/graphql/complexity.md -->

### 复杂性

> 警告 **警告** 本章只适用于代码优先方法。

查询复杂度允许您定义某些字段的复杂度，并使用 **最大复杂度** 限制查询。该想法是使用简单的数字定义每个字段的复杂度。常见的默认值是为每个字段分配复杂度为 __INLINE_CODE_5__。此外，GraphQL 查询的复杂度计算可以使用所谓的复杂度估算器自定义。复杂度估算器是一个简单函数，它们根据字段计算复杂度。您可以将任意数量的复杂度估算器添加到规则中，然后执行它们一个接着一个。第一个返回数字复杂度值的估算器确定该字段的复杂度。

__INLINE_CODE_6__ 包装器与工具__LINK_18__非常相容，该工具提供基于成本分析的解决方案。使用该库，您可以拒绝对您的 GraphQL 服务器的查询，以免执行的查询过于昂贵。

#### 安装

要开始使用，首先安装所需的依赖项。

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

#### 快速入门

安装过程完成后，我们可以定义 __INLINE_CODE_7__ 类：

```graphql
interface Character {
  id: ID!
  name: String!
}

```

为了演示目的，我们指定了允许的最大复杂度为 `@InterfaceType()`。在上面的示例中，我们使用了 2 个估算器，`@nestjs/graphql` 和 `Character`。

- `implements`:简单估算器返回每个字段的固定复杂度
- `@ObjectType()`:字段扩展估算器从您的架构中提取每个字段的复杂度值

> 提示 **提示**请将该类添加到任何模块的提供者数组中。

#### 字段级复杂度

在安装了该插件后，我们现在可以定义字段的复杂度，方法是将 `@nestjs/graphql` 属性添加到 `resolveType()` 装饰器的选项对象中，如下所示：

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

#### 查询/Mutation级复杂度

此外，`resolveType()` 和 `resolveType` 装饰器可能具有 `@InterfaceType()` 属性，例如：

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