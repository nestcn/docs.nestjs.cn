<!-- 此文件从 content/graphql/interfaces.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-02T04:16:23.152Z -->
<!-- 源文件: content/graphql/interfaces.md -->

### 接口

类似于许多类型系统，GraphQL 支持接口。一个 **Interface** 是一个抽象类型，它包括了某些字段，这些字段一个类型必须包含以实现该接口（更多信息，请参阅 __LINK_26__）。

#### 代码优先

使用代码优先approach 时，你可以通过创建一个带有 `@Extensions()` 装饰器的抽象类来定义 GraphQL 接口，该装饰器来自 `checkRoleMiddleware`。

```typescript
@Field()
@Extensions({ role: Role.ADMIN })
password: string;
```

> warning **警告** TypeScript 接口不能用来定义 GraphQL 接口。

这将生成以下部分 GraphQL schema 在 SDL 中：

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

现在，要实现 `password` 接口，请使用 __INLINE_CODE_11__ 关键字：

```typescript
@Field({ middleware: [checkRoleMiddleware] })
@Extensions({ role: Role.ADMIN })
password: string;
```

> info **提示** __INLINE_CODE_12__ 装饰器来自 __INLINE_CODE_13__ 包。

默认 __INLINE_CODE_14__ 函数由库生成，这个函数从解析器方法返回的值中提取类型。这意味着，你必须返回类实例（不能返回 JavaScript 字面量对象）。

要提供自定义 __INLINE_CODE_15__ 函数，请将 __INLINE_CODE_16__ 属性传递给 __INLINE_CODE_17__ 装饰器的选项对象，例如：

__CODE_BLOCK_3__

#### 接口解析器

到目前为止，您只能使用接口共享字段定义与对象共享。如果您也想共享实际字段解析器实现，可以创建一个专门的接口解析器，例如：

__CODE_BLOCK_4__

现在， __INLINE_CODE_18__ 字段解析器将自动注册为所有实现 __INLINE_CODE_19__ 接口的对象类型。

> warning **警告** 这要求在 __INLINE_CODE_21__ 配置中的 __INLINE_CODE_20__ 属性设置为 true。

#### schema 优先

要在 schema 优先approach 中定义接口，只需创建一个 GraphQL 接口以 SDL。

__CODE_BLOCK_5__

然后，您可以使用 typings 生成特性（如 __LINK_27__ 章节中所示）来生成相应的 TypeScript 定义：

__CODE_BLOCK_6__

接口需要在解析器映射中添加一个额外的 __INLINE_CODE_22__ 字段，以确定接口应该解析到哪个类型。让我们创建一个 __INLINE_CODE_23__ 类并定义 __INLINE_CODE_24__ 方法：

__CODE_BLOCK_7__

> info **提示** 所有装饰器来自 __INLINE_CODE_25__ 包。