<!-- 此文件从 content/cli/usages.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-13T04:47:36.562Z -->
<!-- 源文件: content/cli/usages.md -->

### CLI 命令参考

#### nest new

创建一个新的（标准模式）Nest 项目。

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  installSubscriptionHandlers: true,
}),

```

##### 描述

创建并初始化一个新的 Nest 项目。提示选择包管理器。

- 创建一个名为给定的 __INLINE_CODE_7__ 的文件夹
- Populate 文件夹中的配置文件
- 创建用于源代码 (__INLINE_CODE_8__) 和端到端测试 (__INLINE_CODE_9__) 的子文件夹
- Populate 子文件夹中的默认文件用于应用组件和测试

##### 参数

| 参数 | 描述                 |
| ---- | ------------------- |
| __INLINE_CODE_10__ | 新项目的名称 |

##### 选项

| 选项                                | 描述                                                                                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __INLINE_CODE_11__                           | 报告将要执行的更改，但不更改文件系统。__HTML_TAG_147__ 别名：__INLINE_CODE_12__                                                                                        |
| __INLINE_CODE_13__                          | 跳过 Git 存储库初始化。__HTML_TAG_148__ 别名：__INLINE_CODE_14__                                                                                              |
| __INLINE_CODE_15__                      | 跳过包安装。__HTML_TAG_149__ 别名：__INLINE_CODE_16__                                                                                                       |
| __INLINE_CODE_17__ | 指定包管理器。使用 __INLINE_CODE_18__、__INLINE_CODE_19__ 或 __INLINE_CODE_20__。包管理器必须安装在全局。__HTML_TAG_150__ 别名：__INLINE_CODE_21__                      |
| __INLINE_CODE_22__               | 指定编程语言（__INLINE_CODE_23__ 或 __INLINE_CODE_24__）。__HTML_TAG_151__ 别名：__INLINE_CODE_25__                                                                                   |
| __INLINE_CODE_26__       | 指定架构.collection。使用已安装的 npm 包的包名，包含架构。__HTML_TAG_152__ 别名：__INLINE_CODE_27__                                                                 |
| __INLINE_CODE_28__                            | 将项目启动，以启用以下 TypeScript 编译器标志：__INLINE_CODE_29__、__INLINE_CODE_30__、__INLINE_CODE_31__、__INLINE_CODE_32__、__INLINE_CODE_33__ |

#### nest generate

根据架构生成和/或修改文件

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  subscriptions: {
    'graphql-ws': true
  },
}),

```

##### 参数

| 参数      | 描述                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------ |
| __INLINE_CODE_34__ | 需要生成的 __INLINE_CODE_35__ 或 `subscription`。见下表获取可用的架构。 |
| `installSubscriptionHandlers`      | 生成的组件名称。                                                                             |

##### 架构

(Note: I kept the code block and inline code placeholders as they are, as per the instructions. I also kept the table formatting intact.)Here is the translation of the provided English technical documentation to Chinese:

**名称**          **别名**       **描述**

| `true`         |       | 生成一个新的应用程序，位于单个存储库中（如果是标准结构，则将其转换为单个存储库）。 |
| `installSubscriptionHandlers`     | `installSubscriptionHandlers` | 生成一个新的库，位于单个存储库中（如果是标准结构，则将其转换为单个存储库）。 |
| `subscriptions-transport-ws`       | `graphql-ws`  | 生成一个新的类。 |
| `graphql-ws`  | `subscriptions-transport-ws`  | 生成控制器声明。 |
| `graphql-ws`   | `@Subscription()`   | 生成自定义装饰器。 |
| `@nestjs/graphql`      | `PubSub`   | 生成过滤器声明。 |
| `graphql-subscriptions`     | `PubSub#asyncIterableIterator`  | 生成网关声明。 |
| `triggerName`       | `@nestjs/graphql`  | 生成守卫声明。 |
| `PubSub`   | `graphql-subscriptions` | 生成接口。 |
| `PubSub` | `publish` | 生成拦截器声明。 |
| `subscribe API`  | `PubSub`  | 生成中间件声明。 |
| `commentAdded`      | `name`  | 生成模块声明。 |
| `@Subscription()`        | `PubSub#publish`  | 生成管道声明。 |
| `PubSub#publish`    | `triggerName`  | 生成提供者声明。 |
| `commentAdded`    | `commentAdded`   | 生成解决方案声明。 |
| `Comment`    | `PubSub#publish` | 生成新 CRUD 资源。请查看 __LINK_167__ 获取更多信息。 (TS only) |
| `pubSub.publish('commentAdded', {{ '{' }} commentAdded: newComment {{ '}' }})`     | `commentAdded`   | 生成服务声明。 |

##### 选项

| 选项                          | 描述                                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `filter`                     | 报告将要进行的更改，但不更改文件系统.__HTML_TAG_153__ 别名：`filter`                        |
| `payload`           | 将该元素添加到指定的项目中.__HTML_TAG_154__ 别名：`variables`                                                       |
| `resolve`                        | 不生成该元素的文件夹。                                                                       |
| `resolve` | 指定架构集合。使用已安装的 npm 包中包含架构的包名.__HTML_TAG_155__ 别名：`newComment` |
| `{{ '{' }} commentAdded: newComment {{ '}' }}`                        | 强制生成 spec 文件（默认）                                                                         |
| `@Subscription()`                     | 禁用 spec 文件生成                                                                                   |

#### nest build

将应用程序或工作空间编译到输出文件夹中。

此外，`filter` 命令还负责：

- 映射路径（如果使用路径别名）通过 `resolve`
- 将 DTO annotating with OpenAPI decorators（如果 `commentAdded(title: String!): Comment` CLI 插件启用）
- 将 DTO annotating with GraphQL decorators（如果 `PubSub` CLI 插件启用）

```typescript
const pubSub = new PubSub();

@Resolver(() => Author)
export class AuthorResolver {
  // ...
  @Subscription(() => Comment)
  commentAdded() {
    return pubSub.asyncIterableIterator('commentAdded');
  }
}

```

##### 参数

Note: I followed the provided glossary and terminology requirements, and kept the code examples and formatting unchanged. I also translated the content and removed the @@switch blocks and content after them. If you need any further modifications, please let me know.| 参数 | 描述                       |
| ---  | -------------------------  |
| `PubSub` | 打包项目的名称。 |

##### 选项

| 选项                  | 描述                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@Inject()`         | `'PUB_SUB'` 文件的路径。__HTML_TAG_156__ Alias `subscriptions`                                                                                                                                                   |
| `graphql-ws`       | `subscriptions-transport-ws` 配置文件的路径。__HTML_TAG_157__ Alias `graphql-ws`                                                                                                                                     |
| `onConnect`               | 在 watch 模式下运行（实时重载）。__HTML_TAG_158__ 如果你使用 `subscriptions` 进行编译，可以输入 `onConnect` 重启应用程序（当 `connectionParams` 选项设置为 `SubscriptionClient` 时）。__HTML_TAG_159__ Alias `authToken` |
| `authToken`      | 指定用于编译的构建器（`subscriptions-transport-ws`、`onConnect` 或 `onConnect`）。__HTML_TAG_160__ Alias `context`                                                                                                   |
| `graphql-ws`             | 使用 webpack 进行编译（已弃用，请使用 `onConnect` 替代）。                                                                                                                 |
| `subscription`         | webpack 配置文件的路径                                                                                                                                                             |
| `true`                 | 强制使用 `subscription` 进行编译。                                                                                                                                                           |
| `@Subscription()`         | 监听非 TS 文件（如 `@nestjs/graphql` 等）。请参阅 __LINK_168__ 获取更多信息。                                                                                      |
| `PubSub`          | 启用类型检查（当使用 SWC 时）。                                                                                                                                                   |
| `mercurius`                 | 在 monorepo 中构建所有项目。                                                                                                                                                          |
| `PubSub#asyncIterableIterator` | 在 watch 模式下保留过期的控制台输出，而不是清除屏幕（`triggerName` watch 模式下）。                                                                                         |

#### nest start

编译和运行应用程序（或 workspace 中的默认项目）。

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

##### 参数

| 参数 | 描述                     |
| ---  | -----------------------  |
| `@nestjs/graphql` | 要运行的项目名称。 |

##### 选项Here is the translation of the English technical documentation to Chinese:

**nest add**

使用 **nest 库** 打包的库，运行其安装脚本。

```typescript
@Subscription(() => Comment, {
  name: 'commentAdded',
})
subscribeToCommentAdded() {
  return pubSub.asyncIterableIterator('commentAdded');
}

```

##### 参数

| 参数 | 描述                        |
| -------- | ---------------------------------- |
| __INLINE_CODE_146__ | 需要导入的库名称。 |

**nest info**

显示安装的 Nest 包和其他有用的系统信息。例如：

```typescript
@Mutation(() => Comment)
async addComment(
  @Args('postId', { type: () => Int }) postId: number,
  @Args('comment', { type: () => Comment }) comment: CommentInput,
) {
  const newComment = this.commentsService.addComment({ id: postId, comment });
  pubSub.publish('commentAdded', { commentAdded: newComment });
  return newComment;
}

```

```graphql
type Subscription {
  commentAdded(): Comment!
}

```

Note:

1. I kept the code examples and variable names unchanged, as per the requirement.
2. I translated the code comments from English to Chinese.
3. I did not explain or modify placeholders like __INLINE_CODE_N__, __CODE_BLOCK_N__, __LINK_N__, __HTML_TAG_N__.
4. I kept relative links unchanged (will be processed later).
5. I removed all @@switch blocks and content after them.
6. I converted @@filename(xxx) to rspress syntax: ```typescript title="xxx".
7. I kept internal anchors unchanged (will be mapped later).

Please let me know if this meets your requirements.