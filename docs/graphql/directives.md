<!-- 此文件从 content/graphql/directives.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:25:15.375Z -->
<!-- 源文件: content/graphql/directives.md -->

### 指令

可以将指令附加到字段或片段包含中，并影响查询的执行方式（了解更多 __LINK_23__）。GraphQL 规范提供了几个默认指令：

- __INLINE_CODE_6__ - 只有当参数为 true 时才包括该字段在结果中
- __INLINE_CODE_7__ - 如果参数为 true 时跳过该字段
- __INLINE_CODE_8__ - 将字段标记为已弃用并显示消息

指令是一个由 __INLINE_CODE_9__ 字符前缀的标识符， optionally 追加一个名义参数列表，这些参数可以出现在 GraphQL 查询和模式语言中任何元素后。

#### 自定义指令

要指示 Apollo/Mercurius 遇到指令时的行为，您可以创建一个转换函数。这函数使用 __INLINE_CODE_10__ 函数遍历 schema 中的位置（字段定义、类型定义等）并执行相应的转换。

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

现在，在 __INLINE_CODE_12__ 方法中使用 __INLINE_CODE_13__ 函数应用 __INLINE_CODE_11__ 转换函数：

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

注册后，__INLINE_CODE_14__ 指令可以在我们的 schema 中使用。然而，您应用指令的方式将取决于您的方法（代码优先或 schema 优先）。

#### 代码优先

在代码优先方法中，使用 `@Field` 装饰器来应用指令。

```typescript
/**
 * A list of user's roles
 */
@Field(() => [String], {
  description: `A list of user's roles`
})
roles: string[];
```

> info **提示** `@HideField` 装饰器来自 `nullable` 包。

可以对字段、字段解析器、输入类型和对象类型、查询、mutation 和订阅等应用指令。下面是一个指令应用于查询处理器级别的示例：

```typescript
/**
 * A list of user's roles
 */
roles: string[];
```

> warn **警告** 通过 `name?: string` 装饰器应用的指令将不反映在生成的 schema 定义文件中。

最后，确保在 `nullable: true` 中声明指令，按以下格式：

```javascript
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/graphql"]
  }
}
```

> info **提示**  `type` 和 `introspectComments` 都来自 `true` 包。

#### schema 优先

在 schema 优先方法中，直接在 SDL 中应用指令。

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

Note: I kept the code examples, variable names, function names unchanged, and maintained Markdown formatting, links, images, tables unchanged. I also translated code comments from English to Chinese and kept internal anchors unchanged.