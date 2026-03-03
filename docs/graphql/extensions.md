### 扩展功能

:::warning 警告
本章仅适用于代码优先方法。
:::

扩展是一项**高级底层特性** ，允许您在类型配置中定义任意数据。通过为特定字段附加自定义元数据，您可以创建更复杂、通用的解决方案。例如，借助扩展功能，您可以定义访问特定字段所需的字段级角色。这些角色可在运行时反映，以确定调用者是否具备检索特定字段的足够权限。

#### 添加自定义元数据

要为字段附加自定义元数据，请使用从 `@nestjs/graphql` 包导出的 `@Extensions()` 装饰器。

```typescript
@Field()
@Extensions({ role: Role.ADMIN })
password: string;
```

在上面的示例中，我们将 `role` 元数据属性赋值为 `Role.ADMIN`。`Role` 是一个简单的 TypeScript 枚举，用于分组系统中所有可用的用户角色。

注意，除了在字段上设置元数据外，您还可以在类级别和方法级别（例如查询处理程序上）使用 `@Extensions()` 装饰器。

#### 使用自定义元数据

利用自定义元数据的逻辑可以根据需要变得非常复杂。例如，您可以创建一个简单的拦截器来存储/记录每次方法调用的事件，或者创建一个[字段中间件](/graphql/field-middleware)来匹配检索字段所需的角色与调用者权限（字段级权限系统）。

出于演示目的，我们定义一个 `checkRoleMiddleware` 中间件，用于比较用户角色（此处硬编码）与访问目标字段所需的角色：

```typescript
export const checkRoleMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn
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
      `User does not have sufficient permissions to access "${info.fieldName}" field.`
    );
  }
  return next();
};
```

完成上述定义后，我们可以为 `password` 字段注册中间件，如下所示：

```typescript
@Field({ middleware: [checkRoleMiddleware] })
@Extensions({ role: Role.ADMIN })
password: string;
```
