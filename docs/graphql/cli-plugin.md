### CLI 插件

> warning **警告** 本章仅适用于代码优先方法。

TypeScript 的元数据反射系统有几个限制，例如无法确定类由哪些属性组成或识别给定属性是可选的还是必需的。但是，其中一些约束可以在编译时解决。Nest 提供了一个插件，可以增强 TypeScript 编译过程，以减少所需的样板代码量。

> info **提示** 此插件是**可选的**。如果您愿意，可以手动声明所有装饰器，或仅在需要的地方声明特定装饰器。

#### 概述

GraphQL 插件将自动：

- 用 `@Field` 注释所有输入对象、对象类型和参数类属性，除非使用了 `@HideField`
- 根据问号设置 `nullable` 属性（例如 `name?: string` 将设置 `nullable: true`）
- 根据类型设置 `type` 属性（也支持数组）
- 根据注释为属性生成描述（如果 `introspectComments` 设置为 `true`）

请注意，您的文件名**必须具有**以下后缀之一，以便插件分析：`['.input.ts', '.args.ts', '.entity.ts', '.model.ts']`（例如 `author.entity.ts`）。如果您使用不同的后缀，可以通过指定 `typeFileNameSuffix` 选项来调整插件的行为（见下文）。

根据我们目前所学的内容，您必须复制大量代码才能让包知道您的类型应该如何在 GraphQL 中声明。例如，您可以定义一个简单的 `Author` 类如下：

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

虽然对于中型项目来说这不是一个大问题，但一旦您有大量类，它就会变得冗长且难以维护。

通过启用 GraphQL 插件，上述类定义可以简单地声明为：

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

插件根据**抽象语法树**动态添加适当的装饰器。因此，您不必为分散在代码中的 `@Field` 装饰器而烦恼。

> info **提示** 插件将自动生成任何缺失的 GraphQL 属性，但如果您需要覆盖它们，只需通过 `@Field()` 显式设置它们。

#### 注释内省

启用注释内省功能后，CLI 插件将根据注释为字段生成描述。

例如，给定一个示例 `roles` 属性：

```typescript
/**
 * A list of user's roles
 */
@Field(() => [String], {
  description: `A list of user's roles`
})
roles: string[];
```

您必须复制描述值。启用 `introspectComments` 后，CLI 插件可以提取这些注释并自动为属性提供描述。现在，上述字段可以简单地声明如下：

```typescript
/**
 * A list of user's roles
 */
roles: string[];
```

#### 使用 CLI 插件

要启用插件，请打开 `nest-cli.json`（如果您使用 [Nest CLI](/cli/overview)）并添加以下 `plugins` 配置：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/graphql"]
  }
}
```

您可以使用 `options` 属性自定义插件的行为。

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

`options` 属性必须满足以下接口：

```typescript
export interface PluginOptions {
  typeFileNameSuffix?: string[];
  introspectComments?: boolean;
}
```

<table>
  <tr>
    <th>选项</th>
    <th>默认值</th>
    <th>描述</th>
  </tr>
  <tr>
    <td><code>typeFileNameSuffix</code></td>
    <td><code>['.input.ts', '.args.ts', '.entity.ts', '.model.ts']</code></td>
    <td>GraphQL 类型文件后缀</td>
  </tr>
  <tr>
    <td><code>introspectComments</code></td>
      <td><code>false</code></td>
      <td>如果设置为 true，插件将根据注释为属性生成描述</td>
  </tr>
</table>

如果您不使用 CLI 而是有自定义 `webpack` 配置，您可以将此插件与 `ts-loader` 结合使用：

```javascript
getCustomTransformers: (program: any) => ({
  before: [require('@nestjs/graphql/plugin').before({}, program)]
}),
```

#### SWC 构建器

对于标准设置（非 monorepo），要将 CLI 插件与 SWC 构建器一起使用，您需要启用类型检查，如[此处](/recipes/swc#type-checking)所述。

```bash
$ nest start -b swc --type-check
```

对于 monorepo 设置，请按照[此处](/recipes/swc#monorepo-and-cli-plugins)的说明操作。

```bash
$ npx ts-node src/generate-metadata.ts
# 或 npx ts-node apps/{YOUR_APP}/src/generate-metadata.ts
```

现在，序列化的元数据文件必须由 `GraphQLModule` 方法加载，如下所示：

```typescript
import metadata from './metadata'; // <-- 由 "PluginMetadataGenerator" 自动生成的文件

GraphQLModule.forRoot<...>({
  ..., // 其他选项
  metadata,
}),
```

#### 与 `ts-jest` 集成（e2e 测试）

在启用此插件的情况下运行 e2e 测试时，您可能会遇到编译模式的问题。例如，最常见的错误之一是：

```json
Object type <name> must define one or more fields.
```

这是因为 `jest` 配置没有在任何地方导入 `@nestjs/graphql/plugin` 插件。

要解决此问题，请在您的 e2e 测试目录中创建以下文件：

```javascript
const transformer = require('@nestjs/graphql/plugin');

module.exports.name = 'nestjs-graphql-transformer';
// 您应该在每次更改以下配置时更改版本号 - 否则，jest 将不会检测到更改
module.exports.version = 1;

module.exports.factory = (cs) => {
  return transformer.before(
    {
      // @nestjs/graphql/plugin 选项（可以为空）
    },
    cs.program, // 对于旧版本的 Jest (<= v27)，使用 "cs.tsCompiler.program"
  );
};
```

有了这些，在您的 `jest` 配置文件中导入 AST 转换器。默认情况下（在入门应用程序中），e2e 测试配置文件位于 `test` 文件夹下，名为 `jest-e2e.json`。

```json
{
  ... // 其他配置
  "globals": {
    "ts-jest": {
      "astTransformers": {
        "before": ["<上面创建的文件的路径>"]
      }
    }
  }
}
```

如果您使用 `jest@^29`，请使用以下代码片段，因为以前的方法已被弃用。

```json
{
  ... // 其他配置
  "transform": {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        "astTransformers": {
          "before": ["<上面创建的文件的路径>"]
        }
      }
    ]
  }
}
```
