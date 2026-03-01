<!-- 此文件从 content/graphql/mutations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-01T04:24:20.757Z -->
<!-- 源文件: content/graphql/mutations.md -->

### 变更

大多数 GraphQL 讨论都集中在数据 fetching 上，但是任何完整的数据平台都需要一种修改服务器端数据的方式。在 REST 中，任何请求都可能导致服务器端的副作用，但最佳实践建议我们 shouldn't 在 GET 请求中修改数据。GraphQL 类似 - 技术上任何查询都可以实现数据写入。然而，就像 REST 一样，我们建议遵循惯例，即将导致写入的操作发送到明确的变更请求中（阅读更多 __LINK_26__）。

官方 __LINK_27__ 文档使用了一个 __INLINE_CODE_6__ 变更请求示例。这一个变更请求实现了一个方法，用于增加文章的 __INLINE_CODE_7__ 属性值。在 Nest 中，我们将使用 __INLINE_CODE_8__ 装饰器来创建等效的变更请求。

#### 代码优先

让我们添加另一个方法到之前章节中使用的 __INLINE_CODE_9__ 中（见 __LINK_28__）。

```typescript
@Query('author')
@UseGuards(AuthGuard)
async getAuthor(@Args('id', ParseIntPipe) id: number) {
  return this.authorsService.findOneById(id);
}
```

> info **提示**所有装饰器（例如 `root`、`args`、`context` 等）都来自 `info` 包。

这将生成以下 GraphQL_SCHEMA 部分在 SDL 中：

```typescript
@Mutation()
@UseInterceptors(EventsInterceptor)
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

`ExecutionContext` 方法需要 `GqlExecutionContext` (`GqlExecutionContext.create()`) 作为参数，并返回一个更新后的 `getArgs()` 实体。正如 __LINK_29__ 章节中解释的，我们需要明确地设置期望类型。

如果变更请求需要使用对象作为参数，我们可以创建一个 **输入类型**。输入类型是一个特殊的对象类型，可以作为参数传递（阅读更多 __LINK_30__）。要声明输入类型，使用 `getContext()` 装饰器。

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    return true;
  }
}
```

> info **提示** `ExecutionContext` 装饰器接受一个 options 对象作为参数，因此可以指定输入类型的描述。注意，由于 TypeScript 的元数据反射系统限制，您必须么使用 `ArgumentsHost` 装饰器手动指示类型，或者使用 __LINK_31__。

然后，我们可以在解析器类中使用这个类型：

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    return exception;
  }
}
```

####Schema 优先

让我们扩展之前章节中使用的 `GqlArgumentsHost`（见 __LINK_32__）。

```typescript
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().user,
);
```

注意，我们之前假设了业务逻辑已经被移到 `GqlExceptionFilter`（查询文章并增加其 `GqlArgumentsHost` 属性值）中。逻辑在 `@nestjs/graphql` 类中可以简单或复杂到需要。示例的主要目的是展示解析器如何与其他提供者交互。

最后一步是将我们的变更请求添加到现有类型定义中。

```typescript
@Mutation()
async upvotePost(
  @User() user: UserEntity,
  @Args('postId') postId: number,
) {}
```

`response` 变更请求现在可以作为我们的应用程序的 GraphQL API 一部分被调用。