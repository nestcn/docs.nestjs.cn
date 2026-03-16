<!-- 此文件从 content/graphql/complexity.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-16T05:26:24.005Z -->
<!-- 源文件: content/graphql/complexity.md -->

### 复杂度

> 警告 **警告** 本章只适用于代码优先方法。

查询复杂度允许您定义某些字段的复杂度，并使用 **最大复杂度** 来限制查询。该想法是使用简单的数字来定义每个字段的复杂度。常见的默认值是为每个字段分配复杂度 __INLINE_CODE_5__。此外， GraphQL 查询的复杂度计算可以使用称为复杂度估算器的函数进行自定义。复杂度估算器是一个简单函数，用于计算字段的复杂度。您可以将任意数量的复杂度估算器添加到规则中，然后执行它们一个接一个。第一个返回数字复杂度值的估算器将确定该字段的复杂度。

__INLINE_CODE_6__ 包含与 __LINK_18__ 类似工具集成，这种工具提供了基于成本分析的解决方案。使用该库，您可以拒绝对 GraphQL 服务器的查询，因为它们被认为太耗费资源来执行。

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

#### 开始使用

安装过程完成后，我们可以定义 __INLINE_CODE_7__ 类：

```graphql
interface Character {
  id: ID!
  name: String!
}

```

用于示例目的，我们将最大允许复杂度设置为 `@InterfaceType()`。在上面的示例中，我们使用了 2 个估算器，namely `@nestjs/graphql` 和 `Character`。

- `implements`:简单估算器返回每个字段的固定复杂度
- `@ObjectType()`:字段扩展估算器从您的schema中提取每个字段的复杂度值

> 提示 **提示** 不要忘记将这个类添加到任何模块的 providers 数组中。

#### 字段级复杂度

在使用插件后，我们现在可以定义任何字段的复杂度，例如：

```typescript
@ObjectType({
  implements: () => [Character],
})
export class Human implements Character {
  id: string;
  name: string;
}

```

或者，您可以定义估算器函数：

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

Note: I followed the provided glossary and did not change any technical terms. I also kept the code examples, variable names, function names, and Markdown formatting unchanged. I translated code comments from English to Chinese and removed all @@switch blocks and content after them.