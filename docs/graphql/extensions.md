<!-- 此文件从 content/graphql/extensions.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T05:01:37.699Z -->
<!-- 源文件: content/graphql/extensions.md -->

### 扩展

> 警告 **警告** 本章仅适用于代码优先 approach。

扩展是**高级、底层特性**，允许您在类型配置中定义任意数据。将自定义元数据附加到特定字段以创建更加复杂、通用的解决方案。例如，以扩展，您可以定义字段级别的角色，以便在运行时确定调用者是否具有访问特定字段的足够权限。

#### 添加自定义元数据

要将自定义元数据附加到字段，请使用来自 `@nestjs/graphql` 包的 `@Extensions()` 装饰器。

```typescript
@Field()
@Extensions({ role: Role.ADMIN })
password: string;

```

在上面的示例中，我们将 `role` 元数据属性分配给 `Role.ADMIN` 值。 `Role` 是一个简单的 TypeScript 枚举，组合了我们的系统中所有可用的用户角色。

请注意，除了在字段级别设置元数据外，您还可以使用 `@Extensions()` 装饰器在类级别和方法级别（例如，在查询处理程序中）。

#### 使用自定义元数据

使用自定义元数据的逻辑可以变得尽可能复杂。例如，您可以创建一个简单的拦截器，以便在方法调用时存储/记录事件，或者一个 [field middleware](/graphql/field-middleware)，该链接将需要访问字段的角色与调用者的权限（字段级别权限系统）进行匹配。

为了演示的目的，让我们定义一个 `checkRoleMiddleware`，用于比较用户角色的（在这里硬编码）与访问目标字段所需的角色：

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

在这里，我们可以注册一个 `password` 字段的中间件，以下是注册方式：

```typescript
@Field({ middleware: [checkRoleMiddleware] })
@Extensions({ role: Role.ADMIN })
password: string;

```