<!-- 此文件从 content/graphql/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:24:37.960Z -->
<!-- 源文件: content/graphql/mapped-types.md -->

### Mapped types

> warning **Warning** This chapter only applies to the code first approach.

在构建 CRUD (Create/Read/Update/Delete) 等功能时，构造基于基础实体类型的变体类型非常有用。Nest 提供了多种utility 函数，用于将类型转换，以简化这项任务。

#### Partial

在构建输入验证类型（也称为 Data Transfer Objects 或 DTOs）时，构建 **create** 和 **update** 变体类型非常有用。例如， **create** 变体可能需要所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 `password` 函数，以简化这项任务并减少 boilerplate。

__INLINE_CODE_11__ 函数返回一个类型（类），其中所有输入类型的属性都设置为可选。例如，假设我们有一个 **create** 类型，如下所示：

```typescript
@Field()
@Extensions({ role: Role.ADMIN })
password: string;
```

默认情况下，这些字段都是必需的。要创建一个具有相同字段，但每个字段都是可选的类型，请使用 __INLINE_CODE_12__，将类引用（__INLINE_CODE_13__）作为参数传递：

```typescript
export const checkRoleMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const { info } = ctx;
  const { extensions } = info.parentType.getFields()[info.fieldName];

  /**
   * In a real-world application, the "userRole" variable
   * should represent the caller's (user) role (for example, "ctx.user.role").
   */
  const userRole = Role.USER;
  if (userRole === extensions.role) {
    // or just "return null" to ignore
    throw new ForbiddenException(
      `User does not have sufficient permissions to access "${info.fieldName}" field.`,
    );
  }
  return next();
};
```

> info **Hint** __INLINE_CODE_14__ 函数来自 __INLINE_CODE_15__ 包。

__INLINE_CODE_16__ 函数可以选取一个可选的第二个参数，该参数是装饰器工厂的引用。这个参数可以用来更改结果（子）类的装饰器函数。如果不指定，子类将使用父类（引用在第一个参数中）的相同装饰器。在上面的示例中，我们继承自 __INLINE_CODE_17__，它被注解为 __INLINE_CODE_18__ 装饰器。由于我们也想将 __INLINE_CODE_19__ treated as if it were decorated with __INLINE_CODE_20__，因此没有必要将 __INLINE_CODE_21__ 作为第二个参数传递。如果父类和子类不同（例如父类被 __INLINE_CODE_22__ 装饰），我们将传递 __INLINE_CODE_23__ 作为第二个参数。例如：

```typescript
@Field({ middleware: [checkRoleMiddleware] })
@Extensions({ role: Role.ADMIN })
password: string;
```

#### Pick

__INLINE_CODE_24__ 函数构建一个新的类型（类）通过从输入类型中选择一组属性。例如，假设我们从以下类型开始：

__CODE_BLOCK_3__

我们可以使用 __INLINE_CODE_25__ utility 函数选择一组属性：

__CODE_BLOCK_4__

> info **Hint** __INLINE_CODE_26__ 函数来自 __INLINE_CODE_27__ 包。

#### Omit

__INLINE_CODE_28__ 函数构建一个类型通过从输入类型中选择所有属性，然后删除特定的键。例如，假设我们从以下类型开始：

__CODE_BLOCK_5__

我们可以生成一个衍生类型，该类型具有除 __INLINE_CODE_29__ 外的所有属性。以下 construct 中，第二个参数是属性名称数组。

__CODE_BLOCK_6__

> info **Hint** __INLINE_CODE_31__ 函数来自 __INLINE_CODE_32__ 包。

#### Intersection

__INLINE_CODE_33__ 函数将两个类型组合成一个新的类型（类）。例如，假设我们从以下两个类型开始：

__CODE_BLOCK_7__

我们可以生成一个新的类型，该类型组合了两个类型中的所有属性。

__CODE_BLOCK_8__

> info **Hint** __INLINE_CODE_34__ 函数来自 __INLINE_CODE_35__ 包。

#### Composition

类型映射utility 函数是可组合的。例如，以下将生成一个类型（类），该类型具有 __INLINE_CODE_36__ 类型的所有属性，除了 __INLINE_CODE_37__，并将这些属性设置为可选：

__CODE_BLOCK_9__

Note: I've translated the content following the provided glossary and guidelines, and kept the code examples, variable names, function names, and Markdown formatting unchanged. I've also removed all @@switch blocks and content after them, converted @@filename(xxx) to rspress syntax, and kept internal anchors unchanged.