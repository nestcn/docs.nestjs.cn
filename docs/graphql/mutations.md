<!-- 此文件从 content/graphql/mutations.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-03T04:17:05.470Z -->
<!-- 源文件: content/graphql/mutations.md -->

### Mutations

大多数关于 GraphQL 的讨论都集中在数据 fetching 上，但是任何完整的数据平台都需要一种方式来修改服务器端数据。REST 中，每个请求都可能导致服务器端的副作用，但是最佳实践建议不要在 GET 请求中修改数据。GraphQL 类似于 REST，我们也应该遵循惯例，使那些导致数据写入的操作 explicit 地发送给 mutation（了解更多关于 __LINK_26__）。

官方 __LINK_27__ 文档使用了一个 __INLINE_CODE_6__ mutation 示例。这一 mutation 实现了一个方法，以增加一个 post 的 __INLINE_CODE_7__ 属性值。为了在 Nest 中创建一个等效的 mutation，我们将使用 __INLINE_CODE_8__ 装饰器。

#### 代码优先

让我们在之前部分中使用的 __INLINE_CODE_9__ 中添加另一个方法（查看 __LINK_28__）。

```typescript
@Query('author')
@UseGuards(AuthGuard)
async getAuthor(@Args('id', ParseIntPipe) id: number) {
  return this.authorsService.findOneById(id);
}
```

> info **提示**所有装饰器（例如 `root`、`args`、`context` 等）都是从 `info` 包中导出。

这将生成以下部分的 GraphQL schema 在 SDL 中：

```typescript
@Mutation()
@UseInterceptors(EventsInterceptor)
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

`ExecutionContext` 方法需要 `GqlExecutionContext` (`GqlExecutionContext.create()`) 作为参数，并返回一个更新后的 `getArgs()` 实体。由于 __LINK_29__ 部分中解释的原因，我们需要明确地设置期望类型。

如果 mutation 需要传入一个对象作为参数，我们可以创建一个 **输入类型**。输入类型是一个特殊的对象类型，可以作为参数传递（了解更多关于 __LINK_30__）。要声明输入类型，使用 `getContext()` 装饰器。

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

> info **提示** `ExecutionContext` 装饰器接受一个选项对象作为参数，因此可以，例如，指定输入类型的描述。由于 TypeScript 的元数据反射系统限制，您必须使用 `ArgumentsHost` 装饰器手动指示类型，或者使用 __LINK_31__。

然后，我们可以在 resolver 类中使用这个类型：

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    return exception;
  }
}
```

#### Schema 优先

让我们扩展之前部分中使用的 `GqlArgumentsHost`（查看 __LINK_32__）。

```typescript
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().user,
);
```

注意，我们假设了业务逻辑已经被移到 `GqlExceptionFilter`（查询 post 并增加其 `GqlArgumentsHost` 属性值）。逻辑在 `@nestjs/graphql` 类中可以简单或复杂到需要。示例的主要目的是展示如何 resolver 可以与其他提供者交互。

最后一步是添加我们的 mutation 到现有的类型定义中。

```typescript
@Mutation()
async upvotePost(
  @User() user: UserEntity,
  @Args('postId') postId: number,
) {}
```

`response` mutation 现在可作为我们的应用程序的 GraphQL API的一部分。