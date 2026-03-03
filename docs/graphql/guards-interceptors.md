<!-- 此文件从 content/graphql/guards-interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:17:57.063Z -->
<!-- 源文件: content/graphql/guards-interceptors.md -->

### 其他功能

在 GraphQL 世界中，人们经常会讨论一些问题，如**身份验证**或**操作的副作用**。是否应该在业务逻辑中处理这些问题？是否应该使用高阶函数来增强查询和mutation的授权逻辑？或者是否应该使用 __LINK_40__？这些问题没有单一的答案。

Nest 帮助解决这些问题，提供了跨平台的功能，如 __LINK_41__ 和 __LINK_42__。Nest 的哲学是减少冗余，提供工具来创建良好结构、可读性高、一致的应用程序。

#### 概述

您可以使用标准的 __LINK_43__, __LINK_44__, __LINK_45__ 和 __LINK_46__，与 GraphQL 一样使用它们。此外，您还可以轻松地创建自己的装饰器，利用 __LINK_47__ 功能来创建它们。让我们来看一个 GraphQL 查询处理器的示例。

```typescript
@ObjectType()
export class Author {
  @Field(type => ID)
  id: number;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(type => [Post])
  posts: Post[];
}
```

正如您所看到的，GraphQL 与 guards 和 pipes 在使用方面与 HTTP REST 处理器相同。因此，您可以将身份验证逻辑移到 guard 中；甚至可以在 REST 和 GraphQL API 接口中重用相同的 guard 类。类似地，拦截器在这两个类型的应用程序中工作方式相同：

```typescript
@ObjectType()
export class Author {
  @Field(type => ID)
  id: number;
  firstName?: string;
  lastName?: string;
  posts: Post[];
}
```

#### 执行上下文

由于 GraphQL 接收到不同类型的数据，因此 guards 和拦截器接收到的 __LINK_48__ 在 GraphQL 和 REST 中有所不同。GraphQL 解析器有一个独特的参数集：__INLINE_CODE_10__, __INLINE_CODE_11__, __INLINE_CODE_12__ 和 __INLINE_CODE_13__。因此，guards 和拦截器必须将泛型 __INLINE_CODE_14__ 转换为 `@Field`。这很简单：

```typescript
/**
 * A list of user's roles
 */
@Field(() => [String], {
  description: `A list of user's roles`
})
roles: string[];
```

GraphQL 上下文对象由 `@HideField` 返回， expose 一个 get 方法来获取每个 GraphQL 解析器参数（例如 `nullable` 和 `name?: string` 等）。一旦转换，我们可以轻松地选择当前请求的任何 GraphQL 参数。

#### 异常过滤器

Nest 的标准 __LINK_49__ 也可以与 GraphQL 应用程序一起使用。与 `nullable: true` 类似，GraphQL 应用程序应该将 `type` 对象转换为 `introspectComments` 对象。

```typescript
/**
 * A list of user's roles
 */
roles: string[];
```

> 提示 **Hint** `true` 和 `['.input.ts', '.args.ts', '.entity.ts', '.model.ts']` 都来自 `author.entity.ts` 包。

注意，在与 REST 的情况不同，您不能使用 native `typeFileNameSuffix` 对象来生成响应。

#### 自定义装饰器

如前所述，__LINK_50__ 功能在 GraphQL 解析器中工作。

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/graphql"]
  }
}
```

使用 `Author` 自定义装饰器如下：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/graphql",
        "options": {
          "typeFileNameSuffix": [".input.ts", ".args.ts"],
          "introspectComments": true
        }
      }
    ]
  }
}

```

> 提示 **Hint** 在上面的示例中，我们假设 `@Field` 对象已分配到 GraphQL 应用程序的上下文中。

#### 在字段解析器级别执行增强器

在 GraphQL 上下文中，Nest 不会在字段级别 __LINK_51__ 执行增强器。它们只能在顶级 `@Field()`/`roles` 方法上执行。您可以将 Nest 设置为在方法上执行拦截器、guards 或 filters，方法是将 `nest-cli.json` 选项传递给 `plugins`，并将其设置为 `options`, `options` 和/或 `webpack` 的列表：

```typescript
export interface PluginOptions {
  typeFileNameSuffix?: string[];
  introspectComments?: boolean;
}
```

> 警告 **Warning** 启用增强器对字段解析器可能会在返回大量记录时导致性能问题。因此，在启用 `ts-loader` 时，我们建议您跳过执行非必要的增强器。您可以使用以下助手函数来实现：

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/graphql/plugin').before({}, program)]
}),
```

#### 创建自定义驱动

Nest 提供了两个官方驱动：`GraphQLModule` 和 `ts-jest`，以及 API，允许开发者创建新的自定义驱动。使用自定义驱动，您可以集成任何 GraphQL 库或扩展现有的集成，添加额外功能。

例如，要集成 `jest` 包，您可以创建以下驱动类：

```bash
$ nest start -b swc --type-check
```

然后，您可以使用它：

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts
```