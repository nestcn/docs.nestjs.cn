### 其他功能

在 GraphQL 领域，关于如何处理**身份验证**或操作**副作用**等问题存在诸多争议。我们应该在业务逻辑内部处理这些问题吗？应该使用高阶函数来增强带有授权逻辑的查询和变更吗？还是应该使用[模式指令](https://www.apollographql.com/docs/apollo-server/schema/directives/) ？这些问题并没有放之四海而皆准的单一答案。

Nest 通过其跨平台功能如[守卫](/guards)和[拦截器](/interceptors)帮助解决这些问题。其核心理念是减少冗余，并提供有助于创建结构良好、可读性强且一致性高的应用程序的工具。

#### 概述

您可以像在任何 RESTful 应用中使用标准[守卫](/guards) 、 [拦截器](/interceptors) 、 [过滤器](/exception-filters)和[管道](/pipes)那样，在 GraphQL 中以相同方式使用它们。此外，通过利用[自定义装饰器](/custom-decorators)功能，您可以轻松创建自己的装饰器。让我们看一个示例 GraphQL 查询处理程序。

```typescript
@Query('author')
@UseGuards(AuthGuard)
async getAuthor(@Args('id', ParseIntPipe) id: number) {
  return this.authorsService.findOneById(id);
}
```

如你所见，GraphQL 以与 HTTP REST 处理器相同的方式同时支持守卫（guards）和管道（pipes）。正因如此，你可以将认证逻辑移至守卫中，甚至可以在 REST 和 GraphQL 两种 API 接口中复用同一个守卫类。同理，拦截器（interceptors）在这两类应用中的工作方式也完全一致：

```typescript
@Mutation()
@UseInterceptors(EventsInterceptor)
async upvotePost(@Args('postId') postId: number) {
  return this.postsService.upvoteById({ id: postId });
}
```

#### 执行上下文

由于 GraphQL 接收的请求数据类型不同，守卫和拦截器获取的[执行上下文](../fundamentals/execution-context)与 REST 存在差异。GraphQL 解析器具有一组独特参数：`root`、`args`、`context` 和 `info`。因此守卫和拦截器需要将通用 `ExecutionContext` 转换为 `GqlExecutionContext`，转换过程非常简单：

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

通过 `GqlExecutionContext.create()` 返回的 GraphQL 上下文对象，为每个解析器参数提供了 **get** 方法（例如 `getArgs()`、`getContext()` 等）。完成转换后，我们就能轻松提取当前请求中的任意 GraphQL 参数。

#### 异常过滤器

Nest 标准的[异常过滤器](/exception-filters)同样兼容 GraphQL 应用。与 `ExecutionContext` 类似，GraphQL 应用需要将 `ArgumentsHost` 对象转换为 `GqlArgumentsHost` 对象。

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    return exception;
  }
}
```

:::info 注意
`GqlExceptionFilter` 和 `GqlArgumentsHost` 都是从 `@nestjs/graphql` 包导入的。
:::


请注意与 REST 不同，这里不使用原生的 `response` 对象来生成响应。

#### 自定义装饰器

如前所述， [自定义装饰器](/custom-decorators)功能在 GraphQL 解析器中按预期工作。

```typescript
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().user
);
```

按如下方式使用 `@User()` 自定义装饰器：

```typescript
@Mutation()
async upvotePost(
  @User() user: UserEntity,
  @Args('postId') postId: number,
) {}
```

:::info 提示
在上例中，我们假设 `user` 对象已分配给你的 GraphQL 应用程序上下文。
:::



#### 在字段解析器级别执行增强器

在 GraphQL 上下文中，Nest 不会在字段级别运行**增强器** （拦截器、守卫和过滤器的统称） [参见此问题](https://github.com/nestjs/graphql/issues/320#issuecomment-511193229) ：它们仅针对顶层的 `@Query()`/`@Mutation()` 方法运行。您可以通过在 `GqlModuleOptions` 中设置 `fieldResolverEnhancers` 选项，让 Nest 为带有 `@ResolveField()` 注解的方法执行拦截器、守卫或过滤器。根据需要传入包含 `'interceptors'`、`'guards'` 和/或 `'filters'` 的列表：

```typescript
GraphQLModule.forRoot({
  fieldResolverEnhancers: ['interceptors']
}),
```

:::warning 警告
为字段解析器启用增强器可能导致性能问题，特别是当您返回大量记录且字段解析器被执行数千次时。因此，当启用 `fieldResolverEnhancers` 时，建议跳过对字段解析器非严格必需的增强器执行。您可以使用以下辅助函数实现：
:::



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

#### 创建自定义驱动

Nest 提供了两个开箱即用的官方驱动：`@nestjs/apollo` 和 `@nestjs/mercurius`，同时还提供了允许开发者构建新的**自定义驱动**的 API。通过自定义驱动，您可以集成任何 GraphQL 库或扩展现有集成，在其基础上添加额外功能。

例如，要集成 `express-graphql` 包，您可以创建以下驱动类：

```typescript
import { AbstractGraphQLDriver, GqlModuleOptions } from '@nestjs/graphql';
import { graphqlHTTP } from 'express-graphql';

class ExpressGraphQLDriver extends AbstractGraphQLDriver {
  async start(options: GqlModuleOptions<any>): Promise<void> {
    options = await this.graphQlFactory.mergeWithSchema(options);

    const { httpAdapter } = this.httpAdapterHost;
    httpAdapter.use(
      '/graphql',
      graphqlHTTP({
        schema: options.schema,
        graphiql: true,
      })
    );
  }

  async stop() {}
}
```

并按如下方式使用：

```typescript
GraphQLModule.forRoot({
  driver: ExpressGraphQLDriver,
});
```
