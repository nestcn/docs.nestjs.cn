<!-- 此文件从 content/microservices/exception-filters.md 自动生成，请勿直接修改此文件 -->
<!-- 生成时间: 2026-03-14T04:55:52.200Z -->
<!-- 源文件: content/microservices/exception-filters.md -->

### 异常过滤器

HTTP 层和微服务层之间唯一的区别是，你应该使用 __INLINE_CODE_6__ 而不是抛出 __INLINE_CODE_5__。

```bash
$ npm i --save nats

```

> info **提示** __INLINE_CODE_7__ 类来自 __INLINE_CODE_8__ 包。

Nest 将处理抛出的异常，并返回具有以下结构的 __INLINE_CODE_9__ 对象：

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
  },
});

```

#### 过滤器

微服务异常过滤器与 HTTP 异常过滤器类似，但有一点小区别。__INLINE_CODE_10__ 方法必须返回 __INLINE_CODE_11__。

```typescript
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MATH_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        }
      },
    ]),
  ]
  ...
})

```

> warning **警告** 当使用 __LINK_16__ 时，全球微服务异常过滤器默认不被启用。

以下示例使用了手动实例化的方法作用域过滤器。与 HTTP 基于应用程序一样，你也可以使用控制器作用域过滤器（即将控制器类前缀为 __INLINE_CODE_12__ 装饰器）。

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: {
    servers: ['nats://localhost:4222'],
    queue: 'cats_queue',
  },
});

```

#### 继承

通常，您将创建完全定制的异常过滤器，以满足您的应用程序需求。然而，有些情况下，您可能想简单地扩展 **core exception filter**，并根据某些因素 override 行为。

要将异常处理委派给基本过滤器，您需要扩展 __INLINE_CODE_13__ 并调用继承的 __INLINE_CODE_14__ 方法。

```typescript
@MessagePattern('notifications')
getNotifications(@Payload() data: number[], @Ctx() context: NatsContext) {
  console.log(`Subject: ${context.getSubject()}`);
}

```

上述实现只是 demonstrate 方法的 shell。您的扩展异常过滤器实现将包括您 tailored 的 **业务逻辑**（例如，处理各种条件）。

```typescript
title="Exception Filters"

```