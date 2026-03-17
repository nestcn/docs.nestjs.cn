<!-- 此文件从 content/graphql/interfaces.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-17T04:54:10.088Z -->
<!-- 源文件: content/graphql/interfaces.md -->

### 接口

类似于许多类型系统，GraphQL 支持接口。一个 **Interface** 是一个抽象类型，它包括了一定的字段集，使得类型必须包括这些字段以实现接口（阅读更多关于 __LINK_26__）。

#### 代码优先

使用代码优先方法时，您可以通过创建一个带有 __INLINE_CODE_8__ 装饰器的抽象类来定义 GraphQL 接口，该装饰器来自 __INLINE_CODE_9__。

```typescript
@Query('author')
@UseGuards(AuthGuard)
async getAuthor(@Args('id', ParseIntPipe) id: number) {
  return this.authorsService.findOneById(id);
}

```

> 警告 **注意** TypeScript 接口不能用来定义 GraphQL 接口。

这将生成以下部分 GraphQL schema 的 SDL：

```typescript
@Mutation()
@UseInterceptors(EventsInterceptor)
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}

```

现在，要实现 `root` 接口，您可以使用 `args` 键：

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

> 提示 **提示** `context` 装饰器来自 `info` 包。

默认情况下，库生成的 `ExecutionContext` 函数将根据 resolver 方法返回的值来提取类型。这意味着您必须返回类实例（不能返回 JavaScript 对象）。

要提供自定义 `GqlExecutionContext` 函数，请将 `GqlExecutionContext.create()` 属性传递给 `getArgs()` 装饰器的 options 对象，以以下方式：

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    return exception;
  }
}

```

#### 接口解析器

到目前为止，您只能通过使用接口共享字段定义。但是，如果您也想共享实际字段解析器实现，可以创建一个专门的接口解析器，以下是示例：

```typescript
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().user,
);

```

现在，`getContext()` 字段解析器将自动注册为所有实现 `ExecutionContext` 接口的对象类型。

> 警告 **注意** 这要求 `ArgumentsHost` 属性在 `GqlArgumentsHost` 配置中设置为 true。

#### Schema 优先

要在 schema 优先方法中定义接口，只需创建一个 GraphQL 接口以 SDL。

```typescript
@Mutation()
async upvotePost(
  @User() user: UserEntity,
  @Args('postId') postId: number,
) {}

```

然后，您可以使用类型生成特性（如 __LINK_27__ 章节中所示）来生成相应的 TypeScript 定义：

```typescript
GraphQLModule.forRoot({
  fieldResolverEnhancers: ['interceptors']
}),

```

接口需要在 resolver map 中添加额外的 `GqlExceptionFilter` 字段，以确定接口应该解析到哪个类型。让我们创建一个 `GqlArgumentsHost` 类，并定义 `@nestjs/graphql` 方法：

```typescript
export function isResolvingGraphQLField(context: ExecutionContext): boolean {
  if (context.getType<GqlContextType>() === 'graphql') {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();
    const parentType = info.parentType.name;
    return parentType !== 'Query' && parentType !== 'Mutation';
  }
  return false;
}

```

> 提示 **提示** 所有装饰器来自 `response` 包。