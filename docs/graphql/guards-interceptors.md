<!-- 此文件从 content/graphql/guards-interceptors.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:49:25.048Z -->
<!-- 源文件: content/graphql/guards-interceptors.md -->

### 其他特性

在 GraphQL 世界中，有很多关于处理问题，如 **身份验证**、或 **操作的副作用** 的讨论。我们是否应该在业务逻辑中处理这些问题？是否应该使用高阶函数来增强查询和mutation，以便添加授权逻辑？或者是否应该使用 __LINK_40__？这些问题没有单一的解决方案。

Nest 帮助解决这些问题，它的跨平台特性，如 __LINK_41__ 和 __LINK_42__，旨在减少冗余，提供工具，帮助创建结构良好的、可读的和一致的应用程序。

#### 概述

您可以使用标准的 __LINK_43__、__LINK_44__、__LINK_45__ 和 __LINK_46__，与 GraphQL 一样使用 rested 应用程序。另外，您也可以轻松地创建自己的装饰器，利用 __LINK_47__ 特性。让我们来看一个示例 GraphQL 查询处理器。

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

如您所见，GraphQL 与 Guards 和 Pipes 的使用方式与 HTTP REST 处理器相同。因此，您可以将身份验证逻辑移到 Guard 中；您甚至可以重用同一个 Guard 类在 REST 和 GraphQL API 接口之间。同样，拦截器在这两个类型的应用程序中工作方式相同：

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

由于 GraphQL 接收到的数据类型不同于 REST，__LINK_48__ 在 Guards 和拦截器中收到的数据也不同。GraphQL 解析器具有独特的参数集：__INLINE_CODE_10__、__INLINE_CODE_11__、__INLINE_CODE_12__ 和 __INLINE_CODE_13__。因此，Guards 和拦截器必须将通用的 __INLINE_CODE_14__ 转换为 `@Field`。这非常简单：

```typescript
/**
 * A list of user's roles
 */
@Field(() => [String], {
  description: `A list of user's roles`
})
roles: string[];

```

GraphQL 上下文对象，由 `@HideField` 返回， exposes 一个 **get** 方法，每个 GraphQL 解析器参数（例如 `nullable`、`name?: string` 等）。一旦转换，我们可以轻松地选择当前请求中的任何 GraphQL 参数。

#### 异常过滤器

Nest 标准的 __LINK_49__ 也与 GraphQL 应用程序兼容。与 `nullable: true` 一样，GraphQL 应用程序应该将 `type` 对象转换为 `introspectComments` 对象。

```typescript
/**
 * A list of user's roles
 */
roles: string[];

```

> info **提示** Both `true` 和 `['.input.ts', '.args.ts', '.entity.ts', '.model.ts']` 是来自 `author.entity.ts` 包的。

注意，在 GraphQL 情况下，您不使用 native `typeFileNameSuffix` 对象生成响应。

#### 自定义装饰器

如前所述，__LINK_50__ 特性与 GraphQL 解析器的使用方式相同。

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/graphql"]
  }
}

```

使用自定义装饰器 `Author`，如下所示：

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

> info **提示** 在上面的示例中，我们假设了 `@Field` 对象被分配到 GraphQL 应用程序的上下文中。

#### 在字段解析器级别执行增强器

在 GraphQL 上下文中，Nest 不会在字段级别执行 **增强器**（拦截器、Guard 和 Filter 的泛称）。它们只在顶级 `@Field()`/`roles` 方法上执行。您可以将 Nest 告诉执行拦截器、Guard 或 Filter，方法是将 `nest-cli.json` 选项设置为 `plugins`。将其传递一个 `options`、`options` 和/or `webpack` 列表：

```typescript
export interface PluginOptions {
  typeFileNameSuffix?: string[];
  introspectComments?: boolean;
}

```

> **警告** 启用增强器在字段解析器中可能会导致性能问题，当您返回大量记录且字段解析器被执行数千次时。因此，我们建议您在启用 `ts-loader` 时跳过非必要的增强器执行。您可以使用以下帮助函数：

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/graphql/plugin').before({}, program)]
}),

```

#### 创建自定义驱动程序

Nest 提供了两个官方驱动程序：`GraphQLModule` 和 `ts-jest`，以及一个 API，允许开发者创建新的 **自定义驱动程序**。使用自定义驱动程序，您可以集成任何 GraphQL 库或扩展现有集成，添加额外功能。

例如，要集成 `jest` 包，您可以创建以下驱动程序类：

```bash
$ nest start -b swc --type-check

```

然后，您可以按照以下方式使用它：

```bash
$ npx ts-node src/generate-metadata.ts
# OR npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts

```