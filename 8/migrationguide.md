### 迁移指南

本文提供了一套从 v6 迁移到最新 v7 版本的指导。

#### 自定义路由参数装饰器

已经对所有类型的应用程序的 [自定义装饰器](/customdecorators) API 做了统一，现在无论您创建的是 `GraphQL` 应用程序还是 `RestAPI` 应用程序，`执行上下文(ExecutionContext)`（[阅读更多](/fundamentals/execution-context)）都会作为第二个参数传递到 `createParamDecorator()` 函数

```typescript
// Before
import { createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((data, req) => {
  return req.user;
});

// After
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

#### 微服务

为了避免代码重复，`MicroserviceOptions` 接口(Interface)已从 `@nestjs/common` 包中删除。因此，现在在创建微服务（通过 `createMicroservice()` 或 `connectMicroservice()` 方法）时，应该传递泛型类型参数以自动完成代码获取。

```typescript
// Before
const app = await NestFactory.createMicroservice(AppModule);

// After
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule);
```

> 提示：`MicroserviceOptions` 接口(Interface)是从 `@nestjs/microservices` 包导出的。

#### GraphQL

在NestJS第6版的主要版本中，我们引入了 ***代码优先*** 的方法，作为 `type-graphql` 包和 `@nestjs/graphql` 模块之间的兼容层。最终，由于缺乏灵活性，我们的团队决定从头开始重新实现所有功能。为了避免大量断层更改，公开API是向后兼容的，可能类似于 `type-graphql`。

迁移现有的应用程序，只需将所有从 `type-graphql` 导入的改为从 `@nestjs/graphql` 导入即可。

#### HTTP exceptions body

以前，为`HttpException` 类以及从 `HttpException` 派生的其他类生成的响应体不一致（例如，`BadRequestException` 或 `NotFoundException`）。在最新的主要版本中，这些异常响应将采用相同的结构。


```typescript
/*
 * Sample outputs for "throw new ForbiddenException('Forbidden resource')"
 */

// Before
{
  "statusCode": 403,
  "message": "Forbidden resource"
}

// After
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

#### Validation errors schema

在过去的版本中，`ValidationPipe` 抛出一个由 `class-validator` 包返回的 `ValidationError` 对象数组。现在，`ValidationPipe` 将错误映射到表示错误消息的纯字符串列表。

```typescript
// Before
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    {
      "target": {},
      "property": "email",
      "children": [],
      "constraints": {
        "isEmail": "email must be an email"
      }
    }
  ]
}

// After
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

如果你喜欢以前的方式，你可以通过设置 `exceptionFactory` 函数来还原：

```typescript
new ValidationPipe({
  exceptionFactory: errors => new BadRequestException(errors),
});
```

#### 类型隐式转换 (`ValidationPipe`)

如果启用了自动转换选项(`transform: true`)，那么`ValidationPipe` 现在将会执行基于元类型的转换。在下面的示例中，`findOne` 方法接受一个表示提取 `id` 路径参数的参数：

```typescript
@Get(':id')
findOne(@Param('id') id: number) {
  console.log(typeof id === 'number'); // true
  return 'This action returns a user';
}
```

默认情况下，每个路径参数和查询参数都是以 `string` 类型在网络传输。在上面的示例中，我们将 `id` 的类型指定为 `number`类型，因此，`ValidationPipe` 会自动尝试将标识符 `id` 的值从 `sting` 类型转为 `number` 类型。

#### 微服务通道（双向通信）

为了启用 `请求-响应` 消息类型， `Nest` 创建了两个逻辑通道 - 一个是负责数据传输，另一个是负责等待传入的响应。对于一些底层传输，例如 `NATS` 这种 `双通道` 是支持的，开箱即用。对于其他的，`Nest` 通过手动创建单独的通道来进行支持。

假设我们有一个消息处理器 `@MessagePattern('getUsers')`。在过去， `Nest` 根据这种模式会创建两个通道：`getUsers_ack` （用于请求）和`getUsers_res` （用于响应）。现在，`Nest 7`中这种命名方案将会更改。将会更改为 `getUsers`（用于请求）和 `getUsers.reply`（用于响应）。同样，对于 `MQTT` 的传输策略，响应通过将会是 `getUsers/reply`（以避免与主题通配符冲突）。

#### 弃用

所有的弃用的（从Nest version 5到version 6）最终都被删除了（例如，弃用了的`@reflectmetada` decorator）。

#### Node.js

这个版本不再对Node v8的支持。我们强烈建议使用最新的LTS版本。


 ### 译者署名

| 用户名 | 头像 | 职能 | 签名 |
|---|---|---|---|
| [@zuohuadong](https://www.zhihu.com/people/dongcang)  | <img class="avatar-66 rm-style" src="https://pic.downk.cc/item/5f4cafe7160a154a67c4047b.jpg">  |  翻译  | 专注于 caddy 和 nest，[@zuohuadong](https://github.com/zuohuadong/) at Github  |
| [@Drixn](https://drixn.com/)  | <img class="avatar-66 rm-style" src="https://cdn.drixn.com/img/src/avatar1.png">  |  翻译  | 专注于 nginx 和 C++，[@Drixn](https://drixn.com/) |
| [@Armor](https://github.com/Armor-cn)  | <img class="avatar-66 rm-style" height="70" src="https://avatars3.githubusercontent.com/u/31821714?s=460&v=4">  |  翻译  | 专注于 Java 和 Nest，[@Armor](https://armor.ac.cn/) | 
