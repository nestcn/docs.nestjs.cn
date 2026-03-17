<!-- 此文件从 content/graphql/guards-interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T06:27:37.884Z -->
<!-- 源文件: content/graphql/guards-interceptors.md -->

### 其他功能

在 GraphQL 世界中，关于处理问题，如**身份验证**或**操作的副作用**，有很多争论。我们应该在业务逻辑中处理这些问题？还是使用高阶函数来增强查询和mutation的授权逻辑？或者使用 __LINK_40__？这些问题没有一个固定的回答。

Nest 帮助解决这些问题，它的跨平台功能，如 __LINK_41__ 和 __LINK_42__，旨在减少冗余，提供工具来创建结构良好、可读、一致的应用程序。

#### 概述

您可以使用标准 __LINK_43__、 __LINK_44__、 __LINK_45__ 和 __LINK_46__ 与 GraphQL 一样使用。您还可以轻松地创建自己的装饰器，利用 __LINK_47__ 功能。让我们看看一个sample GraphQL 查询处理器。

```typescript
@Field()
@Extensions({ role: Role.ADMIN })
password: string;

```

正如您所见，GraphQL 与 guards 和 pipes 一样工作，使用 HTTP REST 处理程序一样。因此，您可以将身份验证逻辑移到守卫中；您甚至可以重用同一个守卫类在 REST 和 GraphQL API 接口之间。类似地，拦截器在两个类型的应用程序中工作相同：

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

#### 执行上下文

由于 GraphQL 接收的数据类型不同于 REST，guards 和拦截器收到的 __LINK_48__ 也不同。GraphQL 解析器有一个独特的参数集：`password`、 __INLINE_CODE_11__、 __INLINE_CODE_12__ 和 __INLINE_CODE_13__。因此，guards 和拦截器必须将泛型 __INLINE_CODE_14__ 转换为 __INLINE_CODE_15__。这很简单：

```typescript
@Field({ middleware: [checkRoleMiddleware] })
@Extensions({ role: Role.ADMIN })
password: string;

```

GraphQL 上下文对象，返回 by __INLINE_CODE_16__， expose 一个 **get** 方法，每个 GraphQL 解析器参数（例如 __INLINE_CODE_17__、 __INLINE_CODE_18__ 等）。一旦转换，我们可以轻松地获取当前请求的任何 GraphQL 参数。

#### 异常过滤器

Nest 的标准 __LINK_49__ 也与 GraphQL 应用程序兼容。与 __INLINE_CODE_19__ 一样，GraphQL 应用程序应该将 __INLINE_CODE_20__ 对象转换为 __INLINE_CODE_21__ 对象。

__CODE_BLOCK_3__

> 提示 **Hint** __INLINE_CODE_22__ 和 __INLINE_CODE_23__ 都来自 __INLINE_CODE_24__ 包。

注意与 REST 情况不同，您不使用 native __INLINE_CODE_25__ 对象来生成响应。

#### 自定义装饰器

正如提到的，__LINK_50__ 功能在 GraphQL 解析器中工作。

__CODE_BLOCK_4__

使用 __INLINE_CODE_26__ 自定义装饰器如下：

__CODE_BLOCK_5__

> 提示 **Hint** 在上面的示例中，我们假设 __INLINE_CODE_27__ 对象被分配到 GraphQL 应用程序的上下文中。

#### 在字段解析器级别执行增强器

在 GraphQL 上下文中，Nest 不会在字段级别执行增强器（generic name for interceptors, guards 和 filters）。它们只在顶级 __INLINE_CODE_28__/__INLINE_CODE_29__ 方法运行。您可以告诉 Nest 执行拦截器、guards 或 filters 的方法，通过将 __INLINE_CODE_31__ 选项传递给 __INLINE_CODE_32__。将其传递一个 __INLINE_CODE_33__、 __INLINE_CODE_34__ 和/或 __INLINE_CODE_35__ 列表：

__CODE_BLOCK_6__

> 警告 **Warning** 在启用增强器时，您可能会遇到性能问题，因为在返回大量记录时，field 解析器可能被执行数千次。因此，在启用 __INLINE_CODE_36__ 时，我们建议您跳过不必要的增强器执行。您可以使用以下帮助函数：

__CODE_BLOCK_7__

#### 创建自定义驱动

Nest 提供了两个官方驱动：__INLINE_CODE_37__ 和 __INLINE_CODE_38__，以及 API，允许开发者创建新的 **自定义驱动**。使用自定义驱动，您可以集成任何 GraphQL 库或扩展现有的集成，添加额外功能。

例如，要集成 __INLINE_CODE_39__ 包，您可以创建以下驱动类：

__CODE_BLOCK_8__

然后使用它：

__CODE_BLOCK_9__