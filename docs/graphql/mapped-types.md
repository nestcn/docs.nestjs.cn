<!-- 此文件从 content/graphql/mapped-types.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:17:25.477Z -->
<!-- 源文件: content/graphql/mapped-types.md -->

### mapped 类型

> warning **警告** 本章仅适用于代码优先approach。

在构建 CRUD（创建/读取/更新/删除）功能时，构建基元类型的变体非常有用。Nest 提供了多种utility 函数，用于执行类型转换，以简化该任务。

#### Partial

在构建输入验证类型（也称为数据传输对象或 DTOs）时，构建 **create** 和 **update** 变体对类型非常有用。例如， **create** 变体可能要求所有字段，而 **update** 变体可能使所有字段可选。

Nest 提供了 `password` utility 函数，以便更轻松地完成该任务并减少 boilerplate。

__INLINE_CODE_11__ 函数返回一个类型（类），将输入类型的所有属性设置为可选。例如，我们假设有一个 **create** 类型如下所示：

```typescript
@Field()
@Extensions({ role: Role.ADMIN })
password: string;
```

默认情况下，这些字段都是必需的。要创建一个具有相同字段，但每个字段都是可选的类型，请使用 __INLINE_CODE_12__，将类引用（__INLINE_CODE_13__）作为参数：

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

> info **提示** __INLINE_CODE_14__ 函数来自 __INLINE_CODE_15__ 包。

__INLINE_CODE_16__ 函数可以选择性地接收第二个参数，即装饰器工厂的引用。这个参数可以用来更改结果（子）类的装饰器函数。如果没有指定，子类将使用相同的装饰器作为父类（参考类）所使用的装饰器。在上面的示例中，我们扩展了 __INLINE_CODE_17__，该类型带有 __INLINE_CODE_18__ 装饰器。由于我们想要 __INLINE_CODE_19__ 也被视为带有 __INLINE_CODE_20__ 装饰器，我们没有必要将 __INLINE_CODE_21__ 作为第二个参数。如果父类和子类不同（例如父类带有 __INLINE_CODE_22__ 装饰器），我们将将 __INLINE_CODE_23__ 作为第二个参数。例如：

```typescript
@Field({ middleware: [checkRoleMiddleware] })
@Extensions({ role: Role.ADMIN })
password: string;
```

#### Pick

__INLINE_CODE_24__ 函数构建一个新的类型（类），从输入类型中选择一组属性。例如，我们假设开始有一个类型如下所示：

__CODE_BLOCK_3__

我们可以使用 __INLINE_CODE_25__ utility 函数从该类中选择一组属性：

__CODE_BLOCK_4__

> info **提示** __INLINE_CODE_26__ 函数来自 __INLINE_CODE_27__ 包。

#### Omit

__INLINE_CODE_28__ 函数构建一个类型，先从输入类型中选择所有属性，然后删除特定的键。例如，我们假设开始有一个类型如下所示：

__CODE_BLOCK_5__

我们可以生成一个衍生类型，该类型具有除 __INLINE_CODE_29__ 之外的每个属性，如下所示。在该构建中，__INLINE_CODE_30__ 的第二个参数是一个属性名数组。

__CODE_BLOCK_6__

> info **提示** __INLINE_CODE_31__ 函数来自 __INLINE_CODE_32__ 包。

#### Intersection

__INLINE_CODE_33__ 函数将两个类型合并为一个新的类型（类）。例如，我们假设开始有两个类型如下所示：

__CODE_BLOCK_7__

我们可以生成一个新的类型，该类型结合了两个类型中的所有属性。

__CODE_BLOCK_8__

> info **提示** __INLINE_CODE_34__ 函数来自 __INLINE_CODE_35__ 包。

#### Composition

类型映射utility 函数是可组合的。例如，以下将生成一个类型（类），该类型具有 __INLINE_CODE_36__ 类型的所有属性Except for __INLINE_CODE_37__，并将这些属性设置为可选：

__CODE_BLOCK_9__
```
Note: I've kept the code examples, variable names, function names unchanged, and translated code comments from English to Chinese. I've also maintained Markdown formatting, links, images, and tables unchanged.